/* Week 1 — stepping through average_buggy() in a debugger: breakpoints, step/next, a watch table,
 * and the exact moment the wrong (truncated) value appears. An empty array is guarded (no division
 * by zero); a single element still walks the same debugger session.
 * Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int average_buggy(const int arr[], int n) {',
    '    if (n == 0) return 0;            /* guard: avoid division by zero */',
    '    int sum = 0;',
    '    for (int i = 0; i < n; i++)',
    '        sum = sum + arr[i];',
    '    return sum / n;                  /* bug: integer division truncates */',
    '}',
    '',
    'double average_fixed(const int arr[], int n) {',
    '    if (n == 0) return 0.0;',
    '    int sum = 0;',
    '    for (int i = 0; i < n; i++)',
    '        sum = sum + arr[i];',
    '    return (double) sum / n;         /* fix: promote to double before dividing */',
    '}'
  ];
  var JAVA = [
    'static int averageBuggy(int[] arr) {',
    '    if (arr.length == 0) return 0;',
    '    int sum = 0;',
    '    for (int x : arr) sum += x;',
    '    return sum / arr.length;          // bug: integer division truncates',
    '}',
    '',
    'static double averageFixed(int[] arr) {',
    '    if (arr.length == 0) return 0.0;',
    '    int sum = 0;',
    '    for (int x : arr) sum += x;',
    '    return (double) sum / arr.length; // fix: promote to double before dividing',
    '}'
  ];

  D.define({
    id: 'debugger-stepping',
    title: T('Hata ayıklayıcıda (debugger) adım adım gitmek: kesme noktası, step, next, izleme tablosu',
             'Stepping through a debugger: breakpoints, step, next, and a watch table'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 eleman, hata görünür', '10 elements, the bug shows'),
        data: { arr: [7, 8, 8, 9, 6, 10, 7, 8, 9, 9] } },
      { id: 'hard', level: 'hard', name: T('16 eleman, negatif değerler', '16 elements, negative values'),
        data: { arr: [-5, 3, -8, 12, -1, 7, -10, 4, 9, -6, 2, -3, 8, -7, 1, 5] } },
      { id: 'empty', level: 'edge', small: true, name: T('Boş dizi: sıfıra bölme koruması', 'Empty array: the division-by-zero guard'),
        data: { arr: [] } },
      { id: 'single', level: 'edge', small: true, name: T('Tek eleman', 'A single element'),
        data: { arr: [7] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.arr.length; },
    /** Independent computation: sums the array a different way (plain loop, no debugger-session
     * bookkeeping shared with build()) and compares truncating integer division to real division. */
    reference: function (d) {
      var n = d.arr.length;
      if (n === 0) return { n: 0, sum: 0, buggy: 0, fixed: 0, guarded: true };
      var sum = 0, i;
      for (i = 0; i < n; i++) sum += d.arr[i];
      return { n: n, sum: sum, buggy: Math.trunc(sum / n), fixed: sum / n, guarded: false };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level];
      var lo = level === 'extreme' ? -999 : (level === 'hard' ? -99 : 1);
      var hi = level === 'extreme' ? 999 : (level === 'hard' ? 99 : 99);
      var arr = [], i;
      for (i = 0; i < n; i++) arr.push(D.randInt(r, lo, hi));
      return { arr: arr };
    },
    input: {
      hint: T('Örnek: 7 8 8 9 6 10 7 8 9 9  (ortalaması alınacak tamsayılar; boş bırakılabilir)',
              'Example: 7 8 8 9 6 10 7 8 9 9  (integers to average; may be left empty)'),
      parse: function (text) {
        var arr = D.parseInts(text);
        if (arr.length > 40) throw T('En çok 40 sayı.', 'At most 40 numbers.');
        return { arr: arr };
      },
      format: function (d) { return d.arr.join(' '); },
      bad: ['5 8 x', '5.5 8', new Array(42).fill('1').join(' '), '5,8.2,13'],
      tokens: function (d) { return d.arr.map(String); }
    },
    build: function (S, d) {
      var arr = d.arr, n = arr.length;
      var W = 54, H = 44, GAP = 8, X0 = 44, Y0 = 110, ROW = 16;
      if (n > 0) S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: 'arr[] =', anchor: 'end', size: 15, bold: true });
      arr.forEach(function (v, i) {
        var col = i % ROW, row = Math.floor(i / ROW);
        S.box('a' + i, { x: X0 + col * (W + GAP), y: Y0 + row * (H + 34), w: W, h: H, text: String(v), above: '[' + i + ']', size: 15 });
      });
      var cols = Math.min(n, ROW);
      var WX = X0 + Math.max(cols, 1) * (W + GAP) + 40, WY = 60;
      S.region('watch', { x: WX - 16, y: WY - 16, w: 190, h: 210, title: T('izleme (watch)', 'watch') });
      S.box('w_i', { x: WX, y: WY + 10, w: 90, h: 36, text: '-', above: 'i', style: 'dim', size: 15, mono: true });
      S.box('w_n', { x: WX, y: WY + 60, w: 90, h: 36, text: String(n), above: 'n', style: 'normal', size: 15, mono: true });
      S.box('w_sum', { x: WX, y: WY + 110, w: 90, h: 36, text: '-', above: 'sum', style: 'dim', size: 15, mono: true });
      S.step(T('`average_buggy(arr, ' + n + ')` çağrılır. `n = ' + n + '`. `break debug_average.c:2` — koruma satırına bir kesme noktası (breakpoint) koyuyoruz.',
               '`average_buggy(arr, ' + n + ')` is called. `n = ' + n + '`. `break debug_average.c:2` — we set a breakpoint on the guard line.'),
             { c: [1, 2], java: [1, 2] });

      if (n === 0) {
        S.set('w_n', { style: 'hl' });
        S.step(T('`run` — program hemen bu satırda durur: `n == 0`, doğru. Sıfıra bölme (division by zero) **tanımsız davranış (UB)** olurdu; koruma bunu önler ve `0` döner.',
                 '`run` — the program stops right here: `n == 0` is true. Dividing by zero would be **undefined behavior (UB)**; the guard prevents it and returns `0`.'),
               { c: [2], java: [2] });
        S.set('w_n', { style: 'normal' });
        S.result = { n: 0, sum: 0, buggy: 0, fixed: 0, guarded: true };
        S.step(T('Bitti: dizi boş olduğu için `average_buggy` de `average_fixed` de güvenle `0` döner — çökme yok, hata da yok, çünkü zaten hesaplanmadı.',
                 'Done: since the array is empty, both `average_buggy` and `average_fixed` safely return `0` — no crash, and no bug either, because nothing was ever computed.'));
        return;
      }

      S.set('w_i', { style: 'del' });
      S.step(T('`run` — program `sum = sum + arr[i];` satırında durur, İLK yinelemeden ÖNCE: `i = 0`, `sum = 0` (henüz hiçbir şey toplanmadı).',
               '`run` — the program stops at `sum = sum + arr[i];`, BEFORE the first iteration: `i = 0`, `sum = 0` (nothing has been added yet).'),
             { c: [3, 4], java: [3, 4] });
      S.set('w_i', { style: 'normal' });
      S.set('w_sum', { style: 'normal' });

      var sum = 0, detail = Math.min(2, n), i;
      for (i = 0; i < detail; i++) {
        S.at(i);
        S.set('a' + i, { style: 'hl' });
        sum += arr[i];
        S.set('w_i', { text: String(i), style: 'new' });
        S.set('w_sum', { text: String(sum), style: 'new' });
        S.step(T('`next` — `sum = sum + arr[' + i + ']` çalışır: `sum = ' + sum + '`. Döngü kontrolüne geri döner, `i` artar.',
                 '`next` — `sum = sum + arr[' + i + ']` runs: `sum = ' + sum + '`. Back to the loop check, `i` is incremented.'),
               { c: [4, 5], java: [4] });
        S.set('a' + i, { style: 'normal' });
      }
      if (n > detail) {
        for (i = detail; i < n; i++) sum += arr[i];
        S.at(n - 1);
        S.set('w_i', { text: String(n), style: 'new' });
        S.set('w_sum', { text: String(sum), style: 'new' });
        S.step(T((n - detail) + ' `next` daha aynı şekilde geçti — aynı satır, aynı birikim. Döngü biter: `i = ' + n + '`, `sum = ' + sum + '`.',
                 (n - detail) + ' more `next` steps went by the same way — same line, same accumulation. The loop ends: `i = ' + n + '`, `sum = ' + sum + '`.'),
               { c: [4, 5], java: [4] });
      }

      S.at(null);
      S.set('w_i', { style: 'dim' });
      S.set('w_sum', { style: 'hl' });
      S.set('w_n', { style: 'hl' });
      S.step(T('`break debug_average.c:6` sonra `continue` — döngü tamamen bitmiş, `return sum / n;` satırındayız: `sum = ' + sum + '`, `n = ' + n + '`.',
               '`break debug_average.c:6` then `continue` — the loop has fully finished, we are at `return sum / n;` — `sum = ' + sum + '`, `n = ' + n + '`.'),
             { c: [6], java: [5] });

      var buggy = Math.trunc(sum / n), fixed = sum / n, lossy = sum % n !== 0;
      var divText = 'sum / n = ' + buggy + (lossy ? ' (truncated!)' : '');
      var divW = Math.max(190, 20 + divText.length * 8.6);
      S.box('w_div', { x: WX, y: WY + 160, w: divW, h: 36, text: divText, style: lossy ? 'del' : 'normal', size: 14, mono: true });
      if (divW > 190) S.set('watch', { w: divW + 16 });
      S.step(T('`print sum / n` — **' + buggy + '**. `sum` ve `n` ikisi de `int`, yani bu TAM SAYI bölmesi.' +
                 (lossy ? ' Gerçek sonuç `' + fixed + '` idi — **işte hatalı değerin göründüğü an**: kesirli kısım sessizce atıldı.' : ' Burada tam bölünüyor, kayıp yok.'),
               '`print sum / n` — **' + buggy + '**. `sum` and `n` are both `int`, so this is INTEGER division.' +
                 (lossy ? ' The real result was `' + fixed + '` — **this is the moment the wrong value appears**: the fractional part was silently dropped.' : ' It divides evenly here, so nothing is lost.')),
             { c: [6], java: [5] });
      S.set('w_div', { style: 'normal' });
      S.box('w_fdiv', { x: WX, y: WY + 160, w: 190, h: 36, text: '(double) sum / n = ' + fixed, style: 'new', size: 13, mono: true });
      S.step(T('`print (double) sum / n` — **' + fixed + '**. AYNI `sum` ve `n`, kayan noktalıya zorlanmış: gerçek cevap. Hata döngüde değildi, yalnızca son bölmedeydi.',
               '`print (double) sum / n` — **' + fixed + '**. The SAME `sum` and `n`, forced to floating point: the real answer. The bug was never in the loop — only in the final division.'),
             { c: [14], java: [12] });

      S.result = { n: n, sum: sum, buggy: buggy, fixed: fixed, guarded: false };
      S.step(T('`continue` — program biter. `average_buggy -> ' + buggy + '`, `average_fixed -> ' + fixed + '`. Yöntem: kesme noktası koy, çalıştır, şüpheli ifadeleri yazdır, karşılaştır — kod hiç değişmedi.',
               '`continue` — the program finishes. `average_buggy -> ' + buggy + '`, `average_fixed -> ' + fixed + '`. The method: set a breakpoint, run, print suspicious expressions, compare — not one line of code changed.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
