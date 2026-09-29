/* Week 13 — relative (direct) file access: a record number (RRN) maps straight to a block and an offset by
   arithmetic — block = rrn / bf, offset = rrn % bf — so a record is fetched with exactly ONE block read and no
   searching at all, unlike sequential or binary search. Examples (normal, hard, edge: invalid RRNs, edge: last
   partial block), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '#define BF 5   /* records per block */',
    '',
    'int direct_read(FILE *fp, int total, int rrn, int *out, int *block_reads) {',
    '    if (rrn < 0 || rrn >= total) return -1;          /* invalid record number */',
    '    int block  = rrn / BF;',
    '    int offset = rrn % BF;',
    '    fseek(fp, (long) block * BF * sizeof(int), SEEK_SET);',
    '    int buf[BF];',
    '    int cnt = (int) fread(buf, sizeof(int), BF, fp);  /* exactly ONE read, always */',
    '    (*block_reads)++;',
    '    if (offset >= cnt) return -1;                     /* past the last, partial block */',
    '    *out = buf[offset];',
    '    return 0;',
    '}'
  ];
  var JAVA = [
    'static final int BF = 5;   // records per block',
    '',
    'static int directRead(RandomAccessFile fp, int total, int rrn, int[] out, int[] blockReads) throws IOException {',
    '    if (rrn < 0 || rrn >= total) return -1;                    // invalid record number',
    '    int block  = rrn / BF;',
    '    int offset = rrn % BF;',
    '    fp.seek((long) block * BF * 4);',
    '    int[] buf = new int[BF];',
    '    int cnt = 0;',
    '    for (; cnt < BF && fp.getFilePointer() < fp.length(); cnt++) buf[cnt] = fp.readInt();   // exactly ONE read, always',
    '    blockReads[0]++;',
    '    if (offset >= cnt) return -1;                               // past the last, partial block',
    '    out[0] = buf[offset];',
    '    return 0;',
    '}'
  ];

  function file(bf, total) {
    var records = [];
    for (var i = 0; i < total; i++) records.push(100 + i * 3);
    return { bf: bf, total: total, records: records };
  }

  D.define({
    id: 'relative-file-direct-access',
    title: T('Göreli dosyada doğrudan erişim: kayıt no → blok/konum', 'Relative file direct access: record number to block/offset'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('bf=5, 13 kayıt, 3 geçerli istek', 'bf=5, 13 records, 3 valid requests'),
        data: Object.assign(file(5, 13), { requests: [7, 2, 12] }) },
      { id: 'hard', level: 'hard', name: T('bf=4, 16 kayıt, sınır konumlarında 5 istek', 'bf=4, 16 records, 5 requests at boundary offsets'),
        data: Object.assign(file(4, 16), { requests: [0, 3, 4, 15, 8] }) },
      { id: 'edge-invalid', level: 'edge', name: T('Uç: negatif ve aralık dışı kayıt no (hata)', 'Edge: negative and out-of-range record numbers (errors)'),
        data: Object.assign(file(5, 12), { requests: [-1, 15, 5] }) },
      { id: 'edge-last-partial', level: 'edge', name: T('Uç: son kısmi bloktaki tek kayıt + aralık dışı', 'Edge: the single record in the last partial block + out of range'),
        data: Object.assign(file(5, 11), { requests: [10, 9, 11] }) }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.total; },
    minSize: 10,
    reference: function (d) {
      var results = [], reads = 0, errors = 0;
      d.requests.forEach(function (rrn) {
        if (rrn < 0 || rrn >= d.total) { results.push({ rrn: rrn, ok: false }); errors++; return; }
        var block = Math.floor(rrn / d.bf), offset = rrn % d.bf;
        reads++;
        results.push({ rrn: rrn, ok: true, block: block, offset: offset, value: d.records[rrn] });
      });
      return { results: results, blockReads: reads, errors: errors };
    },
    random: function (level, r) {
      var bf = level === 'extreme' ? 3 : 5, total = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level];
      var f = file(bf, total), nreq = D.randInt(r, 3, 5), requests = [];
      for (var i = 0; i < nreq; i++) requests.push(r() < 0.2 ? (r() < 0.5 ? -1 - D.randInt(r, 0, 3) : total + D.randInt(r, 0, 3)) : D.randInt(r, 0, total - 1));
      return Object.assign(f, { requests: requests });
    },
    input: {
      hint: T('Örnek: bf=5 total=13  7 2 12   (istenen kayıt numaraları)', 'Example: bf=5 total=13  7 2 12   (requested record numbers)'),
      parse: function (text) {
        var bf = 5, total = 13, requests = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mb = /^bf[=:](\d+)$/i.exec(tok), mt = /^total[=:](\d+)$/i.exec(tok);
          if (mb) { bf = parseInt(mb[1], 10); return; }
          if (mt) { total = parseInt(mt[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, bf=N ya da total=N yazın.', '"' + tok + '" is not understood: write a number, bf=N or total=N.');
          requests.push(parseInt(tok, 10));
        });
        if (bf < 1 || bf > 12) throw T('bf 1-12 arasında olmalı.', 'bf must be between 1 and 12.');
        if (total < 1 || total > 40) throw T('total 1-40 arasında olmalı.', 'total must be between 1 and 40.');
        if (!requests.length) throw T('En az bir istek yazın.', 'Write at least one request.');
        if (requests.length > 10) throw T('En çok 10 istek.', 'At most 10 requests.');
        return Object.assign(file(bf, total), { requests: requests });
      },
      format: function (d) { return 'bf=' + d.bf + ' total=' + d.total + '  ' + d.requests.join(' '); },
      bad: ['', 'bf=0 total=10 5', 'total=0 5', '5 x 7', 'bf=abc total=10 5'],
      tokens: function (d) { return d.requests.map(String); }
    },
    build: function (S, d) {
      var bf = d.bf, X0 = 90, YD = 110, YB = 240, BH = 44, GAP = 10, RW = 60;
      var nblocks = Math.ceil(d.total / bf);
      S.label('rowD', { x: X0 - 16, y: YD + BH / 2 + 5, text: T('disk =', 'disk ='), anchor: 'end', size: 15, bold: true });
      S.label('rowB', { x: X0 - 16, y: YB + RW / 2 + 5, text: T('RAM tampon =', 'RAM buffer ='), anchor: 'end', size: 15, bold: true });
      var xCursor = X0;
      for (var b = 0; b < nblocks; b++) {
        var chunk = d.records.slice(b * bf, b * bf + bf);
        var text = chunk.join(' '), bw = Math.max(70, text.length * 9 + 20);
        S.box('d' + b, { x: xCursor, y: YD, w: bw, h: BH, text: text, style: 'normal', above: 'blk ' + b, mono: true, size: 13 });
        xCursor += bw + GAP;
      }
      var XR = xCursor + 20;
      S.label('reads', { x: XR, y: YD - 20, text: 'block reads = 0', size: 15, mono: true, anchor: 'start' });
      S.label('errors', { x: XR, y: YD + 4, text: 'errors = 0', size: 15, mono: true, anchor: 'start', style: 'dim' });
      S.label('decision', { x: XR, y: YD + 32, text: '', size: 16, bold: true, mono: true, anchor: 'start' });

      var reads = 0, errors = 0, results = [], lastBufCount = 0;
      function counters() { S.set('reads', { text: 'block reads = ' + reads }); S.set('errors', { text: 'errors = ' + errors }); }
      function clearBuf(n) { for (var i = 0; i < n; i++) if (S.has('r' + i)) S.remove('r' + i); }
      counters();

      d.requests.forEach(function (rrn, k) {
        var detailed = k < 2;
        if (S.has('slot')) S.remove('slot');
        if (rrn < 0 || rrn >= d.total) {
          errors++;
          S.set('decision', { text: T('rrn=' + rrn + ' geçersiz!', 'rrn=' + rrn + ' invalid!'), style: 'del' });
          counters();
          results.push({ rrn: rrn, ok: false });
          S.step(detailed
            ? T('`direct_read(fp, ' + d.total + ', ' + rrn + ', …)` — `rrn < 0 || rrn >= total` (' + d.total + ') → **geçersiz kayıt no**, hiçbir okuma yapılmaz.',
                '`direct_read(fp, ' + d.total + ', ' + rrn + ', …)` — `rrn < 0 || rrn >= total` (' + d.total + ') → **invalid record number**, no read happens.')
            : T('rrn=' + rrn + ' → geçersiz, okuma yok.', 'rrn=' + rrn + ' → invalid, no read.'),
            { c: [{ n: 4, note: T('geçersiz mi? evet', 'invalid? yes') }], java: [{ n: 4, note: T('invalid? yes', 'invalid? yes') }] });
          return;
        }
        var block = Math.floor(rrn / bf), offset = rrn % bf;
        S.set('decision', { text: 'rrn=' + rrn + ' → blk ' + block + ', off ' + offset, style: 'active' });
        if (detailed) {
          S.step(T('`direct_read(fp, ' + d.total + ', ' + rrn + ', …)` — geçerli. `block = ' + rrn + ' / ' + bf + ' = ' + block + '`, `offset = ' + rrn + ' % ' + bf + ' = ' + offset + '`. **Hesap**, arama yok.',
                   '`direct_read(fp, ' + d.total + ', ' + rrn + ', …)` — valid. `block = ' + rrn + ' / ' + bf + ' = ' + block + '`, `offset = ' + rrn + ' % ' + bf + ' = ' + offset + '`. **Arithmetic**, no searching.'),
                 { c: [{ n: 4, note: T('geçersiz mi? hayır', 'invalid? no') }, 5, 6], java: [{ n: 4, note: T('invalid? no', 'invalid? no') }, 5, 6] });
        }
        S.set('d' + block, { style: 'active' });
        var chunk2 = d.records.slice(block * bf, block * bf + bf);
        clearBuf(lastBufCount); lastBufCount = chunk2.length;
        for (var i2 = 0; i2 < chunk2.length; i2++) S.box('r' + i2, { x: X0 + i2 * RW, y: YB, w: RW - 6, h: BH, text: String(chunk2[i2]), style: i2 === offset ? 'hl' : 'normal', mono: true, size: 13 });
        reads++;
        counters();
        if (detailed) {
          S.step(T('`fread(buf, …)` — blok ' + block + ' **tek seferde** okunur (okuma #' + reads + '); ' + chunk2.length + ' kayıt tamponda.',
                   '`fread(buf, …)` — block ' + block + ' is read **in one go** (read #' + reads + '); ' + chunk2.length + ' record(s) in the buffer.'),
                 { c: [7, 8, 9, 10],
                   java: [7, 8, 9, { n: 10, note: T(chunk2.length + ' kayıt okundu', chunk2.length + ' record(s) read') }, 11] });
        }
        if (offset >= chunk2.length) {
          errors++;
          S.set('d' + block, { style: 'del' });
          S.set('decision', { text: T('konum son kısmi bloğun ötesinde!', 'offset past the last partial block!'), style: 'del' });
          counters();
          results.push({ rrn: rrn, ok: false });
          S.step(T('`offset >= cnt` (' + offset + ' >= ' + chunk2.length + ') → bu konum son kısmi bloğun ötesinde: **geçersiz**.',
                   '`offset >= cnt` (' + offset + ' >= ' + chunk2.length + ') → this offset is past the last, partial block: **invalid**.'),
                 { c: [{ n: 11, note: T('evet', 'yes') }], java: [{ n: 12, note: T('yes', 'yes') }] });
          return;
        }
        var val = chunk2[offset];
        S.set('r' + offset, { style: 'new' });
        S.set('d' + block, { style: 'new' });
        S.set('decision', { text: 'value = ' + val, style: 'new' });
        results.push({ rrn: rrn, ok: true, block: block, offset: offset, value: val });
        S.step(detailed
          ? T('`*out = buf[' + offset + ']` = ' + val + '. Tek okuma, **O(1)**: kayıt sayısı ne olursa olsun aynı maliyet.',
              '`*out = buf[' + offset + ']` = ' + val + '. One read, **O(1)**: the same cost no matter how many records the file has.')
          : T('rrn=' + rrn + ' → blk ' + block + '[' + offset + '] = ' + val + '.', 'rrn=' + rrn + ' → blk ' + block + '[' + offset + '] = ' + val + '.'),
          { c: [{ n: 11, note: T('hayır', 'no') }, 12, 13], java: [{ n: 12, note: T('no', 'no') }, 13, 14] });
      });
      S.at(null);
      S.result = { results: results, blockReads: reads, errors: errors };
      S.step(T('Bitti: ' + d.requests.length + ' istek, ' + reads + ' blok okuması (her geçerli istek tam 1 okuma), ' + errors + ' hata. Ardışık ya da ikili aramanın aksine, göreli erişimde okuma sayısı dosya boyutundan **bağımsızdır**.',
               'Done: ' + d.requests.length + ' request(s), ' + reads + ' block read(s) (exactly 1 per valid request), ' + errors + ' error(s). Unlike sequential or binary search, relative access reads a fixed number of blocks **regardless of file size**.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
