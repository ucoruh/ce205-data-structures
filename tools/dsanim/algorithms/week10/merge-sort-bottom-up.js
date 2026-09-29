/* Week 10 -- Merge sort, bottom-up (iterative): no recursion at all. Start by treating every single element as
 * a sorted run of width 1; merge adjacent runs into width-2 runs, left to right across the whole array; then
 * merge those into width-4 runs; and so on, doubling the run width every round, until one round produces a
 * single run covering the whole array. Each round is its own row. The first merge of the animation is shown
 * comparison by comparison; later merges in the same round are lumped into one step. Same `merge()` helper,
 * same total work, as top-down merge sort -- just reached by a loop over widths instead of recursive calls. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'void merge(int a[], int lo, int mid, int hi, int tmp[]) {',
    '    int i = lo, j = mid, k = lo;',
    '    while (i < mid && j < hi)',
    '        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];',
    '    while (i < mid) tmp[k++] = a[i++];    /* copy the left leftovers */',
    '    while (j < hi)  tmp[k++] = a[j++];    /* copy the right leftovers */',
    '    for (int x = lo; x < hi; x++) a[x] = tmp[x];',
    '}',
    '',
    'void merge_sort_bottom_up(int a[], int n, int tmp[]) {',
    '    for (int width = 1; width < n; width *= 2) {   /* run width doubles every round */',
    '        for (int lo = 0; lo < n - width; lo += 2 * width) {',
    '            int mid = lo + width;',
    '            int hi = mid + width < n ? mid + width : n;',
    '            merge(a, lo, mid, hi, tmp);',
    '        }',
    '    }',
    '}'
  ];
  var J = [
    'void merge(int[] a, int lo, int mid, int hi, int[] tmp) {',
    '    int i = lo, j = mid, k = lo;',
    '    while (i < mid && j < hi)',
    '        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];',
    '    while (i < mid) tmp[k++] = a[i++];    // copy the left leftovers',
    '    while (j < hi)  tmp[k++] = a[j++];    // copy the right leftovers',
    '    for (int x = lo; x < hi; x++) a[x] = tmp[x];',
    '}',
    '',
    'void mergeSortBottomUp(int[] a, int n, int[] tmp) {',
    '    for (int width = 1; width < n; width *= 2) {   // run width doubles every round',
    '        for (int lo = 0; lo < n - width; lo += 2 * width) {',
    '            int mid = lo + width;',
    '            int hi = Math.min(mid + width, n);',
    '            merge(a, lo, mid, hi, tmp);',
    '        }',
    '    }',
    '}'
  ];

  D.define({
    id: 'merge-sort-bottom-up',
    title: T('Birleştirmeli sıralama (aşağıdan yukarı, yinelemeli)', 'Merge sort (bottom-up, iterative)'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 rastgele değer', '10 unordered values'),
        data: { values: [38, 27, 43, 3, 9, 82, 10, 15, 31, 6] } },
      { id: 'hard', level: 'hard', name: T('14 değer, n bir 2 kuvveti değil (son çalışma alanı eksik)', '14 values, n is not a power of 2 (a final partial run)'),
        data: { values: [45, 2, 38, 9, 33, 14, 29, 6, 41, 18, 24, 11, 36, 20] } },
      { id: 'power-of-two', level: 'hard', name: T('16 değer: n tam 2 kuvveti, tüm turlar eşit çalışır', '16 values: n is exactly a power of 2, every round is even'),
        data: { values: [16, 3, 9, 14, 1, 12, 7, 10, 5, 15, 2, 11, 8, 13, 4, 6] } },
      { id: 'already-sorted', level: 'edge', name: T('Zaten sıralı: yine de tüm turlar çalışır', 'Already sorted: every round still runs'),
        data: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı', 'Reverse sorted'),
        data: { values: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler: INT_MAX, INT_MIN, sıfır', 'Extreme values: INT_MAX, INT_MIN, zero'),
        data: { values: [0, 2147483647, -2147483648, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1] } },
      { id: 'single', level: 'edge', name: T('Tek değer: `width < n` hiç sağlanmaz', 'A single value: `width < n` never holds'), small: true,
        data: { values: [17] } }
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
      hint: T('Örnek: 38 27 43 3 9 82 10 15 31 6', 'Example: 38 27 43 3 9 82 10 15 31 6'),
      parse: function (text) {
        var values = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" bir tam sayı değil.', '"' + tok + '" is not an integer.');
          values.push(parseInt(tok, 10));
        });
        if (!values.length) throw T('En az bir değer yazın.', 'Write at least one value.');
        if (values.length > 24) throw T('En çok 24 değer.', 'At most 24 values.');
        return { values: values };
      },
      format: function (d) { return d.values.join(' '); },
      tokens: function (d) { return d.values.map(String); },
      bad: ['', '5 x 7', '3.5 8', ',,,']
    },
    build: function (S, d) {
      var arr = d.values.slice(), n = arr.length;
      var W = Math.max(30, Math.min(48, Math.floor(760 / Math.max(n, 1)))), H = 30, X0 = 90, Y0 = 40, ROWH = 52;
      var comparisons = 0, moves = 0;

      var RX = X0 + n * W + 30;
      S.label('cnt', { x: RX, y: Y0 - 20, text: 'comparisons: 0   moves: 0', size: 15, bold: true, mono: true, anchor: 'start' });
      function counters() { S.set('cnt', { text: 'comparisons: ' + comparisons + '   moves: ' + moves }); }

      function drawRow(rowIdx, values, label) {
        S.label('rl' + rowIdx, { x: X0 - 16, y: Y0 + rowIdx * ROWH + H / 2 + 4, text: label, anchor: 'end', size: 13, mono: true, style: 'dim' });
        for (var i = 0; i < n; i++) S.box('d' + rowIdx + '_' + i, { x: X0 + i * W, y: Y0 + rowIdx * ROWH, w: W - 4, h: H, text: String(values[i]), style: 'normal', size: 12 });
      }
      function rowValues(rowIdx) { var v = []; for (var i = 0; i < n; i++) v.push(Number(S.get('d' + rowIdx + '_' + i).text)); return v; }
      function setRow(rowIdx, values, hiFrom, hiTo, style) {
        for (var i = 0; i < n; i++) {
          var st = (hiFrom !== undefined && i >= hiFrom && i < hiTo) ? style : 'normal';
          S.set('d' + rowIdx + '_' + i, { text: String(values[i]), style: st });
        }
      }

      drawRow(0, arr, 'width=0');
      S.step(T(n + ' değerlik dizi. Her eleman başta genişliği 1 olan sıralı bir çalışma (run) sayılır. `width` her turda ikiye katlanır.',
               n + ' values. Every element starts as a sorted run of width 1. `width` doubles every round.'),
             { c: [10], java: [10] });

      var row = 0, firstMergeShown = false;
      for (var width = 1; width < n; width *= 2) {
        var vals = rowValues(row);
        var nextRow = row + 1;
        drawRow(nextRow, vals, 'width=' + (width * 2));
        S.step(T('Tur: `width = ' + width + '`. Bitişik ' + width + '-genişlikli çalışmalar ikişer ikişer birleştirilir.', 'Round: `width = ' + width + '`. Adjacent width-' + width + ' runs are merged two at a time.'),
               { c: [{ n: 11, note: T('width = ' + width + ' < n (' + n + ')', 'width = ' + width + ' < n (' + n + ')') }],
                 java: [{ n: 11, note: T('width = ' + width + ' < n (' + n + ')', 'width = ' + width + ' < n (' + n + ')') }] });
        for (var lo = 0; lo < n - width; lo += 2 * width) {
          var mid = lo + width;
          var hi = Math.min(mid + width, n);
          var left = vals.slice(lo, mid), right = vals.slice(mid, hi);
          var out = [];
          var detailed = !firstMergeShown;
          if (detailed) firstMergeShown = true;
          var i = 0, j = 0;
          setRow(nextRow, vals, lo, hi, 'active');
          if (detailed) {
            S.step(T('Birleştir: [' + left.join(',') + '] ve [' + right.join(',') + '] (lo=' + lo + ', mid=' + mid + ', hi=' + hi + ').', 'Merge: [' + left.join(',') + '] and [' + right.join(',') + '] (lo=' + lo + ', mid=' + mid + ', hi=' + hi + ').'),
                   { c: [{ n: 12, note: T('lo = ' + lo + ' < n - width', 'lo = ' + lo + ' < n - width') }, 13,
                         { n: 14, note: T('mid + width < n ? ' + (mid + width < n), 'mid + width < n ? ' + (mid + width < n)) }, 15],
                     java: [{ n: 12, note: T('lo = ' + lo + ' < n - width', 'lo = ' + lo + ' < n - width') }, 13,
                            { n: 14, note: T('mid + width < n ? ' + (mid + width < n), 'mid + width < n ? ' + (mid + width < n)) }, 15] });
          }
          while (i < left.length && j < right.length) {
            comparisons++;
            var takeLeft = left[i] <= right[j];
            var note = takeLeft ? T(left[i] + ' <= ' + right[j] + '? evet', left[i] + ' <= ' + right[j] + '? yes') : T(left[i] + ' <= ' + right[j] + '? hayır', left[i] + ' <= ' + right[j] + '? no');
            var v = takeLeft ? left[i++] : right[j++];
            out.push(v); moves++;
            if (detailed) {
              counters();
              var full = rowValues(nextRow); for (var q = 0; q < out.length; q++) full[lo + q] = out[q];
              setRow(nextRow, full, lo, lo + out.length, 'new');
              S.step(T((takeLeft ? 'Sol' : 'Sağ') + ' değer (' + v + ') küçük ya da eşit: çıktıya yazılır.', 'The ' + (takeLeft ? 'left' : 'right') + ' value (' + v + ') is smaller or equal: it is written to the output.'),
                     { c: [{ n: 3, note: T('i < mid && j < hi? evet', 'i < mid && j < hi? yes') }, { n: 4, note: note }],
                       java: [{ n: 3, note: T('i < mid && j < hi? evet', 'i < mid && j < hi? yes') }, { n: 4, note: note }] });
            }
          }
          while (i < left.length) { out.push(left[i++]); moves++; }
          while (j < right.length) { out.push(right[j++]); moves++; }
          var full2 = rowValues(nextRow);
          for (var q2 = 0; q2 < out.length; q2++) full2[lo + q2] = out[q2];
          setRow(nextRow, full2, lo, hi, 'new');
          vals = full2;
          counters();
          S.step(T('Birleştirildi → [' + out.join(',') + '].', 'Merged -> [' + out.join(',') + '].'),
                 { c: [{ n: 5, note: T('i < mid iken tekrarlanır', 'repeats while i < mid') },
                       { n: 6, note: T('j < hi iken tekrarlanır', 'repeats while j < hi') },
                       { n: 7, note: T('x = lo..hi-1 için kopyalanır', 'copied for x = lo..hi-1') }],
                   java: [{ n: 5, note: T('i < mid iken tekrarlanır', 'repeats while i < mid') },
                          { n: 6, note: T('j < hi iken tekrarlanır', 'repeats while j < hi') },
                          { n: 7, note: T('x = lo..hi-1 için kopyalanır', 'copied for x = lo..hi-1') }] });
        }
        setRow(nextRow, vals);
        row = nextRow;
      }
      if (n <= 1) {
        S.step(T('`width < n` (1 < ' + n + ') hiç sağlanmaz: dizi zaten (önemsizce) sıralı, hiç tur çalışmaz.', '`width < n` (1 < ' + n + ') never holds: the array is already (trivially) sorted, no round ever runs.'),
               { c: [{ n: 11, note: T('width < n? hayır', 'width < n? no') }], java: [{ n: 11, note: T('width < n? hayır', 'width < n? no') }] });
      }
      S.result = { sorted: rowValues(row) };
      S.step(T('Bitti: [' + rowValues(row).join(', ') + ']. Toplam ' + comparisons + ' karşılaştırma, ' + moves + ' yazma. Aynı O(n log n) maliyet, ama özyineleme çağrı yığını (call stack) hiç kullanılmaz.',
               'Done: [' + rowValues(row).join(', ') + ']. Total ' + comparisons + ' comparisons, ' + moves + ' moves. Same O(n log n) cost, but no recursion call stack is ever used.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
