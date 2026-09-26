# -*- coding: utf-8 -*-
"""Week 3 — stack and queue animations.

Kullanım (depo kökünden):  py -3.12 tools/dsanim/week3.py [ad ...]
Çıktı: docs/week-3-stack/anim/<ad>.{json,html,tr.gif,en.gif,tr.png,en.png}
"""
import math
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from dsanim import Anim  # noqa: E402

KOK = pathlib.Path(__file__).resolve().parents[2]
CIKTI = KOK / 'docs' / 'week-3' / 'anim'


def T(tr, en):
    """İki dilli sahne yazısı."""
    return {'tr': tr, 'en': en}


# ============================================================ 1. dizi ile yığın
C_DIZI_YIGIN = [
    '#define CAP 5',
    'int data[CAP];',
    'int top = -1;            /* empty stack */',
    '',
    'bool push(int x) {',
    '    if (top == CAP - 1)  /* full? */',
    '        return false;    /* overflow */',
    '    top = top + 1;',
    '    data[top] = x;',
    '    return true;',
    '}',
    '',
    'bool pop(int *out) {',
    '    if (top == -1)       /* empty? */',
    '        return false;    /* underflow */',
    '    *out = data[top];',
    '    top = top - 1;',
    '    return true;',
    '}',
]
JAVA_DIZI_YIGIN = [
    'static final int CAP = 5;',
    'int[] data = new int[CAP];',
    'int top = -1;            // empty stack',
    '',
    'boolean push(int x) {',
    '    if (top == CAP - 1)  // full?',
    '        return false;    // overflow',
    '    top = top + 1;',
    '    data[top] = x;',
    '    return true;',
    '}',
    '',
    'Integer pop() {',
    '    if (top == -1)       // empty?',
    '        return null;     // underflow',
    '    int out = data[top];',
    '    top = top - 1;',
    '    return out;',
    '}',
]


def _dizi_yigin_sahne(a, cap, x=330, y0=320, h=50):
    a.cerceve('dizi', x - 16, y0 - cap * h - 18, 124, cap * h + 34, baslik=f'data[{cap}]')
    for i in range(cap):
        a.kutu(f'h{i}', x, y0 - (i + 1) * h, '', w=92, h=h - 6, st='bos')
        a.etiket(f'i{i}', x - 30, y0 - (i + 1) * h + 28, f'[{i}]', st='soluk', boyut=13, kod=True)
    a.etiket('topd', 610, 80, 'top = -1', boyut=20, kalin=True, kod=True)
    a.etiket('bilgi', 610, 115, T('boş yığın', 'empty stack'), st='soluk', boyut=15)


def _yigin_temizle(a, cap, top):
    for i in range(cap):
        a.ayarla(f'h{i}', st='normal' if i <= top else 'bos')
        if i > top:
            a.ayarla(f'h{i}', metin='')


def _say(n):
    return T('boş yığın' if n == 0 else f'{n} eleman', 'empty stack' if n == 0 else f'{n} element' + ('s' if n > 1 else ''))


def array_stack():
    a = Anim('array-stack-push-pop', 'Dizi ile yığın: push ve pop', 'Array stack: push and pop',
             yuk=360, kod={'c': C_DIZI_YIGIN, 'java': JAVA_DIZI_YIGIN})
    CAP = 5
    _dizi_yigin_sahne(a, CAP)
    a.kare('Beş hücrelik bir dizi ayırdık. Henüz hiç eleman yok; bunu `top = -1` ile gösteriyoruz: "en üstte kimse yok".',
           'We allocated an array of five cells. There are no elements yet; `top = -1` says "nobody is on top".',
           {'c': [1, 2, 3], 'java': [1, 2, 3]})
    top = -1
    for deger in (7, 3, 9):
        _yigin_temizle(a, CAP, top)
        a.kare(f'`push({deger})` çağrıldı. Önce soruyoruz: yığın dolu mu? `top` ({top}) son indise ({CAP - 1}) eşit değil, yani yer var.',
               f'`push({deger})` is called. First we ask: is the stack full? `top` ({top}) is not the last index ({CAP - 1}), so there is room.',
               {'c': [5, 6], 'java': [5, 6]})
        top += 1
        if not a.var('top'):
            a.isaretci('top', f'h{top}', 'top', yon='sag', uzak=26)
        else:
            a.ayarla('top', hedef=f'h{top}')
        a.ayarla(f'h{top}', st='vurgu')
        a.ayarla('topd', metin=f'top = {top}')
        a.kare(f'`top` bir artar ve {top} olur: yeni eleman bir üstteki hücreye gidecek.',
               f'`top` goes up by one to {top}: the new element will go into the next cell up.', {'c': 8, 'java': 8})
        a.ayarla(f'h{top}', metin=str(deger), st='yeni')
        a.ayarla('bilgi', metin=_say(top + 1))
        a.kare(f'{deger} değeri `data[{top}]` hücresine yazıldı. İşlem O(1): kaç eleman olursa olsun yalnız iki adım.',
               f'The value {deger} is written into `data[{top}]`. This is O(1): two steps no matter how many elements there are.',
               {'c': [9, 10], 'java': [9, 10]})
    _yigin_temizle(a, CAP, top)
    a.ayarla(f'h{top}', st='vurgu')
    a.kare('Şimdi `pop()` çağıralım. Yığın boş mu? `top` = 2, -1 değil; çıkarılacak bir eleman var.',
           'Now let us call `pop()`. Is the stack empty? `top` = 2, not -1; there is an element to remove.',
           {'c': [13, 14], 'java': [13, 14]})
    a.etiket('out', 610, 250, 'out = 9', st='vurgu', boyut=20, kalin=True, kod=True)
    a.kare('En üstteki değer (9) okunup çağırana verilir. Yığında yalnız en üste erişebiliriz: Son giren, İlk çıkar (LIFO).',
           'The top value (9) is read and handed to the caller. We can only reach the top of a stack: Last In, First Out (LIFO).',
           {'c': 16, 'java': 16})
    top -= 1
    a.ayarla('h2', st='soluk')
    a.ayarla('top', hedef=f'h{top}')
    a.ayarla('topd', metin=f'top = {top}')
    a.ayarla('bilgi', metin=_say(2))
    a.kare('`top` bir azalır. Dikkat: 9 bellekte hâlâ duruyor ama artık yığının parçası değil; bir sonraki `push` onun üstüne yazacak.',
           '`top` goes down by one. Note: 9 is still in memory but no longer part of the stack; the next `push` will overwrite it.',
           {'c': [17, 18], 'java': [17, 18]})
    a.sil('out')
    _yigin_temizle(a, CAP, top)
    a.kare('Sonuç: yığında 7 ve 3 kaldı, en üstte 3 var. push ve pop yalnız `top` ucunda çalışır; ikisi de O(1).',
           'Result: 7 and 3 remain, with 3 on top. push and pop work only at the `top` end; both are O(1).')
    return a


def stack_overflow():
    a = Anim('stack-overflow-underflow', 'Yığında taşma ve alttan taşma', 'Stack overflow and underflow',
             yuk=300, kod={'c': C_DIZI_YIGIN, 'java': JAVA_DIZI_YIGIN})
    CAP = 3
    _dizi_yigin_sahne(a, CAP, y0=250)
    a.ayarla('topd', metin='top = -1')
    a.etiket('cap', 610, 150, 'CAP = 3', st='soluk', boyut=16, kod=True)
    a.kare('Bu kez yalnız üç hücrelik küçük bir yığınımız var (`CAP = 3`). Sınırları zorlayalım.',
           'This time our stack has only three cells (`CAP = 3`). Let us push it to its limits.', {'c': [1, 2, 3], 'java': [1, 2, 3]})
    for top, deger in enumerate((4, 8, 15)):
        if not a.var('top'):
            a.isaretci('top', f'h{top}', 'top', yon='sag', uzak=26)
        a.ayarla('top', hedef=f'h{top}')
        _yigin_temizle(a, CAP, top - 1)
        a.ayarla(f'h{top}', metin=str(deger), st='yeni')
        a.ayarla('topd', metin=f'top = {top}')
        a.ayarla('bilgi', metin=_say(top + 1))
        a.kare(f'`push({deger})`: yer var, `top` {top} oldu ve {deger} yazıldı.',
               f'`push({deger})`: there is room, `top` became {top} and {deger} was written.', {'c': [8, 9], 'java': [8, 9]})
    _yigin_temizle(a, CAP, 2)
    for i in range(CAP):
        a.ayarla(f'h{i}', st='sil')
    a.etiket('uyari', 610, 205, T('TAŞMA: yer yok!', 'OVERFLOW: no room!'), st='sil', boyut=18, kalin=True)
    a.kare('`push(16)`: `top == CAP - 1` (2 == 2), yığın dolu. Fonksiyon hiçbir şey yazmadan `false` döner. Bu duruma **taşma (overflow)** denir.',
           '`push(16)`: `top == CAP - 1` (2 == 2), the stack is full. The function returns `false` without writing anything. This is **overflow**.',
           {'c': [6, 7], 'java': [6, 7]})
    a.sil('uyari')
    top = 2
    for _ in range(3):
        _yigin_temizle(a, CAP, top)
        a.ayarla(f'h{top}', st='soluk')
        top -= 1
        if top >= 0:
            a.ayarla('top', hedef=f'h{top}')
        else:
            a.sil('top')
        a.ayarla('topd', metin=f'top = {top}')
        a.ayarla('bilgi', metin=_say(top + 1))
        a.kare(f'`pop()`: en üstteki eleman çıktı, `top` {top} oldu.',
               f'`pop()`: the top element left, `top` became {top}.', {'c': [16, 17], 'java': [16, 17]})
    _yigin_temizle(a, CAP, -1)
    a.etiket('uyari', 610, 205, T('ALTTAN TAŞMA: boş!', 'UNDERFLOW: empty!'), st='sil', boyut=18, kalin=True)
    a.kare('Bir `pop()` daha: `top == -1`, çıkaracak eleman yok. Fonksiyon `false` döner; buna **alttan taşma (underflow)** denir. '
           'İki kontrol de programı çökmekten korur.',
           'One more `pop()`: `top == -1`, there is nothing to remove. The function returns `false`; this is **underflow**. '
           'Both checks keep the program from crashing.', {'c': [14, 15], 'java': [14, 15]})
    return a


