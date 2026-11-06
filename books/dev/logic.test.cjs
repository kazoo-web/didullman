// Unit tests for ranking and backend logic. Run: node --test books/dev/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
// Load ranking.js as the browser does (a classic script setting window.Ranking).
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'ranking.js'), 'utf8'), sandbox);
// Copy results out of the sandbox so deepStrictEqual compares plain values.
const plain = (x) => JSON.parse(JSON.stringify(x));
const R = Object.fromEntries(Object.entries(sandbox.Ranking).map(([k, f]) => [k, (...a) => plain(f(...a))]));
const { createBackend } = require('./gas-harness.cjs');

const ALL = ['vuong', 'taddeo', 'szalay', 'saunders', 'beatty', 'ferrante', 'butler'];

// Build a full round robin where `beats(a, b)` says whether a beat b.
function roundRobin(ids, beats) {
  return R.allPairs(ids).map(([a, b]) => {
    const w = beats(a, b) ? a : b;
    return { book_a: a, book_b: b, winner: w, position: w === a ? 'left' : 'right' };
  });
}
const byOrder = (order) => (a, b) => order.indexOf(a) < order.indexOf(b);
const ranks = (r) => r.map((x) => `${x.id}:${x.rank}${x.tied ? '*' : ''}`);

test('pairs: n*(n-1)/2, 21 at most', () => {
  assert.equal(R.allPairs(ALL).length, 21);
  assert.equal(R.allPairs(['a', 'b']).length, 1);
});

test('matchup order covers every pair once and randomizes sides', () => {
  const order = R.matchupOrder(ALL);
  assert.equal(order.length, 21);
  const keys = new Set(order.map((m) => [m.left, m.right].sort().join('|')));
  assert.equal(keys.size, 21);
  let lefts = 0;
  for (let i = 0; i < 200; i++) lefts += R.matchupOrder(['vuong', 'taddeo'])[0].left === 'vuong' ? 1 : 0;
  assert.ok(lefts > 60 && lefts < 140, 'left/right should be roughly 50/50, got ' + lefts);
});

test('personal: strict order', () => {
  const order = ['butler', 'ferrante', 'vuong', 'taddeo'];
  const r = R.personalRanking(['vuong', 'taddeo', 'ferrante', 'butler'], roundRobin(order, byOrder(order)));
  assert.deepEqual(ranks(r), ['butler:1', 'ferrante:2', 'vuong:3', 'taddeo:4']);
});

test('personal: two-way tie broken head to head', () => {
  // 4 books. a beats b, b beats c, c beats a (cycle) would be 3-way; instead:
  // a:2 (beats b, d), b:2 (beats c, d), c:1 (beats a), d:1? -> d must beat someone.
  // Use explicit choices: a>b, a>d, b>c, b>d, c>a, d>c  => a2 b2 c1 d1
  const choices = [
    ['a', 'b', 'a'], ['a', 'd', 'a'], ['b', 'c', 'b'], ['b', 'd', 'b'], ['c', 'a', 'c'], ['d', 'c', 'd']
  ].map(([x, y, w]) => ({ book_a: x, book_b: y, winner: w }));
  const r = R.personalRanking(['a', 'b', 'c', 'd'], choices);
  assert.deepEqual(ranks(r), ['a:1', 'b:2', 'd:3', 'c:4']);
});

test('personal: two-way tie where the second-listed book won head to head', () => {
  const choices = [
    ['a', 'b', 'b'], ['a', 'c', 'a'], ['a', 'd', 'a'], ['b', 'c', 'c'], ['b', 'd', 'b'], ['c', 'd', 'd']
  ].map(([x, y, w]) => ({ book_a: x, book_b: y, winner: w })); // a2 b2 c1 d1; b beat a, d beat c
  const r = R.personalRanking(['a', 'b', 'c', 'd'], choices);
  assert.deepEqual(ranks(r), ['b:1', 'a:2', 'd:3', 'c:4']);
});

test('personal: three-way cycle stays tied', () => {
  const choices = [['a', 'b', 'a'], ['b', 'c', 'b'], ['a', 'c', 'c']]
    .map(([x, y, w]) => ({ book_a: x, book_b: y, winner: w }));
  const r = R.personalRanking(['a', 'b', 'c'], choices);
  assert.deepEqual(r.map((x) => [x.rank, x.tied]), [[1, true], [1, true], [1, true]]);
});

