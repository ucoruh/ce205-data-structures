/* Week 12 -- Strings: Structures and Algorithms
 * A C string is just a char array PLUS a convention: the byte '\0' (NUL) marks "the string ends here".
 * strlen() does not know a length up front -- it walks the array until it meets that '\0'. The classic C bug
 * this section warns about is a naive character-by-character copy with NO bound check: if the source is
 * longer than the destination buffer, the loop keeps writing past the array's last valid index. That single
 * extra write is undefined behavior (UB) -- it may corrupt an unrelated variable, a return address, anything.
 * We NEVER animate that write: once the copy would go out of bounds, we flag it and stop. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'char buf[CAP];',
    '',
    'int i = 0;',
    'while (src[i] != \'\\0\') {',
    '    if (i == CAP) break;        /* would need buf[CAP]: out of bounds -- stop, never write it */',
    '    buf[i] = src[i];',
    '    i++;',
    '}',
    'int overflow = (src[i] != \'\\0\');    /* loop stopped early because of the guard, not \'\\0\' */',
    'if (!overflow) buf[i] = \'\\0\';         /* room guaranteed: i < CAP here */',
    '',
    'size_t len = 0;',
    'if (!overflow)',
    '    while (buf[len] != \'\\0\') len++;   /* strlen: walk until the terminator */'
  ];
  var JAVA = [
    'char[] buf = new char[CAP];',
    '',
    'int i = 0;',
    'while (i < src.length()) {',
    '    if (i == CAP) break;        // would need buf[CAP]: out of bounds -- stop, never write it',
    '    buf[i] = src.charAt(i);',
    '    i++;',
    '}',
    'boolean overflow = (i < src.length());   // loop stopped early because of the guard',
    '// (no terminator byte needed in Java)',
    '',
    'int len = 0;',
    'if (!overflow)',
    '    while (len < buf.length && buf[len] != 0) len++;'
  ];

  function letters(text) { return text.split(''); }

  D.define({
    id: 'c-string-memory',
    title: T('C dizgisi belleği: dizi, \\0 ve strlen', 'C string memory: the array, \\0 and strlen'),
    code: function (d) {
      var cap = d && d.cap || 16;
      return {
        c: ['char buf[' + cap + '];'].concat(C.slice(1)),
        java: ['char[] buf = new char[' + cap + '];'].concat(JAVA.slice(1))
      };
    },
    presets: [
      { id: 'normal', level: 'normal', name: T('cap=16, "HELLOWORLD" (10 harf), rahat sığar', 'cap=16, "HELLOWORLD" (10 letters), fits comfortably'),
        data: { cap: 16, text: 'HELLOWORLD' } },
      { id: 'hard', level: 'hard', name: T('cap=12, "ALGORITHMS" (10 harf), 1 baytlık boşluk', 'cap=12, "ALGORITHMS" (10 letters), 1 byte of slack'),
        data: { cap: 12, text: 'ALGORITHMS' } },
      { id: 'exact-fit', level: 'edge', name: T('cap=11: tam sığar, boşluk = 0 bayt', 'cap=11: exact fit, 0 bytes of slack'),
        data: { cap: 11, text: 'ALGORITHMS' } },
      { id: 'overflow', level: 'edge', name: T('cap=8, "STRUCTURES" (10 harf): taşma -- bayrakla işaretlenir, ÇALIŞTIRILMAZ', 'cap=8, "STRUCTURES" (10 letters): overflow -- flagged, NEVER executed'),
        data: { cap: 8, text: 'STRUCTURES' } },
      { id: 'repeated', level: 'edge', name: T('cap=16, tekrarlı karakter "AAAAAAAAAA"', 'cap=16, repeated character "AAAAAAAAAA"'),
        data: { cap: 16, text: 'AAAAAAAAAA' } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of input values = number of characters in the text being stored. */
    size: function (d) { return d.text.length; },
    /** Independent computation: does NOT call build()'s loop; a single length comparison decides the outcome. */
    reference: function (d) {
      if (d.text.length >= d.cap) {
        return { written: d.text.slice(0, d.cap).split(''), terminated: false, len: null, overflow: true };
      }
      return { written: d.text.split(''), terminated: true, len: d.text.length, overflow: false };
    },
    random: function (level, r) {
      var n = D.randInt(r, 10, level === 'extreme' ? 18 : 15), text = '', i;
      for (i = 0; i < n; i++) text += String.fromCharCode(65 + D.randInt(r, 0, 25));
      var cap;
      if (level === 'easy') cap = n + D.randInt(r, 5, 10);
      else if (level === 'normal') cap = n + D.randInt(r, 2, 6);
      else if (level === 'hard') cap = n + 1; // exact fit, zero slack
      else cap = r() < 0.5 ? D.randInt(r, 4, n) : n + D.randInt(r, 1, 4); // extreme: 50% overflow
      return { cap: cap, text: text };
    },
    input: {
      hint: T('Örnek: cap=16 HELLOWORLD  (cap arabellek boyutu; ikinci sözcük yalnız A-Z0-9, boşluksuz)',
              'Example: cap=16 HELLOWORLD  (cap is the buffer size; the second word is A-Z0-9 only, no spaces)'),
      parse: function (text) {
        var cap = null, str = null;
        String(text).trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
          var m = /^cap[=:](\d+)$/i.exec(tok);
          if (m) { cap = parseInt(m[1], 10); return; }
          if (!/^[A-Za-z0-9]+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: yalnız harf ve rakam kullanın.', '"' + tok + '" is not understood: use only letters and digits.');
          str = tok.toUpperCase();
        });
        if (cap === null) throw T('cap=N yazmalısınız (arabellek boyutu).', 'You must write cap=N (the buffer size).');
        if (cap < 2 || cap > 40) throw T('cap 2 ile 40 arasında olmalı.', 'cap must be between 2 and 40.');
        if (!str) throw T('Bir metin yazmalısınız (yalnız harf/rakam).', 'You must write a text (letters/digits only).');
        if (str.length < 1 || str.length > 30) throw T('Metin 1 ile 30 karakter arasında olmalı.', 'The text must be between 1 and 30 characters.');
        return { cap: cap, text: str };
      },
      format: function (d) { return 'cap=' + d.cap + ' ' + d.text; },
      bad: ['', 'cap=0 HELLO', 'cap=99 HELLO', 'HELLO', 'cap=5 hello world!', 'cap=abc HELLO'],
      tokens: function (d) { return letters(d.text); }
    },
    build: function (S, d) {
      var CAP = d.cap, text = d.text, W = 46, H = 42, X0 = 90, Y0 = 130;
      var RX = X0 + CAP * W + 40;
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: 'buf[] =', anchor: 'end', size: 15, bold: true });
      for (var i = 0; i < CAP; i++) S.box('b' + i, { x: X0 + i * W, y: Y0, w: 38, h: H, text: '', style: 'empty', size: 15, above: String(i) });
      S.label('caplbl', { x: X0, y: 40, text: 'CAP = ' + CAP, size: 18, bold: true, mono: true });
      S.label('srclbl', { x: X0, y: 64, text: T('kaynak metin: "' + text + '" (' + text.length + ' harf)', 'source text: "' + text + '" (' + text.length + ' letters)'), style: 'dim', size: 14 });
      S.label('dec', { x: RX, y: Y0 + H / 2 - 8, text: '', size: 16, bold: true, mono: true, anchor: 'start' });
      S.label('dec2', { x: RX, y: Y0 + H / 2 + 16, text: '', size: 13, anchor: 'start' });

      S.step(T('`CAP = ' + CAP + '` baytlık bir `char` dizisi ayrılır. Bir C dizgisi (string) yalnız bu bayt dizisidir -- uzunluk ayrıca saklanmaz; ` + \'\\\\0\' + ` özel baytı "dizgi burada bitiyor" der.',
               'A `char` array of `CAP = ' + CAP + '` bytes is allocated. A C string is just this byte array -- no length is stored separately; the special byte `\'\\0\'` says "the string ends here".'),
             { c: 1, java: 1 });

      var overflow = text.length >= CAP;
      var limit = Math.min(text.length, CAP); // characters that CAN be legally written (indices 0..CAP-1)
      S.step(T('`i = 0` ile kopyalamaya başlıyoruz: `while (src[i] != \'\\0\')` -- kaynakta karakter kaldığı sürece devam eder.',
               '`i = 0`, and we start copying: `while (src[i] != \'\\0\')` -- it keeps going as long as the source has characters left.'),
             { c: 3, java: 3 });

      for (var k = 0; k < limit; k++) {
        S.at(k);
        S.set('b' + k, { style: 'hl' });
        S.set('dec', { text: 'i = ' + k, style: 'normal' });
        S.step(T('`src[' + k + '] = \'' + text[k] + '\'` -- `\\0` değil, döngü devam eder. `i == CAP` değil (' + k + ' != ' + CAP + '), yazma güvenli.', '`src[' + k + '] = \'' + text[k] + '\'` -- not `\\0`, the loop continues. `i == CAP` is false (' + k + ' != ' + CAP + '), the write is safe.'),
               { c: [{ n: 4, note: T('src[i] != \\0? evet', 'src[i] != \\0? yes') }, { n: 5, note: T('i == CAP? hayır', 'i == CAP? no') }] });
        S.set('b' + k, { text: text[k], style: 'new' });
        S.step(T('`buf[' + k + '] = \'' + text[k] + '\'` yazılır; `i` bir artar.', '`buf[' + k + '] = \'' + text[k] + '\'` is written; `i` goes up by one.'),
               { c: [6, 7] });
      }

      if (overflow) {
        S.at(limit - 1);
        S.set('b' + (CAP - 1), { style: 'del' });
        S.set('dec', { text: 'i == CAP', style: 'del' });
        S.set('dec2', { text: T('taşma bayraklandı! geçerli indisler 0..' + (CAP - 1), 'overflow flagged! valid indices are 0..' + (CAP - 1)), style: 'del' });
        S.step(T('`buf[0..' + (CAP - 1) + ']` (tüm ' + CAP + ' hücre) doldu, ama kaynakta hâlâ karakter var: `src[' + CAP + '] != \'\\0\'` -- döngü koşulu hâlâ **doğru**. Ama şimdi `i == CAP` (' + CAP + ' == ' + CAP + ') -- `buf[' + CAP + ']` dizide **yok** (geçerli aralık 0..' + (CAP - 1) + '). Bu **arabellek taşması (buffer overflow)** bayraklanır ve `break` ile durulur -- `buf[' + CAP + ']` satırı hiç ÇALIŞTIRILMAZ.',
                 '`buf[0..' + (CAP - 1) + ']` (all ' + CAP + ' cells) is now full, but the source still has characters left: `src[' + CAP + '] != \'\\0\'` -- the loop condition is still **true**. But now `i == CAP` (' + CAP + ' == ' + CAP + ') -- `buf[' + CAP + ']` does **not exist** in this array (the valid range is 0..' + (CAP - 1) + '). This **buffer overflow** is flagged and stopped with `break` -- the `buf[' + CAP + ']` write is never EXECUTED at all.'),
               { c: [{ n: 4, note: T('src[i] != \\0? evet', 'src[i] != \\0? yes') }, { n: 5, note: T('i == CAP? evet -- break!', 'i == CAP? yes -- break!') }, { n: 6, skip: true }, { n: 7, skip: true }] });
        S.set('dec', { text: 'overflow = 1', style: 'del' });
        S.step(T('`overflow = (src[i] != \'\\0\')` -- doğru: kopyalama tamamlanmadan durdu. Terminatör de yazılmaz (satır 10 atlanır).',
                 '`overflow = (src[i] != \'\\0\')` -- true: the copy stopped before finishing. The terminator is not written either (line 10 is skipped).'),
               { c: [9, { n: 10, skip: true }] });
        S.step(T('`strlen` denemesi de atlanır (`if (!overflow)`) -- güvenli olmayan verinin uzunluğunu asla hesaplamayız.',
                 'The `strlen` attempt is skipped too (`if (!overflow)`) -- we never compute the length of unsafe data.'),
               { c: [{ n: 13, note: T('overflow? evet -- atla', 'overflow? yes -- skip') }, { n: 14, skip: true }] });
        S.at(null);
        S.result = { written: text.slice(0, CAP).split(''), terminated: false, len: null, overflow: true };
        S.step(T('Bitti (bayraklı): ' + CAP + ' bayt güvenle yazıldı, sonlandırıcı **hiç yazılmadı**, ' + (text.length - CAP) + ' harf daha kopyalanamadan kaldı ve gerçek taşma **hiç çalıştırılmadı**. Ders: sınırı her zaman kontrol edin.',
                 'Done (flagged): ' + CAP + ' bytes were written safely, the terminator was **never written**, ' + (text.length - CAP) + ' more letters were left uncopied, and the real overflow was **never executed**. Lesson: always check the bound.'));
        return;
      }

      S.at(null);
      S.set('dec', { text: 'i == CAP? hayır', style: 'normal' });
      S.step(T('`src[' + limit + '] == \'\\0\'`: döngü koşulu yanlış olur, döngü biter -- bekçi (`i == CAP`) satırına hiç girilmedi bu turda.',
               '`src[' + limit + '] == \'\\0\'`: the loop condition becomes false, the loop ends -- the guard (`i == CAP`) was never even reached this time.'),
             { c: [{ n: 4, note: T('src[i] != \\0? hayır', 'src[i] != \\0? no') }] });
      S.set('b' + limit, { text: '\\0', style: 'dim' });
      S.set('dec', { text: 'overflow = 0', style: 'new' });
      S.set('dec2', { text: '', style: 'normal' });
      S.step(T('`overflow = 0` -- `buf[' + limit + '] = \'\\0\'` -- sonlandırıcı yazılır: dizginin burada bittiğini işaretler.',
               '`overflow = 0` -- `buf[' + limit + '] = \'\\0\'` -- the terminator is written: it marks where the string ends.'),
             { c: [9, 10] });

      var len = 0;
      S.step(T('`strlen`: `overflow` yanlış olduğundan devam ederiz. `len = 0` ile `buf[0]`\'den başlayıp `\\0`\'a kadar sayarız -- uzunluk hiçbir yerde saklı DEĞİLDİR, her seferinde yeniden sayılır.',
               '`strlen`: since `overflow` is false, we proceed. Starting from `len = 0` at `buf[0]`, we count up to `\\0` -- the length is NOT stored anywhere; it is recounted every time.'),
             { c: [12, { n: 13, note: T('overflow? hayır', 'overflow? no') }] });
      for (var j = 0; j < limit; j++) {
        S.set('b' + j, { style: 'active' });
        len++;
        S.step(T('`buf[' + j + '] = \'' + text[j] + '\'` -- `\\0` değil, `len = ' + len + '`.', '`buf[' + j + '] = \'' + text[j] + '\'` -- not `\\0`, `len = ' + len + '`.'),
               { c: [{ n: 14, note: T('buf[len] != \\0? evet', 'buf[len] != \\0? yes') }] });
        S.set('b' + j, { style: 'new' });
      }
      S.set('b' + limit, { style: 'active' });
      S.step(T('`buf[' + limit + '] == \'\\0\'`: döngü biter -- `strlen(buf) = ' + len + '`, tam olarak kopyaladığımız harf sayısı kadar.',
               '`buf[' + limit + '] == \'\\0\'`: the loop ends -- `strlen(buf) = ' + len + '`, exactly the number of letters we copied.'),
             { c: [{ n: 14, note: T('buf[len] != \\0? hayır', 'buf[len] != \\0? no') }] });
      S.result = { written: text.split(''), terminated: true, len: len, overflow: false };
      S.step(T('Bitti: ' + CAP + ' baytlık arabelleğe ' + text.length + ' harf + sonlandırıcı güvenle sığdı (' + (CAP - text.length - 1) + ' bayt boşta kaldı). `strlen` her çağrıldığında dizgiyi O(n) baştan tarar.',
               'Done: ' + text.length + ' letters + the terminator fit safely in the ' + CAP + '-byte buffer (' + (CAP - text.length - 1) + ' bytes left unused). `strlen` rescans the string in O(n) every time it is called.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
