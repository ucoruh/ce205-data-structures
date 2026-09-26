---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Hafta 4 — Ağaçlar, Öbekler ve Huffman Kodlaması"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Hafta 4"
footer: "RTEÜ Bilgisayar Mühendisliği · 2026-2027 Güz"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Ağaçlar, Öbekler ve Huffman Kodlaması

**CEN207 Veri Yapıları — Hafta 4**

Dr. Öğr. Üyesi Uğur CORUH · 2026-2027 Güz

<!--
Konuşma notu: Bugün bir düğüm birden fazla düğüme işaret edebiliyor. Bir işaretçinin ikiye çıkması — listeden ağaca geçişin tamamı bu. Bu tek değişiklik, bugün öbeği, öncelik kuyruğunu ve Huffman kodlamasını, hepsini bir oturumda kuruyor.
-->

---

# Bugünün planı (3 saat)

| Saat | Konu |
| --- | --- |
| 1 | Ağaçlar, terimler, biçimler **Anim 1–2** · dolaşmalar: pre/in/post/yinelemesiz/level **Anim 3–7** |
| 2 | Dizi gösterimi **Anim 8** · ikili öbek: ekleme/çıkarma/kurma/sıralama **Anim 9–12** |
| 3 | Öncelik kuyruğu **Anim 13** · varyasyonlar **Anim 14–16** · Huffman **Anim 17–18** |

**Öğrenme çıktıları:** ÖÇ.1 (temel veri yapılarını açıklama) · ÖÇ.2 (karmaşıklık analizi) · ÖÇ.7 (doğru yapıyı seçme)

<!-- Konuşma notu: On sekiz kısa animasyon dersin tamamını taşıyor; her biri, fikri tanıttığımız yerde bir kez görünüyor, birçoğu en can alıcı uç durumuna da bir kez daha bakıyor. -->

---

# Bu haftanın kavramları — nerede

| Kavram | Nerede |
| --- | --- |
| Ağaç terimleri, ikili ağaç biçimleri | Bölüm 1–2 |
| Dolaşmalar (pre/in/post/yinelemesiz/level) | Bölüm 3 |
| Ağacın dizi gösterimi | Bölüm 4 |
| İkili öbek, öbek sıralaması | Bölüm 5 |
| Öncelik kuyruğu, varyasyonlar, Huffman | Bölüm 6–8 |

<!-- Konuşma notu: Her terim ilk geçtiği yerde tam olarak tanımlanır; bu tablo yalnızca onu nerede tekrar bulacağınızı söylüyor. -->

---

# Kod örnekleri nasıl çalışıyor

- Her fikrin eksiksiz bir **C** ve **Java** programı var
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Kaynaklar: `code/week-04/c/` ve `code/week-04/java/`
- Her programın beklenen çıktısı hafta notlarında var

<!-- Konuşma notu: İsterseniz şimdi bir terminal açın; bugünün her kod parçası tam olarak gösterildiği gibi derlenir ve çalışır. -->

---

# Tekrar — Hafta 1–2: işaretçiler ve listeler

- `malloc`/`free`: bir kutu, bir sahip, boşken `NULL`
- Bağlı liste düğümü: bir değer + bir `next` işaretçisi
- Ağaç düğümü: bir değer + **iki** işaretçi, `left`/`right`
- Liste `NULL`de biter; ağaçta ikisi de `NULL` olan **yaprak**tır

<!-- Konuşma notu: Bir ağaç düğümü, bir işaretçi alanı daha fazla olan bağlı liste düğümüdür — yeni olan gerçekten bu kadar. -->

---

# Tekrar — Hafta 3: yığın, kuyruk, özyineleme

- Özyineleme yığının **ta kendisi**: çağrı push, dönüş pop
- Bugün: *aynı* dolaşma, kendi yığınımızla, elle
- Kuyruk (FIFO) değişmeden geri dönüyor, level order için
- Hafta 3'ün yapıları artık düğüm tutuyor, sayı değil

<!-- Konuşma notu: Bellek konusunda bugün yeni bir şey yok — yalnızca aynı işaretçi ve yığın/kuyruk fikirlerinden kurulu yeni biçimler var. -->

---

# Haftanın haritası — bir bakışta

| Ağaçlar ve dolaşmalar | Öbekler ve Huffman |
| --- | --- |
| Terimler, beş biçim | İkili öbek, öbek sıralaması |
| Beş dolaşma sırası | Öncelik kuyruğu, varyasyonlar |
| Dizi gösterimi | Huffman kodlaması |

<!-- Konuşma notu: Bu haritadaki her kutu aşağıda kendi slaytlarını alıyor, çoğu kısa bir animasyon ve eksiksiz bir C/Java programıyla. -->

---

<!-- _class: bolum -->

# 1. Neden Ağaç? Terimler ve Tarihçe

<!-- Konuşma notu: Bölüm 1, sonraki her bölümün üzerine kurulduğu terimleri — kök, ebeveyn, çocuk, yaprak, derinlik, yükseklik — bir düğümün istediği sayıda çocuğu olabildiği genel bir ağaçta kuruyor. -->

---

# Başlangıç sorusu

Bir dosya yöneticisi: bir ana klasör, klasörlerin
içinde klasörler, onların içinde dosyalar. Bir
kök, sınırsız dallanma, ve hiçbir klasör kendi
atası olamıyor.

<!-- Konuşma notu: Sorun: bu biçim bir yığın mı, bir kuyruk mu, yoksa yeni bir şey mi? Dallanıyor — bugünün tüm yeniliği bu. -->

---

# Kısa bir tarihçe

- **1857** — Cayley, molekülleri sayarken ağaçları da sayıyor
- **1968** — Knuth, terimleri *TAOCP* Cilt 1'de sabitliyor
- Kök, yaprak, derece, seviye, yükseklik — hâlâ onun terimleri
- Matematiğin en eski biçimlerinden biri, bilgisayara ödünç

<!-- Konuşma notu: Cayley bilgisayarı hiç düşünmüyordu — hidrokarbon izomerlerini sayıyordu, dallanma yapıları tam olarak bir ağaç. -->

---

# Sezgi — baş aşağı bir ağaç

- **Kök** gövdedir — **en üste** çizilir
- Her şey kökten **aşağıya** dallanır
- **Yaprak**ın çocuğu yoktur — bir dalın sonu
- Evet baş aşağı: bilgisayar bilimi hep böyle çizer

<!-- Konuşma notu: "Kök neden en üstte" diye sorun — bir doğa kanunu değil, ama bu alanda tamamen evrensel bir gelenek. -->

---

# Terimler (1/3)

| Terim | Anlamı |
| --- | --- |
| **Kök (root)** | Ebeveyni olmayan tek düğüm |
| **Ebeveyn / çocuk** | `A`dan `B`ye kenar varsa, `A` ebeveyn, `B` çocuk |
| **Kardeş (sibling)** | Aynı ebeveyni paylaşan iki düğüm |
| **Yaprak (leaf)** | Çocuğu olmayan düğüm — derece 0 |

<!-- Konuşma notu: Bu tablodaki her terim, hemen sonraki animasyonda, sırayla, gerçek bir ağaç üzerinde işaret ediliyor. -->

---

# Terimler (2/3)

| Terim | Anlamı |
| --- | --- |
| **İç düğüm** | En az bir çocuğu olan düğüm |
| **Kenar (edge)** | Ebeveyn-çocuk bağı; *n* düğüm, *n*−1 kenar |
| **Derece (degree)** | Bir düğümün çocuk sayısı |
| **Derinlik (depth)** | Kökten o düğüme inen kenar sayısı |

<!-- Konuşma notu: n-1 kenar üzerinde durmaya değer: kök hariç her düğümün tam olarak bir kenarı var, kendi ebeveynine. -->

---

# Terimler (3/3)

| Terim | Anlamı |
| --- | --- |
| **Yükseklik (height, düğüm)** | En derin yaprağa inen en uzun yol |
| **Yükseklik (height, ağaç)** | Kökün yüksekliği |
| **Altağaç (subtree)** | Bir düğüm + altındaki her şey |

<!-- Konuşma notu: Derinlik kökten aşağı sayar; yükseklik bir düğümden en derin yaprağına aşağı sayar — sayma yönü kafa karıştıran şey. -->

---

# Ağaç terimleri, tek tek

<iframe class="dsanim" src="anim/tree-terminology.html?yer=slayt&lang=tr" title="Ağaç terimleri: kök, ebeveyn, çocuk, yaprak, derinlik, yükseklik"></iframe>

<!-- Konuşma notu: Normal örnek: 11 düğümlü dallı bir ağaç. Her terimin aynı gerçek ağaç üzerinde, sırayla, nasıl yanıp söndüğünü izleyin. -->

---

# Uç durum — yıldız: kökün 10 çocuğu var

<iframe class="dsanim" src="anim/tree-terminology.html?yer=slayt&lang=tr&example=star" title="Ağaç terimleri: yıldız"></iframe>

<!-- Konuşma notu: Yıldız "derece"yi en zorlu şekilde sınar: derecesi 10 olan bir düğüm, her biri derecesi 0 olan on yaprak, ve yüksekliği yalnızca 1 olan bir ağaç. -->

---

# Kod — ağaç düğümü

```c
typedef struct Node {
    char label[4];
    struct Node *children[MAX_CHILDREN];
    int child_count;   /* bu düğümün derecesi */
    int depth;
    struct Node *parent;
} Node;
```

<!-- Konuşma notu: Bunu Hafta 2'nin bağlı liste düğümüyle karşılaştırın: aynı fikir, ama children artık bir dizi, çünkü genel bir ağaç düğümünün birden fazla çocuğu olabilir, tek bir "next" değil. -->

---

# Kod — height() (aşağıdan yukarı, özyinelemeli)

```c
int height(Node *n) {
    if (n->child_count == 0)
        return 0;         /* yaprak: yükseklik 0 */
    int best = -1;
    for (int i = 0; i < n->child_count; i++) {
        int h = height(n->children[i]);
        if (h > best) best = h;
    }
    return best + 1;      /* 1 + en yüksek çocuk */
}
```

