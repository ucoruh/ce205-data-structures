/* Week 10 -- Quick sort with Hoare partitioning. The pivot is the FIRST element of the range (red box) and,
 * unlike Lomuto, does NOT necessarily end up at the index the partition returns -- Hoare's partition only
 * guarantees that everything at or before the split index is <= pivot and everything after it is >= pivot.
 * Two pointers `i` and `j` scan inward from both ends, each skipping past values already on the correct side,
 * and swap when they find a pair that is not; the range is settled (dimmed) only once BOTH of its recursive
 * calls return. The recursive calls are `(lo, p)` and `(p + 1, hi)` -- note `p`, not `p - 1`, a classic
 * off-by-one trap this animation calls out explicitly. Comparisons and swaps are counted on the right. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'int partition_hoare(int a[], int lo, int hi) {',
    '    int pivot = a[lo];               /* pivot = FIRST element */',
    '    int i = lo - 1, j = hi + 1;',
    '    while (1) {',
    '        do { i++; } while (a[i] < pivot);',
    '        do { j--; } while (a[j] > pivot);',
    '        if (i >= j) return j;',
    '        int tmp = a[i]; a[i] = a[j]; a[j] = tmp;',
    '    }',
    '}',
    '',
    'void quick_sort_hoare(int a[], int lo, int hi) {',
    '    if (lo < hi) {',
    '        int p = partition_hoare(a, lo, hi);',
    '        quick_sort_hoare(a, lo, p);       /* note: p, NOT p - 1 */',
    '        quick_sort_hoare(a, p + 1, hi);',
    '    }',
    '}'
  ];
  var J = [
    'int partitionHoare(int[] a, int lo, int hi) {',
    '    int pivot = a[lo];               // pivot = FIRST element',
    '    int i = lo - 1, j = hi + 1;',
    '    while (true) {',
    '        do { i++; } while (a[i] < pivot);',
    '        do { j--; } while (a[j] > pivot);',
    '        if (i >= j) return j;',
    '        int tmp = a[i]; a[i] = a[j]; a[j] = tmp;',
    '    }',
    '}',
    '',
    'void quickSortHoare(int[] a, int lo, int hi) {',
    '    if (lo < hi) {',
    '        int p = partitionHoare(a, lo, hi);',
    '        quickSortHoare(a, lo, p);         // note: p, NOT p - 1',
    '        quickSortHoare(a, p + 1, hi);',
    '    }',
    '}'
  ];

  D.define({
    id: 'quick-sort-hoare',
    title: T('Hızlı sıralama -- Hoare bölümleme', 'Quick sort -- Hoare partition'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 rastgele değer', '10 unordered values'),
        data: { values: [38, 27, 43, 3, 9, 82, 10, 15, 31, 6] } },
      { id: 'hard', level: 'hard', name: T('12 değer, tekrarlı anahtarlar', '12 values with repeated keys'),
        data: { values: [7, 2, 7, 9, 2, 7, 4, 9, 2, 4, 7, 9] } },
      { id: 'already-sorted', level: 'edge', name: T('Zaten sıralı: yine de tüm taramalar çalışır', 'Already sorted: every scan still runs'),
        data: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı: en kötü durum', 'Reverse sorted: worst case'),
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
      var finalizedRanges = [];

      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: 'A =', anchor: 'end', size: 15, bold: true, mono: true });
      for (var i0 = 0; i0 < n; i0++) S.box('b' + i0, { x: X0 + i0 * W, y: Y0, w: W - 6, h: H, text: String(arr[i0]), style: 'normal', size: 16, above: String(i0) });
      var RX = X0 + n * W + 30;
      S.label('cnt', { x: RX, y: Y0 - 40, text: 'comparisons: 0   swaps: 0', size: 15, bold: true, mono: true, anchor: 'start' });
      S.label('decision', { x: RX, y: Y0 - 10, text: '', size: 16, bold: true, mono: true, anchor: 'start', style: 'normal' });

      function counters() { S.set('cnt', { text: 'comparisons: ' + comparisons + '   swaps: ' + swaps }); }
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      function isFinalized(k) { return finalizedRanges.some(function (r) { return k >= r[0] && k <= r[1]; }); }
      function paint(lo, hi, i, j, pivotIdx) {
        for (var k = 0; k < n; k++) {
          var st = 'normal';
          if (isFinalized(k)) st = 'dim';
          else if (k < lo || k > hi) st = 'dim';
          if (k === pivotIdx) st = 'del';
          else if (k === i) st = 'active';
          else if (k === j) st = 'hl';
          S.set('b' + k, { text: String(arr[k]), style: st });
        }
      }
      function rangeBrace(lo, hi) {
        if (S.has('rangeb')) S.remove('rangeb');
        if (hi > lo) S.brace('rangeb', { from: 'b' + lo, to: 'b' + hi, text: T('bölüm aralığı', 'partition range'), side: 'top', dist: 14, style: 'active' });
      }

      S.step(T(n + ' değerlik dizi. Hoare bölümlemesi aralığın İLK elemanını pivot seçer (kırmızı kutu); iki işaretçi `i`, `j` uçlardan içeri doğru tarar.',
               n + ' values. Hoare partitioning picks the FIRST element of the range as the pivot (red box); two pointers `i`, `j` scan inward from both ends.'),
             { c: [12, { n: 13, note: T('lo < hi olduğunda çalışır', 'runs when lo < hi') }],
               java: [12, { n: 13, note: T('lo < hi olduğunda çalışır', 'runs when lo < hi') }] });

      var firstPartition = true;
      function qs(lo, hi) {
        if (lo >= hi) {
          finalizedRanges.push([lo, hi]);
          paint(lo, hi);
          S.step(T('`lo < hi` sağlanmıyor (lo=' + lo + ', hi=' + hi + '): en çok 1 eleman, zaten sıralı.', '`lo < hi` does not hold (lo=' + lo + ', hi=' + hi + '): at most 1 element, already sorted.'),
                 { c: [{ n: 13, note: T('lo < hi? hayır', 'lo < hi? no') }], java: [{ n: 13, note: T('lo < hi? hayır', 'lo < hi? no') }] });
          return;
        }
        var detailed = firstPartition;
        if (detailed) firstPartition = false;
        var pivot = arr[lo];
        var rangeStart = arr.slice(lo, hi + 1);
        var callComparisons = 0, callSwaps = 0;
        rangeBrace(lo, hi);
        if (detailed) {
          paint(lo, hi, undefined, undefined, lo);
          S.step(T('`quick_sort_hoare(' + lo + ', ' + hi + ')`: pivot = a[' + lo + '] = ' + pivot + '. `i = ' + (lo - 1) + '`, `j = ' + (hi + 1) + '`.', '`quick_sort_hoare(' + lo + ', ' + hi + ')`: pivot = a[' + lo + '] = ' + pivot + '. `i = ' + (lo - 1) + '`, `j = ' + (hi + 1) + '`.'),
                 { c: [{ n: 13, note: T('lo < hi? evet', 'lo < hi? yes') }, 1, 2, 3, { n: 4, note: T('taramaya başlar', 'scan begins') }],
                   java: [{ n: 13, note: T('lo < hi? evet', 'lo < hi? yes') }, 1, 2, 3, { n: 4, note: T('taramaya başlar', 'scan begins') }] });
        }
        var i = lo - 1, j = hi + 1;
        while (true) {
          do {
            i++; comparisons++; callComparisons++;
            if (detailed) {
              paint(lo, hi, i, j, lo); counters();
              var willStopI = !(arr[i] < pivot);
              var noteI = willStopI ? T('a[' + i + ']=' + arr[i] + ' < pivot=' + pivot + '? hayır → dur', 'a[' + i + ']=' + arr[i] + ' < pivot=' + pivot + '? no -> stop')
                                     : T('a[' + i + ']=' + arr[i] + ' < pivot=' + pivot + '? evet → devam', 'a[' + i + ']=' + arr[i] + ' < pivot=' + pivot + '? yes -> continue');
              S.step(T('`i` sağa kayar: `i = ' + i + '`.', '`i` moves right: `i = ' + i + '`.'), { c: [{ n: 5, note: noteI }], java: [{ n: 5, note: noteI }] });
            }
          } while (arr[i] < pivot);
          do {
            j--; comparisons++; callComparisons++;
            if (detailed) {
              paint(lo, hi, i, j, lo); counters();
              var willStopJ = !(arr[j] > pivot);
              var noteJ = willStopJ ? T('a[' + j + ']=' + arr[j] + ' > pivot=' + pivot + '? hayır → dur', 'a[' + j + ']=' + arr[j] + ' > pivot=' + pivot + '? no -> stop')
                                     : T('a[' + j + ']=' + arr[j] + ' > pivot=' + pivot + '? evet → devam', 'a[' + j + ']=' + arr[j] + ' > pivot=' + pivot + '? yes -> continue');
              S.step(T('`j` sola kayar: `j = ' + j + '`.', '`j` moves left: `j = ' + j + '`.'), { c: [{ n: 6, note: noteJ }], java: [{ n: 6, note: noteJ }] });
            }
          } while (arr[j] > pivot);
          if (i >= j) {
            if (detailed) {
              decide('i >= j: return j', 'dim');
              paint(lo, hi, i, j, lo);
              S.step(T('`i >= j` (' + i + ' >= ' + j + '): tarama bitti, bu bölüm için `' + j + '` döner.', '`i >= j` (' + i + ' >= ' + j + '): the scan is done, this partition returns `' + j + '`.'),
                     { c: [{ n: 7, note: T('i >= j? evet', 'i >= j? yes') }], java: [{ n: 7, note: T('i >= j? evet', 'i >= j? yes') }] });
            }
            break;
          }
          var vi = arr[i], vj = arr[j];
          arr[i] = vj; arr[j] = vi;
          swaps++;
          callSwaps++;
          if (detailed) {
            decide('swap', 'hl');
            paint(lo, hi, i, j, lo);
            counters();
            S.step(T('`i >= j` değil: a[' + i + '] ve a[' + j + '] yer değiştirir, tarama devam eder.', '`i >= j` does not hold: a[' + i + '] and a[' + j + '] swap, the scan continues.'),
                   { c: [{ n: 7, note: T('i >= j? hayır', 'i >= j? no') }, 8], java: [{ n: 7, note: T('i >= j? hayır', 'i >= j? no') }, 8] });
          }
        }
        var p = j;
        if (!detailed) {
          decide('', 'normal');
          paint(lo, hi, undefined, undefined, undefined);
          counters();
          S.step(T('`quick_sort_hoare(' + lo + ', ' + hi + ')`: pivot = ' + pivot + ', [' + rangeStart.join(', ') + '] → [' + arr.slice(lo, hi + 1).join(', ') + '] (' + callComparisons + ' karşılaştırma, ' + callSwaps + ' yer değiştirme). `i >= j` bölüm için `p = ' + p + '` döner.',
                   '`quick_sort_hoare(' + lo + ', ' + hi + ')`: pivot = ' + pivot + ', [' + rangeStart.join(', ') + '] -> [' + arr.slice(lo, hi + 1).join(', ') + '] (' + callComparisons + ' comparisons, ' + callSwaps + ' swaps). `i >= j` -- this partition returns `p = ' + p + '`.'),
                 { c: [1, 2, 3, { n: 4, note: T('taramaya başlar', 'scan begins') }, 5, 6,
                       { n: 7, note: T('i >= j olduğunda döner', 'returns when i >= j') }, 8],
                   java: [1, 2, 3, { n: 4, note: T('taramaya başlar', 'scan begins') }, 5, 6,
                          { n: 7, note: T('i >= j olduğunda döner', 'returns when i >= j') }, 8] });
        }
        qs(lo, p);
        qs(p + 1, hi);
        finalizedRanges.push([lo, hi]);
        decide('', 'normal');
        paint(lo, hi);
      }
      qs(0, n - 1);
      if (S.has('rangeb')) S.remove('rangeb');
      paint(0, -1);
      decide('', 'normal');
      S.result = { sorted: arr.slice() };
      S.step(T('Bitti: [' + arr.join(', ') + ']. Toplam ' + comparisons + ' karşılaştırma, ' + swaps + ' yer değiştirme. Hoare, Lomuto\'dan genelde daha az yer değiştirme yapar; ortalama O(n log n).',
               'Done: [' + arr.join(', ') + ']. Total ' + comparisons + ' comparisons, ' + swaps + ' swaps. Hoare typically does fewer swaps than Lomuto; average O(n log n).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
