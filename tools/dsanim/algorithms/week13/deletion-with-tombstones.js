/* Week 13 — deletion with tombstones: in a probed (linearly-hashed) file, deleting a record cannot just clear its
   slot to EMPTY — a later search for a DIFFERENT key that once probed past this slot would then stop too early and
   wrongly report "not found". A TOMBSTONE ("something was here, keep looking") fixes this; a search skips over
   tombstones but a later INSERT may reuse one. Examples (normal, hard: two tombstones in one chain, edge: delete
   then reinsert the same key, edge: the whole table is tombstones/occupied with no true-empty slot), random data
   and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '#define EMPTY (-1)',
    '#define TOMB  (-2)   /* deleted marker: "something was here, keep looking" */',
    '',
    'int ts_find(int table[], int m, int key) {',
    '    int i = key % m, tries = 0;',
    '    while (tries < m) {',
    '        if (table[i] == EMPTY) return -1;      /* truly empty: nothing was ever probed past here */',
    '        if (table[i] == key) return i;           /* found */',
    '        i = (i + 1) % m; tries++;                 /* TOMB or a different key: keep going */',
    '    }',
    '    return -1;                                     /* whole file tried, no empty and no match */',
    '}',
    '',
    'int ts_delete(int table[], int m, int key) {',
    '    int i = ts_find(table, m, key);',
    '    if (i < 0) return -1;',
    '    table[i] = TOMB;                                /* NOT EMPTY: later finds must not stop here */',
    '    return i;',
    '}',
    '',
    'int ts_insert(int table[], int m, int key) {',
    '    int i = key % m, tries = 0;',
    '    while (tries < m) {',
    '        if (table[i] == EMPTY || table[i] == TOMB) { table[i] = key; return i; }   /* tombstones are reused */',
    '        if (table[i] == key) return -2;              /* duplicate */',
    '        i = (i + 1) % m; tries++;',
    '    }',
    '    return -1;                                        /* file full */',
    '}'
  ];
  var JAVA = [
    'static final int EMPTY = -1, TOMB = -2;   // TOMB = deleted marker: "something was here, keep looking"',
    '',
    'static int tsFind(int[] table, int m, int key) {',
    '    int i = key % m, tries = 0;',
    '    while (tries < m) {',
    '        if (table[i] == EMPTY) return -1;         // truly empty: nothing was ever probed past here',
    '        if (table[i] == key) return i;              // found',
    '        i = (i + 1) % m; tries++;                    // TOMB or a different key: keep going',
    '    }',
    '    return -1;                                        // whole file tried, no empty and no match',
    '}',
    '',
    'static int tsDelete(int[] table, int m, int key) {',
    '    int i = tsFind(table, m, key);',
    '    if (i < 0) return -1;',
    '    table[i] = TOMB;                                   // NOT EMPTY: later finds must not stop here',
    '    return i;',
    '}',
    '',
    'static int tsInsert(int[] table, int m, int key) {',
    '    int i = key % m, tries = 0;',
    '    while (tries < m) {',
    '        if (table[i] == EMPTY || table[i] == TOMB) { table[i] = key; return i; }   // tombstones are reused',
    '        if (table[i] == key) return -2;                 // duplicate',
    '        i = (i + 1) % m; tries++;',
    '    }',
    '    return -1;                                           // file full',
    '}'
  ];

  D.define({
    id: 'deletion-with-tombstones',
    title: T('Mezar taşıyla silme: yoklamalı dosyada güvenli silme', 'Deletion with tombstones: safe deletion in a probed file'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('m=13, 3\'lü zincirin başı silinir, arama mezar taşını atlar', 'm=13, the head of a 3-chain is deleted, search skips the tombstone'),
        data: { m: 13, insertKeys: [5, 18, 31, 1, 2, 3, 4, 9, 10, 11, 12], deleteKeys: [5], searchFound: 18, searchMissing: 44, reinsertKey: 57 } },
      { id: 'hard', level: 'hard', name: T('m=13, 5\'li zincirde iki silme (iki mezar taşı art arda)', 'm=13, two deletions in a 5-chain (two tombstones to skip)'),
        data: { m: 13, insertKeys: [2, 15, 28, 41, 54, 7, 8, 9, 10, 11, 0], deleteKeys: [15, 41], searchFound: 54, searchMissing: 67, reinsertKey: 80 } },
      { id: 'edge-reinsert-same', level: 'edge', name: T('Uç: bir anahtar silinip aynı anahtar yeniden eklenir', 'Edge: a key is deleted, then the very same key is reinserted'),
        data: { m: 11, insertKeys: [3, 14, 25, 0, 1, 2, 6, 7, 8, 9], deleteKeys: [3], searchFound: 14, searchMissing: 36, reinsertKey: 3 } },
      { id: 'edge-all-tombstones', level: 'edge', name: T('Uç: dosya tamamen dolu; bir zincirin tamamı silinir, gerçek boş yuva yok', 'Edge: the file is completely full; a whole chain is deleted, no true-empty slot remains'),
        data: { m: 11, insertKeys: [4, 15, 26, 22, 12, 13, 14, 18, 19, 20, 21], deleteKeys: [4, 15, 26], searchFound: 18, searchMissing: 37, reinsertKey: 37 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.insertKeys.length; },
    reference: function (d) {
      var table = new Array(d.m).fill(null);
      function find(key) {
        var i = key % d.m, tries = 0;
        while (tries < d.m) {
          if (table[i] === null) return -1;
          if (table[i] === key) return i;
          i = (i + 1) % d.m; tries++;
        }
        return -1;
      }
      function insert(key) {
        var i = key % d.m, tries = 0;
        while (tries < d.m) {
          if (table[i] === null || table[i] === 'TOMB') { var reused = table[i] === 'TOMB'; table[i] = key; return { slot: i, reused: reused }; }
          if (table[i] === key) return { slot: -2, reused: false };
          i = (i + 1) % d.m; tries++;
        }
        return { slot: -1, reused: false };
      }
      var insertResults = d.insertKeys.map(insert);
      var deleteResults = d.deleteKeys.map(function (key) { var i = find(key); if (i >= 0) table[i] = 'TOMB'; return i; });
      var foundResult = find(d.searchFound), missingResult = find(d.searchMissing);
      var reinsertResult = insert(d.reinsertKey);
      return {
        table: table.map(function (v) { return v === null ? 'EMPTY' : v; }),
        insertResults: insertResults, deleteResults: deleteResults,
        foundResult: foundResult, missingResult: missingResult, reinsertResult: reinsertResult
      };
    },
    random: function (level, r) {
      var m = level === 'extreme' ? 8 : (level === 'hard' ? 11 : 13);
      var n = { easy: 10, normal: 10, hard: 11, extreme: 12 }[level], keys = [], seen = {};
      for (var i = 0; i < n; i++) { var v; do { v = D.randInt(r, 1, 80); } while (seen[v]); seen[v] = true; keys.push(v); }
      var nd = level === 'hard' || level === 'extreme' ? 2 : 1, deleteKeys = [];
      for (var j = 0; j < nd; j++) deleteKeys.push(keys[D.randInt(r, 0, n - 1)]);
      var searchFound = keys[D.randInt(r, 0, n - 1)];
      var searchMissing; do { searchMissing = D.randInt(r, 1, 90); } while (seen[searchMissing]);
      var reinsertKey; do { reinsertKey = D.randInt(r, 1, 90); } while (seen[reinsertKey] && reinsertKey !== deleteKeys[0]);
      return { m: m, insertKeys: keys, deleteKeys: deleteKeys, searchFound: searchFound, searchMissing: searchMissing, reinsertKey: reinsertKey };
    },
    input: {
      hint: T('Örnek: m=13  ekle=5,18,31,1,2,3,4,9,10,11,12 sil=5 bul=18 yok=44 yenidenekle=57',
              'Example: m=13  insert=5,18,31,1,2,3,4,9,10,11,12 delete=5 found=18 missing=44 reinsert=57'),
      parse: function (text) {
        var m = 13, insertKeys = [], deleteKeys = [], searchFound = null, searchMissing = null, reinsertKey = null;
        String(text).trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
          var mm = /^m[=:](\d+)$/i.exec(tok);
          var mi = /^(?:ekle|insert)[=:]([\d,]+)$/i.exec(tok);
          var md = /^(?:sil|delete)[=:]([\d,]+)$/i.exec(tok);
          var mf = /^(?:bul|found)[=:](-?\d+)$/i.exec(tok);
          var mx = /^(?:yok|missing)[=:](-?\d+)$/i.exec(tok);
          var mr = /^(?:yenidenekle|reinsert)[=:](-?\d+)$/i.exec(tok);
          if (mm) { m = parseInt(mm[1], 10); return; }
          if (mi) { insertKeys = mi[1].split(',').map(Number); return; }
          if (md) { deleteKeys = md[1].split(',').map(Number); return; }
          if (mf) { searchFound = parseInt(mf[1], 10); return; }
          if (mx) { searchMissing = parseInt(mx[1], 10); return; }
          if (mr) { reinsertKey = parseInt(mr[1], 10); return; }
          throw T('"' + tok + '" anlaşılmadı.', '"' + tok + '" is not understood.');
        });
        if (!insertKeys.length || !deleteKeys.length || searchFound === null || searchMissing === null || reinsertKey === null)
          throw T('m, ekle, sil, bul, yok, yenidenekle alanlarının hepsini yazın.', 'Write all of m, insert, delete, found, missing, reinsert.');
        if (m < 3 || m > 20) throw T('m 3-20 arasında olmalı.', 'm must be between 3 and 20.');
        return { m: m, insertKeys: insertKeys, deleteKeys: deleteKeys, searchFound: searchFound, searchMissing: searchMissing, reinsertKey: reinsertKey };
      },
      format: function (d) { return 'm=' + d.m + ' insert=' + d.insertKeys.join(',') + ' delete=' + d.deleteKeys.join(',') + ' found=' + d.searchFound + ' missing=' + d.searchMissing + ' reinsert=' + d.reinsertKey; },
      bad: ['', 'm=0 insert=5', 'insert=5,6 delete=1 found=1 missing=2', 'm=9 insert=5,6'],
      tokens: function (d) { return d.insertKeys.map(String); }
    },
    build: function (S, d) {
      var m = d.m, X0 = 90, YD = 120, YB = 250, SW = 58, SH = 46, GAP = 6;
      var XR = X0 + m * (SW + GAP) + 30;
      S.label('rowD', { x: X0 - 16, y: YD + SH / 2 + 5, text: T('disk (m yuva) =', 'disk (m slots) ='), anchor: 'end', size: 15, bold: true });
      S.label('rowB', { x: X0 - 16, y: YB + SH / 2 + 5, text: T('RAM: yoklanan =', 'RAM: probing ='), anchor: 'end', size: 15, bold: true });
      for (var i = 0; i < m; i++) S.box('s' + i, { x: X0 + i * (SW + GAP), y: YD, w: SW, h: SH, text: '', style: 'empty', above: String(i), mono: true, size: 14 });
      S.box('probe', { x: X0, y: YB, w: SW + 30, h: SH, text: '', style: 'empty', mono: true, size: 15 });
      S.label('decision', { x: XR, y: YD, text: '', size: 15, bold: true, mono: true, anchor: 'start' });
      S.label('phase', { x: XR, y: YD - 28, text: '', size: 15, bold: true, anchor: 'start', style: 'active' });

      var table = new Array(m).fill(null); // null = empty, 'TOMB' = tombstone, else the key
      function cellStyle(i) { return table[i] === null ? 'empty' : (table[i] === 'TOMB' ? 'dim' : 'normal'); }
      function cellText(i) { return table[i] === null ? '' : (table[i] === 'TOMB' ? 'DEL' : String(table[i])); }
      function refresh(i) { S.set('s' + i, { text: cellText(i), style: cellStyle(i) }); }

      function probeRun(key, mode, detailed) { // mode: 'find' | 'insert' | 'delete-find'
        var i = key % m, tries = 0, result = null, path = [];
        while (tries < m) {
          S.set('s' + i, { style: 'hl' });
          S.set('probe', { text: table[i] === null ? '(empty)' : (table[i] === 'TOMB' ? 'DEL' : String(table[i])), style: 'hl' });
          var atEmpty = table[i] === null, atMatch = table[i] === key, atTomb = table[i] === 'TOMB';
          if (mode === 'insert' && (atEmpty || atTomb)) {
            var reused = atTomb;
            S.step(T('yuva ' + i + ': ' + (atEmpty ? 'boş' : '**mezar taşı (DEL)**') + ' → `table[' + i + '] = ' + key + '`' + (reused ? ' (mezar taşı **yeniden kullanılır**)' : '') + '.',
                     'slot ' + i + ': ' + (atEmpty ? 'empty' : '**tombstone (DEL)**') + ' → `table[' + i + '] = ' + key + '`' + (reused ? ' (the tombstone is **reused**)' : '') + '.'),
                   { c: [{ n: 24, note: T('boş ya da TOMB mu? evet', 'empty or TOMB? yes') }], java: [{ n: 23, note: T('empty or TOMB? yes', 'empty or TOMB? yes') }] });
            table[i] = key; refresh(i);
            S.set('probe', { text: String(key), style: 'new' });
            result = { slot: i, reused: reused };
            break;
          }
          if (mode !== 'insert' && atMatch) {
            S.step(T('yuva ' + i + ': `table[' + i + '] == key` → **bulundu**.', 'slot ' + i + ': `table[' + i + '] == key` → **found**.'),
                   { c: [{ n: 8, note: T('eşit mi? evet', 'equal? yes') }], java: [{ n: 7, note: T('equal? yes', 'equal? yes') }] });
            S.set('s' + i, { style: 'new' }); S.set('probe', { style: 'new' });
            result = { slot: i };
            break;
          }
          if (mode === 'insert' && atMatch) { result = { slot: -2, reused: false }; S.set('s' + i, { style: 'del' }); break; }
          if (mode !== 'insert' && atEmpty) {
            S.step(T('yuva ' + i + ': **gerçekten boş** — buraya hiç kimse yoklanıp geçmedi → **bulunamadı**, arama durur.', 'slot ' + i + ': **truly empty** — nothing was ever probed past here → **not found**, the search stops.'),
                   { c: [{ n: 7, note: T('EMPTY mi? evet', 'EMPTY? yes') }], java: [{ n: 6, note: T('EMPTY? yes', 'EMPTY? yes') }] });
            S.set('s' + i, { style: 'del' }); S.set('probe', { style: 'del' });
            result = { slot: -1 };
            break;
          }
          // TOMB or a different occupied key: keep going
          if (atTomb && detailed) {
            S.step(T('yuva ' + i + ': **mezar taşı (DEL)** — burada bir kayıt VARDI, boş değil → atlanmaz, **yoklama sürer**. (Boş olsaydı arama burada dururdu!)',
                     'slot ' + i + ': **tombstone (DEL)** — a record WAS here, it is not empty → do not stop, **keep probing**. (If this were empty, the search would stop here!)'),
                   { c: [{ n: 7, note: T('EMPTY mi? hayır', 'EMPTY? no') }, { n: 8, note: T('eşit mi? hayır', 'equal? no') }, 9], java: [{ n: 6, note: T('EMPTY? no', 'EMPTY? no') }, { n: 7, note: T('equal? no', 'equal? no') }, 8] });
          } else {
            S.set('s' + i, { style: 'dim' });
          }
          path.push(i);
          i = (i + 1) % m; tries++;
        }
        if (result === null) { result = { slot: -1, reused: false }; S.set('probe', { style: 'del' }); }
        return result;
      }

      var insertResults = [], deleteResultsArr = [];
      S.set('phase', { text: T('1. Ekleme', '1. Insertion') });
      d.insertKeys.forEach(function (key, k) {
        S.at(k);
        var h = key % m, detailed = k < 2;
        S.set('decision', { text: 'insert(' + key + ')  h=' + h, style: 'active' });
        if (detailed) S.step(T('`ts_insert(table, ' + m + ', ' + key + ')` — `h = ' + key + ' % ' + m + ' = ' + h + '`.', '`ts_insert(table, ' + m + ', ' + key + ')` — `h = ' + key + ' % ' + m + ' = ' + h + '`.'), { c: [21, 22], java: [20, 21] });
        var r = probeRun(key, 'insert', detailed);
        insertResults.push(r);
        if (!detailed) S.step(T(key + ' → yuva ' + r.slot + '.', key + ' → slot ' + r.slot + '.'),
          { c: [22, { n: 23, note: T('deneme 0 < ' + m + '? evet', 'try 0 < ' + m + '? yes') }],
            java: [21, { n: 22, note: T('try 0 < ' + m + '? yes', 'try 0 < ' + m + '? yes') }] });
      });

      S.at(null);
      S.set('phase', { text: T('2. Silme', '2. Deletion') });
      d.deleteKeys.forEach(function (key) {
        S.set('decision', { text: 'delete(' + key + ')', style: 'del' });
        S.step(T('`ts_delete(table, ' + m + ', ' + key + ')` — önce `ts_find` ile kaydı bul.', '`ts_delete(table, ' + m + ', ' + key + ')` — first locate the record with `ts_find`.'), { c: [14, 15], java: [13, 14] });
        var found = probeRun(key, 'delete-find', true);
        deleteResultsArr.push(found.slot);
        if (found.slot >= 0) {
          table[found.slot] = 'TOMB';
          refresh(found.slot);
          S.set('probe', { text: 'DEL', style: 'dim' });
          S.step(T('`table[' + found.slot + '] = TOMB` — yuva **boşaltılmaz**, bir **mezar taşı** bırakılır: sonraki aramalar bu yuvayı atlayıp devam eder.',
                   '`table[' + found.slot + '] = TOMB` — the slot is **not cleared**, a **tombstone** is left: later searches skip over it and keep going.'),
                 { c: [{ n: 16, note: T('i < 0? hayır', 'i < 0? no') }, 17], java: [{ n: 15, note: T('i < 0? no', 'i < 0? no') }, 16] });
        }
      });

      S.set('phase', { text: T('3. Arama: var olan', '3. Search: present') });
      S.set('decision', { text: 'find(' + d.searchFound + ')', style: 'active' });
      S.step(T('`ts_find(table, ' + m + ', ' + d.searchFound + ')` — mezar taşları varsa atlanmalı.', '`ts_find(table, ' + m + ', ' + d.searchFound + ')` — any tombstones along the way must be skipped.'), { c: [4, 5], java: [3, 4] });
      var foundResult = probeRun(d.searchFound, 'find', true);

      S.set('phase', { text: T('4. Arama: olmayan', '4. Search: absent') });
      S.set('decision', { text: 'find(' + d.searchMissing + ')', style: 'active' });
      S.step(T('`ts_find(table, ' + m + ', ' + d.searchMissing + ')` — dosyada yok; doğru cevap bulunamadı olmalı.', '`ts_find(table, ' + m + ', ' + d.searchMissing + ')` — absent from the file; the correct answer is not-found.'), { c: [4, 5], java: [3, 4] });
      var missingResult = probeRun(d.searchMissing, 'find', true);

      S.set('phase', { text: T('5. Yeniden ekleme', '5. Reinsertion') });
      S.set('decision', { text: 'insert(' + d.reinsertKey + ')', style: 'active' });
      S.step(T('`ts_insert(table, ' + m + ', ' + d.reinsertKey + ')` — bir mezar taşına rastlarsa onu yeniden kullanacak.', '`ts_insert(table, ' + m + ', ' + d.reinsertKey + ')` — if it meets a tombstone, it will reuse it.'), { c: [21, 22], java: [20, 21] });
      var reinsertResult = probeRun(d.reinsertKey, 'insert', true);

      S.at(null);
      S.remove('probe');
      S.result = {
        table: table.map(function (v) { return v === null ? 'EMPTY' : v; }),
        insertResults: insertResults, deleteResults: deleteResultsArr,
        foundResult: foundResult.slot, missingResult: missingResult.slot, reinsertResult: reinsertResult
      };
      S.step(T('Bitti: mezar taşı, silinen bir yuvayı "boş" değil "burada bir şey vardı, aramaya devam et" olarak işaretler — arama doğruluğunu korur, ekleme ise onu yeniden kullanarak yer kazanır.',
               'Done: a tombstone marks a deleted slot as "not empty, something was here, keep searching" rather than truly empty — this keeps search correct, and insertion later reclaims the space by reusing it.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
