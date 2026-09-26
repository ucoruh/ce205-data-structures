/* Week 5 -- breadth-first search (BFS) on a graph given as an edge list, from a chosen start vertex. Neighbours
 * are examined in ALPHABETICAL order, so the visit order is reproducible. Input: "start=A A-B B-C:4 ..." */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_V 32',
    '',
    'int visited[MAX_V], level_of[MAX_V], parent_of[MAX_V];',
    'int queue_data[MAX_V], front, rear, count;',
    '',
    'void enqueue(int v) { queue_data[rear] = v; rear = (rear + 1) % MAX_V; count++; }',
    'int  dequeue(void)  { int v = queue_data[front]; front = (front + 1) % MAX_V; count--; return v; }',
    '',
    'void bfs(Graph *g, int start) {',
    '    for (int i = 0; i < g->vertex_count; i++) visited[i] = 0;',
    '    visited[start] = 1;',
    '    level_of[start] = 0;',
    '    enqueue(start);',
    '    while (count > 0) {',
    '        int u = dequeue();',
    '        printf("visit %d\\n", u);',
    '        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {  /* neighbours: alphabetical order */',
    '            if (!visited[n->to]) {',
    '                visited[n->to] = 1;',
    '                level_of[n->to] = level_of[u] + 1;',
    '                parent_of[n->to] = u;',
    '                enqueue(n->to);',
    '            }',
    '        }',
    '    }',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    '',
    'boolean[] visited = new boolean[MAX_V];',
    'int[] levelOf = new int[MAX_V], parentOf = new int[MAX_V];',
    'int[] queueData = new int[MAX_V]; int front, rear, count;',
    '',
    'void enqueue(int v) { queueData[rear] = v; rear = (rear + 1) % MAX_V; count++; }',
    'int  dequeue()      { int v = queueData[front]; front = (front + 1) % MAX_V; count--; return v; }',
    '',
    'void bfs(Graph g, int start) {',
    '    for (int i = 0; i < g.vertexCount; i++) visited[i] = false;',
    '    visited[start] = true;',
    '    levelOf[start] = 0;',
    '    enqueue(start);',
    '    while (count > 0) {',
    '        int u = dequeue();',
    '        System.out.println("visit " + u);',
    '        for (AdjNode n = g.adj[u]; n != null; n = n.next) {  // neighbours: alphabetical order',
    '            if (!visited[n.to]) {',
    '                visited[n.to] = true;',
    '                levelOf[n.to] = levelOf[u] + 1;',
    '                parentOf[n.to] = u;',
    '                enqueue(n.to);',
    '            }',
    '        }',
    '    }',
    '}'
  ];
  var LINES_START = { c: [10, 11, 12], java: [11, 12, 13] };
  var LINES_STEP = { c: [15, 16, 17, 18, 19, 20, 21, 22, 23], java: [16, 17, 18, 19, 20, 21, 22, 23, 24] };

  var EDGE_RE = /^([A-Za-z0-9]{1,3})(-|>)([A-Za-z0-9]{1,3})(?::(\d+))?$/;
  function parseGraphStart(text) {
    var s = String(text).trim();
    var toks = s.split(/\s+/).filter(Boolean);
    if (!toks.length) throw T('Metin boş: "start=X kenar..." yazın.', 'The text is empty: write "start=X edge...".');
    var m0 = /^start=([A-Za-z0-9]{1,3})$/i.exec(toks[0]);
    if (!m0) throw T('İlk sözcük "start=X" biçiminde olmalı (X = başlangıç düğümü).', 'The first word must look like "start=X" (X = the starting vertex).');
    var start = m0[1]; toks = toks.slice(1);
    if (!toks.length) throw T('En az bir kenar yazın.', 'Write at least one edge.');
    var edges = [], directed = null;
    for (var i = 0; i < toks.length; i++) {
      var tok = toks[i], m = EDGE_RE.exec(tok);
      if (!m) throw T('"' + tok + '" anlaşılmadı: bir kenar VERTEX-VERTEX (yönsüz) ya da VERTEX>VERTEX (yönlü) biçiminde olmalı, opsiyonel ":AĞIRLIK" ile.',
                       '"' + tok + '" is not understood: an edge must look like VERTEX-VERTEX (undirected) or VERTEX>VERTEX (directed), with an optional ":WEIGHT".');
      var kind = m[2] === '>';
      if (directed === null) directed = kind;
      else if (directed !== kind) throw T('Bütün kenarlar aynı türde olmalı: ya hepsi yönsüz (-), ya hepsi yönlü (>).',
                                           'All edges must be the same kind: either all undirected (-) or all directed (>).');
      edges.push({ a: m[1], b: m[3], w: m[4] !== undefined ? parseInt(m[4], 10) : null });
    }
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    if (!(start in vset)) throw T('"' + start + '" başlangıç düğümü kenarlarda geçmiyor.', 'Starting vertex "' + start + '" does not appear in the edges.');
    return { directed: !!directed, start: start, edges: edges };
  }
  function formatGraphStart(d) { return 'start=' + d.start + ' ' + d.edges.map(function (e) { return e.a + (d.directed ? '>' : '-') + e.b + (e.w !== null ? ':' + e.w : ''); }).join(' '); }
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
    id: 'bfs',
    title: T('Genişlik öncelikli arama (BFS)', 'Breadth-first search (BFS)'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('7 düğüm, yönsüz, `A`\'dan başlar, 10 kenar', '7 vertices, undirected, starts at `A`, 10 edges'),
        data: { directed: false, start: 'A', edges: [
          { a: 'A', b: 'B', w: null }, { a: 'B', b: 'C', w: null }, { a: 'C', b: 'D', w: null }, { a: 'D', b: 'E', w: null },
          { a: 'E', b: 'F', w: null }, { a: 'F', b: 'G', w: null }, { a: 'G', b: 'A', w: null },
          { a: 'A', b: 'D', w: null }, { a: 'B', b: 'E', w: null }, { a: 'C', b: 'F', w: null }
        ] } },
      { id: 'hard', level: 'hard', name: T('8 düğüm, yönlü, `P`\'den başlar, döngülü, 12 kenar', '8 vertices, directed, starts at `P`, with a cycle, 12 edges'),
        data: { directed: true, start: 'P', edges: [
          { a: 'P', b: 'Q', w: null }, { a: 'P', b: 'R', w: null }, { a: 'Q', b: 'S', w: null }, { a: 'R', b: 'S', w: null },
          { a: 'S', b: 'T', w: null }, { a: 'T', b: 'U', w: null }, { a: 'T', b: 'V', w: null }, { a: 'U', b: 'W', w: null },
          { a: 'V', b: 'W', w: null }, { a: 'Q', b: 'T', w: null }, { a: 'R', b: 'U', w: null }, { a: 'W', b: 'P', w: null }
        ] } },
      { id: 'disconnected', level: 'edge', name: T('9 düğüm, 2 bileşen: `G,H,I` `A`\'dan hiç ulaşılamaz', '9 vertices, 2 components: `G,H,I` are unreachable from `A`'),
        data: { directed: false, start: 'A', edges: [
          { a: 'A', b: 'B', w: null }, { a: 'B', b: 'C', w: null }, { a: 'C', b: 'D', w: null }, { a: 'D', b: 'E', w: null },
          { a: 'E', b: 'F', w: null }, { a: 'F', b: 'A', w: null }, { a: 'A', b: 'D', w: null },
          { a: 'G', b: 'H', w: null }, { a: 'H', b: 'I', w: null }, { a: 'I', b: 'G', w: null }
        ] } },
      { id: 'single', level: 'edge', name: T('Tek düğüm (bir öz-döngüyle gösterilir)', 'A single vertex (shown with a self-loop)'),
        data: { directed: false, start: 'A', edges: [{ a: 'A', b: 'A', w: null }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of edges. */
    size: function (d) { return d.edges.length; },
    /** Independent computation: a plain, from-scratch BFS (own queue array, own visited/level maps) -- written
     *  separately from build()'s scene-driving BFS, sharing no helper function with it. */
    reference: function (d) {
      var edges = d.edges, directed = d.directed, start = d.start;
      var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
      var V = Object.keys(vset).sort();
      var adj = {}; V.forEach(function (v) { adj[v] = []; });
      edges.forEach(function (e) { if (e.a !== e.b) { adj[e.a].push(e.b); if (!directed) adj[e.b].push(e.a); } });
      V.forEach(function (v) { adj[v].sort(); });
      var visited = {}, level = {}, order = [], q = [start], qi = 0;
      visited[start] = true; level[start] = 0;
      while (qi < q.length) {
        var u = q[qi++]; order.push(u);
        adj[u].forEach(function (v) { if (!visited[v]) { visited[v] = true; level[v] = level[u] + 1; q.push(v); } });
      }
      return { order: order, level: level };
    },
    random: function (level, r) {
      var n = { easy: 8, normal: 10, hard: 12, extreme: 14 }[level] || 10;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var directed = r() < 0.5;
      var m = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level] || 12;
      var groups;
      if (n >= 6 && r() < 0.35) { var split = D.randInt(r, 3, n - 3); groups = [vertices.slice(0, split), vertices.slice(split)]; }
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
      var start = vertices[D.randInt(r, 0, vertices.length - 1)];
      return { directed: directed, start: start, edges: edges };
    },
    input: {
      hint: T('Örnek: start=A A-B B-C:4 A>D   (ilk sözcük "start=X"; yönsüz "-" ya da yönlü ">"; etiket 1-3 karakter)',
              'Example: start=A A-B B-C:4 A>D   (first word "start=X"; undirected "-" or directed ">"; label 1-3 characters)'),
      parse: parseGraphStart,
      format: formatGraphStart,
      bad: ['', 'A-B', 'start=Z A-B', 'start=A A~B', 'start=A A-B:x', 'start=A A>B B-C']
    },
    build: function (S, d) {
      var edges = d.edges, directed = d.directed, start = d.start, V = verticesOf(edges);
      var adj = buildAdj(edges, directed);
      V.forEach(function (v) { if (!adj[v]) adj[v] = []; });
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

      /* Rows below the graph (not beside it), so the scene stays roughly as wide as the graph and every label
       * renders at a readable size. Each row is named on its left; the level[] row keeps a fixed column per
       * vertex (alphabetical, name above the cell) like an array. */
      var idxOf = {}; V.forEach(function (v, i) { idxOf[v] = i; });
      var ROWX0 = 40, STEP = 44, CW = 36, CH = 36;
      var LVLY = cy + R + 66;
      var QY0 = LVLY + CH + 56;
      var OY0 = QY0 + CH + 56;
      S.label('lvllbl', { x: ROWX0 - 14, y: LVLY + 24, text: T('seviye[] =', 'level[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('lvl' + i, { x: ROWX0 + i * STEP, y: LVLY, w: CW, h: CH, text: '', style: 'empty', size: 15, above: v }); });
      S.label('qlbl', { x: ROWX0 - 14, y: QY0 + 24, text: T('kuyruk =', 'queue ='), anchor: 'end', size: 14, mono: true });
      for (var qi = 0; qi < V.length; qi++) S.box('q' + qi, { x: ROWX0 + qi * STEP, y: QY0, w: CW, h: CH, text: '', style: 'empty', size: 15 });
      S.label('olbl', { x: ROWX0 - 14, y: OY0 + 24, text: T('ziyaret sırası =', 'visit order ='), anchor: 'end', size: 14, mono: true });

      function updateQueue(q) { for (var i = 0; i < V.length; i++) { if (i < q.length) S.set('q' + i, { text: q[i], style: 'active' }); else S.set('q' + i, { text: '', style: 'empty' }); } }
      function setLevel(v, val) { S.set('lvl' + idxOf[v], { text: String(val), style: 'new' }); }
      var boxCount = 0;
      function outputBox(v) { if (boxCount > 0) S.set('o' + (boxCount - 1), { style: 'normal' }); S.box('o' + boxCount, { x: ROWX0 + boxCount * STEP, y: OY0, w: CW, h: CH, text: v, style: 'hl', size: 16 }); boxCount++; }

      var visited = {}, level = {}, order = [], queue = [start];
      visited[start] = true; level[start] = 0;
      S.set('n' + start, { style: 'active' }); setLevel(start, 0); updateQueue(queue);
      S.step(T('GENİŞLİK ÖNCELİKLİ ARAMA (BFS): bir KUYRUK (queue, FIFO) kullanır ve komşuları ALFABETİK sırayla ele alır. `' + start + '`\'dan başlıyoruz: kuyruğa eklenir, ziyaret edilmiş sayılır, uzaklığı (seviyesi) 0.',
               'BREADTH-FIRST SEARCH (BFS): uses a QUEUE (FIFO) and examines neighbours in ALPHABETICAL order. We start from `' + start + '`: it is enqueued, marked visited, at distance (level) 0.'), LINES_START);

      while (queue.length) {
        var u = queue.shift();
        S.set('n' + u, { style: 'hl' });
        outputBox(u); order.push(u);
        var kids = [];
        (adj[u] || []).forEach(function (v) {
          if (!visited[v]) {
            visited[v] = true; level[v] = level[u] + 1; queue.push(v); kids.push(v);
            S.set('n' + v, { style: 'active' }); setLevel(v, level[v]);
            for (var ei = 0; ei < edges.length; ei++) { var e = edges[ei]; if ((e.a === u && e.b === v) || (!directed && e.a === v && e.b === u)) { S.set('e' + ei, { style: 'new' }); break; } }
          }
        });
        updateQueue(queue);
        var soFar = order.join(', ');
        S.step(T('`dequeue()` → `' + u + '`; ziyaret edilir (sıra: ' + soFar + '). Komşuları (alfabetik) taranır; ziyaret edilmemiş olanlar kuyruğa eklenir: ' + (kids.length ? kids.join(', ') : T('yok', 'none').tr) + '.',
                 '`dequeue()` → `' + u + '`; it is visited (order so far: ' + soFar + '). Its neighbours (alphabetical) are scanned; the unvisited ones are enqueued: ' + (kids.length ? kids.join(', ') : 'none') + '.'), LINES_STEP);
        S.set('n' + u, { style: 'dim' });
      }

      var unreached = V.filter(function (v) { return !visited[v]; });
      if (unreached.length) {
        S.step(T('Kuyruk boş. `' + unreached.join(', ') + '` düğüm(ler)ine `' + start + '`\'dan hiçbir kenar ile ulaşılamıyor -- gri kalırlar. Tam sıra: ' + order.join(', ') + '.',
                 'The queue is empty. `' + unreached.join(', ') + '` cannot be reached from `' + start + '` by any edge -- they stay grey. Full order: ' + order.join(', ') + '.'));
      } else {
        S.step(T('Kuyruk boş, bitti. Tam sıra: ' + order.join(', ') + ' -- her düğüme köke en az kenarla giden yoldan ulaşıldı.',
                 'The queue is empty, done. Full order: ' + order.join(', ') + ' -- every vertex was reached by a path with the fewest possible edges.'));
      }
      S.result = { order: order, level: level };
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
