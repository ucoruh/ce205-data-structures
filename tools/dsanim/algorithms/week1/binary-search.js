/* Week 1 — binary search: repeatedly halve the search range on a SORTED array.
 * Drawing standard: each comparison is its own row (S.snapshot freezes it in place before the next one), with
 * "eliminated" / "still possible [lo..hi]" braces under the row and the decision (< / > / = found) to its right —
 * exactly like the instructor's step-by-step board drawing.
 * Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int binary_search(const int arr[], int n, int target, int *comparisons) {',
    '    int lo = 0, hi = n - 1;',
    '    while (lo <= hi) {',
    '        int mid = lo + (hi - lo) / 2;',
    '        (*comparisons)++;',
    '        if (arr[mid] == target)',
    '            return mid;',
    '        if (arr[mid] < target)',
    '            lo = mid + 1;',
    '        else',
    '            hi = mid - 1;',
    '    }',
    '    return -1;',
    '}'
  ];
  var JAVA = [
    'static int binarySearch(int[] arr, int target) {',
    '    comparisons = 0;',
    '    int lo = 0, hi = arr.length - 1;',
    '    while (lo <= hi) {',
    '        int mid = lo + (hi - lo) / 2;',
    '        comparisons++;',
    '        if (arr[mid] == target)',
    '            return mid;',
    '        if (arr[mid] < target)',
    '            lo = mid + 1;',
    '        else',
    '            hi = mid - 1;',
    '    }',
    '    return -1;',
    '}'
  ];
  var W = 46, H = 40, GAP = 6, ROW = 16;
  // ROWH: spacing between wrapped sub-rows of the SAME generation — tall enough for a bottom brace (dist 14 +
  // tip 12 + text ~17) under one sub-row and a 'top' pointer (dist up to 50) above the next sub-row.
  var ROWH = 160;

  function point(S, id, target, text, dist) {
    if (S.has(id)) S.set(id, { target: target }); else S.pointer(id, { target: target, text: text, side: 'top', dist: dist });
  }
  function setBrace(S, id, p) { if (S.has(id)) S.set(id, p); else S.brace(id, p); }

  D.define({
    id: 'binary-search',
    title: T('İkili arama (binary search): aralığı yarıya indirmek', 'Binary search: halving the range'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('16 değer, hedef bulundu', '16 values, target found'),
        data: { arr: [3, 7, 11, 15, 19, 23, 29, 34, 41, 47, 53, 60, 68, 75, 83, 90], target: 47 } },
      { id: 'hard', level: 'hard', name: T('31 değer, bulunamadı: sonunda lo > hi', '31 values, not found: lo > hi at the end'),
        data: { arr: [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78, 82, 86, 90, 94, 98, 102, 106, 110, 114, 118, 122], target: 5 } },
      { id: 'smaller-than-all', level: 'edge', name: T('Hedef en küçükten de küçük', 'Target is smaller than every value'),
        data: { arr: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], target: 1 } },
      { id: 'larger-than-all', level: 'edge', name: T('Hedef en büyükten de büyük', 'Target is larger than every value'),
        data: { arr: [15, 25, 35, 45, 55, 65, 75, 85, 95, 105], target: 999 } },
      { id: 'duplicates', level: 'edge', name: T('Tekrarlı değerler arasında arama', 'Searching among duplicate values'),
        data: { arr: [5, 5, 5, 10, 15, 20, 20, 25, 30, 35], target: 20 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.arr.length; },
    /** Independent iterative binary search using the taught formula mid = lo + (hi - lo) / 2. */
    reference: function (d) {
      var arr = d.arr, target = d.target, lo = 0, hi = arr.length - 1, steps = 0, index = -1, probes = [];
      while (lo <= hi) {
        var mid = lo + Math.floor((hi - lo) / 2);
        probes.push(mid);
        steps++;
        if (arr[mid] === target) { index = mid; break; }
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
      }
      return { index: index, steps: steps, probes: probes };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 14, hard: 24, extreme: 33 }[level];
      var span = level === 'extreme' ? 40 : 9;
      var arr = [], v = D.randInt(r, 0, 5), i;
      for (i = 0; i < n; i++) { arr.push(v); v += D.randInt(r, 0, span); }
      var pick = r(), target;
      if (pick < 0.15) target = arr[0] - D.randInt(r, 1, 50);
      else if (pick < 0.3) target = arr[n - 1] + D.randInt(r, 1, 50);
      else if (pick < 0.65) target = arr[D.randInt(r, 0, n - 1)];
      else target = arr[D.randInt(r, 0, n - 1)] + 1;
      return { arr: arr, target: target };
    },
    input: {
      hint: T('Örnek: 3 7 11 15 19 23 29 34 target=19  (sayılar SIRALI dizi, target=N aranan değer)',
              'Example: 3 7 11 15 19 23 29 34 target=19  (numbers are a SORTED array, target=N is the value to find)'),
      parse: function (text) {
        var arr = [], target = null;
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^target[=:](-?\d+)$/i.exec(tok);
          if (m) { target = parseInt(m[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı ya da target=N yazın.', '"' + tok + '" is not understood: write a number or target=N.');
          arr.push(parseInt(tok, 10));
        });
        if (!arr.length) throw T('En az bir sayı yazın.', 'Write at least one number.');
        if (arr.length > 40) throw T('En çok 40 sayı.', 'At most 40 numbers.');
        if (target === null) throw T('target=N yazmalısınız (aranan değer).', 'You must write target=N (the value to search for).');
        for (var i = 1; i < arr.length; i++) {
          if (arr[i] < arr[i - 1]) throw T('Dizi sıralı (artan ya da eşit) olmalı; ikili arama sıralı bir diziye ihtiyaç duyar.',
                                            'The array must be sorted (non-decreasing); binary search requires a sorted array.');
        }
        return { arr: arr, target: target };
      },
      format: function (d) { return d.arr.join(' ') + ' target=' + d.target; },
      bad: ['', '9 3 5 target=5', '5 8 13', '5 8 x 13 target=8', 'target=abc 5 8'],
      tokens: function (d) { return d.arr.map(String); }
    },
    build: function (S, d) {
      var arr = d.arr, target = d.target, n = arr.length;
      var X0 = 90, Y0 = 160; // Y0 leaves room above h0 for the lo pointer (dist 50) clear of the tgt/cnt labels at y=40/66
      var rowsPerGen = Math.ceil(n / ROW);
      var GENGAP = rowsPerGen * ROWH + 90;
      var RX = X0 + Math.min(n, ROW) * (W + GAP) + 44;

      function placeRow(y0) {
        arr.forEach(function (v, i) {
          var col = i % ROW, row = Math.floor(i / ROW);
          var x = X0 + col * (W + GAP), y = y0 + row * ROWH;
          S.box('h' + i, { x: x, y: y, w: W, h: H, text: String(v), size: 15, above: String(i) });
        });
      }
      function moveRow(y0) {
        arr.forEach(function (v, i) {
          var col = i % ROW, row = Math.floor(i / ROW);
          S.move('h' + i, X0 + col * (W + GAP), y0 + row * ROWH);
        });
        S.move('rowlbl', null, y0 + H / 2 + 5);
        S.move('dec', null, y0 + H / 2 + 5);
      }
      function setRowStyles(lo, hi) {
        for (var q = 0; q < n; q++) S.set('h' + q, { style: (q < lo || q > hi) ? 'dim' : 'normal' });
      }
      function setBraces(lo, hi) {
        if (lo > 0) setBrace(S, 'elimL', { from: 'h0', to: 'h' + (lo - 1), text: T('elendi', 'eliminated'), side: 'bottom', dist: 14, style: 'dim' });
        else if (S.has('elimL')) S.remove('elimL');
        if (hi < n - 1) setBrace(S, 'elimR', { from: 'h' + (hi + 1), to: 'h' + (n - 1), text: T('elendi', 'eliminated'), side: 'bottom', dist: 14, style: 'dim' });
        else if (S.has('elimR')) S.remove('elimR');
        if (lo <= hi) setBrace(S, 'poss', { from: 'h' + lo, to: 'h' + hi, text: T('olası [' + lo + '..' + hi + ']', 'still possible [' + lo + '..' + hi + ']'), side: 'bottom', dist: 14, style: 'active' });
        else if (S.has('poss')) S.remove('poss');
      }
      function freezeGen(gen) {
        var ids = [];
        for (var q = 0; q < n; q++) ids.push('h' + q);
        ids.push('rowlbl', 'dec');
        ['lop', 'hip', 'mp', 'elimL', 'elimR', 'poss'].forEach(function (id) { if (S.has(id)) ids.push(id); });
        S.snapshot('hist' + gen + '_', ids, 0, 0);
      }

      placeRow(Y0);
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: T('dizi =', 'arr ='), anchor: 'end', size: 15, bold: true });
      S.label('dec', { x: RX, y: Y0 + H / 2 + 5, text: '', size: 18, bold: true, mono: true, anchor: 'start' });
      S.label('tgt', { x: X0, y: 40, text: 'target = ' + target, size: 18, bold: true, mono: true });
      S.label('cnt', { x: X0, y: 66, text: T('karşılaştırma: 0', 'comparisons: 0'), style: 'dim', size: 14 });
      S.step(T('Dizi **sıralı**, bu yüzden akıllı olabiliriz: ortaya bakıp yarısını eleyebiliriz. `target = ' + target + '`\'i arıyoruz. Her karşılaştırma kendi satırında kalıcı olarak görünür kalır.',
               'The array is **sorted**, so we can be smart: check the middle and eliminate half. We are looking for `target = ' + target + '`. Each comparison stays visible as its own permanent row.'),
             { c: [1, 2], java: [2, 3] });

      var lo = 0, hi = n - 1, steps = 0, index = -1, probes = [], gen = 0, first = true;
      while (lo <= hi) {
        setRowStyles(lo, hi);
        setBraces(lo, hi);
        var mid = lo + Math.floor((hi - lo) / 2);
        probes.push(mid);
        steps++;
        point(S, 'lop', 'h' + lo, 'lo', 50);
        point(S, 'hip', 'h' + hi, 'hi', 50);
        point(S, 'mp', 'h' + mid, 'mid', 22);
        S.set('cnt', { text: T('karşılaştırma: ' + steps, 'comparisons: ' + steps) });
        S.at(mid);
        if (first) {
          S.step(T('`mid = lo + (hi - lo) / 2 = ' + mid + '`. Ortadaki kutuya bakıyoruz.',
                   '`mid = lo + (hi - lo) / 2 = ' + mid + '`. We check the middle box.'), { c: [4], java: [5] });
          first = false;
        }
        var v = arr[mid];
        if (v === target) {
          index = mid;
          S.set('h' + mid, { style: 'new' });
          S.set('dec', { text: T('= ' + target + ' bulundu', '= ' + target + ' found'), style: 'new' });
          S.step(T('`arr[' + mid + '] == ' + target + '`? Evet — ' + steps + '. karşılaştırmada bulundu.',
                   '`arr[' + mid + '] == ' + target + '`? Yes — found on comparison ' + steps + '.'), { c: [5, 6, 7], java: [6, 7, 8] });
          S.remove('lop'); S.remove('hip'); S.remove('mp');
          break;
        } else if (v < target) {
          S.set('h' + mid, { style: 'hl' });
          S.set('dec', { text: '< ' + target, style: 'hl' });
          S.step(T('`arr[' + mid + '] = ' + v + ' < ' + target + '` — ' + target + ' varsa sağ yarıda olmalı. Sol yarıyı (indeks ' + lo + '-' + mid + ') eleriz.',
                   '`arr[' + mid + '] = ' + v + ' < ' + target + '` — if ' + target + ' is here, it must be in the right half. We discard the left half (indices ' + lo + '-' + mid + ').'),
                 { c: [5, 8, 9], java: [6, 9, 10] });
          freezeGen(gen);
          lo = mid + 1;
          gen++;
          if (lo <= hi) moveRow(Y0 + gen * GENGAP);
        } else {
          S.set('h' + mid, { style: 'hl' });
          S.set('dec', { text: '> ' + target, style: 'hl' });
          S.step(T('`arr[' + mid + '] = ' + v + ' > ' + target + '` — sağ yarıyı eleriz.',
                   '`arr[' + mid + '] = ' + v + ' > ' + target + '` — we discard the right half.'), { c: [5, 8, 10, 11], java: [6, 9, 11, 12] });
          freezeGen(gen);
          hi = mid - 1;
          gen++;
          if (lo <= hi) moveRow(Y0 + gen * GENGAP);
        }
      }
      S.at(null);
      S.result = { index: index, steps: steps, probes: probes };
      if (index === -1) {
        for (var q2 = 0; q2 < n; q2++) S.set('h' + q2, { style: 'dim' });
        if (S.has('poss')) S.remove('poss');
        setBrace(S, 'elimL', { from: 'h0', to: 'h' + (n - 1), text: T('elendi', 'eliminated'), side: 'bottom', dist: 14, style: 'dim' });
        if (S.has('elimR')) S.remove('elimR');
        S.set('dec', { text: T('boş!', 'empty!'), style: 'del' });
        S.remove('lop'); S.remove('hip'); S.remove('mp');
        S.step(T('`lo` (' + lo + ') artık `hi`\'dan (' + hi + ') büyük: aralık boşaldı, arayacak kutu kalmadı — **bulunamadı**. Toplam ' + steps + ' karşılaştırma: her adımda arama uzayı yarıya indi, **O(log n)**.',
                 '`lo` (' + lo + ') is now greater than `hi` (' + hi + '): the range is empty, there is nothing left to check — **not found**. ' + steps + ' comparisons in total: each step halved the search space, **O(log n)**.'));
      } else {
        S.step(T('Sonuç: `arr[' + index + '] = ' + target + '`, yalnız ' + steps + ' karşılaştırmada bulundu. Her adımda arama uzayı yarıya iner: **O(log n)**.',
                 'Result: `arr[' + index + '] = ' + target + '`, found in just ' + steps + ' comparisons. Each step halves the search space: **O(log n)**.'));
      }
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
