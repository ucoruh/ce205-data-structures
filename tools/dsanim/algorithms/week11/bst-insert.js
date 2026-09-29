/* Week 11 — binary search tree (BST): insert. First insertion detailed one comparison at a time; later
 * insertions shown as one step each (see Week 3's array-stack-push-pop.js for the same "first slow, rest
 * fast" pattern). Duplicates are ignored (tree unchanged). Data: {keys: [...]} — keys inserted in order. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'typedef struct Node {',
    '    int key;',
    '    struct Node *left;',
    '    struct Node *right;',
    '} Node;',
    '',
    'Node *bst_insert(Node *root, int key) {',
    '    Node *cur = root, *parent = NULL;',
    '    while (cur != NULL) {',
    '        parent = cur;',
    '        if (key == cur->key) return root;             /* duplicate: tree unchanged */',
    '        if (key < cur->key)  cur = cur->left;',
    '        else                 cur = cur->right;',
    '    }',
    '    Node *n = malloc(sizeof(Node));',
    '    n->key = key;',
    '    n->left = NULL;',
    '    n->right = NULL;',
    '    if (parent == NULL) return n;                      /* empty tree: n is the new root */',
    '    if (key < parent->key) parent->left = n;',
    '    else                    parent->right = n;',
    '    return root;',
    '}'
  ];
  var JAVA = [
    'static class Node {',
    '    int key;',
    '    Node left;',
    '    Node right;',
    '}',
    '',
    'static Node bstInsert(Node root, int key) {',
    '    Node cur = root, parent = null;',
    '    while (cur != null) {',
    '        parent = cur;',
    '        if (key == cur.key) return root;               // duplicate: tree unchanged',
    '        if (key < cur.key)  cur = cur.left;',
    '        else                cur = cur.right;',
    '    }',
    '    Node n = new Node();',
    '    n.key = key;',
    '    n.left = null;',
    '    n.right = null;',
    '    if (parent == null) return n;                       // empty tree: n is the new root',
    '    if (key < parent.key) parent.left = n;',
    '    else                   parent.right = n;',
    '    return root;',
    '}'
  ];

  /* ---- tree helpers (local to this file; build() uses these, reference() does not) ---- */
  var X0 = 60, Y0 = 60, DX = 54, DY = 78;
  function layoutTree(root) {
    var pos = {}, i = 0;
    (function walk(n, depth) {
      if (!n) return;
      walk(n.left, depth + 1);
      pos[n.nid] = { x: X0 + i * DX, y: Y0 + depth * DY };
      i++;
      walk(n.right, depth + 1);
    })(root, 0);
    return pos;
  }
  /** Draw/refresh every node+edge of the tree and remove any that no longer belong (returns the new tracked-id set). */
  function syncTree(S, root, pos, tracked, styleOf) {
    var seen = {};
    (function walk(n) {
      if (!n) return;
      var cid = 'n' + n.nid;
      seen[cid] = 1;
      S.circle(cid, { x: pos[n.nid].x, y: pos[n.nid].y, text: String(n.key), style: styleOf ? styleOf(n) : 'normal' });
      if (n.left) { var el = 'e' + n.nid + 'l'; seen[el] = 1; S.arrow(el, { from: cid, to: 'n' + n.left.nid, kind: 'center', head: false }); walk(n.left); }
      if (n.right) { var er = 'e' + n.nid + 'r'; seen[er] = 1; S.arrow(er, { from: cid, to: 'n' + n.right.nid, kind: 'center', head: false }); walk(n.right); }
    })(root);
    for (var id in tracked) if (!seen[id] && S.has(id)) S.remove(id);
    return seen;
  }
  function toStruct(n) { return n ? { k: n.key, l: toStruct(n.left), r: toStruct(n.right) } : null; }

  D.define({
    id: 'bst-insert',
    title: T('İkili arama ağacı: ekleme (insert)', 'Binary search tree: insert'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 anahtar, orta karışıklıkta sıra', '10 keys, a moderately mixed order'),
        data: { keys: [50, 30, 70, 20, 40, 60, 80, 35, 65, 90] } },
      { id: 'hard', level: 'hard', name: T('14 anahtar, negatif değerler ve bir yineleneni var', '14 keys, with negative values and a repeat'),
        data: { keys: [10, -5, 25, 10, -20, 5, 17, 30, -5, 3, 22, 40, -15, 12] } },
      { id: 'edge-duplicates', level: 'edge', name: T('Uç durum: 10 değer, yalnız 3 farklı anahtar', 'Edge case: 10 values, only 3 distinct keys'),
        data: { keys: [8, 8, 3, 8, 3, 15, 3, 8, 15, 8] } },
      { id: 'edge-sorted', level: 'edge', name: T('Uç durum: artan sırada 10 anahtar — neredeyse zincir oluşur', 'Edge case: 10 keys in ascending order — forms a near-chain'),
        data: { keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
      { id: 'edge-single', level: 'edge', name: T('Uç durum: tek anahtar', 'Edge case: a single key'), data: { keys: [42] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    /** Independent recursive insertion over plain {k,l,r} objects — a different technique (recursive,
     *  no node ids) from build()'s iterative, node-object walk. */
    reference: function (d) {
      function ins(node, key) {
        if (!node) return { k: key, l: null, r: null };
        if (key === node.k) return node;
        if (key < node.k) node.l = ins(node.l, key); else node.r = ins(node.r, key);
        return node;
      }
      var root = null;
      d.keys.forEach(function (k) { root = ins(root, k); });
      return root;
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level];
      var lo = level === 'extreme' ? -500 : (level === 'hard' ? -99 : 1);
      var hi = level === 'extreme' ? 500 : (level === 'hard' ? 199 : 99);
      var keys = [];
      for (var i = 0; i < n; i++) {
        if (i > 2 && r() < 0.15) keys.push(keys[D.randInt(r, 0, keys.length - 1)]);
        else keys.push(D.randInt(r, lo, hi));
      }
      return { keys: keys };
    },
    input: {
      hint: T('Örnek: 50 30 70 20 40 60 80   (eklenecek anahtarlar, sırayla)', 'Example: 50 30 70 20 40 60 80   (keys to insert, in order)'),
      parse: function (text) {
        var toks = String(text).trim().split(/[\s,;]+/).filter(Boolean);
        if (!toks.length) throw T('En az bir anahtar yazın.', 'Write at least one key.');
        if (toks.length > 40) throw T('En çok 40 anahtar.', 'At most 40 keys.');
        return { keys: toks.map(function (tok) {
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" bir tamsayı değil.', '"' + tok + '" is not an integer.');
          return parseInt(tok, 10);
        }) };
      },
      format: function (d) { return d.keys.join(' '); },
      bad: ['', '5 x 7', '3.5 8', '5 seven 7']
    },
    build: function (S, d) {
      var NID = 0, root = null, tracked = {};
      function mkNode(key) { return { nid: NID++, key: key, left: null, right: null }; }

      /* Step 1: show every key waiting to be inserted, so nothing appears from nowhere. */
      var RX = X0 + 620;
      S.label('waitlbl', { x: RX, y: 18, text: T('eklenecek:', 'to insert:'), anchor: 'start', size: 13, style: 'dim' });
      d.keys.forEach(function (k, i) {
        var col = i % 5, row = Math.floor(i / 5);
        S.box('w' + i, { x: RX + col * 46, y: 26 + row * 34, w: 40, h: 28, text: String(k), style: 'dim', size: 14 });
      });
      S.at(0);
      S.step(T('İkili arama ağacı (binary search tree, BST) her düğümde şu kuralı korur: sol alt ağaçtaki her anahtar küçük, sağ alt ağaçtaki her anahtar büyüktür. ' + d.keys.length + ' anahtarı sırayla ekleyeceğiz. Ağaç şu an boş (`root = NULL`).',
               'A binary search tree (BST) keeps one rule at every node: every key in the left subtree is smaller, every key in the right subtree is larger. We will insert ' + d.keys.length + ' keys in order. The tree starts empty (`root = NULL`).'),
             { c: [1, 2, 3, 4, 5], java: [1, 2, 3, 4, 5] });

      d.keys.forEach(function (key, ki) {
        S.at(ki);
        S.set('w' + ki, { style: 'hl' });
        var cur = root, parent = null, path = [], lines = { c: [7, 8], java: [7, 8] };
        var detailed = ki === 0;
        while (cur) {
          path.push(cur);
          if (detailed) {
            var highlighted = path.slice();
            S.set('waitlbl', {});
            (function () {
              var pos = layoutTree(root);
              tracked = syncTree(S, root, pos, tracked, function (n) {
                if (n === cur) return 'hl';
                if (highlighted.indexOf(n) >= 0) return 'active';
                return 'normal';
              });
            })();
          }
          var whileNote = T('cur != NULL? evet', 'cur != NULL? yes');
          var stepLines = { c: [{ n: 9, note: whileNote }, 10, { n: 11, note: T(key + ' == ' + cur.key + '? hayır', key + ' == ' + cur.key + '? no') }],
                             java: [{ n: 9, note: whileNote }, 10, { n: 11, note: T(key + ' == ' + cur.key + '? hayır', key + ' == ' + cur.key + '? no') }] };
          if (key === cur.key) {
            stepLines = { c: [{ n: 9, note: whileNote }, 10, { n: 11, note: T(key + ' == ' + cur.key + '? evet', key + ' == ' + cur.key + '? yes') }],
                          java: [{ n: 9, note: whileNote }, 10, { n: 11, note: T(key + ' == ' + cur.key + '? evet', key + ' == ' + cur.key + '? yes') }] };
            if (detailed) {
              var pos2 = layoutTree(root);
              tracked = syncTree(S, root, pos2, tracked, function (n) { return n === cur ? 'del' : 'normal'; });
              S.step(T('`insert(' + key + ')` — `' + key + '`, `' + cur.key + '` düğümünde zaten var: **yinelenen (duplicate)**. Ağaç değişmez, aynı `root` döner.',
                       '`insert(' + key + ')` — `' + key + '` already sits at node `' + cur.key + '`: a **duplicate**. The tree is unchanged; the same `root` is returned.'),
                     stepLines);
            }
            S.set('w' + ki, { style: 'dim' });
            return; /* forEach callback: skip to next key */
          }
          var goLeft = key < cur.key;
          var line12Note = T(key + ' < ' + cur.key + '? ' + (goLeft ? 'evet' : 'hayır'), key + ' < ' + cur.key + '? ' + (goLeft ? 'yes' : 'no'));
          if (detailed) {
            stepLines.c.push(goLeft ? { n: 12, note: line12Note } : { n: 12, skip: true }, goLeft ? { n: 13, skip: true } : 13);
            stepLines.java.push(goLeft ? { n: 12, note: line12Note } : { n: 12, skip: true }, goLeft ? { n: 13, skip: true } : 13);
            S.step(T('`insert(' + key + ')` — düğüm `' + cur.key + '`: `' + key + ' ' + (goLeft ? '<' : '>=') + ' ' + cur.key + '`, ' + (goLeft ? 'sola' : 'sağa') + ' iniyoruz.',
                     '`insert(' + key + ')` — at node `' + cur.key + '`: `' + key + ' ' + (goLeft ? '<' : '>=') + ' ' + cur.key + '`, we go ' + (goLeft ? 'left' : 'right') + '.'),
                   stepLines);
          } else {
            /* Condensed into the one-step-per-key summary below: no skip markers here, since this
               step folds together every comparison of this key's whole walk (possibly taking BOTH the
               left and the right branch at different ancestors) -- marking one of them skip:true while
               the other is plainly executed, within the SAME step, would contradict itself. Both lines
               really did run somewhere in this walk, so both are shown as executed, just not per-iteration. */
            var fastBranch = goLeft ? { n: 12, note: line12Note } : 13;
            lines.c = lines.c.concat(stepLines.c, fastBranch);
            lines.java = lines.java.concat(stepLines.java, fastBranch);
          }
          parent = cur;
          cur = goLeft ? cur.left : cur.right;
        }
        /* reached an empty spot: create the new node */
        var n = mkNode(key);
        var createLines = { c: [{ n: 9, note: T('cur != NULL? hayır', 'cur != NULL? no') }, 15, 16, 17, 18],
                             java: [{ n: 9, note: T('cur != null? hayır', 'cur != null? no') }, 15, 16, 17, 18] };
        var newRoot = parent === null;
        createLines.c.push(newRoot ? { n: 19, note: T('parent == NULL? evet', 'parent == NULL? yes') } : { n: 19, note: T('parent == NULL? hayır', 'parent == NULL? no') });
        createLines.java.push(newRoot ? { n: 19, note: T('parent == null? evet', 'parent == null? yes') } : { n: 19, note: T('parent == null? hayır', 'parent == null? no') });
        if (newRoot) {
          root = n;
        } else {
          var goLeft2 = key < parent.key;
          var line20Note = T(key + ' < ' + parent.key + '? ' + (goLeft2 ? 'evet' : 'hayır'), key + ' < ' + parent.key + '? ' + (goLeft2 ? 'yes' : 'no'));
          createLines.c.push(goLeft2 ? { n: 20, note: line20Note } : { n: 20, skip: true }, goLeft2 ? { n: 21, skip: true } : 21, 22);
          createLines.java.push(goLeft2 ? { n: 20, note: line20Note } : { n: 20, skip: true }, goLeft2 ? { n: 21, skip: true } : 21, 22);
          if (goLeft2) parent.left = n; else parent.right = n;
        }
        if (detailed) {
          var pos3 = layoutTree(root);
          tracked = syncTree(S, root, pos3, tracked, function (nn) { return nn === n ? 'new' : (path.indexOf(nn) >= 0 ? 'active' : 'normal'); });
          S.step(T('Boş bir yuvaya ulaştık (`cur == NULL`). Yeni düğüm `' + key + '` burada yaratılır' + (newRoot ? ', ağaç boştu, o yüzden yeni **kök (root)** olur.' : ' ve ebeveyni `' + parent.key + '`\'ye bağlanır.'),
                   'We reached an empty spot (`cur == NULL`). The new node `' + key + '` is created here' + (newRoot ? ', the tree was empty, so it becomes the new **root**.' : ' and linked to its parent `' + parent.key + '`.')),
                 createLines);
        } else {
          lines.c = lines.c.concat(createLines.c);
          lines.java = lines.java.concat(createLines.java);
          var pos4 = layoutTree(root);
          tracked = syncTree(S, root, pos4, tracked, function (nn) { return nn === n ? 'new' : 'normal'; });
          S.step(T('`insert(' + key + ')` — ' + (path.length ? path.map(function (p) { return p.key; }).join(' -> ') + ' yolundan sonra ' : '') + 'yeni yaprak olarak eklendi.',
                   '`insert(' + key + ')` — inserted as a new leaf' + (path.length ? ' after the path ' + path.map(function (p) { return p.key; }).join(' -> ') : '') + '.'),
                 lines);
        }
        S.set('w' + ki, { style: 'dim' });
      });

      S.at(null);
      var finalPos = layoutTree(root);
      tracked = syncTree(S, root, finalPos, tracked, function () { return 'normal'; });
      S.result = toStruct(root);
      S.step(T('Bitti: ' + d.keys.length + ' anahtar işlendi. Her ekleme, ağacın **yüksekliği (height)** kadar karşılaştırma yapar — dengeli bir ağaçta bu `O(log n)`, ama sıra kötü olursa (bak: bst-degenerate) `O(n)`\'e kadar çıkabilir.',
               'Done: ' + d.keys.length + ' keys processed. Every insertion makes as many comparisons as the tree\'s **height** — `O(log n)` in a balanced tree, but it can rise to `O(n)` for an unlucky order (see: bst-degenerate).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
