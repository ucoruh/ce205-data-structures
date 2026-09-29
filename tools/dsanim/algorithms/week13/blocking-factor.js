/* Week 13 — blocking factor: how many fixed-size records fit in one disk block, internal fragmentation (waste
   inside every full block) and the extra waste in a partial last block, examples (normal, hard, edge), random
   data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '#define BLOCK_SIZE 100',
    '#define MAX_BF 20',
    '',
    'typedef struct { int keys[MAX_BF]; int count; } Block;',
    '',
    'int block_capacity(int rec_size) { return BLOCK_SIZE / rec_size; }   /* bf = floor(BLOCK_SIZE / rec_size) */',
    '',
    'void block_put(Block *b, int bf, int key, FILE *fp, int *written) {',
    '    b->keys[b->count++] = key;',
    '    if (b->count == bf) {                    /* block full: flush it to disk */',
    '        fwrite(b->keys, sizeof(int), bf, fp);',
    '        (*written)++;',
    '        b->count = 0;                        /* start a new, empty block */',
    '    }',
    '}',
    '',
    'void block_flush(Block *b, FILE *fp, int *written) {',
    '    if (b->count > 0) {                      /* partial last block is still written, with waste */',
    '        fwrite(b->keys, sizeof(int), b->count, fp);',
    '        (*written)++;',
    '    }',
    '}'
  ];
  var JAVA = [
    'static final int BLOCK_SIZE = 100;',
    '',
    'static int blockCapacity(int recSize) { return BLOCK_SIZE / recSize; }   // bf = floor(BLOCK_SIZE / recSize)',
    '',
    'static void blockPut(List<Integer> buf, int bf, int key, DataOutputStream out, int[] written) throws IOException {',
    '    buf.add(key);',
    '    if (buf.size() == bf) {                       // block full: flush it to disk',
    '        for (int v : buf) out.writeInt(v);',
    '        written[0]++;',
    '        buf.clear();                              // start a new, empty block',
    '    }',
    '}',
    '',
    'static void blockFlush(List<Integer> buf, DataOutputStream out, int[] written) throws IOException {',
    '    if (!buf.isEmpty()) {                          // partial last block is still written, with waste',
    '        for (int v : buf) out.writeInt(v);',
    '        written[0]++;',
    '    }',
    '}'
  ];

  D.define({
    id: 'blocking-factor',
    title: T('Bloklama çarpanı: bloğa sığan kayıt sayısı, iç israf', 'Blocking factor: records per block, internal waste'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('recSize=20, blockSize=100 (bf=5), 13 anahtar', 'recSize=20, blockSize=100 (bf=5), 13 keys'),
        data: { recSize: 20, blockSize: 100, keys: [12, 45, 7, 89, 23, 56, 34, 78, 19, 61, 42, 90, 15] } },
      { id: 'hard', level: 'hard', name: T('recSize=24, blockSize=100 (bf=4), 14 anahtar', 'recSize=24, blockSize=100 (bf=4), 14 keys'),
        data: { recSize: 24, blockSize: 100, keys: [8, 31, 55, 12, 47, 63, 29, 71, 18, 40, 52, 6, 84, 25] } },
      { id: 'edge-too-big', level: 'edge', name: T('Uç: kayıt bloktan büyük (bf=0, hata)', 'Edge: record bigger than block (bf=0, error)'),
        data: { recSize: 60, blockSize: 50, keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
      { id: 'edge-exact', level: 'edge', name: T('Uç: 12 anahtar bf=3\'e tam bölünür, son blok israfı yok', 'Edge: 12 keys divide bf=3 exactly, no last-block waste'),
        data: { recSize: 30, blockSize: 100, keys: [3, 66, 21, 48, 11, 77, 34, 59, 2, 91, 26, 44] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      var bf = Math.floor(d.blockSize / d.recSize);
      if (bf < 1) return { blocksWritten: 0, wastedFrag: 0, wastedLast: 0, error: true };
      var n = d.keys.length, numBlocks = Math.ceil(n / bf), full = Math.floor(n / bf), rem = n - full * bf;
      var wastedFrag = numBlocks * (d.blockSize - bf * d.recSize);
      var wastedLast = rem > 0 ? (bf - rem) * d.recSize : 0;
      return { blocksWritten: numBlocks, wastedFrag: wastedFrag, wastedLast: wastedLast, error: false };
    },
    random: function (level, r) {
      var recSize = level === 'extreme' ? D.randInt(r, 40, 90) : D.randInt(r, 15, 30);
      var blockSize = 100;
      var n = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level];
      var keys = [], seen = {};
      for (var i = 0; i < n; i++) { var v; do { v = D.randInt(r, 1, 99); } while (seen[v]); seen[v] = true; keys.push(v); }
      return { recSize: recSize, blockSize: blockSize, keys: keys };
    },
    input: {
      hint: T('Örnek: rec=20 blk=100  12 45 7 89 23 56 34 78 19 61 42', 'Example: rec=20 blk=100  12 45 7 89 23 56 34 78 19 61 42'),
      parse: function (text) {
        var recSize = 20, blockSize = 100, keys = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m1 = /^rec[=:](\d+)$/i.exec(tok), m2 = /^blk[=:](\d+)$/i.exec(tok);
          if (m1) { recSize = parseInt(m1[1], 10); return; }
          if (m2) { blockSize = parseInt(m2[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, rec=N ya da blk=N yazın.', '"' + tok + '" is not understood: write a number, rec=N or blk=N.');
          keys.push(parseInt(tok, 10));
        });
        if (recSize < 1 || recSize > 200) throw T('rec 1-200 arasında olmalı.', 'rec must be between 1 and 200.');
        if (blockSize < 1 || blockSize > 500) throw T('blk 1-500 arasında olmalı.', 'blk must be between 1 and 500.');
        if (!keys.length) throw T('En az bir anahtar yazın.', 'Write at least one key.');
        if (keys.length > 30) throw T('En çok 30 anahtar.', 'At most 30 keys.');
        return { recSize: recSize, blockSize: blockSize, keys: keys };
      },
      format: function (d) { return 'rec=' + d.recSize + ' blk=' + d.blockSize + '  ' + d.keys.join(' '); },
      bad: ['', 'rec=0 5', 'blk=0 5', '5 x 7', 'rec=abc 4'],
      tokens: function (d) { return d.keys.map(String); }
    },
    build: function (S, d) {
      var X0 = 90, YD = 130, YB = 250, BW = 96, BH = 46, GAP = 10, XR = X0 + 12 * BW;
      var bf = Math.floor(d.blockSize / d.recSize);
      S.label('rowD', { x: X0 - 16, y: YD + BH / 2 + 5, text: T('disk =', 'disk ='), anchor: 'end', size: 15, bold: true });
      S.label('rowB', { x: X0 - 16, y: YB + BH / 2 + 5, text: T('RAM tampon =', 'RAM buffer ='), anchor: 'end', size: 15, bold: true });
      S.label('written', { x: XR, y: YD - 8, text: 'blocks written = 0', size: 16, bold: true, mono: true, anchor: 'start' });
      S.label('frag', { x: XR, y: YD + 20, text: 'internal waste = 0 B', size: 14, mono: true, anchor: 'start', style: 'dim' });
      S.label('last', { x: XR, y: YD + 44, text: 'last-block waste = 0 B', size: 14, mono: true, anchor: 'start', style: 'dim' });

      S.step(T('`recSize = ' + d.recSize + '` B, `blockSize = ' + d.blockSize + '` B → `bf = block_capacity(' + d.recSize + ') = ' + d.blockSize + ' / ' + d.recSize + ' = ' + bf + '` kayıt/blok.',
               '`recSize = ' + d.recSize + '` B, `blockSize = ' + d.blockSize + '` B → `bf = block_capacity(' + d.recSize + ') = ' + d.blockSize + ' / ' + d.recSize + ' = ' + bf + '` records/block.'),
             { c: [6], java: [3] });

      if (bf < 1) {
        S.label('err', { x: X0, y: YD, text: T('HATA: kayıt (' + d.recSize + ' B) bloktan (' + d.blockSize + ' B) büyük — hiçbir kayıt sığmaz!',
                                                  'ERROR: the record (' + d.recSize + ' B) is bigger than the block (' + d.blockSize + ' B) — not even one record fits!'), size: 16, bold: true, style: 'del', anchor: 'start' });
        S.at(null);
        S.result = { blocksWritten: 0, wastedFrag: 0, wastedLast: 0, error: true };
        S.step(T('`bf = 0` — bu bir tasarım hatası, blok boyutu büyütülmeli ya da kayıt küçültülmeli. Hiçbir yazma yapılmaz.',
                 '`bf = 0` — this is a design error: the block size must be increased or the record shrunk. No write happens.'),
               { c: [6], java: [3] });
        return;
      }

      var buffer = [], written = 0, fragTotal = 0, lastWaste = 0, xCursor = X0;
      function blockBox(id, text, style, below) {
        var w = Math.max(BW, text.length * 9 + 20);
        S.box(id, { x: xCursor, y: YD, w: w, h: BH, text: text, style: style, above: 'blk ' + written, below: below });
        xCursor += w + GAP;
      }
      function refreshBuf() { S.set('buf', { text: buffer.length ? buffer.join(' ') : '(empty)' }); }
      function refreshCounters() {
        S.set('written', { text: 'blocks written = ' + written });
        S.set('frag', { text: 'internal waste = ' + fragTotal + ' B' });
        S.set('last', { text: 'last-block waste = ' + lastWaste + ' B' });
      }
      S.box('buf', { x: X0, y: YB, w: 460, h: BH, text: '(empty)', style: 'active', mono: true, size: 15 });

      d.keys.forEach(function (key, k) {
        var detailed = k < bf + 1; // show the whole first block filling in detail, then speed up
        S.at(k);
        buffer.push(key);
        refreshBuf();
        if (detailed) {
          S.step(T('`block_put(buf, ' + bf + ', ' + key + ', …)` — anahtar ' + key + ' RAM tamponuna eklenir: `buf.count = ' + buffer.length + '`.',
                   '`block_put(buf, ' + bf + ', ' + key + ', …)` — key ' + key + ' is added to the RAM buffer: `buf.count = ' + buffer.length + '`.'),
                 { c: [8, 9, { n: 10, note: T(buffer.length + ' == ' + bf + '? ' + (buffer.length === bf ? 'evet' : 'hayır'), buffer.length + ' == ' + bf + '? ' + (buffer.length === bf ? 'yes' : 'no')) }], java: [6, { n: 7, note: T(buffer.length + ' == ' + bf + '? ' + (buffer.length === bf ? 'yes' : 'no'), buffer.length + ' == ' + bf + '? ' + (buffer.length === bf ? 'yes' : 'no')) }] });
        } else {
          S.step(T('anahtar ' + key + ' → tampon (' + buffer.length + '/' + bf + ').', 'key ' + key + ' → buffer (' + buffer.length + '/' + bf + ').'),
                 { c: [8, 9, { n: 10, note: T(buffer.length + ' == ' + bf + '? ' + (buffer.length === bf ? 'evet' : 'hayır'), buffer.length + ' == ' + bf + '? ' + (buffer.length === bf ? 'yes' : 'no')) }],
                   java: [6, { n: 7, note: T(buffer.length + ' == ' + bf + '? ' + (buffer.length === bf ? 'yes' : 'no'), buffer.length + ' == ' + bf + '? ' + (buffer.length === bf ? 'yes' : 'no')) }] });
        }
        if (buffer.length === bf) {
          var frag = d.blockSize - bf * d.recSize;
          fragTotal += frag;
          blockBox('blk' + written, buffer.join(' '), 'new', frag + ' B waste');
          written++;
          refreshCounters();
          if (detailed) {
            S.step(T('`buf.count == bf` (' + bf + ') → **blok dolu**: `fwrite(buf, bf, fp)` ile tek seferde diske yazılır; disk erişimi kayıt başına değil, **blok başına** olur. Blok ' + d.blockSize + ' B ama `bf * recSize = ' + (bf * d.recSize) + '` B kullanılır → ' + frag + ' B **iç israf**.',
                     '`buf.count == bf` (' + bf + ') → **block full**: written to disk in one `fwrite(buf, bf, fp)` call; disk access happens **per block**, not per record. The block is ' + d.blockSize + ' B but only `bf * recSize = ' + (bf * d.recSize) + '` B is used → ' + frag + ' B **internal waste**.'),
                   { c: [{ n: 10, note: T('evet', 'yes') }, 11, 12, 13],
                   java: [{ n: 8, note: T(bf + ' değer yazılır', bf + ' values written') }, 9, 10, 11] });
          } else {
            S.step(T('blok dolu → diske yazılır (yazma #' + written + '), ' + frag + ' B israf.', 'block full → written to disk (write #' + written + '), ' + frag + ' B waste.'),
                   { c: [{ n: 10, note: T('evet', 'yes') }, 11, 12, 13],
                   java: [{ n: 8, note: T(bf + ' değer yazılır', bf + ' values written') }, 9, 10, 11] });
          }
          buffer = [];
          refreshBuf();
        }
      });

      S.at(null);
      if (buffer.length > 0) {
        var lastFrag = d.blockSize - bf * d.recSize;
        lastWaste = (bf - buffer.length) * d.recSize;
        fragTotal += lastFrag;
        blockBox('blk' + written, buffer.join(' '), 'hl', (lastFrag + lastWaste) + ' B waste');
        written++;
        refreshCounters();
        S.step(T('Girdi bitti ama tampon boş değil (' + buffer.length + '/' + bf + '): `block_flush` **kısmi son bloğu** yine de diske yazar — ' + bf + ' - ' + buffer.length + ' = ' + (bf - buffer.length) + ' boş kayıt yeri, yani ' + lastWaste + ' B ekstra israf.',
                 'Input is done but the buffer is not empty (' + buffer.length + '/' + bf + '): `block_flush` still writes the **partial last block** to disk — ' + bf + ' - ' + buffer.length + ' = ' + (bf - buffer.length) + ' empty record slots, i.e. ' + lastWaste + ' extra bytes wasted.'),
               { c: [17, { n: 18, note: T('b->count > 0? evet', 'b->count > 0? yes') }, 19, 20],
                 java: [14, { n: 15, note: T('!buf.isEmpty()? evet', '!buf.isEmpty()? yes') },
                        { n: 16, note: T(buffer.length + ' değer yazılır', buffer.length + ' values written') }, 17] });
        buffer = [];
        refreshBuf();
      } else {
        S.step(T('Girdi bitti, tampon zaten boş (' + bf + ' anahtar tam ' + bf + '\'e bölünüyordu): `block_flush` hiçbir şey yazmaz.',
                 'Input is done and the buffer is already empty (the keys divided evenly by ' + bf + '): `block_flush` writes nothing.'),
               { c: [17, { n: 18, note: T('b->count > 0? hayır', 'b->count > 0? no') }],
                 java: [14, { n: 15, note: T('!buf.isEmpty()? hayır', '!buf.isEmpty()? no') }] });
      }
      S.result = { blocksWritten: written, wastedFrag: fragTotal, wastedLast: lastWaste, error: false };
      S.step(T('Bitti: ' + d.keys.length + ' anahtar → ' + written + ' blok yazıldı. Bloklama çarpanı `bf = ' + bf + '` olmasaydı (kayıt başına 1 disk erişimi), ' + d.keys.length + ' erişim gerekirdi; şimdi yalnız ' + written + '. İç israf toplam ' + fragTotal + ' B, son blok israfı ' + lastWaste + ' B.',
               'Done: ' + d.keys.length + ' keys → ' + written + ' block(s) written. Without a blocking factor (`bf = ' + bf + '`, one disk access per record) this would take ' + d.keys.length + ' accesses; now only ' + written + '. Internal waste totals ' + fragTotal + ' B, last-block waste ' + lastWaste + ' B.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
