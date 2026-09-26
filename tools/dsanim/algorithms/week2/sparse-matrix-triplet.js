/* Week 2 -- a sparse matrix (mostly zeros) wastes memory if stored densely. Scan it row-major and record only the
 * NONZERO cells as (row, col, value) triplets: a table that can be a fraction of the size of the full matrix.
 * Matches sparse_matrix_triplet.c / SparseMatrixTriplet.java (the triplet representation). */
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
        'int to_triplets(int mat[ROWS][COLS], Triplet out[]) {',
        '    int k = 0;',
        '    for (int i = 0; i < ROWS; i++)',
        '        for (int j = 0; j < COLS; j++)',
        '            if (mat[i][j] != 0) {',
        '                out[k].row = i;',
        '                out[k].col = j;',
        '                out[k].value = mat[i][j];',
        '                k++;',
        '            }',
        '    return k;',
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
        'static Triplet[] toTriplets(int[][] mat) {',
        '    Triplet[] out = new Triplet[ROWS * COLS];',
        '    int k = 0;',
        '    for (int i = 0; i < ROWS; i++)',
        '        for (int j = 0; j < COLS; j++)',
        '            if (mat[i][j] != 0)',
        '                out[k++] = new Triplet(i, j, mat[i][j]);',
        '    Triplet[] trimmed = new Triplet[k];',
        '    System.arraycopy(out, 0, trimmed, 0, k);',
        '    return trimmed;',
        '}'
      ]
    };
  }
  var L_DECL = { c: [1, 2], java: [1, 2] };
  var L_STRUCT = { c: [4, 5, 6], java: [4, 5, 6, 7] };
  var L_SCAN = { c: [9, 10], java: [11, 12] };
  var L_CHECK = { c: [11], java: [13] };
  var L_STORE = { c: [12, 13, 14, 15], java: [14] };
  var L_DONE = { c: [17], java: [16, 17, 18] };

  D.define({
    id: 'sparse-matrix-triplet',
    title: T('Seyrek matris: triplet (satır, sütun, değer) gösterimi', 'Sparse matrix: the triplet (row, col, value) representation'),
    code: makeCode,
    presets: [
      { id: 'normal', level: 'normal', name: T('5x6 (30 hücre), yalnız 6 sıfır olmayan', '5x6 (30 cells), only 6 nonzero'),
        data: { rows: 5, cols: 6, mat: [
          [0, 0, 3, 0, 0, 0], [0, 0, 0, 0, 4, 0], [0, 5, 0, 0, 0, 0], [0, 0, 0, 0, 0, 7], [6, 0, 0, 8, 0, 0]
        ] } },
      { id: 'hard', level: 'hard', name: T('6x6 (36 hücre), 9 sıfır olmayan (negatif dahil)', '6x6 (36 cells), 9 nonzero (negatives included)'),
        data: { rows: 6, cols: 6, mat: [
          [0, -3, 0, 0, 0, 5], [0, 0, 0, 9, 0, 0], [7, 0, 0, 0, 0, 0], [0, 0, -12, 0, 4, 0], [0, 0, 0, 0, 0, 0], [2, 0, 0, -6, 0, 11]
        ] } },
      { id: 'all-zero', level: 'edge', name: T('4x4 (16 hücre), hepsi sıfır: triplet tablosu boş kalır', '4x4 (16 cells), all zero: the triplet table stays empty'),
        data: { rows: 4, cols: 4, mat: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] } },
      { id: 'fully-dense', level: 'edge', name: T('4x3 (12 hücre), hepsi sıfır olmayan: triplet dizi kadar büyür', '4x3 (12 cells), all nonzero: the triplet table grows as large as the array'),
        data: { rows: 4, cols: 3, mat: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of dense-matrix cells (the input the student types), not the nonzero count. */
    size: function (d) { return d.rows * d.cols; },
    /** Independent computation with Array#forEach (build() uses an explicit nested for-loop to animate the scan). */
    reference: function (d) {
      var triplets = [];
      d.mat.forEach(function (row, i) { row.forEach(function (v, j) { if (v !== 0) triplets.push([i, j, v]); }); });
      return { triplets: triplets, rows: d.rows, cols: d.cols, nnz: triplets.length };
    },
    random: function (level, r) {
      var dims = { easy: [4, 4], normal: [5, 6], hard: [6, 6], extreme: [6, 7] }[level];
      var rows = dims[0], cols = dims[1];
      var density = level === 'extreme' ? 0.35 : 0.22;
      var lo = level === 'extreme' ? -300 : 1, hi = level === 'extreme' ? 300 : 99;
      var mat = [];
      for (var i = 0; i < rows; i++) {
        var row = [];
        for (var j = 0; j < cols; j++) row.push(r() < density ? D.randInt(r, lo, hi) || 1 : 0);
        mat.push(row);
      }
      return { rows: rows, cols: cols, mat: mat };
    },
    input: {
      hint: T('Örnek: rows=5 cols=6  0 0 3 0 0 0; 0 0 0 0 4 0; 0 5 0 0 0 0; 0 0 0 0 0 7; 6 0 0 8 0 0',
              'Example: rows=5 cols=6  0 0 3 0 0 0; 0 0 0 0 4 0; 0 5 0 0 0 0; 0 0 0 0 0 7; 6 0 0 8 0 0'),
      parse: function (text) {
        var rest = [];
        String(text).trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
          if (/^(rows|cols)[=:]\d+$/i.test(tok)) return; // dimensions are inferred from the rows typed; tokens accepted but not required
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
      var W = 46, H = 38, GAP = 5, X0 = 150, Y0 = 70;
      for (var i = 0; i < rows; i++) {
        S.label('rl' + i, { x: X0 - 14, y: Y0 + i * (H + GAP) + H / 2 + 5, text: 'M[' + i + '] =', anchor: 'end', size: 13, bold: true, mono: true });
        for (var j = 0; j < cols; j++) {
          var p = { x: X0 + j * (W + GAP), y: Y0 + i * (H + GAP), w: W, h: H, text: String(mat[i][j]), style: mat[i][j] === 0 ? 'empty' : 'normal', size: 13 };
          if (i === 0) p.above = String(j);
          S.box('c' + i + '_' + j, p);
        }
      }
      var gridBottom = Y0 + rows * (H + GAP);
      var TX = X0, TY = gridBottom + 70, TW = 64, TH = 32, TGAP = 4;
      S.label('info', { x: X0 - 14, y: TY - 30, text: 'rows=' + rows + ', cols=' + cols + ', count=0', anchor: 'start', bold: true, mono: true, size: 16 });
      ['row', 'col', 'value'].forEach(function (h, c) { S.label('th' + c, { x: TX + c * (TW + TGAP) + TW / 2, y: TY - 8, text: h, style: 'dim', size: 13, mono: true }); });
      S.step(T('Yoğun bir matriste her hücre (sıfır olsa bile) yer kaplar. `to_triplets`, sıfır OLMAYAN hücreleri satır satır tarayıp `(row, col, value)` üçlüleri olarak listeler.',
               'In a dense matrix every cell takes space, even the zeros. `to_triplets` scans row-major and lists only the NONZERO cells as `(row, col, value)` triplets.'), L_STRUCT);

      var count = 0, zeroShown = false;
      for (var ri = 0; ri < rows; ri++) {
        for (var rj = 0; rj < cols; rj++) {
          S.at(ri * cols + rj);
          var v = mat[ri][rj];
          S.set('c' + ri + '_' + rj, { style: 'hl' });
          if (v !== 0) {
            S.step(T('`M[' + ri + '][' + rj + '] = ' + v + '`: sıfır değil -- triplet tablosuna eklenir.', '`M[' + ri + '][' + rj + '] = ' + v + '`: nonzero -- added to the triplet table.'), L_CHECK);
            var ty = TY + count * (TH + TGAP);
            S.box('tr' + count, { x: TX, y: ty, w: TW, h: TH, text: String(ri), style: 'new', size: 14 });
            S.box('tc' + count, { x: TX + TW + TGAP, y: ty, w: TW, h: TH, text: String(rj), style: 'new', size: 14 });
            S.box('tv' + count, { x: TX + 2 * (TW + TGAP), y: ty, w: TW, h: TH, text: String(v), style: 'new', size: 14 });
            count++;
            S.set('c' + ri + '_' + rj, { style: 'dim' });
            S.set('info', { text: 'rows=' + rows + ', cols=' + cols + ', count=' + count });
            S.step(T('`out[' + (count - 1) + '] = (' + ri + ', ' + rj + ', ' + v + ')`, `k++` -> ' + count + '.', '`out[' + (count - 1) + '] = (' + ri + ', ' + rj + ', ' + v + ')`, `k++` -> ' + count + '.'), L_STORE);
          } else if (!zeroShown) {
            zeroShown = true;
            S.step(T('`M[' + ri + '][' + rj + '] = 0`: atlanır, tabloya girmez. Kalan sıfırlar sessizce atlanacak.', '`M[' + ri + '][' + rj + '] = 0`: skipped, it never enters the table. The remaining zeros will be skipped silently.'), L_CHECK);
            S.set('c' + ri + '_' + rj, { style: 'dim' });
          } else {
            S.set('c' + ri + '_' + rj, { style: 'dim' });
          }
        }
      }
      S.at(null);
      var total = rows * cols, wasted = total ? Math.round(100 * (total - count) / total) : 0;
      S.result = { triplets: (function () { var out = []; for (var k = 0; k < count; k++) out.push([Number(S.get('tr' + k).text), Number(S.get('tc' + k).text), Number(S.get('tv' + k).text)]); return out; })(), rows: rows, cols: cols, nnz: count };
      S.step(T('Bitti: ' + total + ' hücreden yalnız ' + count + ' tanesi sıfır değil (%' + wasted + ' sıfıra ayrılırdı). Triplet tablosu ' + count + ' satır -- yoğun matristen çok daha küçük.',
               'Done: only ' + count + ' of ' + total + ' cells are nonzero (%' + wasted + ' would be wasted on zeros). The triplet table has ' + count + ' row' + (count === 1 ? '' : 's') + ' -- far smaller than the dense matrix.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