# ============================================================ 2. bağlı liste ile yığın
C_BAGLI_YIGIN = [
    'typedef struct Node {',
    '    int data;',
    '    struct Node *next;',
    '} Node;',
    'Node *top = NULL;          /* empty stack */',
    '',
    'void push(int x) {',
    '    Node *n = malloc(sizeof(Node));',
    '    n->data = x;',
    '    n->next = top;',
    '    top = n;',
    '}',
    '',
    'bool pop(int *out) {',
    '    if (top == NULL) return false;',
    '    Node *tmp = top;',
    '    *out = tmp->data;',
    '    top = top->next;',
    '    free(tmp);',
    '    return true;',
    '}',
]
JAVA_BAGLI_YIGIN = [
    'class Node {',
    '    int data;',
    '    Node next;',
    '}',
    'Node top = null;           // empty stack',
    '',
    'void push(int x) {',
    '    Node n = new Node();',
    '    n.data = x;',
    '    n.next = top;',
    '    top = n;',
    '}',
    '',
    'Integer pop() {',
    '    if (top == null) return null;',
    '    Node tmp = top;',
    '    int out = tmp.data;',
    '    top = top.next;',
    '    // the garbage collector frees tmp',
    '    return out;',
    '}',
]


def linked_stack():
    a = Anim('linked-stack-push-pop', 'Bağlı liste ile yığın: push ve pop', 'Linked-list stack: push and pop',
             yuk=340, kod={'c': C_BAGLI_YIGIN, 'java': JAVA_BAGLI_YIGIN})
    X0, Y, DX = 200, 220, 140
    a.etiket('null', X0 + 20, Y + 26, 'NULL', st='soluk', boyut=16, kod=True)
    a.isaretci('top', 'null', 'top', yon='ust', uzak=30)
    a.kare('Yığın boş: `top` hiçbir düğümü göstermiyor, değeri `NULL`. Dizideki gibi sabit kapasite yok; her eleman ayrı bir düğüm olacak.',
           'The stack is empty: `top` points to no node, its value is `NULL`. There is no fixed capacity as with an array; each element will be its own node.',
           {'c': 5, 'java': 5})
    liste = []          # üstten alta düğüm id'leri
    for k, deger in enumerate((7, 3)):
        nid = f'n{k}'
        a.dugum(nid, 60, 70, '?', st='yeni')
        a.kare(f'`push({deger})`: `malloc` bellekte yeni bir düğüm ayırır. İçi henüz boş (çöp değer).',
               f'`push({deger})`: `malloc` allocates a new node in memory. Its contents are still garbage.',
               {'c': 8, 'java': 8})
        a.ayarla(nid, deger=str(deger))
        a.kare(f'Düğümün veri alanına {deger} yazılır.', f'{deger} is written into the node\'s data field.', {'c': 9, 'java': 9})
        hedef = liste[0] if liste else 'null'
        if hedef == 'null':
            a.ayarla(nid, bos=True)
            a.kare('`n->next = top`: `top` şu an NULL, yani yeni düğümün `next` alanı da NULL olur (çizgili kutu).',
                   '`n->next = top`: `top` is NULL right now, so the new node\'s `next` is NULL too (the crossed box).',
                   {'c': 10, 'java': 10})
        else:
            a.ok(f'o{nid}', nid, hedef, st='yeni')
            a.kare('`n->next = top`: yeni düğüm, şu anki en üst düğümü gösterir. Böylece eski yığın yeni düğümün altında kalır.',
                   '`n->next = top`: the new node points to the current top node, so the old stack sits below the new node.',
                   {'c': 10, 'java': 10})
        a.ayarla('top', hedef=nid)
        a.kare('`top = n`: artık yığının en üstü yeni düğüm. İşlem O(1): kaç düğüm olursa olsun üç atama.',
               '`top = n`: the new node is now the top of the stack. O(1): three assignments no matter how many nodes there are.',
               {'c': 11, 'java': 11})
        liste.insert(0, nid)
        for i, d in enumerate(liste):
            a.tasi(d, X0 + i * DX, Y)
            a.ayarla(d, st='normal')
        if a.var('null'):
            a.sil('null')
        for d in liste:
            if a.var(f'o{d}'):
                a.ayarla(f'o{d}', st='normal')
        a.kare('Çizimi toparlayalım: bellekte hiçbir şey kaymadı, yalnız düğümleri `top`tan başlayarak soldan sağa diziyoruz.',
               'Let us tidy the drawing: nothing moved in memory; we just line the nodes up from `top`, left to right.')
    a.ayarla(liste[0], st='vurgu')
    a.kare('`pop()`: yığın boş değil (`top != NULL`). `tmp` en üst düğümü tutar ki birazdan onu serbest bırakabilelim.',
           '`pop()`: the stack is not empty (`top != NULL`). `tmp` holds the top node so that we can free it in a moment.',
           {'c': [15, 16], 'java': [15, 16]})
    a.isaretci('tmp', liste[0], 'tmp', yon='alt', st='vurgu', uzak=30)
    a.etiket('out', 470, 110, 'out = 3', st='vurgu', boyut=20, kalin=True, kod=True)
    a.kare('Değer (3) çağırana verilir.', 'The value (3) is handed to the caller.', {'c': 17, 'java': 17})
    a.ayarla('top', hedef=liste[1])
    a.kare('`top = top->next`: `top` bir alttaki düğüme geçer. Artık 7 en üstte.',
           '`top = top->next`: `top` moves to the node below. Now 7 is on top.', {'c': 18, 'java': 18})
    a.sil(liste[0], f'o{liste[0]}', 'tmp')
    a.kare('`free(tmp)`: eski düğümün belleği geri verilir. (Java\'da bunu çöp toplayıcı yapar.) Unutursak bellek sızıntısı olur.',
           '`free(tmp)`: the old node\'s memory is given back. (In Java the garbage collector does this.) Forgetting it leaks memory.',
           {'c': 19, 'java': 19})
    a.sil('out')
    a.tasi(liste[1], X0, Y)
    a.ayarla(liste[1], st='normal')
    a.kare('Sonuç: tek düğüm (7) kaldı. Bağlı yığında taşma yoktur (bellek bitmedikçe); bedeli her düğümdeki fazladan `next` işaretçisidir.',
           'Result: a single node (7) remains. A linked stack never overflows (until memory runs out); the cost is the extra `next` pointer in every node.')
    return a


# ============================================================ 3. yığın uygulamaları
C_PARANTEZ = [
    'bool balanced(const char *s) {',
    '    char st[100]; int top = -1;',
    "    for (int i = 0; s[i] != '\\0'; i++) {",
    '        char c = s[i];',
    "        if (c == '(' || c == '[' || c == '{') {",
    '            st[++top] = c;                /* opener: push */',
    "        } else if (c == ')' || c == ']' || c == '}') {",
    '            if (top == -1) return false;  /* nothing to match */',
    '            char o = st[top--];           /* pop */',
    '            if (!matches(o, c)) return false;',
    '        }',
    '    }',
    '    return top == -1;                     /* all closed? */',
    '}',
]
JAVA_PARANTEZ = [
    'boolean balanced(String s) {',
    '    char[] st = new char[100]; int top = -1;',
    '    for (int i = 0; i < s.length(); i++) {',
    '        char c = s.charAt(i);',
    "        if (c == '(' || c == '[' || c == '{') {",
    '            st[++top] = c;                // opener: push',
    "        } else if (c == ')' || c == ']' || c == '}') {",
    '            if (top == -1) return false;  // nothing to match',
    '            char o = st[top--];           // pop',
    '            if (!matches(o, c)) return false;',
    '        }',
    '    }',
    '    return top == -1;                     // all closed?',
    '}',
]
ESI = {')': '(', ']': '[', '}': '{'}


def _dizgi(a, dizi, y=50, x0=150, dx=62, onek='t'):
    for i, c in enumerate(dizi):
        a.kutu(f'{onek}{i}', x0 + i * dx, y, c, w=50, h=46, alt=str(i), boyut=22)


