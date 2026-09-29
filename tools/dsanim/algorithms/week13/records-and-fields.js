/* Week 13 — records and fields: fixed-length vs. delimited vs. length-prefixed storage of a variable-length
   NAME field, with padding waste / truncation vs. exact-size storage, examples (normal, hard, edge), random data
   and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '#define NAME_FIXED 8',
    '',
    'typedef struct { int id; char name[NAME_FIXED]; int score; } FixedRecord;',
    '',
    'int write_fixed(FILE *fp, int id, const char *name, int score) {',
    '    FixedRecord r; r.id = id; r.score = score;',
    '    int n = (int) strlen(name);',
    '    if (n >= NAME_FIXED) {                 /* too long: truncate, data is lost */',
    '        memcpy(r.name, name, NAME_FIXED);',
    '    } else {',
    '        memcpy(r.name, name, n);',
    '        memset(r.name + n, \'_\', NAME_FIXED - n);   /* pad with filler bytes */',
    '    }',
    '    return fwrite(&r, sizeof(r), 1, fp) == 1 ? (int) sizeof(r) : -1;',
    '}',
    '',
    'int write_delim(FILE *fp, int id, const char *name, int score) {',
    '    (void) id; (void) score;   /* still fixed 4-byte fields; only name is variable here */',
    '    return fprintf(fp, "%s|", name) > 0 ? 4 + (int) strlen(name) + 1 + 4 : -1;',
    '}',
    '',
    'int write_lenpfx(FILE *fp, int id, const char *name, int score) {',
    '    (void) id; (void) score;',
    '    unsigned char len = (unsigned char) strlen(name);   /* 1-byte length prefix */',
    '    fwrite(&len, 1, 1, fp);',
    '    fwrite(name, 1, len, fp);',
    '    return 4 + 1 + (int) len + 4;',
    '}'
  ];
  var JAVA = [
    'static final int NAME_FIXED = 8;',
    '',
    'static int writeFixed(DataOutputStream out, int id, String name, int score) throws IOException {',
    '    out.writeInt(id);',
    '    byte[] raw = name.getBytes(StandardCharsets.US_ASCII);',
    '    int n = raw.length;',
    '    if (n >= NAME_FIXED) {                    // too long: truncate, data is lost',
    '        out.write(raw, 0, NAME_FIXED);',
    '    } else {',
    '        out.write(raw);',
    '        for (int i = n; i < NAME_FIXED; i++) out.write(\'_\');   // pad with filler bytes',
    '    }',
    '    out.writeInt(score);',
    '    return 4 + NAME_FIXED + 4;',
    '}',
    '',
    'static int writeDelim(DataOutputStream out, int id, String name, int score) throws IOException {',
    '    // id and score are still fixed 4-byte fields; only name is variable here',
    '    byte[] raw = name.getBytes(StandardCharsets.US_ASCII);',
    '    out.write(raw); out.writeByte(\'|\');',
    '    return 4 + raw.length + 1 + 4;',
    '}',
    '',
    'static int writeLenPrefixed(DataOutputStream out, int id, String name, int score) throws IOException {',
    '    // id and score are still fixed 4-byte fields; only the name is variable here',
    '    byte[] raw = name.getBytes(StandardCharsets.US_ASCII);',
    '    out.writeByte(raw.length);            // 1-byte length prefix',
    '    out.write(raw);',
    '    return 4 + 1 + raw.length + 4;',
    '}'
  ];
  var NAME_FIXED = 8;

  function rec(id, name, score) { return { id: id, name: name, score: score }; }

  D.define({
    id: 'records-and-fields',
    title: T('Kayıt ve alanlar: sabit uzunluk / sınırlayıcı / uzunluk öneki', 'Records and fields: fixed-length vs. delimiter vs. length-prefix'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('11 kayıt, kısa adlar (dolgu var, kırpma yok)', '11 records, short names (padding, no truncation)'),
        data: { records: [rec(101, 'ANN', 91), rec(102, 'BOB', 77), rec(103, 'CARL', 85), rec(104, 'DEE', 60),
          rec(105, 'ED', 99), rec(106, 'FAY', 72), rec(107, 'GUS', 88), rec(108, 'HAL', 65),
          rec(109, 'IVY', 93), rec(110, 'JOE', 58), rec(111, 'KIM', 80)] } },
      { id: 'hard', level: 'hard', name: T('13 kayıt, karışık uzunluk (kırpma ve tam sığma karışık)', '13 records, mixed lengths (truncation and exact fit mixed)'),
        data: { records: [rec(201, 'AL', 70), rec(202, 'BRENDA', 84), rec(203, 'CARLITOX', 66), rec(204, 'DOMINIQUE', 91),
          rec(205, 'ED', 55), rec(206, 'FRANCESCA', 62), rec(207, 'GIA', 89), rec(208, 'HECTOR', 73),
          rec(209, 'IRA', 95), rec(210, 'JULIETTE', 68), rec(211, 'KEN', 81), rec(212, 'LIONEL', 77),
          rec(213, 'MAX', 90)] } },
      { id: 'edge-empty-and-long', level: 'edge', name: T('Uç: boş ad ve çok uzun ad', 'Edge: empty name and a very long name'),
        data: { records: [rec(301, '', 40), rec(302, 'ALEXANDRIA', 71), rec(303, 'A', 50), rec(304, 'BO', 61),
          rec(305, 'CHRISTOPHERSON', 82), rec(306, '', 30), rec(307, 'D', 45), rec(308, 'EIGHTCHRS', 59),
          rec(309, 'F', 66), rec(310, 'GABRIELLA', 74), rec(311, 'H', 53)] } },
      { id: 'edge-all-truncated', level: 'edge', name: T('Uç: tüm adlar 8 karakterden uzun', 'Edge: every name longer than 8 characters'),
        data: { records: [rec(401, 'ABCDEFGHIJ', 10), rec(402, 'KLMNOPQRST', 20), rec(403, 'UVWXYZABCD', 30),
          rec(404, 'EFGHIJKLMN', 40), rec(405, 'OPQRSTUVWX', 50), rec(406, 'YZABCDEFGH', 60),
          rec(407, 'IJKLMNOPQR', 70), rec(408, 'STUVWXYZAB', 80), rec(409, 'CDEFGHIJKL', 90),
          rec(410, 'MNOPQRSTUV', 15)] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.records.length; },
    reference: function (d) {
      var fixedTotal = 0, delimTotal = 0, lenpfxTotal = 0, wastedFixed = 0, truncatedCount = 0;
      d.records.forEach(function (r) {
        var n = r.name.length;
        fixedTotal += 4 + NAME_FIXED + 4;
        if (n >= NAME_FIXED) truncatedCount++; else wastedFixed += NAME_FIXED - n;
        delimTotal += 4 + n + 1 + 4;
        lenpfxTotal += 4 + 1 + n + 4;
      });
      return { fixedTotal: fixedTotal, delimTotal: delimTotal, lenpfxTotal: lenpfxTotal, wastedFixed: wastedFixed, truncatedCount: truncatedCount };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 15, extreme: 18 }[level];
      var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', out = [];
      for (var i = 0; i < n; i++) {
        var len = level === 'extreme' ? D.randInt(r, 0, 14) : D.randInt(r, 1, level === 'easy' ? 6 : 10);
        var name = '';
        for (var k = 0; k < len; k++) name += letters[D.randInt(r, 0, 25)];
        out.push(rec(100 + i, name, D.randInt(r, 0, 100)));
      }
      return { records: out };
    },
    input: {
      hint: T('Örnek: 101:ANN:91 102:BOB:77   (id:ad:not, ad boş olabilir)', 'Example: 101:ANN:91 102:BOB:77   (id:name:score, name may be empty)'),
      parse: function (text) {
        var out = [];
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          var m = /^(-?\d+):([A-Za-z]*):(-?\d+)$/.exec(tok);
          if (!m) throw T('"' + tok + '" anlaşılmadı: id:ad:not yazın (ad yalnız harf).', '"' + tok + '" is not understood: write id:name:score (name letters only).');
          out.push(rec(parseInt(m[1], 10), m[2].toUpperCase(), parseInt(m[3], 10)));
        });
        if (!out.length) throw T('En az bir kayıt yazın.', 'Write at least one record.');
        if (out.length > 24) throw T('En çok 24 kayıt.', 'At most 24 records.');
        return { records: out };
      },
      format: function (d) { return d.records.map(function (r) { return r.id + ':' + r.name + ':' + r.score; }).join(' '); },
      bad: ['', '101ANN91', '101:AN1:91', 'abc:ANN:91'],
      tokens: function (d) { return d.records.map(function (r) { return r.id + ':' + r.name + ':' + r.score; }); }
    },
    build: function (S, d) {
      var X0 = 150, YF = 90, YD = 220, YL = 350, IDW = 60, SCW = 60, GAP = 14;
      var fixedTotal = 0, delimTotal = 0, lenpfxTotal = 0, wastedFixed = 0, truncatedCount = 0;
      S.label('lblF', { x: X0 - 16, y: YF + 27, text: T('sabit uzunluk =', 'fixed-length ='), anchor: 'end', size: 14, bold: true });
      S.label('lblD', { x: X0 - 16, y: YD + 27, text: T('sınırlayıcılı =', 'delimited ='), anchor: 'end', size: 14, bold: true });
      S.label('lblL', { x: X0 - 16, y: YL + 27, text: T('uzunluk önekli =', 'length-prefixed ='), anchor: 'end', size: 14, bold: true });
      S.label('totF', { x: X0 + 620, y: YF + 27, text: '', anchor: 'start', size: 15, bold: true, mono: true });
      S.label('totD', { x: X0 + 620, y: YD + 27, text: '', anchor: 'start', size: 15, bold: true, mono: true });
      S.label('totL', { x: X0 + 620, y: YL + 27, text: '', anchor: 'start', size: 15, bold: true, mono: true });
      S.label('note', { x: X0 - 16, y: YL + 90, text: '', anchor: 'start', size: 14, style: 'dim' });

      function clearRow(prefix) {
        ['id', 'sep1', 'name', 'sep2', 'score'].forEach(function (k) { if (S.has(prefix + k)) S.remove(prefix + k); });
      }
      function refreshTotals() {
        S.set('totF', { text: 'total = ' + fixedTotal + ' B  (wasted ' + wastedFixed + ' B)' });
        S.set('totD', { text: 'total = ' + delimTotal + ' B' });
        S.set('totL', { text: 'total = ' + lenpfxTotal + ' B' });
      }

      d.records.forEach(function (r, k) {
        S.at(k);
        var n = r.name.length, detailed = k < 2;
        var idText = String(r.id), scoreText = String(r.score);

        // ---- fixed-length row ----
        clearRow('f_');
        S.box('f_id', { x: X0, y: YF, w: IDW, h: 40, text: idText, style: 'normal' });
        var padded, trunc = n >= NAME_FIXED;
        if (trunc) { padded = r.name.slice(0, NAME_FIXED); truncatedCount++; }
        else { padded = r.name + new Array(NAME_FIXED - n + 1).join('_'); wastedFixed += NAME_FIXED - n; }
        S.box('f_name', { x: X0 + IDW + GAP, y: YF, w: 160, h: 40, text: padded || '(empty)', style: trunc ? 'del' : (n === 0 ? 'empty' : 'new'), below: NAME_FIXED + ' B slot' });
        S.box('f_score', { x: X0 + IDW + GAP + 174, y: YF, w: SCW, h: 40, text: scoreText, style: 'normal' });
        fixedTotal += 4 + NAME_FIXED + 4;

        // ---- delimited row ----
        clearRow('d_');
        S.box('d_id', { x: X0, y: YD, w: IDW, h: 40, text: idText, style: 'normal' });
        var nameW = Math.max(30, n * 15 + 16);
        S.box('d_name', { x: X0 + IDW + GAP, y: YD, w: nameW, h: 40, text: r.name || '(empty)', style: n === 0 ? 'empty' : 'active', below: n + ' B' });
        S.box('d_sep1', { x: X0 + IDW + GAP + nameW + 6, y: YD, w: 22, h: 40, text: '|', style: 'dim' });
        S.box('d_score', { x: X0 + IDW + GAP + nameW + 34, y: YD, w: SCW, h: 40, text: scoreText, style: 'normal' });
        delimTotal += 4 + n + 1 + 4;

        // ---- length-prefixed row ----
        clearRow('l_');
        S.box('l_id', { x: X0, y: YL, w: IDW, h: 40, text: idText, style: 'normal' });
        S.box('l_sep1', { x: X0 + IDW + GAP, y: YL, w: 30, h: 40, text: String(n), style: 'hl', below: T('uzunluk', 'length') });
        var nameW2 = Math.max(30, n * 15 + 16);
        S.box('l_name', { x: X0 + IDW + GAP + 36, y: YL, w: nameW2, h: 40, text: r.name || '(empty)', style: n === 0 ? 'empty' : 'active', below: n + ' B' });
        S.box('l_score', { x: X0 + IDW + GAP + 36 + nameW2 + 6, y: YL, w: SCW, h: 40, text: scoreText, style: 'normal' });
        lenpfxTotal += 4 + 1 + n + 4;

        refreshTotals();

        if (detailed) {
          S.step(T('Kayıt ' + k + ' — `id=' + r.id + '`, `name="' + r.name + '"` (' + n + ' bayt), `score=' + r.score + '`. Sabit uzunluk: `NAME_FIXED = ' + NAME_FIXED + '` bayt ayrılır.',
                   'Record ' + k + ' — `id=' + r.id + '`, `name="' + r.name + '"` (' + n + ' bytes), `score=' + r.score + '`. Fixed-length reserves `NAME_FIXED = ' + NAME_FIXED + '` bytes.'),
                 { c: [5, 6], java: [3, 4] });
          if (trunc) {
            S.step(T('Ad ' + NAME_FIXED + ' baytı geçiyor (' + n + ' bayt) → **kırpılır**: "' + padded + '" yazılır, kalan ' + (n - NAME_FIXED) + ' karakter **kaybolur**.',
                     'The name is longer than ' + NAME_FIXED + ' bytes (' + n + ') → **truncated**: "' + padded + '" is written, the remaining ' + (n - NAME_FIXED) + ' characters are **lost**.'),
                   { c: [7, { n: 8, note: T('n >= 8? evet', 'n >= 8? yes') }, 9, { n: 11, skip: true }, { n: 12, skip: true }],
                     java: [6, { n: 7, note: T('n >= 8? evet', 'n >= 8? yes') }, 8, { n: 10, skip: true }, { n: 11, skip: true }] });
          } else {
            S.step(T('Ad ' + NAME_FIXED + ' baytın altında (' + n + ' bayt) → kalan ' + (NAME_FIXED - n) + ' bayt `_` ile **doldurulur (padding)**; bu bayt boşa gider.',
                     'The name is shorter than ' + NAME_FIXED + ' bytes (' + n + ') → the remaining ' + (NAME_FIXED - n) + ' bytes are **padded** with `_`; that space is wasted.'),
                   { c: [7, { n: 8, note: T('n >= 8? hayır', 'n >= 8? no') }, { n: 9, skip: true }, 10, 11],
                     java: [6, { n: 7, note: T('n >= 8? hayır', 'n >= 8? no') }, { n: 8, skip: true }, 10,
                            { n: 11, note: T((NAME_FIXED - n) + ' bayt dolgu', (NAME_FIXED - n) + ' padding byte(s)') }] });
          }
          S.step(T('Sabit kayıt her zaman `4 + ' + NAME_FIXED + ' + 4 = ' + (8 + NAME_FIXED) + '` bayt: içerik ne olursa olsun **sabit boyut**, kayıt numarasından adres hesaplamayı kolaylaştırır (bir sonraki hafta konusu).',
                   'A fixed record is always `4 + ' + NAME_FIXED + ' + 4 = ' + (8 + NAME_FIXED) + '` bytes: **constant size** whatever the content, which makes computing an address from a record number easy (next week\'s topic).'),
                 { c: [13], java: [13, 14] });
          S.step(T('Sınırlayıcılı biçim: ad olduğu gibi yazılır, arkasına bir `|` **sınırlayıcı** konur → bu kayıt `4 + ' + n + ' + 1 + 4 = ' + (9 + n) + '` bayt. Dolgu yok, kırpma yok.',
                   'Delimited: the name is written as-is, followed by a `|` **delimiter** → this record is `4 + ' + n + ' + 1 + 4 = ' + (9 + n) + '` bytes. No padding, no truncation.'),
                 { c: [17, 18, { n: 19, note: T('yazıldı mı? evet', 'wrote > 0? yes') }], java: [17, 19, 20, 21] });
          S.step(T('Uzunluk önekli biçim: önce 1 baytlık bir **uzunluk** (' + n + ') yazılır, sonra tam ' + n + ' bayt ad → `4 + 1 + ' + n + ' + 4 = ' + (9 + n) + '` bayt. Aynı sonuç, farklı yöntem: okurken önce uzunluğu okuyup kaç bayt daha okunacağını biliriz.',
                   'Length-prefixed: first a 1-byte **length** (' + n + ') is written, then exactly ' + n + ' bytes of the name → `4 + 1 + ' + n + ' + 4 = ' + (9 + n) + '` bytes. Same result, a different method: reading back, the length tells us how many more bytes to read.'),
                 { c: [22, 23, 24, 25, 26, 27], java: [24, 26, 27, 28, 29] });
        } else {
          S.step(T('Kayıt ' + k + ' — `"' + (r.name || '(boş)') + '"` (' + n + ' bayt): sabit=' + (8 + NAME_FIXED) + ' B, sınırlayıcılı=' + (9 + n) + ' B, uzunluk önekli=' + (9 + n) + ' B.' + (trunc ? ' Kırpıldı!' : ''),
                   'Record ' + k + ' — `"' + (r.name || '(empty)') + '"` (' + n + ' bytes): fixed=' + (8 + NAME_FIXED) + ' B, delimited=' + (9 + n) + ' B, length-prefixed=' + (9 + n) + ' B.' + (trunc ? ' Truncated!' : '')),
                 trunc ? { c: [7, { n: 8, note: T('n >= 8? evet', 'n >= 8? yes') }, 9], java: [6, { n: 7, note: T('n >= 8? yes', 'n >= 8? yes') }, 8] }
                       : { c: [7, { n: 8, note: T('n >= 8? hayır', 'n >= 8? no') }, 10, 11],
                           java: [6, { n: 7, note: T('n >= 8? no', 'n >= 8? no') }, 10,
                                  { n: 11, note: T((NAME_FIXED - n) + ' bayt dolgu', (NAME_FIXED - n) + ' padding byte(s)') }] });
        }
      });

      S.at(null);
      S.set('note', { text: T(truncatedCount + ' kayıt kırpıldı, sabitte toplam ' + wastedFixed + ' bayt boşa gitti.',
                               truncatedCount + ' record(s) truncated; ' + wastedFixed + ' bytes wasted in the fixed format in total.') });
      S.result = { fixedTotal: fixedTotal, delimTotal: delimTotal, lenpfxTotal: lenpfxTotal, wastedFixed: wastedFixed, truncatedCount: truncatedCount };
      S.step(T('Bitti: ' + d.records.length + ' kayıt. Sabit = ' + fixedTotal + ' B (boşa giden ' + wastedFixed + ' B, ' + truncatedCount + ' kırpma), sınırlayıcılı = ' + delimTotal + ' B, uzunluk önekli = ' + lenpfxTotal + ' B. Sabit uzunluk daha basit okunur ama yer israf eder ya da veri kaybeder; ikisi de aynı toplam bilgiyi taşır.',
               'Done: ' + d.records.length + ' records. Fixed = ' + fixedTotal + ' B (' + wastedFixed + ' B wasted, ' + truncatedCount + ' truncation(s)), delimited = ' + delimTotal + ' B, length-prefixed = ' + lenpfxTotal + ' B. Fixed-length is simpler to read back but wastes space or loses data; the other two carry the same information exactly.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
