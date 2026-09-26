/* Week 3 — linked-list queue: enqueue and dequeue, with >= 10-node examples (front/rear pointers, no capacity limit). */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct QNode { int data; struct QNode *next; } QNode;',
    'QNode *front = NULL, *rear = NULL;    /* empty queue */',
    '',
    'void enqueue(int x) {',
    '    QNode *n = malloc(sizeof(QNode));',
    '    n->data = x; n->next = NULL;',
    '    if (rear == NULL) front = rear = n;   /* first node */',
    '    else { rear->next = n; rear = n; }',
    '}',
    '',
    'bool dequeue(int *out) {',
    '    if (front == NULL) return false;    /* underflow */',
    '    QNode *tmp = front;',
    '    *out = tmp->data;',
    '    front = front->next;',
    '    if (front == NULL) rear = NULL;     /* became empty */',
    '    free(tmp);',
    '    return true;',
    '}'
  ];
  var JAVA = [
    'class QNode { int data; QNode next; }',
    'QNode front = null, rear = null;      // empty queue',
    '',
    'void enqueue(int x) {',
    '    QNode n = new QNode();',
    '    n.data = x; n.next = null;',
    '    if (rear == null) front = rear = n;   // first node',
    '    else { rear.next = n; rear = n; }',
    '}',
    '',
    'Integer dequeue() {',
    '    if (front == null) return null;    // underflow',
    '    QNode tmp = front;',
    '    int out = tmp.data;',
    '    front = front.next;',
    '    if (front == null) rear = null;     // became empty',
    '    // the garbage collector frees tmp',
    '    return out;',
    '}'
  ];
  var DEQ = 'dq';
  var ROWCAP = 8, DX = 100, ROWH = 150, X0 = 110, Y0 = 150;

  D.define({
    id: 'linked-queue',
    title: T('Bağlı liste ile kuyruk: enqueue ve dequeue', 'Linked-list queue: enqueue and dequeue'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('12 enqueue, aralarda 3 dequeue', '12 enqueues, 3 dequeues along the way'),
        data: { ops: [15, 23, 8, 42, 19, DEQ, 31, 7, 56, DEQ, 12, 44, DEQ, 9, 27] } },
      { id: 'mixed', level: 'hard', name: T('17 enqueue, 3 dequeue: iki satıra yayılan 14 düğüm', '17 enqueues, 3 dequeues: 14 nodes spread over two rows'),
        data: { ops: [5, 12, 33, 8, 19, DEQ, 27, 41, 3, 55, 16, DEQ, 38, 9, 22, 47, 14, DEQ, 6, 29] } },
      { id: 'dequeue-first', level: 'edge', name: T('Önce boş kuyruktan dequeue, sonra 10 enqueue', 'Dequeue on an empty queue first, then 10 enqueues'),
        data: { ops: [DEQ, DEQ, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, DEQ, DEQ] } },
      { id: 'drain-to-empty', level: 'edge', name: T('Tamamen boşalt: rear da NULL olur, sonra yeniden başlar', 'Drain to empty: rear becomes NULL too, then it restarts'),
        data: { ops: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, DEQ, DEQ, DEQ, DEQ, DEQ, DEQ, DEQ, DEQ, DEQ, DEQ, 999] } },
      { id: 'single-node-churn', level: 'edge', name: T('Tek düğümlü döngü: her seferinde front = rear', 'Single-node cycles: front = rear every time'),
        data: { ops: [1, DEQ, 2, DEQ, 3, DEQ, 4, DEQ, 5, DEQ, 6, DEQ, 7, DEQ, 8, DEQ, 9, DEQ, 10, DEQ] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of values the program tried to enqueue — every example must have at least 10. */
    size: function (d) { return d.ops.filter(function (o) { return o !== DEQ; }).length; },
    /** Independent computation of the expected outcome (checked against S.result by test.js). */
    reference: function (d) {
      var list = [], dequeued = [], under = 0;
      d.ops.forEach(function (o) {
        if (o === DEQ) { if (list.length) dequeued.push(list.shift()); else under++; }
        else list.push(o);
      });
      return { queue: list, dequeued: dequeued, underflows: under };
    },
    random: function (level, r) {
      var n = { easy: 14, normal: 16, hard: 20, extreme: 24 }[level];
      var lo = level === 'extreme' ? -500 : 1, hi = level === 'extreme' ? 500 : 99;
      var pDeq = { easy: 0.25, normal: 0.3, hard: 0.35, extreme: 0.4 }[level];
      var list = [], enqueues = 0, i;
      for (i = 0; i < n; i++) {
        var remaining = n - i;
        var mustEnqueue = enqueues < 10 && remaining <= 10 - enqueues;
        if (!mustEnqueue && r() < pDeq) list.push(DEQ);
        else { list.push(D.randInt(r, lo, hi)); enqueues++; }
      }
      return { ops: list };
    },
    input: {
      hint: T('Örnek: 10 20 30 dq 40 dq dq 50   (sayı = enqueue, dq ya da - = dequeue)',
              'Example: 10 20 30 dq 40 dq dq 50   (number = enqueue, dq or - = dequeue)'),
      parse: function (text) {
        var list = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (/^(dq|-)$/i.test(tok)) { list.push(DEQ); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı ya da dq (veya -) yazın.', '"' + tok + '" is not understood: write a number or dq (or -).');
          list.push(parseInt(tok, 10));
        });
        if (!list.length) throw T('En az bir işlem yazın.', 'Write at least one operation.');
        if (list.length > 40) throw T('En çok 40 işlem.', 'At most 40 operations.');
        return { ops: list };
      },
      format: function (d) { return d.ops.join(' '); },
      bad: ['', '5 x 7', '3.5 dq', '   ', 'enqueue 5']
    },
    build: function (S, d) {
      var live = [], vals = [], seq = 0, enq = 0, deq = 0, under = 0, dequeued = [];

      S.label('anchor', { x: X0 - 70, y: Y0 + 20, text: 'NULL', style: 'dim', size: 15, mono: true });
      S.pointer('front', { target: 'anchor', text: 'front', side: 'bottom', dist: 26 });
      S.pointer('rear', { target: 'anchor', text: 'rear', side: 'top', dist: 26 });
      var LX = X0 + ROWCAP * DX + 60;
      S.label('info', { x: LX, y: 40, text: T('boş kuyruk: front = rear = NULL', 'empty queue: front = rear = NULL'), style: 'dim', size: 16, anchor: 'start' });
      S.label('ops', { x: LX, y: 66, text: T(d.ops.length + ' işlem', d.ops.length + ' operations'), style: 'dim', size: 14, anchor: 'start' });
      S.label('decision', { x: LX, y: 94, text: '', bold: true, size: 17, mono: true, anchor: 'start' });
      var DEQX0 = LX, DEQY0 = 140, DEQW = 46, DEQROWCAP = 4;
      S.label('deqlbl', { x: DEQX0, y: DEQY0 - 16, text: T('çıkanlar =', 'dequeued ='), anchor: 'start', style: 'dim', size: 14 });
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      function addDeq(v) {
        var idx = dequeued.length - 1, row = Math.floor(idx / DEQROWCAP), col = idx % DEQROWCAP;
        if (idx > 0) S.set('dq' + (idx - 1), { style: 'dim' });
        S.box('dq' + idx, { x: DEQX0 + col * DEQW, y: DEQY0 + row * 40, w: 40, h: 34, text: String(v), style: 'new', size: 15 });
      }
      S.step(T('Bağlı kuyrukta iki işaretçi tutarız: `front` (çıkış ucu, kaldırma) ve `rear` (giriş ucu, ekleme). Başlangıçta ikisi de `NULL`; sırada ' + d.ops.length + ' işlem var.',
               'A linked queue keeps two pointers: `front` (removal end) and `rear` (insertion end). Both start as `NULL`; ' + d.ops.length + ' operations follow.'),
             { c: [1, 2], java: [1, 2] });

      function clean() { live.forEach(function (id) { S.set(id, { style: 'normal' }); }); }
      function relayout() {
        for (var i = 0; i < live.length; i++) {
          var row = Math.floor(i / ROWCAP), col = i % ROWCAP;
          S.move(live[i], X0 + col * DX, Y0 + row * ROWH);
        }
      }
      function pointFR() {
        S.set('front', { target: live.length ? live[0] : 'anchor' });
        S.set('rear', { target: live.length ? live[live.length - 1] : 'anchor' });
      }
      function count() {
        S.set('info', { text: live.length ? T(live.length + ' düğüm', live.length + ' node' + (live.length > 1 ? 's' : '')) : T('boş kuyruk: front = rear = NULL', 'empty queue: front = rear = NULL') });
      }

      d.ops.forEach(function (op, k) {
        clean(); decide('', 'normal'); S.at(k);
        if (op !== DEQ) {
          enq++;
          var wasEmpty = live.length === 0;
          var prevId = wasEmpty ? null : live[live.length - 1];
          var id = 'n' + (seq++);
          S.node(id, { x: X0, y: Y0, value: op, style: 'new', isNull: true });
          live.push(id); vals.push(op);

          if (enq === 1) {
            S.step(T('`enqueue(' + op + ')` — `malloc(sizeof(QNode))` yeni bir düğüm ayırır; `n->data = ' + op + '`, `n->next = NULL`.',
                     '`enqueue(' + op + ')` — `malloc(sizeof(QNode))` allocates a new node; `n->data = ' + op + '`, `n->next = NULL`.'),
                   { c: [5, 6], java: [5, 6] });
            relayout(); pointFR(); count();
            S.step(T('Kuyruk boştu (`rear == NULL`), bu yüzden `front = rear = n`: tek eleman varken iki işaretçi de aynı düğümü gösterir.',
                     'The queue was empty (`rear == NULL`), so `front = rear = n`: with a single element, both pointers point to the same node.'),
                   { c: 7, java: 7 });
            S.set(id, { style: 'normal' });
          } else if (wasEmpty) {
            relayout(); pointFR(); count();
            S.set(id, { style: 'normal' });
            S.step(T('`enqueue(' + op + ')` — kuyruk yine boştu, bu yüzden bu yeni düğüm hem `front` hem `rear`.',
                     '`enqueue(' + op + ')` — the queue was empty again, so this new node is both `front` and `rear`.'),
                   { c: 7, java: 7 });
          } else {
            S.set(prevId, { isNull: false, style: 'hl' });
            S.arrow('arw' + prevId, { from: prevId, to: id, kind: 'next', style: 'new' });
            relayout(); pointFR(); count();
            S.set(id, { style: 'normal' }); S.set(prevId, { style: 'normal' });
            S.step(T('`enqueue(' + op + ')` — `rear->next = n`, `rear = n` — listeyi baştan gezmeden sona eklenir: O(1).',
                     '`enqueue(' + op + ')` — `rear->next = n`, `rear = n` — added at the end without walking the list: O(1).'),
                   { c: [6, 8], java: [6, 8] });
          }
          return;
        }

        deq++;
        if (live.length === 0) {
          under++;
          S.set('front', { style: 'del' }); S.set('rear', { style: 'del' });
          decide('empty!', 'del');
          S.step(T('`dequeue()` — `front == NULL`, çıkaracak eleman yok → **alttan taşma (underflow)**. `false` döner; program çökmez.',
                   '`dequeue()` — `front == NULL`, there is nothing to remove → **underflow**. It returns `false`; the program does not crash.'),
                 { c: 11, java: 11 });
          S.set('front', { style: 'active' }); S.set('rear', { style: 'active' });
          return;
        }

        var frontId = live[0], v = vals[0], wasLast = live.length === 1;
        if (deq === 1) {
          S.set(frontId, { style: 'hl' });
          S.step(T('`dequeue()` — `tmp = front` öndeki düğümü tutar; `*out = tmp->data` (' + v + ') okunur — yalnız öne erişebiliriz, **İlk giren İlk çıkar (FIFO)**.',
                   '`dequeue()` — `tmp = front` holds the front node; `*out = tmp->data` (' + v + ') is read — we can only reach the front, **First In, First Out (FIFO)**.'),
                 { c: [12, 13], java: [12, 13] });
          live.shift(); vals.shift(); dequeued.push(v);
          S.remove(frontId, 'arw' + frontId);
          relayout(); pointFR(); count();
          addDeq(v);
          S.step(T('`front = front->next`: çıkış ucu bir sonraki düğüme geçer.',
                   '`front = front->next`: the front moves to the next node.'),
                 { c: 14, java: 14 });
          if (wasLast) {
            S.step(T('`if (front == NULL) rear = NULL;`: kuyruk tamamen boşaldı, bu yüzden `rear` da `NULL` yapılır — unutulursa klasik bir hataya yol açar.',
                     '`if (front == NULL) rear = NULL;`: the queue became completely empty, so `rear` is also set to `NULL` — forgetting this is a classic bug.'),
                   { c: 15, java: 15 });
          } else {
            S.step(T('`free(tmp)`: eski düğümün belleği geri verilir. Her işlem O(1): tek elemanlı da olsa bin elemanlı da olsa aynı üç adım.',
                     '`free(tmp)`: the old node\'s memory is released. Every operation is O(1): the same three steps whether there is one element or a thousand.'),
                   { c: 16, java: 16 });
          }
        } else {
          S.set(frontId, { style: 'dim' });
          live.shift(); vals.shift(); dequeued.push(v);
          S.remove(frontId, 'arw' + frontId);
          relayout(); pointFR(); count();
          addDeq(v);
          S.step(T('`dequeue()` → ' + v + '; `front` bir sonraki düğüme geçer, `tmp` serbest bırakılır.',
                   '`dequeue()` → ' + v + '; `front` moves to the next node, `tmp` is freed.'),
                 { c: [12, 13, 14, 16], java: [12, 13, 14, 16] });
          if (wasLast) {
            S.step(T('Son düğüm de çıktı: `front == NULL`, bu yüzden `if (front == NULL) rear = NULL;` de çalışır — `rear` da `NULL` olur.',
                     'Even the last node is gone: `front == NULL`, so `if (front == NULL) rear = NULL;` also runs — `rear` becomes `NULL` too.'),
                   { c: 15, java: 15 });
          }
        }
      });
      clean(); decide('', 'normal'); S.at(null);
      S.result = { queue: vals.slice(), dequeued: dequeued, underflows: under };
      S.step(T('Bitti: ' + enq + ' enqueue, ' + deq + ' dequeue çağrısı' + (under ? ', ' + under + ' alttan taşma' : '') +
               '. Kuyrukta (front → rear): ' + (vals.length ? vals.join(', ') : 'hiçbir şey') + '. İki işaretçi sayesinde her işlem O(1); kapasite sınırı yok.',
               'Done: ' + enq + ' enqueue call' + (enq === 1 ? '' : 's') + ', ' + deq + ' dequeue call' + (deq === 1 ? '' : 's') +
               (under ? ', ' + under + ' underflow' + (under > 1 ? 's' : '') : '') +
               '. Queue (front → rear): ' + (vals.length ? vals.join(', ') : 'nothing') + '. Thanks to the two pointers every operation is O(1); there is no capacity limit.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
