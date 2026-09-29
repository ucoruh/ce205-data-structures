/* Week 9 -- Kruskal's minimum spanning tree: sort every edge by weight, then scan it in that order and add it
 * to the tree with UNION-FIND (union by rank + path compression, as in union-find.js) unless it would close a
 * cycle. Ties keep the input order (a stable sort), so the result is fully deterministic. Vertices sit in a ring
 * (week 5's circle layout); weights are written on the edges. If the graph is disconnected, Kruskal still finishes
 * and produces a minimum spanning FOREST (one tree per component). */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_V 32',
    '#define MAX_E 64',
    'typedef struct { int a, b, w; } Edge;',
    '',
    'int parent_of[MAX_V], rank_of[MAX_V];',
    '',
    'int find(int v) {',
    '    int root = v;',
    '    while (parent_of[root] != root) root = parent_of[root];',
    '    while (parent_of[v] != root) { int next = parent_of[v]; parent_of[v] = root; v = next; }',
    '    return root;',
    '}',
    '',
    'void union_sets(int a, int b) {',
    '    int ra = find(a), rb = find(b);',
    '    if (rank_of[ra] < rank_of[rb]) parent_of[ra] = rb;',
    '    else if (rank_of[ra] > rank_of[rb]) parent_of[rb] = ra;',
    '    else { parent_of[rb] = ra; rank_of[ra]++; }',
    '}',
    '',
    'int cmp_weight(const void *x, const void *y) { return ((Edge *)x)->w - ((Edge *)y)->w; }',
    '',
    'int kruskal_mst(int vertex_count, Edge *sorted, int edge_count, Edge *mst_out, int *total_out) {',
    '    for (int v = 0; v < vertex_count; v++) { parent_of[v] = v; rank_of[v] = 0; }',
    '    qsort(sorted, edge_count, sizeof(Edge), cmp_weight);   /* ascending by weight, stable ties */',
    '    int mst_len = 0, total = 0;',
    '    for (int i = 0; i < edge_count; i++) {',
    '        if (find(sorted[i].a) == find(sorted[i].b)) continue;    /* would close a cycle */',
    '        union_sets(sorted[i].a, sorted[i].b);',
    '        mst_out[mst_len] = sorted[i]; mst_len++;',
    '        total += sorted[i].w;',
    '    }',
    '    *total_out = total;',
    '    return mst_len;',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    'static final int MAX_E = 64;',
    'static class Edge { int a, b, w; }',
    '',
    'int[] parentOf = new int[MAX_V], rankOf = new int[MAX_V];',
    '',
    'int find(int v) {',
    '    int root = v;',
    '    while (parentOf[root] != root) root = parentOf[root];',
    '    while (parentOf[v] != root) { int next = parentOf[v]; parentOf[v] = root; v = next; }',
    '    return root;',
    '}',
    '',
    'void unionSets(int a, int b) {',
    '    int ra = find(a), rb = find(b);',
    '    if (rankOf[ra] < rankOf[rb]) parentOf[ra] = rb;',
    '    else if (rankOf[ra] > rankOf[rb]) parentOf[rb] = ra;',
    '    else { parentOf[rb] = ra; rankOf[ra]++; }',
    '}',
    '',
    'int cmpWeight(Edge x, Edge y) { return x.w - y.w; }',
    '',
    'int kruskalMst(int vertexCount, Edge[] sorted, int edgeCount, Edge[] mstOut, int[] totalOut) {',
    '    for (int v = 0; v < vertexCount; v++) { parentOf[v] = v; rankOf[v] = 0; }',
    '    Arrays.sort(sorted, 0, edgeCount, this::cmpWeight);     // ascending by weight, stable ties',
    '    int mstLen = 0, total = 0;',
    '    for (int i = 0; i < edgeCount; i++) {',
    '        if (find(sorted[i].a) == find(sorted[i].b)) continue;      // would close a cycle',
    '        unionSets(sorted[i].a, sorted[i].b);',
    '        mstOut[mstLen] = sorted[i]; mstLen++;',
    '        total += sorted[i].w;',
    '    }',
    '    totalOut[0] = total;',
    '    return mstLen;',
    '}'
  ];
  /* Positions (1-indexed, C_CODE/JAVA_CODE mirror line-for-line): 21=cmp_weight definition, 25=qsort call,
   * 27=for(i) [COND, the main scan], 28=if(find(a)==find(b)) continue [COND -- TRUE means the edge closes a
   * cycle and the rest of the loop body (29-31) is skipped by the `continue`], 29=union_sets call,
   * 30=mst_out[]=..., 31=total+=..., 33-34=the function's real ending. Earlier versions pointed L_CYCLE and
   * L_DONE at unrelated lines (26 twice for L_CYCLE, 31-32 -- the loop's OWN tail -- for L_DONE, which should
   * be the function's actual return) and never annotated the real cycle-check line (28) at all -- fixed
   * below, same "point at the line that actually decided this" fix as the other week 9 files. */
  function LN(arr) { return { c: arr, java: arr }; }
  var L_INIT = LN([21, 25]);
  var NOTE_LOOP_EDGE = T('i < edge_count mi? evet -- sıradaki kenara bakılıyor', 'i < edge_count? yes -- looking at the next edge');
  var L_CYCLE = LN([{ n: 27, note: NOTE_LOOP_EDGE }, { n: 28, note: T('find(a) == find(b) mi? evet -- aynı ağaç, döngü kapanır', 'find(a) == find(b)? yes -- same tree, would close a cycle') }, { n: 29, skip: true }]);
  var L_ADD = LN([{ n: 27, note: NOTE_LOOP_EDGE }, { n: 28, note: T('find(a) == find(b) mi? hayır -- farklı ağaçlar', 'find(a) == find(b)? no -- different trees') }, 29, 30, 31]);
  var L_DONE = { c: [33, 34], java: [33, 34] };

  var EDGE_RE = /^([A-Za-z0-9]{1,3})-([A-Za-z0-9]{1,3}):(\d+)$/;
  function parseWG(text) {
    var toks = String(text).trim().split(/\s+/).filter(Boolean);
    if (!toks.length) throw T('En az bir kenar yazın: A-B:AĞIRLIK ...', 'Write at least one edge: A-B:WEIGHT ...');
    var edges = [];
    for (var i = 0; i < toks.length; i++) {
      var m = EDGE_RE.exec(toks[i]);
      if (!m) throw T('"' + toks[i] + '" anlaşılmadı: yönsüz ağırlıklı kenar VERTEX-VERTEX:AĞIRLIK biçiminde olmalı.', '"' + toks[i] + '" is not understood: an undirected weighted edge must look like VERTEX-VERTEX:WEIGHT.');
      if (m[1] === m[2]) throw T('Bir düğüm kendine kenar veremez: "' + toks[i] + '".', 'A vertex cannot have an edge to itself: "' + toks[i] + '".');
      edges.push({ a: m[1], b: m[2], w: parseInt(m[3], 10) });
    }
    return { edges: edges };
  }
  function formatWG(d) { return d.edges.map(function (e) { return e.a + '-' + e.b + ':' + e.w; }).join(' '); }
  function verticesOf(edges) { var s = {}; edges.forEach(function (e) { s[e.a] = 1; s[e.b] = 1; }); return Object.keys(s).sort(); }
  function layoutCircle(vertices) {
    var n = vertices.length, R = Math.max(140, 16 * n), cx = R + 46, cy = R + 46, pos = {};
    vertices.forEach(function (v, i) { var ang = -Math.PI / 2 + i * 2 * Math.PI / n; pos[v] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }; });
    return { pos: pos, cx: cx, cy: cy, R: R };
  }
  function label(i) { var s = '', n = i + 1; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }

  /** Independent computation: array-indexed union-find (integers, not labels) with a plain recursive
   *  path-compressing find -- a different representation from build()'s label-keyed, iterative-find version. */
  function kruskalRef(edges) {
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    var V = Object.keys(vset).sort();
    var idx = {}; V.forEach(function (v, i) { idx[v] = i; });
    var parent = V.map(function (_, i) { return i; }), rank = V.map(function () { return 0; });
    function find(x) { if (parent[x] === x) return x; var r = find(parent[x]); parent[x] = r; return r; }
    var sorted = edges.map(function (e, i) { return { a: idx[e.a], b: idx[e.b], w: e.w, orig: e, i: i }; })
      .sort(function (p, q) { return p.w - q.w || p.i - q.i; });
    var mst = [], total = 0;
    sorted.forEach(function (e) {
      var ra = find(e.a), rb = find(e.b);
      if (ra === rb) return;
      if (rank[ra] < rank[rb]) parent[ra] = rb;
      else if (rank[ra] > rank[rb]) parent[rb] = ra;
      else { parent[rb] = ra; rank[ra]++; }
      mst.push(e.orig); total += e.w;
    });
    return { edges: mst, totalWeight: total };
  }

  D.define({
    id: 'kruskal-mst',
    title: T('Kruskal en küçük yayılan ağaç (MST)', 'Kruskal\'s minimum spanning tree'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('7 düğüm, 10 kenar, tek bileşen', '7 vertices, 10 edges, one component'),
        data: { edges: [
          { a: 'A', b: 'B', w: 4 }, { a: 'A', b: 'C', w: 2 }, { a: 'B', b: 'C', w: 1 }, { a: 'B', b: 'D', w: 5 },
          { a: 'C', b: 'D', w: 8 }, { a: 'C', b: 'E', w: 10 }, { a: 'D', b: 'E', w: 2 }, { a: 'D', b: 'F', w: 6 },
          { a: 'E', b: 'F', w: 3 }, { a: 'E', b: 'G', w: 7 }
        ] } },
      { id: 'hard', level: 'hard', name: T('9 düğüm, 14 kenar, birçok eşit ağırlık (giriş sırası bozar)', '9 vertices, 14 edges, many tied weights (input order breaks ties)'),
        data: { edges: [
          { a: 'A', b: 'B', w: 3 }, { a: 'A', b: 'C', w: 3 }, { a: 'B', b: 'C', w: 3 }, { a: 'B', b: 'D', w: 5 },
          { a: 'C', b: 'D', w: 3 }, { a: 'C', b: 'E', w: 6 }, { a: 'D', b: 'E', w: 3 }, { a: 'D', b: 'F', w: 4 },
          { a: 'E', b: 'F', w: 3 }, { a: 'F', b: 'G', w: 2 }, { a: 'F', b: 'H', w: 3 }, { a: 'G', b: 'H', w: 1 },
          { a: 'H', b: 'I', w: 3 }, { a: 'G', b: 'I', w: 5 }
        ] } },
      { id: 'disconnected', level: 'edge', name: T('Uç: 10 kenar, 2 bileşen -- sonuç bir orman (spanning FOREST)', 'Edge case: 10 edges, 2 components -- the result is a spanning FOREST'),
        data: { edges: [
          { a: 'A', b: 'B', w: 2 }, { a: 'B', b: 'C', w: 4 }, { a: 'A', b: 'C', w: 5 }, { a: 'C', b: 'D', w: 1 },
          { a: 'D', b: 'E', w: 3 },
          { a: 'F', b: 'G', w: 2 }, { a: 'G', b: 'H', w: 6 }, { a: 'F', b: 'H', w: 7 }, { a: 'H', b: 'I', w: 3 },
          { a: 'I', b: 'J', w: 4 }
        ] } },
      { id: 'two-vertices', level: 'edge', name: T('Uç: 2 düğüm, 1 kenar', 'Edge case: 2 vertices, 1 edge'),
        data: { edges: [{ a: 'A', b: 'B', w: 9 }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.edges.length; },
    reference: function (d) { return kruskalRef(d.edges); },
    random: function (level, r) {
      var n = { easy: 6, normal: 8, hard: 10, extreme: 12 }[level] || 8;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var m = { easy: 10, normal: 11, hard: 15, extreme: 18 }[level] || 11;
      var wHi = level === 'extreme' ? 99 : 20;
      var edges = [], seen = {};
      for (var i2 = 1; i2 < n; i2++) { var j = D.randInt(r, 0, i2 - 1); edges.push({ a: vertices[j], b: vertices[i2], w: D.randInt(r, 1, wHi) }); seen[vertices[j] + '|' + vertices[i2]] = 1; }
      var guard = 0;
      while (edges.length < m && guard < 1000) {
        guard++;
        var x = vertices[D.randInt(r, 0, n - 1)], y = vertices[D.randInt(r, 0, n - 1)];
        if (x === y) continue;
        var key = [x, y].sort().join('|');
        if (seen[key]) continue;
        edges.push({ a: x, b: y, w: D.randInt(r, 1, wHi) }); seen[key] = 1;
      }
      return { edges: edges };
    },
    input: {
      hint: T('Örnek: A-B:4 B-C:2 A-C:5   (her kenar yönsüz ve ağırlıklı, VERTEX-VERTEX:AĞIRLIK)', 'Example: A-B:4 B-C:2 A-C:5   (every edge is undirected and weighted, VERTEX-VERTEX:WEIGHT)'),
      parse: parseWG,
      format: formatWG,
      bad: ['', 'A-B', 'A-A:4', 'A>B:3', 'A-B:x']
    },
    build: function (S, d) {
      var edges = d.edges, V = verticesOf(edges);
      var lay = layoutCircle(V), pos = lay.pos, cx = lay.cx, cy = lay.cy, R = lay.R;
      V.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: 'empty' }); });
      edges.forEach(function (e, idx) { S.arrow('e' + idx, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: false, text: String(e.w), style: 'dim' }); });

      var idxOf = {}; V.forEach(function (v, i) { idxOf[v] = i; });
      var ROWX0 = 40, STEP = 62, CW = 54, CH = 36;
      /* keep the sorted-edges row's width close to the graph's own width, so the strip export (which scales the
       * whole scene to a fixed thumbnail width) does not shrink the graph to make room for a much wider row */
      var COLS = Math.max(3, Math.floor((2 * R + 92 - ROWX0) / STEP));
      var edgeRows = Math.max(1, Math.ceil(edges.length / COLS));
      var SY = cy + R + 66, PY = SY + edgeRows * (CH + 8) + 48;
      S.label('slbl', { x: ROWX0 - 14, y: SY + 24, text: T('sıralı kenarlar =', 'sorted edges ='), anchor: 'end', size: 14, mono: true });
      S.label('plbl', { x: ROWX0 - 14, y: PY + 24, text: T('ebeveyn[] =', 'parent[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('p' + i, { x: ROWX0 + i * 44, y: PY, w: 36, h: CH, text: v, style: 'new', size: 14, above: v }); });
      S.label('wlbl', { x: cx, y: PY + CH + 56, text: T('MST ağırlığı = 0', 'MST weight = 0'), anchor: 'middle', size: 17, bold: true, mono: true });

      var sorted = edges.map(function (e, i) { return { a: e.a, b: e.b, w: e.w, i: i, ei: i }; }).sort(function (p, q) { return p.w - q.w || p.i - q.i; });
      sorted.forEach(function (e, k) { S.box('s' + k, { x: ROWX0 + (k % COLS) * STEP, y: SY + Math.floor(k / COLS) * (CH + 8), w: CW, h: CH, text: e.a + '-' + e.b + ':' + e.w, style: 'empty', size: 13 }); });
      S.step(T('Bütün kenarlar AĞIRLIĞA göre sıralanır (eşitlikte giriş sırası korunur): ' + sorted.map(function (e) { return e.a + '-' + e.b; }).join(', ') + '.',
               'Every edge is sorted by WEIGHT (ties keep the input order): ' + sorted.map(function (e) { return e.a + '-' + e.b; }).join(', ') + '.'), L_INIT);

      var parent = {}, rank = {}; V.forEach(function (v) { parent[v] = v; rank[v] = 0; });
      function find(v) { var root = v; while (parent[root] !== root) root = parent[root]; while (parent[v] !== root) { var nx = parent[v]; parent[v] = root; v = nx; } return root; }
      function refreshParent() { V.forEach(function (v, i) { S.set('p' + i, { text: parent[v], style: parent[v] === v ? 'new' : 'normal' }); }); }

      var mst = [], total = 0;
      sorted.forEach(function (e, k) {
        S.set('s' + k, { style: 'hl' });
        var ra = find(e.a), rb = find(e.b);
        refreshParent();
        if (ra === rb) {
          S.set('s' + k, { style: 'del' }); S.set('e' + e.ei, { style: 'del' });
          S.step(T('`' + e.a + '-' + e.b + ':' + e.w + '` -- `find(' + e.a + ')` = `find(' + e.b + ')` = `' + ra + '`: ikisi de zaten aynı ağaçta, eklenirse DÖNGÜ oluşur -- atlanır.',
                   '`' + e.a + '-' + e.b + ':' + e.w + '` -- `find(' + e.a + ')` = `find(' + e.b + ')` = `' + ra + '`: both are already in the same tree, adding it would close a CYCLE -- skipped.'), L_CYCLE);
          S.set('e' + e.ei, { style: 'dim' });
        } else {
          if (rank[ra] < rank[rb]) parent[ra] = rb; else if (rank[ra] > rank[rb]) parent[rb] = ra; else { parent[rb] = ra; rank[ra]++; }
          refreshParent();
          S.set('s' + k, { style: 'new' }); S.set('e' + e.ei, { style: 'new' });
          mst.push({ a: e.a, b: e.b, w: e.w }); total += e.w;
          S.set('wlbl', { text: T('MST ağırlığı = ' + total, 'MST weight = ' + total) });
          S.step(T('`' + e.a + '-' + e.b + ':' + e.w + '` -- farklı ağaçlar (`' + ra + '`, `' + rb + '`): MST\'ye eklenir, `union_sets` çağrılır. Toplam ağırlık şimdi ' + total + '.',
                   '`' + e.a + '-' + e.b + ':' + e.w + '` -- different trees (`' + ra + '`, `' + rb + '`): added to the MST, `union_sets` is called. Total weight is now ' + total + '.'), L_ADD);
        }
        S.set('s' + k, { style: mst.some(function (m2) { return m2.a === e.a && m2.b === e.b; }) ? 'normal' : 'dim' });
      });
      var comps = {}; V.forEach(function (v) { (comps[find(v)] = comps[find(v)] || []).push(v); });
      var nc = Object.keys(comps).length;
      S.result = { edges: mst, totalWeight: total };
      S.step(T('Bitti: ' + mst.length + ' kenar seçildi, toplam ağırlık ' + total + (nc > 1 ? '. Çizge bağlı değildi: sonuç ' + nc + ' bileşenli bir yayılan ORMAN.' : '. Tek bir yayılan ağaç.'),
               'Done: ' + mst.length + ' edges chosen, total weight ' + total + (nc > 1 ? '. The graph was not connected: the result is a spanning FOREST with ' + nc + ' components.' : '. A single spanning tree.')), L_DONE);
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