def bracket_matching():
    s = '{([])(]}'
    a = Anim('bracket-matching', 'Yığınla parantez denetimi', 'Checking brackets with a stack',
             yuk=380, kod={'c': C_PARANTEZ, 'java': JAVA_PARANTEZ})
    _dizgi(a, s)
    a.cerceve('yf', 604, 150, 110, 210, baslik=T('yığın', 'stack'))
    a.kare('Soru: `{([])(]}` ifadesindeki parantezler doğru eşleşiyor mu? Kural: her kapanan, **en son açılan** ile eşleşmeli. "En son" duyunca aklımıza yığın gelmeli.',
           'Question: do the brackets in `{([])(]}` match? Rule: every closer must match the **most recently opened** one. "Most recent" should make us think of a stack.',
           {'c': [1, 2], 'java': [1, 2]})
    yig = []
    for i, c in enumerate(s):
        for j in range(len(s)):
            a.ayarla(f't{j}', st='soluk' if j < i else 'normal')
        a.ayarla(f't{i}', st='vurgu')
        if c in '([{':
            sid = f's{i}'
            a.kutu(sid, 614, 320 - len(yig) * 46, c, w=90, h=40, st='yeni', boyut=20)
            yig.append(sid)
            a.kare(f'`{c}` bir açan parantez: yığına it (push). Yığında artık {len(yig)} açık parantez bekliyor.',
                   f'`{c}` is an opener: push it. {len(yig)} open bracket(s) are now waiting on the stack.',
                   {'c': [5, 6], 'java': [5, 6]})
            a.ayarla(sid, st='normal')
        else:
            ust = yig[-1]
            ac = a.og[ust]['metin']
            if ESI[c] == ac:
                a.ayarla(ust, st='yeni')
                a.ayarla(f't{i}', st='yeni')
                a.kare(f'`{c}` bir kapanan: yığından çek (pop) → `{ac}`. Eşleşiyorlar, devam.',
                       f'`{c}` is a closer: pop → `{ac}`. They match; keep going.', {'c': [7, 9, 10], 'java': [7, 9, 10]})
                a.sil(ust)
                yig.pop()
            else:
                a.ayarla(ust, st='sil')
                a.ayarla(f't{i}', st='sil')
                a.etiket('sonuc', 380, 190, T('DENGESİZ: ( ile ] eşleşmez', 'UNBALANCED: ( does not match ]'),
                         st='sil', boyut=20, kalin=True)
                a.kare(f'`{c}` geldi ama yığının tepesinde `{ac}` var. Eşleşmiyor → fonksiyon hemen `false` döner. İfade dengesiz.',
                       f'`{c}` arrives but `{ac}` is on top of the stack. No match → the function returns `false` at once. Unbalanced.',
                       {'c': [9, 10], 'java': [9, 10]})
                break
    a.kare('Üç hata türü var: (1) kapanan ile tepe eşleşmez (burada olan), (2) kapanan geldiğinde yığın boştur, (3) ifade biter ama yığında açık parantez kalır. '
           'Her karakter bir kez işlenir: O(n).',
           'There are three kinds of error: (1) the closer does not match the top (what happened here), (2) the stack is empty when a closer arrives, '
           '(3) the input ends with openers left on the stack. Each character is handled once: O(n).', {'c': [8, 10, 13], 'java': [8, 10, 13]})
    return a


C_POSTFIX = [
    'int eval_postfix(char *tok[], int n) {',
    '    int st[100]; int top = -1;',
    '    for (int i = 0; i < n; i++) {',
    '        char *t = tok[i];',
    '        if (isdigit(t[0])) {',
    '            st[++top] = atoi(t);          /* number: push */',
    '        } else {',
    '            int b = st[top--];            /* right operand */',
    '            int a = st[top--];            /* left operand */',
    '            st[++top] = apply(t[0], a, b);',
    '        }',
    '    }',
    '    return st[top];                       /* the answer */',
    '}',
]
JAVA_POSTFIX = [
    'int evalPostfix(String[] tok) {',
    '    int[] st = new int[100]; int top = -1;',
    '    for (int i = 0; i < tok.length; i++) {',
    '        String t = tok[i];',
    '        if (Character.isDigit(t.charAt(0))) {',
    '            st[++top] = Integer.parseInt(t);  // number: push',
    '        } else {',
    '            int b = st[top--];            // right operand',
    '            int a = st[top--];            // left operand',
    '            st[++top] = apply(t.charAt(0), a, b);',
    '        }',
    '    }',
    '    return st[top];                       // the answer',
    '}',
]


def postfix_evaluation():
    tok = ['5', '3', '+', '8', '2', '-', '*']
    a = Anim('postfix-evaluation', 'Postfix ifade değerlendirme', 'Evaluating a postfix expression',
             yuk=380, kod={'c': C_POSTFIX, 'java': JAVA_POSTFIX})
    _dizgi(a, tok, x0=120)
    a.cerceve('yf', 604, 150, 110, 210, baslik=T('yığın', 'stack'))
    a.kare('`5 3 + 8 2 - *` postfix (sonek) yazımdır: işleç, işlenenlerinden **sonra** gelir. Parantez ve öncelik kuralı gerekmez; bir yığın yeter. '
           'Beklenen sonuç: (5 + 3) × (8 − 2) = 48.',
           '`5 3 + 8 2 - *` is postfix notation: the operator comes **after** its operands. No parentheses or precedence rules are needed; a stack is enough. '
           'Expected result: (5 + 3) × (8 − 2) = 48.', {'c': [1, 2], 'java': [1, 2]})
    yig = []
    sayac = [0]

    def it(v, st='yeni'):
        sayac[0] += 1
        sid = f's{sayac[0]}'
        a.kutu(sid, 614, 320 - len(yig) * 46, str(v), w=90, h=40, st=st, boyut=20)
        yig.append(sid)
        return sid

    for i, t in enumerate(tok):
        for j in range(len(tok)):
            a.ayarla(f't{j}', st='soluk' if j < i else 'normal')
        a.ayarla(f't{i}', st='vurgu')
        for s_ in yig:
            a.ayarla(s_, st='normal')
        if t.isdigit():
            it(t)
            a.kare(f'`{t}` bir sayı: yığına it.', f'`{t}` is a number: push it.', {'c': [5, 6], 'java': [5, 6]})
        else:
            b_id, a_id = yig[-1], yig[-2]
            bv, av = int(a.og[b_id]['metin']), int(a.og[a_id]['metin'])
            a.ayarla(b_id, st='vurgu')
            a.ayarla(a_id, st='vurgu')
            sonuc = {'+': av + bv, '-': av - bv, '*': av * bv}[t]
            isaret = {'+': '+', '-': '−', '*': '×'}[t]
            a.etiket('hesap', 400, 230, f'{av} {isaret} {bv} = {sonuc}', st='vurgu', boyut=24, kalin=True, kod=True)
            a.kare(f'`{t}` bir işleç: önce sağ işleneni (b = {bv}), sonra sol işleneni (a = {av}) çek. Sıra önemli: {av} {isaret} {bv}.',
                   f'`{t}` is an operator: pop the right operand (b = {bv}) first, then the left one (a = {av}). Order matters: {av} {isaret} {bv}.',
                   {'c': [8, 9], 'java': [8, 9]})
            a.sil(b_id, a_id)
            yig.pop()
            yig.pop()
            it(sonuc)
            a.kare(f'Sonuç ({sonuc}) yığına geri itilir; bir sonraki işlemin işleneni olacak.',
                   f'The result ({sonuc}) is pushed back; it becomes an operand of a later operation.', {'c': 10, 'java': 10})
            a.sil('hesap')
    a.ayarla(yig[-1], st='yeni')
    for j in range(len(tok)):
        a.ayarla(f't{j}', st='soluk')
    a.kare('Girdi bitti; yığında tek değer kaldı: **48**. Her belirteç bir kez işlendi: O(n). Hesap makineleri ve derleyiciler ifadeleri tam böyle değerlendirir.',
           'The input is over; one value is left on the stack: **48**. Each token was handled once: O(n). Calculators and compilers evaluate expressions exactly like this.',
           {'c': 13, 'java': 13})
    return a


C_INFIX = [
    'void to_postfix(const char *in, char *out) {',
    '    char ops[100]; int top = -1, k = 0;',
    '    for (int i = 0; in[i]; i++) {',
    '        char c = in[i];',
    '        if (isalnum(c)) {',
    '            out[k++] = c;                  /* operand -> output */',
    '        } else {',
    '            while (top >= 0 && prec(ops[top]) >= prec(c))',
    '                out[k++] = ops[top--];     /* pop stronger ops */',
    '            ops[++top] = c;                /* push operator */',
    '        }',
    '    }',
    '    while (top >= 0) out[k++] = ops[top--]; /* flush */',
    "    out[k] = '\\0';",
    '}',
]
JAVA_INFIX = [
    'String toPostfix(String in) {',
    '    char[] ops = new char[100]; int top = -1; StringBuilder out = new StringBuilder();',
    '    for (int i = 0; i < in.length(); i++) {',
    '        char c = in.charAt(i);',
    '        if (Character.isLetterOrDigit(c)) {',
    '            out.append(c);                 // operand -> output',
    '        } else {',
    '            while (top >= 0 && prec(ops[top]) >= prec(c))',
    '                out.append(ops[top--]);    // pop stronger ops',
    '            ops[++top] = c;                // push operator',
    '        }',
    '    }',
    '    while (top >= 0) out.append(ops[top--]); // flush',
    '    return out.toString();',
    '}',
]


