/* Week 4 — priority queue built on an array heap: insert, peek, extract, and update-key (decrease/increase-key)
 * addressed by a stable id handle (the k-th insert always keeps id k, wherever it later moves in the array).
 * Tree (circle+arrow) and array are kept in sync; `below` shows each item's id. Data picks a min-heap or a
 * max-heap: {kind: 'min'|'max', ops: [...]} where an op is ['insert', value], ['peek'], ['extract'], or
 * ['update', id, newValue]. */
(function (D) {
  'use strict';
  var T = D.T;

  function less(kind, a, b) { return kind === 'max' ? a > b : a < b; }

  function makeCode(d) {
    var min = d.kind !== 'max', op = min ? '<' : '>';
    var c = [
      '/* Item = {id, key}; `better` decides this heap\'s order */',
      'static int better(Item a, Item b) { return a.key ' + op + ' b.key; }',
      '',
      'Item peek(void) { return heap[0]; }   /* caller must check size > 0 */',
      '',
      'void sift_up(int i) {',
      '    while (i > 0) {',
      '        int p = (i - 1) / 2;',
      '        if (!better(heap[i], heap[p])) break;',
      '        Item tmp = heap[p]; heap[p] = heap[i]; heap[i] = tmp;',
      '        i = p;',
      '    }',
      '}',
      '',
      'void sift_down(int i) {',
      '    while (1) {',
      '        int l = 2 * i + 1, r = 2 * i + 2, best = i;',
      '        if (l < size && better(heap[l], heap[best])) best = l;',
      '        if (r < size && better(heap[r], heap[best])) best = r;',
      '        if (best == i) break;',
      '        Item tmp = heap[i]; heap[i] = heap[best]; heap[best] = tmp;',
      '        i = best;',
      '    }',
      '}',
      '',
      'void insert(int id, int key) {',
      '    heap[size] = (Item){id, key};',
      '    sift_up(size);',
      '    size++;',
      '}',
      '',
      'Item extract(void) {              /* caller must check size > 0 */',
      '    Item best = heap[0];',
      '    size--;',
      '    heap[0] = heap[size];',
      '    sift_down(0);',
      '    return best;',
      '}',
      '',
      'void update_key(int id, int new_key) {',
      '    int i = find_by_id(id);       /* linear scan for the handle */',
      '    heap[i].key = new_key;',
      '    if (i > 0 && better(heap[i], heap[(i - 1) / 2]))',
      '        sift_up(i);',
      '    else',
      '        sift_down(i);',
      '}'
    ];
    var j = [
      '// Item = {id, key}; `better` decides this heap\'s order',
      'static boolean better(Item a, Item b) { return a.key ' + op + ' b.key; }',
      '',
      'Item peek() { return heap[0]; }       // caller must check size > 0',
      '',
      'void siftUp(int i) {',
      '    while (i > 0) {',
      '        int p = (i - 1) / 2;',
      '        if (!better(heap[i], heap[p])) break;',
      '        Item tmp = heap[p]; heap[p] = heap[i]; heap[i] = tmp;',
      '        i = p;',
      '    }',
      '}',
      '',
      'void siftDown(int i) {',
      '    while (true) {',
      '        int l = 2 * i + 1, r = 2 * i + 2, best = i;',
      '        if (l < size && better(heap[l], heap[best])) best = l;',
      '        if (r < size && better(heap[r], heap[best])) best = r;',
      '        if (best == i) break;',
      '        Item tmp = heap[i]; heap[i] = heap[best]; heap[best] = tmp;',
      '        i = best;',
      '    }',
      '}',
      '',
      'void insert(int id, int key) {',
      '    heap[size] = new Item(id, key);',
      '    siftUp(size);',
      '    size++;',
      '}',
      '',
      'Item extract() {                  // caller must check size > 0',
      '    Item best = heap[0];',
      '    size--;',
      '    heap[0] = heap[size];',
      '    siftDown(0);',
      '    return best;',
      '}',
      '',
      'void updateKey(int id, int newKey) {',
      '    int i = findById(id);         // linear scan for the handle',
      '    heap[i].key = newKey;',
      '    if (i > 0 && better(heap[i], heap[(i - 1) / 2]))',
      '        siftUp(i);',
      '    else',
      '        siftDown(i);',
      '}'
    ];
    return { c: c, java: j };
  }

  /** When several loop iterations (or several helper calls) are concatenated into one S.step, the same
   *  source line can be "run" in one part and "the side not taken" (skip) in another — the player
   *  highlights by line NUMBER for the whole step, so a line that really executed at least once must
   *  never also carry a skip mark. Drop the conflicting skip entries; the run occurrence still shows it. */
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
    id: 'priority-queue-ops',
    title: T('Öncelik kuyruğu: insert, peek, extract, update-key', 'Priority queue: insert, peek, extract, update-key'),
    code: makeCode,
    presets: [
      { id: 'normal', level: 'normal', name: T('Min-öncelik: 10 insert + peek + 2 extract + 1 update-key', 'Min-priority: 10 inserts + peek + 2 extracts + 1 update-key'),
        data: { kind: 'min', ops: [
          ['insert', 15], ['insert', 7], ['insert', 22], ['insert', 3], ['insert', 18], ['peek'],
          ['insert', 9], ['insert', 30], ['update', 3, 1], ['insert', 1], ['insert', 25], ['insert', 12],
          ['extract'], ['extract']
        ] } },
      { id: 'hard', level: 'hard', name: T('Max-öncelik: 14 insert, birçok karışık işlem', 'Max-priority: 14 inserts, many mixed operations'),
        data: { kind: 'max', ops: [
          ['insert', 40], ['insert', 11], ['insert', 27], ['peek'], ['extract'], ['insert', 8], ['insert', 33],
          ['update', 2, 60], ['insert', 16], ['insert', 45], ['extract'], ['insert', 2], ['insert', 19],
          ['insert', 37], ['update', 5, 1], ['insert', 24], ['insert', 6], ['insert', 50], ['peek'],
          ['insert', 29], ['insert', 3], ['extract']
        ] } },
      { id: 'underflow-first', level: 'edge', name: T('Boşken extract/peek, sonra 10 insert', 'Extract/peek while empty, then 10 inserts'),
        data: { kind: 'min', ops: [
          ['extract'], ['peek'],
          ['insert', 6], ['insert', 14], ['insert', 3], ['insert', 27], ['insert', 19], ['insert', 8],
          ['insert', 35], ['insert', 11], ['insert', 24], ['insert', 17], ['extract']
        ] } },
      { id: 'all-equal', level: 'edge', name: T('Hepsi eşit: değer 5, on kez, sonra 3 extract', 'All equal: value 5, ten times, then 3 extracts'),
        data: { kind: 'max', ops: [
          ['insert', 5], ['insert', 5], ['insert', 5], ['insert', 5], ['insert', 5],
          ['insert', 5], ['insert', 5], ['insert', 5], ['insert', 5], ['insert', 5],
          ['extract'], ['extract'], ['extract']
        ] } },
      { id: 'single', level: 'edge', name: T('Tek insert, extract, sonra boşken extract', 'A single insert, extract, then extract while empty'), small: true,
        data: { kind: 'min', ops: [['insert', 42], ['extract'], ['extract']] } },
      { id: 'update-gone', level: 'edge', name: T('Zaten çıkarılmış bir id\'yi update etmeye çalışmak', 'Trying to update-key an id that was already extracted'),
        data: { kind: 'min', ops: [
          ['insert', 10], ['insert', 20], ['insert', 30], ['insert', 40], ['insert', 50],
          ['insert', 60], ['insert', 70], ['insert', 80], ['insert', 90], ['insert', 100],
          ['extract'], ['extract'], ['update', 0, 5]
        ] } },
      { id: 'extreme', level: 'edge', name: T('Uç değerler ve update', 'Extreme values and an update'),
        data: { kind: 'min', ops: [
          ['insert', 2147483647], ['insert', -2147483648], ['insert', 0], ['insert', 1000000], ['insert', -1000000],
          ['insert', 5], ['insert', -5], ['update', 0, -2147483648], ['insert', 2147483646], ['insert', -2147483647], ['insert', 1], ['extract']
        ] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of inserted values — every example must have at least 10. */
    size: function (d) { return d.ops.filter(function (o) { return o[0] === 'insert'; }).length; },
    /** Independent computation: a plain unsorted list, scanned linearly — no heap involved at all. */
    reference: function (d) {
      var kind = d.kind, list = [], nextId = 0, peeked = [], extracted = [], underflows = 0;
      d.ops.forEach(function (op) {
        if (op[0] === 'insert') { list.push({ id: nextId++, key: op[1] }); return; }
        if (op[0] === 'peek') {
          if (!list.length) { underflows++; return; }
          var b = list[0];
          for (var i = 1; i < list.length; i++) if ((kind === 'max' ? list[i].key > b.key : list[i].key < b.key)) b = list[i];
          peeked.push(b.key);
          return;
        }
        if (op[0] === 'extract') {
          if (!list.length) { underflows++; return; }
          var bi = 0;
          for (var j = 1; j < list.length; j++) if ((kind === 'max' ? list[j].key > list[bi].key : list[j].key < list[bi].key)) bi = j;
          extracted.push(list[bi].key);
          list.splice(bi, 1);
          return;
        }
        if (op[0] === 'update') {
          for (var k = 0; k < list.length; k++) if (list[k].id === op[1]) { list[k].key = op[2]; break; }
        }
      });
      return { peeked: peeked, extracted: extracted, remaining: list.map(function (e) { return e.key; }).sort(function (a, b) { return a - b; }), underflows: underflows };
    },
    random: function (level, r) {
      var kind = r() < 0.5 ? 'min' : 'max';
      var inserts = { easy: 10, normal: 11, hard: 14, extreme: 16 }[level];
      var lo = level === 'extreme' ? -1000 : 1, hi = level === 'extreme' ? 1000 : 99;
      var ops = [], nextId = 0, alive = [];
      for (var i = 0; i < inserts; i++) {
        ops.push(['insert', D.randInt(r, lo, hi)]);
        alive.push(nextId++);
        if (r() < 0.3) ops.push(['peek']);
        if (i > 1 && r() < 0.3) { ops.push(['extract']); alive.shift(); }
        if (alive.length && r() < 0.2) ops.push(['update', alive[D.randInt(r, 0, alive.length - 1)], D.randInt(r, lo, hi)]);
      }
      ops.push(['extract']);
      return { kind: kind, ops: ops };
    },
    input: {
      hint: T('Örnek: kind=min 5 8 13 peek ext upd:2=1 21 9 4 7 15 3 12', 'Example: kind=min 5 8 13 peek ext upd:2=1 21 9 4 7 15 3 12'),
      parse: function (text) {
        var kind = 'min', ops = [], nextId = 0;
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mk = /^kind[=:](min|max)$/i.exec(tok);
          if (mk) { kind = mk[1].toLowerCase(); return; }
          if (/^peek$/i.test(tok)) { ops.push(['peek']); return; }
          if (/^(ext|extract|-)$/i.test(tok)) { ops.push(['extract']); return; }
          var mu = /^upd:(\d+)=(-?\d+)$/i.exec(tok);
          if (mu) { ops.push(['update', parseInt(mu[1], 10), parseInt(mu[2], 10)]); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, peek, ext, upd:id=değer ya da kind=min/max yazın.', '"' + tok + '" is not understood: write a number, peek, ext, upd:id=value, or kind=min/max.');
          ops.push(['insert', parseInt(tok, 10)]);
          nextId++;
        });
        if (!ops.length) throw T('En az bir işlem yazın.', 'Write at least one operation.');
        if (ops.length > 40) throw T('En çok 40 işlem.', 'At most 40 operations.');
        return { kind: kind, ops: ops };
      },
      format: function (d) {
        return 'kind=' + d.kind + '  ' + d.ops.map(function (o) {
          if (o[0] === 'insert') return String(o[1]);
          if (o[0] === 'peek') return 'peek';
          if (o[0] === 'extract') return 'ext';
          return 'upd:' + o[1] + '=' + o[2];
        }).join(' ');
      },
      tokens: function (d) {
        return d.ops.map(function (o) {
          if (o[0] === 'insert') return String(o[1]);
          if (o[0] === 'peek') return 'peek';
          if (o[0] === 'extract') return 'ext';
          return 'upd:' + o[1] + '=' + o[2];
        });
      },
      bad: ['', 'kind=mid 5 8', '5 x 7', '3.5 8', 'upd:x=5 5 8']
    },
    build: function (S, d) {
      var kind = d.kind, ops = d.ops;
      var maxN = ops.filter(function (o) { return o[0] === 'insert'; }).length;
      var CX = 400, TOPY = 50, LEVELY = 78, TOTALW = Math.max(360, 60 * maxN);
      var pos = heapPositions(maxN, CX, TOPY, LEVELY, TOTALW);
      var ARRY = TOPY + (Math.floor(Math.log(Math.max(maxN, 1)) / Math.LN2) + 1) * LEVELY + 70, DX = 56;
      var X0 = CX - (maxN - 1) * DX / 2;
      var heap = [], nextId = 0;

      function sync(hi) {
        for (var i = 0; i < maxN; i++) {
          var nid = 'n' + i, bid = 'b' + i, eid = 'e' + i;
          if (i < heap.length) {
            var st = hi && hi.indexOf(i) >= 0 ? 'hl' : 'normal';
            var txt = String(heap[i].key), sub = '#' + heap[i].id;
            if (S.has(nid)) { S.set(nid, { text: txt, below: sub, style: st }); S.set(bid, { text: txt, below: sub, style: st }); }
            else {
              S.circle(nid, { x: pos[i][0], y: pos[i][1], text: txt, below: sub, style: st, r: 22 });
              S.box(bid, { x: X0 + i * DX, y: ARRY, w: DX - 6, h: 40, text: txt, below: sub, style: st, size: 15, above: String(i) });
            }
            if (i > 0 && !S.has(eid)) S.arrow(eid, { from: 'n' + Math.floor((i - 1) / 2), to: nid, kind: 'center' });
          } else {
            if (S.has(nid)) S.remove(nid);
            if (S.has(bid)) S.remove(bid);
            if (S.has(eid)) S.remove(eid);
          }
        }
        var info = heap.length ? T('boyut = ' + heap.length, 'size = ' + heap.length) : T('öncelik kuyruğu boş', 'the priority queue is empty');
        if (S.has('info')) S.set('info', { text: info }); else S.label('info', { x: CX, y: TOPY - 24, text: info, style: 'dim', size: 15 });
        /* Level labels only for levels the CURRENT heap actually occupies — it both grows (insert) and
         * shrinks (extract), so a static label would either lag behind or leave a leftover d=k label. */
        var curMaxLevel = heap.length > 0 ? Math.floor(Math.log(heap.length) / Math.LN2) : -1;
        for (var lv = 0; lv <= maxDlvl; lv++) {
          var firstAt = Math.pow(2, lv) - 1, lid = 'dlvl' + lv;
          if (lv <= curMaxLevel && firstAt < maxN) {
            if (!S.has(lid)) S.label(lid, { x: pos[firstAt][0] - 46, y: pos[firstAt][1] + 5, text: 'd=' + lv, anchor: 'end', size: 14, mono: true, style: 'dim' });
          } else if (S.has(lid)) S.remove(lid);
        }
      }
      function cmp(text, style) { if (text === null) { if (S.has('cmp')) S.remove('cmp'); return; } if (S.has('cmp')) S.set('cmp', { text: text, style: style }); else S.label('cmp', { x: X0 + maxN * DX + 4, y: ARRY + 5, text: text, anchor: 'start', size: 15, mono: true, bold: true, style: style }); }
      var LT = kind === 'max' ? '>' : '<', GE = kind === 'max' ? '≤' : '≥';
      var exCount = 0;
      function outputExtract(val, id) {
        if (exCount > 0) S.set('ex' + (exCount - 1), { style: 'normal' });
        S.box('ex' + exCount, { x: X0 + exCount * DX, y: ARRY + 62, w: DX - 6, h: 36, text: String(val), below: '#' + id, style: 'hl', size: 15 });
        exCount++;
      }

      /** `sift_up`'s one-iteration code-panel lines: 8 (`p = (i-1)/2;`), 9 (the `if (!better(...)) break;`
       *  — the break is embedded in the condition line itself, so a note on the comparison is enough;
       *  when we DON'T break, lines 10-11 (swap, `i = p;`) run; when we DO break, they never run this
       *  iteration and are marked skip. */
      function siftUpIterLines(i, p, must) {
        var loopNote = { n: 7, note: T('i > 0? evet', 'i > 0? yes') };
        var note = must ? T('better(heap[i], heap[p])? evet', 'better(heap[i], heap[p])? yes') : T('better(heap[i], heap[p])? hayır', 'better(heap[i], heap[p])? no');
        if (must) return [loopNote, 8, { n: 9, note: note }, 10, 11];
        return [loopNote, 8, { n: 9, note: note }, { n: 10, skip: true }, { n: 11, skip: true }];
      }
      function siftUp(i, detailed) {
        while (i > 0) {
          var p = Math.floor((i - 1) / 2);
          var must = less(kind, heap[i].key, heap[p].key);
          var lines = siftUpIterLines(i, p, must);
          if (detailed) {
            sync([i, p]);
            if (!must) { cmp('stop: ' + heap[i].key + ' ' + GE + ' ' + heap[p].key, 'dim'); S.step(T('Ebeveynle karşılaştır: öbek özelliği zaten sağlanıyor, dur.', 'Compare with the parent: the heap property already holds, stop.'), { c: lines, java: lines }); cmp(null); break; }
            cmp(heap[i].key + ' ' + LT + ' ' + heap[p].key + ' → swap', 'hl');
          } else if (!must) break;
          var tmp = heap[i]; heap[i] = heap[p]; heap[p] = tmp;
          if (detailed) { sync([i, p]); S.step(T('Yer değiştir (swap): değer yukarı yüzüyor (sift-up).', 'Swap: the value floats up (sift-up).'), { c: lines, java: lines }); cmp(null); }
          i = p;
        }
      }
      /** Runs the whole sift-up (mutating `heap`) and returns every code-panel line that really executed,
       *  in order — used for the fast, lumped steps (see the heap-insert-sift-up.js file for the same
       *  pattern). dedupeSkip resolves the case where an early iteration's "not taken" line (e.g. 10-11,
       *  skipped because we swapped) coincides with a later iteration where that same line really runs. */
      function siftUpTrace(startI) {
        var lines = [], i = startI;
        while (i > 0) {
          var p = Math.floor((i - 1) / 2);
          var must = less(kind, heap[i].key, heap[p].key);
          lines = lines.concat(siftUpIterLines(i, p, must));
          if (!must) return dedupeSkip(lines);
          var tmp = heap[i]; heap[i] = heap[p]; heap[p] = tmp;
          i = p;
        }
        return dedupeSkip(lines);
      }
      /** `sift_down`'s one-iteration code-panel lines: 17 (compute `l, r, best`), 18 and 19 (each a
       *  single-line `if (... ) best = l/r;` — decision and action fused, so a note on the comparison is
       *  enough, there is no separate "action" line to mark skip), 20 (`if (best == i) break;`, likewise
       *  fused). When we DON'T break, lines 21-22 (swap, `i = best;`) run; when we DO, they are skipped. */
      function siftDownIterLines(l, r, best, i, leftExists, leftBetter, rightExists, rightBetter, stop) {
        var lines = [{ n: 16, note: T('while(1): her zaman gir, break ile çık', 'while(1): always enter, exit via break') }, 17];
        lines.push({ n: 18, note: !leftExists ? T('sol çocuk yok', 'no left child') : (leftBetter ? T('better(heap[l], heap[best])? evet', 'better(heap[l], heap[best])? yes') : T('better(heap[l], heap[best])? hayır', 'better(heap[l], heap[best])? no')) });
        lines.push({ n: 19, note: !rightExists ? T('sağ çocuk yok', 'no right child') : (rightBetter ? T('better(heap[r], heap[best])? evet', 'better(heap[r], heap[best])? yes') : T('better(heap[r], heap[best])? hayır', 'better(heap[r], heap[best])? no')) });
        lines.push({ n: 20, note: stop ? T('best == i? evet', 'best == i? yes') : T('best == i? hayır', 'best == i? no') });
        if (stop) lines.push({ n: 21, skip: true }, { n: 22, skip: true });
        else lines.push(21, 22);
        return lines;
      }
      /** Evaluates one sift-down iteration at index `i` (reads current `heap`, does not mutate) and
       *  returns both its code-panel lines and the resulting `best`/`stop`. */
      function siftDownIter(i) {
        var l = 2 * i + 1, r = 2 * i + 2, best = i;
        var leftExists = l < heap.length, leftBetter = leftExists && less(kind, heap[l].key, heap[best].key);
        if (leftBetter) best = l;
        var rightExists = r < heap.length, rightBetter = rightExists && less(kind, heap[r].key, heap[best].key);
        if (rightBetter) best = r;
        var stop = best === i;
        return { lines: siftDownIterLines(l, r, best, i, leftExists, leftBetter, rightExists, rightBetter, stop), best: best, stop: stop };
      }
      function siftDown(i, detailed) {
        while (true) {
          var it = siftDownIter(i);
          if (it.stop) { if (detailed) { sync([i]); cmp('stop: ' + heap[i].key + ' ' + GE + ' children', 'dim'); S.step(T('Çocuklarla karşılaştır: hiçbiri daha iyi değil, dur.', 'Compare with the children: none is better, stop.'), { c: it.lines, java: it.lines }); cmp(null); } break; }
          if (detailed) cmp(heap[it.best].key + ' ' + LT + ' ' + heap[i].key + ' → swap', 'hl');
          var tmp = heap[i]; heap[i] = heap[it.best]; heap[it.best] = tmp;
          if (detailed) { sync([i, it.best]); S.step(T('Yer değiştir (swap): değer aşağı batıyor (sift-down).', 'Swap: the value sinks down (sift-down).'), { c: it.lines, java: it.lines }); cmp(null); }
          i = it.best;
        }
      }
      /** Runs the whole sift-down (mutating `heap`) and returns every code-panel line that really
       *  executed, in order — used for the fast, lumped steps. */
      function siftDownTrace(startI) {
        var lines = [], i = startI;
        while (true) {
          var it = siftDownIter(i);
          lines = lines.concat(it.lines);
          if (it.stop) return dedupeSkip(lines);
          var tmp = heap[i]; heap[i] = heap[it.best]; heap[it.best] = tmp;
          i = it.best;
        }
      }

      var maxDlvl = maxN > 0 ? Math.floor(Math.log(Math.max(maxN, 1)) / Math.LN2) : 0;
      sync();
      S.label('arrlbl', { x: X0 - 14, y: ARRY + 5, text: 'heap[] =', anchor: 'end', size: 15, mono: true, style: 'dim' });
      S.label('exlbl', { x: X0 - 14, y: ARRY + 67, text: T('çıkarılan =', 'extracted ='), anchor: 'end', size: 15, mono: true, style: 'dim' });
      S.step(T('Bir öncelik kuyruğu, öbek üzerine kurulur: `insert`, `peek`, `extract` ve `update-key` (decrease/increase-key) sağlar. Her elemanın kalıcı bir `id`\'si var; öbek içinde yeri değişse de `id` aynı kalır.',
               'A priority queue is built on a heap: it offers `insert`, `peek`, `extract`, and `update-key` (decrease/increase-key). Every element gets a permanent `id`; it may move inside the heap, but the `id` never changes.'));

      var peeked = [], extracted = [], underflows = 0, insDone = 0, extDone = 0, updDone = 0;
      ops.forEach(function (op, k) {
        S.at(k);
        if (op[0] === 'insert') {
          var id = nextId++, val = op[1];
          insDone++;
          heap.push({ id: id, key: val });
          var i = heap.length - 1;
          var detailed = insDone === 1;
          sync([i]);
          if (detailed) {
            S.step(T('`insert(id=' + id + ', ' + val + ')`: boş hücreye yazılır (indis ' + i + '), sonra `sift_up` çağrılır.', '`insert(id=' + id + ', ' + val + ')`: placed in the free slot, index ' + i + ', then `sift_up` is called.'), { c: [27, 28], java: [27, 28] });
            siftUp(i, detailed);
          } else {
            /* `sift_up(size)` (28) is a call into the separate `sift_up` helper: the call line, then the
             * callee's own traced lines, then the line after the call (29, `size++`). siftUpTrace already
             * performs the real swaps (mutates `heap`), so it is called instead of siftUp here, not as
             * well as it. */
            var trace = siftUpTrace(i);
            sync();
            var lines = [27, 28].concat(trace).concat([29]);
            S.step(T('`insert(id=' + id + ', ' + val + ')`.', '`insert(id=' + id + ', ' + val + ')`.'), { c: lines, java: lines });
          }
          return;
        }
        if (op[0] === 'peek') {
          if (!heap.length) {
            underflows++;
            S.step(T('`peek()`: kuyruk boş → alttan taşma, `NULL` benzeri bir işaret döner (çağıran taraf `size > 0` denetimini `peek()`\'i çağırmadan ÖNCE yapar, bu kod parçasında görünmez).', '`peek()`: the queue is empty → underflow, a null-like signal is returned (the caller checks `size > 0` BEFORE calling `peek()`, so that guard is not visible in this code excerpt).'));
            return;
          }
          peeked.push(heap[0].key);
          sync([0]);
          S.step(T('`peek()` → ' + heap[0].key + ' (id=' + heap[0].id + '): kökü okur, hiçbir şeyi değiştirmez.', '`peek()` → ' + heap[0].key + ' (id=' + heap[0].id + '): reads the root, changes nothing.'), { c: [4], java: [4] });
          return;
        }
        if (op[0] === 'extract') {
          if (!heap.length) {
            underflows++;
            sync();
            S.step(T('`extract()`: kuyruk boş → alttan taşma. Program çökmez.', '`extract()`: the queue is empty → underflow. The program does not crash.'));
            return;
          }
          extDone++;
          var best = heap[0].key, bestId = heap[0].id;
          extracted.push(best);
          heap[0] = heap[heap.length - 1]; heap.pop();
          var detailedE = extDone === 1;
          if (heap.length) {
            if (detailedE) {
              sync([0]);
              S.step(T('`extract()`: kök (' + best + ', id=' + bestId + ') sonuç olarak kaydedilir; son eleman köke taşınır, sonra `sift_down` çağrılır.', '`extract()`: the root (' + best + ', id=' + bestId + ') is saved as the result; the last element moves to the root, then `sift_down` is called.'), { c: [33, 34, 35], java: [33, 34, 35] });
              siftDown(0, detailedE);
              outputExtract(best, bestId);
            } else {
              /* `sift_down(0)` (36) is a call into the separate `sift_down` helper: the call line, then
               * the callee's own traced lines, then the line after the call (37, `return best;`). */
              var trace2 = siftDownTrace(0);
              outputExtract(best, bestId);
              sync();
              var lines2 = [33, 34, 35, 36].concat(trace2).concat([37]);
              S.step(T('`extract()` → ' + best + ' (id=' + bestId + '); sift-down öbeği onarır.', '`extract()` → ' + best + ' (id=' + bestId + '); sift-down repairs the heap.'), { c: lines2, java: lines2 });
            }
          } else {
            /* size is now 0: `sift_down(0)` (36) is still called exactly as always — with no children to
             * compare (both `l < size` and `r < size` are false), it immediately finds `best == i` and
             * returns right away. Traced (trivially) for the same reason as the branch above. */
            var trace3 = siftDownTrace(0);
            outputExtract(best, bestId);
            sync();
            var lines3 = [33, 34, 35, 36].concat(trace3).concat([37]);
            S.step(T('`extract()` → ' + best + ' (id=' + bestId + '); kuyruk şimdi boş.', '`extract()` → ' + best + ' (id=' + bestId + '); the queue is now empty.'), { c: lines3, java: lines3 });
          }
          return;
        }
        // update
        var targetId = op[1], newKey = op[2];
        var idx = -1;
        for (var q = 0; q < heap.length; q++) if (heap[q].id === targetId) { idx = q; break; }
        if (idx === -1) {
          S.step(T('`update_key(id=' + targetId + ', ' + newKey + ')`: bu id artık kuyrukta yok (daha önce çıkarılmış) → görmezden gelinir.', '`update_key(id=' + targetId + ', ' + newKey + ')`: that id is no longer in the queue (already extracted) → ignored.'), { c: [41], java: [41] });
          return;
        }
        updDone++;
        var oldKey = heap[idx].key;
        heap[idx].key = newKey;
        var detailedU = updDone === 1;
        var dirWord = newKey < oldKey ? T('küçültme (decrease-key)', 'a decrease-key') : (newKey > oldKey ? T('büyütme (increase-key)', 'an increase-key') : T('değişiklik yok', 'no change'));
        sync([idx]);
        if (detailedU) S.step(T('`update_key(id=' + targetId + ', ' + newKey + ')`: ' + oldKey + ' → ' + newKey + ' (' + dirWord.tr + ').', '`update_key(id=' + targetId + ', ' + newKey + ')`: ' + oldKey + ' → ' + newKey + ' (' + dirWord.en + ').'), { c: [41, 42], java: [41, 42] });
        var parent = idx > 0 ? Math.floor((idx - 1) / 2) : -1;
        var goUp = idx > 0 && less(kind, heap[idx].key, heap[parent].key);
        /* Line 43 (`if (i > 0 && better(heap[i], heap[(i-1)/2]))`) decides between the two helper calls on
         * 44 (`sift_up`) and 46 (`sift_down`) — an if/else, so exactly one of the two call lines is taken
         * and the other is marked skip; the decision line itself always gets a note. */
        var decNote = idx === 0 ? T('i > 0? hayır (kök)', 'i > 0? no (root)')
          : (goUp ? T('i > 0 && better(...)? evet', 'i > 0 && better(...)? yes') : T('i > 0 && better(...)? hayır', 'i > 0 && better(...)? no'));
        var decisionLines = goUp ? [{ n: 43, note: decNote }, 44, { n: 46, skip: true }] : [{ n: 43, note: decNote }, { n: 44, skip: true }, 46];
        if (detailedU) {
          S.step(T('`update_key`: karar — yukarı mı yoksa aşağı mı süzülür (sift-up/sift-down)?', '`update_key`: decide — sift up or sift down?'), { c: decisionLines, java: decisionLines });
          if (goUp) siftUp(idx, true); else siftDown(idx, true);
        } else {
          /* Whichever of `sift_up`/`sift_down` is called (44 or 46) is a call into that helper: the call
           * line (already in decisionLines), then the callee's own traced lines. */
          var traceU = goUp ? siftUpTrace(idx) : siftDownTrace(idx);
          sync();
          var linesU = [40, 41, 42].concat(decisionLines).concat(traceU);
          S.step(T('`update_key(id=' + targetId + ', ' + newKey + ')`: ' + oldKey + ' → ' + newKey + ', öbek yeniden düzenlenir.', '`update_key(id=' + targetId + ', ' + newKey + ')`: ' + oldKey + ' → ' + newKey + ', the heap re-settles.'), { c: linesU, java: linesU });
        }
      });
      sync();
      var remaining = heap.map(function (e) { return e.key; }).sort(function (a, b) { return a - b; });
      S.result = { peeked: peeked, extracted: extracted, remaining: remaining, underflows: underflows };
      S.step(T('Bitti: ' + insDone + ' insert, ' + extDone + ' extract, ' + updDone + ' update-key' + (underflows ? ', ' + underflows + ' alttan taşma' : '') + '. Kalan ' + heap.length + ' eleman: [' + remaining.join(', ') + ']. Her işlem O(log n) (peek O(1)); `update_key`\'deki doğrusal id taraması O(n) — gerçek uygulamalarda bir id→indis tablosuyla O(log n)\'e indirilir.',
               'Done: ' + insDone + ' inserts, ' + extDone + ' extracts, ' + updDone + ' update-keys' + (underflows ? ', ' + underflows + ' underflow' + (underflows > 1 ? 's' : '') : '') + '. ' + heap.length + ' elements remain: [' + remaining.join(', ') + ']. Every operation is O(log n) (peek is O(1)); the linear id scan inside `update_key` is O(n) — real implementations cut it to O(log n) with an id-to-index table.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
