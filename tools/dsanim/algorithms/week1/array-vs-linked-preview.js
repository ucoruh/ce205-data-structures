/* Week 1 — preview: the same values laid out as a contiguous array (address = base + 4*i) versus
 * scattered linked-list nodes; compare accessing element k: 1 step in the array vs k hops in the list.
 * Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var DETAIL_HOPS = 5, ROW = 16, ROWL = 8;

  function code(d) {
    var n = (d && d.values && d.values.length) || 10;
    var C = [
      '#define N ' + n,
      'typedef struct Node { int data; struct Node *next; } Node;',
      '',
      'int arr[N];                       /* filled with the input values */',
      'for (int i = 0; i < N; i++)',
      '    printf("arr[%d] = %d at %p\\n", i, arr[i], (void *) &arr[i]);',
      '',
      'Node *head = NULL;',
      'for (int i = N - 1; i >= 0; i--) {',
      '    Node *node = malloc(sizeof(Node));',
      '    node->data = arr[i];',
      '    node->next = head;',
      '    head = node;',
      '}',
      '',
      'Node *p = head;',
      'for (int hop = 0; hop < k; hop++)',
      '    p = p->next;                  /* one hop per iteration */'
    ];
    var JAVA = [
      'static final int N = ' + n + ';',
      'static class Node { int data; Node next; }',
      '',
      'int[] arr = new int[N];           // filled with the input values',
      'for (int i = 0; i < N; i++)',
      '    System.out.println("arr[" + i + "] = " + arr[i]);',
      '',
      'Node head = null;',
      'for (int i = N - 1; i >= 0; i--) {',
      '    Node node = new Node();',
      '    node.data = arr[i];',
      '    node.next = head;',
      '    head = node;',
      '}',
      '',
      'Node p = head;',
      'for (int hop = 0; hop < k; hop++)',
      '    p = p.next;'
    ];
    return { c: C, java: JAVA };
  }
  /** Deterministic scattered pseudo-addresses for the linked nodes, derived only from seed/values.length. */
  function scatterAddresses(seed, n) {
    var r = D.rng(seed), addrs = [], i;
    for (i = 0; i < n; i++) addrs.push(1000 + D.randInt(r, 0, 500) * 4);
    return addrs;
  }

  D.define({
    id: 'array-vs-linked-preview',
    title: T('Önizleme: dizi düzeni ile bağlı liste düzeni', 'Preview: array layout vs linked layout'),
    code: code,
    presets: [
      { id: 'normal', level: 'normal', name: T('10 değer, k = 4 (ortada)', '10 values, k = 4 (in the middle)'),
        data: { base: 1000, values: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], seed: 3, k: 4 } },
      { id: 'hard', level: 'hard', name: T('16 değer, k = 13 (sona yakın)', '16 values, k = 13 (near the end)'),
        data: { base: 5000, values: [11, 22, 33, 44, 55, 66, 77, 88, 99, 111, 122, 133, 144, 155, 166, 177], seed: 11, k: 13 } },
      { id: 'first', level: 'edge', name: T('k = 0: baştaki eleman', 'k = 0: the first element'),
        data: { base: 1000, values: [7, 14, 21, 28, 35, 42, 49, 56, 63, 70], seed: 2, k: 0 } },
      { id: 'last', level: 'edge', name: T('k = son indeks: en çok sıçrama', 'k = the last index: the most hops'),
        data: { base: 3000, values: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36], seed: 9, k: 11 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.values.length; },
    /** Independent: array access is a single computed address; linked access takes k hops from the head. */
    reference: function (d) { return { arrayAddress: d.base + 4 * d.k, hops: d.k }; },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level];
      var values = [], i;
      for (i = 0; i < n; i++) values.push(D.randInt(r, 1, 999));
      var base = 1000 + D.randInt(r, 0, 2000) * 4;
      var seed = D.randInt(r, 1, 100000);
      var k = D.randInt(r, 0, n - 1);
      return { base: base, values: values, seed: seed, k: k };
    },
    input: {
      hint: T('Örnek: base=1000 seed=3 k=4 10 20 30 40 50 60 70 80 90 100  (base/seed isteğe bağlı, varsayılan base=1000 seed=1)',
              'Example: base=1000 seed=3 k=4 10 20 30 40 50 60 70 80 90 100  (base/seed are optional, default base=1000 seed=1)'),
      parse: function (text) {
        var base = null, seed = null, k = null, values = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m;
          if ((m = /^base[=:](\d+)$/i.exec(tok))) { base = parseInt(m[1], 10); return; }
          if ((m = /^seed[=:](\d+)$/i.exec(tok))) { seed = parseInt(m[1], 10); return; }
          if ((m = /^k[=:](\d+)$/i.exec(tok))) { k = parseInt(m[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, base=N, seed=N ya da k=N yazın.', '"' + tok + '" is not understood: write a number, base=N, seed=N or k=N.');
          values.push(parseInt(tok, 10));
        });
        if (base === null) base = 1000;
        if (seed === null) seed = 1;
        if (!values.length) throw T('En az bir değer yazın.', 'Write at least one value.');
        if (values.length > 30) throw T('En çok 30 değer.', 'At most 30 values.');
        if (k === null) k = 0;
        if (k < 0 || k >= values.length) throw T('k, 0 ile ' + (values.length - 1) + ' arasında olmalı.', 'k must be between 0 and ' + (values.length - 1) + '.');
        return { base: base, values: values, seed: seed, k: k };
      },
      format: function (d) { return 'base=' + d.base + ' seed=' + d.seed + ' k=' + d.k + ' ' + d.values.join(' '); },
      bad: ['', 'base=1000 seed=1 k=99 10 20 30', 'base=x seed=1 k=0 10 20', '10 20 x 30', '5.5 8 13'],
      tokens: function (d) { return d.values.map(String); }
    },
    build: function (S, d) {
      var base = d.base, values = d.values, n = values.length, k = d.k;
      var W = 54, H = 44, GAP = 8, X0 = 44, Y0 = 90;
      values.forEach(function (v, i) {
        var col = i % ROW, row = Math.floor(i / ROW);
        var x = X0 + col * (W + GAP), y = Y0 + row * (H + 34);
        S.box('a' + i, { x: x, y: y, w: W, h: H, text: String(v), below: String(base + 4 * i), above: String(i), size: 15 });
      });
      S.label('arrlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: T('dizi =', 'arr ='), anchor: 'end', size: 15, bold: true });
      var arrRows = Math.ceil(n / ROW);
      var addrs = scatterAddresses(d.seed, n);
      var WL = 46, HL = 40, GAPX = 50, GAPY = 66, XL0 = 60, YL0 = Y0 + arrRows * (H + 34) + 50;
      values.forEach(function (v, i) {
        var col = i % ROWL, row = Math.floor(i / ROWL);
        var x = XL0 + col * (WL + GAPX), y = YL0 + row * (HL + GAPY);
        S.node('n' + i, { x: x, y: y, value: String(v), below: String(addrs[i]) });
      });
      for (var e = 0; e < n - 1; e++) S.arrow('e' + e, { from: 'n' + e, to: 'n' + (e + 1), kind: 'next' });
      S.step(T('Aynı ' + n + ' değer iki şekilde yerleşti: üstte bitişik bir dizi (array), altta dağınık bağlı liste (linked list) düğümleri. `k = ' + k + '`. elemana erişmeyi karşılaştıracağız.',
               'The same ' + n + ' values are laid out two ways: a contiguous array on top, scattered linked-list nodes below. `k = ' + k + '`. We will compare reaching element ' + k + '.'),
             { c: [1, 4], java: [1, 4] });
      var arrAddr = base + 4 * k;
      S.at(k);
      S.set('a' + k, { style: 'new' });
      S.label('acalc', { x: 700, y: 40, text: 'arr[' + k + ']: ' + base + ' + ' + k + '×4 = ' + arrAddr, size: 14, mono: true, bold: true });
      S.step(T('Dizide erişim (array access): `arr[' + k + ']`\'e ulaşmak TEK bir hesap — taban adres (base) + indis × eleman boyu = ' + arrAddr + '. **1 adım, O(1)**.',
               'Array access: reaching `arr[' + k + ']` is a SINGLE calculation — base address + index × element size = ' + arrAddr + '. **1 step, O(1)**.'),
             { c: [5, 6], java: [5, 6] });
      S.set('n0', { style: 'hl' });
      if (k === 0) {
        S.step(T('Bağlı listede erişim (linked-list access): `k = 0`, zaten baştayız (head) — **0 sıçrama (hop)** gerekiyor.',
                 'Linked-list access: `k = 0`, we are already at the head — **0 hops** needed.'), { c: [16], java: [16] });
      } else {
        var grouped = 0, j;
        for (j = 1; j <= k; j++) {
          var detailed = j <= DETAIL_HOPS || j === k;
          if (j === k && grouped > 0) {
            S.step(T(grouped + ' sıçrama daha aynı şekilde `next`\'i izleyerek geçildi.',
                     grouped + ' more hops went by the same way, following `next`.'), { c: [17, 18], java: [17, 18] });
          }
          S.at(j);
          S.set('n' + (j - 1), { style: 'dim' });
          S.set('n' + j, { style: 'hl' });
          if (detailed) {
            S.step(T(j + '. sıçrama: `p = p->next` ile düğüm ' + (j - 1) + '\'den düğüm ' + j + '\'e geçiyoruz.',
                     'Hop ' + j + ': `p = p->next` moves us from node ' + (j - 1) + ' to node ' + j + '.'), { c: [17, 18], java: [17, 18] });
          } else {
            grouped++;
          }
        }
      }
      S.at(null);
      S.result = { arrayAddress: arrAddr, hops: k };
      S.step(T('Sonuç: aynı `k = ' + k + '` için dizi 1 adımda ulaştı (adres ' + arrAddr + '); bağlı liste baştan başlayıp `next`\'i ' + k + ' kez izleyerek ulaştı: **' + k + ' sıçrama, O(n)**. Aynı veriler, TAM TERS erişim maliyeti.',
               'Result: for the same `k = ' + k + '`, the array reached it in 1 step (address ' + arrAddr + '); the linked list started at the front and followed `next` ' + k + ' times: **' + k + ' hops, O(n)**. Same data, OPPOSITE access cost.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
