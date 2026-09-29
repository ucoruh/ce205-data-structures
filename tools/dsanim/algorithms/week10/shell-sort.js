/* Week 10 -- Shell sort: insertion sort, but comparing elements `gap` apart instead of adjacent. The gap
 * starts at n/2 and halves every round down to 1 (Shell's original sequence); a large gap moves far-out-of-
 * place values most of the distance home in one jump, so by the time gap == 1 the array is "almost sorted"
 * and that final pass (plain insertion sort) is cheap. The gap sequence used is shown at the top; comparisons
 * and shifts are counted on the right. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'void shell_sort(int a[], int n) {',
    '    for (int gap = n / 2; gap > 0; gap /= 2) {   /* gap sequence: n/2, n/4, ..., 1 */',
    '        for (int i = gap; i < n; i++) {',
    '            int key = a[i];',
    '            int j = i;',
    '            while (j >= gap && a[j - gap] > key) {',
    '                a[j] = a[j - gap];               /* shift by gap, not by 1 */',
    '                j -= gap;',
    '            }',
    '            a[j] = key;',
    '        }',
    '    }',
    '}'
  ];
  var J = [
    'void shellSort(int[] a, int n) {',
    '    for (int gap = n / 2; gap > 0; gap /= 2) {   // gap sequence: n/2, n/4, ..., 1',
    '        for (int i = gap; i < n; i++) {',
    '            int key = a[i];',
    '            int j = i;',
    '            while (j >= gap && a[j - gap] > key) {',
    '                a[j] = a[j - gap];               // shift by gap, not by 1',
    '                j -= gap;',
    '            }',
    '            a[j] = key;',
    '        }',
    '    }',
    '}'
  ];

  function gapSeq(n) { var g = [], gap = Math.floor(n / 2); while (gap > 0) { g.push(gap); gap = Math.floor(gap / 2); } return g; }

  D.define({
    id: 'shell-sort',
    title: T('Shell sıralaması (shell sort)', 'Shell sort'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 değer, aralık dizisi 5, 2, 1', '10 values, gap sequence 5, 2, 1'),
        data: { values: [23, 9, 41, 5, 33, 17, 2, 46, 12, 28] } },
      { id: 'hard', level: 'hard', name: T('16 değer, aralık dizisi 8, 4, 2, 1', '16 values, gap sequence 8, 4, 2, 1'),
        data: { values: [50, 3, 47, 8, 44, 12, 39, 16, 34, 20, 29, 24, 25, 27, 1, 45] } },
      { id: 'already-sorted', level: 'edge', name: T('Zaten sıralı: her aralıkta hiç kaydırma yok', 'Already sorted: zero shifts at every gap'),
        data: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı: büyük aralıklar uzun mesafeleri hemen kapatır', 'Reverse sorted: large gaps close long distances immediately'),
        data: { values: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] } },
      { id: 'duplicates', level: 'edge', name: T('Tekrarlı değerler', 'Duplicate values'),
        data: { values: [6, 2, 6, 2, 6, 2, 6, 2, 6, 2] } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler: INT_MAX, INT_MIN, sıfır', 'Extreme values: INT_MAX, INT_MIN, zero'),
        data: { values: [0, 2147483647, -2147483648, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1] } },
      { id: 'single', level: 'edge', name: T('Tek değer', 'A single value'), small: true,
        data: { values: [4] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.values.length; },
    reference: function (d) { return { sorted: d.values.slice().sort(function (a, b) { return a - b; }) }; },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 16, extreme: 18 }[level];
      var lo = level === 'extreme' ? -1000 : 1, hi = level === 'extreme' ? 99 : 99;
      var values = [];
      for (var i = 0; i < n; i++) values.push(D.randInt(r, lo, hi));
      return { values: values };
    },
    input: {
      hint: T('Örnek: 23 9 41 5 33 17 2 46 12 28', 'Example: 23 9 41 5 33 17 2 46 12 28'),
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
      var W = 58, H = 44, X0 = 70, Y0 = 100;
      var comparisons = 0, shifts = 0;
      var gaps = gapSeq(n);

      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: 'A =', anchor: 'end', size: 15, bold: true, mono: true });
      for (var i0 = 0; i0 < n; i0++) S.box('b' + i0, { x: X0 + i0 * W, y: Y0, w: W - 6, h: H, text: String(arr[i0]), style: 'normal', size: 16, above: String(i0) });
      var RX = X0 + n * W + 30;
      S.label('gaplbl', { x: RX, y: Y0 - 40, text: 'gap = ' + (gaps.length ? gaps[0] : 0), size: 17, bold: true, mono: true, anchor: 'start', style: 'active' });
      S.label('cnt', { x: RX, y: Y0 - 10, text: 'comparisons: 0   shifts: 0', size: 15, bold: true, mono: true, anchor: 'start' });
      S.label('decision', { x: RX, y: Y0 + 20, text: '', size: 16, bold: true, mono: true, anchor: 'start', style: 'normal' });

      function counters() { S.set('cnt', { text: 'comparisons: ' + comparisons + '   shifts: ' + shifts }); }
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      function paint(hi) {
        for (var k = 0; k < n; k++) S.set('b' + k, { text: String(arr[k]), style: hi && hi.indexOf(k) >= 0 ? 'active' : 'normal' });
      }

      S.step(gaps.length
               ? T('Sıralanacak ' + n + ' değer. Aralık dizisi: ' + gaps.join(', ') + ' (her turda `gap /= 2`). Büyük aralıklar önce uzak elemanları hızla yaklaştırır.',
                   n + ' values to sort. Gap sequence: ' + gaps.join(', ') + ' (each round `gap /= 2`). Large gaps move far-apart elements close together quickly.')
               : T('Tek elemanlı dizi (' + n + ' değer): `n / 2 == 0`, hiç tur çalışmaz -- zaten sıralı.',
                   'A one-element array (' + n + ' value): `n / 2 == 0`, no round ever runs -- already sorted.'),
             { c: [1], java: [1] });

      for (var gi = 0; gi < gaps.length; gi++) {
        var gap = gaps[gi];
        S.set('gaplbl', { text: 'gap = ' + gap });
        paint();
        S.step(T((gap === 1 ? 'Son tur: ' : ('Tur ' + (gi + 1) + ': ')) + '`gap = ' + gap + '`. Şimdi indisi `gap` kadar uzak elemanlar karşılaştırılıp gerekirse kaydırılır -- tıpkı eklemeli sıralama gibi, ama `1` yerine `' + gap + '` adım.',
                 (gap === 1 ? 'Final round: ' : ('Round ' + (gi + 1) + ': ')) + '`gap = ' + gap + '`. Elements `gap` positions apart are now compared and shifted if needed -- just like insertion sort, but stepping by `' + gap + '` instead of `1`.'),
               { c: [{ n: 2, note: T('gap = ' + gap + ' > 0', 'gap = ' + gap + ' > 0') }],
                 java: [{ n: 2, note: T('gap = ' + gap + ' > 0', 'gap = ' + gap + ' > 0') }] });
        for (var i = gap; i < n; i++) {
          var key = arr[i], j = i;
          var detailed = gi === 0 && i === gap;
          var iStart = arr.slice();
          var iShifts = 0;
          if (detailed) {
            paint([i]);
            S.step(T('`i = ' + i + '`: anahtar `key = a[' + i + '] = ' + key + '`.', '`i = ' + i + '`: key `key = a[' + i + '] = ' + key + '`.'),
                   { c: [{ n: 3, note: T('i = ' + i + ' < n (' + n + ')', 'i = ' + i + ' < n (' + n + ')') }, 4, 5],
                     java: [{ n: 3, note: T('i = ' + i + ' < n (' + n + ')', 'i = ' + i + ' < n (' + n + ')') }, 4, 5] });
          }
          while (true) {
            if (j < gap) {
              if (detailed) {
                decide('j < gap', 'dim');
                S.step(T('`j = ' + j + '` < `gap` (' + gap + '): solda bu aralıkta eleman kalmadı.', '`j = ' + j + '` < `gap` (' + gap + '): nothing left at this gap on the left.'),
                       { c: [{ n: 6, note: T('j >= gap? hayır', 'j >= gap? no') }], java: [{ n: 6, note: T('j >= gap? hayır', 'j >= gap? no') }] });
              }
              break;
            }
            comparisons++;
            var greater = arr[j - gap] > key;
            if (detailed) { paint([j, j - gap]); counters(); }
            var note = greater ? T('a[' + (j - gap) + ']=' + arr[j - gap] + ' > key=' + key + '? evet', 'a[' + (j - gap) + ']=' + arr[j - gap] + ' > key=' + key + '? yes')
                                : T('a[' + (j - gap) + ']=' + arr[j - gap] + ' > key=' + key + '? hayır', 'a[' + (j - gap) + ']=' + arr[j - gap] + ' > key=' + key + '? no');
            if (!greater) {
              if (detailed) {
                decide('<= key: stop', 'normal');
                S.step(T('`a[' + (j - gap) + ']` anahtardan büyük değil: yerleştirme burada durur.', '`a[' + (j - gap) + ']` is not greater than the key: placement stops here.'),
                       { c: [{ n: 6, note: note }, { n: 7, skip: true }, { n: 8, skip: true }], java: [{ n: 6, note: note }, { n: 7, skip: true }, { n: 8, skip: true }] });
              }
              break;
            }
            if (detailed) decide('> key: shift by gap', 'hl');
            arr[j] = arr[j - gap];
            shifts++;
            iShifts++;
            if (detailed) {
              paint([j, j - gap]);
              S.set('b' + j, { style: 'new' });
              counters();
              S.step(T('`a[' + (j - gap) + ']` anahtardan büyük: `gap` (' + gap + ') kadar sağa kayar (j=' + j + ' ← j-gap=' + (j - gap) + ').', '`a[' + (j - gap) + ']` is greater than the key: it shifts right by `gap` (' + gap + ') (j=' + j + ' ← j-gap=' + (j - gap) + ').'),
                     { c: [{ n: 6, note: note }, 7, 8], java: [{ n: 6, note: note }, 7, 8] });
            }
            j -= gap;
          }
          arr[j] = key;
          paint();
          S.set('b' + j, { style: 'new' });
          counters();
          if (detailed) {
            S.step(T('Anahtar (' + key + ') `j = ' + j + '`ye yerleşir.', 'The key (' + key + ') drops in at `j = ' + j + '`.'), { c: [9], java: [9] });
          } else {
            decide('', 'normal');
            S.step(T('`i = ' + i + '` (gap=' + gap + '): anahtar `key = ' + key + '` (' + iShifts + ' kaydırma) ile yerleşir: [' + iStart.join(', ') + '] → [' + arr.join(', ') + '].',
                     '`i = ' + i + '` (gap=' + gap + '): key `key = ' + key + '` settles (' + iShifts + ' shifts): [' + iStart.join(', ') + '] -> [' + arr.join(', ') + '].'),
                   { c: [{ n: 3, note: T('i = ' + i + ' < n (' + n + ')', 'i = ' + i + ' < n (' + n + ')') }, 4, 5,
                         { n: 6, note: T('j >= gap && a[j-gap] > key iken tekrarlanır', 'repeats while j >= gap && a[j-gap] > key') }, 7, 8, 9],
                     java: [{ n: 3, note: T('i = ' + i + ' < n (' + n + ')', 'i = ' + i + ' < n (' + n + ')') }, 4, 5,
                            { n: 6, note: T('j >= gap && a[j-gap] > key iken tekrarlanır', 'repeats while j >= gap && a[j-gap] > key') }, 7, 8, 9] });
          }
        }
      }
      paint();
      decide('', 'normal');
      S.result = { sorted: arr.slice() };
      S.step(T('Bitti: [' + arr.join(', ') + ']. Toplam ' + comparisons + ' karşılaştırma, ' + shifts + ' kaydırma. Bu aralık dizisiyle en kötü durum O(n²), ama pratikte adi eklemeli sıralamadan çok daha hızlıdır.',
               'Done: [' + arr.join(', ') + ']. Total ' + comparisons + ' comparisons, ' + shifts + ' shifts. Worst case O(n²) with this gap sequence, but far faster than plain insertion sort in practice.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
