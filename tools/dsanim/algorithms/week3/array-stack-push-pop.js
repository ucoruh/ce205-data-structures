/* Week 3 — array stack: push and pop, with examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '#define CAP 12',
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
    'static final int CAP = 12;',
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

  function ops(list) { return list.map(function (v) { return v === POP ? POP : v; }); }

  D.define({
    id: 'array-stack-push-pop',
    title: T('Dizi ile yığın: push ve pop', 'Array stack: push and pop'),
    code: function (d) {
      var cap = d && d.cap || 12;
      return { c: ['#define CAP ' + cap].concat(C.slice(1)), java: ['static final int CAP = ' + cap + ';'].concat(JAVA.slice(1)) };
    },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 push, sonra 4 pop', '10 pushes, then 4 pops'),
        data: { cap: 12, ops: ops([12, 7, 25, 3, 18, 9, 30, 14, 5, 21, POP, POP, POP, POP]) } },
      { id: 'mixed', level: 'hard', name: T('18 karışık işlem', '18 mixed operations'),
        data: { cap: 12, ops: ops([40, 11, POP, 27, 8, 33, POP, POP, 16, 2, 45, 19, POP, 7, 38, 23, 10, POP]) } },
      { id: 'overflow', level: 'edge', name: T('Taşma: 10 hücreye 11 push', 'Overflow: 11 pushes into 10 cells'),
        data: { cap: 10, ops: ops([4, 15, 8, 16, 23, 42, 11, 6, 29, 37, 50, POP]) } },
      { id: 'underflow', level: 'edge', name: T('Alttan taşma: 10 push, 11 pop', 'Underflow: 10 pushes, 11 pops'),
        data: { cap: 10, ops: ops([31, 5, 17, 26, 9, 44, 13, 2, 38, 20, POP, POP, POP, POP, POP, POP, POP, POP, POP, POP, POP]) } },
      { id: 'empty-first', level: 'edge', name: T('Boş yığından pop, sonra 10 push', 'Pop on an empty stack, then 10 pushes'),
        data: { cap: 12, ops: ops([POP, 18, 3, 27, 11, 6, 35, 14, 22, 9, 41, POP]) } },
      { id: 'extreme-values', level: 'edge', name: T('Uç değerler: INT_MAX, INT_MIN, 0, negatif', 'Extreme values: INT_MAX, INT_MIN, 0, negative'),
        data: { cap: 12, ops: ops([2147483647, -2147483648, 0, -1, 1, 99999, -99999, 0, 7, -7, POP, POP]) } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of input values (pushed numbers) — every example must have at least 10. */
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
      var cap = level === 'easy' || level === 'normal' ? 12 : 10, list = [], i, pushes = 0;
      var lo = level === 'extreme' ? -1000 : 1, hi = level === 'extreme' ? 1000 : 99;
      if (level === 'easy') {
        for (i = 0; i < 10; i++) list.push(D.randInt(r, lo, hi));
        for (i = 0; i < 3; i++) list.push(POP);
      } else {
        var n = { normal: 15, hard: 18, extreme: 22 }[level], pPush = { normal: 0.7, hard: 0.62, extreme: 0.55 }[level];
        for (i = 0; i < n; i++) {
          if (r() < pPush || pushes < 10 && n - i <= 10 - pushes) { list.push(D.randInt(r, lo, hi)); pushes++; } else list.push(POP);
        }
        if (level === 'extreme') { list.unshift(POP); list.push(0, 0, 0); } // start with underflow, end with duplicates
      }
      return { cap: cap, ops: list };
    },
    input: {
      hint: T('Örnek: cap=12  5 8 13 pop 21 pop   (sayı = push, pop ya da - = pop)',
              'Example: cap=12  5 8 13 pop 21 pop   (number = push, pop or - = pop)'),
      parse: function (text) {
        var cap = 12, list = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^cap[=:](\d+)$/i.exec(tok);
          if (m) { cap = parseInt(m[1], 10); return; }
          if (/^(pop|-)$/i.test(tok)) { list.push(POP); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, pop ya da cap=N yazın.', '"' + tok + '" is not understood: write a number, pop or cap=N.');
          list.push(parseInt(tok, 10));
        });
        if (cap < 1 || cap > 20) throw T('Kapasite 1 ile 20 arasında olmalı.', 'The capacity must be between 1 and 20.');
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
      S.label('decision', { x: RX, y: Y0 + 50, text: '', size: 18, bold: true, mono: true, anchor: 'start' });
      S.label('poplbl', { x: X0 - 16, y: POPY + H / 2 + 5, text: T('çıkanlar =', 'popped ='), anchor: 'end', size: 14, style: 'dim' });

      function refresh() {
        for (var k = 0; k < CAP; k++) S.set('h' + k, k <= top ? { style: 'normal' } : { style: 'empty', text: '' });
      }
      function count() {
        S.set('topv', { text: 'top = ' + top });
        S.set('info', { text: top < 0 ? T('boş yığın', 'empty stack') : T((top + 1) + ' eleman', (top + 1) + ' element' + (top ? 's' : '')) });
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
      S.step(T('`CAP = ' + CAP + '` hücrelik bir dizi ayırdık; `top = -1` "en üstte kimse yok" demek. Sırada ' + d.ops.length + ' işlem var.',
               'We allocated an array of `CAP = ' + CAP + '` cells; `top = -1` means "nobody is on top". ' + d.ops.length + ' operations follow.'),
             { c: [1, 2, 3], java: [1, 2, 3] });

      d.ops.forEach(function (op, k) {
        refresh(); decide('', 'normal'); S.at(k);
        if (op !== POP) {
          var x = op;
          if (top === CAP - 1) {
            over++;
            S.set('h' + (CAP - 1), { style: 'del' });
            decide('full!', 'del');
            S.step(T('`push(' + x + ')` — `top == CAP - 1` (' + top + ' == ' + (CAP - 1) + '), yığın dolu → **taşma (overflow)**. Hiçbir şey yazılmaz, `false` döner.',
                     '`push(' + x + ')` — `top == CAP - 1` (' + top + ' == ' + (CAP - 1) + '), the stack is full → **overflow**. Nothing is written; it returns `false`.'),
                   { c: [6, 7], java: [6, 7] });
            return;
          }
          pushes++;
          if (pushes === 1) {
            S.step(T('`push(' + x + ')` — önce soruyoruz, yığın dolu mu? `top` (' + top + ') son indise (' + (CAP - 1) + ') eşit değil, yer var.',
                     '`push(' + x + ')` — first we ask, is the stack full? `top` (' + top + ') is not the last index (' + (CAP - 1) + '), so there is room.'),
                   { c: [5, 6], java: [5, 6] });
            top++; point(); count(); braces();
            S.set('h' + top, { style: 'hl' });
            S.step(T('`top` bir artar ve ' + top + ' olur: yeni eleman bir sonraki hücreye gidecek.', '`top` goes up by one to ' + top + ': the new element goes into the next cell.'),
                   { c: 8, java: 8 });
            S.set('h' + top, { text: String(x), style: 'new' });
            S.step(T('`data[' + top + '] = ' + x + '`. İki adım; kaç eleman olursa olsun aynı: O(1). Sonraki push\'ları hızlı gösteriyoruz.',
                     '`data[' + top + '] = ' + x + '`. Two steps, however many elements there are: O(1). The next pushes are shown faster.'),
                   { c: [9, 10], java: [9, 10] });
            return;
          }
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
          decide('empty!', 'del');
          S.step(T('`pop()` — `top == -1`, çıkaracak eleman yok → **alttan taşma (underflow)**. `false` döner; program çökmez.',
                   '`pop()` — `top == -1`, there is nothing to remove → **underflow**. It returns `false`; the program does not crash.'),
                 { c: [14, 15], java: [14, 15] });
          return;
        }
        pops++;
        var v = S.get('h' + top).text;
        popped.push(Number(v));
        if (pops === 1) {
          S.set('h' + top, { style: 'hl' });
          S.step(T('`pop()` — yığın boş değil. En üstteki değer (' + v + ') okunur: yalnız en üste erişebiliriz, **Son giren İlk çıkar (LIFO)**.',
                   '`pop()` — the stack is not empty. The top value (' + v + ') is read: we can only reach the top, **Last In, First Out (LIFO)**.'),
                 { c: [14, 16], java: [14, 16] });
          S.set('h' + top, { style: 'dim' });
          top--; point(); count(); braces();
          addPopped(v);
          S.step(T('`top` bir azalır (' + top + '). ' + v + ' bellekte duruyor ama artık yığının parçası değil; sonraki push üstüne yazar.',
                   '`top` goes down by one (' + top + '). ' + v + ' is still in memory but no longer part of the stack; the next push overwrites it.'),
                 { c: [17, 18], java: [17, 18] });
          return;
        }
        S.set('h' + top, { style: 'dim' });
        top--; point(); count(); braces();
        addPopped(v);
        S.step(T('`pop()` → ' + v + '; `top = ' + top + '`.', '`pop()` → ' + v + '; `top = ' + top + '`.'), { c: [16, 17], java: [16, 17] });
      });
      refresh(); decide('', 'normal'); S.at(null);
      var rest = [];
      for (var k2 = 0; k2 <= top; k2++) rest.push(S.get('h' + k2).text);
      S.result = { stack: rest.map(Number), popped: popped, overflows: over, underflows: under };
      S.step(T('Bitti: ' + pushes + ' push, ' + pops + ' pop' + (over ? ', ' + over + ' taşma' : '') + (under ? ', ' + under + ' alttan taşma' : '') +
               '. Yığında (alttan üste): ' + (rest.length ? rest.join(', ') : 'hiçbir şey') + '. Her işlem O(1).',
               'Done: ' + pushes + ' pushes, ' + pops + ' pops' + (over ? ', ' + over + ' overflow' + (over > 1 ? 's' : '') : '') + (under ? ', ' + under + ' underflow' + (under > 1 ? 's' : '') : '') +
               '. Stack (bottom to top): ' + (rest.length ? rest.join(', ') : 'nothing') + '. Every operation is O(1).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
