/* Week 9 -- Prim's minimum spanning tree: grow ONE tree from a start vertex. A "priority queue" row holds every
 * vertex not yet in the tree together with its current best key (the cheapest edge weight connecting it to the
 * tree so far); each round the row's minimum is picked (ties broken alphabetically) and its neighbours' keys are
 * relaxed. Same weighted, undirected, start-vertex input as week 5's bfs.js, plus ":WEIGHT" on every edge. Unlike
 * Kruskal, Prim only grows from `start`: vertices in another component never enter the tree (key stays inf). */
(function (D) {
  'use strict';
  var T = D.T;
  var INF = 'inf';

  var C_CODE = [
    '#define MAX_V 32',
    '#define INF 1000000000',
    'typedef struct { int a, b, w; } Edge;',
    '',
    'int key_of[MAX_V], parent_of[MAX_V], in_mst[MAX_V];',
    '',
    'int min_key_vertex(int vertex_count) {',
    '    int best = -1, best_key = INF;',
    '    for (int v = 0; v < vertex_count; v++)',
    '        if (!in_mst[v] && key_of[v] < best_key) { best_key = key_of[v]; best = v; }',
    '    return best;',
    '}',
    '',
    'int prim_mst(Graph *g, int start, Edge *mst_out, int *total_out) {',
    '    for (int v = 0; v < g->vertex_count; v++) { key_of[v] = INF; in_mst[v] = 0; parent_of[v] = -1; }',
    '    key_of[start] = 0;',
    '    int mst_len = 0, total = 0;',
    '    for (int count = 0; count < g->vertex_count; count++) {',
    '        int u = min_key_vertex(g->vertex_count);',
    '        if (u == -1 || key_of[u] == INF) break;         /* nothing left reachable */',
    '        in_mst[u] = 1;',
    '        if (parent_of[u] != -1) {',
    '            mst_out[mst_len].a = parent_of[u]; mst_out[mst_len].b = u; mst_out[mst_len].w = key_of[u];',
    '            mst_len++; total += key_of[u];',
    '        }',
    '        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next)      /* alphabetical order */',
    '            if (!in_mst[n->to] && n->weight < key_of[n->to]) { key_of[n->to] = n->weight; parent_of[n->to] = u; }',
    '    }',
    '    *total_out = total;',
    '    return mst_len;',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    'static final int INF = 1000000000;',
    'static class Edge { int a, b, w; }',
    '',
    'int[] keyOf = new int[MAX_V], parentOf = new int[MAX_V]; boolean[] inMst = new boolean[MAX_V];',
    '',
    'int minKeyVertex(int vertexCount) {',
    '    int best = -1, bestKey = INF;',
    '    for (int v = 0; v < vertexCount; v++)',
    '        if (!inMst[v] && keyOf[v] < bestKey) { bestKey = keyOf[v]; best = v; }',
    '    return best;',
    '}',
    '',
    'int primMst(Graph g, int start, Edge[] mstOut, int[] totalOut) {',
    '    for (int v = 0; v < g.vertexCount; v++) { keyOf[v] = INF; inMst[v] = false; parentOf[v] = -1; }',
    '    keyOf[start] = 0;',
    '    int mstLen = 0, total = 0;',
    '    for (int count = 0; count < g.vertexCount; count++) {',
    '        int u = minKeyVertex(g.vertexCount);',
    '        if (u == -1 || keyOf[u] == INF) break;           // nothing left reachable',
    '        inMst[u] = true;',
    '        if (parentOf[u] != -1) {',
    '            mstOut[mstLen].a = parentOf[u]; mstOut[mstLen].b = u; mstOut[mstLen].w = keyOf[u];',
    '            mstLen++; total += keyOf[u];',
    '        }',
    '        for (AdjNode n = g.adj[u]; n != null; n = n.next)         // alphabetical order',
    '            if (!inMst[n.to] && n.weight < keyOf[n.to]) { keyOf[n.to] = n.weight; parentOf[n.to] = u; }',
    '    }',
    '    totalOut[0] = total;',
    '    return mstLen;',
    '}'
  ];
  /* Positions (1-indexed, C_CODE/JAVA_CODE mirror line-for-line): 8-10=min_key_vertex's own scan (best=-1,
   * for(v), if better), 15=reset key/inMst/parent (ONE-TIME), 19=call min_key_vertex, 20=if(u==-1||key==INF)
   * break [COND], 21=inMst[u]=1, 22=if(parent[u]!=-1) [COND], 23-24=add the edge to the MST, 26=for(n)
   * [COND], 27=if(!inMst && weight<key) [COND, relax]. Earlier versions re-showed line 20 (the break-check,
   * which already ran in the PICK step) as if it ran AGAIN in the ADD/ROOT steps, marked line 21
   * (`inMst[u]=1`, which ALWAYS runs) as skipped for the root case instead of the real not-taken line (23),
   * and never annotated the actual relax condition (27) at all -- fixed below. */
  function LN(arr) { return { c: arr, java: arr }; }
  var L_INIT = LN([{ n: 15, note: T('v < vertex_count mi? evet -- her düğüm için key[v]=inf', 'v < vertex_count? yes -- key[v]=inf for every vertex') }, 16]);
  var NOTE_SCAN_V = T('v < vertex_count mi? evet -- en küçük anahtarlı düğüm aranıyor', 'v < vertex_count? yes -- scanning for the smallest key');
  var L_PICK = LN([19, 8, { n: 9, note: NOTE_SCAN_V }, { n: 10, note: T('inMst[v] değilse ve key[v] daha küçükse mi? -- en iyi aday güncellenir', 'not inMst[v] and key[v] smaller? -- the best candidate is updated') },
                   { n: 20, note: T('u != -1 mi? evet -- devam', 'u != -1? yes -- continue') }]);
  var L_NOMORE = LN([19, 8, { n: 9, note: NOTE_SCAN_V }, { n: 10, note: T('inMst[v] değilse ve key[v] daha küçükse mi? -- hiçbiri değil', 'not inMst[v] and key[v] smaller? -- none is') },
                     { n: 20, note: T('u == -1 mi? evet -- erişilebilir kalmadı', 'u == -1? yes -- nothing reachable left') }]);
  var L_ADD = LN([21, { n: 22, note: T('parent[u] != -1 mi? evet -- kenar eklenir', 'parent[u] != -1? yes -- an edge is added') }, 23, 24]);
  var L_ROOT = LN([21, { n: 22, note: T('parent[u] != -1 mi? hayır -- bu ağacın kökü', 'parent[u] != -1? no -- this is the root of the tree') }, { n: 23, skip: true }]);
  var NOTE_LOOP_N = T('n != NULL mi? evet -- sıradaki komşuya bakılıyor', 'n != NULL? yes -- looking at the next neighbour');
  var L_RELAX = LN([{ n: 26, note: NOTE_LOOP_N }, { n: 27, note: T('inMst değilse ve ağırlık daha küçükse mi? evet -- anahtar güncellenir', 'not inMst and weight smaller? yes -- the key is updated') }]);
  var L_NORELAX = LN([{ n: 26, note: NOTE_LOOP_N }, { n: 27, skip: true, note: T('inMst değilse ve ağırlık daha küçükse mi? hayır -- hiçbiri için', 'not inMst and weight smaller? no -- for any of them') }]);

  var EDGE_RE = /^([A-Za-z0-9]{1,3})-([A-Za-z0-9]{1,3}):(\d+)$/;
  function parseStartWG(text) {
    var toks = String(text).trim().split(/\s+/).filter(Boolean);
    if (!toks.length) throw T('Metin boş: "start=X A-B:4 ..." yazın.', 'The text is empty: write "start=X A-B:4 ...".');
    var m0 = /^start=([A-Za-z0-9]{1,3})$/i.exec(toks[0]);
    if (!m0) throw T('İlk sözcük "start=X" biçiminde olmalı.', 'The first word must look like "start=X".');
    var start = m0[1]; toks = toks.slice(1);
    if (!toks.length) throw T('En az bir kenar yazın.', 'Write at least one edge.');
    var edges = [];
    for (var i = 0; i < toks.length; i++) {
      var m = EDGE_RE.exec(toks[i]);
      if (!m) throw T('"' + toks[i] + '" anlaşılmadı: VERTEX-VERTEX:AĞIRLIK biçiminde olmalı.', '"' + toks[i] + '" is not understood: it must look like VERTEX-VERTEX:WEIGHT.');
      if (m[1] === m[2]) throw T('Bir düğüm kendine kenar veremez: "' + toks[i] + '".', 'A vertex cannot have an edge to itself: "' + toks[i] + '".');
      edges.push({ a: m[1], b: m[2], w: parseInt(m[3], 10) });
    }
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    if (!(start in vset)) throw T('"' + start + '" başlangıç düğümü kenarlarda geçmiyor.', 'Starting vertex "' + start + '" does not appear in the edges.');
    return { start: start, edges: edges };
  }
  function formatStartWG(d) { return 'start=' + d.start + ' ' + d.edges.map(function (e) { return e.a + '-' + e.b + ':' + e.w; }).join(' '); }
  function verticesOf(edges) { var s = {}; edges.forEach(function (e) { s[e.a] = 1; s[e.b] = 1; }); return Object.keys(s).sort(); }
  function buildAdj(V, edges) {
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { adj[e.a].push({ to: e.b, w: e.w }); adj[e.b].push({ to: e.a, w: e.w }); });
    V.forEach(function (v) { adj[v].sort(function (p, q) { return p.to < q.to ? -1 : p.to > q.to ? 1 : 0; }); });
    return adj;
  }
  function layoutCircle(vertices) {
    var n = vertices.length, R = Math.max(140, 16 * n), cx = R + 46, cy = R + 46, pos = {};
    vertices.forEach(function (v, i) { var ang = -Math.PI / 2 + i * 2 * Math.PI / n; pos[v] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }; });
    return { pos: pos, cx: cx, cy: cy, R: R };
  }
  function label(i) { var s = '', n = i + 1; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }

  /** Independent computation: scans a plain JS object map for the minimum every round (rather than build()'s
   *  sorted-row representation), using Infinity directly instead of a sentinel constant. */
  function primRef(edges, start) {
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    var V = Object.keys(vset).sort();
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { adj[e.a].push({ to: e.b, w: e.w }); adj[e.b].push({ to: e.a, w: e.w }); });
    V.forEach(function (v) { adj[v].sort(function (p, q) { return p.to < q.to ? -1 : p.to > q.to ? 1 : 0; }); });
    var key = {}, inMst = {}, parent = {};
    V.forEach(function (v) { key[v] = Infinity; inMst[v] = false; parent[v] = null; });
    key[start] = 0;
    var mst = [], total = 0;
    for (var count = 0; count < V.length; count++) {
      var best = null;
      V.forEach(function (v) { if (!inMst[v] && key[v] < Infinity && (best === null || key[v] < key[best] || (key[v] === key[best] && v < best))) best = v; });
      if (best === null) break;
      inMst[best] = true;
      if (parent[best] !== null) { mst.push({ a: parent[best], b: best, w: key[best] }); total += key[best]; }
      adj[best].forEach(function (n) { if (!inMst[n.to] && n.w < key[n.to]) { key[n.to] = n.w; parent[n.to] = best; } });
    }
    return { edges: mst, totalWeight: total };
  }

  D.define({
    id: 'prim-mst',
    title: T('Prim en küçük yayılan ağaç (MST)', 'Prim\'s minimum spanning tree'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('7 düğüm, 10 kenar, `A`\'dan başlar', '7 vertices, 10 edges, starts at `A`'),
        data: { start: 'A', edges: [
          { a: 'A', b: 'B', w: 4 }, { a: 'A', b: 'C', w: 2 }, { a: 'B', b: 'C', w: 1 }, { a: 'B', b: 'D', w: 5 },
          { a: 'C', b: 'D', w: 8 }, { a: 'C', b: 'E', w: 10 }, { a: 'D', b: 'E', w: 2 }, { a: 'D', b: 'F', w: 6 },
          { a: 'E', b: 'F', w: 3 }, { a: 'E', b: 'G', w: 7 }
        ] } },
      { id: 'hard', level: 'hard', name: T('9 düğüm, 14 kenar, `E`\'den başlar, birçok eşit ağırlık', '9 vertices, 14 edges, starts at `E`, many tied weights'),
        data: { start: 'E', edges: [
          { a: 'A', b: 'B', w: 3 }, { a: 'A', b: 'C', w: 3 }, { a: 'B', b: 'C', w: 3 }, { a: 'B', b: 'D', w: 5 },
          { a: 'C', b: 'D', w: 3 }, { a: 'C', b: 'E', w: 6 }, { a: 'D', b: 'E', w: 3 }, { a: 'D', b: 'F', w: 4 },
          { a: 'E', b: 'F', w: 3 }, { a: 'F', b: 'G', w: 2 }, { a: 'F', b: 'H', w: 3 }, { a: 'G', b: 'H', w: 1 },
          { a: 'H', b: 'I', w: 3 }, { a: 'G', b: 'I', w: 5 }
        ] } },
      { id: 'disconnected', level: 'edge', name: T('Uç: 2 bileşen, `A`\'dan başlar -- `F..J` hiç erişilmez (key = inf kalır)', 'Edge case: 2 components, starts at `A` -- `F..J` are never reached (key stays inf)'),
        data: { start: 'A', edges: [
          { a: 'A', b: 'B', w: 2 }, { a: 'B', b: 'C', w: 4 }, { a: 'A', b: 'C', w: 5 }, { a: 'C', b: 'D', w: 1 },
          { a: 'D', b: 'E', w: 3 },
          { a: 'F', b: 'G', w: 2 }, { a: 'G', b: 'H', w: 6 }, { a: 'F', b: 'H', w: 7 }, { a: 'H', b: 'I', w: 3 },
          { a: 'I', b: 'J', w: 4 }
        ] } },
      { id: 'two-vertices', level: 'edge', name: T('Uç: 2 düğüm, 1 kenar', 'Edge case: 2 vertices, 1 edge'),
        data: { start: 'A', edges: [{ a: 'A', b: 'B', w: 9 }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.edges.length; },
    reference: function (d) { return primRef(d.edges, d.start); },
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
      var start = vertices[D.randInt(r, 0, n - 1)];
      return { start: start, edges: edges };
    },
    input: {
      hint: T('Örnek: start=A A-B:4 B-C:2 A-C:5', 'Example: start=A A-B:4 B-C:2 A-C:5'),
      parse: parseStartWG,
      format: formatStartWG,
      bad: ['', 'A-B:4', 'start=Z A-B:4', 'start=A A-A:4', 'start=A A-B:x']
    },
    build: function (S, d) {
      var edges = d.edges, start = d.start, V = verticesOf(edges), adj = buildAdj(V, edges);
      var lay = layoutCircle(V), pos = lay.pos, cx = lay.cx, cy = lay.cy, R = lay.R;
      V.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: 'empty' }); });
      var eidOf = {};
      edges.forEach(function (e, idx) { eidOf[e.a + '|' + e.b] = idx; eidOf[e.b + '|' + e.a] = idx; S.arrow('e' + idx, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: false, text: String(e.w), style: 'dim' }); });

      var idxOf = {}; V.forEach(function (v, i) { idxOf[v] = i; });
      var ROWX0 = 40, STEP = 46, CW = 40, CH = 36;
      var KY = cy + R + 66, PY = KY + CH + 56, QY = PY + CH + 56;
      S.label('klbl', { x: ROWX0 - 14, y: KY + 24, text: T('anahtar[] =', 'key[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('k' + i, { x: ROWX0 + i * STEP, y: KY, w: CW, h: CH, text: v === start ? '0' : INF, style: v === start ? 'new' : 'empty', size: 14, above: v }); });
      S.label('plbl', { x: ROWX0 - 14, y: PY + 24, text: T('ebeveyn[] =', 'parent[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('p' + i, { x: ROWX0 + i * STEP, y: PY, w: CW, h: CH, text: '-', style: 'empty', size: 14 }); });
      S.label('qlbl', { x: ROWX0 - 14, y: QY + 24, text: T('öncelik kuyruğu =', 'priority queue ='), anchor: 'end', size: 14, mono: true });
      for (var qi = 0; qi < V.length; qi++) S.box('q' + qi, { x: ROWX0 + qi * STEP, y: QY, w: CW, h: CH, text: '', style: 'empty', size: 13 });
      S.label('wlbl', { x: cx, y: QY + CH + 56, text: T('MST ağırlığı = 0', 'MST weight = 0'), anchor: 'middle', size: 17, bold: true, mono: true });

      var key = {}, inMst = {}, parent = {};
      V.forEach(function (v) { key[v] = Infinity; inMst[v] = false; parent[v] = null; });
      key[start] = 0;

      function refreshRows() {
        V.forEach(function (v, i) {
          S.set('k' + i, { text: key[v] === Infinity ? INF : String(key[v]), style: inMst[v] ? 'dim' : (key[v] === Infinity ? 'empty' : 'new') });
          S.set('p' + i, { text: parent[v] === null ? '-' : parent[v], style: inMst[v] ? 'dim' : 'normal' });
        });
        var pending = V.filter(function (v) { return !inMst[v]; }).sort(function (a, b) { return key[a] - key[b] || (a < b ? -1 : a > b ? 1 : 0); });
        for (var i = 0; i < V.length; i++) {
          if (i < pending.length) S.set('q' + i, { text: pending[i] + ':' + (key[pending[i]] === Infinity ? INF : key[pending[i]]), style: key[pending[i]] === Infinity ? 'empty' : 'active' });
          else S.set('q' + i, { text: '', style: 'empty' });
        }
      }
      refreshRows();
      S.step(T('BAŞLANGIÇ: `key[' + start + ']=0`, geri kalan her düğüm `inf`. Öncelik kuyruğu anahtara göre sıralı; en küçüğü baştadır.',
               'INIT: `key[' + start + ']=0`, every other vertex is `inf`. The priority queue is sorted by key; the smallest is first.'), L_INIT);

      var mst = [], total = 0;
      for (var count = 0; count < V.length; count++) {
        var best = null;
        V.forEach(function (v) { if (!inMst[v] && key[v] < Infinity && (best === null || key[v] < key[best] || (key[v] === key[best] && v < best))) best = v; });
        if (best === null) {
          var left = V.filter(function (v) { return !inMst[v]; });
          S.step(T('Kuyrukta kalan herkesin anahtarı `inf` -- `' + left.join(', ') + '` `' + start + '`\'dan hiçbir kenarla erişilemiyor. Durur.',
                   'Everyone left in the queue has key `inf` -- `' + left.join(', ') + '` cannot be reached from `' + start + '` by any edge. We stop.'), L_NOMORE);
          break;
        }
        inMst[best] = true; S.set('n' + best, { style: 'hl' });
        refreshRows();
        S.step(T('Kuyruktan en küçük anahtarlı düğüm çekilir: `' + best + '` (key=' + key[best] + ').', 'The vertex with the smallest key is popped from the queue: `' + best + '` (key=' + key[best] + ').'), L_PICK);
        if (parent[best] !== null) {
          var eid = eidOf[parent[best] + '|' + best]; if (eid !== undefined) S.set('e' + eid, { style: 'new' });
          mst.push({ a: parent[best], b: best, w: key[best] }); total += key[best];
          S.set('wlbl', { text: T('MST ağırlığı = ' + total, 'MST weight = ' + total) });
          S.step(T('Kenar `' + parent[best] + '-' + best + ':' + key[best] + '` MST\'ye eklenir. Toplam ağırlık şimdi ' + total + '.',
                   'Edge `' + parent[best] + '-' + best + ':' + key[best] + '` is added to the MST. Total weight is now ' + total + '.'), L_ADD);
        } else {
          S.step(T('`' + best + '` ağacın kökü, eklenecek bir kenarı yok.', '`' + best + '` is the root of the tree, no edge to add for it.'), L_ROOT);
        }
        var relaxed = [];
        adj[best].forEach(function (n) {
          if (!inMst[n.to] && n.w < key[n.to]) { key[n.to] = n.w; parent[n.to] = best; relaxed.push(n.to); S.set('n' + n.to, { style: 'active' }); }
        });
        refreshRows(); S.set('n' + best, { style: 'dim' });
        S.step(T(relaxed.length ? ('`' + best + '`\'nin komşuları gevşetilir: ' + relaxed.join(', ') + ' için daha ucuz bir kenar bulundu, `key`/`parent` güncellendi.')
                                 : ('`' + best + '`\'nin komşularının hiçbiri gevşemedi: hepsi zaten ağaçta ya da daha ucuz bir yolu var.'),
                 relaxed.length ? ('`' + best + '`\'s neighbours are relaxed: a cheaper edge was found for ' + relaxed.join(', ') + ', `key`/`parent` updated.')
                                : ('None of `' + best + '`\'s neighbours relaxed: they are already in the tree or already have a cheaper edge.')),
               relaxed.length ? L_RELAX : L_NORELAX);
      }
      S.result = { edges: mst, totalWeight: total };
      S.step(T('Bitti: ' + mst.length + ' kenar, toplam ağırlık ' + total + '.', 'Done: ' + mst.length + ' edges, total weight ' + total + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
