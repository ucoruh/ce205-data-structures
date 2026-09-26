/* Week 5 -- depth-first search (DFS), recursive: the call stack is drawn as a column of pushed/popped frames.
 * Neighbours are examined in ALPHABETICAL order. Unvisited vertices (in alphabetical order) start their own tree,
 * so a disconnected graph becomes a DFS FOREST. Edges are classified as they are found: tree, back (a cycle),
 * and -- directed graphs only -- forward / cross. Input is a plain edge list (see parseGraph). */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_V 32',
    'int color_of[MAX_V];        /* 0 white, 1 gray, 2 black */',
    'int disc_time[MAX_V], fin_time[MAX_V], parent_of[MAX_V];',
    'int clock_ = 0;',
    '',
    'void dfs_visit(Graph *g, int u) {',
    '    color_of[u] = 1;                 /* gray: discovered, still exploring */',
    '    disc_time[u] = ++clock_;',
    '    printf("visit %d\\n", u);',
    '    for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {  /* neighbours: alphabetical order */',
    '        int v = n->to;',
    '        if (color_of[v] == 0) { parent_of[v] = u; dfs_visit(g, v); }  /* tree edge */',
    '        else if (color_of[v] == 1) { /* back edge: v is an ancestor -> a cycle */ }',
    '        else { /* v is black: forward or cross edge (directed graphs only) */ }',
    '    }',
    '    color_of[u] = 2;                 /* black: finished */',
    '    fin_time[u] = ++clock_;',
    '}',
    '',
    'void dfs(Graph *g) {',
    '    for (int i = 0; i < g->vertex_count; i++) color_of[i] = 0;',
    '    for (int i = 0; i < g->vertex_count; i++)',
    '        if (color_of[i] == 0) dfs_visit(g, i);  /* one tree per component */',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    'int[] colorOf = new int[MAX_V];        // 0 white, 1 gray, 2 black',
    'int[] discTime = new int[MAX_V], finTime = new int[MAX_V], parentOf = new int[MAX_V];',
    'int clock_ = 0;',
    '',
    'void dfsVisit(Graph g, int u) {',
    '    colorOf[u] = 1;                  // gray: discovered, still exploring',
    '    discTime[u] = ++clock_;',
    '    System.out.println("visit " + u);',
    '    for (AdjNode n = g.adj[u]; n != null; n = n.next) {  // neighbours: alphabetical order',
    '        int v = n.to;',
    '        if (colorOf[v] == 0) { parentOf[v] = u; dfsVisit(g, v); }  // tree edge',
    '        else if (colorOf[v] == 1) { /* back edge: v is an ancestor -> a cycle */ }',
    '        else { /* v is black: forward or cross edge (directed graphs only) */ }',
    '    }',
    '    colorOf[u] = 2;                  // black: finished',
    '    finTime[u] = ++clock_;',
    '}',
    '',
    'void dfs(Graph g) {',
    '    for (int i = 0; i < g.vertexCount; i++) colorOf[i] = 0;',
    '    for (int i = 0; i < g.vertexCount; i++)',
    '        if (colorOf[i] == 0) dfsVisit(g, i);  // one tree per component',
    '}'
  ];
  var LINES_VISIT = { c: [7, 8, 9], java: [7, 8, 9] };
  var LINES_TREE = { c: [12], java: [12] };
  var LINES_BACK = { c: [13], java: [13] };
  var LINES_FWDCROSS = { c: [14], java: [14] };
  var LINES_FINISH = { c: [16, 17], java: [16, 17] };
  var LINES_FOREST = { c: [21, 22, 23], java: [21, 22, 23] };

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
  function buildAdj(edges, directed) {
    var adj = {};
    edges.forEach(function (e) { if (!adj[e.a]) adj[e.a] = []; if (!adj[e.b]) adj[e.b] = []; if (e.a !== e.b) { adj[e.a].push(e.b); if (!directed) adj[e.b].push(e.a); } });
    Object.keys(adj).forEach(function (v) { adj[v].sort(); });
    return adj;
  }
  function layoutCircle(vertices) {
    var n = vertices.length, R = Math.max(140, 16 * n), cx = R + 46, cy = R + 46, pos = {};
    vertices.forEach(function (v, i) { var ang = -Math.PI / 2 + i * 2 * Math.PI / n; pos[v] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }; });
    return { pos: pos, cx: cx, cy: cy, R: R };
  }
  /** Iterative DFS that reproduces the SAME preorder as recursion: push a vertex's neighbours in REVERSE
   *  alphabetical order so popping the stack yields them in alphabetical order, and skip a vertex already
   *  visited when it is popped (it may be pushed more than once). */
  function iterativeOrder(V, adj) {
    var visited = {}, order = [], stack = V.slice().sort().reverse(); /* unvisited roots popped in alphabetical order too */
    while (stack.length) {
      var u = stack.pop();
      if (visited[u]) continue;
      visited[u] = true; order.push(u);
      var rev = (adj[u] || []).slice().reverse();
      rev.forEach(function (v) { if (!visited[v]) stack.push(v); });
    }
    return order;
  }

  D.define({
    id: 'dfs-recursive',
    title: T('Derinlik öncelikli arama (DFS) -- özyinelemeli', 'Depth-first search (DFS) -- recursive'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('7 düğüm, yönsüz, 4 geri kenar (döngü), 10 kenar', '7 vertices, undirected, 4 back edges (cycles), 10 edges'),
        data: { directed: false, edges: [
          { a: 'A', b: 'B', w: null }, { a: 'B', b: 'C', w: null }, { a: 'C', b: 'D', w: null }, { a: 'D', b: 'E', w: null },
          { a: 'E', b: 'F', w: null }, { a: 'F', b: 'G', w: null }, { a: 'G', b: 'A', w: null },
          { a: 'A', b: 'D', w: null }, { a: 'B', b: 'E', w: null }, { a: 'C', b: 'F', w: null }
        ] } },
      { id: 'hard', level: 'hard', name: T('6 düğüm, yönlü: ağaç, geri, ileri ve çapraz kenarların hepsi bir arada, 10 kenar', '6 vertices, directed: tree, back, forward AND cross edges all in one graph, 10 edges'),
        data: { directed: true, edges: [
          { a: 'A', b: 'B', w: null }, { a: 'A', b: 'D', w: null }, { a: 'A', b: 'E', w: null },
          { a: 'B', b: 'C', w: null }, { a: 'C', b: 'A', w: null },
          { a: 'D', b: 'E', w: null }, { a: 'D', b: 'F', w: null },
          { a: 'E', b: 'B', w: null }, { a: 'E', b: 'F', w: null }, { a: 'F', b: 'C', w: null }
        ] } },
      { id: 'forest', level: 'edge', name: T('10 düğüm, yönsüz, 2 ayrı bileşen: bir DFS OrmanI (forest)', '10 vertices, undirected, 2 separate components: a DFS FOREST'),
        data: { directed: false, edges: [
          { a: 'A', b: 'B', w: null }, { a: 'B', b: 'C', w: null }, { a: 'C', b: 'D', w: null }, { a: 'D', b: 'E', w: null }, { a: 'E', b: 'F', w: null },
          { a: 'G', b: 'H', w: null }, { a: 'H', b: 'I', w: null }, { a: 'I', b: 'G', w: null }, { a: 'G', b: 'J', w: null }, { a: 'H', b: 'J', w: null }
        ] } },
      { id: 'single', level: 'edge', name: T('Tek düğüm (bir öz-döngüyle gösterilir)', 'A single vertex (shown with a self-loop)'),
        data: { directed: false, edges: [{ a: 'A', b: 'A', w: null }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of edges. */
    size: function (d) { return d.edges.length; },
    /** Independent computation: an ITERATIVE DFS with an explicit stack (push neighbours in reverse
     *  alphabetical order, skip a vertex already visited when popped) -- a different technique from build()'s
     *  true recursion, that provably yields the same preorder. Only the visit ORDER is checked. */
    reference: function (d) {
      var vset = {}; d.edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
      var V = Object.keys(vset).sort();
      var adj = {}; V.forEach(function (v) { adj[v] = []; });
      d.edges.forEach(function (e) { if (e.a !== e.b) { adj[e.a].push(e.b); if (!d.directed) adj[e.b].push(e.a); } });
      V.forEach(function (v) { adj[v].sort(); });
      return { order: iterativeOrder(V, adj) };
    },
    random: function (level, r) {
      var n = { easy: 8, normal: 10, hard: 12, extreme: 14 }[level] || 10;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var directed = r() < 0.5;
      var m = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level] || 12;
      var groups;
      if (n >= 6 && r() < 0.3) { var split = D.randInt(r, 3, n - 3); groups = [vertices.slice(0, split), vertices.slice(split)]; }
      else groups = [vertices];
      var edges = [], seen = {};
      groups.forEach(function (g) { for (var i2 = 1; i2 < g.length; i2++) { var j = D.randInt(r, 0, i2 - 1); edges.push({ a: g[j], b: g[i2], w: null }); seen[g[j] + '|' + g[i2]] = 1; if (!directed) seen[g[i2] + '|' + g[j]] = 1; } });
      var guard = 0;
      while (edges.length < m && guard < 1000) {
        guard++;
        var g2 = groups[D.randInt(r, 0, groups.length - 1)];
        var x = g2[D.randInt(r, 0, g2.length - 1)], y = g2[D.randInt(r, 0, g2.length - 1)];
        if (x === y) continue;
        var key = x + '|' + y;
        if (seen[key]) continue;
        edges.push({ a: x, b: y, w: null }); seen[key] = 1; if (!directed) seen[y + '|' + x] = 1;
      }
      return { directed: directed, edges: edges };
    },
    input: {
      hint: T('Örnek: A-B B-C A>D   (yönsüz "-" ya da yönlü ">", opsiyonel ":AĞIRLIK"; etiket 1-3 karakter; bütün kenarlar aynı türde olmalı)',
              'Example: A-B B-C A>D   (undirected "-" or directed ">", optional ":WEIGHT"; label 1-3 characters; all edges must be the same kind)'),
      parse: parseGraph,
      format: formatGraph,
      bad: ['', 'A~B', 'A-B:x', 'A>B B-C', 'ABCD-B', 'A-']
    },
    build: function (S, d) {
      var edges = d.edges, directed = d.directed, V = verticesOf(edges);
      var adj = buildAdj(edges, directed); V.forEach(function (v) { if (!adj[v]) adj[v] = []; });
      var lay = layoutCircle(V), pos = lay.pos, cx = lay.cx, cy = lay.cy, R = lay.R;
      V.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: 'empty' }); });
      var seen = {};
      edges.forEach(function (e, idx) {
        if (e.a === e.b) return;
        var key = directed ? (e.a + '>' + e.b) : [e.a, e.b].sort().join('|');
        var k = seen[key] === undefined ? 0 : seen[key] + 1; seen[key] = k;
        var bend = k === 0 ? 0 : (k % 2 === 1 ? 20 * Math.ceil(k / 2) : -20 * Math.ceil(k / 2));
        S.arrow('e' + idx, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: directed, bend: bend, style: 'dim' });
      });

      /* Rows below the graph (not beside it): named on the left, disc/fin[] keeps one fixed column per vertex
       * (alphabetical, name above the cell); the call stack and visit order grow as single-line rows. */
      var idxOf = {}; V.forEach(function (v, i) { idxOf[v] = i; });
      var ROWX0 = 40, STEP = 44, CW = 36, CH = 36;
      var DFY = cy + R + 66;
      var STY = DFY + CH + 56;
      var OY0 = STY + CH + 56, OX0 = ROWX0;
      S.label('dflbl', { x: ROWX0 - 14, y: DFY + 24, text: T('keşif/bitiş[] =', 'disc/fin[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('df' + i, { x: ROWX0 + i * STEP, y: DFY, w: CW, h: CH, text: '', style: 'empty', size: 15, above: v }); });
      S.label('stlbl', { x: ROWX0 - 14, y: STY + 24, text: T('çağrı yığını =', 'call stack ='), anchor: 'end', size: 14, mono: true });
      for (var si = 0; si < V.length; si++) S.box('st' + si, { x: ROWX0 + si * STEP, y: STY, w: CW, h: CH, text: '', style: 'empty', size: 15 });
      S.label('lbl', { x: OX0 - 14, y: OY0 + 24, text: T('ziyaret sırası =', 'visit order ='), anchor: 'end', size: 14, mono: true });

      var stack = [];
      function updateStack() { for (var i = 0; i < V.length; i++) { if (i < stack.length) S.set('st' + i, { text: stack[i], style: i === stack.length - 1 ? 'hl' : 'active' }); else S.set('st' + i, { text: '', style: 'empty' }); } }
      function pushFrame(v) { stack.push(v); updateStack(); }
      function popFrame() { stack.pop(); updateStack(); }
      var boxCount = 0;
      function outputBox(v) { if (boxCount > 0) S.set('o' + (boxCount - 1), { style: 'normal' }); S.box('o' + boxCount, { x: OX0 + boxCount * STEP, y: OY0, w: CW, h: CH, text: v, style: 'hl', size: 16 }); boxCount++; }
      function setDisc(v, val) { S.set('df' + idxOf[v], { text: String(val), style: 'hl' }); }
      function setFin(v, dval, fval) { S.set('df' + idxOf[v], { text: dval + '/' + fval, style: 'new' }); }
      function edgeIdBetween(u, v) { for (var ei = 0; ei < edges.length; ei++) { var e = edges[ei]; if (e.a === u && e.b === v) return ei; if (!directed && e.a === v && e.b === u) return ei; } return -1; }

      S.step(T('DERİNLİK ÖNCELİKLİ ARAMA (DFS), özyinelemeli: her `visit(u)` çağrısı çağrı yığınına bir çerçeve ekler, komşularını ALFABETİK sırayla dolaşır ve geri dönmeden önce çıkar. Ziyaret edilmemiş düğümler (alfabetik sırayla) kendi ağacını başlatır.',
               'DEPTH-FIRST SEARCH (DFS), recursive: every `visit(u)` call pushes a frame on the call stack, walks its neighbours in ALPHABETICAL order, and pops before returning. Unvisited vertices (in alphabetical order) each start their own tree.'), LINES_FOREST);

      var color = {}, order = [], parentOf = {}, disc = {}, fin = {}, time = 0;
      V.forEach(function (v) { color[v] = 0; });

      function visit(u, par) {
        color[u] = 1; time++; disc[u] = time; order.push(u);
        S.set('n' + u, { style: 'hl' }); pushFrame(u); setDisc(u, disc[u]); outputBox(u);
        if (par !== null) { var pid = edgeIdBetween(par, u); if (pid >= 0) S.set('e' + pid, { style: 'new' }); }
        S.step(T('`visit(' + u + ')` çağrılır' + (par !== null ? ' (kenar `' + par + (directed ? '>' : '-') + u + '` bir AĞAÇ KENARI (tree edge))' : '') + '; keşif zamanı `disc=' + disc[u] + '`.',
                 '`visit(' + u + ')` is called' + (par !== null ? ' (edge `' + par + (directed ? '>' : '-') + u + '` is a TREE EDGE)' : '') + '; discovery time `disc=' + disc[u] + '`.'), LINES_VISIT);
        var skipped = false;
        (adj[u] || []).forEach(function (v) {
          if (!directed && v === par && !skipped) { skipped = true; return; }
          if (color[v] === 0) { parentOf[v] = u; visit(v, u); }
          else if (color[v] === 1) {
            var eid = edgeIdBetween(u, v); if (eid >= 0) S.set('e' + eid, { style: 'del' });
            S.step(T('`' + u + '`\'den `' + v + '`\'ye kenar: `' + v + '` hâlâ yığında (gri, bir ATA) -- bu bir GERİ KENAR (back edge), bir DÖNGÜ işareti.',
                     'Edge from `' + u + '` to `' + v + '`: `' + v + '` is still on the stack (grey, an ANCESTOR) -- this is a BACK EDGE, a sign of a CYCLE.'), LINES_BACK);
            if (eid >= 0) S.set('e' + eid, { style: 'del' });
          } else if (directed) {
            var eid2 = edgeIdBetween(u, v);
            if (disc[u] < disc[v]) {
              if (eid2 >= 0) S.set('e' + eid2, { style: 'hl' });
              S.step(T('`' + u + '`\'den `' + v + '`\'ye kenar: `' + v + '` bitmiş (siyah) ve `' + u + '`\'nun altağacında -- bir İLERİ KENAR (forward edge).',
                       'Edge from `' + u + '` to `' + v + '`: `' + v + '` is finished (black) and inside `' + u + '`\'s subtree -- a FORWARD EDGE.'), LINES_FWDCROSS);
            } else {
              if (eid2 >= 0) S.set('e' + eid2, { style: 'active' });
              S.step(T('`' + u + '`\'den `' + v + '`\'ye kenar: `' + v + '` bitmiş (siyah) ama `' + u + '`\'nun altağacında değil -- bir ÇAPRAZ KENAR (cross edge).',
                       'Edge from `' + u + '` to `' + v + '`: `' + v + '` is finished (black) but NOT inside `' + u + '`\'s subtree -- a CROSS EDGE.'), LINES_FWDCROSS);
            }
          }
          /* undirected + black: this same edge was already reported as a back edge from the other endpoint. */
        });
        color[u] = 2; time++; fin[u] = time;
        setFin(u, disc[u], fin[u]); popFrame(); S.set('n' + u, { style: 'dim' });
        S.step(T('`' + u + '` biter: bitiş zamanı `fin=' + fin[u] + '`, çağrı yığınından çıkar.', '`' + u + '` finishes: finish time `fin=' + fin[u] + '`, popped off the call stack.'), LINES_FINISH);
      }

      V.forEach(function (v) { if (color[v] === 0) visit(v, null); });

      S.result = { order: order };
      S.step(T('Bitti. Ziyaret sırası: ' + order.join(', ') + '.', 'Done. Visit order: ' + order.join(', ') + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
