/* Week 4 — building a Huffman tree: a min-heap of trees, repeatedly merging the two lowest-frequency roots.
 * Data: {symbols: [[char, freq], ...]}, at least 10 symbols. Rendered as a tree (circle + arrow, edges labelled
 * 0/1); the forest is laid out left to right in priority order and re-flows after every merge. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    '/* ordering key: smaller frequency first; ties broken by a stable tie_id */',
    'static int is_less(Node *a, Node *b) {',
    '    if (a->freq != b->freq) return a->freq < b->freq;',
    '    return a->tie_id < b->tie_id;',
    '}',
    '',
    '/* repeatedly merge the two lowest-priority roots until one remains */',
    'int merge_id = 256;',
    'while (heap_size > 1) {',
    '    Node *a = heap_pop();          /* smallest */',
    '    Node *b = heap_pop();          /* second smallest */',
    '    Node *parent = new_internal(a, b, merge_id++);',
    '    heap_push(parent);',
    '}',
    'Node *root = heap_pop();           /* the Huffman tree */'
  ];
  var J = [
    '// ordering key: smaller frequency first; ties broken by a stable tieId',
    'static boolean isLess(Node a, Node b) {',
    '    if (a.freq != b.freq) return a.freq < b.freq;',
    '    return a.tieId < b.tieId;',
    '}',
    '',
    '// repeatedly merge the two lowest-priority roots until one remains',
    'int mergeId = 256;',
    'while (heapSize > 1) {',
    '    Node a = heapPop();            // smallest',
    '    Node b = heapPop();            // second smallest',
    '    Node parent = Node.internal(a, b, mergeId++);',
    '    heapPush(parent);',
    '}',
    'Node root = heapPop();             // the Huffman tree'
  ];

  function priorityX(ids, cx, dx) {
    var n = ids.length, out = {};
    if (!n) return out;
    var total = (n - 1) * dx;
    ids.forEach(function (id, idx) { out[id] = cx - total / 2 + idx * dx; });
    return out;
  }

  D.define({
    id: 'huffman-build',
    title: T('Huffman ağacı kurma', 'Building the Huffman tree'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 sembol: Türkçe metin benzeri sıklıklar', '10 symbols: English-letter-like frequencies'),
        data: { symbols: [['E', 12], ['T', 9], ['A', 8], ['O', 7], ['I', 6], ['N', 6], ['S', 5], ['H', 4], ['R', 4], ['D', 3]] } },
      { id: 'many-ties', level: 'hard', name: T('14 sembol, çok sayıda eşit sıklık (tie-break önemli)', '14 symbols, many equal frequencies (tie-breaking matters)'),
        data: { symbols: [['A', 3], ['B', 3], ['C', 3], ['D', 3], ['E', 2], ['F', 2], ['G', 2], ['H', 2], ['I', 1], ['J', 1], ['K', 1], ['L', 1], ['M', 1], ['N', 1]] } },
      { id: 'two-symbols', level: 'edge', name: T('En küçük anlamlı örnek: 2 sembol', 'The smallest meaningful example: 2 symbols'), small: true,
        data: { symbols: [['A', 5], ['B', 3]] } },
      { id: 'all-equal', level: 'edge', name: T('Hepsi eşit sıklık: 10 sembol, hepsi 1', 'All equal frequency: 10 symbols, all 1'),
        data: { symbols: [['A', 1], ['B', 1], ['C', 1], ['D', 1], ['E', 1], ['F', 1], ['G', 1], ['H', 1], ['I', 1], ['J', 1]] } },
      { id: 'skewed', level: 'edge', name: T('Aşırı çarpık: bir sembol baskın, diğer 9\'u nadir', 'Extremely skewed: one dominant symbol, 9 rare ones'),
        data: { symbols: [['A', 1000], ['B', 1], ['C', 1], ['D', 1], ['E', 1], ['F', 1], ['G', 1], ['H', 1], ['I', 1], ['J', 1]] } },
      { id: 'many-symbols', level: 'edge', name: T('16 sembol: daha büyük bir ağaç', '16 symbols: a bigger tree'),
        data: { symbols: [['A', 24], ['B', 3], ['C', 8], ['D', 12], ['E', 40], ['F', 6], ['G', 5], ['H', 18], ['I', 20], ['J', 1], ['K', 2], ['L', 9], ['M', 7], ['N', 22], ['O', 15], ['P', 4]] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of distinct symbols — every example must have at least 10 (the smallest meaningful case is small: true). */
    size: function (d) { return d.symbols.length; },
    /** Independent computation: repeatedly re-sort the plain list of frequencies and merge the two smallest --
     * a different technique (full re-sort vs. an incremental heap) that must reach the same total merge cost,
     * because any tie-breaking of the greedy "merge the two smallest" rule yields an optimal (equal-cost) tree. */
    reference: function (d) {
      var freqs = d.symbols.map(function (s) { return s[1]; });
      var totalCost = 0;
      while (freqs.length > 1) {
        freqs.sort(function (a, b) { return a - b; });
        var a = freqs.shift(), b = freqs.shift(), sum = a + b;
        totalCost += sum;
        freqs.push(sum);
      }
      return { n: d.symbols.length, totalCost: totalCost };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 11, hard: 13, extreme: 16 }[level];
      var hi = level === 'extreme' ? 200 : 30;
      var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      for (var s = letters.length - 1; s > 0; s--) { var jx = Math.floor(r() * (s + 1)); var tmp = letters[s]; letters[s] = letters[jx]; letters[jx] = tmp; }
      var symbols = [];
      for (var i = 0; i < n; i++) symbols.push([letters[i], D.randInt(r, 1, hi)]);
      return { symbols: symbols };
    },
    input: {
      hint: T('Örnek: A:12 T:9 A:8 O:7 I:6 N:6 S:5 H:4 R:4 D:3  (harf:sıklık)', 'Example: E:12 T:9 A:8 O:7 I:6 N:6 S:5 H:4 R:4 D:3  (letter:frequency)'),
      parse: function (text) {
        var symbols = [], seen = {};
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^([A-Za-z0-9])[:=](\d+)$/.exec(tok);
          if (!m) throw T('"' + tok + '" anlaşılmadı: harf:sıklık yazın (örn. A:5).', '"' + tok + '" is not understood: write letter:frequency (e.g. A:5).');
          var ch = m[1].toUpperCase(), freq = parseInt(m[2], 10);
          if (freq < 1) throw T('Sıklık en az 1 olmalı.', 'Frequency must be at least 1.');
          if (seen[ch]) throw T('"' + ch + '" birden fazla kez yazılmış.', '"' + ch + '" is written more than once.');
          seen[ch] = true;
          symbols.push([ch, freq]);
        });
        if (symbols.length < 2) throw T('En az 2 farklı sembol yazın.', 'Write at least 2 distinct symbols.');
        if (symbols.length > 26) throw T('En çok 26 sembol.', 'At most 26 symbols.');
        return { symbols: symbols };
      },
      format: function (d) { return d.symbols.map(function (s) { return s[0] + ':' + s[1]; }).join(' '); },
      bad: ['', 'A:5 A:3', 'A:0 B:2', 'AB:5 C:3', 'A:5']
    },
    build: function (S, d) {
      var syms = d.symbols, n0 = syms.length;
      var CX = 420, Y0 = 320, LEVELGAP = 82, DX = n0 > 1 ? Math.min(90, 820 / (n0 - 1)) : 0;
      var nodes = {}, forest = [];
      syms.forEach(function (s, idx) {
        var id = 'leaf' + idx;
        nodes[id] = { freq: s[1], tieId: idx, label: s[0] + ':' + s[1], y: Y0 };
        forest.push(id);
      });
      function order() { forest.sort(function (a, b) { return nodes[a].freq - nodes[b].freq || nodes[a].tieId - nodes[b].tieId; }); }
      order();
      // Leaves get a fixed x slot (by initial priority order) and NEVER move again. Every merged node is placed
      // at the midpoint of its two children (classic dendrogram layout) — this keeps every edge short and local,
      // instead of jumping a merged node to a far-away "priority slot" and crossing over unrelated subtrees.
      var xs = priorityX(forest, CX, DX);
      forest.forEach(function (id) { nodes[id].x = xs[id]; S.circle(id, { x: nodes[id].x, y: nodes[id].y, text: nodes[id].label, r: 24 }); });
      var freqList = syms.map(function (s) { return s[0] + ':' + s[1]; }).join(', ');
      S.step(T(n0 + ' sembolün sıklık tablosu: ' + freqList + '. Huffman kodlaması, sık geçenlere KISA, nadir geçenlere UZUN ikili kod vermek için bir min-öbek (min-heap) kullanarak ağaç kurar — öncelik en düşük sıklığa.',
               'Frequency table for ' + n0 + ' symbols: ' + freqList + '. Huffman coding builds a tree with a min-heap so that frequent symbols get SHORT binary codes and rare ones get LONG codes — priority to the lowest frequency.'),
             { c: [2, 3, 4], java: [2, 3, 4] });

      var mergeCounter = 0, totalCost = 0;
      while (forest.length > 1) {
        var a = forest[0], b = forest[1];
        mergeCounter++;
        var detailed = mergeCounter <= 2;
        if (detailed) {
          S.set(a, { style: 'hl' }); S.set(b, { style: 'hl' });
          S.step(T('En düşük öncelikli iki kök: ' + nodes[a].label + ' ve ' + nodes[b].label + '. İkisi de öbekten çıkarılır (pop).',
                   'The two lowest-priority roots: ' + nodes[a].label + ' and ' + nodes[b].label + '. Both are popped off the heap.'),
                 { c: [9, 10], java: [9, 10] });
        }
        forest = forest.slice(2);
        var sum = nodes[a].freq + nodes[b].freq;
        totalCost += sum;
        var mid = 'm' + mergeCounter;
        nodes[mid] = { freq: sum, tieId: 1000 + mergeCounter, label: String(sum), x: (nodes[a].x + nodes[b].x) / 2, y: Math.min(nodes[a].y, nodes[b].y) - LEVELGAP };
        S.circle(mid, { x: nodes[mid].x, y: nodes[mid].y, text: nodes[mid].label, r: 24 });
        forest.push(mid);
        order();
        S.arrow('e' + mid + '0', { from: mid, to: a, kind: 'center', text: '0' });
        S.arrow('e' + mid + '1', { from: mid, to: b, kind: 'center', text: '1' });
        S.set(a, { style: 'normal' }); S.set(b, { style: 'normal' });
        if (detailed) {
          S.step(T('Yeni bir ebeveyn düğüm oluşur (sıklık ' + sum + ' = ' + nodes[a].freq + ' + ' + nodes[b].freq + '); sol kenar "0", sağ kenar "1". Öncelik sırasındaki yerine geri konur.',
                   'A new parent node is created (frequency ' + sum + ' = ' + nodes[a].freq + ' + ' + nodes[b].freq + '); the left edge is "0", the right edge "1". It is reinserted at its priority-ordered spot.'),
                 { c: [11, 12, 13], java: [11, 12, 13] });
        } else {
          S.step(T('`merge`: iki en düşük öncelikli kök birleşir → yeni düğüm, sıklık ' + sum + '.',
                   '`merge`: the two lowest-priority roots combine → new node, frequency ' + sum + '.'),
                 { c: [9, 10, 11, 12, 13], java: [9, 10, 11, 12, 13] });
        }
      }
      S.result = { n: n0, totalCost: totalCost };
      S.step(T('Bitti: tek düğüm kaldı, bu Huffman ağacının kökü. Toplam birleştirme maliyeti (ağırlıklı yol uzunluğu) = ' + totalCost + '. Her kenar 0 ya da 1 — kökten bir yaprağa giden yol, o sembolün kodudur.',
               'Done: one node remains, the root of the Huffman tree. Total merge cost (weighted path length) = ' + totalCost + '. Every edge is 0 or 1 — the path from the root to a leaf is that symbol\'s code.'),
             { c: [14], java: [14] });
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