<!-- Konuşma notu: Bir yaprağın yüksekliği taban durumu, 0; başka her düğüm 1 + en yüksek çocuğu — kuyruk gerekmez, saf özyineleme. -->

---

# Kod — compute_depths() (yukarıdan aşağı, BFS)

```c
void compute_depths(Node *root) {
    Node *queue[MAX_NODES];
    int front = 0, rear = 0;
    root->depth = 0;
    queue[rear++] = root;
    while (front < rear) {
        Node *cur = queue[front++];
        for (int i = 0; i < cur->child_count; i++) {
            Node *ch = cur->children[i];
            ch->depth = cur->depth + 1;
            queue[rear++] = ch;
        }
    }
}
```

<!-- Konuşma notu: Derinlik önce ebeveynin cevabına ihtiyaç duyar, o yüzden bir kuyrukla yukarıdan aşağı yürür — height'ın aşağıdan yukarı özyinelemesinin ayna görüntüsü. -->

---

# Karmaşıklık

- `height`: her düğüm bir kez ziyaret edilir — **O(n)**
- `compute_depths`: her düğüm bir kez ziyaret edilir — **O(n)**
- İkisi de ağacın **biçimine** bağlı değil
- İnce bir zincir, dallı bir ağaçla aynı *n* için aynı maliyette

<!-- Konuşma notu: Biçim, bu hafta ilerledikçe, toplam iş değil de özyineleme *derinliği* söz konusu olunca çok önem kazanacak. -->

---

# Sık yapılan hatalar

- **Derinlik**i (kökten aşağı) **yükseklik**le (yaprağa kadar) karıştırmak
- Bir yaprağın yüksekliğinin 0, 1 değil, olduğunu unutmak
- Her ağacın **ikili** olduğunu sanmak — genel bir düğümün istediği kadar çocuğu olabilir

<!-- Konuşma notu: İkili sınırlama tam olarak bir sonraki bölümde başlıyor, ve bu bir doğa kanunu değil, hilelerinden ötürü yaptığımız bir seçim. -->

---

# Mini soru

18 düğümlü örnekte, `Q1`nin çocukları `S1`
ve `S2`. `Q1`nin **derecesi** nedir? `Q1`nin
derinliği 1 ise, `S1`in derinliği nedir?

<!-- Konuşma notu: Sonraki slayttan önce her iki cevabı da sınıfa sordurun. -->

---

# Cevap

`Q1`nin derecesi **2**dir (iki çocuğu var).
`S1`, `Q1`nin çocuğu olduğu için derinliği
`Q1`nin derinliği + 1 = **2**dir.

<!-- Konuşma notu: Derinlik, kökten her seviye aşağı inildiğinde tam olarak bir artar — kısayol yok, istisna yok. -->

---

<!-- _class: bolum -->

# 2. İkili Ağaçlar: Biçimler ve Düğüm Sayıları

<!-- Konuşma notu: Bir sınırlama — en çok iki çocuk, left ve right adıyla — öbeği, Huffman kodlamasını ve gelecek dönemin arama ağaçlarını açıyor. -->

---

# Başlangıç sorusu

Her düğümü **en çok iki** çocukla, left ve
right, sınırlayın. "İstediği kadar çocuk"tan
vazgeçmek neden değerli olsun?

<!-- Konuşma notu: Karşılığı, dizi indisleri üzerinde bölüm 4'ün tanıtacağı aritmetik hileler — sınırsız çocukla imkânsız. -->

---

# Kod — ikili ağaç düğümü

```c
typedef struct Node {
    int value;
    struct Node *left, *right;
} Node;
```

<!-- Konuşma notu: Bu haftanın kalan her programı tam olarak bu struct'ın üzerine kuruluyor — bağlı liste düğümünden bir işaretçi fazla. -->

---

# Beş biçim, kesin tanımlarıyla

| Biçim | Tanım |
| --- | --- |
| **Dolu (full)** | Her düğümün 0 ya da 2 çocuğu var |
| **Tam (complete)** | Son seviye hariç her seviye dolu, soldan sağa |
| **Mükemmel (perfect)** | Dolu **ve** her yaprak aynı derinlikte |
| **Dejenere (degenerate)** | Her düğümün 0 ya da 1 çocuğu — bir zincir |
| **Dengeli (balanced)** | Sol/sağ altağaç yükseklikleri ≤ 1 fark |

<!-- Konuşma notu: Bunlar beş bağımsız evet/hayır sorusu — bir ağaç tam olmadan dolu olabilir, ya da tersi. -->

---

# İkili ağaç biçimleri, tek tek

<iframe class="dsanim" src="anim/tree-shapes.html?yer=slayt&lang=tr" title="İkili ağaç biçimleri"></iframe>

<!-- Konuşma notu: Normal örnek: 12 düğüm, tam ama mükemmel değil. Animasyon aynı ağaç üzerinde beş evet/hayır sorusunu da soruyor. -->

---

# Uç durum — dejenere bir zincir, 10 düğüm

<iframe class="dsanim" src="anim/tree-shapes.html?yer=slayt&lang=tr&example=degenerate" title="İkili ağaç biçimleri: dejenere"></iframe>

<!-- Konuşma notu: Dejenere bir ağaç dolu, tam ve mükemmelin hepsinde birden başarısız, ve yüksekliği n-1 — düz bir bağlı liste kadar kötü. -->

---

# Kaç düğüm sığar?

- **Yükseklik *h*'de en çok:** mükemmel ağaçta 2<sup>h+1</sup> − 1 düğüm
- Seviye *k*, 2<sup>k</sup> düğüm tutar; *h*'ye kadar toplayın
- ***n* düğüm için en az yükseklik:** ⌊log₂ n⌋, hiçbir dizilim daha iyisini yapamaz
- Her seviye, üstündekinin en çok iki katı düğüm tutar

<!-- Konuşma notu: Bu iki formül sürekli geri geliyor — bölüm 5'teki öbek ikisine de dayanıyor. -->

---

# Denge neden önemli

- **Dengeli** bir ağaç yüksekliği log₂ n'e yakın tutar
- Kökten yapraga işlemler o zaman **O(log n)** maliyetli
- **Dejenere** bir ağacın yüksekliği n − 1, bir listeden farksız
- Aynı düğüm sayısı, çok farklı maliyet — biçim belirler

<!-- Konuşma notu: Denge, gelecek dönem ikili arama ağaçlarını rastgele değil dikkatle kurmaya değer kılan tek sebep. -->

---

# Kod — is_complete (boşlukları yakalamak)

```c
static bool is_complete(Node *root) {
    Node *queue[MAX_NODES]; int front = 0, rear = 0;
    queue[rear++] = root;
    bool seen_gap = false;
    while (front < rear) {
        Node *n = queue[front++];
        if (n == NULL) { seen_gap = true; continue; }
        if (seen_gap) return false;
        queue[rear++] = n->left;
        queue[rear++] = n->right;
    }
    return true;
}
```

<!-- Konuşma notu: Bu, bir kuyrukla seviye seviye yürür, bilerek NULL yer tutucular ekler, ki boşluktan sonra gerçek bir düğüm yakalanabilsin. -->

---

# Kod — check_balance (iki değil bir geçiş)

```c
static int check_balance(Node *n) {
    if (n == NULL) return 0;
    int hl = check_balance(n->left);
    if (hl == -1) return -1;
    int hr = check_balance(n->right);
    if (hr == -1) return -1;
    if (abs(hl - hr) > 1) return -1;
    return 1 + (hl > hr ? hl : hr);
}
```

<!-- Konuşma notu: Tek bir gözcü değer, -1, "artık dengesiz" bilgisini özyineleme boyunca yukarı taşır, aynı altağacı iki kez gezmeden. -->

---

# Karmaşıklık

- Beş biçim kontrolünün hepsi **O(n)** — her düğüm bir kez
- `is_complete`, kuyruğu için O(n) ekstra alana ihtiyaç duyar
- Diğer dördü yalnızca **O(h)** özyineleme yığını alanı ister

<!-- Konuşma notu: h yükseklik, ve dejenere bir ağacın O(n) yığın alanı tam olarak bu yüzden en kötü durum. -->

---

# Sık yapılan hatalar

- "Tam"ın her seviyenin dolu olması demek olduğunu sanmak
- **Mükemmel**i (tam + tüm yapraklar aynı derinlikte) tam ile karıştırmak
- `height()`i düğüm başına iki kez çağırmak — O(n)'i **O(n²)**'ye çevirir

<!-- Konuşma notu: Yukarıdaki tek geçişli check_balance, tam olarak bu çok yaygın tuzağı önlemek için var. -->

---

# Mini soru

İkili bir ağacın yüksekliği 3 ve **mükemmel**.
Kaç düğümü var? Kaçı yaprak?

<!-- Konuşma notu: İki slayt öncesindeki formülleri kullanın. -->

---

# Cevap

2<sup>4</sup> − 1 = **15** düğüm. Son seviye
(seviye 3) 2<sup>3</sup> = **8** yaprak tutar;
diğer 7 düğüm iç düğümdür.

<!-- Konuşma notu: Her mükemmel ağacın yaprak sayısı, toplam düğümünün yaklaşık yarısı — iyi bir sağlık kontrolü. -->

---

<!-- _class: bolum -->

# 3. Dolaşmalar: Her Düğümü Bir Kez Ziyaret Etmek

<!-- Konuşma notu: Bir ağacın tek "doğal" bir sırası yok — düğümün iki çocuğu var, o yüzden hangisinin önce ve düğümün kendisinin ne zaman ziyaret edileceğine dair gerçek bir seçim var. -->

---

# Tek bir "doğal" sıra yok

- Bir düğümün (en çok) iki çocuğu var — gerçek bir seçim
- Üç özyinelemeli sıra: **preorder, inorder, postorder**
- Özyinelemesiz iki sıra daha: kendi **yığınımız**, ve bir **kuyruk**
- Aynı ağaç, beş sıra, genelde beş farklı sonuç

<!-- Konuşma notu: Aşağıdaki beş program aynı 10 düğümlü dengeli ağacı paylaşır: [50,30,70,20,40,60,80,10,-,-,45,55] — değişen yalnızca ziyaret sırası. -->

