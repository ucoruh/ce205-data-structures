/* Week 1 — pointer basics: a script of address-of, dereference, pointer copy (aliasing),
 * reassignment and NULL. A NULL-pointer dereference is flagged as undefined behavior (UB), never executed.
 * Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'int v[N];                        /* N int variables; addresses are consecutive */',
    'int *p = NULL, *q = NULL, *r = NULL;   /* always initialize pointers */',
    '',
    'p = &v[i];                       /* address-of: p now holds v[i]\'s address */',
    '*p = val;                        /* dereference write: assign through p */',
    '',
    'q = p;                           /* pointer copy: q now holds the SAME address -- alias */',
    '*q += k;                         /* write through q also changes v[i], since q aliases p */',
    '',
    'p = &v[j];                       /* p moves to a different variable */',
    'r = NULL;                        /* r holds no valid address */',
    '',
    'if (r != NULL)',
    '    *r = val;                    /* never reached: dereferencing NULL is undefined behavior (UB) */'
  ];
  var JAVA = [
    'int[] v = new int[N];',
    'int p = -1, q = -1, r = -1;      // -1 means "no reference yet" (an index into v, not a real address)',
    '',
    'p = i;                           // Java has no &; the closest equivalent of &v[i] is just the index i',
    'v[p] = val;                      // "*p = val" becomes v[p] = val',
    '',
    'q = p;                           // q now holds the SAME index -- p and q alias the same slot',
    'v[q] += k;                       // writing through q also changes v[i]',
    '',
    'p = j;',
    'r = -1;                          // r holds no valid index',
    '',
    'if (r != -1)',
    '    v[r] = val;                  // never reached in this script'
  ];
  var LINE = { addr: [4], set: [5], copy: [7], add: [8], null: [11], ub: [13, 14] };

  function names(ops) {
    var out = [];
    ops.forEach(function (op) {
      ['ptr', 'dst', 'src'].forEach(function (k) {
        if (op[k] !== undefined && out.indexOf(op[k]) === -1) out.push(op[k]);
      });
    });
    return out;
  }
  function opTok(op) {
    if (op.t === 'addr') return op.ptr + '=&v' + op.idx;
    if (op.t === 'null') return op.ptr + '=NULL';
    if (op.t === 'copy') return op.dst + '=' + op.src;
    if (op.t === 'set') return '*' + op.ptr + '=' + op.value;
    return '*' + op.ptr + '+=' + op.delta;
  }

  D.define({
    id: 'pointer-basics',
    title: T('İşaretçi (pointer) temelleri: adres, dereferans ve takma ad (alias)',
             'Pointer basics: address, dereference, and aliasing'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('5 işlemlik temel bir senaryo', 'A basic 5-operation script'),
        data: { base: 1000, values: [3, 12, -5, 27, 8, -14, 40, 1, -22, 19],
                ops: [ { t: 'addr', ptr: 'p', idx: 0 }, { t: 'set', ptr: 'p', value: 50 },
                       { t: 'copy', dst: 'q', src: 'p' }, { t: 'addr', ptr: 'p', idx: 1 },
                       { t: 'add', ptr: 'q', delta: 7 } ] } },
      { id: 'hard', level: 'hard', name: T('13 değişken, 11 işlemlik zincirleme takma adlar', '13 variables, an 11-operation alias chain'),
        data: { base: 2000, values: [5, -30, 17, 44, -9, 2, 63, -41, 28, 10, -17, 55, -3],
                ops: [ { t: 'addr', ptr: 'p', idx: 0 }, { t: 'addr', ptr: 'q', idx: 5 },
                       { t: 'set', ptr: 'p', value: 100 }, { t: 'copy', dst: 'r', src: 'q' },
                       { t: 'add', ptr: 'r', delta: -15 }, { t: 'addr', ptr: 'q', idx: 2 },
                       { t: 'set', ptr: 'q', value: 77 }, { t: 'copy', dst: 'p', src: 'r' },
                       { t: 'add', ptr: 'p', delta: 9 }, { t: 'addr', ptr: 'r', idx: 9 },
                       { t: 'set', ptr: 'r', value: -60 } ] } },
      { id: 'null-deref', level: 'edge', name: T('NULL işaretçi dereferansı denemesi', 'A NULL-pointer dereference attempt'),
        data: { base: 1000, values: [8, 3, -6, 21, 14, -2, 9, 33, -11, 5],
                ops: [ { t: 'addr', ptr: 'p', idx: 2 }, { t: 'null', ptr: 'r' },
                       { t: 'set', ptr: 'r', value: 99 }, { t: 'add', ptr: 'r', delta: 5 },
                       { t: 'addr', ptr: 'r', idx: 7 }, { t: 'set', ptr: 'r', value: 42 },
                       { t: 'copy', dst: 'q', src: 'p' }, { t: 'add', ptr: 'q', delta: 3 } ] } },
      { id: 'triple-alias', level: 'edge', name: T('Aynı değişkene üç işaretçi', 'Three pointers aliasing one variable'),
        data: { base: 3000, values: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                ops: [ { t: 'addr', ptr: 'p', idx: 0 }, { t: 'copy', dst: 'q', src: 'p' },
                       { t: 'copy', dst: 'r', src: 'p' }, { t: 'set', ptr: 'p', value: 1 },
                       { t: 'add', ptr: 'q', delta: 4 }, { t: 'add', ptr: 'r', delta: 10 },
                       { t: 'addr', ptr: 'q', idx: 5 }, { t: 'set', ptr: 'q', value: 999 } ] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.values.length; },
    /** Independent plain simulation: a name's address is an index into d.values, or null; set/add on a
     * null pointer is flagged (UB) and does NOT change the array. */
    reference: function (d) {
      var vals = d.values.slice(), base = d.base;
      var nm = [], addr = {}, flagged = 0;
      d.ops.forEach(function (op) { [op.ptr, op.dst, op.src].forEach(function (x) { if (x !== undefined && nm.indexOf(x) < 0) nm.push(x); }); });
      nm.forEach(function (x) { addr[x] = null; });
      d.ops.forEach(function (op) {
        if (op.t === 'addr') addr[op.ptr] = op.idx;
        else if (op.t === 'null') addr[op.ptr] = null;
        else if (op.t === 'copy') addr[op.dst] = addr[op.src];
        else if (op.t === 'set') { if (addr[op.ptr] === null) flagged++; else vals[addr[op.ptr]] = op.value; }
        else if (op.t === 'add') { if (addr[op.ptr] === null) flagged++; else vals[addr[op.ptr]] += op.delta; }
      });
      var pointers = {};
      nm.forEach(function (x) { pointers[x] = addr[x] === null ? null : base + addr[x] * 4; });
      return { values: vals, pointers: pointers, flagged: flagged };
    },
    random: function (level, r) {
      var nVars = { easy: 10, normal: 11, hard: 13, extreme: 16 }[level];
      var lo = level === 'extreme' ? -9999 : (level === 'hard' ? -500 : 1);
      var hi = level === 'extreme' ? 9999 : (level === 'hard' ? 500 : 99);
      var values = [], i;
      for (i = 0; i < nVars; i++) values.push(D.randInt(r, lo, hi));
      var base = 1000 + D.randInt(r, 0, 100) * 8;
      var nmList = ['p', 'q', 'r'], introduced = {}, addr = {}, ops = [];
      var nOps = { easy: 6, normal: 8, hard: 12, extreme: 16 }[level];
      for (var k = 0; k < nOps; k++) {
        var nm = nmList[D.randInt(r, 0, nmList.length - 1)];
        var roll = r();
        if (!introduced[nm] || roll < 0.28) {
          var idx = D.randInt(r, 0, nVars - 1);
          ops.push({ t: 'addr', ptr: nm, idx: idx }); addr[nm] = idx; introduced[nm] = true;
        } else if (roll < 0.4) {
          ops.push({ t: 'null', ptr: nm }); addr[nm] = null;
        } else if (roll < 0.55) {
          var cand = nmList.filter(function (x) { return introduced[x] && x !== nm; });
          if (cand.length) {
            var src = cand[D.randInt(r, 0, cand.length - 1)];
            ops.push({ t: 'copy', dst: nm, src: src }); addr[nm] = addr[src]; introduced[nm] = true;
          } else {
            var idx2 = D.randInt(r, 0, nVars - 1);
            ops.push({ t: 'addr', ptr: nm, idx: idx2 }); addr[nm] = idx2; introduced[nm] = true;
          }
        } else if (roll < 0.78) {
          ops.push({ t: 'set', ptr: nm, value: D.randInt(r, lo, hi) });
        } else {
          ops.push({ t: 'add', ptr: nm, delta: D.randInt(r, -20, 20) });
        }
      }
      return { base: base, values: values, ops: ops };
    },
    input: {
      hint: T('Örnek: base=1000 vars: 3 12 -5 27 8 -14 40 1 -22 19 ops: p=&v0 *p=50 q=p p=&v1 *q+=7',
              'Example: base=1000 vars: 3 12 -5 27 8 -14 40 1 -22 19 ops: p=&v0 *p=50 q=p p=&v1 *q+=7'),
      parse: function (text) {
        var mode = 'vars', values = [], ops = [], base = 1000, m;
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (/^vars?:$/i.test(tok)) { mode = 'vars'; return; }
          if (/^ops?:$/i.test(tok)) { mode = 'ops'; return; }
          if ((m = /^base[=:](\d+)$/i.exec(tok))) { base = parseInt(m[1], 10); return; }
          if (mode === 'vars') {
            if (!/^-?\d+$/.test(tok)) throw T('"' + tok + '" bir tamsayı değil.', '"' + tok + '" is not an integer.');
            values.push(parseInt(tok, 10));
            return;
          }
          if ((m = /^([a-z])=&v(\d+)$/.exec(tok))) {
            var idx = parseInt(m[2], 10);
            if (idx >= values.length) throw T('v' + idx + ' yok (yalnız ' + values.length + ' değişken var).', 'v' + idx + ' does not exist (only ' + values.length + ' variables).');
            ops.push({ t: 'addr', ptr: m[1], idx: idx }); return;
          }
          if ((m = /^([a-z])=NULL$/i.exec(tok))) { ops.push({ t: 'null', ptr: m[1] }); return; }
          if ((m = /^([a-z])=([a-z])$/.exec(tok))) { ops.push({ t: 'copy', dst: m[1], src: m[2] }); return; }
          if ((m = /^\*([a-z])=(-?\d+)$/.exec(tok))) { ops.push({ t: 'set', ptr: m[1], value: parseInt(m[2], 10) }); return; }
          if ((m = /^\*([a-z])\+=(-?\d+)$/.exec(tok))) { ops.push({ t: 'add', ptr: m[1], delta: parseInt(m[2], 10) }); return; }
          throw T('"' + tok + '" anlaşılmadı: p=&v0, q=p, p=NULL, *p=5 ya da *p+=3 yazın.',
                  '"' + tok + '" is not understood: write p=&v0, q=p, p=NULL, *p=5, or *p+=3.');
        });
        if (values.length < 1) throw T('En az bir değişken değeri yazın.', 'Write at least one variable value.');
        if (values.length > 20) throw T('En çok 20 değişken.', 'At most 20 variables.');
        if (!ops.length) throw T('En az bir işlem yazın (örn. p=&v0).', 'Write at least one operation (e.g. p=&v0).');
        if (ops.length > 30) throw T('En çok 30 işlem.', 'At most 30 operations.');
        return { base: base, values: values, ops: ops };
      },
      format: function (d) {
        return 'base=' + d.base + ' vars: ' + d.values.join(' ') + ' ops: ' + d.ops.map(opTok).join(' ');
      },
      bad: ['', 'vars: 5 8 13 ops: p=&v9', 'vars: 5 8 13 4 5 6 7 8 9 10 ops: p=&v0 *p=abc',
            'vars: 5 8 13 4 5 6 7 8 9 10 ops: p=&v0 xyz', 'vars: 5 8 13 4 5 6 7 8 9 10 ops:'],
      /** The input strip shows the OPERATIONS (not the raw vars), in the order build() processes them. */
      tokens: function (d) { return d.ops.map(opTok); }
    },
    build: function (S, d) {
      var base = d.base, vals = d.values.slice(), n = vals.length;
      var W = 58, H = 44, GAP = 8, X0 = 44, Y0 = 110, ROW = 16;
      var numRows = Math.ceil(n / ROW);
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: 'vars =', anchor: 'end', size: 15, bold: true });
      vals.forEach(function (v, i) {
        var col = i % ROW, row = Math.floor(i / ROW);
        var x = X0 + col * (W + GAP), y = Y0 + row * (H + 34);
        S.box('v' + i, { x: x, y: y, w: W, h: H, text: String(v), above: String(base + i * 4), size: 15 });
      });
      var nm = names(d.ops), addr = {};
      var PY = Y0 + numRows * (H + 34) + 70, PX0 = 60, PPITCH = 150;
      var RX = PX0 + Math.max(nm.length, 1) * PPITCH + 30;
      nm.forEach(function (x, i) {
        addr[x] = null;
        S.box('ptr_' + x, { x: PX0 + i * PPITCH, y: PY, w: 70, h: 44, text: 'NULL', above: x, style: 'dim', size: 15 });
      });
      S.label('decision', { x: RX, y: PY + 27, text: '', size: 16, bold: true, mono: true, anchor: 'start' });
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      S.step(T('`int *' + nm.join(', *') + ' = NULL;` — işaretçileri her zaman başlatırız; hepsi NULL ile başlıyor: hiçbiri geçerli bir adres tutmuyor.',
               '`int *' + nm.join(', *') + ' = NULL;` — we always initialize pointers; all of them start as NULL: none holds a valid address yet.'),
             { c: [1, 2], java: [1, 2] });

      function clean() {
        for (var i = 0; i < n; i++) S.set('v' + i, { style: 'normal' });
        nm.forEach(function (x) { S.set('ptr_' + x, { style: addr[x] === null ? 'dim' : 'normal' }); });
      }
      function syncArrow(x) {
        var aid = 'arr_' + x;
        if (addr[x] === null) { if (S.has(aid)) S.remove(aid); }
        else if (S.has(aid)) S.set(aid, { to: 'v' + addr[x] });
        else S.arrow(aid, { from: 'ptr_' + x, to: 'v' + addr[x], kind: 'center' });
      }

      var flagged = 0;
      d.ops.forEach(function (op, k) {
        clean();
        S.at(k);
        decide('', 'normal');
        if (op.t === 'addr') {
          addr[op.ptr] = op.idx;
          S.set('ptr_' + op.ptr, { text: String(base + op.idx * 4), style: 'new' });
          syncArrow(op.ptr);
          S.set('v' + op.idx, { style: 'hl' });
          S.step(T('`' + op.ptr + ' = &v[' + op.idx + ']` — `' + op.ptr + '` artık v[' + op.idx + ']\'in adresini (' + (base + op.idx * 4) + ') tutuyor.',
                   '`' + op.ptr + ' = &v[' + op.idx + ']` — `' + op.ptr + '` now holds the address of v[' + op.idx + '] (' + (base + op.idx * 4) + ').'),
                 { c: LINE.addr, java: LINE.addr });
        } else if (op.t === 'null') {
          addr[op.ptr] = null;
          S.set('ptr_' + op.ptr, { text: 'NULL', style: 'del' });
          syncArrow(op.ptr);
          S.step(T('`' + op.ptr + ' = NULL;` — `' + op.ptr + '` artık geçerli hiçbir adresi tutmuyor.',
                   '`' + op.ptr + ' = NULL;` — `' + op.ptr + '` no longer holds any valid address.'),
                 { c: LINE.null, java: LINE.null });
        } else if (op.t === 'copy') {
          addr[op.dst] = addr[op.src];
          var isNull = addr[op.dst] === null;
          S.set('ptr_' + op.dst, { text: isNull ? 'NULL' : String(base + addr[op.dst] * 4), style: 'new' });
          syncArrow(op.dst);
          if (!isNull) S.set('v' + addr[op.dst], { style: 'hl' });
          S.step(T('`' + op.dst + ' = ' + op.src + '` — `' + op.dst + '`, `' + op.src + '` ile AYNI adresi alır' +
                     (isNull ? ' (ikisi de NULL).' : ' — artık aynı değişkeni gösteren iki takma ad (alias) var: `' + op.dst + '` ve `' + op.src + '`.'),
                   '`' + op.dst + ' = ' + op.src + '` — `' + op.dst + '` takes the SAME address as `' + op.src + '`' +
                     (isNull ? ' (both are NULL).' : ' — now two aliases name the same variable: `' + op.dst + '` and `' + op.src + '`.')),
                 { c: LINE.copy, java: LINE.copy });
        } else {
          var target = addr[op.ptr];
          var expr = op.t === 'set' ? ('*' + op.ptr + ' = ' + op.value) : ('*' + op.ptr + ' += ' + op.delta);
          if (target === null) {
            flagged++;
            S.set('ptr_' + op.ptr, { style: 'del' });
            decide(op.ptr + ' == NULL -> flagged', 'del');
            S.step(T('`' + expr + '` — `' + op.ptr + '` şu an NULL: bu bir NULL işaretçi dereferansı denemesi. **Çalıştırılmaz**: **tanımsız davranış (UB)** olarak işaretlenir.',
                     '`' + expr + '` — `' + op.ptr + '` is currently NULL: this is a NULL-pointer dereference attempt. **Not executed**: flagged as **undefined behavior (UB)**.'),
                   { c: LINE.ub, java: LINE.ub });
          } else {
            var before = vals[target];
            if (op.t === 'set') vals[target] = op.value; else vals[target] += op.delta;
            S.set('v' + target, { text: String(vals[target]), style: 'new' });
            S.set('ptr_' + op.ptr, { style: 'hl' });
            var others = nm.filter(function (x) { return x !== op.ptr && addr[x] === target; });
            var aliasTr = others.length ? (' `' + others.join(', ') + '` da aynı değişkeni gösterdiği için o(ndan) okunan değer de değişti.') : '';
            var aliasEn = others.length ? (' since `' + others.join(', ') + '` also point' + (others.length > 1 ? '' : 's') + ' here, reading through ' + (others.length > 1 ? 'them' : 'it') + ' shows the same change.') : '';
            S.step(T('`' + expr + '` — `' + op.ptr + '` üzerinden v[' + target + '] ' + (op.t === 'set' ? ('yazılır: ' + vals[target] + '.') : ('güncellenir: ' + before + ' -> ' + vals[target] + '.')) + aliasTr,
                     '`' + expr + '` — writing through `' + op.ptr + '` ' + (op.t === 'set' ? ('sets v[' + target + '] to ' + vals[target] + '.') : ('updates v[' + target + ']: ' + before + ' -> ' + vals[target] + '.')) + aliasEn),
                   { c: op.t === 'set' ? LINE.set : LINE.add, java: op.t === 'set' ? LINE.set : LINE.add });
          }
        }
      });
      clean();
      S.at(null);
      decide('', 'normal');
      var pointers = {};
      nm.forEach(function (x) { pointers[x] = addr[x] === null ? null : base + addr[x] * 4; });
      S.result = { values: vals.slice(), pointers: pointers, flagged: flagged };
      var pstr = nm.map(function (x) { return x + ' = ' + (pointers[x] === null ? 'NULL' : pointers[x]); }).join(', ');
      S.step(T('Bitti: son değerler ' + vals.join(', ') + '. İşaretçiler: ' + pstr + '.' + (flagged ? ' ' + flagged + ' NULL dereferansı denemesi güvenle işaretlendi, hiçbiri çalıştırılmadı.' : ''),
               'Done: final values ' + vals.join(', ') + '. Pointers: ' + pstr + '.' + (flagged ? ' ' + flagged + ' NULL-dereference attempt' + (flagged > 1 ? 's were' : ' was') + ' safely flagged, none executed.' : '')));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
