/* Week 2 -- circular linked list: insert at the tail (no separate head pointer -- `tail->next` IS the head),
 * delete by value (scanning forward from the head, since there is no `prev` link), and a full traversal that
 * wraps around and stops back at the start. The wrap-around arrow (tail -> head) is drawn as a curve under the
 * row; a one-node list is drawn with a small loop pointing back at itself, and deleting that node empties the
 * list. Program: circular_linked_list.c / CircularLinkedList.java. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct Node {',
    '    int data;',
    '    struct Node *next;',
    '} Node;',
    '',
    "/* 'tail' always points at the last-inserted node; tail->next is the head. */",
    'Node *insert_tail(Node *tail, int value) {',
    '    Node *n = malloc(sizeof(Node));',
    '    n->data = value;',
    '    if (tail == NULL) {',
    '        n->next = n;            /* a single node points at itself */',
    '        return n;',
    '    }',
    '    n->next = tail->next;       /* new node -> old head */',
    '    tail->next = n;             /* old tail -> new node */',
    '    return n;                   /* new node is the new tail */',
    '}',
    '',
    '/* Deletes the FIRST node holding value, scanning forward from the head (no prev link to walk backward).',
    '   Returns the (possibly updated) tail via the return value; *found reports success. */',
    'Node *delete_value(Node *tail, int value, bool *found) {',
    '    *found = false;',
    '    if (tail == NULL) return NULL;               /* empty list */',
    '    Node *prev = tail, *cur = tail->next;         /* cur starts at the head */',
    '    int n = list_size(tail);',
    '    for (int i = 0; i < n; i++) {',
    '        if (cur->data == value) {',
    '            *found = true;',
    '            if (cur == cur->next) {               /* the only node in the list */',
    '                free(cur);',
    '                return NULL;                       /* list becomes empty */',
    '            }',
    '            prev->next = cur->next;                /* unlink cur */',
    '            Node *new_tail = (cur == tail) ? prev : tail;',
    '            free(cur);',
    '            return new_tail;',
    '        }',
    '        prev = cur;',
    '        cur = cur->next;',
    '    }',
    '    return tail;                                   /* not found: unchanged */',
    '}',
    '',
    'void traverse(Node *tail, int laps) {',
    '    Node *head = tail->next;',
    '    Node *cur = head;',
    '    int steps = list_size(tail) * laps;',
    '    for (int i = 0; i < steps; i++) {',
    '        printf(" %d", cur->data);',
    '        cur = cur->next;',
    '    }',
    '}'
  ];
  var JAVA = [
    'class Node { int data; Node next; Node(int d) { data = d; } }',
    '',
    '// \'tail\' always points at the last-inserted node; tail.next is the head.',
    'static Node insertTail(Node tail, int value) {',
    '    Node n = new Node(value);',
    '    if (tail == null) {',
    '        n.next = n;              // a single node points at itself',
    '        return n;',
    '    }',
    '    n.next = tail.next;          // new node -> old head',
    '    tail.next = n;               // old tail -> new node',
    '    return n;                    // new node is the new tail',
    '}',
    '',
    '// Deletes the FIRST node holding value, scanning forward from the head (no prev link to walk backward).',
    '// Returns the (possibly updated) tail; sets `found` to report success.',
    'static boolean found;',
    'static Node deleteValue(Node tail, int value) {',
    '    found = false;',
    '    if (tail == null) return null;                // empty list',
    '    Node prev = tail, cur = tail.next;             // cur starts at the head',
    '    int n = listSize(tail);',
    '    for (int i = 0; i < n; i++) {',
    '        if (cur.data == value) {',
    '            found = true;',
    '            if (cur == cur.next) {                 // the only node in the list',
    '                return null;                        // list becomes empty',
    '            }',
    '            prev.next = cur.next;                   // unlink cur',
    '            return (cur == tail) ? prev : tail;',
    '        }',
    '        prev = cur;',
    '        cur = cur.next;',
    '    }',
    '    return tail;                                    // not found: unchanged',
    '}',
    '',
    'static void traverse(Node tail, int laps) {',
    '    Node head = tail.next;',
    '    Node cur = head;',
    '    int steps = listSize(tail) * laps;',
    '    for (int i = 0; i < steps; i++) {',
    '        System.out.print(" " + cur.data);',
    '        cur = cur.next;',
    '    }',
    '}'
  ];
  var L_STRUCT = { c: [6], java: [3] };
  var L_INSERT_SINGLE = { c: [10, 11, 12], java: [6, 7, 8] };
  var L_INSERT_LINK = { c: [13, 14, 15], java: [10, 11, 12] };
  var L_DELETE_EMPTY = { c: [21], java: [19] };
  var L_DELETE_SCAN = { c: [23, 24, 25], java: [21, 22, 23] };
  var L_DELETE_SINGLE = { c: [27, 28, 29], java: [25, 26, 27] };
  var L_DELETE_UNLINK = { c: [31, 32, 33, 34], java: [28, 29] };
  var L_DELETE_NOTFOUND = { c: [39], java: [33] };
  var L_TRAVERSE = { c: [46, 47], java: [40, 41] };
  var DX = 96, Y0 = 130, X0 = 130;

  function ins(v) { return v; }
  function del(v) { return 'd' + v; }
  function isDel(o) { return typeof o === 'string'; }
  function delVal(o) { return Number(o.slice(1)); }

  D.define({
    id: 'circular-linked-list',
    title: T('Dairesel bağlı liste: ekleme, değere göre silme, sarılan gezinme', 'Circular linked list: insert, delete by value, a traversal that wraps around'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 ekle, ortadan bir değer sil, 2 tur', '10 inserts, delete one value from the middle, 2 laps'),
        data: { ops: [ins(10), ins(20), ins(30), ins(40), ins(50), del(30), ins(60), ins(70), ins(80), ins(90), ins(100)], laps: 2 } },
      { id: 'hard', level: 'hard', name: T('12 ekle (yinelenen), 2 silme (biri bulunamaz), 3 tur', '12 inserts (duplicates), 2 deletes (one not found), 3 laps'),
        data: { ops: [ins(5), ins(5), ins(20), ins(30), del(5), ins(5), ins(40), ins(50), ins(5), ins(60), ins(70), del(12345), ins(80), ins(5)], laps: 3 } },
      { id: 'delete-tail', level: 'edge', name: T('Son eklenen (tail) düğüm silinir: tail güncellenir', 'The last-inserted (tail) node is deleted: tail is updated'),
        data: { ops: [ins(1), ins(2), ins(3), ins(4), ins(5), ins(6), ins(7), ins(8), ins(9), ins(10), del(10)], laps: 3 } },
      { id: 'delete-head', level: 'edge', name: T('İlk eklenen (baş) düğüm silinir: tail->next değişir', 'The first-inserted (head) node is deleted: tail->next changes'),
        data: { ops: [ins(11), ins(12), ins(13), ins(14), ins(15), ins(16), ins(17), ins(18), ins(19), ins(20), del(11)], laps: 2 } },
      { id: 'one-node-to-empty', level: 'edge', name: T('Tek düğüm: silinince liste boşalır', 'A single node: deleting it empties the list'),
        data: { ops: [ins(42), del(42)], laps: 5 }, small: true },
      { id: 'not-found', level: 'edge', name: T('10 ekle, listede olmayan bir değer silinmeye çalışılır', '10 inserts, an attempt to delete a value that is not in the list'),
        data: { ops: [ins(3), ins(6), ins(9), ins(12), ins(15), ins(18), ins(21), ins(24), ins(27), ins(30), del(999)], laps: 2 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of insert_tail calls -- delete calls do not count toward the input size. */
    size: function (d) { return d.ops.filter(function (o) { return !isDel(o); }).length; },
    /** Independent computation: a plain array simulation (push / indexOf+splice), no shared helper with build(). */
    reference: function (d) {
      var list = [], removed = 0, notFound = 0;
      d.ops.forEach(function (o) {
        // independent of isDel()/delVal(): deletes are the tokens stored as text ('d7'), inserts are numbers
        if (typeof o !== 'number') {
          var v = parseInt(String(o).replace('d', ''), 10), idx = list.indexOf(v);
          if (idx >= 0) { list.splice(idx, 1); removed++; } else notFound++;
        } else list.push(o);
      });
      var n = list.length;
      if (!n) return { values: [], traversal: [], removed: removed, notFound: notFound };
      var steps = n * d.laps, out = [];
      for (var i = 0; i < steps; i++) out.push(list[i % n]);
      return { values: list, traversal: out, removed: removed, notFound: notFound };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 11, hard: 13, extreme: 16 }[level];
      var lo = level === 'extreme' ? -500 : 1, hi = level === 'extreme' ? 500 : 99;
      var ops = [], list = [], i;
      for (i = 0; i < n; i++) { var v = D.randInt(r, lo, hi); ops.push(ins(v)); list.push(v); }
      var delCount = D.randInt(r, 1, 3);
      for (i = 0; i < delCount; i++) {
        if (list.length && r() < 0.75) { var pick = list[D.randInt(r, 0, list.length - 1)]; ops.push(del(pick)); list.splice(list.indexOf(pick), 1); }
        else ops.push(del(D.randInt(r, hi + 1000, hi + 2000)));
      }
      var laps = D.randInt(r, 1, level === 'extreme' ? 5 : 3);
      return { ops: ops, laps: laps };
    },
    input: {
      hint: T('Örnek: 10 20 30 d20 40 | 2   (sayı = insert_tail, dN = N değerini sil, | sonrası tur sayısı)',
              'Example: 10 20 30 d20 40 | 2   (number = insert_tail, dN = delete value N, lap count after the bar)'),
      parse: function (text) {
        var parts = String(text).split('|');
        if (parts.length !== 2) throw T('Bir tane "|" ile işlemleri ve tur sayısını ayırın.', 'Use exactly one "|" to separate the operations from the lap count.');
        var toks = parts[0].trim() ? parts[0].trim().split(/[\s,;]+/).filter(Boolean) : [];
        var ops = toks.map(function (t) {
          if (/^d-?\d+$/i.test(t)) return 'd' + t.slice(1);
          if (/^-?\d+$/.test(t)) return parseInt(t, 10);
          throw T('"' + t + '" anlaşılmadı: sayı (ekle) ya da dN (sil) yazın.', '"' + t + '" is not understood: write a number (insert) or dN (delete).');
        });
        var lapsTok = parts[1].trim();
        if (!/^\d+$/.test(lapsTok)) throw T('Tur sayısı pozitif bir tamsayı olmalı.', 'The lap count must be a positive integer.');
        var laps = parseInt(lapsTok, 10);
        if (laps < 1 || laps > 10) throw T('Tur sayısı 1 ile 10 arasında olmalı.', 'The lap count must be between 1 and 10.');
        if (ops.length > 40) throw T('En çok 40 işlem.', 'At most 40 operations.');
        return { ops: ops, laps: laps };
      },
      format: function (d) { return d.ops.map(String).join(' ') + ' | ' + d.laps; },
      tokens: function (d) { return d.ops.map(String); },
      bad: ['', '5 x 7 | 2', '1 2 3 | 0', '1 2 | x', '1 2 3']
    },
    build: function (S, d) {
      var ids = [], seq = 0;

      function rewireArrows() {
        var n = ids.length;
        for (var k = 0; k < n; k++) {
          var last = k === n - 1;
          var target = !last ? ids[k + 1] : (n === 1 ? ids[k] : ids[0]);
          var type = (!last || n === 1) ? 'next' : 'center';
          var bend = !last ? 0 : (n === 1 ? 58 : -70);
          var style = !last ? 'normal' : 'active';
          var text = (last && n > 1) ? T('sarılır', 'wraps') : null;
          if (S.has('o' + ids[k])) S.set('o' + ids[k], { from: ids[k], to: target, type: type, bend: bend, style: style, text: text });
          else S.arrow('o' + ids[k], { from: ids[k], to: target, kind: type, bend: bend, style: style, text: text });
        }
      }
      function relayout() { for (var i = 0; i < ids.length; i++) S.move(ids[i], X0 + i * DX, Y0); }
      function pointTail() {
        if (ids.length) { if (S.has('tailP')) S.set('tailP', { target: ids[ids.length - 1] }); else S.pointer('tailP', { target: ids[ids.length - 1], text: 'tail', side: 'top', dist: 30 }); }
        else if (S.has('tailP')) S.remove('tailP');
      }
      function clean() { ids.forEach(function (id) { S.set(id, { style: 'normal' }); }); }
      function showEmpty() {
        if (!ids.length && !S.has('empty')) S.label('empty', { x: X0, y: Y0, text: T('(boş)', '(empty)'), style: 'dim', size: 18 });
        else if (ids.length && S.has('empty')) S.remove('empty');
      }

      showEmpty();
      S.step(T('`tail` en son eklenen düğümü gösterir; `tail->next` her zaman başı gösterir -- ayrı bir `head` işaretçisi yok. Silme, `prev` olmadığı için baştan taranarak yapılır.',
               '`tail` points at the last-inserted node; `tail->next` always points at the head -- there is no separate `head` pointer. Deletion scans from the head, since there is no `prev` link.'), L_STRUCT);

      var insSeen = 0, delSeen = 0;
      d.ops.forEach(function (o, opIdx) {
        S.at(opIdx);
        if (!isDel(o)) {
          insSeen++;
          var nid = 'n' + (seq++);
          var detailed = insSeen <= 2;
          if (ids.length === 0) {
            S.node(nid, { x: X0, y: Y0, value: String(o), style: 'new' });
            ids.push(nid); relayout(); rewireArrows(); pointTail(); showEmpty(); clean();
            if (detailed) S.step(T('`insert_tail(NULL, ' + o + ')`: `tail == NULL`, o yüzden tek düğüm oluşturulur ve `n->next = n` -- kendine dönen küçük bir döngü.',
                                    '`insert_tail(NULL, ' + o + ')`: `tail == NULL`, so a single node is created and `n->next = n` -- a small loop back to itself.'), L_INSERT_SINGLE);
          } else {
            S.node(nid, { x: X0 + ids.length * DX, y: Y0, value: String(o), style: 'new' });
            ids.push(nid); relayout(); rewireArrows(); pointTail(); clean();
            if (detailed) S.step(T('`insert_tail(tail, ' + o + ')`: yeni düğüm eski `tail`\'in ardına girer ve eski başı gösterir; yeni düğüm artık `tail`.',
                                    '`insert_tail(tail, ' + o + ')`: the new node goes right after the old `tail` and points at the old head; the new node is now `tail`.'), L_INSERT_LINK);
          }
          if (!detailed) S.step(T('`insert_tail(tail, ' + o + ')`.', '`insert_tail(tail, ' + o + ')`.'), L_INSERT_LINK);
        } else {
          delSeen++;
          var value = delVal(o), detailedD = delSeen <= 2;
          clean();
          if (!ids.length) {
            S.step(T('`delete_value(NULL, ' + value + ', &found)`: liste boş, `found = false`.', '`delete_value(NULL, ' + value + ', &found)`: the list is empty, `found = false`.'), L_DELETE_EMPTY);
            return;
          }
          var idx = -1;
          for (var s = 0; s < ids.length; s++) if (Number(S.get(ids[s]).value) === value) { idx = s; break; }
          if (idx < 0) {
            S.step(T('`delete_value(tail, ' + value + ', &found)`: `n = list_size(tail) = ' + ids.length + '` adım tarandı, bulunamadı. `found = false`.',
                     '`delete_value(tail, ' + value + ', &found)`: scanned all `n = list_size(tail) = ' + ids.length + '` steps, not found. `found = false`.'), L_DELETE_NOTFOUND);
            return;
          }
          S.set(ids[idx], { style: 'hl' });
          var where = ids.length === 1 ? T('listedeki tek düğüm', 'the only node in the list')
            : idx === 0 ? T('baş düğüm (tail->next)', 'the head node (tail->next)')
            : (idx === ids.length - 1 ? T('tail düğümü', 'the tail node') : T('ortadaki bir düğüm', 'a middle node'));
          if (detailedD) S.step(T('`delete_value(tail, ' + value + ', &found)`: bulundu (' + where.tr + ').', '`delete_value(tail, ' + value + ', &found)`: found (' + where.en + ').'), L_DELETE_SCAN);
          if (ids.length === 1) {
            S.remove('o' + ids[idx]);
            S.remove(ids[idx]);
            ids = [];
            if (S.has('tailP')) S.remove('tailP');
            showEmpty();
            S.step(T('Listede tek düğüm vardı (`cur == cur->next`): `free(cur)`, liste boş kaldı (`tail = NULL`).', 'There was only one node (`cur == cur->next`): `free(cur)`, the list is now empty (`tail = NULL`).'), L_DELETE_SINGLE);
          } else {
            var wasTail = idx === ids.length - 1;
            S.remove('o' + ids[idx]);
            S.remove(ids[idx]);
            ids.splice(idx, 1);
            relayout(); rewireArrows(); if (wasTail) pointTail(); clean();
            S.step(T('`free(cur)`: bağlar yeniden kurulur' + (wasTail ? ', `tail` bir önceki düğümü gösterir.' : '.'), '`free(cur)`: the links are relinked' + (wasTail ? ', `tail` now points at the previous node.' : '.')), L_DELETE_UNLINK);
          }
        }
      });
      S.at(null);

      /** removed/notFound, computed directly from d.ops (the same way reference() does it) -- not read back from
       *  the live Scene, so this count is independent of anything build() drew along the way. */
      var removed = 0, notFound = 0;
      (function () {
        var list = [];
        d.ops.forEach(function (o) {
          if (isDel(o)) { var v = delVal(o), idx3 = list.indexOf(v); if (idx3 >= 0) { list.splice(idx3, 1); removed++; } else notFound++; }
          else list.push(o);
        });
      })();

      var n = ids.length;
      if (!n) {
        S.step(T('`traverse(NULL, ' + d.laps + ')`: gösterilecek düğüm yok.', '`traverse(NULL, ' + d.laps + ')`: there is nothing to show.'), L_TRAVERSE);
        S.result = { values: [], traversal: [], removed: removed, notFound: notFound };
        return;
      }
      var finalValues = ids.map(function (id) { return Number(S.get(id).value); });
      var steps = n * d.laps, lap = 0;
      for (var st = 0; st < steps; st++) {
        var idx2 = st % n;
        if (st > 0 && idx2 === 0) lap++;
        if (lap === 0) {
          clean(); if (n) S.set(ids[idx2], { style: 'active' });
          S.step(T('gez: `cur->data` = ' + finalValues[idx2] + (idx2 === n - 1 ? ' -- `cur = cur->next` sarılıp 1. düğüme döner.' : ' -- `cur = cur->next`.'),
                   'walk: `cur->data` = ' + finalValues[idx2] + (idx2 === n - 1 ? ' -- `cur = cur->next` wraps back to node 1.' : ' -- `cur = cur->next`.')), L_TRAVERSE);
          if (idx2 === n - 1 && d.laps > 1) {
            S.step(T('Bir tur tamamlandı: başa (' + finalValues[0] + ') geri dönüldü. Dairesel listede "son" yok -- gezinme `steps` kadar sürer.',
                     'One lap is complete: we are back at the start (' + finalValues[0] + '). There is no "end" in a circular list -- traversal runs for `steps` steps.'), { c: [], java: [] });
          }
        } else if (idx2 === 0) {
          clean(); S.set(ids[0], { style: 'active' });
          S.step(T((lap + 1) + '. tur başlıyor: yine ' + finalValues[0] + '\'dan.', 'Lap ' + (lap + 1) + ' begins: back at ' + finalValues[0] + ' again.'), L_TRAVERSE);
        }
      }
      clean();
      var out = [];
      for (var q = 0; q < steps; q++) out.push(finalValues[q % n]);
      S.result = { values: finalValues, traversal: out, removed: removed, notFound: notFound };
      S.step(T('Bitti: ' + d.laps + ' tur, toplam ' + steps + ' adım (' + n + ' düğüm x ' + d.laps + '), ' + removed + ' silme (' + notFound + ' bulunamadı). Gezinme: ' + (out.length ? out.join(', ') : '(yok)') + '.',
               'Done: ' + d.laps + ' laps, ' + steps + ' steps in total (' + n + ' nodes x ' + d.laps + '), ' + removed + ' deletion' + (removed === 1 ? '' : 's') + ' (' + notFound + ' not found). Traversal: ' + (out.length ? out.join(', ') : '(none)') + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
