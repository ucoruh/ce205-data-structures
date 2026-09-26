/* Week 1 — PER-style encoding: >= 10 constrained-integer fields (name characters, a small age, flags, ...),
 * each packed into the MINIMUM number of bits its own [min, max] range needs — no tags, no length bytes.
 * Edge cases: a range of size 1 needs 0 bits; a value at the very top of its range still packs cleanly.
 * Compare the total bits used here against one byte per field's worth of TLV overhead.
 * Examples (normal, hard, edge cases), random data and own values. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    '/* Pack the low `width` bits of `value` into buf, starting at bit offset *bitpos (MSB first). */',
    'static void pack_bits(unsigned char *buf, int *bitpos, unsigned int value, int width) {',
    '    for (int i = width - 1; i >= 0; i--) {',
    '        int bit = (int) ((value >> i) & 1u);',
    '        int byte_index = *bitpos / 8;',
    '        int bit_index = 7 - (*bitpos % 8);',
    '        if (bit)',
    '            buf[byte_index] |= (unsigned char) (1u << bit_index);',
    '        (*bitpos)++;',
    '    }',
    '}',
    '',
    '/* width = 0 when max == min: there is only one possible value, so NO bits are sent at all --',
    '   the receiver already knows it from the schema. */',
    'int width = (max == min) ? 0 : (int) ceil(log2((double) (max - min + 1)));',
    'pack_bits(per, &bitpos, (unsigned) (value - min), width);'
  ];
  var JAVA = [
    '// Pack the low `width` bits of `value` into buf, starting at bit offset bitpos (MSB first).',
    'static int bitpos;',
    'static void packBits(byte[] buf, int value, int width) {',
    '    for (int i = width - 1; i >= 0; i--) {',
    '        int bit = (value >> i) & 1;',
    '        int byteIndex = bitpos / 8;',
    '        int bitIndex = 7 - (bitpos % 8);',
    '        if (bit != 0)',
    '            buf[byteIndex] |= (byte) (1 << bitIndex);',
    '        bitpos++;',
    '    }',
    '}',
    '',
    '// width = 0 when max == min: only one possible value, so NO bits are sent -- the receiver',
    '// already knows it from the schema.',
    'int width = (max == min) ? 0 : (int) Math.ceil(Math.log(max - min + 1) / Math.log(2));',
    'packBits(per, value - min, width);'
  ];

  function width(f) { return f.max === f.min ? 0 : Math.ceil(Math.log2(f.max - f.min + 1)); }
  function fieldBits(f) {
    var w = width(f), v = f.value - f.min, out = '';
    for (var i = w - 1; i >= 0; i--) out += ((v >> i) & 1);
    return out;
  }
  function fieldTok(f) { return f.name + ':' + f.min + '..' + f.max + ':' + f.value; }

  D.define({
    id: 'per-encoding',
    title: T('PER kodlama: her alan, aralığının gerektirdiği kadar bit', 'PER encoding: every field uses exactly as many bits as its range needs'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('10 alan: isim harfleri, yaş, birkaç kısıtlı sayı', '10 fields: name characters, an age, a few constrained numbers'),
        data: { fields: [ {name:'name0',min:0,max:255,value:82}, {name:'name1',min:0,max:255,value:101}, {name:'name2',min:0,max:255,value:120},
                           {name:'age',min:0,max:31,value:5}, {name:'active',min:0,max:1,value:1}, {name:'score',min:0,max:100,value:87},
                           {name:'level',min:0,max:7,value:3}, {name:'flag',min:0,max:1,value:0}, {name:'code',min:0,max:15,value:9},
                           {name:'temp',min:-20,max:50,value:22} ] } },
      { id: 'hard', level: 'hard', name: T('14 alan: geniş aralıklar, 16 bite kadar genişlik', '14 fields: wide ranges, widths up to 16 bits'),
        data: { fields: [ {name:'id',min:0,max:65535,value:4000}, {name:'name0',min:0,max:255,value:82}, {name:'name1',min:0,max:255,value:101},
                           {name:'name2',min:0,max:255,value:120}, {name:'name3',min:0,max:255,value:84}, {name:'age',min:0,max:31,value:20},
                           {name:'active',min:0,max:1,value:0}, {name:'score',min:0,max:1000,value:999}, {name:'level',min:0,max:7,value:7},
                           {name:'flag',min:0,max:1,value:1}, {name:'code',min:0,max:15,value:0}, {name:'temp',min:-50,max:50,value:-30},
                           {name:'ratio',min:0,max:9,value:4}, {name:'extra',min:0,max:3,value:2} ] } },
      { id: 'range-size-one', level: 'edge', name: T('Aralık büyüklüğü 1: 0 bit', 'A range of size 1: 0 bits'),
        data: { fields: [ {name:'version',min:1,max:1,value:1}, {name:'name0',min:0,max:255,value:82}, {name:'name1',min:0,max:255,value:101},
                           {name:'name2',min:0,max:255,value:120}, {name:'age',min:0,max:31,value:5}, {name:'active',min:0,max:1,value:1},
                           {name:'score',min:0,max:100,value:50}, {name:'level',min:0,max:7,value:3}, {name:'flag',min:0,max:1,value:0},
                           {name:'code',min:0,max:15,value:9} ] } },
      { id: 'top-of-range', level: 'edge', name: T('Değerler aralığın en üstünde', 'Values sit at the very top of their range'),
        data: { fields: [ {name:'name0',min:0,max:255,value:82}, {name:'name1',min:0,max:255,value:101}, {name:'name2',min:0,max:255,value:120},
                           {name:'age',min:0,max:31,value:31}, {name:'active',min:0,max:1,value:1}, {name:'score',min:0,max:100,value:100},
                           {name:'level',min:0,max:7,value:3}, {name:'flag',min:0,max:1,value:0}, {name:'code',min:0,max:15,value:9},
                           {name:'temp',min:-20,max:50,value:22} ] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.fields.length; },
    /** Independent bit-packer: builds the significant bit string from scratch (MSB first per field,
     * 0 bits when max == min), pads to a whole byte only at the very end. */
    reference: function (d) {
      var bits = '';
      d.fields.forEach(function (f) {
        var w = f.max === f.min ? 0 : Math.ceil(Math.log2(f.max - f.min + 1));
        var v = f.value - f.min, s = '';
        for (var i = w - 1; i >= 0; i--) s += ((v >> i) & 1);
        bits += s;
      });
      var totalBits = bits.length;
      var pad = (8 - (totalBits % 8)) % 8, padded = bits + new Array(pad + 1).join('0');
      var bytes = [];
      for (var j = 0; j < padded.length; j += 8) bytes.push(parseInt(padded.substr(j, 8), 2));
      return { totalBits: totalBits, bytes: bytes, bitString: bits };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 11, hard: 14, extreme: 16 }[level];
      var maxRange = { easy: 256, normal: 512, hard: 4096, extreme: 70000 }[level];
      var fields = [], i;
      for (i = 0; i < n; i++) {
        var forceUnit = (level === 'hard' || level === 'extreme') && r() < 0.12;
        var rangeSize = forceUnit ? 1 : D.randInt(r, 1, maxRange);
        var min = D.randInt(r, level === 'extreme' ? -50 : 0, 0);
        var max = min + rangeSize - 1;
        var atTop = r() < 0.15;
        var value = atTop ? max : D.randInt(r, min, max);
        fields.push({ name: 'f' + i, min: min, max: max, value: value });
      }
      return { fields: fields };
    },
    input: {
      hint: T('Örnek: name0:0..255:82 age:0..31:5 active:0..1:1  (alan:min..max:değer)',
              'Example: name0:0..255:82 age:0..31:5 active:0..1:1  (field:min..max:value)'),
      parse: function (text) {
        var fields = [], m;
        String(text).trim().split(/[\s,;]+/).filter(Boolean).forEach(function (tok) {
          if (!(m = /^([A-Za-z0-9_]+):(-?\d+)\.\.(-?\d+):(-?\d+)$/.exec(tok))) throw T('"' + tok + '" anlaşılmadı: ad:min..max:değer yazın.', '"' + tok + '" is not understood: write name:min..max:value.');
          var min = parseInt(m[2], 10), max = parseInt(m[3], 10), value = parseInt(m[4], 10);
          if (min > max) throw T('"' + tok + '": min, max\'tan büyük olamaz.', '"' + tok + '": min cannot be greater than max.');
          if (value < min || value > max) throw T('"' + tok + '": değer [min, max] aralığında olmalı.', '"' + tok + '": the value must be inside [min, max].');
          fields.push({ name: m[1], min: min, max: max, value: value });
        });
        if (fields.length < 1) throw T('En az bir alan yazın.', 'Write at least one field.');
        if (fields.length > 25) throw T('En çok 25 alan.', 'At most 25 fields.');
        return { fields: fields };
      },
      format: function (d) { return d.fields.map(fieldTok).join(' '); },
      bad: ['', 'age:0..31', 'age:31..0:5', 'age:0..31:99', 'age:abc:5'],
      tokens: function (d) { return d.fields.map(fieldTok); }
    },
    build: function (S, d) {
      var CAP = 16, X0 = 260, Y0 = 60, ROWH = 72, BW = 20, BH = 30, GAP = 2;
      S.label('title', { x: 20, y: 30, text: T(d.fields.length + ' alanlık AYNI türden bir kayıt, bu kez bit bit paketleniyor: etiket yok, uzunluk yok.', 'The SAME kind of ' + d.fields.length + '-field record, this time packed bit by bit: no tags, no lengths.'), size: 15, bold: true, anchor: 'start' });
      S.label('rowlbl', { x: X0 - 14, y: Y0 + 30 + BH / 2 + 5, text: 'bits =', anchor: 'end', size: 14, bold: true, mono: true });
      S.step(T('Her alanın bir aralığı ([min, max]) var. Genişlik = `ceil(log2(max - min + 1))` bit — ne kadar gerekiyorsa o kadar, ne bir bit fazla ne az.',
               'Every field has a range ([min, max]). Width = `ceil(log2(max - min + 1))` bits — exactly as many as needed, not one more.'),
             { c: [12, 13, 14], java: [13, 14, 15] });

      var bits = '', first = true;
      d.fields.forEach(function (f, i) {
        var y = Y0 + 30 + i * ROWH, rid = 'r' + i;
        S.at(i);
        var w = f.max === f.min ? 0 : Math.ceil(Math.log2(f.max - f.min + 1));
        var fb = fieldBits(f);
        bits += fb;
        S.label(rid + '_lbl', { x: 20, y: y + BH / 2 + 5, text: f.name + ' [' + f.min + '..' + f.max + ']', size: 12, anchor: 'start', mono: true });
        var x = X0, shown = fb, truncated = fb.length > CAP, lastBitId = null;
        if (truncated) shown = fb.slice(0, CAP - 1);
        for (var k = 0; k < shown.length; k++) {
          S.box(rid + '_b' + k, { x: x, y: y, w: BW, h: BH, text: shown[k], style: shown[k] === '1' ? 'new' : 'empty', size: 13 });
          lastBitId = rid + '_b' + k;
          x += BW + GAP;
        }
        if (truncated) { S.box(rid + '_more', { x: x, y: y, w: BW + 26, h: BH, text: '+' + (fb.length - shown.length), style: 'dim', size: 11 }); lastBitId = rid + '_more'; x += BW + 26 + GAP; }
        if (lastBitId) {
          var braceTxt = T(f.name + ' (' + w + ' bit)', f.name + ' (' + w + ' bit' + (w === 1 ? '' : 's') + ')');
          S.brace(rid + '_grp', { from: rid + '_b0', to: lastBitId, text: braceTxt, side: 'bottom', dist: 4, style: 'dim' });
        }
        var topNote = f.value === f.max && f.max !== f.min ? T(' (aralığın en üstünde)', ' (at the top of its range)') : { tr: '', en: '' };
        if (w === 0) S.label(rid + '_dec', { x: X0 + 10, y: y + BH / 2 + 5, text: T('0 bit!', '0 bits!'), size: 12, bold: true, anchor: 'start', style: 'dim' });
        else if (f.value === f.max && f.max !== f.min) S.label(rid + '_dec', { x: x + 10, y: y + BH / 2 + 5, text: T('tepe!', 'top!'), size: 12, bold: true, anchor: 'start', style: 'active' });
        if (w === 0) {
          S.step(T('`' + f.name + '` [' + f.min + '..' + f.max + '] — aralık büyüklüğü 1: tek olası değer. **0 bit** gönderilir; alıcı bunu şemadan zaten bilir.',
                   '`' + f.name + '` [' + f.min + '..' + f.max + '] — range size 1: only one possible value. **0 bits** are sent; the receiver already knows it from the schema.'),
                 { c: [12, 13], java: [13, 14] });
        } else if (first) {
          S.step(T('`' + f.name + '` [' + f.min + '..' + f.max + '] — aralık büyüklüğü ' + (f.max - f.min + 1) + ' -> genişlik = ' + w + ' bit. Değer ' + f.value + ' - ' + f.min + ' = ' + (f.value - f.min) + ', ikilik (binary) `' + fb + '` olarak yazılır' + topNote.tr + '.',
                   '`' + f.name + '` [' + f.min + '..' + f.max + '] — range size ' + (f.max - f.min + 1) + ' -> width = ' + w + ' bit' + (w > 1 ? 's' : '') + '. The value ' + f.value + ' - ' + f.min + ' = ' + (f.value - f.min) + ' is written as binary `' + fb + '`' + topNote.en + '.'),
                 { c: [14, 15], java: [15, 16] });
          first = false;
        } else {
          S.step(T('`' + f.name + '` — ' + w + ' bit, `' + fb + '`' + topNote.tr + '.',
                   '`' + f.name + '` — ' + w + ' bit' + (w > 1 ? 's' : '') + ', `' + fb + '`' + topNote.en + '.'),
                 { c: [15], java: [16] });
        }
      });

      var totalBits = bits.length, pad = (8 - (totalBits % 8)) % 8;
      var padded = bits + new Array(pad + 1).join('0'), bytes = [];
      for (var j = 0; j < padded.length; j += 8) bytes.push(parseInt(padded.substr(j, 8), 2));
      S.at(null);
      if (pad) {
        var yPad = Y0 + 30 + d.fields.length * ROWH, xPad = X0;
        S.label('pad_lbl', { x: 20, y: yPad + BH / 2 + 5, text: T('dolgu (padding)', 'padding'), size: 12, anchor: 'start', mono: true, style: 'dim' });
        for (var p = 0; p < pad; p++) { S.box('pad_' + p, { x: xPad, y: yPad, w: BW, h: BH, text: '0', style: 'dim', size: 13 }); xPad += BW + GAP; }
        S.step(T('Son bayta tamamlamak için ' + pad + ' kullanılmayan bit eklenir. PER çıktısı yalnızca EN SONDA bayta hizalanır, alanların her biri ayrı ayrı değil.',
                 pad + ' unused bits are added to round up to a whole byte. PER output is only byte-aligned at the very END, not field by field.'),
               { c: [12, 13], java: [13, 14] });
      }
      var tlvEstimateBytes = d.fields.reduce(function (s, f) { var w2 = f.max === f.min ? 0 : Math.ceil(Math.log2(f.max - f.min + 1)); return s + 2 + Math.max(1, Math.ceil(w2 / 8)); }, 0);
      S.result = { totalBits: totalBits, bytes: bytes, bitString: bits };
      S.step(T('Bitti: ' + totalBits + ' anlamlı bit, ' + bytes.length + ' bayta paketlendi. Aynı alanlara TLV\'de Tag+Length verilse kabaca ' + tlvEstimateBytes + ' bayt (' + (tlvEstimateBytes * 8) + ' bit) gerekirdi — PER, kendini tanımlamanın çoğunu feda ederek küçülür.',
               'Done: ' + totalBits + ' significant bits, packed into ' + bytes.length + ' bytes. The same fields with a Tag and Length each (TLV-style) would need roughly ' + tlvEstimateBytes + ' bytes (' + (tlvEstimateBytes * 8) + ' bits) — PER shrinks by giving up most of that self-description.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
