/* Week 5 -- graph representation: adjacency matrix. Build the V x V matrix from an edge list, one edge at a time
 * (undirected sets both cells, showing the symmetry). Input format: see parseGraph below (shared across Week 5). */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_V 16',
    '',
    'int matrix[MAX_V][MAX_V];      /* all cells start at 0 */',
    '',
    'void add_edge(int a, int b, int weight, int directed) {',
    '    matrix[a][b] = weight;      /* 1 if the graph is unweighted */',
    '    if (!directed)',
    '        matrix[b][a] = weight;  /* undirected: mirror across the diagonal */',
    '}',
    '',
    'void build_adjacency_matrix(Edge *edges, int edge_count, int directed) {',
    '    for (int i = 0; i < MAX_V; i++)',
    '        for (int j = 0; j < MAX_V; j++)',
    '            matrix[i][j] = 0;',
    '    for (int k = 0; k < edge_count; k++)',
    '        add_edge(edges[k].a, edges[k].b, edges[k].weight, directed);',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 16;',
    '',
    'int[][] matrix = new int[MAX_V][MAX_V];   // all cells start at 0',
    '',
    'void addEdge(int a, int b, int weight, boolean directed) {',
    '    matrix[a][b] = weight;      // 1 if the graph is unweighted',
    '    if (!directed)',
    '        matrix[b][a] = weight;  // undirected: mirror across the diagonal',
    '}',
    '',
    'void buildAdjacencyMatrix(Edge[] edges, int edgeCount, boolean directed) {',
    '    for (int i = 0; i < MAX_V; i++)',
    '        for (int j = 0; j < MAX_V; j++)',
    '            matrix[i][j] = 0;',
    '    for (int k = 0; k < edgeCount; k++)',
    '        addEdge(edges[k].a, edges[k].b, edges[k].weight, directed);',
    '}'
  ];
  var LINES_ADD = { c: [6, 7, 8], java: [6, 7, 8] };
  var LINES_LOOP = { c: [14, 15], java: [14, 15] };

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

  D.define({
    id: 'adjacency-matrix',
    title: T('Çizge gösterimi: komşuluk matrisi', 'Graph representation: adjacency matrix'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('7 düğüm, yönsüz, ağırlıksız, 10 kenar', '7 vertices, undirected, unweighted, 10 edges'),
        data: { directed: false, edges: [
          { a: 'A', b: 'B', w: null }, { a: 'B', b: 'C', w: null }, { a: 'C', b: 'D', w: null }, { a: 'D', b: 'E', w: null },
          { a: 'E', b: 'F', w: null }, { a: 'F', b: 'G', w: null }, { a: 'G', b: 'A', w: null },
          { a: 'A', b: 'D', w: null }, { a: 'B', b: 'E', w: null }, { a: 'C', b: 'F', w: null }
        ] } },
      { id: 'hard', level: 'hard', name: T('8 düğüm, yönlü, ağırlıklı, ters çift ile 10 kenar', '8 vertices, directed, weighted, 10 edges including a reversed pair'),
        data: { directed: true, edges: [
          { a: 'P', b: 'Q', w: 3 }, { a: 'Q', b: 'R', w: 1 }, { a: 'R', b: 'S', w: 4 }, { a: 'S', b: 'T', w: 2 },
          { a: 'T', b: 'U', w: 5 }, { a: 'U', b: 'V', w: 1 }, { a: 'V', b: 'W', w: 3 }, { a: 'W', b: 'P', w: 2 },
          { a: 'P', b: 'R', w: 6 }, { a: 'R', b: 'P', w: 7 }
        ] } },
      { id: 'dense', level: 'edge', name: T('5 düğüm, tam çizge (her çift bağlı), 10 kenar', '5 vertices, a complete graph (every pair connected), 10 edges'),
        data: { directed: false, edges: [
          { a: 'A', b: 'B', w: null }, { a: 'A', b: 'C', w: null }, { a: 'A', b: 'D', w: null }, { a: 'A', b: 'E', w: null },
          { a: 'B', b: 'C', w: null }, { a: 'B', b: 'D', w: null }, { a: 'B', b: 'E', w: null },
          { a: 'C', b: 'D', w: null }, { a: 'C', b: 'E', w: null }, { a: 'D', b: 'E', w: null }
        ] } },
      { id: 'single', level: 'edge', name: T('Tek düğüm (bir öz-döngüyle gösterilir): 1x1 matris', 'A single vertex (shown with a self-loop): a 1x1 matrix'),
        data: { directed: false, edges: [{ a: 'A', b: 'A', w: null }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of edges. */
    size: function (d) { return d.edges.length; },
    /** Independent computation: for every cell, brute-force scan ALL edges once (O(V^2 * E)) instead of
     *  build()'s single incremental pass over the edge list (O(V + E)). */
    reference: function (d) {
      var vset = {}; d.edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
      var V = Object.keys(vset).sort(), n = V.length;
      var M = []; for (var i = 0; i < n; i++) { M.push([]); for (var j = 0; j < n; j++) M[i].push(0); }
      for (var i2 = 0; i2 < n; i2++) {
        for (var j2 = 0; j2 < n; j2++) {
          for (var k = 0; k < d.edges.length; k++) {
            var e = d.edges[k], val = e.w !== null ? e.w : 1;
            if (e.a === V[i2] && e.b === V[j2]) M[i2][j2] = val;
            if (!d.directed && e.b === V[i2] && e.a === V[j2]) M[i2][j2] = val;
          }
        }
      }
      return { vertices: V, matrix: M };
    },
    random: function (level, r) {
      var n = { easy: 6, normal: 7, hard: 9, extreme: 11 }[level] || 8;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var directed = r() < 0.5, weighted = r() < 0.5;
      var m = { easy: 10, normal: 11, hard: 13, extreme: 16 }[level] || 11;
      function w() { return weighted ? D.randInt(r, 1, 20) : null; }
      var edges = [], seen = {};
      for (var i2 = 1; i2 < n; i2++) { var j = D.randInt(r, 0, i2 - 1); edges.push({ a: vertices[j], b: vertices[i2], w: w() }); seen[vertices[j] + '|' + vertices[i2]] = 1; if (!directed) seen[vertices[i2] + '|' + vertices[j]] = 1; }
      var guard = 0;
      while (edges.length < m && guard < 1000) {
        guard++;
        var x = vertices[D.randInt(r, 0, n - 1)], y = vertices[D.randInt(r, 0, n - 1)];
        if (x === y) continue;
        var key = x + '|' + y;
        if (seen[key]) continue;
        edges.push({ a: x, b: y, w: w() }); seen[key] = 1; if (!directed) seen[y + '|' + x] = 1;
      }
      return { directed: directed, edges: edges };
    },
    input: {
      hint: T('Örnek: A-B B-C:4 A>D   (yönsüz "-" ya da yönlü ">", opsiyonel ":AĞIRLIK"; etiket 1-3 karakter; bütün kenarlar aynı türde olmalı)',
              'Example: A-B B-C:4 A>D   (undirected "-" or directed ">", optional ":WEIGHT"; label 1-3 characters; all edges must be the same kind)'),
      parse: parseGraph,
      format: formatGraph,
      bad: ['', 'A~B', 'A-B:x', 'A>B B-C', 'ABCD-B', 'A-']
    },
    build: function (S, d) {
      var edges = d.edges, directed = d.directed, V = verticesOf(edges), n = V.length;
      var idx = {}; V.forEach(function (v, i) { idx[v] = i; });
      var CELL = 38, X0 = 92, Y0 = 74;
      for (var j = 0; j < n; j++) S.label('col' + j, { x: X0 + j * CELL + CELL / 2, y: Y0 - 16, text: V[j], anchor: 'middle', size: 14, mono: true, bold: true });
      for (var i = 0; i < n; i++) S.label('row' + i, { x: X0 - 16, y: Y0 + i * CELL + CELL / 2 + 5, text: V[i], anchor: 'end', size: 14, mono: true, bold: true });
      var M = [];
      for (var i2 = 0; i2 < n; i2++) {
        M.push([]);
        for (var j2 = 0; j2 < n; j2++) { M[i2].push(0); S.box('m_' + i2 + '_' + j2, { x: X0 + j2 * CELL, y: Y0 + i2 * CELL, w: CELL - 4, h: CELL - 4, text: '0', style: i2 === j2 ? 'dim' : 'empty', size: 15 }); }
      }
      S.step(T('KOMŞULUK MATRİSİ (adjacency matrix): V x V büyüklüğünde bir tablo. `matrix[i][j]` satırı `i` olan düğümden sütunu `j` olan düğüme bir kenar varsa 1 (ya da ağırlığı), yoksa 0 tutar. ' + n + ' düğüm için ' + n + 'x' + n + ' bir tablo.',
               'The ADJACENCY MATRIX: a V x V table. `matrix[i][j]` holds 1 (or the weight) when there is an edge from the vertex in row `i` to the vertex in column `j`, 0 otherwise. ' + n + ' vertices give an ' + n + 'x' + n + ' table.'),
             LINES_LOOP);

      edges.forEach(function (e, k) {
        var i3 = idx[e.a], j3 = idx[e.b], val = e.w !== null ? e.w : 1;
        M[i3][j3] = val; if (!directed) M[j3][i3] = val;
        S.at(k);
        if (k === 0) {
          S.set('row' + i3, { style: 'hl' }); S.set('col' + j3, { style: 'hl' }); S.set('m_' + i3 + '_' + j3, { style: 'hl' });
          S.step(T('İlk kenar: `' + e.a + (directed ? '>' : '-') + e.b + '`. Satır `' + e.a + '` ile sütun `' + e.b + '`\'nin kesiştiği hücreye bakıyoruz.',
                    'The first edge: `' + e.a + (directed ? '>' : '-') + e.b + '`. We look at the cell where row `' + e.a + '` meets column `' + e.b + '`.'),
                 LINES_ADD);
          S.set('m_' + i3 + '_' + j3, { text: String(val), style: 'new' });
          if (!directed) S.set('m_' + j3 + '_' + i3, { text: String(val), style: 'new' });
          S.step(directed
            ? T('`matrix[' + e.a + '][' + e.b + '] = ' + val + '`. Yönlü çizgede yalnız bu tek hücre yazılır.',
                '`matrix[' + e.a + '][' + e.b + '] = ' + val + '`. In a directed graph only this one cell is written.')
            : T('`matrix[' + e.a + '][' + e.b + '] = ' + val + '`, ve simetriği `matrix[' + e.b + '][' + e.a + '] = ' + val + '` de yazılır -- yönsüz çizgenin matrisi köşegene göre SİMETRİKTİR.',
                '`matrix[' + e.a + '][' + e.b + '] = ' + val + '`, and its mirror `matrix[' + e.b + '][' + e.a + '] = ' + val + '` is written too -- an undirected graph\'s matrix is SYMMETRIC across the diagonal.'),
            LINES_ADD);
          S.set('row' + i3, { style: 'normal' }); S.set('col' + j3, { style: 'normal' });
        } else {
          S.set('m_' + i3 + '_' + j3, { text: String(val), style: 'new' });
          if (!directed) S.set('m_' + j3 + '_' + i3, { text: String(val), style: 'new' });
          S.step(T((k + 1) + '. kenar `' + e.a + (directed ? '>' : '-') + e.b + (e.w !== null ? ':' + e.w : '') + '`: `matrix[' + e.a + '][' + e.b + '] = ' + val + '`' + (directed ? '.' : ', `matrix[' + e.b + '][' + e.a + '] = ' + val + '`.'),
                    'edge ' + (k + 1) + ' `' + e.a + (directed ? '>' : '-') + e.b + (e.w !== null ? ':' + e.w : '') + '`: `matrix[' + e.a + '][' + e.b + '] = ' + val + '`' + (directed ? '.' : ', `matrix[' + e.b + '][' + e.a + '] = ' + val + '`.')),
                 LINES_ADD);
        }
      });
      for (var i4 = 0; i4 < n; i4++) for (var j4 = 0; j4 < n; j4++) if (M[i4][j4] !== 0) S.set('m_' + i4 + '_' + j4, { style: 'normal' });
      S.at(null);
      S.result = { vertices: V, matrix: M };
      S.step(T('Bitti: matris tamamlandı. Bir kenarın var olup olmadığını sormak `matrix[i][j]`\'ye bakmakla O(1) sürer, ama V büyüdükçe tablo V^2 hücre kaplar (çoğu boş olsa bile).',
               'Done: the matrix is complete. Asking whether an edge exists is an O(1) lookup, `matrix[i][j]`, but the table always takes V^2 cells as V grows, even when most of it is empty.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