---

# Preorder: ziyaret, sol, sağ

Düğümü çocuklarından **önce** ziyaret edin.
Kök her zaman **ilk** ziyaret edilir — tam
olarak bir ağacı **sıfırdan kurmak** için gereken sıra.

<!-- Konuşma notu: Diziyi geri okurken, okunan ilk değer her zaman bir sonraki altağacın köküdür. -->

---

# Preorder, adım adım

<iframe class="dsanim" src="anim/preorder-traversal.html?yer=slayt&lang=tr" title="Preorder dolaşma"></iframe>

<!-- Konuşma notu: Vurgulanan çağrı yolunun kökten şu an etkin olan çağrıya kadar izlediği rotayı gözlemleyin. -->

---

# Uç durum — sola yığılmış bir zincir

<iframe class="dsanim" src="anim/preorder-traversal.html?yer=slayt&lang=tr&example=left-skewed" title="Preorder: sola yığılmış zincir"></iframe>

<!-- Konuşma notu: Yalnızca sol çocuklarla, preorder zincirin kurulduğu sırayla ziyaret eder — her zaman ziyaret, sonra tek çocuk. -->

---

# Kod — preorder (özyinelemeli)

```c
static void preorder(Node *node) {
    if (node == NULL) return;
    printf("visit %d\n", node->value);
    visited[visited_count++] = node->value;
    preorder(node->left);
    preorder(node->right);
}
```

<!-- Konuşma notu: Önce ziyaret, sonra sol, sonra sağ — taban durum, node == NULL, ilk sırada olmalı, yoksa boş bir altağaçta çöker. -->

---

# Inorder: sol, ziyaret, sağ

Düğümü çocukları **arasında** ziyaret edin.
Bir ikili **arama** ağacında bu, her değeri
**sıralı** ziyaret eder — burada önizlendi, ileride kurulacak.

<!-- Konuşma notu: Bu gösterim ağaçlarında, BST kurallarıyla kurulmadıkları için, inorder yine de sol-önce-kendi-sonra-sağ çalışır; sadece sıralanmış çıkmaz. -->

---

# Inorder, adım adım

<iframe class="dsanim" src="anim/inorder-traversal.html?yer=slayt&lang=tr" title="Inorder dolaşma"></iframe>

<!-- Konuşma notu: Normal ağaçta, [50,30,70,...], inorder tam olarak sıralı çıkıyor: 10 20 30 40 45 50 55 60 70 80. -->

---

# Uç durum — sağa yığılmış bir zincir

<iframe class="dsanim" src="anim/inorder-traversal.html?yer=slayt&lang=tr&example=right-skewed" title="Inorder: sağa yığılmış zincir"></iframe>

<!-- Konuşma notu: Yalnızca sağ çocuklarla önce ziyaret edilecek sol altağaç yok, o yüzden inorder tam olarak zincirlenme sırasında çıkar — sola yığılmışın tersi. -->

---

# Kod — inorder (özyinelemeli)

```c
static void inorder(Node *node) {
    if (node == NULL) return;
    inorder(node->left);
    printf("visit %d\n", node->value);
    visited[visited_count++] = node->value;
    inorder(node->right);
}
```

<!-- Konuşma notu: preorder ile tıpatıp aynı biçim — yalnızca "visit" satırının yeri, ilk yerden ortaya, değişiyor. -->

---

# Postorder: sol, sağ, ziyaret

Düğümü her iki çocuktan **sonra** ziyaret edin.
Kök her zaman **en son** ziyaret edilir — tam
olarak bir ağacı güvenle **silmek** için gereken sıra.

<!-- Konuşma notu: Bir düğümün çocuklarını, düğümün kendisinden önce serbest bırakın, yoksa serbest bırakılmış işaretçilere tekrar ihtiyaç duyarsınız. -->

---

# Postorder, adım adım

<iframe class="dsanim" src="anim/postorder-traversal.html?yer=slayt&lang=tr" title="Postorder dolaşma"></iframe>

<!-- Konuşma notu: Bu koşunun ilk ve son yazdırılan değerlerini preorder'ınkiyle karşılaştırın — burada kök son, orada ilk. -->

---

# Uç durum — sağa yığılmış zincir, tersten

<iframe class="dsanim" src="anim/postorder-traversal.html?yer=slayt&lang=tr&example=right-skewed" title="Postorder: sağa yığılmış zincir"></iframe>

<!-- Konuşma notu: Sol altağaç olmadan, postorder yine "kendini son ziyaret et"i saklar, o yüzden sağ zincir tam ters sırayla çıkar. -->

---

# Kod — postorder (özyinelemeli)

```c
static void postorder(Node *node) {
    if (node == NULL) return;
    postorder(node->left);
    postorder(node->right);
    printf("visit %d\n", node->value);
    visited[visited_count++] = node->value;
}
```

<!-- Konuşma notu: Her zamanki üç satır, yalnızca sona taşınmış — ziyaret, sol, sağ; sol, sağ, ziyaret oluyor. -->

---

# Karmaşıklık — üç dolaşma da

- **O(n)** zaman: her düğüm bir kez, düğümde O(1) iş
- **O(h)** özyineleme yığını alanı — ağacın yüksekliği
- Dengeli ağaçta O(log n), ama bir zincirde **O(n)**
- Bu en kötü durum, bölüm 3.4'ün kendi yığınını doğuruyor

<!-- Konuşma notu: Üçü arasında değişen tek şey "ziyaret, sol, sağ"ın sırası; toplam iş asla değişmiyor. -->

---

# Sık yapılan hatalar

- Taban durumu unutmak — `node == NULL` dönmeli
- Senaryolar arasında paylaşılan ziyaret sayacını sıfırlamamak
- Üç sıranın "genelde aynı" olduğunu sanmak — tek bir ek düğüm bile ayırır
- Yanlış dolaşmayı seçmek: kurmak preorder, silmek postorder ister

<!-- Konuşma notu: Üçü de "her düğümü ziyaret eder", o yüzden yanlış seçim yine de çalışır — hata yalnızca sıra önem kazandığında ortaya çıkar. -->

---

# Mini soru

Bir ağacı bir dosyaya, değerleri geri okuyup
sırayla ekleyerek aynı ağacı yeniden kuracak
şekilde kaydetmeniz gerekiyor. Hangi sıra?

<!-- Konuşma notu: Hangi değerin ilk okunması gerektiğini düşünün. -->

---

# Cevap

**Preorder.** Geri okunan ilk değer kök
olmalı, ve preorder, kökü her iki altağaçtan
önce ziyaret eden tek sıradır.

<!-- Konuşma notu: Bu tam olarak preorder slaytlarının başındaki "sıfırdan kurmak" özelliği. -->

---

# Özyinelemesiz inorder

Her özyinelemeli dolaşma, gizlice derleyicinin
**çağrı yığınını** kullanır. Bu kez özyineleme
yok — Hafta 3'ten kendi **yığınımız**, `int`
yerine `Node *` tutan.

<!-- Konuşma notu: Tüm sol omurgayı push edin; artık sola gidemeyince pop edin, ziyaret edin, sonra sağ altağaca yürüyün ve tekrarlayın. -->

---

# Özyinelemesiz inorder, adım adım

<iframe class="dsanim" src="anim/iterative-inorder-stack.html?yer=slayt&lang=tr" title="Özyinelemesiz inorder"></iframe>

<!-- Konuşma notu: Sol omurga push edilirken yığının büyüdüğünü, sonra her pop'ta bir düğüm ziyaret edildikçe küçüldüğünü izleyin. -->

---

# Uç durum — yığın en derin noktasına ulaşıyor

<iframe class="dsanim" src="anim/iterative-inorder-stack.html?yer=slayt&lang=tr&example=left-skewed" title="Özyinelemesiz inorder: sola yığılmış"></iframe>

<!-- Konuşma notu: 10 düğümün hepsi tek biri pop edilmeden önce push edilir — yığın derinliği zincirin tamamına eşit. -->

---

# Kod — push / pop (kendi yığınımız)

```c
static void push(Node *n) {
    top = top + 1;
    stack_data[top] = n;
}
static Node *pop(void) {
    Node *n = stack_data[top];
    top = top - 1;
    return n;
}
```

<!-- Konuşma notu: Hafta 3'ün tam olarak aynı dizi tabanlı yığını — yalnızca eleman türü int'ten Node *'a değişti. -->

---

# Kod — ana döngü

```c
Node *cur = root;
while (cur != NULL || !is_empty()) {
    while (cur != NULL) {
        push(cur);
        cur = cur->left;
    }
    cur = pop();
    printf("visit %d\n", cur->value);
    cur = cur->right;
}
```

<!-- Konuşma notu: Tüm sol omurgayı push edin, pop edip ziyaret edin, sonra sağa adım atıp tekrarlayın — dış while'ın her iki yarısı da önemli. -->

---

# Karmaşıklık

- **O(n)** zaman — her düğüm bir kez push, bir kez pop
- **O(h)** alan — özyinelemeli sürümle tam olarak aynı
- Bellek kazancı yok; muhasebe yalnızca kendi yığınımıza taşındı
- Kazanç: kendi yığınımız, sabit bir özyineleme sınırını aşabilir

<!-- Konuşma notu: Çok derin, dejenere bir ağaç özyinelemeli çağrı yığınını çökertebilir; kendi dizi tabanlı yığınımız daha nazikçe biter. -->

---

# Sık yapılan hatalar

- `cur != NULL || !is_empty()`in herhangi bir yarısını atlamak
- Bir düğümü pop edip ziyaret ettikten sonra `cur = cur->right`i unutmak
- Atlarsanız, her sağ altağaç sessizce kaybolur

<!-- Konuşma notu: Bu döngü koşulunun her iki yarısı da önemli — ilkini atlarsanız çok erken durursunuz, ikincisini atlarsanız sonsuza kadar döner. -->

---

# Mini soru

**Mükemmel** yükseklik *h* bir ağaçta, bu
dolaşma boyunca yığında aynı anda en çok
kaç düğüm oturur?

<!-- Konuşma notu: Yığının o an tam olarak hangi düğümleri tuttuğunu düşünün. -->

