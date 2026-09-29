/* Week 12 -- Strings: Structures and Algorithms
 * Edit distance (Levenshtein distance): the fewest single-character insertions, deletions and substitutions
 * needed to turn string `a` into string `b`. A dynamic-programming table dp[i][j] holds the edit distance
 * between a's first i characters and b's first j characters; row 0 and column 0 are the base cases (turning
 * an empty string into a prefix costs one insertion/deletion per character). Every other cell looks at just
 * three neighbors -- diagonal (substitute, or free if the characters already match), above (delete from a),
 * left (insert from b) -- and takes the cheapest option plus one. Once the table is filled, walking backward
 * from the bottom-right corner, always toward whichever neighbor produced the stored value, reconstructs one
 * shortest edit sequence. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int edit_distance(const char *a, int n, const char *b, int m, int dp[MAXN][MAXM]) {',
    '    for (int i = 0; i <= n; i++) dp[i][0] = i;            /* delete all of a[0..i) */',
    '    for (int j = 0; j <= m; j++) dp[0][j] = j;            /* insert all of b[0..j) */',
    '    for (int i = 1; i <= n; i++) {',
    '        for (int j = 1; j <= m; j++) {',
    '            if (a[i - 1] == b[j - 1])',
    '                dp[i][j] = dp[i - 1][j - 1];               /* match: no cost */',
    '            else {',
    '                int sub = dp[i - 1][j - 1], del = dp[i - 1][j], ins = dp[i][j - 1];',
    '                int best = sub < del ? sub : del;',
    '                best = best < ins ? best : ins;',
    '                dp[i][j] = 1 + best;                        /* substitute, delete or insert */',
    '            }',
    '        }',
    '    }',
    '    return dp[n][m];',
    '}',
    '',
    'void traceback(const char *a, int n, const char *b, int m, int dp[MAXN][MAXM]) {',
    '    int i = n, j = m;',
    '    while (i > 0 || j > 0) {',
    '        if (i > 0 && j > 0 && a[i-1] == b[j-1] && dp[i][j] == dp[i-1][j-1]) { i--; j--; }   /* match */',
    '        else if (i > 0 && j > 0 && dp[i][j] == dp[i-1][j-1] + 1) { i--; j--; }               /* substitute */',
    '        else if (i > 0 && dp[i][j] == dp[i-1][j] + 1) { i--; }                               /* delete */',
    '        else { j--; }                                                                         /* insert */',
    '    }',
    '}'
  ];
  var JAVA = [
    'static int editDistance(String a, String b, int[][] dp) {',
    '    int n = a.length(), m = b.length();',
    '    for (int i = 0; i <= n; i++) dp[i][0] = i;            // delete all of a[0..i)',
    '    for (int j = 0; j <= m; j++) dp[0][j] = j;            // insert all of b[0..j)',
    '    for (int i = 1; i <= n; i++) {',
    '        for (int j = 1; j <= m; j++) {',
    '            if (a.charAt(i - 1) == b.charAt(j - 1))',
    '                dp[i][j] = dp[i - 1][j - 1];               // match: no cost',
    '            else {',
    '                int sub = dp[i - 1][j - 1], del = dp[i - 1][j], ins = dp[i][j - 1];',
    '                int best = Math.min(sub, Math.min(del, ins));',
    '                dp[i][j] = 1 + best;                        // substitute, delete or insert',
    '            }',
    '        }',
    '    }',
    '    return dp[n][m];',
    '}',
    '',
    'static void traceback(String a, String b, int[][] dp) {',
    '    int i = a.length(), j = b.length();',
    '    while (i > 0 || j > 0) {',
    '        if (i > 0 && j > 0 && a.charAt(i-1) == b.charAt(j-1) && dp[i][j] == dp[i-1][j-1]) { i--; j--; }   // match',
    '        else if (i > 0 && j > 0 && dp[i][j] == dp[i-1][j-1] + 1) { i--; j--; }                             // substitute',
    '        else if (i > 0 && dp[i][j] == dp[i-1][j] + 1) { i--; }                                             // delete',
    '        else { j--; }                                                                                       // insert',
    '    }',
    '}'
  ];

  function traceOps(a, b, dp) {
    var i = a.length, j = b.length, ops = [];
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && dp[i][j] === dp[i - 1][j - 1]) { ops.unshift('match'); i--; j--; }
      else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) { ops.unshift('substitute'); i--; j--; }
      else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) { ops.unshift('delete'); i--; }
      else { ops.unshift('insert'); j--; }
    }
    return ops;
  }

  /** Independent: TOP-DOWN memoized recursion on (i, j), with its own traceback that re-queries the memo --
   * a different algorithm shape entirely from build()'s bottom-up nested-loop table fill, and it never calls
   * build()'s helpers, so it can catch a bug in either. */
  function reference(d) {
    var a = d.a, b = d.b, memo = {};
    function solve(i, j) {
      if (i === 0) return j;
      if (j === 0) return i;
      var key = i + ',' + j;
      if (key in memo) return memo[key];
      var result;
      if (a[i - 1] === b[j - 1]) result = solve(i - 1, j - 1);
      else result = 1 + Math.min(solve(i - 1, j - 1), solve(i - 1, j), solve(i, j - 1));
      memo[key] = result;
      return result;
    }
    var distance = solve(a.length, b.length);
    var i = a.length, j = b.length, ops = [];
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && solve(i, j) === solve(i - 1, j - 1)) { ops.unshift('match'); i--; j--; }
      else if (i > 0 && j > 0 && solve(i, j) === solve(i - 1, j - 1) + 1) { ops.unshift('substitute'); i--; j--; }
      else if (i > 0 && solve(i, j) === solve(i - 1, j) + 1) { ops.unshift('delete'); i--; }
      else { ops.unshift('insert'); j--; }
    }
    return { distance: distance, ops: ops };
  }

  D.define({
    id: 'edit-distance',
    title: T('Düzenleme uzaklığı (Levenshtein): DP tablosu', 'Edit distance (Levenshtein): the DP table'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('"KITTEN" -> "SITTING": klasik örnek, uzaklık 3', '"KITTEN" -> "SITTING": the classic example, distance 3'),
        data: { a: 'KITTEN', b: 'SITTING' } },
      { id: 'hard', level: 'hard', name: T('"INTENTION" -> "EXECUTION": büyük tablo, uzaklık 5', '"INTENTION" -> "EXECUTION": a big table, distance 5'),
        data: { a: 'INTENTION', b: 'EXECUTION' } },
      { id: 'identical', level: 'edge', name: T('İki dizgi özdeş: uzaklık 0, yol tamamen köşegen', 'Both strings identical: distance 0, the path is pure diagonal'),
        data: { a: 'ALGORITHM', b: 'ALGORITHM' } },
      { id: 'disjoint', level: 'edge', name: T('Ortak harf yok: her konum bir değiştirme', 'No shared letters at all: every position is a substitution'),
        data: { a: 'ABCDE', b: 'FGHIJ' } },
      { id: 'insertion-only', level: 'edge', name: T('"CAT" -> "CATERPILLAR": yalnızca ekleme', '"CAT" -> "CATERPILLAR": pure insertion'),
        data: { a: 'CAT', b: 'CATERPILLAR' } }
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
      hint: T('Örnek: a=KITTEN b=SITTING  (yalnız A-Z; a+b birlikte >= 10 harf)', 'Example: a=KITTEN b=SITTING  (letters A-Z only; a+b together >= 10 letters)'),
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
      bad: ['', 'a=CAT b=DOG', 'a=CAT', 'KITTEN SITTING', 'a=cat123 b=sitting', 'a=KITTEN b='],
      tokens: function (d) { return d.a.split('').concat(d.b.split('')); }
    },
    build: function (S, d) {
      var a = d.a, b = d.b, n = a.length, m = b.length, W = 42, H = 38, X0 = 190, Y0 = 110;
      for (var j0 = 0; j0 <= m; j0++) S.label('collbl' + j0, { x: X0 + j0 * W + 17, y: Y0 - 24, text: j0 === 0 ? T('(boş)', '(empty)') : b[j0 - 1], size: 13, bold: true, anchor: 'middle' });
      for (var i0 = 0; i0 <= n; i0++) S.label('rowlbl' + i0, { x: X0 - 20, y: Y0 + i0 * H + H / 2 - 3, text: i0 === 0 ? T('(boş)', '(empty)') : a[i0 - 1], size: 13, bold: true, anchor: 'end' });
      var RX = X0 + (m + 1) * W + 30;
      S.label('dec', { x: RX, y: Y0, text: '', size: 14, bold: true, anchor: 'start' });
      S.label('dec2', { x: RX, y: Y0 + 22, text: '', size: 12, anchor: 'start', style: 'dim' });
      S.label('opslbl', { x: X0, y: Y0 + (n + 1) * H + 30, text: '', size: 13, mono: true, style: 'dim' });

      function cellId(i, j) { return 'c' + i + '_' + j; }
      function drawCell(i, j, val, style) { S.box(cellId(i, j), { x: X0 + j * W, y: Y0 + i * H, w: 34, h: H - 4, text: String(val), style: style, size: 14 }); }

      var dp = []; for (var ii = 0; ii <= n; ii++) dp.push(new Array(m + 1).fill(0));
      for (ii = 0; ii <= n; ii++) { dp[ii][0] = ii; drawCell(ii, 0, ii, 'dim'); }
      for (var jj = 0; jj <= m; jj++) { dp[0][jj] = jj; drawCell(0, jj, jj, 'dim'); }
      S.step(T('Taban durumları: `dp[i][0] = i` (a\'nın ilk i harfini silmek), `dp[0][j] = j` (b\'nin ilk j harfini eklemek).',
               'Base cases: `dp[i][0] = i` (deleting a\'s first i letters), `dp[0][j] = j` (inserting b\'s first j letters).'),
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
            val = dp[i - 1][j - 1];
            if (detailed) {
              S.set(cellId(i - 1, j - 1), { style: 'hl' });
              S.set('dec', { text: '`' + a[i - 1] + '` == `' + b[j - 1] + '`', style: 'new' });
              S.set('dec2', { text: 'dp[' + i + '][' + j + '] = dp[' + (i - 1) + '][' + (j - 1) + '] = ' + val });
            }
          } else {
            var sub = dp[i - 1][j - 1], del = dp[i - 1][j], ins = dp[i][j - 1];
            val = 1 + Math.min(sub, del, ins);
            if (detailed) {
              var src = sub <= del && sub <= ins ? cellId(i - 1, j - 1) : (del <= ins ? cellId(i - 1, j) : cellId(i, j - 1));
              S.set(src, { style: 'hl' });
              S.set('dec', { text: '`' + a[i - 1] + '` != `' + b[j - 1] + '`', style: 'del' });
              S.set('dec2', { text: 'min(' + sub + ',' + del + ',' + ins + ') + 1 = ' + val });
            }
          }
          dp[i][j] = val;
          drawCell(i, j, val, 'new');
          if (detailed) {
            S.step(T('`dp[' + i + '][' + j + ']`: `a[' + (i - 1) + ']`=`' + a[i - 1] + '`, `b[' + (j - 1) + ']`=`' + b[j - 1] + '` -- ' + (match ? 'eşleşiyor, köşegenden ücretsiz kopyalanır.' : 'eşleşmiyor, üç komşunun en ucuzu + 1 alınır.') + ' Sonuç: ' + val + '.',
                     '`dp[' + i + '][' + j + ']`: `a[' + (i - 1) + ']`=`' + a[i - 1] + '`, `b[' + (j - 1) + ']`=`' + b[j - 1] + '` -- ' + (match ? 'they match, copied free from the diagonal.' : 'they differ, the cheapest of the three neighbors + 1.') + ' Result: ' + val + '.'),
                   match ? { c: [{ n: 6, note: T('eşleşme? evet', 'match? yes') }, 7, { n: 9, skip: true }, { n: 10, skip: true }, { n: 11, skip: true }, { n: 12, skip: true }],
                             java: [{ n: 7, note: T('eşleşme? evet', 'match? yes') }, 8, { n: 10, skip: true }, { n: 11, skip: true }, { n: 12, skip: true }] }
                         : { c: [{ n: 6, note: T('eşleşme? hayır', 'match? no') }, { n: 7, skip: true }, 9, 10, 11, 12],
                             java: [{ n: 7, note: T('eşleşme? hayır', 'match? no') }, { n: 8, skip: true }, 10, 11, 12] });
            S.set(cellId(i - 1, j - 1), { style: 'dim' }); S.set(cellId(i - 1, j), { style: 'dim' }); S.set(cellId(i, j - 1), { style: 'dim' });
            S.set(cellId(i, j), { style: 'normal' });
          }
        }
        if (!detailed) {
          var rowVals = []; for (var jr = 0; jr <= m; jr++) rowVals.push(dp[i][jr]);
          S.step(T('Satır `i=' + i + '` (`a[' + (i - 1) + ']`=`' + a[i - 1] + '`) dolduruldu: [' + rowVals.join(', ') + '].',
                   'Row `i=' + i + '` (`a[' + (i - 1) + ']`=`' + a[i - 1] + '`) filled: [' + rowVals.join(', ') + '].'),
                 { c: [{ n: 5, note: T('j = 1..' + m, 'j = 1..' + m) }, { n: 6, note: T('değişir', 'varies') }, 7, 8, 9, { n: 10, note: T('değişir', 'varies') }, { n: 11, note: T('değişir', 'varies') }, 12, 13, 14],
                   java: [{ n: 6, note: T('j = 1..' + m, 'j = 1..' + m) }, { n: 7, note: T('değişir', 'varies') }, 8, 9, 10, 11, 12, 13] });
        }
      }

      S.at(null);
      S.set('dec', { text: '', style: 'normal' }); S.set('dec2', { text: '' });
      var ops = traceOps(a, b, dp);
      var pi = n, pj = m, opsShown = [];
      S.step(T('Tablo tamam: `dp[' + n + '][' + m + '] = ' + dp[n][m] + '`. Şimdi sağ-alttan başlayarak, değerin nereden geldiğini izleyerek geriye yürürüz.',
               'The table is done: `dp[' + n + '][' + m + '] = ' + dp[n][m] + '`. Now we walk backward from the bottom-right, following where each value came from.'),
             { c: [16], java: [16] });
      while (pi > 0 || pj > 0) {
        S.set(cellId(pi, pj), { style: 'new' });
        var op;
        if (pi > 0 && pj > 0 && a[pi - 1] === b[pj - 1] && dp[pi][pj] === dp[pi - 1][pj - 1]) {
          op = 'match'; S.arrow('trk' + pi + '_' + pj, { from: cellId(pi, pj), to: cellId(pi - 1, pj - 1), kind: 'center', style: 'new', head: false });
          pi--; pj--;
          S.step(T('`(' + (pi + 1) + ',' + (pj + 1) + ')`: `a[' + pi + ']`==`b[' + pj + ']` ve değer köşegenden geldi -- **eşleşme (match)**, köşegene gideriz.', '`(' + (pi + 1) + ',' + (pj + 1) + ')`: `a[' + pi + ']`==`b[' + pj + ']` and the value came from the diagonal -- **match**, we move diagonally.'),
                 { c: [{ n: 22, note: T('eşleşme mi? evet', 'match? yes') }], java: [{ n: 22, note: T('eşleşme mi? evet', 'match? yes') }] });
        } else if (pi > 0 && pj > 0 && dp[pi][pj] === dp[pi - 1][pj - 1] + 1) {
          op = 'substitute'; S.arrow('trk' + pi + '_' + pj, { from: cellId(pi, pj), to: cellId(pi - 1, pj - 1), kind: 'center', style: 'del', head: false });
          pi--; pj--;
          S.step(T('`(' + (pi + 1) + ',' + (pj + 1) + ')`: değer köşegen + 1 -- **değiştirme (substitute)**, köşegene gideriz.', '`(' + (pi + 1) + ',' + (pj + 1) + ')`: the value is diagonal + 1 -- **substitute**, we move diagonally.'),
                 { c: [{ n: 22, note: T('eşleşme mi? hayır', 'match? no') }, { n: 23, note: T('köşegen+1 mi? evet', 'diagonal+1? yes') }], java: [{ n: 22, note: T('eşleşme mi? hayır', 'match? no') }, { n: 23, note: T('köşegen+1 mi? evet', 'diagonal+1? yes') }] });
        } else if (pi > 0 && dp[pi][pj] === dp[pi - 1][pj] + 1) {
          op = 'delete'; S.arrow('trk' + pi + '_' + pj, { from: cellId(pi, pj), to: cellId(pi - 1, pj), kind: 'center', style: 'del', head: false });
          pi--;
          S.step(T('`(' + (pi + 1) + ',' + pj + ')`: değer üstten + 1 -- **silme (delete)** `a[' + pi + ']`, yukarı gideriz.', '`(' + (pi + 1) + ',' + pj + ')`: the value is top + 1 -- **delete** `a[' + pi + ']`, we move up.'),
                 { c: [{ n: 22, note: T('eşleşme mi? hayır', 'match? no') }, { n: 23, note: T('köşegen+1 mi? hayır', 'diagonal+1? no') }, { n: 24, note: T('üst+1 mi? evet', 'top+1? yes') }], java: [{ n: 22, note: T('eşleşme mi? hayır', 'match? no') }, { n: 23, note: T('köşegen+1 mi? hayır', 'diagonal+1? no') }, { n: 24, note: T('üst+1 mi? evet', 'top+1? yes') }] });
        } else {
          op = 'insert'; S.arrow('trk' + pi + '_' + pj, { from: cellId(pi, pj), to: cellId(pi, pj - 1), kind: 'center', style: 'del', head: false });
          pj--;
          S.step(T('`(' + pi + ',' + (pj + 1) + ')`: değer soldan + 1 -- **ekleme (insert)** `b[' + pj + ']`, sola gideriz.', '`(' + pi + ',' + (pj + 1) + ')`: the value is left + 1 -- **insert** `b[' + pj + ']`, we move left.'),
                 { c: [{ n: 22, note: T('eşleşme mi? hayır', 'match? no') }, { n: 23, note: T('köşegen+1 mi? hayır', 'diagonal+1? no') }, { n: 24, note: T('üst+1 mi? hayır', 'top+1? no') }, 25], java: [{ n: 22, note: T('eşleşme mi? hayır', 'match? no') }, { n: 23, note: T('köşegen+1 mi? hayır', 'diagonal+1? no') }, { n: 24, note: T('üst+1 mi? hayır', 'top+1? no') }, 25] });
        }
        opsShown.unshift(op);
        S.set('opslbl', { text: 'ops: ' + opsShown.join(' ') });
      }
      S.set(cellId(0, 0), { style: 'new' });

      S.result = { distance: dp[n][m], ops: ops };
      S.step(T('Bitti: `edit_distance("' + a + '", "' + b + '") = ' + dp[n][m] + '`. Bir en kısa düzenleme dizisi: ' + ops.join(', ') + '. Tablo O(n*m) sürede ve bellekte dolduruldu.',
               'Done: `edit_distance("' + a + '", "' + b + '") = ' + dp[n][m] + '`. One shortest edit sequence: ' + ops.join(', ') + '. The table was filled in O(n*m) time and space.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
