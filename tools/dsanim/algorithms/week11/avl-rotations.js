/* Week 11 — AVL tree: the four rebalancing cases (LL, RR, LR, RL), shown as separate presets. An AVL tree is a
 * BST where every node's balance factor bf = height(left) - height(right) stays in {-1, 0, 1}. We build a
 * small stable AVL tree from `keys` (no narration — see avl-insert.js for that), insert one more key
 * `trigger`, then walk from the new leaf back up to find the first node whose |bf| > 1 and fix it: LL/RR need
 * one rotation, LR/RL need two (fix the child first, then the node). Node identity (nid) is preserved through
 * a rotation — the circles just relink and move, they are not recreated.
 * Data: {keys: [...], trigger: n}. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'static Node *rotate_right(Node *y) {',
    '    Node *x = y->left;',
    '    y->left = x->right;',
    '    x->right = y;',
    '    update_height(y);',
    '    update_height(x);',
    '    return x;',
    '}',
    '',
    'static Node *rotate_left(Node *x) {',
    '    Node *y = x->right;',
    '    x->right = y->left;',
    '    y->left = x;',
    '    update_height(x);',
    '    update_height(y);',
    '    return y;',
    '}',
    '',
    'Node *rebalance(Node *n) {',
    '    int bf = height(n->left) - height(n->right);',
    '    if (bf > 1  && height(n->left->left)  >= height(n->left->right))  return rotate_right(n);   /* LL */',
    '    if (bf > 1)  { n->left  = rotate_left(n->left);   return rotate_right(n); }                  /* LR */',
    '    if (bf < -1 && height(n->right->right) >= height(n->right->left)) return rotate_left(n);     /* RR */',
    '    if (bf < -1) { n->right = rotate_right(n->right); return rotate_left(n); }                   /* RL */',
    '    return n;',
    '}'
  ];
  var JAVA = [
    'static Node rotateRight(Node y) {',
    '    Node x = y.left;',
    '    y.left = x.right;',
    '    x.right = y;',
    '    updateHeight(y);',
    '    updateHeight(x);',
    '    return x;',
    '}',
    '',
    'static Node rotateLeft(Node x) {',
    '    Node y = x.right;',
    '    x.right = y.left;',
    '    y.left = x;',
    '    updateHeight(x);',
    '    updateHeight(y);',
    '    return y;',
    '}',
    '',
    'static Node rebalance(Node n) {',
    '    int bf = height(n.left) - height(n.right);',
    '    if (bf > 1  && height(n.left.left)  >= height(n.left.right))  return rotateRight(n);   // LL',
    '    if (bf > 1)  { n.left  = rotateLeft(n.left);   return rotateRight(n); }                 // LR',
    '    if (bf < -1 && height(n.right.right) >= height(n.right.left)) return rotateLeft(n);     // RR',
    '    if (bf < -1) { n.right = rotateRight(n.right); return rotateLeft(n); }                  // RL',
    '    return n;',
    '}'
  ];

  var X0 = 60, Y0 = 60, DX = 50, DY = 74;
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
      S.circle(cid, { x: pos[n.nid].x, y: pos[n.nid].y, text: String(n.key), style: styleOf ? styleOf(n) : 'normal' });
      var aid = 'a' + n.nid; seen[aid] = 1;
      var lh = hOf(n.left), rh = hOf(n.right), b = lh - rh;
      S.label(aid, { x: pos[n.nid].x + 16, y: pos[n.nid].y - 16, text: 'bf=' + (b > 0 ? '+' : '') + b, size: 11, anchor: 'start', bold: true, style: Math.abs(b) > 1 ? 'del' : 'dim' });
      if (n.left) { var el = 'e' + n.nid + 'l'; seen[el] = 1; S.arrow(el, { from: cid, to: 'n' + n.left.nid, kind: 'center', head: false }); walk(n.left); }
      if (n.right) { var er = 'e' + n.nid + 'r'; seen[er] = 1; S.arrow(er, { from: cid, to: 'n' + n.right.nid, kind: 'center', head: false }); walk(n.right); }
    })(root);
    for (var id in tracked) if (!seen[id] && S.has(id)) S.remove(id);
    return seen;
  }
  function toStruct(n, hOf) { return n ? { k: n.key, bf: hOf(n.left) - hOf(n.right), l: toStruct(n.left, hOf), r: toStruct(n.right, hOf) } : null; }

  D.define({
    id: 'avl-rotations',
    title: T('AVL ağacı: dört dengeleme durumu (LL, RR, LR, RL)', 'AVL tree: the four rebalancing cases (LL, RR, LR, RL)'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'll', level: 'normal', name: T('LL durumu: tek sağa döndürme', 'LL case: a single right rotation'), data: { keys: [50, 30, 70, 20, 40, 60, 80, 10, 45], trigger: 5 } },
      { id: 'rr', level: 'hard', name: T('RR durumu: tek sola döndürme', 'RR case: a single left rotation'), data: { keys: [50, 30, 70, 20, 40, 60, 80, 55, 90], trigger: 95 } },
      { id: 'lr', level: 'edge', name: T('LR durumu: çift döndürme (önce sol çocuk sola, sonra düğüm sağa)', 'LR case: a double rotation (first the left child left, then the node right)'), data: { keys: [50, 70, 30, 80, 60, 40, 20, 55, 35], trigger: 36 } },
      { id: 'rl', level: 'edge', name: T('RL durumu: çift döndürme (önce sağ çocuk sağa, sonra düğüm sola)', 'RL case: a double rotation (first the right child right, then the node left)'), data: { keys: [50, 30, 70, 20, 40, 60, 80, 45, 65], trigger: 41 } },
      { id: 'none', level: 'edge', name: T('Uç durum: döndürme gerekmeyen bir ekleme', 'Edge case: an insertion that needs no rotation at all'), data: { keys: [50, 30, 70, 20, 40, 60, 80, 10, 90], trigger: 25 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length + 1; },
    /** Independent AVL insert: the CLASSIC form that compares the new key against the child's key (build()
     *  instead compares the CHILD's own balance factor) — a different decision rule, same result. */
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
      root = ins(root, d.trigger);
      function struct(n) { return n ? { k: n.k, bf: h(n.l) - h(n.r), l: struct(n.l), r: struct(n.r) } : null; }
      return struct(root);
    },
    random: function (level, r) {
      var n = { easy: 9, normal: 10, hard: 12, extreme: 14 }[level];
      var lo = level === 'extreme' ? -300 : (level === 'hard' ? -60 : 1);
      var hi = level === 'extreme' ? 300 : (level === 'hard' ? 160 : 99);
      var seen = {}, keys = [];
      while (keys.length < n) { var v = D.randInt(r, lo, hi); if (!seen[v]) { seen[v] = 1; keys.push(v); } }
      var trigger; do { trigger = D.randInt(r, lo, hi); } while (seen[trigger]);
      return { keys: keys, trigger: trigger };
    },
    input: {
      hint: T('Örnek: keys=50,30,70,20,40,60,80,10,45 trigger=5', 'Example: keys=50,30,70,20,40,60,80,10,45 trigger=5'),
      parse: function (text) {
        var m = /^\s*keys=([^\s]+)\s+trigger=(-?\d+)\s*$/i.exec(String(text));
        if (!m) throw T('Biçim: keys=... trigger=N', 'Format: keys=... trigger=N');
        var toks = m[1].split(',').filter(Boolean);
        if (toks.length < 1) throw T('keys en az bir değer içermeli.', 'keys needs at least one value.');
        var keys = toks.map(function (t) { if (!/^-?\d+$/.test(t)) throw T('"' + t + '" bir tamsayı değil.', '"' + t + '" is not an integer.'); return parseInt(t, 10); });
        return { keys: keys, trigger: parseInt(m[2], 10) };
      },
      format: function (d) { return 'keys=' + d.keys.join(',') + ' trigger=' + d.trigger; },
      bad: ['', 'keys=5,x trigger=3', 'keys=5,7', 'trigger=3 keys=5,7']
    },
    build: function (S, d) {
      var NID = 0, root = null, tracked = {};
      function mkNode(key) { return { nid: NID++, key: key, left: null, right: null, height: 0 }; }
      function h(n) { return n ? n.height : -1; }
      function upd(n) { n.height = 1 + Math.max(h(n.left), h(n.right)); }
      function rotateRight(y) { var x = y.left; y.left = x.right; x.right = y; upd(y); upd(x); return x; }
      function rotateLeft(x) { var y = x.right; x.right = y.left; y.left = x; upd(x); upd(y); return y; }
      /** Silent fixup (setup phase only, no narration): walk from the new leaf up, rotate the first
       *  unbalanced ancestor if any. AVL guarantees at most one (possibly double) rotation per insertion. */
      function fixupSilent(path) {
        for (var i = path.length - 2; i >= 0; i--) {
          var node = path[i];
          upd(node);
          var bfv = h(node.left) - h(node.right);
          if (bfv > 1 || bfv < -1) {
            var leftHeavy = bfv > 1;
            var child = leftHeavy ? node.left : node.right;
            var childBf = h(child.left) - h(child.right);
            var single = leftHeavy ? childBf >= 0 : childBf <= 0;
            var newSub;
            if (leftHeavy && single) newSub = rotateRight(node);
            else if (leftHeavy) { node.left = rotateLeft(node.left); newSub = rotateRight(node); }
            else if (single) newSub = rotateLeft(node);
            else { node.right = rotateRight(node.right); newSub = rotateLeft(node); }
            var parent = i > 0 ? path[i - 1] : null;
            if (parent) { if (parent.left === node) parent.left = newSub; else parent.right = newSub; } else root = newSub;
            return;
          }
        }
      }

      d.keys.forEach(function (key) {
        if (!root) { root = mkNode(key); return; }
        var cur = root, path = [];
        while (true) {
          path.push(cur);
          if (key === cur.key) return;
          if (key < cur.key) { if (!cur.left) { cur.left = mkNode(key); path.push(cur.left); break; } cur = cur.left; }
          else { if (!cur.right) { cur.right = mkNode(key); path.push(cur.right); break; } cur = cur.right; }
        }
        fixupSilent(path);
      });
      var pos0 = layoutTree(root);
      tracked = syncTree(S, root, pos0, tracked, function () { return 'normal'; }, h);
      S.step(T('Bu küçük AVL ağacını `keys` ile, dengeyi koruyarak kurduk (bkz: avl-insert). Her düğümün üstünde dengeleme çarpanı (balance factor) `bf = height(sol) - height(sağ)` yazıyor; hepsi -1..+1 arası.',
               'We built this small AVL tree from `keys`, keeping it balanced as we went (see: avl-insert). Every node shows its balance factor `bf = height(left) - height(right)`; all within -1..+1.'), { c: [], java: [] });

      /* plain BST insert of the trigger key (no rebalancing yet) */
      var path = [];
      if (!root) { root = mkNode(d.trigger); path = [root]; }
      else {
        var cur = root;
        while (true) {
          path.push(cur);
          if (d.trigger < cur.key) { if (!cur.left) { cur.left = mkNode(d.trigger); path.push(cur.left); break; } cur = cur.left; }
          else { if (!cur.right) { cur.right = mkNode(d.trigger); path.push(cur.right); break; } cur = cur.right; }
        }
      }
      var newLeaf = path[path.length - 1];
      var pos1 = layoutTree(root);
      tracked = syncTree(S, root, pos1, tracked, function (n) { return n === newLeaf ? 'new' : 'normal'; }, h);
      S.step(T('`insert(' + d.trigger + ')` — önce sıradan bir BST eklemesi yapılır (henüz döndürme yok): yeni yaprak `' + d.trigger + '`.',
               '`insert(' + d.trigger + ')` — first a plain BST insertion happens (no rotation yet): new leaf `' + d.trigger + '`.'), { c: [], java: [] });

      var unbalanced = null, caseName = null;
      for (var i = path.length - 2; i >= 0; i--) {
        var node = path[i];
        upd(node);
        var bf = h(node.left) - h(node.right);
        if (bf > 1 || bf < -1) { unbalanced = node; break; }
      }
      if (!unbalanced) {
        var posN = layoutTree(root);
        tracked = syncTree(S, root, posN, tracked, function () { return 'normal'; }, h);
        var noRotLines = [19, 20, { n: 21, skip: true }, { n: 22, skip: true }, { n: 23, skip: true }, { n: 24, skip: true }, 25];
        S.step(T('Kökten yaprağa kadar her `bf` hâlâ -1..+1 arasında: **hiçbir düğüm dengesiz olmadı**, döndürmeye gerek yok.',
                 'Every `bf` from root to leaf is still within -1..+1: **no node became unbalanced**, no rotation is needed.'), { c: noRotLines, java: noRotLines });
      } else {
        var bfu = h(unbalanced.left) - h(unbalanced.right);
        var pos2 = layoutTree(root);
        tracked = syncTree(S, root, pos2, tracked, function (n) { return n === unbalanced ? 'del' : (n === newLeaf ? 'new' : 'normal'); }, h);
        var leftHeavy = bfu > 1;
        var child = leftHeavy ? unbalanced.left : unbalanced.right;
        var childBf = h(child.left) - h(child.right);
        var single = leftHeavy ? childBf >= 0 : childBf <= 0;
        caseName = (leftHeavy ? 'L' : 'R') + (single ? (leftHeavy ? 'L' : 'R') : (leftHeavy ? 'R' : 'L'));
        var decisionNote = T('bf = ' + bfu + ', çocuğun bf\'si = ' + childBf + ' -> ' + caseName,
                              'bf = ' + bfu + ', child\'s bf = ' + childBf + ' -> ' + caseName);
        var caseLines;
        if (caseName === 'LL') caseLines = [20, { n: 21, note: decisionNote }];
        else if (caseName === 'LR') caseLines = [20, { n: 21, skip: true }, { n: 22, note: decisionNote }];
        else if (caseName === 'RR') caseLines = [20, { n: 21, skip: true }, { n: 22, skip: true }, { n: 23, note: decisionNote }];
        else caseLines = [20, { n: 21, skip: true }, { n: 22, skip: true }, { n: 23, skip: true }, { n: 24, note: decisionNote }];
        S.step(T('Kökten yukarı çıkarken ilk dengesiz düğüm `' + unbalanced.key + '`: `bf = ' + bfu + '`. Çocuğu `' + child.key + '`\'nin `bf = ' + childBf + '` -> bu bir **' + caseName + ' durumu**.',
                 'Walking up from the leaf, the first unbalanced node is `' + unbalanced.key + '`: `bf = ' + bfu + '`. Its child `' + child.key + '` has `bf = ' + childBf + '` -> this is case **' + caseName + '**.'),
               { c: caseLines, java: caseLines });

        var parent = i > 0 ? path[i - 1] : null;
        var newSub;
        if (caseName === 'LL') { newSub = rotateRight(unbalanced); }
        else if (caseName === 'RR') { newSub = rotateLeft(unbalanced); }
        else if (caseName === 'LR') {
          unbalanced.left = rotateLeft(unbalanced.left);
          var posMid = layoutTree(root);
          tracked = syncTree(S, root, posMid, tracked, function (n) { return 'normal'; }, h);
          S.step(T('Çift döndürmenin 1. adımı: sol çocuk `' + child.key + '` üzerinde bir **sola döndürme (rotate_left)** yapılır.',
                   'Step 1 of the double rotation: a **left rotation (rotate_left)** on the left child `' + child.key + '`.'), { c: [10, 11, 12, 13, 14, 15, 16], java: [10, 11, 12, 13, 14, 15, 16] });
          newSub = rotateRight(unbalanced);
        } else {
          unbalanced.right = rotateRight(unbalanced.right);
          var posMid2 = layoutTree(root);
          tracked = syncTree(S, root, posMid2, tracked, function (n) { return 'normal'; }, h);
          S.step(T('Çift döndürmenin 1. adımı: sağ çocuk `' + child.key + '` üzerinde bir **sağa döndürme (rotate_right)** yapılır.',
                   'Step 1 of the double rotation: a **right rotation (rotate_right)** on the right child `' + child.key + '`.'), { c: [1, 2, 3, 4, 5, 6, 7], java: [1, 2, 3, 4, 5, 6, 7] });
          newSub = rotateLeft(unbalanced);
        }
        if (parent) { if (parent.left === unbalanced) parent.left = newSub; else parent.right = newSub; } else root = newSub;
        var posf = layoutTree(root);
        tracked = syncTree(S, root, posf, tracked, function (n) { return n === newSub ? 'new' : 'normal'; }, h);
        var lastLines = caseName === 'LL' ? [1, 2, 3, 4, 5, 6, 7] : caseName === 'RR' ? [10, 11, 12, 13, 14, 15, 16] : caseName === 'LR' ? [1, 2, 3, 4, 5, 6, 7] : [10, 11, 12, 13, 14, 15, 16];
        S.step(T((caseName === 'LR' || caseName === 'RL' ? '2. adım: ' : '') + '`' + newSub.key + '` yeni alt-kök oluyor. Bütün `bf` değerleri tekrar -1..+1 arasında: ağaç dengeli.',
                 (caseName === 'LR' || caseName === 'RL' ? 'Step 2: ' : '') + '`' + newSub.key + '` becomes the new subtree root. Every `bf` is back within -1..+1: the tree is balanced again.'), { c: lastLines, java: lastLines });
      }

      S.result = toStruct(root, h);
      S.step(T('Bitti. Bir eklemeden sonra AVL\'de en fazla BİR döndürme (LL/RR) ya da BİR çift döndürme (LR/RL) gerekir — asla daha fazlası; bu yüzden `insert` hâlâ `O(log n)`.',
               'Done. After one insertion, AVL needs at most ONE rotation (LL/RR) or ONE double rotation (LR/RL) — never more; that is why `insert` stays `O(log n)`.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
