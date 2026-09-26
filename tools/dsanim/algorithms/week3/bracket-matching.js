/* Week 3 — checking brackets with a stack, on strings of >= 10 characters (other characters are skipped). */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'bool balanced(const char *s) {',
    '    char st[100]; int top = -1;',
    "    for (int i = 0; s[i] != '\\0'; i++) {",
    '        char c = s[i];',
    "        if (c == '(' || c == '[' || c == '{') {",
    '            st[++top] = c;                /* opener: push */',
    "        } else if (c == ')' || c == ']' || c == '}') {",
    '            if (top == -1) return false;  /* nothing to match */',
    '            char o = st[top--];           /* pop */',
    '            if (!matches(o, c)) return false;',
    '        }',
    '    }',
    '    return top == -1;                     /* all closed? */',
    '}'
  ];
  var JAVA = [
    'boolean balanced(String s) {',
    '    char[] st = new char[100]; int top = -1;',
    '    for (int i = 0; i < s.length(); i++) {',
    '        char c = s.charAt(i);',
    "        if (c == '(' || c == '[' || c == '{') {",
    '            st[++top] = c;                // opener: push',
    "        } else if (c == ')' || c == ']' || c == '}') {",
    '            if (top == -1) return false;  // nothing to match',
    '            char o = st[top--];           // pop',
    '            if (!matches(o, c)) return false;',
    '        }',
    '    }',
    '    return top == -1;                     // all closed?',
    '}'
  ];
  var OPEN = '([{', CLOSE = ')]}', PAIR = { ')': '(', ']': '[', '}': '{' };
  var X0 = 60, DX = 46, Y0 = 60, ROWCAP = 14, ROWH = 96;

  /** Independent computation of whether `text` is balanced, and where the first error is. */
  function check(text) {
    var stack = [];
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (OPEN.indexOf(c) !== -1) { stack.push({ ch: c, idx: i }); continue; }
      if (CLOSE.indexOf(c) === -1) continue; // not a bracket: skip
      if (!stack.length) return { balanced: false, errorIndex: i, errorKind: 'empty' };
      var top = stack.pop();
      if (PAIR[c] !== top.ch) return { balanced: false, errorIndex: i, errorKind: 'mismatch' };
    }
    if (stack.length) return { balanced: false, errorIndex: stack[0].idx, errorKind: 'unclosed' };
    return { balanced: true, errorIndex: -1, errorKind: null };
  }

  D.define({
    id: 'bracket-matching',
    title: T('Yığınla parantez denetimi', 'Checking brackets with a stack'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'balanced-mixed', level: 'normal', name: T('Dengeli, karışık karakterli', 'Balanced, with mixed characters'),
        data: { text: 'a(b[c]d)e{f}g' } },
      { id: 'balanced-long-mixed', level: 'hard', name: T('Dengeli, üç grup, iç içe üç tür parantez', 'Balanced, three groups, all three bracket kinds nested'),
        data: { text: '(a[b]{c})+(d[e]{f})*(g[h]{i})' } },
      { id: 'mismatch', level: 'edge', name: T('Uyuşmayan parantez: ( ile ] eşleşmez', 'Mismatch: ( does not match ]'),
        data: { text: 'start(a[b)c]end' } },
      { id: 'closer-on-empty', level: 'edge', name: T('Boş yığına kapanan gelir', 'A closer arrives on an empty stack'),
        data: { text: 'abcdefg]hijklmno' } },
      { id: 'openers-left', level: 'edge', name: T('Sonda açık kalan parantez', 'An opener is left open at the end'),
        data: { text: 'begin(x[y]z' } },
      { id: 'deeply-nested', level: 'edge', name: T('10 kat iç içe, dengeli', 'Nested 10 levels deep, balanced'),
        data: { text: '('.repeat(10) + ')'.repeat(10) } },
      { id: 'only-non-bracket', level: 'edge', name: T('Hiç parantez yok', 'No brackets at all'),
        data: { text: 'hello world!' } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of characters in the string — every example must have at least 10. */
    size: function (d) { return d.text.length; },
    reference: function (d) { return check(d.text); },
    random: function (level, r) {
      var len = { easy: 10, normal: 14, hard: 18, extreme: 24 }[level];
      var fillers = 'abcdefghijklmnopqrstuvwxyz0123456789 +-*='.split('');
      var openers = ['(', '[', '{'], closers = { '(': ')', '[': ']', '{': '}' };
      var chars = [], open = [];
      for (var i = 0; i < len; i++) {
        var roll = r();
        if (roll < 0.28 && open.length < 6) {
          var k = openers[D.randInt(r, 0, 2)];
          chars.push(k); open.push(k);
        } else if (roll < 0.5 && open.length) {
          var top = open.pop();
          if (level === 'extreme' && r() < 0.2) chars.push(openers[(openers.indexOf(top) + 1) % 3] === '(' ? ')' : closers[openers[(openers.indexOf(top) + 1) % 3]]);
          else chars.push(closers[top]);
        } else if (roll < 0.58) {
          chars.push(closers[openers[D.randInt(r, 0, 2)]]); // possible closer-on-empty
        } else {
          chars.push(fillers[D.randInt(r, 0, fillers.length - 1)]);
        }
      }
      return { text: chars.join('') };
    },
    input: {
      hint: T('En az 10 karakterlik bir dizgi yazın; parantez olmayanlar atlanır.', 'Type a string of at least 10 characters; non-bracket characters are skipped.'),
      parse: function (text) {
        var s = String(text);
        if (!s.trim().length) throw T('Boş olamaz.', 'It cannot be empty.');
        if (s.length > 60) throw T('En çok 60 karakter.', 'At most 60 characters.');
        return { text: s };
      },
      format: function (d) { return d.text; },
      bad: ['', '   ', 'x'.repeat(80)],
      tokens: function (d) { return d.text.split(''); }
    },
    build: function (S, d) {
      var text = d.text, n = text.length;
      var RX = X0 + Math.min(ROWCAP, n) * DX + 170;
      S.label('rowlbl', { x: X0 - 18, y: Y0 + 25, text: T('girdi =', 'input ='), anchor: 'end', size: 14, style: 'dim' });
      for (var i = 0; i < n; i++) {
        var row = Math.floor(i / ROWCAP), col = i % ROWCAP;
        S.box('t' + i, { x: X0 + col * DX, y: Y0 + row * ROWH, w: 38, h: 40, text: text[i] === ' ' ? '␣' : text[i], style: 'normal', above: String(i), size: 18 });
      }
      var rows = Math.ceil(n / ROWCAP);
      S.region('yf', { x: X0 + Math.min(ROWCAP, n) * DX + 30, y: Y0 - 10, w: 110, h: Math.max(220, rows * ROWH + 40), title: T('yığın', 'stack') });
      S.label('decision', { x: RX, y: Y0 + 30, text: '', size: 18, bold: true, mono: true });
      function decide(text2, style) { S.set('decision', { text: text2 || '', style: style || 'normal' }); }
      S.step(T('`' + text + '` (' + n + ' karakter) dengeli mi? Kural: her kapanan, **en son açılan** ile eşleşmeli. Parantez olmayan karakterler atlanır.',
               '`' + text + '` (' + n + ' characters) — are the brackets balanced? Rule: every closer must match the **most recently opened** one. Non-bracket characters are skipped.'),
             { c: [1, 2], java: [1, 2] });

      function highlight(from, to) {
        for (var k = 0; k < n; k++) S.set('t' + k, { style: k < from ? 'dim' : (k <= to ? 'hl' : 'normal') });
      }

      var stack = [], result = null, i2 = 0;
      while (i2 < n) {
        var c = text[i2];
        decide('', 'normal');
        if (OPEN.indexOf(c) === -1 && CLOSE.indexOf(c) === -1) {
          var j = i2;
          while (j < n && OPEN.indexOf(text[j]) === -1 && CLOSE.indexOf(text[j]) === -1) j++;
          highlight(i2, j - 1);
          S.at(i2);
          S.step(T('`' + text.slice(i2, j) + '`: parantez değil, atla.', '`' + text.slice(i2, j) + '`: not a bracket, skip.'), { c: [3, 4], java: [3, 4] });
          i2 = j;
          continue;
        }
        highlight(i2, i2);
        S.at(i2);
        if (OPEN.indexOf(c) !== -1) {
          var sid = 's' + i2;
          S.box(sid, { x: X0 + Math.min(ROWCAP, n) * DX + 45, y: Y0 + 170 - stack.length * 42, w: 90, h: 38, text: c, style: 'new', size: 18 });
          stack.push({ ch: c, idx: i2, id: sid });
          decide('push', 'new');
          S.step(T('`' + c + '` bir açan parantez: yığına it (push). Yığında ' + stack.length + ' açık parantez var.',
                   '`' + c + '` is an opener: push it. ' + stack.length + ' open bracket(s) are on the stack.'), { c: [5, 6], java: [5, 6] });
          S.set(sid, { style: 'normal' });
        } else if (!stack.length) {
          S.set('t' + i2, { style: 'del' });
          result = { balanced: false, errorIndex: i2, errorKind: 'empty' };
          decide('empty!', 'del');
          S.step(T('`' + c + '` bir kapanan ama yığın boş: eşleştirilecek açan yok → **dengesiz**.',
                   '`' + c + '` is a closer but the stack is empty: nothing to match → **unbalanced**.'), { c: [7, 8], java: [7, 8] });
          break;
        } else {
          var top = stack[stack.length - 1];
          if (PAIR[c] !== top.ch) {
            S.set(top.id, { style: 'del' });
            S.set('t' + i2, { style: 'del' });
            result = { balanced: false, errorIndex: i2, errorKind: 'mismatch' };
            decide('mismatch!', 'del');
            S.step(T('`' + c + '` geldi ama yığının tepesinde `' + top.ch + '` var; eşleşmiyor → **dengesiz**.',
                     '`' + c + '` arrives but `' + top.ch + '` is on top of the stack; they do not match → **unbalanced**.'), { c: [9, 10], java: [9, 10] });
            break;
          }
          S.set(top.id, { style: 'del' });
          S.remove(top.id);
          stack.pop();
          decide('( ' + top.ch + c + ' matches )', 'new');
          S.step(T('`' + c + '` bir kapanan: yığından çek (pop) → `' + top.ch + '`. Eşleşiyorlar.',
                   '`' + c + '` is a closer: pop → `' + top.ch + '`. They match.'), { c: [9, 10], java: [9, 10] });
        }
        i2++;
      }
      if (!result) {
        if (stack.length) {
          stack.forEach(function (s) { S.set(s.id, { style: 'del' }); });
          result = { balanced: false, errorIndex: stack[0].idx, errorKind: 'unclosed' };
          decide('unbalanced!', 'del');
          S.step(T('Girdi bitti ama yığında ' + stack.length + ' açan parantez kaldı → **dengesiz**.',
                   'The input is over but ' + stack.length + ' opener(s) remain on the stack → **unbalanced**.'), { c: 13, java: 13 });
        } else {
          result = { balanced: true, errorIndex: -1, errorKind: null };
          for (var kk = 0; kk < n; kk++) S.set('t' + kk, { style: 'new' });
          decide('balanced', 'new');
          S.step(T('Girdi bitti, yığın boş: her açan kendi kapananını buldu → **dengeli**. Her karakter bir kez işlenir: O(n).',
                   'The input is over and the stack is empty: every opener found its closer → **balanced**. Each character is handled once: O(n).'), { c: 13, java: 13 });
        }
      }
      S.result = result;
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
