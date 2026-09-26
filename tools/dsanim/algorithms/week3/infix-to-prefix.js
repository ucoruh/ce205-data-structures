/* Week 3 — converting infix to prefix: reverse the input (swapping parentheses), run shunting-yard with the strict
   precedence rule, then reverse the result. >= 10 characters, with parentheses. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'void to_prefix(const char *in, char *out) {',
    '    char rev[100];',
    '    reverse_and_swap_parens(in, rev);       /* 1) reverse, ( <-> ) */',
    '    char ops[100]; int top = -1, k = 0; char tmp[100];',
    '    for (int i = 0; rev[i]; i++) {          /* 2) shunting-yard, strict rule */',
    '        char c = rev[i];',
    '        if (isalnum(c)) { tmp[k++] = c; continue; }',
    "        if (c == '(') { ops[++top] = c; continue; }",
    "        if (c == ')') {",
    "            while (ops[top] != '(') tmp[k++] = ops[top--];",
    '            top--; continue;',
    '        }',
    '        while (top >= 0 && ops[top] != \'(\' && prec(ops[top]) > prec(c))',
    '            tmp[k++] = ops[top--];           /* strictly stronger only */',
    '        ops[++top] = c;',
    '    }',
    '    while (top >= 0) tmp[k++] = ops[top--];',
    '    reverse(tmp, k, out);                    /* 3) reverse again */',
    '}'
  ];
  var JAVA = [
    'String toPrefix(String in) {',
    '    String rev = reverseAndSwapParens(in);      // 1) reverse, ( <-> )',
    '    char[] ops = new char[100]; int top = -1; StringBuilder tmp = new StringBuilder();',
    '    for (int i = 0; i < rev.length(); i++) {     // 2) shunting-yard, strict rule',
    '        char c = rev.charAt(i);',
    '        if (Character.isLetterOrDigit(c)) { tmp.append(c); continue; }',
    "        if (c == '(') { ops[++top] = c; continue; }",
    "        if (c == ')') {",
    "            while (ops[top] != '(') tmp.append(ops[top--]);",
    '            top--; continue;',
    '        }',
    '        while (top >= 0 && ops[top] != \'(\' && prec(ops[top]) > prec(c))',
    '            tmp.append(ops[top--]);              // strictly stronger only',
    '        ops[++top] = c;',
    '    }',
    '    while (top >= 0) tmp.append(ops[top--]);',
    '    return tmp.reverse().toString();             // 3) reverse again',
    '}'
  ];
  var PREC = { '+': 1, '-': 1, '*': 2, '/': 2 };
  function isOperand(c) { return /[A-Za-z0-9]/.test(c); }
  function swapParens(c) { return c === '(' ? ')' : (c === ')' ? '(' : c); }

  /** Independent implementation of the reverse / shunting-yard / reverse method (checked by test.js). */
  function convert(text) {
    var rev = '';
    for (var i = text.length - 1; i >= 0; i--) rev += swapParens(text[i]);
    var out = [], st = [];
    for (i = 0; i < rev.length; i++) {
      var c = rev[i];
      if (isOperand(c)) { out.push(c); continue; }
      if (c === '(') { st.push(c); continue; }
      if (c === ')') {
        var found = false;
        while (st.length) { var top = st.pop(); if (top === '(') { found = true; break; } out.push(top); }
        if (!found) return { error: { kind: 'unbalanced', at: i } };
        continue;
      }
      while (st.length && st[st.length - 1] !== '(' && PREC[st[st.length - 1]] > PREC[c]) out.push(st.pop());
      st.push(c);
    }
    while (st.length) {
      var top2 = st.pop();
      if (top2 === '(') return { error: { kind: 'unbalanced', at: rev.length } };
      out.push(top2);
    }
    return { prefix: out.reverse().join(' ') };
  }

  D.define({
    id: 'infix-to-prefix',
    title: T("Infix ifadeyi prefix'e çevirme", 'Converting infix to prefix'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'basic', level: 'normal', name: T('11 karakter, tek işlenenli çarpma-toplama karışımı', '11 characters, a mix of single-letter operands'),
        data: { text: 'A+B*C-D+E*F' } },
      { id: 'parens-mixed', level: 'hard', name: T('Parantezli, karışık öncelikli 16 karakter', 'Parenthesized, mixed-precedence, 16 characters'),
        data: { text: '(A+B)*(C-D)/E+F*G' } },
      { id: 'unbalanced-missing-close', level: 'edge', name: T('Dengesiz: kapanan parantez eksik', 'Unbalanced: a closing parenthesis is missing'),
        data: { text: '(A+B*(C-D)+E' } },
      { id: 'unbalanced-extra-close', level: 'edge', name: T('Dengesiz: fazladan kapanan parantez', 'Unbalanced: an extra closing parenthesis'),
        data: { text: 'A+B)*C-D+E' } },
      { id: 'only-operands', level: 'edge', name: T('Hiç işleç yok, yalnız işlenenler', 'No operators at all, only operands'),
        data: { text: 'ABCDEFGHIJ' } },
      { id: 'same-precedence-chain', level: 'edge', name: T('Uzun, hep aynı öncelikli işleç zinciri', 'A long chain of same-precedence operators'),
        data: { text: 'A+B+C+D+E+F+G+H+I+J' } },
      { id: 'nested-parens', level: 'edge', name: T('Dört kat iç içe parantez', 'Parentheses nested four levels deep'),
        data: { text: '((((A+B))))*C-D' } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of characters (each one is a token) — every example must have at least 10. */
    size: function (d) { return d.text.length; },
    reference: function (d) { return convert(d.text); },
    random: function (level, r) {
      var n = { easy: 10, normal: 13, hard: 16, extreme: 20 }[level];
      var operand = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
      var opchars = ['+', '-', '*', '/', '(', ')'];
      var chars = [];
      for (var i = 0; i < n; i++) chars.push(r() < 0.5 ? operand[D.randInt(r, 0, operand.length - 1)] : opchars[D.randInt(r, 0, opchars.length - 1)]);
      return { text: chars.join('') };
    },
    input: {
      hint: T('En az 10 karakter yazın: harf/rakam (işlenen), + - * / ( )   (boşluksuz)',
              'Type at least 10 characters: a letter/digit (operand), + - * / ( )   (no spaces)'),
      parse: function (text) {
        var s = String(text);
        if (!/^[A-Za-z0-9+\-*/()]+$/.test(s)) throw T('Yalnız harf, rakam ve + - * / ( ) kullanın, boşluksuz.', 'Use only letters, digits and + - * / ( ), with no spaces.');
        if (s.length < 10) throw T('En az 10 karakter yazın.', 'Type at least 10 characters.');
        if (s.length > 60) throw T('En çok 60 karakter.', 'At most 60 characters.');
        return { text: s };
      },
      format: function (d) { return d.text; },
      bad: ['', 'A+B$C-D+E', 'A B C D E', 'ABC'],
      tokens: function (d) { return d.text.split(''); }
    },
    build: function (S, d) {
      var text = d.text, n = text.length, X0 = 60, DX = 42, Y0 = 50;
      var RX = X0 + n * DX + 140;
      for (var i = 0; i < n; i++) S.box('g' + i, { x: X0 + i * DX, y: Y0, w: 34, h: 38, text: text[i], style: 'normal', above: String(i), size: 17 });
      S.label('gl', { x: X0 - 12, y: Y0 + 24, text: T('girdi =', 'input ='), style: 'dim', size: 14, anchor: 'end' });
      S.step(T('`' + text + '` (' + n + ' karakter) infix yazımdır. Hile: girdiyi ters çevirip parantezleri de takas ederiz, bildiğimiz yöntemi (tren makası) sıkı öncelik kuralıyla uygularız, sonra sonucu yine ters çeviririz.',
               '`' + text + '` (' + n + ' characters) is infix notation. The trick: reverse the input and swap its parentheses too, apply the method we know (shunting-yard) with a strict precedence rule, then reverse the result.'),
             { c: [1, 2, 3], java: [1] });

      var rev = '';
      for (var ri = text.length - 1; ri >= 0; ri--) rev += swapParens(text[ri]);
      var Y1 = Y0 + 90;
      for (i = 0; i < n; i++) S.box('t' + i, { x: X0 + i * DX, y: Y1, w: 34, h: 38, text: rev[i], style: 'dim', above: String(i), size: 17 });
      S.label('tl', { x: X0 - 12, y: Y1 + 24, text: T('ters =', 'reversed ='), style: 'dim', size: 14, anchor: 'end' });
      S.step(T('1) Girdi ters çevrildi ve `(`/`)` takas edildi: `' + rev + '`. Şimdi bunu soldan sağa işleyeceğiz.',
               '1) The input is reversed and `(`/`)` are swapped: `' + rev + '`. Now we process it left to right.'), { c: 3, java: 2 });

      var Y2 = Y1 + 90;
      S.region('yf', { x: X0 + n * DX + 20, y: Y2 - 60, w: 100, h: 220, title: T('işleç yığını', 'operator stack') });
      S.label('decision', { x: RX, y: Y1 + 24, text: '', size: 18, bold: true, mono: true, anchor: 'start' });
      S.label('cl', { x: X0 - 12, y: Y2 + 174, text: T('çıktı =', 'output ='), style: 'dim', size: 15, anchor: 'end' });
      function decide(text2, style) { S.set('decision', { text: text2 || '', style: style || 'normal' }); }

      var st = [], out = [], result = null, stCounter = 0;
      function highlight(idx) {
        for (var k = 0; k < n; k++) {
          var style = k < idx ? 'dim' : (k === idx ? 'hl' : 'normal');
          S.set('t' + k, { style: style });
          S.set('g' + (n - 1 - k), { style: style });
        }
      }
      function push(c) {
        var sid = 's' + (stCounter++);
        S.box(sid, { x: X0 + n * DX + 30, y: Y2 + 90 - st.length * 42, w: 80, h: 38, text: c, style: 'new', size: 18 });
        st.push({ ch: c, id: sid });
      }
      function emit(c) {
        var oid = 'o' + out.length;
        S.box(oid, { x: X0 + out.length * DX, y: Y2 + 170, w: 34, h: 38, text: c, style: 'new', size: 17 });
        out.push(oid);
      }

      for (var i2 = 0; i2 < n; i2++) {
        var c = rev[i2];
        highlight(i2); decide('', 'normal'); S.at(n - 1 - i2);
        if (isOperand(c)) {
          emit(c);
          decide('output', 'new');
          S.step(T('`' + c + '` bir işlenen: çıktıya.', '`' + c + '` is an operand: to the output.'), { c: 7, java: 6 });
          S.set(out[out.length - 1], { style: 'normal' });
          continue;
        }
        if (c === '(') {
          push(c);
          decide('push', 'active');
          S.step(T('`(` (asıl girdide `)` idi) yığına itilir: yeni bir grup başlıyor.', '`(` (a `)` in the original input) is pushed: a new group starts here.'), { c: 8, java: 7 });
          S.set(st[st.length - 1].id, { style: 'normal' });
          continue;
        }
        if (c === ')') {
          var found = false;
          while (st.length) {
            var top = st.pop();
            if (top.ch === '(') { found = true; S.remove(top.id); break; }
            S.set(top.id, { style: 'hl' });
            decide('flush', 'hl');
            S.step(T('`)` geldi: eşleşen `(` bulunana dek yığındaki işleçler çıktıya aktarılır → `' + top.ch + '`.',
                     '`)` arrives: operators are flushed to the output until the matching `(` is found → `' + top.ch + '`.'), { c: [9, 10], java: [8, 9] });
            S.remove(top.id);
            emit(top.ch);
          }
          if (!found) {
            S.set('t' + i2, { style: 'del' });
            result = { error: { kind: 'unbalanced', at: i2 } };
            decide('unbalanced!', 'del');
            S.step(T('`)` geldi ama yığında eşleşecek `(` yok → **dengesiz parantez**. Dönüştürme durur.',
                     '`)` arrives but there is no matching `(` on the stack → **unbalanced parentheses**. Conversion stops.'), { c: [9, 10], java: [8, 9] });
            break;
          }
          decide('( discarded )', 'dim');
          S.step(T('`(` de yığından atılır; grup kapandı.', 'The `(` itself is discarded too; the group is closed.'), { c: 11, java: 10 });
          continue;
        }
        while (st.length && st[st.length - 1].ch !== '(' && PREC[st[st.length - 1].ch] > PREC[c]) {
          var top2 = st.pop();
          S.set(top2.id, { style: 'hl' });
          decide('flush', 'hl');
          S.step(T('`' + c + '` geldi; tepedeki `' + top2.ch + '` ondan **kesinlikle daha güçlü** → çıktıya. (Ters çevrilmiş girdide eşit öncelikli işleç çekilmez; işlenen sırası böyle korunur.)',
                   '`' + c + '` arrives; `' + top2.ch + '` on top is **strictly stronger** → to the output. (On the reversed input an operator of equal precedence is not popped, which keeps the operand order right.)'),
                 { c: [13, 14], java: [12, 13] });
          S.remove(top2.id);
          emit(top2.ch);
        }
        push(c);
        decide('push', 'active');
        S.step(T('`' + c + '` işleç yığınına itilir.', '`' + c + '` is pushed onto the operator stack.'), { c: 15, java: 14 });
        S.set(st[st.length - 1].id, { style: 'normal' });
      }
      if (!result) {
        for (var k2 = 0; k2 < n; k2++) S.set('t' + k2, { style: 'dim' });
        var bad = false;
        while (st.length) {
          var top3 = st.pop();
          if (top3.ch === '(') { bad = true; S.set(top3.id, { style: 'del' }); result = { error: { kind: 'unbalanced', at: rev.length } }; break; }
          S.remove(top3.id);
          emit(top3.ch);
        }
        if (bad) {
          decide('unbalanced!', 'del');
          S.step(T('Girdi bitti ama yığında hâlâ `(` var → **dengesiz parantez**.', 'The input is over but a `(` is still on the stack → **unbalanced parentheses**.'), { c: 16, java: 15 });
        } else {
          decide('flushed', 'dim');
          S.step(T('2) Girdi bitti; kalan işleçler boşaltıldı. Ara sonuç (henüz ters): `' + out.map(function (id) { return S.get(id).text; }).join(' ') + '`.',
                   '2) The input is over; the remaining operators are flushed. Intermediate result (still reversed): `' + out.map(function (id) { return S.get(id).text; }).join(' ') + '`.'), { c: 16, java: 15 });
          var chars = out.map(function (id) { return S.get(id).text; }).reverse();
          for (var k3 = 0; k3 < out.length; k3++) S.set(out[k3], { text: chars[k3], style: 'new' });
          result = { prefix: chars.join(' ') };
          decide('done', 'new');
          S.step(T('3) Ara sonucu ters çevir: `' + result.prefix + '` — işte prefix. Her karakter bir kez itilir, bir kez çekilir: O(n).',
                   '3) Reverse the intermediate result: `' + result.prefix + '` — that is the prefix form. Each character is pushed and popped once: O(n).'), { c: 17, java: 16 });
        }
      }
      S.result = result;
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
