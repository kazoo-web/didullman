(function () {
  'use strict';

  // Ids must match BOOKS in apps-script/Code.gs.
  var BOOKS = [
    { id: 'vuong', month: 'January', title: 'On Earth We’re Briefly Gorgeous', author: 'Ocean Vuong' },
    { id: 'taddeo', month: 'February', title: 'Three Women', author: 'Lisa Taddeo' },
    { id: 'szalay', month: 'March', title: 'Flesh', author: 'David Szalay' },
    { id: 'saunders', month: 'April', title: 'Vigil', author: 'George Saunders' },
    { id: 'beatty', month: 'May', title: 'Slumberland', author: 'Paul Beatty' },
    { id: 'ferrante', month: 'September', title: 'My Brilliant Friend', author: 'Elena Ferrante' },
    { id: 'butler', month: 'November', title: 'Wild Seed', author: 'Octavia E. Butler' }
  ];
  var BY_ID = {};
  BOOKS.forEach(function (b) { BY_ID[b.id] = b; });

  var STORE_KEY = 'bookpoll.v1';
  var cfg = window.BOOK_POLL_CONFIG || {};
  var R = window.Ranking;
  var app = document.getElementById('app');

  // ---------- state ----------
  // step: email | books | matchups | submit | results
  var state = load() || fresh();

  function fresh() {
    return { step: 'email', email: '', read: [], order: [], choices: [], ranking: null, submitted: false };
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE_KEY));
      return s && s.step ? s : null;
    } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable: carry on */ }
  }
  function go(step) { state.step = step; save(); render(); }

  // ---------- backend ----------
  function getJson(params) {
    var url = cfg.apiUrl + '?' + new URLSearchParams(params).toString();
    return fetch(url, { method: 'GET', redirect: 'follow' }).then(asJson);
  }
  function postJson(body) {
    // text/plain keeps this a "simple" request: no CORS preflight, which Apps Script can't answer.
    return fetch(cfg.apiUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    }).then(asJson);
  }
  function asJson(res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  // ---------- helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function cover(id, cls) {
    var b = BY_ID[id];
    return '<img src="covers/' + id + '.jpg" alt="' + esc(b.title) + ' by ' + esc(b.author) + '"' +
      (cls ? ' class="' + cls + '"' : '') + ' width="330" height="500">';
  }
  function running() { return '<div class="running sc">The Book Club · MMXXVI</div>'; }
  function head(kicker, title, dek, extra) {
    return '<header class="head">' +
      (kicker ? '<div class="kicker">' + kicker + '</div>' : '') +
      '<h1>' + title + (extra || '') + '</h1>' +
      (dek ? '<p class="dek">' + dek + '</p>' : '') +
      '</header>';
  }
  var WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  function word(n) { return WORDS[n] || String(n); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function pairsFor(n) { return n * (n - 1) / 2; }
  function screen(html, cls) {
    app.innerHTML = '<div class="screen fade ' + (cls || '') + '">' + html + '</div>';
    window.scrollTo(0, 0);
  }

  // ---------- render ----------
  function render() {
    if (location.hash === '#results') return renderGroupOnly();
    if (!cfg.apiUrl) return renderNotConfigured();
    switch (state.step) {
      case 'books': return renderBooks();
      case 'matchups': return renderMatchup();
      case 'submit': return renderSubmit();
      case 'results': return renderResults();
      case 'voted': return renderAlreadyVoted();
      default: return renderEmail();
    }
  }

  function renderNotConfigured() {
    screen('<div class="scroll">' + running() +
      head('Book club poll', 'Not open yet', 'The poll hasn’t been connected to its spreadsheet. Check back soon.') +
      '</div>');
  }

  function renderEmail() {
    screen('<div class="scroll">' + running() +
      head('Book club poll', 'Rank this year’s books',
        'Mark the books you read, then choose between them two at a time. It takes about three minutes.') +
      '<form class="field" id="emailForm" novalidate>' +
        '<label for="email" class="sc">Your email</label>' +
        '<input id="email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" required value="' + esc(state.email) + '">' +
        '<p class="help">Used only to make sure everyone votes once. It isn’t shown to anyone.</p>' +
        '<p class="error" id="err" role="alert"></p>' +
        '<div class="actions"><button class="btn solid block" id="start" type="submit">Start</button></div>' +
      '</form>' +
      '<div class="foot"><a class="link" href="#results">See the group ranking so far</a></div>' +
      '</div>');

    var form = document.getElementById('emailForm');
    var input = document.getElementById('email');
    var err = document.getElementById('err');
    var btn = document.getElementById('start');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = input.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        err.textContent = 'That doesn’t look like an email address.';
        return;
      }
      err.textContent = '';
      btn.disabled = true; btn.textContent = 'Checking…';
      getJson({ action: 'check', email: email }).then(function (r) {
        if (r.error) throw new Error(r.error);
        state.email = email;
        if (r.exists) return go('voted');
        go('books');
      }).catch(function () {
        btn.disabled = false; btn.textContent = 'Start';
        err.textContent = 'Couldn’t reach the poll. Check your connection and try again.';
      });
    });
  }

  function renderAlreadyVoted() {
    screen('<div class="scroll">' + running() +
      head('Book club poll', 'You’ve already voted',
        'Each email can vote once, and <b>' + esc(state.email) + '</b> already has. You can still see how the group ranked the books.') +
      '<div class="actions"><a class="btn solid block" href="#results">See the group ranking</a></div>' +
      '<div class="foot"><button class="link" id="other">Use a different email</button></div>' +
      '</div>');
    document.getElementById('other').onclick = function () { state = fresh(); go('email'); };
  }

  function renderBooks() {
    var tiles = BOOKS.map(function (b) {
      var on = state.read.indexOf(b.id) !== -1;
      return '<button class="tile" type="button" data-id="' + b.id + '" aria-pressed="' + on + '">' +
        cover(b.id) + '<span class="stamp" aria-hidden="true">✓</span>' +
        '<span class="m sc">' + b.month + '</span></button>';
    }).join('');
    screen('<div class="scroll">' + running() +
      head('Step 1 of 2', 'Which books did you read?', 'Tap each one you finished. Select at least two.') +
      '<div class="grid">' + tiles + '</div>' +
      '</div>' +
      '<div class="bar"><div class="count" id="count"></div>' +
      '<button class="btn solid" id="next" type="button">Continue</button></div>');

    var count = document.getElementById('count');
    var next = document.getElementById('next');
    function update() {
      var n = state.read.length;
      count.textContent = n < 2
        ? (n === 0 ? 'Select at least two' : 'Select at least one more')
        : plural(n, 'book', 'books') + ' · ' + plural(pairsFor(n), 'matchup', 'matchups');
      next.disabled = n < 2;
    }
    app.querySelectorAll('.tile').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-id');
        var i = state.read.indexOf(id);
        if (i === -1) state.read.push(id); else state.read.splice(i, 1);
        state.read = BOOKS.map(function (b) { return b.id; }).filter(function (x) { return state.read.indexOf(x) !== -1; });
        el.setAttribute('aria-pressed', String(i === -1));
        save(); update();
      });
    });
    next.addEventListener('click', function () {
      if (state.read.length < 2) return;
      state.order = R.matchupOrder(state.read);
      state.choices = [];
      go('matchups');
    });
    update();
  }

  function renderMatchup() {
    var i = state.choices.length;
    var total = state.order.length;
    if (i >= total) return go('submit');
    var m = state.order[i];
    var L = BY_ID[m.left], Rt = BY_ID[m.right];
    var close = R.isCloseCall(m.left, m.right, state.choices);
    screen('<div class="scroll">' + running() +
      '<div class="prog"><span class="sc">' + (i + 1) + ' of ' + total + '</span>' +
      '<div class="track"><i style="width:' + (i / total * 100) + '%"></i></div></div>' +
      head('Step 2 of 2', 'Which did you prefer?', null, close ? '<span class="dagger" aria-hidden="true">†</span>' : '') +
      '<div class="vs">' +
        '<button class="pick" type="button" data-side="left">' + cover(L.id) +
          '<span class="t">' + esc(L.title) + '</span><span class="a sc">' + esc(L.author) + '</span></button>' +
        '<div class="or" aria-hidden="true">or</div>' +
        '<button class="pick" type="button" data-side="right">' + cover(Rt.id) +
          '<span class="t">' + esc(Rt.title) + '</span><span class="a sc">' + esc(Rt.author) + '</span></button>' +
      '</div>' +
      '<div class="under"><button class="link" id="undo" type="button">' +
        (i === 0 ? 'Back to the book list' : 'Undo last choice') + '</button></div>' +
      '<p class="footnote' + (close ? ' show' : '') + '"><span class="dagger">†</span> Tough one.</p>' +
      '</div>');

    var busy = false;
    app.querySelectorAll('.pick').forEach(function (el) {
      el.addEventListener('click', function () {
        if (busy) return;
        busy = true;
        var side = el.getAttribute('data-side');
        el.classList.add('chosen');
        state.choices.push({
          book_a: m.left, book_b: m.right,
          winner: side === 'left' ? m.left : m.right,
          position: side
        });
        save();
        setTimeout(function () {
          if (state.choices.length >= total) go('submit'); else render();
        }, 220);
      });
    });
    document.getElementById('undo').addEventListener('click', function () {
      if (busy) return;
      if (state.choices.length === 0) { state.order = []; return go('books'); }
      state.choices.pop();
      save(); render();
    });
  }

  function renderSubmit() {
    screen('<div class="scroll">' + running() +
      head('Almost done', 'Saving your choices…', null) + '</div>');
    var payload = { email: state.email, books_read: state.read, choices: state.choices };
    // If an earlier attempt from this device reached the server but the reply was
    // lost, the retry is refused as a repeat. In that case the vote is already in.
    var retrying = !!state.posted;
    state.posted = true; save();
    postJson(payload).then(function (r) {
      if (r.ok || (r.error === 'already_voted' && retrying)) {
        state.ranking = R.personalRanking(state.read, state.choices);
        state.submitted = true;
        return go('results');
      }
      if (r.error === 'already_voted') return go('voted');
      throw new Error(r.error || 'unknown');
    }).catch(function () {
      screen('<div class="scroll">' + running() +
        head('Almost done', 'Couldn’t save your choices',
          'Your answers are kept on this device. Check your connection and try again.') +
        '<div class="actions"><button class="btn solid block" id="retry" type="button">Try again</button></div>' +
        '</div>');
      document.getElementById('retry').onclick = renderSubmit;
    });
  }

  function renderResults() {
    var ranking = state.ranking || R.personalRanking(state.read, state.choices);
    var n = state.read.length;
    var top = ranking.filter(function (x) { return x.rank === 1; });
    var rest = ranking.filter(function (x) { return x.rank !== 1; });

    var plate;
    if (top.length === 1) {
      var b = BY_ID[top[0].id];
      var w = top[0].wins;
      plate = '<div class="label sc">Your #1</div>' +
        '<div class="covers">' + cover(b.id) + '</div>' +
        '<div class="t">' + esc(b.title) + '</div>' +
        '<div class="a sc">' + esc(b.author) + ' · ' + b.month + '</div>' +
        '<div class="note">' + (n === 2 ? 'Won its only matchup.'
          : w === n - 1 ? 'Won all ' + w + ' of its matchups.'
          : 'Won ' + w + ' of ' + (n - 1) + ' matchups.') + '</div>';
    } else {
      plate = '<div class="label sc">Tied for #1</div>' +
        '<div class="covers many">' + top.map(function (x) { return cover(x.id); }).join('') + '</div>' +
        '<div class="t">' + top.map(function (x) { return esc(BY_ID[x.id].title); }).join(', ') + '</div>' +
        '<div class="note">Each won ' + plural(top[0].wins, 'matchup', 'matchups') + '.</div>';
    }

    var anyTie = ranking.some(function (x) { return x.tied; });
    var list = rest.map(function (x) {
      var b = BY_ID[x.id];
      return '<div class="entry"><span class="rk">' + x.rank + (x.tied ? '<span class="ast">*</span>' : '') + '</span>' +
        '<span class="t">' + esc(b.title) + '<span class="a sc">' + esc(b.author) + '</span></span>' +
        '<span class="dots"></span><span class="v">' + plural(x.wins, 'win', 'wins') + '</span></div>';
    }).join('');

    screen('<div class="scroll">' + running() +
      head('Results', 'Your ranking', null) +
      '<div class="plate reveal"><div class="plate-in">' +
        '<span class="corner l" aria-hidden="true">❧</span><span class="corner r" aria-hidden="true">❧</span>' +
        plate + '</div></div>' +
      (list ? '<div class="subhead sc">The rest</div><div>' + list + '</div>' : '') +
      (anyTie ? '<p class="tie-note"><span class="ast">*</span> Tied: these books each beat one another, so there’s no clear order between them.</p>' : '') +
      '<div class="fleuron" aria-hidden="true">❦</div>' +
      '<section id="group">' + groupHeader() + '<p class="notice">Loading the group ranking…</p></section>' +
      '<div class="foot"><button class="link" id="other" type="button">Voting for someone else on this device? Start over</button></div>' +
      '</div>');
    document.getElementById('other').onclick = function () { state = fresh(); go('email'); };
    loadGroup(document.getElementById('group'));
  }

  function groupHeader(count) {
    return '<header class="head" style="margin-top:6px"><h1 style="font-size:30px">Group ranking</h1>' +
      '<p class="dek" id="voters">' + (count == null ? '&nbsp;' : votedLine(count)) + '</p></header>';
  }
  function votedLine(n) {
    if (n === 0) return 'No one has voted yet.';
    return (n <= 10 ? word(n).replace(/^./, function (c) { return c.toUpperCase(); }) : n) +
      (n === 1 ? ' person has' : ' people have') + ' voted so far. Percentages show the share of matchups each book won.';
  }

  function loadGroup(el) {
    getJson({ action: 'results' }).then(function (g) {
      if (!g || !Array.isArray(g.ranked)) throw new Error('bad');
      el.innerHTML = groupHeader(g.respondents) + groupBody(g);
    }).catch(function () {
      el.innerHTML = groupHeader() +
        '<p class="notice">Couldn’t load the group ranking. <button class="link" id="retryGroup" type="button">Try again</button></p>';
      document.getElementById('retryGroup').onclick = function () {
        el.innerHTML = groupHeader() + '<p class="notice">Loading the group ranking…</p>';
        loadGroup(el);
      };
    });
  }

  function firstLine(n) {
    return n === 0 ? 'no one’s #1' : '#1 for ' + plural(n, 'person', 'people');
  }

  function groupBody(g) {
    var ranked = g.ranked.filter(function (s) { return BY_ID[s.id]; }).map(function (s) {
      var b = BY_ID[s.id];
      return '<div class="ix"><span class="rk">' + Number(s.rank) + '</span>' + cover(b.id) +
        '<div class="body"><div class="line"><span class="t">' + esc(b.title) + '</span>' +
        '<span class="dots"></span><span class="pct">' + Math.round(Number(s.winRate) * 100) + '%</span></div>' +
        '<div class="meta">' + plural(Number(s.readers), 'reader', 'readers') +
        ' · ' + firstLine(Number(s.firstPlace)) + '</div></div></div>';
    }).join('');
    var un = (g.unranked || []).filter(function (s) { return BY_ID[s.id]; }).map(function (s) {
      var b = BY_ID[s.id];
      var r = Number(s.readers);
      return '<div class="row">' + cover(b.id) + '<div><div class="t">' + esc(b.title) + '</div>' +
        '<div class="m">' + (r === 0 ? 'No readers yet' : plural(r, 'reader', 'readers') + ' so far') + '</div></div></div>';
    }).join('');
    var min = Number(g.minReaders) || 3;
    return '<div class="group">' +
      (ranked || '<p class="notice">Books appear here once ' + word(min) + ' people have read them.</p>') +
      '</div>' +
      (un ? '<div class="fleuron" aria-hidden="true">❦</div><div class="addenda"><h3 class="sc">Not enough readers yet</h3>' +
        '<p class="why">A book needs at least ' + word(min) + ' readers to be ranked.</p>' + un + '</div>' : '');
  }

  function renderGroupOnly() {
    screen('<div class="scroll">' + running() +
      '<section id="group">' + groupHeader() + '<p class="notice">Loading the group ranking…</p></section>' +
      '<div class="foot"><a class="link" href="#">Back to the poll</a></div>' +
      '</div>');
    if (!cfg.apiUrl) {
      document.getElementById('group').innerHTML = groupHeader() + '<p class="notice">The poll isn’t open yet.</p>';
      return;
    }
    loadGroup(document.getElementById('group'));
  }

  window.addEventListener('hashchange', render);
  render();
})();
