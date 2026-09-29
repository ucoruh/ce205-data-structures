/* Week 6 — rehashing: open addressing (linear probing) works only while the table has room. When the load factor
 * n/m goes past a threshold, we allocate a bigger table — size = the next PRIME at least 2*m — and reinsert every
 * key into it from scratch (every key's index can change, since the modulus changed). This keeps the average
 * probe length bounded as the table grows.
 * Drawing standard: each table generation is its own named row ("table[] = (m = …)"); when a rehash happens, the
 * old row is dimmed (kept visible as history) and every key is moved to the new row one at a time, with a caption
 * naming its old and new index; the load factor α = n/m is shown on the right, next to the threshold. Examples
 * (normal, hard, edge — a tiny table that rehashes twice in a row), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'double threshold = 0.8;',
    'Slot *state; int *table; int m, n;    /* current table, its size, and how many keys are in it */',
    '',
    'int is_prime(int x) {',
    '    if (x < 2) return 0;',
    '    for (int i = 2; (long) i * i <= x; i++) if (x % i == 0) return 0;',
    '    return 1;',
    '}',
    'int next_prime(int x) { while (!is_prime(x)) x++; return x; }',
    '',
    'int insert_into(Slot *st, int *tb, int mm, int key) {         /* returns the index used */',
    '    int idx = key % mm;',
    '    for (int i = 0; i < mm; i++) {',
    '        if (st[idx] != OCCUPIED) { tb[idx] = key; st[idx] = OCCUPIED; return idx; }',
    '        idx = (idx + 1) % mm;',
    '    }',
    '    return -1;',
    '}',
    '',
    'void rehash(void) {',
    '    int newM = next_prime(2 * m);',
    '    Slot *newState = calloc(newM, sizeof(Slot));',
    '    int *newTable = malloc(newM * sizeof(int));',
    '    for (int i = 0; i < m; i++)',
    '        if (state[i] == OCCUPIED) insert_into(newState, newTable, newM, table[i]);   /* every key moves */',
    '    free(state); free(table);',
    '    state = newState; table = newTable; m = newM;',
    '}',
    '',
    'void insert(int key) {',
    '    insert_into(state, table, m, key);',
    '    n++;',
    '    if ((double) n / m > threshold) rehash();',
    '}'
  ];
  var JAVA = [
    'static final double THRESHOLD = 0.8;',
    'int[] state; int[] table; int m, n;   // current table, its size, and how many keys are in it',
    '',
    'static boolean isPrime(int x) {',
    '    if (x < 2) return false;',
    '    for (int i = 2; (long) i * i <= x; i++) if (x % i == 0) return false;',
    '    return true;',
    '}',
    'static int nextPrime(int x) { while (!isPrime(x)) x++; return x; }',
    '',
    'int insertInto(int[] st, int[] tb, int mm, int key) {         // returns the index used',
    '    int idx = key % mm;',
    '    for (int i = 0; i < mm; i++) {',
    '        if (st[idx] != OCCUPIED) { tb[idx] = key; st[idx] = OCCUPIED; return idx; }',
    '        idx = (idx + 1) % mm;',
    '    }',
    '    return -1;',
    '}',
    '',
    'void rehash() {',
    '    int newM = nextPrime(2 * m);',
    '    int[] newState = new int[newM], newTable = new int[newM];',
    '    for (int i = 0; i < m; i++)',
    '        if (state[i] == OCCUPIED) insertInto(newState, newTable, newM, table[i]);   // every key moves',
    '    state = newState; table = newTable; m = newM;',
    '}',
    '',
    'void insert(int key) {',
    '    insertInto(state, table, m, key);',
    '    n++;',
    '    if ((double) n / m > THRESHOLD) rehash();',
    '}'
  ];

  function isPrime(x) { if (x < 2) return false; for (var i = 2; i * i <= x; i++) if (x % i === 0) return false; return true; }
  function nextPrime(x) { while (!isPrime(x)) x++; return x; }

  D.define({
    id: 'rehashing',
    title: T('Yeniden hash\'leme (rehashing): tablo büyürken anahtarları taşımak', 'Rehashing: moving every key when the table grows'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('m0 = 6, 10 anahtar: bir kez büyür', 'm0 = 6, 10 keys: grows once'),
        data: { m0: 6, threshold: 0.8, keys: [15, 22, 8, 31, 44, 3, 27, 56, 19, 40] } },
      { id: 'hard', level: 'hard', name: T('m0 = 6, anahtarlar aynı eve kümeleniyor, sonra büyüme rahatlatıyor', 'm0 = 6, keys cluster at the same home, growing relieves it'),
        data: { m0: 6, threshold: 0.8, keys: [12, 18, 24, 30, 36, 7, 13, 19, 25, 31] } },
      { id: 'double-rehash', level: 'edge', name: T('m0 = 2: küçücük tablo art arda iki kez büyür', 'm0 = 2: a tiny table grows twice in a row'),
        data: { m0: 2, threshold: 0.8, keys: [5, 12, 19, 26, 9, 16] }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    /** Independent computation: same insert/rehash logic, coded separately from build(). */
    reference: function (d) {
      function isPrimeR(x) { if (x < 2) return false; for (var i = 2; i * i <= x; i++) if (x % i === 0) return false; return true; }
      function nextPrimeR(x) { while (!isPrimeR(x)) x++; return x; }
      function insertInto(st, tb, mm, key) {
        var idx = ((key % mm) + mm) % mm;
        for (var i = 0; i < mm; i++) { if (st[idx] !== 'O') { tb[idx] = key; st[idx] = 'O'; return idx; } idx = (idx + 1) % mm; }
        return -1;
      }
      var m = d.m0, threshold = d.threshold, state = new Array(m).fill('E'), table = new Array(m).fill(null), n = 0, rehashLog = [];
      d.keys.forEach(function (key) {
        insertInto(state, table, m, key);
        n++;
        if (n / m > threshold) {
          var newM = nextPrimeR(2 * m), newState = new Array(newM).fill('E'), newTable = new Array(newM).fill(null), moves = 0;
          for (var i = 0; i < m; i++) if (state[i] === 'O') { insertInto(newState, newTable, newM, table[i]); moves++; }
          rehashLog.push({ oldM: m, newM: newM, moves: moves });
          m = newM; state = newState; table = newTable;
        }
      });
      var finalTable = []; for (var q = 0; q < m; q++) finalTable.push(state[q] === 'O' ? table[q] : null);
      return { table: finalTable, m: m, n: n, rehashLog: rehashLog };
    },
    random: function (level, r) {
      // m0 = 6 keeps the grown table at next_prime(12) = 13 columns for any 10-key run — safely under the
      // 16-column drawing limit even after one rehash. Levels vary the key magnitude, not m0 or the key count.
      var hi = { easy: 60, normal: 99, hard: 150, extreme: 300 }[level];
      var keys = [], i;
      for (i = 0; i < 10; i++) keys.push(D.randInt(r, 1, hi));
      return { m0: 6, threshold: 0.8, keys: keys };
    },
    input: {
      hint: T('Örnek: m0=6 t=0.8 15 22 8 31 44 3 27 56 19 40  (m0 başlangıç boyutu, t eşik, sonra anahtarlar)',
              'Example: m0=6 t=0.8 15 22 8 31 44 3 27 56 19 40  (m0 is the starting size, t the threshold, then the keys)'),
      parse: function (text) {
        var m0 = null, threshold = 0.8, keys = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mm = /^m0[=:](-?\d+)$/i.exec(tok);
          if (mm) { m0 = parseInt(mm[1], 10); return; }
          var tm = /^t[=:]([\d.]+)$/i.exec(tok);
          if (tm) { threshold = parseFloat(tm[1]); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, m0=N ya da t=X.X yazın.', '"' + tok + '" is not understood: write a number, m0=N or t=X.X.');
          keys.push(parseInt(tok, 10));
        });
        if (m0 === null) throw T('m0=N yazmalısınız (başlangıç tablo boyutu).', 'You must write m0=N (the starting table size).');
        if (m0 < 2 || m0 > 8) throw T('m0 2 ile 8 arasında olmalı.', 'm0 must be between 2 and 8.');
        if (threshold <= 0 || threshold >= 1) throw T('t 0 ile 1 arasında olmalı.', 't must be between 0 and 1.');
        if (keys.length < 4) throw T('En az 4 anahtar yazın.', 'Write at least 4 keys.');
        if (keys.length > 16) throw T('En çok 16 anahtar (tablo 16 sütunu aşmasın diye).', 'At most 16 keys (so the table never exceeds 16 columns).');
        return { m0: m0, threshold: threshold, keys: keys };
      },
      format: function (d) { return 'm0=' + d.m0 + ' t=' + d.threshold + ' ' + d.keys.join(' '); },
      bad: ['', 'm0=1 5 8', 'm0=20 5 8', '5 8 13', '5 8 x 13 m0=6', 'm0=abc 5 8'],
      tokens: function (d) { return d.keys.map(String); }
    },
    build: function (S, d) {
      var m0 = d.m0, threshold = d.threshold, keys = d.keys;
      var X0 = 110, Y0 = 130, W = 50, H = 42, GAP = 8, ROWGAP = 90;
      var RX2 = X0 + 16 * (W + GAP) + 40;

      S.label('tlbl', { x: X0, y: 40, text: T('eşik (threshold) = ' + threshold, 'threshold = ' + threshold), size: 16, bold: true, mono: true });
      S.label('alpha', { x: X0, y: 64, text: '', style: 'dim', size: 14, mono: true, anchor: 'start' });
      S.label('dec', { x: RX2, y: 60, text: '', size: 16, bold: true, mono: true, anchor: 'start' });

      var gen = 0, m = m0, curY = Y0, rehashLog = [];
      function drawRow(g, mm, y) {
        S.label('rowlbl' + g, { x: X0 - 16, y: y + H / 2 + 5, text: T('tablo[] = (m=' + mm + ')', 'table[] = (m=' + mm + ')'), anchor: 'end', size: 14, bold: true });
        for (var i = 0; i < mm; i++) S.box('g' + g + '_' + i, { x: X0 + i * (W + GAP), y: y, w: W, h: H, text: '', style: 'empty', size: 14, above: String(i) });
      }
      function insertInto(g, mm, key) {
        var idx = ((key % mm) + mm) % mm;
        for (var i = 0; i < mm; i++) {
          if (!S.get('g' + g + '_' + idx).text) { S.set('g' + g + '_' + idx, { text: String(key), style: 'new' }); return idx; }
          idx = (idx + 1) % mm;
        }
        return -1;
      }

      drawRow(gen, m, curY);
      S.step(T('`m0 = ' + m0 + '` hücrelik küçük bir tabloyla başlıyoruz. Yük faktörü `α = n/m` eşiği (`' + threshold + '`) aşarsa tablo büyür.',
               'We start with a small table of `m0 = ' + m0 + '` cells. If the load factor `α = n/m` goes past the threshold (`' + threshold + '`), the table grows.'),
             { c: [1, 2], java: [1, 2] });

      var n = 0;
      keys.forEach(function (key, k) {
        S.at(k);
        var idx = insertInto(gen, m, key);
        n++;
        S.set('alpha', { text: 'α = ' + n + '/' + m + ' = ' + (n / m).toFixed(2) });
        S.set('dec', { text: 'insert(' + key + ') → idx ' + idx, style: 'new' });
        S.step(T('`insert(' + key + ')` — hücre ' + idx + '\'e yerleşti. `n = ' + n + '`, `α = ' + (n / m).toFixed(2) + '`.',
                 '`insert(' + key + ')` — settles at cell ' + idx + '. `n = ' + n + '`, `α = ' + (n / m).toFixed(2) + '`.'),
               { c: [31, 32], java: [29, 30] });

        if (n / m > threshold) {
          var newM = nextPrime(2 * m);
          S.set('dec', { text: T('α eşiği aştı!', 'α crossed the threshold!'), style: 'del' });
          S.step(T('`α = ' + (n / m).toFixed(2) + ' > ' + threshold + '` — **yeniden hash\'leme** tetiklenir. Yeni boyut: `next_prime(2 × ' + m + ') = ' + newM + '`.',
                   '`α = ' + (n / m).toFixed(2) + ' > ' + threshold + '` — **rehashing** is triggered. New size: `next_prime(2 × ' + m + ') = ' + newM + '`.'),
                 { c: [{ n: 33, note: T('n/m>threshold? evet', 'n/m>threshold? yes') }, 21], java: [{ n: 31, note: T('n/m>threshold? evet', 'n/m>threshold? yes') }, 21] });

          S.styleAll('dim', 'box');
          var newY = curY + ROWGAP, newGen = gen + 1;
          drawRow(newGen, newM, newY);
          var moves = 0;
          for (var i = 0; i < m; i++) {
            var cell = S.get('g' + gen + '_' + i);
            if (cell && cell.text) {
              var oldKey = parseInt(cell.text, 10);
              S.set('g' + gen + '_' + i, { style: 'hl' });
              var newIdx = insertInto(newGen, newM, oldKey);
              moves++;
              S.set('dec', { text: oldKey + ': ' + i + ' → ' + newIdx, style: 'hl' });
              S.step(T('Anahtar `' + oldKey + '` taşınıyor: eski indeks ' + i + ' → yeni indeks ' + newIdx + ' (`' + oldKey + ' mod ' + newM + '` ile yeniden hesaplanır).',
                       'Key `' + oldKey + '` moves: old index ' + i + ' → new index ' + newIdx + ' (recomputed with `' + oldKey + ' mod ' + newM + '`).'),
                     { c: [{ n: 24, note: T('i<m? evet', 'i<m? yes') }, { n: 25, note: T('state[i]==OCCUPIED? evet', 'state[i]==OCCUPIED? yes') }],
                       java: [{ n: 23, note: T('i<m? evet', 'i<m? yes') }, { n: 24, note: T('state[i]==OCCUPIED? evet', 'state[i]==OCCUPIED? yes') }] });
              S.set('g' + gen + '_' + i, { style: 'dim', text: '' });
            }
          }
          rehashLog.push({ oldM: m, newM: newM, moves: moves });
          gen = newGen; m = newM; curY = newY;
          S.set('alpha', { text: 'α = ' + n + '/' + m + ' = ' + (n / m).toFixed(2) });
          S.set('dec', { text: '', style: 'normal' });
          S.step(T(moves + ' anahtarın hepsi yeni, `m = ' + m + '` hücrelik tabloya taşındı. Eski tablo artık kullanılmıyor (soluk gösterildi).',
                   'All ' + moves + ' keys were moved into the new, `m = ' + m + '`-cell table. The old table is no longer used (shown dimmed).'),
                 { c: [26, 27], java: [25] });
        }
      });

      S.at(null);
      var finalTable = []; for (var q = 0; q < m; q++) finalTable.push((S.get('g' + gen + '_' + q).text) || null);
      S.result = { table: finalTable.map(function (v) { return v === null ? null : Number(v); }), m: m, n: n, rehashLog: rehashLog };
      S.step(T('Bitti: ' + n + ' anahtar eklendi, tablo `m0 = ' + m0 + '`\'dan `m = ' + m + '`\'e büyüdü. Yeniden hash\'leme pahalıdır (O(n)) ama seyrektir — amortize edilmiş ekleme yine O(1) kalır.',
               'Done: ' + n + ' keys inserted, the table grew from `m0 = ' + m0 + '` to `m = ' + m + '`. Rehashing is expensive (O(n)) but rare — amortized insertion is still O(1).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