def infix_to_postfix():
    s = 'A+B*C-D'
    a = Anim('infix-to-postfix', 'Infix ifadeyi postfix\'e çevirme', 'Converting infix to postfix',
             yuk=400, kod={'c': C_INFIX, 'java': JAVA_INFIX})
    _dizgi(a, s, x0=110)
    a.cerceve('yf', 624, 160, 100, 220, baslik=T('işleç yığını', 'operator stack'))
    a.etiket('cikl', 60, 330, T('çıktı:', 'output:'), st='soluk', boyut=15, hiza='start')
    a.kare('`A+B*C-D` infix (araek) yazımdır; `*` önceliklidir. Hedef: işleç yığınıyla postfix\'e çevirmek (Dijkstra\'nın "tren makası" algoritması). '
           'Beklenen: `A B C * + D -`.',
           '`A+B*C-D` is infix notation; `*` has higher precedence. Goal: convert it to postfix with an operator stack (Dijkstra\'s "shunting-yard"). '
           'Expected: `A B C * + D -`.', {'c': [1, 2], 'java': [1, 2]})
    ONC = {'+': 1, '-': 1, '*': 2, '/': 2}
    yig, cikti = [], []

    def cik(metin):
        oid = f'c{len(cikti)}'
        a.kutu(oid, 130 + len(cikti) * 58, 305, metin, w=48, h=42, st='yeni', boyut=20)
        cikti.append(oid)

    for i, c in enumerate(s):
        for j in range(len(s)):
            a.ayarla(f't{j}', st='soluk' if j < i else 'normal')
        a.ayarla(f't{i}', st='vurgu')
        for o in cikti + yig:
            a.ayarla(o, st='normal')
        if c.isalnum():
            cik(c)
            a.kare(f'`{c}` bir işlenen: doğrudan çıktıya yazılır.', f'`{c}` is an operand: it goes straight to the output.',
                   {'c': [5, 6], 'java': [5, 6]})
            continue
        while yig and ONC[a.og[yig[-1]]['metin']] >= ONC[c]:
            ust = yig.pop()
            m = a.og[ust]['metin']
            a.ayarla(ust, st='vurgu')
            a.kare(f'`{c}` geldi. Tepedeki `{m}` önceliği ondan düşük değil, önce `{m}` uygulanmalı → çıktıya aktar.',
                   f'`{c}` arrives. `{m}` on top has no lower precedence, so `{m}` must be applied first → move it to the output.',
                   {'c': [8, 9], 'java': [8, 9]})
            a.sil(ust)
            cik(m)
        sid = f's{i}'
        a.kutu(sid, 629, 330 - len(yig) * 46, c, w=90, h=40, st='yeni', boyut=20)
        yig.append(sid)
        a.kare(f'`{c}` işleç yığınına itilir' + (': tepedeki işleç daha zayıf.' if len(yig) > 1 else '.'),
               f'`{c}` is pushed onto the operator stack' + (': the operator on top is weaker.' if len(yig) > 1 else '.'),
               {'c': 10, 'java': 10})
    for j in range(len(s)):
        a.ayarla(f't{j}', st='soluk')
    while yig:
        ust = yig.pop()
        m = a.og[ust]['metin']
        a.sil(ust)
        cik(m)
    a.kare('Girdi bitti: yığında kalan işleçler sırayla çıktıya boşaltılır. Sonuç `A B C * + D -`. Her karakter bir kez itilir ve bir kez çekilir: O(n).',
           'The input is over: the operators left on the stack are flushed to the output. Result: `A B C * + D -`. Each character is pushed and popped at most once: O(n).',
           {'c': [13, 14], 'java': [13, 14]})
    return a


# ============================================================ 4. kuyruklar
C_KUYRUK_DUZ = [
    'int q[CAP]; int front = 0, rear = -1;',
    '',
    'bool enqueue(int x) {',
    '    if (rear == CAP - 1) return false;   /* "full"? */',
    '    q[++rear] = x;',
    '    return true;',
    '}',
    '',
    'bool dequeue(int *out) {',
    '    if (front > rear) return false;      /* empty */',
    '    *out = q[front++];',
    '    return true;',
    '}',
]
JAVA_KUYRUK_DUZ = [
    'int[] q = new int[CAP]; int front = 0, rear = -1;',
    '',
    'boolean enqueue(int x) {',
    '    if (rear == CAP - 1) return false;   // "full"?',
    '    q[++rear] = x;',
    '    return true;',
    '}',
    '',
    'Integer dequeue() {',
    '    if (front > rear) return null;       // empty',
    '    return q[front++];',
    '}',
    '',
]


def array_queue_drift():
    a = Anim('array-queue-drift', 'Düz dizide kuyruk ve kayma sorunu', 'Queue in a plain array and the drift problem',
             yuk=300, kod={'c': C_KUYRUK_DUZ, 'java': JAVA_KUYRUK_DUZ})
    CAP, X0, DX, Y = 5, 170, 96, 130
    for i in range(CAP):
        a.kutu(f'h{i}', X0 + i * DX, Y, '', w=80, h=50, st='bos', alt=f'[{i}]')
    a.etiket('dur', 410, 270, 'front = 0 · rear = -1', boyut=17, kod=True)
    a.kare('Kuyruk (queue) bekleme sırasıdır: arkaya eklenir (enqueue), önden çıkar (dequeue). İlk giren, İlk çıkar (FIFO). Beş hücrelik bir diziyle başlayalım.',
           'A queue is a waiting line: we add at the back (enqueue) and remove from the front (dequeue). First In, First Out (FIFO). Let us start with a five-cell array.',
           {'c': 1, 'java': 1})
    front, rear = 0, -1
    for x in (10, 20, 30, 40):
        rear += 1
        a.ayarla(f'h{rear}', metin=str(x), st='yeni')
        for i in range(rear):
            a.ayarla(f'h{i}', st='normal')
        if not a.var('rear'):
            a.isaretci('rear', f'h{rear}', 'rear', yon='ust', uzak=30)
            a.isaretci('front', f'h{front}', 'front', yon='alt', uzak=44, st='vurgu')
        a.ayarla('rear', hedef=f'h{rear}')
        a.ayarla('dur', metin=f'front = {front} · rear = {rear}')
        a.kare(f'`enqueue({x})`: `rear` bir ilerler ({rear}) ve {x} oraya yazılır.',
               f'`enqueue({x})`: `rear` moves forward ({rear}) and {x} is written there.', {'c': [4, 5], 'java': [4, 5]})
    for _ in range(2):
        a.ayarla(f'h{front}', st='soluk')
        v = a.og[f'h{front}']['metin']
        front += 1
        a.ayarla('front', hedef=f'h{front}')
        a.ayarla('dur', metin=f'front = {front} · rear = {rear}')
        a.kare(f'`dequeue()`: öndeki {v} çıkar; `front` bir ileri gider. Elemanları kaydırmıyoruz, yalnız indeksi ilerletiyoruz: O(1).',
               f'`dequeue()`: {v} at the front leaves; `front` moves forward. We do not shift elements, we only advance the index: O(1).',
               {'c': [10, 11], 'java': [10, 11]})
    for i in range(front):
        a.ayarla(f'h{i}', metin='', st='bos')
    rear += 1
    a.ayarla(f'h{rear}', metin='50', st='yeni')
    a.ayarla('rear', hedef=f'h{rear}')
    a.ayarla('dur', metin=f'front = {front} · rear = {rear}')
    a.kare('`enqueue(50)`: son hücreye yazıldı. Kuyruk sağa doğru "kayıyor".',
           '`enqueue(50)`: written into the last cell. The queue is "drifting" to the right.', {'c': [4, 5], 'java': [4, 5]})
    for i in range(front):
        a.ayarla(f'h{i}', st='sil')
    a.etiket('uyari', 410, 40, T('"DOLU" ama [0] ve [1] boş!', '"FULL" but [0] and [1] are empty!'), st='sil', boyut=18, kalin=True)
    a.kare('`enqueue(60)`: `rear == CAP - 1` olduğu için "dolu" der; oysa önde iki boş hücre var! Çözüm: sona gelince başa dönmek → **dairesel kuyruk**.',
           '`enqueue(60)`: it says "full" because `rear == CAP - 1`, yet two cells at the front are empty! The fix: wrap around to the start → a **circular queue**.',
           {'c': 4, 'java': 4})
    return a


C_DAIRESEL = [
    'int q[CAP]; int front = 0, rear = -1, count = 0;',
    '',
    'bool enqueue(int x) {',
    '    if (count == CAP) return false;        /* full */',
    '    rear = (rear + 1) % CAP;               /* wrap around */',
    '    q[rear] = x;',
    '    count++;',
    '    return true;',
    '}',
    '',
    'bool dequeue(int *out) {',
    '    if (count == 0) return false;          /* empty */',
    '    *out = q[front];',
    '    front = (front + 1) % CAP;',
    '    count--;',
    '    return true;',
    '}',
]
JAVA_DAIRESEL = [
    'int[] q = new int[CAP]; int front = 0, rear = -1, count = 0;',
    '',
    'boolean enqueue(int x) {',
    '    if (count == CAP) return false;        // full',
    '    rear = (rear + 1) % CAP;               // wrap around',
    '    q[rear] = x;',
    '    count++;',
    '    return true;',
    '}',
    '',
    'Integer dequeue() {',
    '    if (count == 0) return null;           // empty',
    '    int out = q[front];',
    '    front = (front + 1) % CAP;',
    '    count--;',
    '    return out;',
    '}',
]


