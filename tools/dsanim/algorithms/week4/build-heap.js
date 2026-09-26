/* Week 4 — bottom-up build-heap (Floyd's algorithm), O(n). Tree (circle+arrow) and array are kept in sync.
 * Data may pick a min-heap or a max-heap: {kind: 'min'|'max', values: [...]} — the values start in arbitrary order. */
(function (D) {
  'use strict';
  var T = D.T;

  function less(kind, a, b) { return kind === 'max' ? a > b : a < b; }

  function makeCode(d) {
    var min = d.kind !== 'max', op = min ? '<' : '>', name = min ? 'min' : 'max';
    var c = [
      '/* ' + name + '-heap sift-down: swap with the better child while a child is better */',
      'void sift_down(int arr[], int n, int i) {',
      '    while (1) {',
      '        int left = 2 * i + 1;',
      '        int right = 2 * i + 2;',
      '        int best = i;',
      '',
      '        if (left < n && arr[left] ' + op + ' arr[best])',
      '            best = left;',
      '        if (right < n && arr[right] ' + op + ' arr[best])',
      '            best = right;',
      '        if (best == i)',
      '            break;',
      '',
      '        int tmp = arr[i];',
      '        arr[i] = arr[best];',
      '        arr[best] = tmp;',
      '        i = best;',
      '    }',
      '}',
      '',
      '/* bottom-up build: only the n/2 internal nodes need sifting, so this is O(n) */',
      'void build_heap(int arr[], int n) {',
      '    for (int i = n / 2 - 1; i >= 0; i--)',
      '        sift_down(arr, n, i);',
      '}'
    ];
    var j = [
      '// ' + name + '-heap sift-down: swap with the better child while a child is better',
      'void siftDown(int[] arr, int n, int i) {',
      '    while (true) {',
      '        int left = 2 * i + 1;',
      '        int right = 2 * i + 2;',
      '        int best = i;',
      '',
      '        if (left < n && arr[left] ' + op + ' arr[best])',
      '            best = left;',
      '        if (right < n && arr[right] ' + op + ' arr[best])',
      '            best = right;',
      '        if (best == i)',
      '            break;',
      '',
      '        int tmp = arr[i];',
      '        arr[i] = arr[best];',
      '        arr[best] = tmp;',
      '        i = best;',
      '    }',
      '}',
      '',
      '// bottom-up build: only the n/2 internal nodes need sifting, so this is O(n)',
      'void buildHeap(int[] arr, int n) {',
      '    for (int i = n / 2 - 1; i >= 0; i--)',
      '        siftDown(arr, n, i);',
      '}'
    ];
    return { c: c, java: j };
  }

  function heapPositions(n, cx, topY, levelY, totalW) {
    var pos = {}, i, level, first, count, width;
    for (i = 0; i < n; i++) {
      level = Math.floor(Math.log(i + 1) / Math.LN2);
      first = Math.pow(2, level) - 1;
      count = Math.pow(2, level);
      width = totalW / count;
      pos[i] = [cx - totalW / 2 + width * (i - first + 0.5), topY + level * levelY];
    }
    return pos;
  }

  D.define({
    id: 'build-heap',
    title: T('Alttan yukarı öbek kurma (build-heap), O(n)', 'Bottom-up build-heap, O(n)'),
    code: makeCode,
    presets: [
      { id: 'normal', level: 'normal', name: T('Max-öbek: 10 değer rastgele sırada', 'Max-heap: 10 values in arbitrary order'),
        data: { kind: 'max', values: [4, 1, 3, 2, 16, 9, 10, 14, 8, 7] } },
      { id: 'reverse', level: 'hard', name: T('Min-öbek: 14 değer TERS sırada (en çok sifting)', 'Min-heap: 14 values in REVERSE order (maximum sifting)'),
        data: { kind: 'min', values: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] } },
      { id: 'already-heap', level: 'edge', name: T('Girdi zaten geçerli bir max-öbek: çoğu düğümde sifting gerekmez', 'Input is already a valid max-heap: most nodes need no sifting'),
        data: { kind: 'max', values: [30, 25, 22, 18, 20, 9, 12, 1, 3, 7, 15] } },
      { id: 'all-equal', level: 'edge', name: T('Hepsi eşit: değer 6, on kez', 'All equal: value 6, ten times'),
        data: { kind: 'min', values: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6] } },
      { id: 'single', level: 'edge', name: T('Tek değer', 'A single value'), small: true,
        data: { kind: 'max', values: [42] } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler', 'Extreme values'),
        data: { kind: 'min', values: [0, 2147483647, -2147483648, 5, -5, 1000000, -1000000, 2147483646, -2147483647, 1, -1] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of input values — every example must have at least 10. */
    size: function (d) { return d.values.length; },
    /** Independent check: the finished heap's root is always the global best, and the multiset never changes. */
    reference: function (d) {
      var vs = d.values;
      var best = vs[0];
      for (var i = 1; i < vs.length; i++) if ((d.kind === 'max' ? vs[i] > best : vs[i] < best)) best = vs[i];
      return { n: vs.length, best: best, multiset: vs.slice().sort(function (a, b) { return a - b; }) };
    },
    random: function (level, r) {
      var kind = r() < 0.5 ? 'min' : 'max';
      var n = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level];
      var lo = level === 'extreme' ? -1000 : 1, hi = level === 'extreme' ? 1000 : 99;
      var values = [];
      for (var i = 0; i < n; i++) values.push(D.randInt(r, lo, hi));
      return { kind: kind, values: values };
    },
    input: {
      hint: T('Örnek: kind=max 4 1 3 2 16 9 10 14 8 7', 'Example: kind=max 4 1 3 2 16 9 10 14 8 7'),
      parse: function (text) {
        var kind = 'min', values = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^kind[=:](min|max)$/i.exec(tok);
          if (m) { kind = m[1].toLowerCase(); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı ya da kind=min/max yazın.', '"' + tok + '" is not understood: write a number or kind=min/max.');
          values.push(parseInt(tok, 10));
        });
        if (!values.length) throw T('En az bir değer yazın.', 'Write at least one value.');
        if (values.length > 30) throw T('En çok 30 değer.', 'At most 30 values.');
        return { kind: kind, values: values };
      },
      format: function (d) { return 'kind=' + d.kind + '  ' + d.values.join(' '); },
      tokens: function (d) { return d.values.map(String); },
      bad: ['', 'kind=mid 5 8', '5 x 7', '3.5 8', 'kind=min']
    },
    build: function (S, d) {
      var kind = d.kind, arr = d.values.slice(), n = arr.length;
      var CX = 400, TOPY = 50, LEVELY = 78, TOTALW = Math.max(360, 60 * n);
      var pos = heapPositions(n, CX, TOPY, LEVELY, TOTALW);
      var ARRY = TOPY + (Math.floor(Math.log(n) / Math.LN2) + 1) * LEVELY + 70, DX = 56;
      var X0 = CX - (n - 1) * DX / 2;

      function sync(hi) {
        for (var i = 0; i < n; i++) {
          var nid = 'n' + i, bid = 'b' + i, eid = 'e' + i;
          var st = hi && hi.indexOf(i) >= 0 ? 'hl' : 'normal';
          if (S.has(nid)) { S.set(nid, { text: String(arr[i]), style: st }); S.set(bid, { text: String(arr[i]), style: st }); }
          else {
            S.circle(nid, { x: pos[i][0], y: pos[i][1], text: String(arr[i]), style: st, r: 22 });
            S.box(bid, { x: X0 + i * DX, y: ARRY, w: DX - 6, h: 40, text: String(arr[i]), style: st, size: 15, above: String(i) });
          }
          if (i > 0 && !S.has(eid)) S.arrow(eid, { from: 'n' + Math.floor((i - 1) / 2), to: nid, kind: 'center' });
        }
      }
      function cmp(text, style) { if (text === null) { if (S.has('cmp')) S.remove('cmp'); return; } if (S.has('cmp')) S.set('cmp', { text: text, style: style }); else S.label('cmp', { x: X0 + n * DX + 4, y: ARRY + 5, text: text, anchor: 'start', size: 15, mono: true, bold: true, style: style }); }
      var LT = kind === 'max' ? '>' : '<', GE = kind === 'max' ? '≤' : '≥';

      sync();
      S.label('arrlbl', { x: X0 - 14, y: ARRY + 5, text: 'heap[] =', anchor: 'end', size: 15, mono: true, style: 'dim' });
      var maxLevel = n > 0 ? Math.floor(Math.log(n) / Math.LN2) : 0;
      for (var lv = 0; lv <= maxLevel; lv++) {
        var firstAt = Math.pow(2, lv) - 1;
        if (firstAt < n) S.label('dlvl' + lv, { x: pos[firstAt][0] - 46, y: pos[firstAt][1] + 5, text: 'd=' + lv, anchor: 'end', size: 14, mono: true, style: 'dim' });
      }
      var firstLeaf = Math.floor(n / 2);
      if (firstLeaf < n) S.brace('leaves', { from: 'b' + firstLeaf, to: 'b' + (n - 1), text: T('yapraklar — zaten öbek', 'leaves — already heaps'), side: 'bottom', dist: 14 });
      S.step(T('Başlangıç dizisi rastgele sıralanmış, henüz bir ' + (kind === 'min' ? 'min' : 'max') + '-öbek değil. Fikir: yaprakların zaten tek başına birer "öbek" olduğunu kullanıp, iç düğümleri alttan yukarıya sift-down ile düzelt.',
               'The starting array is in arbitrary order, not yet a ' + (kind === 'min' ? 'min' : 'max') + '-heap. Idea: leaves are already trivially heaps by themselves, so fix the internal nodes bottom-up with sift-down.'),
             { c: [23, 24], java: [23, 24] });
      if (S.has('leaves')) S.remove('leaves');

      for (var i0 = Math.floor(n / 2) - 1; i0 >= 0; i0--) {
        var l0 = 2 * i0 + 1, r0 = 2 * i0 + 2, best0 = i0;
        if (l0 < n && less(kind, arr[l0], arr[best0])) best0 = l0;
        if (r0 < n && less(kind, arr[r0], arr[best0])) best0 = r0;
        var hi0 = [i0]; if (l0 < n) hi0.push(l0); if (r0 < n) hi0.push(r0);
        sync(hi0);
        if (best0 === i0) {
          cmp('stop: ' + arr[i0] + ' ' + GE + ' children', 'dim');
          S.step(T('İndis ' + i0 + ' (' + arr[i0] + ') için sifting başlar: çocuklarla karşılaştır — zaten en iyi o, yer değiştirme gerekmiyor.',
                   'Sifting begins at index ' + i0 + ' (' + arr[i0] + '): compare with its children — it is already the best, no swap needed.'),
                 { c: [7, 8, 9, 10, 11, 12], java: [7, 8, 9, 10, 11, 12] });
          cmp(null);
          continue;
        }
        cmp(arr[best0] + ' ' + LT + ' ' + arr[i0] + ' → swap', 'hl');
        S.step(T('İndis ' + i0 + ' (' + arr[i0] + ') için sifting başlar: çocuklarla karşılaştır — ' + best0 + '. indisteki ' + arr[best0] + ' daha iyi.',
                 'Sifting begins at index ' + i0 + ' (' + arr[i0] + '): compare with its children — ' + arr[best0] + ' at index ' + best0 + ' is better.'),
               { c: [7, 8, 9, 10, 11, 12], java: [7, 8, 9, 10, 11, 12] });
        var cur = i0;
        while (best0 !== cur) {
          var tmp = arr[cur]; arr[cur] = arr[best0]; arr[best0] = tmp;
          sync([cur, best0]);
          S.step(T(cur + ' ve ' + best0 + '. indisler yer değiştirir (swap).', 'Swap indices ' + cur + ' and ' + best0 + '.'),
                 { c: [14, 15, 16], java: [14, 15, 16] });
          cmp(null);
          cur = best0;
          var l1 = 2 * cur + 1, r1 = 2 * cur + 2; best0 = cur;
          if (l1 < n && less(kind, arr[l1], arr[best0])) best0 = l1;
          if (r1 < n && less(kind, arr[r1], arr[best0])) best0 = r1;
        }
      }
      sync();
      var multiset = arr.slice().sort(function (a, b) { return a - b; });
      S.result = { n: arr.length, best: arr[0], multiset: multiset };
      S.step(T('Bitti: [' + arr.join(', ') + '] artık geçerli bir ' + (kind === 'min' ? 'min' : 'max') + '-öbek. Her çağrının maliyeti farklı olsa da toplam iş O(n)\'dir (O(n log n) DEĞİL) — alt seviyelerdeki çok sayıda düğüm çok az sifting yapar.',
               'Done: [' + arr.join(', ') + '] is now a valid ' + (kind === 'min' ? 'min' : 'max') + '-heap. Although each call costs differently, the TOTAL work is O(n) (NOT O(n log n)) — the many nodes near the bottom need very little sifting.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
