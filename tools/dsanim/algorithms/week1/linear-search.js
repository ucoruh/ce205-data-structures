/* Week 1 — linear search: scan an array from the front, counting comparisons one box at a time.
 * Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int linear_search(const int arr[], int n, int target, int *comparisons) {',
    '    for (int i = 0; i < n; i++) {',
    '        (*comparisons)++;',
    '        if (arr[i] == target)',
    '            return i;',
    '    }',
    '    return -1;',
    '}'
  ];
  var JAVA = [
    'static int linearSearch(int[] arr, int target) {',
    '    comparisons = 0;',
    '    for (int i = 0; i < arr.length; i++) {',
    '        comparisons++;',
    '        if (arr[i] == target)',
    '            return i;',
    '    }',
    '    return -1;',
    '}'
  ];
  var W = 46, H = 40, GAP = 6, ROW = 16, ROWH = 130; // ROWH: tall enough that the bottom "scanned" brace of one
  // wrapped row and the 'top' index pointer (dist 22) of the next wrapped row never collide.

  function place(S, arr, x0, y0, prefix) {
    arr.forEach(function (v, i) {
      var col = i % ROW, row = Math.floor(i / ROW);
      var x = x0 + col * (W + GAP), y = y0 + row * ROWH;
      S.box(prefix + i, { x: x, y: y, w: W, h: H, text: String(v), size: 15, above: String(i) });
    });
  }
  function point(S, id, target) {
    if (S.has(id)) S.set(id, { target: target }); else S.pointer(id, { target: target, text: 'i', side: 'top', dist: 22 });
  }
  function setBrace(S, id, p) { if (S.has(id)) S.set(id, p); else S.brace(id, p); }

  D.define({
    id: 'linear-search',
    title: T('Doğrusal arama: karşılaştırmaları saymak', 'Linear search: counting comparisons'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('11 değer, hedef ortada', '11 values, target in the middle'),
        data: { arr: [4, 8, 15, 16, 23, 27, 31, 38, 42, 50, 61], target: 27 } },
      { id: 'hard', level: 'hard', name: T('20 değer, tekrarlı hedef, ilk eşleşme', '20 values, duplicate target, first match'),
        data: { arr: [12, 47, 3, 88, 25, 61, 9, 34, 77, 15, 52, 6, 41, 18, 63, 99, 5, 29, 99, 71], target: 99 } },
      { id: 'not-found', level: 'edge', name: T('Bulunamadı: hedef dizide yok', 'Not found: target is not in the array'),
        data: { arr: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20], target: 7 } },
      { id: 'first-index', level: 'edge', name: T('En iyi durum: hedef ilk kutuda (indeks 0)', 'Best case: target is in the first box (index 0)'),
        data: { arr: [5, 13, 21, 34, 42, 55, 67, 78, 89, 91], target: 5 } },
      { id: 'one-element', level: 'edge', name: T('Tek elemanlı dizi', 'One-element array'), small: true,
        data: { arr: [42], target: 42 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.arr.length; },
    reference: function (d) {
      var comparisons = 0, index = -1, i;
      for (i = 0; i < d.arr.length; i++) {
        comparisons++;
        if (d.arr[i] === d.target) { index = i; break; }
      }
      return { index: index, comparisons: comparisons };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 13, hard: 20, extreme: 28 }[level];
      var lo = level === 'extreme' ? -500 : 1, hi = level === 'extreme' ? 500 : 99;
      var arr = [], i;
      for (i = 0; i < n; i++) arr.push(D.randInt(r, lo, hi));
      if (level === 'hard' || level === 'extreme') {
        var dupAt = D.randInt(r, Math.floor(n / 2), n - 2);
        arr[n - 1] = arr[dupAt];
      }
      var target = r() < 0.75 ? arr[D.randInt(r, 0, n - 1)] : 987654321;
      return { arr: arr, target: target };
    },
    input: {
      hint: T('Örnek: 4 8 15 16 23 27 31 38 42 50 target=27  (sayılar dizi, target=N aranan değer)',
              'Example: 4 8 15 16 23 27 31 38 42 50 target=27  (numbers form the array, target=N is the value to find)'),
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
        return { arr: arr, target: target };
      },
      format: function (d) { return d.arr.join(' ') + ' target=' + d.target; },
      bad: ['', '5 8 x 13 target=8', '5 8 13', 'target=abc 5 8', '5.5 8 13 target=8']
    },
    build: function (S, d) {
      var arr = d.arr, target = d.target, n = arr.length;
      var X0 = 44, Y0 = 110, RX = X0 + Math.min(n, ROW) * (W + GAP) + 40;
      place(S, arr, X0, Y0, 'h');
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: T('dizi =', 'arr ='), anchor: 'end', size: 15, bold: true });
      S.label('dec', { x: RX, y: Y0 + H / 2 + 5, text: '', size: 18, bold: true, mono: true, anchor: 'start' });
      S.label('tgt', { x: X0, y: 40, text: 'target = ' + target, size: 18, bold: true, mono: true });
      S.label('cnt', { x: X0, y: 68, text: T('karşılaştırma = 0', 'comparisons = 0'), style: 'dim', size: 14 });
      S.step(T('Bir dizimiz (array) var, ' + n + ' değerden oluşuyor: `target = ' + target + '`\'i arıyoruz. Doğrusal arama en baştan başlar, kutuları tek tek dener.',
               'We have an array of ' + n + ' values: we are looking for `target = ' + target + '`. Linear search starts at the front and tries boxes one at a time.'),
             { c: [1], java: [1] });
      var comparisons = 0, index = -1, i;
      for (i = 0; i < n; i++) {
        point(S, 'ip', 'h' + i);
        comparisons++;
        S.set('h' + i, { style: 'hl' });
        S.set('cnt', { text: T('karşılaştırma = ' + comparisons, 'comparisons = ' + comparisons) });
        S.at(i);
        var rowStart = Math.floor(i / ROW) * ROW;
        setBrace(S, 'scanned' + Math.floor(i / ROW), { from: 'h' + rowStart, to: 'h' + i, text: T('taranan', 'scanned'), side: 'bottom', dist: 14, style: 'dim' });
        if (i === 0) {
          S.step(T('İlk kutuya bakıyoruz: `i = 0`. Her adımda önce karşılaştırma sayacı bir artar.',
                   'We look at the first box: `i = 0`. On every step, the comparison counter goes up by one first.'),
                 { c: [2, 3], java: [3, 4] });
        }
        if (arr[i] === target) {
          index = i;
          S.set('h' + i, { style: 'new' });
          S.set('dec', { text: T('= ' + target + ' bulundu', '= ' + target + ' found'), style: 'new' });
          S.step(T('`arr[' + i + '] == ' + target + '`? Evet — ' + comparisons + '. karşılaştırmada bulundu.',
                   '`arr[' + i + '] == ' + target + '`? Yes — found on comparison ' + comparisons + '.'),
                 { c: [4, 5], java: [5, 6] });
          break;
        }
        S.set('dec', { text: '≠ ' + target, style: 'dim' });
        S.step(T('`arr[' + i + '] == ' + target + '`? Hayır (' + arr[i] + ' ≠ ' + target + ') — bir sonraki kutuya geç.',
                 '`arr[' + i + '] == ' + target + '`? No (' + arr[i] + ' ≠ ' + target + ') — move to the next box.'),
               { c: [2, 3, 4], java: [3, 4, 5] });
        S.set('h' + i, { style: 'dim' });
      }
      S.remove('ip');
      S.at(null);
      S.result = { index: index, comparisons: comparisons };
      if (index === -1) {
        S.step(T('Dizinin sonuna geldik, hiçbir kutu eşleşmedi: **bulunamadı**. En kötü durumda doğrusal arama tam `n = ' + n + '` karşılaştırma yapar: **O(n)**.',
                 'We reached the end of the array with no match: **not found**. In the worst case, linear search makes all `n = ' + n + '` comparisons: **O(n)**.'));
      } else {
        S.step(T('Sonuç: `arr[' + index + '] = ' + target + '`, ' + comparisons + ' karşılaştırmada bulundu. En kötü durumda (son eleman ya da hiç yoksa) doğrusal arama `n = ' + n + '` karşılaştırma yapar: **O(n)**.',
                 'Result: `arr[' + index + '] = ' + target + '`, found after ' + comparisons + ' comparisons. In the worst case (last element, or not present at all) linear search makes `n = ' + n + '` comparisons: **O(n)**.'));
      }
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
