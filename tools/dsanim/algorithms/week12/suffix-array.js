/* Week 12 -- Strings: Structures and Algorithms
 * A suffix array lists every starting position of `text`, sorted by the SUFFIX that begins there (the whole
 * remaining tail of the string, not just one character). It answers "does pattern P occur in text?" with a
 * binary search over these sorted suffixes instead of a linear scan. We build it here with insertion sort
 * (simple to animate: rows slide into place); real libraries use an O(n log n) algorithm instead, but the
 * final sorted order is identical. Two distinct suffixes of the same text always have different lengths, so a
 * SHORTER suffix that is a prefix of a longer one always sorts first -- no special end-marker is needed. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int compare_suffix(const char *text, int a, int b) {',
    '    return strcmp(text + a, text + b);   /* pointer INTO the same buffer, no copy */',
    '}',
    '',
    'void build_suffix_array(const char *text, int n, int sa[]) {',
    '    for (int i = 0; i < n; i++) sa[i] = i;   /* start: unsorted, index order */',
    '    for (int i = 1; i < n; i++) {',
    '        int key = sa[i], j = i - 1;',
    '        while (j >= 0 && compare_suffix(text, sa[j], key) > 0) {',
    '            sa[j + 1] = sa[j];',
    '            j--;',
    '        }',
    '        sa[j + 1] = key;',
    '    }',
    '}'
  ];
  var JAVA = [
    'static int compareSuffix(String text, int a, int b) {',
    '    return text.substring(a).compareTo(text.substring(b));',
    '}',
    '',
    'static void buildSuffixArray(String text, int[] sa) {',
    '    int n = text.length();',
    '    for (int i = 0; i < n; i++) sa[i] = i;   // start: unsorted, index order',
    '    for (int i = 1; i < n; i++) {',
    '        int key = sa[i], j = i - 1;',
    '        while (j >= 0 && compareSuffix(text, sa[j], key) > 0) {',
    '            sa[j + 1] = sa[j];',
    '            j--;',
    '        }',
    '        sa[j + 1] = key;',
    '    }',
    '}'
  ];

  /** Independent: sorts with the language's own comparator, no shared code with build()'s insertion sort. */
  function reference(d) {
    var text = d.text, n = text.length, suffixes = [];
    for (var i = 0; i < n; i++) suffixes.push(i);
    suffixes.sort(function (a, b) { var sa = text.slice(a), sb = text.slice(b); return sa < sb ? -1 : (sa > sb ? 1 : 0); });
    return { order: suffixes };
  }

  function cmpSuffix(text, n, a, b) {
    var i = 0;
    while (true) {
      var inA = a + i < n, inB = b + i < n;
      if (!inA) return -1;
      if (!inB) return 1;
      if (text[a + i] !== text[b + i]) return text[a + i] < text[b + i] ? -1 : 1;
      i++;
    }
  }

  D.define({
    id: 'suffix-array',
    title: T('Sonek dizisi: sonekleri sıralamak', 'Suffix array: sorting the suffixes'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('"MISSISSIPPI" (11 harf): birçok tekrarlı sonek', '"MISSISSIPPI" (11 letters): many repeating suffixes'),
        data: { text: 'MISSISSIPPI' } },
      { id: 'hard', level: 'hard', name: T('"ABABABABAB" (10 harf): sürekli neredeyse-berabere karşılaştırmalar', '"ABABABABAB" (10 letters): comparisons are near-ties throughout'),
        data: { text: 'ABABABABAB' } },
      { id: 'all-same', level: 'edge', name: T('"AAAAAAAAAA": tüm karakterler aynı, uzunluk kararı verir', '"AAAAAAAAAA": every character is identical, length decides'),
        data: { text: 'AAAAAAAAAA' } },
      { id: 'already-sorted', level: 'edge', name: T('"ABCDEFGHIJ": artan sırada, ilk harf her zaman yeter', '"ABCDEFGHIJ": ascending order, the first letter always decides'),
        data: { text: 'ABCDEFGHIJ' } },
      { id: 'reverse-sorted', level: 'edge', name: T('"JIHGFEDCBA": azalan sırada, en çok kaydırma', '"JIHGFEDCBA": descending order, the most shifting'),
        data: { text: 'JIHGFEDCBA' } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.text.length; },
    reference: reference,
    random: function (level, r) {
      var n = D.randInt(r, 10, level === 'extreme' ? 15 : 12), alpha = level === 'easy' ? 8 : (level === 'normal' ? 5 : (level === 'hard' ? 3 : 2)), text = '', i;
      for (i = 0; i < n; i++) text += String.fromCharCode(65 + D.randInt(r, 0, alpha - 1));
      return { text: text };
    },
    input: {
      hint: T('Örnek: MISSISSIPPI  (10-16 harf, yalnız A-Z)', 'Example: MISSISSIPPI  (10-16 letters, A-Z only)'),
      parse: function (text) {
        var s = String(text).trim().toUpperCase();
        if (!/^[A-Z]+$/.test(s)) throw T('Yalnız A-Z harfleri kullanın, boşluksuz.', 'Use only letters A-Z, no spaces.');
        if (s.length < 10 || s.length > 20) throw T('Metin 10 ile 20 harf arasında olmalı.', 'The text must be between 10 and 20 letters.');
        return { text: s };
      },
      format: function (d) { return d.text; },
      bad: ['', 'ABC', 'HELLO WORLD', 'abcdefghij123', 'THISISAVERYVERYLONGTEXTINDEEDYES', '12345'],
      tokens: function (d) { return d.text.split(''); }
    },
    build: function (S, d) {
      var text = d.text, n = text.length, W = 30, H = 30, X0 = 150, Y0 = 130, RH = 38;
      S.label('trowlbl', { x: X0 - 16, y: 70 + H / 2 + 5, text: 'text[] =', anchor: 'end', size: 15, bold: true });
      for (var ti = 0; ti < n; ti++) S.box('tb' + ti, { x: X0 + ti * W, y: 70, w: 26, h: H, text: text[ti], style: 'dim', size: 14, above: String(ti) });
      var RX = X0 + n * W + 40;
      S.label('dec', { x: RX, y: 90, text: '', size: 15, bold: true, anchor: 'start' });
      S.label('dec2', { x: RX, y: 114, text: '', size: 12, anchor: 'start', style: 'dim' });

      var order = []; // current sorted list of suffix start indices, top (slot 0) = smallest
      function rowY(slot) { return Y0 + slot * RH; }
      function drawRow(start, slot) {
        var len = n - start;
        S.label('lbl' + start, { x: X0 - 16, y: rowY(slot) + H / 2 + 5, text: 'i=' + start + ':', anchor: 'end', size: 13, mono: true });
        for (var j = 0; j < len; j++) S.box('row' + start + '_' + j, { x: X0 + j * W, y: rowY(slot), w: 26, h: H, text: text[start + j], style: 'new', size: 14 });
      }
      function moveRow(start, slot) {
        var len = n - start;
        S.move('lbl' + start, null, rowY(slot));
        for (var j = 0; j < len; j++) S.move('row' + start + '_' + j, null, rowY(slot));
      }
      function styleRow(start, style) {
        var len = n - start;
        for (var j = 0; j < len; j++) S.set('row' + start + '_' + j, { style: style });
      }

      S.step(T('`sa[] = {0,1,...,' + (n - 1) + '}`: başlangıçta sonekler indis sırasında, hiç sıralı değil. Ekleme sıralaması (insertion sort) ile sıralayacağız.',
               '`sa[] = {0,1,...,' + (n - 1) + '}`: at first the suffixes are in index order, not sorted. We will sort them with insertion sort.'),
             { c: [5, { n: 6, note: T('i = 0..' + (n - 1), 'i = 0..' + (n - 1)) }],
               java: [6, { n: 7, note: T('i = 0..' + (n - 1), 'i = 0..' + (n - 1)) }] });

      order.push(0); drawRow(0, 0);
      S.step(T('`i=0`: tek bir soneği sıralı bir dizi saymak yeterli, hiç karşılaştırma yok.', '`i=0`: a single suffix already counts as sorted, no comparison needed.'),
             { c: [{ n: 7, note: T('i = 1..' + (n - 1), 'i = 1..' + (n - 1)) }, 8],
               java: [{ n: 8, note: T('i = 1..' + (n - 1), 'i = 1..' + (n - 1)) }, 9] });

      var DETAILED = 3;
      for (var i = 1; i < n; i++) {
        S.at(i);
        var key = i, detailed = i <= DETAILED;
        order.push(key);
        var slot = order.length - 1;
        drawRow(key, slot);
        if (detailed) {
          S.step(T('`i=' + i + '`: `key = sa[' + i + '] = ' + key + '`, yeni sonek geçici olarak en alta konur.', '`i=' + i + '`: `key = sa[' + i + '] = ' + key + '`, the new suffix is placed at the bottom for now.'),
                 { c: [{ n: 7, note: T('i = ' + i, 'i = ' + i) }, 8], java: [{ n: 8, note: T('i = ' + i, 'i = ' + i) }, 9] });
        }
        var j = slot - 1, shifts = 0;
        while (j >= 0 && cmpSuffix(text, n, order[j], key) > 0) {
          if (detailed) {
            styleRow(order[j], 'active'); styleRow(key, 'active');
            S.set('dec', { text: 'i=' + order[j], style: 'del' }); S.set('dec2', { text: T('> ile başlıyor -- yer değiştir', 'starts greater -- swap'), style: 'del' });
            S.step(T('`i=' + order[j] + '` soneği ("' + text.slice(order[j]) + '") "' + text.slice(key) + '"\'den büyük -- yer değiştirirler.', 'suffix `i=' + order[j] + '` ("' + text.slice(order[j]) + '") is greater than "' + text.slice(key) + '" -- they swap.'),
                   { c: [{ n: 9, note: T('> ? evet', '> ? yes') }, 10, 11], java: [{ n: 10, note: T('> ? evet', '> ? yes') }, 11, 12] });
          }
          order[j + 1] = order[j];
          moveRow(order[j], j + 1);
          j--; shifts++;
          if (detailed) styleRow(order[j + 1], 'normal');
        }
        order[j + 1] = key;
        moveRow(key, j + 1);
        styleRow(key, 'normal');
        S.set('dec', { text: '', style: 'normal' }); S.set('dec2', { text: '' });
        if (!detailed) {
          S.step(T('`i=' + i + '`: "' + text.slice(key) + '" ' + shifts + ' kaydırmadan sonra ' + (j + 1) + '. sıraya yerleşir.', '`i=' + i + '`: "' + text.slice(key) + '" settles into rank ' + (j + 1) + ' after ' + shifts + ' shift' + (shifts === 1 ? '' : 's') + '.'),
                 { c: [{ n: 9, note: T('> ? evet (' + shifts + ' kez)', '> ? yes (' + shifts + ' time(s))') }, 10, 11, { n: 9, note: T('> ? hayır -- dur', '> ? no -- stop') }, 13],
                   java: [{ n: 10, note: T('> ? evet (' + shifts + ' kez)', '> ? yes (' + shifts + ' time(s))') }, 11, 12, { n: 10, note: T('> ? hayır -- dur', '> ? no -- stop') }, 14] });
        } else {
          S.step(T('`j >= 0` yanlış ya da artık büyük değil -- `sa[' + (j + 1) + '] = ' + key + '` ile yerine oturur.', '`j >= 0` is false, or it is no longer greater -- it settles with `sa[' + (j + 1) + '] = ' + key + '`.'),
                 { c: [{ n: 9, note: T('> ? hayır', '> ? no') }, 13], java: [{ n: 10, note: T('> ? hayır', '> ? no') }, 14] });
        }
      }

      S.at(null);
      S.result = { order: order.slice() };
      S.step(T('Bitti: sonek dizisi = [' + order.join(', ') + ']. Artık `pattern` aramak, sıralı listede **ikili arama** ile yapılabilir -- O(m log n).',
               'Done: the suffix array = [' + order.join(', ') + ']. Searching for a `pattern` can now use **binary search** over this sorted list -- O(m log n).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
