/* Week 6 — exponential search: on a SORTED array, double a bound (1, 2, 4, 8, …) until it overshoots target, then
 * run ordinary binary search inside [bound/2, bound]. Useful when n is unknown or the array is huge and target is
 * likely near the front: the bound-finding phase costs only O(log index), not O(log n).
 * Drawing standard: one row "arr =" with index numbers above; the doubling phase marks each checked boundary; the
 * binary-search phase reuses lo/hi/mid pointers and "eliminated" / "still possible" braces. Examples (normal, hard,
 * edge), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int exponential_search(const int arr[], int n, int target, int *comparisons) {',
    '    int comp = 1;                    /* the arr[0] check below counts as comparison #1 */',
    '    if (arr[0] == target) { *comparisons = comp; return 0; }',
    '    int bound = 1;',
    '    while (bound < n) {                 /* double the bound until it overshoots target */',
    '        comp++;',
    '        if (arr[bound] >= target) break;',
    '        bound *= 2;',
    '    }',
    '    int lo = bound / 2, hi = (bound < n) ? bound : n - 1;',
    '    while (lo <= hi) {                  /* ordinary binary search inside [lo..hi] */',
    '        int mid = lo + (hi - lo) / 2;',
    '        comp++;',
    '        if (arr[mid] == target) { *comparisons = comp; return mid; }',
    '        if (arr[mid] < target) lo = mid + 1;',
    '        else hi = mid - 1;',
    '    }',
    '    *comparisons = comp;',
    '    return -1;',
    '}'
  ];
  var JAVA = [
    'static int exponentialSearch(int[] arr, int target) {',
    '    int n = arr.length;',
    '    comparisons = 1;                 // the arr[0] check below counts as comparison #1',
    '    if (arr[0] == target) return 0;',
    '    int bound = 1;',
    '    while (bound < n) {                 // double the bound until it overshoots target',
    '        comparisons++;',
    '        if (arr[bound] >= target) break;',
    '        bound *= 2;',
    '    }',
    '    int lo = bound / 2, hi = (bound < n) ? bound : n - 1;',
    '    while (lo <= hi) {                  // ordinary binary search inside [lo..hi]',
    '        int mid = lo + (hi - lo) / 2;',
    '        comparisons++;',
    '        if (arr[mid] == target) return mid;',
    '        if (arr[mid] < target) lo = mid + 1;',
    '        else hi = mid - 1;',
    '    }',
    '    return -1;',
    '}'
  ];

  function point(S, id, target, text, dist) {
    if (S.has(id)) S.set(id, { target: target }); else S.pointer(id, { target: target, text: text, side: 'top', dist: dist });
  }
  function setBrace(S, id, p) { if (S.has(id)) S.set(id, p); else S.brace(id, p); }

  D.define({
    id: 'exponential-search',
    title: T('Üstel arama: sınırı ikiye katlayıp içeride ikili arama', 'Exponential search: doubling the bound, then binary search inside'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('16 değer, hedef ortalarda bulundu', '16 values, target found around the middle'),
        data: { arr: [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63], target: 39 } },
      { id: 'hard', level: 'hard', name: T('Hedef sona yakın, sınır birkaç kez ikiye katlanır', 'Target near the end, the bound doubles several times'),
        data: { arr: [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63], target: 59 } },
      { id: 'first-element', level: 'edge', name: T('Hedef ilk elemanda: tek karşılaştırma', 'Target is the first element: a single comparison'),
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
      var comp = 1;
      if (arr[0] === target) return { index: 0, comparisons: comp };
      var bound = 1;
      while (bound < n) {
        comp++;
        if (arr[bound] >= target) break;
        bound *= 2;
      }
      var lo = Math.floor(bound / 2), hi = bound < n ? bound : n - 1, index = -1;
      while (lo <= hi) {
        var mid = lo + Math.floor((hi - lo) / 2);
        comp++;
        if (arr[mid] === target) { index = mid; break; }
        if (arr[mid] < target) lo = mid + 1; else hi = mid - 1;
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
          if (arr[i] < arr[i - 1]) throw T('Dizi sıralı (artan ya da eşit) olmalı; üstel arama sıralı bir diziye ihtiyaç duyar.',
                                            'The array must be sorted (non-decreasing); exponential search requires a sorted array.');
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
      S.label('cnt', { x: X0, y: 66, text: T('karşılaştırma: 0', 'comparisons: 0'), style: 'dim', size: 14 });
      S.label('dec', { x: RX, y: Y0 + H / 2 + 5, text: '', size: 18, bold: true, mono: true, anchor: 'start' });

      function setCnt(comp) { S.set('cnt', { text: T('karşılaştırma: ' + comp, 'comparisons: ' + comp) }); }
      function setRowStyles(lo, hi) { for (var q = 0; q < n; q++) S.set('h' + q, { style: (q < lo || q > hi) ? 'dim' : 'normal' }); }
      function setBraces(lo, hi) {
        if (lo > 0) setBrace(S, 'elimL', { from: 'h0', to: 'h' + (lo - 1), text: T('elendi', 'eliminated'), side: 'bottom', dist: 14, style: 'dim' });
        else if (S.has('elimL')) S.remove('elimL');
        if (hi < n - 1) setBrace(S, 'elimR', { from: 'h' + (hi + 1), to: 'h' + (n - 1), text: T('elendi', 'eliminated'), side: 'bottom', dist: 14, style: 'dim' });
        else if (S.has('elimR')) S.remove('elimR');
        if (lo <= hi) setBrace(S, 'poss', { from: 'h' + lo, to: 'h' + hi, text: T('olası [' + lo + '..' + hi + ']', 'still possible [' + lo + '..' + hi + ']'), side: 'bottom', dist: 14, style: 'active' });
        else if (S.has('poss')) S.remove('poss');
      }

      S.step(T('`n = ' + n + '` elemanlık **sıralı** bir dizide `target = ' + target + '`\'i arıyoruz. Önce sınırı ikiye katlaya katlaya büyütürüz: 1, 2, 4, 8, … Önce `arr[0]`\'a bakarız.',
               'We search for `target = ' + target + '` in a **sorted** array of `n = ' + n + '` elements. First we grow a bound by doubling it: 1, 2, 4, 8, … First we check `arr[0]`.'),
             { c: [1, 2, 3], java: [1, 2, 3, 4] });

      var comp = 1, index = -1;
      S.set('h0', { style: 'hl' });
      setCnt(comp);
      S.at(0);
      if (arr[0] === target) {
        index = 0;
        S.set('h0', { style: 'new' });
        S.set('dec', { text: '= ' + target + ' found', style: 'new' });
        S.step(T('`arr[0] == ' + target + '`? Evet — hedef ilk elemanda, tek karşılaştırmada bulundu.',
                 '`arr[0] == ' + target + '`? Yes — the target is the first element, found in a single comparison.'), { c: [2, 3], java: [3, 4] });
      } else {
        S.set('h0', { style: 'dim' });
        S.set('dec', { text: '!= ' + target, style: 'normal' });
        S.step(T('`arr[0] == ' + target + '`? Hayır. Sınır bulma aşaması başlar: `bound = 1, 2, 4, 8, …` — her adımda `arr[bound]`\'a bakarız.',
                 '`arr[0] == ' + target + '`? No. The bound-finding phase begins: `bound = 1, 2, 4, 8, …` — we check `arr[bound]` at each step.'), { c: [2, 3, 4], java: [3, 4, 5] });

        var bound = 1, firstJump = true;
        while (bound < n) {
          comp++;
          S.set('h' + bound, { style: 'hl' });
          setCnt(comp);
          S.at(bound);
          if (arr[bound] >= target) {
            S.set('dec', { text: '>= ' + target, style: 'hl' });
            S.step(T('`arr[' + bound + '] = ' + arr[bound] + ' >= ' + target + '` — sınır hedefi geçti ya da tuttu. Sınır bulma durur: `bound = ' + bound + '`.',
                     '`arr[' + bound + '] = ' + arr[bound] + ' >= ' + target + '` — the bound reached or passed the target. Bound-finding stops: `bound = ' + bound + '`.'),
                   { c: [5, 6, 7], java: [6, 7, 8] });
            break;
          }
          S.set('h' + bound, { style: 'dim' });
          S.set('dec', { text: '< ' + target, style: 'normal' });
          S.step(T((firstJump ? '`arr[' + bound + '] = ' + arr[bound] + ' < ' + target + '` — sınır yetersiz, ikiye katlarız: ' : '`arr[' + bound + '] = ' + arr[bound] + ' < ' + target + '` — yine yetersiz, ikiye katlarız: ') + '`bound = ' + (bound * 2) + '`.',
                   (firstJump ? '`arr[' + bound + '] = ' + arr[bound] + ' < ' + target + '` — the bound is not far enough, we double it: ' : '`arr[' + bound + '] = ' + arr[bound] + ' < ' + target + '` — still not far enough, we double it again: ') + '`bound = ' + (bound * 2) + '`.'),
                 { c: [5, 6, 7, 8], java: [6, 7, 8, 9] });
          firstJump = false;
          bound *= 2;
        }

        var lo = Math.floor(bound / 2), hi = bound < n ? bound : n - 1;
        S.step(T('Şimdi `[' + lo + '..' + hi + ']` aralığında sıradan **ikili arama** yaparız — sınır bulma sayesinde arama uzayı çok küçüldü.',
                 'Now we run ordinary **binary search** inside `[' + lo + '..' + hi + ']` — thanks to bound-finding, the search space is already small.'),
               { c: [10, 11], java: [11, 12] });

        var first = true;
        while (lo <= hi) {
          setRowStyles(lo, hi);
          setBraces(lo, hi);
          var mid = lo + Math.floor((hi - lo) / 2);
          comp++;
          point(S, 'lop', 'h' + lo, 'lo', 50);
          point(S, 'hip', 'h' + hi, 'hi', 50);
          point(S, 'mp', 'h' + mid, 'mid', 22);
          setCnt(comp);
          S.at(mid);
          if (first) {
            S.step(T('`mid = lo + (hi - lo) / 2 = ' + mid + '`.', '`mid = lo + (hi - lo) / 2 = ' + mid + '`.'), { c: [12], java: [13] });
            first = false;
          }
          var v = arr[mid];
          if (v === target) {
            index = mid;
            S.set('h' + mid, { style: 'new' });
            S.set('dec', { text: '= ' + target + ' found', style: 'new' });
            S.step(T('`arr[' + mid + '] == ' + target + '`? Evet — ' + comp + '. karşılaştırmada bulundu.',
                     '`arr[' + mid + '] == ' + target + '`? Yes — found on comparison ' + comp + '.'), { c: [13, 14], java: [14, 15] });
            S.remove('lop'); S.remove('hip'); S.remove('mp');
            break;
          } else if (v < target) {
            S.set('h' + mid, { style: 'hl' });
            S.set('dec', { text: '< ' + target, style: 'hl' });
            S.step(T('`arr[' + mid + '] = ' + v + ' < ' + target + '` — sol yarıyı eleriz: `lo = ' + (mid + 1) + '`.',
                     '`arr[' + mid + '] = ' + v + ' < ' + target + '` — we discard the left half: `lo = ' + (mid + 1) + '`.'), { c: [13, 14, 15], java: [14, 15, 16] });
            lo = mid + 1;
          } else {
            S.set('h' + mid, { style: 'hl' });
            S.set('dec', { text: '> ' + target, style: 'hl' });
            S.step(T('`arr[' + mid + '] = ' + v + ' > ' + target + '` — sağ yarıyı eleriz: `hi = ' + (mid - 1) + '`.',
                     '`arr[' + mid + '] = ' + v + ' > ' + target + '` — we discard the right half: `hi = ' + (mid - 1) + '`.'), { c: [13, 14, 16], java: [14, 15, 17] });
            hi = mid - 1;
          }
        }
        if (index === -1) {
          if (S.has('poss')) S.remove('poss');
          S.remove('lop'); S.remove('hip'); S.remove('mp');
          S.set('dec', { text: T('boş!', 'empty!'), style: 'del' });
        }
      }
      S.at(null);
      S.result = { index: index, comparisons: comp };
      if (index === -1) {
        S.step(T('Bulunamadı: ' + target + ' dizide yok. Toplam ' + comp + ' karşılaştırma: sınır bulma **O(log index)**, sonrası ikili arama **O(log(bound))**.',
                 'Not found: ' + target + ' is not in the array. ' + comp + ' comparisons in total: bound-finding is **O(log index)**, then binary search is **O(log(bound))**.'));
      } else {
        S.step(T('Sonuç: `arr[' + index + '] = ' + target + '`, ' + comp + ' karşılaştırmada bulundu. Hedef başa yakınsa sınır bulma çok ucuzdur.',
                 'Result: `arr[' + index + '] = ' + target + '`, found in ' + comp + ' comparisons. When the target is near the front, bound-finding is very cheap.'));
      }
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
