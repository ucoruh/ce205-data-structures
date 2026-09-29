/* Week 10 -- Bucket sort: for values spread roughly evenly over a known range [0, max_val], distribute them
 * into BUCKETS = 10 buckets by their leading digit (here max_val = 99, so bucket b holds every value in
 * [10b, 10b+9) -- literally the tens digit), sort each bucket with plain insertion sort (buckets are small,
 * so that is cheap), then concatenate the buckets in order 0..9. If the values really are spread evenly, every
 * bucket gets about n/BUCKETS elements and the whole sort costs O(n) on average; if they all land in one
 * bucket (see the "same bucket" example), it degrades to plain insertion sort on all n elements, O(n^2). */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    '#define BUCKETS 10',
    '#define MAX_N 20',
    '',
    'void bucket_sort(int a[], int n, int max_val) {',
    '    int bucket[BUCKETS][MAX_N];',
    '    int bucket_len[BUCKETS] = {0};',
    '    for (int i = 0; i < n; i++) {',
    '        int b = (a[i] * BUCKETS) / (max_val + 1);   /* which bucket this value belongs to */',
    '        bucket[b][bucket_len[b]++] = a[i];',
    '    }',
    '    int k = 0;',
    '    for (int b = 0; b < BUCKETS; b++) {',
    '        for (int x = 1; x < bucket_len[b]; x++) {          /* insertion sort within the bucket */',
    '            int key = bucket[b][x], y = x - 1;',
    '            while (y >= 0 && bucket[b][y] > key) { bucket[b][y + 1] = bucket[b][y]; y--; }',
    '            bucket[b][y + 1] = key;',
    '        }',
    '        for (int i = 0; i < bucket_len[b]; i++) a[k++] = bucket[b][i];',
    '    }',
    '}'
  ];
  var J = [
    'static final int BUCKETS = 10;',
    'static final int MAX_N = 20;',
    '',
    'void bucketSort(int[] a, int n, int maxVal) {',
    '    int[][] bucket = new int[BUCKETS][MAX_N];',
    '    int[] bucketLen = new int[BUCKETS];',
    '    for (int i = 0; i < n; i++) {',
    '        int b = (a[i] * BUCKETS) / (maxVal + 1);    // which bucket this value belongs to',
    '        bucket[b][bucketLen[b]++] = a[i];',
    '    }',
    '    int k = 0;',
    '    for (int b = 0; b < BUCKETS; b++) {',
    '        for (int x = 1; x < bucketLen[b]; x++) {           // insertion sort within the bucket',
    '            int key = bucket[b][x], y = x - 1;',
    '            while (y >= 0 && bucket[b][y] > key) { bucket[b][y + 1] = bucket[b][y]; y--; }',
    '            bucket[b][y + 1] = key;',
    '        }',
    '        for (int i = 0; i < bucketLen[b]; i++) a[k++] = bucket[b][i];',
    '    }',
    '}'
  ];

  var BUCKETS = 10, MAXVAL = 99;

  D.define({
    id: 'bucket-sort',
    title: T('Kova sıralaması (bucket sort)', 'Bucket sort'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 değer, 0-99, kovalara iyi dağılmış', '10 values, 0-99, spread well across the buckets'),
        data: { values: [42, 8, 77, 15, 91, 33, 56, 24, 68, 5] } },
      { id: 'hard', level: 'hard', name: T('14 değer, bazı kovalarda çakışma var', '14 values, some buckets collide'),
        data: { values: [42, 45, 8, 77, 71, 15, 91, 33, 38, 56, 24, 68, 5, 3] } },
      { id: 'already-sorted', level: 'edge', name: T('Zaten sıralı', 'Already sorted'),
        data: { values: [2, 12, 22, 33, 44, 55, 66, 77, 88, 99] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı', 'Reverse sorted'),
        data: { values: [99, 88, 77, 66, 55, 44, 33, 22, 12, 2] } },
      { id: 'same-bucket', level: 'edge', name: T('Hepsi tek kovada: en kötü durum, O(n²)\'ye düşer', 'All in one bucket: worst case, degrades to O(n^2)'),
        data: { values: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49] } },
      { id: 'duplicates', level: 'edge', name: T('Aynı kovada tekrarlı değerler', 'Duplicate values inside the same bucket'),
        data: { values: [23, 23, 25, 23, 25, 61, 61, 61, 8, 8] } },
      { id: 'single', level: 'edge', name: T('Tek değer', 'A single value'), small: true,
        data: { values: [50] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.values.length; },
    reference: function (d) { return { sorted: d.values.slice().sort(function (a, b) { return a - b; }) }; },
    random: function (level, r) {
      var n = { easy: 10, normal: 11, hard: 14, extreme: 14 }[level];
      var values = [];
      for (var i = 0; i < n; i++) values.push(D.randInt(r, 0, MAXVAL));
      return { values: values };
    },
    input: {
      hint: T('Örnek: 42 8 77 15 91 33 56 24 68 5  (0-99 arası)', 'Example: 42 8 77 15 91 33 56 24 68 5  (in 0-99)'),
      parse: function (text) {
        var values = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (!/^\d+$/.test(tok)) throw T('"' + tok + '" 0-99 arası negatif olmayan bir tam sayı olmalı.', '"' + tok + '" must be a non-negative integer in 0-99.');
          var v = parseInt(tok, 10);
          if (v > MAXVAL) throw T('Bu gösterimde en çok 99 değerine izin var.', 'This demo accepts at most the value 99.');
          values.push(v);
        });
        if (!values.length) throw T('En az bir değer yazın.', 'Write at least one value.');
        if (values.length > 18) throw T('En çok 18 değer.', 'At most 18 values.');
        return { values: values };
      },
      format: function (d) { return d.values.join(' '); },
      tokens: function (d) { return d.values.map(String); },
      bad: ['', '5 x 7', '3.5 8', '-3 4', '101 2']
    },
    build: function (S, d) {
      var arr = d.values.slice(), n = arr.length;
      var W = 46, H = 34, X0 = 100;
      var Y_IN = 30, Y_BUCK0 = 110, ROWH = 38, Y_OUT = Y_BUCK0 + BUCKETS * ROWH + 30;
      var comparisons = 0, moves = 0;

      S.label('rlin', { x: X0 - 20, y: Y_IN + H / 2 + 4, text: 'A =', anchor: 'end', size: 15, bold: true, mono: true });
      for (var i = 0; i < n; i++) S.box('in' + i, { x: X0 + i * W, y: Y_IN, w: W - 6, h: H, text: String(arr[i]), style: 'normal', size: 14, above: String(i) });

      var buckets = []; for (var b0 = 0; b0 < BUCKETS; b0++) buckets.push([]);
      for (var b1 = 0; b1 < BUCKETS; b1++) S.label('rlb' + b1, { x: X0 - 20, y: Y_BUCK0 + b1 * ROWH + H / 2 + 4, text: 'bucket[' + b1 + ']', anchor: 'end', size: 12, mono: true, style: 'dim' });

      S.label('rlout', { x: X0 - 20, y: Y_OUT + H / 2 + 4, text: 'A (sorted) =', anchor: 'end', size: 14, bold: true, mono: true });

      var RX = X0 + Math.max(n, 6) * W + 30;
      S.label('cnt', { x: RX, y: Y_IN, text: 'comparisons: 0   moves: 0', size: 14, bold: true, mono: true, anchor: 'start' });
      function counters() { S.set('cnt', { text: 'comparisons: ' + comparisons + '   moves: ' + moves }); }

      S.step(T(n + ' değer, 0-99 arası, ' + BUCKETS + ' kova. `b = a[i] * ' + BUCKETS + ' / 100` -- onlar basamağı, kova numarasıdır.',
               n + ' values, in 0-99, ' + BUCKETS + ' buckets. `b = a[i] * ' + BUCKETS + ' / 100` -- the tens digit IS the bucket number.'),
             { c: [4, 5, 6], java: [4, 5, 6] });

      for (var k = 0; k < n; k++) {
        var v = arr[k], b = Math.floor(v * BUCKETS / (MAXVAL + 1));
        buckets[b].push(v);
        moves++;
        S.set('in' + k, { style: 'active' });
        var bx = X0 + (buckets[b].length - 1) * W;
        S.box('bk' + b + '_' + (buckets[b].length - 1), { x: bx, y: Y_BUCK0 + b * ROWH, w: W - 6, h: H - 6, text: String(v), style: 'new' });
        counters();
        S.step(T('a[' + k + ']=' + v + ' → `bucket[' + b + ']` (' + (10 * b) + '-' + (10 * b + 9) + ').', 'a[' + k + ']=' + v + ' -> `bucket[' + b + ']` (' + (10 * b) + '-' + (10 * b + 9) + ').'),
               { c: [{ n: 7, note: T('i = ' + k + ' < n (' + n + ')', 'i = ' + k + ' < n (' + n + ')') }, 8, 9],
                 java: [{ n: 7, note: T('i = ' + k + ' < n (' + n + ')', 'i = ' + k + ' < n (' + n + ')') }, 8, 9] });
        S.set('in' + k, { style: 'dim' });
        for (var q = 0; q < buckets[b].length; q++) S.set('bk' + b + '_' + q, { style: 'normal' });
      }

      var out = [], firstSortShown = false;
      for (var bb = 0; bb < BUCKETS; bb++) {
        var arrb = buckets[bb];
        if (arrb.length > 1) {
          var before = arrb.slice();
          for (var x = 1; x < arrb.length; x++) {
            var key = arrb[x], y = x - 1;
            while (y >= 0 && arrb[y] > key) { comparisons++; arrb[y + 1] = arrb[y]; moves++; y--; }
            if (y >= 0) comparisons++;
            arrb[y + 1] = key;
          }
          for (var q2 = 0; q2 < arrb.length; q2++) S.set('bk' + bb + '_' + q2, { text: String(arrb[q2]), style: 'hl' });
          counters();
          if (!firstSortShown) {
            firstSortShown = true;
            S.step(T('`bucket[' + bb + ']` = [' + before.join(',') + '] birden fazla eleman içeriyor: eklemeli sıralamayla sıralanır → [' + arrb.join(',') + '].', '`bucket[' + bb + ']` = [' + before.join(',') + '] has more than one element: insertion sort sorts it -> [' + arrb.join(',') + '].'),
                   { c: [{ n: 12, note: T('b = ' + bb + ' < ' + BUCKETS, 'b = ' + bb + ' < ' + BUCKETS) },
                         { n: 13, note: T('x = 1..' + (arrb.length - 1) + ' için tekrarlanır', 'repeats for x = 1..' + (arrb.length - 1)) }, 14,
                         { n: 15, note: T('gerektiğinde kaydırılır', 'shifts while needed') }],
                     java: [{ n: 12, note: T('b = ' + bb + ' < ' + BUCKETS, 'b = ' + bb + ' < ' + BUCKETS) },
                            { n: 13, note: T('x = 1..' + (arrb.length - 1) + ' için tekrarlanır', 'repeats for x = 1..' + (arrb.length - 1)) }, 14,
                            { n: 15, note: T('gerektiğinde kaydırılır', 'shifts while needed') }] });
          } else {
            S.step(T('`bucket[' + bb + ']` = [' + before.join(',') + '] → [' + arrb.join(',') + '] (eklemeli sıralama).', '`bucket[' + bb + ']` = [' + before.join(',') + '] -> [' + arrb.join(',') + '] (insertion sort).'),
                   { c: [{ n: 12, note: T('b = ' + bb + ' < ' + BUCKETS, 'b = ' + bb + ' < ' + BUCKETS) },
                         { n: 13, note: T('x = 1..' + (arrb.length - 1) + ' için tekrarlanır', 'repeats for x = 1..' + (arrb.length - 1)) }, 14,
                         { n: 15, note: T('gerektiğinde kaydırılır', 'shifts while needed') }],
                     java: [{ n: 12, note: T('b = ' + bb + ' < ' + BUCKETS, 'b = ' + bb + ' < ' + BUCKETS) },
                            { n: 13, note: T('x = 1..' + (arrb.length - 1) + ' için tekrarlanır', 'repeats for x = 1..' + (arrb.length - 1)) }, 14,
                            { n: 15, note: T('gerektiğinde kaydırılır', 'shifts while needed') }] });
          }
          for (var q3 = 0; q3 < arrb.length; q3++) S.set('bk' + bb + '_' + q3, { style: 'normal' });
        }
        for (var e = 0; e < arrb.length; e++) {
          out.push(arrb[e]);
          moves++;
          S.box('out' + (out.length - 1), { x: X0 + (out.length - 1) * W, y: Y_OUT, w: W - 6, h: H, text: String(arrb[e]), style: 'new', size: 14, above: String(out.length - 1) });
          if (arrb.length >= 1) S.set('bk' + bb + '_' + e, { style: 'dim' });
        }
        counters();
      }
      S.step(T('Tüm kovalar sırayla (0..9) birleştirilir → tam sıralı dizi.', 'All buckets are concatenated in order (0..9) -> the fully sorted array.'),
             { c: [{ n: 18, note: T('her kova için i = 0..bucket_len[b]-1 tekrarlanır', 'repeats for i = 0..bucket_len[b]-1 in every bucket') }],
               java: [{ n: 18, note: T('her kova için i = 0..bucketLen[b]-1 tekrarlanır', 'repeats for i = 0..bucketLen[b]-1 in every bucket') }] });

      S.result = { sorted: out.slice() };
      S.step(T('Bitti: [' + out.join(', ') + ']. Toplam ' + comparisons + ' karşılaştırma (kova-içi eklemeli sıralamadan), ' + moves + ' taşıma. Değerler düzgün dağılmışsa ortalama O(n); hepsi tek kovaya düşerse O(n²).',
               'Done: [' + out.join(', ') + ']. Total ' + comparisons + ' comparisons (from the within-bucket insertion sorts), ' + moves + ' moves. O(n) average when values are spread evenly; O(n^2) if they all land in one bucket.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
