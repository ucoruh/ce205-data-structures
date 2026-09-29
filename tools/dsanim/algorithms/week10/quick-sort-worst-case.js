/* Week 10 -- Quick sort's worst case, and how pivot choice avoids it. Three rows run the SAME Lomuto-style
 * partition on the SAME input, differing only in which element is chosen as the pivot: row 1 always picks the
 * FIRST element of the range (classic worst case on sorted/reverse-sorted input: every partition splits into
 * sizes 0 and n-1, giving a long thin recursion and O(n^2) comparisons); row 2 picks the MIDDLE index; row 3
 * picks the MEDIAN of the first, middle and last elements (median-of-three), the standard defense. Each
 * partition call is shown as one lumped step (its range, its chosen pivot, the resulting split) rather than a
 * full swap-by-swap scan -- that mechanic is already covered in quick-sort-lomuto. Running comparison totals
 * are shown per row on the right, so the O(n^2) vs O(n log n) gap becomes a visible number, not just a claim. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'void swap(int a[], int x, int y) { int t = a[x]; a[x] = a[y]; a[y] = t; }',
    '',
    'int choose_pivot_first(int a[], int lo, int hi)  { return lo; }',
    'int choose_pivot_middle(int a[], int lo, int hi) { return (lo + hi) / 2; }',
    'int choose_pivot_median3(int a[], int lo, int hi) {',
    '    int mid = (lo + hi) / 2;',
    '    if (a[mid] < a[lo]) swap(a, lo, mid);',
    '    if (a[hi] < a[lo])  swap(a, lo, hi);',
    '    if (a[hi] < a[mid]) swap(a, mid, hi);',
    '    return mid;                      /* the median of the three now sits at mid */',
    '}',
    '',
    'int partition_with(int a[], int lo, int hi, int pivot_idx) {',
    '    swap(a, pivot_idx, hi);          /* move the chosen pivot to the end, then run Lomuto */',
    '    int pivot = a[hi];',
    '    int i = lo - 1;',
    '    for (int j = lo; j < hi; j++)',
    '        if (a[j] <= pivot) { i++; swap(a, i, j); }',
    '    swap(a, i + 1, hi);',
    '    return i + 1;',
    '}'
  ];
  var J = [
    'static void swap(int[] a, int x, int y) { int t = a[x]; a[x] = a[y]; a[y] = t; }',
    '',
    'static int choosePivotFirst(int[] a, int lo, int hi)  { return lo; }',
    'static int choosePivotMiddle(int[] a, int lo, int hi) { return (lo + hi) / 2; }',
    'static int choosePivotMedian3(int[] a, int lo, int hi) {',
    '    int mid = (lo + hi) / 2;',
    '    if (a[mid] < a[lo]) swap(a, lo, mid);',
    '    if (a[hi] < a[lo])  swap(a, lo, hi);',
    '    if (a[hi] < a[mid]) swap(a, mid, hi);',
    '    return mid;                      // the median of the three now sits at mid',
    '}',
    '',
    'static int partitionWith(int[] a, int lo, int hi, int pivotIdx) {',
    '    swap(a, pivotIdx, hi);           // move the chosen pivot to the end, then run Lomuto',
    '    int pivot = a[hi];',
    '    int i = lo - 1;',
    '    for (int j = lo; j < hi; j++)',
    '        if (a[j] <= pivot) { i++; swap(a, i, j); }',
    '    swap(a, i + 1, hi);',
    '    return i + 1;',
    '}'
  ];

  var STRATS = [
    { key: 'first', label: T('ilk eleman', 'first element'), pick: function (a, lo, hi) { return lo; } },
    { key: 'middle', label: T('orta indis', 'middle index'), pick: function (a, lo, hi) { return lo + Math.floor((hi - lo) / 2); } },
    { key: 'median3', label: T('üçün medyanı', 'median-of-three'), pick: function (a, lo, hi) {
        var mid = lo + Math.floor((hi - lo) / 2);
        var idx = [lo, mid, hi].slice().sort(function (x, y) { return a[x] - a[y]; });
        return idx[1];
      } }
  ];

  D.define({
    id: 'quick-sort-worst-case',
    title: T('Hızlı sıralamanın en kötü durumu: pivot seçimi', "Quick sort's worst case: pivot choice"),
    code: { c: C, java: J },
    presets: [
      { id: 'sorted', level: 'normal', name: T('Zaten sıralı 10 değer: ilk-eleman en kötü durum, diğerleri dengeli', 'Already-sorted 10 values: first-element is the worst case, the others stay balanced'),
        data: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
      { id: 'sorted-14', level: 'hard', name: T('Zaten sıralı 14 değer: fark daha da belirginleşir', 'Already-sorted 14 values: the gap widens further'),
        data: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı 10 değer: yine ilk-eleman en kötü durum', 'Reverse-sorted 10 values: first-element is again the worst case'),
        data: { values: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] } },
      { id: 'all-equal', level: 'edge', name: T('Hepsi eşit: her strateji için tek geçiş', 'All equal: a single pass for every strategy'),
        data: { values: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4] } },
      { id: 'random', level: 'edge', name: T('Rastgele 10 değer: üç strateji de benzer', 'Random 10 values: all three strategies are similar'),
        data: { values: [38, 27, 43, 3, 9, 82, 10, 15, 31, 6] } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler, sıralı: INT_MIN..INT_MAX', 'Extreme values, sorted: INT_MIN..INT_MAX'),
        data: { values: [-2147483648, -1000000, -5, -1, 0, 1, 5, 1000000, 2147483646, 2147483647] } },
      { id: 'two', level: 'edge', name: T('İki değer', 'Two values'), small: true,
        data: { values: [9, 2] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.values.length; },
    reference: function (d) {
      var sorted = d.values.slice().sort(function (a, b) { return a - b; });
      return { first: sorted, middle: sorted, median3: sorted };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 11, hard: 13, extreme: 14 }[level];
      var values = [];
      for (var i = 0; i < n; i++) values.push(D.randInt(r, 1, 99));
      if (r() < 0.5) values.sort(function (a, b) { return a - b; }); else values.sort(function (a, b) { return b - a; });
      return { values: values };
    },
    input: {
      hint: T('Örnek: 1 2 3 4 5 6 7 8 9 10', 'Example: 1 2 3 4 5 6 7 8 9 10'),
      parse: function (text) {
        var values = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" bir tam sayı değil.', '"' + tok + '" is not an integer.');
          values.push(parseInt(tok, 10));
        });
        if (values.length < 2) throw T('En az iki değer yazın.', 'Write at least two values.');
        if (values.length > 18) throw T('En çok 18 değer.', 'At most 18 values.');
        return { values: values };
      },
      format: function (d) { return d.values.join(' '); },
      tokens: function (d) { return d.values.map(String); },
      bad: ['', '5', '5 x 7', '3.5 8', ',,,']
    },
    build: function (S, d) {
      var n = d.values.length;
      var W = Math.max(26, Math.min(48, Math.floor(560 / n))), H = 30, X0 = 130, ROWGAP = 90;
      var RX = X0 + n * W + 30;

      S.label('title', { x: X0 - 16, y: 20, text: T('aynı girdi, farklı pivot seçimi', 'same input, different pivot choice'), style: 'dim', size: 13, anchor: 'end' });

      var rows = STRATS.map(function (strat, si) {
        var y = 50 + si * ROWGAP;
        var arr = d.values.slice();
        S.label('rl' + si, { x: X0 - 16, y: y + H / 2 + 4, text: strat.label, anchor: 'end', size: 13, bold: true, style: 'active' });
        for (var i = 0; i < n; i++) S.box(si + '_' + i, { x: X0 + i * W, y: y, w: W - 4, h: H, text: String(arr[i]), style: 'normal', size: 12 });
        S.label('cnt' + si, { x: RX, y: y + H / 2 + 4, text: 'comparisons: 0   calls: 0', size: 13, bold: true, mono: true, anchor: 'start' });
        return { arr: arr, y: y, comparisons: 0, calls: 0, maxDepth: 0 };
      });

      function paint(si) {
        var r = rows[si];
        for (var i = 0; i < n; i++) S.set(si + '_' + i, { text: String(r.arr[i]) });
      }
      function counters(si) { S.set('cnt' + si, { text: 'comparisons: ' + rows[si].comparisons + '   calls: ' + rows[si].calls }); }
      function markRange(si, lo, hi, style) { for (var i = lo; i <= hi; i++) S.set(si + '_' + i, { style: style }); }

      S.step(T(n + ' değerlik aynı dizi üç kez sıralanacak; tek fark, `partition_with` çağrılırken pivotun nasıl seçildiği (satır 3, 4 ya da 5-10).',
               'The same ' + n + '-value array will be sorted three times; the only difference is how the pivot is chosen before `partition_with` runs (line 3, 4, or 5-10).'),
             { c: [12], java: [12] });

      STRATS.forEach(function (strat, si) {
        var r = rows[si];
        function qs(lo, hi, depth) {
          r.maxDepth = Math.max(r.maxDepth, depth);
          if (hi - lo <= 0) return;
          r.calls++;
          var pIdxChosen = strat.pick(r.arr, lo, hi);
          var pivotVal = r.arr[pIdxChosen];
          var tmp = r.arr[pIdxChosen]; r.arr[pIdxChosen] = r.arr[hi]; r.arr[hi] = tmp;
          var pivot = r.arr[hi];
          var i = lo - 1;
          for (var j = lo; j < hi; j++) {
            r.comparisons++;
            if (r.arr[j] <= pivot) { i++; var v1 = r.arr[i], v2 = r.arr[j]; r.arr[i] = v2; r.arr[j] = v1; }
          }
          var vip = r.arr[i + 1], vhi = r.arr[hi];
          r.arr[i + 1] = vhi; r.arr[hi] = vip;
          var p = i + 1;
          paint(si); markRange(si, lo, hi, 'active'); S.set(si + '_' + p, { style: 'del' });
          counters(si);
          S.step(T('[' + strat.label.tr + '] aralık [' + lo + '..' + hi + '] (boyut ' + (hi - lo + 1) + '): pivot = ' + pivotVal + ' → konum ' + p + '. Sol boyut ' + (p - lo) + ', sağ boyut ' + (hi - p) + '.',
                   '[' + strat.label.en + '] range [' + lo + '..' + hi + '] (size ' + (hi - lo + 1) + '): pivot = ' + pivotVal + ' -> position ' + p + '. Left size ' + (p - lo) + ', right size ' + (hi - p) + '.'),
                 { c: [13, 14, 15, 16,
                       { n: 17, note: T('j = ' + lo + '..' + (hi - 1) + ' için tekrarlanır', 'repeats for j = ' + lo + '..' + (hi - 1)) },
                       { n: 18, note: T('a[j] <= pivot olduğunda i artar', 'i advances when a[j] <= pivot') }, 19, 20],
                   java: [13, 14, 15, 16,
                          { n: 17, note: T('j = ' + lo + '..' + (hi - 1) + ' için tekrarlanır', 'repeats for j = ' + lo + '..' + (hi - 1)) },
                          { n: 18, note: T('a[j] <= pivot olduğunda i artar', 'i advances when a[j] <= pivot') }, 19, 20] });
          qs(lo, p - 1, depth + 1);
          qs(p + 1, hi, depth + 1);
        }
        qs(0, n - 1, 0);
        paint(si); markRange(si, 0, n - 1, 'dim'); counters(si);
      });

      var summary = rows.map(function (r, si) { return STRATS[si].label.en + ': ' + r.comparisons + ' comparisons, depth ' + r.maxDepth; }).join('; ');
      var summaryTr = rows.map(function (r, si) { return STRATS[si].label.tr + ': ' + r.comparisons + ' karşılaştırma, derinlik ' + r.maxDepth; }).join('; ');
      S.result = { first: rows[0].arr.slice(), middle: rows[1].arr.slice(), median3: rows[2].arr.slice() };
      S.step(T('Bitti. ' + summaryTr + '. Sabit bir köşe elemanını (ilk ya da son) pivot seçmek, zaten sıralı/tersten sıralı girdide O(n²)\'ye düşer; orta indis ya da üçün medyanı bu girdide dengeli kalır.',
               'Done. ' + summary + '. Always picking a fixed corner element (first or last) as the pivot degrades to O(n^2) on already-sorted/reverse-sorted input; the middle index or median-of-three stay balanced on this input.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
