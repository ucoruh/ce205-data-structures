/* Week 6 — the division hash function: h(k) = k mod m. Maps any integer key to a table index in [0..m-1] in O(1).
 * Two keys that hash to the same index are a COLLISION. The choice of m matters a lot: if m shares a common
 * factor with the pattern of the keys (classic bad case: m a power of 10 and keys that are multiples of 10), many
 * keys pile into the same few buckets. A prime m avoids that for most real key patterns.
 * Drawing standard: one row "table[] =" with index numbers above; each key is dropped as a small token stacked
 * under its bucket — a tall stack means heavy clustering; the formula (with the numbers plugged in) is on the
 * right. Examples (normal, hard, edge — including an m-is-prime vs m-is-a-power-of-10 comparison), random data and
 * own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '/* the extra "+ m) % m" guards against negative keys: in C, key % m can be negative when key < 0 */',
    'int hash_division(int key, int m) {',
    '    return ((key % m) + m) % m;',
    '}'
  ];
  var JAVA = [
    '// the extra "+ m) % m" guards against negative keys: in Java, key % m can be negative when key < 0',
    'static int hashDivision(int key, int m) {',
    '    return ((key % m) + m) % m;',
    '}'
  ];

  D.define({
    id: 'hash-function-division',
    title: T('Bölme yöntemiyle hash fonksiyonu: h(k) = k mod m', 'Division hash function: h(k) = k mod m'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('m = 11 (asal), 12 rastgele anahtar', 'm = 11 (prime), 12 assorted keys'),
        data: { m: 11, keys: [23, 44, 15, 77, 8, 62, 31, 50, 19, 96, 27, 5] } },
      { id: 'hard', level: 'hard', name: T('m = 11 asal ama anahtarlar 11 adım aralıklı: yine de çakışır', 'm = 11 is prime, but the keys are 11 apart: it still collides'),
        data: { m: 11, keys: [12, 23, 34, 45, 56, 67, 78, 89, 100, 111, 122, 133, 144] } },
      { id: 'power-of-10', level: 'edge', name: T('m = 10 (10\'un kuvveti), onun katı anahtarlar: felaket kümelenme', 'm = 10 (a power of 10), keys that are multiples of 10: catastrophic clustering'),
        data: { m: 10, keys: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110] } },
      { id: 'prime-same-keys', level: 'edge', name: T('Aynı anahtarlar, m = 13 (asal): mükemmel dağılım', 'Same keys, m = 13 (prime): perfect spread'),
        data: { m: 13, keys: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110] } },
      { id: 'negative-keys', level: 'edge', name: T('Negatif anahtarlar: koruma olmadan negatif indeks çıkardı', 'Negative keys: without the guard the index would be negative'),
        data: { m: 11, keys: [-3, -15, -27, 5, 18, -42, 33, -8, 50, -19, 7] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    /** Independent computation: bucket assignment and collision count, coded separately from build(). */
    reference: function (d) {
      var m = d.m, buckets = [], i, collisions = 0;
      for (i = 0; i < m; i++) buckets.push([]);
      d.keys.forEach(function (key) {
        var idx = ((key % m) + m) % m;
        if (buckets[idx].length > 0) collisions++;
        buckets[idx].push(key);
      });
      return { buckets: buckets, collisions: collisions };
    },
    random: function (level, r) {
      var primes = [7, 11, 13], m = primes[D.randInt(r, 0, primes.length - 1)];
      var n = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level];
      var allowNeg = level === 'extreme' || level === 'hard';
      var keys = [], i;
      for (i = 0; i < n; i++) {
        var v = D.randInt(r, allowNeg ? -200 : 1, 200);
        keys.push(v);
      }
      return { m: m, keys: keys };
    },
    input: {
      hint: T('Örnek: m=11 23 44 15 77 8 62 31 50 19 96 27 5  (m tablo boyutu, sonra anahtarlar; negatif olabilir)',
              'Example: m=11 23 44 15 77 8 62 31 50 19 96 27 5  (m is the table size, then the keys; negatives allowed)'),
      parse: function (text) {
        var m = null, keys = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mm = /^m[=:](-?\d+)$/i.exec(tok);
          if (mm) { m = parseInt(mm[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı ya da m=N yazın.', '"' + tok + '" is not understood: write a number or m=N.');
          keys.push(parseInt(tok, 10));
        });
        if (m === null) throw T('m=N yazmalısınız (tablo boyutu).', 'You must write m=N (the table size).');
        if (m < 2 || m > 16) throw T('m 2 ile 16 arasında olmalı (bir satıra sığmalı).', 'm must be between 2 and 16 (must fit on one row).');
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
      var X0 = 90, Y0 = 140, W = 54, H = 46, GAP = 8;
      var RX = X0 + m * (W + GAP) + 46;
      var TOKW = 46, TOKH = 28, TOKGAP = 5, STACKY = Y0 + H + 24;

      for (var i = 0; i < m; i++) S.box('b' + i, { x: X0 + i * (W + GAP), y: Y0, w: W, h: H, text: '', style: 'empty', size: 16, above: String(i) });
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: T('tablo[] =', 'table[] ='), anchor: 'end', size: 15, bold: true });
      S.label('mlbl', { x: X0, y: 40, text: 'm = ' + m, size: 18, bold: true, mono: true });
      S.label('dec', { x: RX, y: Y0 + H / 2 + 5, text: '', size: 16, bold: true, mono: true, anchor: 'start' });

      S.step(T('Bölme yöntemi: `h(k) = k mod ' + m + '`. Her anahtar `[0.. ' + (m - 1) + ']` aralığında bir tablo indeksine eşlenir — O(1). ' + keys.length + ' anahtar sırayla eklenecek.',
               'The division method: `h(k) = k mod ' + m + '`. Every key maps to a table index in `[0..' + (m - 1) + ']` — O(1). ' + keys.length + ' keys will be inserted in order.'),
             { c: [2, 3], java: [2, 3] });

      var counts = new Array(m).fill(0), collisions = 0;
      keys.forEach(function (key, k) {
        var idx = ((key % m) + m) % m;
        var wasEmpty = counts[idx] === 0;
        S.at(k);
        var y = STACKY + counts[idx] * (TOKH + TOKGAP);
        S.box('tok' + idx + '_' + counts[idx], { x: X0 + idx * (W + GAP) + (W - TOKW) / 2, y: y, w: TOKW, h: TOKH, text: String(key), size: 13, style: wasEmpty ? 'new' : 'del' });
        S.set('b' + idx, { style: counts[idx] > 0 ? 'del' : 'hl' });
        counts[idx]++;
        if (!wasEmpty) collisions++;
        var formula = key < 0
          ? T('h(' + key + ') = ((' + key + ' mod ' + m + ') + ' + m + ') mod ' + m + ' = ' + idx, 'h(' + key + ') = ((' + key + ' mod ' + m + ') + ' + m + ') mod ' + m + ' = ' + idx)
          : ('h(' + key + ') = ' + key + ' mod ' + m + ' = ' + idx);
        S.set('dec', { text: formula, style: wasEmpty ? 'hl' : 'del' });
        S.step(wasEmpty
          ? T('`h(' + key + ') = ' + idx + '` — hücre ' + idx + ' boştu, anahtar oraya yerleşir.',
              '`h(' + key + ') = ' + idx + '` — cell ' + idx + ' was empty, the key settles there.')
          : T('`h(' + key + ') = ' + idx + '` — hücre ' + idx + ' zaten dolu (' + counts[idx] + '. anahtar burada) → **çakışma**.',
              '`h(' + key + ') = ' + idx + '` — cell ' + idx + ' is already occupied (key #' + counts[idx] + ' landing here) → **collision**.'),
               { c: [3], java: [3] });
        S.set('b' + idx, { style: counts[idx] > 1 ? 'del' : 'new' });
      });

      S.at(null);
      var buckets = []; for (var q = 0; q < m; q++) buckets.push([]);
      keys.forEach(function (key) { buckets[((key % m) + m) % m].push(key); });
      S.result = { buckets: buckets, collisions: collisions };
      var used = buckets.filter(function (b) { return b.length > 0; }).length;
      S.step(T('Bitti: ' + keys.length + ' anahtar, ' + collisions + ' çakışma, ' + used + '/' + m + ' hücre kullanıldı. m\'in seçimi kritik: anahtarların örüntüsüyle ortak çarpanı olmayan (genelde asal) bir m, kümelenmeyi azaltır.',
               'Done: ' + keys.length + ' keys, ' + collisions + ' collision' + (collisions === 1 ? '' : 's') + ', ' + used + '/' + m + ' cells used. The choice of m matters: an m with no common factor with the keys\' pattern (usually prime) reduces clustering.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
