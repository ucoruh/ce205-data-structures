/* Week 10 -- Stability, demonstrated directly: the SAME input -- records with a numeric key and a letter TAG
 * that marks each record's original identity (so ties are visible) -- is sorted by key with two algorithms on
 * two rows. Row 1, insertion sort, compares with a STRICT `>` (line 7): an element only shifts past another
 * with a STRICTLY greater key, so two records with EQUAL keys never cross each other -- their tags stay in
 * their original relative order. Row 2, selection sort, can swap a record across a long distance (line 21) and
 * jump it past another record that has the same key sitting in between -- ties can end up reordered. Both
 * rows end up correctly sorted by key; only the tag order for tied keys differs. Comparisons and swaps are
 * counted per row on the right. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'typedef struct { int key; char tag; } Rec;',
    '',
    'void insertion_sort_stable(Rec a[], int n) {',
    '    for (int i = 1; i < n; i++) {',
    '        Rec key = a[i];',
    '        int j = i - 1;',
    '        while (j >= 0 && a[j].key > key.key) {   /* strict >: equal keys never cross */',
    '            a[j + 1] = a[j];',
    '            j--;',
    '        }',
    '        a[j + 1] = key;',
    '    }',
    '}',
    '',
    'void selection_sort_unstable(Rec a[], int n) {',
    '    for (int i = 0; i < n - 1; i++) {',
    '        int min_idx = i;',
    '        for (int j = i + 1; j < n; j++)',
    '            if (a[j].key < a[min_idx].key) min_idx = j;',
    '        if (min_idx != i) {',
    '            Rec tmp = a[i]; a[i] = a[min_idx]; a[min_idx] = tmp;   /* can jump a tie out of order */',
    '        }',
    '    }',
    '}'
  ];
  var J = [
    'static class Rec { int key; char tag; Rec(int k, char t) { key = k; tag = t; } }',
    '',
    'void insertionSortStable(Rec[] a, int n) {',
    '    for (int i = 1; i < n; i++) {',
    '        Rec key = a[i];',
    '        int j = i - 1;',
    '        while (j >= 0 && a[j].key > key.key) {   // strict >: equal keys never cross',
    '            a[j + 1] = a[j];',
    '            j--;',
    '        }',
    '        a[j + 1] = key;',
    '    }',
    '}',
    '',
    'void selectionSortUnstable(Rec[] a, int n) {',
    '    for (int i = 0; i < n - 1; i++) {',
    '        int minIdx = i;',
    '        for (int j = i + 1; j < n; j++)',
    '            if (a[j].key < a[minIdx].key) minIdx = j;',
    '        if (minIdx != i) {',
    '            Rec tmp = a[i]; a[i] = a[minIdx]; a[minIdx] = tmp;    // can jump a tie out of order',
    '        }',
    '    }',
    '}'
  ];

  function mk(key, tag) { return { key: key, tag: tag }; }
  function fmt(r) { return r.key + r.tag; }

  D.define({
    id: 'stability-demo',
    title: T('Kararlılık (stability): eşit anahtarlar', 'Stability: equal keys'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 kayıt, üç eşit anahtar grubu', '10 records, three groups of equal keys'),
        data: { values: [mk(5, 'a'), mk(2, 'a'), mk(5, 'b'), mk(8, 'a'), mk(2, 'b'), mk(5, 'c'), mk(1, 'a'), mk(8, 'b'), mk(2, 'c'), mk(9, 'a')] } },
      { id: 'hard', level: 'hard', name: T('14 kayıt, uzun bir eşit-anahtar zinciri', '14 records, a long chain of equal keys'),
        data: { values: [mk(4, 'a'), mk(4, 'b'), mk(4, 'c'), mk(4, 'd'), mk(4, 'e'), mk(2, 'a'), mk(7, 'a'), mk(2, 'b'), mk(7, 'b'), mk(1, 'a'), mk(9, 'a'), mk(4, 'f'), mk(2, 'c'), mk(7, 'c')] } },
      { id: 'all-equal', level: 'edge', name: T('Tüm anahtarlar eşit: tüm dizi bir "bağ" grubu', 'All keys equal: the whole array is one tie group'),
        data: { values: [mk(6, 'a'), mk(6, 'b'), mk(6, 'c'), mk(6, 'd'), mk(6, 'e'), mk(6, 'f'), mk(6, 'g'), mk(6, 'h'), mk(6, 'i'), mk(6, 'j')] } },
      { id: 'already-sorted', level: 'edge', name: T('Zaten sıralı anahtarlar, eşitler mevcut', 'Already-sorted keys, with ties present'),
        data: { values: [mk(1, 'a'), mk(2, 'a'), mk(2, 'b'), mk(3, 'a'), mk(4, 'a'), mk(4, 'b'), mk(5, 'a'), mk(6, 'a'), mk(6, 'b'), mk(7, 'a')] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı anahtarlar, eşitler mevcut', 'Reverse-sorted keys, with ties present'),
        data: { values: [mk(7, 'a'), mk(6, 'a'), mk(6, 'b'), mk(5, 'a'), mk(4, 'a'), mk(4, 'b'), mk(3, 'a'), mk(2, 'a'), mk(2, 'b'), mk(1, 'a')] } },
      { id: 'no-ties', level: 'edge', name: T('Eşit anahtar yok: her iki sıralama da aynı sonucu verir', 'No ties at all: both sorts give the identical result'),
        data: { values: [mk(9, 'a'), mk(3, 'a'), mk(7, 'a'), mk(1, 'a'), mk(5, 'a'), mk(2, 'a'), mk(8, 'a'), mk(4, 'a'), mk(6, 'a'), mk(0, 'a')] } },
      { id: 'pair', level: 'edge', name: T('İki eşit anahtarlı kayıt', 'Two records with an equal key'), small: true,
        data: { values: [mk(3, 'a'), mk(3, 'b')] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.values.length; },
    reference: function (d) {
      var withIdx = d.values.map(function (v, idx) { return { key: v.key, tag: v.tag, idx: idx }; });
      var stableSorted = withIdx.slice().sort(function (a, b) { return a.key - b.key || a.idx - b.idx; });
      var keysSorted = d.values.map(function (v) { return v.key; }).slice().sort(function (a, b) { return a - b; });
      return { stableTags: stableSorted.map(function (v) { return v.tag; }), unstableKeys: keysSorted };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 11, hard: 14, extreme: 14 }[level];
      var keyRange = level === 'extreme' ? 2 : (level === 'hard' ? 3 : 5);
      var counters = {};
      var values = [];
      for (var i = 0; i < n; i++) {
        var key = D.randInt(r, 0, keyRange);
        counters[key] = (counters[key] || 0) + 1;
        values.push(mk(key, String.fromCharCode(96 + counters[key])));
      }
      return { values: values };
    },
    input: {
      hint: T('Örnek: 5a 2a 5b 8a 2b 5c 1a 8b 2c 9a  (anahtar + tek harf etiket)', 'Example: 5a 2a 5b 8a 2b 5c 1a 8b 2c 9a  (key + single-letter tag)'),
      parse: function (text) {
        var values = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^(\d+)([a-z])$/i.exec(tok);
          if (!m) throw T('"' + tok + '" anlaşılmadı: sayı + tek harf yazın (örn. 5a).', '"' + tok + '" is not understood: write a number followed by one letter (e.g. 5a).');
          values.push(mk(parseInt(m[1], 10), m[2].toLowerCase()));
        });
        if (!values.length) throw T('En az bir kayıt yazın.', 'Write at least one record.');
        if (values.length > 18) throw T('En çok 18 kayıt.', 'At most 18 records.');
        return { values: values };
      },
      format: function (d) { return d.values.map(fmt).join(' '); },
      tokens: function (d) { return d.values.map(fmt); },
      bad: ['', '5 x 7', 'ab', '5', '5aa']
    },
    build: function (S, d) {
      var input = d.values.slice(), n = input.length;
      var arrS = input.slice(), arrU = input.slice();
      var W = 52, H = 40, X0 = 90, Y_S = 60, Y_U = 170;
      var compS = 0, swapS = 0, compU = 0, swapU = 0;

      S.label('rls', { x: X0 - 16, y: Y_S + H / 2 + 4, text: T('kararlı', 'stable'), anchor: 'end', size: 14, bold: true, style: 'active' });
      for (var i = 0; i < n; i++) S.box('s' + i, { x: X0 + i * W, y: Y_S, w: W - 6, h: H, text: fmt(arrS[i]), style: 'normal', size: 15, above: String(i) });
      S.label('rlu', { x: X0 - 16, y: Y_U + H / 2 + 4, text: T('kararsız', 'unstable'), anchor: 'end', size: 14, bold: true, style: 'del' });
      for (var i2 = 0; i2 < n; i2++) S.box('u' + i2, { x: X0 + i2 * W, y: Y_U, w: W - 6, h: H, text: fmt(arrU[i2]), style: 'normal', size: 15, above: String(i2) });

      var RX = X0 + n * W + 30;
      S.label('cnts', { x: RX, y: Y_S, text: 'comparisons: 0   swaps: 0', size: 13, bold: true, mono: true, anchor: 'start' });
      S.label('cntu', { x: RX, y: Y_U, text: 'comparisons: 0   swaps: 0', size: 13, bold: true, mono: true, anchor: 'start' });
      function paintS() { for (var k = 0; k < n; k++) S.set('s' + k, { text: fmt(arrS[k]) }); S.set('cnts', { text: 'comparisons: ' + compS + '   swaps: ' + swapS }); }
      function paintU() { for (var k = 0; k < n; k++) S.set('u' + k, { text: fmt(arrU[k]) }); S.set('cntu', { text: 'comparisons: ' + compU + '   swaps: ' + swapU }); }

      S.step(T(n + ' kayıt, her biri anahtar+etiket (örn. `5a`). Aynı anahtarlı kayıtlar (bağ/tie) hangi sırayla girdiyse, bir KARARLI sıralamanın çıktısında da o sırada kalmalıdır.',
               n + ' records, each key+tag (e.g. `5a`). Records with the same key (a tie) entered in some order; a STABLE sort must leave them in that same relative order on output.'),
             { c: [1], java: [1] });

      for (var ii = 1; ii < n; ii++) {
        var key = arrS[ii], j = ii - 1, tieNote = false;
        while (j >= 0 && arrS[j].key > key.key) {
          compS++; swapS++;
          arrS[j + 1] = arrS[j];
          j--;
        }
        if (j >= 0) compS++;
        arrS[j + 1] = key;
        S.set('s' + ii, { style: 'active' });
        paintS();
        S.set('s' + (j + 1), { style: 'new' });
        for (var q = 0; q <= j; q++) S.set('s' + q, { style: 'dim' });
        var tiedHere = (j >= 0 && arrS[j].key === key.key) || (j + 2 < n && arrS[j + 2] && arrS[j + 2].key === key.key);
        S.step(T('`' + fmt(key) + '` eklenir. ' + (tiedHere ? 'Eşit anahtarlı bir kayıtla karşılaştı: kesin `>` şartı sayesinde onu geçmedi, göreli sırası korunur.' : 'Doğru konumuna yerleşti.'),
                 '`' + fmt(key) + '` is inserted. ' + (tiedHere ? 'It met a record with an equal key: the strict `>` condition means it never passed it, relative order is preserved.' : 'It settles into its correct position.')),
               { c: [{ n: 4, note: T('i = ' + ii + ' < n (' + n + ')', 'i = ' + ii + ' < n (' + n + ')') }, 5, 6,
                     { n: 7, note: T('a[j].key > key.key?', 'a[j].key > key.key?') }, 8, 9, 11],
                 java: [{ n: 4, note: T('i = ' + ii + ' < n (' + n + ')', 'i = ' + ii + ' < n (' + n + ')') }, 5, 6,
                        { n: 7, note: T('a[j].key > key.key?', 'a[j].key > key.key?') }, 8, 9, 11] });
        for (var q2 = 0; q2 < n; q2++) S.set('s' + q2, { style: 'normal' });
      }
      paintS();
      S.step(T('Kararlı sıralama bitti: [' + arrS.map(fmt).join(', ') + ']. Etiket sırası kontrol edilebilir: her eşit-anahtar grubunda a, b, c... girdi sırasıyla aynı.',
               'Stable sort done: [' + arrS.map(fmt).join(', ') + ']. Check the tag order: within every equal-key group, a, b, c... matches the input order.'));

      for (var i3 = 0; i3 < n - 1; i3++) {
        var minIdx = i3;
        for (var jj = i3 + 1; jj < n; jj++) { compU++; if (arrU[jj].key < arrU[minIdx].key) minIdx = jj; }
        var jumpedTie = false;
        for (var m = i3 + 1; m < minIdx; m++) if (arrU[m].key === arrU[minIdx].key) jumpedTie = true;
        if (minIdx !== i3) {
          var vi = arrU[i3], vm = arrU[minIdx];
          arrU[i3] = vm; arrU[minIdx] = vi;
          swapU++;
        }
        paintU();
        S.set('u' + i3, { style: 'new' });
        for (var q3 = 0; q3 < i3; q3++) S.set('u' + q3, { style: 'dim' });
        S.step(T('`' + fmt(arrU[i3]) + '` konum ' + i3 + '\'e yerleşti (min_idx=' + minIdx + ').' + (jumpedTie ? ' Aralarında eşit anahtarlı başka bir kayıt vardı: UZUN MESAFELİ yer değiştirme onu geçti, göreli sıra BOZULDU.' : ''),
                 '`' + fmt(arrU[i3]) + '` settles into position ' + i3 + ' (min_idx=' + minIdx + ').' + (jumpedTie ? ' Another record with an equal key sat between them: the LONG-RANGE swap jumped past it, relative order is BROKEN.' : '')),
               { c: [{ n: 16, note: T('i = ' + i3 + ' < n-1 (' + (n - 1) + ')', 'i = ' + i3 + ' < n-1 (' + (n - 1) + ')') }, 17,
                     { n: 18, note: T('j = ' + (i3 + 1) + '..' + (n - 1) + ' için tekrarlanır', 'repeats for j = ' + (i3 + 1) + '..' + (n - 1)) },
                     { n: 19, note: T('a[j].key < a[min_idx].key olduğunda min_idx güncellenir', 'min_idx updates when a[j].key < a[min_idx].key') },
                     { n: 20, note: minIdx !== i3 ? T('min_idx != i? evet', 'min_idx != i? yes') : T('min_idx != i? hayır', 'min_idx != i? no') },
                     minIdx !== i3 ? 21 : { n: 21, skip: true }],
                 java: [{ n: 16, note: T('i = ' + i3 + ' < n-1 (' + (n - 1) + ')', 'i = ' + i3 + ' < n-1 (' + (n - 1) + ')') }, 17,
                        { n: 18, note: T('j = ' + (i3 + 1) + '..' + (n - 1) + ' için tekrarlanır', 'repeats for j = ' + (i3 + 1) + '..' + (n - 1)) },
                        { n: 19, note: T('a[j].key < a[min_idx].key olduğunda min_idx güncellenir', 'min_idx updates when a[j].key < a[min_idx].key') },
                        { n: 20, note: minIdx !== i3 ? T('min_idx != i? evet', 'min_idx != i? yes') : T('min_idx != i? hayır', 'min_idx != i? no') },
                        minIdx !== i3 ? 21 : { n: 21, skip: true }] });
        for (var q4 = 0; q4 < n; q4++) S.set('u' + q4, { style: 'normal' });
      }
      paintU();
      S.result = { stableTags: arrS.map(function (r) { return r.tag; }), unstableKeys: arrU.map(function (r) { return r.key; }) };
      S.step(T('Bitti. Kararsız sıralama: [' + arrU.map(fmt).join(', ') + ']. Anahtarlar aynı şekilde sıralı, ama en az bir eşit-anahtar grubunda etiket sırası girdiden farklı olabilir -- kararlılık, DOĞRULUK değil, EK bir garantidir.',
               'Done. Unstable sort: [' + arrU.map(fmt).join(', ') + ']. The keys are sorted identically, but at least one equal-key group can have its tag order differ from the input -- stability is an EXTRA guarantee, not correctness itself.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
