/* Week 6 — Fibonacci search: on a SORTED array, split the range using Fibonacci numbers instead of the middle
 * (like binary search) or a formula (like interpolation search). Uses only addition and subtraction — no
 * division, no multiplication — which mattered on very old hardware where those were expensive.
 * Drawing standard: one row "arr =" with index numbers above; the Fibonacci triple (fib, fib1, fib2) and offset are
 * shown and updated each step; the probed cell's comparison is on the right; a brace tracks the shrinking "still
 * possible" range. Examples (normal, hard, edge), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int fibonacci_search(const int arr[], int n, int target, int *comparisons) {',
    '    int fib2 = 0, fib1 = 1, fib = fib1 + fib2;      /* smallest Fibonacci number >= n */',
    '    while (fib < n) { fib2 = fib1; fib1 = fib; fib = fib1 + fib2; }',
    '    int offset = -1, comp = 0;',
    '    while (fib > 1) {',
    '        int i = (offset + fib2 < n - 1) ? offset + fib2 : n - 1;',
    '        comp++;',
    '        if (arr[i] < target) {                       /* eliminate the left part */',
    '            fib = fib1; fib1 = fib2; fib2 = fib - fib1;',
    '            offset = i;',
    '        } else if (arr[i] > target) {                /* eliminate the right part */',
    '            fib = fib2; fib1 = fib1 - fib2; fib2 = fib - fib1;',
    '        } else {',
    '            *comparisons = comp;',
    '            return i;',
    '        }',
    '    }',
    '    if (fib1 == 1 && offset + 1 < n) {                /* one element may be left over */',
    '        comp++;',
    '        if (arr[offset + 1] == target) { *comparisons = comp; return offset + 1; }',
    '    }',
    '    *comparisons = comp;',
    '    return -1;',
    '}'
  ];
  var JAVA = [
    'static int fibonacciSearch(int[] arr, int target) {',
    '    int n = arr.length;',
    '    int fib2 = 0, fib1 = 1, fib = fib1 + fib2;      // smallest Fibonacci number >= n',
    '    while (fib < n) { fib2 = fib1; fib1 = fib; fib = fib1 + fib2; }',
    '    int offset = -1;',
    '    comparisons = 0;',
    '    while (fib > 1) {',
    '        int i = (offset + fib2 < n - 1) ? offset + fib2 : n - 1;',
    '        comparisons++;',
    '        if (arr[i] < target) {                       // eliminate the left part',
    '            fib = fib1; fib1 = fib2; fib2 = fib - fib1;',
    '            offset = i;',
    '        } else if (arr[i] > target) {                // eliminate the right part',
    '            fib = fib2; fib1 = fib1 - fib2; fib2 = fib - fib1;',
    '        } else {',
    '            return i;',
    '        }',
    '    }',
    '    if (fib1 == 1 && offset + 1 < n) {                // one element may be left over',
    '        comparisons++;',
    '        if (arr[offset + 1] == target) return offset + 1;',
    '    }',
    '    return -1;',
    '}'
  ];

  function setBrace(S, id, p) { if (S.has(id)) S.set(id, p); else S.brace(id, p); }

  D.define({
    id: 'fibonacci-search',
    title: T('Fibonacci araması: aralığı Fibonacci sayılarıyla bölmek', 'Fibonacci search: splitting the range with Fibonacci numbers'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('16 değer, hedef ortalarda bulundu', '16 values, target found around the middle'),
        data: { arr: [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63], target: 39 } },
      { id: 'hard', level: 'hard', name: T('Hedef sona yakın, birkaç bölme adımı gerekir', 'Target near the end, needs several splits'),
        data: { arr: [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63], target: 59 } },
      { id: 'first-element', level: 'edge', name: T('Hedef ilk elemanda', 'Target is the first element'),
        data: { arr: [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63], target: 3 } },
      { id: 'beyond-end', level: 'edge', name: T('Hedef son elemandan da büyük', 'Target is larger than the last element'),
        data: { arr: [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63], target: 999 } },
      { id: 'not-present', level: 'edge', name: T('Hedef aralıkta ama dizide yok', 'Target is in range but not in the array'),
        data: { arr: [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63], target: 40 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.arr.length; },
    /** Independent computation: same algorithm, coded separately from build(). */
    reference: function (d) {
      var arr = d.arr, n = arr.length, target = d.target;
      var fib2 = 0, fib1 = 1, fib = fib1 + fib2;
      while (fib < n) { var t = fib1 + fib; fib2 = fib1; fib1 = fib; fib = t; }
      var offset = -1, comp = 0, index = -1, i;
      while (fib > 1) {
        i = (offset + fib2 < n - 1) ? offset + fib2 : n - 1;
        comp++;
        if (arr[i] < target) { fib = fib1; fib1 = fib2; fib2 = fib - fib1; offset = i; }
        else if (arr[i] > target) { fib = fib2; fib1 = fib1 - fib2; fib2 = fib - fib1; }
        else { index = i; break; }
      }
      if (index === -1 && fib1 === 1 && offset + 1 < n) {
        comp++;
        if (arr[offset + 1] === target) index = offset + 1;
      }
      return { index: index, comparisons: comp };
    },
    random: function (level, r) {
      var n = 16, span = level === 'extreme' ? 12 : (level === 'hard' ? 8 : 5);
      var arr = [], v = D.randInt(r, 0, 5), i;
      for (i = 0; i < n; i++) { arr.push(v); v += D.randInt(r, 1, span); }
      var pick = r(), target;
      if (pick < 0.15) target = arr[0];
      else if (pick < 0.3) target = arr[n - 1] + D.randInt(r, 1, 50);
      else if (pick < 0.7) target = arr[D.randInt(r, 0, n - 1)];
      else { var idx = D.randInt(r, 0, n - 2); target = arr[idx] + 1; }
      return { arr: arr, target: target };
    },
    input: {
      hint: T('Örnek: 3 7 11 15 19 23 27 31 35 39 43 47 51 55 59 63 target=39  (sıralı dizi, en çok 16 sayı)',
              'Example: 3 7 11 15 19 23 27 31 35 39 43 47 51 55 59 63 target=39  (sorted array, at most 16 numbers)'),
      parse: function (text) {
        var arr = [], target = null;
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^target[=:](-?\d+)$/i.exec(tok);
          if (m) { target = parseInt(m[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı ya da target=N yazın.', '"' + tok + '" is not understood: write a number or target=N.');
          arr.push(parseInt(tok, 10));
        });
        if (arr.length < 4) throw T('En az 4 sayı yazın.', 'Write at least 4 numbers.');
        if (arr.length > 16) throw T('En çok 16 sayı (bir satıra sığmalı).', 'At most 16 numbers (must fit on one row).');
        if (target === null) throw T('target=N yazmalısınız (aranan değer).', 'You must write target=N (the value to search for).');
        for (var i = 1; i < arr.length; i++) {
          if (arr[i] < arr[i - 1]) throw T('Dizi sıralı (artan ya da eşit) olmalı; Fibonacci araması sıralı bir diziye ihtiyaç duyar.',
                                            'The array must be sorted (non-decreasing); Fibonacci search requires a sorted array.');
        }
        return { arr: arr, target: target };
      },
      format: function (d) { return d.arr.join(' ') + ' target=' + d.target; },
      bad: ['', '1 2 3', '5 8 x 13 target=8', 'target=abc 5 8', '9 3 5 target=5', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 target=5'],
      tokens: function (d) { return d.arr.map(String); }
    },
    build: function (S, d) {
      var arr = d.arr, n = arr.length, target = d.target;
      var X0 = 90, Y0 = 210, W = 46, H = 40, GAP = 6;
      var RX = X0 + n * (W + GAP) + 44;

      arr.forEach(function (v, i) { S.box('h' + i, { x: X0 + i * (W + GAP), y: Y0, w: W, h: H, text: String(v), size: 15, above: String(i) }); });
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: T('dizi =', 'arr ='), anchor: 'end', size: 15, bold: true });
      S.label('tgt', { x: X0, y: 40, text: 'target = ' + target, size: 18, bold: true, mono: true });
      S.label('fibl', { x: X0, y: 64, text: '', style: 'dim', size: 14, mono: true, anchor: 'start' });
      S.label('cnt', { x: X0, y: 88, text: T('karşılaştırma: 0', 'comparisons: 0'), style: 'dim', size: 14 });
      S.label('dec', { x: RX, y: Y0 + H / 2 + 5, text: '', size: 18, bold: true, mono: true, anchor: 'start' });

      function setCnt(comp) { S.set('cnt', { text: T('karşılaştırma: ' + comp, 'comparisons: ' + comp) }); }
      function setFib(fib, fib1, fib2, offset) { S.set('fibl', { text: 'fib=' + fib + ', fib1=' + fib1 + ', fib2=' + fib2 + ', offset=' + offset }); }
      function setRange(lo, hi) {
        for (var q = 0; q < n; q++) S.set('h' + q, { style: (q < lo || q > hi) ? 'dim' : 'normal' });
        if (lo > 0) setBrace(S, 'elimL', { from: 'h0', to: 'h' + (lo - 1), text: T('elendi', 'eliminated'), side: 'bottom', dist: 14, style: 'dim' });
        else if (S.has('elimL')) S.remove('elimL');
        if (hi < n - 1) setBrace(S, 'elimR', { from: 'h' + (hi + 1), to: 'h' + (n - 1), text: T('elendi', 'eliminated'), side: 'bottom', dist: 14, style: 'dim' });
        else if (S.has('elimR')) S.remove('elimR');
        if (lo <= hi) setBrace(S, 'poss', { from: 'h' + lo, to: 'h' + hi, text: T('olası [' + lo + '..' + hi + ']', 'still possible [' + lo + '..' + hi + ']'), side: 'bottom', dist: 14, style: 'active' });
        else if (S.has('poss')) S.remove('poss');
      }

      var fib2 = 0, fib1 = 1, fib = fib1 + fib2;
      while (fib < n) { var t0 = fib1 + fib; fib2 = fib1; fib1 = fib; fib = t0; }
      setFib(fib, fib1, fib2, -1);
      S.step(T('`n = ' + n + '` elemanlık **sıralı** bir dizide `target = ' + target + '`\'i arıyoruz. Önce `n`\'e eşit ya da büyük en küçük Fibonacci sayısını buluruz: `fib = ' + fib + '` (`fib1 = ' + fib1 + '`, `fib2 = ' + fib2 + '`).',
               'We search for `target = ' + target + '` in a **sorted** array of `n = ' + n + '` elements. First we find the smallest Fibonacci number >= `n`: `fib = ' + fib + '` (`fib1 = ' + fib1 + '`, `fib2 = ' + fib2 + '`).'),
             { c: [1, 2, 3], java: [1, 2, 3, 4] });

      /* Line positions: C has one combined `offset=-1, comp=0;` entry line that Java splits into two,
         so C and Java positions diverge inside the main loop -- tracked separately. */
      var FC = { icalc: 6, inc: 7, ltchk: 8, gtchk: 11, elsehit: 13 };
      var FJ = { icalc: 8, inc: 9, ltchk: 10, gtchk: 13, elsehit: 15 };
      function branchLines(firstIter, outcome, icalcInBounds) {
        /* outcome: 'found' | 'less' | 'greater'. The split-point line (icalc) is shown in the dedicated
           "first" step for iteration 0 (see below) -- only NON-first iterations need it repeated here,
           since they have no separate callout step of their own. */
        var c = [], j = [];
        var icalcNote = icalcInBounds ? T('offset+fib2<n-1? evet', 'offset+fib2<n-1? yes') : T('offset+fib2<n-1? hayır', 'offset+fib2<n-1? no');
        if (!firstIter) { c.push({ n: FC.icalc, note: icalcNote }); j.push({ n: FJ.icalc, note: icalcNote }); }
        c.push(FC.inc); j.push(FJ.inc);
        if (outcome === 'less') {
          c.push({ n: FC.ltchk, note: T('küçük mü? evet', 'less? yes') }); j.push({ n: FJ.ltchk, note: T('küçük mü? evet', 'less? yes') });
          return { c: c, java: j };
        }
        c.push({ n: FC.ltchk, note: T('küçük mü? hayır', 'less? no') }); j.push({ n: FJ.ltchk, note: T('küçük mü? hayır', 'less? no') });
        if (outcome === 'greater') {
          c.push({ n: FC.gtchk, note: T('büyük mü? evet', 'greater? yes') }); j.push({ n: FJ.gtchk, note: T('büyük mü? evet', 'greater? yes') });
          return { c: c, java: j };
        }
        c.push({ n: FC.gtchk, note: T('büyük mü? hayır', 'greater? no') }, FC.elsehit);
        j.push({ n: FJ.gtchk, note: T('büyük mü? hayır', 'greater? no') }, FJ.elsehit);
        return { c: c, java: j };
      }

      var offset = -1, comp = 0, index = -1, first = true;
      while (fib > 1) {
        var lo = offset + 1, hi = Math.min(offset + fib, n - 1);
        setRange(lo, hi);
        var icalcInBounds = offset + fib2 < n - 1;
        var i = icalcInBounds ? offset + fib2 : n - 1;
        var wasFirst = first;
        comp++;
        S.set('h' + i, { style: 'hl' });
        setCnt(comp);
        S.at(i);
        if (first) {
          S.step(T('Bölme noktası: `i = offset + fib2 = ' + offset + ' + ' + fib2 + ' = ' + i + '` (dizi sonunu aşarsa `n - 1`\'e sabitlenir).',
                   'The split point: `i = offset + fib2 = ' + offset + ' + ' + fib2 + ' = ' + i + '` (clamped to `n - 1` if it would overshoot).'),
                 { c: [{ n: 6, note: icalcInBounds ? T('offset+fib2<n-1? evet', 'offset+fib2<n-1? yes') : T('offset+fib2<n-1? hayır', 'offset+fib2<n-1? no') }],
                   java: [{ n: 8, note: icalcInBounds ? T('offset+fib2<n-1? evet', 'offset+fib2<n-1? yes') : T('offset+fib2<n-1? hayır', 'offset+fib2<n-1? no') }] });
          first = false;
        }
        var v = arr[i];
        if (v === target) {
          index = i;
          S.set('h' + i, { style: 'new' });
          S.set('dec', { text: '= ' + target + ' found', style: 'new' });
          var bl = branchLines(wasFirst, 'found', icalcInBounds);
          S.step(T('`arr[' + i + '] == ' + target + '`? Evet — ' + comp + '. karşılaştırmada bulundu.',
                   '`arr[' + i + '] == ' + target + '`? Yes — found on comparison ' + comp + '.'), bl);
          break;
        } else if (v < target) {
          S.set('h' + i, { style: 'hl' });
          S.set('dec', { text: '< ' + target, style: 'hl' });
          fib = fib1; fib1 = fib2; fib2 = fib - fib1;
          offset = i;
          setFib(fib, fib1, fib2, offset);
          var ll = branchLines(wasFirst, 'less', icalcInBounds);
          S.step(T('`arr[' + i + '] = ' + v + ' < ' + target + '` — sol tarafı (`0..' + i + '`) eleriz; Fibonacci üçlüsü bir basamak küçülür.',
                   '`arr[' + i + '] = ' + v + ' < ' + target + '` — we eliminate the left side (`0..' + i + '`); the Fibonacci triple shrinks by one step.'),
                 ll);
        } else {
          S.set('h' + i, { style: 'hl' });
          S.set('dec', { text: '> ' + target, style: 'hl' });
          fib = fib2; fib1 = fib1 - fib2; fib2 = fib - fib1;
          setFib(fib, fib1, fib2, offset);
          var gl = branchLines(wasFirst, 'greater', icalcInBounds);
          S.step(T('`arr[' + i + '] = ' + v + ' > ' + target + '` — sağ tarafı eleriz; Fibonacci üçlüsü iki basamak küçülür.',
                   '`arr[' + i + '] = ' + v + ' > ' + target + '` — we eliminate the right side; the Fibonacci triple shrinks by two steps.'),
                 gl);
        }
      }
      if (index === -1 && fib1 === 1 && offset + 1 < n) {
        comp++;
        var last = offset + 1;
        S.set('h' + last, { style: 'hl' });
        setCnt(comp);
        S.at(last);
        if (arr[last] === target) {
          index = last;
          S.set('h' + last, { style: 'new' });
          S.set('dec', { text: '= ' + target + ' found', style: 'new' });
          S.step(T('Tek eleman kaldı: `arr[' + last + '] == ' + target + '`? Evet — bulundu.',
                   'One element is left over: `arr[' + last + '] == ' + target + '`? Yes — found.'),
                 { c: [{ n: 18, note: T('fib1==1 && offset+1<n? evet', 'fib1==1 && offset+1<n? yes') }, 19, { n: 20, note: T('arr[offset+1]==target? evet', 'arr[offset+1]==target? yes') }],
                   java: [{ n: 19, note: T('fib1==1 && offset+1<n? evet', 'fib1==1 && offset+1<n? yes') }, 20, { n: 21, note: T('arr[offset+1]==target? evet', 'arr[offset+1]==target? yes') }] });
        } else {
          S.set('h' + last, { style: 'del' });
          S.set('dec', { text: T('bulunamadı', 'not found'), style: 'del' });
          S.step(T('Tek eleman kaldı: `arr[' + last + '] = ' + arr[last] + ' != ' + target + '` — bulunamadı.',
                   'One element is left over: `arr[' + last + '] = ' + arr[last] + ' != ' + target + '` — not found.'),
                 { c: [{ n: 18, note: T('fib1==1 && offset+1<n? evet', 'fib1==1 && offset+1<n? yes') }, 19, { n: 20, note: T('arr[offset+1]==target? hayır', 'arr[offset+1]==target? no') }],
                   java: [{ n: 19, note: T('fib1==1 && offset+1<n? evet', 'fib1==1 && offset+1<n? yes') }, 20, { n: 21, note: T('arr[offset+1]==target? hayır', 'arr[offset+1]==target? no') }] });
        }
      }
      S.at(null);
      S.result = { index: index, comparisons: comp };
      if (index === -1) {
        if (!S.has('dec') || true) S.set('dec', { text: T('bulunamadı', 'not found'), style: 'del' });
        S.step(T('Bulunamadı: ' + target + ' dizide yok. Toplam ' + comp + ' karşılaştırma. Fibonacci araması yalnız toplama/çıkarma kullanır — çarpma ya da bölme yok.',
                 'Not found: ' + target + ' is not in the array. ' + comp + ' comparisons in total. Fibonacci search uses only addition/subtraction — no multiplication or division.'));
      } else {
        S.step(T('Sonuç: `arr[' + index + '] = ' + target + '`, ' + comp + ' karşılaştırmada bulundu. Fibonacci araması yalnız toplama/çıkarma kullanır — çarpma ya da bölme yok.',
                 'Result: `arr[' + index + '] = ' + target + '`, found in ' + comp + ' comparisons. Fibonacci search uses only addition/subtraction — no multiplication or division.'));
      }
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
