/* Week 10 -- Radix sort, least-significant-digit (LSD) first: sort non-negative integers by running a STABLE
 * counting sort on one decimal digit at a time, starting from the ONES place and working up to the highest
 * place any value needs. Because each pass is stable, and passes go from least to most significant digit, the
 * array ends up fully sorted once the most significant digit's pass finishes -- ties broken by that pass are
 * exactly the ties left over from every less-significant digit already being equal. Always 10 buckets
 * (digits 0-9), regardless of how large the numbers are. The first digit pass is shown counting-sort-detailed;
 * later passes are shown as one lumped step per digit extraction/placement. Comparisons stay at 0 throughout
 * (non-comparison sort); writes are counted on the right. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'int get_digit(int x, int place) { return (x / place) % 10; }',
    '',
    'void radix_sort_lsd(int a[], int n) {',
    '    int max_val = a[0];',
    '    for (int i = 1; i < n; i++)',
    '        if (a[i] > max_val) max_val = a[i];',
    '    for (int place = 1; max_val / place > 0; place *= 10) {   /* ones, tens, hundreds, ... */',
    '        int count[10] = {0};',
    '        for (int i = 0; i < n; i++) count[get_digit(a[i], place)]++;',
    '        for (int d = 1; d < 10; d++) count[d] += count[d - 1];',
    '        int output[n];',
    '        for (int i = n - 1; i >= 0; i--) {          /* backwards: keeps each pass stable */',
    '            int dgt = get_digit(a[i], place);',
    '            output[count[dgt] - 1] = a[i];',
    '            count[dgt]--;',
    '        }',
    '        for (int i = 0; i < n; i++) a[i] = output[i];',
    '    }',
    '}'
  ];
  var J = [
    'static int getDigit(int x, int place) { return (x / place) % 10; }',
    '',
    'void radixSortLsd(int[] a, int n) {',
    '    int maxVal = a[0];',
    '    for (int i = 1; i < n; i++)',
    '        if (a[i] > maxVal) maxVal = a[i];',
    '    for (int place = 1; maxVal / place > 0; place *= 10) {   // ones, tens, hundreds, ...',
    '        int[] count = new int[10];',
    '        for (int i = 0; i < n; i++) count[getDigit(a[i], place)]++;',
    '        for (int d = 1; d < 10; d++) count[d] += count[d - 1];',
    '        int[] output = new int[n];',
    '        for (int i = n - 1; i >= 0; i--) {          // backwards: keeps each pass stable',
    '            int dgt = getDigit(a[i], place);',
    '            output[count[dgt] - 1] = a[i];',
    '            count[dgt]--;',
    '        }',
    '        for (int i = 0; i < n; i++) a[i] = output[i];',
    '    }',
    '}'
  ];

  D.define({
    id: 'radix-sort-lsd',
    title: T('Radix sıralaması, en az anlamlı basamaktan (LSD)', 'Radix sort, least-significant-digit first (LSD)'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 değer, 3 basamaklı, 3 geçiş', '10 values, up to 3 digits, 3 passes'),
        data: { values: [329, 457, 657, 839, 436, 720, 355, 21, 8, 100] } },
      { id: 'hard', level: 'hard', name: T('14 değer, karışık basamak sayıları', '14 values, mixed digit lengths'),
        data: { values: [5, 45, 802, 3, 66, 913, 27, 8, 150, 999, 12, 300, 4, 88] } },
      { id: 'already-sorted', level: 'edge', name: T('Zaten sıralı: yine de tüm geçişler çalışır', 'Already sorted: every pass still runs'),
        data: { values: [1, 12, 23, 34, 45, 56, 67, 78, 89, 90] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı', 'Reverse sorted'),
        data: { values: [90, 89, 78, 67, 56, 45, 34, 23, 12, 1] } },
      { id: 'single-digit', level: 'edge', name: T('Tüm değerler tek basamaklı: yalnızca bir geçiş', 'All values are single-digit: only one pass'),
        data: { values: [4, 2, 9, 1, 7, 3, 8, 0, 6, 5] } },
      { id: 'all-same', level: 'edge', name: T('Hepsi aynı değer', 'All the same value'),
        data: { values: [77, 77, 77, 77, 77, 77, 77, 77, 77, 77] } },
      { id: 'single', level: 'edge', name: T('Tek değer', 'A single value'), small: true,
        data: { values: [42] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.values.length; },
    reference: function (d) { return { sorted: d.values.slice().sort(function (a, b) { return a - b; }) }; },
    random: function (level, r) {
      var n = { easy: 10, normal: 11, hard: 14, extreme: 14 }[level];
      var hi = { easy: 99, normal: 999, hard: 999, extreme: 9999 }[level];
      var values = [];
      for (var i = 0; i < n; i++) values.push(D.randInt(r, 0, hi));
      return { values: values };
    },
    input: {
      hint: T('Örnek: 329 457 657 839 436 720 355 21 8 100', 'Example: 329 457 657 839 436 720 355 21 8 100'),
      parse: function (text) {
        var values = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (!/^\d+$/.test(tok)) throw T('"' + tok + '" negatif olmayan bir tam sayı olmalı.', '"' + tok + '" must be a non-negative integer.');
          var v = parseInt(tok, 10);
          if (v > 99999) throw T('En çok 5 basamaklı değerler.', 'At most 5-digit values.');
          values.push(v);
        });
        if (!values.length) throw T('En az bir değer yazın.', 'Write at least one value.');
        if (values.length > 18) throw T('En çok 18 değer.', 'At most 18 values.');
        return { values: values };
      },
      format: function (d) { return d.values.join(' '); },
      tokens: function (d) { return d.values.map(String); },
      bad: ['', '5 x 7', '3.5 8', '-3 4']
    },
    build: function (S, d) {
      var arr = d.values.slice(), n = arr.length;
      var maxVal = 0; for (var z = 0; z < n; z++) if (arr[z] > maxVal) maxVal = arr[z];
      var W = 50, H = 38, X0 = 90;
      var Y_IN = 40, Y_CNT = 140, Y_OUT = 250;
      var writes = 0;

      S.label('rlin', { x: X0 - 16, y: Y_IN + H / 2 + 4, text: 'A =', anchor: 'end', size: 15, bold: true, mono: true });
      for (var i = 0; i < n; i++) S.box('in' + i, { x: X0 + i * W, y: Y_IN, w: W - 6, h: H, text: String(arr[i]), style: 'normal', size: 14, above: String(i) });

      S.label('rlcnt', { x: X0 - 16, y: Y_CNT + H / 2 + 4, text: 'count[] =', anchor: 'end', size: 15, bold: true, mono: true });
      for (var v = 0; v <= 9; v++) S.box('c' + v, { x: X0 + v * W, y: Y_CNT, w: W - 6, h: H, text: '0', style: 'empty', size: 15, above: String(v) });

      S.label('rlout', { x: X0 - 16, y: Y_OUT + H / 2 + 4, text: 'output[] =', anchor: 'end', size: 15, bold: true, mono: true });
      for (var i2 = 0; i2 < n; i2++) S.box('o' + i2, { x: X0 + i2 * W, y: Y_OUT, w: W - 6, h: H, text: '', style: 'empty', size: 14, above: String(i2) });

      var RX = X0 + Math.max(n, 10) * W + 30;
      S.label('placelbl', { x: RX, y: Y_IN - 20, text: 'place = 1', size: 15, bold: true, mono: true, anchor: 'start', style: 'active' });
      S.label('cnt', { x: RX, y: Y_IN, text: 'comparisons: 0 (non-comparison sort)', size: 13, bold: true, mono: true, anchor: 'start' });
      S.label('wr', { x: RX, y: Y_IN + 20, text: 'writes: 0', size: 13, bold: true, mono: true, anchor: 'start' });
      function counters() { S.set('cnt', { text: 'comparisons: 0 (non-comparison sort)' }); S.set('wr', { text: 'writes: ' + writes }); }

      S.step(T(n + ' değer, en büyüğü ' + maxVal + '. Radix sort en az anlamlı (birler) basamaktan başlar, her basamak için KARARLI bir sayma sıralaması çalıştırır.',
               n + ' values, the largest is ' + maxVal + '. Radix sort starts at the least-significant (ones) digit, running a STABLE counting sort for each digit.'),
             { c: [3, 4, { n: 5, note: T('i = 1..n-1 için tekrarlanır', 'repeats for i = 1..n-1') }],
               java: [3, 4, { n: 5, note: T('i = 1..n-1 için tekrarlanır', 'repeats for i = 1..n-1') }] });

      var firstPass = true;
      for (var place = 1; Math.floor(maxVal / place) > 0; place *= 10) {
        S.set('placelbl', { text: 'place = ' + place });
        var count = new Array(10).fill(0);
        var detailed = firstPass;
        firstPass = false;

        if (detailed) {
          S.step(T('`place = ' + place + '`: her değerin `(x / place) % 10` basamağına bakılır.', '`place = ' + place + '`: every value\'s `(x / place) % 10` digit is examined.'),
                 { c: [{ n: 7, note: T('max_val / place = ' + Math.floor(maxVal / place) + ' > 0', 'max_val / place = ' + Math.floor(maxVal / place) + ' > 0') }],
                   java: [{ n: 7, note: T('maxVal / place = ' + Math.floor(maxVal / place) + ' > 0', 'maxVal / place = ' + Math.floor(maxVal / place) + ' > 0') }] });
        }
        for (var k = 0; k < n; k++) {
          var dgt = Math.floor(arr[k] / place) % 10;
          count[dgt]++; writes++;
          if (detailed) {
            S.set('in' + k, { style: 'active' }); S.set('c' + dgt, { text: String(count[dgt]), style: 'hl' }); counters();
            S.step(T('a[' + k + ']=' + arr[k] + ': basamağı ' + dgt + ', `count[' + dgt + ']` = ' + count[dgt] + '.', 'a[' + k + ']=' + arr[k] + ': digit ' + dgt + ', `count[' + dgt + ']` = ' + count[dgt] + '.'),
                   { c: [{ n: 9, note: T('i = ' + k + ' < n (' + n + ')', 'i = ' + k + ' < n (' + n + ')') }],
                     java: [{ n: 9, note: T('i = ' + k + ' < n (' + n + ')', 'i = ' + k + ' < n (' + n + ')') }] });
            S.set('in' + k, { style: 'normal' }); S.set('c' + dgt, { style: 'normal' });
          }
        }
        if (!detailed) for (var v0 = 0; v0 <= 9; v0++) S.set('c' + v0, { text: String(count[v0]) });

        for (var v1 = 1; v1 <= 9; v1++) count[v1] += count[v1 - 1];
        for (var v2 = 0; v2 <= 9; v2++) S.set('c' + v2, { text: String(count[v2]), style: 'active' });
        counters();
        S.step(T('Kümülatif toplam alınır: `count[d]` artık "basamağı <= d olan kaç değer var" demek.', 'Cumulative sum: `count[d]` now means "how many values have a digit <= d".'),
               { c: [{ n: 10, note: T('d = 1..9 için tekrarlanır', 'repeats for d = 1..9') }],
                 java: [{ n: 10, note: T('d = 1..9 için tekrarlanır', 'repeats for d = 1..9') }] });
        for (var v3 = 0; v3 <= 9; v3++) S.set('c' + v3, { style: 'normal' });

        for (var k2 = n - 1; k2 >= 0; k2--) {
          var val = arr[k2], dgt2 = Math.floor(val / place) % 10;
          var pos = count[dgt2] - 1;
          if (detailed) { S.set('in' + k2, { style: 'hl' }); S.set('c' + dgt2, { style: 'active' }); counters(); }
          S.set('o' + pos, { text: String(val), style: 'new' });
          writes++;
          count[dgt2]--;
          if (detailed) {
            S.set('c' + dgt2, { text: String(count[dgt2]), style: 'normal' });
            S.set('in' + k2, { style: 'dim' });
            counters();
            S.step(T(val + ' (basamak ' + dgt2 + ') → `output[' + pos + ']`.', val + ' (digit ' + dgt2 + ') -> `output[' + pos + ']`.'),
                   { c: [{ n: 12, note: T('i = ' + k2 + ' >= 0', 'i = ' + k2 + ' >= 0') }, 13, 14],
                     java: [{ n: 12, note: T('i = ' + k2 + ' >= 0', 'i = ' + k2 + ' >= 0') }, 13, 14] });
          }
        }
        for (var i3 = 0; i3 < n; i3++) { arr[i3] = Number(S.get('o' + i3).text); S.set('in' + i3, { text: String(arr[i3]), style: 'new' }); S.set('o' + i3, { text: '', style: 'empty' }); }
        for (var v4 = 0; v4 <= 9; v4++) S.set('c' + v4, { text: '0', style: 'empty' });
        counters();
        S.step(T('`place = ' + place + '` geçişi bitti: [' + arr.join(', ') + ']. `output[]`, `a[]`e kopyalanır.', '`place = ' + place + '` pass done: [' + arr.join(', ') + ']. `output[]` is copied into `a[]`.'),
               { c: [{ n: 17, note: T('i = 0..n-1 için kopyalanır', 'copied for i = 0..n-1') }],
                 java: [{ n: 17, note: T('i = 0..n-1 için kopyalanır', 'copied for i = 0..n-1') }] });
      }

      S.result = { sorted: arr.slice() };
      S.step(T('Bitti: [' + arr.join(', ') + ']. Toplam ' + writes + ' yazma, 0 karşılaştırma. `d` = basamak sayısı olmak üzere O(d * (n + 10)) zaman; her geçiş kararlı olduğu için sonuç doğru.',
               'Done: [' + arr.join(', ') + ']. Total ' + writes + ' writes, 0 comparisons. O(d * (n + 10)) time, where `d` is the number of digits; correct because every pass is stable.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
