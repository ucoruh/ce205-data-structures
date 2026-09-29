/* Week 6 — interpolation search: on a SORTED, roughly uniform array, estimate where target should be with a
 * formula (like looking up a name in a phone book by its letter) instead of always checking the middle. Great on
 * uniform data (close to O(log log n)), degrades toward linear on skewed data. A guard avoids dividing by zero
 * when the current range is all one value.
 * Drawing standard: one row "arr =" with index numbers above; lo/hi/pos pointers; the probe formula is written out
 * with the numbers plugged in; the comparison is on the right. Examples (normal, hard, edge), random data and own
 * values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int interpolation_search(const int arr[], int n, int target, int *probes) {',
    '    int lo = 0, hi = n - 1, p = 0;',
    '    while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {',
    '        p++;',
    '        if (arr[hi] == arr[lo]) {                 /* guard: avoid division by zero */',
    '            *probes = p;',
    '            return lo;                            /* target must equal arr[lo] here */',
    '        }',
    '        int pos = lo + (int) ((double) (target - arr[lo]) * (hi - lo) / (arr[hi] - arr[lo]));',
    '        if (arr[pos] == target) { *probes = p; return pos; }',
    '        if (arr[pos] < target) lo = pos + 1;',
    '        else hi = pos - 1;',
    '    }',
    '    *probes = p;',
    '    return -1;',
    '}'
  ];
  var JAVA = [
    'static int interpolationSearch(int[] arr, int target) {',
    '    int lo = 0, hi = arr.length - 1;',
    '    probes = 0;',
    '    while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {',
    '        probes++;',
    '        if (arr[hi] == arr[lo]) {                 // guard: avoid division by zero',
    '            return lo;                            // target must equal arr[lo] here',
    '        }',
    '        int pos = lo + (int) ((double) (target - arr[lo]) * (hi - lo) / (arr[hi] - arr[lo]));',
    '        if (arr[pos] == target) return pos;',
    '        if (arr[pos] < target) lo = pos + 1;',
    '        else hi = pos - 1;',
    '    }',
    '    return -1;',
    '}'
  ];

  function point(S, id, target, text, dist) {
    if (S.has(id)) S.set(id, { target: target }); else S.pointer(id, { target: target, text: text, side: 'top', dist: dist });
  }
  function setBrace(S, id, p) { if (S.has(id)) S.set(id, p); else S.brace(id, p); }

  D.define({
    id: 'interpolation-search',
    title: T('Enterpolasyon araması: konumu formülle tahmin etmek', 'Interpolation search: estimating the position with a formula'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('Düzgün dağılmış 16 değer, tek yoklamada bulundu', 'Uniformly spread 16 values, found in a single probe'),
        data: { arr: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85], target: 55 } },
      { id: 'hard', level: 'hard', name: T('Hafif düzensiz aralıklar, birkaç yoklama gerekir', 'Slightly uneven spacing, needs a few probes'),
        data: { arr: [10, 13, 21, 24, 33, 36, 44, 48, 55, 61, 68, 74, 81, 87, 94, 100], target: 81 } },
      { id: 'skewed', level: 'edge', name: T('Çarpık veri: son değer çok büyük, çok sayıda yoklama', 'Skewed data: last value is huge, many probes'),
        data: { arr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 1000000], target: 8 } },
      { id: 'all-equal', level: 'edge', name: T('Tüm değerler eşit: bölme koruması devreye girer', 'All values equal: the division guard kicks in'),
        data: { arr: [42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42], target: 42 } },
      { id: 'out-of-range', level: 'edge', name: T('Hedef aralığın tamamen dışında: tek bakışta reddedilir', 'Target is entirely outside the range: rejected on sight'),
        data: { arr: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85], target: 999 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.arr.length; },
    /** Independent computation: same algorithm, coded separately from build(). */
    reference: function (d) {
      var arr = d.arr, n = arr.length, target = d.target;
      var lo = 0, hi = n - 1, p = 0, index = -1, pos;
      while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
        p++;
        if (arr[hi] === arr[lo]) { index = lo; break; }
        pos = lo + Math.floor((target - arr[lo]) * (hi - lo) / (arr[hi] - arr[lo]));
        if (arr[pos] === target) { index = pos; break; }
        if (arr[pos] < target) lo = pos + 1; else hi = pos - 1;
      }
      return { index: index, probes: p };
    },
    random: function (level, r) {
      var n = 16, i, arr = [];
      if (level === 'extreme' && r() < 0.4) {
        // occasionally generate a skewed array: dense low values, one far outlier
        var v = D.randInt(r, 0, 5);
        for (i = 0; i < n - 1; i++) { arr.push(v); v += D.randInt(r, 1, 3); }
        arr.push(v + D.randInt(r, 500, 5000));
      } else {
        var step = level === 'hard' ? [2, 6] : (level === 'extreme' ? [1, 10] : [4, 8]);
        var w = D.randInt(r, 0, 5);
        for (i = 0; i < n; i++) { arr.push(w); w += D.randInt(r, step[0], step[1]); }
      }
      var pick = r(), target;
      if (pick < 0.15) target = arr[0] - D.randInt(r, 1, 50);
      else if (pick < 0.3) target = arr[n - 1] + D.randInt(r, 1, 50);
      else target = arr[D.randInt(r, 0, n - 1)];
      return { arr: arr, target: target };
    },
    input: {
      hint: T('Örnek: 10 15 20 25 30 35 40 45 50 55 60 65 70 75 80 85 target=55  (sıralı dizi, en çok 16 sayı)',
              'Example: 10 15 20 25 30 35 40 45 50 55 60 65 70 75 80 85 target=55  (sorted array, at most 16 numbers)'),
      parse: function (text) {
        var arr = [], target = null;
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^target[=:](-?\d+)$/i.exec(tok);
          if (m) { target = parseInt(m[1], 10); return; }
          if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" anlaşılmadı: sayı ya da target=N yazın.', '"' + tok + '" is not understood: write a number or target=N.');
          arr.push(parseInt(tok, 10));
        });
        if (arr.length < 4) throw T('En az 4 sayı yazın.', 'Write at least 4 numbers.');
        if (arr.length > 16) throw T('En çok 16 sayı (bir satıra sığmalı).', 'At most 16 numbers (must fit on one row).');
        if (target === null) throw T('target=N yazmalısınız (aranan değer).', 'You must write target=N (the value to search for).');
        for (var i = 1; i < arr.length; i++) {
          if (arr[i] < arr[i - 1]) throw T('Dizi sıralı (artan ya da eşit) olmalı; enterpolasyon araması sıralı bir diziye ihtiyaç duyar.',
                                            'The array must be sorted (non-decreasing); interpolation search requires a sorted array.');
        }
        return { arr: arr, target: target };
      },
      format: function (d) { return d.arr.join(' ') + ' target=' + d.target; },
      bad: ['', '1 2 3', '5 8 x 13 target=8', 'target=abc 5 8', '9 3 5 target=5', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 target=5'],
      tokens: function (d) { return d.arr.map(String); }
    },
    build: function (S, d) {
      var arr = d.arr, n = arr.length, target = d.target;
      var X0 = 90, Y0 = 210, W = 46, H = 40, GAP = 6;
      var RX = X0 + n * (W + GAP) + 44;
      var binGuess = Math.max(1, Math.ceil(Math.log2(n)));

      arr.forEach(function (v, i) { S.box('h' + i, { x: X0 + i * (W + GAP), y: Y0, w: W, h: H, text: String(v), size: 15, above: String(i) }); });
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: T('dizi =', 'arr ='), anchor: 'end', size: 15, bold: true });
      S.label('tgt', { x: X0, y: 40, text: 'target = ' + target, size: 18, bold: true, mono: true });
      S.label('bcmp', { x: X0, y: 64, text: T('ikili arama burada ~' + binGuess + ' karşılaştırma yapardı', 'binary search here would take ~' + binGuess + ' comparisons'), style: 'dim', size: 14 });
      S.label('pcnt', { x: X0, y: 88, text: T('yoklama: 0', 'probes: 0'), style: 'dim', size: 14 });
      S.label('posf', { x: X0, y: 112, text: '', size: 14, mono: true, anchor: 'start' });
      S.label('dec', { x: RX, y: Y0 + H / 2 + 5, text: '', size: 18, bold: true, mono: true, anchor: 'start' });

      function setRowStyles(lo, hi) { for (var q = 0; q < n; q++) S.set('h' + q, { style: (q < lo || q > hi) ? 'dim' : 'normal' }); }
      function setBraces(lo, hi) {
        if (lo > 0) setBrace(S, 'elimL', { from: 'h0', to: 'h' + (lo - 1), text: T('elendi', 'eliminated'), side: 'bottom', dist: 14, style: 'dim' });
        else if (S.has('elimL')) S.remove('elimL');
        if (hi < n - 1) setBrace(S, 'elimR', { from: 'h' + (hi + 1), to: 'h' + (n - 1), text: T('elendi', 'eliminated'), side: 'bottom', dist: 14, style: 'dim' });
        else if (S.has('elimR')) S.remove('elimR');
        if (lo <= hi) setBrace(S, 'poss', { from: 'h' + lo, to: 'h' + hi, text: T('olası [' + lo + '..' + hi + ']', 'still possible [' + lo + '..' + hi + ']'), side: 'bottom', dist: 14, style: 'active' });
        else if (S.has('poss')) S.remove('poss');
      }
      function setP(p) { S.set('pcnt', { text: T('yoklama: ' + p, 'probes: ' + p) }); }

      S.step(T('Dizi **sıralı ve büyük ölçüde düzgün dağılmış**: ortayı değil, `target = ' + target + '`\'in nerede olması gerektiğini bir **formülle** tahmin ederiz — telefon rehberinde harfe göre sayfa açmak gibi.',
               'The array is **sorted and roughly uniform**: instead of the middle, we estimate with a **formula** where `target = ' + target + '` should be — like opening a phone book straight to the right letter.'),
             { c: [1, 2, 3], java: [1, 2, 3, 4] });

      var lo = 0, hi = n - 1, p = 0, index = -1, first = true;
      while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
        setRowStyles(lo, hi);
        setBraces(lo, hi);
        p++;
        setP(p);
        point(S, 'lop', 'h' + lo, 'lo', 50);
        point(S, 'hip', 'h' + hi, 'hi', 50);
        if (arr[hi] === arr[lo]) {
          index = lo;
          S.set('posf', { text: T('arr[hi] == arr[lo] (' + arr[hi] + ') — bölme yapılamaz, korumaya gir: bu aralık tek bir değerden oluşuyor.',
                                   'arr[hi] == arr[lo] (' + arr[hi] + ') — cannot divide, the guard kicks in: this range is a single repeated value.') });
          S.set('h' + lo, { style: 'new' });
          S.set('dec', { text: T('korumalı = bulundu', 'guarded = found'), style: 'new' });
          S.at(lo);
          S.step(T('`arr[hi] == arr[lo]`, formülün paydası `arr[hi] - arr[lo] = 0` olurdu — **sıfıra bölme**. Koruma bu durumu yakalar: aralık zaten tek bir değer (' + arr[lo] + '), `target` ile eşleşiyorsa oradadır.',
                   '`arr[hi] == arr[lo]`, the formula\'s denominator `arr[hi] - arr[lo] = 0` would be **division by zero**. The guard catches this: the range is already one single value (' + arr[lo] + '), it is `target` if they match.'),
                 { c: [5, 6, 7], java: [6, 7] });
          S.remove('lop'); S.remove('hip');
          break;
        }
        var pos = lo + Math.floor((target - arr[lo]) * (hi - lo) / (arr[hi] - arr[lo]));
        S.set('posf', { text: 'pos = ' + lo + ' + floor((' + target + ' - ' + arr[lo] + ') * (' + hi + ' - ' + lo + ') / (' + arr[hi] + ' - ' + arr[lo] + ')) = ' + pos });
        point(S, 'posp', 'h' + pos, 'pos', 22);
        S.at(pos);
        if (first) {
          S.step(T('Formül: en düşük ve en yüksek uca göre `target`\'in oransal konumunu hesaplarız. `pos = ' + pos + '`.',
                   'The formula: we compute `target`\'s proportional position between the low and high ends. `pos = ' + pos + '`.'),
                 { c: [9], java: [9] });
          first = false;
        }
        var v = arr[pos];
        if (v === target) {
          index = pos;
          S.set('h' + pos, { style: 'new' });
          S.set('dec', { text: '= ' + target + ' found', style: 'new' });
          S.step(T('`arr[' + pos + '] == ' + target + '`? Evet — ' + p + '. yoklamada bulundu.',
                   '`arr[' + pos + '] == ' + target + '`? Yes — found on probe ' + p + '.'), { c: [10], java: [10] });
          S.remove('lop'); S.remove('hip'); S.remove('posp');
          break;
        } else if (v < target) {
          S.set('h' + pos, { style: 'hl' });
          S.set('dec', { text: '< ' + target, style: 'hl' });
          S.step(T('`arr[' + pos + '] = ' + v + ' < ' + target + '` — tahmin düşük kaldı, aralığı sağdan daraltırız: `lo = ' + (pos + 1) + '`.',
                   '`arr[' + pos + '] = ' + v + ' < ' + target + '` — the estimate undershot, we narrow from the left: `lo = ' + (pos + 1) + '`.'),
                 { c: [9, 10, 11], java: [9, 10, 11] });
          lo = pos + 1;
        } else {
          S.set('h' + pos, { style: 'hl' });
          S.set('dec', { text: '> ' + target, style: 'hl' });
          S.step(T('`arr[' + pos + '] = ' + v + ' > ' + target + '` — tahmin yüksek kaldı, aralığı soldan daraltırız: `hi = ' + (pos - 1) + '`.',
                   '`arr[' + pos + '] = ' + v + ' > ' + target + '` — the estimate overshot, we narrow from the right: `hi = ' + (pos - 1) + '`.'),
                 { c: [9, 10, 12], java: [9, 10, 12] });
          hi = pos - 1;
        }
      }
      S.at(null);
      S.result = { index: index, probes: p };
      if (p === 0) {
        S.set('posf', { text: T('`target` [' + arr[0] + '..' + arr[n - 1] + '] aralığının tamamen dışında.', '`target` is entirely outside the range [' + arr[0] + '..' + arr[n - 1] + '].') });
        S.set('dec', { text: T('aralık dışı!', 'out of range!'), style: 'del' });
        S.styleAll('dim', 'box');
        S.step(T('`target = ' + target + '`, dizinin `[' + arr[0] + '..' + arr[n - 1] + ']` aralığının tamamen dışında — döngüye hiç girmeden, **0 yoklamada** reddedilir.',
                 '`target = ' + target + '` is entirely outside the array\'s `[' + arr[0] + '..' + arr[n - 1] + ']` range — rejected in **0 probes**, without ever entering the loop.'));
      } else if (index === -1) {
        setRowStyles(1, 0);
        if (S.has('poss')) S.remove('poss');
        S.set('dec', { text: T('boş!', 'empty!'), style: 'del' });
        S.step(T('`lo` artık `hi`\'dan büyük: aralık boşaldı — **bulunamadı**. Toplam ' + p + ' yoklama; ikili arama burada ~' + binGuess + ' karşılaştırma yapardı.',
                 '`lo` is now greater than `hi`: the range is empty — **not found**. ' + p + ' probes in total; binary search here would take ~' + binGuess + ' comparisons.'));
      } else {
        S.step(T('Sonuç: `arr[' + index + '] = ' + target + '`, yalnız ' + p + ' yoklamada bulundu. Düzgün dağılmış veride enterpolasyon araması ikili aramadan (~' + binGuess + ' karşılaştırma) çok daha az adımda sonuca ulaşır.',
                 'Result: `arr[' + index + '] = ' + target + '`, found in just ' + p + ' probe' + (p > 1 ? 's' : '') + '. On uniform data, interpolation search reaches the answer in far fewer steps than binary search\'s ~' + binGuess + ' comparisons.'));
      }
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
