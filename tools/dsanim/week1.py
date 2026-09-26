# -*- coding: utf-8 -*-
"""Week 1 -- Introduction to Data Structures: animations.

Usage (from the repo root):  py -3.12 tools/dsanim/week1.py [name ...]
Output: docs/week-1/anim/<name>.{json,html,tr.gif,en.gif,tr.png,en.png}

Animation names are English kebab-case; on-screen captions are bilingual (tr/en).
"""
import math
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from dsanim import Anim  # noqa: E402

KOK = pathlib.Path(__file__).resolve().parents[2]
CIKTI = KOK / 'docs' / 'week-1' / 'anim'


def T(tr, en):
    """Bilingual scene caption."""
    return {'tr': tr, 'en': en}


def _arr_sahne(a, values, x0=44, y0=150, w=50, h=44, gap=8, prefix='h'):
    """A row of boxes with index labels underneath -- one array."""
    for i, v in enumerate(values):
        a.kutu(f'{prefix}{i}', x0 + i * (w + gap), y0, str(v), w=w, h=h, kod=True)
        a.etiket(f'{prefix}i{i}', x0 + i * (w + gap) + w / 2, y0 + h + 18, f'[{i}]',
                  st='soluk', boyut=12, kod=True)


# ============================================================ 1. linear search
C_LINEAR = [
    'int linear_search(const int arr[], int n, int target, int *comparisons) {',
    '    for (int i = 0; i < n; i++) {',
    '        (*comparisons)++;',
    '        if (arr[i] == target)',
    '            return i;',
    '    }',
    '    return -1;',
    '}',
]
JAVA_LINEAR = [
    'static int linearSearch(int[] arr, int target) {',
    '    comparisons = 0;',
    '    for (int i = 0; i < arr.length; i++) {',
    '        comparisons++;',
    '        if (arr[i] == target)',
    '            return i;',
    '    }',
    '    return -1;',
    '}',
]
ARR10 = [4, 8, 15, 16, 23, 27, 31, 38, 42, 50]


def linear_search():
    a = Anim('linear-search', 'Linear search: counting comparisons', 'Linear search: counting comparisons',
              yuk=280, kod={'c': C_LINEAR, 'java': JAVA_LINEAR})
    _arr_sahne(a, ARR10)
    a.etiket('tgt', 610, 60, 'target = 4', boyut=18, kalin=True, kod=True)
    a.etiket('cnt', 610, 90, T('karşılaştırma: 0', 'comparisons: 0'), st='soluk', boyut=14)
    a.kare('On sayılık bir dizimiz var. `target = 4`\'ü arıyoruz. Doğrusal arama en baştan başlar, kutuları tek tek dener.',
           'We have an array of ten numbers. We are looking for `target = 4`. Linear search starts at the front and tries boxes one at a time.',
           {'c': 1, 'java': 1})
    a.isaretci('ip', 'h0', 'i', yon='alt')
    a.ayarla('h0', st='vurgu')
    a.ayarla('cnt', metin=T('karşılaştırma: 1', 'comparisons: 1'))
    a.kare('`arr[0] == 4`? Evet -- ilk karşılaştırmada bulduk. Bu **en iyi durum** (best case): O(1).',
           '`arr[0] == 4`? Yes -- found on the very first comparison. This is the **best case**: O(1).',
           {'c': [2, 3, 4, 5], 'java': [3, 4, 5, 6]})
    a.hepsi_st('normal', tur='kutu')
    a.sil('ip')
    a.ayarla('tgt', metin='target = 42')
    a.ayarla('cnt', metin=T('karşılaştırma: 0', 'comparisons: 0'))
    a.kare('Şimdi aynı diziden `42`\'yi arayalım -- dizinin sonlarına yakın bir değer.',
           'Now let us search the same array for `42` -- a value near the end of the array.', {'c': 1, 'java': 1})
    for i, v in enumerate(ARR10):
        a.isaretci('ip', f'h{i}', 'i', yon='alt')
        a.ayarla(f'h{i}', st='vurgu' if v != 42 else 'yeni')
        a.ayarla('cnt', metin=T(f'karşılaştırma: {i + 1}', f'comparisons: {i + 1}'))
        if v == 42:
            a.kare(f'`arr[{i}] == 42`? Evet -- {i + 1} karşılaştırmadan sonra bulundu.',
                   f'`arr[{i}] == 42`? Yes -- found after {i + 1} comparisons.', {'c': [2, 3, 4, 5], 'java': [3, 4, 5, 6]})
            break
        else:
            a.kare(f'`arr[{i}] == 42`? Hayır ({v} ≠ 42) -- bir sonraki kutuya geç.',
                   f'`arr[{i}] == 42`? No ({v} ≠ 42) -- move to the next box.', {'c': [2, 3, 4], 'java': [3, 4, 5]})
            a.ayarla(f'h{i}', st='soluk')
    a.sil('ip')
    a.kare('Sonuç: `4` 1 adımda, `42` 9 adımda bulundu. En kötü durumda (son eleman ya da dizide hiç yoksa) doğrusal arama tam `n = 10` karşılaştırma yapar: **O(n)**.',
           'Result: `4` took 1 step, `42` took 9 steps. In the worst case (last element, or not present at all) linear search makes all `n = 10` comparisons: **O(n)**.')
    return a


# ============================================================ 2. binary search
C_BINARY = [
    'int binary_search(const int arr[], int n, int target, int *comparisons) {',
    '    int lo = 0, hi = n - 1;',
    '    while (lo <= hi) {',
    '        int mid = lo + (hi - lo) / 2;',
    '        (*comparisons)++;',
    '        if (arr[mid] == target)',
    '            return mid;',
    '        if (arr[mid] < target)',
    '            lo = mid + 1;',
    '        else',
    '            hi = mid - 1;',
    '    }',
    '    return -1;',
    '}',
]
JAVA_BINARY = [
    'static int binarySearch(int[] arr, int target) {',
    '    comparisons = 0;',
    '    int lo = 0, hi = arr.length - 1;',
    '    while (lo <= hi) {',
    '        int mid = lo + (hi - lo) / 2;',
    '        comparisons++;',
    '        if (arr[mid] == target)',
    '            return mid;',
    '        if (arr[mid] < target)',
    '            lo = mid + 1;',
    '        else',
    '            hi = mid - 1;',
    '    }',
    '    return -1;',
    '}',
]


def binary_search():
    a = Anim('binary-search', 'Binary search: halving the range', 'Binary search: halving the range',
              yuk=300, kod={'c': C_BINARY, 'java': JAVA_BINARY})
    _arr_sahne(a, ARR10)
    a.etiket('tgt', 610, 60, 'target = 42', boyut=18, kalin=True, kod=True)
    a.etiket('cnt', 610, 90, T('karşılaştırma: 0', 'comparisons: 0'), st='soluk', boyut=14)
    a.etiket('rng', 610, 120, 'lo = 0, hi = 9', st='soluk', boyut=13, kod=True)
    a.cerceve('rango', 40, 140, 10 * 58 - 8, 62, st='soluk')
    a.kare('Dizi **sıralı**, bu yüzden akıllı olabiliriz: ortaya bakıp yarısını eleyebiliriz. Aynı `target = 42`\'yi arıyoruz -- doğrusal aramada 9 adım sürmüştü.',
           'The array is **sorted**, so we can be smart: check the middle and eliminate half. Same `target = 42` -- linear search needed 9 steps for it.',
           {'c': 1, 'java': 1})
    lo, hi = 0, 9
    isim = ['ilk', 'ikinci', 'üçüncü']
    isim_en = ['first', 'second', 'third']
    for k in range(3):
        mid = lo + (hi - lo) // 2
        a.hepsi_st('normal', tur='kutu')
        for i in range(lo, hi + 1):
            a.ayarla(f'h{i}', st='normal')
        a.ayarla('rng', metin=f'lo = {lo}, hi = {hi}')
        a.cerceve('rango', 44 + lo * 58 - 4, 140, (hi - lo + 1) * 58 - 4, 62, st='soluk')
        a.isaretci('mp', f'h{mid}', 'mid', yon='alt')
        a.kare(f'`mid = {lo} + ({hi} - {lo}) / 2 = {mid}`. Ortadaki kutuya bakıyoruz.',
               f'`mid = {lo} + ({hi} - {lo}) / 2 = {mid}`. We check the middle box.', {'c': [3, 4], 'java': [4, 5]})
        v = ARR10[mid]
        a.ayarla(f'h{mid}', st='vurgu' if v != 42 else 'yeni')
        a.ayarla('cnt', metin=T(f'karşılaştırma: {k + 1}', f'comparisons: {k + 1}'))
        if v == 42:
            a.kare(f'`arr[{mid}] == 42`? Evet -- {k + 1}. karşılaştırmada bulundu.',
                   f'`arr[{mid}] == 42`? Yes -- found on comparison {k + 1}.', {'c': [5, 6, 7], 'java': [6, 7, 8]})
            a.sil('mp')
            break
        elif v < 42:
            a.kare(f'`arr[{mid}] = {v} < 42` -- 42 varsa sağ yarıda olmalı. Sol yarıyı (indeks {lo}-{mid}) eleriz.',
                   f'`arr[{mid}] = {v} < 42` -- if 42 is here, it must be in the right half. We discard the left half (indices {lo}-{mid}).',
                   {'c': [5, 8, 9], 'java': [6, 9, 10]})
            lo = mid + 1
        else:
            a.kare(f'`arr[{mid}] = {v} > 42` -- sağ yarıyı eleriz.',
                   f'`arr[{mid}] = {v} > 42` -- we discard the right half.', {'c': [5, 8, 10, 11], 'java': [6, 9, 11, 12]})
            hi = mid - 1
        a.sil('mp')
    a.sil('rango')
    a.kare('Sonuç: `42`, dizinin **aynı** olduğu doğrusal aramada 9 adım sürerken burada yalnız **3** karşılaştırmada bulundu. Her adımda arama uzayı yarıya iner: **O(log n)**.',
           'Result: the **same** `42` that took 9 steps for linear search on the **same** array was found here in just **3** comparisons. Each step halves the search space: **O(log n)**.')
    return a


