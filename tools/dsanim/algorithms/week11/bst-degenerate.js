/* Week 11 — why balancing matters: inserting the SAME set of keys in different orders gives wildly different
 * BST shapes. Sorted (ascending or descending) input degenerates into a chain — height n-1, every operation
 * O(n), no better than a linked list. The same keys in a shuffled order tend to stay close to the ideal height
 * floor(log2 n). Uses the plain bst_insert() of bst-insert.js (see it for the step-by-step insertion code).
 * Data: {keys: [...]}. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'Node *bst_insert(Node *root, int key) {',
    '    Node *cur = root, *parent = NULL;',
    '    while (cur != NULL) {',
    '        parent = cur;',
    '        if (key == cur->key) return root;',
    '        if (key < cur->key)  cur = cur->left;',
    '        else                 cur = cur->right;',
    '    }',
    '    Node *n = malloc(sizeof(Node));',
    '    n->key = key; n->left = NULL; n->right = NULL;',
    '    if (parent == NULL) return n;',
    '    if (key < parent->key) parent->left = n;',
    '    else                    parent->right = n;',
    '    return root;',
    '}'
  ];
  var JAVA = [
    'static Node bstInsert(Node root, int key) {',
    '    Node cur = root, parent = null;',
    '    while (cur != null) {',
    '        parent = cur;',
    '        if (key == cur.key) return root;',
    '        if (key < cur.key)  cur = cur.left;',
    '        else                cur = cur.right;',
    '    }',
    '    Node n = new Node();',
    '    n.key = key; n.left = null; n.right = null;',
    '    if (parent == null) return n;',
    '    if (key < parent.key) parent.left = n;',
    '    else                   parent.right = n;',
    '    return root;',
    '}'
  ];

  var X0 = 60, Y0 = 60, DX = 40, DY = 60;
  function layoutTree(root) {
    var pos = {}, i = 0;
    (function walk(n, depth) { if (!n) return; walk(n.left, depth + 1); pos[n.nid] = { x: X0 + i * DX, y: Y0 + depth * DY }; i++; walk(n.right, depth + 1); })(root, 0);
    return pos;
  }
  function syncTree(S, root, pos, tracked, styleOf, annotateOf) {
    var seen = {};
    (function walk(n, depth) {
      if (!n) return;
      var cid = 'n' + n.nid; seen[cid] = 1;
      S.circle(cid, { x: pos[n.nid].x, y: pos[n.nid].y, r: 16, text: String(n.key), style: styleOf ? styleOf(n) : 'normal' });
      if (annotateOf) { var aid = 'a' + n.nid; seen[aid] = 1; S.label(aid, { x: pos[n.nid].x + 14, y: pos[n.nid].y - 14, text: 'd=' + depth, size: 10, anchor: 'start', style: 'dim' }); }
      if (n.left) { var el = 'e' + n.nid + 'l'; seen[el] = 1; S.arrow(el, { from: cid, to: 'n' + n.left.nid, kind: 'center', head: false }); walk(n.left, depth + 1); }
      if (n.right) { var er = 'e' + n.nid + 'r'; seen[er] = 1; S.arrow(er, { from: cid, to: 'n' + n.right.nid, kind: 'center', head: false }); walk(n.right, depth + 1); }
    })(root, 0);
    for (var id in tracked) if (!seen[id] && S.has(id)) S.remove(id);
    return seen;
  }
  function height(n) { return n ? 1 + Math.max(height(n.left), height(n.right)) : -1; }
  function toStruct(n) { return n ? { k: n.key, l: toStruct(n.left), r: toStruct(n.right) } : null; }

  D.define({
    id: 'bst-degenerate',
    title: T('Neden dengeleme gerekir: dejenere (chain) BST', 'Why balancing matters: a degenerate (chain) BST'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 anahtar artan sırada — zincir oluşur', '10 keys in ascending order — forms a chain'),
        data: { keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
      { id: 'hard', level: 'hard', name: T('14 anahtar azalan sırada — ters yönde zincir', '14 keys in descending order — a chain the other way'),
        data: { keys: [140, 130, 120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10] } },
      { id: 'edge-zigzag', level: 'edge', name: T('Uç durum: neredeyse sıralı, ufak sıçramalarla (yine de derin)', 'Edge case: nearly sorted with small zig-zags (still deep)'),
        data: { keys: [10, 20, 15, 30, 25, 40, 35, 50, 45, 60] } },
      { id: 'edge-shuffled-same-keys', level: 'edge', name: T('Uç durum: AYNI 10 anahtar karışık sırada — çok daha sığ', 'Edge case: the SAME 10 keys shuffled — much shallower'),
        data: { keys: [6, 9, 2, 10, 4, 8, 1, 7, 3, 5] } },
      { id: 'edge-single', level: 'edge', name: T('Uç durum: tek anahtar, yükseklik 0', 'Edge case: a single key, height 0'), data: { keys: [42] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      function ins(node, key) { if (!node) return { k: key, l: null, r: null }; if (key === node.k) return node; if (key < node.k) node.l = ins(node.l, key); else node.r = ins(node.r, key); return node; }
      function h(n) { return n ? 1 + Math.max(h(n.l), h(n.r)) : -1; }
      var root = null;
      d.keys.forEach(function (k) { root = ins(root, k); });
      return { tree: root, height: h(root) };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 18 }[level];
      var start = D.randInt(r, 1, 50), step = D.randInt(r, 1, 9);
      var keys = [];
      for (var i = 0; i < n; i++) keys.push(start + i * step);
      if (r() < 0.5) keys.reverse();
      return { keys: keys };
    },
    input: {
      hint: T('Örnek: 1 2 3 4 5 6 7 8 9 10   (sıralı verirsen zincir görürsün)', 'Example: 1 2 3 4 5 6 7 8 9 10   (give it sorted input to see the chain)'),
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
      function mkNode(key) { return { nid: NID++, key: key, left: null, right: null }; }
      var n = d.keys.length, idealH = Math.floor(Math.log2(n));
      S.label('hlbl', { x: X0, y: 20, text: '', anchor: 'start', size: 14, bold: true, style: 'active' });
      S.step(T('Aynı ' + n + ' anahtarı, sırayla, sıradan `bst_insert` ile ekleyeceğiz. Soru: eklenme SIRASI, ortaya çıkan ağacın şeklini nasıl etkiler?',
               'We will insert the same ' + n + ' keys, in order, with the plain `bst_insert`. Question: how does the INSERTION ORDER affect the shape of the resulting tree?'),
             { c: [1], java: [1] });

      var comparisons = 0;
      d.keys.forEach(function (key, ki) {
        S.at(ki);
        var cur = root, parent = null, depth = 0;
        var line3EntryNote = T('cur != NULL? ' + (cur ? 'evet' : 'hayır'), 'cur != NULL? ' + (cur ? 'yes' : 'no'));
        var lines = { c: [1, 2, { n: 3, note: line3EntryNote }], java: [1, 2, { n: 3, note: line3EntryNote }] };
        while (cur) {
          comparisons++;
          var goLeft = key < cur.key;
          var line6Note = T(key + ' < ' + cur.key + '? ' + (goLeft ? 'evet' : 'hayır'), key + ' < ' + cur.key + '? ' + (goLeft ? 'yes' : 'no'));
          /* This step always condenses the WHOLE walk (every comparison of this insertion) into one
             S.step, so no skip:true here: a walk that goes left at one ancestor and right at another
             would otherwise mark the same line both executed and skipped within one step. Both lines 6
             and 7 really did run somewhere in a multi-comparison walk; they are shown as plain executed. */
          lines.c.push(4, { n: 5, note: T(key + ' == ' + cur.key + '? hayır', key + ' == ' + cur.key + '? no') }, goLeft ? { n: 6, note: line6Note } : 7);
          lines.java.push(4, { n: 5, note: T(key + ' == ' + cur.key + '? hayır', key + ' == ' + cur.key + '? no') }, goLeft ? { n: 6, note: line6Note } : 7);
          parent = cur; cur = goLeft ? cur.left : cur.right; depth++;
        }
        var line3ExitNote = T('cur != NULL? hayır', 'cur != NULL? no');
        lines.c.push({ n: 3, note: line3ExitNote }, 9, 10, { n: 11, note: T('parent == NULL? ' + (parent ? 'hayır' : 'evet'), 'parent == NULL? ' + (parent ? 'no' : 'yes')) });
        lines.java.push({ n: 3, note: line3ExitNote }, 9, 10, { n: 11, note: T('parent == NULL? ' + (parent ? 'hayır' : 'evet'), 'parent == NULL? ' + (parent ? 'no' : 'yes')) });
        var nn = mkNode(key);
        if (!parent) { root = nn; }
        else {
          var gl = key < parent.key;
          var line12Note = T(key + ' < ' + parent.key + '? ' + (gl ? 'evet' : 'hayır'), key + ' < ' + parent.key + '? ' + (gl ? 'yes' : 'no'));
          lines.c.push(gl ? { n: 12, note: line12Note } : { n: 12, skip: true }, gl ? { n: 13, skip: true } : 13, 14);
          lines.java.push(gl ? { n: 12, note: line12Note } : { n: 12, skip: true }, gl ? { n: 13, skip: true } : 13, 14);
          if (gl) parent.left = nn; else parent.right = nn;
        }
        var pos = layoutTree(root);
        tracked = syncTree(S, root, pos, tracked, function (node) { return node === nn ? 'new' : 'normal'; }, true);
        var curH = height(root);
        S.set('hlbl', { text: 'height = ' + curH + '  (ideal for ' + (ki + 1) + ' node' + (ki ? 's' : '') + ' = ' + Math.floor(Math.log2(ki + 1)) + ')' });
        S.step(T('`insert(' + key + ')` — derinlik ' + depth + '\'te yeni yaprak. Şu ana kadar yükseklik: **' + curH + '** (' + (ki + 1) + ' düğüm için ideal: ' + Math.floor(Math.log2(ki + 1)) + ').',
                 '`insert(' + key + ')` — new leaf at depth ' + depth + '. Height so far: **' + curH + '** (ideal for ' + (ki + 1) + ' nodes: ' + Math.floor(Math.log2(ki + 1)) + ').'), lines);
      });

      S.at(null);
      var finalH = height(root);
      S.result = { tree: toStruct(root), height: finalH };
      var ratio = idealH > 0 ? (finalH / idealH).toFixed(1) : String(finalH);
      S.step(T('Bitti. ' + n + ' düğüm, yükseklik = **' + finalH + '**; dengeli bir ağaçta ideal yükseklik yalnızca **' + idealH + '** olurdu (yaklaşık ' + ratio + 'x fark). Bu yüzden AVL, kırmızı-siyah gibi DENGELİ ağaçlar var — sonraki animasyonlarda.',
               'Done. ' + n + ' nodes, height = **' + finalH + '**; a balanced tree would need only height **' + idealH + '** (about ' + ratio + 'x apart). This is exactly why BALANCED trees — AVL, red-black — exist, coming up next.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
