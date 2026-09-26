/* Week 3 — converting infix to postfix with an operator stack (shunting-yard), >= 10 characters, with parentheses. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'void to_postfix(const char *in, char *out) {',
    '    char ops[100]; int top = -1, k = 0;',
    '    for (int i = 0; in[i]; i++) {',
    '        char c = in[i];',
    '        if (isalnum(c)) {',
    '            out[k++] = c;                  /* operand -> output */',
    "        } else if (c == '(') {",
    '            ops[++top] = c;                /* opener: push */',
    "        } else if (c == ')') {",
    "            while (ops[top] != '(')",
    '                out[k++] = ops[top--];     /* flush to the matching ( */',
    '            top--;                          /* discard the ( itself */',
    '        } else {',
    "            while (top >= 0 && ops[top] != '(' && prec(ops[top]) >= prec(c))",
    '                out[k++] = ops[top--];     /* pop same-or-stronger ops */',
    '            ops[++top] = c;                /* push operator */',
    '        }',
    '    }',
    "    while (top >= 0) out[k++] = ops[top--]; /* flush what's left */",
    "    out[k] = '\\0';",
    '}'
  ];
  var JAVA = [
    'String toPostfix(String in) {',
    '    char[] ops = new char[100]; int top = -1; StringBuilder out = new StringBuilder();',
    '    for (int i = 0; i < in.length(); i++) {',
    '        char c = in.charAt(i);',
    '        if (Character.isLetterOrDigit(c)) {',
    '            out.append(c);                 // operand -> output',
    "        } else if (c == '(') {",
    '            ops[++top] = c;                // opener: push',
    "        } else if (c == ')') {",
    "            while (ops[top] != '(')",
    '                out.append(ops[top--]);    // flush to the matching (',
    '            top--;                          // discard the ( itself',
    '        } else {',
    "            while (top >= 0 && ops[top] != '(' && prec(ops[top]) >= prec(c))",
    '                out.append(ops[top--]);    // pop same-or-stronger ops',
    '            ops[++top] = c;                // push operator',
    '        }',
    '    }',
    '    while (top >= 0) out.append(ops[top--]); // flush what\'s left',
    '    return out.toString();',
    '}'
  ];
  var PREC = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
  var RIGHT = { '^': true };
  function isOperand(c) { return /[A-Za-z0-9]/.test(c); }

  /** Independent shunting-yard implementation (checked against S.result by test.js). */
  function convert(text) {
    var out = [], st = [];
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (isOperand(c)) { out.push(c); continue; }
      if (c === '(') { st.push(c); continue; }
      if (c === ')') {
        var found = false;
        while (st.length) { var top = st.pop(); if (top === '(') { found = true; break; } out.push(top); }
        if (!found) return { error: { kind: 'unbalanced', at: i } };
        continue;
      }
      while (st.length && st[st.length - 1] !== '(' &&
             (PREC[st[st.length - 1]] > PREC[c] || (PREC[st[st.length - 1]] === PREC[c] && !RIGHT[c]))) out.push(st.pop());
      st.push(c);
    }
    while (st.length) {
      var top2 = st.pop();
      if (top2 === '(') return { error: { kind: 'unbalanced', at: text.length } };
      out.push(top2);
    }
    return { postfix: out.join(' ') };
  }

  D.define({
    id: 'infix-to-postfix',
    title: T("Infix ifadeyi postfix'e çevirme", 'Converting infix to postfix'),
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
      { id: 'right-assoc-power', level: 'edge', name: T('Sağdan birleşen `^` zinciri ve karışık işleçler', 'A right-associative `^` chain mixed with other operators'),
        data: { text: 'A^B^C^D+E-F*G/H' } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of characters (each one is a token) — every example must have at least 10. */
    size: function (d) { return d.text.length; },
    reference: function (d) { return convert(d.text); },
    random: function (level, r) {
      var n = { easy: 10, normal: 13, hard: 16, extreme: 20 }[level];
      var operand = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
      var opchars = ['+', '-', '*', '/', '^', '(', ')'];
      var chars = [];
      for (var i = 0; i < n; i++) chars.push(r() < 0.5 ? operand[D.randInt(r, 0, operand.length - 1)] : opchars[D.randInt(r, 0, opchars.length - 1)]);
      return { text: chars.join('') };
    },
    input: {
      hint: T('En az 10 karakter yazın: harf/rakam (işlenen), + - * / ^ ( )   (boşluksuz)',
              'Type at least 10 characters: a letter/digit (operand), + - * / ^ ( )   (no spaces)'),
      parse: function (text) {
        var s = String(text);
        if (!/^[A-Za-z0-9+\-*/^()]+$/.test(s)) throw T('Yalnız harf, rakam ve + - * / ^ ( ) kullanın, boşluksuz.', 'Use only letters, digits and + - * / ^ ( ), with no spaces.');
        if (s.length < 10) throw T('En az 10 karakter yazın.', 'Type at least 10 characters.');
        if (s.length > 60) throw T('En çok 60 karakter.', 'At most 60 characters.');
        return { text: s };
      },
      format: function (d) { return d.text; },
      bad: ['', 'A+B$C-D+E', 'A B C D E', 'ABC'],
      tokens: function (d) { return d.text.split(''); }
    },
    build: function (S, d) {
      var text = d.text, n = text.length, X0 = 60, DX = 44, ROWCAP = 20, Y0 = 60;
      var RX = X0 + n * DX + 140;
      for (var i = 0; i < n; i++) S.box('t' + i, { x: X0 + i * DX, y: Y0, w: 36, h: 40, text: text[i], style: 'normal', above: String(i), size: 18 });
      S.label('gl', { x: X0 - 12, y: Y0 + 26, text: T('girdi =', 'input ='), style: 'dim', size: 14, anchor: 'end' });
      S.region('yf', { x: X0 + n * DX + 20, y: Y0 - 10, w: 100, h: 220, title: T('işleç yığını', 'operator stack') });
      S.label('decision', { x: RX, y: Y0 + 30, text: '', size: 18, bold: true, mono: true, anchor: 'start' });
      S.label('cikl', { x: X0 - 12, y: Y0 + 230 + 24, text: T('çıktı =', 'output ='), style: 'dim', size: 15, anchor: 'end' });
      function decide(text2, style) { S.set('decision', { text: text2 || '', style: style || 'normal' }); }
      S.step(T('`' + text + '` (' + n + ' karakter) infix (araek) yazımdır. Hedef: işleç yığınıyla postfix\'e çevirmek (Dijkstra\'nın "tren makası" algoritması).',
               '`' + text + '` (' + n + ' characters) is infix notation. Goal: convert it to postfix with an operator stack (Dijkstra\'s "shunting-yard" algorithm).'),
             { c: [1, 2], java: [1, 2] });

      var st = [], out = [], result = null, stCounter = 0;
      function highlight(idx) {
        for (var k = 0; k < n; k++) S.set('t' + k, { style: k < idx ? 'dim' : (k === idx ? 'hl' : 'normal') });
      }
      function push(c) {
        var sid = 's' + (stCounter++);
        S.box(sid, { x: X0 + n * DX + 30, y: Y0 + 170 - st.length * 42, w: 80, h: 38, text: c, style: 'new', size: 18 });
        st.push({ ch: c, id: sid });
        return sid;
      }
      function emit(c) {
        var oid = 'o' + out.length;
        S.box(oid, { x: X0 + out.length * DX, y: Y0 + 230, w: 36, h: 38, text: c, style: 'new', size: 18 });
        out.push(oid);
      }

      for (var i2 = 0; i2 < n; i2++) {
        var c = text[i2];
        highlight(i2); decide('', 'normal'); S.at(i2);
        if (isOperand(c)) {
          emit(c);
          decide('output', 'new');
          S.step(T('`' + c + '` bir işlenen: doğrudan çıktıya yazılır.', '`' + c + '` is an operand: it goes straight to the output.'), { c: [5, 6], java: [5, 6] });
          S.set(out[out.length - 1], { style: 'normal' });
          continue;
        }
        if (c === '(') {
          push(c);
          decide('push', 'active');
          S.step(T('`(` işleç yığınına itilir: burada yeni bir grup başlıyor.', '`(` is pushed onto the operator stack: a new group starts here.'), { c: [7, 8], java: [7, 8] });
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
                     '`)` arrives: operators are flushed to the output until the matching `(` is found → `' + top.ch + '`.'), { c: [9, 10, 11], java: [9, 10, 11] });
            S.remove(top.id);
            emit(top.ch);
          }
          if (!found) {
            S.set('t' + i2, { style: 'del' });
            result = { error: { kind: 'unbalanced', at: i2 } };
            decide('unbalanced!', 'del');
            S.step(T('`)` geldi ama yığında eşleşecek `(` yok → **dengesiz parantez**. Dönüştürme durur.',
                     '`)` arrives but there is no matching `(` on the stack → **unbalanced parentheses**. Conversion stops.'), { c: [9, 10, 11], java: [9, 10, 11] });
            break;
          }
          decide('( discarded )', 'dim');
          S.step(T('`(` de yığından atılır (çıktıya yazılmaz); grup kapandı.', 'The `(` itself is discarded too (not written to the output); the group is closed.'), { c: 12, java: 12 });
          continue;
        }
        while (st.length && st[st.length - 1].ch !== '(' &&
               (PREC[st[st.length - 1].ch] > PREC[c] || (PREC[st[st.length - 1].ch] === PREC[c] && !RIGHT[c]))) {
          var top2 = st.pop();
          S.set(top2.id, { style: 'hl' });
          decide('flush', 'hl');
          S.step(T('`' + c + '` geldi. Tepedeki `' + top2.ch + '` önceliği düşürmüyor (' + (RIGHT[c] ? 'sağdan birleşen `' + c + '` eşiti bile beklemez' : 'eşit ya da daha güçlü') + ') → çıktıya aktar.',
                   '`' + c + '` arrives. `' + top2.ch + '` on top does not give way (' + (RIGHT[c] ? 'right-associative `' + c + '` does not even wait for a tie' : 'equal or stronger') + ') → move it to the output.'),
                 { c: [13, 14], java: [13, 14] });
          S.remove(top2.id);
          emit(top2.ch);
        }
        push(c);
        decide('push', 'active');
        S.step(T('`' + c + '` işleç yığınına itilir' + (st.length > 1 ? ': tepedeki işleç artık ondan zayıf ya da o daha yeni.' : '.'),
                 '`' + c + '` is pushed onto the operator stack' + (st.length > 1 ? ': the operator now on top is weaker, or it just arrived.' : '.')), { c: 15, java: 15 });
        S.set(st[st.length - 1].id, { style: 'normal' });
      }
      if (!result) {
        for (var k2 = 0; k2 < n; k2++) S.set('t' + k2, { style: 'dim' });
        var bad = false;
        while (st.length) {
          var top3 = st.pop();
          if (top3.ch === '(') { bad = true; S.set(top3.id, { style: 'del' }); result = { error: { kind: 'unbalanced', at: n } }; break; }
          S.remove(top3.id);
          emit(top3.ch);
        }
        if (bad) {
          decide('unbalanced!', 'del');
          S.step(T('Girdi bitti ama yığında hâlâ `(` var → **dengesiz parantez**.', 'The input is over but a `(` is still on the stack → **unbalanced parentheses**.'), { c: 18, java: 18 });
        } else {
          for (var k3 = 0; k3 < out.length; k3++) S.set(out[k3], { style: 'new' });
          result = { postfix: out.map(function (id) { return S.get(id).text; }).join(' ') };
          decide('done', 'new');
          S.step(T('Girdi bitti: yığında kalan işleçler sırayla çıktıya boşaltılır. Sonuç: `' + result.postfix + '`. Her karakter bir kez itilir, bir kez çekilir: O(n).',
                   'The input is over: the operators left on the stack are flushed to the output in order. Result: `' + result.postfix + '`. Each character is pushed and popped once: O(n).'), { c: 18, java: 18 });
        }
      }
      S.result = result;
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
