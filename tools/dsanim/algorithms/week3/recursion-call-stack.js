/* Week 3 — recursion and the call stack: fact(n), pushed/popped frames, and a real 32-bit int overflow bug. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'int fact(int n) {',
    '    if (n == 0)              /* base case */',
    '        return 1;',
    '    return n * fact(n - 1);',
    '}',
    '',
    'int main(void) {',
    '    int result = fact(n);    /* WARNING: int overflows silently for n >= 13 */',
    '    printf("%d\\n", result);',
    '}'
  ];
  var JAVA = [
    'static int fact(int n) {',
    '    if (n == 0)              // base case',
    '        return 1;',
    '    return n * fact(n - 1);',
    '}',
    '',
    'public static void main(String[] args) {',
    '    int result = fact(n);    // WARNING: int overflows silently for n >= 13',
    '    System.out.println(result);',
    '}'
  ];

  /** Exact factorial (safe for n <= 17, since 17! < Number.MAX_SAFE_INTEGER), plus what a naive 32-bit `int`
   *  return type would silently hold instead. JS's `| 0` truncates a Number to a signed int32 by construction,
   *  which reproduces exactly what a C/Java `int` would hold after silent overflow, because the exact value was
   *  computed first with ordinary (safe, exact) numbers. Used by both reference() and build() so they cannot drift. */
  function factInfo(n) {
    var value = 1;
    for (var k = 2; k <= n; k++) value *= k;
    var wrongInt32 = value | 0;
    return { value: value, wrongInt32: wrongInt32, overflowed: wrongInt32 !== value };
  }

  D.define({
    id: 'recursion-call-stack',
    title: T('Özyineleme ve çağrı yığını: fact(n)', 'Recursion and the call stack: fact(n)'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 derinlikte çağrı yığını', 'call stack 10 deep'),
        data: { n: 10 } },
      { id: 'hard', level: 'hard', name: T('12 derinlik: taşmaya bir adım kala', '12 deep: one step from overflow'),
        data: { n: 12 } },
      { id: 'overflow-13', level: 'edge', name: T('int taşması: 13!', 'int overflow at 13'),
        data: { n: 13 } },
      { id: 'base-case', level: 'edge', name: T('temel durum: fact(0)', 'base case: fact(0)'),
        data: { n: 0 }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of input values — here the single integer n itself. */
    size: function (d) { return d.n; },
    /** Independent computation of the expected outcome (checked against S.result by test.js). */
    reference: function (d) {
      // independent of factInfo(): exact BigInt product, then what a 32-bit int would keep
      var v = BigInt(1);
      for (var k = 2; k <= d.n; k++) v *= BigInt(k);
      var w = Number(BigInt.asIntN(32, v));
      return { value: Number(v), wrongInt32: w, overflowed: BigInt(w) !== v };
    },
    random: function (level, r) {
      var range = { easy: [10, 11], normal: [10, 13], hard: [13, 16], extreme: [15, 17] }[level] || [10, 13];
      return { n: D.randInt(r, range[0], range[1]) };
    },
    input: {
      hint: T('Örnek: 13   (0 ile 17 arasında bir tamsayı n)', 'Example: 13   (an integer n between 0 and 17)'),
      parse: function (text) {
        var s = String(text).trim();
        if (!/^\d+$/.test(s)) throw T('"' + s + '" bir negatif olmayan tamsayı olmalı, örn. 13.', '"' + s + '" must be a non-negative integer, e.g. 13.');
        var n = parseInt(s, 10);
        if (n > 17) throw T('n en çok 17 olabilir; daha büyüğünde çift duyarlıklı sayılarda kesinlik kaybı başlar.', 'n can be at most 17; above that, double-precision numbers start losing exactness.');
        return { n: n };
      },
      format: function (d) { return String(d.n); },
      bad: ['', 'abc', '-3', '3.5', '18', '1000']
    },
    build: function (S, d) {
      var X = 260, W = 300, H = 54, total = d.n + 2, Y0 = 40 + total * H, LX = X + W + 90;
      var order = ['main'], info = factInfo(d.n);

      S.region('cs', { x: X - 30, y: 20, w: W + 60, h: total * H + 40, title: T('çağrı yığını', 'call stack') });
      S.box('main', { x: X, y: Y0 - H, w: W, h: H - 10, text: 'main()', style: 'active', size: 17 });
      S.label('depth', { x: LX, y: 60, text: T('derinlik: 0 çağrı', 'depth: 0 calls'), bold: true, size: 18, mono: true, anchor: 'start' });
      S.label('ninfo', { x: LX, y: 92, text: T('n = ' + d.n, 'n = ' + d.n), style: 'dim', size: 14, anchor: 'start' });
      S.label('decision', { x: LX, y: 122, text: '', bold: true, size: 16, mono: true, anchor: 'start' });
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }

      S.step(T('`main()` başladı; şimdi `fact(' + d.n + ')` çağrılacak. Her fonksiyon çağrısı çağrı yığınına bir **çerçeve** iter: yerel değişkenler ve dönüş adresi.',
               '`main()` has started; `fact(' + d.n + ')` is about to be called. Every function call pushes a **frame** onto the call stack: local variables and the return address.'),
             { c: 7, java: 7 });

      function clean() { order.forEach(function (id, i) { if (i < order.length - 1) S.set(id, { style: 'normal' }); }); }
      function point() {
        var top = order[order.length - 1];
        if (!S.has('sp')) S.pointer('sp', { target: top, text: T('şu an', 'now'), side: 'right', dist: 18 });
        else S.set('sp', { target: top });
      }
      function count() {
        var k = order.length - 1;
        S.set('depth', { text: T('derinlik: ' + k + ' çağrı', 'depth: ' + k + ' call' + (k === 1 ? '' : 's')) });
      }
      function pushFrame(fid, text, style) {
        S.box(fid, { x: X, y: Y0 - (order.length + 1) * H, w: W, h: H - 10, text: text, style: style, size: 17 });
        order.push(fid);
      }

      var levelsN = [];
      for (var k0 = d.n; k0 >= 0; k0--) levelsN.push(k0);

      levelsN.forEach(function (n, idx) {
        var fid = 'f' + n, detailed = idx < 3 || n === 0;
        pushFrame(fid, 'fact(n = ' + n + ')', n === 0 ? 'hl' : 'new');
        clean(); point(); count();
        var callNo = order.length - 1;
        if (n === 0) {
          decide('base case!', 'hl');
          S.step(T('Çağrı #' + callNo + ': `fact(0)` — **temel durum**. `n == 0` olduğu için kendini yeniden çağırmaz, doğrudan `1` döner. Temel durum olmasaydı yığın sonsuza dek büyür, **stack overflow** olurdu.',
                   'Call #' + callNo + ': `fact(0)` — the **base case**. Since `n == 0` it does not call itself again; it returns `1` directly. Without a base case the stack would keep growing forever — a **stack overflow**.'),
                 { c: [2, 3], java: [2, 3] });
        } else if (detailed) {
          decide('n != 0', 'active');
          S.step(T('Çağrı #' + callNo + ': ' + (idx === 0 ? '`main()`, `fact(' + n + ')`\'i çağırır' : '`fact(' + (n + 1) + ')`, `fact(' + n + ')`\'i çağırır') +
                   '; yeni bir çerçeve yığına itilir. `n == 0` değil (`n = ' + n + '`), o yüzden önce `fact(' + (n - 1) + ')`\'in bitmesi beklenir.',
                   'Call #' + callNo + ': ' + (idx === 0 ? '`main()` calls `fact(' + n + ')`' : '`fact(' + (n + 1) + ')` calls `fact(' + n + ')`') +
                   '; a new frame is pushed onto the stack. `n` is not `0` (`n = ' + n + '`), so first we wait for `fact(' + (n - 1) + ')` to finish.'),
                 { c: idx === 0 ? [7, 8, 1, 2, 4] : [1, 2, 4], java: idx === 0 ? [7, 8, 1, 2, 4] : [1, 2, 4] });
        } else {
          decide('n != 0', 'active');
          S.step(T('Çağrı #' + callNo + ': `fact(' + n + ')` çağrılır, çerçeve itilir; `fact(' + (n - 1) + ')` beklenecek.',
                   'Call #' + callNo + ': `fact(' + n + ')` is called, its frame is pushed; `fact(' + (n - 1) + ')` is awaited.'),
                 { c: [1, 4], java: [1, 4] });
        }
      });

      var sonuc = 1, popIdx = 0;
      levelsN.slice().reverse().forEach(function (n) {
        var fid = 'f' + n;
        if (n > 0) sonuc *= n;
        S.set(fid, { text: 'fact(' + n + ') → ' + sonuc });
        if (popIdx === 0) {
          decide('return 1', 'new');
          S.step(T('`fact(0)` temel durumdan `1` döner. Çerçevesi yığından çekilir (**pop**); kontrol onu çağıran `fact(1)`\'e geri döner ve bu değeri kullanır.',
                   '`fact(0)` returns `1` from the base case. Its frame is popped off the stack; control returns to the `fact(1)` that called it, which uses this value.'),
                 { c: [3, 4], java: [3, 4] });
        } else {
          decide('return ' + sonuc, 'new');
          S.step(T('`fact(' + n + ')` çağrısı `' + sonuc + '` döner (`' + n + ' × ' + (sonuc / n) + '`); çerçevesi yığından çekilir (pop).',
                   '`fact(' + n + ')` returns `' + sonuc + '` (`' + n + ' × ' + (sonuc / n) + '`); its frame is popped off the stack.'),
                 { c: [4], java: [4] });
        }
        order.pop();
        S.remove(fid);
        point(); count();
        popIdx++;
      });

      S.set('main', { text: 'main(): result = ' + info.value, style: 'new' });
      count(); decide('', 'normal');

      if (info.overflowed) {
        S.label('wrongL', { x: LX, y: 154, anchor: 'start', mono: true, bold: true, size: 15, style: 'del',
                             text: T('int result = ' + info.wrongInt32 + '   // YANLIŞ (taştı)', 'int result = ' + info.wrongInt32 + '   // WRONG (overflowed)') });
        S.label('rightL', { x: LX, y: 182, anchor: 'start', mono: true, bold: true, size: 15, style: 'new',
                             text: T('long result = ' + info.value + '   // doğru', 'long result = ' + info.value + '   // correct') });
        decide('overflow!', 'del');
        S.step(T('`fact(' + d.n + ')`\'in gerçek değeri `' + info.value + '`. Ama fonksiyon `int fact(int n)` diye yazılsaydı, 32 bitlik `int` sessizce taşar ve `' + info.wrongInt32 + '` döndürürdü — derleyici hata vermez, program çalışır ama yanlış sonuç verir.',
                 'The real value of `fact(' + d.n + ')` is `' + info.value + '`. But if the function were written as `int fact(int n)`, the 32-bit `int` would silently overflow and return `' + info.wrongInt32 + '` instead — the compiler gives no error, the program simply runs with the wrong answer.'),
               { c: [4, 8], java: [4, 8] });
      }

      S.result = { value: info.value, wrongInt32: info.wrongInt32, overflowed: info.overflowed };
      S.step(T('Bitti: `fact(' + d.n + ') = ' + info.value + '`. Her çağrı O(1) ek iş yapar; derinliği n olan bir özyinelemeli çağrı O(n) yığın belleği kullanır.' +
               (info.overflowed ? ' `13!`\'ten başlayarak 32 bitlik `int` bu değerleri artık tutamaz.' : ''),
               'Done: `fact(' + d.n + ') = ' + info.value + '`. Every call does O(1) extra work; a recursion of depth n uses O(n) call-stack memory.' +
               (info.overflowed ? ' Starting at `13!`, a 32-bit `int` can no longer hold these values.' : '')));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
