/* Week 12 -- Strings: Structures and Algorithms
 * Boyer-Moore, bad-character rule only: unlike naive/KMP, the pattern is compared against each window
 * RIGHT TO LEFT. On a mismatch at pattern position j against text character `ch`, look up `ch`'s LAST
 * occurrence in the pattern (precomputed once): if `ch` never appears in the pattern at all, the whole
 * pattern can safely jump PAST it (shift = j + 1, the biggest possible jump); if it appears but to the left
 * of j, the pattern shifts just far enough to line that occurrence up under `ch`. The shift is never allowed
 * to be less than 1 (a negative or zero "shift" would mean going backward or standing still). This is only
 * the bad-character rule -- the full Boyer-Moore algorithm adds a second "good suffix" rule on top of it. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'void bad_char_table(const char *pattern, int m, int last[256]) {',
    '    for (int c = 0; c < 256; c++) last[c] = -1;',
    '    for (int j = 0; j < m; j++) last[(unsigned char) pattern[j]] = j;',
    '}',
    '',
    'void boyer_moore_bad_char(const char *text, int n, const char *pattern, int m, const int last[256], int occ[], int *count) {',
    '    int s = 0, c = 0;',
    '    while (s <= n - m) {',
    '        int j = m - 1;',
    '        while (j >= 0 && pattern[j] == text[s + j]) j--;     /* compare RIGHT to LEFT */',
    '        if (j < 0) {',
    '            occ[c++] = s;                 /* full match at shift s */',
    '            s += 1;',
    '        } else {',
    '            int lo = last[(unsigned char) text[s + j]];',
    '            int shift = j - lo;',
    '            s += shift > 1 ? shift : 1;   /* always advance by at least 1 */',
    '        }',
    '    }',
    '    *count = c;',
    '}'
  ];
  var JAVA = [
    'static Map<Character, Integer> badCharTable(String pattern) {',
    '    Map<Character, Integer> last = new HashMap<>();',
    '    for (int j = 0; j < pattern.length(); j++) last.put(pattern.charAt(j), j);',
    '    return last;',
    '}',
    '',
    'static int[] boyerMooreBadChar(String text, String pattern, Map<Character, Integer> last) {',
    '    int n = text.length(), m = pattern.length(), s = 0, c = 0;',
    '    int[] occ = new int[n];',
    '    while (s <= n - m) {',
    '        int j = m - 1;',
    '        while (j >= 0 && pattern.charAt(j) == text.charAt(s + j)) j--;   // compare RIGHT to LEFT',
    '        if (j < 0) {',
    '            occ[c++] = s;                 // full match at shift s',
    '            s += 1;',
    '        } else {',
    '            int lo = last.getOrDefault(text.charAt(s + j), -1);',
    '            int shift = j - lo;',
    '            s += shift > 1 ? shift : 1;   // always advance by at least 1',
    '        }',
    '    }',
    '    return Arrays.copyOf(occ, c);',
    '}'
  ];

  /** Independent right-to-left scan; recomputes lastOcc with String.lastIndexOf, not shared with build(). */
  function reference(d) {
    var text = d.text, pattern = d.pattern, n = text.length, m = pattern.length, s = 0, occ = [];
    while (s <= n - m) {
      var j = m - 1;
      while (j >= 0 && pattern[j] === text[s + j]) j--;
      if (j < 0) { occ.push(s); s += 1; }
      else {
        var lo = pattern.lastIndexOf(text[s + j]);
        var shift = j - lo;
        s += shift > 1 ? shift : 1;
      }
    }
    return { occurrences: occ };
  }

  D.define({
    id: 'boyer-moore-bad-character',
    title: T('Boyer-Moore: kötü karakter kuralı', 'Boyer-Moore: the bad-character rule'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('text="ABAAABCDAB", pattern="ABC": karışık atlamalar', 'text="ABAAABCDAB", pattern="ABC": mixed-size jumps'),
        data: { text: 'ABAAABCDAB', pattern: 'ABC' } },
      { id: 'hard', level: 'hard', name: T('text="AAAAAAAAAA", pattern="AAAB": düşük çeşitlilik, zayıf atlamalar', 'text="AAAAAAAAAA", pattern="AAAB": low diversity, weak jumps'),
        data: { text: 'AAAAAAAAAA', pattern: 'AAAB' } },
      { id: 'not-found', level: 'edge', name: T('text="THEQUICKBROWNFOX", pattern="ZEBRA": hiç bulunmaz', 'text="THEQUICKBROWNFOX", pattern="ZEBRA": never found'),
        data: { text: 'THEQUICKBROWNFOX', pattern: 'ZEBRA' } },
      { id: 'max-jump', level: 'edge', name: T('text="ZZZZZZZZZZ", pattern="ABC": Z örüntüde yok -- her seferinde en büyük atlama', 'text="ZZZZZZZZZZ", pattern="ABC": Z is not in the pattern -- the biggest possible jump every time'),
        data: { text: 'ZZZZZZZZZZ', pattern: 'ABC' } },
      { id: 'match-at-end', level: 'edge', name: T('text="XXXXXXXABC", pattern="ABC": eşleşme sona yakın', 'text="XXXXXXXABC", pattern="ABC": the match is near the end'),
        data: { text: 'XXXXXXXABC', pattern: 'ABC' } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.text.length; },
    reference: reference,
    random: function (level, r) {
      var alpha = level === 'easy' ? 10 : (level === 'normal' ? 6 : (level === 'hard' ? 3 : 2));
      var n = D.randInt(r, 10, level === 'extreme' ? 14 : 12), text = '', i;
      for (i = 0; i < n; i++) text += String.fromCharCode(65 + D.randInt(r, 0, alpha - 1));
      var m = D.randInt(r, 3, 5), start = D.randInt(r, 0, n - m);
      var pattern = r() < 0.5 ? text.slice(start, start + m) : (function () { var s = ''; for (var k = 0; k < m; k++) s += String.fromCharCode(65 + D.randInt(r, 0, alpha - 1)); return s; })();
      return { text: text, pattern: pattern };
    },
    input: {
      hint: T('Örnek: text=ABAAABCDAB pattern=ABC  (yalnız A-Z; metin >= 10, örüntü 2-8 harf)',
              'Example: text=ABAAABCDAB pattern=ABC  (letters A-Z only; text >= 10, pattern 2-8 letters)'),
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
      bad: ['', 'text=ABC pattern=AB', 'ABAAABCDAB', 'text=ABAAABCDAB', 'pattern=ABC text=ABAAABCDAB12', 'text=abab123 pattern=ab'],
      tokens: function (d) { return d.text.split(''); }
    },
    build: function (S, d) {
      var text = d.text, pattern = d.pattern, n = text.length, m = pattern.length, W = 34, H = 34, X0 = 110, Y0T = 90, Y0P = 150;
      S.label('trow', { x: X0 - 16, y: Y0T + H / 2 + 5, text: 'text[] =', anchor: 'end', bold: true, size: 15 });
      for (var ti = 0; ti < n; ti++) S.box('t' + ti, { x: X0 + ti * W, y: Y0T, w: 28, h: H, text: text[ti], style: 'normal', size: 15, above: String(ti) });
      S.label('prow', { x: X0 - 16, y: Y0P + H / 2 + 5, text: 'pattern[] =', anchor: 'end', bold: true, size: 15 });
      for (var pj = 0; pj < m; pj++) S.box('p' + pj, { x: X0 + pj * W, y: Y0P, w: 28, h: H, text: pattern[pj], style: 'normal', size: 15, above: String(pj) });
      var RX = X0 + Math.max(n, m) * W + 40;
      S.label('shiftlbl', { x: X0, y: Y0P + H + 34, text: 'shift s = 0', bold: true, mono: true, size: 15 });
      S.label('dec', { x: RX, y: Y0T, text: '', size: 15, bold: true, anchor: 'start' });
      S.label('dec2', { x: RX, y: Y0T + 24, text: '', size: 12, anchor: 'start', style: 'dim' });

      var lastMap = {};
      for (var lj = 0; lj < m; lj++) lastMap[pattern[lj]] = lj;
      var legend = Object.keys(lastMap).sort().map(function (c) { return c + '=' + lastMap[c]; }).join(' ');
      S.step(T('Kötü karakter tablosu (yalnız örüntüdeki harfler için): `last[c]` = o harfin örüntüdeki EN SAĞDAKİ konumu. `' + legend + '` (yoksa -1).',
               'Bad-character table (only for letters that appear in the pattern): `last[c]` = that letter\'s RIGHTMOST position in the pattern. `' + legend + '` (else -1).'),
             { c: [1, { n: 2, note: T('c = 0..255', 'c = 0..255') }, { n: 3, note: T('j = 0..' + (m - 1), 'j = 0..' + (m - 1)) }],
               java: [1, 2, { n: 3, note: T('j = 0..' + (m - 1), 'j = 0..' + (m - 1)) }] });

      var occ = [], lastTouched = [];
      var s = 0;
      while (s <= n - m) {
        S.at(s);
        lastTouched.forEach(function (idx) { S.set('t' + idx, { style: 'normal' }); });
        lastTouched = [];
        for (var pk = 0; pk < m; pk++) S.set('p' + pk, { x: X0 + (s + pk) * W, style: 'normal' });
        S.set('shiftlbl', { text: 'shift s = ' + s });
        var j = m - 1;
        while (j >= 0) {
          S.set('t' + (s + j), { style: 'active' }); S.set('p' + j, { style: 'active' });
          lastTouched.push(s + j);
          if (pattern[j] === text[s + j]) {
            S.set('t' + (s + j), { style: 'new' }); S.set('p' + j, { style: 'new' });
            S.set('dec', { text: '`' + pattern[j] + '` == `' + text[s + j] + '`', style: 'new' });
            S.step(T('sağdan sola, `pattern[' + j + ']` = `' + pattern[j] + '` == `text[' + (s + j) + ']` -- eşleşti, sola devam.', 'right to left, `pattern[' + j + ']` = `' + pattern[j] + '` == `text[' + (s + j) + ']` -- matches, continue leftward.'),
                   { c: [{ n: 10, note: T('eşleşme? evet, j--', 'match? yes, j--') }], java: [{ n: 12, note: T('eşleşme? evet, j--', 'match? yes, j--') }] });
            j--;
          } else {
            S.set('t' + (s + j), { style: 'del' }); S.set('p' + j, { style: 'del' });
            S.set('dec', { text: '`' + pattern[j] + '` != `' + text[s + j] + '`', style: 'del' });
            S.step(T('`pattern[' + j + ']` = `' + pattern[j] + '` != `text[' + (s + j) + ']` = `' + text[s + j] + '` -- uyuşmazlık, bu pencere bitti.', '`pattern[' + j + ']` = `' + pattern[j] + '` != `text[' + (s + j) + ']` = `' + text[s + j] + '` -- mismatch, this window is done.'),
                   { c: [{ n: 10, note: T('eşleşme? hayır', 'match? no') }], java: [{ n: 12, note: T('eşleşme? hayır', 'match? no') }] });
            break;
          }
        }
        if (j < 0) {
          occ.push(s);
          S.set('dec2', { text: T('tüm örüntü eşleşti -- bulundu!', 'the whole pattern matched -- found!'), style: 'new' });
          S.step(T('`j < 0`: örüntünün tamamı eşleşti -- **s = ' + s + '\'te bulundu**. `s` bir artar.', '`j < 0`: the whole pattern matched -- **found at s = ' + s + '**. `s` advances by one.'),
                 { c: [{ n: 11, note: T('j < 0? evet', 'j < 0? yes') }, 12, 13, { n: 15, skip: true }, { n: 16, skip: true }, { n: 17, skip: true }],
                   java: [{ n: 13, note: T('j < 0? evet', 'j < 0? yes') }, 14, 15, { n: 17, skip: true }, { n: 18, skip: true }, { n: 19, skip: true }] });
          s += 1;
        } else {
          var ch = text[s + j], lo = lastMap.hasOwnProperty(ch) ? lastMap[ch] : -1;
          var shift = j - lo; if (shift < 1) shift = 1;
          S.set('dec2', { text: T('last[' + ch + ']=' + lo + ' -> atla ' + shift, 'last[' + ch + ']=' + lo + ' -> shift ' + shift) });
          S.step(T('`text[' + (s + j) + ']` = `' + ch + '`, `last[' + ch + ']` = ' + lo + (lo === -1 ? T(' (örüntüde hiç yok!)', ' (not in the pattern at all!)') : '') + ' -- `shift = ' + j + ' - ' + lo + ' = ' + shift + '`. Örüntü ' + shift + ' konum kaydırılır.',
                   '`text[' + (s + j) + ']` = `' + ch + '`, `last[' + ch + ']` = ' + lo + (lo === -1 ? ' (not in the pattern at all!)' : '') + ' -- `shift = ' + j + ' - ' + lo + ' = ' + shift + '`. The pattern shifts by ' + shift + ' position' + (shift === 1 ? '' : 's') + '.'),
                 { c: [{ n: 11, note: T('j < 0? hayır', 'j < 0? no') }, { n: 12, skip: true }, { n: 13, skip: true }, 15, 16, { n: 17, note: T(shift + ' > 1? ' + (shift > 1 ? 'evet' : 'hayır'), shift + ' > 1? ' + (shift > 1 ? 'yes' : 'no')) }],
                   java: [{ n: 13, note: T('j < 0? hayır', 'j < 0? no') }, { n: 14, skip: true }, { n: 15, skip: true }, 17, 18, { n: 19, note: T(shift + ' > 1? ' + (shift > 1 ? 'evet' : 'hayır'), shift + ' > 1? ' + (shift > 1 ? 'yes' : 'no')) }] });
          s += shift;
        }
      }
      lastTouched.forEach(function (idx) { S.set('t' + idx, { style: 'normal' }); });
      S.at(null);
      S.set('dec', { text: '', style: 'normal' }); S.set('dec2', { text: '' });
      S.result = { occurrences: occ };
      S.step(T('Bitti: ' + occ.length + ' oluşum bulundu (' + (occ.length ? occ.join(', ') : T('yok', 'none')) + '). Kötü karakter kuralı, geniş alfabede sık büyük atlamalar sağlar -- en iyi durumda O(n/m).',
               'Done: ' + occ.length + ' occurrence' + (occ.length === 1 ? '' : 's') + ' found (' + (occ.length ? occ.join(', ') : 'none') + '). The bad-character rule gives frequent large jumps on a rich alphabet -- best case O(n/m).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
