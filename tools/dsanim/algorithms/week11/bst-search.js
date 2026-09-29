/* Week 11 — binary search tree (BST): search. Builds the tree from `keys` (fast — see bst-insert.js for the
 * step-by-step insertion), then searches for each value in `finds`, one comparison at a time: first search
 * detailed, later ones shown as one step each. A miss ends with a dashed "would go here" marker.
 * Data: {keys: [...], finds: [...]}. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'int probes;',
    '',
    'int bst_search(Node *root, int key) {',
    '    Node *cur = root;',
    '    probes = 0;',
    '    while (cur != NULL) {',
    '        probes++;',
    '        if (key == cur->key) return 1;',
    '        if (key < cur->key) cur = cur->left;',
    '        else                cur = cur->right;',
    '    }',
    '    return 0;',
    '}'
  ];
  var JAVA = [
    'static int probes;',
    '',
    'static boolean bstSearch(Node root, int key) {',
    '    Node cur = root;',
    '    probes = 0;',
    '    while (cur != null) {',
    '        probes++;',
    '        if (key == cur.key) return true;',
    '        if (key < cur.key) cur = cur.left;',
    '        else                cur = cur.right;',
    '    }',
    '    return false;',
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

  D.define({
    id: 'bst-search',
    title: T('İkili arama ağacı: arama (search)', 'Binary search tree: search'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 anahtar, 3 bulunan + 2 bulunmayan arama', '10 keys, 3 hits and 2 misses'),
        data: { keys: [50, 30, 70, 20, 40, 60, 80, 35, 65, 90], finds: [65, 20, 90, 55, 100] } },
      { id: 'hard', level: 'hard', name: T('14 anahtar, negatif değerler, 5 arama', '14 keys with negative values, 5 searches'),
        data: { keys: [10, -5, 25, 40, -20, 5, 17, 30, 45, 3, 22, -15, 12, 60], finds: [-20, 60, 0, -5, 99] } },
      { id: 'edge-boundaries', level: 'edge', name: T('Uç durum: en küçükten küçük ve en büyükten büyük arama', 'Edge case: searching below the minimum and above the maximum'),
        data: { keys: [50, 30, 70, 20, 40, 60, 80, 10, 45, 90], finds: [-1000, 1000, 50] } },
      { id: 'edge-worst-path', level: 'edge', name: T('Uç durum: artan sıra ile eklenmiş zincirde son anahtarı arama (O(n))', 'Edge case: searching for the last key in a chain built from ascending inserts (O(n))'),
        data: { keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], finds: [10, 1, 11] } },
      { id: 'edge-single', level: 'edge', name: T('Uç durum: tek düğüm, kökü ve olmayan bir değeri ara', 'Edge case: a single node, search the root and a missing value'),
        data: { keys: [7], finds: [7, 3] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      function build(node, key) { if (!node) return { k: key, l: null, r: null }; if (key === node.k) return node; if (key < node.k) node.l = build(node.l, key); else node.r = build(node.r, key); return node; }
      var root = null;
      d.keys.forEach(function (k) { root = build(root, k); });
      function find(node, key, p) { if (!node) return { found: false, probes: p }; p++; if (key === node.k) return { found: true, probes: p }; return key < node.k ? find(node.l, key, p) : find(node.r, key, p); }
      return d.finds.map(function (q) { return find(root, q, 0); });
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level];
      var lo = level === 'extreme' ? -500 : (level === 'hard' ? -99 : 1);
      var hi = level === 'extreme' ? 500 : (level === 'hard' ? 199 : 99);
      var keys = [];
      for (var i = 0; i < n; i++) keys.push(D.randInt(r, lo, hi));
      var finds = [];
      for (var j = 0; j < 4; j++) finds.push(r() < 0.5 && keys.length ? keys[D.randInt(r, 0, keys.length - 1)] : D.randInt(r, lo, hi));
      return { keys: keys, finds: finds };
    },
    input: {
      hint: T('Örnek: keys=50,30,70,20,40 finds=40,99', 'Example: keys=50,30,70,20,40 finds=40,99'),
      parse: function (text) {
        var m = /^\s*keys=([^\s]+)\s+finds=([^\s]+)\s*$/i.exec(String(text));
        if (!m) throw T('Biçim: keys=... finds=...', 'Format: keys=... finds=...');
        function nums(s, label) {
          var toks = s.split(',').filter(Boolean);
          if (!toks.length) throw T(label + ' en az bir değer içermeli.', label + ' needs at least one value.');
          return toks.map(function (t) { if (!/^-?\d+$/.test(t)) throw T('"' + t + '" bir tamsayı değil.', '"' + t + '" is not an integer.'); return parseInt(t, 10); });
        }
        return { keys: nums(m[1], 'keys'), finds: nums(m[2], 'finds') };
      },
      format: function (d) { return 'keys=' + d.keys.join(',') + ' finds=' + d.finds.join(','); },
      bad: ['', 'keys=5,x finds=5', 'keys=5,7', 'finds=5 keys=5,7']
    },
    build: function (S, d) {
      var nid = { v: 0 }, root = null, tracked = {};
      d.keys.forEach(function (k) { root = ins(root, k, nid); });
      var pos = layoutTree(root);
      tracked = syncTree(S, root, pos, tracked, function () { return 'normal'; });
      S.step(T('`keys` içindeki ' + d.keys.length + ' anahtarı sırayla ekleyerek bu ikili arama ağacını (BST) kurduk (bkz: bst-insert). Şimdi `finds` içindeki değerleri arayacağız.',
               'We built this binary search tree (BST) by inserting the ' + d.keys.length + ' keys of `keys` in order (see: bst-insert). Now we search for the values in `finds`.'),
             { c: [1], java: [1] });

      d.finds.forEach(function (target, qi) {
        var cur = root, probes = 0, path = [], lines = { c: [3, 4, 5], java: [3, 4, 5] };
        var detailed = qi === 0;
        var found = false, lastVisited = null, wentLeft = null;
        while (cur) {
          probes++;
          path.push(cur);
          lastVisited = cur;
          var eq = target === cur.key;
          var searchWhileNote = T('cur != NULL? evet', 'cur != NULL? yes');
          var stepLines = { c: [{ n: 6, note: searchWhileNote }, 7, { n: 8, note: T(target + ' == ' + cur.key + '? ' + (eq ? 'evet' : 'hayır'), target + ' == ' + cur.key + '? ' + (eq ? 'yes' : 'no')) }],
                             java: [{ n: 6, note: searchWhileNote }, 7, { n: 8, note: T(target + ' == ' + cur.key + '? ' + (eq ? 'evet' : 'hayır'), target + ' == ' + cur.key + '? ' + (eq ? 'yes' : 'no')) }] };
          if (eq) {
            found = true;
            if (detailed) {
              tracked = syncTree(S, root, pos, tracked, function (n) { return n === cur ? 'new' : (path.indexOf(n) >= 0 ? 'active' : 'normal'); });
              S.step(T('`search(' + target + ')` — düğüm `' + cur.key + '`: eşleşti! `probes = ' + probes + '`.', '`search(' + target + ')` — node `' + cur.key + '`: match! `probes = ' + probes + '`.'), stepLines);
            } else { lines.c = lines.c.concat(stepLines.c, 12); lines.java = lines.java.concat(stepLines.java, 12); }
            break;
          }
          wentLeft = target < cur.key;
          var line9Note = T(target + ' < ' + cur.key + '? ' + (wentLeft ? 'evet' : 'hayır'), target + ' < ' + cur.key + '? ' + (wentLeft ? 'yes' : 'no'));
          if (detailed) {
            stepLines.c.push(wentLeft ? { n: 9, note: line9Note } : { n: 9, skip: true }, wentLeft ? { n: 10, skip: true } : 10);
            stepLines.java.push(wentLeft ? { n: 9, note: line9Note } : { n: 9, skip: true }, wentLeft ? { n: 10, skip: true } : 10);
            tracked = syncTree(S, root, pos, tracked, function (n) { return n === cur ? 'hl' : (path.indexOf(n) >= 0 ? 'active' : 'normal'); });
            S.step(T('`search(' + target + ')` — düğüm `' + cur.key + '`: `' + target + ' ' + (wentLeft ? '<' : '>') + ' ' + cur.key + '`, ' + (wentLeft ? 'sola' : 'sağa') + ' iniyoruz.',
                     '`search(' + target + ')` — node `' + cur.key + '`: `' + target + ' ' + (wentLeft ? '<' : '>') + ' ' + cur.key + '`, we go ' + (wentLeft ? 'left' : 'right') + '.'), stepLines);
          } else {
            /* Condensed multi-comparison summary: no skip markers -- this one step folds together every
               comparison of this search, which may take BOTH branches at different ancestors. */
            var fastBranch = wentLeft ? { n: 9, note: line9Note } : 10;
            lines.c = lines.c.concat(stepLines.c, fastBranch); lines.java = lines.java.concat(stepLines.java, fastBranch);
          }
          cur = wentLeft ? cur.left : cur.right;
        }
        if (!found) {
          var glabel = 'g' + qi, gx, gy;
          if (!lastVisited) { gx = X0; gy = Y0; } else { gx = pos[lastVisited.nid].x + (wentLeft ? -30 : 30); gy = pos[lastVisited.nid].y + 55; }
          S.circle(glabel, { x: gx, y: gy, r: 18, text: '?', style: 'empty' });
          var missLines = { c: [{ n: 6, note: T('cur != NULL? hayır', 'cur != NULL? no') }, 12], java: [{ n: 6, note: T('cur != null? hayır', 'cur != null? no') }, 12] };
          if (detailed) {
            S.step(T('`search(' + target + ')` — boş bir yuvaya (`NULL`) ulaştık: **bulunamadı**. `' + target + '` olsaydı tam burada olurdu (kesikli daire). `probes = ' + probes + '`.',
                     '`search(' + target + ')` — we reached an empty spot (`NULL`): **not found**. If `' + target + '` were here, it would sit right at the dashed circle. `probes = ' + probes + '`.'), missLines);
          } else {
            lines.c = lines.c.concat(missLines.c); lines.java = lines.java.concat(missLines.java);
            S.step(T('`search(' + target + ')` — ' + probes + ' karşılaştırmadan sonra bulunamadı (kesikli daire nerede olacağını gösterir).',
                     '`search(' + target + ')` — not found after ' + probes + ' comparisons (the dashed circle shows where it would go).'), lines);
          }
        } else if (!detailed) {
          S.step(T('`search(' + target + ')` — ' + probes + ' karşılaştırmada bulundu.', '`search(' + target + ')` — found in ' + probes + ' comparisons.'), lines);
        }
        tracked = syncTree(S, root, pos, tracked, function () { return 'normal'; });
      });
      (function () {
        function find(node, key, p) { if (!node) return { found: false, probes: p }; p++; if (key === node.key) return { found: true, probes: p }; return key < node.key ? find(node.left, key, p) : find(node.right, key, p); }
        S.result = d.finds.map(function (q) { return find(root, q, 0); });
      })();
      S.step(T('Bitti: ' + d.finds.length + ' arama tamamlandı. Her arama en fazla ağacın yüksekliği kadar karşılaştırma yapar.',
               'Done: ' + d.finds.length + ' searches completed. Every search makes at most as many comparisons as the tree\'s height.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
