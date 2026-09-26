/* Week 4 — tree vocabulary: root, parent, child, sibling, leaf/internal, edges, depth, height, degree, subtree.
 * A GENERAL rooted tree (any number of children per node, not just binary), given as a parent list
 * "LABEL:PARENT ..." with the root marked "LABEL:-". */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_CHILDREN 8',
    '',
    'typedef struct Node {',
    '    char label[4];',
    '    struct Node *children[MAX_CHILDREN];',
    '    int child_count;      /* degree of this node */',
    '    int depth;            /* filled in by compute_depths() */',
    '} Node;',
    '',
    'int height(Node *n) {',
    '    if (n->child_count == 0)',
    '        return 0;         /* a leaf: height 0 */',
    '    int best = -1;',
    '    for (int i = 0; i < n->child_count; i++) {',
    '        int h = height(n->children[i]);',
    '        if (h > best) best = h;',
    '    }',
    '    return best + 1;      /* 1 + tallest child */',
    '}',
    '',
    'void compute_depths(Node *root) {',
    '    Node *queue[MAX_NODES];',
    '    int front = 0, rear = 0;',
    '    root->depth = 0;',
    '    queue[rear++] = root;',
    '    while (front < rear) {',
    '        Node *cur = queue[front++];',
    '        for (int i = 0; i < cur->child_count; i++) {',
    '            Node *ch = cur->children[i];',
    '            ch->depth = cur->depth + 1;',
    '            queue[rear++] = ch;',
    '        }',
    '    }',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_CHILDREN = 8;',
    '',
    'class Node {',
    '    String label;',
    '    Node[] children = new Node[MAX_CHILDREN];',
    '    int childCount;       // degree of this node',
    '    int depth;            // filled in by computeDepths()',
    '}',
    '',
    'static int height(Node n) {',
    '    if (n.childCount == 0)',
    '        return 0;         // a leaf: height 0',
    '    int best = -1;',
    '    for (int i = 0; i < n.childCount; i++) {',
    '        int h = height(n.children[i]);',
    '        if (h > best) best = h;',
    '    }',
    '    return best + 1;      // 1 + tallest child',
    '}',
    '',
    'static void computeDepths(Node root) {',
    '    Node[] queue = new Node[MAX_NODES];',
    '    int front = 0, rear = 0;',
    '    root.depth = 0;',
    '    queue[rear++] = root;',
    '    while (front < rear) {',
    '        Node cur = queue[front++];',
    '        for (int i = 0; i < cur.childCount; i++) {',
    '            Node ch = cur.children[i];',
    '            ch.depth = cur.depth + 1;',
    '            queue[rear++] = ch;',
    '        }',
    '    }',
    '}'
  ];
  var LINES_STRUCT = { c: [3, 4, 5, 6, 7, 8], java: [3, 4, 5, 6, 7, 8] };
  var LINES_CHILDREN = { c: [5], java: [5] };
  var LINES_DEGREE = { c: [6], java: [6] };
  var LINES_LEAF = { c: [10, 11, 12], java: [10, 11, 12] };
  var LINES_HEIGHT_FULL = { c: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], java: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19] };
  var LINES_DEPTH_FULL = { c: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34], java: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34] };

  /* ---- helpers local to build(); reference() does NOT call any of these (see bottom of file) ---- */
  function buildTree(nodesArr) {
    var byLabel = {};
    nodesArr.forEach(function (n) { byLabel[n.label] = { label: n.label, parent: n.parent, children: [] }; });
    var root = null;
    nodesArr.forEach(function (n) {
      if (n.parent === null) root = byLabel[n.label];
      else byLabel[n.parent].children.push(byLabel[n.label]);
    });
    return { root: root, byLabel: byLabel };
  }
  /** Post-order x (leaves get the next free column, left to right), depth * DY for y. */
  function layout(root) {
    var pos = {}, i = 0, DX = 74, DY = 96, X0 = 50, Y0 = 44;
    (function walk(n, depth) {
      if (!n.children.length) { pos[n.label] = { x: X0 + i * DX, y: Y0 + depth * DY }; i++; return; }
      n.children.forEach(function (c) { walk(c, depth + 1); });
      var xs = n.children.map(function (c) { return pos[c.label].x; });
      pos[n.label] = { x: (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, y: Y0 + depth * DY };
    })(root, 0);
    return pos;
  }
  function drawTree(S, root, pos) {
    (function walk(n) {
      S.circle('n' + n.label, { x: pos[n.label].x, y: pos[n.label].y, text: n.label, style: 'normal' });
      n.children.forEach(function (c) {
        S.arrow('e_' + n.label + '_' + c.label, { from: 'n' + n.label, to: 'n' + c.label, kind: 'center', head: false, style: 'normal' });
        walk(c);
      });
    })(root);
  }
  /** Per-node annotation slots (depth / height / degree), computed ONCE from the static layout so every label
   *  sits clear of every circle, every edge, and every OTHER label for the whole build. Preferred spot is
   *  upper-right of the node (+r in x, -r*0.6 in y, left-aligned), like any other node — but a fixed offset is
   *  not safe on a bushy or skewed tree (a tight sibling row, or a child whose parent approaches from the right
   *  instead of the left), so each node sizes its box to the widest text it will ever actually show (`maxChars`,
   *  from the real depth/height/degree values — most nodes need far less than a worst-case guess) and tries an
   *  increasingly wide ring of candidate spots, keeping the first one that is provably free. */
  function planAnnotationSlots(root, pos, maxChars) {
    var r = 22, SZ = 15, H = SZ * 1.3;
    var allNodes = [];
    (function collect(n) { allNodes.push(n); n.children.forEach(collect); })(root);
    var allEdges = [];
    allNodes.forEach(function (n) { n.children.forEach(function (c) { allEdges.push([pos[n.label], pos[c.label]]); }); });

    function rectOf(x, y, anchor, w) {
      var x0 = anchor === 'middle' ? x - w / 2 : (anchor === 'end' ? x - w : x);
      return [x0, y - SZ, w, H];
    }
    function hitsCircle(rect, cx, cy) {
      return rect[0] < cx + r && rect[0] + rect[2] > cx - r && rect[1] < cy + r && rect[1] + rect[3] > cy - r;
    }
    /** Exact segment/rectangle intersection (endpoint-in-rect, or crossing one of its 4 sides) — no sampling
     *  step to accidentally skip past a thin rectangle. */
    function pointInRect(x, y, rect) { return x >= rect[0] && x <= rect[0] + rect[2] && y >= rect[1] && y <= rect[1] + rect[3]; }
    function segSegHit(x1, y1, x2, y2, x3, y3, x4, y4) {
      var d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
      if (d === 0) return false;
      var t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
      var u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
      return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
    function hitsSeg(rect, x1, y1, x2, y2) {
      if (pointInRect(x1, y1, rect) || pointInRect(x2, y2, rect)) return true;
      var rx = rect[0], ry = rect[1], rw = rect[2], rh = rect[3];
      var corners = [[rx, ry], [rx + rw, ry], [rx + rw, ry + rh], [rx, ry + rh]];
      for (var i = 0; i < 4; i++) {
        var a = corners[i], b = corners[(i + 1) % 4];
        if (segSegHit(x1, y1, x2, y2, a[0], a[1], b[0], b[1])) return true;
      }
      return false;
    }
    function rectsOverlap(a, b) { return a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1]; }
    function isFree(rect, selfPos, placedRects) {
      for (var i = 0; i < allNodes.length; i++) {
        var np = pos[allNodes[i].label];
        if (np === selfPos) continue;
        if (hitsCircle(rect, np.x, np.y)) return false;
      }
      for (var j = 0; j < allEdges.length; j++) {
        var e = allEdges[j];
        if (hitsSeg(rect, e[0].x, e[0].y, e[1].x, e[1].y)) return false;
      }
      for (var k = 0; k < placedRects.length; k++) if (rectsOverlap(rect, placedRects[k])) return false;
      return true;
    }
    /** A ring of candidate spots around a node of radius r: near and far, on every side. A leaf has nothing
     *  below it, so a centred "below" spot (reads best, like an array cell's caption) is tried first there. */
    function candidatesFor(p, isLeaf) {
      var near = r, far = r + 20, far2 = r + 44, far3 = r + 72;
      var upR = { dx: near, dy: -near * 0.6, anchor: 'start' }, upL = { dx: -near, dy: -near * 0.6, anchor: 'end' };
      var list = isLeaf
        ? [{ dx: 0, dy: near + 16, anchor: 'middle' }, upR, upL]
        : [upR, upL, { dx: 0, dy: -near - 12, anchor: 'middle' },
           { dx: near, dy: near + 16, anchor: 'start' }, { dx: -near, dy: near + 16, anchor: 'end' }];
      [far, far2, far3].forEach(function (d) {
        list = list.concat([
          { dx: d, dy: -near * 0.6, anchor: 'start' }, { dx: -d, dy: -near * 0.6, anchor: 'end' },
          { dx: 0, dy: -d - 12, anchor: 'middle' },
          { dx: d, dy: near + 16, anchor: 'start' }, { dx: -d, dy: near + 16, anchor: 'end' },
          { dx: d, dy: 0, anchor: 'start' }, { dx: -d, dy: 0, anchor: 'end' }
        ]);
      });
      return list.map(function (o) { return { x: p.x + o.dx, y: p.y + o.dy, anchor: o.anchor }; });
    }

    var slots = {}, placedRects = [];
    allNodes.forEach(function (n) {
      var p = pos[n.label], w = Math.max(20, (maxChars[n.label] || 4) * SZ * 0.58);
      var candidates = candidatesFor(p, n.children.length === 0);
      var chosen = null, chosenRect = null;
      for (var i = 0; i < candidates.length && !chosen; i++) {
        var c = candidates[i], rect = rectOf(c.x, c.y, c.anchor, w);
        if (isFree(rect, p, placedRects)) { chosen = c; chosenRect = rect; }
      }
      /* Extremely rare last resort: climb straight up, further and further above the node, until clear. */
      var lift = 1;
      while (!chosen && lift <= 12) {
        var c2 = { x: p.x, y: p.y - r - 12 - lift * 14, anchor: 'middle' };
        var rect2 = rectOf(c2.x, c2.y, c2.anchor, w);
        if (isFree(rect2, p, placedRects)) { chosen = c2; chosenRect = rect2; }
        lift++;
      }
      if (!chosen) { chosen = candidates[0]; chosenRect = rectOf(chosen.x, chosen.y, chosen.anchor, w); }
      slots[n.label] = chosen;
      placedRects.push(chosenRect);
    });
    return slots;
  }
  function annotate(S, label, slot, text) {
    var lid = 'lab_' + label;
    if (S.has(lid)) S.set(lid, { text: text });
    else S.label(lid, { x: slot.x, y: slot.y, text: text, anchor: slot.anchor, size: 15, mono: true, style: 'dim' });
  }
  function clearAnnotate(S, label) { var lid = 'lab_' + label; if (S.has(lid)) S.remove(lid); }
  /** Recursive, bottom-up: exactly the height() shown in the code panel. */
  function computeHeights(root) {
    var height = {};
    (function rec(n) {
      if (!n.children.length) { height[n.label] = 0; return 0; }
      var best = -1;
      n.children.forEach(function (c) { var h = rec(c); if (h > best) best = h; });
      height[n.label] = best + 1;
      return best + 1;
    })(root);
    return height;
  }
  /** Breadth-first, exactly the compute_depths() shown in the code panel. */
  function bfsDepths(root) {
    var depth = {}, queue = [root], qi = 0;
    depth[root.label] = 0;
    while (qi < queue.length) {
      var cur = queue[qi++];
      cur.children.forEach(function (c) { depth[c.label] = depth[cur.label] + 1; queue.push(c); });
    }
    return depth;
  }
  function nodesByDepth(depth) {
    var byDepth = [];
    for (var label in depth) { var d = depth[label]; if (!byDepth[d]) byDepth[d] = []; byDepth[d].push(label); }
    return byDepth;
  }
  function label(i) {
    var s = '', n = i + 1;
    while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
    return s;
  }
  /** A random recursive tree: node i attaches to an earlier node; chainBias occasionally extends the
   *  most-recently-added node instead, producing uneven depths on harder levels. */
  function randomTree(r, n, chainBias) {
    var nodes = [{ label: label(0), parent: null }];
    for (var i = 1; i < n; i++) {
      var parentIdx = (chainBias && r() < chainBias) ? i - 1 : D.randInt(r, 0, i - 1);
      nodes.push({ label: label(i), parent: nodes[parentIdx].label });
    }
    return nodes;
  }

  D.define({
    id: 'tree-terminology',
    title: T('Ağaç terimleri: kök, ebeveyn, çocuk, yaprak, derinlik, yükseklik', 'Tree vocabulary: root, parent, child, leaf, depth, height'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('11 düğüm, dallı (bushy) bir ağaç', '11 nodes, a bushy tree'),
        data: { nodes: [
          { label: 'A', parent: null }, { label: 'B', parent: 'A' }, { label: 'C', parent: 'A' }, { label: 'D', parent: 'A' },
          { label: 'E', parent: 'B' }, { label: 'F', parent: 'B' }, { label: 'G', parent: 'C' }, { label: 'H', parent: 'D' },
          { label: 'I', parent: 'D' }, { label: 'J', parent: 'D' }, { label: 'K', parent: 'E' }
        ] } },
      { id: 'hard', level: 'hard', name: T('18 düğüm, düzensiz derinlikler (5. seviyeye kadar)', '18 nodes, uneven depths (down to level 5)'),
        data: { nodes: [
          { label: 'R', parent: null },
          { label: 'P1', parent: 'R' }, { label: 'P2', parent: 'P1' }, { label: 'P3', parent: 'P2' }, { label: 'P4', parent: 'P3' }, { label: 'P5', parent: 'P4' },
          { label: 'Q1', parent: 'R' }, { label: 'Q2', parent: 'R' }, { label: 'Q3', parent: 'R' },
          { label: 'S1', parent: 'Q1' }, { label: 'S2', parent: 'Q1' }, { label: 'S3', parent: 'Q2' }, { label: 'S4', parent: 'Q3' },
          { label: 'U1', parent: 'S1' }, { label: 'U2', parent: 'S3' }, { label: 'U3', parent: 'S3' },
          { label: 'V1', parent: 'U1' }, { label: 'W1', parent: 'V1' }
        ] } },
      { id: 'chain', level: 'edge', name: T('Zincir (dejenere): 10 düğüm, her biri tek çocuklu', 'A chain (degenerate): 10 nodes, each with one child'),
        data: { nodes: (function () {
          var arr = [{ label: 'R', parent: null }];
          for (var i = 1; i < 10; i++) arr.push({ label: 'C' + i, parent: i === 1 ? 'R' : 'C' + (i - 1) });
          return arr;
        })() } },
      { id: 'star', level: 'edge', name: T('Yıldız: kökün 10 çocuğu var', 'A star: the root has 10 children'),
        data: { nodes: (function () {
          var arr = [{ label: 'R', parent: null }];
          for (var i = 1; i <= 10; i++) arr.push({ label: 'L' + i, parent: 'R' });
          return arr;
        })() } },
      { id: 'single', level: 'edge', name: T('Tek düğüm', 'A single node'), data: { nodes: [{ label: 'R', parent: null }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of nodes in the tree. */
    size: function (d) { return d.nodes.length; },
    /** Independent computation, checked against S.result by test.js: walks the flat parent list only --
     *  depth by walking parent links upward from each node, height as the max depth among a node's own
     *  descendants (found by walking every OTHER node's parent chain back up to see if it passes through
     *  it) — a completely different technique from build()'s tree-object recursion / BFS. */
    reference: function (d) {
      var nodes = d.nodes, byLabel = {};
      nodes.forEach(function (n) { byLabel[n.label] = n; });
      var root = null, childCount = {};
      nodes.forEach(function (n) { childCount[n.label] = 0; });
      nodes.forEach(function (n) { if (n.parent === null) root = n.label; else childCount[n.parent]++; });
      var leaves = [], internal = [];
      nodes.forEach(function (n) { (childCount[n.label] === 0 ? leaves : internal).push(n.label); });
      leaves.sort(); internal.sort();
      var depth = {};
      nodes.forEach(function (n) {
        var dd = 0, cur = n.label;
        while (byLabel[cur].parent !== null) { dd++; cur = byLabel[cur].parent; }
        depth[n.label] = dd;
      });
      var heightOf = {};
      nodes.forEach(function (n) {
        var maxDescDepth = depth[n.label];
        nodes.forEach(function (m) {
          var cur = m.label, isDesc = false;
          while (cur !== null) { if (cur === n.label) { isDesc = true; break; } cur = byLabel[cur].parent; }
          if (isDesc) maxDescDepth = Math.max(maxDescDepth, depth[m.label]);
        });
        heightOf[n.label] = maxDescDepth - depth[n.label];
      });
      var maxDegree = 0;
      nodes.forEach(function (n) { maxDegree = Math.max(maxDegree, childCount[n.label]); });
      return { root: root, leaves: leaves, internal: internal, edges: nodes.length - 1, height: heightOf[root], depth: depth, heightOf: heightOf, degree: maxDegree };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 18, extreme: 24 }[level] || 12;
      var chainBias = { easy: 0, normal: 0.1, hard: 0.35, extreme: 0.25 }[level] || 0;
      return { nodes: randomTree(r, n, chainBias) };
    },
    input: {
      hint: T('Örnek: A:- B:A C:A D:A E:B F:B   (ETİKET:EBEVEYN; kök için ETİKET:-; etiket 1-3 karakter)',
              'Example: A:- B:A C:A D:A E:B F:B   (LABEL:PARENT; LABEL:- for the root; label 1-3 characters)'),
      parse: function (text) {
        var s = String(text).trim();
        if (!s) throw T('Metin boş: en az bir düğüm yazın (örn. "A:-").', 'The text is empty: write at least one node (e.g. "A:-").');
        var toks = s.split(/\s+/).filter(Boolean);
        var nodes = [], seen = {}, rootCount = 0;
        for (var i = 0; i < toks.length; i++) {
          var tok = toks[i];
          var m = /^([A-Za-z0-9]{1,3}):(-|[A-Za-z0-9]{1,3})$/.exec(tok);
          if (!m) throw T('"' + tok + '" anlaşılmadı: "ETİKET:EBEVEYN" ya da "ETİKET:-" biçiminde yazın (etiket 1-3 karakter).',
                           '"' + tok + '" is not understood: write "LABEL:PARENT" or "LABEL:-" (label 1-3 characters).');
          var lbl = m[1], parent = m[2] === '-' ? null : m[2];
          if (seen[lbl]) throw T('"' + lbl + '" etiketi birden fazla kez kullanılmış.', 'Label "' + lbl + '" is used more than once.');
          seen[lbl] = true;
          if (parent === null) rootCount++;
          nodes.push({ label: lbl, parent: parent });
        }
        if (rootCount === 0) throw T('Kök işaretlenmemiş: tam olarak bir düğüm ":-" ile işaretlenmeli.', 'No root marked: exactly one node must be marked ":-".');
        if (rootCount > 1) throw T('Birden fazla kök işaretlenmiş: tam olarak bir düğüm ":-" olmalı.', 'More than one root marked: exactly one node must be ":-".');
        var byLabel = {};
        nodes.forEach(function (n) { byLabel[n.label] = n; });
        nodes.forEach(function (n) {
          if (n.parent !== null && !byLabel[n.parent]) throw T('"' + n.label + '" düğümünün ebeveyni "' + n.parent + '" tanımlı değil.',
                                                                'Node "' + n.label + '" has parent "' + n.parent + '" which is not defined.');
        });
        nodes.forEach(function (n) {
          var cur = n.label, steps = 0;
          while (byLabel[cur].parent !== null) {
            cur = byLabel[cur].parent;
            steps++;
            if (steps > nodes.length) throw T('Ebeveyn zincirinde bir döngü var ("' + n.label + '" köke ulaşamıyor).',
                                               'There is a cycle in the parent chain ("' + n.label + '" cannot reach the root).');
          }
        });
        return { nodes: nodes };
      },
      format: function (d) { return d.nodes.map(function (n) { return n.label + ':' + (n.parent === null ? '-' : n.parent); }).join(' '); },
      bad: ['', 'A:- B:-', 'A:B B:A', 'A:- B:C C:B', 'A:- B:Z', 'A:- B:A B:A']
    },
    build: function (S, d) {
      var tree = buildTree(d.nodes), root = tree.root;
      var pos = layout(root);
      /* Depth, height and degree are needed for the per-node annotation slots below (so each slot is sized to
       * the widest text it will actually show) and are reused later when those steps run. */
      var depthMap = bfsDepths(root), heightMap = computeHeights(root);
      var degreeMap = {}, maxDegree = 0;
      d.nodes.forEach(function (n) { var deg = tree.byLabel[n.label].children.length; degreeMap[n.label] = deg; maxDegree = Math.max(maxDegree, deg); });
      var maxChars = {};
      d.nodes.forEach(function (n) {
        maxChars[n.label] = Math.max(('d=' + depthMap[n.label]).length, ('h=' + heightMap[n.label]).length, ('deg ' + degreeMap[n.label]).length);
      });
      var slots = planAnnotationSlots(root, pos, maxChars);
      drawTree(S, root, pos);
      (function levelLabels() {
        var byD = nodesByDepth(depthMap);
        for (var dd = 0; dd < byD.length; dd++) {
          if (!byD[dd] || !byD[dd].length) continue;
          var minX = Math.min.apply(null, byD[dd].map(function (l) { return pos[l].x; }));
          var y = pos[byD[dd][0]].y;
          S.label('dlvl' + dd, { x: minX - 44, y: y + 5, text: 'd=' + dd, anchor: 'end', size: 14, mono: true, style: 'dim' });
        }
      })();

      S.step(T('Bu genel bir KÖKLÜ AĞAÇ (rooted tree): ikili ağaçtan farklı olarak bir düğümün istediği kadar çocuğu olabilir. `children` dizisi her düğümün çocuklarına işaret eder.',
               'This is a general ROOTED TREE: unlike a binary tree, a node may have any number of children. The `children` array points to each node\'s own children.'), LINES_STRUCT);

      S.set('n' + root.label, { style: 'hl' });
      S.step(T('KÖK (root): ebeveyni olmayan tek düğüm — burada `' + root.label + '`. Her ağacın tam olarak bir kökü vardır ve dolaşma ondan başlar.',
               'The ROOT: the one node with no parent — here `' + root.label + '`. Every tree has exactly one root, and traversal starts there.'));
      S.set('n' + root.label, { style: 'normal' });

      /* parent / child — pick a node with children if one exists besides a trivial single-node tree */
      var demo = null;
      (function findDemo(n) { if (demo) return; if (n !== root && n.children.length) { demo = n; return; } n.children.forEach(findDemo); })(root);
      if (!demo) demo = root;
      S.set('n' + demo.label, { style: 'hl' });
      var kidLabels = demo.children.map(function (c) { return c.label; });
      if (demo.children.length) demo.children.forEach(function (c) { S.set('n' + c.label, { style: 'new' }); });
      if (demo !== root) S.set('e_' + demo.parent + '_' + demo.label, { style: 'active' });
      S.step(demo.children.length
        ? T('EBEVEYN (parent) / ÇOCUK (child): `' + demo.label + '`' + (demo !== root ? ' düğümünün ebeveyni `' + demo.parent + '`,' : ' köktür, ebeveyni yok,') + ' çocukları ise ' + kidLabels.join(', ') + '.',
            'PARENT / CHILD: `' + demo.label + '`' + (demo !== root ? '\'s parent is `' + demo.parent + '`,' : ' is the root, so it has no parent,') + ' and its children are ' + kidLabels.join(', ') + '.')
        : T('`' + demo.label + '` bir yaprak: çocuğu yok. Bu küçük ağaçta çocuklu bir düğüm göstermek için başka bir örneğe bakmak gerekir.',
            '`' + demo.label + '` is a leaf: it has no children. This tiny tree has no other node to demonstrate one with.'), LINES_CHILDREN);
      demo.children.forEach(function (c) { S.set('n' + c.label, { style: 'normal' }); });
      if (demo !== root) S.set('e_' + demo.parent + '_' + demo.label, { style: 'normal' });

      /* siblings — the other children of demo's parent */
      var siblings = [];
      if (demo !== root) { siblings = tree.byLabel[demo.parent].children.map(function (c) { return c.label; }).filter(function (l) { return l !== demo.label; }); }
      siblings.forEach(function (l) { S.set('n' + l, { style: 'active' }); });
      S.step(siblings.length
        ? T('KARDEŞ (sibling): `' + demo.label + '` ile aynı ebeveyni paylaşan düğümler: ' + siblings.join(', ') + '.',
            'SIBLINGS: nodes that share the same parent as `' + demo.label + '`: ' + siblings.join(', ') + '.')
        : (demo === root
          ? T('Kökün kardeşi olamaz: tek köktür, ebeveyni yok.', 'The root has no siblings: it is the only root, with no parent.')
          : T('`' + demo.label + '` tek çocuk: kardeşi yok.', '`' + demo.label + '` is an only child: it has no siblings.')));
      S.set('n' + demo.label, { style: 'normal' });
      siblings.forEach(function (l) { S.set('n' + l, { style: 'normal' }); });

      /* leaves vs internal */
      var leaves = [], internal = [];
      d.nodes.forEach(function (n) { (tree.byLabel[n.label].children.length === 0 ? leaves : internal).push(n.label); });
      leaves.sort(); internal.sort();
      leaves.forEach(function (l) { S.set('n' + l, { style: 'new' }); });
      internal.forEach(function (l) { S.set('n' + l, { style: 'active' }); });
      S.step(T('YAPRAK (leaf, yeşil): çocuğu olmayan düğüm — `child_count == 0`. İÇ DÜĞÜM (internal, mavi): en az bir çocuğu olan düğüm. Yapraklar: ' + leaves.join(', ') + '. İç düğümler: ' + internal.join(', ') + '.',
               'A LEAF (green) has no children — `child_count == 0`. An INTERNAL node (blue) has at least one child. Leaves: ' + leaves.join(', ') + '. Internal: ' + internal.join(', ') + '.'), LINES_LEAF);
      d.nodes.forEach(function (n) { S.set('n' + n.label, { style: 'normal' }); });

      /* edges = n - 1 */
      var edges = d.nodes.length - 1;
      d.nodes.forEach(function (n) { if (n.parent !== null) S.set('e_' + n.parent + '_' + n.label, { style: 'hl' }); });
      S.step(T('KENAR (edge) sayısı: her düğümün (kök hariç) tam olarak bir ebeveyne giden bir kenarı vardır, o yüzden bir ağaçta her zaman (düğüm sayısı - 1) = ' + edges + ' kenar vardır.',
               'Number of EDGES: every node except the root has exactly one edge to its parent, so a tree always has (node count - 1) = ' + edges + ' edges.'), LINES_DEGREE);
      d.nodes.forEach(function (n) { if (n.parent !== null) S.set('e_' + n.parent + '_' + n.label, { style: 'normal' }); });

      /* depth, level by level (BFS) */
      var byDepth = nodesByDepth(depthMap), maxDepth = byDepth.length - 1;
      for (var dd = 0; dd <= maxDepth; dd++) {
        byDepth[dd].forEach(function (l) { S.set('n' + l, { style: 'hl' }); annotate(S, l, slots[l], 'd=' + dd); });
        S.step(dd === 0
          ? T('DERİNLİK (depth) 0: kökün derinliği her zaman 0\'dır (`' + byDepth[0][0] + '`).',
              'DEPTH 0: the root\'s depth is always 0 (`' + byDepth[0][0] + '`).')
          : T('Derinlik ' + dd + ': köke ' + dd + ' kenar uzaklıktaki düğümler (bir üst seviyenin derinliği + 1): ' + byDepth[dd].join(', ') + '.',
              'Depth ' + dd + ': the nodes ' + dd + ' edges away from the root (parent\'s depth + 1): ' + byDepth[dd].join(', ') + '.'), LINES_DEPTH_FULL);
      }
      /* Clear the "d=" depth tags before HEIGHT starts, so a number on screen always means only one thing
       * (otherwise B's leftover "d=1" next to E's new "h=1" reads as two different quantities with the same
       * value, which is confusing the first time students see both). */
      d.nodes.forEach(function (n) { S.set('n' + n.label, { style: 'normal' }); clearAnnotate(S, n.label); });

      /* height, bottom-up (leaves = 0) — shown level by level, deepest level first */
      for (var dd2 = maxDepth; dd2 >= 0; dd2--) {
        byDepth[dd2].forEach(function (l) { S.set('n' + l, { style: 'active' }); annotate(S, l, slots[l], 'h=' + heightMap[l]); });
        var pairs = byDepth[dd2].map(function (l) { return l + '=' + heightMap[l]; }).join(', ');
        S.step(dd2 === maxDepth
          ? T('YÜKSEKLİK (height), en alttan başlıyoruz: yapraklar yükseklik 0 alır: ' + pairs + '.',
              'HEIGHT, starting from the bottom: leaves get height 0: ' + pairs + '.')
          : T('Yükseklik ' + dd2 + '. seviyede: her düğümün yüksekliği = 1 + (çocuklarının en büyük yüksekliği): ' + pairs + '.',
              'Height at level ' + dd2 + ': each node\'s height = 1 + (the tallest of its children): ' + pairs + '.'), LINES_HEIGHT_FULL);
      }
      d.nodes.forEach(function (n) { S.set('n' + n.label, { style: 'normal' }); });

      var height = heightMap[root.label];
      S.set('n' + root.label, { style: 'hl' });
      annotate(S, root.label, slots[root.label], 'h=' + height);
      S.step(T('AĞACIN YÜKSEKLİĞİ = kökün yüksekliği = ' + height + '. (Eşdeğer olarak: en derin yaprağın derinliği.)',
               'The HEIGHT OF THE TREE = the height of the root = ' + height + '. (Equivalently: the depth of the deepest leaf.)'), LINES_HEIGHT_FULL);
      S.set('n' + root.label, { style: 'normal' });
      /* Clear the "h=" height tags before DEGREE starts, for the same reason: one number, one meaning. */
      d.nodes.forEach(function (n) { clearAnnotate(S, n.label); });

      /* degree of each node, and of the tree */
      d.nodes.forEach(function (n) { annotate(S, n.label, slots[n.label], 'deg ' + degreeMap[n.label]); });
      S.step(T('DERECE (degree): bir düğümün derecesi = çocuk sayısı (`child_count`). Ağacın derecesi = en büyük düğüm derecesi = ' + maxDegree + '.',
               'DEGREE: a node\'s degree = its number of children (`child_count`). The tree\'s degree = the largest node degree = ' + maxDegree + '.'), LINES_DEGREE);
      d.nodes.forEach(function (n) { clearAnnotate(S, n.label); });

      /* one subtree, framed */
      var subtreeRoot = null;
      (function findSub(n) { if (subtreeRoot) return; if (n !== root && n.children.length) subtreeRoot = n; n.children.forEach(findSub); })(root);
      if (!subtreeRoot) subtreeRoot = root.children.length ? root.children[0] : root;
      var members = [];
      (function collect(n) { members.push(n.label); n.children.forEach(collect); })(subtreeRoot);
      var xs = members.map(function (l) { return pos[l].x; }), ys = members.map(function (l) { return pos[l].y; });
      var pad = 30;
      S.region('sub', { x: Math.min.apply(null, xs) - pad, y: Math.min.apply(null, ys) - pad, w: Math.max.apply(null, xs) - Math.min.apply(null, xs) + 2 * pad, h: Math.max.apply(null, ys) - Math.min.apply(null, ys) + 2 * pad, title: T('altağaç (subtree): ' + subtreeRoot.label, 'subtree: ' + subtreeRoot.label) });
      members.forEach(function (l) { S.set('n' + l, { style: 'hl' }); });
      S.step((subtreeRoot === root
        ? T('ALTAĞAÇ (subtree): bir düğüm ve onun altındaki her şey. Kökün kendisinin altağacı, ağacın tamamıdır.',
            'A SUBTREE: a node together with everything below it. The root\'s own subtree is the whole tree.')
        : T('ALTAĞAÇ (subtree): `' + subtreeRoot.label + '` düğümü ve onun altındaki her şey (' + members.join(', ') + '), kesikli çerçeve içinde.',
            'A SUBTREE: node `' + subtreeRoot.label + '` together with everything below it (' + members.join(', ') + '), framed in dashes.')), LINES_CHILDREN);

      var leavesR = leaves, internalR = internal;
      S.result = { root: root.label, leaves: leavesR, internal: internalR, edges: edges, height: height,
        depth: (function () { var o = {}; d.nodes.forEach(function (n) { o[n.label] = depthMap[n.label]; }); return o; })(),
        heightOf: (function () { var o = {}; d.nodes.forEach(function (n) { o[n.label] = heightMap[n.label]; }); return o; })(),
        degree: maxDegree };
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
