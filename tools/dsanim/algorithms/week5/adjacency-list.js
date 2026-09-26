/* Week 5 -- graph representation: adjacency list. Build the array of linked lists from an edge list, one edge at
 * a time (undirected appends a node to BOTH endpoints' lists, unless it is a self-loop). Same graphs as
 * adjacency-matrix.js, so the two representations can be compared directly. */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    'typedef struct AdjNode {',
    '    int to;                 /* neighbour\'s vertex index */',
    '    struct AdjNode *next;',
    '} AdjNode;',
    '',
    'AdjNode *adj[MAX_V];         /* one linked list per vertex, all start NULL */',
    '',
    'void append(int v, int neighbour) {',
    '    AdjNode *n = malloc(sizeof(AdjNode));',
    '    n->to = neighbour;',
    '    n->next = NULL;',
    '    if (adj[v] == NULL) { adj[v] = n; return; }',
    '    AdjNode *cur = adj[v];',
    '    while (cur->next != NULL)',
    '        cur = cur->next;    /* walk to the tail */',
    '    cur->next = n;',
    '}',
    '',
    'void add_edge(int a, int b, int directed) {',
    '    append(a, b);',
    '    if (!directed && a != b)',
    '        append(b, a);',
    '}'
  ];
  var JAVA_CODE = [
    'class AdjNode {',
    '    int to;                 // neighbour\'s vertex index',
    '    AdjNode next;',
    '}',
    '',
    'AdjNode[] adj = new AdjNode[MAX_V];   // one linked list per vertex, all start null',
    '',
    'void append(int v, int neighbour) {',
    '    AdjNode n = new AdjNode();',
    '    n.to = neighbour;',
    '    n.next = null;',
    '    if (adj[v] == null) { adj[v] = n; return; }',
    '    AdjNode cur = adj[v];',
    '    while (cur.next != null)',
    '        cur = cur.next;     // walk to the tail',
    '    cur.next = n;',
    '}',
    '',
    'void addEdge(int a, int b, boolean directed) {',
    '    append(a, b);',
    '    if (!directed && a != b)',
    '        append(b, a);',
    '}'
  ];
  var LINES_APPEND = { c: [8, 9, 10, 11, 12, 13, 14, 15, 16], java: [7, 8, 9, 10, 11, 12, 13, 14, 15] };
  var LINES_ADDEDGE = { c: [19, 20, 21, 22], java: [18, 19, 20, 21] };

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
    id: 'adjacency-list',
    title: T('Çizge gösterimi: komşuluk listesi', 'Graph representation: adjacency list'),
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
      { id: 'single', level: 'edge', name: T('Tek düğüm (bir öz-döngüyle gösterilir): tek düğümlü liste', 'A single vertex (shown with a self-loop): a one-vertex list'),
        data: { directed: false, edges: [{ a: 'A', b: 'A', w: null }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of edges. */
    size: function (d) { return d.edges.length; },
    /** Independent computation: for every vertex, scan the WHOLE edge list from scratch (nested loop, O(V * E))
     *  instead of build()'s single incremental sweep that appends to a running tail pointer (O(V + E)). */
    reference: function (d) {
      var edges = d.edges, directed = d.directed;
      var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
      var V = Object.keys(vset).sort();
      var lists = {};
      V.forEach(function (v) {
        var lst = [];
        edges.forEach(function (e) {
          if (e.a === v) lst.push(e.b);
          if (!directed && e.b === v && e.a !== e.b) lst.push(e.a);
        });
        lists[v] = lst;
      });
      return { vertices: V, lists: lists };
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
      var edges = d.edges, directed = d.directed, V = verticesOf(edges);
      var idx = {}; V.forEach(function (v, i) { idx[v] = i; });
      var HX = 56, HW = 66, ROWY0 = 56, ROWH = 62, NODE_X0 = HX + HW + 36, STEP = 84;
      V.forEach(function (v, i) { S.box('h' + i, { x: HX, y: ROWY0 + i * ROWH, w: HW, h: 34, text: v, style: 'normal' }); });
      S.step(T('KOMŞULUK LİSTESİ (adjacency list): her düğüm için bir bağlı liste, o düğümün komşularını tutar. Soldaki kutular düğümleri, her satırdaki zincir o düğümün komşu listesini gösterir. ' + V.length + ' düğüm için ' + V.length + ' liste.',
               'The ADJACENCY LIST: one linked list per vertex, holding that vertex\'s neighbours. The boxes on the left are the vertices; the chain on each row is that vertex\'s neighbour list. ' + V.length + ' vertices, ' + V.length + ' lists.'));

      var tail = {}, count = {}, lists = {};
      V.forEach(function (v) { tail[v] = null; count[v] = 0; lists[v] = []; });

      function appendNode(v, neighbour) {
        var i = idx[v], nid = 'n_' + v + '_' + count[v];
        var x = NODE_X0 + count[v] * STEP, y = ROWY0 + i * ROWH;
        S.node(nid, { x: x, y: y, w: 40, h: 34, value: neighbour, isNull: true, style: 'new' });
        if (tail[v]) { S.set(tail[v], { isNull: false }); S.arrow('arr_' + nid, { from: tail[v], to: nid, kind: 'next', style: 'normal' }); }
        else S.arrow('arrH_' + v, { from: 'h' + i, to: nid, kind: 'center', head: true, style: 'normal' });
        tail[v] = nid; count[v]++; lists[v].push(neighbour);
      }

      edges.forEach(function (e, idx) {
        S.at(idx);
        appendNode(e.a, e.b);
        var alsoBack = !directed && e.a !== e.b;
        if (alsoBack) appendNode(e.b, e.a);
        S.set('n_' + e.a + '_' + (count[e.a] - 1), { style: 'hl' });
        if (alsoBack) S.set('n_' + e.b + '_' + (count[e.b] - 1), { style: 'hl' });
        S.step(alsoBack
          ? T('Kenar `' + e.a + '-' + e.b + (e.w !== null ? ':' + e.w : '') + '` (yönsüz): `' + e.b + '` düğümü `' + e.a + '`\'nin listesine, `' + e.a + '` düğümü de `' + e.b + '`\'nin listesine eklenir -- iki düğüm, iki liste.',
              'Edge `' + e.a + '-' + e.b + (e.w !== null ? ':' + e.w : '') + '` (undirected): `' + e.b + '` is appended to `' + e.a + '`\'s list, and `' + e.a + '` is appended to `' + e.b + '`\'s list -- two nodes, two lists.')
          : T('Kenar `' + e.a + (directed ? '>' : '-') + e.b + (e.w !== null ? ':' + e.w : '') + '`' + (e.a === e.b ? ' (öz-döngü)' : '') + ': `' + e.b + '` düğümü, `' + e.a + '`\'nin listesinin sonuna eklenir.',
              'Edge `' + e.a + (directed ? '>' : '-') + e.b + (e.w !== null ? ':' + e.w : '') + '`' + (e.a === e.b ? ' (a self-loop)' : '') + ': `' + e.b + '` is appended to the tail of `' + e.a + '`\'s list.'),
          LINES_APPEND);
        S.set('n_' + e.a + '_' + (count[e.a] - 1), { style: 'normal' });
        if (alsoBack) S.set('n_' + e.b + '_' + (count[e.b] - 1), { style: 'normal' });
      });

      S.at(null);
      var emptyOnes = V.filter(function (v) { return count[v] === 0; });
      if (emptyOnes.length) {
        emptyOnes.forEach(function (v) { S.label('empty_' + v, { x: NODE_X0, y: ROWY0 + idx[v] * ROWH + 5, text: T('boş (komşu yok)', 'empty (no neighbours)'), anchor: 'start', size: 14, style: 'dim' }); });
        S.step(T('Yönlü çizgede bir düğümün hiç giden kenarı olmayabilir: listesi boş kalır -- ' + emptyOnes.map(function (v) { return '`' + v + '`'; }).join(', ') + '.',
                 'In a directed graph a vertex may have no outgoing edges at all: its list stays empty -- ' + emptyOnes.map(function (v) { return '`' + v + '`'; }).join(', ') + '.'), LINES_ADDEDGE);
      }

      S.result = { vertices: V, lists: lists };
      var total = V.reduce(function (s, v) { return s + count[v]; }, 0);
      S.step(T('Bitti: toplam ' + total + ' liste düğümü. Komşuluk listesi yalnız GERÇEK kenarlar kadar yer kaplar (O(V + E)); seyrek çizgelerde matristen çok daha tutumludur.',
               'Done: ' + total + ' list nodes in total. An adjacency list only uses space for the edges that actually exist (O(V + E)); for a sparse graph it is far more economical than the matrix.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
