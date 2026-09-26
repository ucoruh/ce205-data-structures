/* Week 2 -- a 2D matrix is really flat, 1D memory underneath. Row-major storage places mat[i][j] at word offset
 * i*COLS+j (column-major: j*ROWS+i). A traversal that matches the storage order visits consecutive memory words
 * (Delta = +1, cache-friendly); a traversal that goes the other way jumps by a whole row/column every step. This
 * animation shows the 2D grid, the 1D memory row (in true address order, grouped by contiguous row/column), and
 * the visiting order, side by side. No demo program yet for this topic. */
(function (D) {
  'use strict';
  var T = D.T;

  function makeCode(d) {
    var addrExpr = d.layout === 'row' ? 'i * COLS + j' : 'j * ROWS + i';
    var addrNote = d.layout === 'row' ? 'row-major: i * COLS + j' : 'column-major: j * ROWS + i';
    return {
      c: [
        '#define ROWS ' + d.rows,
        '#define COLS ' + d.cols,
        'int mat[ROWS][COLS];        /* the compiler lays this out ' + (d.layout === 'row' ? 'ROW-MAJOR' : 'COLUMN-MAJOR here') + ' */',
        '',
        '/* address of mat[i][j], counted in ints from the start of the array */',
        'int addr(int i, int j) {',
        '    return ' + addrExpr + ';   /* ' + addrNote + ' */',
        '}',
        '',
        'void traverse_row_major(int mat[ROWS][COLS]) {',
        '    for (int i = 0; i < ROWS; i++)',
        '        for (int j = 0; j < COLS; j++)',
        '            visit(mat[i][j]);',
        '}',
        '',
        'void traverse_col_major(int mat[ROWS][COLS]) {',
        '    for (int j = 0; j < COLS; j++)',
        '        for (int i = 0; i < ROWS; i++)',
        '            visit(mat[i][j]);',
        '}'
      ],
      java: [
        'static final int ROWS = ' + d.rows + ', COLS = ' + d.cols + ';',
        'int[][] mat = new int[ROWS][COLS];   // Java stores this ' + (d.layout === 'row' ? 'ROW-MAJOR' : 'COLUMN-MAJOR here (conceptually)'),
        '',
        '// address of mat[i][j], counted in ints from the start of the array',
        'static int addr(int i, int j) {',
        '    return ' + addrExpr + ';   // ' + addrNote,
        '}',
        '',
        'static void traverseRowMajor(int[][] mat) {',
        '    for (int i = 0; i < ROWS; i++)',
        '        for (int j = 0; j < COLS; j++)',
        '            visit(mat[i][j]);',
        '}',
        '',
        'static void traverseColMajor(int[][] mat) {',
        '    for (int j = 0; j < COLS; j++)',
        '        for (int i = 0; i < ROWS; i++)',
        '            visit(mat[i][j]);',
        '}'
      ]
    };
  }
  var L_DECL = [1, 2, 3];
  var L_ADDR = [6, 7, 8];
  var L_ROW = [10, 11, 12, 13];
  var L_COL = [16, 17, 18, 19];

  D.define({
    id: 'matrix-row-major',
    title: T('Matris hafızada: satır öncelikli mi, sütun öncelikli mi?', 'Matrix in memory: row-major or column-major?'),
    code: makeCode,
    presets: [
      { id: 'normal', level: 'normal', name: T('3x4 satır öncelikli, satır satır gezinme: hep bitişik', '3x4 row-major, row-by-row traversal: always adjacent'),
        data: { rows: 3, cols: 4, mat: [[8, 16, 24, 32], [40, 48, 56, 64], [72, 80, 88, 96]], layout: 'row', traversal: 'row' } },
      { id: 'hard', level: 'hard', name: T('4x4 satır öncelikli, sütun sütun gezinme: her adımda atlama', '4x4 row-major, column-by-column traversal: a jump on every step'),
        data: { rows: 4, cols: 4, mat: [[3, -7, 15, 22], [9, -14, 31, 6], [18, -2, 27, 11], [5, -19, 33, 8]], layout: 'row', traversal: 'col' } },
      { id: 'col-major-row-walk', level: 'edge', name: T('3x5 sütun öncelikli, satır satır gezinme: atlamalı', '3x5 column-major, row-by-row traversal: jumpy'),
        data: { rows: 3, cols: 5, mat: [[4, 9, -3, 16, 21], [7, -12, 25, 2, 18], [-6, 14, 8, -20, 30]], layout: 'col', traversal: 'row' } },
      { id: 'col-major-col-walk', level: 'edge', name: T('3x4 sütun öncelikli, sütun sütun gezinme: yine bitişik', '3x4 column-major, column-by-column traversal: adjacent again'),
        data: { rows: 3, cols: 4, mat: [[2, 5, -8, 13], [19, -4, 7, 22], [10, -15, 26, 1]], layout: 'col', traversal: 'col' } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of matrix values (rows x cols). */
    size: function (d) { return d.rows * d.cols; },
    /** Independent computation: its own address formula and its own traversal loop, no shared helper with build(). */
    reference: function (d) {
      var rows = d.rows, cols = d.cols, mat = d.mat;
      function address(i, j) { return d.layout === 'row' ? i * cols + j : j * rows + i; }
      var order = [];
      if (d.traversal === 'row') { for (var i = 0; i < rows; i++) for (var j = 0; j < cols; j++) order.push([i, j]); }
      else { for (var j2 = 0; j2 < cols; j2++) for (var i2 = 0; i2 < rows; i2++) order.push([i2, j2]); }
      var values = order.map(function (p) { return mat[p[0]][p[1]]; });
      var addresses = order.map(function (p) { return address(p[0], p[1]); });
      var seq = 0, maxJump = 0;
      for (var k = 1; k < addresses.length; k++) {
        var jump = Math.abs(addresses[k] - addresses[k - 1]);
        if (jump === 1) seq++;
        if (jump > maxJump) maxJump = jump;
      }
      return { values: values, addresses: addresses, sequentialSteps: seq, maxJump: maxJump };
    },
    random: function (level, r) {
      var dims = { easy: [3, 4], normal: [3, 4], hard: [4, 4], extreme: [4, 4] }[level];
      var rows = dims[0], cols = dims[1];
      var layout = r() < 0.5 ? 'row' : 'col';
      var traversal = r() < 0.5 ? 'row' : 'col';
      var lo = level === 'extreme' ? -300 : 1, hi = level === 'extreme' ? 300 : 99;
      var mat = [];
      for (var i = 0; i < rows; i++) { var row = []; for (var j = 0; j < cols; j++) row.push(D.randInt(r, lo, hi)); mat.push(row); }
      return { rows: rows, cols: cols, mat: mat, layout: layout, traversal: traversal };
    },
    input: {
      hint: T('Örnek: layout=row traversal=col  8 16 24 32; 40 48 56 64; 72 80 88 96',
              'Example: layout=row traversal=col  8 16 24 32; 40 48 56 64; 72 80 88 96'),
      parse: function (text) {
        var layout = 'row', traversal = 'row', rest = [];
        String(text).trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
          var ml = /^layout[=:](row|col)$/i.exec(tok); if (ml) { layout = ml[1].toLowerCase(); return; }
          var mt = /^traversal[=:](row|col)$/i.exec(tok); if (mt) { traversal = mt[1].toLowerCase(); return; }
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
        if (mat.length * cols > 30) throw T('En çok 30 değer.', 'At most 30 values.');
        return { rows: mat.length, cols: cols, mat: mat, layout: layout, traversal: traversal };
      },
      format: function (d) { return 'layout=' + d.layout + ' traversal=' + d.traversal + '  ' + d.mat.map(function (row) { return row.join(' '); }).join('; '); },
      tokens: function (d) { var out = []; d.mat.forEach(function (row) { row.forEach(function (v) { out.push(String(v)); }); }); return out; },
      bad: ['', 'layout=row traversal=row 1 2; 3', 'layout=x traversal=row 1 2;3 4', '1 2; a b', 'layout=row traversal=row 1;2;3']
    },
    build: function (S, d) {
      var rows = d.rows, cols = d.cols, mat = d.mat, N = rows * cols;
      var W = 54, H = 40, GAP = 6, X0 = 150, Y0 = 70;
      function address(i, j) { return d.layout === 'row' ? i * cols + j : j * rows + i; }

      for (var i = 0; i < rows; i++) {
        S.label('rl' + i, { x: X0 - 14, y: Y0 + i * (H + GAP) + H / 2 + 5, text: 'M[' + i + '] =', anchor: 'end', size: 14, bold: true, mono: true });
        for (var j = 0; j < cols; j++) {
          var p = { x: X0 + j * (W + GAP), y: Y0 + i * (H + GAP), w: W, h: H, text: String(mat[i][j]), style: 'normal', size: 15 };
          if (i === 0) p.above = String(j);
          S.box('c' + i + '_' + j, p);
        }
      }
      var gridBottom = Y0 + rows * (H + GAP);
      var MW = 44, MH = 40, MGAP = 5, MY = gridBottom + 92;
      var byAddr = [];
      for (var i2 = 0; i2 < rows; i2++) for (var j2 = 0; j2 < cols; j2++) byAddr[address(i2, j2)] = [i2, j2];
      for (var a = 0; a < N; a++) {
        var cell = byAddr[a];
        S.box('m' + a, { x: X0 + a * (MW + MGAP), y: MY, w: MW, h: MH, text: String(mat[cell[0]][cell[1]]), style: 'normal', size: 13, above: String(a) });
      }
      S.label('mlbl', { x: X0 - 14, y: MY + MH / 2 + 5, text: T('bellek =', 'mem ='), anchor: 'end', size: 14, bold: true, mono: true });
      var groupSize = d.layout === 'row' ? cols : rows, groupCount = d.layout === 'row' ? rows : cols;
      for (var g = 0; g < groupCount; g++) {
        var from = g * groupSize, to = from + groupSize - 1;
        S.brace('mg' + g, { from: 'm' + from, to: 'm' + to, text: (d.layout === 'row' ? T('satır ' + g, 'row ' + g) : T('sütun ' + g, 'col ' + g)), side: 'bottom', dist: 14, style: 'dim' });
      }
      var noteX = X0 + N * (MW + MGAP) + 16;
      S.label('note', { x: noteX, y: MY + MH / 2 + 5, text: '', anchor: 'start', size: 14, bold: true, mono: true, style: 'dim' });
      var OY = MY + 130;
      S.label('olbl', { x: X0 - 14, y: OY + H / 2 + 5, text: T('gezinme =', 'order ='), anchor: 'end', size: 14, bold: true, mono: true });

      S.step(T('`mat[' + rows + '][' + cols + ']` matrisi hafızada düz bir dizi: `addr(i, j) = ' + (d.layout === 'row' ? 'i*COLS+j' : 'j*ROWS+i') + '` (' + (d.layout === 'row' ? 'satır öncelikli' : 'sütun öncelikli') + '). Altta hafızayı GERÇEK adres sırasıyla gösteriyoruz.',
               'The `mat[' + rows + '][' + cols + ']` matrix is really flat in memory: `addr(i, j) = ' + (d.layout === 'row' ? 'i*COLS+j' : 'j*ROWS+i') + '` (' + (d.layout === 'row' ? 'row-major' : 'column-major') + '). Below, memory is shown in its TRUE address order.'),
             { c: L_DECL.concat(L_ADDR), java: L_DECL.concat(L_ADDR) });

      var order = [];
      if (d.traversal === 'row') { for (var ri = 0; ri < rows; ri++) for (var rj = 0; rj < cols; rj++) order.push([ri, rj]); }
      else { for (var cj = 0; cj < cols; cj++) for (var ci = 0; ci < rows; ci++) order.push([ci, cj]); }

      var visitedC = {}, visitedA = {}, prevAddr = null, seq = 0, maxJump = 0, values = [], addresses = [];
      order.forEach(function (pos, k) {
        var i3 = pos[0], j3 = pos[1], v = mat[i3][j3], addr = address(i3, j3);
        S.at(i3 * cols + j3);
        for (var q = 0; q < rows; q++) for (var w = 0; w < cols; w++) {
          var key = q + '_' + w;
          S.set('c' + key, { style: (q === i3 && w === j3) ? 'hl' : (visitedC[key] ? 'dim' : 'normal') });
        }
        for (var a2 = 0; a2 < N; a2++) S.set('m' + a2, { style: a2 === addr ? 'hl' : (visitedA[a2] ? 'dim' : 'normal') });
        visitedC[i3 + '_' + j3] = true; visitedA[addr] = true;
        S.box('o' + k, { x: X0 + k * (W + GAP), y: OY, w: W, h: H, text: String(v), style: 'new', size: 15, above: String(k) });
        values.push(v); addresses.push(addr);
        var jump = prevAddr === null ? null : addr - prevAddr;
        if (jump !== null) { if (Math.abs(jump) === 1) seq++; if (Math.abs(jump) > maxJump) maxJump = Math.abs(jump); }
        S.set('note', { text: jump === null ? T('ilk hücre', 'first cell') : (Math.abs(jump) === 1 ? T('Δ=' + (jump > 0 ? '+1' : '-1') + ' (bitişik)', 'Δ=' + (jump > 0 ? '+1' : '-1') + ' (adjacent)') : T('Δ=' + (jump > 0 ? '+' : '') + jump + ' (atlama!)', 'Δ=' + (jump > 0 ? '+' : '') + jump + ' (jump!)')) });
        prevAddr = addr;
        var detailed = k < 2;
        S.step(detailed
          ? T('`M[' + i3 + '][' + j3 + '] = ' + v + '`: `addr(' + i3 + ',' + j3 + ') = ' + addr + '`. ' + (jump === null ? 'Gezinmenin ilk hücresi.' : (Math.abs(jump) === 1 ? 'Bir önceki adresin HEMEN yanında -- bitişik bellek.' : 'Bir önceki adresten ' + Math.abs(jump) + ' uzakta -- bellekte ATLIYORUZ.')),
               '`M[' + i3 + '][' + j3 + '] = ' + v + '`: `addr(' + i3 + ',' + j3 + ') = ' + addr + '`. ' + (jump === null ? 'The first cell of the traversal.' : (Math.abs(jump) === 1 ? 'Right next to the previous address -- adjacent memory.' : Math.abs(jump) + ' away from the previous address -- we JUMP in memory.')))
          : T('`M[' + i3 + '][' + j3 + '] = ' + v + '` at `addr = ' + addr + '`.', '`M[' + i3 + '][' + j3 + '] = ' + v + '` at `addr = ' + addr + '`.'),
          { c: d.traversal === 'row' ? L_ROW : L_COL, java: d.traversal === 'row' ? L_ROW : L_COL });
      });
      S.at(null);
      for (var q2 = 0; q2 < rows; q2++) for (var w2 = 0; w2 < cols; w2++) S.set('c' + q2 + '_' + w2, { style: 'dim' });
      for (var a3 = 0; a3 < N; a3++) S.set('m' + a3, { style: 'dim' });
      S.set('note', { text: '' });
      S.result = { values: values, addresses: addresses, sequentialSteps: seq, maxJump: maxJump };
      S.step(T('Bitti: ' + N + ' hücre, ' + seq + '/' + (N - 1) + ' adım bitişik (Δ=1), en büyük atlama Δ=' + maxJump + '. ' + ((d.layout === d.traversal || (d.layout === 'row' && d.traversal === 'row') || (d.layout === 'col' && d.traversal === 'col')) ? 'Gezinme depolamayla EŞLEŞTİĞİ için önbellek dostu.' : 'Gezinme depolamayla ters düştüğü için önbellek İÇİN KÖTÜ.'),
               'Done: ' + N + ' cells, ' + seq + '/' + (N - 1) + ' step' + (N - 1 === 1 ? '' : 's') + ' adjacent (Δ=1), the biggest jump is Δ=' + maxJump + '. ' + ((d.layout === d.traversal) ? 'The traversal MATCHES the storage order, so it is cache-friendly.' : 'The traversal goes AGAINST the storage order, which is BAD for the cache.')));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
