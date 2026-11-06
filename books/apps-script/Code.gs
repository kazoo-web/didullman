/**
 * Book club poll backend: Google Apps Script web app bound to a Google Sheet.
 * Setup steps are in DEPLOY.md, next to this file.
 *
 *   GET  ?action=check&email=...  -> {"exists": true|false}
 *   GET  ?action=results          -> group ranking only (never emails or individual responses)
 *   POST (text/plain JSON body)   -> validates, refuses repeat emails, writes both tabs
 */

// Must match the ids in ../app.js.
var BOOKS = ['vuong', 'taddeo', 'szalay', 'saunders', 'beatty', 'ferrante', 'butler'];
var MIN_READERS = 3;

var RESPONSES = 'Responses';
var MATCHUPS = 'Matchups';
var HEADERS = {
  Responses: ['timestamp', 'email', 'books_read', 'personal_ranking'],
  Matchups: ['timestamp', 'email', 'book_a', 'book_b', 'winner', 'position']
};

// ---------- HTTP ----------

function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.action === 'check') {
      var email = normalizeEmail(p.email);
      if (!isValidEmail(email)) return json({ error: 'invalid_email' });
      return json({ exists: emailExists(email) });
    }
    if (p.action === 'results') return json(groupResults());
    return json({ error: 'unknown_action' });
  } catch (err) {
    return json({ error: 'server_error' });
  }
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'bad_json' });
  }

  var checked = validateSubmission(data);
  if (checked.error) return json({ ok: false, error: checked.error });

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json({ ok: false, error: 'busy' });
  }
  try {
    if (emailExists(checked.email)) return json({ ok: false, error: 'already_voted' });

    var now = new Date();
    var ranking = personalRanking(checked.booksRead, checked.choices);
    sheet(RESPONSES).appendRow([
      now,
      safeCell(checked.email),
      JSON.stringify(checked.booksRead),
      JSON.stringify(ranking)
    ]);
    var rows = checked.choices.map(function (c) {
      return [now, safeCell(checked.email), c.book_a, c.book_b, c.winner, c.position];
    });
    var m = sheet(MATCHUPS);
    m.getRange(m.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    SpreadsheetApp.flush();
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: 'server_error' });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------- Validation ----------

function normalizeEmail(s) {
  return String(s == null ? '' : s).trim().toLowerCase();
}

