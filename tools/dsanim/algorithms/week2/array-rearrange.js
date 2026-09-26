/* Week 2 -- rearrange an array in place: every negative value ends up left of every non-negative value, using
 * two pointers that walk toward each other (the same shape as a quicksort partition). `left` skips values that
 * are already negative, `right` skips values that are already non-negative; when both stop, the two values swap.
 * Matches array_rearrange.c / ArrayRearrange.java (negatives before non-negatives). */
(function (D) {
  'use strict';
  var T = D.T;
  var C = [
    'void segregate(int arr[], int n) {',
    '    int left = 0, right = n - 1;',
    '    while (left < right) {',
    '        while (left < right && arr[left] < 0)',
    '            left++;                 /* already negative: leave it */',
    '        while (left < right && arr[right] >= 0)',
    '            right--;                /* already non-negative: leave it */',
    '        if (left < right) {',
    '            int tmp = arr[left];',
    '            arr[left] = arr[right];',
    '            arr[right] = tmp;',
    '            left++;',
    '            right--;',
    '        }',
    '    }',
    '}'
  ];
  var JAVA = [
    'static void segregate(int[] arr) {',
    '    int left = 0, right = arr.length - 1;',
    '    while (left < right) {',
    '        while (left < right && arr[left] < 0)',
    '            left++;                 // already negative: leave it',
    '        while (left < right && arr[right] >= 0)',
    '            right--;                // already non-negative: leave it',
    '        if (left < right) {',
    '            int tmp = arr[left];',
    '            arr[left] = arr[right];',
    '            arr[right] = tmp;',
    '            left++;',
    '            right--;',
    '        }',
    '    }',
    '}'
  ];
  var L_DECL = { c: [1, 2], java: [1, 2] };
  var L_ADV_L = { c: [4, 5], java: [4, 5] };
  var L_ADV_R = { c: [6, 7], java: [6, 7] };
  var L_SWAP = { c: [8, 9, 10, 11, 12, 13], java: [8, 9, 10, 11, 12, 13] };

  D.define({
    id: 'array-rearrange',
    title: T('Diziyi yeniden düzenleme: negatifler solda, negatif olmayanlar sağda', 'Array rearrangement: negatives left, non-negatives right'),
    code: { c: C, java: JAVA },
    presets: [
      { id: 'normal', level: 'normal', name: T('12 değer, karışık işaret', '12 values, mixed sign'), data: { arr: [12, -7, 5, -3, 9, -1, -8, 6, 15, -20, 3, -4] } },
      { id: 'hard', level: 'hard', name: T('15 değer, sıfırlar ve yinelenenler (0 negatif SAYILMAZ)', '15 values with zeros and duplicates (0 does NOT count as negative)'),
        data: { arr: [0, -5, 3, -5, 0, 8, -12, 0, 4, -3, 7, -7, 0, 9, -2] } },
      { id: 'all-negative', level: 'edge', name: T('Hepsi negatif: hiç takas gerekmez', 'All negative: no swap is ever needed'), data: { arr: [-3, -8, -1, -15, -22, -4, -9, -17, -2, -6] } },
      { id: 'all-nonnegative', level: 'edge', name: T('Hepsi negatif olmayan (0 dahil): hiç takas gerekmez', 'All non-negative (0 included): no swap is ever needed'), data: { arr: [4, 0, 9, 15, 2, 8, 0, 11, 6, 3] } },
      { id: 'already-segregated', level: 'edge', name: T('Zaten ayrılmış: işaretçiler takas etmeden çaprazlanır', 'Already segregated: the pointers cross without any swap'), data: { arr: [-5, -3, -8, -1, -9, 2, 4, 6, 8, 10, 12, 14] } }
    ],
    levels: ['easy', 'normal', 'hard', 'extreme'],
    size: function (d) { return d.arr.length; },
    /** Independent computation: the same two-pointer idea, but its own separately written loop (no call into build()). */
    reference: function (d) {
      var arr = d.arr.slice(), left = 0, right = arr.length - 1, swaps = 0;
      while (left < right) {
        while (left < right && arr[left] < 0) left++;
        while (left < right && arr[right] >= 0) right--;
        if (left < right) {
          var t = arr[left]; arr[left] = arr[right]; arr[right] = t;
          left++; right--; swaps++;
        }
      }
      return { arr: arr, swaps: swaps };
    },
    random: function (level, r) {
      var n = { easy: 10, normal: 12, hard: 14, extreme: 16 }[level];
      var lo = level === 'extreme' ? -500 : -99, hi = level === 'extreme' ? 500 : 99;
      var arr = []; for (var i = 0; i < n; i++) arr.push(D.randInt(r, lo, hi));
      return { arr: arr };
    },
    input: {
      hint: T('Örnek: 12 -7 5 -3 9 -1 -8 6 15 -20   (10+ tamsayı, negatif ve negatif olmayan karışık)', 'Example: 12 -7 5 -3 9 -1 -8 6 15 -20   (10+ integers, negative and non-negative mixed)'),
      parse: function (text) {
        var arr = D.parseInts(text);
        if (arr.length < 2) throw T('En az 2 sayı yazın.', 'Write at least 2 numbers.');
        if (arr.length > 30) throw T('En çok 30 sayı.', 'At most 30 numbers.');
        return { arr: arr };
      },
      format: function (d) { return d.arr.join(' '); },
      bad: ['', '5 x 7', '3.5', '1', '  ']
    },
    build: function (S, d) {
      var arr = d.arr.slice(), n = arr.length;
      var W = 54, H = 44, GAP = 6, X0 = 150, Y0 = 110;
      for (var i = 0; i < n; i++) S.box('a' + i, { x: X0 + i * (W + GAP), y: Y0, w: W, h: H, text: String(arr[i]), style: 'normal', size: 15, above: String(i) });
      S.label('rl', { x: X0 - 14, y: Y0 + H / 2 + 6, text: 'A =', anchor: 'end', bold: true, mono: true, size: 16 });
      var noteX = X0 + n * (W + GAP) + 14;
      S.label('note', { x: noteX, y: Y0 + H / 2 + 6, text: '', anchor: 'start', size: 14, bold: true, mono: true, style: 'dim' });
      S.step(T('İki işaretçi birbirine doğru yürür: `left` negatif değerleri atlar, `right` negatif olmayanları atlar. İkisi durunca, aradaki iki değer takas edilir.',
               'Two pointers walk toward each other: `left` skips negative values, `right` skips non-negative values. When both stop, the two values in between swap.'), L_DECL);

      var left = 0, right = n - 1, swaps = 0, iterCount = 0;
      function point() {
        if (S.has('lp')) S.set('lp', { target: 'a' + left }); else S.pointer('lp', { target: 'a' + left, text: 'left', side: 'top', dist: 34 });
        if (left <= right) { if (S.has('rp')) S.set('rp', { target: 'a' + right }); else S.pointer('rp', { target: 'a' + right, text: 'right', side: 'top', dist: 62 }); }
        else if (S.has('rp')) S.remove('rp');
      }
      function regions() {
        if (left > 0) { if (S.has('negb')) S.set('negb', { to: 'a' + (left - 1) }); else S.brace('negb', { from: 'a0', to: 'a' + (left - 1), text: T('negatif', 'negative'), side: 'bottom', dist: 14 }); }
        else if (S.has('negb')) S.remove('negb');
        if (right < n - 1) { if (S.has('posb')) S.set('posb', { from: 'a' + (right + 1) }); else S.brace('posb', { from: 'a' + (right + 1), to: 'a' + (n - 1), text: T('negatif değil', 'non-negative'), side: 'bottom', dist: 14 }); }
        else if (S.has('posb')) S.remove('posb');
      }
      point(); regions();

      while (left < right) {
        iterCount++;
        var detailed = iterCount === 1;
        while (left < right && arr[left] < 0) {
          S.set('a' + left, { style: 'dim' });
          S.at(left);
          left++;
          point(); regions();
          if (detailed) {
            S.set('note', { text: T('arr[left]<0, ilerle', 'arr[left]<0, advance') });
            S.step(T('`arr[left] < 0`: zaten yerinde, `left` bir ilerler.', '`arr[left] < 0`: already in place, `left` moves forward.'), L_ADV_L);
          }
        }
        while (left < right && arr[right] >= 0) {
          S.set('a' + right, { style: 'dim' });
          S.at(right);
          right--;
          point(); regions();
          if (detailed) {
            S.set('note', { text: T('arr[right]>=0, geri çekil', 'arr[right]>=0, pull back') });
            S.step(T('`arr[right] >= 0`: zaten yerinde, `right` bir geri çekilir.', '`arr[right] >= 0`: already in place, `right` moves back.'), L_ADV_R);
          }
        }
        if (left < right) {
          S.set('a' + left, { style: 'active' }); S.set('a' + right, { style: 'active' });
          S.at(left);
          if (detailed) {
            S.set('note', { text: T('takas!', 'swap!') });
            S.step(T('`arr[left]` (' + arr[left] + ') negatif değil ve `arr[right]` (' + arr[right] + ') negatif: ikisi takas edilecek.', '`arr[left]` (' + arr[left] + ') is non-negative and `arr[right]` (' + arr[right] + ') is negative: the two swap.'), L_SWAP);
          }
          var tmp = arr[left]; arr[left] = arr[right]; arr[right] = tmp;
          S.set('a' + left, { text: String(arr[left]), style: 'new' }); S.set('a' + right, { text: String(arr[right]), style: 'new' });
          swaps++;
          left++; right--;
          point(); regions();
          S.set('note', { text: T((iterCount) + '. takas tamam', (iterCount) + '. swap done') });
          S.step(T('takas edildi: `arr[' + (left - 1) + '] = ' + arr[left - 1] + '`, `arr[' + (right + 1) + '] = ' + arr[right + 1] + '`.', 'swapped: `arr[' + (left - 1) + '] = ' + arr[left - 1] + '`, `arr[' + (right + 1) + '] = ' + arr[right + 1] + '`.'), L_SWAP);
        }
      }
      S.at(null);
      if (S.has('lp')) S.remove('lp'); if (S.has('rp')) S.remove('rp');
      for (var z = 0; z < n; z++) S.set('a' + z, { style: 'normal' });
      S.set('note', { text: '' });
      S.result = { arr: arr.slice(), swaps: swaps };
      S.step(T('Bitti: ' + swaps + ' takas ile negatifler sola, negatif olmayanlar sağa toplandı: ' + arr.join(', ') + '. Tek geçişte O(n).',
               'Done: ' + swaps + ' swap' + (swaps === 1 ? '' : 's') + ' gathered the negatives on the left and the non-negatives on the right: ' + arr.join(', ') + '. A single O(n) pass.'));
    }
  });
})(typeof DSAnim !== 'undefined' ? DSAnim : require('../../web/scene.js'));
