/* Week 2 -- sparse matrix transpose, the FAST way: instead of sorting the swapped (row,col) triplets, count how
 * many nonzeros sit in each column, turn that into starting positions with a prefix sum, then place every triplet
 * directly at its final spot in one more pass. The result comes out already sorted in row-major order of the
 * transpose. Matches sparse_matrix_transpose.c / SparseMatrixTranspose.java (fast_transpose only -- the program
 * has no separate "simple transpose"). */
(function (D) {
  'use strict';
  var T = D.T;

  function makeCode(d) {
    return {
      c: [
        '#define ROWS ' + d.rows,
        '#define COLS ' + d.cols,
        '',
        'typedef struct {',
        '    int row, col, value;',
        '} Triplet;',
        '',
        '/* Builds the triplets of the transpose in ONE pass, already sorted in',
        '   row-major order of the transpose -- no re-sorting needed afterwards. */',
        'void fast_transpose(Triplet a[], int nnz, Triplet b[]) {',
        '    int count[COLS] = {0};',
        '    int pos[COLS];',
        '',
        '    for (int i = 0; i < nnz; i++)',
        '        count[a[i].col]++;             /* how many nonzeros in each column */',
        '',
        '    pos[0] = 0;',
        '    for (int c = 1; c < COLS; c++)',
        '        pos[c] = pos[c - 1] + count[c - 1];   /* where column c starts in b */',
        '',
        '    for (int i = 0; i < nnz; i++) {',
        '        int c = a[i].col;',
        '        int p = pos[c]++;',
        '        b[p].row = a[i].col;            /* row and col swap ... */',
        '        b[p].col = a[i].row;',
        '        b[p].value = a[i].value;',
        '    }',
        '}'
      ],
      java: [
        'static final int ROWS = ' + d.rows + ';',
        'static final int COLS = ' + d.cols + ';',
        '',
        'static class Triplet {',
        '    int row, col, value;',
        '    Triplet(int row, int col, int value) { this.row = row; this.col = col; this.value = value; }',
        '}',
        '',
        'static Triplet[] fastTranspose(Triplet[] a) {',
        '    int[] count = new int[COLS];',
        '    int[] pos = new int[COLS];',
        '',
        '    for (Triplet e : a)',
        '        count[e.col]++;                 // how many nonzeros in each column',
        '',
        '    pos[0] = 0;',
        '    for (int c = 1; c < COLS; c++)',
        '        pos[c] = pos[c - 1] + count[c - 1];   // where column c starts in b',
        '',
        '    Triplet[] b = new Triplet[a.length];',
        '    for (Triplet e : a) {',
        '        int p = pos[e.col]++;',
        '        b[p] = new Triplet(e.col, e.row, e.value);   // row and col swap ...',
        '    }',
        '    return b;',
        '}'
      ]
    };
  }
  var L_STRUCT = { c: [4, 5, 6], java: [4, 5, 6, 7] };
  var L_COUNT_INIT = { c: [10, 11], java: [9, 10] };
  var L_COUNT_LOOP = { c: [13, 14], java: [12, 13] };
  var L_POS_INIT = { c: [16], java: [15] };
  var L_POS_LOOP = { c: [17, 18], java: [16, 17] };
  var L_PLACE_LOOP = { c: [19, 20, 21, 22, 23, 24], java: [19, 20, 21, 22, 23] };

  D.define({
    id: 'sparse-matrix-transpose',
    title: T('Seyrek matris devriği: hızlı devrik (fast transpose)', 'Sparse matrix transpose: fast transpose'),
    code: makeCode,
    presets: [
      { id: 'normal', level: 'normal', name: T('4x5 (aynı örnek matris), 5 sıfır olmayan', '4x5 (same example matrix), 5 nonzero'),
        data: { rows: 4, cols: 5, mat: [[0, 0, 3, 0, 4], [0, 0, 5, 7, 0], [0, 0, 0, 0, 0], [6, 0, 0, 0, 0]] } },
      { id: 'hard', level: 'hard', name: T('6x6, 9 sıfır olmayan (negatif dahil)', '6x6, 9 nonzero (negatives included)'),
        data: { rows: 6, cols: 6, mat: [
          [0, -3, 0, 0, 0, 5], [0, 0, 0, 9, 0, 0], [7, 0, 0, 0, 0, 0], [0, 0, -12, 0, 4, 0], [0, 0, 0, 0, 0, 0], [2, 0, 0, -6, 0, 11]
        ] } },
      { id: 'all-zero', level: 'edge', name: T('4x4, hepsi sıfır: devrik de boş kalır', '4x4, all zero: the transpose stays empty too'),
        data: { rows: 4, cols: 4, mat: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] } },
      { id: 'fully-dense', level: 'edge', name: T('4x3, hepsi sıfır olmayan: her hücre devriğe girer', '4x3, all nonzero: every cell enters the transpose'),
        data: { rows: 4, cols: 3, mat: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of dense-matrix cells (the input the student types), not the nonzero count. */
    size: function (d) { return d.rows * d.cols; },
    /** Independent computation: swap (row,col) and SORT (build() uses counting + prefix sums, a different technique). */
    reference: function (d) {
      var triplets = [];
      d.mat.forEach(function (row, i) { row.forEach(function (v, j) { if (v !== 0) triplets.push([i, j, v]); }); });
      var transposed = triplets.map(function (t) { return [t[1], t[0], t[2]]; });
      transposed.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
      return { transposeTriplets: transposed, count: transposed.length };
    },
    random: function (level, r) {
      var dims = { easy: [4, 4], normal: [5, 6], hard: [6, 6], extreme: [6, 7] }[level];
      var rows = dims[0], cols = dims[1];
      var density = level === 'extreme' ? 0.35 : 0.22;
      var lo = level === 'extreme' ? -300 : 1, hi = level === 'extreme' ? 300 : 99;
      var mat = [];
      for (var i = 0; i < rows; i++) {
        var row = [];
        for (var j = 0; j < cols; j++) row.push(r() < density ? (D.randInt(r, lo, hi) || 1) : 0);
        mat.push(row);
      }
      return { rows: rows, cols: cols, mat: mat };
    },
    input: {
      hint: T('Örnek: rows=4 cols=5  0 0 3 0 4; 0 0 5 7 0; 0 0 0 0 0; 6 0 0 0 0', 'Example: rows=4 cols=5  0 0 3 0 4; 0 0 5 7 0; 0 0 0 0 0; 6 0 0 0 0'),
      parse: function (text) {
        var rest = [];
        String(text).trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
          if (/^(rows|cols)[=:]\d+$/i.test(tok)) return;
          rest.push(tok);
        });
        var rowTexts = rest.join(' ').split(';').map(function (s) { return s.trim(); }).filter(Boolean);
        if (rowTexts.length < 2) throw T('En az 2 satır yazın, satırları ";" ile ayırın.', 'Write at least 2 rows, separated by ";".');
        var mat = rowTexts.map(function (rt) {
          return rt.split(/\s+/).filter(Boolean).map(function (v) {
            if (!/^-?\d+$/.test(v)) throw T('"' + v + '" bir tamsayı değil.', '"' + v + '" is not an integer.');
            return parseInt(v, 10);
          });
        });
        var cols = mat[0].length;
        if (cols < 2) throw T('En az 2 sütun olmalı.', 'There must be at least 2 columns.');
        for (var i = 0; i < mat.length; i++) if (mat[i].length !== cols) throw T('Her satır aynı sayıda sütuna sahip olmalı.', 'Every row must have the same number of columns.');
        if (mat.length * cols > 60) throw T('En çok 60 hücre.', 'At most 60 cells.');
        return { rows: mat.length, cols: cols, mat: mat };
      },
      format: function (d) { return 'rows=' + d.rows + ' cols=' + d.cols + '  ' + d.mat.map(function (row) { return row.join(' '); }).join('; '); },
      tokens: function (d) { var out = []; d.mat.forEach(function (row) { row.forEach(function (v) { out.push(String(v)); }); }); return out; },
      bad: ['', 'rows=2 cols=2 1 2; 3', '1 2; a b', '1', '1 2 3; 4 5']
    },
    build: function (S, d) {
      var rows = d.rows, cols = d.cols, mat = d.mat;
      var W = 40, H = 34, GAP = 4, X0 = 150, Y0 = 60;
      for (var i = 0; i < rows; i++) {
        S.label('rl' + i, { x: X0 - 14, y: Y0 + i * (H + GAP) + H / 2 + 5, text: 'M[' + i + '] =', anchor: 'end', size: 12, bold: true, mono: true });
        for (var j = 0; j < cols; j++) {
          var p = { x: X0 + j * (W + GAP), y: Y0 + i * (H + GAP), w: W, h: H, text: String(mat[i][j]), style: mat[i][j] === 0 ? 'empty' : 'normal', size: 12 };
          if (i === 0) p.above = String(j);
          S.box('c' + i + '_' + j, p);
        }
      }
      var orig = [];
      for (var oi = 0; oi < rows; oi++) for (var oj = 0; oj < cols; oj++) if (mat[oi][oj] !== 0) orig.push([oi, oj, mat[oi][oj]]);
      var nnz = orig.length;

      var ATX = X0 + cols * (W + GAP) + 100, ATY = Y0, TW = 50, TH = 28, TGAP = 4;
      S.label('alabel', { x: ATX - 14, y: ATY - 24, text: T('a[] (özgün) =', 'a[] (original) ='), anchor: 'start', bold: true, mono: true, size: 13 });
      ['row', 'col', 'value'].forEach(function (h, c) { S.label('ath' + c, { x: ATX + c * (TW + TGAP) + TW / 2, y: ATY - 4, text: h, style: 'dim', size: 12, mono: true }); });
      orig.forEach(function (t, idx) {
        var ty = ATY + idx * (TH + TGAP);
        S.box('ar' + idx, { x: ATX, y: ty, w: TW, h: TH, text: String(t[0]), style: 'normal', size: 13 });
        S.box('ac' + idx, { x: ATX + TW + TGAP, y: ty, w: TW, h: TH, text: String(t[1]), style: 'normal', size: 13 });
        S.box('av' + idx, { x: ATX + 2 * (TW + TGAP), y: ty, w: TW, h: TH, text: String(t[2]), style: 'normal', size: 13 });
      });

      var gridBottom = Y0 + rows * (H + GAP);
      var CY = gridBottom + 74, CW = 40, CH = 34, CGAP = 4;
      S.label('cntlbl', { x: X0 - 14, y: CY + CH / 2 + 5, text: T('sayım[] =', 'count[] ='), anchor: 'end', size: 13, bold: true, mono: true });
      for (var c0 = 0; c0 < cols; c0++) S.box('cnt' + c0, { x: X0 + c0 * (CW + CGAP), y: CY, w: CW, h: CH, text: '0', style: 'empty', size: 13, above: String(c0) });
      S.brace('cntbrace', { from: 'cnt0', to: 'cnt' + (cols - 1), text: T('sütun başına sıfır olmayan sayısı', 'nonzero count per column'), side: 'bottom', dist: 14, style: 'dim' });

      var PY = CY + 130;
      S.label('poslbl', { x: X0 - 14, y: PY + CH / 2 + 5, text: T('konum[] =', 'pos[] ='), anchor: 'end', size: 13, bold: true, mono: true });
      for (var c1 = 0; c1 < cols; c1++) S.box('pos' + c1, { x: X0 + c1 * (CW + CGAP), y: PY, w: CW, h: CH, text: '', style: 'empty', size: 13, above: String(c1) });
      S.brace('posbrace', { from: 'pos0', to: 'pos' + (cols - 1), text: T('sütun c, b[]\'de burada başlar', 'column c starts here in b[]'), side: 'bottom', dist: 14, style: 'dim' });

      var BTX = X0, BTY = PY + 130;
      S.label('blabel', { x: BTX - 14, y: BTY - 24, text: T('b[] (devrik) =', 'b[] (transpose) ='), anchor: 'start', bold: true, mono: true, size: 13 });
      ['row', 'col', 'value'].forEach(function (h, c) { S.label('bth' + c, { x: BTX + c * (TW + TGAP) + TW / 2, y: BTY - 4, text: h, style: 'dim', size: 12, mono: true }); });

      S.step(T('Amaç: `a[]`\'deki ' + nnz + ' üçlüyü, `row` ve `col` yer değiştirmiş halde, devriğin satır-öncelikli sırasına göre `b[]`\'ye yerleştirmek -- ama YENİDEN SIRALAMADAN.',
               'Goal: place the ' + nnz + ' triplets of `a[]` into `b[]` with `row` and `col` swapped, in the row-major order of the transpose -- but WITHOUT re-sorting.'), L_STRUCT);

      var count = new Array(cols).fill(0);
      orig.forEach(function (t, idx) {
        S.at(t[0] * cols + t[1]);
        S.set('c' + t[0] + '_' + t[1], { style: 'hl' });
        S.set('ar' + idx, { style: 'hl' }); S.set('ac' + idx, { style: 'hl' }); S.set('av' + idx, { style: 'hl' });
        count[t[1]]++;
        S.set('cnt' + t[1], { text: String(count[t[1]]), style: 'hl' });
        if (idx < 2) S.step(T('`count[a[' + idx + '].col] = count[' + t[1] + ']++`: sütun ' + t[1] + '\'de şimdiye kadar ' + count[t[1]] + ' sıfır olmayan var.',
                              '`count[a[' + idx + '].col] = count[' + t[1] + ']++`: column ' + t[1] + ' has ' + count[t[1]] + ' nonzero' + (count[t[1]] === 1 ? '' : 's') + ' so far.'), L_COUNT_LOOP);
        S.set('c' + t[0] + '_' + t[1], { style: 'dim' });
        S.set('ar' + idx, { style: 'dim' }); S.set('ac' + idx, { style: 'dim' }); S.set('av' + idx, { style: 'dim' });
      });
      S.at(null);
      for (var c2 = 0; c2 < cols; c2++) S.set('cnt' + c2, { style: 'normal' });
      if (nnz > 2) S.step(T('İlk geçiş bitti: `count[]` = [' + count.join(', ') + '].', 'First pass done: `count[]` = [' + count.join(', ') + '].'), L_COUNT_LOOP);

      var pos = new Array(cols); pos[0] = 0;
      S.set('pos0', { text: '0', style: 'new' });
      S.step(T('`pos[0] = 0`: sütun 0\'ın üçlüleri `b[]`\'nin başında (indis 0) başlar.', '`pos[0] = 0`: column 0\'s triplets start at the very beginning of `b[]` (index 0).'), L_POS_INIT);
      for (var c3 = 1; c3 < cols; c3++) {
        pos[c3] = pos[c3 - 1] + count[c3 - 1];
        S.set('pos' + c3, { text: String(pos[c3]), style: 'new' });
        S.step(T('`pos[' + c3 + '] = pos[' + (c3 - 1) + '] + count[' + (c3 - 1) + ']` = ' + pos[c3 - 1] + ' + ' + count[c3 - 1] + ' = ' + pos[c3] + '.',
                 '`pos[' + c3 + '] = pos[' + (c3 - 1) + '] + count[' + (c3 - 1) + ']` = ' + pos[c3 - 1] + ' + ' + count[c3 - 1] + ' = ' + pos[c3] + '.'), L_POS_LOOP);
      }
      for (var c4 = 0; c4 < cols; c4++) S.set('pos' + c4, { style: 'normal' });

      var cursor = pos.slice(), placed = new Array(nnz);
      orig.forEach(function (t, idx) {
        S.at(t[0] * cols + t[1]);
        var c5 = t[1], p = cursor[c5]++;
        var by = BTY + p * (TH + TGAP);
        S.box('br' + p, { x: BTX, y: by, w: TW, h: TH, text: String(t[1]), style: 'new', size: 13 });
        S.box('bc' + p, { x: BTX + TW + TGAP, y: by, w: TW, h: TH, text: String(t[0]), style: 'new', size: 13 });
        S.box('bv' + p, { x: BTX + 2 * (TW + TGAP), y: by, w: TW, h: TH, text: String(t[2]), style: 'new', size: 13 });
        placed[p] = [t[1], t[0], t[2]];
        if (idx < 2) S.step(T('`p = pos[' + c5 + ']++` = ' + p + ': `b[' + p + '] = (row=' + t[1] + ', col=' + t[0] + ', value=' + t[2] + ')` -- satır ve sütun YER DEĞİŞTİ.',
                              '`p = pos[' + c5 + ']++` = ' + p + ': `b[' + p + '] = (row=' + t[1] + ', col=' + t[0] + ', value=' + t[2] + ')` -- row and col SWAPPED.'), L_PLACE_LOOP);
      });
      S.at(null);
      if (nnz > 2) S.step(T('İkinci geçiş bitti: `b[]` dolduruldu, hiçbir yeniden sıralama gerekmedi.', 'Second pass done: `b[]` is filled, no re-sorting was ever needed.'), L_PLACE_LOOP);

      S.result = { transposeTriplets: placed, count: nnz };
      S.step(T('Bitti: ' + nnz + ' üçlü, `b[]`\'ye tek bir ek geçişte (O(nnz + COLS)) yerleşti -- genel sıralamadan (O(nnz log nnz)) çok daha hızlı.',
               'Done: ' + nnz + ' triplets landed in `b[]` with just one extra pass (O(nnz + COLS)) -- much faster than a general sort (O(nnz log nnz)).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