test('personal: tie below first place keeps later ranks numbered by position', () => {
  // e beats all; a,b,c cycle; all beat d  => e4, a2 b2 c2, d0  => 1, 2*,2*,2*, 5
  const ids = ['a', 'b', 'c', 'd', 'e'];
  const cyc = { 'a|b': 'a', 'b|c': 'b', 'a|c': 'c' };
  const choices = R.allPairs(ids).map(([x, y]) => {
    let w;
    if (x === 'e' || y === 'e') w = 'e';
    else if (x === 'd' || y === 'd') w = x === 'd' ? y : x;
    else w = cyc[[x, y].sort().join('|')];
    return { book_a: x, book_b: y, winner: w };
  });
  assert.deepEqual(ranks(R.personalRanking(ids, choices)), ['e:1', 'a:2*', 'b:2*', 'c:2*', 'd:5']);
});

test('Code.gs personalRanking matches ranking.js', () => {
  const be = createBackend();
  for (let t = 0; t < 300; t++) {
    const n = 2 + Math.floor(Math.random() * 6);
    const ids = ALL.slice(0, n);
    const choices = R.allPairs(ids).map(([a, b]) => ({ book_a: a, book_b: b, winner: Math.random() < 0.5 ? a : b }));
    assert.deepEqual(JSON.parse(JSON.stringify(be.ctx.personalRanking(ids, choices))), R.personalRanking(ids, choices));
  }
});

test('close call: both played and level on wins', () => {
  const c = [{ book_a: 'a', book_b: 'b', winner: 'a' }, { book_a: 'c', book_b: 'd', winner: 'c' }];
  assert.equal(R.isCloseCall('a', 'c', c), true);
  assert.equal(R.isCloseCall('a', 'b', c), false);
  assert.equal(R.isCloseCall('a', 'e', c), false);
});

// ---------- backend ----------

function ballot(email, ids, order) {
  return {
    email, books_read: ids,
    choices: roundRobin(ids, byOrder(order || ids))
  };
}

test('check: false, then true after a vote; normalizes email', () => {
  const be = createBackend();
  assert.deepEqual(be.get({ action: 'check', email: 'Ann@Example.com ' }), { exists: false });
  assert.deepEqual(be.post(ballot('ann@example.com', ['vuong', 'taddeo'])), { ok: true });
  assert.deepEqual(be.get({ action: 'check', email: '  ANN@example.com' }), { exists: true });
});

test('post: refuses repeat email', () => {
  const be = createBackend();
  be.post(ballot('a@x.co', ['vuong', 'taddeo']));
  assert.deepEqual(be.post(ballot('A@X.co', ['vuong', 'butler'])), { ok: false, error: 'already_voted' });
  assert.equal(be.sheets.Responses.rows.length, 2); // header + 1
});

test('post: writes both tabs in the specified shape', () => {
  const be = createBackend();
  be.post(ballot('a@x.co', ['butler', 'vuong', 'ferrante'], ['ferrante', 'butler', 'vuong']));
  const resp = be.sheets.Responses.rows;
  assert.deepEqual(resp[0], ['timestamp', 'email', 'books_read', 'personal_ranking']);
  assert.ok(resp[1][0] instanceof Date);
  assert.equal(resp[1][1], 'a@x.co');
  assert.deepEqual(JSON.parse(resp[1][2]), ['vuong', 'ferrante', 'butler']); // month order
  assert.deepEqual(JSON.parse(resp[1][3]).map((x) => x.id), ['ferrante', 'butler', 'vuong']);
  const m = be.sheets.Matchups.rows;
  assert.deepEqual(m[0], ['timestamp', 'email', 'book_a', 'book_b', 'winner', 'position']);
  assert.equal(m.length, 4);
  m.slice(1).forEach((r) => assert.equal(r[5], r[4] === r[2] ? 'left' : 'right'));
});

test('post: validation rejects bad payloads', () => {
  const be = createBackend();
  const good = ballot('a@x.co', ['vuong', 'taddeo', 'butler']);
  const cases = {
    bad_json: '{nope',
    invalid_email: { ...good, email: 'nope' },
    too_few_books: { ...good, books_read: ['vuong'] },
    bad_books: { ...good, books_read: ['vuong', 'taddeo', 'dune'] },
    bad_choices: { ...good, choices: good.choices.slice(1) }
  };
  for (const [err, body] of Object.entries(cases)) assert.equal(be.post(body).error, err, err);
  const dup = { ...good, choices: [good.choices[0], good.choices[0], good.choices[2]] };
  assert.equal(be.post(dup).error, 'bad_choices');
  const wrongPos = { ...good, choices: good.choices.map((c, i) => (i ? c : { ...c, position: c.position === 'left' ? 'right' : 'left' })) };
  assert.equal(be.post(wrongPos).error, 'bad_choices');
  const outsider = { ...good, choices: good.choices.map((c, i) => (i ? c : { ...c, book_b: 'szalay' })) };
  assert.equal(be.post(outsider).error, 'bad_choices');
  assert.equal(be.sheets.Responses, undefined, 'nothing written');
});