---

# Cevap

***h* + 1.** Yığın her zaman yalnızca o anki
sol omurgayı tutar, ve mükemmel bir ağacın
en uzun sol omurgası *h* + 1 düğümlüdür.

<!-- Konuşma notu: 0'dan h'ye kadar derinlikler, dahil — bu h+1 düğüm, hiçbir zaman daha fazla değil. -->

---

# Level order (genişlik öncelikli), bir kuyrukla

Şimdiye kadarki her dolaşma **derine** gider,
**genişe** gitmeden önce. Level order kökü,
sonra derinlik 1'deki **her** düğümü ziyaret
eder — bir **kuyruk** gerektirir, yığın değil.

<!-- Konuşma notu: Kuyruğa eklenen ilk düğüm, kök, işlenen de ilk olmalı — bu tam olarak FIFO, bir yığın yanlış sıra verirdi. -->

---

# Level order, adım adım

<iframe class="dsanim" src="anim/level-order-traversal.html?yer=slayt&lang=tr" title="Level order dolaşma"></iframe>

<!-- Konuşma notu: Bir sonraki derinlik başlamadan önce her derinliğin tamamen bittiğini izleyin — 50, sonra 30 ve 70, sonra dört torun. -->

---

# Uç durum — kuyruk hep bir eleman tutuyor

<iframe class="dsanim" src="anim/level-order-traversal.html?yer=slayt&lang=tr&example=left-skewed" title="Level order: sola yığılmış zincir"></iframe>

<!-- Konuşma notu: Burada her düğümün tek çocuğu var, o yüzden hiçbir derinlikte birden fazla düğüm hiç yok — kuyruk 1 boyutunu asla geçmiyor. -->

---

# Kod — enqueue / dequeue

```c
static void enqueue(Node *n) {
    rear = (rear + 1) % QUEUE_CAP;
    queue_data[rear] = n;
    count++;
}
static Node *dequeue(void) {
    Node *n = queue_data[front];
    front = (front + 1) % QUEUE_CAP;
    count--;
    return n;
}
```

<!-- Konuşma notu: Hafta 3'ün tam olarak aynı dairesel kuyruğu — rear -1'den başlar ki ilk enqueue doğru şekilde 0. indise otursun. -->

---

# Kod — ana döngü

```c
enqueue(root);
while (!is_empty()) {
    Node *cur = dequeue();
    printf("visit %d\n", cur->value);
    if (cur->left != NULL) enqueue(cur->left);
    if (cur->right != NULL) enqueue(cur->right);
}
```

<!-- Konuşma notu: Bölüm 2'nin tamlık kontrolünün tersine, bu döngü asla NULL eklemez — iki kuralı bir arada karıştırmak klasik bir hata kaynağı. -->

---

# Karmaşıklık

- **O(n)** zaman — her düğüm bir kez enqueue, bir kez dequeue
- **O(w)** alan, *w* ağacın en büyük **genişliği**
- Dallı, dengeli bir ağaçta *w*, O(n) kadar büyük olabilir
- Her derinlik öncelikli dolaşmanın O(h) alanıyla karşılaştırın

<!-- Konuşma notu: Derinlik öncelikli dolaşmalar genişliği derinlikle takas eder; level order derinliği genişlikle — hiçbiri bedava değil. -->

---

# Sık yapılan hatalar

- `dequeue`i "zaten aynı kod" diye `pop` ile değiştirmek — sessizce derinlik öncelikliye döner
- Yanlışlıkla `NULL` çocukları kuyruğa eklemek — bir sonraki dequeue'da çöker

<!-- Konuşma notu: Kod her iki durumda da derlenir ve çalışır; hatayı yalnızca gerçek ziyaret sırası ortaya çıkarır. -->

---

# Mini soru

İki **farklı** ikili ağaç, tam olarak aynı
**level-order** değer dizisini paylaşabilir mi?
Doğru mu yanlış mı?

<!-- Konuşma notu: Tek başına bir level-order dizisinin hangi düğümün kimin çocuğu olduğunu söyleyip söylemediğini düşünün. -->

---

# Cevap

**Doğru.** Bir level-order dizisi, bir seviyede
herhangi bir boşluk olduğunda, ebeveyn-çocuk
ilişkilerini tek başına kodlamıyor.

<!-- Konuşma notu: Bir preorder-artı-inorder çifti birlikte belirli bir ağacı belirler; tek başına bir level-order dizisi belirlemez. -->

---

<!-- _class: bolum -->

# 4. Tam Bir Ağaç Bir Dizide

<!-- Konuşma notu: Tam olarak tam bir ağaç için, bir indis üzerinde aritmetik her işaretçinin yerini alır — hiç malloc yok, hiç left/right alanı yok. -->

---

# Başlangıç sorusu

İşaretçiler bellek maliyeti taşır, ve bir
ebeveyni bulmak ya saklı bir işaretçi ya da
bir arama ister. **Tam** bir ağaç için daha
ucuz bir yol var mı?

<!-- Konuşma notu: Var — ve bu tam olarak bölüm 5'teki ikili öbeğin kurulu olduğu gösterim. -->

---

# İndis formülleri

- İndis *i*'deki düğümün **sol çocuğu**: `2*i + 1`
- **Sağ çocuğu**: `2*i + 2`
- **Ebeveyni**: `(i - 1) / 2` (tam sayı bölmesi)
- Hiçbir yerde `left`, `right`, `parent` alanı yok — yalnızca bir dizi

<!-- Konuşma notu: Üç formül gösterimin tamamı; her şey tek bir düz dizi üzerinde saf aritmetik. -->

---

# Dizi gösterimi, adım adım

<iframe class="dsanim" src="anim/complete-tree-array.html?yer=slayt&lang=tr" title="Tam ağacın dizi gösterimi"></iframe>

<!-- Konuşma notu: Normal örnek: 12 düğüm, tam, hiç boşluk yok — her formül resmin söylediği yere tam olarak iniyor. -->

---

# Uç durum — TAM DEĞİL: bir boşluk

<iframe class="dsanim" src="anim/complete-tree-array.html?yer=slayt&lang=tr&example=gap" title="Dizi gösterimi: bir boşluk"></iframe>

<!-- Konuşma notu: İndis 9 ve 10 boş ama indis 11 dolu — boşluktan sonra tek bir gerçek düğüm, tamlığı tamamen bozmaya yeter. -->

---

# Kod — parent / left / right, is_complete

```c
static int parent(int i) { return (i - 1) / 2; }
static int left(int i)   { return 2 * i + 1; }
static int right(int i)  { return 2 * i + 2; }

static bool is_complete(int arr[], int n, int last_real) {
    for (int i = 0; i <= last_real; i++)
        if (arr[i] == EMPTY) return false;
    return true;
}
```

<!-- Konuşma notu: Üç tek satırlık formül, sonra bir döngü: son gerçek düğümden önceki herhangi bir boş slot, tamlığın hayır olması demek. -->

---

# Karmaşıklık

- `parent`, `left`, `right`: saf aritmetik — **O(1)**
- 10 düğüm ya da 10 milyon için maliyet aynı
- `is_complete`in kendisi: **O(n)**, dizinin bir taraması

<!-- Konuşma notu: O(1) çocuk/ebeveyn erişimi, dizi gösteriminin tüm amacı — ve öbeğin bir sonraki bölümde tam olarak ihtiyaç duyduğu şey. -->

---

# Sık yapılan hatalar

- Bu formülleri, gerçekte tam **olmayan** bir ağaçta kullanmak
- `(i - 1) / 2`ye, dilinizin tam sayı bölme kuralını kontrol etmeden güvenmek
- Kökün (`i = 0`) ebeveyni olmadığını, özel bir durum olduğunu unutmak

<!-- Konuşma notu: Formüller her durumda *bir* indis hesaplar; tam olmayan bir ağaçta o indis anlamsız olabilir. -->

---

# Mini soru

Tam bir ikili ağaç, bir dizide saklı. İndis
11'deki düğümün iki çocuğu var. Hangi
indislerde? Ebeveyni hangi indiste?

<!-- Konuşma notu: Birkaç slayt öncesindeki üç formülü uygulayın. -->

---

# Cevap

Çocuklar `2*11+1 = 23` ve `2*11+2 = 24`de.
Ebeveyn `(11-1)/2 = 5`te.

<!-- Konuşma notu: Aynı üç formül, her zaman, ağaç ne kadar büyük olursa olsun. -->

---

<!-- _class: bolum -->

# 5. İkili Öbek

<!-- Konuşma notu: İkili öbek, bölüm 4'ten tam bir ağaç, tek bir ek kuralla: her ebeveyn her iki çocuğunu da yeniyor. -->

---

# Başlangıç sorusu

Bir işletim sistemi, yüz bekleyen süreçten
en acilinin hangisi olduğunu, anında, tekrar
tekrar bilmeli. Her gelişte tüm listeyi
sıralamak boşa iş. En iyi değeri her zaman
elin altında tutan en ucuz yapı nedir?

<!-- Konuşma notu: Her gelişte sıralamak, geliş başına O(n log n) maliyetli — bu kadar sık bir şey için çok yavaş. -->

---

# Kısa bir tarihçe

- **1964** — J. W. J. Williams, öbeği ve **öbek sıralamasını** birlikte tanıtıyor
- **1964** — R. W. Floyd, O(n)'lik bir **kurma** yöntemi yayınlıyor
- Öbek, tam olarak sıralamayı hızlandırmak için icat edildi

<!-- Konuşma notu: Her iki makale de aynı yıl çıktı — öbek ve öbek sıralaması hiçbir zaman gerçekten ayrı fikirler değildi. -->

---

# Öbek özelliği

- **Min-öbek:** her ebeveyn ≤ her iki çocuk — en küçük kökte
- **Max-öbek:** her ebeveyn ≥ her iki çocuk — en büyük kökte
- Sıralı bir yapı **değil** — kardeşler arasında zorunlu sıra yok
- Yalnızca her ebeveyn kendi iki çocuğunu yeniyor, fazlası değil

