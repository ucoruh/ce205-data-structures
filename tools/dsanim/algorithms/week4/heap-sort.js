/* Week 4 — heap sort: build-heap once, then repeatedly move the root to the sorted tail and sift-down.
 * Tree (circle+arrow) and array are kept in sync; a sorted cell keeps its box (dimmed) but leaves the tree.
 * Data picks a min-heap or a max-heap: {kind: 'min'|'max', values: [...]} — 'max' sorts ascending (the classic
 * heap sort), 'min' sorts descending (the mirror image). */
(function (D) {
  'use strict';
  var T = D.T;

  function less(kind, a, b) { return kind === 'max' ? a > b : a < b; }

  function makeCode(d) {
    var min = d.kind !== 'max', op = min ? '<' : '>', name = min ? 'min' : 'max', dir = min ? 'descending' : 'ascending';
    var c = [
      '/* ' + name + '-heap sift-down (see build-heap.js) */',
      'void sift_down(int arr[], int n, int i) {',
      '    while (1) {',
      '        int left = 2 * i + 1, right = 2 * i + 2, best = i;',
      '        if (left < n && arr[left] ' + op + ' arr[best]) best = left;',
      '        if (right < n && arr[right] ' + op + ' arr[best]) best = right;',
      '        if (best == i) break;',
      '        int tmp = arr[i]; arr[i] = arr[best]; arr[best] = tmp;',
      '        i = best;',
      '    }',
      '}',
      '',
      '/* ' + dir + ' order */',
      'void heap_sort(int arr[], int n) {',
      '    for (int i = n / 2 - 1; i >= 0; i--)',
      '        sift_down(arr, n, i);           /* build-heap, O(n) */',
      '',
      '    for (int heap_size = n; heap_size > 1; heap_size--) {',
      '        int tmp = arr[0];                     /* move the current best to the sorted tail */',
      '        arr[0] = arr[heap_size - 1];',
      '        arr[heap_size - 1] = tmp;',
      '        sift_down(arr, heap_size - 1, 0);    /* restore the heap on the shrunk region */',
      '    }',
      '}'
    ];
    var j = [
      '// ' + name + '-heap sift-down (see build-heap.js)',
      'void siftDown(int[] arr, int n, int i) {',
      '    while (true) {',
      '        int left = 2 * i + 1, right = 2 * i + 2, best = i;',
      '        if (left < n && arr[left] ' + op + ' arr[best]) best = left;',
      '        if (right < n && arr[right] ' + op + ' arr[best]) best = right;',
      '        if (best == i) break;',
      '        int tmp = arr[i]; arr[i] = arr[best]; arr[best] = tmp;',
      '        i = best;',
      '    }',
      '}',
      '',
      '// ' + dir + ' order',
      'void heapSort(int[] arr, int n) {',
      '    for (int i = n / 2 - 1; i >= 0; i--)',
      '        siftDown(arr, n, i);             // build-heap, O(n)',
      '',
      '    for (int heapSize = n; heapSize > 1; heapSize--) {',
      '        int tmp = arr[0];                     // move the current best to the sorted tail',
      '        arr[0] = arr[heapSize - 1];',
      '        arr[heapSize - 1] = tmp;',
      '        siftDown(arr, heapSize - 1, 0);      // restore the heap on the shrunk region',
      '    }',
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
    id: 'heap-sort',
    title: T('Öbek sıralaması (heap sort)', 'Heap sort'),
    code: makeCode,
    presets: [
      { id: 'normal', level: 'normal', name: T('Max-öbek ile artan sıralama, 10 değer', 'Ascending sort with a max-heap, 10 values'),
        data: { kind: 'max', values: [16, 14, 10, 8, 7, 9, 3, 2, 4, 1] } },
      { id: 'descending', level: 'hard', name: T('Min-öbek ile azalan sıralama, 14 değer', 'Descending sort with a min-heap, 14 values'),
        data: { kind: 'min', values: [40, 11, 27, 8, 33, 16, 45, 2, 19, 37, 24, 6, 50, 29] } },
      { id: 'already-sorted', level: 'edge', name: T('Zaten artan sırada: 12 değer', 'Already ascending: 12 values'),
        data: { kind: 'max', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı (azalan) girdi: 12 değer', 'Reverse (descending) input: 12 values'),
        data: { kind: 'max', values: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] } },
      { id: 'all-equal', level: 'edge', name: T('Hepsi eşit: değer 8, on kez', 'All equal: value 8, ten times'),
        data: { kind: 'max', values: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8] } },
      { id: 'single', level: 'edge', name: T('Tek değer', 'A single value'), small: true,
        data: { kind: 'min', values: [42] } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler', 'Extreme values'),
        data: { kind: 'max', values: [2147483647, -2147483648, 0, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of input values — every example must have at least 10. */
    size: function (d) { return d.values.length; },
    /** Independent computation: the language's own sort, in the direction this kind implies. */
    reference: function (d) {
      var dir = d.kind === 'max' ? 1 : -1;
      return { sorted: d.values.slice().sort(function (a, b) { return dir * (a - b); }) };
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
      hint: T('Örnek: kind=max 16 14 10 8 7 9 3 2 4 1', 'Example: kind=max 16 14 10 8 7 9 3 2 4 1'),
      parse: function (text) {
        var kind = 'max', values = [];
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
      bad: ['', 'kind=mid 5 8', '5 x 7', '3.5 8', 'kind=max']
    },
    build: function (S, d) {
      var kind = d.kind, arr = d.values.slice(), n = arr.length;
      var CX = 400, TOPY = 50, LEVELY = 78, TOTALW = Math.max(360, 60 * n);
      var pos = heapPositions(n, CX, TOPY, LEVELY, TOTALW);
      var ARRY = TOPY + (Math.floor(Math.log(n) / Math.LN2) + 1) * LEVELY + 70, DX = 56;
      var X0 = CX - (n - 1) * DX / 2;
      var size = n;

      function sync(hi) {
        for (var i = 0; i < n; i++) {
          var nid = 'n' + i, bid = 'b' + i, eid = 'e' + i;
          var inHeap = i < size, st = inHeap ? (hi && hi.indexOf(i) >= 0 ? 'hl' : 'normal') : 'dim';
          if (S.has(bid)) S.set(bid, { text: String(arr[i]), style: st }); else S.box(bid, { x: X0 + i * DX, y: ARRY, w: DX - 6, h: 40, text: String(arr[i]), style: st, size: 15, above: String(i) });
          if (inHeap) {
            if (S.has(nid)) S.set(nid, { text: String(arr[i]), style: st }); else S.circle(nid, { x: pos[i][0], y: pos[i][1], text: String(arr[i]), style: st, r: 22 });
            if (i > 0 && !S.has(eid)) S.arrow(eid, { from: 'n' + Math.floor((i - 1) / 2), to: nid, kind: 'center' });
          } else {
            if (S.has(nid)) S.remove(nid);
            if (S.has(eid)) S.remove(eid);
          }
        }
        if (S.has('heapBrace')) S.remove('heapBrace');
        if (S.has('sortedBrace')) S.remove('sortedBrace');
        if (size > 0) S.brace('heapBrace', { from: 'b0', to: 'b' + (size - 1), text: T('öbek', 'heap'), side: 'bottom', dist: 14 });
        if (size < n) S.brace('sortedBrace', { from: 'b' + size, to: 'b' + (n - 1), text: T('sıralı', 'sorted'), side: 'bottom', dist: 14 });
      }
      function cmp(text, style) { if (text === null) { if (S.has('cmp')) S.remove('cmp'); return; } if (S.has('cmp')) S.set('cmp', { text: text, style: style }); else S.label('cmp', { x: X0 + n * DX + 4, y: ARRY + 5, text: text, anchor: 'start', size: 15, mono: true, bold: true, style: style }); }
      var LT = kind === 'max' ? '>' : '<', GE = kind === 'max' ? '≤' : '≥';

      function siftDownFrom(i0, limit) {
        var i = i0;
        while (true) {
          var l = 2 * i + 1, r = 2 * i + 2, best = i;
          if (l < limit && less(kind, arr[l], arr[best])) best = l;
          if (r < limit && less(kind, arr[r], arr[best])) best = r;
          if (best === i) break;
          cmp(arr[best] + ' ' + LT + ' ' + arr[i] + ' → swap', 'hl');
          var tmp = arr[i]; arr[i] = arr[best]; arr[best] = tmp;
          sync([i, best]);
          S.step(T('Sifting-down: ' + i + ' ve ' + best + '. indisler yer değiştirir.', 'Sifting down: swap indices ' + i + ' and ' + best + '.'),
                 { c: [6, 8], java: [6, 8] });
          cmp(null);
          i = best;
        }
      }

      sync();
      S.label('arrlbl', { x: X0 - 14, y: ARRY + 5, text: 'A =', anchor: 'end', size: 15, mono: true, style: 'dim' });
      var maxLevel = n > 0 ? Math.floor(Math.log(n) / Math.LN2) : 0;
      for (var lv = 0; lv <= maxLevel; lv++) {
        var firstAt = Math.pow(2, lv) - 1;
        if (firstAt < n) S.label('dlvl' + lv, { x: pos[firstAt][0] - 46, y: pos[firstAt][1] + 5, text: 'd=' + lv, anchor: 'end', size: 14, mono: true, style: 'dim' });
      }
      S.step(T('Dizi henüz sıralı değil. 1. adım: dizinin tamamını ' + (kind === 'min' ? 'min' : 'max') + '-öbeğe çevir (build-heap, O(n)).',
               'The array is not sorted yet. Step 1: turn the whole array into a ' + (kind === 'min' ? 'min' : 'max') + '-heap (build-heap, O(n)).'));
      for (var i0 = Math.floor(n / 2) - 1; i0 >= 0; i0--) siftDownFrom(i0, n);
      sync();
      S.step(T('Öbek kuruldu: [' + arr.join(', ') + ']. 2. adım: kökü (her zaman en iyi kalan değer) sıralı bölgenin başına taşı, öbeği küçült, sift-down ile onar — ve tekrarla.',
               'The heap is built: [' + arr.join(', ') + ']. Step 2: move the root (always the best value left) to the front of the sorted region, shrink the heap, repair with sift-down — and repeat.'),
             { c: [16, 17, 18, 19, 20, 21], java: [16, 17, 18, 19, 20, 21] });

      var round = 0;
      while (size > 1) {
        round++;
        var tmp = arr[0]; arr[0] = arr[size - 1]; arr[size - 1] = tmp;
        var detailed = round <= 2;
        if (detailed) {
          sync([0, size - 1]);
          S.step(T('Kök (' + arr[size - 1] + ') sıralı bölgenin başlangıcıyla yer değiştirir.',
                   'The root (' + arr[size - 1] + ') swaps with the start of the sorted region.'),
                 { c: [18, 19, 20], java: [18, 19, 20] });
        }
        size--;
        if (detailed) {
          sync();
          S.step(T(arr[size] + ' artık sıralı kabul edilir ve öbekten çıkar (soluk kutu); öbek sınırı ' + size + '\'e küçülür.',
                   arr[size] + ' now counts as sorted and leaves the heap (dim box); the heap boundary shrinks to ' + size + '.'),
                 { c: [17], java: [17] });
          siftDownFrom(0, size);
        } else {
          siftDownFrom(0, size);
          sync();
          S.step(T('Kök sıralı bölgeye taşınır, sift-down öbeği onarır. Kalan öbek boyutu: ' + size + '.',
                   'The root moves into the sorted region, sift-down repairs the heap. Remaining heap size: ' + size + '.'),
                 { c: [18, 19, 20, 21], java: [18, 19, 20, 21] });
        }
      }
      sync();
      S.result = { sorted: arr.slice() };
      S.step(T('Bitti: [' + arr.join(', ') + '] — tamamen sıralı. Öbek sıralaması yerinde (in-place) çalışır ve O(n log n) sürer, ama kararlı (stable) DEĞİLDİR.',
               'Done: [' + arr.join(', ') + '] — fully sorted. Heap sort runs in place and takes O(n log n) time, but it is NOT stable.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
