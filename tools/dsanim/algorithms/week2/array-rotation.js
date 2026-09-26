/* Week 2 -- rotate an array left by d positions with the REVERSAL algorithm: reverse the first d elements,
 * reverse the rest, then reverse the whole thing. Each phase's result is kept on screen as a new row below (the
 * path, like the binary-search drawing), so the three-phase dance is visible at a glance. Matches
 * array_rotation.c / ArrayRotation.java (reversal method, not juggling or one-by-one). */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'void reverse(int arr[], int lo, int hi) {',
    '    while (lo < hi) {',
    '        int tmp = arr[lo];',
    '        arr[lo] = arr[hi];',
    '        arr[hi] = tmp;',
    '        lo++;',
    '        hi--;',
    '    }',
    '}',
    '',
    'void rotate_left(int arr[], int n, int d) {',
    '    d = d % n;',
    '    reverse(arr, 0, d - 1);        /* reverse the first d elements */',
    '    reverse(arr, d, n - 1);        /* reverse the remaining n-d elements */',
    '    reverse(arr, 0, n - 1);        /* reverse the whole array */',
    '}'
  ];
  var JAVA = [
    'static void reverse(int[] arr, int lo, int hi) {',
    '    while (lo < hi) {',
    '        int tmp = arr[lo];',
    '        arr[lo] = arr[hi];',
    '        arr[hi] = tmp;',
    '        lo++;',
    '        hi--;',
    '    }',
    '}',
    '',
    'static void rotateLeft(int[] arr, int d) {',
    '    int n = arr.length;',
    '    d = d % n;',
    '    reverse(arr, 0, d - 1);        // reverse the first d elements',
    '    reverse(arr, d, n - 1);        // reverse the remaining n-d elements',
    '    reverse(arr, 0, n - 1);        // reverse the whole array',
    '}'
  ];
  var L_LOOP = { c: [2, 3, 4, 5, 6, 7], java: [2, 3, 4, 5, 6, 7] };
  var L_MOD = { c: [12], java: [13] };
  var L_P1 = { c: [13], java: [14] };
  var L_P2 = { c: [14], java: [15] };
  var L_P3 = { c: [15], java: [16] };

  D.define({
    id: 'array-rotation',
    title: T('Diziyi döndürme: üç ters çevirme ile sola döndürme', 'Array rotation: rotating left with three reversals'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('12 değer, d=4', '12 values, d=4'), data: { arr: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120], d: 4 } },
      { id: 'hard', level: 'hard', name: T('15 değer (negatif/yinelenen), d=7 (yarıya yakın)', '15 values (negative/duplicate), d=7 (near half)'),
        data: { arr: [3, -8, 15, 3, 22, -1, 40, 9, -17, 26, 5, -30, 11, 3, 18], d: 7 } },
      { id: 'd-zero', level: 'edge', name: T('d=0: hiçbir şey değişmemeli', 'd=0: nothing should change'), data: { arr: [4, 9, 15, 23, 2, 31, 8, 19, 6, 27], d: 0 } },
      { id: 'd-equals-n', level: 'edge', name: T('d=n: d%n=0 olur, yine değişmez', 'd=n: d%n=0, still no change'), data: { arr: [5, 12, 18, 24, 3, 30, 9, 21, 15, 6], d: 10 } },
      { id: 'd-greater-n', level: 'edge', name: T('d>n: d%n ile küçültülür (d=23, n=10 -> 3)', 'd>n: reduced by d%n (d=23, n=10 -> 3)'), data: { arr: [7, 14, 21, 2, 28, 9, 35, 16, 4, 22], d: 23 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.arr.length; },
    /** Independent computation via slicing (not the reversal technique build() uses): arr[d:] + arr[:d]. */
    reference: function (d) {
      var n = d.arr.length, dd = ((d.d % n) + n) % n;
      var rotated = d.arr.slice(dd).concat(d.arr.slice(0, dd));
      var swaps = Math.floor(dd / 2) + Math.floor((n - dd) / 2) + Math.floor(n / 2);
      return { arr: rotated, swaps: swaps };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level];
      var lo = level === 'extreme' ? -300 : 1, hi = level === 'extreme' ? 300 : 99;
      var arr = []; for (var i = 0; i < n; i++) arr.push(D.randInt(r, lo, hi));
      var pick = r(), d;
      if (pick < 0.15) d = 0;
      else if (pick < 0.3) d = n;
      else if (pick < 0.45) d = n + D.randInt(r, 1, n);
      else d = D.randInt(r, 1, n - 1);
      return { arr: arr, d: d };
    },
    input: {
      hint: T('Örnek: d=4  10 20 30 40 50   (d = sola kaç kaydırılacağı, sonra dizi)', 'Example: d=4  10 20 30 40 50   (d = how far to rotate left, then the array)'),
      parse: function (text) {
        var dVal = null, arr = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^d[=:](-?\d+)$/i.exec(tok);
          if (m) { if (dVal !== null) throw T('d birden fazla kez yazılamaz.', 'd cannot be written more than once.'); dVal = parseInt(m[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı ya da d=N yazın.', '"' + tok + '" is not understood: write a number or d=N.');
          arr.push(parseInt(tok, 10));
        });
        if (dVal === null) throw T('d=N yazmalısınız (kaydırma miktarı).', 'You must write d=N (the rotation amount).');
        if (dVal < 0) throw T('d negatif olamaz.', 'd cannot be negative.');
        if (arr.length < 2) throw T('En az 2 sayı yazın.', 'Write at least 2 numbers.');
        if (arr.length > 30) throw T('En çok 30 sayı.', 'At most 30 numbers.');
        return { arr: arr, d: dVal };
      },
      format: function (d) { return 'd=' + d.d + '  ' + d.arr.join(' '); },
      tokens: function (d) { return d.arr.map(String); },
      bad: ['', 'd=3 5 x 7', '5 8 13', 'd=abc 5 8', 'd=1 d=2 5 8 13']
    },
    build: function (S, d) {
      var arr = d.arr.slice(), n = arr.length, dd = ((d.d % n) + n) % n;
      var W = 54, H = 44, GAP = 6, X0 = 150, Y0 = 70, ROWH = 130;
      for (var i = 0; i < n; i++) S.box('a' + i, { x: X0 + i * (W + GAP), y: Y0, w: W, h: H, text: String(arr[i]), style: 'normal', size: 15, above: String(i) });
      S.label('rl0', { x: X0 - 14, y: Y0 + H / 2 + 6, text: 'A =', anchor: 'end', bold: true, mono: true, size: 16 });
      var noteX = X0 + n * (W + GAP) + 14;
      S.label('note', { x: noteX, y: Y0 + H / 2 + 6, text: '', anchor: 'start', size: 14, bold: true, mono: true, style: 'dim' });
      S.step(T('`rotate_left`: önce `d = d % n = ' + d.d + ' % ' + n + ' = ' + dd + '` (asıl kaydırma miktarı budur). Sonra ÜÇ ters çevirme yapılır: `reverse(0,d-1)`, `reverse(d,n-1)`, `reverse(0,n-1)`.',
               '`rotate_left`: first `d = d % n = ' + d.d + ' % ' + n + ' = ' + dd + '` (this is the real rotation amount). Then THREE reversals follow: `reverse(0,d-1)`, `reverse(d,n-1)`, `reverse(0,n-1)`.'), L_MOD);

      var rowN = 0, totalSwaps = 0, swapSeen = 0;
      function ids() { var out = []; for (var k = 0; k < n; k++) out.push('a' + k); return out; }
      function snap(labelText) {
        rowN++;
        S.snapshot('r' + rowN + '_', ids(), 0, rowN * ROWH, 'dim');
        S.label('rl' + rowN, { x: X0 - 14, y: Y0 + rowN * ROWH + H / 2 + 6, text: labelText, anchor: 'end', size: 14, bold: true, mono: true, style: 'dim' });
      }
      function markRegion(lo, hi, text) {
        if (S.has('seg')) S.remove('seg');
        if (lo <= hi) S.brace('seg', { from: 'a' + lo, to: 'a' + hi, text: text, side: 'bottom', dist: 14, style: 'active' });
      }

      function reverseRange(lo, hi, lines, phaseName, rowLabel) {
        markRegion(lo, hi, phaseName);
        var pairs = lo < hi ? Math.floor((hi - lo + 1) / 2) : 0;
        if (lo >= hi) {
          S.set('note', { text: T('değişiklik yok', 'no change') });
          S.step(T('`' + phaseName + '`: `lo >= hi`, ters çevrilecek bir şey yok.', '`' + phaseName + '`: `lo >= hi`, there is nothing to reverse.'), lines);
        } else {
          var lo2 = lo, hi2 = hi;
          while (lo2 < hi2) {
            S.set('a' + lo2, { style: 'active' }); S.set('a' + hi2, { style: 'active' });
            S.at(lo2);
            swapSeen++;
            if (swapSeen === 1) {
              S.set('note', { text: T(lo2 + ' ↔ ' + hi2, lo2 + ' ↔ ' + hi2) });
              S.step(T('`' + phaseName + '`: `arr[' + lo2 + ']` ve `arr[' + hi2 + ']` takas edilecek.', '`' + phaseName + '`: `arr[' + lo2 + ']` and `arr[' + hi2 + ']` are about to swap.'), lines);
            }
            var tmp = arr[lo2]; arr[lo2] = arr[hi2]; arr[hi2] = tmp;
            S.set('a' + lo2, { text: String(arr[lo2]), style: 'new' });
            S.set('a' + hi2, { text: String(arr[hi2]), style: 'new' });
            totalSwaps++;
            S.set('note', { text: T(lo2 + ' ↔ ' + hi2 + ' tamam', lo2 + ' ↔ ' + hi2 + ' done') });
            S.step(T('takas edildi: `arr[' + lo2 + '] = ' + arr[lo2] + '`, `arr[' + hi2 + '] = ' + arr[hi2] + '`.', 'swapped: `arr[' + lo2 + '] = ' + arr[lo2] + '`, `arr[' + hi2 + '] = ' + arr[hi2] + '`.'), lines);
            lo2++; hi2--;
          }
          for (var z = lo; z <= hi; z++) S.set('a' + z, { style: 'normal' });
        }
        S.at(null);
        snap(rowLabel);
        S.set('note', { text: T(pairs + ' takas', pairs + ' swap' + (pairs === 1 ? '' : 's')) });
        S.step(T('`' + phaseName + '` bitti: ' + pairs + ' takas. Bu durumu aşağıda yeni bir satır olarak tutuyoruz.', '`' + phaseName + '` is done: ' + pairs + ' swap' + (pairs === 1 ? '' : 's') + '. We keep this state as a new row below.'), lines);
      }

      reverseRange(0, dd - 1, L_P1, 'reverse(0,' + (dd - 1) + ')', T('reverse(0,' + (dd - 1) + ') sonrası', 'after reverse(0,' + (dd - 1) + ')'));
      reverseRange(dd, n - 1, L_P2, 'reverse(' + dd + ',' + (n - 1) + ')', T('reverse(' + dd + ',' + (n - 1) + ') sonrası', 'after reverse(' + dd + ',' + (n - 1) + ')'));
      reverseRange(0, n - 1, L_P3, 'reverse(0,' + (n - 1) + ')', T('reverse(0,' + (n - 1) + ') sonrası = final', 'after reverse(0,' + (n - 1) + ') = final'));

      if (S.has('seg')) S.remove('seg');
      S.set('note', { text: '' });
      S.result = { arr: arr.slice(), swaps: totalSwaps };
      S.step(T('Bitti: `d=' + d.d + '` sola döndürme, ' + totalSwaps + ' takas ile O(n) sürede. Sonuç: ' + arr.join(', ') + '.',
               'Done: rotating left by `d=' + d.d + '` took ' + totalSwaps + ' swaps, O(n) time. Result: ' + arr.join(', ') + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
