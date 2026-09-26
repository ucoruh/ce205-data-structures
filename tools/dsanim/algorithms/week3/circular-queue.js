/* Week 3 — circular queue: the same ring of cells, but index arithmetic wraps with `(i + 1) % cap`, and an explicit
 * `count` tells empty from full from a single element. Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '#define CAP 8',
    'int q[CAP];',
    'int front = 0, rear = -1, count = 0;   /* empty queue */',
    '',
    'bool enqueue(int x) {',
    '    if (count == CAP)         /* full? */',
    '        return false;         /* overflow */',
    '    rear = (rear + 1) % CAP;  /* wrap around */',
    '    q[rear] = x;',
    '    count++;',
    '    return true;',
    '}',
    '',
    'bool dequeue(int *out) {',
    '    if (count == 0)           /* empty? */',
    '        return false;         /* underflow */',
    '    *out = q[front];',
    '    front = (front + 1) % CAP;',
    '    count--;',
    '    return true;',
    '}'
  ];
  var JAVA = [
    'static final int CAP = 8;',
    'int[] q = new int[CAP];',
    'int front = 0, rear = -1, count = 0;   // empty queue',
    '',
    'boolean enqueue(int x) {',
    '    if (count == CAP)         // full?',
    '        return false;         // overflow',
    '    rear = (rear + 1) % CAP;  // wrap around',
    '    q[rear] = x;',
    '    count++;',
    '    return true;',
    '}',
    '',
    'Integer dequeue() {',
    '    if (count == 0)           // empty?',
    '        return null;          // underflow',
    '    int out = q[front];',
    '    front = (front + 1) % CAP;',
    '    count--;',
    '    return out;',
    '}'
  ];
  var DEQ = 'dq';

  function ops(list) { return list.map(function (v) { return v === DEQ ? DEQ : v; }); }

  D.define({
    id: 'circular-queue',
    title: T('Dairesel kuyruk', 'Circular queue'),
    code: function (d) {
      var cap = d && d.cap || 8;
      return { c: ['#define CAP ' + cap].concat(C.slice(1)), java: ['static final int CAP = ' + cap + ';'].concat(JAVA.slice(1)) };
    },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 hücrede orta karışıklık, bir başa dönüş', 'Moderate mixing in 10 cells, one wrap-around'),
        data: { cap: 10, ops: ops([4, 15, 8, 23, 6, 31, DEQ, DEQ, DEQ, 12, 27, 9, 18, 33]) } },
      { id: 'hard', level: 'hard', name: T('9 hücrede uzun karışıklık, birkaç başa dönüş', 'Long mixing in 9 cells, several wrap-arounds'),
        data: { cap: 9, ops: ops([7, 19, 3, 26, DEQ, DEQ, 11, 34, 8, 22, DEQ, DEQ, DEQ, 15, 29, 6, 17, DEQ, DEQ, DEQ, DEQ, 21, 9, 32]) } },
      { id: 'full', level: 'edge', name: T('Tam dolu: gerçek taşma', 'Completely full: a real overflow'),
        data: { cap: 8, ops: ops([5, 13, 8, 21, 34, 2, 17, 29, 41, 50]) } },
      { id: 'empty', level: 'edge', name: T('Boştan başla, doldur, tekrar boşalt', 'Start empty, fill up, drain back to empty'),
        data: { cap: 10, ops: ops([DEQ, DEQ, 6, 14, 3, 27, 19, 8, 35, 11, 24, 17, DEQ, DEQ, DEQ, DEQ, DEQ, DEQ, DEQ, DEQ, DEQ, DEQ, DEQ]) } },
      { id: 'many-wraps', level: 'edge', name: T('18 kez enqueue/dequeue: halka defalarca döner', '18 enqueue/dequeue cycles: the ring turns over and over'),
        data: {
          cap: 8,
          ops: ops([2, DEQ, 5, DEQ, 9, DEQ, 14, DEQ, 3, DEQ, 18, DEQ, 7, DEQ, 22, DEQ, 11, DEQ, 29, DEQ, 6, DEQ, 33, DEQ, 13, DEQ, 25, DEQ, 4, DEQ, 19, DEQ, 16, DEQ, 8, DEQ])
        } },
      { id: 'front-rear-relation', level: 'edge', name: T('front == rear yalnızca tek eleman demek; asıl tuzak front == (rear+1) % cap', 'front == rear only ever means one element; the real trap is front == (rear+1) % cap'),
        data: { cap: 8, ops: ops([6, 13, 27, 9, 18, DEQ, DEQ, DEQ, DEQ, DEQ, 21, 4, 16, 29, 7, 33, 12, 25]) } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of input values (enqueue attempts) — every example must have at least 10. */
    size: function (d) { return d.ops.filter(function (o) { return o !== DEQ; }).length; },
    /** Independent computation of the expected outcome (checked against S.result by test.js). */
    reference: function (d) {
      var cap = d.cap, front = 0, rear = -1, count = 0, cell = [], dequeued = [], over = 0, under = 0;
      d.ops.forEach(function (o) {
        if (o === DEQ) {
          if (count === 0) under++;
          else { dequeued.push(cell[front]); front = (front + 1) % cap; count--; }
        } else {
          if (count === cap) over++;
          else { rear = (rear + 1) % cap; cell[rear] = o; count++; }
        }
      });
      var queue = [];
      for (var i = 0; i < count; i++) queue.push(cell[(front + i) % cap]);
      return { queue: queue, dequeued: dequeued, overflows: over, underflows: under };
    },
    random: function (level, r) {
      var cap = D.randInt(r, 8, 12);
      var lo = level === 'extreme' ? -500 : 1, hi = level === 'extreme' ? 500 : 60;
      var n = { easy: 14, normal: 18, hard: 24, extreme: 30 }[level];
      var pPush = { easy: 0.72, normal: 0.62, hard: 0.54, extreme: 0.5 }[level];
      var list = [], pushes = 0, i;
      for (i = 0; i < n; i++) {
        if (pushes < 10 && n - i <= 10 - pushes) { list.push(D.randInt(r, lo, hi)); pushes++; }
        else if (r() < pPush) { list.push(D.randInt(r, lo, hi)); pushes++; }
        else list.push(DEQ);
      }
      return { cap: cap, ops: list };
    },
    input: {
      hint: T('Örnek: cap=8  5 12 7 dq 19 dq 3   (sayı = enqueue, dq ya da - = dequeue)',
              'Example: cap=8  5 12 7 dq 19 dq 3   (number = enqueue, dq or - = dequeue)'),
      parse: function (text) {
        var cap = 8, list = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^cap[=:](\d+)$/i.exec(tok);
          if (m) { cap = parseInt(m[1], 10); return; }
          if (/^(dq|-)$/i.test(tok)) { list.push(DEQ); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, dq ya da cap=N yazın.', '"' + tok + '" is not understood: write a number, dq or cap=N.');
          list.push(parseInt(tok, 10));
        });
        if (cap < 1 || cap > 20) throw T('Kapasite 1 ile 20 arasında olmalı.', 'The capacity must be between 1 and 20.');
        if (!list.length) throw T('En az bir işlem yazın.', 'Write at least one operation.');
        if (list.length > 40) throw T('En çok 40 işlem.', 'At most 40 operations.');
        return { cap: cap, ops: list };
      },
      format: function (d) { return 'cap=' + d.cap + '  ' + d.ops.join(' '); },
      bad: ['', 'cap=0 5', 'cap=99 5', '5 x 7', '3.5 dq', 'cap=abc 4'],
      tokens: function (d) { return d.ops.map(function (o) { return o === DEQ ? 'dq' : String(o); }); }
    },
    build: function (S, d) {
      var CAP = d.cap, CX = 340, CY = 260, R = 180, BW = 74, BH = 50;
      var front = 0, rear = -1, count = 0, cell = [], dequeued = [], over = 0, under = 0, enqCount = 0, deqCount = 0;
      var sides = [];

      for (var i = 0; i < CAP; i++) {
        var a = -Math.PI / 2 + i * 2 * Math.PI / CAP, x = CX + R * Math.cos(a), y = CY + R * Math.sin(a);
        S.box('h' + i, { x: x - BW / 2, y: y - BH / 2, w: BW, h: BH, text: '', style: 'empty', size: 17 });
        var dx = Math.cos(a), dy = Math.sin(a);
        var lx = CX + (R + 40) * dx, ly = CY + (R + 40) * dy;
        S.label('i' + i, { x: lx, y: ly + 5, text: '[' + i + ']', style: 'dim', size: 12, mono: true });
        sides.push(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top'));
      }
      S.label('qname', { x: CX, y: CY, text: T('kuyruk (dairesel)', 'queue (circular)'), bold: true, size: 15, style: 'dim' });
      var LX = CX + R + 150, LY0 = CY - 90;
      S.label('durum1', { x: LX, y: LY0, text: 'front = 0', size: 18, mono: true, anchor: 'start' });
      S.label('durum2', { x: LX, y: LY0 + 32, text: 'rear = -1', size: 18, mono: true, anchor: 'start' });
      S.label('durum3', { x: LX, y: LY0 + 64, text: 'count = 0', size: 18, bold: true, mono: true, anchor: 'start' });
      S.label('info', { x: LX, y: LY0 + 96, text: T(d.ops.length + ' işlem', d.ops.length + ' operations'), style: 'dim', size: 14, anchor: 'start' });
      S.label('decision', { x: LX, y: LY0 + 128, text: '', bold: true, size: 17, mono: true, anchor: 'start' });
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      var DEQX0 = CX - R, DEQY0 = CY + R + 90, DEQW = 46, DEQROWCAP = 14;
      S.label('deqlbl', { x: DEQX0 - 16, y: DEQY0 + 24, text: T('çıkanlar =', 'dequeued ='), anchor: 'end', style: 'dim', size: 14 });
      function addDeq(v) {
        var idx = dequeued.length - 1, row = Math.floor(idx / DEQROWCAP), col = idx % DEQROWCAP;
        if (idx > 0) S.set('dq' + (idx - 1), { style: 'dim' });
        S.box('dq' + idx, { x: DEQX0 + col * DEQW, y: DEQY0 + row * 40, w: 40, h: 34, text: String(v), style: 'new', size: 15 });
      }

      function isOccupied(k) {
        if (count === 0) return false;
        return (k - front + CAP) % CAP < count;
      }
      function clean() {
        for (var k = 0; k < CAP; k++) {
          if (isOccupied(k)) S.set('h' + k, { style: 'normal', text: cell[k] !== undefined ? String(cell[k]) : '' });
          else S.set('h' + k, { style: 'empty', text: '' });
        }
      }
      function point() {
        // front and rear can land on the same cell (exactly one element): draw a single combined
        // pointer instead of two on the same radial line, so neither arrow crosses the other's label.
        if (front === rear && rear >= 0) {
          if (S.has('pr')) S.remove('pr');
          if (!S.has('pf')) S.pointer('pf', { target: 'h' + front, text: 'front, rear', side: sides[front], dist: 44, style: 'hl' });
          else S.set('pf', { target: 'h' + front, text: 'front, rear', side: sides[front], dist: 44, style: 'hl' });
          return;
        }
        if (!S.has('pf')) S.pointer('pf', { target: 'h' + front, text: 'front', side: sides[front], dist: 44 });
        else S.set('pf', { target: 'h' + front, text: 'front', side: sides[front], dist: 44, style: 'active' });
        if (rear >= 0) {
          if (!S.has('pr')) S.pointer('pr', { target: 'h' + rear, text: 'rear', side: sides[rear], dist: 44, style: 'hl' });
          else S.set('pr', { target: 'h' + rear, side: sides[rear], dist: 44, style: 'hl' });
        }
      }
      function label() {
        S.set('durum1', { text: 'front = ' + front });
        S.set('durum2', { text: 'rear = ' + rear });
        S.set('durum3', { text: 'count = ' + count });
      }
      function applyEnqueue(x) {
        var oldRear = rear;
        rear = (rear + 1) % CAP;
        cell[rear] = x;
        count++;
        return { oldRear: oldRear, wrapped: rear < oldRear };
      }
      function applyDequeue() {
        var v = cell[front], oldFront = front;
        front = (front + 1) % CAP;
        count--;
        return { v: v, oldFront: oldFront, wrapped: front < oldFront };
      }
      function wrapNote(w) { return w ? T(' — **başa döndük!**', ' — **we wrapped around!**') : T('', ''); }

      clean(); point(); label();
      S.step(T('Aynı hücreleri bir halka gibi düşünelim: son hücreden sonra yine `[0]` gelir. Bunu `(i + 1) % CAP` ile yaparız. ' +
               'Dolu/boş ayrımı için ayrıca `count` tutuyoruz. Sırada ' + d.ops.length + ' işlem var.',
               'Think of the same cells as a ring: after the last cell comes `[0]` again. We do this with `(i + 1) % CAP`. ' +
               'We also keep `count` to tell full from empty. ' + d.ops.length + ' operations follow.'),
             { c: [1, 2, 3], java: [1, 2, 3] });

      d.ops.forEach(function (op, k) {
        decide('', 'normal'); S.at(k);
        if (op !== DEQ) {
          var x = op;
          if (count === CAP) {
            over++;
            clean();
            for (var qi = 0; qi < CAP; qi++) S.set('h' + qi, { style: 'del' });
            decide('full!', 'del');
            S.step(T('`enqueue(' + x + ')` — `count == CAP` (' + count + ' == ' + CAP + ') → **taşma (overflow)**, kuyruk gerçekten dolu. Hiçbir şey yazılmaz.',
                     '`enqueue(' + x + ')` — `count == CAP` (' + count + ' == ' + CAP + ') → **overflow**, the queue really is full. Nothing is written.'),
                   { c: [6, 7], java: [6, 7] });
            return;
          }
          enqCount++;
          if (enqCount === 1) {
            clean(); point(); label();
            S.step(T('`enqueue(' + x + ')` — önce sorulur, `count == CAP` mi? `count` (' + count + ') değil, yer var.',
                     '`enqueue(' + x + ')` — first we ask, is `count == CAP`? `count` (' + count + ') is not, so there is room.'),
                   { c: [6], java: [6] });
            var r1 = applyEnqueue(x);
            S.set('h' + rear, { style: 'hl' }); point(); label();
            var wn1 = wrapNote(r1.wrapped);
            if (r1.wrapped) decide('wrapped!', 'hl');
            S.step(T('`rear = (' + r1.oldRear + ' + 1) % ' + CAP + ' = ' + rear + '`' + wn1.tr + '.', '`rear = (' + r1.oldRear + ' + 1) % ' + CAP + ' = ' + rear + '`' + wn1.en + '.'),
                   { c: [8], java: [8] });
            S.set('h' + rear, { text: String(x), style: 'new' });
            S.step(T('`q[' + rear + '] = ' + x + '`, `count` ' + count + ' olur. Sonraki enqueue\'ları hızlı gösteriyoruz.',
                     '`q[' + rear + '] = ' + x + '`, `count` becomes ' + count + '. The next enqueues are shown faster.'),
                   { c: [9, 10], java: [9, 10] });
            return;
          }
          var r3 = applyEnqueue(x);
          clean(); point(); label();
          S.set('h' + rear, { text: String(x), style: 'new' });
          var wn3 = wrapNote(r3.wrapped);
          if (r3.wrapped) decide('wrapped!', 'hl');
          S.step(T('`enqueue(' + x + ')` — yer var → `rear = (' + r3.oldRear + ' + 1) % ' + CAP + ' = ' + rear + '`' + wn3.tr + ', `q[' + rear + '] = ' + x + '`, `count = ' + count + '`.',
                   '`enqueue(' + x + ')` — there is room → `rear = (' + r3.oldRear + ' + 1) % ' + CAP + ' = ' + rear + '`' + wn3.en + ', `q[' + rear + '] = ' + x + '`, `count = ' + count + '`.'),
                 { c: [6, 8, 9, 10], java: [6, 8, 9, 10] });
          return;
        }
        if (count === 0) {
          under++;
          clean();
          decide('empty!', 'del');
          S.step(T('`dequeue()` — `count == 0`, çıkaracak eleman yok → **alttan taşma (underflow)**. `false` döner.',
                   '`dequeue()` — `count == 0`, there is nothing to remove → **underflow**. It returns `false`.'),
                 { c: [15, 16], java: [15, 16] });
          return;
        }
        deqCount++;
        if (deqCount === 1) {
          var v1 = cell[front];
          S.set('h' + front, { style: 'hl' });
          S.step(T('`dequeue()` — kuyruk boş değil (`count > 0`). Baştaki değer (' + v1 + ') okunur: **İlk giren, İlk çıkar (FIFO)**.',
                   '`dequeue()` — the queue is not empty (`count > 0`). The value at the front (' + v1 + ') is read: **First In, First Out (FIFO)**.'),
                 { c: [15, 17], java: [15, 17] });
          var rd1 = applyDequeue();
          dequeued.push(rd1.v);
          clean(); point(); label();
          addDeq(rd1.v);
          var wnd1 = wrapNote(rd1.wrapped);
          if (rd1.wrapped) decide('wrapped!', 'hl');
          S.step(T('`front = (' + rd1.oldFront + ' + 1) % ' + CAP + ' = ' + front + '`' + wnd1.tr + ', `count` ' + count + ' olur. Sonraki dequeue\'ları hızlı gösteriyoruz.',
                   '`front = (' + rd1.oldFront + ' + 1) % ' + CAP + ' = ' + front + '`' + wnd1.en + ', `count` becomes ' + count + '. The next dequeues are shown faster.'),
                 { c: [18, 19], java: [18, 19] });
          return;
        }
        var rd2 = applyDequeue();
        dequeued.push(rd2.v);
        clean(); point(); label();
        addDeq(rd2.v);
        var wnd2 = wrapNote(rd2.wrapped);
        if (rd2.wrapped) decide('wrapped!', 'hl');
        S.step(T('`dequeue()` → ' + rd2.v + '; `front = (' + rd2.oldFront + ' + 1) % ' + CAP + ' = ' + front + '`' + wnd2.tr + ', `count = ' + count + '`.',
                 '`dequeue()` → ' + rd2.v + '; `front = (' + rd2.oldFront + ' + 1) % ' + CAP + ' = ' + front + '`' + wnd2.en + ', `count = ' + count + '`.'),
               { c: [17, 18, 19], java: [17, 18, 19] });
      });

      clean(); point(); label(); decide('', 'normal'); S.at(null);
      var queue = [];
      for (var qi2 = 0; qi2 < count; qi2++) queue.push(cell[(front + qi2) % CAP]);
      S.result = { queue: queue.map(Number), dequeued: dequeued.map(Number), overflows: over, underflows: under };
      S.step(T('Bitti: ' + enqCount + ' enqueue, ' + deqCount + ' dequeue' + (over ? ', ' + over + ' taşma' : '') + (under ? ', ' + under + ' alttan taşma' : '') +
               '. Kuyrukta: ' + (queue.length ? queue.join(', ') : 'hiçbir şey') + ' (`count = ' + count + '`). ' +
               '`front == rear` burada yalnızca "tam bir eleman var" demek; asıl tuzak `front == (rear + 1) % CAP` — bu, hem boş hem dolu durumda aynı görünür, yalnız `count` ayırt eder.',
               'Done: ' + enqCount + ' enqueues, ' + deqCount + ' dequeues' + (over ? ', ' + over + ' overflow' + (over > 1 ? 's' : '') : '') + (under ? ', ' + under + ' underflow' + (under > 1 ? 's' : '') : '') +
               '. In the queue: ' + (queue.length ? queue.join(', ') : 'nothing') + ' (`count = ' + count + '`). ' +
               '`front == rear` here only ever means "exactly one element"; the real trap is `front == (rear + 1) % CAP` — that looks identical whether the queue is empty or full, only `count` tells them apart.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
