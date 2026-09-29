/* Week 14 -- B+-tree: every key lives in a LEAF (internal nodes only route); leaves are linked into a
   chain, so a RANGE QUERY finds the first leaf once, then walks the chain -- no repeated descents. */
(function (D) {
  'use strict';
  var T = D.T;

  function cCode(order) {
    return [
      '#define ORDER ' + order + '                    /* leaves hold up to ORDER-1 keys */',
      '',
      'void insert_sorted(Node *node, int key) {        /* shift-insert, keeps keys ascending */',
      '    int i = node->n - 1;',
      '    while (i >= 0 && node->keys[i] > key) { node->keys[i + 1] = node->keys[i]; i--; }',
      '    node->keys[i + 1] = key;',
      '    node->n++;',
      '}',
      '',
      'Node *split_leaf(Node *leaf, int *copy_up) {',
      '    int mid = (leaf->n + 1) / 2;                 /* left keeps the larger half */',
      '    *copy_up = leaf->keys[mid];                  /* COPIED up -- stays in the right leaf too */',
      '    Node *right = new_leaf_from(leaf, mid);       /* right takes keys[mid .. n-1] */',
      '    right->next = leaf->next; leaf->next = right; /* splice into the leaf chain */',
      '    leaf->n = mid;',
      '    return right;',
      '}',
      '',
      'Node *split_internal(Node *node, int *push_up) {',
      '    int mid = node->n / 2;',
      '    *push_up = node->keys[mid];                  /* REMOVED -- only routes, does not stay */',
      '    Node *right = new_node_from(node, mid + 1);',
      '    node->n = mid;',
      '    return right;',
      '}',
      '',
      'void range_query(Node *root, int lo, int hi, int out[], int *count) {',
      '    Node *leaf = find_leaf(root, lo);             /* descend ONCE to the first leaf */',
      '    *count = 0;',
      '    while (leaf != NULL) {',
      '        for (int i = 0; i < leaf->n; i++)',
      '            if (leaf->keys[i] >= lo && leaf->keys[i] <= hi) out[(*count)++] = leaf->keys[i];',
      '        if (leaf->n > 0 && leaf->keys[leaf->n - 1] > hi) break;   /* past hi: stop */',
      '        leaf = leaf->next;                        /* follow the LEAF CHAIN, no re-descent */',
      '    }',
      '}'
    ];
  }
  function javaCode(order) {
    return [
      'static final int ORDER = ' + order + ';         // leaves hold up to ORDER-1 keys',
      '',
      'static void insertSorted(Node node, int key) {    // shift-insert, keeps keys ascending',
      '    int i = node.n - 1;',
      '    while (i >= 0 && node.keys[i] > key) { node.keys[i + 1] = node.keys[i]; i--; }',
      '    node.keys[i + 1] = key;',
      '    node.n++;',
      '}',
      '',
      'static Node splitLeaf(Node leaf, int[] copyUp) {',
      '    int mid = (leaf.n + 1) / 2;                   // left keeps the larger half',
      '    copyUp[0] = leaf.keys[mid];                    // COPIED up -- stays in the right leaf too',
      '    Node right = newLeafFrom(leaf, mid);            // right takes keys[mid .. n-1]',
      '    right.next = leaf.next; leaf.next = right;      // splice into the leaf chain',
      '    leaf.n = mid;',
      '    return right;',
      '}',
      '',
      'static Node splitInternal(Node node, int[] pushUp) {',
      '    int mid = node.n / 2;',
      '    pushUp[0] = node.keys[mid];                    // REMOVED -- only routes, does not stay',
      '    Node right = newNodeFrom(node, mid + 1);',
      '    node.n = mid;',
      '    return right;',
      '}',
      '',
      'static int[] rangeQuery(Node root, int lo, int hi) {',
      '    Node leaf = findLeaf(root, lo);                 // descend ONCE to the first leaf',
      '    List<Integer> out = new ArrayList<>();',
      '    while (leaf != null) {',
      '        for (int i = 0; i < leaf.n; i++)',
      '            if (leaf.keys[i] >= lo && leaf.keys[i] <= hi) out.add(leaf.keys[i]);',
      '        if (leaf.n > 0 && leaf.keys[leaf.n - 1] > hi) break;    // past hi: stop',
      '        leaf = leaf.next;                            // follow the LEAF CHAIN, no re-descent',
      '    }',
      '    return toArray(out);',
      '}'
    ];
  }

  function makeBuilder() {
    var pageCounter = 0;
    function newNode(leaf) { pageCounter++; return { id: pageCounter, keys: [], children: [], leaf: leaf, parent: null, next: null }; }
    function insertSorted(node, key) {
      var i = node.keys.length - 1; node.keys.push(0);
      while (i >= 0 && node.keys[i] > key) { node.keys[i + 1] = node.keys[i]; i--; }
      node.keys[i + 1] = key;
    }
    function insertIntoParent(left, key, right) {
      if (!left.parent) {
        var nr = newNode(false); nr.keys = [key]; nr.children = [left, right];
        left.parent = nr; right.parent = nr; return nr;
      }
      var parent = left.parent;
      insertSorted(parent, key);
      var pos = parent.children.indexOf(left);
      parent.children.splice(pos + 1, 0, right);
      right.parent = parent;
      if (parent.keys.length === undefined) return parent; // unreachable, keeps linter calm
      return null;
    }
    function buildTree(order, keys) {
      var root = newNode(true);
      keys.forEach(function (key) {
        var node = root;
        while (!node.leaf) { var i = 0; while (i < node.keys.length && key >= node.keys[i]) i++; node = node.children[i]; }
        insertSorted(node, key);
        if (node.keys.length === order) {
          var mid = Math.ceil(node.keys.length / 2);
          var copyUp = node.keys[mid];
          var right = newNode(true);
          right.keys = node.keys.slice(mid);
          right.next = node.next; node.next = right;
          node.keys = node.keys.slice(0, mid);
          var newRoot = insertIntoParent(node, copyUp, right);
          if (newRoot) root = newRoot;
          var cur = (node.parent && node.parent.keys.length === order) ? node.parent : null;
          while (cur) {
            var mid2 = Math.floor(cur.keys.length / 2), pushUp = cur.keys[mid2];
            var rightI = newNode(false);
            rightI.keys = cur.keys.slice(mid2 + 1);
            rightI.children = cur.children.slice(mid2 + 1);
            rightI.children.forEach(function (c) { c.parent = rightI; });
            cur.keys = cur.keys.slice(0, mid2);
            cur.children = cur.children.slice(0, mid2 + 1);
            var newRoot2 = insertIntoParent(cur, pushUp, rightI);
            if (newRoot2) { root = newRoot2; cur = null; }
            else cur = (cur.parent && cur.parent.keys.length === order) ? cur.parent : null;
          }
        }
      });
      return root;
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
  function leafCountOf(node) { return node.leaf ? 1 : node.children.reduce(function (s, c) { return s + leafCountOf(c); }, 0); }
  function firstLeaf(node) { return node.leaf ? node : firstLeaf(node.children[0]); }
  function findLeafFor(root, key) {
    var node = root, reads = 1;
    while (!node.leaf) { var i = 0; while (i < node.keys.length && key >= node.keys[i]) i++; node = node.children[i]; reads++; }
    return { leaf: node, reads: reads };
  }

  D.define({
    id: 'b-plus-tree',
    title: T('B+-ağacı: yaprak zinciri ve aralık sorgusu', 'B+-tree: leaf chain and range query'),
    code: function (d) { return { c: cCode(d.order), java: javaCode(d.order) }; },
    presets: [
      { id: 'normal', level: 'normal', name: T('order=4, 12 anahtar, 3 aralık sorgusu', 'order=4, 12 keys, 3 range queries'),
        data: { order: 4, keys: [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15], ranges: [[6, 18], [26, 100], [15, 15]] } },
      { id: 'hard', level: 'hard', name: T('order=3, 14 artan anahtar, uzun zincir yürüyüşü', 'order=3, 14 ascending keys, a long chain walk'),
        data: { order: 3, keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], ranges: [[3, 11], [50, 60]] } },
      { id: 'whole-range', level: 'edge', name: T('Uç durum: tüm anahtarları kapsayan aralık (zincirin sonuna kadar)', 'Edge case: a range covering every key (walks to the end of the chain)'),
        data: { order: 4, keys: [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15], ranges: [[0, 999]] } },
      { id: 'empty-range', level: 'edge', name: T('Uç durum: hiçbir anahtarı kapsamayan aralık', 'Edge case: a range that matches no key'),
        data: { order: 4, keys: [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15], ranges: [[1000, 2000], [-50, -1]] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      var order = d.order, pageCounter = 0;
      function newNode(leaf) { pageCounter++; return { id: pageCounter, keys: [], children: [], leaf: leaf, parent: null, next: null }; }
      function insSorted(node, key) {
        var i = node.keys.length - 1; node.keys.push(0);
        while (i >= 0 && node.keys[i] > key) { node.keys[i + 1] = node.keys[i]; i--; }
        node.keys[i + 1] = key;
      }
      function insertIntoParent(left, key, right) {
        if (!left.parent) { var nr = newNode(false); nr.keys = [key]; nr.children = [left, right]; left.parent = nr; right.parent = nr; return nr; }
        var parent = left.parent; insSorted(parent, key);
        var pos = parent.children.indexOf(left);
        parent.children.splice(pos + 1, 0, right); right.parent = parent;
        return null;
      }
      var root = newNode(true);
      d.keys.forEach(function (key) {
        var node = root;
        while (!node.leaf) { var i = 0; while (i < node.keys.length && key >= node.keys[i]) i++; node = node.children[i]; }
        insSorted(node, key);
        if (node.keys.length === order) {
          var mid = Math.ceil(node.keys.length / 2), copyUp = node.keys[mid];
          var right = newNode(true);
          right.keys = node.keys.slice(mid); right.next = node.next; node.next = right;
          node.keys = node.keys.slice(0, mid);
          var newRoot = insertIntoParent(node, copyUp, right);
          if (newRoot) root = newRoot;
          var cur = (node.parent && node.parent.keys.length === order) ? node.parent : null;
          while (cur) {
            var mid2 = Math.floor(cur.keys.length / 2), pushUp = cur.keys[mid2];
            var rightI = newNode(false);
            rightI.keys = cur.keys.slice(mid2 + 1);
            rightI.children = cur.children.slice(mid2 + 1);
            rightI.children.forEach(function (c) { c.parent = rightI; });
            cur.keys = cur.keys.slice(0, mid2);
            cur.children = cur.children.slice(0, mid2 + 1);
            var newRoot2 = insertIntoParent(cur, pushUp, rightI);
            if (newRoot2) { root = newRoot2; cur = null; } else cur = (cur.parent && cur.parent.keys.length === order) ? cur.parent : null;
          }
        }
      });
      function h(n) { return n.leaf ? 0 : 1 + Math.max.apply(null, n.children.map(h)); }
      function lc(n) { return n.leaf ? 1 : n.children.reduce(function (s, c) { return s + lc(c); }, 0); }
      var totalReads = 0, results = [];
      d.ranges.forEach(function (rg) {
        var lo = rg[0], hi = rg[1];
        var node = root, reads = 1;
        while (!node.leaf) { var i = 0; while (i < node.keys.length && lo >= node.keys[i]) i++; node = node.children[i]; reads++; }
        var leaf = node, out = [];
        while (leaf) {
          for (var k = 0; k < leaf.keys.length; k++) if (leaf.keys[k] >= lo && leaf.keys[k] <= hi) out.push(leaf.keys[k]);
          if (leaf.keys.length > 0 && leaf.keys[leaf.keys.length - 1] > hi) break;
          leaf = leaf.next; if (leaf) reads++;
        }
        totalReads += reads;
        results.push({ lo: lo, hi: hi, keys: out, reads: reads });
      });
      return { order: order, leafCount: lc(root), height: h(root), totalReads: totalReads, ranges: results };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level] || 12;
      var order = level === 'extreme' ? 3 : D.randInt(r, 3, 5);
      var used = {}, keys = [];
      while (keys.length < n) { var v = D.randInt(r, 1, 200); if (!used[v]) { used[v] = true; keys.push(v); } }
      var nr = level === 'extreme' ? 3 : 2, ranges = [];
      for (var j = 0; j < nr; j++) {
        var a = keys[D.randInt(r, 0, n - 1)], b = a + D.randInt(r, 0, 40);
        ranges.push([a, b]);
      }
      return { order: order, keys: keys, ranges: ranges };
    },
    input: {
      hint: T('Örnek: order=4 keys: 10,20,5,6,12,30,7,17,3,25,18,15 ranges: 6-18,26-100',
              'Example: order=4 keys: 10,20,5,6,12,30,7,17,3,25,18,15 ranges: 6-18,26-100'),
      parse: function (text) {
        var order = 4, keys = [], ranges = [], mode = 'keys';
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^order[=:](\d+)$/i.exec(tok); if (m) { order = parseInt(m[1], 10); return; }
          if (/^keys?:?$/i.test(tok)) { mode = 'keys'; return; }
          if (/^ranges?:?$/i.test(tok)) { mode = 'ranges'; return; }
          if (mode === 'ranges') {
            var rm = /^(-?\d+)-(-?\d+)$/.exec(tok);
            if (!rm) throw T('"' + tok + '" bir aralık değil: lo-hi yazın (ör. 6-18).', '"' + tok + '" is not a range: write lo-hi (e.g. 6-18).');
            ranges.push([parseInt(rm[1], 10), parseInt(rm[2], 10)]);
            return;
          }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, order=N, keys ya da ranges yazın.', '"' + tok + '" is not understood: write a number, order=N, keys or ranges.');
          keys.push(parseInt(tok, 10));
        });
        if (order < 3 || order > 6) throw T('order 3 ile 6 arasında olmalı.', 'order must be between 3 and 6.');
        if (keys.length < 10) throw T('En az 10 anahtar yazın.', 'Write at least 10 keys.');
        var seen = {}; keys.forEach(function (k) { if (seen[k]) throw T('Anahtarlar tekrarsız olmalı.', 'Keys must be unique.'); seen[k] = true; });
        if (!ranges.length) throw T('En az bir ranges değeri yazın (lo-hi).', 'Write at least one ranges value (lo-hi).');
        return { order: order, keys: keys, ranges: ranges };
      },
      format: function (d) { return 'order=' + d.order + ' keys: ' + d.keys.join(',') + ' ranges: ' + d.ranges.map(function (rg) { return rg[0] + '-' + rg[1]; }).join(','); },
      bad: ['', 'order=2 keys: 1,2,3,4,5,6,7,8,9,10 ranges: 1-5', 'keys: 1,2,3,4,5,6,7,8,9 ranges: 1-5',
            'keys: 1,2,3,4,5,6,7,8,9,10 ranges:', 'keys: 1,2,3,2,5,6,7,8,9,10 ranges: 1-5', 'keys: 1,2,3,4,5,6,7,8,9,10 ranges: abc'],
      tokens: function (d) { return d.ranges.map(function (rg) { return rg[0] + '-' + rg[1]; }); }
    },
    build: function (S, d) {
      var order = d.order;
      var built = makeBuilder(), root = built.buildTree(order, d.keys);

      S.label('title', { x: 20, y: 20, text: 'ORDER = ' + order, size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('io', { x: 20, y: 44, text: T('okuma: 0', 'reads: 0'), size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('dec', { x: 20, y: 66, text: '', size: 14, mono: true, anchor: 'start', style: 'dim' });
      var reads = 0;
      function setIO() { S.set('io', { text: T('okuma: ' + reads, 'reads: ' + reads) }); }

      var pos = layoutTree(root);
      (function draw(node) {
        S.box('n' + node.id, { x: pos[node.id].x, y: pos[node.id].y, w: Math.max(50, node.keys.length * 30 + 14), h: 40, text: node.keys.join(','), style: 'normal', size: 14, above: T('sf ' + node.id, 'pg ' + node.id) });
        if (!node.leaf) node.children.forEach(function (c) { S.arrow('e' + node.id + '_' + c.id, { from: 'n' + node.id, to: 'n' + c.id, kind: 'center', head: false, style: 'dim' }); draw(c); });
      })(root);
      var leaf0 = firstLeaf(root), chainIds = [];
      while (leaf0) {
        if (leaf0.next) { S.arrow('chain' + leaf0.id, { from: 'n' + leaf0.id, to: 'n' + leaf0.next.id, kind: 'center', head: true, style: 'active', bend: 30 }); chainIds.push('chain' + leaf0.id); }
        leaf0 = leaf0.next;
      }
      S.step(T('`ORDER=' + order + '` bir B+-ağacı, ' + d.keys.length + ' anahtardan kurulmuş. Bütün anahtarlar YAPRAKLARDA; iç düğümler yalnız yönlendirir. Yapraklar bir ZİNCİR (turuncu oklar) oluşturur.',
               'An `ORDER=' + order + '` B+-tree, built from ' + d.keys.length + ' keys. Every key lives in a LEAF; internal nodes only route. The leaves form a CHAIN (orange arrows).'),
             { c: [1], java: [1] });

      function clearHl() {
        (function walk(n) { S.set('n' + n.id, { style: 'normal' }); if (!n.leaf) n.children.forEach(walk); })(root);
        chainIds.forEach(function (id) { S.set(id, { style: 'active' }); });
      }
      function bpLoopLines(leaf, matched, note33) {
        return [
          { n: 31, note: T('i: 0..' + (leaf.keys.length - 1), 'i: 0..' + (leaf.keys.length - 1)) },
          { n: 32, note: T(matched.length + ' eşleşme', matched.length + ' matches') },
          { n: 33, note: note33 }
        ];
      }
      var results = [];
      d.ranges.forEach(function (rg, ri) {
        S.at(ri);
        clearHl(); S.set('dec', { text: '' });
        var lo = rg[0], hi = rg[1];
        var node = root; reads++; var rangeReads = 1;
        while (!node.leaf) { var i = 0; while (i < node.keys.length && lo >= node.keys[i]) i++; node = node.children[i]; reads++; rangeReads++; }
        setIO();
        S.set('n' + node.id, { style: 'hl' });
        S.step(T('`range_query(' + lo + ',' + hi + ')`: kökten `' + lo + '`\'e göre tek seferde iniyoruz -- ilk yaprak sf ' + node.id + ' (' + reads + ' okuma).',
                 '`range_query(' + lo + ',' + hi + ')`: descend once from the root toward `' + lo + '` -- the first leaf is pg ' + node.id + ' (' + reads + ' reads).'),
               { c: [28], java: [28] });

        var leaf = node, out = [], stop = false;
        while (leaf && !stop) {
          var matched = [];
          for (var k = 0; k < leaf.keys.length; k++) if (leaf.keys[k] >= lo && leaf.keys[k] <= hi) matched.push(leaf.keys[k]);
          out = out.concat(matched);
          var overshoot = leaf.keys.length > 0 && leaf.keys[leaf.keys.length - 1] > hi;
          S.set('n' + leaf.id, { style: matched.length ? 'new' : 'dim' });
          S.set('dec', { text: T(matched.length + ' eşleşme burada', matched.length + ' matches here') });
          if (overshoot) {
            S.step(T('Sayfa ' + leaf.id + ' (' + leaf.keys.join(',') + '): eşleşenler ' + (matched.length ? matched.join(',') : '(yok)') + '. Son anahtar `' + hi + '`\'ı aştı -- **dur**, zincirde ilerlemeye gerek yok.',
                     'Page ' + leaf.id + ' (' + leaf.keys.join(',') + '): matches ' + (matched.length ? matched.join(',') : '(none)') + '. The last key passed `' + hi + '` -- **stop**, no need to keep walking the chain.'),
                   { c: bpLoopLines(leaf, matched, T('aştı mı? evet', 'past hi? yes')), java: bpLoopLines(leaf, matched, T('aştı mı? evet', 'past hi? yes')) });
            stop = true;
          } else if (leaf.next) {
            S.step(T('Sayfa ' + leaf.id + ' (' + leaf.keys.join(',') + '): eşleşenler ' + (matched.length ? matched.join(',') : '(yok)') + '. Zincirdeki bir sonraki yaprağa geçiliyor -- köke geri dönmeye gerek YOK.',
                     'Page ' + leaf.id + ' (' + leaf.keys.join(',') + '): matches ' + (matched.length ? matched.join(',') : '(none)') + '. Move to the next leaf via the chain -- NO need to go back up to the root.'),
                   { c: bpLoopLines(leaf, matched, T('aştı mı? hayır', 'past hi? no')).concat([34]),
                     java: bpLoopLines(leaf, matched, T('aştı mı? hayır', 'past hi? no')).concat([34]) });
            reads++; rangeReads++; setIO();
            leaf = leaf.next;
          } else {
            S.step(T('Sayfa ' + leaf.id + ' (' + leaf.keys.join(',') + '): eşleşenler ' + (matched.length ? matched.join(',') : '(yok)') + '. Zincirin sonuna gelindi.',
                     'Page ' + leaf.id + ' (' + leaf.keys.join(',') + '): matches ' + (matched.length ? matched.join(',') : '(none)') + '. Reached the end of the chain.'),
                   { c: bpLoopLines(leaf, matched, T('aştı mı? hayır', 'past hi? no')).concat([{ n: 34, note: T('sonraki yok', 'no next') }]),
                     java: bpLoopLines(leaf, matched, T('aştı mı? hayır', 'past hi? no')).concat([{ n: 34, note: T('sonraki yok', 'no next') }]) });
            stop = true;
          }
        }
        S.set('dec', { text: T(out.length + ' anahtar bulundu', out.length + ' keys found') });
        results.push({ lo: lo, hi: hi, keys: out, reads: rangeReads });
      });

      S.at(null); clearHl(); S.set('dec', { text: '' });
      S.result = { order: order, leafCount: leafCountOf(root), height: treeHeight(root), totalReads: reads, ranges: results.map(function (r) { return { lo: r.lo, hi: r.hi, keys: r.keys, reads: r.reads }; }) };
      S.step(T('Bitti: ' + d.ranges.length + ' aralık sorgusu, toplam ' + reads + ' okuma. B+-ağacının kazancı: bir kez in, sonra sadece zinciri yürü -- her yaprak için köke dönmek yok.',
               'Done: ' + d.ranges.length + ' range queries, ' + reads + ' reads total. The B+-tree payoff: descend once, then just walk the chain -- no re-descending from the root for every leaf.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
