/* Week 1 — the growth race: for a list of n values, compare log2 n, n, n*log2 n, n^2 and 2^n side by side.
 * Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'for (int i = 0; i < count; i++) {',
    '    long n = ns[i];',
    '    double nlogn = (double) n * log2((double) n);',
    '    double nsq = (double) n * (double) n;',
    '    printf("%10ld %16.0f %18.0f\\n", n, nlogn, nsq);',
    '}'
  ];
  var JAVA = [
    'for (long n : ns) {',
    '    double nlogn = n * (Math.log(n) / Math.log(2));',
    '    double nsq = (double) n * (double) n;',
    '    System.out.printf("%10d %16.0f %18.0f%n", n, nlogn, nsq);',
    '}'
  ];
  var BASE_Y = 260, BASE_PX = 200;
  var KEYS = ['log2n', 'n', 'nlogn', 'nsq', 'pow2n'];
  var XS = { log2n: 40, n: 170, nlogn: 300, nsq: 430, pow2n: 560 };
  var NAMES = { log2n: 'log2(n)', n: 'n', nlogn: 'n·log2(n)', nsq: 'n²', pow2n: '2^n' };
  var BARW = 100;

  function bigStr(bi) {
    var s = bi.toString();
    if (s.length <= 18) return s;
    return s[0] + '.' + s.slice(1, 4) + '×10^' + (s.length - 1);
  }
  function clampPx(v) { return Math.max(4, Math.min(BASE_PX, Math.round(v))); }

  /** One record's exact values (n, log2n, nlogn, nsq as numbers; pow2n as a BigInt string). */
  function compute(n) {
    var log2n = Math.log2(n);
    var nlogn = n * log2n;
    var nsq = n * n;
    var pow2n = (1n << BigInt(n));
    return { n: n, log2n: Math.round(log2n), nlogn: Math.round(nlogn), nsq: nsq, pow2n: pow2n.toString(), pow2nBig: pow2n };
  }

  D.define({
    id: 'growth-race',
    title: T('Büyüme yarışı: log₂n, n, n·log₂n, n², 2ⁿ', 'The growth race: log2 n, n, n log2 n, n squared, 2^n'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('İkiye katlayarak: 1→512', 'Doubling: 1→512'),
        data: { ns: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512] } },
      { id: 'hard', level: 'hard', name: T('İkiye katlayarak, daha uzun: 1→4096', 'Doubling, longer: 1→4096'),
        data: { ns: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096] } },
      { id: 'large-from-start', level: 'edge', name: T('Baştan büyük n\'ler: 2^n daha ilk adımda taşar', 'Large n from the start: 2^n overflows on the very first step'),
        data: { ns: [400, 420, 440, 460, 480, 500, 520, 540, 560, 580] } },
      { id: 'single', level: 'edge', name: T('Tek değer: n = 1', 'A single value: n = 1'), small: true,
        data: { ns: [1] } },
      { id: 'non-power', level: 'edge', name: T('İkinin kuvveti olmayan artan dizi', 'An increasing sequence that is not a power of two'),
        data: { ns: [1, 3, 5, 9, 14, 20, 27, 35, 44, 54] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.ns.length; },
    /** Independent exact computation per n (2^n via BigInt, reported as a string). */
    reference: function (d) {
      // independent of compute(): ln n / ln 2 for the logarithm, repeated doubling for 2^n
      return d.ns.map(function (n) {
        var lg = Math.log(n) / Math.LN2, p = BigInt(1);
        for (var i = 0; i < n; i++) p = p * BigInt(2);
        return { n: n, log2n: Math.round(lg), nlogn: Math.round(n * lg), nsq: Math.pow(n, 2), pow2n: p.toString() };
      });
    },
    random: function (level, r) {
      var count = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level];
      var cap = { easy: 40, normal: 90, hard: 300, extreme: 800 }[level];
      var ns = [], v = D.randInt(r, 1, 3), i, step;
      for (i = 0; i < count; i++) {
        ns.push(v);
        step = Math.max(1, Math.floor((cap - v) / Math.max(1, count - i)) + D.randInt(r, 0, 3));
        v = v + step;
        if (v > cap) v = cap;
        if (v <= ns[ns.length - 1]) v = ns[ns.length - 1] + 1;
      }
      return { ns: ns };
    },
    input: {
      hint: T('Örnek: 1 2 4 8 16 32 64 128 256 512  (n değerleri, hepsi ≥ 1, en çok 6000)',
              'Example: 1 2 4 8 16 32 64 128 256 512  (n values, all ≥ 1, at most 6000)'),
      parse: function (text) {
        var ns = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (!/^\d+$/.test(tok)) throw T('"' + tok + '" pozitif bir tamsayı değil.', '"' + tok + '" is not a positive integer.');
          var v = parseInt(tok, 10);
          if (v < 1) throw T('n değerleri en az 1 olmalı.', 'n values must be at least 1.');
          ns.push(v);
        });
        if (!ns.length) throw T('En az bir n değeri yazın.', 'Write at least one n value.');
        if (ns.length > 30) throw T('En çok 30 n değeri.', 'At most 30 n values.');
        if (ns.some(function (v) { return v > 6000; })) throw T('n değerleri en çok 6000 olabilir (2^n hesaplanabilir kalsın).', 'n values can be at most 6000 (so that 2^n stays computable).');
        return { ns: ns };
      },
      format: function (d) { return d.ns.join(' '); },
      bad: ['', '1 2 x 4', '0 1 2 3 4 5 6 7 8 9', '-5 1 2 3', '1 2 3 7000']
    },
    build: function (S, d) {
      var ns = d.ns, maxN = Math.max.apply(null, ns), maxNsq = maxN * maxN, scale = BASE_PX / maxNsq;
      var overflowLimit = BigInt(maxNsq);
      KEYS.forEach(function (key) {
        S.box(key, { x: XS[key], y: BASE_Y - 4, w: BARW, h: 4, style: key === 'pow2n' ? 'hl' : (key === 'nsq' ? 'active' : 'normal'), size: 13 });
        S.label(key + 'lbl', { x: XS[key] + BARW / 2, y: BASE_Y + 24, text: NAMES[key], size: 14, bold: true, mono: true });
        S.label(key + 'val', { x: XS[key] + BARW / 2, y: BASE_Y - 14, text: '0', size: 12, mono: true });
      });
      S.set('nsq', { style: 'active' });
      S.set('pow2n', { style: 'hl' });
      S.label('nlbl', { x: 300, y: 30, text: 'n = ?', size: 22, bold: true, mono: true });
      S.step(T('Beş fonksiyonu yarıştıralım: `log₂n`, `n`, `n·log₂n`, `n²` ve `2^n`. ' + ns.length + ' tane n değeri sırayla deneyeceğiz.',
               'Let us race five functions: `log2 n`, `n`, `n·log2 n`, `n²`, and `2^n`. We will try ' + ns.length + ' n values in order.'),
             { c: [1, 2], java: [1] });
      var results = [], first = true;
      ns.forEach(function (n, idx) {
        S.at(idx);
        var r = compute(n);
        results.push({ n: r.n, log2n: r.log2n, nlogn: r.nlogn, nsq: r.nsq, pow2n: r.pow2n });
        var overflow = r.pow2nBig > overflowLimit;
        var pxLog2n = clampPx(r.log2n * scale);
        var pxN = clampPx(r.n * scale);
        var pxNlogn = clampPx(r.nlogn * scale);
        var pxNsq = clampPx(r.nsq * scale);
        var pxPow2n = overflow ? BASE_PX : clampPx(Number(r.pow2nBig) * scale);
        S.set('log2n', { y: BASE_Y - pxLog2n, h: pxLog2n });
        S.set('log2nval', { y: BASE_Y - pxLog2n - 14, text: String(r.log2n) });
        S.set('n', { y: BASE_Y - pxN, h: pxN });
        S.set('nval', { y: BASE_Y - pxN - 14, text: String(r.n) });
        S.set('nlogn', { y: BASE_Y - pxNlogn, h: pxNlogn });
        S.set('nlognval', { y: BASE_Y - pxNlogn - 14, text: String(r.nlogn) });
        S.set('nsq', { y: BASE_Y - pxNsq, h: pxNsq });
        S.set('nsqval', { y: BASE_Y - pxNsq - 14, text: String(r.nsq) });
        S.set('pow2n', { y: BASE_Y - pxPow2n, h: pxPow2n });
        S.set('pow2nval', { y: BASE_Y - pxPow2n - 14, text: (overflow ? '× ' : '') + bigStr(r.pow2nBig) });
        S.set('nlbl', { text: 'n = ' + n });
        if (first) {
          S.step(T('`n = ' + n + '` — `log₂(' + n + ') = ' + r.log2n + '`, `n·log₂n = ' + r.nlogn + '`, `n² = ' + r.nsq + '`, `2^n = ' + bigStr(r.pow2nBig) + '`.',
                   '`n = ' + n + '` — `log2(' + n + ') = ' + r.log2n + '`, `n·log2 n = ' + r.nlogn + '`, `n² = ' + r.nsq + '`, `2^n = ' + bigStr(r.pow2nBig) + '`.'),
                 { c: [1, 2, 3, 4], java: [1, 2, 3] });
          first = false;
        } else if (overflow) {
          S.step(T('`n = ' + n + '` — `2^n` çubuğu artık grafiğin tepesini aşıyor — `×` işareti, gerçek değerin sığmadığını gösterir: `2^n = ' + bigStr(r.pow2nBig) + '`.',
                   '`n = ' + n + '` — the `2^n` bar now overflows the top of the chart — the `×` mark shows the true value no longer fits: `2^n = ' + bigStr(r.pow2nBig) + '`.'),
                 { c: [3, 4], java: [2, 3] });
        } else {
          S.step(T('`n = ' + n + '` — `n² = ' + r.nsq + '`, `2^n = ' + bigStr(r.pow2nBig) + '`.',
                   '`n = ' + n + '` — `n² = ' + r.nsq + '`, `2^n = ' + bigStr(r.pow2nBig) + '`.'),
                 { c: [3, 4], java: [2, 3] });
        }
      });
      S.at(null);
      S.result = results;
      var last = results[results.length - 1];
      S.step(T('Sırayla `log₂n < n < n·log₂n < n² < 2^n` — her biri bir öncekini kesin olarak geride bırakır. Son n\'de (' + last.n + '), `n² = ' + last.nsq + '` iken `2^n = ' + bigStr(BigInt(last.pow2n)) + '`: üstel (exponential) karmaşıklık, çok küçük girdilerde bile çok hızlı büyür.',
               'In order, `log2 n < n < n·log2 n < n² < 2^n` — each one eventually and permanently overtakes the previous. At the last n (' + last.n + '), `n² = ' + last.nsq + '` while `2^n = ' + bigStr(BigInt(last.pow2n)) + '`: exponential complexity grows brutally fast, even for modest inputs.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
