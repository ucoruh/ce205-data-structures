/* Week 14 -- linear hashing: no directory at all. Buckets split in a fixed ROUND-ROBIN order (bucket n,
   then n+1, ...), triggered by ANY overflow, not necessarily the overflowing bucket itself; a key's address
   is a simple modulo, bumped to the next level only when its home bucket has already been split this round. */
(function (D) {
  'use strict';
  var T = D.T;

  function cCode(n0, capacity) {
    return [
      '#define N0 ' + n0 + '                          /* initial bucket count */',
      '#define CAPACITY ' + capacity + '                     /* keys per bucket before it overflows */',
      '',
      'int address(int key, int level, int n) {',
      '    int a = key % (N0 << level);         /* N0 * 2^level buckets in the current round */',
      '    if (a < n) a = key % (N0 << (level + 1));  /* already split: use the next level */',
      '    return a;',
      '}',
      '',
      'void split(Hash *h) {                     /* always splits bucket h->n -- NOT the one that overflowed */',
      '    int new_index = (N0 << h->level) + h->n;',
      '    rehash_into(h, h->n, new_index);       /* bucket n\'s keys move to n or new_index, by address(key, level+1, 0) */',
      '    h->n++;',
      '    if (h->n == (N0 << h->level)) { h->n = 0; h->level++; }',
      '}',
      '',
      'void insert_key(Hash *h, int key) {',
      '    int a = address(key, h->level, h->n);',
      '    append(h->buckets[a], key);            /* always fits: an overflowing bucket just grows */',
      '    if (h->buckets[a]->n > CAPACITY) split(h);  /* ANY overflow triggers splitting bucket n */',
      '}'
    ];
  }
  function javaCode(n0, capacity) {
    return [
      'static final int N0 = ' + n0 + ';           // initial bucket count',
      'static final int CAPACITY = ' + capacity + ';      // keys per bucket before it overflows',
      '',
      'static int address(int key, int level, int n) {',
      '    int a = key % (N0 << level);          // N0 * 2^level buckets in the current round',
      '    if (a < n) a = key % (N0 << (level + 1)); // already split: use the next level',
      '    return a;',
      '}',
      '',
      'static void split(Hash h) {                // always splits bucket h.n -- NOT the one that overflowed',
      '    int newIndex = (N0 << h.level) + h.n;',
      '    rehashInto(h, h.n, newIndex);           // bucket n\'s keys move to n or newIndex, by address(key, level+1, 0)',
      '    h.n++;',
      '    if (h.n == (N0 << h.level)) { h.n = 0; h.level++; }',
      '}',
      '',
      'static void insertKey(Hash h, int key) {',
      '    int a = address(key, h.level, h.n);',
      '    append(h.buckets[a], key);              // always fits: an overflowing bucket just grows',
      '    if (h.buckets[a].n > CAPACITY) split(h); // ANY overflow triggers splitting bucket n',
      '}'
    ];
  }

  function addrOf(key, n0, level, n) {
    var a = key % (n0 * Math.pow(2, level));
    if (a < n) a = key % (n0 * Math.pow(2, level + 1));
    return a;
  }

  D.define({
    id: 'linear-hashing',
    title: T('Doğrusal (linear) hashleme', 'Linear hashing'),
    code: function (d) { return { c: cCode(d.n0, d.capacity), java: javaCode(d.n0, d.capacity) }; },
    presets: [
      { id: 'normal', level: 'normal', name: T('N0=4, capacity=2, 10 anahtar', 'N0=4, capacity=2, 10 keys'),
        data: { n0: 4, capacity: 2, keys: [9, 20, 15, 3, 25, 12, 7, 30, 1, 18] } },
      { id: 'hard', level: 'hard', name: T('N0=4, capacity=2, 12 dörtlü katı (yığılma)', 'N0=4, capacity=2, 12 multiples of 4 (clustering)'),
        data: { n0: 4, capacity: 2, keys: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48] } },
      { id: 'one-per-bucket', level: 'edge', name: T('Uç durum: N0=10, kova başına tam 1 anahtar, hiç taşma yok', 'Edge case: N0=10, exactly 1 key per bucket, no overflow at all'),
        data: { n0: 10, capacity: 2, keys: [0, 11, 22, 33, 44, 55, 66, 77, 88, 99] } },
      { id: 'tight', level: 'edge', name: T('Uç durum: N0=2, capacity=1, sık bölünme (tam tur)', 'Edge case: N0=2, capacity=1, frequent splits (a full round)'),
        data: { n0: 2, capacity: 1, keys: [5, 3, 8, 2, 7, 4, 9, 6, 11, 10] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      var n0 = d.n0, capacity = d.capacity;
      var level = 0, n = 0, reads = 0, writes = n0, splits = 0;
      var buckets = {};
      for (var i = 0; i < n0; i++) buckets[i] = [];
      d.keys.forEach(function (key) {
        var a = key % (n0 * Math.pow(2, level));
        if (a < n) a = key % (n0 * Math.pow(2, level + 1));
        reads++;
        buckets[a].push(key); writes++;
        if (buckets[a].length > capacity) {
          var newIndex = n0 * Math.pow(2, level) + n;
          var old = buckets[n]; buckets[n] = []; buckets[newIndex] = [];
          old.forEach(function (k) {
            var a2 = k % (n0 * Math.pow(2, level + 1));
            buckets[a2 === newIndex ? newIndex : n].push(k);
          });
          writes += 2; splits++;
          n++;
          if (n === n0 * Math.pow(2, level)) { n = 0; level++; }
        }
      });
      var out = [];
      Object.keys(buckets).forEach(function (k) { out.push({ index: parseInt(k, 10), keys: buckets[k].slice().sort(function (a2, b2) { return a2 - b2; }) }); });
      out.sort(function (a2, b2) { return a2.index - b2.index; });
      return { n0: n0, capacity: capacity, level: level, n: n, bucketCount: out.length, reads: reads, writes: writes, splits: splits, buckets: out };
    },
    random: function (level, r) {
      var m = { easy: 10, normal: 10, hard: 12, extreme: 12 }[level] || 10;
      var n0 = D.randInt(r, 2, 4), capacity = level === 'extreme' ? 1 : 2;
      var used = {}, keys = [];
      while (keys.length < m) { var v = D.randInt(r, 0, level === 'extreme' ? 40 : 60); if (!used[v]) { used[v] = true; keys.push(v); } }
      return { n0: n0, capacity: capacity, keys: keys };
    },
    input: {
      hint: T('Örnek: n0=4 capacity=2 keys: 9,20,15,3,25,12,7,30,1,18', 'Example: n0=4 capacity=2 keys: 9,20,15,3,25,12,7,30,1,18'),
      parse: function (text) {
        var n0 = 4, capacity = 2, keys = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m1 = /^n0[=:](\d+)$/i.exec(tok); if (m1) { n0 = parseInt(m1[1], 10); return; }
          var m2 = /^capacity[=:](\d+)$/i.exec(tok); if (m2) { capacity = parseInt(m2[1], 10); return; }
          if (/^keys?:?$/i.test(tok)) return;
          if (!/^\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: negatif olmayan bir tam sayı, n0=N, capacity=N ya da keys yazın.', '"' + tok + '" is not understood: write a non-negative integer, n0=N, capacity=N or keys.');
          keys.push(parseInt(tok, 10));
        });
        if (n0 < 2 || n0 > 12) throw T('n0 2 ile 12 arasında olmalı.', 'n0 must be between 2 and 12.');
        if (capacity < 1 || capacity > 6) throw T('capacity 1 ile 6 arasında olmalı.', 'capacity must be between 1 and 6.');
        if (keys.length < 10) throw T('En az 10 anahtar yazın.', 'Write at least 10 keys.');
        var seen = {}; keys.forEach(function (k) { if (seen[k]) throw T('Anahtarlar tekrarsız olmalı.', 'Keys must be unique.'); seen[k] = true; });
        return { n0: n0, capacity: capacity, keys: keys };
      },
      format: function (d) { return 'n0=' + d.n0 + ' capacity=' + d.capacity + ' keys: ' + d.keys.join(','); },
      bad: ['', 'n0=1 capacity=2 keys: 1,2,3,4,5,6,7,8,9,10', 'keys: 1,2,3,4,5,6,7,8,9', 'n0=abc keys: 1,2,3,4,5,6,7,8,9,10',
            'keys: 1,2,3,2,5,6,7,8,9,10', 'keys: 1,2,3,-4,5,6,7,8,9,10'],
      tokens: function (d) { return d.keys.map(String); }
    },
    build: function (S, d) {
      var n0 = d.n0, capacity = d.capacity, keys = d.keys;
      var level = 0, n = 0, reads = 0, writes = n0;
      var buckets = {};
      for (var i0 = 0; i0 < n0; i0++) buckets[i0] = [];

      S.label('title', { x: 20, y: 20, text: 'N0 = ' + n0 + '   CAPACITY = ' + capacity, size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('io', { x: 20, y: 44, text: T('okuma: 0  yazma: ' + n0, 'reads: 0  writes: ' + n0), size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('dec', { x: 20, y: 66, text: '', size: 13, mono: true, anchor: 'start', style: 'dim' });
      function setIO() { S.set('io', { text: T('okuma: ' + reads + '  yazma: ' + writes, 'reads: ' + reads + '  writes: ' + writes) }); }

      var Y_BKT = 150, X0 = 76, BW = 78, BGAP = 16;
      var drawn = [];
      function clearDraw() { drawn.forEach(function (id) { if (S.has(id)) S.remove(id); }); drawn = []; }
      function redraw(hl, splitFrom) {
        clearDraw();
        S.label('lv', { x: X0, y: Y_BKT - 40, text: T('seviye = ' + level + '   sıradaki bölünecek kova n = ' + n, 'level = ' + level + '   next bucket to split n = ' + n), size: 13, bold: true, anchor: 'start' });
        drawn.push('lv');
        var idxs = Object.keys(buckets).map(Number).sort(function (a, b) { return a - b; });
        idxs.forEach(function (idx, i) {
          var bid = 'b' + idx, style = hl && hl.indexOf(idx) >= 0 ? 'hl' : (splitFrom === idx ? 'active' : 'normal');
          S.box(bid, { x: X0 + i * (BW + BGAP), y: Y_BKT, w: BW, h: 44, text: buckets[idx].join(',') || T('(boş)', '(empty)'), style: style, size: 13, above: 'B' + idx });
          drawn.push(bid);
        });
        S.label('bktlbl', { x: X0 - 16, y: Y_BKT + 22, text: T('kovalar =', 'buckets ='), anchor: 'end', size: 13, bold: true }); drawn.push('bktlbl');
      }
      redraw();
      S.step(T('`N0=' + n0 + '` kova ile başlıyoruz (+' + n0 + ' yazma), `CAPACITY=' + capacity + '`. Dizin YOK: adres doğrudan `key mod (N0*2^level)` ile hesaplanır.',
               'We start with `N0=' + n0 + '` buckets (+' + n0 + ' writes), `CAPACITY=' + capacity + '`. There is NO directory: the address is computed directly as `key mod (N0*2^level)`.'),
             { c: [1, 2], java: [1, 2] });

      keys.forEach(function (key, ki) {
        S.at(ki); S.set('dec', { text: '' });
        var full0 = n0 * Math.pow(2, level);
        var a = key % full0, usedNext = false;
        if (a < n) { a = key % (full0 * 2); usedNext = true; }
        reads++; setIO();
        redraw([a]);
        S.step(T('`insert_key(' + key + ')`: `' + key + ' mod ' + full0 + ' = ' + (key % full0) + '`.' + (usedNext ? ' Bu kova (' + (key % full0) + ') bu turda zaten bölündü (' + (key % full0) + ' < n=' + n + '): bir sonraki seviye kullanılır -> `' + key + ' mod ' + (full0 * 2) + ' = ' + a + '`.' : ' `' + (key % full0) + ' < n=' + n + '` değil: bu adres kullanılır.') + ' Kova B' + a + ' OKUNUYOR (+1 okuma).',
                 '`insert_key(' + key + ')`: `' + key + ' mod ' + full0 + ' = ' + (key % full0) + '`.' + (usedNext ? ' That bucket (' + (key % full0) + ') was already split this round (' + (key % full0) + ' < n=' + n + '): the next level is used instead -> `' + key + ' mod ' + (full0 * 2) + ' = ' + a + '`.' : ' `' + (key % full0) + ' < n=' + n + '` is false: this address is used.') + ' Bucket B' + a + ' is READ (+1 read).'),
               { c: [18, 5, usedNext ? { n: 6, note: T('a<n mi? evet', 'a<n? yes') } : { n: 6, note: T('a<n mi? hayır', 'a<n? no') }, 7],
                 java: [18, 5, usedNext ? { n: 6, note: T('a<n mi? evet', 'a<n? yes') } : { n: 6, note: T('a<n mi? hayır', 'a<n? no') }, 7] });

        buckets[a].push(key); writes++; setIO();
        var overflow = buckets[a].length > capacity;
        redraw([a]);
        S.step(T('`' + key + '` B' + a + '\'e yazıldı (+1 yazma): şimdi ' + buckets[a].length + '/' + capacity + (overflow ? ' -- TAŞTI!' : '.'),
                 '`' + key + '` was written into B' + a + ' (+1 write): now ' + buckets[a].length + '/' + capacity + (overflow ? ' -- OVERFLOW!' : '.')),
               { c: [19, { n: 20, note: overflow ? T('taştı mı? evet', 'overflow? yes') : T('taştı mı? hayır', 'overflow? no') }], java: [19, { n: 20, note: overflow ? T('taştı mı? evet', 'overflow? yes') : T('taştı mı? hayır', 'overflow? no') }] });

        if (overflow) {
          var newIndex = n0 * Math.pow(2, level) + n;
          var oldN = n;
          var old = buckets[n]; buckets[n] = []; buckets[newIndex] = [];
          old.forEach(function (k) {
            var a2 = k % (n0 * Math.pow(2, level + 1));
            buckets[a2 === newIndex ? newIndex : n].push(k);
          });
          writes += 2; setIO();
          redraw([n, newIndex], oldN);
          S.set('dec', { text: T('B' + oldN + ' bölündü -> B' + newIndex, 'B' + oldN + ' split -> B' + newIndex) });
          S.step(T('Bir kova taştı: ama HER ZAMAN sırada bekleyen B' + oldN + ' bölünür (taşan kova B' + a + ' olmayabilir). Yeni B' + newIndex + ' oluşur (+2 yazma); B' + oldN + '\'in anahtarları `mod ' + (n0 * Math.pow(2, level + 1)) + '`\'e göre ikiye ayrılır.',
                   'Some bucket overflowed: but the bucket that ALWAYS splits is the one waiting in line, B' + oldN + ' (which may not be B' + a + ', the one that overflowed). A new B' + newIndex + ' is created (+2 writes); B' + oldN + '\'s keys are redistributed by `mod ' + (n0 * Math.pow(2, level + 1)) + '`.'),
                 { c: [10, 11, 12, 13], java: [10, 11, 12, 13] });
          n++;
          if (n === n0 * Math.pow(2, level)) {
            n = 0; level++;
            redraw();
            S.step(T('`n` `N0*2^level`\'e ulaştı: bu TUR bitti. `n=0`, `level=' + level + '`\'e çıktı -- artık her kova iki katına çıkmış oldu.',
                     '`n` reached `N0*2^level`: this ROUND is complete. `n=0`, `level` becomes ' + level + ' -- every bucket has now doubled.'),
                   { c: [{ n: 14, note: T('tur bitti mi? evet', 'round complete? yes') }], java: [{ n: 14, note: T('tur bitti mi? evet', 'round complete? yes') }] });
          }
        }
        S.set('dec', { text: '' });
      });

      S.at(null);
      redraw();
      var out = [];
      Object.keys(buckets).map(Number).sort(function (a, b) { return a - b; }).forEach(function (idx) { out.push({ index: idx, keys: buckets[idx].slice().sort(function (a2, b2) { return a2 - b2; }) }); });
      S.result = { n0: n0, capacity: capacity, level: level, n: n, bucketCount: out.length, reads: reads, writes: writes, splits: out.length - n0, buckets: out };
      S.step(T('Bitti: ' + keys.length + ' ekleme, ' + out.length + ' kova (`level=' + level + '`, `n=' + n + '`), ' + reads + ' okuma / ' + writes + ' yazma. Dizin hiç gerekmedi -- yalnız basit bir mod işlemi ve bir sayaç (n).',
               'Done: ' + keys.length + ' inserts, ' + out.length + ' buckets (`level=' + level + '`, `n=' + n + '`), ' + reads + ' reads / ' + writes + ' writes. No directory was ever needed -- just a modulo and one counter (n).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
