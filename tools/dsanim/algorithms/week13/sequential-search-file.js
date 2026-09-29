/* Week 13 — sequential search of a file: blocks are read in order, and every record inside a loaded block is
   compared until the key is found or the file ends; the cost is measured in BLOCK READS, examples (normal, hard,
   edge), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '#define BF 4   /* records per block */',
    '',
    'int seq_search_file(FILE *fp, int n, int key, int *block_reads, int *comparisons) {',
    '    int buf[BF];',
    '    int nblocks = (n + BF - 1) / BF;',
    '    for (int b = 0; b < nblocks; b++) {',
    '        fseek(fp, (long) b * BF * sizeof(int), SEEK_SET);',
    '        int cnt = (int) fread(buf, sizeof(int), BF, fp);   /* one block read */',
    '        (*block_reads)++;',
    '        for (int i = 0; i < cnt; i++) {',
    '            (*comparisons)++;',
    '            if (buf[i] == key) return b * BF + i;           /* found */',
    '        }',
    '    }',
    '    return -1;                                              /* not found: every block was read */',
    '}'
  ];
  var JAVA = [
    'static final int BF = 4;   // records per block',
    '',
    'static int seqSearchFile(RandomAccessFile fp, int n, int key, int[] blockReads, int[] comparisons) throws IOException {',
    '    int[] buf = new int[BF];',
    '    int nblocks = (n + BF - 1) / BF;',
    '    for (int b = 0; b < nblocks; b++) {',
    '        fp.seek((long) b * BF * 4);',
    '        int cnt = 0;',
    '        for (; cnt < BF && fp.getFilePointer() < fp.length(); cnt++) buf[cnt] = fp.readInt();   // one block read',
    '        blockReads[0]++;',
    '        for (int i = 0; i < cnt; i++) {',
    '            comparisons[0]++;',
    '            if (buf[i] == key) return b * BF + i;             // found',
    '        }',
    '    }',
    '    return -1;                                                // not found: every block was read',
    '}'
  ];

  D.define({
    id: 'sequential-search-file',
    title: T('Sıralı dosyada ardışık arama: blok okumaları', 'Sequential search of a file: counting block reads'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('13 anahtar, aranan ortada (blok 2\'de bulunur)', '13 keys, target in the middle (found in block 2)'),
        data: { bf: 4, keys: [51, 8, 73, 20, 44, 12, 67, 29, 90, 3, 58, 36, 81], target: 67 } },
      { id: 'hard', level: 'hard', name: T('14 anahtar, tekrarlı hedef son blokta (en kötü durum)', '14 keys, duplicate target in the last block (worst case)'),
        data: { bf: 4, keys: [15, 42, 7, 63, 28, 91, 50, 19, 77, 33, 5, 62, 95, 62], target: 62 } },
      { id: 'edge-not-found', level: 'edge', name: T('Uç: hedef yok, dosyanın tamamı taranır', 'Edge: target absent, the whole file is scanned'),
        data: { bf: 4, keys: [11, 34, 56, 9, 78, 23, 45, 67, 2, 88, 31, 60], target: 999 } },
      { id: 'edge-first', level: 'edge', name: T('Uç: hedef ilk kayıt, en iyi durum (1 okuma)', 'Edge: target is the first record, best case (1 read)'),
        data: { bf: 4, keys: [70, 14, 39, 82, 6, 55, 27, 48, 93, 11], target: 70 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      var idx = -1;
      for (var i = 0; i < d.keys.length; i++) if (d.keys[i] === d.target) { idx = i; break; }
      var nblocks = Math.ceil(d.keys.length / d.bf);
      var blockReads, comparisons;
      if (idx < 0) { blockReads = nblocks; comparisons = d.keys.length; }
      else { blockReads = Math.floor(idx / d.bf) + 1; comparisons = idx + 1; }
      return { foundIndex: idx, blockReads: blockReads, comparisons: comparisons };
    },
    random: function (level, r) {
      var bf = 4, n = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level];
      var keys = [], seen = {};
      for (var i = 0; i < n; i++) { var v; do { v = D.randInt(r, 1, 99); } while (seen[v]); seen[v] = true; keys.push(v); }
      var target = r() < 0.15 ? 500 + D.randInt(r, 1, 99) : keys[D.randInt(r, 0, n - 1)];
      return { bf: bf, keys: keys, target: target };
    },
    input: {
      hint: T('Örnek: hedef=67  51 8 73 20 44 12 67 29 90 3 58 36 81', 'Example: target=67  51 8 73 20 44 12 67 29 90 3 58 36 81'),
      parse: function (text) {
        var target = null, keys = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^(?:hedef|target)[=:](-?\d+)$/i.exec(tok);
          if (m) { target = parseInt(m[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı ya da hedef=N yazın.', '"' + tok + '" is not understood: write a number or target=N.');
          keys.push(parseInt(tok, 10));
        });
        if (target === null) throw T('hedef=N yazmalısınız.', 'You must write target=N.');
        if (!keys.length) throw T('En az bir anahtar yazın.', 'Write at least one key.');
        if (keys.length > 24) throw T('En çok 24 anahtar.', 'At most 24 keys.');
        return { bf: 4, keys: keys, target: target };
      },
      format: function (d) { return 'target=' + d.target + '  ' + d.keys.join(' '); },
      bad: ['', 'hedef=abc 5', '5 x 7', 'target=5'],
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
      S.label('cmp', { x: XR, y: YD + 32, text: 'comparisons = 0', size: 15, mono: true, anchor: 'start', style: 'dim' });
      S.label('decision', { x: XR, y: YD + 60, text: '', size: 16, bold: true, mono: true, anchor: 'start' });

      var reads = 0, comparisons = 0, found = -1;
      function refresh() { S.set('reads', { text: 'block reads = ' + reads }); S.set('cmp', { text: 'comparisons = ' + comparisons }); }
      function clearBuf(count) { for (var i = 0; i < count; i++) if (S.has('r' + i)) S.remove('r' + i); }
      var lastBufCount = 0;

      S.step(T('`int buf[BF];` `int nblocks = (' + d.keys.length + ' + ' + bf + ' - 1) / ' + bf + ' = ' + nblocks + ';` — dosya ' + nblocks + ' bloğa ayrılmış.',
               '`int buf[BF];` `int nblocks = (' + d.keys.length + ' + ' + bf + ' - 1) / ' + bf + ' = ' + nblocks + ';` — the file is split into ' + nblocks + ' block(s).'),
             { c: [4, 5], java: [4, 5] });

      for (var b2 = 0; b2 < nblocks && found < 0; b2++) {
        S.set('d' + b2, { style: 'active' });
        clearBuf(lastBufCount);
        var chunk2 = d.keys.slice(b2 * bf, b2 * bf + bf);
        lastBufCount = chunk2.length;
        for (var i2 = 0; i2 < chunk2.length; i2++) S.box('r' + i2, { x: X0 + i2 * RW, y: YB, w: RW - 6, h: BH, text: String(chunk2[i2]), style: 'normal', mono: true });
        reads++;
        refresh();
        S.step(T('`b = ' + b2 + '`: `fread(buf, …)` — blok ' + b2 + ' diskten RAM tamponuna okunur (okuma #' + reads + '). ' + chunk2.length + ' kayıt karşılaştırılacak.',
                 '`b = ' + b2 + '`: `fread(buf, …)` — block ' + b2 + ' is read from disk into the RAM buffer (read #' + reads + '). ' + chunk2.length + ' record(s) to compare.'),
               { c: [{ n: 6, note: T('b < ' + nblocks + '? evet', 'b < ' + nblocks + '? yes') }, 7, 8, 9],
                 java: [{ n: 6, note: T('b < ' + nblocks + '? evet', 'b < ' + nblocks + '? yes') }, 7, 8,
                        { n: 9, note: T(chunk2.length + ' kayıt okundu', chunk2.length + ' record(s) read') }, 10] });
        for (var i3 = 0; i3 < chunk2.length; i3++) {
          S.set('r' + i3, { style: 'hl' });
          comparisons++;
          S.at(b2 * bf + i3);
          var match = chunk2[i3] === d.target;
          S.set('decision', { text: chunk2[i3] + (match ? ' == ' : ' != ') + d.target, style: match ? 'new' : 'normal' });
          if (match) {
            found = b2 * bf + i3;
            S.set('r' + i3, { style: 'new' });
            S.set('d' + b2, { style: 'new' });
            refresh();
            S.step(T('`buf[' + i3 + '] == key` (' + chunk2[i3] + ' == ' + d.target + ') → **bulundu**, konum ' + found + '. Arama durur; sonraki bloklar okunmaz.',
                     '`buf[' + i3 + '] == key` (' + chunk2[i3] + ' == ' + d.target + ') → **found**, position ' + found + '. The search stops; later blocks are not read.'),
                   { c: [{ n: 10, note: T('i < cnt? evet', 'i < cnt? yes') }, 11, { n: 12, note: T('eşit mi? evet', 'equal? yes') }],
                     java: [{ n: 11, note: T('i < cnt? evet', 'i < cnt? yes') }, 12, { n: 13, note: T('equal? yes', 'equal? yes') }] });
            break;
          } else {
            S.set('r' + i3, { style: 'dim' });
            refresh();
            S.step(T('`buf[' + i3 + '] != key` (' + chunk2[i3] + ' != ' + d.target + ') → sıradaki kayda geç.', '`buf[' + i3 + '] != key` (' + chunk2[i3] + ' != ' + d.target + ') → move to the next record.'),
                   { c: [{ n: 10, note: T('i < cnt? evet', 'i < cnt? yes') }, 11, { n: 12, note: T('eşit mi? hayır', 'equal? no') }],
                     java: [{ n: 11, note: T('i < cnt? evet', 'i < cnt? yes') }, 12, { n: 13, note: T('equal? no', 'equal? no') }] });
          }
        }
        if (found < 0) S.set('d' + b2, { style: 'dim' });
      }
      S.at(null);
      S.set('decision', { text: found >= 0 ? T('bulundu, konum ' + found, 'found, position ' + found) : T('bulunamadı', 'not found'), style: found >= 0 ? 'new' : 'del' });
      S.result = { foundIndex: found, blockReads: reads, comparisons: comparisons };
      S.step(found >= 0
        ? T('Bitti: ' + d.target + ' konumda ' + found + ' bulundu — ' + reads + ' blok okuması (toplam ' + nblocks + ' bloktan), ' + comparisons + ' karşılaştırma. Ortalama durumda beklenen okuma sayısı ≈ blok_sayısı/2; en kötü durumda tüm bloklar.',
           'Done: ' + d.target + ' found at position ' + found + ' — ' + reads + ' block read(s) (out of ' + nblocks + ' blocks), ' + comparisons + ' comparisons. On average the expected read count is ≈ numBlocks/2; the worst case reads every block.')
        : T('Bitti: ' + d.target + ' bulunamadı — bütün dosya tarandı: ' + reads + ' blok okuması, ' + comparisons + ' karşılaştırma. Bulunamama her zaman en kötü durumdur.',
           'Done: ' + d.target + ' not found — the whole file was scanned: ' + reads + ' block reads, ' + comparisons + ' comparisons. Not-found is always the worst case.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
