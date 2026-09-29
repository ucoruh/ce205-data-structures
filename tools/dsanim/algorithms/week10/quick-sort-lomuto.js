/* Week 10 -- Quick sort with Lomuto partitioning. The pivot (always the LAST element of the current range,
 * shown in red) never moves during the scan; `i` marks the boundary of the "<= pivot" region built so far,
 * `j` scans left to right comparing every other element against the pivot. At the end, the pivot swaps into
 * position i+1 -- its final, correctly sorted spot, shown dimmed forever after. Recursion then continues on
 * the left and right sub-ranges, each marked by a brace over the range currently being partitioned.
 * Comparisons and swaps are counted on the right. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'int partition_lomuto(int a[], int lo, int hi) {',
    '    int pivot = a[hi];              /* pivot = last element of the range */',
    '    int i = lo - 1;                 /* boundary of the "<= pivot" region */',
    '    for (int j = lo; j < hi; j++) {',
    '        if (a[j] <= pivot) {',
    '            i++;',
    '            int tmp = a[i]; a[i] = a[j]; a[j] = tmp;',
    '        }',
    '    }',
    '    int tmp2 = a[i + 1]; a[i + 1] = a[hi]; a[hi] = tmp2;   /* pivot to its final spot */',
    '    return i + 1;',
    '}',
    '',
    'void quick_sort_lomuto(int a[], int lo, int hi) {',
    '    if (lo < hi) {',
    '        int p = partition_lomuto(a, lo, hi);',
    '        quick_sort_lomuto(a, lo, p - 1);      /* left of the pivot */',
    '        quick_sort_lomuto(a, p + 1, hi);      /* right of the pivot */',
    '    }',
    '}'
  ];
  var J = [
    'int partitionLomuto(int[] a, int lo, int hi) {',
    '    int pivot = a[hi];              // pivot = last element of the range',
    '    int i = lo - 1;                 // boundary of the "<= pivot" region',
    '    for (int j = lo; j < hi; j++) {',
    '        if (a[j] <= pivot) {',
    '            i++;',
    '            int tmp = a[i]; a[i] = a[j]; a[j] = tmp;',
    '        }',
    '    }',
    '    int tmp2 = a[i + 1]; a[i + 1] = a[hi]; a[hi] = tmp2;   // pivot to its final spot',
    '    return i + 1;',
    '}',
    '',
    'void quickSortLomuto(int[] a, int lo, int hi) {',
    '    if (lo < hi) {',
    '        int p = partitionLomuto(a, lo, hi);',
    '        quickSortLomuto(a, lo, p - 1);        // left of the pivot',
    '        quickSortLomuto(a, p + 1, hi);        // right of the pivot',
    '    }',
    '}'
  ];

  D.define({
    id: 'quick-sort-lomuto',
    title: T('Hızlı sıralama -- Lomuto bölümleme', 'Quick sort -- Lomuto partition'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 rastgele değer', '10 unordered values'),
        data: { values: [38, 27, 43, 3, 9, 82, 10, 15, 31, 6] } },
      { id: 'hard', level: 'hard', name: T('12 değer, tekrarlı anahtarlar', '12 values with repeated keys'),
        data: { values: [7, 2, 7, 9, 2, 7, 4, 9, 2, 4, 7, 9] } },
      { id: 'already-sorted', level: 'edge', name: T('Zaten sıralı: en kötü durum, her bölüm n-1/0 boyutlu', 'Already sorted: worst case, every partition is n-1/0'),
        data: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı: yine en kötü durum', 'Reverse sorted: worst case again'),
        data: { values: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] } },
      { id: 'all-equal', level: 'edge', name: T('Hepsi eşit: tüm değerler pivota eşit', 'All equal: every value equals the pivot'),
        data: { values: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5] } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler: INT_MAX, INT_MIN, sıfır', 'Extreme values: INT_MAX, INT_MIN, zero'),
        data: { values: [0, 2147483647, -2147483648, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1] } },
      { id: 'single', level: 'edge', name: T('Tek değer: `lo < hi` sağlanmaz', 'A single value: `lo < hi` does not hold'), small: true,
        data: { values: [21] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.values.length; },
    reference: function (d) { return { sorted: d.values.slice().sort(function (a, b) { return a - b; }) }; },
    random: function (level, r) {
      var n = { easy: 10, normal: 10, hard: 12, extreme: 13 }[level];
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
        if (values.length > 20) throw T('En çok 20 değer.', 'At most 20 values.');
        return { values: values };
      },
      format: function (d) { return d.values.join(' '); },
      tokens: function (d) { return d.values.map(String); },
      bad: ['', '5 x 7', '3.5 8', ',,,']
    },
    build: function (S, d) {
      var arr = d.values.slice(), n = arr.length;
      var W = 56, H = 44, X0 = 70, Y0 = 100;
      var comparisons = 0, swaps = 0;

      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: 'A =', anchor: 'end', size: 15, bold: true, mono: true });
      for (var i0 = 0; i0 < n; i0++) S.box('b' + i0, { x: X0 + i0 * W, y: Y0, w: W - 6, h: H, text: String(arr[i0]), style: 'normal', size: 16, above: String(i0) });
      var RX = X0 + n * W + 30;
      S.label('cnt', { x: RX, y: Y0 - 40, text: 'comparisons: 0   swaps: 0', size: 15, bold: true, mono: true, anchor: 'start' });
      S.label('decision', { x: RX, y: Y0 - 10, text: '', size: 16, bold: true, mono: true, anchor: 'start', style: 'normal' });

      var finalized = [];
      function counters() { S.set('cnt', { text: 'comparisons: ' + comparisons + '   swaps: ' + swaps }); }
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      function paint(lo, hi, i, j, pivotIdx) {
        for (var k = 0; k < n; k++) {
          var st = 'normal';
          if (finalized.indexOf(k) >= 0) st = 'dim';
          else if (k < lo || k > hi) st = 'dim';
          if (k === pivotIdx) st = 'del';
          else if (k === j) st = 'active';
          else if (k === i && i >= lo) st = 'hl';
          S.set('b' + k, { text: String(arr[k]), style: st });
        }
      }
      function rangeBrace(lo, hi) {
        if (S.has('rangeb')) S.remove('rangeb');
        if (hi > lo) S.brace('rangeb', { from: 'b' + lo, to: 'b' + hi, text: T('bölüm aralığı', 'partition range'), side: 'top', dist: 14, style: 'active' });
      }

      S.step(T(n + ' değerlik dizi. Lomuto bölümlemesi her zaman aralığın SON elemanını pivot seçer (kırmızı kutu).',
               n + ' values. Lomuto partitioning always picks the LAST element of the range as the pivot (red box).'),
             { c: [14, { n: 15, note: T('lo < hi olduğunda çalışır', 'runs when lo < hi') }],
               java: [14, { n: 15, note: T('lo < hi olduğunda çalışır', 'runs when lo < hi') }] });

      var firstPartition = true;
      function qs(lo, hi) {
        if (lo >= hi) {
          if (lo === hi) finalized.push(lo);
          paint(lo, hi);
          S.step(T('`lo < hi` sağlanmıyor (lo=' + lo + ', hi=' + hi + '): bu aralık en çok 1 eleman, zaten sıralı.', '`lo < hi` does not hold (lo=' + lo + ', hi=' + hi + '): this range has at most 1 element, already sorted.'),
                 { c: [{ n: 15, note: T('lo < hi? hayır', 'lo < hi? no') }], java: [{ n: 15, note: T('lo < hi? hayır', 'lo < hi? no') }] });
          return;
        }
        var detailed = firstPartition;
        if (detailed) firstPartition = false;
        var pivot = arr[hi];
        var rangeStart = arr.slice(lo, hi + 1);
        var callComparisons = 0, callSwaps = 0;
        rangeBrace(lo, hi);
        if (detailed) {
          paint(lo, hi, lo - 1, undefined, hi);
          S.step(T('`quick_sort_lomuto(' + lo + ', ' + hi + ')`: pivot = a[' + hi + '] = ' + pivot + '. `i = ' + (lo - 1) + '` ile başlar.', '`quick_sort_lomuto(' + lo + ', ' + hi + ')`: pivot = a[' + hi + '] = ' + pivot + '. Starts with `i = ' + (lo - 1) + '`.'),
                 { c: [{ n: 15, note: T('lo < hi? evet', 'lo < hi? yes') }, 1, 2, 3], java: [{ n: 15, note: T('lo < hi? evet', 'lo < hi? yes') }, 1, 2, 3] });
        }
        var i = lo - 1;
        for (var j = lo; j < hi; j++) {
          comparisons++;
          callComparisons++;
          var le = arr[j] <= pivot;
          if (detailed) { paint(lo, hi, i, j, hi); counters(); }
          var note = le ? T('a[' + j + ']=' + arr[j] + ' <= pivot=' + pivot + '? evet', 'a[' + j + ']=' + arr[j] + ' <= pivot=' + pivot + '? yes') : T('a[' + j + ']=' + arr[j] + ' <= pivot=' + pivot + '? hayır', 'a[' + j + ']=' + arr[j] + ' <= pivot=' + pivot + '? no');
          if (le) {
            i++;
            if (i !== j) {
              var vi = arr[i], vj = arr[j];
              arr[i] = vj; arr[j] = vi;
              swaps++;
              callSwaps++;
              if (detailed) decide('swap', 'hl');
            } else if (detailed) decide('i == j', 'normal');
            if (detailed) {
              paint(lo, hi, i, j, hi);
              counters();
              S.step(T('a[' + j + '] pivottan büyük değil: `i` bir artar (' + i + ')' + (i !== j ? ', a[i] ve a[j] yer değiştirir' : '') + '.', 'a[' + j + '] is not greater than the pivot: `i` advances (' + i + ')' + (i !== j ? ', a[i] and a[j] swap' : '') + '.'),
                     { c: [{ n: 4, note: T('j = ' + j + ' < hi (' + hi + ')', 'j = ' + j + ' < hi (' + hi + ')') }, { n: 5, note: note }, 6, 7],
                       java: [{ n: 4, note: T('j = ' + j + ' < hi (' + hi + ')', 'j = ' + j + ' < hi (' + hi + ')') }, { n: 5, note: note }, 6, 7] });
            }
          } else if (detailed) {
            decide('', 'normal');
            S.step(T('a[' + j + '] pivottan büyük: yerinde kalır, `i` değişmez.', 'a[' + j + '] is greater than the pivot: it stays put, `i` does not move.'),
                   { c: [{ n: 4, note: T('j = ' + j + ' < hi (' + hi + ')', 'j = ' + j + ' < hi (' + hi + ')') }, { n: 5, note: note }, { n: 6, skip: true }, { n: 7, skip: true }],
                     java: [{ n: 4, note: T('j = ' + j + ' < hi (' + hi + ')', 'j = ' + j + ' < hi (' + hi + ')') }, { n: 5, note: note }, { n: 6, skip: true }, { n: 7, skip: true }] });
          }
        }
        var vip = arr[i + 1], vhi = arr[hi];
        arr[i + 1] = vhi; arr[hi] = vip;
        swaps++;
        callSwaps++;
        finalized.push(i + 1);
        if (detailed) {
          decide('pivot placed', 'new');
          paint(lo, hi, i, undefined, undefined);
          S.set('b' + (i + 1), { style: 'new' });
          counters();
          S.step(T('Tarama bitti. Pivot (' + vhi + ') `i+1 = ' + (i + 1) + '` ile yer değiştirir: artık dizide DOĞRU (final) yerinde.', 'Scan done. The pivot (' + vhi + ') swaps with `i+1 = ' + (i + 1) + '`: it is now in its FINAL, correct position.'),
                 { c: [10, 11], java: [10, 11] });
        } else {
          decide('', 'normal');
          paint(lo, hi, i, undefined, undefined);
          S.set('b' + (i + 1), { style: 'new' });
          counters();
          S.step(T('`quick_sort_lomuto(' + lo + ', ' + hi + ')`: pivot = ' + vhi + ', [' + rangeStart.join(', ') + '] → [' + arr.slice(lo, hi + 1).join(', ') + '] (' + callComparisons + ' karşılaştırma, ' + callSwaps + ' yer değiştirme). Pivot artık `i+1 = ' + (i + 1) + '`de, final yerinde.',
                   '`quick_sort_lomuto(' + lo + ', ' + hi + ')`: pivot = ' + vhi + ', [' + rangeStart.join(', ') + '] -> [' + arr.slice(lo, hi + 1).join(', ') + '] (' + callComparisons + ' comparisons, ' + callSwaps + ' swaps). The pivot is now at `i+1 = ' + (i + 1) + '`, its final position.'),
                 { c: [1, 2, 3, { n: 4, note: T('j = ' + lo + '..' + (hi - 1) + ' için tekrarlanır', 'repeats for j = ' + lo + '..' + (hi - 1)) },
                       { n: 5, note: T('a[j] <= pivot olduğunda i artar', 'i advances when a[j] <= pivot') }, 6, 7, 10, 11],
                   java: [1, 2, 3, { n: 4, note: T('j = ' + lo + '..' + (hi - 1) + ' için tekrarlanır', 'repeats for j = ' + lo + '..' + (hi - 1)) },
                          { n: 5, note: T('a[j] <= pivot olduğunda i artar', 'i advances when a[j] <= pivot') }, 6, 7, 10, 11] });
        }
        var p = i + 1;
        qs(lo, p - 1);
        qs(p + 1, hi);
      }
      qs(0, n - 1);
      if (S.has('rangeb')) S.remove('rangeb');
      paint(0, -1);
      decide('', 'normal');
      S.result = { sorted: arr.slice() };
      S.step(T('Bitti: [' + arr.join(', ') + ']. Toplam ' + comparisons + ' karşılaştırma, ' + swaps + ' yer değiştirme. Ortalama O(n log n); zaten sıralı/tersten sıralı girdide O(n²) (bkz. quick-sort-worst-case).',
               'Done: [' + arr.join(', ') + ']. Total ' + comparisons + ' comparisons, ' + swaps + ' swaps. Average O(n log n); already-sorted/reverse-sorted input gives O(n²) (see quick-sort-worst-case).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
