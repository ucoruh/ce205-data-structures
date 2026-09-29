/* Week 14 -- primary (sparse) index over a sorted data file: one index entry per disk page, not per record. */
(function (D) {
  'use strict';
  var T = D.T;

  function cCode(block) {
    return [
      '#define BLOCK ' + block,
      '',
      'typedef struct { int first_key; int page; } IndexEntry;',
      '',
      'int find_page(IndexEntry index[], int idx_n, int key) {',
      '    int page = -1;',
      '    for (int i = 0; i < idx_n; i++) {',
      '        if (index[i].first_key <= key)',
      '            page = index[i].page;   /* keep the last entry that still fits */',
      '        else',
      '            break;                  /* index is sorted: later entries start too high */',
      '    }',
      '    return page;',
      '}',
      '',
      'bool search_key(int data[][BLOCK], const int page_len[], IndexEntry index[], int idx_n,',
      '                int key, int *out_page) {',
      '    int page = find_page(index, idx_n, key);',
      '    if (page == -1) return false;   /* smaller than every key: guaranteed absent */',
      '    for (int i = 0; i < page_len[page]; i++)',
      '        if (data[page][i] == key) { *out_page = page; return true; }',
      '    *out_page = page;',
      '    return false;',
      '}'
    ];
  }
  function javaCode(block) {
    return [
      'static final int BLOCK = ' + block + ';',
      '',
      'static class IndexEntry { int firstKey; int page; IndexEntry(int f, int p) { firstKey = f; page = p; } }',
      '',
      'static int findPage(IndexEntry[] index, int key) {',
      '    int page = -1;',
      '    for (int i = 0; i < index.length; i++) {',
      '        if (index[i].firstKey <= key)',
      '            page = index[i].page;   // keep the last entry that still fits',
      '        else',
      '            break;                  // index is sorted: later entries start too high',
      '    }',
      '    return page;',
      '}',
      '',
      'static boolean searchKey(int[][] data, IndexEntry[] index,',
      '                         int key, int[] outPage) {',
      '    int page = findPage(index, key);',
      '    if (page == -1) return false;   // smaller than every key: guaranteed absent',
      '    for (int i = 0; i < data[page].length; i++)',
      '        if (data[page][i] == key) { outPage[0] = page; return true; }',
      '    outPage[0] = page;',
      '    return false;',
      '}'
    ];
  }

  function chunk(keys, block) {
    var pages = [];
    for (var i = 0; i < keys.length; i += block) pages.push(keys.slice(i, i + block));
    return pages;
  }

  D.define({
    id: 'primary-index',
    title: T('Birincil (seyrek) dizin: sıralı dosya üzerinde', 'Primary (sparse) index over a sorted file'),
    code: function (d) { return { c: cCode(d.block), java: javaCode(d.block) }; },
    presets: [
      { id: 'normal', level: 'normal', name: T('12 anahtar, block=4, 3 arama', '12 keys, block=4, 3 searches'),
        data: { block: 4, keys: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60], queries: [22, 50, 3] } },
      { id: 'hard', level: 'hard', name: T('16 anahtar, block=3, son sayfa yarım, 5 arama', '16 keys, block=3, a partial last page, 5 searches'),
        data: { block: 3, keys: [2, 8, 14, 19, 23, 29, 34, 41, 47, 53, 58, 64, 69, 75, 81, 88], queries: [29, 75, 90, 1, 88] } },
      { id: 'single-page', level: 'edge', name: T('Uç durum: tek sayfa (block=12)', 'Edge case: a single page (block=12)'),
        data: { block: 12, keys: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30], queries: [9, 25, 1] } },
      { id: 'below-range', level: 'edge', name: T('Uç durum: her arama en küçük anahtardan da küçük (0 okuma)', 'Edge case: every search is below the smallest key (0 reads)'),
        data: { block: 4, keys: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155], queries: [10, 50, 99] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    /** Independent computation (its own loops, no helper shared with build()). */
    reference: function (d) {
      var pages = [];
      for (var i = 0; i < d.keys.length; i += d.block) pages.push(d.keys.slice(i, i + d.block));
      var reads = 0, searches = [];
      d.queries.forEach(function (q) {
        var candidate = -1;
        for (var p = 0; p < pages.length; p++) { if (pages[p][0] <= q) candidate = p; else break; }
        var found = false, page = null;
        if (candidate >= 0) { reads++; page = candidate; found = pages[candidate].indexOf(q) >= 0; }
        searches.push({ key: q, found: found, page: page });
      });
      return { pages: pages.length, writes: pages.length, reads: reads, searches: searches };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 16, extreme: 18 }[level] || 12;
      var block = D.randInt(r, level === 'extreme' ? 2 : 3, level === 'extreme' ? 6 : 5);
      var keys = [], v = D.randInt(r, 1, 20);
      for (var i = 0; i < n; i++) { keys.push(v); v += D.randInt(r, 3, level === 'extreme' ? 22 : 12); }
      var nq = level === 'extreme' ? 4 : (level === 'hard' ? 3 : 2), queries = [];
      for (var j = 0; j < nq; j++) {
        var pick = r();
        if (pick < 0.3) queries.push(keys[D.randInt(r, 0, keys.length - 1)]);
        else if (pick < 0.55) queries.push(keys[0] - D.randInt(r, 1, 10));
        else if (pick < 0.8) queries.push(keys[keys.length - 1] + D.randInt(r, 1, 10));
        else queries.push(keys[D.randInt(r, 0, keys.length - 2)] + 1);
      }
      return { block: block, keys: keys, queries: queries };
    },
    input: {
      hint: T('Örnek: block=4 keys: 5,10,15,20,25,30,35,40,45,50,55,60 queries: 22,50,3',
              'Example: block=4 keys: 5,10,15,20,25,30,35,40,45,50,55,60 queries: 22,50,3'),
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
        if (keys.length < 10) throw T('En az 10 anahtar yazın.', 'Write at least 10 keys.');
        for (var i = 1; i < keys.length; i++) if (keys[i] <= keys[i - 1]) throw T('Anahtarlar kesin artan (tekrarsız, sıralı) olmalı.', 'Keys must be strictly increasing (sorted, no duplicates).');
        if (!queries.length) throw T('En az bir queries değeri yazın.', 'Write at least one queries value.');
        return { block: block, keys: keys, queries: queries };
      },
      format: function (d) { return 'block=' + d.block + ' keys: ' + d.keys.join(',') + ' queries: ' + d.queries.join(','); },
      bad: ['', 'block=1 keys: 1,2,3,4,5,6,7,8,9,10 queries: 5', 'keys: 1,2,3,2,5,6,7,8,9,10 queries: 5',
            'keys: 1,2,3,4,5,6,7,8,9 queries: 5', 'keys: 1,2,3,4,5,6,7,8,9,10 queries:', 'keys: 1,x,3,4,5,6,7,8,9,10,11 queries: 5'],
      tokens: function (d) { return d.queries.map(String); }
    },
    build: function (S, d) {
      var block = d.block, keys = d.keys, queries = d.queries;
      var pages = chunk(keys, block);
      var X0 = 76, GAP = 26, Y_IDX = 120, Y_DATA = 240, IW = 60, IH = 40;
      var DW = Math.max(70, block * 24 + 16), DH = 46;
      var reads = 0, writes = 0;

      S.label('title', { x: X0, y: 22, text: 'BLOCK = ' + block, size: 15, bold: true, mono: true, anchor: 'start' });
      S.label('io', { x: X0, y: 46, text: T('okuma: 0  yazma: 0', 'reads: 0  writes: 0'), size: 15, bold: true, mono: true, anchor: 'start' });
      function setIO() { S.set('io', { text: T('okuma: ' + reads + '  yazma: ' + writes, 'reads: ' + reads + '  writes: ' + writes) }); }
      S.label('idxlbl', { x: X0 - 16, y: Y_IDX + IH / 2 + 5, text: T('seyrek dizin (bellekte) =', 'sparse index (in RAM) ='), anchor: 'end', size: 14, bold: true });
      S.label('datalbl', { x: X0 - 16, y: Y_DATA + DH / 2 + 5, text: T('veri dosyası (diskte, sıralı) =', 'data file (on disk, sorted) ='), anchor: 'end', size: 14, bold: true });
      var RX = X0 + pages.length * (DW + GAP) + 24;
      S.label('dec', { x: RX, y: Y_DATA + DH / 2 + 5, text: '', size: 16, bold: true, mono: true, anchor: 'start' });

      pages.forEach(function (pg, i) {
        var x = X0 + i * (DW + GAP);
        S.box('pg' + i, { x: x, y: Y_DATA, w: DW, h: DH, text: pg.join(','), style: 'normal', size: 14, above: T('sf ' + (i + 1), 'pg ' + (i + 1)) });
        S.box('ix' + i, { x: x, y: Y_IDX, w: IW, h: IH, text: String(pg[0]), style: 'normal', below: T('→ sf ' + (i + 1), '→ pg ' + (i + 1)) });
        S.arrow('ar' + i, { from: 'ix' + i, to: 'pg' + i, kind: 'center', head: true, style: 'dim' });
      });
      writes = pages.length; setIO();
      S.step(T('Dosya `' + keys.length + '` anahtarla sıralı; her `BLOCK=' + block + '` anahtar bir disk sayfasına yazılır: ' + pages.length + ' sayfa, ' + pages.length + ' yazma.',
               'The file holds ' + keys.length + ' sorted keys; every `BLOCK=' + block + '` keys fill one disk page: ' + pages.length + ' pages, ' + pages.length + ' writes.'),
             { c: [1, 3], java: [1, 3] });
      S.step(T('**Seyrek dizin (sparse index)**: sayfa başına TEK giriş -- sayfanın ilk anahtarı, sayfa numarasıyla birlikte. Küçük olduğu için bellekte durur: taranması disk maliyeti getirmez.',
               'A **sparse index**: ONE entry per page -- the page\'s first key, paired with the page number. It is small enough to live in memory: scanning it costs no disk I/O.'),
             { c: [3], java: [3] });

      var results = [];
      queries.forEach(function (q, qi) {
        S.at(qi);
        pages.forEach(function (_, i) { S.set('pg' + i, { style: 'normal' }); S.set('ix' + i, { style: 'normal' }); S.set('ar' + i, { style: 'dim' }); });
        S.set('dec', { text: '' });
        var candidate = -1;
        for (var i = 0; i < pages.length; i++) {
          S.set('ix' + i, { style: 'hl' }); S.set('ar' + i, { style: 'hl' });
          if (pages[i][0] <= q) {
            candidate = i;
            S.set('ix' + i, { style: 'active' });
            S.set('dec', { text: T(pages[i][0] + ' ≤ ' + q + ' → aday sf ' + (i + 1), pages[i][0] + ' ≤ ' + q + ' → candidate pg ' + (i + 1)) });
            S.step(T('`find_page(' + q + ')`: dizin girdisi ' + (i + 1) + ' -- `first_key=' + pages[i][0] + '` ≤ `key=' + q + '`, bu sayfa hâlâ uygun aday: `page = ' + i + '`.',
                     '`find_page(' + q + ')`: index entry ' + (i + 1) + ' -- `first_key=' + pages[i][0] + '` ≤ `key=' + q + '`, this page is still a valid candidate: `page = ' + i + '`.'),
                   { c: [{ n: 7, note: T('i=' + i, 'i=' + i) }, { n: 8, note: T('first_key<=key mi? evet', 'first_key<=key? yes') }, 9, { n: 10, skip: true }, { n: 11, skip: true }],
                     java: [{ n: 7, note: T('i=' + i, 'i=' + i) }, { n: 8, note: T('first_key<=key mi? evet', 'first_key<=key? yes') }, 9, { n: 10, skip: true }, { n: 11, skip: true }] });
            S.set('ar' + i, { style: 'dim' });
          } else {
            S.set('dec', { text: T(pages[i][0] + ' > ' + q + ' → dur', pages[i][0] + ' > ' + q + ' → stop') });
            S.step(T('`find_page(' + q + ')`: dizin girdisi ' + (i + 1) + ' -- `first_key=' + pages[i][0] + '` > `key=' + q + '`; dizin sıralı olduğundan sonraki girdiler daha da büyük başlar, döngü `break` ile durur.',
                     '`find_page(' + q + ')`: index entry ' + (i + 1) + ' -- `first_key=' + pages[i][0] + '` > `key=' + q + '`; since the index is sorted, later entries only start higher, the loop stops with `break`.'),
                   { c: [{ n: 7, note: T('i=' + i, 'i=' + i) }, { n: 8, note: T('first_key<=key mi? hayır', 'first_key<=key? no') }, { n: 9, skip: true }, 10, 11],
                     java: [{ n: 7, note: T('i=' + i, 'i=' + i) }, { n: 8, note: T('first_key<=key mi? hayır', 'first_key<=key? no') }, { n: 9, skip: true }, 10, 11] });
            S.set('ix' + i, { style: 'dim' }); S.set('ar' + i, { style: 'dim' });
            break;
          }
        }
        if (candidate === -1) {
          S.set('dec', { text: T('sayfa yok: en küçük anahtardan da küçük', 'no page: smaller than even the smallest key') });
          S.step(T('`find_page` `-1` döner: `' + q + '`, ilk sayfanın ilk anahtarından (' + pages[0][0] + ') bile küçük. `search_key` hemen `false` döner -- **hiç disk erişimi yok**.',
                   '`find_page` returns `-1`: `' + q + '` is smaller than even the first page\'s first key (' + pages[0][0] + '). `search_key` returns `false` right away -- **no disk access at all**.'),
                 { c: [18, { n: 19, note: T('sayfa == -1? evet', 'page == -1? yes') }], java: [18, { n: 19, note: T('sayfa == -1? evet', 'page == -1? yes') }] });
          results.push({ key: q, found: false, page: null });
          return;
        }
        reads++; setIO();
        pages.forEach(function (_, i) { S.set('ix' + i, { style: i === candidate ? 'active' : 'dim' }); S.set('ar' + i, { style: i === candidate ? 'hl' : 'dim' }); S.set('pg' + i, { style: i === candidate ? 'hl' : 'dim' }); });
        S.step(T('`find_page` sayfa ' + (candidate + 1) + '\'i döndürdü. `search_key` o sayfayı diskten OKUR (+1 okuma) ve içinde `key=' + q + '`\'i sırayla arar.',
                 '`find_page` returned page ' + (candidate + 1) + '. `search_key` READS that page from disk (+1 read) and scans it in order for `key=' + q + '`.'),
               { c: [18, { n: 19, note: T('sayfa == -1? hayır', 'page == -1? no') }], java: [18, { n: 19, note: T('sayfa == -1? hayır', 'page == -1? no') }] });

        var found = false;
        for (var k = 0; k < pages[candidate].length; k++) {
          if (pages[candidate][k] === q) {
            found = true;
            S.set('dec', { text: T('bulundu: sf ' + (candidate + 1) + ', konum ' + k, 'found: pg ' + (candidate + 1) + ', slot ' + k) });
            S.set('pg' + candidate, { style: 'new' });
            S.step(T('Sayfa içi arama: konum ' + k + ' -- `data[' + candidate + '][' + k + '] == ' + q + '` -- **bulundu**.',
                     'Scan inside the page: slot ' + k + ' -- `data[' + candidate + '][' + k + '] == ' + q + '` -- **found**.'),
                   { c: [{ n: 20, note: T('i=' + k, 'i=' + k) }, { n: 21, note: T('eşit mi? evet', 'equal? yes') }],
                     java: [{ n: 20, note: T('i=' + k, 'i=' + k) }, { n: 21, note: T('eşit mi? evet', 'equal? yes') }] });
            break;
          } else {
            S.step(T('Sayfa içi arama: konum ' + k + ' -- `data[' + candidate + '][' + k + ']` (' + pages[candidate][k] + ') ≠ ' + q + ', devam.',
                     'Scan inside the page: slot ' + k + ' -- `data[' + candidate + '][' + k + ']` (' + pages[candidate][k] + ') ≠ ' + q + ', keep going.'),
                   { c: [{ n: 20, note: T('i=' + k, 'i=' + k) }, { n: 21, note: T('eşit mi? hayır', 'equal? no') }],
                     java: [{ n: 20, note: T('i=' + k, 'i=' + k) }, { n: 21, note: T('eşit mi? hayır', 'equal? no') }] });
          }
        }
        if (!found) {
          S.set('dec', { text: T('sayfada yok', 'not in page') });
          S.set('pg' + candidate, { style: 'del' });
          S.step(T('Sayfanın tüm anahtarları tarandı, `' + q + '` yok: **bulunamadı**. Yine de tek bir disk okuması yeterliydi.',
                   'All the page\'s keys were scanned, `' + q + '` is absent: **not found**. Still, only one disk read was needed.'),
                 { c: [{ n: 20, note: T('i: 0..' + (pages[candidate].length - 1), 'i: 0..' + (pages[candidate].length - 1)) }, 22, 23],
                   java: [{ n: 20, note: T('i: 0..' + (pages[candidate].length - 1), 'i: 0..' + (pages[candidate].length - 1)) }, 22, 23] });
        }
        results.push({ key: q, found: found, page: candidate });
      });

      S.at(null);
      pages.forEach(function (_, i) { S.set('pg' + i, { style: 'normal' }); S.set('ix' + i, { style: 'normal' }); S.set('ar' + i, { style: 'dim' }); });
      S.set('dec', { text: '' });
      S.result = { pages: pages.length, writes: writes, reads: reads, searches: results };
      S.step(T('Bitti: ' + queries.length + ' arama, toplam ' + reads + ' disk okuması (yazma: ' + writes + '). Her arama en çok 1 sayfa okur: seyrek dizin sayesinde `O(n/B)` dizin taraması (bellekte, ücretsiz) + `O(B)` sayfa içi tarama -- toplam disk maliyeti yalnız `O(1)` sayfa.',
               'Done: ' + queries.length + ' searches, ' + reads + ' disk reads total (writes: ' + writes + '). Every search reads at most one page: thanks to the sparse index, `O(n/B)` index scanning (in memory, free) + `O(B)` inside the page -- total disk cost only `O(1)` page.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
