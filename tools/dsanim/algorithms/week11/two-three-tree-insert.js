/* Week 11 — 2-3 tree: insert. A 2-3 tree stays PERFECTLY balanced by growing at the ROOT instead of at the
 * leaves: every node holds 1 key (a "2-node", 2 children) or 2 keys (a "3-node", 3 children), and EVERY leaf
 * sits at the same depth. A new key is inserted into the correct leaf; if that leaf already had 2 keys, it
 * temporarily holds 3 — an OVERFLOW. It is split into two 2-nodes and its MIDDLE key is promoted to the
 * parent, which can overflow the same way, cascading upward; if the root itself overflows and splits, a brand
 * new root is created and the tree's height grows by exactly one, everywhere at once. Data: {keys: [...]}. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'typedef struct Node {',
    '    int nkeys;               /* 1 or 2 */',
    '    int key[2];',
    '    struct Node *child[3];   /* nkeys + 1 children, or none if a leaf */',
    '} Node;',
    '',
    'Node *insert(Node *root, int key) {',
    '    if (root == NULL) return make_leaf(key);',
    '    Node *path[32]; int depth = 0;',
    '    Node *cur = root;',
    '    while (cur->child[0] != NULL) {                    /* walk down to the right leaf */',
    '        path[depth++] = cur;',
    '        int i = child_index(cur, key);',
    '        if (i < cur->nkeys && cur->key[i] == key) return root;   /* duplicate: unchanged */',
    '        cur = cur->child[i];',
    '    }',
    '    if (leaf_has(cur, key)) return root;                /* duplicate: unchanged */',
    '    insert_sorted(cur, key);                            /* leaf now has 2 or 3 keys */',
    '    Node *node = cur;',
    '    while (node->nkeys == 3) {                          /* overflow: split and promote the middle key */',
    '        Node *left, *right; int promoted;',
    '        split_node(node, &left, &right, &promoted);',
    '        if (depth == 0) return new_root(promoted, left, right);   /* root split: height + 1 */',
    '        Node *parent = path[--depth];',
    '        replace_with_split(parent, node, promoted, left, right);',
    '        node = parent;',
    '    }',
    '    return root;',
    '}'
  ];
  var JAVA = [
    'static class Node {',
    '    int nkeys;                // 1 or 2',
    '    int[] key = new int[2];',
    '    Node[] child = new Node[3]; // nkeys + 1 children, or none if a leaf',
    '}',
    '',
    'static Node insert(Node root, int key) {',
    '    if (root == null) return makeLeaf(key);',
    '    Node[] path = new Node[32]; int depth = 0;',
    '    Node cur = root;',
    '    while (cur.child[0] != null) {                      // walk down to the right leaf',
    '        path[depth++] = cur;',
    '        int i = childIndex(cur, key);',
    '        if (i < cur.nkeys && cur.key[i] == key) return root;      // duplicate: unchanged',
    '        cur = cur.child[i];',
    '    }',
    '    if (leafHas(cur, key)) return root;                  // duplicate: unchanged',
    '    insertSorted(cur, key);                              // leaf now has 2 or 3 keys',
    '    Node node = cur;',
    '    while (node.nkeys == 3) {                            // overflow: split and promote the middle key',
    '        Node[] lr = new Node[2]; int[] promoted = new int[1];',
    '        splitNode(node, lr, promoted);',
    '        if (depth == 0) return newRoot(promoted[0], lr[0], lr[1]);  // root split: height + 1',
    '        Node parent = path[--depth];',
    '        replaceWithSplit(parent, node, promoted[0], lr[0], lr[1]);',
    '        node = parent;',
    '    }',
    '    return root;',
    '}'
  ];

  var X0 = 50, Y0 = 50, DX = 52, DY = 90;
  function layoutTree(root) {
    var pos = {}, xc = { v: 0 };
    (function walk(n, depth) {
      if (!n.children.length) { pos[n.nid] = { x: X0 + xc.v * DX, y: Y0 + depth * DY }; xc.v++; return; }
      var xs = [];
      n.children.forEach(function (c) { walk(c, depth + 1); xs.push(pos[c.nid].x); });
      pos[n.nid] = { x: (xs[0] + xs[xs.length - 1]) / 2, y: Y0 + depth * DY };
    })(root, 0);
    return pos;
  }
  function syncTree(S, root, pos, tracked, styleOf) {
    var seen = {};
    (function walk(n) {
      var cid = 'n' + n.nid; seen[cid] = 1;
      var w = n.keys.length === 2 ? 66 : 40;
      S.box(cid, { x: pos[n.nid].x - w / 2, y: pos[n.nid].y - 18, w: w, h: 36, text: n.keys.join(' | '), style: styleOf ? styleOf(n) : 'normal', size: 15 });
      n.children.forEach(function (c, ci) {
        var eid = 'e' + n.nid + '_' + ci; seen[eid] = 1;
        S.arrow(eid, { from: cid, to: 'n' + c.nid, kind: 'center', head: false });
        walk(c);
      });
    })(root);
    for (var id in tracked) if (!seen[id] && S.has(id)) S.remove(id);
    return seen;
  }
  function toStruct(n) { return { keys: n.keys.slice(), children: n.children.map(toStruct) }; }

  D.define({
    id: 'two-three-tree-insert',
    title: T('2-3 ağacı: ekleme (düğüm bölünmesi ile yukarı büyüme)', '2-3 tree: insert (growing upward via node splits)'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 anahtar artan sırada — birkaç bölünme', '10 keys in ascending order — a few splits'),
        data: { keys: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] } },
      { id: 'hard', level: 'hard', name: T('14 anahtar, kök bölünüp yükseklik artıyor', '14 keys, the root splits and the height grows'),
        data: { keys: [50, 30, 70, 20, 40, 60, 80, 10, 90, 25, 35, 45, 55, 65] } },
      { id: 'edge-duplicates', level: 'edge', name: T('Uç durum: 10 değer, çok sayıda yinelenen', 'Edge case: 10 values, many repeats'),
        data: { keys: [8, 8, 3, 8, 15, 3, 20, 3, 15, 8] } },
      { id: 'edge-descending', level: 'edge', name: T('Uç durum: azalan sırada 10 anahtar', 'Edge case: 10 keys in descending order'),
        data: { keys: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10] } },
      { id: 'edge-single', level: 'edge', name: T('Uç durum: tek anahtar', 'Edge case: a single key'), data: { keys: [7] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    /** Independent recursive insert: returns either the updated node, or a {promote, left, right} split
     *  signal that the CALLER absorbs — a top-down recursive-return style, completely different from build()'s
     *  iterative explicit-path-array walk. */
    reference: function (d) {
      function leaf(k) { return { keys: [k], children: [] }; }
      function isLeaf(n) { return n.children.length === 0; }
      function ins(node, key) {
        if (!node) return { node: leaf(key), split: null };
        if (isLeaf(node)) {
          if (node.keys.indexOf(key) >= 0) return { node: node, split: null };
          var nk = node.keys.concat([key]).sort(function (a, b) { return a - b; });
          if (nk.length <= 2) return { node: { keys: nk, children: [] }, split: null };
          return { node: null, split: { promote: nk[1], left: leaf(nk[0]), right: leaf(nk[2]) } };
        }
        var i = 0; while (i < node.keys.length && key > node.keys[i]) i++;
        if (i < node.keys.length && node.keys[i] === key) return { node: node, split: null };
        var r = ins(node.children[i], key);
        if (!r.split) { var ch = node.children.slice(); ch[i] = r.node; return { node: { keys: node.keys.slice(), children: ch }, split: null }; }
        var nk2 = node.keys.slice(); nk2.splice(i, 0, r.split.promote);
        var ch2 = node.children.slice(); ch2.splice(i, 1, r.split.left, r.split.right);
        if (nk2.length <= 2) return { node: { keys: nk2, children: ch2 }, split: null };
        return { node: null, split: { promote: nk2[1], left: { keys: [nk2[0]], children: [ch2[0], ch2[1]] }, right: { keys: [nk2[2]], children: [ch2[2], ch2[3]] } } };
      }
      var root = null;
      d.keys.forEach(function (key) {
        var r = ins(root, key);
        root = r.split ? { keys: [r.split.promote], children: [r.split.left, r.split.right] } : r.node;
      });
      return root;
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
      hint: T('Örnek: 10 20 30 40 50 60 70 80 90 100', 'Example: 10 20 30 40 50 60 70 80 90 100'),
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
      function mkLeaf(key) { return { nid: NID++, keys: [key], children: [] }; }
      function isLeaf(n) { return n.children.length === 0; }
      function childIndex(n, key) { var i = 0; while (i < n.keys.length && key > n.keys[i]) i++; return i; }

      var detailedDone = false;
      d.keys.forEach(function (key, ki) {
        S.at(ki);
        if (!root) {
          root = mkLeaf(key);
          tracked = syncTree(S, root, layoutTree(root), tracked, function () { return 'new'; });
          var emptyLines = [7, { n: 8, note: T('root == NULL? evet', 'root == NULL? yes') }];
          S.step(T('`insert(' + key + ')` — ağaç boştu, `' + key + '` tek anahtarlı ilk yaprak (kök) oldu.', '`insert(' + key + ')` — the tree was empty, `' + key + '` becomes the first one-key leaf (the root).'), { c: emptyLines, java: emptyLines });
          return;
        }
        var path = [], cur = root;
        while (!isLeaf(cur)) {
          var i = childIndex(cur, key);
          if (i < cur.keys.length && cur.keys[i] === key) {
            tracked = syncTree(S, root, layoutTree(root), tracked, function (n) { return n === cur ? 'del' : 'normal'; });
            var dupIntLines = [{ n: 11, note: T('cur->child[0] != NULL? evet', 'cur->child[0] != NULL? yes') }, 12, 13,
                                { n: 14, note: T('i < nkeys ve key[i] == key? evet', 'i < nkeys and key[i] == key? yes') }];
            S.step(T('`insert(' + key + ')` — `' + key + '` iç düğümde zaten var: **yinelenen**, değişiklik yok.', '`insert(' + key + ')` — `' + key + '` already sits in an internal node: a **duplicate**, no change.'), { c: dupIntLines, java: dupIntLines });
            return;
          }
          path.push(cur);
          cur = cur.children[i];
        }
        if (cur.keys.indexOf(key) >= 0) {
          tracked = syncTree(S, root, layoutTree(root), tracked, function (n) { return n === cur ? 'del' : 'normal'; });
          var dupLeafLines = [{ n: 17, note: T('leaf_has(cur, key)? evet', 'leaf_has(cur, key)? yes') }];
          S.step(T('`insert(' + key + ')` — `' + key + '` bu yaprakta zaten var: **yinelenen**, değişiklik yok.', '`insert(' + key + ')` — `' + key + '` is already in this leaf: a **duplicate**, no change.'), { c: dupLeafLines, java: dupLeafLines });
          return;
        }
        cur.keys.push(key); cur.keys.sort(function (a, b) { return a - b; });
        /* narrate the first op that actually overflows and splits — skips ops that just settle into a
         * leaf with no restructuring, which would waste the one detailed slot. */
        var detailed = !detailedDone && cur.keys.length === 3;
        if (detailed) detailedDone = true;
        if (detailed) {
          tracked = syncTree(S, root, layoutTree(root), tracked, function (n) { return n === cur ? 'hl' : 'normal'; });
          var foundLines = [{ n: 17, skip: true }, 18, 19];
          S.step(T('`insert(' + key + ')` — doğru yaprak bulundu, `' + key + '` sıralı biçimde eklendi: [' + cur.keys.join(', ') + '].', '`insert(' + key + ')` — the right leaf is found, `' + key + '` is inserted in sorted order: [' + cur.keys.join(', ') + '].'), { c: foundLines, java: foundLines });
        }

        var node = cur, splitCount = 0, rootSplitHappened = false;
        while (node.keys.length === 3) {
          splitCount++;
          var k0 = node.keys[0], k1 = node.keys[1], k2 = node.keys[2];
          var left = isLeaf(node) ? { nid: NID++, keys: [k0], children: [] } : { nid: NID++, keys: [k0], children: [node.children[0], node.children[1]] };
          var right = isLeaf(node) ? { nid: NID++, keys: [k2], children: [] } : { nid: NID++, keys: [k2], children: [node.children[2], node.children[3]] };
          if (!path.length) {
            rootSplitHappened = true;
            root = { nid: NID++, keys: [k1], children: [left, right] };
            if (detailed) {
              tracked = syncTree(S, root, layoutTree(root), tracked, function (n) { return n === root ? 'new' : 'normal'; });
              var rootSplitLines = [{ n: 23, note: T('depth == 0? evet', 'depth == 0? yes') }];
              S.step(T('**Kök bölünmesi**: taştı ([' + k0 + ',' + k1 + ',' + k2 + ']), `' + k0 + '` ve `' + k2 + '` iki yeni düğüme ayrılır, `' + k1 + '` yeni bir kök olur. Ağacın yüksekliği HER YERDE bir artar.',
                       '**Root split**: overflowed ([' + k0 + ',' + k1 + ',' + k2 + ']), `' + k0 + '` and `' + k2 + '` become two new nodes, `' + k1 + '` becomes a brand new root. The tree\'s height grows by one EVERYWHERE.'), { c: rootSplitLines, java: rootSplitLines });
            }
            node = null;
            break;
          }
          var parent = path.pop();
          var pidx = parent.children.indexOf(node);
          parent.children.splice(pidx, 1, left, right);
          parent.keys.splice(pidx, 0, k1);
          if (detailed) {
            tracked = syncTree(S, root, layoutTree(root), tracked, function (n) { return (n === left || n === right || n === parent) ? 'new' : 'normal'; });
            S.step(T('**Taşma**: [' + k0 + ',' + k1 + ',' + k2 + '] bölünür, orta anahtar `' + k1 + '` ebeveyne (`' + parent.keys.join(',') + '`) taşınır.',
                     '**Overflow**: [' + k0 + ',' + k1 + ',' + k2 + '] splits, the middle key `' + k1 + '` is promoted to the parent (now `' + parent.keys.join(',') + '`).'), { c: [{ n: 23, skip: true }, 24, 25, 26], java: [{ n: 23, skip: true }, 24, 25, 26] });
          }
          node = parent;
        }
        if (!detailed) {
          var posf = layoutTree(root);
          tracked = syncTree(S, root, posf, tracked, function () { return 'normal'; });
          /* Condensed summary of the whole insert() call. By this point any duplicate has already
             returned early above, so line 17 is reliably false here. Line 20's while is noted with its
             final (loop-ending, false) value. Line 23 fires at most once per call (only the split that
             reaches an empty path, if any), so rootSplitHappened gives one accurate, unambiguous value
             for the whole step -- no per-iteration skip needed. */
          var bulkLines = [16, { n: 17, note: T('leaf_has(cur, key)? hayır', 'leaf_has(cur, key)? no') }, 18, 19,
                            { n: 20, note: T('node->nkeys == 3? hayır (bitti)', 'node->nkeys == 3? no (done)') }];
          if (splitCount) {
            /* lines 24-26 only ran if some split promoted into a NON-root parent (the loop continues);
               if the very last (or only) split reached an empty path, the function returns right at line
               23 and 24-26 never run for that final iteration. */
            var hadNonRootSplit = splitCount > (rootSplitHappened ? 1 : 0);
            bulkLines.push(21, 22, { n: 23, note: T('depth == 0? ' + (rootSplitHappened ? 'evet' : 'hayır'), 'depth == 0? ' + (rootSplitHappened ? 'yes' : 'no')) });
            if (hadNonRootSplit) bulkLines.push(24, 25, 26);
          }
          S.step(T('`insert(' + key + ')` — eklendi' + (splitCount ? ', ' + splitCount + ' bölünme (kaskad)' : ', bölünme gerekmedi') + '.',
                   '`insert(' + key + ')` — inserted' + (splitCount ? ', ' + splitCount + ' split(s) cascaded' : ', no split needed') + '.'), { c: bulkLines, java: bulkLines });
        }
      });

      S.at(null);
      var finalPos = layoutTree(root);
      tracked = syncTree(S, root, finalPos, tracked, function () { return 'normal'; });
      S.result = toStruct(root);
      S.step(T('Bitti: ' + d.keys.length + ' anahtar eklendi. Her yaprak hâlâ AYNI derinlikte — 2-3 ağacı asla dengesizleşmez, çünkü büyüme her zaman kökte olur.',
               'Done: ' + d.keys.length + ' keys inserted. Every leaf is still at the SAME depth — a 2-3 tree never becomes unbalanced, because growth always happens at the root.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
