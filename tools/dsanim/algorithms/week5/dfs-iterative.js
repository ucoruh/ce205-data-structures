/* Week 5 -- depth-first search (DFS), iterative: an explicit stack drawn as a row (push/pop, LIFO). Neighbours
 * are pushed in REVERSE alphabetical order, so popping later returns them in alphabetical order -- matching the
 * order the recursive version (dfs-recursive.js) visits them in. A vertex may be pushed more than once; a stale
 * entry (already visited by the time it is popped) is simply discarded. Same graphs as dfs-recursive.js. */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_V 32',
    '#define MAX_STACK 256',
    '',
    'int visited[MAX_V];',
    'int stack_data[MAX_STACK], top = -1;',
    '',
    'void push(int v) { stack_data[++top] = v; }',
    'int  pop(void)   { return stack_data[top--]; }',
    '',
    'void dfs_iterative(Graph *g, int start) {',
    '    push(start);',
    '    while (top >= 0) {',
    '        int u = pop();',
    '        if (visited[u]) continue;      /* stale entry: already visited via another path */',
    '        visited[u] = 1;',
    '        printf("visit %d\\n", u);',
    '        for (int i = g->adj_count[u] - 1; i >= 0; i--)   /* push in REVERSE alphabetical order */',
    '            if (!visited[g->adj[u][i]]) push(g->adj[u][i]);',
    '    }',
    '}',
    '',
    'void dfs(Graph *g) {',
    '    for (int i = 0; i < g->vertex_count; i++) visited[i] = 0;',
    '    for (int i = 0; i < g->vertex_count; i++)',
    '        if (!visited[i]) dfs_iterative(g, i);   /* one tree per component */',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32, MAX_STACK = 256;',
    '',
    'boolean[] visited = new boolean[MAX_V];',
    'int[] stackData = new int[MAX_STACK]; int top = -1;',
    '',
    'void push(int v) { stackData[++top] = v; }',
    'int  pop()       { return stackData[top--]; }',
    '',
    'void dfsIterative(Graph g, int start) {',
    '    push(start);',
    '    while (top >= 0) {',
    '        int u = pop();',
    '        if (visited[u]) continue;      // stale entry: already visited via another path',
    '        visited[u] = true;',
    '        System.out.println("visit " + u);',
    '        for (int i = g.adjCount[u] - 1; i >= 0; i--)   // push in REVERSE alphabetical order',
    '            if (!visited[g.adj[u][i]]) push(g.adj[u][i]);',
    '    }',
    '}',
    '',
    'void dfs(Graph g) {',
    '    for (int i = 0; i < g.vertexCount; i++) visited[i] = false;',
    '    for (int i = 0; i < g.vertexCount; i++)',
    '        if (!visited[i]) dfsIterative(g, i);   // one tree per component',
    '}'
  ];
  var LINES_PUSHFN = { c: [7, 8], java: [6, 7] };
  var LINES_POP = { c: [12, 13], java: [11, 12] };
  var LINES_VISIT = { c: [14, 15, 16, 17], java: [13, 14, 15, 16] };
  var LINES_FOREST = { c: [20, 21, 22, 23], java: [19, 20, 21, 22] };

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

  D.define({
    id: 'dfs-iterative',
    title: T('Derinlik öncelikli arama (DFS) -- yinelemeli (açık yığın)', 'Depth-first search (DFS) -- iterative (explicit stack)'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('7 düğüm, yönsüz, 4 geri kenar (döngü), 10 kenar', '7 vertices, undirected, 4 back edges (cycles), 10 edges'),
        data: { directed: false, edges: [
          { a: 'A', b: 'B', w: null }, { a: 'B', b: 'C', w: null }, { a: 'C', b: 'D', w: null }, { a: 'D', b: 'E', w: null },
          { a: 'E', b: 'F', w: null }, { a: 'F', b: 'G', w: null }, { a: 'G', b: 'A', w: null },
          { a: 'A', b: 'D', w: null }, { a: 'B', b: 'E', w: null }, { a: 'C', b: 'F', w: null }
        ] } },
      { id: 'hard', level: 'hard', name: T('6 düğüm, yönlü, döngülü, 10 kenar', '6 vertices, directed, with a cycle, 10 edges'),
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
    /** Independent computation: plain RECURSION (own call stack, the language's own, not an explicit array) --
     *  the opposite technique from build()'s explicit-stack loop. Only the visit ORDER is checked. */
    reference: function (d) {
      var vset = {}; d.edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
      var V = Object.keys(vset).sort();
      var adj = {}; V.forEach(function (v) { adj[v] = []; });
      d.edges.forEach(function (e) { if (e.a !== e.b) { adj[e.a].push(e.b); if (!d.directed) adj[e.b].push(e.a); } });
      V.forEach(function (v) { adj[v].sort(); });
      var visited = {}, order = [];
      function rec(u) { visited[u] = true; order.push(u); adj[u].forEach(function (v) { if (!visited[v]) rec(v); }); }
      V.forEach(function (v) { if (!visited[v]) rec(v); });
      return { order: order };
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

      /* Size the stack row to what this exact run actually needs (a quiet dry run, discarded once counted), so
       * it always fits on one line, capped at 16. Rows sit below the graph, not beside it, and are named on the
       * left. */
      var CAP = Math.min(16, Math.max(1, (function () {
        var vis = {}, maxLen = 0;
        V.forEach(function (root) {
          if (vis[root]) return;
          var st = [root];
          while (st.length) {
            maxLen = Math.max(maxLen, st.length);
            var u = st.pop();
            if (vis[u]) continue;
            vis[u] = true;
            (adj[u] || []).slice().reverse().forEach(function (v) { if (!vis[v]) st.push(v); });
          }
        });
        return maxLen;
      })()));
      var ROWX0 = 40, STEP = 44, CW = 36, CH = 36;
      var SY0 = cy + R + 66;
      var OY0 = SY0 + CH + 56, OX0 = ROWX0;
      S.label('stlbl', { x: ROWX0 - 14, y: SY0 + 24, text: T('yığın =', 'stack ='), anchor: 'end', size: 14, mono: true });
      for (var si = 0; si < CAP; si++) S.box('s' + si, { x: ROWX0 + si * STEP, y: SY0, w: CW, h: CH, text: '', style: 'empty', size: 15 });
      S.label('lbl', { x: OX0 - 14, y: OY0 + 24, text: T('ziyaret sırası =', 'visit order ='), anchor: 'end', size: 14, mono: true });

      function updateStack(stack) { for (var i = 0; i < CAP; i++) { if (i < stack.length) S.set('s' + i, { text: stack[i], style: i === stack.length - 1 ? 'hl' : 'active' }); else S.set('s' + i, { text: '', style: 'empty' }); } }
      var boxCount = 0;
      function outputBox(v) { if (boxCount > 0) S.set('o' + (boxCount - 1), { style: 'normal' }); S.box('o' + boxCount, { x: OX0 + boxCount * STEP, y: OY0, w: CW, h: CH, text: v, style: 'hl', size: 16 }); boxCount++; }

      S.step(T('DFS, yinelemeli: özyinelemeli çağrı yığını yerine açık bir YIĞIN (stack, LIFO) kullanılır. Bir düğümün komşuları TERS alfabetik sırada yığına eklenir -- böylece sonra tek tek çıkarıldıklarında (pop) alfabetik sırayla işlenirler, tıpkı özyinelemeli sürümdeki gibi.',
               'DFS, iterative: instead of the recursive call stack, an explicit STACK (LIFO) is used. A vertex\'s neighbours are pushed in REVERSE alphabetical order -- so that popping them one at a time later processes them in alphabetical order, just like the recursive version.'), LINES_PUSHFN);

      var visited = {}, order = [];
      V.forEach(function (root) {
        if (visited[root]) return;
        var stack = [root];
        updateStack(stack);
        while (stack.length) {
          var u = stack.pop();
          if (visited[u]) {
            updateStack(stack);
            S.step(T('`pop()` → `' + u + '`, ama zaten ziyaret edilmiş -- bu ESKİMİŞ (stale) bir kayıt, başka bir yoldan yığına ikinci kez eklenmişti. Atılır.',
                     '`pop()` → `' + u + '`, but it is already visited -- this is a STALE entry, pushed a second time via another path. It is discarded.'), LINES_POP);
            continue;
          }
          visited[u] = true; order.push(u);
          S.set('n' + u, { style: 'hl' }); outputBox(u);
          updateStack(stack);
          var kids = [];
          var rev = (adj[u] || []).slice().reverse();
          rev.forEach(function (v) { if (!visited[v]) { stack.push(v); kids.push(v); } });
          updateStack(stack);
          S.step(T('`pop()` → `' + u + '`; ziyaret edilir (sıra: ' + order.join(', ') + '). Komşuları TERS alfabetik sırada yığına eklenir: ' + (kids.length ? kids.join(', ') : T('yok', 'none').tr) + '.',
                   '`pop()` → `' + u + '`; it is visited (order so far: ' + order.join(', ') + '). Its neighbours are pushed in reverse alphabetical order: ' + (kids.length ? kids.join(', ') : 'none') + '.'), LINES_VISIT);
          S.set('n' + u, { style: 'dim' });
        }
      });

      S.result = { order: order };
      S.step(T('Yığın boş, bitti. Ziyaret sırası: ' + order.join(', ') + ' -- özyinelemeli sürümle tamamen aynı.', 'The stack is empty, done. Visit order: ' + order.join(', ') + ' -- exactly the same as the recursive version.'), LINES_FOREST);
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
