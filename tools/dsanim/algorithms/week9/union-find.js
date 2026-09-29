/* Week 9 -- disjoint-set union-find with UNION BY RANK and PATH COMPRESSION. Elements sit in a ring, as in week 5's
 * circle layout; a non-root element has an arrow to its current parent, a root has none. Input is a sequence of
 * operations: "A-B" unions the sets containing A and B; "find:A" finds A's root and shows path compression. */
(function (D) {
  'use strict';
  var T = D.T;

  var C_CODE = [
    '#define MAX_V 32',
    'int parent_of[MAX_V], rank_of[MAX_V];',
    '',
    'void make_set(int v) { parent_of[v] = v; rank_of[v] = 0; }',
    '',
    'int find(int v) {',
    '    int root = v;',
    '    while (parent_of[root] != root) root = parent_of[root];  /* walk up to the root */',
    '    while (parent_of[v] != root) {           /* path compression: relink every node on the way */',
    '        int next = parent_of[v];',
    '        parent_of[v] = root;',
    '        v = next;',
    '    }',
    '    return root;',
    '}',
    '',
    'void union_sets(int a, int b) {',
    '    int ra = find(a), rb = find(b);',
    '    if (ra == rb) return;                    /* already in the same set */',
    '    if (rank_of[ra] < rank_of[rb]) {          /* union by rank: shorter tree hangs under the taller one */',
    '        parent_of[ra] = rb;',
    '    } else if (rank_of[ra] > rank_of[rb]) {',
    '        parent_of[rb] = ra;',
    '    } else {',
    '        parent_of[rb] = ra;',
    '        rank_of[ra]++;',
    '    }',
    '}'
  ];
  var JAVA_CODE = [
    'static final int MAX_V = 32;',
    'int[] parentOf = new int[MAX_V], rankOf = new int[MAX_V];',
    '',
    'void makeSet(int v) { parentOf[v] = v; rankOf[v] = 0; }',
    '',
    'int find(int v) {',
    '    int root = v;',
    '    while (parentOf[root] != root) root = parentOf[root];  // walk up to the root',
    '    while (parentOf[v] != root) {            // path compression: relink every node on the way',
    '        int next = parentOf[v];',
    '        parentOf[v] = root;',
    '        v = next;',
    '    }',
    '    return root;',
    '}',
    '',
    'void unionSets(int a, int b) {',
    '    int ra = find(a), rb = find(b);',
    '    if (ra == rb) return;                    // already in the same set',
    '    if (rankOf[ra] < rankOf[rb]) {            // union by rank: shorter tree hangs under the taller one',
    '        parentOf[ra] = rb;',
    '    } else if (rankOf[ra] > rankOf[rb]) {',
    '        parentOf[rb] = ra;',
    '    } else {',
    '        parentOf[rb] = ra;',
    '        rankOf[ra]++;',
    '    }',
    '}'
  ];
  /* Positions (1-indexed, C_CODE/JAVA_CODE mirror line-for-line): 7=root=v, 8=while(parent[root]!=root)
   * [COND, walk to the root], 9=while(parent[v]!=root) [COND, path-compression loop], 10-12=its body,
   * 18=ra=find(a), rb=find(b), 19=if(ra==rb) [COND], 20=if(rank[ra]<rank[rb]) [COND], 21=LOWER's body,
   * 22=else if(rank[ra]>rank[rb]) [COND], 23=HIGHER's body, 25-26=the tie body. Earlier versions attached
   * the "rank(a) < rank(b)" note to line 19 (the ra==rb check) instead of line 20 (the real rank
   * comparison), and reused the SAME "no compression" lines for two different moments (v already at the
   * root vs. a one-hop path where the compression loop's OWN condition is false) -- both fixed below. */
  function LN(arr) { return { c: arr, java: arr }; }
  var L_MAKESET = { c: [4], java: [4] };
  var L_WALK = LN([7, { n: 8, note: T('parent[root] != root mi? evet -- köke doğru yürünür', 'parent[root] != root? yes -- walks up towards the root') }]);
  var L_ALREADYROOT = LN([7, { n: 8, note: T('parent[root] != root mi? hayır -- zaten kök', 'parent[root] != root? no -- already the root') }]);
  var L_COMPRESS = LN([{ n: 9, note: T('parent[v] != root mi? evet -- yoldaki düğüm yeniden bağlanır', 'parent[v] != root? yes -- relink this node on the way') }, 10, 11, 12]);
  var L_NOCOMPRESS = LN([{ n: 9, note: T('parent[v] != root mi? hayır -- zaten köke bakıyor', 'parent[v] != root? no -- already points at the root') }]);
  var NOTE_NOTSAME = T('ra == rb mi? hayır', 'ra == rb? no');
  var L_SAME = LN([{ n: 19, note: T('ra == rb mi? evet -- yapılacak bir şey yok', 'ra == rb? yes -- nothing to do') }]);
  var L_LOWER = LN([{ n: 19, note: NOTE_NOTSAME }, { n: 20, note: T('rank[ra] < rank[rb] mi? evet', 'rank[ra] < rank[rb]? yes') }, 21]);
  var L_HIGHER = LN([{ n: 19, note: NOTE_NOTSAME }, { n: 20, note: T('rank[ra] < rank[rb] mi? hayır', 'rank[ra] < rank[rb]? no') }, { n: 22, note: T('rank[ra] > rank[rb] mi? evet', 'rank[ra] > rank[rb]? yes') }, 23]);
  var L_TIE = LN([{ n: 19, note: NOTE_NOTSAME }, { n: 20, note: T('rank[ra] < rank[rb] mi? hayır', 'rank[ra] < rank[rb]? no') }, { n: 22, note: T('rank[ra] > rank[rb] mi? hayır -- eşit', 'rank[ra] > rank[rb]? no -- equal') }, 25, 26]);

  var UNION_RE = /^([A-Za-z0-9]{1,3})-([A-Za-z0-9]{1,3})$/;
  var FIND_RE = /^find:([A-Za-z0-9]{1,3})$/i;
  function parseOps(text) {
    var toks = String(text).trim().split(/\s+/).filter(Boolean);
    if (!toks.length) throw T('En az bir işlem yazın: A-B (union) ya da find:A.', 'Write at least one operation: A-B (union) or find:A.');
    var ops = [];
    for (var i = 0; i < toks.length; i++) {
      var tok = toks[i], mu = UNION_RE.exec(tok), mf = FIND_RE.exec(tok);
      if (mu) { if (mu[1] === mu[2]) throw T('Bir öğe kendisiyle birleştirilemez: "' + tok + '".', 'An element cannot be unioned with itself: "' + tok + '".'); ops.push({ op: 'union', a: mu[1], b: mu[2] }); }
      else if (mf) ops.push({ op: 'find', a: mf[1] });
      else throw T('"' + tok + '" anlaşılmadı: A-B (union) ya da find:A yazın.', '"' + tok + '" is not understood: write A-B (union) or find:A.');
    }
    return { ops: ops };
  }
  function formatOps(d) { return d.ops.map(function (o) { return o.op === 'union' ? (o.a + '-' + o.b) : ('find:' + o.a); }).join(' '); }
  function verticesOf(ops) { var s = {}; ops.forEach(function (o) { s[o.a] = 1; if (o.b) s[o.b] = 1; }); return Object.keys(s).sort(); }
  function layoutCircle(vertices) {
    var n = vertices.length, R = Math.max(140, 16 * n), cx = R + 46, cy = R + 46, pos = {};
    vertices.forEach(function (v, i) { var ang = -Math.PI / 2 + i * 2 * Math.PI / n; pos[v] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }; });
    return { pos: pos, cx: cx, cy: cy, R: R };
  }
  function label(i) { var s = '', n = i + 1; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }

  /** Independent computation: a RECURSIVE find (root-then-compress-on-the-way-back, rather than build()'s two
   *  walks) with the same union-by-rank tie-break, run over the same op sequence. Only final roots are checked --
   *  invariant under any correct path-compression strategy. */
  function runOpsRecursive(ops) {
    var vset = {}; ops.forEach(function (o) { vset[o.a] = 1; if (o.b) vset[o.b] = 1; });
    var V = Object.keys(vset).sort();
    var parent = {}, rank = {};
    V.forEach(function (v) { parent[v] = v; rank[v] = 0; });
    function find(v) { if (parent[v] === v) return v; var r = find(parent[v]); parent[v] = r; return r; }
    ops.forEach(function (o) {
      if (o.op === 'find') { find(o.a); return; }
      var ra = find(o.a), rb = find(o.b);
      if (ra === rb) return;
      if (rank[ra] < rank[rb]) parent[ra] = rb;
      else if (rank[ra] > rank[rb]) parent[rb] = ra;
      else { parent[rb] = ra; rank[ra]++; }
    });
    var root = {}; V.forEach(function (v) { root[v] = find(v); });
    return { root: root };
  }

  D.define({
    id: 'union-find',
    title: T('Ayrık küme (union-find): rütbeye göre birleştirme + yol sıkıştırma', 'Disjoint-set union-find: union by rank + path compression'),
    code: { c: C_CODE, java: JAVA_CODE },
    presets: [
      { id: 'normal', level: 'normal', name: T('8 öğe, rütbe-1 ağaçları birleştirip derin bir zincir kurar, sonra find ile düzleştirir (11 işlem)',
                                                 '8 elements, merges two rank-1 trees into a deeper chain, then flattens it with find (11 ops)'),
        data: { ops: [
          { op: 'union', a: 'A', b: 'B' }, { op: 'union', a: 'C', b: 'D' }, { op: 'union', a: 'A', b: 'C' },
          { op: 'union', a: 'E', b: 'F' }, { op: 'union', a: 'G', b: 'H' }, { op: 'union', a: 'E', b: 'G' },
          { op: 'find', a: 'D' }, { op: 'union', a: 'A', b: 'E' }, { op: 'find', a: 'D' },
          { op: 'find', a: 'H' }, { op: 'union', a: 'B', b: 'H' }
        ] } },
      { id: 'hard', level: 'hard', name: T('10 öğe, iç içe birleşmeler ve zaten-aynı-kümede birleşmeler (15 işlem)',
                                            '10 elements, nested merges and some already-same-set unions (15 ops)'),
        data: { ops: [
          { op: 'union', a: 'A', b: 'B' }, { op: 'union', a: 'C', b: 'D' }, { op: 'union', a: 'E', b: 'F' },
          { op: 'union', a: 'G', b: 'H' }, { op: 'union', a: 'A', b: 'C' }, { op: 'union', a: 'E', b: 'G' },
          { op: 'find', a: 'F' }, { op: 'union', a: 'I', b: 'J' }, { op: 'union', a: 'A', b: 'E' },
          { op: 'union', a: 'B', b: 'D' }, { op: 'find', a: 'H' }, { op: 'union', a: 'A', b: 'I' },
          { op: 'find', a: 'J' }, { op: 'union', a: 'C', b: 'F' }, { op: 'find', a: 'B' }
        ] } },
      { id: 'no-op-union', level: 'edge', name: T('Uç: aynı kümeyi tekrar tekrar birleştirmeye çalışmak (10 işlem)', 'Edge case: repeatedly unioning the same set with itself (10 ops)'),
        data: { ops: [
          { op: 'union', a: 'A', b: 'B' }, { op: 'union', a: 'A', b: 'B' }, { op: 'union', a: 'B', b: 'A' },
          { op: 'union', a: 'C', b: 'D' }, { op: 'union', a: 'A', b: 'C' }, { op: 'union', a: 'D', b: 'B' },
          { op: 'union', a: 'A', b: 'D' }, { op: 'find', a: 'D' }, { op: 'union', a: 'C', b: 'A' },
          { op: 'find', a: 'B' }
        ] } },
      { id: 'single', level: 'edge', name: T('Uç: tek öğe, hiç birleşme yok, yalnızca find', 'Edge case: a single element, no unions, only a find'),
        data: { ops: [{ op: 'find', a: 'A' }] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.ops.length; },
    reference: function (d) { return runOpsRecursive(d.ops); },
    random: function (level, r) {
      var n = { easy: 6, normal: 8, hard: 10, extreme: 12 }[level] || 8;
      var vertices = []; for (var i = 0; i < n; i++) vertices.push(label(i));
      var m = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level] || 12;
      var ops = [];
      for (var k = 0; k < m; k++) {
        if (k > 2 && r() < 0.25) ops.push({ op: 'find', a: vertices[D.randInt(r, 0, n - 1)] });
        else {
          var i1 = D.randInt(r, 0, n - 1), j1 = D.randInt(r, 0, n - 1);
          while (j1 === i1) j1 = D.randInt(r, 0, n - 1);
          ops.push({ op: 'union', a: vertices[i1], b: vertices[j1] });
        }
      }
      return { ops: ops };
    },
    input: {
      hint: T('Örnek: A-B C-D A-C find:D   (A-B = union, find:A = find)', 'Example: A-B C-D A-C find:D   (A-B = union, find:A = find)'),
      parse: parseOps,
      format: formatOps,
      bad: ['', 'A-A', 'A>B', 'find:', 'A-B-C']
    },
    build: function (S, d) {
      var ops = d.ops, V = verticesOf(ops);
      var lay = layoutCircle(V), pos = lay.pos, cx = lay.cx, cy = lay.cy, R = lay.R;
      V.forEach(function (v) { S.circle('n' + v, { x: pos[v].x, y: pos[v].y, text: v, style: 'new' }); });

      var idxOf = {}; V.forEach(function (v, i) { idxOf[v] = i; });
      var ROWX0 = 40, STEP = 44, CW = 36, CH = 36;
      var PY = cy + R + 66, RY = PY + CH + 56;
      S.label('plbl', { x: ROWX0 - 14, y: PY + 24, text: T('ebeveyn[] =', 'parent[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('p' + i, { x: ROWX0 + i * STEP, y: PY, w: CW, h: CH, text: v, style: 'new', size: 15, above: v }); });
      S.label('rlbl', { x: ROWX0 - 14, y: RY + 24, text: T('rütbe[] =', 'rank[] ='), anchor: 'end', size: 14, mono: true });
      V.forEach(function (v, i) { S.box('r' + i, { x: ROWX0 + i * STEP, y: RY, w: CW, h: CH, text: '0', style: 'normal', size: 15 }); });

      var parent = {}, rank = {};
      V.forEach(function (v) { parent[v] = v; rank[v] = 0; });
      function refresh() {
        V.forEach(function (v, i) {
          S.set('p' + i, { text: parent[v] });
          S.set('r' + i, { text: String(rank[v]) });
          var isRoot = parent[v] === v;
          S.set('n' + v, { style: isRoot ? 'new' : 'normal' });
          if (isRoot) { if (S.has('a' + v)) S.remove('a' + v); }
          else { if (!S.has('a' + v)) S.arrow('a' + v, { from: 'n' + v, to: 'n' + parent[v], kind: 'center', head: true, style: 'dim' }); else S.set('a' + v, { to: 'n' + parent[v] }); }
        });
      }
      refresh();
      S.step(T('MAKE-SET: her öğe kendi kümesinin kökü olarak başlar: `parent[v] = v`, `rank[v] = 0`. Kök olan düğümler yeşil.',
               'MAKE-SET: every element starts as the root of its own set: `parent[v] = v`, `rank[v] = 0`. Root vertices are green.'), L_MAKESET);

      function rootOf(v) { var root = v; while (parent[root] !== root) root = parent[root]; return root; }

      ops.forEach(function (o) {
        if (o.op === 'find') {
          var v = o.a, root = rootOf(v);
          var path = []; var cur = v; while (cur !== root) { path.push(cur); cur = parent[cur]; }
          path.forEach(function (p) { S.set('n' + p, { style: 'active' }); });
          S.set('n' + root, { style: 'hl' });
          S.step(T('`find(' + v + ')` -- köke kadar yürünür: ' + (path.length ? path.join(' -> ') + ' -> ' : '') + root + '.',
                   '`find(' + v + ')` -- walks up to the root: ' + (path.length ? path.join(' -> ') + ' -> ' : '') + root + '.'), path.length ? L_WALK : L_ALREADYROOT);
          if (path.length > 1) {
            path.forEach(function (p) { parent[p] = root; });
            refresh();
            S.step(T('YOL SIKIŞTIRMA: yoldaki her düğüm (' + path.join(', ') + ') artık doğrudan köke (' + root + ') bakıyor -- bir sonraki find bu düğümlerden herhangi biri için O(1) olur.',
                     'PATH COMPRESSION: every node on the path (' + path.join(', ') + ') now points directly at the root (' + root + ') -- the next find from any of them is O(1).'), L_COMPRESS);
          } else if (path.length === 1) {
            S.step(T('Yol tek adımlık, sıkıştıracak bir şey yok: `parent[' + path[0] + ']` zaten kök.', 'The path is a single step, nothing to compress: `parent[' + path[0] + ']` is already the root.'), L_NOCOMPRESS);
          }
          V.forEach(function (p) { if (p !== root) S.set('n' + p, { style: 'normal' }); });
          S.set('n' + root, { style: 'new' });
          return;
        }
        var a = o.a, b = o.b;
        S.set('n' + a, { style: 'hl' }); S.set('n' + b, { style: 'hl' });
        var ra = rootOf(a), rb = rootOf(b);
        S.step(T('`union_sets(' + a + ', ' + b + ')` -- `find(' + a + ')` = `' + ra + '`, `find(' + b + ')` = `' + rb + '`.',
                 '`union_sets(' + a + ', ' + b + ')` -- `find(' + a + ')` = `' + ra + '`, `find(' + b + ')` = `' + rb + '`.'), L_WALK);
        if (ra === rb) {
          S.step(T('İkisi de zaten aynı kökte (`' + ra + '`) -- yapılacak bir şey yok.', 'Both are already in the same set (root `' + ra + '`) -- nothing to do.'), L_SAME);
        } else if (rank[ra] < rank[rb]) {
          parent[ra] = rb; refresh();
          S.step(T('`rank[' + ra + ']` (' + rank[ra] + ') < `rank[' + rb + ']` (' + rank[rb] + ') -- kısa ağaç (`' + ra + '`) uzun olanın (`' + rb + '`) altına asılır.',
                   '`rank[' + ra + ']` (' + rank[ra] + ') < `rank[' + rb + ']` (' + rank[rb] + ') -- the shorter tree (`' + ra + '`) hangs under the taller one (`' + rb + '`).'), L_LOWER);
        } else if (rank[ra] > rank[rb]) {
          parent[rb] = ra; refresh();
          S.step(T('`rank[' + ra + ']` (' + rank[ra] + ') > `rank[' + rb + ']` (' + rank[rb] + ') -- kısa ağaç (`' + rb + '`) uzun olanın (`' + ra + '`) altına asılır.',
                   '`rank[' + ra + ']` (' + rank[ra] + ') > `rank[' + rb + ']` (' + rank[rb] + ') -- the shorter tree (`' + rb + '`) hangs under the taller one (`' + ra + '`).'), L_HIGHER);
        } else {
          parent[rb] = ra; rank[ra]++; refresh();
          S.step(T('İki rütbe eşit (' + rank[ra] + '): `' + rb + '` `' + ra + '`\'nın altına asılır ve `rank[' + ra + ']` bire artar (' + rank[ra] + ').',
                   'The ranks are equal (' + (rank[ra] - 1) + '): `' + rb + '` hangs under `' + ra + '` and `rank[' + ra + ']` goes up by one (' + rank[ra] + ').'), L_TIE);
        }
        S.set('n' + a, { style: parent[a] === a ? 'new' : 'normal' }); S.set('n' + b, { style: parent[b] === b ? 'new' : 'normal' });
      });
      var root = {}; V.forEach(function (v) { root[v] = rootOf(v); });
      var groups = {}; V.forEach(function (v) { (groups[root[v]] = groups[root[v]] || []).push(v); });
      var summary = Object.keys(groups).sort().map(function (r) { return '{' + groups[r].join(',') + '}'; }).join(' ');
      S.result = { root: root };
      S.step(T('Bitti. Kümeler: ' + summary + '.', 'Done. Sets: ' + summary + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
