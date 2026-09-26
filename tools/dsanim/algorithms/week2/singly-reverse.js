/* Week 2 -- singly linked list: iterative reverse with three pointers (`prev`, `curr`, `next`). Each node's
 * arrow is flipped one at a time. Edge cases: empty list, one node, two nodes; plus a normal 10-node and a
 * hard 20-node list. Program: singly_reverse.c / SinglyReverse.java. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct Node {',
    '    int data;',
    '    struct Node *next;',
    '} Node;',
    '',
    'Node *reverse(Node *head) {',
    '    Node *prev = NULL;',
    '    Node *curr = head;',
    '    while (curr != NULL) {',
    '        Node *next = curr->next;   /* save the rest of the list */',
    '        curr->next = prev;          /* flip this node\'s arrow */',
    '        prev = curr;                 /* prev catches up */',
    '        curr = next;                 /* curr moves on */',
    '    }',
    '    return prev;                     /* prev is the new head */',
    '}'
  ];
  var JAVA = [
    'class Node {',
    '    int data;',
    '    Node next;',
    '    Node(int data) { this.data = data; }',
    '}',
    '',
    'static Node reverse(Node head) {',
    '    Node prev = null;',
    '    Node curr = head;',
    '    while (curr != null) {',
    '        Node next = curr.next;    // save the rest of the list',
    '        curr.next = prev;          // flip this node\'s arrow',
    '        prev = curr;                // prev catches up',
    '        curr = next;                // curr moves on',
    '    }',
    '    return prev;                    // prev is the new head',
    '}'
  ];
  var ROWCAP = 10, DX = 92, ROWH = 168, X0 = 100, Y0 = 90;

  D.define({
    id: 'singly-reverse',
    title: T('Tekil bağlı liste: yineli tersine çevirme (üç işaretçi)', 'Singly linked list: iterative reverse (three pointers)'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 düğüm', '10 nodes'),
        data: { list: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] } },
      { id: 'hard', level: 'hard', name: T('20 düğüm (yinelenen/negatif değerler, iki satır)', '20 nodes (duplicates/negatives, two rows)'),
        data: { list: [5, -3, 5, 0, -3, 8, 8, -1, 2, -3, 100, -100, 7, 7, -50, 63, -8, 19, 0, 44] } },
      { id: 'empty', level: 'edge', name: T('Boş liste', 'Empty list'), data: { list: [] }, small: true },
      { id: 'one-node', level: 'edge', name: T('Tek düğüm', 'A single node'), data: { list: [7] }, small: true },
      { id: 'two-nodes', level: 'edge', name: T('İki düğüm', 'Two nodes'), data: { list: [1, 2] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of nodes in the list -- normal/hard examples have at least 10; the small edge cases are marked `small`. */
    size: function (d) { return d.list.length; },
    /** Independent computation of the expected outcome: a plain reversed copy, no shared helper with build(). */
    reference: function (d) { return { list: d.list.slice().reverse() }; },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 20, extreme: 24 }[level];
      var lo = level === 'extreme' ? -500 : 1, hi = level === 'extreme' ? 500 : 99;
      var list = [];
      for (var i = 0; i < n; i++) list.push(D.randInt(r, lo, hi));
      return { list: list };
    },
    input: {
      hint: T('Örnek: 10 20 30 40   (tersine çevrilecek liste; boş bırakılabilir)', 'Example: 10 20 30 40   (the list to reverse; may be left empty)'),
      parse: function (text) {
        var t = String(text).trim();
        if (!t) return { list: [] };
        var list = D.parseInts(t);
        if (list.length > 30) throw T('En çok 30 değer.', 'At most 30 values.');
        return { list: list };
      },
      format: function (d) { return d.list.join(' '); },
      bad: ['5 x 7', '3.5', '1, 2, x', '1;;2;x']
    },
    build: function (S, d) {
      var n = d.list.length, ids = [];
      S.label('anchor', { x: X0 - 74, y: Y0 + 18, text: 'NULL', style: 'dim', size: 15, mono: true });
      for (var i = 0; i < n; i++) {
        var row = Math.floor(i / ROWCAP), col = i % ROWCAP, id = 'n' + i;
        S.node(id, { x: X0 + col * DX, y: Y0 + row * ROWH, value: String(d.list[i]), isNull: i === n - 1 });
        if (i > 0) S.arrow('o' + ids[i - 1], { from: ids[i - 1], to: id, kind: 'next' });
        ids.push(id);
      }
      S.pointer('head', { target: n ? ids[0] : 'anchor', text: 'head', side: 'top', dist: 44 });
      if (!n) {
        S.step(T('Liste boş: `head == NULL`. `reverse(NULL)`: döngü hiç çalışmaz, `prev` (`NULL`) doğrudan döner.',
                 'The list is empty: `head == NULL`. `reverse(NULL)`: the loop never runs, `prev` (`NULL`) is returned right away.'), { c: [7, 8, 9, 15], java: [8, 9, 10, 16] });
        S.result = { list: [] };
        return;
      }
      S.pointer('prevP', { target: 'anchor', text: 'prev', side: 'bottom', dist: 30 });
      S.pointer('currP', { target: ids[0], text: 'curr', side: 'top', dist: 30 });
      S.step(T('`prev = NULL`; `curr = head`. Şimdi listeyi tek geçişte tersine çevireceğiz.',
               '`prev = NULL`; `curr = head`. We will now reverse the list in a single pass.'), { c: [7, 8], java: [8, 9] });

      function clean() { ids.forEach(function (id) { S.set(id, { style: 'normal' }); }); }

      for (var k = 0; k < n; k++) {
        var currId = ids[k], prevId = k > 0 ? ids[k - 1] : null, nextId = k + 1 < n ? ids[k + 1] : null;
        var detailed = k < 2;
        clean(); S.set(currId, { style: 'active' });
        if (detailed) {
          S.step(T('`next = curr->next`: ' + (nextId ? 'geri kalan liste (`' + d.list[k + 1] + '`\'den başlayan kısım) kaydedilir.' : '`curr->next` zaten `NULL`, kaydedilecek bir şey yok.'),
                   '`next = curr->next`: ' + (nextId ? 'the rest of the list (starting at `' + d.list[k + 1] + '`) is saved.' : '`curr->next` is already `NULL`, there is nothing to save.')), { c: 10, java: 11 });
        }
        S.remove('o' + currId);
        if (prevId) { S.arrow('o' + currId, { from: currId, to: prevId, kind: 'next', style: 'new' }); S.set(currId, { isNull: false }); }
        else S.set(currId, { isNull: true });
        S.step(T((detailed ? '`curr->next = prev`: ' : '`curr` (' + d.list[k] + '): ') + 'düğümün oku çevrildi -- artık ' + (prevId ? '`' + d.list[k - 1] + '`\'i' : '`NULL`\'ı') + ' gösteriyor.',
                 (detailed ? '`curr->next = prev`: ' : '`curr` (' + d.list[k] + '): ') + 'this node\'s arrow is flipped -- it now points at ' + (prevId ? '`' + d.list[k - 1] + '`' : '`NULL`') + '.'), { c: 11, java: 12 });
        S.set('prevP', { target: currId });
        if (nextId) S.set('currP', { target: nextId }); else S.remove('currP');
        if (detailed) {
          S.step(T('`prev = curr`; `curr = next`: her iki işaretçi de bir düğüm ileri gider.', '`prev = curr`; `curr = next`: both pointers move one node further.'), { c: [12, 13], java: [13, 14] });
        }
        S.set(currId, { style: 'dim' });
      }
      clean();
      S.set('head', { target: ids[n - 1] });
      if (S.has('prevP')) S.remove('prevP');
      S.step(T('`curr == NULL`: döngü bitti. `prev`, yeni baş olan eski son düğümü gösteriyor; `head` de artık onu gösteriyor.',
               '`curr == NULL`: the loop is done. `prev` points at the old last node, which is the new head; `head` now points there too.'), { c: [9, 15], java: [10, 16] });
      S.result = { list: ids.slice().reverse().map(function (id) { return Number(S.get(id).value); }) };
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
