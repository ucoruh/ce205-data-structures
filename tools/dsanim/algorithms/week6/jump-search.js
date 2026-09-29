/* Week 6 — jump search: on a SORTED array, jump forward in fixed-size blocks (block = floor(sqrt(n))) until a
 * block boundary is >= target, then scan that block linearly. Faster than linear search (O(sqrt(n)) instead of
 * O(n)), simpler than binary search (only forward jumps, no recursion/pointers needed).
 * Drawing standard: one row "arr =" with index numbers above; the block boundary check is written on the right;
 * the current block is braced; the linear scan highlights cell by cell. Examples (normal, hard, edge), random data
 * and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int jump_search(const int arr[], int n, int target, int *comparisons) {',
    '    int block = (int) sqrt((double) n);      /* block size = floor(sqrt(n)) */',
    '    if (block < 1) block = 1;',
    '    int prev = 0, step = block, comp = 0;',
    '    while (step < n) {                        /* jump forward one block at a time */',
    '        comp++;',
    '        if (arr[step - 1] >= target) break;    /* target may be in this block */',
    '        prev = step;',
    '        step += block;',
    '    }',
    '    if (step > n) step = n;',
    '    for (int i = prev; i < step; i++) {        /* linear scan inside the block */',
    '        comp++;',
    '        if (arr[i] == target) { *comparisons = comp; return i; }',
    '        if (arr[i] > target) break;             /* sorted: no need to look further */',
    '    }',
    '    *comparisons = comp;',
    '    return -1;',
    '}'
  ];
  var JAVA = [
    'static int jumpSearch(int[] arr, int target) {',
    '    int n = arr.length;',
    '    int block = (int) Math.sqrt(n);          // block size = floor(sqrt(n))',
    '    if (block < 1) block = 1;',
    '    int prev = 0, step = block;',
    '    comparisons = 0;',
    '    while (step < n) {                        // jump forward one block at a time',
    '        comparisons++;',
    '        if (arr[step - 1] >= target) break;    // target may be in this block',
    '        prev = step;',
    '        step += block;',
    '    }',
    '    if (step > n) step = n;',
    '    for (int i = prev; i < step; i++) {        // linear scan inside the block',
    '        comparisons++;',
    '        if (arr[i] == target) return i;',
    '        if (arr[i] > target) break;             // sorted: no need to look further',
    '    }',
    '    return -1;',
    '}'
  ];

  function block(n) { return Math.max(1, Math.floor(Math.sqrt(n))); }

  D.define({
    id: 'jump-search',
    title: T('Sıçramalı arama (jump search): bloklarla ilerlemek', 'Jump search: advancing block by block'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('16 değer, hedef ikinci blokta bulundu', '16 values, target found in the second block'),
        data: { arr: [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62], target: 42 } },
      { id: 'hard', level: 'hard', name: T('Hedef son bloğa yakın, en çok sıçrama gerekir', 'Target near the last block, needs the most jumps'),
        data: { arr: [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62], target: 58 } },
      { id: 'smaller-than-all', level: 'edge', name: T('Hedef en küçükten de küçük', 'Target is smaller than every value'),
        data: { arr: [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62], target: 1 } },
      { id: 'larger-than-all', level: 'edge', name: T('Hedef en büyükten de büyük', 'Target is larger than every value'),
        data: { arr: [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62], target: 999 } },
      { id: 'not-present', level: 'edge', name: T('Hedef aralıkta ama dizide yok', 'Target is in range but not in the array'),
        data: { arr: [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62], target: 45 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.arr.length; },
    /** Independent computation: same well-known algorithm, coded separately from build(). */
    reference: function (d) {
      var arr = d.arr, n = arr.length, target = d.target;
      var b = Math.max(1, Math.floor(Math.sqrt(n))), prev = 0, step = b, comp = 0, index = -1, i;   /* block size, computed independently of build()'s block() */
      while (step < n) {
        comp++;
        if (arr[step - 1] >= target) break;
        prev = step;
        step += b;
      }
      if (step > n) step = n;
      for (i = prev; i < step; i++) {
        comp++;
        if (arr[i] === target) { index = i; break; }
        if (arr[i] > target) break;
      }
      return { index: index, comparisons: comp, block: b };
    },
    random: function (level, r) {
      var n = 16, span = level === 'extreme' ? 14 : (level === 'hard' ? 9 : 6);
      var arr = [], v = D.randInt(r, 0, 5), i;
      for (i = 0; i < n; i++) { arr.push(v); v += D.randInt(r, 1, span); }
      var pick = r(), target;
      if (pick < 0.15) target = arr[0] - D.randInt(r, 1, 50);
      else if (pick < 0.3) target = arr[n - 1] + D.randInt(r, 1, 50);
      else if (pick < 0.65) target = arr[D.randInt(r, 0, n - 1)];
      else { var idx = D.randInt(r, 0, n - 2); target = arr[idx] + 1; }
      return { arr: arr, target: target };
    },
    input: {
      hint: T('Örnek: 2 6 10 14 18 22 26 30 34 38 42 46 50 54 58 62 target=42  (sıralı dizi, en çok 16 sayı)',
              'Example: 2 6 10 14 18 22 26 30 34 38 42 46 50 54 58 62 target=42  (sorted array, at most 16 numbers)'),
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
          if (arr[i] < arr[i - 1]) throw T('Dizi sıralı (artan ya da eşit) olmalı; sıçramalı arama sıralı bir diziye ihtiyaç duyar.',
                                            'The array must be sorted (non-decreasing); jump search requires a sorted array.');
        }
        return { arr: arr, target: target };
      },
      format: function (d) { return d.arr.join(' ') + ' target=' + d.target; },
      bad: ['', '1 2 3', '5 8 x 13 target=8', 'target=abc 5 8', '9 3 5 target=5', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 target=5'],
      tokens: function (d) { return d.arr.map(String); }
    },
    build: function (S, d) {
      var arr = d.arr, n = arr.length, target = d.target, b = block(n);
      var X0 = 90, Y0 = 160, W = 46, H = 40, GAP = 6;
      var RX = X0 + n * (W + GAP) + 44;

      arr.forEach(function (v, i) { S.box('h' + i, { x: X0 + i * (W + GAP), y: Y0, w: W, h: H, text: String(v), size: 15, above: String(i) }); });
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: T('dizi =', 'arr ='), anchor: 'end', size: 15, bold: true });
      S.label('tgt', { x: X0, y: 40, text: 'target = ' + target, size: 18, bold: true, mono: true });
      S.label('blk', { x: X0, y: 66, text: 'block = floor(sqrt(' + n + ')) = ' + b, style: 'dim', size: 14 });
      S.label('cnt', { x: X0, y: 88, text: T('karşılaştırma: 0', 'comparisons: 0'), style: 'dim', size: 14 });
      S.label('dec', { x: RX, y: Y0 + H / 2 + 5, text: '', size: 18, bold: true, mono: true, anchor: 'start' });

      function setCnt(comp) { S.set('cnt', { text: T('karşılaştırma: ' + comp, 'comparisons: ' + comp) }); }
      function dim(from, to) { for (var k = from; k < to; k++) S.set('h' + k, { style: 'dim' }); }

      S.step(T('`n = ' + n + '` elemanlık **sıralı** bir dizide `target = ' + target + '`\'i arıyoruz. Önce blok boyutunu hesaplarız: `block = floor(sqrt(' + n + ')) = ' + b + '`.',
               'We search for `target = ' + target + '` in a **sorted** array of `n = ' + n + '` elements. First we compute the block size: `block = floor(sqrt(' + n + ')) = ' + b + '`.'),
             { c: [1, 2, 3, 4], java: [1, 2, 3, 4, 5, 6] });

      var prev = 0, step = b, comp = 0, index = -1, jumpNo = 0;
      while (step < n) {
        comp++;
        jumpNo++;
        S.set('h' + (step - 1), { style: 'hl' });
        setCnt(comp);
        S.at(step - 1);
        if (arr[step - 1] >= target) {
          S.set('dec', { text: '>= ' + target, style: 'hl' });
          S.step(T('`arr[' + (step - 1) + '] = ' + arr[step - 1] + ' >= ' + target + '` — bu blok sınırı hedefi geçti ya da tuttu. `target` varsa bu blokta olmalı; sıçramayı durdururuz.',
                   '`arr[' + (step - 1) + '] = ' + arr[step - 1] + ' >= ' + target + '` — this block boundary reached or passed the target. If `target` exists, it must be in this block; we stop jumping.'),
                 { c: [5, 6, 7], java: [7, 8, 9] });
          break;
        }
        S.set('dec', { text: '< ' + target, style: 'normal' });
        S.step(T('Sıçrama ' + jumpNo + ': `arr[' + (step - 1) + '] = ' + arr[step - 1] + ' < ' + target + '` — bu blok tamamen elenir, bir sonraki bloğa atlarız.',
                 'Jump ' + jumpNo + ': `arr[' + (step - 1) + '] = ' + arr[step - 1] + ' < ' + target + '` — this whole block is ruled out, we jump to the next one.'),
               { c: [5, 6, 7, 8, 9], java: [7, 8, 9, 10, 11] });
        dim(prev, step);
        prev = step;
        step += b;
      }
      if (step > n) step = n;
      dim(0, prev);
      S.brace('cur', { from: 'h' + prev, to: 'h' + (step - 1), text: T('geçerli blok', 'current block'), side: 'bottom', dist: 14, style: 'active' });
      S.step(T('Şimdi `[' + prev + '..' + (step - 1) + ']` bloğunu **soldan sağa doğrusal** tararız — en çok `block = ' + b + '` karşılaştırma.',
               'Now we scan the block `[' + prev + '..' + (step - 1) + ']` **left to right, linearly** — at most `block = ' + b + '` comparisons.'),
             { c: [11, 12], java: [13, 14] });

      for (var i = prev; i < step; i++) {
        comp++;
        S.set('h' + i, { style: 'hl' });
        setCnt(comp);
        S.at(i);
        if (arr[i] === target) {
          index = i;
          S.set('h' + i, { style: 'new' });
          S.set('dec', { text: '= ' + target + ' found', style: 'new' });
          S.step(T('`arr[' + i + '] == ' + target + '`? Evet — indeks ' + i + '\'de bulundu, toplam ' + comp + ' karşılaştırma.',
                   '`arr[' + i + '] == ' + target + '`? Yes — found at index ' + i + ', ' + comp + ' comparisons in total.'),
                 { c: [13, 14], java: [15, 16] });
          break;
        } else if (arr[i] > target) {
          S.set('h' + i, { style: 'del' });
          S.set('dec', { text: '> ' + target + ' stop', style: 'del' });
          S.step(T('`arr[' + i + '] = ' + arr[i] + ' > ' + target + '` — dizi sıralı olduğu için ' + target + ' daha ileride olamaz, tarama durur.',
                   '`arr[' + i + '] = ' + arr[i] + ' > ' + target + '` — since the array is sorted, ' + target + ' cannot be further ahead, the scan stops.'),
                 { c: [13, 15], java: [15, 17] });
          break;
        } else {
          S.set('h' + i, { style: 'dim' });
          S.set('dec', { text: '< ' + target, style: 'normal' });
          S.step(T('`arr[' + i + '] = ' + arr[i] + ' < ' + target + '` — bu hücre değil, bir sonrakine geçeriz.',
                   '`arr[' + i + '] = ' + arr[i] + ' < ' + target + '` — not this cell, move to the next one.'),
                 { c: [13, 14, 15], java: [15, 16, 17] });
        }
      }
      S.at(null);
      S.result = { index: index, comparisons: comp, block: b };
      if (index === -1) {
        S.step(T('Bulunamadı: ' + target + ' dizide yok. Toplam ' + comp + ' karşılaştırma — doğrusal aramanın `n = ' + n + '` karşılaştırmasından çok daha az: **O(sqrt(n))**.',
                 'Not found: ' + target + ' is not in the array. ' + comp + ' comparisons in total — far fewer than linear search\'s `n = ' + n + '`: **O(sqrt(n))**.'));
      } else {
        S.step(T('Sonuç: `arr[' + index + '] = ' + target + '`, ' + comp + ' karşılaştırmada bulundu (' + jumpNo + ' sıçrama + doğrusal tarama). **O(sqrt(n))**.',
                 'Result: `arr[' + index + '] = ' + target + '`, found in ' + comp + ' comparisons (' + jumpNo + ' jumps + a linear scan). **O(sqrt(n))**.'));
      }
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
