/* Week 3 — deque (double-ended queue): push_front, push_back, pop_front, pop_back, with >= 10-op examples. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct DNode { int data; struct DNode *prev, *next; } DNode;',
    'DNode *front = NULL, *rear = NULL;   /* empty deque */',
    '',
    'void push_back(int x) {          /* add at rear: O(1) */',
    '    DNode *n = malloc(sizeof(DNode));',
    '    n->data = x; n->next = NULL; n->prev = rear;',
    '    if (rear) rear->next = n; else front = n;',
    '    rear = n;',
    '}',
    '',
    'void push_front(int x) {         /* add at front: O(1) */',
    '    DNode *n = malloc(sizeof(DNode));',
    '    n->data = x; n->prev = NULL; n->next = front;',
    '    if (front) front->prev = n; else rear = n;',
    '    front = n;',
    '}',
    '',
    'bool pop_back(int *out) {        /* remove at rear: O(1) */',
    '    if (!rear) return false;     /* underflow */',
    '    *out = rear->data;',
    '    rear = rear->prev;',
    '    if (rear) rear->next = NULL; else front = NULL;',
    '    return true;',
    '}',
    '',
    'bool pop_front(int *out) {       /* remove at front: O(1) */',
    '    if (!front) return false;    /* underflow */',
    '    *out = front->data;',
    '    front = front->next;',
    '    if (front) front->prev = NULL; else rear = NULL;',
    '    return true;',
    '}'
  ];
  var JAVA = [
    'Deque<Integer> d = new ArrayDeque<>();   // empty deque',
    '',
    '// addLast(x): add at rear, O(1)',
    'd.addLast(x);',
    '',
    '// addFirst(x): add at front, O(1)',
    'd.addFirst(x);',
    '',
    '// pollLast(): remove at rear, O(1); returns null if empty (underflow)',
    'Integer out = d.pollLast();',
    '',
    '// pollFirst(): remove at front, O(1); returns null if empty (underflow)',
    'Integer out2 = d.pollFirst();'
  ];
  var MID = 460, Y = 170, BW = 64, BH = 48, DX = 90;

  /** "10" / "-3" -> push_back; "f5" / "f-3" -> push_front; "pb" -> pop_back; "pf" -> pop_front. */
  function parseTok(tok) {
    if (tok === 'pb') return { op: 'pop_back' };
    if (tok === 'pf') return { op: 'pop_front' };
    var m = /^f(-?\d+)$/.exec(tok);
    if (m) return { op: 'push_front', v: parseInt(m[1], 10) };
    if (/^-?\d+$/.test(tok)) return { op: 'push_back', v: parseInt(tok, 10) };
    return null;
  }

  D.define({
    id: 'deque',
    title: T('Çift uçlu kuyruk (deque): push/pop, önden ve arkadan', 'Double-ended queue (deque): push/pop at both ends'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 işlem: her iki uçtan da ekleme ve çıkarma', '10 operations: adding and removing at both ends'),
        data: { ops: ['10', '20', 'f5', 'pb', 'f-3', 'pf', '30', 'f8', 'pb', '40'] } },
      { id: 'mixed', level: 'hard', name: T('14 işlem, negatif değerlerle, sık uç değişimi', '14 operations, with negative values, frequent alternation'),
        data: { ops: ['5', '-8', 'f12', 'pb', 'f-20', 'pf', '15', '-3', 'f7', 'pb', 'pf', 'f-9', '22', 'pb'] } },
      { id: 'pop-empty-both-ends', level: 'edge', name: T('Her iki uçtan da boşken pop, sonra doldur ve yine boşalt', 'Pop at both ends while empty, then fill and drain again'),
        data: { ops: ['pf', 'pb', '10', '20', '30', 'pf', 'pb', 'f5', 'pb', 'pf', 'pb', 'pf'] } },
      { id: 'stack-only', level: 'edge', name: T('Yalnız arka uç: deque bir yığın gibi davranır', 'Only the back end: the deque behaves like a stack'),
        data: { ops: ['10', '20', 'pb', '30', '40', 'pb', '50', '60', 'pb', '70'] } },
      { id: 'queue-only', level: 'edge', name: T('Arkaya ekle, önden çıkar: deque bir kuyruk gibi davranır', 'Add at the back, remove at the front: the deque behaves like a queue'),
        data: { ops: ['10', '20', '30', 'pf', '40', 'pf', '50', '60', 'pf', '70'] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Total number of operations (all four kinds counted) — every example must have at least 10. */
    size: function (d) { return d.ops.length; },
    /** Independent computation of the expected outcome (checked against S.result by test.js). */
    reference: function (d) {
      var el = [], poppedFront = [], poppedBack = [], underFront = 0, underBack = 0;
      // independent of parseTok(): read each token by its first character
      d.ops.forEach(function (tok) {
        if (tok === 'pb') { if (el.length) poppedBack.push(el.pop()); else underBack++; }
        else if (tok === 'pf') { if (el.length) poppedFront.push(el.shift()); else underFront++; }
        else if (tok.charAt(0) === 'f') el.unshift(Number(tok.slice(1)));
        else el.push(Number(tok));
      });
      return { deque: el, poppedFront: poppedFront, poppedBack: poppedBack, underflowFront: underFront, underflowBack: underBack };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level];
      var lo = level === 'extreme' ? -500 : -50, hi = level === 'extreme' ? 500 : 50;
      var ops = [];
      for (var i = 0; i < n; i++) {
        var x = r();
        if (x < 0.38) ops.push(String(D.randInt(r, lo, hi)));
        else if (x < 0.76) ops.push('f' + D.randInt(r, lo, hi));
        else if (x < 0.88) ops.push('pb');
        else ops.push('pf');
      }
      return { ops: ops };
    },
    input: {
      hint: T('Örnek: 10 20 f5 pb f-3 pf 30   (sayı = arkaya ekle, fN = öne ekle, pb = arkadan çıkar, pf = önden çıkar)',
              'Example: 10 20 f5 pb f-3 pf 30   (number = push at back, fN = push at front, pb = pop back, pf = pop front)'),
      parse: function (text) {
        var toks = String(text).trim().split(/[\s,;]+/).filter(Boolean);
        toks.forEach(function (tok) {
          if (!parseTok(tok)) throw T('"' + tok + '" anlaşılmadı: sayı (arkaya), fN (öne), pb (arkadan çıkar) ya da pf (önden çıkar) yazın.',
                                       '"' + tok + '" is not understood: write a number (back), fN (front), pb (pop back) or pf (pop front).');
        });
        if (!toks.length) throw T('En az bir işlem yazın.', 'Write at least one operation.');
        if (toks.length > 40) throw T('En çok 40 işlem.', 'At most 40 operations.');
        return { ops: toks };
      },
      format: function (d) { return d.ops.join(' '); },
      bad: ['', '5 x 7', '3.5', 'fx', '   ']
    },
    build: function (S, d) {
      var ids = [], vals = [], seq = 0, pushBackN = 0, pushFrontN = 0, popBackN = 0, popFrontN = 0;
      var underFront = 0, underBack = 0, poppedFront = [], poppedBack = [];

      S.label('dqname', { x: MID, y: Y - 120, text: T('deque', 'deque'), bold: true, size: 16, style: 'dim' });
      S.label('frontLbl', { x: MID - 5 * DX - 40, y: Y - 56, text: T('ön (front)', 'front'), style: 'dim', size: 15 });
      S.label('backLbl', { x: MID + 5 * DX + 40, y: Y - 56, text: T('arka (back)', 'back'), style: 'dim', size: 15 });
      S.label('info', { x: MID, y: Y - 92, text: T('boş deque', 'empty deque'), style: 'dim', size: 16 });
      S.label('ops', { x: MID, y: Y - 68, text: T(d.ops.length + ' işlem', d.ops.length + ' operations'), style: 'dim', size: 14 });
      S.label('decision', { x: MID, y: Y - 44, text: '', bold: true, size: 16, mono: true });
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      var FX0 = 140, PY_F = Y + 100, PY_B = Y + 150, PW = 42;
      S.label('fplbl', { x: FX0 - 16, y: PY_F + 5, text: T('ön çıkanlar =', 'front popped ='), anchor: 'end', style: 'dim', size: 13 });
      S.label('bplbl', { x: FX0 - 16, y: PY_B + 5, text: T('arka çıkanlar =', 'back popped ='), anchor: 'end', style: 'dim', size: 13 });
      function addPopped(which, v) {
        var arr = which === 'front' ? poppedFront : poppedBack, idx = arr.length - 1;
        var prefix = which === 'front' ? 'pf' : 'pb', y = which === 'front' ? PY_F : PY_B;
        if (idx > 0) S.set(prefix + (idx - 1), { style: 'dim' });
        S.box(prefix + idx, { x: FX0 + idx * PW, y: y, w: 36, h: 30, text: String(v), style: 'new', size: 13 });
      }
      S.step(T('Deque (çift uçlu kuyruk) her iki uçtan da ekleme ve çıkarma yapılmasına izin verir: yığın ile kuyruğun birleşimi gibi. Sırada ' + d.ops.length + ' işlem var.',
               'A deque (double-ended queue) allows adding and removing at both ends: it is like a stack and a queue combined. ' + d.ops.length + ' operations follow.'),
             { c: 1, java: 1 });

      function clean() { ids.forEach(function (id) { S.set(id, { style: 'normal' }); }); }
      function reflow() {
        var start = MID - ids.length * DX / 2 + DX / 2;
        for (var i = 0; i < ids.length; i++) S.move(ids[i], start + i * DX, Y);
      }
      function count() {
        S.set('info', { text: ids.length ? T(ids.length + ' eleman', ids.length + ' element' + (ids.length > 1 ? 's' : '')) : T('boş deque', 'empty deque') });
      }

      d.ops.forEach(function (tok, k) {
        clean(); decide('', 'normal'); S.at(k);
        var t = parseTok(tok);

        if (t.op === 'push_back') {
          pushBackN++;
          var idb = 'e' + (seq++);
          S.box(idb, { x: MID, y: Y, w: BW, h: BH, text: String(t.v), style: 'new', size: 20 });
          ids.push(idb); vals.push(t.v);
          reflow(); count();
          if (pushBackN === 1) {
            S.step(T('`push_back(' + t.v + ')` — yeni eleman arkaya eklenir.', '`push_back(' + t.v + ')` — the new element is added at the back.'), { c: [4, 5, 6, 7, 8], java: [3, 4] });
            S.set(idb, { style: 'normal' });
            S.step(T('Arkaya ekleme her zaman O(1): dizinin başka hiçbir hücresi kaymaz, sadece `rear` güncellenir.',
                     'Adding at the back is always O(1): no other cell has to shift, only `rear` is updated.'), { c: 8, java: 4 });
          } else {
            S.set(idb, { style: 'normal' });
            S.step(T('`push_back(' + t.v + ')` — arkaya eklendi.', '`push_back(' + t.v + ')` — added at the back.'), { c: [4, 5, 6, 7, 8], java: [3, 4] });
          }
          return;
        }

        if (t.op === 'push_front') {
          pushFrontN++;
          var idf = 'e' + (seq++);
          S.box(idf, { x: MID, y: Y, w: BW, h: BH, text: String(t.v), style: 'new', size: 20 });
          ids.unshift(idf); vals.unshift(t.v);
          reflow(); count();
          if (pushFrontN === 1) {
            S.step(T('`push_front(' + t.v + ')` — yeni eleman **öne** eklenir; sıradan bir kuyruk bunu yapamazdı.',
                     '`push_front(' + t.v + ')` — the new element is added at the **front**; a plain queue could not do this.'), { c: [10, 11, 12, 13, 14], java: [6, 7] });
            S.set(idf, { style: 'normal' });
            S.step(T('Öne ekleme de O(1)\'dir: deque her iki ucu da aynı hızda destekler.',
                     'Adding at the front is also O(1): a deque supports both ends at the same speed.'), { c: 14, java: 7 });
          } else {
            S.set(idf, { style: 'normal' });
            S.step(T('`push_front(' + t.v + ')` — öne eklendi.', '`push_front(' + t.v + ')` — added at the front.'), { c: [10, 11, 12, 13, 14], java: [6, 7] });
          }
          return;
        }

        if (t.op === 'pop_back') {
          popBackN++;
          if (!ids.length) {
            underBack++;
            decide('empty (back)!', 'del');
            S.step(T('`pop_back()` — deque boş, arka uçta çıkaracak eleman yok. Çökme olmaz, sadece "yok" bildirilir.',
                     '`pop_back()` — the deque is empty, there is nothing at the back end. It does not crash; it simply reports that.'), { c: 17, java: 9 });
            return;
          }
          var bid = ids[ids.length - 1], bv = vals[vals.length - 1];
          if (popBackN === 1) {
            S.set(bid, { style: 'hl' });
            S.step(T('`pop_back()` — arkadaki eleman (' + bv + ') okunur — bu, deque\'nin yığın gibi davrandığı yön.',
                     '`pop_back()` — the element at the back (' + bv + ') is read — this is the direction where a deque behaves like a stack.'), { c: [18, 19], java: [8, 9] });
            ids.pop(); vals.pop(); poppedBack.push(bv);
            S.remove(bid);
            reflow(); count();
            addPopped('back', bv);
            S.step(T('Eleman kaldırıldı, `rear` bir eleman içeri kayar. O(1): dizinin başka hiçbir hücresi taşınmaz.',
                     'The element is removed, `rear` moves in by one. O(1): no other cell has to move.'), { c: 20, java: 9 });
          } else {
            ids.pop(); vals.pop(); poppedBack.push(bv);
            S.remove(bid);
            reflow(); count();
            addPopped('back', bv);
            S.step(T('`pop_back()` → ' + bv + '.', '`pop_back()` → ' + bv + '.'), { c: [18, 19, 20], java: [8, 9] });
          }
          return;
        }

        // pop_front
        popFrontN++;
        if (!ids.length) {
          underFront++;
          decide('empty (front)!', 'del');
          S.step(T('`pop_front()` — deque boş, ön uçta çıkaracak eleman yok. Çökme olmaz, sadece "yok" bildirilir.',
                   '`pop_front()` — the deque is empty, there is nothing at the front end. It does not crash; it simply reports that.'), { c: 24, java: 11 });
          return;
        }
        var fid = ids[0], fv = vals[0];
        if (popFrontN === 1) {
          S.set(fid, { style: 'hl' });
          S.step(T('`pop_front()` — öndeki eleman (' + fv + ') okunur — bu, deque\'nin kuyruk gibi davrandığı yön.',
                   '`pop_front()` — the element at the front (' + fv + ') is read — this is the direction where a deque behaves like a queue.'), { c: [25, 26], java: [10, 11] });
          ids.shift(); vals.shift(); poppedFront.push(fv);
          S.remove(fid);
          reflow(); count();
          addPopped('front', fv);
          S.step(T('Eleman kaldırıldı, `front` bir eleman içeri kayar. Gerçek uygulamada bu da O(1): dairesel dizi ya da çift bağlı liste ile yapılır.',
                   'The element is removed, `front` moves in by one. A real implementation keeps this O(1) too: with a circular array or a doubly linked list.'), { c: 27, java: 11 });
        } else {
          ids.shift(); vals.shift(); poppedFront.push(fv);
          S.remove(fid);
          reflow(); count();
          addPopped('front', fv);
          S.step(T('`pop_front()` → ' + fv + '.', '`pop_front()` → ' + fv + '.'), { c: [25, 26, 27], java: [10, 11] });
        }
      });
      clean(); decide('', 'normal'); S.at(null);
      S.result = { deque: vals.slice(), poppedFront: poppedFront, poppedBack: poppedBack, underflowFront: underFront, underflowBack: underBack };
      S.step(T('Bitti: ' + pushBackN + ' push_back, ' + pushFrontN + ' push_front, ' + popBackN + ' pop_back, ' + popFrontN + ' pop_front çağrısı' +
               (underFront || underBack ? ' (' + underFront + ' önden, ' + underBack + ' arkadan alttan taşma)' : '') +
               '. Deque (front → back): ' + (vals.length ? vals.join(', ') : 'hiçbir şey') + '. Dört işlem de O(1): deque bir yığın ve bir kuyruğun yapabildiği her şeyi yapar.',
               'Done: ' + pushBackN + ' push_back, ' + pushFrontN + ' push_front, ' + popBackN + ' pop_back, ' + popFrontN + ' pop_front call' + ((pushBackN + pushFrontN + popBackN + popFrontN) === 1 ? '' : 's') +
               (underFront || underBack ? ' (' + underFront + ' front, ' + underBack + ' back underflow' + ((underFront + underBack) > 1 ? 's' : '') + ')' : '') +
               '. Deque (front → back): ' + (vals.length ? vals.join(', ') : 'nothing') + '. All four operations are O(1): a deque does everything a stack and a queue can do.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
