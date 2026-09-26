/* Week 4 — binomial heap union: merge two root lists like binary addition. A binomial heap decomposes uniquely
 * into trees whose sizes are the set bits of its element count (order k has 2^k nodes). Union walks orders low to
 * high: one tree at an order passes through; two of the same order LINK (the worse root becomes a new leftmost
 * child of the better root) and the result carries to the next order, exactly like a carry bit. Rendered as a
 * forest of trees (circle + arrow) — a binomial heap is not array-backed, so there is no array view here.
 * Data: {kind: 'min'|'max', a: [...], b: [...]} — the two heaps being unioned. */
(function (D) {
  'use strict';
  var T = D.T;

  function less(kind, x, y) { return kind === 'max' ? x > y : x < y; }

  var C = [
    '/* link: the worse root becomes a new leftmost child of the better root */',
    'Node *link(Node *t1, Node *t2) {',
    '    Node *winner = better(t2->key, t1->key) ? t2 : t1;',
    '    Node *loser  = (winner == t1) ? t2 : t1;',
    '    loser->sibling = winner->child;',
    '    winner->child = loser;',
    '    winner->order++;',
    '    return winner;',
    '}',
    '',
    '/* union: merge two root lists like binary addition; a same-order pair produces a "carry" tree */',
    'Heap *union_heaps(RootList *a, RootList *b) {',
    '    RootList *result = NULL; Node *carry = NULL; int order = 0;',
    '    while (a || b || carry) {',
    '        Node *group[3]; int g = 0;',
    '        if (a && a->order == order) group[g++] = pop_front(&a);',
    '        if (b && b->order == order) group[g++] = pop_front(&b);',
    '        if (carry && carry->order == order) { group[g++] = carry; carry = NULL; }',
    '        if (g == 1) append(&result, group[0]);',
    '        else if (g == 2) carry = link(group[0], group[1]);',
    '        else if (g == 3) { append(&result, group[0]); carry = link(group[1], group[2]); }',
    '        order++;',
    '    }',
    '    return result;',
    '}'
  ];
  var J = [
    '// link: the worse root becomes a new leftmost child of the better root',
    'Node link(Node t1, Node t2) {',
    '    Node winner = better(t2.key, t1.key) ? t2 : t1;',
    '    Node loser  = (winner == t1) ? t2 : t1;',
    '    loser.sibling = winner.child;',
    '    winner.child = loser;',
    '    winner.order++;',
    '    return winner;',
    '}',
    '',
    '// union: merge two root lists like binary addition; a same-order pair produces a "carry" tree',
    'Heap unionHeaps(RootList a, RootList b) {',
    '    RootList result = null; Node carry = null; int order = 0;',
    '    while (a != null || b != null || carry != null) {',
    '        Node[] group = new Node[3]; int g = 0;',
    '        if (a != null && a.order == order) group[g++] = popFront(a);',
    '        if (b != null && b.order == order) group[g++] = popFront(b);',
    '        if (carry != null && carry.order == order) { group[g++] = carry; carry = null; }',
    '        if (g == 1) append(result, group[0]);',
    '        else if (g == 2) carry = link(group[0], group[1]);',
    '        else if (g == 3) { append(result, group[0]); carry = link(group[1], group[2]); }',
    '        order++;',
    '    }',
    '    return result;',
    '}'
  ];

  D.define({
    id: 'binomial-heap-union',
    title: T('Binom öbeğinde birleştirme (union)', 'Binomial heap union'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('Min: A (7 eleman, sıra 0/1/2) ∪ B (5 eleman, sıra 0/2) — örtüşme var, link\'ler oluşur', 'Min: A (7 elements, orders 0/1/2) ∪ B (5 elements, orders 0/2) — orders overlap, links happen'),
        data: { kind: 'min', a: [5, 3, 8, 1, 9, 2, 4], b: [12, 15, 11, 20, 7] } },
      { id: 'cascade', level: 'hard', name: T('Max: A ve B aynı sıralarda (0/1/2) — her sırada elde oluşur', 'Max: A and B share the same orders (0/1/2) — a carry forms at every order'),
        data: { kind: 'max', a: [10, 40, 25, 60, 15, 55, 30], b: [70, 20, 90, 35, 80, 45, 65] } },
      { id: 'empty-a', level: 'edge', name: T('A boş, B ile birleştirme (11 eleman)', 'A is empty, union with B (11 elements)'),
        data: { kind: 'min', a: [], b: [6, 19, 3, 27, 11, 8, 35, 14, 22, 9, 41] } },
      { id: 'full-cascade', level: 'edge', name: T('A (8, sıra 3) ∪ B (8, sıra 3): tek büyük elde zinciri', 'A (8, order 3) ∪ B (8, order 3): one long carry chain'),
        data: { kind: 'max', a: [5, 12, 3, 18, 9, 21, 7, 15], b: [30, 14, 26, 8, 33, 19, 25, 11] } },
      { id: 'all-equal', level: 'edge', name: T('Hepsi eşit: iki 6 elemanlı öbek, değer 7', 'All equal: two 6-element heaps, value 7'),
        data: { kind: 'min', a: [7, 7, 7, 7, 7, 7], b: [7, 7, 7, 7, 7, 7] } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler: 5 + 6 eleman', 'Extreme values: 5 + 6 elements'),
        data: { kind: 'min', a: [2147483647, -2147483648, 0, 1000000, -1000000], b: [5, -5, 2147483646, -2147483647, 1, -1] } },
      { id: 'single', level: 'edge', name: T('Tek eleman ∪ boş öbek', 'A single element ∪ an empty heap'), small: true,
        data: { kind: 'max', a: [42], b: [] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Total number of elements across both heaps — every example must have at least 10. */
    size: function (d) { return d.a.length + d.b.length; },
    /** Independent computation: a binomial heap of n elements always decomposes into trees whose orders are the
     * set bits of n, whatever the tie-breaking during linking — so union's order pattern is pure arithmetic on
     * na + nb, and the overall best value is just the minimum/maximum of every input value, no tree involved. */
    reference: function (d) {
      var all = d.a.concat(d.b), total = all.length;
      var best = null;
      for (var i = 0; i < all.length; i++) if (best === null || (d.kind === 'max' ? all[i] > best : all[i] < best)) best = all[i];
      var orders = [], t = total, o = 0;
      while (t > 0) { if (t & 1) orders.push(o); t = t >>> 1; o++; }
      return { totalCount: total, orders: orders, best: best };
    },
    random: function (level, r) {
      var kind = r() < 0.5 ? 'min' : 'max';
      var na = D.randInt(r, 0, 15), nb = D.randInt(r, 0, 15);
      if (na + nb < 10) nb = 10 - na + D.randInt(r, 0, 3);
      var lo = level === 'extreme' ? -1000 : 1, hi = level === 'extreme' ? 1000 : 99;
      var a = [], b = [], i;
      for (i = 0; i < na; i++) a.push(D.randInt(r, lo, hi));
      for (i = 0; i < nb; i++) b.push(D.randInt(r, lo, hi));
      return { kind: kind, a: a, b: b };
    },
    input: {
      hint: T('Örnek: kind=min a:5,3,8,1,9,2,4 b:12,15,11,20,7,18,13,25', 'Example: kind=min a:5,3,8,1,9,2,4 b:12,15,11,20,7,18,13,25'),
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
        if (a.length + b.length > 31) throw T('En çok 31 değer (a + b).', 'At most 31 values total (a + b).');
        return { kind: kind, a: a, b: b };
      },
      format: function (d) { return 'kind=' + d.kind + ' a:' + d.a.join(',') + ' b:' + d.b.join(','); },
      tokens: function (d) { return d.a.concat(d.b).map(String); },
      bad: ['', 'kind=mid a:1 b:2', 'a:1,x b:2', 'a:1', 'b:2']
    },
    build: function (S, d) {
      var kind = d.kind;
      var CX = 420, TOPY = 60, LEVELGAP = 66, LEAFW = 50, GAP = 34;
      var aItems = d.a.map(function (v, i) { return { id: 'a' + i, label: v }; });
      var bItems = d.b.map(function (v, i) { return { id: 'b' + i, label: v }; });

      function link(t1, t2) {
        var t2Better = less(kind, t2.label, t1.label);
        var winner = t2Better ? t2 : t1, loser = t2Better ? t1 : t2;
        if (!S.has('edge_' + loser.id)) S.arrow('edge_' + loser.id, { from: winner.id, to: loser.id, kind: 'center' });
        return { id: winner.id, label: winner.label, children: [loser].concat(winner.children) };
      }
      function buildOrderTree(items) {
        if (items.length === 1) return { id: items[0].id, label: items[0].label, children: [] };
        var half = items.length / 2;
        return link(buildOrderTree(items.slice(0, half)), buildOrderTree(items.slice(half)));
      }
      function decompose(items) {
        var n = items.length, trees = [], idx = 0, order = 0;
        while (n > 0) { if (n & 1) { var size = 1 << order; trees.push({ order: order, tree: buildOrderTree(items.slice(idx, idx + size)) }); idx += size; } n = n >>> 1; order++; }
        return trees;
      }
      function layoutLocal(root) {
        var cursor = { v: 0 }, positions = {};
        (function rec(node, depth) {
          if (!node.children.length) { positions[node.id] = { x: cursor.v, y: depth * LEVELGAP, label: node.label }; cursor.v += LEAFW; return; }
          node.children.forEach(function (c) { rec(c, depth + 1); });
          var xs = node.children.map(function (c) { return positions[c.id].x; });
          positions[node.id] = { x: (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, y: depth * LEVELGAP, label: node.label };
        })(root, 0);
        var rootX = positions[root.id].x;
        Object.keys(positions).forEach(function (id) { positions[id].x -= rootX; });
        return { positions: positions, width: Math.max(cursor.v, LEAFW) };
      }
      function renderForest(list, hi) {
        var locals = list.map(function (item) { return layoutLocal(item.tree); });
        var totalW = locals.reduce(function (s, l) { return s + l.width; }, 0) + Math.max(0, locals.length - 1) * GAP;
        var x = CX - totalW / 2;
        locals.forEach(function (l) {
          var slotCenter = x + l.width / 2; x += l.width + GAP;
          Object.keys(l.positions).forEach(function (id) {
            var p = l.positions[id], ax = slotCenter + p.x, ay = TOPY + p.y;
            var st = hi && hi.indexOf(id) >= 0 ? 'hl' : 'normal';
            if (S.has(id)) S.set(id, { x: ax, y: ay, style: st }); else S.circle(id, { x: ax, y: ay, text: String(p.label), style: st, r: 20 });
          });
        });
      }
      function ordersOf(list) { return list.map(function (t) { return t.order; }).sort(function (x, y) { return x - y; }); }
      function info(text) { if (S.has('info')) S.set('info', { text: text }); else S.label('info', { x: CX, y: TOPY - 34, text: text, style: 'dim', size: 14 }); }
      function cmp(text) { if (text === null) { if (S.has('cmp')) S.remove('cmp'); return; } if (S.has('cmp')) S.set('cmp', { text: text }); else S.label('cmp', { x: CX, y: TOPY - 14, text: text, style: 'hl', size: 14, bold: true }); }

      var fa = decompose(aItems), fb = decompose(bItems);
      info(T('A: ' + aItems.length + ' eleman', 'A: ' + aItems.length + ' elements'));
      renderForest(fa);
      S.step(T('Binom öbeği A: ' + aItems.length + ' eleman, sıralar [' + ordersOf(fa).join(', ') + '] — eleman sayısının ikilik tabandaki 1 bitleri.',
               'Binomial heap A: ' + aItems.length + ' elements, orders [' + ordersOf(fa).join(', ') + '] — the set bits of the element count, in binary.'));
      info(T('A: ' + aItems.length + ' eleman, B: ' + bItems.length + ' eleman', 'A: ' + aItems.length + ' elements, B: ' + bItems.length + ' elements'));
      var initCombined = fa.concat(fb).sort(function (x, y) { return x.order - y.order; });
      renderForest(initCombined);
      S.step(T('Binom öbeği B: ' + bItems.length + ' eleman, sıralar [' + ordersOf(fb).join(', ') + ']. `union(A, B)` kök listelerini ikilik toplama gibi birleştirir: aynı sıradan bir çift, bir sonraki sıraya ELDE (carry) olan bir ağaca link\'lenir.',
               'Binomial heap B: ' + bItems.length + ' elements, orders [' + ordersOf(fb).join(', ') + ']. `union(A, B)` merges the root lists like binary addition: a same-order pair links into a tree that CARRIES to the next order.'),
             { c: [11, 12, 13], java: [11, 12, 13] });

      function fromLabel(tag, lang) { return tag === 'CARRY' ? (lang === 'tr' ? 'elde' : 'the carry') : tag; }

      var i = 0, j = 0, carry = null, doneTrees = [], k = 0;
      while (i < fa.length || j < fb.length || carry) {
        var group = [];
        if (i < fa.length && fa[i].order === k) { group.push({ tree: fa[i].tree, from: 'A' }); i++; }
        if (j < fb.length && fb[j].order === k) { group.push({ tree: fb[j].tree, from: 'B' }); j++; }
        if (carry && carry.order === k) { group.push({ tree: carry.tree, from: 'CARRY' }); carry = null; }
        if (group.length) {
          var hiIds = group.map(function (g) { return g.tree.id; });
          if (group.length === 1) {
            doneTrees.push({ order: k, tree: group[0].tree });
            var combined1 = doneTrees.concat(fa.slice(i)).concat(fb.slice(j)).sort(function (x, y) { return x.order - y.order; });
            renderForest(combined1, hiIds);
            S.step(T('Sıra ' + k + ': yalnızca ' + fromLabel(group[0].from, 'tr') + '\'dan bir ağaç var, eşi yok — doğrudan sonuca geçer.',
                     'Order ' + k + ': only a tree from ' + fromLabel(group[0].from, 'en') + ', no partner — it passes straight through to the result.'),
                   { c: [15, 20], java: [15, 20] });
          } else if (group.length === 2) {
            cmp(group[0].tree.label + ' vs ' + group[1].tree.label + ' → link');
            var merged = link(group[0].tree, group[1].tree);
            carry = { order: k + 1, tree: merged };
            var combined2 = doneTrees.concat(fa.slice(i)).concat(fb.slice(j)).concat([carry]).sort(function (x, y) { return x.order - y.order; });
            renderForest(combined2, [merged.id]);
            S.step(T('Sıra ' + k + ': ' + fromLabel(group[0].from, 'tr') + ' ve ' + fromLabel(group[1].from, 'tr') + '\'den birer ağaç var — link edilirler (kök karşılaştırılır, iyi olan kazanır), sonuç sıra ' + (k + 1) + ' bir ağaç: bir sonraki sıraya ELDE olarak taşınır.',
                     'Order ' + k + ': one tree from ' + fromLabel(group[0].from, 'en') + ' and one from ' + fromLabel(group[1].from, 'en') + ' — they link (roots compared, the better one wins), producing an order-' + (k + 1) + ' tree: it CARRIES to the next order.'),
                   { c: [2, 3, 4, 5, 6, 7, 21], java: [2, 3, 4, 5, 6, 7, 21] });
            cmp(null);
          } else {
            doneTrees.push({ order: k, tree: group[0].tree });
            cmp(group[1].tree.label + ' vs ' + group[2].tree.label + ' → link');
            var merged3 = link(group[1].tree, group[2].tree);
            carry = { order: k + 1, tree: merged3 };
            var combined3 = doneTrees.concat(fa.slice(i)).concat(fb.slice(j)).concat([carry]).sort(function (x, y) { return x.order - y.order; });
            renderForest(combined3, hiIds);
            S.step(T('Sıra ' + k + ': üç ağaç var (A, B ve gelen elde) — biri doğrudan sonuca geçer, diğer ikisi link\'lenip sıra ' + (k + 1) + '\'e yeni bir elde olarak taşınır.',
                     'Order ' + k + ': three trees meet (A, B, and an incoming carry) — one passes straight through, the other two link into a new carry for order ' + (k + 1) + '.'),
                   { c: [15, 16, 17, 21, 22], java: [15, 16, 17, 21, 22] });
            cmp(null);
          }
        }
        k++;
      }
      doneTrees.sort(function (x, y) { return x.order - y.order; });
      renderForest(doneTrees);
      var totalCount = 0, best = null;
      doneTrees.forEach(function (dt) {
        (function walk(node) { totalCount++; if (best === null || less(kind, node.label, best)) best = node.label; node.children.forEach(walk); })(dt.tree);
      });
      info(T('Bitti: ' + totalCount + ' eleman', 'Done: ' + totalCount + ' elements'));
      S.result = { totalCount: totalCount, orders: ordersOf(doneTrees), best: best };
      S.step(T('Bitti: birleşmiş öbek, sıralar [' + ordersOf(doneTrees).join(', ') + '], toplam ' + totalCount + ' eleman. En iyi değer (' + best + ') bir kökte — her binom ağacının kökü, kendi alt ağacındaki en iyi değerdir. `union` maliyeti O(log n): en fazla log n sıra gezilir.',
               'Done: the unioned heap, orders [' + ordersOf(doneTrees).join(', ') + '], ' + totalCount + ' elements total. The best value (' + best + ') sits at some root — every binomial tree\'s root is the best value in its own subtree. `union` costs O(log n): at most log n orders are visited.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
