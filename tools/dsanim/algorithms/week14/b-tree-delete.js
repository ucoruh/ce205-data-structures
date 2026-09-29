/* Week 14 -- B-tree delete (order m): remove a key, then fix underflow by BORROWING a key from a sibling
   through the parent, or, when no sibling can spare one, MERGING with a sibling (which can shrink the tree). */
(function (D) {
  'use strict';
  var T = D.T;

  function cCode(order) {
    return [
      '#define ORDER ' + order,
      '#define MIN_KEYS ((ORDER + 1) / 2 - 1)         /* ceil(ORDER/2) - 1 */',
      '',
      'void remove_at(Node *node, int idx) {           /* shift-remove keys[idx] */',
      '    for (int i = idx; i < node->n - 1; i++) node->keys[i] = node->keys[i + 1];',
      '    node->n--;',
      '}',
      '',
      'void fix_underflow(Node *node) {',
      '    while (node->parent != NULL && node->n < MIN_KEYS) {',
      '        Node *parent = node->parent;',
      '        int idx = child_index(parent, node);',
      '        Node *left  = idx > 0 ? parent->child[idx - 1] : NULL;',
      '        Node *right = idx < parent->n ? parent->child[idx + 1] : NULL;',
      '        if (left  != NULL && left->n  > MIN_KEYS) { borrow_from_left(node, parent, left, idx); return; }',
      '        if (right != NULL && right->n > MIN_KEYS) { borrow_from_right(node, parent, right, idx); return; }',
      '        if (left != NULL) { merge(left, parent, node, idx - 1); node = parent; }',
      '        else              { merge(node, parent, right, idx); node = parent; }',
      '    }',
      '}',
      '',
      'void b_tree_delete(BTree *t, int key) {',
      '    Node *node; int idx;',
      '    if (!find_node(t->root, key, &node, &idx)) return;     /* not present */',
      '    if (node->leaf) { remove_at(node, idx); fix_underflow(node); return; }',
      '    Node *pred = node->child[idx];',
      '    while (!pred->leaf) pred = pred->child[pred->n];',
      '    node->keys[idx] = pred->keys[pred->n - 1];             /* replace with predecessor */',
      '    remove_at(pred, pred->n - 1);',
      '    fix_underflow(pred);',
      '    if (!t->root->leaf && t->root->n == 0) {               /* merge emptied the root: drop a level */',
      '        Node *old_root = t->root;',
      '        t->root = t->root->child[0];',
      '        free(old_root);',
      '    }',
      '}'
    ];
  }
  function javaCode(order) {
    return [
      'static final int ORDER = ' + order + ';',
      'static final int MIN_KEYS = (ORDER + 1) / 2 - 1;   // ceil(ORDER/2) - 1',
      '',
      'static void removeAt(Node node, int idx) {          // shift-remove keys[idx]',
      '    for (int i = idx; i < node.n - 1; i++) node.keys[i] = node.keys[i + 1];',
      '    node.n--;',
      '}',
      '',
      'static void fixUnderflow(Node node) {',
      '    while (node.parent != null && node.n < MIN_KEYS) {',
      '        Node parent = node.parent;',
      '        int idx = childIndex(parent, node);',
      '        Node left  = idx > 0 ? parent.child[idx - 1] : null;',
      '        Node right = idx < parent.n ? parent.child[idx + 1] : null;',
      '        if (left  != null && left.n  > MIN_KEYS) { borrowFromLeft(node, parent, left, idx); return; }',
      '        if (right != null && right.n > MIN_KEYS) { borrowFromRight(node, parent, right, idx); return; }',
      '        if (left != null) { merge(left, parent, node, idx - 1); node = parent; }',
      '        else              { merge(node, parent, right, idx); node = parent; }',
      '    }',
      '}',
      '',
      'static void bTreeDelete(BTree t, int key) {',
      '    Node node; int idx;',
      '    if ((node = findNode(t.root, key)) == null) return;    // not present',
      '    idx = matchIndex(node, key);',
      '    if (node.leaf) { removeAt(node, idx); fixUnderflow(node); return; }',
      '    Node pred = node.child[idx];',
      '    while (!pred.leaf) pred = pred.child[pred.n];',
      '    node.keys[idx] = pred.keys[pred.n - 1];                // replace with predecessor',
      '    removeAt(pred, pred.n - 1);',
      '    fixUnderflow(pred);',
      '    if (!t.root.leaf && t.root.n == 0) {                   // merge emptied the root: drop a level',
      '        t.root = t.root.child[0];',
      '    }',
      '}'
    ];
  }

  function minKeysOf(order) { return Math.ceil(order / 2) - 1; }

  function makeBuilder() {
    var pageCounter = 0;
    function newNode(leaf) { pageCounter++; return { id: pageCounter, keys: [], children: [], leaf: leaf, parent: null }; }
    function insertSorted(node, key) {
      var i = node.keys.length - 1; node.keys.push(0);
      while (i >= 0 && node.keys[i] > key) { node.keys[i + 1] = node.keys[i]; i--; }
      node.keys[i + 1] = key;
    }
    function buildTree(order, keys) {
      var root = newNode(true);
      keys.forEach(function (key) {
        var node = root;
        while (!node.leaf) { var i = 0; while (i < node.keys.length && key > node.keys[i]) i++; node = node.children[i]; }
        insertSorted(node, key);
        var cur = node;
        while (cur.keys.length === order) {
          var mid = Math.floor(cur.keys.length / 2), median = cur.keys[mid];
          var right = newNode(cur.leaf);
          right.keys = cur.keys.slice(mid + 1);
          if (!cur.leaf) { right.children = cur.children.slice(mid + 1); right.children.forEach(function (c) { c.parent = right; }); }
          cur.keys = cur.keys.slice(0, mid);
          if (!cur.leaf) cur.children = cur.children.slice(0, mid + 1);
          if (!cur.parent) {
            var nr = newNode(false); nr.keys = [median]; nr.children = [cur, right];
            cur.parent = nr; right.parent = nr; root = nr; cur = null; break;
          } else {
            var parent = cur.parent; insertSorted(parent, median);
            var pos = parent.keys.indexOf(median);
            parent.children.splice(pos + 1, 0, right);
            right.parent = parent; cur = parent;
          }
        }
      });
      return { root: root, newNode: newNode };
    }
    return { buildTree: buildTree, newNode: newNode };
  }
  function layoutTree(root) {
    var pos = {}, nextX = 0, DX = 150, DY = 118, X0 = 90, Y0 = 110;
    function place(node, depth) {
      if (node.leaf) { pos[node.id] = { x: X0 + nextX * DX, y: Y0 + depth * DY }; nextX++; return pos[node.id].x; }
      var xs = node.children.map(function (c) { return place(c, depth + 1); });
      var cx = xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
      pos[node.id] = { x: cx, y: Y0 + depth * DY };
      return cx;
    }
    place(root, 0);
    return pos;
  }
  function treeHeight(node) { return node.leaf ? 0 : 1 + Math.max.apply(null, node.children.map(treeHeight)); }
  function nodeCount(node) { return node.leaf ? 1 : 1 + node.children.reduce(function (s, c) { return s + nodeCount(c); }, 0); }

  D.define({
    id: 'b-tree-delete',
    title: T('B-ağacı: silme (ödünç alma ve birleştirme)', 'B-tree: delete (borrow and merge)'),
    code: function (d) { return { c: cCode(d.order), java: javaCode(d.order) }; },
    presets: [
      { id: 'normal', level: 'normal', name: T('order=4, 12 anahtar, 3 silme', 'order=4, 12 keys, 3 deletes'),
        data: { order: 4, keys: [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15], deletes: [6, 12, 30] } },
      { id: 'hard', level: 'hard', name: T('order=3, 14 artan anahtar, zincirleme birleştirme', 'order=3, 14 ascending keys, chained merges'),
        data: { order: 3, keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], deletes: [1, 2, 3, 4] } },
      { id: 'not-found', level: 'edge', name: T('Uç durum: var olmayan anahtarı silmeye çalışmak', 'Edge case: deleting a key that is not present'),
        data: { order: 4, keys: [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15], deletes: [999, 6] } },
      { id: 'root-shrinks', level: 'edge', name: T('Uç durum: kök küçülene kadar sil (ağaç bir seviye alçalır)', 'Edge case: delete until the root shrinks (tree loses a level)'),
        data: { order: 3, keys: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110], deletes: [10, 20, 30, 40, 50, 60, 70] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      var order = d.order, minK = Math.ceil(order / 2) - 1;
      var pageCounter = 0;
      function newNode(leaf) { pageCounter++; return { id: pageCounter, keys: [], children: [], leaf: leaf, parent: null }; }
      function insSorted(node, key) {
        var i = node.keys.length - 1; node.keys.push(0);
        while (i >= 0 && node.keys[i] > key) { node.keys[i + 1] = node.keys[i]; i--; }
        node.keys[i + 1] = key;
      }
      var root = newNode(true);
      d.keys.forEach(function (key) {
        var node = root;
        while (!node.leaf) { var i = 0; while (i < node.keys.length && key > node.keys[i]) i++; node = node.children[i]; }
        insSorted(node, key);
        var cur = node;
        while (cur.keys.length === order) {
          var mid = Math.floor(cur.keys.length / 2), median = cur.keys[mid];
          var right = newNode(cur.leaf);
          right.keys = cur.keys.slice(mid + 1);
          if (!cur.leaf) { right.children = cur.children.slice(mid + 1); right.children.forEach(function (c) { c.parent = right; }); }
          cur.keys = cur.keys.slice(0, mid);
          if (!cur.leaf) cur.children = cur.children.slice(0, mid + 1);
          if (!cur.parent) { var nr = newNode(false); nr.keys = [median]; nr.children = [cur, right]; cur.parent = nr; right.parent = nr; root = nr; cur = null; break; }
          var parent = cur.parent; insSorted(parent, median);
          var pos = parent.keys.indexOf(median);
          parent.children.splice(pos + 1, 0, right); right.parent = parent; cur = parent;
        }
      });

      var reads = 0, writes = 0, borrows = 0, merges = 0;
      function findNode(key) {
        var node = root;
        while (node) {
          reads++;
          var i = 0; while (i < node.keys.length && key > node.keys[i]) i++;
          if (i < node.keys.length && key === node.keys[i]) return { node: node, idx: i };
          if (node.leaf) return null;
          node = node.children[i];
        }
        return null;
      }
      function removeAt(node, idx) { node.keys.splice(idx, 1); writes++; }
      function fixUnderflow(node) {
        while (node.parent && node.keys.length < minK) {
          var parent = node.parent, idx = parent.children.indexOf(node);
          var left = idx > 0 ? parent.children[idx - 1] : null;
          var right = idx < parent.children.length - 1 ? parent.children[idx + 1] : null;
          if (left && left.keys.length > minK) {
            node.keys.unshift(parent.keys[idx - 1]);
            parent.keys[idx - 1] = left.keys.pop();
            if (!node.leaf) { var c = left.children.pop(); c.parent = node; node.children.unshift(c); }
            writes += 3; borrows++; return;
          }
          if (right && right.keys.length > minK) {
            node.keys.push(parent.keys[idx]);
            parent.keys[idx] = right.keys.shift();
            if (!node.leaf) { var c2 = right.children.shift(); c2.parent = node; node.children.push(c2); }
            writes += 3; borrows++; return;
          }
          if (left) {
            left.keys = left.keys.concat([parent.keys[idx - 1]], node.keys);
            if (!node.leaf) { node.children.forEach(function (cc) { cc.parent = left; }); left.children = left.children.concat(node.children); }
            parent.keys.splice(idx - 1, 1); parent.children.splice(idx, 1);
            writes += 2; merges++; node = parent;
          } else {
            node.keys = node.keys.concat([parent.keys[idx]], right.keys);
            if (!node.leaf) { right.children.forEach(function (cc) { cc.parent = node; }); node.children = node.children.concat(right.children); }
            parent.keys.splice(idx, 1); parent.children.splice(idx + 1, 1);
            writes += 2; merges++; node = parent;
          }
        }
      }
      var deletes = [];
      d.deletes.forEach(function (key) {
        var found = findNode(key);
        if (!found) { deletes.push({ key: key, found: false }); return; }
        var node = found.node, idx = found.idx;
        if (node.leaf) { removeAt(node, idx); fixUnderflow(node); }
        else {
          var pred = node.children[idx]; reads++;
          while (!pred.leaf) { pred = pred.children[pred.children.length - 1]; reads++; }
          node.keys[idx] = pred.keys[pred.keys.length - 1]; writes++;
          removeAt(pred, pred.keys.length - 1);
          fixUnderflow(pred);
        }
        if (!root.leaf && root.keys.length === 0) { root = root.children[0]; root.parent = null; }
        deletes.push({ key: key, found: true });
      });
      function h(n) { return n.leaf ? 0 : 1 + Math.max.apply(null, n.children.map(h)); }
      function nc(n) { return n.leaf ? 1 : 1 + n.children.reduce(function (s, c) { return s + nc(c); }, 0); }
      return { order: order, nodeCount: nc(root), height: h(root), reads: reads, writes: writes, borrows: borrows, merges: merges, deletes: deletes };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 14 }[level] || 12;
      var order = level === 'extreme' ? 3 : D.randInt(r, 3, 4);
      var used = {}, keys = [];
      while (keys.length < n) { var v = D.randInt(r, 1, 200); if (!used[v]) { used[v] = true; keys.push(v); } }
      var nd = level === 'extreme' ? 4 : 3, deletes = [];
      var pool = keys.slice();
      for (var j = 0; j < nd; j++) deletes.push(r() < 0.75 && pool.length ? pool.splice(D.randInt(r, 0, pool.length - 1), 1)[0] : 900 + D.randInt(r, 0, 99));
      return { order: order, keys: keys, deletes: deletes };
    },
    input: {
      hint: T('Örnek: order=4 keys: 10,20,5,6,12,30,7,17,3,25,18,15 deletes: 6,12,30',
              'Example: order=4 keys: 10,20,5,6,12,30,7,17,3,25,18,15 deletes: 6,12,30'),
      parse: function (text) {
        var order = 4, keys = [], deletes = [], mode = 'keys';
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^order[=:](\d+)$/i.exec(tok); if (m) { order = parseInt(m[1], 10); return; }
          if (/^keys?:?$/i.test(tok)) { mode = 'keys'; return; }
          if (/^deletes?:?$/i.test(tok)) { mode = 'deletes'; return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, order=N, keys ya da deletes yazın.', '"' + tok + '" is not understood: write a number, order=N, keys or deletes.');
          (mode === 'keys' ? keys : deletes).push(parseInt(tok, 10));
        });
        if (order < 3 || order > 6) throw T('order 3 ile 6 arasında olmalı.', 'order must be between 3 and 6.');
        if (keys.length < 10) throw T('En az 10 anahtar yazın.', 'Write at least 10 keys.');
        var seen = {}; keys.forEach(function (k) { if (seen[k]) throw T('Anahtarlar tekrarsız olmalı.', 'Keys must be unique.'); seen[k] = true; });
        if (!deletes.length) throw T('En az bir deletes değeri yazın.', 'Write at least one deletes value.');
        return { order: order, keys: keys, deletes: deletes };
      },
      format: function (d) { return 'order=' + d.order + ' keys: ' + d.keys.join(',') + ' deletes: ' + d.deletes.join(','); },
      bad: ['', 'order=2 keys: 1,2,3,4,5,6,7,8,9,10 deletes: 5', 'keys: 1,2,3,4,5,6,7,8,9 deletes: 5',
            'keys: 1,2,3,4,5,6,7,8,9,10 deletes:', 'keys: 1,2,3,2,5,6,7,8,9,10 deletes: 5', 'order=abc keys: 1,2,3,4,5,6,7,8,9,10 deletes: 5'],
      tokens: function (d) { return d.deletes.map(String); }
    },
    build: function (S, d) {
      var order = d.order, minK = minKeysOf(order);
      var b = makeBuilder();
      var built = b.buildTree(order, d.keys), root = built.root, newNode = b.newNode;
      var reads = 0, writes = 0, borrows = 0, merges = 0;

      S.label('title', { x: 20, y: 20, text: 'ORDER = ' + order + '  MIN_KEYS = ' + minK, size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('io', { x: 20, y: 44, text: T('okuma: 0  yazma: 0', 'reads: 0  writes: 0'), size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('dec', { x: 20, y: 66, text: '', size: 14, mono: true, anchor: 'start', style: 'dim' });
      function setIO() { S.set('io', { text: T('okuma: ' + reads + '  yazma: ' + writes, 'reads: ' + reads + '  writes: ' + writes) }); }

      var drawn = [];
      function clearDraw() { drawn.forEach(function (id) { if (S.has(id)) S.remove(id); }); drawn = []; }
      function drawTree(hlIds) {
        clearDraw();
        var pos = layoutTree(root);
        (function walk(node) {
          var nid = 'n' + node.id, style = hlIds && hlIds.indexOf(node.id) >= 0 ? 'hl' : 'normal';
          S.box(nid, { x: pos[node.id].x, y: pos[node.id].y, w: Math.max(50, node.keys.length * 30 + 14), h: 40, text: node.keys.join(','), style: style, size: 14, above: T('sf ' + node.id, 'pg ' + node.id) });
          drawn.push(nid);
          if (!node.leaf) node.children.forEach(function (c) {
            var aid = 'e' + node.id + '_' + c.id;
            S.arrow(aid, { from: nid, to: 'n' + c.id, kind: 'center', head: false, style: 'dim' });
            drawn.push(aid); walk(c);
          });
        })(root);
      }
      drawTree();
      S.step(T('`ORDER=' + order + '` B-ağacı, ' + d.keys.length + ' anahtardan kurulmuş. `MIN_KEYS=' + minK + '`: kökten farklı her sayfa en az bu kadar anahtar tutmalı.',
               'An `ORDER=' + order + '` B-tree, built from ' + d.keys.length + ' keys. `MIN_KEYS=' + minK + '`: every page except the root must hold at least this many keys.'),
             { c: [1, 2], java: [1, 2] });

      function findNode(key) {
        var node = root;
        while (node) {
          reads++;
          var i = 0; while (i < node.keys.length && key > node.keys[i]) i++;
          if (i < node.keys.length && key === node.keys[i]) return { node: node, idx: i };
          if (node.leaf) return null;
          node = node.children[i];
        }
        return null;
      }
      function removeAt(node, idx) { node.keys.splice(idx, 1); writes++; }

      var deletesOut = [];
      d.deletes.forEach(function (key, ki) {
        S.at(ki); S.set('dec', { text: '' });
        var found = findNode(key);
        setIO();
        if (!found) {
          drawTree();
          S.set('dec', { text: T('yok', 'absent') });
          S.step(T('`b_tree_delete(' + key + ')`: kökten yaprağa iniyoruz, `' + key + '` hiçbir sayfada yok. **Yapılacak bir şey yok.**',
                   '`b_tree_delete(' + key + ')`: we descend from the root to a leaf, `' + key + '` is in no page. **Nothing to do.**'),
                 { c: [23, { n: 24, note: T('bulunamadı mı? evet', 'not found? yes') }], java: [23, { n: 24, note: T('bulunamadı mı? evet', 'not found? yes') }] });
          deletesOut.push({ key: key, found: false });
          return;
        }
        var node = found.node, idx = found.idx;
        drawTree([node.id]);
        S.step(T('`b_tree_delete(' + key + ')`: `' + key + '` sayfa ' + node.id + '\'de bulundu (' + node.keys.join(',') + ').',
                 '`b_tree_delete(' + key + ')`: `' + key + '` was found on page ' + node.id + ' (' + node.keys.join(',') + ').'),
               { c: [23, { n: 24, note: T('bulunamadı mı? hayır', 'not found? no') }], java: [23, { n: 24, note: T('bulunamadı mı? hayır', 'not found? no') }, 25] });

        var startNode;
        if (node.leaf) {
          removeAt(node, idx); setIO();
          drawTree([node.id]);
          S.step(T('Sayfa ' + node.id + ' bir yaprak: `remove_at` anahtarı doğrudan kaydırarak siler (+1 yazma). Şimdi ' + node.keys.length + '/' + minK + ' (min).',
                   'Page ' + node.id + ' is a leaf: `remove_at` shifts the key out directly (+1 write). Now ' + node.keys.length + '/' + minK + ' (min).'),
                 { c: [{ n: 25, note: T('yaprak mı? evet', 'leaf? yes') }, 4, 5, 6], java: [{ n: 26, note: T('yaprak mı? evet', 'leaf? yes') }, 4, 5, 6] });
          startNode = node;
        } else {
          var pred = node.children[idx]; reads++;
          while (!pred.leaf) { pred = pred.children[pred.children.length - 1]; reads++; }
          setIO();
          drawTree([node.id, pred.id]);
          S.step(T('Sayfa ' + node.id + ' iç düğüm: silinecek anahtarın yerine SOL alt ağacın en büyüğü (öncül/predecessor) geçecek -- en sağa inerek sayfa ' + pred.id + '\'e ulaşıldı.',
                   'Page ' + node.id + ' is internal: the key is replaced by the largest key in its LEFT subtree (the predecessor) -- descending rightmost reaches page ' + pred.id + '.'),
                 { c: [26, { n: 27, note: T('yaprak mı? hayır', 'leaf? no') }], java: [27, { n: 28, note: T('yaprak mı? hayır', 'leaf? no') }] });
          var predKey = pred.keys[pred.keys.length - 1];
          node.keys[idx] = predKey; writes++;
          removeAt(pred, pred.keys.length - 1); setIO();
          drawTree([node.id, pred.id]);
          S.step(T('`' + key + '` yerine öncül `' + predKey + '` yazılır (+1 yazma); `' + predKey + '` kendi yaprağından (sf ' + pred.id + ') silinir (+1 yazma).',
                   '`' + key + '` is replaced by the predecessor `' + predKey + '` (+1 write); `' + predKey + '` is removed from its own leaf (pg ' + pred.id + ') (+1 write).'),
                 { c: [28, 29], java: [29, 30] });
          startNode = pred;
        }

        var cur = startNode;
        while (cur.parent && cur.keys.length < minK) {
          var parent = cur.parent, pidx = parent.children.indexOf(cur);
          var left = pidx > 0 ? parent.children[pidx - 1] : null;
          var right = pidx < parent.children.length - 1 ? parent.children[pidx + 1] : null;
          if (left && left.keys.length > minK) {
            cur.keys.unshift(parent.keys[pidx - 1]);
            parent.keys[pidx - 1] = left.keys.pop();
            if (!cur.leaf) { var c1 = left.children.pop(); c1.parent = cur; cur.children.unshift(c1); }
            writes += 3; borrows++; setIO();
            drawTree([cur.id, parent.id, left.id]);
            S.set('dec', { text: T('sol kardeşten ödünç', 'borrowed from left sibling') });
            S.step(T('Sayfa ' + cur.id + ' eksik (`n < MIN_KEYS`); SOL kardeşinin (sf ' + left.id + ') fazlası var: ebeveynin ayırıcı anahtarı aşağı, kardeşin son anahtarı ebeveyne yukarı taşınır (+3 yazma). Çözüldü.',
                     'Page ' + cur.id + ' is short (`n < MIN_KEYS`); its LEFT sibling (pg ' + left.id + ') has a spare key: the parent\'s separator moves down, the sibling\'s last key moves up into the parent (+3 writes). Resolved.'),
                   { c: [{ n: 15, note: T('sol var ve fazlası mı? evet', 'left spare? yes') }], java: [{ n: 15, note: T('sol var ve fazlası mı? evet', 'left spare? yes') }] });
            break;
          }
          if (right && right.keys.length > minK) {
            cur.keys.push(parent.keys[pidx]);
            parent.keys[pidx] = right.keys.shift();
            if (!cur.leaf) { var c2 = right.children.shift(); c2.parent = cur; cur.children.push(c2); }
            writes += 3; borrows++; setIO();
            drawTree([cur.id, parent.id, right.id]);
            S.set('dec', { text: T('sağ kardeşten ödünç', 'borrowed from right sibling') });
            S.step(T('Sayfa ' + cur.id + ' eksik; SOL kardeş yok ya da tam dolu, ama SAĞ kardeşin (sf ' + right.id + ') fazlası var: aynı fikir, ayna yönde (+3 yazma). Çözüldü.',
                     'Page ' + cur.id + ' is short; there is no left sibling with a spare key, but the RIGHT sibling (pg ' + right.id + ') has one: same idea, mirrored (+3 writes). Resolved.'),
                   { c: [{ n: 16, note: T('sağ var ve fazlası mı? evet', 'right spare? yes') }], java: [{ n: 16, note: T('sağ var ve fazlası mı? evet', 'right spare? yes') }] });
            break;
          }
          if (left) {
            var mergedInto = left.id, mergedAway = cur.id;
            left.keys = left.keys.concat([parent.keys[pidx - 1]], cur.keys);
            if (!cur.leaf) { cur.children.forEach(function (cc) { cc.parent = left; }); left.children = left.children.concat(cur.children); }
            parent.keys.splice(pidx - 1, 1); parent.children.splice(pidx, 1);
            writes += 2; merges++; setIO();
            drawTree([left.id, parent.id]);
            S.set('dec', { text: T('sol kardeşle birleşti', 'merged with left sibling') });
            S.step(T('Sayfa ' + mergedAway + ' eksik ve HİÇBİR kardeşin fazlası yok: sol kardeş sf ' + mergedInto + ' ile birleşir -- ebeveynin ayırıcı anahtarı da araya girer (+2 yazma). Ebeveyn bir anahtar/çocuk kaybetti; onun da eksik olup olmadığı denetlenecek.',
                     'Page ' + mergedAway + ' is short and NEITHER sibling has a spare key: it merges with the left sibling pg ' + mergedInto + ' -- the parent\'s separator key slides down between them (+2 writes). The parent lost a key/child; we now check whether IT underflowed too.'),
                   { c: [{ n: 17, note: T('sol var mı? evet', 'left != null? yes') }], java: [{ n: 17, note: T('sol var mı? evet', 'left != null? yes') }] });
            cur = parent;
          } else {
            var mergedInto2 = cur.id, mergedAway2 = right.id;
            cur.keys = cur.keys.concat([parent.keys[pidx]], right.keys);
            if (!cur.leaf) { right.children.forEach(function (cc) { cc.parent = cur; }); cur.children = cur.children.concat(right.children); }
            parent.keys.splice(pidx, 1); parent.children.splice(pidx + 1, 1);
            writes += 2; merges++; setIO();
            drawTree([cur.id, parent.id]);
            S.set('dec', { text: T('sağ kardeşle birleşti', 'merged with right sibling') });
            S.step(T('Sayfa ' + mergedInto2 + ' eksik, sol kardeş yok: sağ kardeş sf ' + mergedAway2 + ' içine birleşir, ebeveynin ayırıcısı araya girer (+2 yazma). Ebeveyn de denetlenecek.',
                     'Page ' + mergedInto2 + ' is short with no left sibling: the right sibling pg ' + mergedAway2 + ' merges into it, the parent\'s separator slides in between (+2 writes). The parent will be checked too.'),
                   { c: [18], java: [18] });
            cur = parent;
          }
        }
        if (!root.leaf && root.keys.length === 0) {
          var oldRoot = root.id;
          root = root.children[0]; root.parent = null;
          drawTree([root.id]);
          S.set('dec', { text: T('kök küçüldü', 'root shrank') });
          S.step(T('Kök (sf ' + oldRoot + ') birleşme sonucu anahtarsız kaldı: tek çocuğu yeni kök oldu -- ağaç bir seviye alçaldı.',
                   'The root (pg ' + oldRoot + ') ended up with no keys after a merge: its one remaining child becomes the new root -- the tree loses one level.'),
                 { c: [{ n: 31, note: T('kök boş mu? evet', 'root empty? yes') }, 32, 33, 34],
                   java: [{ n: 32, note: T('kök boş mu? evet', 'root empty? yes') }, 33] });
        }
        deletesOut.push({ key: key, found: true });
        S.set('dec', { text: '' });
      });

      S.at(null);
      drawTree();
      S.result = { order: order, nodeCount: nodeCount(root), height: treeHeight(root), reads: reads, writes: writes, borrows: borrows, merges: merges, deletes: deletesOut };
      S.step(T('Bitti: ' + d.deletes.length + ' silme (' + borrows + ' ödünç, ' + merges + ' birleştirme), ' + reads + ' okuma / ' + writes + ' yazma. Ağaç hâlâ DENGELİ: her yaprak aynı derinlikte.',
               'Done: ' + d.deletes.length + ' deletes (' + borrows + ' borrows, ' + merges + ' merges), ' + reads + ' reads / ' + writes + ' writes. The tree is still BALANCED: every leaf at the same depth.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
