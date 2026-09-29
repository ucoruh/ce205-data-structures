/* Week 4 — binary heap: insertion by sift-up (bubble-up). Tree (circle+arrow) and array are kept in sync.
 * Data may pick a min-heap or a max-heap: {kind: 'min'|'max', values: [...]} — values are inserted one at a time. */
(function (D) {
  'use strict';
  var T = D.T;

  function makeCode(d) {
    var min = d.kind !== 'max', op = min ? '<' : '>', name = min ? 'min' : 'max';
    var c = [
      '/* ' + name + '-heap: parent must be ' + (min ? '<=' : '>=') + ' both children */',
      'void insert(int value) {',
      '    heap[size] = value;      /* place at the next free slot */',
      '    int i = size;',
      '    size++;',
      '',
      '    while (i > 0) {                          /* sift-up */',
      '        int parent = (i - 1) / 2;',
      '        if (!(heap[i] ' + op + ' heap[parent]))',
      '            break;                            /* heap property holds, stop */',
      '        int tmp = heap[parent];',
      '        heap[parent] = heap[i];',
      '        heap[i] = tmp;',
      '        i = parent;',
      '    }',
      '}'
    ];
    var j = [
      '// ' + name + '-heap: parent must be ' + (min ? '<=' : '>=') + ' both children',
      'void insert(int value) {',
      '    heap[size] = value;      // place at the next free slot',
      '    int i = size;',
      '    size++;',
      '',
      '    while (i > 0) {                          // sift-up',
      '        int parent = (i - 1) / 2;',
      '        if (!(heap[i] ' + op + ' heap[parent]))',
      '            break;                            // heap property holds, stop',
      '        int tmp = heap[parent];',
      '        heap[parent] = heap[i];',
      '        heap[i] = tmp;',
      '        i = parent;',
      '    }',
      '}'
    ];
    return { c: c, java: j };
  }

  /** Index positions for a complete binary tree of up to n nodes, level by level. */
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

  function less(kind, a, b) { return kind === 'max' ? a > b : a < b; }

  /** When several loop iterations are concatenated into one S.step, the same source line can be
   *  "run" in one iteration and "the side not taken" (skip) in another — the player highlights by
   *  line NUMBER for the whole step, so a line that really executed at least once must never also
   *  carry a skip mark. Drop the conflicting skip entries; the run occurrence still shows it. */
  function dedupeSkip(lines) {
    var ran = {};
    lines.forEach(function (x) {
      var n = x && typeof x === 'object' ? x.n : x;
      var isSkip = !!(x && typeof x === 'object' && x.skip);
      if (!isSkip) ran[n] = true;
    });
    return lines.filter(function (x) {
      var n = x && typeof x === 'object' ? x.n : x;
      var isSkip = !!(x && typeof x === 'object' && x.skip);
      return !(isSkip && ran[n]);
    });
  }

  D.define({
    id: 'heap-insert-sift-up',
    title: T('Öbekte sift-up ile ekleme', 'Heap insertion by sift-up'),
    code: makeCode,
    presets: [
      { id: 'normal', level: 'normal', name: T('Min-öbek: 10 değer sırayla eklenir', 'Min-heap: 10 values inserted one by one'),
        data: { kind: 'min', values: [15, 7, 22, 3, 18, 9, 30, 1, 25, 12] } },
      { id: 'ascending-max', level: 'hard', name: T('Max-öbek: artan sırada 14 değer, her ekleme köke kadar yüzer', 'Max-heap: 14 ascending values, every insert floats all the way to the root'),
        data: { kind: 'max', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] } },
      { id: 'already-ordered', level: 'edge', name: T('Zaten uygun sırada: min-öbeğe artan 12 değer, hiç sifting gerekmez', 'Already in order: 12 ascending values into a min-heap, no sifting ever needed'),
        data: { kind: 'min', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } },
      { id: 'all-equal', level: 'edge', name: T('Hepsi eşit: 10 kez değer 7', 'All equal: value 7, ten times'),
        data: { kind: 'min', values: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7] } },
      { id: 'single', level: 'edge', name: T('Tek değer', 'A single value'), small: true,
        data: { kind: 'max', values: [42] } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler: INT_MAX, INT_MIN ve sıfır', 'Extreme values: INT_MAX, INT_MIN, and zero'),
        data: { kind: 'min', values: [2147483647, -2147483648, 0, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of values inserted — every example must have at least 10. */
    size: function (d) { return d.values.length; },
    /** Independent check: the root of a correct heap is always the global best; the multiset never changes. */
    reference: function (d) {
      var vs = d.values;
      var best = vs[0];
      for (var i = 1; i < vs.length; i++) if ((d.kind === 'max' ? vs[i] > best : vs[i] < best)) best = vs[i];
      return { n: vs.length, best: best, multiset: vs.slice().sort(function (a, b) { return a - b; }) };
    },
    random: function (level, r) {
      var kind = r() < 0.5 ? 'min' : 'max';
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level];
      var lo = level === 'extreme' ? -1000 : 1, hi = level === 'extreme' ? 1000 : 99;
      var values = [];
      for (var i = 0; i < n; i++) values.push(D.randInt(r, lo, hi));
      return { kind: kind, values: values };
    },
    input: {
      hint: T('Örnek: kind=min 15 7 22 3 18 9 30 1 25 12', 'Example: kind=min 15 7 22 3 18 9 30 1 25 12'),
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
      var kind = d.kind, values = d.values, n = values.length;
      var CX = 400, TOPY = 50, LEVELY = 78, TOTALW = Math.max(360, 60 * n);
      var pos = heapPositions(n, CX, TOPY, LEVELY, TOTALW);
      var ARRY = TOPY + (Math.floor(Math.log(n) / Math.LN2) + 1) * LEVELY + 70, DX = 56;
      var X0 = CX - (n - 1) * DX / 2;
      var arr = [];

      function sync(hi) {
        for (var i = 0; i < n; i++) {
          var nid = 'n' + i, bid = 'b' + i, eid = 'e' + i;
          if (i < arr.length) {
            var st = hi && hi.indexOf(i) >= 0 ? 'hl' : 'normal';
            if (S.has(nid)) { S.set(nid, { text: String(arr[i]), style: st }); S.set(bid, { text: String(arr[i]), style: st }); }
            else {
              S.circle(nid, { x: pos[i][0], y: pos[i][1], text: String(arr[i]), style: st, r: 22 });
              S.box(bid, { x: X0 + i * DX, y: ARRY, w: DX - 6, h: 40, text: String(arr[i]), style: st, size: 15, above: String(i) });
            }
            if (i > 0 && !S.has(eid)) S.arrow(eid, { from: 'n' + Math.floor((i - 1) / 2), to: nid, kind: 'center' });
          } else {
            if (S.has(nid)) S.remove(nid);
            if (S.has(bid)) S.remove(bid);
            if (S.has(eid)) S.remove(eid);
          }
        }
        /* Level labels only for levels that currently hold at least one node — never a d=k label with no node on it. */
        var curMaxLevel = arr.length > 0 ? Math.floor(Math.log(arr.length) / Math.LN2) : -1;
        for (var lv = 0; lv <= maxLevel; lv++) {
          var firstAt = Math.pow(2, lv) - 1, lid = 'dlvl' + lv;
          if (lv <= curMaxLevel && firstAt < n) {
            if (!S.has(lid)) S.label(lid, { x: pos[firstAt][0] - 46, y: pos[firstAt][1] + 5, text: 'd=' + lv, anchor: 'end', size: 14, mono: true, style: 'dim' });
          } else if (S.has(lid)) S.remove(lid);
        }
      }
      function cmp(text, style) { if (text === null) { if (S.has('cmp')) S.remove('cmp'); return; } if (S.has('cmp')) S.set('cmp', { text: text, style: style }); else S.label('cmp', { x: X0 + n * DX + 4, y: ARRY + 5, text: text, anchor: 'start', size: 15, mono: true, bold: true, style: style }); }

      var maxLevel = n > 0 ? Math.floor(Math.log(n) / Math.LN2) : 0;
      sync();
      S.label('arrlbl', { x: X0 - 14, y: ARRY + 5, text: 'heap[] =', anchor: 'end', size: 15, mono: true, style: 'dim' });
      S.label('title', { x: CX, y: TOPY - 26, text: T((kind === 'min' ? 'boş min-öbek (min-heap)' : 'boş max-öbek (max-heap)'), (kind === 'min' ? 'empty min-heap' : 'empty max-heap')), style: 'dim', size: 15 });
      S.step(T('Bir öbek (heap), en iyi değeri (min-öbekte en küçük, max-öbekte en büyük) her zaman kökte tutan tam bir ikili ağaçtır; aynı zamanda dizi olarak da tutulur: çocuklar `2i+1`, `2i+2`; ebeveyn `(i-1)/2`. ' +
               n + ' değer sırayla eklenecek.',
               'A heap is a complete binary tree that always keeps the best value (the minimum for a min-heap, the maximum for a max-heap) at the root; it is also stored as an array: children at `2i+1`, `2i+2`; parent at `(i-1)/2`. ' +
               n + ' values will be inserted one at a time.'),
             { c: [3, 4], java: [3, 4] });

      /** One sift-up iteration's worth of executed code-panel lines, both sides of the `if` marked
       *  (the taken side plain, the branch NOT taken dimmed with skip:true), matching the real C/Java
       *  execution order: 7 (loop check), 8 (parent), 9 (the if, with the compared values as a note),
       *  then either 10 (break) with 11-14 skipped, or 11-14 (swap) with 10 skipped. */
      function iterLines(val, par, willSwap) {
        var loopNote = { n: 7, note: T('i > 0? evet', 'i > 0? yes') };
        var noteTxt = willSwap
          ? T(val + ' ' + LT + ' ' + par + '? evet', val + ' ' + LT + ' ' + par + '? yes')
          : T(val + ' ' + LT + ' ' + par + '? hayır', val + ' ' + LT + ' ' + par + '? no');
        if (willSwap) {
          return [loopNote, 8, { n: 9, note: noteTxt }, { n: 10, skip: true }, 11, 12, 13, 14];
        }
        return [loopNote, 8, { n: 9, note: noteTxt }, 10, { n: 11, skip: true }, { n: 12, skip: true }, { n: 13, skip: true }, { n: 14, skip: true }];
      }
      /** Runs the whole sift-up for one insertion (mutates `arr` via the real swaps) and returns every
       *  code-panel line that really executed, in order, plus the index the value ends up at — used for
       *  the fast, lumped steps (every insertion except the one shown in detail). */
      function siftTraceLines(startI) {
        var lines = [], cur = startI;
        while (cur > 0) {
          var parent = Math.floor((cur - 1) / 2);
          var mustSwap = kind === 'max' ? arr[cur] > arr[parent] : arr[cur] < arr[parent];
          lines = lines.concat(iterLines(arr[cur], arr[parent], mustSwap));
          if (!mustSwap) return { lines: dedupeSkip(lines), finalI: cur };
          var tmp = arr[parent]; arr[parent] = arr[cur]; arr[cur] = tmp;
          cur = parent;
        }
        lines.push({ n: 7, note: T('i=0: sift-up biter', 'i=0: sift-up ends') });
        return { lines: dedupeSkip(lines), finalI: cur };
      }

      var LT = kind === 'max' ? '>' : '<', GE = kind === 'max' ? '≤' : '≥';
      var detailedShown = false;
      values.forEach(function (v, k) {
        S.at(k);
        if (S.has('title')) S.remove('title');
        arr.push(v);
        var i = arr.length - 1;
        sync([i]);
        S.step(T('`insert(' + v + ')`: değer, dizinin ilk boş hücresine (' + i + '. indis) yazılır.',
                 '`insert(' + v + ')`: the value is placed in the next free slot, index ' + i + '.'),
               { c: [3, 4, 5], java: [3, 4, 5] });
        if (!detailedShown && i > 0) {
          /* First insertion that actually has a parent to compare against: show every sift-up
           * iteration as its own step (the guide's "show the first operation in detail"). */
          detailedShown = true;
          var cur = i;
          while (true) {
            var parent = Math.floor((cur - 1) / 2);
            var mustSwap = kind === 'max' ? arr[cur] > arr[parent] : arr[cur] < arr[parent];
            sync([cur, parent]);
            if (!mustSwap) {
              cmp('stop: ' + arr[cur] + ' ' + GE + ' ' + arr[parent], 'dim');
              S.step(T('Ebeveynle (' + arr[parent] + ', ' + parent + '. indis) karşılaştır: öbek özelliği zaten sağlanıyor, dur.',
                       'Compare with the parent (' + arr[parent] + ' at index ' + parent + '): the heap property already holds, stop.'),
                     { c: iterLines(arr[cur], arr[parent], false), java: iterLines(arr[cur], arr[parent], false) });
              cmp(null);
              break;
            }
            cmp(arr[cur] + ' ' + LT + ' ' + arr[parent] + ' → swap', 'hl');
            var childVal = arr[cur], parentVal = arr[parent];
            var tmp = arr[parent]; arr[parent] = arr[cur]; arr[cur] = tmp;
            sync([cur, parent]);
            var reachedRoot = parent === 0;
            var lines = iterLines(childVal, parentVal, true);
            if (reachedRoot) lines = lines.concat([{ n: 7, note: T('i=0: sift-up biter', 'i=0: sift-up ends') }]);
            S.step(T('Ebeveyn (' + tmp + ') öbek kuralını bozuyor: yer değiştir (swap). Değer bir üst seviyeye "yüzüyor" (sift-up).' + (reachedRoot ? ' Köke ulaştı, dur.' : ''),
                     'The parent (' + tmp + ') breaks the heap rule: swap. The value "floats up" one level (sift-up).' + (reachedRoot ? ' It reached the root, stop.' : '')),
                   { c: lines, java: lines });
            cur = parent;
            if (reachedRoot) break;
          }
          cmp(null);
        } else {
          var trace = siftTraceLines(i);
          sync([trace.finalI]);
          S.step(T('`insert(' + v + ')`: boş hücreye yazılır, sonra sift-up ile ' + (trace.finalI === i ? 'yerinde kalır (sifting gerekmedi)' : (trace.finalI + '. indise kadar yüzer')) + '.',
                   '`insert(' + v + ')`: placed in the free slot, then sift-up ' + (trace.finalI === i ? 'leaves it in place (no sifting needed)' : ('carries it up to index ' + trace.finalI)) + '.'),
                 { c: [3, 4, 5].concat(trace.lines), java: [3, 4, 5].concat(trace.lines) });
        }
      });
      sync();
      var multiset = arr.slice().sort(function (a, b) { return a - b; });
      S.result = { n: arr.length, best: arr[0], multiset: multiset };
      S.step(T('Bitti: son öbek dizisi [' + arr.join(', ') + ']. Kökte (indis 0) her zaman en iyi değer var: ' + arr[0] + '. Her `insert`, ağacın yüksekliği kadar (O(log n)) karşılaştırma yapar.',
               'Done: final heap array [' + arr.join(', ') + ']. The root (index 0) always holds the best value: ' + arr[0] + '. Each `insert` does at most O(log n) comparisons, one per level of the tree.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
