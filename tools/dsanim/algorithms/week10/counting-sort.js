/* Week 10 -- Counting sort: a NON-comparison sort for small non-negative integers. It counts how many times
 * each value 0..maxVal occurs, turns those counts into a running (cumulative) total -- "how many values are
 * <= v" -- and then places every input value directly at its final index using that total, scanning the
 * input BACKWARDS so that equal keys keep their original relative order (stable). Three rows: the input, the
 * count[] array (first raw counts, then cumulative), and the output. There are zero key-to-key comparisons --
 * the counters on the right say so explicitly, since that is the entire point of a non-comparison sort. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'void counting_sort(int a[], int n, int max_val) {',
    '    int count[max_val + 1];',
    '    for (int v = 0; v <= max_val; v++) count[v] = 0;',
    '    for (int i = 0; i < n; i++) count[a[i]]++;          /* raw counts */',
    '    for (int v = 1; v <= max_val; v++) count[v] += count[v - 1];   /* cumulative */',
    '    int output[n];',
    '    for (int i = n - 1; i >= 0; i--) {                  /* backwards: keeps it stable */',
    '        output[count[a[i]] - 1] = a[i];',
    '        count[a[i]]--;',
    '    }',
    '    for (int i = 0; i < n; i++) a[i] = output[i];',
    '}'
  ];
  var J = [
    'void countingSort(int[] a, int n, int maxVal) {',
    '    int[] count = new int[maxVal + 1];',
    '    for (int v = 0; v <= maxVal; v++) count[v] = 0;',
    '    for (int i = 0; i < n; i++) count[a[i]]++;          // raw counts',
    '    for (int v = 1; v <= maxVal; v++) count[v] += count[v - 1];   // cumulative',
    '    int[] output = new int[n];',
    '    for (int i = n - 1; i >= 0; i--) {                  // backwards: keeps it stable',
    '        output[count[a[i]] - 1] = a[i];',
    '        count[a[i]]--;',
    '    }',
    '    for (int i = 0; i < n; i++) a[i] = output[i];',
    '}'
  ];

  D.define({
    id: 'counting-sort',
    title: T('Sayma sıralaması (counting sort)', 'Counting sort'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 değer, aralık 0..9', '10 values, range 0..9'),
        data: { values: [4, 2, 2, 8, 3, 3, 1, 4, 2, 7] } },
      { id: 'hard', level: 'hard', name: T('14 değer, aralık 0..9, ağır tekrar', '14 values, range 0..9, heavy repeats'),
        data: { values: [5, 1, 5, 9, 2, 5, 1, 9, 5, 2, 1, 9, 5, 0] } },
      { id: 'already-sorted', level: 'edge', name: T('Zaten sıralı: yine de tüm geçişler çalışır', 'Already sorted: every pass still runs'),
        data: { values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı', 'Reverse sorted'),
        data: { values: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0] } },
      { id: 'all-same', level: 'edge', name: T('Hepsi aynı değer: tek dolu sayaç hücresi', 'All the same value: a single occupied count cell'),
        data: { values: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5] } },
      { id: 'sparse-range', level: 'edge', name: T('Seyrek aralık: 10 değer ama maxVal=15 (O(n+k) maliyeti)', 'Sparse range: 10 values but maxVal=15 (the O(n+k) cost)'),
        data: { values: [0, 15, 3, 12, 6, 9, 1, 14, 7, 8] } },
      { id: 'single', level: 'edge', name: T('Tek değer', 'A single value'), small: true,
        data: { values: [3] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.values.length; },
    reference: function (d) { return { sorted: d.values.slice().sort(function (a, b) { return a - b; }) }; },
    random: function (level, r) {
      var n = { easy: 10, normal: 11, hard: 14, extreme: 14 }[level];
      var maxVal = level === 'extreme' ? 15 : 9;
      var values = [];
      for (var i = 0; i < n; i++) values.push(D.randInt(r, 0, maxVal));
      return { values: values };
    },
    input: {
      hint: T('Örnek: 4 2 2 8 3 3 1 4 2 7  (0..15 arası tam sayılar)', 'Example: 4 2 2 8 3 3 1 4 2 7  (integers in 0..15)'),
      parse: function (text) {
        var values = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (!/^\d+$/.test(tok)) throw T('"' + tok + '" 0-15 arası negatif olmayan bir tam sayı olmalı.', '"' + tok + '" must be a non-negative integer in 0-15.');
          var v = parseInt(tok, 10);
          if (v > 15) throw T('Sayma sıralaması bu gösterimde en çok 15 değerini kabul eder.', 'Counting sort in this demo accepts at most the value 15.');
          values.push(v);
        });
        if (!values.length) throw T('En az bir değer yazın.', 'Write at least one value.');
        if (values.length > 20) throw T('En çok 20 değer.', 'At most 20 values.');
        return { values: values };
      },
      format: function (d) { return d.values.join(' '); },
      tokens: function (d) { return d.values.map(String); },
      bad: ['', '5 x 7', '3.5 8', '-3 4', '99 2']
    },
    build: function (S, d) {
      var arr = d.values.slice(), n = arr.length;
      var maxVal = 0; for (var z = 0; z < n; z++) if (arr[z] > maxVal) maxVal = arr[z];
      var W = 50, H = 40, X0 = 90;
      var Y_IN = 40, Y_CNT = 140, Y_OUT = 250;
      var comparisons = 0, writes = 0;

      S.label('rlin', { x: X0 - 16, y: Y_IN + H / 2 + 4, text: 'A =', anchor: 'end', size: 15, bold: true, mono: true });
      for (var i = 0; i < n; i++) S.box('in' + i, { x: X0 + i * W, y: Y_IN, w: W - 6, h: H, text: String(arr[i]), style: 'normal', size: 15, above: String(i) });

      S.label('rlcnt', { x: X0 - 16, y: Y_CNT + H / 2 + 4, text: 'count[] =', anchor: 'end', size: 15, bold: true, mono: true });
      var count = [];
      for (var v = 0; v <= maxVal; v++) { count.push(0); S.box('c' + v, { x: X0 + v * W, y: Y_CNT, w: W - 6, h: H, text: '0', style: 'empty', size: 15, above: String(v) }); }

      S.label('rlout', { x: X0 - 16, y: Y_OUT + H / 2 + 4, text: 'output[] =', anchor: 'end', size: 15, bold: true, mono: true });
      for (var i2 = 0; i2 < n; i2++) S.box('o' + i2, { x: X0 + i2 * W, y: Y_OUT, w: W - 6, h: H, text: '', style: 'empty', size: 15, above: String(i2) });

      var RX = X0 + Math.max(n, maxVal + 1) * W + 30;
      S.label('cnt', { x: RX, y: Y_IN, text: 'comparisons: 0 (non-comparison sort)', size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('wr', { x: RX, y: Y_IN + 22, text: 'writes: 0', size: 14, bold: true, mono: true, anchor: 'start' });
      function counters() { S.set('cnt', { text: 'comparisons: ' + comparisons + ' (non-comparison sort)' }); S.set('wr', { text: 'writes: ' + writes }); }

      S.step(T(n + ' değer, aralık 0..' + maxVal + '. Sayma sıralaması anahtarları asla birbiriyle karşılaştırmaz; her değerin kaç kez geçtiğini sayar.',
               n + ' values, range 0..' + maxVal + '. Counting sort never compares keys against each other; it counts how many times each value occurs.'),
             { c: [1, 2, { n: 3, note: T('v = 0..' + maxVal + ' için sıfırlanır', 'zeroed for v = 0..' + maxVal) }],
               java: [1, 2, { n: 3, note: T('v = 0..' + maxVal + ' için sıfırlanır', 'zeroed for v = 0..' + maxVal) }] });

      for (var k = 0; k < n; k++) {
        count[arr[k]]++;
        writes++;
        S.set('in' + k, { style: 'active' });
        S.set('c' + arr[k], { text: String(count[arr[k]]), style: 'hl' });
        counters();
        S.step(T('a[' + k + ']=' + arr[k] + ': `count[' + arr[k] + ']` bir artar (' + count[arr[k]] + ').', 'a[' + k + ']=' + arr[k] + ': `count[' + arr[k] + ']` goes up by one (' + count[arr[k]] + ').'),
               { c: [{ n: 4, note: T('i = ' + k + ' < n (' + n + ')', 'i = ' + k + ' < n (' + n + ')') }],
                 java: [{ n: 4, note: T('i = ' + k + ' < n (' + n + ')', 'i = ' + k + ' < n (' + n + ')') }] });
        S.set('in' + k, { style: 'normal' });
        S.set('c' + arr[k], { style: 'normal' });
      }

      var before = count.slice();
      for (var v2 = 1; v2 <= maxVal; v2++) count[v2] += count[v2 - 1];
      for (var v3 = 0; v3 <= maxVal; v3++) S.set('c' + v3, { text: String(count[v3]), style: 'active' });
      counters();
      S.step(T('Kümülatif toplam: `count[v] += count[v-1]`. Artık `count[v]`, "v değerinden küçük ya da eşit kaç eleman var" demek -- yani o değerin son (en sağdaki) çıktı indisi.',
               'Cumulative sum: `count[v] += count[v-1]`. Now `count[v]` means "how many elements are <= v" -- the LAST (rightmost) output index for that value.'),
             { c: [{ n: 5, note: T('v = 1..' + maxVal + ' için tekrarlanır', 'repeats for v = 1..' + maxVal) }],
               java: [{ n: 5, note: T('v = 1..' + maxVal + ' için tekrarlanır', 'repeats for v = 1..' + maxVal) }] });
      for (var v4 = 0; v4 <= maxVal; v4++) S.set('c' + v4, { style: 'normal' });

      for (var k2 = n - 1; k2 >= 0; k2--) {
        var val = arr[k2];
        var pos = count[val] - 1;
        S.set('in' + k2, { style: 'hl' });
        S.set('c' + val, { style: 'active' });
        counters();
        var detailed = (n - 1 - k2) < 4;
        if (detailed) {
          S.step(T('Sondan başlıyoruz (kararlılık için): a[' + k2 + ']=' + val + ' → `output[count[' + val + ']-1] = output[' + pos + ']`.', 'Scanning from the end (for stability): a[' + k2 + ']=' + val + ' -> `output[count[' + val + ']-1] = output[' + pos + ']`.'),
                 { c: [{ n: 7, note: T('i = ' + k2 + ' >= 0', 'i = ' + k2 + ' >= 0') }, 8],
                   java: [{ n: 7, note: T('i = ' + k2 + ' >= 0', 'i = ' + k2 + ' >= 0') }, 8] });
        }
        S.set('o' + pos, { text: String(val), style: 'new' });
        writes++;
        count[val]--;
        S.set('c' + val, { text: String(count[val]), style: 'normal' });
        S.set('in' + k2, { style: 'dim' });
        counters();
        if (detailed) {
          S.step(T(val + ' `output[' + pos + ']`e yazıldı; `count[' + val + ']` bir azalır (' + count[val] + '), aynı değerin bir sonraki kopyası bir önceki hücreye gider.', val + ' is written to `output[' + pos + ']`; `count[' + val + ']` drops by one (' + count[val] + '), the next copy of the same value goes to the cell before it.'),
                 { c: [8, 9], java: [8, 9] });
        }
      }
      S.step(T('Geriye tarama bitti. Şimdi `output[]` sıralı sonuçtur; `a[]`e geri kopyalanır.', 'The backward scan is done. `output[]` is now the sorted result; it is copied back into `a[]`.'),
             { c: [{ n: 11, note: T('i = 0..n-1 için kopyalanır', 'copied for i = 0..n-1') }],
               java: [{ n: 11, note: T('i = 0..n-1 için kopyalanır', 'copied for i = 0..n-1') }] });

      for (var i3 = 0; i3 < n; i3++) S.set('in' + i3, { text: S.get('o' + i3).text, style: 'new' });
      counters();
      var sorted = []; for (var i4 = 0; i4 < n; i4++) sorted.push(Number(S.get('o' + i4).text));
      S.result = { sorted: sorted };
      S.step(T('Bitti: [' + sorted.join(', ') + ']. Toplam ' + writes + ' yazma, 0 karşılaştırma. O(n + k) zaman ve O(n + k) ek bellek (k = maxVal). Kararlıdır (stable). k, n\'den çok büyükse (bkz. "seyrek aralık") verimsizdir.',
               'Done: [' + sorted.join(', ') + ']. Total ' + writes + ' writes, 0 comparisons. O(n + k) time and O(n + k) extra memory (k = maxVal). It is stable. Wasteful when k is much larger than n (see "sparse range").'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
