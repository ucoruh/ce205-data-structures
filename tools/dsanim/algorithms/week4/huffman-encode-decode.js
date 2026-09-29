/* Week 4 — Huffman encode/decode. The tree is built once (same algorithm as huffman-build.js, frequencies taken
 * from the text) and shown complete; the animation focuses on walking root-to-leaf paths to encode each character,
 * and walking bit by bit from the root to decode them back. Data: {text: string}, >= 10 characters, >= 2 distinct. */
(function (D) {
  'use strict';
  var T = D.T;

  var C = [
    '/* assign a 0/1 code to every leaf by walking the tree */',
    'void assign_codes(Node *node, char *path, int depth) {',
    '    if (node->left == NULL && node->right == NULL) {',
    "        path[depth] = '\\0';",
    '        strcpy(codes[(unsigned char) node->ch], path);',
    '        return;',
    '    }',
    "    path[depth] = '0'; assign_codes(node->left,  path, depth + 1);",
    "    path[depth] = '1'; assign_codes(node->right, path, depth + 1);",
    '}',
    '',
    '/* encode: concatenate each character\'s code */',
    'char *encode(const char *text) {',
    "    static char out[4096]; out[0] = '\\0';",
    "    for (int i = 0; text[i] != '\\0'; i++)",
    '        strcat(out, codes[(unsigned char) text[i]]);',
    '    return out;',
    '}',
    '',
    '/* decode: walk the tree one bit at a time; a leaf emits a character and restarts at the root */',
    'char *decode(const char *bits, Node *root) {',
    '    static char out[4096]; int n = 0;',
    '    Node *node = root;',
    "    for (int i = 0; bits[i] != '\\0'; i++) {",
    "        node = bits[i] == '0' ? node->left : node->right;",
    '        if (node->left == NULL && node->right == NULL) {',
    '            out[n++] = node->ch;',
    '            node = root;',
    '        }',
    '    }',
    "    out[n] = '\\0';",
    '    return out;',
    '}'
  ];
  var J = [
    "// assign a 0/1 code to every leaf by walking the tree",
    'void assignCodes(Node node, StringBuilder path) {',
    '    if (node.left == null && node.right == null) {',
    '        codes[node.ch] = path.toString();',
    '        return;',
    '    }',
    "    path.append('0'); assignCodes(node.left, path); path.deleteCharAt(path.length() - 1);",
    "    path.append('1'); assignCodes(node.right, path); path.deleteCharAt(path.length() - 1);",
    '}',
    '',
    '',
    "// encode: concatenate each character's code",
    'String encode(String text) {',
    '    StringBuilder out = new StringBuilder();',
    '    for (int i = 0; i < text.length(); i++)',
    '        out.append(codes[text.charAt(i)]);',
    '    return out.toString();',
    '}',
    '',
    '// decode: walk the tree one bit at a time; a leaf emits a character and restarts at the root',
    'String decode(String bits, Node root) {',
    '    StringBuilder out = new StringBuilder();',
    '    Node node = root;',
    '    for (int i = 0; i < bits.length(); i++) {',
    "        node = bits.charAt(i) == '0' ? node.left : node.right;",
    '        if (node.left == null && node.right == null) {',
    '            out.append(node.ch);',
    '            node = root;',
    '        }',
    '    }',
    '    return out.toString();',
    '}'
  ];

  /** When several loop iterations are concatenated into one S.step, the same source line can be "run" in
   *  one iteration (e.g. the bit that reaches a leaf) and "the side not taken" (skip) in another (an
   *  earlier bit that does not) — the player highlights by line NUMBER for the whole step, so a line that
   *  really executed at least once must never also carry a skip mark. */
  function dedupeSkip(lines) {
    var ran = {};
    lines.forEach(function (x) {
      var n = x && typeof x === 'object' ? x.n : x;
      var isSkip = !!(x && typeof x === 'object' && x.skip);
      if (!isSkip) ran[n] = true;
    });
    return lines.filter(function (x) {
      var n = x && typeof x === 'object' ? x.n : x;
      var isSkip = !!(x && typeof x === 'object' && x.skip);
      return !(isSkip && ran[n]);
    });
  }

  function freqOf(text) {
    var map = {}, order = [];
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (!(ch in map)) { map[ch] = 0; order.push(ch); }
      map[ch]++;
    }
    return { map: map, order: order };
  }
  function priorityX(ids, cx, dx) {
    var n = ids.length, out = {};
    if (!n) return out;
    var total = (n - 1) * dx;
    ids.forEach(function (id, idx) { out[id] = cx - total / 2 + idx * dx; });
    return out;
  }
  /** Build a Huffman tree (frozen midpoint layout) and its per-character codes; used by build() only. */
  function huffmanTree(freq, order, cx, y0, dx, levelgap) {
    var nodes = {}, children = {}, forest = [];
    order.forEach(function (ch, idx) {
      var id = 'leaf_' + ch;
      nodes[id] = { freq: freq[ch], tieId: idx, label: ch + ':' + freq[ch], y: y0, ch: ch };
      forest.push(id);
    });
    forest.sort(function (a, b) { return nodes[a].freq - nodes[b].freq || nodes[a].tieId - nodes[b].tieId; });
    var xs = priorityX(forest, cx, dx);
    forest.forEach(function (id) { nodes[id].x = xs[id]; });
    var mergeCounter = 0;
    while (forest.length > 1) {
      var a = forest[0], b = forest[1];
      forest = forest.slice(2);
      mergeCounter++;
      var mid = 'm_' + mergeCounter;
      nodes[mid] = { freq: nodes[a].freq + nodes[b].freq, tieId: 1000 + mergeCounter, label: String(nodes[a].freq + nodes[b].freq), x: (nodes[a].x + nodes[b].x) / 2, y: Math.min(nodes[a].y, nodes[b].y) - levelgap };
      children[mid] = [a, b];
      forest.push(mid);
      forest.sort(function (p, q) { return nodes[p].freq - nodes[q].freq || nodes[p].tieId - nodes[q].tieId; });
    }
    var root = forest[0] || null;
    var codes = {};
    (function walk(id, path) {
      if (!children[id]) { codes[nodes[id].ch] = path || '0'; return; }
      walk(children[id][0], path + '0');
      walk(children[id][1], path + '1');
    })(root, '');
    return { nodes: nodes, children: children, root: root, codes: codes };
  }

  D.define({
    id: 'huffman-encode-decode',
    title: T('Huffman ile kodlama ve kod çözme', 'Huffman encoding and decoding'),
    code: { c: C, java: J },
    presets: [
      { id: 'normal', level: 'normal', name: T('Klasik örnek: "ABRACADABRA" (11 karakter)', 'The classic example: "ABRACADABRA" (11 characters)'),
        data: { text: 'ABRACADABRA' } },
      { id: 'hard', level: 'hard', name: T('Daha çeşitli: "THEQUICKBROWNFOX" (16 karakter)', 'More variety: "THEQUICKBROWNFOX" (16 characters)'),
        data: { text: 'THEQUICKBROWNFOX' } },
      { id: 'two-symbols', level: 'edge', name: T('Sadece 2 farklı sembol: 10 karakter', 'Only 2 distinct symbols: 10 characters'),
        data: { text: 'AAAAABBBBB' } },
      { id: 'skewed', level: 'edge', name: T('Çok çarpık: 9 A, 1 B', 'Very skewed: nine As, one B'),
        data: { text: 'AAAAAAAAAB' } },
      { id: 'digits', level: 'edge', name: T('Rakamlarla: 14 karakter', 'With digits: 14 characters'),
        data: { text: '11223344556677' } },
      { id: 'long', level: 'edge', name: T('Uzun metin: 30 karakter', 'A long text: 30 characters'),
        data: { text: 'ABCDEFGHIJABCDEFGHIJABCDEFGHIJ' } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    /** Number of characters in the text — every example must have at least 10. */
    size: function (d) { return d.text.length; },
    /** Independent computation: build a SEPARATE Huffman tree (a full re-sort at every merge, not an incremental
     * heap) and derive code LENGTHS from it. Any tie-breaking of the greedy rule gives an optimal tree, so the
     * total encoded length matches regardless of which tree, ours or build()'s, produced the specific codes; a
     * correct decode must always reproduce the original text. */
    reference: function (d) {
      var nodes = [];
      for (var c = 0; c < d.text.length; c++) {
        var hit = null;
        for (var q = 0; q < nodes.length; q++) if (nodes[q].ch === d.text[c]) hit = nodes[q];
        if (hit) hit.freq++; else nodes.push({ ch: d.text[c], freq: 1, id: nodes.length, left: null, right: null });
      }
      if (nodes.length === 1) return { textLength: d.text.length, encodedBits: d.text.length, decodedMatchesOriginal: true };
      var counter = nodes.length;
      while (nodes.length > 1) {
        nodes.sort(function (a, b) { return a.freq - b.freq || a.id - b.id; });
        var a = nodes.shift(), b = nodes.shift();
        nodes.push({ freq: a.freq + b.freq, id: counter++, left: a, right: b });
      }
      var lens = {};
      (function walk(node, depth) {
        if (!node.left && !node.right) { lens[node.ch] = depth || 1; return; }
        walk(node.left, depth + 1); walk(node.right, depth + 1);
      })(nodes[0], 0);
      var bits = 0;
      for (var i = 0; i < d.text.length; i++) bits += lens[d.text[i]];
      return { textLength: d.text.length, encodedBits: bits, decodedMatchesOriginal: true };
    },
    random: function (level, r) {
      var alphaSize = { easy: 3, normal: 4, hard: 5, extreme: 6 }[level];
      var len = { easy: 10, normal: 14, hard: 20, extreme: 30 }[level];
      var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, alphaSize).split('');
      var text = alphabet[0] + alphabet[1];
      for (var i = 2; i < len; i++) text += alphabet[D.randInt(r, 0, alphabet.length - 1)];
      return { text: text };
    },
    input: {
      hint: T('Örnek: ABRACADABRA (yalnız harf/rakam, en az 10 karakter, en az 2 farklı)', 'Example: ABRACADABRA (letters/digits only, at least 10 characters, at least 2 distinct)'),
      parse: function (text) {
        var s = String(text).trim().toUpperCase();
        if (!/^[A-Z0-9]+$/.test(s)) throw T('Yalnız harf ve rakam kullanın (boşluksuz).', 'Use only letters and digits (no spaces).');
        if (s.length < 10) throw T('En az 10 karakter yazın.', 'Write at least 10 characters.');
        if (s.length > 40) throw T('En çok 40 karakter.', 'At most 40 characters.');
        if (Object.keys(freqOf(s).map).length < 2) throw T('En az 2 farklı karakter olmalı.', 'There must be at least 2 distinct characters.');
        return { text: s };
      },
      format: function (d) { return d.text; },
      tokens: function (d) { return d.text.split(''); },
      bad: ['', 'AB CD EFGH', 'A', 'AAAAAAAAAA', 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNO']
    },
    build: function (S, d) {
      var text = d.text, f = freqOf(text);
      var CX = 420, Y0 = 300, LEVELGAP = 76, DX = f.order.length > 1 ? Math.min(80, 760 / (f.order.length - 1)) : 0;
      var tree = huffmanTree(f.map, f.order, CX, Y0, DX, LEVELGAP);

      Object.keys(tree.nodes).forEach(function (id) {
        var nd = tree.nodes[id];
        S.circle(id, { x: nd.x, y: nd.y, text: nd.label, r: 22 });
      });
      Object.keys(tree.children).forEach(function (id) {
        var kids = tree.children[id];
        S.arrow('e' + id + '_0', { from: id, to: kids[0], kind: 'center', text: '0' });
        S.arrow('e' + id + '_1', { from: id, to: kids[1], kind: 'center', text: '1' });
      });
      var codeList = f.order.map(function (ch) { return ch + '=' + tree.codes[ch]; }).join('  ');
      var TY = Y0 + 46, TDX = 56, totalTW = Math.max(0, (f.order.length - 1) * TDX), TX0 = CX - totalTW / 2;
      S.label('symlbl', { x: TX0 - 16, y: TY + 5, text: T('sembol =', 'symbol ='), anchor: 'end', size: 14, mono: true, style: 'dim' });
      S.label('codelbl', { x: TX0 - 16, y: TY + 41, text: T('kod =', 'code ='), anchor: 'end', size: 14, mono: true, style: 'dim' });
      f.order.forEach(function (ch, idx) {
        S.box('symc' + idx, { x: TX0 + idx * TDX, y: TY, w: 38, h: 32, text: ch, size: 15 });
        S.box('codc' + idx, { x: TX0 + idx * TDX, y: TY + 36, w: Math.max(38, tree.codes[ch].length * 11), h: 30, text: tree.codes[ch], size: 13, mono: true, style: 'dim' });
      });
      var ROWY = TY + 84;
      S.label('enclbl', { x: TX0 - 16, y: ROWY + 5, text: T('kodlanan =', 'encoded ='), anchor: 'end', size: 14, mono: true, style: 'dim' });
      S.label('declbl', { x: TX0 - 16, y: ROWY + 31, text: T('çözülen =', 'decoded ='), anchor: 'end', size: 14, mono: true, style: 'dim' });
      function showEncoded(bits) { if (S.has('encRow')) S.set('encRow', { text: bits || '—' }); else S.label('encRow', { x: TX0, y: ROWY, text: bits || '—', anchor: 'start', size: 14, mono: true, style: 'hl' }); }
      function showDecoded(str) { if (S.has('decRow')) S.set('decRow', { text: str || '—' }); else S.label('decRow', { x: TX0, y: ROWY + 26, text: str || '—', anchor: 'start', size: 14, mono: true, style: 'hl' }); }
      showEncoded(''); showDecoded('');
      S.step(T('"' + text + '" metninin Huffman ağacı (huffman-build.js ile aynı yöntemle kuruldu). Her yaprağın kodu, kökten o yaprağa giden 0/1 yolu: ' + codeList + '.',
               'The Huffman tree for "' + text + '" (built the same way as huffman-build.js). Every leaf\'s code is the 0/1 path from the root to that leaf: ' + codeList + '.'),
             { c: [2, 3, 4, 5, 7, 8], java: [2, 3, 4, 6, 7] });

      function pathOf(ch) {
        var code = tree.codes[ch], cur = tree.root, path = [cur];
        for (var i = 0; i < code.length; i++) {
          var kids = tree.children[cur];
          cur = code[i] === '0' ? kids[0] : kids[1];
          path.push(cur);
        }
        return path;
      }
      function setPath(path, st) { path.forEach(function (id) { S.set(id, { style: st }); }); }

      var encoded = '';
      for (var ei = 0; ei < text.length; ei++) {
        S.at(ei);
        var ch = text[ei], path = pathOf(ch), code = tree.codes[ch];
        var detailed = ei < 3;
        if (detailed) {
          setPath(path, 'hl');
          /* out[0]='\0' (14) and the signature (13) run ONCE, at function entry — only true for the very
           * first character; repeating them for ei=1,2 would falsely claim the function re-entered. */
          var forNote = { n: 15, note: T("text[i] != '\\0'? evet", "text[i] != '\\0'? yes") };
          var pathLines = ei === 0 ? [13, 14, forNote] : [forNote];
          S.step(T('Karakter "' + ch + '": kökten ' + ch + ' yaprağına giden yol vurgulanır — kod = ' + code + '.',
                   'Character "' + ch + '": the root-to-leaf path for ' + ch + ' is highlighted — code = ' + code + '.'),
                 { c: pathLines, java: pathLines });
          setPath(path, 'normal');
        }
        encoded += code;
        showEncoded(encoded);
        if (detailed) {
          S.step(T('`' + code + '` bitleri kodlanmış dizinin sonuna eklenir: şimdiye kadar `' + encoded + '`.',
                   'The bits `' + code + '` are appended to the encoded string: so far `' + encoded + '`.'),
                 { c: [16], java: [16] });
        }
      }
      S.step(T('Kalan ' + (text.length - 3 > 0 ? text.length - 3 : 0) + ' karakter de aynı şekilde (yol vurgula, kod ekle) hızlıca kodlanır.',
               'The remaining ' + (text.length - 3 > 0 ? text.length - 3 : 0) + ' characters are encoded the same way (highlight the path, append the code), shown quickly.'),
             { c: [{ n: 15, note: T("text[i] != '\\0'? evet", "text[i] != '\\0'? yes") }, 16],
               java: [{ n: 15, note: T("text[i] != '\\0'? evet", "text[i] != '\\0'? yes") }, 16] });
      S.step(T('Kodlama bitti: "' + text + '" (' + text.length + ' karakter) → `' + encoded + '` (' + encoded.length + ' bit). Düz ASCII ile ' + (text.length * 8) + ' bit gerekirdi.',
               'Encoding done: "' + text + '" (' + text.length + ' characters) → `' + encoded + '` (' + encoded.length + ' bits). Plain ASCII would need ' + (text.length * 8) + ' bits.'),
             { c: [{ n: 15, note: T("text[i] != '\\0'? hayır (metin bitti)", "text[i] != '\\0'? no (out of text)") }, 17],
               java: [{ n: 15, note: T("text[i] != '\\0'? hayır (metin bitti)", "text[i] != '\\0'? no (out of text)") }, 17] });

      S.at(null);
      var decoded = '', cur = tree.root, pos = 0, charCount = 0;
      var pathAcc = [cur];
      for (var bi = 0; bi < encoded.length; bi++) {
        var kids = tree.children[cur];
        cur = encoded[bi] === '0' ? kids[0] : kids[1];
        pathAcc.push(cur);
        if (!tree.children[cur]) {
          charCount++;
          var detailedD = charCount <= 3;
          if (detailedD) {
            setPath(pathAcc, 'hl');
            /* Real trace: the loop condition (24), the child move (25) AND the leaf check (26) all run
             * once per bit consumed (26 is inside the loop body, evaluated every iteration, not just the
             * last one) — every bit before the leaf gets a "no" note and 27-28 (emit, reset) marked skip
             * for that iteration; only the LAST bit's check comes back "yes" and really runs 27-28. Lines
             * 22/23 (out/n and node=root) run once, at function entry — only true for the very first
             * character decoded. */
            var bitsWalked = bi - pos + 1, decLines = charCount === 1 ? [22, 23] : [];
            for (var wb = 0; wb < bitsWalked; wb++) {
              var isLastBit = wb === bitsWalked - 1, bitCh = encoded[pos + wb];
              decLines.push({ n: 24, note: T("bits[i] != '\\0'? evet", "bits[i] != '\\0'? yes") });
              decLines.push({ n: 25, note: bitCh === '0' ? T("bits[i] == '0'? evet (sola)", "bits[i] == '0'? yes (go left)") : T("bits[i] == '0'? hayır (sağa)", "bits[i] == '0'? no (go right)") });
              decLines.push({ n: 26, note: isLastBit ? T('yaprak mı? evet', 'leaf? yes') : T('yaprak mı? hayır', 'leaf? no') });
              if (isLastBit) decLines.push(27, 28);
              else decLines.push({ n: 27, skip: true }, { n: 28, skip: true });
            }
            decLines = dedupeSkip(decLines);
            S.step(T('`decode`: bitler `' + encoded.slice(pos, bi + 1) + '` kökten yaprağa götürür — karakter "' + tree.nodes[cur].ch + '".',
                     '`decode`: bits `' + encoded.slice(pos, bi + 1) + '` walk from the root to a leaf — character "' + tree.nodes[cur].ch + '".'),
                   { c: decLines, java: decLines });
            setPath(pathAcc, 'normal');
          }
          decoded += tree.nodes[cur].ch;
          showDecoded(decoded);
          pos = bi + 1;
          cur = tree.root;
          pathAcc = [cur];
        }
      }
      S.step(T('Kalan karakterler de aynı şekilde (kökten başla, bit tüket, yaprakta karakter üret, tekrar köke dön) hızlıca çözülür.',
               'The remaining characters are decoded the same way (start at the root, consume bits, emit a character at a leaf, restart at the root), shown quickly.'),
             { c: [{ n: 24, note: T("bits[i] != '\\0'? evet", "bits[i] != '\\0'? yes") },
                   { n: 25, note: T("bits[i] == '0'? evet/hayır (bite göre)", "bits[i] == '0'? yes/no (depends on the bit)") },
                   { n: 26, note: T('yaprak mı? evet/hayır (bite göre)', 'leaf? yes/no (depends on the bit)') }, 27, 28],
               java: [{ n: 24, note: T("bits[i] != '\\0'? evet", "bits[i] != '\\0'? yes") },
                      { n: 25, note: T("bits[i] == '0'? evet/hayır (bite göre)", "bits[i] == '0'? yes/no (depends on the bit)") },
                      { n: 26, note: T('yaprak mı? evet/hayır (bite göre)', 'leaf? yes/no (depends on the bit)') }, 27, 28] });

      var ok = decoded === text;
      S.result = { textLength: text.length, encodedBits: encoded.length, decodedMatchesOriginal: ok };
      /* C's decode() has one extra tail statement Java doesn't need (`out[n] = '\0';`, line 31, to
       * null-terminate the C string before `return out;` on 32) — StringBuilder needs no such line, so
       * Java's `return out.toString();` is line 31. The two languages are NOT line-parallel here, unlike
       * every other step in this file, so they get their own line lists. */
      S.step(T('Kod çözme bitti: `' + encoded + '` → "' + decoded + '". ' + (ok ? 'Özgün metinle BİREBİR aynı.' : 'UYUŞMUYOR (hata var)!') + ' Huffman kodu önek-özgür (prefix-free) olduğu için hiçbir kod bir başkasının başlangıcı değildir — bu yüzden tek geçişte, geri dönmeden çözülür.',
               'Decoding done: `' + encoded + '` → "' + decoded + '". ' + (ok ? 'It matches the original text EXACTLY.' : 'It DOES NOT MATCH (a bug)!') + ' A Huffman code is prefix-free — no code is the start of another — so it decodes in a single left-to-right pass, with no backtracking.'),
             { c: [{ n: 24, note: T("bits[i] != '\\0'? hayır (bit kalmadı)", "bits[i] != '\\0'? no (out of bits)") }, 31, 32],
               java: [{ n: 24, note: T("bits[i] != '\\0'? hayır (bit kalmadı)", "bits[i] != '\\0'? no (out of bits)") }, 31] });
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
