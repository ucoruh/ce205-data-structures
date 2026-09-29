/* Week 6 — separate chaining: each table bucket holds the HEAD of a linked list ("chain") of every key that
 * hashed there. Collisions no longer overwrite anything — they just grow the chain. Insertion is O(1) (new node
 * becomes the head); search must walk the chain, so its cost depends on the chain's length.
 * Drawing standard: one row "table[] =" with index numbers above holding pointers into chains of linked nodes
 * drawn underneath; the load factor α = n/m is shown on the right, alongside the current hash/compare decision.
 * Data is a single ops list (like the stack/queue files): a plain number inserts a key, {search: k} searches for
 * it and counts probes. Examples (normal, hard, edge), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct Node { int key; struct Node *next; } Node;',
    'Node *table[M];                       /* M buckets, each the head of a chain (NULL = empty) */',
    '',
    'void insert(int key) {',
    '    int idx = key % M;',
    '    Node *n = malloc(sizeof(Node));',
    '    n->key = key;',
    '    n->next = table[idx];              /* new node becomes the head: O(1) */',
    '    table[idx] = n;',
    '}',
    '',
    'bool search(int key, int *probes) {',
    '    int idx = key % M;',
    '    int p = 0;',
    '    for (Node *cur = table[idx]; cur != NULL; cur = cur->next) {',
    '        p++;',
    '        if (cur->key == key) { *probes = p; return true; }',
    '    }',
    '    *probes = p;',
    '    return false;',
    '}'
  ];
  var JAVA = [
    'static class Node { int key; Node next; Node(int k, Node nx) { key = k; next = nx; } }',
    'Node[] table = new Node[M];            // M buckets, each the head of a chain (null = empty)',
    '',
    'void insert(int key) {',
    '    int idx = key % M;',
    '    table[idx] = new Node(key, table[idx]);   // new node becomes the head: O(1)',
    '}',
    '',
    'boolean search(int key) {',
    '    int idx = key % M;',
    '    probes = 0;',
    '    for (Node cur = table[idx]; cur != null; cur = cur.next) {',
    '        probes++;',
    '        if (cur.key == key) return true;',
    '    }',
    '    return false;',
    '}'
  ];
  var S_ = 'search';
  function h(key, m) { return ((key % m) + m) % m; }

  D.define({
    id: 'hash-chaining',
    title: T('Ayrık zincirleme (separate chaining) ile hash tablosu', 'Hash table with separate chaining'),
    code: function (d) {
      var m = d && d.m || 7;
      return { c: C.map(function (l) { return l.replace(/\bM\b/g, String(m)); }), java: JAVA.map(function (l) { return l.replace(/\bM\b/g, String(m)); }) };
    },
    presets: [
      { id: 'normal', level: 'normal', name: T('m = 7, 10 ekleme, 4 arama (isabet + kaçırma)', 'm = 7, 10 inserts, 4 searches (hits and misses)'),
        data: { m: 7, ops: [23, 44, 15, 77, 8, 62, 31, 50, 19, 96, { search: 23 }, { search: 99 }, { search: 96 }, { search: 5 }] } },
      { id: 'hard', level: 'hard', name: T('m = 5, 12 ekleme: zincirler uzuyor, 5 arama', 'm = 5, 12 inserts: chains grow, 5 searches'),
        data: { m: 5, ops: [12, 27, 42, 7, 33, 18, 53, 9, 44, 21, 38, 16, { search: 12 }, { search: 100 }, { search: 16 }, { search: 61 }, { search: 9 }] } },
      { id: 'single-bucket', level: 'edge', name: T('m = 1: tüm anahtarlar tek zincirde, arama O(n)\'e döner', 'm = 1: every key in one chain, search degrades to O(n)'),
        data: { m: 1, ops: [5, 17, 29, 3, 41, 12, 8, 50, 23, 36, { search: 36 }, { search: 99 }] } },
      { id: 'high-load', level: 'edge', name: T('m = 3, 12 anahtar: yük faktörü α = 4', 'm = 3, 12 keys: load factor α = 4'),
        data: { m: 3, ops: [4, 10, 16, 22, 28, 34, 40, 46, 52, 58, 64, 70, { search: 58 }, { search: 100 }, { search: 4 }] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.ops.filter(function (o) { return typeof o === 'number'; }).length; },
    /** Independent computation: same head-insertion / linear-chain-walk logic, coded separately from build(). */
    reference: function (d) {
      var m = d.m, buckets = [], i, insertCount = 0, searchResults = [];
      for (i = 0; i < m; i++) buckets.push([]);
      d.ops.forEach(function (o) {
        /* the bucket index is computed inline here, independently of build()'s h() */
        if (typeof o === 'number') { buckets[((o % m) + m) % m].unshift(o); insertCount++; }
        else {
          var key = o.search, chain = buckets[((key % m) + m) % m], probes = 0, found = false, j;
          for (j = 0; j < chain.length; j++) { probes++; if (chain[j] === key) { found = true; break; } }
          searchResults.push({ key: key, found: found, probes: probes });
        }
      });
      return { buckets: buckets, searchResults: searchResults, insertCount: insertCount, loadFactor: insertCount / m };
    },
    random: function (level, r) {
      var mChoices = { easy: [7, 11], normal: [5, 7], hard: [3, 5], extreme: [1, 2, 3] }[level];
      var m = mChoices[D.randInt(r, 0, mChoices.length - 1)];
      var n = { easy: 10, normal: 12, hard: 14, extreme: 12 }[level];
      var ops = [], keys = [], i;
      for (i = 0; i < n; i++) { var k = D.randInt(r, 1, 99); ops.push(k); keys.push(k); }
      var s = D.randInt(r, 3, 5);
      for (i = 0; i < s; i++) {
        if (r() < 0.5) ops.push({ search: keys[D.randInt(r, 0, keys.length - 1)] });
        else ops.push({ search: D.randInt(r, 100, 199) });
      }
      return { m: m, ops: ops };
    },
    input: {
      hint: T('Örnek: m=7 23 44 15 77 8 search=23 search=99  (m tablo boyutu; sayı = ekle, search=N = ara)',
              'Example: m=7 23 44 15 77 8 search=23 search=99  (m is the table size; a number = insert, search=N = search)'),
      parse: function (text) {
        var m = null, ops = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mm = /^m[=:](-?\d+)$/i.exec(tok);
          if (mm) { m = parseInt(mm[1], 10); return; }
          var sm = /^search[=:](-?\d+)$/i.exec(tok);
          if (sm) { ops.push({ search: parseInt(sm[1], 10) }); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, search=N ya da m=N yazın.', '"' + tok + '" is not understood: write a number, search=N or m=N.');
          ops.push(parseInt(tok, 10));
        });
        if (m === null) throw T('m=N yazmalısınız (tablo boyutu).', 'You must write m=N (the table size).');
        if (m < 1 || m > 16) throw T('m 1 ile 16 arasında olmalı.', 'm must be between 1 and 16.');
        var insCount = ops.filter(function (o) { return typeof o === 'number'; }).length;
        if (insCount < 4) throw T('En az 4 ekleme yazın.', 'Write at least 4 inserts.');
        if (ops.length > 34) throw T('En çok 34 işlem.', 'At most 34 operations.');
        return { m: m, ops: ops };
      },
      format: function (d) { return 'm=' + d.m + ' ' + d.ops.map(function (o) { return typeof o === 'number' ? String(o) : ('search=' + o.search); }).join(' '); },
      bad: ['', 'm=0 5 8', 'm=99 5 8', '5 8 13', '5 8 x 13 m=7', 'm=abc 5 8'],
      tokens: function (d) { return d.ops.map(function (o) { return typeof o === 'number' ? String(o) : ('search:' + o.search); }); }
    },
    build: function (S, d) {
      var m = d.m, ops = d.ops;
      var X0 = 90, Y0 = 130, W = 56, H = 44, GAP = 30, NODEY0 = Y0 + H + 46, NODEDY = 54, NODEW = 40, NODEH = 34;
      var RX = X0 + m * (W + GAP) + 40;

      for (var i = 0; i < m; i++) S.box('b' + i, { x: X0 + i * (W + GAP), y: Y0, w: W, h: H, text: '', style: 'empty', size: 16, above: String(i) });
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: T('tablo[] =', 'table[] ='), anchor: 'end', size: 15, bold: true });
      S.label('mlbl', { x: X0, y: 40, text: 'm = ' + m, size: 18, bold: true, mono: true });
      S.label('alpha', { x: X0, y: 64, text: T('yük faktörü α = 0/' + m, 'load factor α = 0/' + m), style: 'dim', size: 14 });
      S.label('dec', { x: RX, y: Y0 + H / 2 + 5, text: '', size: 16, bold: true, mono: true, anchor: 'start' });

      S.step(T('Ayrık zincirleme: her hücre kendi anahtarlarının **bağlı listesinin başına** işaret eder. Çakışma listeyi büyütür, hiçbir şeyin üzerine yazmaz. ' + ops.filter(function (o) { return typeof o === 'number'; }).length + ' ekleme ve ' + ops.filter(function (o) { return typeof o !== 'number'; }).length + ' arama sırada.',
               'Separate chaining: every cell points to the **head of its own linked list**. A collision grows the list instead of overwriting anything. ' + ops.filter(function (o) { return typeof o === 'number'; }).length + ' inserts and ' + ops.filter(function (o) { return typeof o !== 'number'; }).length + ' searches follow.'),
             { c: [1, 2], java: [1, 2] });

      var heads = {}, nodeKey = {}, arrowIds = {}, seq = 0, insertCount = 0;
      function reposition(idx) { (heads[idx] || []).forEach(function (nid, pos) { S.move(nid, null, NODEY0 + pos * NODEDY); }); }
      function relink(idx) {
        (arrowIds[idx] || []).forEach(function (aid) { if (S.has(aid)) S.remove(aid); });
        arrowIds[idx] = [];
        var chain = heads[idx] || [];
        if (!chain.length) { if (S.has('barr' + idx)) S.remove('barr' + idx); return; }
        if (S.has('barr' + idx)) S.set('barr' + idx, { to: chain[0] }); else S.arrow('barr' + idx, { from: 'b' + idx, to: chain[0], kind: 'center', style: 'active' });
        for (var pi = 0; pi < chain.length - 1; pi++) {
          var aid = 'arr' + idx + '_' + pi + '_' + chain[pi];
          // 'next' arrows assume a horizontal chain (pointer cell -> node to the right); our chains stack
          // vertically underneath the bucket, so a plain centre-to-centre arrow draws a clean straight line.
          S.arrow(aid, { from: chain[pi], to: chain[pi + 1], kind: 'center', style: 'normal' });
          arrowIds[idx].push(aid);
        }
        chain.forEach(function (nid, pos) { S.set(nid, { isNull: pos === chain.length - 1 }); });
      }

      var searchResults = [];
      ops.forEach(function (o, k) {
        S.at(k);
        if (typeof o === 'number') {
          var key = o, idx = h(key, m);
          var nid = 'n' + (seq++);
          S.node(nid, { x: X0 + idx * (W + GAP), y: NODEY0, w: NODEW, h: NODEH, value: String(key), isNull: true, style: 'new' });
          nodeKey[nid] = key;
          heads[idx] = heads[idx] || [];
          heads[idx].unshift(nid);
          reposition(idx);
          relink(idx);
          insertCount++;
          var collided = heads[idx].length > 1;
          S.set('b' + idx, { style: collided ? 'del' : 'hl' });
          S.set('alpha', { text: T('yük faktörü α = ' + insertCount + '/' + m + ' = ' + (insertCount / m).toFixed(2), 'load factor α = ' + insertCount + '/' + m + ' = ' + (insertCount / m).toFixed(2)) });
          S.set('dec', { text: 'h(' + key + ') = ' + idx, style: collided ? 'del' : 'hl' });
          S.step(collided
            ? T('`insert(' + key + ')`: `h(' + key + ') = ' + idx + '`. Hücre ' + idx + ' zaten dolu → **çakışma**; yeni düğüm zincirin **başına** eklenir (O(1)).',
                '`insert(' + key + ')`: `h(' + key + ') = ' + idx + '`. Cell ' + idx + ' is already occupied → **collision**; the new node is added at the **head** of the chain (O(1)).')
            : T('`insert(' + key + ')`: `h(' + key + ') = ' + idx + '`. Hücre ' + idx + ' boştu, yeni bir zincir başlar.',
                '`insert(' + key + ')`: `h(' + key + ') = ' + idx + '`. Cell ' + idx + ' was empty, a new chain begins.'),
            { c: [5, 6, 7, 8, 9], java: [5, 6] });
        } else {
          var qkey = o.search, qidx = h(qkey, m);
          var chain = heads[qidx] || [];
          S.set('dec', { text: 'h(' + qkey + ') = ' + qidx, style: 'active' });
          if (!chain.length) {
            S.step(T('`search(' + qkey + ')`: `h(' + qkey + ') = ' + qidx + '`. Hücre ' + qidx + ' boş (NULL) — döngüye hiç girmeden **bulunamadı**, 0 yoklama.',
                     '`search(' + qkey + ')`: `h(' + qkey + ') = ' + qidx + '`. Cell ' + qidx + ' is empty (NULL) — **not found** without entering the loop, 0 probes.'),
                   { c: [13, 14, { n: 15, note: T('cur != NULL? hayır', 'cur != NULL? no') }], java: [10, 11, { n: 12, note: T('cur != null? hayır', 'cur != null? no') }] });
            searchResults.push({ key: qkey, found: false, probes: 0 });
          } else {
            var probes = 0, found = false;
            for (var ci = 0; ci < chain.length; ci++) {
              probes++;
              S.set(chain[ci], { style: 'hl' });
              /* `p = 0;` / `probes = 0;` is a one-time entry line: shown only before the very first
                 probe of this search() call, never repeated on later probes. */
              var entryLine = ci === 0 ? { c: [14], java: [11] } : { c: [], java: [] };
              if (nodeKey[chain[ci]] === qkey) {
                found = true;
                S.set(chain[ci], { style: 'new' });
                S.set('dec', { text: '= ' + qkey + ' found (' + probes + ')', style: 'new' });
                S.step(T('`search(' + qkey + ')` — yoklama ' + probes + ': düğümün anahtarı ' + qkey + ' ile eşleşti — **bulundu**.',
                         '`search(' + qkey + ')` — probe ' + probes + ': the node\'s key matches ' + qkey + ' — **found**.'),
                       { c: entryLine.c.concat([{ n: 15, note: T('cur != NULL? evet', 'cur != NULL? yes') }, 16, { n: 17, note: T('cur->key==key? evet', 'cur->key==key? yes') }]),
                         java: entryLine.java.concat([{ n: 12, note: T('cur != null? evet', 'cur != null? yes') }, 13, { n: 14, note: T('cur.key==key? evet', 'cur.key==key? yes') }]) });
                break;
              } else {
                S.set(chain[ci], { style: 'dim' });
                S.set('dec', { text: '!= ' + qkey, style: 'normal' });
                S.step(T('`search(' + qkey + ')` — yoklama ' + probes + ': düğümün anahtarı ' + qkey + ' değil, zincirde ilerleriz (`cur = cur->next`).',
                         '`search(' + qkey + ')` — probe ' + probes + ': the node\'s key is not ' + qkey + ', we move along the chain (`cur = cur->next`).'),
                       { c: entryLine.c.concat([{ n: 15, note: T('cur != NULL? evet', 'cur != NULL? yes') }, { n: 16, note: T('cur->key==key? hayır', 'cur->key==key? no') }]),
                         java: entryLine.java.concat([{ n: 12, note: T('cur != null? evet', 'cur != null? yes') }, { n: 13, note: T('cur.key==key? hayır', 'cur.key==key? no') }]) });
              }
            }
            if (!found) {
              S.set('dec', { text: T('bulunamadı (' + probes + ')', 'not found (' + probes + ')'), style: 'del' });
              S.step(T('`cur == NULL`: zincirin sonuna geldik, ' + qkey + ' bu zincirde yok — **bulunamadı**, ' + probes + ' yoklama.',
                       '`cur == NULL`: we reached the end of the chain, ' + qkey + ' is not in it — **not found**, ' + probes + ' probes.'),
                     { c: [{ n: 15, note: T('cur != NULL? hayır', 'cur != NULL? no') }, 19, 20], java: [{ n: 12, note: T('cur != null? hayır', 'cur != null? no') }, 16] });
            }
            searchResults.push({ key: qkey, found: found, probes: probes });
          }
        }
      });

      S.at(null);
      var buckets = []; for (var q = 0; q < m; q++) buckets.push((heads[q] || []).map(function (nid) { return nodeKey[nid]; }));
      S.result = { buckets: buckets, searchResults: searchResults, insertCount: insertCount, loadFactor: insertCount / m };
      var hits = searchResults.filter(function (r) { return r.found; }).length;
      S.step(T('Bitti: ' + insertCount + ' anahtar, α = ' + (insertCount / m).toFixed(2) + '. ' + searchResults.length + ' arama: ' + hits + ' isabet, ' + (searchResults.length - hits) + ' kaçırma. Arama maliyeti zincir uzunluğuna bağlı, ortalama **O(1 + α)**.',
               'Done: ' + insertCount + ' keys, α = ' + (insertCount / m).toFixed(2) + '. ' + searchResults.length + ' searches: ' + hits + ' hit' + (hits === 1 ? '' : 's') + ', ' + (searchResults.length - hits) + ' miss' + (searchResults.length - hits === 1 ? '' : 'es') + '. Search cost depends on chain length, on average **O(1 + α)**.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
