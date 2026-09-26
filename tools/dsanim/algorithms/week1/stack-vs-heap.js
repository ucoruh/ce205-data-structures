/* Week 1 — the RELATION between stack and heap: every malloc happens inside a function whose own
 * frame holds the local pointer, one scene shows both sides together. `main` keeps a VERTICAL column
 * of `blocks[]` slots; heap block i sits on the SAME row as `blocks[i]`, so every owner arrow is a
 * short horizontal line. alloc_block() is called, its local `p` (shown as the real address value)
 * gets a diagonal arrow to a new heap block; the address is either stored in `blocks[i]` (an owner
 * survives the pop) or thrown away (the block becomes an orphan the moment the frame pops — a leak).
 * free_block() greys a block and main sets its slot to NULL; a second alias left dangling and then
 * used is flagged, never dereferenced.
 * `size` in the code/presets is an ELEMENT COUNT (ints), matching `malloc(size * sizeof(int))` — the
 * byte count shown anywhere is always count * sizeof(int), never the raw preset number by itself.
 * Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'static int *alloc_block(int size) {',
    '    int *p = malloc(size * sizeof(int));   /* p is LOCAL to this call\'s frame */',
    '    return p;                              /* the address is handed back to the caller */',
    '}',
    '',
    'static void free_block(int *p) {',
    '    free(p);                               /* the heap reclaims this block */',
    '}',
    '',
    'int main(void) {',
    '    int *blocks[N] = { 0 };',
    '    int i = 0;',
    '',
    '    blocks[i++] = alloc_block(12);          /* the returned address is STORED — an owner */',
    '',
    '    alloc_block(9);                         /* return value DISCARDED: no owner at all — a LEAK */',
    '',
    '    free_block(blocks[0]);',
    '    blocks[0] = NULL;                       /* good practice: NULL can never be dangling */',
    '',
    '    int *tmp = blocks[2];                   /* tmp ALIASES the same block: a second pointer to it */',
    '    free_block(blocks[2]);',
    '    blocks[2] = NULL;                       /* blocks[2] is safe now ... */',
    '    /* ... but tmp still holds the OLD address: *tmp here is a DANGLING POINTER, undefined behavior (UB) */',
    '',
    '    return 0;',
    '}'
  ];
  var JAVA = [
    'static int[] allocBlock(int size) {',
    '    int[] p = new int[size];                // p is LOCAL to this call\'s frame',
    '    return p;                                // the reference is handed back to the caller',
    '}',
    '',
    '// Java has no free(): dropping the last reference is enough. The garbage collector',
    '// reclaims the block on its own schedule — see java-reference-heap.js',
    '',
    'public static void main(String[] args) {',
    '    int[][] blocks = new int[N][];',
    '    int i = 0;',
    '',
    '    blocks[i++] = allocBlock(12);            // the returned reference is STORED — an owner',
    '',
    '    allocBlock(9);                            // return value DISCARDED: eligible for GC almost at once',
    '',
    '    blocks[0] = null;                         // dropping the reference; no manual free needed',
    '',
    '    int[] tmp = blocks[2];                    // tmp ALIASES the same array: a second reference to it',
    '    blocks[2] = null;                         // blocks[2] no longer reaches it ...',
    '    // ... but tmp still does: this is simply a valid, live array through tmp — never dangling',
    '}'
  ];
  var LINE = {
    push: [1], malloc: [2], store: [12], discard: [14], popAlloc: [3],
    freePush: [6], freeCall: [7], nullSlot: [16], popFree: [7],
    alias: [18], danglingUse: [21]
  };
  var JLINE = {
    push: [1], malloc: [2], store: [10], discard: [12], popAlloc: [3],
    freePush: [5, 6], freeCall: [5, 6], nullSlot: [14], popFree: [5, 6],
    alias: [16], danglingUse: [18]
  };
  var ADDR_BASE = 0x1000, BYTES_PER_INT = 4;
  function bytesOf(count) { return count * BYTES_PER_INT; }
  function roundUp16(n) { return Math.ceil(n / 16) * 16; }
  function hex(n) { return '0x' + n.toString(16).toUpperCase(); }
  function opTok(op) {
    if (op.t === 'alloc') return 'alloc:' + op.count;
    if (op.t === 'leak') return 'leak:' + op.count;
    if (op.t === 'free') return 'free:' + op.slot;
    if (op.t === 'alias') return 'alias:' + op.slot;
    return 'use';
  }

  D.define({
    id: 'stack-vs-heap',
    title: T('Yığın (stack) çerçeveleri öbekteki (heap) bloklara nasıl bağlanır', 'How stack frames connect to heap blocks'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 blok, düzgün sahiplenilmiş ve bir kısmı serbest', '10 blocks, properly owned, some freed'),
        data: { ops: [ {t:'alloc',count:12}, {t:'alloc',count:8}, {t:'free',slot:0}, {t:'alloc',count:16}, {t:'alloc',count:20},
                        {t:'free',slot:2}, {t:'alloc',count:24}, {t:'alloc',count:4}, {t:'alloc',count:32}, {t:'free',slot:5},
                        {t:'alloc',count:9}, {t:'alloc',count:15}, {t:'alloc',count:27}, {t:'free',slot:8}, {t:'free',slot:1} ] } },
      { id: 'hard', level: 'hard', name: T('14 blok, yoğun biçimde iç içe ayır/serbest bırak', '14 blocks, heavily interleaved alloc/free'),
        data: { ops: [ {t:'alloc',count:48}, {t:'alloc',count:16}, {t:'alloc',count:200}, {t:'free',slot:1}, {t:'alloc',count:64},
                        {t:'free',slot:3}, {t:'alloc',count:12}, {t:'free',slot:2}, {t:'alloc',count:96}, {t:'free',slot:0},
                        {t:'alloc',count:8}, {t:'free',slot:4}, {t:'alloc',count:120}, {t:'free',slot:6}, {t:'alloc',count:4},
                        {t:'free',slot:8}, {t:'alloc',count:60}, {t:'alloc',count:250}, {t:'free',slot:9}, {t:'alloc',count:7},
                        {t:'free',slot:10}, {t:'alloc',count:300}, {t:'free',slot:11}, {t:'alloc',count:55}, {t:'free',slot:12} ] } },
      { id: 'leak', level: 'edge', name: T('Bir dönüş değeri hiç saklanmıyor: bellek sızıntısı', 'A return value is never stored: a memory leak'),
        data: { ops: [ {t:'alloc',count:12}, {t:'alloc',count:8}, {t:'free',slot:0}, {t:'alloc',count:16}, {t:'free',slot:1},
                        {t:'alloc',count:20}, {t:'free',slot:2}, {t:'alloc',count:24}, {t:'leak',count:200}, {t:'alloc',count:9},
                        {t:'free',slot:3}, {t:'alloc',count:33}, {t:'free',slot:6}, {t:'alloc',count:55}, {t:'free',slot:7},
                        {t:'alloc',count:18}, {t:'free',slot:8}, {t:'alloc',count:41}, {t:'free',slot:9} ] } },
      { id: 'dangling', level: 'edge', name: T('İkinci bir işaretçi serbest bırakılan bloğa hâlâ bakıyor', 'A second pointer still points at a freed block'),
        data: { ops: [ {t:'alloc',count:12}, {t:'alloc',count:8}, {t:'alloc',count:16}, {t:'alias',slot:2}, {t:'free',slot:0},
                        {t:'alloc',count:20}, {t:'free',slot:2}, {t:'use'}, {t:'alloc',count:24}, {t:'free',slot:3},
                        {t:'alloc',count:9}, {t:'free',slot:4}, {t:'alloc',count:33}, {t:'free',slot:1}, {t:'alloc',count:55},
                        {t:'alloc',count:18}, {t:'free',slot:6}, {t:'alloc',count:41}, {t:'free',slot:8} ] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.ops.filter(function (o) { return o.t === 'alloc' || o.t === 'leak'; }).length; },
    /** Independent plain simulation over a single unified block list (index i == the row a block was
     * created on, whether owned or leaked); free()/alias() only ever touch a NOT-leaked, not-yet-freed
     * index; use() is flagged (not executed) exactly when the alias it reads already names a freed block.
     * Leaked bytes are always count * sizeof(int) (4), never the raw element count. */
    reference: function (d) {
      var blocks = [], tmpSlot = null, flagged = [];
      d.ops.forEach(function (op) {
        if (op.t === 'alloc') blocks.push({ count: op.count, freed: false, leaked: false });
        else if (op.t === 'leak') blocks.push({ count: op.count, freed: false, leaked: true });
        else if (op.t === 'free') { var b = blocks[op.slot]; if (b && !b.leaked && !b.freed) b.freed = true; }
        else if (op.t === 'alias') { var b2 = blocks[op.slot]; if (b2 && !b2.leaked) tmpSlot = op.slot; }
        else if (op.t === 'use') { if (tmpSlot !== null && blocks[tmpSlot] && blocks[tmpSlot].freed) flagged.push(tmpSlot); }
      });
      var live = blocks.filter(function (b) { return !b.freed; }).length;
      var leakedBytes = blocks.filter(function (b) { return b.leaked; }).reduce(function (s, b) { return s + b.count * 4; }, 0);
      var hasCall = d.ops.some(function (o) { return o.t === 'alloc' || o.t === 'leak' || o.t === 'free'; });
      return { maxFrames: hasCall ? 2 : 1, liveBlocksAtEnd: live, leakedBytes: leakedBytes, flagged: flagged };
    },
    random: function (level, r) {
      var nBlocks = { easy: 10, normal: 11, hard: 14, extreme: 16 }[level];
      var countHi = level === 'extreme' ? 512 : (level === 'hard' ? 128 : 64);
      var leakChance = level === 'easy' ? 0 : (level === 'hard' || level === 'extreme' ? 0.15 : 0.08);
      var ops = [], count = 0, isLeak = {}, freedSet = {}, tmpSlot = null, made = 0;
      while (made < nBlocks) {
        if (made > 0 && r() < leakChance) { ops.push({ t: 'leak', count: D.randInt(r, 4, countHi) }); isLeak[count] = true; count++; made++; continue; }
        ops.push({ t: 'alloc', count: D.randInt(r, 4, countHi) });
        var idxNew = count; count++; made++;
        if (idxNew > 0 && r() < 0.5) {
          var idx = D.randInt(r, 0, idxNew);
          if (!isLeak[idx] && !freedSet[idx]) {
            if (r() < 0.55) {
              ops.push({ t: 'free', slot: idx }); freedSet[idx] = true;
              if (tmpSlot === idx && (level === 'hard' || level === 'extreme') && r() < 0.6) ops.push({ t: 'use' });
            } else if ((level === 'hard' || level === 'extreme') && tmpSlot === null && r() < 0.3) {
              ops.push({ t: 'alias', slot: idx }); tmpSlot = idx;
            }
          }
        }
      }
      return { ops: ops };
    },
    input: {
      hint: T('Örnek: alloc:12 alloc:8 free:0 leak:9 alloc:16 alias:2 free:2 use  (sayılar int SAYISI, bayt değil)',
              'Example: alloc:12 alloc:8 free:0 leak:9 alloc:16 alias:2 free:2 use  (numbers are a COUNT of ints, not bytes)'),
      parse: function (text) {
        var ops = [], count = 0, isLeak = {}, m;
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (/^ops?:$/i.test(tok)) return;
          if (/^use$/i.test(tok)) { ops.push({ t: 'use' }); return; }
          if ((m = /^alloc:(\d+)$/i.exec(tok))) { ops.push({ t: 'alloc', count: parseInt(m[1], 10) }); count++; return; }
          if ((m = /^leak:(\d+)$/i.exec(tok))) { ops.push({ t: 'leak', count: parseInt(m[1], 10) }); isLeak[count] = true; count++; return; }
          if ((m = /^free:(\d+)$/i.exec(tok))) {
            var fi = parseInt(m[1], 10);
            if (fi >= count) throw T('Blok ' + fi + ' henüz ayrılmadı.', 'Block ' + fi + ' has not been allocated yet.');
            if (isLeak[fi]) throw T('Blok ' + fi + ' bir sızıntı (leak): sahibi yok, serbest bırakılamaz.', 'Block ' + fi + ' is a leak: it has no owner, so it cannot be freed.');
            ops.push({ t: 'free', slot: fi }); return;
          }
          if ((m = /^alias:(\d+)$/i.exec(tok))) {
            var ai = parseInt(m[1], 10);
            if (ai >= count) throw T('Blok ' + ai + ' henüz ayrılmadı.', 'Block ' + ai + ' has not been allocated yet.');
            if (isLeak[ai]) throw T('Blok ' + ai + ' bir sızıntı (leak): sahibi yok, takma ad alamaz.', 'Block ' + ai + ' is a leak: it has no owner, so it cannot be aliased.');
            ops.push({ t: 'alias', slot: ai }); return;
          }
          throw T('"' + tok + '" anlaşılmadı: alloc:N, leak:N, free:i, alias:i ya da use yazın.', '"' + tok + '" is not understood: write alloc:N, leak:N, free:i, alias:i, or use.');
        });
        if (!ops.some(function (o) { return o.t === 'alloc' || o.t === 'leak'; })) throw T('En az bir "alloc:N" yazın.', 'Write at least one "alloc:N".');
        if (ops.length > 40) throw T('En çok 40 işlem.', 'At most 40 operations.');
        return { ops: ops };
      },
      format: function (d) { return d.ops.map(opTok).join(' '); },
      bad: ['', 'alloc:12 free:5', 'alloc:abc', 'alias:0 use', 'banana'],
      tokens: function (d) { return d.ops.map(opTok); }
    },
    build: function (S, d) {
      var N = d.ops.filter(function (o) { return o.t === 'alloc' || o.t === 'leak'; }).length;
      var hasTmp = d.ops.some(function (o) { return o.t === 'alias'; });

      // Deterministic addresses: block i+1 starts roundUp16(bytes of block i) + 16 bytes after block i,
      // so a bigger block is never overlapped by the next one's "fixed stride" address.
      var counts = d.ops.filter(function (o) { return o.t === 'alloc' || o.t === 'leak'; }).map(function (o) { return o.count; });
      var addrs = [];
      (function () {
        var cur = ADDR_BASE;
        for (var bi = 0; bi < counts.length; bi++) { addrs.push(cur); cur += roundUp16(bytesOf(counts[bi])) + 16; }
      })();

      var ROWH = 60, MAIN_BOX_W = 104, MAIN_BOX_H = 36, HEAP_BOX_W = 175, HEAP_BOX_H = 38;
      var STACK_X = 20, STACK_Y = 20, CALLEE_W = 150, CALLEE_H = 44, GAP_REGIONS = 44;
      var CALLEE_Y = STACK_Y + 40;
      var MAIN_TOP = CALLEE_Y + CALLEE_H + 26;
      var MAIN_X = STACK_X + 16;
      var STACK_W = 190;
      var HEAP_X = STACK_X + STACK_W + GAP_REGIONS + 12;
      var lead = hasTmp ? 1 : 0;

      function rowY(i) { return MAIN_TOP + (lead + i) * ROWH; }
      var tmpY = MAIN_TOP;

      var STACK_H = (MAIN_TOP - STACK_Y) + (lead + N) * ROWH + 26;
      S.region('stackregion', { x: STACK_X, y: STACK_Y, w: STACK_W, h: STACK_H, title: T('çağrı yığını (call stack)', 'call stack') });
      S.region('mainregion', { x: STACK_X + 8, y: MAIN_TOP - 24, w: MAIN_BOX_W + 24, h: (lead + N) * ROWH + 16, title: 'main()' });
      S.region('heapregion', { x: HEAP_X - 12, y: rowY(0) - 24, w: HEAP_BOX_W + 165, h: N * ROWH + 16, title: T('öbek (heap)', 'heap') });

      S.label('rowlbl', { x: MAIN_X, y: rowY(0) - 12, text: 'blocks[] =', anchor: 'start', size: 13, bold: true, mono: true });
      var blockType = d.ops.filter(function (o) { return o.t === 'alloc' || o.t === 'leak'; }).map(function (o) { return o.t; });
      for (var i = 0; i < N; i++) {
        var hy = rowY(i);
        S.box('hb' + i, { x: HEAP_X, y: hy, w: HEAP_BOX_W, h: HEAP_BOX_H, text: '', style: 'empty', above: hex(addrs[i]), size: 15 });
        if (blockType[i] === 'alloc') {
          S.box('slot' + i, { x: MAIN_X, y: hy, w: MAIN_BOX_W, h: MAIN_BOX_H, text: 'blocks[' + i + ']', style: 'empty', size: 15 });
        } else {
          S.label('noowner' + i, { x: MAIN_X + MAIN_BOX_W / 2, y: hy + MAIN_BOX_H / 2 + 5, text: T('(sahipsiz)', '(no owner)'), style: 'dim', size: 13, anchor: 'middle' });
        }
      }

      S.step(T('İki fonksiyonumuz var: `alloc_block(size)` — öbekten yer ister, adresi döndürür — ve `free_block(p)` — o yeri geri verir. `main`, adresleri `blocks[]` sütununda, tam heap bloğunun hizasında saklar.',
               'We have two functions: `alloc_block(size)` — asks the heap for room and returns the address — and `free_block(p)` — gives that room back. `main` keeps the addresses in a `blocks[]` column, lined up with the heap block each one owns.'),
             { c: [1, 6, 10], java: [1, 5, 8] });

      var blocks = []; // {count, freed, leaked}
      var tmpSlot = null;
      var flagged = [];
      var allocDetail = 0, freeDetail = 0;

      function clean() {
        blocks.forEach(function (b, i2) {
          if (b.leaked) return;
          S.set('slot' + i2, { style: b.freed ? 'empty' : 'normal' });
        });
        for (var k = 0; k < blocks.length; k++) {
          var b2 = blocks[k];
          S.set('hb' + k, { style: b2.leaked ? 'normal' : (b2.freed ? 'dim' : 'normal') });
        }
        if (S.has('tmpbox')) S.set('tmpbox', { style: tmpSlot !== null && blocks[tmpSlot] && blocks[tmpSlot].freed ? 'del' : 'normal' });
      }
      function slotArrow(i2) {
        var aid = 'arrslot' + i2;
        if (S.has(aid)) S.remove(aid);
        if (!blocks[i2].freed) S.arrow(aid, { from: 'slot' + i2, to: 'hb' + i2, kind: 'center' });
      }
      function tmpArrow() {
        var aid = 'arrtmp';
        if (S.has(aid)) S.remove(aid);
        if (tmpSlot !== null) S.arrow(aid, { from: 'tmpbox', to: 'hb' + tmpSlot, kind: 'center' });
      }
      // A state note (freed / leaked) goes BESIDE the heap box, not below it — "below" would sit right
      // where the NEXT row's address label ("above" its own box) already lives, only ROWH apart.
      function stateNote(i2, style, text) {
        S.set('hb' + i2, { style: style });
        S.label('state' + i2, { x: HEAP_X + HEAP_BOX_W + 12, y: rowY(i2) + HEAP_BOX_H / 2 + 5, text: text, style: style, size: 12, anchor: 'start' });
      }

      d.ops.forEach(function (op, k) {
        clean();
        S.at(k);
        if (op.t === 'alloc' || op.t === 'leak') {
          var idx = blocks.length;
          var detailed = allocDetail < 2;
          if (detailed) allocDetail++;
          blocks.push({ count: op.count, freed: false, leaked: op.t === 'leak' });
          var bytes = bytesOf(op.count), addrTxt = hex(addrs[idx]);

          if (detailed) {
            S.box('framevar', { x: STACK_X + 20, y: CALLEE_Y, w: CALLEE_W, h: CALLEE_H, text: 'p = ?', style: 'hl', above: 'alloc_block(' + op.count + ')', size: 15 });
            S.step(T('`' + (op.t === 'alloc' ? ('blocks[' + idx + '] = ') : '') + 'alloc_block(' + op.count + ')`ı çağırıyoruz — yeni bir çerçeve itilir. `p`, bu çerçeveye özel yerel bir değişken, henüz ilkle(nme)di.',
                     '`' + (op.t === 'alloc' ? ('blocks[' + idx + '] = ') : '') + 'alloc_block(' + op.count + ')` is called — a new frame is pushed. `p` is a local variable belonging only to this frame, not yet initialized.'),
                   { c: LINE.push, java: JLINE.push });
            S.set('hb' + idx, { text: op.count + ' ints · ' + bytes + ' B', style: 'new' });
            S.set('framevar', { text: 'p = ' + addrTxt });
            S.arrow('arrframe', { from: 'framevar', to: 'hb' + idx, kind: 'center' });
            S.step(T('`malloc(' + op.count + ' * sizeof(int))` — ' + op.count + ' int\'lik yer (' + op.count + ' × sizeof(int) = ' + bytes + ' bayt), adresi `' + addrTxt + '`. `p`, bu çerçeveye özel, o adresi tutuyor.',
                     '`malloc(' + op.count + ' * sizeof(int))` — room for ' + op.count + ' ints (' + op.count + ' × sizeof(int) = ' + bytes + ' bytes), at `' + addrTxt + '`. `p`, local to this frame, holds that address.'),
                   { c: LINE.malloc, java: JLINE.malloc });
            if (op.t === 'alloc') {
              S.set('slot' + idx, { text: 'blocks[' + idx + ']', style: 'new' });
              slotArrow(idx);
              S.step(T('`return p;` ile adres çağrıya döner, `main` bunu `blocks[' + idx + ']`’e YAZAR — artık bu bloğun bir SAHİBİ var, çerçevenin dışında.',
                       '`return p;` hands the address back, and `main` STORES it in `blocks[' + idx + ']` — the block now has an OWNER outside this frame.'),
                     { c: LINE.store, java: JLINE.store });
            } else {
              S.step(T('`return p;` ile adres çağrıya döner — ama `main` bu sefer sonucu HİÇBİR yere yazmıyor. Kimse bu bloğu işaret etmeyecek.',
                       '`return p;` hands the address back — but this time `main` does not store the result anywhere at all. No one will point to this block.'),
                     { c: LINE.discard, java: JLINE.discard });
            }
            S.remove('framevar', 'arrframe');
            S.step(T('`alloc_block` döner: çerçevesi — ve içindeki yerel `p` — yığından çekilir (pop).' + (op.t === 'leak' ? ' Blok artık bir YETİM: hiçbir işaretçi ona ulaşmıyor — bir **bellek sızıntısı (leak)**.' : ' Bloğun tek sahibi şimdi `blocks[' + idx + ']`, güvenle `main`’in içinde.'),
                     '`alloc_block` returns: its frame — and the local `p` inside it — is popped off the stack.' + (op.t === 'leak' ? ' The block is now an ORPHAN: no pointer reaches it — a **memory leak**.' : ' The block\'s only owner is now `blocks[' + idx + ']`, safely inside `main`.')),
                   { c: LINE.popAlloc, java: JLINE.popAlloc });
          } else {
            S.set('hb' + idx, { text: op.count + ' ints · ' + bytes + ' B', style: 'new' });
            if (op.t === 'alloc') { S.set('slot' + idx, { text: 'blocks[' + idx + ']', style: 'new' }); slotArrow(idx); }
            S.step(T('`alloc_block(' + op.count + ')`' + (op.t === 'alloc' ? (' → `blocks[' + idx + ']` (' + addrTxt + ') — aynı desen: çerçeve itilir, malloc\'lanır, döner, saklanır, çerçeve çekilir.') : ' — dönüş değeri yine saklanmıyor: bir YETİM daha, **bellek sızıntısı**.'),
                     '`alloc_block(' + op.count + ')`' + (op.t === 'alloc' ? (' → `blocks[' + idx + ']` (' + addrTxt + ') — same pattern: frame pushed, malloc\'d, returned, stored, frame popped.') : ' — the return value is not stored again: another ORPHAN, another **memory leak**.')),
                   { c: op.t === 'alloc' ? LINE.store : LINE.discard, java: op.t === 'alloc' ? JLINE.store : JLINE.discard });
          }
        } else if (op.t === 'free') {
          var i2 = op.slot;
          if (!blocks[i2] || blocks[i2].leaked || blocks[i2].freed) return;
          var detailed2 = freeDetail < 2;
          if (detailed2) freeDetail++;
          var addrTxt2 = hex(addrs[i2]), bytes2 = bytesOf(blocks[i2].count);
          if (detailed2) {
            S.box('framevar', { x: STACK_X + 20, y: CALLEE_Y, w: CALLEE_W, h: CALLEE_H, text: 'p = ' + addrTxt2, style: 'hl', above: 'free_block(blocks[' + i2 + '])', size: 15 });
            S.arrow('arrframe', { from: 'framevar', to: 'hb' + i2, kind: 'center' });
            S.step(T('`free_block(blocks[' + i2 + '])` çağrılıyor: yeni bir çerçeve itilir, yerel `p`, `blocks[' + i2 + ']` ile AYNI adresin (`' + addrTxt2 + '`) bir kopyasını alır (değer ile geçiş).',
                     '`free_block(blocks[' + i2 + '])` is called: a new frame is pushed, and local `p` gets a COPY of the same address as `blocks[' + i2 + ']` (`' + addrTxt2 + '`, pass by value).'),
                   { c: LINE.freePush, java: JLINE.freePush });
            blocks[i2].freed = true;
            stateNote(i2, 'dim', T('serbest', 'freed'));
            S.step(T('`free(p);` — öbek bu ' + bytes2 + ' baytı (' + blocks[i2].count + ' int) geri alır. Blok artık GEÇERSİZ — ama bellekteki hiçbir işaretçi henüz değişmedi.',
                     '`free(p);` — the heap reclaims these ' + bytes2 + ' bytes (' + blocks[i2].count + ' ints). The block is now INVALID — but no pointer in memory has changed yet.'),
                   { c: LINE.freeCall, java: JLINE.freeCall });
            S.set('slot' + i2, { text: 'blocks[' + i2 + ']', style: 'empty' });
            if (S.has('arrslot' + i2)) S.remove('arrslot' + i2);
            S.step(T('`main`’e dönünce: `blocks[' + i2 + '] = NULL;` — iyi alışkanlık, çünkü NULL asla sarkan olamaz.',
                     'Back in `main`: `blocks[' + i2 + '] = NULL;` — good practice, since NULL can never be dangling.'),
                   { c: LINE.nullSlot, java: JLINE.nullSlot });
            S.remove('framevar', 'arrframe');
            S.step(T('`free_block` döner: çerçevesi — ve içindeki yerel `p` — yığından çekilir. Blok öbekte gri, sahipsiz duruyor.',
                     '`free_block` returns: its frame — and the local `p` inside it — is popped off the stack. The block sits grey and ownerless on the heap.'),
                   { c: LINE.popFree, java: JLINE.popFree });
          } else {
            blocks[i2].freed = true;
            stateNote(i2, 'dim', T('serbest', 'freed'));
            S.set('slot' + i2, { text: 'blocks[' + i2 + ']', style: 'empty' });
            if (S.has('arrslot' + i2)) S.remove('arrslot' + i2);
            S.step(T('`free_block(blocks[' + i2 + ']); blocks[' + i2 + '] = NULL;` — aynı desen: çerçeve itilir, `free` edilir, dilim NULL olur, çerçeve çekilir.',
                     '`free_block(blocks[' + i2 + ']); blocks[' + i2 + '] = NULL;` — same pattern: frame pushed, freed, slot set to NULL, frame popped.'),
                   { c: LINE.nullSlot, java: JLINE.nullSlot });
          }
        } else if (op.t === 'alias') {
          if (!blocks[op.slot] || blocks[op.slot].leaked) return;
          tmpSlot = op.slot;
          if (!S.has('tmpbox')) S.box('tmpbox', { x: MAIN_X, y: tmpY, w: MAIN_BOX_W, h: MAIN_BOX_H, text: 'tmp', style: 'new', size: 15 });
          S.set('tmpbox', { style: 'new' });
          tmpArrow();
          S.step(T('`int *tmp = blocks[' + op.slot + '];` — `tmp`, `blocks[' + op.slot + ']` ile AYNI adresi (`' + hex(addrs[op.slot]) + '`) alır — artık aynı bloğa bakan İKİNCİ bir işaretçi var.',
                   '`int *tmp = blocks[' + op.slot + '];` — `tmp` takes the SAME address as `blocks[' + op.slot + ']` (`' + hex(addrs[op.slot]) + '`) — now a SECOND pointer looks at the same block.'),
                 { c: LINE.alias, java: JLINE.alias });
        } else {
          var isDangling = tmpSlot !== null && blocks[tmpSlot] && blocks[tmpSlot].freed;
          if (isDangling) {
            flagged.push(tmpSlot);
            S.set('tmpbox', { style: 'del' });
            S.step(T('`*tmp` — `tmp` hâlâ, `free_block` ile serbest bırakılmış eski adresi (`' + hex(addrs[tmpSlot]) + '`) tutuyor. Bu bir **sarkan işaretçi (dangling pointer)**: **çalıştırılmaz**, tanımsız davranış (UB) olarak işaretlenir.',
                     '`*tmp` — `tmp` still holds the old address (`' + hex(addrs[tmpSlot]) + '`) that `free_block` already freed. This is a **dangling pointer**: **not executed**, flagged as undefined behavior (UB).'),
                   { c: LINE.danglingUse, java: JLINE.danglingUse });
          } else {
            S.step(T('`*tmp` — `tmp`’nin bloğu hâlâ geçerli, bu okuma güvenli.',
                     '`*tmp` — `tmp`\'s block is still valid, this read is safe.'),
                   { c: LINE.alias, java: JLINE.alias });
          }
        }
      });

      clean();
      S.at(null);
      blocks.forEach(function (b, i3) { if (b.leaked) stateNote(i3, 'del', T('sızıntı — sahipsiz', 'leaked — no owner')); });
      var liveBlocks = blocks.filter(function (b) { return !b.freed; }).length;
      var leakedBytes = blocks.filter(function (b) { return b.leaked; }).reduce(function (s, b) { return s + b.count * 4; }, 0);
      var leakCount = blocks.filter(function (b) { return b.leaked; }).length;
      var hasCall = d.ops.some(function (o) { return o.t === 'alloc' || o.t === 'leak' || o.t === 'free'; });
      S.result = { maxFrames: hasCall ? 2 : 1, liveBlocksAtEnd: liveBlocks, leakedBytes: leakedBytes, flagged: flagged };
      S.step(T('Bitti: en fazla 2 çerçeve aynı anda (main + bir çağrı), ' + blocks.length + ' blok ayrıldı. ' +
               (leakCount ? leakCount + ' blok hiç sahiplenilmedi: **' + leakedBytes + ' bayt sızıntı (leak)**.' : 'Sızıntı yok: her blok bir `blocks[]` sahibine sahipti.') +
               (flagged.length ? ' ' + flagged.length + ' sarkan işaretçi denemesi güvenle işaretlendi.' : ''),
               'Done: at most 2 frames at once (main plus one call), ' + blocks.length + ' blocks allocated. ' +
               (leakCount ? leakCount + ' block' + (leakCount > 1 ? 's were' : ' was') + ' never owned: **' + leakedBytes + ' bytes leaked**.' : 'No leak: every block had a `blocks[]` owner.') +
               (flagged.length ? ' ' + flagged.length + ' dangling-pointer attempt' + (flagged.length > 1 ? 's were' : ' was') + ' safely flagged.' : '')));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
