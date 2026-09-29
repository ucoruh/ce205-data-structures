/* Week 13 — hashing to buckets: h(key) = key mod m picks a HOME bucket; a bucket holds up to bf keys, and once it
   is full an OVERFLOW block is allocated and chained onto it (bucket chaining) instead of searching elsewhere.
   Examples (normal, hard, edge: every key in one bucket, edge: a single bucket), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '#define BF 3    /* keys per bucket / overflow block */',
    '',
    'typedef struct { int keys[BF]; int count; int next; } Bucket;   /* next = -1: no overflow yet */',
    '',
    'int bucket_put(Bucket b[], int *nblocks, int m, int key, int *writes) {',
    '    int h = key % m, cur = h;                    /* home bucket */',
    '    while (b[cur].count == BF) {                  /* this block is full */',
    '        if (b[cur].next < 0) {                      /* no overflow yet: allocate one */',
    '            b[cur].next = (*nblocks)++;',
    '            b[b[cur].next].count = 0; b[b[cur].next].next = -1;',
    '            (*writes)++;                              /* the new, empty overflow block */',
    '        }',
    '        cur = b[cur].next;                              /* follow the chain */',
    '    }',
    '    b[cur].keys[b[cur].count++] = key;',
    '    (*writes)++;                                        /* the block that now holds the key */',
    '    return h;',
    '}'
  ];
  var JAVA = [
    'static final int BF = 3;   // keys per bucket / overflow block',
    '',
    'static class Bucket { int[] keys = new int[BF]; int count = 0; int next = -1; }   // next = -1: no overflow yet',
    '',
    'static int bucketPut(Bucket[] b, int[] nblocks, int m, int key, int[] writes) {',
    '    int h = key % m, cur = h;                       // home bucket',
    '    while (b[cur].count == BF) {                     // this block is full',
    '        if (b[cur].next < 0) {                         // no overflow yet: allocate one',
    '            b[cur].next = nblocks[0]++;',
    '            b[b[cur].next] = new Bucket();',
    '            writes[0]++;                                 // the new, empty overflow block',
    '        }',
    '        cur = b[cur].next;                                // follow the chain',
    '    }',
    '    b[cur].keys[b[cur].count++] = key;',
    '    writes[0]++;                                          // the block that now holds the key',
    '    return h;',
    '}'
  ];

  D.define({
    id: 'hashing-to-buckets',
    title: T('Kovalara özetleme (hashing): ana kova ve taşma zinciri', 'Hashing to buckets: home bucket and overflow chaining'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('m=5, bf=3, 13 anahtar, az taşma', 'm=5, bf=3, 13 keys, little overflow'),
        data: { m: 5, bf: 3, keys: [12, 7, 23, 18, 4, 29, 15, 31, 9, 26, 3, 37, 21] } },
      { id: 'hard', level: 'hard', name: T('m=4, bf=2, 14 anahtar, birden çok kova zincirlenir', 'm=4, bf=2, 14 keys, several buckets chain'),
        data: { m: 4, bf: 2, keys: [4, 8, 12, 16, 20, 24, 1, 5, 9, 13, 17, 21, 2, 6] } },
      { id: 'edge-all-same', level: 'edge', name: T('Uç: 10 anahtar hepsi aynı kovaya (uzun zincir)', 'Edge: all 10 keys hash to the same bucket (long chain)'),
        data: { m: 6, bf: 2, keys: [6, 12, 18, 24, 30, 36, 42, 48, 54, 60] } },
      { id: 'edge-one-bucket', level: 'edge', name: T('Uç: m=1, tek kova, her şey zincirlenir', 'Edge: m=1, one bucket, everything chains'),
        data: { m: 1, bf: 3, keys: [5, 11, 2, 19, 8, 14, 3, 27, 6, 10] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      var blocks = [], writes = 0, assignments = [];
      for (var i = 0; i < d.m; i++) blocks.push({ keys: [], next: -1 });
      d.keys.forEach(function (key) {
        var h = key % d.m, cur = h;
        while (blocks[cur].keys.length === d.bf) {
          if (blocks[cur].next < 0) { blocks[cur].next = blocks.length; blocks.push({ keys: [], next: -1 }); writes++; }
          cur = blocks[cur].next;
        }
        blocks[cur].keys.push(key);
        writes++;
        assignments.push({ key: key, home: h, block: cur });
      });
      return { writes: writes, blocksUsed: blocks.length, assignments: assignments };
    },
    random: function (level, r) {
      var m = level === 'extreme' ? 2 : (level === 'hard' ? 4 : 5), bf = level === 'easy' ? 3 : 2;
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level], keys = [], seen = {};
      for (var i = 0; i < n; i++) { var v; do { v = D.randInt(r, 1, 60); } while (seen[v]); seen[v] = true; keys.push(v); }
      return { m: m, bf: bf, keys: keys };
    },
    input: {
      hint: T('Örnek: m=5 bf=3  12 7 23 18 4 29 15 31 9 26 3', 'Example: m=5 bf=3  12 7 23 18 4 29 15 31 9 26 3'),
      parse: function (text) {
        var m = 5, bf = 3, keys = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mm = /^m[=:](\d+)$/i.exec(tok), mb = /^bf[=:](\d+)$/i.exec(tok);
          if (mm) { m = parseInt(mm[1], 10); return; }
          if (mb) { bf = parseInt(mb[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı, m=N ya da bf=N yazın.', '"' + tok + '" is not understood: write a number, m=N or bf=N.');
          keys.push(parseInt(tok, 10));
        });
        if (m < 1 || m > 12) throw T('m 1-12 arasında olmalı.', 'm must be between 1 and 12.');
        if (bf < 1 || bf > 8) throw T('bf 1-8 arasında olmalı.', 'bf must be between 1 and 8.');
        if (!keys.length) throw T('En az bir anahtar yazın.', 'Write at least one key.');
        if (keys.length > 24) throw T('En çok 24 anahtar.', 'At most 24 keys.');
        return { m: m, bf: bf, keys: keys };
      },
      format: function (d) { return 'm=' + d.m + ' bf=' + d.bf + '  ' + d.keys.join(' '); },
      bad: ['', 'm=0 bf=3 5', 'bf=0 m=3 5', '5 x 7', 'm=abc bf=3 5'],
      tokens: function (d) { return d.keys.map(String); }
    },
    build: function (S, d) {
      var m = d.m, bf = d.bf, X0 = 90, YD = 110, YO = 240, YB = 360, BW = 84, BH = 44, GAP = 10;
      var XR = X0 + Math.max(m, 8) * (BW + GAP) + 30;
      S.label('rowD', { x: X0 - 16, y: YD + BH / 2 + 5, text: T('kovalar =', 'buckets ='), anchor: 'end', size: 15, bold: true });
      S.label('rowO', { x: X0 - 16, y: YO + BH / 2 + 5, text: T('taşma =', 'overflow ='), anchor: 'end', size: 14, bold: true, style: 'dim' });
      S.label('rowB', { x: X0 - 16, y: YB + BH / 2 + 5, text: T('RAM tampon =', 'RAM buffer ='), anchor: 'end', size: 15, bold: true });
      S.label('writes', { x: XR, y: YD - 12, text: 'writes = 0', size: 16, bold: true, mono: true, anchor: 'start' });
      S.label('blocks', { x: XR, y: YD + 12, text: 'blocks used = ' + m, size: 14, mono: true, anchor: 'start', style: 'dim' });
      S.label('decision', { x: XR, y: YD + 40, text: '', size: 16, bold: true, mono: true, anchor: 'start' });
      S.box('buf', { x: X0, y: YB, w: 300, h: BH, text: '(empty)', style: 'active', mono: true, size: 15 });

      var blocks = [], writes = 0, ovCount = 0, assignments = [];
      for (var i = 0; i < m; i++) {
        blocks.push({ keys: [], next: -1 });
        S.box('blk' + i, { x: X0 + i * (BW + GAP), y: YD, w: BW, h: BH, text: '(empty)', style: 'empty', above: 'b' + i, mono: true, size: 13 });
      }
      function refreshBlock(idx) {
        var id = idx < m ? 'blk' + idx : 'ov' + (idx - m);
        S.set(id, { text: blocks[idx].keys.length ? blocks[idx].keys.join(' ') : '(empty)' });
      }
      function counters() { S.set('writes', { text: 'writes = ' + writes }); S.set('blocks', { text: 'blocks used = ' + blocks.length }); }
      counters();

      d.keys.forEach(function (key, k) {
        var detailed = k < 4;
        S.at(k);
        var h = key % m, cur = h;
        S.set('blk' + h, { style: 'active' });
        S.set('decision', { text: 'h(' + key + ')=' + key + '%' + m + '=' + h, style: 'active' });
        S.step(detailed
          ? T('`bucket_put(…, ' + key + ', …)` — `h = ' + key + ' % ' + m + ' = ' + h + '` → **ana kova** ' + h + '.', '`bucket_put(…, ' + key + ', …)` — `h = ' + key + ' % ' + m + ' = ' + h + '` → **home bucket** ' + h + '.')
          : T(key + ' → ana kova ' + h + '.', key + ' → home bucket ' + h + '.'),
          { c: [6], java: [6] });

        var hops = 0;
        while (blocks[cur].keys.length === bf) {
          hops++;
          var curId = cur < m ? 'blk' + cur : 'ov' + (cur - m);
          S.set(curId, { style: 'dim' });
          if (blocks[cur].next < 0) {
            var newIdx = blocks.length;
            blocks[cur].next = newIdx;
            blocks.push({ keys: [], next: -1 });
            var newId = 'ov' + ovCount;
            S.box(newId, { x: X0 + ovCount * (BW + GAP), y: YO, w: BW, h: BH, text: '(empty)', style: 'empty', above: 'ov' + ovCount, mono: true, size: 13 });
            S.arrow('a' + newId, { from: curId, to: newId, kind: 'center', style: 'dim', bend: 26 });
            ovCount++;
            writes++;
            counters();
            S.step(detailed
              ? T('kova ' + cur + ' dolu (`count == BF`, ' + bf + ') ve taşma yok → **yeni taşma bloğu** ' + newId + ' ayrılır ve zincire eklenir.',
                  'bucket ' + cur + ' is full (`count == BF`, ' + bf + ') and has no overflow → **allocate a new overflow block** ' + newId + ' and chain it on.')
              : T('kova ' + cur + ' dolu → yeni taşma bloğu ' + newId + '.', 'bucket ' + cur + ' full → new overflow block ' + newId + '.'),
              { c: [{ n: 7, note: T('count == BF? evet', 'count == BF? yes') }, { n: 8, note: T('taşma var mı? hayır', 'has overflow? no') }, 9, 10, 11, 13], java: [{ n: 7, note: T('count == BF? yes', 'count == BF? yes') }, { n: 8, note: T('has overflow? no', 'has overflow? no') }, 9, 10, 11, 13] });
          } else if (detailed) {
            S.step(T('kova ' + cur + ' dolu, zincirde zaten bir taşma bloğu var → onu izle.', 'bucket ' + cur + ' is full, it already has an overflow block → follow it.'),
                   { c: [{ n: 7, note: T('count == BF? evet', 'count == BF? yes') }, { n: 8, note: T('taşma var mı? evet', 'has overflow? yes') }, { n: 9, skip: true }, { n: 10, skip: true }, { n: 11, skip: true }, 13], java: [{ n: 7, note: T('count == BF? yes', 'count == BF? yes') }, { n: 8, note: T('has overflow? yes', 'has overflow? yes') }, { n: 9, skip: true }, { n: 10, skip: true }, { n: 11, skip: true }, 13] });
          }
          cur = blocks[cur].next;
        }
        blocks[cur].keys.push(key);
        writes++;
        assignments.push({ key: key, home: h, block: cur });
        refreshBlock(cur);
        var curId2 = cur < m ? 'blk' + cur : 'ov' + (cur - m);
        S.set(curId2, { style: 'new' });
        S.set('buf', { text: blocks[cur].keys.join(' ') });
        counters();
        S.step(detailed
          ? T('`b[' + cur + '].keys[' + (blocks[cur].keys.length - 1) + '] = ' + key + '` — ' + (hops ? (hops + ' taşma sonrası ') : '') + 'anahtar ' + curId2 + ' bloğuna yazılır.',
              '`b[' + cur + '].keys[' + (blocks[cur].keys.length - 1) + '] = ' + key + '` — ' + (hops ? ('after ' + hops + ' overflow hop(s), ') : '') + 'the key is written into block ' + curId2 + '.')
          : T(key + ' → ' + curId2 + '.', key + ' → ' + curId2 + '.'),
          { c: [{ n: 7, note: T('count == BF? hayır', 'count == BF? no') }, 15, 16], java: [{ n: 7, note: T('count == BF? no', 'count == BF? no') }, 15, 16] });
      });

      S.at(null);
      for (var q = 0; q < m; q++) S.set('blk' + q, { style: blocks[q].keys.length ? 'normal' : 'empty' });
      for (var q2 = 0; q2 < ovCount; q2++) S.set('ov' + q2, { style: 'normal' });
      S.result = { writes: writes, blocksUsed: blocks.length, assignments: assignments };
      S.step(T('Bitti: ' + d.keys.length + ' anahtar, ' + m + ' ana kova, ' + ovCount + ' taşma bloğu (toplam ' + blocks.length + ' blok), ' + writes + ' yazma. Yükleme çarpanı = ' + d.keys.length + ' / (' + m + '×' + bf + ') = ' + (d.keys.length / (m * bf)).toFixed(2) + '.',
               'Done: ' + d.keys.length + ' keys, ' + m + ' home bucket(s), ' + ovCount + ' overflow block(s) (' + blocks.length + ' blocks in total), ' + writes + ' writes. Load factor = ' + d.keys.length + ' / (' + m + '×' + bf + ') = ' + (d.keys.length / (m * bf)).toFixed(2) + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