<!-- Konuşma notu: Öbekler hakkında en yaygın yanlış anlama bu: bir öbek sıralı bir dizi değil, yalnızca kısmen sıralı. -->

---

# Öbek ADT'si

| İşlem | Ne yapar | Karmaşıklık |
| --- | --- | --- |
| `peek()` | Kökü silmeden döndürür | O(1) |
| `insert(x)` | `x`i ekler, **sift-up** ile onarır | O(log n) |
| `extract()` | Kökü siler, **sift-down** ile onarır | O(log n) |
| `build_heap(arr)` | Bir diziyi tek seferde öbeğe çevirir | O(n) |

<!-- Konuşma notu: Dört işlem, ve sonraki dört alt bölüm tam olarak bu dördünü, bu sırayla kuruyor. -->

---

# Ekleme: sift-up

Yeni değeri bir sonraki boş slota koyun —
ağacı tam tutar. Sonra öbek özelliği bozukken
tekrar tekrar **ebeveyniyle** yer değiştirin.
Buna **sift-up** denir.

<!-- Konuşma notu: Özellik sağlandığı ya da değer köke ulaştığı an durun — hangisi önce gelirse. -->

---

# Sift-up ile ekleme, adım adım

<iframe class="dsanim" src="anim/heap-insert-sift-up.html?yer=slayt&lang=tr" title="Sift-up ile öbek ekleme"></iframe>

<!-- Konuşma notu: Normal örnek: bir min-öbek, sırayla eklenen 10 değer: 15, 7, 22, 3, 18, 9, 30, 1, 25, 12. -->

---

# Uç durum — zaten sıralı, sifting gerekmiyor

<iframe class="dsanim" src="anim/heap-insert-sift-up.html?yer=slayt&lang=tr&example=already-ordered" title="Öbek ekleme: zaten sıralı"></iframe>

<!-- Konuşma notu: Bir min-öbeğe artan 12 değer: her ekleme öbek özelliğini zaten sağlıyor, o yüzden tek bir yer değiştirme bile olmuyor. -->

---

# Kod — insert() / sift-up

```c
void insert(int value) {
    heap[size] = value;
    int i = size;
    size++;
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (!better(heap[i], heap[parent]))
            break;
        int tmp = heap[parent];
        heap[parent] = heap[i];
        heap[i] = tmp;
        i = parent;
    }
}
```

<!-- Konuşma notu: better(), min-öbek ile max-öbeği bir fonksiyon arkasına gizler, o yüzden sift-up döngüsünün kendisi hiç değişmez. -->

---

# Karmaşıklık

- `insert`: her **seviye**de en çok bir yer değiştirme — **O(log n)**
- log n, n düğümlü tam bir ağacın yüksekliği
- `peek` (`heap[0]`i okumak): **O(1)**

<!-- Konuşma notu: Boyut değil yükseklik, insert'in maliyetini belirler — bölüm 2'nin "denge neden önemli" fikri işbaşında. -->

---

# Çıkarma: sift-down

Kökü kaydedin, dizinin **son** elemanını
yerine taşıyın — ağacı tam tutar. Sonra
tekrar tekrar **daha iyi çocuğuyla** yer
değiştirin. Buna **sift-down** denir.

<!-- Konuşma notu: Önce boyutu bir azaltın, sonra sift edin — taşınan eleman genellikle kökte hiç durmaz. -->

---

# Sift-down ile çıkarma, adım adım

<iframe class="dsanim" src="anim/heap-extract-sift-down.html?yer=slayt&lang=tr" title="Sift-down ile öbek çıkarma"></iframe>

<!-- Konuşma notu: Normal örnek: bir min-öbek, 12 değer, 3 çıkarma — son elemanın köke paraşütle inip sonra geri battığını izleyin. -->

---

# Uç durum — sonuna kadar: 10 değerin tamamı

<iframe class="dsanim" src="anim/heap-extract-sift-down.html?yer=slayt&lang=tr&example=drain" title="Öbek çıkarma: sonuna kadar"></iframe>

<!-- Konuşma notu: 10 değerin hepsini birer birer çıkarmak, tamamen sıralı bir sonuç veriyor — bu bir tesadüf değil, öbek sıralamasının tam kendisi. -->

---

# Kod — extract() / sift-down

```c
int extract(void) {
    int best = heap[0];
    size--;
    heap[0] = heap[size];   /* ... */
    int i = 0;
    while (1) {              /* sift-down */
        /* ... target = sol/sağ çocuktan iyi olan ... */
        if (target == i)
            break;
        /* ... heap[i]/heap[target] değiştir ... */
    }
    return best;
}
```

<!-- Konuşma notu: Yalnızca sol çocukla değil, her ikisiyle de karşılaştırın — tek tarafla karşılaştırmak diğer tarafta özelliği bozuk bırakabilir. -->

---

# Karmaşıklık

- `extract`: her **seviye**de en çok bir yer değiştirme — **O(log n)**
- sift-up'ın maliyetinin tam ayna görüntüsü
- Aynı O(log n) sınırı, ters yönde

<!-- Konuşma notu: insert en çok log n seviye tırmanır; extract en çok log n seviye batar — yükseklikler, yine, her şeyi belirler. -->

---

# Sık yapılan hatalar (ekleme ve çıkarma)

- `extract`i önce `size > 0` kontrol etmeden çağırmak
- sift-down'da yalnızca **bir** çocukla karşılaştırmak, ikisiyle değil
- `better`de `<` yerine `<=` kullanmak — zararsız, ama eşitlik davranışını değiştirir

<!-- Konuşma notu: Boş bir öbekte extract, heap[-1] bitişiği belleği sessizce okur — güvenli bir çökme değil, tehlikeli bir hata. -->

---

# Bir öbeği O(n)'de kurmak

n tek tek ekleme toplamda O(n log n)
maliyetli. **Floyd'un algoritması** daha iyisini
yapar: her **yaprak** zaten geçerli bir öbek;
yalnızca **iç** düğümleri, sondan köke, sift edin.

<!-- Konuşma notu: Bu gerçekten şaşırtıcı bir sonuç — kurma, n ekleme kadar maliyetli görünür ama değil. -->

---

# Öbek kurma, adım adım

<iframe class="dsanim" src="anim/build-heap.html?yer=slayt&lang=tr" title="Alttan yukarı öbek kurma"></iframe>

<!-- Konuşma notu: Normal örnek: bir max-öbek, rastgele sırada 10 değer — n/2 yapraktan kaçının hiç hareket ettiğini izleyin. -->

---

# Uç durum — girdi zaten geçerli bir öbek

<iframe class="dsanim" src="anim/build-heap.html?yer=slayt&lang=tr&example=already-heap" title="Öbek kurma: zaten geçerli"></iframe>

<!-- Konuşma notu: Her sift-down çağrısı target == i'yi hemen bulur ve hiçbir şey yapmaz — build_heap, girdinin gerektirdiği kadar iş yapar, ne fazla. -->

---

# Kod — build_heap()

```c
void build_heap(int arr[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--)
        sift_down(arr, n, i);
}
```

<!-- Konuşma notu: sift_down burada extract'in sift-down döngüsünün ta kendisi; yeni olan tek şey hangi düğümlerin, hangi sırayla çağrıldığı. -->

---

# Neden O(n), O(n log n) değil?

- Kabaca n/2 düğüm **yaprak** — tamamen atlanıyor
- Kabaca n/4 düğüm en çok 1, n/8'i en çok 2 yer değiştirme
- "Yükseklik *h*'deki sayı çarpı *h*" toplamı O(n)'e yakınsıyor
- Alttaki çok ucuz sift'ler, üstteki az sayıda maliyetliyi eziyor

<!-- Konuşma notu: Bu, tüm haftanın gerçekten şaşırtıcı tek karmaşıklık sonucu — bir süre üzerinde durmaya değer. -->

---

# Sık yapılan hatalar

- Döngüye `i = 0`dan başlamak, `i = n/2 - 1`den değil — düzeltilmemiş altağaçları sift eder
- `build_heap`i "yalnızca n tane insert" sanmak — geçerli, ama aynı dizilim ya da maliyet değil

<!-- Konuşma notu: Döngü sondan köke, geriye doğru çalışmalı, ki her düğüm sift edildiğinde altağaçları zaten geçerli olsun. -->

---

# Mini soru

`build_heap` ve `heap_sort`ın ana döngüsü
ikisi de tekrar tekrar `sift_down` çağırır.
Neden birincisi toplamda **O(n)**, ikincisi
**O(n log n)**?

<!-- Konuşma notu: Her sift-down çağrısının ağaçta nereden başladığını düşünün. -->

---

# Cevap

`build_heap`, alttaki çoğunlukla ucuz düğümleri
sift eder. `heap_sort`, her **çıkarma**da bir kez,
her zaman **kök**ten başlar — ortalanacak ucuz
bir çoğunluk yok.

<!-- Konuşma notu: Aynı fonksiyon, sift_down, iki çok farklı örüntüde çağrılıyor, iki çok farklı toplam maliyetle. -->

---

# Öbek sıralaması — fikir

`build_heap`, sonra tekrar tekrar kökü
sıralı kuyruğa taşıyın, küçültün, sift-down
yapın. Max-öbek **artan** sıralar; min-öbek
**azalan** sıralar.

<!-- Konuşma notu: build_heap ve extract ikisi de var olduğunda, sıralamak neredeyse bedava — bu bölüm ikisini birbirine bağlıyor. -->

---

# Öbek sıralaması, adım adım

<iframe class="dsanim" src="anim/heap-sort.html?yer=slayt&lang=tr" title="Öbek sıralaması"></iframe>

<!-- Konuşma notu: Normal örnek: bir max-öbekle artan sıralama, 10 değer — sıralı bölgenin dizinin sonundan geriye büyümesini izleyin. -->

---

# Uç durum — zaten artan, maliyet yine aynı

<iframe class="dsanim" src="anim/heap-sort.html?yer=slayt&lang=tr&example=already-sorted" title="Öbek sıralaması: zaten sıralı"></iframe>

<!-- Konuşma notu: build-heap'in tersine, öbek sıralaması adaptif değil — zaten sıralı bir girdi yine de tam O(n log n) maliyetli, yer değiştirme yer değiştirmesine. -->

