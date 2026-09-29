/* Week 12 -- Strings: Structures and Algorithms
 * The KMP "failure function" (also called the partial-match table, lps[] -- "longest proper prefix that is
 * also a suffix"): for every prefix pattern[0..i] of the pattern, lps[i] is the length of the longest proper
 * prefix of that prefix which is ALSO a suffix of it. This table is what lets KMP search (next animation) skip
 * ahead on a mismatch without ever re-examining a text character it has already looked at. It is built by
 * comparing the pattern against ITSELF: two pointers, `i` (the prefix we are extending) and `len` (the current
 * matched prefix-suffix length); on a mismatch, `len` falls back to `lps[len-1]` instead of resetting to 0 --
 * this is the one-time-cost trick that makes computing the whole table only O(m). */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'void compute_lps(const char *pattern, int m, int lps[]) {',
    '    lps[0] = 0;',
    '    int len = 0, i = 1;',
    '    while (i < m) {',
    '        if (pattern[i] == pattern[len]) {',
    '            len++;',
    '            lps[i] = len;',
    '            i++;',
    '        } else if (len != 0) {',
    '            len = lps[len - 1];       /* fall back, do NOT advance i */',
    '        } else {',
    '            lps[i] = 0;',
    '            i++;',
    '        }',
    '    }',
    '}'
  ];
  var JAVA = [
    'static int[] computeLps(String pattern) {',
    '    int m = pattern.length();',
    '    int[] lps = new int[m];',
    '    int len = 0, i = 1;',
    '    while (i < m) {',
    '        if (pattern.charAt(i) == pattern.charAt(len)) {',
    '            len++;',
    '            lps[i] = len;',
    '            i++;',
    '        } else if (len != 0) {',
    '            len = lps[len - 1];       // fall back, do NOT advance i',
    '        } else {',
    '            lps[i] = 0;',
    '            i++;',
    '        }',
    '    }',
    '    return lps;',
    '}'
  ];

  /** Independent computation, written as its own loop (not shared with build()). */
  function reference(d) {
    var p = d.pattern, m = p.length, lps = new Array(m).fill(0), len = 0, i = 1;
    while (i < m) {
      if (p[i] === p[len]) { len++; lps[i] = len; i++; }
      else if (len !== 0) { len = lps[len - 1]; }
      else { lps[i] = 0; i++; }
    }
    return { lps: lps };
  }

  D.define({
    id: 'kmp-failure-function',
    title: T('KMP başarısızlık işlevi (lps[] tablosu)', 'KMP failure function (the lps[] table)'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('"ABABCABABA": karışık büyüme ve geri düşüş', '"ABABCABABA": mixed growth and fallback'),
        data: { pattern: 'ABABCABABA' } },
      { id: 'hard', level: 'hard', name: T('"AAAAAAAAAA": her adımda büyüme, lps[i] = i', '"AAAAAAAAAA": grows at every step, lps[i] = i'),
        data: { pattern: 'AAAAAAAAAA' } },
      { id: 'no-repeat', level: 'edge', name: T('"ABCDEFGHIJ": hiç tekrar yok, lps hep 0', '"ABCDEFGHIJ": no repetition at all, lps is always 0'),
        data: { pattern: 'ABCDEFGHIJ' } },
      { id: 'oscillating', level: 'edge', name: T('"ABABABABAB": sürekli salınan bir örüntü', '"ABABABABAB": a constantly oscillating pattern'),
        data: { pattern: 'ABABABABAB' } },
      { id: 'multilevel-fallback', level: 'edge', name: T('"AABAACAABAA": geri düşüş bir zincir izler (lps[len-1])', '"AABAACAABAA": the fallback chases a chain (lps[len-1])'),
        data: { pattern: 'AABAACAABAA' } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.pattern.length; },
    reference: reference,
    random: function (level, r) {
      var alpha = level === 'easy' ? 6 : (level === 'normal' ? 4 : (level === 'hard' ? 2 : 3));
      var n = D.randInt(r, 10, level === 'extreme' ? 14 : 11), s = '';
      for (var i = 0; i < n; i++) s += String.fromCharCode(65 + D.randInt(r, 0, alpha - 1));
      return { pattern: s };
    },
    input: {
      hint: T('Örnek: ABABCABABA  (10-16 harf, yalnız A-Z)', 'Example: ABABCABABA  (10-16 letters, A-Z only)'),
      parse: function (text) {
        var s = String(text).trim().toUpperCase();
        if (!/^[A-Z]+$/.test(s)) throw T('Yalnız A-Z harfleri kullanın, boşluksuz.', 'Use only letters A-Z, no spaces.');
        if (s.length < 10 || s.length > 20) throw T('Örüntü 10 ile 20 harf arasında olmalı.', 'The pattern must be between 10 and 20 letters.');
        return { pattern: s };
      },
      format: function (d) { return d.pattern; },
      bad: ['', 'ABC', 'AB AB', 'ab12ab12ab', 'THISPATTERNISFARTOOLONGFORTHISDEMOOK', '1234567890'],
      tokens: function (d) { return d.pattern.split(''); }
    },
    build: function (S, d) {
      var p = d.pattern, m = p.length, W = 36, H = 36, X0 = 110, Y0P = 90, Y0L = 160;
      S.label('prow', { x: X0 - 16, y: Y0P + H / 2 + 5, text: 'pattern[] =', anchor: 'end', bold: true, size: 15 });
      for (var i0 = 0; i0 < m; i0++) S.box('p' + i0, { x: X0 + i0 * W, y: Y0P, w: 30, h: H, text: p[i0], style: 'normal', size: 16, above: String(i0) });
      S.label('lrow', { x: X0 - 16, y: Y0L + H / 2 + 5, text: 'lps[] =', anchor: 'end', bold: true, size: 15 });
      for (var i1 = 0; i1 < m; i1++) S.box('l' + i1, { x: X0 + i1 * W, y: Y0L, w: 30, h: H, text: '', style: 'empty', size: 16, above: String(i1) });
      var RX = X0 + m * W + 40;
      S.label('dec', { x: RX, y: Y0P, text: '', size: 15, bold: true, anchor: 'start' });
      S.label('dec2', { x: RX, y: Y0P + 24, text: '', size: 12, anchor: 'start', style: 'dim' });

      var lps = new Array(m).fill(0);
      S.set('l0', { text: '0', style: 'new' });
      S.pointer('ip', { target: 'p0', text: 'i', side: 'bottom', dist: 30, style: 'active' });
      S.step(T('`lps[0] = 0` her zaman -- tek karakterlik bir önekin özdeş olmayan bir soneki olamaz.',
               '`lps[0] = 0` always -- a single-character prefix cannot have a proper suffix equal to itself.'),
             { c: [1, 2, 3], java: [1, 2, 3, 4] });
      S.set('l0', { style: 'empty' });

      var len = 0, i = 1;
      while (i < m) {
        S.at(i);
        S.set('ip', { target: 'p' + i });
        if (len > 0) { if (!S.has('lenp')) S.pointer('lenp', { target: 'p' + len, text: 'len', side: 'top', dist: 30, style: 'hl' }); else S.set('lenp', { target: 'p' + len }); }
        else if (S.has('lenp')) S.remove('lenp');
        var lenBefore = len;
        S.set('p' + i, { style: 'active' }); if (lenBefore < m) S.set('p' + lenBefore, { style: 'active' });
        if (p[i] === p[len]) {
          len++;
          lps[i] = len;
          S.set('l' + i, { text: String(len), style: 'new' });
          S.set('dec', { text: '`' + p[i] + '` == `' + p[len - 1] + '`', style: 'new' });
          S.set('dec2', { text: T('len -> ' + len, 'len -> ' + len) });
          S.step(T('`pattern[' + i + ']` = `' + p[i] + '`, `pattern[len]` = `' + p[len - 1] + '` -- eşleşiyor: `len` bir artar (' + len + '), `lps[' + i + '] = ' + len + '`.',
                   '`pattern[' + i + ']` = `' + p[i] + '`, `pattern[len]` = `' + p[len - 1] + '` -- match: `len` grows by one (' + len + '), `lps[' + i + '] = ' + len + '`.'),
                 { c: [{ n: 5, note: T('eşleşme? evet', 'match? yes') }, 6, 7, 8], java: [{ n: 6, note: T('eşleşme? evet', 'match? yes') }, 7, 8, 9] });
          S.set('p' + i, { style: 'normal' }); S.set('p' + lenBefore, { style: 'normal' });
          i++;
        } else if (len !== 0) {
          S.set('dec', { text: '`' + p[i] + '` != `' + p[len] + '`', style: 'del' });
          S.set('dec2', { text: T('len != 0 -> lps[len-1] = ' + lps[len - 1], 'len != 0 -> lps[len-1] = ' + lps[len - 1]) });
          S.step(T('`pattern[' + i + ']` = `' + p[i] + '` != `pattern[len]` = `' + p[len] + '` -- uyuşmazlık, ama `len` (' + len + ') sıfır değil: sıfıra değil, `lps[len-1] = lps[' + (len - 1) + '] = ' + lps[len - 1] + '`\'e geri düşeriz. `i` İLERLEMEZ.',
                   '`pattern[' + i + ']` = `' + p[i] + '` != `pattern[len]` = `' + p[len] + '` -- mismatch, but `len` (' + len + ') is nonzero: instead of resetting to 0, we fall back to `lps[len-1] = lps[' + (len - 1) + '] = ' + lps[len - 1] + '`. `i` does NOT advance.'),
                 { c: [{ n: 5, note: T('eşleşme? hayır', 'match? no') }, { n: 9, note: T('len != 0? evet', 'len != 0? yes') }, 10, { n: 12, skip: true }, { n: 13, skip: true }], java: [{ n: 6, note: T('eşleşme? hayır', 'match? no') }, { n: 10, note: T('len != 0? evet', 'len != 0? yes') }, 11, { n: 13, skip: true }, { n: 14, skip: true }] });
          S.set('p' + i, { style: 'normal' }); S.set('p' + lenBefore, { style: 'normal' });
          len = lps[len - 1];
        } else {
          lps[i] = 0;
          S.set('l' + i, { text: '0', style: 'new' });
          S.set('dec', { text: '`' + p[i] + '` != `' + p[len] + '`', style: 'del' });
          S.set('dec2', { text: T('len == 0 -> lps[' + i + '] = 0', 'len == 0 -> lps[' + i + '] = 0') });
          S.step(T('`pattern[' + i + ']` = `' + p[i] + '` != `pattern[0]` = `' + p[0] + '`, ve `len` zaten 0 -- daha geri düşülemez: `lps[' + i + '] = 0`, `i` bir artar.',
                   '`pattern[' + i + ']` = `' + p[i] + '` != `pattern[0]` = `' + p[0] + '`, and `len` is already 0 -- there is nowhere further to fall back: `lps[' + i + '] = 0`, `i` advances.'),
                 { c: [{ n: 5, note: T('eşleşme? hayır', 'match? no') }, { n: 9, note: T('len != 0? hayır', 'len != 0? no') }, { n: 10, skip: true }, 12, 13], java: [{ n: 6, note: T('eşleşme? hayır', 'match? no') }, { n: 10, note: T('len != 0? hayır', 'len != 0? no') }, { n: 11, skip: true }, 13, 14] });
          S.set('p' + i, { style: 'normal' }); S.set('p' + lenBefore, { style: 'normal' });
          i++;
        }
      }
      if (S.has('lenp')) S.remove('lenp');
      S.remove('ip');
      S.at(null);
      S.set('dec', { text: '', style: 'normal' }); S.set('dec2', { text: '' });
      S.result = { lps: lps };
      S.step(T('Bitti: `lps[] = [' + lps.join(', ') + ']`. Bu tablo O(m) sürede kuruldu ve KMP aramasının metni asla geri sarmamasını sağlayacak.',
               'Done: `lps[] = [' + lps.join(', ') + ']`. This table was built in O(m) and will let KMP search never rewind through the text.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
