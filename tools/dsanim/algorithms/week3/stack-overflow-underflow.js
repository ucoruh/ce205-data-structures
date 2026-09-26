/* Week 3 — array stack: the two failure cases, overflow and underflow, with >= 10-value examples. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '#define CAP 10',
    'int data[CAP];',
    'int top = -1;            /* empty stack */',
    '',
    'bool push(int x) {',
    '    if (top == CAP - 1)  /* full? */',
    '        return false;    /* overflow */',
    '    top = top + 1;',
    '    data[top] = x;',
    '    return true;',
    '}',
    '',
    'bool pop(int *out) {',
    '    if (top == -1)       /* empty? */',
    '        return false;    /* underflow */',
    '    *out = data[top];',
    '    top = top - 1;',
    '    return true;',
    '}'
  ];
  var JAVA = [
    'static final int CAP = 10;',
    'int[] data = new int[CAP];',
    'int top = -1;            // empty stack',
    '',
    'boolean push(int x) {',
    '    if (top == CAP - 1)  // full?',
    '        return false;    // overflow',
    '    top = top + 1;',
    '    data[top] = x;',
    '    return true;',
    '}',
    '',
    'Integer pop() {',
    '    if (top == -1)       // empty?',
    '        return null;     // underflow',
    '    int out = data[top];',
    '    top = top - 1;',
    '    return out;',
    '}'
  ];
  var POP = 'pop';

  D.define({
    id: 'stack-overflow-underflow',
    title: T('Yığında taşma ve alttan taşma', 'Stack overflow and underflow'),
    code: function (d) {
      var cap = d && d.cap || 10;
      return { c: ['#define CAP ' + cap].concat(C.slice(1)), java: ['static final int CAP = ' + cap + ';'].concat(JAVA.slice(1)) };
    },
    presets: [
      { id: 'overflow-11-into-10', level: 'normal', name: T('10 hücrelik yığına 11 push: taşma', 'Overflow: 11 pushes into a 10-cell stack'),
        data: { cap: 10, ops: [4, 15, 8, 23, 6, 31, 12, 27, 9, 18, 40] } },
      { id: 'underflow-after-empty', level: 'hard', name: T('10 push, sonra 13 pop: boşalınca alttan taşma', 'Underflow after draining: 10 pushes, then 13 pops'),
        data: { cap: 10, ops: [7, 19, 3, 26, 14, 8, 31, 22, 5, 17, POP, POP, POP, POP, POP, POP, POP, POP, POP, POP, POP, POP, POP] } },
      { id: 'overflow-and-underflow', level: 'edge', name: T('Aynı çalıştırmada ikisi de: küçük yığın (CAP=6)', 'Both in one run: a small stack (CAP=6)'),
        data: { cap: 6, ops: [3, 9, 14, 2, 21, 6, 17, 8, 25, 11, POP, POP, POP, POP, POP, POP, POP, POP, POP] } },
      { id: 'repeated-overflow-attempts', level: 'edge', name: T('Yığın tam dolu; art arda 5 push denemesi de başarısız', 'The stack is exactly full; 5 more pushes in a row all fail'),
        data: { cap: 10, ops: [12, 5, 27, 9, 33, 16, 41, 8, 19, 24, 50, 61, 7, 38, 45] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of values the program tried to push (successful or not) — every example must try >= 10. */
    size: function (d) { return d.ops.filter(function (o) { return o !== POP; }).length; },
    /** Independent computation of the expected outcome (checked against S.result by test.js). */
    reference: function (d) {
      var st = [], popped = [], over = 0, under = 0;
      d.ops.forEach(function (o) {
        if (o === POP) { if (st.length) popped.push(st.pop()); else under++; }
        else if (st.length === d.cap) over++;
        else st.push(o);
      });
      return { stack: st, popped: popped, overflows: over, underflows: under };
    },
    random: function (level, r) {
      var cap = { easy: 10, normal: 10, hard: 8, extreme: 6 }[level];
      var lo = level === 'extreme' ? -500 : 1, hi = level === 'extreme' ? 500 : 99;
      var pushCount = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level];
      var extraMax = { easy: 2, normal: 3, hard: 4, extreme: 6 }[level];
      var ops = [], i;
      for (i = 0; i < pushCount; i++) ops.push(D.randInt(r, lo, hi));
      var extra = D.randInt(r, 0, extraMax);
      for (i = 0; i < extra; i++) ops.push(D.randInt(r, lo, hi));
      var pops = cap + D.randInt(r, 0, extraMax);
      for (i = 0; i < pops; i++) ops.push(POP);
      return { cap: cap, ops: ops };
    },
    input: {
      hint: T('Örnek: cap=10  5 8 13 pop 21 pop   (sayı = push denemesi, pop ya da - = pop denemesi)',
              'Example: cap=10  5 8 13 pop 21 pop   (number = push attempt, pop or - = pop attempt)'),
      parse: function (text) {
        var cap = 10, list = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^cap[=:](\d+)$/i.exec(tok);
          if (m) { cap = parseInt(m[1], 10); return; }
          if (/^(pop|-)$/i.test(tok)) { list.push(POP); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, pop ya da cap=N yazın.', '"' + tok + '" is not understood: write a number, pop or cap=N.');
          list.push(parseInt(tok, 10));
        });
        if (cap < 1 || cap > 15) throw T('Kapasite 1 ile 15 arasında olmalı.', 'The capacity must be between 1 and 15.');
        if (!list.length) throw T('En az bir işlem yazın.', 'Write at least one operation.');
        if (list.length > 40) throw T('En çok 40 işlem.', 'At most 40 operations.');
        return { cap: cap, ops: list };
      },
      format: function (d) { return 'cap=' + d.cap + '  ' + d.ops.join(' '); },
      bad: ['', 'cap=0 5', 'cap=99 5', '5 x 7', '3.5 pop', 'cap=abc 4'],
      tokens: function (d) { return d.ops.map(function (o) { return o === POP ? 'pop' : String(o); }); }
    },
    build: function (S, d) {
      var CAP = d.cap, W = 64, H = 46, X0 = 70, Y0 = 130, top = -1, pushes = 0, pops = 0, over = 0, under = 0, popped = [];
      var RX = X0 + CAP * W + 46, POPY = Y0 + 110;
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: 'stack', anchor: 'end', size: 15, bold: true });
      for (var i = 0; i < CAP; i++) S.box('h' + i, { x: X0 + i * W, y: Y0, w: 54, h: H, text: '', style: 'empty', size: 16, above: String(i) });
      S.label('topv', { x: RX, y: Y0 - 10, text: 'top = -1', size: 19, bold: true, mono: true, anchor: 'start' });
      S.label('info', { x: RX, y: Y0 + 20, text: T('boş yığın', 'empty stack'), style: 'dim', size: 14, anchor: 'start' });
      S.label('stats', { x: RX, y: Y0 + 44, text: T('taşma: 0 · alttan taşma: 0', 'overflow: 0 · underflow: 0'), style: 'dim', size: 13, anchor: 'start' });
      S.label('decision', { x: RX, y: Y0 + 74, text: '', size: 18, bold: true, mono: true, anchor: 'start' });
      S.label('poplbl', { x: X0 - 16, y: POPY + H / 2 + 5, text: T('çıkanlar =', 'popped ='), anchor: 'end', size: 14, style: 'dim' });

      function refresh() {
        for (var k = 0; k < CAP; k++) S.set('h' + k, k <= top ? { style: 'normal' } : { style: 'empty', text: '' });
      }
      function count() {
        S.set('topv', { text: 'top = ' + top });
        S.set('info', { text: top < 0 ? T('boş yığın', 'empty stack') : T((top + 1) + ' eleman', (top + 1) + ' element' + (top ? 's' : '')) });
      }
      function stats() {
        S.set('stats', { text: T('taşma: ' + over + ' · alttan taşma: ' + under, 'overflow: ' + over + ' · underflow: ' + under) });
      }
      function point() {
        if (top >= 0) { if (!S.has('topp')) S.pointer('topp', { target: 'h' + top, text: 'top', side: 'top', dist: 56 }); else S.set('topp', { target: 'h' + top }); }
        else if (S.has('topp')) S.remove('topp');
      }
      function braces() {
        if (top >= 0) {
          if (!S.has('usedb')) S.brace('usedb', { from: 'h0', to: 'h' + top, text: T('kullanılan', 'used'), side: 'bottom', dist: 14, style: 'active' });
          else S.set('usedb', { to: 'h' + top });
        } else if (S.has('usedb')) S.remove('usedb');
        if (top < CAP - 1) {
          if (!S.has('freeb')) S.brace('freeb', { from: 'h' + (top + 1), to: 'h' + (CAP - 1), text: T('boş yuvalar', 'free slots'), side: 'bottom', dist: 14, style: 'dim' });
          else S.set('freeb', { from: 'h' + (top + 1) });
        } else if (S.has('freeb')) S.remove('freeb');
      }
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      function addPopped(v) {
        var idx = popped.length - 1;
        if (idx > 0) S.set('pp' + (idx - 1), { style: 'dim' });
        S.box('pp' + idx, { x: X0 + idx * W, y: POPY, w: 54, h: H, text: String(v), style: 'new', size: 16 });
      }
      braces();
      S.step(T('`CAP = ' + CAP + '` hücrelik bir yığınımız var; ' + d.ops.length + ' işlem deneyeceğiz. Bu kez amacımız iki hata durumunu görmek: **taşma (overflow)** ve **alttan taşma (underflow)**. '
               + 'Her ikisi de tek bir `if` kontrolüyle yakalanır; program hiçbir zaman dizinin sınırları dışına yazmaz.',
               'We have a stack with `CAP = ' + CAP + '` cells; we will try ' + d.ops.length + ' operations. This time our goal is to see the two failure cases: **overflow** and **underflow**. '
               + 'Each one is caught by a single `if`; the program never writes past the array bounds.'),
             { c: [1, 2, 3], java: [1, 2, 3] });

      d.ops.forEach(function (op, k) {
        refresh(); decide('', 'normal'); S.at(k);
        if (op !== POP) {
          var x = op;
          if (top === CAP - 1) {
            over++;
            S.set('h' + (CAP - 1), { style: 'del' });
            stats(); decide('full!', 'del');
            if (over === 1) {
              S.step(T('`push(' + x + ')` — `top == CAP - 1` (' + top + ' == ' + (CAP - 1) + '), yığın dolu → **taşma**. Hiçbir hücreye yazılmaz, `false` döner. Program çökmez, işlem sadece başarısız olur.',
                       '`push(' + x + ')` — `top == CAP - 1` (' + top + ' == ' + (CAP - 1) + '), the stack is full → **overflow**. Nothing is written; it returns `false`. The program does not crash, the operation simply fails.'),
                     { c: [6, 7], java: [6, 7] });
            } else {
              S.step(T('`push(' + x + ')` — yine dolu → ' + over + '. taşma girişimi üst üste. `top` değişmez (' + top + ').',
                       '`push(' + x + ')` — still full → overflow attempt #' + over + ' in a row. `top` stays at ' + top + '.'),
                     { c: [6, 7], java: [6, 7] });
            }
            return;
          }
          pushes++;
          top++; point(); count(); braces();
          S.set('h' + top, { text: String(x), style: 'new' });
          S.step(T('`push(' + x + ')` — yer var → `top = ' + top + '`, `data[' + top + '] = ' + x + '`.',
                   '`push(' + x + ')` — there is room → `top = ' + top + '`, `data[' + top + '] = ' + x + '`.'),
                 { c: [6, 8, 9], java: [6, 8, 9] });
          return;
        }
        if (top === -1) {
          under++;
          S.set('topv', { style: 'del' });
          stats(); decide('empty!', 'del');
          if (under === 1) {
            S.step(T('`pop()` — `top == -1`, çıkaracak eleman yok → **alttan taşma**. `false` döner; program çökmez.',
                     '`pop()` — `top == -1`, there is nothing to remove → **underflow**. It returns `false`; the program does not crash.'),
                   { c: [14, 15], java: [14, 15] });
          } else {
            S.step(T('`pop()` — yine boş → ' + under + '. alttan taşma girişimi üst üste.',
                     '`pop()` — still empty → underflow attempt #' + under + ' in a row.'),
                   { c: [14, 15], java: [14, 15] });
          }
          return;
        }
        pops++;
        var v = S.get('h' + top).text;
        popped.push(Number(v));
        S.set('h' + top, { style: 'dim' });
        top--; point(); count(); braces();
        addPopped(v);
        S.step(T('`pop()` → ' + v + '; `top = ' + top + '`.', '`pop()` → ' + v + '; `top = ' + top + '`.'), { c: [16, 17], java: [16, 17] });
      });
      refresh(); decide('', 'normal'); S.at(null);
      var rest = [];
      for (var k2 = 0; k2 <= top; k2++) rest.push(S.get('h' + k2).text);
      S.result = { stack: rest.map(Number), popped: popped, overflows: over, underflows: under };
      S.step(T('Bitti: ' + pushes + ' başarılı push, ' + pops + ' başarılı pop, **' + over + ' taşma**, **' + under + ' alttan taşma**. '
               + 'Yığında (alttan üste): ' + (rest.length ? rest.join(', ') : 'hiçbir şey') + '. İki basit `if` kontrolü, taşmayı ve alttan taşmayı önceden yakalar.',
               'Done: ' + pushes + ' successful pushes, ' + pops + ' successful pops, **' + over + ' overflow' + (over === 1 ? '' : 's') + '**, **' + under + ' underflow' + (under === 1 ? '' : 's') + '**. '
               + 'Stack (bottom to top): ' + (rest.length ? rest.join(', ') : 'nothing') + '. Two simple `if` checks catch overflow and underflow before they happen.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
