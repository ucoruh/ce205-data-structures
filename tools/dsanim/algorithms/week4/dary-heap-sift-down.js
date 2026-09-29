/* Week 4 — d-ary heap: same array-backed idea as a binary heap, but every node has up to D children (child c of
 * node i sits at D*i + 1 + c, parent at floor((i-1)/D)). D = 3 or 4, chosen by the data. Tree (circle + arrow) and
 * array are kept in sync, exactly like the binary-heap files. Data: {kind: 'min'|'max', d: 3|4, values: [...],
 * extracts: k} — `values` must already be a valid D-ary heap of that kind (own input is silently repaired with a
 * bottom-up heapify before use; that helper is used only to PREPARE data, never by build() or reference()). */
(function (D) {
  'use strict';
  var T = D.T;

  function less(kind, a, b) { return kind === 'max' ? a > b : a < b; }
  function siftDownAt(arr, n, i, deg, kind) {
    while (true) {
      var target = i, base = deg * i + 1;
      for (var c = 0; c < deg; c++) {
        var child = base + c;
        if (child < n && less(kind, arr[child], arr[target])) target = child;
      }
      if (target === i) break;
      var t = arr[i]; arr[i] = arr[target]; arr[target] = t;
      i = target;
    }
  }
  /** Bottom-up heapify, used only to prepare/repair example data — never called from build() or reference(). */
  function heapify(values, deg, kind) {
    var arr = values.slice(), n = arr.length;
    for (var i = Math.floor((n - 2) / deg); i >= 0; i--) siftDownAt(arr, n, i, deg, kind);
    return arr;
  }

  function makeCode(data) {
    var min = data.kind !== 'max', op = min ? '<' : '>', name = min ? 'min' : 'max', deg = data.d;
    var c = [
      '#define D ' + deg + '                        /* every node has up to D children */',
      '',
      '/* ' + name + '-heap: remove and return the root (the ' + (min ? 'minimum' : 'maximum') + ') */',
      'int extract(void) {',
      '    int best = heap[0];',
      '    size--;',
      '    heap[0] = heap[size];        /* move the last element to the root */',
      '',
      '    int i = 0;',
      '    while (1) {                              /* sift-down */',
      '        int target = i, base = D * i + 1;',
      '        for (int c = 0; c < D; c++) {',
      '            int child = base + c;',
      '            if (child < size && heap[child] ' + op + ' heap[target])',
      '                target = child;',
      '        }',
      '        if (target == i) break;',
      '',
      '        int tmp = heap[i];',
      '        heap[i] = heap[target];',
      '        heap[target] = tmp;',
      '        i = target;',
      '    }',
      '    return best;',
      '}'
    ];
    var j = [
      'static final int D = ' + deg + ';                // every node has up to D children',
      '',
      '// ' + name + '-heap: remove and return the root (the ' + (min ? 'minimum' : 'maximum') + ')',
      'int extract() {',
      '    int best = heap[0];',
      '    size--;',
      '    heap[0] = heap[size];        // move the last element to the root',
      '',
      '    int i = 0;',
      '    while (true) {                            // sift-down',
      '        int target = i, base = D * i + 1;',
      '        for (int c = 0; c < D; c++) {',
      '            int child = base + c;',
      '            if (child < size && heap[child] ' + op + ' heap[target])',
      '                target = child;',
      '        }',
      '        if (target == i) break;',
      '',
      '        int tmp = heap[i];',
      '        heap[i] = heap[target];',
      '        heap[target] = tmp;',
      '        i = target;',
      '    }',
      '    return best;',
      '}'
    ];
    return { c: c, java: j };
  }

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

  function dHeapPositions(n, deg, cx, topY, levelY, totalW) {
    var pos = {};
    for (var i = 0; i < n; i++) {
      var level = 0, first = 0, count = 1;
      while (first + count <= i) { first += count; count *= deg; level++; }
      var width = totalW / count;
      pos[i] = [cx - totalW / 2 + width * (i - first + 0.5), topY + level * levelY];
    }
    return pos;
  }

  D.define({
    id: 'dary-heap-sift-down',
    title: T('D-ary öbekte sift-down ile kök çıkarma', 'D-ary heap extraction by sift-down'),
    code: makeCode,
    presets: [
      { id: 'normal', level: 'normal', name: T('D=3, min-öbek: 12 değerden 3 kez çıkarma', 'D=3, min-heap: 3 extractions from 12 values'),
        data: { kind: 'min', d: 3, values: heapify([15, 7, 22, 3, 18, 9, 30, 1, 25, 12, 20, 6], 3, 'min'), extracts: 3 } },
      { id: 'hard', level: 'hard', name: T('D=4, max-öbek: 16 değerden 5 kez çıkarma', 'D=4, max-heap: 5 extractions from 16 values'),
        data: { kind: 'max', d: 4, values: heapify([40, 11, 27, 8, 33, 16, 45, 2, 19, 37, 24, 6, 50, 29, 3, 44], 4, 'max'), extracts: 5 } },
      { id: 'drain', level: 'edge', name: T('D=3: sonuna kadar, 10 değerin tamamı çıkarılır', 'D=3: drain fully, all 10 values are extracted'),
        data: { kind: 'min', d: 3, values: heapify([31, 5, 17, 26, 9, 44, 13, 2, 38, 20], 3, 'min'), extracts: 10 } },
      { id: 'all-equal', level: 'edge', name: T('D=4, hepsi eşit: değer 6, on kez', 'D=4, all equal: value 6, ten times'),
        data: { kind: 'max', d: 4, values: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6], extracts: 4 } },
      { id: 'single', level: 'edge', name: T('D=3, tek değer, tek çıkarma', 'D=3, a single value, one extraction'), small: true,
        data: { kind: 'min', d: 3, values: [42], extracts: 1 } },
      { id: 'extreme', level: 'edge', name: T('D=4, uç değerler', 'D=4, extreme values'),
        data: { kind: 'min', d: 4, values: heapify([2147483647, -2147483648, 0, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1], 4, 'min'), extracts: 3 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of values in the starting heap — every example must have at least 10. */
    size: function (d) { return d.values.length; },
    /** Independent computation: repeatedly scan for the true best and remove it (no sift-down, no D involved). */
    reference: function (d) {
      var arr = d.values.slice(), order = [], k = Math.min(d.extracts, arr.length);
      for (var t = 0; t < k; t++) {
        var bi = 0;
        for (var i = 1; i < arr.length; i++) if ((d.kind === 'max' ? arr[i] > arr[bi] : arr[i] < arr[bi])) bi = i;
        order.push(arr[bi]);
        arr.splice(bi, 1);
      }
      return { order: order, remaining: arr.slice().sort(function (a, b) { return a - b; }) };
    },
    random: function (level, r) {
      var kind = r() < 0.5 ? 'min' : 'max';
      var deg = r() < 0.5 ? 3 : 4;
      var n = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level];
      var lo = level === 'extreme' ? -1000 : 1, hi = level === 'extreme' ? 1000 : 99;
      var values = [];
      for (var i = 0; i < n; i++) values.push(D.randInt(r, lo, hi));
      var extracts = D.randInt(r, 1, n);
      return { kind: kind, d: deg, values: heapify(values, deg, kind), extracts: extracts };
    },
    input: {
      hint: T('Örnek: kind=min d=3 extracts=3  15 7 22 3 18 9 30 1 25 12 20 6', 'Example: kind=min d=3 extracts=3  15 7 22 3 18 9 30 1 25 12 20 6'),
      parse: function (text) {
        var kind = 'min', deg = 3, extracts = null, values = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mk = /^kind[=:](min|max)$/i.exec(tok);
          if (mk) { kind = mk[1].toLowerCase(); return; }
          var md = /^d[=:]([34])$/i.exec(tok);
          if (md) { deg = parseInt(md[1], 10); return; }
          var me = /^extracts?[=:](\d+)$/i.exec(tok);
          if (me) { extracts = parseInt(me[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, kind=min/max, d=3/4 ya da extracts=N yazın.', '"' + tok + '" is not understood: write a number, kind=min/max, d=3/4, or extracts=N.');
          values.push(parseInt(tok, 10));
        });
        if (!values.length) throw T('En az bir değer yazın.', 'Write at least one value.');
        if (values.length > 30) throw T('En çok 30 değer.', 'At most 30 values.');
        if (extracts === null) extracts = Math.min(3, values.length);
        if (extracts < 1 || extracts > values.length) throw T('extracts, 1 ile ' + values.length + ' arasında olmalı.', 'extracts must be between 1 and ' + values.length + '.');
        return { kind: kind, d: deg, values: heapify(values, deg, kind), extracts: extracts };
      },
      format: function (d) { return 'kind=' + d.kind + ' d=' + d.d + ' extracts=' + d.extracts + '  ' + d.values.join(' '); },
      tokens: function (d) { return d.values.map(String); },
      bad: ['', 'kind=mid d=3 extracts=2 5 8', 'd=5 5 8 3 9 1 6 4 7 2 10', '5 x 7', 'kind=min d=3 extracts=0 5 8 3 9 1 6 4 7 2 10']
    },
    build: function (S, d) {
      var kind = d.kind, deg = d.d, n = d.values.length, k = Math.min(d.extracts, n);
      var CX = 420, TOPY = 50, LEVELY = 84, TOTALW = Math.max(360, 64 * n);
      var pos = dHeapPositions(n, deg, CX, TOPY, LEVELY, TOTALW);
      var maxLevel = 0, first = 0, count = 1, levelFirst = [0];
      while (first + count < n) { first += count; count *= deg; maxLevel++; levelFirst.push(first); }
      var ARRY = TOPY + (maxLevel + 1) * LEVELY + 70, DX = 56;
      var X0 = CX - (n - 1) * DX / 2;
      var arr = d.values.slice(), size = n;

      /** Level of the last currently-occupied node (size-1), by the same D-ary level math as dHeapPositions. */
      function curMaxLevel() {
        if (size <= 0) return -1;
        var lvl = 0, f = 0, c = 1;
        while (f + c < size) { f += c; c *= deg; lvl++; }
        return lvl;
      }

      function sync(hi) {
        for (var i = 0; i < n; i++) {
          var nid = 'n' + i, bid = 'b' + i, eid = 'e' + i;
          if (i < size) {
            var st = hi && hi.indexOf(i) >= 0 ? 'hl' : 'normal';
            if (S.has(nid)) { S.set(nid, { text: String(arr[i]), style: st }); S.set(bid, { text: String(arr[i]), style: st }); }
            else {
              S.circle(nid, { x: pos[i][0], y: pos[i][1], text: String(arr[i]), style: st, r: 20 });
              S.box(bid, { x: X0 + i * DX, y: ARRY, w: DX - 6, h: 40, text: String(arr[i]), style: st, size: 15, above: String(i) });
            }
            if (i > 0 && !S.has(eid)) S.arrow(eid, { from: 'n' + Math.floor((i - 1) / deg), to: nid, kind: 'center' });
          } else {
            if (S.has(nid)) S.remove(nid);
            if (S.has(bid)) S.remove(bid);
            if (S.has(eid)) S.remove(eid);
          }
        }
        var infoText = size === 0 ? T('öbek boş (size = 0)', 'the heap is empty (size = 0)') : T('D = ' + deg + ', size = ' + size, 'D = ' + deg + ', size = ' + size);
        if (S.has('info')) S.set('info', { text: infoText }); else S.label('info', { x: CX, y: TOPY - 24, text: infoText, style: 'dim', size: 15 });
        /* Level labels only for levels the CURRENT (shrinking) heap actually occupies — never a leftover
         * d=k label once every node on level k has been extracted away. */
        var cml = curMaxLevel();
        for (var lv = 0; lv <= maxLevel; lv++) {
          var lid = 'dlvl' + lv;
          if (lv <= cml) {
            if (!S.has(lid)) S.label(lid, { x: pos[levelFirst[lv]][0] - 46, y: pos[levelFirst[lv]][1] + 5, text: 'd=' + lv, anchor: 'end', size: 14, mono: true, style: 'dim' });
          } else if (S.has(lid)) S.remove(lid);
        }
      }
      function cmp(text, style) { if (text === null) { if (S.has('cmp')) S.remove('cmp'); return; } if (S.has('cmp')) S.set('cmp', { text: text, style: style }); else S.label('cmp', { x: X0 + n * DX + 4, y: ARRY + 5, text: text, anchor: 'start', size: 15, mono: true, bold: true, style: style }); }
      var LT = kind === 'max' ? '>' : '<', GE = kind === 'max' ? '≤' : '≥';

      var outCount = 0;
      function outputBox(val) {
        if (outCount > 0) S.set('ex' + (outCount - 1), { style: 'normal' });
        S.box('ex' + outCount, { x: X0 + outCount * DX, y: ARRY + 62, w: DX - 6, h: 36, text: String(val), style: 'hl', size: 15 });
        outCount++;
      }

      sync();
      S.label('arrlbl', { x: X0 - 14, y: ARRY + 5, text: 'heap[] =', anchor: 'end', size: 15, mono: true, style: 'dim' });
      S.label('exlbl', { x: X0 - 14, y: ARRY + 67, text: T('çıkarılan =', 'extracted ='), anchor: 'end', size: 15, mono: true, style: 'dim' });
      S.step(T('Bir D-ary öbek, her düğümün en fazla D çocuğu olan bir dizi-tabanlı ağaçtır (burada D = ' + deg + '); çocuklar `D*i+1 .. D*i+D`, ebeveyn `(i-1)/D`. Başlangıç ' + (kind === 'min' ? 'min' : 'max') + '-öbeği geçerli: ' + n + ' değer. ' + k + ' çıkarma yapılacak.',
               'A D-ary heap is an array-backed tree where every node has up to D children (here D = ' + deg + '); children at `D*i+1 .. D*i+D`, parent at `(i-1)/D`. The starting ' + (kind === 'min' ? 'min' : 'max') + '-heap is valid: ' + n + ' values. ' + k + ' extractions will happen.'));

      /** One sift-down iteration's worth of executed code-panel lines for index `i` (reads the CURRENT
       *  arr/size from the closure, does not mutate). Line 11 (target=i, base=...) always runs once; then
       *  for each of the D child slots the loop header (12), the child index (13, ALWAYS evaluated even
       *  past the end of the array — `child = base + c` has no condition) and the if-check (14, with a
       *  note on the compared values, or "no such child" when child >= size) all run, and line 15
       *  (target = child) is taken only for the slot that actually won (skip:true otherwise); line 12
       *  runs once more for the loop's final (false) re-check. Line 17 (if (target == i) break;) decides
       *  whether the function returns here or falls through to the swap block (19-22). */
      function iterLines(i) {
        var base = deg * i + 1, target = i;
        var lines = [{ n: 10, note: T('while(1): her zaman gir, break ile çık', 'while(1): always enter, exit via break') }, 11];
        for (var c = 0; c < deg; c++) {
          var child = base + c;
          var exists = child < size;
          var won = exists && less(kind, arr[child], arr[target]);
          lines.push({ n: 12, note: T('c < D? evet', 'c < D? yes') }, 13);
          lines.push({ n: 14, note: !exists ? T('bu çocuk yok (child ≥ size)', 'no such child (child ≥ size)')
            : (won ? T(arr[child] + ' ' + LT + ' ' + arr[target] + '? evet', arr[child] + ' ' + LT + ' ' + arr[target] + '? yes')
                   : T(arr[child] + ' ' + LT + ' ' + arr[target] + '? hayır', arr[child] + ' ' + LT + ' ' + arr[target] + '? no')) });
          lines.push(won ? 15 : { n: 15, skip: true });
          if (won) target = child;
        }
        lines.push({ n: 12, note: T('c < D? hayır', 'c < D? no') });
        var stop = target === i;
        lines.push({ n: 17, note: stop ? T('target == i? evet', 'target == i? yes') : T('target == i? hayır', 'target == i? no') });
        if (!stop) lines.push(19, 20, 21, 22);
        /* Line 15 (`target = child;`) is the for-loop body: across the up-to-D child slots checked in
         * THIS single call, it is taken (run) for the winning slot and not taken (skip) for the others —
         * dedupe so a line that really ran at least once never also carries a skip mark (see dedupeSkip). */
        return { lines: dedupeSkip(lines), target: target, stop: stop };
      }
      /** Runs the whole sift-down for one extraction (mutates arr/size via the real swaps) and returns
       *  every code-panel line that really executed, in order — used for the fast, lumped steps. */
      function siftDownTraceLines(startI) {
        var lines = [], i = startI;
        while (true) {
          var it = iterLines(i);
          lines = lines.concat(it.lines);
          if (it.stop) return { lines: dedupeSkip(lines), finalI: i };
          var tmp = arr[i]; arr[i] = arr[it.target]; arr[it.target] = tmp;
          i = it.target;
        }
      }

      var order = [];
      var detailedShown = false;
      for (var t = 0; t < k; t++) {
        var best = arr[0];
        order.push(best);
        if (!detailedShown) {
          detailedShown = true;
          sync([0]);
          outputBox(best);
          S.step(T('`extract()`: kökteki değer (' + best + ') kaydedilir; bu, döndürülecek sonuç.',
                   '`extract()`: the root value (' + best + ') is saved; this is the result that will be returned.'),
                 { c: [5], java: [5] });
          arr[0] = arr[size - 1]; size--;
          sync([0]);
          S.step(T('Son eleman köke taşınır (' + arr[0] + '), öbek küçülür: size = ' + size + '. Kökte öbek özelliği bozuk olabilir.',
                   'The last element moves to the root (' + arr[0] + '), the heap shrinks: size = ' + size + '. The root may now violate the heap property.'),
                 { c: [6, 7], java: [6, 7] });
          var i = 0;
          while (true) {
            var it = iterLines(i);
            var base = deg * i + 1, kids = [];
            for (var c = 0; c < deg; c++) { var ci = base + c; if (ci < size) kids.push(ci); }
            if (it.stop) {
              sync([i].concat(kids));
              cmp('stop: ' + arr[i] + ' ' + GE + ' children', 'dim');
              S.step(T('En fazla ' + deg + ' çocukla karşılaştır: hiçbiri daha iyi değil, öbek özelliği sağlandı, dur.',
                       'Compare with up to ' + deg + ' children: none is better, the heap property holds, stop.'),
                     { c: it.lines, java: it.lines });
              cmp(null);
              break;
            }
            cmp(arr[it.target] + ' ' + LT + ' ' + arr[i] + ' → swap', 'hl');
            var tmp = arr[i]; arr[i] = arr[it.target]; arr[it.target] = tmp;
            sync([i, it.target]);
            S.step(T(it.target + '. indisteki çocuk en iyisi: yer değiştir (swap). Değer aşağı "batıyor" (sift-down).',
                     'The child at index ' + it.target + ' is the best: swap. The value "sinks down" (sift-down).'),
                   { c: it.lines, java: it.lines });
            cmp(null);
            i = it.target;
          }
        } else {
          arr[0] = arr[size - 1]; size--;
          var trace = siftDownTraceLines(0);
          sync([trace.finalI]);
          outputBox(best);
          S.step(T('`extract()`: kök (' + best + ') alınır, son eleman köke gelir, sift-down (en fazla ' + deg + ' çocukla karşılaştırarak) öbeği onarır. Kalan boyut: ' + size + '.',
                   '`extract()`: the root (' + best + ') is taken, the last element moves to the root, sift-down (comparing up to ' + deg + ' children) repairs the heap. Remaining size: ' + size + '.'),
                 { c: [5, 6, 7].concat(trace.lines), java: [5, 6, 7].concat(trace.lines) });
        }
      }
      sync();
      var remaining = arr.slice(0, size).sort(function (a, b) { return a - b; });
      S.result = { order: order, remaining: remaining };
      S.step(T('Bitti: çıkarılan sıra [' + order.join(', ') + ']; kalan ' + size + ' değer: [' + remaining.join(', ') + ']. Yükseklik yalnızca log_D(n) olduğundan sift-down O(log_D n) sürer — daha büyük D, daha kısa ağaç ama karşılaştırma başına daha çok çocuk demek.',
               'Done: extraction order [' + order.join(', ') + ']; ' + size + ' values remain: [' + remaining.join(', ') + ']. Height is only log_D(n), so sift-down costs O(log_D n) — a larger D means a shorter tree but more children to compare per step.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
