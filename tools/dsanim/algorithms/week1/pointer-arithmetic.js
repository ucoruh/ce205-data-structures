/* Week 1 — pointer arithmetic: p + k means base address + k * sizeof(*p), never k bytes.
 * An out-of-range k is flagged as undefined behavior (UB).
 * Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var SIZEOF = { char: 1, short: 2, int: 4, double: 8 };
  var ROW = 16, ROWH = 120; // ROWH: tall enough that the 'top' pointer p (dist 22) above a wrapped row's box
  // never reaches into the address labels ('below' text) of the row above it.

  function code(d) {
    var type = (d && d.type) || 'int';
    var sz = SIZEOF[type];
    var C = [
      type + ' a[N];                    /* N input values */',
      type + ' *p = a;                  /* array decays to a pointer to its first element */',
      '',
      'if (k < 0 || k >= N) {',
      '    /* p + k lands outside a[]: reading *(p + k) is undefined behavior (UB) */',
      '} else {',
      '    void *addr = (void *) (p + k);   /* address + k * sizeof(' + type + '), sizeof(' + type + ') = ' + sz + ' */',
      '    ' + type + ' v = *(p + k);        /* dereference: read the value at that address */',
      '}'
    ];
    var JAVA = [
      type + '[] a = new ' + type + '[N];',
      '// Java has no pointer arithmetic; indices are the only way to move between elements',
      '',
      'if (k < 0 || k >= N) {',
      '    // out of range: throws ArrayIndexOutOfBoundsException, not undefined behaviour',
      '} else {',
      '    ' + type + ' v = a[k];             // a[k] is the closest Java equivalent of *(p + k)',
      '}'
    ];
    return { c: C, java: JAVA };
  }

  D.define({
    id: 'pointer-arithmetic',
    title: T('İşaretçi (pointer) aritmetiği: p + k, k × sizeof(*p) demektir', 'Pointer arithmetic: p + k means k * sizeof(*p)'),
    code: code,
    presets: [
      { id: 'normal', level: 'normal', name: T('int dizi, 5 geçerli offset', 'int array, 5 valid offsets'),
        data: { base: 1000, type: 'int', values: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], offsets: [0, 1, 2, 4, 9] } },
      { id: 'hard', level: 'hard', name: T('double dizi (sizeof = 8), 7 offset', 'double array (sizeof = 8), 7 offsets'),
        data: { base: 2000, type: 'double', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], offsets: [0, 2, 5, 8, 11, 6, 3] } },
      { id: 'out-of-range', level: 'edge', name: T('Aralık dışı offsetler: negatif ve N\'i aşan', 'Out-of-range offsets: negative and beyond N'),
        data: { base: 1000, type: 'int', values: [4, 8, 15, 16, 23, 42, 8, 9, 15, 3], offsets: [-1, 0, 5, 10, 15] } },
      { id: 'char-type', level: 'edge', name: T('char dizi (sizeof = 1): p + k, k bayt ile çakışır', 'char array (sizeof = 1): p + k coincides with k bytes'),
        data: { base: 500, type: 'char', values: [65, 66, 67, 68, 69, 70, 71, 72, 73, 74], offsets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.values.length; },
    /** Independent: address = base + k * sizeof(type) when in range; 'UB' when k is outside [0, N). */
    reference: function (d) {
      var sz = SIZEOF[d.type];
      return d.offsets.map(function (k) {
        if (k >= 0 && k < d.values.length) return { address: d.base + k * sz, value: d.values[k] };
        return 'UB';
      });
    },
    random: function (level, r) {
      var types = ['char', 'short', 'int', 'double'];
      var type = types[D.randInt(r, 0, 3)];
      var n = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level];
      var values = [], i;
      for (i = 0; i < n; i++) values.push(D.randInt(r, -999, 999));
      var base = 1000 + D.randInt(r, 0, 2000) * 8;
      var offCount = D.randInt(r, 3, 7);
      var offsets = [], j;
      for (j = 0; j < offCount; j++) {
        if (level === 'extreme' && r() < 0.35) offsets.push(D.randInt(r, -5, n + 5));
        else offsets.push(D.randInt(r, 0, n - 1));
      }
      return { base: base, type: type, values: values, offsets: offsets };
    },
    input: {
      hint: T('Örnek: base=1000 type=int 10 20 30 40 50 60 70 80 90 100 offsets 0 1 2 4 9  (type=char/short/int/double)',
              'Example: base=1000 type=int 10 20 30 40 50 60 70 80 90 100 offsets 0 1 2 4 9  (type=char/short/int/double)'),
      parse: function (text) {
        var base = null, type = null, values = [], offsets = [], mode = 'values';
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m;
          if ((m = /^base[=:](\d+)$/i.exec(tok))) { base = parseInt(m[1], 10); return; }
          if ((m = /^type[=:](char|short|int|double)$/i.exec(tok))) { type = m[1].toLowerCase(); return; }
          if (/^offsets?[=:]?$/i.test(tok)) { mode = 'offsets'; return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, base=N, type=char/short/int/double ya da "offsets" yazın.', '"' + tok + '" is not understood: write a number, base=N, type=char/short/int/double, or "offsets".');
          var v = parseInt(tok, 10);
          if (mode === 'values') values.push(v); else offsets.push(v);
        });
        if (base === null) base = 1000;
        if (type === null) type = 'int';
        if (!values.length) throw T('En az bir değer yazın.', 'Write at least one value.');
        if (values.length > 30) throw T('En çok 30 değer.', 'At most 30 values.');
        if (!offsets.length) throw T('"offsets" yazıp en az bir k değeri belirtmelisiniz.', 'Write "offsets" followed by at least one k value.');
        if (offsets.length > 20) throw T('En çok 20 offset.', 'At most 20 offsets.');
        return { base: base, type: type, values: values, offsets: offsets };
      },
      format: function (d) { return 'base=' + d.base + ' type=' + d.type + ' ' + d.values.join(' ') + ' offsets ' + d.offsets.join(' '); },
      bad: ['', 'base=1000 type=int 5 8 13', 'base=1000 type=hex 5 8 13 offsets 0 1', 'base=1000 type=int 5 x 13 offsets 0', 'base=1000 type=int 5 8 13 offsets'],
      tokens: function (d) { return d.values.map(String); }
    },
    build: function (S, d) {
      var base = d.base, type = d.type, values = d.values, offsets = d.offsets, n = values.length, sz = SIZEOF[type];
      var W = 54, H = 44, GAP = 8, X0 = 44, Y0 = 110;
      values.forEach(function (v, i) {
        var col = i % ROW, row = Math.floor(i / ROW);
        var x = X0 + col * (W + GAP), y = Y0 + row * ROWH;
        S.box('a' + i, { x: x, y: y, w: W, h: H, text: String(v), below: String(base + i * sz), above: String(i), size: 15 });
      });
      S.label('arrlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: 'a =', anchor: 'end', size: 15, bold: true });
      S.pointer('p', { target: 'a0', text: 'p', side: 'top', dist: 22 });
      S.label('info', { x: 700, y: 40, text: 'type = ' + type + ', sizeof(' + type + ') = ' + sz, size: 15, bold: true, mono: true });
      S.label('calc', { x: 700, y: 68, text: '', size: 14, mono: true });
      S.step(T('`' + type + ' *p = a;` — dizi ilk elemanına bir işaretçiye (pointer) "düşer" (decay). Bu tür için `sizeof(' + type + ') = ' + sz + '` bayt.',
               '`' + type + ' *p = a;` — the array "decays" to a pointer to its first element. For this type, `sizeof(' + type + ') = ' + sz + '` bytes.'),
             { c: [1, 2], java: [1] });
      var results = [], first = true;
      offsets.forEach(function (k) {
        var inRange = k >= 0 && k < n;
        if (inRange) {
          var addr = base + k * sz;
          results.push({ address: addr, value: values[k] });
          S.at(k);
          S.set('a' + k, { style: 'new' });
          S.set('p', { target: 'a' + k });
          S.set('calc', { text: 'p + ' + k + ' = ' + base + ' + ' + k + '×' + sz + ' = ' + addr + ',  *(p+' + k + ') = ' + values[k] });
          if (first) {
            S.step(T('`p + ' + k + '` p\'yi DEĞİŞTİRMEZ; yeni bir adres HESAPLAR: ' + base + ' + ' + k + '×' + sz + ' = ' + addr + '. `*(p + ' + k + ')` bu adresi dereferanslar: ' + values[k] + '.',
                     '`p + ' + k + '` does NOT change p; it COMPUTES a new address: ' + base + ' + ' + k + '×' + sz + ' = ' + addr + '. `*(p + ' + k + ')` dereferences that address: ' + values[k] + '.'),
                   { c: [7, 8], java: [7] });
            first = false;
          } else {
            S.step(T('`p + ' + k + '` = ' + addr + ', `*(p + ' + k + ')` = ' + values[k] + '.',
                     '`p + ' + k + '` = ' + addr + ', `*(p + ' + k + ')` = ' + values[k] + '.'), { c: [7, 8], java: [7] });
          }
          S.set('a' + k, { style: 'normal' });
        } else {
          results.push('UB');
          S.at(null);
          S.set('calc', { text: 'p + ' + k + ' → dizinin dışında (out of range)' });
          S.step(T('`p + ' + k + '` — `k = ' + k + '`, `0 ≤ k < ' + n + '` koşulunu sağlamıyor: dizinin DIŞINA çıkıyor. `*(p + ' + k + ')` okumak **tanımsız davranış (UB)**: standart hiçbir garanti vermez, çökebilir ya da çöp bir değer dönebilir.',
                   '`p + ' + k + '` — `k = ' + k + '` does not satisfy `0 ≤ k < ' + n + '`: it steps OUTSIDE the array. Reading `*(p + ' + k + ')` is **undefined behavior (UB)**: it might crash or return garbage.'),
                 { c: [4, 5], java: [4, 5] });
        }
      });
      S.remove('p');
      S.at(null);
      S.result = results;
      S.step(T('Özet: `p + k`, `k` bayt değil, her zaman `k × sizeof(' + type + ')` = `k×' + sz + '` bayt ileri gider. Aralık dışı `k` **tanımsız davranış**\'tır. Java\'da işaretçi aritmetiği yok — yalnızca `a[k]`, ve aralık dışı `k` net bir istisna (exception) fırlatır.',
               'Summary: `p + k` always moves `k × sizeof(' + type + ')` = `k×' + sz + '` bytes forward, never `k` bytes. An out-of-range `k` is **undefined behavior (UB)**. Java has no pointer arithmetic — only `a[k]`, and an out-of-range `k` throws a clear exception.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
