/* Week 9 -- topological sort by DFS: run recursive DFS (as in week 5's dfs-recursive.js), record every vertex's
 * FINISH time, then read the finish order back to front. A back edge (to a grey, still-open ancestor) means the
 * graph has a cycle, so no topological order exists. Same directed edge-list input as topological-sort-kahn.js. */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_V 32',
    'int color_of[MAX_V];        /* 0 white, 1 gray, 2 black */',
    'int finish[MAX_V], finish_len;',
    'int has_cycle;',
    '',
    'void dfs_visit(Graph *g, int u) {',
    '    color_of[u] = 1;                                /* gray: in progress */',
    '    for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {  /* alphabetical order */',
    '        if (color_of[n->to] == 0) dfs_visit(g, n->to);      /* tree edge */',
    '        else if (color_of[n->to] == 1) has_cycle = 1;       /* back edge -> a cycle */',
    '    }',
    '    color_of[u] = 2;                                /* black: done */',
    '    finish[finish_len] = u; finish_len++;',
    '}',
    '',
    'void topo_sort_dfs(Graph *g) {',
    '    for (int i = 0; i < g->vertex_count; i++) color_of[i] = 0;',
    '    finish_len = 0; has_cycle = 0;',
    '    for (int v = 0; v < g->vertex_count; v++)         /* alphabetical order */',
    '        if (color_of[v] == 0) dfs_visit(g, v);',
    '    /* topological order = finish[] read back to front */',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    'int[] colorOf = new int[MAX_V];        // 0 white, 1 gray, 2 black',
    'int[] finish = new int[MAX_V]; int finishLen;',
    'boolean hasCycle;',
    '',
    'void dfsVisit(Graph g, int u) {',
    '    colorOf[u] = 1;                                 // gray: in progress',
    '    for (AdjNode n = g.adj[u]; n != null; n = n.next) {  // alphabetical order',
    '        if (colorOf[n.to] == 0) dfsVisit(g, n.to);        // tree edge',
    '        else if (colorOf[n.to] == 1) hasCycle = true;     // back edge -> a cycle',
    '    }',
    '    colorOf[u] = 2;                                 // black: done',
    '    finish[finishLen] = u; finishLen++;',
    '}',
    '',
    'void topoSortDfs(Graph g) {',
    '    for (int i = 0; i < g.vertexCount; i++) colorOf[i] = 0;',
    '    finishLen = 0; hasCycle = false;',
    '    for (int v = 0; v < g.vertexCount; v++)           // alphabetical order',
    '        if (colorOf[v] == 0) dfsVisit(g, v);',
    '    // topological order = finish[] read back to front',
    '}'
  ];
  /* Positions (1-indexed, C_CODE/JAVA_CODE mirror each other line-for-line, so LN() reuses one array for
   * both): 6=dfs_visit signature, 7=color_of[u]=1 (ENTRY, gray), 8=for(neighbours), 9=if(color==0) (tree
   * branch), 10=else if(color==1) (back-edge branch), 12=color_of[u]=2 (finish, black), 13=finish[]=u,
   * 16=topo_sort_dfs signature, 17=reset color_of[] (ONE-TIME), 18=finish_len/has_cycle init (ONE-TIME),
   * 19=root for-loop, 20=if(color==0) (new-root branch), 21=the reversal comment. Earlier versions of this
   * file (a) reused the ONE-TIME reset (17) on every new-root step instead of the real per-vertex root-loop
   * lines (19,20) -- so it replayed the reset every time a new root was found on a multi-root graph; (b) a
   * separate "entered" step showed only the SIGNATURE (6) and then every neighbour-check step redundantly
   * re-showed the entry line (7) as if it were re-executing; (c) the "reversed" step pointed at the root
   * loop (19) instead of the actual reversal comment (21). All fixed below by merging each call's entry line
   * into the step that makes the call (the same "call line, then the callee's lines" idea used elsewhere),
   * the same way strongly-connected-components.js's visit1 does. */
  function LN(arr) { return { c: arr, java: arr }; }
  var NOTE_LOOP_N = T('n != NULL mi? evet -- sıradaki komşuya bakılıyor', 'n != NULL? yes -- looking at the next neighbour');
  var L_ENTRY = { c: [7], java: [7] };
  var L_INIT = LN([16, { n: 17, note: T('i < vertex_count mi? evet -- her düğüm için color_of[i]=0', 'i < vertex_count? yes -- color_of[i]=0 for every vertex') }, 18]);
  function rootLine(v) {
    return LN([{ n: 19, note: T('v < vertex_count mi? evet, v=`' + v + '`', 'v < vertex_count? yes, v=`' + v + '`') },
               { n: 20, note: T('color_of[' + v + '] mi? beyaz (0) -- yeni bir DFS ağacı başlar', 'color_of[' + v + ']? white (0) -- a new DFS tree starts') }].concat(L_ENTRY.c));
  }
  function treeLine(v) {
    return LN([{ n: 8, note: NOTE_LOOP_N }, { n: 9, note: T('color_of[' + v + '] mi? beyaz (0) -- ağaç kenarı', 'color_of[' + v + ']? white (0) -- a tree edge') }].concat(L_ENTRY.c));
  }
  function backLine(v) {
    return LN([{ n: 8, note: NOTE_LOOP_N },
               { n: 9, skip: true, note: T('color_of[' + v + '] mi? beyaz (0)? hayır', 'color_of[' + v + ']? white (0)? no') },
               { n: 10, note: T('color_of[' + v + '] mi? gri (1) -- geri kenar, döngü bulundu', 'color_of[' + v + ']? grey (1) -- a back edge, a cycle is found') }]);
  }
  function skipLine(v) {
    return LN([{ n: 8, note: NOTE_LOOP_N },
               { n: 9, skip: true, note: T('color_of[' + v + '] mi? beyaz (0)? hayır', 'color_of[' + v + ']? white (0)? no') },
               { n: 10, skip: true, note: T('color_of[' + v + '] mi? gri (1)? hayır -- siyah (2), zaten bitmiş', 'color_of[' + v + ']? grey (1)? no -- black (2), already finished') }]);
  }
  function noKids() {
    return LN([{ n: 8, note: T('n != NULL mi? hayır -- komşu yok', 'n != NULL? no -- there are no neighbours') }]);
  }
  var L_FINISH = { c: [12, 13], java: [12, 13] };
  var L_REVERSE = LN([{ n: 21, note: T('bitiş sırası, sondan başa okunur', 'the finish order is read from the end backwards') }]);

  var EDGE_RE = /^([A-Za-z0-9]{1,3})>([A-Za-z0-9]{1,3})$/;
  function parseDag(text) {
    var toks = String(text).trim().split(/\s+/).filter(Boolean);
    if (!toks.length) throw T('En az bir kenar yazın: A>B B>C ...', 'Write at least one edge: A>B B>C ...');
    var edges = [];
    for (var i = 0; i < toks.length; i++) {
      var m = EDGE_RE.exec(toks[i]);
      if (!m) throw T('"' + toks[i] + '" anlaşılmadı: yönlü kenar VERTEX>VERTEX biçiminde olmalı.', '"' + toks[i] + '" is not understood: a directed edge must look like VERTEX>VERTEX.');
      edges.push({ a: m[1], b: m[2] });
    }
    return { edges: edges };
  }
  function formatDag(d) { return d.edges.map(function (e) { return e.a + '>' + e.b; }).join(' '); }
  function verticesOf(edges) { var s = {}; edges.forEach(function (e) { s[e.a] = 1; s[e.b] = 1; }); return Object.keys(s).sort(); }
  function buildAdj(V, edges) {
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { if (e.a !== e.b) adj[e.a].push(e.b); });
    V.forEach(function (v) { adj[v].sort(); });
    return adj;
  }
  function layoutCircle(vertices) {
    var n = vertices.length, R = Math.max(140, 16 * n), cx = R + 46, cy = R + 46, pos = {};
    vertices.forEach(function (v, i) { var ang = -Math.PI / 2 + i * 2 * Math.PI / n; pos[v] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }; });
    return { pos: pos, cx: cx, cy: cy, R: R };
  }
  function label(i) { var s = '', n = i + 1; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }

  /** Independent computation: an ITERATIVE DFS with an explicit [vertex, nextChildIndex] stack, a different
   *  technique from build()'s true recursion, that provably yields the same finish order. */
  function iterativeTopoDfs(edges) {
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    var V = Object.keys(vset).sort();
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { if (e.a !== e.b) adj[e.a].push(e.b); });
    V.forEach(function (v) { adj[v].sort(); });
    var color = {}; V.forEach(function (v) { color[v] = 0; });
    var finish = [], hasCycle = false;
    V.forEach(function (root) {
      if (color[root] !== 0) return;
      var frames = [{ u: root, i: 0 }];
      color[root] = 1;
      while (frames.length) {
        var top = frames[frames.length - 1], kids = adj[top.u];
        if (top.i < kids.length) {
          var w = kids[top.i]; top.i++;
          if (color[w] === 0) { color[w] = 1; frames.push({ u: w, i: 0 }); }
          else if (color[w] === 1) hasCycle = true;
        } else {
          color[top.u] = 2; finish.push(top.u); frames.pop();
        }
      }
    });
    var order = finish.slice().reverse();
    return { order: order, hasCycle: hasCycle };
  }

  D.define({
    id: 'topological-sort-dfs',
    title: T('Topolojik sıralama: DFS bitiş sırası', 'Topological sort: DFS finish order'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('8 düğüm, 10 kenar, tek geçerli DAG', '8 vertices, 10 edges, a valid DAG'),
        data: { edges: [
          { a: 'A', b: 'B' }, { a: 'A', b: 'C' }, { a: 'B', b: 'D' }, { a: 'C', b: 'D' }, { a: 'D', b: 'E' },
          { a: 'C', b: 'F' }, { a: 'E', b: 'G' }, { a: 'F', b: 'G' }, { a: 'G', b: 'H' }, { a: 'B', b: 'E' }
        ] } },
      { id: 'hard', level: 'hard', name: T('10 düğüm, 14 kenar, çok kaynaklı DAG', '10 vertices, 14 edges, a DAG with several sources'),
        data: { edges: [
          { a: 'A', b: 'D' }, { a: 'B', b: 'D' }, { a: 'C', b: 'E' }, { a: 'D', b: 'F' }, { a: 'E', b: 'F' },
          { a: 'D', b: 'G' }, { a: 'F', b: 'H' }, { a: 'G', b: 'H' }, { a: 'H', b: 'I' }, { a: 'I', b: 'J' },
          { a: 'G', b: 'J' }, { a: 'B', b: 'E' }, { a: 'A', b: 'G' }, { a: 'C', b: 'F' }
        ] } },
      { id: 'cycle', level: 'edge', name: T('Uç: 10 kenar ama bir döngü var, geri kenar bulunur', 'Edge case: 10 edges but a cycle exists, a back edge is found'),
        data: { edges: [
          { a: 'A', b: 'B' }, { a: 'B', b: 'C' }, { a: 'C', b: 'A' }, { a: 'C', b: 'D' }, { a: 'D', b: 'E' },
          { a: 'E', b: 'F' }, { a: 'A', b: 'D' }, { a: 'F', b: 'G' }, { a: 'D', b: 'F' }, { a: 'B', b: 'D' }
        ] } },
      { id: 'single', level: 'edge', name: T('Uç: tek düğüm, kenarsız (öz-döngü ile gösterilir)', 'Edge case: a single vertex, no edges (shown with a self-loop)'),
        data: { edges: [{ a: 'A', b: 'A' }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.edges.length; },
    reference: function (d) { return iterativeTopoDfs(d.edges); },
    random: function (level, r) {
      var n = { easy: 8, normal: 9, hard: 11, extreme: 13 }[level] || 9;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var m = { easy: 10, normal: 11, hard: 15, extreme: 18 }[level] || 11;
      var edges = [], seen = {}, guard = 0;
      while (edges.length < m && guard < 2000) {
        guard++;
        var i1 = D.randInt(r, 0, n - 2), j1 = D.randInt(r, i1 + 1, n - 1);
        var key = vertices[i1] + '>' + vertices[j1];
        if (seen[key]) continue;
        edges.push({ a: vertices[i1], b: vertices[j1] }); seen[key] = 1;
      }
      if (level === 'extreme' && r() < 0.5 && n >= 4) edges.push({ a: vertices[n - 1], b: vertices[0] });
      return { edges: edges };
    },
    input: {
      hint: T('Örnek: A>B B>C A>C   (her kenar yönlü, VERTEX>VERTEX)', 'Example: A>B B>C A>C   (every edge is directed, VERTEX>VERTEX)'),
      parse: parseDag,
      format: formatDag,
      bad: ['', 'A-B', 'A>B>C', 'A>B B C', 'A>>B']
    },
    build: function (S, d) {
      var edges = d.edges, V = verticesOf(edges), adj = buildAdj(V, edges);
      var lay = layoutCircle(V), pos = lay.pos, cx = lay.cx, cy = lay.cy, R = lay.R;
      V.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: 'empty' }); });
      var eseen = {};
      edges.forEach(function (e, idx) {
        if (e.a === e.b) return;
        var key = e.a + '>' + e.b, k = eseen[key] === undefined ? 0 : eseen[key] + 1; eseen[key] = k;
        S.arrow('e' + idx, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: true, bend: k ? 20 * k : 0, style: 'dim' });
      });

      var ROWX0 = 40, STEP = 44, CW = 36, CH = 36;
      var COLY = cy + R + 66, STY = COLY + CH + 56, FY0 = STY + CH + 56, OY0 = FY0 + CH + 56;
      S.label('collbl', { x: ROWX0 - 14, y: COLY + 24, text: T('renk[] =', 'color[] ='), anchor: 'end', size: 14, mono: true });
      var idxOf = {}; V.forEach(function (v, i) { idxOf[v] = i; S.box('col' + i, { x: ROWX0 + i * STEP, y: COLY, w: CW, h: CH, text: 'W', style: 'empty', size: 14, above: v }); });
      S.label('stlbl', { x: ROWX0 - 14, y: STY + 24, text: T('çağrı yığını =', 'call stack ='), anchor: 'end', size: 14, mono: true });
      for (var si = 0; si < V.length; si++) S.box('st' + si, { x: ROWX0 + si * STEP, y: STY, w: CW, h: CH, text: '', style: 'empty', size: 15 });
      S.label('flbl', { x: ROWX0 - 14, y: FY0 + 24, text: T('bitiş sırası =', 'finish order ='), anchor: 'end', size: 14, mono: true });
      S.label('olbl', { x: ROWX0 - 14, y: OY0 + 24, text: T('topo sıra =', 'topo order ='), anchor: 'end', size: 14, mono: true });

      var stack = [];
      function updateStack() { for (var i = 0; i < V.length; i++) { if (i < stack.length) S.set('st' + i, { text: stack[i], style: i === stack.length - 1 ? 'hl' : 'active' }); else S.set('st' + i, { text: '', style: 'empty' }); } }
      var fCount = 0;
      function finBox(v) { if (fCount > 0) S.set('f' + (fCount - 1), { style: 'normal' }); S.box('f' + fCount, { x: ROWX0 + fCount * STEP, y: FY0, w: CW, h: CH, text: v, style: 'hl', size: 16 }); fCount++; }
      function edgeIdBetween(u, v) { for (var ei = 0; ei < edges.length; ei++) { var e = edges[ei]; if (e.a === u && e.b === v) return ei; } return -1; }

      S.step(T('TOPOLOJİK SIRALAMA (DFS): özyinelemeli DFS her düğümü BİTİRDİĞİ sırayla `bitiş sırası` satırına yazar; sonunda bu satır ters çevrilecek.',
               'TOPOLOGICAL SORT (DFS): recursive DFS writes every vertex to the `finish order` row in the order it FINISHES; that row will be reversed at the end.'), L_INIT);

      var color = {}, finish = [], hasCycle = false;
      V.forEach(function (v) { color[v] = 0; });

      /* entryCap/entryLines describe the DECISION that led here (a fresh root, or a tree edge from the
       * parent): merged with dfs_visit(u)'s own entry line into ONE step -- "the call line, then the
       * callee's lines" -- instead of a separate "entered" step, the same idea strongly-connected-
       * components.js's visit1 and dijkstra.js's relax-a-whole-round use. */
      function visit(u, entryCap, entryLines) {
        color[u] = 1; S.set('col' + idxOf[u], { text: '1', style: 'active' });
        S.set('n' + u, { style: 'hl' }); stack.push(u); updateStack();
        S.step(entryCap, entryLines);
        var kids = adj[u];
        if (!kids.length) { S.step(T('`' + u + '`\'nin komşusu yok, döngü hemen biter.', '`' + u + '` has no neighbours, the loop finishes right away.'), noKids()); }
        kids.forEach(function (v) {
          if (color[v] === 0) {
            var eid = edgeIdBetween(u, v); if (eid >= 0) S.set('e' + eid, { style: 'new' });
            visit(v,
              T('Komşu `' + v + '` beyaz -- bir AĞAÇ KENARI, içine dalınır.', 'Neighbour `' + v + '` is white -- a TREE EDGE, we descend into it.'),
              treeLine(v));
          } else if (color[v] === 1) {
            hasCycle = true;
            var eid2 = edgeIdBetween(u, v); if (eid2 >= 0) S.set('e' + eid2, { style: 'del' });
            S.step(T('Komşu `' + v + '` gri (hâlâ yığında, bir ATA) -- bu bir GERİ KENAR: DÖNGÜ bulundu, `has_cycle = 1`.', 'Neighbour `' + v + '` is grey (still on the stack, an ANCESTOR) -- this is a BACK EDGE: a CYCLE is found, `has_cycle = 1`.'), backLine(v));
          } else {
            S.step(T('Komşu `' + v + '` siyah (bitmiş) -- yeni bir ağaç kenarı eklenmez, sadece atlanır.', 'Neighbour `' + v + '` is black (finished) -- no new tree edge, it is just skipped.'), skipLine(v));
          }
        });
        color[u] = 2; S.set('col' + idxOf[u], { text: '2', style: 'new' });
        stack.pop(); updateStack(); finBox(u); finish.push(u); S.set('n' + u, { style: 'dim' });
        S.step(T('`' + u + '` biter (siyah): bitiş sırasına eklenir (şimdiye kadar: ' + finish.join(', ') + '), yığından çıkar.',
                 '`' + u + '` finishes (black): appended to the finish order (so far: ' + finish.join(', ') + '), popped off the stack.'), L_FINISH);
      }

      V.forEach(function (v) {
        if (color[v] === 0) {
          visit(v,
            T('`' + v + '` beyaz ve kendi kökü -- yeni bir DFS ağacı başlatılır.', '`' + v + '` is white and its own root -- a new DFS tree starts.'),
            rootLine(v));
        }
      });

      var order = finish.slice().reverse();
      var oCount = 0;
      order.forEach(function (v) { S.box('o' + oCount, { x: ROWX0 + oCount * STEP, y: OY0, w: CW, h: CH, text: v, style: 'new', size: 16 }); oCount++; });
      if (hasCycle) {
        S.step(T('Bir geri kenar bulunduğu için bu sıra GEÇERLİ BİR TOPOLOJİK SIRALAMA DEĞİL -- grafikte döngü var.',
                 'Because a back edge was found, this order is NOT a valid topological order -- the graph has a cycle.'), L_REVERSE);
      } else {
        S.step(T('`bitiş sırası` ters çevrilir: ' + order.join(', ') + '. Her düğüm, kendisine gelen bütün kenarlardan sonra gelir.',
                 'The `finish order` is reversed: ' + order.join(', ') + '. Every vertex comes after all of its incoming edges.'), L_REVERSE);
      }
      S.result = { order: order, hasCycle: hasCycle };
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
