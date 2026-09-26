/* Week 3 — evaluating a postfix (reverse Polish) expression with a stack, >= 10 tokens, with error handling. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int eval_postfix(char *tok[], int n, bool *error) {',
    '    int st[100]; int top = -1;',
    '    for (int i = 0; i < n; i++) {',
    '        char *t = tok[i];',
    '        if (is_number(t)) {',
    '            st[++top] = atoi(t);          /* number: push */',
    '        } else {',
    '            if (top < 1) { *error = true; return 0; }  /* too few operands */',
    '            int b = st[top--];             /* right operand */',
    '            int a = st[top--];             /* left operand */',
    "            if (t[0] == '/' && b == 0) { *error = true; return 0; }  /* division by zero */",
    '            st[++top] = apply(t[0], a, b);  /* integer division truncates toward zero */',
    '        }',
    '    }',
    '    if (top != 0) { *error = true; return 0; }  /* too many operands left */',
    '    return st[top];                       /* the answer */',
    '}'
  ];
  var JAVA = [
    'int evalPostfix(String[] tok, boolean[] error) {',
    '    int[] st = new int[100]; int top = -1;',
    '    for (int i = 0; i < tok.length; i++) {',
    '        String t = tok[i];',
    '        if (isNumber(t)) {',
    '            st[++top] = Integer.parseInt(t);   // number: push',
    '        } else {',
    '            if (top < 1) { error[0] = true; return 0; }  // too few operands',
    '            int b = st[top--];             // right operand',
    '            int a = st[top--];             // left operand',
    '            if (t.equals("/") && b == 0) { error[0] = true; return 0; }  // division by zero',
    '            st[++top] = apply(t.charAt(0), a, b);  // integer division truncates toward zero',
    '        }',
    '    }',
    '    if (top != 0) { error[0] = true; return 0; }  // too many operands left',
    '    return st[top];                       // the answer',
    '}'
  ];
  var OPS = ['+', '-', '*', '/'];
  var SIGN = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  function isOp(t) { return OPS.indexOf(t) !== -1; }
  function apply(t, a, b) { return t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : Math.trunc(a / b); }

  D.define({
    id: 'postfix-evaluation',
    title: T('Postfix ifade değerlendirme', 'Evaluating a postfix expression'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'basic-chain', level: 'normal', name: T('11 belirteç, hatasız', '11 tokens, no errors'),
        data: { tokens: [5, 3, '+', 8, 2, '-', '*', 6, '+', 12, '-'] } },
      { id: 'long-chain', level: 'hard', name: T('15 belirteç, dört işleç türü', '15 tokens, all four operators'),
        data: { tokens: [12, 3, '/', 4, '*', 5, '+', 20, '-', 2, '*', 7, '+', 3, '*'] } },
      { id: 'division-by-zero', level: 'edge', name: T('Sıfıra bölme', 'Division by zero'),
        data: { tokens: [9, 3, '-', 6, '*', 0, '/', 5, '+', 8, '-', 2, '*'] } },
      { id: 'too-few-operands', level: 'edge', name: T('Çok az işlenen: işleç en başta', 'Too few operands: an operator comes first'),
        data: { tokens: ['+', 5, 3, 8, 2, '*', 9, '+', 6, '-', 7] } },
      { id: 'too-many-operands', level: 'edge', name: T('Çok fazla işlenen: sonda 6 değer kalıyor', 'Too many operands: 6 values are left at the end'),
        data: { tokens: [5, 3, 8, '+', 2, 7, '-', 9, 4, 6] } },
      { id: 'negative-result', level: 'edge', name: T('Sonuç negatif', 'The result is negative'),
        data: { tokens: [3, 10, '-', 2, '*', 4, '-', 1, '+', 6, '-'] } },
      { id: 'integer-division', level: 'edge', name: T('Tam sayı bölmesi: küsurat atılır', 'Integer division: the fraction is truncated'),
        data: { tokens: [17, 5, '/', 9, '+', 2, '/', 7, '-', 3, '/'] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of tokens (operands and operators together) — every example must have at least 10. */
    size: function (d) { return d.tokens.length; },
    /** Independent evaluation (checked against S.result by test.js): same rules, same early exit on error. */
    reference: function (d) {
      // independent of apply()/isOp(): own arithmetic; division truncates toward zero as (a - a % b) / b
      var st = [];
      for (var i = 0; i < d.tokens.length; i++) {
        var t = d.tokens[i];
        if (typeof t === 'number') { st.push(t); continue; }
        if (st.length < 2) return { error: { kind: 'too-few', at: i } };
        var b = st.pop(), a = st.pop();
        if (t === '/' && b === 0) return { error: { kind: 'div-zero', at: i } };
        st.push((t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : (a - a % b) / b));
      }
      if (st.length !== 1) return { error: { kind: 'too-many', at: d.tokens.length } };
      return { value: st[0] };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level];
      var lo = level === 'extreme' ? -50 : 1, hi = level === 'extreme' ? 50 : 30;
      var toks = [D.randInt(r, lo, hi), D.randInt(r, lo, hi)], i;
      for (i = 2; i < n; i++) toks.push(r() < 0.45 ? OPS[D.randInt(r, 0, 3)] : D.randInt(r, lo, hi));
      return { tokens: toks };
    },
    input: {
      hint: T('Örnek: 5 3 + 8 2 - *   (en az 10 belirteç: sayı ya da + - * /)',
              'Example: 5 3 + 8 2 - *   (at least 10 tokens: a number or + - * /)'),
      parse: function (text) {
        var toks = String(text).trim().split(/[\s,;]+/).filter(Boolean).map(function (tok) {
          if (isOp(tok)) return tok;
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: tam sayı ya da + - * / yazın.', '"' + tok + '" is not understood: write an integer or + - * /.');
          return parseInt(tok, 10);
        });
        if (toks.length < 10) throw T('En az 10 belirteç yazın.', 'Write at least 10 tokens.');
        if (toks.length > 40) throw T('En çok 40 belirteç.', 'At most 40 tokens.');
        return { tokens: toks };
      },
      format: function (d) { return d.tokens.join(' '); },
      bad: ['', '5 3 +', '5 x 3 + 8 2 - * 4 +', '5.5 3 + 8 2 - * 4 + 9 -', '5 3 ++ 8 2 - * 6 + 12 -']
    },
    build: function (S, d) {
      var toks = d.tokens, n = toks.length, X0 = 110, DX = 58, ROWCAP = 16, Y0 = 60;
      var RX = X0 + Math.min(ROWCAP, n) * DX + 170;
      S.label('rowlbl', { x: X0 - 18, y: Y0 + 26, text: T('belirteçler =', 'tokens ='), anchor: 'end', size: 14, style: 'dim' });
      for (var i = 0; i < n; i++) {
        var row = Math.floor(i / ROWCAP), col = i % ROWCAP;
        S.box('k' + i, { x: X0 + col * DX, y: Y0 + row * 90, w: 48, h: 42, text: String(toks[i]), style: 'normal', above: String(i), size: 18 });
      }
      var rows = Math.ceil(n / ROWCAP);
      S.region('yf', { x: X0 + Math.min(ROWCAP, n) * DX + 30, y: Y0 - 10, w: 110, h: Math.max(220, rows * 90 + 40), title: T('yığın', 'stack') });
      S.label('decision', { x: RX, y: Y0 + 30, text: '', size: 18, bold: true, mono: true, anchor: 'start' });
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      S.step(T('`' + toks.join(' ') + '` postfix (sonek) yazımdır: işleç, işlenenlerinden **sonra** gelir. Parantez ve öncelik kuralı gerekmez; bir yığın yeter.',
               '`' + toks.join(' ') + '` is postfix (reverse Polish) notation: the operator comes **after** its operands. No parentheses or precedence rules are needed; a stack is enough.'),
             { c: [1, 2], java: [1, 2] });

      function highlight(idx) {
        for (var k = 0; k < n; k++) S.set('k' + k, { style: k < idx ? 'dim' : (k === idx ? 'hl' : 'normal') });
      }

      var stack = [], result = null;
      for (var i2 = 0; i2 < n; i2++) {
        var t = toks[i2];
        highlight(i2); decide('', 'normal'); S.at(i2);
        if (!isOp(t)) {
          var sid = 's' + i2;
          S.box(sid, { x: X0 + Math.min(ROWCAP, n) * DX + 45, y: Y0 + 170 - stack.length * 42, w: 90, h: 38, text: String(t), style: 'new', size: 18 });
          stack.push({ v: t, id: sid });
          S.step(T('`' + t + '` bir sayı: yığına it.', '`' + t + '` is a number: push it.'), { c: [5, 6], java: [5, 6] });
          S.set(sid, { style: 'normal' });
          continue;
        }
        if (stack.length < 2) {
          S.set('k' + i2, { style: 'del' });
          result = { error: { kind: 'too-few', at: i2 } };
          decide('too few!', 'del');
          S.step(T('`' + t + '` bir işleç ama yığında iki işlenenden az var → **çok az işlenen**. Hesaplama durur.',
                   '`' + t + '` is an operator but the stack has fewer than two operands → **too few operands**. Evaluation stops.'), { c: 8, java: 8 });
          break;
        }
        var bo = stack.pop(), ao = stack.pop();
        S.set(bo.id, { style: 'hl' }); S.set(ao.id, { style: 'hl' });
        S.step(T('`' + t + '` bir işleç: önce sağ işleneni (b = ' + bo.v + '), sonra sol işleneni (a = ' + ao.v + ') çek. Sıra önemli.',
                 '`' + t + '` is an operator: pop the right operand (b = ' + bo.v + ') first, then the left one (a = ' + ao.v + '). Order matters.'), { c: [9, 10], java: [9, 10] });
        if (t === '/' && bo.v === 0) {
          S.remove(bo.id, ao.id);
          result = { error: { kind: 'div-zero', at: i2 } };
          decide(ao.v + ' / 0!', 'del');
          S.step(T('`' + ao.v + ' / 0`: sıfıra bölme → **hata**. Hesaplama hemen durur, `false` döner.',
                   '`' + ao.v + ' / 0`: division by zero → **error**. Evaluation stops right away and returns `false`.'), { c: 11, java: 11 });
          break;
        }
        var v = apply(t, ao.v, bo.v);
        S.remove(bo.id, ao.id);
        var rid = 'r' + i2;
        S.box(rid, { x: X0 + Math.min(ROWCAP, n) * DX + 45, y: Y0 + 170 - stack.length * 42, w: 90, h: 38, text: String(v), style: 'new', size: 18 });
        stack.push({ v: v, id: rid });
        decide(ao.v + ' ' + SIGN[t] + ' ' + bo.v + ' = ' + v, 'new');
        S.step(T(ao.v + ' ' + SIGN[t] + ' ' + bo.v + ' = ' + v + '. Sonuç yığına geri itilir; sonraki işlemin işleneni olacak.',
                 ao.v + ' ' + SIGN[t] + ' ' + bo.v + ' = ' + v + '. The result is pushed back; it becomes an operand of a later operation.'), { c: 12, java: 12 });
        S.set(rid, { style: 'normal' });
      }
      if (!result) {
        if (stack.length !== 1) {
          result = { error: { kind: 'too-many', at: n } };
          decide('too many!', 'del');
          S.step(T('Girdi bitti ama yığında ' + stack.length + ' değer kaldı (bir olmalıydı) → **çok fazla işlenen**.',
                   'The input is over but ' + stack.length + ' values are left on the stack (should be one) → **too many operands**.'), { c: 15, java: 15 });
        } else {
          S.set(stack[0].id, { style: 'hl' });
          result = { value: stack[0].v };
          decide('= ' + stack[0].v, 'new');
          S.step(T('Girdi bitti; yığında tek değer kaldı: **' + stack[0].v + '**. Her belirteç bir kez işlenir: O(n).',
                   'The input is over; one value is left on the stack: **' + stack[0].v + '**. Each token is handled once: O(n).'), { c: 16, java: 16 });
        }
      }
      S.result = result;
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
