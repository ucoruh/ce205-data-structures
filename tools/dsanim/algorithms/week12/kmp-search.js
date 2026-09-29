/* Week 12 -- Strings: Structures and Algorithms
 * Knuth-Morris-Pratt (KMP) search: uses the lps[] failure-function table (previous animation) to search
 * `text` for `pattern` WITHOUT ever moving the text pointer `i` backward. On a mismatch, instead of restarting
 * the pattern from its first character at the next text position (naive search's approach), the pattern
 * pointer `j` falls back to `lps[j-1]` -- reusing the partial match already found -- while `i` keeps going
 * forward. This gives O(n + m) total time: every text character is examined at most a small constant number
 * of times, never re-scanned from scratch the way naive search's worst case does. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'void kmp_search(const char *text, int n, const char *pattern, int m, const int lps[], int occ[], int *count) {',
    '    int i = 0, j = 0, c = 0;',
    '    while (i < n) {',
    '        if (text[i] == pattern[j]) {',
    '            i++; j++;',
    '            if (j == m) {',
    '                occ[c++] = i - m;        /* occurrence found; keep scanning */',
    '                j = lps[j - 1];',
    '            }',
    '        } else if (j > 0) {',
    '            j = lps[j - 1];              /* fall back in the PATTERN; i never moves back */',
    '        } else {',
    '            i++;',
    '        }',
    '    }',
    '    *count = c;',
    '}'
  ];
  var JAVA = [
    'static int[] kmpSearch(String text, String pattern, int[] lps) {',
    '    int n = text.length(), m = pattern.length(), i = 0, j = 0, c = 0;',
    '    int[] occ = new int[n];',
    '    while (i < n) {',
    '        if (text.charAt(i) == pattern.charAt(j)) {',
    '            i++; j++;',
    '            if (j == m) {',
    '                occ[c++] = i - m;        // occurrence found; keep scanning',
    '                j = lps[j - 1];',
    '            }',
    '        } else if (j > 0) {',
    '            j = lps[j - 1];              // fall back in the PATTERN; i never moves back',
    '        } else {',
    '            i++;',
    '        }',
    '    }',
    '    return Arrays.copyOf(occ, c);',
    '}'
  ];

  function computeLps(p) {
    var m = p.length, lps = new Array(m).fill(0), len = 0, i = 1;
    while (i < m) {
      if (p[i] === p[len]) { len++; lps[i] = len; i++; }
      else if (len !== 0) { len = lps[len - 1]; }
      else { lps[i] = 0; i++; }
    }
    return lps;
  }

  /** Independent: brute-force substring search, one shift at a time -- no lps[], no call to computeLps(),
   * which build() also uses. A completely different algorithm finds the identical set of occurrences. */
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
    id: 'kmp-search',
    title: T('KMP dizgi arama (metni asla geri sarmaz)', 'KMP string search (never rewinds the text)'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('Klasik örnek: "ABABDABACDABABCABAB" içinde "ABABCABAB"', 'The classic example: "ABABCABAB" inside "ABABDABACDABABCABAB"'),
        data: { text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' } },
      { id: 'hard', level: 'hard', name: T('text="AAAAAAAAAAAAAAAB", pattern="AAAAB": çok sayıda lps geri düşüşü', 'text="AAAAAAAAAAAAAAAB", pattern="AAAAB": many lps fallbacks'),
        data: { text: 'AAAAAAAAAAAAAAAB', pattern: 'AAAAB' } },
      { id: 'not-found', level: 'edge', name: T('"THEQUICKBROWNFOX" içinde "ZEBRA": hiç bulunmaz', '"ZEBRA" inside "THEQUICKBROWNFOX": never found'),
        data: { text: 'THEQUICKBROWNFOX', pattern: 'ZEBRA' } },
      { id: 'overlapping', level: 'edge', name: T('text="AAAAAAAAAA", pattern="AAA": çakışan eşleşmeler', 'text="AAAAAAAAAA", pattern="AAA": overlapping matches'),
        data: { text: 'AAAAAAAAAA', pattern: 'AAA' } },
      { id: 'exact-match', level: 'edge', name: T('text == pattern (10 harf): tek eşleşme, hiç geri düşüş yok', 'text == pattern (10 letters): one match, no fallback at all'),
        data: { text: 'ALGORITHMS', pattern: 'ALGORITHMS' } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.text.length; },
    reference: reference,
    random: function (level, r) {
      var alpha = level === 'easy' ? 8 : (level === 'normal' ? 5 : (level === 'hard' ? 2 : 3));
      var n = D.randInt(r, 12, level === 'extreme' ? 20 : 16), text = '', i;
      for (i = 0; i < n; i++) text += String.fromCharCode(65 + D.randInt(r, 0, alpha - 1));
      var m = D.randInt(r, 3, 6), start = D.randInt(r, 0, n - m);
      var pattern = r() < 0.6 ? text.slice(start, start + m) : (function () { var s = ''; for (var k = 0; k < m; k++) s += String.fromCharCode(65 + D.randInt(r, 0, alpha - 1)); return s; })();
      return { text: text, pattern: pattern };
    },
    input: {
      hint: T('Örnek: text=ABABDABACDABABCABAB pattern=ABABCABAB  (yalnız A-Z; metin >= 10, örüntü 2-9 harf)',
              'Example: text=ABABDABACDABABCABAB pattern=ABABCABAB  (letters A-Z only; text >= 10, pattern 2-9 letters)'),
      parse: function (text) {
        var t = null, p = null;
        String(text).trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
          var tm = /^text[=:]([A-Za-z]+)$/i.exec(tok); if (tm) { t = tm[1].toUpperCase(); return; }
          var pm = /^pattern[=:]([A-Za-z]+)$/i.exec(tok); if (pm) { p = pm[1].toUpperCase(); return; }
          throw T('"' + tok + '" anlaşılmadı: text=... ve pattern=... yazın.', '"' + tok + '" is not understood: write text=... and pattern=....');
        });
        if (!t) throw T('text=... yazmalısınız.', 'You must write text=....');
        if (!p) throw T('pattern=... yazmalısınız.', 'You must write pattern=....');
        if (t.length < 10 || t.length > 24) throw T('text 10 ile 24 harf arasında olmalı.', 'text must be between 10 and 24 letters.');
        if (p.length < 2 || p.length > t.length) throw T('pattern 2 harf ile text uzunluğu arasında olmalı.', 'pattern must be between 2 letters and the length of text.');
        return { text: t, pattern: p };
      },
      format: function (d) { return 'text=' + d.text + ' pattern=' + d.pattern; },
      bad: ['', 'text=ABC pattern=AB', 'ABABDABACDABABCABAB', 'text=ABABDABACDABABCABAB', 'pattern=ABC text=ABABDABACDABABCABAB1', 'text=abab123 pattern=ab'],
      tokens: function (d) { return d.text.split(''); }
    },
    build: function (S, d) {
      var text = d.text, pattern = d.pattern, n = text.length, m = pattern.length, W = 34, H = 34, X0 = 110, Y0T = 90, Y0P = 148, Y0L = 200;
      var lps = computeLps(pattern);
      S.label('trow', { x: X0 - 16, y: Y0T + H / 2 + 5, text: 'text[] =', anchor: 'end', bold: true, size: 15 });
      for (var ti = 0; ti < n; ti++) S.box('t' + ti, { x: X0 + ti * W, y: Y0T, w: 28, h: H, text: text[ti], style: 'normal', size: 15, above: String(ti) });
      S.label('prow', { x: X0 - 16, y: Y0P + H / 2 + 5, text: 'pattern[] =', anchor: 'end', bold: true, size: 15 });
      for (var pj = 0; pj < m; pj++) S.box('p' + pj, { x: X0 + pj * W, y: Y0P, w: 28, h: H, text: pattern[pj], style: 'normal', size: 15, above: String(pj) });
      S.label('lrow', { x: X0 - 16, y: Y0L + H / 2 + 5, text: 'lps[] =', anchor: 'end', size: 12, style: 'dim' });
      for (var lj = 0; lj < m; lj++) S.box('l' + lj, { x: X0 + lj * W, y: Y0L, w: 28, h: 24, text: String(lps[lj]), style: 'dim', size: 11 });
      var RX = X0 + Math.max(n, m) * W + 40;
      S.label('dec', { x: RX, y: Y0T, text: '', size: 15, bold: true, anchor: 'start' });
      S.label('dec2', { x: RX, y: Y0T + 24, text: '', size: 12, anchor: 'start', style: 'dim' });

      S.step(T('Önce `pattern` için `lps[]` tablosu kurulur (önceki animasyon) -- `lps = [' + lps.join(', ') + ']`. Şimdi arama: `i` (metin) yalnız İLERİ gider, hiç geri sarmaz.',
               'First `lps[]` is built for `pattern` (previous animation) -- `lps = [' + lps.join(', ') + ']`. Now the search: `i` (text) only ever moves FORWARD, never rewinds.'),
             { c: [1, 2], java: [1, 2, 3] });

      function alignPattern(i, j) {
        var base = X0 + (i - j) * W;
        for (var k = 0; k < m; k++) S.set('p' + k, { x: base + k * W });
      }

      var occ = [], i = 0, j = 0;
      while (i < n) {
        S.at(i);
        alignPattern(i, j);
        S.set('t' + i, { style: 'active' }); S.set('p' + j, { style: 'active' });
        if (text[i] === pattern[j]) {
          S.set('t' + i, { style: 'new' }); S.set('p' + j, { style: 'new' });
          S.set('dec', { text: '`' + text[i] + '` == `' + pattern[j] + '`', style: 'new' });
          i++; j++;
          if (j === m) {
            occ.push(i - m);
            S.set('dec2', { text: T('bulundu, ' + (i - m) + '\'te! lps[' + (j - 1) + '] = ' + lps[j - 1] + ' ile devam', 'found at ' + (i - m) + '! continue with lps[' + (j - 1) + '] = ' + lps[j - 1]) });
            S.step(T('`text[' + (i - 1) + ']` == `pattern[' + (j - 1) + ']` -- son karakter de eşleşti, `j == m`: **s = ' + (i - m) + '\'te bulundu**. `j = lps[' + (j - 1) + '] = ' + lps[j - 1] + '` ile arama sürer (i geri gitmez).',
                     '`text[' + (i - 1) + ']` == `pattern[' + (j - 1) + ']` -- the last character matched too, `j == m`: **found at s = ' + (i - m) + '**. The search continues with `j = lps[' + (j - 1) + '] = ' + lps[j - 1] + '` (i does not go back).'),
                   { c: [{ n: 4, note: T('eşleşme? evet', 'match? yes') }, 5, { n: 6, note: T('j == m? evet', 'j == m? yes') }, 7, 8], java: [{ n: 5, note: T('eşleşme? evet', 'match? yes') }, 6, { n: 7, note: T('j == m? evet', 'j == m? yes') }, 8, 9] });
            j = lps[j - 1];
          } else {
            S.set('dec2', { text: '' });
            S.step(T('`text[' + (i - 1) + ']` == `pattern[' + (j - 1) + ']` -- eşleşti, ikisi de bir artar (`i=' + i + '`, `j=' + j + '`).',
                     '`text[' + (i - 1) + ']` == `pattern[' + (j - 1) + ']` -- match, both advance (`i=' + i + '`, `j=' + j + '`).'),
                   { c: [{ n: 4, note: T('eşleşme? evet', 'match? yes') }, 5, { n: 6, note: T('j == m? hayır', 'j == m? no') }], java: [{ n: 5, note: T('eşleşme? evet', 'match? yes') }, 6, { n: 7, note: T('j == m? hayır', 'j == m? no') }] });
          }
          S.set('t' + (i - 1), { style: 'dim' });
        } else if (j > 0) {
          S.set('t' + i, { style: 'del' }); S.set('p' + j, { style: 'del' });
          S.set('dec', { text: '`' + text[i] + '` != `' + pattern[j] + '`', style: 'del' });
          S.set('dec2', { text: T('j > 0 -> j = lps[' + (j - 1) + '] = ' + lps[j - 1] + ' (i sabit)', 'j > 0 -> j = lps[' + (j - 1) + '] = ' + lps[j - 1] + ' (i stays put)') });
          S.step(T('`text[' + i + ']` = `' + text[i] + '` != `pattern[' + j + ']` = `' + pattern[j] + '` -- uyuşmazlık, ama `j` (' + j + ') sıfır değil: `j = lps[' + (j - 1) + '] = ' + lps[j - 1] + '`. `i` YERİNDE kalır -- bu karakter yeniden okunmaz.',
                   '`text[' + i + ']` = `' + text[i] + '` != `pattern[' + j + ']` = `' + pattern[j] + '` -- mismatch, but `j` (' + j + ') is nonzero: `j = lps[' + (j - 1) + '] = ' + lps[j - 1] + '`. `i` STAYS PUT -- this text character is never re-read.'),
                 { c: [{ n: 4, note: T('eşleşme? hayır', 'match? no') }, { n: 10, note: T('j > 0? evet', 'j > 0? yes') }, 11], java: [{ n: 5, note: T('eşleşme? hayır', 'match? no') }, { n: 11, note: T('j > 0? evet', 'j > 0? yes') }, 12] });
          S.set('t' + i, { style: 'normal' });
          j = lps[j - 1];
        } else {
          S.set('t' + i, { style: 'del' }); S.set('p' + j, { style: 'del' });
          S.set('dec', { text: '`' + text[i] + '` != `' + pattern[j] + '`', style: 'del' });
          S.set('dec2', { text: T('j == 0 -> i bir artar', 'j == 0 -> i advances') });
          S.step(T('`text[' + i + ']` = `' + text[i] + '` != `pattern[0]` = `' + pattern[0] + '`, ve `j` zaten 0 -- geri düşülecek yer yok: yalnız `i` bir artar.',
                   '`text[' + i + ']` = `' + text[i] + '` != `pattern[0]` = `' + pattern[0] + '`, and `j` is already 0 -- nowhere to fall back to: only `i` advances.'),
                 { c: [{ n: 4, note: T('eşleşme? hayır', 'match? no') }, { n: 10, note: T('j > 0? hayır', 'j > 0? no') }, { n: 11, skip: true }, 13], java: [{ n: 5, note: T('eşleşme? hayır', 'match? no') }, { n: 11, note: T('j > 0? hayır', 'j > 0? no') }, { n: 12, skip: true }, 14] });
          S.set('t' + i, { style: 'dim' });
          i++;
        }
      }
      for (var pk = 0; pk < m; pk++) S.set('p' + pk, { style: 'normal' });
      S.at(null);
      S.set('dec', { text: '', style: 'normal' }); S.set('dec2', { text: '' });
      S.result = { occurrences: occ };
      S.step(T('Bitti: `i` yalnız ' + n + ' kez ilerledi (metin uzunluğu kadar), hiç geri gitmedi. ' + occ.length + ' oluşum bulundu (' + (occ.length ? occ.join(', ') : T('yok', 'none')) + '). Toplam süre **O(n + m)**.',
               'Done: `i` advanced exactly ' + n + ' times (the text\'s length), never going back. ' + occ.length + ' occurrence' + (occ.length === 1 ? '' : 's') + ' found (' + (occ.length ? occ.join(', ') : 'none') + '). Total time: **O(n + m)**.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
