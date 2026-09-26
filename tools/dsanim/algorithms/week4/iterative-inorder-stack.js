/* Week 4 — binary tree: iterative inorder traversal with our own explicit array-based stack (no recursion). */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    'static void push(Node *n) {',
    '    top = top + 1;',
    '    stack_data[top] = n;',
    '}',
    '',
    'static Node *pop(void) {',
    '    Node *n = stack_data[top];',
    '    top = top - 1;',
    '    return n;',
    '}',
    '',
    'while (cur != NULL || !is_empty()) {',
    '    while (cur != NULL) {          /* push the whole left spine */',
    '        push(cur);',
    '        cur = cur->left;',
    '    }',
    "    cur = pop();                   /* can't go left anymore: pop, visit */",
    '    printf("visit %d\\n", cur->value);',
    '    visited[visited_count++] = cur->value;',
    '    cur = cur->right;              /* then walk into the right subtree */',
    '}'
  ];
  var JAVA_CODE = [
    'static void push(Node n) {',
    '    top = top + 1;',
    '    stackData[top] = n;',
    '}',
    '',
    'static Node pop() {',
    '    Node n = stackData[top];',
    '    top = top - 1;',
    '    return n;',
    '}',
    '',
    'while (cur != null || !isEmpty()) {',
    '    while (cur != null) {          // push the whole left spine',
    '        push(cur);',
    '        cur = cur.left;',
    '    }',
    "    cur = pop();                   // can't go left anymore: pop, visit",
    '    System.out.println("visit " + cur.value);',
    '    visited[visitedCount++] = cur.value;',
    '    cur = cur.right;               // then walk into the right subtree',
    '}'
  ];
  var LINES_PUSH = { c: [12, 13, 14], java: [12, 13, 14] };
  var LINES_POP = { c: [16, 17, 18], java: [16, 17, 18] };

  /* ---- tree helpers (local to this file; build() uses these, reference() does not) ---- */
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
  function maxDepthOf(arr) {
    var md = 0;
    for (var i = 0; i < arr.length; i++) if (arr[i] !== null) md = Math.max(md, Math.floor(Math.log2(i + 1)));
    return md;
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
  /** Generate a genuinely degenerate (single-child) chain: every node has only one child, in direction `dir`. */
  function skewChain(n, dir, start, step) {
    var real = [], idx = 0;
    for (var i = 0; i < n; i++) { real.push(idx); idx = dir === 'left' ? 2 * idx + 1 : 2 * idx + 2; }
    var arr = [];
    for (var k = 0; k <= real[real.length - 1]; k++) arr.push(null);
    for (var i2 = 0; i2 < n; i2++) arr[real[i2]] = start + i2 * step;
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
  /** Independent reference: plain recursion directly on array indices — a different technique from build()'s
   *  iterative loop with an explicit stack (no Node objects, no explicit stack at all). */
  function refInorderRec(arr, i, out) {
    if (i >= arr.length || arr[i] === null) return;
    refInorderRec(arr, 2 * i + 1, out);
    out.push(arr[i]);
    refInorderRec(arr, 2 * i + 2, out);
  }

  D.define({
    id: 'iterative-inorder-stack',
    title: T('Yığınla (kendi yığınımızla) inorder dolaşma', 'Inorder traversal with our own stack'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 düğüm, dengeli BST', '10 nodes, a balanced BST'),
        data: { tree: [50, 30, 70, 20, 40, 60, 80, 10, null, null, 45, 55] } },
      { id: 'hard', level: 'hard', name: T('16 düğüm, düzensiz derinlikler', '16 nodes, uneven depths'),
        data: { tree: [44, 22, 77, 11, 33, 60, 90, null, 5, 17, 28, 39, 55, 65, 85, null, null, 95, null, 99] } },
      { id: 'left-skewed', level: 'edge', name: T('Sola yığılmış (degenerate) zincir: yığın en derin haline ulaşır, 10 düğüm', 'Left-skewed (degenerate) chain: the stack reaches its deepest point, 10 nodes'),
        data: { tree: skewChain(10, 'left', 88, -7) } },
      { id: 'right-skewed', level: 'edge', name: T('Sağa yığılmış (degenerate) zincir: yığın hiç derinleşmez, 10 düğüm', 'Right-skewed (degenerate) chain: the stack never grows deep, 10 nodes'),
        data: { tree: skewChain(10, 'right', 5, 8) } },
      { id: 'single', level: 'edge', name: T('Tek düğüm', 'A single node'), data: { tree: [42] }, small: true },
      { id: 'empty', level: 'edge', name: T('Boş ağaç', 'Empty tree'), data: { tree: [] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of real (non-null) nodes. */
    size: function (d) { return d.tree.filter(function (v) { return v !== null; }).length; },
    /** Independent computation, checked against S.result by test.js: plain recursion, not the iterative
     *  explicit-stack loop that build() demonstrates. */
    reference: function (d) { var out = []; refInorderRec(d.tree, 0, out); return out; },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level] || 12;
      var lo = level === 'extreme' ? -999 : (level === 'hard' ? -50 : 1);
      var hi = level === 'extreme' ? 999 : (level === 'hard' ? 150 : 99);
      return { tree: randomTree(r, n, lo, hi) };
    },
    input: {
      hint: T('Örnek: 50 30 70 20 40 60 80 10 null null 45   (seviye sıralı liste; eksik çocuk için null, boş ağaç için "empty")',
              'Example: 50 30 70 20 40 60 80 10 null null 45   (level-order list; null for a missing child, "empty" for no tree)'),
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
      var root = buildTree(arr);
      if (!root) {
        S.label('empty', { x: 60, y: 50, text: T('Boş ağaç: yığına hiçbir şey itilmez.', 'Empty tree: nothing is ever pushed.'), anchor: 'start', size: 16 });
        S.step(T('Ağaç boş (`tree = []`): `cur` baştan `NULL`, döngü hiç çalışmaz.', 'The tree is empty (`tree = []`): `cur` is `NULL` from the start, the loop never runs.'), { c: [11], java: [11] });
        S.result = [];
        return;
      }
      var pos = layout(root);
      drawTree(S, root, pos);
      var maxD = maxDepthOf(arr), cap = maxD + 1;
      var maxX = 0;
      for (var k in pos) maxX = Math.max(maxX, pos[k].x);
      var SX = maxX + 120, SY0 = 44 + cap * 42;
      var OY0 = 44 + (maxD + 1) * 84 - 44 + 60, OX0 = 46;
      S.region('stf', { x: SX - 40, y: SY0 - cap * 42 - 22, w: 96, h: cap * 42 + 34, title: T('yığın (stack)', 'stack') });
      for (var si = 0; si < cap; si++) S.box('s' + si, { x: SX - 32, y: SY0 - (si + 1) * 42, w: 78, h: 36, text: '', style: 'empty', size: 15 });
      S.label('lbl', { x: OX0, y: OY0 - 22, text: T('ziyaret sırası (inorder):', 'visit order (inorder):'), anchor: 'start', style: 'dim', size: 14 });
      S.step(T('Özyineleme kullanmadan da inorder gezebiliriz: derleyicinin gizli çağrı yığını yerine KENDİ dizi tabanlı yığınımızı (Hafta 3\'teki fikrin aynısı) kullanırız, sadece sayı yerine ağaç düğümü (`Node*`) tutar. `cur`, "şu an inceliyoruz" işaretçisi.',
               'We can do inorder traversal without recursion: instead of the compiler\'s hidden call stack we use OUR OWN array-based stack (the exact idea from Week 3), except it holds tree nodes (`Node*`) instead of numbers. `cur` is the "currently looking at" pointer.'),
             { c: [1, 2, 3], java: [1, 2, 3] });

      function stackVals(st) { return st.map(function (n) { return n.val; }); }
      function updateStack(st) {
        for (var i = 0; i < cap; i++) {
          if (i < st.length) S.set('s' + i, { text: String(st[i].val), style: 'active' });
          else S.set('s' + i, { text: '', style: 'empty' });
        }
      }

      var stack = [], cur = root, order = [], boxCount = 0, firstPush = true, firstPop = true;
      function outputBox(val) {
        if (boxCount > 0) S.set('o' + (boxCount - 1), { style: 'normal' });
        var col = boxCount % 16, row = Math.floor(boxCount / 16);
        S.box('o' + boxCount, { x: OX0 + col * 46, y: OY0 + row * 50, w: 40, h: 36, text: String(val), style: 'hl', size: 16 });
        boxCount++;
      }

      while (cur || stack.length) {
        if (cur) {
          var pushedVals = [];
          arr.forEach(function (v, i) { if (v !== null && S.get('n' + i).style !== 'dim') S.set('n' + i, { style: 'normal' }); });
          while (cur) {
            stack.push(cur);
            pushedVals.push(cur.val);
            S.set('n' + cur.idx, { style: 'active' });
            cur = cur.left;
          }
          updateStack(stack);
          if (firstPush) {
            S.step(T('İç `while (cur != NULL)`: mümkün olduğunca sola git, geçtiğimiz HER düğümü yığına it (`push`). Bu sefer itilenler: ' + pushedVals.join(', ') + '.',
                     'Inner `while (cur != NULL)`: go as far left as possible, `push`-ing EVERY node we pass. This time we pushed: ' + pushedVals.join(', ') + '.'), LINES_PUSH);
            firstPush = false;
          } else {
            S.step(T('Yine sola gidip itiyoruz: ' + pushedVals.join(', ') + '.', 'Going left and pushing again: ' + pushedVals.join(', ') + '.'), LINES_PUSH);
          }
        } else {
          var n = stack.pop();
          S.at(n.idx);
          updateStack(stack);
          S.set('n' + n.idx, { style: 'hl' });
          outputBox(n.val);
          order.push(n.val);
          var soFar = order.join(', ');
          if (firstPop) {
            S.step(T('Artık sola gidemiyoruz (`cur == NULL`): `pop()` ile yığından `' + n.val + '` alınır ve HEMEN ziyaret edilir — solu bitmişti. Çıkış listesi: ' + soFar + '.',
                     'We cannot go left anymore (`cur == NULL`): `pop()` takes `' + n.val + '` off the stack and it is visited RIGHT AWAY — its left side was done. Output list: ' + soFar + '.'), LINES_POP);
            firstPop = false;
          } else {
            S.step(T('`pop()` -> `' + n.val + '`; ziyaret edilir. Şimdiye kadar: ' + soFar + '.', '`pop()` -> `' + n.val + '`; it is visited. So far: ' + soFar + '.'), LINES_POP);
          }
          S.set('n' + n.idx, { style: 'dim' });
          cur = n.right;
        }
      }
      S.at(null);
      arr.forEach(function (v, i) { if (v !== null) S.set('n' + i, { style: 'normal' }); });
      updateStack(stack);
      S.result = order;
      S.step(T('Bitti. Tam sıra: ' + order.join(', ') + ' — özyinelemeli inorder ile birebir aynı. Fark: yığını artık biz elle yönetiyoruz, derleyici değil.',
               'Done. Full sequence: ' + order.join(', ') + ' — exactly the same as recursive inorder. The difference: we manage the stack by hand now, not the compiler.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
