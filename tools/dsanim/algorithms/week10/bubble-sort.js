/* Week 10 -- Bubble sort: repeatedly walk the array left to right, swapping any adjacent pair that is
 * out of order. The largest unsorted value "bubbles" to the end of the array on each pass. An early-exit
 * flag stops the whole algorithm the moment a pass makes zero swaps -- the array is already sorted.
 * Comparisons and swaps are counted and shown on the right; the settled tail is shown with a brace. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'void bubble_sort(int a[], int n) {',
    '    for (int pass = 0; pass < n - 1; pass++) {',
    '        int swapped = 0;',
    '        for (int i = 0; i < n - 1 - pass; i++) {',
    '            if (a[i] > a[i + 1]) {',
    '                int tmp = a[i];',
    '                a[i] = a[i + 1];',
    '                a[i + 1] = tmp;',
    '                swapped = 1;',
    '            }',
    '        }',
    '        if (!swapped) break;      /* already sorted: early exit */',
    '    }',
    '}'
  ];
  var J = [
    'void bubbleSort(int[] a, int n) {',
    '    for (int pass = 0; pass < n - 1; pass++) {',
    '        int swapped = 0;',
    '        for (int i = 0; i < n - 1 - pass; i++) {',
    '            if (a[i] > a[i + 1]) {',
    '                int tmp = a[i];',
    '                a[i] = a[i + 1];',
    '                a[i + 1] = tmp;',
    '                swapped = 1;',
    '            }',
    '        }',
    '        if (!swapped) break;      // already sorted: early exit',
    '    }',
    '}'
  ];

  D.define({
    id: 'bubble-sort',
    title: T('Kabarcık sıralaması (bubble sort)', 'Bubble sort'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 rastgele değer', '10 unordered values'),
        data: { values: [5, 2, 9, 1, 7, 3, 8, 4, 6, 0] } },
      { id: 'hard', level: 'hard', name: T('14 değer, çok sayıda geçiş gerekir', '14 values, needs many passes'),
        data: { values: [40, 11, 27, 8, 33, 16, 45, 2, 19, 37, 24, 6, 50, 29] } },
      { id: 'already-sorted', level: 'edge', name: T('Zaten sıralı: erken çıkış tek geçişte', 'Already sorted: early exit after one pass'),
        data: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı: en kötü durum, hiç erken çıkış yok', 'Reverse sorted: worst case, no early exit'),
        data: { values: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] } },
      { id: 'duplicates', level: 'edge', name: T('Tekrarlı değerler', 'Duplicate values'),
        data: { values: [7, 3, 7, 1, 3, 9, 1, 7, 9, 3] } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler: INT_MAX, INT_MIN, sıfır', 'Extreme values: INT_MAX, INT_MIN, zero'),
        data: { values: [2147483647, -2147483648, 0, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1] } },
      { id: 'single', level: 'edge', name: T('Tek değer', 'A single value'), small: true,
        data: { values: [42] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of input values -- every example must have at least 10. */
    size: function (d) { return d.values.length; },
    /** Independent computation: the platform's own ascending sort (no shared helper with build()). */
    reference: function (d) { return { sorted: d.values.slice().sort(function (a, b) { return a - b; }) }; },
    random: function (level, r) {
      var n = { easy: 10, normal: 11, hard: 14, extreme: 16 }[level];
      var lo = level === 'extreme' ? -1000 : 1, hi = level === 'extreme' ? 99 : 99;
      var values = [];
      for (var i = 0; i < n; i++) values.push(D.randInt(r, lo, hi));
      return { values: values };
    },
    input: {
      hint: T('Örnek: 5 2 9 1 7 3 8 4 6 0', 'Example: 5 2 9 1 7 3 8 4 6 0'),
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
      function paint(settledFrom) {
        for (var k = 0; k < n; k++) S.set('b' + k, { text: String(arr[k]), style: settledFrom !== undefined && k >= settledFrom ? 'dim' : 'normal' });
      }
      function settledBrace(from) {
        if (S.has('sortedb')) S.remove('sortedb');
        if (from < n) S.brace('sortedb', { from: 'b' + from, to: 'b' + (n - 1), text: T('yerleşti', 'settled'), side: 'top', dist: 14, style: 'active' });
      }

      S.step(T('Sıralanacak ' + n + ' değer. Bubble sort komşu çiftleri karşılaştırır; sıra yanlışsa yer değiştirir. Her geçişte en büyük kalan değer sona "kabarcıklanır".',
               n + ' values to sort. Bubble sort compares adjacent pairs; an out-of-order pair is swapped. Each pass "bubbles" the largest remaining value to the end.'),
             { c: [1], java: [1] });

      var pass = 0, settledFrom = n;
      for (pass = 0; pass < n - 1; pass++) {
        var swappedThis = false;
        var detailed = pass === 0;
        var passSwaps = 0, passStart = arr.slice();
        settledFrom = n - pass;
        settledBrace(settledFrom);
        if (detailed) {
          S.step(T('Geçiş ' + (pass + 1) + ' başlıyor: `pass = ' + pass + '`, `swapped = 0`.', 'Pass ' + (pass + 1) + ' begins: `pass = ' + pass + '`, `swapped = 0`.'),
                 { c: [{ n: 2, note: T('pass = ' + pass + ' < n-1 (' + (n - 1) + ')', 'pass = ' + pass + ' < n-1 (' + (n - 1) + ')') }, 3],
                   java: [{ n: 2, note: T('pass = ' + pass + ' < n-1 (' + (n - 1) + ')', 'pass = ' + pass + ' < n-1 (' + (n - 1) + ')') }, 3] });
        }
        for (var i = 0; i < n - 1 - pass; i++) {
          comparisons++;
          var vi = arr[i], vi1 = arr[i + 1];
          var willSwap = vi > vi1;
          if (detailed) {
            paint(settledFrom);
            S.set('b' + i, { style: 'active' }); S.set('b' + (i + 1), { style: 'active' });
            counters();
          }
          var note = willSwap ? T('a[' + i + ']=' + vi + ' > a[' + (i + 1) + ']=' + vi1 + '? evet', 'a[' + i + ']=' + vi + ' > a[' + (i + 1) + ']=' + vi1 + '? yes')
                               : T('a[' + i + ']=' + vi + ' > a[' + (i + 1) + ']=' + vi1 + '? hayır', 'a[' + i + ']=' + vi + ' > a[' + (i + 1) + ']=' + vi1 + '? no');
          if (willSwap) {
            arr[i] = vi1; arr[i + 1] = vi;
            swaps++; swappedThis = true; passSwaps++;
            if (detailed) {
              decide('swap', 'hl');
              paint(settledFrom);
              S.set('b' + i, { style: 'hl' }); S.set('b' + (i + 1), { style: 'hl' });
              counters();
              S.step(T('`a[' + i + ']` (' + vi + ') komşusundan (' + vi1 + ') büyük, yer değiştirirler.', '`a[' + i + ']` (' + vi + ') is larger than its neighbor (' + vi1 + '), they swap.'),
                     { c: [{ n: 4, note: T('i = ' + i + ' < n-1-pass (' + (n - 1 - pass) + ')', 'i = ' + i + ' < n-1-pass (' + (n - 1 - pass) + ')') }, { n: 5, note: note }, 6, 7, 8, 9],
                       java: [{ n: 4, note: T('i = ' + i + ' < n-1-pass (' + (n - 1 - pass) + ')', 'i = ' + i + ' < n-1-pass (' + (n - 1 - pass) + ')') }, { n: 5, note: note }, 6, 7, 8, 9] });
            }
          } else if (detailed) {
            decide('no swap', 'normal');
            S.step(T('Sıra doğru, yer değişmez.', 'Already in order, no swap.'),
                   { c: [{ n: 4, note: T('i = ' + i + ' < n-1-pass (' + (n - 1 - pass) + ')', 'i = ' + i + ' < n-1-pass (' + (n - 1 - pass) + ')') }, { n: 5, note: note }, { n: 6, skip: true }, { n: 7, skip: true }, { n: 8, skip: true }, { n: 9, skip: true }],
                     java: [{ n: 4, note: T('i = ' + i + ' < n-1-pass (' + (n - 1 - pass) + ')', 'i = ' + i + ' < n-1-pass (' + (n - 1 - pass) + ')') }, { n: 5, note: note }, { n: 6, skip: true }, { n: 7, skip: true }, { n: 8, skip: true }, { n: 9, skip: true }] });
          }
        }
        paint(settledFrom - 1); settledBrace(settledFrom - 1);
        decide('', 'normal'); counters();
        if (!detailed) {
          S.step(T('Geçiş ' + (pass + 1) + ': [' + passStart.join(', ') + '] → [' + arr.join(', ') + '] (' + passSwaps + ' yer değiştirme).',
                   'Pass ' + (pass + 1) + ': [' + passStart.join(', ') + '] -> [' + arr.join(', ') + '] (' + passSwaps + ' swaps).'),
                 { c: [{ n: 2, note: T('pass = ' + pass + ' < n-1 (' + (n - 1) + ')', 'pass = ' + pass + ' < n-1 (' + (n - 1) + ')') }, 3,
                       { n: 4, note: T('i = 0..' + (n - 2 - pass) + ' için tekrarlanır', 'repeats for i = 0..' + (n - 2 - pass)) },
                       { n: 5, note: T('a[i] > a[i+1] olduğunda yer değiştirir', 'swaps when a[i] > a[i+1]') }, 6, 7, 8, 9],
                   java: [{ n: 2, note: T('pass = ' + pass + ' < n-1 (' + (n - 1) + ')', 'pass = ' + pass + ' < n-1 (' + (n - 1) + ')') }, 3,
                          { n: 4, note: T('i = 0..' + (n - 2 - pass) + ' için tekrarlanır', 'repeats for i = 0..' + (n - 2 - pass)) },
                          { n: 5, note: T('a[i] > a[i+1] olduğunda yer değiştirir', 'swaps when a[i] > a[i+1]') }, 6, 7, 8, 9] });
        }
        if (!swappedThis) {
          S.step(T('Geçiş boyunca hiç yer değiştirme olmadı: dizi zaten sıralı. `swapped == 0` → erken çıkış, kalan geçişler atlanır.',
                   'No swap happened during this pass: the array is already sorted. `swapped == 0` → early exit, the remaining passes are skipped.'),
                 { c: [{ n: 12, note: T('swapped? hayır → break', 'swapped? no → break') }], java: [{ n: 12, note: T('swapped? hayır → break', 'swapped? no → break') }] });
          break;
        }
        S.step(T('Geçiş ' + (pass + 1) + ' bitti: en büyük kalan değer yerine yerleşti (kutu soluklaştı). `swapped == 1` → devam.',
                 'Pass ' + (pass + 1) + ' ends: the largest remaining value has settled (box dims). `swapped == 1` → continue.'),
               { c: [{ n: 12, note: T('swapped? evet → devam', 'swapped? yes → continue') }], java: [{ n: 12, note: T('swapped? evet → devam', 'swapped? yes → continue') }] });
      }
      paint(0);
      if (S.has('sortedb')) S.remove('sortedb');
      if (n > 1) S.brace('sortedb', { from: 'b0', to: 'b' + (n - 1), text: T('tamamen sıralı', 'fully sorted'), side: 'top', dist: 14, style: 'active' });
      decide('', 'normal');
      S.result = { sorted: arr.slice() };
      S.step(T('Bitti: [' + arr.join(', ') + ']. Toplam ' + comparisons + ' karşılaştırma, ' + swaps + ' yer değiştirme. En kötü durumda O(n²), erken çıkış sayesinde en iyi durumda (zaten sıralı) O(n).',
               'Done: [' + arr.join(', ') + ']. Total ' + comparisons + ' comparisons, ' + swaps + ' swaps. Worst case O(n²); thanks to the early exit, best case (already sorted) is O(n).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
