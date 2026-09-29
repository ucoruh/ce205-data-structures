/* Week 14 -- external merge sort: Pass 0 sorts RUN_SIZE-record chunks in RAM and writes them out as sorted
   RUNS; later passes k-way MERGE up to FAN_IN runs at a time using one small RAM buffer per run, until a
   single sorted run remains. */
(function (D) {
  'use strict';
  var T = D.T;

  function cCode(runSize, fanIn) {
    return [
      '#define RUN_SIZE ' + runSize + '                  /* records that fit in RAM for sorting a run */',
      '#define FAN_IN ' + fanIn + '                     /* runs merged together in one pass */',
      '',
      'int create_runs(int input[], int n, Run runs[]) {',
      '    int r = 0;',
      '    for (int i = 0; i < n; i += RUN_SIZE) {',
      '        int len = min(RUN_SIZE, n - i);',
      '        sort_in_memory(input + i, len);         /* RAM holds RUN_SIZE records: free */',
      '        write_run(&runs[r++], input + i, len);   /* +1 write */',
      '    }',
      '    return r;',
      '}',
      '',
      'Run merge_group(Run group[], int g) {             /* g <= FAN_IN sorted runs -> one longer run */',
      '    int ptr[FAN_IN] = {0};',
      '    Run out = new_run();',
      '    while (1) {',
      '        int best = -1, best_val = INT_MAX;',
      '        for (int i = 0; i < g; i++)',
      '            if (ptr[i] < group[i].n && group[i].keys[ptr[i]] < best_val) { best_val = group[i].keys[ptr[i]]; best = i; }',
      '        if (best == -1) break;                    /* every buffer is exhausted */',
      '        append(&out, best_val);',
      '        ptr[best]++;',
      '    }',
      '    return out;',
      '}',
      '',
      'void external_merge_sort(int input[], int n) {',
      '    Run runs[MAX_RUNS];',
      '    int num_runs = create_runs(input, n, runs);',
      '    while (num_runs > 1)                          /* one more PASS */',
      '        num_runs = merge_pass(runs, num_runs);     /* groups of FAN_IN runs -> merge_group each */',
      '}'
    ];
  }
  function javaCode(runSize, fanIn) {
    return [
      'static final int RUN_SIZE = ' + runSize + ';       // records that fit in RAM for sorting a run',
      'static final int FAN_IN = ' + fanIn + ';          // runs merged together in one pass',
      '',
      'static int createRuns(int[] input, Run[] runs) {',
      '    int r = 0;',
      '    for (int i = 0; i < input.length; i += RUN_SIZE) {',
      '        int len = Math.min(RUN_SIZE, input.length - i);',
      '        sortInMemory(input, i, len);              // RAM holds RUN_SIZE records: free',
      '        runs[r++] = writeRun(input, i, len);        // +1 write',
      '    }',
      '    return r;',
      '}',
      '',
      'static Run mergeGroup(Run[] group, int g) {         // g <= FAN_IN sorted runs -> one longer run',
      '    int[] ptr = new int[FAN_IN];',
      '    Run out = new Run();',
      '    while (true) {',
      '        int best = -1, bestVal = Integer.MAX_VALUE;',
      '        for (int i = 0; i < g; i++)',
      '            if (ptr[i] < group[i].n && group[i].keys[ptr[i]] < bestVal) { bestVal = group[i].keys[ptr[i]]; best = i; }',
      '        if (best == -1) break;                      // every buffer is exhausted',
      '        out.append(bestVal);',
      '        ptr[best]++;',
      '    }',
      '    return out;',
      '}',
      '',
      'static void externalMergeSort(int[] input) {',
      '    Run[] runs = new Run[MAX_RUNS];',
      '    int numRuns = createRuns(input, runs);',
      '    while (numRuns > 1)                             // one more PASS',
      '        numRuns = mergePass(runs, numRuns);           // groups of FAN_IN runs -> mergeGroup each',
      '}'
    ];
  }

  function mergeArrays(group) {
    var ptr = group.map(function () { return 0; }), out = [];
    while (true) {
      var best = -1, bestVal = Infinity;
      for (var i = 0; i < group.length; i++) if (ptr[i] < group[i].length && group[i][ptr[i]] < bestVal) { bestVal = group[i][ptr[i]]; best = i; }
      if (best === -1) break;
      out.push(bestVal); ptr[best]++;
    }
    return out;
  }

  D.define({
    id: 'external-merge-sort',
    title: T('Dış birleştirmeli sıralama (external merge sort)', 'External merge sort'),
    code: function (d) { return { c: cCode(d.runSize, d.fanIn), java: javaCode(d.runSize, d.fanIn) }; },
    presets: [
      { id: 'normal', level: 'normal', name: T('12 değer, RUN_SIZE=4, FAN_IN=2', '12 values, RUN_SIZE=4, FAN_IN=2'),
        data: { keys: [40, 11, 27, 8, 33, 2, 45, 16, 38, 23, 5, 30], runSize: 4, fanIn: 2 } },
      { id: 'hard', level: 'hard', name: T('14 değer, RUN_SIZE=3, FAN_IN=3', '14 values, RUN_SIZE=3, FAN_IN=3'),
        data: { keys: [55, 12, 40, 3, 28, 61, 9, 47, 20, 34, 6, 52, 17, 44], runSize: 3, fanIn: 3 } },
      { id: 'one-run', level: 'edge', name: T('Uç durum: RUN_SIZE >= n, tek geçişte biter (birleştirme yok)', 'Edge case: RUN_SIZE >= n, done in one pass (no merging)'),
        data: { keys: [9, 3, 7, 1, 8, 2, 6, 4, 10, 5], runSize: 12, fanIn: 2 } },
      { id: 'tiny-runs', level: 'edge', name: T('Uç durum: RUN_SIZE=1 (her değer kendi çalışması), çok geçiş', 'Edge case: RUN_SIZE=1 (every value is its own run), many passes'),
        data: { keys: [9, 3, 7, 1, 8, 2, 6, 4, 10, 5], runSize: 1, fanIn: 2 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      var keys = d.keys, runSize = d.runSize, fanIn = d.fanIn;
      var reads = 0, writes = 0;
      var runs = [];
      for (var i = 0; i < keys.length; i += runSize) { var chunk = keys.slice(i, i + runSize).sort(function (a, b) { return a - b; }); reads++; writes++; runs.push(chunk); }
      var runsCreated = runs.length, passes = 0;
      function merge(group) {
        var ptr = group.map(function () { return 0; }), out = [];
        while (true) {
          var best = -1, bestVal = Infinity;
          for (var i = 0; i < group.length; i++) if (ptr[i] < group[i].length && group[i][ptr[i]] < bestVal) { bestVal = group[i][ptr[i]]; best = i; }
          if (best === -1) break;
          out.push(bestVal); ptr[best]++;
        }
        return out;
      }
      while (runs.length > 1) {
        passes++;
        var next = [];
        for (var g = 0; g < runs.length; g += fanIn) {
          var group = runs.slice(g, g + fanIn);
          if (group.length === 1) { next.push(group[0]); continue; }
          reads += group.length;
          next.push(merge(group));
          writes++;
        }
        runs = next;
      }
      return { sorted: keys.slice().sort(function (a, b) { return a - b; }), runsCreated: runsCreated, passes: passes, reads: reads, writes: writes };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level] || 12;
      var runSize = level === 'extreme' ? 2 : D.randInt(r, 2, 4);
      var fanIn = D.randInt(r, 2, 3);
      var used = {}, keys = [];
      while (keys.length < n) { var v = D.randInt(r, 1, 99); if (!used[v]) { used[v] = true; keys.push(v); } }
      return { keys: keys, runSize: runSize, fanIn: fanIn };
    },
    input: {
      hint: T('Örnek: runSize=4 fanIn=2 keys: 40,11,27,8,33,2,45,16,38,23,5,30', 'Example: runSize=4 fanIn=2 keys: 40,11,27,8,33,2,45,16,38,23,5,30'),
      parse: function (text) {
        var runSize = 4, fanIn = 2, keys = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m1 = /^runsize[=:](\d+)$/i.exec(tok); if (m1) { runSize = parseInt(m1[1], 10); return; }
          var m2 = /^fanin[=:](\d+)$/i.exec(tok); if (m2) { fanIn = parseInt(m2[1], 10); return; }
          if (/^keys?:?$/i.test(tok)) return;
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, runSize=N, fanIn=N ya da keys yazın.', '"' + tok + '" is not understood: write a number, runSize=N, fanIn=N or keys.');
          keys.push(parseInt(tok, 10));
        });
        if (runSize < 1 || runSize > 16) throw T('runSize 1 ile 16 arasında olmalı.', 'runSize must be between 1 and 16.');
        if (fanIn < 2 || fanIn > 6) throw T('fanIn 2 ile 6 arasında olmalı.', 'fanIn must be between 2 and 6.');
        if (keys.length < 10) throw T('En az 10 değer yazın.', 'Write at least 10 values.');
        return { keys: keys, runSize: runSize, fanIn: fanIn };
      },
      format: function (d) { return 'runSize=' + d.runSize + ' fanIn=' + d.fanIn + ' keys: ' + d.keys.join(','); },
      bad: ['', 'runSize=0 keys: 1,2,3,4,5,6,7,8,9,10', 'keys: 1,2,3,4,5,6,7,8,9', 'fanIn=1 keys: 1,2,3,4,5,6,7,8,9,10',
            'runSize=abc keys: 1,2,3,4,5,6,7,8,9,10', 'keys: 1,x,3,4,5,6,7,8,9,10'],
      tokens: function (d) { return d.keys.map(String); }
    },
    build: function (S, d) {
      var keys = d.keys, runSize = d.runSize, fanIn = d.fanIn;
      var reads = 0, writes = 0;

      S.label('title', { x: 20, y: 20, text: 'RUN_SIZE = ' + runSize + '   FAN_IN = ' + fanIn, size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('io', { x: 20, y: 44, text: T('okuma: 0  yazma: 0', 'reads: 0  writes: 0'), size: 14, bold: true, mono: true, anchor: 'start' });
      function setIO() { S.set('io', { text: T('okuma: ' + reads + '  yazma: ' + writes, 'reads: ' + reads + '  writes: ' + writes) }); }

      var X0 = 90, BW = 92, BGAP = 18, ROWH = 76, Y0 = 172;
      var rowIds = [];
      function drawRow(rowIdx, boxes, label) {
        var y = Y0 + rowIdx * ROWH, ids = [];
        S.label('rl' + rowIdx, { x: X0 - 16, y: y + 20, text: label, anchor: 'end', size: 13, bold: true, style: 'dim' });
        boxes.forEach(function (b, i) {
          var id = 'r' + rowIdx + '_' + i;
          S.box(id, { x: X0 + i * (BW + BGAP), y: y, w: BW, h: 40, text: b.join(','), style: 'normal', size: 12 });
          ids.push(id);
        });
        rowIds[rowIdx] = ids;
      }

      S.label('inlbl', { x: X0 - 16, y: Y0 - ROWH + 20, text: T('sırasız girdi =', 'unsorted input ='), anchor: 'end', size: 13, bold: true, style: 'dim' });
      S.box('input0', { x: X0, y: Y0 - ROWH, w: Math.min(600, keys.length * 34 + 20), h: 40, text: keys.join(','), style: 'normal', size: 12 });
      S.step(T('`' + keys.length + '` değerlik sırasız girdi, RAM\'e sığmayacak kadar büyük varsayılıyor. `RUN_SIZE=' + runSize + '` parçalarla işleyeceğiz.',
               'An unsorted input of `' + keys.length + '` values, assumed too big for RAM. We will process it in `RUN_SIZE=' + runSize + '` chunks.'),
             { c: [1], java: [1] });

      var runs = [];
      for (var i = 0; i < keys.length; i += runSize) {
        var chunk = keys.slice(i, i + runSize).slice().sort(function (a, b) { return a - b; });
        reads++; writes++; runs.push(chunk);
      }
      setIO();
      drawRow(0, runs, T('geçiş 0 (çalışmalar) =', 'pass 0 (runs) ='));
      S.step(T('Faz 1: her `RUN_SIZE=' + runSize + '` değer RAM\'e okunur (+1 okuma), bellekte sıralanır (ücretsiz), sıralı bir ÇALIŞMA (run) olarak diske yazılır (+1 yazma). ' + runs.length + ' çalışma oluştu.',
               'Phase 1: every `RUN_SIZE=' + runSize + '` values are read into RAM (+1 read), sorted in memory (free), and written back as a sorted RUN (+1 write). ' + runs.length + ' runs were created.'),
             { c: [4, 5, { n: 6, note: T('i: 0..' + (keys.length - 1) + ' adım ' + runSize, 'i: 0..' + (keys.length - 1) + ' step ' + runSize) }, 7, 8, 9],
               java: [4, 5, { n: 6, note: T('i: 0..' + (keys.length - 1) + ' adım ' + runSize, 'i: 0..' + (keys.length - 1) + ' step ' + runSize) }, 7, 8, 9] });

      var passNum = 0, firstMergeDone = false;
      while (runs.length > 1) {
        passNum++;
        var next = [];
        for (var g = 0; g < runs.length; g += fanIn) {
          var group = runs.slice(g, g + fanIn);
          if (group.length === 1) { next.push(group[0]); continue; }
          if (!firstMergeDone) {
            firstMergeDone = true;
            var BY = Y0 + passNum * ROWH - 34;
            group.forEach(function (run, gi) { S.box('buf' + gi, { x: X0 + gi * (BW + BGAP), y: BY, w: BW, h: 36, text: run.join(','), style: 'normal', size: 12, above: T('arabellek ' + gi, 'buffer ' + gi) }); });
            S.box('outbuf', { x: X0 + group.length * (BW + BGAP) + 20, y: BY, w: BW + 40, h: 36, text: '', style: 'new', size: 12, above: T('çıktı', 'output') });
            S.step(T('Geçiş ' + passNum + ', ilk birleştirme: `FAN_IN=' + fanIn + '` çalışmadan her biri için TEK bir küçük RAM arabelleği ayrılır -- şu anda arabelleğin önündeki (en küçük kalan) değer görünür.',
                     'Pass ' + passNum + ', first merge: ONE small RAM buffer per one of the `FAN_IN=' + fanIn + '` runs -- each buffer currently shows its front (smallest remaining) value.'),
                   { c: [14, 15, 16], java: [14, 15, 16] });
            var ptr = group.map(function () { return 0; }), out = [];
            while (true) {
              var best = -1, bestVal = Infinity;
              for (var bi = 0; bi < group.length; bi++) if (ptr[bi] < group[bi].length && group[bi][ptr[bi]] < bestVal) { bestVal = group[bi][ptr[bi]]; best = bi; }
              if (best === -1) {
                S.step(T('Bütün arabellekler boş: birleştirme bitti.', 'All buffers are empty: the merge is done.'),
                       { c: [{ n: 21, note: T('best==-1 mi? evet', 'best==-1? yes') }], java: [{ n: 21, note: T('best==-1 mi? evet', 'best==-1? yes') }] });
                break;
              }
              group.forEach(function (_, bi2) { S.set('buf' + bi2, { style: bi2 === best ? 'hl' : 'normal' }); });
              out.push(bestVal); ptr[best]++;
              S.set('buf' + best, { text: group[best].slice(ptr[best]).join(',') || T('(boş)', '(empty)') });
              S.set('outbuf', { text: out.join(',') });
              S.step(T('Arabellek önleri karşılaştırılır; en küçüğü `' + bestVal + '` (arabellek ' + best + '\'ten) çıktıya eklenir, o arabellek ilerletilir.',
                       'Compare the buffer fronts; the smallest, `' + bestVal + '` (from buffer ' + best + '), is appended to the output and that buffer advances.'),
                     { c: [18, { n: 19, note: T('i: 0..' + (group.length - 1), 'i: 0..' + (group.length - 1)) },
                            { n: 20, note: T('en küçük = arabellek ' + best, 'smallest = buffer ' + best) }, 22, 23],
                       java: [18, { n: 19, note: T('i: 0..' + (group.length - 1), 'i: 0..' + (group.length - 1)) },
                              { n: 20, note: T('en küçük = arabellek ' + best, 'smallest = buffer ' + best) }, 22, 23] });
            }
            reads += group.length; writes++; setIO();
            S.remove('outbuf'); group.forEach(function (_, gi) { S.remove('buf' + gi); });
            next.push(out);
          } else {
            reads += group.length;
            var merged = mergeArrays(group);
            writes++; setIO();
            next.push(merged);
            S.step(T('Geçiş ' + passNum + ': ' + group.length + ' çalışma birleştirilir (' + group.map(function (r) { return '[' + r.join(',') + ']'; }).join(' + ') + ') -> [' + merged.join(',') + '] (+' + group.length + ' okuma, +1 yazma).',
                     'Pass ' + passNum + ': ' + group.length + ' runs are merged (' + group.map(function (r) { return '[' + r.join(',') + ']'; }).join(' + ') + ') -> [' + merged.join(',') + '] (+' + group.length + ' reads, +1 write).'),
                   { c: [14, 25], java: [14, 25] });
          }
        }
        runs = next;
        drawRow(passNum, runs, T('geçiş ' + passNum + ' =', 'pass ' + passNum + ' ='));
      }

      S.result = { sorted: keys.slice().sort(function (a, b) { return a - b; }), runsCreated: (function () { var c = 0; for (var ii = 0; ii < keys.length; ii += runSize) c++; return c; })(), passes: passNum, reads: reads, writes: writes };
      S.step(T('Bitti: ' + passNum + ' birleştirme geçişi, ' + reads + ' okuma / ' + writes + ' yazma. Sonuç tek bir sıralı çalışma: [' + runs[0].join(',') + ']. Bir geçişte kaç çalışma taranırsa taransın, RAM her zaman yalnız `FAN_IN` arabellek kadar kullanılır.',
               'Done: ' + passNum + ' merge pass(es), ' + reads + ' reads / ' + writes + ' writes. The result is one sorted run: [' + runs[0].join(',') + ']. However many runs a pass scans, RAM only ever holds `FAN_IN` buffers.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
