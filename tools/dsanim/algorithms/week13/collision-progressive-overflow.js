/* Week 13 — progressive overflow (linear probing) on disk: one record per slot; if the home slot h(key) = key mod m
   is occupied, probe the NEXT slot, wrapping around, until an empty slot is found, the key is already there
   (duplicate), or every slot has been tried (file full). Examples (normal, hard, edge: file fills up, edge: every
   key shares one home slot and the file fills), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '#define EMPTY (-1)    /* marks an unused slot */',
    '',
    'int po_insert(int table[], int m, int key, int *probes) {',
    '    int h = key % m, i = h, tries = 0;',
    '    while (tries < m) {',
    '        (*probes)++;                                   /* one slot probed = one disk access */',
    '        if (table[i] == EMPTY) { table[i] = key; return i; }   /* home or next free slot */',
    '        if (table[i] == key) return -2;                        /* duplicate key */',
    '        i = (i + 1) % m;                                       /* progressive overflow: try the next slot */',
    '        tries++;',
    '    }',
    '    return -1;                                                 /* every slot tried: file is full */',
    '}'
  ];
  var JAVA = [
    'static final int EMPTY = -1;   // marks an unused slot',
    '',
    'static int poInsert(int[] table, int m, int key, int[] probes) {',
    '    int h = key % m, i = h, tries = 0;',
    '    while (tries < m) {',
    '        probes[0]++;                                     // one slot probed = one disk access',
    '        if (table[i] == EMPTY) { table[i] = key; return i; }     // home or next free slot',
    '        if (table[i] == key) return -2;                          // duplicate key',
    '        i = (i + 1) % m;                                         // progressive overflow: try the next slot',
    '        tries++;',
    '    }',
    '    return -1;                                                   // every slot tried: file is full',
    '}'
  ];

  D.define({
    id: 'collision-progressive-overflow',
    title: T('İlerleyici taşma (doğrusal yoklama): diskte çakışma çözümü', 'Progressive overflow (linear probing): resolving collisions on disk'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('m=13, 10 anahtar, ılımlı yük (%77)', 'm=13, 10 keys, moderate load (77%)'),
        data: { m: 13, keys: [7, 20, 33, 3, 16, 29, 10, 23, 5, 18] } },
      { id: 'hard', level: 'hard', name: T('m=11, 10 anahtar, ağır yük (%91), uzun yoklama zincirleri', 'm=11, 10 keys, heavy load (91%), long probe runs'),
        data: { m: 11, keys: [2, 13, 24, 35, 4, 15, 26, 6, 17, 8] } },
      { id: 'edge-full', level: 'edge', name: T('Uç: dosya tam dolar, 10. ekleme başarısız (dosya dolu)', 'Edge: the file fills exactly, the 10th insert fails (file full)'),
        data: { m: 9, keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 45] } },
      { id: 'edge-same-home', level: 'edge', name: T('Uç: tüm anahtarlar aynı ana konuma düşer, dosya dolar', 'Edge: every key shares the same home slot, the file fills'),
        data: { m: 9, keys: [3, 12, 21, 30, 39, 48, 57, 66, 75, 84] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      var table = new Array(d.m).fill(null), probes = 0, results = [];
      d.keys.forEach(function (key) {
        var h = key % d.m, i = h, tries = 0, done = false;
        while (tries < d.m) {
          probes++;
          if (table[i] === null) { table[i] = key; results.push({ key: key, status: 'inserted', slot: i }); done = true; break; }
          if (table[i] === key) { results.push({ key: key, status: 'duplicate', slot: i }); done = true; break; }
          i = (i + 1) % d.m; tries++;
        }
        if (!done) results.push({ key: key, status: 'full' });
      });
      return { probes: probes, results: results };
    },
    random: function (level, r) {
      var m = level === 'extreme' ? 7 : (level === 'hard' ? 11 : 13);
      var n = { easy: 10, normal: 10, hard: 10, extreme: 10 }[level];
      var keys = [], seen = {};
      for (var i = 0; i < n; i++) { var v; do { v = D.randInt(r, 1, 90); } while (seen[v]); seen[v] = true; keys.push(v); }
      return { m: m, keys: keys };
    },
    input: {
      hint: T('Örnek: m=13  7 20 33 3 16 29 10 23 5 18', 'Example: m=13  7 20 33 3 16 29 10 23 5 18'),
      parse: function (text) {
        var m = 13, keys = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mm = /^m[=:](\d+)$/i.exec(tok);
          if (mm) { m = parseInt(mm[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı ya da m=N yazın.', '"' + tok + '" is not understood: write a number or m=N.');
          keys.push(parseInt(tok, 10));
        });
        if (m < 3 || m > 20) throw T('m 3-20 arasında olmalı.', 'm must be between 3 and 20.');
        if (!keys.length) throw T('En az bir anahtar yazın.', 'Write at least one key.');
        if (keys.length > 20) throw T('En çok 20 anahtar.', 'At most 20 keys.');
        return { m: m, keys: keys };
      },
      format: function (d) { return 'm=' + d.m + '  ' + d.keys.join(' '); },
      bad: ['', 'm=0 5', 'm=2 5', '5 x 7', 'm=abc 5'],
      tokens: function (d) { return d.keys.map(String); }
    },
    build: function (S, d) {
      var m = d.m, X0 = 90, YD = 120, YB = 250, SW = 60, SH = 46, GAP = 6;
      var XR = X0 + m * (SW + GAP) + 30;
      S.label('rowD', { x: X0 - 16, y: YD + SH / 2 + 5, text: T('disk (m yuva) =', 'disk (m slots) ='), anchor: 'end', size: 15, bold: true });
      S.label('rowB', { x: X0 - 16, y: YB + SH / 2 + 5, text: T('RAM: yoklanan =', 'RAM: probing ='), anchor: 'end', size: 15, bold: true });
      for (var i = 0; i < m; i++) S.box('s' + i, { x: X0 + i * (SW + GAP), y: YD, w: SW, h: SH, text: '', style: 'empty', above: String(i), mono: true, size: 15 });
      S.box('probe', { x: X0, y: YB, w: SW + 20, h: SH, text: '', style: 'empty', mono: true, size: 15 });
      S.label('probes', { x: XR, y: YD - 12, text: 'probes = 0', size: 16, bold: true, mono: true, anchor: 'start' });
      S.label('ins', { x: XR, y: YD + 12, text: 'insertions = 0', size: 14, mono: true, anchor: 'start', style: 'dim' });
      S.label('errs', { x: XR, y: YD + 34, text: 'errors = 0', size: 14, mono: true, anchor: 'start', style: 'dim' });
      S.label('decision', { x: XR, y: YD + 62, text: '', size: 16, bold: true, mono: true, anchor: 'start' });

      var probes = 0, insertions = 0, errors = 0, results = [];
      function counters() { S.set('probes', { text: 'probes = ' + probes }); S.set('ins', { text: 'insertions = ' + insertions }); S.set('errs', { text: 'errors = ' + errors }); }
      counters();

      d.keys.forEach(function (key, k) {
        var detailed = k < 3;
        S.at(k);
        var h = key % m, i = h, tries = 0, done = false, run = 0;
        S.set('decision', { text: 'h(' + key + ')=' + key + '%' + m + '=' + h, style: 'active' });
        if (detailed) {
          S.step(T('`po_insert(table, ' + key + ', …)` — `h = ' + key + ' % ' + m + ' = ' + h + '`: yoklamaya buradan başla.', '`po_insert(table, ' + key + ', …)` — `h = ' + key + ' % ' + m + ' = ' + h + '`: start probing here.'),
                 { c: [4], java: [4] });
        }
        while (tries < m) {
          probes++;
          S.set('s' + i, { style: 'hl' });
          S.set('probe', { text: S.get('s' + i).text === '' ? '(empty)' : S.get('s' + i).text, style: 'hl' });
          counters();
          var cell = S.get('s' + i).text;
          if (cell === '') {
            S.set('s' + i, { text: String(key), style: 'new' });
            S.set('probe', { text: String(key), style: 'new' });
            insertions++;
            results.push({ key: key, status: 'inserted', slot: i });
            counters();
            S.step(detailed || run > 0
              ? T('`table[' + i + '] == EMPTY` → boş yuva bulundu' + (run ? (', ' + run + ' yoklamadan sonra') : '') + ': `table[' + i + '] = ' + key + '`.', '`table[' + i + '] == EMPTY` → empty slot found' + (run ? (' after ' + run + ' probe(s)') : '') + ': `table[' + i + '] = ' + key + '`.')
              : T(key + ' → yuva ' + i + '.', key + ' → slot ' + i + '.'),
              { c: [{ n: 7, note: T('boş mu? evet', 'empty? yes') }], java: [{ n: 7, note: T('empty? yes', 'empty? yes') }] });
            done = true;
            break;
          }
          if (Number(cell) === key) {
            S.set('s' + i, { style: 'del' });
            S.set('probe', { style: 'del' });
            errors++;
            results.push({ key: key, status: 'duplicate', slot: i });
            counters();
            S.step(T('`table[' + i + '] == key` (' + key + ') → **yinelenen anahtar**, zaten dosyada: eklenmez.', '`table[' + i + '] == key` (' + key + ') → **duplicate key**, already in the file: not inserted.'),
                   { c: [{ n: 7, note: T('boş mu? hayır', 'empty? no') }, { n: 8, note: T('eşit mi? evet', 'equal? yes') }], java: [{ n: 7, note: T('empty? no', 'empty? no') }, { n: 8, note: T('equal? yes', 'equal? yes') }] });
            done = true;
            break;
          }
          S.set('s' + i, { style: 'dim' });
          var next = (i + 1) % m;
          S.step(run === 0 && detailed
            ? T('`table[' + i + ']` dolu ve farklı bir anahtar (' + cell + ') → **ilerleyici taşma**: bir sonraki yuvaya geç: `i = (' + i + '+1) % ' + m + ' = ' + next + '`.', '`table[' + i + ']` is occupied by a different key (' + cell + ') → **progressive overflow**: move to the next slot: `i = (' + i + '+1) % ' + m + ' = ' + next + '`.')
            : T('yuva ' + i + ' dolu (' + cell + ') → yuva ' + next + '.', 'slot ' + i + ' occupied (' + cell + ') → slot ' + next + '.'),
            { c: [{ n: 7, note: T('boş mu? hayır', 'empty? no') }, { n: 8, note: T('eşit mi? hayır', 'equal? no') }, 9, 10], java: [{ n: 7, note: T('empty? no', 'empty? no') }, { n: 8, note: T('equal? no', 'equal? no') }, 9, 10] });
          i = next; tries++; run++;
        }
        if (!done) {
          errors++;
          results.push({ key: key, status: 'full' });
          S.set('decision', { text: T('dosya dolu!', 'file full!'), style: 'del' });
          S.set('probe', { text: '', style: 'del' });
          counters();
          S.step(T('`tries == M` (' + m + ') → tüm yuvalar denendi, boş yok → **dosya dolu**, ' + key + ' eklenemedi.', '`tries == M` (' + m + ') → every slot was tried, none empty → **file full**, ' + key + ' could not be inserted.'),
                 { c: [12], java: [12] });
        }
      });
      S.at(null);
      S.remove('probe');
      S.result = { probes: probes, results: results };
      S.step(T('Bitti: ' + d.keys.length + ' istek, ' + insertions + ' eklendi, ' + errors + ' hata (yinelenen/dosya dolu), toplam ' + probes + ' yoklama. Yoklama zinciri uzadıkça (asal kümelenme) sonraki eklemeler de yavaşlar.',
               'Done: ' + d.keys.length + ' request(s), ' + insertions + ' inserted, ' + errors + ' error(s) (duplicate/file full), ' + probes + ' probes in total. As probe runs grow (primary clustering), later insertions get slower too.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
