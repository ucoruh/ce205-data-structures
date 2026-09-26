/* Week 4 — binary tree: recursive inorder traversal (left, visit, right), with the call path highlighted. */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    'static void inorder(Node *node) {',
    '    if (node == NULL) return;',
    '    inorder(node->left);',
    '    printf("visit %d\\n", node->value);',
    '    visited[visited_count++] = node->value;',
    '    inorder(node->right);',
    '}'
  ];
  var JAVA_CODE = [
    'static void inorder(Node node) {',
    '    if (node == null) return;',
    '    inorder(node.left);',
    '    System.out.println("visit " + node.value);',
    '    visited[visitedCount++] = node.value;',
    '    inorder(node.right);',
    '}'
  ];

  /* ---- tree helpers (local to this file; build() uses these, reference() does not) ---- */
  function isNull(v) { return v === null || v === undefined; }
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
  function ancestorChain(idx) {
    var chain = [idx];
    while (idx > 0) { idx = Math.floor((idx - 1) / 2); chain.push(idx); }
    return chain;
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
  function edgeId(pIdx, cIdx) { return 'e' + pIdx + '_' + cIdx; }
  function drawTree(S, root, pos, edgeIds) {
    (function walk(n) {
      if (!n) return;
      S.circle('n' + n.idx, { x: pos[n.idx].x, y: pos[n.idx].y, text: String(n.val), style: 'normal' });
      if (n.left) { var el = edgeId(n.idx, n.left.idx); S.arrow(el, { from: 'n' + n.idx, to: 'n' + n.left.idx, kind: 'center', head: false, style: 'normal' }); edgeIds.push(el); walk(n.left); }
      if (n.right) { var er = edgeId(n.idx, n.right.idx); S.arrow(er, { from: 'n' + n.idx, to: 'n' + n.right.idx, kind: 'center', head: false, style: 'normal' }); edgeIds.push(er); walk(n.right); }
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
  /** Independent reference: iterative, index-based inorder directly on the array (no Node objects, no recursion). */
  function refInorderIter(arr) {
    var stack = [], result = [], cur = arr.length && arr[0] !== null ? 0 : null;
    function leftOf(i) { var l = 2 * i + 1; return (l < arr.length && arr[l] !== null) ? l : null; }
    function rightOf(i) { var r = 2 * i + 2; return (r < arr.length && arr[r] !== null) ? r : null; }
    while (cur !== null || stack.length) {
      while (cur !== null) { stack.push(cur); cur = leftOf(cur); }
      cur = stack.pop();
      result.push(arr[cur]);
      cur = rightOf(cur);
    }
    return result;
  }

  D.define({
    id: 'inorder-traversal',
    title: T('Inorder dolaşma (özyinelemeli)', 'Inorder traversal (recursive)'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 düğüm, dengeli BST', '10 nodes, a balanced BST'),
        data: { tree: [50, 30, 70, 20, 40, 60, 80, 10, null, null, 45, 55] } },
      { id: 'hard', level: 'hard', name: T('16 düğüm, düzensiz derinlikler', '16 nodes, uneven depths'),
        data: { tree: [44, 22, 77, 11, 33, 60, 90, null, 5, 17, 28, 39, 55, 65, 85, null, null, 95, null, 99] } },
      { id: 'left-skewed', level: 'edge', name: T('Sola yığılmış (degenerate) zincir, 10 düğüm', 'Left-skewed (degenerate) chain, 10 nodes'),
        data: { tree: skewChain(10, 'left', 88, -7) } },
      { id: 'right-skewed', level: 'edge', name: T('Sağa yığılmış (degenerate) zincir, 10 düğüm', 'Right-skewed (degenerate) chain, 10 nodes'),
        data: { tree: skewChain(10, 'right', 5, 8) } },
      { id: 'duplicates', level: 'edge', name: T('Tekrarlı değerler: hepsi 7', 'Duplicate keys: every value is 7'),
        data: { tree: [7, 7, 7, 7, 7, 7, 7, 7, null, null, 7, 7] } },
      { id: 'single', level: 'edge', name: T('Tek düğüm', 'A single node'), data: { tree: [42] }, small: true },
      { id: 'empty', level: 'edge', name: T('Boş ağaç', 'Empty tree'), data: { tree: [] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of real (non-null) nodes. */
    size: function (d) { return d.tree.filter(function (v) { return v !== null; }).length; },
    /** Independent computation, checked against S.result by test.js: iterative, not recursive; index-based, not pointer-based. */
    reference: function (d) { return refInorderIter(d.tree); },
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
        S.label('empty', { x: 60, y: 50, text: T('Boş ağaç: gezilecek düğüm yok.', 'Empty tree: there is nothing to traverse.'), anchor: 'start', size: 16 });
        S.step(T('Ağaç boş (`tree = []`): `inorder(NULL)` doğrudan temel duruma (`base case`) düşer, hiçbir şey ziyaret edilmez.',
                 'The tree is empty (`tree = []`): `inorder(NULL)` hits the base case right away, nothing is visited.'), { c: [1, 2], java: [1, 2] });
        S.result = [];
        return;
      }
      var pos = layout(root), edgeIds = [];
      drawTree(S, root, pos, edgeIds);
      var maxD = maxDepthOf(arr);
      var OY0 = 44 + (maxD + 1) * 84 - 44 + 60, OX0 = 46;
      S.label('lbl', { x: OX0, y: OY0 - 22, text: T('ziyaret sırası (inorder):', 'visit order (inorder):'), anchor: 'start', style: 'dim', size: 14 });
      S.step(T('Inorder dolaşma kuralı: her düğümde önce SOL alt ağacı gez, sonra düğümü ziyaret et, sonra SAĞ alt ağacı gez (kısaca: sol, ziyaret, sağ). `inorder(root)` ile başlıyoruz; etkin (turuncu değil, mavi `active`) kenarlar kökten şu anki çağrıya giden yolu (call path) gösterecek.',
               'Inorder rule: at every node, visit the LEFT subtree, then the node itself, then the RIGHT subtree (short form: left, visit, right). We start with `inorder(root)`; the active (blue) edges will show the call path from the root down to the current call.'),
             { c: [1], java: [1] });

      function setNodeStyle(idx, style) { var id = 'n' + idx; if (S.get(id).style !== 'dim') S.set(id, { style: style }); }
      function clearPath() {
        for (var i = 0; i < arr.length; i++) { if (arr[i] !== null) setNodeStyle(i, 'normal'); }
        edgeIds.forEach(function (id) { if (S.get(id).style !== 'dim') S.set(id, { style: 'normal' }); });
      }
      function highlightPath(idx, curStyle) {
        var chain = ancestorChain(idx);
        for (var k = chain.length - 1; k >= 0; k--) {
          setNodeStyle(chain[k], k === 0 ? curStyle : 'active');
          if (k < chain.length - 1) { var eid = edgeId(chain[k + 1], chain[k]); if (S.has(eid)) S.set(eid, { style: 'active' }); }
        }
      }

      var order = [], boxCount = 0, first = true;
      function outputBox(val) {
        if (boxCount > 0) S.set('o' + (boxCount - 1), { style: 'normal' });
        var col = boxCount % 16, row = Math.floor(boxCount / 16);
        S.box('o' + boxCount, { x: OX0 + col * 46, y: OY0 + row * 50, w: 40, h: 36, text: String(val), style: 'hl', size: 16 });
        boxCount++;
      }

      function inorder(node) {
        if (!node) return;
        inorder(node.left);
        S.at(node.idx);
        clearPath();
        highlightPath(node.idx, 'hl');
        outputBox(node.val);
        order.push(node.val);
        var soFar = order.join(', ');
        if (first) {
          S.step(T('`inorder(' + node.val + ')`: sol alt ağaç bitti (ya da yoktu), şimdi düğümün KENDİSİ ziyaret ediliyor — `printf`/kayıt satırları. Çıkış listesine `' + node.val + '` eklenir: ' + soFar + '.',
                   '`inorder(' + node.val + ')`: the left subtree is done (or was absent), now the node ITSELF is visited — the print/record lines. `' + node.val + '` is appended to the output list: ' + soFar + '.'),
                 { c: [3, 4, 5], java: [3, 4, 5] });
          first = false;
        } else {
          S.step(T('Ziyaret: `' + node.val + '`. Şimdiye kadar: ' + soFar + '.', 'Visit: `' + node.val + '`. So far: ' + soFar + '.'), { c: [4, 5], java: [4, 5] });
        }
        setNodeStyle(node.idx, 'dim');
        inorder(node.right);
      }
      inorder(root);
      S.at(null);
      clearPath();
      arr.forEach(function (v, i) { if (v !== null) S.set('n' + i, { style: 'normal' }); });
      S.result = order;
      S.step(T('Bitti. Tam inorder sırası: ' + order.join(', ') + '. Ağacın her düğümü tam bir kez ziyaret edilir: O(n).',
               'Done. Full inorder sequence: ' + order.join(', ') + '. Every node of the tree is visited exactly once: O(n).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
