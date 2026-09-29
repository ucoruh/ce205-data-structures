/* Week 6 — open addressing with double hashing: the probe step itself depends on the key, via a SECOND hash
 * function h2. probe(i) = (h1(key) + i * h2(key)) mod m. Because different keys usually get different steps, two
 * keys that collide at the same home cell go on to follow DIFFERENT paths — unlike linear probing (always step 1)
 * or quadratic probing (always i^2), which make every colliding key retrace the same path. This is the best of
 * the open-addressing family in practice.
 * h2(key) = R - (key mod R) for a prime R < m: this is always in [1..R], so the step is NEVER 0 (a 0 step would
 * reprobe the same cell forever).
 * Drawing standard: one row "table[] =" with index numbers above; h1 and h2 are shown with the numbers plugged in,
 * and the probe sequence is written on the right; the closing caption compares the total probes used here with
 * what linear probing would have needed on the very same keys. Examples (normal, hard, edge — m not prime, the
 * step shares a factor with m and the probe cycles), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int h1(int key, int m) { return key % m; }',
    'int h2(int key, int r) { return r - (key % r); }        /* r prime, r < m: h2 in [1..r], never 0 */',
    '',
    'bool insert(int key) {',
    '    int idx = h1(key, M), step = h2(key, R);',
    '    for (int i = 0; i < M; i++) {',
    '        if (state[idx] != OCCUPIED) {',
    '            table[idx] = key;',
    '            state[idx] = OCCUPIED;',
    '            return true;',
    '        }',
    '        idx = (idx + step) % M;                          /* every collision uses THIS key\'s own step */',
    '    }',
    '    return false;',
    '}'
  ];
  var JAVA = [
    'static int h1(int key, int m) { return key % m; }',
    'static int h2(int key, int r) { return r - (key % r); } // r prime, r < m: h2 in [1..r], never 0',
    '',
    'boolean insert(int key) {',
    '    int idx = h1(key, M), step = h2(key, R);',
    '    for (int i = 0; i < M; i++) {',
    '        if (state[idx] != OCCUPIED) {',
    '            table[idx] = key;',
    '            state[idx] = OCCUPIED;',
    '            return true;',
    '        }',
    '        idx = (idx + step) % M;                          // every collision uses THIS key\'s own step',
    '    }',
    '    return false;',
    '}'
  ];

  function h1(key, m) { return ((key % m) + m) % m; }
  function h2(key, r) { return r - (((key % r) + r) % r); }

  /** For the closing comparison ONLY: what linear probing would have done on the same keys. Not used for
   * correctness anywhere — a separate, simpler simulation. */
  function simulateLinear(keys, m) {
    var state = new Array(m).fill(false), total = 0, placed = 0;
    keys.forEach(function (key) {
      var idx = h1(key, m);
      for (var i = 0; i < m; i++) {
        total++;
        if (!state[idx]) { state[idx] = true; placed++; break; }
        idx = (idx + 1) % m;
      }
    });
    return { total: total, placed: placed };
  }

  D.define({
    id: 'hash-double-hashing',
    title: T('Çift hash (double hashing) ile açık adresleme', 'Open addressing with double hashing'),
    code: function (d) {
      var m = d && d.m || 13, r = d && d.r || 11;
      return {
        c: C.map(function (l) { return l.replace(/\bM\b/g, String(m)).replace(/\bR\b/g, String(r)); }),
        java: JAVA.map(function (l) { return l.replace(/\bM\b/g, String(m)).replace(/\bR\b/g, String(r)); })
      };
    },
    presets: [
      { id: 'normal', level: 'normal', name: T('m = 13, R = 11, 10 anahtar: çakışan anahtarlar farklı adımlar kullanır', 'm = 13, R = 11, 10 keys: colliding keys use different steps'),
        data: { m: 13, r: 11, keys: [7, 20, 33, 14, 29, 41, 56, 68, 81, 95] } },
      { id: 'hard', level: 'hard', name: T('m = 13, R = 11, birçok anahtar aynı eve düşüyor', 'm = 13, R = 11, many keys share a home'),
        data: { m: 13, r: 11, keys: [4, 17, 30, 43, 56, 8, 21, 34, 47, 60] } },
      { id: 'double-hash-cycle', level: 'edge', name: T('m = 9 (asal değil): adım m ile ortak çarpan paylaşır, döngü oluşur', 'm = 9 (not prime): the step shares a factor with m, a cycle forms'),
        data: { m: 9, r: 7, keys: [13, 16, 10, 9, 2, 3, 5, 6, 4, 17] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    /** Independent computation: same double-hash probe logic, coded separately from build(). */
    reference: function (d) {
      var m = d.m, r = d.r, state = new Array(m).fill('E'), table = new Array(m).fill(null), insertResults = [];
      d.keys.forEach(function (key) {
        /* h1/h2 computed inline here, independently of build()'s h1()/h2() */
        var idx = ((key % m) + m) % m, step = r - (((key % r) + r) % r), placed = false, probes = 0, i;
        for (i = 0; i < m; i++) {
          probes = i + 1;
          if (state[idx] !== 'O') { table[idx] = key; state[idx] = 'O'; placed = true; break; }
          idx = (idx + step) % m;
        }
        var occupied = state.filter(function (s) { return s === 'O'; }).length;
        insertResults.push({ key: key, placed: placed, probes: probes, cycled: !placed && occupied < m });
      });
      var finalTable = []; for (var q = 0; q < m; q++) finalTable.push(state[q] === 'O' ? table[q] : null);
      return { table: finalTable, insertResults: insertResults };
    },
    random: function (level, r) {
      var choices = { easy: [[13, 11], [16, 13]], normal: [[13, 11]], hard: [[11, 7], [13, 11]], extreme: [[9, 7], [8, 5]] }[level];
      var pick = choices[D.randInt(r, 0, choices.length - 1)], m = pick[0], rr = pick[1];
      var n = { easy: 10, normal: 11, hard: 12, extreme: 12 }[level];
      var keys = [], i;
      for (i = 0; i < n; i++) keys.push(D.randInt(r, 1, 99));
      return { m: m, r: rr, keys: keys };
    },
    input: {
      hint: T('Örnek: m=13 r=11 7 20 33 14 29 41 56 68 81 95  (m tablo boyutu, r ikinci asal, sonra anahtarlar)',
              'Example: m=13 r=11 7 20 33 14 29 41 56 68 81 95  (m is the table size, r the second prime, then the keys)'),
      parse: function (text) {
        var m = null, r = null, keys = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mm = /^m[=:](-?\d+)$/i.exec(tok);
          if (mm) { m = parseInt(mm[1], 10); return; }
          var rm = /^r[=:](-?\d+)$/i.exec(tok);
          if (rm) { r = parseInt(rm[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, m=N ya da r=N yazın.', '"' + tok + '" is not understood: write a number, m=N or r=N.');
          keys.push(parseInt(tok, 10));
        });
        if (m === null) throw T('m=N yazmalısınız (tablo boyutu).', 'You must write m=N (the table size).');
        if (r === null) throw T('r=N yazmalısınız (ikinci hash için, r < m).', 'You must write r=N (for the second hash, r < m).');
        if (m < 3 || m > 16) throw T('m 3 ile 16 arasında olmalı.', 'm must be between 3 and 16.');
        if (r < 2 || r >= m) throw T('r, 2 ile m-1 arasında olmalı.', 'r must be between 2 and m-1.');
        if (keys.length < 4) throw T('En az 4 anahtar yazın.', 'Write at least 4 keys.');
        if (keys.length > 24) throw T('En çok 24 anahtar.', 'At most 24 keys.');
        return { m: m, r: r, keys: keys };
      },
      format: function (d) { return 'm=' + d.m + ' r=' + d.r + ' ' + d.keys.join(' '); },
      bad: ['', 'm=1 r=1 5 8', 'm=99 r=11 5 8', '5 8 13', '5 8 x 13 m=11 r=7', 'm=abc r=7 5 8'],
      tokens: function (d) { return d.keys.map(String); }
    },
    build: function (S, d) {
      var m = d.m, r = d.r, keys = d.keys;
      var X0 = 90, Y0 = 190, W = 54, H = 46, GAP = 8;
      var RX = X0 + m * (W + GAP) + 40;

      for (var i = 0; i < m; i++) S.box('c' + i, { x: X0 + i * (W + GAP), y: Y0, w: W, h: H, text: '', style: 'empty', size: 15, above: String(i) });
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: T('tablo[] =', 'table[] ='), anchor: 'end', size: 15, bold: true });
      S.label('mlbl', { x: X0, y: 40, text: 'm = ' + m + ', R = ' + r, size: 18, bold: true, mono: true });
      S.label('h1h2', { x: X0, y: 64, text: '', style: 'dim', size: 14, mono: true, anchor: 'start' });
      S.label('dec', { x: RX, y: Y0 + H / 2 - 8, text: '', size: 16, bold: true, mono: true, anchor: 'start' });
      S.label('probe', { x: RX, y: Y0 + H / 2 + 18, text: '', size: 14, mono: true, anchor: 'start', style: 'dim' });

      S.step(T('Çift hash: `h1(key) = key mod ' + m + '` ev hücresini verir; `h2(key) = ' + r + ' - (key mod ' + r + ')` (hiçbir zaman 0 değil) o anahtarın **kendi adımını** verir. Çakışan iki anahtar genelde farklı yollardan gider.',
               'Double hashing: `h1(key) = key mod ' + m + '` gives the home cell; `h2(key) = ' + r + ' - (key mod ' + r + ')` (never 0) gives THIS key\'s own step. Two keys that collide usually take different paths from there.'),
             { c: [1, 2], java: [1, 2] });

      var state = new Array(m).fill('E'), table = new Array(m).fill(null), insertResults = [];
      keys.forEach(function (key, k) {
        S.at(k);
        var home = h1(key, m), step = h2(key, r), idx = home, seq = [home], placed = false, probes = 0;
        S.set('h1h2', { text: 'h1(' + key + ') = ' + home + ',  h2(' + key + ') = ' + r + ' - (' + key + ' mod ' + r + ') = ' + step });
        for (var i2 = 0; i2 < m; i2++) {
          probes = i2 + 1;
          S.set('c' + idx, { style: 'hl' });
          S.set('probe', { text: 'probe: ' + seq.join(' → ') });
          if (state[idx] !== 'O') {
            table[idx] = key; state[idx] = 'O';
            S.set('c' + idx, { text: String(key), style: 'new' });
            S.set('dec', { text: probes > 1 ? T('yerleşti (' + probes + '. yoklama)', 'placed (probe ' + probes + ')') : T('yerleşti', 'placed'), style: 'new' });
            placed = true;
            S.step(probes > 1
              ? T('`insert(' + key + ')`: ev ' + home + ' dolu, adım ' + step + '. ' + (probes - 1) + ' sıçramadan sonra hücre ' + idx + ' boş bulundu: `' + seq.join(' → ') + '`.',
                  '`insert(' + key + ')`: home ' + home + ' is occupied, step ' + step + '. After ' + (probes - 1) + ' jump' + (probes - 1 > 1 ? 's' : '') + ', cell ' + idx + ' was found free: `' + seq.join(' → ') + '`.')
              : T('`insert(' + key + ')`: ev hücre ' + idx + ' boştu, doğrudan yerleşir.', '`insert(' + key + ')`: home cell ' + idx + ' was empty, it settles immediately.'),
              { c: [4, 5, 6, 7, 8, 9], java: [4, 5, 6, 7, 8, 9] });
            break;
          } else {
            S.set('dec', { text: T('dolu, adımla ilerle', 'occupied, take the step'), style: 'hl' });
            S.step(T('Hücre ' + idx + ' dolu — `idx = (' + idx + ' + ' + step + ') mod ' + m + '` = ' + ((idx + step) % m) + '.',
                     'Cell ' + idx + ' is occupied — `idx = (' + idx + ' + ' + step + ') mod ' + m + '` = ' + ((idx + step) % m) + '.'), { c: [7, 11], java: [7, 11] });
            idx = (idx + step) % m;
            seq.push(idx);
          }
        }
        if (!placed) {
          var occupied = state.filter(function (s) { return s === 'O'; }).length;
          var cycled = occupied < m;
          S.set('dec', { text: cycled ? T('döngü — boş hücre yok!', 'cycle — no free slot reached!') : T('tablo dolu!', 'table full!'), style: 'del' });
          S.step(cycled
            ? T('`' + m + '` yoklama denendi ama aynı birkaç hücre tekrar tekrar ziyaret edildi — tablo dolu DEĞİL (' + (m - occupied) + ' hücre boş), fakat bu anahtarın adımı (`' + step + '`) `m = ' + m + '` ile ortak bir çarpan paylaşıyor, o yüzden döngü tüm tabloyu tarayamıyor — **işaretlendi**. Bu yüzden `m` asal seçilir.',
                'All `' + m + '` probes were tried but the same few cells kept repeating — the table is NOT full (' + (m - occupied) + ' cells are empty), but this key\'s step (`' + step + '`) shares a common factor with `m = ' + m + '`, so the cycle can never scan the whole table — **flagged**. This is why `m` is chosen prime.')
            : T('`' + m + '` hücrenin hepsi yoklandı, hiçbiri boş değil — tablo gerçekten **dolu**.', 'All `' + m + '` cells were probed, none was free — the table is genuinely **full**.'),
            { c: [13], java: [13] });
        }
        insertResults.push({ key: key, placed: placed, probes: probes, cycled: !placed && (state.filter(function (s) { return s === 'O'; }).length) < m });
      });

      S.at(null);
      var finalTable = []; for (var q = 0; q < m; q++) finalTable.push(state[q] === 'O' ? table[q] : null);
      S.result = { table: finalTable, insertResults: insertResults };
      var placedCount = insertResults.filter(function (r2) { return r2.placed; }).length;
      var totalProbes = insertResults.reduce(function (s, r2) { return s + r2.probes; }, 0);
      var lin = simulateLinear(keys, m);
      S.step(T('Bitti: ' + placedCount + '/' + insertResults.length + ' ekleme, toplam ' + totalProbes + ' yoklama. **Aynı anahtarlarla** doğrusal yoklama ' + lin.placed + '/' + keys.length + ' yerleştirir, toplam ' + lin.total + ' yoklamada — çift hash genelde daha az kümelenme, daha az yoklama demektir.',
               'Done: ' + placedCount + '/' + insertResults.length + ' inserts, ' + totalProbes + ' probes in total. Linear probing **on the very same keys** places ' + lin.placed + '/' + keys.length + ', taking ' + lin.total + ' probes — double hashing usually means less clustering and fewer probes.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