function isValidEmail(s) {
  return s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/**
 * Returns {email, booksRead, choices} or {error}.
 * Choices must be exactly one per pair of the books read: no gaps, no repeats.
 * Each choice: book_a = book shown on the left, book_b = on the right,
 * winner = the one picked, position = 'left' or 'right' (where the winner was).
 */
function validateSubmission(d) {
  if (!d || typeof d !== 'object') return { error: 'bad_payload' };
  var email = normalizeEmail(d.email);
  if (!isValidEmail(email)) return { error: 'invalid_email' };

  var read = d.books_read;
  if (!Array.isArray(read) || read.length < 2) return { error: 'too_few_books' };
  var seen = {};
  for (var i = 0; i < read.length; i++) {
    if (BOOKS.indexOf(read[i]) === -1 || seen[read[i]]) return { error: 'bad_books' };
    seen[read[i]] = true;
  }
  // Store in the canonical (month) order.
  var booksRead = BOOKS.filter(function (b) { return seen[b]; });

  var choices = d.choices;
  var expected = booksRead.length * (booksRead.length - 1) / 2;
  if (!Array.isArray(choices) || choices.length !== expected) return { error: 'bad_choices' };
  var pairsSeen = {};
  var clean = [];
  for (var k = 0; k < choices.length; k++) {
    var c = choices[k] || {};
    var a = c.book_a, b = c.book_b, w = c.winner, pos = c.position;
    if (!seen[a] || !seen[b] || a === b) return { error: 'bad_choices' };
    if (w !== a && w !== b) return { error: 'bad_choices' };
    if (pos !== (w === a ? 'left' : 'right')) return { error: 'bad_choices' };
    var key = a < b ? a + '|' + b : b + '|' + a;
    if (pairsSeen[key]) return { error: 'bad_choices' };
    pairsSeen[key] = true;
    clean.push({ book_a: a, book_b: b, winner: w, position: pos });
  }
  return { email: email, booksRead: booksRead, choices: clean };
}

// Sheets turns strings starting with = + - @ into formulas; a leading
// apostrophe stores them as plain text (and isn't returned by getValues).
function safeCell(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

// ---------- Sheet access ----------

function sheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(HEADERS[name]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function dataRows(name) {
  var sh = sheet(name);
  var last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, HEADERS[name].length).getValues();
}

function emailExists(email) {
  var rows = dataRows(RESPONSES);
  for (var i = 0; i < rows.length; i++) {
    if (normalizeEmail(rows[i][1]) === email) return true;
  }
  return false;
}

/** Run once from the editor to create both tabs with headers (optional; they're also created on first use). */
function setup() {
  sheet(RESPONSES);
  sheet(MATCHUPS);
}

// ---------- Rankings ----------

/**
 * Same logic as personalRanking in ../ranking.js.
 * Ordered by wins; a two-way tie is broken head-to-head; three or more
 * books on the same wins share a rank (tied: true).
 */
function personalRanking(booksRead, choices) {
  var wins = {};
  booksRead.forEach(function (id) { wins[id] = 0; });
  var beat = {};
  choices.forEach(function (c) {
    wins[c.winner] = (wins[c.winner] || 0) + 1;
    var loser = c.winner === c.book_a ? c.book_b : c.book_a;
    beat[c.winner + '>' + loser] = true;
  });
  var byWins = {};
  booksRead.forEach(function (id) {
    (byWins[wins[id]] = byWins[wins[id]] || []).push(id);
  });
  var levels = Object.keys(byWins).map(Number).sort(function (a, b) { return b - a; });
  var out = [], pos = 1;
  levels.forEach(function (w) {
    var group = byWins[w];
    if (group.length === 1) {
      out.push({ id: group[0], wins: w, rank: pos, tied: false });
    } else if (group.length === 2) {
      var a = group[0], b = group[1];
      var first = beat[b + '>' + a] ? b : a;
      var second = first === a ? b : a;
      out.push({ id: first, wins: w, rank: pos, tied: false });
      out.push({ id: second, wins: w, rank: pos + 1, tied: false });
    } else {
      group.forEach(function (id) { out.push({ id: id, wins: w, rank: pos, tied: true }); });
    }
    pos += group.length;
  });
  return out;
}

/**
 * Group ranking: pooled win rate = total wins / total matchups the book appeared in.
 * Also reader count and how many people had it at #1 (shared #1s count for each book).
 * Books with fewer than MIN_READERS readers are returned separately, unranked.
 */
function groupResults() {
  var stats = {};
  BOOKS.forEach(function (id) {
    stats[id] = { id: id, wins: 0, matchups: 0, readers: 0, firstPlace: 0 };
  });

  var responses = dataRows(RESPONSES);
  responses.forEach(function (r) {
    var read = parseJson(r[2], []);
    read.forEach(function (id) { if (stats[id]) stats[id].readers++; });
    var ranking = parseJson(r[3], []);
    ranking.forEach(function (x) { if (x.rank === 1 && stats[x.id]) stats[x.id].firstPlace++; });
  });

  dataRows(MATCHUPS).forEach(function (r) {
    var a = r[2], b = r[3], w = r[4];
    if (stats[a]) stats[a].matchups++;
    if (stats[b]) stats[b].matchups++;
    if (stats[w]) stats[w].wins++;
  });

  var ranked = [], unranked = [];
  BOOKS.forEach(function (id) {
    var s = stats[id];
    if (s.readers >= MIN_READERS && s.matchups > 0) {
      s.winRate = s.wins / s.matchups;
      ranked.push(s);
    } else {
      unranked.push({ id: id, readers: s.readers });
    }
  });
  ranked.sort(function (x, y) { return y.winRate - x.winRate; });
  // Equal win rates share a rank (1, 2, 2, 4).
  ranked.forEach(function (s, i) {
    s.rank = (i > 0 && Math.abs(s.winRate - ranked[i - 1].winRate) < 1e-12) ? ranked[i - 1].rank : i + 1;
  });

  return { respondents: responses.length, minReaders: MIN_READERS, ranked: ranked, unranked: unranked };
}

function parseJson(s, fallback) {
  try { return JSON.parse(s); } catch (e) { return fallback; }
}