def circular_queue():
    a = Anim('circular-queue', 'Dairesel kuyruk', 'Circular queue', gen=820, yuk=400,
             kod={'c': C_DAIRESEL, 'java': JAVA_DAIRESEL})
    CAP, CX, CY, R = 5, 300, 205, 120
    yonler = {}
    for i in range(CAP):
        aci = -math.pi / 2 + i * 2 * math.pi / CAP
        x, y = CX + R * math.cos(aci), CY + R * math.sin(aci)
        a.kutu(f'h{i}', x - 36, y - 24, '', w=72, h=48, st='bos')
        dx, dy = math.cos(aci), math.sin(aci)
        a.etiket(f'i{i}', CX + (R - 62) * dx, CY + (R - 62) * dy + 5, f'[{i}]', st='soluk', boyut=13, kod=True)
        yonler[i] = ('sag' if dx > 0 else 'sol') if abs(dx) > abs(dy) else ('alt' if dy > 0 else 'ust')
    a.etiket('dur', 640, 150, 'front = 0', boyut=18, kod=True, hiza='middle')
    a.etiket('dur2', 640, 185, 'rear = -1', boyut=18, kod=True, hiza='middle')
    a.etiket('dur3', 640, 220, 'count = 0', boyut=18, kod=True, hiza='middle', kalin=True)
    a.kare('Aynı beş hücreyi bir halka gibi düşünelim: [4]\'ten sonra [0] gelir. Bunu `(i + 1) % CAP` ile yaparız. '
           'Dolu/boş ayrımı için ayrıca `count` tutuyoruz.',
           'Think of the same five cells as a ring: after [4] comes [0]. We do this with `(i + 1) % CAP`. '
           'We also keep `count` to tell full from empty.', {'c': 1, 'java': 1})
    front, rear, count = 0, -1, 0

    def guncelle():
        a.ayarla('dur', metin=f'front = {front}')
        a.ayarla('dur2', metin=f'rear = {rear}')
        a.ayarla('dur3', metin=f'count = {count}')
        if count:
            if not a.var('front'):
                a.isaretci('front', f'h{front}', 'front', yon=yonler[front], st='vurgu', uzak=22)
                a.isaretci('rear', f'h{rear}', 'rear', yon=yonler[rear], uzak=22)
            a.ayarla('front', hedef=f'h{front}', yon=yonler[front], uzak=50 if front == rear else 22)
            a.ayarla('rear', hedef=f'h{rear}', yon=yonler[rear], uzak=22)

    def enq(x, not_tr='', not_en=''):
        nonlocal rear, count
        for i in range(CAP):
            if a.og[f'h{i}']['st'] == 'yeni':
                a.ayarla(f'h{i}', st='normal')
        eski = rear
        rear = (rear + 1) % CAP
        count += 1
        a.ayarla(f'h{rear}', metin=str(x), st='yeni')
        guncelle()
        a.kare(f'`enqueue({x})`: `rear = ({eski} + 1) % 5 = {rear}`, {x} oraya yazılır, `count` {count} olur.' + not_tr,
               f'`enqueue({x})`: `rear = ({eski} + 1) % 5 = {rear}`, {x} is written there, `count` becomes {count}.' + not_en,
               {'c': [5, 6, 7], 'java': [5, 6, 7]})

    def deq():
        nonlocal front, count
        for i in range(CAP):
            if a.og[f'h{i}']['st'] == 'yeni':
                a.ayarla(f'h{i}', st='normal')
        v = a.og[f'h{front}']['metin']
        a.ayarla(f'h{front}', metin='', st='bos')
        eski = front
        front = (front + 1) % CAP
        count -= 1
        guncelle()
        a.kare(f'`dequeue()`: öndeki {v} çıkar; `front = ({eski} + 1) % 5 = {front}`, `count` {count} olur.',
               f'`dequeue()`: {v} at the front leaves; `front = ({eski} + 1) % 5 = {front}`, `count` becomes {count}.',
               {'c': [13, 14, 15], 'java': [13, 14, 15]})

    for x in (10, 20, 30, 40):
        enq(x)
    deq()
    deq()
    enq(50)
    enq(60, ' **Başa döndük!** Düz dizide burada "dolu" demiştik; halkada boş hücreyi kullanıyoruz.',
        ' **We wrapped around!** The plain array said "full" here; the ring reuses the free cell.')
    enq(70)
    for i in range(CAP):
        a.ayarla(f'h{i}', st='sil')
    a.etiket('uyari', 640, 290, T('DOLU: count == 5', 'FULL: count == 5'), st='sil', boyut=18, kalin=True)
    a.kare('`enqueue(80)`: `count == CAP`, bu kez kuyruk gerçekten dolu; `false` döner. Bütün işlemler O(1) ve hiçbir hücre boşa gitmiyor.',
           '`enqueue(80)`: `count == CAP`, this time the queue really is full; it returns `false`. Every operation is O(1) and no cell is wasted.',
           {'c': 4, 'java': 4})
    return a


C_BAGLI_KUYRUK = [
    'typedef struct QNode { int data; struct QNode *next; } QNode;',
    'QNode *front = NULL, *rear = NULL;',
    '',
    'void enqueue(int x) {',
    '    QNode *n = malloc(sizeof(QNode));',
    '    n->data = x; n->next = NULL;',
    '    if (rear == NULL) front = rear = n;   /* first node */',
    '    else { rear->next = n; rear = n; }',
    '}',
    '',
    'bool dequeue(int *out) {',
    '    if (front == NULL) return false;',
    '    QNode *tmp = front;',
    '    *out = tmp->data;',
    '    front = front->next;',
    '    if (front == NULL) rear = NULL;       /* became empty */',
    '    free(tmp);',
    '    return true;',
    '}',
]
JAVA_BAGLI_KUYRUK = [
    'class QNode { int data; QNode next; }',
    'QNode front = null, rear = null;',
    '',
    'void enqueue(int x) {',
    '    QNode n = new QNode();',
    '    n.data = x; n.next = null;',
    '    if (rear == null) front = rear = n;   // first node',
    '    else { rear.next = n; rear = n; }',
    '}',
    '',
    'Integer dequeue() {',
    '    if (front == null) return null;',
    '    QNode tmp = front;',
    '    int out = tmp.data;',
    '    front = front.next;',
    '    if (front == null) rear = null;       // became empty',
    '    // the garbage collector frees tmp',
    '    return out;',
    '}',
]


def linked_queue():
    a = Anim('linked-queue', 'Bağlı liste ile kuyruk', 'Linked-list queue', yuk=320,
             kod={'c': C_BAGLI_KUYRUK, 'java': JAVA_BAGLI_KUYRUK})
    X0, Y, DX = 120, 160, 140
    a.etiket('bos', 300, 180, T('boş kuyruk: front = rear = NULL', 'empty queue: front = rear = NULL'), st='soluk', boyut=16)
    a.kare('Bağlı kuyrukta iki işaretçi tutarız: `front` (çıkış ucu) ve `rear` (giriş ucu). Başlangıçta ikisi de NULL.',
           'A linked queue keeps two pointers: `front` (where we remove) and `rear` (where we add). Both start as NULL.',
           {'c': [1, 2], 'java': [1, 2]})
    dugumler = []
    for k, x in enumerate((10, 20, 30)):
        nid = f'n{k}'
        a.dugum(nid, X0 + k * DX, Y, str(x), st='yeni', bos=True)
        if a.var('bos'):
            a.sil('bos')
        if not dugumler:
            a.isaretci('front', nid, 'front', yon='alt', st='vurgu', uzak=30)
            a.isaretci('rear', nid, 'rear', yon='ust', uzak=30)
            a.kare(f'`enqueue({x})`: ilk düğüm. Kuyrukta tek eleman olduğu için `front` ve `rear` aynı düğümü gösterir.',
                   f'`enqueue({x})`: the first node. With a single element, `front` and `rear` point to the same node.',
                   {'c': [5, 6, 7], 'java': [5, 6, 7]})
        else:
            onceki = dugumler[-1]
            a.ayarla(onceki, bos=False)
            a.ok(f'o{onceki}', onceki, nid, st='yeni')
            a.kare(f'`enqueue({x})`: yeni düğüm oluşturulur; `rear->next = n` ile son düğüm ona bağlanır.',
                   f'`enqueue({x})`: a new node is created; `rear->next = n` links the last node to it.', {'c': [5, 6, 8], 'java': [5, 6, 8]})
            a.ayarla('rear', hedef=nid)
            a.ayarla(f'o{onceki}', st='normal')
            a.kare('`rear = n`: giriş ucu yeni düğüme geçer. Sona eklemek için listeyi baştan gezmek gerekmez: O(1).',
                   '`rear = n`: the back pointer moves to the new node. No need to walk the list to add at the end: O(1).',
                   {'c': 8, 'java': 8})
        a.ayarla(nid, st='normal')
        dugumler.append(nid)
    a.ayarla(dugumler[0], st='vurgu')
    a.isaretci('tmp', dugumler[0], 'tmp', yon='sol', st='vurgu', uzak=10)
    a.kare('`dequeue()`: `tmp` öndeki düğümü tutar; değeri (10) çağırana verilir.',
           '`dequeue()`: `tmp` holds the front node; its value (10) is handed to the caller.', {'c': [13, 14], 'java': [13, 14]})
    a.ayarla('front', hedef=dugumler[1])
    a.kare('`front = front->next`: çıkış ucu bir sonraki düğüme (20) geçer. İlk giren (10) ilk çıktı: FIFO.',
           '`front = front->next`: the front moves to the next node (20). The first in (10) was the first out: FIFO.', {'c': 15, 'java': 15})
    a.sil(dugumler[0], f'o{dugumler[0]}', 'tmp')
    a.kare('`free(tmp)`: eski düğümün belleği geri verilir. Kuyruk boşalsaydı `rear` da NULL yapılırdı (satır 16).',
           '`free(tmp)`: the old node\'s memory is released. Had the queue become empty, `rear` would also be set to NULL (line 16).',
           {'c': [16, 17], 'java': [16, 17]})
    for i, d in enumerate(dugumler[1:]):
        a.tasi(d, X0 + i * DX, Y)
    a.kare('Sonuç: kuyrukta 20 ve 30 var. İki işaretçi sayesinde iki uç da O(1); kapasite sınırı yok.',
           'Result: 20 and 30 are in the queue. Thanks to the two pointers both ends are O(1); there is no capacity limit.')
    return a


C_DEQUE = [
    'Deque d = deque_new();   /* empty */',
    'push_back(&d, 10);',
    'push_back(&d, 20);',
    'push_front(&d, 5);',
    'pop_back(&d);            /* 20 leaves */',
    'push_front(&d, 1);',
    'pop_front(&d);           /* 1 leaves */',
]
JAVA_DEQUE = [
    'Deque<Integer> d = new ArrayDeque<>();',
    'd.addLast(10);',
    'd.addLast(20);',
    'd.addFirst(5);',
    'd.pollLast();            // 20 leaves',
    'd.addFirst(1);',
    'd.pollFirst();           // 1 leaves',
]


