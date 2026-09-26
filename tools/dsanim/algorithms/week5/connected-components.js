/* Week 5 -- connected components: repeated BFS. Every unvisited vertex starts a new BFS that labels everything
 * it reaches with the same component id; direction is ignored (weak connectivity). Each component is laid out
 * in its own circle, side by side, and framed with a dashed region once fully labelled. */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    'int comp_of[MAX_V];   /* -1 = not yet labelled */',
    '',
    'void bfs_label(Graph *g, int start, int id) {',
    '    int queue_data[MAX_V], front = 0, rear = 0;',
    '    comp_of[start] = id;',
    '    queue_data[rear++] = start;',
    '    while (front < rear) {',
    '        int u = queue_data[front++];',
    '        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {  /* direction ignored: treated as undirected */',
    '            if (comp_of[n->to] == -1) { comp_of[n->to] = id; queue_data[rear++] = n->to; }',
    '        }',
    '    }',
    '}',
    '',
    'int count_components(Graph *g) {',
    '    int next_id = 0;',
    '    for (int i = 0; i < g->vertex_count; i++) comp_of[i] = -1;',
    '    for (int i = 0; i < g->vertex_count; i++)',
    '        if (comp_of[i] == -1) bfs_label(g, i, next_id++);  /* unvisited vertex starts a new component */',
    '    return next_id;',
    '}'
  ];
  var JAVA_CODE = [
    'int[] compOf = new int[MAX_V];   // -1 = not yet labelled',
    '',
    'void bfsLabel(Graph g, int start, int id) {',
    '    int[] queueData = new int[MAX_V]; int front = 0, rear = 0;',
    '    compOf[start] = id;',
    '    queueData[rear++] = start;',
    '    while (front < rear) {',
    '        int u = queueData[front++];',
    '        for (AdjNode n = g.adj[u]; n != null; n = n.next) {  // direction ignored: treated as undirected',
    '            if (compOf[n.to] == -1) { compOf[n.to] = id; queueData[rear++] = n.to; }',
    '        }',
    '    }',
    '}',
    '',
    'int countComponents(Graph g) {',
    '    int nextId = 0;',
    '    for (int i = 0; i < g.vertexCount; i++) compOf[i] = -1;',
    '    for (int i = 0; i < g.vertexCount; i++)',
    '        if (compOf[i] == -1) bfsLabel(g, i, nextId++);  // unvisited vertex starts a new component',
    '    return nextId;',
    '}'
  ];
  var LINES_COUNT = { c: [17, 18, 19], java: [17, 18, 19] };
  var LINES_LABEL = { c: [5, 6, 7, 8, 9, 10, 11, 12], java: [5, 6, 7, 8, 9, 10, 11, 12] };

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
  function buildUndirAdj(edges) {
    var adj = {};
    edges.forEach(function (e) { if (!adj[e.a]) adj[e.a] = []; if (!adj[e.b]) adj[e.b] = []; if (e.a !== e.b) { adj[e.a].push(e.b); adj[e.b].push(e.a); } });
    Object.keys(adj).forEach(function (v) { adj[v].sort(); });
    return adj;
  }

  D.define({
    id: 'connected-components',
    title: T('Bağlı bileşenler (connected components)', 'Connected components'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 düğüm, yönsüz, 2 bileşen (iki ayrı 5-döngüsü), 10 kenar', '10 vertices, undirected, 2 components (two separate 5-cycles), 10 edges'),
        data: { directed: false, edges: [
          { a: 'A', b: 'B', w: null }, { a: 'B', b: 'C', w: null }, { a: 'C', b: 'D', w: null }, { a: 'D', b: 'E', w: null }, { a: 'E', b: 'A', w: null },
          { a: 'F', b: 'G', w: null }, { a: 'G', b: 'H', w: null }, { a: 'H', b: 'I', w: null }, { a: 'I', b: 'J', w: null }, { a: 'J', b: 'F', w: null }
        ] } },
      { id: 'hard', level: 'hard', name: T('10 düğüm, yönlü, 3 zayıf bileşen (her biri bir döngü), 10 kenar', '10 vertices, directed, 3 weak components (each a cycle), 10 edges'),
        data: { directed: true, edges: [
          { a: 'P', b: 'Q', w: null }, { a: 'Q', b: 'R', w: null }, { a: 'R', b: 'S', w: null }, { a: 'S', b: 'P', w: null },
          { a: 'T', b: 'U', w: null }, { a: 'U', b: 'V', w: null }, { a: 'V', b: 'T', w: null },
          { a: 'W', b: 'X', w: null }, { a: 'X', b: 'Y', w: null }, { a: 'Y', b: 'W', w: null }
        ] } },
      { id: 'many', level: 'edge', name: T('12 düğüm, yönsüz, 4 ayrı üçgen bileşen, 12 kenar', '12 vertices, undirected, 4 separate triangle components, 12 edges'),
        data: { directed: false, edges: [
          { a: 'A', b: 'B', w: null }, { a: 'B', b: 'C', w: null }, { a: 'C', b: 'A', w: null },
          { a: 'D', b: 'E', w: null }, { a: 'E', b: 'F', w: null }, { a: 'F', b: 'D', w: null },
          { a: 'G', b: 'H', w: null }, { a: 'H', b: 'I', w: null }, { a: 'I', b: 'G', w: null },
          { a: 'J', b: 'K', w: null }, { a: 'K', b: 'L', w: null }, { a: 'L', b: 'J', w: null }
        ] } },
      { id: 'single', level: 'edge', name: T('Tek düğüm (bir öz-döngüyle gösterilir): tek bileşen', 'A single vertex (shown with a self-loop): one component'),
        data: { directed: false, edges: [{ a: 'A', b: 'A', w: null }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of edges. */
    size: function (d) { return d.edges.length; },
    /** Independent computation: UNION-FIND over the edge list, then component ids are renumbered 0, 1, 2...
     *  in order of each group's alphabetically-smallest vertex (matching the order build()'s repeated BFS
     *  would visit unvisited roots in) -- a completely different technique from build()'s BFS colouring. */
    reference: function (d) {
      var vset = {}; d.edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
      var V = Object.keys(vset).sort();
      var parent = {}; V.forEach(function (v) { parent[v] = v; });
      function find(x) { while (parent[x] !== x) x = parent[x]; return x; }
      d.edges.forEach(function (e) { var ra = find(e.a), rb = find(e.b); if (ra !== rb) parent[ra] = rb; });
      var groupsByRoot = {};
      V.forEach(function (v) { var r = find(v); (groupsByRoot[r] = groupsByRoot[r] || []).push(v); });
      var order = Object.keys(groupsByRoot).map(function (r) { return { r: r, min: groupsByRoot[r].slice().sort()[0] }; });
      order.sort(function (a, b) { return a.min < b.min ? -1 : a.min > b.min ? 1 : 0; });
      var idOf = {}; order.forEach(function (o, i) { idOf[o.r] = i; });
      var lbl = {}; V.forEach(function (v) { lbl[v] = idOf[find(v)]; });
      return { components: order.length, label: lbl };
    },
    random: function (level, r) {
      var n = { easy: 8, normal: 10, hard: 12, extreme: 14 }[level] || 10;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var directed = r() < 0.4;
      var m = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level] || 12;
      var roll = r(), numGroups;
      if (level === 'easy' || level === 'normal') numGroups = roll < 0.4 ? 1 : 2;
      else numGroups = roll < 0.3 ? 1 : (roll < 0.65 ? 2 : 3);
      var base = Math.floor(n / numGroups), rem = n % numGroups, sizes = [];
      for (var gi = 0; gi < numGroups; gi++) sizes.push(base + (gi < rem ? 1 : 0));
      var groups = [], idx = 0;
      sizes.forEach(function (sz) { groups.push(vertices.slice(idx, idx + sz)); idx += sz; });
      var edges = [], seen = {};
      groups.forEach(function (g) { for (var i2 = 1; i2 < g.length; i2++) { var j = D.randInt(r, 0, i2 - 1); edges.push({ a: g[j], b: g[i2], w: null }); seen[g[j] + '|' + g[i2]] = 1; if (!directed) seen[g[i2] + '|' + g[j]] = 1; } });
      var guard = 0;
      while (edges.length < m && guard < 3000) {
        guard++;
        var g2 = groups[D.randInt(r, 0, groups.length - 1)];
        if (g2.length < 2) continue;
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
      var uadj = buildUndirAdj(edges); V.forEach(function (v) { if (!uadj[v]) uadj[v] = []; });

      var compOf = {}, groups = [];
      V.forEach(function (v) {
        if (compOf[v] !== undefined) return;
        var cid = groups.length, group = [v], q = [v], qi = 0; compOf[v] = cid;
        while (qi < q.length) { var u = q[qi++]; uadj[u].forEach(function (w) { if (compOf[w] === undefined) { compOf[w] = cid; group.push(w); q.push(w); } }); }
        groups.push(group);
      });

      var PALETTE = ['hl', 'active', 'new', 'del'], pos = {}, geom = [], gx = 60;
      groups.forEach(function (g) {
        var n = g.length, R = n === 1 ? 30 : Math.max(60, 15 * n), cx = gx + R, cy = R + 56;
        if (n === 1) pos[g[0]] = { x: cx, y: cy };
        else g.forEach(function (v, i) { var ang = -Math.PI / 2 + i * 2 * Math.PI / n; pos[v] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }; });
        geom.push({ cx: cx, cy: cy, R: R });
        gx += 2 * R + 74;
      });
      V.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: 'empty' }); });
      var seen = {};
      edges.forEach(function (e, idx) {
        if (e.a === e.b) return;
        var key = [e.a, e.b].sort().join('|');
        var k = seen[key] === undefined ? 0 : seen[key] + 1; seen[key] = k;
        var bend = k === 0 ? 0 : (k % 2 === 1 ? 18 * Math.ceil(k / 2) : -18 * Math.ceil(k / 2));
        S.arrow('e' + idx, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: false, bend: bend, style: 'dim' });
      });

      S.step(T('BAĞLI BİLEŞEN (connected component): tekrarlanan BFS ile bulunur. Ziyaret edilmemiş her düğüm YENİ bir bileşen başlatır; o bileşendeki her şeye BFS ile ulaşılır.' + (directed ? ' Yön göz ardı edilir (zayıf bağlılık).' : ''),
               'A CONNECTED COMPONENT is found with repeated BFS. Every unvisited vertex starts a NEW component; BFS reaches everything in it.' + (directed ? ' Direction is ignored (weak connectivity).' : '')), LINES_COUNT);

      groups.forEach(function (g, gi) {
        var root = g[0], col = PALETTE[gi % PALETTE.length];
        var visited = {}, queue = [root]; visited[root] = true;
        S.set('n' + root, { style: col });
        S.step(T('Ziyaret edilmemiş `' + root + '`\'den yeni bir BFS: bileşen ' + (gi + 1) + ' başlıyor.', 'A new BFS from unvisited `' + root + '`: component ' + (gi + 1) + ' begins.'), LINES_LABEL);
        while (queue.length) {
          var u = queue.shift(), kids = [];
          uadj[u].forEach(function (v) { if (!visited[v]) { visited[v] = true; queue.push(v); kids.push(v); S.set('n' + v, { style: col }); } });
          if (kids.length) S.step(T('`' + u + '`\'nin komşuları da bileşen ' + (gi + 1) + '\'e eklenir: ' + kids.join(', ') + '.', '`' + u + '`\'s neighbours join component ' + (gi + 1) + ' too: ' + kids.join(', ') + '.'), LINES_LABEL);
        }
        var geo = geom[gi];
        S.region('grp' + gi, { x: geo.cx - geo.R - 22, y: geo.cy - geo.R - 30, w: 2 * geo.R + 44, h: 2 * geo.R + 50, title: T('bileşen ' + (gi + 1), 'component ' + (gi + 1)) });
        S.step(T('Bileşen ' + (gi + 1) + ' tamamlandı: {' + g.slice().sort().join(', ') + '} (' + g.length + ' düğüm).', 'Component ' + (gi + 1) + ' complete: {' + g.slice().sort().join(', ') + '} (' + g.length + ' vertices).'));
      });

      var labelSorted = {}; V.forEach(function (v) { labelSorted[v] = compOf[v]; });
      S.result = { components: groups.length, label: labelSorted };
      S.step(T('Bitti: ' + groups.length + ' bağlı bileşen.', 'Done: ' + groups.length + ' connected component(s).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
