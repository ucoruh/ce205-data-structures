/* Week 9 -- Dijkstra's shortest path: single source, non-negative weights only (input rejects a negative weight,
 * pointing ahead to Bellman-Ford). A "priority queue" row holds every not-yet-finished vertex with its current
 * best distance; each round the smallest is extracted (ties alphabetical) and its outgoing edges are relaxed.
 * Directed, weighted, start-vertex input: "start=A A>B:4 B>C:2 ..." (edges use '>' and a mandatory ":WEIGHT"). */
(function (D) {
  'use strict';
  var T = D.T;
  var INF = 'inf';

  var C_CODE = [
    '#define MAX_V 32',
    '#define INF 1000000000',
    '',
    'int dist_of[MAX_V], parent_of[MAX_V], done[MAX_V];',
    '',
    'int min_dist_vertex(int vertex_count) {',
    '    int best = -1, best_dist = INF;',
    '    for (int v = 0; v < vertex_count; v++)',
    '        if (!done[v] && dist_of[v] < best_dist) { best_dist = dist_of[v]; best = v; }',
    '    return best;',
    '}',
    '',
    'void dijkstra(Graph *g, int start) {',
    '    for (int v = 0; v < g->vertex_count; v++) { dist_of[v] = INF; done[v] = 0; parent_of[v] = -1; }',
    '    dist_of[start] = 0;',
    '    for (int count = 0; count < g->vertex_count; count++) {',
    '        int u = min_dist_vertex(g->vertex_count);',
    '        if (u == -1 || dist_of[u] == INF) break;      /* nothing left reachable */',
    '        done[u] = 1;',
    '        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {   /* alphabetical order */',
    '            int cand = dist_of[u] + n->weight;',
    '            if (!done[n->to] && cand < dist_of[n->to]) { dist_of[n->to] = cand; parent_of[n->to] = u; }',
    '        }',
    '    }',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    'static final int INF = 1000000000;',
    '',
    'int[] distOf = new int[MAX_V], parentOf = new int[MAX_V]; boolean[] done = new boolean[MAX_V];',
    '',
    'int minDistVertex(int vertexCount) {',
    '    int best = -1, bestDist = INF;',
    '    for (int v = 0; v < vertexCount; v++)',
    '        if (!done[v] && distOf[v] < bestDist) { bestDist = distOf[v]; best = v; }',
    '    return best;',
    '}',
    '',
    'void dijkstra(Graph g, int start) {',
    '    for (int v = 0; v < g.vertexCount; v++) { distOf[v] = INF; done[v] = false; parentOf[v] = -1; }',
    '    distOf[start] = 0;',
    '    for (int count = 0; count < g.vertexCount; count++) {',
    '        int u = minDistVertex(g.vertexCount);',
    '        if (u == -1 || distOf[u] == INF) break;       // nothing left reachable',
    '        done[u] = true;',
    '        for (AdjNode n = g.adj[u]; n != null; n = n.next) {    // alphabetical order',
    '            int cand = distOf[u] + n.weight;',
    '            if (!done[n.to] && cand < distOf[n.to]) { distOf[n.to] = cand; parentOf[n.to] = u; }',
    '        }',
    '    }',
    '}'
  ];
  /* C_CODE and JAVA_CODE are the same length with the same structure line-for-line here (25 positions each,
   * matching blank lines included), so every constant below reuses ONE array for both languages (LN) --
   * earlier versions gave java a DIFFERENT, systematically-off-by-one set of numbers (e.g. c:[17,...] but
   * java:[16,...]) that happened to still be in-range but pointed at the wrong source line every time. */
  function LN(arr) { return { c: arr, java: arr }; }
  var NOTE_RESET = T('v < vertex_count mi? evet -- her düğüm için dist[v]=inf', 'v < vertex_count? yes -- dist[v]=inf for every vertex');
  var L_INIT = LN([{ n: 14, note: NOTE_RESET }, 15]);
  var NOTE_SCAN_V = T('v < vertex_count mi? evet -- en küçük uzaklıklı düğüm aranıyor', 'v < vertex_count? yes -- scanning for the smallest distance');
  var NOTE_BETTER_YES = T('done[v] değilse ve dist[v] daha küçükse mi? -- en iyi aday güncellenir', 'not done[v] and dist[v] smaller? -- the best candidate is updated');
  var NOTE_BETTER_NO = T('done[v] değilse ve dist[v] daha küçükse mi? -- hiçbiri değil', 'not done[v] and dist[v] smaller? -- none is');
  var L_PICK = LN([17, 7, { n: 8, note: NOTE_SCAN_V }, { n: 9, note: NOTE_BETTER_YES }, 10, { n: 18, note: T('u != -1 -> devam', 'u != -1 -> continue') }]);
  var L_NOMORE = LN([17, 7, { n: 8, note: NOTE_SCAN_V }, { n: 9, note: NOTE_BETTER_NO }, 10, { n: 18, note: T('erişilebilir kalmadı', 'nothing reachable left') }]);
  var L_DONE = LN([19]);
  var NOTE_LOOP_N = T('n != NULL mi? evet -- sıradaki komşuya bakılıyor', 'n != NULL? yes -- looking at the next neighbour');
  var L_RELAX_YES = LN([{ n: 20, note: NOTE_LOOP_N }, 21, { n: 22, note: T('cand < dist -> güncelle', 'cand < dist -> update') }]);
  var L_RELAX_NO = LN([{ n: 20, note: NOTE_LOOP_N }, 21, { n: 22, note: T('cand >= dist -> değişmez', 'cand >= dist -> unchanged') }]);

  var EDGE_RE = /^([A-Za-z0-9]{1,3})>([A-Za-z0-9]{1,3}):(-?\d+)$/;
  function parseStartDWG(text) {
    var toks = String(text).trim().split(/\s+/).filter(Boolean);
    if (!toks.length) throw T('Metin boş: "start=X A>B:4 ..." yazın.', 'The text is empty: write "start=X A>B:4 ...".');
    var m0 = /^start=([A-Za-z0-9]{1,3})$/i.exec(toks[0]);
    if (!m0) throw T('İlk sözcük "start=X" biçiminde olmalı.', 'The first word must look like "start=X".');
    var start = m0[1]; toks = toks.slice(1);
    if (!toks.length) throw T('En az bir kenar yazın.', 'Write at least one edge.');
    var edges = [];
    for (var i = 0; i < toks.length; i++) {
      var m = EDGE_RE.exec(toks[i]);
      if (!m) throw T('"' + toks[i] + '" anlaşılmadı: yönlü ve ağırlıklı kenar VERTEX>VERTEX:AĞIRLIK biçiminde olmalı.', '"' + toks[i] + '" is not understood: a directed weighted edge must look like VERTEX>VERTEX:WEIGHT.');
      var w = parseInt(m[3], 10);
      if (w < 0) throw T('Dijkstra negatif ağırlık kabul etmez: "' + toks[i] + '" (negatif kenarlar için Bellman-Ford\'a bakın).', 'Dijkstra does not accept a negative weight: "' + toks[i] + '" (see Bellman-Ford for negative edges).');
      edges.push({ a: m[1], b: m[2], w: w });
    }
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    if (!(start in vset)) throw T('"' + start + '" başlangıç düğümü kenarlarda geçmiyor.', 'Starting vertex "' + start + '" does not appear in the edges.');
    return { start: start, edges: edges };
  }
  function formatStartDWG(d) { return 'start=' + d.start + ' ' + d.edges.map(function (e) { return e.a + '>' + e.b + ':' + e.w; }).join(' '); }
  function verticesOf(edges) { var s = {}; edges.forEach(function (e) { s[e.a] = 1; s[e.b] = 1; }); return Object.keys(s).sort(); }
  function buildAdj(V, edges) {
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { adj[e.a].push({ to: e.b, w: e.w }); });
    V.forEach(function (v) { adj[v].sort(function (p, q) { return p.to < q.to ? -1 : p.to > q.to ? 1 : 0; }); });
    return adj;
  }
  function layoutCircle(vertices) {
    var n = vertices.length, R = Math.max(140, 16 * n), cx = R + 46, cy = R + 46, pos = {};
    vertices.forEach(function (v, i) { var ang = -Math.PI / 2 + i * 2 * Math.PI / n; pos[v] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }; });
    return { pos: pos, cx: cx, cy: cy, R: R };
  }
  function label(i) { var s = '', n = i + 1; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }

  /** Independent computation: scans a plain JS object map for the minimum every round and relaxes with a
   *  for-in loop over a plain adjacency map, a different code shape from build()'s row-driven version. */
  function dijkstraRef(edges, start) {
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    var V = Object.keys(vset).sort();
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { adj[e.a].push({ to: e.b, w: e.w }); });
    V.forEach(function (v) { adj[v].sort(function (p, q) { return p.to < q.to ? -1 : p.to > q.to ? 1 : 0; }); });
    var dist = {}, done = {}, parent = {};
    V.forEach(function (v) { dist[v] = Infinity; done[v] = false; parent[v] = null; });
    dist[start] = 0;
    for (var count = 0; count < V.length; count++) {
      var best = null;
      for (var i = 0; i < V.length; i++) { var v = V[i]; if (!done[v] && dist[v] < Infinity && (best === null || dist[v] < dist[best] || (dist[v] === dist[best] && v < best))) best = v; }
      if (best === null) break;
      done[best] = true;
      adj[best].forEach(function (n) { var cand = dist[best] + n.w; if (!done[n.to] && cand < dist[n.to]) { dist[n.to] = cand; parent[n.to] = best; } });
    }
    var distOut = {}; V.forEach(function (v) { distOut[v] = dist[v] === Infinity ? null : dist[v]; });
    return { dist: distOut, parent: parent };
  }

  D.define({
    id: 'dijkstra',
    title: T('Dijkstra en kısa yol', 'Dijkstra\'s shortest path'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('8 düğüm, 10 kenar, `A`\'dan başlar', '8 vertices, 10 edges, starts at `A`'),
        data: { start: 'A', edges: [
          { a: 'A', b: 'B', w: 4 }, { a: 'A', b: 'C', w: 2 }, { a: 'C', b: 'B', w: 1 }, { a: 'B', b: 'D', w: 5 },
          { a: 'C', b: 'D', w: 8 }, { a: 'C', b: 'E', w: 10 }, { a: 'D', b: 'E', w: 2 }, { a: 'D', b: 'F', w: 6 },
          { a: 'E', b: 'F', w: 3 }, { a: 'E', b: 'G', w: 7 }
        ] } },
      { id: 'hard', level: 'hard', name: T('10 düğüm, 14 kenar, `A`\'dan başlar, birçok eşit uzaklık', '10 vertices, 14 edges, starts at `A`, many tied distances'),
        data: { start: 'A', edges: [
          { a: 'A', b: 'B', w: 2 }, { a: 'A', b: 'C', w: 2 }, { a: 'B', b: 'D', w: 3 }, { a: 'C', b: 'D', w: 3 },
          { a: 'B', b: 'E', w: 6 }, { a: 'C', b: 'F', w: 6 }, { a: 'D', b: 'G', w: 2 }, { a: 'E', b: 'G', w: 3 },
          { a: 'F', b: 'G', w: 3 }, { a: 'G', b: 'H', w: 1 }, { a: 'H', b: 'I', w: 4 }, { a: 'H', b: 'J', w: 4 },
          { a: 'E', b: 'H', w: 2 }, { a: 'F', b: 'H', w: 2 }
        ] } },
      { id: 'unreachable', level: 'edge', name: T('Uç: `A`\'dan başlar, `F..J` yönlü kenarlarla hiç erişilmez', 'Edge case: starts at `A`, `F..J` are never reachable via the directed edges'),
        data: { start: 'A', edges: [
          { a: 'A', b: 'B', w: 2 }, { a: 'B', b: 'C', w: 4 }, { a: 'A', b: 'C', w: 5 }, { a: 'C', b: 'D', w: 1 },
          { a: 'D', b: 'E', w: 3 },
          { a: 'F', b: 'G', w: 2 }, { a: 'G', b: 'H', w: 6 }, { a: 'H', b: 'F', w: 7 }, { a: 'H', b: 'I', w: 3 },
          { a: 'I', b: 'J', w: 4 }
        ] } },
      { id: 'two-vertices', level: 'edge', name: T('Uç: 2 düğüm, 1 kenar', 'Edge case: 2 vertices, 1 edge'),
        data: { start: 'A', edges: [{ a: 'A', b: 'B', w: 9 }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.edges.length; },
    reference: function (d) { return dijkstraRef(d.edges, d.start); },
    random: function (level, r) {
      var n = { easy: 6, normal: 8, hard: 10, extreme: 12 }[level] || 8;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var m = { easy: 10, normal: 11, hard: 15, extreme: 18 }[level] || 11;
      var wHi = level === 'extreme' ? 99 : 20;
      var edges = [], seen = {};
      for (var i2 = 1; i2 < n; i2++) { var j = D.randInt(r, 0, i2 - 1); edges.push({ a: vertices[j], b: vertices[i2], w: D.randInt(r, 1, wHi) }); seen[vertices[j] + '>' + vertices[i2]] = 1; }
      var guard = 0;
      while (edges.length < m && guard < 1000) {
        guard++;
        var x = vertices[D.randInt(r, 0, n - 1)], y = vertices[D.randInt(r, 0, n - 1)];
        if (x === y) continue;
        var key = x + '>' + y;
        if (seen[key]) continue;
        edges.push({ a: x, b: y, w: D.randInt(r, 1, wHi) }); seen[key] = 1;
      }
      var start = vertices[D.randInt(r, 0, n - 1)];
      return { start: start, edges: edges };
    },
    input: {
      hint: T('Örnek: start=A A>B:4 B>C:2 A>C:5   (kenarlar yönlü, ağırlık negatif olamaz)', 'Example: start=A A>B:4 B>C:2 A>C:5   (edges are directed, weight cannot be negative)'),
      parse: parseStartDWG,
      format: formatStartDWG,
      bad: ['', 'A>B:4', 'start=Z A>B:4', 'start=A A-B:4', 'start=A A>B:-3']
    },
    build: function (S, d) {
      var edges = d.edges, start = d.start, V = verticesOf(edges), adj = buildAdj(V, edges);
      var lay = layoutCircle(V), pos = lay.pos, cx = lay.cx, cy = lay.cy, R = lay.R;
      V.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: 'empty' }); });
      edges.forEach(function (e, idx) { S.arrow('e' + idx, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: true, text: String(e.w), style: 'dim' }); });

      var ROWX0 = 40, STEP = 46, CW = 40, CH = 36;
      var DY = cy + R + 66, PY = DY + CH + 56, QY = PY + CH + 56;
      S.label('dlbl', { x: ROWX0 - 14, y: DY + 24, text: T('uzaklık[] =', 'dist[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('d' + i, { x: ROWX0 + i * STEP, y: DY, w: CW, h: CH, text: v === start ? '0' : INF, style: v === start ? 'new' : 'empty', size: 14, above: v }); });
      S.label('plbl', { x: ROWX0 - 14, y: PY + 24, text: T('ebeveyn[] =', 'parent[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('p' + i, { x: ROWX0 + i * STEP, y: PY, w: CW, h: CH, text: '-', style: 'empty', size: 14 }); });
      S.label('qlbl', { x: ROWX0 - 14, y: QY + 24, text: T('öncelik kuyruğu =', 'priority queue ='), anchor: 'end', size: 14, mono: true });
      for (var qi = 0; qi < V.length; qi++) S.box('q' + qi, { x: ROWX0 + qi * STEP, y: QY, w: CW, h: CH, text: '', style: 'empty', size: 13 });

      var dist = {}, done = {}, parent = {};
      V.forEach(function (v) { dist[v] = Infinity; done[v] = false; parent[v] = null; });
      dist[start] = 0;

      function refreshRows() {
        V.forEach(function (v, i) {
          S.set('d' + i, { text: dist[v] === Infinity ? INF : String(dist[v]), style: done[v] ? 'dim' : (dist[v] === Infinity ? 'empty' : 'new') });
          S.set('p' + i, { text: parent[v] === null ? '-' : parent[v], style: done[v] ? 'dim' : 'normal' });
        });
        var pending = V.filter(function (v) { return !done[v]; }).sort(function (a, b) { return dist[a] - dist[b] || (a < b ? -1 : a > b ? 1 : 0); });
        for (var i = 0; i < V.length; i++) {
          if (i < pending.length) S.set('q' + i, { text: pending[i] + ':' + (dist[pending[i]] === Infinity ? INF : dist[pending[i]]), style: dist[pending[i]] === Infinity ? 'empty' : 'active' });
          else S.set('q' + i, { text: '', style: 'empty' });
        }
      }
      refreshRows();
      S.step(T('BAŞLANGIÇ: `dist[' + start + ']=0`, geri kalan her düğüm `inf`. Öncelik kuyruğu uzaklığa göre sıralı.',
               'INIT: `dist[' + start + ']=0`, every other vertex is `inf`. The priority queue is sorted by distance.'), L_INIT);

      for (var count = 0; count < V.length; count++) {
        var best = null;
        V.forEach(function (v) { if (!done[v] && dist[v] < Infinity && (best === null || dist[v] < dist[best] || (dist[v] === dist[best] && v < best))) best = v; });
        if (best === null) {
          var left = V.filter(function (v) { return !done[v]; });
          S.step(T('Kuyrukta kalan herkesin uzaklığı `inf` -- `' + left.join(', ') + '` `' + start + '`\'dan yönlü kenarlarla erişilemiyor. Durur.',
                   'Everyone left in the queue has distance `inf` -- `' + left.join(', ') + '` cannot be reached from `' + start + '` via the directed edges. We stop.'), L_NOMORE);
          break;
        }
        done[best] = true; S.set('n' + best, { style: 'hl' });
        refreshRows();
        S.step(T('Kuyruktan en küçük uzaklıklı düğüm çekilir: `' + best + '` (dist=' + dist[best] + '); artık kesin -- bu uzaklık asla küçülmez.',
                 'The vertex with the smallest distance is popped from the queue: `' + best + '` (dist=' + dist[best] + '); it is now final -- this distance never shrinks again.'), L_PICK);
        S.step(T('`' + best + '` bitmiş (done) olarak işaretlenir.', '`' + best + '` is marked done (finished).'), L_DONE);
        var kids = adj[best], relaxed = [];
        kids.forEach(function (n) {
          var cand = dist[best] + n.w;
          if (!done[n.to] && cand < dist[n.to]) { dist[n.to] = cand; parent[n.to] = best; relaxed.push(n.to); S.set('n' + n.to, { style: 'active' }); }
        });
        refreshRows(); S.set('n' + best, { style: 'dim' });
        if (kids.length) {
          S.step(T(relaxed.length ? ('`' + best + '`\'nin kenarları gevşetilir: ' + relaxed.map(function (v) { return v + '=' + dist[v]; }).join(', ') + ' güncellendi (`dist[' + best + ']` + ağırlık daha küçük).')
                                   : ('`' + best + '`\'nin hiçbir komşusu gevşemedi: hepsi zaten daha kısa bir yola sahip.'),
                   relaxed.length ? ('`' + best + '`\'s edges are relaxed: ' + relaxed.map(function (v) { return v + '=' + dist[v]; }).join(', ') + ' updated (`dist[' + best + ']` + weight is smaller).')
                                   : ('None of `' + best + '`\'s neighbours relaxed: they already have a shorter path.')),
                 relaxed.length ? L_RELAX_YES : L_RELAX_NO);
        }
      }
      var distOut = {}; V.forEach(function (v) { distOut[v] = dist[v] === Infinity ? null : dist[v]; });
      S.result = { dist: distOut, parent: parent };
      S.step(T('Bitti. Uzaklıklar: ' + V.map(function (v) { return v + '=' + (dist[v] === Infinity ? INF : dist[v]); }).join(', ') + '.',
               'Done. Distances: ' + V.map(function (v) { return v + '=' + (dist[v] === Infinity ? INF : dist[v]); }).join(', ') + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