def deque():
    a = Anim('deque', 'Çift uçlu kuyruk (deque)', 'Double-ended queue (deque)', yuk=260,
             kod={'c': C_DEQUE, 'java': JAVA_DEQUE})
    Y, DX, MERKEZ = 110, 76, 400
    a.etiket('sol', 90, 138, T('ön (front)', 'front'), st='soluk', boyut=15)
    a.etiket('sag', 710, 138, T('arka (back)', 'back'), st='soluk', boyut=15)
    a.kare('Deque (double-ended queue) iki uçtan da ekleme ve çıkarmaya izin verir. Yığın ve kuyruğun birleşimi gibidir.',
           'A deque (double-ended queue) allows adding and removing at both ends. It is like a stack and a queue combined.',
           {'c': 1, 'java': 1})
    el = []
    sayac = [0]

    def diz():
        bas = MERKEZ - len(el) * DX / 2
        for i, e in enumerate(el):
            a.tasi(e, bas + i * DX, Y)

    def ekle(v, onden, satir, tr, en):
        for e in el:
            a.ayarla(e, st='normal')
        sayac[0] += 1
        eid = f'e{sayac[0]}'
        bas = MERKEZ - len(el) * DX / 2
        a.kutu(eid, (bas - DX if onden else bas + len(el) * DX), Y, str(v), w=64, h=48, st='yeni', boyut=20)
        (el.insert(0, eid) if onden else el.append(eid))
        diz()
        a.kare(tr, en, {'c': satir, 'java': satir})

    def cikar(onden, satir, tr, en):
        for e in el:
            a.ayarla(e, st='normal')
        eid = el.pop(0) if onden else el.pop()
        a.sil(eid)
        diz()
        a.kare(tr, en, {'c': satir, 'java': satir})

    ekle(10, False, 2, '`push_back(10)`: arkaya eklendi.', '`push_back(10)`: added at the back.')
    ekle(20, False, 3, '`push_back(20)`: yine arkaya.', '`push_back(20)`: at the back again.')
    ekle(5, True, 4, '`push_front(5)`: bu kez **öne** eklendi; kuyrukta bu yapılamazdı.', '`push_front(5)`: this time at the **front**; a queue could not do this.')
    cikar(False, 5, '`pop_back()`: arkadaki 20 çıktı (yığın gibi).', '`pop_back()`: 20 at the back left (like a stack).')
    ekle(1, True, 6, '`push_front(1)`: öne eklendi.', '`push_front(1)`: added at the front.')
    cikar(True, 7, '`pop_front()`: öndeki 1 çıktı (kuyruk gibi). Dört işlemin hepsi O(1); dairesel dizi ya da çift bağlı liste ile gerçekleştirilir.',
          '`pop_front()`: 1 at the front left (like a queue). All four operations are O(1); implemented with a circular array or a doubly linked list.')
    return a


# ============================================================ 5. Hanoi ve özyineleme
C_HANOI = [
    'void tower_of_hanoi(int n, char from, char to, char via) {',
    '    if (n == 0) return;                  /* nothing to move */',
    '    tower_of_hanoi(n - 1, from, via, to);         /* move n-1 out of the way */',
    '    move_disk(n, from, to);              /* move the largest */',
    '    tower_of_hanoi(n - 1, via, to, from);         /* put n-1 back on top */',
    '}',
]
JAVA_HANOI = [
    'void tower_of_hanoi(int n, char from, char to, char via) {',
    '    if (n == 0) return;                  // nothing to move',
    '    tower_of_hanoi(n - 1, from, via, to);         // move n-1 out of the way',
    '    moveDisk(n, from, to);               // move the largest',
    '    tower_of_hanoi(n - 1, via, to, from);         // put n-1 back on top',
    '}',
]


def tower_of_hanoi():
    a = Anim('tower-of-hanoi', 'Hanoi Kulesi (3 disk)', 'Tower of Hanoi (3 disks)', yuk=320,
             kod={'c': C_HANOI, 'java': JAVA_HANOI})
    CUBUK = {'A': 170, 'B': 410, 'C': 650}
    TABAN, DH = 262, 34
    a.kutu('taban', 60, TABAN, '', w=700, h=12, st='soluk')
    for ad, x in CUBUK.items():
        a.kutu(f'c{ad}', x - 6, 108, '', w=12, h=154, st='soluk')
        a.etiket(f'l{ad}', x, 300, ad, boyut=18, kalin=True)
    GEN = {1: 84, 2: 128, 3: 172}
    kule = {'A': [3, 2, 1], 'B': [], 'C': []}
    for d in (3, 2, 1):
        i = kule['A'].index(d)
        a.kutu(f'd{d}', CUBUK['A'] - GEN[d] / 2, TABAN - (i + 1) * DH, str(d), w=GEN[d], h=DH - 4, st='aktif', boyut=17)
    a.etiket('sayac', 410, 40, T('hamle 0 / 7', 'move 0 / 7'), boyut=16, kod=True)
    a.kare('Kural: diskleri A\'dan C\'ye taşı; her seferinde tek disk, büyük disk küçüğün üstüne konamaz. '
           'Fikir özyinelemeli: üstteki n−1 diski kenara çek, en büyüğü taşı, n−1 diski onun üstüne geri koy.',
           'Rules: move the disks from A to C; one disk at a time, never a larger disk on a smaller one. '
           'The idea is recursive: move the top n−1 disks aside, move the largest, put the n−1 disks back on top of it.',
           {'c': [1, 2, 3, 4, 5], 'java': [1, 2, 3, 4, 5]})
    hamleler = []

    def coz(n, kay, hed, ara):
        if n == 0:
            return
        coz(n - 1, kay, ara, hed)
        hamleler.append((n, kay, hed))
        coz(n - 1, ara, hed, kay)

    coz(3, 'A', 'C', 'B')
    for k, (d, kay, hed) in enumerate(hamleler, 1):
        kule[kay].remove(d)
        a.tasi(f'd{d}', CUBUK[kay] - GEN[d] / 2, 62)
        a.ayarla(f'd{d}', st='vurgu')
        a.ayarla('sayac', metin=T(f'hamle {k} / 7', f'move {k} / 7'))
        a.kare(f'{k}. hamle: {d} numaralı disk {kay} çubuğundan kaldırılır…',
               f'Move {k}: disk {d} is lifted off rod {kay}…', {'c': 4, 'java': 4})
        kule[hed].append(d)
        a.tasi(f'd{d}', CUBUK[hed] - GEN[d] / 2, TABAN - len(kule[hed]) * DH)
        a.ayarla(f'd{d}', st='aktif')
        a.kare(f'…ve {hed} çubuğuna konur.', f'…and placed on rod {hed}.', {'c': 4, 'java': 4})
    a.kare('Bitti: 7 hamle. n disk için hamle sayısı 2ⁿ − 1\'dir (üstel büyüme). 64 diskte saniyede bir hamleyle yaklaşık 585 milyar yıl sürer!',
           'Done: 7 moves. For n disks it takes 2ⁿ − 1 moves (exponential growth). With 64 disks at one move per second it would take about 585 billion years!')
    return a


C_FAKT = [
    'int fact(int n) {',
    '    if (n == 0)            /* base case */',
    '        return 1;',
    '    return n * fact(n - 1);',
    '}',
    '',
    'int main(void) {',
    '    int r = fact(3);',
    '    printf("%d\\n", r);   /* 6 */',
    '}',
]
JAVA_FAKT = [
    'static int fact(int n) {',
    '    if (n == 0)            // base case',
    '        return 1;',
    '    return n * fact(n - 1);',
    '}',
    '',
    'public static void main(String[] args) {',
    '    int r = fact(3);',
    '    System.out.println(r); // 6',
    '}',
]


def recursion_call_stack():
    a = Anim('recursion-call-stack', 'Özyineleme ve çağrı yığını: fact(3)', 'Recursion and the call stack: fact(3)',
             yuk=380, kod={'c': C_FAKT, 'java': JAVA_FAKT})
    X, Y0, H = 250, 320, 58
    a.cerceve('cy', X - 20, 40, 340, 320, baslik=T('çağrı yığını', 'call stack'))
    a.kutu('main', X, Y0 - H, 'main()', w=300, h=H - 8, boyut=17)
    a.kare('Her fonksiyon çağrısı, çağrı yığınına bir **çerçeve** (yerel değişkenler ve dönüş adresi) iter. `main` başladı.',
           'Every function call pushes a **frame** (local variables and the return address) onto the call stack. `main` has started.',
           {'c': 7, 'java': 7})
    for k, n in enumerate((3, 2, 1, 0)):
        fid = f'f{n}'
        a.hepsi_st('normal', tur='kutu')
        a.kutu(fid, X, Y0 - (k + 2) * H, f'fact(n = {n})', w=300, h=H - 8, st='yeni', boyut=17)
        if n > 0:
            a.kare(f'`fact({n})` çağrıldı: yeni çerçeve itilir. n = {n} sıfır değil, bu yüzden `{n} * fact({n - 1})` hesaplanmalı; önce `fact({n - 1})` beklenir.',
                   f'`fact({n})` is called: a new frame is pushed. n = {n} is not zero, so `{n} * fact({n - 1})` is needed; first we wait for `fact({n - 1})`.',
                   {'c': [1, 4] if k else [8], 'java': [1, 4] if k else [8]})
        else:
            a.ayarla(fid, st='vurgu')
            a.kare('`fact(0)`: **temel durum**. Artık kendini çağırmaz, doğrudan 1 döner. Temel durum olmasaydı yığın dolup taşardı (stack overflow).',
                   '`fact(0)`: the **base case**. It no longer calls itself and returns 1 directly. Without a base case the stack would overflow.',
                   {'c': [2, 3], 'java': [2, 3]})
    sonuc = 1
    for n in (0, 1, 2, 3):
        fid = f'f{n}'
        if n > 0:
            sonuc = n * sonuc
        a.ayarla(fid, metin=f'fact({n}) → {sonuc}', st='yeni')
        a.kare(f'`fact({n})` {sonuc} değerini döndürür' + (f' ({n} × {sonuc // n})' if n else '') + '; çerçevesi yığından çekilir (pop).',
               f'`fact({n})` returns {sonuc}' + (f' ({n} × {sonuc // n})' if n else '') + '; its frame is popped off the stack.',
               {'c': 4 if n else 3, 'java': 4 if n else 3})
        a.sil(fid)
    a.ayarla('main', metin='main(): r = 6', st='yeni')
    a.kare('Sonuç 6 `main`e ulaştı. Çağrı yığını tam bir LIFO yığınıdır: en son çağrılan en önce biter. n derinliğinde özyineleme O(n) yığın belleği kullanır.',
           'The result 6 reaches `main`. The call stack is a true LIFO stack: the last call to start is the first to finish. Recursion of depth n uses O(n) stack memory.',
           {'c': [8, 9], 'java': [8, 9]})
    return a



