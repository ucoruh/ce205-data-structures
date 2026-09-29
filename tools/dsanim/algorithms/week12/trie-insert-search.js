/* Week 12 -- Strings: Structures and Algorithms
 * A trie (prefix tree): each edge is labeled with one character, and the node it leads to is drawn showing
 * that character. Following the edges spelled out by a word's letters, from the root, either lands on an
 * existing path (shared prefix, no new node needed) or runs out of edges (a new node is created). A node
 * marked "end" means some inserted word finishes exactly there -- a node can be on the path to a longer word
 * AND be an end-of-word itself (e.g. "DO" ends where "DOG" continues). search() walks the same way: if every
 * character finds an edge, the word is at least a PREFIX of something stored; it is only a full match if the
 * final node is also marked "end". */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '#define ALPHA 26',
    'typedef struct TrieNode { struct TrieNode *child[ALPHA]; bool isEnd; } TrieNode;',
    '',
    'void insert(TrieNode *root, const char *word) {',
    '    TrieNode *cur = root;',
    '    for (int i = 0; word[i] != \'\\0\'; i++) {',
    '        int c = word[i] - \'A\';',
    '        if (cur->child[c] == NULL) {',
    '            cur->child[c] = new_node();',
    '        }',
    '        cur = cur->child[c];',
    '    }',
    '    cur->isEnd = true;',
    '}',
    '',
    'bool search(TrieNode *root, const char *word, bool *isPrefix) {',
    '    TrieNode *cur = root;',
    '    for (int i = 0; word[i] != \'\\0\'; i++) {',
    '        int c = word[i] - \'A\';',
    '        if (cur->child[c] == NULL) {',
    '            *isPrefix = false;',
    '            return false;',
    '        }',
    '        cur = cur->child[c];',
    '    }',
    '    *isPrefix = true;',
    '    return cur->isEnd;',
    '}'
  ];
  var JAVA = [
    'static class TrieNode {',
    '    Map<Character, TrieNode> child = new HashMap<>();',
    '    boolean isEnd = false;',
    '}',
    '',
    'void insert(TrieNode root, String word) {',
    '    TrieNode cur = root;',
    '    for (char c : word.toCharArray()) {',
    '        if (!cur.child.containsKey(c)) {',
    '            cur.child.put(c, new TrieNode());',
    '        }',
    '        cur = cur.child.get(c);',
    '    }',
    '    cur.isEnd = true;',
    '}',
    '',
    'boolean search(TrieNode root, String word, boolean[] isPrefix) {',
    '    TrieNode cur = root;',
    '    for (char c : word.toCharArray()) {',
    '        if (!cur.child.containsKey(c)) {',
    '            isPrefix[0] = false;',
    '            return false;',
    '        }',
    '        cur = cur.child.get(c);',
    '    }',
    '    isPrefix[0] = true;',
    '    return cur.isEnd;',
    '}'
  ];

  /** Plain-object trie, built and walked independently of build()'s node/edge drawing logic. */
  function refTrie(words) {
    var root = {};
    words.forEach(function (w) {
      var cur = root;
      for (var i = 0; i < w.length; i++) { cur.c = cur.c || {}; cur.c[w[i]] = cur.c[w[i]] || {}; cur = cur.c[w[i]]; }
      cur.end = true;
    });
    return root;
  }
  function refSearch(root, w) {
    var cur = root;
    for (var i = 0; i < w.length; i++) {
      if (!cur.c || !cur.c[w[i]]) return { found: false, isPrefix: false };
      cur = cur.c[w[i]];
    }
    return { found: !!cur.end, isPrefix: true };
  }

  /** Full final trie with a fixed layout (x slot, y depth), used only for node COORDINATES; which nodes and
   * edges actually exist at a given point in the animation is tracked separately in build() as ops run. */
  function layoutTrie(words) {
    var root = { id: 'root', depth: 0, children: {} };
    words.forEach(function (w) {
      var cur = root;
      for (var i = 0; i < w.length; i++) {
        var c = w[i];
        if (!cur.children[c]) cur.children[c] = { id: cur.id + '_' + c, depth: cur.depth + 1, children: {} };
        cur = cur.children[c];
      }
    });
    var leaf = 0;
    (function place(node) {
      var keys = Object.keys(node.children).sort();
      if (!keys.length) { node.slot = leaf++; return; }
      keys.forEach(function (k) { place(node.children[k]); });
      var xs = keys.map(function (k) { return node.children[k].slot; });
      node.slot = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
    })(root);
    var byId = {};
    (function index(node) { byId[node.id] = node; Object.keys(node.children).forEach(function (k) { index(node.children[k]); }); })(root);
    return { root: root, byId: byId, width: leaf, maxDepth: Math.max.apply(null, Object.keys(byId).map(function (id) { return byId[id].depth; })) };
  }

  D.define({
    id: 'trie-insert-search',
    title: T('Trie (önek ağacı): ekleme ve arama', 'Trie (prefix tree): insert and search'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('CAT, CAR, CARD, DOG ekle; CAR/CARS/DO ara', 'Insert CAT, CAR, CARD, DOG; search CAR/CARS/DO'),
        data: { ops: ['CAT', 'CAR', 'CARD', 'DOG', { search: 'CAR' }, { search: 'CARS' }, { search: 'DO' }] } },
      { id: 'hard', level: 'hard', name: T('Derin ortak önekler: TRIE aile sözcükleri, 5 arama', 'Deep shared prefixes: the TRIE word family, 5 searches'),
        data: { ops: ['TRIE', 'TRIED', 'TRIES', 'TRY', 'TRUE', 'TRUCK', { search: 'TRIE' }, { search: 'TR' }, { search: 'TRUCKS' }, { search: 'TRY' }, { search: 'TRUST' }] } },
      { id: 'no-shared-prefix', level: 'edge', name: T('Ortak önek yok: her sözcük kökten hemen dallanır', 'No shared prefix: every word branches right from the root'),
        data: { ops: ['AB', 'CD', 'EF', 'GH', 'IJ', { search: 'AB' }, { search: 'XY' }, { search: 'A' }] } },
      { id: 'duplicate-insert', level: 'edge', name: T('Yinelenen ekleme: DATA iki kez eklenir (değişmez)', 'Duplicate insert: DATA is inserted twice (idempotent)'),
        data: { ops: ['DATA', 'DATA', 'STRUCTURE', { search: 'DATA' }, { search: 'DAT' }, { search: 'STRUCTURES' }] } },
      { id: 'chain', level: 'edge', name: T('Dallanmasız zincir: A, AB, ABC, ABCD (en derin uç durum)', 'A branchless chain: A, AB, ABC, ABCD (the deepest edge case)'),
        data: { ops: ['A', 'AB', 'ABC', 'ABCD', { search: 'A' }, { search: 'ABCD' }, { search: 'ABCDE' }] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of input values = total characters across the INSERTED words (search queries do not count). */
    size: function (d) { return d.ops.filter(function (o) { return typeof o === 'string'; }).reduce(function (s, w) { return s + w.length; }, 0); },
    /** Independent: a fresh plain-object trie, built and walked with code that build() never calls. */
    reference: function (d) {
      var words = d.ops.filter(function (o) { return typeof o === 'string'; });
      var root = refTrie(words);
      var searchResults = d.ops.filter(function (o) { return typeof o !== 'string'; }).map(function (o) {
        var r = refSearch(root, o.search);
        return { word: o.search, found: r.found, isPrefix: r.isPrefix };
      });
      return { insertedWords: words.length, searchResults: searchResults };
    },
    random: function (level, r) {
      var alpha = level === 'easy' ? 3 : (level === 'normal' ? 4 : 5);
      var letters = 'ABCDE'.slice(0, alpha);
      function word(len) { var s = ''; for (var i = 0; i < len; i++) s += letters[D.randInt(r, 0, alpha - 1)]; return s; }
      var ops = [], words = [], total = 0, wlen = level === 'extreme' ? [2, 6] : [2, 5];
      while (total < 11) { var w = word(D.randInt(r, wlen[0], wlen[1])); ops.push(w); words.push(w); total += w.length; }
      var s = D.randInt(r, 3, 5), i;
      for (i = 0; i < s; i++) ops.push({ search: r() < 0.5 ? words[D.randInt(r, 0, words.length - 1)] : word(D.randInt(r, 1, wlen[1])) });
      return { ops: ops };
    },
    input: {
      hint: T('Örnek: CAT CAR CARD search=CAR search=DO  (sözcük = ekle, search=W = ara; yalnız A-Z)',
              'Example: CAT CAR CARD search=CAR search=DO  (a word = insert, search=W = search; letters A-Z only)'),
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
      bad: ['', 'CAT', 'CAT 4G', 'search=CAT', 'search=CAT search=DOG', 'CAT $$ CAR'],
      tokens: function (d) { return d.ops.map(function (o) { return typeof o === 'string' ? o : ('search:' + o.search); }); }
    },
    build: function (S, d) {
      var words = d.ops.filter(function (o) { return typeof o === 'string'; });
      var LT = layoutTrie(words);
      var R = 17, DX = 54, DY = 74, X0 = 110, Y0 = 90;
      function px(node) { return X0 + node.slot * DX; }
      function py(node) { return Y0 + node.depth * DY; }
      for (var dep = 0; dep <= LT.maxDepth; dep++) S.label('dep' + dep, { x: X0 - 40, y: Y0 + dep * DY + 5, text: 'd=' + dep, anchor: 'end', size: 12, style: 'dim' });
      var RX = X0 + (LT.width + 1) * DX;
      S.label('dec', { x: RX, y: 40, text: '', size: 16, bold: true, anchor: 'start' });
      S.label('dec2', { x: RX, y: 64, text: '', size: 13, anchor: 'start' });

      var created = {}; // id -> true once its circle has been drawn
      var endIds = {};  // id -> true once marked end-of-word
      S.circle('nroot', { x: px(LT.root), y: py(LT.root), r: R, text: T('kök', 'root'), size: 12, style: 'normal' });
      created['root'] = true;
      S.step(T('Boş bir trie ile başlıyoruz: yalnız **kök** düğüm var, hiç harf temsil etmiyor. ' + words.length + ' sözcük eklenecek.',
               'We start with an empty trie: only the **root** node exists, representing no letter at all. ' + words.length + ' words will be inserted.'),
             { c: [1, 2], java: [1, 2, 3, 4] });

      function nodeOf(id) { return LT.byId[id]; }

      d.ops.forEach(function (op, k) {
        S.at(k);
        if (typeof op === 'string') {
          var word = op, curId = 'root';
          S.set('dec', { text: 'insert(' + word + ')', style: 'active' }); S.set('dec2', { text: '' });
          S.step(T('`insert("' + word + '")` -- köke gideriz, sonra her harf için bir kenar izleriz.',
                   '`insert("' + word + '")` -- we start at the root, then follow one edge per letter.'),
                 { c: [4, 5], java: [6, 7] });
          for (var i = 0; i < word.length; i++) {
            var ch = word[i], childId = curId + '_' + ch, isNew = !created[childId];
            var childNode = nodeOf(childId);
            if (isNew) {
              S.circle('n' + childId, { x: px(childNode), y: py(childNode), r: R, text: ch, size: 15, style: 'new' });
              S.arrow('e' + childId, { from: 'n' + curId, to: 'n' + childId, kind: 'center', style: 'new', head: false });
              created[childId] = true;
              S.step(T('`' + ch + '`: `cur->child[' + ch + ']` boştu (NULL) -- yeni bir düğüm oluşturulur.', '`' + ch + '`: `cur->child[' + ch + ']` was empty (NULL) -- a new node is created.'),
                     { c: [7, { n: 8, note: T('boş mu? evet (NULL)', 'empty? yes (NULL)') }, 9, 11], java: [{ n: 8, note: T('devam', 'continue') }, { n: 9, note: T('boş mu? evet', 'empty? yes') }, 10, 12] });
            } else {
              S.set('n' + childId, { style: 'hl' });
              S.step(T('`' + ch + '`: `cur->child[' + ch + ']` zaten var -- ortak önek, yeni düğüm gerekmez.', '`' + ch + '`: `cur->child[' + ch + ']` already exists -- shared prefix, no new node needed.'),
                     { c: [7, { n: 8, note: T('boş mu? hayır', 'empty? no') }, { n: 9, skip: true }, 11], java: [{ n: 8, note: T('devam', 'continue') }, { n: 9, note: T('boş mu? hayır', 'empty? no') }, { n: 10, skip: true }, 12] });
              S.set('n' + childId, { style: 'normal' });
            }
            curId = childId;
          }
          if (!endIds[curId]) {
            endIds[curId] = true;
            S.set('n' + curId, { style: 'new' });
            S.label('end' + curId, { x: px(nodeOf(curId)) + R + 5, y: py(nodeOf(curId)) - R - 3, text: T('son', 'end'), size: 11, style: 'dim', anchor: 'start' });
            S.step(T('`cur->isEnd = true` -- "' + word + '" burada tam olarak bitiyor.', '`cur->isEnd = true` -- "' + word + '" ends exactly here.'), { c: 13, java: 14 });
            S.set('n' + curId, { style: 'normal' });
          } else {
            S.step(T('"' + word + '" zaten bir kez eklenmişti -- `isEnd` zaten `true`, hiçbir şey değişmez.', '"' + word + '" was already inserted once -- `isEnd` is already `true`, nothing changes.'), { c: 13, java: 14 });
          }
        } else {
          var q = op.search, cId = 'root', ok = true;
          S.set('dec', { text: 'search(' + q + ')', style: 'active' }); S.set('dec2', { text: '' });
          S.step(T('`search("' + q + '")` -- köke gideriz, harf harf kenar izleriz.', '`search("' + q + '")` -- we start at the root, following one edge per letter.'),
                 { c: [16, 17], java: [17, 18] });
          for (var j = 0; j < q.length && ok; j++) {
            var qch = q[j], qChildId = cId + '_' + qch;
            if (created[qChildId]) {
              S.set('n' + qChildId, { style: 'hl' });
              S.step(T('`' + qch + '`: kenar var -- devam ederiz.', '`' + qch + '`: the edge exists -- we continue.'),
                     { c: [{ n: 18, note: T('devam', 'continue') }, 19, { n: 20, note: T('boş mu? hayır', 'empty? no') }, { n: 21, skip: true }, { n: 22, skip: true }, 24],
                       java: [{ n: 19, note: T('devam', 'continue') }, { n: 20, note: T('boş mu? hayır', 'empty? no') }, { n: 21, skip: true }, { n: 22, skip: true }, 24] });
              S.set('n' + qChildId, { style: 'normal' });
              cId = qChildId;
            } else {
              S.set('dec2', { text: T('kenar yok -- yol kırıldı', 'no such edge -- the path breaks'), style: 'del' });
              S.step(T('`' + qch + '`: `cur->child[' + qch + ']` NULL -- yol burada kırılıyor. **bulunamadı**, ve **önek de değil**.', '`' + qch + '`: `cur->child[' + qch + ']` is NULL -- the path breaks here. **not found**, and **not a prefix** either.'),
                     { c: [{ n: 18, note: T('devam', 'continue') }, 19, { n: 20, note: T('boş mu? evet (NULL)', 'empty? yes (NULL)') }, 21, 22],
                       java: [{ n: 19, note: T('devam', 'continue') }, { n: 20, note: T('boş mu? evet', 'empty? yes') }, 21, 22] });
              ok = false;
            }
          }
          if (ok) {
            var found = !!endIds[cId];
            S.set('dec2', { text: found ? T('tam sözcük -- bulundu', 'a complete word -- found') : T('yalnız önek, sözcük değil', 'only a prefix, not a word'), style: found ? 'new' : 'active' });
            S.step(found
              ? T('Tüm harfler bir kenar buldu VE son düğüm `isEnd` -- "' + q + '" **bulundu**.', 'Every letter found an edge AND the final node is `isEnd` -- "' + q + '" is **found**.')
              : T('Tüm harfler bir kenar buldu ama son düğüm `isEnd` değil -- "' + q + '" bir **önek** ama eklenmiş bir sözcük değil.', 'Every letter found an edge but the final node is not `isEnd` -- "' + q + '" is a **prefix** but not an inserted word.'),
              { c: [26, 27], java: [26, 27] });
          }
        }
      });

      S.at(null); S.set('dec', { text: '', style: 'normal' }); S.set('dec2', { text: '' });
      var searchResults = d.ops.filter(function (o) { return typeof o !== 'string'; }).map(function (o) {
        var cur = 'root', okk = true;
        for (var i2 = 0; i2 < o.search.length && okk; i2++) { var id2 = cur + '_' + o.search[i2]; if (created[id2]) cur = id2; else okk = false; }
        return { word: o.search, found: okk && !!endIds[cur], isPrefix: okk };
      });
      S.result = { insertedWords: words.length, searchResults: searchResults };
      var hits = searchResults.filter(function (r) { return r.found; }).length;
      S.step(T('Bitti: ' + words.length + ' sözcük eklendi, ' + searchResults.length + ' arama yapıldı (' + hits + ' bulundu). Her işlem, sözcüğün uzunluğu `L` ile **O(L)** -- trie boyutundan (kaç sözcük olduğundan) bağımsız.',
               'Done: ' + words.length + ' words were inserted, ' + searchResults.length + ' searches were made (' + hits + ' found). Every operation costs **O(L)** in the word\'s length `L` -- independent of how many words the trie holds.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
