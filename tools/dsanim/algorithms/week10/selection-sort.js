/* Week 10 -- Selection sort: for each position i (left to right), scan the whole unsorted remainder to find
 * its minimum, then swap that minimum into position i. Unlike bubble sort, the SORTED region grows on the
 * LEFT, and at most n-1 swaps ever happen (one per position, and only if a smaller value was actually found)
 * -- far fewer swaps than bubble sort, at the cost of always doing the full O(n^2) comparisons, even on
 * already-sorted input. Comparisons and swaps are counted and shown on the right. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'void selection_sort(int a[], int n) {',
    '    for (int i = 0; i < n - 1; i++) {',
    '        int min_idx = i;',
    '        for (int j = i + 1; j < n; j++) {',
    '            if (a[j] < a[min_idx])',
    '                min_idx = j;',
    '        }',
    '        if (min_idx != i) {              /* skip the swap if i is already the minimum */',
    '            int tmp = a[i];',
    '            a[i] = a[min_idx];',
    '            a[min_idx] = tmp;',
    '        }',
    '    }',
    '}'
  ];
  var J = [
    'void selectionSort(int[] a, int n) {',
    '    for (int i = 0; i < n - 1; i++) {',
    '        int minIdx = i;',
    '        for (int j = i + 1; j < n; j++) {',
    '            if (a[j] < a[minIdx])',
    '                minIdx = j;',
    '        }',
    '        if (minIdx != i) {                // skip the swap if i is already the minimum',
    '            int tmp = a[i];',
    '            a[i] = a[minIdx];',
    '            a[minIdx] = tmp;',
    '        }',
    '    }',
    '}'
  ];

  D.define({
    id: 'selection-sort',
    title: T('Seçmeli sıralama (selection sort)', 'Selection sort'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 rastgele değer', '10 unordered values'),
        data: { values: [29, 10, 14, 37, 14, 22, 5, 41, 18, 33] } },
      { id: 'hard', level: 'hard', name: T('14 değer, minimum her seferinde farklı uçta', '14 values, the minimum keeps moving'),
        data: { values: [50, 3, 47, 8, 44, 12, 39, 16, 34, 20, 29, 24, 25, 27] } },
      { id: 'already-sorted', level: 'edge', name: T('Zaten sıralı: yine de her i için tam tarama yapılır', 'Already sorted: a full scan still happens for every i'),
        data: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı: her adımda yer değiştirme olur', 'Reverse sorted: every step swaps'),
        data: { values: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] } },
      { id: 'duplicates', level: 'edge', name: T('Tekrarlı değerler: minimum eşitliğinde ilk bulunan kalır', 'Duplicates: ties keep the first minimum found'),
        data: { values: [4, 4, 2, 4, 2, 4, 2, 4, 4, 2] } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler: INT_MAX, INT_MIN, sıfır', 'Extreme values: INT_MAX, INT_MIN, zero'),
        data: { values: [2147483647, -2147483648, 0, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1] } },
      { id: 'single', level: 'edge', name: T('Tek değer', 'A single value'), small: true,
        data: { values: [7] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.values.length; },
    reference: function (d) { return { sorted: d.values.slice().sort(function (a, b) { return a - b; }) }; },
    random: function (level, r) {
      var n = { easy: 10, normal: 11, hard: 14, extreme: 16 }[level];
      var lo = level === 'extreme' ? -1000 : 1, hi = level === 'extreme' ? 99 : 99;
      var values = [];
      for (var i = 0; i < n; i++) values.push(D.randInt(r, lo, hi));
      return { values: values };
    },
    input: {
      hint: T('Örnek: 29 10 14 37 14 22 5 41 18 33', 'Example: 29 10 14 37 14 22 5 41 18 33'),
      parse: function (text) {
        var values = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" bir tam sayı değil.', '"' + tok + '" is not an integer.');
          values.push(parseInt(tok, 10));
        });
        if (!values.length) throw T('En az bir değer yazın.', 'Write at least one value.');
        if (values.length > 30) throw T('En çok 30 değer.', 'At most 30 values.');
        return { values: values };
      },
      format: function (d) { return d.values.join(' '); },
      tokens: function (d) { return d.values.map(String); },
      bad: ['', '5 x 7', '3.5 8', ',,,']
    },
    build: function (S, d) {
      var arr = d.values.slice(), n = arr.length;
      var W = 58, H = 44, X0 = 70, Y0 = 90;
      var comparisons = 0, swaps = 0;

      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: 'A =', anchor: 'end', size: 15, bold: true, mono: true });
      for (var i0 = 0; i0 < n; i0++) S.box('b' + i0, { x: X0 + i0 * W, y: Y0, w: W - 6, h: H, text: String(arr[i0]), style: 'normal', size: 16, above: String(i0) });
      var RX = X0 + n * W + 30;
      S.label('cnt', { x: RX, y: Y0 - 10, text: 'comparisons: 0   swaps: 0', size: 15, bold: true, mono: true, anchor: 'start' });
      S.label('decision', { x: RX, y: Y0 + 20, text: '', size: 16, bold: true, mono: true, anchor: 'start', style: 'normal' });

      function counters() { S.set('cnt', { text: 'comparisons: ' + comparisons + '   swaps: ' + swaps }); }
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      function paint(sortedUpto, minIdx, j) {
        for (var k = 0; k < n; k++) {
          var st = 'normal';
          if (k < sortedUpto) st = 'dim';
          if (k === minIdx) st = 'hl';
          if (k === j) st = 'active';
          S.set('b' + k, { text: String(arr[k]), style: st });
        }
      }
      function sortedBrace(upto) {
        if (S.has('sortedb')) S.remove('sortedb');
        if (upto > 0) S.brace('sortedb', { from: 'b0', to: 'b' + (upto - 1), text: T('sıralı', 'sorted'), side: 'top', dist: 14, style: 'active' });
      }

      S.step(T('Sıralanacak ' + n + ' değer. Selection sort her `i` için, `i..n-1` aralığının minimumunu bulur ve `a[i]` ile yer değiştirir; sıralı bölge SOLDAN büyür.',
               n + ' values to sort. Selection sort finds the minimum of the range `i..n-1` for each `i` and swaps it into `a[i]`; the sorted region grows from the LEFT.'),
             { c: [1], java: [1] });

      for (var i = 0; i < n - 1; i++) {
        var minIdx = i;
        var detailed = i === 0;
        sortedBrace(i);
        if (detailed) {
          paint(i, minIdx);
          S.step(T('`i = ' + i + '`: en küçüğü arıyoruz, şimdilik `min_idx = ' + i + '` (a[' + i + ']=' + arr[i] + ') varsayılıyor.',
                   '`i = ' + i + '`: looking for the minimum, tentatively `min_idx = ' + i + '` (a[' + i + ']=' + arr[i] + ').'),
                 { c: [{ n: 2, note: T('i = ' + i + ' < n-1 (' + (n - 1) + ')', 'i = ' + i + ' < n-1 (' + (n - 1) + ')') }, 3],
                   java: [{ n: 2, note: T('i = ' + i + ' < n-1 (' + (n - 1) + ')', 'i = ' + i + ' < n-1 (' + (n - 1) + ')') }, 3] });
        }
        for (var j = i + 1; j < n; j++) {
          comparisons++;
          var smaller = arr[j] < arr[minIdx];
          if (detailed) {
            paint(i, minIdx, j);
            counters();
          }
          var note = smaller ? T('a[' + j + ']=' + arr[j] + ' < a[' + minIdx + ']=' + arr[minIdx] + '? evet', 'a[' + j + ']=' + arr[j] + ' < a[' + minIdx + ']=' + arr[minIdx] + '? yes')
                              : T('a[' + j + ']=' + arr[j] + ' < a[' + minIdx + ']=' + arr[minIdx] + '? hayır', 'a[' + j + ']=' + arr[j] + ' < a[' + minIdx + ']=' + arr[minIdx] + '? no');
          if (smaller) {
            minIdx = j;
            if (detailed) {
              decide('new min', 'hl');
              paint(i, minIdx, j);
              S.step(T('a[' + j + '] daha küçük: yeni aday `min_idx = ' + j + '`.', 'a[' + j + '] is smaller: new candidate `min_idx = ' + j + '`.'),
                     { c: [{ n: 4, note: T('j = ' + j + ' < n (' + n + ')', 'j = ' + j + ' < n (' + n + ')') }, { n: 5, note: note }, 6],
                       java: [{ n: 4, note: T('j = ' + j + ' < n (' + n + ')', 'j = ' + j + ' < n (' + n + ')') }, { n: 5, note: note }, 6] });
            }
          } else if (detailed) {
            decide('', 'normal');
            S.step(T('a[' + j + '] daha küçük değil, `min_idx` değişmez.', 'a[' + j + '] is not smaller, `min_idx` stays.'),
                   { c: [{ n: 4, note: T('j = ' + j + ' < n (' + n + ')', 'j = ' + j + ' < n (' + n + ')') }, { n: 5, note: note }, { n: 6, skip: true }],
                     java: [{ n: 4, note: T('j = ' + j + ' < n (' + n + ')', 'j = ' + j + ' < n (' + n + ')') }, { n: 5, note: note }, { n: 6, skip: true }] });
          }
        }
        decide('', 'normal');
        if (minIdx !== i) {
          var vi = arr[i], vm = arr[minIdx];
          arr[i] = vm; arr[minIdx] = vi;
          swaps++;
          paint(i, i);
          S.set('b' + i, { style: 'new' });
          counters();
          S.step(T('`i = ' + i + '`: tarama bitti, en küçük `min_idx = ' + minIdx + '`de. `i` ile yer değiştirirler: a[' + i + '] = ' + vm + '.',
                   '`i = ' + i + '`: scan done, the minimum is at `min_idx = ' + minIdx + '`. It swaps with `i`: a[' + i + '] = ' + vm + '.'),
                 { c: [{ n: 8, note: T('min_idx != i? evet', 'min_idx != i? yes') }, 9, 10, 11], java: [{ n: 8, note: T('min_idx != i? evet', 'min_idx != i? yes') }, 9, 10, 11] });
        } else {
          paint(i + 1);
          S.set('b' + i, { style: 'new' });
          counters();
          S.step(T('`i = ' + i + '`: `min_idx == i`, `a[' + i + ']` (' + arr[i] + ') zaten en küçüktü, yer değiştirme atlanır.', '`i = ' + i + '`: `min_idx == i`, `a[' + i + ']` (' + arr[i] + ') was already the minimum, the swap is skipped.'),
                 { c: [{ n: 8, note: T('min_idx != i? hayır', 'min_idx != i? no') }, { n: 9, skip: true }, { n: 10, skip: true }, { n: 11, skip: true }], java: [{ n: 8, note: T('min_idx != i? hayır', 'min_idx != i? no') }, { n: 9, skip: true }, { n: 10, skip: true }, { n: 11, skip: true }] });
        }
      }
      sortedBrace(n);
      paint(n);
      decide('', 'normal');
      S.result = { sorted: arr.slice() };
      S.step(T('Bitti: [' + arr.join(', ') + ']. Toplam ' + comparisons + ' karşılaştırma, yalnızca ' + swaps + ' yer değiştirme. Her durumda O(n²) karşılaştırma yapar (erken çıkış yok) ama en çok n-1 yer değiştirme -- yazma maliyeti pahalıysa avantajlıdır.',
               'Done: [' + arr.join(', ') + ']. Total ' + comparisons + ' comparisons, only ' + swaps + ' swaps. It always does O(n²) comparisons (no early exit) but at most n-1 swaps -- an advantage when writes are expensive.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
