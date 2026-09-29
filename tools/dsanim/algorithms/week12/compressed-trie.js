/* Week 12 -- Strings: Structures and Algorithms
 * A compressed trie (also called a radix tree, or PATRICIA trie): unlike a plain trie, an edge can carry an
 * entire SUBSTRING, not just one character. A long chain of one-child nodes (like the C-A-R-D chain a plain
 * trie would need) collapses into a single edge labeled "CARD". Inserting a new word either (a) matches an
 * existing edge's label completely and descends past it, (b) shares no first letter with any existing edge and
 * becomes a brand-new leaf edge holding the whole remaining suffix, or (c) shares only a PARTIAL prefix with an
 * existing edge's label -- that edge is then SPLIT at the mismatch: a new branching node appears holding the
 * shared prefix, with the old edge's (shortened) remainder and the new word's remainder as its two children. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct RNode {',
    '    char *label;              /* edge INTO this node; root\'s label is "" */',
    '    bool isEnd;',
    '    struct RNode *child[26];  /* indexed by the first letter of each child edge */',
    '} RNode;',
    '',
    'int common_prefix_len(const char *a, const char *b) {',
    '    int j = 0;',
    '    while (a[j] && b[j] && a[j] == b[j]) j++;',
    '    return j;',
    '}',
    '',
    'void insert(RNode *node, const char *word) {',
    '    int i = 0;',
    '    while (word[i] != \'\\0\') {',
    '        int c = word[i] - \'A\';',
    '        if (node->child[c] == NULL) {',
    '            node->child[c] = new_leaf(word + i);   /* whole remaining suffix */',
    '            return;',
    '        }',
    '        RNode *child = node->child[c];',
    '        int j = common_prefix_len(word + i, child->label);',
    '        if (j == (int) strlen(child->label)) {      /* whole edge matches: descend */',
    '            node = child; i += j;',
    '            if (word[i] == \'\\0\') { node->isEnd = true; return; }',
    '            continue;',
    '        }',
    '        RNode *mid = split_edge(node, child, j);    /* new node at the mismatch */',
    '        if (word[i + j] == \'\\0\') { mid->isEnd = true; return; }',
    '        mid->child[word[i + j] - \'A\'] = new_leaf(word + i + j);',
    '        return;',
    '    }',
    '}',
    '',
    'bool search(RNode *root, const char *word, bool *isPrefix) {',
    '    RNode *node = root;',
    '    int i = 0;',
    '    while (word[i] != \'\\0\') {',
    '        int c = word[i] - \'A\';',
    '        if (node->child[c] == NULL) { *isPrefix = false; return false; }',
    '        RNode *child = node->child[c];',
    '        int j = common_prefix_len(word + i, child->label);',
    '        if (j < (int) strlen(child->label)) {',
    '            *isPrefix = (word[i + j] == \'\\0\');',
    '            return false;',
    '        }',
    '        node = child; i += j;',
    '    }',
    '    *isPrefix = true;',
    '    return node->isEnd;',
    '}'
  ];
  var JAVA = [
    'static class RNode {',
    '    String label;              // edge INTO this node; root\'s label is ""',
    '    boolean isEnd;',
    '    Map<Character, RNode> child = new HashMap<>();',
    '}',
    '',
    'static int commonPrefixLen(String a, String b) {',
    '    int j = 0;',
    '    while (j < a.length() && j < b.length() && a.charAt(j) == b.charAt(j)) j++;',
    '    return j;',
    '}',
    '',
    'void insert(RNode node, String word) {',
    '    int i = 0;',
    '    while (i < word.length()) {',
    '        char c = word.charAt(i);',
    '        if (!node.child.containsKey(c)) {',
    '            node.child.put(c, newLeaf(word.substring(i)));   // whole remaining suffix',
    '            return;',
    '        }',
    '        RNode child = node.child.get(c);',
    '        int j = commonPrefixLen(word.substring(i), child.label);',
    '        if (j == child.label.length()) {        // whole edge matches: descend',
    '            node = child; i += j;',
    '            if (i == word.length()) { node.isEnd = true; return; }',
    '            continue;',
    '        }',
    '        RNode mid = splitEdge(node, child, j);   // new node at the mismatch',
    '        if (i + j == word.length()) { mid.isEnd = true; return; }',
    '        mid.child.put(word.charAt(i + j), newLeaf(word.substring(i + j)));',
    '        return;',
    '    }',
    '}',
    '',
    'boolean search(RNode root, String word, boolean[] isPrefix) {',
    '    RNode node = root;',
    '    int i = 0;',
    '    while (i < word.length()) {',
    '        char c = word.charAt(i);',
    '        if (!node.child.containsKey(c)) { isPrefix[0] = false; return false; }',
    '        RNode child = node.child.get(c);',
    '        int j = commonPrefixLen(word.substring(i), child.label);',
    '        if (j < child.label.length()) {',
    '            isPrefix[0] = (i + j == word.length());',
    '            return false;',
    '        }',
    '        node = child; i += j;',
    '    }',
    '    isPrefix[0] = true;',
    '    return node.isEnd;',
    '}'
  ];

  function cpl(a, b) { var j = 0; while (j < a.length && j < b.length && a[j] === b[j]) j++; return j; }

  /** Independent radix tree: plain objects, its own insert/search loop -- shares no code with build(). */
  function refBuild(words) {
    var root = { children: {} };
    words.forEach(function (w) {
      var node = root, i = 0;
      while (i < w.length) {
        var c = w[i];
        if (!node.children[c]) { node.children[c] = { label: w.slice(i), end: true, children: {} }; i = w.length; break; }
        var child = node.children[c], j = cpl(w.slice(i), child.label);
        if (j === child.label.length) { node = child; i += j; if (i === w.length) node.end = true; continue; }
        var mid = { label: child.label.slice(0, j), end: false, children: {} };
        child.label = child.label.slice(j);
        mid.children[child.label[0]] = child;
        node.children[c] = mid;
        if (i + j === w.length) { mid.end = true; } else { mid.children[w[i + j]] = { label: w.slice(i + j), end: true, children: {} }; }
        i = w.length;
      }
    });
    return root;
  }
  function refSearch(root, w) {
    var node = root, i = 0;
    while (i < w.length) {
      var c = w[i];
      if (!node.children[c]) return { found: false, isPrefix: false };
      var child = node.children[c], j = cpl(w.slice(i), child.label);
      if (j < child.label.length) return { found: false, isPrefix: (i + j === w.length) };
      node = child; i += j;
    }
    return { found: !!node.end, isPrefix: true };
  }

  D.define({
    id: 'compressed-trie',
    title: T('Sıkıştırılmış trie (radix ağacı)', 'Compressed trie (radix tree)'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('TEST, TEA, TEAM: bir kenar ikiye bölünür', 'TEST, TEA, TEAM: one edge splits in two'),
        data: { ops: ['TEST', 'TEA', 'TEAM', { search: 'TEA' }, { search: 'TE' }, { search: 'TEAMS' }] } },
      { id: 'hard', level: 'hard', name: T('ROMAN aile sözcükleri: art arda birden çok bölünme', 'The ROMAN word family: several splits back to back'),
        data: { ops: ['ROMAN', 'ROMANE', 'ROMANUS', 'ROMULUS', { search: 'ROMAN' }, { search: 'ROM' }, { search: 'ROMANEQ' }, { search: 'ROMULUS' }] } },
      { id: 'no-compression', level: 'edge', name: T('Ortak önek yok: her sözcük tek bir uzun kenar', 'No shared prefix: every word is a single long edge'),
        data: { ops: ['APPLE', 'BANANA', { search: 'APPLE' }, { search: 'AP' }] } },
      { id: 'prefix-of-each-other', level: 'edge', name: T('CAR, CARPET, CARD: bir sözcük diğerinin öneki', 'CAR, CARPET, CARD: one word is a prefix of the others'),
        data: { ops: ['CAR', 'CARPET', 'CARD', { search: 'CAR' }, { search: 'CARP' }, { search: 'CARPET' }] } },
      { id: 'nested-split', level: 'edge', name: T('ANT, ARM, ART, AXE: iç içe bölünmeler', 'ANT, ARM, ART, AXE: splits nested inside splits'),
        data: { ops: ['ANT', 'ARM', 'ART', 'AXE', { search: 'ART' }, { search: 'AR' }, { search: 'ARK' }] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.ops.filter(function (o) { return typeof o === 'string'; }).reduce(function (s, w) { return s + w.length; }, 0); },
    reference: function (d) {
      var words = d.ops.filter(function (o) { return typeof o === 'string'; });
      var root = refBuild(words);
      var searchResults = d.ops.filter(function (o) { return typeof o !== 'string'; }).map(function (o) {
        var r = refSearch(root, o.search);
        return { word: o.search, found: r.found, isPrefix: r.isPrefix };
      });
      return { insertedWords: words.length, searchResults: searchResults };
    },
    random: function (level, r) {
      var alpha = level === 'easy' ? 2 : (level === 'normal' ? 3 : 4);
      var letters = 'ABCD'.slice(0, alpha);
      function word(len) { var s = ''; for (var i = 0; i < len; i++) s += letters[D.randInt(r, 0, alpha - 1)]; return s; }
      var ops = [], words = [], total = 0, wlen = level === 'extreme' ? [3, 7] : [3, 6];
      while (total < 11) { var w = word(D.randInt(r, wlen[0], wlen[1])); ops.push(w); words.push(w); total += w.length; }
      var s = D.randInt(r, 3, 4), i;
      for (i = 0; i < s; i++) ops.push({ search: r() < 0.5 ? words[D.randInt(r, 0, words.length - 1)] : word(D.randInt(r, 1, wlen[1])) });
      return { ops: ops };
    },
    input: {
      hint: T('Örnek: TEST TEA TEAM search=TEA search=TE  (sözcük = ekle, search=W = ara; yalnız A-Z)',
              'Example: TEST TEA TEAM search=TEA search=TE  (a word = insert, search=W = search; letters A-Z only)'),
      parse: function (text) {
        var ops = [];
        String(text).trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
          var sm = /^search[=:]([A-Za-z]+)$/i.exec(tok);
          if (sm) { ops.push({ search: sm[1].toUpperCase() }); return; }
          if (!/^[A-Za-z]+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: yalnız harf, ya da search=SÖZCÜK yazın.', '"' + tok + '" is not understood: use only letters, or search=WORD.');
          ops.push(tok.toUpperCase());
        });
        var insCount = ops.filter(function (o) { return typeof o === 'string'; }).length;
        if (insCount < 2) throw T('En az 2 sözcük eklemelisiniz.', 'Insert at least 2 words.');
        if (ops.length > 20) throw T('En çok 20 işlem.', 'At most 20 operations.');
        return { ops: ops };
      },
      format: function (d) { return d.ops.map(function (o) { return typeof o === 'string' ? o : ('search=' + o.search); }).join(' '); },
      bad: ['', 'TEST', 'TEST 4G', 'search=TEST', 'search=TEST search=TEA', 'TEST $$ TEA'],
      tokens: function (d) { return d.ops.map(function (o) { return typeof o === 'string' ? o : ('search:' + o.search); }); }
    },
    build: function (S, d) {
      var DX = 78, DY = 72, X0 = 110, Y0 = 90, R = 11;
      var seq = 0;
      var root = { id: 'root', label: '', end: false, children: {}, parent: null };
      function newNode(label, end) { return { id: 'n' + (seq++), label: label, end: !!end, children: {}, parent: null }; }
      function relayout() {
        var leaf = 0, maxLevel = 0;
        (function place(n, level) {
          n.level = level; maxLevel = Math.max(maxLevel, level);
          var keys = Object.keys(n.children).sort();
          if (!keys.length) { n.slot = leaf++; return; }
          keys.forEach(function (k) { place(n.children[k], level + 1); });
          var xs = keys.map(function (k) { return n.children[k].slot; });
          n.slot = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
        })(root, 0);
        return { leaf: leaf, maxLevel: maxLevel };
      }
      function cx(n) { return X0 + n.slot * DX; }
      function cy(n) { return Y0 + n.level * DY; }
      function draw(n) {
        var id = 'c' + n.id, x = cx(n), y = cy(n);
        if (!S.has(id)) S.circle(id, { x: x, y: y, r: n.id === 'root' ? 15 : R, text: n.id === 'root' ? T('kök', 'root') : '', size: 11, style: n.id === 'root' ? 'normal' : 'new' });
        else S.move(id, x, y);
        if (n.end) {
          var eid = 'end' + n.id;
          if (!S.has(eid)) S.label(eid, { x: x + (n.id === 'root' ? 15 : R) + 4, y: y - (n.id === 'root' ? 15 : R) - 2, text: T('son', 'end'), size: 10, style: 'dim', anchor: 'start' });
          else S.move(eid, x + (n.id === 'root' ? 15 : R) + 4, y - (n.id === 'root' ? 15 : R) - 2);
        }
        if (n.parent) {
          var aid = 'a' + n.id;
          if (!S.has(aid)) S.arrow(aid, { from: 'c' + n.parent.id, to: id, kind: 'center', style: 'normal', text: n.label, head: false });
          else S.set(aid, { from: 'c' + n.parent.id, to: id, text: n.label });
        }
        Object.keys(n.children).forEach(function (k) { draw(n.children[k]); });
      }
      function redrawAll() { relayout(); draw(root); }
      var RXfinal = 0; // widened after we know the shape; recompute label as we go
      S.label('dec', { x: X0, y: 40, text: '', size: 15, bold: true });
      S.label('dec2', { x: X0, y: 62, text: '', size: 12, style: 'dim' });
      redrawAll();
      S.step(T('Boş bir sıkıştırılmış trie: yalnız kök var. Her kenar bir alt DİZGİ taşıyacak, tek bir harf değil.',
               'An empty compressed trie: only the root exists. Every edge will carry a SUBSTRING, not just one letter.'),
             { c: [1, 2, 3, 4, 5], java: [1, 2, 3, 4] });

      d.ops.forEach(function (op, k) {
        S.at(k);
        if (typeof op === 'string') {
          var word = op, node = root, i = 0, done = false;
          S.set('dec', { text: 'insert(' + word + ')', style: 'active' }); S.set('dec2', { text: '' });
          S.step(T('`insert("' + word + '")` -- köke gideriz.', '`insert("' + word + '")` -- we start at the root.'), { c: [13, 14], java: [13, 14] });
          while (i < word.length && !done) {
            var c = word[i];
            if (!node.children[c]) {
              var leaf = newNode(word.slice(i), true);
              leaf.parent = node; node.children[c] = leaf;
              redrawAll();
              S.set('c' + leaf.id, { style: 'new' });
              S.step(T('`' + c + '\'` ile başlayan kenar yok -- kalan "' + word.slice(i) + '" tamamı yeni bir yaprak kenar olur. Bitti.', 'no edge starts with `\'' + c + '\'` -- the whole remaining "' + word.slice(i) + '" becomes a new leaf edge. Done.'),
                     { c: [16, { n: 17, note: T('child[c] == NULL? evet', 'child[c] == NULL? yes') }, 18, 19], java: [16, { n: 17, note: T('yok mu? evet', 'missing? yes') }, 18, 19] });
              S.set('c' + leaf.id, { style: 'normal' });
              done = true; break;
            }
            var child = node.children[c], j = cpl(word.slice(i), child.label);
            S.set('a' + child.id, { style: 'active' });
            if (j === child.label.length) {
              S.step(T('`' + child.label + '`" kenarı tamamen eşleşiyor (ortak önek uzunluğu ' + j + ') -- aşağı ineriz.', 'edge "' + child.label + '" matches completely (common-prefix length ' + j + ') -- we descend.'),
                     { c: [21, 22, { n: 23, note: T('tam eşleşme mi? evet', 'full match? yes') }, 24], java: [21, 22, { n: 23, note: T('tam eşleşme mi? evet', 'full match? yes') }, 24] });
              S.set('a' + child.id, { style: 'normal' });
              node = child; i += j;
              if (i === word.length) {
                node.end = true;
                S.set('c' + node.id, { style: 'new' });
                redrawAll();
                S.step(T('Sözcük tam burada bitiyor -- düğüm `isEnd = true` işaretlenir.', 'The word ends exactly here -- the node is marked `isEnd = true`.'), { c: 25, java: 25 });
                S.set('c' + node.id, { style: 'normal' });
                done = true;
              }
              continue;
            }
            var mid = newNode(child.label.slice(0, j), false);
            mid.parent = node;
            child.label = child.label.slice(j);
            child.parent = mid;
            mid.children[child.label[0]] = child;
            node.children[c] = mid;
            redrawAll();
            S.set('c' + mid.id, { style: 'hl' });
            S.step(T('Ortak önek yalnız "' + mid.label + '" (uzunluk ' + j + '), kenar etiketinden kısa -- kenar burada BÖLÜNÜR: yeni bir dallanma düğümü oluşur.', 'The common prefix is only "' + mid.label + '" (length ' + j + '), shorter than the edge label -- the edge is SPLIT here: a new branching node appears.'),
                   { c: [21, 22, { n: 23, note: T('tam eşleşme mi? hayır', 'full match? no') }, 28], java: [21, 22, { n: 23, note: T('tam eşleşme mi? hayır', 'full match? no') }, 28] });
            S.set('c' + mid.id, { style: 'normal' });
            if (i + j === word.length) {
              mid.end = true;
              S.set('c' + mid.id, { style: 'new' });
              redrawAll();
              S.step(T('Eklenen sözcük tam bölünme noktasında bitiyor -- yeni düğüm `isEnd = true` olur.', 'The inserted word ends exactly at the split point -- the new node becomes `isEnd = true`.'), { c: 29, java: 29 });
              S.set('c' + mid.id, { style: 'normal' });
            } else {
              var leaf2 = newNode(word.slice(i + j), true);
              leaf2.parent = mid; mid.children[word[i + j]] = leaf2;
              redrawAll();
              S.set('c' + leaf2.id, { style: 'new' });
              S.step(T('Kalan "' + word.slice(i + j) + '" bölünme noktasından yeni bir yaprak kenar olur.', 'The remaining "' + word.slice(i + j) + '" becomes a new leaf edge from the split point.'), { c: [30, 31], java: [30, 31] });
              S.set('c' + leaf2.id, { style: 'normal' });
            }
            done = true;
          }
        } else {
          var q = op.search, qnode = root, qi = 0, found = false, isPrefix = false, broke = false;
          S.set('dec', { text: 'search(' + q + ')', style: 'active' }); S.set('dec2', { text: '' });
          S.step(T('`search("' + q + '")` -- köke gideriz.', '`search("' + q + '")` -- we start at the root.'), { c: [35, 36], java: [35, 36] });
          while (qi < q.length) {
            var qc = q[qi];
            if (!qnode.children[qc]) {
              S.set('dec2', { text: T('kenar yok', 'no such edge'), style: 'del' });
              S.step(T('`' + qc + '\'` ile başlayan kenar yok -- **bulunamadı**, **önek de değil**.', 'no edge starts with `\'' + qc + '\'` -- **not found**, **not a prefix** either.'),
                     { c: [39, { n: 40, note: T('yok mu? evet', 'missing? yes') }], java: [39, { n: 40, note: T('yok mu? evet', 'missing? yes') }] });
              broke = true; break;
            }
            var qchild = qnode.children[qc], qj = cpl(q.slice(qi), qchild.label);
            S.set('a' + qchild.id, { style: 'hl' });
            if (qj < qchild.label.length) {
              isPrefix = (qi + qj === q.length);
              S.set('dec2', { text: isPrefix ? T('etiketin içinde biter -- yalnız önek', 'ends inside the label -- only a prefix') : T('etiketin ortasında ayrılır', 'diverges inside the label'), style: 'del' });
              S.step(T('"' + q + '" kenar "' + qchild.label + '" içinde ' + (isPrefix ? 'tam eşleşmeden biter -- yalnız bir **önek**.' : 'ayrılıyor -- **bulunamadı**.'), '"' + q + '" ' + (isPrefix ? 'ends inside edge "' + qchild.label + '" without matching all of it -- only a **prefix**.' : 'diverges inside edge "' + qchild.label + '" -- **not found**.')),
                     { c: [41, 42, { n: 43, note: T('tamamı mı? hayır', 'all of it? no') }, 44, 45], java: [41, 42, { n: 43, note: T('tamamı mı? hayır', 'all of it? no') }, 44, 45] });
              S.set('a' + qchild.id, { style: 'normal' });
              broke = true; break;
            }
            S.step(T('edge "' + qchild.label + '" tamamen eşleşiyor -- devam ederiz.', 'edge "' + qchild.label + '" matches completely -- we continue.'),
                   { c: [41, 42, { n: 43, note: T('tamamı mı? evet', 'all of it? yes') }, 47], java: [41, 42, { n: 43, note: T('tamamı mı? evet', 'all of it? yes') }, 47] });
            S.set('a' + qchild.id, { style: 'normal' });
            qnode = qchild; qi += qj;
          }
          if (!broke) {
            found = !!qnode.end; isPrefix = true;
            S.set('c' + qnode.id, { style: found ? 'new' : 'active' });
            S.set('dec2', { text: found ? T('tam sözcük -- bulundu', 'a complete word -- found') : T('önek, ama tam sözcük değil', 'a prefix, but not a full word'), style: found ? 'new' : 'active' });
            S.step(found
              ? T('Tüm kenarlar tükendi VE düğüm `isEnd` -- "' + q + '" **bulundu**.', 'Every edge was consumed AND the node is `isEnd` -- "' + q + '" is **found**.')
              : T('Tüm kenarlar tükendi ama düğüm `isEnd` değil -- "' + q + '" bir **önek**, tam sözcük değil.', 'Every edge was consumed but the node is not `isEnd` -- "' + q + '" is a **prefix**, not a full word.'),
              { c: [49, 50], java: [49, 50] });
            S.set('c' + qnode.id, { style: 'normal' });
          }
        }
      });

      S.at(null); S.set('dec', { text: '', style: 'normal' }); S.set('dec2', { text: '' });
      var words = d.ops.filter(function (o) { return typeof o === 'string'; });
      var searchResults = d.ops.filter(function (o) { return typeof o !== 'string'; }).map(function (o) {
        var node = root, i2 = 0, ok = true, foundEnd = false, pfx = false;
        while (i2 < o.search.length && ok) {
          var cc = o.search[i2];
          if (!node.children[cc]) { ok = false; pfx = false; break; }
          var ch = node.children[cc], jj = cpl(o.search.slice(i2), ch.label);
          if (jj < ch.label.length) { ok = false; pfx = (i2 + jj === o.search.length); break; }
          node = ch; i2 += jj;
        }
        if (ok) { foundEnd = !!node.end; pfx = true; }
        return { word: o.search, found: ok && foundEnd, isPrefix: pfx };
      });
      S.result = { insertedWords: words.length, searchResults: searchResults };
      var hits = searchResults.filter(function (r) { return r.found; }).length;
      S.step(T('Bitti: ' + words.length + ' sözcük eklendi, ' + searchResults.length + ' arama (' + hits + ' bulundu). Bölünmeler sayesinde düğüm sayısı sözcüklerin toplam harf sayısından çok daha az kalır.',
               'Done: ' + words.length + ' words were inserted, ' + searchResults.length + ' searches were made (' + hits + ' found). Thanks to the splits, the node count stays far below the words\' total letter count.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