# ============================================================ 3. growth race
C_GROWTH = [
    'for (int i = 0; i < count; i++) {',
    '    long n = ns[i];',
    '    double nlogn = (double) n * log2((double) n);',
    '    double nsq = (double) n * (double) n;',
    '    printf("%10ld %16.0f %18.0f\\n", n, nlogn, nsq);',
    '}',
]
JAVA_GROWTH = [
    'for (long n : ns) {',
    '    double nlogn = n * (Math.log(n) / Math.log(2));',
    '    double nsq = (double) n * (double) n;',
    '    System.out.printf("%10d %16.0f %18.0f%n", n, nlogn, nsq);',
    '}',
]


def growth_race():
    a = Anim('growth-race', 'The growth race: n, n log n, n squared', 'The growth race: n, n log n, n squared',
              gen=520, yuk=270, kod={'c': C_GROWTH, 'java': JAVA_GROWTH})
    BASE = 220
    BARW = 76
    xs = {'n': 100, 'nlogn': 230, 'nsq': 360}
    ad = {'n': 'n', 'nlogn': 'n·log2(n)', 'nsq': 'n squared'}
    renk = {'n': 'normal', 'nlogn': 'aktif', 'nsq': 'vurgu'}
    for key in xs:
        a.kutu(key, xs[key], BASE - 4, '', w=BARW, h=4, st=renk[key], boyut=13)
        a.etiket(key + 'lbl', xs[key] + BARW / 2, BASE + 24, ad[key], boyut=14, kalin=True, kod=True)
        a.etiket(key + 'val', xs[key] + BARW / 2, BASE - 14, '0', boyut=13, kod=True)
    a.etiket('nlbl', 230, 30, 'n = ?', boyut=22, kalin=True, kod=True)
    SCALE = 160 / 1024

    def guncelle(n):
        nlogn = 0 if n <= 1 else n * math.log2(n)
        nsq = n * n
        for key, v in (('n', n), ('nlogn', nlogn), ('nsq', nsq)):
            hpx = max(4, round(v * SCALE))
            a.ayarla(key, y=BASE - hpx, h=hpx)
            a.ayarla(key + 'val', y=BASE - hpx - 14, metin=str(round(v)))
        a.ayarla('nlbl', metin=f'n = {n}')

    a.kare('Üç fonksiyonu yarıştıralım: `n`, `n·log2(n)` ve `n²`. Hepsi `n = 0`\'da sıfırdan başlıyor; her ikiye katlamada ne olacağını izleyelim.',
           'Let us race three functions: `n`, `n·log2(n)`, and `n²`. All three start at zero; watch what happens each time we double n.',
           {'c': [1, 2, 3, 4], 'java': [1, 2, 3]})
    adimlar = [
        (1, 'n = 1: üçü de neredeyse sıfır. `log2(1) = 0`, yani `n·log2(n)` de 0.',
            'n = 1: all three are almost zero. `log2(1) = 0`, so `n·log2(n)` is 0 too.'),
        (2, 'n = 2: `n·log2(n)` = 2·1 = 2, `n²` = 4. Hâlâ birbirine yakınlar.',
            'n = 2: `n·log2(n)` = 2*1 = 2, `n²` = 4. Still close together.'),
        (4, 'n = 4: `n²` = 16, `n·log2(n)` = 8 -- `n²` şimdiden iki katı.',
            'n = 4: `n²` = 16, `n·log2(n)` = 8 -- `n²` is already twice as large.'),
        (8, 'n = 8: `n²` = 64 belirgin biçimde öne geçti; düz `n` hâlâ küçük kalıyor.',
            'n = 8: `n²` = 64 has clearly pulled ahead; plain `n` stays small.'),
        (16, 'n = 16: `n²` = 256, `n·log2(n)` = 64, `n` = 16 -- fark artık gözle görülüyor.',
             'n = 16: `n²` = 256, `n·log2(n)` = 64, `n` = 16 -- the gap is now visible at a glance.'),
        (32, 'n = 32: `n²` = 1024 çubuğu doldurdu; `n·log2(n)` = 160; `n` neredeyse düz bir çizgi gibi kaldı. n\'i ikiye katlayınca `n²` **dört** katına çıkar -- O(n²)\'nin imzası budur.',
             'n = 32: `n²` = 1024 fills the bar; `n·log2(n)` = 160; plain `n` looks almost flat. Doubling n makes `n²` go up by a factor of **four** -- that is the signature of O(n²).'),
    ]
    for n, tr, en in adimlar:
        guncelle(n)
        a.kare(tr, en, {'c': [1, 2, 3, 4, 5], 'java': [1, 2, 3, 4]})
    a.kare('Aynı fikir gerçek sayılarla: `growth_table.c` n = 100000 için `n·log2(n)` ≈ 1.66 milyon, `n²` = 10 milyar yazdırıyor. Bir O(n²) algoritması küçük girdilerde sorunsuz görünür, gerçek boyutlarda kullanılamaz hâle gelir.',
           'The same idea with real numbers: `growth_table.c` prints `n·log2(n)` ≈ 1.66 million but `n²` = 10 billion for n = 100000. An O(n²) algorithm looks fine on tiny inputs and becomes unusable at real sizes.')
    return a


# ============================================================ 4. pointer basics
C_POINTER = [
    'int x = 3;',
    'int *p = &x;',
    '',
    'printf("x = %d, stored at address %p\\n", x, (void *) &x);',
    'printf("p = %p (p holds the address of x)\\n", (void *) p);',
    'printf("*p = %d (dereferencing p reads the value at that address)\\n", *p);',
    '',
    '*p = 5;',
    'printf("after *p = 5: x = %d\\n", x);',
]
JAVA_POINTER = [
    'int x = 3;                 // a plain int: the VALUE 3 is stored directly',
    'int[] box = {3};           // an array: box is a REFERENCE to a one-element block',
    '',
    'System.out.println("x = " + x);',
    'System.out.println("box[0] = " + box[0] + " (box holds a reference to the array)");',
    '',
    'int[] alias = box;         // alias refers to the SAME array as box, not a copy',
    'alias[0] = 5;               // writing through alias is visible through box too',
    'System.out.println("after alias[0] = 5: box[0] = " + box[0]);',
]


