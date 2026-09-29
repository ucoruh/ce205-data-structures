/* Week 12 -- Strings: Structures and Algorithms
 * Rabin-Karp search: instead of comparing characters, compare a cheap ROLLING HASH of each text window
 * against the pattern's hash. Sliding the window by one position updates the hash in O(1) -- remove the
 * outgoing character's contribution, shift, add the incoming character -- instead of rehashing from scratch.
 * A hash match is only a CANDIDATE: two different substrings can hash to the same value (a "spurious hit"),
 * so every hash match must still be VERIFIED character by character before being reported as a real
 * occurrence. A small modulus makes spurious hits common (shown deliberately below); a large prime modulus
 * makes them vanishingly rare in practice, though never mathematically impossible. */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'long long window_hash(const char *s, int m, long long base, long long mod) {',
    '    long long h = 0;',
    '    for (int k = 0; k < m; k++) h = (h * base + (s[k] - \'A\')) % mod;',
    '    return h;',
    '}',
    '',
    'void rabin_karp(const char *text, int n, const char *pattern, int m, long long base, long long mod, int occ[], int *count) {',
    '    long long pHash = window_hash(pattern, m, base, mod);',
    '    long long hPow = 1;',
    '    for (int k = 0; k < m - 1; k++) hPow = (hPow * base) % mod;',
    '    long long tHash = window_hash(text, m, base, mod);      /* first window, computed directly */',
    '    int c = 0;',
    '    for (int s = 0; s <= n - m; s++) {',
    '        if (s > 0)',
    '            tHash = ((tHash - (text[s - 1] - \'A\') * hPow % mod + mod) * base + (text[s + m - 1] - \'A\')) % mod;',
    '        if (tHash == pHash && strncmp(text + s, pattern, m) == 0)   /* VERIFY: hash match is only a candidate */',
    '            occ[c++] = s;',
    '    }',
    '    *count = c;',
    '}'
  ];
  var JAVA = [
    'static long windowHash(String s, int m, long base, long mod) {',
    '    long h = 0;',
    '    for (int k = 0; k < m; k++) h = (h * base + (s.charAt(k) - \'A\')) % mod;',
    '    return h;',
    '}',
    '',
    'static int[] rabinKarp(String text, String pattern, long base, long mod) {',
    '    int n = text.length(), m = pattern.length(), c = 0;',
    '    long pHash = windowHash(pattern, m, base, mod);',
    '    long hPow = 1;',
    '    for (int k = 0; k < m - 1; k++) hPow = (hPow * base) % mod;',
    '    long tHash = windowHash(text, m, base, mod);        // first window, computed directly',
    '    int[] occ = new int[n];',
    '    for (int s = 0; s <= n - m; s++) {',
    '        if (s > 0)',
    '            tHash = ((tHash - (text.charAt(s - 1) - \'A\') * hPow % mod + mod) * base + (text.charAt(s + m - 1) - \'A\')) % mod;',
    '        if (tHash == pHash && text.regionMatches(s, pattern, 0, m))   // VERIFY: hash match is only a candidate',
    '            occ[c++] = s;',
    '    }',
    '    return Arrays.copyOf(occ, c);',
    '}'
  ];

  function code(c) { return c.charCodeAt(0) - 65; }
  function directHash(s, base, mod) { var h = 0; for (var k = 0; k < s.length; k++) h = (h * base + code(s[k])) % mod; return h; }
  function firstDiff(a, b) { for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return i; return -1; }

  /** Independent hash: accumulates place-value powers of `base` RIGHT to LEFT (own running power `p`),
   * never calling directHash()/code() -- build() uses directHash() for its window hashes, so reference()
   * must use a genuinely different computation to be able to catch a bug in either. */
  function refHash(s, base, mod) {
    var h = 0, p = 1;
    for (var k = s.length - 1; k >= 0; k--) {
      h = (h + (s.charCodeAt(k) - 65) * p) % mod;
      p = (p * base) % mod;
    }
    return h;
  }

  /** Independent: occurrences found by direct substring comparison; spurious hits found via refHash(),
   * never directHash() (which build() also calls). */
  function reference(d) {
    var text = d.text, pattern = d.pattern, base = d.base, mod = d.mod, n = text.length, m = pattern.length;
    var pHash = refHash(pattern, base, mod), occ = [], spur = [];
    for (var s = 0; s <= n - m; s++) {
      var sub = text.slice(s, s + m), sh = refHash(sub, base, mod);
      if (sh === pHash) { if (sub === pattern) occ.push(s); else spur.push(s); }
    }
    return { occurrences: occ, spuriousHits: spur };
  }

  D.define({
    id: 'rabin-karp',
    title: T('Rabin-Karp: kayan özet (hash) ve sahte isabetler', 'Rabin-Karp: rolling hash and spurious hits'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('"HELLOWORLD" içinde "WORLD", mod=101: sahte isabet yok', '"WORLD" inside "HELLOWORLD", mod=101: no spurious hits'),
        data: { text: 'HELLOWORLD', pattern: 'WORLD', base: 31, mod: 101 } },
      { id: 'hard', level: 'hard', name: T('mod=7 (küçük): 1 gerçek + 2 sahte isabet', 'mod=7 (small): 1 genuine + 2 spurious hits'),
        data: { text: 'AADBDDBCDBB', pattern: 'AAD', base: 4, mod: 7 } },
      { id: 'not-found-spurious', level: 'edge', name: T('mod=7: hiç gerçek eşleşme yok ama 3 sahte özet çakışması var', 'mod=7: no genuine match at all, but 3 spurious hash collisions'),
        data: { text: 'DBCADADABDC', pattern: 'BAD', base: 4, mod: 7 } },
      { id: 'all-same', level: 'edge', name: T('"AAAAAAAAAA", pattern="AAA": her yerde gerçek çakışan eşleşme', '"AAAAAAAAAA", pattern="AAA": a genuine overlapping match everywhere'),
        data: { text: 'AAAAAAAAAA', pattern: 'AAA', base: 31, mod: 101 } },
      { id: 'large-mod', level: 'edge', name: T('mod = 1.000.000.007 (büyük asal): sahte isabet neredeyse imkansız', 'mod = 1,000,000,007 (large prime): a spurious hit is practically impossible'),
        data: { text: 'ALGORITHMS', pattern: 'RITHM', base: 31, mod: 1000000007 } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.text.length; },
    reference: reference,
    random: function (level, r) {
      var alpha = level === 'easy' ? 6 : (level === 'normal' ? 4 : (level === 'hard' ? 3 : 2));
      var mod = level === 'easy' ? 1009 : (level === 'normal' ? 101 : (level === 'hard' ? 13 : 7));
      var n = D.randInt(r, 10, level === 'extreme' ? 14 : 12), text = '', i;
      for (i = 0; i < n; i++) text += String.fromCharCode(65 + D.randInt(r, 0, alpha - 1));
      var m = D.randInt(r, 3, 5), start = D.randInt(r, 0, n - m);
      var pattern = r() < 0.5 ? text.slice(start, start + m) : (function () { var s = ''; for (var k = 0; k < m; k++) s += String.fromCharCode(65 + D.randInt(r, 0, alpha - 1)); return s; })();
      return { text: text, pattern: pattern, base: 31, mod: mod };
    },
    input: {
      hint: T('Örnek: text=HELLOWORLD pattern=WORLD base=31 mod=101  (yalnız A-Z; mod 5-1000000007 arası)',
              'Example: text=HELLOWORLD pattern=WORLD base=31 mod=101  (letters A-Z only; mod between 5 and 1000000007)'),
      parse: function (text) {
        var t = null, p = null, mod = 101, base = 31;
        String(text).trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
          var tm = /^text[=:]([A-Za-z]+)$/i.exec(tok); if (tm) { t = tm[1].toUpperCase(); return; }
          var pm = /^pattern[=:]([A-Za-z]+)$/i.exec(tok); if (pm) { p = pm[1].toUpperCase(); return; }
          var mm = /^mod[=:](\d+)$/i.exec(tok); if (mm) { mod = parseInt(mm[1], 10); return; }
          var bm = /^base[=:](\d+)$/i.exec(tok); if (bm) { base = parseInt(bm[1], 10); return; }
          throw T('"' + tok + '" anlaşılmadı: text=..., pattern=..., isteğe bağlı base=... ve mod=... yazın.', '"' + tok + '" is not understood: write text=..., pattern=..., and optionally base=... and mod=....');
        });
        if (!t) throw T('text=... yazmalısınız.', 'You must write text=....');
        if (!p) throw T('pattern=... yazmalısınız.', 'You must write pattern=....');
        if (t.length < 10 || t.length > 20) throw T('text 10 ile 20 harf arasında olmalı.', 'text must be between 10 and 20 letters.');
        if (p.length < 2 || p.length > t.length) throw T('pattern 2 harf ile text uzunluğu arasında olmalı.', 'pattern must be between 2 letters and the length of text.');
        if (mod < 5 || mod > 1000000007) throw T('mod 5 ile 1000000007 arasında olmalı.', 'mod must be between 5 and 1000000007.');
        if (base < 2 || base > 64) throw T('base 2 ile 64 arasında olmalı.', 'base must be between 2 and 64.');
        return { text: t, pattern: p, base: base, mod: mod };
      },
      format: function (d) { return 'text=' + d.text + ' pattern=' + d.pattern + ' base=' + d.base + ' mod=' + d.mod; },
      bad: ['', 'text=ABC pattern=AB', 'HELLOWORLD', 'text=HELLOWORLD', 'pattern=WORLD text=HELLOWORLD mod=abc', 'text=hello123 pattern=lo'],
      tokens: function (d) { return d.text.split(''); }
    },
    build: function (S, d) {
      var text = d.text, pattern = d.pattern, base = d.base, mod = d.mod, n = text.length, m = pattern.length;
      var W = 34, H = 34, X0 = 110, Y0T = 90, Y0P = 150;
      S.label('trow', { x: X0 - 16, y: Y0T + H / 2 + 5, text: 'text[] =', anchor: 'end', bold: true, size: 15 });
      for (var ti = 0; ti < n; ti++) S.box('t' + ti, { x: X0 + ti * W, y: Y0T, w: 28, h: H, text: text[ti], style: 'normal', size: 15, above: String(ti) });
      S.label('prow', { x: X0 - 16, y: Y0P + H / 2 + 5, text: 'pattern[] =', anchor: 'end', bold: true, size: 15 });
      for (var pj = 0; pj < m; pj++) S.box('p' + pj, { x: X0 + pj * W, y: Y0P, w: 28, h: H, text: pattern[pj], style: 'dim', size: 15, above: String(pj) });
      var RX = X0 + Math.max(n, m) * W + 40;
      S.label('modlbl', { x: X0, y: 40, text: 'base = ' + base + ', mod = ' + mod, size: 14, mono: true, bold: true });
      S.label('dec', { x: RX, y: Y0T, text: '', size: 15, bold: true, anchor: 'start' });
      S.label('dec2', { x: RX, y: Y0T + 24, text: '', size: 12, anchor: 'start', style: 'dim' });

      var pHash = directHash(pattern, base, mod), hPow = 1;
      for (var k = 0; k < m - 1; k++) hPow = (hPow * base) % mod;
      S.set('modlbl', { text: 'base = ' + base + ', mod = ' + mod + ', H(pattern) = ' + pHash });
      S.step(T('`pattern`\'in özeti bir kez hesaplanır: `H(pattern) = ' + pHash + '`. Her pencerenin özeti bununla karşılaştırılacak.',
               '`pattern`\'s hash is computed once: `H(pattern) = ' + pHash + '`. Every window\'s hash will be compared against it.'),
             { c: [7, 8, 9, { n: 10, note: T('k = 0..' + (m - 2), 'k = 0..' + (m - 2)) }], java: [6, 7, 8, 9] });

      var occ = [], spur = [], tHash = 0, lastTouched = [];
      for (var s = 0; s <= n - m; s++) {
        S.at(s);
        lastTouched.forEach(function (idx) { S.set('t' + idx, { style: 'normal' }); });
        lastTouched = [];
        for (var w = s; w < s + m; w++) { S.set('t' + w, { style: 'active' }); lastTouched.push(w); }
        if (s === 0) {
          tHash = directHash(text.slice(0, m), base, mod);
          S.set('dec', { text: 'H(window) = ' + tHash, style: 'active' });
          S.step(T('İlk pencere `text[0..' + (m - 1) + ']` = "' + text.slice(0, m) + '" için özet doğrudan hesaplanır: `' + tHash + '`.',
                   'The first window `text[0..' + (m - 1) + ']` = "' + text.slice(0, m) + '" has its hash computed directly: `' + tHash + '`.'),
                 { c: [11], java: [12] });
        } else {
          var oldTHash = tHash;
          tHash = (((tHash - code(text[s - 1]) * hPow % mod + mod) * base) + code(text[s + m - 1])) % mod;
          S.set('dec', { text: 'H(window) = ' + tHash, style: 'active' });
          S.step(T('Pencere kayar: `' + text[s - 1] + '`\'nin katkısı çıkarılır, `' + text[s + m - 1] + '` eklenir -- yeniden baştan hesaplamadan, O(1): `' + oldTHash + '` -> `' + tHash + '`.',
                   'The window slides: `' + text[s - 1] + '`\'s contribution is removed, `' + text[s + m - 1] + '` is added -- without rehashing from scratch, O(1): `' + oldTHash + '` -> `' + tHash + '`.'),
                 { c: [{ n: 13, note: T('devam', 'continue') }, { n: 14, note: T('s > 0? evet', 's > 0? yes') }, 15],
                   java: [{ n: 14, note: T('devam', 'continue') }, { n: 15, note: T('s > 0? evet', 's > 0? yes') }, 16] });
        }
        var sub = text.slice(s, s + m);
        if (tHash === pHash) {
          var diff = firstDiff(sub, pattern);
          if (diff === -1) {
            occ.push(s);
            lastTouched.forEach(function (idx) { S.set('t' + idx, { style: 'new' }); });
            S.set('dec2', { text: T('özetler eşit VE dizgiler özdeş -- GERÇEK eşleşme', 'hashes equal AND the strings are identical -- GENUINE match'), style: 'new' });
            S.step(T('`H(window) == H(pattern)` -- aday! Karakter karakter DOĞRULAMA: "' + sub + '" == "' + pattern + '" -- **gerçek eşleşme, s = ' + s + '**.',
                     '`H(window) == H(pattern)` -- a candidate! Character-by-character VERIFICATION: "' + sub + '" == "' + pattern + '" -- **genuine match at s = ' + s + '**.'),
                   { c: [{ n: 16, note: T('özet eşit VE strncmp==0? evet', 'hash equal AND strncmp==0? yes') }, 17], java: [{ n: 17, note: T('özet eşit VE eşleşme? evet', 'hash equal AND match? yes') }, 18] });
          } else {
            spur.push(s);
            lastTouched.forEach(function (idx) { S.set('t' + idx, { style: 'del' }); });
            S.set('dec2', { text: T('özetler tesadüfen eşit, ama dizgiler farklı -- SAHTE isabet', 'the hashes coincide, but the strings differ -- SPURIOUS hit'), style: 'del' });
            S.step(T('`H(window) == H(pattern)` -- aday, ama doğrulama başarısız: "' + sub + '" != "' + pattern + '" (konum ' + diff + '\'te ayrılıyor, `' + sub[diff] + '` != `' + pattern[diff] + '`) -- **sahte isabet**, sayılmaz.',
                     '`H(window) == H(pattern)` -- a candidate, but verification fails: "' + sub + '" != "' + pattern + '" (they diverge at position ' + diff + ', `' + sub[diff] + '` != `' + pattern[diff] + '`) -- **spurious hit**, does not count.'),
                   { c: [{ n: 16, note: T('özet eşit, ama strncmp!=0', 'hash equal, but strncmp != 0') }, { n: 17, skip: true }], java: [{ n: 17, note: T('özet eşit, ama eşleşmiyor', 'hash equal, but no match') }, { n: 18, skip: true }] });
          }
        } else {
          lastTouched.forEach(function (idx) { S.set('t' + idx, { style: 'dim' }); });
          S.set('dec2', { text: T('özetler farklı -- hiç karşılaştırma gerekmez', 'hashes differ -- no comparison needed at all'), style: 'dim' });
          S.step(T('`H(window) = ' + tHash + '` != `H(pattern) = ' + pHash + '` -- kesinlikle eşleşemez, hiçbir karakter karşılaştırılmaz.',
                   '`H(window) = ' + tHash + '` != `H(pattern) = ' + pHash + '` -- it cannot possibly match, not a single character is compared.'),
                 { c: [{ n: 16, note: T('özet eşit mi? hayır', 'hash equal? no') }, { n: 17, skip: true }], java: [{ n: 17, note: T('özet eşit mi? hayır', 'hash equal? no') }, { n: 18, skip: true }] });
        }
      }
      lastTouched.forEach(function (idx) { S.set('t' + idx, { style: 'normal' }); });
      S.at(null);
      S.set('dec', { text: '', style: 'normal' }); S.set('dec2', { text: '' });
      S.result = { occurrences: occ, spuriousHits: spur };
      S.step(T('Bitti: ' + (n - m + 1) + ' pencere denendi, ' + occ.length + ' gerçek eşleşme (' + (occ.length ? occ.join(', ') : T('yok', 'none')) + '), ' + spur.length + ' sahte isabet. Ortalama **O(n + m)**; kötü durumda (çok sahte isabet) O(n*m)\'e yaklaşabilir.',
               'Done: ' + (n - m + 1) + ' windows were tried, ' + occ.length + ' genuine match' + (occ.length === 1 ? '' : 'es') + ' (' + (occ.length ? occ.join(', ') : 'none') + '), ' + spur.length + ' spurious hit' + (spur.length === 1 ? '' : 's') + '. Average case **O(n + m)**; a worst case with many spurious hits can approach O(n*m).'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
