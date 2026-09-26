/* Week 2 -- a dynamic array: append n values into a block that starts tiny and DOUBLES (or grows by another
 * factor) whenever it is full. Growing copies every existing element into a fresh, larger block and frees the
 * old one; that copy is drawn as a temporary row below the array, which then becomes the new row. Removing can
 * optionally shrink the block once it is only a quarter full. Counting total copies shows why this is amortized
 * O(1) per append, even though a single growing append costs O(n). No demo program yet for this topic. */
(function (D) {
  'use strict';
  var T = D.T;

  function makeCode(d) {
    var f = d.factor;
    return {
      c: [
        'typedef struct {',
        '    int *data;',
        '    int size;',
        '    int cap;',
        '} DynArray;',
        '',
        'static void da_resize(DynArray *a, int new_cap) {',
        '    int *fresh = malloc(new_cap * sizeof(int));',
        '    for (int i = 0; i < a->size; i++)',
        '        fresh[i] = a->data[i];      /* copy every element to the new block */',
        '    free(a->data);                  /* old block is freed */',
        '    a->data = fresh;',
        '    a->cap = new_cap;',
        '}',
        '',
        'void da_append(DynArray *a, int v) {',
        '    if (a->size == a->cap) {',
        '        int new_cap = (int)(a->cap * ' + f + ');   /* growth factor ' + f + ' */',
        '        if (new_cap <= a->cap) new_cap = a->cap + 1;',
        '        da_resize(a, new_cap);       /* full: grow before writing */',
        '    }',
        '    a->data[a->size++] = v;',
        '}',
        '',
        'void da_remove_last(DynArray *a) {',
        '    if (a->size == 0) return;',
        '    a->size--;',
        '    if (' + (d.shrink ? '1' : '0') + ' && a->size <= a->cap / 4 && a->cap / 2 >= ' + d.cap0 + ')',
        '        da_resize(a, a->cap / 2);    /* quarter full: shrink to save memory */',
        '}'
      ],
      java: [
        'class DynArray {',
        '    int[] data;',
        '    int size;',
        '    int cap;',
        '}',
        '',
        'static void resize(DynArray a, int newCap) {',
        '    int[] fresh = new int[newCap];',
        '    for (int i = 0; i < a.size; i++)',
        '        fresh[i] = a.data[i];        // copy every element to the new block',
        '    a.data = fresh;                  // old block is now garbage -- freed by the GC',
        '    a.cap = newCap;',
        '}',
        '',
        'static void append(DynArray a, int v) {',
        '    if (a.size == a.cap) {',
        '        int newCap = (int) (a.cap * ' + f + ');   // growth factor ' + f,
        '        if (newCap <= a.cap) newCap = a.cap + 1;',
        '        resize(a, newCap);           // full: grow before writing',
        '    }',
        '    a.data[a.size++] = v;',
        '}',
        '',
        'static void removeLast(DynArray a) {',
        '    if (a.size == 0) return;',
        '    a.size--;',
        '    if (' + (d.shrink ? 'true' : 'false') + ' && a.size <= a.cap / 4 && a.cap / 2 >= ' + d.cap0 + ')',
        '        resize(a, a.cap / 2);        // quarter full: shrink to save memory',
        '}'
      ]
    };
  }
  var L_STRUCT = [1, 2, 3, 4, 5];
  var L_FULL_CHECK = [16, 17, 18];
  var L_RESIZE = [7, 8, 9, 10, 11, 12, 13];
  var L_WRITE = [16, 22];
  var L_REMOVE = [24, 25, 26];
  var L_SHRINK_CHECK = [27, 28];

  function A(v) { return { op: 'a', v: v }; }
  var R = { op: 'r' };

  D.define({
    id: 'dynamic-array-growth',
    title: T('Dinamik dizi: büyüme (kapasite ikiye katlanır)', 'Dynamic array: growth (capacity doubles)'),
    code: makeCode,
    presets: [
      { id: 'normal', level: 'normal', name: T('cap0=1, faktör 2: 12 ekleme, kopya sayısı < 2n', 'cap0=1, factor 2: 12 appends, total copies < 2n'),
        data: { cap0: 1, factor: 2, shrink: false, ops: [A(5), A(12), A(8), A(19), A(3), A(27), A(14), A(6), A(31), A(9), A(22), A(17)] } },
      { id: 'hard', level: 'hard', name: T('cap0=2, faktör 2: 14 ekleme, arada 2 çıkarma (küçülme yok)', 'cap0=2, factor 2: 14 appends with 2 removes in between (no shrinking)'),
        data: { cap0: 2, factor: 2, shrink: false, ops: [A(10), A(-4), A(21), A(7), R, A(33), A(-15), A(2), A(40), R, A(18), A(-9), A(25), A(11), A(6), A(29)] } },
      { id: 'factor-1.5', level: 'edge', name: T('Büyüme faktörü 1.5 (2 yerine): daha sık ama daha küçük büyümeler', 'Growth factor 1.5 (instead of 2): more frequent, smaller growths'),
        data: { cap0: 1, factor: 1.5, shrink: false, ops: [A(4), A(9), A(15), A(2), A(23), A(8), A(31), A(6), A(19), A(1), A(27), A(13)] } },
      { id: 'shrink-quarter', level: 'edge', name: T('Küçülme: dörtte bir dolulukta kapasite yarıya iner', 'Shrinking: capacity halves once the array is only a quarter full'),
        data: { cap0: 2, factor: 2, shrink: true, ops: [A(3), A(8), A(15), A(1), A(22), A(9), A(30), A(4), A(17), A(6), A(25), A(11), R, R, R, R, R, R, R, R, R] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of appends (removes do not count toward the input size). */
    size: function (d) { return d.ops.filter(function (o) { return o.op === 'a'; }).length; },
    /** Independent simulation with plain variables -- no shared helper with build() (build() draws rows; this only counts). */
    reference: function (d) {
      var cap = d.cap0, size = 0, arr = [], copies = 0, growths = 0, shrinks = 0;
      d.ops.forEach(function (o) {
        if (o.op === 'a') {
          if (size === cap) {
            var newCap = Math.ceil(cap * d.factor);
            if (newCap <= cap) newCap = cap + 1;
            copies += size;
            cap = newCap;
            growths++;
          }
          arr.push(o.v);
          size++;
        } else {
          if (size > 0) { arr.pop(); size--; }
          if (d.shrink) {
            var q = Math.floor(cap / 4);
            if (size <= q && Math.floor(cap / 2) >= d.cap0) {
              copies += size;
              cap = Math.max(d.cap0, Math.floor(cap / 2));
              shrinks++;
            }
          }
        }
      });
      return { arr: arr.slice(), size: size, cap: cap, growths: growths, shrinks: shrinks, copies: copies };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level];
      var cap0 = level === 'easy' || level === 'normal' ? 1 : 2;
      var shrink = level === 'hard' || level === 'extreme';
      var lo = level === 'extreme' ? -300 : 1, hi = level === 'extreme' ? 300 : 60;
      var ops = [], size = 0, i;
      for (i = 0; i < n; i++) {
        ops.push(A(D.randInt(r, lo, hi)));
        size++;
        if (shrink && size > 2 && r() < 0.15) { ops.push(R); size--; }
      }
      return { cap0: cap0, factor: 2, shrink: shrink, ops: ops };
    },
    input: {
      hint: T('Örnek: cap0=1 factor=2 shrink=0  a5 a12 r a8   (aV = V ekle, r = son elemanı çıkar)',
              'Example: cap0=1 factor=2 shrink=0  a5 a12 r a8   (aV = append V, r = remove the last element)'),
      parse: function (text) {
        var cap0 = 1, factor = 2, shrink = false, ops = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mc = /^cap0[=:](\d+)$/i.exec(tok); if (mc) { cap0 = parseInt(mc[1], 10); return; }
          var mf = /^factor[=:](1\.5|2)$/i.exec(tok); if (mf) { factor = parseFloat(mf[1]); return; }
          var ms = /^shrink[=:](0|1)$/i.exec(tok); if (ms) { shrink = ms[1] === '1'; return; }
          if (/^r$/i.test(tok)) { ops.push({ op: 'r' }); return; }
          var ma = /^a(-?\d+)$/i.exec(tok); if (ma) { ops.push({ op: 'a', v: parseInt(ma[1], 10) }); return; }
          throw T('"' + tok + '" anlaşılmadı: aV (ekle), r (çıkar), cap0=N, factor=1.5|2 ya da shrink=0|1 yazın.',
                  '"' + tok + '" is not understood: write aV (append), r (remove), cap0=N, factor=1.5|2 or shrink=0|1.');
        });
        if (cap0 < 1 || cap0 > 4) throw T('cap0 1 ile 4 arasında olmalı.', 'cap0 must be between 1 and 4.');
        if (!ops.length) throw T('En az bir işlem yazın.', 'Write at least one operation.');
        if (ops.length > 30) throw T('En çok 30 işlem.', 'At most 30 operations.');
        return { cap0: cap0, factor: factor, shrink: shrink, ops: ops };
      },
      format: function (d) {
        return 'cap0=' + d.cap0 + ' factor=' + d.factor + ' shrink=' + (d.shrink ? 1 : 0) + '  ' +
          d.ops.map(function (o) { return o.op === 'a' ? ('a' + o.v) : 'r'; }).join(' ');
      },
      tokens: function (d) { return d.ops.map(function (o) { return o.op === 'a' ? ('a' + o.v) : 'r'; }); },
      bad: ['', 'cap0=0 a5', 'cap0=10 a5', 'factor=3 a5', 'a5 x', 'shrink=2 a5']
    },
    build: function (S, d) {
      var W = 54, H = 44, GAP = 6, X0 = 56, Y0 = 210, ROWGAP = 150, MAXCAP = 16;
      var RIGHT = X0 + MAXCAP * (W + GAP) + 14;
      var gen = 0, prefix = 'g0_', cap = d.cap0, size = 0, arr = [], copies = 0, growths = 0, shrinks = 0;

      function drawRow(atY) {
        for (var i = 0; i < cap; i++) S.box(prefix + i, { x: X0 + i * (W + GAP), y: atY, w: W, h: H, text: '', style: 'empty', above: String(i), size: 15 });
        S.label(prefix + 'lbl', { x: X0 - 14, y: atY + H / 2 + 6, text: 'arr =', anchor: 'end', size: 16, bold: true, mono: true });
      }
      drawRow(Y0);
      S.label('capv', { x: X0, y: Y0 - 64, text: 'size = 0, cap = ' + cap, anchor: 'start', bold: true, mono: true, size: 17 });
      S.label('copyv', { x: X0 + 320, y: Y0 - 64, text: T('kopya: 0', 'copies: 0'), anchor: 'start', style: 'dim', size: 15 });
      S.label('note', { x: RIGHT, y: Y0 + H / 2 + 6, text: '', anchor: 'start', size: 15, bold: true, mono: true, style: 'dim' });
      S.step(T('Boş bir dinamik dizi: `cap = ' + cap + '` ile başlar, dolunca kapasite ' + d.factor + ' ile çarpılarak büyür.',
               'An empty dynamic array: it starts with `cap = ' + cap + '` and, once full, its capacity is multiplied by ' + d.factor + '.'), { c: L_STRUCT, java: L_STRUCT });

      function updateRow(note) {
        for (var q = 0; q < cap; q++) {
          if (q < size) S.set(prefix + q, { text: String(arr[q]), style: 'normal' });
          else S.set(prefix + q, { text: '', style: 'empty' });
        }
        S.set('capv', { text: 'size = ' + size + ', cap = ' + cap });
        S.set('copyv', { text: T('kopya: ' + copies, 'copies: ' + copies) });
        S.set('note', { text: note || '' });
        if (size > 0) { if (S.has('filled')) S.set('filled', { to: prefix + (size - 1) }); else S.brace('filled', { from: prefix + '0', to: prefix + (size - 1), text: T('dolu', 'filled'), side: 'bottom', dist: 40 }); }
        else if (S.has('filled')) S.remove('filled');
      }
      updateRow();

      /** Grow or shrink to newCap: copy `size` elements into a fresh row drawn below, then free the old row and
       *  move the fresh one up to take its place. detailed = show the intermediate "copy" step (first resize only). */
      function resize(newCap, growing, detailed) {
        var newPrefix = 'g' + (++gen) + '_';
        if (detailed) {
          for (var q0 = 0; q0 < cap; q0++) S.set(prefix + q0, { style: growing ? 'del' : 'hl' });
          S.set('note', growing ? T('dolu! büyüyor…', 'full! growing…') : T('¼ dolu, küçülüyor…', '¼ full, shrinking…'));
          S.step(growing
            ? T('`size == cap` (' + size + ' == ' + cap + '): dizi dolu, yazmadan önce büyümesi gerekir.', '`size == cap` (' + size + ' == ' + cap + '): the array is full, it must grow before writing.')
            : T('`size <= cap / 4` (' + size + ' <= ' + cap + '/4): dizi dörtte bir dolu, belleği geri vermek için küçülür.', '`size <= cap / 4` (' + size + ' <= ' + cap + '/4): the array is only a quarter full, so it shrinks to give memory back.'),
            { c: growing ? L_FULL_CHECK : L_SHRINK_CHECK, java: growing ? L_FULL_CHECK : L_SHRINK_CHECK });
        }
        for (var j = 0; j < newCap; j++) S.box(newPrefix + j, { x: X0 + j * (W + GAP), y: Y0 + ROWGAP, w: W, h: H, text: '', style: 'empty', above: String(j), size: 15 });
        S.label(newPrefix + 'lbl', { x: X0 - 14, y: Y0 + ROWGAP + H / 2 + 6, text: T('yeni =', 'new ='), anchor: 'end', size: 16, bold: true, mono: true, style: 'dim' });
        for (var k = 0; k < size; k++) S.set(newPrefix + k, { text: String(arr[k]), style: 'new' });
        copies += size;
        if (growing) growths++; else shrinks++;
        if (detailed) {
          S.set('note', { text: T(size + ' kopya', size + ' cop' + (size === 1 ? 'y' : 'ies')) });
          S.step(T('`fresh[i] = a->data[i]` her `i` için: ' + size + ' eleman yeni, daha ' + (growing ? 'büyük' : 'küçük') + ' bloğa kopyalanır.',
                   '`fresh[i] = a->data[i]` for every `i`: ' + size + ' element' + (size === 1 ? '' : 's') + (size === 1 ? ' is' : ' are') + ' copied to the new, ' + (growing ? 'larger' : 'smaller') + ' block.'),
                 { c: L_RESIZE, java: L_RESIZE });
        }
        for (var i2 = 0; i2 < cap; i2++) S.remove(prefix + i2);
        S.remove(prefix + 'lbl');
        if (S.has('filled')) S.remove('filled');
        for (var j2 = 0; j2 < newCap; j2++) S.move(newPrefix + j2, null, Y0);
        S.set(newPrefix + 'lbl', { y: Y0 + H / 2 + 6, text: 'arr =', style: 'normal' });
        prefix = newPrefix; cap = newCap;
        updateRow(T((growing ? 'büyüdü → cap=' : 'küçüldü → cap=') + cap, (growing ? 'grew to cap=' : 'shrank to cap=') + cap));
        S.step(T('`free(a->data)`: eski blok serbest bırakıldı. `data` artık yeni, `cap`\'i ' + cap + ' olan bloğu gösteriyor.',
                 '`free(a->data)`: the old block is freed. `data` now points at the new block, with `cap` = ' + cap + '.'), { c: growing ? L_RESIZE.slice(-2) : L_RESIZE.slice(-2), java: growing ? L_RESIZE.slice(-2) : L_RESIZE.slice(-2) });
      }

      var growSeen = 0, shrinkSeen = 0;
      d.ops.forEach(function (o, opIdx) {
        S.at(opIdx);
        if (o.op === 'a') {
          if (size === cap) {
            growSeen++;
            var newCap = Math.ceil(cap * d.factor); if (newCap <= cap) newCap = cap + 1;
            resize(newCap, true, growSeen === 1);
          }
          arr.push(o.v); size++;
          updateRow();
          S.set(prefix + (size - 1), { style: 'new' });
          S.step(T('`data[size++] = ' + o.v + '`: yer var, tek adımda yazıldı. `size = ' + size + '`.',
                   '`data[size++] = ' + o.v + '`: there is room, written in one step. `size = ' + size + '`.'), { c: L_WRITE, java: L_WRITE });
        } else {
          if (size === 0) {
            S.step(T('`remove_last`: `size == 0`, çıkaracak eleman yok.', '`remove_last`: `size == 0`, there is nothing to remove.'), { c: L_REMOVE, java: L_REMOVE });
            return;
          }
          var out = arr[size - 1];
          S.set(prefix + (size - 1), { style: 'del' });
          arr.pop(); size--;
          updateRow();
          S.step(T('`remove_last`: son eleman (' + out + ') çıkarıldı, `size = ' + size + '`.', '`remove_last`: the last element (' + out + ') is removed, `size = ' + size + '`.'), { c: L_REMOVE, java: L_REMOVE });
          if (d.shrink) {
            var q = Math.floor(cap / 4);
            if (size <= q && Math.floor(cap / 2) >= d.cap0) {
              shrinkSeen++;
              resize(Math.max(d.cap0, Math.floor(cap / 2)), false, shrinkSeen === 1);
            }
          }
        }
      });
      S.at(null);
      updateRow();
      S.result = { arr: arr.slice(), size: size, cap: cap, growths: growths, shrinks: shrinks, copies: copies };
      var n = d.ops.filter(function (o) { return o.op === 'a'; }).length;
      S.step(T('Bitti: ' + n + ' ekleme, ' + growths + ' büyüme' + (shrinks ? ', ' + shrinks + ' küçülme' : '') + ', toplam ' + copies + ' kopya (' + (copies < 2 * n ? '2·' + n + ' = ' + (2 * n) + '\'den az' : 'küçülme dahil') + '). Bir ekleme bazen O(n) sürer ama ORTALAMASI (amortized) O(1)\'dir.',
               'Done: ' + n + ' appends, ' + growths + ' growth' + (growths === 1 ? '' : 's') + (shrinks ? ', ' + shrinks + ' shrink' + (shrinks === 1 ? '' : 's') : '') + ', ' + copies + ' copies in total (' + (copies < 2 * n ? 'fewer than 2·' + n + ' = ' + (2 * n) : 'shrinking included') + '). A single append can cost O(n), but the AMORTIZED cost is O(1).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
