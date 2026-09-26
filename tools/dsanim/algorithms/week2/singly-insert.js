/* Week 2 -- singly linked list: insert at head, at tail (no tail pointer -- walks the list), after a given
 * node / at position k. Also shows, as an edge case, what goes wrong if the two pointer updates inside
 * insert_after are done in the wrong order (the rest of the list becomes unreachable) -- illustrated only,
 * never actually run on the real list. Program: singly_insert.c / SinglyInsert.java. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct Node {',
    '    int data;',
    '    struct Node *next;',
    '} Node;',
    '',
    'Node *insert_head(Node *head, int value) {',
    '    Node *n = malloc(sizeof(Node));',
    '    n->data = value;',
    '    n->next = head;      /* new node points at the old head */',
    '    return n;            /* new node is the head now */',
    '}',
    '',
    'Node *insert_tail(Node *head, int value) {   /* no tail pointer here: walks the list */',
    '    Node *n = malloc(sizeof(Node));',
    '    n->data = value;',
    '    n->next = NULL;',
    '    if (head == NULL)',
    '        return n;',
    '    Node *cur = head;',
    '    while (cur->next != NULL)   /* walk to the last node: O(n) */',
    '        cur = cur->next;',
    '    cur->next = n;',
    '    return head;',
    '}',
    '',
    'void insert_after(Node *prev, int value) {',
    '    Node *n = malloc(sizeof(Node));',
    '    n->data = value;',
    '    n->next = prev->next;   /* STEP 1: new node first */',
    '    prev->next = n;         /* STEP 2: then link prev to it */',
    '}',
    '',
    'Node *find(Node *head, int value) {',
    '    for (Node *cur = head; cur != NULL; cur = cur->next)',
    '        if (cur->data == value)',
    '            return cur;',
    '    return NULL;',
    '}'
  ];
  var JAVA = [
    'class Node {',
    '    int data;',
    '    Node next;',
    '    Node(int data) { this.data = data; }',
    '}',
    '',
    'static Node insertHead(Node head, int value) {',
    '    Node n = new Node(value);',
    '    n.next = head;        // new node points at the old head',
    '    return n;             // new node is the head now',
    '}',
    '',
    'static Node insertTail(Node head, int value) {   // no tail field here: walks the list',
    '    Node n = new Node(value);',
    '    if (head == null)',
    '        return n;',
    '    Node cur = head;',
    '    while (cur.next != null)     // walk to the last node: O(n)',
    '        cur = cur.next;',
    '    cur.next = n;',
    '    return head;',
    '}',
    '',
    'static void insertAfter(Node prev, int value) {',
    '    Node n = new Node(value);',
    '    n.next = prev.next;    // STEP 1: new node first',
    '    prev.next = n;         // STEP 2: then link prev to it',
    '}',
    '',
    'static Node find(Node head, int value) {',
    '    for (Node cur = head; cur != null; cur = cur.next)',
    '        if (cur.data == value)',
    '            return cur;',
    '    return null;',
    '}'
  ];
  var ROWCAP = 8, DX = 100, ROWH = 116, X0 = 110, Y0 = 90;
  var BUG = 'bug';

  /** "h5" -> insert_head(5); "t5" -> insert_tail(5); "a3:5" -> insert_after(find(3), 5); "bug3:5" -> illustration only. */
  function parseTok(tok) {
    var m;
    if ((m = /^h(-?\d+)$/.exec(tok))) return { op: 'head', v: +m[1] };
    if ((m = /^t(-?\d+)$/.exec(tok))) return { op: 'tail', v: +m[1] };
    if ((m = /^a(-?\d+):(-?\d+)$/.exec(tok))) return { op: 'after', target: +m[1], v: +m[2] };
    if ((m = /^bug(-?\d+):(-?\d+)$/.exec(tok))) return { op: BUG, target: +m[1], v: +m[2] };
    return null;
  }

  D.define({
    id: 'singly-insert',
    title: T('Tekil bağlı liste: ekleme (baş, son, belirli düğümden sonra)', 'Singly linked list: insert (head, tail, after a given node)'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('5 kez baş, 5 kez son, sonra bir düğümden sonra ekle', '5 inserts at head, 5 at tail, then one after a node'),
        data: { ops: ['h7', 'h3', 'h9', 'h1', 'h8', 't2', 't10', 't4', 't6', 't5', 'a8:777'] } },
      { id: 'hard', level: 'hard', name: T('12 değer (yinelenen/negatif), yinelenen hedefin İLK eşleşmesinden sonra ekle', '12 values (duplicates/negatives), insert after the FIRST match of a duplicate target'),
        data: { ops: ['t5', 't-3', 't5', 't0', 't-3', 't8', 't8', 't-1', 't2', 't-3', 't100', 't-100', 'a-3:777'] } },
      { id: 'into-empty', level: 'edge', name: T('Boş listeye ekleme: önce baştan, sonra sondan', 'Insert into an empty list: first at the head, then at the tail'),
        data: { ops: ['h42'] }, small: true },
      { id: 'after-head-and-tail', level: 'edge', name: T('Baştan hemen sonra ve son düğümden hemen sonra ekle (positon k = 0 ve k = son)', 'Insert right after the head and right after the tail (position k = 0 and k = last)'),
        data: { ops: ['t10', 't20', 't30', 't40', 't50', 't60', 't70', 't80', 't90', 't100', 'a10:111', 'a100:222'] } },
      { id: 'order-swap-mistake', level: 'edge', name: T('Sıra bozulursa: liste kopar (yalnız gösterim, gerçek belleğe uygulanmaz)', 'If the order is swapped: the list is cut off (illustration only, never run on real memory)'),
        data: { ops: ['t10', 't20', 't30', 't40', 't50', 't60', 't70', 't80', 't90', 't100', 'bug30:999'] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of values actually inserted into the list (the illustration-only "bug" op inserts nothing real). */
    size: function (d) { return d.ops.filter(function (t) { return parseTok(t).op !== BUG; }).length; },
    /** Independent computation of the expected outcome: a plain array simulation, no shared helper with build(). */
    reference: function (d) {
      var list = [];
      d.ops.forEach(function (tok) {
        // independent of parseTok(): read the token by its prefix
        if (tok.indexOf('bug') === 0) return;
        var kind = tok.charAt(0), rest = tok.slice(1);
        if (kind === 'h') list.unshift(Number(rest));
        else if (kind === 't') list.push(Number(rest));
        else if (kind === 'a') { var parts = rest.split(':'), idx = list.indexOf(Number(parts[0])); if (idx >= 0) list.splice(idx + 1, 0, Number(parts[1])); }
        // 'bug' is illustration only: it never changes the real list
      });
      return { list: list };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level];
      var lo = level === 'extreme' ? -500 : 1, hi = level === 'extreme' ? 500 : 99;
      var ops = [], list = [];
      for (var i = 0; i < n; i++) {
        var x = D.randInt(r, lo, hi);
        var choice = list.length >= 2 ? r() : 0;
        if (choice < 0.4) { ops.push('h' + x); list.unshift(x); }
        else if (choice < 0.8) { ops.push('t' + x); list.push(x); }
        else { var target = list[D.randInt(r, 0, list.length - 1)]; ops.push('a' + target + ':' + x); list.splice(list.indexOf(target) + 1, 0, x); }
      }
      return { ops: ops };
    },
    input: {
      hint: T('Örnek: h7 h3 t5 a8:999   (hN = başa, tN = sona, aX:N = X değerinden sonra)',
              'Example: h7 h3 t5 a8:999   (hN = at head, tN = at tail, aX:N = after value X)'),
      parse: function (text) {
        var toks = String(text).trim().split(/[\s,;]+/).filter(Boolean), list = [];
        toks.forEach(function (tok) {
          var t = parseTok(tok);
          if (!t) throw T('"' + tok + '" anlaşılmadı: hN, tN ya da aX:N yazın.', '"' + tok + '" is not understood: write hN, tN or aX:N.');
          if ((t.op === 'after' || t.op === BUG) && list.indexOf(t.target) < 0) throw T('aX:N için X (' + t.target + ') listede yok.', 'For aX:N, X (' + t.target + ') is not in the list.');
          if (t.op === 'head') list.unshift(t.v); else if (t.op === 'tail') list.push(t.v); else if (t.op === 'after') list.splice(list.indexOf(t.target) + 1, 0, t.v);
        });
        if (!toks.length) throw T('En az bir işlem yazın.', 'Write at least one operation.');
        if (toks.length > 30) throw T('En çok 30 işlem.', 'At most 30 operations.');
        return { ops: toks };
      },
      format: function (d) { return d.ops.join(' '); },
      bad: ['', '5 x 7', 'a5', 'a999:1', 'h3.5', '   ']
    },
    build: function (S, d) {
      var list = [], seq = 0, heads = 0, tails = 0, afters = 0;

      S.label('anchor', { x: X0 - 70, y: Y0 + 18, text: 'NULL', style: 'dim', size: 15, mono: true });
      S.pointer('head', { target: 'anchor', text: 'head', side: 'top', dist: 28 });
      S.step(T('Liste boş: `head` hiçbir düğümü göstermiyor (`NULL`). Bu programda ayrı bir `tail` işaretçisi YOK -- `insert_tail` her çağrıldığında listenin sonuna kadar yürür.',
               'The list is empty: `head` points to no node (`NULL`). This program keeps no separate `tail` pointer -- `insert_tail` walks to the end of the list every time it is called.'),
             { c: 1, java: 1 });

      function clean() { list.forEach(function (id) { S.set(id, { style: 'normal' }); if (S.has('o' + id)) S.set('o' + id, { style: 'normal' }); }); }
      function relayout() {
        for (var i = 0; i < list.length; i++) {
          var row = Math.floor(i / ROWCAP), col = i % ROWCAP;
          S.move(list[i], X0 + col * DX, Y0 + row * ROWH);
        }
      }
      function pointHead() { S.set('head', { target: list.length ? list[0] : 'anchor' }); }
      /** (Re)draw the arrow from list[i] to its successor (or mark it NULL-terminated). */
      function wireArrow(i) {
        var id = list[i];
        if (i === list.length - 1) { S.remove('o' + id); S.set(id, { isNull: true }); }
        else { S.set(id, { isNull: false }); if (S.has('o' + id)) S.set('o' + id, { target: list[i + 1] }); else S.arrow('o' + id, { from: id, to: list[i + 1], kind: 'next' }); }
      }
      function wireAll() { for (var i = 0; i < list.length; i++) wireArrow(i); }

      function doHead(v, detailed) {
        var nid = 'n' + (seq++);
        S.node(nid, { x: X0, y: Y0 - 90, value: '?', style: 'new' });
        if (detailed) S.step(T('`insert_head(' + v + ')`: `malloc(sizeof(Node))` -- yeni bir düğüm ayrılır.', '`insert_head(' + v + ')`: `malloc(sizeof(Node))` allocates a new node.'), { c: 7, java: 7 });
        S.set(nid, { value: String(v) });
        list.unshift(nid);
        if (list.length > 1) S.arrow('o' + nid, { from: nid, to: list[1], kind: 'next', style: 'new' }); else S.set(nid, { isNull: true });
        if (detailed) S.step(T('`n->next = head`: yeni düğüm eski başı gösterir.' + (list.length > 1 ? '' : ' `head` şu an `NULL`, o yüzden `n->next` da `NULL` olur.'),
                               '`n->next = head`: the new node points at the old head.' + (list.length > 1 ? '' : ' `head` is `NULL` right now, so `n->next` becomes `NULL` too.')), { c: 9, java: 9 });
        relayout(); pointHead(); clean();
        S.step(T((detailed ? '`head = n`: ' : 'insert_head(' + v + '): ') + 'yeni düğüm artık başta. O(1): kaç düğüm olursa olsun tek adım.',
                 (detailed ? '`head = n`: ' : 'insert_head(' + v + '): ') + 'the new node is now the head. O(1): one step, however many nodes there are.'), { c: 10, java: 10 });
      }

      function doTail(v, detailed) {
        var nid = 'n' + (seq++);
        if (!list.length) {
          S.node(nid, { x: X0, y: Y0, value: String(v), style: 'new', isNull: true });
          list.push(nid); relayout(); pointHead(); clean();
          S.step(T('`insert_tail(' + v + ')`: liste boştu (`head == NULL`) -- yeni düğüm doğrudan başa dönüyor.',
                   '`insert_tail(' + v + ')`: the list was empty (`head == NULL`) -- the new node is simply returned as the head.'), { c: [16, 17], java: [14, 15] });
          return;
        }
        S.node(nid, { x: X0 + (ROWCAP + 1) * DX, y: Y0, value: String(v), style: 'new', isNull: true });
        if (detailed) {
          S.step(T('`insert_tail(' + v + ')`: liste boş değil, `cur = head` ile başlayıp sona kadar yürüyeceğiz.',
                   '`insert_tail(' + v + ')`: the list is not empty, so `cur = head` and we walk to the end.'), { c: 19, java: 17 });
          for (var i = 0; i < list.length; i++) {
            clean(); S.set(list[i], { style: 'active' });
            S.step(T('`cur` düğüm ' + (i + 1) + '\'de: ' + (i === list.length - 1 ? '`cur->next == NULL` -- son düğüm bulundu.' : '`cur->next != NULL`, bir ileri gidiyoruz.'),
                     '`cur` is at node ' + (i + 1) + ': ' + (i === list.length - 1 ? '`cur->next == NULL` -- the last node is found.' : '`cur->next != NULL`, so we move one further.')),
                   { c: 20, java: 18 });
          }
        }
        list.push(nid);
        wireArrow(list.length - 2);
        relayout(); pointHead(); clean();
        S.step(T((detailed ? '`cur->next = n`: son düğüm artık yeni düğümü gösteriyor. ' : 'insert_tail(' + v + '): ') + 'Bu sürümde `insert_tail` O(n): her çağrı listenin sonuna kadar yürür.',
                 (detailed ? '`cur->next = n`: the last node now points at the new node. ' : 'insert_tail(' + v + '): ') + 'In this version `insert_tail` is O(n): every call walks to the end of the list.'), { c: 22, java: 20 });
      }

      function doAfter(target, v, detailed) {
        var idx = -1;
        for (var i = 0; i < list.length; i++) {
          if (detailed) { clean(); S.set(list[i], { style: 'active' }); S.step(T('`find(' + target + ')`: düğüm ' + (i + 1) + ', değer = ' + S.get(list[i]).value + '?', '`find(' + target + ')`: node ' + (i + 1) + ', value = ' + S.get(list[i]).value + '?'), { c: 31, java: 27 }); }
          if (Number(S.get(list[i]).value) === target) { idx = i; break; }
        }
        clean(); S.set(list[idx], { style: 'hl' });
        var prevId = list[idx];
        if (detailed) S.step(T('`prev` bulundu: değer ' + target + '. Şimdi `insert_after(prev, ' + v + ')` çağrılıyor.', '`prev` is found: value ' + target + '. Now `insert_after(prev, ' + v + ')` is called.'), { c: 25, java: 21 });
        var nid = 'n' + (seq++);
        var oldNext = idx + 1 < list.length ? list[idx + 1] : null;
        S.node(nid, { x: X0, y: Y0 - 90, value: '?', style: 'new' });
        S.set(nid, { value: String(v) });
        if (oldNext) { S.arrow('o' + nid, { from: nid, to: oldNext, kind: 'next', style: 'new' }); } else S.set(nid, { isNull: true });
        S.step(T('STEP 1 -- `n->next = prev->next`: yeni düğüm önce eski bir sonrakini gösterir (' + (oldNext ? S.get(oldNext).value : 'NULL') + '). Sıra önemli: bu adım henüz `prev`\'e dokunmadı.',
                 'STEP 1 -- `n->next = prev->next`: the new node points at the old next first (' + (oldNext ? S.get(oldNext).value : 'NULL') + '). Order matters: this step has not touched `prev` yet.'), { c: 28, java: 24 });
        list.splice(idx + 1, 0, nid);
        wireArrow(idx);
        relayout(); pointHead(); clean();
        S.step(T('STEP 2 -- `prev->next = n`: şimdi `prev` yeni düğümü gösterir. Yeni düğüm ' + target + ' değerinden hemen sonra (konum k = ' + (idx + 1) + ') listeye girdi.',
                 'STEP 2 -- `prev->next = n`: now `prev` points at the new node. The new node is in the list right after ' + target + ' (position k = ' + (idx + 1) + ').'), { c: 29, java: 25 });
      }

      function doBug(target, fakeValue) {
        var idx = -1;
        for (var i = 0; i < list.length; i++) if (Number(S.get(list[i]).value) === target) { idx = i; break; }
        clean();
        var prevId = list[idx], oldNextId = idx + 1 < list.length ? list[idx + 1] : null;
        S.set(prevId, { style: 'active' });
        var lostIds = list.slice(idx + 1);
        S.step(T('Şimdi iki satırı KASITLI olarak ters sırayla deneyelim -- yalnız gösterim, gerçek listeye uygulanmayacak: `prev->next = n` ÖNCE.',
                 'Now let us deliberately try the two lines in the wrong order -- illustration only, never applied to the real list: `prev->next = n` FIRST.'), { c: 29, java: 25 });
        var bugId = 'bug' + (seq++);
        S.node(bugId, { x: X0 - 10, y: Y0 - 160, value: String(fakeValue), style: 'del' });
        if (oldNextId) S.set('o' + prevId, { style: 'del' });
        S.arrow('obugA', { from: prevId, to: bugId, kind: 'next', style: 'del' });
        S.step(T('Yanlış adım 1: `prev->next = n`. `prev` artık yeni düğümü gösteriyor; eski bağlantı (' + (oldNextId ? S.get(oldNextId).value : 'NULL') + '\'e) koptu.',
                 'Wrong step 1: `prev->next = n`. `prev` now points at the new node; the old link (to ' + (oldNextId ? S.get(oldNextId).value : 'NULL') + ') is gone.'), { c: 30, java: 26 });
        S.label('buglbl', { x: X0 - 10, y: Y0 - 205, text: T('`n->next = prev->next` -> `n->next = n` (öz-döngü!)', '`n->next = prev->next` -> `n->next = n` (self-loop!)'), style: 'del', size: 13, bold: true });
        lostIds.forEach(function (id) { S.set(id, { style: 'del' }); });
        if (oldNextId) S.label('lostlbl', { x: S.get(oldNextId).x + 20, y: Y0 - 40, text: T('erişilemez oldu', 'now unreachable'), style: 'del', size: 13, bold: true });
        S.step(T('Yanlış adım 2: `n->next = prev->next` -- ama `prev->next` artık `n`\'in kendisi! Yeni düğüm kendini gösterir ve ' + target + '\'dan sonraki HER ŞEY listeden kopar.',
                 'Wrong step 2: `n->next = prev->next` -- but `prev->next` is now `n` itself! The new node points at itself, and EVERYTHING after ' + target + ' is cut off the list.'), { c: 28, java: 24 });
        S.remove(bugId, 'obugA', 'buglbl'); if (S.has('lostlbl')) S.remove('lostlbl');
        if (oldNextId) S.set('o' + prevId, { style: 'normal' });
        lostIds.forEach(function (id) { S.set(id, { style: 'normal' }); });
        S.set(prevId, { style: 'normal' });
        S.step(T('Bu yüzden gerçek kod tam tersini yapar: önce `n->next = prev->next`, sonra `prev->next = n`. Hiçbir şey gerçek listeye uygulanmadı -- her şey eskisi gibi.',
                 'That is why the real code does the opposite: `n->next = prev->next` first, then `prev->next = n`. Nothing was actually applied to the real list -- it is exactly as it was.'), { c: [28, 29], java: [24, 25] });
      }

      d.ops.forEach(function (tok) {
        var t = parseTok(tok);
        if (t.op === 'head') { doHead(t.v, heads === 0); heads++; }
        else if (t.op === 'tail') { doTail(t.v, tails === 0); tails++; }
        else if (t.op === 'after') { doAfter(t.target, t.v, afters === 0); afters++; }
        else doBug(t.target, t.v);
      });
      clean();
      S.result = { list: list.map(function (id) { return Number(S.get(id).value); }) };
      S.step(T('Bitti: ' + heads + ' baştan, ' + tails + ' sondan, ' + afters + ' belirli bir düğümden sonra ekleme. Liste (baştan sona): ' + (list.length ? S.result.list.join(', ') : 'boş') + '.',
               'Done: ' + heads + ' insert at head, ' + tails + ' at tail, ' + afters + ' after a given node. List (head to tail): ' + (list.length ? S.result.list.join(', ') : 'empty') + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
