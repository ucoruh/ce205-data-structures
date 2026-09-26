/* Week 2 -- singly linked list: delete by value (head, a middle node, the tail, a value not present, and
 * deleting from an empty list). Shows `prev`/`cur` walking together, the bypass arrow (`prev->next = cur->next`),
 * then `free(cur)`. Program: singly_delete.c / SinglyDelete.java. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct Node {',
    '    int data;',
    '    struct Node *next;',
    '} Node;',
    '',
    'Node *delete_value(Node *head, int value, bool *removed) {',
    '    *removed = false;',
    '    if (head == NULL)',
    '        return NULL;',
    '',
    '    if (head->data == value) {         /* removing the head itself */',
    '        Node *tmp = head;',
    '        head = head->next;',
    '        free(tmp);',
    '        *removed = true;',
    '        return head;',
    '    }',
    '',
    '    Node *prev = head;',
    '    Node *cur = head->next;',
    '    while (cur != NULL) {',
    '        if (cur->data == value) {',
    '            prev->next = cur->next;    /* skip over cur: the bypass arrow */',
    '            free(cur);',
    '            *removed = true;',
    '            return head;',
    '        }',
    '        prev = cur;',
    '        cur = cur->next;',
    '    }',
    '    return head;                       /* value not found */',
    '}'
  ];
  var JAVA = [
    'class Node {',
    '    int data;',
    '    Node next;',
    '    Node(int data) { this.data = data; }',
    '}',
    '',
    'static DeleteResult deleteValue(Node head, int value) {',
    '    if (head == null)',
    '        return new DeleteResult(null, false);',
    '',
    '    if (head.data == value)              // removing the head itself',
    '        return new DeleteResult(head.next, true);',
    '',
    '    Node prev = head;',
    '    Node cur = head.next;',
    '    while (cur != null) {',
    '        if (cur.data == value) {',
    '            prev.next = cur.next;        // skip over cur: the bypass arrow',
    '            return new DeleteResult(head, true);',
    '        }',
    '        prev = cur;',
    '        cur = cur.next;',
    '    }',
    '    return new DeleteResult(head, false); // value not found',
    '}'
  ];
  var ROWCAP = 8, DX = 100, ROWH = 116, X0 = 110, Y0 = 90;
  var DEL = 'd';

  function tok(v) { return String(v); }
  function isDel(t) { return /^d(-?\d+)$/.test(t); }
  function delVal(t) { return +/^d(-?\d+)$/.exec(t)[1]; }

  D.define({
    id: 'singly-delete',
    title: T('Tekil bağlı liste: değere göre silme', 'Singly linked list: delete by value'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 düğüm, baştan sil, sonra ortadan sil', '10 nodes, delete the head, then delete a middle node'),
        data: { ops: ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100', 'd10', 'd60'] } },
      { id: 'hard', level: 'hard', name: T('12 düğüm, yinelenen 5: önce baştaki, sonra ortadaki silinir', '12 nodes with duplicate 5s: the head copy goes first, then a middle copy'),
        data: { ops: ['5', '5', '20', '30', '5', '40', '50', '5', '60', '70', '80', '5', 'd5', 'd5'] } },
      { id: 'single-then-empty', level: 'edge', name: T('Tek düğüm: sil, sonra boş listeden tekrar sil', 'A single node: delete it, then delete again from the now-empty list'),
        data: { ops: ['99', 'd99', 'd99'] }, small: true },
      { id: 'tail-and-missing', level: 'edge', name: T('10 düğüm: son düğümü sil, sonra listede olmayan bir değeri sil', '10 nodes: delete the tail, then delete a value that is not present'),
        data: { ops: ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100', 'd100', 'd12345'] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of values actually placed into the list before any deletion -- every example must have at least 10. */
    size: function (d) { return d.ops.filter(function (t) { return !isDel(t); }).length; },
    /** Independent computation of the expected outcome: a plain array simulation, no shared helper with build(). */
    reference: function (d) {
      var list = [], removedCount = 0, notFoundCount = 0;
      d.ops.forEach(function (t) {
        // independent of isDel()/delVal(): a leading 'd' marks a delete
        if (t.charAt(0) === 'd') {
          var v = Number(t.slice(1)), idx = list.indexOf(v);
          if (idx >= 0) { list.splice(idx, 1); removedCount++; } else notFoundCount++;
        } else list.push(Number(t));
      });
      return { list: list, removed: removedCount, notFound: notFoundCount };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level];
      var lo = level === 'extreme' ? -500 : 1, hi = level === 'extreme' ? 500 : 99;
      var ops = [], list = [], i;
      for (i = 0; i < n; i++) { var x = D.randInt(r, lo, hi); ops.push(tok(x)); list.push(x); }
      var deletes = D.randInt(r, 1, 4);
      for (i = 0; i < deletes; i++) {
        if (list.length && r() < 0.75) { var pick = list[D.randInt(r, 0, list.length - 1)]; ops.push('d' + pick); list.splice(list.indexOf(pick), 1); }
        else ops.push('d' + D.randInt(r, lo - 1000, hi + 1000));
      }
      return { ops: ops };
    },
    input: {
      hint: T('Örnek: 10 20 30 d20   (sayı = listeye ekle, dN = N değerini sil)',
              'Example: 10 20 30 d20   (number = add to the list, dN = delete value N)'),
      parse: function (text) {
        var toks = String(text).trim().split(/[\s,;]+/).filter(Boolean);
        toks.forEach(function (t) {
          if (!isDel(t) && !/^-?\d+$/.test(t)) throw T('"' + t + '" anlaşılmadı: sayı ya da dN yazın.', '"' + t + '" is not understood: write a number or dN.');
        });
        if (!toks.length) throw T('En az bir işlem yazın.', 'Write at least one operation.');
        if (toks.length > 40) throw T('En çok 40 işlem.', 'At most 40 operations.');
        return { ops: toks };
      },
      format: function (d) { return d.ops.join(' '); },
      bad: ['', '5 x 7', '3.5', 'delete 5', '   ']
    },
    build: function (S, d) {
      var list = [], seq = 0, inserted = 0, removed = 0, notFound = 0;

      S.label('anchor', { x: X0 - 70, y: Y0 + 18, text: 'NULL', style: 'dim', size: 15, mono: true });
      S.pointer('head', { target: 'anchor', text: 'head', side: 'top', dist: 28 });
      S.step(T('Listeyi kuralım: her değer sona eklenecek. Sonra bazı değerleri sileceğiz.',
               'Let us build the list: every value is added at the end. Then we will delete some of them.'), { c: 1, java: 1 });

      function clean() { list.forEach(function (id) { S.set(id, { style: 'normal' }); }); if (S.has('prevP')) S.remove('prevP'); if (S.has('curP')) S.remove('curP'); }
      function relayout() {
        for (var i = 0; i < list.length; i++) {
          var row = Math.floor(i / ROWCAP), col = i % ROWCAP;
          S.move(list[i], X0 + col * DX, Y0 + row * ROWH);
        }
      }
      function pointHead() { S.set('head', { target: list.length ? list[0] : 'anchor' }); }
      function wireArrow(i) {
        var id = list[i];
        if (i === list.length - 1) { S.remove('o' + id); S.set(id, { isNull: true }); }
        else { S.set(id, { isNull: false }); if (S.has('o' + id)) S.set('o' + id, { target: list[i + 1] }); else S.arrow('o' + id, { from: id, to: list[i + 1], kind: 'next' }); }
      }

      function insert(v) {
        var nid = 'n' + (seq++);
        S.node(nid, { x: X0, y: Y0, value: String(v), style: 'new', isNull: true });
        var prevLast = list.length ? list[list.length - 1] : null;
        list.push(nid);
        if (prevLast) wireArrow(list.length - 2);
        relayout(); pointHead(); clean();
        inserted++;
        S.step(T(inserted + '. `insert_tail(' + v + ')` -- listeyi kurarken kullanılan yardımcı fonksiyon.', inserted + '. `insert_tail(' + v + ')` -- the helper used while building the list.'), { c: [], java: [] });
      }

      function doDelete(value) {
        clean();
        if (!list.length) {
          notFound++;
          S.step(T('`delete_value(' + value + ')`: `head == NULL`, silinecek bir şey yok. `removed = false` döner.',
                   '`delete_value(' + value + ')`: `head == NULL`, there is nothing to delete. It returns `removed = false`.'), { c: [7, 8], java: [8, 9] });
          return;
        }
        if (Number(S.get(list[0]).value) === value) {
          S.set(list[0], { style: 'del' }); S.set('head', { style: 'del' });
          S.step(T('`delete_value(' + value + ')`: `head->data == ' + value + '`, başı siliyoruz. `tmp = head`.', '`delete_value(' + value + ')`: `head->data == ' + value + '`, we are deleting the head. `tmp = head`.'), { c: 10, java: 9 });
          var doomed = list.shift();
          pointHead();
          S.remove(doomed);
          relayout(); clean();
          removed++;
          S.step(T('`head = head->next`; `free(tmp)`: eski baş bellekten geri verilir. O(1) -- listenin ortasına hiç bakmadık.',
                   '`head = head->next`; `free(tmp)`: the old head is freed. O(1) -- we never looked at the rest of the list.'), { c: [12, 13], java: 10 });
          return;
        }
        S.pointer('prevP', { target: list[0], text: 'prev', side: 'bottom', dist: 24 });
        var curIdx = 1;
        S.pointer('curP', { target: list[curIdx], text: 'cur', side: 'top', dist: 24 });
        S.step(T('`prev = head`; `cur = head->next`: silinecek düğümü ararken iki işaretçi birlikte ilerler.', '`prev = head`; `cur = head->next`: two pointers move together while we search for the node to delete.'), { c: [18, 19], java: [13, 14] });
        var found = false;
        while (curIdx < list.length) {
          S.set(list[curIdx], { style: 'active' });
          if (Number(S.get(list[curIdx]).value) === value) { found = true; break; }
          S.step(T('`cur->data` (' + S.get(list[curIdx]).value + ') != ' + value + ': `prev = cur`; `cur = cur->next`.', '`cur->data` (' + S.get(list[curIdx]).value + ') != ' + value + ': `prev = cur`; `cur = cur->next`.'), { c: [24, 25], java: [19, 20] });
          S.set(list[curIdx], { style: 'normal' });
          curIdx++;
          S.set('prevP', { target: list[curIdx - 1] }); S.set('curP', { target: curIdx < list.length ? list[curIdx] : list[curIdx - 1] });
          if (curIdx >= list.length) break;
        }
        if (!found) {
          S.remove('prevP', 'curP'); clean();
          notFound++;
          S.step(T('`cur == NULL`: `' + value + '` listede yok. `delete_value` listeyi değiştirmeden döner, `removed = false`.',
                   '`cur == NULL`: `' + value + '` is not in the list. `delete_value` returns unchanged, `removed = false`.'), { c: 29, java: [22, 23] });
          return;
        }
        S.set(list[curIdx], { style: 'hl' });
        var curId = list[curIdx], prevId = list[curIdx - 1];
        S.step(T('`cur->data == ' + value + '`: bulundu. `prev->next = cur->next` -- **bypass oku**: `prev` artık `cur`\'u atlayıp bir ilerideki düğümü gösterir.',
                 '`cur->data == ' + value + '`: found. `prev->next = cur->next` -- the **bypass arrow**: `prev` now skips `cur` and points at the node after it.'), { c: 25, java: 15 });
        var nextId = curIdx + 1 < list.length ? list[curIdx + 1] : null;
        S.remove('o' + prevId);
        if (nextId) S.arrow('o' + prevId, { from: prevId, to: nextId, kind: 'next', style: 'new' }); else S.set(prevId, { isNull: true });
        S.set(curId, { style: 'del' });
        S.remove('prevP', 'curP');
        S.step(T('`cur` (' + value + ') artık listenin dışında -- kimse ona göstermiyor.', '`cur` (' + value + ') is now outside the list -- nothing points to it any more.'), { c: [], java: [] });
        list.splice(curIdx, 1);
        S.remove(curId, 'o' + curId);
        relayout(); pointHead(); clean();
        removed++;
        S.step(T('`free(cur)`: bellek geri verilir, `removed = true` döner.', '`free(cur)`: the memory is freed, it returns `removed = true`.'), { c: 26, java: 15 });
      }

      d.ops.forEach(function (t) { if (isDel(t)) doDelete(delVal(t)); else insert(Number(t)); });
      clean();
      S.result = { list: list.map(function (id) { return Number(S.get(id).value); }), removed: removed, notFound: notFound };
      S.step(T('Bitti: ' + removed + ' silme başarılı, ' + notFound + ' bulunamadı. Liste (baştan sona): ' + (list.length ? S.result.list.join(', ') : 'boş') + '.',
               'Done: ' + removed + ' successful deletion' + (removed === 1 ? '' : 's') + ', ' + notFound + ' not found. List (head to tail): ' + (list.length ? S.result.list.join(', ') : 'empty') + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
