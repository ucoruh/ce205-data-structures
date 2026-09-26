/* Week 3 — recursion: countdown. A function calling itself on a smaller input, with a base case that stops it and a
 * recursive case that shrinks the problem. Uses the CORRECTED base case (`n <= 0`) throughout: the buggy version
 * (`n == 0` only) would never stop on negative input. n = 0 and negative n both hit the base case on the very
 * first call, so those two presets are genuinely tiny (`small: true`). */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'void countdown(int n) {',
    '    if (n <= 0) {                /* base case: fixed, was `n == 0` */',
    '        printf("Liftoff!\\n");',
    '        return;',
    '    }',
    '    printf("%d\\n", n);',
    '    countdown(n - 1);            /* recursive case */',
    '}'
  ];
  var JAVA = [
    'static void countdown(int n) {',
    '    if (n <= 0) {                // base case: fixed, was `n == 0`',
    '        System.out.println("Liftoff!");',
    '        return;',
    '    }',
    '    System.out.println(n);',
    '    countdown(n - 1);            // recursive case',
    '}'
  ];

  D.define({
    id: 'recursion-countdown',
    title: T('Özyineleme: geri sayım', 'Recursion: countdown'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T("10'dan geri sayım", 'Countdown from 10'), data: { n: 10 } },
      { id: 'hard', level: 'hard', name: T("15'ten geri sayım: daha derin bir çağrı yığını", 'Countdown from 15: a deeper call stack'), data: { n: 15 } },
      { id: 'zero', level: 'edge', name: T('n = 0: doğrudan temel durum', 'n = 0: straight to the base case'), data: { n: 0 }, small: true },
      { id: 'negative', level: 'edge', name: T('n = -4: negatif girdi, düzeltilmiş temel durum sayesinde yine tek çağrıda biter', 'n = -4: negative input, the corrected base case still stops in one call'), data: { n: -4 }, small: true }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Call depth (frames that get pushed) — 0 for n <= 0, since the base case fires on the first call. */
    size: function (d) { return Math.max(d.n, 0); },
    /** Independent computation of everything printed to the screen (checked against S.result by test.js). */
    reference: function (d) {
      var printed = [];
      if (d.n <= 0) { printed.push('Liftoff!'); return { printed: printed }; }
      for (var v = d.n; v >= 1; v--) printed.push(String(v));
      printed.push('Liftoff!');
      return { printed: printed };
    },
    random: function (level, r) {
      var range = { easy: [10, 11], normal: [10, 13], hard: [14, 18], extreme: [19, 25] }[level];
      return { n: D.randInt(r, range[0], range[1]) };
    },
    input: {
      hint: T('Örnek: 10   (tek bir tamsayı; negatif ya da 0 da yazılabilir)',
              'Example: 10   (a single integer; negative or 0 is fine too)'),
      parse: function (text) {
        var s = String(text).trim();
        if (!/^-?\d+$/.test(s)) throw T('"' + s + '" bir tamsayı değil. Örnek: 10 ya da -4.', '"' + s + '" is not an integer. Example: 10 or -4.');
        var n = parseInt(s, 10);
        if (n < -1000 || n > 100) throw T('n çok uç: -1000 ile 100 arasında bir sayı seçin.', 'n is too extreme: pick a number between -1000 and 100.');
        return { n: n };
      },
      format: function (d) { return String(d.n); },
      bad: ['', 'abc', '3.5', '10 20', '5000', '-5000']
    },
    build: function (S, d) {
      var n = d.n;
      var maxDepth = Math.max(n, 0) + 1; // frames that will ever be on the stack at once
      var X = 160, H = 54, FW = 260, FH = H - 10;
      var REGION_TOP = 50, REGION_H = 40 + maxDepth * H + 10;
      var Y0 = REGION_TOP + REGION_H - 18;
      var SX = X + FW + 150;

      S.region('stack', { x: X - 20, y: REGION_TOP, w: FW + 40, h: REGION_H, title: T('çağrı yığını', 'call stack') });
      S.label('screenhdr', { x: SX, y: REGION_TOP + 10, text: T('ekran:', 'screen:'), style: 'dim', size: 15, anchor: 'start' });
      S.label('decision', { x: SX + 200, y: REGION_TOP + 10, text: '', bold: true, size: 17, mono: true, anchor: 'start' });
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }

      S.step(T('Özyineleme: bir fonksiyonun **kendini** daha küçük bir girdiyle çağırması. İki parça şart: durduran **temel durum** '
               + 've soruyu küçülten **özyinelemeli durum**. `countdown(' + n + ')` çağıralım.',
               'Recursion: a function calling **itself** on a smaller input. Two parts are essential: a **base case** that stops, and a '
               + '**recursive case** that makes the problem smaller. Let us call `countdown(' + n + ')`.'),
             { c: 1, java: 1 });

      var printed = [];
      function pushFrame(k, label, style) {
        for (var i = 0; i < k; i++) S.set('f' + i, { style: 'normal' });
        S.box('f' + k, { x: X, y: Y0 - (k + 1) * H, w: FW, h: FH, text: label, style: style, size: 16 });
      }
      function printLine(text, style) {
        printed.push(text);
        S.label('e' + (printed.length - 1), { x: SX, y: REGION_TOP + 10 + 30 * printed.length, text: text, size: 18, bold: true, mono: true, anchor: 'start', style: style || 'normal' });
      }

      if (n <= 0) {
        pushFrame(0, 'countdown(n = ' + n + ')', 'new');
        decide('n <= 0', 'hl');
        S.step(T('`countdown(' + n + ')`: n zaten sıfır ya da negatif. Doğru temel durum `n <= 0`\'dır (yanlış olan `n == 0`, negatif girdide hiç durmazdı) — bu yüzden ilk çağrı zaten temel durumdur.',
                 '`countdown(' + n + ')`: n is already zero or negative. The correct base case is `n <= 0` (the buggy version, `n == 0`, would never stop on negative input) — so the very first call already is the base case.'),
               { c: [1, 2], java: [1, 2] });
        S.set('f0', { style: 'hl' });
        printLine('Liftoff!', 'hl');
        S.step(T('`countdown(' + n + ')`: **temel durum**. "Liftoff!" yazar ve döner; hiç kendini çağırmaz.',
                 '`countdown(' + n + ')`: the **base case**. It prints "Liftoff!" and returns; it never calls itself.'),
               { c: [2, 3, 4], java: [2, 3, 4] });
        S.remove('f0');
        S.step(T('`countdown(' + n + ')` biter; tek çerçevesi yığından çekilir.', '`countdown(' + n + ')` finishes; its one frame is popped.'), { c: 8, java: 8 });
      } else {
        for (var k = 0; k <= n; k++) {
          var v = n - k, detailed = k < 2;
          if (v > 0) {
            pushFrame(k, 'countdown(n = ' + v + ')', 'new');
            printLine(String(v));
            decide('n > 0', 'active');
            if (detailed) {
              S.step(T('`countdown(' + v + ')`: n sıfırdan büyük → önce ' + v + ' yazdır, sonra `countdown(' + (v - 1) + ')` çağır. Yeni bir çerçeve yığına itilir.',
                       '`countdown(' + v + ')`: n is greater than zero → print ' + v + ', then call `countdown(' + (v - 1) + ')`. A new frame is pushed.'),
                     { c: [1, 6, 7], java: [1, 6, 7] });
            } else {
              S.step(T('`countdown(' + v + ')` çağrılır: ' + v + ' yazdırılır, çerçeve yığına eklenir.',
                       '`countdown(' + v + ')` is called: ' + v + ' is printed, a frame is pushed.'),
                     { c: [1, 6, 7], java: [1, 6, 7] });
            }
          } else {
            pushFrame(k, 'countdown(n = ' + v + ')', 'new');
            S.set('f' + k, { style: 'hl' });
            printLine('Liftoff!', 'hl');
            decide('n <= 0', 'hl');
            S.step(T('`countdown(' + v + ')`: `n <= 0` artık doğru → **temel durum**. "Liftoff!" yazar ve döner; artık kendini çağırmaz. Temel durum olmasaydı çağrılar hiç bitmezdi.',
                     '`countdown(' + v + ')`: `n <= 0` now holds → the **base case**. It prints "Liftoff!" and returns; no more self-calls. Without it the calls would never end.'),
                   { c: [1, 2, 3, 4], java: [1, 2, 3, 4] });
          }
        }
        decide('', 'normal');
        for (var p = n; p >= 0; p--) {
          var vv = n - p, firstPop = p === n;
          S.remove('f' + p);
          if (firstPop) {
            S.step(T('`countdown(' + vv + ')` döner; çerçevesi yığından çekilir (LIFO: son giren ilk çıkar).',
                     '`countdown(' + vv + ')` returns; its frame is popped (LIFO: last in, first out).'), { c: 8, java: 8 });
          } else {
            S.step(T('`countdown(' + vv + ')` döner; çerçevesi çekilir.', '`countdown(' + vv + ')` returns; its frame is popped.'), { c: 8, java: 8 });
          }
        }
      }

      S.result = { printed: printed };
      S.step(T('Her çağrı bir çerçeve itti, her dönüş bir çerçeve çekti: özyineleme aslında bir yığındır. Derinlik ' + maxDepth + ' → O(' + maxDepth + ') bellek. Ekrana yazılanlar: ' + printed.join(', ') + '.',
               'Every call pushed a frame and every return popped one: recursion really is a stack. Depth ' + maxDepth + ' → O(' + maxDepth + ') memory. Printed: ' + printed.join(', ') + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
