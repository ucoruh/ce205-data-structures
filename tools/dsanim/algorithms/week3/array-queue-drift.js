/* Week 3 — queue in a plain array and the drift problem: front/rear only ever move right, so the array "fills up"
 * even when cells at the front are free. Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '#define CAP 8',
    'int q[CAP];',
    'int front = 0, rear = -1;    /* empty queue */',
    '',
    'bool enqueue(int x) {',
    '    if (rear == CAP - 1)     /* full? */',
    '        return false;        /* overflow */',
    '    rear = rear + 1;',
    '    q[rear] = x;',
    '    return true;',
    '}',
    '',
    'bool dequeue(int *out) {',
    '    if (front > rear)        /* empty? */',
    '        return false;        /* underflow */',
    '    *out = q[front];',
    '    front = front + 1;',
    '    return true;',
    '}'
  ];
  var JAVA = [
    'static final int CAP = 8;',
    'int[] q = new int[CAP];',
    'int front = 0, rear = -1;    // empty queue',
    '',
    'boolean enqueue(int x) {',
    '    if (rear == CAP - 1)     // full?',
    '        return false;        // overflow',
    '    rear = rear + 1;',
    '    q[rear] = x;',
    '    return true;',
    '}',
    '',
    'Integer dequeue() {',
    '    if (front > rear)        // empty?',
    '        return null;         // underflow',
    '    int out = q[front];',
    '    front = front + 1;',
    '    return out;',
    '}'
  ];
  var DEQ = 'dq';

  function ops(list) { return list.map(function (v) { return v === DEQ ? DEQ : v; }); }

  D.define({
    id: 'array-queue-drift',
    title: T('Düz dizide kuyruk ve kayma sorunu', 'Queue in a plain array and the drift problem'),
    code: function (d) {
      var cap = d && d.cap || 8;
      return { c: ['#define CAP ' + cap].concat(C.slice(1)), java: ['static final int CAP = ' + cap + ';'].concat(JAVA.slice(1)) };
    },
    presets: [
      { id: 'normal', level: 'normal', name: T('8 hücreyi doldur, 3 çıkar, yine de taşar', 'Fill 8 cells, remove 3, it still overflows'),
        data: { cap: 8, ops: ops([5, 12, 7, 19, 3, 27, 14, 8, DEQ, DEQ, DEQ, 99, 42]) } },
      { id: 'hard', level: 'hard', name: T('Karışık 15 işlem: kayma yavaşça birikir', '15 mixed operations: the drift builds up gradually'),
        data: { cap: 6, ops: ops([3, 8, 12, DEQ, 15, DEQ, 22, 6, DEQ, 31, DEQ, DEQ, 99, 44, 77]) } },
      { id: 'empty-first', level: 'edge', name: T('Boş kuyruktan dequeue, sonra 10 enqueue', 'Dequeue on an empty queue, then 10 enqueues'),
        data: { cap: 12, ops: ops([DEQ, DEQ, 5, 11, 3, 18, 9, 24, 7, 15, 2, 30, DEQ, DEQ]) } },
      { id: 'exact-fill', level: 'edge', name: T('Tam dolum: taşma yok, sonra taşma; boşalan hücre işe yaramaz', 'Exact fill: no overflow, then overflow; the freed cell does not help'),
        data: { cap: 10, ops: ops([4, 17, 29, 6, 33, 12, 45, 8, 21, 39, 50, DEQ, 77]) } },
      { id: 'alternating', level: 'edge', name: T('Sıkı sıkıya art arda enqueue/dequeue, sonra taşma patlaması', 'Strict alternating enqueue/dequeue, then a burst of overflow'),
        data: { cap: 6, ops: ops([9, DEQ, 14, DEQ, 27, DEQ, 5, DEQ, 33, DEQ, 19, 41, 6, 52, 8]) } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of input values (enqueue attempts) — every example must have at least 10. */
    size: function (d) { return d.ops.filter(function (o) { return o !== DEQ; }).length; },
    /** Independent computation of the expected outcome (checked against S.result by test.js). */
    reference: function (d) {
      var cap = d.cap, front = 0, rear = -1, cell = [], dequeued = [], over = 0, under = 0;
      d.ops.forEach(function (o) {
        if (o === DEQ) {
          if (front > rear) under++;
          else { dequeued.push(cell[front]); front++; }
        } else {
          if (rear === cap - 1) over++;
          else { rear++; cell[rear] = o; }
        }
      });
      var queue = [];
      for (var i = front; i <= rear; i++) queue.push(cell[i]);
      return { queue: queue, dequeued: dequeued, overflows: over, underflows: under, wasted: front };
    },
    random: function (level, r) {
      var cap = D.randInt(r, 6, 9);
      var lo = level === 'extreme' ? -500 : 1, hi = level === 'extreme' ? 500 : 60;
      var n = { easy: 12, normal: 15, hard: 20, extreme: 24 }[level];
      var pPush = { easy: 0.75, normal: 0.66, hard: 0.56, extreme: 0.5 }[level];
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
      var CAP = d.cap, W = 64, H = 46, X0 = 70, Y0 = 130;
      var RX = X0 + CAP * W + 46, DEQY = Y0 + 110;
      var front = 0, rear = -1, cell = [], dequeued = [], over = 0, under = 0, enqCount = 0, deqCount = 0;

      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: 'queue', anchor: 'end', size: 15, bold: true });
      for (var i = 0; i < CAP; i++) S.box('h' + i, { x: X0 + i * W, y: Y0, w: 54, h: H, text: '', style: 'empty', size: 16, above: String(i) });
      S.label('durum', { x: RX, y: Y0 - 10, text: 'front = 0 · rear = -1', size: 17, bold: true, mono: true, anchor: 'start' });
      S.label('info', { x: RX, y: Y0 + 18, text: T(d.ops.length + ' işlem', d.ops.length + ' operations'), style: 'dim', size: 14, anchor: 'start' });
      S.label('decision', { x: RX, y: Y0 + 46, text: '', size: 18, bold: true, mono: true, anchor: 'start' });
      S.label('deqlbl', { x: X0 - 16, y: DEQY + H / 2 + 5, text: T('çıkanlar =', 'dequeued ='), anchor: 'end', size: 14, style: 'dim' });

      function clean() {
        for (var k = 0; k < CAP; k++) {
          if (k > rear) S.set('h' + k, { style: 'empty', text: '' });
          else if (k < front) S.set('h' + k, { style: 'dim', text: cell[k] !== undefined ? String(cell[k]) : '' });
          else S.set('h' + k, { style: 'normal', text: cell[k] !== undefined ? String(cell[k]) : '' });
        }
      }
      function point() {
        // front and rear can land on the same cell (exactly one element): draw a single combined
        // pointer instead of two stacked ones, so neither arrow ever crosses the other's label.
        if (front === rear && rear >= 0) {
          if (S.has('pr')) S.remove('pr');
          if (!S.has('pf')) S.pointer('pf', { target: 'h' + front, text: 'front, rear', side: 'bottom', dist: 30, style: 'hl' });
          else S.set('pf', { target: 'h' + front, text: 'front, rear', style: 'hl' });
          return;
        }
        if (front < CAP) { if (!S.has('pf')) S.pointer('pf', { target: 'h' + front, text: 'front', side: 'bottom', dist: 30 }); else S.set('pf', { target: 'h' + front, text: 'front', style: 'active' }); }
        else if (S.has('pf')) S.remove('pf');
        if (rear >= 0) { if (!S.has('pr')) S.pointer('pr', { target: 'h' + rear, text: 'rear', side: 'bottom', dist: 66, style: 'hl' }); else S.set('pr', { target: 'h' + rear, style: 'hl' }); }
        else if (S.has('pr')) S.remove('pr');
      }
      function braces() {
        if (front > 0) {
          if (!S.has('wastedb')) S.brace('wastedb', { from: 'h0', to: 'h' + (front - 1), text: T('kayıp (kayma)', 'wasted (drift)'), side: 'top', dist: 8, style: 'del' });
          else S.set('wastedb', { to: 'h' + (front - 1) });
        } else if (S.has('wastedb')) S.remove('wastedb');
        if (rear >= front) {
          if (!S.has('usedb')) S.brace('usedb', { from: 'h' + front, to: 'h' + rear, text: T('kullanılan', 'used'), side: 'top', dist: 8, style: 'active' });
          else S.set('usedb', { from: 'h' + front, to: 'h' + rear });
        } else if (S.has('usedb')) S.remove('usedb');
        if (rear < CAP - 1) {
          if (!S.has('freeb')) S.brace('freeb', { from: 'h' + (rear + 1), to: 'h' + (CAP - 1), text: T('boş yuvalar', 'free slots'), side: 'top', dist: 8, style: 'dim' });
          else S.set('freeb', { from: 'h' + (rear + 1) });
        } else if (S.has('freeb')) S.remove('freeb');
      }
      function label() { S.set('durum', { text: 'front = ' + front + ' · rear = ' + rear }); }
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      function addDeq(v) {
        var idx = dequeued.length - 1;
        if (idx > 0) S.set('dq' + (idx - 1), { style: 'dim' });
        S.box('dq' + idx, { x: X0 + idx * W, y: DEQY, w: 54, h: H, text: String(v), style: 'new', size: 16 });
      }

      clean(); point(); label(); braces();
      S.step(T('`front`/`rear` diziye bakan iki işaretçi: `front = 0` (henüz kimse çıkmadı), `rear = -1` (henüz kimse eklenmedi). ' +
               '`enqueue` sona ekler, `dequeue` baştan alır — **İlk giren, İlk çıkar (FIFO)**. Sırada ' + d.ops.length + ' işlem var.',
               '`front`/`rear` are two pointers into the array: `front = 0` (nobody has left yet), `rear = -1` (nobody has been added yet). ' +
               '`enqueue` adds at the back, `dequeue` removes from the front — **First In, First Out (FIFO)**. ' + d.ops.length + ' operations follow.'),
             { c: [1, 2, 3], java: [1, 2, 3] });

      d.ops.forEach(function (op, k) {
        decide('', 'normal'); S.at(k);
        if (op !== DEQ) {
          var x = op;
          if (rear === CAP - 1) {
            over++;
            clean();
            for (var w = 0; w < front; w++) S.set('h' + w, { style: 'del' });
            decide('full!', 'del');
            S.step(T('`enqueue(' + x + ')` — `rear == CAP - 1` (' + rear + ' == ' + (CAP - 1) + ') → **taşma (overflow)**' +
                     (front > 0 ? '. Oysa `[0..' + (front - 1) + ']`, yani ' + front + ' hücre, boş duruyor!' : ', dizi gerçekten dolu.') + ' Hiçbir şey yazılmaz.',
                     '`enqueue(' + x + ')` — `rear == CAP - 1` (' + rear + ' == ' + (CAP - 1) + ') → **overflow**' +
                     (front > 0 ? '. Yet `[0..' + (front - 1) + ']`, ' + front + ' cells, sit empty!' : ', the array really is full.') + ' Nothing is written.'),
                   { c: [6, 7], java: [6, 7] });
            if (front > 0) {
              clean(); braces();
              S.step(T('Bu tam da düz dizi tabanlı kuyruğun sorunu: `front` ve `rear` yalnız ileri gider, asla geri dönmez; boşalan hücreler bir daha kullanılamaz.',
                       'This is exactly the plain-array queue\'s problem: `front` and `rear` only ever move forward, never back; freed cells can never be reused.'),
                     { c: [6], java: [6] });
            }
            return;
          }
          enqCount++;
          if (enqCount === 1) {
            S.step(T('`enqueue(' + x + ')` — önce sorulur, `rear` son indise (' + (CAP - 1) + ') eşit mi? `rear` (' + rear + ') değil, yer var.',
                     '`enqueue(' + x + ')` — first we ask, is `rear` at the last index (' + (CAP - 1) + ')? `rear` (' + rear + ') is not, so there is room.'),
                   { c: [6], java: [6] });
            rear++; cell[rear] = x; point(); label(); braces();
            S.set('h' + rear, { style: 'hl' });
            S.step(T('`rear` bir artar ve ' + rear + ' olur: yeni eleman bir sonraki hücreye gidecek.', '`rear` goes up by one, to ' + rear + ': the new element goes into the next cell.'),
                   { c: [8], java: [8] });
            S.set('h' + rear, { text: String(x), style: 'new' });
            S.step(T('`q[' + rear + '] = ' + x + '`. O(1): dizinin başındaki hücrelerle hiç ilgilenmiyoruz, yalnız `rear`\'e bakıyoruz. Sonraki enqueue\'ları hızlı gösteriyoruz.',
                     '`q[' + rear + '] = ' + x + '`. O(1): we never look at the cells near the front, only at `rear`. The next enqueues are shown faster.'),
                   { c: [9], java: [9] });
            return;
          }
          rear++; cell[rear] = x; clean(); point(); label(); braces();
          S.set('h' + rear, { text: String(x), style: 'new' });
          S.step(T('`enqueue(' + x + ')` — yer var → `rear = ' + rear + '`, `q[' + rear + '] = ' + x + '`.',
                   '`enqueue(' + x + ')` — there is room → `rear = ' + rear + '`, `q[' + rear + '] = ' + x + '`.'),
                 { c: [6, 8, 9], java: [6, 8, 9] });
          return;
        }
        if (front > rear) {
          under++;
          clean();
          decide('empty!', 'del');
          S.step(T('`dequeue()` — `front > rear` (' + front + ' > ' + rear + '), çıkaracak eleman yok → **alttan taşma (underflow)**. `false` döner; program çökmez.',
                   '`dequeue()` — `front > rear` (' + front + ' > ' + rear + '), there is nothing to remove → **underflow**. It returns `false`; the program does not crash.'),
                 { c: [14, 15], java: [14, 15] });
          return;
        }
        deqCount++;
        var v = cell[front];
        dequeued.push(v);
        if (deqCount === 1) {
          S.set('h' + front, { style: 'hl' });
          S.step(T('`dequeue()` — kuyruk boş değil (`front <= rear`). Baştaki değer (' + v + ') okunur: **İlk giren, İlk çıkar**.',
                   '`dequeue()` — the queue is not empty (`front <= rear`). The value at the front (' + v + ') is read: **First In, First Out**.'),
                 { c: [14, 16], java: [14, 16] });
          front++; clean(); point(); label(); braces();
          addDeq(v);
          S.step(T('`front` bir artar (' + front + '). ' + v + ' bellekte duruyor ama artık kuyruğun parçası değil; hücresi bir daha hiç kullanılmayacak.',
                   '`front` goes up by one (' + front + '). ' + v + ' is still in memory but no longer part of the queue; its cell will never be used again.'),
                 { c: [17], java: [17] });
          return;
        }
        front++; clean(); point(); label(); braces();
        addDeq(v);
        S.step(T('`dequeue()` → ' + v + '; `front = ' + front + '`.', '`dequeue()` → ' + v + '; `front = ' + front + '`.'), { c: [16, 17], java: [16, 17] });
      });

      clean(); point(); label(); braces(); decide('', 'normal'); S.at(null);
      var queue = [];
      for (var qi = front; qi <= rear; qi++) queue.push(cell[qi]);
      S.result = { queue: queue.map(Number), dequeued: dequeued.map(Number), overflows: over, underflows: under, wasted: front };
      var pct = Math.round(front / CAP * 100);
      S.step(T('Bitti: ' + enqCount + ' enqueue, ' + deqCount + ' dequeue' + (over ? ', ' + over + ' taşma' : '') + (under ? ', ' + under + ' alttan taşma' : '') +
               '. Kuyrukta: ' + (queue.length ? queue.join(', ') : 'hiçbir şey') + '. `front = ' + front + '` — yani ' + front + ' hücre bir daha asla kullanılamayacak (kapasitenin %' + pct + '\'i boşa gitti).',
               'Done: ' + enqCount + ' enqueues, ' + deqCount + ' dequeues' + (over ? ', ' + over + ' overflow' + (over > 1 ? 's' : '') : '') + (under ? ', ' + under + ' underflow' + (under > 1 ? 's' : '') : '') +
               '. In the queue: ' + (queue.length ? queue.join(', ') : 'nothing') + '. `front = ' + front + '` — ' + front + ' cells can never be used again (' + pct + '% of the capacity wasted).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
