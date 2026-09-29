/* Week 11 — Fenwick tree (binary indexed tree, BIT): prefix sums in O(log n) using one small trick, `i & -i`
 * (the value of the lowest set bit of `i`), computed from `i`'s two's-complement negation. `bit[i]` holds the
 * sum of a range of `i & -i` values ending at `i`. `update(i, delta)` walks UP: `i += i & -i`, adding delta
 * to every bit[] cell responsible for a range that includes `i`. `query(i)` (prefix sum 1..i) walks DOWN:
 * `i -= i & -i`, adding up exactly the O(log n) cells that together cover 1..i with no overlap.
 * Data: {n, ops: [...]} — ops are {add: {i, delta}} or {query: i}. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'int bit[MAXN + 1];    /* 1-indexed; bit[0] is unused */',
    '',
    'void update(int i, int delta) {',
    '    while (i <= n) {',
    '        bit[i] += delta;',
    '        i += i & (-i);        /* move to the next responsible index */',
    '    }',
    '}',
    '',
    'int query(int i) {             /* prefix sum: v[1] + v[2] + ... + v[i] */',
    '    int sum = 0;',
    '    while (i > 0) {',
    '        sum += bit[i];',
    '        i -= i & (-i);        /* move to the previous responsible index */',
    '    }',
    '    return sum;',
    '}'
  ];
  var JAVA = [
    'int[] bit = new int[MAXN + 1];  // 1-indexed; bit[0] is unused',
    '',
    'static void update(int i, int delta) {',
    '    while (i <= n) {',
    '        bit[i] += delta;',
    '        i += i & (-i);         // move to the next responsible index',
    '    }',
    '}',
    '',
    'static int query(int i) {              // prefix sum: v[1] + v[2] + ... + v[i]',
    '    int sum = 0;',
    '    while (i > 0) {',
    '        sum += bit[i];',
    '        i -= i & (-i);         // move to the previous responsible index',
    '    }',
    '    return sum;',
    '}'
  ];

  var X0 = 70, Y0 = 120, W = 44, H = 40;
  function cellX(i) { return X0 + (i - 1) * W; }

  D.define({
    id: 'fenwick-tree',
    title: T('Fenwick ağacı (BIT): önek toplamları ve `i & -i`', 'Fenwick tree (BIT): prefix sums and `i & -i`'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('n=10, 8 işlem: ekleme ve sorgu karışık', 'n=10, 8 operations: updates and queries mixed'),
        data: { n: 10, ops: [{ add: { i: 3, delta: 5 } }, { add: { i: 7, delta: 2 } }, { query: 10 }, { add: { i: 1, delta: 4 } }, { query: 5 }, { add: { i: 10, delta: 3 } }, { query: 10 }, { query: 1 }] } },
      { id: 'hard', level: 'hard', name: T('n=16, 10 işlem, negatif delta dahil', 'n=16, 10 operations, including negative deltas'),
        data: { n: 16, ops: [{ add: { i: 5, delta: 8 } }, { add: { i: 12, delta: -3 } }, { query: 16 }, { add: { i: 1, delta: 6 } }, { add: { i: 16, delta: 4 } }, { query: 8 }, { add: { i: 9, delta: -5 } }, { query: 16 }, { query: 12 }, { add: { i: 8, delta: 2 } }] } },
      { id: 'edge-chain-length', level: 'edge', name: T('Uç durum: n=16, update(1) 5 adım sürer, query(16) yalnız 1 adım', 'Edge case: n=16, update(1) takes 5 steps, query(16) takes only 1'),
        data: { n: 16, ops: [{ add: { i: 1, delta: 7 } }, { query: 16 }] } },
      { id: 'edge-negative', level: 'edge', name: T('Uç durum: negatif deltalar toplamı eksiye düşürebilir', 'Edge case: negative deltas can push the sum below zero'),
        data: { n: 10, ops: [{ add: { i: 4, delta: -9 } }, { add: { i: 8, delta: 2 } }, { query: 10 }, { add: { i: 1, delta: -3 } }, { query: 4 }, { query: 10 }] } },
      { id: 'edge-point', level: 'edge', name: T('Uç durum: ekleme ve hemen aynı noktada sorgu', 'Edge case: an update immediately queried at the same point'), data: { n: 10, ops: [{ add: { i: 1, delta: 9 } }, { query: 1 }] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.n; },
    /** Independent: a plain array simulation (no bit tricks at all) — update writes directly to the array
     *  cell, query sums a prefix with a direct loop. A completely different technique from the BIT walk. */
    reference: function (d) {
      var vals = new Array(d.n + 1).fill(0), out = [];
      d.ops.forEach(function (op) {
        if (op.add) vals[op.add.i] += op.add.delta;
        else {
          var s = 0;
          for (var k = 1; k <= op.query; k++) s += vals[k];
          out.push(s);
        }
      });
      return out;
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level];
      var nops = { easy: 6, normal: 8, hard: 10, extreme: 12 }[level];
      var lo = level === 'extreme' ? -50 : (level === 'hard' ? -20 : 1);
      var hi = level === 'extreme' ? 50 : (level === 'hard' ? 20 : 15);
      var ops = [];
      for (var k = 0; k < nops; k++) {
        if (r() < 0.6) ops.push({ add: { i: D.randInt(r, 1, n), delta: D.randInt(r, lo, hi) } });
        else ops.push({ query: D.randInt(r, 1, n) });
      }
      if (!ops.some(function (o) { return o.query !== undefined; })) ops.push({ query: n });
      return { n: n, ops: ops };
    },
    input: {
      hint: T('Örnek: n=10 add(3,5) add(7,2) query(10)', 'Example: n=10 add(3,5) add(7,2) query(10)'),
      parse: function (text) {
        var toks = String(text).trim().split(/\s+/).filter(Boolean);
        if (!toks.length) throw T('En az n=... ve bir işlem yazın.', 'Write at least n=... and one operation.');
        var m0 = /^n=(\d+)$/.exec(toks[0]);
        if (!m0) throw T('İlk belirteç n=SAYI olmalı.', 'The first token must be n=NUMBER.');
        var n = parseInt(m0[1], 10);
        if (n < 1 || n > 60) throw T('n 1 ile 60 arasında olmalı.', 'n must be between 1 and 60.');
        var ops = toks.slice(1).map(function (tok) {
          var ma = /^add\((\d+),(-?\d+)\)$/.exec(tok);
          if (ma) { var i = parseInt(ma[1], 10); if (i < 1 || i > n) throw T('add içindeki i, 1..n arasında olmalı.', 'add\'s i must be within 1..n.'); return { add: { i: i, delta: parseInt(ma[2], 10) } }; }
          var mq = /^query\((\d+)\)$/.exec(tok);
          if (mq) { var qi = parseInt(mq[1], 10); if (qi < 1 || qi > n) throw T('query içindeki i, 1..n arasında olmalı.', 'query\'s i must be within 1..n.'); return { query: qi }; }
          throw T('"' + tok + '" add(i,delta) ya da query(i) biçiminde olmalı.', '"' + tok + '" must look like add(i,delta) or query(i).');
        });
        if (!ops.length) throw T('En az bir işlem yazın.', 'Write at least one operation.');
        return { n: n, ops: ops };
      },
      format: function (d) { return 'n=' + d.n + ' ' + d.ops.map(function (o) { return o.add ? 'add(' + o.add.i + ',' + o.add.delta + ')' : 'query(' + o.query + ')'; }).join(' '); },
      bad: ['', 'n=0 add(1,1)', 'n=10 add(99,1)', 'n=10 foo(1,2)']
    },
    build: function (S, d) {
      var n = d.n, bit = new Array(n + 1).fill(0);
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: 'bit[] =', anchor: 'end', size: 15, bold: true });
      for (var i = 1; i <= n; i++) S.box('c' + i, { x: cellX(i), y: Y0, w: W - 6, h: H, text: '0', style: 'empty', size: 15, above: String(i) });
      S.label('decision', { x: X0, y: Y0 - 44, text: '', size: 16, bold: true, mono: true, anchor: 'start' });
      S.step(T('`bit[1..' + n + ']` sıfırlanmış olarak başlıyor. Her hücrenin üstünde indisi (`i`) yazıyor.',
               '`bit[1..' + n + ']` starts all zero. Each cell shows its index (`i`) above it.'), { c: [1], java: [1] });

      function decide(text) { S.set('decision', { text: text || '' }); }
      function lowbit(i) { return i & (-i); }

      var opCount = 0, detailedDone = false, queryResults = [];
      d.ops.forEach(function (op, oi) {
        S.at(oi);
        opCount++;
        var detailed = !detailedDone && opCount <= 2;
        if (detailed) detailedDone = opCount >= 2;
        if (op.add) {
          var i = op.add.i, delta = op.add.delta, steps = 0;
          while (i <= n) {
            steps++;
            var lb = lowbit(i), from = i - lb + 1;
            bit[i] += delta;
            S.set('c' + i, { text: String(bit[i]), style: 'new' });
            decide('i & -i = ' + lb + '  ->  next i = ' + (i + lb <= n ? (i + lb) : '(> n, stop)'));
            if (detailed) {
              if (!S.has('resp')) S.brace('resp', { from: 'c' + from, to: 'c' + i, text: '[' + from + ',' + i + ']', side: 'bottom', dist: 12, style: 'active' });
              else S.set('resp', { from: 'c' + from, to: 'c' + i });
              var updDetailLines = [{ n: 4, note: T('i <= n? evet', 'i <= n? yes') }, 5, 6];
              S.step(T('`update(' + op.add.i + ', ' + delta + ')` — `bit[' + i + ']` bu aralığın toplamını tutar: [' + from + ',' + i + ']. `' + delta + '` eklenir, sonra `i += i & -i`.',
                       '`update(' + op.add.i + ', ' + delta + ')` — `bit[' + i + ']` holds the sum of this range: [' + from + ',' + i + ']. Add `' + delta + '`, then `i += i & -i`.'), { c: updDetailLines, java: updDetailLines });
            }
            i = i + lb;
          }
          if (S.has('resp')) S.remove('resp');
          decide('');
          if (!detailed) {
            var updFastLines = [3, { n: 4, note: T('i <= n? hayır (bitti)', 'i <= n? no (done)') }, 5, 6, 7];
            S.step(T('`update(' + op.add.i + ', ' + delta + ')` — ' + steps + ' hücre güncellendi (`O(log n)`).', '`update(' + op.add.i + ', ' + delta + ')` — ' + steps + ' cells updated (`O(log n)`).'), { c: updFastLines, java: updFastLines });
          }
        } else {
          var qi = op.query, sum = 0, steps2 = 0, cells = [];
          var ii = qi;
          while (ii > 0) {
            steps2++;
            var lb2 = lowbit(ii), from2 = ii - lb2 + 1;
            sum += bit[ii];
            cells.push(ii);
            decide('sum += bit[' + ii + ']  ->  i -= i & -i = ' + (ii - lb2 > 0 ? (ii - lb2) : '0, stop'));
            if (detailed) {
              S.styleAll('normal', 'box');
              cells.forEach(function (c) { S.set('c' + c, { style: 'active' }); });
              if (!S.has('resp')) S.brace('resp', { from: 'c' + from2, to: 'c' + ii, text: '[' + from2 + ',' + ii + ']', side: 'bottom', dist: 12, style: 'hl' });
              else S.set('resp', { from: 'c' + from2, to: 'c' + ii });
              var qryDetailLines = [{ n: 12, note: T('i > 0? evet', 'i > 0? yes') }, 13, 14];
              S.step(T('`query(' + qi + ')` — `bit[' + ii + ']` [' + from2 + ',' + ii + '] aralığını toplar (şimdiye kadar toplam = ' + sum + '), sonra `i -= i & -i`.',
                       '`query(' + qi + ')` — `bit[' + ii + ']` sums the range [' + from2 + ',' + ii + '] (running total = ' + sum + '), then `i -= i & -i`.'), { c: qryDetailLines, java: qryDetailLines });
            }
            ii = ii - lb2;
          }
          queryResults.push(sum);
          S.styleAll('normal', 'box');
          for (var rc = 1; rc <= n; rc++) S.set('c' + rc, { style: 'normal' });
          if (S.has('resp')) S.remove('resp');
          decide('');
          var qryFastLines = [10, 11, { n: 12, note: T('i > 0? hayır' + (steps2 ? ' (bitti)' : ''), 'i > 0? no' + (steps2 ? ' (done)' : '')) }];
          if (steps2) qryFastLines.push(13, 14);
          qryFastLines.push(15, 16);
          S.step(T('`query(' + qi + ')` = **' + sum + '** — ' + steps2 + ' hücrenin toplamı, bunlar 1..' + qi + '\'i çakışmadan tam kaplar.',
                   '`query(' + qi + ')` = **' + sum + '** — the sum of ' + steps2 + ' cells that together cover 1..' + qi + ' with no overlap.'), { c: qryFastLines, java: qryFastLines });
        }
      });

      S.at(null);
      S.result = queryResults;
      S.step(T('Bitti: ' + d.ops.length + ' işlem. Her `update` ve her `query` en fazla `O(log n)` adım sürer — `i & -i`, ikilik (binary) tabanda en sağdaki 1 bitini yalıtan basit bir aritmetik hile.',
               'Done: ' + d.ops.length + ' operations. Every `update` and every `query` takes at most `O(log n)` steps — `i & -i` is a simple arithmetic trick that isolates the rightmost 1 bit in binary.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
