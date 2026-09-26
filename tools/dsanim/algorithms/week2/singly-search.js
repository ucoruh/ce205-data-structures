/* Week 2 -- singly linked list: linear search with a comparison count. Found at the first, a middle, and the
 * last position; not found; duplicates (the first match wins); and a search on an empty list.
 * Program: singly_search.c / SinglySearch.java. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct Node {',
    '    int data;',
    '    struct Node *next;',
    '} Node;',
    '',
    'int search(Node *head, int value) {',
    '    int index = 0;',
    '    for (Node *cur = head; cur != NULL; cur = cur->next) {',
    '        if (cur->data == value)',
    '            return index;      /* found at this position */',
    '        index++;',
    '    }',
    '    return -1;                 /* not found */',
    '}'
  ];
  var JAVA = [
    'class Node {',
    '    int data;',
    '    Node next;',
    '    Node(int data) { this.data = data; }',
    '}',
    '',
    'static int search(Node head, int value) {',
    '    int index = 0;',
    '    for (Node cur = head; cur != null; cur = cur.next) {',
    '        if (cur.data == value)',
    '            return index;      // found at this position',
    '        index++;',
    '    }',
    '    return -1;                 // not found',
    '}'
  ];
  var ROWCAP = 8, DX = 100, ROWH = 100, X0 = 110, Y0 = 90;

  D.define({
    id: 'singly-search',
    title: T('Tekil bağlı liste: doğrusal arama (karşılaştırma sayacı)', 'Singly linked list: linear search (with a comparison count)'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 değer, aranan ortada', '10 values, the target is in the middle'),
        data: { list: [12, 45, 3, 78, 23, 56, 89, 1, 67, 34], queries: [23] } },
      { id: 'hard', level: 'hard', name: T('12 değer, yinelenenler -- ilk eşleşme kazanır', '12 values with duplicates -- the first match wins'),
        data: { list: [8, 15, 8, 22, 40, 8, 55, 61, 8, 70, 80, 90], queries: [8] } },
      { id: 'first-last-missing', level: 'edge', name: T('İlk eleman, son eleman ve listede olmayan bir değer', 'The first element, the last element, and a value that is not present'),
        data: { list: [12, 45, 3, 78, 23, 56, 89, 1, 67, 34], queries: [12, 34, 999] } },
      { id: 'empty-list', level: 'edge', name: T('Boş listede arama', 'Search on an empty list'),
        data: { list: [], queries: [1] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of values in the list to search -- every example must have at least 10 (the empty-list edge case is small). */
    size: function (d) { return d.list.length; },
    /** Independent computation of the expected outcome: a plain loop, no shared helper with build(). */
    reference: function (d) {
      var results = d.queries.map(function (q) {
        var idx = -1, comparisons = 0;
        for (var i = 0; i < d.list.length; i++) {
          comparisons++;
          if (d.list[i] === q) { idx = i; break; }
        }
        return { index: idx, comparisons: comparisons };
      });
      return { results: results };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level];
      var lo = level === 'extreme' ? -500 : 1, hi = level === 'extreme' ? 500 : 99;
      var list = [];
      for (var i = 0; i < n; i++) list.push(D.randInt(r, lo, hi));
      var queries = [];
      for (var q = 0; q < 3; q++) queries.push(r() < 0.3 ? D.randInt(r, hi + 1000, hi + 2000) : list[D.randInt(r, 0, list.length - 1)]);
      return { list: list, queries: queries };
    },
    input: {
      hint: T('Örnek: 12 45 3 78 23 | 23 999   (dikey çizgiden önce liste, sonra aranan değerler)',
              'Example: 12 45 3 78 23 | 23 999   (list before the bar, target values after)'),
      parse: function (text) {
        var parts = String(text).split('|');
        if (parts.length !== 2) throw T('Bir tane "|" ile listeyi ve aranan değerleri ayırın.', 'Use exactly one "|" to separate the list from the target values.');
        var list = D.parseInts(parts[0]), queries = D.parseInts(parts[1]);
        if (!queries.length) throw T('En az bir aranan değer yazın.', 'Write at least one target value.');
        if (list.length > 30) throw T('En çok 30 değer.', 'At most 30 values.');
        return { list: list, queries: queries };
      },
      format: function (d) { return d.list.join(' ') + ' | ' + d.queries.join(' '); },
      bad: ['', '5 x 7 | 3', '1 2 3 |', '3.5 | 1', '|']
    },
    build: function (S, d) {
      var ids = [];
      for (var i = 0; i < d.list.length; i++) {
        var row = Math.floor(i / ROWCAP), col = i % ROWCAP;
        var id = 'n' + i;
        S.node(id, { x: X0 + col * DX, y: Y0 + row * ROWH, value: String(d.list[i]), isNull: i === d.list.length - 1 });
        if (i > 0) S.arrow('o' + ids[i - 1], { from: ids[i - 1], to: id, kind: 'next' });
        ids.push(id);
        S.label('i' + i, { x: X0 + col * DX + 18, y: Y0 + row * ROWH - 16, text: '[' + i + ']', style: 'dim', size: 11, mono: true });
      }
      if (!ids.length) S.label('anchor', { x: X0, y: Y0, text: 'NULL', style: 'dim', size: 15, mono: true });
      S.pointer('head', { target: ids.length ? ids[0] : 'anchor', text: 'head', side: 'top', dist: 28 });
      S.step(T(ids.length ? 'Liste hazır (' + ids.length + ' düğüm). Şimdi `search(head, value)` çağıracağız.' : 'Liste boş (`head == NULL`). `search` yine de çalışır.',
               ids.length ? 'The list is ready (' + ids.length + ' nodes). We will now call `search(head, value)`.' : 'The list is empty (`head == NULL`). `search` still works.'), { c: 6, java: 6 });

      function clean() { ids.forEach(function (id) { S.set(id, { style: 'normal' }); }); }

      var results = [];
      d.queries.forEach(function (q, qi) {
        clean();
        S.label('cnt', { x: X0 + Math.min(ROWCAP, Math.max(ids.length, 1)) * DX + 30, y: 30, text: T('karşılaştırma: 0', 'comparisons: 0'), style: 'dim', size: 15, bold: true });
        var detailed = qi === 0;
        var comparisons = 0, foundIdx = -1;
        S.step(T((qi + 1) + '. `search(head, ' + q + ')`: `index = 0`, `cur = head`.', (qi + 1) + '. `search(head, ' + q + ')`: `index = 0`, `cur = head`.'), { c: [7, 8], java: [8, 9] });
        for (var i = 0; i < ids.length; i++) {
          comparisons++;
          S.set(ids[i], { style: 'active' });
          S.set('cnt', { text: T('karşılaştırma: ' + comparisons, 'comparisons: ' + comparisons) });
          if (d.list[i] === q) {
            foundIdx = i;
            S.set(ids[i], { style: 'hl' });
            S.step(T('`cur->data` (' + d.list[i] + ') == ' + q + ': bulundu, konum ' + i + ' döner.', '`cur->data` (' + d.list[i] + ') == ' + q + ': found, returns position ' + i + '.'), { c: [9, 10], java: [10, 11] });
            break;
          }
          if (detailed || i === ids.length - 1) {
            S.step(T('`cur->data` (' + d.list[i] + ') != ' + q + ': `index++`, `cur = cur->next`.', '`cur->data` (' + d.list[i] + ') != ' + q + ': `index++`, `cur = cur->next`.'), { c: [9, 11], java: [10, 12] });
          }
          S.set(ids[i], { style: 'dim' });
        }
        if (foundIdx < 0) {
          S.step(T('`cur == NULL`: liste bitti, `' + q + '` bulunamadı. `-1` döner. Toplam ' + comparisons + ' karşılaştırma.',
                   '`cur == NULL`: the list is over, `' + q + '` was not found. It returns `-1`. ' + comparisons + ' comparisons in total.'), { c: 12, java: 13 });
        }
        results.push({ index: foundIdx, comparisons: comparisons });
      });
      clean();
      if (S.has('cnt')) S.remove('cnt');
      S.result = { results: results };
      S.step(T('Bitti: ' + results.length + ' arama. Sonuçlar (konum, karşılaştırma): ' + results.map(function (r) { return '(' + r.index + ', ' + r.comparisons + ')'; }).join(', ') + '.',
               'Done: ' + results.length + ' search' + (results.length === 1 ? '' : 'es') + '. Results (index, comparisons): ' + results.map(function (r) { return '(' + r.index + ', ' + r.comparisons + ')'; }).join(', ') + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
