/* Week 4 — binary heap: extracting the root by sift-down (bubble-down). Tree (circle+arrow) and array are kept in
 * sync. Data may pick a min-heap or a max-heap: {kind: 'min'|'max', values: [...], extracts: k}. `values` must
 * already be a valid heap of that kind (own input is silently repaired with a bottom-up heapify before use, the
 * same one used to build the examples — this helper is used only to PREPARE data, never by build() or reference()). */
(function (D) {
  'use strict';
  var T = D.T;

  function less(kind, a, b) { return kind === 'max' ? a > b : a < b; }
  function siftDownAt(arr, n, i, kind) {
    while (true) {
      var l = 2 * i + 1, r = 2 * i + 2, best = i;
      if (l < n && less(kind, arr[l], arr[best])) best = l;
      if (r < n && less(kind, arr[r], arr[best])) best = r;
      if (best === i) break;
      var t = arr[i]; arr[i] = arr[best]; arr[best] = t;
      i = best;
    }
  }
  /** Bottom-up heapify, used only to prepare/repair example data — never called from build() or reference(). */
  function heapify(values, kind) {
    var arr = values.slice(), n = arr.length;
    for (var i = Math.floor(n / 2) - 1; i >= 0; i--) siftDownAt(arr, n, i, kind);
    return arr;
  }

  function makeCode(d) {
    var min = d.kind !== 'max', op = min ? '<' : '>', name = min ? 'min' : 'max';
    var fn = min ? 'extract_min' : 'extract_max', fnJ = min ? 'extractMin' : 'extractMax';
    var c = [
      '/* ' + name + '-heap: remove and return the root (the ' + (min ? 'minimum' : 'maximum') + ') */',
      'int ' + fn + '(void) {',
      '    int best = heap[0];',
      '    size--;',
      '    heap[0] = heap[size];    /* move the last element to the root */',
      '',
      '    int i = 0;',
      '    while (1) {                              /* sift-down */',
      '        int left = 2 * i + 1;',
      '        int right = 2 * i + 2;',
      '        int target = i;',
      '',
      '        if (left < size && heap[left] ' + op + ' heap[target])',
      '            target = left;',
      '        if (right < size && heap[right] ' + op + ' heap[target])',
      '            target = right;',
      '        if (target == i)',
      '            break;',
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
      '// ' + name + '-heap: remove and return the root (the ' + (min ? 'minimum' : 'maximum') + ')',
      'int ' + fnJ + '() {',
      '    int best = heap[0];',
      '    size--;',
      '    heap[0] = heap[size];    // move the last element to the root',
      '',
      '    int i = 0;',
      '    while (true) {                            // sift-down',
      '        int left = 2 * i + 1;',
      '        int right = 2 * i + 2;',
      '        int target = i;',
      '',
      '        if (left < size && heap[left] ' + op + ' heap[target])',
      '            target = left;',
      '        if (right < size && heap[right] ' + op + ' heap[target])',
      '            target = right;',
      '        if (target == i)',
      '            break;',
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
    id: 'heap-extract-sift-down',
    title: T('Öbekte sift-down ile kök çıkarma', 'Heap extraction by sift-down'),
    code: makeCode,
    presets: [
      { id: 'normal', level: 'normal', name: T('Min-öbek: 12 değerden 3 kez çıkarma', 'Min-heap: 3 extractions from 12 values'),
        data: { kind: 'min', values: heapify([15, 7, 22, 3, 18, 9, 30, 1, 25, 12, 20, 6], 'min'), extracts: 3 } },
      { id: 'hard', level: 'hard', name: T('Max-öbek: 16 değerden 5 kez çıkarma', 'Max-heap: 5 extractions from 16 values'),
        data: { kind: 'max', values: heapify([40, 11, 27, 8, 33, 16, 45, 2, 19, 37, 24, 6, 50, 29, 3, 44], 'max'), extracts: 5 } },
      { id: 'drain', level: 'edge', name: T('Sonuna kadar: 10 değerin tamamı çıkarılır', 'Drain fully: all 10 values are extracted'),
        data: { kind: 'min', values: heapify([31, 5, 17, 26, 9, 44, 13, 2, 38, 20], 'min'), extracts: 10 } },
      { id: 'all-equal', level: 'edge', name: T('Hepsi eşit: değer 9, on kez', 'All equal: value 9, ten times'),
        data: { kind: 'max', values: [9, 9, 9, 9, 9, 9, 9, 9, 9, 9], extracts: 4 } },
      { id: 'single', level: 'edge', name: T('Tek değer, tek çıkarma', 'A single value, one extraction'), small: true,
        data: { kind: 'min', values: [42], extracts: 1 } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler', 'Extreme values'),
        data: { kind: 'min', values: heapify([2147483647, -2147483648, 0, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1], 'min'), extracts: 3 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of values in the starting heap — every example must have at least 10. */
    size: function (d) { return d.values.length; },
    /** Independent computation: repeatedly scan for the true best and remove it (no sift-down involved). */
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
      var n = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level];
      var lo = level === 'extreme' ? -1000 : 1, hi = level === 'extreme' ? 1000 : 99;
      var values = [];
      for (var i = 0; i < n; i++) values.push(D.randInt(r, lo, hi));
      var extracts = D.randInt(r, 1, n);
      return { kind: kind, values: heapify(values, kind), extracts: extracts };
    },
    input: {
      hint: T('Örnek: kind=min extracts=3  15 7 22 3 18 9 30 1 25 12 20 6', 'Example: kind=min extracts=3  15 7 22 3 18 9 30 1 25 12 20 6'),
      parse: function (text) {
        var kind = 'min', extracts = null, values = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mk = /^kind[=:](min|max)$/i.exec(tok);
          if (mk) { kind = mk[1].toLowerCase(); return; }
          var me = /^extracts?[=:](\d+)$/i.exec(tok);
          if (me) { extracts = parseInt(me[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, kind=min/max ya da extracts=N yazın.', '"' + tok + '" is not understood: write a number, kind=min/max, or extracts=N.');
          values.push(parseInt(tok, 10));
        });
        if (!values.length) throw T('En az bir değer yazın.', 'Write at least one value.');
        if (values.length > 30) throw T('En çok 30 değer.', 'At most 30 values.');
        if (extracts === null) extracts = Math.min(3, values.length);
        if (extracts < 1 || extracts > values.length) throw T('extracts, 1 ile ' + values.length + ' arasında olmalı.', 'extracts must be between 1 and ' + values.length + '.');
        return { kind: kind, values: heapify(values, kind), extracts: extracts };
      },
      format: function (d) { return 'kind=' + d.kind + ' extracts=' + d.extracts + '  ' + d.values.join(' '); },
      tokens: function (d) { return d.values.map(String); },
      bad: ['', 'kind=mid extracts=2 5 8', '5 x 7', '3.5 8', 'kind=min extracts=0 5 8 3 9 1 6 4 7 2 10']
    },
    build: function (S, d) {
      var kind = d.kind, n = d.values.length, k = Math.min(d.extracts, n);
      var CX = 400, TOPY = 50, LEVELY = 78, TOTALW = Math.max(360, 60 * n);
      var pos = heapPositions(n, CX, TOPY, LEVELY, TOTALW);
      var ARRY = TOPY + (Math.floor(Math.log(n) / Math.LN2) + 1) * LEVELY + 70, DX = 56;
      var X0 = CX - (n - 1) * DX / 2;
      var arr = d.values.slice(), size = n;

      function sync(hi) {
        for (var i = 0; i < n; i++) {
          var nid = 'n' + i, bid = 'b' + i, eid = 'e' + i;
          if (i < size) {
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
        var infoText = size === 0 ? T('öbek boş (size = 0)', 'the heap is empty (size = 0)') : T('size = ' + size, 'size = ' + size);
        if (S.has('info')) S.set('info', { text: infoText }); else S.label('info', { x: CX, y: TOPY - 24, text: infoText, style: 'dim', size: 15 });
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
      var maxLevel = n > 0 ? Math.floor(Math.log(n) / Math.LN2) : 0;
      for (var lv = 0; lv <= maxLevel; lv++) {
        var firstAt = Math.pow(2, lv) - 1;
        if (firstAt < n) S.label('dlvl' + lv, { x: pos[firstAt][0] - 46, y: pos[firstAt][1] + 5, text: 'd=' + lv, anchor: 'end', size: 14, mono: true, style: 'dim' });
      }
      S.step(T('Başlangıç ' + (kind === 'min' ? 'min' : 'max') + '-öbeği geçerli: ' + n + ' değer. Her çıkarma, kökü siler ve öbek özelliğini sift-down ile onarır. ' + k + ' çıkarma yapılacak.',
               'The starting ' + (kind === 'min' ? 'min' : 'max') + '-heap is valid: ' + n + ' values. Every extraction removes the root and repairs the heap property with sift-down. ' + k + ' extractions will happen.'));

      var order = [];
      for (var t = 0; t < k; t++) {
        var best = arr[0];
        order.push(best);
        if (t === 0) {
          sync([0]);
          outputBox(best);
          S.step(T('`extract()`: kökteki değer (' + best + ') kaydedilir; bu, döndürülecek sonuç.',
                   '`extract()`: the root value (' + best + ') is saved; this is the result that will be returned.'),
                 { c: [3], java: [3] });
          arr[0] = arr[size - 1]; size--;
          sync([0]);
          S.step(T('Son eleman köke taşınır (' + arr[0] + '), öbek küçülür: size = ' + size + '. Kökte öbek özelliği bozuk olabilir.',
                   'The last element moves to the root (' + arr[0] + '), the heap shrinks: size = ' + size + '. The root may now violate the heap property.'),
                 { c: [4, 5], java: [4, 5] });
          var i = 0;
          while (true) {
            var l = 2 * i + 1, r = 2 * i + 2, tgt = i;
            if (l < size && less(kind, arr[l], arr[tgt])) tgt = l;
            if (r < size && less(kind, arr[r], arr[tgt])) tgt = r;
            if (tgt === i) {
              sync([i]);
              cmp('stop: ' + arr[i] + ' ' + GE + ' children', 'dim');
              S.step(T('Çocuklarla karşılaştır: hiçbiri daha iyi değil, öbek özelliği sağlandı, dur.',
                       'Compare with the children: none is better, the heap property holds, stop.'),
                     { c: [11, 12, 13, 14, 15, 16], java: [11, 12, 13, 14, 15, 16] });
              cmp(null);
              break;
            }
            cmp(arr[tgt] + ' ' + LT + ' ' + arr[i] + ' → swap', 'hl');
            var tmp = arr[i]; arr[i] = arr[tgt]; arr[tgt] = tmp;
            sync([i, tgt]);
            S.step(T(tgt + '. indisteki çocuk daha iyi: yer değiştir (swap). Değer aşağı "batıyor" (sift-down).',
                     'The child at index ' + tgt + ' is better: swap. The value "sinks down" (sift-down).'),
                   { c: [18, 19, 20, 21], java: [18, 19, 20, 21] });
            i = tgt;
          }
          cmp(null);
        } else {
          arr[0] = arr[size - 1]; size--;
          siftDownAt(arr, size, 0, kind);
          sync();
          outputBox(best);
          S.step(T('`extract()`: kök (' + best + ') alınır, son eleman köke gelir, sift-down öbeği onarır. Kalan boyut: ' + size + '.',
                   '`extract()`: the root (' + best + ') is taken, the last element moves to the root, sift-down repairs the heap. Remaining size: ' + size + '.'),
                 { c: [3, 4, 5, 7, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21], java: [3, 4, 5, 7, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21] });
        }
      }
      sync();
      var remaining = arr.slice(0, size).sort(function (a, b) { return a - b; });
      S.result = { order: order, remaining: remaining };
      S.step(T('Bitti: çıkarılan sıra [' + order.join(', ') + ']; kalan ' + size + ' değer: [' + remaining.join(', ') + ']. Her `extract`, O(log n) sürer.',
               'Done: extraction order [' + order.join(', ') + ']; ' + size + ' values remain: [' + remaining.join(', ') + ']. Each `extract` costs O(log n).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
