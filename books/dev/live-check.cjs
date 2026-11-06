// End-to-end check against the REAL deployed Apps Script web app.
//   node books/dev/live-check.cjs https://script.google.com/macros/s/.../exec
// Runs the poll in a phone-sized browser and submits one test ballot from
// poll-test-<time>@example.invalid. Delete that row from both tabs afterwards.
'use strict';
const assert = require('node:assert/strict');
const { chromium, devices } = require('playwright');

const api = process.argv[2];
if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(api || '')) {
  console.error('Usage: node books/dev/live-check.cjs <web app URL ending in /exec>');
  process.exit(2);
}
process.env.LIVE_API = api;
process.env.SITE_PORT = process.env.SITE_PORT || '8090';
process.env.EXEC_PORT = process.env.EXEC_PORT || '8091';
process.env.ECHO_PORT = process.env.ECHO_PORT || '8092';
const { start } = require('./server.cjs');

(async () => {
  const srv = await start();
  const browser = await chromium.launch();
  const email = `poll-test-${Date.now()}@example.invalid`;
  try {
    const page = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage();
    const errors = [];
    const preflights = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('request', (r) => { if (r.method() === 'OPTIONS') preflights.push(r.url()); });

    await page.goto(`http://localhost:${process.env.SITE_PORT}/books/`);
    await page.fill('#email', email);
    await page.click('#start');
    await page.waitForSelector('.tile', { timeout: 30000 });
    console.log('check: ok (new email accepted)');
    for (const id of ['vuong', 'taddeo', 'butler']) await page.click(`.tile[data-id="${id}"]`);
    await page.click('#next');
    for (let i = 0; i < 3; i++) {
      await page.waitForFunction((n) => new RegExp(`${n} of 3`).test(document.querySelector('.prog')?.textContent || ''), i + 1);
      await page.click('.pick[data-side="left"]');
    }
    await page.waitForSelector('.plate', { timeout: 30000 });
    console.log('submit: ok');
    await page.waitForSelector('.ix, .group .notice', { timeout: 30000 });
    const groupText = await page.textContent('#group');
    assert.ok(!/Couldn’t load/.test(groupText), 'group results loaded');
    assert.ok(!groupText.includes('@'), 'no emails in group results');
    console.log('results: ok');

    // Same email again is refused at the check.
    const p2 = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage();
    await p2.goto(`http://localhost:${process.env.SITE_PORT}/books/`);
    await p2.fill('#email', email);
    await p2.click('#start');
    await p2.waitForSelector('text=You’ve already voted', { timeout: 30000 });
    console.log('duplicate check: ok');

    assert.deepEqual(preflights, [], 'no CORS preflight requests');
    assert.deepEqual(errors, [], 'no browser errors');
    console.log(`LIVE CHECK PASSED. Delete the rows for ${email} from both tabs.`);
  } finally {
    await browser.close();
    await srv.close();
  }
})().catch((e) => { console.error('LIVE CHECK FAILED:', e.message); process.exit(1); });
