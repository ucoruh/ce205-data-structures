/* Week 11 — AVL tree: insert, with the balance factor bf = height(left) - height(right) shown on every node.
 * Each key is placed as a plain BST leaf, heights are refreshed on the path back to the root, and the first
 * node whose |bf| > 1 (if any) is rotated back into shape (see avl-rotations.js for the four named cases in
 * isolation). Duplicates are ignored. Data: {keys: [...]}. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'Node *avl_insert(Node *root, int key) {',
    '    if (root == NULL) return make_leaf(key);',
    '    if (key == root->key) return root;                 /* duplicate: unchanged */',
    '    if (key < root->key) root->left  = avl_insert(root->left, key);',
    '    else                  root->right = avl_insert(root->right, key);',
    '    update_height(root);',
    '    return rebalance(root);',
    '}',
    '',
    'Node *rebalance(Node *n) {',
    '    int bf = height(n->left) - height(n->right);',
    '    if (bf > 1  && height(n->left->left)  >= height(n->left->right))  return rotate_right(n);',
    '    if (bf > 1)  { n->left  = rotate_left(n->left);   return rotate_right(n); }',
    '    if (bf < -1 && height(n->right->right) >= height(n->right->left)) return rotate_left(n);',
    '    if (bf < -1) { n->right = rotate_right(n->right); return rotate_left(n); }',
    '    return n;',
    '}'
  ];
  var JAVA = [
    'static Node avlInsert(Node root, int key) {',
    '    if (root == null) return makeLeaf(key);',
    '    if (key == root.key) return root;                  // duplicate: unchanged',
    '    if (key < root.key) root.left  = avlInsert(root.left, key);',
    '    else                 root.right = avlInsert(root.right, key);',
    '    updateHeight(root);',
    '    return rebalance(root);',
    '}',
    '',
    'static Node rebalance(Node n) {',
    '    int bf = height(n.left) - height(n.right);',
    '    if (bf > 1  && height(n.left.left)  >= height(n.left.right))  return rotateRight(n);',
    '    if (bf > 1)  { n.left  = rotateLeft(n.left);   return rotateRight(n); }',
    '    if (bf < -1 && height(n.right.right) >= height(n.right.left)) return rotateLeft(n);',
    '    if (bf < -1) { n.right = rotateRight(n.right); return rotateLeft(n); }',
    '    return n;',
    '}'
  ];

  var X0 = 60, Y0 = 60, DX = 46, DY = 66;
  function layoutTree(root) {
    var pos = {}, i = 0;
    (function walk(n, depth) { if (!n) return; walk(n.left, depth + 1); pos[n.nid] = { x: X0 + i * DX, y: Y0 + depth * DY }; i++; walk(n.right, depth + 1); })(root, 0);
    return pos;
  }
  function syncTree(S, root, pos, tracked, styleOf, hOf) {
    var seen = {};
    (function walk(n) {
      if (!n) return;
      var cid = 'n' + n.nid; seen[cid] = 1;
      S.circle(cid, { x: pos[n.nid].x, y: pos[n.nid].y, r: 17, text: String(n.key), style: styleOf ? styleOf(n) : 'normal' });
      var aid = 'a' + n.nid; seen[aid] = 1;
      var b = hOf(n.left) - hOf(n.right);
      S.label(aid, { x: pos[n.nid].x + 14, y: pos[n.nid].y - 14, text: (b > 0 ? '+' : '') + b, size: 10, anchor: 'start', bold: true, style: Math.abs(b) > 1 ? 'del' : 'dim' });
      if (n.left) { var el = 'e' + n.nid + 'l'; seen[el] = 1; S.arrow(el, { from: cid, to: 'n' + n.left.nid, kind: 'center', head: false }); walk(n.left); }
      if (n.right) { var er = 'e' + n.nid + 'r'; seen[er] = 1; S.arrow(er, { from: cid, to: 'n' + n.right.nid, kind: 'center', head: false }); walk(n.right); }
    })(root);
    for (var id in tracked) if (!seen[id] && S.has(id)) S.remove(id);
    return seen;
  }
  function toStruct(n, hOf) { return n ? { k: n.key, bf: hOf(n.left) - hOf(n.right), l: toStruct(n.left, hOf), r: toStruct(n.right, hOf) } : null; }

  D.define({
    id: 'avl-insert',
    title: T('AVL ağacı: ekleme, düğümlerde denge çarpanı (balance factor)', 'AVL tree: insert, with balance factors on the nodes'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 anahtar, iki çift döndürme (LR, RL) içerir', '10 keys, includes two double rotations (LR, RL)'),
        data: { keys: [6, 74, 51, 56, 26, 66, 98, 2, 9, 72] } },
      { id: 'hard', level: 'hard', name: T('14 anahtar, negatif değerler, dört durumun (LL/RR/LR/RL) hepsi görülür', '14 keys with negative values, all four cases (LL/RR/LR/RL) occur'),
        data: { keys: [71, 5, 59, 157, 87, 56, 131, 141, -44, 159, -14, -18, 158, -48] } },
      { id: 'edge-ascending', level: 'edge', name: T('Uç durum: artan sırada 10 anahtar — AVL yine de dengeli kalır', 'Edge case: 10 keys in ascending order — AVL still stays balanced'),
        data: { keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
      { id: 'edge-descending', level: 'edge', name: T('Uç durum: azalan sırada 10 anahtar', 'Edge case: 10 keys in descending order'),
        data: { keys: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10] } },
      { id: 'edge-duplicates', level: 'edge', name: T('Uç durum: 10 değer, çok sayıda yinelenen', 'Edge case: 10 values, many repeats'),
        data: { keys: [8, 8, 3, 8, 15, 3, 20, 3, 15, 8] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    /** Independent AVL insert: the classic recursive form comparing the new key against the child's key
     *  (build() instead compares the child's own stored balance factor — a different decision rule). */
    reference: function (d) {
      function h(n) { return n ? n.h : -1; }
      function upd(n) { n.h = 1 + Math.max(h(n.l), h(n.r)); }
      function rotR(y) { var x = y.l; y.l = x.r; x.r = y; upd(y); upd(x); return x; }
      function rotL(x) { var y = x.r; x.r = y.l; y.l = x; upd(x); upd(y); return y; }
      function ins(node, key) {
        if (!node) return { k: key, l: null, r: null, h: 0 };
        if (key === node.k) return node;
        if (key < node.k) node.l = ins(node.l, key); else node.r = ins(node.r, key);
        upd(node);
        var bf = h(node.l) - h(node.r);
        if (bf > 1 && key < node.l.k) return rotR(node);
        if (bf > 1) { node.l = rotL(node.l); return rotR(node); }
        if (bf < -1 && key > node.r.k) return rotL(node);
        if (bf < -1) { node.r = rotR(node.r); return rotL(node); }
        return node;
      }
      var root = null;
      d.keys.forEach(function (k) { root = ins(root, k); });
      function struct(n) { return n ? { k: n.k, bf: h(n.l) - h(n.r), l: struct(n.l), r: struct(n.r) } : null; }
      return struct(root);
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level];
      var lo = level === 'extreme' ? -300 : (level === 'hard' ? -60 : 1);
      var hi = level === 'extreme' ? 300 : (level === 'hard' ? 160 : 99);
      var keys = [];
      for (var i = 0; i < n; i++) {
        if (i > 2 && r() < 0.12) keys.push(keys[D.randInt(r, 0, keys.length - 1)]);
        else keys.push(D.randInt(r, lo, hi));
      }
      return { keys: keys };
    },
    input: {
      hint: T('Örnek: 50 30 70 20 40 60 80 10 45 90', 'Example: 50 30 70 20 40 60 80 10 45 90'),
      parse: function (text) {
        var toks = String(text).trim().split(/[\s,;]+/).filter(Boolean);
        if (!toks.length) throw T('En az bir anahtar yazın.', 'Write at least one key.');
        if (toks.length > 30) throw T('En çok 30 anahtar.', 'At most 30 keys.');
        return { keys: toks.map(function (tok) { if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" bir tamsayı değil.', '"' + tok + '" is not an integer.'); return parseInt(tok, 10); }) };
      },
      format: function (d) { return d.keys.join(' '); },
      bad: ['', '5 x 7', '3.5 8']
    },
    build: function (S, d) {
      var NID = 0, root = null, tracked = {};
      function mkNode(key) { return { nid: NID++, key: key, left: null, right: null, height: 0 }; }
      function h(n) { return n ? n.height : -1; }
      function upd(n) { n.height = 1 + Math.max(h(n.left), h(n.right)); }
      function rotateRight(y) { var x = y.left; y.left = x.right; x.right = y; upd(y); upd(x); return x; }
      function rotateLeft(x) { var y = x.right; x.right = y.left; y.left = x; upd(x); upd(y); return y; }

      S.step(T('Bir AVL ağacı, her düğümde `bf = height(sol) - height(sağ)`\'ı -1, 0 ya da +1 ile sınırlı tutan bir BST\'dir. ' + d.keys.length + ' anahtarı sırayla ekleyeceğiz; her düğümün sağ üstünde `bf` yazacak.',
               'An AVL tree is a BST that keeps `bf = height(left) - height(right)` at -1, 0, or +1 on every node. We insert ' + d.keys.length + ' keys in order; every node shows its `bf` at its upper right.'), { c: [], java: [] });

      d.keys.forEach(function (key, ki) {
        S.at(ki);
        if (!root) {
          root = mkNode(key);
          tracked = syncTree(S, root, layoutTree(root), tracked, function () { return 'new'; }, h);
          var emptyLines = [1, { n: 2, note: T('root == NULL? evet', 'root == NULL? yes') }];
          S.step(T('`insert(' + key + ')` — ağaç boştu, `' + key + '` yeni kök oldu (`bf = 0`).', '`insert(' + key + ')` — the tree was empty, `' + key + '` becomes the root (`bf = 0`).'), { c: emptyLines, java: emptyLines });
          return;
        }
        var cur = root, path = [];
        while (true) {
          path.push(cur);
          if (key === cur.key) {
            tracked = syncTree(S, root, layoutTree(root), tracked, function (nn) { return nn === cur ? 'del' : 'normal'; }, h);
            var dupLines = [1, { n: 2, note: T('root == NULL? hayır', 'root == NULL? no') }, { n: 3, note: T(key + ' == ' + cur.key + '? evet', key + ' == ' + cur.key + '? yes') }];
            S.step(T('`insert(' + key + ')` — `' + key + '` zaten `' + cur.key + '` düğümünde var: **yinelenen**, değişiklik yok.', '`insert(' + key + ')` — `' + key + '` already sits at node `' + cur.key + '`: a **duplicate**, no change.'), { c: dupLines, java: dupLines });
            return;
          }
          if (key < cur.key) { if (!cur.left) { cur.left = mkNode(key); path.push(cur.left); break; } cur = cur.left; }
          else { if (!cur.right) { cur.right = mkNode(key); path.push(cur.right); break; } cur = cur.right; }
        }
        var newLeaf = path[path.length - 1];
        for (var u = path.length - 2; u >= 0; u--) upd(path[u]);
        tracked = syncTree(S, root, layoutTree(root), tracked, function (nn) { return nn === newLeaf ? 'new' : 'normal'; }, h);
        var unbalanced = null;
        for (var f = path.length - 2; f >= 0; f--) { var bfv = h(path[f].left) - h(path[f].right); if (bfv > 1 || bfv < -1) { unbalanced = path[f]; break; } }
        /* Accurate per-ancestor notes for the recursive descent that placed the new leaf: line 2 and 3 are
           false at every level here (root is never NULL and the key never matches partway down, or we
           would have returned above), and line 4 is noted only when TAKEN (going left) -- line 5 is a bare
           `else`, which the coverage tool does not count, and the untaken direction is simply omitted
           rather than skip:true, since a multi-level path can go left at one ancestor and right at
           another, and marking the same line both ways within one accumulated step would contradict itself. */
        var descentLines = [1, { n: 2, note: T('root == NULL? hayır', 'root == NULL? no') }];
        for (var pi = 0; pi < path.length - 1; pi++) {
          var anc = path[pi], nextGoesLeft = path[pi + 1] === anc.left;
          descentLines.push({ n: 3, note: T(key + ' == ' + anc.key + '? hayır', key + ' == ' + anc.key + '? no') });
          if (nextGoesLeft) descentLines.push({ n: 4, note: T(key + ' < ' + anc.key + '? evet', key + ' < ' + anc.key + '? yes') });
        }
        descentLines.push(6, 7);
        S.step(T('`insert(' + key + ')` — yaprak olarak eklendi, kökten yaprağa kadar yükseklikler (`update_height`) tazelendi.' + (unbalanced ? ' Düğüm `' + unbalanced.key + '` artık `bf = ' + (h(unbalanced.left) - h(unbalanced.right)) + '`: dengesiz!' : ' Her `bf` hâlâ -1..+1 arasında.'),
                 '`insert(' + key + ')` — added as a leaf, heights (`update_height`) refreshed from root to leaf.' + (unbalanced ? ' Node `' + unbalanced.key + '` is now `bf = ' + (h(unbalanced.left) - h(unbalanced.right)) + '`: unbalanced!' : ' Every `bf` is still within -1..+1.')),
               { c: descentLines, java: descentLines });

        if (unbalanced) {
          var bfu = h(unbalanced.left) - h(unbalanced.right), leftHeavy = bfu > 1;
          var child = leftHeavy ? unbalanced.left : unbalanced.right;
          var childBf = h(child.left) - h(child.right);
          var single = leftHeavy ? childBf >= 0 : childBf <= 0;
          var caseName = (leftHeavy ? 'L' : 'R') + (single ? (leftHeavy ? 'L' : 'R') : (leftHeavy ? 'R' : 'L'));
          var idx = path.indexOf(unbalanced), parent = idx > 0 ? path[idx - 1] : null;
          var newSub;
          if (caseName === 'LL') newSub = rotateRight(unbalanced);
          else if (caseName === 'RR') newSub = rotateLeft(unbalanced);
          else if (caseName === 'LR') { unbalanced.left = rotateLeft(unbalanced.left); newSub = rotateRight(unbalanced); }
          else { unbalanced.right = rotateRight(unbalanced.right); newSub = rotateLeft(unbalanced); }
          if (parent) { if (parent.left === unbalanced) parent.left = newSub; else parent.right = newSub; } else root = newSub;
          /* the rotation restores the subtree's pre-insertion height, but the ancestors ABOVE it were
           * already (temporarily) updated with the too-tall height; refresh them now that it is fixed. */
          for (var a = idx - 1; a >= 0; a--) upd(path[a]);
          tracked = syncTree(S, root, layoutTree(root), tracked, function (nn) { return nn === newSub ? 'new' : 'normal'; }, h);
          var caseNote = T('bf = ' + bfu + ' -> ' + caseName, 'bf = ' + bfu + ' -> ' + caseName);
          var caseLines;
          if (caseName === 'LL') caseLines = [11, { n: 12, note: caseNote }];
          else if (caseName === 'LR') caseLines = [11, { n: 12, skip: true }, { n: 13, note: caseNote }];
          else if (caseName === 'RR') caseLines = [11, { n: 12, skip: true }, { n: 13, skip: true }, { n: 14, note: caseNote }];
          else caseLines = [11, { n: 12, skip: true }, { n: 13, skip: true }, { n: 14, skip: true }, { n: 15, note: caseNote }];
          S.step(T('**' + caseName + ' durumu**: `rebalance(' + unbalanced.key + ')` döndürür, yeni alt-kök `' + newSub.key + '`. Tekrar her `bf` -1..+1 arasında.',
                   '**' + caseName + ' case**: `rebalance(' + unbalanced.key + ')` rotates, new subtree root `' + newSub.key + '`. Every `bf` is within -1..+1 again.'), { c: caseLines, java: caseLines });
        }
      });

      S.at(null);
      S.result = toStruct(root, h);
      S.step(T('Bitti: ' + d.keys.length + ' anahtar eklendi, ağaç her adımda dengeli kaldı. `insert` her zaman `O(log n)`: karşılaştırmalar artı en fazla bir (çift) döndürme.',
               'Done: ' + d.keys.length + ' keys inserted, the tree stayed balanced at every step. `insert` is always `O(log n)`: the comparisons plus at most one (double) rotation.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
