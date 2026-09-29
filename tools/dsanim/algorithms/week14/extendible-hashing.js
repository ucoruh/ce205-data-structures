/* Week 14 -- extendible hashing: an in-memory DIRECTORY of 2^global_depth pointers selects a bucket by the
   key's last global_depth bits; a full bucket SPLITS (local_depth++), doubling the directory first if the
   bucket's local_depth had caught up to global_depth. */
(function (D) {
  'use strict';
  var T = D.T;

  function cCode(capacity) {
    return [
      '#define CAPACITY ' + capacity + '                    /* keys per bucket */',
      '',
      'int last_bits(int key, int depth) { return depth == 0 ? 0 : (key & ((1 << depth) - 1)); }',
      '',
      'void insert_key(Hash *h, int key) {',
      '    int idx = last_bits(key, h->global_depth);',
      '    Bucket *b = h->dir[idx];',
      '    if (b->n < CAPACITY) { b->keys[b->n++] = key; return; }     /* room: just write */',
      '    if (b->local_depth == h->global_depth) {',
      '        h->global_depth++;',
      '        double_directory(h);                                    /* every slot duplicated; memory only */',
      '    }',
      '    split_bucket(h, b);                                         /* local_depth++, redistribute by new bit */',
      '    insert_key(h, key);                                         /* retry: may need to split again */',
      '}'
    ];
  }
  function javaCode(capacity) {
    return [
      'static final int CAPACITY = ' + capacity + ';       // keys per bucket',
      '',
      'static int lastBits(int key, int depth) { return depth == 0 ? 0 : (key & ((1 << depth) - 1)); }',
      '',
      'static void insertKey(Hash h, int key) {',
      '    int idx = lastBits(key, h.globalDepth);',
      '    Bucket b = h.dir[idx];',
      '    if (b.n < CAPACITY) { b.keys[b.n++] = key; return; }        // room: just write',
      '    if (b.localDepth == h.globalDepth) {',
      '        h.globalDepth++;',
      '        doubleDirectory(h);                                     // every slot duplicated; memory only',
      '    }',
      '    splitBucket(h, b);                                          // localDepth++, redistribute by new bit',
      '    insertKey(h, key);                                          // retry: may need to split again',
      '}'
    ];
  }
  function bitsStr(v, depth) { if (depth === 0) return '(-)'; var s = ''; for (var i = depth - 1; i >= 0; i--) s += (v >> i) & 1; return s; }

  D.define({
    id: 'extendible-hashing',
    title: T('Genişleyebilir (extendible) hashleme', 'Extendible hashing'),
    code: function (d) { return { c: cCode(d.capacity), java: javaCode(d.capacity) }; },
    presets: [
      { id: 'normal', level: 'normal', name: T('capacity=2, 10 anahtar', 'capacity=2, 10 keys'),
        data: { capacity: 2, keys: [9, 20, 15, 3, 25, 12, 7, 30, 1, 18] } },
      { id: 'hard', level: 'hard', name: T('capacity=2, 12 tek sayı (hepsi bit0=1)', 'capacity=2, 12 odd numbers (all share bit0=1)'),
        data: { capacity: 2, keys: [1, 3, 5, 7, 9, 11, 13, 17, 19, 21, 23, 25] } },
      { id: 'skewed', level: 'edge', name: T('Uç durum: hepsi 8 mod 16 -- zincirleme bölünme', 'Edge case: all keys are 8 mod 16 -- cascading splits'),
        data: { capacity: 2, keys: [8, 24, 40, 56, 72, 88, 104, 120, 136, 152] } },
      { id: 'never-splits', level: 'edge', name: T('Uç durum: capacity=10, hiç bölünme yok', 'Edge case: capacity=10, never splits'),
        data: { capacity: 10, keys: [41, 7, 23, 58, 14, 33, 2, 47, 19, 36] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.keys.length; },
    reference: function (d) {
      var capacity = d.capacity, bucketCounter = 0;
      function newBucket(ld) { bucketCounter++; return { id: bucketCounter, localDepth: ld, keys: [] }; }
      var globalDepth = 0, b0 = newBucket(0), directory = [b0];
      var reads = 0, writes = 1, splits = 0, doublings = 0;
      d.keys.forEach(function (key) {
        while (true) {
          var idx = globalDepth === 0 ? 0 : (key & ((1 << globalDepth) - 1));
          var b = directory[idx];
          reads++;
          if (b.keys.length < capacity) { b.keys.push(key); writes++; break; }
          if (b.localDepth === globalDepth) { globalDepth++; directory = directory.concat(directory.slice()); doublings++; }
          b.localDepth++;
          var nb = newBucket(b.localDepth);
          var splitBit = b.localDepth - 1;
          for (var di = 0; di < directory.length; di++) if (directory[di] === b && ((di >> splitBit) & 1) === 1) directory[di] = nb;
          var old = b.keys; b.keys = [];
          old.forEach(function (k) { if (((k >> splitBit) & 1) === 1) nb.keys.push(k); else b.keys.push(k); });
          writes += 2; splits++;
        }
      });
      var seen = {}, buckets = [];
      directory.forEach(function (bb) { if (!seen[bb.id]) { seen[bb.id] = true; buckets.push({ id: bb.id, localDepth: bb.localDepth, keys: bb.keys.slice().sort(function (a, b2) { return a - b2; }) }); } });
      buckets.sort(function (a, b2) { return a.id - b2.id; });
      return { capacity: capacity, globalDepth: globalDepth, directorySize: directory.length, bucketCount: buckets.length, reads: reads, writes: writes, splits: splits, doublings: doublings, buckets: buckets };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 10, hard: 12, extreme: 12 }[level] || 10;
      var capacity = 2;
      var range = level === 'extreme' ? 64 : 96;
      var used = {}, keys = [];
      while (keys.length < n) { var v = D.randInt(r, 0, range); if (!used[v]) { used[v] = true; keys.push(v); } }
      return { capacity: capacity, keys: keys };
    },
    input: {
      hint: T('Örnek: capacity=2 keys: 9,20,15,3,25,12,7,30,1,18', 'Example: capacity=2 keys: 9,20,15,3,25,12,7,30,1,18'),
      parse: function (text) {
        var capacity = 2, keys = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^capacity[=:](\d+)$/i.exec(tok); if (m) { capacity = parseInt(m[1], 10); return; }
          if (/^keys?:?$/i.test(tok)) return;
          if (!/^\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: negatif olmayan bir tam sayı ya da capacity=N yazın.', '"' + tok + '" is not understood: write a non-negative integer or capacity=N.');
          keys.push(parseInt(tok, 10));
        });
        if (capacity < 1 || capacity > 12) throw T('capacity 1 ile 12 arasında olmalı.', 'capacity must be between 1 and 12.');
        if (keys.length < 10) throw T('En az 10 anahtar yazın.', 'Write at least 10 keys.');
        var seen = {}; keys.forEach(function (k) { if (seen[k]) throw T('Anahtarlar tekrarsız olmalı.', 'Keys must be unique.'); seen[k] = true; });
        return { capacity: capacity, keys: keys };
      },
      format: function (d) { return 'capacity=' + d.capacity + ' keys: ' + d.keys.join(','); },
      bad: ['', 'capacity=0 keys: 1,2,3,4,5,6,7,8,9,10', 'keys: 1,2,3,4,5,6,7,8,9', 'capacity=abc keys: 1,2,3,4,5,6,7,8,9,10',
            'keys: 1,2,3,2,5,6,7,8,9,10', 'keys: 1,2,3,-4,5,6,7,8,9,10'],
      tokens: function (d) { return d.keys.map(String); }
    },
    build: function (S, d) {
      var capacity = d.capacity, keys = d.keys, bucketCounter = 0;
      function newBucket(ld) { bucketCounter++; return { id: bucketCounter, localDepth: ld, keys: [] }; }
      var globalDepth = 0, b0 = newBucket(0), directory = [b0];
      var reads = 0, writes = 1;

      S.label('title', { x: 20, y: 20, text: 'CAPACITY = ' + capacity, size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('io', { x: 20, y: 44, text: T('okuma: 0  yazma: 1', 'reads: 0  writes: 1'), size: 14, bold: true, mono: true, anchor: 'start' });
      S.label('dec', { x: 20, y: 66, text: '', size: 13, mono: true, anchor: 'start', style: 'dim' });
      function setIO() { S.set('io', { text: T('okuma: ' + reads + '  yazma: ' + writes, 'reads: ' + reads + '  writes: ' + writes) }); }

      var Y_DIR = 110, Y_BKT = 220, X0 = 76, DW = 42, DGAP = 6, BW = 96, BGAP = 20;
      var drawn = [];
      function clearDraw() { drawn.forEach(function (id) { if (S.has(id)) S.remove(id); }); drawn = []; }
      function redraw(hlBucketIds) {
        clearDraw();
        S.label('gd', { x: X0, y: Y_DIR - 26, text: T('genel derinlik = ' + globalDepth, 'global depth = ' + globalDepth), size: 13, bold: true, anchor: 'start' });
        drawn.push('gd');
        for (var i = 0; i < directory.length; i++) {
          var did = 'd' + i;
          S.box(did, { x: X0 + i * (DW + DGAP), y: Y_DIR, w: DW, h: 34, text: 'B' + directory[i].id, style: 'normal', size: 12, above: bitsStr(i, globalDepth) });
          drawn.push(did);
        }
        var uniq = [], seen = {};
        directory.forEach(function (b) { if (!seen[b.id]) { seen[b.id] = true; uniq.push(b); } });
        uniq.sort(function (a, b) { return a.id - b.id; });
        uniq.forEach(function (b, bi) {
          var bid = 'b' + b.id, style = hlBucketIds && hlBucketIds.indexOf(b.id) >= 0 ? 'hl' : 'normal';
          S.box(bid, { x: X0 + bi * (BW + BGAP), y: Y_BKT, w: BW, h: 44, text: b.keys.join(',') || T('(boş)', '(empty)'), style: style, size: 13, above: T('B' + b.id + ' (ld=' + b.localDepth + ')', 'B' + b.id + ' (ld=' + b.localDepth + ')') });
          drawn.push(bid);
        });
        S.label('dirlbl', { x: X0 - 16, y: Y_DIR + 17, text: T('dizin =', 'directory ='), anchor: 'end', size: 13, bold: true }); drawn.push('dirlbl');
        S.label('bktlbl', { x: X0 - 16, y: Y_BKT + 22, text: T('kovalar =', 'buckets ='), anchor: 'end', size: 13, bold: true }); drawn.push('bktlbl');
      }
      redraw();
      S.step(T('Boş genişleyebilir bir hash tablosu: `global_depth=0`, tek dizin girdisi tek kovaya (B1) gösteriyor (+1 yazma). `CAPACITY=' + capacity + '`.',
               'An empty extendible hash table: `global_depth=0`, a single directory slot points to one bucket (B1) (+1 write). `CAPACITY=' + capacity + '`.'),
             { c: [1], java: [1] });

      keys.forEach(function (key, ki) {
        S.at(ki);
        S.set('dec', { text: '' });
        while (true) {
          var idx = globalDepth === 0 ? 0 : (key & ((1 << globalDepth) - 1));
          var b = directory[idx];
          reads++; setIO();
          redraw([b.id]);
          S.set('dec', { text: T('idx=' + bitsStr(idx, globalDepth) + '=' + idx + ' -> B' + b.id, 'idx=' + bitsStr(idx, globalDepth) + '=' + idx + ' -> B' + b.id) });
          var full = b.keys.length >= capacity;
          S.step(T('`insert_key(' + key + ')`: son `global_depth=' + globalDepth + '` bit(ler)i `' + bitsStr(idx, globalDepth) + '` -> dizin[' + idx + '] -> B' + b.id + '. Kova OKUNUYOR (+1 okuma): ' + b.keys.length + '/' + capacity + (full ? ' -- DOLU!' : '.'),
                   '`insert_key(' + key + ')`: the last `global_depth=' + globalDepth + '` bit(s) are `' + bitsStr(idx, globalDepth) + '` -> dir[' + idx + '] -> B' + b.id + '. The bucket is READ (+1 read): ' + b.keys.length + '/' + capacity + (full ? ' -- FULL!' : '.')),
                 { c: [6, 7, { n: 8, note: full ? T('yer var mı? hayır', 'room? no') : T('yer var mı? evet', 'room? yes') }],
                   java: [6, 7, { n: 8, note: full ? T('yer var mı? hayır', 'room? no') : T('yer var mı? evet', 'room? yes') }] });

          if (!full) {
            b.keys.push(key); writes++; setIO();
            redraw([b.id]);
            S.step(T('Yer vardı: `' + key + '` B' + b.id + '\'e yazıldı (+1 yazma). Bitti.',
                     'There was room: `' + key + '` was written into B' + b.id + ' (+1 write). Done.'),
                   { c: [{ n: 8, note: T('n<CAPACITY mi? evet', 'n<CAPACITY? yes') }], java: [{ n: 8, note: T('n<CAPACITY mi? evet', 'n<CAPACITY? yes') }] });
            break;
          }

          if (b.localDepth === globalDepth) {
            globalDepth++;
            directory = directory.concat(directory.slice());
            redraw([b.id]);
            S.step(T('B' + b.id + '\'in `local_depth` (' + (b.localDepth) + ') `global_depth`\'e (' + (globalDepth - 1) + ') eşitti: dizin ÖNCE ikiye katlanır (`global_depth=' + globalDepth + '`) -- yalnız bellekte, disk maliyeti yok. Her yeni yarı, eski yarıyla aynı kovaları gösterir.',
                     'B' + b.id + '\'s `local_depth` (' + b.localDepth + ') had caught up to `global_depth` (' + (globalDepth - 1) + '): the directory doubles FIRST (`global_depth=' + globalDepth + '`) -- in memory only, no disk cost. Each new half mirrors the old one, bucket for bucket.'),
                   { c: [{ n: 9, note: T('ld==gd mi? evet', 'ld==gd? yes') }, 10, 11], java: [{ n: 9, note: T('ld==gd mi? evet', 'ld==gd? yes') }, 10, 11] });
          } else {
            S.step(T('B' + b.id + '\'in `local_depth` (' + b.localDepth + ') `global_depth`\'den (' + globalDepth + ') küçük: dizin zaten yeterince büyük, katlamaya gerek yok.',
                     'B' + b.id + '\'s `local_depth` (' + b.localDepth + ') is smaller than `global_depth` (' + globalDepth + '): the directory is already big enough, no doubling needed.'),
                   { c: [{ n: 9, note: T('ld==gd mi? hayır', 'ld==gd? no') }, { n: 10, skip: true }, { n: 11, skip: true }], java: [{ n: 9, note: T('ld==gd mi? hayır', 'ld==gd? no') }, { n: 10, skip: true }, { n: 11, skip: true }] });
          }

          b.localDepth++;
          var nb = newBucket(b.localDepth);
          var splitBit = b.localDepth - 1;
          for (var di = 0; di < directory.length; di++) if (directory[di] === b && ((di >> splitBit) & 1) === 1) directory[di] = nb;
          var old = b.keys; b.keys = [];
          old.forEach(function (k) { if (((k >> splitBit) & 1) === 1) nb.keys.push(k); else b.keys.push(k); });
          writes += 2; setIO();
          redraw([b.id, nb.id]);
          S.set('dec', { text: T('bit' + splitBit + ' ile dağıtıldı', 'redistributed by bit' + splitBit) });
          S.step(T('`split_bucket`: B' + b.id + ' `local_depth=' + b.localDepth + '`\'e çıkar; yeni B' + nb.id + ' aynı derinlikte oluşturulur (+2 yazma). Eski anahtarlar bit' + splitBit + '\'e göre ikiye ayrılır: B' + b.id + '=[' + b.keys.join(',') + '], B' + nb.id + '=[' + nb.keys.join(',') + ']. `' + key + '` için ekleme YENİDEN denenir.',
                   '`split_bucket`: B' + b.id + ' goes to `local_depth=' + b.localDepth + '`; a new B' + nb.id + ' is created at the same depth (+2 writes). The old keys are split by bit' + splitBit + ': B' + b.id + '=[' + b.keys.join(',') + '], B' + nb.id + '=[' + nb.keys.join(',') + ']. Inserting `' + key + '` is RETRIED.'),
                 { c: [12, 13, 14], java: [12, 13, 14] });
        }
      });

      S.at(null);
      redraw();
      S.set('dec', { text: '' });
      var seen2 = {}, buckets = [];
      directory.forEach(function (bb) { if (!seen2[bb.id]) { seen2[bb.id] = true; buckets.push({ id: bb.id, localDepth: bb.localDepth, keys: bb.keys.slice().sort(function (a, b2) { return a - b2; }) }); } });
      buckets.sort(function (a, b2) { return a.id - b2.id; });
      S.result = { capacity: capacity, globalDepth: globalDepth, directorySize: directory.length, bucketCount: buckets.length, reads: reads, writes: writes, splits: bucketCounter - 1, doublings: Math.log2(directory.length), buckets: buckets };
      S.step(T('Bitti: ' + keys.length + ' ekleme, `global_depth=' + globalDepth + '` (dizin boyu ' + directory.length + '), ' + buckets.length + ' kova, ' + reads + ' okuma / ' + writes + ' yazma. Dizin bellekte: her ekleme en çok 2 disk erişimi ister (oku + yaz, bölünmede +1 kova daha).',
               'Done: ' + keys.length + ' inserts, `global_depth=' + globalDepth + '` (directory size ' + directory.length + '), ' + buckets.length + ' buckets, ' + reads + ' reads / ' + writes + ' writes. The directory lives in memory: every insert costs at most 2 disk accesses (read + write, +1 more bucket on a split).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