# ============================================================ added: prefix, recursion basics, multilevel queue
C_PREFIX = [
    'int eval_prefix(char *tok[], int n) {',
    '    int st[100]; int top = -1;',
    '    for (int i = n - 1; i >= 0; i--) {   /* right to left */',
    '        char *t = tok[i];',
    '        if (isdigit(t[0])) {',
    '            st[++top] = atoi(t);          /* number: push */',
    '        } else {',
    '            int a = st[top--];            /* left operand */',
    '            int b = st[top--];            /* right operand */',
    '            st[++top] = apply(t[0], a, b);',
    '        }',
    '    }',
    '    return st[top];                       /* the answer */',
    '}',
]
JAVA_PREFIX = [
    'int evalPrefix(String[] tok) {',
    '    int[] st = new int[100]; int top = -1;',
    '    for (int i = tok.length - 1; i >= 0; i--) {  // right to left',
    '        String t = tok[i];',
    '        if (Character.isDigit(t.charAt(0))) {',
    '            st[++top] = Integer.parseInt(t);  // number: push',
    '        } else {',
    '            int a = st[top--];            // left operand',
    '            int b = st[top--];            // right operand',
    '            st[++top] = apply(t.charAt(0), a, b);',
    '        }',
    '    }',
    '    return st[top];                       // the answer',
    '}',
]


def prefix_evaluation():
    tok = ['*', '+', '5', '3', '-', '8', '2']
    a = Anim('prefix-evaluation', 'Prefix ifade değerlendirme', 'Evaluating a prefix expression',
             yuk=380, kod={'c': C_PREFIX, 'java': JAVA_PREFIX})
    _dizgi(a, tok, x0=120)
    a.cerceve('yf', 604, 150, 110, 210, baslik=T('yığın', 'stack'))
    a.kare("`* + 5 3 - 8 2` prefix (önek) yazımdır: işleç, işlenenlerinden **önce** gelir. Postfix'in aynası: bu kez girdiyi "
           "**sağdan sola** okuyoruz. Beklenen sonuç yine (5 + 3) × (8 − 2) = 48.",
           "`* + 5 3 - 8 2` is prefix notation: the operator comes **before** its operands. It mirrors postfix: this time we read "
           "the input **right to left**. The expected result is again (5 + 3) × (8 − 2) = 48.", {'c': [1, 2, 3], 'java': [1, 2, 3]})
    yig, sayac = [], [0]

    def it(v):
        sayac[0] += 1
        sid = f's{sayac[0]}'
        a.kutu(sid, 614, 320 - len(yig) * 46, str(v), w=90, h=40, st='yeni', boyut=20)
        yig.append(sid)

    for i in range(len(tok) - 1, -1, -1):
        t = tok[i]
        for j in range(len(tok)):
            a.ayarla(f't{j}', st='soluk' if j > i else 'normal')
        a.ayarla(f't{i}', st='vurgu')
        for s_ in yig:
            a.ayarla(s_, st='normal')
        if t.isdigit():
            it(t)
            a.kare(f'`{t}` bir sayı: yığına it.', f'`{t}` is a number: push it.', {'c': [5, 6], 'java': [5, 6]})
            continue
        a_id, b_id = yig[-1], yig[-2]
        av, bv = int(a.og[a_id]['metin']), int(a.og[b_id]['metin'])
        a.ayarla(a_id, st='vurgu')
        a.ayarla(b_id, st='vurgu')
        sonuc = {'+': av + bv, '-': av - bv, '*': av * bv}[t]
        isaret = {'+': '+', '-': '−', '*': '×'}[t]
        a.etiket('hesap', 400, 230, f'{av} {isaret} {bv} = {sonuc}', st='vurgu', boyut=24, kalin=True, kod=True)
        a.kare(f"`{t}` bir işleç. Postfix'in tersine, ilk çekilen **sol** işlenendir (a = {av}), ikincisi sağ (b = {bv}): {av} {isaret} {bv}.",
               f"`{t}` is an operator. Unlike postfix, the first value popped is the **left** operand (a = {av}), the second the right one (b = {bv}): {av} {isaret} {bv}.",
               {'c': [8, 9], 'java': [8, 9]})
        a.sil(a_id, b_id, 'hesap')
        yig.pop()
        yig.pop()
        it(sonuc)
        a.kare(f'Sonuç ({sonuc}) yığına geri itilir.', f'The result ({sonuc}) is pushed back.', {'c': 10, 'java': 10})
    a.ayarla(yig[-1], st='yeni')
    for j in range(len(tok)):
        a.ayarla(f't{j}', st='soluk')
    a.kare('Girdi bitti; yığında tek değer kaldı: **48**. Prefix ve postfix aynı fikrin iki yönüdür; ikisi de parantezsiz ve O(n).',
           'The input is over; one value is left: **48**. Prefix and postfix are the same idea in two directions; both need no parentheses and run in O(n).',
           {'c': 13, 'java': 13})
    return a


C_INFIX_PREFIX = [
    'void to_prefix(const char *in, char *out) {',
    '    char rev[100], tmp[100];',
    '    reverse_copy(in, rev);                 /* 1) reverse the input */',
    '    char ops[100]; int top = -1, k = 0;',
    '    for (int i = 0; rev[i]; i++) {         /* 2) shunting-yard */',
    '        char c = rev[i];',
    '        if (isalnum(c)) { tmp[k++] = c; continue; }',
    '        while (top >= 0 && prec(ops[top]) > prec(c))',
    '            tmp[k++] = ops[top--];         /* strictly stronger */',
    '        ops[++top] = c;',
    '    }',
    '    while (top >= 0) tmp[k++] = ops[top--];',
    "    tmp[k] = '\\0';",
    '    reverse_copy(tmp, out);                /* 3) reverse again */',
    '}',
]
JAVA_INFIX_PREFIX = [
    'String toPrefix(String in) {',
    '    String rev = new StringBuilder(in).reverse().toString(); // 1)',
    '    StringBuilder tmp = new StringBuilder();',
    '    char[] ops = new char[100]; int top = -1;',
    '    for (int i = 0; i < rev.length(); i++) {  // 2) shunting-yard',
    '        char c = rev.charAt(i);',
    '        if (Character.isLetterOrDigit(c)) { tmp.append(c); continue; }',
    '        while (top >= 0 && prec(ops[top]) > prec(c))',
    '            tmp.append(ops[top--]);            // strictly stronger',
    '        ops[++top] = c;',
    '    }',
    '    while (top >= 0) tmp.append(ops[top--]);',
    '',
    '    return tmp.reverse().toString();           // 3) reverse again',
    '}',
]


def infix_to_prefix():
    s = 'A+B*C-D'
    r = s[::-1]
    a = Anim('infix-to-prefix', "Infix ifadeyi prefix'e çevirme", 'Converting infix to prefix',
             yuk=440, kod={'c': C_INFIX_PREFIX, 'java': JAVA_INFIX_PREFIX})
    _dizgi(a, s, x0=110, onek='g')
    a.etiket('gl', 60, 78, T('girdi:', 'input:'), st='soluk', boyut=14, hiza='start')
    a.kare("Hedef: `A+B*C-D` ifadesini prefix'e çevirmek. Hile: girdiyi ters çevir, bildiğimiz yöntemi (tren makası) uygula, "
           "sonucu yine ters çevir. Beklenen: `- + A * B C D`.",
           'Goal: convert `A+B*C-D` to prefix. The trick: reverse the input, apply the method we already know (shunting-yard), '
           'then reverse the result. Expected: `- + A * B C D`.', {'c': [1, 2], 'java': [1]})
    _dizgi(a, r, y=140, x0=110, onek='t')
    a.etiket('tl', 60, 168, T('ters:', 'reversed:'), st='soluk', boyut=14, hiza='start')
    a.kare('1) Girdi ters çevrildi: `D-C*B+A`. Artık bunu soldan sağa işleyeceğiz.',
           '1) The input is reversed: `D-C*B+A`. Now we process it left to right.', {'c': 3, 'java': 2})
    a.cerceve('yf', 634, 220, 100, 200, baslik=T('işleç yığını', 'operator stack'))
    a.etiket('cl', 60, 400, T('çıktı:', 'output:'), st='soluk', boyut=15, hiza='start')
    ONC = {'+': 1, '-': 1, '*': 2, '/': 2}
    yig, cikti = [], []

    def cik(m):
        oid = f'c{len(cikti)}'
        a.kutu(oid, 130 + len(cikti) * 58, 375, m, w=48, h=42, st='yeni', boyut=20)
        cikti.append(oid)

    for i, c in enumerate(r):
        for j in range(len(r)):
            a.ayarla(f't{j}', st='soluk' if j < i else 'normal')
        a.ayarla(f't{i}', st='vurgu')
        for o in cikti + yig:
            a.ayarla(o, st='normal')
        if c.isalnum():
            cik(c)
            a.kare(f'`{c}` bir işlenen: çıktıya.', f'`{c}` is an operand: to the output.', {'c': 7, 'java': 7})
            continue
        while yig and ONC[a.og[yig[-1]]['metin']] > ONC[c]:
            ust = yig.pop()
            m = a.og[ust]['metin']
            a.ayarla(ust, st='vurgu')
            a.kare(f'`{c}` geldi; tepedeki `{m}` ondan **kesinlikle daha güçlü** → çıktıya. (Ters çevrilmiş girdide eşit öncelikli '
                   f'işleç çekilmez; böylece işlenenlerin sırası doğru kalır.)',
                   f'`{c}` arrives; `{m}` on top is **strictly stronger** → to the output. (On the reversed input an operator of equal '
                   f'precedence is not popped, which keeps the operand order right.)', {'c': [8, 9], 'java': [8, 9]})
            a.sil(ust)
            cik(m)
        sid = f's{i}'
        a.kutu(sid, 639, 380 - len(yig) * 46, c, w=90, h=40, st='yeni', boyut=20)
        yig.append(sid)
        a.kare(f'`{c}` işleç yığınına itilir.', f'`{c}` is pushed onto the operator stack.', {'c': 10, 'java': 10})
    while yig:
        ust = yig.pop()
        m = a.og[ust]['metin']
        a.sil(ust)
        cik(m)
    for j in range(len(r)):
        a.ayarla(f't{j}', st='soluk')
    a.kare('2) Girdi bitti; kalan işleçler boşaltıldı. Ara sonuç: `D C B * A + -`.',
           '2) The input is over; the remaining operators are flushed. Intermediate result: `D C B * A + -`.', {'c': 12, 'java': 12})
    son = [a.og[c]['metin'] for c in cikti][::-1]
    for k, c in enumerate(cikti):
        a.ayarla(c, metin=son[k], st='yeni')
    a.kare('3) Ara sonucu ters çevir: `- + A * B C D` — işte prefix. Her karakter bir kez itilir, bir kez çekilir: O(n).',
           '3) Reverse the intermediate result: `- + A * B C D` — that is the prefix form. Each character is pushed and popped once: O(n).',
           {'c': 14, 'java': 14})
    return a


