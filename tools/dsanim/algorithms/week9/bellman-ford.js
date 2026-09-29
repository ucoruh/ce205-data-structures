/* Week 9 -- Bellman-Ford shortest path: single source, NEGATIVE weights allowed (unlike Dijkstra). Relax every
 * edge, in a fixed alphabetical vertex order, for up to V-1 rounds (stopping early once a round changes nothing).
 * A final extra round that still finds an improvement means a NEGATIVE CYCLE reaches that vertex -- its distance
 * is not well defined. Same directed, weighted, start-vertex input as dijkstra.js, but weights may be negative. */
(function (D) {
  'use strict';
  var T = D.T;
  var INF = 'inf';

  var C_CODE = [
    '#define MAX_V 32',
    '#define INF 1000000000',
    '',
    'int dist_of[MAX_V], parent_of[MAX_V];',
    '',
    'int bellman_ford(Graph *g, int start) {',
    '    for (int v = 0; v < g->vertex_count; v++) { dist_of[v] = INF; parent_of[v] = -1; }',
    '    dist_of[start] = 0;',
    '    for (int pass = 1; pass <= g->vertex_count - 1; pass++) {',
    '        int changed = 0;',
    '        for (int u = 0; u < g->vertex_count; u++) {           /* alphabetical order */',
    '            if (dist_of[u] == INF) continue;',
    '            for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {',
    '                int cand = dist_of[u] + n->weight;',
    '                if (cand < dist_of[n->to]) { dist_of[n->to] = cand; parent_of[n->to] = u; changed = 1; }',
    '            }',
    '        }',
    '        if (!changed) break;                                  /* nothing changed: done early */',
    '    }',
    '    int neg_cycle = 0;',
    '    for (int u = 0; u < g->vertex_count; u++) {                /* one more pass: detect a negative cycle */',
    '        if (dist_of[u] == INF) continue;',
    '        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next)',
    '            if (dist_of[u] + n->weight < dist_of[n->to]) neg_cycle = 1;',
    '    }',
    '    return neg_cycle;',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    'static final int INF = 1000000000;',
    '',
    'int[] distOf = new int[MAX_V], parentOf = new int[MAX_V];',
    '',
    'boolean bellmanFord(Graph g, int start) {',
    '    for (int v = 0; v < g.vertexCount; v++) { distOf[v] = INF; parentOf[v] = -1; }',
    '    distOf[start] = 0;',
    '    for (int pass = 1; pass <= g.vertexCount - 1; pass++) {',
    '        boolean changed = false;',
    '        for (int u = 0; u < g.vertexCount; u++) {              // alphabetical order',
    '            if (distOf[u] == INF) continue;',
    '            for (AdjNode n = g.adj[u]; n != null; n = n.next) {',
    '                int cand = distOf[u] + n.weight;',
    '                if (cand < distOf[n.to]) { distOf[n.to] = cand; parentOf[n.to] = u; changed = true; }',
    '            }',
    '        }',
    '        if (!changed) break;                                   // nothing changed: done early',
    '    }',
    '    boolean negCycle = false;',
    '    for (int u = 0; u < g.vertexCount; u++) {                   // one more pass: detect a negative cycle',
    '        if (distOf[u] == INF) continue;',
    '        for (AdjNode n = g.adj[u]; n != null; n = n.next)',
    '            if (distOf[u] + n.weight < distOf[n.to]) negCycle = true;',
    '    }',
    '    return negCycle;',
    '}'
  ];
  var L_INIT = { c: [{ n: 7, note: T('v < vertex_count mi? evet -- her düğüm için dist[v]=inf', 'v < vertex_count? yes -- dist[v]=inf for every vertex') }, 8], java: [{ n: 7, note: T('v < vertex_count mi? evet -- her düğüm için dist[v]=inf', 'v < vertex_count? yes -- dist[v]=inf for every vertex') }, 8] };
  var L_PASS = { c: [{ n: 9, note: T('pass <= vertex_count-1 mi? evet -- yeni bir tur başlar', 'pass <= vertex_count-1? yes -- a new round begins') }, 10], java: [{ n: 9, note: T('pass <= vertex_count-1 mi? evet -- yeni bir tur başlar', 'pass <= vertex_count-1? yes -- a new round begins') }, 10] };
  var NOTE_SCAN_U = T('u < vertex_count mi? evet -- sıradaki düğüm taranıyor', 'u < vertex_count? yes -- scanning the next vertex');
  var L_SCANNED = { c: [{ n: 11, note: NOTE_SCAN_U }, { n: 12, skip: true, note: T('dist[u] == inf mi? evet -- kenarları atlanır', 'dist[u] == inf? yes -- its edges are skipped') }],
                     java: [{ n: 11, note: NOTE_SCAN_U }, { n: 12, skip: true, note: T('dist[u] == inf mi? evet -- kenarları atlanır', 'dist[u] == inf? yes -- its edges are skipped') }] };
  var NOTE_LOOP_N = T('n != NULL mi? evet -- sıradaki komşuya bakılıyor', 'n != NULL? yes -- looking at the next neighbour');
  var L_RELAX_YES = { c: [{ n: 13, note: NOTE_LOOP_N }, 14, { n: 15, note: T('cand < dist -> güncelle', 'cand < dist -> update') }], java: [{ n: 13, note: NOTE_LOOP_N }, 14, { n: 15, note: T('cand < dist -> güncelle', 'cand < dist -> update') }] };
  var L_RELAX_NO = { c: [{ n: 13, note: NOTE_LOOP_N }, 14, { n: 15, note: T('cand >= dist -> değişmez', 'cand >= dist -> unchanged') }], java: [{ n: 13, note: NOTE_LOOP_N }, 14, { n: 15, note: T('cand >= dist -> değişmez', 'cand >= dist -> unchanged') }] };
  var L_EARLY = { c: [{ n: 18, note: T('bu turda hiç değişmedi', 'nothing changed this round') }], java: [{ n: 18, note: T('bu turda hiç değişmedi', 'nothing changed this round') }] };
  var L_DETECT = { c: [{ n: 21, note: NOTE_SCAN_U }, { n: 22, note: T('dist[u] == inf mi? hayır -- kenarları kontrol edilir', 'dist[u] == inf? no -- its edges are checked') },
                        { n: 23, note: NOTE_LOOP_N }, { n: 24, note: T('dist[u]+ağırlık < dist[hedef] mi? her kenar için kontrol edilir', 'dist[u]+weight < dist[target]? checked for every edge') }],
                    java: [{ n: 21, note: NOTE_SCAN_U }, { n: 22, note: T('dist[u] == inf mi? hayır -- kenarları kontrol edilir', 'dist[u] == inf? no -- its edges are checked') },
                           { n: 23, note: NOTE_LOOP_N }, { n: 24, note: T('dist[u]+ağırlık < dist[hedef] mi? her kenar için kontrol edilir', 'dist[u]+weight < dist[target]? checked for every edge') }] };
  var L_FOUND = { c: [{ n: 23, note: NOTE_LOOP_N }, { n: 24, note: T('hâlâ gevşetilebiliyor -> negatif döngü', 'still relaxes -> negative cycle') }], java: [{ n: 23, note: NOTE_LOOP_N }, { n: 24, note: T('hâlâ gevşetilebiliyor -> negatif döngü', 'still relaxes -> negative cycle') }] };

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
      if (!m) throw T('"' + toks[i] + '" anlaşılmadı: yönlü kenar VERTEX>VERTEX:AĞIRLIK biçiminde olmalı (ağırlık negatif olabilir).', '"' + toks[i] + '" is not understood: a directed edge must look like VERTEX>VERTEX:WEIGHT (the weight may be negative).');
      edges.push({ a: m[1], b: m[2], w: parseInt(m[3], 10) });
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

  /** Independent computation: runs a FIXED V-1 rounds (no early-exit optimisation) and recomputes "changed"
   *  differently (a per-round counter rather than build()'s boolean flag). It still scans vertices in
   *  alphabetical order with alphabetically sorted adjacency -- the same tie-break rule as build() -- because
   *  with several equally-short paths, `parent[]` (unlike `dist[]`) genuinely depends on relaxation order, so
   *  both implementations must agree on that order to reach the same, well-defined answer. */
  function bellmanRef(edges, start) {
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    var V = Object.keys(vset).sort();
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { adj[e.a].push({ to: e.b, w: e.w }); });
    V.forEach(function (v) { adj[v].sort(function (p, q) { return p.to < q.to ? -1 : p.to > q.to ? 1 : 0; }); });
    var dist = {}, parent = {};
    V.forEach(function (v) { dist[v] = Infinity; parent[v] = null; });
    dist[start] = 0;
    for (var pass = 0; pass < V.length - 1; pass++) {
      var changes = 0;
      V.forEach(function (u) {
        if (dist[u] === Infinity) return;
        adj[u].forEach(function (n) {
          var cand = dist[u] + n.w;
          if (cand < dist[n.to]) { dist[n.to] = cand; parent[n.to] = u; changes++; }
        });
      });
      if (changes === 0) break;
    }
    var unstable = {};
    V.forEach(function (u) {
      if (dist[u] === Infinity) return;
      adj[u].forEach(function (n) { if (dist[u] + n.w < dist[n.to]) unstable[n.to] = true; });
    });
    var negCycleVertices = Object.keys(unstable).sort();
    var distOut = {}; V.forEach(function (v) { distOut[v] = dist[v] === Infinity ? null : dist[v]; });
    return { dist: distOut, parent: parent, negCycle: negCycleVertices.length > 0, negCycleVertices: negCycleVertices };
  }

  D.define({
    id: 'bellman-ford',
    title: T('Bellman-Ford en kısa yol (negatif kenarlarla)', 'Bellman-Ford shortest path (with negative edges)'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('7 düğüm, 10 kenar, hepsi pozitif, `A`\'dan başlar', '7 vertices, 10 edges, all positive, starts at `A`'),
        data: { start: 'A', edges: [
          { a: 'A', b: 'B', w: 4 }, { a: 'A', b: 'C', w: 2 }, { a: 'C', b: 'B', w: 1 }, { a: 'B', b: 'D', w: 5 },
          { a: 'C', b: 'D', w: 8 }, { a: 'C', b: 'E', w: 10 }, { a: 'D', b: 'E', w: 2 }, { a: 'D', b: 'F', w: 6 },
          { a: 'E', b: 'F', w: 3 }, { a: 'E', b: 'G', w: 7 }
        ] } },
      { id: 'hard', level: 'hard', name: T('8 düğüm, 11 kenar, negatif kenarlar var ama döngü yok (DAG), `A`\'dan başlar',
                                            '8 vertices, 11 edges, negative edges present but no cycle (a DAG), starts at `A`'),
        data: { start: 'A', edges: [
          { a: 'A', b: 'B', w: 6 }, { a: 'A', b: 'C', w: 4 }, { a: 'B', b: 'D', w: -3 }, { a: 'C', b: 'D', w: 2 },
          { a: 'C', b: 'E', w: 5 }, { a: 'D', b: 'E', w: -2 }, { a: 'D', b: 'F', w: 4 }, { a: 'E', b: 'F', w: 1 },
          { a: 'E', b: 'G', w: -4 }, { a: 'F', b: 'G', w: 2 }, { a: 'F', b: 'H', w: 3 }
        ] } },
      { id: 'negative-cycle', level: 'edge', name: T('Uç: A-B-C-A negatif döngü (toplam -1), `A`\'dan başlar (10 kenar)',
                                                       'Edge case: A-B-C-A is a negative cycle (total -1), starts at `A` (10 edges)'),
        /* Same 10 edges as code/week-09/c/bellman_ford.c's and BellmanFord.java's "negative_cycle" scenario
         * (and the same graph floyd-warshall.js uses for its own negative-cycle preset), so the program and
         * this animation tell the exact same story. */
        data: { start: 'A', edges: [
          { a: 'A', b: 'B', w: 1 }, { a: 'B', b: 'C', w: 2 }, { a: 'C', b: 'A', w: -4 }, { a: 'A', b: 'D', w: 3 },
          { a: 'D', b: 'E', w: 2 }, { a: 'B', b: 'D', w: 5 }, { a: 'C', b: 'E', w: 1 }, { a: 'D', b: 'A', w: 6 },
          { a: 'E', b: 'B', w: 2 }, { a: 'E', b: 'C', w: 3 }
        ] } },
      { id: 'two-vertices', level: 'edge', name: T('Uç: 2 düğüm, 1 negatif kenar', 'Edge case: 2 vertices, 1 negative edge'),
        data: { start: 'A', edges: [{ a: 'A', b: 'B', w: -5 }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.edges.length; },
    reference: function (d) { return bellmanRef(d.edges, d.start); },
    random: function (level, r) {
      var n = { easy: 6, normal: 8, hard: 9, extreme: 11 }[level] || 8;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var m = { easy: 10, normal: 11, hard: 14, extreme: 17 }[level] || 11;
      var wHi = level === 'extreme' ? 40 : 12;
      var negProb = level === 'easy' ? 0 : 0.25;
      var edges = [], seen = {};
      /* keep i < j (strictly forward) so the random graph is always acyclic: no accidental negative cycle */
      for (var i2 = 1; i2 < n; i2++) { var j = D.randInt(r, 0, i2 - 1); var w = D.randInt(r, 1, wHi) * (r() < negProb ? -1 : 1); edges.push({ a: vertices[j], b: vertices[i2], w: w }); seen[vertices[j] + '>' + vertices[i2]] = 1; }
      var guard = 0;
      while (edges.length < m && guard < 1000) {
        guard++;
        var i1 = D.randInt(r, 0, n - 2), j1 = D.randInt(r, i1 + 1, n - 1);
        var key = vertices[i1] + '>' + vertices[j1];
        if (seen[key]) continue;
        edges.push({ a: vertices[i1], b: vertices[j1], w: D.randInt(r, 1, wHi) * (r() < negProb ? -1 : 1) }); seen[key] = 1;
      }
      return { start: vertices[0], edges: edges };
    },
    input: {
      hint: T('Örnek: start=A A>B:4 B>C:-2 A>C:5   (kenarlar yönlü, ağırlık negatif olabilir)', 'Example: start=A A>B:4 B>C:-2 A>C:5   (edges are directed, weight may be negative)'),
      parse: parseStartDWG,
      format: formatStartDWG,
      bad: ['', 'A>B:4', 'start=Z A>B:4', 'start=A A-B:4', 'start=A A>B:x']
    },
    build: function (S, d) {
      var edges = d.edges, start = d.start, V = verticesOf(edges), adj = buildAdj(V, edges);
      var lay = layoutCircle(V), pos = lay.pos, cx = lay.cx, cy = lay.cy, R = lay.R;
      V.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: 'empty' }); });
      var eidOf = {};
      edges.forEach(function (e, idx) { eidOf[e.a + '>' + e.b] = idx; S.arrow('e' + idx, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: true, text: String(e.w), style: 'dim' }); });

      var idxOf = {}; V.forEach(function (v, i) { idxOf[v] = i; });
      var ROWX0 = 40, STEP = 46, CW = 40, CH = 36;
      var DY = cy + R + 66, PY = DY + CH + 56;
      S.label('dlbl', { x: ROWX0 - 14, y: DY + 24, text: T('uzaklık[] =', 'dist[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('d' + i, { x: ROWX0 + i * STEP, y: DY, w: CW, h: CH, text: v === start ? '0' : INF, style: v === start ? 'new' : 'empty', size: 14, above: v }); });
      S.label('plbl', { x: ROWX0 - 14, y: PY + 24, text: T('ebeveyn[] =', 'parent[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('p' + i, { x: ROWX0 + i * STEP, y: PY, w: CW, h: CH, text: '-', style: 'empty', size: 14 }); });
      S.label('passlbl', { x: cx, y: PY + CH + 50, text: T('tur 0 / ' + (V.length - 1), 'round 0 / ' + (V.length - 1)), anchor: 'middle', size: 16, bold: true, mono: true });

      var dist = {}, parent = {};
      V.forEach(function (v) { dist[v] = Infinity; parent[v] = null; });
      dist[start] = 0;
      function refreshRows() {
        V.forEach(function (v, i) {
          S.set('d' + i, { text: dist[v] === Infinity ? INF : String(dist[v]), style: dist[v] === Infinity ? 'empty' : 'new' });
          S.set('p' + i, { text: parent[v] === null ? '-' : parent[v], style: 'normal' });
        });
      }
      refreshRows();
      S.step(T('BAŞLANGIÇ: `dist[' + start + ']=0`, geri kalan her düğüm `inf`. En çok ' + (V.length - 1) + ' tur boyunca HER kenar gevşetilecek.',
               'INIT: `dist[' + start + ']=0`, every other vertex is `inf`. Every edge will be relaxed for up to ' + (V.length - 1) + ' rounds.'), L_INIT);

      var maxPass = V.length - 1;
      for (var pass = 1; pass <= maxPass; pass++) {
        S.set('passlbl', { text: T('tur ' + pass + ' / ' + maxPass, 'round ' + pass + ' / ' + maxPass) });
        S.step(T('Tur ' + pass + ' başlar: her düğüm alfabetik sırayla taranır, kenarları gevşetilir.', 'Round ' + pass + ' begins: every vertex is scanned in alphabetical order, its edges relaxed.'), L_PASS);
        var changed = false;
        V.forEach(function (u) {
          if (dist[u] === Infinity) { S.step(T('`' + u + '`\'nin uzaklığı hâlâ `inf` -- kenarları atlanır.', '`' + u + '`\'s distance is still `inf` -- its edges are skipped.'), L_SCANNED); return; }
          var kids = adj[u], relaxed = [];
          kids.forEach(function (n) {
            var cand = dist[u] + n.w;
            var eid = eidOf[u + '>' + n.to]; if (eid !== undefined) S.set('e' + eid, { style: 'active' });
            if (cand < dist[n.to]) { dist[n.to] = cand; parent[n.to] = u; changed = true; relaxed.push(n.to); if (eid !== undefined) S.set('e' + eid, { style: 'new' }); }
          });
          refreshRows();
          if (kids.length) {
            S.step(T(relaxed.length ? ('`' + u + '` taranır: ' + relaxed.map(function (v) { return v + '=' + dist[v]; }).join(', ') + ' için daha kısa bir yol bulundu.')
                                     : ('`' + u + '` taranır: hiçbir kenar gevşemedi.'),
                     relaxed.length ? ('`' + u + '` is scanned: a shorter path was found for ' + relaxed.map(function (v) { return v + '=' + dist[v]; }).join(', ') + '.')
                                     : ('`' + u + '` is scanned: no edge relaxed.')),
                   relaxed.length ? L_RELAX_YES : L_RELAX_NO);
          }
          kids.forEach(function (n) { var eid = eidOf[u + '>' + n.to]; if (eid !== undefined) S.set('e' + eid, { style: 'dim' }); });
        });
        if (!changed) { S.step(T('Bu turda hiçbir uzaklık değişmedi: sonuç zaten kararlı, kalan turlar atlanabilir.', 'Nothing changed this round: the result is already stable, the remaining rounds can be skipped.'), L_EARLY); break; }
      }

      var unstable = {};
      edges.forEach(function (e) {
        var eid = eidOf[e.a + '>' + e.b];
        if (dist[e.a] === Infinity) return;
        var cand = dist[e.a] + e.w;
        if (cand < dist[e.b]) { unstable[e.b] = true; if (eid !== undefined) S.set('e' + eid, { style: 'del' }); }
      });
      var negCycleVertices = Object.keys(unstable).sort();
      S.step(T('DENETLEME TURU: her kenar bir kez daha kontrol edilir. Hâlâ gevşeyebilen varsa (' + (negCycleVertices.length ? negCycleVertices.join(', ') : T('yok', 'none').tr) + '), bu düğümler bir NEGATİF DÖNGÜNÜN içinde ya da onun ardından geliyor.',
               'DETECTION ROUND: every edge is checked once more. Anything that can still relax (' + (negCycleVertices.length ? negCycleVertices.join(', ') : 'none') + ') means those vertices lie inside, or after, a NEGATIVE CYCLE.'), L_DETECT);
      if (negCycleVertices.length) {
        S.step(T('NEGATİF DÖNGÜ bulundu: `' + negCycleVertices.join(', ') + '` için `dist` iyi tanımlı değil (sonsuza kadar küçülebilir).',
                 'A NEGATIVE CYCLE was found: `dist` is not well defined for `' + negCycleVertices.join(', ') + '` (it could keep shrinking forever).'), L_FOUND);
      }
      var distOut = {}; V.forEach(function (v) { distOut[v] = dist[v] === Infinity ? null : dist[v]; });
      S.result = { dist: distOut, parent: parent, negCycle: negCycleVertices.length > 0, negCycleVertices: negCycleVertices };
      S.step(T('Bitti. Uzaklıklar: ' + V.map(function (v) { return v + '=' + (dist[v] === Infinity ? INF : dist[v]); }).join(', ') + (negCycleVertices.length ? '. Negatif döngü var.' : '. Negatif döngü yok.'),
               'Done. Distances: ' + V.map(function (v) { return v + '=' + (dist[v] === Infinity ? INF : dist[v]); }).join(', ') + (negCycleVertices.length ? '. There is a negative cycle.' : '. No negative cycle.')));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
