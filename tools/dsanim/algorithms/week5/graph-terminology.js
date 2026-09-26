/* Week 5 -- graph vocabulary: vertex, edge, degree (in/out for directed), path, cycle, connected component,
 * self-loop, parallel (multi-) edge, weighted graph. Input is an edge list "A-B B-C:4 A>D" (see input.parse). */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_V   16',
    '#define MAX_LBL 4',
    '',
    'typedef struct Edge {',
    '    int to;               /* index of the other endpoint */',
    '    int weight;           /* 1 if the graph is unweighted */',
    '    struct Edge *next;',
    '} Edge;',
    '',
    'typedef struct Graph {',
    '    char label[MAX_V][MAX_LBL];',
    '    Edge *adj[MAX_V];     /* adjacency list, one linked list per vertex */',
    '    int vertex_count;',
    '    int directed;         /* 0 = undirected, 1 = directed */',
    '} Graph;',
    '',
    'int out_degree(Graph *g, int v) {',
    '    int d = 0;',
    '    for (Edge *e = g->adj[v]; e != NULL; e = e->next)',
    '        d++;              /* undirected: this already counts BOTH ends written once each -> degree */',
    '    return d;',
    '}',
    '',
    'int in_degree(Graph *g, int v) {   /* directed only: how many edges point INTO v */',
    '    int d = 0;',
    '    for (int u = 0; u < g->vertex_count; u++)',
    '        for (Edge *e = g->adj[u]; e != NULL; e = e->next)',
    '            if (e->to == v) d++;',
    '    return d;',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 16;',
    '',
    'class Edge {',
    '    int to;               // index of the other endpoint',
    '    int weight;           // 1 if the graph is unweighted',
    '    Edge next;',
    '}',
    '',
    'class Graph {',
    '    String[] label = new String[MAX_V];',
    '    Edge[] adj = new Edge[MAX_V];   // adjacency list, one linked list per vertex',
    '    int vertexCount;',
    '    boolean directed;',
    '}',
    '',
    'static int outDegree(Graph g, int v) {',
    '    int d = 0;',
    '    for (Edge e = g.adj[v]; e != null; e = e.next)',
    '        d++;              // undirected: this already counts BOTH ends written once each -> degree',
    '    return d;',
    '}',
    '',
    'static int inDegree(Graph g, int v) {   // directed only: how many edges point INTO v',
    '    int d = 0;',
    '    for (int u = 0; u < g.vertexCount; u++)',
    '        for (Edge e = g.adj[u]; e != null; e = e.next)',
    '            if (e.to == v) d++;',
    '    return d;',
    '}'
  ];
  var LINES_STRUCT = { c: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], java: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] };
  var LINES_DEGREE = { c: [17, 18, 19, 20, 21], java: [16, 17, 18, 19, 20] };
  var LINES_INDEG = { c: [24, 25, 26, 27, 28, 29], java: [23, 24, 25, 26, 27, 28] };

  /* ---- edge-list parsing / formatting, shared shape across every Week-5 file ---- */
  var EDGE_RE = /^([A-Za-z0-9]{1,3})(-|>)([A-Za-z0-9]{1,3})(?::(\d+))?$/;
  function parseGraph(text) {
    var s = String(text).trim();
    if (!s) throw T('Metin boş: en az bir kenar yazın (örn. "A-B").', 'The text is empty: write at least one edge (e.g. "A-B").');
    var toks = s.split(/\s+/).filter(Boolean), edges = [], directed = null;
    for (var i = 0; i < toks.length; i++) {
      var tok = toks[i], m = EDGE_RE.exec(tok);
      if (!m) throw T('"' + tok + '" anlaşılmadı: bir kenar VERTEX-VERTEX (yönsüz) ya da VERTEX>VERTEX (yönlü) biçiminde olmalı, opsiyonel ":AĞIRLIK" ile (etiket 1-3 karakter).',
                       '"' + tok + '" is not understood: an edge must look like VERTEX-VERTEX (undirected) or VERTEX>VERTEX (directed), with an optional ":WEIGHT" (label 1-3 characters).');
      var kind = m[2] === '>';
      if (directed === null) directed = kind;
      else if (directed !== kind) throw T('Bütün kenarlar aynı türde olmalı: ya hepsi yönsüz (-), ya hepsi yönlü (>).',
                                           'All edges must be the same kind: either all undirected (-) or all directed (>).');
      edges.push({ a: m[1], b: m[3], w: m[4] !== undefined ? parseInt(m[4], 10) : null });
    }
    return { directed: !!directed, edges: edges };
  }
  function formatGraph(d) { return d.edges.map(function (e) { return e.a + (d.directed ? '>' : '-') + e.b + (e.w !== null ? ':' + e.w : ''); }).join(' '); }
  function verticesOf(edges) { var set = {}; edges.forEach(function (e) { set[e.a] = 1; set[e.b] = 1; }); return Object.keys(set).sort(); }
  function label(i) { var s = '', n = i + 1; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }

  /* ---- circle layout: n vertices evenly spaced on a circle (a chord between any two never touches a third
   *  point of the same circle, so edges never pass through a vertex); used by every Week-5 file. ---- */
  function layoutCircle(vertices) {
    var n = vertices.length, R = Math.max(140, 16 * n), cx = R + 46, cy = R + 46, pos = {};
    vertices.forEach(function (v, i) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / n;
      pos[v] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) };
    });
    return { pos: pos, cx: cx, cy: cy };
  }

  D.define({
    id: 'graph-terminology',
    title: T('Çizge terimleri: düğüm, kenar, derece, yol, döngü, bağlı bileşen', 'Graph vocabulary: vertex, edge, degree, path, cycle, connected component'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('8 düğüm, ağırlıklı: döngü, öz-döngü, çoklu kenar ve 2 bileşen', '8 vertices, weighted: a cycle, a self-loop, a multi-edge and 2 components'),
        data: { directed: false, edges: [
          { a: 'A', b: 'B', w: 3 }, { a: 'B', b: 'C', w: 5 }, { a: 'C', b: 'A', w: 2 }, { a: 'C', b: 'D', w: 4 },
          { a: 'D', b: 'E', w: 1 }, { a: 'E', b: 'F', w: 6 }, { a: 'E', b: 'F', w: 9 }, { a: 'D', b: 'D', w: 7 },
          { a: 'G', b: 'H', w: 2 }, { a: 'F', b: 'C', w: 8 }
        ] } },
      { id: 'hard', level: 'hard', name: T('8 düğüm, yönlü: iki döngü, öz-döngü, çoklu kenar ve 2 zayıf bileşen', '8 vertices, directed: two cycles, a self-loop, a multi-edge and 2 weak components'),
        data: { directed: true, edges: [
          { a: 'P', b: 'Q', w: 3 }, { a: 'Q', b: 'R', w: 1 }, { a: 'R', b: 'P', w: 4 }, { a: 'R', b: 'S', w: 2 },
          { a: 'S', b: 'T', w: 5 }, { a: 'T', b: 'U', w: 1 }, { a: 'T', b: 'U', w: 1 }, { a: 'U', b: 'U', w: 6 },
          { a: 'Q', b: 'S', w: 2 }, { a: 'S', b: 'Q', w: 3 }, { a: 'V', b: 'W', w: 2 }, { a: 'W', b: 'V', w: 3 }
        ] } },
      { id: 'no-cycle', level: 'edge', name: T('11 düğümlük zincir: döngüsüz, ağırlıksız, bağlı', 'An 11-vertex chain: no cycle, unweighted, connected'),
        data: { directed: false, edges: (function () {
          var out = [], letters = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11'];
          for (var i = 0; i < letters.length - 1; i++) out.push({ a: letters[i], b: letters[i + 1], w: null });
          return out;
        })() } },
      { id: 'single', level: 'edge', name: T('Tek düğüm (bir öz-döngüyle gösterilir)', 'A single vertex (shown with a self-loop)'),
        data: { directed: false, edges: [{ a: 'A', b: 'A', w: null }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of edges (the guide's size() count for every Week-5 file). */
    size: function (d) { return d.edges.length; },
    /** Independent computation (union-find for components/undirected cycle, DFS colouring for directed cycle) --
     *  a completely different technique from build()'s BFS colouring + DFS-tree cycle reconstruction. */
    reference: function (d) {
      var edges = d.edges, directed = d.directed;
      var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
      var vertices = Object.keys(vset).sort();
      var degree = null, indegree = null, outdegree = null;
      if (!directed) { degree = {}; vertices.forEach(function (v) { degree[v] = 0; }); edges.forEach(function (e) { degree[e.a]++; degree[e.b]++; }); }
      else {
        indegree = {}; outdegree = {};
        vertices.forEach(function (v) { indegree[v] = 0; outdegree[v] = 0; });
        edges.forEach(function (e) { outdegree[e.a]++; indegree[e.b]++; });
      }
      var parent = {}; vertices.forEach(function (v) { parent[v] = v; });
      function find(x) { while (parent[x] !== x) x = parent[x]; return x; }
      edges.forEach(function (e) { var ra = find(e.a), rb = find(e.b); if (ra !== rb) parent[ra] = rb; });
      var roots = {}; vertices.forEach(function (v) { roots[find(v)] = 1; });
      var components = Object.keys(roots).length;
      var hasCycle;
      if (!directed) {
        var p2 = {}; vertices.forEach(function (v) { p2[v] = v; });
        function f2(x) { while (p2[x] !== x) x = p2[x]; return x; }
        hasCycle = false;
        edges.forEach(function (e) { var ra = f2(e.a), rb = f2(e.b); if (ra === rb) hasCycle = true; else p2[ra] = rb; });
      } else {
        var adj = {}; vertices.forEach(function (v) { adj[v] = []; });
        edges.forEach(function (e) { adj[e.a].push(e.b); });
        var color = {}; vertices.forEach(function (v) { color[v] = 0; });
        var cyc = false;
        (function () {
          function dfs(u) { color[u] = 1; adj[u].forEach(function (v) { if (color[v] === 1) cyc = true; else if (color[v] === 0) dfs(v); }); color[u] = 2; }
          vertices.forEach(function (v) { if (color[v] === 0) dfs(v); });
        })();
        hasCycle = cyc;
      }
      return { vertexCount: vertices.length, edgeCount: edges.length, degree: degree, indegree: indegree, outdegree: outdegree, components: components, hasCycle: hasCycle };
    },
    random: function (level, r) {
      var n = { easy: 8, normal: 10, hard: 12, extreme: 14 }[level] || 10;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var directed = r() < 0.45;
      var weighted = r() < 0.5;
      var m = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level] || 12;
      function w() { return weighted ? D.randInt(r, 1, 20) : null; }
      var groups;
      if (n >= 6 && r() < 0.4) { var split = D.randInt(r, 3, n - 3); groups = [vertices.slice(0, split), vertices.slice(split)]; }
      else groups = [vertices];
      var edges = [];
      groups.forEach(function (g) { for (var i2 = 1; i2 < g.length; i2++) { var j = D.randInt(r, 0, i2 - 1); edges.push({ a: g[j], b: g[i2], w: w() }); } });
      while (edges.length < m) {
        var g2 = groups[D.randInt(r, 0, groups.length - 1)];
        var x = g2[D.randInt(r, 0, g2.length - 1)];
        var y = r() < 0.1 ? x : g2[D.randInt(r, 0, g2.length - 1)];
        edges.push({ a: x, b: y, w: w() });
      }
      return { directed: directed, edges: edges };
    },
    input: {
      hint: T('Örnek: A-B B-C:4 A>D   (yönsüz "-" ya da yönlü ">", opsiyonel ":AĞIRLIK"; etiket 1-3 karakter; bütün kenarlar aynı türde olmalı)',
              'Example: A-B B-C:4 A>D   (undirected "-" or directed ">", optional ":WEIGHT"; label 1-3 characters; all edges must be the same kind)'),
      parse: parseGraph,
      format: formatGraph,
      bad: ['', 'A~B', 'A-B:x', 'A>B B-C', 'ABCD-B', 'A-']
    },
    build: function (S, d) {
      var edges = d.edges, directed = d.directed, vertices = verticesOf(edges);
      var lay = layoutCircle(vertices), pos = lay.pos, cx = lay.cx, cy = lay.cy;
      vertices.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: 'normal' }); });

      var seen = {}, edgeKey = [];
      edges.forEach(function (e, idx) {
        var id = 'e' + idx;
        if (e.a === e.b) { edgeKey.push(null); return; } /* self-loops are drawn on demand, not part of the base picture */
        var key = directed ? (e.a + '>' + e.b) : [e.a, e.b].sort().join('|');
        var k = seen[key] === undefined ? 0 : seen[key] + 1; seen[key] = k;
        var bend = k === 0 ? 0 : (k % 2 === 1 ? 20 * Math.ceil(k / 2) : -20 * Math.ceil(k / 2));
        edgeKey.push(key);
        S.arrow(id, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: directed, bend: bend, style: 'normal', text: e.w !== null ? String(e.w) : undefined });
      });

      S.step(T('Bir ÇİZGE (graph) iki şeyden oluşur: DÜĞÜMLER (vertex/node, daireler) ve onları ikişer ikişer bağlayan KENARLAR (edge, çizgiler). Bu çizgede ' + vertices.length + ' düğüm, ' + edges.length + ' kenar var.',
               'A GRAPH is made of two things: VERTICES (nodes, the circles) and EDGES (the lines) connecting them two at a time. This graph has ' + vertices.length + ' vertices and ' + edges.length + ' edges.'),
             LINES_STRUCT);

      S.step(directed
        ? T('Bu bir YÖNLÜ (directed) çizge: her kenarın bir yönü var (oktan görülür), `A>B` "A\'dan B\'ye" demektir ve `B>A` farklı bir kenardır.',
            'This is a DIRECTED graph: every edge has a direction (shown by the arrowhead), `A>B` means "from A to B", and `B>A` would be a different edge.')
        : T('Bu bir YÖNSÜZ (undirected) çizge: bir kenar iki yönde de kullanılabilir, `A-B` ile `B-A` aynı kenardır.',
            'This is an UNDIRECTED graph: an edge can be used in either direction, `A-B` and `B-A` are the same edge.'));

      var hasWeight = edges.some(function (e) { return e.w !== null; });
      if (hasWeight) {
        var we = edges.filter(function (e) { return e.w !== null; })[0];
        var weIdx = edges.indexOf(we), weId = 'e' + weIdx;
        S.set(weId, { style: 'hl' }); S.at(weIdx);
        S.step(T('AĞIRLIKLI (weighted) çizge: her kenar bir sayı (`weight`) taşır -- örn. `' + we.a + (directed ? '>' : '-') + we.b + '` kenarının ağırlığı `' + we.w + '`. Ağırlıksız bir çizgede kenarlar yalnızca "bağlı mı, değil mi" bilgisini taşır.',
                 'A WEIGHTED graph: every edge carries a number (`weight`) -- e.g. edge `' + we.a + (directed ? '>' : '-') + we.b + '` has weight `' + we.w + '`. In an unweighted graph, edges only say "connected or not".'));
        S.set(weId, { style: 'normal' }); S.at(null);
      } else {
        S.step(T('Bu çizge AĞIRLIKSIZ (unweighted): kenarların üstünde sayı yok, yalnızca hangi düğümlerin bağlı olduğunu gösterirler.',
                 'This graph is UNWEIGHTED: the edges carry no number, they only show which vertices are connected.'));
      }

      var selfLoops = edges.filter(function (e) { return e.a === e.b; });
      if (selfLoops.length) {
        var sv = selfLoops[0].a, svIdx = edges.indexOf(selfLoops[0]);
        var dx0 = pos[sv].x - cx, dy0 = pos[sv].y - cy, n0 = Math.hypot(dx0, dy0) || 1, ux = dx0 / n0, uy = dy0 / n0;
        S.circle('loopmark', { x: pos[sv].x + ux * 46, y: pos[sv].y + uy * 46, r: 3, text: '', style: 'dim' });
        S.arrow('loopArrow', { from: 'n' + sv, to: 'loopmark', kind: 'center', bend: 22, head: true, style: 'hl', text: selfLoops[0].w !== null ? String(selfLoops[0].w) : undefined });
        S.set('n' + sv, { style: 'hl' }); S.at(svIdx);
        S.step(T('ÖZ-DÖNGÜ (self-loop): bir kenarın iki ucu da AYNI düğüm -- burada `' + sv + '`\'dan `' + sv + '`\'ya. Derecesine iki kez sayılır (bir giden, bir gelen gibi).',
                 'A SELF-LOOP: an edge whose two endpoints are the SAME vertex -- here from `' + sv + '` to `' + sv + '`. It counts twice toward that vertex\'s degree (once as outgoing, once as incoming).'));
        S.remove('loopmark', 'loopArrow');
        S.set('n' + sv, { style: 'normal' }); S.at(null);
      }

      var pairCount = {}, pairIds = {};
      edges.forEach(function (e, idx) { if (e.a === e.b) return; var k = edgeKey[idx]; pairCount[k] = (pairCount[k] || 0) + 1; (pairIds[k] = pairIds[k] || []).push('e' + idx); });
      var multiKey = Object.keys(pairCount).filter(function (k) { return pairCount[k] > 1; })[0];
      if (multiKey) {
        pairIds[multiKey].forEach(function (id) { S.set(id, { style: 'hl' }); });
        var mv = multiKey.split(directed ? '>' : '|');
        S.at(parseInt(pairIds[multiKey][0].slice(1), 10));
        S.step(T('ÇOKLU KENAR (parallel / multi-edge): aynı iki düğüm arasında birden fazla kenar -- burada `' + mv[0] + '` ile `' + mv[1] + '` arasında ' + pairCount[multiKey] + ' tane. Bu tür çizgelere MULTIGRAPH denir.',
                 'PARALLEL EDGES (a multi-edge): more than one edge between the same two vertices -- here ' + pairCount[multiKey] + ' between `' + mv[0] + '` and `' + mv[1] + '`. A graph that allows this is called a MULTIGRAPH.'));
        pairIds[multiKey].forEach(function (id) { S.set(id, { style: 'normal' }); });
        S.at(null);
      }

      function annotate(v, text) { var lid = 'lab_' + v; var dx = pos[v].x - cx, dy = pos[v].y - cy, n2 = Math.hypot(dx, dy) || 1; var lx = pos[v].x + dx / n2 * 40, ly = pos[v].y + dy / n2 * 40; if (S.has(lid)) S.set(lid, { text: text }); else S.label(lid, { x: lx, y: ly, text: text, anchor: 'middle', size: 15, mono: true, style: 'dim' }); }
      function clearAnnotate() { vertices.forEach(function (v) { var lid = 'lab_' + v; if (S.has(lid)) S.remove(lid); }); }

      if (!directed) {
        var degree = {}; vertices.forEach(function (v) { var deg = 0; edges.forEach(function (e) { if (e.a === v) deg++; if (e.b === v) deg++; }); degree[v] = deg; });
        vertices.forEach(function (v) { annotate(v, 'deg ' + degree[v]); });
        S.step(T('DERECE (degree): bir düğüme değen kenar sayısı (öz-döngü iki kez sayılır). Her düğümün derecesi burada gösteriliyor.',
                 'DEGREE: the number of edges touching a vertex (a self-loop counts twice). Every vertex\'s degree is shown here.'), LINES_DEGREE);
        clearAnnotate();
      } else {
        var indeg = {}, outdeg = {};
        vertices.forEach(function (v) { var id_ = 0, od = 0; edges.forEach(function (e) { if (e.b === v) id_++; if (e.a === v) od++; }); indeg[v] = id_; outdeg[v] = od; });
        vertices.forEach(function (v) { annotate(v, 'in ' + indeg[v] + ' out ' + outdeg[v]); });
        S.step(T('YÖNLÜ çizgede derece ikiye ayrılır: GELEN DERECE (in-degree, düğüme giren kenar sayısı) ve GİDEN DERECE (out-degree, düğümden çıkan kenar sayısı).',
                 'In a DIRECTED graph, degree splits in two: IN-DEGREE (edges coming into the vertex) and OUT-DEGREE (edges going out of it).'), LINES_INDEG);
        clearAnnotate();
      }

      /* connected components: BFS colouring (undirected adjacency, ignoring direction) -- a different technique
       * from reference()'s union-find. */
      var undirAdj = {}; vertices.forEach(function (v) { undirAdj[v] = []; });
      edges.forEach(function (e) { if (e.a !== e.b) { undirAdj[e.a].push(e.b); undirAdj[e.b].push(e.a); } });
      vertices.forEach(function (v) { undirAdj[v].sort(); });
      var compOf = {}, groups2 = [], PALETTE = ['hl', 'active', 'new', 'del'];
      vertices.forEach(function (v) {
        if (compOf[v] !== undefined) return;
        var cid = groups2.length, group = [v], q = [v], qi = 0; compOf[v] = cid;
        while (qi < q.length) { var u = q[qi++]; undirAdj[u].forEach(function (w2) { if (compOf[w2] === undefined) { compOf[w2] = cid; group.push(w2); q.push(w2); } }); }
        groups2.push(group);
      });
      groups2.forEach(function (g, i) { g.forEach(function (v) { S.set('n' + v, { style: PALETTE[i % PALETTE.length] }); }); });
      S.step(groups2.length > 1
        ? T('BAĞLI BİLEŞEN (connected component): birbirinden erişilebilen düğümlerin en büyük kümesi. Bu çizge BAĞLI DEĞİL (disconnected): ' + groups2.length + ' bileşeni var -- ' + groups2.map(function (g) { return '{' + g.join(',') + '}'; }).join(', ') + '.',
            'A CONNECTED COMPONENT: a maximal set of vertices reachable from one another. This graph is DISCONNECTED: it has ' + groups2.length + ' components -- ' + groups2.map(function (g) { return '{' + g.join(',') + '}'; }).join(', ') + '.')
        : T('Bu çizge BAĞLI (connected): her düğümden her düğüme (yön göz ardı edilerek) ulaşılabilir, tek bir bileşeni var.',
            'This graph is CONNECTED: every vertex can reach every other vertex (ignoring direction), so it has exactly one component.'));
      vertices.forEach(function (v) { S.set('n' + v, { style: 'normal' }); });

      /* path -- BFS inside the largest component (ignoring direction, for simplicity here; direction-respecting
       * shortest paths are the subject of path-finding-bfs.js later this week) */
      var largest = groups2.slice().sort(function (a, b) { return b.length - a.length; })[0];
      if (largest.length >= 2) {
        var gs = largest.slice().sort(), s = gs[0], t = gs[gs.length - 1];
        var parentP = {}, visitedP = {}; visitedP[s] = true; var qp = [s], qpi = 0;
        while (qpi < qp.length) { var u2 = qp[qpi++]; if (u2 === t) break; undirAdj[u2].forEach(function (v2) { if (!visitedP[v2]) { visitedP[v2] = true; parentP[v2] = u2; qp.push(v2); } }); }
        var path = [t], cur = t; while (cur !== s) { cur = parentP[cur]; path.push(cur); } path.reverse();
        path.forEach(function (v) { S.set('n' + v, { style: 'new' }); });
        for (var pi = 0; pi < path.length - 1; pi++) {
          var a2 = path[pi], b2 = path[pi + 1];
          for (var ei = 0; ei < edges.length; ei++) { var e2 = edges[ei]; if ((e2.a === a2 && e2.b === b2) || (!directed && e2.a === b2 && e2.b === a2)) { S.set('e' + ei, { style: 'new' }); break; } }
        }
        S.step(T('YOL (path): bir düğümü tekrarlamadan bir kenar dizisiyle başka bir düğüme gitmek. Örnek: `' + path.join('-') + '`, `' + s + '`\'dan `' + t + '`\'ye.',
                 'A PATH: a sequence of edges leading from one vertex to another without repeating a vertex. Example: `' + path.join('-') + '`, from `' + s + '` to `' + t + '`.'));
        path.forEach(function (v) { S.set('n' + v, { style: 'normal' }); });
        for (var pi2 = 0; pi2 < path.length - 1; pi2++) {
          var a3 = path[pi2], b3 = path[pi2 + 1];
          for (var ei2 = 0; ei2 < edges.length; ei2++) { var e3 = edges[ei2]; if ((e3.a === a3 && e3.b === b3) || (!directed && e3.a === b3 && e3.b === a3)) { S.set('e' + ei2, { style: 'normal' }); break; } }
        }
      } else {
        S.step(T('Tek düğümlü bir çizgede gösterilecek bir yol yok: bir yolun en az iki farklı düğümü olmalı.',
                 'A single-vertex graph has no path to show: a path needs at least two distinct vertices.'));
      }

      /* cycle: DFS tree + back-edge reconstruction -- a different technique from reference()'s union-find /
       * DFS-colouring boolean-only check */
      var adjD = {}; vertices.forEach(function (v) { adjD[v] = []; });
      if (!directed) edges.forEach(function (e) { if (e.a === e.b) adjD[e.a].push({ v: e.a, self: true }); else { adjD[e.a].push({ v: e.b, self: false }); adjD[e.b].push({ v: e.a, self: false }); } });
      else edges.forEach(function (e) { adjD[e.a].push({ v: e.b, self: e.a === e.b }); });
      vertices.forEach(function (v) { adjD[v].sort(function (x, y) { return x.v < y.v ? -1 : x.v > y.v ? 1 : 0; }); });
      var colorC = {}, parentC = {}, foundCycle = null;
      vertices.forEach(function (v) { colorC[v] = 0; });
      (function () {
        function visit(u, par) {
          if (foundCycle) return;
          colorC[u] = 1; var skipped = false;
          for (var i2 = 0; i2 < adjD[u].length && !foundCycle; i2++) {
            var nb = adjD[u][i2], v3 = nb.v;
            if (nb.self) { foundCycle = [u, u]; return; }
            if (!directed && v3 === par && !skipped) { skipped = true; continue; }
            if (colorC[v3] === 0) { parentC[v3] = u; visit(v3, u); }
            else if (colorC[v3] === 1) {
              var path2 = [u], cur2 = u;
              while (cur2 !== v3) { cur2 = parentC[cur2]; path2.push(cur2); }  /* path2: u ... v3 (ancestor) */
              path2.reverse();      /* v3 (ancestor) ... u */
              path2.push(v3);       /* close the loop: the back edge u->v3 returns to the start */
              foundCycle = path2;
            }
          }
          colorC[u] = 2;
        }
        vertices.forEach(function (v) { if (colorC[v] === 0 && !foundCycle) visit(v, null); });
      })();
      if (foundCycle) {
        foundCycle.forEach(function (v) { S.set('n' + v, { style: 'hl' }); });
        S.step(T('DÖNGÜ (cycle): başladığı düğüme geri dönen bir yol. Örnek: `' + foundCycle.join('-') + '`.',
                 'A CYCLE: a path that returns to the vertex it started from. Example: `' + foundCycle.join('-') + '`.'));
        foundCycle.forEach(function (v) { S.set('n' + v, { style: 'normal' }); });
      } else {
        S.step(T('Bu çizgede DÖNGÜ YOK: bağlı olsa bile, herhangi iki düğüm arasında birden fazla yol bulunmuyor.',
                 'This graph has NO CYCLE: even where it is connected, there is never more than one path between two vertices.'));
      }

      S.result = {
        vertexCount: vertices.length, edgeCount: edges.length,
        degree: directed ? null : (function () { var o = {}; vertices.forEach(function (v) { var deg = 0; edges.forEach(function (e) { if (e.a === v) deg++; if (e.b === v) deg++; }); o[v] = deg; }); return o; })(),
        indegree: directed ? (function () { var o = {}; vertices.forEach(function (v) { var c = 0; edges.forEach(function (e) { if (e.b === v) c++; }); o[v] = c; }); return o; })() : null,
        outdegree: directed ? (function () { var o = {}; vertices.forEach(function (v) { var c = 0; edges.forEach(function (e) { if (e.a === v) c++; }); o[v] = c; }); return o; })() : null,
        components: groups2.length,
        hasCycle: !!foundCycle
      };
      S.step(T('Özet: ' + vertices.length + ' düğüm, ' + edges.length + ' kenar, ' + groups2.length + ' bileşen, döngü ' + (foundCycle ? 'var' : 'yok') + '.',
               'Summary: ' + vertices.length + ' vertices, ' + edges.length + ' edges, ' + groups2.length + ' component(s), a cycle ' + (foundCycle ? 'exists' : 'does not exist') + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
