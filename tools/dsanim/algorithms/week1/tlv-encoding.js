/* Week 1 — TLV (Tag-Length-Value) encoding: a record of >= 10 fields (ints, short strings, booleans),
 * each turned into Tag/Length/Value bytes, then the whole content wrapped once more as a SEQUENCE.
 * Edge cases: an empty string (Length = 0) and a value whose length needs the long form (2 extra bytes).
 * Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var TAG = { bool: 0x01, int: 0x02, str: 0x0C };
  var SEQ = 0x30;
  var C = [
    '#define TAG_BOOLEAN    0x01',
    '#define TAG_INTEGER    0x02',
    '#define TAG_UTF8STRING 0x0C',
    '#define TAG_SEQUENCE   0x30   /* universal class, constructed, tag number 16 */',
    '',
    'static int encode_length(unsigned char *out, int len) {',
    '    if (len < 128) { out[0] = (unsigned char) len; return 1; }      /* short form: one byte */',
    '    int n = 0; unsigned char tmp[4];',
    '    while (len > 0) { tmp[n++] = (unsigned char) (len & 0xFF); len >>= 8; }',
    '    out[0] = (unsigned char) (0x80 | n);                            /* long form: 0x80 | count */',
    '    for (int i = 0; i < n; i++) out[1 + i] = tmp[n - 1 - i];',
    '    return 1 + n;',
    '}',
    '',
    'static int encode_tlv(unsigned char *out, unsigned char tag, const unsigned char *value, int len) {',
    '    out[0] = tag;',
    '    int lb = encode_length(out + 1, len);',
    '    memcpy(out + 1 + lb, value, (size_t) len);',
    '    return 1 + lb + len;',
    '}',
    '',
    '/* one encode_tlv() call per field; the whole content is then wrapped once more with',
    '   TAG_SEQUENCE -- ITS length may need the long form too, exactly like any field\'s. */'
  ];
  var JAVA = [
    'static final int TAG_BOOLEAN = 0x01, TAG_INTEGER = 0x02, TAG_UTF8STRING = 0x0C, TAG_SEQUENCE = 0x30;',
    '',
    'static byte[] encodeLength(int len) {',
    '    if (len < 128) return new byte[] { (byte) len };                // short form: one byte',
    '    ByteArrayOutputStream tmp = new ByteArrayOutputStream();',
    '    int n = len;',
    '    while (n > 0) { tmp.write(n & 0xFF); n >>>= 8; }',
    '    byte[] be = tmp.toByteArray();                                   // reverse into big-endian',
    '    byte[] out = new byte[1 + be.length];',
    '    out[0] = (byte) (0x80 | be.length);                               // long form: 0x80 | count',
    '    for (int i = 0; i < be.length; i++) out[1 + i] = be[be.length - 1 - i];',
    '    return out;',
    '}',
    '',
    'static byte[] encodeTlv(int tag, byte[] value) {',
    '    byte[] len = encodeLength(value.length);',
    '    ByteArrayOutputStream out = new ByteArrayOutputStream();',
    '    out.write(tag);',
    '    out.writeBytes(len);',
    '    out.writeBytes(value);',
    '    return out.toByteArray();',
    '}',
    '',
    '// one encodeTlv() call per field; the whole content is then wrapped once more with',
    '// TAG_SEQUENCE -- its length may need the long form too, exactly like any field\'s'
  ];

  function hx(b) { var s = (b & 0xFF).toString(16).toUpperCase(); return s.length < 2 ? '0' + s : s; }
  function fieldTok(f) { return f.type + ':' + f.name + ':' + (f.type === 'bool' ? String(f.value) : f.value); }
  function lenBytes(len) {
    if (len < 128) return [len];
    var tmp = [], n = len;
    while (n > 0) { tmp.unshift(n & 0xFF); n = Math.floor(n / 256); }
    return [0x80 | tmp.length].concat(tmp);
  }
  function valBytes(f) {
    if (f.type === 'bool') return [f.value ? 1 : 0];
    if (f.type === 'int') {
      if (f.value === 0) return [0];
      var out = [], v = f.value;
      while (v > 0) { out.unshift(v & 0xFF); v = Math.floor(v / 256); }
      return out;
    }
    var out2 = [];
    for (var i = 0; i < f.value.length; i++) out2.push(f.value.charCodeAt(i) & 0xFF);
    return out2;
  }

  D.define({
    id: 'tlv-encoding',
    title: T('TLV kodlama: her alan Etiket-Uzunluk-Değer olur', 'TLV encoding: every field becomes Tag-Length-Value'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 alan: tamsayı, kısa metin, mantıksal (boolean)', '10 fields: integers, short strings, booleans'),
        data: { fields: [ {name:'id',type:'int',value:42}, {name:'name',type:'str',value:'Rex'}, {name:'active',type:'bool',value:true},
                           {name:'age',type:'int',value:5}, {name:'nickname',type:'str',value:'R'}, {name:'verified',type:'bool',value:false},
                           {name:'score',type:'int',value:87}, {name:'city',type:'str',value:'Rize'}, {name:'flag',type:'bool',value:true},
                           {name:'level',type:'int',value:3} ] } },
      { id: 'hard', level: 'hard', name: T('14 alan: büyük tamsayılar, daha uzun metinler', '14 fields: larger integers, longer strings'),
        data: { fields: [ {name:'id',type:'int',value:1000}, {name:'name',type:'str',value:'RexTheSecond'}, {name:'active',type:'bool',value:true},
                           {name:'age',type:'int',value:300}, {name:'nickname',type:'str',value:'RS'}, {name:'verified',type:'bool',value:false},
                           {name:'score',type:'int',value:65000}, {name:'city',type:'str',value:'RecepTayyipErdogan'}, {name:'flag',type:'bool',value:true},
                           {name:'level',type:'int',value:255}, {name:'code',type:'int',value:256}, {name:'note',type:'str',value:'edgeofonebyte'},
                           {name:'ok',type:'bool',value:true}, {name:'rank',type:'int',value:1} ] } },
      { id: 'empty-string', level: 'edge', name: T('Boş bir metin alanı: Uzunluk = 0', 'An empty string field: Length = 0'),
        data: { fields: [ {name:'id',type:'int',value:7}, {name:'name',type:'str',value:''}, {name:'active',type:'bool',value:false},
                           {name:'age',type:'int',value:0}, {name:'nickname',type:'str',value:'X'}, {name:'verified',type:'bool',value:true},
                           {name:'score',type:'int',value:9}, {name:'city',type:'str',value:'A'}, {name:'flag',type:'bool',value:false},
                           {name:'level',type:'int',value:2} ] } },
      { id: 'long-value', level: 'edge', name: T('300 karakterlik bir metin: uzunluk 2 baytlık uzun biçim ister', 'A 300-character string: its length needs the 2-byte long form'),
        data: { fields: [ {name:'id',type:'int',value:1}, {name:'blob',type:'str',value: new Array(301).join('x')}, {name:'active',type:'bool',value:true},
                           {name:'age',type:'int',value:2}, {name:'nickname',type:'str',value:'Y'}, {name:'verified',type:'bool',value:false},
                           {name:'score',type:'int',value:3}, {name:'city',type:'str',value:'Z'}, {name:'flag',type:'bool',value:true},
                           {name:'level',type:'int',value:4} ] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.fields.length; },
    /** Independent encoder: builds the full byte list from scratch (short/long-form lengths,
     * per-type value bytes, then one more Tag-Length-Value wrap for the SEQUENCE). */
    reference: function (d) {
      // independent of lenBytes()/valBytes(): numbers are split into bytes through their hex string
      function hexBytes(n) {
        var h = n.toString(16); if (h.length % 2) h = '0' + h;
        var b = []; for (var k = 0; k < h.length; k += 2) b.push(parseInt(h.substr(k, 2), 16));
        return b;
      }
      function lengthField(n) { if (n <= 127) return [n]; var b = hexBytes(n); return [128 + b.length].concat(b); }
      var content = [];
      d.fields.forEach(function (f) {
        var vb;
        if (f.type === 'bool') vb = [f.value ? 1 : 0];
        else if (f.type === 'int') vb = hexBytes(f.value);
        else vb = f.value.split('').map(function (ch) { return ch.charCodeAt(0) % 256; });
        content = content.concat([TAG[f.type]], lengthField(vb.length), vb);
      });
      var outerLen = lengthField(content.length);
      var bytes = [SEQ].concat(outerLen, content);
      return { bytes: bytes, totalBytes: bytes.length };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 11, hard: 14, extreme: 16 }[level];
      var types = ['int', 'str', 'bool'], fields = [], i;
      for (i = 0; i < n; i++) {
        var type = types[D.randInt(r, 0, 2)];
        var value;
        if (type === 'bool') value = r() < 0.5;
        else if (type === 'int') value = D.randInt(r, 0, level === 'extreme' ? 70000 : (level === 'hard' ? 2000 : 200));
        else {
          var isLong = level === 'extreme' && r() < 0.15, len = isLong ? D.randInt(r, 200, 320) : D.randInt(r, 0, level === 'hard' ? 12 : 6);
          var s = '', pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', j;
          for (j = 0; j < len; j++) s += pool[D.randInt(r, 0, pool.length - 1)];
          value = s;
        }
        fields.push({ name: 'f' + i, type: type, value: value });
      }
      return { fields: fields };
    },
    input: {
      hint: T('Örnek: int:id:42 str:name:Rex bool:active:true  (metinler yalnız harf/rakam/altçizgi, boş bırakılabilir: str:name:)',
              'Example: int:id:42 str:name:Rex bool:active:true  (strings are letters/digits/underscore only, may be empty: str:name:)'),
      parse: function (text) {
        var fields = [], m;
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if ((m = /^int:([A-Za-z0-9_]+):(-?\d+)$/.exec(tok))) { fields.push({ name: m[1], type: 'int', value: parseInt(m[2], 10) }); return; }
          if ((m = /^bool:([A-Za-z0-9_]+):(true|false)$/i.exec(tok))) { fields.push({ name: m[1], type: 'bool', value: /^true$/i.test(m[2]) }); return; }
          if ((m = /^str:([A-Za-z0-9_]+):([A-Za-z0-9_]*)$/.exec(tok))) { fields.push({ name: m[1], type: 'str', value: m[2] }); return; }
          throw T('"' + tok + '" anlaşılmadı: int:ad:sayı, str:ad:metin ya da bool:ad:true/false yazın.',
                  '"' + tok + '" is not understood: write int:name:number, str:name:text, or bool:name:true/false.');
        });
        if (fields.length < 1) throw T('En az bir alan yazın.', 'Write at least one field.');
        if (fields.length > 25) throw T('En çok 25 alan.', 'At most 25 fields.');
        return { fields: fields };
      },
      format: function (d) { return d.fields.map(fieldTok).join(' '); },
      bad: ['', 'foo:bar:baz', 'int:id:abc', 'bool:flag:maybe', 'str:name:has space'],
      tokens: function (d) { return d.fields.map(fieldTok); }
    },
    build: function (S, d) {
      var CAP = 8, X0 = 260, Y0 = 60, ROWH = 78, BW = 30, BH = 34, GAP = 4;
      function drawBytes(rowId, y, xStart, bytes, groupStyle) {
        var x = xStart, shown = bytes, lastId = null;
        if (bytes.length > CAP) shown = bytes.slice(0, CAP - 1);
        shown.forEach(function (b, i) {
          S.box(rowId + '_v' + i, { x: x, y: y, w: BW, h: BH, text: hx(b), style: groupStyle, size: 13 });
          lastId = rowId + '_v' + i;
          x += BW + GAP;
        });
        if (bytes.length > CAP) {
          S.box(rowId + '_more', { x: x, y: y, w: BW + 20, h: BH, text: '+' + (bytes.length - shown.length), style: 'empty', size: 12 });
          lastId = rowId + '_more';
          x += BW + 20 + GAP;
        }
        return { x: x, lastId: lastId };
      }
      S.label('title', { x: 20, y: 30, text: T(d.fields.length + ' alanlık bir kaydı bayt dizisi olarak göndermek istiyoruz.', 'We want to send a ' + d.fields.length + '-field record as a byte sequence.'), size: 16, bold: true, anchor: 'start' });
      S.label('rowlbl', { x: X0 - 14, y: Y0 + 30 + BH / 2 + 5, text: 'bytes =', anchor: 'end', size: 14, bold: true, mono: true });
      S.step(T('TLV fikri basit: her alana bir **Etiket** (Tag, 1 bayt), bir **Uzunluk** (Length) ve bir **Değer** (Value) veririz.',
               'The TLV idea is simple: give every field a **Tag** (1 byte), a **Length**, and a **Value**.'),
             { c: [1, 2, 3, 4], java: [1] });

      var content = [], first = true;
      d.fields.forEach(function (f, i) {
        var y = Y0 + 30 + i * ROWH, rid = 'r' + i;
        S.at(i);
        S.label(rid + '_lbl', { x: 20, y: y + BH / 2 + 5, text: f.name + ' (' + f.type + ')', size: 13, anchor: 'start', mono: true });
        var tag = TAG[f.type], vb = valBytes(f), lb = lenBytes(vb.length);
        content = content.concat([tag], lb, vb);
        var x = X0;
        S.box(rid + '_t', { x: x, y: y, w: BW, h: BH, text: hx(tag), style: 'new', size: 13 }); x += BW + GAP;
        var lastLenId = null;
        lb.forEach(function (b, k) { S.box(rid + '_l' + k, { x: x, y: y, w: BW, h: BH, text: hx(b), style: 'active', size: 13 }); lastLenId = rid + '_l' + k; x += BW + GAP; });
        var vbRes = drawBytes(rid, y, x, vb, 'normal');
        S.brace(rid + '_grp', { from: rid + '_t', to: vbRes.lastId || lastLenId, text: f.name, side: 'bottom', dist: 6, style: 'dim' });
        var longForm = lb.length > 1;
        if (longForm) S.label(rid + '_note', { x: vbRes.x + 10, y: y + BH / 2 + 5, text: T('uzun!', 'long!'), size: 12, bold: true, anchor: 'start', style: 'active' });
        var valDesc = vb.length === 0 ? T('değer yok (boş)', 'no value bytes (empty)') : T(vb.length + ' değer baytı', vb.length + ' value byte' + (vb.length > 1 ? 's' : ''));
        if (first) {
          S.step(T('`' + f.name + '` (' + f.type + ') — Tag = `0x' + hx(tag) + '`. Uzunluk ' + (longForm ? ('UZUN biçim: `0x' + hx(lb[0]) + '` + ' + (lb.length - 1) + ' bayt') : ('KISA biçim: `0x' + hx(lb[0]) + '`')) + '. Sonra ' + valDesc.tr + '.',
                   '`' + f.name + '` (' + f.type + ') — Tag = `0x' + hx(tag) + '`. Length is the ' + (longForm ? ('LONG form: `0x' + hx(lb[0]) + '` + ' + (lb.length - 1) + ' byte' + (lb.length > 2 ? 's' : '')) : ('SHORT form: `0x' + hx(lb[0]) + '`')) + '. Then ' + valDesc.en + '.'),
                 { c: longForm ? [9, 10, 11] : [7], java: longForm ? [10, 11] : [4] });
          first = false;
        } else {
          S.step(T('`' + f.name + '` (' + f.type + ') — `0x' + hx(tag) + '`, uzunluk ' + (longForm ? 'uzun biçim' : ('`0x' + hx(lb[0]) + '`')) + ', ' + valDesc.tr + '.',
                   '`' + f.name + '` (' + f.type + ') — `0x' + hx(tag) + '`, length ' + (longForm ? 'in long form' : ('`0x' + hx(lb[0]) + '`')) + ', ' + valDesc.en + '.'),
                 { c: [15, 16, 17, 18], java: [15, 18, 19, 20] });
        }
      });

      var outerLen = lenBytes(content.length);
      var bytes = [SEQ].concat(outerLen, content);
      var y2 = Y0 + 30 + d.fields.length * ROWH + 20;
      S.at(null);
      S.label('seq_lbl', { x: 20, y: y2 + BH / 2 + 5, text: 'SEQUENCE', size: 13, anchor: 'start', mono: true, style: 'hl' });
      var xs = X0, lastOuterId = 'seq_t';
      S.box('seq_t', { x: xs, y: y2, w: BW, h: BH, text: hx(SEQ), style: 'hl', size: 13 }); xs += BW + GAP;
      outerLen.forEach(function (b, k) { S.box('seq_l' + k, { x: xs, y: y2, w: BW, h: BH, text: hx(b), style: 'hl', size: 13 }); lastOuterId = 'seq_l' + k; xs += BW + GAP; });
      S.brace('seq_grp', { from: 'seq_t', to: lastOuterId, text: 'SEQUENCE', side: 'bottom', dist: 6, style: 'hl' });
      S.label('seq_note', { x: xs + 10, y: y2 + BH / 2 + 5, text: T('+ yukarıdaki ' + content.length + ' bayt (V)', '+ the ' + content.length + ' bytes above (V)'), size: 13, anchor: 'start' });
      var seqLongForm = outerLen.length > 1;
      if (seqLongForm) S.label('seq_dec', { x: xs + 10, y: y2 + BH / 2 + 24, text: T('uzun!', 'long!'), size: 12, bold: true, anchor: 'start', style: 'hl' });
      S.step(T('Şimdi ' + d.fields.length + ' alanın hepsini bir **SEQUENCE** içine sarıyoruz: Tag = `0x' + hx(SEQ) + '`, uzunluk = içeriğin toplamı = ' + content.length + ' bayt' +
               (seqLongForm ? (' — 127\'yi aştığı için uzunluk da UZUN biçimde: `0x' + hx(outerLen[0]) + '` + ' + (outerLen.length - 1) + ' bayt.') : ('.')),
               'Now we wrap all ' + d.fields.length + ' fields in one **SEQUENCE**: Tag = `0x' + hx(SEQ) + '`, length = the total content = ' + content.length + ' bytes' +
               (seqLongForm ? (' — since that is over 127, the length is ALSO in the LONG form: `0x' + hx(outerLen[0]) + '` + ' + (outerLen.length - 1) + ' byte' + (outerLen.length > 2 ? 's' : '') + '.') : ('.'))),
             { c: [22, 23], java: [24, 25] });

      S.result = { bytes: bytes, totalBytes: bytes.length };
      S.step(T('Bitti: toplam ' + bytes.length + ' bayt, tele gönderilmeye hazır. ' + d.fields.filter(function (f) { return f.type === 'str' && f.value === ''; }).length + ' boş metin alanı, ' +
               (seqLongForm ? '1' : '0') + ' uzun biçim uzunluk (SEQUENCE\'in kendisi).',
               'Done: ' + bytes.length + ' bytes total, ready to send over the wire. ' + d.fields.filter(function (f) { return f.type === 'str' && f.value === ''; }).length + ' empty string field(s), ' +
               (seqLongForm ? '1' : '0') + ' long-form length (the SEQUENCE itself).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
