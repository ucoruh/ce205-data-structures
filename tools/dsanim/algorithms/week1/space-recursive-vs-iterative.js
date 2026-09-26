/* Week 1 — space complexity: a recursive sum pushes one stack frame per call (O(n) extra memory);
 * an iterative sum reuses a single set of variables (O(1) extra memory).
 * Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int sum_recursive(const int arr[], int n) {',
    '    if (n == 0)              /* base case: 0 elements left */',
    '        return 0;',
    '    return arr[n - 1] + sum_recursive(arr, n - 1);   /* one stack frame per call */',
    '}',
    '',
    'int sum_iterative(const int arr[], int n) {',
    '    int total = 0;           /* ONE set of variables, reused every iteration */',
    '    for (int i = 0; i < n; i++)',
    '        total += arr[i];',
    '    return total;',
    '}'
  ];
  var JAVA = [
    'static int sumRecursive(int[] arr, int n) {',
    '    if (n == 0)               // base case: 0 elements left',
    '        return 0;',
    '    return arr[n - 1] + sumRecursive(arr, n - 1);   // one stack frame per call',
    '}',
    '',
    'static int sumIterative(int[] arr, int n) {',
    '    int total = 0;            // ONE set of variables, reused every iteration',
    '    for (int i = 0; i < n; i++)',
    '        total += arr[i];',
    '    return total;',
    '}'
  ];
  var DETAIL = 3, H = 30;

  D.define({
    id: 'space-recursive-vs-iterative',
    title: T('Alan karmaşıklığı (space complexity): özyinelemeli toplam ve döngülü toplam', 'Space complexity: recursive sum vs iterative sum'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 pozitif değer', '10 positive values'),
        data: { arr: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] } },
      { id: 'hard', level: 'hard', name: T('20 karışık işaretli değer', '20 values with mixed signs'),
        data: { arr: [5, -3, 12, 8, -7, 15, 22, -10, 6, 18, 9, -4, 11, 27, -15, 3, 19, -8, 14, 7] } },
      { id: 'all-negative', level: 'edge', name: T('10 negatif değer', '10 negative values'),
        data: { arr: [-5, -10, -15, -20, -25, -30, -35, -40, -45, -50] } },
      { id: 'deep', level: 'edge', name: T('22 değer: derin özyineleme', '22 values: deep recursion'),
        data: { arr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.arr.length; },
    /** Independent computation via reduce — a different code path from build's frame-by-frame simulation. */
    reference: function (d) {
      var n = d.arr.length;
      var sum = d.arr.reduce(function (a, b) { return a + b; }, 0);
      return { sum: sum, maxFrames: n, iterativeCells: 1 };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 13, hard: 20, extreme: 24 }[level];
      var lo = level === 'extreme' ? -1000 : (level === 'hard' ? -100 : 1);
      var hi = level === 'extreme' ? 1000 : (level === 'hard' ? 100 : 99);
      var arr = [], i;
      for (i = 0; i < n; i++) arr.push(D.randInt(r, lo, hi));
      return { arr: arr };
    },
    input: {
      hint: T('Örnek: 10 20 30 40 50 60 70 80 90 100  (toplanacak tamsayılar)',
              'Example: 10 20 30 40 50 60 70 80 90 100  (integers to sum)'),
      parse: function (text) {
        var arr = D.parseInts(text);
        if (!arr.length) throw T('En az bir sayı yazın.', 'Write at least one number.');
        if (arr.length > 40) throw T('En çok 40 sayı.', 'At most 40 numbers.');
        return { arr: arr };
      },
      format: function (d) { return d.arr.join(' '); },
      bad: ['', '5 8 x 13', '5.5 8 13', new Array(41).fill('1').join(' '), '5,8.2,13']
    },
    build: function (S, d) {
      var arr = d.arr, n = arr.length;
      var X = 170, Y0 = 40 + (n + 2) * H;
      S.region('cy', { x: X - 140, y: 16, w: 300, h: (n + 2) * H + 10, title: T('sum_recursive: çağrı yığını (call stack)', 'sum_recursive: call stack') });
      S.box('main', { x: X, y: Y0 - H, w: 240, h: H - 6, text: 'main()', size: 13 });
      S.step(T('`sum_recursive(arr, ' + n + ')` çağrılır. Her çağrı, bitene kadar çağrı yığınında (call stack) bir çerçeve (frame) tutar.',
               '`sum_recursive(arr, ' + n + ')` is called. Every call holds a frame on the call stack until it finishes.'),
             { c: [1], java: [1] });
      var pushed = 0, grouped = 0, depth;
      for (depth = n; depth >= 0; depth--) {
        var fid = 'f' + depth;
        if (depth >= 1) S.at(depth - 1);
        S.box(fid, { x: X, y: Y0 - (2 + pushed) * H, w: 240, h: H - 6, text: 'sum_recursive(n=' + depth + ')', style: 'new', size: 12 });
        pushed++;
        if (depth === 0) {
          if (grouped > 0) {
            S.step(T(grouped + ' çağrı daha aynı şekilde yığına eklendi (n = ' + (n - DETAIL) + ' ... 1) — her biri kendi çerçevesini tutuyor.',
                     grouped + ' more calls were pushed the same way (n = ' + (n - DETAIL) + ' ... 1) — each one holding its own frame.'),
                   { c: [1, 4], java: [1, 4] });
          }
          S.set(fid, { style: 'hl' });
          S.step(T('`n = 0` — **temel durum (base case)**. Artık kendini çağırmaz, doğrudan 0 döner.',
                   '`n = 0` — the **base case**. It no longer calls itself and returns 0 directly.'), { c: [2, 3], java: [2, 3] });
        } else if (pushed <= DETAIL) {
          S.step(T('`n = ' + depth + '` sıfır değil, bu yüzden yeni bir çerçeve itilip `sum_recursive(arr, ' + (depth - 1) + ')` çağrılır — önce o dönmeli.',
                   '`n = ' + depth + '` is not zero, so a new frame is pushed and `sum_recursive(arr, ' + (depth - 1) + ')` is called — it must return first.'),
                 { c: [2, 4], java: [2, 4] });
        } else {
          grouped++;
        }
      }
      S.step(T('Zincirin en derin noktasında **' + (n + 1) + ' çerçeve** aynı anda yığında duruyor — `n = ' + n + '` için `n + 1`. Bu O(n) EK bellek, dizinin kendisinin üstüne.',
               'At the deepest point of the chain, **' + (n + 1) + ' frames** sit on the stack at once — `n + 1` for `n = ' + n + '`. That is O(n) EXTRA memory, on top of the array itself.'),
             { c: [4], java: [4] });
      for (depth = 0; depth <= n; depth++) S.remove('f' + depth);
      S.step(T('Her çağrı döndükçe çerçevesi yığından çekilir. Sonunda yalnızca `main` kalır — ama zirvede O(n) bellek gerçekten kullanılmıştı.',
               'As each call returns, its frame is popped off. Only `main` is left at the end — but O(n) memory really was used at the peak.'), { c: [1], java: [1] });
      S.remove('cy');
      S.region('itf', { x: 480, y: 60, w: 260, h: 90, title: T('sum_iterative: TEK çerçeve', 'sum_iterative: ONE frame') });
      S.box('total', { x: 510, y: 92, w: 100, h: 40, text: 'total = 0', style: 'new', size: 13, mono: true });
      S.box('iv', { x: 630, y: 92, w: 80, h: 40, text: 'i = 0', style: 'new', size: 13, mono: true });
      S.step(T('`sum_iterative` farklı bir yaklaşım kullanır: `total` ve `i` için TEK bir çerçeve, baştan sona.',
               '`sum_iterative` takes a different approach: ONE frame for `total` and `i`, from start to finish.'), { c: [7, 8], java: [7, 8] });
      var total = 0, groupedIter = 0, i;
      for (i = 0; i < n; i++) {
        S.at(i);
        total += arr[i];
        if (i < DETAIL || i === n - 1) {
          if (i === n - 1 && groupedIter > 0) {
            S.step(T(groupedIter + ' adım daha aynı şekilde geçti — AYNI `total` ve `i` güncellendi, yeni çerçeve hiç açılmadı.',
                     groupedIter + ' more steps went by the same way — the SAME `total` and `i` were updated, no new frame was ever opened.'), { c: [9, 10], java: [9, 10] });
          }
          S.set('total', { text: 'total = ' + total });
          S.set('iv', { text: 'i = ' + i });
          S.step(T('`i = ' + i + '` — `total += arr[' + i + ']` (' + arr[i] + '): AYNI `total` ve `i` değişkenleri güncellenir, yeni bir çerçeve AÇILMAZ.',
                   '`i = ' + i + '` — `total += arr[' + i + ']` (' + arr[i] + '): the SAME `total` and `i` are updated in place; no new frame is EVER opened.'),
                 { c: [9, 10], java: [9, 10] });
        } else {
          groupedIter++;
        }
      }
      S.at(null);
      S.result = { sum: total, maxFrames: n, iterativeCells: 1 };
      S.step(T('Sonuç: iki fonksiyon da aynı ' + total + ' değerini döndürür. Ama `sum_recursive`, `n` ile büyüyen O(n) yığın belleği kullandı; `sum_iterative` her zaman tam olarak O(1) kullandı — `n` ne olursa olsun tek çerçeve.',
               'Result: both functions return the same ' + total + '. But `sum_recursive` used O(n) stack memory that grows with `n`; `sum_iterative` always used exactly O(1) — one frame, no matter what `n` is.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
