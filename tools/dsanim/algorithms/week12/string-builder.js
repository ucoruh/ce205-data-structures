/* Week 12 -- Strings: Structures and Algorithms
 * A growable string buffer (the idea behind Java's StringBuilder / C++'s std::string): characters are
 * appended one at a time. The buffer starts at some small capacity `cap`; whenever it is full and one more
 * character must be appended, a NEW, bigger block (double the size) is allocated, every existing character is
 * copied across, and only then is the new character written. Appending is O(1) most of the time and O(len)
 * only on the rare growth step -- amortized O(1) overall, exactly like Week 1's dynamic array. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'char *buf = malloc(cap);   /* cap = INITCAP */',
    'int len = 0;',
    '',
    'void append(char c) {',
    '    if (len == cap) {        /* full: grow before writing */',
    '        cap = cap * 2;',
    '        buf = realloc(buf, cap);   /* copies every old byte across */',
    '    }',
    '    buf[len] = c;',
    '    len++;',
    '}'
  ];
  var JAVA = [
    'char[] buf = new char[cap];   // cap = INITCAP',
    'int len = 0;',
    '',
    'void append(char c) {',
    '    if (len == cap) {          // full: grow before writing',
    '        cap = cap * 2;',
    '        char[] bigger = new char[cap];',
    '        System.arraycopy(buf, 0, bigger, 0, len);   // copies every old byte across',
    '        buf = bigger;',
    '    }',
    '    buf[len] = c;',
    '    len++;',
    '}'
  ];

  function trace(initCap, chars) {
    var cap = initCap, len = 0, growths = 0, i;
    for (i = 0; i < chars.length; i++) {
      if (len === cap) { cap = cap * 2; growths++; }
      len++;
    }
    return { finalCap: cap, growths: growths };
  }

  /** Independent: a growth happens exactly when the running capacity is <= the last append's index
   * (n-1) -- a closed-form doubling-boundary count, not build()'s per-character trace() loop. */
  function refGrowth(initCap, n) {
    var cap = initCap, growths = 0;
    while (cap <= n - 1) { cap *= 2; growths++; }
    return { finalCap: cap, growths: growths };
  }

  D.define({
    id: 'string-builder',
    title: T('Büyüyen dizgi arabelleği (string builder)', 'Growable string buffer (string builder)'),
    code: function (d) {
      var cap = d && d.initCap || 4;
      return {
        c: ['char *buf = malloc(cap);   /* cap = ' + cap + ' */'].concat(C.slice(1)),
        java: ['char[] buf = new char[cap];   // cap = ' + cap].concat(JAVA.slice(1))
      };
    },
    presets: [
      { id: 'normal', level: 'normal', name: T('initCap=4, "HELLOWORLD" (10 harf): 2 büyüme', 'initCap=4, "HELLOWORLD" (10 letters): 2 growths'),
        data: { initCap: 4, chars: 'HELLOWORLD' } },
      { id: 'hard', level: 'hard', name: T('initCap=2, 14 harf: art arda çok sayıda büyüme', 'initCap=2, 14 letters: many growths back to back'),
        data: { initCap: 2, chars: 'ALGORITHMSDATA' } },
      { id: 'exact-fit', level: 'edge', name: T('initCap=10, tam 10 harf: hiç büyüme yok', 'initCap=10, exactly 10 letters: no growth at all'),
        data: { initCap: 10, chars: 'ABCDEFGHIJ' } },
      { id: 'min-cap', level: 'edge', name: T('initCap=1: en küçük başlangıçtan en çok büyüme', 'initCap=1: the smallest start, the most growths'),
        data: { initCap: 1, chars: 'ABCDEFGHIJ' } },
      { id: 'single-growth', level: 'edge', name: T('initCap=9, 10 harf: tam sınırda tek büyüme', 'initCap=9, 10 letters: a single growth right at the boundary'),
        data: { initCap: 9, chars: 'ABCDEFGHIJ' } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.chars.length; },
    /** Independent computation: refGrowth(), not trace() -- build() calls trace() for its layout sizing, so
     * reference() must never call it too (it would no longer catch a bug shared between them). */
    reference: function (d) {
      var g = refGrowth(d.initCap, d.chars.length);
      return { text: d.chars, finalCap: g.finalCap, growths: g.growths, finalLen: d.chars.length };
    },
    random: function (level, r) {
      var n = D.randInt(r, 10, level === 'extreme' ? 16 : 13), chars = '', i;
      for (i = 0; i < n; i++) chars += String.fromCharCode(65 + D.randInt(r, 0, 25));
      var initCap = { easy: D.randInt(r, 6, 10), normal: D.randInt(r, 3, 6), hard: D.randInt(r, 2, 3), extreme: 1 }[level];
      return { initCap: initCap, chars: chars };
    },
    input: {
      hint: T('Örnek: cap=4 HELLOWORLD  (cap başlangıç kapasitesi; ikinci sözcük yalnız A-Z0-9, boşluksuz)',
              'Example: cap=4 HELLOWORLD  (cap is the starting capacity; the second word is A-Z0-9 only, no spaces)'),
      parse: function (text) {
        var cap = null, str = null;
        String(text).trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
          var m = /^cap[=:](\d+)$/i.exec(tok);
          if (m) { cap = parseInt(m[1], 10); return; }
          if (!/^[A-Za-z0-9]+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: yalnız harf ve rakam kullanın.', '"' + tok + '" is not understood: use only letters and digits.');
          str = tok.toUpperCase();
        });
        if (cap === null) throw T('cap=N yazmalısınız (başlangıç kapasitesi).', 'You must write cap=N (the starting capacity).');
        if (cap < 1 || cap > 20) throw T('cap 1 ile 20 arasında olmalı.', 'cap must be between 1 and 20.');
        if (!str) throw T('Bir metin yazmalısınız (yalnız harf/rakam).', 'You must write a text (letters/digits only).');
        if (str.length < 1 || str.length > 24) throw T('Metin 1 ile 24 karakter arasında olmalı.', 'The text must be between 1 and 24 characters.');
        return { initCap: cap, chars: str };
      },
      format: function (d) { return 'cap=' + d.initCap + ' ' + d.chars; },
      bad: ['', 'cap=0 HELLO', 'cap=99 HELLO', 'HELLO', 'cap=4 hello world!', 'cap=abc HELLO'],
      tokens: function (d) { return d.chars.split(''); }
    },
    build: function (S, d) {
      var initCap = d.initCap, chars = d.chars, W = 40, H = 40, X0 = 90, Y0 = 150;
      var maxCap = trace(initCap, chars).finalCap;
      var RX = X0 + maxCap * W + 40;
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: 'buf[] =', anchor: 'end', size: 15, bold: true });
      S.label('caplbl', { x: X0, y: 40, text: 'cap = ' + initCap, size: 18, bold: true, mono: true });
      S.label('lenlbl', { x: X0, y: 64, text: 'len = 0', style: 'dim', size: 14, mono: true });
      S.label('dec', { x: RX, y: Y0 + H / 2 + 5, text: '', size: 15, bold: true, anchor: 'start' });

      var cap = initCap, len = 0, growths = 0;
      for (var i = 0; i < cap; i++) S.box('b' + i, { x: X0 + i * W, y: Y0, w: 32, h: H, text: '', style: 'empty', size: 14, above: String(i) });

      S.step(T('`cap = ' + initCap + '` baytlık bir arabellek ayrılır (`malloc`), `len = 0`. ' + chars.length + ' harf sırayla eklenecek: "' + chars + '".',
               'A `cap = ' + initCap + '`-byte buffer is allocated (`malloc`), `len = 0`. ' + chars.length + ' letters will be appended in order: "' + chars + '".'),
             { c: [1, 2], java: [1, 2] });

      chars.split('').forEach(function (ch, k) {
        S.at(k);
        if (len === cap) {
          growths++;
          var oldCap = cap;
          for (var m = 0; m < len; m++) S.set('b' + m, { style: 'active' });
          S.set('dec', { text: T('dolu! cap ' + oldCap + ' -> ' + (oldCap * 2), 'full! cap ' + oldCap + ' -> ' + (oldCap * 2)), style: 'del' });
          S.step(T('`append(\'' + ch + '\')` -- `len == cap` (' + len + ' == ' + oldCap + '), arabellek dolu. Yeni bir `cap = ' + (oldCap * 2) + '` baytlık blok ayrılır ve eski ' + len + ' bayt oraya **kopyalanır**: bu adım O(len).',
                   '`append(\'' + ch + '\')` -- `len == cap` (' + len + ' == ' + oldCap + '), the buffer is full. A new `cap = ' + (oldCap * 2) + '`-byte block is allocated and the old ' + len + ' bytes are **copied** across: this step is O(len).'),
                 { c: [{ n: 5, note: T('len == cap? evet', 'len == cap? yes') }, 6, 7] });
          cap = cap * 2;
          for (var m2 = 0; m2 < len; m2++) S.set('b' + m2, { style: 'new' });
          for (var e = oldCap; e < cap; e++) S.box('b' + e, { x: X0 + e * W, y: Y0, w: 32, h: H, text: '', style: 'empty', size: 14, above: String(e) });
          S.set('caplbl', { text: 'cap = ' + cap });
          for (var m3 = 0; m3 < len; m3++) S.set('b' + m3, { style: 'normal' });
        } else {
          S.set('dec', { text: '', style: 'normal' });
        }
        S.set('b' + len, { style: 'hl' });
        S.step(T('koşul yanlış (' + len + ' != ' + cap + ') -- büyümeye gerek yok.', 'condition false (' + len + ' != ' + cap + ') -- no growth needed.'),
               { c: [{ n: 5, note: T('len == cap? hayır', 'len == cap? no') }] });
        S.set('b' + len, { text: ch, style: 'new' });
        len++;
        S.set('lenlbl', { text: 'len = ' + len });
        S.step(T('`buf[' + (len - 1) + '] = \'' + ch + '\'`; `len` bir artar (' + len + ').', '`buf[' + (len - 1) + '] = \'' + ch + '\'`; `len` goes up by one (' + len + ').'),
               { c: [9, 10] });
      });

      S.at(null);
      S.set('dec', { text: '', style: 'normal' });
      S.result = { text: chars, finalCap: cap, growths: growths, finalLen: len };
      S.step(T('Bitti: ' + chars.length + ' harf eklendi, ' + growths + ' büyüme oldu, son kapasite = ' + cap + ' (' + (cap - len) + ' bayt boşta). Büyüme ender ve pahalı (O(len)) ama toplamda amorti edilmiş **O(1)** ekleme sağlar.',
               'Done: ' + chars.length + ' letters were appended, ' + growths + ' growth' + (growths === 1 ? '' : 's') + ' happened, final capacity = ' + cap + ' (' + (cap - len) + ' bytes unused). Growth is rare and expensive (O(len)) but gives amortized **O(1)** append overall.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