---

# Kod — heap_sort()

```c
void heap_sort(int arr[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--)
        sift_down(arr, n, i);
    for (int heap_size = n; heap_size > 1; heap_size--) {
        int tmp = arr[0];
        arr[0] = arr[heap_size - 1];
        arr[heap_size - 1] = tmp;
        sift_down(arr, heap_size - 1, 0);
    }
}
```

<!-- Konuşma notu: Az önceki aynı build_heap döngüsü, sonra n-1 tur yer değiştirme-ve-sift, her biri küçülen bir bölgede. -->

---

# Karmaşıklık

- `build_heap`: O(n); döngü sonra n − 1 kez çalışır
- Her tur: bir O(1) yer değiştirme + bir **O(log n)** sift-down
- Toplam: **O(n log n)** — yerinde sıralar, ekstra dizi yok

<!-- Konuşma notu: Birleştirme sıralaması ya da hızlı sıralamanın ortalama durumuyla aynı asimptotik sınıf, ama ekstra bellek gerekmeden. -->

---

# Sık yapılan hatalar

- Öbek sıralamasının **kararlı** olduğunu sanmak — değil
- Küçülen bölge yerine tüm dizi üzerinde sifting yapmak — sıralanmış kuyruğu bozar

<!-- Konuşma notu: Kararlı bir sıralama gerekiyorsa, öbek sıralaması iyi karmaşıklığına rağmen yanlış araç. -->

---

<!-- _class: bolum -->

# 6. Öncelik Kuyruğu: Bir Öbeğin Hizmet Ettiği ADT

<!-- Konuşma notu: Bir kuyruk ilk gelene hizmet eder; bir öncelik kuyruğu, geliş sırası ne olursa olsun, en önemliye hizmet eder. -->

---

# ADT

Bir **öncelik kuyruğu**, her biri bir
**önceliğe** sahip öğeleri yönetir.
`insert`/`peek`/`extract`, az önce kurduğunuz
öbek işlemlerine doğrudan karşılık gelir.

<!-- Konuşma notu: Burada gerçekten yeni bir şey yok — bölüm 5'teki öbek, bir öncelik kuyruğunu gerçekleştirmenin en yaygın yolu. -->

---

# Öncelik kuyruğu ADT'si

| İşlem | Ne yapar | Karmaşıklık |
| --- | --- | --- |
| `insert(x)` | `x`i önceliğiyle ekler | O(log n) |
| `peek()` | En üstteki öğeyi döndürür, tutar | O(1) |
| `extract()` | En üstteki öğeyi siler, döndürür | O(log n) |
| `update_key(id, p)` | Bir öğenin önceliğini değiştirir | O(n) naif |

<!-- Konuşma notu: update_key gerçekten yeni tek işlem, ve her öğenin kalıcı bir id'ye ihtiyaç duymasının tek sebebi. -->

---

# update_key — yeni olan tek parça

- Öncelik değişir → öğe taşınması gerekebilir
- Şimdi daha iyi: **decrease-key** — **yukarı** sift
- Şimdi daha kötü: **increase-key** — **aşağı** sift
- Gerçek kullanım: Dijkstra'nın algoritması, İS zamanlayıcıları

<!-- Konuşma notu: Her öğe kalıcı bir id ister, dizide nereye taşınırsa taşınsın değişmeyen — yoksa update_key onu bir daha bulamaz. -->

---

# Öncelik kuyruğu işlemleri, adım adım

<iframe class="dsanim" src="anim/priority-queue-ops.html?yer=slayt&lang=tr" title="Öncelik kuyruğu işlemleri"></iframe>

<!-- Konuşma notu: Normal örnek: min-öncelik, 10 insert, bir peek, 2 extract, bir update-key — bölüm 5'in heap-insert'iyle aynı 15,7,22,3,18,... değerleri. -->

---

# Uç durum — boşken extract/peek

<iframe class="dsanim" src="anim/priority-queue-ops.html?yer=slayt&lang=tr&example=underflow-first" title="Öncelik kuyruğu: boşken"></iframe>

<!-- Konuşma notu: Öbek işlemlerinin kendisi değil, çağıran taraf size > 0 kontrol eder — bu senaryo, o kontrolün taşmayı güvenle yakaladığını gösteriyor. -->

---

# Kod — Item, insert()

```c
typedef struct {
    int id;
    int key;
} Item;

void insert(int id, int key) {
    heap[size] = (Item){id, key};
    sift_up(size);
    size++;
}
```

<!-- Konuşma notu: Artık her öğe key'inin yanında kalıcı bir id taşıyor — öğenin dizideki slotu değişse de id hiç değişmiyor. -->

---

# Kod — update_key()

```c
void update_key(int id, int new_key) {
    int i = find_by_id(id);
    if (i == -1) { /* … print a message */ return; }
    heap[i].key = new_key;
    if (i > 0 && better(heap[i], heap[(i - 1) / 2]))
        sift_up(i);
    else
        sift_down(i);
}
```

<!-- Konuşma notu: find_by_id burada doğrusal bir tarama — gerçek bir sistem id'den indise bir hash tablosu ekler, bunu da O(log n) yapmak için. -->

---

# Karmaşıklık

- `insert`, `extract`: **O(log n)**, öbekten devralınan
- `peek`: **O(1)**
- `update_key`: id için doğrusal taramayla **O(n)**
- id→indis bir hash tablosu bunu O(log n)'e indirir

<!-- Konuşma notu: Bu ekstra muhasebe, klasik bir alan-zaman takası — binlerce öğe devrede olduğunda buna değer. -->

---

# Sık yapılan hatalar

- Bir öğenin **id**'sini (kalıcı) **dizi indisi**yle (değil) karıştırmak
- Kuyruğun boş olmadığını kontrol etmeden `peek`/`extract` çağırmak
- `update_key`den sonra yanlış yönde sift yapmak

<!-- Konuşma notu: Decrease-key yukarı sift ister; increase-key aşağı sift ister — yanlışını kullanmak öbeği sessizce bozar. -->

---

# Mini soru

Min-öncelik bir zamanlayıcı "teslime kalan
süre"yle anahtarlanıyor. Çalışan bir süreç,
çok daha acil bir istekle şimdi kesildi.
Decrease-key mi increase-key mi? Hangi sift?

<!-- Konuşma notu: Min-öncelik kuyruğunda "daha acil"in key'in sayısal değeri için ne anlama geldiğini düşünün. -->

---

# Cevap

**Decrease-key** — daha acil, daha **küçük**
bir key demek. Bu, köke doğru yüzen
**sift-up**ı tetikler; kök en küçüğü tutar.

<!-- Konuşma notu: Min-öncelik kuyruğunda küçük her zaman daha iyidir — bölüm 5'in min-öbeğiyle aynı kural. -->

---

<!-- _class: bolum -->

# 7. Öbek Varyasyonları: Bir Özelliği Başka Bir Özellikle Takas Etmek

<!-- Konuşma notu: Aşağıdaki her varyasyon, düz ikili öbeğin bir özelliğini gevşetiyor ya da değiştiriyor, farklı bir kazanç karşılığında. -->

---

# d-ary öbek

Aynı dizi tabanlı fikir, ama her düğümün
2 yerine en fazla **D** çocuğu var. Düğüm
*i*'nin *c*. çocuğu `D*i + 1 + c`de; ebeveyni
`(i-1)/D`de. D = 2, düz ikili öbeği verir.

