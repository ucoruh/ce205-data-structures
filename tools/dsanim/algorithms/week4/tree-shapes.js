/* Week 4 — binary tree shapes: full, complete, perfect, degenerate, height-balanced. Same level-order-with-gaps
 * array input as level-order-traversal.js / complete-tree-array.js: index i's children live at 2i+1 and 2i+2. */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '/* full: every node has 0 or 2 children (never exactly 1) */',
    'bool is_full(Node *n) {',
    '    if (n == NULL) return true;',
    '    bool hasL = n->left != NULL, hasR = n->right != NULL;',
    '    if (hasL != hasR) return false;       /* exactly one child: not full */',
    '    return is_full(n->left) && is_full(n->right);',
    '}',
    '',
    '/* complete: walking level by level, once a NULL is seen no real node may follow it */',
    'bool is_complete(Node *root) {',
    '    Node *queue[MAX_NODES]; int front = 0, rear = 0;',
    '    queue[rear++] = root;',
    '    bool seenGap = false;',
    '    while (front < rear) {',
    '        Node *n = queue[front++];',
    '        if (n == NULL) { seenGap = true; continue; }',
    '        if (seenGap) return false;         /* a real node after a gap */',
    '        queue[rear++] = n->left;',
    '        queue[rear++] = n->right;',
    '    }',
    '    return true;',
    '}',
    '',
    '/* perfect: full AND every leaf on the same level */',
    'bool is_perfect(Node *n, int depth, int *leafDepth) {',
    '    if (n == NULL) return true;',
    '    if (n->left == NULL && n->right == NULL) {',
    '        if (*leafDepth == -1) *leafDepth = depth;',
    '        return depth == *leafDepth;',
    '    }',
    '    if (n->left == NULL || n->right == NULL) return false;   /* not full */',
    '    return is_perfect(n->left, depth + 1, leafDepth) && is_perfect(n->right, depth + 1, leafDepth);',
    '}',
    '',
    '/* degenerate: no node has two children (every node has 0 or 1) */',
    'bool is_degenerate(Node *n) {',
    '    if (n == NULL) return true;',
    '    if (n->left != NULL && n->right != NULL) return false;   /* two children: not degenerate */',
    '    return is_degenerate(n->left) && is_degenerate(n->right);',
    '}',
    '',
    '/* balanced: |height(left) - height(right)| <= 1 at every node; -1 means "unbalanced already found" */',
    'int check_balance(Node *n) {',
    '    if (n == NULL) return 0;',
    '    int hl = check_balance(n->left);',
    '    if (hl == -1) return -1;',
    '    int hr = check_balance(n->right);',
    '    if (hr == -1) return -1;',
    '    if (abs(hl - hr) > 1) return -1;      /* found an unbalanced node */',
    '    return 1 + (hl > hr ? hl : hr);',
    '}'
  ];
  var JAVA_CODE = [
    '// full: every node has 0 or 2 children (never exactly 1)',
    'static boolean isFull(Node n) {',
    '    if (n == null) return true;',
    '    boolean hasL = n.left != null, hasR = n.right != null;',
    '    if (hasL != hasR) return false;        // exactly one child: not full',
    '    return isFull(n.left) && isFull(n.right);',
    '}',
    '',
    '// complete: walking level by level, once a null is seen no real node may follow it',
    'static boolean isComplete(Node root) {',
    '    Node[] queue = new Node[MAX_NODES]; int front = 0, rear = 0;',
    '    queue[rear++] = root;',
    '    boolean seenGap = false;',
    '    while (front < rear) {',
    '        Node n = queue[front++];',
    '        if (n == null) { seenGap = true; continue; }',
    '        if (seenGap) return false;          // a real node after a gap',
    '        queue[rear++] = n.left;',
    '        queue[rear++] = n.right;',
    '    }',
    '    return true;',
    '}',
    '',
    '// perfect: full AND every leaf on the same level',
    'static boolean isPerfect(Node n, int depth, int[] leafDepth) {',
    '    if (n == null) return true;',
    '    if (n.left == null && n.right == null) {',
    '        if (leafDepth[0] == -1) leafDepth[0] = depth;',
    '        return depth == leafDepth[0];',
    '    }',
    '    if (n.left == null || n.right == null) return false;    // not full',
    '    return isPerfect(n.left, depth + 1, leafDepth) && isPerfect(n.right, depth + 1, leafDepth);',
    '}',
    '',
    '// degenerate: no node has two children (every node has 0 or 1)',
    'static boolean isDegenerate(Node n) {',
    '    if (n == null) return true;',
    '    if (n.left != null && n.right != null) return false;    // two children: not degenerate',
    '    return isDegenerate(n.left) && isDegenerate(n.right);',
    '}',
    '',
    '// balanced: |height(left) - height(right)| <= 1 at every node; -1 means "unbalanced already found"',
    'static int checkBalance(Node n) {',
    '    if (n == null) return 0;',
    '    int hl = checkBalance(n.left);',
    '    if (hl == -1) return -1;',
    '    int hr = checkBalance(n.right);',
    '    if (hr == -1) return -1;',
    '    if (Math.abs(hl - hr) > 1) return -1;  // found an unbalanced node',
    '    return 1 + Math.max(hl, hr);',
    '}'
  ];
  var LINES_FULL = { c: [2, 3, 4, 5, 6, 7], java: [2, 3, 4, 5, 6, 7] };
  var LINES_COMPLETE = { c: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], java: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] };
  var LINES_PERFECT = { c: [24, 25, 26, 27, 28, 29, 30, 31, 32], java: [23, 24, 25, 26, 27, 28, 29, 30, 31] };
  var LINES_DEGENERATE = { c: [35, 36, 37, 38, 39], java: [34, 35, 36, 37, 38] };
  var LINES_BALANCED = { c: [42, 43, 44, 45, 46, 47, 48, 49, 50], java: [41, 42, 43, 44, 45, 46, 47, 48, 49] };

  /* ---- helpers local to build(); reference() works only on the flat array, never calls these ---- */
  function buildTree(arr) {
    var nodes = arr.map(function (v, i) { return (v === null || v === undefined) ? null : { val: v, idx: i, left: null, right: null }; });
    nodes.forEach(function (n, i) {
      if (!n) return;
      var li = 2 * i + 1, ri = 2 * i + 2;
      n.left = li < nodes.length ? nodes[li] : null;
      n.right = ri < nodes.length ? nodes[ri] : null;
    });
    return nodes.length ? nodes[0] : null;
  }
  function layout(root) {
    var pos = {}, i = 0, DX = 58, DY = 84, X0 = 46, Y0 = 44;
    (function walk(n, depth) {
      if (!n) return;
      walk(n.left, depth + 1);
      pos[n.idx] = { x: X0 + i * DX, y: Y0 + depth * DY };
      i++;
      walk(n.right, depth + 1);
    })(root, 0);
    return pos;
  }
  function drawTree(S, root, pos) {
    (function walk(n) {
      if (!n) return;
      S.circle('n' + n.idx, { x: pos[n.idx].x, y: pos[n.idx].y, text: String(n.val), style: 'normal' });
      if (n.left) { S.arrow('e' + n.idx + '_' + n.left.idx, { from: 'n' + n.idx, to: 'n' + n.left.idx, kind: 'center', head: false, style: 'normal' }); walk(n.left); }
      if (n.right) { S.arrow('e' + n.idx + '_' + n.right.idx, { from: 'n' + n.idx, to: 'n' + n.right.idx, kind: 'center', head: false, style: 'normal' }); walk(n.right); }
    })(root);
  }
  /** Per-node annotation slots (subtree height), computed ONCE from the static layout so every label sits clear
   *  of every circle and every edge for the whole build. Preferred spot is upper-right of the node (+r in x,
   *  -r*0.6 in y, left-aligned) — but a fixed offset is not safe for a tight row of siblings or a node whose
   *  parent edge approaches from the right, so each node tries a short list of candidate spots and keeps the
   *  first one that is provably free. A leaf has nothing below it, so "below" (centred) is tried first there. */
  function planAnnotationSlots(arr, pos) {
    var r = 22, W = 58, SZ = 15, H = SZ * 1.3;
    var reals = [];
    for (var i = 0; i < arr.length; i++) if (arr[i] !== null) reals.push(i);
    var edges = [];
    reals.forEach(function (idx) {
      var li = 2 * idx + 1, ri = 2 * idx + 2;
      if (li < arr.length && arr[li] !== null) edges.push([pos[idx], pos[li]]);
      if (ri < arr.length && arr[ri] !== null) edges.push([pos[idx], pos[ri]]);
    });
    function rectOf(x, y, anchor) {
      var x0 = anchor === 'middle' ? x - W / 2 : (anchor === 'end' ? x - W : x);
      return [x0, y - SZ, W, H];
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
    function isFree(rect, selfPos, placedRects) {
      for (var i = 0; i < reals.length; i++) {
        var np = pos[reals[i]];
        if (np === selfPos) continue;
        if (hitsCircle(rect, np.x, np.y)) return false;
      }
      for (var j = 0; j < edges.length; j++) {
        var e = edges[j];
        if (hitsSeg(rect, e[0].x, e[0].y, e[1].x, e[1].y)) return false;
      }
      for (var k = 0; k < placedRects.length; k++) {
        var pr = placedRects[k];
        if (rect[0] < pr[0] + pr[2] && rect[0] + rect[2] > pr[0] && rect[1] < pr[1] + pr[3] && rect[1] + rect[3] > pr[1]) return false;
      }
      return true;
    }
    var slots = {}, placedRects = [];
    reals.forEach(function (idx) {
      var p = pos[idx], li = 2 * idx + 1, ri = 2 * idx + 2;
      var isLeaf = !(li < arr.length && arr[li] !== null) && !(ri < arr.length && arr[ri] !== null);
      /* Also checked against every OTHER node's already-picked slot, so two annotations can never collide even
       * when every node in the tree is labelled at the same time (the balanced-height steps label every node). */
      var candidates = isLeaf
        ? [{ x: p.x, y: p.y + r + 16, anchor: 'middle' },
           { x: p.x + r, y: p.y - r * 0.6, anchor: 'start' }, { x: p.x - r, y: p.y - r * 0.6, anchor: 'end' }]
        : [{ x: p.x + r, y: p.y - r * 0.6, anchor: 'start' }, { x: p.x - r, y: p.y - r * 0.6, anchor: 'end' },
           { x: p.x, y: p.y - r - 12, anchor: 'middle' },
           { x: p.x + r, y: p.y + r + 16, anchor: 'start' }, { x: p.x - r, y: p.y + r + 16, anchor: 'end' }];
      var chosen = null, chosenRect = null;
      for (var i = 0; i < candidates.length && !chosen; i++) {
        var c = candidates[i], rect = rectOf(c.x, c.y, c.anchor);
        if (isFree(rect, p, placedRects)) { chosen = c; chosenRect = rect; }
      }
      if (!chosen) { chosen = candidates[0]; chosenRect = rectOf(chosen.x, chosen.y, chosen.anchor); }
      slots[idx] = chosen;
      placedRects.push(chosenRect);
    });
    return slots;
  }
  function annotate(S, idx, slot, text) {
    var lid = 'lab' + idx;
    if (S.has(lid)) S.set(lid, { text: text });
    else S.label(lid, { x: slot.x, y: slot.y, text: text, anchor: slot.anchor, size: 15, mono: true, style: 'dim' });
  }
  function clearAnnotate(S, idx) { var lid = 'lab' + idx; if (S.has(lid)) S.remove(lid); }
  /** A pure left-leaning chain: node i's only child is its left child, node i+1. */
  function skewChain(n, start, step) {
    var real = [], idx = 0;
    for (var i = 0; i < n; i++) { real.push(idx); idx = 2 * idx + 1; }
    var arr = [];
    for (var k = 0; k <= real[real.length - 1]; k++) arr.push(null);
    for (var i2 = 0; i2 < n; i2++) arr[real[i2]] = start + i2 * step;
    return arr;
  }
  /** A full binary tree (every node 0 or 2 children) shaped like a caterpillar: at each of `spine` levels one
   *  child is a leaf and the other continues the spine, so the tree is maximally unbalanced and far from
   *  complete. A full binary tree always has an ODD node count (leaves = internal + 1), so `spine` internal
   *  nodes give 2*spine + 1 real nodes — there is no full binary tree with an even node count. */
  function fullCaterpillar(spine, start, step) {
    var arr = [], idx = 0, val = start;
    for (var i = 0; i < spine; i++) {
      arr[idx] = val; val += step;
      var leafIdx = 2 * idx + 1, nextIdx = 2 * idx + 2;
      arr[leafIdx] = val; val += step;
      if (i === spine - 1) { arr[nextIdx] = val; val += step; }
      idx = nextIdx;
    }
    for (var k = 0; k < arr.length; k++) if (arr[k] === undefined) arr[k] = null;
    return arr;
  }
  /** Random but always-valid tree with exactly n real nodes: fill a perfect tree, then prune random leaves. */
  function randomTree(r, n, lo, hi) {
    var cap = 1;
    while (cap < n) cap = cap * 2 + 1;
    var arr = [];
    for (var i = 0; i < cap; i++) arr[i] = D.randInt(r, lo, hi);
    var toRemove = cap - n, removed = 0;
    while (removed < toRemove) {
      var leaves = [];
      for (var i2 = arr.length - 1; i2 >= 1; i2--) {
        if (arr[i2] === null) continue;
        var li = 2 * i2 + 1, ri = 2 * i2 + 2;
        var hasChild = (li < arr.length && arr[li] !== null) || (ri < arr.length && arr[ri] !== null);
        if (!hasChild) leaves.push(i2);
      }
      if (!leaves.length) break;
      arr[leaves[Math.floor(r() * leaves.length)]] = null;
      removed++;
    }
    while (arr.length && arr[arr.length - 1] === null) arr.pop();
    return arr;
  }

  D.define({
    id: 'tree-shapes',
    title: T('İkili ağaç biçimleri: dolu, tam, mükemmel, dejenere, dengeli', 'Binary tree shapes: full, complete, perfect, degenerate, balanced'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('12 düğüm, tam (complete) ama mükemmel değil', '12 nodes, complete but not perfect'),
        data: { tree: [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55] } },
      { id: 'hard', level: 'hard', name: T('17 düğüm, dolu (full) ama tam değil ve dengesiz — bir "tırtıl" ağacı', '17 nodes, full but not complete, and unbalanced — a "caterpillar" tree'),
        /* A full binary tree always has an ODD node count (leaves = internal + 1); 18 is impossible for a full
         * tree, so this uses 17 (8 spine nodes -> 2*8+1 = 17), the closest odd count to the requested 18. */
        data: { tree: fullCaterpillar(8, 100, 5) } },
      { id: 'perfect', level: 'edge', name: T('Mükemmel (perfect) ağaç: 15 düğüm, 4 seviye dolu', 'A perfect tree: 15 nodes, 4 full levels'),
        data: { tree: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] } },
      { id: 'degenerate', level: 'edge', name: T('Sola yığılmış zincir (dejenere): 10 düğüm', 'A left-leaning chain (degenerate): 10 nodes'),
        data: { tree: skewChain(10, 90, -6) } },
      { id: 'complete-not-full', level: 'edge', name: T('Tam (complete) ama dolu (full) DEĞİL: 10 düğüm', 'Complete but NOT full: 10 nodes'),
        data: { tree: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
      { id: 'balanced-not-complete', level: 'edge', name: T('Dengeli (balanced) ama tam (complete) DEĞİL: 11 düğüm', 'Balanced but NOT complete: 11 nodes'),
        /* A perfect 7-node tree (indices 0-6) with one extra left-only child hung under each of its 4 leaves
         * (indices 7, 9, 11, 13): every node's left/right heights still differ by at most 1 (balanced), but
         * the level-order array has a gap at index 8 before later real indices (not complete). */
        data: { tree: [1, 2, 3, 4, 5, 6, 7, 8, null, 9, null, 10, null, 11] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of real (non-null) nodes. */
    size: function (d) { return d.tree.filter(function (v) { return v !== null; }).length; },
    /** Independent computation, checked against S.result by test.js: works ONLY on the flat array with index
     *  arithmetic (2i+1 / 2i+2), never builds a Node/left/right tree object the way build() does. `complete`
     *  is a gap scan, `perfect` is the node-count formula 2^(h+1)-1, `balanced` uses its own local recursive
     *  height function — three different techniques from build()'s tree-object walks. */
    reference: function (d) {
      var arr = d.tree, n = arr.length;
      var realCount = 0, maxLevel = -1;
      for (var i = 0; i < n; i++) if (arr[i] !== null) { realCount++; maxLevel = Math.max(maxLevel, Math.floor(Math.log2(i + 1))); }
      var height = realCount ? maxLevel : -1;

      var full = true;
      for (var i2 = 0; i2 < n; i2++) {
        if (arr[i2] === null) continue;
        var li = 2 * i2 + 1, ri = 2 * i2 + 2;
        var hasL = li < n && arr[li] !== null, hasR = ri < n && arr[ri] !== null;
        if (hasL !== hasR) { full = false; break; }
      }

      var lastReal = -1;
      for (var i3 = 0; i3 < n; i3++) if (arr[i3] !== null) lastReal = i3;
      var complete = true;
      for (var i4 = 0; i4 <= lastReal; i4++) if (arr[i4] === null) { complete = false; break; }

      var perfect = realCount > 0 && realCount === Math.pow(2, height + 1) - 1;

      var degenerate = true;
      for (var i5 = 0; i5 < n; i5++) {
        if (arr[i5] === null) continue;
        var l5 = 2 * i5 + 1, r5 = 2 * i5 + 2;
        var hasL5 = l5 < n && arr[l5] !== null, hasR5 = r5 < n && arr[r5] !== null;
        if (hasL5 && hasR5) { degenerate = false; break; }
      }

      function heightBalanced(i) {
        if (i >= n || arr[i] === null) return -1;
        var hl = heightBalanced(2 * i + 1);
        if (hl === -2) return -2;
        var hr = heightBalanced(2 * i + 2);
        if (hr === -2) return -2;
        if (Math.abs(hl - hr) > 1) return -2;
        return Math.max(hl, hr) + 1;
      }
      var balanced = realCount === 0 ? true : heightBalanced(0) !== -2;

      return { nodes: realCount, height: height, full: full, complete: complete, perfect: perfect, degenerate: degenerate, balanced: balanced };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 16, extreme: 22 }[level] || 12;
      var lo = 1, hi = level === 'extreme' ? 999 : (level === 'hard' ? 150 : 99);
      return { tree: randomTree(r, n, lo, hi) };
    },
    input: {
      hint: T('Örnek: 50 30 70 20 40 60 80 10 25 35 45 55   (seviye sıralı liste; eksik çocuk için null, boş ağaç için "empty")',
              'Example: 50 30 70 20 40 60 80 10 25 35 45 55   (level-order list; null for a missing child, "empty" for no tree)'),
      parse: function (text) {
        var s = String(text).trim();
        if (/^(empty|boş)$/i.test(s)) return { tree: [] };
        var toks = s.split(/[\s,;]+/).filter(Boolean);
        if (!toks.length) throw T('En az bir değer ya da "empty" yazın.', 'Write at least one value or "empty".');
        var arr = toks.map(function (tok) {
          if (/^(null|-)$/i.test(tok)) return null;
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: bir tamsayı ya da null yazın.', '"' + tok + '" is not understood: write an integer or null.');
          return parseInt(tok, 10);
        });
        while (arr.length && arr[arr.length - 1] === null) arr.pop();
        if (!arr.length) throw T('En az bir gerçek düğüm gerekir (ya da "empty" yazın).', 'At least one real node is required (or write "empty").');
        for (var i = 1; i < arr.length; i++) {
          if (arr[i] !== null) {
            var p = Math.floor((i - 1) / 2);
            if (arr[p] === null) throw T('İndis ' + i + ' bir düğüm ama ebeveyni (indis ' + p + ') null: geçersiz ağaç.',
                                          'Index ' + i + ' has a node but its parent (index ' + p + ') is null: not a valid tree.');
          }
        }
        return { tree: arr };
      },
      format: function (d) { return d.tree.length ? d.tree.map(function (v) { return v === null ? 'null' : String(v); }).join(' ') : 'empty'; },
      bad: ['', '5 x 7', '5 null null 3', '3.5', 'null']
    },
    build: function (S, d) {
      var arr = d.tree;
      if (!arr.length) {
        S.label('empty', { x: 60, y: 50, text: T('Boş ağaç: hiçbir biçim sorusu anlamlı değil.', 'Empty tree: none of the shape questions really apply.'), anchor: 'start', size: 16 });
        S.step(T('`n = 0`: kontrol edilecek düğüm yok.', '`n = 0`: there is no node to check.'));
        S.result = { nodes: 0, height: -1, full: true, complete: true, perfect: false, degenerate: true, balanced: true };
        return;
      }
      var root = buildTree(arr), pos = layout(root);
      var slots = planAnnotationSlots(arr, pos);
      drawTree(S, root, pos);
      (function levelLabels() {
        var byDepth = [];
        for (var i = 0; i < arr.length; i++) {
          if (arr[i] === null) continue;
          var dd = Math.floor(Math.log2(i + 1));
          if (!byDepth[dd]) byDepth[dd] = [];
          byDepth[dd].push(i);
        }
        for (var d0 = 0; d0 < byDepth.length; d0++) {
          if (!byDepth[d0] || !byDepth[d0].length) continue;
          var minX = Math.min.apply(null, byDepth[d0].map(function (idx) { return pos[idx].x; }));
          var y = pos[byDepth[d0][0]].y;
          S.label('dlvl' + d0, { x: minX - 44, y: y + 5, text: 'd=' + d0, anchor: 'end', size: 14, mono: true, style: 'dim' });
        }
      })();
      S.step(T('Bu ikili ağacın beş biçim sorusunu sırayla soracağız: dolu mu (full)? tam mı (complete)? mükemmel mi (perfect)? dejenere mi? dengeli mi (balanced)?',
               'We will ask this binary tree five shape questions, one at a time: is it full? complete? perfect? degenerate? height-balanced?'));

      function hi(idx, style) { S.set('n' + idx, { style: style }); }
      function clearHi() { for (var j = 0; j < arr.length; j++) if (arr[j] !== null) S.set('n' + j, { style: 'normal' }); }

      /* ---- full: every node has 0 or 2 children ---- */
      var fullViolator = null;
      (function findFull(n) {
        if (!n || fullViolator) return;
        var hasL = !!n.left, hasR = !!n.right;
        if (hasL !== hasR) { fullViolator = n; return; }
        findFull(n.left); findFull(n.right);
      })(root);
      var full = fullViolator === null;
      if (full) {
        for (var fi = 0; fi < arr.length; fi++) if (arr[fi] !== null) hi(fi, 'new');
        S.step(T('DOLU (full): her düğümün 0 ya da 2 çocuğu var, hiçbiri tam 1 çocuklu değil. FULL: EVET.',
                 'FULL: every node has 0 or 2 children, none has exactly 1. FULL: YES.'), LINES_FULL);
      } else {
        hi(fullViolator.idx, 'del');
        S.step(T('DOLU (full): `' + fullViolator.val + '` düğümünün tam olarak ' + (fullViolator.left ? '1 (sadece sol)' : '1 (sadece sağ)') + ' çocuğu var — bu yüzden ağaç FULL DEĞİL.',
                 'FULL: node `' + fullViolator.val + '` has exactly ' + (fullViolator.left ? '1 child (left only)' : '1 child (right only)') + ' — so the tree is NOT full.'), LINES_FULL);
      }
      clearHi();

      /* ---- complete: real BFS with null placeholders, no real node may follow a gap ---- */
      var queueC = [root], seenGap = false, gapAt = null, offenderAt = null;
      while (queueC.length && offenderAt === null) {
        var cur = queueC.shift();
        if (cur === null) { if (!seenGap) { seenGap = true; } continue; }
        if (seenGap) { offenderAt = cur; break; }
        queueC.push(cur.left); queueC.push(cur.right);
      }
      var complete = offenderAt === null;
      if (complete) {
        for (var ci = 0; ci < arr.length; ci++) if (arr[ci] !== null) hi(ci, 'new');
        S.step(T('TAM (complete): seviye sıralı taramada bir BOŞLUKTAN SONRA hiçbir gerçek düğüm görünmüyor. COMPLETE: EVET.',
                 'COMPLETE: scanning level by level, no real node ever appears after a gap. COMPLETE: YES.'), LINES_COMPLETE);
      } else {
        hi(offenderAt.idx, 'del');
        S.step(T('TAM (complete): seviye sıralı taramada bir boşluktan SONRA `' + offenderAt.val + '` gerçek düğümü görünüyor — COMPLETE DEĞİL.',
                 'COMPLETE: scanning level by level, real node `' + offenderAt.val + '` appears AFTER a gap — NOT complete.'), LINES_COMPLETE);
      }
      clearHi();

      /* ---- perfect: full AND every leaf on the same level ---- */
      var leafDepth = null, leavesSameLevel = true, oddLeaf = null;
      (function walkLeaf(n, depth) {
        if (!n) return;
        if (!n.left && !n.right) {
          if (leafDepth === null) leafDepth = depth;
          else if (depth !== leafDepth && !oddLeaf) { leavesSameLevel = false; oddLeaf = n; }
          return;
        }
        walkLeaf(n.left, depth + 1); walkLeaf(n.right, depth + 1);
      })(root, 0);
      var perfect = full && leavesSameLevel;
      var perfectCount = arr.filter(function (v) { return v !== null; }).length;
      var perfectHeight = leafDepth === null ? 0 : leafDepth;
      if (perfect) {
        for (var pi = 0; pi < arr.length; pi++) if (arr[pi] !== null) hi(pi, 'new');
        S.step(T('MÜKEMMEL (perfect): dolu VE her yaprak aynı seviyede (derinlik ' + perfectHeight + '). Sayım kontrolü: ' + perfectCount + ' == 2^(' + perfectHeight + '+1)-1. PERFECT: EVET.',
                 'PERFECT: full AND every leaf is on the same level (depth ' + perfectHeight + '). Count check: ' + perfectCount + ' == 2^(' + perfectHeight + '+1)-1. PERFECT: YES.'), LINES_PERFECT);
      } else {
        var reasonsTr = [], reasonsEn = [];
        if (!full && fullViolator) {
          hi(fullViolator.idx, 'del');
          reasonsTr.push('`' + fullViolator.val + '` düğümünün tek çocuğu var');
          reasonsEn.push('node `' + fullViolator.val + '` has only one child');
        }
        if (!leavesSameLevel && oddLeaf) {
          hi(oddLeaf.idx, 'del');
          reasonsTr.push('yaprak `' + oddLeaf.val + '` diğer yapraklardan daha sığ bir seviyede');
          reasonsEn.push('leaf `' + oddLeaf.val + '` sits on a shallower level than the other leaves');
        }
        if (!reasonsTr.length) { reasonsTr.push('koşullar sağlanmıyor'); reasonsEn.push('the conditions do not hold'); }
        S.step(T('MÜKEMMEL (perfect): ' + reasonsTr.join(' ve ') + ' — bu yüzden mükemmel değil. PERFECT: HAYIR.',
                 'PERFECT: ' + reasonsEn.join(' and ') + ' — so it cannot be perfect. PERFECT: NO.'), LINES_PERFECT);
      }
      clearHi();

      /* ---- degenerate: no node has two children ---- */
      var twoChildNode = null;
      (function findTwo(n) { if (!n || twoChildNode) return; if (n.left && n.right) { twoChildNode = n; return; } findTwo(n.left); findTwo(n.right); })(root);
      var degenerate = twoChildNode === null;
      if (degenerate) {
        for (var di = 0; di < arr.length; di++) if (arr[di] !== null) hi(di, 'new');
        S.step(T('DEJENERE: hiçbir düğümün 2 çocuğu yok, her düğüm zincirin bir halkası. DEGENERATE: EVET.',
                 'DEGENERATE: no node has 2 children, every node is a single link in a chain. DEGENERATE: YES.'), LINES_DEGENERATE);
      } else {
        hi(twoChildNode.idx, 'del');
        S.step(T('DEJENERE: `' + twoChildNode.val + '` düğümünün 2 çocuğu var — ağaç bir zincir değil, DEGENERATE DEĞİL.',
                 'DEGENERATE: node `' + twoChildNode.val + '` has 2 children — the tree is not a chain, NOT degenerate.'), LINES_DEGENERATE);
      }
      clearHi();

      /* ---- balanced: heights bottom-up, level by level (iterative, not recursive) ---- */
      var byIdx = {};
      (function collect(n) { if (!n) return; byIdx[n.idx] = n; collect(n.left); collect(n.right); })(root);
      var idxByDepth = {}, maxD = 0;
      (function markDepth(n, dep) { if (!n) return; if (!idxByDepth[dep]) idxByDepth[dep] = []; idxByDepth[dep].push(n); maxD = Math.max(maxD, dep); markDepth(n.left, dep + 1); markDepth(n.right, dep + 1); })(root, 0);
      var heightAt = {}, firstUnbalanced = null;
      for (var lvl = maxD; lvl >= 0; lvl--) {
        idxByDepth[lvl].forEach(function (n) {
          var hl = n.left ? heightAt[n.left.idx] : -1, hr = n.right ? heightAt[n.right.idx] : -1;
          heightAt[n.idx] = 1 + Math.max(hl, hr);
          if (!firstUnbalanced && Math.abs(hl - hr) > 1) firstUnbalanced = n;
        });
      }
      for (var hIdx = 0; hIdx < arr.length; hIdx++) if (arr[hIdx] !== null) annotate(S, hIdx, slots[hIdx], 'h=' + heightAt[hIdx]);
      S.step(T('DENGELİ (balanced) için önce her düğümün alt-ağaç yüksekliğini en alttan yukarı hesaplıyoruz (yapraklar h=0).',
               'For BALANCED we first compute each node\'s subtree height bottom-up (leaves get h=0).'), LINES_BALANCED);
      var balanced = firstUnbalanced === null;
      if (balanced) {
        S.step(T('Her düğümde |sol yükseklik - sağ yükseklik| <= 1. BALANCED: EVET.',
                 'At every node, |left height - right height| <= 1. BALANCED: YES.'), LINES_BALANCED);
      } else {
        hi(firstUnbalanced.idx, 'del');
        var hl2 = firstUnbalanced.left ? heightAt[firstUnbalanced.left.idx] : -1, hr2 = firstUnbalanced.right ? heightAt[firstUnbalanced.right.idx] : -1;
        S.step(T('`' + firstUnbalanced.val + '` düğümünde sol yükseklik ' + hl2 + ', sağ yükseklik ' + hr2 + ' — fark 1\'den büyük. BALANCED DEĞİL.',
                 'At node `' + firstUnbalanced.val + '` the left height is ' + hl2 + ' and the right height is ' + hr2 + ' — the difference exceeds 1. NOT balanced.'), LINES_BALANCED);
      }
      for (var hIdx2 = 0; hIdx2 < arr.length; hIdx2++) if (arr[hIdx2] !== null) { S.set('n' + hIdx2, { style: 'normal' }); clearAnnotate(S, hIdx2); }

      var height = heightAt[root.idx];
      var nodesCount = arr.filter(function (v) { return v !== null; }).length;
      var sumY = (Object.keys(pos).reduce(function (m, k) { return Math.max(m, pos[k].y); }, 0)) + 74;
      S.label('sum1', { x: 0, y: sumY,
        text: T('Özet — dolu: ' + (full ? 'evet' : 'hayır') + ', tam: ' + (complete ? 'evet' : 'hayır') + ', mükemmel: ' + (perfect ? 'evet' : 'hayır') + '.',
                 'Summary — full: ' + (full ? 'yes' : 'no') + ', complete: ' + (complete ? 'yes' : 'no') + ', perfect: ' + (perfect ? 'yes' : 'no') + '.'),
        anchor: 'start', size: 16, bold: true });
      S.label('sum2', { x: 0, y: sumY + 26,
        text: T('dejenere: ' + (degenerate ? 'evet' : 'hayır') + ', dengeli: ' + (balanced ? 'evet' : 'hayır') + ' (' + nodesCount + ' düğüm, yükseklik ' + height + ').',
                 'degenerate: ' + (degenerate ? 'yes' : 'no') + ', balanced: ' + (balanced ? 'yes' : 'no') + ' (' + nodesCount + ' nodes, height ' + height + ').'),
        anchor: 'start', size: 16, bold: true });
      S.step(T('Özet: ' + nodesCount + ' düğüm, yükseklik ' + height + '. Beş sorunun cevabı yukarıda.',
               'Summary: ' + nodesCount + ' nodes, height ' + height + '. The five answers are shown above.'));

      S.result = { nodes: nodesCount, height: height, full: full, complete: complete, perfect: perfect, degenerate: degenerate, balanced: balanced };
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
