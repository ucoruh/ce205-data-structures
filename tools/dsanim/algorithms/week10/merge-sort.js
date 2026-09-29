/* Week 10 -- Merge sort (top-down, recursive). Drawn as the recursion tree itself: each recursion DEPTH is
 * its own row. The top rows (going down) show the array being split in half, again and again, down to
 * single elements -- values never move during this phase, only the braces that mark each half get smaller.
 * The bottom rows (continuing down) show the merges happening, level by level, back up the tree: pairs of
 * already-sorted runs are merged into longer sorted runs, until the very last row is the whole array, fully
 * sorted. The first merge is shown comparison by comparison; later merges are shown as one lumped step
 * (before -> after) to keep the animation watchable. Comparisons and moves are counted on the right. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'void merge(int a[], int lo, int mid, int hi, int tmp[]) {',
    '    int i = lo, j = mid, k = lo;',
    '    while (i < mid && j < hi)',
    '        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];',
    '    while (i < mid) tmp[k++] = a[i++];    /* copy the left leftovers */',
    '    while (j < hi)  tmp[k++] = a[j++];    /* copy the right leftovers */',
    '    for (int x = lo; x < hi; x++) a[x] = tmp[x];',
    '}',
    '',
    'void merge_sort(int a[], int lo, int hi, int tmp[]) {',
    '    if (hi - lo <= 1) return;             /* base case: 0 or 1 elements */',
    '    int mid = lo + (hi - lo) / 2;',
    '    merge_sort(a, lo, mid, tmp);          /* sort the left half */',
    '    merge_sort(a, mid, hi, tmp);          /* sort the right half */',
    '    merge(a, lo, mid, hi, tmp);           /* merge the two sorted halves */',
    '}'
  ];
  var J = [
    'void merge(int[] a, int lo, int mid, int hi, int[] tmp) {',
    '    int i = lo, j = mid, k = lo;',
    '    while (i < mid && j < hi)',
    '        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];',
    '    while (i < mid) tmp[k++] = a[i++];    // copy the left leftovers',
    '    while (j < hi)  tmp[k++] = a[j++];    // copy the right leftovers',
    '    for (int x = lo; x < hi; x++) a[x] = tmp[x];',
    '}',
    '',
    'void mergeSort(int[] a, int lo, int hi, int[] tmp) {',
    '    if (hi - lo <= 1) return;             // base case: 0 or 1 elements',
    '    int mid = lo + (hi - lo) / 2;',
    '    mergeSort(a, lo, mid, tmp);           // sort the left half',
    '    mergeSort(a, mid, hi, tmp);           // sort the right half',
    '    merge(a, lo, mid, hi, tmp);           // merge the two sorted halves',
    '}'
  ];

  function buildTree(lo, hi, depth) {
    var node = { lo: lo, hi: hi, depth: depth };
    if (hi - lo > 1) {
      var mid = lo + Math.floor((hi - lo) / 2);
      node.left = buildTree(lo, mid, depth + 1);
      node.right = buildTree(mid, hi, depth + 1);
    }
    return node;
  }
  function segmentsAtDepth(node, targetDepth, out) {
    if (node.depth >= targetDepth || !node.left) { out.push([node.lo, node.hi]); return; }
    segmentsAtDepth(node.left, targetDepth, out);
    segmentsAtDepth(node.right, targetDepth, out);
  }
  /** Internal (splitting) nodes only, grouped by depth -- deepest first (the real post-order merge order). */
  function internalNodesByDepth(node, map) {
    if (!node.left) return;
    internalNodesByDepth(node.left, map);
    internalNodesByDepth(node.right, map);
    (map[node.depth] = map[node.depth] || []).push(node);
  }

  D.define({
    id: 'merge-sort',
    title: T('Birleştirmeli sıralama (merge sort, yukarıdan aşağı)', 'Merge sort (top-down)'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 rastgele değer', '10 unordered values'),
        data: { values: [38, 27, 43, 3, 9, 82, 10, 15, 31, 6] } },
      { id: 'hard', level: 'hard', name: T('14 değer, dengesiz bölünmeler', '14 values, uneven splits'),
        data: { values: [45, 2, 38, 9, 33, 14, 29, 6, 41, 18, 24, 11, 36, 20] } },
      { id: 'already-sorted', level: 'edge', name: T('Zaten sıralı: yine de tüm bölme ve birleştirmeler çalışır', 'Already sorted: every split and merge still runs'),
        data: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı', 'Reverse sorted'),
        data: { values: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] } },
      { id: 'duplicates', level: 'edge', name: T('Tekrarlı değerler: eşitlikte sol taraf önce yazılır (kararlı)', 'Duplicates: a tie writes the left side first (stable)'),
        data: { values: [5, 3, 5, 1, 3, 5, 1, 3, 5, 1] } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler: INT_MAX, INT_MIN, sıfır', 'Extreme values: INT_MAX, INT_MIN, zero'),
        data: { values: [0, 2147483647, -2147483648, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1] } },
      { id: 'single', level: 'edge', name: T('Tek değer: temel durum hemen döner', 'A single value: the base case returns immediately'), small: true,
        data: { values: [17] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.values.length; },
    reference: function (d) { return { sorted: d.values.slice().sort(function (a, b) { return a - b; }) }; },
    random: function (level, r) {
      var n = { easy: 10, normal: 11, hard: 14, extreme: 16 }[level];
      var lo = level === 'extreme' ? -1000 : 1, hi = level === 'extreme' ? 99 : 99;
      var values = [];
      for (var i = 0; i < n; i++) values.push(D.randInt(r, lo, hi));
      return { values: values };
    },
    input: {
      hint: T('Örnek: 38 27 43 3 9 82 10 15 31 6', 'Example: 38 27 43 3 9 82 10 15 31 6'),
      parse: function (text) {
        var values = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" bir tam sayı değil.', '"' + tok + '" is not an integer.');
          values.push(parseInt(tok, 10));
        });
        if (!values.length) throw T('En az bir değer yazın.', 'Write at least one value.');
        if (values.length > 24) throw T('En çok 24 değer.', 'At most 24 values.');
        return { values: values };
      },
      format: function (d) { return d.values.join(' '); },
      tokens: function (d) { return d.values.map(String); },
      bad: ['', '5 x 7', '3.5 8', ',,,']
    },
    build: function (S, d) {
      var arr = d.values.slice(), n = arr.length;
      var W = Math.max(30, Math.min(48, Math.floor(760 / Math.max(n, 1)))), H = 30, X0 = 90, Y0 = 40, ROWH = 52;
      var comparisons = 0, moves = 0;

      var RX = X0 + n * W + 30;
      S.label('cnt', { x: RX, y: Y0 - 20, text: 'comparisons: 0   moves: 0', size: 15, bold: true, mono: true, anchor: 'start' });
      function counters() { S.set('cnt', { text: 'comparisons: ' + comparisons + '   moves: ' + moves }); }

      var root = buildTree(0, n, 0);
      var maxDepth = 0;
      (function walk(node) { maxDepth = Math.max(maxDepth, node.depth); if (node.left) { walk(node.left); walk(node.right); } })(root);

      function drawRow(rowIdx, values, label) {
        S.label('rl' + rowIdx, { x: X0 - 16, y: Y0 + rowIdx * ROWH + H / 2 + 4, text: label, anchor: 'end', size: 13, mono: true, style: 'dim' });
        for (var i = 0; i < n; i++) S.box('d' + rowIdx + '_' + i, { x: X0 + i * W, y: Y0 + rowIdx * ROWH, w: W - 4, h: H, text: String(values[i]), style: 'normal', size: 12 });
      }
      function rowValues(rowIdx) { var v = []; for (var i = 0; i < n; i++) v.push(Number(S.get('d' + rowIdx + '_' + i).text)); return v; }
      function setRow(rowIdx, values, hiFrom, hiTo, style) {
        for (var i = 0; i < n; i++) {
          var st = (hiFrom !== undefined && i >= hiFrom && i < hiTo) ? style : 'normal';
          S.set('d' + rowIdx + '_' + i, { text: String(values[i]), style: st });
        }
      }

      S.step(T(n + ' değerlik dizi. Yukarıdan aşağı birleştirmeli sıralama önce böler (her satır bir özyineleme derinliği), sonra birleştirir. `d=0` bütün dizi.',
               n + ' values. Top-down merge sort first splits (each row is one recursion depth), then merges. `d=0` is the whole array.'),
             { c: [10, { n: 11, note: T('hi-lo <= 1? hayır', 'hi-lo <= 1? no') }, 12],
               java: [10, { n: 11, note: T('hi-lo <= 1? hayır', 'hi-lo <= 1? no') }, 12] });

      drawRow(0, arr, 'd=0');
      for (var depth = 1; depth <= maxDepth; depth++) {
        drawRow(depth, arr, 'd=' + depth);
        var segs = [];
        segmentsAtDepth(root, depth, segs);
        for (var s = 0; s < segs.length; s++) {
          var lo = segs[s][0], hi = segs[s][1];
          if (hi - lo > 1) S.brace('br' + depth + '_' + s, { from: 'd' + depth + '_' + lo, to: 'd' + depth + '_' + (hi - 1), text: T((hi - lo) + ' eleman', (hi - lo) + ' values'), side: 'bottom', dist: 10, style: 'dim' });
        }
        S.step(T('Derinlik ' + depth + ': her bölüm ikiye ayrılır (`mid = lo + (hi-lo)/2`). Değerler henüz değişmedi, yalnızca sınırlar küçülüyor.',
                 'Depth ' + depth + ': every part splits in two (`mid = lo + (hi-lo)/2`). Values have not changed yet, only the boundaries shrink.'),
               { c: [10, { n: 11, note: T('hi-lo <= 1? hayır', 'hi-lo <= 1? no') }, 12, 13, 14], java: [10, { n: 11, note: T('hi-lo <= 1? hayır', 'hi-lo <= 1? no') }, 12, 13, 14] });
      }
      S.step(T('Derinlik ' + maxDepth + '\'te her bölüm 0 ya da 1 elemanlı: `hi - lo <= 1` → temel durum, hemen döner. Şimdi geri dönüp birleştirme sırası.',
               'At depth ' + maxDepth + ' every part has 0 or 1 elements: `hi - lo <= 1` → base case, returns immediately. Now it is time to merge back up.'),
             { c: [10, { n: 11, note: T('hi-lo <= 1? evet', 'hi-lo <= 1? yes') }], java: [10, { n: 11, note: T('hi-lo <= 1? evet', 'hi-lo <= 1? yes') }] });

      var byDepth = {};
      internalNodesByDepth(root, byDepth);
      var depths = Object.keys(byDepth).map(Number).sort(function (a, b) { return b - a; });
      var curRow = maxDepth, firstMergeShown = false;

      depths.forEach(function (dep) {
        var nextRow = curRow + 1;
        var vals = rowValues(curRow);
        drawRow(nextRow, vals, T('birleştir ' + dep, 'merge ' + dep));
        byDepth[dep].forEach(function (node) {
          var lo = node.lo, mid = lo + Math.floor((node.hi - node.lo) / 2), hi = node.hi;
          var left = vals.slice(lo, mid), right = vals.slice(mid, hi);
          var out = [];
          var detailed = !firstMergeShown && (mid - lo) >= 1 && (hi - mid) >= 1;
          if (detailed) firstMergeShown = true;
          var i = 0, j = 0;
          setRow(nextRow, vals, lo, hi, 'active');
          if (detailed) {
            S.step(T('İki sıralı parça birleşiyor: [' + left.join(',') + '] ve [' + right.join(',') + '].', 'Merging two sorted runs: [' + left.join(',') + '] and [' + right.join(',') + '].'),
                   { c: [1, 2], java: [1, 2] });
          }
          while (i < left.length && j < right.length) {
            comparisons++;
            var takeLeft = left[i] <= right[j];
            var note = takeLeft ? T(left[i] + ' <= ' + right[j] + '? evet', left[i] + ' <= ' + right[j] + '? yes') : T(left[i] + ' <= ' + right[j] + '? hayır', left[i] + ' <= ' + right[j] + '? no');
            var v = takeLeft ? left[i++] : right[j++];
            out.push(v); moves++;
            if (detailed) {
              counters();
              vals = out.concat(left.slice(i)).concat(right.slice(j));
              var full = rowValues(nextRow); for (var q = 0; q < out.length; q++) full[lo + q] = out[q];
              setRow(nextRow, full, lo, lo + out.length, 'new');
              S.step(T((takeLeft ? 'Sol' : 'Sağ') + ' değer (' + v + ') daha küçük ya da eşit: çıktıya yazılır.', 'The ' + (takeLeft ? 'left' : 'right') + ' value (' + v + ') is smaller or equal: it is written to the output.'),
                     { c: [{ n: 3, note: T('i < mid && j < hi? evet', 'i < mid && j < hi? yes') }, { n: 4, note: note }],
                       java: [{ n: 3, note: T('i < mid && j < hi? evet', 'i < mid && j < hi? yes') }, { n: 4, note: note }] });
            }
          }
          while (i < left.length) { out.push(left[i++]); moves++; }
          while (j < right.length) { out.push(right[j++]); moves++; }
          var full2 = rowValues(nextRow);
          for (var q2 = 0; q2 < out.length; q2++) full2[lo + q2] = out[q2];
          setRow(nextRow, full2, lo, hi, 'new');
          vals = full2;
          counters();
          if (!detailed) {
            S.step(T('Birleştirildi: [' + left.join(',') + '] + [' + right.join(',') + '] → [' + out.join(',') + '].', 'Merged: [' + left.join(',') + '] + [' + right.join(',') + '] -> [' + out.join(',') + '].'),
                   { c: [{ n: 5, note: T('i < mid iken tekrarlanır', 'repeats while i < mid') },
                         { n: 6, note: T('j < hi iken tekrarlanır', 'repeats while j < hi') },
                         { n: 7, note: T('x = lo..hi-1 için kopyalanır', 'copied for x = lo..hi-1') }],
                     java: [{ n: 5, note: T('i < mid iken tekrarlanır', 'repeats while i < mid') },
                            { n: 6, note: T('j < hi iken tekrarlanır', 'repeats while j < hi') },
                            { n: 7, note: T('x = lo..hi-1 için kopyalanır', 'copied for x = lo..hi-1') }] });
          } else {
            S.step(T('Kalan uzunun tamamı sona kopyalanır. Sonuç: [' + out.join(',') + '].', 'The remainder of the longer run is copied straight to the end. Result: [' + out.join(',') + '].'),
                   { c: [{ n: 5, note: T('i < mid iken tekrarlanır', 'repeats while i < mid') },
                         { n: 6, note: T('j < hi iken tekrarlanır', 'repeats while j < hi') },
                         { n: 7, note: T('x = lo..hi-1 için kopyalanır', 'copied for x = lo..hi-1') }],
                     java: [{ n: 5, note: T('i < mid iken tekrarlanır', 'repeats while i < mid') },
                            { n: 6, note: T('j < hi iken tekrarlanır', 'repeats while j < hi') },
                            { n: 7, note: T('x = lo..hi-1 için kopyalanır', 'copied for x = lo..hi-1') }] });
          }
        });
        setRow(nextRow, vals);
        curRow = nextRow;
      });
      S.result = { sorted: rowValues(curRow) };
      S.step(T('Bitti: [' + rowValues(curRow).join(', ') + ']. Toplam ' + comparisons + ' karşılaştırma, ' + moves + ' yazma. Her durumda O(n log n); ekstra `tmp` dizisi yüzünden O(n) ek bellek kullanır ama kararlıdır (stable).',
               'Done: [' + rowValues(curRow).join(', ') + ']. Total ' + comparisons + ' comparisons, ' + moves + ' moves. Always O(n log n); uses O(n) extra memory for `tmp`, but it is stable.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