<!-- Konuşma notu: Büyük bir D, insert'i ucuzlatır (daha az seviye, seviyede bir karşılaştırma) ama extract'i pahalılaştırır (seviyede D'ye kadar karşılaştırma). -->

---

# D-ary öbek çıkarma, adım adım

<iframe class="dsanim" src="anim/dary-heap-sift-down.html?yer=slayt&lang=tr" title="D-ary öbek çıkarma"></iframe>

<!-- Konuşma notu: Normal örnek: D=3, bir min-öbek, 12 değerden 3 çıkarma — her sift-down'ın aynı anda 3 çocukla karşılaştığını izleyin. -->

---

# Uç durum — D=3, sonuna kadar

<iframe class="dsanim" src="anim/dary-heap-sift-down.html?yer=slayt&lang=tr&example=drain" title="D-ary öbek: sonuna kadar"></iframe>

<!-- Konuşma notu: 10 değerin hepsi birer birer çıkarılıyor — yine tamamen sıralı çıkıyor, düz ikili öbeğin sonuna kadar durumu gibi. -->

---

# Kod — D çocuklu extract()

```c
int extract(void) {
    int best = heap[0];
    size--;
    heap[0] = heap[size];
    int i = 0;
    while (1) {
        int target = i, base = D * i + 1;
        /* ... base..base+D-1'de D çocuğu kontrol et ... */
        if (target == i) break;
        /* ... heap[i]/heap[target] değiştir ... */
    }
    return best;
}
```

<!-- Konuşma notu: base = D*i+1, ikili öbeğin 2*i+1'inin yerini alıyor — extract'in her diğer satırı tıpatıp aynı biçimde kalıyor. -->

---

# Karmaşıklık

- `extract`: **O(D · log<sub>D</sub> n)** — daha az seviye, seviyede daha çok
- `insert`: **O(log<sub>D</sub> n)** — her zaman tek bir ebeveynle karşılaştırır
- Büyük D: ucuz ekleme, potansiyel olarak maliyetli çıkarma

<!-- Konuşma notu: Ekleme ağırlıklı iş yüklerinde, ağ olayı zamanlayıcıları gibi, popüler — extract nispeten seyrek olduğunda. -->

---

# Sık yapılan hatalar

- İkili öbeğin `2*i+1`/`2*i+2` formüllerini değiştirmeden yeniden kullanmak
- Sadece daha kısa bir ağaç için büyük bir D seçmek, extract'in maliyetini gözden kaçırarak

<!-- Konuşma notu: 2*i+1 ve 2*i+2, D*i+1+c'nin yalnızca D=2 özel durumu — yanlış D koyarsanız yanlış dizi hücresine dokunulur. -->

---

# Binom öbeği

**Jean Vuillemin** tarafından 1978'de
tanıtıldı. Binom ağaçlarından bir **orman**;
*k*. dereceden ağacın 2<sup>k</sup> düğümü var.
*n* elemanlı bir öbeğin dereceleri, tam
olarak n'nin ikilik tabandaki **1 bitleri**.

<!-- Konuşma notu: 13 = 0b1101, dereceleri 0, 2 ve 3'e ayrışır — 1, 4 ve 8 büyüklüğünde ağaçlar, toplamda 13. -->

---

# Union: elde ile ikilik toplama

- Dereceleri düşükten yükseğe gezin, iki sayı toplar gibi
- Yalnızca biri bu derecede ağaç tutuyorsa → doğrudan geçer
- **İkisi** de tutuyorsa → **link**lenirler, bir derece yukarı "elde" olur
- Aynı anda en çok **üç** ağaç buluşabilir: A, B, ve gelen elde

<!-- Konuşma notu: Bu "üç ağaç aynı anda" durumu, animasyondaki zor senaryonun tam olarak sınadığı şey. -->

---

# Binom öbeği birleştirme, adım adım

<iframe class="dsanim" src="anim/binomial-heap-union.html?yer=slayt&lang=tr" title="Binom öbeği birleştirme"></iframe>

<!-- Konuşma notu: Normal örnek: min, A'nın 7 elemanı var (dereceler 0,1,2), B'nin 5 (dereceler 0,2) — eldelerin yukarı dalgalanmasını izleyin. -->

---

# Uç durum — tek büyük bir elde zinciri

<iframe class="dsanim" src="anim/binomial-heap-union.html?yer=slayt&lang=tr&example=full-cascade" title="Binom öbeği: uzun elde zinciri"></iframe>

<!-- Konuşma notu: A (derece 3) union B (derece 3): tek bir elde her derecede dalgalanıyor — ikilik tabanda 1000 + 1000 toplamak gibi. -->

---

# Kod — union_heaps()

```c
void union_heaps(Node *a[], Node *b[], Node *result[]) {
    Node *carry = NULL;
    for (int order = 0; order < MAX_ORDER; order++) {
        Node *group[3]; int g = 0;
        if (a[order]) group[g++] = a[order];
        if (b[order]) group[g++] = b[order];
        if (carry) group[g++] = carry;
        carry = NULL;
        /* ... g==0: none; g==1: pass through ... */
        /* ... g>=2: link() two trees, carry up ... */
    }
}
```

<!-- Konuşma notu: link(), daha kötü olan kökü daha iyi olanın yeni en soldaki çocuğu yapar — O(1), yalnızca birkaç işaretçi güncellemesi. -->

---

# Karmaşıklık

- `link`: **O(1)** — birkaç işaretçi ataması
- `union`: en çok O(log n) dereceyi ziyaret eder — **O(log n)**
- `insert`, tek bir 0. derece ağaçla `union` olarak tanımlanır — o da O(log n)

<!-- Konuşma notu: Düz bir ikili öbeğin insert'i de O(log n), ama tamamen farklı bir sebeple: sift-up, linkleme değil. -->

---

# Sık yapılan hatalar

- Bir derecede yalnızca **iki** ağacın buluştuğunu düşünmek, elde üçüncüyü unutarak
- `insert`i sıfırdan türetmek, sadece `union` çağırmak yerine

<!-- Konuşma notu: insert, ezberlenecek ayrı bir algoritma değil — tam olarak tek elemanlı bir ikinci öbekle union_heaps. -->

---

# Solcu öbek

**C. A. Crane** tarafından 1972'de tanıtıldı.
Genelde tam **olmayan** bir işaretçi ağacı,
tek bir işlem etrafında kurulu: **merge**.
`insert` ve `extract`, onun özel durumları.

<!-- Konuşma notu: insert, yeni bir düğümle merge; extract, kökün kendisi silindikten sonra iki çocuğunun merge'ü. -->

---

# Solcu özellik

- Her düğüm kendi **null path length**ini (npl) izler
- `NULL`ın npl'si −1; bir yaprağınki 0
- **Solcu:** sol çocuğun npl'si sağınkinden asla küçük değil
- Sonuç: **sağ omurga** her zaman O(log n) uzunlukta

<!-- Konuşma notu: Ağacın kendisi çok dengesiz olabilir — yalnızca sağ omurganın kısa olması garanti, ve merge yalnızca o omurgada yürür. -->

---

# Solcu öbekte birleştirme, adım adım

<iframe class="dsanim" src="anim/leftist-heap-merge.html?yer=slayt&lang=tr" title="Solcu öbekte birleştirme"></iframe>

<!-- Konuşma notu: Normal örnek: min, A'nın 5 elemanı, B'nin 6 — merge'ün her iki sağ omurgayı nasıl birleştirip sonra npl'leri düzelttiğini izleyin. -->

---

# Uç durum — boş bir öbekle birleştirme

<iframe class="dsanim" src="anim/leftist-heap-merge.html?yer=slayt&lang=tr&example=empty-a" title="Solcu öbek: A boş"></iframe>

<!-- Konuşma notu: A boş, 11 elemanlı B ile birleşiyor — merge'ün iki taban durumu (t1 == NULL, t2 == NULL) bunu hemen çözer. -->

---

# Kod — merge() (özyinelemeli)

```c
Node *merge(Node *t1, Node *t2) {
    if (t1 == NULL) return t2;
    if (t2 == NULL) return t1;
    if (!better(t1->key, t2->key)) {
        Node *tmp = t1; t1 = t2; t2 = tmp;
    }
    t1->right = merge(t1->right, t2);
    if (npl(t1->left) < npl(t1->right)) {
        /* ... t1->left ve t1->right yer değiştir ... */
    }
    t1->npl = npl(t1->right) + 1;
    return t1;
}
```

<!-- Konuşma notu: Daha iyi kök her zaman kazanır ve diğer ağacı kendi sağ tarafına yutar, sonra yer değiştirme solcu özelliği onarır. -->

---

# Karmaşıklık

- `merge`: **O(log n)**, her iki sağ omurgayla sınırlı
- `insert`, `extract`: ikisi de `merge` üzerinden tanımlı — aynı O(log n)
- Ağacın kalanı ne kadar dengesiz olursa olsun geçerli

<!-- Konuşma notu: Yalnızca sağ omurganın uzunluğu önemli, ve solcu özellik onun her zaman kısa olmasını garanti eder. -->

---

# Sık yapılan hatalar

- **npl**i (en yakın eksik çocuğa uzaklık) **yükseklik**le karıştırmak
- merge'den sonra çocuk yer değiştirmeyi atlamak — solcu özelliği sessizce bozar

<!-- Konuşma notu: O yer değiştirmeyi atlarsanız, tüm O(log n) kısa-sağ-omurga garantisi sessizce geçerliliğini kaybeder. -->

---

# Mini soru

İki büyük öbeği, tek tek eleman eklemekten
çok daha sık, birleştirmeniz gerekiyor.
Hangi varyasyon en uygun?

<!-- Konuşma notu: Hangi yapının iki bütün öbeği birleştirmek için hiç hızlı bir yolu olmadığını düşünün. -->

---

# Cevap

**Solcu öbek** (ya da **binom öbeği**). İkisi
de merge/union'ı yalnızca O(log n)'e mal
edecek şekilde kurulu — düz ya da d-ary
öbekte böyle bir yol yok.

<!-- Konuşma notu: Düz bir dizi öbeğin tek birleştirme yolu, bir öbeğin her elemanını tek tek diğerine eklemek. -->

---

<!-- _class: bolum -->

# 8. Huffman Kodlaması

<!-- Konuşma notu: Bu haftanın kurduğu her şeyin ödülü: yalnızca ağaçlardan bir öbek, optimal bir sıkıştırılmış kod üretiyor. -->

---

# Başlangıç sorusu

Düz ASCII her karaktere 8 bit harcar, `E`
de `Z` de aynı. Sık geçen karakterler **kısa**
kod alsaydı, nadirler **uzun** — Morse kodunun
zaten yaptığı gibi?

<!-- Konuşma notu: Sorun: karışık uzunluklu kodlar bir bit akışında belirsiz olabilir, çok özel bir özellik olmadan. -->

---

# Kısa bir tarihçe

- **1952** — David Huffman, MIT'de bir dönem ödevi
- Hoca Fano'nun kendi yöntemi iyiydi, ama optimal değildi
- Huffman'ın açgözlü ağaç birleştirmesi **kanıtlanabilir** optimal
- Bugün hâlâ ZIP, JPEG ve MP3'ün içinde

<!-- Konuşma notu: Hocası sınıfa bir seçim sundu: final sınavı, ya da kanıtlanabilir optimal bir önek kodu bulmak — Huffman birini buldu. -->

---

# Ağacı kurmak

Her sembolü sıklığıyla anahtarlanmış bir
**min-öbeğe** koyun. Tekrar tekrar: en
**küçük** iki kökü pop edin, bu ikisini
çocuk yapan yeni bir iç düğüm kurun, geri
push edin. Bire kalana kadar tekrarlayın.

<!-- Konuşma notu: Nadir semboller erken birleşir, altta kalır; sık semboller geç birleşir, üstte kalır — kısa kodları veren tam olarak bu. -->

---

# Huffman ağacını kurmak, adım adım

<iframe class="dsanim" src="anim/huffman-build.html?yer=slayt&lang=tr" title="Huffman ağacını kurmak"></iframe>

<!-- Konuşma notu: Normal örnek: İngilizce harf benzeri sıklıklarla 10 sembol — en küçük iki kökün tekrar tekrar birleşmesini izleyin. -->

---

# Uç durum — en küçük anlamlı örnek

<iframe class="dsanim" src="anim/huffman-build.html?yer=slayt&lang=tr&example=two-symbols" title="Huffman kurma: iki sembol"></iframe>

<!-- Konuşma notu: Yalnızca 2 sembol: bir birleşme, bir kök, bitti — "bir ağaç kur"un bile bir anlam taşıdığı en küçük girdi. -->

---

# Kod — birleştirme döngüsü

```c
int merge_id = 256;
while (heap_size > 1) {
    Node *a = heap_pop();
    Node *b = heap_pop();
    Node *parent = new_internal(a, b, merge_id++);
    heap_push(parent);
}
Node *root = heap_pop();
```

<!-- Konuşma notu: heap_pop/heap_push, tam olarak bölüm 5'in min-öbek extract/insert'i — sayı yerine Node işaretçilerini sıralıyor. -->

---

# Kodlamak ve kod açmak

Bir sembolün **kod**u, köke kadar yolu: sol
= `0`, sağ = `1`. **Kod açmak** kökten bit
bit yürür; bir yaprak bir karakter üretir ve
yeniden başlar. Bu, kod **önek-serbest**
olduğu için çalışır.

<!-- Konuşma notu: Her sembol tam olarak bir yaprak, ve bir yaprağın çocuğu yok — o yüzden hiçbir kod başka birinin öneki olamaz. -->

---

# Kodlama ve kod açma, adım adım

<iframe class="dsanim" src="anim/huffman-encode-decode.html?yer=slayt&lang=tr" title="Huffman kodlama ve kod açma"></iframe>

<!-- Konuşma notu: Normal örnek: "ABRACADABRA", 11 karakter — 88 düz-ASCII bit 23'e düşüyor, çünkü A tek başına 11 karakterin 5'i. -->

---

# Uç durum — çok çarpık: 9 A, 1 B

<iframe class="dsanim" src="anim/huffman-encode-decode.html?yer=slayt&lang=tr&example=skewed" title="Huffman: çarpık sıklıklar"></iframe>

<!-- Konuşma notu: Yalnızca 2 sembol kaldı, o yüzden karakter başına 1 bit mümkün olan en iyisi — 80 yerine 10 bit, sıklıklar ne kadar çarpık olursa olsun. -->

---

# Kod — assign_codes() (ağacı gezmek)

```c
static void assign_codes(Node *node, char *path,
                          int depth) {
    if (node->left == NULL && node->right == NULL) {
        path[depth] = '\0';
        strcpy(codes[(unsigned char) node->ch], path);
        return;
    }
    path[depth] = '0';
    assign_codes(node->left, path, depth + 1);
    path[depth] = '1';
    assign_codes(node->right, path, depth + 1);
}
```

<!-- Konuşma notu: Yalnızca yapraklar bir kod kaydeder; her iç düğüm yolu yalnızca bir 0 (sol) ya da 1 (sağ) ile uzatır. -->

---

# Kod — decode() (bit bit yürümek)

```c
static char *decode(const char *bits, Node *root,
                     char *out) {
    int n = 0;
    Node *node = root;
    for (int i = 0; bits[i] != '\0'; i++) {
        node = bits[i] == '0' ? node->left : node->right;
        if (node->left == NULL && node->right == NULL) {
            out[n++] = node->ch;
            node = root;
        }
    }
    out[n] = '\0';
    return out;
}
```

<!-- Konuşma notu: Bit başına bir ağaç adımı; bir yaprağa ulaşılan an, karakterini üretin ve yürüyüşü kökten yeniden başlatın. -->

---

# Karmaşıklık

- Kurma: n − 1 birleşme, her biri O(log n) — **O(n log n)**
- Kodlama: **O(L)** — karakter başına bir arama ve ekleme
- Kod açma: **O(B)** — kodlanmış bit başına bir ağaç adımı

<!-- Konuşma notu: L metnin karakter uzunluğu; B kodlanmış mesajın bit uzunluğu. -->

---

# Sık yapılan hatalar

- Belirleyici bir tie-breaker olmadan — eşit sıklıklar iki farklı, ikisi de optimal ağaç kurabilir
- Kod tablosunun ASCII gibi sabit olduğunu sanmak — **mesaj başına** kurulur
- Yalnızca `decode`i test etmek, tam `decode(encode(text)) == text` turunu değil

<!-- Konuşma notu: Kod açıcı her zaman ya ağacın kendisine ya da sıklık tablosuna, kodlanmış bitlerin yanında, ihtiyaç duyar. -->

---

# Mini soru

Bir Huffman ağacında, bir sembolün kodu
başka bir sembolün kodunun **öneki**
olabilir mi?

<!-- Konuşma notu: Bir yaprağın ağaçtaki konumunun neye izin verip neye izin vermediğini düşünün. -->

---

# Cevap

**Hayır.** Her sembol tam olarak bir
**yaprak**tır, ve bir yaprağın çocuğu yok —
o yüzden hiçbir kod daha uzun, farklı bir koda uzatılamaz.

<!-- Konuşma notu: Bu "önek-serbest" özellik, tam olarak tek geçişli, belirsizliksiz kod açmayı mümkün kılan şey. -->

---

# Özet — ağaçlar, biçimler, dolaşmalar, dizi

| Fikir | Anahtar gerçek |
| --- | --- |
| Ağaç | Bir kök, çevrim yok, n düğüme n−1 kenar |
| İkili ağaç biçimleri | Dolu, tam, mükemmel, dejenere, dengeli |
| Dolaşmalar | Pre/in/post (özyinelemeli), yinelemesiz, level order |
| Dizi gösterimi | `2i+1`, `2i+2`, `(i-1)/2` — hepsi O(1) |

<!-- Konuşma notu: Aynı ağacı ziyaret etmenin beş yolu, ve tam olan birini tek bir işaretçi olmadan saklamanın bir yolu. -->

---

# Özet — öbekler, öncelik kuyruğu, Huffman

| Fikir | Anahtar gerçek |
| --- | --- |
| İkili öbek | insert/extract O(log n); kurma O(n) |
| Öbek sıralaması | O(n log n), yerinde, **kararlı değil** |
| Öncelik kuyruğu | `update_key` kalıcı bir id ister |
| Varyasyonlar | d-ary (hızlı insert), binom/solcu (hızlı merge) |
| Huffman kodlaması | Ağaçlardan bir min-öbek; önek-serbest kodlar |

<!-- Konuşma notu: Bu beş satırın her biri, aynı iki hareketten kurulu: sift-up ve sift-down. -->

---

# Büyük resim

Tek bir yapı, **öbek**, iki hareketten —
sift-up, sift-down — kurulu, bir sıralama,
bir öncelik kuyruğu, üç varyasyon, ve
optimal bir sıkıştırma kodu üretiyor.

<!-- Konuşma notu: Bir öğrenci bugünden tek bir cümle hatırlayacaksa, hatırlamaya değer olan bu. -->

---

# Kendini sınama turu

Dört kısa soru. Cevap bir sonraki slaytta
gelmeden önce düşünün. Tam alıştırmalar ve
on soruluk bir sınav hafta notlarında.

<!-- Konuşma notu: Bunlar yazılı notların sonundaki kendini sınamayı yansıtıyor, burada daha kısa bir setle, slayt başına bir soru. -->

---

# 1. İkili bir ağacın yüksekliği 4 ise en çok kaç düğümü olabilir?

<!-- Konuşma notu: Sorun, bekleyin, sonra ilerleyin. -->

---

# 2<sup>5</sup> − 1 = 31 düğüm — o yükseklikte mükemmel bir ağaç.

<!-- Konuşma notu: Bölüm 2'deki aynı formül, yalnızca h = 4 ile. -->

---

# 2. Tam bir ağaç bir dizide saklıyken, 9. düğümün ebeveyn indisi nedir?

<!-- Konuşma notu: Bölüm 4'teki formülü uygulayın. -->

---

# `(9 - 1) / 2 = 4`, tam sayı bölmesiyle.

<!-- Konuşma notu: Aynı formül, her zaman, ağacın boyutu ne olursa olsun. -->

---

# 3. n elemandan bir öbek kurmak neden "mantıklı görünen" O(n log n) değil, O(n)?

<!-- Konuşma notu: Bölüm 5.5'teki yükseklik-ağırlıklı toplamı hatırlayın. -->

---

# Çoğu düğüm alttadır, sift-down'ın ucuz olduğu yerde; toplam O(n)'e yakınsar.

<!-- Konuşma notu: Üstteki az sayıda maliyetli sift, alttaki çok sayıda ucuz olanın altında eziliyor. -->

---

# 4. Bir öncelik kuyruğunda her öğe neden kalıcı, sabit bir id ister?

<!-- Konuşma notu: Neredeyse her işlemde neyin değiştiğini hatırlayın. -->

---

# Bir öğenin dizideki konumu neredeyse her işlemde değişir; yalnızca id sabit kalır.

<!-- Konuşma notu: update_key, "bu belirli öğe"yi, o an nerede oturduğuna bağlı olmadan bulacak bir yola ihtiyaç duyar. -->

---

<!-- _class: baslik -->

# Gelecek hafta

**Hafta 5 — Çizgeler ve Dolaşmalar**

"Çevrim yok, bir ebeveyn" kuralını bırakın,
bir ağaç bir **çizge** olur. Level order,
BFS'e genelleşir; bugün kurduğunuz öncelik
kuyruğu, Dijkstra'nın algoritmasının motoru olur.

<!-- Konuşma notu: update_key tam olarak bunun için kuruldu: "en yakın öğeyi tekrar tekrar çıkar, sonra belki başka bir öğenin önceliğini düşür." -->

---

# Kaynaklar (1/2)

- Ders izlencesi, Hafta 4: `docs/syllabus/syllabus.tr.md`
- Cormen, Leiserson, Rivest, Stein. *Introduction to
  Algorithms*, 4. baskı. MIT Press
- Sedgewick, Wayne. *Algorithms*, 4. baskı. Addison-Wesley
- Knuth. *The Art of Computer Programming, Cilt 1*, 3. baskı

<!-- Konuşma notu: Bunlar, haftanın yazılı notlarının sonundaki aynı kaynaklar. -->

---

# Kaynaklar (2/2)

- Huffman (1952) · Williams (1964) · Floyd (1964)
- Vuillemin (1978) — binom öbeği
- Cayley (1857) — ilk ağaç sayma makalesi
- williamfiset/Algorithms · Programiz DSA

<!-- Konuşma notu: Tarihsel kaynaklar — Huffman, Williams, Floyd, Vuillemin, Cayley — bugünün "kısa tarihçe" slaytlarının dayandığı yer. -->
