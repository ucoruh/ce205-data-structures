/* Week 13 — binary search of a SORTED file: jump to the middle BLOCK (compare the key to the block's first and
   last key), then scan only inside that one block; O(log numBlocks) block reads instead of O(numBlocks),
   examples (normal, hard, edge: a gap inside a block's range, a key outside the file's range), random data and
   own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '#define BF 4   /* records per block; the whole file is sorted by key */',
    '',
    'int bsearch_file(FILE *fp, int nblocks, int key, int *block_reads) {',
    '    int lo = 0, hi = nblocks - 1;',
    '    int buf[BF];',
    '    while (lo <= hi) {',
    '        int mid = (lo + hi) / 2;',
    '        fseek(fp, (long) mid * BF * sizeof(int), SEEK_SET);',
    '        int cnt = (int) fread(buf, sizeof(int), BF, fp);   /* one block read */',
    '        (*block_reads)++;',
    '        if (key < buf[0]) {',
    '            hi = mid - 1;                                  /* whole block is too big: go left */',
    '        } else if (key > buf[cnt - 1]) {',
    '            lo = mid + 1;                                  /* whole block is too small: go right */',
    '        } else {',
    '            for (int i = 0; i < cnt; i++)                  /* key\'s block found: scan inside it */',
    '                if (buf[i] == key) return mid * BF + i;',
    '            return -1;                                      /* in range but absent: a gap */',
    '        }',
    '    }',
    '    return -1;                                               /* outside the file\'s key range */',
    '}'
  ];
  var JAVA = [
    'static final int BF = 4;   // records per block; the whole file is sorted by key',
    '',
    'static int bsearchFile(RandomAccessFile fp, int nblocks, int key, int[] blockReads) throws IOException {',
    '    int lo = 0, hi = nblocks - 1;',
    '    int[] buf = new int[BF];',
    '    while (lo <= hi) {',
    '        int mid = (lo + hi) / 2;',
    '        fp.seek((long) mid * BF * 4);',
    '        int cnt = 0;',
    '        for (; cnt < BF && fp.getFilePointer() < fp.length(); cnt++) buf[cnt] = fp.readInt();   // one block read',
    '        blockReads[0]++;',
    '        if (key < buf[0]) {',
    '            hi = mid - 1;                                   // whole block is too big: go left',
    '        } else if (key > buf[cnt - 1]) {',
    '            lo = mid + 1;                                   // whole block is too small: go right',
    '        } else {',
    '            for (int i = 0; i < cnt; i++)                   // key\'s block found: scan inside it',
    '                if (buf[i] == key) return mid * BF + i;',
    '            return -1;                                       // in range but absent: a gap',
    '        }',
    '    }',
    '    return -1;                                                // outside the file\'s key range',
    '}'
  ];

  D.define({
    id: 'binary-search-sorted-file',
    title: T('Sıralı dosyada ikili arama: blok düzeyinde', 'Binary search of a sorted file: at block level'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('bf=4, 12 sıralı anahtar, hedef 2. blokta bulunur', 'bf=4, 12 sorted keys, target found in the 2nd probed block'),
        data: { bf: 4, keys: [3, 9, 14, 20, 27, 31, 38, 44, 50, 57, 63, 70], target: 63 } },
      { id: 'hard', level: 'hard', name: T('bf=4, 24 sıralı anahtar (6 blok), en kötü durum 3 okuma gerektirir', 'bf=4, 24 sorted keys (6 blocks), worst case needs 3 probes'),
        data: { bf: 4, keys: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62, 65, 68, 71], target: 71 } },
      { id: 'edge-gap', level: 'edge', name: T('Uç: hedef bir bloğun aralığında ama orada yok (boşluk)', 'Edge: target is inside a block\'s range but absent (a gap)'),
        data: { bf: 4, keys: [4, 11, 19, 26, 33, 40, 48, 55, 62, 69, 77, 85], target: 45 } },
      { id: 'edge-outrange', level: 'edge', name: T('Uç: hedef dosyanın anahtar aralığının dışında (en küçükten küçük)', 'Edge: target is outside the file\'s key range (below the minimum)'),
        data: { bf: 4, keys: [4, 11, 19, 26, 33, 40, 48, 55, 62, 69, 77, 85], target: 1 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      var lo = 0, hi = Math.ceil(d.keys.length / d.bf) - 1, blockReads = 0, foundIndex = -1;
      while (lo <= hi) {
        var mid = (lo + hi) >> 1, start = mid * d.bf, end = Math.min(start + d.bf, d.keys.length);
        blockReads++;
        var first = d.keys[start], last = d.keys[end - 1];
        if (d.target < first) { hi = mid - 1; continue; }
        if (d.target > last) { lo = mid + 1; continue; }
        for (var i = start; i < end; i++) if (d.keys[i] === d.target) { foundIndex = i; break; }
        break;
      }
      return { foundIndex: foundIndex, blockReads: blockReads };
    },
    random: function (level, r) {
      var bf = level === 'extreme' ? 3 : 4, n = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level];
      var keys = [], v = D.randInt(r, 1, 5);
      for (var i = 0; i < n; i++) { keys.push(v); v += D.randInt(r, 2, 9); }
      var target = r() < 0.2 ? keys[keys.length - 1] + D.randInt(r, 5, 50) : keys[D.randInt(r, 0, n - 1)];
      return { bf: bf, keys: keys, target: target };
    },
    input: {
      hint: T('Örnek: hedef=63  3 9 14 20 27 31 38 44 50 57 63 70 (artan sırada)', 'Example: target=63  3 9 14 20 27 31 38 44 50 57 63 70 (ascending)'),
      parse: function (text) {
        var target = null, bf = 4, keys = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^(?:hedef|target)[=:](-?\d+)$/i.exec(tok);
          var mb = /^bf[=:](\d+)$/i.exec(tok);
          if (m) { target = parseInt(m[1], 10); return; }
          if (mb) { bf = parseInt(mb[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, bf=N ya da hedef=N yazın.', '"' + tok + '" is not understood: write a number, bf=N or target=N.');
          keys.push(parseInt(tok, 10));
        });
        if (target === null) throw T('hedef=N yazmalısınız.', 'You must write target=N.');
        if (keys.length < 2) throw T('En az iki anahtar yazın.', 'Write at least two keys.');
        for (var i = 1; i < keys.length; i++) if (keys[i] <= keys[i - 1]) throw T('Anahtarlar artan sırada ve tekrarsız olmalı.', 'Keys must be strictly ascending.');
        if (keys.length > 24) throw T('En çok 24 anahtar.', 'At most 24 keys.');
        if (bf < 1 || bf > 10) throw T('bf 1-10 arasında olmalı.', 'bf must be between 1 and 10.');
        return { bf: bf, keys: keys, target: target };
      },
      format: function (d) { return 'target=' + d.target + ' bf=' + d.bf + '  ' + d.keys.join(' '); },
      bad: ['', 'hedef=abc 5 9', '5 x 7', 'target=5', 'target=5 9 4 2'],
      tokens: function (d) { return d.keys.map(String); }
    },
    build: function (S, d) {
      var bf = d.bf, X0 = 90, YD = 110, YB = 230, BW = 88, BH = 44, GAP = 10, RW = 54;
      var nblocks = Math.ceil(d.keys.length / bf);
      S.label('rowD', { x: X0 - 16, y: YD + BH / 2 + 5, text: T('disk =', 'disk ='), anchor: 'end', size: 15, bold: true });
      S.label('rowB', { x: X0 - 16, y: YB + RW / 2 + 5, text: T('RAM tampon =', 'RAM buffer ='), anchor: 'end', size: 15, bold: true });
      var xCursor = X0;
      for (var b = 0; b < nblocks; b++) {
        var chunk = d.keys.slice(b * bf, b * bf + bf), text = chunk.join(' '), bw = Math.max(BW, text.length * 9 + 20);
        S.box('d' + b, { x: xCursor, y: YD, w: bw, h: BH, text: text, style: 'normal', above: 'blk ' + b, mono: true, size: 14 });
        xCursor += bw + GAP;
      }
      var XR = xCursor + 30;
      S.label('target', { x: XR, y: YD - 20, text: T('hedef = ' + d.target, 'target = ' + d.target), size: 17, bold: true, mono: true, anchor: 'start' });
      S.label('reads', { x: XR, y: YD + 8, text: 'block reads = 0', size: 15, mono: true, anchor: 'start' });
      S.label('range', { x: XR, y: YD + 32, text: 'lo..hi = 0..' + (nblocks - 1), size: 14, mono: true, anchor: 'start', style: 'dim' });
      S.label('decision', { x: XR, y: YD + 60, text: '', size: 16, bold: true, mono: true, anchor: 'start' });

      var lo = 0, hi = nblocks - 1, reads = 0, found = -1, lastBufCount = 0;
      function refresh() { S.set('reads', { text: 'block reads = ' + reads }); S.set('range', { text: 'lo..hi = ' + lo + '..' + hi }); }
      function clearBuf(count) { for (var i = 0; i < count; i++) if (S.has('r' + i)) S.remove('r' + i); }

      while (lo <= hi) {
        var mid = (lo + hi) >> 1, start = mid * bf, end = Math.min(start + bf, d.keys.length), chunk2 = d.keys.slice(start, end);
        S.set('d' + mid, { style: 'active' });
        clearBuf(lastBufCount);
        lastBufCount = chunk2.length;
        for (var i2 = 0; i2 < chunk2.length; i2++) S.box('r' + i2, { x: X0 + i2 * RW, y: YB, w: RW - 6, h: BH, text: String(chunk2[i2]), style: 'normal', mono: true });
        reads++;
        S.at(start);
        refresh();
        S.step(T('`mid = (' + lo + '+' + hi + ')/2 = ' + mid + '`: blok ' + mid + ' okunur (okuma #' + reads + ') — aralığı [' + chunk2[0] + '..' + chunk2[chunk2.length - 1] + '].',
                 '`mid = (' + lo + '+' + hi + ')/2 = ' + mid + '`: block ' + mid + ' is read (read #' + reads + ') — its range is [' + chunk2[0] + '..' + chunk2[chunk2.length - 1] + '].'),
               { c: [7, 8, 9, 10],
                 java: [7, 8, 9, { n: 10, note: T(chunk2.length + ' kayıt okundu', chunk2.length + ' record(s) read') }, 11] });

        var first = chunk2[0], last = chunk2[chunk2.length - 1];
        if (d.target < first) {
          S.set('decision', { text: d.target + ' < ' + first, style: 'del' });
          S.set('d' + mid, { style: 'dim' });
          hi = mid - 1;
          refresh();
          S.step(T('`key < buf[0]` (' + d.target + ' < ' + first + ') → hedef bu bloktan da küçük, **sol yarıya** geç: `hi = ' + hi + '`.',
                   '`key < buf[0]` (' + d.target + ' < ' + first + ') → the target is smaller than this whole block, go **left**: `hi = ' + hi + '`.'),
                 { c: [{ n: 11, note: T('key < buf[0]? evet', 'key < buf[0]? yes') }, 12, { n: 13, skip: true }, { n: 14, skip: true }, { n: 15, skip: true }, { n: 16, skip: true }, { n: 17, skip: true }],
                   java: [{ n: 12, note: T('key < buf[0]? yes', 'key < buf[0]? yes') }, 13, { n: 14, skip: true }, { n: 15, skip: true }, { n: 16, skip: true }, { n: 17, skip: true }, { n: 18, skip: true }] });
        } else if (d.target > last) {
          S.set('decision', { text: d.target + ' > ' + last, style: 'del' });
          S.set('d' + mid, { style: 'dim' });
          lo = mid + 1;
          refresh();
          S.step(T('`key > buf[cnt-1]` (' + d.target + ' > ' + last + ') → hedef bu bloktan da büyük, **sağ yarıya** geç: `lo = ' + lo + '`.',
                   '`key > buf[cnt-1]` (' + d.target + ' > ' + last + ') → the target is bigger than this whole block, go **right**: `lo = ' + lo + '`.'),
                 { c: [{ n: 11, note: T('key < buf[0]? hayır', 'key < buf[0]? no') }, { n: 12, skip: true }, { n: 13, note: T('key > buf[cnt-1]? evet', 'key > buf[cnt-1]? yes') }, 14, { n: 16, skip: true }, { n: 17, skip: true }],
                   java: [{ n: 12, note: T('key < buf[0]? no', 'key < buf[0]? no') }, { n: 13, skip: true }, { n: 14, note: T('key > buf[cnt-1]? yes', 'key > buf[cnt-1]? yes') }, 15, { n: 17, skip: true }, { n: 18, skip: true }] });
        } else {
          S.set('decision', { text: first + ' <= ' + d.target + ' <= ' + last, style: 'active' });
          S.step(T('`buf[0] <= key <= buf[cnt-1]` (' + first + '..' + last + ') → hedef **bu blokta** olmalı; artık blok içinde tek tek bakılır (ikili arama burada biter).',
                   '`buf[0] <= key <= buf[cnt-1]` (' + first + '..' + last + ') → the target **must be in this block**; now scan inside it one by one (the binary search stops here).'),
                 { c: [{ n: 11, note: T('key < buf[0]? hayır', 'key < buf[0]? no') }, { n: 12, skip: true }, { n: 13, note: T('key > buf[cnt-1]? hayır', 'key > buf[cnt-1]? no') }, { n: 14, skip: true }, 16],
                   java: [{ n: 12, note: T('key < buf[0]? no', 'key < buf[0]? no') }, { n: 13, skip: true }, { n: 14, note: T('key > buf[cnt-1]? no', 'key > buf[cnt-1]? no') }, { n: 15, skip: true }, 17] });
          for (var i3 = 0; i3 < chunk2.length; i3++) {
            S.set('r' + i3, { style: 'hl' });
            S.at(start + i3);
            var match = chunk2[i3] === d.target;
            S.set('decision', { text: chunk2[i3] + (match ? ' == ' : ' != ') + d.target, style: match ? 'new' : 'normal' });
            if (match) {
              found = start + i3;
              S.set('r' + i3, { style: 'new' });
              S.set('d' + mid, { style: 'new' });
              S.step(T('`buf[' + i3 + '] == key` → **bulundu**, konum ' + found + '.', '`buf[' + i3 + '] == key` → **found**, position ' + found + '.'),
                     { c: [{ n: 16, note: T('i < cnt? evet', 'i < cnt? yes') }, { n: 17, note: T('eşit mi? evet', 'equal? yes') }],
                       java: [{ n: 17, note: T('i < cnt? evet', 'i < cnt? yes') }, { n: 18, note: T('equal? yes', 'equal? yes') }] });
              break;
            }
            S.set('r' + i3, { style: 'dim' });
            S.step(T('`buf[' + i3 + '] != key` → sıradaki kayda bak.', '`buf[' + i3 + '] != key` → check the next record.'),
                   { c: [{ n: 16, note: T('i < cnt? evet', 'i < cnt? yes') }, { n: 17, note: T('eşit mi? hayır', 'equal? no') }],
                     java: [{ n: 17, note: T('i < cnt? evet', 'i < cnt? yes') }, { n: 18, note: T('equal? no', 'equal? no') }] });
          }
          if (found < 0) {
            S.set('d' + mid, { style: 'del' });
            S.step(T('Blok bitti, eşleşme yok → hedef bu aralıkta **yok** (boşluk): `return -1`. Anahtar aralıkta olsa bile dosyada bulunmayabilir.',
                     'The block ended with no match → the target is **absent** from this range (a gap): `return -1`. A key can be inside the range without actually being in the file.'),
                   { c: [18], java: [19] });
          }
          break;
        }
      }
      S.at(null);
      refresh();
      if (found < 0 && lo > hi) {
        S.set('decision', { text: T('bulunamadı (aralık dışı)', 'not found (out of range)'), style: 'del' });
        S.step(T('`lo > hi` (' + lo + ' > ' + hi + ') → arama biter, hedef dosyanın anahtar aralığının **dışında**.', '`lo > hi` (' + lo + ' > ' + hi + ') → the search ends, the target is **outside** the file\'s key range.'),
               { c: [21], java: [22] });
      }
      S.result = { foundIndex: found, blockReads: reads };
      var maxReads = Math.ceil(Math.log2(nblocks + 1));
      S.step(found >= 0
        ? T('Bitti: ' + d.target + ' konumda ' + found + ' bulundu — yalnız ' + reads + ' blok okuması (' + nblocks + ' bloktan; ardışık aramada en kötü durumda ' + nblocks + ' okuma gerekirdi). O(log numBlocks) ≈ ' + maxReads + '.',
           'Done: ' + d.target + ' found at position ' + found + ' — only ' + reads + ' block read(s) (out of ' + nblocks + '; sequential search would need up to ' + nblocks + ' in the worst case). O(log numBlocks) ≈ ' + maxReads + '.')
        : T('Bitti: ' + d.target + ' bulunamadı — ' + reads + ' blok okuması ile karar verildi (ardışık arama ' + nblocks + ' okuma gerektirirdi).',
           'Done: ' + d.target + ' not found — decided with ' + reads + ' block read(s) (sequential search would need ' + nblocks + ').'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
