/* Week 14 -- replacement selection: keep a small RAM window (a min-heap in practice); a record smaller than
   the last one WRITTEN cannot extend the current run, so it is tagged for the NEXT run instead. This makes
   runs longer than RAM (about 2x on random data, and a single run in the best case) -- unlike plain RUN_SIZE
   chunking, which always makes runs of exactly RAM_SIZE. */
(function (D) {
  'use strict';
  var T = D.T;

  function cCode(m) {
    return [
      '#define RAM_SIZE ' + m + '                       /* records held in the selection window at once */',
      '',
      'int extract_min_current(Item window[], int w) {   /* -1 if no CURRENT-run item remains */',
      '    int best = -1;',
      '    for (int i = 0; i < w; i++)',
      '        if (window[i].tag == CURRENT && (best == -1 || window[i].val < window[best].val)) best = i;',
      '    return best;',
      '}',
      '',
      'void replacement_selection(int input[], int n, int m) {',
      '    Item window[RAM_SIZE]; int w = fill(window, input, m);  /* first m values, all tagged CURRENT */',
      '    int next_in = m;',
      '    int last_written = INT_MIN, run = 0;',
      '    while (w > 0) {',
      '        int best = extract_min_current(window, w);',
      '        if (best == -1) { retag_all_current(window, w); last_written = INT_MIN; run++; continue; }  /* new run */',
      '        int val = window[best].val;',
      '        write_output(run, val);                    /* +1 write */',
      '        last_written = val;',
      '        remove_at(window, &w, best);',
      '        if (next_in < n) {',
      '            int v = input[next_in++];               /* +1 read */',
      '            add(window, &w, v, v >= last_written ? CURRENT : NEXT);',
      '        }',
      '    }',
      '}'
    ];
  }
  function javaCode(m) {
    return [
      'static final int RAM_SIZE = ' + m + ';             // records held in the selection window at once',
      '',
      'static int extractMinCurrent(Item[] window, int w) { // -1 if no CURRENT-run item remains',
      '    int best = -1;',
      '    for (int i = 0; i < w; i++)',
      '        if (window[i].tag == CURRENT && (best == -1 || window[i].val < window[best].val)) best = i;',
      '    return best;',
      '}',
      '',
      'static void replacementSelection(int[] input, int m) {',
      '    Item[] window = new Item[RAM_SIZE]; int w = fill(window, input, m); // first m values, tagged CURRENT',
      '    int nextIn = m;',
      '    int lastWritten = Integer.MIN_VALUE, run = 0;',
      '    while (w > 0) {',
      '        int best = extractMinCurrent(window, w);',
      '        if (best == -1) { retagAllCurrent(window, w); lastWritten = Integer.MIN_VALUE; run++; continue; } // new run',
      '        int val = window[best].val;',
      '        writeOutput(run, val);                       // +1 write',
      '        lastWritten = val;',
      '        removeAt(window, w, best);',
      '        if (nextIn < input.length) {',
      '            int v = input[nextIn++];                  // +1 read',
      '            add(window, w, v, v >= lastWritten ? CURRENT : NEXT);',
      '        }',
      '    }',
      '}'
    ];
  }

  function simulate(keys, m) {
    var window = [], idx = 0;
    for (; idx < Math.min(m, keys.length); idx++) window.push({ val: keys[idx], tag: 'cur' });
    var reads = window.length, writes = 0;
    var runs = [[]];
    var lastWritten = -Infinity;
    while (window.length) {
      var best = -1;
      for (var i = 0; i < window.length; i++) if (window[i].tag === 'cur' && (best === -1 || window[i].val < window[best].val)) best = i;
      if (best === -1) { window.forEach(function (w) { w.tag = 'cur'; }); lastWritten = -Infinity; runs.push([]); continue; }
      var val = window[best].val;
      runs[runs.length - 1].push(val); writes++;
      lastWritten = val;
      window.splice(best, 1);
      if (idx < keys.length) { var v = keys[idx++]; reads++; window.push({ val: v, tag: v >= lastWritten ? 'cur' : 'next' }); }
    }
    return { runs: runs, reads: reads, writes: writes };
  }

  D.define({
    id: 'replacement-selection',
    title: T('Yerine koyarak seçim (replacement selection): daha uzun çalışmalar', 'Replacement selection: longer runs'),
    code: function (d) { return { c: cCode(d.m), java: javaCode(d.m) }; },
    presets: [
      { id: 'normal', level: 'normal', name: T('RAM=4, 12 karışık değer', 'RAM=4, 12 mixed values'),
        data: { keys: [40, 11, 27, 8, 33, 2, 45, 16, 38, 23, 5, 30], m: 4 } },
      { id: 'hard', level: 'hard', name: T('RAM=3, 14 karışık değer', 'RAM=3, 14 mixed values'),
        data: { keys: [55, 12, 40, 3, 28, 61, 9, 47, 20, 34, 6, 52, 17, 44], m: 3 } },
      { id: 'descending', level: 'edge', name: T('Uç durum (en kötü hâl): kesin azalan girdi -- her çalışma tam RAM uzunluğunda', 'Edge case (worst case): strictly descending input -- every run is exactly RAM long'),
        data: { keys: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10], m: 4 } },
      { id: 'ram-covers-all', level: 'edge', name: T('Uç durum (en iyi hâl): RAM >= n -- tek çalışma', 'Edge case (best case): RAM >= n -- a single run'),
        data: { keys: [9, 3, 7, 1, 8, 2, 6, 4, 10, 5], m: 15 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      var keys = d.keys, m = d.m;
      var window = [], idx = 0;
      for (; idx < Math.min(m, keys.length); idx++) window.push({ val: keys[idx], tag: 'cur' });
      var reads = window.length, writes = 0;
      var runs = [[]];
      var lastWritten = -Infinity;
      while (window.length) {
        var best = -1;
        for (var i = 0; i < window.length; i++) if (window[i].tag === 'cur' && (best === -1 || window[i].val < window[best].val)) best = i;
        if (best === -1) { window.forEach(function (w) { w.tag = 'cur'; }); lastWritten = -Infinity; runs.push([]); continue; }
        var val = window[best].val;
        runs[runs.length - 1].push(val); writes++;
        lastWritten = val;
        window.splice(best, 1);
        if (idx < keys.length) { var v = keys[idx++]; reads++; window.push({ val: v, tag: v >= lastWritten ? 'cur' : 'next' }); }
      }
      return { m: m, runCount: runs.length, reads: reads, writes: writes, runs: runs };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level] || 12;
      var m = level === 'extreme' ? 3 : D.randInt(r, 3, 5);
      var used = {}, keys = [];
      while (keys.length < n) { var v = D.randInt(r, 1, 99); if (!used[v]) { used[v] = true; keys.push(v); } }
      return { keys: keys, m: m };
    },
    input: {
      hint: T('Örnek: m=4 keys: 40,11,27,8,33,2,45,16,38,23,5,30', 'Example: m=4 keys: 40,11,27,8,33,2,45,16,38,23,5,30'),
      parse: function (text) {
        var m = 4, keys = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mm = /^m[=:](\d+)$/i.exec(tok); if (mm) { m = parseInt(mm[1], 10); return; }
          if (/^keys?:?$/i.test(tok)) return;
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, m=N ya da keys yazın.', '"' + tok + '" is not understood: write a number, m=N or keys.');
          keys.push(parseInt(tok, 10));
        });
        if (m < 2 || m > 20) throw T('m 2 ile 20 arasında olmalı.', 'm must be between 2 and 20.');
        if (keys.length < 10) throw T('En az 10 değer yazın.', 'Write at least 10 values.');
        return { keys: keys, m: m };
      },
      format: function (d) { return 'm=' + d.m + ' keys: ' + d.keys.join(','); },
      bad: ['', 'm=1 keys: 1,2,3,4,5,6,7,8,9,10', 'keys: 1,2,3,4,5,6,7,8,9', 'm=abc keys: 1,2,3,4,5,6,7,8,9,10', 'keys: 1,x,3,4,5,6,7,8,9,10'],
      tokens: function (d) { return d.keys.map(String); }
    },
    build: function (S, d) {
      var keys = d.keys, m = d.m;
      var reads = 0, writes = 0;

      S.label('title', { x: 20, y: 20, text: 'RAM_SIZE = ' + m, size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('io', { x: 20, y: 44, text: T('okuma: 0  yazma: 0', 'reads: 0  writes: 0'), size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('dec', { x: 20, y: 66, text: '', size: 13, mono: true, anchor: 'start', style: 'dim' });
      function setIO() { S.set('io', { text: T('okuma: ' + reads + '  yazma: ' + writes, 'reads: ' + reads + '  writes: ' + writes) }); }

      var X0 = 90, BW = 54, BGAP = 8, Y_WIN = 190, Y_OUT = 290;
      S.label('inlbl', { x: X0 - 16, y: 120, text: T('girdi (sırayla okunacak) =', 'input (to be read in order) ='), anchor: 'end', size: 13, bold: true, style: 'dim' });
      S.box('inall', { x: X0, y: 100, w: Math.min(560, keys.length * 34 + 20), h: 34, text: keys.join(','), style: 'dim', size: 12 });
      S.label('winlbl', { x: X0 - 16, y: Y_WIN + 20, text: T('RAM penceresi =', 'RAM window ='), anchor: 'end', size: 13, bold: true });
      S.label('outlbl', { x: X0 - 16, y: Y_OUT + 20, text: T('çıktı (geçerli çalışma) =', 'output (current run) ='), anchor: 'end', size: 13, bold: true });

      var window = [], idx = 0;
      for (; idx < Math.min(m, keys.length); idx++) { window.push({ val: keys[idx], tag: 'cur' }); }
      reads = window.length; setIO();
      function drawWindow() {
        for (var k = 0; k < 20; k++) if (S.has('w' + k)) S.remove('w' + k);
        window.forEach(function (item, i) {
          S.box('w' + i, { x: X0 + i * (BW + BGAP), y: Y_WIN, w: BW, h: 40, text: String(item.val), style: item.tag === 'cur' ? 'normal' : 'dim', size: 14, below: item.tag === 'cur' ? T('şimdiki', 'current') : T('sonraki', 'next') });
        });
      }
      var runs = [[]], runRowY = Y_OUT;
      function drawRun(rowIdx) {
        var id = 'out' + rowIdx;
        if (S.has(id)) S.remove(id);
        S.box(id, { x: X0, y: Y_OUT + rowIdx * 60, w: Math.min(560, Math.max(60, runs[rowIdx].length * 34 + 20)), h: 36, text: runs[rowIdx].join(','), style: 'new', size: 13, above: T('çalışma ' + (rowIdx + 1), 'run ' + (rowIdx + 1)) });
      }
      drawWindow();
      S.step(T('RAM, ilk `RAM_SIZE=' + m + '` değeri okur (+' + m + ' okuma), hepsi "şimdiki çalışma" etiketiyle: 1. çalışma başlıyor.',
               'RAM reads the first `RAM_SIZE=' + m + '` values (+' + m + ' reads), all tagged "current run": run 1 begins.'),
             { c: [1, 10, 11, 12, 13], java: [1, 10, 11, 12, 13] });

      var lastWritten = -Infinity, stepCount = 0, DETAIL_LIMIT = 26;
      while (window.length) {
        var best = -1;
        for (var i = 0; i < window.length; i++) if (window[i].tag === 'cur' && (best === -1 || window[i].val < window[best].val)) best = i;
        var detailed = stepCount < DETAIL_LIMIT; stepCount++;
        if (best === -1) {
          window.forEach(function (w) { w.tag = 'cur'; });
          lastWritten = -Infinity;
          runs.push([]);
          drawWindow();
          if (detailed) S.step(T('Pencerede "şimdiki çalışma" etiketli değer kalmadı: bu çalışma biter. Tüm "sonraki" değerler "şimdiki" olur, çalışma ' + runs.length + ' başlar.',
                                 'No "current run" item is left in the window: this run ends. All "next" values become "current", run ' + runs.length + ' begins.'),
                               { c: [15, { n: 16, note: T('best==-1 mi? evet', 'best==-1? yes') }],
                                 java: [15, { n: 16, note: T('best==-1 mi? evet', 'best==-1? yes') }] });
          continue;
        }
        var val = window[best].val;
        if (window.length) S.at(idx < keys.length ? idx : keys.length - 1);
        runs[runs.length - 1].push(val); writes++; setIO();
        window.splice(best, 1);
        drawWindow();
        drawRun(runs.length - 1);
        if (detailed) S.step(T('Pencerede "şimdiki" etiketli en küçük değer `' + val + '`: çıktıya yazılır (+1 yazma), `last_written=' + val + '` olur.',
                               'The smallest "current"-tagged value in the window is `' + val + '`: it is written to the output (+1 write), `last_written=' + val + '`.'),
                             { c: [17, 18, 19, 20], java: [17, 18, 19, 20] });
        lastWritten = val;
        if (idx < keys.length) {
          var v = keys[idx++]; reads++; setIO();
          var tag = v >= lastWritten ? 'cur' : 'next';
          window.push({ val: v, tag: tag });
          drawWindow();
          if (detailed) S.step(T('Sıradaki girdi `' + v + '` okunur (+1 okuma). `' + v + ' >= ' + lastWritten + '`? ' + (tag === 'cur' ? 'evet -- bu ÇALIŞMAYI uzatabilir, "şimdiki" etiketlenir.' : 'hayır -- bu değer daha küçük, geçerli çalışmaya giremez, "sonraki" etiketlenir.'),
                                 'The next input `' + v + '` is read (+1 read). `' + v + ' >= ' + lastWritten + '`? ' + (tag === 'cur' ? 'yes -- it can extend the CURRENT run, tagged "current".' : 'no -- it is smaller, it cannot join the current run, tagged "next".')),
                               { c: [{ n: 21, note: T('next_in<n mi? evet', 'next_in<n? yes') }, 22,
                                      { n: 23, note: tag === 'cur' ? T('v>=last mi? evet', 'v>=last? yes') : T('v>=last mi? hayır', 'v>=last? no') }],
                                 java: [{ n: 21, note: T('next_in<n mi? evet', 'next_in<n? yes') }, 22,
                                        { n: 23, note: tag === 'cur' ? T('v>=last mi? evet', 'v>=last? yes') : T('v>=last mi? hayır', 'v>=last? no') }] });
        }
      }

      S.at(null);
      S.set('dec', { text: '' });
      S.result = { m: m, runCount: runs.length, reads: reads, writes: writes, runs: runs };
      var lens = runs.map(function (r) { return r.length; }).join(', ');
      S.step(T('Bitti: ' + runs.length + ' çalışma (uzunluklar: ' + lens + '), ' + reads + ' okuma / ' + writes + ' yazma. `RAM_SIZE=' + m + '` olsa bile çalışmalar çoğu zaman ' + m + '\'ten çok daha uzun -- rastgele veride ortalama ~2x.',
               'Done: ' + runs.length + ' run(s) (lengths: ' + lens + '), ' + reads + ' reads / ' + writes + ' writes. Even though `RAM_SIZE=' + m + '`, runs usually come out much longer than ' + m + ' -- about 2x on average for random data.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
