/* Week 6 — open addressing with linear probing: every key lives directly IN the table (no separate lists). On a
 * collision, probe the next slot, then the next, wrapping around, until an empty (or deleted) slot is found. A
 * deleted slot gets a DELETED marker (a "tombstone"), not a plain empty mark — search must keep walking past it,
 * because a later key may have probed right over it.
 * Drawing standard: one row "table[] =" with index numbers above; the probe sequence is written on the right
 * (`h=3 → 4 → 5`); a brace marks the contiguous run scanned during a collision ("primary clustering"). Data is a
 * single ops list: a plain number inserts a key, {search: k} searches, {del: k} deletes. Examples (normal, hard,
 * edge — including a full table), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef enum { EMPTY, OCCUPIED, DELETED } Slot;',
    'Slot state[M];                        /* all EMPTY initially */',
    'int table[M];',
    '',
    'bool insert(int key) {',
    '    int idx = key % M;',
    '    for (int i = 0; i < M; i++) {',
    '        if (state[idx] != OCCUPIED) {          /* EMPTY or DELETED: reuse this slot */',
    '            table[idx] = key;',
    '            state[idx] = OCCUPIED;',
    '            return true;',
    '        }',
    '        idx = (idx + 1) % M;                   /* linear probing: try the next slot */',
    '    }',
    '    return false;                              /* table full: M slots probed, none free */',
    '}',
    '',
    'bool search(int key, int *probes) {',
    '    int idx = key % M, p = 0;',
    '    for (int i = 0; i < M; i++) {',
    '        p++;',
    '        if (state[idx] == EMPTY) { *probes = p; return false; }   /* gap: key cannot be further */',
    '        if (state[idx] == OCCUPIED && table[idx] == key) { *probes = p; return true; }',
    '        idx = (idx + 1) % M;',
    '    }',
    '    *probes = p;',
    '    return false;',
    '}',
    '',
    'bool delete_key(int key) {',
    '    int idx = key % M;',
    '    for (int i = 0; i < M; i++) {',
    '        if (state[idx] == EMPTY) return false;',
    '        if (state[idx] == OCCUPIED && table[idx] == key) { state[idx] = DELETED; return true; }',
    '        idx = (idx + 1) % M;',
    '    }',
    '    return false;',
    '}'
  ];
  var JAVA = [
    'static final int EMPTY = 0, OCCUPIED = 1, DELETED = 2;',
    'int[] state = new int[M];              // all EMPTY (0) initially',
    'int[] table = new int[M];',
    '',
    'boolean insert(int key) {',
    '    int idx = key % M;',
    '    for (int i = 0; i < M; i++) {',
    '        if (state[idx] != OCCUPIED) {          // EMPTY or DELETED: reuse this slot',
    '            table[idx] = key;',
    '            state[idx] = OCCUPIED;',
    '            return true;',
    '        }',
    '        idx = (idx + 1) % M;                   // linear probing: try the next slot',
    '    }',
    '    return false;                              // table full: M slots probed, none free',
    '}',
    '',
    'boolean search(int key) {',
    '    int idx = key % M;',
    '    probes = 0;',
    '    for (int i = 0; i < M; i++) {',
    '        probes++;',
    '        if (state[idx] == EMPTY) return false;   // gap: key cannot be further',
    '        if (state[idx] == OCCUPIED && table[idx] == key) return true;',
    '        idx = (idx + 1) % M;',
    '    }',
    '    return false;',
    '}',
    '',
    'boolean deleteKey(int key) {',
    '    int idx = key % M;',
    '    for (int i = 0; i < M; i++) {',
    '        if (state[idx] == EMPTY) return false;',
    '        if (state[idx] == OCCUPIED && table[idx] == key) { state[idx] = DELETED; return true; }',
    '        idx = (idx + 1) % M;',
    '    }',
    '    return false;',
    '}'
  ];

  function h(key, m) { return ((key % m) + m) % m; }

  D.define({
    id: 'hash-linear-probing',
    title: T('Doğrusal yoklama (linear probing) ile açık adresleme', 'Open addressing with linear probing'),
    code: function (d) {
      var m = d && d.m || 11;
      return { c: C.map(function (l) { return l.replace(/\bM\b/g, String(m)); }), java: JAVA.map(function (l) { return l.replace(/\bM\b/g, String(m)); }) };
    },
    presets: [
      { id: 'normal', level: 'normal', name: T('m = 11, 10 ekleme, arama ve bir silme', 'm = 11, 10 inserts, a search and a delete'),
        data: { m: 11, ops: [23, 34, 45, 12, 56, 67, 18, 29, 40, 51, { search: 45 }, { del: 34 }, { search: 34 }] } },
      { id: 'hard', level: 'hard', name: T('m = 11, anahtarlar iki büyük kümede çakışıyor', 'm = 11, the keys collide into two big clusters'),
        data: { m: 11, ops: [11, 22, 33, 44, 55, 5, 16, 27, 38, 49, { search: 49 }, { del: 22 }, { search: 33 }, { search: 22 }] } },
      { id: 'table-full', level: 'edge', name: T('m = 8, aynı hücreye 8 anahtar: tablo tam dolu, sonraki eklemeler reddedilir', 'm = 8, 8 keys into the same cell: the table fills exactly, later inserts are rejected'),
        data: { m: 8, ops: [3, 11, 19, 27, 35, 43, 51, 59, 99, 67] } },
      { id: 'tombstone', level: 'edge', name: T('Silme sonrası arama: mezar taşı olmadan neden yanlış sonuç çıkardı', 'Search after a delete: why it would go wrong without a tombstone'),
        data: { m: 11, ops: [15, 26, 37, 8, 19, 30, 41, 52, 63, 74, { del: 26 }, { search: 37 }, { search: 26 }] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.ops.filter(function (o) { return typeof o === 'number'; }).length; },
    /** Independent computation: same probing logic, coded separately from build(). */
    reference: function (d) {
      var m = d.m, state = new Array(m).fill('E'), table = new Array(m).fill(null);
      var insertResults = [], searchResults = [], deleteResults = [];
      d.ops.forEach(function (o) {
        /* every bucket index below is computed inline (((x % m) + m) % m), independently of build()'s h() */
        if (typeof o === 'number') {
          var key = o, idx = ((key % m) + m) % m, probes = 0, placed = false, i;
          for (i = 0; i < m; i++) {
            probes = i + 1;
            if (state[idx] !== 'O') { table[idx] = key; state[idx] = 'O'; placed = true; break; }
            idx = (idx + 1) % m;
          }
          insertResults.push({ key: key, placed: placed, probes: probes });
        } else if (o.search !== undefined) {
          var qk = o.search, qidx = ((qk % m) + m) % m, qp = 0, found = false, j;
          for (j = 0; j < m; j++) {
            qp = j + 1;
            if (state[qidx] === 'E') break;
            if (state[qidx] === 'O' && table[qidx] === qk) { found = true; break; }
            qidx = (qidx + 1) % m;
          }
          searchResults.push({ key: qk, found: found, probes: qp });
        } else if (o.del !== undefined) {
          var dk = o.del, didx = ((dk % m) + m) % m, dp = 0, deleted = false, k;
          for (k = 0; k < m; k++) {
            dp = k + 1;
            if (state[didx] === 'E') break;
            if (state[didx] === 'O' && table[didx] === dk) { state[didx] = 'D'; table[didx] = null; deleted = true; break; }
            didx = (didx + 1) % m;
          }
          deleteResults.push({ key: dk, deleted: deleted, probes: dp });
        }
      });
      var finalTable = []; for (var q = 0; q < m; q++) finalTable.push(state[q] === 'O' ? table[q] : null);
      return { table: finalTable, insertResults: insertResults, searchResults: searchResults, deleteResults: deleteResults };
    },
    random: function (level, r) {
      var mChoices = { easy: [9, 11], normal: [7, 9], hard: [7], extreme: [5, 7] }[level];
      var m = mChoices[D.randInt(r, 0, mChoices.length - 1)];
      var n = level === 'extreme' ? Math.max(10, m + 2) : { easy: 10, normal: 11, hard: 13 }[level];
      var ops = [], keys = [], i;
      for (i = 0; i < n; i++) { var k = D.randInt(r, 1, 99); ops.push(k); keys.push(k); }
      var extra = D.randInt(r, 2, 4);
      for (i = 0; i < extra; i++) {
        var pick = r();
        if (pick < 0.4) ops.push({ search: keys[D.randInt(r, 0, keys.length - 1)] });
        else if (pick < 0.7) ops.push({ del: keys[D.randInt(r, 0, keys.length - 1)] });
        else ops.push({ search: D.randInt(r, 100, 199) });
      }
      return { m: m, ops: ops };
    },
    input: {
      hint: T('Örnek: m=11 23 34 45 12 search=45 del=34  (m tablo boyutu; sayı=ekle, search=N=ara, del=N=sil)',
              'Example: m=11 23 34 45 12 search=45 del=34  (m is the table size; a number = insert, search=N = search, del=N = delete)'),
      parse: function (text) {
        var m = null, ops = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mm = /^m[=:](-?\d+)$/i.exec(tok);
          if (mm) { m = parseInt(mm[1], 10); return; }
          var sm = /^search[=:](-?\d+)$/i.exec(tok);
          if (sm) { ops.push({ search: parseInt(sm[1], 10) }); return; }
          var dm = /^del[=:](-?\d+)$/i.exec(tok);
          if (dm) { ops.push({ del: parseInt(dm[1], 10) }); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, search=N, del=N ya da m=N yazın.', '"' + tok + '" is not understood: write a number, search=N, del=N or m=N.');
          ops.push(parseInt(tok, 10));
        });
        if (m === null) throw T('m=N yazmalısınız (tablo boyutu).', 'You must write m=N (the table size).');
        if (m < 2 || m > 16) throw T('m 2 ile 16 arasında olmalı.', 'm must be between 2 and 16.');
        var insCount = ops.filter(function (o) { return typeof o === 'number'; }).length;
        if (insCount < 4) throw T('En az 4 ekleme yazın.', 'Write at least 4 inserts.');
        if (ops.length > 34) throw T('En çok 34 işlem.', 'At most 34 operations.');
        return { m: m, ops: ops };
      },
      format: function (d) { return 'm=' + d.m + ' ' + d.ops.map(function (o) { return typeof o === 'number' ? String(o) : (o.search !== undefined ? 'search=' + o.search : 'del=' + o.del); }).join(' '); },
      bad: ['', 'm=1 5 8', 'm=99 5 8', '5 8 13', '5 8 x 13 m=11', 'm=abc 5 8'],
      tokens: function (d) { return d.ops.map(function (o) { return typeof o === 'number' ? String(o) : (o.search !== undefined ? 'search:' + o.search : 'del:' + o.del); }); }
    },
    build: function (S, d) {
      var m = d.m, ops = d.ops;
      var X0 = 90, Y0 = 170, W = 54, H = 46, GAP = 8;
      var RX = X0 + m * (W + GAP) + 40;

      for (var i = 0; i < m; i++) S.box('c' + i, { x: X0 + i * (W + GAP), y: Y0, w: W, h: H, text: '', style: 'empty', size: 15, above: String(i) });
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: T('tablo[] =', 'table[] ='), anchor: 'end', size: 15, bold: true });
      S.label('mlbl', { x: X0, y: 40, text: 'm = ' + m, size: 18, bold: true, mono: true });
      S.label('dec', { x: RX, y: Y0 + H / 2 - 8, text: '', size: 16, bold: true, mono: true, anchor: 'start' });
      S.label('probe', { x: RX, y: Y0 + H / 2 + 18, text: '', size: 14, mono: true, anchor: 'start', style: 'dim' });

      function setBrace(id, p) { if (S.has(id)) S.set(id, p); else S.brace(id, p); }

      S.step(T('Açık adresleme: her anahtar tablonun **içinde** bir hücrede yaşar. `h(key) = key mod ' + m + '` dolu ise, boş ya da silinmiş bir hücre bulana kadar **sağa doğru yoklarız**.',
               'Open addressing: every key lives **inside** the table, in a cell. If `h(key) = key mod ' + m + '` is occupied, we **probe to the right** until we find an empty or deleted cell.'),
             { c: [5, 6, 7, 8], java: [5, 6, 7, 8] });

      var state = new Array(m).fill('E'), table = new Array(m).fill(null);
      var insertResults = [], searchResults = [], deleteResults = [];

      ops.forEach(function (o, k) {
        S.at(k);
        if (typeof o === 'number') {
          var key = o, idx = h(key, m), start = idx, seq = [idx], probes = 0, placed = false;
          for (var i2 = 0; i2 < m; i2++) {
            probes = i2 + 1;
            S.set('c' + idx, { style: 'hl' });
            S.set('probe', { text: 'h = ' + seq.join(' → ') });
            if (state[idx] !== 'O') {
              table[idx] = key; state[idx] = 'O';
              S.set('c' + idx, { text: String(key), style: 'new' });
              S.set('dec', { text: probes > 1 ? T('yerleşti (' + probes + '. yoklama)', 'placed (probe ' + probes + ')') : T('yerleşti', 'placed'), style: 'new' });
              if (idx !== start) setBrace('cluster', { from: 'c' + start, to: 'c' + idx, text: T('birincil kümelenme', 'primary clustering'), side: 'bottom', dist: 14, style: 'hl' });
              placed = true;
              S.step(probes > 1
                ? T('`insert(' + key + ')`: `h(' + key + ') = ' + start + '`, ancak yol boyunca dolu hücrelere çarptık; şimdi hücre ' + idx + ' boş (ya da silinmiş) → anahtar buraya yerleşir. Yoklama dizisi: `h=' + seq.join(' → ') + '`.',
                    '`insert(' + key + ')`: `h(' + key + ') = ' + start + '`, but we hit occupied cells along the way; cell ' + idx + ' is now empty (or deleted) → the key settles here. Probe sequence: `h=' + seq.join(' → ') + '`.')
                : T('`insert(' + key + ')`: `h(' + key + ') = ' + idx + '`, hücre boştu, anahtar doğrudan yerleşir.',
                    '`insert(' + key + ')`: `h(' + key + ') = ' + idx + '`, the cell was empty, the key settles immediately.'),
                { c: [6, 7, 8, 9, 10], java: [6, 7, 8, 9, 10] });
              break;
            } else {
              S.set('dec', { text: T('dolu, ilerle', 'occupied, move on'), style: 'hl' });
              S.step(T('Hücre ' + idx + ' dolu — bir sonrakine geçeriz: `idx = (' + idx + ' + 1) mod ' + m + '`.',
                       'Cell ' + idx + ' is occupied — we move to the next one: `idx = (' + idx + ' + 1) mod ' + m + '`.'), { c: [8, 12], java: [8, 12] });
              idx = (idx + 1) % m;
              seq.push(idx);
            }
          }
          if (!placed) {
            S.set('dec', { text: T('tablo dolu!', 'table full!'), style: 'del' });
            S.step(T('`' + m + '` hücrenin hepsi yoklandı, hiçbiri boş değil — **tablo dolu**, `insert(' + key + ')` reddedilir.',
                     'All `' + m + '` cells were probed, none was free — **table full**, `insert(' + key + ')` is rejected.'), { c: [14], java: [14] });
          }
          insertResults.push({ key: key, placed: placed, probes: probes });
        } else if (o.search !== undefined) {
          var qk = o.search, qidx = h(qk, m), qstart = qidx, qseq = [qidx], qp = 0, found = false;
          for (var j = 0; j < m; j++) {
            qp = j + 1;
            S.set('c' + qidx, { style: 'hl' });
            S.set('probe', { text: 'h = ' + qseq.join(' → ') });
            if (state[qidx] === 'E') {
              S.set('dec', { text: T('boş hücre — dur', 'empty cell — stop'), style: 'del' });
              S.step(T('`search(' + qk + ')` — hücre ' + qidx + ' hiç kullanılmamış (boş): yoklama dizisi burada biter, anahtar tabloda **olamaz** → bulunamadı, ' + qp + ' yoklama.',
                       '`search(' + qk + ')` — cell ' + qidx + ' was never used (empty): the probe chain ends here, the key **cannot** be in the table → not found, ' + qp + ' probes.'), { c: [21], java: [23] });
              break;
            }
            if (state[qidx] === 'O' && table[qidx] === qk) {
              found = true;
              S.set('c' + qidx, { style: 'new' });
              S.set('dec', { text: '= ' + qk + ' found (' + qp + ')', style: 'new' });
              S.step(T('`search(' + qk + ')` — hücre ' + qidx + '\'in anahtarı ' + qk + ' ile eşleşti — **bulundu**, ' + qp + ' yoklama.',
                       '`search(' + qk + ')` — cell ' + qidx + '\'s key matches ' + qk + ' — **found**, ' + qp + ' probes.'), { c: [22], java: [24] });
              break;
            }
            S.set('dec', { text: state[qidx] === 'D' ? T('silinmiş (mezar taşı), devam', 'deleted (tombstone), continue') : T('farklı anahtar, devam', 'different key, continue'), style: 'hl' });
            S.step(state[qidx] === 'D'
              ? T('`search(' + qk + ')` — hücre ' + qidx + ' **silinmiş (mezar taşı)**: boş değil, o yüzden yoklama devam eder — silinen hücreler tabloyu "kırmaz".',
                  '`search(' + qk + ')` — cell ' + qidx + ' is **deleted (a tombstone)**: it is not empty, so probing continues — a deleted cell does not "break" the table.')
              : T('`search(' + qk + ')` — hücre ' + qidx + '\'in anahtarı ' + qk + ' değil, ilerleriz.', '`search(' + qk + ')` — cell ' + qidx + '\'s key is not ' + qk + ', we move on.'),
              { c: [19, 20, 23], java: [21, 22, 25] });
            qidx = (qidx + 1) % m; qseq.push(qidx);
          }
          searchResults.push({ key: qk, found: found, probes: qp });
        } else if (o.del !== undefined) {
          var dk = o.del, didx = h(dk, m), dstart = didx, dseq = [didx], dp = 0, deleted = false;
          for (var kk = 0; kk < m; kk++) {
            dp = kk + 1;
            S.set('c' + didx, { style: 'hl' });
            S.set('probe', { text: 'h = ' + dseq.join(' → ') });
            if (state[didx] === 'E') {
              S.set('dec', { text: T('boş hücre — dur, yok', 'empty cell — stop, not found'), style: 'del' });
              S.step(T('`delete(' + dk + ')` — hücre ' + didx + ' boş: anahtar tabloda yok, silinecek bir şey yok.',
                       '`delete(' + dk + ')` — cell ' + didx + ' is empty: the key is not in the table, nothing to delete.'), { c: [33], java: [33] });
              break;
            }
            if (state[didx] === 'O' && table[didx] === dk) {
              state[didx] = 'D'; table[didx] = null; deleted = true;
              S.set('c' + didx, { text: 'DEL', style: 'del' });
              S.set('dec', { text: T('silindi → mezar taşı', 'deleted → tombstone'), style: 'del' });
              S.step(T('`delete(' + dk + ')` — hücre ' + didx + ' bulundu. Hücre **boşaltılmaz**; bir **DELETED (mezar taşı)** işareti konur. Neden? Boşaltsaydık, bu hücreden sonra yerleşmiş anahtarların arama zinciri kopardı — onlar bulunamaz hale gelirdi.',
                       '`delete(' + dk + ')` — cell ' + didx + ' found. The cell is **not** emptied; a **DELETED (tombstone)** mark is placed instead. Why? If we emptied it, the search chain of any key placed after it would break — that key would become unfindable.'),
                     { c: [34], java: [34] });
              break;
            }
            S.set('dec', { text: T('farklı, devam', 'different, continue'), style: 'hl' });
            S.step(T('`delete(' + dk + ')` — hücre ' + didx + '\'in anahtarı ' + dk + ' değil, ilerleriz.', '`delete(' + dk + ')` — cell ' + didx + '\'s key is not ' + dk + ', we move on.'), { c: [32, 35], java: [32, 35] });
            didx = (didx + 1) % m; dseq.push(didx);
          }
          deleteResults.push({ key: dk, deleted: deleted, probes: dp });
        }
      });

      S.at(null);
      var finalTable = []; for (var q = 0; q < m; q++) finalTable.push(state[q] === 'O' ? table[q] : null);
      S.result = { table: finalTable, insertResults: insertResults, searchResults: searchResults, deleteResults: deleteResults };
      var placedCount = insertResults.filter(function (r) { return r.placed; }).length;
      var rejected = insertResults.length - placedCount;
      S.step(T('Bitti: ' + placedCount + '/' + insertResults.length + ' ekleme yerleşti' + (rejected ? ' (' + rejected + ' reddedildi, tablo doluydu)' : '') + '. Doğrusal yoklama basittir ama **birincil kümelenmeye** yol açar: dolu bloklar büyüdükçe yeni çakışmalar daha da büyütür.',
               'Done: ' + placedCount + '/' + insertResults.length + ' inserts placed' + (rejected ? ' (' + rejected + ' rejected, the table was full)' : '') + '. Linear probing is simple but causes **primary clustering**: occupied runs grow, and growing runs attract even more collisions.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
