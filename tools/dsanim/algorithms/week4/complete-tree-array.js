/* Week 4 — storing a binary tree in a plain array: parent/left/right index formulas, tree and array kept in
 * sync, and a check for whether the tree is actually "complete" (no gaps before the last real slot). */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '/* a tree stored in level order, inside a plain array: */',
    'static int parent(int i) { return (i - 1) / 2; }',
    'static int left(int i)   { return 2 * i + 1; }',
    'static int right(int i)  { return 2 * i + 2; }',
    '',
    '/* complete: every slot up to the last real one is filled -- no gaps */',
    'static bool is_complete(int arr[], int n, int last_real) {',
    '    for (int i = 0; i <= last_real; i++)',
    '        if (arr[i] == EMPTY) return false;   /* a hole before the end */',
    '    return true;',
    '}'
  ];
  var JAVA_CODE = [
    '/* a tree stored in level order, inside a plain array: */',
    'static int parent(int i) { return (i - 1) / 2; }',
    'static int left(int i)   { return 2 * i + 1; }',
    'static int right(int i)  { return 2 * i + 2; }',
    '',
    '/* complete: every slot up to the last real one is filled -- no gaps */',
    'static boolean isComplete(Integer[] arr, int n, int lastReal) {',
    '    for (int i = 0; i <= lastReal; i++)',
    '        if (arr[i] == null) return false;    // a hole before the end',
    '    return true;',
    '}'
  ];
  var LINES_FORMULAS = { c: [2, 3, 4], java: [2, 3, 4] };
  var LINES_CHECK = { c: [7, 8, 9, 10], java: [7, 8, 9, 10] };

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
  /** Positions for EVERY index 0..len-1 (real or not), triangular and bottom-up so parents centre over children. */
  function slotPos(len) {
    var pos = {}, DX = 52, DY = 84, Y0 = 44;
    if (!len) return pos;
    var maxLevel = Math.floor(Math.log2(len));
    var levelW = Math.pow(2, maxLevel) * DX;
    for (var i = 0; i < len; i++) {
      var level = Math.floor(Math.log2(i + 1));
      var first = Math.pow(2, level) - 1;
      var cnt = Math.pow(2, level);
      var width = levelW / cnt;
      pos[i] = { x: width * (i - first + 0.5), y: Y0 + level * DY };
    }
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
  function lastRealIndex(arr) { var last = -1; for (var i = 0; i < arr.length; i++) if (arr[i] !== null) last = i; return last; }
  /** Random but always-valid tree with exactly n real nodes: fill a perfect tree, then prune random leaves
   *  (this naturally yields both complete and not-complete shapes, depending on which leaves get pruned). */
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
  /** Independent reference: reconstructs the tree by ITS OWN breadth-first walk (not build()'s array.map/forEach
   *  wiring), then checks completeness with the classic 1-indexed numbering technique (complete iff the largest
   *  id handed out equals the node count) — a different technique from build()'s "scan for a hole" on the array. */
  function refCheck(arr) {
    if (!arr.length || arr[0] === null) return { complete: true, count: 0 };
    var root = { val: arr[0], left: null, right: null };
    var q = [{ node: root, idx: 0 }];
    while (q.length) {
      var cur = q.shift(), li = 2 * cur.idx + 1, ri = 2 * cur.idx + 2;
      if (li < arr.length && arr[li] !== null) { cur.node.left = { val: arr[li], left: null, right: null }; q.push({ node: cur.node.left, idx: li }); }
      if (ri < arr.length && arr[ri] !== null) { cur.node.right = { val: arr[ri], left: null, right: null }; q.push({ node: cur.node.right, idx: ri }); }
    }
    var q2 = [{ node: root, id: 1 }], count = 0, maxId = 0;
    while (q2.length) {
      var c = q2.shift();
      count++;
      maxId = Math.max(maxId, c.id);
      if (c.node.left) q2.push({ node: c.node.left, id: 2 * c.id });
      if (c.node.right) q2.push({ node: c.node.right, id: 2 * c.id + 1 });
    }
    return { complete: maxId === count, count: count };
  }

  D.define({
    id: 'complete-tree-array',
    title: T('Tam ağacın dizi (array) ile gösterimi', 'Array representation of a complete binary tree'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('12 düğüm, tam (complete) ağaç — dizide hiç boşluk yok', '12 nodes, a complete tree — no gaps in the array'),
        data: { tree: [8, 4, 15, 2, 6, 11, 20, 1, 3, 5, 7, 9] } },
      { id: 'hard', level: 'hard', name: T('19 düğüm, tam ağaç — son seviye yarı dolu', '19 nodes, a complete tree — the last level is half full'),
        data: { tree: [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 85, 5, 15, 22, 28] } },
      { id: 'gap', level: 'edge', name: T('Tam DEĞİL: indis 9 ve 10 boş ama indis 11 dolu — boşluk var', 'NOT complete: index 9 and 10 are empty but index 11 is filled — there is a gap'),
        data: { tree: [9, 4, 12, 2, 6, 10, 15, 1, 3, null, null, 7] } },
      { id: 'single', level: 'edge', name: T('Tek düğüm (tek başına her zaman tam)', 'A single node (trivially complete)'), data: { tree: [42] }, small: true },
      { id: 'empty', level: 'edge', name: T('Boş ağaç (kabul: tam sayılır, 0 düğüm)', 'Empty tree (by convention: complete, 0 nodes)'), data: { tree: [] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of real (non-null) nodes. */
    size: function (d) { return d.tree.filter(function (v) { return v !== null; }).length; },
    /** Independent computation, checked against S.result by test.js: its own BFS reconstruction plus the classic
     *  1-indexed "max id == count" completeness test, not build()'s array hole-scan. */
    reference: function (d) { return refCheck(d.tree); },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 16, extreme: 22 }[level] || 12;
      var lo = level === 'extreme' ? -999 : (level === 'hard' ? -50 : 1);
      var hi = level === 'extreme' ? 999 : (level === 'hard' ? 150 : 99);
      return { tree: randomTree(r, n, lo, hi) };
    },
    input: {
      hint: T('Örnek: 8 4 15 2 6 11 20 1 3 5 7 9   (seviye sıralı liste; eksik çocuk için null, boş ağaç için "empty")',
              'Example: 8 4 15 2 6 11 20 1 3 5 7 9   (level-order list; null for a missing child, "empty" for no tree)'),
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
        S.label('empty', { x: 60, y: 50, text: T('Boş ağaç: 0 düğüm. Kabul olarak boş ağaç "tam" sayılır.', 'Empty tree: 0 nodes. By convention an empty tree counts as complete.'), anchor: 'start', size: 16 });
        S.step(T('`n = 0`: kontrol edilecek hücre yok, döngü hiç çalışmaz, `is_complete` `true` döner.',
                 '`n = 0`: there are no cells to check, the loop never runs, `is_complete` returns `true`.'), LINES_CHECK);
        S.result = { complete: true, count: 0 };
        return;
      }
      var root = buildTree(arr), pos = slotPos(arr.length);
      drawTree(S, root, pos);
      var maxY = 0;
      for (var k in pos) maxY = Math.max(maxY, pos[k].y);
      var ARRY = maxY + 90, X0 = 0, ADX = 46;
      S.region('arr', { x: X0 - 20, y: ARRY - 24, w: arr.length * ADX + 20, h: 56, title: T('dizi (array), soldan sağa indis 0, 1, 2...', 'array, left to right index 0, 1, 2...') });
      S.label('arrlbl', { x: X0 - 34, y: ARRY + 5, text: 'A =', anchor: 'end', size: 15, mono: true, style: 'dim' });
      for (var i = 0; i < arr.length; i++) {
        S.box('b' + i, { x: X0 + i * ADX, y: ARRY, w: 40, h: 38, text: arr[i] === null ? '' : String(arr[i]), style: arr[i] === null ? 'empty' : 'normal', size: 15, above: String(i) });
      }
      var maxLvl = Math.floor(Math.log2(arr.length));
      for (var lv = 0; lv <= maxLvl; lv++) {
        var firstAt = Math.pow(2, lv) - 1;
        if (firstAt < arr.length) S.label('dlvl' + lv, { x: pos[firstAt].x - 46, y: pos[firstAt].y + 5, text: 'd=' + lv, anchor: 'end', size: 14, mono: true, style: 'dim' });
      }
      var FY = ARRY + 76, FX = 0, factCount = 0;
      S.label('flbl', { x: FX, y: FY - 22, text: T('gözlemler:', 'observations:'), anchor: 'start', style: 'dim', size: 14 });
      function addFact(text) {
        S.label('f' + factCount, { x: FX, y: FY + factCount * 24, text: text, anchor: 'start', size: 15, mono: true });
        factCount++;
      }
      function hi(i, style) { if (S.has('n' + i)) S.set('n' + i, { style: style }); S.set('b' + i, { style: style }); }
      function clearHi() { for (var j = 0; j < arr.length; j++) { if (S.has('n' + j)) S.set('n' + j, { style: 'normal' }); S.set('b' + j, { style: arr[j] === null ? 'empty' : 'normal' }); } }

      var lvl2Lo = 3, lvl2Hi = Math.min(6, arr.length - 1);
      if (lvl2Hi >= lvl2Lo) S.brace('lvl2', { from: 'b' + lvl2Lo, to: 'b' + lvl2Hi, text: T('seviye 2', 'level 2'), side: 'bottom', dist: 14 });
      S.step(T('Bir ikili ağacı, düğüm başına bellek ayırmadan, düz bir DİZİ (array) içinde de tutabiliriz: kök 0. hücreye, sonra seviye seviye soldan sağa (aşağıda parantez: hücreler 3-6 arası "seviye 2"). Bir düğüm `i`. hücredeyse çocukları `2i+1` ve `2i+2`. hücrelerdedir, ebeveyni `(i-1)/2`. hücredir. Alttaki dizi, hücreleri soldan sağa 0, 1, 2... sırayla gösterir; bir hücreyi vurguladığımızda YUKARIDAKİ AYNI İNDİSLİ ağaç düğümü de birlikte vurgulanır.',
               'We can also store a binary tree in a plain ARRAY, with no per-node memory: the root in cell 0, then level by level, left to right (the brace below: cells 3-6 are "level 2"). If a node is at cell `i`, its children are at cells `2i+1` and `2i+2`, its parent is at cell `(i-1)/2`. The array below shows its cells left to right in order 0, 1, 2...; whenever we highlight a cell, the tree node at the SAME index above is highlighted together with it.'),
             LINES_FORMULAS);
      if (S.has('lvl2')) S.remove('lvl2');

      hi(0, 'hl');
      var rootRight = 2 < arr.length ? 2 : null;
      addFact(T('parent(0) = — (kök)', 'parent(0) = — (root)'));
      if (1 < arr.length) { hi(1, 'active'); addFact('left(0) = 1'); }
      if (rootRight !== null) { hi(rootRight, 'active'); addFact('right(0) = 2'); }
      S.step(T('0. hücre (kök, `' + arr[0] + '`): ebeveyni yok. `left(0) = 2*0+1 = 1`, `right(0) = 2*0+2 = 2` — aynı hesap hem dizi hücresini hem ağaç düğümünü bulur.',
               'Cell 0 (the root, `' + arr[0] + '`): it has no parent. `left(0) = 2*0+1 = 1`, `right(0) = 2*0+2 = 2` — the same arithmetic locates both the array cell and the tree node.'), LINES_FORMULAS);
      clearHi();

      var last = lastRealIndex(arr);
      var demoIdx = arr.length > 3 ? 3 : (last !== 0 ? last : -1);
      if (demoIdx > 0 && demoIdx !== last) {
        var p = Math.floor((demoIdx - 1) / 2), l = 2 * demoIdx + 1, rr = 2 * demoIdx + 2;
        hi(demoIdx, 'hl'); hi(p, 'active');
        addFact('parent(' + demoIdx + ') = ' + p);
        if (l < arr.length) { hi(l, 'active'); addFact(arr[l] === null ? T('left(' + demoIdx + ') = ' + l + ' (boş)', 'left(' + demoIdx + ') = ' + l + ' (empty)') : 'left(' + demoIdx + ') = ' + l); }
        if (rr < arr.length) { hi(rr, 'active'); addFact(arr[rr] === null ? T('right(' + demoIdx + ') = ' + rr + ' (boş)', 'right(' + demoIdx + ') = ' + rr + ' (empty)') : 'right(' + demoIdx + ') = ' + rr); }
        S.step(T((arr[demoIdx] === null ? demoIdx + '. hücre boş, ama yine de formül aynı çalışır: ' : demoIdx + '. hücre (`' + arr[demoIdx] + '`): ') + '`parent(' + demoIdx + ') = ' + p + '`, `left(' + demoIdx + ') = ' + l + '`, `right(' + demoIdx + ') = ' + rr + '`.',
                 (arr[demoIdx] === null ? 'Cell ' + demoIdx + ' is empty, but the formula still works the same way: ' : 'Cell ' + demoIdx + ' (`' + arr[demoIdx] + '`): ') + '`parent(' + demoIdx + ') = ' + p + '`, `left(' + demoIdx + ') = ' + l + '`, `right(' + demoIdx + ') = ' + rr + '`.'), LINES_FORMULAS);
        clearHi();
      }

      var gap = -1;
      for (var g = 0; g <= last; g++) if (arr[g] === null) { gap = g; break; }
      if (gap === -1) {
        for (var i2 = 0; i2 <= last; i2++) hi(i2, 'new');
        addFact(T('kontrol: 0..' + last + ' arası boşluk yok', 'check: no gap in 0..' + last));
        S.step(T('`is_complete`: 0. hücreden ' + last + '. hücreye kadar hepsini tarıyoruz — HİÇBİRİ boş değil. Bu ağaç TAM (complete): son seviye de olsa boşluksuz, soldan sağa dolu.',
                 '`is_complete`: we scan every cell from 0 to ' + last + ' — NONE of them is empty. This tree IS complete: even the last level, if partial, is filled left to right with no gaps.'), LINES_CHECK);
      } else {
        hi(gap, 'del');
        hi(last, 'hl');
        addFact('gap: arr[' + gap + '] = EMPTY, arr[' + last + '] = ' + arr[last]);
        S.step(T('`is_complete`: tararken ' + gap + '. hücrede bir BOŞLUK buluyoruz — ama ' + last + '. hücre (daha sonraki bir hücre!) dolu (`' + arr[last] + '`). Demek ki bu ağaç TAM DEĞİL: dizide "delik" var, bu da array temsilini bu ağaç için elverişsiz yapar.',
                 '`is_complete`: while scanning we find a GAP at cell ' + gap + ' — yet cell ' + last + ' (a LATER cell!) is filled (`' + arr[last] + '`). So this tree is NOT complete: the array has a "hole", which is exactly why the array representation is wasteful for a tree shaped like this.'), LINES_CHECK);
      }
      clearHi();
      var count = arr.filter(function (v) { return v !== null; }).length;
      var complete = gap === -1;
      S.result = { complete: complete, count: count };
      S.step(T('Sonuç: ' + count + ' düğüm, tam (complete) mi? ' + (complete ? 'EVET' : 'HAYIR') + '. Tam bir ağaç için dizi temsili mükemmeldir (boşa giden hücre yok); tam olmayan bir ağaç içinse dizi çoğu zaman gerçek düğüm sayısının çok üstünde hücreye ihtiyaç duyar.',
               'Result: ' + count + ' nodes, complete? ' + (complete ? 'YES' : 'NO') + '. For a complete tree the array representation is perfect (no wasted cells); for a tree that is not complete, the array usually needs far more cells than the real node count.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
