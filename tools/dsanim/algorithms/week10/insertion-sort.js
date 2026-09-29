/* Week 10 -- Insertion sort, drawn the way the instructor draws it on the board (CE100): a brace over the
 * "already sorted" prefix [0..i-1]; the current key pulled out and shown in RED above the array (style
 * 'del'); every comparison prints "a[j] > key?" on the right -- the ">  key" region shifts one cell right
 * (a visible shift arrow from the old cell to the new one), the "<= key" region stays put; the key then
 * drops into the hole it opened. Comparisons and shifts are counted on the right. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'void insertion_sort(int a[], int n) {',
    '    for (int i = 1; i < n; i++) {',
    '        int key = a[i];               /* pull the key out (the red box) */',
    '        int j = i - 1;',
    '        while (j >= 0 && a[j] > key) {',
    '            a[j + 1] = a[j];           /* shift right, opening a hole at j */',
    '            j--;',
    '        }',
    '        a[j + 1] = key;                /* the key drops into the hole */',
    '    }',
    '}'
  ];
  var J = [
    'void insertionSort(int[] a, int n) {',
    '    for (int i = 1; i < n; i++) {',
    '        int key = a[i];               // pull the key out (the red box)',
    '        int j = i - 1;',
    '        while (j >= 0 && a[j] > key) {',
    '            a[j + 1] = a[j];           // shift right, opening a hole at j',
    '            j--;',
    '        }',
    '        a[j + 1] = key;                // the key drops into the hole',
    '    }',
    '}'
  ];

  D.define({
    id: 'insertion-sort',
    title: T('Eklemeli sıralama (insertion sort)', 'Insertion sort'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 rastgele değer', '10 unordered values'),
        data: { values: [31, 12, 25, 8, 19, 40, 3, 27, 15, 22] } },
      { id: 'hard', level: 'hard', name: T('14 değer, uzun kaymalar gerekir', '14 values, needs long shifts'),
        data: { values: [45, 2, 38, 9, 33, 14, 29, 6, 41, 18, 24, 11, 36, 20] } },
      { id: 'already-sorted', level: 'edge', name: T('Zaten sıralı: her i için tek karşılaştırma, hiç kaydırma yok', 'Already sorted: one comparison per i, zero shifts'),
        data: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı: en kötü durum, her anahtar başa kadar kayar', 'Reverse sorted: worst case, every key shifts to the front'),
        data: { values: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] } },
      { id: 'duplicates', level: 'edge', name: T('Tekrarlı değerler: eşitlikte kaydırma durur (kararlı)', 'Duplicates: a tie stops the shift (stable)'),
        data: { values: [5, 3, 5, 1, 3, 5, 1, 3, 5, 1] } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler: INT_MAX, INT_MIN, sıfır', 'Extreme values: INT_MAX, INT_MIN, zero'),
        data: { values: [0, 2147483647, -2147483648, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1] } },
      { id: 'single', level: 'edge', name: T('Tek değer', 'A single value'), small: true,
        data: { values: [9] } }
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
      hint: T('Örnek: 31 12 25 8 19 40 3 27 15 22', 'Example: 31 12 25 8 19 40 3 27 15 22'),
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
      var W = 58, H = 44, X0 = 70, Y0 = 140;
      var comparisons = 0, shifts = 0;

      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: 'A =', anchor: 'end', size: 15, bold: true, mono: true });
      for (var i0 = 0; i0 < n; i0++) S.box('b' + i0, { x: X0 + i0 * W, y: Y0, w: W - 6, h: H, text: String(arr[i0]), style: 'normal', size: 16, above: String(i0) });
      var RX = X0 + n * W + 30;
      S.label('cnt', { x: RX, y: Y0 - 10, text: 'comparisons: 0   shifts: 0', size: 15, bold: true, mono: true, anchor: 'start' });
      S.label('decision', { x: RX, y: Y0 + 20, text: '', size: 16, bold: true, mono: true, anchor: 'start', style: 'normal' });

      function counters() { S.set('cnt', { text: 'comparisons: ' + comparisons + '   shifts: ' + shifts }); }
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      function paintArr(holeIdx) {
        for (var k = 0; k < n; k++) {
          if (k === holeIdx) S.set('b' + k, { text: '', style: 'empty' });
          else S.set('b' + k, { text: String(arr[k]), style: 'normal' });
        }
      }
      function sortedBrace(upto) {
        if (S.has('sortedb')) S.remove('sortedb');
        if (upto > 0) S.brace('sortedb', { from: 'b0', to: 'b' + (upto - 1), text: T('sıralı', 'already sorted'), side: 'top', dist: 14, style: 'active' });
      }

      sortedBrace(1);
      S.step(T('Sıralanacak ' + n + ' değer. Tek elemanlı bir dizi zaten sıralı sayılır (`A[0]`); `i = 1`den başlıyoruz.',
               n + ' values to sort. A one-element array counts as already sorted (`A[0]`); we start at `i = 1`.'),
             { c: [1], java: [1] });

      for (var i = 1; i < n; i++) {
        var key = arr[i];
        var detailed = i <= 2;
        var iStart = arr.slice();
        var iShifts = 0;
        sortedBrace(i);
        if (detailed) {
          paintArr();
          S.box('keybox', { x: X0 + i * W, y: Y0 - 70, w: W - 6, h: H, text: String(key), style: 'del', size: 16, above: T('anahtar', 'key') });
          counters();
          S.step(T('`i = ' + i + '`: anahtar `key = a[' + i + '] = ' + key + '`  kırmızı kutuya çekilir; `j = ' + (i - 1) + '` ile sola doğru kıyaslamaya başlanır.',
                   '`i = ' + i + '`: the key `key = a[' + i + '] = ' + key + '` is pulled out into the red box; comparing leftward starts with `j = ' + (i - 1) + '`.'),
                 { c: [{ n: 2, note: T('i = ' + i + ' < n (' + n + ')', 'i = ' + i + ' < n (' + n + ')') }, 3, 4],
                   java: [{ n: 2, note: T('i = ' + i + ' < n (' + n + ')', 'i = ' + i + ' < n (' + n + ')') }, 3, 4] });
        }
        var j = i - 1, hole = i;
        while (true) {
          if (j < 0) {
            if (detailed) {
              decide('j < 0', 'dim');
              paintArr(hole);
              S.step(T('`j = ' + j + '` (< 0): solda karşılaştıracak eleman kalmadı, döngü biter.', '`j = ' + j + '` (< 0): nothing left on the left to compare, the loop stops.'),
                     { c: [{ n: 5, note: T('j >= 0? hayır', 'j >= 0? no') }], java: [{ n: 5, note: T('j >= 0? hayır', 'j >= 0? no') }] });
            }
            break;
          }
          comparisons++;
          var greater = arr[j] > key;
          if (detailed) {
            paintArr(hole);
            S.set('b' + j, { style: 'active' });
            counters();
          }
          var note = greater ? T('a[' + j + ']=' + arr[j] + ' > key=' + key + '? evet', 'a[' + j + ']=' + arr[j] + ' > key=' + key + '? yes')
                              : T('a[' + j + ']=' + arr[j] + ' > key=' + key + '? hayır', 'a[' + j + ']=' + arr[j] + ' > key=' + key + '? no');
          if (!greater) {
            if (detailed) {
              decide('<= key: stop', 'normal');
              S.step(T('`a[' + j + ']` (' + arr[j] + ') anahtardan büyük değil: burası anahtarın doğru yeri, döngü durur.', '`a[' + j + ']` (' + arr[j] + ') is not greater than the key: this is the key\'s place, the loop stops.'),
                     { c: [{ n: 5, note: note }, { n: 6, skip: true }, { n: 7, skip: true }], java: [{ n: 5, note: note }, { n: 6, skip: true }, { n: 7, skip: true }] });
            }
            break;
          }
          if (detailed) decide('> key: shift', 'hl');
          arr[hole] = arr[j];
          shifts++;
          iShifts++;
          if (detailed) {
            paintArr(j);
            S.set('b' + hole, { text: String(arr[hole]), style: 'new' });
            S.arrow('shiftarrow', { from: 'b' + j, to: 'b' + hole, kind: 'center', style: 'hl', text: T('kaydır', 'shift') });
            counters();
            S.step(T('`a[' + j + ']` (' + arr[hole] + ') anahtardan büyük: bir hücre sağa kayar, boşluk `j = ' + j + '`e taşınır.', '`a[' + j + ']` (' + arr[hole] + ') is greater than the key: it shifts one cell right, the hole moves to `j = ' + j + '`.'),
                   { c: [{ n: 5, note: note }, 6, 7], java: [{ n: 5, note: note }, 6, 7] });
            if (S.has('shiftarrow')) S.remove('shiftarrow');
          }
          hole = j;
          j--;
        }
        arr[hole] = key;
        if (S.has('keybox')) S.remove('keybox');
        paintArr();
        S.set('b' + hole, { style: 'new' });
        counters();
        if (detailed) {
          S.step(T('Anahtar (' + key + ') boşluğa (`j+1 = ' + hole + '`) yerleşir. `A[0..' + i + ']` artık sıralı.', 'The key (' + key + ') drops into the hole (`j+1 = ' + hole + '`). `A[0..' + i + ']` is now sorted.'),
                 { c: [9], java: [9] });
        } else {
          decide('', 'normal');
          S.step(T('`i = ' + i + '`: anahtar `key = ' + key + '` (' + iShifts + ' kaydırma) ile yerleşir: [' + iStart.join(', ') + '] → [' + arr.join(', ') + '].',
                   '`i = ' + i + '`: key `key = ' + key + '` settles into place (' + iShifts + ' shifts): [' + iStart.join(', ') + '] -> [' + arr.join(', ') + '].'),
                 { c: [{ n: 2, note: T('i = ' + i + ' < n (' + n + ')', 'i = ' + i + ' < n (' + n + ')') }, 3, 4,
                       { n: 5, note: T('j >= 0 && a[j] > key iken tekrarlanır', 'repeats while j >= 0 && a[j] > key') }, 6, 7, 8, 9],
                   java: [{ n: 2, note: T('i = ' + i + ' < n (' + n + ')', 'i = ' + i + ' < n (' + n + ')') }, 3, 4,
                          { n: 5, note: T('j >= 0 && a[j] > key iken tekrarlanır', 'repeats while j >= 0 && a[j] > key') }, 6, 7, 8, 9] });
        }
      }
      sortedBrace(n);
      paintArr();
      decide('', 'normal');
      S.result = { sorted: arr.slice() };
      S.step(T('Bitti: [' + arr.join(', ') + ']. Toplam ' + comparisons + ' karşılaştırma, ' + shifts + ' kaydırma. En iyi durum (zaten sıralı) O(n); en kötü durum (tersten sıralı) O(n²). Kararlıdır (stable).',
               'Done: [' + arr.join(', ') + ']. Total ' + comparisons + ' comparisons, ' + shifts + ' shifts. Best case (already sorted) O(n); worst case (reverse sorted) O(n²). It is stable.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
