/* Week 11 — red-black tree: insert. A red-black (RB) tree is a BST where every node is RED or BLACK, the
 * root is always BLACK, a RED node never has a RED child, and every root-to-NIL path has the same number of
 * BLACK nodes (NIL leaves count as black). A new key is inserted as a RED leaf (this cannot break the black-
 * height rule, only "no two reds in a row"), then `fixup` walks upward fixing that, case by case:
 *   case 1 — the uncle is RED:    recolor parent, uncle BLACK and grandparent RED, move up two levels.
 *   case 2 — uncle BLACK, "triangle" (z is the inner grandchild): rotate at the parent to make it a "line".
 *   case 3 — uncle BLACK, "line" (z is the outer grandchild): rotate at the grandparent, recolor, done.
 * Every node's current color is shown as R/B at its upper right. Data: {keys: [...]}. */
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
    'void fixup(Node *z) {',
    '    while (z->parent != NULL && z->parent->color == RED) {',
    '        Node *p = z->parent, *g = p->parent;',
    '        Node *u = (p == g->left) ? g->right : g->left;',
    '        if (u != NULL && u->color == RED) {                        /* case 1: red uncle */',
    '            p->color = BLACK; u->color = BLACK; g->color = RED; z = g; continue;',
    '        }',
    '        if (p == g->left) {',
    '            if (z == p->right) { z = p; rotate_left(z); p = z->parent; }     /* case 2: triangle */',
    '            p->color = BLACK; g->color = RED; rotate_right(g);               /* case 3: line */',
    '        } else {',
    '            if (z == p->left)  { z = p; rotate_right(z); p = z->parent; }',
    '            p->color = BLACK; g->color = RED; rotate_left(g);',
    '        }',
    '        break;',
    '    }',
    '    root->color = BLACK;',
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
    'static void rotateRight(Node y) {          // mirror image of rotateLeft',
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
    'static void fixup(Node z) {',
    '    while (z.parent != null && z.parent.color == RED) {',
    '        Node p = z.parent, g = p.parent;',
    '        Node u = (p == g.left) ? g.right : g.left;',
    '        if (u != null && u.color == RED) {                          // case 1: red uncle',
    '            p.color = BLACK; u.color = BLACK; g.color = RED; z = g; continue;',
    '        }',
    '        if (p == g.left) {',
    '            if (z == p.right) { z = p; rotateLeft(z); p = z.parent; }        // case 2: triangle',
    '            p.color = BLACK; g.color = RED; rotateRight(g);                  // case 3: line',
    '        } else {',
    '            if (z == p.left)   { z = p; rotateRight(z); p = z.parent; }',
    '            p.color = BLACK; g.color = RED; rotateLeft(g);',
    '        }',
    '        break;',
    '    }',
    '    root.color = BLACK;',
    '}'
  ];

  var X0 = 60, Y0 = 60, DX = 46, DY = 66;
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
      S.circle(cid, { x: pos[n.nid].x, y: pos[n.nid].y, r: 17, text: String(n.key), style: styleOf(n) });
      var aid = 'a' + n.nid; seen[aid] = 1;
      S.label(aid, { x: pos[n.nid].x + 14, y: pos[n.nid].y - 14, text: n.color, size: 11, anchor: 'start', bold: true, style: n.color === 'R' ? 'del' : 'dim' });
      if (n.left) { var el = 'e' + n.nid + 'l'; seen[el] = 1; S.arrow(el, { from: cid, to: 'n' + n.left.nid, kind: 'center', head: false }); walk(n.left); }
      if (n.right) { var er = 'e' + n.nid + 'r'; seen[er] = 1; S.arrow(er, { from: cid, to: 'n' + n.right.nid, kind: 'center', head: false }); walk(n.right); }
    })(root);
    for (var id in tracked) if (!seen[id] && S.has(id)) S.remove(id);
    return seen;
  }
  function defaultStyle(n) { return n.color === 'R' ? 'del' : 'normal'; }
  function toStruct(n) { return n ? { k: n.key, color: n.color, l: toStruct(n.left), r: toStruct(n.right) } : null; }

  D.define({
    id: 'red-black-insert',
    title: T('Kırmızı-siyah ağaç: ekleme (yeniden renklendirme ve döndürmeler)', 'Red-black tree: insert (recoloring and rotations)'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 anahtar, üç durumun (1, 2, 3) hepsi görülür', '10 keys, all three cases (1, 2, 3) occur'),
        data: { keys: [3, 69, 31, 88, 50, 58, 98, 29, 14, 75] } },
      { id: 'hard', level: 'hard', name: T('14 anahtar, döndürme gerektiren durumlar (2 ve 3) dahil', '14 keys, includes rotation cases (2 and 3)'),
        data: { keys: [50, 40, 60, 30, 45, 55, 70, 20, 35, 42, 48, 80, 75, 10] } },
      { id: 'edge-ascending', level: 'edge', name: T('Uç durum: artan sırada 10 anahtar — kırmızı-siyah yine de dengeli kalır', 'Edge case: 10 keys in ascending order — red-black still stays balanced'),
        data: { keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
      { id: 'edge-descending', level: 'edge', name: T('Uç durum: azalan sırada 10 anahtar', 'Edge case: 10 keys in descending order'),
        data: { keys: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10] } },
      { id: 'edge-duplicates', level: 'edge', name: T('Uç durum: 10 değer, çok sayıda yinelenen', 'Edge case: 10 values, many repeats'),
        data: { keys: [8, 8, 3, 8, 15, 3, 20, 3, 15, 8] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    /** Independent RB insert over plain {k,color,l,r,p} objects — a second, separately written copy of the
     *  same textbook algorithm (build() drives an equivalent but separately coded node/nid version). */
    reference: function (d) {
      var RED = 'R', BLACK = 'B', root = null;
      function rotL(x) {
        var y = x.r; x.r = y.l; if (y.l) y.l.p = x; y.p = x.p;
        if (!x.p) root = y; else if (x === x.p.l) x.p.l = y; else x.p.r = y;
        y.l = x; x.p = y;
      }
      function rotR(y) {
        var x = y.l; y.l = x.r; if (x.r) x.r.p = y; x.p = y.p;
        if (!y.p) root = x; else if (y === y.p.l) y.p.l = x; else y.p.r = x;
        x.r = y; y.p = x;
      }
      function fixup(z) {
        while (z.p && z.p.color === RED) {
          var p = z.p, g = p.p;
          var u = (p === g.l) ? g.r : g.l;
          if (u && u.color === RED) { p.color = BLACK; u.color = BLACK; g.color = RED; z = g; continue; }
          if (p === g.l) {
            if (z === p.r) { z = p; rotL(z); p = z.p; }
            p.color = BLACK; g.color = RED; rotR(g);
          } else {
            if (z === p.l) { z = p; rotR(z); p = z.p; }
            p.color = BLACK; g.color = RED; rotL(g);
          }
          break;
        }
        root.color = BLACK;
      }
      d.keys.forEach(function (key) {
        var y = null, x = root, z = { k: key, color: RED, l: null, r: null, p: null };
        while (x) { if (key === x.k) return; y = x; x = key < x.k ? x.l : x.r; }
        z.p = y;
        if (!y) root = z; else if (key < y.k) y.l = z; else y.r = z;
        fixup(z);
      });
      function struct(n) { return n ? { k: n.k, color: n.color, l: struct(n.l), r: struct(n.r) } : null; }
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
      var RED = 'R', BLACK = 'B';
      function mkNode(key) { return { nid: NID++, key: key, left: null, right: null, parent: null, color: RED }; }
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
      function styleFor(highlight) { return function (n) { return highlight[n.nid] || defaultStyle(n); }; }

      d.keys.forEach(function (key, ki) {
        S.at(ki);
        var y = null, x = root;
        while (x) {
          if (key === x.key) {
            tracked = syncTree(S, root, layoutTree(root), tracked, styleFor({}));
            S.step(T('`insert(' + key + ')` — `' + key + '` zaten var: **yinelenen**, değişiklik yok.', '`insert(' + key + ')` — `' + key + '` already exists: a **duplicate**, no change.'), { c: [], java: [] });
            return;
          }
          y = x; x = key < x.key ? x.left : x.right;
        }
        var z = mkNode(key);
        z.parent = y;
        if (!y) root = z; else if (key < y.key) y.left = z; else y.right = z;
        var h0 = {}; h0[z.nid] = 'new';
        tracked = syncTree(S, root, layoutTree(root), tracked, styleFor(h0));
        S.step(T('`insert(' + key + ')` — her zaman olduğu gibi bir yaprak eklenir, ama **KIRMIZI (RED)** renkte: bu, "art arda iki kırmızı yok" kuralını bozabilir, siyah-yükseklik kuralını asla bozmaz.',
                 '`insert(' + key + ')` — inserted as a leaf as usual, but **RED**: this can only break "no two reds in a row", never the black-height rule.'), { c: [], java: [] });

        var zc = z, steps = 0;
        while (zc.parent && zc.parent.color === RED && steps < 20) {
          steps++;
          var p = zc.parent, g = p.parent;
          var pIsLeftOfG = (p === g.left);
          var u = pIsLeftOfG ? g.right : g.left;
          var line28Note = T('p == g->left? ' + (pIsLeftOfG ? 'evet -> amca g->right' : 'hayır -> amca g->left'),
                              'p == g->left? ' + (pIsLeftOfG ? 'yes -> uncle is g->right' : 'no -> uncle is g->left'));
          if (u && u.color === RED) {
            p.color = BLACK; u.color = BLACK; g.color = RED;
            var h1 = {}; h1[p.nid] = 'hl'; h1[u.nid] = 'hl'; h1[g.nid] = 'active';
            tracked = syncTree(S, root, layoutTree(root), tracked, styleFor(h1));
            var case1Lines = [25, { n: 26, note: T('z->parent kırmızı mı? evet', 'z->parent red? yes') }, 27,
                               { n: 28, note: line28Note }, { n: 29, note: T('amca kırmızı mı? evet', 'uncle red? yes') }, 30];
            S.step(T('**Durum 1 — kırmızı amca (uncle)**: `' + p.key + '` ve amca `' + u.key + '` siyaha, büyükanne/baba `' + g.key + '` kırmızıya boyanır; kontrol `' + g.key + '`\'den devam eder.',
                     '**Case 1 — red uncle**: `' + p.key + '` and uncle `' + u.key + '` turn black, grandparent `' + g.key + '` turns red; we continue checking from `' + g.key + '`.'), { c: case1Lines, java: case1Lines });
            zc = g;
            continue;
          }
          var pIsLeft = pIsLeftOfG;
          var caseTri = pIsLeft ? zc === p.right : zc === p.left;
          if (caseTri) {
            var h2 = {}; h2[zc.nid] = 'hl'; h2[p.nid] = 'active'; h2[g.nid] = 'active';
            tracked = syncTree(S, root, layoutTree(root), tracked, styleFor(h2));
            /* p->parent is g here (always non-NULL, the loop only runs while a grandparent exists), so
               inside the rotation the "no parent" branch never fires (noted false) and the "which side"
               branch is decided by pIsLeft itself -- both single, unambiguous facts about THIS call. */
            var relinkChild = pIsLeft ? (p.right && p.right.left) : (p.left && p.left.right);
            var relinkNote = T('taşınan çocuk var mı? ' + (relinkChild ? 'evet' : 'hayır'), 'the moved child exists? ' + (relinkChild ? 'yes' : 'no'));
            var rotLines = pIsLeft
              ? [1, 2, 3, { n: 4, note: relinkNote }, 5, { n: 6, note: T('x->parent == NULL? hayır', 'x->parent == NULL? no') }, { n: 7, note: T('x == x->parent->left? evet', 'x == x->parent->left? yes') }, 9, 10]
              : [13, 14, 15, { n: 16, note: relinkNote }, 17, { n: 18, note: T('y->parent == NULL? hayır', 'y->parent == NULL? no') }, { n: 19, note: T('y == y->parent->left? hayır', 'y == y->parent->left? no') }, 21, 22];
            S.step(T('**Durum 2 — üçgen (triangle)**: amca siyah, `' + zc.key + '` ebeveyninin "iç" çocuğu. Önce `' + p.key + '` üzerinde bir döndürme yapılır, "doğrusal (line)" biçime getirilir.',
                     '**Case 2 — triangle**: uncle is black, `' + zc.key + '` is the "inner" grandchild. First a rotation at `' + p.key + '` turns it into a "line".'), { c: rotLines, java: rotLines });
            zc = p;
            if (pIsLeft) rotateLeft(zc); else rotateRight(zc);
            p = zc.parent;
          }
          p.color = BLACK; g.color = RED;
          var h3 = {}; h3[p.nid] = 'new'; h3[g.nid] = 'active';
          tracked = syncTree(S, root, layoutTree(root), tracked, styleFor(h3));
          if (pIsLeft) rotateRight(g); else rotateLeft(g);
          var pos3 = layoutTree(root);
          tracked = syncTree(S, root, pos3, tracked, styleFor({}));
          var tri23Note = T('z == ' + (pIsLeft ? "p->right" : "p->left") + '? ' + (caseTri ? 'evet' : 'hayır'), 'z == ' + (pIsLeft ? 'p->right' : 'p->left') + '? ' + (caseTri ? 'yes' : 'no'));
          var case3Lines = pIsLeft
            ? [{ n: 32, note: T('p == g->left? evet', 'p == g->left? yes') }, caseTri ? { n: 33, note: tri23Note } : { n: 33, skip: true }, 34]
            : [35, caseTri ? { n: 36, note: tri23Note } : { n: 36, skip: true }, 37];
          S.step(T('**Durum 3 — doğrusal (line)**: `' + p.key + '` siyaha, `' + g.key + '` kırmızıya boyanır, `' + g.key + '` üzerinde tek bir döndürme yapılır. Bitti — kırmızı-kırmızı ihlali giderildi.',
                   '**Case 3 — line**: `' + p.key + '` turns black, `' + g.key + '` turns red, a single rotation at `' + g.key + '`. Done — the red-red violation is fixed.'), { c: case3Lines, java: case3Lines });
          break;
        }
        if (root.color !== BLACK) {
          root.color = BLACK;
          tracked = syncTree(S, root, layoutTree(root), tracked, styleFor({}));
          S.step(T('Kök her zaman **SİYAH** olmalı: gerekirse burada yeniden boyanır.', 'The root must always be **BLACK**: recolored here if needed.'), { c: [41], java: [41] });
        }
      });

      S.at(null);
      S.result = toStruct(root);
      S.step(T('Bitti: ' + d.keys.length + ' anahtar eklendi. Her `fixup`, en fazla O(log n) adım kırmızı-kırmızı ihlalini yukarı taşır, sonra en fazla bir (tek ya da çift) döndürmeyle biter — `insert` yine `O(log n)`.',
               'Done: ' + d.keys.length + ' keys inserted. Every `fixup` carries the red-red violation upward for at most O(log n) steps, then finishes with at most one (single or double) rotation — `insert` stays `O(log n)`.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
