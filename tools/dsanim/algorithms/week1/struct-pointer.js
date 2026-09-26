/* Week 1 — a pointer walking an array of structs: p->field / (*p).field, p++, and updates.
 * p is allowed to reach ONE PAST the last element (a legal address to hold), but dereferencing
 * it there is undefined behavior (UB) — flagged, never executed.
 * Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'typedef struct Student { int id; int grade; } Student;',
    'Student students[N] = { ... };',
    'Student *p = students;              /* array decays to a pointer to its first element */',
    '',
    'for (; p != students + N; p++) {    /* walk until p is ONE PAST the last element */',
    '    int id = (*p).id;               /* parentheses force *p first, then .id */',
    '    int grade = p->grade;           /* p->field is shorthand for (*p).field */',
    '    if (should_update(p))',
    '        p->grade = new_grade;       /* write through p updates the array itself */',
    '}',
    '/* now p == students + N: legal to HOLD, but *p here would be undefined behavior (UB) */'
  ];
  var JAVA = [
    'class Student { int id; int grade; }',
    'Student[] students = new Student[N];',
    '',
    'for (int i = 0; i < students.length; i++) {',
    '    Student s = students[i];',
    '    int id = s.id;',
    '    int grade = s.grade;',
    '    if (shouldUpdate(i))',
    '        s.grade = newGrade;',
    '}',
    '// Java has no pointer arithmetic or "one past the end": students[students.length]',
    '// simply throws ArrayIndexOutOfBoundsException instead of silently reading garbage'
  ];

  function upMap(updates) { var m = {}; updates.forEach(function (u) { m[u.idx] = u.grade; }); return m; }

  D.define({
    id: 'struct-pointer',
    title: T('Diziyi gezen bir işaretçi: p->alan, (*p).alan, p++', 'A pointer walking an array: p->field, (*p).field, p++'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 öğrenci, 2 not güncellemesi', '10 students, 2 grade updates'),
        data: { students: [ {id: 101, grade: 62}, {id: 102, grade: 78}, {id: 103, grade: 55}, {id: 104, grade: 91},
                             {id: 105, grade: 40}, {id: 106, grade: 83}, {id: 107, grade: 67}, {id: 108, grade: 72},
                             {id: 109, grade: 88}, {id: 110, grade: 59} ],
                updates: [ {idx: 2, grade: 95}, {idx: 7, grade: 40} ] } },
      { id: 'hard', level: 'hard', name: T('14 öğrenci, 4 güncelleme, uç notlar', '14 students, 4 updates, extreme grades'),
        data: { students: [ {id: 201, grade: 0}, {id: 204, grade: 100}, {id: 207, grade: 45}, {id: 210, grade: 76},
                             {id: 213, grade: 12}, {id: 216, grade: 99}, {id: 219, grade: 63}, {id: 222, grade: 50},
                             {id: 225, grade: 87}, {id: 228, grade: 34}, {id: 231, grade: 71}, {id: 234, grade: 5},
                             {id: 237, grade: 82}, {id: 240, grade: 60} ],
                updates: [ {idx: 0, grade: 55}, {idx: 5, grade: 100}, {idx: 9, grade: 0}, {idx: 13, grade: 77} ] } },
      { id: 'all-updated', level: 'edge', name: T('Gezinti sırasında HER kayıt güncellenir', 'EVERY record is updated during the walk'),
        data: { students: [ {id: 300, grade: 10}, {id: 301, grade: 20}, {id: 302, grade: 30}, {id: 303, grade: 40},
                             {id: 304, grade: 50}, {id: 305, grade: 60}, {id: 306, grade: 70}, {id: 307, grade: 80},
                             {id: 308, grade: 90}, {id: 309, grade: 100} ],
                updates: [ {idx: 0, grade: 11}, {idx: 1, grade: 21}, {idx: 2, grade: 31}, {idx: 3, grade: 41},
                           {idx: 4, grade: 51}, {idx: 5, grade: 61}, {idx: 6, grade: 71}, {idx: 7, grade: 81},
                           {idx: 8, grade: 91}, {idx: 9, grade: 99} ] } },
      { id: 'single-student', level: 'edge', small: true, name: T('Tek öğrenci: p hemen dizinin sonuna geçer', 'A single student: p reaches one past the end immediately'),
        data: { students: [ {id: 900, grade: 71} ], updates: [ {idx: 0, grade: 100} ] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    minSize: 1,
    size: function (d) { return d.students.length; },
    /** Independent plain simulation: one pass idx = 0..n-1 records id/grade as read, applies any
     * update AFTER the read (matching the printf-then-write order in the code); the walk always
     * ends by reaching (and refusing to dereference) one past the last element. */
    reference: function (d) {
      var students = d.students.map(function (s) { return { id: s.id, grade: s.grade }; });
      var upd = {}, reads = [], i;
      for (i = 0; i < d.updates.length; i++) upd[d.updates[i].idx] = d.updates[i].grade;
      for (i = 0; i < students.length; i++) {
        reads.push({ idx: i, id: students[i].id, grade: students[i].grade });
        if (upd.hasOwnProperty(i)) students[i].grade = upd[i];
      }
      return { students: students, reads: reads, oob: true };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 11, hard: 14, extreme: 18 }[level];
      var gradeLo = level === 'extreme' ? -10 : 0, gradeHi = level === 'extreme' ? 110 : 100;
      var students = [], i, idBase = 100 + D.randInt(r, 0, 50);
      for (i = 0; i < n; i++) students.push({ id: idBase + i * D.randInt(r, 1, 4), grade: D.randInt(r, gradeLo, gradeHi) });
      var nUpd = { easy: 2, normal: 3, hard: 5, extreme: n }[level];
      var idxPool = [], updates = [];
      for (i = 0; i < n; i++) idxPool.push(i);
      for (i = 0; i < Math.min(nUpd, n); i++) {
        var pick = D.randInt(r, 0, idxPool.length - 1);
        updates.push({ idx: idxPool[pick], grade: D.randInt(r, gradeLo, gradeHi) });
        idxPool.splice(pick, 1);
      }
      updates.sort(function (a, b) { return a.idx - b.idx; });
      return { students: students, updates: updates };
    },
    input: {
      hint: T('Örnek: students: 101:62 102:78 103:55 104:91 105:40 106:83 107:67 108:72 109:88 110:59 updates: 2=95 7=40',
              'Example: students: 101:62 102:78 103:55 104:91 105:40 106:83 107:67 108:72 109:88 110:59 updates: 2=95 7=40'),
      parse: function (text) {
        var mode = 'students', students = [], updates = [], m;
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (/^students?:$/i.test(tok)) { mode = 'students'; return; }
          if (/^updates?:$/i.test(tok)) { mode = 'updates'; return; }
          if (mode === 'students') {
            if (!(m = /^(-?\d+):(-?\d+)$/.exec(tok))) throw T('"' + tok + '" bir "id:not" çifti değil.', '"' + tok + '" is not an "id:grade" pair.');
            students.push({ id: parseInt(m[1], 10), grade: parseInt(m[2], 10) });
            return;
          }
          if (!(m = /^(\d+)=(-?\d+)$/.exec(tok))) throw T('"' + tok + '" bir "indeks=not" çifti değil.', '"' + tok + '" is not an "index=grade" pair.');
          var idx = parseInt(m[1], 10);
          if (idx >= students.length) throw T('İndeks ' + idx + ' yok (yalnız ' + students.length + ' öğrenci var).', 'Index ' + idx + ' does not exist (only ' + students.length + ' students).');
          updates.push({ idx: idx, grade: parseInt(m[2], 10) });
        });
        if (!students.length) throw T('En az bir öğrenci yazın (id:not).', 'Write at least one student (id:grade).');
        if (students.length > 20) throw T('En çok 20 öğrenci.', 'At most 20 students.');
        if (updates.length > 20) throw T('En çok 20 güncelleme.', 'At most 20 updates.');
        return { students: students, updates: updates };
      },
      format: function (d) {
        return 'students: ' + d.students.map(function (s) { return s.id + ':' + s.grade; }).join(' ') +
               ' updates: ' + d.updates.map(function (u) { return u.idx + '=' + u.grade; }).join(' ');
      },
      bad: ['', 'students: 101-62', 'students: 101:62 102:78 updates: 9=95', 'students: 101:62 x:5', 'students: 101:62 102:78 updates: 1=abc'],
      /** The input strip shows the students in walk order — exactly the order p visits them. */
      tokens: function (d) { return d.students.map(function (s) { return s.id + ':' + s.grade; }); }
    },
    build: function (S, d) {
      var students = d.students.map(function (s) { return { id: s.id, grade: s.grade }; });
      var n = students.length, upd = upMap(d.updates);
      var W = 78, H = 48, GAP = 10, X0 = 44, Y0 = 110, ROW = 14;
      function pos(i) { var col = i % ROW, row = Math.floor(i / ROW); return { x: X0 + col * (W + GAP), y: Y0 + row * (H + 40) }; }
      S.label('rowlbl', { x: X0 - 16, y: Y0 + H / 2 + 5, text: 'students[] =', anchor: 'end', size: 15, bold: true });
      students.forEach(function (s, i) {
        var p = pos(i);
        S.box('s' + i, { x: p.x, y: p.y, w: W, h: H, text: s.id + ':' + s.grade, below: '[' + i + ']', size: 14 });
      });
      var ep = pos(n);
      S.box('end', { x: ep.x, y: ep.y, w: W, h: H, text: '', style: 'empty', below: T('dizi dışı (sondan bir sonrası)', 'past the end') });
      S.box('p', { x: 44, y: Y0 - 70, w: 60, h: 40, text: '&students[0]', above: 'p', style: 'hl', size: 12 });
      S.arrow('arrp', { from: 'p', to: 's0', kind: 'center' });
      var RX = X0 + Math.min(n + 1, ROW) * (W + GAP) + 30;
      S.label('decision', { x: RX, y: Y0 + H / 2 + 5, text: '', size: 16, bold: true, mono: true, anchor: 'start' });
      function decide(text, style) { S.set('decision', { text: text || '', style: style || 'normal' }); }
      S.step(T('`Student *p = students;` — p, öğrenci dizisinin ilk elemanına işaret ediyor. `N = ' + n + '` kayıt var.',
               '`Student *p = students;` — p points to the first element of the student array. There are `N = ' + n + '` records.'),
             { c: [1, 2, 3], java: [1, 2] });

      function clean() { for (var i = 0; i < n; i++) S.set('s' + i, { style: 'normal' }); S.set('end', { style: 'empty' }); S.set('p', { style: 'normal' }); }
      /** Braces: [0 .. i-1] already visited, [i+1 .. n-1] not yet (the current index i is shown by its own `hl` style). */
      function updateBraces(i) {
        if (i > 0) {
          if (!S.has('visitedb')) S.brace('visitedb', { from: 's0', to: 's' + (i - 1), text: T('ziyaret edildi', 'visited'), side: 'bottom', dist: 10, style: 'new' });
          else S.set('visitedb', { to: 's' + (i - 1) });
        } else if (S.has('visitedb')) S.remove('visitedb');
        if (i + 1 < n) {
          if (!S.has('restb')) S.brace('restb', { from: 's' + (i + 1), to: 's' + (n - 1), text: T('henüz değil', 'not yet'), side: 'bottom', dist: 10, style: 'dim' });
          else S.set('restb', { from: 's' + (i + 1) });
        } else if (S.has('restb')) S.remove('restb');
      }

      var reads = [];
      // idx 0: detailed — show BOTH (*p).id and p->grade explicitly, then the first p++
      clean();
      S.at(0); updateBraces(0); decide('', 'normal');
      S.set('s0', { style: 'hl' });
      reads.push({ idx: 0, id: students[0].id, grade: students[0].grade });
      S.step(T('`(*p).id` — önce p\'yi izle (parantezler bunu zorunlu kılar), sonra `.id` alanını al: ' + students[0].id + '.',
               '`(*p).id` — first follow p (the parentheses force this order), then take the `.id` field: ' + students[0].id + '.'),
             { c: [6], java: [6] });
      var g0 = students[0].grade, note0tr = '', note0en = '';
      if (upd.hasOwnProperty(0)) { students[0].grade = upd[0]; note0tr = ' Ardından `p->grade = ' + upd[0] + ';` ile kaydın kendisini güncelliyoruz.'; note0en = ' Then `p->grade = ' + upd[0] + ';` writes through p, updating the record itself.'; }
      S.set('s0', { text: students[0].id + ':' + students[0].grade, style: 'new' });
      S.step(T('`p->grade` — tam olarak aynı şey, sadece daha kısa yazım: ' + g0 + '. `->`, `(*p).`\'nin kestirmesidir.' + note0tr,
               '`p->grade` — exactly the same thing, just shorter to write: ' + g0 + '. `->` is shorthand for `(*p).`.' + note0en),
             { c: upd.hasOwnProperty(0) ? [7, 8, 9] : [7], java: upd.hasOwnProperty(0) ? [6, 7, 8, 9] : [6, 7] });
      S.set('arrp', { to: n > 1 ? 's1' : 'end' });
      S.set('p', { text: n > 1 ? ('&students[1]') : ('students + ' + n) });
      S.step(T('`p++` — p bir sonraki kaydın adresine ilerler: yeni adres, eskisinden tam `sizeof(Student)` sonra gelir.',
               '`p++` — p advances to the address of the next record: the new address sits exactly `sizeof(Student)` after the old one.'),
             { c: [5], java: [4] });

      for (var i = 1; i < n; i++) {
        clean();
        S.at(i); updateBraces(i); decide('', 'normal');
        S.set('s' + i, { style: 'hl' });
        var useArrow = i % 2 === 0;
        reads.push({ idx: i, id: students[i].id, grade: students[i].grade });
        var idExpr = useArrow ? 'p->id' : '(*p).id', gExpr = useArrow ? 'p->grade' : '(*p).grade';
        var upTxt = '', upTxtEn = '';
        if (upd.hasOwnProperty(i)) {
          students[i].grade = upd[i];
          upTxt = ' Sonra `p->grade = ' + upd[i] + ';` yazılır — kayıt güncellenir.';
          upTxtEn = ' Then `p->grade = ' + upd[i] + ';` is written — the record is updated.';
          S.set('s' + i, { text: students[i].id + ':' + students[i].grade, style: 'new' });
        }
        S.step(T('`' + idExpr + '` = ' + reads[i].id + ', `' + gExpr + '` = ' + reads[i].grade + '.' + upTxt + ' Sonra `p++`.',
                 '`' + idExpr + '` = ' + reads[i].id + ', `' + gExpr + '` = ' + reads[i].grade + '.' + upTxtEn + ' Then `p++`.'),
               { c: upd.hasOwnProperty(i) ? [6, 7, 8, 9] : [6, 7], java: upd.hasOwnProperty(i) ? [6, 7, 8, 9] : [6, 7] });
        if (i + 1 < n) { S.set('arrp', { to: 's' + (i + 1) }); S.set('p', { text: '&students[' + (i + 1) + ']' }); }
        else { S.set('arrp', { to: 'end' }); S.set('p', { text: 'students + ' + n }); }
      }

      clean();
      S.at(null); updateBraces(n);
      S.set('end', { style: 'hl' });
      S.set('p', { style: 'hl' });
      decide('p == students+' + n + ' -> stop', 'hl');
      S.step(T('Döngü koşulu `p != students + ' + n + '`, artık yanlış: `p` diziden HEMEN SONRAKİ adrese ulaştı. Bu adresi TUTMAK yasaldır (döngüyü bitirmek için kullanılır) — ama DEREFERANSLAMAK değil.',
               'The loop condition `p != students + ' + n + '` is now false: `p` reached the address right AFTER the array. HOLDING that address is legal (it is how the loop knows to stop) — DEREFERENCING it is not.'),
             { c: [5, 11], java: [4, 11, 12] });
      S.set('end', { style: 'del' });
      decide('*p -> UB!', 'del');
      S.step(T('`p->id` burada — yani dizinin dışında — **tanımsız davranış (UB)** olur. **Çalıştırılmaz**: hiçbir okuma yapılmaz.',
               '`p->id` here — i.e. outside the array — would be **undefined behavior (UB)**. **Not executed**: no read happens.'),
             { c: [11], java: [11, 12] });
      clean();
      decide('', 'normal');
      if (S.has('restb')) S.remove('restb');
      S.remove('arrp', 'p', 'end');
      S.result = { students: students, reads: reads, oob: true };
      S.step(T('Bitti: ' + n + ' kayıt gezildi, ' + d.updates.length + ' not güncellendi. Son kayıtlar: ' + students.map(function (s) { return s.id + ':' + s.grade; }).join(', ') + '.',
               'Done: ' + n + ' records walked, ' + d.updates.length + ' grade' + (d.updates.length === 1 ? '' : 's') + ' updated. Final records: ' + students.map(function (s) { return s.id + ':' + s.grade; }).join(', ') + '.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
