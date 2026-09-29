/* Week 9 -- backtracking: colour every vertex with one of k colours so that no edge joins two same-coloured
 * vertices (chosen over Hamiltonian-path backtracking because its decision variable -- one colour per vertex --
 * reuses the exact color[] ROW convention and the neighbour-conflict check already taught in bipartite-check.js,
 * so this animation only has to teach the NEW idea, try-then-undo search, instead of also introducing a new
 * path/visited-stack layout this late in the term). Vertices are tried in alphabetical order, colours 1..k in
 * order; when no colour works, we UNDO (colour 0) and let the caller try its next colour. Input: "k=3 A-B A-C ...".
 */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_V 32',
    'int color_of[MAX_V];        /* 0 = uncoloured */',
    '',
    'int safe(Graph *g, int v, int c) {',
    '    for (AdjNode *n = g->adj[v]; n != NULL; n = n->next)   /* alphabetical order */',
    '        if (color_of[n->to] == c) return 0;      /* a neighbour already has this colour */',
    '    return 1;',
    '}',
    '',
    'int color_graph(Graph *g, int v, int k) {         /* try to colour v, v+1, ... with k colours */',
    '    if (v == g->vertex_count) return 1;           /* every vertex coloured: success */',
    '    for (int c = 1; c <= k; c++) {',
    '        if (safe(g, v, c)) {',
    '            color_of[v] = c;                       /* try colour c */',
    '            if (color_graph(g, v + 1, k)) return 1;',
    '            color_of[v] = 0;                        /* backtrack: undo, try the next colour */',
    '        }',
    '    }',
    '    return 0;                                      /* no colour works for v: fail, backtrack further */',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    'int[] colorOf = new int[MAX_V];         // 0 = uncoloured',
    '',
    'boolean safe(Graph g, int v, int c) {',
    '    for (AdjNode n = g.adj[v]; n != null; n = n.next)     // alphabetical order',
    '        if (colorOf[n.to] == c) return false;    // a neighbour already has this colour',
    '    return true;',
    '}',
    '',
    'boolean colorGraph(Graph g, int v, int k) {        // try to colour v, v+1, ... with k colours',
    '    if (v == g.vertexCount) return true;           // every vertex coloured: success',
    '    for (int c = 1; c <= k; c++) {',
    '        if (safe(g, v, c)) {',
    '            colorOf[v] = c;                          // try colour c',
    '            if (colorGraph(g, v + 1, k)) return true;',
    '            colorOf[v] = 0;                           // backtrack: undo, try the next colour',
    '        }',
    '    }',
    '    return false;                                   // no colour works for v: fail, backtrack further',
    '}'
  ];
  /* C_CODE/JAVA_CODE mirror line-for-line (LN reuses one array). Positions: 5=for(n) in safe() [COND],
   * 6=if(color[n]==c) return false [COND, the conflict check], 11=if(v==vertex_count) [COND, the success
   * base case], 12=for(c=1..k) [COND], 13=if(safe(v,c)) [COND], 15=if(colorGraph(v+1,k)) [COND, the
   * recursive call's own result], 16=colorOf[v]=0 (the undo), 19=return false (every colour failed).
   * Earlier versions showed L_SUCCESS as just the colorGraph signature (10) instead of the real base-case
   * check (11), L_UNDO omitted both the recursive call's outcome and the undo line, and L_FAIL pointed at a
   * bare closing brace (18) instead of the real "no colour worked" line (19) -- all fixed below. */
  function LN(arr) { return { c: arr, java: arr }; }
  var NOTE_LOOP_N = T('n != NULL mi? evet -- sıradaki komşuya bakılıyor', 'n != NULL? yes -- looking at the next neighbour');
  var L_TRY = LN([4, { n: 5, note: NOTE_LOOP_N }, { n: 6, note: T('color[n] == c mi? her komşu için kontrol edilir', 'color[n] == c? checked for every neighbour') }, 7]);
  var L_CONFLICT = LN([{ n: 5, note: NOTE_LOOP_N }, { n: 6, note: T('color[n] == c mi? evet -- çakışma bulundu', 'color[n] == c? yes -- a conflict is found') }]);
  var L_SAFE = LN([{ n: 5, note: NOTE_LOOP_N }, { n: 6, note: T('color[n] == c mi? hayır -- hiçbir komşu için değil', 'color[n] == c? no -- for none of the neighbours') }, 7]);
  var L_PLACE = LN([{ n: 12, note: T('c <= k mi? evet -- sıradaki renk denenir', 'c <= k? yes -- the next colour is tried') }, { n: 13, note: T('safe(v,c) mi? evet -- çakışma yok', 'safe(v,c)? yes -- no conflict') }]);
  var L_SUCCESS = LN([{ n: 11, note: T('v == vertex_count mi? evet -- bütün düğümler renklendi', 'v == vertex_count? yes -- every vertex is coloured') }]);
  var L_UNDO = LN([{ n: 15, note: T('color_graph(v+1,k) mi? hayır -- daha derindeki dal başarısız', 'color_graph(v+1,k)? no -- the branch below failed') }, 16]);
  var L_FAIL = LN([{ n: 19, note: T('hiçbir renk c<=k için safe değildi', 'no colour c<=k was safe') }]);

  var EDGE_RE = /^([A-Za-z0-9]{1,3})-([A-Za-z0-9]{1,3})$/;
  function parseColoring(text) {
    var toks = String(text).trim().split(/\s+/).filter(Boolean);
    if (!toks.length) throw T('Metin boş: "k=3 A-B A-C ..." yazın.', 'The text is empty: write "k=3 A-B A-C ...".');
    var m0 = /^k=(\d+)$/i.exec(toks[0]);
    if (!m0) throw T('İlk sözcük "k=SAYI" biçiminde olmalı (renk sayısı).', 'The first word must look like "k=NUMBER" (the number of colours).');
    var k = parseInt(m0[1], 10);
    if (k < 1 || k > 6) throw T('Renk sayısı 1 ile 6 arasında olmalı.', 'The number of colours must be between 1 and 6.');
    toks = toks.slice(1);
    if (!toks.length) throw T('En az bir kenar yazın.', 'Write at least one edge.');
    var edges = [];
    for (var i = 0; i < toks.length; i++) {
      var m = EDGE_RE.exec(toks[i]);
      if (!m) throw T('"' + toks[i] + '" anlaşılmadı: yönsüz kenar VERTEX-VERTEX biçiminde olmalı.', '"' + toks[i] + '" is not understood: an undirected edge must look like VERTEX-VERTEX.');
      if (m[1] === m[2]) throw T('Öz-döngüler bu örnekte desteklenmiyor: "' + toks[i] + '".', 'Self-loops are not supported in this example: "' + toks[i] + '".');
      edges.push({ a: m[1], b: m[2] });
    }
    return { k: k, edges: edges };
  }
  function formatColoring(d) { return 'k=' + d.k + ' ' + d.edges.map(function (e) { return e.a + '-' + e.b; }).join(' '); }
  function verticesOf(edges) { var s = {}; edges.forEach(function (e) { s[e.a] = 1; s[e.b] = 1; }); return Object.keys(s).sort(); }
  function buildAdj(V, edges) {
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { adj[e.a].push(e.b); adj[e.b].push(e.a); });
    V.forEach(function (v) { adj[v].sort(); });
    return adj;
  }
  function layoutCircle(vertices) {
    var n = vertices.length, R = Math.max(140, 16 * n), cx = R + 46, cy = R + 46, pos = {};
    vertices.forEach(function (v, i) { var ang = -Math.PI / 2 + i * 2 * Math.PI / n; pos[v] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }; });
    return { pos: pos, cx: cx, cy: cy, R: R };
  }
  function label(i) { var s = '', n = i + 1; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }

  /** Independent computation: an ITERATIVE backtracking search with an explicit [vertex, lastTriedColour] frame
   *  stack (rather than build()'s true recursion) that stops at the FIRST valid full colouring, the same
   *  deterministic search order (alphabetical vertices, colours 1..k) so it is guaranteed to find the same one. */
  function colorRef(edges, k) {
    var vset = {}; edges.forEach(function (e) { vset[e.a] = 1; vset[e.b] = 1; });
    var V = Object.keys(vset).sort();
    var adj = {}; V.forEach(function (v) { adj[v] = []; });
    edges.forEach(function (e) { adj[e.a].push(e.b); adj[e.b].push(e.a); });
    V.forEach(function (v) { adj[v].sort(); });
    var n = V.length;
    var color = {}; V.forEach(function (v) { color[v] = 0; });
    function safe(v, c) { return !adj[v].some(function (nb) { return color[nb] === c; }); }
    var frames = new Array(n); frames[0] = { next: 1 };
    var depth = 0;
    while (depth >= 0) {
      if (depth === n) { var out = {}; V.forEach(function (v) { out[v] = color[v]; }); return { solvable: true, coloring: out }; }
      var v = V[depth], frame = frames[depth], placed = false;
      for (var c = frame.next; c <= k; c++) {
        if (safe(v, c)) { color[v] = c; frame.next = c + 1; placed = true; depth++; frames[depth] = { next: 1 }; break; }
      }
      if (!placed) { color[v] = 0; depth--; }
    }
    return { solvable: false, coloring: null };
  }

  D.define({
    id: 'backtracking-graph-coloring',
    title: T('Geri izleme (backtracking): çizge boyama', 'Backtracking: graph colouring'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('6 düğüm, 10 kenar, k=3 renkle çözülür', '6 vertices, 10 edges, solvable with k=3 colours'),
        data: { k: 3, edges: [
          { a: 'A', b: 'B' }, { a: 'A', b: 'C' }, { a: 'B', b: 'C' }, { a: 'B', b: 'D' }, { a: 'C', b: 'D' },
          { a: 'C', b: 'E' }, { a: 'D', b: 'E' }, { a: 'D', b: 'F' }, { a: 'E', b: 'F' }, { a: 'A', b: 'F' }
        ] } },
      { id: 'hard', level: 'hard', name: T('7 düğüm, 12 kenar, k=3, epeyce geri izleme gerekir', '7 vertices, 12 edges, k=3, needs a fair amount of backtracking'),
        data: { k: 3, edges: [
          { a: 'A', b: 'B' }, { a: 'A', b: 'C' }, { a: 'A', b: 'E' }, { a: 'A', b: 'G' }, { a: 'B', b: 'C' },
          { a: 'B', b: 'E' }, { a: 'B', b: 'F' }, { a: 'C', b: 'D' }, { a: 'C', b: 'F' }, { a: 'D', b: 'E' },
          { a: 'E', b: 'F' }, { a: 'F', b: 'G' }
        ] } },
      { id: 'impossible', level: 'edge', name: T('Uç: K4 (4 düğüm birbirine bağlı) k=3 ile ÇÖZÜLEMEZ (10 kenar)', 'Edge case: K4 (4 mutually connected vertices) is UNSOLVABLE with k=3 (10 edges)'),
        data: { k: 3, edges: [
          { a: 'A', b: 'B' }, { a: 'A', b: 'C' }, { a: 'A', b: 'D' }, { a: 'B', b: 'C' }, { a: 'B', b: 'D' }, { a: 'C', b: 'D' },
          { a: 'D', b: 'E' }, { a: 'E', b: 'F' }, { a: 'F', b: 'D' }, { a: 'E', b: 'A' }
        ] } },
      { id: 'trivial', level: 'edge', name: T('Uç: 2 düğüm, 1 kenar, k=2 (en az gereken)', 'Edge case: 2 vertices, 1 edge, k=2 (the minimum needed)'),
        data: { k: 2, edges: [{ a: 'A', b: 'B' }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.edges.length; },
    reference: function (d) { return colorRef(d.edges, d.k); },
    random: function (level, r) {
      var n = { easy: 5, normal: 6, hard: 7, extreme: 8 }[level] || 6;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var m = { easy: 10, normal: 11, hard: 13, extreme: 15 }[level] || 11;
      var k = D.randInt(r, 2, 4);
      var edges = [], seen = {}, guard = 0;
      while (edges.length < m && guard < 1000) {
        guard++;
        var i1 = D.randInt(r, 0, n - 1), j1 = D.randInt(r, 0, n - 1);
        if (i1 === j1) continue;
        var key = [vertices[i1], vertices[j1]].sort().join('|');
        if (seen[key]) continue;
        edges.push({ a: vertices[i1], b: vertices[j1] }); seen[key] = 1;
      }
      return { k: k, edges: edges };
    },
    input: {
      hint: T('Örnek: k=3 A-B A-C B-C   (ilk sözcük "k=SAYI", sonra yönsüz kenarlar)', 'Example: k=3 A-B A-C B-C   (first word "k=NUMBER", then undirected edges)'),
      parse: parseColoring,
      format: formatColoring,
      bad: ['', 'A-B', 'k=0 A-B', 'k=7 A-B', 'k=3 A-A']
    },
    build: function (S, d) {
      var edges = d.edges, k = d.k, V = verticesOf(edges), adj = buildAdj(V, edges);
      var lay = layoutCircle(V), pos = lay.pos, cx = lay.cx, cy = lay.cy, R = lay.R;
      V.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: 'empty' }); });
      var eseen = {};
      edges.forEach(function (e, idx) {
        var key = [e.a, e.b].sort().join('|'), kk = eseen[key] === undefined ? 0 : eseen[key] + 1; eseen[key] = kk;
        S.arrow('e' + idx, { from: 'n' + e.a, to: 'n' + e.b, kind: 'center', head: false, bend: kk ? 20 * kk : 0, style: 'dim' });
      });

      var idxOf = {}; V.forEach(function (v, i) { idxOf[v] = i; });
      var ROWX0 = 40, STEP = 44, CW = 36, CH = 36;
      var COLY = cy + R + 66;
      S.label('collbl', { x: ROWX0 - 14, y: COLY + 24, text: T('renk[] =', 'color[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('col' + i, { x: ROWX0 + i * STEP, y: COLY, w: CW, h: CH, text: '0', style: 'empty', size: 15, above: v }); });
      var COLORNAME = ['-', T('kırmızı', 'red'), T('mavi', 'blue'), T('yeşil', 'green'), T('sarı', 'yellow'), T('mor', 'purple'), T('turuncu', 'orange')];
      var STYLE_FOR_C = ['empty', 'del', 'active', 'new', 'hl', 'normal', 'dim'];

      var color = {}; V.forEach(function (v) { color[v] = 0; });
      function edgeIdBetween(u, v) { for (var ei = 0; ei < edges.length; ei++) { var e = edges[ei]; if ((e.a === u && e.b === v) || (e.a === v && e.b === u)) return ei; } return -1; }
      function setColor(v, c) { color[v] = c; S.set('col' + idxOf[v], { text: String(c), style: c === 0 ? 'empty' : STYLE_FOR_C[c] }); S.set('n' + v, { style: c === 0 ? 'empty' : STYLE_FOR_C[c] }); }
      function safe(v, c) { return !adj[v].some(function (n) { return color[n] === c; }); }

      S.step(T('GERİ İZLEME: her düğüme alfabetik sırayla 1..' + k + ' renklerinden biri denenir. Komşuda aynı renk varsa denenmez. Hiçbiri olmuyorsa, önceki düğüme dönüp BAŞKA bir renk denenir.',
               'BACKTRACKING: every vertex, in alphabetical order, is tried with one of the colours 1..' + k + '. A colour that a neighbour already has is skipped. If none works, we go back to the previous vertex and try ANOTHER colour.'), L_TRY);

      var steps = 0, MAXSTEPS = 400;
      function colorFrom(vi) {
        if (steps++ > MAXSTEPS) return true; /* safety valve, never hit in the shipped presets/random data */
        if (vi === V.length) { S.step(T('Bütün düğümler renklendi: başarı!', 'Every vertex is coloured: success!'), L_SUCCESS); return true; }
        var v = V[vi];
        for (var c = 1; c <= k; c++) {
          if (safe(v, c)) {
            setColor(v, c);
            S.step(T('`' + v + '`\'ye renk ' + c + ' (' + COLORNAME[c].tr + ') denenir: hiçbir komşuda çakışma yok.', 'Trying colour ' + c + ' (' + COLORNAME[c].en + ') on `' + v + '`: no neighbour conflicts.'), L_PLACE);
            if (colorFrom(vi + 1)) return true;
            S.step(T('`' + (vi + 1 < V.length ? V[vi + 1] : '') + '` için hiçbir renk işe yaramadı -- GERİ İZLE: `' + v + '`\'nin rengi geri alınır.', 'No colour worked for `' + (vi + 1 < V.length ? V[vi + 1] : '') + '` -- BACKTRACK: `' + v + '`\'s colour is undone.'), L_UNDO);
            setColor(v, 0);
          } else {
            var conflictV = adj[v].filter(function (n) { return color[n] === c; })[0];
            var eid = edgeIdBetween(v, conflictV); if (eid >= 0) { S.set('e' + eid, { style: 'del' }); }
            S.step(T('Renk ' + c + ' (' + COLORNAME[c].tr + ') `' + v + '` için olmuyor: komşu `' + conflictV + '` zaten bu renkte.', 'Colour ' + c + ' (' + COLORNAME[c].en + ') does not work for `' + v + '`: neighbour `' + conflictV + '` already has it.'), L_CONFLICT);
            if (eid >= 0) S.set('e' + eid, { style: 'dim' });
          }
        }
        S.step(T('`' + v + '` için ' + k + ' rengin hiçbiri işe yaramadı: bu dal başarısız, bir üst düğüme geri izlenecek.', 'None of the ' + k + ' colours worked for `' + v + '`: this branch fails, we backtrack to the vertex before it.'), L_FAIL);
        return false;
      }
      var solvable = colorFrom(0);
      var out = null;
      if (solvable) { out = {}; V.forEach(function (v) { out[v] = color[v]; }); }
      else S.step(T(k + ' renkle bu çizge boyanamaz -- kanıtlanmış: her olasılık denendi.', 'This graph cannot be coloured with ' + k + ' colours -- proven: every possibility was tried.'));
      S.result = { solvable: solvable, coloring: out };
      S.step(T('Bitti. ' + (solvable ? 'Boyama: ' + V.map(function (v) { return v + '=' + color[v]; }).join(', ') + '.' : k + ' renk yetmiyor.'),
               'Done. ' + (solvable ? 'Colouring: ' + V.map(function (v) { return v + '=' + color[v]; }).join(', ') + '.' : k + ' colours are not enough.')));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
