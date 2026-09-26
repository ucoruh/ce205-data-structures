/* Week 1 — nested loop counting: count exactly how many times an inner loop body runs to build T(n).
 * Three loop shapes: square (j < n), triangle (j < i), halving (j *= 2).
 * Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var CODE = {
    square: {
      c: ['long t_square(int n, long *operations) {', '    long count = 0;', '    for (int i = 0; i < n; i++) {',
          '        for (int j = 0; j < n; j++) {', '            count++;', '            (*operations)++;',
          '        }', '    }', '    return count;', '}'],
      java: ['static long tSquare(int n) {', '    operations = 0;', '    long count = 0;', '    for (int i = 0; i < n; i++) {',
             '        for (int j = 0; j < n; j++) {', '            count++;', '            operations++;',
             '        }', '    }', '    return count;', '}']
    },
    triangle: {
      c: ['long t_triangle(int n, long *operations) {', '    long count = 0;', '    for (int i = 0; i < n; i++) {',
          '        for (int j = 0; j < i; j++) {', '            count++;', '            (*operations)++;',
          '        }', '    }', '    return count;', '}'],
      java: ['static long tTriangle(int n) {', '    operations = 0;', '    long count = 0;', '    for (int i = 0; i < n; i++) {',
             '        for (int j = 0; j < i; j++) {', '            count++;', '            operations++;',
             '        }', '    }', '    return count;', '}']
    },
    halving: {
      c: ['long t_halving(int n, long *operations) {', '    long count = 0;', '    for (int i = 0; i < n; i++) {',
          '        for (int j = 1; j < n; j *= 2) {', '            count++;', '            (*operations)++;',
          '        }', '    }', '    return count;', '}'],
      java: ['static long tHalving(int n) {', '    operations = 0;', '    long count = 0;', '    for (int i = 0; i < n; i++) {',
             '        for (int j = 1; j < n; j *= 2) {', '            count++;', '            operations++;',
             '        }', '    }', '    return count;', '}']
    }
  };
  var SHAPE_NAME = { square: T('kare (j < n)', 'square (j < n)'), triangle: T('üçgen (j < i)', 'triangle (j < i)'), halving: T('yarılama (j *= 2)', 'halving (j *= 2)') };
  var FORMULA_TXT = { square: 'n²', triangle: 'n·(n-1)/2', halving: 'n·⌈log₂n⌉' };

  /** Every (i, j) the loop body visits for shape/n, plus a display column for layout. */
  function cellsOf(shape, n) {
    var cells = [], i, j, col;
    for (i = 0; i < n; i++) {
      if (shape === 'square') {
        for (j = 0; j < n; j++) cells.push({ i: i, col: j, j: j });
      } else if (shape === 'triangle') {
        for (j = 0; j < i; j++) cells.push({ i: i, col: j, j: j });
      } else {
        col = 0;
        for (j = 1; j < n; j *= 2) { cells.push({ i: i, col: col, j: j }); col++; }
      }
    }
    return cells;
  }
  /** T(n) computed directly (used by build for the "fast" n values, written independently of reference()). */
  function closedForm(shape, n) {
    if (shape === 'square') return n * n;
    if (shape === 'triangle') return n * (n - 1) / 2;
    var k = 0, m = n - 1;
    while (m > 0) { m = Math.floor(m / 2); k++; }
    return n * k;
  }

  D.define({
    id: 'nested-loop-counting',
    title: T('İç içe döngüyü sayarak T(n) oluşturmak', 'Counting a nested loop to build T(n)'),
    code: function (d) { return CODE[(d && d.shape) || 'square']; },
    presets: [
      { id: 'normal', level: 'normal', name: T('Kare döngü, n = 3 ayrıntılı, sonra 9 n değeri daha', 'Square loop, n = 3 in detail, then 9 more n values'),
        data: { shape: 'square', ns: [3, 4, 5, 6, 8, 10, 12, 16, 20, 25] } },
      { id: 'hard', level: 'hard', name: T('Üçgen döngü, n = 4 ayrıntılı, sonra 10 n değeri daha', 'Triangle loop, n = 4 in detail, then 10 more n values'),
        data: { shape: 'triangle', ns: [4, 5, 6, 8, 10, 14, 18, 24, 32, 40, 50] } },
      { id: 'halving-zero', level: 'edge', name: T('Yarılama döngüsü, n = 1: sıfır çalıştırma', 'Halving loop, n = 1: zero executions'),
        data: { shape: 'halving', ns: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512] } },
      { id: 'square-fib', level: 'edge', name: T('Kare döngü, n = 2 ayrıntılı, Fibonacci artışlı n değerleri', 'Square loop, n = 2 in detail, Fibonacci-spaced n values'),
        data: { shape: 'square', ns: [2, 3, 5, 8, 13, 21, 34, 55, 89, 144] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.ns.length; },
    /** Independent closed forms: n^2, n(n-1)/2, and n * ceil(log2 n) — the log2 count via its own
     *  right-shift bit-counting loop (different code from build's j *= 2 doubling loop). */
    reference: function (d) {
      var perN = d.ns.map(function (n) {
        if (d.shape === 'square') return n * n;
        if (d.shape === 'triangle') return n * (n - 1) / 2;
        var inner = 0, m = n - 1;
        while (m > 0) { m = m >>> 1; inner++; }
        return n * inner;
      });
      return { perN: perN, total: perN.reduce(function (a, b) { return a + b; }, 0) };
    },
    random: function (level, r) {
      var shapes = ['square', 'triangle', 'halving'];
      var shape = shapes[D.randInt(r, 0, 2)];
      var firstMax = shape === 'square' ? 4 : (shape === 'triangle' ? 5 : 6);
      var count = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level];
      var cap = { easy: 30, normal: 60, hard: 150, extreme: 400 }[level];
      var ns = [D.randInt(r, 1, firstMax)], v = ns[0], i, step;
      for (i = 1; i < count; i++) {
        step = Math.max(1, Math.floor((cap - v) / Math.max(1, count - i)) + D.randInt(r, 0, 3));
        v = v + step;
        if (v > cap) v = cap;
        if (v <= ns[ns.length - 1]) v = ns[ns.length - 1] + 1;
        ns.push(v);
      }
      return { shape: shape, ns: ns };
    },
    input: {
      hint: T('Örnek: shape=square 3 4 5 6 8 10 12 16 20 25  (shape=square/triangle/halving, sonra n değerleri, ilk n ≤ 8)',
              'Example: shape=square 3 4 5 6 8 10 12 16 20 25  (shape=square/triangle/halving, then n values, first n ≤ 8)'),
      parse: function (text) {
        var shape = null, ns = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^shape[=:](square|triangle|halving)$/i.exec(tok);
          if (m) { shape = m[1].toLowerCase(); return; }
          if (!/^\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: pozitif tamsayı ya da shape=square/triangle/halving yazın.', '"' + tok + '" is not understood: write a positive integer or shape=square/triangle/halving.');
          var v = parseInt(tok, 10);
          if (v < 1) throw T('n değerleri en az 1 olmalı.', 'n values must be at least 1.');
          ns.push(v);
        });
        if (!shape) throw T('shape=square, shape=triangle ya da shape=halving yazmalısınız.', 'You must write shape=square, shape=triangle or shape=halving.');
        if (!ns.length) throw T('En az bir n değeri yazın.', 'Write at least one n value.');
        if (ns.length > 30) throw T('En çok 30 n değeri.', 'At most 30 n values.');
        if (ns[0] > 8) throw T('İlk n değeri en çok 8 olmalı (ayrıntılı gösterim için).', 'The first n value must be at most 8 (so the detailed view stays readable).');
        return { shape: shape, ns: ns };
      },
      format: function (d) { return 'shape=' + d.shape + ' ' + d.ns.join(' '); },
      bad: ['', 'shape=square', 'shape=hexagon 3 4 5', 'shape=square 3 x 5', 'shape=square 20 4 5 6 7 8 9 10'],
      tokens: function (d) { return d.ns.map(String); }
    },
    build: function (S, d) {
      var shape = d.shape, ns = d.ns, n0 = ns[0];
      var W = 40, H = 36, GAP = 6, X0 = 90, Y0 = 100;
      var cells = cellsOf(shape, n0);
      var maxCol = cells.length ? Math.max.apply(null, cells.map(function (c) { return c.col; })) : -1;
      for (var ci = 0; ci < n0; ci++) {
        S.label('ri' + ci, { x: X0 - 34, y: Y0 + ci * (H + GAP) + H / 2 + 5, text: 'i=' + ci, style: 'dim', size: 12, mono: true });
      }
      for (var cj = 0; cj <= maxCol; cj++) {
        S.label('cj' + cj, { x: X0 + cj * (W + GAP) + W / 2, y: Y0 - 10, text: 'j=' + cj, style: 'dim', size: 11, mono: true });
      }
      cells.forEach(function (c) {
        var x = X0 + c.col * (W + GAP), y = Y0 + c.i * (H + GAP);
        S.box('g' + c.i + '_' + c.col, { x: x, y: y, w: W, h: H, text: '', style: 'empty', size: 13 });
      });
      S.label('title', { x: 420, y: 34, text: 'n = ' + n0 + '  (' + SHAPE_NAME[shape].en + ')', size: 18, bold: true, mono: true });
      S.label('cnt', { x: 420, y: 60, text: T('çalıştırma: 0', 'operations: 0'), size: 14, mono: true });
      S.at(0);
      S.step(T('İç döngünün gövdesinin şekil "' + SHAPE_NAME[shape].tr + '" için `n = ' + n0 + '`\'de tam olarak kaç kez çalıştığını sayacağız: her `(i, j)` çifti bir çalıştırma.',
               'We will count exactly how many times the inner loop body runs for the "' + SHAPE_NAME[shape].en + '" shape at `n = ' + n0 + '`: one run per `(i, j)` pair.'),
             { c: [3, 4], java: [4, 5] });
      var op = 0;
      if (!cells.length) {
        S.step(T('`n = ' + n0 + '` için iç döngünün koşulu (`j < ' + n0 + '`, `j = 1`\'den başlar) daha ilk turda yanlış: iç gövde hiç çalışmaz.',
                 'For `n = ' + n0 + '` the inner loop\'s condition (`j < ' + n0 + '`, starting at `j = 1`) is already false on the very first try: the inner body never runs.'),
               { c: [4], java: [5] });
      }
      cells.forEach(function (c) {
        op++;
        S.set('g' + c.i + '_' + c.col, { text: String(op), style: 'new' });
        S.set('cnt', { text: T('çalıştırma: ' + op, 'operations: ' + op) });
        S.step(T('`i = ' + c.i + ', j = ' + c.j + '` — iç gövde çalışır: `count++`. Bu ' + op + '. çalıştırma.',
                 '`i = ' + c.i + ', j = ' + c.j + '` — the inner body runs: `count++`. This is operation ' + op + '.'),
               { c: [5, 6], java: [6, 7] });
      });
      cells.forEach(function (c) { S.set('g' + c.i + '_' + c.col, { style: 'normal' }); });
      var results = [op];
      S.step(T('`n = ' + n0 + '` için iç gövde tam olarak ' + op + ' kez çalıştı — kapalı form: `T(' + n0 + ') = ' + FORMULA_TXT[shape] + ' = ' + op + '`.',
               'For `n = ' + n0 + '` the inner body ran exactly ' + op + ' times — closed form: `T(' + n0 + ') = ' + FORMULA_TXT[shape] + ' = ' + op + '`.'),
             { c: [9], java: [10] });
      S.label('hist0', { x: 640, y: 90, text: 'T(' + n0 + ') = ' + op, size: 13, mono: true, style: 'dim' });
      ns.slice(1).forEach(function (n, idx) {
        S.at(idx + 1);
        var t = closedForm(shape, n);
        results.push(t);
        S.label('hist' + (idx + 1), { x: 640, y: 90 + (idx + 1) * 22, text: 'T(' + n + ') = ' + t, size: 13, mono: true,
                                       style: idx === ns.length - 2 ? 'hl' : 'normal' });
        S.set('title', { text: 'n = ' + n + '  (' + SHAPE_NAME[shape].en + ')' });
        S.step(T('Artık her `(i, j)` çiftini tek tek saymıyoruz — kapalı formu doğrudan uyguluyoruz: `n = ' + n + '` için `T(' + n + ') = ' + FORMULA_TXT[shape] + ' = ' + t + '`.',
                 'We no longer count every `(i, j)` pair one by one — we apply the closed form directly: for `n = ' + n + '`, `T(' + n + ') = ' + FORMULA_TXT[shape] + ' = ' + t + '`.'),
               { c: [3, 4, 9], java: [4, 5, 10] });
      });
      S.at(null);
      S.result = { perN: results, total: results.reduce(function (a, b) { return a + b; }, 0) };
      var big = FORMULA_TXT[shape] === 'n²' ? 'O(n²)' : (FORMULA_TXT[shape] === 'n·(n-1)/2' ? 'O(n²)' : 'O(n·log n)');
      S.step(T('Sabitleri ve düşük dereceli terimleri atınca geriye `' + FORMULA_TXT[shape] + '`\'in en büyük terimi kalır: karmaşıklık (complexity) **' + big + '**. Bu, saymanın 3.7. bölümdeki kuralın ta kendisi.',
               'Dropping the constants and the lower-order terms leaves the dominant term of `' + FORMULA_TXT[shape] + '`: complexity **' + big + '**. This is exactly the rule from Section 3.7, arrived at by counting.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
