#!/usr/bin/env node
// Renders each demo in a headless Chromium over the DevTools Protocol and asserts
// layout facts static checks cannot see: horizontal overflow, elements that ignore
// `hidden`, and real console errors. Skips with a notice when no browser is installed.
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const demosRoot = join(root, 'demos');
// The four widths the demo acceptance criteria call for.
const WIDTHS = [375, 768, 1280, 1920];

const MEASURE = `(function () {
  var findings = [];
  var contentWidth = Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0);
  if (contentWidth > window.innerWidth + 1) {
    findings.push('horizontal overflow: content is ' + contentWidth + 'px wide in a ' + window.innerWidth + 'px viewport');
  }
  Array.prototype.forEach.call(document.querySelectorAll('[hidden]'), function (el) {
    if (el.getClientRects().length) {
      findings.push('element keeps rendering despite the hidden attribute: ' +
        (el.id ? '#' + el.id : el.tagName.toLowerCase()));
    }
  });
  // Content clipped inside an overflow:hidden box never produces page overflow, so check it directly.
  Array.prototype.forEach.call(document.querySelectorAll('body *'), function (el) {
    var style = getComputedStyle(el);
    if (style.overflowX !== 'hidden' || !el.getClientRects().length) return;
    // Screen-reader-only boxes are clipped on purpose and are only a pixel wide.
    if (el.clientWidth < 12) return;
    if (el.scrollWidth > el.clientWidth + 1) {
      findings.push('content clipped by an overflow:hidden box: ' +
        (el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).trim().split(/\s+/)[0] : '')) +
        ' (' + el.scrollWidth + 'px of content in ' + el.clientWidth + 'px)');
    }
  });
  return JSON.stringify(findings);
})()`;

function findBrowser() {
  if (process.env.CHROMIUM_BIN && existsSync(process.env.CHROMIUM_BIN)) return process.env.CHROMIUM_BIN;
  const candidates = [
    `${process.env['ProgramFiles(x86)']}\\Microsoft\\Edge\\Application\\msedge.exe`,
    `${process.env.ProgramFiles}\\Microsoft\\Edge\\Application\\msedge.exe`,
    `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`,
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/microsoft-edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  return candidates.find((path) => path && !path.includes('undefined') && existsSync(path)) || null;
}

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return extname(entry.name).toLowerCase() === '.html' ? [path] : [];
  });
}

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

async function readDevToolsPort(profileDir) {
  const portFile = join(profileDir, 'DevToolsActivePort');
  for (let attempt = 0; attempt < 120; attempt++) {
    if (existsSync(portFile)) {
      const line = readFileSync(portFile, 'utf8').split('\n')[0].trim();
      if (line) return Number(line);
    }
    await wait(100);
  }
  throw new Error('browser did not expose a DevTools port');
}

