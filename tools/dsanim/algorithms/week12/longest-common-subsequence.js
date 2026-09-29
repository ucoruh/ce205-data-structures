/* Week 12 -- Strings: Structures and Algorithms
 * Longest common subsequence (LCS): the longest sequence of characters that appears, in order but not
 * necessarily contiguously, in both `a` and `b`. The DP table dp[i][j] holds the LCS length of a's first i
 * characters and b's first j characters; row 0 and column 0 are 0 (an empty string shares nothing with
 * anything). Every other cell looks at just one or two neighbors: if the two characters being considered
 * match, the LCS extends the DIAGONAL neighbor by one; otherwise it is the BETTER of the neighbor above
 * (drop a's character) and the neighbor to the left (drop b's character) -- no character is added, no cost is
 * paid, we simply carry the better answer forward. Walking backward from the bottom-right corner reconstructs
 * one actual longest common subsequence, one character at a time. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int lcs_length(const char *a, int n, const char *b, int m, int dp[MAXN][MAXM]) {',
    '    for (int i = 0; i <= n; i++) dp[i][0] = 0;',
    '    for (int j = 0; j <= m; j++) dp[0][j] = 0;',
    '    for (int i = 1; i <= n; i++) {',
    '        for (int j = 1; j <= m; j++) {',
    '            if (a[i - 1] == b[j - 1])',
    '                dp[i][j] = dp[i - 1][j - 1] + 1;         /* extend the diagonal by one */',
    '            else',
    '                dp[i][j] = dp[i-1][j] >= dp[i][j-1] ? dp[i-1][j] : dp[i][j-1];   /* better neighbor */',
    '        }',
    '    }',
    '    return dp[n][m];',
    '}',
    '',
    'void traceback(const char *a, int n, const char *b, int m, int dp[MAXN][MAXM], char out[]) {',
    '    int i = n, j = m, k = dp[n][m];',
    '    out[k] = \'\\0\';',
    '    while (i > 0 && j > 0) {',
    '        if (a[i - 1] == b[j - 1]) { out[--k] = a[i - 1]; i--; j--; }     /* part of the LCS */',
    '        else if (dp[i - 1][j] >= dp[i][j - 1]) i--;                      /* came from above */',
    '        else j--;                                                        /* came from the left */',
    '    }',
    '}'
  ];
  var JAVA = [
    'static int lcsLength(String a, String b, int[][] dp) {',
    '    int n = a.length(), m = b.length();',
    '    for (int i = 0; i <= n; i++) dp[i][0] = 0;',
    '    for (int j = 0; j <= m; j++) dp[0][j] = 0;',
    '    for (int i = 1; i <= n; i++) {',
    '        for (int j = 1; j <= m; j++) {',
    '            if (a.charAt(i - 1) == b.charAt(j - 1))',
    '                dp[i][j] = dp[i - 1][j - 1] + 1;         // extend the diagonal by one',
    '            else',
    '                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);   // better neighbor',
    '        }',
    '    }',
    '    return dp[n][m];',
    '}',
    '',
    'static String traceback(String a, String b, int[][] dp) {',
    '    int i = a.length(), j = b.length(), k = dp[i][j];',
    '    char[] out = new char[k];',
    '    while (i > 0 && j > 0) {',
    '        if (a.charAt(i - 1) == b.charAt(j - 1)) { out[--k] = a.charAt(i - 1); i--; j--; }   // part of the LCS',
    '        else if (dp[i - 1][j] >= dp[i][j - 1]) i--;                                          // came from above',
    '        else j--;                                                                             // came from the left',
    '    }',
    '    return new String(out);',
    '}'
  ];

  function traceSubsequence(a, b, dp) {
    var i = a.length, j = b.length, out = [];
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) { out.unshift(a[i - 1]); i--; j--; }
      else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
      else j--;
    }
    return out.join('');
  }

  /** Independent: TOP-DOWN memoized recursion on (i, j), with its own traceback that re-queries the memo --
   * a different algorithm shape entirely from build()'s bottom-up nested-loop table fill, and it never calls
   * build()'s helpers, so it can catch a bug in either. */
  function reference(d) {
    var a = d.a, b = d.b, memo = {};
    function solve(i, j) {
      if (i === 0 || j === 0) return 0;
      var key = i + ',' + j;
      if (key in memo) return memo[key];
      var result;
      if (a[i - 1] === b[j - 1]) result = solve(i - 1, j - 1) + 1;
      else result = Math.max(solve(i - 1, j), solve(i, j - 1));
      memo[key] = result;
      return result;
    }
    var length = solve(a.length, b.length);
    var i = a.length, j = b.length, out = [];
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) { out.unshift(a[i - 1]); i--; j--; }
      else if (solve(i - 1, j) >= solve(i, j - 1)) i--;
      else j--;
    }
    return { length: length, subsequence: out.join('') };
  }

  D.define({
    id: 'longest-common-subsequence',
    title: T('En uzun ortak alt dizi (LCS): DP tablosu', 'Longest common subsequence (LCS): the DP table'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('"ABCBDAB" ve "BDCABA": klasik örnek, uzunluk 4', '"ABCBDAB" and "BDCABA": the classic example, length 4'),
        data: { a: 'ABCBDAB', b: 'BDCABA' } },
      { id: 'hard', level: 'hard', name: T('"AGGTAB" ve "GXTXAYB": biyoenformatik klasiği, uzunluk 4', '"AGGTAB" and "GXTXAYB": the bioinformatics classic, length 4'),
        data: { a: 'AGGTAB', b: 'GXTXAYB' } },
      { id: 'no-common', level: 'edge', name: T('Ortak harf yok: LCS boş (uzunluk 0)', 'No shared letters at all: the LCS is empty (length 0)'),
        data: { a: 'ABCDE', b: 'FGHIJ' } },
      { id: 'identical', level: 'edge', name: T('İki dizgi özdeş: LCS dizginin tamamı', 'Both strings identical: the LCS is the whole string'),
        data: { a: 'ALGORITHM', b: 'ALGORITHM' } },
      { id: 'fully-contained', level: 'edge', name: T('"ACEG" tamamen "ABCDEFGH"\'in bir alt dizisi', '"ACEG" is entirely a subsequence of "ABCDEFGH"'),
        data: { a: 'ACEG', b: 'ABCDEFGH' } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.a.length + d.b.length; },
    reference: reference,
    random: function (level, r) {
      var alpha = level === 'easy' ? 8 : (level === 'normal' ? 5 : (level === 'hard' ? 4 : 3));
      function word(len) { var s = ''; for (var i = 0; i < len; i++) s += String.fromCharCode(65 + D.randInt(r, 0, alpha - 1)); return s; }
      var na = D.randInt(r, 5, level === 'extreme' ? 9 : 7), nb = D.randInt(r, 5, level === 'extreme' ? 9 : 7);
      return { a: word(na), b: word(nb) };
    },
    input: {
      hint: T('Örnek: a=ABCBDAB b=BDCABA  (yalnız A-Z; a+b birlikte >= 10 harf)', 'Example: a=ABCBDAB b=BDCABA  (letters A-Z only; a+b together >= 10 letters)'),
      parse: function (text) {
        var a = null, b = null;
        String(text).trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
          var am = /^a[=:]([A-Za-z]+)$/i.exec(tok); if (am) { a = am[1].toUpperCase(); return; }
          var bm = /^b[=:]([A-Za-z]+)$/i.exec(tok); if (bm) { b = bm[1].toUpperCase(); return; }
          throw T('"' + tok + '" anlaşılmadı: a=... ve b=... yazın.', '"' + tok + '" is not understood: write a=... and b=....');
        });
        if (!a) throw T('a=... yazmalısınız.', 'You must write a=....');
        if (!b) throw T('b=... yazmalısınız.', 'You must write b=....');
        if (a.length + b.length < 10) throw T('a ve b birlikte en az 10 harf olmalı.', 'a and b together must be at least 10 letters.');
        if (a.length > 12 || b.length > 12) throw T('a ve b en çok 12 harf olabilir.', 'a and b can be at most 12 letters each.');
        return { a: a, b: b };
      },
      format: function (d) { return 'a=' + d.a + ' b=' + d.b; },
      bad: ['', 'a=CAT b=DOG', 'a=CAT', 'ABCBDAB BDCABA', 'a=abc123 b=bdcaba', 'a=ABCBDAB b='],
      tokens: function (d) { return d.a.split('').concat(d.b.split('')); }
    },
    build: function (S, d) {
      var a = d.a, b = d.b, n = a.length, m = b.length, W = 42, H = 38, X0 = 190, Y0 = 110;
      for (var j0 = 0; j0 <= m; j0++) S.label('collbl' + j0, { x: X0 + j0 * W + 17, y: Y0 - 24, text: j0 === 0 ? T('(boş)', '(empty)') : b[j0 - 1], size: 13, bold: true, anchor: 'middle' });
      for (var i0 = 0; i0 <= n; i0++) S.label('rowlbl' + i0, { x: X0 - 20, y: Y0 + i0 * H + H / 2 - 3, text: i0 === 0 ? T('(boş)', '(empty)') : a[i0 - 1], size: 13, bold: true, anchor: 'end' });
      var RX = X0 + (m + 1) * W + 30;
      S.label('dec', { x: RX, y: Y0, text: '', size: 14, bold: true, anchor: 'start' });
      S.label('dec2', { x: RX, y: Y0 + 22, text: '', size: 12, anchor: 'start', style: 'dim' });
      S.label('lcslbl', { x: X0, y: Y0 + (n + 1) * H + 30, text: '', size: 13, mono: true, style: 'dim' });

      function cellId(i, j) { return 'c' + i + '_' + j; }
      function drawCell(i, j, val, style) { S.box(cellId(i, j), { x: X0 + j * W, y: Y0 + i * H, w: 34, h: H - 4, text: String(val), style: style, size: 14 }); }

      var dp = []; for (var ii = 0; ii <= n; ii++) dp.push(new Array(m + 1).fill(0));
      for (ii = 0; ii <= n; ii++) drawCell(ii, 0, 0, 'dim');
      for (var jj = 0; jj <= m; jj++) drawCell(0, jj, 0, 'dim');
      S.step(T('Taban durumları: `dp[i][0] = 0` ve `dp[0][j] = 0` -- boş bir dizgiyle hiçbir ortak alt dizi paylaşılamaz.',
               'Base cases: `dp[i][0] = 0` and `dp[0][j] = 0` -- an empty string shares no common subsequence with anything.'),
             { c: [{ n: 2, note: T('i = 0..' + n, 'i = 0..' + n) }, { n: 3, note: T('j = 0..' + m, 'j = 0..' + m) }],
               java: [{ n: 3, note: T('i = 0..' + n, 'i = 0..' + n) }, { n: 4, note: T('j = 0..' + m, 'j = 0..' + m) }] });

      var DETAILED = 2;
      for (var i = 1; i <= n; i++) {
        S.at(Math.min(i - 1, a.length - 1));
        var detailed = i <= DETAILED;
        for (var j = 1; j <= m; j++) {
          var match = a[i - 1] === b[j - 1], val;
          if (detailed) { S.set(cellId(i - 1, j - 1), { style: 'active' }); S.set(cellId(i - 1, j), { style: 'active' }); S.set(cellId(i, j - 1), { style: 'active' }); }
          if (match) {
            val = dp[i - 1][j - 1] + 1;
            if (detailed) {
              S.set(cellId(i - 1, j - 1), { style: 'hl' });
              S.set('dec', { text: '`' + a[i - 1] + '` == `' + b[j - 1] + '`', style: 'new' });
              S.set('dec2', { text: 'dp[' + i + '][' + j + '] = dp[' + (i - 1) + '][' + (j - 1) + '] + 1 = ' + val });
            }
          } else {
            var up = dp[i - 1][j], left = dp[i][j - 1];
            val = Math.max(up, left);
            if (detailed) {
              var src = up >= left ? cellId(i - 1, j) : cellId(i, j - 1);
              S.set(src, { style: 'hl' });
              S.set('dec', { text: '`' + a[i - 1] + '` != `' + b[j - 1] + '`', style: 'del' });
              S.set('dec2', { text: 'max(' + up + ',' + left + ') = ' + val });
            }
          }
          dp[i][j] = val;
          drawCell(i, j, val, 'new');
          if (detailed) {
            S.step(T('`dp[' + i + '][' + j + ']`: `a[' + (i - 1) + ']`=`' + a[i - 1] + '`, `b[' + (j - 1) + ']`=`' + b[j - 1] + '` -- ' + (match ? 'eşleşiyor, köşegen bir artar.' : 'eşleşmiyor, üst ve sol komşudan büyük olanı alınır.') + ' Sonuç: ' + val + '.',
                     '`dp[' + i + '][' + j + ']`: `a[' + (i - 1) + ']`=`' + a[i - 1] + '`, `b[' + (j - 1) + ']`=`' + b[j - 1] + '` -- ' + (match ? 'they match, the diagonal grows by one.' : 'they differ, take the larger of the top and left neighbors.') + ' Result: ' + val + '.'),
                   match ? { c: [{ n: 6, note: T('eşleşme? evet', 'match? yes') }, 7, { n: 9, skip: true }], java: [{ n: 7, note: T('eşleşme? evet', 'match? yes') }, 8, { n: 10, skip: true }] }
                         : { c: [{ n: 6, note: T('eşleşme? hayır', 'match? no') }, { n: 7, skip: true }, 9], java: [{ n: 7, note: T('eşleşme? hayır', 'match? no') }, { n: 8, skip: true }, 10] });
            S.set(cellId(i - 1, j - 1), { style: 'dim' }); S.set(cellId(i - 1, j), { style: 'dim' }); S.set(cellId(i, j - 1), { style: 'dim' });
            S.set(cellId(i, j), { style: 'normal' });
          }
        }
        if (!detailed) {
          var rowVals = []; for (var jr = 0; jr <= m; jr++) rowVals.push(dp[i][jr]);
          S.step(T('Satır `i=' + i + '` (`a[' + (i - 1) + ']`=`' + a[i - 1] + '`) dolduruldu: [' + rowVals.join(', ') + '].',
                   'Row `i=' + i + '` (`a[' + (i - 1) + ']`=`' + a[i - 1] + '`) filled: [' + rowVals.join(', ') + '].'),
                 { c: [{ n: 5, note: T('j = 1..' + m, 'j = 1..' + m) }, { n: 6, note: T('değişir', 'varies') }, 7, 8, { n: 9, note: T('değişir', 'varies') }, 10],
                   java: [{ n: 6, note: T('j = 1..' + m, 'j = 1..' + m) }, { n: 7, note: T('değişir', 'varies') }, 8, 9, 10, 11] });
        }
      }

      S.at(null);
      S.set('dec', { text: '', style: 'normal' }); S.set('dec2', { text: '' });
      var subsequence = traceSubsequence(a, b, dp);
      var pi = n, pj = m, chars = [];
      S.step(T('Tablo tamam: `dp[' + n + '][' + m + '] = ' + dp[n][m] + '` -- en uzun ortak alt dizinin uzunluğu. Şimdi sağ-alttan geriye yürüyerek onu yeniden kurarız.',
               'The table is done: `dp[' + n + '][' + m + '] = ' + dp[n][m] + '` -- the longest common subsequence\'s length. Now we walk backward from the bottom-right to reconstruct it.'),
             { c: [12], java: [13] });
      while (pi > 0 && pj > 0) {
        S.set(cellId(pi, pj), { style: 'new' });
        if (a[pi - 1] === b[pj - 1]) {
          chars.unshift(a[pi - 1]);
          S.arrow('trk' + pi + '_' + pj, { from: cellId(pi, pj), to: cellId(pi - 1, pj - 1), kind: 'center', style: 'new', head: false });
          pi--; pj--;
          S.set('lcslbl', { text: 'LCS so far: ' + chars.join('') });
          S.step(T('`a[' + pi + ']`==`b[' + pj + ']` -- bu harf LCS\'nin **parçası**: `' + a[pi] + '` eklenir, köşegene gideriz.', '`a[' + pi + ']`==`b[' + pj + ']` -- this letter is **part of the LCS**: `' + a[pi] + '` is added, we move diagonally.'),
                 { c: [{ n: 19, note: T('eşleşme mi? evet', 'match? yes') }], java: [{ n: 20, note: T('eşleşme mi? evet', 'match? yes') }] });
        } else if (dp[pi - 1][pj] >= dp[pi][pj - 1]) {
          S.arrow('trk' + pi + '_' + pj, { from: cellId(pi, pj), to: cellId(pi - 1, pj), kind: 'center', style: 'dim', head: false });
          pi--;
          S.step(T('`a[' + pi + ']`!=`b[' + pj + ']`, üst >= sol -- `a[' + pi + ']` atılır, yukarı gideriz.', '`a[' + pi + ']`!=`b[' + pj + ']`, top >= left -- `a[' + pi + ']` is dropped, we move up.'),
                 { c: [{ n: 19, note: T('eşleşme mi? hayır', 'match? no') }, { n: 20, note: T('üst >= sol? evet', 'top >= left? yes') }], java: [{ n: 20, note: T('eşleşme mi? hayır', 'match? no') }, { n: 21, note: T('üst >= sol? evet', 'top >= left? yes') }] });
        } else {
          S.arrow('trk' + pi + '_' + pj, { from: cellId(pi, pj), to: cellId(pi, pj - 1), kind: 'center', style: 'dim', head: false });
          pj--;
          S.step(T('`a[' + pi + ']`!=`b[' + pj + ']`, sol > üst -- `b[' + pj + ']` atılır, sola gideriz.', '`a[' + pi + ']`!=`b[' + pj + ']`, left > top -- `b[' + pj + ']` is dropped, we move left.'),
                 { c: [{ n: 19, note: T('eşleşme mi? hayır', 'match? no') }, { n: 20, note: T('üst >= sol? hayır', 'top >= left? no') }, 21], java: [{ n: 20, note: T('eşleşme mi? hayır', 'match? no') }, { n: 21, note: T('üst >= sol? hayır', 'top >= left? no') }, 22] });
        }
      }

      S.result = { length: dp[n][m], subsequence: subsequence };
      S.step(T('Bitti: `LCS("' + a + '", "' + b + '")` uzunluk ' + dp[n][m] + ', bir örnek: "' + subsequence + '". Tablo O(n*m) sürede ve bellekte dolduruldu.',
               'Done: `LCS("' + a + '", "' + b + '")` has length ' + dp[n][m] + ', one example: "' + subsequence + '". The table was filled in O(n*m) time and space.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
