/* Week 9 -- cycle detection in a DIRECTED graph: 3-colour DFS (white/gray/black) with an explicit "on the current
 * path" stack. A back edge to a GREY vertex means that vertex is still an open ancestor -- the path from it down
 * to here, plus the back edge, IS the cycle. Same directed edge-list input as the topological-sort animations
 * (VERTEX>VERTEX), so the two lessons share one graph notation. */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_V 32',
    'int color_of[MAX_V];        /* 0 white, 1 gray, 2 black */',
    'int on_path[MAX_V], path_top;',
    'int cycle[MAX_V], cycle_len;',
    '',
    'int dfs_cycle(Graph *g, int u) {',
    '    color_of[u] = 1;                                 /* gray: on the current path */',
    '    on_path[path_top] = u; path_top++;',
    '    for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {  /* alphabetical order */',
    '        if (color_of[n->to] == 0) {',
    '            if (dfs_cycle(g, n->to)) return 1;',
    '        } else if (color_of[n->to] == 1) {',
    '            int i = path_top - 1;                     /* n->to is a grey ancestor: extract the cycle */',
    '            while (on_path[i] != n->to) i--;',
    '            cycle_len = 0;',
    '            for (; i < path_top; i++) { cycle[cycle_len] = on_path[i]; cycle_len++; }',
    '            return 1;',
    '        }',
    '    }',
    '    path_top--;                                       /* leaving the path: no cycle through u */',
    '    color_of[u] = 2;',
    '    return 0;',
    '}',
    '',
    'int has_cycle_directed(Graph *g) {',
    '    for (int i = 0; i < g->vertex_count; i++) color_of[i] = 0;',
    '    path_top = 0; cycle_len = 0;',
    '    for (int v = 0; v < g->vertex_count; v++)          /* alphabetical order */',
    '        if (color_of[v] == 0 && dfs_cycle(g, v)) return 1;',
    '    return 0;',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    'int[] colorOf = new int[MAX_V];        // 0 white, 1 gray, 2 black',
    'int[] onPath = new int[MAX_V]; int pathTop;',
    'int[] cycle = new int[MAX_V]; int cycleLen;',
    '',
    'boolean dfsCycle(Graph g, int u) {',
    '    colorOf[u] = 1;                                  // gray: on the current path',
    '    onPath[pathTop] = u; pathTop++;',
    '    for (AdjNode n = g.adj[u]; n != null; n = n.next) {  // alphabetical order',
    '        if (colorOf[n.to] == 0) {',
    '            if (dfsCycle(g, n.to)) return true;',
    '        } else if (colorOf[n.to] == 1) {',
    '            int i = pathTop - 1;                      // n.to is a grey ancestor: extract the cycle',
    '            while (onPath[i] != n.to) i--;',
    '            cycleLen = 0;',
    '            for (; i < pathTop; i++) { cycle[cycleLen] = onPath[i]; cycleLen++; }',
    '            return true;',
    '        }',
    '    }',
    '    pathTop--;                                        // leaving the path: no cycle through u',
    '    colorOf[u] = 2;',
    '    return false;',
    '}',
    '',
    'boolean hasCycleDirected(Graph g) {',
    '    for (int i = 0; i < g.vertexCount; i++) colorOf[i] = 0;',
    '    pathTop = 0; cycleLen = 0;',
    '    for (int v = 0; v < g.vertexCount; v++)            // alphabetical order',
    '        if (colorOf[v] == 0 && dfsCycle(g, v)) return true;',
    '    return false;',
    '}'
  ];
  /* Positions (1-indexed, C_CODE/JAVA_CODE mirror line-for-line): 7=color_of[u]=1 (entry, gray), 8=on_path
   * push, 9=for(neighbours) [COND], 10=if(color==0) [COND, tree branch open], 11=the tree branch's
   * recursive call (its body), 12=else if(color==1) [COND, back-edge branch open], 13=i=path_top-1,
   * 14=while(on_path[i]!=n->to) [COND], 15=cycle_len=0, 16=for(;i<path_top;i++) [COND, collect the slice],
   * 20=path_top-- (leaving the path), 21=color_of[u]=2 (black), 22=return 0, 26=reset color_of[] (ONE-TIME),
   * 27=path_top/cycle_len init (ONE-TIME), 28=root for-loop [COND], 29=if(color==0 && dfs_cycle) [COND],
   * 30=return 0 (no cycle anywhere). Earlier versions of L_ROOT reused the ONE-TIME reset (26) on every new
   * root, and L_BACK included line 11 (the TREE branch's OWN call, which never runs when we take the
   * back-edge branch instead) as if it had executed -- both fixed below, same as the other week 9 DFS files. */
  function LN(arr) { return { c: arr, java: arr }; }
  var L_INIT = LN([25, { n: 26, note: T('i < vertex_count mi? evet -- her düğüm için color_of[i]=0', 'i < vertex_count? yes -- color_of[i]=0 for every vertex') }, 27]);
  function rootLine(v) {
    return LN([{ n: 28, note: T('v < vertex_count mi? evet, v=`' + v + '`', 'v < vertex_count? yes, v=`' + v + '`') },
               { n: 29, note: T('color_of[' + v + '] mi? beyaz (0) -- yeni bir DFS başlar', 'color_of[' + v + ']? white (0) -- a new DFS starts') }]);
  }
  var L_ENTER = { c: [7, 8], java: [7, 8] };
  var NOTE_LOOP_N = T('n != NULL mi? evet -- sıradaki komşuya bakılıyor', 'n != NULL? yes -- looking at the next neighbour');
  function treeLine(v) {
    return LN([{ n: 9, note: NOTE_LOOP_N }, { n: 10, note: T('color_of[' + v + '] mi? beyaz (0) -- içine dalıyoruz', 'color_of[' + v + ']? white (0) -- we descend into it') }, 11]);
  }
  function backLine(v, start) {
    return LN([{ n: 9, note: NOTE_LOOP_N },
               { n: 10, note: T('color_of[' + v + '] mi? beyaz (0)? hayır', 'color_of[' + v + ']? white (0)? no') },
               { n: 11, skip: true },
               { n: 12, note: T('color_of[' + v + '] mi? gri (1) -- hâlâ yolda, bir ATA', 'color_of[' + v + ']? grey (1) -- still on the path, an ANCESTOR') },
               13, { n: 14, note: T('on_path[i] != `' + v + '` mi? konum ' + start + '\'e kadar geri taranır', 'on_path[i] != `' + v + '`? scanned backwards to position ' + start) },
               15, { n: 16, note: T('i < path_top mi? evet -- döngü dilimi toplanır', 'i < path_top? yes -- the cycle slice is collected') }]);
  }
  function blackLine(v) {
    return LN([{ n: 9, note: NOTE_LOOP_N },
               { n: 10, note: T('color_of[' + v + '] mi? beyaz (0)? hayır', 'color_of[' + v + ']? white (0)? no') },
               { n: 11, skip: true },
               { n: 12, note: T('color_of[' + v + '] mi? gri (1)? hayır -- siyah (2), zaten bitmiş', 'color_of[' + v + ']? grey (1)? no -- black (2), already finished') }]);
  }
  var L_LEAVE = { c: [20, 21, 22], java: [20, 21, 22] };
  var L_NOCYCLE = { c: [{ n: 30, note: T('döngü bulunamadı', 'no cycle found') }], java: [{ n: 30, note: T('döngü bulunamadı', 'no cycle found') }] };

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
  function layoutCircle(vertices) {
    var n = vertices.length, R = Math.max(140, 16 * n), cx = R + 46, cy = R + 46, pos = {};
    vertices.forEach(function (v, i) { var ang = -Math.PI / 2 + i * 2 * Math.PI / n; pos[v] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }; });
    return { pos: pos, cx: cx, cy: cy, R: R };
  }
  function label(i) { var s = '', n = i + 1; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }

  /** Independent computation: an ITERATIVE DFS with an explicit [vertex, nextChildIndex] frame stack (rather than
   *  build()'s true recursion) that stops at the FIRST back edge and extracts the cycle from the frame stack. */
  function iterativeCycle(edges) {
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    var V = Object.keys(vset).sort();
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { adj[e.a].push(e.b); });
    V.forEach(function (v) { adj[v].sort(); });
    var color = {}; V.forEach(function (v) { color[v] = 0; });
    var found = null;
    for (var r = 0; r < V.length && !found; r++) {
      var root = V[r];
      if (color[root] !== 0) continue;
      var frames = [{ u: root, i: 0 }];
      color[root] = 1;
      while (frames.length && !found) {
        var top = frames[frames.length - 1], kids = adj[top.u];
        if (top.i < kids.length) {
          var w = kids[top.i]; top.i++;
          if (color[w] === 0) { color[w] = 1; frames.push({ u: w, i: 0 }); }
          else if (color[w] === 1) {
            var path = frames.map(function (f) { return f.u; });
            var start = path.indexOf(w);
            found = path.slice(start);
          }
        } else { color[top.u] = 2; frames.pop(); }
      }
    }
    return { hasCycle: !!found, cycle: found || [] };
  }

  D.define({
    id: 'cycle-detection-directed',
    title: T('Yönlü çizgede döngü sezimi', 'Cycle detection in a directed graph'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('8 düğüm, 10 kenar, bir döngü: C-D-F-C', '8 vertices, 10 edges, one cycle: C-D-F-C'),
        data: { edges: [
          { a: 'A', b: 'B' }, { a: 'A', b: 'C' }, { a: 'B', b: 'D' }, { a: 'C', b: 'D' }, { a: 'D', b: 'F' },
          { a: 'F', b: 'C' }, { a: 'D', b: 'E' }, { a: 'F', b: 'G' }, { a: 'E', b: 'G' }, { a: 'G', b: 'H' }
        ] } },
      { id: 'hard', level: 'hard', name: T('10 düğüm, 14 kenar, iç içe iki döngü', '10 vertices, 14 edges, two overlapping cycles'),
        data: { edges: [
          { a: 'A', b: 'B' }, { a: 'B', b: 'C' }, { a: 'C', b: 'D' }, { a: 'D', b: 'B' }, { a: 'D', b: 'E' },
          { a: 'E', b: 'F' }, { a: 'F', b: 'D' }, { a: 'F', b: 'G' }, { a: 'G', b: 'H' }, { a: 'H', b: 'I' },
          { a: 'I', b: 'J' }, { a: 'A', b: 'E' }, { a: 'C', b: 'F' }, { a: 'B', b: 'G' }
        ] } },
      { id: 'acyclic', level: 'edge', name: T('Uç: 10 kenar, tamamen döngüsüz (DAG)', 'Edge case: 10 edges, entirely cycle-free (a DAG)'),
        data: { edges: [
          { a: 'A', b: 'B' }, { a: 'A', b: 'C' }, { a: 'B', b: 'D' }, { a: 'C', b: 'D' }, { a: 'D', b: 'E' },
          { a: 'C', b: 'F' }, { a: 'E', b: 'G' }, { a: 'F', b: 'G' }, { a: 'G', b: 'H' }, { a: 'B', b: 'E' }
        ] } },
      { id: 'min-cycle', level: 'edge', name: T('Uç: en küçük döngü, A-B-A (2 kenar), 10 kenar arasında', 'Edge case: the smallest cycle, A-B-A (2 edges), among 10 edges'),
        data: { edges: [
          { a: 'A', b: 'B' }, { a: 'B', b: 'A' }, { a: 'C', b: 'D' }, { a: 'D', b: 'E' }, { a: 'E', b: 'F' },
          { a: 'C', b: 'E' }, { a: 'F', b: 'G' }, { a: 'G', b: 'H' }, { a: 'D', b: 'G' }, { a: 'H', b: 'I' }
        ] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.edges.length; },
    reference: function (d) { return iterativeCycle(d.edges); },
    random: function (level, r) {
      var n = { easy: 8, normal: 9, hard: 11, extreme: 13 }[level] || 9;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var m = { easy: 10, normal: 11, hard: 15, extreme: 18 }[level] || 11;
      var edges = [], seen = {}, guard = 0;
      var wantCycle = r() < 0.6;
      while (edges.length < m && guard < 2000) {
        guard++;
        var i1 = D.randInt(r, 0, n - 1), j1 = D.randInt(r, 0, n - 1);
        if (i1 === j1) continue;
        var key = vertices[i1] + '>' + vertices[j1];
        if (seen[key]) continue;
        if (!wantCycle && i1 > j1) continue; // keep strictly acyclic when not wanting a cycle
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
      var edges = d.edges, V = verticesOf(edges), adj = buildAdj(V, edges);
      var lay = layoutCircle(V), pos = lay.pos, cx = lay.cx, cy = lay.cy, R = lay.R;
      V.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: 'empty' }); });
      var eseen = {};
      edges.forEach(function (e, idx) {
        var key = e.a + '>' + e.b, k = eseen[key] === undefined ? 0 : eseen[key] + 1; eseen[key] = k;
        var revKey = e.b + '>' + e.a, bend = k ? 20 * k : (edges.some(function (f) { return f.a === e.b && f.b === e.a; }) ? 16 : 0);
        S.arrow('e' + idx, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: true, bend: bend, style: 'dim' });
      });

      var ROWX0 = 40, STEP = 44, CW = 36, CH = 36;
      var COLY = cy + R + 66, STY = COLY + CH + 56, CYY = STY + CH + 56;
      S.label('collbl', { x: ROWX0 - 14, y: COLY + 24, text: T('renk[] =', 'color[] ='), anchor: 'end', size: 14, mono: true });
      var idxOf = {}; V.forEach(function (v, i) { idxOf[v] = i; S.box('col' + i, { x: ROWX0 + i * STEP, y: COLY, w: CW, h: CH, text: 'W', style: 'empty', size: 14, above: v }); });
      S.label('stlbl', { x: ROWX0 - 14, y: STY + 24, text: T('yol (on_path) =', 'path (on_path) ='), anchor: 'end', size: 14, mono: true });
      for (var si = 0; si < V.length; si++) S.box('st' + si, { x: ROWX0 + si * STEP, y: STY, w: CW, h: CH, text: '', style: 'empty', size: 15 });
      S.label('cylbl', { x: ROWX0 - 14, y: CYY + 24, text: T('döngü =', 'cycle ='), anchor: 'end', size: 14, mono: true });

      var path = [];
      function updatePath() { for (var i = 0; i < V.length; i++) { if (i < path.length) S.set('st' + i, { text: path[i], style: i === path.length - 1 ? 'hl' : 'active' }); else S.set('st' + i, { text: '', style: 'empty' }); } }
      function edgeIdBetween(u, v) { for (var ei = 0; ei < edges.length; ei++) { var e = edges[ei]; if (e.a === u && e.b === v) return ei; } return -1; }

      S.step(T('DÖNGÜ SEZİMİ (3 renk DFS): her düğüm beyaz(0)/gri(1, yolda)/siyah(2, bitmiş) olur; `on_path` şimdiki DFS yolunu tutar.',
               'CYCLE DETECTION (3-colour DFS): every vertex is white(0)/gray(1, on the path)/black(2, finished); `on_path` holds the current DFS path.'), L_INIT);

      var color = {}; V.forEach(function (v) { color[v] = 0; });
      var found = null;

      function visit(u) {
        if (found) return true;
        color[u] = 1; S.set('col' + idxOf[u], { text: '1', style: 'active' });
        S.set('n' + u, { style: 'hl' }); path.push(u); updatePath();
        S.step(T('`dfs_cycle(' + u + ')` -- gri yapılır, yola eklenir: ' + path.join(', ') + '.', '`dfs_cycle(' + u + ')` -- turned grey, pushed on the path: ' + path.join(', ') + '.'), L_ENTER);
        var kids = adj[u];
        for (var ki = 0; ki < kids.length; ki++) {
          var v = kids[ki];
          if (color[v] === 0) {
            var eid = edgeIdBetween(u, v); if (eid >= 0) S.set('e' + eid, { style: 'new' });
            S.step(T('Komşu `' + v + '` beyaz -- içine dalıyoruz.', 'Neighbour `' + v + '` is white -- we descend into it.'), treeLine(v));
            if (visit(v)) return true;
          } else if (color[v] === 1) {
            var eid2 = edgeIdBetween(u, v); if (eid2 >= 0) S.set('e' + eid2, { style: 'del' });
            var start = path.indexOf(v);
            found = path.slice(start);
            found.forEach(function (cv) { S.set('n' + cv, { style: 'del' }); });
            var cCount = 0;
            found.forEach(function (cv) { S.box('cy' + cCount, { x: ROWX0 + cCount * STEP, y: CYY, w: CW, h: CH, text: cv, style: 'del', size: 16 }); cCount++; });
            S.step(T('Komşu `' + v + '` gri: `' + v + '` hâlâ yolda, bir ATA. Yoldaki `' + start + '`. konumdan buraya kadarki dilim BİR DÖNGÜ: ' + found.join(' -> ') + ' -> ' + v + '.',
                     'Neighbour `' + v + '` is grey: `' + v + '` is still on the path, an ANCESTOR. The slice of the path from there to here IS A CYCLE: ' + found.join(' -> ') + ' -> ' + v + '.'), backLine(v, start));
            return true;
          } else {
            var eid3 = edgeIdBetween(u, v);
            S.step(T('Komşu `' + v + '` siyah (bitmiş, yolda değil) -- döngü değil, atlanır.', 'Neighbour `' + v + '` is black (finished, not on the path) -- not a cycle, skipped.'), blackLine(v));
          }
        }
        path.pop(); updatePath(); color[u] = 2; S.set('col' + idxOf[u], { text: '2', style: 'new' }); S.set('n' + u, { style: 'dim' });
        S.step(T('`' + u + '` yoldan çıkar (siyah): `' + u + '` üzerinden döngü yok.', '`' + u + '` leaves the path (black): no cycle goes through `' + u + '`.'), L_LEAVE);
        return false;
      }

      for (var r = 0; r < V.length && !found; r++) {
        if (color[V[r]] === 0) { S.step(T('`' + V[r] + '` beyaz -- yeni bir DFS başlıyor.', '`' + V[r] + '` is white -- a new DFS starts.'), rootLine(V[r])); visit(V[r]); }
      }
      if (!found) S.step(T('Bütün düğümler siyah oldu, hiç geri kenar bulunmadı: bu çizgede DÖNGÜ YOK.', 'Every vertex is black, no back edge was ever found: this graph HAS NO CYCLE.'), L_NOCYCLE);
      S.result = { hasCycle: !!found, cycle: found || [] };
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
