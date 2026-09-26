/* Week 2 -- add two sparse matrices directly in triplet form: merge a[] and b[] (both already sorted row-major)
 * like the merge step of merge sort. Whichever triplet has the earlier (row, col) is copied to the output; when
 * both lists have the SAME (row, col), their values are summed, and the entry is dropped entirely if the sum is
 * zero. Matches sparse_matrix_addition.c / SparseMatrixAddition.java. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct {',
    '    int row, col, value;',
    '} Triplet;',
    '',
    '/* Both a[] and b[] must already be sorted in row-major order.',
    '   Returns the number of entries written to out[]. */',
    'int add_sparse(Triplet a[], int na, Triplet b[], int nb, Triplet out[]) {',
    '    int i = 0, j = 0, k = 0;',
    '    while (i < na && j < nb) {',
    '        if (a[i].row < b[j].row || (a[i].row == b[j].row && a[i].col < b[j].col)) {',
    '            out[k++] = a[i++];                       /* a\'s entry comes first */',
    '        } else if (a[i].row > b[j].row || (a[i].row == b[j].row && a[i].col > b[j].col)) {',
    '            out[k++] = b[j++];                       /* b\'s entry comes first */',
    '        } else {',
    '            int sum = a[i].value + b[j].value;       /* same cell in both */',
    '            if (sum != 0) {',
    '                out[k].row = a[i].row;',
    '                out[k].col = a[i].col;',
    '                out[k].value = sum;',
    '                k++;',
    '            }',
    '            i++;',
    '            j++;',
    '        }',
    '    }',
    '    while (i < na) out[k++] = a[i++];',
    '    while (j < nb) out[k++] = b[j++];',
    '    return k;',
    '}'
  ];
  var JAVA = [
    'static class Triplet {',
    '    int row, col, value;',
    '    Triplet(int row, int col, int value) { this.row = row; this.col = col; this.value = value; }',
    '}',
    '',
    '// Both a[] and b[] must already be sorted in row-major order.',
    'static Triplet[] addSparse(Triplet[] a, Triplet[] b) {',
    '    Triplet[] out = new Triplet[a.length + b.length];',
    '    int i = 0, j = 0, k = 0;',
    '    while (i < a.length && j < b.length) {',
    '        if (a[i].row < b[j].row || (a[i].row == b[j].row && a[i].col < b[j].col)) {',
    '            out[k++] = a[i++];                          // a\'s entry comes first',
    '        } else if (a[i].row > b[j].row || (a[i].row == b[j].row && a[i].col > b[j].col)) {',
    '            out[k++] = b[j++];                          // b\'s entry comes first',
    '        } else {',
    '            int sum = a[i].value + b[j].value;          // same cell in both',
    '            if (sum != 0)',
    '                out[k++] = new Triplet(a[i].row, a[i].col, sum);',
    '            i++;',
    '            j++;',
    '        }',
    '    }',
    '    while (i < a.length) out[k++] = a[i++];',
    '    while (j < b.length) out[k++] = b[j++];',
    '    Triplet[] trimmed = new Triplet[k];',
    '    System.arraycopy(out, 0, trimmed, 0, k);',
    '    return trimmed;',
    '}'
  ];
  var L_A_FIRST = { c: [10, 11], java: [11, 12] };
  var L_B_FIRST = { c: [12, 13], java: [13, 14] };
  var L_SUM = { c: [14, 15, 16, 17, 18, 19, 20, 21], java: [15, 16, 17, 18] };
  var L_SUM_ZERO = { c: [15, 16, 22, 23], java: [16, 17, 19, 20] };
  var L_DRAIN = { c: [27, 28], java: [23, 24] };

  D.define({
    id: 'sparse-matrix-addition',
    title: T('Seyrek matris toplama: iki triplet listesini birleştirme', 'Sparse matrix addition: merging two triplet lists'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('3x4, 6+6 üçlü, bazı hücreler ortak', '3x4, 6+6 triplets, some cells shared'),
        data: { rows: 3, cols: 4, a: [[0, 0, 4], [0, 3, 2], [1, 1, 5], [2, 0, 3], [2, 2, 7], [2, 3, 1]], b: [[0, 0, 6], [0, 1, 3], [1, 1, -2], [1, 3, 8], [2, 1, 4], [2, 3, 9]] } },
      { id: 'hard', level: 'hard', name: T('4x4, 7+7 üçlü, negatif değerler, iptal yok', '4x4, 7+7 triplets, negative values, no cancellation'),
        data: { rows: 4, cols: 4, a: [[0, 1, -8], [0, 2, 5], [1, 0, 12], [1, 3, -4], [2, 2, 9], [3, 0, -15], [3, 3, 6]], b: [[0, 1, 3], [0, 3, 7], [1, 0, -10], [2, 1, 10], [2, 2, -5], [3, 0, 10], [3, 2, 2]] } },
      { id: 'no-overlap', level: 'edge', name: T('3x4, ortak hücre yok: her üçlü olduğu gibi kopyalanır', '3x4, no shared cells: every triplet is simply copied through'),
        data: { rows: 3, cols: 4, a: [[0, 0, 3], [0, 2, 5], [1, 1, 7], [2, 0, 9], [2, 3, 2]], b: [[0, 1, 4], [0, 3, 6], [1, 0, 8], [1, 2, -3], [2, 1, 10], [2, 2, -7]] } },
      { id: 'cancel', level: 'edge', name: T('3x3 (programın kendi örneği, genişletilmiş): üç hücre birbirini götürür', '3x3 (the program\'s own example, extended): three cells cancel out'),
        data: { rows: 3, cols: 3, a: [[0, 0, 5], [0, 2, 3], [1, 1, 4], [1, 2, -6], [2, 0, 2], [2, 1, 9]], b: [[0, 0, -5], [0, 1, 7], [1, 1, 6], [1, 2, 6], [2, 0, -2], [2, 2, 9]] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of input triplets: |a| + |b|. */
    size: function (d) { return d.a.length + d.b.length; },
    /** Independent computation with a hashmap keyed by "row,col" (build() uses a two-pointer merge, a different technique). */
    reference: function (d) {
      var map = {};
      d.a.concat(d.b).forEach(function (t) { var key = t[0] + ',' + t[1]; map[key] = (map[key] || 0) + t[2]; });
      var out = Object.keys(map).map(function (k) { var p = k.split(',').map(Number); return [p[0], p[1], map[k]]; }).filter(function (t) { return t[2] !== 0; });
      out.sort(function (x, y) { return x[0] - y[0] || x[1] - y[1]; });
      return { sum: out, count: out.length };
    },
    random: function (level, r) {
      var rows = level === 'extreme' ? 5 : 4, cols = level === 'extreme' ? 5 : 4;
      var count = { easy: 5, normal: 6, hard: 7, extreme: 8 }[level];
      var lo = level === 'extreme' ? -300 : -60, hi = level === 'extreme' ? 300 : 60;
      function makeList(n) {
        var used = {}, list = [];
        while (list.length < n) {
          var i = D.randInt(r, 0, rows - 1), j = D.randInt(r, 0, cols - 1), key = i + ',' + j;
          if (used[key]) continue;
          used[key] = true;
          var v = D.randInt(r, lo, hi); if (v === 0) v = 1;
          list.push([i, j, v]);
        }
        list.sort(function (p, q) { return p[0] - q[0] || p[1] - q[1]; });
        return list;
      }
      return { rows: rows, cols: cols, a: makeList(count), b: makeList(count) };
    },
    input: {
      hint: T('Örnek: rows=3 cols=3  a0,0,5 a0,2,3  b0,0,-5 b0,1,7   (aR,C,V ya da bR,C,V; her liste satır-öncelikli sıralı, tekrarsız)',
              'Example: rows=3 cols=3  a0,0,5 a0,2,3  b0,0,-5 b0,1,7   (aR,C,V or bR,C,V; each list sorted row-major, no duplicate positions)'),
      parse: function (text) {
        var rows = null, cols = null, a = [], b = [];
        String(text).trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
          var mr = /^rows[=:](\d+)$/i.exec(tok); if (mr) { rows = parseInt(mr[1], 10); return; }
          var mc = /^cols[=:](\d+)$/i.exec(tok); if (mc) { cols = parseInt(mc[1], 10); return; }
          var m = /^([ab])(-?\d+),(-?\d+),(-?\d+)$/i.exec(tok);
          if (!m) throw T('"' + tok + '" anlaşılmadı: aR,C,V ya da bR,C,V yazın.', '"' + tok + '" is not understood: write aR,C,V or bR,C,V.');
          var v = parseInt(m[4], 10);
          if (v === 0) throw T('Değer 0 olamaz (sıfır hücreler üçlü listesine girmez).', 'The value cannot be 0 (zero cells never enter a triplet list).');
          (m[1].toLowerCase() === 'a' ? a : b).push([parseInt(m[2], 10), parseInt(m[3], 10), v]);
        });
        if (rows === null || cols === null) throw T('rows=N ve cols=N yazmalısınız.', 'You must write rows=N and cols=N.');
        if (a.length + b.length < 2) throw T('En az 2 üçlü yazın (a ve/veya b).', 'Write at least 2 triplets (a and/or b).');
        if (a.length + b.length > 40) throw T('En çok 40 üçlü.', 'At most 40 triplets.');
        function sorted(list) { for (var i = 1; i < list.length; i++) { if (list[i][0] < list[i - 1][0] || (list[i][0] === list[i - 1][0] && list[i][1] <= list[i - 1][1])) return false; } return true; }
        if (!sorted(a)) throw T('a listesi satır-öncelikli sıralı olmalı (tekrarsız konumlar).', 'List a must be sorted row-major (no duplicate positions).');
        if (!sorted(b)) throw T('b listesi satır-öncelikli sıralı olmalı (tekrarsız konumlar).', 'List b must be sorted row-major (no duplicate positions).');
        return { rows: rows, cols: cols, a: a, b: b };
      },
      format: function (d) { return 'rows=' + d.rows + ' cols=' + d.cols + '  ' + d.a.map(function (t) { return 'a' + t.join(','); }).concat(d.b.map(function (t) { return 'b' + t.join(','); })).join(' '); },
      tokens: function (d) { return d.a.map(function (t) { return 'a' + t.join(','); }).concat(d.b.map(function (t) { return 'b' + t.join(','); })); },
      bad: ['', 'rows=3 cols=3 a0,0,0', 'rows=3 cols=3 a0,0,5 a0,0,3', 'a0,0,5', 'rows=3 cols=3 x']
    },
    build: function (S, d) {
      var a = d.a, b = d.b, na = a.length, nb = b.length;
      var TW = 48, TH = 30, TGAP = 4, ATX = 150, ATY = 76, BTX = ATX + 3 * (TW + TGAP) + 110, BTY = ATY;
      function table(prefix, x, y, list, label) {
        S.label(prefix + 'lbl', { x: x - 14, y: y - 26, text: label, anchor: 'start', bold: true, mono: true, size: 15 });
        ['row', 'col', 'val'].forEach(function (h, c) { S.label(prefix + 'h' + c, { x: x + c * (TW + TGAP) + TW / 2, y: y - 6, text: h, style: 'dim', size: 12, mono: true }); });
        list.forEach(function (t, idx) {
          var ty = y + idx * (TH + TGAP);
          S.box(prefix + 'r' + idx, { x: x, y: ty, w: TW, h: TH, text: String(t[0]), style: 'normal', size: 13 });
          S.box(prefix + 'c' + idx, { x: x + TW + TGAP, y: ty, w: TW, h: TH, text: String(t[1]), style: 'normal', size: 13 });
          S.box(prefix + 'v' + idx, { x: x + 2 * (TW + TGAP), y: ty, w: TW, h: TH, text: String(t[2]), style: 'normal', size: 13 });
        });
      }
      table('a', ATX, ATY, a, 'a[] =');
      table('b', BTX, BTY, b, 'b[] =');
      var tallest = Math.max(na, nb);
      var SY = ATY + tallest * (TH + TGAP) + 90, SX = ATX;
      S.label('slbl', { x: SX - 14, y: SY - 26, text: T('toplam (sum) =', 'sum ='), anchor: 'start', bold: true, mono: true, size: 15 });
      ['row', 'col', 'val'].forEach(function (h, c) { S.label('sh' + c, { x: SX + c * (TW + TGAP) + TW / 2, y: SY - 6, text: h, style: 'dim', size: 12, mono: true }); });
      var noteX = BTX + 3 * (TW + TGAP) + 20;
      S.label('note', { x: noteX, y: ATY, text: '', anchor: 'start', size: 14, bold: true, mono: true, style: 'dim' });

      function pointI(i) { if (i < na) { if (S.has('ip')) S.set('ip', { target: 'ar' + i }); else S.pointer('ip', { target: 'ar' + i, text: 'i', side: 'left', dist: 40 }); } else if (S.has('ip')) S.remove('ip'); }
      function pointJ(j) { if (j < nb) { if (S.has('jp')) S.set('jp', { target: 'br' + j }); else S.pointer('jp', { target: 'br' + j, text: 'j', side: 'left', dist: 40 }); } else if (S.has('jp')) S.remove('jp'); }
      pointI(0); pointJ(0);

      S.step(T('İki liste de `(row, col)`\'a göre sıralı: sıralı-birleştirme (merge) yapabiliriz, `add_sparse`\'ta tam bir tarama gerekmez. `i` = a[], `j` = b[] işaretçisi.',
               'Both lists are sorted by `(row, col)`: we can merge them, `add_sparse` never needs a full scan. `i` = pointer into a[], `j` = pointer into b[].'), L_A_FIRST);

      var i = 0, j = 0, k = 0, tokIdx = function (side, idx) { return side === 'a' ? idx : na + idx; };
      var out = [], shown = 0;
      while (i < na && j < nb) {
        var detailed = shown < 3;
        var ai = a[i], bj = b[j];
        var cmp = ai[0] !== bj[0] ? ai[0] - bj[0] : ai[1] - bj[1];
        if (cmp < 0) {
          S.at(tokIdx('a', i));
          S.set('ar' + i, { style: 'hl' }); S.set('ac' + i, { style: 'hl' }); S.set('av' + i, { style: 'hl' });
          var sy1 = SY + k * (TH + TGAP);
          S.box('sr' + k, { x: SX, y: sy1, w: TW, h: TH, text: String(ai[0]), style: 'new', size: 13 });
          S.box('sc' + k, { x: SX + TW + TGAP, y: sy1, w: TW, h: TH, text: String(ai[1]), style: 'new', size: 13 });
          S.box('sv' + k, { x: SX + 2 * (TW + TGAP), y: sy1, w: TW, h: TH, text: String(ai[2]), style: 'new', size: 13 });
          out.push([ai[0], ai[1], ai[2]]); k++;
          S.set('ar' + i, { style: 'dim' }); S.set('ac' + i, { style: 'dim' }); S.set('av' + i, { style: 'dim' });
          i++; pointI(i); pointJ(j);
          S.set('note', { text: T('a önce', 'a first') });
          if (detailed) { shown++; S.step(T('`a[i]` (' + ai[0] + ',' + ai[1] + ') daha önce gelir: doğrudan kopyalanır.', '`a[i]` (' + ai[0] + ',' + ai[1] + ') comes first: copied through as is.'), L_A_FIRST); }
        } else if (cmp > 0) {
          S.at(tokIdx('b', j));
          S.set('br' + j, { style: 'hl' }); S.set('bc' + j, { style: 'hl' }); S.set('bv' + j, { style: 'hl' });
          var sy2 = SY + k * (TH + TGAP);
          S.box('sr' + k, { x: SX, y: sy2, w: TW, h: TH, text: String(bj[0]), style: 'new', size: 13 });
          S.box('sc' + k, { x: SX + TW + TGAP, y: sy2, w: TW, h: TH, text: String(bj[1]), style: 'new', size: 13 });
          S.box('sv' + k, { x: SX + 2 * (TW + TGAP), y: sy2, w: TW, h: TH, text: String(bj[2]), style: 'new', size: 13 });
          out.push([bj[0], bj[1], bj[2]]); k++;
          S.set('br' + j, { style: 'dim' }); S.set('bc' + j, { style: 'dim' }); S.set('bv' + j, { style: 'dim' });
          j++; pointI(i); pointJ(j);
          S.set('note', { text: T('b önce', 'b first') });
          if (detailed) { shown++; S.step(T('`b[j]` (' + bj[0] + ',' + bj[1] + ') daha önce gelir: doğrudan kopyalanır.', '`b[j]` (' + bj[0] + ',' + bj[1] + ') comes first: copied through as is.'), L_B_FIRST); }
        } else {
          S.at(tokIdx('a', i));
          S.set('ar' + i, { style: 'active' }); S.set('ac' + i, { style: 'active' }); S.set('av' + i, { style: 'active' });
          S.set('br' + j, { style: 'active' }); S.set('bc' + j, { style: 'active' }); S.set('bv' + j, { style: 'active' });
          var sum = ai[2] + bj[2];
          if (sum !== 0) {
            var sy3 = SY + k * (TH + TGAP);
            S.box('sr' + k, { x: SX, y: sy3, w: TW, h: TH, text: String(ai[0]), style: 'new', size: 13 });
            S.box('sc' + k, { x: SX + TW + TGAP, y: sy3, w: TW, h: TH, text: String(ai[1]), style: 'new', size: 13 });
            S.box('sv' + k, { x: SX + 2 * (TW + TGAP), y: sy3, w: TW, h: TH, text: String(sum), style: 'new', size: 13 });
            out.push([ai[0], ai[1], sum]); k++;
            S.set('note', { text: T('toplam=' + sum, 'sum=' + sum) });
          } else {
            S.set('note', { text: T('toplam=0, İPTAL!', 'sum=0, CANCELLED!') });
          }
          S.set('ar' + i, { style: 'dim' }); S.set('ac' + i, { style: 'dim' }); S.set('av' + i, { style: 'dim' });
          S.set('br' + j, { style: 'dim' }); S.set('bc' + j, { style: 'dim' }); S.set('bv' + j, { style: 'dim' });
          i++; j++; pointI(i); pointJ(j);
          if (detailed) {
            shown++;
            S.step(sum !== 0
              ? T('Aynı hücre (' + ai[0] + ',' + ai[1] + ') her iki listede de var: `' + ai[2] + ' + ' + bj[2] + ' = ' + sum + '` -- tabloya eklenir.', 'The same cell (' + ai[0] + ',' + ai[1] + ') is in both lists: `' + ai[2] + ' + ' + bj[2] + ' = ' + sum + '` -- added to the table.')
              : T('Aynı hücre (' + ai[0] + ',' + ai[1] + '): `' + ai[2] + ' + ' + bj[2] + ' = 0` -- **iptal**, hiçbir şey yazılmaz.', 'The same cell (' + ai[0] + ',' + ai[1] + '): `' + ai[2] + ' + ' + bj[2] + ' = 0` -- **cancelled**, nothing is written.'),
              sum !== 0 ? L_SUM : L_SUM_ZERO);
          }
        }
      }
      if (shown >= 3 && (i < na || j < nb)) S.step(T('Kalan tek liste artık sıralı olduğu için doğrudan kopyalanır.', 'Only one list remains, and it is already sorted, so it is simply copied through.'), L_DRAIN);
      while (i < na) {
        S.at(tokIdx('a', i));
        var sy4 = SY + k * (TH + TGAP);
        S.box('sr' + k, { x: SX, y: sy4, w: TW, h: TH, text: String(a[i][0]), style: 'new', size: 13 });
        S.box('sc' + k, { x: SX + TW + TGAP, y: sy4, w: TW, h: TH, text: String(a[i][1]), style: 'new', size: 13 });
        S.box('sv' + k, { x: SX + 2 * (TW + TGAP), y: sy4, w: TW, h: TH, text: String(a[i][2]), style: 'new', size: 13 });
        out.push([a[i][0], a[i][1], a[i][2]]); k++; i++;
      }
      while (j < nb) {
        S.at(tokIdx('b', j));
        var sy5 = SY + k * (TH + TGAP);
        S.box('sr' + k, { x: SX, y: sy5, w: TW, h: TH, text: String(b[j][0]), style: 'new', size: 13 });
        S.box('sc' + k, { x: SX + TW + TGAP, y: sy5, w: TW, h: TH, text: String(b[j][1]), style: 'new', size: 13 });
        S.box('sv' + k, { x: SX + 2 * (TW + TGAP), y: sy5, w: TW, h: TH, text: String(b[j][2]), style: 'new', size: 13 });
        out.push([b[j][0], b[j][1], b[j][2]]); k++; j++;
      }
      S.at(null);
      if (S.has('ip')) S.remove('ip'); if (S.has('jp')) S.remove('jp');
      S.set('note', { text: '' });
      S.result = { sum: out, count: out.length };
      S.step(T('Bitti: ' + na + ' + ' + nb + ' üçlü tek bir birleştirmede (merge) ' + out.length + ' sonuç üçlüsüne indi (' + (na + nb - out.length) + ' iptal/örtüşme). O(na + nb), yeniden sıralama yok.',
               'Done: ' + na + ' + ' + nb + ' triplets merged in one pass into ' + out.length + ' result triplet' + (out.length === 1 ? '' : 's') + ' (' + (na + nb - out.length) + ' cancelled/merged away). O(na + nb), no re-sorting.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
