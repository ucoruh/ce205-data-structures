/* Week 3 — Tower of Hanoi: move n disks from peg A to peg C, one at a time, never a larger disk on a smaller one. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    'void tower_of_hanoi(int n, char from, char to, char via) {',
    '    if (n == 0) return;                          /* nothing to move */',
    '    tower_of_hanoi(n - 1, from, via, to);         /* move n-1 out of the way */',
    '    move_disk(n, from, to);                       /* move the largest */',
    '    tower_of_hanoi(n - 1, via, to, from);         /* put n-1 back on top */',
    '}'
  ];
  var JAVA = [
    'void towerOfHanoi(int n, char from, char to, char via) {',
    '    if (n == 0) return;                          // nothing to move',
    '    towerOfHanoi(n - 1, from, via, to);           // move n-1 out of the way',
    '    moveDisk(n, from, to);                        // move the largest',
    '    towerOfHanoi(n - 1, via, to, from);           // put n-1 back on top',
    '}'
  ];

  /** Classic recursive Hanoi move generator, in {disk, from, to} solve order. Used by both reference() and
   *  build() so the recorded S.result can never drift from what the animation actually shows. */
  function solve(n, from, to, via, out) {
    if (n === 0) return;
    solve(n - 1, from, via, to, out);
    out.push({ disk: n, from: from, to: to });
    solve(n - 1, via, to, from, out);
  }

  D.define({
    id: 'tower-of-hanoi',
    title: T('Hanoi Kulesi: n disk, özyinelemeli çözüm', 'Tower of Hanoi: n disks, recursive solution'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('4 disk (15 hamle)', '4 disks (15 moves)'),
        data: { n: 4 } },
      { id: 'hard', level: 'hard', name: T('5 disk (31 hamle)', '5 disks (31 moves)'),
        data: { n: 5 } },
      { id: 'trivial', level: 'edge', name: T('bir disk: doğrudan A→C', 'one disk: straight A→C'),
        data: { n: 1 }, small: true },
      { id: 'illegal-move', level: 'edge', name: T('iki disk: yasak hamle örneği', 'two disks: an illegal-move example'),
        data: { n: 2 }, small: true },
      { id: 'cap-readability', level: 'edge', name: T('altı disk: okunabilirlik sınırı', 'six disks: the readability cap'),
        data: { n: 6 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of input values — here defined as the number of moves the algorithm actually performs, 2^n - 1. */
    size: function (d) { return Math.pow(2, d.n) - 1; },
    /** Independent computation of the expected outcome (checked against S.result by test.js). */
    reference: function (d) {
      // independent of solve(): the iterative bit method. Move m moves disk (trailing zeros of m) + 1 from peg
      // (m & (m-1)) % 3 to peg ((m | (m-1)) + 1) % 3; that sends the tower to peg 2 for odd n, peg 1 for even n.
      var pegs = d.n % 2 ? ['A', 'B', 'C'] : ['A', 'C', 'B'], moves = [];
      for (var m = 1; m < Math.pow(2, d.n); m++) {
        var disk = 1, x = m;
        while (x % 2 === 0) { disk++; x /= 2; }
        moves.push({ disk: disk, from: pegs[(m & (m - 1)) % 3], to: pegs[((m | (m - 1)) + 1) % 3] });
      }
      return { moves: moves };
    },
    random: function (level, r) {
      var pick = { easy: [4, 4], normal: [4, 5], hard: [5, 6], extreme: [6, 6] }[level] || [4, 5];
      return { n: D.randInt(r, pick[0], pick[1]) };
    },
    input: {
      hint: T('Örnek: 4   (1 ile 6 arasında disk sayısı n)', 'Example: 4   (number of disks n, between 1 and 6)'),
      parse: function (text) {
        var s = String(text).trim();
        if (!/^\d+$/.test(s)) throw T('"' + s + '" bir tamsayı olmalı, örn. 4.', '"' + s + '" must be an integer, e.g. 4.');
        var n = parseInt(s, 10);
        if (n < 1) throw T('En az 1 disk olmalı.', 'There must be at least 1 disk.');
        if (n > 6) throw T('En çok 6 disk: bundan fazlası ekranda okunaklı kalmaz (algoritmanın kendisi bir sınır koymaz).', 'At most 6 disks: more than that stops being readable on screen (the algorithm itself has no such limit).');
        return { n: n };
      },
      format: function (d) { return String(d.n); },
      bad: ['', '0', '7', '10', 'abc', '3.5', '-1']
    },
    build: function (S, d) {
      var PEG = { A: 200, B: 440, C: 680 }, BASE_Y = 300, ROD_TOP = 120, ROD_H = 180, DH = 30;
      var WIDTH = function (disk) { return 50 + disk * (d.n <= 4 ? 26 : (d.n === 5 ? 21 : 17)); };
      var tower = { A: [], B: [], C: [] };
      for (var i = d.n; i >= 1; i--) tower.A.push(i); // bottom (biggest) first

      S.box('base', { x: 120, y: BASE_Y, w: 640, h: 12, style: 'dim', text: '' });
      ['A', 'B', 'C'].forEach(function (p) {
        S.box('rod' + p, { x: PEG[p] - 6, y: ROD_TOP, w: 12, h: ROD_H, style: 'dim', text: '' });
        S.label('lbl' + p, { x: PEG[p], y: BASE_Y + 34, text: p, bold: true, size: 18 });
      });
      function diskId(k) { return 'd' + k; }
      function place(p) {
        tower[p].forEach(function (disk, idx) {
          var w = WIDTH(disk);
          S.set(diskId(disk), { x: PEG[p] - w / 2, y: BASE_Y - (idx + 1) * DH, w: w });
        });
      }
      for (var disk = d.n; disk >= 1; disk--) {
        var w = WIDTH(disk), idxOnA = tower.A.indexOf(disk);
        S.box(diskId(disk), { x: PEG.A - w / 2, y: BASE_Y - (idxOnA + 1) * DH, w: w, h: DH - 6, text: String(disk), style: 'active', size: 15 });
      }
      S.label('counter', { x: 440, y: 50, text: T('hamle 0 / ' + (Math.pow(2, d.n) - 1), 'move 0 / ' + (Math.pow(2, d.n) - 1)), bold: true, size: 18, mono: true });
      S.label('decision', { x: 440, y: 78, text: '', bold: true, size: 16, mono: true });
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      var MVX0 = 130, MVW = 46, MVROWCAP = 14, MVY0 = BASE_Y + 70, mvIdx = 0;
      S.label('movelbl', { x: MVX0 - 16, y: MVY0 + 22, text: T('hamleler =', 'moves ='), anchor: 'end', style: 'dim', size: 14 });
      var lastNewMove = -1;
      function addMove(mv, style) {
        var s = style || 'new';
        if (s === 'new' && lastNewMove >= 0) S.set('mv' + lastNewMove, { style: 'dim' });
        var row = Math.floor(mvIdx / MVROWCAP), col = mvIdx % MVROWCAP;
        S.box('mv' + mvIdx, { x: MVX0 + col * MVW, y: MVY0 + row * 40, w: 40, h: 32, text: mv.disk + mv.from + '→' + mv.to, style: s, size: 13, mono: true });
        if (s === 'new') lastNewMove = mvIdx;
        mvIdx++;
      }

      S.step(T('Kural: `' + d.n + '` diski A\'dan C\'ye taşı; her seferinde tek disk, büyük disk küçüğün üstüne asla konamaz. Fikir özyinelemeli: üstteki `n-1` diski kenara çek, en büyüğü taşı, `n-1` diski onun üstüne geri koy.',
               'Rule: move `' + d.n + '` disks from A to C; one disk at a time, a larger disk is never placed on a smaller one. The idea is recursive: move the top `n-1` disks aside, move the largest, put the `n-1` disks back on top of it.'),
             { c: [1, 2, 3, 4, 5], java: [1, 2, 3, 4, 5] });

      if (d.n === 2) {
        var w2 = WIDTH(2);
        S.set(diskId(2), { x: PEG.A - w2 / 2, y: BASE_Y - 3 * DH, style: 'del' });
        decide('illegal!', 'del');
        S.step(T('Önce **yasak** bir hamleyi gösterelim: disk 2 (büyük), disk 1\'in (küçük) üstüne konmaya çalışılıyor. Bu **kurala aykırı** — büyük disk hiçbir zaman küçüğün üstüne konamaz, bu yüzden reddedilir.',
                 'First let us show an **illegal** move: disk 2 (larger) is being placed on top of disk 1 (smaller). This **breaks the rule** — a larger disk can never go on a smaller one, so it is rejected.'),
               { c: [4], java: [4] });
        place('A');
        S.set(diskId(2), { style: 'active' });
        S.set(diskId(1), { style: 'active' });
        decide('', 'normal');
        S.step(T('Reddedildi. Pegler gerçek başlangıç durumuna döndü; şimdi asıl özyinelemeli çözümü izleyelim.',
                 'Rejected. The pegs are reset to the real starting position; now let us follow the actual recursive solution.'),
               { c: [1, 2, 3, 4, 5], java: [1, 2, 3, 4, 5] });
      }

      function resetDisks(style) { for (var dk = 1; dk <= d.n; dk++) S.set(diskId(dk), { style: style }); }

      var moves = [];
      solve(d.n, 'A', 'C', 'B', moves);
      var total = moves.length, BATCH = total - 1 > 40 ? Math.ceil((total - 1) / 40) : 1;

      // Move 1 is always shown in full: lift, then place — a separate step for each half of the move.
      var mv0 = moves[0];
      tower[mv0.from].pop();
      S.set(diskId(mv0.disk), { y: 60, style: 'hl' });
      S.set('counter', { text: T('hamle 1 / ' + total, 'move 1 / ' + total) });
      S.step(T('Hamle 1: disk ' + mv0.disk + ' `' + mv0.from + '` çubuğundan kaldırılır — çubuğun en üstündeki disk olduğu için elimize alabiliriz.',
               'Move 1: disk ' + mv0.disk + ' is lifted off rod `' + mv0.from + '` — it is the topmost disk there, so we can pick it up.'),
             { c: 4, java: 4 });
      tower[mv0.to].push(mv0.disk);
      place(mv0.to);
      S.set(diskId(mv0.disk), { style: 'active' });
      addMove(mv0);
      S.step(T('…ve `' + mv0.to + '` çubuğuna, oradaki en üstteki diskin üzerine konur. `move_disk(' + mv0.disk + ', ' + mv0.from + ', ' + mv0.to + ')` tamamlandı.',
               '…and placed on rod `' + mv0.to + '`, on top of whatever disk is currently there. `move_disk(' + mv0.disk + ', ' + mv0.from + ', ' + mv0.to + ')` is done.'),
             { c: 4, java: 4 });

      // Remaining moves: one step per move while that stays under ~40 steps; otherwise grouped into
      // batches of BATCH consecutive moves per step, jumping straight to the end-of-batch peg layout.
      var idx = 1;
      while (idx < total) {
        var groupEnd = Math.min(total, idx + BATCH); // moves[idx .. groupEnd-1], 0-based, exclusive end
        for (var j = idx; j < groupEnd; j++) { tower[moves[j].from].pop(); tower[moves[j].to].push(moves[j].disk); }
        place('A'); place('B'); place('C');
        resetDisks('active');
        var firstNum = idx + 1, lastNum = groupEnd;
        S.set('counter', { text: T('hamle ' + lastNum + ' / ' + total, 'move ' + lastNum + ' / ' + total) });
        for (var mi = idx; mi < groupEnd; mi++) addMove(moves[mi], mi === groupEnd - 1 ? 'new' : 'dim');
        if (groupEnd - idx === 1) {
          var mv = moves[idx];
          S.set(diskId(mv.disk), { style: 'hl' });
          S.step(T('Hamle ' + firstNum + ': disk ' + mv.disk + ', `' + mv.from + '` çubuğundan `' + mv.to + '` çubuğuna geçer.',
                   'Move ' + firstNum + ': disk ' + mv.disk + ' moves from rod `' + mv.from + '` to rod `' + mv.to + '`.'),
                 { c: 4, java: 4 });
        } else {
          S.step(T('Hamleler ' + firstNum + '–' + lastNum + ' aynı şekilde olur, sadece daha hızlı gösteriliyor.',
                   'Moves ' + firstNum + '–' + lastNum + ' happen the same way, just shown faster.'),
                 { c: 4, java: 4 });
        }
        idx = groupEnd;
      }

      S.result = { moves: moves };
      S.step(T('Bitti: `' + d.n + '` disk, `' + total + '` hamlede taşındı (`2^' + d.n + ' - 1 = ' + total + '`) — hamle sayısı üstel büyür.' +
               (d.n === 6 ? ' 64 diskte, saniyede bir hamleyle, bu yaklaşık 585 milyar yıl sürerdi!' : ''),
               'Done: `' + d.n + '` disks moved in `' + total + '` moves (`2^' + d.n + ' - 1 = ' + total + '`) — the move count grows exponentially.' +
               (d.n === 6 ? ' With 64 disks, at one move per second, this would take about 585 billion years!' : '')));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
