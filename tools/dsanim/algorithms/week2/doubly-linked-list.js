/* Week 2 -- doubly linked list: insert at the front, at the back and after a given value, delete anywhere by
 * value (front, back, or a middle node), and traverse backwards. Every node draws two arrows: `next` (curving
 * above the row) and `prev` (curving below the row), so they never overlap. Program: doubly_linked_list.c /
 * DoublyLinkedList.java. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct Node {',
    '    int data;',
    '    struct Node *prev;',
    '    struct Node *next;',
    '} Node;',
    'typedef struct { Node *head; Node *tail; } List;',
    '',
    'void insert_head(List *list, int value) {',
    '    Node *n = malloc(sizeof(Node));',
    '    n->data = value; n->prev = NULL; n->next = list->head;',
    '    if (list->head != NULL) list->head->prev = n;  /* old head now has a prev */',
    '    list->head = n;',
    '    if (list->tail == NULL) list->tail = n;',
    '}',
    '',
    'void insert_tail(List *list, int value) {',
    '    Node *n = malloc(sizeof(Node));',
    '    n->data = value; n->next = NULL; n->prev = list->tail;',
    '    if (list->tail != NULL) list->tail->next = n;  /* old tail now has a next */',
    '    list->tail = n;',
    '    if (list->head == NULL) list->head = n;',
    '}',
    '',
    'bool insert_after(List *list, int target, int value) {',
    '    for (Node *cur = list->head; cur != NULL; cur = cur->next) {',
    '        if (cur->data == target) {',
    '            Node *n = malloc(sizeof(Node));',
    '            n->data = value; n->prev = cur; n->next = cur->next;',
    '            if (cur->next != NULL) cur->next->prev = n; else list->tail = n;  /* cur was the tail */',
    '            cur->next = n;',
    '            return true;',
    '        }',
    '    }',
    '    return false;                                    /* target not found */',
    '}',
    '',
    'bool delete_value(List *list, int value) {',
    '    for (Node *cur = list->head; cur != NULL; cur = cur->next) {',
    '        if (cur->data == value) {',
    '            if (cur->prev != NULL) cur->prev->next = cur->next; else list->head = cur->next;',
    '            if (cur->next != NULL) cur->next->prev = cur->prev; else list->tail = cur->prev;',
    '            free(cur);',
    '            return true;',
    '        }',
    '    }',
    '    return false;',
    '}',
    '',
    'void print_backward(List *list) {',
    '    for (Node *cur = list->tail; cur != NULL; cur = cur->prev)',
    '        printf(" %d", cur->data);',
    '}'
  ];
  var JAVA = [
    'class Node { int data; Node prev, next; Node(int d) { data = d; } }',
    'class List { Node head, tail; }',
    '',
    'static void insertHead(List list, int value) {',
    '    Node n = new Node(value);',
    '    n.next = list.head;',
    '    if (list.head != null) list.head.prev = n;  // old head now has a prev',
    '    list.head = n;',
    '    if (list.tail == null) list.tail = n;',
    '}',
    '',
    'static void insertTail(List list, int value) {',
    '    Node n = new Node(value);',
    '    n.prev = list.tail;',
    '    if (list.tail != null) list.tail.next = n;  // old tail now has a next',
    '    list.tail = n;',
    '    if (list.head == null) list.head = n;',
    '}',
    '',
    'static boolean insertAfter(List list, int target, int value) {',
    '    for (Node cur = list.head; cur != null; cur = cur.next) {',
    '        if (cur.data == target) {',
    '            Node n = new Node(value);',
    '            n.prev = cur; n.next = cur.next;',
    '            if (cur.next != null) cur.next.prev = n; else list.tail = n;  // cur was the tail',
    '            cur.next = n;',
    '            return true;',
    '        }',
    '    }',
    '    return false;                                    // target not found',
    '}',
    '',
    'static boolean deleteValue(List list, int value) {',
    '    for (Node cur = list.head; cur != null; cur = cur.next) {',
    '        if (cur.data == value) {',
    '            if (cur.prev != null) cur.prev.next = cur.next; else list.head = cur.next;',
    '            if (cur.next != null) cur.next.prev = cur.prev; else list.tail = cur.prev;',
    '            return true;',
    '        }',
    '    }',
    '    return false;',
    '}',
    '',
    'static void printBackward(List list) {',
    '    for (Node cur = list.tail; cur != null; cur = cur.prev)',
    '        System.out.print(" " + cur.data);',
    '}'
  ];
  var ROWCAP = 8, DX = 108, ROWH = 190, X0 = 120, Y0 = 130;

  var L_INTRO = { c: 6, java: 3 };
  var L_HEAD_SIG = { c: 8, java: 5 };
  var L_TAIL_SIG = { c: 16, java: 12 };
  var L_HEAD_LINK = { c: [9, 10, 11], java: [6, 7, 8] };
  var L_TAIL_LINK = { c: [17, 18, 19], java: [13, 14, 15] };
  var L_AFTER_SCAN = { c: [25, 26], java: [21, 22] };
  var L_AFTER_LINK = { c: [27, 28, 29, 30], java: [23, 24, 25, 26] };
  var L_AFTER_NOTFOUND = { c: 34, java: 30 };
  var L_DEL_NOTFOUND = { c: 46, java: 41 };
  var L_DEL_FOUND = { c: 39, java: 34 };
  var L_DEL_RELINK = { c: [40, 41], java: [35, 36] };
  var L_BACK_INTRO = { c: 48, java: 43 };
  var L_BACK_WALK = { c: 49, java: 44 };

  function isDel(t) { return /^d(-?\d+)$/.test(t); }
  function delVal(t) { return +/^d(-?\d+)$/.exec(t)[1]; }
  function isHead(t) { return /^h(-?\d+)$/.test(t); }
  function isTail(t) { return /^t(-?\d+)$/.test(t); }
  function isAfter(t) { return /^a(-?\d+):(-?\d+)$/.test(t); }

  D.define({
    id: 'doubly-linked-list',
    title: T('Çift yönlü bağlı liste: ekleme, bir değerden sonra ekleme, silme, geriye gezinme', 'Doubly linked list: insert, insert after a value, delete, backward traversal'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 düğüm (baş/son karışık), ortadan sil, geriye gez', '10 nodes (alternating front/back), delete a middle node, traverse backward'),
        data: { ops: ['t10', 'h20', 't30', 'h40', 't50', 'h60', 't70', 'h80', 't90', 'h100', 'd50', 'b'] } },
      { id: 'hard', level: 'hard', name: T('12 düğüm, yinelenen/negatif; yinelenen -3\'ün İLK eşleşmesi silinir', '12 nodes, duplicates/negatives; the FIRST match of a duplicate -3 is deleted'),
        data: { ops: ['t5', 'h-3', 't5', 'h0', 't-3', 'h8', 't8', 'h-1', 't2', 'h-3', 't100', 'h-100', 'd-3', 'b'] } },
      { id: 'into-empty', level: 'edge', name: T('Boş listeye baştan ekleme', 'Insert at the front of an empty list'),
        data: { ops: ['h7', 'b'] }, small: true },
      { id: 'single-element', level: 'edge', name: T('Tek düğüm: ekle, sonra sil (liste yine boş)', 'A single node: insert it, then delete it (the list is empty again)'),
        data: { ops: ['h5', 'd5', 'b'] }, small: true },
      { id: 'head-tail-missing', level: 'edge', name: T('10 düğüm: başı sil, sonu sil, olmayan bir değeri sil', '10 nodes: delete the head, delete the tail, delete a value that is not present'),
        data: { ops: ['t10', 't20', 't30', 't40', 't50', 't60', 't70', 't80', 't90', 't100', 'd10', 'd100', 'd12345', 'b'] } },
      { id: 'insert-after-middle', level: 'edge', name: T('Ortadaki bir değerden sonra ekleme', 'Insert after a middle value'),
        data: { ops: ['t10', 't20', 't30', 't40', 't50', 't60', 't70', 't80', 't90', 't100', 'a50:55', 'b'] } },
      { id: 'insert-after-tail', level: 'edge', name: T('tail\'in gösterdiği düğümden sonra ekleme: yeni düğüm tail olur', 'Insert after the node `tail` points to: the new node becomes the new tail'),
        data: { ops: ['t10', 't20', 't30', 't40', 't50', 't60', 't70', 't80', 't90', 't100', 'a100:105', 'b'] } },
      { id: 'insert-after-not-found', level: 'edge', name: T('Listede olmayan bir değerden sonra eklemeye çalışma', 'Trying to insert after a value that is not in the list'),
        data: { ops: ['t10', 't20', 't30', 't40', 't50', 't60', 't70', 't80', 't90', 't100', 'a99999:1', 'b'] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of values inserted (front, back, or after a value) -- delete and the backward-traversal demo do not count. */
    size: function (d) { return d.ops.filter(function (t) { return isHead(t) || isTail(t) || isAfter(t); }).length; },
    /** Independent computation of the expected outcome: a plain array simulation, no shared helper with build(). */
    reference: function (d) {
      var list = [], removed = 0, notFound = 0, notFoundAfter = 0;
      d.ops.forEach(function (t) {
        // independent of isHead()/isTail()/isDel()/isAfter()/delVal(): dispatch on the first character
        var kind = t.charAt(0);
        if (kind === 'h') list.unshift(Number(t.slice(1)));
        else if (kind === 't') list.push(Number(t.slice(1)));
        else if (kind === 'd') { var v = Number(t.slice(1)); var idx = list.indexOf(v); if (idx >= 0) { list.splice(idx, 1); removed++; } else notFound++; }
        else if (kind === 'a') {
          var m = /^a(-?\d+):(-?\d+)$/.exec(t);
          var target = Number(m[1]), val = Number(m[2]);
          var idx2 = list.indexOf(target);
          if (idx2 >= 0) list.splice(idx2 + 1, 0, val); else notFoundAfter++;
        }
      });
      return { forward: list, backward: list.slice().reverse(), removed: removed, notFound: notFound, notFoundAfter: notFoundAfter };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level];
      var lo = level === 'extreme' ? -500 : 1, hi = level === 'extreme' ? 500 : 99;
      var ops = [], list = [], i;
      for (i = 0; i < n; i++) { var x = D.randInt(r, lo, hi); if (r() < 0.5) { ops.push('h' + x); list.unshift(x); } else { ops.push('t' + x); list.push(x); } }
      var afterCount = D.randInt(r, 1, 3);
      for (i = 0; i < afterCount; i++) {
        var val = D.randInt(r, lo, hi);
        if (list.length && r() < 0.8) {
          var pick = r() < 0.4 ? list[list.length - 1] : list[D.randInt(r, 0, list.length - 1)];
          ops.push('a' + pick + ':' + val);
          list.splice(list.indexOf(pick) + 1, 0, val);
        } else ops.push('a' + (hi + 1000 + i) + ':' + val);
      }
      var dels = D.randInt(r, 1, 3);
      for (i = 0; i < dels; i++) if (list.length && r() < 0.8) { var pick2 = list[D.randInt(r, 0, list.length - 1)]; ops.push('d' + pick2); list.splice(list.indexOf(pick2), 1); } else ops.push('d' + D.randInt(r, hi + 1000, hi + 2000));
      ops.push('b');
      return { ops: ops };
    },
    input: {
      hint: T('Örnek: h5 t10 a10:15 d5 b   (hN = başa, tN = sona, aT:V = T\'den sonra V ekle, dN = N\'i sil, b = geriye gez)',
              'Example: h5 t10 a10:15 d5 b   (hN = at front, tN = at back, aT:V = insert V after T, dN = delete N, b = traverse backward)'),
      parse: function (text) {
        var toks = String(text).trim().split(/[\s,;]+/).filter(Boolean);
        toks.forEach(function (t) { if (!isHead(t) && !isTail(t) && !isDel(t) && !isAfter(t) && t !== 'b') throw T('"' + t + '" anlaşılmadı: hN, tN, aT:V, dN ya da b yazın.', '"' + t + '" is not understood: write hN, tN, aT:V, dN or b.'); });
        if (!toks.length) throw T('En az bir işlem yazın.', 'Write at least one operation.');
        if (toks.length > 40) throw T('En çok 40 işlem.', 'At most 40 operations.');
        return { ops: toks };
      },
      format: function (d) { return d.ops.join(' '); },
      tokens: function (d) { return d.ops; },
      bad: ['', '5 x 7', 'insert 5', '3.5', '   ']
    },
    build: function (S, d) {
      var list = [], seq = 0, inserted = 0, removed = 0, notFound = 0, notFoundAfter = 0;
      S.label('anchorL', { x: X0 - 80, y: Y0 + 18, text: 'NULL', style: 'dim', size: 14, mono: true });
      S.pointer('head', { target: 'anchorL', text: 'head', side: 'top', dist: 46 });
      S.pointer('tail', { target: 'anchorL', text: 'tail', side: 'bottom', dist: 46 });
      S.step(T('Boş liste: `head` ve `tail` ikisi de `NULL`. Her düğümde iki ok olacak: `next` (üstte) ve `prev` (altta) -- hiç üst üste binmezler.',
               'The list is empty: `head` and `tail` are both `NULL`. Every node will have two arrows: `next` (curving above) and `prev` (curving below) -- they never overlap.'), L_INTRO);

      function clean() { list.forEach(function (id) { S.set(id, { style: 'normal' }); if (S.has('nx' + id)) S.set('nx' + id, { style: 'normal' }); if (S.has('pv' + id)) S.set('pv' + id, { style: 'dim' }); }); }
      function relayout() {
        for (var i = 0; i < list.length; i++) {
          var row = Math.floor(i / ROWCAP), col = i % ROWCAP;
          S.move(list[i], X0 + col * DX, Y0 + row * ROWH);
        }
      }
      function pointHT() {
        S.set('head', { target: list.length ? list[0] : 'anchorL' });
        S.set('tail', { target: list.length ? list[list.length - 1] : 'anchorL' });
      }
      /** Redraw node i's `next` (above) and `prev` (below) arrows to match its current neighbours. */
      function wire(i) {
        var id = list[i];
        if (i === list.length - 1) { S.remove('nx' + id); S.set(id, { isNull: true }); }
        else { S.set(id, { isNull: false }); if (S.has('nx' + id)) S.set('nx' + id, { target: list[i + 1] }); else S.arrow('nx' + id, { from: id, to: list[i + 1], kind: 'next', bend: 20 }); }
        if (i === 0) S.remove('pv' + id);
        else if (S.has('pv' + id)) S.set('pv' + id, { target: list[i - 1] });
        else S.arrow('pv' + id, { from: id, to: list[i - 1], kind: 'center', bend: -46, style: 'dim', text: 'prev' });
      }
      function wireAll() { for (var i = 0; i < list.length; i++) wire(i); }

      function doInsert(front, v, detailed) {
        var nid = 'x' + (seq++);
        S.node(nid, { x: X0, y: Y0 - 100, value: '?', style: 'new' });
        if (detailed) S.step(T((front ? '`insert_head(' : '`insert_tail(') + v + ')`: yeni düğüm ayrılır.', (front ? '`insertHead(' : '`insertTail(') + v + ')`: a new node is allocated.'), front ? L_HEAD_SIG : L_TAIL_SIG);
        S.set(nid, { value: String(v) });
        if (front) { list.unshift(nid); relayout(); wireAll(); }
        else { list.push(nid); relayout(); wireAll(); }
        pointHT(); clean();
        S.step(T((front ? '`insert_head(' : '`insert_tail(') + v + ')`: `prev`/`next` bağlantıları kurulur, ' + (front ? '`head`' : '`tail`') + ' güncellenir. O(1).',
                 (front ? '`insertHead(' : '`insertTail(') + v + ')`: the `prev`/`next` links are wired up, ' + (front ? '`head`' : '`tail`') + ' is updated. O(1).'), front ? L_HEAD_LINK : L_TAIL_LINK);
      }

      function doInsertAfter(target, v, detailed) {
        clean();
        var idx = -1;
        for (var i = 0; i < list.length; i++) if (Number(S.get(list[i]).value) === target) { idx = i; break; }
        if (idx < 0) {
          notFoundAfter++;
          S.step(T('`insert_after(' + target + ', ' + v + ')`: `' + target + '` listede yok, `false` döner, hiçbir şey eklenmez.', '`insert_after(' + target + ', ' + v + ')`: `' + target + '` is not in the list, returns `false`, nothing is inserted.'), L_AFTER_NOTFOUND);
          return;
        }
        S.set(list[idx], { style: 'hl' });
        var isTailNode = idx === list.length - 1;
        if (detailed) S.step(T('`insert_after(' + target + ', ' + v + ')`: `' + target + '` bulundu' + (isTailNode ? ' -- bu düğüm şu an `tail`.' : '.'), '`insert_after(' + target + ', ' + v + ')`: `' + target + '` found' + (isTailNode ? ' -- this node is currently `tail`.' : '.')), L_AFTER_SCAN);
        var nid = 'x' + (seq++);
        S.node(nid, { x: X0, y: Y0 - 100, value: String(v), style: 'new' });
        list.splice(idx + 1, 0, nid);
        relayout(); wireAll(); pointHT(); clean();
        inserted++;
        S.step(T('`n->prev = cur`, `n->next = cur->next`' + (isTailNode ? ', `cur->next == NULL` oldugundan `list->tail = n`.' : ', `cur->next->prev = n`.') + ' `cur->next = n`.',
                 '`n->prev = cur`, `n->next = cur->next`' + (isTailNode ? ', since `cur->next == NULL`, `list->tail = n`.' : ', `cur->next->prev = n`.') + ' `cur->next = n`.'), L_AFTER_LINK);
      }

      function doDelete(value) {
        clean();
        var idx = -1;
        for (var i = 0; i < list.length; i++) if (Number(S.get(list[i]).value) === value) { idx = i; break; }
        if (idx < 0) {
          notFound++;
          S.step(T('`delete_value(' + value + ')`: liste sonuna kadar gezildi, bulunamadı. `false` döner.', '`delete_value(' + value + ')`: walked to the end of the list, not found. Returns `false`.'), L_DEL_NOTFOUND);
          return;
        }
        S.set(list[idx], { style: 'hl' });
        var where = idx === 0 ? T('baştaki düğüm', 'the front node') : (idx === list.length - 1 ? T('sondaki düğüm', 'the back node') : T('ortadaki bir düğüm', 'a middle node'));
        S.step(T('`delete_value(' + value + ')`: bulundu (' + where.tr + '). Solu ve sağı birbirine bağlayıp düğümü serbest bırakacağız.',
                 '`delete_value(' + value + ')`: found (' + where.en + '). We relink its left and right neighbours, then free it.'), L_DEL_FOUND);
        S.remove('nx' + list[idx], 'pv' + list[idx]);
        S.set(list[idx], { style: 'del' });
        list.splice(idx, 1);
        relayout(); wireAll(); pointHT(); clean();
        removed++;
        S.step(T('İki taraf birbirine bağlandı; ' + (idx === 0 ? '`head`' : (idx === list.length ? '`tail`' : 'aradaki bağlar')) + ' güncellendi. `free(cur)`, `true` döner.',
                 'Both sides are relinked; ' + (idx === 0 ? '`head`' : (idx === list.length ? '`tail`' : 'the links in between')) + ' are updated. `free(cur)`, returns `true`.'), L_DEL_RELINK);
      }

      function doBackward() {
        clean();
        if (!list.length) {
          S.step(T('`print_backward`: `tail == NULL`, gösterilecek bir şey yok.', '`print_backward`: `tail == NULL`, there is nothing to print.'), L_BACK_INTRO);
          return;
        }
        S.step(T('`print_backward`: `cur = tail`\'den başlayıp `cur->prev` ile geriye doğru gezilir.', '`print_backward`: starting at `cur = tail` and walking backward via `cur->prev`.'), L_BACK_INTRO);
        for (var i = list.length - 1; i >= 0; i--) {
          clean(); S.set(list[i], { style: 'active' }); if (S.has('pv' + list[i])) S.set('pv' + list[i], { style: 'hl' });
          S.step(T('geriye gez: ' + S.get(list[i]).value + (i > 0 ? ' -- `cur = cur->prev`' : ' -- `cur->prev == NULL`, bitti'), 'backward: ' + S.get(list[i]).value + (i > 0 ? ' -- `cur = cur->prev`' : ' -- `cur->prev == NULL`, done')), L_BACK_WALK);
        }
      }

      d.ops.forEach(function (t, opIdx) {
        S.at(opIdx);
        if (isHead(t)) { doInsert(true, +/^h(-?\d+)$/.exec(t)[1], inserted < 2); inserted++; }
        else if (isTail(t)) { doInsert(false, +/^t(-?\d+)$/.exec(t)[1], inserted < 2); inserted++; }
        else if (isAfter(t)) { var m = /^a(-?\d+):(-?\d+)$/.exec(t); doInsertAfter(+m[1], +m[2], inserted < 2 || notFoundAfter < 1); }
        else if (isDel(t)) doDelete(delVal(t));
        else doBackward();
      });
      S.at(null);
      clean();
      var fwd = list.map(function (id) { return Number(S.get(id).value); });
      S.result = { forward: fwd, backward: fwd.slice().reverse(), removed: removed, notFound: notFound, notFoundAfter: notFoundAfter };
      S.step(T('Bitti: ' + inserted + ' ekleme, ' + removed + ' silme (' + notFound + ' bulunamadı)' + (notFoundAfter ? ', ' + notFoundAfter + ' `insert_after` hedefi bulunamadı' : '') + '. İleri: ' + (fwd.length ? fwd.join(', ') : 'boş') + '. Geri: ' + (fwd.length ? fwd.slice().reverse().join(', ') : 'boş') + '.',
               'Done: ' + inserted + ' insertions, ' + removed + ' deletion' + (removed === 1 ? '' : 's') + ' (' + notFound + ' not found)' + (notFoundAfter ? ', ' + notFoundAfter + ' `insert_after` target' + (notFoundAfter === 1 ? '' : 's') + ' not found' : '') + '. Forward: ' + (fwd.length ? fwd.join(', ') : 'empty') + '. Backward: ' + (fwd.length ? fwd.slice().reverse().join(', ') : 'empty') + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
