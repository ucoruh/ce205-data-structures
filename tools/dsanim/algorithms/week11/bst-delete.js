/* Week 11 — binary search tree (BST): delete. Builds the tree from `keys` (fast — see bst-insert.js), then
 * deletes each key in `deletes` in order. Every deletion reduces to one of three cases, decided at runtime:
 * the node is a LEAF (no children), has ONE CHILD, or has TWO CHILDREN (the in-order successor — the
 * smallest key in the right subtree — replaces it, and the successor's own, now-duplicate, node is removed
 * instead, which is always a leaf-or-one-child case). Deleting a missing key is a no-op.
 * Data: {keys: [...], deletes: [...]}. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'Node *bst_delete(Node *root, int key) {',
    '    Node *cur = root, *parent = NULL;',
    '    while (cur != NULL && key != cur->key) {',
    '        parent = cur;',
    '        cur = (key < cur->key) ? cur->left : cur->right;',
    '    }',
    '    if (cur == NULL) return root;                     /* not found: no-op */',
    '    if (cur->left != NULL && cur->right != NULL) {',
    '        Node *succ = cur->right, *succParent = cur;',
    '        while (succ->left != NULL) { succParent = succ; succ = succ->left; }',
    '        cur->key = succ->key;                          /* copy successor key up */',
    '        parent = succParent;',
    '        cur = succ;                                    /* now splice out succ: <= 1 child */',
    '    }',
    '    Node *child = (cur->left != NULL) ? cur->left : cur->right;',
    '    if (parent == NULL)           root = child;',
    '    else if (parent->left == cur) parent->left  = child;',
    '    else                          parent->right = child;',
    '    free(cur);',
    '    return root;',
    '}'
  ];
  var JAVA = [
    'static Node bstDelete(Node root, int key) {',
    '    Node cur = root, parent = null;',
    '    while (cur != null && key != cur.key) {',
    '        parent = cur;',
    '        cur = (key < cur.key) ? cur.left : cur.right;',
    '    }',
    '    if (cur == null) return root;                      // not found: no-op',
    '    if (cur.left != null && cur.right != null) {',
    '        Node succ = cur.right, succParent = cur;',
    '        while (succ.left != null) { succParent = succ; succ = succ.left; }',
    '        cur.key = succ.key;                             // copy successor key up',
    '        parent = succParent;',
    '        cur = succ;                                     // now splice out succ: <= 1 child',
    '    }',
    '    Node child = (cur.left != null) ? cur.left : cur.right;',
    '    if (parent == null)            root = child;',
    '    else if (parent.left == cur)   parent.left  = child;',
    '    else                           parent.right = child;',
    '    return root;',
    '}'
  ];

  var X0 = 60, Y0 = 60, DX = 54, DY = 78;
  function layoutTree(root) {
    var pos = {}, i = 0;
    (function walk(n, depth) { if (!n) return; walk(n.left, depth + 1); pos[n.nid] = { x: X0 + i * DX, y: Y0 + depth * DY }; i++; walk(n.right, depth + 1); })(root, 0);
    return pos;
  }
  function syncTree(S, root, pos, tracked, styleOf) {
    var seen = {};
    if (!root) {
      seen.emptylbl = 1;
      S.label('emptylbl', { x: 60, y: 60, text: T('boş ağaç', 'empty tree'), anchor: 'start', size: 16, style: 'dim' });
    }
    (function walk(n) {
      if (!n) return;
      var cid = 'n' + n.nid; seen[cid] = 1;
      S.circle(cid, { x: pos[n.nid].x, y: pos[n.nid].y, text: String(n.key), style: styleOf ? styleOf(n) : 'normal' });
      if (n.left) { var el = 'e' + n.nid + 'l'; seen[el] = 1; S.arrow(el, { from: cid, to: 'n' + n.left.nid, kind: 'center', head: false }); walk(n.left); }
      if (n.right) { var er = 'e' + n.nid + 'r'; seen[er] = 1; S.arrow(er, { from: cid, to: 'n' + n.right.nid, kind: 'center', head: false }); walk(n.right); }
    })(root);
    for (var id in tracked) if (!seen[id] && S.has(id)) S.remove(id);
    return seen;
  }
  function ins(node, key, nid) { if (!node) return { nid: nid.v++, key: key, left: null, right: null }; if (key === node.key) return node; if (key < node.key) node.left = ins(node.left, key, nid); else node.right = ins(node.right, key, nid); return node; }
  function toStruct(n) { return n ? { k: n.key, l: toStruct(n.left), r: toStruct(n.right) } : null; }

  D.define({
    id: 'bst-delete',
    title: T('İkili arama ağacı: silme (delete)', 'Binary search tree: delete'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 anahtar, 4 silme (yaprak, tek çocuk, iki çocuk karışık)', '10 keys, 4 deletes (a mix of leaf, one-child, two-children)'),
        data: { keys: [50, 30, 70, 20, 40, 60, 80, 35, 65, 90], deletes: [35, 70, 50, 20] } },
      { id: 'hard', level: 'hard', name: T('14 anahtar, negatif değerler, 6 silme (kök dahil)', '14 keys with negative values, 6 deletes (including the root)'),
        data: { keys: [10, -5, 25, 40, -20, 5, 17, 30, 45, 3, 22, -15, 12, 60], deletes: [-5, 40, 10, 17, 60, 3] } },
      { id: 'edge-not-found', level: 'edge', name: T('Uç durum: var olmayan anahtarı silmeye çalışma (no-op)', 'Edge case: trying to delete a key that is not there (no-op)'),
        data: { keys: [50, 30, 70, 20, 40, 60, 80, 10, 45, 90], deletes: [999, 30, -1000] } },
      { id: 'edge-to-empty', level: 'edge', name: T('Uç durum: bütün anahtarları sil, ağaç boşalsın', 'Edge case: delete every key, down to an empty tree'),
        data: { keys: [5, 3, 8, 1, 4, 7, 9, 2, 6, 10], deletes: [10, 6, 2, 9, 7, 4, 1, 8, 3, 5] } },
      { id: 'edge-single', level: 'edge', name: T('Uç durum: tek düğümü sil', 'Edge case: delete the only node'), data: { keys: [7], deletes: [7] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    /** Independent RECURSIVE delete over plain {k,l,r} objects — build() uses an iterative, parent-tracking walk. */
    reference: function (d) {
      function build(node, key) { if (!node) return { k: key, l: null, r: null }; if (key === node.k) return node; if (key < node.k) node.l = build(node.l, key); else node.r = build(node.r, key); return node; }
      function del(node, key) {
        if (!node) return null;
        if (key < node.k) { node.l = del(node.l, key); return node; }
        if (key > node.k) { node.r = del(node.r, key); return node; }
        if (!node.l) return node.r;
        if (!node.r) return node.l;
        var s = node.r;
        while (s.l) s = s.l;
        node.k = s.k;
        node.r = del(node.r, s.k);
        return node;
      }
      var root = null;
      d.keys.forEach(function (k) { root = build(root, k); });
      d.deletes.forEach(function (k) { root = del(root, k); });
      return root;
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level];
      var lo = level === 'extreme' ? -500 : (level === 'hard' ? -99 : 1);
      var hi = level === 'extreme' ? 500 : (level === 'hard' ? 199 : 99);
      var keys = [];
      for (var i = 0; i < n; i++) keys.push(D.randInt(r, lo, hi));
      var nd = { easy: 3, normal: 4, hard: 6, extreme: 7 }[level], deletes = [];
      for (var j = 0; j < nd; j++) deletes.push(r() < 0.75 && keys.length ? keys[D.randInt(r, 0, keys.length - 1)] : D.randInt(r, lo, hi));
      return { keys: keys, deletes: deletes };
    },
    input: {
      hint: T('Örnek: keys=50,30,70,20,40 deletes=30,50', 'Example: keys=50,30,70,20,40 deletes=30,50'),
      parse: function (text) {
        var m = /^\s*keys=([^\s]+)\s+deletes=([^\s]+)\s*$/i.exec(String(text));
        if (!m) throw T('Biçim: keys=... deletes=...', 'Format: keys=... deletes=...');
        function nums(s, label) {
          var toks = s.split(',').filter(Boolean);
          if (!toks.length) throw T(label + ' en az bir değer içermeli.', label + ' needs at least one value.');
          return toks.map(function (t) { if (!/^-?\d+$/.test(t)) throw T('"' + t + '" bir tamsayı değil.', '"' + t + '" is not an integer.'); return parseInt(t, 10); });
        }
        return { keys: nums(m[1], 'keys'), deletes: nums(m[2], 'deletes') };
      },
      format: function (d) { return 'keys=' + d.keys.join(',') + ' deletes=' + d.deletes.join(','); },
      bad: ['', 'keys=5,x deletes=5', 'keys=5,7', 'deletes=5 keys=5,7']
    },
    build: function (S, d) {
      var nid = { v: 0 }, root = null, tracked = {};
      d.keys.forEach(function (k) { root = ins(root, k, nid); });
      var pos0 = layoutTree(root);
      tracked = syncTree(S, root, pos0, tracked, function () { return 'normal'; });
      S.step(T('`keys` içindeki ' + d.keys.length + ' anahtarı ekleyerek bu BST\'yi kurduk (bkz: bst-insert). Şimdi `deletes` içindeki anahtarları sırayla sileceğiz.',
               'We built this BST by inserting the ' + d.keys.length + ' keys of `keys` (see: bst-insert). Now we delete the keys in `deletes`, in order.'), { c: [1], java: [1] });

      d.deletes.forEach(function (key, di) {
        var detailed = di === 0;
        var cur = root, parent = null, lines = { c: [1, 2], java: [1, 2] }, path = [];
        while (cur && key !== cur.key) {
          path.push(cur);
          var goLeft = key < cur.key;
          /* Line 5 is a single ternary (`cur = (key < cur->key) ? cur->left : cur->right;`) -- the LINE
             always runs; only which side of the ternary fires differs, so it is never skip:true, just
             noted with which way the ternary went (never both ways in the same accumulated summary,
             which a skip:true here would risk once several iterations are concatenated below). */
          var line5Note = T(key + ' < ' + cur.key + '? ' + (goLeft ? 'evet' : 'hayır'), key + ' < ' + cur.key + '? ' + (goLeft ? 'yes' : 'no'));
          var stepLines = { c: [{ n: 3, note: T('cur != NULL ve ' + key + ' != ' + cur.key + '? evet', 'cur != NULL and ' + key + ' != ' + cur.key + '? yes') }, 4,
                                 { n: 5, note: line5Note }],
                             java: [{ n: 3, note: T('cur != null ve ' + key + ' != ' + cur.key + '? evet', 'cur != null and ' + key + ' != ' + cur.key + '? yes') }, 4,
                                    { n: 5, note: line5Note }] };
          if (detailed) {
            tracked = syncTree(S, root, pos0, tracked, function (n) { return n === cur ? 'hl' : (path.indexOf(n) >= 0 ? 'active' : 'normal'); });
            S.step(T('`delete(' + key + ')` — aranıyor: düğüm `' + cur.key + '`, `' + key + ' ' + (goLeft ? '<' : '>') + ' ' + cur.key + '`, ' + (goLeft ? 'sola' : 'sağa') + '.',
                     '`delete(' + key + ')` — searching: node `' + cur.key + '`, `' + key + ' ' + (goLeft ? '<' : '>') + ' ' + cur.key + '`, go ' + (goLeft ? 'left' : 'right') + '.'), stepLines);
          } else { lines.c = lines.c.concat(stepLines.c); lines.java = lines.java.concat(stepLines.java); }
          parent = cur;
          cur = goLeft ? cur.left : cur.right;
        }
        if (!cur) {
          lines.c = lines.c.concat({ n: 3, note: T('cur == NULL: bulunamadı', 'cur == NULL: not found') }, { n: 7, note: T('cur == NULL? evet', 'cur == NULL? yes') });
          lines.java = lines.java.concat({ n: 3, note: T('cur == null: bulunamadı', 'cur == null: not found') }, { n: 7, note: T('cur == null? evet', 'cur == null? yes') });
          S.step(T('`delete(' + key + ')` — ağaçta yok: **hiçbir şey yapılmaz** (no-op).', '`delete(' + key + ')` — not in the tree: **no-op**.'), lines);
          return;
        }
        var kind, twoChildren = cur.left && cur.right;
        lines.c.push({ n: 3, note: T(key + ' != ' + cur.key + '? hayır (bulundu)', key + ' != ' + cur.key + '? no (found)') },
                      { n: 7, note: T('cur == NULL? hayır', 'cur == NULL? no') },
                      twoChildren ? { n: 8, note: T('iki çocuğu var mı? evet', 'has two children? yes') } : { n: 8, note: T('iki çocuğu var mı? hayır', 'has two children? no') });
        lines.java.push({ n: 3, note: T(key + ' != ' + cur.key + '? hayır (bulundu)', key + ' != ' + cur.key + '? no (found)') },
                         { n: 7, note: T('cur == null? hayır', 'cur == null? no') },
                         twoChildren ? { n: 8, note: T('iki çocuğu var mı? evet', 'has two children? yes') } : { n: 8, note: T('iki çocuğu var mı? hayır', 'has two children? no') });
        var removedKey = cur.key;
        if (twoChildren) {
          kind = 'two';
          var succ = cur.right, succParent = cur;
          while (succ.left) { succParent = succ; succ = succ.left; }
          /* Line 10's while loop is summarized as one step regardless of how many times it iterated to
             reach succ (a leftmost-of-the-right-subtree walk) -- noted with the final (false, loop-ending)
             state, since that is the one truth value that holds for the step as a whole. */
          var succWhileLines = { c: [9, { n: 10, note: T('succ->left != NULL? hayır (artık en sol düğüm)', 'succ->left != NULL? no (now the leftmost node)') }],
                                  java: [9, { n: 10, note: T('succ->left != null? hayır (artık en sol düğüm)', 'succ->left != null? no (now the leftmost node)') }] };
          if (detailed) {
            tracked = syncTree(S, root, pos0, tracked, function (n) { return n === cur ? 'hl' : (n === succ ? 'active' : 'normal'); });
            S.step(T('İki çocuklu düğüm: sağ alt ağacın en küçüğü olan **ardıl (in-order successor)** `' + succ.key + '` bulunur.',
                     'Two children: we find the **in-order successor** `' + succ.key + '`, the smallest key in the right subtree.'),
                   succWhileLines);
          } else { lines.c = lines.c.concat(succWhileLines.c); lines.java = lines.java.concat(succWhileLines.java); }
          cur.key = succ.key;
          if (detailed) {
            tracked = syncTree(S, root, pos0, tracked, function (n) { return n === cur ? 'new' : (n === succ ? 'del' : 'normal'); });
            S.step(T('`' + removedKey + '`, ardılın anahtarı `' + succ.key + '` ile değiştirilir. Şimdi asıl silinecek olan, (en fazla bir çocuklu) ardıl düğümdür.',
                     '`' + removedKey + '` is overwritten with the successor\'s key `' + succ.key + '`. Now the node actually removed is the successor (at most one child).'),
                   { c: [11, 12, 13], java: [11, 12, 13] });
          } else { lines.c = lines.c.concat(11, 12, 13); lines.java = lines.java.concat(11, 12, 13); }
          parent = succParent;
          cur = succ;
        } else {
          kind = cur.left || cur.right ? 'one' : 'leaf';
        }
        var child = cur.left || cur.right || null;
        var newRootFlag = parent === null;
        var line15Note = T('cur->left != NULL? ' + (cur.left ? 'evet' : 'hayır'), 'cur->left != NULL? ' + (cur.left ? 'yes' : 'no'));
        var lastLines = { c: [{ n: 15, note: line15Note }], java: [{ n: 15, note: line15Note }] };
        var line16Note = T('parent == NULL? ' + (newRootFlag ? 'evet' : 'hayır'), 'parent == NULL? ' + (newRootFlag ? 'yes' : 'no'));
        if (newRootFlag) lastLines.c.push({ n: 16, note: line16Note });
        else if (parent.left === cur) lastLines.c.push({ n: 16, skip: true }, { n: 17, note: T('parent->left == cur? evet', 'parent->left == cur? yes') });
        else lastLines.c.push({ n: 16, skip: true }, { n: 17, skip: true }, 18);
        if (newRootFlag) lastLines.java.push({ n: 16, note: line16Note });
        else if (parent.left === cur) lastLines.java.push({ n: 16, skip: true }, { n: 17, note: T('parent->left == cur? evet', 'parent->left == cur? yes') });
        else lastLines.java.push({ n: 16, skip: true }, { n: 17, skip: true }, 18);
        lastLines.c.push(19, 20); lastLines.java.push(19, 20);
        if (newRootFlag) root = child;
        else if (parent.left === cur) parent.left = child; else parent.right = child;
        var kindText = { leaf: T('yaprak (leaf, çocuğu yok)', 'a leaf (no children)'), one: T('tek çocuklu', 'has one child'), two: T('iki çocuklu (ardıl kopyalandı)', 'had two children (successor copied up)') }[kind];
        if (detailed) {
          var posf = layoutTree(root);
          tracked = syncTree(S, root, posf, tracked, function () { return 'normal'; });
          S.step(T('Düğüm `' + cur.key + '` çıkarılır (' + kindText.tr + '): ebeveyni doğrudan ' + (child ? '`' + child.key + '`' : 'NULL') + '\'e bağlanır.',
                   'Node `' + cur.key + '` is removed (' + kindText.en + '): its parent is linked directly to ' + (child ? '`' + child.key + '`' : 'NULL') + '.'), lastLines);
        } else {
          lines.c = lines.c.concat(lastLines.c); lines.java = lines.java.concat(lastLines.java);
          var posf2 = layoutTree(root);
          tracked = syncTree(S, root, posf2, tracked, function () { return 'normal'; });
          S.step(T('`delete(' + key + ')` — ' + kindText.tr + ', çıkarıldı.', '`delete(' + key + ')` — ' + kindText.en + ', removed.'), lines);
        }
      });

      var finalPos = layoutTree(root);
      tracked = syncTree(S, root, finalPos, tracked, function () { return 'normal'; });
      S.result = toStruct(root);
      S.step(root
        ? T('Bitti: ' + d.deletes.length + ' silme işlendi. Kalan ağaç hâlâ geçerli bir BST.', 'Done: ' + d.deletes.length + ' deletes processed. The remaining tree is still a valid BST.')
        : T('Bitti: ağaç tamamen boşaldı (`root == NULL`).', 'Done: the tree is completely empty (`root == NULL`).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
