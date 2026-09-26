/* Week 4 — binary tree: level-order (breadth-first) traversal with an explicit queue. */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    'static void enqueue(Node *n) {',
    '    rear = (rear + 1) % QUEUE_CAP;',
    '    queue_data[rear] = n;',
    '    count++;',
    '}',
    '',
    'static Node *dequeue(void) {',
    '    Node *n = queue_data[front];',
    '    front = (front + 1) % QUEUE_CAP;',
    '    count--;',
    '    return n;',
    '}',
    '',
    'enqueue(root);',
    'while (!is_empty()) {',
    '    Node *cur = dequeue();',
    '    printf("visit %d\\n", cur->value);',
    '    visited[visited_count++] = cur->value;',
    '    if (cur->left != NULL) enqueue(cur->left);',
    '    if (cur->right != NULL) enqueue(cur->right);',
    '}'
  ];
  var JAVA_CODE = [
    'static void enqueue(Node n) {',
    '    rear = (rear + 1) % QUEUE_CAP;',
    '    queueData[rear] = n;',
    '    count++;',
    '}',
    '',
    'static Node dequeue() {',
    '    Node n = queueData[front];',
    '    front = (front + 1) % QUEUE_CAP;',
    '    count--;',
    '    return n;',
    '}',
    '',
    'enqueue(root);',
    'while (!isEmpty()) {',
    '    Node cur = dequeue();',
    '    System.out.println("visit " + cur.value);',
    '    visited[visitedCount++] = cur.value;',
    '    if (cur.left != null) enqueue(cur.left);',
    '    if (cur.right != null) enqueue(cur.right);',
    '}'
  ];
  var LINES_ENQ_ROOT = { c: [14], java: [14] };
  var LINES_STEP = { c: [16, 17, 18, 19, 20], java: [16, 17, 18, 19, 20] };

  /* ---- tree helpers (local to this file; build() uses these, reference() does not) ---- */
  function buildTree(arr) {
    var nodes = arr.map(function (v, i) { return (v === null || v === undefined) ? null : { val: v, idx: i, left: null, right: null }; });
    nodes.forEach(function (n, i) {
      if (!n) return;
      var li = 2 * i + 1, ri = 2 * i + 2;
      n.left = li < nodes.length ? nodes[li] : null;
      n.right = ri < nodes.length ? nodes[ri] : null;
    });
    return nodes.length ? nodes[0] : null;
  }
  function maxDepthOf(arr) {
    var md = 0;
    for (var i = 0; i < arr.length; i++) if (arr[i] !== null) md = Math.max(md, Math.floor(Math.log2(i + 1)));
    return md;
  }
  function layout(root) {
    var pos = {}, i = 0, DX = 58, DY = 84, X0 = 46, Y0 = 44;
    (function walk(n, depth) {
      if (!n) return;
      walk(n.left, depth + 1);
      pos[n.idx] = { x: X0 + i * DX, y: Y0 + depth * DY };
      i++;
      walk(n.right, depth + 1);
    })(root, 0);
    return pos;
  }
  function drawTree(S, root, pos) {
    (function walk(n) {
      if (!n) return;
      S.circle('n' + n.idx, { x: pos[n.idx].x, y: pos[n.idx].y, text: String(n.val), style: 'normal' });
      if (n.left) { S.arrow('e' + n.idx + '_' + n.left.idx, { from: 'n' + n.idx, to: 'n' + n.left.idx, kind: 'center', head: false, style: 'normal' }); walk(n.left); }
      if (n.right) { S.arrow('e' + n.idx + '_' + n.right.idx, { from: 'n' + n.idx, to: 'n' + n.right.idx, kind: 'center', head: false, style: 'normal' }); walk(n.right); }
    })(root);
  }
  /** Generate a genuinely degenerate (single-child) chain: every node has only one child, in direction `dir`. */
  function skewChain(n, dir, start, step) {
    var real = [], idx = 0;
    for (var i = 0; i < n; i++) { real.push(idx); idx = dir === 'left' ? 2 * idx + 1 : 2 * idx + 2; }
    var arr = [];
    for (var k = 0; k <= real[real.length - 1]; k++) arr.push(null);
    for (var i2 = 0; i2 < n; i2++) arr[real[i2]] = start + i2 * step;
    return arr;
  }
  /** Random but always-valid tree with exactly n real nodes: fill a perfect tree, then prune random leaves. */
  function randomTree(r, n, lo, hi) {
    var cap = 1;
    while (cap < n) cap = cap * 2 + 1;
    var arr = [];
    for (var i = 0; i < cap; i++) arr[i] = D.randInt(r, lo, hi);
    var toRemove = cap - n, removed = 0;
    while (removed < toRemove) {
      var leaves = [];
      for (var i2 = arr.length - 1; i2 >= 1; i2--) {
        if (arr[i2] === null) continue;
        var li = 2 * i2 + 1, ri = 2 * i2 + 2;
        var hasChild = (li < arr.length && arr[li] !== null) || (ri < arr.length && arr[ri] !== null);
        if (!hasChild) leaves.push(i2);
      }
      if (!leaves.length) break;
      arr[leaves[Math.floor(r() * leaves.length)]] = null;
      removed++;
    }
    while (arr.length && arr[arr.length - 1] === null) arr.pop();
    return arr;
  }

  D.define({
    id: 'level-order-traversal',
    title: T('Seviye sıralı (level-order / BFS) dolaşma', 'Level-order (BFS) traversal'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 düğüm, dengeli BST', '10 nodes, a balanced BST'),
        data: { tree: [50, 30, 70, 20, 40, 60, 80, 10, null, null, 45, 55] } },
      { id: 'hard', level: 'hard', name: T('16 düğüm, düzensiz derinlikler', '16 nodes, uneven depths'),
        data: { tree: [44, 22, 77, 11, 33, 60, 90, null, 5, 17, 28, 39, 55, 65, 85, null, null, 95, null, 99] } },
      { id: 'left-skewed', level: 'edge', name: T('Sola yığılmış (degenerate) zincir: kuyruk hep tek elemanlı, 10 düğüm', 'Left-skewed (degenerate) chain: the queue always holds one item, 10 nodes'),
        data: { tree: skewChain(10, 'left', 88, -7) } },
      { id: 'right-skewed', level: 'edge', name: T('Sağa yığılmış (degenerate) zincir, 10 düğüm', 'Right-skewed (degenerate) chain, 10 nodes'),
        data: { tree: skewChain(10, 'right', 5, 8) } },
      { id: 'single', level: 'edge', name: T('Tek düğüm', 'A single node'), data: { tree: [42] }, small: true },
      { id: 'empty', level: 'edge', name: T('Boş ağaç', 'Empty tree'), data: { tree: [] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of real (non-null) nodes. */
    size: function (d) { return d.tree.filter(function (v) { return v !== null; }).length; },
    /** Independent computation, checked against S.result by test.js: this array format IS already stored in
     *  level order by construction, so filtering out the nulls in index order gives the level-order sequence
     *  directly — no queue simulation at all, a completely different technique from build()'s explicit queue. */
    reference: function (d) { return d.tree.filter(function (v) { return v !== null; }); },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level] || 12;
      var lo = level === 'extreme' ? -999 : (level === 'hard' ? -50 : 1);
      var hi = level === 'extreme' ? 999 : (level === 'hard' ? 150 : 99);
      return { tree: randomTree(r, n, lo, hi) };
    },
    input: {
      hint: T('Örnek: 50 30 70 20 40 60 80 10 null null 45   (seviye sıralı liste; eksik çocuk için null, boş ağaç için "empty")',
              'Example: 50 30 70 20 40 60 80 10 null null 45   (level-order list; null for a missing child, "empty" for no tree)'),
      parse: function (text) {
        var s = String(text).trim();
        if (/^(empty|boş)$/i.test(s)) return { tree: [] };
        var toks = s.split(/[\s,;]+/).filter(Boolean);
        if (!toks.length) throw T('En az bir değer ya da "empty" yazın.', 'Write at least one value or "empty".');
        var arr = toks.map(function (tok) {
          if (/^(null|-)$/i.test(tok)) return null;
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: bir tamsayı ya da null yazın.', '"' + tok + '" is not understood: write an integer or null.');
          return parseInt(tok, 10);
        });
        while (arr.length && arr[arr.length - 1] === null) arr.pop();
        if (!arr.length) throw T('En az bir gerçek düğüm gerekir (ya da "empty" yazın).', 'At least one real node is required (or write "empty").');
        for (var i = 1; i < arr.length; i++) {
          if (arr[i] !== null) {
            var p = Math.floor((i - 1) / 2);
            if (arr[p] === null) throw T('İndis ' + i + ' bir düğüm ama ebeveyni (indis ' + p + ') null: geçersiz ağaç.',
                                          'Index ' + i + ' has a node but its parent (index ' + p + ') is null: not a valid tree.');
          }
        }
        return { tree: arr };
      },
      format: function (d) { return d.tree.length ? d.tree.map(function (v) { return v === null ? 'null' : String(v); }).join(' ') : 'empty'; },
      bad: ['', '5 x 7', '5 null null 3', '3.5', 'null']
    },
    build: function (S, d) {
      var arr = d.tree;
      var root = buildTree(arr);
      if (!root) {
        S.label('empty', { x: 60, y: 50, text: T('Boş ağaç: kuyruğa hiçbir şey konmaz.', 'Empty tree: nothing is ever enqueued.'), anchor: 'start', size: 16 });
        S.step(T('Ağaç boş (`tree = []`): `enqueue(root)` bile çağrılmaz (kök yok), `is_empty()` baştan doğru.',
                 'The tree is empty (`tree = []`): `enqueue(root)` is never even called (there is no root), `is_empty()` is true from the start.'), { c: [14, 15], java: [14, 15] });
        S.result = [];
        return;
      }
      var pos = layout(root);
      drawTree(S, root, pos);
      var maxD = maxDepthOf(arr), cap = arr.filter(function (v) { return v !== null; }).length;
      var maxX = 0;
      for (var k in pos) maxX = Math.max(maxX, pos[k].x);
      var QX0 = maxX + 130, QY0 = 44, QCOLS = 6;
      var OY0 = 44 + (maxD + 1) * 84 - 44 + 60, OX0 = 46;
      S.region('qf', { x: QX0 - 14, y: QY0 - 26, w: QCOLS * 66 + 20, h: Math.ceil(cap / QCOLS) * 46 + 40, title: T('kuyruk (queue)', 'queue') });
      for (var qi = 0; qi < cap; qi++) {
        var qc = qi % QCOLS, qr = Math.floor(qi / QCOLS);
        S.box('q' + qi, { x: QX0 + qc * 66, y: QY0 + qr * 46, w: 58, h: 38, text: '', style: 'empty', size: 15 });
      }
      S.label('lbl', { x: OX0, y: OY0 - 22, text: T('ziyaret sırası (level-order):', 'visit order (level-order):'), anchor: 'start', style: 'dim', size: 14 });

      function updateQueue(q) {
        for (var i = 0; i < cap; i++) {
          if (i < q.length) S.set('q' + i, { text: String(q[i].val), style: 'active' });
          else S.set('q' + i, { text: '', style: 'empty' });
        }
      }

      var queue = [root];
      S.set('n' + root.idx, { style: 'active' });
      updateQueue(queue);
      S.step(T('Seviye sıralı (level-order) dolaşma ağacı katman katman gezer: önce kök, sonra 1. seviye, sonra 2. seviye... Bunun için yığın değil bir KUYRUK (queue, FIFO — ilk giren ilk çıkar) gerekir. `enqueue(root)`: kuyruğa önce kökü (`' + root.val + '`) koyarız.',
               'Level-order traversal walks the tree layer by layer: root first, then depth 1, then depth 2... This needs a QUEUE, not a stack (FIFO — first in, first out). `enqueue(root)`: we first enqueue the root (`' + root.val + '`).'),
             LINES_ENQ_ROOT);

      var order = [], boxCount = 0, first = true;
      function outputBox(val) {
        if (boxCount > 0) S.set('o' + (boxCount - 1), { style: 'normal' });
        var col = boxCount % 16, row = Math.floor(boxCount / 16);
        S.box('o' + boxCount, { x: OX0 + col * 46, y: OY0 + row * 50, w: 40, h: 36, text: String(val), style: 'hl', size: 16 });
        boxCount++;
      }

      while (queue.length) {
        var cur = queue.shift();
        S.at(cur.idx);
        S.set('n' + cur.idx, { style: 'hl' });
        outputBox(cur.val);
        order.push(cur.val);
        var kids = [];
        if (cur.left) { queue.push(cur.left); kids.push(cur.left.val); S.set('n' + cur.left.idx, { style: 'active' }); }
        if (cur.right) { queue.push(cur.right); kids.push(cur.right.val); S.set('n' + cur.right.idx, { style: 'active' }); }
        updateQueue(queue);
        var soFar = order.join(', ');
        if (first) {
          S.step(T('`dequeue()` -> `' + cur.val + '`; ziyaret edilir (çıkış listesi: ' + soFar + '). Çocukları varsa kuyruğa eklenir (`enqueue`): ' + (kids.length ? kids.join(', ') : T('yok, bu bir yaprak', 'none, this is a leaf').tr) + '.',
                   '`dequeue()` -> `' + cur.val + '`; it is visited (output list: ' + soFar + '). Its children, if any, are enqueued: ' + (kids.length ? kids.join(', ') : 'none, this is a leaf') + '.'), LINES_STEP);
          first = false;
        } else if (kids.length) {
          S.step(T('`dequeue()` -> `' + cur.val + '`; ziyaret edilir, çocukları (' + kids.join(', ') + ') kuyruğa eklenir. Şimdiye kadar: ' + soFar + '.',
                   '`dequeue()` -> `' + cur.val + '`; it is visited, its children (' + kids.join(', ') + ') are enqueued. So far: ' + soFar + '.'), LINES_STEP);
        } else {
          S.step(T('`dequeue()` -> `' + cur.val + '`; ziyaret edilir. Yaprak olduğu için kuyruğa hiçbir şey eklenmez. Şimdiye kadar: ' + soFar + '.',
                   '`dequeue()` -> `' + cur.val + '`; it is visited. It is a leaf, so nothing is enqueued. So far: ' + soFar + '.'), LINES_STEP);
        }
        S.set('n' + cur.idx, { style: 'dim' });
      }
      S.at(null);
      arr.forEach(function (v, i) { if (v !== null) S.set('n' + i, { style: 'normal' }); });
      S.result = order;
      S.step(T('Kuyruk boş, bitti. Tam sıra: ' + order.join(', ') + ' — her seviyeyi soldan sağa tamamladıktan sonra bir alt seviyeye geçtik.',
               'The queue is empty, done. Full sequence: ' + order.join(', ') + ' — we finished each level left to right before moving one level down.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
