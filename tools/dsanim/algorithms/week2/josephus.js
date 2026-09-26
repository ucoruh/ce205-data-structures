/* Week 2 -- the Josephus problem: n people in a circle, every k-th one eliminated, who survives?
 * Solved with a circular linked list, exactly like josephus.c / Josephus.java: a counter walks k-1 steps
 * forward, the person it lands on is removed, and the walk continues from the next person. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct Node { int id; struct Node *next; } Node;',
    '',
    'int josephus(int n, int k) {',
    '    Node *head = build_circle(n);',
    '    Node *prev = head;',
    '    while (prev->next != head)   /* find the node before head */',
    '        prev = prev->next;',
    '',
    '    Node *cur = head;',
    '    int remaining = n;',
    '    while (remaining > 1) {',
    '        for (int step = 1; step < k; step++) {   /* count k-1 steps forward */',
    '            prev = cur;',
    '            cur = cur->next;',
    '        }',
    '        prev->next = cur->next;   /* remove cur from the circle */',
    '        free(cur);',
    '        cur = prev->next;',
    '        remaining--;',
    '    }',
    '    return cur->id;                /* the sole survivor */',
    '}'
  ];
  var JAVA = [
    'class Node { int id; Node next; Node(int id) { this.id = id; } }',
    '',
    'static int josephus(int n, int k) {',
    '    Node head = buildCircle(n);',
    '    Node prev = head;',
    '    while (prev.next != head)    // find the node before head',
    '        prev = prev.next;',
    '',
    '    Node cur = head;',
    '    int remaining = n;',
    '    while (remaining > 1) {',
    '        for (int step = 1; step < k; step++) {   // count k-1 steps forward',
    '            prev = cur;',
    '            cur = cur.next;',
    '        }',
    '        prev.next = cur.next;     // remove cur from the circle',
    '        cur = prev.next;',
    '        remaining--;',
    '    }',
    '    return cur.id;                 // the sole survivor',
    '}'
  ];
  var X0 = 110, DX = 95, Y0 = 150;

  D.define({
    id: 'josephus',
    title: T('Josephus problemi: her k. kişi elenir', 'The Josephus problem: every k-th person is eliminated'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('n = 10, k = 3', 'n = 10, k = 3'), data: { n: 10, k: 3 } },
      { id: 'hard', level: 'hard', name: T('n = 12, k = 5', 'n = 12, k = 5'), data: { n: 12, k: 5 } },
      { id: 'k-equals-1', level: 'edge', name: T('n = 10, k = 1: sıradan eleme', 'n = 10, k = 1: eliminate in plain order'), data: { n: 10, k: 1 } },
      { id: 'n-equals-1', level: 'edge', name: T('n = 1: elenecek kimse yok', 'n = 1: nobody to eliminate'), data: { n: 1, k: 3 }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of people in the circle -- every non-tiny example has at least 10; n = 1 is the small edge case. */
    size: function (d) { return d.n; },
    /** Independent computation: the closed-form recurrence J(1)=0, J(n)=(J(n-1)+k) mod n for the survivor,
     * plus a SEPARATE plain array simulation for the full elimination order -- neither shares code with build(). */
    reference: function (d) {
      var n = d.n, k = d.k;
      var j = 0;
      for (var i = 2; i <= n; i++) j = (j + k) % i;
      var survivor = j + 1; // convert the 0-indexed recurrence answer to a 1-indexed person id
      var arr = []; for (var p = 1; p <= n; p++) arr.push(p);
      var idx = 0, order = [];
      while (arr.length > 1) {
        idx = (idx + k - 1) % arr.length;
        order.push(arr[idx]);
        arr.splice(idx, 1);
        if (arr.length) idx = idx % arr.length;
      }
      return { survivor: survivor, order: order };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level];
      var k = D.randInt(r, 1, level === 'extreme' ? 9 : 6);
      return { n: n, k: k };
    },
    input: {
      hint: T('Örnek: n=10 k=3', 'Example: n=10 k=3'),
      parse: function (text) {
        var m = /^\s*n\s*=\s*(\d+)\s+k\s*=\s*(\d+)\s*$/i.exec(text);
        if (!m) throw T('"n=10 k=3" biçiminde yazın.', 'Write it as "n=10 k=3".');
        var n = parseInt(m[1], 10), k = parseInt(m[2], 10);
        if (n < 1 || n > 30) throw T('n, 1 ile 30 arasında olmalı.', 'n must be between 1 and 30.');
        if (k < 1 || k > 20) throw T('k, 1 ile 20 arasında olmalı.', 'k must be between 1 and 20.');
        return { n: n, k: k };
      },
      format: function (d) { return 'n=' + d.n + ' k=' + d.k; },
      bad: ['', 'n=0 k=3', 'n=10', 'n=10 k=0', 'n=abc k=3']
    },
    build: function (S, d) {
      var n = d.n, k = d.k, ids = [];
      for (var i = 1; i <= n; i++) ids.push('p' + i);
      for (var i2 = 0; i2 < n; i2++) S.node(ids[i2], { x: X0 + i2 * DX, y: Y0, value: String(i2 + 1) });

      function relayoutAndWire() {
        for (var q = 0; q < ids.length; q++) S.move(ids[q], X0 + q * DX, Y0);
        ids.forEach(function (id) { if (S.has('o' + id)) S.remove('o' + id); });
        if (S.has('wrap')) S.remove('wrap');
        for (var w = 0; w < ids.length - 1; w++) S.arrow('o' + ids[w], { from: ids[w], to: ids[w + 1], kind: 'next' });
        if (ids.length >= 2) S.arrow('wrap', { from: ids[ids.length - 1], to: ids[0], kind: 'center', bend: -60, style: 'active', text: T('sarılır', 'wraps') });
      }
      function clean() { ids.forEach(function (id) { S.set(id, { style: 'normal' }); }); }
      relayoutAndWire();

      if (n === 1) {
        S.set(ids[0], { style: 'hl' });
        S.step(T('`n = 1`: çember bir kişiden ibaret, `remaining > 1` hiç doğru olmuyor -- döngü çalışmadan `cur->id` (1) döner.',
                 '`n = 1`: the circle has just one person, `remaining > 1` is never true -- the loop never runs, `cur->id` (1) is returned right away.'), { c: [10, 19], java: [9, 18] });
        S.result = { survivor: 1, order: [] };
        return;
      }

      S.pointer('curP', { target: ids[0], text: 'cur', side: 'top', dist: 30 });
      S.step(T(n + ' kişi bir çemberde. `cur = head` (kişi 1). Her ' + k + '. kişi elenecek; `prev`, `cur`\'dan bir önceki kişiyi tutar.',
               n + ' people stand in a circle. `cur = head` (person 1). Every ' + k + (k === 1 ? 'st' : (k === 2 ? 'nd' : (k === 3 ? 'rd' : 'th'))) + ' person is eliminated; `prev` holds the person right before `cur`.'), { c: [4, 5, 6, 7, 8], java: [4, 5, 6] });

      var curIdx = 0, order = [];
      var elimNo = 0;
      while (ids.length > 1) {
        var detailed = elimNo < 2;
        clean(); S.set(ids[curIdx], { style: 'active' });
        var target = curIdx;
        if (detailed && k > 1) {
          for (var step = 1; step < k; step++) {
            target = (target + 1) % ids.length;
            S.set('curP', { target: ids[target] });
            clean(); S.set(ids[target], { style: 'active' });
            S.step(T('say ' + step + '/' + (k - 1) + ': `prev = cur`; `cur = cur->next` -> kişi ' + S.get(ids[target]).value + '.',
                     'count ' + step + '/' + (k - 1) + ': `prev = cur`; `cur = cur->next` -> person ' + S.get(ids[target]).value + '.'), { c: [12, 13, 14], java: [11, 12, 13] });
          }
        } else {
          target = (curIdx + k - 1) % ids.length;
          S.set('curP', { target: ids[target] });
          clean(); S.set(ids[target], { style: 'active' });
          S.step(T((elimNo + 1) + '. eleme: ' + (k - 1) + ' adım sayılır, kişi ' + S.get(ids[target]).value + '\'e varılır.',
                   'elimination ' + (elimNo + 1) + ': ' + (k - 1) + ' step' + (k === 2 ? '' : 's') + ' counted, arriving at person ' + S.get(ids[target]).value + '.'), { c: [12, 13, 14], java: [11, 12, 13] });
        }
        var victimValue = Number(S.get(ids[target]).value);
        S.set(ids[target], { style: 'del' });
        S.step(T('`prev->next = cur->next`: kişi ' + victimValue + ' çemberden çıkarılır (bypass oku), `free(cur)`.',
                 '`prev->next = cur->next`: person ' + victimValue + ' is removed from the circle (the bypass arrow), `free(cur)`.'), { c: [16, 17], java: 15 });
        order.push(victimValue);
        var victimId = ids[target];
        if (S.has('o' + victimId)) S.remove('o' + victimId);
        S.remove(victimId);
        ids.splice(target, 1);
        curIdx = ids.length ? target % ids.length : 0;
        relayoutAndWire(); clean();
        if (ids.length) { S.set('curP', { target: ids[curIdx] }); S.set(ids[curIdx], { style: 'active' }); }
        elimNo++;
      }
      if (S.has('curP')) S.remove('curP');
      clean(); S.set(ids[0], { style: 'hl' });
      var survivor = Number(S.get(ids[0]).value);
      S.result = { survivor: survivor, order: order };
      S.step(T('Bitti: hayatta kalan kişi ' + survivor + '. Eleme sırası: ' + order.join(', ') + '. (Not: kapalı biçim -- `J(1)=0`, `J(n)=(J(n-1)+k) mod n` -- her adımı simüle etmeden aynı hayatta kalanı verir.)',
               'Done: person ' + survivor + ' survives. Elimination order: ' + order.join(', ') + '. (Aside: the closed form -- `J(1)=0`, `J(n)=(J(n-1)+k) mod n` -- gives the same survivor without simulating every step.)'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
