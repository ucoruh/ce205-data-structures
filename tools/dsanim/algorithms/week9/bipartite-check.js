/* Week 9 -- bipartite check by 2-colouring: BFS (as in week 5's bfs.js) colours the start vertex 0, every
 * neighbour the OPPOSITE colour, and queues it. If a already-coloured neighbour has the SAME colour as the
 * current vertex, that edge closes an ODD cycle -- the graph is not bipartite. One BFS per component (a
 * disconnected graph may have several). Same undirected edge-list input as week 5's bfs.js (no weights needed). */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_V 32',
    'int color_of[MAX_V];        /* -1 = uncoloured, 0/1 = the two sides */',
    'int queue_data[MAX_V], front, rear;',
    '',
    'void enqueue(int v) { queue_data[rear] = v; rear++; }',
    'int  dequeue(void)  { int v = queue_data[front]; front++; return v; }',
    '',
    'int is_bipartite(Graph *g) {',
    '    for (int i = 0; i < g->vertex_count; i++) color_of[i] = -1;',
    '    for (int s = 0; s < g->vertex_count; s++) {          /* alphabetical: one BFS per component */',
    '        if (color_of[s] != -1) continue;',
    '        color_of[s] = 0; front = rear = 0; enqueue(s);',
    '        while (front < rear) {',
    '            int u = dequeue();',
    '            for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {  /* alphabetical order */',
    '                if (color_of[n->to] == -1) { color_of[n->to] = 1 - color_of[u]; enqueue(n->to); }',
    '                else if (color_of[n->to] == color_of[u]) return 0;  /* same colour -> an odd cycle */',
    '            }',
    '        }',
    '    }',
    '    return 1;',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    'int[] colorOf = new int[MAX_V];         // -1 = uncoloured, 0/1 = the two sides',
    'int[] queueData = new int[MAX_V]; int front, rear;',
    '',
    'void enqueue(int v) { queueData[rear] = v; rear++; }',
    'int  dequeue()      { int v = queueData[front]; front++; return v; }',
    '',
    'boolean isBipartite(Graph g) {',
    '    for (int i = 0; i < g.vertexCount; i++) colorOf[i] = -1;',
    '    for (int s = 0; s < g.vertexCount; s++) {             // alphabetical: one BFS per component',
    '        if (colorOf[s] != -1) continue;',
    '        colorOf[s] = 0; front = rear = 0; enqueue(s);',
    '        while (front < rear) {',
    '            int u = dequeue();',
    '            for (AdjNode n = g.adj[u]; n != null; n = n.next) {  // alphabetical order',
    '                if (colorOf[n.to] == -1) { colorOf[n.to] = 1 - colorOf[u]; enqueue(n.to); }',
    '                else if (colorOf[n.to] == colorOf[u]) return false; // same colour -> an odd cycle',
    '            }',
    '        }',
    '    }',
    '    return true;',
    '}'
  ];
  /* C_CODE/JAVA_CODE mirror line-for-line (LN reuses one array). Positions: 9=reset color[] (ONE-TIME),
   * 10=for(s) [COND, one BFS root per component], 11=if(color[s]!=-1) continue [COND], 13=while(front<rear)
   * [COND, per dequeue], 15=for(n) [COND, per neighbour], 16=if(color[n]==-1) [COND, uncoloured branch],
   * 17=else if(color[n]==color[u]) [COND, conflict branch]. */
  function LN(arr) { return { c: arr, java: arr }; }
  var L_INIT = LN([{ n: 9, note: T('i < vertex_count mi? evet -- her düğüm için color[i]=-1', 'i < vertex_count? yes -- color[i]=-1 for every vertex') }]);
  var NOTE_ROOT_LOOP = T('s < vertex_count mi? evet -- sıradaki düğüme bakılıyor', 's < vertex_count? yes -- looking at the next vertex');
  var L_ROOTNEW = LN([{ n: 10, note: NOTE_ROOT_LOOP }, { n: 11, note: T('color[s] != -1 mi? hayır -- renksiz, yeni bir bileşen', 'color[s] != -1? no -- uncoloured, a new component') }, 12]);
  var L_ROOTSKIP = LN([{ n: 10, note: NOTE_ROOT_LOOP }, { n: 11, note: T('color[s] != -1 mi? evet -- zaten renkli, atlanır', 'color[s] != -1? yes -- already coloured, skipped') }]);
  var L_DEQ = LN([{ n: 13, note: T('front < rear mi? evet -- kuyrukta hâlâ düğüm var', 'front < rear? yes -- the queue still has vertices') }, 14]);
  var NOTE_LOOP_N = T('n != NULL mi? evet -- sıradaki komşuya bakılıyor', 'n != NULL? yes -- looking at the next neighbour');
  var L_COLOR = LN([{ n: 15, note: NOTE_LOOP_N }, { n: 16, note: T('color[n] == -1 mi? evet -- renksiz', 'color[n] == -1? yes -- uncoloured') }]);
  var L_CONFLICT = LN([{ n: 15, note: NOTE_LOOP_N }, { n: 16, note: T('color[n] == -1 mi? hayır', 'color[n] == -1? no') }, { n: 17, note: T('color[n] == color[u] mi? evet -- aynı renk, tek sayılı döngü', 'color[n] == color[u]? yes -- same colour, an odd cycle') }]);
  var L_OK = { c: [21], java: [21] };

  var EDGE_RE = /^([A-Za-z0-9]{1,3})-([A-Za-z0-9]{1,3})$/;
  function parseGraph(text) {
    var toks = String(text).trim().split(/\s+/).filter(Boolean);
    if (!toks.length) throw T('En az bir kenar yazın: A-B B-C ...', 'Write at least one edge: A-B B-C ...');
    var edges = [];
    for (var i = 0; i < toks.length; i++) {
      var m = EDGE_RE.exec(toks[i]);
      if (!m) throw T('"' + toks[i] + '" anlaşılmadı: yönsüz kenar VERTEX-VERTEX biçiminde olmalı.', '"' + toks[i] + '" is not understood: an undirected edge must look like VERTEX-VERTEX.');
      if (m[1] === m[2]) throw T('Öz-döngüler bu örnekte desteklenmiyor: "' + toks[i] + '".', 'Self-loops are not supported in this example: "' + toks[i] + '".');
      edges.push({ a: m[1], b: m[2] });
    }
    return { edges: edges };
  }
  function formatGraph(d) { return d.edges.map(function (e) { return e.a + '-' + e.b; }).join(' '); }
  function verticesOf(edges) { var s = {}; edges.forEach(function (e) { s[e.a] = 1; s[e.b] = 1; }); return Object.keys(s).sort(); }
  function buildAdj(V, edges) {
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { adj[e.a].push(e.b); adj[e.b].push(e.a); });
    V.forEach(function (v) { adj[v].sort(); });
    return adj;
  }
  function layoutCircle(vertices) {
    var n = vertices.length, R = Math.max(140, 16 * n), cx = R + 46, cy = R + 46, pos = {};
    vertices.forEach(function (v, i) { var ang = -Math.PI / 2 + i * 2 * Math.PI / n; pos[v] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }; });
    return { pos: pos, cx: cx, cy: cy, R: R };
  }
  function label(i) { var s = '', n = i + 1; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }

  /** Independent computation: a DFS-based 2-colouring (colour a vertex, then recurse into its neighbours)
   *  instead of build()'s BFS -- a different traversal technique that must reach the same yes/no answer, since
   *  bipartiteness does not depend on which traversal finds the conflict. Only the boolean is checked. */
  function isBipartiteRef(edges) {
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    var V = Object.keys(vset).sort();
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { adj[e.a].push(e.b); adj[e.b].push(e.a); });
    V.forEach(function (v) { adj[v].sort(); });
    var color = {}; V.forEach(function (v) { color[v] = -1; });
    var ok = true;
    function dfs(u) {
      adj[u].forEach(function (v) {
        if (!ok) return;
        if (color[v] === -1) { color[v] = 1 - color[u]; dfs(v); }
        else if (color[v] === color[u]) ok = false;
      });
    }
    V.forEach(function (s) { if (color[s] === -1) { color[s] = 0; dfs(s); } });
    return { bipartite: ok };
  }

  D.define({
    id: 'bipartite-check',
    title: T('İki parçalı (bipartite) çizge kontrolü', 'Bipartite graph check'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('8 düğüm, çift uzunluklu döngü + 2 köşegen, iki parçalı', '8 vertices, an even cycle plus 2 safe diagonals, bipartite'),
        data: { edges: [
          { a: 'A', b: 'B' }, { a: 'B', b: 'C' }, { a: 'C', b: 'D' }, { a: 'D', b: 'E' }, { a: 'E', b: 'F' },
          { a: 'F', b: 'G' }, { a: 'G', b: 'H' }, { a: 'H', b: 'A' }, { a: 'A', b: 'D' }, { a: 'C', b: 'F' }
        ] } },
      { id: 'hard', level: 'hard', name: T('10 düğüm, 2 bileşen, ikisi de iki parçalı', '10 vertices, 2 components, both bipartite'),
        data: { edges: [
          { a: 'A', b: 'B' }, { a: 'B', b: 'C' }, { a: 'C', b: 'D' }, { a: 'D', b: 'E' }, { a: 'E', b: 'F' },
          { a: 'F', b: 'A' }, { a: 'A', b: 'D' },
          { a: 'G', b: 'H' }, { a: 'H', b: 'I' }, { a: 'I', b: 'J' }, { a: 'J', b: 'G' }
        ] } },
      { id: 'odd-cycle', level: 'edge', name: T('Uç: A-B-C-D-E-A 5-döngüsü (tek sayılı), iki parçalı DEĞİL', 'Edge case: A-B-C-D-E-A is a 5-cycle (odd), NOT bipartite'),
        data: { edges: [
          { a: 'A', b: 'B' }, { a: 'B', b: 'C' }, { a: 'C', b: 'D' }, { a: 'D', b: 'E' }, { a: 'E', b: 'A' },
          { a: 'A', b: 'F' }, { a: 'F', b: 'G' }, { a: 'G', b: 'H' }, { a: 'H', b: 'F' }, { a: 'B', b: 'F' }
        ] } },
      { id: 'two-vertices', level: 'edge', name: T('Uç: 2 düğüm, 1 kenar', 'Edge case: 2 vertices, 1 edge'),
        data: { edges: [{ a: 'A', b: 'B' }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.edges.length; },
    reference: function (d) { return isBipartiteRef(d.edges); },
    random: function (level, r) {
      var n = { easy: 8, normal: 10, hard: 12, extreme: 14 }[level] || 10;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var directed = false;
      var m = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level] || 12;
      var groups;
      if (n >= 6 && r() < 0.35) { var split = D.randInt(r, 3, n - 3); groups = [vertices.slice(0, split), vertices.slice(split)]; }
      else groups = [vertices];
      var edges = [], seen = {};
      groups.forEach(function (g) { for (var i2 = 1; i2 < g.length; i2++) { var j = D.randInt(r, 0, i2 - 1); edges.push({ a: g[j], b: g[i2] }); seen[g[j] + '|' + g[i2]] = 1; seen[g[i2] + '|' + g[j]] = 1; } });
      var guard = 0;
      while (edges.length < m && guard < 1000) {
        guard++;
        var g2 = groups[D.randInt(r, 0, groups.length - 1)];
        var x = g2[D.randInt(r, 0, g2.length - 1)], y = g2[D.randInt(r, 0, g2.length - 1)];
        if (x === y) continue;
        var key = x + '|' + y;
        if (seen[key]) continue;
        edges.push({ a: x, b: y }); seen[key] = 1; seen[y + '|' + x] = 1;
      }
      return { edges: edges };
    },
    input: {
      hint: T('Örnek: A-B B-C C-A   (her kenar yönsüz, VERTEX-VERTEX, öz-döngü yok)', 'Example: A-B B-C C-A   (every edge is undirected, VERTEX-VERTEX, no self-loops)'),
      parse: parseGraph,
      format: formatGraph,
      bad: ['', 'A>B', 'A-A', 'A-B B C', 'A--B']
    },
    build: function (S, d) {
      var edges = d.edges, V = verticesOf(edges), adj = buildAdj(V, edges);
      var lay = layoutCircle(V), pos = lay.pos, cx = lay.cx, cy = lay.cy, R = lay.R;
      V.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: 'empty' }); });
      var eseen = {};
      edges.forEach(function (e, idx) {
        var key = [e.a, e.b].sort().join('|'), k = eseen[key] === undefined ? 0 : eseen[key] + 1; eseen[key] = k;
        S.arrow('e' + idx, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: false, bend: k ? 20 * k : 0, style: 'dim' });
      });

      var idxOf = {}; V.forEach(function (v, i) { idxOf[v] = i; });
      var ROWX0 = 40, STEP = 44, CW = 36, CH = 36;
      var COLY = cy + R + 66, QY = COLY + CH + 56;
      S.label('collbl', { x: ROWX0 - 14, y: COLY + 24, text: T('renk[] =', 'color[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('col' + i, { x: ROWX0 + i * STEP, y: COLY, w: CW, h: CH, text: '-', style: 'empty', size: 15, above: v }); });
      S.label('qlbl', { x: ROWX0 - 14, y: QY + 24, text: T('kuyruk =', 'queue ='), anchor: 'end', size: 14, mono: true });
      for (var qi = 0; qi < V.length; qi++) S.box('q' + qi, { x: ROWX0 + qi * STEP, y: QY, w: CW, h: CH, text: '', style: 'empty', size: 15 });

      var color = {}; V.forEach(function (v) { color[v] = -1; });
      function updateQueue(q) { for (var i = 0; i < V.length; i++) { if (i < q.length) S.set('q' + i, { text: q[i], style: 'active' }); else S.set('q' + i, { text: '', style: 'empty' }); } }
      function styleFor(c) { return c === -1 ? 'empty' : (c === 0 ? 'new' : 'active'); }
      function edgeIdBetween(u, v) { for (var ei = 0; ei < edges.length; ei++) { var e = edges[ei]; if ((e.a === u && e.b === v) || (e.a === v && e.b === u)) return ei; } return -1; }
      function setColor(v, c) { color[v] = c; S.set('col' + idxOf[v], { text: String(c), style: styleFor(c) }); S.set('n' + v, { style: styleFor(c) }); }

      S.step(T('İKİ RENK ile BFS: kökü 0 yaparız, her komşuya TERS renk veririz. Aynı renk komşu bulunursa, o kenar tek sayılı bir döngü kapatır -- iki parçalı DEĞİL.',
               'BFS with TWO COLOURS: colour the root 0, every neighbour the OPPOSITE colour. If a same-coloured neighbour is found, that edge closes an odd cycle -- NOT bipartite.'), L_INIT);

      var bipartite = true, conflictShown = false;
      for (var si = 0; si < V.length && bipartite; si++) {
        var s = V[si];
        if (color[s] !== -1) { S.step(T('`' + s + '` zaten renkli -- atlanır.', '`' + s + '` is already coloured -- skipped.'), L_ROOTSKIP); continue; }
        setColor(s, 0);
        var queue = [s]; updateQueue(queue);
        S.step(T('`' + s + '` yeni bir bileşenin kökü: renk 0 verilir, kuyruğa eklenir.', '`' + s + '` is a new component\'s root: coloured 0, enqueued.'), L_ROOTNEW);
        while (queue.length && bipartite) {
          var u = queue.shift();
          S.set('n' + u, { style: styleFor(color[u]) === 'new' ? 'hl' : 'hl' });
          updateQueue(queue);
          S.step(T('`dequeue()` -> `' + u + '` (renk ' + color[u] + ').', '`dequeue()` -> `' + u + '` (colour ' + color[u] + ').'), L_DEQ);
          var kids = adj[u];
          for (var ki = 0; ki < kids.length; ki++) {
            var v = kids[ki];
            var eid = edgeIdBetween(u, v);
            if (color[v] === -1) {
              setColor(v, 1 - color[u]); queue.push(v); updateQueue(queue);
              if (eid >= 0) S.set('e' + eid, { style: 'new' });
              S.step(T('Komşu `' + v + '` renksiz -- ters renk (' + color[v] + ') verilir, kuyruğa eklenir.', 'Neighbour `' + v + '` is uncoloured -- given the opposite colour (' + color[v] + '), enqueued.'), L_COLOR);
            } else if (color[v] === color[u]) {
              if (eid >= 0) S.set('e' + eid, { style: 'del' });
              bipartite = false; conflictShown = true;
              S.step(T('Komşu `' + v + '` de renk ' + color[v] + ' -- `' + u + '`-`' + v + '` kenarı AYNI renkli iki düğümü birleştiriyor: tek sayılı bir döngü. İKİ PARÇALI DEĞİL.',
                       'Neighbour `' + v + '` also has colour ' + color[v] + ' -- edge `' + u + '`-`' + v + '` joins two SAME-coloured vertices: an odd cycle. NOT BIPARTITE.'), L_CONFLICT);
              break;
            } else {
              if (eid >= 0) S.set('e' + eid, { style: 'dim' });
            }
          }
          S.set('n' + u, { style: styleFor(color[u]) });
        }
      }
      if (bipartite) S.step(T('Bütün düğümler renklendi, hiç çakışma yok: çizge İKİ PARÇALI.', 'Every vertex is coloured, no conflict: the graph IS BIPARTITE.'), L_OK);
      S.result = { bipartite: bipartite };
      S.step(T('Bitti. ' + (bipartite ? 'İki parçalı: renk 0 ve renk 1 tarafları birbirine hiç komşu değil.' : 'İki parçalı değil: tek sayılı bir döngü var.'),
               'Done. ' + (bipartite ? 'Bipartite: the colour-0 side and the colour-1 side are never adjacent to each other.' : 'Not bipartite: an odd cycle exists.')));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