C_COUNTDOWN = [
    'void countdown(int n) {',
    '    if (n == 0) {                /* base case */',
    '        printf("Liftoff!\\n");',
    '        return;',
    '    }',
    '    printf("%d\\n", n);',
    '    countdown(n - 1);            /* recursive case */',
    '}',
]
JAVA_COUNTDOWN = [
    'static void countdown(int n) {',
    '    if (n == 0) {                // base case',
    '        System.out.println("Liftoff!");',
    '        return;',
    '    }',
    '    System.out.println(n);',
    '    countdown(n - 1);            // recursive case',
    '}',
]


def recursion_countdown():
    a = Anim('recursion-countdown', 'Özyineleme: geri sayım', 'Recursion: countdown', yuk=380,
             kod={'c': C_COUNTDOWN, 'java': JAVA_COUNTDOWN})
    X, Y0, H = 120, 320, 58
    a.cerceve('cy', X - 20, 40, 300, 320, baslik=T('çağrı yığını', 'call stack'))
    a.etiket('ekl', 560, 60, T('ekran:', 'screen:'), st='soluk', boyut=15, hiza='start')
    a.kare('Özyineleme: bir fonksiyonun **kendini** daha küçük bir girdiyle çağırması. İki parça şart: durduran **temel durum** '
           've soruyu küçülten **özyinelemeli durum**. `countdown(3)` çağıralım.',
           'Recursion: a function calling **itself** on a smaller input. Two parts are essential: a **base case** that stops, and a '
           '**recursive case** that makes the problem smaller. Let us call `countdown(3)`.', {'c': 1, 'java': 1})
    ekran = []
    for k, n in enumerate((3, 2, 1, 0)):
        a.hepsi_st('normal', tur='kutu')
        a.kutu(f'f{n}', X, Y0 - (k + 1) * H, f'countdown(n = {n})', w=260, h=H - 8, st='yeni', boyut=16, kod=True)
        if n:
            ekran.append(str(n))
            a.etiket(f'e{n}', 560, 95 + 30 * (len(ekran) - 1), str(n), boyut=20, kalin=True, kod=True, hiza='start')
            a.kare(f'`countdown({n})`: n sıfır değil → önce {n} yazdır, sonra `countdown({n - 1})` çağır. Yeni çerçeve yığına itilir.',
                   f'`countdown({n})`: n is not zero → print {n}, then call `countdown({n - 1})`. A new frame is pushed.',
                   {'c': [2, 6, 7], 'java': [2, 6, 7]})
        else:
            a.ayarla('f0', st='vurgu')
            a.etiket('e0', 560, 95 + 30 * len(ekran), 'Liftoff!', st='yeni', boyut=20, kalin=True, kod=True, hiza='start')
            a.kare('`countdown(0)`: **temel durum**. "Liftoff!" yazar ve döner; artık kendini çağırmaz. Temel durum olmasaydı çağrılar hiç bitmezdi.',
                   '`countdown(0)`: the **base case**. It prints "Liftoff!" and returns; no more self-calls. Without it the calls would never end.',
                   {'c': [2, 3, 4], 'java': [2, 3, 4]})
    for n in (0, 1, 2, 3):
        a.sil(f'f{n}')
        a.kare(f'`countdown({n})` biter; çerçevesi yığından çekilir.', f'`countdown({n})` finishes; its frame is popped.',
               {'c': 8, 'java': 8})
    a.kare('Her çağrı bir çerçeve itti, her dönüş bir çerçeve çekti: özyineleme aslında bir yığındır. Derinlik n → O(n) bellek.',
           'Every call pushed a frame and every return popped one: recursion really is a stack. Depth n → O(n) memory.')
    return a


C_MLQ = [
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
    '}',
]
JAVA_MLQ = [
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
    '}',
]


def multilevel_queue():
    a = Anim('multilevel-queue', 'Çok seviyeli kuyruk', 'Multilevel queue', yuk=380,
             kod={'c': C_MLQ, 'java': JAVA_MLQ})
    AD = [T('0: sistem', '0: system'), T('1: etkileşimli', '1: interactive'), T('2: toplu iş', '2: batch')]
    for lvl in range(3):
        a.cerceve(f'q{lvl}', 200, 60 + lvl * 100, 380, 70, baslik=AD[lvl])
    a.kutu('cpu', 640, 150, 'CPU', w=100, h=70, st='aktif', boyut=20)
    a.kare("İşletim sistemi süreçleri türüne göre **ayrı kuyruklarda** tutar: sistem, etkileşimli, toplu iş. Her kuyruk kendi içinde FIFO'dur; "
           "kuyrukların arasında ise **öncelik** vardır.",
           'An operating system keeps processes in **separate queues** by type: system, interactive, batch. Each queue is FIFO inside; '
           'between queues there is a **priority** order.', {'c': 1, 'java': [1, 2]})
    gelen = [('P1', 1), ('P2', 2), ('P3', 0), ('P4', 1), ('P5', 0)]
    kuyruk = {0: [], 1: [], 2: []}
    for ad, lvl in gelen:
        kid = f'p{ad}'
        a.kutu(kid, 215 + len(kuyruk[lvl]) * 70, 75 + lvl * 100, ad, w=60, h=42, st='yeni', boyut=17)
        kuyruk[lvl].append(kid)
        a.kare(f'{ad} geldi, sınıfı {lvl}: kendi kuyruğunun sonuna eklenir (enqueue).',
               f'{ad} arrives, class {lvl}: it joins the back of its own queue (enqueue).', {'c': [3, 4], 'java': [3, 4]})
        a.ayarla(kid, st='normal')
    sira = []
    while any(kuyruk.values()):
        lvl = next(l for l in range(3) if kuyruk[l])
        kid = kuyruk[lvl].pop(0)
        ad = a.og[kid]['metin']
        a.tasi(kid, 660, 164)
        a.ayarla(kid, st='vurgu')
        for i, k in enumerate(kuyruk[lvl]):
            a.tasi(k, 215 + i * 70, 75 + lvl * 100)
        sira.append(ad)
        on_tr = 'üstteki seviyeler boş olduğu için ' if lvl else ''
        on_en = f'levels above {lvl} are empty, so ' if lvl else ''
        a.kare(f"Zamanlayıcı en üst seviyeden başlar; {on_tr}{lvl}. kuyruğun önündeki {ad} CPU'ya verilir. Sıra: {', '.join(sira)}.",
               f'The scheduler starts at the top level; {on_en}{ad} at the front of queue {lvl} gets the CPU. Order so far: {", ".join(sira)}.',
               {'c': [8, 9, 10], 'java': [8, 9, 10]})
        a.sil(kid)
    a.kare('Sonuç: P3, P5, P1, P4, P2. Tehlike: üst kuyruklar hiç boşalmazsa alttakiler **aç kalır** (starvation); çözüm olarak '
           'bekleyen süreçler zamanla üst kuyruğa taşınır (aging, çok seviyeli geri beslemeli kuyruk).',
           'Result: P3, P5, P1, P4, P2. The danger: if the upper queues never empty, the lower ones **starve**; the fix is to move '
           'waiting processes up over time (aging, the multilevel feedback queue).')
    return a

HEPSI = {
    'array-stack-push-pop': array_stack,
    'stack-overflow-underflow': stack_overflow,
    'linked-stack-push-pop': linked_stack,
    'bracket-matching': bracket_matching,
    'postfix-evaluation': postfix_evaluation,
    'infix-to-postfix': infix_to_postfix,
    'array-queue-drift': array_queue_drift,
    'circular-queue': circular_queue,
    'linked-queue': linked_queue,
    'deque': deque,
    'tower-of-hanoi': tower_of_hanoi,
    'recursion-call-stack': recursion_call_stack,
    'prefix-evaluation': prefix_evaluation,
    'infix-to-prefix': infix_to_prefix,
    'recursion-countdown': recursion_countdown,
    'multilevel-queue': multilevel_queue,
}

if __name__ == '__main__':
    adlar = [x for x in sys.argv[1:] if not x.startswith('-')] or list(HEPSI)
    hizli = '--hizli' in sys.argv          # yalnız JSON + HTML (GIF/PNG yok)
    for ad in adlar:
        yol = HEPSI[ad]().yaz(CIKTI, gif=not hizli, serit=not hizli)
        print('yazıldı:', yol.name)
