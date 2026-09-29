/* Week 14 -- B-tree search (order m): descend from the root, comparing the target against each page's
   keys, in a tree that is already built; every page visited is one disk read. */
(function (D) {
  'use strict';
  var T = D.T;

  function cCode(order) {
    return [
      '#define ORDER ' + order + '           /* order m: at most ORDER-1 keys per node */',
      '',
      'bool b_tree_search(Node *node, int key, Node **out_node) {',
      '    if (node == NULL) return false;              /* fell off a leaf: absent */',
      '    int i = 0;',
      '    while (i < node->n && key > node->keys[i]) i++;',
      '    if (i < node->n && key == node->keys[i]) { *out_node = node; return true; }',
      '    if (node->leaf) return false;                /* no child to descend into */',
      '    return b_tree_search(node->child[i], key, out_node);',
      '}'
    ];
  }
  function javaCode(order) {
    return [
      'static final int ORDER = ' + order + ';   // order m: at most ORDER-1 keys per node',
      '',
      'static Node bTreeSearch(Node node, int key) {',
      '    if (node == null) return null;                // fell off a leaf: absent',
      '    int i = 0;',
      '    while (i < node.n && key > node.keys[i]) i++;',
      '    if (i < node.n && key == node.keys[i]) return node;',
      '    if (node.leaf) return null;                   // no child to descend into',
      '    return bTreeSearch(node.child[i], key);',
      '}'
    ];
  }

  function buildTree(order, keys) {
    var pageCounter = 0;
    function newNode(leaf) { pageCounter++; return { id: pageCounter, keys: [], children: [], leaf: leaf, parent: null }; }
    var root = newNode(true);
    function insertSorted(node, key) {
      var i = node.keys.length - 1; node.keys.push(0);
      while (i >= 0 && node.keys[i] > key) { node.keys[i + 1] = node.keys[i]; i--; }
      node.keys[i + 1] = key;
    }
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
          cur.parent = nr; right.parent = nr; root = nr;
          cur = null; break;
        } else {
          var parent = cur.parent;
          insertSorted(parent, median);
          var pos = parent.keys.indexOf(median);
          parent.children.splice(pos + 1, 0, right);
          right.parent = parent;
          cur = parent;
        }
      }
    });
    return root;
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
    id: 'b-tree-search',
    title: T('B-ağacı: arama', 'B-tree: search'),
    code: function (d) { return { c: cCode(d.order), java: javaCode(d.order) }; },
    presets: [
      { id: 'normal', level: 'normal', name: T('order=4, 12 anahtar, 3 arama', 'order=4, 12 keys, 3 searches'),
        data: { order: 4, keys: [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15], queries: [17, 99, 3] } },
      { id: 'hard', level: 'hard', name: T('order=3, 14 artan anahtar, 4 arama', 'order=3, 14 ascending keys, 4 searches'),
        data: { order: 3, keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], queries: [1, 14, 7, 100] } },
      { id: 'root-hit', level: 'edge', name: T('Uç durum: kökte hemen bulunan anahtar', 'Edge case: a key found right at the root'),
        data: { order: 4, keys: [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15], queries: [12] }, small: false },
      { id: 'never-splits', level: 'edge', name: T('Uç durum: order=12, tek düğüm (10 anahtar), her arama 1 okuma', 'Edge case: order=12, a single node (10 keys), every search is 1 read'),
        data: { order: 12, keys: [23, 5, 41, 12, 38, 7, 29, 16, 44, 3], queries: [41, 100, 3] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      var order = d.order;
      var pageCounter = 0;
      function newNode(leaf) { pageCounter++; return { id: pageCounter, keys: [], children: [], leaf: leaf, parent: null }; }
      var root = newNode(true);
      function insSorted(node, key) {
        var i = node.keys.length - 1; node.keys.push(0);
        while (i >= 0 && node.keys[i] > key) { node.keys[i + 1] = node.keys[i]; i--; }
        node.keys[i + 1] = key;
      }
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
          if (!cur.parent) {
            var nr = newNode(false); nr.keys = [median]; nr.children = [cur, right];
            cur.parent = nr; right.parent = nr; root = nr; cur = null; break;
          } else {
            var parent = cur.parent; insSorted(parent, median);
            var pos = parent.keys.indexOf(median);
            parent.children.splice(pos + 1, 0, right);
            right.parent = parent; cur = parent;
          }
        }
      });
      function h(n) { return n.leaf ? 0 : 1 + Math.max.apply(null, n.children.map(h)); }
      function nc(n) { return n.leaf ? 1 : 1 + n.children.reduce(function (s, c) { return s + nc(c); }, 0); }
      var reads = 0, searches = [];
      d.queries.forEach(function (q) {
        var node = root, found = false, at = null;
        while (node) {
          reads++;
          var i = 0; while (i < node.keys.length && q > node.keys[i]) i++;
          if (i < node.keys.length && q === node.keys[i]) { found = true; at = node.id; break; }
          if (node.leaf) { at = null; break; }
          node = node.children[i];
        }
        searches.push({ key: q, found: found, page: at });
      });
      return { order: order, nodeCount: nc(root), height: h(root), reads: reads, searches: searches };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level] || 12;
      var order = level === 'extreme' ? 3 : D.randInt(r, 3, 5);
      var used = {}, keys = [];
      while (keys.length < n) { var v = D.randInt(r, 1, 300); if (!used[v]) { used[v] = true; keys.push(v); } }
      var nq = level === 'extreme' ? 4 : 3, queries = [];
      for (var j = 0; j < nq; j++) queries.push(r() < 0.6 ? keys[D.randInt(r, 0, n - 1)] : 400 + D.randInt(r, 0, 99));
      return { order: order, keys: keys, queries: queries };
    },
    input: {
      hint: T('Örnek: order=4 keys: 10,20,5,6,12,30,7,17,3,25,18,15 queries: 17,99,3',
              'Example: order=4 keys: 10,20,5,6,12,30,7,17,3,25,18,15 queries: 17,99,3'),
      parse: function (text) {
        var order = 4, keys = [], queries = [], mode = 'keys';
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^order[=:](\d+)$/i.exec(tok); if (m) { order = parseInt(m[1], 10); return; }
          if (/^keys?:?$/i.test(tok)) { mode = 'keys'; return; }
          if (/^(queries|query):?$/i.test(tok)) { mode = 'queries'; return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, order=N, keys ya da queries yazın.', '"' + tok + '" is not understood: write a number, order=N, keys or queries.');
          (mode === 'keys' ? keys : queries).push(parseInt(tok, 10));
        });
        if (order < 3 || order > 12) throw T('order 3 ile 12 arasında olmalı.', 'order must be between 3 and 12.');
        if (keys.length < 10) throw T('En az 10 anahtar yazın.', 'Write at least 10 keys.');
        var seen = {}; keys.forEach(function (k) { if (seen[k]) throw T('Anahtarlar tekrarsız olmalı.', 'Keys must be unique.'); seen[k] = true; });
        if (!queries.length) throw T('En az bir queries değeri yazın.', 'Write at least one queries value.');
        return { order: order, keys: keys, queries: queries };
      },
      format: function (d) { return 'order=' + d.order + ' keys: ' + d.keys.join(',') + ' queries: ' + d.queries.join(','); },
      bad: ['', 'order=2 keys: 1,2,3,4,5,6,7,8,9,10 queries: 5', 'keys: 1,2,3,4,5,6,7,8,9 queries: 5',
            'keys: 1,2,3,4,5,6,7,8,9,10 queries:', 'keys: 1,2,3,2,5,6,7,8,9,10 queries: 5', 'order=abc keys: 1,2,3,4,5,6,7,8,9,10 queries: 5'],
      tokens: function (d) { return d.queries.map(String); }
    },
    build: function (S, d) {
      var order = d.order, root = buildTree(order, d.keys);
      var reads = 0;

      S.label('title', { x: 20, y: 20, text: 'ORDER = ' + order, size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('io', { x: 20, y: 44, text: T('okuma: 0', 'reads: 0'), size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('dec', { x: 20, y: 66, text: '', size: 14, mono: true, anchor: 'start', style: 'dim' });
      function setIO() { S.set('io', { text: T('okuma: ' + reads, 'reads: ' + reads) }); }

      var pos = layoutTree(root);
      (function draw(node) {
        S.box('n' + node.id, { x: pos[node.id].x, y: pos[node.id].y, w: Math.max(50, node.keys.length * 30 + 14), h: 40, text: node.keys.join(','), style: 'normal', size: 14, above: T('sf ' + node.id, 'pg ' + node.id) });
        if (!node.leaf) node.children.forEach(function (c) { S.arrow('e' + node.id + '_' + c.id, { from: 'n' + node.id, to: 'n' + c.id, kind: 'center', head: false, style: 'dim' }); draw(c); });
      })(root);
      S.step(T('`ORDER=' + order + '` bir B-ağacı, ' + d.keys.length + ' anahtardan kurulmuş, yükseklik ' + treeHeight(root) + '. Her düğüm bir disk sayfası.',
               'An `ORDER=' + order + '` B-tree, built from ' + d.keys.length + ' keys, height ' + treeHeight(root) + '. Every node is one disk page.'),
             { c: [1], java: [1] });

      function clearStyles(node) { S.set('n' + node.id, { style: 'normal' }); if (!node.leaf) node.children.forEach(clearStyles); }
      function bsLines(i) {
        return [{ n: 4, note: T('node==NULL mi? hayır', 'node==NULL? no') }, 5,
                { n: 6, note: T('i taranan konum = ' + i, 'i scanned to = ' + i) }];
      }
      var results = [];
      d.queries.forEach(function (q, qi) {
        S.at(qi);
        clearStyles(root);
        S.set('dec', { text: '' });
        var node = root, found = false, at = null, depth = 0;
        while (node) {
          reads++; setIO(); depth++;
          S.set('n' + node.id, { style: 'hl' });
          var i = 0; while (i < node.keys.length && q > node.keys[i]) i++;
          if (i < node.keys.length && q === node.keys[i]) {
            found = true; at = node.id;
            S.set('n' + node.id, { style: 'new' });
            S.set('dec', { text: T('bulundu: sf ' + node.id, 'found: pg ' + node.id) });
            S.step(T('`b_tree_search(' + q + ')` sayfa ' + node.id + '\'de (' + node.keys.join(',') + ') -- tam eşleşme: `key == keys[' + i + ']`. **Bulundu.**',
                     '`b_tree_search(' + q + ')` at page ' + node.id + ' (' + node.keys.join(',') + ') -- exact match: `key == keys[' + i + ']`. **Found.**'),
                   { c: bsLines(i).concat([{ n: 7, note: T('eşit mi? evet', 'equal? yes') }]),
                     java: bsLines(i).concat([{ n: 7, note: T('eşit mi? evet', 'equal? yes') }]) });
            break;
          }
          if (node.leaf) {
            S.set('n' + node.id, { style: 'del' });
            S.set('dec', { text: T('bulunamadı', 'not found') });
            S.step(T('`b_tree_search(' + q + ')` sayfa ' + node.id + '\'de (' + node.keys.join(',') + ') -- eşleşme yok ve yaprak: inecek çocuk yok. **Bulunamadı.**',
                     '`b_tree_search(' + q + ')` at page ' + node.id + ' (' + node.keys.join(',') + ') -- no match and it is a leaf: no child to descend into. **Not found.**'),
                   { c: bsLines(i).concat([{ n: 7, note: T('eşit mi? hayır', 'equal? no') }, { n: 8, note: T('yaprak mı? evet', 'leaf? yes') }, { n: 9, skip: true }]),
                     java: bsLines(i).concat([{ n: 7, note: T('eşit mi? hayır', 'equal? no') }, { n: 8, note: T('yaprak mı? evet', 'leaf? yes') }, { n: 9, skip: true }]) });
            break;
          }
          var child = node.children[i];
          S.step(T('`b_tree_search(' + q + ')` sayfa ' + node.id + '\'de (' + node.keys.join(',') + ') -- eşleşme yok, yaprak da değil: çocuk ' + i + ' (sf ' + child.id + ') üzerinden devam.',
                   '`b_tree_search(' + q + ')` at page ' + node.id + ' (' + node.keys.join(',') + ') -- no match, and it is not a leaf: continue into child ' + i + ' (pg ' + child.id + ').'),
                 { c: bsLines(i).concat([{ n: 7, note: T('eşit mi? hayır', 'equal? no') }, { n: 8, note: T('yaprak mı? hayır', 'leaf? no') }, 9]),
                   java: bsLines(i).concat([{ n: 7, note: T('eşit mi? hayır', 'equal? no') }, { n: 8, note: T('yaprak mı? hayır', 'leaf? no') }, 9]) });
          node = child;
        }
        results.push({ key: q, found: found, page: at });
      });

      S.at(null);
      clearStyles(root);
      S.set('dec', { text: '' });
      S.result = { order: order, nodeCount: nodeCount(root), height: treeHeight(root), reads: reads, searches: results };
      S.step(T('Bitti: ' + d.queries.length + ' arama, toplam ' + reads + ' disk okuması. Her arama en çok `height+1 = ' + (treeHeight(root) + 1) + '` sayfa okur: `O(log_ORDER n)`.',
               'Done: ' + d.queries.length + ' searches, ' + reads + ' disk reads total. Every search reads at most `height+1 = ' + (treeHeight(root) + 1) + '` pages: `O(log_ORDER n)`.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
