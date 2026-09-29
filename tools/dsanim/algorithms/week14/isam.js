/* Week 14 -- ISAM (Indexed Sequential Access Method): a two-level index (level-1 groups of level-2 page
   entries) over a sorted primary data area, plus an OVERFLOW AREA for keys that no longer fit their home page. */
(function (D) {
  'use strict';
  var T = D.T;

  function cCode(block, group) {
    return [
      '#define BLOCK ' + block + '    /* keys per data page (capacity) */',
      '#define GROUP ' + group + '     /* pages per level-1 group */',
      '',
      'int find_group(int l1_key[], int l1_n, int key) {',
      '    int g = 0;',
      '    for (int i = 0; i < l1_n; i++) { if (l1_key[i] <= key) g = i; else break; }',
      '    return g;',
      '}',
      '',
      'int find_page(int l2_key[], int lo, int hi, int key) {',
      '    int page = lo;',
      '    for (int i = lo; i <= hi; i++) { if (l2_key[i] <= key) page = i; else break; }',
      '    return page;',
      '}',
      '',
      'void isam_insert(int key) {',
      '    int g = find_group(l1_key, l1_n, key);',
      '    int page = find_page(l2_key, g * GROUP, group_hi(g), key);',
      '    read_page(page);                          /* +1 read: home page */',
      '    if (page_len[page] < BLOCK) {',
      '        insert_sorted(page, key);',
      '        write_page(page);                     /* +1 write */',
      '    } else {',
      '        int walked = walk_overflow_chain(page); /* +1 read per existing overflow node */',
      '        append_overflow(page, key);            /* +1 write: new node, +1 write: predecessor link */',
      '    }',
      '}'
    ];
  }
  function javaCode(block, group) {
    return [
      'static final int BLOCK = ' + block + ';   // keys per data page (capacity)',
      'static final int GROUP = ' + group + ';    // pages per level-1 group',
      '',
      'static int findGroup(int[] l1Key, int key) {',
      '    int g = 0;',
      '    for (int i = 0; i < l1Key.length; i++) { if (l1Key[i] <= key) g = i; else break; }',
      '    return g;',
      '}',
      '',
      'static int findPage(int[] l2Key, int lo, int hi, int key) {',
      '    int page = lo;',
      '    for (int i = lo; i <= hi; i++) { if (l2Key[i] <= key) page = i; else break; }',
      '    return page;',
      '}',
      '',
      'static void isamInsert(int key) {',
      '    int g = findGroup(l1Key, key);',
      '    int page = findPage(l2Key, g * GROUP, groupHi(g), key);',
      '    readPage(page);                            // +1 read: home page',
      '    if (pageLen[page] < BLOCK) {',
      '        insertSorted(page, key);',
      '        writePage(page);                       // +1 write',
      '    } else {',
      '        int walked = walkOverflowChain(page);   // +1 read per existing overflow node',
      '        appendOverflow(page, key);              // +1 write: new node, +1 write: predecessor link',
      '    }',
      '}'
    ];
  }

  function makePages(keys, block) {
    var pages = [];
    for (var i = 0; i < keys.length; i += block) pages.push(keys.slice(i, i + block));
    return pages;
  }
  function groupHi(g, group, numPages) { return Math.min(g * group + group - 1, numPages - 1); }
  function homePageOf(pages, v) {
    var home = 0;
    for (var p = 0; p < pages.length; p++) { if (pages[p][0] <= v) home = p; else break; }
    return home;
  }

  D.define({
    id: 'isam',
    title: T('ISAM: çok seviyeli dizin + taşma (overflow) alanı', 'ISAM: multi-level index + overflow area'),
    code: function (d) { return { c: cCode(d.block, d.group), java: javaCode(d.block, d.group) }; },
    presets: [
      { id: 'normal', level: 'normal', name: T('12 anahtar, block=4 (dolum=3), 3 ekleme (1 taşma)', '12 keys, block=4 (fill=3), 3 inserts (1 overflow)'),
        data: { block: 4, fill: 3, group: 2, keys: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60], inserts: [22, 38, 39] } },
      { id: 'hard', level: 'hard', name: T('16 anahtar, block=4 (dolum=2), aynı sayfada zincirlenen taşma', '16 keys, block=4 (fill=2), chained overflow on the same page'),
        data: { block: 4, fill: 2, group: 3, keys: [2, 8, 14, 19, 23, 29, 34, 41, 47, 53, 58, 64, 69, 75, 81, 88], inserts: [24, 25, 26] } },
      { id: 'no-overflow', level: 'edge', name: T('Uç durum: bol boş yer, hiç taşma yok', 'Edge case: plenty of free room, no overflow at all'),
        data: { block: 8, fill: 3, group: 2, keys: [4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59], inserts: [11, 46, 12, 47] } },
      { id: 'all-overflow', level: 'edge', name: T('Uç durum: dolum=block, her ekleme taşar', 'Edge case: fill=block, every insert overflows'),
        data: { block: 2, fill: 2, group: 3, keys: [10, 12, 20, 22, 30, 32, 40, 42, 50, 52], inserts: [11, 21, 31, 41] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      var block = d.block, group = d.group, keys = d.keys.slice(), inserts = d.inserts;
      var pages = [];
      for (var i = 0; i < keys.length; i += d.fill) pages.push(keys.slice(i, i + d.fill));
      var reads = 0, writes = pages.length, chains = [];
      for (var p = 0; p < pages.length; p++) chains.push([]);
      var placements = [];
      inserts.forEach(function (v) {
        var home = 0;
        for (var p2 = 0; p2 < pages.length; p2++) { if (pages[p2][0] <= v) home = p2; else break; }
        reads++;
        if (pages[home].length < block) {
          pages[home].push(v);
          pages[home].sort(function (a, b) { return a - b; });
          writes++;
          placements.push({ key: v, type: 'primary', page: home, chainPos: null });
        } else {
          var chain = chains[home];
          reads += chain.length;
          chain.push(v);
          writes += 2;
          placements.push({ key: v, type: 'overflow', page: home, chainPos: chain.length - 1 });
        }
      });
      return { pages: pages.length, writes: writes, reads: reads, inserts: placements };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level] || 12;
      var block = D.randInt(r, 2, level === 'extreme' ? 3 : 5);
      var fill = level === 'extreme' ? block : D.randInt(r, 1, block);
      var group = D.randInt(r, 2, 3);
      var keys = [], v = D.randInt(r, 1, 10);
      for (var i = 0; i < n; i++) { keys.push(v); v += D.randInt(r, 3, 10); }
      var ni = level === 'extreme' ? 4 : (level === 'hard' ? 3 : 2), inserts = [];
      for (var j = 0; j < ni; j++) {
        var basePage = D.randInt(r, 0, Math.ceil(n / fill) - 1);
        var base = keys[Math.min(basePage * fill, keys.length - 1)];
        inserts.push(base + D.randInt(r, 1, block));
      }
      return { block: block, fill: fill, group: group, keys: keys, inserts: inserts };
    },
    input: {
      hint: T('Örnek: block=4 fill=3 group=2 keys: 5,10,15,20,25,30,35,40,45,50,55,60 inserts: 22,38,39',
              'Example: block=4 fill=3 group=2 keys: 5,10,15,20,25,30,35,40,45,50,55,60 inserts: 22,38,39'),
      parse: function (text) {
        var block = 4, fill = 3, group = 2, keys = [], inserts = [], mode = 'keys';
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mb = /^block[=:](\d+)$/i.exec(tok); if (mb) { block = parseInt(mb[1], 10); return; }
          var mf = /^fill[=:](\d+)$/i.exec(tok); if (mf) { fill = parseInt(mf[1], 10); return; }
          var mg = /^group[=:](\d+)$/i.exec(tok); if (mg) { group = parseInt(mg[1], 10); return; }
          if (/^keys?:?$/i.test(tok)) { mode = 'keys'; return; }
          if (/^inserts?:?$/i.test(tok)) { mode = 'inserts'; return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, block=N, fill=N, group=N, keys ya da inserts yazın.',
                                             '"' + tok + '" is not understood: write a number, block=N, fill=N, group=N, keys or inserts.');
          (mode === 'keys' ? keys : inserts).push(parseInt(tok, 10));
        });
        if (block < 1 || block > 8) throw T('block 1 ile 8 arasında olmalı.', 'block must be between 1 and 8.');
        if (fill < 1 || fill > block) throw T('fill 1 ile block arasında olmalı.', 'fill must be between 1 and block.');
        if (group < 1 || group > 6) throw T('group 1 ile 6 arasında olmalı.', 'group must be between 1 and 6.');
        if (keys.length < 10) throw T('En az 10 anahtar yazın.', 'Write at least 10 keys.');
        for (var i = 1; i < keys.length; i++) if (keys[i] <= keys[i - 1]) throw T('Anahtarlar kesin artan olmalı.', 'Keys must be strictly increasing.');
        if (!inserts.length) throw T('En az bir inserts değeri yazın.', 'Write at least one inserts value.');
        if (inserts.some(function (v) { return v < keys[0]; })) throw T('inserts değerleri en küçük anahtardan küçük olamaz.', 'inserts values cannot be smaller than the smallest key.');
        return { block: block, fill: fill, group: group, keys: keys, inserts: inserts };
      },
      format: function (d) { return 'block=' + d.block + ' fill=' + d.fill + ' group=' + d.group + ' keys: ' + d.keys.join(',') + ' inserts: ' + d.inserts.join(','); },
      bad: ['', 'block=0 keys: 1,2,3,4,5,6,7,8,9,10 inserts: 5', 'keys: 1,2,3,4,5,6,7,8,9 inserts: 5',
            'keys: 1,2,3,4,5,6,7,8,9,10 inserts:', 'keys: 1,x,3,4,5,6,7,8,9,10,11 inserts: 5', 'block=3 fill=5 keys: 5,6,7,8,9,10,11,12,13,14 inserts: 1'],
      tokens: function (d) { return d.inserts.map(String); }
    },
    build: function (S, d) {
      var block = d.block, group = d.group, keys = d.keys, inserts = d.inserts;
      var pages = makePages(keys, d.fill);
      var numGroups = Math.ceil(pages.length / group);
      var X0 = 80, DGAP = 22, DW = Math.max(64, block * 22 + 14), DH = 44;
      var Y_L1 = 54, Y_L2 = 140, Y_DATA = 236, Y_OVF = 360;
      var reads = 0, writes = 0;

      function dataX(i) { return X0 + i * (DW + DGAP); }
      S.label('title', { x: X0, y: 20, text: 'BLOCK = ' + block + '   FILL = ' + d.fill + '   GROUP = ' + group, size: 14, bold: true, mono: true, anchor: 'start' });
      var RX = X0 + pages.length * (DW + DGAP) + 24;
      S.label('io', { x: RX, y: Y_DATA, text: T('okuma: 0  yazma: 0', 'reads: 0  writes: 0'), size: 15, bold: true, mono: true, anchor: 'start' });
      function setIO() { S.set('io', { text: T('okuma: ' + reads + '  yazma: ' + writes, 'reads: ' + reads + '  writes: ' + writes) }); }
      S.label('l1lbl', { x: X0 - 16, y: Y_L1 + 20, text: T('seviye-1 dizin =', 'level-1 index ='), anchor: 'end', size: 13, bold: true });
      S.label('l2lbl', { x: X0 - 16, y: Y_L2 + 20, text: T('seviye-2 dizin =', 'level-2 index ='), anchor: 'end', size: 13, bold: true });
      S.label('datalbl', { x: X0 - 16, y: Y_DATA + DH / 2 + 5, text: T('birincil veri alanı =', 'primary data area ='), anchor: 'end', size: 13, bold: true });
      S.label('ovflbl', { x: X0 - 16, y: Y_OVF + 18, text: T('taşma alanı =', 'overflow area ='), anchor: 'end', size: 13, bold: true });
      S.label('dec', { x: RX, y: Y_DATA + 28, text: '', size: 15, bold: true, mono: true, anchor: 'start' });

      pages.forEach(function (pg, i) {
        S.box('pg' + i, { x: dataX(i), y: Y_DATA, w: DW, h: DH, text: pg.join(','), style: 'normal', size: 13, above: T('sf ' + (i + 1), 'pg ' + (i + 1)) });
        S.box('l2_' + i, { x: dataX(i), y: Y_L2, w: 48, h: 34, text: String(pg[0]), style: 'normal', size: 13 });
        S.arrow('l2a' + i, { from: 'l2_' + i, to: 'pg' + i, kind: 'center', head: true, style: 'dim' });
      });
      for (var g = 0; g < numGroups; g++) {
        S.box('l1_' + g, { x: dataX(g * group), y: Y_L1, w: 52, h: 32, text: String(pages[g * group][0]), style: 'normal', size: 13 });
        S.arrow('l1a' + g, { from: 'l1_' + g, to: 'l2_' + (g * group), kind: 'center', head: true, style: 'dim' });
      }
      writes = pages.length; setIO();
      S.step(T('Sıralı ' + keys.length + ' anahtar, sayfa başına `' + d.fill + '` anahtarla ' + pages.length + ' sayfaya yazılmış (' + pages.length + ' yazma); her sayfanın KAPASİTESİ `BLOCK=' + block + '`, yani ' + (block - d.fill) + ' boş yuva ile başlıyor. Seviye-2 dizin sayfa başına, seviye-1 dizin her `GROUP=' + group + '` sayfayı bir girdide toplar.',
               'The ' + keys.length + ' sorted keys were written into ' + pages.length + ' pages holding `' + d.fill + '` keys each (' + pages.length + ' writes); every page\'s CAPACITY is `BLOCK=' + block + '`, so it starts with ' + (block - d.fill) + ' free slot(s). Level-2 indexes per page; level-1 groups every `GROUP=' + group + '` pages into one entry.'),
             { c: [1, 2], java: [1, 2] });

      var results = [];
      inserts.forEach(function (v, vi) {
        S.at(vi);
        S.set('dec', { text: '' });
        pages.forEach(function (_, i) { S.set('l2_' + i, { style: 'normal' }); S.set('l2a' + i, { style: 'dim' }); S.set('pg' + i, { style: 'normal' }); });
        for (var gg = 0; gg < numGroups; gg++) { S.set('l1_' + gg, { style: 'normal' }); S.set('l1a' + gg, { style: 'dim' }); }

        var home = 0;
        for (var p2 = 0; p2 < pages.length; p2++) { if (pages[p2][0] <= v) home = p2; else break; }
        var g0 = Math.floor(home / group);
        S.set('l1_' + g0, { style: 'active' }); S.set('l1a' + g0, { style: 'active' });
        S.step(T('`isam_insert(' + v + ')`: seviye-1 dizinde tara -- grup ' + (g0 + 1) + ' (ilk anahtarı ' + pages[g0 * group][0] + ') seçildi.',
                 '`isam_insert(' + v + ')`: scan the level-1 index -- group ' + (g0 + 1) + ' (first key ' + pages[g0 * group][0] + ') is chosen.'),
               { c: [17, 4, 5, { n: 6, note: T('i: 0..' + (numGroups - 1), 'i: 0..' + (numGroups - 1)) }, 7],
                 java: [17, 4, 5, { n: 6, note: T('i: 0..' + (numGroups - 1), 'i: 0..' + (numGroups - 1)) }, 7] });

        S.set('l2_' + home, { style: 'active' }); S.set('l2a' + home, { style: 'active' });
        var g0hi = groupHi(g0, group, pages.length);
        S.step(T('Grup ' + (g0 + 1) + ' içinde seviye-2 dizinde tara -- sayfa ' + (home + 1) + ' (ilk anahtarı ' + pages[home][0] + ') ev sayfası (home page).',
                 'Scan the level-2 index inside group ' + (g0 + 1) + ' -- page ' + (home + 1) + ' (first key ' + pages[home][0] + ') is the home page.'),
               { c: [18, 10, 11, { n: 12, note: T('i: ' + (g0 * group) + '..' + g0hi, 'i: ' + (g0 * group) + '..' + g0hi) }, 13],
                 java: [18, 10, 11, { n: 12, note: T('i: ' + (g0 * group) + '..' + g0hi, 'i: ' + (g0 * group) + '..' + g0hi) }, 13] });

        reads++; setIO();
        S.set('pg' + home, { style: 'hl' });
        var full = pages[home].length >= block;
        S.set('dec', { text: full ? T('sf ' + (home + 1) + ' dolu!', 'pg ' + (home + 1) + ' full!') : T('sf ' + (home + 1) + ' okundu, yer var', 'pg ' + (home + 1) + ' read, room left') });
        S.step(T('Ev sayfası ' + (home + 1) + ' OKUNUYOR (+1 okuma): ' + pages[home].length + '/' + block + ' dolu.',
                 'The home page ' + (home + 1) + ' is READ (+1 read): ' + pages[home].length + '/' + block + ' full.'),
               { c: [19, full ? { n: 20, note: T('yer var mı? hayır', 'room left? no') } : { n: 20, note: T('yer var mı? evet', 'room left? yes') }],
                 java: [19, full ? { n: 20, note: T('yer var mı? hayır', 'room left? no') } : { n: 20, note: T('yer var mı? evet', 'room left? yes') }] });

        if (!full) {
          pages[home].push(v); pages[home].sort(function (a, b) { return a - b; });
          writes++; setIO();
          S.set('pg' + home, { text: pages[home].join(','), style: 'new' });
          S.step(T('Yer vardı: `' + v + '` doğrudan sayfa ' + (home + 1) + '\'e sıralı eklenir ve sayfa yeniden YAZILIR (+1 yazma). Taşma yok.',
                   'There was room: `' + v + '` is inserted directly into page ' + (home + 1) + ' in sorted order and the page is WRITTEN back (+1 write). No overflow.'),
                 { c: [21, 22], java: [21, 22] });
          results.push({ key: v, type: 'primary', page: home, chainPos: null });
        } else {
          var chainKey = 'chain' + home;
          if (!S._chains) S._chains = {};
          if (!S._chains[chainKey]) S._chains[chainKey] = { tailId: null, n: 0 };
          var chainState = S._chains[chainKey];
          var walked = 0;
          for (var w = 0; w < chainState.n; w++) {
            reads++; setIO(); walked++;
            var wid = 'of_' + home + '_' + w;
            S.set(wid, { style: 'hl' });
            S.step(T('Taşma zincirini yürü: düğüm ' + (w + 1) + ' okunur (+1 okuma), sonuna ulaşmadan aramaya devam.',
                     'Walk the overflow chain: node ' + (w + 1) + ' is read (+1 read), keep going until the tail.'),
                   { c: [24], java: [24] });
            S.set(wid, { style: 'dim' });
          }
          var idx = chainState.n;
          var oid = 'of_' + home + '_' + idx;
          var ovfIndex = 0; for (var pp = 0; pp <= home; pp++) if (S._chains['chain' + pp]) ovfIndex += S._chains['chain' + pp].n; // rough left-to-right slot
          var ox = X0 + (S._ovfCount || 0) * (54 + 14);
          S._ovfCount = (S._ovfCount || 0) + 1;
          S.box(oid, { x: ox, y: Y_OVF, w: 50, h: 34, text: String(v), style: 'new', size: 13, below: T('sf' + (home + 1), 'pg' + (home + 1)) });
          if (chainState.tailId) S.arrow('ofa_' + oid, { from: chainState.tailId, to: oid, kind: 'center', head: true, style: 'new' });
          else S.arrow('ofa_' + oid, { from: 'pg' + home, to: oid, kind: 'center', head: true, style: 'new' });
          chainState.tailId = oid; chainState.n++;
          writes += 2; setIO();
          S.set('dec', { text: T(walked + ' düğüm yüründü, taşmaya eklendi', walked + ' nodes walked, added to overflow') });
          S.step(T('Sayfa ' + (home + 1) + ' dolu: `' + v + '` TAŞMA ALANINA eklenir -- yeni düğüm yazılır ve zincirdeki bir önceki bağlantı güncellenir (+2 yazma).',
                   'Page ' + (home + 1) + ' is full: `' + v + '` is added to the OVERFLOW AREA -- the new node is written and the previous link is updated (+2 writes).'),
                 { c: [24, 25], java: [24, 25] });
          results.push({ key: v, type: 'overflow', page: home, chainPos: idx });
        }
      });

      S.at(null);
      S.set('dec', { text: '' });
      pages.forEach(function (_, i) { S.set('l2_' + i, { style: 'normal' }); S.set('l2a' + i, { style: 'dim' }); S.set('pg' + i, { style: 'normal' }); });
      for (var gg2 = 0; gg2 < numGroups; gg2++) { S.set('l1_' + gg2, { style: 'normal' }); S.set('l1a' + gg2, { style: 'dim' }); }
      S.result = { pages: pages.length, writes: writes, reads: reads, inserts: results };
      S.step(T('Bitti: ' + inserts.length + ' ekleme, toplam ' + reads + ' okuma / ' + writes + ' yazma. Taşma zincirleri uzadıkça arama yavaşlar -- bu yüzden gerçek ISAM dosyaları düzenli olarak **yeniden düzenlenir (reorganize)**.',
               'Done: ' + inserts.length + ' inserts, ' + reads + ' reads / ' + writes + ' writes in total. As overflow chains grow, search gets slower -- which is why real ISAM files are periodically **reorganized**.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
