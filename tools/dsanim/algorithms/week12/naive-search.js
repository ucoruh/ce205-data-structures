/* Week 12 -- Strings: Structures and Algorithms
 * Naive (brute-force) substring search: slide `pattern` across `text` one position (a "shift") at a time;
 * at each shift, compare characters left to right until a mismatch (move to the next shift) or the whole
 * pattern matches (record an occurrence -- and still move to the next shift, since matches may overlap).
 * Worst case O(n*m): a text like "AAAA...A" against a pattern like "AAAB" re-compares almost the whole
 * pattern at every single shift before finally failing on its last character. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'void naive_search(const char *text, int n, const char *pattern, int m, int occ[], int *count) {',
    '    int c = 0;',
    '    for (int s = 0; s <= n - m; s++) {          /* try every shift */',
    '        int j = 0;',
    '        while (j < m && text[s + j] == pattern[j]) j++;   /* compare left to right */',
    '        if (j == m) occ[c++] = s;                /* whole pattern matched: occurrence at s */',
    '    }',
    '    *count = c;',
    '}'
  ];
  var JAVA = [
    'static int[] naiveSearch(String text, String pattern) {',
    '    int n = text.length(), m = pattern.length(), c = 0;',
    '    int[] occ = new int[n];',
    '    for (int s = 0; s <= n - m; s++) {          // try every shift',
    '        int j = 0;',
    '        while (j < m && text.charAt(s + j) == pattern.charAt(j)) j++;   // compare left to right',
    '        if (j == m) occ[c++] = s;                // whole pattern matched: occurrence at s',
    '    }',
    '    return Arrays.copyOf(occ, c);',
    '}'
  ];

  /** Independent double loop; does not call build()'s stepping logic. */
  function reference(d) {
    var text = d.text, pattern = d.pattern, n = text.length, m = pattern.length, occ = [];
    for (var s = 0; s <= n - m; s++) {
      var j = 0;
      while (j < m && text[s + j] === pattern[j]) j++;
      if (j === m) occ.push(s);
    }
    return { occurrences: occ };
  }

  D.define({
    id: 'naive-search',
    title: T('Saf (naif) dizgi arama', 'Naive (brute-force) string search'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('text="ABABAABABC", pattern="ABABC": birkaç yanlış başlangıç', 'text="ABABAABABC", pattern="ABABC": a few false starts'),
        data: { text: 'ABABAABABC', pattern: 'ABABC' } },
      { id: 'hard', level: 'hard', name: T('text="AAAAAAAAAA", pattern="AAAB": en kötü durum, hep geç başarısız', 'text="AAAAAAAAAA", pattern="AAAB": worst case, fails late every time'),
        data: { text: 'AAAAAAAAAA', pattern: 'AAAB' } },
      { id: 'not-found', level: 'edge', name: T('text="THEQUICKFOX", pattern="ZEBRA": hiç bulunmaz, hep erken başarısız', 'text="THEQUICKFOX", pattern="ZEBRA": never found, always fails early'),
        data: { text: 'THEQUICKFOX', pattern: 'ZEBRA' } },
      { id: 'overlapping', level: 'edge', name: T('text="AAAAAAAAAA", pattern="AAA": her kaydırmada çakışan eşleşme', 'text="AAAAAAAAAA", pattern="AAA": an overlapping match at every shift'),
        data: { text: 'AAAAAAAAAA', pattern: 'AAA' } },
      { id: 'whole-text', level: 'edge', name: T('text == pattern (10 harf): tek olası kaydırma', 'text == pattern (10 letters): only one possible shift'),
        data: { text: 'ALGORITHMS', pattern: 'ALGORITHMS' } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.text.length; },
    reference: reference,
    random: function (level, r) {
      var alpha = level === 'easy' ? 8 : (level === 'normal' ? 5 : (level === 'hard' ? 3 : 2));
      var n = D.randInt(r, 10, level === 'extreme' ? 14 : 12), text = '', i;
      for (i = 0; i < n; i++) text += String.fromCharCode(65 + D.randInt(r, 0, alpha - 1));
      var m = D.randInt(r, 3, 5), pattern;
      var start = D.randInt(r, 0, n - m);
      pattern = r() < 0.6 ? text.slice(start, start + m) : (function () { var s = ''; for (var k = 0; k < m; k++) s += String.fromCharCode(65 + D.randInt(r, 0, alpha - 1)); return s; })();
      return { text: text, pattern: pattern };
    },
    input: {
      hint: T('Örnek: text=ABABAABABC pattern=ABABC  (yalnız A-Z; metin >= 10, örüntü 2-8 harf)',
              'Example: text=ABABAABABC pattern=ABABC  (letters A-Z only; text >= 10, pattern 2-8 letters)'),
      parse: function (text) {
        var t = null, p = null;
        String(text).trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
          var tm = /^text[=:]([A-Za-z]+)$/i.exec(tok); if (tm) { t = tm[1].toUpperCase(); return; }
          var pm = /^pattern[=:]([A-Za-z]+)$/i.exec(tok); if (pm) { p = pm[1].toUpperCase(); return; }
          throw T('"' + tok + '" anlaşılmadı: text=... ve pattern=... yazın.', '"' + tok + '" is not understood: write text=... and pattern=....');
        });
        if (!t) throw T('text=... yazmalısınız.', 'You must write text=....');
        if (!p) throw T('pattern=... yazmalısınız.', 'You must write pattern=....');
        if (t.length < 10 || t.length > 22) throw T('text 10 ile 22 harf arasında olmalı.', 'text must be between 10 and 22 letters.');
        if (p.length < 2 || p.length > t.length) throw T('pattern 2 harf ile text uzunluğu arasında olmalı.', 'pattern must be between 2 letters and the length of text.');
        return { text: t, pattern: p };
      },
      format: function (d) { return 'text=' + d.text + ' pattern=' + d.pattern; },
      bad: ['', 'text=ABC pattern=AB', 'ABABAABABC', 'text=ABABAABABC', 'pattern=ABC text=ABABAABABC12', 'text=abab123 pattern=ab'],
      tokens: function (d) { return d.text.split(''); }
    },
    build: function (S, d) {
      var text = d.text, pattern = d.pattern, n = text.length, m = pattern.length, W = 34, H = 34, X0 = 110, Y0T = 90, Y0P = 148;
      S.label('trow', { x: X0 - 16, y: Y0T + H / 2 + 5, text: 'text[] =', anchor: 'end', bold: true, size: 15 });
      for (var ti = 0; ti < n; ti++) S.box('t' + ti, { x: X0 + ti * W, y: Y0T, w: 28, h: H, text: text[ti], style: 'normal', size: 15, above: String(ti) });
      S.label('prow', { x: X0 - 16, y: Y0P + H / 2 + 5, text: 'pattern[] =', anchor: 'end', bold: true, size: 15 });
      for (var pj = 0; pj < m; pj++) S.box('p' + pj, { x: X0 + pj * W, y: Y0P, w: 28, h: H, text: pattern[pj], style: 'normal', size: 15, above: String(pj) });
      S.label('shiftlbl', { x: X0, y: Y0P + H + 34, text: 'shift s = 0', bold: true, mono: true, size: 15 });
      var RX = X0 + Math.max(n, m) * W + 40;
      S.label('dec', { x: RX, y: Y0T, text: '', size: 15, bold: true, anchor: 'start' });

      S.step(T('`pattern` (' + m + ' harf) `text` (' + n + ' harf) üzerinde soldan sağa kaydırılacak: `s = 0, 1, ..., ' + (n - m) + '`.',
               '`pattern` (' + m + ' letters) will slide across `text` (' + n + ' letters) left to right: `s = 0, 1, ..., ' + (n - m) + '`.'),
             { c: [1, 2, 3], java: [1, 2, 3, 4] });

      var occ = [], lastTouched = [];
      for (var s = 0; s <= n - m; s++) {
        S.at(s);
        lastTouched.forEach(function (idx) { S.set('t' + idx, { style: 'normal' }); });
        lastTouched = [];
        for (var pjj = 0; pjj < m; pjj++) { S.set('p' + pjj, { x: X0 + (s + pjj) * W, style: 'normal' }); }
        S.set('shiftlbl', { text: 'shift s = ' + s });
        var j = 0, mismatch = false;
        while (j < m) {
          S.set('t' + (s + j), { style: 'active' }); S.set('p' + j, { style: 'active' });
          lastTouched.push(s + j);
          if (text[s + j] === pattern[j]) {
            S.set('t' + (s + j), { style: 'new' }); S.set('p' + j, { style: 'new' });
            S.set('dec', { text: '`' + text[s + j] + '` == `' + pattern[j] + '`', style: 'new' });
            S.step(T('`text[' + (s + j) + ']` = `' + text[s + j] + '` == `pattern[' + j + ']` -- eşleşti, devam.', '`text[' + (s + j) + ']` = `' + text[s + j] + '` == `pattern[' + j + ']` -- matches, continue.'),
                   { c: [{ n: 5, note: T('eşleşme? evet, j++', 'match? yes, j++') }], java: [{ n: 6, note: T('eşleşme? evet, j++', 'match? yes, j++') }] });
            j++;
          } else {
            S.set('t' + (s + j), { style: 'del' }); S.set('p' + j, { style: 'del' });
            S.set('dec', { text: '`' + text[s + j] + '` != `' + pattern[j] + '`', style: 'del' });
            S.step(T('`text[' + (s + j) + ']` = `' + text[s + j] + '` != `pattern[' + j + ']` = `' + pattern[j] + '` -- uyuşmazlık, bu kaydırma bitti.', '`text[' + (s + j) + ']` = `' + text[s + j] + '` != `pattern[' + j + ']` = `' + pattern[j] + '` -- mismatch, this shift is done.'),
                   { c: [{ n: 5, note: T('eşleşme? hayır', 'match? no') }], java: [{ n: 6, note: T('eşleşme? hayır', 'match? no') }] });
            mismatch = true;
            break;
          }
        }
        if (!mismatch) {
          occ.push(s);
          S.set('dec', { text: T('bulundu!', 'found!'), style: 'new' });
          S.step(T('`j == m` (' + m + ') -- tüm örüntü eşleşti: **s = ' + s + '\'te bulundu**.', '`j == m` (' + m + ') -- the whole pattern matched: **found at s = ' + s + '**.'),
                 { c: 6, java: 7 });
        }
      }
      lastTouched.forEach(function (idx) { S.set('t' + idx, { style: 'normal' }); });
      for (var pk = 0; pk < m; pk++) S.set('p' + pk, { style: 'normal' });
      S.at(null);
      S.result = { occurrences: occ };
      S.step(T('Bitti: ' + (n - m + 1) + ' kaydırma denendi, ' + occ.length + ' oluşum bulundu (' + (occ.length ? occ.join(', ') : T('yok', 'none')) + '). En kötü durumda **O(n*m)** karşılaştırma.',
               'Done: ' + (n - m + 1) + ' shifts were tried, ' + occ.length + ' occurrence' + (occ.length === 1 ? '' : 's') + ' found (' + (occ.length ? occ.join(', ') : 'none') + '). Worst case: **O(n*m)** comparisons.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
