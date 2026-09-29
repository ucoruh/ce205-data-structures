/* Week 11 — segment tree: build once from an array, then answer range-sum queries in O(log n). Node `i`
 * (1-indexed, children `2*i` and `2*i+1`) is responsible for the range `[lo, hi]`; a leaf holds one array
 * value, an internal node holds the SUM of its two children. A query `[l, r]` walks down: a node fully
 * OUTSIDE `[l, r]` contributes 0 immediately; a node fully INSIDE `[l, r]` contributes its precomputed sum
 * immediately (no need to look further down); only a node that partially overlaps must recurse into both
 * children. Data: {arr: [...], queries: [[l, r], ...]}. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'long tree[4 * MAXN];',
    '',
    'void build(int i, int lo, int hi, int arr[]) {',
    '    if (lo == hi) { tree[i] = arr[lo]; return; }',
    '    int mid = (lo + hi) / 2;',
    '    build(2 * i,     lo,      mid, arr);',
    '    build(2 * i + 1, mid + 1, hi,  arr);',
    '    tree[i] = tree[2 * i] + tree[2 * i + 1];',
    '}',
    '',
    'long query(int i, int lo, int hi, int l, int r) {',
    '    if (r < lo || hi < l)   return 0;                  /* no overlap: outside [l, r] */',
    '    if (l <= lo && hi <= r) return tree[i];             /* fully inside: precomputed sum */',
    '    int mid = (lo + hi) / 2;                            /* partial overlap: check both halves */',
    '    return query(2 * i, lo, mid, l, r) + query(2 * i + 1, mid + 1, hi, l, r);',
    '}'
  ];
  var JAVA = [
    'static long[] tree = new long[4 * MAXN];',
    '',
    'static void build(int i, int lo, int hi, int[] arr) {',
    '    if (lo == hi) { tree[i] = arr[lo]; return; }',
    '    int mid = (lo + hi) / 2;',
    '    build(2 * i,     lo,      mid, arr);',
    '    build(2 * i + 1, mid + 1, hi,  arr);',
    '    tree[i] = tree[2 * i] + tree[2 * i + 1];',
    '}',
    '',
    'static long query(int i, int lo, int hi, int l, int r) {',
    '    if (r < lo || hi < l)   return 0;                   // no overlap: outside [l, r]',
    '    if (l <= lo && hi <= r) return tree[i];              // fully inside: precomputed sum',
    '    int mid = (lo + hi) / 2;                             // partial overlap: check both halves',
    '    return query(2 * i, lo, mid, l, r) + query(2 * i + 1, mid + 1, hi, l, r);',
    '}'
  ];

  var X0 = 40, Y0 = 50, DX = 46, DY = 78;
  function layoutRec(i, lo, hi, depth, xc, pos) {
    if (lo === hi) { pos[i] = { x: X0 + xc.v * DX, y: Y0 + depth * DY }; xc.v++; return; }
    var mid = (lo + hi) >> 1;
    layoutRec(2 * i, lo, mid, depth + 1, xc, pos);
    layoutRec(2 * i + 1, mid + 1, hi, depth + 1, xc, pos);
    pos[i] = { x: (pos[2 * i].x + pos[2 * i + 1].x) / 2, y: Y0 + depth * DY };
  }
  function syncTree(S, i, lo, hi, pos, tv, tracked, styleOf) {
    var seen = {};
    (function walk(i, lo, hi) {
      var id = 'n' + i; seen[id] = 1;
      S.box(id, { x: pos[i].x - 20, y: pos[i].y - 17, w: 40, h: 34, text: String(tv[i]), above: '[' + lo + ',' + hi + ']', style: styleOf ? styleOf(i, lo, hi) : 'normal', size: 14 });
      if (lo !== hi) {
        var mid = (lo + hi) >> 1;
        var el = 'e' + i + 'l'; seen[el] = 1; S.arrow(el, { from: id, to: 'n' + (2 * i), kind: 'center', head: false }); walk(2 * i, lo, mid);
        var er = 'e' + i + 'r'; seen[er] = 1; S.arrow(er, { from: id, to: 'n' + (2 * i + 1), kind: 'center', head: false }); walk(2 * i + 1, mid + 1, hi);
      }
    })(i, lo, hi);
    for (var id2 in tracked) if (!seen[id2] && S.has(id2)) S.remove(id2);
    return seen;
  }

  D.define({
    id: 'segment-tree',
    title: T('Segment ağacı: kurulum ve aralık toplamı (range sum) sorgusu', 'Segment tree: build and a range-sum query'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 değer, 3 sorgu: tam aralık, kısmi, tek nokta', '10 values, 3 queries: full range, partial, a single point'),
        data: { arr: [5, 3, 8, 2, 9, 1, 7, 4, 6, 10], queries: [[0, 9], [2, 5], [7, 7]] } },
      { id: 'hard', level: 'hard', name: T('14 değer, negatifler dahil, 4 sorgu', '14 values including negatives, 4 queries'),
        data: { arr: [4, -7, 12, 3, -2, 9, -5, 8, 1, -3, 6, 0, -9, 11], queries: [[0, 13], [3, 8], [10, 10], [1, 2]] } },
      { id: 'edge-full-range', level: 'edge', name: T('Uç durum: sorgu tüm diziyi kapsıyor — kök hemen tam içeride', 'Edge case: the query spans the whole array — the root is immediately fully inside'),
        data: { arr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], queries: [[0, 9]] } },
      { id: 'edge-points', level: 'edge', name: T('Uç durum: üç tek noktalı sorgu (en soldan, en sağdan, ortadan)', 'Edge case: three single-point queries (leftmost, rightmost, middle)'),
        data: { arr: [11, 22, 33, 44, 55, 66, 77, 88, 99, 100], queries: [[0, 0], [9, 9], [4, 4]] } },
      { id: 'edge-single-element', level: 'edge', name: T('Uç durum: tek elemanlı dizi', 'Edge case: a single-element array'), data: { arr: [42], queries: [[0, 0]] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.arr.length; },
    /** Independent: a direct brute-force loop over the array — no tree, no recursion, a completely different
     *  technique from build()'s tree walk. */
    reference: function (d) {
      return d.queries.map(function (q) {
        var s = 0;
        for (var i = q[0]; i <= q[1]; i++) s += d.arr[i];
        return s;
      });
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 18 }[level];
      var lo = level === 'extreme' ? -200 : (level === 'hard' ? -50 : 1);
      var hi = level === 'extreme' ? 200 : (level === 'hard' ? 100 : 50);
      var arr = [];
      for (var i = 0; i < n; i++) arr.push(D.randInt(r, lo, hi));
      var nq = { easy: 3, normal: 3, hard: 4, extreme: 5 }[level] || 3, queries = [];
      for (var j = 0; j < nq; j++) {
        var a = D.randInt(r, 0, n - 1), b = D.randInt(r, 0, n - 1);
        queries.push(a <= b ? [a, b] : [b, a]);
      }
      return { arr: arr, queries: queries };
    },
    input: {
      hint: T('Örnek: arr=5,3,8,2,9 q=0-4,1-2', 'Example: arr=5,3,8,2,9 q=0-4,1-2'),
      parse: function (text) {
        var m = /^\s*arr=([^\s]+)\s+q=([^\s]+)\s*$/i.exec(String(text));
        if (!m) throw T('Biçim: arr=... q=l-r,l-r', 'Format: arr=... q=l-r,l-r');
        var arr = m[1].split(',').filter(Boolean).map(function (t) { if (!/^-?\d+$/.test(t)) throw T('"' + t + '" bir tamsayı değil.', '"' + t + '" is not an integer.'); return parseInt(t, 10); });
        if (!arr.length) throw T('arr en az bir değer içermeli.', 'arr needs at least one value.');
        var queries = m[2].split(',').filter(Boolean).map(function (tok) {
          var mm = /^(\d+)-(\d+)$/.exec(tok);
          if (!mm) throw T('"' + tok + '" l-r biçiminde değil.', '"' + tok + '" is not in l-r form.');
          var l = parseInt(mm[1], 10), rr = parseInt(mm[2], 10);
          if (l > rr || rr >= arr.length) throw T('Aralık dizi sınırları içinde ve l<=r olmalı.', 'The range must be within the array and l<=r.');
          return [l, rr];
        });
        if (!queries.length) throw T('En az bir sorgu (q=) yazın.', 'Write at least one query (q=).');
        return { arr: arr, queries: queries };
      },
      format: function (d) { return 'arr=' + d.arr.join(',') + ' q=' + d.queries.map(function (q) { return q[0] + '-' + q[1]; }).join(','); },
      bad: ['', 'arr=1,x q=0-0', 'arr=1,2,3 q=0-5', 'arr=1,2,3 q=2-1']
    },
    build: function (S, d) {
      var n = d.arr.length, tv = {}, tracked = {};
      (function bld(i, lo, hi) {
        if (lo === hi) { tv[i] = d.arr[lo]; return; }
        var mid = (lo + hi) >> 1;
        bld(2 * i, lo, mid); bld(2 * i + 1, mid + 1, hi);
        tv[i] = tv[2 * i] + tv[2 * i + 1];
      })(1, 0, n - 1);
      var pos = {}, xc = { v: 0 };
      layoutRec(1, 0, n - 1, 0, xc, pos);

      tracked = syncTree(S, 1, 0, n - 1, pos, tv, tracked, function (i, lo, hi) { return lo === hi ? 'new' : 'dim'; });
      var buildLeafNote = T('lo == hi? (yapraklarda evet, iç düğümlerde hayır)', 'lo == hi? (yes at leaves, no at internal nodes)');
      S.step(T('Dizinin ' + n + ' değeri yapraklara yerleşir (yeşil). İç düğümler henüz hesaplanmadı.',
               'The array\'s ' + n + ' values sit at the leaves (green). Internal nodes are not computed yet.'), { c: [3, { n: 4, note: buildLeafNote }], java: [3, { n: 4, note: buildLeafNote }] });
      tracked = syncTree(S, 1, 0, n - 1, pos, tv, tracked, function () { return 'normal'; });
      S.step(T('`build`: her iç düğüm, aşağıdan yukarı, iki çocuğunun toplamı olarak hesaplanır — toplamda `O(n)` iş.',
               '`build`: every internal node is computed bottom-up as the sum of its two children — `O(n)` work in total.'), { c: [5, 6, 7, 8], java: [5, 6, 7, 8] });

      d.queries.forEach(function (q, qi) {
        var l = q[0], r = q[1];
        var detailed = qi === 0 && (r - l + 1) < n;
        var visited = [];
        function qAnim(i, lo, hi) {
          if (r < lo || hi < l) {
            visited.push({ i: i, lo: lo, hi: hi, style: 'dim' });
            if (detailed) {
              tracked = syncTree(S, 1, 0, n - 1, pos, tv, tracked, function (ii) { var v = visited.find(function (x) { return x.i === ii; }); return v ? v.style : 'normal'; });
              /* Bug fix: this used to reference line 11 (the `query` function SIGNATURE) for the "no
                 overlap" narration, never the actual condition line (12) that makes this branch true. */
              var noOverlapLines = [11, { n: 12, note: T('r < lo veya hi < l? evet', 'r < lo or hi < l? yes') }];
              S.step(T('düğüm [' + lo + ',' + hi + ']: sorgu [' + l + ',' + r + '] ile hiç kesişmiyor -> **0** katkı, dallanma budanır.',
                       'node [' + lo + ',' + hi + ']: no overlap with the query [' + l + ',' + r + '] -> contributes **0**, this branch is pruned.'), { c: noOverlapLines, java: noOverlapLines });
            }
            return 0;
          }
          if (l <= lo && hi <= r) {
            visited.push({ i: i, lo: lo, hi: hi, style: 'new' });
            if (detailed) {
              tracked = syncTree(S, 1, 0, n - 1, pos, tv, tracked, function (ii) { var v = visited.find(function (x) { return x.i === ii; }); return v ? v.style : 'normal'; });
              var fullyLines = [11, { n: 12, skip: true }, { n: 13, note: T('l <= lo ve hi <= r? evet', 'l <= lo and hi <= r? yes') }];
              S.step(T('düğüm [' + lo + ',' + hi + ']: sorgunun TAMAMEN içinde -> hazır toplam `' + tv[i] + '` doğrudan kullanılır, daha aşağı inilmez.',
                       'node [' + lo + ',' + hi + ']: FULLY inside the query -> its precomputed sum `' + tv[i] + '` is used directly, no need to go deeper.'), { c: fullyLines, java: fullyLines });
            }
            return tv[i];
          }
          visited.push({ i: i, lo: lo, hi: hi, style: 'active' });
          if (detailed) {
            tracked = syncTree(S, 1, 0, n - 1, pos, tv, tracked, function (ii) { var v = visited.find(function (x) { return x.i === ii; }); return v ? v.style : 'normal'; });
            var partialLines = [11, { n: 12, skip: true }, { n: 13, skip: true }, 14];
            S.step(T('düğüm [' + lo + ',' + hi + ']: sorguyla KISMEN kesişiyor -> her iki çocuğa da inilmeli.',
                     'node [' + lo + ',' + hi + ']: PARTIALLY overlaps the query -> both children must be checked.'), { c: partialLines, java: partialLines });
          }
          var mid = (lo + hi) >> 1;
          return qAnim(2 * i, lo, mid) + qAnim(2 * i + 1, mid + 1, hi);
        }
        var sum = qAnim(1, 0, n - 1);
        if (!detailed) {
          tracked = syncTree(S, 1, 0, n - 1, pos, tv, tracked, function (ii) { var v = visited.find(function (x) { return x.i === ii; }); return v ? v.style : 'normal'; });
          /* Condensed summary of the whole recursive query() call (possibly many nodes visited): lines 12
             and 13 are noted with whether that condition fired at least once during this query, based on
             the actual per-node outcomes recorded in `visited` -- an honest aggregate, not a per-call trace. */
          var sawNoOverlap = visited.some(function (v) { return v.style === 'dim'; });
          var sawFullyInside = visited.some(function (v) { return v.style === 'new'; });
          var sumLines = [11, { n: 12, note: T('r < lo veya hi < l? ' + (sawNoOverlap ? 'evet (en az bir kez)' : 'hayır'), 'r < lo or hi < l? ' + (sawNoOverlap ? 'yes (at least once)' : 'no')) },
                           { n: 13, note: T('l <= lo ve hi <= r? ' + (sawFullyInside ? 'evet (en az bir kez)' : 'hayır'), 'l <= lo and hi <= r? ' + (sawFullyInside ? 'yes (at least once)' : 'no')) },
                           14, 15];
          S.step(T('sorgu [' + l + ',' + r + '] -> toplam = **' + sum + '** (' + visited.length + ' düğüm ziyaret edildi).',
                   'query [' + l + ',' + r + '] -> sum = **' + sum + '** (' + visited.length + ' nodes visited).'), { c: sumLines, java: sumLines });
        } else {
          tracked = syncTree(S, 1, 0, n - 1, pos, tv, tracked, function () { return 'normal'; });
          S.step(T('sorgu [' + l + ',' + r + '] bitti -> toplam = **' + sum + '**.', 'query [' + l + ',' + r + '] done -> sum = **' + sum + '**.'));
        }
      });

      S.result = d.queries.map(function (q) {
        var l = q[0], r = q[1];
        return (function qs(i, lo, hi) {
          if (r < lo || hi < l) return 0;
          if (l <= lo && hi <= r) return tv[i];
          var mid = (lo + hi) >> 1;
          return qs(2 * i, lo, mid) + qs(2 * i + 1, mid + 1, hi);
        })(1, 0, n - 1);
      });
      S.step(T('Bitti: ' + d.queries.length + ' sorgu. Her sorgu en fazla `O(log n)` düğüm ziyaret eder — bir düz döngünün `O(n)`\'ine karşı büyük kazanç, özellikle çok sayıda sorgu varsa.',
               'Done: ' + d.queries.length + ' queries. Every query visits at most `O(log n)` nodes — a big win over a plain loop\'s `O(n)`, especially with many queries.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
