/* Week 9 -- strongly connected components by KOSARAJU's algorithm: (1) run DFS on the graph and record every
 * vertex's FINISH time (exactly as topological-sort-dfs.js does); (2) run DFS again, on the TRANSPOSE graph (every
 * edge reversed), visiting unvisited roots in DECREASING finish-time order -- each resulting DFS tree is exactly
 * one strongly connected component. Chosen over Tarjan's one-pass, low-link algorithm because it reuses the
 * two-colour DFS the students already met in topological-sort-dfs.js, so only the NEW idea (search the transpose,
 * in finish order) needs teaching, instead of a new low-link/on-stack bookkeeping scheme. Same directed edge-list
 * input as the other week 9 DFS animations (VERTEX>VERTEX, no weights). */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_V 32',
    'int visited[MAX_V];',
    'int finish[MAX_V], finish_len;',
    'int comp_of[MAX_V], comp_count;',
    '',
    'void dfs1(Graph *g, int u) {                          /* phase 1: order by finish time */',
    '    visited[u] = 1;',
    '    for (AdjNode *n = g->adj[u]; n != NULL; n = n->next)   /* alphabetical order */',
    '        if (!visited[n->to]) dfs1(g, n->to);',
    '    finish[finish_len] = u; finish_len++;',
    '}',
    '',
    'void dfs2(Graph *gt, int u, int id) {                  /* phase 2: collect one component */',
    '    visited[u] = 1;',
    '    comp_of[u] = id;',
    '    for (AdjNode *n = gt->adj[u]; n != NULL; n = n->next)  /* alphabetical order, on the TRANSPOSE */',
    '        if (!visited[n->to]) dfs2(gt, n->to, id);',
    '}',
    '',
    'int kosaraju(Graph *g, Graph *gt) {',
    '    for (int i = 0; i < g->vertex_count; i++) visited[i] = 0;',
    '    finish_len = 0;',
    '    for (int v = 0; v < g->vertex_count; v++)          /* alphabetical order */',
    '        if (!visited[v]) dfs1(g, v);',
    '    for (int i = 0; i < g->vertex_count; i++) visited[i] = 0;',
    '    comp_count = 0;',
    '    for (int i = finish_len - 1; i >= 0; i--) {         /* decreasing finish time */',
    '        int v = finish[i];',
    '        if (!visited[v]) { dfs2(gt, v, comp_count); comp_count++; }',
    '    }',
    '    return comp_count;',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    'int[] visited = new int[MAX_V];',
    'int[] finish = new int[MAX_V]; int finishLen;',
    'int[] compOf = new int[MAX_V]; int compCount;',
    '',
    'void dfs1(Graph g, int u) {                            // phase 1: order by finish time',
    '    visited[u] = 1;',
    '    for (AdjNode n = g.adj[u]; n != null; n = n.next)       // alphabetical order',
    '        if (visited[n.to] == 0) dfs1(g, n.to);',
    '    finish[finishLen] = u; finishLen++;',
    '}',
    '',
    'void dfs2(Graph gt, int u, int id) {                   // phase 2: collect one component',
    '    visited[u] = 1;',
    '    compOf[u] = id;',
    '    for (AdjNode n = gt.adj[u]; n != null; n = n.next)      // alphabetical order, on the TRANSPOSE',
    '        if (visited[n.to] == 0) dfs2(gt, n.to, id);',
    '}',
    '',
    'int kosaraju(Graph g, Graph gt) {',
    '    for (int i = 0; i < g.vertexCount; i++) visited[i] = 0;',
    '    finishLen = 0;',
    '    for (int v = 0; v < g.vertexCount; v++)             // alphabetical order',
    '        if (visited[v] == 0) dfs1(g, v);',
    '    for (int i = 0; i < g.vertexCount; i++) visited[i] = 0;',
    '    compCount = 0;',
    '    for (int i = finishLen - 1; i >= 0; i--) {           // decreasing finish time',
    '        int v = finish[i];',
    '        if (visited[v] == 0) { dfs2(gt, v, compCount); compCount++; }',
    '    }',
    '    return compCount;',
    '}'
  ];
  /* Line numbers below are 1-indexed positions in C_CODE/JAVA_CODE, which mirror each other line-for-line, so
   * every helper builds ONE array and reuses it for both languages (LN). Positions, so the notes below line up
   * with the real source: 7=dfs1 visited[u]=1, 8=dfs1's for(neighbours), 9=dfs1's if(!visited[n->to]),
   * 10=finish[]=u, 14=dfs2 visited[u]=1, 15=dfs2 comp_of[u]=id, 16=dfs2's for(neighbours),
   * 17=dfs2's if(!visited[n->to]), 20=kosaraju signature, 21=reset visited[] before phase 1 (ONE-TIME),
   * 22=finish_len=0 (ONE-TIME), 23=phase-1 root for-loop, 24=phase-1 root if, 25=reset visited[] before
   * phase 2 (ONE-TIME), 26=comp_count=0 (ONE-TIME), 27=phase-2 root for-loop, 28=v=finish[i],
   * 29=phase-2 root if. The ONE-TIME reset/init lines (21,22,25,26) belong ONLY in the PH1START/PH2START
   * steps, which really do run once each -- earlier versions of this file mistakenly reused them on every
   * ROOT/SKIPROOT step, which would replay a one-time initialisation every time a new root or component was
   * found. Fixed here so every step's lines are exactly what re-runs for THAT step. */
  function LN(arr) { return { c: arr, java: arr }; }
  var NOTE_LOOP_N1 = T('n != NULL mi? evet -- sıradaki komşuya bakılıyor', 'n != NULL? yes -- looking at the next neighbour');
  var NOTE_LOOP_NT = T('n != NULL mi? evet -- sıradaki devrik komşuya bakılıyor', 'n != NULL? yes -- looking at the next transpose neighbour');

  var L_PH1START = LN([20, { n: 21, note: T('i < vertex_count mi? evet -- her düğüm için visited[i]=0 yapılır', 'i < vertex_count? yes -- visited[i]=0 for every vertex') }, 22]);
  function rootLine1(v) {
    return LN([{ n: 23, note: T('v < vertex_count mi? evet, v=`' + v + '`', 'v < vertex_count? yes, v=`' + v + '`') },
               { n: 24, note: T('visited[' + v + '] mi? hayır (beyaz) -- yeni bir DFS başlar', 'visited[' + v + ']? no (white) -- a new DFS starts') }]);
  }
  var L_VISIT1 = { c: [7], java: [7] };
  function treeLine1(v) {
    return LN([{ n: 8, note: NOTE_LOOP_N1 }, { n: 9, note: T('visited[' + v + '] mi? hayır -- ağaç kenarı, içine dalınır', 'visited[' + v + ']? no -- a tree edge, we descend') }]);
  }
  function skipLine1(names) {
    var list = names.join(', ');
    return LN([{ n: 8, note: NOTE_LOOP_N1 }, { n: 9, skip: true, note: T('visited[' + list + '] mi? evet -- zaten ziyaret edilmiş', 'visited[' + list + ']? yes -- already visited') }]);
  }
  function noKids1() {
    return LN([{ n: 8, note: T('n != NULL mi? hayır -- komşu yok', 'n != NULL? no -- there are no neighbours') }]);
  }
  var L_FINISH1 = { c: [10], java: [10] };

  var L_PH2START = LN([{ n: 25, note: T('i < vertex_count mi? evet -- devrik tarama için visited[i]=0 yapılır', 'i < vertex_count? yes -- visited[i]=0 for every vertex, for the transpose scan') }, 26]);
  var NOTE_LOOP_ROOT2 = T('i >= 0 mi? evet -- bitiş sırası sondan taranmaya devam eder', 'i >= 0? yes -- still scanning the finish order from the end');
  function rootLine2(v) {
    return LN([{ n: 27, note: NOTE_LOOP_ROOT2 }, 28, { n: 29, note: T('visited[' + v + '] mi? hayır -- YENİ bir bileşen başlar', 'visited[' + v + ']? no -- a NEW component starts') }, 14, 15]);
  }
  function skipRootLine2(names) {
    var list = names.join(', ');
    return LN([{ n: 27, note: NOTE_LOOP_ROOT2 }, 28, { n: 29, skip: true, note: T('visited[' + list + '] mi? evet -- zaten bir bileşende', 'visited[' + list + ']? yes -- already in a component') }]);
  }
  var L_VISIT2 = LN([{ n: 29, note: T('dfs2 çağrısı döner, comp_count++ çalışır', 'the dfs2 call returns, comp_count++ runs') }]);
  function treeLine2(v) {
    return LN([{ n: 16, note: NOTE_LOOP_NT }, { n: 17, note: T('visited[' + v + '] mi? hayır -- aynı bileşene katılır', 'visited[' + v + ']? no -- joins the same component') }, 14, 15]);
  }
  function skipLine2(names) {
    var list = names.join(', ');
    return LN([{ n: 16, note: NOTE_LOOP_NT }, { n: 17, skip: true, note: T('visited[' + list + '] mi? evet -- bu taramada zaten ziyaret edildi', 'visited[' + list + ']? yes -- already visited in this scan') }]);
  }

  var EDGE_RE = /^([A-Za-z0-9]{1,3})>([A-Za-z0-9]{1,3})$/;
  function parseDag(text) {
    var toks = String(text).trim().split(/\s+/).filter(Boolean);
    if (!toks.length) throw T('En az bir kenar yazın: A>B B>C ...', 'Write at least one edge: A>B B>C ...');
    var edges = [];
    for (var i = 0; i < toks.length; i++) {
      var m = EDGE_RE.exec(toks[i]);
      if (!m) throw T('"' + toks[i] + '" anlaşılmadı: yönlü kenar VERTEX>VERTEX biçiminde olmalı.', '"' + toks[i] + '" is not understood: a directed edge must look like VERTEX>VERTEX.');
      if (m[1] === m[2]) throw T('Öz-döngüler bu örnekte desteklenmiyor: "' + toks[i] + '".', 'Self-loops are not supported in this example: "' + toks[i] + '".');
      edges.push({ a: m[1], b: m[2] });
    }
    return { edges: edges };
  }
  function formatDag(d) { return d.edges.map(function (e) { return e.a + '>' + e.b; }).join(' '); }
  function verticesOf(edges) { var s = {}; edges.forEach(function (e) { s[e.a] = 1; s[e.b] = 1; }); return Object.keys(s).sort(); }
  function buildAdj(V, edges) {
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { adj[e.a].push(e.b); });
    V.forEach(function (v) { adj[v].sort(); });
    return adj;
  }
  function buildTranspose(V, edges) {
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { adj[e.b].push(e.a); });
    V.forEach(function (v) { adj[v].sort(); });
    return adj;
  }
  function layoutCircle(vertices) {
    var n = vertices.length, R = Math.max(140, 16 * n), cx = R + 46, cy = R + 46, pos = {};
    vertices.forEach(function (v, i) { var ang = -Math.PI / 2 + i * 2 * Math.PI / n; pos[v] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }; });
    return { pos: pos, cx: cx, cy: cy, R: R };
  }
  function label(i) { var s = '', n = i + 1; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }

  /** Independent computation: an ITERATIVE version of both DFS phases (explicit [vertex, nextChildIndex] frame
   *  stacks, rather than build()'s true recursion). Components are reported as a REPRESENTATIVE map (every vertex
   *  -> the alphabetically smallest vertex in its component), which is invariant no matter which processing order
   *  assigns which numeric id to which component -- so no id-numbering tie-break can make the two disagree. */
  function kosarajuRef(edges) {
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    var V = Object.keys(vset).sort();
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { adj[e.a].push(e.b); });
    V.forEach(function (v) { adj[v].sort(); });
    var adjT = {}; V.forEach(function (v) { adjT[v] = []; });
    edges.forEach(function (e) { adjT[e.b].push(e.a); });
    V.forEach(function (v) { adjT[v].sort(); });
    function iterativeFinish(vertices, graph) {
      var visited = {}, finish = [];
      vertices.forEach(function (root) {
        if (visited[root]) return;
        var frames = [{ u: root, i: 0 }]; visited[root] = true;
        while (frames.length) {
          var top = frames[frames.length - 1], kids = graph[top.u];
          if (top.i < kids.length) { var w = kids[top.i]; top.i++; if (!visited[w]) { visited[w] = true; frames.push({ u: w, i: 0 }); } }
          else { finish.push(top.u); frames.pop(); }
        }
      });
      return finish;
    }
    var finish = iterativeFinish(V, adj);
    var order = finish.slice().reverse();
    var visited2 = {}, compOf = {}, repOfId = [], id = 0;
    order.forEach(function (root) {
      if (visited2[root]) return;
      var members = [];
      var frames = [{ u: root, i: 0 }]; visited2[root] = true;
      while (frames.length) {
        var top = frames[frames.length - 1], kids = adjT[top.u];
        if (top.i < kids.length) { var w = kids[top.i]; top.i++; if (!visited2[w]) { visited2[w] = true; frames.push({ u: w, i: 0 }); } }
        else { members.push(top.u); compOf[top.u] = id; frames.pop(); }
      }
      repOfId.push(members.slice().sort()[0]); id++;
    });
    /* Build the output by scanning V in alphabetical order, so key insertion order matches build()'s exactly --
     * the components themselves (which vertices share one) are what matters, not any incidental object order. */
    var rep = {}; V.forEach(function (v) { rep[v] = repOfId[compOf[v]]; });
    return { rep: rep };
  }

  D.define({
    id: 'strongly-connected-components',
    title: T('Güçlü bağlı bileşenler (Kosaraju)', 'Strongly connected components (Kosaraju)'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('8 düğüm, 10 kenar, 2 döngüsel bileşen + 2 tekil', '8 vertices, 10 edges, 2 cyclic components + 2 singletons'),
        data: { edges: [
          { a: 'A', b: 'B' }, { a: 'B', b: 'C' }, { a: 'C', b: 'A' }, { a: 'C', b: 'D' }, { a: 'D', b: 'E' },
          { a: 'E', b: 'F' }, { a: 'F', b: 'D' }, { a: 'F', b: 'G' }, { a: 'G', b: 'H' }, { a: 'E', b: 'G' }
        ] } },
      { id: 'hard', level: 'hard', name: T('10 düğüm, 14 kenar, 3 bileşen (biri büyük)', '10 vertices, 14 edges, 3 components (one large)'),
        data: { edges: [
          { a: 'A', b: 'B' }, { a: 'B', b: 'C' }, { a: 'C', b: 'D' }, { a: 'D', b: 'A' }, { a: 'B', b: 'D' },
          { a: 'C', b: 'B' }, { a: 'D', b: 'E' }, { a: 'E', b: 'F' }, { a: 'F', b: 'E' }, { a: 'F', b: 'G' },
          { a: 'G', b: 'H' }, { a: 'H', b: 'I' }, { a: 'I', b: 'G' }, { a: 'I', b: 'J' }
        ] } },
      { id: 'one-big-scc', level: 'edge', name: T('Uç: hepsi tek bir döngü, tüm çizge tek bir bileşen', 'Edge case: everything is one big cycle, the whole graph is one component'),
        data: { edges: [
          { a: 'A', b: 'B' }, { a: 'B', b: 'C' }, { a: 'C', b: 'D' }, { a: 'D', b: 'E' }, { a: 'E', b: 'F' },
          { a: 'F', b: 'G' }, { a: 'G', b: 'H' }, { a: 'H', b: 'A' }, { a: 'C', b: 'A' }, { a: 'F', b: 'D' }
        ] } },
      { id: 'dag', level: 'edge', name: T('Uç: döngüsüz çizge (DAG), her düğüm kendi bileşeni', 'Edge case: a cycle-free graph (a DAG), every vertex is its own component'),
        data: { edges: [
          { a: 'A', b: 'B' }, { a: 'A', b: 'C' }, { a: 'B', b: 'D' }, { a: 'C', b: 'D' }, { a: 'D', b: 'E' },
          { a: 'C', b: 'F' }, { a: 'E', b: 'G' }, { a: 'F', b: 'G' }, { a: 'G', b: 'H' }, { a: 'B', b: 'E' }
        ] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.edges.length; },
    reference: function (d) { return kosarajuRef(d.edges); },
    random: function (level, r) {
      var n = { easy: 8, normal: 9, hard: 11, extreme: 13 }[level] || 9;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var m = { easy: 10, normal: 11, hard: 15, extreme: 18 }[level] || 11;
      var edges = [], seen = {}, guard = 0;
      while (edges.length < m && guard < 2000) {
        guard++;
        var i1 = D.randInt(r, 0, n - 1), j1 = D.randInt(r, 0, n - 1);
        if (i1 === j1) continue;
        var key = vertices[i1] + '>' + vertices[j1];
        if (seen[key]) continue;
        edges.push({ a: vertices[i1], b: vertices[j1] }); seen[key] = 1;
      }
      return { edges: edges };
    },
    input: {
      hint: T('Örnek: A>B B>C C>A   (her kenar yönlü, VERTEX>VERTEX, öz-döngü yok)', 'Example: A>B B>C C>A   (every edge is directed, VERTEX>VERTEX, no self-loops)'),
      parse: parseDag,
      format: formatDag,
      bad: ['', 'A-B', 'A>A', 'A>B B C', 'A>>B']
    },
    build: function (S, d) {
      var edges = d.edges, V = verticesOf(edges), adj = buildAdj(V, edges), adjT = buildTranspose(V, edges);
      var lay = layoutCircle(V), pos = lay.pos, cx = lay.cx, cy = lay.cy, R = lay.R;
      V.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: 'empty' }); });
      var eseen = {};
      edges.forEach(function (e, idx) {
        var key = e.a + '>' + e.b, k = eseen[key] === undefined ? 0 : eseen[key] + 1; eseen[key] = k;
        S.arrow('e' + idx, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: true, bend: k ? 20 * k : 0, style: 'dim' });
      });

      var idxOf = {}; V.forEach(function (v, i) { idxOf[v] = i; });
      var ROWX0 = 40, STEP = 44, CW = 36, CH = 36;
      var STY = cy + R + 66, FY0 = STY + CH + 56, CY0 = FY0 + CH + 56;
      S.label('stlbl', { x: ROWX0 - 14, y: STY + 24, text: T('çağrı yığını =', 'call stack ='), anchor: 'end', size: 14, mono: true });
      for (var si = 0; si < V.length; si++) S.box('st' + si, { x: ROWX0 + si * STEP, y: STY, w: CW, h: CH, text: '', style: 'empty', size: 15 });
      S.label('flbl', { x: ROWX0 - 14, y: FY0 + 24, text: T('bitiş sırası =', 'finish order ='), anchor: 'end', size: 14, mono: true });
      S.label('clbl', { x: ROWX0 - 14, y: CY0 + 24, text: T('bileşen[] =', 'comp[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('c' + i, { x: ROWX0 + i * STEP, y: CY0, w: CW, h: CH, text: '-', style: 'empty', size: 14, above: v }); });

      var stack = [];
      function updateStack() { for (var i = 0; i < V.length; i++) { if (i < stack.length) S.set('st' + i, { text: stack[i], style: i === stack.length - 1 ? 'hl' : 'active' }); else S.set('st' + i, { text: '', style: 'empty' }); } }
      var fCount = 0;
      function finBox(v) { if (fCount > 0) S.set('f' + (fCount - 1), { style: 'normal' }); S.box('f' + fCount, { x: ROWX0 + fCount * STEP, y: FY0, w: CW, h: CH, text: v, style: 'hl', size: 16 }); fCount++; }

      S.step(T('KOSARAJU, 1. AŞAMA: normal çizgede özyinelemeli DFS ile her düğümün BİTİŞ sırası kaydedilir (topolojik sıralamadaki gibi).',
               'KOSARAJU, PHASE 1: recursive DFS on the normal graph records every vertex\'s FINISH order (just like topological sort).'), L_PH1START);

      var visited1 = {}, finish = [];
      V.forEach(function (v) { visited1[v] = false; });
      /* entryCap/entryLines describe the DECISION that led here (a fresh root, or a tree edge from the
       * parent): that step is merged with dfs1(u)'s own first line into ONE step -- "the call line, then the
       * helper's lines" -- instead of two separate steps (announce, then enter), the same idea dijkstra.js
       * uses to fold a whole relaxation round into one step. */
      function visit1(u, entryCap, entryLines) {
        visited1[u] = true; S.set('n' + u, { style: 'hl' }); stack.push(u); updateStack();
        S.step(entryCap, { c: entryLines.c.concat(L_VISIT1.c), java: entryLines.java.concat(L_VISIT1.java) });
        var kids = adj[u];
        if (!kids.length) S.step(T('`' + u + '`\'nin komşusu yok.', '`' + u + '` has no neighbours.'), noKids1());
        /* Consecutive already-visited neighbours (no recursion) are grouped into ONE step, the same way
         * dijkstra.js groups a whole round of edge relaxations -- only a WHITE neighbour (a tree edge, which
         * triggers its own recursive visit) needs its own step. */
        var skipped = [];
        function flushSkipped1() {
          if (!skipped.length) return;
          S.step(T('Komşu(lar) ' + skipped.join(', ') + ' zaten ziyaret edilmiş -- atlanır.',
                   'Neighbour(s) ' + skipped.join(', ') + ' are already visited -- skipped.'), skipLine1(skipped));
          skipped = [];
        }
        kids.forEach(function (v) {
          if (!visited1[v]) {
            flushSkipped1();
            visit1(v,
              T('Komşu `' + v + '` beyaz -- içine dalınır, `dfs1(' + v + ')` çağrılır.',
                'Neighbour `' + v + '` is white -- we descend into it, `dfs1(' + v + ')` is called.'),
              treeLine1(v));
          } else skipped.push(v);
        });
        flushSkipped1();
        stack.pop(); updateStack(); finBox(u); finish.push(u); S.set('n' + u, { style: 'dim' });
        S.step(T('`' + u + '` biter, bitiş sırasına eklenir (şimdiye kadar: ' + finish.join(', ') + ').', '`' + u + '` finishes, appended to the finish order (so far: ' + finish.join(', ') + ').'), L_FINISH1);
      }
      V.forEach(function (v) {
        if (!visited1[v]) {
          visit1(v,
            T('`' + v + '` beyaz -- yeni bir DFS başlıyor, `dfs1(' + v + ')` çağrılır.',
              '`' + v + '` is white -- a new DFS starts, `dfs1(' + v + ')` is called.'),
            rootLine1(v));
        }
      });

      V.forEach(function (v) { S.set('n' + v, { style: 'empty' }); });
      edges.forEach(function (e, idx) { S.set('e' + idx, { style: 'empty' }); });
      var order = finish.slice().reverse();
      S.step(T('KOSARAJU, 2. AŞAMA: kenarlar TERS ÇEVRİLİR (devrik çizge); bitiş sırası TERSTEN okunarak kökler seçilir: ' + order.join(', ') + '.',
               'KOSARAJU, PHASE 2: every edge is REVERSED (the transpose graph); roots are chosen by reading the finish order BACK TO FRONT: ' + order.join(', ') + '.'), L_PH2START);
      edges.forEach(function (e, idx) { S.set('e' + idx, { style: 'dim' }); });

      var visited2 = {}, compOf = {}, compCount = 0, comps = [];
      V.forEach(function (v) { visited2[v] = false; });
      function visit2(u, id, members) {
        visited2[u] = true; compOf[u] = id; S.set('n' + u, { style: 'hl' });
        S.set('c' + idxOf[u], { text: String(id), style: 'new' });
        members.push(u);
        /* Same grouping as phase 1: a run of already-visited transpose neighbours becomes ONE step. */
        var skipped2 = [];
        function flushSkipped2() {
          if (!skipped2.length) return;
          S.step(T('Devrik komşu(lar) ' + skipped2.join(', ') + ' zaten bu taramada ziyaret edildi.',
                   'Transpose neighbour(s) ' + skipped2.join(', ') + ' were already visited in this scan.'), skipLine2(skipped2));
          skipped2 = [];
        }
        (adjT[u] || []).forEach(function (v) {
          if (!visited2[v]) {
            flushSkipped2();
            S.step(T('Devrik komşu `' + v + '` beyaz -- `' + u + '` ile aynı bileşene katılır.', 'Transpose neighbour `' + v + '` is white -- it joins the same component as `' + u + '`.'), treeLine2(v));
            visit2(v, id, members);
          } else skipped2.push(v);
        });
        flushSkipped2();
        S.set('n' + u, { style: 'dim' });
      }
      /* A run of roots that are already in a component (no new DFS tree needed) is also grouped into one step. */
      var skippedRoots = [];
      function flushSkippedRoots() {
        if (!skippedRoots.length) return;
        S.step(T('`' + skippedRoots.join('`, `') + '` zaten bir bileşende -- atlanır.', '`' + skippedRoots.join('`, `') + '` are already in a component -- skipped.'), skipRootLine2(skippedRoots));
        skippedRoots = [];
      }
      order.forEach(function (root) {
        if (visited2[root]) { skippedRoots.push(root); return; }
        flushSkippedRoots();
        var members = [];
        S.step(T('`' + root + '` henüz ziyaret edilmedi -- YENİ bir bileşen (id=' + compCount + ') başlar.', '`' + root + '` is not yet visited -- a NEW component (id=' + compCount + ') starts.'), rootLine2(root));
        visit2(root, compCount, members);
        comps.push(members.slice().sort());
        S.step(T('Bileşen ' + compCount + ' tamam: {' + members.slice().sort().join(', ') + '}.', 'Component ' + compCount + ' is complete: {' + members.slice().sort().join(', ') + '}.'), L_VISIT2);
        compCount++;
      });
      flushSkippedRoots();

      var repOfId = comps.map(function (members) { return members[0]; });
      var rep = {}; V.forEach(function (v) { rep[v] = repOfId[compOf[v]]; });
      S.result = { rep: rep };
      S.step(T('Bitti: ' + compCount + ' güçlü bağlı bileşen bulundu: ' + comps.map(function (c) { return '{' + c.join(',') + '}'; }).join(' '),
               'Done: ' + compCount + ' strongly connected component' + (compCount === 1 ? '' : 's') + ' found: ' + comps.map(function (c) { return '{' + c.join(',') + '}'; }).join(' ')));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