test('post: email that looks like a formula is stored as text', () => {
  const be = createBackend();
  assert.deepEqual(be.post(ballot('=cmd@x.co', ['vuong', 'taddeo'])), { ok: true });
  assert.equal(be.sheets.Responses.rows[1][1], '=cmd@x.co');
  assert.deepEqual(be.get({ action: 'check', email: '=cmd@x.co' }), { exists: true });
});

test('post: second submission while locked is turned away', () => {
  const be = createBackend();
  const lock = be.ctx.LockService.getScriptLock();
  lock.waitLock();
  assert.deepEqual(be.post(ballot('a@x.co', ['vuong', 'taddeo'])), { ok: false, error: 'busy' });
  lock.releaseLock();
  assert.deepEqual(be.post(ballot('a@x.co', ['vuong', 'taddeo'])), { ok: true });
});

test('results: pooled win rate, readers, #1 counts, unranked under 3 readers, no emails', () => {
  const be = createBackend();
  // 3 people read vuong, taddeo, butler; 1 also read ferrante; szalay read by 2.
  be.post(ballot('p1@x.co', ['vuong', 'taddeo', 'butler'], ['butler', 'vuong', 'taddeo']));
  be.post(ballot('p2@x.co', ['vuong', 'taddeo', 'butler', 'szalay'], ['vuong', 'butler', 'szalay', 'taddeo']));
  // p3: three-way cycle -> all three tied at #1
  be.post({
    email: 'p3@x.co', books_read: ['vuong', 'taddeo', 'butler', 'ferrante', 'szalay'],
    choices: [
      ['vuong', 'taddeo', 'vuong'], ['taddeo', 'butler', 'taddeo'], ['vuong', 'butler', 'butler'],
      ['vuong', 'ferrante', 'vuong'], ['taddeo', 'ferrante', 'taddeo'], ['butler', 'ferrante', 'butler'],
      ['vuong', 'szalay', 'vuong'], ['taddeo', 'szalay', 'taddeo'], ['butler', 'szalay', 'butler'],
      ['ferrante', 'szalay', 'ferrante']
    ].map(([a, b, w]) => ({ book_a: a, book_b: b, winner: w, position: w === a ? 'left' : 'right' }))
  });
  const g = be.get({ action: 'results' });
  assert.equal(JSON.stringify(g).includes('@'), false, 'no emails in results');
  assert.equal(g.respondents, 3);
  const s = Object.fromEntries(g.ranked.map((x) => [x.id, x]));
  assert.deepEqual(Object.keys(s).sort(), ['butler', 'taddeo', 'vuong']);
  // butler: p1 2/2, p2 2/3, p3 3/4 => 7/9
  assert.equal(s.butler.wins, 7); assert.equal(s.butler.matchups, 9);
  // vuong: p1 1/2, p2 3/3, p3 3/4 => 7/9 (ties butler)
  assert.equal(s.vuong.wins, 7); assert.equal(s.vuong.matchups, 9);
  assert.equal(s.vuong.rank, s.butler.rank);
  assert.equal(s.taddeo.rank, 3);
  assert.equal(s.vuong.readers, 3);
  // #1: p1 butler; p2 vuong; p3 vuong+taddeo+butler tied
  assert.equal(s.butler.firstPlace, 2); assert.equal(s.vuong.firstPlace, 2); assert.equal(s.taddeo.firstPlace, 1);
  const un = Object.fromEntries(g.unranked.map((x) => [x.id, x.readers]));
  assert.deepEqual(un, { szalay: 2, saunders: 0, beatty: 0, ferrante: 1 });
  assert.equal(g.unranked[0].wins, undefined, 'unranked books expose reader count only');
});

test('get: unknown action and bad email', () => {
  const be = createBackend();
  assert.deepEqual(be.get({}), { error: 'unknown_action' });
  assert.deepEqual(be.get({ action: 'check', email: 'x' }), { error: 'invalid_email' });
});
