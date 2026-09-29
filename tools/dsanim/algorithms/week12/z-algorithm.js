/* Week 12 -- Strings: Structures and Algorithms
 * The Z-algorithm answers a single question for every position i of a string S: "how many characters does
 * S[i..] share with S itself, starting from the very beginning?" -- that length is Z[i]. Computed once for
 * S = pattern + '#' + text (a separator that appears nowhere else), every position i in the text part with
 * Z[i] >= |pattern| marks a full occurrence of pattern there. The trick that makes this O(n): a running
 * window [l, r) remembers the rightmost match found SO FAR; when i falls inside that window, Z[i] can reuse
 * the already-known value Z[i-l] instead of comparing from scratch, and only the part that might stick out
 * past r is ever checked character by character. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int *z_array(const char *s, int n) {',
    '    int *z = calloc(n, sizeof(int));',
    '    int l = 0, r = 0;',
    '    for (int i = 1; i < n; i++) {',
    '        if (i < r)',
    '            z[i] = (r - i < z[i - l]) ? r - i : z[i - l];   /* reuse the [l,r) window */',
    '        while (i + z[i] < n && s[z[i]] == s[i + z[i]])',
    '            z[i]++;                                          /* extend by direct comparison */',
    '        if (i + z[i] > r) { l = i; r = i + z[i]; }            /* window grew: remember it */',
    '    }',
    '    return z;',
    '}',
    '',
    'void z_search(const char *pattern, int m, const char *text, int n, int occ[], int *count) {',
    '    char s[512]; sprintf(s, "%s#%s", pattern, text);         /* combined string */',
    '    int *z = z_array(s, m + 1 + n);',
    '    int c = 0;',
    '    for (int i = m + 1; i < m + 1 + n; i++)',
    '        if (z[i] >= m) occ[c++] = i - (m + 1);                /* Z[i] >= m: a full match */',
    '    *count = c;',
    '}'
  ];
  var JAVA = [
    'static int[] zArray(String s) {',
    '    int n = s.length();',
    '    int[] z = new int[n];',
    '    int l = 0, r = 0;',
    '    for (int i = 1; i < n; i++) {',
    '        if (i < r)',
    '            z[i] = Math.min(r - i, z[i - l]);   // reuse the [l,r) window',
    '        while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i]))',
    '            z[i]++;                              // extend by direct comparison',
    '        if (i + z[i] > r) { l = i; r = i + z[i]; }   // window grew: remember it',
    '    }',
    '    return z;',
    '}',
    '',
    'static int[] zSearch(String pattern, String text) {',
    '    int m = pattern.length(), n = text.length();',
    '    String s = pattern + "#" + text;                          // combined string',
    '    int[] z = zArray(s);',
    '    int[] occ = new int[n]; int c = 0;',
    '    for (int i = m + 1; i < m + 1 + n; i++)',
    '        if (z[i] >= m) occ[c++] = i - (m + 1);                 // Z[i] >= m: a full match',
    '    return Arrays.copyOf(occ, c);',
    '}'
  ];

  function zArray(s) {
    var n = s.length, z = new Array(n).fill(0), l = 0, r = 0;
    for (var i = 1; i < n; i++) {
      if (i < r) z[i] = Math.min(r - i, z[i - l]);
      while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;
      if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    return z;
  }

  /** Independent: recomputes the Z-array with its own loop, not shared with build(). */
  function reference(d) {
    var s = d.pattern + '#' + d.text, m = d.pattern.length, z = zArray(s), matches = [];
    for (var i = m + 1; i < s.length; i++) if (z[i] >= m) matches.push(i - (m + 1));
    return { matches: matches };
  }

  D.define({
    id: 'z-algorithm',
    title: T('Z algoritması: dizgiyi kendisiyle karşılaştırmak', 'The Z-algorithm: matching a string against itself'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('pattern="AB", text="ABABABABAB": dönemsel bir Z dizisi', 'pattern="AB", text="ABABABABAB": a periodic Z array'),
        data: { pattern: 'AB', text: 'ABABABABAB' } },
      { id: 'hard', level: 'hard', name: T('pattern="AAA", text="AAAAAAAAAA": pencere sürekli yeniden kullanılır', 'pattern="AAA", text="AAAAAAAAAA": the window is reused constantly'),
        data: { pattern: 'AAA', text: 'AAAAAAAAAA' } },
      { id: 'not-found', level: 'edge', name: T('pattern="XYZ", text="ABCDEFGHIJ": hiç eşleşme yok, Z hep küçük', 'pattern="XYZ", text="ABCDEFGHIJ": no match at all, Z stays small'),
        data: { pattern: 'XYZ', text: 'ABCDEFGHIJ' } },
      { id: 'match-at-start', level: 'edge', name: T('pattern="ABC", text="ABCDEFGHIJ": yalnız en baştaki konumda eşleşir', 'pattern="ABC", text="ABCDEFGHIJ": matches only at the very first position'),
        data: { pattern: 'ABC', text: 'ABCDEFGHIJ' } },
      { id: 'single-char', level: 'edge', name: T('pattern="A" (1 harf): m=1 sınır durumu, birçok eşleşme', 'pattern="A" (1 letter): the m=1 boundary case, many matches'),
        data: { pattern: 'A', text: 'BABABABABA' } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.text.length; },
    reference: reference,
    random: function (level, r) {
      var alpha = level === 'easy' ? 6 : (level === 'normal' ? 4 : (level === 'hard' ? 2 : 3));
      var n = D.randInt(r, 10, level === 'extreme' ? 13 : 11), text = '', i;
      for (i = 0; i < n; i++) text += String.fromCharCode(65 + D.randInt(r, 0, alpha - 1));
      var m = D.randInt(r, 1, 4), start = D.randInt(r, 0, n - m);
      var pattern = r() < 0.6 ? text.slice(start, start + m) : (function () { var s = ''; for (var k = 0; k < m; k++) s += String.fromCharCode(65 + D.randInt(r, 0, alpha - 1)); return s; })();
      return { pattern: pattern, text: text };
    },
    input: {
      hint: T('Örnek: pattern=AB text=ABABABABAB  (yalnız A-Z, "#" hiç kullanmayın; metin >= 10 harf)',
              'Example: pattern=AB text=ABABABABAB  (letters A-Z only, never use "#"; text >= 10 letters)'),
      parse: function (text) {
        var t = null, p = null;
        String(text).trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
          var tm = /^text[=:]([A-Za-z]+)$/i.exec(tok); if (tm) { t = tm[1].toUpperCase(); return; }
          var pm = /^pattern[=:]([A-Za-z]+)$/i.exec(tok); if (pm) { p = pm[1].toUpperCase(); return; }
          throw T('"' + tok + '" anlaşılmadı: pattern=... ve text=... yazın.', '"' + tok + '" is not understood: write pattern=... and text=....');
        });
        if (!p) throw T('pattern=... yazmalısınız.', 'You must write pattern=....');
        if (!t) throw T('text=... yazmalısınız.', 'You must write text=....');
        if (p.length < 1 || p.length > t.length) throw T('pattern 1 harf ile text uzunluğu arasında olmalı.', 'pattern must be between 1 letter and the length of text.');
        if (t.length < 10 || t.length > 18) throw T('text 10 ile 18 harf arasında olmalı.', 'text must be between 10 and 18 letters.');
        return { pattern: p, text: t };
      },
      format: function (d) { return 'pattern=' + d.pattern + ' text=' + d.text; },
      bad: ['', 'pattern=AB text=ABC', 'ABABABABAB', 'text=ABABABABAB', 'pattern=ABC# text=ABABABABAB', 'pattern=ab text=abab123abc'],
      tokens: function (d) { return (d.pattern + '#' + d.text).split(''); }
    },
    build: function (S, d) {
      var pattern = d.pattern, text = d.text, m = pattern.length, s = pattern + '#' + text, N = s.length;
      var W = 30, H = 32, X0 = 130, Y0S = 130, Y0Z = 190;
      S.label('slbl', { x: X0 - 16, y: Y0S + H / 2 + 5, text: 'S[] =', anchor: 'end', bold: true, size: 15 });
      for (var si = 0; si < N; si++) S.box('s' + si, { x: X0 + si * W, y: Y0S, w: 24, h: H, text: s[si], style: si === m ? 'dim' : 'normal', size: 13, above: String(si) });
      S.label('zlbl', { x: X0 - 16, y: Y0Z + H / 2 + 5, text: 'Z[] =', anchor: 'end', bold: true, size: 15 });
      for (var zi = 0; zi < N; zi++) S.box('z' + zi, { x: X0 + zi * W, y: Y0Z, w: 24, h: H, text: '', style: 'empty', size: 13 });
      var RX = X0 + N * W + 30;
      S.label('info1', { x: X0, y: 40, text: T('pattern="' + pattern + '"  text="' + text + '"  (birleşik: S = pattern + # + text)', 'pattern="' + pattern + '"  text="' + text + '"  (combined: S = pattern + # + text)'), size: 13, style: 'dim' });
      S.label('dec', { x: RX, y: Y0S, text: '', size: 15, bold: true, anchor: 'start' });
      S.label('dec2', { x: RX, y: Y0S + 24, text: '', size: 12, anchor: 'start', style: 'dim' });

      var z = new Array(N).fill(0), l = 0, r = 0;
      S.step(T('`S = "' + s + '"` (uzunluk ' + N + '). `Z[0]` hiç kullanılmaz; `i = 1`\'den başlarız, pencere `[l, r) = [0, 0)` -- boş.',
               '`S = "' + s + '"` (length ' + N + '). `Z[0]` is never used; we start at `i = 1`, window `[l, r) = [0, 0)` -- empty.'),
             { c: [1, 2, 3], java: [1, 2, 3, 4] });

      for (var i = 1; i < N; i++) {
        S.at(i);
        var reused = i < r;
        var initVal = reused ? Math.min(r - i, z[i - l]) : 0;
        z[i] = initVal;
        var extendCount = 0;
        while (i + z[i] < N && s[z[i]] === s[i + z[i]]) { z[i]++; extendCount++; }
        S.set('z' + i, { text: String(z[i]), style: 'new' });
        var linesC, linesJ;
        var reuseLine = reused ? [{ n: 5, note: T('i < r? evet', 'i < r? yes') }, { n: 6, note: (r - i < z[i - l]) ? T('r-i < Z[i-l]? evet', 'r-i < Z[i-l]? yes') : T('r-i < Z[i-l]? hayır', 'r-i < Z[i-l]? no') }] : [{ n: 5, note: T('i < r? hayır', 'i < r? no'), }];
        var reuseLineJ = reused ? [{ n: 6, note: T('i < r? evet', 'i < r? yes') }, 7] : [{ n: 6, note: T('i < r? hayır', 'i < r? no') }];
        var extLines = [], extLinesJ = [];
        for (var e = 0; e < extendCount; e++) { extLines.push({ n: 7, note: T('eşleşti, devam', 'matches, continue') }, 8); extLinesJ.push({ n: 8, note: T('eşleşti, devam', 'matches, continue') }, 9); }
        extLines.push({ n: 7, note: T('devam? hayır, dur', 'continue? no, stop') });
        extLinesJ.push({ n: 8, note: T('devam? hayır, dur', 'continue? no, stop') });
        linesC = reuseLine.concat(extLines);
        linesJ = reuseLineJ.concat(extLinesJ);
        var grew = i + z[i] > r;
        if (grew) { l = i; r = i + z[i]; linesC.push({ n: 9, note: T('i+Z[i] > r? evet', 'i+Z[i] > r? yes') }); linesJ.push({ n: 10, note: T('i+Z[i] > r? evet', 'i+Z[i] > r? yes') }); }
        S.set('dec', { text: 'Z[' + i + '] = ' + z[i], style: 'new' });
        S.set('dec2', { text: grew ? T('pencere -> [' + l + ', ' + r + ')', 'window -> [' + l + ', ' + r + ')') : T('pencere değişmedi', 'window unchanged') });
        S.step(T('`i = ' + i + '`: ' + (reused ? '`i < r` (' + i + ' < ' + r + ') -- pencereden `min(r-i, Z[i-l]) = ' + initVal + '` ile başlarız, ' : '`i >= r` -- 0\'dan başlarız, ') + (extendCount ? extendCount + ' doğrudan karşılaştırmayla ' : 'hiç ek karşılaştırma gerekmeden ') + '`Z[' + i + '] = ' + z[i] + '` bulunur.' + (grew ? ' Pencere büyüdü: `[l,r) = [' + l + ', ' + r + ')`.' : ''),
                 '`i = ' + i + '`: ' + (reused ? '`i < r` (' + i + ' < ' + r + (grew ? ')' : ')') + ' -- reuse the window, start at `min(r-i, Z[i-l]) = ' + initVal + '`, ' : '`i >= r` -- start at 0, ') + (extendCount ? extendCount + ' direct comparison' + (extendCount === 1 ? '' : 's') + ' find ' : 'no further comparison needed, ') + '`Z[' + i + '] = ' + z[i] + '`.' + (grew ? ' The window grew: `[l,r) = [' + l + ', ' + r + ')`.' : '')),
               { c: linesC, java: linesJ });
      }

      S.at(null);
      S.set('dec', { text: '', style: 'normal' }); S.set('dec2', { text: '' });
      var matches = [];
      for (var mi = m + 1; mi < N; mi++) if (z[mi] >= m) matches.push(mi - (m + 1));
      S.result = { matches: matches };
      S.step(T('Bitti: `Z[] = [' + z.join(', ') + ']`. `text` kısmında `Z[i] >= ' + m + '` olan konumlar `pattern`\'in oluşumlarıdır: ' + (matches.length ? matches.join(', ') : T('yok', 'none')) + '. Toplam süre **O(n + m)**.',
               'Done: `Z[] = [' + z.join(', ') + ']`. Positions in the text part with `Z[i] >= ' + m + '` are occurrences of `pattern`: ' + (matches.length ? matches.join(', ') : 'none') + '. Total time **O(n + m)**.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
