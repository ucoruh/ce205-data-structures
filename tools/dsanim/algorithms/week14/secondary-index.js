/* Week 14 -- dense secondary index over a file: one index entry per RECORD, sorted by a key that repeats
   (duplicates cluster together because the index is sorted, even though the data file itself is not). */
(function (D) {
  'use strict';
  var T = D.T;

  function cCode(block) {
    return [
      '#define BLOCK ' + block,
      '',
      'typedef struct { int key; int slot; } IndexEntry;   /* dense: one per record, sorted by key */',
      '',
      'int search_dense(IndexEntry index[], int n, int key, int matches[], int max_matches) {',
      '    int count = 0;',
      '    for (int i = 0; i < n; i++) {',
      '        if (index[i].key == key) {',
      '            matches[count++] = index[i].slot;  /* remember which record matched */',
      '        } else if (count > 0) {',
      '            break;                              /* dense + sorted: matches always cluster together */',
      '        }',
      '    }',
      '    return count;',
      '}'
    ];
  }
  function javaCode(block) {
    return [
      'static final int BLOCK = ' + block + ';',
      '',
      'static class IndexEntry { int key; int slot; IndexEntry(int k, int s) { key = k; slot = s; } }',
      '',
      'static int searchDense(IndexEntry[] index, int key, int[] matches) {',
      '    int count = 0;',
      '    for (int i = 0; i < index.length; i++) {',
      '        if (index[i].key == key) {',
      '            matches[count++] = index[i].slot;  // remember which record matched',
      '        } else if (count > 0) {',
      '            break;                              // dense + sorted: matches always cluster together',
      '        }',
      '    }',
      '    return count;',
      '}'
    ];
  }

  function buildDenseIndex(records) {
    var idx = [];
    for (var i = 0; i < records.length; i++) idx.push({ key: records[i].key, slot: i });
    idx.sort(function (a, b) { return a.key - b.key || a.slot - b.slot; });
    return idx;
  }

  D.define({
    id: 'secondary-index',
    title: T('İkincil (yoğun) dizin: tekrarlı anahtarlar', 'Secondary (dense) index: keys with duplicates'),
    code: function (d) { return { c: cCode(d.block), java: javaCode(d.block) }; },
    presets: [
      { id: 'normal', level: 'normal', name: T('12 kayıt, dept anahtarı, 3 arama', '12 records, a dept key, 3 searches'),
        data: { block: 4, records: [3, 1, 4, 1, 2, 3, 1, 4, 2, 3, 1, 4].map(function (k) { return { key: k }; }), queries: [1, 5, 4] } },
      { id: 'hard', level: 'hard', name: T('14 kayıt, block=3, son sayfa yarım, 3 arama', '14 records, block=3, a partial last page, 3 searches'),
        data: { block: 3, records: [2, 5, 1, 3, 5, 4, 1, 5, 2, 3, 5, 1, 4, 2].map(function (k) { return { key: k }; }), queries: [5, 9, 4] } },
      { id: 'all-same', level: 'edge', name: T('Uç durum: 10 kaydın hepsi aynı anahtar', 'Edge case: all 10 records share one key'),
        data: { block: 4, records: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7].map(function (k) { return { key: k }; }), queries: [7, 3] } },
      { id: 'unique', level: 'edge', name: T('Uç durum: tekrarsız anahtarlar (kümeleme yok)', 'Edge case: no duplicate keys (no clustering)'),
        data: { block: 5, records: [40, 10, 30, 20, 50, 15, 25, 35, 45, 5].map(function (k) { return { key: k }; }), queries: [30, 99, 5] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.records.length; },
    reference: function (d) {
      var block = d.block, records = d.records;
      var idx = [];
      for (var i = 0; i < records.length; i++) idx.push({ key: records[i].key, slot: i });
      idx.sort(function (a, b) { return a.key - b.key || a.slot - b.slot; });
      var results = [], totalReads = 0;
      d.queries.forEach(function (q) {
        var matches = [], touched = {}, inCluster = false;
        for (var i = 0; i < idx.length; i++) {
          if (idx[i].key === q) {
            inCluster = true;
            var page = Math.floor(idx[i].slot / block), slot = idx[i].slot % block;
            matches.push({ page: page, slot: slot });
            touched[page] = true;
          } else if (inCluster) break;
        }
        var pagesRead = Object.keys(touched).length;
        totalReads += pagesRead;
        results.push({ key: q, count: matches.length, matches: matches, pagesRead: pagesRead });
      });
      return { records: records.length, writes: Math.ceil(records.length / block), reads: totalReads, searches: results };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level] || 12;
      var block = D.randInt(r, level === 'extreme' ? 2 : 3, 5);
      var domain = level === 'extreme' ? D.randInt(r, 2, 4) : D.randInt(r, 3, 6);
      var records = [];
      for (var i = 0; i < n; i++) records.push({ key: D.randInt(r, 1, domain) });
      var nq = level === 'extreme' ? 3 : 2, queries = [];
      for (var j = 0; j < nq; j++) {
        if (r() < 0.6) queries.push(records[D.randInt(r, 0, n - 1)].key);
        else queries.push(domain + 50 + D.randInt(r, 0, 9));
      }
      return { block: block, records: records, queries: queries };
    },
    input: {
      hint: T('Örnek: block=4 keys: 3,1,4,1,2,3,1,4,2,3,1,4 queries: 1,5,4',
              'Example: block=4 keys: 3,1,4,1,2,3,1,4,2,3,1,4 queries: 1,5,4'),
      parse: function (text) {
        var block = 4, keys = [], queries = [], mode = 'keys';
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^block[=:](\d+)$/i.exec(tok);
          if (m) { block = parseInt(m[1], 10); return; }
          if (/^keys?:?$/i.test(tok)) { mode = 'keys'; return; }
          if (/^(queries|query):?$/i.test(tok)) { mode = 'queries'; return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, block=N, keys ya da queries yazın.',
                                             '"' + tok + '" is not understood: write a number, block=N, keys or queries.');
          (mode === 'keys' ? keys : queries).push(parseInt(tok, 10));
        });
        if (block < 2 || block > 16) throw T('block 2 ile 16 arasında olmalı.', 'block must be between 2 and 16.');
        if (keys.length < 10) throw T('En az 10 kayıt anahtarı yazın.', 'Write at least 10 record keys.');
        if (!queries.length) throw T('En az bir queries değeri yazın.', 'Write at least one queries value.');
        return { block: block, records: keys.map(function (k) { return { key: k }; }), queries: queries };
      },
      format: function (d) { return 'block=' + d.block + ' keys: ' + d.records.map(function (rr) { return rr.key; }).join(',') + ' queries: ' + d.queries.join(','); },
      bad: ['', 'block=1 keys: 1,2,3,4,5,6,7,8,9,10 queries: 5', 'keys: 1,2,3,4,5,6,7,8,9 queries: 5',
            'keys: 1,2,3,4,5,6,7,8,9,10 queries:', 'keys: 1,x,3,4,5,6,7,8,9,10,11 queries: 5', 'block=abc keys: 1,2,3,4,5,6,7,8,9,10 queries: 5'],
      tokens: function (d) { return d.queries.map(String); }
    },
    build: function (S, d) {
      var block = d.block, records = d.records, n = records.length;
      var pages = [];
      for (var i0 = 0; i0 < n; i0 += block) pages.push(records.slice(i0, i0 + block).map(function (rr) { return rr.key; }));
      var idx = buildDenseIndex(records);
      var X0 = 76, IW = 42, IH = 38, IGAP = 8, Y_IDX = 130;
      var DGAP = 22, DW = Math.max(66, block * 22 + 16), DH = 46, Y_DATA = 270;
      var reads = 0, writes = pages.length;

      S.label('title', { x: X0, y: 22, text: 'BLOCK = ' + block, size: 15, bold: true, mono: true, anchor: 'start' });
      S.label('io', { x: X0, y: 46, text: T('okuma: 0  yazma: ' + writes, 'reads: 0  writes: ' + writes), size: 15, bold: true, mono: true, anchor: 'start' });
      function setIO() { S.set('io', { text: T('okuma: ' + reads + '  yazma: ' + writes, 'reads: ' + reads + '  writes: ' + writes) }); }
      S.label('idxlbl', { x: X0 - 16, y: Y_IDX + IH / 2 + 5, text: T('yoğun dizin (sıralı) =', 'dense index (sorted) ='), anchor: 'end', size: 13, bold: true });
      S.label('datalbl', { x: X0 - 16, y: Y_DATA + DH / 2 + 5, text: T('veri dosyası (birincil sırada) =', 'data file (in primary order) ='), anchor: 'end', size: 13, bold: true });
      var RX = X0 + Math.max(idx.length * (IW + IGAP), pages.length * (DW + DGAP)) + 20;
      S.label('dec', { x: RX, y: Y_DATA + DH / 2 + 5, text: '', size: 15, bold: true, mono: true, anchor: 'start' });

      pages.forEach(function (pg, i) {
        S.box('pg' + i, { x: X0 + i * (DW + DGAP), y: Y_DATA, w: DW, h: DH, text: pg.join(','), style: 'normal', size: 13, above: T('sf ' + (i + 1), 'pg ' + (i + 1)) });
      });
      idx.forEach(function (e, i) {
        var page = Math.floor(e.slot / block), slot = e.slot % block;
        S.box('ix' + i, { x: X0 + i * (IW + IGAP), y: Y_IDX, w: IW, h: IH, text: String(e.key), style: 'normal', size: 13, below: T('sf' + (page + 1) + '.' + slot, 'pg' + (page + 1) + '.' + slot) });
      });
      S.step(T('Dosya, kayıtların yazılma sırasıyla (birincil anahtar sırası) ' + pages.length + ' sayfaya bölünmüş -- ikincil anahtara göre SIRALI DEĞİL. `' + writes + '` yazma.',
               'The file is split into ' + pages.length + ' pages in the order records were written (primary-key order) -- NOT sorted by the secondary key. `' + writes + '` writes.'),
             { c: [1], java: [1] });
      S.step(T('**Yoğun (dense) ikincil dizin**: her kayıt için TEK giriş, ikincil anahtara göre sıralı. Aynı anahtarlı kayıtlar (tekrarlar) dizinde YAN YANA kümelenir -- veri dosyasında dağınık olsalar bile.',
               'A **dense** secondary index: ONE entry per record, sorted by the secondary key. Records sharing a key (duplicates) end up NEXT TO EACH OTHER in the index -- even though they are scattered in the data file.'),
             { c: [3], java: [3] });

      var queries = d.queries, results = [], ephemeral = [];
      queries.forEach(function (q, qi) {
        S.at(qi);
        ephemeral.forEach(function (id) { if (S.has(id)) S.remove(id); }); ephemeral = [];
        idx.forEach(function (_, i) { S.set('ix' + i, { style: 'normal' }); });
        pages.forEach(function (_, i) { S.set('pg' + i, { style: 'normal' }); });
        S.set('dec', { text: '' });
        S.step(T('`search_dense(' + q + ')`: dizini baştan sırayla tarıyoruz; eşleşme başlayana kadar hiçbir şey okunmaz.',
                 '`search_dense(' + q + ')`: scan the index from the start, in order; nothing is read until a match begins.'),
               { c: [6, { n: 7, note: T('i: 0..' + (idx.length - 1), 'i: 0..' + (idx.length - 1)) }],
                 java: [6, { n: 7, note: T('i: 0..' + (idx.length - 1), 'i: 0..' + (idx.length - 1)) }] });

        var matches = [], touched = {}, inCluster = false, brokeAt = -1;
        for (var i = 0; i < idx.length; i++) {
          if (idx[i].key === q) {
            inCluster = true;
            S.set('ix' + i, { style: 'new' });
            var page = Math.floor(idx[i].slot / block), slot = idx[i].slot % block;
            matches.push({ page: page, slot: slot });
            var already = !!touched[page];
            var aid = 'qa' + qi + '_' + i;
            S.arrow(aid, { from: 'ix' + i, to: 'pg' + page, kind: 'center', head: true, style: already ? 'new' : 'hl' });
            ephemeral.push(aid);
            if (!already) {
              touched[page] = true; reads++; setIO();
              S.set('pg' + page, { style: 'hl' });
              S.set('dec', { text: T('eşleşme, sf ' + (page + 1) + ' OKUNUYOR', 'match, READING pg ' + (page + 1)) });
              S.step(T('`index[' + i + '].key == ' + q + '` -- eşleşme (kayıt sf ' + (page + 1) + ', konum ' + slot + '). Bu sayfa ilk kez ziyaret ediliyor: +1 okuma.',
                       '`index[' + i + '].key == ' + q + '` -- a match (record at pg ' + (page + 1) + ', slot ' + slot + '). This page is visited for the first time: +1 read.'),
                     { c: [{ n: 8, note: T('eşit mi? evet', 'equal? yes') }, 9, { n: 10, skip: true }, { n: 11, skip: true }],
                       java: [{ n: 8, note: T('eşit mi? evet', 'equal? yes') }, 9, { n: 10, skip: true }, { n: 11, skip: true }] });
            } else {
              S.set('dec', { text: T('eşleşme, sf ' + (page + 1) + ' zaten okunmuştu', 'match, pg ' + (page + 1) + ' already read') });
              S.step(T('`index[' + i + '].key == ' + q + '` -- eşleşme (kayıt sf ' + (page + 1) + ', konum ' + slot + '). Bu sorguda o sayfa zaten okunmuştu: ek okuma yok.',
                       '`index[' + i + '].key == ' + q + '` -- a match (record at pg ' + (page + 1) + ', slot ' + slot + '). That page was already read during this query: no extra read.'),
                     { c: [{ n: 8, note: T('eşit mi? evet', 'equal? yes') }, 9, { n: 10, skip: true }, { n: 11, skip: true }],
                       java: [{ n: 8, note: T('eşit mi? evet', 'equal? yes') }, 9, { n: 10, skip: true }, { n: 11, skip: true }] });
            }
          } else if (inCluster) { brokeAt = i; break; }
        }
        if (matches.length === 0) {
          S.set('dec', { text: T('bulunamadı', 'not found') });
          S.step(T('Dizinin tamamı tarandı, `' + q + '` hiçbir girdide yok: **0 eşleşme, 0 sayfa okuması**.',
                   'The whole index was scanned, `' + q + '` matches no entry: **0 matches, 0 page reads**.'),
                 { c: [{ n: 7, note: T('i: 0..' + (idx.length - 1), 'i: 0..' + (idx.length - 1)) }, { n: 8, note: T('eşit mi? hiç', 'equal? never') }, 13, 14],
                   java: [{ n: 7, note: T('i: 0..' + (idx.length - 1), 'i: 0..' + (idx.length - 1)) }, { n: 8, note: T('eşit mi? hiç', 'equal? never') }, 13, 14] });
        } else {
          if (brokeAt >= 0) {
            S.set('ix' + brokeAt, { style: 'dim' });
            S.set('dec', { text: T('küme bitti (' + matches.length + ' eşleşme)', 'cluster ended (' + matches.length + ' matches)') });
            S.step(T('`index[' + brokeAt + '].key` artık `' + q + '` değil: küme (cluster) bitti, döngü `break` ile durur. Toplam ' + matches.length + ' eşleşme.',
                     '`index[' + brokeAt + '].key` is no longer `' + q + '`: the cluster ended, the loop stops with `break`. ' + matches.length + ' matches in total.'),
                   { c: [{ n: 7, note: T('i=' + brokeAt, 'i=' + brokeAt) }, { n: 8, note: T('eşit mi? hayır', 'equal? no') }, { n: 9, skip: true },
                          { n: 10, note: T('count>0 mı? evet', 'count>0? yes') }, 11],
                     java: [{ n: 7, note: T('i=' + brokeAt, 'i=' + brokeAt) }, { n: 8, note: T('eşit mi? hayır', 'equal? no') }, { n: 9, skip: true },
                            { n: 10, note: T('count>0 mı? evet', 'count>0? yes') }, 11] });
          } else {
            S.set('dec', { text: T('dizin bitti (' + matches.length + ' eşleşme)', 'index ended (' + matches.length + ' matches)') });
            S.step(T('Dizinin sonuna gelindi; ' + matches.length + ' eşleşme bulundu.', 'Reached the end of the index; ' + matches.length + ' matches found.'),
                   { c: [{ n: 7, note: T('i: sona kadar', 'i: to the end') }, 13, 14],
                     java: [{ n: 7, note: T('i: sona kadar', 'i: to the end') }, 13, 14] });
          }
        }
        results.push({ key: q, count: matches.length, matches: matches, pagesRead: Object.keys(touched).length });
      });

      S.at(null);
      idx.forEach(function (_, i) { S.set('ix' + i, { style: 'normal' }); });
      pages.forEach(function (_, i) { S.set('pg' + i, { style: 'normal' }); });
      S.set('dec', { text: '' });
      S.result = { records: n, writes: writes, reads: reads, searches: results };
      S.step(T('Bitti: ' + queries.length + ' arama, toplam ' + reads + ' disk okuması. Yoğun dizin sıralı olduğu için tekrarlar bitişik durur: `O(n)` dizin taraması (bellekte) + eşleşme başına en çok 1 yeni sayfa okuması.',
               'Done: ' + queries.length + ' searches, ' + reads + ' disk reads total. Because the dense index is sorted, duplicates sit next to each other: `O(n)` index scan (in memory) + at most one new page read per match.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
