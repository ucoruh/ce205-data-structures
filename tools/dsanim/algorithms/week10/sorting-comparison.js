/* Week 10 -- Sorting comparison: the SAME input array is sorted five different ways -- bubble, selection,
 * insertion, merge (top-down), and quick (Lomuto) -- one row per algorithm. Every comparison and every array
 * write funnels through the two counted primitives shown in the code panel, so the tallies on the right are a
 * fair, apples-to-apples measurement, not an estimate. The point is not to re-teach any one algorithm's
 * mechanics (each already has its own dedicated animation) but to make the O(n^2) vs O(n log n) gap, and the
 * effect of the INPUT SHAPE on it, into an actual number you can watch appear -- try the "already sorted"
 * example and watch bubble sort's early exit win by a landslide while quick sort (Lomuto, pivot = last
 * element) has its worst possible day. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'int comparisons = 0, writes = 0;',
    '',
    'int less(int a[], int x, int y) { comparisons++; return a[x] < a[y]; }',
    'void write_at(int a[], int idx, int v) { writes++; a[idx] = v; }',
    '',
    '/* every algorithm below is the SAME code from its own dedicated animation, except that',
    ' * every comparison and every assignment into the array goes through less()/write_at() */'
  ];
  var J = [
    'static int comparisons = 0, writes = 0;',
    '',
    'static boolean less(int[] a, int x, int y) { comparisons++; return a[x] < a[y]; }',
    'static void writeAt(int[] a, int idx, int v) { writes++; a[idx] = v; }',
    '',
    '// every algorithm below is the SAME code from its own dedicated animation, except that',
    '// every comparison and every assignment into the array goes through less()/writeAt()'
  ];

  var ALGOS = [
    { key: 'bubble', label: T('kabarcık', 'bubble'), run: simBubble },
    { key: 'selection', label: T('seçmeli', 'selection'), run: simSelection },
    { key: 'insertion', label: T('eklemeli', 'insertion'), run: simInsertion },
    { key: 'merge', label: T('birleştirmeli', 'merge'), run: simMerge },
    { key: 'quick', label: T('hızlı (Lomuto)', 'quick (Lomuto)'), run: simQuick }
  ];

  function simBubble(a) {
    a = a.slice(); var n = a.length, comp = 0, writes = 0;
    for (var pass = 0; pass < n - 1; pass++) {
      var swapped = false;
      for (var i = 0; i < n - 1 - pass; i++) {
        comp++;
        if (a[i] > a[i + 1]) { var t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; writes += 2; swapped = true; }
      }
      if (!swapped) break;
    }
    return { comparisons: comp, writes: writes, sorted: a };
  }
  function simSelection(a) {
    a = a.slice(); var n = a.length, comp = 0, writes = 0;
    for (var i = 0; i < n - 1; i++) {
      var m = i;
      for (var j = i + 1; j < n; j++) { comp++; if (a[j] < a[m]) m = j; }
      if (m !== i) { var t = a[i]; a[i] = a[m]; a[m] = t; writes += 2; }
    }
    return { comparisons: comp, writes: writes, sorted: a };
  }
  function simInsertion(a) {
    a = a.slice(); var n = a.length, comp = 0, writes = 0;
    for (var i = 1; i < n; i++) {
      var key = a[i], j = i - 1;
      while (j >= 0) { comp++; if (a[j] > key) { a[j + 1] = a[j]; writes++; j--; } else break; }
      a[j + 1] = key; writes++;
    }
    return { comparisons: comp, writes: writes, sorted: a };
  }
  function simMerge(a) {
    a = a.slice(); var n = a.length, comp = 0, writes = 0;
    function ms(lo, hi) {
      if (hi - lo <= 1) return;
      var mid = lo + Math.floor((hi - lo) / 2);
      ms(lo, mid); ms(mid, hi);
      var left = a.slice(lo, mid), right = a.slice(mid, hi), i = 0, j = 0, k = lo;
      while (i < left.length && j < right.length) { comp++; if (left[i] <= right[j]) a[k++] = left[i++]; else a[k++] = right[j++]; writes++; }
      while (i < left.length) { a[k++] = left[i++]; writes++; }
      while (j < right.length) { a[k++] = right[j++]; writes++; }
    }
    ms(0, n);
    return { comparisons: comp, writes: writes, sorted: a };
  }
  function simQuick(a) {
    a = a.slice(); var n = a.length, comp = 0, writes = 0;
    function qs(lo, hi) {
      if (lo >= hi) return;
      var pivot = a[hi], i = lo - 1;
      for (var j = lo; j < hi; j++) { comp++; if (a[j] <= pivot) { i++; var t = a[i]; a[i] = a[j]; a[j] = t; writes += 2; } }
      var t2 = a[i + 1]; a[i + 1] = a[hi]; a[hi] = t2; writes += 2;
      var p = i + 1;
      qs(lo, p - 1); qs(p + 1, hi);
    }
    qs(0, n - 1);
    return { comparisons: comp, writes: writes, sorted: a };
  }

  D.define({
    id: 'sorting-comparison',
    title: T('Sıralama algoritmalarının karşılaştırılması', 'Sorting algorithms, compared'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 rastgele değer', '10 unordered values'),
        data: { values: [38, 27, 43, 3, 9, 82, 10, 15, 31, 6] } },
      { id: 'hard', level: 'hard', name: T('14 rastgele değer', '14 unordered values'),
        data: { values: [45, 2, 38, 9, 33, 14, 29, 6, 41, 18, 24, 11, 36, 20] } },
      { id: 'already-sorted', level: 'edge', name: T('Zaten sıralı: kabarcık erken çıkışla kazanır, hızlı (Lomuto) en kötü günündedir', 'Already sorted: bubble wins via early exit, quick (Lomuto) has its worst day'),
        data: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } },
      { id: 'reverse-sorted', level: 'edge', name: T('Tersten sıralı: hem kabarcık hem hızlı (Lomuto) en kötü durumda', 'Reverse sorted: both bubble and quick (Lomuto) hit their worst case'),
        data: { values: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] } },
      { id: 'duplicates', level: 'edge', name: T('Tekrarlı değerler', 'Duplicate values'),
        data: { values: [5, 3, 5, 1, 3, 5, 1, 3, 5, 1] } },
      { id: 'nearly-sorted', level: 'edge', name: T('Neredeyse sıralı: sadece iki değer yer değiştirmiş', 'Nearly sorted: only two values are swapped'),
        data: { values: [1, 2, 3, 4, 9, 6, 7, 8, 5, 10, 11, 12] } },
      { id: 'single', level: 'edge', name: T('Tek değer', 'A single value'), small: true,
        data: { values: [7] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.values.length; },
    reference: function (d) { return { sorted: d.values.slice().sort(function (a, b) { return a - b; }) }; },
    random: function (level, r) {
      var n = { easy: 10, normal: 11, hard: 14, extreme: 14 }[level];
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
        if (values.length > 20) throw T('En çok 20 değer.', 'At most 20 values.');
        return { values: values };
      },
      format: function (d) { return d.values.join(' '); },
      tokens: function (d) { return d.values.map(String); },
      bad: ['', '5 x 7', '3.5 8', ',,,']
    },
    build: function (S, d) {
      var arr = d.values.slice(), n = arr.length;
      var W = Math.max(30, Math.min(48, Math.floor(560 / n))), H = 32, X0 = 130, ROWGAP = 56;

      for (var si = 0; si < ALGOS.length; si++) {
        var y = 40 + si * ROWGAP;
        S.label('rl' + si, { x: X0 - 16, y: y + H / 2 + 4, text: ALGOS[si].label, anchor: 'end', size: 14, bold: true, style: 'active' });
        for (var i = 0; i < n; i++) S.box(si + '_' + i, { x: X0 + i * W, y: y, w: W - 4, h: H, text: String(arr[i]), style: 'normal', size: 12 });
        S.label('cnt' + si, { x: X0 + n * W + 30, y: y + H / 2 + 4, text: 'comparisons: --   writes: --', size: 13, bold: true, mono: true, anchor: 'start', style: 'dim' });
      }

      S.step(T('Aynı ' + n + ' değerlik dizi, beş farklı algoritmayla sıralanacak. Her satırın karşılaştırma ve yazma sayısı, aynı girdi üzerinde doğrudan karşılaştırılabilir.',
               'The same ' + n + '-value array will be sorted five different ways. Each row\'s comparison and write count is directly comparable on this same input.'),
             { c: [1], java: [1] });

      var results = [];
      ALGOS.forEach(function (algo, si) {
        for (var i = 0; i < n; i++) S.set(si + '_' + i, { style: 'active' });
        S.set('cnt' + si, { style: 'normal' });
        S.step(T('[' + algo.label.tr + '] çalışıyor...', '[' + algo.label.en + '] running...'), { c: [3, 4], java: [3, 4] });
        var res = algo.run(arr);
        results.push(res);
        for (var i2 = 0; i2 < n; i2++) S.set(si + '_' + i2, { text: String(res.sorted[i2]), style: 'new' });
        S.set('cnt' + si, { text: 'comparisons: ' + res.comparisons + '   writes: ' + res.writes });
        S.step(T('[' + algo.label.tr + '] bitti: ' + res.comparisons + ' karşılaştırma, ' + res.writes + ' yazma.', '[' + algo.label.en + '] done: ' + res.comparisons + ' comparisons, ' + res.writes + ' writes.'),
               { c: [3, 4], java: [3, 4] });
      });

      var ranking = ALGOS.map(function (a, si) { return { label: a.label, c: results[si].comparisons }; }).sort(function (x, y) { return x.c - y.c; });
      var rankTr = ranking.map(function (r, idx) { return (idx + 1) + '. ' + r.label.tr + ' (' + r.c + ')'; }).join('  ');
      var rankEn = ranking.map(function (r, idx) { return (idx + 1) + '. ' + r.label.en + ' (' + r.c + ')'; }).join('  ');
      S.result = { sorted: results[0].sorted.slice() };
      S.step(T('Karşılaştırma sayısına göre sıralama: ' + rankTr + '. Girdi biçimi (zaten sıralı, tersten sıralı, rastgele) hangi algoritmanın kazandığını değiştirebilir -- tek bir "en iyi" algoritma yoktur.',
               'Ranked by comparison count: ' + rankEn + '. The shape of the input (already sorted, reverse sorted, random) can change which algorithm wins -- there is no single "best" algorithm.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
