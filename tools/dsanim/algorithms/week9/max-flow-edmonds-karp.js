/* Week 9 -- maximum flow by EDMONDS-KARP: repeatedly BFS the RESIDUAL graph (an edge may still be used if its
 * residual capacity -- capacity minus flow already sent -- is positive) for the SHORTEST augmenting path from s to
 * t, push the bottleneck (smallest residual capacity on that path), and repeat until no path remains. Pushing flow
 * forward on an edge also opens capacity on its REVERSE edge, so a later path can partly undo an earlier choice.
 * Input: "s=A t=F A>B:5 B>C:3 ..." (directed edges with a capacity; every ordered pair at most once). */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_V 32',
    '#define INF 1000000000',
    '',
    'int cap_of[MAX_V][MAX_V];    /* residual capacity; reverse pairs start at 0 unless also a given edge */',
    'int parent_of[MAX_V];',
    '',
    'int bfs_augmenting_path(int vertex_count, int s, int t) {   /* shortest path using cap_of > 0 only */',
    '    int visited[MAX_V] = {0}, queue_data[MAX_V], front = 0, rear = 0;',
    '    visited[s] = 1; queue_data[rear] = s; rear++;',
    '    while (front < rear) {',
    '        int u = queue_data[front]; front++;',
    '        for (int v = 0; v < vertex_count; v++)              /* alphabetical order */',
    '            if (!visited[v] && cap_of[u][v] > 0) { visited[v] = 1; parent_of[v] = u; queue_data[rear] = v; rear++; }',
    '    }',
    '    return visited[t];',
    '}',
    '',
    'int edmonds_karp(int vertex_count, int s, int t) {',
    '    int max_flow = 0;',
    '    while (bfs_augmenting_path(vertex_count, s, t)) {',
    '        int bottleneck = INF;',
    '        for (int v = t; v != s; v = parent_of[v]) {',
    '            int u = parent_of[v];',
    '            if (cap_of[u][v] < bottleneck) bottleneck = cap_of[u][v];',
    '        }',
    '        for (int v = t; v != s; v = parent_of[v]) {',
    '            int u = parent_of[v];',
    '            cap_of[u][v] -= bottleneck;                      /* use up forward capacity */',
    '            cap_of[v][u] += bottleneck;                      /* open up backward (undo) capacity */',
    '        }',
    '        max_flow += bottleneck;',
    '    }',
    '    return max_flow;',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    'static final int INF = 1000000000;',
    '',
    'int[][] capOf = new int[MAX_V][MAX_V];  // residual capacity; reverse pairs start at 0 unless also a given edge',
    'int[] parentOf = new int[MAX_V];',
    '',
    'boolean bfsAugmentingPath(int vertexCount, int s, int t) {  // shortest path using capOf > 0 only',
    '    boolean[] visited = new boolean[MAX_V]; int[] queueData = new int[MAX_V]; int front = 0, rear = 0;',
    '    visited[s] = true; queueData[rear] = s; rear++;',
    '    while (front < rear) {',
    '        int u = queueData[front]; front++;',
    '        for (int v = 0; v < vertexCount; v++)                // alphabetical order',
    '            if (!visited[v] && capOf[u][v] > 0) { visited[v] = true; parentOf[v] = u; queueData[rear] = v; rear++; }',
    '    }',
    '    return visited[t];',
    '}',
    '',
    'int edmondsKarp(int vertexCount, int s, int t) {',
    '    int maxFlow = 0;',
    '    while (bfsAugmentingPath(vertexCount, s, t)) {',
    '        int bottleneck = INF;',
    '        for (int v = t; v != s; v = parentOf[v]) {',
    '            int u = parentOf[v];',
    '            if (capOf[u][v] < bottleneck) bottleneck = capOf[u][v];',
    '        }',
    '        for (int v = t; v != s; v = parentOf[v]) {',
    '            int u = parentOf[v];',
    '            capOf[u][v] -= bottleneck;                        // use up forward capacity',
    '            capOf[v][u] += bottleneck;                        // open up backward (undo) capacity',
    '        }',
    '        maxFlow += bottleneck;',
    '    }',
    '    return maxFlow;',
    '}'
  ];
  /* C_CODE/JAVA_CODE mirror line-for-line (LN reuses one array). Positions: 10=while(front<rear) [COND, BFS
   * frontier], 12=for(v) [COND, scan every vertex], 13=if(!visited[v]&&cap>0) [COND, admit into the BFS
   * tree], 20=while(bfs_augmenting_path(...)) [COND, the outer round loop], 22=for(v=t...) [COND, walk the
   * path to find the bottleneck], 24=if(cap[u][v]<bottleneck) [COND, the actual min], 26=for(v=t...) [COND,
   * walk the path again to apply it]. L_TOTAL previously pointed at the closing brace of the augment loop
   * (30) instead of the function's real ending (33) -- fixed below. */
  function LN(arr) { return { c: arr, java: arr }; }
  var NOTE_WHILE_FRONT = T('front < rear mi? evet -- kuyrukta hâlâ düğüm var', 'front < rear? yes -- the queue still has vertices');
  var NOTE_SCAN_V = T('v < vertex_count mi? evet -- sıradaki düğüme bakılıyor', 'v < vertex_count? yes -- looking at the next vertex');
  var NOTE_ADMIT = T('visited[v] değilse ve cap_of[u][v] > 0 mı? -- bazı düğümler BFS ağacına eklenir', 'not visited[v] and cap_of[u][v] > 0? -- some vertices are admitted into the BFS tree');
  var NOTE_ADMIT_NONE = T('visited[v] değilse ve cap_of[u][v] > 0 mı? -- artık hiçbiri değil', 'not visited[v] and cap_of[u][v] > 0? -- none any more');
  var L_BFS = LN([7, 8, 9, { n: 10, note: NOTE_WHILE_FRONT }, 11, { n: 12, note: NOTE_SCAN_V }, { n: 13, note: NOTE_ADMIT }, 14]);
  var L_NOPATH = LN([7, 8, 9, { n: 10, note: NOTE_WHILE_FRONT }, 11, { n: 12, note: NOTE_SCAN_V }, { n: 13, note: NOTE_ADMIT_NONE }, 14, { n: 15, note: T('t erişilemedi', 't unreached') }]);
  var NOTE_WALK_PATH = T('v != s mi? evet -- yoldan geriye doğru yürünür', 'v != s? yes -- walking back along the path');
  var L_BOTTLENECK = LN([{ n: 20, note: T('bfs_augmenting_path(...) mi? evet -- bir yol bulundu', 'bfs_augmenting_path(...)? yes -- a path was found') }, 21,
                          { n: 22, note: NOTE_WALK_PATH }, 23, { n: 24, note: T('cap_of[u][v] < bottleneck mi? en küçüğü bulunur', 'cap_of[u][v] < bottleneck? the smallest one is found') }]);
  var L_AUGMENT = LN([{ n: 26, note: NOTE_WALK_PATH }, 27, 28, 29]);
  var L_TOTAL = LN([32, 33]);

  var EDGE_RE = /^([A-Za-z0-9]{1,3})>([A-Za-z0-9]{1,3}):(\d+)$/;
  function parseFlow(text) {
    var toks = String(text).trim().split(/\s+/).filter(Boolean);
    if (toks.length < 2) throw T('Metin çok kısa: "s=A t=F A>B:5 ..." yazın.', 'The text is too short: write "s=A t=F A>B:5 ...".');
    var m0 = /^s=([A-Za-z0-9]{1,3})$/i.exec(toks[0]), m1 = /^t=([A-Za-z0-9]{1,3})$/i.exec(toks[1]);
    if (!m0) throw T('İlk sözcük "s=X" biçiminde olmalı (kaynak).', 'The first word must look like "s=X" (source).');
    if (!m1) throw T('İkinci sözcük "t=X" biçiminde olmalı (hedef).', 'The second word must look like "t=X" (sink).');
    var s = m0[1], t = m1[1]; toks = toks.slice(2);
    if (s === t) throw T('Kaynak ve hedef aynı olamaz.', 'The source and the sink cannot be the same.');
    if (!toks.length) throw T('En az bir kenar yazın.', 'Write at least one edge.');
    var edges = [], seen = {};
    for (var i = 0; i < toks.length; i++) {
      var m = EDGE_RE.exec(toks[i]);
      if (!m) throw T('"' + toks[i] + '" anlaşılmadı: yönlü ve kapasiteli kenar VERTEX>VERTEX:KAPASİTE biçiminde olmalı.', '"' + toks[i] + '" is not understood: a directed capacitated edge must look like VERTEX>VERTEX:CAPACITY.');
      if (m[1] === m[2]) throw T('Bir düğüm kendine kenar veremez: "' + toks[i] + '".', 'A vertex cannot have an edge to itself: "' + toks[i] + '".');
      var w = parseInt(m[3], 10);
      if (w < 1) throw T('Kapasite en az 1 olmalı: "' + toks[i] + '".', 'Capacity must be at least 1: "' + toks[i] + '".');
      var key = m[1] + '>' + m[2];
      if (seen[key]) throw T('Aynı yönlü kenar iki kez verilemez: "' + key + '".', 'The same directed edge cannot be given twice: "' + key + '".');
      seen[key] = 1;
      edges.push({ a: m[1], b: m[2], cap: w });
    }
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    if (!(s in vset)) throw T('Kaynak "' + s + '" kenarlarda geçmiyor.', 'Source "' + s + '" does not appear in the edges.');
    if (!(t in vset)) throw T('Hedef "' + t + '" kenarlarda geçmiyor.', 'Sink "' + t + '" does not appear in the edges.');
    return { s: s, t: t, edges: edges };
  }
  function formatFlow(d) { return 's=' + d.s + ' t=' + d.t + ' ' + d.edges.map(function (e) { return e.a + '>' + e.b + ':' + e.cap; }).join(' '); }
  function verticesOf(edges) { var s = {}; edges.forEach(function (e) { s[e.a] = 1; s[e.b] = 1; }); return Object.keys(s).sort(); }
  function layoutCircle(vertices) {
    var n = vertices.length, R = Math.max(140, 16 * n), cx = R + 46, cy = R + 46, pos = {};
    vertices.forEach(function (v, i) { var ang = -Math.PI / 2 + i * 2 * Math.PI / n; pos[v] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }; });
    return { pos: pos, cx: cx, cy: cy, R: R };
  }
  function label(i) { var s = '', n = i + 1; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }

  /** Independent computation: keeps residual capacity in a plain object map keyed by "u>v" strings (instead of
   *  build()'s numeric V x V matrix) and finds each augmenting path with an explicit visited SET rebuilt from
   *  scratch every round, a different representation that must reach the same maximum flow VALUE -- the only
   *  thing checked, since the specific edge-by-edge flow decomposition is not unique even under one fixed
   *  tie-break rule once backward (undo) edges start participating in later paths. */
  function maxFlowRef(edges, s, t) {
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    var V = Object.keys(vset).sort();
    var cap = {};
    edges.forEach(function (e) { cap[e.a + '>' + e.b] = e.cap; if (cap[e.b + '>' + e.a] === undefined) cap[e.b + '>' + e.a] = 0; });
    function residual(u, v) { var k = u + '>' + v; return cap[k] === undefined ? 0 : cap[k]; }
    function setResidual(u, v, val) { cap[u + '>' + v] = val; }
    var maxFlow = 0;
    for (;;) {
      var visited = {}, parent = {}, queue = [s], qi = 0; visited[s] = true;
      while (qi < queue.length) {
        var u = queue[qi++];
        for (var i = 0; i < V.length; i++) { var v = V[i]; if (!visited[v] && residual(u, v) > 0) { visited[v] = true; parent[v] = u; queue.push(v); } }
      }
      if (!visited[t]) break;
      var bottleneck = Infinity;
      for (var cur = t; cur !== s; cur = parent[cur]) { var pu = parent[cur]; bottleneck = Math.min(bottleneck, residual(pu, cur)); }
      for (cur = t; cur !== s; cur = parent[cur]) { pu = parent[cur]; setResidual(pu, cur, residual(pu, cur) - bottleneck); setResidual(cur, pu, residual(cur, pu) + bottleneck); }
      maxFlow += bottleneck;
    }
    return { maxFlow: maxFlow };
  }

  D.define({
    id: 'max-flow-edmonds-karp',
    title: T('Edmonds-Karp en büyük akış', 'Edmonds-Karp maximum flow'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('6 düğüm, 10 kenar, `A`\'dan `F`\'e', '6 vertices, 10 edges, `A` to `F`'),
        data: { s: 'A', t: 'F', edges: [
          { a: 'A', b: 'B', cap: 6 }, { a: 'A', b: 'C', cap: 4 }, { a: 'B', b: 'C', cap: 2 }, { a: 'B', b: 'D', cap: 5 },
          { a: 'C', b: 'E', cap: 4 }, { a: 'D', b: 'E', cap: 1 }, { a: 'D', b: 'F', cap: 4 }, { a: 'E', b: 'F', cap: 6 },
          { a: 'C', b: 'D', cap: 3 }, { a: 'A', b: 'D', cap: 2 }
        ] } },
      { id: 'hard', level: 'hard', name: T('8 düğüm, 14 kenar, `A`\'dan `H`\'ye, birkaç genişletici yol gerekir', '8 vertices, 14 edges, `A` to `H`, needs several augmenting paths'),
        data: { s: 'A', t: 'H', edges: [
          { a: 'A', b: 'B', cap: 10 }, { a: 'A', b: 'C', cap: 8 }, { a: 'B', b: 'C', cap: 5 }, { a: 'B', b: 'D', cap: 5 },
          { a: 'C', b: 'D', cap: 3 }, { a: 'C', b: 'E', cap: 6 }, { a: 'D', b: 'E', cap: 2 }, { a: 'D', b: 'F', cap: 8 },
          { a: 'E', b: 'F', cap: 4 }, { a: 'E', b: 'G', cap: 6 }, { a: 'F', b: 'H', cap: 9 }, { a: 'G', b: 'H', cap: 7 },
          { a: 'F', b: 'G', cap: 3 }, { a: 'B', b: 'E', cap: 4 }
        ] } },
      { id: 'no-path', level: 'edge', name: T('Uç: `A` ve `J` iki ayrı bileşende -- en büyük akış 0 (10 kenar)', 'Edge case: `A` and `J` are in two separate components -- max flow is 0 (10 edges)'),
        data: { s: 'A', t: 'J', edges: [
          { a: 'A', b: 'B', cap: 3 }, { a: 'B', b: 'C', cap: 4 }, { a: 'A', b: 'C', cap: 2 }, { a: 'C', b: 'D', cap: 5 },
          { a: 'D', b: 'E', cap: 1 },
          { a: 'F', b: 'G', cap: 2 }, { a: 'G', b: 'H', cap: 6 }, { a: 'H', b: 'I', cap: 3 }, { a: 'I', b: 'J', cap: 4 },
          { a: 'F', b: 'J', cap: 1 }
        ] } },
      { id: 'two-vertices', level: 'edge', name: T('Uç: 2 düğüm, 1 kenar', 'Edge case: 2 vertices, 1 edge'),
        data: { s: 'A', t: 'B', edges: [{ a: 'A', b: 'B', cap: 7 }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.edges.length; },
    reference: function (d) { return maxFlowRef(d.edges, d.s, d.t); },
    random: function (level, r) {
      var n = { easy: 6, normal: 7, hard: 9, extreme: 11 }[level] || 7;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var m = { easy: 10, normal: 11, hard: 14, extreme: 17 }[level] || 11;
      var capHi = level === 'extreme' ? 30 : 10;
      var edges = [], seen = {};
      for (var i2 = 1; i2 < n; i2++) { var j = D.randInt(r, 0, i2 - 1); edges.push({ a: vertices[j], b: vertices[i2], cap: D.randInt(r, 1, capHi) }); seen[vertices[j] + '>' + vertices[i2]] = 1; }
      var guard = 0;
      while (edges.length < m && guard < 1000) {
        guard++;
        var x = vertices[D.randInt(r, 0, n - 1)], y = vertices[D.randInt(r, 0, n - 1)];
        if (x === y) continue;
        var key = x + '>' + y;
        if (seen[key] || seen[y + '>' + x]) continue;
        edges.push({ a: x, b: y, cap: D.randInt(r, 1, capHi) }); seen[key] = 1;
      }
      return { s: vertices[0], t: vertices[n - 1], edges: edges };
    },
    input: {
      hint: T('Örnek: s=A t=F A>B:5 B>C:3 A>C:4   (kenarlar yönlü ve kapasiteli, her sıralı çift en çok bir kez)', 'Example: s=A t=F A>B:5 B>C:3 A>C:4   (edges are directed and capacitated, each ordered pair at most once)'),
      parse: parseFlow,
      format: formatFlow,
      bad: ['', 'A>B:5', 's=A A>B:5', 's=A t=B', 's=A t=A A>B:5']
    },
    build: function (S, d) {
      var edges = d.edges, s = d.s, t = d.t, V = verticesOf(edges);
      var lay = layoutCircle(V), pos = lay.pos, cx = lay.cx, cy = lay.cy, R = lay.R;
      V.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: v === s ? 'new' : (v === t ? 'active' : 'empty') }); });
      var eidOf = {};
      edges.forEach(function (e, idx) { eidOf[e.a + '>' + e.b] = idx; S.arrow('e' + idx, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: true, text: '0/' + e.cap, style: 'dim' }); });

      var ROWX0 = 40, STEP = 62, CW = 54, CH = 34;
      /* keep the residual row's width close to the graph's own width, so the strip export (which scales the
       * whole scene to a fixed thumbnail width) does not shrink the graph to make room for a much wider row */
      var COLS = Math.max(3, Math.floor((2 * R + 92 - ROWX0) / STEP));
      var RY = cy + R + 66;
      var maxRows = Math.max(1, Math.ceil((2 * edges.length) / COLS));
      S.label('rlbl', { x: ROWX0 - 14, y: RY + 24, text: T('kalan (residual) =', 'residual ='), anchor: 'end', size: 14, mono: true });
      S.label('flbl', { x: cx, y: RY + maxRows * (CH + 8) + 40, text: T('en büyük akış = 0', 'max flow = 0'), anchor: 'middle', size: 17, bold: true, mono: true });

      var cap = {}; edges.forEach(function (e) { cap[e.a + '>' + e.b] = e.cap; if (cap[e.b + '>' + e.a] === undefined) cap[e.b + '>' + e.a] = 0; });
      function residual(u, v) { var k = u + '>' + v; return cap[k] === undefined ? 0 : cap[k]; }
      function setResidual(u, v, val) { cap[u + '>' + v] = val; }
      function refreshResidualRow() {
        var toks = [];
        V.forEach(function (u) { V.forEach(function (v) { if (u !== v && residual(u, v) > 0) toks.push(u + '>' + v + ':' + residual(u, v)); }); });
        for (var i = 0; i < toks.length; i++) S.box('r' + i, { x: ROWX0 + (i % COLS) * STEP, y: RY + Math.floor(i / COLS) * (CH + 8), w: CW, h: CH, text: toks[i], style: 'empty', size: 12 });
        for (var k = toks.length; S.has('r' + k); k++) S.remove('r' + k);
      }
      function refreshEdgeLabels() {
        edges.forEach(function (e) { var used = e.cap - residual(e.a, e.b); S.set('e' + eidOf[e.a + '>' + e.b], { text: used + '/' + e.cap }); });
      }
      refreshResidualRow();
      S.step(T('BAŞLANGIÇ: her kenarın akışı 0. Kalan (residual) kapasite listesi, o an > 0 olan bütün yönlü kapasiteleri gösterir.',
               'INIT: every edge starts at flow 0. The residual list shows every directed capacity that is currently > 0.'), L_BFS);

      var maxFlow = 0, round = 0;
      for (;;) {
        var visited = {}, parent = {}, queue = [s], qi = 0; visited[s] = true;
        while (qi < queue.length) {
          var u = queue[qi++];
          for (var i = 0; i < V.length; i++) { var v = V[i]; if (!visited[v] && residual(u, v) > 0) { visited[v] = true; parent[v] = u; queue.push(v); } }
        }
        if (!visited[t]) {
          S.step(T('BFS: `' + t + '`\'ye artık ARTIRICI (augmenting) bir yol yok -- durur.', 'BFS: there is no more AUGMENTING path to `' + t + '` -- we stop.'), L_NOPATH);
          break;
        }
        round++;
        var path = [t]; for (var cur = t; cur !== s; cur = parent[cur]) path.unshift(parent[cur]);
        path.forEach(function (v) { S.set('n' + v, { style: v === s || v === t ? S.get('n' + v).style : 'hl' }); });
        S.step(T('BFS ile en kısa artırıcı yol bulunur (tur ' + round + '): ' + path.join(' -> ') + '.', 'BFS finds the shortest augmenting path (round ' + round + '): ' + path.join(' -> ') + '.'), L_BFS);
        var bottleneck = Infinity;
        for (cur = t; cur !== s; cur = parent[cur]) { var pu = parent[cur]; bottleneck = Math.min(bottleneck, residual(pu, cur)); }
        S.step(T('Darboğaz (bottleneck) = yol üzerindeki en küçük kalan kapasite = ' + bottleneck + '.', 'Bottleneck = the smallest residual capacity on the path = ' + bottleneck + '.'), L_BOTTLENECK);
        for (cur = t; cur !== s; cur = parent[cur]) { pu = parent[cur]; setResidual(pu, cur, residual(pu, cur) - bottleneck); setResidual(cur, pu, residual(cur, pu) + bottleneck); }
        maxFlow += bottleneck;
        refreshEdgeLabels(); refreshResidualRow();
        S.set('flbl', { text: T('en büyük akış = ' + maxFlow, 'max flow = ' + maxFlow) });
        path.forEach(function (v) { if (v !== s && v !== t) S.set('n' + v, { style: 'empty' }); });
        S.step(T('Yol boyunca ' + bottleneck + ' birim akış eklenir; ters yönde ' + bottleneck + ' birim geri alma kapasitesi açılır. Toplam akış şimdi ' + maxFlow + '.',
                 bottleneck + ' units of flow are pushed along the path; ' + bottleneck + ' units of "undo" capacity open up on the reverse direction. Total flow is now ' + maxFlow + '.'), L_AUGMENT);
      }
      S.result = { maxFlow: maxFlow };
      S.step(T('Bitti. `' + s + '`\'dan `' + t + '`\'ye en büyük akış = ' + maxFlow + ' (' + round + ' artırıcı yol kullanıldı).',
               'Done. Maximum flow from `' + s + '` to `' + t + '` = ' + maxFlow + ' (' + round + ' augmenting path' + (round === 1 ? '' : 's') + ' used).'), L_TOTAL);
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
