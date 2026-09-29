/* Week 11 — AVL tree: delete. Splicing out a node is exactly bst-delete.js's leaf / one-child / two-children
 * (successor) logic; the difference is what happens afterwards. Unlike insert (at most one rotation), a
 * delete can need a rotation at EVERY level on the way back up to the root, because removing a node can
 * shrink a subtree's height and that shrink keeps propagating upward. Data: {keys: [...], deletes: [...]}. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'Node *avl_delete(Node *root, int key) {',
    '    if (root == NULL) return NULL;                      /* not found: no-op */',
    '    if (key < root->key)      root->left  = avl_delete(root->left, key);',
    '    else if (key > root->key) root->right = avl_delete(root->right, key);',
    '    else {',
    '        if (root->left == NULL)  { Node *r = root->right; free(root); return rebalance(r); }',
    '        if (root->right == NULL) { Node *l = root->left;  free(root); return rebalance(l); }',
    '        Node *succ = root->right;',
    '        while (succ->left != NULL) succ = succ->left;',
    '        root->key = succ->key;',
    '        root->right = avl_delete(root->right, succ->key);',
    '    }',
    '    update_height(root);',
    '    return rebalance(root);           /* may cascade: more than one level can rotate, unlike insert */',
    '}'
  ];
  var JAVA = [
    'static Node avlDelete(Node root, int key) {',
    '    if (root == null) return null;                       // not found: no-op',
    '    if (key < root.key)      root.left  = avlDelete(root.left, key);',
    '    else if (key > root.key) root.right = avlDelete(root.right, key);',
    '    else {',
    '        if (root.left == null)  { Node r = root.right; return rebalance(r); }',
    '        if (root.right == null) { Node l = root.left;  return rebalance(l); }',
    '        Node succ = root.right;',
    '        while (succ.left != null) succ = succ.left;',
    '        root.key = succ.key;',
    '        root.right = avlDelete(root.right, succ.key);',
    '    }',
    '    updateHeight(root);',
    '    return rebalance(root);            // may cascade: more than one level can rotate, unlike insert',
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
    if (!root) {
      seen.emptylbl = 1;
      S.label('emptylbl', { x: 60, y: 60, text: T('boş ağaç', 'empty tree'), anchor: 'start', size: 16, style: 'dim' });
    }
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
    id: 'avl-delete',
    title: T('AVL ağacı: silme (yeniden dengeleme yukarı doğru katlanabilir)', 'AVL tree: delete (rebalancing can cascade upward)'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('12 anahtar, 4 silme (yaprak/tek çocuk/iki çocuk karışık)', '12 keys, 4 deletes (a mix of leaf/one-child/two-children)'),
        data: { keys: [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 90], deletes: [10, 25, 90, 50] } },
      { id: 'hard', level: 'hard', name: T('16 anahtar, 6 silme, en az biri köke kadar katlanan yeniden dengeleme', '16 keys, 6 deletes, at least one cascades rebalancing up to the root'),
        data: { keys: [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 85, 90], deletes: [90, 85, 80, 75, 55, 45] } },
      { id: 'edge-not-found', level: 'edge', name: T('Uç durum: var olmayan anahtarı silme (no-op)', 'Edge case: deleting a key that is not there (no-op)'),
        data: { keys: [50, 30, 70, 20, 40, 60, 80, 10, 45, 90], deletes: [999, 30, -1000] } },
      { id: 'edge-to-empty', level: 'edge', name: T('Uç durum: bütün anahtarları sil, ağaç boşalsın (her adımda dengeli kalır)', 'Edge case: delete every key, down to empty (stays balanced at every step)'),
        data: { keys: [5, 3, 8, 1, 4, 7, 9, 2, 6, 10], deletes: [10, 6, 2, 9, 7, 4, 1, 8, 3, 5] } },
      { id: 'edge-single', level: 'edge', name: T('Uç durum: tek düğümü sil', 'Edge case: delete the only node'), data: { keys: [7], deletes: [7] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    /** Independent recursive AVL insert+delete over plain {k,l,r,h} objects — build() drives the same
     *  splice-and-cascade idea iteratively, with explicit ancestor-path bookkeeping. */
    reference: function (d) {
      function h(n) { return n ? n.h : -1; }
      function upd(n) { n.h = 1 + Math.max(h(n.l), h(n.r)); }
      function rotR(y) { var x = y.l; y.l = x.r; x.r = y; upd(y); upd(x); return x; }
      function rotL(x) { var y = x.r; x.r = y.l; y.l = x; upd(x); upd(y); return y; }
      function rebalance(n) {
        if (!n) return n;
        var bf = h(n.l) - h(n.r);
        if (bf > 1) { var cbf = h(n.l.l) - h(n.l.r); if (cbf >= 0) return rotR(n); n.l = rotL(n.l); return rotR(n); }
        if (bf < -1) { var cbf2 = h(n.r.l) - h(n.r.r); if (cbf2 <= 0) return rotL(n); n.r = rotR(n.r); return rotL(n); }
        return n;
      }
      function ins(node, key) {
        if (!node) return { k: key, l: null, r: null, h: 0 };
        if (key === node.k) return node;
        if (key < node.k) node.l = ins(node.l, key); else node.r = ins(node.r, key);
        upd(node); return rebalance(node);
      }
      function del(node, key) {
        if (!node) return null;
        if (key < node.k) node.l = del(node.l, key);
        else if (key > node.k) node.r = del(node.r, key);
        else {
          if (!node.l) return rebalance(node.r);
          if (!node.r) return rebalance(node.l);
          var s = node.r;
          while (s.l) s = s.l;
          node.k = s.k;
          node.r = del(node.r, s.k);
        }
        upd(node); return rebalance(node);
      }
      var root = null;
      d.keys.forEach(function (k) { root = ins(root, k); });
      d.deletes.forEach(function (k) { root = del(root, k); });
      function struct(n) { return n ? { k: n.k, bf: h(n.l) - h(n.r), l: struct(n.l), r: struct(n.r) } : null; }
      return struct(root);
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level];
      var lo = level === 'extreme' ? -300 : (level === 'hard' ? -60 : 1);
      var hi = level === 'extreme' ? 300 : (level === 'hard' ? 160 : 99);
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
      var NID = 0, root = null, tracked = {};
      function mkNode(key) { return { nid: NID++, key: key, left: null, right: null, height: 0 }; }
      function h(n) { return n ? n.height : -1; }
      function upd(n) { n.height = 1 + Math.max(h(n.left), h(n.right)); }
      function rotateRight(y) { var x = y.left; y.left = x.right; x.right = y; upd(y); upd(x); return x; }
      function rotateLeft(x) { var y = x.right; x.right = y.left; y.left = x; upd(x); upd(y); return y; }
      function rebalanceAt(node) {
        upd(node);
        var bf = h(node.left) - h(node.right);
        if (bf > 1) { var cbf = h(node.left.left) - h(node.left.right); if (cbf >= 0) return { sub: rotateRight(node), c: 'LL' }; node.left = rotateLeft(node.left); return { sub: rotateRight(node), c: 'LR' }; }
        if (bf < -1) { var cbf2 = h(node.right.left) - h(node.right.right); if (cbf2 <= 0) return { sub: rotateLeft(node), c: 'RR' }; node.right = rotateRight(node.right); return { sub: rotateLeft(node), c: 'RL' }; }
        return { sub: node, c: null };
      }
      function silentInsert(key) {
        if (!root) { root = mkNode(key); return; }
        var cur = root, path = [];
        while (true) { path.push(cur); if (key === cur.key) return; if (key < cur.key) { if (!cur.left) { cur.left = mkNode(key); break; } cur = cur.left; } else { if (!cur.right) { cur.right = mkNode(key); break; } cur = cur.right; } }
        for (var i = path.length - 1; i >= 0; i--) { var r = rebalanceAt(path[i]); if (i > 0) { if (path[i - 1].left === path[i]) path[i - 1].left = r.sub; else path[i - 1].right = r.sub; } else root = r.sub; if (r.c) break; /* insert: a rotation restores the pre-insertion height, ancestors above are unaffected */ }
      }
      d.keys.forEach(silentInsert);
      var pos0 = layoutTree(root);
      tracked = syncTree(S, root, pos0, tracked, function () { return 'normal'; }, h);
      S.step(T('`keys` içindeki ' + d.keys.length + ' anahtarı ekleyerek bu AVL ağacını kurduk (bkz: avl-insert). Şimdi `deletes` içindeki anahtarları sırayla sileceğiz.',
               'We built this AVL tree by inserting the ' + d.keys.length + ' keys of `keys` (see: avl-insert). Now we delete the keys in `deletes`, in order.'), { c: [], java: [] });

      d.deletes.forEach(function (key, di) {
        var detailed = di === 0;
        var cur = root, path = [];
        while (cur && key !== cur.key) { path.push(cur); cur = key < cur.key ? cur.left : cur.right; }
        /* Accurate, per-level notes for the recursive descent that found `key` (used only by the
           condensed non-detailed summary below): one note per ancestor actually compared against, in
           order -- never skip:true here, since a walk can go left at one ancestor and right at another,
           and marking the same line both ways within one accumulated step would contradict itself. */
        var descentLines = [];
        path.forEach(function (anc) {
          if (key < anc.key) descentLines.push({ n: 3, note: T(key + ' < ' + anc.key + '? evet', key + ' < ' + anc.key + '? yes') });
          else descentLines.push({ n: 4, note: T(key + ' > ' + anc.key + '? evet', key + ' > ' + anc.key + '? yes') });
        });
        if (cur) {
          descentLines.push({ n: 3, note: T(key + ' < ' + cur.key + '? hayır', key + ' < ' + cur.key + '? no') },
                             { n: 4, note: T(key + ' > ' + cur.key + '? hayır (bulundu)', key + ' > ' + cur.key + '? no (found)') });
        }
        if (!cur) {
          var nfLines = [1];
          if (root) nfLines.push({ n: 2, note: T('root == NULL? hayır', 'root == NULL? no') });
          nfLines = nfLines.concat(descentLines, { n: 2, note: T('root == NULL? evet', 'root == NULL? yes') });
          S.step(T('`delete(' + key + ')` — ağaçta yok: **hiçbir şey yapılmaz** (no-op).', '`delete(' + key + ')` — not in the tree: **no-op**.'), { c: nfLines, java: nfLines });
          return;
        }
        var kind;
        if (cur.left && cur.right) {
          kind = 'two';
          path.push(cur);
          var succParent = cur, succ = cur.right;
          while (succ.left) { path.push(succ); succParent = succ; succ = succ.left; }
          var oldKey = cur.key;
          cur.key = succ.key;
          cur = succ;
          if (detailed) {
            var succLines = [8, { n: 9, note: T('succ->left != NULL? hayır (artık en sol düğüm)', 'succ->left != NULL? no (now the leftmost node)') }, 10, 11];
            S.step(T('İki çocuklu düğüm `' + oldKey + '`: ardıl `' + succ.key + '` ile değiştirilir, ardından ardıl düğüm (en fazla bir çocuklu) silinir.',
                                  'Two-children node `' + oldKey + '`: replaced by its successor `' + succ.key + '`, then the successor node (at most one child) is removed.'), { c: succLines, java: succLines });
          }
        } else kind = cur.left || cur.right ? 'one' : 'leaf';
        var child = cur.left || cur.right || null;
        var parent = path.length ? path[path.length - 1] : null;
        if (!parent) root = child; else if (parent.left === cur) parent.left = child; else parent.right = child;
        var kindText = { leaf: T('yaprak', 'a leaf'), one: T('tek çocuklu', 'one child'), two: T('iki çocuklu (ardıl kullanıldı)', 'two children (successor used)') }[kind];
        if (detailed) {
          tracked = syncTree(S, root, layoutTree(root), tracked, function () { return 'normal'; }, h);
          var line6True = !cur.left;
          var delLines = line6True
            ? [{ n: 6, note: T('root->left == NULL? evet', 'root->left == NULL? yes') }]
            : [{ n: 6, note: T('root->left == NULL? hayır', 'root->left == NULL? no') }, { n: 7, note: T('root->right == NULL? evet', 'root->right == NULL? yes') }];
          S.step(T('Düğüm `' + cur.key + '` çıkarılır (' + kindText.tr + ').', 'Node `' + cur.key + '` is removed (' + kindText.en + ').'), { c: delLines, java: delLines });
        }

        var rotations = [];
        for (var i = path.length - 1; i >= 0; i--) {
          var node = path[i];
          var res = rebalanceAt(node);
          var gp = i > 0 ? path[i - 1] : null;
          if (gp) { if (gp.left === node) gp.left = res.sub; else gp.right = res.sub; } else root = res.sub;
          if (res.c) {
            rotations.push({ node: node.key, sub: res.sub.key, c: res.c });
            if (detailed) {
              tracked = syncTree(S, root, layoutTree(root), tracked, function (nn) { return nn === res.sub ? 'new' : 'normal'; }, h);
              S.step(T('Yukarı çıkarken düğüm `' + node.key + '` dengesiz oldu: **' + res.c + ' durumu**, yeni alt-kök `' + res.sub.key + '`.',
                       'Walking up, node `' + node.key + '` became unbalanced: **' + res.c + ' case**, new subtree root `' + res.sub.key + '`.'), { c: [13, 14], java: [13, 14] });
            }
          }
        }
        if (!detailed) {
          var posf = layoutTree(root);
          tracked = syncTree(S, root, posf, tracked, function () { return 'normal'; }, h);
          /* Condensed summary of the whole recursive avl_delete() call: descentLines already carries one
             accurate note per ancestor actually compared (built above, before any mutation); here we add
             the removal-kind decision (lines 6/7) and, for a two-children removal, the successor search
             (line 9) -- all with real notes, no skip:true (this step may fold together several recursion
             levels that went different directions, so marking any of them skip:true here would risk the
             same self-contradiction the detailed steps avoid). */
          var fastLines = [1, { n: 2, note: T('root == NULL? hayır', 'root == NULL? no') }].concat(descentLines);
          if (kind === 'two') {
            fastLines.push(8, { n: 9, note: T('succ->left != NULL? hayır (artık en sol düğüm)', 'succ->left != NULL? no (now the leftmost node)') }, 10, 11);
          }
          var fastLine6True = !cur.left;
          fastLines = fastLines.concat(fastLine6True
            ? [{ n: 6, note: T('root->left == NULL? evet', 'root->left == NULL? yes') }]
            : [{ n: 6, note: T('root->left == NULL? hayır', 'root->left == NULL? no') }, { n: 7, note: T('root->right == NULL? evet', 'root->right == NULL? yes') }]);
          fastLines.push(13, 14);
          S.step(T('`delete(' + key + ')` — ' + kindText.tr + ', çıkarıldı; ' + path.length + ' atadan yukarı kontrol edildi, ' + rotations.length + ' döndürme (' + (rotations.length ? rotations.map(function (r) { return r.c; }).join(',') : '-') + ').',
                   '`delete(' + key + ')` — ' + kindText.en + ', removed; checked ' + path.length + ' ancestors on the way up, ' + rotations.length + ' rotation(s) (' + (rotations.length ? rotations.map(function (r) { return r.c; }).join(',') : '-') + ').'),
                 { c: fastLines, java: fastLines });
        } else if (!rotations.length) {
          var posf2 = layoutTree(root);
          tracked = syncTree(S, root, posf2, tracked, function () { return 'normal'; }, h);
          S.step(T('Kalan atalar kontrol edildi: hiçbiri dengesiz olmadı, döndürme gerekmedi.', 'The remaining ancestors were checked: none became unbalanced, no rotation was needed.'), { c: [13, 14], java: [13, 14] });
        }
      });

      var finalPos = layoutTree(root);
      tracked = syncTree(S, root, finalPos, tracked, function () { return 'normal'; }, h);
      S.result = toStruct(root, h);
      S.step(root
        ? T('Bitti: ' + d.deletes.length + ' silme işlendi. Ağaç her zaman AVL kaldı (`bf` hep -1..+1). `delete` yine `O(log n)`, ama tek eklemeden farklı olarak birden fazla seviyede döndürme gerekebilir.',
            'Done: ' + d.deletes.length + ' deletes processed. The tree stayed AVL throughout (`bf` always -1..+1). `delete` is still `O(log n)`, but unlike a single insert, it can rotate at more than one level.')
        : T('Bitti: ağaç tamamen boşaldı.', 'Done: the tree is completely empty.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
