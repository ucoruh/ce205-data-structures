/* Week 2 -- a fixed-capacity array with a running `size`: insert at an index k (shifting the tail right, from
 * the end backwards) and delete at an index k (shifting the tail left). Appending is just insert at k = size;
 * inserting at k = 0 is the expensive case (the whole array shifts). Overflow (full array) and underflow (empty
 * array) are rejected without crashing. Every shift step is counted. No demo program yet for this topic. */
(function (D) {
  'use strict';
  var T = D.T;

  function makeCode(cap) {
    return [
      '#define CAP ' + cap,
      'int arr[CAP];',
      'int size = 0;',
      '',
      '/* insert v at index k; shifts arr[k..size-1] right, from the end backwards */',
      'bool insert_at(int k, int v) {',
      '    if (size == CAP)',
      '        return false;            /* full: overflow, nothing inserted */',
      '    for (int i = size; i > k; i--)',
      '        arr[i] = arr[i - 1];    /* shift right */',
      '    arr[k] = v;',
      '    size++;',
      '    return true;',
      '}',
      '',
      '/* delete the value at index k; shifts arr[k+1..size-1] left */',
      'bool delete_at(int k) {',
      '    if (size == 0)',
      '        return false;            /* empty: underflow, nothing to delete */',
      '    for (int i = k; i < size - 1; i++)',
      '        arr[i] = arr[i + 1];    /* shift left */',
      '    size--;',
      '    return true;',
      '}'
    ];
  }
  function makeJava(cap) {
    return [
      'static final int CAP = ' + cap + ';',
      'static int[] arr = new int[CAP];',
      'static int size = 0;',
      '',
      '// insert v at index k; shifts arr[k..size-1] right, from the end backwards',
      'static boolean insertAt(int k, int v) {',
      '    if (size == CAP)',
      '        return false;            // full: overflow, nothing inserted',
      '    for (int i = size; i > k; i--)',
      '        arr[i] = arr[i - 1];    // shift right',
      '    arr[k] = v;',
      '    size++;',
      '    return true;',
      '}',
      '',
      '// delete the value at index k; shifts arr[k+1..size-1] left',
      'static boolean deleteAt(int k) {',
      '    if (size == 0)',
      '        return false;            // empty: underflow, nothing to delete',
      '    for (int i = k; i < size - 1; i++)',
      '        arr[i] = arr[i + 1];    // shift left',
      '    size--;',
      '    return true;',
      '}'
    ];
  }
  var L_DECL = [1, 2, 3];
  var L_FULL = [7, 8];
  var L_SHIFT_R = [9, 10];
  var L_INSERT = [9, 10, 11, 12, 13];
  var L_EMPTY = [18, 19];
  var L_SHIFT_L = [20, 21];
  var L_DELETE = [20, 21, 22, 23];

  function ins(k, v) { return { op: 'i', k: k, v: v }; }
  function del(k) { return { op: 'd', k: k }; }

  D.define({
    id: 'array-insert-delete',
    title: T('Dizide ekleme ve silme: kaydırma', 'Array insert and delete: shifting'),
    code: function (d) { return { c: makeCode(d.cap), java: makeJava(d.cap) }; },
    presets: [
      { id: 'normal', level: 'normal', name: T('16 kapasite: 10 sona ekle, baştan ekle, ortadan/baştan sil', '16-capacity: 10 appends, an insert at the front, a middle and a front delete'),
        data: { cap: 16, ops: [ins(0, 10), ins(1, 20), ins(2, 30), ins(3, 40), ins(4, 50), ins(5, 60), ins(6, 70), ins(7, 80), ins(8, 90), ins(9, 100), ins(0, 5), del(5), del(0)] } },
      { id: 'hard', level: 'hard', name: T('14 kapasite: sık baştan ekleme, negatif/yinelenen değerler, karışık silme', '14-capacity: frequent front inserts, negative/duplicate values, mixed deletes'),
        data: { cap: 14, ops: [ins(0, 7), ins(1, -3), ins(2, 15), ins(0, -3), ins(4, 22), ins(5, -3), ins(0, 99), ins(7, -40), ins(8, 100), ins(9, -100), del(3), ins(9, 50), ins(10, 60), ins(0, 1000), del(0), del(5)] } },
      { id: 'overflow', level: 'edge', name: T('Taşma: 10 kapasiteyi doldur, sonra ekleme reddedilir', 'Overflow: fill a 10-capacity array, then an insert is rejected'),
        data: { cap: 10, ops: [ins(0, 3), ins(1, 6), ins(2, 9), ins(3, 12), ins(4, 15), ins(5, 18), ins(6, 21), ins(7, 24), ins(8, 27), ins(9, 30), ins(4, 777), ins(0, 111), del(3), ins(3, 888)] } },
      { id: 'delete-empty', level: 'edge', name: T('Alttan taşma: boş diziden silme, sonra doldur ve tamamen boşalt', 'Underflow: delete from an empty array, then fill it and drain it completely'),
        data: { cap: 12, ops: [del(0), ins(0, 5), ins(1, 15), ins(2, 25), ins(3, 35), ins(4, 45), ins(5, 55), ins(6, 65), ins(7, 75), ins(8, 85), ins(9, 95), del(0), del(0), del(0), del(0), del(0), del(0), del(0), del(0), del(0), del(0), del(0)] } },
      { id: 'boundary', level: 'edge', name: T('Sınır durumlar: hep 0. indise ekle, sonra hep sona ekle', 'Boundary cases: insert at index 0 every time, then always at the end'),
        data: { cap: 16, ops: [ins(0, 1), ins(0, 2), ins(0, 3), ins(0, 4), ins(0, 5), ins(5, 100), ins(6, 200), ins(7, 300), ins(8, 400), ins(9, 500)] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of insert_at calls (attempted or successful) -- delete calls do not count toward the input size. */
    size: function (d) { return d.ops.filter(function (o) { return o.op === 'i'; }).length; },
    /** Independent computation: plain JS array with splice/length, no shared helper with build(). */
    reference: function (d) {
      var CAP = d.cap, arr = [], moves = 0, rejects = 0, underflows = 0;
      d.ops.forEach(function (o) {
        if (o.op === 'i') {
          if (arr.length === CAP) { rejects++; return; }
          var k = Math.max(0, Math.min(o.k, arr.length));
          moves += arr.length - k;
          arr.splice(k, 0, o.v);
        } else {
          if (!arr.length) { underflows++; return; }
          var k2 = Math.max(0, Math.min(o.k, arr.length - 1));
          moves += arr.length - 1 - k2;
          arr.splice(k2, 1);
        }
      });
      return { arr: arr.slice(), size: arr.length, moves: moves, rejects: rejects, underflows: underflows };
    },
    random: function (level, r) {
      var insCount = { easy: 10, normal: 12, hard: 14, extreme: 17 }[level];
      var cap = level === 'extreme' ? 8 : (level === 'hard' ? 9 : 16);
      var lo = level === 'extreme' ? -500 : 1, hi = level === 'extreme' ? 500 : 99;
      var delChance = (level === 'easy' ? 1 : (level === 'extreme' ? 4 : 3)) / insCount;
      var ops = [], size = 0, i;
      for (i = 0; i < insCount; i++) {
        var k = D.randInt(r, 0, size), v = D.randInt(r, lo, hi);
        ops.push(ins(k, v));
        if (size < cap) size++;
        if (size > 0 && r() < delChance) { ops.push(del(D.randInt(r, 0, size - 1))); size--; }
      }
      return { cap: cap, ops: ops };
    },
    input: {
      hint: T('Örnek: cap=10  i0:5 i1:15 d0   (iK:V = K indisine V ekle, dK = K indisini sil)',
              'Example: cap=10  i0:5 i1:15 d0   (iK:V = insert V at index K, dK = delete index K)'),
      parse: function (text) {
        var cap = 16, ops = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^cap[=:](\d+)$/i.exec(tok);
          if (m) { cap = parseInt(m[1], 10); return; }
          var mi = /^i(\d+):(-?\d+)$/i.exec(tok);
          if (mi) { ops.push({ op: 'i', k: parseInt(mi[1], 10), v: parseInt(mi[2], 10) }); return; }
          var md = /^d(\d+)$/i.exec(tok);
          if (md) { ops.push({ op: 'd', k: parseInt(md[1], 10) }); return; }
          throw T('"' + tok + '" anlaşılmadı: iK:V (ekle), dK (sil) ya da cap=N yazın.', '"' + tok + '" is not understood: write iK:V (insert), dK (delete) or cap=N.');
        });
        if (cap < 1 || cap > 16) throw T('Kapasite 1 ile 16 arasında olmalı.', 'The capacity must be between 1 and 16.');
        if (!ops.length) throw T('En az bir işlem yazın.', 'Write at least one operation.');
        if (ops.length > 40) throw T('En çok 40 işlem.', 'At most 40 operations.');
        return { cap: cap, ops: ops };
      },
      format: function (d) {
        return 'cap=' + d.cap + '  ' + d.ops.map(function (o) { return o.op === 'i' ? ('i' + o.k + ':' + o.v) : ('d' + o.k); }).join(' ');
      },
      /** format() also carries "cap=N", which is not an op -- tokens() lists only the ops, in processing order. */
      tokens: function (d) { return d.ops.map(function (o) { return o.op === 'i' ? ('i' + o.k + ':' + o.v) : ('d' + o.k); }); },
      bad: ['', 'cap=0 i0:5', 'cap=30 i0:5', 'i0:5 x', 'iA:5', 'cap=abc i0:5']
    },
    build: function (S, d) {
      var CAP = d.cap, W = 54, H = 44, GAP = 6, X0 = 56, Y0 = 190;
      var arr = [], moves = 0, rejects = 0, underflows = 0, insSeen = 0, delSeen = 0;
      var RIGHT = X0 + CAP * (W + GAP) + 10;
      S.region('reg', { x: X0 - 16, y: Y0 - 22, w: CAP * (W + GAP) + 12, h: H + 60, title: 'arr[' + CAP + ']' });
      for (var i = 0; i < CAP; i++) S.box('c' + i, { x: X0 + i * (W + GAP), y: Y0, w: W, h: H, text: '', style: 'empty', size: 15, above: String(i) });
      S.label('rowlbl', { x: X0 - 14, y: Y0 + H / 2 + 6, text: 'arr =', anchor: 'end', size: 16, bold: true, mono: true });
      S.label('note', { x: RIGHT, y: Y0 + H / 2 + 6, text: '', anchor: 'start', size: 15, bold: true, mono: true, style: 'dim' });
      S.label('sizev', { x: X0, y: Y0 - 62, text: 'size = 0', anchor: 'start', bold: true, mono: true, size: 18 });
      S.label('movv', { x: X0 + 230, y: Y0 - 62, text: T('kaydırma: 0', 'shifts: 0'), anchor: 'start', style: 'dim', size: 15 });
      S.step(T('`CAP = ' + CAP + '` hücrelik bir dizi ve bir `size` sayacı: dizi doluluğunu `size` takip eder, boş hücreler kullanılmaz.',
               'An array of `CAP = ' + CAP + '` cells plus a `size` counter: `size` tracks how full the array is, unused cells stay empty.'), { c: L_DECL, java: L_DECL });

      function redraw(note) {
        for (var q = 0; q < CAP; q++) {
          if (q < arr.length) S.set('c' + q, { text: String(arr[q]), style: 'normal' });
          else S.set('c' + q, { text: '', style: 'empty' });
        }
        S.set('sizev', { text: 'size = ' + arr.length });
        S.set('movv', { text: T('kaydırma: ' + moves, 'shifts: ' + moves) });
        S.set('note', { text: note || '' });
        if (arr.length < CAP) { if (S.has('szp')) S.set('szp', { target: 'c' + arr.length }); else S.pointer('szp', { target: 'c' + arr.length, text: 'size', side: 'top', dist: 36 }); }
        else if (S.has('szp')) S.remove('szp');
        if (arr.length > 0) { if (S.has('filled')) S.set('filled', { to: 'c' + (arr.length - 1) }); else S.brace('filled', { from: 'c0', to: 'c' + (arr.length - 1), text: T('dolu', 'filled'), side: 'bottom', dist: 40 }); }
        else if (S.has('filled')) S.remove('filled');
      }

      d.ops.forEach(function (o, opIdx) {
        S.at(opIdx);
        if (o.op === 'i') {
          insSeen++;
          if (arr.length === CAP) {
            rejects++;
            for (var q1 = 0; q1 < CAP; q1++) S.set('c' + q1, { style: 'del' });
            S.set('note', { text: T('dolu!', 'full!') });
            S.step(T('`insert_at(' + o.k + ', ' + o.v + ')`: `size == CAP` (' + arr.length + ' == ' + CAP + '), dizi dolu → **taşma (overflow)**. Hiçbir şey yazılmaz.',
                     '`insert_at(' + o.k + ', ' + o.v + ')`: `size == CAP` (' + arr.length + ' == ' + CAP + '), the array is full → **overflow**. Nothing is written.'), { c: L_FULL, java: L_FULL });
            redraw();
            return;
          }
          var k = Math.max(0, Math.min(o.k, arr.length));
          var shiftCount = arr.length - k;
          if (insSeen === 1) {
            for (var q2 = arr.length - 1; q2 >= k; q2--) S.set('c' + q2, { style: 'hl' });
            S.set('note', { text: T(shiftCount + ' kaydırma', shiftCount + ' shift' + (shiftCount === 1 ? '' : 's')) });
            S.step(T('`insert_at(' + k + ', ' + o.v + ')`: yer var. `k`\'den `size`\'e kadar olan hücreleri SONDAN BAŞLAYARAK bir sağa kaydıracağız (' + shiftCount + ' kaydırma).',
                     '`insert_at(' + k + ', ' + o.v + ')`: there is room. We shift the cells from `k` to `size` one step right, STARTING FROM THE END (' + shiftCount + ' shift' + (shiftCount === 1 ? '' : 's') + ').'), { c: L_SHIFT_R, java: L_SHIFT_R });
          }
          for (var i2 = arr.length; i2 > k; i2--) S.set('c' + i2, { text: i2 - 1 < arr.length ? String(arr[i2 - 1]) : '', style: 'hl' });
          arr.splice(k, 0, o.v);
          moves += shiftCount;
          redraw(k === 0 ? T('k=0 (en kötü)', 'k=0 (worst)') : (shiftCount === 0 ? T('k=size (ekle)', 'k=size (append)') : T(shiftCount + ' kaydırma', shiftCount + ' shift' + (shiftCount === 1 ? '' : 's'))));
          S.set('c' + k, { style: 'new' });
          S.step((k === 0 && arr.length > 1)
            ? T('`arr[' + k + '] = ' + o.v + '`, `size++` → ' + arr.length + '. `k = 0` en kötü durum: TÜM eski elemanlar kaydı.',
                 '`arr[' + k + '] = ' + o.v + '`, `size++` → ' + arr.length + '. `k = 0` is the worst case: ALL the old elements shifted.')
            : T('`arr[' + k + '] = ' + o.v + '`, `size++` → ' + arr.length + '. ' + (shiftCount === 0 ? '`k == size`: bu bir **ekleme (append)**, kaydırma yok.' : shiftCount + ' hücre kaydı.'),
                 '`arr[' + k + '] = ' + o.v + '`, `size++` → ' + arr.length + '. ' + (shiftCount === 0 ? '`k == size`: this is an **append**, no shifting.' : shiftCount + ' cell' + (shiftCount === 1 ? '' : 's') + ' shifted.')),
            { c: L_INSERT, java: L_INSERT });
        } else {
          delSeen++;
          if (!arr.length) {
            underflows++;
            S.set('note', { text: T('boş!', 'empty!') });
            S.step(T('`delete_at(' + o.k + ')`: `size == 0`, silecek eleman yok → **alttan taşma (underflow)**. `false` döner.',
                     '`delete_at(' + o.k + ')`: `size == 0`, there is nothing to delete → **underflow**. Returns `false`.'), { c: L_EMPTY, java: L_EMPTY });
            redraw();
            return;
          }
          var k3 = Math.max(0, Math.min(o.k, arr.length - 1));
          var shiftCount2 = arr.length - 1 - k3;
          S.set('c' + k3, { style: 'del' });
          if (delSeen === 1) {
            S.set('note', { text: T(shiftCount2 + ' kaydırma', shiftCount2 + ' shift' + (shiftCount2 === 1 ? '' : 's')) });
            S.step(T('`delete_at(' + k3 + ')`: `arr[' + k3 + ']` (' + arr[k3] + ') kaldırılacak; ardından `k+1..size-1` bir sola kaydırılacak (' + shiftCount2 + ' kaydırma).',
                     '`delete_at(' + k3 + ')`: `arr[' + k3 + ']` (' + arr[k3] + ') will be removed; then `k+1..size-1` shifts one step left (' + shiftCount2 + ' shift' + (shiftCount2 === 1 ? '' : 's') + ').'), { c: L_SHIFT_L, java: L_SHIFT_L });
          }
          for (var i3 = k3; i3 < arr.length - 1; i3++) S.set('c' + i3, { text: String(arr[i3 + 1]), style: 'hl' });
          arr.splice(k3, 1);
          moves += shiftCount2;
          redraw(shiftCount2 === 0 ? T('son eleman', 'last element') : T(shiftCount2 + ' kaydırma', shiftCount2 + ' shift' + (shiftCount2 === 1 ? '' : 's')));
          S.step(T('`size--` → ' + arr.length + '. ' + (shiftCount2 === 0 ? 'Son elemanı sildik, kaydırma gerekmedi.' : shiftCount2 + ' hücre kaydı.'),
                   '`size--` → ' + arr.length + '. ' + (shiftCount2 === 0 ? 'We deleted the last element, no shifting was needed.' : shiftCount2 + ' cell' + (shiftCount2 === 1 ? '' : 's') + ' shifted.')), { c: L_DELETE, java: L_DELETE });
        }
      });
      S.at(null);
      redraw();
      S.result = { arr: arr.slice(), size: arr.length, moves: moves, rejects: rejects, underflows: underflows };
      S.step(T('Bitti: `size = ' + arr.length + '`, toplam ' + moves + ' kaydırma' + (rejects ? ', ' + rejects + ' taşma' : '') + (underflows ? ', ' + underflows + ' alttan taşma' : '') + '. `k = 0` en yavaş (O(n)), `k = size` en hızlı (O(1)) eklemedir.',
               'Done: `size = ' + arr.length + '`, ' + moves + ' shifts in total' + (rejects ? ', ' + rejects + ' overflow' + (rejects > 1 ? 's' : '') : '') + (underflows ? ', ' + underflows + ' underflow' + (underflows > 1 ? 's' : '') : '') + '. `k = 0` is the slowest insert (O(n)), `k = size` is the fastest (O(1)).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
