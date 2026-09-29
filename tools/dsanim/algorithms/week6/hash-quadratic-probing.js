/* Week 6 — open addressing with quadratic probing: on a collision, probe home+1^2, home+2^2, home+3^2, … (mod m)
 * instead of home+1, home+2, home+3 (linear probing). This spreads keys out and avoids PRIMARY clustering — but it
 * has its own trap: if m is not prime (classic bad case: m a power of 2) or the load factor is above 0.5, the
 * i^2 sequence can revisit the same few slots forever and never reach a free one, even though the table is not
 * full.
 * Drawing standard: one row "table[] =" with index numbers above; the probe sequence (i^2 offsets) is written on
 * the right; a cycle failure is explicitly flagged, distinguishing it from a genuinely full table. Examples
 * (normal, hard, edge — a table where the cycle never finds a free slot), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef enum { EMPTY, OCCUPIED } Slot;',
    'Slot state[M];                        /* all EMPTY initially */',
    'int table[M];',
    '',
    'bool insert(int key) {',
    '    int home = key % M;',
    '    for (int i = 0; i < M; i++) {',
    '        int idx = (home + i * i) % M;          /* quadratic probing: i^2 offsets */',
    '        if (state[idx] != OCCUPIED) {',
    '            table[idx] = key;',
    '            state[idx] = OCCUPIED;',
    '            return true;',
    '        }',
    '    }',
    '    return false;   /* M probes tried: table full, OR (m not prime / alpha > 0.5) the */',
    '                     /* sequence cycled without ever reaching a free slot           */',
    '}'
  ];
  var JAVA = [
    'static final int EMPTY = 0, OCCUPIED = 1;',
    'int[] state = new int[M];              // all EMPTY (0) initially',
    'int[] table = new int[M];',
    '',
    'boolean insert(int key) {',
    '    int home = key % M;',
    '    for (int i = 0; i < M; i++) {',
    '        int idx = (home + i * i) % M;          // quadratic probing: i^2 offsets',
    '        if (state[idx] != OCCUPIED) {',
    '            table[idx] = key;',
    '            state[idx] = OCCUPIED;',
    '            return true;',
    '        }',
    '    }',
    '    return false;   // M probes tried: table full, OR (m not prime / alpha > 0.5) the',
    '                    // sequence cycled without ever reaching a free slot',
    '}'
  ];

  function h(key, m) { return ((key % m) + m) % m; }

  D.define({
    id: 'hash-quadratic-probing',
    title: T('Karesel yoklama (quadratic probing) ile açık adresleme', 'Open addressing with quadratic probing'),
    code: function (d) {
      var m = d && d.m || 13;
      return { c: C.map(function (l) { return l.replace(/\bM\b/g, String(m)); }), java: JAVA.map(function (l) { return l.replace(/\bM\b/g, String(m)); }) };
    },
    presets: [
      { id: 'normal', level: 'normal', name: T('m = 13 (asal), 10 anahtar, birkaç i² sıçraması', 'm = 13 (prime), 10 keys, a few i² jumps'),
        data: { m: 13, keys: [7, 20, 33, 14, 29, 41, 56, 68, 81, 95] } },
      { id: 'hard', level: 'hard', name: T('m = 11, iki grup aynı eve düşüyor: belirgin i² desenleri', 'm = 11, two groups share a home: clear i² patterns'),
        data: { m: 11, keys: [4, 15, 26, 37, 48, 9, 20, 31, 42, 53] } },
      { id: 'quadratic-cycle', level: 'edge', name: T('m = 8 (2\'nin kuvveti): döngü boş hücreyi hiç bulamıyor', 'm = 8 (a power of 2): the cycle never finds the free slot'),
        data: { m: 8, keys: [8, 9, 12, 26, 19, 5, 14, 16, 7, 24] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    /** Independent computation: same quadratic-probe logic, coded separately from build(). */
    reference: function (d) {
      var m = d.m, state = new Array(m).fill('E'), table = new Array(m).fill(null), insertResults = [];
      d.keys.forEach(function (key) {
        var home = ((key % m) + m) % m, placed = false, probes = 0, i, idx;   /* computed inline, independently of build()'s h() */
        for (i = 0; i < m; i++) {
          idx = (home + i * i) % m;
          probes = i + 1;
          if (state[idx] !== 'O') { table[idx] = key; state[idx] = 'O'; placed = true; break; }
        }
        var occupied = state.filter(function (s) { return s === 'O'; }).length;
        var cycled = !placed && occupied < m;
        insertResults.push({ key: key, placed: placed, probes: probes, cycled: cycled });
      });
      var finalTable = []; for (var q = 0; q < m; q++) finalTable.push(state[q] === 'O' ? table[q] : null);
      return { table: finalTable, insertResults: insertResults };
    },
    random: function (level, r) {
      var mChoices = { easy: [11, 13], normal: [11, 13], hard: [7, 11], extreme: [8, 16] }[level];
      var m = mChoices[D.randInt(r, 0, mChoices.length - 1)];
      var n = { easy: 10, normal: 11, hard: 12, extreme: 12 }[level];
      var keys = [], i;
      for (i = 0; i < n; i++) keys.push(D.randInt(r, 1, 99));
      return { m: m, keys: keys };
    },
    input: {
      hint: T('Örnek: m=13 7 20 33 14 29 41 56 68 81 95  (m tablo boyutu, sonra eklenecek anahtarlar)',
              'Example: m=13 7 20 33 14 29 41 56 68 81 95  (m is the table size, then the keys to insert)'),
      parse: function (text) {
        var m = null, keys = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mm = /^m[=:](-?\d+)$/i.exec(tok);
          if (mm) { m = parseInt(mm[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı ya da m=N yazın.', '"' + tok + '" is not understood: write a number or m=N.');
          keys.push(parseInt(tok, 10));
        });
        if (m === null) throw T('m=N yazmalısınız (tablo boyutu).', 'You must write m=N (the table size).');
        if (m < 2 || m > 16) throw T('m 2 ile 16 arasında olmalı.', 'm must be between 2 and 16.');
        if (keys.length < 4) throw T('En az 4 anahtar yazın.', 'Write at least 4 keys.');
        if (keys.length > 24) throw T('En çok 24 anahtar.', 'At most 24 keys.');
        return { m: m, keys: keys };
      },
      format: function (d) { return 'm=' + d.m + ' ' + d.keys.join(' '); },
      bad: ['', 'm=1 5 8', 'm=99 5 8', '5 8 13', '5 8 x 13 m=11', 'm=abc 5 8'],
      tokens: function (d) { return d.keys.map(String); }
    },
    build: function (S, d) {
      var m = d.m, keys = d.keys;
      var X0 = 90, Y0 = 170, W = 54, H = 46, GAP = 8;
      var RX = X0 + m * (W + GAP) + 40;

      for (var i = 0; i < m; i++) S.box('c' + i, { x: X0 + i * (W + GAP), y: Y0, w: W, h: H, text: '', style: 'empty', size: 15, above: String(i) });
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: T('tablo[] =', 'table[] ='), anchor: 'end', size: 15, bold: true });
      S.label('mlbl', { x: X0, y: 40, text: 'm = ' + m, size: 18, bold: true, mono: true });
      S.label('dec', { x: RX, y: Y0 + H / 2 - 8, text: '', size: 16, bold: true, mono: true, anchor: 'start' });
      S.label('probe', { x: RX, y: Y0 + H / 2 + 18, text: '', size: 14, mono: true, anchor: 'start', style: 'dim' });

      S.step(T('Karesel yoklama: çakışma olursa `home + 1²`, `home + 2²`, `home + 3²`, … (mod ' + m + ') hücrelerini yoklarız — sabit adım yerine hızla büyüyen bir adım. Bu, doğrusal yoklamanın birincil kümelenmesini azaltır.',
               'Quadratic probing: on a collision we probe `home + 1²`, `home + 2²`, `home + 3²`, … (mod ' + m + ') — a fast-growing step instead of a fixed one. This reduces linear probing\'s primary clustering.'),
             { c: [5, 6, 7, 8], java: [5, 6, 7, 8] });

      var state = new Array(m).fill('E'), table = new Array(m).fill(null), insertResults = [];
      keys.forEach(function (key, k) {
        S.at(k);
        var home = h(key, m), seq = [], placed = false, probes = 0, idx;
        for (var i2 = 0; i2 < m; i2++) {
          idx = (home + i2 * i2) % m;
          seq.push(idx);
          probes = i2 + 1;
          S.set('c' + idx, { style: 'hl' });
          S.set('probe', { text: 'home=' + home + ': ' + seq.join(' → ') });
          if (state[idx] !== 'O') {
            table[idx] = key; state[idx] = 'O';
            S.set('c' + idx, { text: String(key), style: 'new' });
            S.set('dec', { text: probes > 1 ? T('yerleşti (' + probes + '. yoklama)', 'placed (probe ' + probes + ')') : T('yerleşti', 'placed'), style: 'new' });
            placed = true;
            S.step(probes > 1
              ? T('`insert(' + key + ')`: `home = ' + home + '`, ' + (probes - 1) + ' karesel sıçramadan sonra hücre ' + idx + ' boş bulundu. Dizi: `' + seq.join(' → ') + '`.',
                  '`insert(' + key + ')`: `home = ' + home + '`, after ' + (probes - 1) + ' quadratic jump' + (probes - 1 > 1 ? 's' : '') + ', cell ' + idx + ' was found free. Sequence: `' + seq.join(' → ') + '`.')
              : T('`insert(' + key + ')`: `home = ' + idx + '`, hücre boştu, doğrudan yerleşir.', '`insert(' + key + ')`: `home = ' + idx + '`, the cell was empty, it settles immediately.'),
              { c: [8, 9, 10, 11, 12], java: [8, 9, 10, 11, 12] });
            break;
          } else {
            S.set('dec', { text: T('dolu, i² sıçra', 'occupied, jump by i²'), style: 'hl' });
            S.step(T('Hücre ' + idx + ' dolu — `i = ' + (i2 + 1) + '` için `(home + ' + (i2 + 1) + '²) mod ' + m + '` hücresine sıçrarız.',
                     'Cell ' + idx + ' is occupied — we jump to `(home + ' + (i2 + 1) + '²) mod ' + m + '` for `i = ' + (i2 + 1) + '`.'), { c: [7, 8], java: [7, 8] });
          }
        }
        if (!placed) {
          var occupied = state.filter(function (s) { return s === 'O'; }).length;
          var cycled = occupied < m;
          S.set('dec', { text: cycled ? T('döngü — boş hücre yok!', 'cycle — no free slot reached!') : T('tablo dolu!', 'table full!'), style: 'del' });
          S.step(cycled
            ? T('`' + m + '` yoklama denendi ama hepsi aynı birkaç hücreyi tekrar ziyaret etti — tablo dolu DEĞİL (' + (m - occupied) + ' hücre hâlâ boş), ama bu anahtarın karesel dizisi onlara asla ulaşamıyor. `m = ' + m + '` asal değil (' + (m % 2 === 0 ? '2 ile bölünüyor' : 'bileşik') + ') olduğu için bu döngü oluşabilir — **işaretlendi**.',
                'All `' + m + '` probes were tried but they kept revisiting the same few cells — the table is NOT full (' + (m - occupied) + ' cells are still empty), yet this key\'s quadratic sequence never reaches them. `m = ' + m + '` is not prime (' + (m % 2 === 0 ? 'divisible by 2' : 'composite') + '), which is exactly when this can happen — **flagged**.')
            : T('`' + m + '` hücrenin hepsi yoklandı, hiçbiri boş değil — tablo gerçekten **dolu**, `insert(' + key + ')` reddedilir.',
                'All `' + m + '` cells were probed, none was free — the table is genuinely **full**, `insert(' + key + ')` is rejected.'),
            { c: [14, 15], java: [13, 14] });
        }
        insertResults.push({ key: key, placed: placed, probes: probes, cycled: !placed && (state.filter(function (s) { return s === 'O'; }).length) < m });
      });

      S.at(null);
      var finalTable = []; for (var q = 0; q < m; q++) finalTable.push(state[q] === 'O' ? table[q] : null);
      S.result = { table: finalTable, insertResults: insertResults };
      var placedCount = insertResults.filter(function (r) { return r.placed; }).length;
      var cycledCount = insertResults.filter(function (r) { return r.cycled; }).length;
      S.step(T('Bitti: ' + placedCount + '/' + insertResults.length + ' ekleme yerleşti' + (cycledCount ? ', ' + cycledCount + ' tanesi boş yer varken **döngüye** girdi (m asal değil / α > 0.5)' : '') + '. Karesel yoklama kümelenmeyi azaltır ama m\'in seçimine duyarlıdır.',
               'Done: ' + placedCount + '/' + insertResults.length + ' inserts placed' + (cycledCount ? ', ' + cycledCount + ' **cycled** despite free space existing (m not prime / α > 0.5)' : '') + '. Quadratic probing reduces clustering but is sensitive to the choice of m.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