def pointer_basics():
    a = Anim('pointer-basics', 'A variable, its address, and a pointer', 'A variable, its address, and a pointer',
              gen=560, yuk=260, kod={'c': C_POINTER, 'java': JAVA_POINTER})
    a.kutu('x', 130, 140, '3', w=76, h=52, ust='int x', alt='&x = 1000', boyut=20)
    a.kare('`int x = 3;` -- x sıradan bir kutu: 3 değerini tutuyor, belleğin bir yerinde (burada 1000 diyelim) oturuyor.',
           '`int x = 3;` -- x is an ordinary box holding 3, sitting somewhere in memory (let us call it address 1000).',
           {'c': 1, 'java': 1})
    a.kutu('p', 360, 140, '?', w=76, h=52, ust='int *p', st='bos', boyut=20)
    a.kare('`int *p;` -- p farklı türde bir kutu: bir SAYI değil, bir ADRES tutacak.',
           '`int *p;` -- p is a different kind of box: it will hold an ADDRESS, not an ordinary number.',
           {'c': 2, 'java': 2})
    a.ayarla('p', metin='1000', st='vurgu')
    a.ok('arr1', 'p', 'x', tur='merkez')
    a.kare('`p = &x;` -- `&x` "x\'in adresi" demek. Bu adres p\'nin içine yazılır. Artık p, x\'i **gösteriyor**.',
           '`p = &x;` -- `&x` means "the address of x". That address is written into p. Now p **points to** x.',
           {'c': 2, 'java': 7})
    a.ayarla('x', st='vurgu')
    a.kare('`printf("%d", x)` -- x\'i doğrudan okur: 3.',
           '`printf("%d", x)` -- reads x directly: 3.', {'c': 4, 'java': 4})
    a.ayarla('x', st='normal')
    a.ayarla('p', st='vurgu')
    a.ayarla('arr1', st='vurgu')
    a.kare('`*p` -- p\'yi DEREFERANSLAMAK demek: oku, p\'nin gösterdiği kutuya git, oradaki değeri al: 3. Aynı değer, iki farklı yoldan.',
           '`*p` -- to DEREFERENCE p: follow the arrow to the box p points to, and read the value there: 3. Same value, reached two different ways.',
           {'c': 6, 'java': 5})
    a.ayarla('x', metin='5', st='yeni')
    a.ayarla('p', st='normal')
    a.ayarla('arr1', st='normal')
    a.kare("`*p = 5;` -- p'nin gösterdiği adrese YAZ: x'in kutusuna git, 5 yaz. Biz hiç `x = 5` yazmadık.",
           '`*p = 5;` -- write THROUGH p: go to the address p holds, and store 5 there. We never wrote `x = 5` directly.',
           {'c': 8, 'java': 8})
    a.ayarla('x', st='vurgu')
    a.etiket('l1', 560 // 2, 230, '&x  ->  x\'in adresi', st='soluk', boyut=13, kod=True)
    a.etiket('l2', 560 // 2, 250, '*p  ->  p\'nin gösterdiği kutudaki değer', st='soluk', boyut=13, kod=True)
    a.kare('`x` şimdi 5 -- çünkü p ve x, aynı kutuya işaret eden iki farklı isim. Java\'da ham `&`/`*` yok, ama bir dizi ya da nesne değişkeni zaten bir REFERANS taşır (Java sekmesine bak).',
           '`x` is now 5 -- because p and x refer to the very same box. Java has no raw `&`/`*`, but an array or object variable already carries a REFERENCE (see the Java tab).',
           {'c': 9, 'java': 9})
    return a


# ============================================================ 5. pointer to struct
C_STRUCT_PTR = [
    'typedef struct Point {',
    '    int x;',
    '    int y;',
    '} Point;',
    '',
    'Point a = {3, 4};',
    'Point *p = &a;',
    '',
    'printf("a = (%d, %d)\\n", a.x, a.y);',
    'printf("(*p).x = %d, p->x = %d (same value, -> is shorthand)\\n", (*p).x, p->x);',
    '',
    'p->x = 10;',
    'printf("after p->x = 10: a = (%d, %d)\\n", a.x, a.y);',
]
JAVA_STRUCT_PTR = [
    'static class Point {',
    '    int x;',
    '    int y;',
    '    Point(int x, int y) { this.x = x; this.y = y; }',
    '}',
    '',
    'Point a = new Point(3, 4);',
    'Point p = a;                // p is another reference to the SAME object as a',
    '',
    'System.out.println("a = (" + a.x + ", " + a.y + ")");',
    'System.out.println("p.x = " + p.x + " (same object as a, reached through p)");',
    '',
    'p.x = 10;',
    'System.out.println("after p.x = 10: a = (" + a.x + ", " + a.y + ")");',
]


def struct_pointer():
    a = Anim('struct-pointer', 'A pointer to a struct, and ->', 'A pointer to a struct, and ->',
              gen=560, yuk=260, kod={'c': C_STRUCT_PTR, 'java': JAVA_STRUCT_PTR})
    a.cerceve('grp', 100, 120, 140, 90, baslik='a : Point')
    a.kutu('ax', 112, 150, '3', w=54, h=44, ust='x', boyut=18)
    a.kutu('ay', 172, 150, '4', w=54, h=44, ust='y', boyut=18)
    a.kare('Bir `Point` iki alandan oluşur: `x` ve `y`. `a` bunlardan biri, x = 3, y = 4 ile.',
           'A `Point` has two fields: `x` and `y`. `a` is one such Point, with x = 3, y = 4.', {'c': [1, 2, 3, 4, 6], 'java': [1, 2, 3, 4, 5, 7]})
    a.kutu('p', 380, 150, '&a', w=64, h=44, ust='Point *p', st='vurgu', boyut=16)
    a.ok('arr', 'p', 'grp', tur='merkez')
    a.kare('`Point *p = &a;` -- p, a\'nın adresini tutan bir işaretçi. Artık a\'ya p üzerinden de ulaşabiliriz.',
           '`Point *p = &a;` -- p is a pointer holding the address of a. We can now reach a through p too.', {'c': 7, 'java': 8})
    a.ayarla('ax', st='vurgu')
    a.kare('`(*p).x` -- önce p\'yi izle (parantezler bunu zorunlu kılar), sonra `.x` alanını al: 3.',
           '`(*p).x` -- first follow p (the parentheses force this order), then take the `.x` field: 3.', {'c': 9, 'java': 10})
    a.kare('`p->x` -- tam olarak aynı şey, sadece daha kısa yazımı. `->`, `(*p).`\'nin kestirmesidir.',
           '`p->x` -- exactly the same thing, just shorter to write. `->` is shorthand for `(*p).`.', {'c': 9, 'java': 11})
    a.ayarla('ax', metin='10', st='yeni')
    a.ayarla('p', metin='&a')
    a.kare('`p->x = 10;` -- p üzerinden yazmak, a\'nın kendisini değiştirir. Bellekte tek bir Point var; p ona başka bir kapıdan giriyor.',
           '`p->x = 10;` -- writing through p changes a itself. There is only one Point in memory; p just reaches it through another door.', {'c': 12, 'java': 12})
    a.ayarla('ax', st='vurgu')
    a.kare('Sonuç: `a = (10, 4)`. Java\'da `->` yok çünkü zaten HER nesne değişkeni bir referans: `p.x` yeterli (Java sekmesine bak).',
           'Result: `a = (10, 4)`. Java has no `->` because every object variable is already a reference: `p.x` is enough (see the Java tab).', {'c': 13, 'java': 13})
    return a


# ============================================================ 6. stack vs heap
C_STACK_HEAP = [
    'static void show_frame(int depth) {',
    '    int local = depth * 10;  /* a fresh local variable in THIS call\'s stack frame */',
    '    printf("depth %d: local = %d, stored at %p\\n", depth, local, (void *) &local);',
    '    if (depth < 3)',
    '        show_frame(depth + 1);',
    '}',
    '',
    'int main(void) {',
    '    printf("-- stack: one frame per call, freed automatically on return --\\n");',
    '    show_frame(0);',
    '',
    '    printf("\\n-- heap: a block we must ask for and give back ourselves --\\n");',
    '    int *block = malloc(3 * sizeof(int));',
    '    if (block == NULL) {',
    '        printf("malloc failed\\n");',
    '        return 1;',
    '    }',
    '    for (int i = 0; i < 3; i++)',
    '        block[i] = (i + 1) * 100;',
    '    printf("block = %p, block[0..2] = %d %d %d\\n",',
    '           (void *) block, block[0], block[1], block[2]);',
    '',
    '    free(block);',
    '    block = NULL;   /* good practice: a NULL pointer cannot be a dangling pointer */',
    '    printf("freed and set to NULL: block = %p\\n", (void *) block);',
    '',
    '    return 0;',
    '}',
]
JAVA_STACK_HEAP = [
    'static void showFrame(int depth) {',
    '    int local = depth * 10;   // a fresh local variable in THIS call\'s frame',
    '    System.out.println("depth " + depth + ": local = " + local);',
    '    if (depth < 3)',
    '        showFrame(depth + 1);',
    '}',
    '',
    'public static void main(String[] args) {',
    '    System.out.println("-- call frames: same idea as C, one per active call --");',
    '    showFrame(0);',
    '',
    '    System.out.println();',
    '    System.out.println("-- heap: `new` allocates, nothing frees it by hand --");',
    '    int[] block = new int[3];',
    '    for (int i = 0; i < block.length; i++)',
    '        block[i] = (i + 1) * 100;',
    '    System.out.println("block[0..2] = " + block[0] + " " + block[1] + " " + block[2]);',
    '',
    '    block = null;   // drop the only reference: the array is now eligible for GC',
    '    System.out.println("reference dropped: block = " + block);',
    '}',
]


def stack_vs_heap():
    a = Anim('stack-vs-heap', 'Stack frames vs a heap block', 'Stack frames vs a heap block',
              gen=760, yuk=340, kod={'c': C_STACK_HEAP, 'java': JAVA_STACK_HEAP})
    X, Y0, H = 170, 300, 46
    a.cerceve('cy', X - 130, 20, 280, 300, baslik=T('çağrı yığını', 'call stack'))
    a.kutu('main', X, Y0 - H, 'main()', w=230, h=H - 8, boyut=15)
    a.kare('Her fonksiyon çağrısı çağrı yığınına bir **çerçeve** iter: kendi yerel değişkenleriyle. `main` başladı.',
           'Every function call pushes a **frame** onto the call stack, with its own local variables. `main` has started.',
           {'c': [8, 9], 'java': [8, 9]})
    for k, depth in enumerate((0, 1, 2, 3)):
        fid = f'f{depth}'
        a.kutu(fid, X, Y0 - (k + 2) * H, f'show_frame({depth}): local = {depth * 10}', w=230, h=H - 8, st='yeni', boyut=13)
        if depth < 3:
            a.kare(f'`show_frame({depth})` çağrıldı: yeni bir çerçeve itilir. `local = {depth * 10}`, bu çerçeveye ÖZEL -- her çağrının kendi kopyası var.',
                   f'`show_frame({depth})` is called: a new frame is pushed. `local = {depth * 10}` belongs ONLY to this frame -- every call gets its own copy.',
                   {'c': [2, 4, 5], 'java': [2, 4, 5]})
        else:
            a.ayarla(fid, st='vurgu')
            a.kare('`show_frame(3)`: `depth < 3` artık yanlış, yeni çağrı yapılmaz. Zincirin sonuna geldik.',
                   '`show_frame(3)`: `depth < 3` is now false, no further call is made. We have reached the end of the chain.',
                   {'c': [2, 3, 4], 'java': [2, 3, 4]})
    for depth in (3, 2, 1, 0):
        a.sil(f'f{depth}')
    a.kare('Her çağrı bitince çerçevesi yığından çekilir -- en son itilen, en önce çıkar (LIFO). Yerel değişkenler otomatik olarak yok olur.',
           'As each call finishes, its frame is popped -- last pushed, first out (LIFO). Local variables simply vanish automatically.',
           {'c': [6], 'java': [6]})
    a.cerceve('hf', 420, 60, 260, 160, baslik=T('öbek (heap)', 'heap'))
    a.kutu('c0', 450, 120, '?', w=44, h=44, st='bos', boyut=15)
    a.kutu('c1', 500, 120, '?', w=44, h=44, st='bos', boyut=15)
    a.kutu('c2', 550, 120, '?', w=44, h=44, st='bos', boyut=15)
    a.isaretci('bp', 'c0', 'block', yon='ust')
    a.kare('`malloc(3 * sizeof(int))` öbekten 3 int\'lik yer ister ve ilk hücrenin adresini döndürür. `block` bu adresi tutar. Bu yer, fonksiyon dönse de KENDİLİĞİNDEN geri alınmaz.',
           '`malloc(3 * sizeof(int))` asks the heap for room for 3 ints and returns the address of the first cell. `block` stores that address. This memory is NOT reclaimed automatically when a function returns.',
           {'c': [12, 13], 'java': [13, 14]})
    a.ayarla('c0', metin='100', st='yeni')
    a.ayarla('c1', metin='200', st='yeni')
    a.ayarla('c2', metin='300', st='yeni')
    a.kare('Hücreleri dolduruyoruz: 100, 200, 300.', 'We fill the cells in: 100, 200, 300.', {'c': [17, 18], 'java': [14, 15]})
    a.hepsi_st('sil', tur='kutu')
    a.ayarla('main', st='normal')
    a.etiket('dang', 480, 210, T('sarkan işaretçi!', 'dangling pointer!'), st='sil', boyut=15, kalin=True)
    a.kare('`free(block);` -- öbek bu üç hücreyi geri alır. Ama `block` DEĞİŞMEDİ: hâlâ eski adresi tutuyor. Onu şu an kullanmak TANIMSIZ DAVRANIŞ (undefined behavior) olurdu -- bir **sarkan işaretçi** (dangling pointer).',
           '`free(block);` gives these three cells back to the heap. But `block` itself is UNCHANGED: it still holds the old address. Using it now would be UNDEFINED BEHAVIOR -- a **dangling pointer**.',
           {'c': [22]})
    a.sil('c0', 'c1', 'c2', 'bp', 'dang')
    a.etiket('nullbox', 472, 145, 'block = NULL', boyut=16, kalin=True, kod=True)
    a.kare('`block = NULL;` -- serbest bıraktıktan HEMEN sonra. NULL asla sarkan olamaz; yanlışlıkla kullanılırsa program güvenle ve gürültülü biçimde çöker, sessizce belleği bozmaz.',
           '`block = NULL;` -- immediately after freeing. NULL can never be dangling; an accidental use crashes loudly and safely instead of silently corrupting memory.',
           {'c': [23], 'java': [19]})
    a.kare('Java sekmesine bakın: `new int[3]` de öbekte yer ayırır, ama `free` diye bir şey yoktur. Referans bırakıldığında (`block = null`) çöp toplayıcı (garbage collector) bloğu kendi zamanında geri alır -- sarkan işaretçi Java\'da mümkün bile değildir.',
           'Check the Java tab: `new int[3]` allocates on the heap too, but there is no `free` at all. Once the reference is dropped (`block = null`), the garbage collector reclaims the block on its own schedule -- a dangling pointer is not even possible in Java.',
           {'java': [19, 20]})
    return a


# ============================================================ 7. java reference + GC
JAVA_REF_ALIAS = [
    'Counter a = new Counter(1);',
    'Counter b = a;              // b is an ALIAS: same object, not a copy',
    '',
    'System.out.println("a.value = " + a.value + ", b.value = " + b.value);',
    'System.out.println("a and b refer to the same object: " + (a == b));',
    '',
    'b.value = 99;                // changing through b is visible through a too',
    'System.out.println("after b.value = 99: a.value = " + a.value);',
    '',
    'a = null;                    // one reference gone; still reachable through b',
    'System.out.println("a = " + a + ", b.value = " + b.value);',
    '',
    'b = null;                    // last reference gone: now eligible for GC',
    'System.out.println("b = " + b + " (the Counter object has no reachable reference left)");',
]
C_LEAK = [
    'int *a = malloc(sizeof(int));',
    '*a = 1;',
    'printf("a = %p, *a = %d\\n", (void *) a, *a);',
    '',
    'int *b = a;               /* b is an ALIAS: same block, not a copy */',
    'printf("a and b point to the same block: %s\\n", (a == b) ? "true" : "false");',
    '',
    '*b = 99;                  /* writing through b is visible through a too */',
    'printf("after *b = 99: *a = %d\\n", *a);',
    '',
    '/* Correct order: free the block through one of the aliases, THEN clear both. */',
    'free(a);',
    'a = NULL;',
    'b = NULL;                 /* free() does not clear pointers for you -- we must */',
    'printf("freed and cleared: a = %p, b = %p\\n", (void *) a, (void *) b);',
]


def java_reference_heap():
    a = Anim('java-reference-heap', 'Java references, aliasing, and GC', 'Java references, aliasing, and GC',
              gen=560, yuk=260, kod={'c': C_LEAK, 'java': JAVA_REF_ALIAS})
    a.kutu('obj', 320, 140, 'value = 1', w=130, h=56, ust='Counter', st='yeni', boyut=16)
    a.isaretci('a', 'obj', 'a', yon='sol')
    a.kare('`new Counter(1)` öbekte bir nesne yaratır. `a` ona işaret eder.',
           '`new Counter(1)` creates one object on the heap. `a` points to it.', {'c': [1, 2], 'java': [1]})
    a.isaretci('b', 'obj', 'b', yon='sag')
    a.kare('`Counter b = a;` -- b bir KOPYA değil, aynı nesneye ikinci bir referans. İkisi de aynı kutuyu gösteriyor.',
           '`Counter b = a;` -- b is not a COPY, it is a second reference to the same object. Both point to the same box.', {'c': [5], 'java': [2]})
    a.ayarla('obj', st='vurgu')
    a.kare('`a.value` ve `b.value` -- ikisi de 1 okur, çünkü tek bir nesne var.',
           '`a.value` and `b.value` -- both read 1, because there is only one object.', {'c': [3, 6], 'java': [4, 5]})
    a.ayarla('obj', metin='value = 99', st='yeni')
    a.kare('`b.value = 99;` -- b üzerinden değiştirmek, nesnenin KENDİSİNİ değiştirir.',
           '`b.value = 99;` -- changing through b changes the object ITSELF.', {'c': [8], 'java': [7]})
    a.ayarla('obj', st='vurgu')
    a.kare('`a.value` şimdi de 99 okur -- a ve b hâlâ aynı nesneyi gösteriyor.',
           '`a.value` now also reads 99 -- a and b still point to the very same object.', {'c': [9], 'java': [8]})
    a.sil('a')
    a.kare('`a = null;` -- a artık hiçbir şeyi göstermiyor. Nesne YAŞIYOR, çünkü b hâlâ ona ulaşıyor.',
           '`a = null;` -- a no longer points to anything. The object is STILL ALIVE, because b can still reach it.', {'java': [10]})
    a.sil('b')
    a.ayarla('obj', st='sil')
    a.kare('`b = null;` -- son referans da gitti. Artık nesneye ulaşan HİÇBİR yol yok: çöp toplayıcının (garbage collector) adayı oldu.',
           '`b = null;` -- the last reference is gone too. There is now NO way to reach the object: it becomes a candidate for the garbage collector.', {'java': [13]})
    a.sil('obj')
    a.kare('Java\'da hiçbir zaman `free()` çağırmadık; çöp toplayıcı erişilemeyen nesneleri kendi zamanında temizler. C sekmesine bakın: orada aynı senaryoyu ELLE yönetmek gerekir -- `free` edip HER İKİ takma adı da NULL yapmazsanız, blok sonsuza dek sızar (leak), ama asla çökmez de.',
           'We never called `free()` in Java; the garbage collector sweeps unreachable objects on its own schedule. Check the C tab: there, the same scenario must be managed BY HAND -- free it and NULL out BOTH aliases, or the block leaks forever without ever crashing.',
           {'c': [11, 12, 13, 14, 15]})
    return a


# ============================================================ 8. TLV encoding
C_TLV = [
    '#define TAG_INTEGER    0x02',
    '#define TAG_UTF8STRING 0x0C',
    '#define TAG_SEQUENCE   0x30   /* universal class, constructed, tag number 16 */',
    '',
    'static int encode_tlv(unsigned char *out, unsigned char tag, const unsigned char *value, int len) {',
    '    out[0] = tag;',
    '    out[1] = (unsigned char) len;    /* short form: length < 128 fits in one byte */',
    '    memcpy(out + 2, value, (size_t) len);',
    '    return 2 + len;',
    '}',
    '',
    'static void print_bytes(const char *label, const unsigned char *buf, int len) {',
    '    printf("%s (%d bytes):", label, len);',
    '    for (int i = 0; i < len; i++)',
    '        printf(" %02X", buf[i]);',
    '    printf("\\n");',
    '}',
    '',
    'int main(void) {',
    '    unsigned char name_tlv[16], age_tlv[16], record[32], content[32];',
    '    const unsigned char name_value[] = "Rex";',
    '    unsigned char age_value = 5;',
    '',
    '    int name_len = encode_tlv(name_tlv, TAG_UTF8STRING, name_value, 3);',
    '    print_bytes("name TLV ", name_tlv, name_len);',
    '',
    '    int age_len = encode_tlv(age_tlv, TAG_INTEGER, &age_value, 1);',
    '    print_bytes("age TLV  ", age_tlv, age_len);',
    '',
    '    memcpy(content, name_tlv, (size_t) name_len);',
    '    memcpy(content + name_len, age_tlv, (size_t) age_len);',
    '    int content_len = name_len + age_len;',
    '',
    '    int record_len = encode_tlv(record, TAG_SEQUENCE, content, content_len);',
    '    print_bytes("SEQUENCE ", record, record_len);',
    '',
    '    return 0;',
    '}',
]
JAVA_TLV = [
    'public class TlvEncoding {',
    '    static final int TAG_INTEGER = 0x02;',
    '    static final int TAG_UTF8STRING = 0x0C;',
    '    static final int TAG_SEQUENCE = 0x30;   // universal class, constructed, tag number 16',
    '',
    '    static byte[] encodeTlv(int tag, byte[] value) {',
    '        ByteArrayOutputStream out = new ByteArrayOutputStream();',
    '        out.write(tag);',
    '        out.write(value.length);            // short form: length < 128 fits in one byte',
    '        out.writeBytes(value);',
    '        return out.toByteArray();',
    '    }',
    '',
    '    static String toHex(byte[] bytes) {',
    '        StringBuilder sb = new StringBuilder();',
    '        for (byte b : bytes)',
    '            sb.append(String.format("%02X ", b));',
    '        return sb.toString().trim();',
    '    }',
    '',
    '    public static void main(String[] args) {',
    '        byte[] nameTlv = encodeTlv(TAG_UTF8STRING, "Rex".getBytes(StandardCharsets.UTF_8));',
    '        System.out.println("name TLV  (" + nameTlv.length + " bytes): " + toHex(nameTlv));',
    '',
    '        byte[] ageTlv = encodeTlv(TAG_INTEGER, new byte[] {5});',
    '        System.out.println("age TLV   (" + ageTlv.length + " bytes): " + toHex(ageTlv));',
    '',
    '        ByteArrayOutputStream content = new ByteArrayOutputStream();',
    '        content.writeBytes(nameTlv);',
    '        content.writeBytes(ageTlv);',
    '',
    '        byte[] record = encodeTlv(TAG_SEQUENCE, content.toByteArray());',
    '        System.out.println("SEQUENCE  (" + record.length + " bytes): " + toHex(record));',
    '    }',
    '}',
]


def tlv_encoding():
    a = Anim('tlv-encoding', 'TLV encoding: SEQUENCE of name and age', 'TLV encoding: SEQUENCE of name and age',
              gen=560, yuk=280, kod={'c': C_TLV, 'java': JAVA_TLV})
    X0, SW, BY = 60, 38, 150

    def sx(i):
        return X0 + i * SW

    def bayt(i, hexval, alt):
        a.kutu(f'b{i}', sx(i), BY, hexval, w=34, h=38, alt=alt, boyut=15, kod=True)

    a.etiket('rec1', 300, 50, 'name = "Rex"', boyut=16, kod=True)
    a.etiket('rec2', 300, 76, 'age = 5', boyut=16, kod=True)
    a.kare('Bu küçük kaydı bayt dizisi olarak göndermek istiyoruz. TLV fikri basit: her alana bir **Etiket** (Tag), bir **Uzunluk** (Length) ve bir **Değer** (Value) veririz.',
           'We want to send this small record as a byte sequence. The TLV idea is simple: give every field a **Tag**, a **Length**, and a **Value**.',
           {'c': [1, 2, 3], 'java': [2, 3, 4]})
    bayt(2, '0C', 'Tag')
    a.kare('`name` bir UTF8String. Evrensel sınıfta UTF8String\'in etiket numarası 12 = `0x0C`.',
           '`name` is a UTF8String. In the universal class, UTF8String has tag number 12 = `0x0C`.', {'c': [6], 'java': [8]})
    bayt(3, '03', 'Len')
    a.kare('"Rex" tam 3 bayt -- uzunluk baytı `0x03` (kısa biçim: 128\'den küçük uzunluklar tek bayta sığar).',
           '"Rex" is exactly 3 bytes -- the length byte is `0x03` (short form: lengths under 128 fit in one byte).', {'c': [7], 'java': [9]})
    bayt(4, '52', 'R')
    bayt(5, '65', 'e')
    bayt(6, '78', 'x')
    a.kare('Değer baytları: "Rex" harflerinin UTF-8 kodları, `0x52 0x65 0x78`.',
           'Value bytes: the UTF-8 codes of the letters in "Rex": `0x52 0x65 0x78`.', {'c': [8], 'java': [10]})
    a.cerceve('nameg', sx(2) - 6, BY - 8, 5 * SW - 2, 56, baslik=T('name TLV (5 bayt)', 'name TLV (5 bytes)'))
    a.kare('`name` alanı tamamlandı: 5 baytlık bir TLV -- Tag, Len, Value.',
           'The `name` field is complete: a 5-byte TLV -- Tag, Len, Value.', {'c': [24, 25], 'java': [22, 23]})
    bayt(7, '02', 'Tag')
    a.kare('`age` bir INTEGER. INTEGER\'in etiket numarası 2 = `0x02`.',
           '`age` is an INTEGER. INTEGER has tag number 2 = `0x02`.', {'c': [6], 'java': [8]})
    bayt(8, '01', 'Len')
    a.kare('Değer tek bayta sığıyor -- uzunluk `0x01`.', 'The value fits in a single byte -- length `0x01`.', {'c': [7], 'java': [9]})
    bayt(9, '05', 'age=5')
    a.kare('Değer: 5, doğrudan `0x05`.', 'Value: 5, directly `0x05`.', {'c': [8], 'java': [10]})
    a.cerceve('ageg', sx(7) - 6, BY - 8, 3 * SW - 2, 56, baslik=T('age TLV (3 bayt)', 'age TLV (3 bytes)'))
    a.kare('`age` alanı da tamamlandı: 3 baytlık bir TLV.', 'The `age` field is complete too: a 3-byte TLV.', {'c': [27, 28], 'java': [25, 26]})
    bayt(0, '30', 'SEQ')
    a.kare('İki alanı bir **SEQUENCE** içine sarıyoruz: evrensel sınıf, constructed (içinde başka TLV\'ler barındırır), etiket numarası 16 = `0x30`.',
           'We wrap both fields in a **SEQUENCE**: universal class, constructed (it contains other TLVs), tag number 16 = `0x30`.',
           {'c': [30, 31, 32, 34], 'java': [28, 29, 30, 32]})
    bayt(1, '08', 'Len')
    a.kare('SEQUENCE\'in uzunluğu, içeriğinin toplamı: 5 + 3 = **8** bayt. Kendi Tag/Len baytlarını SAYMAZ.',
           "The SEQUENCE's length is the total of its content: 5 + 3 = **8** bytes. It does NOT count its own Tag/Len bytes.",
           {'c': [6, 7], 'java': [8, 9]})
    a.cerceve('seqg', sx(0) - 6, BY - 36, 10 * SW - 2, 92, baslik=T('SEQUENCE (10 bayt)', 'SEQUENCE (10 bytes)'))
    a.kare('Sonuç, tam olarak programın yazdırdığı gibi: `30 08 0C 03 52 65 78 02 01 05` -- 10 bayt, tele gönderilmeye hazır.',
           'The result, exactly as the program prints it: `30 08 0C 03 52 65 78 02 01 05` -- 10 bytes, ready to send over the wire.',
           {'c': [35], 'java': [33]})
    return a


# ============================================================ 9. array vs linked (preview)
C_ARR_LINK = [
    'typedef struct Node {',
    '    int data;',
    '    struct Node *next;',
    '} Node;',
    '',
    'int main(void) {',
    '    int arr[5] = {10, 20, 30, 40, 50};',
    '',
    '    printf("array (contiguous):\\n");',
    '    for (int i = 0; i < 5; i++)',
    '        printf("  arr[%d] = %d at %p\\n", i, arr[i], (void *) &arr[i]);',
    '',
    '    Node *head = NULL;',
    '    for (int i = 4; i >= 0; i--) {',
    '        Node *n = malloc(sizeof(Node));',
    '        n->data = arr[i];',
    '        n->next = head;',
    '        head = n;',
    '    }',
    '',
    '    printf("\\nlinked list (scattered, connected by pointers):\\n");',
    '    for (Node *n = head; n != NULL; n = n->next)',
    '        printf("  node at %p: data = %d, next = %p\\n", (void *) n, n->data, (void *) n->next);',
    '',
    '    for (Node *n = head; n != NULL;) {',
    '        Node *tmp = n;',
    '        n = n->next;',
    '        free(tmp);',
    '    }',
    '',
    '    return 0;',
    '}',
]
JAVA_ARR_LINK = [
    'public class ArrayVsLinkedPreview {',
    '    static class Node {',
    '        int data;',
    '        Node next;',
    '        Node(int data, Node next) { this.data = data; this.next = next; }',
    '    }',
    '',
    '    public static void main(String[] args) {',
    '        int[] arr = {10, 20, 30, 40, 50};',
    '',
    '        System.out.println("array (one contiguous block, indexed access):");',
    '        for (int i = 0; i < arr.length; i++)',
    '            System.out.println("  arr[" + i + "] = " + arr[i]);',
    '',
    '        Node head = null;',
    '        for (int i = arr.length - 1; i >= 0; i--)',
    '            head = new Node(arr[i], head);',
    '',
    '        System.out.println();',
    '        System.out.println("linked list (separate objects, followed one .next at a time):");',
    '        for (Node n = head; n != null; n = n.next)',
    '            System.out.println("  node@" + Integer.toHexString(System.identityHashCode(n))',
    '                    + ": data = " + n.data);',
    '    }',
    '}',
]


def array_vs_linked_preview():
    a = Anim('array-vs-linked-preview', 'Preview: array layout vs linked layout', 'Preview: array layout vs linked layout',
              gen=700, yuk=320, kod={'c': C_ARR_LINK, 'java': JAVA_ARR_LINK})
    vals = [10, 20, 30, 40, 50]
    addrs = [1000, 1004, 1008, 1012, 1016]
    for i, (v, ad) in enumerate(zip(vals, addrs)):
        a.kutu(f'a{i}', 60 + i * 62, 120, str(v), w=54, h=44, alt=str(ad), boyut=16)
    a.kare('Bir dizi TEK bir bitişik blok ayırır: her yuva, bir öncekinden tam olarak `sizeof(int)` (burada 4 bayt) sonra gelir.',
           'An array reserves ONE contiguous block: each slot sits exactly `sizeof(int)` (4 bytes here) after the previous one.',
           {'c': [7, 9, 10, 11], 'java': [9, 11, 12, 13]})
    a.ayarla('a2', st='vurgu')
    a.etiket('calc', 370, 200, 'arr[2]: 1000 + 2*4 = 1008', boyut=14, kod=True, kalin=True)
    a.kare('Bu yüzden `arr[2]`\'ye erişmek tek bir hesap: taban adres + indis × eleman boyu. Kaç eleman olursa olsun aynı hız: **O(1)**.',
           'That is why reaching `arr[2]` is a single calculation: base address + index x element size. Same speed no matter how many elements: **O(1)**.',
           {'c': [11], 'java': [13]})
    a.hepsi_st('normal', tur='kutu')
    a.sil('calc')
    node_addrs = [2050, 1730, 2600, 1400, 1900]
    for i in range(5):
        a.dugum(f'n{i}', 60 + i * 92, 240, str(vals[i]), alt=str(node_addrs[i]))
    for i in range(4):
        a.ok(f'ok{i}', f'n{i}', f'n{i + 1}')
    a.kare('Aynı beş değer, şimdi bağlı liste olarak: her değer KENDİ kutusunda, malloc\'un yer bulduğu HERHANGİ bir adreste. Kutular yalnızca birbirini gösteren işaretçilerle bağlı -- konumla değil.',
           'The same five values, now as a linked list: each value in its OWN box, at WHATEVER address malloc happened to find. The boxes are connected only by pointers to each other -- not by position.',
           {'c': [13, 14, 15, 16, 17, 18], 'java': [15, 16, 17]})
    a.hepsi_st('soluk', tur='dugum')
    a.ayarla('n0', st='vurgu')
    a.ayarla('n1', st='vurgu')
    a.ayarla('n2', st='vurgu')
    a.kare('3. düğüme ulaşmak için baştan başlayıp `next`\'i iki kez izlemek gerekir. Dizideki gibi doğrudan "üçüncü kutuya git" diye bir şey yok: erişim **O(n)**.',
           'Reaching the 3rd node means starting from the front and following `next` twice. There is no "jump straight to the third box" the way there is for an array: access is **O(n)**.',
           {'c': [21, 22, 23], 'java': [21, 22, 23]})
    a.hepsi_st('normal', tur='dugum')
    a.etiket('cmp1', 370, 40, T('dizi: arr[i] -> O(1), başa ekleme -> O(n) (kaydırma)',
                                  'array: arr[i] -> O(1), insert at front -> O(n) (shifting)'), boyut=14, kod=True)
    a.etiket('cmp2', 370, 62, T('bağlı liste: i. düğüme ulaş -> O(n), başa ekleme -> O(1) (yalnız head değişir)',
                                  'linked list: reach node i -> O(n), insert at front -> O(1) (only head changes)'), boyut=14, kod=True)
    a.kare('İki yapı da aynı beş değeri tutar, ama değiş tokuşları TAM TERSİ: dizi hızlı erişir, yavaş büyür; bağlı liste yavaş erişir, hızlı büyür.',
           'Both structures hold the same five values, but their trade-offs are OPPOSITE: an array accesses fast and grows slowly; a linked list accesses slowly and grows fast.')
    a.kare('Gelecek hafta: bir bağlı listeyi baştan kuracak, araya ekleyecek ve silecek, ve bunu neden -- O(n) erişime rağmen -- yine de istediğimizi göreceğiz.',
           'Next week: we build a linked list from scratch, insert into it, delete from it, and see why we still want it, despite the O(n) access.')
    return a


# ============================================================ 10. nested loop counting (3.7 Big-O precisely)
C_NESTED = [
    'long count_pairs(int n, long *operations) {',
    '    long count = 0;',
    '    for (int i = 0; i < n; i++) {',
    '        for (int j = 0; j < n; j++) {',
    '            count++;',
    '            (*operations)++;',
    '        }',
    '    }',
    '    return count;',
    '}',
]
JAVA_NESTED = [
    'static long countPairs(int n) {',
    '    operations = 0;',
    '    long count = 0;',
    '    for (int i = 0; i < n; i++) {',
    '        for (int j = 0; j < n; j++) {',
    '            count++;',
    '            operations++;',
    '        }',
    '    }',
    '    return count;',
    '}',
]


def nested_loop_counting():
    a = Anim('nested-loop-counting', 'Counting a nested loop to build T(n)', 'Counting a nested loop to build T(n)',
              gen=560, yuk=400, kod={'c': C_NESTED, 'java': JAVA_NESTED})
    N = 3
    W, H, GAP = 62, 46, 8
    X0, Y0 = 70, 110
    for i in range(N):
        for j in range(N):
            a.kutu(f'c{i}_{j}', X0 + j * (W + GAP), Y0 + i * (H + GAP), '', w=W, h=H, st='bos', boyut=16)
    a.etiket('title', 300, 40, 'n = 3', boyut=20, kalin=True, kod=True)
    a.etiket('cnt', 300, 68, T('çalıştırma: 0', 'operations: 0'), boyut=15, kod=True)
    a.kare('İçteki döngünün gövdesinin `n = 3` için tam olarak kaç kez çalıştığını sayacağız: her `(i, j)` çifti bir çalıştırma.',
           'We will count exactly how many times the inner loop body runs for `n = 3`: one run per `(i, j)` pair.',
           {'c': [1, 2, 3], 'java': [1, 2, 3, 4]})
    op = 0
    for i in range(N):
        for j in range(N):
            op += 1
            a.ayarla(f'c{i}_{j}', metin=str(op), st='yeni')
            a.ayarla('cnt', metin=T(f'çalıştırma: {op}', f'operations: {op}'))
            a.kare(f'`i = {i}, j = {j}`: iç gövde çalışır -- `count++`. Bu {op}. çalıştırma.',
                   f'`i = {i}, j = {j}`: the inner body runs -- `count++`. This is operation {op}.',
                   {'c': [5, 6], 'java': [6, 7]})
    a.hepsi_st('normal', tur='kutu')
    a.kare('`n = 3` için iç gövde tam olarak 9 = 3² kez çalıştı -- dış döngü 3 kez döner, her turunda iç döngü de 3 kez döner.',
           'For `n = 3` the inner body ran exactly 9 = 3² times -- the outer loop runs 3 times, and each time, the inner loop runs 3 times too.',
           {'c': [9], 'java': [10]})
    a.etiket('formula', 300, 350, 'T(n) = n²  (iç gövde)  +  düşük dereceli terimler (döngü kontrolü, kurulum)',
              boyut=13, kod=True)
    a.kare('Genel `n` için: `T(n) = n²` (iç gövde, baskın terim) artı döngü kontrolünden ve kurulumdan gelen düşük dereceli terimler.',
           'For general `n`: `T(n) = n²` (the inner body, the dominant term) plus lower-order terms from loop control and setup.')
    a.ayarla('formula', metin='O(n²)  --  sabitleri ve düşük dereceli terimleri at, yalnızca n² kalır')
    a.kare('Sabitleri ve düşük dereceli terimleri atınca geriye yalnızca `n²` kalır: **O(n²)**. Tam olarak 3.7. bölümdeki kuralın kendisi.',
           'Drop the constants and the lower-order terms and only `n²` is left: **O(n²)**. Exactly the rule from Section 3.7 itself.')
    return a


# ============================================================ 11. space: recursive vs iterative (3.9)
C_SPACE = [
    'int sum_recursive(const int arr[], int n) {',
    '    if (n == 0)              /* base case: 0 elements left */',
    '        return 0;',
    '    return arr[n - 1] + sum_recursive(arr, n - 1);   /* one stack frame per call */',
    '}',
    '',
    'int sum_iterative(const int arr[], int n) {',
    '    int total = 0;           /* ONE set of variables, reused every iteration */',
    '    for (int i = 0; i < n; i++)',
    '        total += arr[i];',
    '    return total;',
    '}',
]
JAVA_SPACE = [
    'static int sumRecursive(int[] arr, int n) {',
    '    if (n == 0)               // base case: 0 elements left',
    '        return 0;',
    '    return arr[n - 1] + sumRecursive(arr, n - 1);   // one stack frame per call',
    '}',
    '',
    'static int sumIterative(int[] arr, int n) {',
    '    int total = 0;            // ONE set of variables, reused every iteration',
    '    for (int i = 0; i < n; i++)',
    '        total += arr[i];',
    '    return total;',
    '}',
]
SPACE_ARR = [10, 20, 30, 40, 50]


def space_recursive_vs_iterative():
    a = Anim('space-recursive-vs-iterative', 'Space complexity: recursive sum vs iterative sum',
              'Space complexity: recursive sum vs iterative sum', gen=760, yuk=340,
              kod={'c': C_SPACE, 'java': JAVA_SPACE})
    X, Y0, H = 170, 300, 44
    a.cerceve('cy', X - 130, 20, 280, 290, baslik=T('sum_recursive: çağrı yığını', 'sum_recursive: call stack'))
    a.kutu('main', X, Y0 - H, 'main()', w=230, h=H - 8, boyut=14)
    a.kare('`sum_recursive(arr, 5)` çağrılır. `arr = {10, 20, 30, 40, 50}`. Her çağrı, bitene kadar çağrı yığınında bir çerçeve tutar.',
           '`sum_recursive(arr, 5)` is called. `arr = {10, 20, 30, 40, 50}`. Every call holds a frame on the call stack until it finishes.',
           {'c': [1], 'java': [1]})
    for depth in (5, 4, 3, 2, 1, 0):
        fid = f'f{depth}'
        a.kutu(fid, X, Y0 - {5: 2, 4: 3, 3: 4, 2: 5, 1: 6, 0: 7}[depth] * H, f'sum_recursive(n={depth})',
               w=230, h=H - 8, st='yeni', boyut=13)
        if depth > 0:
            a.kare(f'`n = {depth}` sıfır değil, bu yüzden yeni bir çerçeve itilip `sum_recursive(arr, {depth - 1})` çağrılır -- önce o dönmeli.',
                   f'`n = {depth}` is not zero, so a new frame is pushed and `sum_recursive(arr, {depth - 1})` is called -- it must return first.',
                   {'c': [2, 4], 'java': [2, 4]})
        else:
            a.ayarla(fid, st='vurgu')
            a.kare('`n = 0`: **temel durum**. Artık kendini çağırmaz, doğrudan 0 döner.',
                   '`n = 0`: the **base case**. It no longer calls itself and returns 0 directly.', {'c': [2, 3], 'java': [2, 3]})
    a.kare('Zincirin en derin noktasında **6 çerçeve** aynı anda yığında duruyor -- `n = 5` için `n + 1`. Bu O(n) EK bellek, dizinin kendisinin üstüne.',
           'At the deepest point of the chain, **6 frames** sit on the stack at once -- `n + 1` for `n = 5`. That is O(n) EXTRA memory, on top of the array itself.',
           {'c': [4], 'java': [4]})
    for depth in (0, 1, 2, 3, 4, 5):
        a.sil(f'f{depth}')
    a.kare('Her çağrı döndükçe çerçevesi yığından çekilir. Sonunda yalnızca `main` kalır -- ama zirvede O(n) bellek gerçekten kullanılmıştı.',
           'As each call returns, its frame is popped off. Only `main` is left at the end -- but O(n) memory really was used at the peak.',
           {'c': [1], 'java': [1]})
    a.cerceve('itf', 420, 130, 260, 90, baslik=T('sum_iterative: TEK çerçeve', 'sum_iterative: ONE frame'))
    a.kutu('total', 450, 160, 'total = 0', w=100, h=40, st='yeni', boyut=13, kod=True)
    a.kutu('iv', 570, 160, 'i = 0', w=80, h=40, st='yeni', boyut=13, kod=True)
    a.kare('`sum_iterative` farklı bir yaklaşım kullanır: `total` ve `i` için TEK bir çerçeve, baştan sona.',
           '`sum_iterative` takes a different approach: ONE frame for `total` and `i`, from start to finish.',
           {'c': [7, 8], 'java': [7, 8]})
    total = 0
    for i in range(5):
        total += SPACE_ARR[i]
        a.ayarla('total', metin=f'total = {total}')
        a.ayarla('iv', metin=f'i = {i}')
        a.kare(f'`i = {i}`: `total += arr[{i}]` ({SPACE_ARR[i]}) -- AYNI `total` ve `i` değişkenleri güncellenir, yeni bir çerçeve AÇILMAZ.',
               f'`i = {i}`: `total += arr[{i}]` ({SPACE_ARR[i]}) -- the SAME `total` and `i` are updated in place; no new frame is EVER opened.',
               {'c': [9, 10], 'java': [9, 10]})
    a.kare('Sonuç: iki fonksiyon da aynı 150 değerini döndürür. Ama `sum_recursive`, `n` ile büyüyen O(n) yığın belleği kullandı; `sum_iterative` her zaman tam olarak O(1) kullandı -- `n` ne olursa olsun tek çerçeve.',
           'Result: both functions return the same 150. But `sum_recursive` used O(n) stack memory that grows with `n`; `sum_iterative` always used exactly O(1) -- one frame, no matter what `n` is.')
    return a


# ============================================================ 12. pointer arithmetic (4.4)
C_PTR_ARITH = [
    'int a[5] = {10, 20, 30, 40, 50};',
    'int *p = a;                  /* an array decays to a pointer to its first element */',
    '',
    'printf("p points to a[0] = %d at %p\\n", *p, (void *) p);',
    'printf("p + 1 points to a[1] = %d at %p\\n", *(p + 1), (void *) (p + 1));',
    'printf("*(p + 2) = %d (same as a[2] = %d)\\n", *(p + 2), a[2]);',
    '',
    'p++;                          /* now p points to a[1] */',
    'printf("after p++: *p = %d at %p\\n", *p, (void *) p);',
]
JAVA_PTR_ARITH = [
    'int[] a = {10, 20, 30, 40, 50};',
    '',
    'System.out.println("a[0] = " + a[0]);',
    'System.out.println("a[1] = " + a[1] + " (the \'next\' element -- by index, not by address)");',
    'System.out.println("a[2] = " + a[2]);',
]


def pointer_arithmetic():
    a = Anim('pointer-arithmetic', 'Pointer arithmetic: p + k means k * sizeof(*p)', 'Pointer arithmetic: p + k means k * sizeof(*p)',
              gen=620, yuk=260, kod={'c': C_PTR_ARITH, 'java': JAVA_PTR_ARITH})
    vals = [10, 20, 30, 40, 50]
    addrs = [1000, 1004, 1008, 1012, 1016]
    for i, (v, ad) in enumerate(zip(vals, addrs)):
        a.kutu(f'a{i}', 60 + i * 62, 130, str(v), w=54, h=44, alt=str(ad), boyut=16)
    a.isaretci('p', 'a0', 'p', yon='ust')
    a.kare('`int *p = a;` -- bir dizi, ilk elemanına bir işaretçiye "düşer" (decay). `p` şimdi `a[0]`\'ı, adres 1000\'i gösteriyor.',
           '`int *p = a;` -- an array "decays" to a pointer to its first element. `p` now points to `a[0]`, address 1000.',
           {'c': [1, 2], 'java': [1]})
    a.etiket('calc1', 350, 200, 'p + 1  =  1000 + 1*4  =  1004', boyut=14, kod=True, kalin=True)
    a.ayarla('a1', st='vurgu')
    a.kare('`p + 1` -- p\'yi DEĞİŞTİRMEZ; yeni bir adres HESAPLAR: `p`\'nin adresi artı 1 kere `sizeof(*p)` (4 bayt) = 1004, yani `a[1]`.',
           '`p + 1` does NOT change p; it COMPUTES a new address: p\'s address plus 1 times `sizeof(*p)` (4 bytes) = 1004, i.e. `a[1]`.',
           {'c': [5], 'java': [4]})
    a.kare('`*(p + 1)` bu hesaplanan adresi dereferanslar: 20.', '`*(p + 1)` dereferences that computed address: 20.', {'c': [5], 'java': [4]})
    a.ayarla('a1', st='normal')
    a.ayarla('calc1', metin='p + 2  =  1000 + 2*4  =  1008')
    a.ayarla('a2', st='vurgu')
    a.kare('`p + 2` -- aynı fikir, hesaplanan adres 1000 + 2*4 = 1008, yani `a[2]`.',
           '`p + 2` -- same idea, the computed address is 1000 + 2*4 = 1008, i.e. `a[2]`.', {'c': [6], 'java': [5]})
    a.kare('`*(p + 2)` = 30, `a[2]` ile aynı değer -- `p[k]` ve `a[k]` her zaman aynı şeyi hesaplar.',
           '`*(p + 2)` = 30, the same value as `a[2]` -- `p[k]` and `a[k]` always compute the exact same thing.', {'c': [6], 'java': [5]})
    a.ayarla('a2', st='normal')
    a.sil('calc1')
    a.ayarla('p', hedef='a1')
    a.kare('`p++;` -- bu sefer FARKLI: p\'nin KENDİSİ değişir. p artık `a[1]`\'i gösteriyor -- adresi kalıcı olarak 1004 oldu.',
           '`p++;` -- this time it is DIFFERENT: p ITSELF changes. p now points to `a[1]` -- its address permanently became 1004.',
           {'c': [8], 'java': []})
    a.ayarla('a1', st='vurgu')
    a.kare('`*p` artık 20 okur -- `p` kalıcı olarak bir kutu ileri taşındı.', '`*p` now reads 20 -- `p` permanently moved one box forward.',
           {'c': [9], 'java': []})
    a.ayarla('a1', st='normal')
    a.etiket('formula', 350, 220, 'p + k  ==  adres + k * sizeof(*p)   (asla k bayt DEĞİL)', boyut=14, kod=True, kalin=True)
    a.kare('Özet: `p + k`, `k` bayt değil, her zaman `k * sizeof(*p)` bayt ileri gider. Java\'da işaretçi aritmetiği yoktur -- "sonraki eleman" yalnızca `a[i + 1]` demektir.',
           'Summary: `p + k` always moves `k * sizeof(*p)` bytes forward, never `k` bytes. Java has no pointer arithmetic at all -- "the next element" only ever means `a[i + 1]`.')
    return a


# ============================================================ 13. PER encoding (6.6)
C_PER = [
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
    'for (int i = 0; i < 3; i++)',
    '    pack_bits(per, &bitpos, (unsigned char) name[i], 8);   /* fixed size: no length needed */',
    'pack_bits(per, &bitpos, 5, 5);                              /* age, constrained to 0..31: 5 bits */',
]
JAVA_PER = [
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
    'for (int i = 0; i < 3; i++)',
    '    packBits(per, name.charAt(i), 8);   // fixed size: no length needed',
    'packBits(per, 5, 5);                     // age, constrained to 0..31: 5 bits',
]


def per_encoding():
    a = Anim('per-encoding', 'PER: the same record, packed bit by bit', 'PER: the same record, packed bit by bit',
              gen=560, yuk=260, kod={'c': C_PER, 'java': JAVA_PER})
    a.etiket('ber', 280, 40, 'BER (6.5. bölüm): 30 08 0C 03 52 65 78 02 01 05  --  10 bayt (80 bit)', boyut=13, kod=True, st='soluk')
    a.etiket('rec', 280, 65, 'name = "Rex", age = 5', boyut=15, kod=True)
    BX = [60, 160, 260, 360]
    for i, x in enumerate(BX):
        a.kutu(f'b{i}', x, 130, '........', w=90, h=40, st='bos', boyut=15, kod=True)
    a.kare('Aynı kayıt, bu kez PER: etiket yok, boyu sabit olan `name` için uzunluk yok, `age` yalnızca ihtiyacı kadar bit alıyor.',
           'The same record, this time PER: no tags, no length for the fixed-size `name`, `age` gets only as many bits as it needs.',
           {'c': [11, 12], 'java': [11, 12]})
    a.ayarla('b0', metin='01010010', st='yeni')
    a.kare('`name[0] = \'R\'` -- 8 bit, doğrudan. Etiket yok, uzunluk yok: şema zaten `name`\'in tam olarak 3 karakter olduğunu biliyor.',
           '`name[0] = \'R\'` -- 8 bits, straight in. No tag, no length: the schema already knows `name` is exactly 3 characters.',
           {'c': [12, 13], 'java': [12, 13]})
    a.ayarla('b1', metin='01100101', st='yeni')
    a.kare('`name[1] = \'e\'` -- yine 8 bit.', '`name[1] = \'e\'` -- another 8 bits.', {'c': [12, 13], 'java': [12, 13]})
    a.ayarla('b2', metin='01111000', st='yeni')
    a.kare('`name[2] = \'x\'` -- 24 bit tamam. Baytlar BER\'in değer baytlarıyla AYNI -- fark, önlerinde Tag/Length OLMAMASI.',
           '`name[2] = \'x\'` -- 24 bits done. The bytes are the SAME as BER\'s value bytes -- the difference is there is NO Tag/Length in front of them.',
           {'c': [12, 13], 'java': [12, 13]})
    a.ayarla('b3', metin='00101...', st='yeni')
    a.kare('`age = 5`, ama şema `age`\'in 0-31 arasında olduğunu garanti ediyor -- bunun için tam bir bayt değil, yalnızca 5 bit yeter: `00101`.',
           '`age = 5`, but the schema guarantees `age` is 0-31 -- that needs not a whole byte, just 5 bits: `00101`.',
           {'c': [14], 'java': [14]})
    a.ayarla('b3', metin='00101000')
    a.kare('Son bayt, tam bir bayta tamamlamak için 3 kullanılmayan bitle (dolgu) dolduruluyor. PER çıktısı yalnızca EN SONDA bayta hizalanır, alanların her biri ayrı ayrı değil.',
           'The last byte is padded with 3 unused bits to round up to a whole byte. PER output is only byte-aligned at the very END, not field by field.',
           {'c': [14], 'java': [14]})
    a.ayarla('ber', st='sil')
    a.etiket('cmp', 280, 200, 'BER: 10 bayt (80 bit)   --   PER: 4 bayt (29 anlamlı bit + 3 dolgu)', boyut=14, kod=True, kalin=True)
    a.kare('Sonuç: aynı kayıt, BER\'de 10 bayt, PER\'de yalnızca 4 bayt -- kendi kendini tanımlamanın büyük kısmını feda ederek yaklaşık %60 küçülme.',
           'Result: the same record is 10 bytes in BER, only 4 bytes in PER -- roughly a 60% reduction, at the cost of most of the self-description.')
    return a


# ============================================================ 14. debugger stepping (7.5)
C_DEBUG = [
    'int average_buggy(const int arr[], int n) {',
    '    int sum = 0;',
    '    for (int i = 0; i < n; i++)',
    '        sum = sum + arr[i];',
    '    return sum / n;               /* bug: integer division truncates */',
    '}',
]


def debugger_stepping():
    a = Anim('debugger-stepping', 'Stepping through a bug with gdb', 'Stepping through a bug with gdb',
              gen=760, yuk=420, kod={'c': C_DEBUG})
    lines = [
        'int average_buggy(const int arr[], int n) {',
        '    int sum = 0;',
        '    for (int i = 0; i < n; i++)',
        '        sum = sum + arr[i];',
        '    return sum / n;',
        '}',
    ]
    for i, txt in enumerate(lines):
        a.kutu(f'l{i}', 240, 40 + i * 32, txt, w=400, h=26, boyut=13, kod=True)
    a.etiket('bp', 30, 40 + 4 * 32, '●', st='sil', boyut=18, kalin=True)
    a.kutu('vsum', 610, 60, '?', w=80, h=36, ust='sum', boyut=14, kod=True)
    a.kutu('vn', 610, 140, '3', w=80, h=36, ust='n', boyut=14, kod=True)
    a.kare('`break debug_average.c:11` -- `return sum / n;` satırına bir kesme noktası (breakpoint) koyuyoruz.',
           '`break debug_average.c:11` -- we set a breakpoint on the `return sum / n;` line.', {'c': [5]})
    a.ayarla('l4', st='vurgu')
    a.ayarla('vsum', metin='23', st='yeni')
    a.kare('`run` -- program tam bu satırda durdu, satır çalışmadan ÖNCE. Döngü zaten bitti: `sum = 23`, `n = 3`.',
           '`run` -- the program stopped exactly on this line, BEFORE it executes. The loop already finished: `sum = 23`, `n = 3`.', {'c': [2, 3, 4]})
    a.ayarla('vsum', st='vurgu')
    a.kare('`print sum` -- 23.', '`print sum` -- 23.')
    a.ayarla('vsum', st='normal')
    a.ayarla('vn', st='vurgu')
    a.kare('`print n` -- 3.', '`print n` -- 3.')
    a.ayarla('vn', st='normal')
    a.kutu('vint', 610, 220, '7', w=80, h=36, ust='sum / n', st='sil', boyut=14, kod=True)
    a.kare('`print sum / n` -- 7. `sum` ve `n` ikisi de `int`, yani bu TAM SAYI bölmesi: `23 / 3` sıfıra doğru kesilir.',
           '`print sum / n` -- 7. `sum` and `n` are both `int`, so this is INTEGER division: `23 / 3` truncates toward zero.', {'c': [5]})
    a.kutu('vdbl', 610, 300, '7.666...', w=110, h=36, ust='(double) sum / n', st='yeni', boyut=13, kod=True)
    a.kare('`print (double) sum / n` -- 7.666666666666667. AYNI `sum` ve `n`, kayan noktalıya zorlandı: gerçek cevap.',
           '`print (double) sum / n` -- 7.666666666666667. The SAME `sum` and `n`, forced to floating point: the real answer. The bug was never the loop -- only the final division.')
    a.hepsi_st('normal', tur='kutu')
    a.ayarla('bp', st='sil')
    a.etiket('out1', 240, 260, 'average_buggy  -> 7', boyut=14, kod=True)
    a.etiket('out2', 240, 282, 'average_fixed  -> 7.67', boyut=14, kod=True)
    a.kare('`continue` -- program sonuna kadar çalışır. Yazdırılan 7, az önce teşhis ettiğimiz kesilme (truncation) hatasını doğruluyor.',
           '`continue` -- the program runs to completion. The printed 7 confirms the truncation bug we just diagnosed.')
    a.kare('Yöntemin tamamı bu: bir kesme noktası koy, çalıştır, şüpheli ifadeleri yazdır, karşılaştır -- ve hiçbir kod satırı değişmedi.',
           'That is the entire method: set a breakpoint, run, print suspicious expressions, compare them -- and not one line of code changed.')
    return a


HEPSI = {
    'linear-search': linear_search,
    'binary-search': binary_search,
    'growth-race': growth_race,
    'pointer-basics': pointer_basics,
    'struct-pointer': struct_pointer,
    'stack-vs-heap': stack_vs_heap,
    'java-reference-heap': java_reference_heap,
    'tlv-encoding': tlv_encoding,
    'array-vs-linked-preview': array_vs_linked_preview,
    'nested-loop-counting': nested_loop_counting,
    'space-recursive-vs-iterative': space_recursive_vs_iterative,
    'pointer-arithmetic': pointer_arithmetic,
    'per-encoding': per_encoding,
    'debugger-stepping': debugger_stepping,
}

if __name__ == '__main__':
    adlar = [x for x in sys.argv[1:] if not x.startswith('-')] or list(HEPSI)
    hizli = '--hizli' in sys.argv          # JSON + HTML only (no GIF/PNG)
    for ad in adlar:
        yol = HEPSI[ad]().yaz(CIKTI, gif=not hizli, serit=not hizli)
        print('written:', yol.name)