/** Minimal DevTools Protocol client over the runtime's built-in WebSocket. */
async function connect(wsUrl) {
  const socket = new WebSocket(wsUrl);
  await new Promise((done, fail) => {
    socket.addEventListener('open', done, { once: true });
    socket.addEventListener('error', () => fail(new Error('DevTools socket failed')), { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  const events = [];
  socket.addEventListener('message', (message) => {
    const payload = JSON.parse(message.data);
    if (payload.id && pending.has(payload.id)) {
      pending.get(payload.id)(payload);
      pending.delete(payload.id);
    } else if (payload.method) {
      events.push(payload);
    }
  });

  const send = (method, params = {}) => {
    const id = ++nextId;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((done) => pending.set(id, done));
  };

  const waitForEvent = async (method, timeoutMs = 15000) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const hit = events.findIndex((event) => event.method === method);
      if (hit !== -1) return events.splice(hit, 1)[0];
      await wait(50);
    }
    return null;
  };

  return { send, events, waitForEvent, close: () => socket.close() };
}

function consoleErrors(events) {
  return events.flatMap((event) => {
    if (event.method === 'Runtime.exceptionThrown') {
      const detail = event.params.exceptionDetails;
      return [`uncaught exception: ${detail.exception?.description || detail.text}`];
    }
    if (event.method === 'Runtime.consoleAPICalled' && event.params.type === 'error') {
      return [`console error: ${event.params.args.map((arg) => arg.value ?? arg.description).join(' ')}`];
    }
    if (event.method === 'Log.entryAdded' && event.params.entry.level === 'error') {
      return [`console error: ${event.params.entry.text}`];
    }
    return [];
  });
}

async function probeAll(browserPath, targets) {
  const profile = mkdtempSync(join(tmpdir(), 'hls-render-'));
  const child = spawn(browserPath, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--disable-extensions', '--allow-file-access-from-files',
    `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank',
  ], { stdio: 'ignore' });

  const results = [];
  let client;
  try {
    const port = await readDevToolsPort(profile);
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const page = list.find((entry) => entry.type === 'page');
    if (!page) throw new Error('no page target available');

    client = await connect(page.webSocketDebuggerUrl);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Log.enable');

    for (const { label, url } of targets) {
      for (const width of WIDTHS) {
        await client.send('Emulation.setDeviceMetricsOverride', {
          width, height: 900, deviceScaleFactor: 1, mobile: false,
        });
        client.events.length = 0;
        await client.send('Page.navigate', { url });
        await client.waitForEvent('Page.loadEventFired');
        await wait(600);

        const evaluated = await client.send('Runtime.evaluate', { expression: MEASURE, returnByValue: true });
        const value = evaluated.result?.result?.value;
        const findings = value ? JSON.parse(value) : ['probe returned no measurement'];
        consoleErrors(client.events).forEach((error) => findings.push(error));
        results.push({ label, width, findings });
      }
    }
  } finally {
    if (client) client.close();
    child.kill();
    await wait(300);
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch {
      /* the OS reclaims the temp profile */
    }
  }
  return results;
}

const browser = findBrowser();
if (!browser) {
  console.log('Render check skipped: no Chromium-based browser found. Set CHROMIUM_BIN to enable it.');
  process.exit(0);
}

if (process.argv.includes('--self-test')) {
  // A check that cannot fail is worthless, so prove the probe reports known defects.
  const dir = mkdtempSync(join(tmpdir(), 'hls-render-fixture-'));
  const broken = join(dir, 'broken.html');
  writeFileSync(broken, `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width"><title>broken</title>
<style>.banner{display:flex}.clip{width:120px;overflow:hidden;white-space:nowrap}</style></head>
<body><main><p class="banner" id="ghost" hidden>still here</p>
<div id="clipped" class="clip">this label is far too long to fit inside its clipped box</div>
<div id="wide" style="width:1200px">overflowing</div>
<script>console.error('boom');</script></main></body></html>`);

  const [first] = await probeAll(browser, [{ label: 'fixture', url: pathToFileURL(broken).href }]);
  rmSync(dir, { recursive: true, force: true });
  first.findings.forEach((finding) => console.log(`- ${finding}`));

  const missed = ['horizontal overflow', 'hidden attribute', 'console error', 'clipped by an overflow']
    .filter((needle) => !first.findings.some((finding) => finding.includes(needle)));
  if (missed.length) {
    console.error(`Render self-test failed: probe missed ${missed.join(', ')}.`);
    process.exit(1);
  }
  console.log('Render self-test passed: probe detects overflow, clipping, inert hidden elements, and console errors.');
  process.exit(0);
}

if (!existsSync(demosRoot)) {
  console.log('Render check skipped: demos/ does not exist yet.');
  process.exit(0);
}

const targets = htmlFiles(demosRoot).map((file) => ({
  label: relative(root, file).replaceAll('\\', '/'),
  url: pathToFileURL(file).href,
}));

const results = await probeAll(browser, targets);
const failures = results.flatMap(({ label, width, findings }) =>
  findings.map((finding) => `${label} @ ${width}px: ${finding}`));

for (const label of new Set(results.map((result) => result.label))) {
  console.log(`Rendered ${label} at ${WIDTHS.join(', ')} px`);
}

if (failures.length) {
  console.error(`\nRender check failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Render check passed: no overflow, no inert hidden elements, no console errors.');
