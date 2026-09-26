/* Week 2 -- XOR linked list: one field, `npx`, holds XOR(prev, next) instead of two separate pointers.
 * Traversal recovers the OTHER neighbour by XOR-ing `npx` with the ONE neighbour you arrived from. Both
 * `insert_head` and `insert_tail` keep the same trick: XOR the new node's own npx from its one known neighbour,
 * then patch that neighbour's npx to swap in the new node -- the address arithmetic stays visible at every step.
 * Program: xor_linked_list.c / XorLinkedList.java. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct Node {',
    '    int data;',
    '    uintptr_t npx;      /* XOR of the addresses of prev and next */',
    '} Node;',
    '',
    'static uintptr_t addr(Node *p) { return (uintptr_t)p; }',
    'static Node *xor_node(uintptr_t npx, Node *known) { return (Node *)(npx ^ addr(known)); }',
    '',
    'Node *insert_head(Node *head, Node **tail, int value) {',
    '    Node *n = malloc(sizeof(Node));',
    '    n->data = value;',
    '    n->npx = addr(NULL) ^ addr(head);     /* prev = NULL, next = old head */',
    '    if (head != NULL)',
    '        head->npx = addr(n) ^ addr(xor_node(head->npx, NULL));  /* old head\'s prev becomes n */',
    '    else',
    '        *tail = n;                        /* first node is both head and tail */',
    '    return n;',
    '}',
    '',
    'Node *insert_tail(Node **head, Node *tail, int value) {',
    '    Node *n = malloc(sizeof(Node));',
    '    n->data = value;',
    '    n->npx = addr(tail) ^ addr(NULL);     /* prev = old tail, next = NULL */',
    '    if (tail != NULL)',
    '        tail->npx = addr(xor_node(tail->npx, NULL)) ^ addr(n);  /* old tail\'s next becomes n */',
    '    else',
    '        *head = n;                        /* first node is both head and tail */',
    '    return n;',
    '}',
    '',
    'void traverse_forward(Node *head) {',
    '    Node *prev = NULL, *cur = head;',
    '    while (cur != NULL) {',
    '        printf(" %d", cur->data);',
    '        Node *next = xor_node(cur->npx, prev);',
    '        prev = cur; cur = next;',
    '    }',
    '}',
    '',
    'void traverse_backward(Node *tail) {',
    '    Node *next = NULL, *cur = tail;',
    '    while (cur != NULL) {',
    '        printf(" %d", cur->data);',
    '        Node *prev = xor_node(cur->npx, next);',
    '        next = cur; cur = prev;',
    '    }',
    '}'
  ];
  var JAVA = [
    '// Java has no pointer arithmetic: each node\'s "address" is its index in a small pool array.',
    'static final int NONE = 0;   // 0 means "no node" (real nodes live at indices 1..n)',
    'class Node { int data; int npx; }   // XOR of the POOL INDEX of prev and of next',
    'Node[] pool = new Node[100]; int count = 0;',
    '',
    'static int insertHead(int head, int[] tail, int value) {',
    '    int n = allocate(value);',
    '    pool[n].npx = NONE ^ head;                 // prev = NONE, next = old head',
    '    if (head != NONE) {',
    '        int headNext = pool[head].npx ^ NONE;  // old head\'s prev was NONE',
    '        pool[head].npx = n ^ headNext;         // old head\'s prev becomes n',
    '    } else tail[0] = n;                        // first node is both head and tail',
    '    return n;',
    '}',
    '',
    'static int insertTail(int[] head, int tail, int value) {',
    '    int n = allocate(value);',
    '    pool[n].npx = tail ^ NONE;                 // prev = old tail, next = NONE',
    '    if (tail != NONE) {',
    '        int tailNext = pool[tail].npx ^ NONE;  // old tail\'s next was NONE',
    '        pool[tail].npx = n ^ tailNext;         // old tail\'s next becomes n',
    '    } else head[0] = n;                        // first node is both head and tail',
    '    return n;',
    '}',
    '',
    'static void traverseForward(int head) {',
    '    int prev = NONE, cur = head;',
    '    while (cur != NONE) {',
    '        System.out.print(" " + pool[cur].data);',
    '        int next = pool[cur].npx ^ prev;',
    '        prev = cur; cur = next;',
    '    }',
    '}',
    '',
    'static void traverseBackward(int tail) {',
    '    int next = NONE, cur = tail;',
    '    while (cur != NONE) {',
    '        System.out.print(" " + pool[cur].data);',
    '        int prev = pool[cur].npx ^ next;',
    '        next = cur; cur = prev;',
    '    }',
    '}'
  ];
  var ROWCAP = 10, DX = 112, ROWH = 150, X0 = 110, Y0 = 110;
  function hex(n) { return '0x' + (n >>> 0).toString(16).toUpperCase(); }
  function isTailTok(o) { return typeof o === 'string'; }
  function tailVal(o) { return Number(o.slice(1)); }

  D.define({
    id: 'xor-linked-list',
    title: T('XOR bağlı liste: prev XOR next tek alanda', 'XOR linked list: prev XOR next in a single field'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 düğüm, sırayla insert_head', '10 nodes, inserted one by one with insert_head'),
        data: { ops: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10] } },
      { id: 'hard', level: 'hard', name: T('12 düğüm (yinelenen/negatif değerler)', '12 nodes (duplicates/negatives)'),
        data: { ops: [-100, 100, -3, 2, -1, 8, 8, -3, 0, 5, -3, 5] } },
      { id: 'single-node', level: 'edge', name: T('Tek düğüm', 'A single node'), data: { ops: [7] }, small: true },
      { id: 'two-nodes', level: 'edge', name: T('İki düğüm', 'Two nodes'), data: { ops: [2, 1] }, small: true },
      { id: 'tail-basic', level: 'edge', name: T('10 düğüm, sırayla insert_tail (FIFO sırası)', '10 nodes, inserted one by one with insert_tail (FIFO order)'),
        data: { ops: ['t10', 't20', 't30', 't40', 't50', 't60', 't70', 't80', 't90', 't100'] } },
      { id: 'mixed-head-tail', level: 'edge', name: T('12 düğüm, insert_head ve insert_tail karışık', '12 nodes, mixing insert_head and insert_tail'),
        data: { ops: [10, 't20', 30, 't40', 50, 't60', 70, 't80', 90, 't100', 110, 't120'] } },
      { id: 'tail-into-empty', level: 'edge', name: T('Boş listeye insert_tail: tek düğüm hem baş hem son olur', 'insert_tail into an empty list: a single node becomes both head and tail'),
        data: { ops: ['t99'] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of insert calls (head or tail) -- every non-tiny example has at least 10; the tiny edge cases are `small`. */
    size: function (d) { return d.ops.length; },
    /** Independent computation of the expected outcome: a plain array simulation, no shared helper with build(). */
    reference: function (d) {
      var list = [];
      d.ops.forEach(function (o) {
        if (typeof o === 'string') list.push(Number(o.slice(1))); else list.unshift(o);
      });
      return { forward: list, backward: list.slice().reverse() };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level];
      var lo = level === 'extreme' ? -500 : 1, hi = level === 'extreme' ? 500 : 99;
      var ops = [];
      for (var i = 0; i < n; i++) { var v = D.randInt(r, lo, hi); ops.push(r() < 0.5 ? v : ('t' + v)); }
      return { ops: ops };
    },
    input: {
      hint: T('Örnek: 10 t20 30 t40   (sayı = insert_head, tN = insert_tail)', 'Example: 10 t20 30 t40   (number = insert_head, tN = insert_tail)'),
      parse: function (text) {
        var toks = String(text).trim().split(/[\s,;]+/).filter(Boolean);
        if (!toks.length) throw T('En az bir değer yazın.', 'Write at least one value.');
        if (toks.length > 24) throw T('En çok 24 değer.', 'At most 24 values.');
        return {
          ops: toks.map(function (tok) {
            var m = /^t(-?\d+)$/i.exec(tok);
            if (m) return 't' + parseInt(m[1], 10);
            if (/^-?\d+$/.test(tok)) return parseInt(tok, 10);
            throw T('"' + tok + '" anlaşılmadı: sayı (insert_head) ya da tN (insert_tail) yazın.', '"' + tok + '" is not understood: write a number (insert_head) or tN (insert_tail).');
          })
        };
      },
      format: function (d) { return d.ops.map(String).join(' '); },
      tokens: function (d) { return d.ops.map(String); },
      bad: ['', '5 x 7', '3.5', '  ', '1;;x']
    },
    build: function (S, d) {
      var order = [], meta = {}, addrToId = {}, seq = 0, nextAddr = 0x1000;

      S.label('info', { x: X0, y: Y0 - 76, text: T('Her düğümün YALNIZ bir alanı var: `npx = prev XOR next`.', 'Every node has just ONE field: `npx = prev XOR next`.'), style: 'dim', size: 15 });
      S.step(T('XOR bağlı liste bir hafıza tasarrufu tuhaflığıdır: standart C bunu GARANTİ etmez (işaretçi <-> tamsayı dönüşümleri derleyiciye bağlıdır), ve çöp toplayıcılı diller (Java gibi) bunu hiç yapamaz -- gerçek bellek adresleri yerine kendi küçük havuz dizisindeki indisleri kullanır.',
               'An XOR linked list is a memory-saving curiosity: standard C does not GUARANTEE this works (pointer <-> integer casts are implementation-defined), and garbage-collected languages (like Java) cannot do it at all -- Java stands in with indices into its own small pool array instead of real memory addresses.'), { c: [], java: [] });

      function relayout() {
        for (var i = 0; i < order.length; i++) {
          var row = Math.floor(i / ROWCAP), col = i % ROWCAP;
          S.move(order[i], X0 + col * DX, Y0 + row * ROWH);
        }
      }
      function clean() { order.forEach(function (id) { S.set(id, { style: 'normal' }); }); }
      function refreshLabels() { order.forEach(function (id) { S.set(id, { above: 'addr=' + hex(meta[id].addr), below: 'npx=' + hex(meta[id].npx) }); }); }

      var headDetailSeen = 0, tailDetailSeen = 0;
      d.ops.forEach(function (o, opIdx) {
        S.at(opIdx);
        clean();
        var isTailOp = isTailTok(o);
        var v = isTailOp ? tailVal(o) : o;
        var nid = 'x' + (seq++), addr = nextAddr; nextAddr += 0x10;
        S.node(nid, { x: X0, y: Y0 - 120, value: String(v), style: 'new', above: 'addr=' + hex(addr), below: '?' });
        addrToId[addr] = nid;

        if (!isTailOp) {
          var oldHeadId = order.length ? order[0] : null;
          var npx = oldHeadId ? meta[oldHeadId].addr : 0;
          var detailed = headDetailSeen < 2;
          if (detailed) {
            headDetailSeen++;
            S.step(T('`insert_head(' + v + ')`: yeni düğüm bellekte ' + hex(addr) + ' adresinde. `n->npx = addr(NULL) ^ addr(head)` = `0 ^ ' + hex(npx) + '` = `' + hex(npx) + '`.',
                     '`insert_head(' + v + ')`: the new node lives at address ' + hex(addr) + '. `n->npx = addr(NULL) ^ addr(head)` = `0 ^ ' + hex(npx) + '` = `' + hex(npx) + '`.'), { c: [10, 11], java: [7, 8] });
          }
          meta[nid] = { addr: addr, npx: npx };
          S.set(nid, { below: 'npx=' + hex(npx) });
          if (oldHeadId) {
            var oldHeadOldNext = meta[oldHeadId].npx; // old head's prev was 0 (NULL)
            var newHeadNpx = addr ^ oldHeadOldNext;
            if (detailed) S.step(T('Eski baş (' + hex(meta[oldHeadId].addr) + ') güncellenir: onun `prev`\'i artık `n` (' + hex(addr) + '). `head->npx = addr(n) ^ addr(xor_node(head->npx, NULL))` = `' + hex(addr) + ' ^ ' + hex(oldHeadOldNext) + '` = `' + hex(newHeadNpx) + '`.',
                                   'The old head (' + hex(meta[oldHeadId].addr) + ') is updated: its `prev` is now `n` (' + hex(addr) + '). `head->npx = addr(n) ^ addr(xor_node(head->npx, NULL))` = `' + hex(addr) + ' ^ ' + hex(oldHeadOldNext) + '` = `' + hex(newHeadNpx) + '`.'), { c: 13, java: [9, 10] });
            meta[oldHeadId].npx = newHeadNpx;
          }
          order.unshift(nid);
          relayout(); refreshLabels(); clean();
          S.step(T((detailed ? '`head = n`: ' : '`insert_head(' + v + ')`: ') + 'yeni düğüm artık baş. Bu liste O(1) ekleme yapar, tıpkı sıradan bir tekil bağlı liste gibi -- fark yalnız alan sayısında.',
                   (detailed ? '`head = n`: ' : '`insert_head(' + v + ')`: ') + 'the new node is now the head. This is still an O(1) insertion, just like a plain singly linked list -- the only difference is the field count.'), { c: 16, java: 11 });
        } else {
          var oldTailId = order.length ? order[order.length - 1] : null;
          var npx2 = oldTailId ? meta[oldTailId].addr : 0;
          var detailedT = tailDetailSeen < 2;
          if (detailedT) {
            tailDetailSeen++;
            S.step(T('`insert_tail(' + v + ')`: yeni düğüm bellekte ' + hex(addr) + ' adresinde. `n->npx = addr(tail) ^ addr(NULL)` = `' + hex(npx2) + ' ^ 0` = `' + hex(npx2) + '`.',
                     '`insert_tail(' + v + ')`: the new node lives at address ' + hex(addr) + '. `n->npx = addr(tail) ^ addr(NULL)` = `' + hex(npx2) + ' ^ 0` = `' + hex(npx2) + '`.'), { c: [21, 22], java: [17, 18] });
          }
          meta[nid] = { addr: addr, npx: npx2 };
          S.set(nid, { below: 'npx=' + hex(npx2) });
          if (oldTailId) {
            var oldTailOldPrev = meta[oldTailId].npx; // old tail's next was 0 (NULL)
            var newTailNpx = oldTailOldPrev ^ addr;
            if (detailedT) S.step(T('Eski son (tail) (' + hex(meta[oldTailId].addr) + ') güncellenir: onun `next`\'i artık `n` (' + hex(addr) + '). `tail->npx = addr(xor_node(tail->npx, NULL)) ^ addr(n)` = `' + hex(oldTailOldPrev) + ' ^ ' + hex(addr) + '` = `' + hex(newTailNpx) + '`.',
                                    'The old tail (' + hex(meta[oldTailId].addr) + ') is updated: its `next` is now `n` (' + hex(addr) + '). `tail->npx = addr(xor_node(tail->npx, NULL)) ^ addr(n)` = `' + hex(oldTailOldPrev) + ' ^ ' + hex(addr) + '` = `' + hex(newTailNpx) + '`.'), { c: 25, java: [19, 20] });
            meta[oldTailId].npx = newTailNpx;
          }
          order.push(nid);
          relayout(); refreshLabels(); clean();
          S.step(T((detailedT ? '`tail = n`: ' : '`insert_tail(' + v + ')`: ') + 'yeni düğüm artık son (tail). Aynı O(1) numara, yalnız yön ters.',
                   (detailedT ? '`tail = n`: ' : '`insert_tail(' + v + ')`: ') + 'the new node is now the tail. The same O(1) trick, just in the other direction.'), { c: 27, java: 21 });
        }
      });
      S.at(null);

      clean();
      if (!order.length) {
        S.result = { forward: [], backward: [] };
        S.step(T('Liste boş: gezinecek bir şey yok.', 'The list is empty: there is nothing to traverse.'), { c: [], java: [] });
        return;
      }

      S.step(T('`traverse_forward(head)`: `prev = NULL` (0), `cur = head`. Her adımda `next`\'i `cur->npx XOR prev` ile HESAPLIYORUZ -- saklı bir `next` alanı yok.',
               '`traverse_forward(head)`: `prev = NULL` (0), `cur = head`. At every step we COMPUTE `next` as `cur->npx XOR prev` -- there is no stored `next` field.'), { c: [30, 31], java: [25, 26] });
      var prevAddr = 0, curId = order[0], forwardOut = [], hop = 0;
      while (curId) {
        clean(); S.set(curId, { style: 'active' });
        var nextAddr2 = meta[curId].npx ^ prevAddr;
        var nextId = addrToId[nextAddr2] || null;
        if (nextId) S.arrow('fwdArw', { from: curId, to: nextId, kind: 'center', bend: 30, style: 'hl', text: T('sonraki', 'next') });
        else if (S.has('fwdArw')) S.remove('fwdArw');
        forwardOut.push(Number(S.get(curId).value));
        if (hop < 3) S.step(T('değer ' + S.get(curId).value + '; `next = npx (' + hex(meta[curId].npx) + ') ^ prev (' + hex(prevAddr) + ')` = `' + hex(nextAddr2) + '` = ' + (nextId ? 'düğüm ' + S.get(nextId).value : 'NULL') + '.',
                               'value ' + S.get(curId).value + '; `next = npx (' + hex(meta[curId].npx) + ') ^ prev (' + hex(prevAddr) + ')` = `' + hex(nextAddr2) + '` = ' + (nextId ? 'node ' + S.get(nextId).value : 'NULL') + '.'), { c: [32, 33], java: [27, 28] });
        else S.step(T('değer ' + S.get(curId).value + '; aynı XOR hesabı hızlı devam eder.', 'value ' + S.get(curId).value + '; the same XOR computation continues quickly.'), { c: [32, 33], java: [27, 28] });
        prevAddr = meta[curId].addr; curId = nextId; hop++;
      }
      if (S.has('fwdArw')) S.remove('fwdArw');
      clean();

      var tailId = order[order.length - 1];
      S.step(T('`traverse_backward(tail)`: aynı numara, ters yönde -- `next = NULL` (0) ile başlar, `xor_node(cur->npx, next)` ile `prev`\'i hesaplar.',
               '`traverse_backward(tail)`: the same trick, run backward -- starts with `next = NULL` (0), computes `prev` via `xor_node(cur->npx, next)`.'), { c: [39, 40], java: [34, 35] });
      var nextAddrB = 0, curIdB = tailId, backwardOut = [], hopB = 0;
      while (curIdB) {
        clean(); S.set(curIdB, { style: 'active' });
        var prevAddr2 = meta[curIdB].npx ^ nextAddrB;
        var prevId = addrToId[prevAddr2] || null;
        if (prevId) S.arrow('bwdArw', { from: curIdB, to: prevId, kind: 'center', bend: -30, style: 'active', text: T('önceki', 'prev') });
        else if (S.has('bwdArw')) S.remove('bwdArw');
        backwardOut.push(Number(S.get(curIdB).value));
        if (hopB < 2) S.step(T('değer ' + S.get(curIdB).value + '; `prev = npx (' + hex(meta[curIdB].npx) + ') ^ next (' + hex(nextAddrB) + ')` = `' + hex(prevAddr2) + '` = ' + (prevId ? 'düğüm ' + S.get(prevId).value : 'NULL') + '.',
                                'value ' + S.get(curIdB).value + '; `prev = npx (' + hex(meta[curIdB].npx) + ') ^ next (' + hex(nextAddrB) + ')` = `' + hex(prevAddr2) + '` = ' + (prevId ? 'node ' + S.get(prevId).value : 'NULL') + '.'), { c: [41, 42], java: [36, 37] });
        else S.step(T('geriye: ' + S.get(curIdB).value + '.', 'backward: ' + S.get(curIdB).value + '.'), { c: [41, 42], java: [36, 37] });
        nextAddrB = meta[curIdB].addr; curIdB = prevId; hopB++;
      }
      if (S.has('bwdArw')) S.remove('bwdArw');
      clean();
      S.result = { forward: forwardOut, backward: backwardOut };
      S.step(T('Bitti. İleri: ' + forwardOut.join(', ') + '. Geri: ' + backwardOut.join(', ') + '. Tek bir `npx` alanıyla iki yönlü gezinme -- bedeli her adımda bir XOR.',
               'Done. Forward: ' + forwardOut.join(', ') + '. Backward: ' + backwardOut.join(', ') + '. Two-way traversal from a single `npx` field -- the cost is one XOR per step.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
