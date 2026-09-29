/* Week 14 -- B-tree insert (order m): every node is one disk page; overflow splits a page in two and
   pushes its median key up, growing the tree upward (not downward) when the root itself splits. */
(function (D) {
  'use strict';
  var T = D.T;

  function cCode(order) {
    return [
      '#define ORDER ' + order + '                 /* order m: at most ORDER-1 keys, ORDER children per node */',
      '',
      'void insert_sorted(Node *node, int key) {     /* shift-insert into a leaf, keeps keys ascending */',
      '    int i = node->n - 1;',
      '    while (i >= 0 && node->keys[i] > key) { node->keys[i + 1] = node->keys[i]; i--; }',
      '    node->keys[i + 1] = key;',
      '    node->n++;',
      '}',
      '',
      'Node *split(Node *node, int *median_out) {    /* node holds ORDER keys: one too many */',
      '    int mid = node->n / 2;',
      '    *median_out = node->keys[mid];',
      '    Node *right = new_node_from(node, mid + 1);  /* right takes keys[mid+1 .. n-1] (and children) */',
      '    node->n = mid;                                /* left keeps keys[0 .. mid-1] */',
      '    return right;',
      '}',
      '',
      'void b_tree_insert(BTree *t, int key) {',
      '    Node *leaf = find_leaf(t->root, key);         /* descend, comparing key at every node */',
      '    insert_sorted(leaf, key);',
      '    Node *cur = leaf;',
      '    while (cur->n == ORDER) {                     /* overflow: split, push the median up */',
      '        int median; Node *right = split(cur, &median);',
      '        if (cur->parent == NULL) { t->root = new_root(median, cur, right); return; }',
      '        insert_sorted(cur->parent, median);',
      '        attach_child(cur->parent, right);',
      '        cur = cur->parent;',
      '    }',
      '}'
    ];
  }
  function javaCode(order) {
    return [
      'static final int ORDER = ' + order + ';     // order m: at most ORDER-1 keys, ORDER children per node',
      '',
      'static void insertSorted(Node node, int key) {  // shift-insert into a leaf, keeps keys ascending',
      '    int i = node.n - 1;',
      '    while (i >= 0 && node.keys[i] > key) { node.keys[i + 1] = node.keys[i]; i--; }',
      '    node.keys[i + 1] = key;',
      '    node.n++;',
      '}',
      '',
      'static Node split(Node node, int[] medianOut) {  // node holds ORDER keys: one too many',
      '    int mid = node.n / 2;',
      '    medianOut[0] = node.keys[mid];',
      '    Node right = newNodeFrom(node, mid + 1);      // right takes keys[mid+1 .. n-1] (and children)',
      '    node.n = mid;                                  // left keeps keys[0 .. mid-1]',
      '    return right;',
      '}',
      '',
      'static void bTreeInsert(BTree t, int key) {',
      '    Node leaf = findLeaf(t.root, key);              // descend, comparing key at every node',
      '    insertSorted(leaf, key);',
      '    Node cur = leaf;',
      '    while (cur.n == ORDER) {                        // overflow: split, push the median up',
      '        int[] median = new int[1]; Node right = split(cur, median);',
      '        if (cur.parent == null) { t.root = newRoot(median[0], cur, right); return; }',
      '        insertSorted(cur.parent, median[0]);',
      '        attachChild(cur.parent, right);',
      '        cur = cur.parent;',
      '    }',
      '}'
    ];
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
    id: 'b-tree-insert',
    title: T('B-ağacı: ekleme (düğüm bölünmesi)', 'B-tree: insert (node split)'),
    code: function (d) { return { c: cCode(d.order), java: javaCode(d.order) }; },
    presets: [
      { id: 'normal', level: 'normal', name: T('order=4, 12 karışık anahtar', 'order=4, 12 mixed keys'),
        data: { order: 4, keys: [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15] } },
      { id: 'hard', level: 'hard', name: T('order=3, 14 artan anahtar (en kötü durum)', 'order=3, 14 ascending keys (worst case)'),
        data: { order: 3, keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] } },
      { id: 'descending', level: 'edge', name: T('Uç durum: order=3, 10 azalan anahtar', 'Edge case: order=3, 10 descending keys'),
        data: { order: 3, keys: [95, 85, 75, 65, 55, 45, 35, 25, 15, 5] } },
      { id: 'never-splits', level: 'edge', name: T('Uç durum: order=12, 10 anahtar -- hiç bölünme yok', 'Edge case: order=12, 10 keys -- never splits'),
        data: { order: 12, keys: [23, 5, 41, 12, 38, 7, 29, 16, 44, 3] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    /** Independent re-simulation (its own local helpers, never calling build()'s). */
    reference: function (d) {
      var order = d.order;
      var pageCounter = 0, reads = 0, writes = 0, splits = 0;
      function newNode(leaf) { pageCounter++; return { id: pageCounter, keys: [], children: [], leaf: leaf, parent: null }; }
      var root = newNode(true); writes++;
      function insSorted(node, key) {
        var i = node.keys.length - 1; node.keys.push(0);
        while (i >= 0 && node.keys[i] > key) { node.keys[i + 1] = node.keys[i]; i--; }
        node.keys[i + 1] = key;
      }
      d.keys.forEach(function (key) {
        var node = root; reads++;
        while (!node.leaf) { var i = 0; while (i < node.keys.length && key > node.keys[i]) i++; node = node.children[i]; reads++; }
        insSorted(node, key); writes++;
        var cur = node;
        while (cur.keys.length === order) {
          splits++;
          var mid = Math.floor(cur.keys.length / 2), median = cur.keys[mid];
          var right = newNode(cur.leaf);
          right.keys = cur.keys.slice(mid + 1);
          if (!cur.leaf) { right.children = cur.children.slice(mid + 1); right.children.forEach(function (c) { c.parent = right; }); }
          cur.keys = cur.keys.slice(0, mid);
          if (!cur.leaf) cur.children = cur.children.slice(0, mid + 1);
          writes += 2;
          if (!cur.parent) {
            var nr = newNode(false); nr.keys = [median]; nr.children = [cur, right];
            cur.parent = nr; right.parent = nr; root = nr; writes++;
            cur = null; break;
          } else {
            var parent = cur.parent;
            insSorted(parent, median);
            var pos = parent.keys.indexOf(median);
            parent.children.splice(pos + 1, 0, right);
            right.parent = parent; writes++;
            cur = parent;
          }
        }
      });
      function h(n) { return n.leaf ? 0 : 1 + Math.max.apply(null, n.children.map(h)); }
      function nc(n) { return n.leaf ? 1 : 1 + n.children.reduce(function (s, c) { return s + nc(c); }, 0); }
      return { order: order, nodeCount: nc(root), height: h(root), splits: splits, reads: reads, writes: writes, finalSorted: d.keys.slice().sort(function (a, b) { return a - b; }) };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level] || 12;
      var order = level === 'extreme' ? 3 : D.randInt(r, 3, 5);
      var used = {}, keys = [];
      while (keys.length < n) { var v = D.randInt(r, 1, 300); if (!used[v]) { used[v] = true; keys.push(v); } }
      return { order: order, keys: keys };
    },
    input: {
      hint: T('Örnek: order=4 keys: 10,20,5,6,12,30,7,17,3,25,18,15', 'Example: order=4 keys: 10,20,5,6,12,30,7,17,3,25,18,15'),
      parse: function (text) {
        var order = 4, keys = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^order[=:](\d+)$/i.exec(tok); if (m) { order = parseInt(m[1], 10); return; }
          if (/^keys?:?$/i.test(tok)) return;
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, order=N ya da keys yazın.', '"' + tok + '" is not understood: write a number, order=N or keys.');
          keys.push(parseInt(tok, 10));
        });
        if (order < 3 || order > 12) throw T('order 3 ile 12 arasında olmalı.', 'order must be between 3 and 12.');
        if (keys.length < 10) throw T('En az 10 anahtar yazın.', 'Write at least 10 keys.');
        var seen = {};
        keys.forEach(function (k) { if (seen[k]) throw T('Anahtarlar tekrarsız olmalı (' + k + ' iki kez var).', 'Keys must be unique (' + k + ' appears twice).'); seen[k] = true; });
        return { order: order, keys: keys };
      },
      format: function (d) { return 'order=' + d.order + ' keys: ' + d.keys.join(','); },
      bad: ['', 'order=2 keys: 1,2,3,4,5,6,7,8,9,10', 'keys: 1,2,3,4,5,6,7,8,9', 'order=abc keys: 1,2,3,4,5,6,7,8,9,10',
            'keys: 1,2,3,2,5,6,7,8,9,10', 'order=30 keys: 1,2,3,4,5,6,7,8,9,10'],
      tokens: function (d) { return d.keys.map(String); }
    },
    build: function (S, d) {
      var order = d.order, keys = d.keys;
      var pageCounter = 0, reads = 0, writes = 0, splits = 0;
      function newNode(leaf) { pageCounter++; return { id: pageCounter, keys: [], children: [], leaf: leaf, parent: null }; }
      var root = newNode(true);
      function insertSorted(node, key) {
        var i = node.keys.length - 1; node.keys.push(0);
        while (i >= 0 && node.keys[i] > key) { node.keys[i + 1] = node.keys[i]; i--; }
        node.keys[i + 1] = key;
      }

      S.label('title', { x: 20, y: 20, text: 'ORDER = ' + order + ' (max ' + (order - 1) + ' keys/node)', size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('io', { x: 20, y: 44, text: T('okuma: 0  yazma: 1', 'reads: 0  writes: 1'), size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('dec', { x: 20, y: 66, text: '', size: 14, mono: true, anchor: 'start', style: 'dim' });
      function setIO() { S.set('io', { text: T('okuma: ' + reads + '  yazma: ' + writes, 'reads: ' + reads + '  writes: ' + writes) }); }

      var drawn = [];
      function clearDraw() { drawn.forEach(function (id) { if (S.has(id)) S.remove(id); }); drawn = []; }
      function drawTree(activePath, hlNode) {
        clearDraw();
        var pos = layoutTree(root);
        (function walk(node) {
          var nid = 'n' + node.id, onPath = activePath && activePath.indexOf(node.id) >= 0;
          var style = hlNode && node.id === hlNode.id ? 'hl' : (onPath ? 'active' : 'normal');
          S.box(nid, { x: pos[node.id].x, y: pos[node.id].y, w: Math.max(50, node.keys.length * 30 + 14), h: 40, text: node.keys.join(','), style: style, size: 14, above: T('sf ' + node.id, 'pg ' + node.id) });
          drawn.push(nid);
          if (!node.leaf) node.children.forEach(function (c) {
            var aid = 'e' + node.id + '_' + c.id;
            S.arrow(aid, { from: nid, to: 'n' + c.id, kind: 'center', head: false, style: onPath && activePath.indexOf(c.id) >= 0 ? 'active' : 'dim' });
            drawn.push(aid);
            walk(c);
          });
        })(root);
      }

      writes = 1; setIO();
      drawTree();
      S.step(T('Boş bir B-ağacı: tek düğümlü (yaprak) bir kök sayfa ayrıldı (+1 yazma). `ORDER=' + order + '`: her düğüm en çok ' + (order - 1) + ' anahtar tutar.',
               'An empty B-tree: a single-node (leaf) root page was allocated (+1 write). `ORDER=' + order + '`: every node holds at most ' + (order - 1) + ' keys.'),
             { c: [1], java: [1] });

      keys.forEach(function (key, ki) {
        S.at(ki);
        var path = [root.id], node = root;
        reads++;
        while (!node.leaf) { var i = 0; while (i < node.keys.length && key > node.keys[i]) i++; node = node.children[i]; path.push(node.id); reads++; }
        setIO();
        drawTree(path, node);
        S.step(T('`b_tree_insert(' + key + ')`: kökten anahtarları karşılaştırarak doğru yaprağa iniyoruz -- sayfa ' + node.id + ' (' + path.length + ' sayfa okundu).',
                 '`b_tree_insert(' + key + ')`: descend from the root comparing keys to reach the right leaf -- page ' + node.id + ' (' + path.length + ' pages read).'),
               { c: [19], java: [19] });

        insertSorted(node, key); writes++; setIO();
        drawTree(path, node);
        var full = node.keys.length === order;
        S.step(T('`insert_sorted`: `' + key + '` sayfa ' + node.id + '\'e sıralı eklendi (+1 yazma): şimdi ' + node.keys.length + '/' + (order - 1) + (full ? ' -- TAŞTI!' : ' anahtar.'),
                 '`insert_sorted`: `' + key + '` was inserted in order into page ' + node.id + ' (+1 write): now ' + node.keys.length + '/' + (order - 1) + (full ? ' -- OVERFLOW!' : ' keys.'),
                ), { c: [20, { n: 22, note: full ? T('n==ORDER mi? evet', 'n==ORDER? yes') : T('n==ORDER mi? hayır', 'n==ORDER? no') }],
                     java: [20, { n: 22, note: full ? T('n==ORDER mi? evet', 'n==ORDER? yes') : T('n==ORDER mi? hayır', 'n==ORDER? no') }] });

        var cur = node;
        while (cur.keys.length === order) {
          splits++;
          var mid = Math.floor(cur.keys.length / 2), median = cur.keys[mid];
          var right = newNode(cur.leaf);
          right.keys = cur.keys.slice(mid + 1);
          if (!cur.leaf) { right.children = cur.children.slice(mid + 1); right.children.forEach(function (c) { c.parent = right; }); }
          cur.keys = cur.keys.slice(0, mid);
          if (!cur.leaf) cur.children = cur.children.slice(0, mid + 1);
          writes += 2; setIO();
          drawTree([cur.id, right.id], null);
          S.set('dec', { text: T('ortanca ' + median + ' yukarı itiliyor', 'median ' + median + ' pushed up') });
          S.step(T('`split`: sayfa ' + cur.id + ' dolu (' + order + ' anahtar) -- ikiye bölünür: sol sf ' + cur.id + ' kalır, sağ sf ' + right.id + ' oluşturulur (+2 yazma), ortanca `' + median + '` yukarı taşınır.',
                   '`split`: page ' + cur.id + ' is full (' + order + ' keys) -- it splits in two: left stays pg ' + cur.id + ', right pg ' + right.id + ' is created (+2 writes), median `' + median + '` moves up.'),
                 { c: [23, 10, 11, 12, 13, 14, 15], java: [23, 10, 11, 12, 13, 14, 15] });

          if (!cur.parent) {
            var nr = newNode(false); nr.keys = [median]; nr.children = [cur, right];
            cur.parent = nr; right.parent = nr; root = nr; writes++; setIO();
            drawTree([nr.id]);
            S.step(T('`cur->parent == NULL`: sf ' + cur.id + ' köktü. Yeni bir kök (sf ' + nr.id + ') yaratılır, tek anahtarı `' + median + '`; ağaç bir seviye daha uzun oldu (+1 yazma).',
                     '`cur->parent == NULL`: page ' + cur.id + ' was the root. A new root (pg ' + nr.id + ') is created holding just `' + median + '`; the tree grows one level taller (+1 write).'),
                   { c: [24, { n: 25, skip: true }, { n: 26, skip: true }, { n: 27, skip: true }], java: [24, { n: 25, skip: true }, { n: 26, skip: true }, { n: 27, skip: true }] });
            cur = null; break;
          } else {
            var parent = cur.parent;
            insertSorted(parent, median);
            var posIdx = parent.keys.indexOf(median);
            parent.children.splice(posIdx + 1, 0, right);
            right.parent = parent; writes++; setIO();
            drawTree([parent.id]);
            S.step(T('`cur->parent != NULL`: ortanca `' + median + '` ebeveyn sf ' + parent.id + '\'e eklenir, yeni sf ' + right.id + ' ona bağlanır (+1 yazma). Ebeveynin de taşıp taşmadığı yeniden denetlenir.',
                     '`cur->parent != NULL`: median `' + median + '` is inserted into parent pg ' + parent.id + ', new pg ' + right.id + ' is attached to it (+1 write). We loop back to check whether the parent overflowed too.'),
                   { c: [{ n: 24, skip: true }, 25, 26, 27], java: [{ n: 24, skip: true }, 25, 26, 27] });
            cur = parent;
          }
        }
        S.set('dec', { text: '' });
      });

      S.at(null);
      drawTree();
      S.result = { order: order, nodeCount: nodeCount(root), height: treeHeight(root), splits: splits, reads: reads, writes: writes, finalSorted: keys.slice().sort(function (a, b) { return a - b; }) };
      S.step(T('Bitti: ' + keys.length + ' ekleme, sonuçta ' + nodeCount(root) + ' sayfa, yükseklik ' + treeHeight(root) + ', ' + reads + ' okuma / ' + writes + ' yazma. B-ağacı hep DENGELİ kalır: her yaprak aynı derinlikte.',
               'Done: ' + keys.length + ' inserts, ending with ' + nodeCount(root) + ' pages, height ' + treeHeight(root) + ', ' + reads + ' reads / ' + writes + ' writes. A B-tree always stays BALANCED: every leaf sits at the same depth.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
