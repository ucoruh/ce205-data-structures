/* Week 11 — splay tree: every access moves the accessed key to the root by repeatedly rotating it up, two
 * levels at a time when possible. Each step along the way is one of three named moves:
 *   zig      — the parent is already the root: one single rotation.
 *   zig-zig  — the node and its parent are BOTH left children (or both right children): rotate the
 *              PARENT up first, then the node — same direction twice.
 *   zig-zag  — the node and its parent are on OPPOSITE sides: rotate the node up twice (once each way).
 * `access(key)` searches as usual; if the key is missing, a new node is inserted where the search ended, and
 * THAT node is what gets splayed. Recently accessed keys end up near the root. Data: {ops: [...]}. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'static void rotate_left(Node *x) {',
    '    Node *y = x->right;',
    '    x->right = y->left;',
    '    if (y->left) y->left->parent = x;',
    '    y->parent = x->parent;',
    '    if (x->parent == NULL)         root = y;',
    '    else if (x == x->parent->left) x->parent->left  = y;',
    '    else                           x->parent->right = y;',
    '    y->left = x;',
    '    x->parent = y;',
    '}',
    '',
    'static void rotate_right(Node *y) {        /* mirror image of rotate_left */',
    '    Node *x = y->left;',
    '    y->left = x->right;',
    '    if (x->right) x->right->parent = y;',
    '    x->parent = y->parent;',
    '    if (y->parent == NULL)          root = x;',
    '    else if (y == y->parent->left)  y->parent->left  = x;',
    '    else                            y->parent->right = x;',
    '    x->right = y;',
    '    y->parent = x;',
    '}',
    '',
    'static void rotate_up(Node *x) {            /* rotate x over its parent, promoting it one level */',
    '    if (x == x->parent->left) rotate_right(x->parent); else rotate_left(x->parent);',
    '}',
    '',
    'void splay(Node *x) {',
    '    while (x->parent != NULL) {',
    '        Node *p = x->parent, *g = p->parent;',
    '        if (g == NULL)                                    { rotate_up(x); }               /* zig */',
    '        else if ((x == p->left) == (p == g->left))         { rotate_up(p); rotate_up(x); }  /* zig-zig */',
    '        else                                                { rotate_up(x); rotate_up(x); }  /* zig-zag */',
    '    }',
    '}',
    '',
    'Node *access(int key) {',
    '    Node *cur = root, *parent = NULL;',
    '    while (cur != NULL && cur->key != key) { parent = cur; cur = (key < cur->key) ? cur->left : cur->right; }',
    '    if (cur == NULL) {                                  /* not found: insert a new node right here */',
    '        cur = make_node(key);',
    '        cur->parent = parent;',
    '        if (parent == NULL)         root = cur;',
    '        else if (key < parent->key) parent->left  = cur;',
    '        else                        parent->right = cur;',
    '    }',
    '    splay(cur);                                         /* found or new, it is always splayed to the root */',
    '    return cur;',
    '}'
  ];
  var JAVA = [
    'static void rotateLeft(Node x) {',
    '    Node y = x.right;',
    '    x.right = y.left;',
    '    if (y.left != null) y.left.parent = x;',
    '    y.parent = x.parent;',
    '    if (x.parent == null)          root = y;',
    '    else if (x == x.parent.left)   x.parent.left  = y;',
    '    else                           x.parent.right = y;',
    '    y.left = x;',
    '    x.parent = y;',
    '}',
    '',
    'static void rotateRight(Node y) {           // mirror image of rotateLeft',
    '    Node x = y.left;',
    '    y.left = x.right;',
    '    if (x.right != null) x.right.parent = y;',
    '    x.parent = y.parent;',
    '    if (y.parent == null)           root = x;',
    '    else if (y == y.parent.left)    y.parent.left  = x;',
    '    else                            y.parent.right = x;',
    '    x.right = y;',
    '    y.parent = x;',
    '}',
    '',
    'static void rotateUp(Node x) {              // rotate x over its parent, promoting it one level',
    '    if (x == x.parent.left) rotateRight(x.parent); else rotateLeft(x.parent);',
    '}',
    '',
    'static void splay(Node x) {',
    '    while (x.parent != null) {',
    '        Node p = x.parent, g = p.parent;',
    '        if (g == null)                                    { rotateUp(x); }               // zig',
    '        else if ((x == p.left) == (p == g.left))           { rotateUp(p); rotateUp(x); }  // zig-zig',
    '        else                                                { rotateUp(x); rotateUp(x); }  // zig-zag',
    '    }',
    '}',
    '',
    'static Node access(int key) {',
    '    Node cur = root, parent = null;',
    '    while (cur != null && cur.key != key) { parent = cur; cur = (key < cur.key) ? cur.left : cur.right; }',
    '    if (cur == null) {                                   // not found: insert a new node right here',
    '        cur = makeNode(key);',
    '        cur.parent = parent;',
    '        if (parent == null)         root = cur;',
    '        else if (key < parent.key)  parent.left  = cur;',
    '        else                        parent.right = cur;',
    '    }',
    '    splay(cur);                                          // found or new, it is always splayed to the root',
    '    return cur;',
    '}'
  ];

  var X0 = 60, Y0 = 60, DX = 46, DY = 62;
  function layoutTree(root) {
    var pos = {}, i = 0;
    (function walk(n, depth) { if (!n) return; walk(n.left, depth + 1); pos[n.nid] = { x: X0 + i * DX, y: Y0 + depth * DY }; i++; walk(n.right, depth + 1); })(root, 0);
    return pos;
  }
  function syncTree(S, root, pos, tracked, styleOf) {
    var seen = {};
    (function walk(n) {
      if (!n) return;
      var cid = 'n' + n.nid; seen[cid] = 1;
      S.circle(cid, { x: pos[n.nid].x, y: pos[n.nid].y, r: 17, text: String(n.key), style: styleOf ? styleOf(n) : 'normal' });
      if (n.left) { var el = 'e' + n.nid + 'l'; seen[el] = 1; S.arrow(el, { from: cid, to: 'n' + n.left.nid, kind: 'center', head: false }); walk(n.left); }
      if (n.right) { var er = 'e' + n.nid + 'r'; seen[er] = 1; S.arrow(er, { from: cid, to: 'n' + n.right.nid, kind: 'center', head: false }); walk(n.right); }
    })(root);
    for (var id in tracked) if (!seen[id] && S.has(id)) S.remove(id);
    return seen;
  }
  function toStruct(n) { return n ? { k: n.key, l: toStruct(n.left), r: toStruct(n.right) } : null; }

  D.define({
    id: 'splay-tree',
    title: T('Splay ağacı: erişilen anahtar köke taşınır (zig, zig-zig, zig-zag)', 'Splay tree: the accessed key moves to the root (zig, zig-zig, zig-zag)'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('12 erişim: hepsi zig, zig-zig, zig-zag görülür', '12 accesses: zig, zig-zig, and zig-zag all occur'),
        data: { ops: [50, 30, 70, 20, 40, 60, 80, 10, 45, 20, 80, 10] } },
      { id: 'hard', level: 'hard', name: T('16 erişim, tekrar eden anahtarlar (yerellik: sık erişilen köke yakın kalır)', '16 accesses with repeats (locality: frequently accessed keys stay near the root)'),
        data: { ops: [64, 32, 96, 16, 48, 80, 112, 8, 24, 8, 96, 8, 40, 96, 8, 112] } },
      { id: 'edge-root-access', level: 'edge', name: T('Uç durum: kökü tekrar erişme (döndürme yok, zaten kökte)', 'Edge case: accessing the root again (no rotation, already there)'),
        data: { ops: [50, 30, 70, 20, 40, 50, 50, 60, 80, 50] } },
      { id: 'edge-new-key', level: 'edge', name: T('Uç durum: olmayan bir anahtara erişmek onu ekler ve köke taşır', 'Edge case: accessing a missing key inserts it and splays it to the root'),
        data: { ops: [50, 30, 70, 20, 40, 60, 80, 35, 999, -999] } },
      { id: 'edge-single', level: 'edge', name: T('Uç durum: boş ağaca tek erişim', 'Edge case: a single access on an empty tree'), data: { ops: [7] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.ops.length; },
    /** Independent splay: a PATH-ARRAY walk (no parent pointers at all — a plain array of ancestors built
     *  while descending) instead of build()'s parent-pointer iterative walk; the zig-zig/zig-zag cases are
     *  applied via the classic two-rotation composition rotR(rotR(g)) / rotL(rotL(g)) rather than build()'s
     *  rotate-up-twice formulation. */
    reference: function (d) {
      function rotR(y) { var x = y.l; y.l = x.r; x.r = y; return x; }
      function rotL(x) { var y = x.r; x.r = y.l; y.l = x; return y; }
      function bstInsert(node, key) {
        if (!node) return { k: key, l: null, r: null };
        if (key === node.k) return node;
        if (key < node.k) node.l = bstInsert(node.l, key); else node.r = bstInsert(node.r, key);
        return node;
      }
      function splay(root, key) {
        var path = [root], t = root;
        while (t.k !== key) { t = key < t.k ? t.l : t.r; path.push(t); }
        var idx = path.length - 1;
        while (idx > 0) {
          var x = path[idx], p = path[idx - 1], newSub;
          if (idx === 1) {
            newSub = (x === p.l) ? rotR(p) : rotL(p);
            path[0] = newSub; idx = 0;
          } else {
            var g = path[idx - 2];
            var pIsLeftOfG = (p === g.l), xIsLeftOfP = (x === p.l);
            var ggExists = idx - 3 >= 0;
            var gIsLeftOfGG = ggExists && (g === path[idx - 3].l);
            if (xIsLeftOfP === pIsLeftOfG) {
              newSub = pIsLeftOfG ? rotR(rotR(g)) : rotL(rotL(g));
            } else if (pIsLeftOfG) { g.l = rotL(p); newSub = rotR(g); }
            else { g.r = rotR(p); newSub = rotL(g); }
            if (ggExists) { if (gIsLeftOfGG) path[idx - 3].l = newSub; else path[idx - 3].r = newSub; }
            path[idx - 2] = newSub; idx = idx - 2;
          }
        }
        return path[0];
      }
      var root = null;
      d.ops.forEach(function (key) {
        if (!root) { root = { k: key, l: null, r: null }; return; }
        root = bstInsert(root, key);
        root = splay(root, key);
      });
      function struct(n) { return n ? { k: n.k, l: struct(n.l), r: struct(n.r) } : null; }
      return struct(root);
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 18 }[level];
      var lo = level === 'extreme' ? -300 : (level === 'hard' ? -60 : 1);
      var hi = level === 'extreme' ? 300 : (level === 'hard' ? 160 : 99);
      var ops = [], seen = [];
      for (var i = 0; i < n; i++) {
        if (seen.length > 2 && r() < 0.4) ops.push(seen[D.randInt(r, 0, seen.length - 1)]);
        else { var v = D.randInt(r, lo, hi); ops.push(v); seen.push(v); }
      }
      return { ops: ops };
    },
    input: {
      hint: T('Örnek: 50 30 70 20 40 30 50   (erişilecek anahtarlar, sırayla)', 'Example: 50 30 70 20 40 30 50   (keys to access, in order)'),
      parse: function (text) {
        var toks = String(text).trim().split(/[\s,;]+/).filter(Boolean);
        if (!toks.length) throw T('En az bir anahtar yazın.', 'Write at least one key.');
        if (toks.length > 40) throw T('En çok 40 anahtar.', 'At most 40 keys.');
        return { ops: toks.map(function (tok) { if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" bir tamsayı değil.', '"' + tok + '" is not an integer.'); return parseInt(tok, 10); }) };
      },
      format: function (d) { return d.ops.join(' '); },
      bad: ['', '5 x 7', '3.5 8']
    },
    build: function (S, d) {
      var NID = 0, root = null, tracked = {};
      function mkNode(key) { return { nid: NID++, key: key, left: null, right: null, parent: null }; }
      function rotateLeft(x) {
        var y = x.right; x.right = y.left; if (y.left) y.left.parent = x; y.parent = x.parent;
        if (!x.parent) root = y; else if (x === x.parent.left) x.parent.left = y; else x.parent.right = y;
        y.left = x; x.parent = y;
      }
      function rotateRight(y) {
        var x = y.left; y.left = x.right; if (x.right) x.right.parent = y; x.parent = y.parent;
        if (!y.parent) root = x; else if (y === y.parent.left) y.parent.left = x; else y.parent.right = x;
        x.right = y; y.parent = x;
      }
      function rotateUp(x) { if (x === x.parent.left) rotateRight(x.parent); else rotateLeft(x.parent); }

      var detailedDone = false;
      d.ops.forEach(function (key, ki) {
        S.at(ki);
        var cur = root, parent = null;
        while (cur && cur.key !== key) { parent = cur; cur = key < cur.key ? cur.left : cur.right; }
        var isNew = false;
        if (!cur) {
          isNew = true;
          cur = mkNode(key); cur.parent = parent;
          if (!parent) root = cur; else if (key < parent.key) parent.left = cur; else parent.right = cur;
        }
        /* narrate the first op deep enough to show a zig-zig or zig-zag (not just a lone zig): skip trivial
         * shallow accesses, which would waste the one detailed slot on the least interesting case. */
        var depth = 0; for (var anc = cur; anc.parent; anc = anc.parent) depth++;
        var detailed = !detailedDone && depth >= 2;
        if (detailed) detailedDone = true;
        if (isNew) {
          tracked = syncTree(S, root, layoutTree(root), tracked, function (n) { return n === cur ? 'new' : 'normal'; });
          var newLines = [38, 39, { n: 40, note: T('cur != NULL ve cur->key != key? hayır (bitti)', 'cur != NULL and cur->key != key? no (done)') },
                           { n: 41, note: T('cur == NULL? evet', 'cur == NULL? yes') }, 42, 43];
          S.step(T('`access(' + key + ')` — ağaçta yok: normal BST yeri bulunur, yeni yaprak olarak eklenir.', '`access(' + key + ')` — not in the tree: its normal BST spot is found, inserted as a new leaf.'), { c: newLines, java: newLines });
        } else if (detailed) {
          tracked = syncTree(S, root, layoutTree(root), tracked, function (n) { return n === cur ? 'hl' : 'normal'; });
          var foundLines = [38, 39, { n: 40, note: T('cur != NULL ve cur->key != key? hayır (bulundu)', 'cur != NULL and cur->key != key? no (found)') }];
          S.step(T('`access(' + key + ')` — anahtar bulundu.', '`access(' + key + ')` — key found.'), { c: foundLines, java: foundLines });
        }

        var seq = [];
        while (cur.parent) {
          var p = cur.parent, g = p.parent;
          if (!g) {
            seq.push('zig');
            if (detailed) { var h1 = {}; h1[cur.nid] = 'hl'; h1[p.nid] = 'active'; tracked = syncTree(S, root, layoutTree(root), tracked, function (n) { return h1[n.nid] || 'normal'; }); }
            rotateUp(cur);
            if (detailed) { tracked = syncTree(S, root, layoutTree(root), tracked, function (n) { return n === cur ? 'new' : 'normal'; }); var zigLines = [{ n: 32, note: T('g == NULL? evet', 'g == NULL? yes') }]; S.step(T('**zig**: ebeveyn zaten kök — tek bir döndürme.', '**zig**: the parent is already the root — a single rotation.'), { c: zigLines, java: zigLines }); }
          } else if ((cur === p.left) === (p === g.left)) {
            seq.push('zig-zig');
            if (detailed) { var h2 = {}; h2[cur.nid] = 'hl'; h2[p.nid] = 'active'; h2[g.nid] = 'active'; tracked = syncTree(S, root, layoutTree(root), tracked, function (n) { return h2[n.nid] || 'normal'; }); }
            rotateUp(p); rotateUp(cur);
            if (detailed) { tracked = syncTree(S, root, layoutTree(root), tracked, function (n) { return n === cur ? 'new' : 'normal'; }); var zigzigLines = [{ n: 32, skip: true }, { n: 33, note: T('aynı yönde çocuklar mı? evet', 'children on the same side? yes') }]; S.step(T('**zig-zig**: düğüm ve ebeveyni AYNI yönde çocuk — önce ebeveyn, sonra düğüm, aynı yönde iki döndürme.', '**zig-zig**: the node and its parent are children on the SAME side — parent first, then the node, same direction twice.'), { c: zigzigLines, java: zigzigLines }); }
          } else {
            seq.push('zig-zag');
            if (detailed) { var h3 = {}; h3[cur.nid] = 'hl'; h3[p.nid] = 'active'; h3[g.nid] = 'active'; tracked = syncTree(S, root, layoutTree(root), tracked, function (n) { return h3[n.nid] || 'normal'; }); }
            rotateUp(cur); rotateUp(cur);
            if (detailed) { tracked = syncTree(S, root, layoutTree(root), tracked, function (n) { return n === cur ? 'new' : 'normal'; }); var zigzagLines = [{ n: 32, skip: true }, { n: 33, skip: true }, 34]; S.step(T('**zig-zag**: düğüm ve ebeveyni FARKLI yönde çocuk — düğüm iki kez, önce bir yöne sonra öbür yöne döner.', '**zig-zag**: the node and its parent are children on OPPOSITE sides — the node rotates twice, once each way.'), { c: zigzagLines, java: zigzagLines }); }
          }
        }
        if (!detailed) {
          tracked = syncTree(S, root, layoutTree(root), tracked, function (n) { return n === cur ? 'new' : 'normal'; });
          /* Condensed summary of the whole splay() call, which may iterate 0+ times: line 30's while
             condition is noted with its FINAL (loop-ending, false) value -- the one truth value that
             holds for the step as a whole -- and lines 32/33 are noted with whether that case fired at
             least once during this access (seq lists every case that actually fired, in order). */
          var sawZig = seq.indexOf('zig') >= 0, sawZigZig = seq.indexOf('zig-zig') >= 0;
          var summaryLines = [29, { n: 30, note: T('x->parent != NULL? hayır (bitti)', 'x->parent != NULL? no (done)') }, 31,
                               { n: 32, note: T('g == NULL? ' + (sawZig ? 'evet (en az bir kez)' : 'hayır'), 'g == NULL? ' + (sawZig ? 'yes (at least once)' : 'no')) },
                               { n: 33, note: T('aynı yönde çocuklar mı? ' + (sawZigZig ? 'evet (en az bir kez)' : 'hayır'), 'children on the same side? ' + (sawZigZig ? 'yes (at least once)' : 'no')) },
                               34, 35, 36];
          S.step(T('`access(' + key + ')` — ' + (isNew ? 'eklendi ve ' : '') + 'köke splay edildi (' + (seq.length ? seq.join(', ') : 'zaten kökteydi') + ').',
                   '`access(' + key + ')` — ' + (isNew ? 'inserted and ' : '') + 'splayed to the root (' + (seq.length ? seq.join(', ') : 'was already the root') + ').'), { c: summaryLines, java: summaryLines });
        } else if (!seq.length) {
          S.step(T('`' + key + '` zaten kökte: `x->parent == NULL`, döngü hiç çalışmaz.', '`' + key + '` was already the root: `x->parent == NULL`, the loop never runs.'), { c: [{ n: 30, note: T('x->parent != NULL? hayır', 'x->parent != NULL? no') }], java: [{ n: 30, note: T('x->parent != NULL? hayır', 'x->parent != NULL? no') }] });
        }
      });

      S.at(null);
      S.result = toStruct(root);
      S.step(T('Bitti: ' + d.ops.length + ' erişim. Splay ağacının garantisi kötümser değil, AMORTİZE: herhangi bir tek erişim `O(n)` olabilir, ama `m` erişimin toplamı `O(m log n)` — ortalama `O(log n)`.',
               'Done: ' + d.ops.length + ' accesses. A splay tree\'s guarantee is not worst-case, it is AMORTIZED: any single access can be `O(n)`, but `m` accesses together cost `O(m log n)` — `O(log n)` on average.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
