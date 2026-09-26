/* Week 3 — linked-list stack: push and pop, with >= 10-node examples (malloc/new, next pointers, free). */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct Node {',
    '    int data;',
    '    struct Node *next;',
    '} Node;',
    'Node *top = NULL;          /* empty stack */',
    '',
    'void push(int x) {',
    '    Node *n = malloc(sizeof(Node));',
    '    n->data = x;',
    '    n->next = top;',
    '    top = n;',
    '}',
    '',
    'bool pop(int *out) {',
    '    if (top == NULL) return false;   /* underflow */',
    '    Node *tmp = top;',
    '    *out = tmp->data;',
    '    top = top->next;',
    '    free(tmp);',
    '    return true;',
    '}'
  ];
  var JAVA = [
    'class Node {',
    '    int data;',
    '    Node next;',
    '}',
    'Node top = null;           // empty stack',
    '',
    'void push(int x) {',
    '    Node n = new Node();',
    '    n.data = x;',
    '    n.next = top;',
    '    top = n;',
    '}',
    '',
    'Integer pop() {',
    '    if (top == null) return null;   // underflow',
    '    Node tmp = top;',
    '    int out = tmp.data;',
    '    top = top.next;',
    '    // the garbage collector frees tmp',
    '    return out;',
    '}'
  ];
  var POP = 'pop';
  var ROWCAP = 8, DX = 100, ROWH = 110, X0 = 110, Y0 = 90;

  D.define({
    id: 'linked-stack-push-pop',
    title: T('Bağlı liste ile yığın: push ve pop', 'Linked-list stack: push and pop'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'push-then-pop', level: 'normal', name: T('12 push, sonra 3 pop', '12 pushes, then 3 pops'),
        data: { ops: [12, 7, 25, 3, 18, 9, 30, 14, 5, 21, 16, 40, POP, POP, POP] } },
      { id: 'pop-to-empty', level: 'hard', name: T('10 düğümü tek tek çıkar: en son düğüm de pop olur', 'Pop every node one by one: even the last one is popped'),
        data: { ops: [4, 15, 8, 23, 6, 31, 12, 27, 9, 18, POP, POP, POP, POP, POP, POP, POP, POP, POP, POP] } },
      { id: 'pop-on-empty', level: 'edge', name: T('Boş yığından pop, sonra 10 push', 'Pop on an empty stack, then 10 pushes'),
        data: { ops: [POP, 7, 19, 3, 26, 14, 8, 31, 22, 5, 17, POP] } },
      { id: 'long-push-run', level: 'edge', name: T('Uzun push dizisi: 14 düğüm, iki satır', 'Long push run: 14 nodes, two rows'),
        data: { ops: [40, 11, 27, 8, 33, 16, 45, 2, 19, 37, 24, 6, 50, 29] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of values the program tried to push — every example must have at least 10. */
    size: function (d) { return d.ops.filter(function (o) { return o !== POP; }).length; },
    /** Independent computation of the expected outcome (checked against S.result by test.js). */
    reference: function (d) {
      var st = [], popped = [], under = 0;
      d.ops.forEach(function (o) {
        if (o === POP) { if (st.length) popped.push(st.pop()); else under++; }
        else st.push(o);
      });
      return { stack: st, popped: popped, underflows: under };
    },
    random: function (level, r) {
      var lo = level === 'extreme' ? -500 : 1, hi = level === 'extreme' ? 500 : 99;
      var pushCount = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level];
      var ops = [], i;
      for (i = 0; i < pushCount; i++) ops.push(D.randInt(r, lo, hi));
      var pops = D.randInt(r, 0, pushCount + 2);
      for (i = 0; i < pops; i++) ops.push(POP);
      if (level === 'extreme') ops.unshift(POP);
      return { ops: ops };
    },
    input: {
      hint: T('Örnek: 5 8 13 pop 21 pop   (sayı = push, pop ya da - = pop)',
              'Example: 5 8 13 pop 21 pop   (number = push, pop or - = pop)'),
      parse: function (text) {
        var list = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (/^(pop|-)$/i.test(tok)) { list.push(POP); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı ya da pop yazın.', '"' + tok + '" is not understood: write a number or pop.');
          list.push(parseInt(tok, 10));
        });
        if (!list.length) throw T('En az bir işlem yazın.', 'Write at least one operation.');
        if (list.length > 40) throw T('En çok 40 işlem.', 'At most 40 operations.');
        return { ops: list };
      },
      format: function (d) { return d.ops.join(' '); },
      bad: ['', '5 x 7', '3.5 pop', '   ', 'push 5']
    },
    build: function (S, d) {
      var list = [];          // index 0 = top (most recently pushed)
      var nextId = 0, pushes = 0, pops = 0, under = 0, popped = [];
      var POPY = Y0 + 260, POPW = 58;

      S.label('anchor', { x: X0 - 70, y: Y0 + 18, text: 'NULL', style: 'dim', size: 15, mono: true });
      S.pointer('top', { target: 'anchor', text: 'top', side: 'top', dist: 28 });
      S.label('decision', { x: X0 - 90, y: Y0 - 60, text: '', anchor: 'end', size: 18, bold: true, mono: true });
      S.label('poplbl', { x: X0 - 16, y: POPY + 27, text: T('çıkanlar =', 'popped ='), anchor: 'end', size: 14, style: 'dim' });
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      function addPopped(v) {
        var idx = popped.length - 1;
        if (idx > 0) S.set('pp' + (idx - 1), { style: 'dim' });
        S.box('pp' + idx, { x: X0 + idx * POPW, y: POPY, w: 50, h: 40, text: String(v), style: 'new', size: 15 });
      }
      S.step(T('Yığın boş: `top` hiçbir düğümü göstermiyor (`NULL`). Dizideki gibi sabit bir kapasite yok; her eleman kendi belleğinde ayrı bir düğüm olacak, o yüzden bu yığın hiç **taşmaz**.',
               'The stack is empty: `top` points to no node (`NULL`). Unlike an array there is no fixed capacity; each element gets its own node in memory, so this stack never **overflows**.'),
             { c: 5, java: 5 });

      function clean() { list.forEach(function (id) { S.set(id, { style: 'normal' }); }); }
      function relayout() {
        for (var i = 0; i < list.length; i++) {
          var row = Math.floor(i / ROWCAP), col = i % ROWCAP;
          S.move(list[i], X0 + col * DX, Y0 + row * ROWH);
        }
      }
      function pointTop() {
        S.set('top', { target: list.length ? list[0] : 'anchor' });
      }

      d.ops.forEach(function (op, k) {
        clean(); decide('', 'normal'); S.at(k);
        if (op !== POP) {
          var x = op, nid = 'n' + (nextId++);
          if (pushes === 0) {
            S.node(nid, { x: X0, y: Y0 - 90, value: '?', style: 'new' });
            S.step(T('`push(' + x + ')` — `malloc(sizeof(Node))` bellekte yeni bir düğüm ayırır. İçi henüz çöp değer.',
                     '`push(' + x + ')` — `malloc(sizeof(Node))` allocates a new node in memory. Its contents are still garbage.'),
                   { c: 8, java: 8 });
            S.set(nid, { value: String(x) });
            if (list.length) {
              S.arrow('o' + nid, { from: nid, to: list[0], kind: 'next', style: 'new' });
            } else {
              S.set(nid, { isNull: true });
            }
            S.step(T('`n->data = ' + x + '`; `n->next = top`' + (list.length ? ' — yeni düğüm şu anki en üst düğümü gösterir.' : ' — `top` şu an `NULL`, yeni düğümün `next`\'i de `NULL` olur (çizgili köşe).'),
                     '`n->data = ' + x + '`; `n->next = top`' + (list.length ? ' — the new node points to the current top node.' : ' — `top` is `NULL` right now, so the new node\'s `next` is `NULL` too (the crossed corner).')),
                   { c: [9, 10], java: [9, 10] });
            list.unshift(nid);
            S.move(nid, X0, Y0);
            relayout(); pointTop();
            S.step(T('`top = n`: artık yığının en üstü yeni düğüm. İşlem O(1): kaç düğüm olursa olsun hep üç atama.',
                     '`top = n`: the new node is now the top of the stack. O(1): three assignments, however many nodes there are.'),
                   { c: 11, java: 11 });
          } else {
            S.node(nid, { x: X0, y: Y0 - 90, value: String(x), style: 'new' });
            if (list.length) S.arrow('o' + nid, { from: nid, to: list[0], kind: 'next' });
            else S.set(nid, { isNull: true });
            list.unshift(nid);
            relayout(); pointTop();
            S.step(T('`push(' + x + ')` — `malloc`, `data = ' + x + '`, `next = top`, `top = n`. Aynı dört adım, sadece hızlı.',
                     '`push(' + x + ')` — `malloc`, `data = ' + x + '`, `next = top`, `top = n`. The same four steps, just quick.'),
                   { c: [8, 9, 10, 11], java: [8, 9, 10, 11] });
          }
          pushes++;
          return;
        }
        if (!list.length) {
          under++;
          S.set('top', { style: 'del' });
          decide('empty!', 'del');
          S.step(T('`pop()` — `top == NULL`, çıkaracak düğüm yok → **alttan taşma**. `false` döner; program çökmez.',
                   '`pop()` — `top == NULL`, there is no node to remove → **underflow**. It returns `false`; the program does not crash.'),
                 { c: 15, java: 15 });
          S.set('top', { style: 'active' });
          return;
        }
        pops++;
        var tmp = list[0], v = S.get(tmp).value;
        popped.push(Number(v));
        if (pops === 1) {
          S.set(tmp, { style: 'hl' });
          S.label('out', { x: X0 + 260, y: Y0 - 70, text: 'out = ' + v, style: 'hl', size: 18, bold: true, mono: true });
          S.step(T('`pop()` — yığın boş değil. `tmp = top` en üst düğümü tutar; `*out = tmp->data` (' + v + ') okunur, biraz sonra `tmp`\'yi serbest bırakacağız.',
                   '`pop()` — the stack is not empty. `tmp = top` holds the top node; `*out = tmp->data` (' + v + ') is read, we will free `tmp` in a moment.'),
                 { c: [16, 17], java: [16, 17] });
          list.shift();
          if (list.length) S.remove('o' + tmp);
          S.remove(tmp);
          relayout(); pointTop();
          addPopped(v);
          S.step(T('`top = top->next`; `free(tmp)`: bellek geri verilir. (Java\'da bunu çöp toplayıcı yapar.) Unutursak bellek sızıntısı olur.',
                   '`top = top->next`; `free(tmp)`: the memory is given back. (In Java the garbage collector does this.) Forgetting it leaks memory.'),
                 { c: [18, 19], java: [18, 19] });
          S.remove('out');
        } else {
          S.set(tmp, { style: 'del' });
          list.shift();
          if (list.length) S.remove('o' + tmp);
          S.remove(tmp);
          relayout(); pointTop();
          addPopped(v);
          S.step(T('`pop()` → ' + v + '; `tmp` serbest bırakılır, `top` bir alt düğüme geçer.' + (list.length ? '' : ' Son düğüm de gitti: yığın yine boş, `top = NULL`.'),
                   '`pop()` → ' + v + '; `tmp` is freed, `top` moves to the node below.' + (list.length ? '' : ' Even the last node is gone: the stack is empty again, `top = NULL`.')),
                 { c: [16, 17, 18, 19], java: [16, 17, 18, 19] });
        }
      });
      clean(); decide('', 'normal'); S.at(null);
      var rest = list.map(function (id) { return Number(S.get(id).value); }).reverse();
      S.result = { stack: rest, popped: popped, underflows: under };
      S.step(T('Bitti: ' + pushes + ' push, ' + pops + ' başarılı pop, ' + under + ' alttan taşma. '
               + 'Yığında (alttan üste): ' + (rest.length ? rest.join(', ') : 'hiçbir şey') + '. Bağlı yığın bellek bitmedikçe taşmaz; bedeli her düğümdeki fazladan `next` işaretçisidir.',
               'Done: ' + pushes + ' pushes, ' + pops + ' successful pops, ' + under + ' underflow' + (under === 1 ? '' : 's') + '. '
               + 'Stack (bottom to top): ' + (rest.length ? rest.join(', ') : 'nothing') + '. A linked stack never overflows until memory runs out; the cost is the extra `next` pointer in every node.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
