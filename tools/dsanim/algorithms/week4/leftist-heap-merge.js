/* Week 4 — leftist heap merge, the operation everything else (insert, extract) is built from. Merge splices the
 * two right spines together like merging sorted lists (phase 1), then walks the new spine back up, swapping
 * children so the SHORTER side (by null path length, npl) always ends up on the right (phase 2). A leftist heap
 * is a plain pointer-based binary tree, not a complete tree, so there is no array view — only the tree (circle +
 * arrow); `below` shows each node's npl. Data: {kind: 'min'|'max', a: [...], b: [...]} — the two heaps merged
 * (each itself built by repeatedly merging in one value at a time, the same way `insert` would). */
(function (D) {
  'use strict';
  var T = D.T;

  function less(kind, x, y) { return kind === 'max' ? x > y : x < y; }

  var C = [
    '/* null path length: distance to the nearest missing child; NULL has npl -1 */',
    'int npl(Node *t) { return t ? t->npl : -1; }',
    '',
    '/* phase 1: splice the two right spines together like merging sorted lists (the better root always wins) */',
    'Node *merge(Node *t1, Node *t2) {',
    '    Node dummy; Node *cur = &dummy;',
    '    Node *chain[64]; int n = 0;        /* record spliced nodes for the bottom-up fix in phase 2 */',
    '    while (t1 && t2) {',
    '        Node *winner;',
    '        if (better(t1->key, t2->key)) { winner = t1; t1 = t1->right; }',
    '        else                          { winner = t2; t2 = t2->right; }',
    '        cur->right = winner; cur = winner; chain[n++] = winner;',
    '    }',
    '    cur->right = t1 ? t1 : t2;',
    '',
    '    /* phase 2: bottom-up, keep the shorter side on the right (the leftist property) */',
    '    for (int i = n - 1; i >= 0; i--) {',
    '        Node *node = chain[i];',
    '        if (npl(node->left) < npl(node->right)) {',
    '            Node *tmp = node->left; node->left = node->right; node->right = tmp;',
    '        }',
    '        node->npl = npl(node->right) + 1;',
    '    }',
    '    return dummy.right;',
    '}'
  ];
  var J = [
    '// null path length: distance to the nearest missing child; null has npl -1',
    'int npl(Node t) { return t != null ? t.npl : -1; }',
    '',
    '// phase 1: splice the two right spines together like merging sorted lists (the better root always wins)',
    'Node merge(Node t1, Node t2) {',
    '    Node dummy = new Node(); Node cur = dummy;',
    '    List<Node> chain = new ArrayList<>();   // record spliced nodes for the bottom-up fix in phase 2',
    '    while (t1 != null && t2 != null) {',
    '        Node winner;',
    '        if (better(t1.key, t2.key)) { winner = t1; t1 = t1.right; }',
    '        else                        { winner = t2; t2 = t2.right; }',
    '        cur.right = winner; cur = winner; chain.add(winner);',
    '    }',
    '    cur.right = (t1 != null) ? t1 : t2;',
    '',
    '    // phase 2: bottom-up, keep the shorter side on the right (the leftist property)',
    '    for (int i = chain.size() - 1; i >= 0; i--) {',
    '        Node node = chain.get(i);',
    '        if (npl(node.left) < npl(node.right)) {',
    '            Node tmp = node.left; node.left = node.right; node.right = tmp;',
    '        }',
    '        node.npl = npl(node.right) + 1;',
    '    }',
    '    return dummy.right;',
    '}'
  ];

  D.define({
    id: 'leftist-heap-merge',
    title: T('Solcu öbekte birleştirme (leftist heap merge)', 'Leftist heap merge'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('Min: A (5 eleman) ile B (6 eleman) birleşir', 'Min: A (5 elements) merges with B (6 elements)'),
        data: { kind: 'min', a: [9, 5, 12, 3, 15], b: [7, 20, 2, 11, 18, 6] } },
      { id: 'hard', level: 'hard', name: T('Max: A artan sırada 8, B azalan sırada 7 (uzun sağ omurga)', 'Max: A ascending 8, B descending 7 (a long right spine)'),
        data: { kind: 'max', a: [1, 2, 3, 4, 5, 6, 7, 8], b: [30, 25, 20, 15, 10, 5, 1] } },
      { id: 'empty-a', level: 'edge', name: T('A boş, B ile birleştirme (11 eleman)', 'A is empty, merge with B (11 elements)'),
        data: { kind: 'min', a: [], b: [6, 19, 3, 27, 11, 8, 35, 14, 22, 9, 41] } },
      { id: 'all-equal', level: 'edge', name: T('Hepsi eşit: değer 4, toplam 11 eleman', 'All equal: value 4, 11 elements total'),
        data: { kind: 'max', a: [4, 4, 4, 4, 4], b: [4, 4, 4, 4, 4, 4] } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler: 5 + 6 eleman', 'Extreme values: 5 + 6 elements'),
        data: { kind: 'min', a: [2147483647, -2147483648, 0, 1000000, -1000000], b: [5, -5, 2147483646, -2147483647, 1, -1] } },
      { id: 'single', level: 'edge', name: T('Bir elemanlı iki öbeğin birleşimi', 'Merging two single-element heaps'), small: true,
        data: { kind: 'min', a: [7], b: [3] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Total number of elements across both heaps — every example must have at least 10. */
    size: function (d) { return d.a.length + d.b.length; },
    /** Independent computation: no tree involved — the multiset is just the two input lists concatenated and
     * sorted, and the best value is a plain scan. `isLeftist` is the structural invariant a correct merge must
     * always leave standing. */
    reference: function (d) {
      var all = d.a.concat(d.b), total = all.length, best = null;
      for (var i = 0; i < all.length; i++) if (best === null || (d.kind === 'max' ? all[i] > best : all[i] < best)) best = all[i];
      return { totalCount: total, best: best, multiset: all.slice().sort(function (x, y) { return x - y; }), isLeftist: true };
    },
    random: function (level, r) {
      var kind = r() < 0.5 ? 'min' : 'max';
      var na = D.randInt(r, 0, 10), nb = D.randInt(r, 0, 10);
      if (na + nb < 10) nb = 10 - na + D.randInt(r, 0, 3);
      var lo = level === 'extreme' ? -1000 : 1, hi = level === 'extreme' ? 1000 : 99;
      var a = [], b = [], i;
      for (i = 0; i < na; i++) a.push(D.randInt(r, lo, hi));
      for (i = 0; i < nb; i++) b.push(D.randInt(r, lo, hi));
      return { kind: kind, a: a, b: b };
    },
    input: {
      hint: T('Örnek: kind=min a:9,5,12,3,15 b:7,20,2,11,18,6', 'Example: kind=min a:9,5,12,3,15 b:7,20,2,11,18,6'),
      parse: function (text) {
        var kind = 'min', a = null, b = null;
        String(text).trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
          var mk = /^kind[=:](min|max)$/i.exec(tok);
          if (mk) { kind = mk[1].toLowerCase(); return; }
          var ma = /^a[=:](.*)$/i.exec(tok);
          if (ma) { a = ma[1] ? ma[1].split(',').map(Number) : []; return; }
          var mb = /^b[=:](.*)$/i.exec(tok);
          if (mb) { b = mb[1] ? mb[1].split(',').map(Number) : []; return; }
          throw T('"' + tok + '" anlaşılmadı: kind=min/max, a:1,2,3 ya da b:1,2,3 yazın.', '"' + tok + '" is not understood: write kind=min/max, a:1,2,3, or b:1,2,3.');
        });
        if (a === null || b === null) throw T('Hem a: hem b: yazmalısınız (boş olabilir, ör. b:).', 'Both a: and b: must be given (either may be empty, e.g. b:).');
        if (a.concat(b).some(function (v) { return !Number.isFinite(v); })) throw T('Sayı olmayan bir değer var.', 'A value is not a number.');
        if (a.length + b.length < 1) throw T('En az bir değer yazın.', 'Write at least one value.');
        if (a.length + b.length > 25) throw T('En çok 25 değer (a + b).', 'At most 25 values total (a + b).');
        return { kind: kind, a: a, b: b };
      },
      format: function (d) { return 'kind=' + d.kind + ' a:' + d.a.join(',') + ' b:' + d.b.join(','); },
      tokens: function (d) { return d.a.concat(d.b).map(String); },
      bad: ['', 'kind=mid a:1 b:2', 'a:1,x b:2', 'a:1', 'b:2']
    },
    build: function (S, d) {
      var kind = d.kind;
      var CX = 420, TOPY = 60, LEVELGAP = 64, NODEW = 64, GAP = 60;
      var aItems = d.a.map(function (v, i) { return { id: 'a' + i, label: v }; });
      var bItems = d.b.map(function (v, i) { return { id: 'b' + i, label: v }; });

      function npl(node) { return node ? node.npl : -1; }
      function singleton(item) { return { id: item.id, key: item.label, left: null, right: null, npl: 0 }; }

      /** Shared merge, used both to build A and B silently and, with steps=true, for the taught A-with-B merge. */
      function merge(t1, t2, steps) {
        var dummy = { right: null }, cur = dummy, chain = [];
        while (t1 && t2) {
          var winner, loserKey = less(kind, t2.key, t1.key) ? t1.key : t2.key;
          if (!less(kind, t2.key, t1.key)) { winner = t1; t1 = t1.right; } else { winner = t2; t2 = t2.right; }
          cur.right = winner; cur = winner; chain.push(winner);
          if (steps) {
            cmp(winner.key + ' ' + LT + ' ' + loserKey + ' → splice');
            renderForest([dummy.right], [winner.id]);
            S.step(T('Sağ omurgaları karşılaştır: `' + winner.key + '` kazanır — zincire eklenir.',
                     'Compare the right spines: `' + winner.key + '` wins — it is spliced into the chain.'),
                   { c: [8, 9, 10, 11, 12], java: [8, 9, 10, 11, 12] });
            cmp(null);
          }
        }
        cur.right = t1 || t2;
        if (steps && chain.length) { renderForest([dummy.right]); S.step(T('Bir taraf tükendi: kalan alt ağaç doğrudan zincirin sonuna eklenir.', 'One side ran out: the remaining subtree is attached straight onto the end of the chain.'), { c: [14], java: [14] }); }
        for (var idx = chain.length - 1; idx >= 0; idx--) {
          var node = chain[idx];
          var swapped = npl(node.left) < npl(node.right);
          if (swapped) { var tmp = node.left; node.left = node.right; node.right = tmp; }
          node.npl = npl(node.right) + 1;
          if (steps) {
            cmp(swapped ? ('npl(left) < npl(right) → swap') : ('npl(left) ≥ npl(right) → stop'));
            renderForest([dummy.right], [node.id]);
            S.step(T('Yukarı doğru düzelt: `' + node.key + '` — ' + (swapped ? 'sol/sağ çocuklar yer değiştirir (sol daha uzundu)' : 'zaten sağ taraf kısa, değişiklik yok') + ', npl = ' + node.npl + '.',
                     'Fix bottom-up: `' + node.key + '` — ' + (swapped ? 'left/right children swap (the left side was longer)' : 'the right side is already the shorter one, no change') + ', npl = ' + node.npl + '.'),
                   { c: [17, 18, 19, 20, 21], java: [17, 18, 19, 20, 21] });
            cmp(null);
          }
        }
        return dummy.right;
      }
      function buildFromValues(items) {
        var h = null;
        items.forEach(function (it) { h = merge(h, singleton(it), false); });
        return h;
      }

      function layout(root) {
        var counter = { v: 0 }, positions = {};
        (function rec(node, depth) {
          if (!node) return;
          rec(node.left, depth + 1);
          positions[node.id] = { x: counter.v * NODEW, y: depth * LEVELGAP, key: node.key, npl: node.npl };
          counter.v++;
          rec(node.right, depth + 1);
        })(root, 0);
        return { positions: positions, width: Math.max(counter.v * NODEW, NODEW) };
      }
      // Edge ids are keyed by the CHILD (every node has at most one parent at a time), not by "parent+side":
      // splicing can reassign which node is a given parent's right child, and a side-keyed id would then keep
      // pointing at the old, now-unrelated child while the real new link never gets drawn. Keying by the child
      // lets a reparent just update `from`; a left/right swap between the same two children needs no change.
      function drawEdges(node) {
        if (!node) return;
        [node.left, node.right].forEach(function (child) {
          if (!child) return;
          var eid = 'edge_to_' + child.id;
          if (S.has(eid)) S.set(eid, { from: node.id }); else S.arrow(eid, { from: node.id, to: child.id, kind: 'center' });
          drawEdges(child);
        });
      }
      /** Render one or more trees side by side (each tree keeps its own in-order layout; slots never overlap). */
      function renderForest(roots, hi) {
        var list = roots.filter(Boolean), layouts = list.map(layout);
        var totalW = layouts.reduce(function (s, l) { return s + l.width; }, 0) + Math.max(0, list.length - 1) * GAP;
        var x = CX - totalW / 2;
        list.forEach(function (root, idx) {
          var lay = layouts[idx], offsetX = x;
          x += lay.width + GAP;
          Object.keys(lay.positions).forEach(function (id) {
            var p = lay.positions[id], ax = offsetX + p.x, ay = TOPY + p.y;
            var st = hi && hi.indexOf(id) >= 0 ? 'hl' : 'normal';
            var below = 'npl=' + p.npl;
            if (S.has(id)) S.set(id, { x: ax, y: ay, style: st, below: below });
            else S.circle(id, { x: ax, y: ay, text: String(p.key), style: st, below: below, r: 20 });
          });
          drawEdges(root);
        });
      }
      function info(text) { if (S.has('info')) S.set('info', { text: text }); else S.label('info', { x: CX, y: TOPY - 30, text: text, style: 'dim', size: 14 }); }
      function cmp(text) { if (text === null) { if (S.has('cmp')) S.remove('cmp'); return; } if (S.has('cmp')) S.set('cmp', { text: text }); else S.label('cmp', { x: CX, y: TOPY - 10, text: text, style: 'hl', size: 14, bold: true }); }
      var LT = kind === 'max' ? '>' : '<';

      var heapA = buildFromValues(aItems);
      info(T('A: ' + aItems.length + ' eleman', 'A: ' + aItems.length + ' elements'));
      if (heapA) renderForest([heapA]); else info(T('A boş', 'A is empty'));
      S.step(T('Solcu öbek (leftist heap) A: ' + aItems.length + ' eleman — her düğümün sol çocuğunun npl\'si (null path length: en yakın eksik çocuğa uzaklık) sağınkinden küçük değildir.',
               'Leftist heap A: ' + aItems.length + ' elements — every node\'s left child has an npl (null path length: distance to the nearest missing child) at least as large as the right\'s.'));

      var heapB = buildFromValues(bItems);
      info(T('A: ' + aItems.length + ' eleman, B: ' + bItems.length + ' eleman', 'A: ' + aItems.length + ' elements, B: ' + bItems.length + ' elements'));
      renderForest([heapA, heapB]);
      S.step(T('Solcu öbek B: ' + bItems.length + ' eleman. `merge(A, B)` iki adımda çalışır: (1) sağ omurgaları karşılaştıra karşılaştıra birleştir, (2) sonucu aşağıdan yukarı gezip kısa tarafı sağa al.',
               'Leftist heap B: ' + bItems.length + ' elements. `merge(A, B)` works in two passes: (1) splice the right spines together by comparison, (2) walk the result bottom-up and keep the shorter side on the right.'),
             { c: [4, 5, 6, 7, 15, 16], java: [4, 5, 6, 7, 15, 16] });

      var result = merge(heapA, heapB, true);
      info(T('Bitti', 'Done'));
      var totalCount = 0, best = null, multiset = [];
      (function walk(node) { if (!node) return; totalCount++; multiset.push(node.key); if (best === null || less(kind, node.key, best)) best = node.key; walk(node.left); walk(node.right); })(result);
      function checkLeftist(node) {
        if (!node) return true;
        if (node.left && less(kind, node.left.key, node.key)) return false;
        if (node.right && less(kind, node.right.key, node.key)) return false;
        if (npl(node.left) < npl(node.right)) return false;
        return checkLeftist(node.left) && checkLeftist(node.right);
      }
      multiset.sort(function (x, y) { return x - y; });
      if (result) renderForest([result]); else info(T('Sonuç boş', 'The result is empty'));
      S.result = { totalCount: totalCount, best: best, multiset: multiset, isLeftist: checkLeftist(result) };
      S.step(T('Bitti: birleşmiş solcu öbek, ' + totalCount + ' eleman, kökte en iyi değer: ' + best + '. `merge` maliyeti yalnızca sağ omurga uzunluklarına bağlı, O(log n) — ve `insert`/`extract` de aslında birer `merge` çağrısıdır.',
               'Done: the merged leftist heap, ' + totalCount + ' elements, the best value is at the root: ' + best + '. `merge` costs O(log n), bounded only by the right-spine lengths — and `insert`/`extract` are themselves just calls to `merge`.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
