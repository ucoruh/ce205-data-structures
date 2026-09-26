/* Week 1 -- Java references: new objects on the heap, reference variables that alias, null drops a
 * reference, and a GC step that collects everything unreachable from any variable -- INCLUDING a
 * cycle of objects that reference only each other, once no variable reaches it.
 * Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct Node { struct Node *ref; } Node;',
    '',
    'Node *p = malloc(sizeof(Node));      /* objA on the heap */',
    'Node *q = malloc(sizeof(Node));      /* objB on the heap */',
    'p->ref = q;                          /* objA -> objB */',
    'q->ref = p;                          /* objB -> objA: a CYCLE */',
    '',
    'p = NULL;                            /* drop our only external pointer into the cycle */',
    'q = NULL;',
    '',
    '/* objA and objB are now unreachable -- but each still holds a pointer to the other.',
    '   C has no garbage collector: this memory LEAKS forever. */'
  ];
  var JAVA = [
    'class Node { Node ref; }',
    '',
    'Node p = new Node();                 // objA created on the heap',
    'Node q = p;                          // q is an ALIAS: same object as p',
    'p = null;                            // one reference gone; still reachable through q',
    'q.ref = q;                           // an object can even reference itself',
    '',
    '// System.gc() -- a hint, not a guarantee; conceptually:',
    '// trace from every reachable root, follow .ref links,',
    '// collect whatever cannot be reached -- EVEN a cycle of',
    '// objects that reference only each other, once no root reaches it.'
  ];
  var LINE = { new: [3], assign: [4], null: [5], link: [6], gc: [8, 9, 10, 11] };

  function names(ops) {
    var out = [];
    ops.forEach(function (op) {
      ['v', 'dst', 'src'].forEach(function (k) {
        if (op[k] !== undefined && out.indexOf(op[k]) === -1) out.push(op[k]);
      });
    });
    return out;
  }
  function opTok(op) {
    if (op.t === 'new') return 'new:' + op.v;
    if (op.t === 'null') return 'null:' + op.v;
    if (op.t === 'assign') return op.dst + '=' + op.src;
    if (op.t === 'link') return 'link:' + op.v + '->' + (op.target === null ? 'null' : op.target);
    return 'gc';
  }

  D.define({
    id: 'java-reference-heap',
    title: T('Java referansları, takma ad (alias) ve çöp toplayıcı (garbage collector)',
             'Java references, aliasing, and the garbage collector'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('Zincirleme referanslar, sıradan toplama', 'A reference chain, ordinary collection'),
        data: { ops: [ {t:'new',v:'p'}, {t:'new',v:'q'}, {t:'link',v:'p',target:'q'}, {t:'new',v:'r'},
                        {t:'assign',dst:'s',src:'r'}, {t:'null',v:'p'}, {t:'gc'}, {t:'null',v:'q'}, {t:'gc'},
                        {t:'null',v:'r'}, {t:'gc'} ] } },
      { id: 'hard', level: 'hard', name: T('4 nesnelik zincir, birden çok toplama turu', 'A 4-object chain, several collection passes'),
        data: { ops: [ {t:'new',v:'p'}, {t:'new',v:'q'}, {t:'new',v:'r'}, {t:'new',v:'s'},
                        {t:'link',v:'p',target:'q'}, {t:'link',v:'q',target:'r'}, {t:'link',v:'r',target:'s'},
                        {t:'assign',dst:'p',src:'s'}, {t:'gc'}, {t:'null',v:'q'}, {t:'gc'},
                        {t:'link',v:'r',target:null}, {t:'null',v:'s'}, {t:'gc'}, {t:'null',v:'p'}, {t:'gc'} ] } },
      { id: 'cycle', level: 'edge', name: T('Birbirini gösteren iki nesne, kökten kopunca yine toplanır', 'Two objects referencing each other are still collected once cut off from every root'),
        data: { ops: [ {t:'new',v:'p'}, {t:'new',v:'q'}, {t:'link',v:'p',target:'q'}, {t:'link',v:'q',target:'p'},
                        {t:'new',v:'r'}, {t:'new',v:'s'}, {t:'gc'}, {t:'null',v:'p'}, {t:'null',v:'q'}, {t:'gc'},
                        {t:'assign',dst:'r',src:'s'}, {t:'gc'} ] } },
      { id: 'self-loop', level: 'edge', name: T('Kendini gösteren bir nesne (öz-döngü)', 'An object that references itself (a self-loop)'),
        data: { ops: [ {t:'new',v:'p'}, {t:'link',v:'p',target:'p'}, {t:'new',v:'q'}, {t:'new',v:'r'},
                        {t:'link',v:'q',target:'r'}, {t:'gc'}, {t:'null',v:'p'}, {t:'gc'}, {t:'new',v:'s'},
                        {t:'assign',dst:'r',src:'s'}, {t:'gc'} ] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.ops.length; },
    /** Independent plain simulation: a small graph of "new object" (root -> object) and object -> object
     * .ref edges; gc() does its own reachability search (from every currently non-null root, follow
     * .ref) and collects whatever it cannot reach -- a mutual cycle included, since NO root reaches it. */
    reference: function (d) {
      var objects = [], vars = {};
      function reach() {
        var live = {}, stack = [], nm;
        for (nm in vars) if (vars[nm] !== null && !objects[vars[nm]].collected) stack.push(vars[nm]);
        while (stack.length) {
          var o = stack.pop();
          if (live[o]) continue;
          live[o] = true;
          var rf = objects[o].ref;
          if (rf !== null && !live[rf]) stack.push(rf);
        }
        return live;
      }
      function sweep() { var live = reach(); objects.forEach(function (o, i) { if (!o.collected && !live[i]) o.collected = true; }); }
      d.ops.forEach(function (op) {
        if (op.t === 'new') { objects.push({ ref: null, collected: false }); vars[op.v] = objects.length - 1; }
        else if (op.t === 'assign') { vars[op.dst] = vars[op.src] === undefined ? null : vars[op.src]; }
        else if (op.t === 'null') { vars[op.v] = null; }
        else if (op.t === 'link') { var oi = vars[op.v]; if (oi !== undefined && oi !== null) objects[oi].ref = op.target === null ? null : (vars[op.target] === undefined ? null : vars[op.target]); }
        else if (op.t === 'gc') sweep();
      });
      sweep();
      var collected = [], reachableIdx = [];
      objects.forEach(function (o, i) { (o.collected ? collected : reachableIdx).push(i); });
      return { totalObjects: objects.length, collected: collected, reachable: reachableIdx };
    },
    random: function (level, r) {
      var nOps = { easy: 10, normal: 12, hard: 16, extreme: 20 }[level];
      var pool = ['p', 'q', 'r', 's'], have = {}, ops = [], i;
      for (i = 0; i < nOps; i++) {
        var roll = r();
        if (roll < 0.3 || i === 0) {
          var v = pool[D.randInt(r, 0, pool.length - 1)];
          ops.push({ t: 'new', v: v }); have[v] = true;
        } else if (roll < 0.45) {
          var srcs = pool.filter(function (x) { return have[x]; });
          if (srcs.length) {
            var dst = pool[D.randInt(r, 0, pool.length - 1)], src = srcs[D.randInt(r, 0, srcs.length - 1)];
            ops.push({ t: 'assign', dst: dst, src: src }); have[dst] = true;
          } else { var v2 = pool[D.randInt(r, 0, pool.length - 1)]; ops.push({ t: 'new', v: v2 }); have[v2] = true; }
        } else if (roll < 0.6) {
          ops.push({ t: 'null', v: pool[D.randInt(r, 0, pool.length - 1)] });
        } else if (roll < 0.82) {
          var lvs = pool.filter(function (x) { return have[x]; });
          if (lvs.length) {
            var lv = lvs[D.randInt(r, 0, lvs.length - 1)];
            var tgt = r() < 0.3 ? null : pool[D.randInt(r, 0, pool.length - 1)];
            ops.push({ t: 'link', v: lv, target: tgt });
          } else { var v3 = pool[D.randInt(r, 0, pool.length - 1)]; ops.push({ t: 'new', v: v3 }); have[v3] = true; }
        } else {
          ops.push({ t: 'gc' });
        }
      }
      if (ops[ops.length - 1].t !== 'gc') ops.push({ t: 'gc' });
      return { ops: ops };
    },
    input: {
      hint: T('Örnek: ops: new:p new:q link:p->q new:r r=r null:p gc null:q gc null:r gc',
              'Example: ops: new:p new:q link:p->q new:r r=r null:p gc null:q gc null:r gc'),
      parse: function (text) {
        var ops = [], m;
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (/^ops?:$/i.test(tok)) return;
          if (/^gc$/i.test(tok)) { ops.push({ t: 'gc' }); return; }
          if ((m = /^new:([a-z])$/i.exec(tok))) { ops.push({ t: 'new', v: m[1].toLowerCase() }); return; }
          if ((m = /^null:([a-z])$/i.exec(tok))) { ops.push({ t: 'null', v: m[1].toLowerCase() }); return; }
          if ((m = /^link:([a-z])->(null|[a-z])$/i.exec(tok))) { ops.push({ t: 'link', v: m[1].toLowerCase(), target: /^null$/i.test(m[2]) ? null : m[2].toLowerCase() }); return; }
          if ((m = /^([a-z])=([a-z])$/i.exec(tok))) { ops.push({ t: 'assign', dst: m[1].toLowerCase(), src: m[2].toLowerCase() }); return; }
          throw T('"' + tok + '" anlaşılmadı: new:p, null:p, q=p, link:p->q ya da gc yazın.', '"' + tok + '" is not understood: write new:p, null:p, q=p, link:p->q, or gc.');
        });
        if (!ops.length) throw T('En az bir işlem yazın (örn. new:p).', 'Write at least one operation (e.g. new:p).');
        if (ops.length > 40) throw T('En çok 40 işlem.', 'At most 40 operations.');
        return { ops: ops };
      },
      format: function (d) { return 'ops: ' + d.ops.map(opTok).join(' '); },
      bad: ['', 'ops: new:1', 'ops: link:p-q', 'ops: p=1', 'ops: banana'],
      tokens: function (d) { return d.ops.map(opTok); }
    },
    build: function (S, d) {
      var nm = names(d.ops);
      var totalObjects = d.ops.filter(function (o) { return o.t === 'new'; }).length;
      var W = 60, H = 44, GAP = 70, X0 = 44, Y0 = 190, ROW = 12; // GAP > W: room for a clearly-curved ref arrow between neighbours
      var numRows = Math.max(1, Math.ceil(totalObjects / ROW));
      function opos(i) { var col = i % ROW, row = Math.floor(i / ROW); return { x: X0 + col * (W + GAP), y: Y0 + row * (H + 60) }; }
      var PY = Y0 + numRows * (H + 60) + 60, PX0 = 60, PPITCH = 130;
      var vars = {};
      nm.forEach(function (v, i) {
        vars[v] = null;
        S.box('var_' + v, { x: PX0 + i * PPITCH, y: PY, w: 64, h: 40, text: 'NULL', above: v, style: 'dim', size: 14 });
      });
      S.label('rowlbl', { x: X0 - 16, y: opos(0).y + H / 2 + 5, text: 'objects =', anchor: 'end', size: 14, bold: true });
      S.step(T('`Node ' + nm.join(' = null, ') + ' = null;` — her referans değişkeni NULL ile başlıyor: hiçbiri bir nesne göstermiyor.',
               '`Node ' + nm.join(' = null, ') + ' = null;` — every reference variable starts as null: none of them points to an object yet.'),
             { c: [1, 2], java: [1, 2] });

      var objects = []; // {ref: idx|null, collected: bool}
      function syncVarArrow(v) {
        var aid = 'arrv_' + v;
        if (vars[v] === null) { if (S.has(aid)) S.remove(aid); }
        else if (S.has(aid)) S.set(aid, { to: 'o' + vars[v] });
        else S.arrow(aid, { from: 'var_' + v, to: 'o' + vars[v], kind: 'center' });
      }
      function syncRefArrow(oi) {
        var aid = 'arro_' + oi, target = objects[oi].ref;
        if (S.has(aid)) S.remove(aid);
        // a centre-to-centre arrow collapses to nothing when from === to, so a self-reference is
        // shown as small text above the object's own box instead of a separate arrow (narrower than
        // the box itself, so it never reaches a neighbour; "above" stays clear of the root arrows,
        // which always approach an object from below).
        S.set('o' + oi, { above: target === oi ? T('kendine', 'self') : null });
        if (target === null || target === oi) return;
        // always arcs upward, well clear of the object row and of the root arrows (which approach
        // from below) -- a visibly curved arc, not a straight line squashed between two boxes.
        var bend = (target > oi ? -1 : 1) * (70 + 14 * Math.abs(target - oi));
        S.arrow(aid, { from: 'o' + oi, to: 'o' + target, kind: 'center', bend: bend });
      }
      function reach() {
        var live = {}, stack = [], v2;
        for (v2 in vars) if (vars[v2] !== null && !objects[vars[v2]].collected) stack.push(vars[v2]);
        while (stack.length) {
          var o = stack.pop();
          if (live[o]) continue;
          live[o] = true;
          var rf = objects[o].ref;
          if (rf !== null && !live[rf]) stack.push(rf);
        }
        return live;
      }
      function clean() {
        objects.forEach(function (o, i) { S.set('o' + i, { style: o.collected ? 'dim' : 'normal' }); });
        nm.forEach(function (v) { S.set('var_' + v, { style: vars[v] === null ? 'dim' : 'normal' }); });
      }

      d.ops.forEach(function (op, k) {
        clean();
        S.at(k);
        if (op.t === 'new') {
          var idx = objects.length, p = opos(idx);
          objects.push({ ref: null, collected: false });
          S.box('o' + idx, { x: p.x, y: p.y, w: W, h: H, text: 'o' + idx, style: 'new', size: 15 });
          vars[op.v] = idx; syncVarArrow(op.v);
          S.set('var_' + op.v, { text: 'o' + idx, style: 'new' });
          S.step(T('`' + op.v + ' = new Node();` — öbekte yeni bir nesne (`o' + idx + '`) yaratılır; `' + op.v + '` ona işaret eder.',
                   '`' + op.v + ' = new Node();` — a new object (`o' + idx + '`) is created on the heap; `' + op.v + '` points to it.'),
                 { c: LINE.new, java: LINE.new });
        } else if (op.t === 'assign') {
          vars[op.dst] = vars[op.src] === undefined ? null : vars[op.src];
          syncVarArrow(op.dst);
          S.set('var_' + op.dst, { text: vars[op.dst] === null ? 'NULL' : 'o' + vars[op.dst], style: 'new' });
          S.step(T('`' + op.dst + ' = ' + op.src + ';` — `' + op.dst + '` artık `' + op.src + '` ile AYNI nesneyi gösteriyor: bir takma ad (alias), kopya değil.',
                   '`' + op.dst + ' = ' + op.src + ';` — `' + op.dst + '` now points to the SAME object as `' + op.src + '`: an alias, not a copy.'),
                 { c: LINE.assign, java: LINE.assign });
        } else if (op.t === 'null') {
          vars[op.v] = null; syncVarArrow(op.v);
          S.set('var_' + op.v, { text: 'NULL', style: 'del' });
          S.step(T('`' + op.v + ' = null;` — `' + op.v + '` artık hiçbir nesneyi göstermiyor.',
                   '`' + op.v + ' = null;` — `' + op.v + '` no longer points to any object.'),
                 { c: LINE.null, java: LINE.null });
        } else if (op.t === 'link') {
          var oi = vars[op.v];
          if (oi === null || oi === undefined) {
            S.step(T('`' + op.v + '.ref = ...` — `' + op.v + '` şu an hiçbir nesne göstermiyor, bu satır etkisiz kalır.',
                     '`' + op.v + '.ref = ...` — `' + op.v + '` does not currently point to any object, so this has no effect.'),
                   { c: LINE.link, java: LINE.link });
          } else {
            var tval = op.target === null ? null : (vars[op.target] === undefined ? null : vars[op.target]);
            objects[oi].ref = tval; syncRefArrow(oi);
            S.step(T('`' + op.v + '.ref = ' + (op.target === null ? 'null' : op.target) + ';` — `o' + oi + '`\'in kendi `.ref` alanı ' + (tval === null ? 'null olur.' : ('artık `o' + tval + '`\'i gösteriyor' + (tval === oi ? ': kendi kendine (öz-döngü)!' : '.'))),
                     '`' + op.v + '.ref = ' + (op.target === null ? 'null' : op.target) + ';` — `o' + oi + '`\'s own `.ref` field ' + (tval === null ? 'becomes null.' : ('now points to `o' + tval + '`' + (tval === oi ? ': to itself (a self-loop)!' : '.')))),
                   { c: LINE.link, java: LINE.link });
          }
        } else {
          var before = reach();
          var newly = [];
          objects.forEach(function (o, i) { if (!o.collected && !before[i]) { o.collected = true; newly.push(i); } });
          newly.forEach(function (i) { S.set('o' + i, { style: 'del' }); if (S.has('arro_' + i)) S.remove('arro_' + i); });
          var cycleNote = newly.length > 1 ? T(' Bunlardan bazıları birbirini gösteriyordu (döngü) — yine de HİÇBİR kökten erişilemediği için toplandılar: referans sayımı değil, ERİŞİLEBİLİRLİK esastır.',
                                                ' Some of these referenced each other (a cycle) — they were still collected because NO root could reach them: reachability, not reference counting, is what matters.') : { tr: '', en: '' };
          var liveVars = nm.filter(function (v) { return vars[v] !== null; });
          var rootsTr = liveVars.length ? liveVars.join(', ') : 'hiçbiri';
          var rootsEn = liveVars.length ? liveVars.join(', ') : 'none';
          S.step(T('**Çöp toplama (garbage collection)**: her kökten (`' + rootsTr + '`) izleme yapılır. ' +
                     (newly.length ? ('Erişilemeyen ' + newly.length + ' nesne (' + newly.map(function (i) { return 'o' + i; }).join(', ') + ') toplandı.' + cycleNote.tr) : 'Toplanacak yeni bir şey yok: kalan tüm nesneler hâlâ erişilebilir.'),
                   '**Garbage collection**: trace from every root (`' + rootsEn + '`). ' +
                     (newly.length ? (newly.length + ' unreachable object' + (newly.length > 1 ? 's' : '') + ' (' + newly.map(function (i) { return 'o' + i; }).join(', ') + ') ' + (newly.length > 1 ? 'were' : 'was') + ' collected.' + cycleNote.en) : 'Nothing new to collect: every remaining object is still reachable.')),
                 { c: LINE.gc, java: LINE.gc });
        }
      });
      clean();
      S.at(null);
      var collected = [], reachableIdx = [];
      objects.forEach(function (o, i) { (o.collected ? collected : reachableIdx).push(i); });
      S.result = { totalObjects: objects.length, collected: collected, reachable: reachableIdx };
      S.step(T('Bitti: ' + objects.length + ' nesne yaratıldı. Toplanan: ' + (collected.length ? collected.map(function (i) { return 'o' + i; }).join(', ') : 'yok') +
               '. Hâlâ erişilebilir: ' + (reachableIdx.length ? reachableIdx.map(function (i) { return 'o' + i; }).join(', ') : 'yok') + '.',
               'Done: ' + objects.length + ' objects were created. Collected: ' + (collected.length ? collected.map(function (i) { return 'o' + i; }).join(', ') : 'none') +
               '. Still reachable: ' + (reachableIdx.length ? reachableIdx.map(function (i) { return 'o' + i; }).join(', ') : 'none') + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
