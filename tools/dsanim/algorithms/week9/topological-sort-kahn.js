/* Week 9 -- topological sort by KAHN's algorithm (in-degree + queue) on a directed graph. Input is a directed
 * edge list, as in week 5's bfs.js but every edge uses '>' (directed). If the graph has a cycle, Kahn's algorithm
 * cannot place every vertex: the queue empties early and the leftover vertices reveal the cycle. */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_V 32',
    '',
    'int indeg[MAX_V];',
    'int queue_data[MAX_V], front, rear;',
    'int order[MAX_V], order_len;',
    '',
    'void enqueue(int v) { queue_data[rear] = v; rear++; }',
    'int  dequeue(void)  { int v = queue_data[front]; front++; return v; }',
    '',
    'int topo_sort_kahn(Graph *g) {',
    '    for (int i = 0; i < g->vertex_count; i++) indeg[i] = 0;',
    '    for (int u = 0; u < g->vertex_count; u++)',
    '        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next)',
    '            indeg[n->to]++;',
    '    front = rear = 0; order_len = 0;',
    '    for (int v = 0; v < g->vertex_count; v++)        /* alphabetical order */',
    '        if (indeg[v] == 0) enqueue(v);',
    '    while (front < rear) {',
    '        int u = dequeue();',
    '        order[order_len] = u; order_len++;',
    '        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {  /* alphabetical order */',
    '            indeg[n->to]--;',
    '            if (indeg[n->to] == 0) enqueue(n->to);',
    '        }',
    '    }',
    '    return order_len == g->vertex_count;             /* 0 -> a cycle exists */',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    '',
    'int[] indeg = new int[MAX_V];',
    'int[] queueData = new int[MAX_V]; int front, rear;',
    'int[] order = new int[MAX_V]; int orderLen;',
    '',
    'void enqueue(int v) { queueData[rear] = v; rear++; }',
    'int  dequeue()      { int v = queueData[front]; front++; return v; }',
    '',
    'boolean topoSortKahn(Graph g) {',
    '    for (int i = 0; i < g.vertexCount; i++) indeg[i] = 0;',
    '    for (int u = 0; u < g.vertexCount; u++)',
    '        for (AdjNode n = g.adj[u]; n != null; n = n.next)',
    '            indeg[n.to]++;',
    '    front = rear = 0; orderLen = 0;',
    '    for (int v = 0; v < g.vertexCount; v++)           // alphabetical order',
    '        if (indeg[v] == 0) enqueue(v);',
    '    while (front < rear) {',
    '        int u = dequeue();',
    '        order[orderLen] = u; orderLen++;',
    '        for (AdjNode n = g.adj[u]; n != null; n = n.next) {  // alphabetical order',
    '            indeg[n.to]--;',
    '            if (indeg[n.to] == 0) enqueue(n.to);',
    '        }',
    '    }',
    '    return orderLen == g.vertexCount;                 // false -> a cycle exists',
    '}'
  ];
  /* Positions (1-indexed, C_CODE/JAVA_CODE mirror line-for-line): 11=reset indeg[] (ONE-TIME), 12=for(u),
   * 13=for(n) [both COND, the double loop that counts every edge once], 14=indeg[n->to]++, 15=front/rear
   * init (ONE-TIME), 16=seed for(v) [COND], 17=if(indeg[v]==0) enqueue [COND], 18=while(front<rear) [COND,
   * re-evaluated every dequeue AND the line whose FALSE exit really means "queue empty"], 21=relax for(n)
   * [COND], 23=if(indeg[n->to]==0) enqueue [COND]. The previous L_DONE pointed at the seed loop (16) instead
   * of the while-condition's false exit (18) -- fixed below, the same "point at the line that actually
   * decided this" fix applied to strongly-connected-components.js and topological-sort-dfs.js. */
  function LN(arr) { return { c: arr, java: arr }; }
  var L_INDEG = LN([10, { n: 11, note: T('i < vertex_count mi? evet -- her düğüm için indeg[i]=0', 'i < vertex_count? yes -- indeg[i]=0 for every vertex') },
                    { n: 12, note: T('u < vertex_count mi? evet -- her düğümün kenar listesi taranır', 'u < vertex_count? yes -- every vertex\'s edge list is scanned') },
                    { n: 13, note: T('n != NULL mi? evet -- her kenar için indeg[hedef]++', 'n != NULL? yes -- indeg[target]++ for every edge') }, 14]);
  var L_SEED = LN([15, { n: 16, note: T('v < vertex_count mi? evet -- alfabetik sırayla taranır', 'v < vertex_count? yes -- scanned in alphabetical order') },
                   { n: 17, note: T('indeg[v] == 0 mi? evet olanlar kuyruğa girer', 'indeg[v] == 0? the ones that are get enqueued') }]);
  var NOTE_WHILE_MORE = T('front < rear mi? evet -- kuyrukta hâlâ düğüm var', 'front < rear? yes -- the queue still has vertices');
  var L_DEQ = LN([{ n: 18, note: NOTE_WHILE_MORE }, 19, 20]);
  var NOTE_LOOP_RELAX = T('n != NULL mi? evet -- sıradaki komşunun içderecesi azaltılır', 'n != NULL? yes -- the next neighbour\'s in-degree is decremented');
  var L_RELAX = LN([{ n: 21, note: NOTE_LOOP_RELAX }, 22, { n: 23, note: T('indeg[hedef] == 0 mi? hayır -- kuyruğa girmez', 'indeg[target] == 0? no -- not enqueued') }]);
  var L_ZERO = LN([{ n: 21, note: NOTE_LOOP_RELAX }, 22, { n: 23, note: T('indeg[hedef] == 0 mi? evet -- kuyruğa girer', 'indeg[target] == 0? yes -- enqueued') }]);
  var L_DONE = LN([{ n: 18, note: T('front < rear mi? hayır -- kuyruk boş, döngü biter', 'front < rear? no -- the queue is empty, the loop ends') }]);

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

  /** Independent computation: from-scratch Kahn's algorithm with its own indegree map and array queue. */
  function kahn(edges) {
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    var V = Object.keys(vset).sort();
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { if (e.a !== e.b) adj[e.a].push(e.b); });
    V.forEach(function (v) { adj[v].sort(); });
    var indeg = {}; V.forEach(function (v) { indeg[v] = 0; });
    edges.forEach(function (e) { if (e.a !== e.b) indeg[e.b]++; });
    var q = [], qi = 0, order = [];
    V.forEach(function (v) { if (indeg[v] === 0) q.push(v); });
    while (qi < q.length) {
      var u = q[qi++]; order.push(u);
      adj[u].forEach(function (w) { indeg[w]--; if (indeg[w] === 0) q.push(w); });
    }
    return { order: order, hasCycle: order.length !== V.length };
  }

  D.define({
    id: 'topological-sort-kahn',
    title: T('Topolojik sıralama: Kahn algoritması', 'Topological sort: Kahn\'s algorithm'),
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
      { id: 'cycle', level: 'edge', name: T('Uç: 10 kenar ama bir döngü var, tam sıra çıkmaz', 'Edge case: 10 edges but a cycle exists, no full order'),
        data: { edges: [
          { a: 'A', b: 'B' }, { a: 'B', b: 'C' }, { a: 'C', b: 'A' }, { a: 'C', b: 'D' }, { a: 'D', b: 'E' },
          { a: 'E', b: 'F' }, { a: 'A', b: 'D' }, { a: 'F', b: 'G' }, { a: 'D', b: 'F' }, { a: 'B', b: 'D' }
        ] } },
      { id: 'single', level: 'edge', name: T('Uç: tek düğüm, kenarsız (öz-döngü ile gösterilir)', 'Edge case: a single vertex, no edges (shown with a self-loop)'),
        data: { edges: [{ a: 'A', b: 'A' }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.edges.length; },
    reference: function (d) { return kahn(d.edges); },
    random: function (level, r) {
      var n = { easy: 8, normal: 9, hard: 11, extreme: 13 }[level] || 9;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var m = { easy: 10, normal: 11, hard: 15, extreme: 18 }[level] || 11;
      var edges = [], seen = {}, guard = 0;
      while (edges.length < m && guard < 2000) {
        guard++;
        var i1 = D.randInt(r, 0, n - 2), j1 = D.randInt(r, i1 + 1, n - 1); // i1 < j1 keeps it acyclic
        var key = vertices[i1] + '>' + vertices[j1];
        if (seen[key]) continue;
        edges.push({ a: vertices[i1], b: vertices[j1] }); seen[key] = 1;
      }
      if (level === 'extreme' && r() < 0.5 && n >= 4) edges.push({ a: vertices[n - 1], b: vertices[0] }); // occasional cycle
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
      var seen = {};
      edges.forEach(function (e, idx) {
        if (e.a === e.b) return;
        var key = e.a + '>' + e.b, k = seen[key] === undefined ? 0 : seen[key] + 1; seen[key] = k;
        S.arrow('e' + idx, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: true, bend: k ? 20 * k : 0, style: 'dim' });
      });

      var idxOf = {}; V.forEach(function (v, i) { idxOf[v] = i; });
      var ROWX0 = 40, STEP = 44, CW = 36, CH = 36;
      var DEGY = cy + R + 66, QY0 = DEGY + CH + 56, OY0 = QY0 + CH + 56;
      S.label('deglbl', { x: ROWX0 - 14, y: DEGY + 24, text: T('içderece[] =', 'indeg[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('deg' + i, { x: ROWX0 + i * STEP, y: DEGY, w: CW, h: CH, text: '', style: 'empty', size: 15, above: v }); });
      S.label('qlbl', { x: ROWX0 - 14, y: QY0 + 24, text: T('kuyruk =', 'queue ='), anchor: 'end', size: 14, mono: true });
      for (var qi = 0; qi < V.length; qi++) S.box('q' + qi, { x: ROWX0 + qi * STEP, y: QY0, w: CW, h: CH, text: '', style: 'empty', size: 15 });
      S.label('olbl', { x: ROWX0 - 14, y: OY0 + 24, text: T('sıra =', 'order ='), anchor: 'end', size: 14, mono: true });

      var indeg = {}; V.forEach(function (v) { indeg[v] = 0; });
      edges.forEach(function (e) { if (e.a !== e.b) indeg[e.b]++; });
      V.forEach(function (v, i) { S.set('deg' + i, { text: String(indeg[v]), style: indeg[v] === 0 ? 'new' : 'normal' }); });
      S.step(T('KAHN ALGORİTMASI: her düğümün içderecesi (gelen kenar sayısı) sayılır; içderecesi 0 olanların önkoşulu yok, hemen sıraya girebilirler.',
               'KAHN\'S ALGORITHM: every vertex\'s in-degree (incoming edges) is counted; a vertex with in-degree 0 has no prerequisite and can be placed right away.'), L_INDEG);

      function updateQueue(q) { for (var i = 0; i < V.length; i++) { if (i < q.length) S.set('q' + i, { text: q[i], style: 'active' }); else S.set('q' + i, { text: '', style: 'empty' }); } }
      var boxCount = 0;
      function outputBox(v) { if (boxCount > 0) S.set('o' + (boxCount - 1), { style: 'normal' }); S.box('o' + boxCount, { x: ROWX0 + boxCount * STEP, y: OY0, w: CW, h: CH, text: v, style: 'hl', size: 16 }); boxCount++; }

      var queue = [];
      V.forEach(function (v) { if (indeg[v] === 0) { queue.push(v); S.set('n' + v, { style: 'active' }); } });
      updateQueue(queue);
      S.step(T('Alfabetik taranarak içderecesi 0 olan düğümler kuyruğa eklenir: ' + (queue.length ? queue.join(', ') : T('yok', 'none').tr) + '.',
               'Scanning alphabetically, the vertices with in-degree 0 are enqueued: ' + (queue.length ? queue.join(', ') : 'none') + '.'), L_SEED);

      var order = [];
      while (queue.length) {
        var u = queue.shift();
        S.set('n' + u, { style: 'hl' });
        outputBox(u); order.push(u);
        updateQueue(queue);
        S.step(T('`dequeue()` -> `' + u + '`; sıraya eklenir (şimdiye kadar: ' + order.join(', ') + ').',
                 '`dequeue()` -> `' + u + '`; placed in the order (so far: ' + order.join(', ') + ').'), L_DEQ);
        var kids = adj[u], gained = [];
        kids.forEach(function (v) {
          indeg[v]--;
          S.set('deg' + idxOf[v], { text: String(indeg[v]), style: indeg[v] === 0 ? 'new' : 'normal' });
          if (indeg[v] === 0) { queue.push(v); S.set('n' + v, { style: 'active' }); gained.push(v); }
        });
        updateQueue(queue);
        if (kids.length) {
          S.step(T('`' + u + '`\'nin kenarları gevşetilir: her komşunun içderecesi 1 azalır. Sıfıra düşenler kuyruğa girer: ' +
                   (gained.length ? gained.join(', ') : T('hiçbiri', 'none').tr) + '.',
                   '`' + u + '`\'s edges are relaxed: every neighbour\'s in-degree drops by 1. Those reaching 0 are enqueued: ' +
                   (gained.length ? gained.join(', ') : 'none') + '.'), gained.length ? L_ZERO : L_RELAX);
        }
        S.set('n' + u, { style: 'dim' });
      }
      var hasCycle = order.length !== V.length;
      if (hasCycle) {
        var left = V.filter(function (v) { return order.indexOf(v) < 0; });
        S.step(T('Kuyruk boşaldı ama ' + left.join(', ') + ' hâlâ sıraya girmedi -- bunların hepsi içderecesi hiç 0 olmayan bir DÖNGÜNÜN parçası. Topolojik sıralama YOK.',
                 'The queue is empty but ' + left.join(', ') + ' never got placed -- they form a CYCLE whose in-degree never reaches 0. No topological order exists.'), L_DONE);
      } else {
        S.step(T('Kuyruk boşaldı, ' + V.length + ' düğümün hepsi sıraya girdi: ' + order.join(', ') + '. Her düğüm bütün önkoşullarından sonra gelir.',
                 'The queue is empty, all ' + V.length + ' vertices were placed: ' + order.join(', ') + '. Every vertex comes after all of its prerequisites.'), L_DONE);
      }
      S.result = { order: order, hasCycle: hasCycle };
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
