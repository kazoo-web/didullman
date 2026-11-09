// Browser test of the full flow against the local stand-in backend.
//   node books/dev/e2e.cjs [screenshot-dir]
// Uses Playwright (not a dependency of the site; install it globally or run where it exists).
'use strict';
const assert = require('node:assert/strict');
const { chromium, devices } = require('playwright');
const { start } = require('./server.cjs');

const shots = process.argv[2];

(async () => {
  const srv = await start();
  const { backend, log, PORTS } = srv;
  const base = `http://localhost:${PORTS.site}/books/`;
  const browser = await chromium.launch();
  try {
    // Seed other voters so the group ranking has content.
    const seed = (email, ids) => {
      const choices = [];
      for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
        const w = Math.random() < 0.65 ? ids[i] : ids[j];
        choices.push({ book_a: ids[i], book_b: ids[j], winner: w, position: w === ids[i] ? 'left' : 'right' });
      }
      assert.deepEqual(backend.post({ email, books_read: ids, choices }), { ok: true });
    };
    seed('s1@x.co', ['ferrante', 'butler', 'vuong', 'taddeo', 'saunders']);
    seed('s2@x.co', ['butler', 'ferrante', 'taddeo', 'vuong', 'szalay']);
    seed('s3@x.co', ['ferrante', 'vuong', 'butler', 'saunders', 'taddeo']);

    const ctx = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const snap = async (name) => { await page.waitForTimeout(400); if (shots) await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true }); };

    await page.goto(base);
    await page.waitForSelector('#email');
    await snap('1-email');

    // Bad email is caught client side.
    await page.fill('#email', 'not-an-email');
    await page.click('#start');
    assert.match(await page.textContent('#err'), /doesn’t look like an email/);

    await page.fill('#email', '  Katherine@Example.COM ');
    await page.click('#start');
    await page.waitForSelector('.tile');

    // Continue is disabled until two are selected.
    assert.equal(await page.isDisabled('#next'), true);
    for (const id of ['vuong', 'saunders', 'ferrante', 'butler']) await page.click(`.tile[data-id="${id}"]`);
    await page.click('.tile[data-id="saunders"]'); // toggle off
    await page.click('.tile[data-id="saunders"]'); // and back on
    assert.equal(await page.textContent('#count'), '4 books · 6 matchups');
    await snap('2-books');
    await page.click('#next');

    // Matchups: 6 pairs, with undo.
    await page.waitForSelector('.pick');
    assert.match(await page.textContent('.prog'), /1 of 6/);
    await snap('3-matchup');
    // Covers keep their 2:3 shape.
    const ratios = await page.$$eval('.pick img', (els) => els.map((e) => e.getBoundingClientRect().height / e.getBoundingClientRect().width));
    ratios.forEach((r) => assert.ok(Math.abs(r - 1.5) < 0.02, 'cover ratio ' + r));
    await page.click('.pick[data-side="left"]');
    await page.waitForFunction(() => /2 of 6/.test(document.querySelector('.prog')?.textContent || ''));
    await page.click('#undo');
    await page.waitForFunction(() => /1 of 6/.test(document.querySelector('.prog')?.textContent || ''));

    // Reload mid-poll resumes where we were.
    await page.click('.pick[data-side="right"]');
    await page.waitForFunction(() => /2 of 6/.test(document.querySelector('.prog')?.textContent || ''));
    await page.reload();
    await page.waitForFunction(() => /2 of 6/.test(document.querySelector('.prog')?.textContent || ''));

    const seenPairs = new Set();
    for (let i = 1; i < 6; i++) {
      await page.waitForFunction((n) => new RegExp(`${n} of 6`).test(document.querySelector('.prog')?.textContent || ''), i + 1);
      const names = await page.$$eval('.pick .t', (els) => els.map((e) => e.textContent));
      seenPairs.add(names.slice().sort().join('|'));
      await page.click(`.pick[data-side="${i % 2 ? 'left' : 'right'}"]`);
    }
    assert.equal(seenPairs.size, 5);

    // Results.
    await page.waitForSelector('.plate');
    await page.waitForSelector('.ix');
    await page.waitForTimeout(800);
    await snap('4-results');
    const resp = backend.sheets.Responses.rows;
    const mine = resp.find((r) => r[1] === 'katherine@example.com');
    assert.ok(mine, 'response row written with normalized email');
    assert.deepEqual(JSON.parse(mine[2]), ['vuong', 'saunders', 'ferrante', 'butler']);
    const myMatchups = backend.sheets.Matchups.rows.filter((r) => r[1] === 'katherine@example.com');
    assert.equal(myMatchups.length, 6);
    const groupText = await page.textContent('#group');
    assert.match(groupText, /Four people have voted so far/);
    assert.match(groupText, /Not enough readers yet/);
    assert.ok(!/@/.test(groupText));

    // Same email in a fresh browser is stopped at the check.
    const ctx2 = await browser.newContext({ ...devices['iPhone 13'] });
    const p2 = await ctx2.newPage();
    await p2.goto(base);
    await p2.fill('#email', 'katherine@example.com');
    await p2.click('#start');
    await p2.waitForSelector('text=You’ve already voted');
    await p2.waitForTimeout(400); if (shots) await p2.screenshot({ path: `${shots}/5-already-voted.png`, fullPage: true });
    await p2.click('text=See the group ranking');
    await p2.waitForSelector('.ix');
    await p2.waitForTimeout(400); if (shots) await p2.screenshot({ path: `${shots}/6-group-only.png`, fullPage: true });

    // Network: no preflights, POST sent as text/plain, all calls followed the redirect.
    assert.equal(log.filter((l) => l.method === 'OPTIONS').length, 0, 'no CORS preflight');
    const posts = log.filter((l) => l.method === 'POST');
    assert.equal(posts.length, 1);
    assert.match(posts[0].contentType, /^text\/plain/);
    assert.deepEqual(errors, []);

    // Narrowest phones: no horizontal scroll.
    const small = await browser.newContext({ viewport: { width: 320, height: 640 } });
    const p3 = await small.newPage();
    await p3.goto(base);
    await p3.fill('#email', 'small@example.com');
    await p3.click('#start');
    await p3.waitForSelector('.tile');
    const overflow = await p3.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.equal(overflow, 0, 'no horizontal scroll at 320px');

    console.log('E2E passed');
  } finally {
    await browser.close();
    await srv.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
