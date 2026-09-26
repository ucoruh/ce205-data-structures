/* Week 2 -- skip list: a sorted linked list with an extra "express lane". Levels are fixed per key from the
 * preset data (a deterministic stand-in for a coin flip), not chosen at random, so the search path is always
 * the same for the same input -- exactly like skip_list.c / SkipList.java (MAX_LEVEL = 2: level 0 is the full
 * list, level 1 is the express lane). Search: go right while the next key is smaller, otherwise drop down. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '#define MAX_LEVEL 2   /* level 0 = the full list, level 1 = the express lane */',
    'typedef struct Node { int value; struct Node *forward[MAX_LEVEL]; } Node;',
    'typedef struct { Node *header; } SkipList;      /* header: sentinel, present at every level */',
    '',
    'void sl_insert(SkipList *sl, int value, int level, bool verbose) {',
    '    Node *update[MAX_LEVEL];',
    '    Node *cur = sl->header;',
    '    for (int i = MAX_LEVEL - 1; i >= 0; i--) {',
    '        while (cur->forward[i] != NULL && cur->forward[i]->value < value)',
    '            cur = cur->forward[i];',
    '        update[i] = cur;             /* predecessor of the new node at level i */',
    '    }',
    '    Node *n = new_node(value);',
    '    for (int i = 0; i < level; i++) {',
    '        n->forward[i] = update[i]->forward[i];',
    '        update[i]->forward[i] = n;',
    '    }',
    '}',
    '',
    'int sl_search(SkipList *sl, int value, int *comparisons) {',
    '    Node *cur = sl->header;',
    '    *comparisons = 0;',
    '    for (int i = MAX_LEVEL - 1; i >= 0; i--) {',
    '        while (cur->forward[i] != NULL && cur->forward[i]->value < value) {',
    '            cur = cur->forward[i];   /* go right */',
    '            (*comparisons)++;',
    '        }',
    '        /* else: drop down one level */',
    '    }',
    '    cur = cur->forward[0];',
    '    (*comparisons)++;',
    '    return cur != NULL && cur->value == value;',
    '}'
  ];
  var JAVA = [
    'static final int MAX_LEVEL = 2;   // level 0 = the full list, level 1 = the express lane',
    'class Node { int value; Node[] forward = new Node[MAX_LEVEL]; Node(int v) { value = v; } }',
    'class SList { Node header = new Node(Integer.MIN_VALUE); }   // header: sentinel, present at every level',
    '',
    'static void insert(SList sl, int value, int level, boolean verbose) {',
    '    Node[] update = new Node[MAX_LEVEL];',
    '    Node cur = sl.header;',
    '    for (int i = MAX_LEVEL - 1; i >= 0; i--) {',
    '        while (cur.forward[i] != null && cur.forward[i].value < value)',
    '            cur = cur.forward[i];',
    '        update[i] = cur;             // predecessor of the new node at level i',
    '    }',
    '    Node n = new Node(value);',
    '    for (int i = 0; i < level; i++) {',
    '        n.forward[i] = update[i].forward[i];',
    '        update[i].forward[i] = n;',
    '    }',
    '}',
    '',
    'static SearchResult search(SList sl, int value) {',
    '    Node cur = sl.header;',
    '    SearchResult r = new SearchResult();',
    '    for (int i = MAX_LEVEL - 1; i >= 0; i--) {',
    '        while (cur.forward[i] != null && cur.forward[i].value < value) {',
    '            cur = cur.forward[i];    // go right',
    '            r.comparisons++;',
    '        }',
    '        // else: drop down one level',
    '    }',
    '    cur = cur.forward[0];',
    '    r.comparisons++;',
    '    r.found = cur != null && cur.value == value;',
    '    return r;',
    '}'
  ];
  var X0 = 180, DX = 92, Y_TOP = 90, Y_BASE = 220;

  D.define({
    id: 'skip-list',
    title: T('Atlamalı liste: taban liste + hızlı şerit', 'Skip list: base list + an express lane'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 anahtar, her ikincisi hızlı şeritte, iki arama', '10 keys, every other one on the express lane, two searches'),
        data: { items: [{ v: 10, level: 1 }, { v: 20, level: 2 }, { v: 30, level: 1 }, { v: 40, level: 2 }, { v: 50, level: 1 }, { v: 60, level: 2 }, { v: 70, level: 1 }, { v: 80, level: 2 }, { v: 90, level: 1 }, { v: 100, level: 2 }], searches: [80, 999] } },
      { id: 'hard', level: 'hard', name: T('14 anahtar (yinelenen/negatif), sıra dışı ekleme sırası', '14 keys (duplicates/negatives), inserted out of sorted order'),
        data: { items: [{ v: 50, level: 1 }, { v: -20, level: 2 }, { v: 10, level: 1 }, { v: 10, level: 2 }, { v: 70, level: 1 }, { v: -20, level: 1 }, { v: 30, level: 2 }, { v: 90, level: 1 }, { v: 30, level: 1 }, { v: 0, level: 2 }, { v: 60, level: 1 }, { v: 40, level: 2 }, { v: 80, level: 1 }, { v: 20, level: 1 }], searches: [30, -20, 1000] } },
      { id: 'one-express-node', level: 'edge', name: T('10 anahtar, hızlı şeritte YALNIZ bir düğüm', '10 keys, only ONE node on the express lane'),
        data: { items: [{ v: 5, level: 1 }, { v: 15, level: 1 }, { v: 25, level: 1 }, { v: 35, level: 2 }, { v: 45, level: 1 }, { v: 55, level: 1 }, { v: 65, level: 1 }, { v: 75, level: 1 }, { v: 85, level: 1 }, { v: 95, level: 1 }], searches: [35, 90] } },
      { id: 'first-last-missing', level: 'edge', name: T('12 anahtar: ilk anahtar, son anahtar, listede olmayan bir değer', '12 keys: the first key, the last key, and a value that is not present'),
        data: { items: [{ v: 8, level: 2 }, { v: 16, level: 1 }, { v: 24, level: 2 }, { v: 32, level: 1 }, { v: 40, level: 2 }, { v: 48, level: 1 }, { v: 56, level: 2 }, { v: 64, level: 1 }, { v: 72, level: 2 }, { v: 80, level: 1 }, { v: 88, level: 2 }, { v: 96, level: 1 }], searches: [8, 96, 200] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of keys inserted -- every example has at least 10. */
    size: function (d) { return d.items.length; },
    /** Independent computation of the expected outcome: a plain array-of-nodes simulation of the SAME
     * algorithm, written separately from build()'s Scene-drawing version (no shared helper). */
    reference: function (d) {
      var MAXL = 2, nodes = [], headerFwd = [-1, -1];
      function insert(value, level) {
        var update = [], curIdx = -1;
        for (var i = MAXL - 1; i >= 0; i--) {
          var cf = curIdx === -1 ? headerFwd[i] : nodes[curIdx].fwd[i];
          while (cf !== -1 && nodes[cf].value < value) { curIdx = cf; cf = nodes[curIdx].fwd[i]; }
          update[i] = curIdx;
        }
        var nIdx = nodes.length;
        nodes.push({ value: value, fwd: [-1, -1] });
        for (var i2 = 0; i2 < level; i2++) {
          var predIdx = update[i2];
          if (predIdx === -1) { nodes[nIdx].fwd[i2] = headerFwd[i2]; headerFwd[i2] = nIdx; }
          else { nodes[nIdx].fwd[i2] = nodes[predIdx].fwd[i2]; nodes[predIdx].fwd[i2] = nIdx; }
        }
      }
      function search(value) {
        var curIdx = -1, comparisons = 0;
        for (var i = MAXL - 1; i >= 0; i--) {
          var cf = curIdx === -1 ? headerFwd[i] : nodes[curIdx].fwd[i];
          while (cf !== -1 && nodes[cf].value < value) { curIdx = cf; comparisons++; cf = nodes[curIdx].fwd[i]; }
        }
        var cf0 = curIdx === -1 ? headerFwd[0] : nodes[curIdx].fwd[0];
        comparisons++;
        return { found: cf0 !== -1 && nodes[cf0].value === value, comparisons: comparisons };
      }
      d.items.forEach(function (it) { insert(it.v, it.level); });
      var sorted = [], cf = headerFwd[0];
      while (cf !== -1) { sorted.push(nodes[cf].value); cf = nodes[cf].fwd[0]; }
      var searches = d.searches.map(function (v) { return search(v); });
      return { sorted: sorted, searches: searches };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level];
      var lo = level === 'extreme' ? -300 : 1, hi = level === 'extreme' ? 300 : 99;
      var items = [];
      for (var i = 0; i < n; i++) items.push({ v: D.randInt(r, lo, hi), level: r() < 0.45 ? 2 : 1 });
      var searches = [items[D.randInt(r, 0, n - 1)].v, D.randInt(r, hi + 500, hi + 1000)];
      return { items: items, searches: searches };
    },
    input: {
      hint: T('Örnek: 10:1 20:2 30:1 | 20 999   (değer:seviye listesi, sonra dikey çizgiden sonra aranan değerler)',
              'Example: 10:1 20:2 30:1 | 20 999   (value:level list, then target values after the bar)'),
      parse: function (text) {
        var parts = String(text).split('|');
        if (parts.length !== 2) throw T('Bir tane "|" ile anahtarları ve aranan değerleri ayırın.', 'Use exactly one "|" to separate the keys from the search values.');
        var items = [];
        parts[0].trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^(-?\d+):([12])$/.exec(tok);
          if (!m) throw T('"' + tok + '" anlaşılmadı: değer:seviye yazın (seviye 1 ya da 2).', '"' + tok + '" is not understood: write value:level (level 1 or 2).');
          items.push({ v: +m[1], level: +m[2] });
        });
        var searches = D.parseInts(parts[1]);
        if (!items.length) throw T('En az bir anahtar yazın.', 'Write at least one key.');
        if (!searches.length) throw T('En az bir aranan değer yazın.', 'Write at least one search value.');
        if (items.length > 24) throw T('En çok 24 anahtar.', 'At most 24 keys.');
        return { items: items, searches: searches };
      },
      format: function (d) { return d.items.map(function (it) { return it.v + ':' + it.level; }).join(' ') + ' | ' + d.searches.join(' '); },
      bad: ['', '5:3 | 1', '5 | 1', '5:1 |', '| 1']
    },
    build: function (S, d) {
      var order = [], seq = 0;
      S.node('hdr0', { x: X0 - DX, y: Y_BASE, value: T('baş', 'head'), isNull: true, style: 'dim' });
      S.node('hdr1', { x: X0 - DX, y: Y_TOP, value: T('baş', 'head'), isNull: true, style: 'dim' });
      S.arrow('hdrV', { from: 'hdr1', to: 'hdr0', kind: 'center', head: false, style: 'dim' });
      S.step(T('İki satır: üstte hızlı şerit (seviye 1), altta tam liste (seviye 0). `header` her ikisinde de var; başlangıçta ikisi de boş listeye işaret eder (`NULL`).',
               'Two rows: the express lane (level 1) on top, the full list (level 0) below. `header` exists at both levels; at first both point at an empty list (`NULL`).'), { c: [1, 2, 3], java: [1, 2, 3] });

      function relayoutAndWire() {
        for (var i = 0; i < order.length; i++) {
          S.move(order[i].id0, X0 + i * DX, Y_BASE);
          if (order[i].id1) S.move(order[i].id1, X0 + i * DX, Y_TOP);
        }
        // wipe and redraw every forward arrow (small N -- simplest correct approach)
        ['hdr0', 'hdr1'].concat(order.map(function (nd) { return nd.id0; })).concat(order.filter(function (nd) { return nd.id1; }).map(function (nd) { return nd.id1; }))
          .forEach(function (id) { if (S.has('a' + id)) S.remove('a' + id); });
        S.set('hdr0', { isNull: true }); S.set('hdr1', { isNull: true });
        order.forEach(function (nd) { S.set(nd.id0, { isNull: true }); if (nd.id1) S.set(nd.id1, { isNull: true }); });
        var prev0 = 'hdr0';
        order.forEach(function (nd) {
          S.arrow('a' + prev0, { from: prev0, to: nd.id0, kind: 'next' });
          S.set(prev0, { isNull: false });
          prev0 = nd.id0;
        });
        var lvl1 = order.filter(function (nd) { return nd.id1; });
        var prev1 = 'hdr1';
        lvl1.forEach(function (nd) {
          S.arrow('a' + prev1, { from: prev1, to: nd.id1, kind: 'next' });
          S.set(prev1, { isNull: false });
          prev1 = nd.id1;
        });
      }
      function clean() { order.forEach(function (nd) { S.set(nd.id0, { style: 'normal' }); if (nd.id1) S.set(nd.id1, { style: 'normal' }); }); S.set('hdr0', { style: 'dim' }); S.set('hdr1', { style: 'dim' }); }

      d.items.forEach(function (it, opIdx) {
        clean();
        var idx = 0; while (idx < order.length && order[idx].value < it.v) idx++;
        var id0 = 'b' + (seq), id1 = it.level >= 2 ? 't' + seq : null; seq++;
        S.node(id0, { x: X0, y: Y_BASE - 130, value: String(it.v), style: 'new' });
        if (id1) S.node(id1, { x: X0, y: Y_TOP - 130, value: String(it.v), style: 'new' });
        var detailed = opIdx < 2;
        if (detailed) S.step(T('`sl_insert(' + it.v + ', level=' + it.level + ')`: bu anahtarın seviyesi ' + it.level + ' -- önceden belirlenmiş (bir "yazı-tura" sonucu gibi düşünün), zar atılmıyor.',
                               '`sl_insert(' + it.v + ', level=' + it.level + ')`: this key\'s level is ' + it.level + ' -- decided in advance (think of it as a "coin flip" outcome), nothing is rolled live.'), { c: [4, 5, 6], java: [4, 5, 6] });
        var nd = { id0: id0, id1: id1, value: it.v, level: it.level };
        order.splice(idx, 0, nd);
        if (id1) S.arrow('v' + id0, { from: id1, to: id0, kind: 'center', head: false, style: 'dim' });
        relayoutAndWire(); clean();
        S.step(T((detailed ? '`update[i]->forward[i] = n` her seviyede: ' : (opIdx + 1) + '. ekleme: ') + it.v + ' sıralı konumuna girdi' + (it.level >= 2 ? ', hızlı şeritte de yer aldı.' : ', yalnız taban listede.'),
                 (detailed ? '`update[i]->forward[i] = n` at every level: ' : 'insert ' + (opIdx + 1) + ': ') + it.v + ' is now in its sorted place' + (it.level >= 2 ? ', and it also sits on the express lane.' : ', on the base list only.')), { c: [12, 13, 14, 15], java: [10, 11, 12, 13] });
      });
      clean();

      var searchResults = [];
      d.searches.forEach(function (key, si) {
        clean();
        var detailed = si === 0;
        var comparisons = 0, curOrderIdx = -1;
        S.pointer('curP', { target: 'hdr1', text: 'cur', side: 'top', dist: 30 });
        S.step(T((si + 1) + '. `sl_search(' + key + ')`: `cur = header`. Seviye 1\'den (hızlı şerit) başlıyoruz.', (si + 1) + '. `sl_search(' + key + ')`: `cur = header`. We start at level 1 (the express lane).'), { c: [21, 22], java: [21, 22] });
        var lvl1 = []; order.forEach(function (nd, idx) { if (nd.level >= 2) lvl1.push(idx); });
        while (true) {
          var nextIdx = -1;
          for (var j = 0; j < lvl1.length; j++) if (lvl1[j] > curOrderIdx) { nextIdx = lvl1[j]; break; }
          if (nextIdx === -1 || order[nextIdx].value >= key) break;
          comparisons++; curOrderIdx = nextIdx;
          S.set('curP', { target: order[curOrderIdx].id1 });
          if (detailed) S.step(T('seviye 1: `cur->forward[1]->value` (' + order[curOrderIdx].value + ') < ' + key + ' -- sağa git.', 'level 1: `cur->forward[1]->value` (' + order[curOrderIdx].value + ') < ' + key + ' -- go right.'), { c: [23, 24], java: [23, 24] });
        }
        S.step(T('seviye 1\'de daha yakın düğüm yok -- **aşağı in**.', 'no closer node at level 1 -- **drop down**.'), { c: 27, java: 27 });
        S.set('curP', { target: curOrderIdx === -1 ? 'hdr0' : order[curOrderIdx].id0 });
        while (true) {
          var nextIdx0 = curOrderIdx + 1;
          if (nextIdx0 >= order.length || order[nextIdx0].value >= key) break;
          comparisons++; curOrderIdx = nextIdx0;
          S.set('curP', { target: order[curOrderIdx].id0 });
          if (detailed) S.step(T('seviye 0: `cur->forward[0]->value` (' + order[curOrderIdx].value + ') < ' + key + ' -- sağa git.', 'level 0: `cur->forward[0]->value` (' + order[curOrderIdx].value + ') < ' + key + ' -- go right.'), { c: [23, 24], java: [23, 24] });
        }
        var checkIdx = curOrderIdx + 1;
        comparisons++;
        var found = checkIdx < order.length && order[checkIdx].value === key;
        if (found) S.set(order[checkIdx].id0, { style: 'hl' });
        S.step(T('seviye 0\'da son kontrol: ' + (found ? '`' + key + '` bulundu' : '`' + key + '` yok') + '. Toplam ' + comparisons + ' karşılaştırma.',
                 'final check at level 0: ' + (found ? '`' + key + '` found' : '`' + key + '` is not there') + '. ' + comparisons + ' comparisons in total.'), { c: [29, 30, 31], java: [29, 30, 31] });
        S.remove('curP');
        searchResults.push({ found: found, comparisons: comparisons });
      });
      clean();
      S.result = { sorted: order.map(function (nd) { return nd.value; }), searches: searchResults };
      S.step(T('Bitti: ' + order.length + ' anahtar, ' + d.searches.length + ' arama. Taban liste (sıralı): ' + S.result.sorted.join(', ') + '.',
               'Done: ' + order.length + ' keys, ' + d.searches.length + ' search' + (d.searches.length === 1 ? '' : 'es') + '. Base list (sorted): ' + S.result.sorted.join(', ') + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
