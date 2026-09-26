# -*- coding: utf-8 -*-
"""Week 4 -- Trees, Heaps, Priority Queues, Heap Sort, Huffman Coding animations.

Kullanım (depo kökünden):  py -3.12 tools/dsanim/week4.py [ad ...]
Çıktı: docs/week-4/anim/<ad>.{json,html,tr.gif,en.gif,tr.png,en.png}

Adlandırma kuralı (hocanın talimatı): bütün anahtarlar ve `ad` değerleri İngilizce kebab-case'dir
(hafta3'teki Türkçe adlandırmayı izleme). dsanim motorunun kendi metot adları (daire, ok, kare, kutu...)
Türkçe kalır; değişen yalnızca bu betiğin dosya adı ve kendi animasyon anahtarlarıdır.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from dsanim import Anim  # noqa: E402

KOK = pathlib.Path(__file__).resolve().parents[2]
CIKTI = KOK / 'docs' / 'week-4' / 'anim'


def T(tr, en):
    """İki dilli sahne yazısı."""
    return {'tr': tr, 'en': en}


# ============================================================ ortak: kanonik ağaç (animasyon 1-6)
POZ_AGAC = {
    8: (400, 60), 3: (220, 140), 10: (580, 140),
    1: (120, 220), 6: (320, 220), 14: (680, 220),
    4: (260, 300), 7: (380, 300), 13: (620, 300),
}
KENAR_AGAC = [(8, 3), (8, 10), (3, 1), (3, 6), (6, 4), (6, 7), (10, 14), (14, 13)]


def _agac_ciz(a):
    for v, (x, y) in POZ_AGAC.items():
        a.daire(f'n{v}', x, y, str(v))
    for p, c in KENAR_AGAC:
        a.ok(f'e{p}_{c}', f'n{p}', f'n{c}', tur='merkez')


def _agac_st(a, st='normal'):
    for v in POZ_AGAC:
        a.ayarla(f'n{v}', st=st)
    for p, c in KENAR_AGAC:
        a.ayarla(f'e{p}_{c}', st=st)


# ============================================================ ortak: öncelik/heap sahnesi (animasyon 7-10)
def _heap_konum(max_n, cx=410, ust_y=60, seviye_y=78, seviye_gen=680):
    poz = {}
    for i in range(max_n):
        seviye = (i + 1).bit_length() - 1
        ilk = 2 ** seviye - 1
        sayi = 2 ** seviye
        genislik = seviye_gen / sayi
        x = cx - seviye_gen / 2 + genislik * (i - ilk + 0.5)
        y = ust_y + seviye * seviye_y
        poz[i] = (x, y)
    return poz


def _heap_kur(max_n, kutu_dx=64, cx=410, **kw):
    poz = _heap_konum(max_n, cx=cx, **kw)
    kutu_x0 = cx - (max_n - 1) * kutu_dx / 2
    return poz, kutu_x0


def _heap_sync(a, dizi, boyut, poz, kutu_x0, kutu_dx, kutu_y, onek='h', disari_st='soluk', disari_gizle=True):
    """Ağaç (daire+ok) ve dizi (kutu) görünümünü `dizi`/`boyut` ile eş zamanla."""
    for i in range(len(dizi)):
        nid, eid, bid = f'{onek}n{i}', f'{onek}e{i}', f'{onek}b{i}'
        aktif = i < boyut
        if aktif:
            x, y = poz[i]
            if a.var(nid):
                a.tasi(nid, x, y)
                a.ayarla(nid, metin=str(dizi[i]), st='normal')
            else:
                a.daire(nid, x, y, str(dizi[i]))
            if i > 0:
                ebeveyn = (i - 1) // 2
                pid = f'{onek}n{ebeveyn}'
                if a.var(pid) and not a.var(eid):
                    a.ok(eid, pid, nid, tur='merkez')
        else:
            if a.var(nid):
                a.sil(nid)
            if a.var(eid):
                a.sil(eid)
        if not aktif and disari_gizle:
            if a.var(bid):
                a.sil(bid)
            continue
        st = 'normal' if aktif else disari_st
        x = kutu_x0 + i * kutu_dx
        if a.var(bid):
            a.ayarla(bid, metin=str(dizi[i]), st=st)
        else:
            a.kutu(bid, x, kutu_y, str(dizi[i]), w=52, h=44, st=st, alt=str(i))


def _heap_vurgu(a, onek, indeksler, st='vurgu'):
    for i in indeksler:
        nid, bid = f'{onek}n{i}', f'{onek}b{i}'
        if a.var(nid):
            a.ayarla(nid, st=st)
        if a.var(bid):
            a.ayarla(bid, st=st)


# ============================================================ 1. ağaç terimleri
C_TREE_BASICS = [
    '/* height: empty subtree = -1, single node = 0 */',
    'static int height(Node *node) {',
    '    if (node == NULL) return -1;',
    '    int lh = height(node->left);',
    '    int rh = height(node->right);',
    '    return 1 + (lh > rh ? lh : rh);',
    '}',
    '',
    '/* degree: number of non-null children (0, 1, or 2) */',
    'static int degree(Node *node) {',
    '    int d = 0;',
    '    if (node->left != NULL) d++;',
    '    if (node->right != NULL) d++;',
    '    return d;',
    '}',
    '',
    '/* depthOf: edge count from root to the node holding target, or -1 if absent */',
    'static int depth_of(Node *root, int target, int depth) {',
    '    if (root == NULL) return -1;',
    '    if (root->value == target) return depth;',
    '    int left_depth = depth_of(root->left, target, depth + 1);',
    '    if (left_depth != -1) return left_depth;',
    '    return depth_of(root->right, target, depth + 1);',
    '}',
]
JAVA_TREE_BASICS = [
    '/* height: empty subtree = -1, single node = 0 */',
    'static int height(Node node) {',
    '    if (node == null) return -1;',
    '    int lh = height(node.left);',
    '    int rh = height(node.right);',
    '    return 1 + Math.max(lh, rh);',
    '}',
    '',
    '/* degree: number of non-null children (0, 1, or 2) */',
    'static int degree(Node node) {',
    '    int d = 0;',
    '    if (node.left != null) d++;',
    '    if (node.right != null) d++;',
    '    return d;',
    '}',
    '',
    '/* depthOf: edge count from root to the node holding target, or -1 if absent */',
    'static int depthOf(Node root, int target, int depth) {',
    '    if (root == null) return -1;',
    '    if (root.value == target) return depth;',
    '    int leftDepth = depthOf(root.left, target, depth + 1);',
    '    if (leftDepth != -1) return leftDepth;',
    '    return depthOf(root.right, target, depth + 1);',
    '}',
]


def tree_terminology():
    a = Anim('tree-terminology', 'Ağaç terimleri', 'Tree terminology', gen=820, yuk=420,
             kod={'c': C_TREE_BASICS, 'java': JAVA_TREE_BASICS})
    _agac_ciz(a)
    a.kare('Bu haftanın örnek ağacı (tree): her daire bir düğüm (node), her çizgi bir kenar (edge). '
           'Bu, bir ikili arama ağacı (binary search tree): her düğümün en fazla iki çocuğu var, sol < düğüm < sağ.',
           'Our tree (tree) for this week: every circle is a node, every line is an edge. '
           'This is a binary search tree: every node has at most two children, left < node < right.')
    _agac_st(a, 'soluk')
    a.ayarla('n8', st='vurgu')
    a.kare('Kök (root): ebeveyni olmayan tek düğüm. Burada 8, ağacın kökü.',
           'Root: the one node with no parent. Here, 8 is the root of the tree.')
    _agac_st(a, 'soluk')
    for v in (1, 4, 7, 13):
        a.ayarla(f'n{v}', st='vurgu')
    a.kare('Yaprak (leaf): çocuğu olmayan düğüm. 1, 4, 7 ve 13 bu ağacın yaprakları.',
           'Leaf: a node with no children. 1, 4, 7, and 13 are the leaves of this tree.',
           {'c': [10, 11, 12, 13], 'java': [10, 11, 12, 13]})
    _agac_st(a, 'soluk')
    for v in (8, 10, 14, 13):
        a.ayarla(f'n{v}', st='vurgu')
    for p, c in ((8, 10), (10, 14), (14, 13)):
        a.ayarla(f'e{p}_{c}', st='vurgu')
    a.etiket('not', 400, 400, T('yükseklik (height) = 3 (kenar sayısı)', 'height = 3 (edge count)'),
             st='vurgu', boyut=17, kalin=True)
    a.kare('Yükseklik (height): kökten en uzak yaprağa kadar giden yoldaki KENAR sayısı. '
           'kök8 -> 10 -> 14 -> 13 yolu 3 kenar: yükseklik(ağaç) = 3.',
           'Height: the number of EDGES on the longest root-to-leaf path. '
           'root8 -> 10 -> 14 -> 13 is 3 edges: height(tree) = 3.', {'c': [2, 3, 4, 5, 6], 'java': [2, 3, 4, 5, 6]})
    _agac_st(a, 'soluk')
    for v in (8, 3, 6):
        a.ayarla(f'n{v}', st='vurgu')
    for p, c in ((8, 3), (3, 6)):
        a.ayarla(f'e{p}_{c}', st='vurgu')
    a.ayarla('not', metin=T('derinlik (depth) = 2', 'depth = 2'))
    a.kare('Derinlik (depth): bir düğümün kökten uzaklığı, yine kenar sayısıyla. '
           'kök8 -> 3 -> 6 iki kenar: derinlik(6) = 2.',
           'Depth: how far a node is from the root, again counted in edges. '
           'root8 -> 3 -> 6 is two edges: depth(6) = 2.', {'c': [16, 17, 18, 19, 20], 'java': [16, 17, 18, 19, 20]})
    _agac_st(a, 'soluk')
    a.ayarla('n8', st='vurgu')
    a.ayarla('e8_3', st='vurgu')
    a.ayarla('e8_10', st='vurgu')
    a.ayarla('not', metin=T('derece (degree) = 2', 'degree = 2'))
    a.kare('Derece (degree): bir düğümün DOĞRUDAN çocuk sayısı (0, 1 ya da 2). 8 düğümünün iki çocuğu var: derece(8) = 2.',
           'Degree: the number of a node\'s DIRECT children (0, 1, or 2). Node 8 has two children: degree(8) = 2.',
           {'c': [9, 10, 11, 12, 13], 'java': [9, 10, 11, 12, 13]})
    _agac_st(a, 'soluk')
    a.ayarla('n10', st='vurgu')
    a.ayarla('e10_14', st='vurgu')
    a.ayarla('not', metin=T('derece (degree) = 1', 'degree = 1'))
    a.kare('10 düğümünün yalnızca bir çocuğu var (14, sağ taraftan): derece(10) = 1. Böyle düğümlere "tek çocuklu" denir.',
           '10 has only one child (14, on the right): degree(10) = 1. Such a node is sometimes called "unary".',
           {'c': [9, 10, 11, 12, 13], 'java': [9, 10, 11, 12, 13]})
    _agac_st(a, 'soluk')
    a.ayarla('n1', st='vurgu')
    a.ayarla('not', metin=T('derece (degree) = 0', 'degree = 0'))
    a.kare('1 düğümünün hiç çocuğu yok: derece(1) = 0. Derecesi 0 olan her düğüm bir yapraktır -- yaprak tanımı tam da bu.',
           'Node 1 has no children: degree(1) = 0. Every node of degree 0 is a leaf -- that is exactly the definition of a leaf.',
           {'c': [9, 10, 11, 12, 13], 'java': [9, 10, 11, 12, 13]})
    _agac_st(a, 'normal')
    a.sil('not')
    a.kare('Sırada: tam (full), tık (complete) ve mükemmel (perfect) ağaç sınıflandırması, ve bir ağacı dizi (array) '
           'ile tutmanın yolu -- bunları nottaki tabloda göreceğiz.',
           'Coming up: the full/complete/perfect tree classification, and how to store a tree in a plain array -- '
           'we will see those in a table in the notes.')
    return a


# ============================================================ 2-4. dolaşma (traversal)
C_INORDER = [
    'static void inorder(Node *node) {',
    '    if (node == NULL) return;',
    '    inorder(node->left);',
    '    printf("visit %d\\n", node->value);',
    '    visited[visited_count++] = node->value;',
    '    inorder(node->right);',
    '}',
]
JAVA_INORDER = [
    'static void inorder(Node node) {',
    '    if (node == null) return;',
    '    inorder(node.left);',
    '    System.out.println("visit " + node.value);',
    '    visited[visitedCount++] = node.value;',
    '    inorder(node.right);',
    '}',
]
C_PREORDER = [
    'static void preorder(Node *node) {',
    '    if (node == NULL) return;',
    '    printf("visit %d\\n", node->value);',
    '    visited[visited_count++] = node->value;',
    '    preorder(node->left);',
    '    preorder(node->right);',
    '}',
]
JAVA_PREORDER = [
    'static void preorder(Node node) {',
    '    if (node == null) return;',
    '    System.out.println("visit " + node.value);',
    '    visited[visitedCount++] = node.value;',
    '    preorder(node.left);',
    '    preorder(node.right);',
    '}',
]
C_POSTORDER = [
    'static void postorder(Node *node) {',
    '    if (node == NULL) return;',
    '    postorder(node->left);',
    '    postorder(node->right);',
    '    printf("visit %d\\n", node->value);',
    '    visited[visited_count++] = node->value;',
    '}',
]
JAVA_POSTORDER = [
    'static void postorder(Node node) {',
    '    if (node == null) return;',
    '    postorder(node.left);',
    '    postorder(node.right);',
    '    System.out.println("visit " + node.value);',
    '    visited[visitedCount++] = node.value;',
    '}',
]


def _gezinti(ad, baslik_tr, baslik_en, kod, sira, ziyaret_satir, tanim_satir,
             giris_tr, giris_en, son_tr, son_en):
    a = Anim(ad, baslik_tr, baslik_en, gen=820, yuk=400, kod=kod)
    _agac_ciz(a)
    a.etiket('ziyaret', 400, 345, T('ziyaret edilenler: --', 'visited: --'), boyut=16, kod=True)
    a.kare(giris_tr, giris_en, satir=tanim_satir)
    ziyaret = []
    for v in sira:
        for u in ziyaret:
            a.ayarla(f'n{u}', st='soluk')
        a.ayarla(f'n{v}', st='vurgu')
        ziyaret.append(v)
        liste = ', '.join(str(z) for z in ziyaret)
        a.ayarla('ziyaret', metin=T(f'ziyaret edilenler: {liste}', f'visited: {liste}'))
        a.kare(f'Düğüm {v} ziyaret edilir. Şu ana kadar: {liste}.',
               f'Node {v} is visited now. So far: {liste}.', satir=ziyaret_satir)
    for u in ziyaret:
        a.ayarla(f'n{u}', st='normal')
    a.kare(son_tr, son_en)
    return a


def inorder_traversal():
    return _gezinti(
        'inorder-traversal', 'Inorder dolaşma (in-order traversal)', 'Inorder traversal',
        {'c': C_INORDER, 'java': JAVA_INORDER}, [1, 3, 4, 6, 7, 8, 10, 13, 14],
        {'c': [4, 5], 'java': [4, 5]}, {'c': [1, 2, 3, 6], 'java': [1, 2, 3, 6]},
        'Inorder (sıralı) dolaşma kuralı: önce SOL alt ağacı gez, sonra düğümü ziyaret et, sonra SAĞ alt ağacı gez. '
        'Kısaca: sol, ziyaret, sağ.',
        'Inorder traversal rule: visit the LEFT subtree, then the node itself, then the RIGHT subtree. '
        'Short form: left, visit, right.',
        'Tam sıra: 1, 3, 4, 6, 7, 8, 10, 13, 14 -- bu KÜÇÜKTEN BÜYÜĞE SIRALI bir dizi, çünkü ağacımız bir ikili '
        'arama ağacı (BST). Bu, inorder dolaşmanın BST\'lerdeki en ünlü özelliğidir.',
        'Full sequence: 1, 3, 4, 6, 7, 8, 10, 13, 14 -- this is SORTED ascending order, because our tree is a '
        'binary search tree (BST). That is the most famous property of inorder traversal on a BST.')


def preorder_traversal():
    return _gezinti(
        'preorder-traversal', 'Preorder dolaşma (pre-order traversal)', 'Preorder traversal',
        {'c': C_PREORDER, 'java': JAVA_PREORDER}, [8, 3, 1, 6, 4, 7, 10, 14, 13],
        {'c': [3, 4], 'java': [3, 4]}, {'c': [1, 2, 5, 6], 'java': [1, 2, 5, 6]},
        'Preorder (ön-sıralı) dolaşma kuralı: önce düğümü ziyaret et, sonra SOL alt ağacı gez, sonra SAĞ alt ağacı gez. '
        'Kısaca: ziyaret, sol, sağ.',
        'Preorder traversal rule: visit the node itself first, then the LEFT subtree, then the RIGHT subtree. '
        'Short form: visit, left, right.',
        'Tam sıra: 8, 3, 1, 6, 4, 7, 10, 14, 13. Kök her zaman ilk ziyaret edilendir -- preorder, bir ağacın '
        'kopyasını yeniden kurmak için (üst önce) idealdir.',
        'Full sequence: 8, 3, 1, 6, 4, 7, 10, 14, 13. The root is always visited first -- preorder is ideal for '
        'rebuilding a copy of the tree (parent before children).')


def postorder_traversal():
    return _gezinti(
        'postorder-traversal', 'Postorder dolaşma (post-order traversal)', 'Postorder traversal',
        {'c': C_POSTORDER, 'java': JAVA_POSTORDER}, [1, 4, 7, 6, 3, 13, 14, 10, 8],
        {'c': [5, 6], 'java': [5, 6]}, {'c': [1, 2, 3, 7], 'java': [1, 2, 3, 7]},
        'Postorder (art-sıralı) dolaşma kuralı: önce SOL alt ağacı gez, sonra SAĞ alt ağacı gez, en son düğümü '
        'ziyaret et. Kısaca: sol, sağ, ziyaret.',
        'Postorder traversal rule: visit the LEFT subtree, then the RIGHT subtree, then the node itself last. '
        'Short form: left, right, visit.',
        'Tam sıra: 1, 4, 7, 6, 3, 13, 14, 10, 8. Kök her zaman EN SON ziyaret edilendir -- postorder, bir ağacı '
        'güvenle silmek (önce çocuklar, sonra ebeveyn) için kullanılır.',
        'Full sequence: 1, 4, 7, 6, 3, 13, 14, 10, 8. The root is always visited LAST -- postorder is used to '
        'safely delete a tree (children before parent).')


# ============================================================ 5. inorder + kendi yığınımız
C_INORDER_STACK = [
    'static void push(Node *n) {',
    '    top = top + 1;',
    '    stack_data[top] = n;',
    '}',
    '',
    'static Node *pop(void) {',
    '    Node *n = stack_data[top];',
    '    top = top - 1;',
    '    return n;',
    '}',
    '',
    'while (cur != NULL || !is_empty()) {',
    '    while (cur != NULL) {          /* push the whole left spine */',
    '        push(cur);',
    '        cur = cur->left;',
    '    }',
    "    cur = pop();                   /* can't go left anymore: pop, visit */",
    '    printf("visit %d\\n", cur->value);',
    '    cur = cur->right;              /* then walk into the right subtree */',
    '}',
]
JAVA_INORDER_STACK = [
    'static void push(Node n) {',
    '    top = top + 1;',
    '    stackData[top] = n;',
    '}',
    '',
    'static Node pop() {',
    '    Node n = stackData[top];',
    '    top = top - 1;',
    '    return n;',
    '}',
    '',
    'while (cur != null || !isEmpty()) {',
    '    while (cur != null) {          // push the whole left spine',
    '        push(cur);',
    '        cur = cur.left;',
    '    }',
    "    cur = pop();                   // can't go left anymore: pop, visit",
    '    System.out.println("visit " + cur.value);',
    '    cur = cur.right;               // then walk into the right subtree',
    '}',
]
YIGIN_SATIR_PUSH = {'c': [13, 14, 15], 'java': [13, 14, 15]}
YIGIN_SATIR_POP = {'c': [17, 18], 'java': [17, 18]}


def _yigin_paneli(a, cap, x=790, y0=300, h=48):
    a.cerceve('stf', x - 16, y0 - cap * h - 18, 108, cap * h + 34, baslik=T('yığın (stack)', 'stack'))
    for i in range(cap):
        a.kutu(f'sh{i}', x, y0 - (i + 1) * h, '', w=78, h=h - 6, st='bos', kod=True)


def _yigin_guncelle(a, cap, icerik):
    for i in range(cap):
        if i < len(icerik):
            a.ayarla(f'sh{i}', metin=str(icerik[i]), st='aktif')
        else:
            a.ayarla(f'sh{i}', metin='', st='bos')
    if icerik:
        if not a.var('stop'):
            a.isaretci('stop', f'sh{len(icerik) - 1}', 'top', yon='sag', uzak=26)
        else:
            a.ayarla('stop', hedef=f'sh{len(icerik) - 1}')
    elif a.var('stop'):
        a.sil('stop')


def inorder_traversal_stack():
    a = Anim('inorder-traversal-stack', 'Yığınla (kendi yığınımızla) inorder dolaşma',
             'Inorder traversal with our own stack', gen=920, yuk=420,
             kod={'c': C_INORDER_STACK, 'java': JAVA_INORDER_STACK})
    _agac_ciz(a)
    _yigin_paneli(a, 4)
    _yigin_guncelle(a, 4, [])
    a.etiket('ziyaret', 400, 345, T('ziyaret edilenler: --', 'visited: --'), boyut=16, kod=True)
    a.kare('Özyineleme olmadan da inorder dolaşabiliriz: Hafta 3\'teki dizi tabanlı yığın (stack) fikrini aynen '
           'kullanıyoruz, sadece sayı yerine ağaç düğümü (Node) tutuyor.',
           'We can do inorder traversal without recursion: we reuse the exact array-based stack idea from Week 3, '
           'now it holds tree nodes instead of numbers.', satir={'c': [1, 2, 3], 'java': [1, 2, 3]})
    yigin = []
    ziyaret = []

    def guncelle_ziyaret():
        liste = ', '.join(str(z) for z in ziyaret)
        a.ayarla('ziyaret', metin=T(f'ziyaret edilenler: {liste}', f'visited: {liste}'))

    def push_grubu(degerler, aciklama_tr, aciklama_en):
        for v in degerler:
            yigin.append(v)
            a.ayarla(f'n{v}', st='aktif')
        _yigin_guncelle(a, 4, yigin)
        a.kare(aciklama_tr, aciklama_en, satir=YIGIN_SATIR_PUSH)

    def pop_ziyaret(v):
        yigin.pop()
        _yigin_guncelle(a, 4, yigin)
        a.ayarla(f'n{v}', st='soluk')
        ziyaret.append(v)
        guncelle_ziyaret()
        a.kare(f'`pop()` -> düğüm {v}; solu yok (ya da zaten gezildi), o yüzden hemen ziyaret edilir.',
               f'`pop()` -> node {v}; it has no (unvisited) left child, so it is visited right away.',
               satir=YIGIN_SATIR_POP)

    push_grubu([8, 3, 1], '8\'den başlayıp mümkün olduğunca sola gidiyoruz; geçtiğimiz her düğümü yığına itiyoruz: '
                           '8, sonra 3, sonra 1.',
               'Starting at 8 we go as far left as possible, pushing every node we pass: 8, then 3, then 1.')
    pop_ziyaret(1)
    pop_ziyaret(3)
    push_grubu([6, 4], "3'ün ziyaretinden sonra sağ çocuğuna (6) geçiyoruz, onu itiyoruz, sonra yine sola: 4.",
               "After visiting 3 we move to its right child (6), push it, then go left again to 4.")
    pop_ziyaret(4)
    pop_ziyaret(6)
    push_grubu([7], "6'nın sağ çocuğu 7; solu olmadığı için doğrudan itiliyor.",
               "6's right child is 7; it has no left child, so it goes straight onto the stack.")
    pop_ziyaret(7)
    pop_ziyaret(8)
    push_grubu([10], "8'in sağ çocuğu 10; solu olmadığı için doğrudan itiliyor.",
               "8's right child is 10; it has no left child, so it goes straight onto the stack.")
    pop_ziyaret(10)
    push_grubu([14, 13], "10'un sağ alt ağacında yine sola gidiyoruz: 14, sonra 13.",
               "In 10's right subtree we again go left: 14, then 13.")
    pop_ziyaret(13)
    pop_ziyaret(14)
    a.kare('Sonuç: 1, 3, 4, 6, 7, 8, 10, 13, 14 -- özyinelemeli inorder ile birebir aynı sıra. Fark: yığını artık biz '
           'elle yönetiyoruz, derleyici değil.',
           'Result: 1, 3, 4, 6, 7, 8, 10, 13, 14 -- exactly the same order as recursive inorder. The difference: '
           'we manage the stack by hand now, not the compiler.')
    return a


# ============================================================ 6. level-order (BFS) + kuyruk
C_LEVELORDER = [
    'static void enqueue(Node *n) {',
    '    rear = (rear + 1) % QUEUE_CAP;',
    '    queue_data[rear] = n;',
    '    count++;',
    '}',
    '',
    'static Node *dequeue(void) {',
    '    Node *n = queue_data[front];',
    '    front = (front + 1) % QUEUE_CAP;',
    '    count--;',
    '    return n;',
    '}',
    '',
    'enqueue(root);',
    'while (!is_empty()) {',
    '    Node *cur = dequeue();',
    '    printf("visit %d\\n", cur->value);',
    '    if (cur->left != NULL) enqueue(cur->left);',
    '    if (cur->right != NULL) enqueue(cur->right);',
    '}',
]
JAVA_LEVELORDER = [
    'static void enqueue(Node n) {',
    '    rear = (rear + 1) % QUEUE_CAP;',
    '    queueData[rear] = n;',
    '    count++;',
    '}',
    '',
    'static Node dequeue() {',
    '    Node n = queueData[front];',
    '    front = (front + 1) % QUEUE_CAP;',
    '    count--;',
    '    return n;',
    '}',
    '',
    'enqueue(root);',
    'while (!isEmpty()) {',
    '    Node cur = dequeue();',
    '    System.out.println("visit " + cur.value);',
    '    if (cur.left != null) enqueue(cur.left);',
    '    if (cur.right != null) enqueue(cur.right);',
    '}',
]
KUYRUK_SATIR_ENQ_ROOT = {'c': [13], 'java': [13]}
KUYRUK_SATIR_ADIM = {'c': [15, 16, 17, 18], 'java': [15, 16, 17, 18]}


def _kuyruk_paneli(a, cap, x0=280, y=390, dx=95):
    a.cerceve('kf', x0 - 20, y - 40, cap * dx + 44, 88, baslik=T('kuyruk (queue)', 'queue'))
    for i in range(cap):
        a.kutu(f'qh{i}', x0 + i * dx, y, '', w=78, h=50, st='bos')
    a.etiket('qon', x0 - 8, y - 48, T('ön (front)', 'front'), st='soluk', boyut=13, hiza='start')


def _kuyruk_guncelle(a, cap, icerik):
    for i in range(cap):
        if i < len(icerik):
            a.ayarla(f'qh{i}', metin=str(icerik[i]), st='aktif')
        else:
            a.ayarla(f'qh{i}', metin='', st='bos')


def level_order_traversal():
    a = Anim('level-order-traversal', 'Seviye sıralı (level-order / BFS) dolaşma', 'Level-order (BFS) traversal',
             gen=880, yuk=480, kod={'c': C_LEVELORDER, 'java': JAVA_LEVELORDER})
    _agac_ciz(a)
    _kuyruk_paneli(a, 4)
    _kuyruk_guncelle(a, 4, [])
    a.etiket('ziyaret', 400, 345, T('ziyaret edilenler: --', 'visited: --'), boyut=16, kod=True)
    a.kare('Seviye sıralı (level-order) dolaşma ağacı katman katman gezer: önce kök, sonra 1. seviye, sonra 2. '
           'seviye... Bunun için yığın değil bir kuyruk (queue) gerekir -- Hafta 3\'teki dairesel kuyruğun aynısı.',
           'Level-order traversal walks the tree layer by layer: root first, then depth 1, then depth 2... '
           'This needs a queue, not a stack -- exactly the Week 3 circular queue.')
    dizi = []
    ziyaret = []

    def guncelle_ziyaret():
        liste = ', '.join(str(z) for z in ziyaret)
        a.ayarla('ziyaret', metin=T(f'ziyaret edilenler: {liste}', f'visited: {liste}'))

    dizi.append(8)
    a.ayarla('n8', st='aktif')
    _kuyruk_guncelle(a, 4, dizi)
    a.kare('`enqueue(root)`: kuyruğa önce kökü (8) koyarız.', '`enqueue(root)`: we first enqueue the root (8).',
           satir=KUYRUK_SATIR_ENQ_ROOT)
    adimlar = [
        (8, [3, 10]), (3, [1, 6]), (10, [14]), (1, []),
        (6, [4, 7]), (14, [13]), (4, []), (7, []), (13, []),
    ]
    for v, cocuklar in adimlar:
        dizi.pop(0)
        a.ayarla(f'n{v}', st='soluk')
        ziyaret.append(v)
        for c in cocuklar:
            dizi.append(c)
            a.ayarla(f'n{c}', st='aktif')
        _kuyruk_guncelle(a, 4, dizi)
        guncelle_ziyaret()
        if cocuklar:
            cs = ', '.join(str(c) for c in cocuklar)
            a.kare(f'`dequeue()` -> {v}; ziyaret edilir, çocukları ({cs}) kuyruğa eklenir (enqueue).',
                   f'`dequeue()` -> {v}; it is visited, its children ({cs}) are enqueued.', satir=KUYRUK_SATIR_ADIM)
        else:
            a.kare(f'`dequeue()` -> {v}; ziyaret edilir. Bir yaprak olduğu için kuyruğa hiçbir şey eklenmez.',
                   f'`dequeue()` -> {v}; it is visited. It is a leaf, so nothing is enqueued.', satir=KUYRUK_SATIR_ADIM)
    a.kare('Kuyruk boş, bitti. Tam sıra: 8, 3, 10, 1, 6, 14, 4, 7, 13 -- her seviyeyi soldan sağa tamamladıktan '
           'sonra bir alt seviyeye geçiyoruz.',
           'The queue is empty, done. Full sequence: 8, 3, 10, 1, 6, 14, 4, 7, 13 -- we finish each level left to '
           'right before moving one level down.')
    return a


# ============================================================ 7. min-heap: sift-up ile ekleme
C_HEAP_INSERT = [
    'static void insert(int value) {',
    '    heap[size] = value;      /* place at the next free slot */',
    '    int i = size;',
    '    size++;',
    '',
    '    while (i > 0) {                       /* sift-up */',
    '        int parent = (i - 1) / 2;',
    '        if (heap[parent] <= heap[i])',
    '            break;',
    '        int tmp = heap[parent];',
    '        heap[parent] = heap[i];',
    '        heap[i] = tmp;',
    '        i = parent;',
    '    }',
    '}',
]
JAVA_HEAP_INSERT = [
    'static void insert(int value) {',
    '    heap[size] = value;      // place at the next free slot',
    '    int i = size;',
    '    size++;',
    '',
    '    while (i > 0) {                       // sift-up',
    '        int parent = (i - 1) / 2;',
    '        if (heap[parent] <= heap[i])',
    '            break;',
    '        int tmp = heap[parent];',
    '        heap[parent] = heap[i];',
    '        heap[i] = tmp;',
    '        i = parent;',
    '    }',
    '}',
]


def heap_insert_sift_up():
    a = Anim('heap-insert-sift-up', 'Min-öbekte sift-up ile ekleme', 'Min-heap insertion by sift-up',
             gen=880, yuk=420, kod={'c': C_HEAP_INSERT, 'java': JAVA_HEAP_INSERT})
    max_n = 6
    poz, x0 = _heap_kur(max_n)
    dizi = []

    def sync(vurgu=None):
        _heap_sync(a, dizi, len(dizi), poz, x0, 70, 290, onek='h')
        if vurgu:
            _heap_vurgu(a, 'h', vurgu)

    sync()
    a.etiket('baslik', 410, 30, T('boş min-öbek (min-heap)', 'empty min-heap'), st='soluk', boyut=15)
    a.kare('Bir öbek (heap), en küçük (ya da en büyük) değeri her zaman kökte tutan tam bir ağaçtır. Burada bir '
           'min-öbek: her düğüm, çocuklarından küçük eşit. Diziye 5, 3, 8, 1, 9, 2 değerlerini SIRAYLA ekleyeceğiz.',
           'A heap is a complete tree that always keeps the smallest (or largest) value at the root. Here, a '
           'min-heap: every node is less than or equal to its children. We will insert 5, 3, 8, 1, 9, 2 one at a time.')
    degerler = [5, 3, 8, 1, 9, 2]
    for v in degerler:
        if a.var('baslik'):
            a.sil('baslik')
        dizi.append(v)
        i = len(dizi) - 1
        sync(vurgu=[i])
        a.kare(f'`insert({v})`: değer, dizinin boş ilk hücresine ({i}. indis) yazılır.',
               f'`insert({v})`: the value is placed in the next free slot, index {i}.',
               satir={'c': [2, 3, 4], 'java': [2, 3, 4]})
        while i > 0:
            ebeveyn = (i - 1) // 2
            if dizi[ebeveyn] <= dizi[i]:
                sync(vurgu=[i, ebeveyn])
                a.kare(f'Ebeveynle ({dizi[ebeveyn]}, {ebeveyn}. indis) karşılaştır: ebeveyn <= çocuk, öbek '
                       f'özelliği zaten sağlanıyor, dur.',
                       f'Compare with the parent ({dizi[ebeveyn]} at index {ebeveyn}): parent <= child, the heap '
                       f'property already holds, stop.', satir={'c': [7, 8, 9], 'java': [7, 8, 9]})
                break
            dizi[ebeveyn], dizi[i] = dizi[i], dizi[ebeveyn]
            sync(vurgu=[i, ebeveyn])
            a.kare(f'Ebeveyn ({ebeveyn}. indis) çocuktan büyük: yer değiştir (swap). Değer {dizi[ebeveyn]} bir '
                   f'üst seviyeye "yüzüyor" (sift-up).',
                   f'The parent (index {ebeveyn}) is greater than the child: swap. The value {dizi[ebeveyn]} '
                   f'"floats up" one level (sift-up).', satir={'c': [7, 8, 10, 11, 12, 13], 'java': [7, 8, 10, 11, 12, 13]})
            i = ebeveyn
    sync()
    a.kare(f'Son öbek dizisi: {dizi} -- kökte (indis 0) her zaman en küçük değer var. Her `insert`, ağacın '
           f'yüksekliği kadar (O(log n)) karşılaştırma yapar.',
           f'Final heap array: {dizi} -- the root (index 0) always holds the minimum. Each `insert` does at most '
           f'O(log n) comparisons, one per level of the tree.')
    return a


# ============================================================ 8. min-heap: sift-down ile çıkarma
C_HEAP_EXTRACT = [
    'static int extract_min(void) {',
    '    int min = heap[0];',
    '    size--;',
    '    heap[0] = heap[size];    /* move the last element to the root */',
    '',
    '    int i = 0;',
    '    while (1) {                              /* sift-down */',
    '        int left = 2 * i + 1;',
    '        int right = 2 * i + 2;',
    '        int smallest = i;',
    '',
    '        if (left < size && heap[left] < heap[smallest])',
    '            smallest = left;',
    '        if (right < size && heap[right] < heap[smallest])',
    '            smallest = right;',
    '        if (smallest == i)',
    '            break;',
    '',
    '        int tmp = heap[i];',
    '        heap[i] = heap[smallest];',
    '        heap[smallest] = tmp;',
    '        i = smallest;',
    '    }',
    '',
    '    return min;',
    '}',
]
JAVA_HEAP_EXTRACT = [
    'static int extractMin() {',
    '    int min = heap[0];',
    '    size--;',
    '    heap[0] = heap[size];    // move the last element to the root',
    '',
    '    int i = 0;',
    '    while (true) {                            // sift-down',
    '        int left = 2 * i + 1;',
    '        int right = 2 * i + 2;',
    '        int smallest = i;',
    '',
    '        if (left < size && heap[left] < heap[smallest])',
    '            smallest = left;',
    '        if (right < size && heap[right] < heap[smallest])',
    '            smallest = right;',
    '        if (smallest == i)',
    '            break;',
    '',
    '        int tmp = heap[i];',
    '        heap[i] = heap[smallest];',
    '        heap[smallest] = tmp;',
    '        i = smallest;',
    '    }',
    '',
    '    return min;',
    '}',
]


def heap_extract_sift_down():
    a = Anim('heap-extract-sift-down', 'Min-öbekte sift-down ile çıkarma (extractMin)',
             'Min-heap extraction by sift-down (extractMin)', gen=880, yuk=420,
             kod={'c': C_HEAP_EXTRACT, 'java': JAVA_HEAP_EXTRACT})
    max_n = 6
    poz, x0 = _heap_kur(max_n)
    dizi = [1, 3, 2, 5, 9, 8]
    boyut = 6

    def sync(vurgu=None):
        _heap_sync(a, dizi, boyut, poz, x0, 70, 290, onek='h')
        if vurgu:
            _heap_vurgu(a, 'h', vurgu)

    sync()
    a.kare(f'Başlangıç öbeği {dizi}: geçerli bir min-öbek. `extractMin()` her zaman kökü (en küçük değeri) siler '
           f've öbek özelliğini onarır.',
           f'Starting heap {dizi}: a valid min-heap. `extractMin()` always removes the root (the minimum) and '
           f'repairs the heap property.')
    for tur in (1, 2):
        min_deger = dizi[0]
        sync(vurgu=[0])
        a.kare(f'`extractMin()` #{tur}: kökteki değer ({min_deger}) kaydedilir; bu, döndürülecek sonuç.',
               f'`extractMin()` #{tur}: the root value ({min_deger}) is saved; this is the result we will return.',
               satir={'c': [2], 'java': [2]})
        dizi[0] = dizi[boyut - 1]
        boyut -= 1
        sync(vurgu=[0])
        a.kare(f'Son eleman köke taşınır ({dizi[0]}), öbek küçültülür: boyut = {boyut}. Artık kökte öbek '
               f'özelliği bozuk olabilir.',
               f'The last element moves to the root ({dizi[0]}), the heap shrinks: size = {boyut}. The root may '
               f'now violate the heap property.', satir={'c': [3, 4], 'java': [3, 4]})
        i = 0
        while True:
            sol, sag = 2 * i + 1, 2 * i + 2
            en_kucuk = i
            if sol < boyut and dizi[sol] < dizi[en_kucuk]:
                en_kucuk = sol
            if sag < boyut and dizi[sag] < dizi[en_kucuk]:
                en_kucuk = sag
            if en_kucuk == i:
                vurgu = [i] + ([sol] if sol < boyut else []) + ([sag] if sag < boyut else [])
                sync(vurgu=vurgu)
                a.kare('Çocuklarla karşılaştır: hiçbiri kökten küçük değil, öbek özelliği sağlandı, dur.',
                       'Compare with the children: none is smaller, the heap property holds, stop.',
                       satir={'c': [11, 12, 13, 14, 15, 16], 'java': [11, 12, 13, 14, 15, 16]})
                break
            dizi[i], dizi[en_kucuk] = dizi[en_kucuk], dizi[i]
            sync(vurgu=[i, en_kucuk])
            a.kare(f'{en_kucuk}. indisteki çocuk daha küçük: yer değiştir (swap). Değer aşağı "batıyor" (sift-down).',
                   f'The child at index {en_kucuk} is smaller: swap. The value "sinks down" (sift-down).',
                   satir={'c': [18, 19, 20, 21], 'java': [18, 19, 20, 21]})
            i = en_kucuk
    sync()
    a.kare(f'İki çıkarmadan sonra kalan öbek: {dizi[:boyut]}. Her `extractMin`, `insert` gibi O(log n) sürer.',
           f'After two extractions, the remaining heap: {dizi[:boyut]}. Each `extractMin`, like `insert`, costs '
           f'O(log n).')
    return a


# ============================================================ 9. build-heap (bottom-up, O(n))
C_BUILD_HEAP = [
    '/* max-heap sift-down: swap with the larger child while a child is larger */',
    'static void sift_down(int arr[], int n, int i) {',
    '    while (1) {',
    '        int left = 2 * i + 1;',
    '        int right = 2 * i + 2;',
    '        int largest = i;',
    '',
    '        if (left < n && arr[left] > arr[largest])',
    '            largest = left;',
    '        if (right < n && arr[right] > arr[largest])',
    '            largest = right;',
    '        if (largest == i)',
    '            break;',
    '',
    '        int tmp = arr[i];',
    '        arr[i] = arr[largest];',
    '        arr[largest] = tmp;',
    '        i = largest;',
    '    }',
    '}',
    '',
    '/* bottom-up build: only the n/2 internal nodes need sifting, so this is O(n) */',
    'static void build_max_heap(int arr[], int n) {',
    '    for (int i = n / 2 - 1; i >= 0; i--)',
    '        sift_down(arr, n, i);',
    '}',
]
JAVA_BUILD_HEAP = [
    '/* max-heap sift-down: swap with the larger child while a child is larger */',
    'static void siftDown(int[] arr, int n, int i) {',
    '    while (true) {',
    '        int left = 2 * i + 1;',
    '        int right = 2 * i + 2;',
    '        int largest = i;',
    '',
    '        if (left < n && arr[left] > arr[largest])',
    '            largest = left;',
    '        if (right < n && arr[right] > arr[largest])',
    '            largest = right;',
    '        if (largest == i)',
    '            break;',
    '',
    '        int tmp = arr[i];',
    '        arr[i] = arr[largest];',
    '        arr[largest] = tmp;',
    '        i = largest;',
    '    }',
    '}',
    '',
    '/* bottom-up build: only the n/2 internal nodes need sifting, so this is O(n) */',
    'static void buildMaxHeap(int[] arr, int n) {',
    '    for (int i = n / 2 - 1; i >= 0; i--)',
    '        siftDown(arr, n, i);',
    '}',
]
BH_KARSILASTIR = {'c': [4, 5, 6, 8, 9, 10, 11, 12, 13], 'java': [4, 5, 6, 8, 9, 10, 11, 12, 13]}
BH_SWAP = {'c': [15, 16, 17, 18], 'java': [15, 16, 17, 18]}


def build_heap():
    a = Anim('build-heap', 'Alttan yukarı öbek kurma (build-heap), O(n)', 'Bottom-up build-heap, O(n)',
             gen=920, yuk=480, kod={'c': C_BUILD_HEAP, 'java': JAVA_BUILD_HEAP})
    max_n = 10
    poz, x0 = _heap_kur(max_n)
    dizi = [4, 1, 3, 2, 16, 9, 10, 14, 8, 7]
    n = len(dizi)

    def sync(vurgu=None):
        _heap_sync(a, dizi, n, poz, x0, 64, 370, onek='b')
        if vurgu:
            _heap_vurgu(a, 'b', vurgu)

    sync()
    a.kare(f'Başlangıç dizisi {dizi}: rastgele sıralanmış, henüz bir max-öbek (max-heap) değil. Fikir: yaprakların '
           f'zaten tek başına "öbek" olduğunu kullanıp alttan yukarıya doğru düzelt.',
           f'Starting array {dizi}: in arbitrary order, not yet a max-heap. Idea: leaves are already trivially '
           f'heaps by themselves, so fix the array bottom-up.')
    for i in range(n // 2 - 1, -1, -1):
        sol, sag = 2 * i + 1, 2 * i + 2
        en_buyuk = i
        if sol < n and dizi[sol] > dizi[en_buyuk]:
            en_buyuk = sol
        if sag < n and dizi[sag] > dizi[en_buyuk]:
            en_buyuk = sag
        secim = [i] + ([sol] if sol < n else []) + ([sag] if sag < n else [])
        sync(vurgu=secim)
        if en_buyuk == i:
            a.kare(f'{i}. indiste ({dizi[i]}) sifting başlıyor: çocuklarla karşılaştır -- zaten en büyük o, '
                   f'yer değiştirme gerekmiyor.',
                   f'Sifting begins at index {i} ({dizi[i]}): compare with its children -- it is already the '
                   f'largest, no swap needed.', satir=BH_KARSILASTIR)
            continue
        a.kare(f'{i}. indiste ({dizi[i]}) sifting başlıyor: çocuklarla karşılaştır -- {en_buyuk}. indisteki '
               f'{dizi[en_buyuk]} daha büyük.',
               f'Sifting begins at index {i} ({dizi[i]}): compare with its children -- {dizi[en_buyuk]} at index '
               f'{en_buyuk} is larger.', satir=BH_KARSILASTIR)
        cur = i
        while en_buyuk != cur:
            dizi[cur], dizi[en_buyuk] = dizi[en_buyuk], dizi[cur]
            sync(vurgu=[cur, en_buyuk])
            a.kare(f'{cur} ve {en_buyuk}. indisler yer değiştirir (swap).', f'Swap indices {cur} and {en_buyuk}.',
                   satir=BH_SWAP)
            cur = en_buyuk
            sol, sag = 2 * cur + 1, 2 * cur + 2
            en_buyuk = cur
            if sol < n and dizi[sol] > dizi[en_buyuk]:
                en_buyuk = sol
            if sag < n and dizi[sag] > dizi[en_buyuk]:
                en_buyuk = sag
    sync()
    a.kare(f'Bitti: {dizi} artık geçerli bir max-öbek. Her çağrı farklı maliyette olsa da toplam iş O(n)\'dir '
           f'(O(n log n) DEĞİL) -- çünkü alt seviyelerdeki çok sayıda düğüm çok az sifting yapar.',
           f'Done: {dizi} is now a valid max-heap. Although each call costs differently, the TOTAL work across '
           f'all calls is O(n) (NOT O(n log n)) -- because the many nodes near the bottom need very little sifting.')
    return a


# ============================================================ 10. heap sort
C_HEAP_SORT = [
    'static void sift_down(int arr[], int n, int i) {',
    '    while (1) {',
    '        int left = 2 * i + 1;',
    '        int right = 2 * i + 2;',
    '        int largest = i;',
    '',
    '        if (left < n && arr[left] > arr[largest])',
    '            largest = left;',
    '        if (right < n && arr[right] > arr[largest])',
    '            largest = right;',
    '        if (largest == i)',
    '            break;',
    '',
    '        int tmp = arr[i];',
    '        arr[i] = arr[largest];',
    '        arr[largest] = tmp;',
    '        i = largest;',
    '    }',
    '}',
    '',
    'static void heap_sort(int arr[], int n) {',
    '    build_max_heap(arr, n);',
    '',
    '    for (int heap_size = n; heap_size > 1; heap_size--) {',
    '        int tmp = arr[0];                    /* move the current max to the end */',
    '        arr[0] = arr[heap_size - 1];',
    '        arr[heap_size - 1] = tmp;',
    '        sift_down(arr, heap_size - 1, 0);    /* restore the heap on the shrunk region */',
    '    }',
    '}',
]
JAVA_HEAP_SORT = [
    'static void siftDown(int[] arr, int n, int i) {',
    '    while (true) {',
    '        int left = 2 * i + 1;',
    '        int right = 2 * i + 2;',
    '        int largest = i;',
    '',
    '        if (left < n && arr[left] > arr[largest])',
    '            largest = left;',
    '        if (right < n && arr[right] > arr[largest])',
    '            largest = right;',
    '        if (largest == i)',
    '            break;',
    '',
    '        int tmp = arr[i];',
    '        arr[i] = arr[largest];',
    '        arr[largest] = tmp;',
    '        i = largest;',
    '    }',
    '}',
    '',
    'static void heapSort(int[] arr, int n) {',
    '    buildMaxHeap(arr, n);',
    '',
    '    for (int heapSize = n; heapSize > 1; heapSize--) {',
    '        int tmp = arr[0];                    // move the current max to the end',
    '        arr[0] = arr[heapSize - 1];',
    '        arr[heapSize - 1] = tmp;',
    '        siftDown(arr, heapSize - 1, 0);      // restore the heap on the shrunk region',
    '    }',
    '}',
]
HS_SWAP_BOUNDARY = {'c': [25, 26, 27], 'java': [25, 26, 27]}
HS_SHRINK = {'c': [24], 'java': [24]}
HS_SIFT_SWAP = {'c': [14, 15, 16, 17], 'java': [14, 15, 16, 17]}
HS_START = {'c': [21, 22], 'java': [21, 22]}


def heap_sort():
    a = Anim('heap-sort', 'Öbek sıralaması (heap sort)', 'Heap sort', gen=920, yuk=480,
             kod={'c': C_HEAP_SORT, 'java': JAVA_HEAP_SORT})
    max_n = 10
    poz, x0 = _heap_kur(max_n)
    dizi = [16, 14, 10, 8, 7, 9, 3, 2, 4, 1]
    boyut = 10

    def sync(vurgu=None):
        _heap_sync(a, dizi, boyut, poz, x0, 64, 370, onek='s', disari_st='soluk', disari_gizle=False)
        if vurgu:
            _heap_vurgu(a, 's', vurgu)

    def sift_down_kareli(sinir):
        i = 0
        while True:
            sol, sag = 2 * i + 1, 2 * i + 2
            en_buyuk = i
            if sol < sinir and dizi[sol] > dizi[en_buyuk]:
                en_buyuk = sol
            if sag < sinir and dizi[sag] > dizi[en_buyuk]:
                en_buyuk = sag
            if en_buyuk == i:
                break
            dizi[i], dizi[en_buyuk] = dizi[en_buyuk], dizi[i]
            sync(vurgu=[i, en_buyuk])
            a.kare(f'Sifting-down: {i} ve {en_buyuk}. indisler yer değiştirir.',
                   f'Sifting down: swap indices {i} and {en_buyuk}.', satir=HS_SIFT_SWAP)
            i = en_buyuk

    sync()
    a.kare(f'Başlangıç noktası: dizi zaten build-heap ile kurulmuş geçerli bir max-öbek: {dizi}. Öbek sıralaması '
           f'(heap sort) tekrar tekrar kökü (en büyük değer) sıralanmamış bölgenin sonuna taşır.',
           f'Starting point: the array is already a valid max-heap from build-heap: {dizi}. Heap sort repeatedly '
           f'moves the root (the maximum) to the end of the unsorted region.', satir=HS_START)
    for tur in (1, 2):
        dizi[0], dizi[boyut - 1] = dizi[boyut - 1], dizi[0]
        sync(vurgu=[0, boyut - 1])
        a.kare(f'Tur {tur}: kök ({dizi[boyut - 1]}) sıralanmamış bölgenin son elemanıyla yer değiştirir.',
               f'Round {tur}: the root ({dizi[boyut - 1]}) swaps with the last element of the unsorted region.',
               satir=HS_SWAP_BOUNDARY)
        boyut -= 1
        sync()
        a.kare(f'{dizi[boyut]} artık sıralanmış kabul edilir ve öbekten çıkar (soluk kutu); öbek sınırı boyut = '
               f'{boyut}\'a küçültülür.',
               f'{dizi[boyut]} now counts as sorted and leaves the heap (faded box); the heap boundary shrinks '
               f'to size = {boyut}.', satir=HS_SHRINK)
        sift_down_kareli(boyut)
    sync()
    a.kare('Aynı desen -- kökle sınırdaki son elemanı değiştir, sınırı küçült, sifting-down yap -- kalan her tur '
           'için (3\'ten 9\'a kadar) tekrarlanır.',
           'The same pattern -- swap the root with the last element at the boundary, shrink the boundary, '
           'sift down -- repeats for every remaining round (3 through 9).')
    while boyut > 1:
        dizi[0], dizi[boyut - 1] = dizi[boyut - 1], dizi[0]
        boyut -= 1
        i = 0
        while True:
            sol, sag = 2 * i + 1, 2 * i + 2
            en_buyuk = i
            if sol < boyut and dizi[sol] > dizi[en_buyuk]:
                en_buyuk = sol
            if sag < boyut and dizi[sag] > dizi[en_buyuk]:
                en_buyuk = sag
            if en_buyuk == i:
                break
            dizi[i], dizi[en_buyuk] = dizi[en_buyuk], dizi[i]
            i = en_buyuk
    sync()
    a.kare(f'Sonuç: {dizi} -- küçükten büyüğe tam sıralanmış dizi. Öbek sıralaması yerinde (in-place) çalışır ve '
           f'O(n log n) sürer, ama kararlı (stable) DEĞİLDİR.',
           f'Result: {dizi} -- fully sorted in ascending order. Heap sort runs in place and takes O(n log n) '
           f'time, but it is NOT stable.')
    return a


# ============================================================ 11-12. Huffman kodlama
HUFFMAN_METIN = 'ABRACADABRA'
HUFFMAN_FREQ = {'A': 5, 'B': 2, 'C': 1, 'D': 1, 'R': 2}
HUFFMAN_TIE = {'A': 65, 'B': 66, 'C': 67, 'D': 68, 'R': 82}

C_HUFFMAN_BUILD = [
    '/* ordering key: smaller freq first; if equal, smaller tie_id first */',
    'static int is_less(Node *a, Node *b) {',
    '    if (a->freq != b->freq) return a->freq < b->freq;',
    '    return a->tie_id < b->tie_id;',
    '}',
    '',
    '/* repeatedly merge the two smallest nodes until one remains */',
    'int merge_counter = 0;',
    'while (heap_size > 1) {',
    '    Node *a = heap_pop();',
    '    Node *b = heap_pop();',
    '    Node *merged = new_internal(a, b, 256 + merge_counter);',
    '    merge_counter++;',
    '    heap_push(merged);',
    '}',
    'Node *root = heap_pop();',
]
JAVA_HUFFMAN_BUILD = [
    '/* ordering key: smaller freq first; if equal, smaller tieId first */',
    'static boolean isLess(Node a, Node b) {',
    '    if (a.freq != b.freq) return a.freq < b.freq;',
    '    return a.tieId < b.tieId;',
    '}',
    '',
    '// repeatedly merge the two smallest nodes until one remains',
    'int mergeCounter = 0;',
    'while (heapSize > 1) {',
    '    Node a = heapPop();',
    '    Node b = heapPop();',
    '    Node merged = Node.internal(a, b, 256 + mergeCounter);',
    '    mergeCounter++;',
    '    heapPush(merged);',
    '}',
    'Node root = heapPop();',
]


def _oncelik_x(anahtarlar, merkez=400, dx=150):
    n = len(anahtarlar)
    if n == 0:
        return {}
    if n == 1:
        return {anahtarlar[0]: merkez}
    toplam = (n - 1) * dx
    return {k: merkez - toplam / 2 + idx * dx for idx, k in enumerate(anahtarlar)}


def _huffman_etiket(k, freq):
    return f'{k}:{freq[k]}' if k in HUFFMAN_FREQ else str(freq[k])


def _huffman_simule():
    """Saf (Anim'siz) simülasyon: her düğüm için NİHAİ (x, y) konumunu ve ağaç kenarlarını döndürür."""
    freq = dict(HUFFMAN_FREQ)
    tie = dict(HUFFMAN_TIE)
    y = {k: 300 for k in freq}
    sira = sorted(freq, key=lambda k: (freq[k], tie[k]))
    x = dict(_oncelik_x(sira))
    kenarlar = {}
    sayac = 0
    while len(sira) > 1:
        sol, sag = sira[0], sira[1]
        sira = sira[2:]
        sayac += 1
        yeni = f'm{sayac}'
        freq[yeni] = freq[sol] + freq[sag]
        tie[yeni] = 1000 + sayac
        y[yeni] = min(y[sol], y[sag]) - 90
        x[yeni] = (x[sol] + x[sag]) / 2
        kenarlar[(yeni, '0')] = sol
        kenarlar[(yeni, '1')] = sag
        sira = sorted(sira + [yeni], key=lambda k: (freq[k], tie[k]))
        yer = _oncelik_x(sira)
        for k in sira:
            x[k] = yer[k]
    kok = sira[0]
    return freq, x, y, kenarlar, kok


def _huffman_kodlar(kenarlar, kok):
    kodlar = {}

    def yuru(dugum, yol):
        c0 = kenarlar.get((dugum, '0'))
        c1 = kenarlar.get((dugum, '1'))
        if c0 is None and c1 is None:
            kodlar[dugum] = yol
            return
        if c0 is not None:
            yuru(c0, yol + '0')
        if c1 is not None:
            yuru(c1, yol + '1')

    yuru(kok, '')
    return kodlar


def huffman_build():
    a = Anim('huffman-build', 'Huffman ağacı kurma', 'Building the Huffman tree', gen=880, yuk=460,
             kod={'c': C_HUFFMAN_BUILD, 'java': JAVA_HUFFMAN_BUILD})
    freq = dict(HUFFMAN_FREQ)
    tie = dict(HUFFMAN_TIE)
    y = {k: 300 for k in freq}
    sira = sorted(freq, key=lambda k: (freq[k], tie[k]))
    x = dict(_oncelik_x(sira))
    for k in sira:
        a.daire(f'hf{k}', x[k], y[k], _huffman_etiket(k, freq))
    harfler = ', '.join(f'{k}:{freq[k]}' for k in sira)
    a.kare(f'"{HUFFMAN_METIN}" metnindeki harf sıklıkları (frequency): {harfler}. Huffman kodlaması, sık geçen '
           f'harflere KISA, nadir geçenlere UZUN ikili (0/1) kod vermek için bir min-öbek (min-heap) kullanarak '
           f'ağaç kurar -- öncelik en düşük sıklığa.',
           f'Character frequencies in "{HUFFMAN_METIN}": {harfler}. Huffman coding builds a tree with a min-heap '
           f'so that frequent letters get SHORT binary (0/1) codes and rare ones get LONG codes -- priority to '
           f'the lowest frequency.', satir={'c': [2, 3, 4], 'java': [2, 3, 4]})
    sayac = 0
    for _ in range(4):
        sol, sag = sira[0], sira[1]
        a.ayarla(f'hf{sol}', st='vurgu')
        a.ayarla(f'hf{sag}', st='vurgu')
        a.kare(f'En düşük öncelikli iki düğüm: {sol} ve {sag}. İkisini de öbekten çıkarıyoruz (pop).',
               f'The two lowest-priority nodes: {sol} and {sag}. We pop both off the heap.',
               satir={'c': [9, 10, 11], 'java': [9, 10, 11]})
        sira = sira[2:]
        sayac += 1
        yeni = f'm{sayac}'
        freq[yeni] = freq[sol] + freq[sag]
        tie[yeni] = 1000 + sayac
        y[yeni] = min(y[sol], y[sag]) - 90
        x[yeni] = (x[sol] + x[sag]) / 2
        a.daire(f'hf{yeni}', x[yeni], y[yeni], _huffman_etiket(yeni, freq))
        a.ok(f'ok_{yeni}_0', f'hf{yeni}', f'hf{sol}', tur='merkez', metin='0')
        a.ok(f'ok_{yeni}_1', f'hf{yeni}', f'hf{sag}', tur='merkez', metin='1')
        a.ayarla(f'hf{sol}', st='normal')
        a.ayarla(f'hf{sag}', st='normal')
        a.kare(f'Yeni bir ebeveyn düğüm oluşturulur (sıklık {freq[yeni]} = {freq[sol]} + {freq[sag]}); sol kenar '
               f'"0", sağ kenar "1" olarak etiketlenir.',
               f'A new parent node is created (frequency {freq[yeni]} = {freq[sol]} + {freq[sag]}); the left '
               f'edge is labelled "0", the right edge "1".', satir={'c': [12, 13], 'java': [12, 13]})
        sira = sorted(sira + [yeni], key=lambda k: (freq[k], tie[k]))
        yer = _oncelik_x(sira)
        for k in sira:
            x[k] = yer[k]
            a.tasi(f'hf{k}', x[k], y[k])
        a.kare('Yeni düğüm, öncelik sırasındaki doğru yerine geri konur (küçük sıklık solda).',
               'The new node is reinserted into the priority order at its correct spot (small frequency on the left).',
               satir={'c': [14], 'java': [14]})
    a.kare('Bitti: tek düğüm kaldı, bu Huffman ağacının kökü (toplam sıklık = 11). Her kenar 0 ya da 1 -- kökten '
           'bir yaprağa giden yol, o harfin kodudur.',
           'Done: one node remains, the root of the Huffman tree (total frequency = 11). Every edge is 0 or 1 -- '
           'the path from the root to a leaf is that letter\'s code.', satir={'c': [16], 'java': [16]})
    return a


C_HUFFMAN_ENCODE = [
    'static void assign_codes(Node *node, char *path, int depth) {',
    '    if (node->left == NULL && node->right == NULL) {',
    "        path[depth] = '\\0';",
    '        strcpy(codes[(unsigned char)node->ch], path);',
    '        return;',
    '    }',
    "    path[depth] = '0';",
    '    assign_codes(node->left, path, depth + 1);',
    "    path[depth] = '1';",
    '    assign_codes(node->right, path, depth + 1);',
    '}',
    '',
    "/* encode by concatenating each character's code */",
    'char encoded[1024] = "";',
    "for (int i = 0; text[i] != '\\0'; i++)",
    '    strcat(encoded, codes[(unsigned char)text[i]]);',
]
JAVA_HUFFMAN_ENCODE = [
    'static void assignCodes(Node node, StringBuilder path) {',
    '    if (node.left == null && node.right == null) {',
    '        codes[node.ch] = path.toString();',
    '        return;',
    '    }',
    "    path.append('0');",
    '    assignCodes(node.left, path);',
    '    path.deleteCharAt(path.length() - 1);',
    "    path.append('1');",
    '    assignCodes(node.right, path);',
    '    path.deleteCharAt(path.length() - 1);',
    '}',
    '',
    "// encode by concatenating each character's code",
    'StringBuilder encoded = new StringBuilder();',
    'for (int i = 0; i < text.length(); i++)',
    '    encoded.append(codes[text.charAt(i)]);',
]


def huffman_encode():
    a = Anim('huffman-encode', 'Huffman ile kodlama (encode)', 'Encoding with Huffman codes', gen=880, yuk=460,
             kod={'c': C_HUFFMAN_ENCODE, 'java': JAVA_HUFFMAN_ENCODE})
    freq, x, y, kenarlar, kok = _huffman_simule()
    kodlar = _huffman_kodlar(kenarlar, kok)
    for k in x:
        a.daire(f'hf{k}', x[k], y[k], _huffman_etiket(k, freq))
    for (ebeveyn, bit), cocuk in kenarlar.items():
        a.ok(f'ok_{ebeveyn}_{bit}', f'hf{ebeveyn}', f'hf{cocuk}', tur='merkez', metin=bit)
    tablo = '  '.join(f'{h}={kodlar[h]}' for h in ('A', 'B', 'R', 'C', 'D'))
    a.etiket('tablo', 400, 350, T(f'kodlar: {tablo}', f'codes: {tablo}'), boyut=14, kod=True)
    a.kare(f'Onceki animasyonda kurdugumuz Huffman agacini tekrar kullaniyoruz. Her yaprak icin kod, kokten o '
           f'yaprağa giden yoldaki 0/1 degerleri: {tablo}.',
           f'We reuse the Huffman tree from the previous animation. Each leaf\'s code is the 0/1 sequence on the '
           f'path from the root to that leaf: {tablo}.', satir={'c': [1, 2, 6, 7, 8, 9, 10], 'java': [1, 2, 5, 6, 8, 9]})
    kelime = 'ABRA'
    a.etiket('kodlanan', 400, 380, T('kodlanmis: ', 'encoded: '), boyut=16, kalin=True, kod=True)
    bit_dizisi = ''
    for ch in kelime:
        kod = kodlar[ch]
        yol = [kok]
        cur = kok
        for bit in kod:
            cur = kenarlar[(cur, bit)]
            yol.append(cur)
        for d in yol:
            a.ayarla(f'hf{d}', st='vurgu')
        a.kare(f'Karakter "{ch}": kokten {ch} yapragina giden yol vurgulanir -- kod = {kod}.',
               f'Character "{ch}": the root-to-leaf path for {ch} is highlighted -- code = {kod}.',
               satir={'c': [1, 2, 6, 7, 8, 9, 10], 'java': [1, 2, 5, 6, 8, 9]})
        for d in yol:
            a.ayarla(f'hf{d}', st='normal')
        bit_dizisi += kod
        a.ayarla('kodlanan', metin=T(f'kodlanmis: {bit_dizisi}', f'encoded: {bit_dizisi}'))
        a.kare(f'`{kod}` bitleri kodlanmis dizinin sonuna eklenir: simdiye kadar `{bit_dizisi}`.',
               f'The bits `{kod}` are appended to the encoded string so far: `{bit_dizisi}`.',
               satir={'c': [13, 14, 15], 'java': [14, 15, 16]})
    duz_bit = len(kelime) * 8
    a.kare(f'Sonuc: "{kelime}" -> `{bit_dizisi}` ({len(bit_dizisi)} bit). Duz ASCII ile {len(kelime)} * 8 = '
           f'{duz_bit} bit gerekirdi -- Huffman kodu daha kisa, cunku A (en sik harf) yalnizca 1 bit.',
           f'Result: "{kelime}" -> `{bit_dizisi}` ({len(bit_dizisi)} bits). Plain ASCII would need '
           f'{len(kelime)} * 8 = {duz_bit} bits -- the Huffman code is shorter because A (the most frequent '
           f'letter) needs only 1 bit.')
    return a


HEPSI = {
    'tree-terminology': tree_terminology,
    'inorder-traversal': inorder_traversal,
    'preorder-traversal': preorder_traversal,
    'postorder-traversal': postorder_traversal,
    'inorder-traversal-stack': inorder_traversal_stack,
    'level-order-traversal': level_order_traversal,
    'heap-insert-sift-up': heap_insert_sift_up,
    'heap-extract-sift-down': heap_extract_sift_down,
    'build-heap': build_heap,
    'heap-sort': heap_sort,
    'huffman-build': huffman_build,
    'huffman-encode': huffman_encode,
}

if __name__ == '__main__':
    adlar = [x for x in sys.argv[1:] if not x.startswith('-')] or list(HEPSI)
    hizli = '--hizli' in sys.argv          # yalniz JSON + HTML (GIF/PNG yok)
    for ad in adlar:
        yol = HEPSI[ad]().yaz(CIKTI, gif=not hizli, serit=not hizli)
        print('yazildi:', yol.name)
