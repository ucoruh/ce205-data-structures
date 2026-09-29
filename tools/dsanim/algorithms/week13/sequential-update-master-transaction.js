/* Week 13 — sequential update: merge a SORTED transaction file into a SORTED master file in one pass, producing a
   new master file. Every transaction is add / change / delete; a change or delete on a key that is not in the
   master is an error, and adding a key that already exists is also an error. Examples (normal, hard, edge:
   duplicate add, edge: change/delete on a missing key with trailing adds), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct { int key, val; } Rec;',
    'typedef struct { int key; char op; int val; } Txn;   /* op: \'A\' add, \'C\' change, \'D\' delete */',
    '',
    'int merge_update(const Rec *master, int nm, const Txn *txn, int nt, FILE *out,',
    '                 int *written, int *deleted, int *errors) {',
    '    int i = 0, j = 0;',
    '    while (i < nm && j < nt) {',
    '        if (master[i].key < txn[j].key) {              /* master record has no transaction: copy it */',
    '            fwrite(&master[i], sizeof(Rec), 1, out); (*written)++; i++;',
    '        } else if (master[i].key > txn[j].key) {        /* transaction key is not in master (yet) */',
    '            if (txn[j].op == \'A\') {',
    '                Rec r = { txn[j].key, txn[j].val };',
    '                fwrite(&r, sizeof(Rec), 1, out); (*written)++;',
    '            } else { (*errors)++; }                     /* change/delete: key not found */',
    '            j++;',
    '        } else {                                        /* same key: transaction applies to this record */',
    '            if (txn[j].op == \'A\') {                                 /* duplicate add: keep original, flag error */',
    '                fwrite(&master[i], sizeof(Rec), 1, out); (*written)++; (*errors)++;',
    '            }',
    '            else if (txn[j].op == \'C\') {',
    '                Rec r = { master[i].key, txn[j].val };',
    '                fwrite(&r, sizeof(Rec), 1, out); (*written)++;',
    '            } else { (*deleted)++; }                    /* \'D\': record is dropped, nothing written */',
    '            i++; j++;',
    '        }',
    '    }',
    '    while (i < nm) { fwrite(&master[i], sizeof(Rec), 1, out); (*written)++; i++; }   /* leftover master */',
    '    while (j < nt) {                                                                  /* leftover transactions */',
    '        if (txn[j].op == \'A\') {',
    '            Rec r = { txn[j].key, txn[j].val };',
    '            fwrite(&r, sizeof(Rec), 1, out); (*written)++;',
    '        } else { (*errors)++; }',
    '        j++;',
    '    }',
    '    return *written;',
    '}'
  ];
  var JAVA = [
    'static int mergeUpdate(Rec[] master, int nm, Txn[] txn, int nt, DataOutputStream out,',
    '                       int[] written, int[] deleted, int[] errors) throws IOException {',
    '    int i = 0, j = 0;',
    '    while (i < nm && j < nt) {',
    '        if (master[i].key < txn[j].key) {                // master record has no transaction: copy it',
    '            out.writeInt(master[i].key); out.writeInt(master[i].val); written[0]++; i++;',
    '        } else if (master[i].key > txn[j].key) {          // transaction key is not in master (yet)',
    '            if (txn[j].op == \'A\') {',
    '                out.writeInt(txn[j].key); out.writeInt(txn[j].val); written[0]++;',
    '            } else { errors[0]++; }                       // change/delete: key not found',
    '            j++;',
    '        } else {                                          // same key: transaction applies to this record',
    '            if (txn[j].op == \'A\') {                                   // duplicate add: keep original, flag error',
    '                out.writeInt(master[i].key); out.writeInt(master[i].val); written[0]++; errors[0]++;',
    '            }',
    '            else if (txn[j].op == \'C\') {',
    '                out.writeInt(master[i].key); out.writeInt(txn[j].val); written[0]++;',
    '            } else { deleted[0]++; }                      // \'D\': record is dropped, nothing written',
    '            i++; j++;',
    '        }',
    '    }',
    '    while (i < nm) { out.writeInt(master[i].key); out.writeInt(master[i].val); written[0]++; i++; }   // leftover master',
    '    while (j < nt) {                                                                                   // leftover transactions',
    '        if (txn[j].op == \'A\') {',
    '            out.writeInt(txn[j].key); out.writeInt(txn[j].val); written[0]++;',
    '        } else { errors[0]++; }',
    '        j++;',
    '    }',
    '    return written[0];',
    '}'
  ];

  function m(key, val) { return { key: key, val: val }; }
  function t(op, key, val) { return { op: op, key: key, val: val === undefined ? 0 : val }; }

  D.define({
    id: 'sequential-update-master-transaction',
    title: T('Ardışık güncelleme: sıralı işlem dosyasının ana dosyayla birleştirilmesi', 'Sequential update: merging a sorted transaction file into the master'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 ana kayıt, 6 geçerli işlem (ekle/değiştir/sil karışık)', '10 master records, 6 valid transactions (add/change/delete mixed)'),
        data: { master: [m(5, 10), m(10, 20), m(15, 30), m(20, 40), m(25, 50), m(30, 60), m(35, 70), m(40, 80), m(45, 90), m(50, 100)],
          trans: [t('A', 8, 16), t('C', 15, 999), t('D', 25), t('A', 42, 84), t('C', 50, 500), t('A', 60, 120)] } },
      { id: 'hard', level: 'hard', name: T('11 ana kayıt, 8 işlem (ardışık ekler dahil)', '11 master records, 8 transactions (including back-to-back adds)'),
        data: { master: [m(2, 6), m(6, 18), m(10, 30), m(14, 42), m(18, 54), m(22, 66), m(26, 78), m(30, 90), m(34, 102), m(38, 114), m(42, 126)],
          trans: [t('A', 5, 15), t('A', 12, 36), t('A', 13, 39), t('C', 18, 999), t('D', 22), t('C', 34, 111), t('A', 40, 120), t('A', 50, 150)] } },
      { id: 'edge-duplicate', level: 'edge', name: T('Uç: var olan anahtara ekleme + yok olan anahtara işlem (hata)', 'Edge: adding an existing key + acting on a missing key (errors)'),
        data: { master: [m(3, 103), m(7, 107), m(11, 111), m(15, 115), m(19, 119), m(23, 123), m(27, 127), m(31, 131), m(35, 135), m(39, 139)],
          trans: [t('A', 7, 777), t('C', 11, 555), t('C', 39, 999), t('A', 45, 900), t('D', 50)] } },
      { id: 'edge-trailing', level: 'edge', name: T('Uç: ana dosya biter, kalan işlemler (bazıları hatalı)', 'Edge: master runs out, trailing transactions (some invalid)'),
        data: { master: [m(1, 2), m(4, 8), m(7, 14), m(10, 20), m(13, 26), m(16, 32), m(19, 38), m(22, 44), m(25, 50), m(28, 56)],
          trans: [t('D', 5), t('A', 30, 60), t('C', 35, 999), t('A', 40, 80), t('D', 45), t('A', 50, 100)] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.master.length + d.trans.length; },
    reference: function (d) {
      /* Independent of build(): does not call the module-level m() helper that build() also uses (build()
         uses it once, to repackage its own S.result at the end) — object literals are constructed inline here
         so a bug in m() itself would not silently agree between the two implementations. */
      var ii = 0, jj = 0, out = [], written = 0, deleted = 0, errors = 0;
      while (ii < d.master.length && jj < d.trans.length) {
        var mk = d.master[ii].key, tk = d.trans[jj].key, op = d.trans[jj].op;
        if (mk < tk) { out.push({ key: d.master[ii].key, val: d.master[ii].val }); written++; ii++; }
        else if (mk > tk) {
          if (op === 'A') { out.push({ key: tk, val: d.trans[jj].val }); written++; } else errors++;
          jj++;
        } else {
          if (op === 'A') { out.push({ key: mk, val: d.master[ii].val }); written++; errors++; }
          else if (op === 'C') { out.push({ key: mk, val: d.trans[jj].val }); written++; }
          else deleted++;
          ii++; jj++;
        }
      }
      while (ii < d.master.length) { out.push({ key: d.master[ii].key, val: d.master[ii].val }); written++; ii++; }
      while (jj < d.trans.length) {
        if (d.trans[jj].op === 'A') { out.push({ key: d.trans[jj].key, val: d.trans[jj].val }); written++; } else errors++;
        jj++;
      }
      return { newMaster: out, written: written, deleted: deleted, errors: errors };
    },
    random: function (level, r) {
      var nm = { easy: 8, normal: 10, hard: 12, extreme: 14 }[level], key = D.randInt(r, 1, 4), master = [];
      for (var i = 0; i < nm; i++) { master.push(m(key, key * 10)); key += D.randInt(r, 2, 6); }
      var nt = { easy: 4, normal: 5, hard: 7, extreme: 9 }[level], trans = [], tkey = D.randInt(r, 1, 4), used = {};
      for (var j = 0; j < nt; j++) {
        while (used[tkey]) tkey += D.randInt(r, 1, 3);
        used[tkey] = true;
        var ops = ['A', 'C', 'D'], op = ops[D.randInt(r, 0, 2)];
        trans.push(t(op, tkey, D.randInt(r, 100, 999)));
        tkey += D.randInt(r, 1, 5);
      }
      return { master: master, trans: trans };
    },
    input: {
      hint: T('Örnek: M5:10 M10:20 M15:30 | A8:16 C10:99 D15', 'Example: M5:10 M10:20 M15:30 | A8:16 C10:99 D15'),
      parse: function (text) {
        var parts = String(text).split('|');
        if (parts.length !== 2) throw T('Ana ve işlem listelerini | ile ayırın.', 'Separate master and transaction lists with |.');
        var master = [], trans = [];
        parts[0].trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var mm = /^M(-?\d+):(-?\d+)$/i.exec(tok);
          if (!mm) throw T('"' + tok + '" anlaşılmadı: M<anahtar>:<değer> yazın.', '"' + tok + '" is not understood: write M<key>:<value>.');
          master.push(m(parseInt(mm[1], 10), parseInt(mm[2], 10)));
        });
        parts[1].trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var tm = /^([ACD])(-?\d+)(?::(-?\d+))?$/i.exec(tok);
          if (!tm) throw T('"' + tok + '" anlaşılmadı: A/C/D<anahtar>[:<değer>] yazın.', '"' + tok + '" is not understood: write A/C/D<key>[:<value>].');
          trans.push(t(tm[1].toUpperCase(), parseInt(tm[2], 10), tm[3] !== undefined ? parseInt(tm[3], 10) : 0));
        });
        if (master.length < 2 || trans.length < 1) throw T('En az iki ana kayıt, bir işlem yazın.', 'Write at least two master records and one transaction.');
        for (var i = 1; i < master.length; i++) if (master[i].key <= master[i - 1].key) throw T('Ana kayıtlar artan sırada olmalı.', 'Master records must be strictly ascending.');
        for (var j = 1; j < trans.length; j++) if (trans[j].key <= trans[j - 1].key) throw T('İşlemler artan sırada olmalı.', 'Transactions must be strictly ascending.');
        return { master: master, trans: trans };
      },
      format: function (d) { return d.master.map(function (r) { return 'M' + r.key + ':' + r.val; }).join(' ') + ' | ' + d.trans.map(function (x) { return x.op + x.key + ':' + x.val; }).join(' '); },
      bad: ['', 'M5:10 | ', '5:10 | A8:16', 'M5:10 M10:20 | X8:16'],
      tokens: function (d) { return d.master.map(function (r) { return 'M' + r.key; }).concat(d.trans.map(function (x) { return x.op + x.key; })); }
    },
    build: function (S, d) {
      var X0 = 110, YM = 90, YT = 210, YO = 340, BW = 66, BH = 40, GAP = 8;
      S.label('rowM', { x: X0 - 16, y: YM + BH / 2 + 5, text: T('ana dosya =', 'master ='), anchor: 'end', size: 15, bold: true });
      S.label('rowT', { x: X0 - 16, y: YT + BH / 2 + 5, text: T('işlemler =', 'transactions ='), anchor: 'end', size: 15, bold: true });
      S.label('rowO', { x: X0 - 16, y: YO + BH / 2 + 5, text: T('yeni ana dosya =', 'new master ='), anchor: 'end', size: 15, bold: true });
      d.master.forEach(function (r, k) { S.box('m' + k, { x: X0 + k * (BW + GAP), y: YM, w: BW, h: BH, text: r.key + ':' + r.val, style: 'normal', mono: true, size: 13 }); });
      d.trans.forEach(function (x, k) { S.box('t' + k, { x: X0 + k * (BW + GAP), y: YT, w: BW, h: BH, text: x.op + x.key + (x.op !== 'D' ? ':' + x.val : ''), style: 'normal', mono: true, size: 13 }); });
      var XR = X0 + Math.max(d.master.length, d.trans.length) * (BW + GAP) + 30;
      S.label('written', { x: XR, y: YM, text: 'written = 0', size: 15, mono: true, anchor: 'start' });
      S.label('deleted', { x: XR, y: YM + 24, text: 'deleted = 0', size: 15, mono: true, anchor: 'start', style: 'dim' });
      S.label('errors', { x: XR, y: YM + 48, text: 'errors = 0', size: 15, mono: true, anchor: 'start', style: 'dim' });
      S.label('decision', { x: XR, y: YM + 76, text: '', size: 15, bold: true, mono: true, anchor: 'start' });

      var i = 0, j = 0, written = 0, deleted = 0, errors = 0, outIdx = 0;
      function counters() { S.set('written', { text: 'written = ' + written }); S.set('deleted', { text: 'deleted = ' + deleted }); S.set('errors', { text: 'errors = ' + errors }); }
      function ptrs() {
        if (i < d.master.length) { if (!S.has('pi')) S.pointer('pi', { target: 'm' + i, text: 'i', side: 'top' }); else S.set('pi', { target: 'm' + i }); }
        else if (S.has('pi')) S.remove('pi');
        if (j < d.trans.length) { if (!S.has('pj')) S.pointer('pj', { target: 't' + j, text: 'j', side: 'bottom' }); else S.set('pj', { target: 't' + j }); }
        else if (S.has('pj')) S.remove('pj');
      }
      function emit(key, val, style) {
        S.box('o' + outIdx, { x: X0 + outIdx * (BW + GAP), y: YO, w: BW, h: BH, text: key + ':' + val, style: style, mono: true, size: 13 });
        outIdx++;
      }
      ptrs();

      var steps = 0;
      while (i < d.master.length && j < d.trans.length) {
        var mk = d.master[i].key, tx = d.trans[j], detailed = steps < 6;
        steps++;
        if (mk < tx.key) {
          S.set('m' + i, { style: 'hl' }); S.set('t' + j, { style: 'dim' });
          S.set('decision', { text: mk + ' < ' + tx.key, style: 'normal' });
          emit(mk, d.master[i].val, 'normal'); written++; S.set('m' + i, { style: 'new' });
          counters();
          S.step(detailed
            ? T('`master[i].key < txn[j].key` (' + mk + ' < ' + tx.key + ') → bu ana kayıtla ilgili işlem yok, **değişmeden kopyalanır**: `i++`.',
                '`master[i].key < txn[j].key` (' + mk + ' < ' + tx.key + ') → no transaction touches this master record, **copy it unchanged**: `i++`.')
            : T('`' + mk + ' < ' + tx.key + '` → kopyala.', '`' + mk + ' < ' + tx.key + '` → copy.'),
            { c: [{ n: 8, note: T('master[i].key < txn[j].key? evet', 'master[i].key < txn[j].key? yes') }, 9], java: [{ n: 5, note: T('yes', 'yes') }, 6] });
          i++; ptrs();
        } else if (mk > tx.key) {
          S.set('m' + i, { style: 'dim' }); S.set('t' + j, { style: 'hl' });
          S.set('decision', { text: mk + ' > ' + tx.key + ', op=' + tx.op, style: tx.op === 'A' ? 'normal' : 'del' });
          if (tx.op === 'A') {
            emit(tx.key, tx.val, 'new'); written++; S.set('t' + j, { style: 'new' }); counters();
            S.step(detailed
              ? T('`master[i].key > txn[j].key` (' + mk + ' > ' + tx.key + '), `op = A` → anahtar ' + tx.key + ' ana dosyada henüz yok, **yeni kayıt eklenir**.',
                  '`master[i].key > txn[j].key` (' + mk + ' > ' + tx.key + '), `op = A` → key ' + tx.key + ' is not in the master yet, **insert a new record**.')
              : T('`' + mk + ' > ' + tx.key + '`, `A` → ekle.', '`' + mk + ' > ' + tx.key + '`, `A` → insert.'),
              { c: [{ n: 8, note: T('hayır', 'no') }, { n: 10, note: T('master[i].key > txn[j].key? evet', 'master[i].key > txn[j].key? yes') }, { n: 11, note: T('op == A? evet', 'op == A? yes') }, 12, 13], java: [{ n: 5, note: T('no', 'no') }, { n: 7, note: T('yes', 'yes') }, { n: 8, note: T('op == A? yes', 'op == A? yes') }, 9] });
          } else {
            errors++; counters();
            S.step(detailed
              ? T('`master[i].key > txn[j].key` (' + mk + ' > ' + tx.key + '), `op = ' + tx.op + '` → anahtar ' + tx.key + ' ana dosyada **yok**: değiştirilemez/silinemez → **hata**, hiçbir şey yazılmaz.',
                  '`master[i].key > txn[j].key` (' + mk + ' > ' + tx.key + '), `op = ' + tx.op + '` → key ' + tx.key + ' is **not in the master**: cannot change/delete it → **error**, nothing is written.')
              : T('`' + mk + ' > ' + tx.key + '`, `' + tx.op + '` → hata (yok).', '`' + mk + ' > ' + tx.key + '`, `' + tx.op + '` → error (missing).'),
              { c: [{ n: 8, note: T('hayır', 'no') }, { n: 10, note: T('evet', 'yes') }, { n: 11, note: T('op == A? hayır', 'op == A? no') }, 14], java: [{ n: 5, note: T('no', 'no') }, { n: 7, note: T('yes', 'yes') }, { n: 8, note: T('op == A? no', 'op == A? no') }, 10] });
          }
          j++; ptrs();
        } else {
          S.set('m' + i, { style: 'hl' }); S.set('t' + j, { style: 'hl' });
          if (tx.op === 'A') {
            errors++;
            emit(mk, d.master[i].val, 'new'); written++;
            S.set('decision', { text: mk + ' == ' + tx.key + ', A → dup', style: 'del' });
            S.set('m' + i, { style: 'new' }); S.set('t' + j, { style: 'del' });
            counters();
            S.step(detailed
              ? T('`master[i].key == txn[j].key` (' + mk + '), `op = A` → bu anahtar **zaten var**: yinelenen ekleme, **hata**. Ana kayıt olduğu gibi kalacak.',
                  '`master[i].key == txn[j].key` (' + mk + '), `op = A` → this key **already exists**: duplicate add, **error**. The master record stays as it is.')
              : T('`' + mk + ' == ' + tx.key + '`, `A` → yinelenen, hata.', '`' + mk + ' == ' + tx.key + '`, `A` → duplicate, error.'),
              { c: [{ n: 8, note: T('hayır', 'no') }, { n: 10, note: T('hayır', 'no') }, { n: 17, note: T('op == A? evet', 'op == A? yes') }, 18],
                java: [{ n: 5, note: T('no', 'no') }, { n: 7, note: T('no', 'no') }, { n: 13, note: T('op == A? yes', 'op == A? yes') }, 14] });
          } else if (tx.op === 'C') {
            emit(mk, tx.val, 'hl'); written++;
            S.set('decision', { text: mk + ' == ' + tx.key + ', C → ' + tx.val, style: 'active' });
            S.set('m' + i, { style: 'dim' }); S.set('t' + j, { style: 'new' });
            counters();
            S.step(detailed
              ? T('`master[i].key == txn[j].key` (' + mk + '), `op = C` → **değer değişir**: eski ' + d.master[i].val + ' yerine ' + tx.val + ' yazılır.',
                  '`master[i].key == txn[j].key` (' + mk + '), `op = C` → **value changes**: ' + tx.val + ' is written instead of the old ' + d.master[i].val + '.')
              : T('`' + mk + '`, `C` → değiştir.', '`' + mk + '`, `C` → change.'),
              { c: [{ n: 8, note: T('hayır', 'no') }, { n: 10, note: T('hayır', 'no') }, { n: 17, note: T('op == A? hayır', 'op == A? no') }, { n: 20, note: T('op == C? evet', 'op == C? yes') }, 21, 22],
                java: [{ n: 5, note: T('no', 'no') }, { n: 7, note: T('no', 'no') }, { n: 13, note: T('op == A? no', 'op == A? no') }, { n: 16, note: T('op == C? yes', 'op == C? yes') }, 17] });
          } else {
            deleted++;
            S.set('decision', { text: mk + ' == ' + tx.key + ', D → drop', style: 'del' });
            S.set('m' + i, { style: 'del' }); S.set('t' + j, { style: 'del' });
            counters();
            S.step(detailed
              ? T('`master[i].key == txn[j].key` (' + mk + '), `op = D` → kayıt **silinir**: yeni ana dosyaya hiçbir şey yazılmaz.',
                  '`master[i].key == txn[j].key` (' + mk + '), `op = D` → the record is **deleted**: nothing is written to the new master.')
              : T('`' + mk + '`, `D` → sil.', '`' + mk + '`, `D` → delete.'),
              { c: [{ n: 8, note: T('hayır', 'no') }, { n: 10, note: T('hayır', 'no') }, { n: 17, note: T('op == A? hayır', 'op == A? no') }, { n: 20, note: T('op == C? hayır', 'op == C? no') }, 23],
                java: [{ n: 5, note: T('no', 'no') }, { n: 7, note: T('no', 'no') }, { n: 13, note: T('op == A? no', 'op == A? no') }, { n: 16, note: T('op == C? no', 'op == C? no') }, 18] });
          }
          i++; j++; ptrs();
        }
      }
      while (i < d.master.length) {
        S.set('m' + i, { style: 'hl' });
        S.set('decision', { text: T('kalan ana kayıt', 'leftover master'), style: 'normal' });
        emit(d.master[i].key, d.master[i].val, 'normal'); written++; S.set('m' + i, { style: 'new' }); counters();
        S.step(T('İşlemler bitti, ana dosyada hâlâ kayıt var → **kalanı olduğu gibi kopyala**.', 'Transactions are done, the master still has records → **copy the rest unchanged**.'),
               { c: [27], java: [22] });
        i++; ptrs();
      }
      while (j < d.trans.length) {
        S.set('t' + j, { style: 'hl' });
        if (d.trans[j].op === 'A') {
          emit(d.trans[j].key, d.trans[j].val, 'new'); written++; S.set('t' + j, { style: 'new' }); counters();
          S.set('decision', { text: T('kalan işlem: ekle', 'trailing transaction: add'), style: 'normal' });
          S.step(T('Ana dosya bitti, kalan işlem `A` → **eklenir**: anahtar ana dosyanın en büyüğünden de büyük.', 'The master is done, the trailing transaction is `A` → **added**: its key is larger than every master key.'),
                 { c: [{ n: 28, note: T('j < ' + d.trans.length + '? evet', 'j < ' + d.trans.length + '? yes') }, { n: 29, note: T('op == A? evet', 'op == A? yes') }, 30, 31],
                   java: [{ n: 23, note: T('j < ' + d.trans.length + '? evet', 'j < ' + d.trans.length + '? yes') }, { n: 24, note: T('op == A? yes', 'op == A? yes') }, 25] });
        } else {
          errors++; S.set('t' + j, { style: 'del' }); counters();
          S.set('decision', { text: T('kalan işlem: hata', 'trailing transaction: error'), style: 'del' });
          S.step(T('Ana dosya bitti, kalan işlem `' + d.trans[j].op + '` → anahtar hiçbir zaman ana dosyada olmadı: **hata**.', 'The master is done, the trailing transaction is `' + d.trans[j].op + '` → its key was never in the master: **error**.'),
                 { c: [{ n: 28, note: T('j < ' + d.trans.length + '? evet', 'j < ' + d.trans.length + '? yes') }, { n: 29, note: T('op == A? hayır', 'op == A? no') }, 32],
                   java: [{ n: 23, note: T('j < ' + d.trans.length + '? evet', 'j < ' + d.trans.length + '? yes') }, { n: 24, note: T('op == A? no', 'op == A? no') }, 26] });
        }
        j++; ptrs();
      }
      S.at(null);
      if (S.has('pi')) S.remove('pi');
      if (S.has('pj')) S.remove('pj');
      var newMaster = [];
      for (var k = 0; k < outIdx; k++) { var v = S.get('o' + k).text.split(':'); newMaster.push(m(Number(v[0]), Number(v[1]))); }
      S.result = { newMaster: newMaster, written: written, deleted: deleted, errors: errors };
      S.step(T('Bitti: yeni ana dosyada ' + written + ' kayıt yazıldı, ' + deleted + ' kayıt silindi, ' + errors + ' hata. Tek geçişte, iki sıralı dosya paralel taranarak birleştirildi — O(nm + nt).',
               'Done: ' + written + ' record(s) written to the new master, ' + deleted + ' deleted, ' + errors + ' error(s). One pass, scanning both sorted files in parallel — O(nm + nt).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
