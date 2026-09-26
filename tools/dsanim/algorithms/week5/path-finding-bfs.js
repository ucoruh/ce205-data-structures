/* Week 5 -- shortest path by EDGE COUNT from s to t, using BFS parent pointers walked back to print the path.
 * Input: "s=A t=F A-B B-C ..." Neighbours are examined in alphabetical order (as in bfs.js). */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    'int visited[MAX_V], parent_of[MAX_V];',
    '',
    '/* returns the path length in edges, or -1 if t is unreachable; fills path_out[0..len] with s..t */',
    'int bfs_shortest_path(Graph *g, int s, int t, int *path_out) {',
    '    int queue_data[MAX_V], front = 0, rear = 0;',
    '    for (int i = 0; i < g->vertex_count; i++) visited[i] = 0;',
    '    visited[s] = 1;',
    '    queue_data[rear++] = s;',
    '    while (front < rear) {',
    '        int u = queue_data[front++];',
    '        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {   /* alphabetical order */',
    '            if (!visited[n->to]) { visited[n->to] = 1; parent_of[n->to] = u; queue_data[rear++] = n->to; }',
    '        }',
    '    }',
    '    if (!visited[t]) return -1;                    /* no path */',
    '    int len = 0, v = t;',
    '    while (v != s) { path_out[len++] = v; v = parent_of[v]; }',
    '    path_out[len++] = s;',
    '    for (int i = 0; i < len / 2; i++) {             /* path_out was built backwards, from t to s */',
    '        int tmp = path_out[i]; path_out[i] = path_out[len - 1 - i]; path_out[len - 1 - i] = tmp;',
    '    }',
    '    return len - 1;                                 /* path length, in edges */',
    '}'
  ];
  var JAVA_CODE = [
    'int[] visited = new int[MAX_V], parentOf = new int[MAX_V];',
    '',
    '// returns the path length in edges, or -1 if t is unreachable; fills pathOut[0..len] with s..t',
    'int bfsShortestPath(Graph g, int s, int t, int[] pathOut) {',
    '    int[] queueData = new int[MAX_V]; int front = 0, rear = 0;',
    '    for (int i = 0; i < g.vertexCount; i++) visited[i] = 0;',
    '    visited[s] = 1;',
    '    queueData[rear++] = s;',
    '    while (front < rear) {',
    '        int u = queueData[front++];',
    '        for (AdjNode n = g.adj[u]; n != null; n = n.next) {   // alphabetical order',
    '            if (visited[n.to] == 0) { visited[n.to] = 1; parentOf[n.to] = u; queueData[rear++] = n.to; }',
    '        }',
    '    }',
    '    if (visited[t] == 0) return -1;                 // no path',
    '    int len = 0, v = t;',
    '    while (v != s) { pathOut[len++] = v; v = parentOf[v]; }',
    '    pathOut[len++] = s;',
    '    for (int i = 0; i < len / 2; i++) {              // pathOut was built backwards, from t to s',
    '        int tmp = pathOut[i]; pathOut[i] = pathOut[len - 1 - i]; pathOut[len - 1 - i] = tmp;',
    '    }',
    '    return len - 1;                                  // path length, in edges',
    '}'
  ];
  var LINES_BFS = { c: [6, 7, 8, 9, 10, 11, 12], java: [6, 7, 8, 9, 10, 11, 12] };
  var LINES_NOPATH = { c: [15], java: [15] };
  var LINES_WALK = { c: [16, 17, 18], java: [16, 17, 18] };

  var EDGE_RE = /^([A-Za-z0-9]{1,3})(-|>)([A-Za-z0-9]{1,3})(?::(\d+))?$/;
  function parseGraphST(text) {
    var s0 = String(text).trim();
    var toks = s0.split(/\s+/).filter(Boolean);
    if (toks.length < 2) throw T('Metin en az "s=X t=Y" ile başlamalı.', 'The text must start with at least "s=X t=Y".');
    var m1 = /^s=([A-Za-z0-9]{1,3})$/i.exec(toks[0]), m2 = /^t=([A-Za-z0-9]{1,3})$/i.exec(toks[1]);
    if (!m1) throw T('İlk sözcük "s=X" biçiminde olmalı (X = kaynak düğüm).', 'The first word must look like "s=X" (X = the source vertex).');
    if (!m2) throw T('İkinci sözcük "t=Y" biçiminde olmalı (Y = hedef düğüm).', 'The second word must look like "t=Y" (Y = the target vertex).');
    var s = m1[1], t = m2[1], rest = toks.slice(2);
    if (!rest.length) throw T('En az bir kenar yazın.', 'Write at least one edge.');
    var edges = [], directed = null;
    for (var i = 0; i < rest.length; i++) {
      var tok = rest[i], m = EDGE_RE.exec(tok);
      if (!m) throw T('"' + tok + '" anlaşılmadı: bir kenar VERTEX-VERTEX (yönsüz) ya da VERTEX>VERTEX (yönlü) biçiminde olmalı, opsiyonel ":AĞIRLIK" ile.',
                       '"' + tok + '" is not understood: an edge must look like VERTEX-VERTEX (undirected) or VERTEX>VERTEX (directed), with an optional ":WEIGHT".');
      var kind = m[2] === '>';
      if (directed === null) directed = kind;
      else if (directed !== kind) throw T('Bütün kenarlar aynı türde olmalı: ya hepsi yönsüz (-), ya hepsi yönlü (>).',
                                           'All edges must be the same kind: either all undirected (-) or all directed (>).');
      edges.push({ a: m[1], b: m[3], w: m[4] !== undefined ? parseInt(m[4], 10) : null });
    }
    var vertices = verticesOf(edges);
    if (vertices.indexOf(s) < 0) throw T('"' + s + '" (s) kenarlarda geçmiyor.', 'Source "' + s + '" does not appear in the edges.');
    if (vertices.indexOf(t) < 0) throw T('"' + t + '" (t) kenarlarda geçmiyor.', 'Target "' + t + '" does not appear in the edges.');
    return { directed: !!directed, s: s, t: t, edges: edges };
  }
  function formatGraphST(d) { return 's=' + d.s + ' t=' + d.t + ' ' + d.edges.map(function (e) { return e.a + (d.directed ? '>' : '-') + e.b + (e.w !== null ? ':' + e.w : ''); }).join(' '); }
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
    id: 'path-finding-bfs',
    title: T('BFS ile en kısa yol bulma', 'Shortest-path finding with BFS'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('7 düğüm, yönsüz, `A`\'dan `F`\'ye, 10 kenar', '7 vertices, undirected, `A` to `F`, 10 edges'),
        data: { directed: false, s: 'A', t: 'F', edges: [
          { a: 'A', b: 'B', w: null }, { a: 'B', b: 'C', w: null }, { a: 'C', b: 'D', w: null }, { a: 'D', b: 'E', w: null },
          { a: 'E', b: 'F', w: null }, { a: 'F', b: 'G', w: null }, { a: 'G', b: 'A', w: null },
          { a: 'A', b: 'D', w: null }, { a: 'B', b: 'E', w: null }, { a: 'C', b: 'F', w: null }
        ] } },
      { id: 'hard', level: 'hard', name: T('8 düğüm, yönlü, `P`\'den `W`\'ye, 12 kenar', '8 vertices, directed, `P` to `W`, 12 edges'),
        data: { directed: true, s: 'P', t: 'W', edges: [
          { a: 'P', b: 'Q', w: null }, { a: 'P', b: 'R', w: null }, { a: 'Q', b: 'S', w: null }, { a: 'R', b: 'S', w: null },
          { a: 'S', b: 'T', w: null }, { a: 'T', b: 'U', w: null }, { a: 'T', b: 'V', w: null }, { a: 'U', b: 'W', w: null },
          { a: 'V', b: 'W', w: null }, { a: 'Q', b: 'T', w: null }, { a: 'R', b: 'U', w: null }, { a: 'W', b: 'P', w: null }
        ] } },
      { id: 'no-path', level: 'edge', name: T('9 düğüm, `A`\'dan `H`\'ye YOL YOK (2 ayrı bileşen)', '9 vertices, NO PATH from `A` to `H` (2 separate components)'),
        data: { directed: false, s: 'A', t: 'H', edges: [
          { a: 'A', b: 'B', w: null }, { a: 'B', b: 'C', w: null }, { a: 'C', b: 'D', w: null }, { a: 'D', b: 'E', w: null },
          { a: 'E', b: 'F', w: null }, { a: 'F', b: 'A', w: null }, { a: 'A', b: 'D', w: null },
          { a: 'G', b: 'H', w: null }, { a: 'H', b: 'I', w: null }, { a: 'I', b: 'G', w: null }
        ] } },
      { id: 'single', level: 'edge', name: T('Tek düğüm (bir öz-döngüyle gösterilir): `s = t`, uzunluk 0', 'A single vertex (shown with a self-loop): `s = t`, length 0'),
        data: { directed: false, s: 'A', t: 'A', edges: [{ a: 'A', b: 'A', w: null }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of edges. */
    size: function (d) { return d.edges.length; },
    /** Independent computation: all-pairs distance by FLOYD-WARSHALL over an adjacency matrix (dynamic
     *  programming) -- a completely different technique from build()'s single-source BFS. Only the path
     *  LENGTH is checked (not the exact path), since several shortest paths of equal length may exist. */
    reference: function (d) {
      var edges = d.edges, directed = d.directed;
      var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
      var V = Object.keys(vset).sort();
      var idx = {}; V.forEach(function (v, i) { idx[v] = i; });
      var n = V.length, INF = Infinity;
      var dist = []; for (var i = 0; i < n; i++) { dist.push([]); for (var j = 0; j < n; j++) dist[i].push(i === j ? 0 : INF); }
      edges.forEach(function (e) { if (e.a !== e.b) { var i2 = idx[e.a], j2 = idx[e.b]; dist[i2][j2] = 1; if (!directed) dist[j2][i2] = 1; } });
      for (var k = 0; k < n; k++) for (var i3 = 0; i3 < n; i3++) for (var j3 = 0; j3 < n; j3++) if (dist[i3][k] + dist[k][j3] < dist[i3][j3]) dist[i3][j3] = dist[i3][k] + dist[k][j3];
      var dSt = dist[idx[d.s]][idx[d.t]];
      return { length: dSt === Infinity ? -1 : dSt, reachable: dSt !== Infinity };
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
      var s = vertices[D.randInt(r, 0, vertices.length - 1)], t = vertices[D.randInt(r, 0, vertices.length - 1)];
      return { directed: directed, s: s, t: t, edges: edges };
    },
    input: {
      hint: T('Örnek: s=A t=F A-B B-C:4 A>D   (ilk iki sözcük "s=X" "t=Y"; yönsüz "-" ya da yönlü ">"; etiket 1-3 karakter)',
              'Example: s=A t=F A-B B-C:4 A>D   (first two words "s=X" "t=Y"; undirected "-" or directed ">"; label 1-3 characters)'),
      parse: parseGraphST,
      format: formatGraphST,
      bad: ['', 's=A', 's=A t=B', 's=A t=Z A-B', 's=A t=A A~B', 's=A t=B A-B:x']
    },
    build: function (S, d) {
      var edges = d.edges, directed = d.directed, s = d.s, t = d.t, V = verticesOf(edges);
      var adj = buildAdj(edges, directed); V.forEach(function (v) { if (!adj[v]) adj[v] = []; });
      var lay = layoutCircle(V), pos = lay.pos, cx = lay.cx, cy = lay.cy, R = lay.R;
      V.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: v === s ? 'active' : (v === t ? 'new' : 'empty') }); });
      var seen = {};
      edges.forEach(function (e, idx) {
        if (e.a === e.b) return;
        var key = directed ? (e.a + '>' + e.b) : [e.a, e.b].sort().join('|');
        var k = seen[key] === undefined ? 0 : seen[key] + 1; seen[key] = k;
        var bend = k === 0 ? 0 : (k % 2 === 1 ? 20 * Math.ceil(k / 2) : -20 * Math.ceil(k / 2));
        S.arrow('e' + idx, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: directed, bend: bend, style: 'dim' });
      });

      /* Rows below the graph (not beside it), named on the left; parent[] keeps one fixed column per vertex
       * (alphabetical, name above the cell), like an array -- this is the value the final walk-back reads. */
      var idxOf = {}; V.forEach(function (v, i) { idxOf[v] = i; });
      var ROWX0 = 40, STEP = 44, CW = 36, CH = 36;
      var PARY = cy + R + 66;
      var QY0 = PARY + CH + 56;
      S.label('parlbl', { x: ROWX0 - 14, y: PARY + 24, text: T('ebeveyn[] =', 'parent[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('par' + i, { x: ROWX0 + i * STEP, y: PARY, w: CW, h: CH, text: '', style: v === s ? 'active' : 'empty', size: 15, above: v }); });
      S.label('qlbl', { x: ROWX0 - 14, y: QY0 + 24, text: T('kuyruk =', 'queue ='), anchor: 'end', size: 14, mono: true });
      for (var qi = 0; qi < V.length; qi++) S.box('q' + qi, { x: ROWX0 + qi * STEP, y: QY0, w: CW, h: CH, text: '', style: 'empty', size: 15 });
      function updateQueue(q) { for (var i = 0; i < V.length; i++) { if (i < q.length) S.set('q' + i, { text: q[i], style: 'active' }); else S.set('q' + i, { text: '', style: 'empty' }); } }
      function setParent(v, p) { S.set('par' + idxOf[v], { text: p, style: 'new' }); }

      S.step(T('EN KISA YOL (kenar sayısınca), BFS ile: `s = ' + s + '` (mavi) düğümünden başlayıp `t = ' + t + '` (yeşil) düğümüne giden, en az kenarlı yolu arıyoruz. BFS her düğümün EBEVEYNİNİ (parent) kaydeder; iş bitince ebeveyn zincirini `t`\'den `s`\'ye geriye izleriz.',
               'SHORTEST PATH (by edge count), with BFS: starting from `s = ' + s + '` (blue), we look for the path with the fewest edges to `t = ' + t + '` (green). BFS records each vertex\'s PARENT; once done, we walk the parent chain backwards from `t` to `s`.'), LINES_BFS);

      var visited = {}, parent = {}, queue = [s];
      visited[s] = true; updateQueue(queue);
      var level = {}; level[s] = 0;

      while (queue.length) {
        var u = queue.shift();
        S.set('n' + u, { style: u === s ? 'active' : 'hl' });
        var kids = [];
        (adj[u] || []).forEach(function (v) {
          if (!visited[v]) {
            visited[v] = true; parent[v] = u; level[v] = level[u] + 1; queue.push(v); kids.push(v);
            S.set('n' + v, { style: v === t ? 'new' : 'active' }); setParent(v, u);
            for (var ei = 0; ei < edges.length; ei++) { var e = edges[ei]; if ((e.a === u && e.b === v) || (!directed && e.a === v && e.b === u)) { S.set('e' + ei, { style: 'active' }); break; } }
          }
        });
        updateQueue(queue);
        var foundT = kids.indexOf(t) >= 0;
        S.step(T('`dequeue()` → `' + u + '`. Ziyaret edilmemiş komşuları (alfabetik) kuyruğa eklenir, ebeveynleri `' + u + '` olarak kaydedilir: ' + (kids.length ? kids.join(', ') : T('yok', 'none').tr) + '.' + (foundT ? ' `t = ' + t + '` bulundu!' : ''),
                 '`dequeue()` → `' + u + '`. Its unvisited neighbours (alphabetical) are enqueued, with `' + u + '` recorded as their parent: ' + (kids.length ? kids.join(', ') : 'none') + '.' + (foundT ? ' `t = ' + t + '` found!' : '')));
        if (u !== s) S.set('n' + u, { style: 'dim' });
      }

      if (visited[t]) {
        var path = [t], cur = t; while (cur !== s) { cur = parent[cur]; path.push(cur); } path.reverse();
        path.forEach(function (v) { S.set('n' + v, { style: 'hl' }); });
        for (var pi = 0; pi < path.length - 1; pi++) {
          var a2 = path[pi], b2 = path[pi + 1];
          for (var ei2 = 0; ei2 < edges.length; ei2++) { var e2 = edges[ei2]; if ((e2.a === a2 && e2.b === b2) || (!directed && e2.a === b2 && e2.b === a2)) { S.set('e' + ei2, { style: 'new' }); break; } }
        }
        S.set('n' + s, { style: 'active' }); S.set('n' + t, { style: 'new' });
        S.step(T('Ebeveyn işaretçileri `' + t + '`\'den `' + s + '`\'ye geriye izlenir: `' + path.join(' → ') + '`. Uzunluk (kenar sayısı): ' + (path.length - 1) + '.',
                 'Walking the parent pointers back from `' + t + '` to `' + s + '`: `' + path.join(' → ') + '`. Length (edge count): ' + (path.length - 1) + '.'), LINES_WALK);
        S.result = { length: path.length - 1, reachable: true };
      } else {
        S.step(T('Kuyruk boş ama `' + t + '` hiç ziyaret edilmedi: `' + s + '`\'den `' + t + '`\'ye hiçbir yol YOK.', 'The queue is empty but `' + t + '` was never visited: there is NO PATH from `' + s + '` to `' + t + '`.'), LINES_NOPATH);
        S.result = { length: -1, reachable: false };
      }
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
