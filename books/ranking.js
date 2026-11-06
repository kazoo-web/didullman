/*
 * Ranking logic for the book club poll. Plain script: works in the browser
 * (window.Ranking) and in Node (module.exports) so it can be tested.
 * The same personalRanking function is copied into apps-script/Code.gs,
 * which recalculates it on the server. Keep the two in step.
 */
(function (root) {
  'use strict';

  /** Every unordered pair of the given ids: n*(n-1)/2 pairs. */
  function allPairs(ids) {
    var pairs = [];
    for (var i = 0; i < ids.length; i++) {
      for (var j = i + 1; j < ids.length; j++) pairs.push([ids[i], ids[j]]);
    }
    return pairs;
  }

  function shuffle(arr, rand) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function backToBack(order) {
    var n = 0;
    for (var i = 1; i < order.length; i++) {
      var p = order[i - 1], q = order[i];
      if (p[0] === q[0] || p[0] === q[1] || p[1] === q[0] || p[1] === q[1]) n++;
    }
    return n;
  }

  /**
   * Random matchup order with random left/right placement. Tries a number of
   * shuffles and keeps the one where the same book appears in consecutive
   * matchups least often, so the poll doesn't feel repetitive.
   * Returns [{left, right}].
   */
  function matchupOrder(ids, rand) {
    rand = rand || Math.random;
    var pairs = allPairs(ids);
    var best = null, bestScore = Infinity;
    for (var k = 0; k < 200 && bestScore > 0; k++) {
      var cand = shuffle(pairs, rand);
      var s = backToBack(cand);
      if (s < bestScore) { best = cand; bestScore = s; }
    }
    return (best || []).map(function (p) {
      return rand() < 0.5 ? { left: p[0], right: p[1] } : { left: p[1], right: p[0] };
    });
  }

  /**
   * Personal ranking from a complete round robin.
   * choices: [{book_a, book_b, winner}]
   * Ordered by wins. A two-way tie is broken by the head-to-head result.
   * Three or more books on the same number of wins share a rank (tied: true).
   * Ranks use "1, 2, 3, 3, 3" numbering.
   * Returns [{id, wins, rank, tied}] in display order.
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

  /** True when both books have played and sit on the same number of wins so far. */
  function isCloseCall(left, right, choices) {
    var played = {}, wins = {};
    choices.forEach(function (c) {
      played[c.book_a] = true; played[c.book_b] = true;
      wins[c.winner] = (wins[c.winner] || 0) + 1;
    });
    return !!(played[left] && played[right] && (wins[left] || 0) === (wins[right] || 0));
  }

  var api = {
    allPairs: allPairs,
    matchupOrder: matchupOrder,
    personalRanking: personalRanking,
    isCloseCall: isCloseCall
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Ranking = api;
})(this);
