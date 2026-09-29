/* Week 9 -- Floyd-Warshall all-pairs shortest paths: an N x N DISTANCE MATRIX, tried as an intermediate stop
 * vertex by vertex. For a fixed k, dist[i][k] and dist[k][j] never change during that pass, so the matrix can be
 * updated in place; the whole pass (every i, j) is shown as ONE step so the animation stays short even for a full
 * matrix. Afterwards, a negative diagonal entry dist[v][v] < 0 means v lies on a NEGATIVE CYCLE. Directed, weighted
 * edge-list input (no "start=", every pair's shortest path is computed at once): "A>B:4 B>C:-2 ..." (up to 6
 * vertices, so the matrix stays readable). */
(function (D) {
  'use strict';
  var T = D.T;
  var INF = 'inf';

  var C_CODE = [
    '#define MAX_V 32',
    '#define INF 1000000000',
    '',
    'int dist[MAX_V][MAX_V];',
    '',
    'void floyd_warshall(int vertex_count) {',
    '    for (int k = 0; k < vertex_count; k++) {          /* try every vertex as an intermediate stop */',
    '        for (int i = 0; i < vertex_count; i++) {',
    '            for (int j = 0; j < vertex_count; j++) {',
    '                if (dist[i][k] == INF || dist[k][j] == INF) continue;   /* no path through k */',
    '                int through = dist[i][k] + dist[k][j];',
    '                if (through < dist[i][j]) dist[i][j] = through;',
    '            }',
    '        }',
    '    }',
    '}',
    '',
    'int has_negative_cycle(int vertex_count) {',
    '    for (int v = 0; v < vertex_count; v++)',
    '        if (dist[v][v] < 0) return 1;                 /* a path from v back to v got shorter than 0 */',
    '    return 0;',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    'static final int INF = 1000000000;',
    '',
    'int[][] dist = new int[MAX_V][MAX_V];',
    '',
    'void floydWarshall(int vertexCount) {',
    '    for (int k = 0; k < vertexCount; k++) {            // try every vertex as an intermediate stop',
    '        for (int i = 0; i < vertexCount; i++) {',
    '            for (int j = 0; j < vertexCount; j++) {',
    '                if (dist[i][k] == INF || dist[k][j] == INF) continue;    // no path through k',
    '                int through = dist[i][k] + dist[k][j];',
    '                if (through < dist[i][j]) dist[i][j] = through;',
    '            }',
    '        }',
    '    }',
    '}',
    '',
    'boolean hasNegativeCycle(int vertexCount) {',
    '    for (int v = 0; v < vertexCount; v++)',
    '        if (dist[v][v] < 0) return true;               // a path from v back to v got shorter than 0',
    '    return false;',
    '}'
  ];
  /* C_CODE/JAVA_CODE mirror line-for-line (LN reuses one array). Positions: 7=for(k) [COND, outer, one step
   * per k], 8=for(i) [COND], 9=for(j) [COND], 10=if(dist[i][k]==INF||dist[k][j]==INF) continue [COND, the
   * whole (i,j) pass is narrated as ONE step, so this line's note describes the aggregate outcome], 11=the
   * through=... computation, 12=if(through<dist[i][j]) [COND], 19=for(v) [COND], 20=if(dist[v][v]<0) [COND]. */
  function LN(arr) { return { c: arr, java: arr }; }
  var L_INIT = LN([4]);
  var L_K = LN([{ n: 7, note: T('k < vertex_count mi? evet -- k bir sonraki ara düğüm', 'k < vertex_count? yes -- k is the next intermediate vertex') }]);
  var NOTE_IJ_LOOP = T('i < vertex_count ve j < vertex_count mi? evet -- her çift denenir', 'i < vertex_count and j < vertex_count? yes -- every pair is tried');
  var L_UPDATE = LN([{ n: 8, note: NOTE_IJ_LOOP }, { n: 9, note: NOTE_IJ_LOOP },
                      { n: 10, note: T('dist[i][k] veya dist[k][j] sonsuz mu? bazı çiftler için hayır -- yol var', 'dist[i][k] or dist[k][j] infinite? no for some pairs -- a path exists') },
                      11, { n: 12, note: T('daha kısa -> güncelle', 'shorter -> update') }]);
  var L_NOCHANGE = LN([{ n: 8, note: NOTE_IJ_LOOP }, { n: 9, note: NOTE_IJ_LOOP },
                        { n: 10, note: T('bu turda hiç iyileşme yok', 'no improvement this round') },
                        { n: 12, note: T('through < dist[i][j] mi? denenen hiçbir çift için değil', 'through < dist[i][j]? not for any pair tried') }]);
  var L_NEGCHECK = LN([{ n: 19, note: T('v < vertex_count mi? evet -- köşegen taranır', 'v < vertex_count? yes -- the diagonal is scanned') },
                        { n: 20, note: T('dist[v][v] < 0 mi? her v için kontrol edilir', 'dist[v][v] < 0? checked for every v') }, 21]);

  var EDGE_RE = /^([A-Za-z0-9]{1,3})>([A-Za-z0-9]{1,3}):(-?\d+)$/;
  function parseDWG(text) {
    var toks = String(text).trim().split(/\s+/).filter(Boolean);
    if (!toks.length) throw T('En az bir kenar yazın: A>B:AĞIRLIK ...', 'Write at least one edge: A>B:WEIGHT ...');
    var edges = [], vset = {};
    for (var i = 0; i < toks.length; i++) {
      var m = EDGE_RE.exec(toks[i]);
      if (!m) throw T('"' + toks[i] + '" anlaşılmadı: yönlü kenar VERTEX>VERTEX:AĞIRLIK biçiminde olmalı.', '"' + toks[i] + '" is not understood: a directed edge must look like VERTEX>VERTEX:WEIGHT.');
      if (m[1] === m[2]) throw T('Öz-döngüler bu örnekte desteklenmiyor: "' + toks[i] + '".', 'Self-loops are not supported in this example: "' + toks[i] + '".');
      edges.push({ a: m[1], b: m[2], w: parseInt(m[3], 10) }); vset[m[1]] = 1; vset[m[2]] = 1;
    }
    if (Object.keys(vset).length > 7) throw T('En çok 7 düğüm: matris okunaklı kalmalı.', 'At most 7 vertices: the matrix must stay readable.');
    return { edges: edges };
  }
  function formatDWG(d) { return d.edges.map(function (e) { return e.a + '>' + e.b + ':' + e.w; }).join(' '); }
  function verticesOf(edges) { var s = {}; edges.forEach(function (e) { s[e.a] = 1; s[e.b] = 1; }); return Object.keys(s).sort(); }

  /** Independent computation: keeps the matrix as a flat 1-D array (row * n + col), a different representation
   *  from build()'s 2-D box grid, but the same k-outermost triple loop (the only loop order Floyd-Warshall is
   *  correct with -- i/j order within a fixed k never affects the result, so no tie-break concern arises here). */
  function fwRef(edges) {
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    var V = Object.keys(vset).sort();
    var n = V.length, idx = {}; V.forEach(function (v, i) { idx[v] = i; });
    var dist = new Array(n * n).fill(Infinity);
    for (var i = 0; i < n; i++) dist[i * n + i] = 0;
    edges.forEach(function (e) { var p = idx[e.a] * n + idx[e.b]; if (e.w < dist[p]) dist[p] = e.w; });
    for (var k = 0; k < n; k++) {
      for (var a = 0; a < n; a++) {
        if (dist[a * n + k] === Infinity) continue;
        for (var b = 0; b < n; b++) {
          if (dist[k * n + b] === Infinity) continue;
          var through = dist[a * n + k] + dist[k * n + b];
          if (through < dist[a * n + b]) dist[a * n + b] = through;
        }
      }
    }
    var out = {}, negCycleVertices = [];
    V.forEach(function (v, i) {
      out[v] = {}; V.forEach(function (w, j) { out[v][w] = dist[i * n + j] === Infinity ? null : dist[i * n + j]; });
      if (dist[i * n + i] < 0) negCycleVertices.push(v);
    });
    return { dist: out, negCycle: negCycleVertices.length > 0, negCycleVertices: negCycleVertices };
  }

  D.define({
    id: 'floyd-warshall',
    title: T('Floyd-Warshall: bütün çiftler en kısa yol', 'Floyd-Warshall: all-pairs shortest paths'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('5 düğüm, 10 kenar, negatif kenarlar var ama negatif döngü yok', '5 vertices, 10 edges, negative edges but no negative cycle'),
        data: { edges: [
          { a: 'A', b: 'B', w: 3 }, { a: 'A', b: 'C', w: 8 }, { a: 'A', b: 'E', w: -4 }, { a: 'B', b: 'D', w: 1 },
          { a: 'B', b: 'E', w: 7 }, { a: 'C', b: 'B', w: 4 }, { a: 'D', b: 'A', w: 2 }, { a: 'D', b: 'C', w: -5 },
          { a: 'E', b: 'D', w: 6 }, { a: 'C', b: 'E', w: 2 }
        ] } },
      { id: 'hard', level: 'hard', name: T('6 düğüm, 11 kenar, bazı çiftler bağlı değil (uzaklık inf kalır)', '6 vertices, 11 edges, some pairs stay disconnected (distance remains inf)'),
        data: { edges: [
          { a: 'A', b: 'B', w: 2 }, { a: 'B', b: 'C', w: 3 }, { a: 'A', b: 'C', w: 8 }, { a: 'C', b: 'D', w: 1 },
          { a: 'D', b: 'B', w: -2 },
          { a: 'X', b: 'Y', w: 4 }, { a: 'Y', b: 'Z', w: 2 }, { a: 'Z', b: 'X', w: 1 }, { a: 'X', b: 'Z', w: 9 },
          { a: 'Y', b: 'X', w: 5 }, { a: 'Z', b: 'Y', w: 3 }
        ] } },
      { id: 'negative-cycle', level: 'edge', name: T('Uç: A-B-C-A negatif döngü, 10 kenar', 'Edge case: A-B-C-A is a negative cycle, 10 edges'),
        data: { edges: [
          { a: 'A', b: 'B', w: 1 }, { a: 'B', b: 'C', w: 2 }, { a: 'C', b: 'A', w: -4 }, { a: 'A', b: 'D', w: 3 },
          { a: 'D', b: 'E', w: 2 }, { a: 'B', b: 'D', w: 5 }, { a: 'C', b: 'E', w: 1 }, { a: 'D', b: 'A', w: 6 },
          { a: 'E', b: 'B', w: 2 }, { a: 'E', b: 'C', w: 3 }
        ] } },
      { id: 'two-vertices', level: 'edge', name: T('Uç: 2 düğüm, 1 kenar', 'Edge case: 2 vertices, 1 edge'),
        data: { edges: [{ a: 'A', b: 'B', w: 5 }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.edges.length; },
    reference: function (d) { return fwRef(d.edges); },
    random: function (level, r) {
      var n = { easy: 4, normal: 5, hard: 6, extreme: 7 }[level] || 5;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(String.fromCharCode(65 + i));
      var m = { easy: 10, normal: 11, hard: 13, extreme: 15 }[level] || 11;
      var negProb = level === 'easy' ? 0 : 0.2;
      var wHi = level === 'extreme' ? 30 : 10;
      var edges = [], seen = {}, guard = 0;
      while (edges.length < m && guard < 1000) {
        guard++;
        var i1 = D.randInt(r, 0, n - 1), j1 = D.randInt(r, 0, n - 1);
        if (i1 === j1) continue;
        var key = vertices[i1] + '>' + vertices[j1];
        if (seen[key]) continue;
        edges.push({ a: vertices[i1], b: vertices[j1], w: D.randInt(r, 1, wHi) * (r() < negProb ? -1 : 1) }); seen[key] = 1;
      }
      return { edges: edges };
    },
    input: {
      hint: T('Örnek: A>B:4 B>C:-2 C>A:1   (her kenar yönlü, VERTEX>VERTEX:AĞIRLIK, en çok 7 düğüm)', 'Example: A>B:4 B>C:-2 C>A:1   (every edge is directed, VERTEX>VERTEX:WEIGHT, at most 7 vertices)'),
      parse: parseDWG,
      format: formatDWG,
      bad: ['', 'A-B:4', 'A>A:4', 'A>B B>C', 'A>B:x']
    },
    build: function (S, d) {
      var edges = d.edges, V = verticesOf(edges), n = V.length, idx = {};
      V.forEach(function (v, i) { idx[v] = i; });
      var CW = 52, CH = 40, X0 = 70, Y0 = 60;
      V.forEach(function (v, j) { S.box('h' + j, { x: X0 + j * CW, y: Y0 - CH - 14, w: CW - 6, h: 26, text: v, style: 'dim', size: 14 }); });
      V.forEach(function (i, r) { S.label('rl' + r, { x: X0 - 14, y: Y0 + r * CH + CH / 2 + 5, text: i, anchor: 'end', size: 15, bold: true, mono: true }); });
      var dist = [];
      for (var i = 0; i < n; i++) { dist.push([]); for (var j = 0; j < n; j++) dist[i].push(i === j ? 0 : Infinity); }
      edges.forEach(function (e) { var p = idx[e.a], q = idx[e.b]; if (e.w < dist[p][q]) dist[p][q] = e.w; });
      function cellText(v) { return v === Infinity ? INF : String(v); }
      for (i = 0; i < n; i++) for (var j = 0; j < n; j++) S.box('m' + i + '_' + j, { x: X0 + j * CW, y: Y0 + i * CH, w: CW - 6, h: CH - 6, text: cellText(dist[i][j]), style: i === j ? 'new' : (dist[i][j] === Infinity ? 'empty' : 'normal'), size: 14 });
      S.step(T('BAŞLANGIÇ MATRİSİ: `dist[i][i]=0`, doğrudan bir kenar varsa `dist[i][j]=ağırlık`, yoksa `inf`. Henüz hiçbir ara düğüm denenmedi.',
               'INITIAL MATRIX: `dist[i][i]=0`, if a direct edge exists `dist[i][j]=weight`, otherwise `inf`. No intermediate vertex has been tried yet.'), L_INIT);

      for (var k = 0; k < n; k++) {
        var kv = V[k];
        for (j = 0; j < n; j++) { S.set('h' + j, { style: j === k ? 'hl' : 'dim' }); }
        for (i = 0; i < n; i++) S.set('m' + i + '_' + k, { style: 'active' });
        for (j = 0; j < n; j++) S.set('m' + k + '_' + j, { style: 'active' });
        S.step(T('ARA DÜĞÜM `k = ' + kv + '`: her `(i,j)` çifti için `' + kv + '` üzerinden geçmenin daha kısa olup olmadığına bakılır -- `k`nın satırı ve sütunu bu turda değişmez.',
                 'INTERMEDIATE VERTEX `k = ' + kv + '`: for every pair `(i,j)`, we check whether going through `' + kv + '` is shorter -- `k`\'s row and column never change during this pass.'), L_K);
        var updated = [];
        for (i = 0; i < n; i++) {
          if (dist[i][k] === Infinity) continue;
          for (j = 0; j < n; j++) {
            if (dist[k][j] === Infinity) continue;
            var through = dist[i][k] + dist[k][j];
            if (through < dist[i][j]) { dist[i][j] = through; updated.push({ i: i, j: j }); }
          }
        }
        updated.forEach(function (u) { S.set('m' + u.i + '_' + u.j, { text: cellText(dist[u.i][u.j]), style: 'new' }); });
        function cellName(u) { return '(' + V[u.i] + ',' + V[u.j] + ')=' + dist[u.i][u.j]; }
        S.step(T(updated.length ? ('İyileşen hücreler: ' + updated.map(cellName).join(', ') + '.')
                                 : ('`' + kv + '` üzerinden geçmek hiçbir çifti kısaltmadı.'),
                 updated.length ? ('Cells improved: ' + updated.map(cellName).join(', ') + '.')
                                 : ('Going through `' + kv + '` shortened no pair.')),
               updated.length ? L_UPDATE : L_NOCHANGE);
        for (i = 0; i < n; i++) for (j = 0; j < n; j++) S.set('m' + i + '_' + j, { style: i === j ? 'new' : (dist[i][j] === Infinity ? 'empty' : 'normal') });
      }
      for (j = 0; j < n; j++) S.set('h' + j, { style: 'dim' });

      var negCycleVertices = [];
      for (i = 0; i < n; i++) { if (dist[i][i] < 0) { negCycleVertices.push(V[i]); S.set('m' + i + '_' + i, { style: 'del' }); } }
      S.step(T('NEGATİF DÖNGÜ KONTROLÜ: köşegende `dist[v][v] < 0` olan bir `v` varsa, `v` bir negatif döngü üzerindedir.',
               'NEGATIVE CYCLE CHECK: if the diagonal has `dist[v][v] < 0` for some `v`, then `v` lies on a negative cycle.'), L_NEGCHECK);
      var out = {}; V.forEach(function (v, ii) { out[v] = {}; V.forEach(function (w, jj) { out[v][w] = dist[ii][jj] === Infinity ? null : dist[ii][jj]; }); });
      S.result = { dist: out, negCycle: negCycleVertices.length > 0, negCycleVertices: negCycleVertices };
      S.step(T('Bitti: ' + n + ' düğümün her çifti için en kısa yol hesaplandı.' + (negCycleVertices.length ? ' Negatif döngü: ' + negCycleVertices.join(', ') + '.' : ' Negatif döngü yok.'),
               'Done: the shortest path for every pair of ' + n + ' vertices has been computed.' + (negCycleVertices.length ? ' Negative cycle: ' + negCycleVertices.join(', ') + '.' : ' No negative cycle.')));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
