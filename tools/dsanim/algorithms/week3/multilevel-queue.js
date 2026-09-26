/* Week 3 — multilevel queue scheduling: three priority classes (system, interactive, batch), each its own FIFO
 * queue; the scheduler always serves the highest-priority non-empty queue. Two phases, like the old v1 source:
 * (1) every process arrives and is admitted into its class's queue, (2) the scheduler drains the queues in
 * priority order until all three are empty. Danger: a queue that never empties starves the ones below it. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'Queue q[3];  /* 0 = system, 1 = interactive, 2 = batch */',
    '',
    'void admit(Process p) {',
    '    enqueue(&q[p.level], p);         /* each class has its own queue */',
    '}',
    '',
    'Process pick_next(void) {',
    '    for (int lvl = 0; lvl < 3; lvl++)  /* highest priority first */',
    '        if (!is_empty(&q[lvl]))',
    '            return dequeue(&q[lvl]);',
    '    return IDLE;',
    '}'
  ];
  var JAVA = [
    'List<Deque<Process>> q = List.of(new ArrayDeque<>(),',
    '        new ArrayDeque<>(), new ArrayDeque<>()); // system, interactive, batch',
    'void admit(Process p) {',
    '    q.get(p.level).addLast(p);        // each class has its own queue',
    '}',
    '',
    'Process pickNext() {',
    '    for (int lvl = 0; lvl < 3; lvl++)  // highest priority first',
    '        if (!q.get(lvl).isEmpty())',
    '            return q.get(lvl).pollFirst();',
    '    return Process.IDLE;',
    '}'
  ];
  var TOO_MANY = (function () {
    var toks = [];
    for (var i = 1; i <= 41; i++) toks.push('P' + i + ':0');
    return toks.join(' ');
  })();

  D.define({
    id: 'multilevel-queue',
    title: T('Çok seviyeli kuyruk zamanlaması', 'Multilevel queue scheduling'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('12 süreç, üç sınıfa dengeli dağılmış', '12 processes, evenly spread across three classes'),
        data: { arrivals: [
          { name: 'P1', level: 1 }, { name: 'P2', level: 2 }, { name: 'P3', level: 0 }, { name: 'P4', level: 1 },
          { name: 'P5', level: 0 }, { name: 'P6', level: 2 }, { name: 'P7', level: 0 }, { name: 'P8', level: 1 },
          { name: 'P9', level: 2 }, { name: 'P10', level: 0 }, { name: 'P11', level: 1 }, { name: 'P12', level: 2 }
        ] } },
      { id: 'bursts', level: 'hard', name: T('16 süreç: sınıf başına art arda gelen gruplar (burst)', '16 processes: back-to-back bursts within each class'),
        data: { arrivals: [
          { name: 'P1', level: 1 }, { name: 'P2', level: 1 }, { name: 'P3', level: 1 }, { name: 'P4', level: 1 },
          { name: 'P5', level: 0 }, { name: 'P6', level: 0 }, { name: 'P7', level: 0 }, { name: 'P8', level: 0 },
          { name: 'P9', level: 2 }, { name: 'P10', level: 2 }, { name: 'P11', level: 2 }, { name: 'P12', level: 2 },
          { name: 'P13', level: 1 }, { name: 'P14', level: 1 }, { name: 'P15', level: 1 }, { name: 'P16', level: 1 }
        ] } },
      { id: 'starvation-risk', level: 'edge', name: T('Açlık riski: erken gelen 1 toplu iş, 9 sistem+etkileşimli arasında', 'Starvation risk: 1 early batch process among 9 system+interactive ones'),
        data: { arrivals: [
          { name: 'P1', level: 0 }, { name: 'P2', level: 2 }, { name: 'P3', level: 1 }, { name: 'P4', level: 0 },
          { name: 'P5', level: 1 }, { name: 'P6', level: 0 }, { name: 'P7', level: 1 }, { name: 'P8', level: 0 },
          { name: 'P9', level: 1 }, { name: 'P10', level: 0 }
        ] } },
      { id: 'all-one-level', level: 'edge', name: T('Hepsi aynı seviyede: 10 etkileşimli süreç', 'All at one level: 10 interactive processes'),
        data: { arrivals: [
          { name: 'P1', level: 1 }, { name: 'P2', level: 1 }, { name: 'P3', level: 1 }, { name: 'P4', level: 1 },
          { name: 'P5', level: 1 }, { name: 'P6', level: 1 }, { name: 'P7', level: 1 }, { name: 'P8', level: 1 },
          { name: 'P9', level: 1 }, { name: 'P10', level: 1 }
        ] } },
      { id: 'level-always-empty', level: 'edge', name: T('Bir seviye hiç dolmuyor: sadece sistem ve toplu iş', 'A level never fills: only system and batch'),
        data: { arrivals: [
          { name: 'P1', level: 0 }, { name: 'P2', level: 2 }, { name: 'P3', level: 0 }, { name: 'P4', level: 2 },
          { name: 'P5', level: 0 }, { name: 'P6', level: 2 }, { name: 'P7', level: 0 }, { name: 'P8', level: 2 },
          { name: 'P9', level: 0 }, { name: 'P10', level: 2 }
        ] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of processes that arrive — every example must have at least 10. */
    size: function (d) { return d.arrivals.length; },
    /** Independent computation of the expected service order (checked against S.result by test.js). */
    reference: function (d) {
      var q = [[], [], []];
      d.arrivals.forEach(function (a) { q[a.level].push(a.name); });
      var order = [];
      while (q[0].length || q[1].length || q[2].length) {
        var lvl = q[0].length ? 0 : (q[1].length ? 1 : 2);
        order.push(q[lvl].shift());
      }
      return { order: order };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level];
      var arrivals = [];
      for (var i = 1; i <= n; i++) {
        var lvl = D.randInt(r, 0, 2);
        // flavor: batch (2) is rarer at harder levels, re-roll into system/interactive about half the time
        if ((level === 'hard' || level === 'extreme') && lvl === 2 && r() < 0.5) lvl = D.randInt(r, 0, 1);
        arrivals.push({ name: 'P' + i, level: lvl });
      }
      return { arrivals: arrivals };
    },
    input: {
      hint: T('Örnek: P1:1 P2:2 P3:0 P4:1   (ad:seviye; seviye 0 = sistem, 1 = etkileşimli, 2 = toplu iş)',
              'Example: P1:1 P2:2 P3:0 P4:1   (name:level; level 0 = system, 1 = interactive, 2 = batch)'),
      parse: function (text) {
        var toks = String(text).trim().split(/[\s,;]+/).filter(Boolean);
        if (!toks.length) throw T('En az bir süreç yazın.', 'Write at least one process.');
        if (toks.length > 40) throw T('En çok 40 süreç.', 'At most 40 processes.');
        var arrivals = toks.map(function (tok) {
          var m = /^([A-Za-z][A-Za-z0-9]*):(-?\d+)$/.exec(tok);
          if (!m) throw T('"' + tok + '" anlaşılmadı: ad:seviye yazın, örnek P1:1.', '"' + tok + '" is not understood: write name:level, e.g. P1:1.');
          var lvl = parseInt(m[2], 10);
          if (lvl !== 0 && lvl !== 1 && lvl !== 2) throw T('"' + tok + '": seviye 0, 1 ya da 2 olmalı.', '"' + tok + '": the level must be 0, 1 or 2.');
          return { name: m[1], level: lvl };
        });
        return { arrivals: arrivals };
      },
      format: function (d) { return d.arrivals.map(function (a) { return a.name + ':' + a.level; }).join(' '); },
      bad: ['', 'P1:5', 'P1', 'P1:x', TOO_MANY]
    },
    build: function (S, d) {
      var AD = [T('0: sistem', '0: system'), T('1: etkileşimli', '1: interactive'), T('2: toplu iş', '2: batch')];
      var counts = [0, 0, 0];
      d.arrivals.forEach(function (a) { counts[a.level]++; });

      var LX = 190, LY = [70, 210, 350], LH = 90, BW = 56, BH = 50, BSTEP = 64;
      function laneX(idx) { return LX + 24 + idx * BSTEP; }
      var LW = [0, 1, 2].map(function (lvl) { return Math.max(170, 48 + counts[lvl] * BSTEP); });
      var maxLW = Math.max(LW[0], LW[1], LW[2]);
      var CPUW = 110, CPUH = 90, CPUX = LX + maxLW + 160, CPUY = LY[1];

      for (var lv = 0; lv < 3; lv++) S.region('q' + lv, { x: LX, y: LY[lv], w: LW[lv], h: LH, title: AD[lv] });
      S.box('cpu', { x: CPUX, y: CPUY, w: CPUW, h: CPUH, text: 'CPU', style: 'active', size: 20 });
      S.label('orderv', { x: CPUX + CPUW / 2, y: CPUY + CPUH + 34, size: 14, style: 'dim', anchor: 'middle',
        text: T('şimdiye kadar: 0/' + d.arrivals.length, 'so far: 0/' + d.arrivals.length) });
      var OX0 = LX, OY0 = LY[2] + LH + 60, OW = 56, OROWCAP = 14;
      S.label('orderlbl', { x: OX0 - 16, y: OY0 + 24, text: T('servis sırası =', 'service order ='), anchor: 'end', style: 'dim', size: 14 });
      function addOrder(name, lvl) {
        var idx = order.length - 1, row = Math.floor(idx / OROWCAP), col = idx % OROWCAP;
        if (idx > 0) S.set('o' + (idx - 1), { style: 'dim' });
        S.box('o' + idx, { x: OX0 + col * OW, y: OY0 + row * 40, w: 50, h: 34, text: name, style: 'new', size: 13 });
      }

      S.step(T('İşletim sistemi süreçleri sınıflarına göre **üç ayrı kuyrukta** tutar: `0` = sistem, `1` = etkileşimli, `2` = toplu iş. '
               + 'Her kuyruk kendi içinde FIFO; kuyruklar arasında ise **öncelik** var — zamanlayıcı her zaman en yüksek öncelikli **boş olmayan** '
               + 'kuyruktan seçer (`pick_next`). Önce ' + d.arrivals.length + ' sürecin hepsi kuyruklarına girecek (kabul), sonra hepsi sırayla CPU\'ya verilecek.',
               'An operating system keeps processes in **three separate queues** by class: `0` = system, `1` = interactive, `2` = batch. '
               + 'Each queue is FIFO inside; between queues there is a **priority** order — the scheduler always picks from the highest-priority '
               + '**non-empty** queue (`pick_next`). First all ' + d.arrivals.length + ' processes join their queues (admission), then they are all handed to the CPU in turn.'),
             { c: [1, 7], java: [1, 7] });

      var lanes = [[], [], []];
      d.arrivals.forEach(function (p, k) {
        S.at(k);
        var lvl = p.level, bid = 'p' + p.name, idx = lanes[lvl].length;
        S.box(bid, { x: laneX(idx), y: LY[lvl] + (LH - BH) / 2, w: BW, h: BH, text: p.name, style: 'new', size: 16 });
        lanes[lvl].push(bid);
        var mechTr = k < 3 ? 'Her süreç `admit` ile kendi sınıfının kuyruğunun sonuna eklenir. ' : '';
        var mechEn = k < 3 ? 'Every process is admitted (`admit`) onto the back of its own class\'s queue. ' : '';
        S.step(T(mechTr + '`' + p.name + '` geldi, sınıf ' + lvl + ' (' + AD[lvl].tr + '): kuyruğun sonuna eklendi.',
                 mechEn + '`' + p.name + '` arrives, class ' + lvl + ' (' + AD[lvl].en + '): joins the back of the queue.'),
               { c: [3, 4], java: [3, 4] });
        S.set(bid, { style: 'normal' });
      });

      S.at(null);
      var nonEmpty = [0, 1, 2].filter(function (l) { return counts[l] > 0; });
      var empty = [0, 1, 2].filter(function (l) { return counts[l] === 0; });
      var noteTr = '', noteEn = '';
      if (nonEmpty.length === 1) {
        noteTr = ' Bu örnekte süreçlerin **hepsi aynı seviyede** (' + nonEmpty[0] + '); öbür iki kuyruk hiç dolmayacak, zamanlayıcı düz bir FIFO gibi davranacak — öncelik etkisi görünmeyecek.';
        noteEn = ' In this example every process is at **the same level** (' + nonEmpty[0] + '); the other two queues never fill, so the scheduler will behave like plain FIFO — no priority effect will be visible.';
      } else if (empty.length === 1) {
        noteTr = ' `' + empty[0] + '`. seviye (' + AD[empty[0]].tr + ') hiçbir süreç almadı; zamanlayıcı özel bir kontrol yazılmadan o kuyruğu her turda anında atlayacak.';
        noteEn = ' Level `' + empty[0] + '` (' + AD[empty[0]].en + ') never receives a single process; without any special-casing, the scheduler will skip that queue instantly every round.';
      }
      S.step(T('Kabul bitti: sistem ' + counts[0] + ', etkileşimli ' + counts[1] + ', toplu iş ' + counts[2] + ' süreç kuyruklarında.' + noteTr,
               'Admission is done: system ' + counts[0] + ', interactive ' + counts[1] + ', batch ' + counts[2] + ' processes are queued.' + noteEn),
             { c: [7, 8, 9, 10], java: [7, 8, 9, 10] });

      var order = [], pick = 0, firstArrivalIndex = {};
      d.arrivals.forEach(function (a, i) { firstArrivalIndex[a.name] = i; });
      while (lanes[0].length || lanes[1].length || lanes[2].length) {
        var lvl2 = lanes[0].length ? 0 : (lanes[1].length ? 1 : 2);
        var bid2 = lanes[lvl2].shift();
        var name = bid2.slice(1);
        pick++;
        S.move(bid2, CPUX + (CPUW - BW) / 2, CPUY + (CPUH - BH) / 2);
        S.set(bid2, { style: 'hl' });
        lanes[lvl2].forEach(function (id2, idx2) { S.move(id2, laneX(idx2), null); });
        order.push(name);
        S.set('orderv', { text: T('şimdiye kadar: ' + order.length + '/' + d.arrivals.length + ' · son: ' + name,
                                   'so far: ' + order.length + '/' + d.arrivals.length + ' · last: ' + name) });
        addOrder(name, lvl2);
        var mechTr2 = pick <= 2 ? 'Zamanlayıcı her seferinde 0\'dan başlar, ilk boş olmayan kuyruğu bulur (`pick_next`). ' : '';
        var mechEn2 = pick <= 2 ? 'The scheduler always starts at level 0 and returns the first non-empty queue it finds (`pick_next`). ' : '';
        var reasonTr = lvl2 === 0 ? '' : (lvl2 === 1 ? '`0`. seviye (sistem) şu an boş olduğu için, ' : '`0`. ve `1`. seviyeler şu an boş olduğu için, ');
        var reasonEn = lvl2 === 0 ? '' : (lvl2 === 1 ? 'because level `0` (system) is empty right now, ' : 'because levels `0` and `1` are both empty right now, ');
        S.step(T(mechTr2 + '`' + name + '` seçildi: ' + reasonTr + AD[lvl2].tr + ' kuyruğunun önündeydi, CPU\'ya verilir. Sıra: ' + order.join(', ') + '.',
                 mechEn2 + '`' + name + '` is picked: ' + reasonEn + 'it was at the front of the ' + AD[lvl2].en + ' queue and gets the CPU. Order so far: ' + order.join(', ') + '.'),
               { c: [7, 8, 9, 10], java: [7, 8, 9, 10] });
        S.remove(bid2);
      }

      S.result = { order: order };
      var batchNames = d.arrivals.filter(function (a) { return a.level === 2; }).map(function (a) { return a.name; });
      var starveTr = '', starveEn = '';
      if (batchNames.length === 1 && firstArrivalIndex[batchNames[0]] <= 2) {
        var pos = order.indexOf(batchNames[0]) + 1;
        if (order.length - pos <= 2) {
          starveTr = ' Açlık riski: `' + batchNames[0] + '` süreçler arasında ' + (firstArrivalIndex[batchNames[0]] + 1) + '. sırada geldi ama '
                   + pos + '. (sondan ' + (order.length - pos + 1) + '.) sırada çalıştı — üst seviyeler dolu kaldıkça toplu iş bu kadar geç kalır; '
                   + 'gerçek sistemde sürekli yeni gelişler olsaydı hiç çalışmayabilirdi. Gerçek dünyadaki çözüm: bekleyenleri zamanla üst kuyruğa taşımak (**aging**).';
          starveEn = ' Starvation risk: `' + batchNames[0] + '` arrived ' + (firstArrivalIndex[batchNames[0]] + 1) + 'th among all processes but ran '
                   + pos + 'th (' + (order.length - pos + 1) + ' from the end) — as long as the upper levels stay busy, batch work waits this long; '
                   + 'in a real system with continuous arrivals it might never run at all. The real-world fix: move waiting processes up over time (**aging**).';
        }
      }
      S.step(T('Bitti: ' + d.arrivals.length + ' süreç, servis sırası — ' + order.join(', ') + '.' + starveTr,
               'Done: ' + d.arrivals.length + ' processes, service order — ' + order.join(', ') + '.' + starveEn));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
