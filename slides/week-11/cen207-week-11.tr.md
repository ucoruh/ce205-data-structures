---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Hafta 11 — İleri Ağaçlar"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Hafta 11"
footer: "RTEÜ Bilgisayar Mühendisliği · 2026-2027 Güz"
---

<!-- _class: baslik -->
<!-- _paginate: false -->

# İleri Ağaçlar

**CEN207 Veri Yapıları — Hafta 11**

Dr. Öğr. Üyesi Uğur CORUH · 2026-2027 Güz

<!--
Konuşma notu: Bugün ağaçlara ilk kez bir SIRALAMA kuralı ekliyoruz, sonra haftanın geri kalanını o sıralı ağacın gizli bir bağlı listeye dönüşmesini önlemeye ayırıyoruz.
-->

---

# Bugünün planı (3 saat)

| Saat | Konu |
| --- | --- |
| 1 | BST: ekleme, arama, silme, denge neden önemli |
| 2 | AVL (4 döndürme), kırmızı-siyah, splay |
| 3 | 2-3 ağacı, segment ağacı, Fenwick ağacı, teknik seçme |

**Öğrenme çıktıları:** ÖÇ.1 (temel veri yapılarını açıklama) · ÖÇ.2 (karmaşıklığı analiz etme) · ÖÇ.7 (doğru yapıyı seçme)

<!-- Konuşma notu: On iki kısa animasyon bütün dersi taşır; her biri, fikri tanıtıldığı anda görünür. -->

---

# Bu haftanın konuları — nerede

| Konu | Nerede |
| --- | --- |
| BST ekleme/arama/silme, dejenere durum | Bölüm 1 |
| AVL, kırmızı-siyah, splay, 2-3 ağacı | Bölüm 2–5 |
| Segment ağacı, Fenwick ağacı | Bölüm 6–7 |
| Teknik seçme | Bölüm 8 |

<!-- Konuşma notu: Her terim ilk geçtiğinde tam tanımını alır; bu tablo yalnızca onu tekrar nerede bulacağınızı söyler. -->

---

# Kod örnekleri nasıl çalışır

- Her fikrin tam bir **C** ve **Java** programı var
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Kaynaklar: `code/week-11/c/` ve `code/week-11/java/`
- Her programın beklenen çıktısı hafta notlarında

<!-- Konuşma notu: Canlı çalıştırmak isterseniz şimdi bir terminal açın; bugünkü her kod parçası gösterildiği gibi derlenir ve çalışır. -->

---

# Hafta 4'ten köprü

- Hafta 4 size **ağaç kelime dağarcığını** verdi: kök, yaprak, derinlik, yükseklik, alt ağaç
- Hafta 4 size **dolaşmaları** verdi: inorder, preorder, postorder, level-order
- Hafta 4'ün öbeği sol-sağ hiç **sıralı** değildi, yalnızca ebeveyn-çocuk
- Bugün ilk kez bir sıralama kuralı ekliyoruz

<!-- Konuşma notu: "Ağaç nedir" hakkında yeni bir şeye gerek yok bugün — yalnızca içindeki anahtarların nasıl dizildiğine dair yeni bir kural. -->

---

# Tekrar — Hafta 4: yükseklik ve derinlik

- Bir düğümün **derinliği** = kökten ona kaç kenar (kök = 0)
- Bir ağacın **yüksekliği** = herhangi bir düğümün en büyük derinliği
- Boş ağaç: gelenek gereği yükseklik -1; tek düğüm: yükseklik 0
- Bugün: yükseklik, her maliyeti belirleyen tek sayı

<!-- Konuşma notu: Bugünkü her karmaşıklık iddiası "O(yükseklik)"tir — yani bugün gerçekten o tek sayıyı kontrol etmekle ilgili. -->

---

# Haftanın haritası — tek kural

- Bir **ikili arama ağacı**: sol alt ağaç küçük, sağ alt ağaç büyük
- Bu kural tek başına hızlı arama verir — AĞAÇ SIĞ KALIRSA
- Dört farklı strateji onu sığ tutar: AVL, kırmızı-siyah, splay, 2-3
- İki ağaç daha, tek-anahtar yerine **aralık** sorularını yanıtlar

<!-- Konuşma notu: Sınıfa sorun: yalnızca "sol küçük, sağ büyük" ile başka hiçbir şey olmadan ne ters gidebilir? Yanıt bölüm 1.4'te geliyor. -->

---

# Haftanın haritası — genel bakış

| Dengeli BST'ler | Aralık sorgusu ağaçları |
| --- | --- |
| AVL — katı denge çarpanı | Segment ağacı — bir kur, O(log n)'de sorgula |
| Kırmızı-siyah — daha gevşek, renk tabanlı | Fenwick ağacı — tek dizi, `i & -i` |
| Splay — denge yok, kullanıma uyum sağlar | — |
| 2-3 ağacı — yalnız kökte büyür | — |

<!-- Konuşma notu: Aşağıdaki her kutunun kendi slaytları var, çoğunda kısa bir animasyon ve tam bir C/Java programı. -->

---

# Tekrar — Hafta 4: dolaşmalar

- **Inorder**: sol, ziyaret, sağ — bir BST'de sıralı düzen
- **Preorder**: ziyaret, sol, sağ — bir ağacın biçimini kopyalar
- **Postorder**: sol, sağ, ziyaret — bir ağacı silmek için güvenli
- **Level-order**: açık bir kuyruk, genişlik öncelikli

<!-- Konuşma notu: Bugünkü her "Beklenen çıktı" bloğu bir INORDER listesi yazdırır — her adımda sıralı kaldığını izleyin. -->

---

# Kelime dağarcığı kontrolü

| Terim | Anlamı |
| --- | --- |
| Denge çarpanı (balance factor) | height(sol) − height(sağ) |
| Döndürme (rotation) | O(1) yerel gösterici düzenlemesi |
| Amortize maliyet | uzun bir işlem dizisi üzerinde ortalanmış |
| Tersinir işlem | çıkarmayla geri alınabilir (toplam, min değil) |

<!-- Konuşma notu: Bu dört terim bugün neredeyse her bölümde tekrar eder; biri kaybolursa buraya işaret edin. -->

---

<!-- _class: bolum -->

# 1. İkili Arama Ağacı

<!-- Konuşma notu: Bölüm 1, BST'yi sıfırdan kurar: ekleme, arama, silme, sonra her şeyin ters gittiği durum. -->

---

# Başlangıç sorusu

Hafta 1: sıralı dizi, ikili arama — hızlı, ama ekleme O(n) tutar.
Hafta 2: bağlı liste — ekleme O(1), ama arama O(n) ister.

İKİSİNİ DE O(n)'den daha iyi yapan bir yapı var mı?

<!-- Konuşma notu: Duraklamanın etkisini bırakın. Yanıt, ikili arama ağacı, tek bir sıralama kuralıdır. -->

---

# Kısa bir tarihçe

- BST fikirleri **1959–1962** arasında bağımsız olarak ortaya çıkar
- P. F. Windley, A. D. Booth & A. J. T. Colin, T. N. Hibbard
- **Hibbard, 1962** — genellikle silmeyi çözmesiyle anılır
- Silme, tam olarak bölüm 1.4'ün bugün ele aldığı şeydir

<!-- Konuşma notu: Ekleme ve arama "kolay" yarısıdır; silme, doğru yapmak için ayrı bir makale gerektiren yarısıdır. -->

---

# Sezgi — bir telefon rehberi, ama ağaç

- Orta sayfayı açın: adınız ondan önce mi sonra mı?
- Yarılamaya devam edin — bu, bir dizide ikili aramadır
- Bir BST, aynı yarılamayı yapının **biçimine** pişirir
- Her düğümde kural: sol küçük, sağ büyük

<!-- Konuşma notu: Telefon rehberi benzetmesi yalnızca kitap sıralıysa işe yarar — BST'nin kuralı bu "sıralı" özelliği her yerde, her zaman korur. -->

---

# BST soyut veri türü

| İşlem | Ne yapar | Karmaşıklık |
| --- | --- | --- |
| `insert(key)` | Anahtarı ekler; yinelenen yoksayılır | O(h) |
| `search(key)` | Var olup olmadığını bildirir | O(h) |
| `delete(key)` | Varsa anahtarı kaldırır | O(h) |
| `min` / `max` | En küçük / en büyük anahtar | O(h) |

<!-- Konuşma notu: h, ağacın ŞU ANKİ yüksekliğidir — bölüm 1.4 tamamen h küçük olmadığında ne olacağıyla ilgilidir. -->

---

# Bellekte — ekleme fikri

- Kökten aşağı yürü, her düğümde `key`'i karşılaştır
- Küçük → sola git; büyük → sağa git; eşit → yinelenen, dur
- Bir `NULL` çocuğa ulaş → yeni düğümün yeri orası
- Bağla; ağaçta başka hiçbir şey hareket etmez

<!-- Konuşma notu: Tam olarak bir arama gibi, tek fark yürüyüşün bir düğüm YARATARAK bitmesi. -->

---

# İkili arama ağacı: ekleme

<iframe class="dsanim" src="anim/bst-insert.html?yer=slayt&lang=tr" title="İkili arama ağacı: ekleme"></iframe>

<!-- Konuşma notu: Normal örnek: karışık sırada 10 anahtar. Yeni yaprağın tam olarak karşılaştırmaların götürdüğü yere bağlandığını izleyin. -->

---

# Kod — bst_insert()

```c
Node *bst_insert(Node *root, int key) {
    Node *cur = root, *parent = NULL;
    while (cur != NULL) {
        parent = cur;
        if (key == cur->key) return root;
        if (key < cur->key)  cur = cur->left;
        else                 cur = cur->right;
    }
    Node *n = malloc(sizeof(Node));
    n->key = key; n->left = NULL; n->right = NULL;
```

<!-- Konuşma notu: Aşağı yürüyüş aramayla birebir aynı; yalnızca NULL'da ne olduğu farklı. -->

---

# Kod — bst_insert(), bağlama

```c
    if (parent == NULL) return n;
    if (key < parent->key) parent->left = n;
    else                    parent->right = n;
    return root;
}
```

<!-- Konuşma notu: Tek bir karşılaştırma sol mu sağ mı olduğuna karar verir; "bağlama" adımının tamamı bu. -->

---

# Beklenen çıktı

```text
insert(50): inorder = 50  height = 0
insert(30): inorder = 30 50  height = 1
insert(70): inorder = 30 50 70  height = 1
insert(20): inorder = 20 30 50 70  height = 2
```

<!-- Konuşma notu: Inorder listesi her tek adımda hep sıralıdır — sıralama kuralının görünür hali budur. -->

---

# insert neden O(h)

- Ziyaret edilen seviye başına en fazla bir karşılaştırma
- Geçilen bir düğümü asla tekrar ziyaret etmez
- h küçük (dengeli) → hızlı; h büyük (zincir) → yavaş
- Bölüm 1.4, h'nin ne kadar büyüyebileceğini tam olarak gösterir

<!-- Konuşma notu: "Seviye başına bir karşılaştırma", karmaşıklık argümanının tamamıdır — hiçbir yerde gizli döngü yok. -->

---

# Sık hata

- `root = bst_insert(root, key);` yazmayı unutmak
- Yeniden atama olmadan, çağıranın `root`'u asla güncellenmez
- C/Java burada göstericileri/referansları **değer olarak** geçirir
- Fonksiyon (olası yeni) kökü **döndürmelidir**

<!-- Konuşma notu: Bu hata sessizdir — program çalışır, yalnızca ağacı hiç gerçekten büyütmez. -->

---

# Mini soru

Animasyonun "artan sıra" uç durumunda, her yeni anahtar
SAĞ çocuk olur. Neden hiç sol olmaz?

<!-- Konuşma notu: Yanıt bir sonraki slaytta — önce izleyiciye 20 saniye verin. -->

---

# Mini yanıt

- Sonraki her anahtar, zaten eklenmiş her şeyden büyüktür
- Bu yüzden yürüyüş sırasında her karşılaştırma "sağa git" der
- Ağaç tamamen sağa yaslanır — bir zincir
- Bu tam olarak bölüm 1.4'ün konusu, hemen ardından

<!-- Konuşma notu: Bu tek gözlem, "denge neden önemli" hikayesinin tohumudur. -->

---

# Başlangıç sorusu — arama

`insert` zaten anahtarları karşılaştırarak aşağı yürüyor.
`search` neredeyse aynı yürüyüş — en kötü durumda kaç düğüm?

<!-- Konuşma notu: Yanıt "en fazla h+1"dir — ama h GERÇEKTE nedir? Sabır — bölüm 1.4. -->

---

# Fikir — arama

- Eşit → bulundu; küçük → yalnızca sol alt ağaçta olabilir
- Sıralama kuralı bunu GARANTİ EDER, sağ alt ağaç olamaz
- Büyük → ayna görüntüsü
- Bir eşleşmeden önce ulaşılan `NULL` → yok

<!-- Konuşma notu: "Yalnızca sol alt ağaçta olabilir" bir garanti, bir tahmin değil — BST kuralının size verdiği budur. -->

---

# İkili arama ağacı: arama

<iframe class="dsanim" src="anim/bst-search.html?yer=slayt&lang=tr" title="İkili arama ağacı: arama"></iframe>

<!-- Konuşma notu: Prob sayacını izleyin — aşağı her adım tam olarak bir karşılaştırma tutar, asla daha fazla değil. -->

---

# Kod — bst_search()

```c
int bst_search(Node *root, int key) {
    Node *cur = root;
    probes = 0;
    while (cur != NULL) {
        probes++;
        if (key == cur->key) return 1;
        if (key < cur->key) cur = cur->left;
        else                cur = cur->right;
    }
    return 0;
}
```

<!-- Konuşma notu: insert'in yürüyüşüyle aynı biçim, sondaki "düğüm yarat" adımı eksik. -->

---

# Beklenen çıktı

```text
search(65): found, 4 probes
search(20): found, 3 probes
search(55): not found, 3 probes
search(100): not found, 4 probes
```

<!-- Konuşma notu: "Bulunamadı" da gerçek sayıda prob tutar — bedava değildir, yalnızca bir eşleşme yerine bir NULL'da durur. -->

---

# search neden O(h)

- insert ile aynı seviye-başına-bir-karşılaştırma argümanı
- En iyi durum O(1): kökün kendisi
- En kötü durum: ağaç ne kadar derinse
- Yine: her şey h'ye bağlı

<!-- Konuşma notu: Bölüm 1.4 kaçınılmaz kılana kadar "her şey h'ye bağlı" demeye devam edeceğiz. -->

---

# Sık hata

- "Bulunamadı"yı bir hata koşulu olarak ele almak
- Bu normal, beklenen bir sonuçtur, çökme değil
- `while (cur != NULL)` koruyucusu bunu temiz ele alır
- Bir eşleşmeden sonra karşılaştırmaya devam etmek de israf

<!-- Konuşma notu: "Başarısız" olan bir arama işini doğru yapıyordur — anahtar gerçekten orada değildi. -->

---

# Mini soru

10 düğümlü artan-eklemeli bir zincirde search(10) 10 prob
tutar. search(1) yalnız 1 tutar. Neden bu kadar fark?

<!-- Konuşma notu: Yanıt bir sonraki slaytta. -->

---

# Mini yanıt

- O ağaç saf bir zincirdir: 1 kökte, 10 en derin yaprakta
- Kökün kendi anahtarı: tek karşılaştırma
- En derin yaprak: ona kadar her seviye için bir karşılaştırma
- En kötü durumda yükseklik + 1 karşılaştırma

<!-- Konuşma notu: Bu, ekleme mini-yanıtındaki AYNI zincir — aynı neden, aynı sonuç. -->

---

# Başlangıç sorusu — silme

Bir **yaprağı** silmek kolaydır: ayırın.
**İki çocuklu** bir düğümü silmek öyle değil. Neden?

<!-- Konuşma notu: Sadece kaldıramazsınız — sırayı korurken bir şeyin yerini alması gerekir. -->

---

# Fikir — üç durum

| Durum | Düzeltme |
| --- | --- |
| Yaprak | Ayırın |
| Tek çocuk | Ebeveyn doğrudan çocuğa bağlanır |
| İki çocuk | Ardılın anahtarını kopyalayın, sonra ONU silin |

<!-- Konuşma notu: Ardıl = sağ alt ağaçtaki en küçük anahtar — sağ çocuktan mümkün olduğunca sola yürüyün. -->

---

# İkili arama ağacı: silme

<iframe class="dsanim" src="anim/bst-delete.html?yer=slayt&lang=tr" title="İkili arama ağacı: silme"></iframe>

<!-- Konuşma notu: Normal örnek, dört silmesi boyunca kasıtlı olarak üç duruma da değiniyor — her birini izleyin. -->

---

# Kod — bst_delete(), düğümü bulma

```c
Node *bst_delete(Node *root, int key) {
    Node *cur = root, *parent = NULL;
    while (cur != NULL && key != cur->key) {
        parent = cur;
        cur = (key < cur->key) ? cur->left : cur->right;
    }
    if (cur == NULL) return root;
```

<!-- Konuşma notu: Bulunamadı gerçek bir no-op'tur — ağaç tamamen değişmeden döner. -->

---

# Kod — bst_delete(), iki çocuk

```c
    if (cur->left != NULL && cur->right != NULL) {
        Node *succ = cur->right, *succParent = cur;
        while (succ->left != NULL) {
            succParent = succ; succ = succ->left;
        }
        cur->key = succ->key;
        parent = succParent; cur = succ;
    }
```

<!-- Konuşma notu: Bu bloktan sonra cur ARDILI gösterir — ki artık en fazla bir çocuğu vardır, durum 1 ya da 2'ye indirger. -->

---

# Beklenen çıktı

```text
delete(35): inorder = 20 30 40 50 60 65 70 80 90
delete(70): inorder = 20 30 40 50 60 65 80 90
delete(50): inorder = 20 30 40 60 65 80 90
delete(20): inorder = 30 40 60 65 80 90
```

<!-- Konuşma notu: Inorder listesi her tek silmeden sonra sıralı kalır — korunan değişmez budur. -->

---

# delete neden O(h)

- Düğümü bulmak: O(h)
- Bir ardıl bulmak: en fazla bir O(h) daha
- Arama yolundaki düğümleri asla yeniden ziyaret etmez
- insert ve search ile aynı en kötü durum

<!-- Konuşma notu: Art arda iki O(h) yürüyüş yine O(h)'dir, O(h kare) değil — hiç çakışmazlar. -->

---

# Sık hata

- Ardılın anahtarını kopyalayıp ONUN düğümünü silmeyi unutmak
- Anahtar artık ağaçta iki kez var
- Ardıl ile öncel: ikisi de çalışır, ama tutarlı kalın
- C'de `free()` unutmak — gerçek bir bellek sızıntısı

<!-- Konuşma notu: AddressSanitizer (--sanitize geçişimiz) tam olarak bu sızıntıyı yakalar — bu hafta bunu kurarken benzer hatalar bulup düzelttik. -->

---

# Mini soru

Bir BST silmenin ardılı neden EN FAZLA bir çocuğa
sahip olmayı garantiler?

<!-- Konuşma notu: Yanıt bir sonraki slaytta. -->

---

# Mini yanıt

- Ardıl = sağ alt ağacın en soldaki düğümü
- En solda olmak, tanım gereği sol çocuğu olmaması demek
- Bir sağ çocuğu olabilir ya da olmayabilir
- Asla ikisi birden — bu yüzden hep durum 1 ya da 2

<!-- Konuşma notu: Bu, iki-çocuk durumunun neden hep daha basit iki duruma güvenle indirgendiğidir. -->

---

# Başlangıç sorusu — dejenere

Şimdiye kadarki her bölüm maliyeti O(h) olarak belirtti.
n anahtar rastgele bir sırayla, h SOMUT OLARAK nedir?

<!-- Konuşma notu: Bu soruyu bilerek erteliyorduk — artık yüzleşme zamanı. -->

---

# Fikir — küme değil, sıra

- Her teknik DEĞERLERİ karşılaştırır, ağacın BİÇİMİNE hiç bakmaz
- Sıralı girdi: her yeni anahtar şimdiye kadarki her şeyden büyük
- Her yeni anahtar sonuncudan bir seviye daha derine eklenir
- Ağaç bir zincire **dejenere olur**: yükseklik n − 1

<!-- Konuşma notu: "İkili arama ağacı" tek başına yükseklik hakkında hiçbir şey vaat etmez — yalnızca DEĞER sıralaması, biçim değil. -->

---

# Denge neden önemli

<iframe class="dsanim" src="anim/bst-degenerate.html?yer=slayt&lang=tr" title="Denge neden önemli"></iframe>

<!-- Konuşma notu: Normal: 10 artan anahtar, yükseklik 9. 10 düğüm için ideal yükseklik 3 ile karşılaştırın. -->

---

# Aynı anahtarlar, karıştırılmış

<iframe class="dsanim" src="anim/bst-degenerate.html?yer=slayt&example=edge-shuffled-same-keys&lang=tr" title="Denge neden önemli: karıştırılmış"></iframe>

<!-- Konuşma notu: AYNI 10 anahtar, farklı sıra: yükseklik 3, 9 değil. Aynı anahtar kümesi, çarpıcı derecede farklı biçim — sıra her şeydir. -->

---

# Beklenen çıktı

```text
insert(10): height = 9  (ideal for 10 nodes = 3)
final: n = 10, height = 9, ideal = 3
```

karıştırılmış uç durumuna karşı: `final: n = 10, height = 3, ideal = 3`

<!-- Konuşma notu: 9'a karşı 3 — neredeyse üç katı yükseklik, aynı 10 anahtar, yalnızca geliş sırası farklı. -->

---

# Bunun karmaşıklık için anlamı

- En kötü durum yüksekliği: n − 1 (sıralı ya da ters sıralı girdi)
- Bölüm 1.1–1.4'ün her işlemi O(n) olur
- Ortalama durum (rastgele sıra): O(log n) — ama "rastgele" garantili değil
- Sıralı girdi pratikte yaygın: içe aktarmalar, tekrar oynatılan günlükler

<!-- Konuşma notu: "BST" tek başına en fazla O(n) ve en iyi ihtimalle O(log n) garanti eder — arası hiçbir şey vaat edilmez. -->

---

# Sık hata

- "BST" olmasının otomatik olarak O(log n) demek olduğunu varsaymak
- Yalnızca rastgele test verisiyle kıyaslama yapmak
- Rastgele veri tam olarak bu başarısızlık biçimini gizler
- Yalnızca KENDİNİ DENGELEYEN bir BST en kötü durumda O(log n) garanti eder

<!-- Konuşma notu: Bu slayt bütün dersin menteşesidir — buradan sonraki her şey tam olarak bu boşluk yüzünden var. -->

---

# Mini soru

Zaten sıralı olduğunu bildiğiniz veriden bir BST kurmalısınız.
Ağaç türünü değiştirmeden en ucuz çözüm?

<!-- Konuşma notu: Yanıt bir sonraki slaytta. -->

---

# Mini yanıt

- Eklemeden önce anahtarları rastgele bir sıraya karıştırın
- Ya da: orta elemanı kök seçin, her iki yarıda özyineleyin
- Doğrudan O(n)'de mükemmel dengeli bir ağaç kurar, döndürme yok
- Bölüm 2–5, GENEL problemi otomatik olarak çözer

<!-- Konuşma notu: Sırada: girdinin önceden sıralı olduğunu bilmeye hiç gerek duymayan dört farklı strateji. -->

---

<!-- _class: bolum -->

# 2. AVL Ağaçları

<!-- Konuşma notu: Yayımlanan ilk kendini dengeleyen BST — katı bir kural, her yerde, her zaman uygulanır. -->

---

# Başlangıç sorusu

İşlemler hangi sırayla gelirse gelsin sığ kalan bir
BST'ye ihtiyacımız var. Böyle bir şey var mı?

<!-- Konuşma notu: Gerçek programlar zaman içinde ekler ve siler — her zaman önceden sıralayamayız ya da karıştıramayız. -->

---

# Kısa bir tarihçe

- **1962** — Georgy Adelson-Velsky & Evgenii Landis
- "AVL" = baş harfleri
- Yayımlanan ilk kendini dengeleyen ikili arama ağacı
- Fikir: her düğümde bir **denge çarpanı** izle

<!-- Konuşma notu: bf = height(sol) - height(sağ). Her yerde, her zaman {-1, 0, +1} içinde tutulur. -->

---

# Dört döndürme durumu

| Durum | Biçim | Düzeltme |
| --- | --- | --- |
| LL | sol-ağır, sol çocuk sol-ağır | tek sağa döndürme |
| RR | sağ-ağır, sağ çocuk sağ-ağır | tek sola döndürme |
| LR | sol-ağır, sol çocuk sağ-ağır | sol çocuğu sola, sonra sağa |
| RL | sağ-ağır, sağ çocuk sol-ağır | sağ çocuğu sağa, sonra sola |

<!-- Konuşma notu: LR ve RL "çift döndürme"dir — art arda uygulanan iki tekli döndürme. -->

---

# AVL: dört dengeleme durumu

<iframe class="dsanim" src="anim/avl-rotations.html?yer=slayt&lang=tr" title="AVL ağacı: dört dengeleme durumu"></iframe>

<!-- Konuşma notu: Seçicide LL, RR, LR, RL'de ilerleyin — her biri ayrı bir preset, aynı şekilde kurulur. -->

---

# Döndürme gerekmiyor

<iframe class="dsanim" src="anim/avl-rotations.html?yer=slayt&example=none&lang=tr" title="AVL ağacı: döndürme gerekmiyor"></iframe>

<!-- Konuşma notu: Karşıt durum: denge çarpanını hiç ihlal etmeyen bir ekleme. Her ekleme döndürmez. -->

---

# Mini soru

Bir eklemeden sonra, bir AVL ağacı en fazla kaç
döndürmeye ihtiyaç duyabilir?

<!-- Konuşma notu: Yanıt bir sonraki slaytta. -->

---

# Mini yanıt

- En fazla BİR tekli döndürme, ya da BİR çift döndürme
- Düzeltme, alt ağacın eklemeden ÖNCEKİ yüksekliğini tam kurar
- Bu yüzden daha yukarıdaki hiçbir ata dengesiz olamaz
- Ekleme asla yukarı doğru yayılmak zorunda kalmaz

<!-- Konuşma notu: Bu kanıtlanmıştır, yalnızca gözlemlenmemiştir — AVL eklemenin neden ufak bir sabitle O(log n) kaldığının nedeni budur. -->

---

# AVL ekleme — fikir

- Sıradan özyinelemeli BST eklemesi
- Çağrı yığını geri sarılırken: `update_height`, sonra `rebalance`
- Kontrol, özyineleme geri sarılırken HER seviyede olur
- Bulunan ilk (ve tek) dengesiz düğüm hemen düzeltilir

<!-- Konuşma notu: Bölüm 1'den zaten bildiğiniz aynı eklemeye eklenen iki ekstra satır. -->

---

# AVL ağacı: ekleme

<iframe class="dsanim" src="anim/avl-insert.html?yer=slayt&lang=tr" title="AVL ağacı: ekleme, denge çarpanlarıyla"></iframe>

<!-- Konuşma notu: Her düğümde bf'yi izleyin — hiç {-1, 0, +1}'in dışına çıkmaz, ekleme ortasında bile düzeltme hemen olur. -->

---

# Kod — rebalance()

```c
Node *rebalance(Node *n) {
    int bf = height(n->left) - height(n->right);
    if (bf > 1  && height(n->left->left)
             >= height(n->left->right))
        return rotate_right(n);
    if (bf > 1) {
        n->left = rotate_left(n->left);
        return rotate_right(n);
    }
```

<!-- Konuşma notu: Karar, az önce eklenen anahtara değil, ÇOCUĞUN denge çarpanına bakar — bu biçim silme için de çalışır. -->

---

# Beklenen çıktı — artan anahtarlar

```text
insert(10): height = 3
```

Bölüm 1.4'ün düz BST'si AYNI 10 artan anahtar için **yükseklik 9**'a ulaştı.

<!-- Konuşma notu: Düz bir BST'yi bozan aynı en-kötü-durum girdisi — AVL onu terlemeden ele alır. -->

---

# AVL neden O(log n)

- Yükseklik asla 1.44 · log2(n + 2)'yi geçmez
- Her işlem O(log n) — ORTALAMA değil, EN KÖTÜ durumda da
- insert: en fazla bir (çift) döndürme
- delete: O(log n)'ye kadar döndürme, ama her biri O(1)

<!-- Konuşma notu: Bu, bölüm 1.4'ün eksik olduğu garantidir — ortalama değil, en kötü durum. -->

---

# Sık hata

- Denge çarpanını kontrol etmeden önce `update_height`'ı unutmak
- `rebalance` sonra BAYAT bir yükseklik okur
- LL'yi mi LR'yi mi az önce eklenen anahtara bakarak seçmek (silme için bozulur)
- Denge-çarpanı tabanlı karar hem ekleme hem silme için çalışır

<!-- Konuşma notu: Tam olarak bu hata ailesi, AVL silmeyi eklemeden doğru yazmayı daha zor kılan şeydir. -->

---

# AVL silme — yeniden dengeleme katlanabilir

- Bölüm 1.4'ün ayırma mantığını (yaprak/tek/iki çocuk) birebir kullanır
- Fark: `rebalance` HER atada çalışır, yalnız ilkinde değil
- Bir silme bir alt ağacın yüksekliğini küçültebilir
- O küçülme köke kadar yayılmaya devam edebilir

<!-- Konuşma notu: Eklemenin aksine, silmenin düzeltmesi işlem-öncesi yüksekliği HER ZAMAN geri kurmaz — bu yüzden kontrol yukarı devam etmelidir. -->

---

# AVL ağacı: silme

<iframe class="dsanim" src="anim/avl-delete.html?yer=slayt&lang=tr" title="AVL ağacı: silme, katlanan yeniden dengeleme"></iframe>

<!-- Konuşma notu: Zor senaryo en az bir silmenin katlanacağı şekilde kurulmuştur — birden fazla döndürmenin ateşlendiğini izleyin. -->

---

# Beklenen çıktı

```text
delete(90): height = 3, inorder = 10 20 25 30 ...
delete(45): height = 3, inorder = 10 20 25 30 ...
```

Altı silme boyunca yükseklik 3'te kalır — hep yeniden dengelenir.

<!-- Konuşma notu: Ağaç, dizinin ortasında bile, boşalmaya doğru küçülürken bile AVL değişmezinden asla çıkmaz. -->

---

# AVL silme neden hâlâ O(log n)

- O(log n)'ye kadar döndürme — en kötü durumda ata-seviyesi başına bir
- Her tek döndürme yine O(1)
- O(log n) döndürme × her biri O(1) = toplamda O(log n)
- Ekleme ile aynı asimptotik sınır, yalnız sabiti daha büyük

<!-- Konuşma notu: "Daha fazla döndürme" daha kötü bir karmaşıklık sınıfı demek değildir — hâlâ logaritmik, yalnızca ekleme kadar sıkı bir sabit değil. -->

---

# Sık hata

- Silmenin de, ekleme gibi, yalnız bir döndürme gerektireceğini varsaymak
- "Zor" senaryo tam olarak bunu çürütmek için kurulmuştur
- C'de ayrılan düğümü `free()` etmeyi unutmak (sızıntı)
- "Bütün anahtarları boşalana kadar sil"i açıkça test etmemek

<!-- Konuşma notu: Tam olarak bu "boşalana kadar sil" uç durumunu birim testi olarak kurduk — kendi ağaçlarınız için de yapmaya değer. -->

---

# Mini soru

h yüksekliğinde bir AVL ağacının en az kaç düğümü vardır?

<!-- Konuşma notu: Yanıt bir sonraki slaytta. -->

---

# Mini yanıt

- N(h) = 1 + N(h−1) + N(h−2) — Fibonacci yinelemesi
- N(h), h'de ÜSTEL olarak büyür
- Bu yüzden h, n'de yalnızca LOGARİTMİK olarak büyür
- Kanıtın tamamı, tek satırda budur

<!-- Konuşma notu: Tavşan problemiyle aynı yineleme — yalnız nüfus artışı yerine ağaç biçimlerine uygulanmış. -->

---

<!-- _class: bolum -->

# 3. Kırmızı-Siyah Ağaçlar

<!-- Konuşma notu: Daha gevşek, renk tabanlı bir denge — pratikte daha az döndürme, standart kütüphanenin genelde seçtiği. -->

---

# Başlangıç sorusu

AVL'nin katı denge çarpanı neredeyse her eklemede
yeniden dengeleme isteyebilir. Daha gevşek bir kural var mı?

<!-- Konuşma notu: Buradaki "daha gevşek", bir düzeltme gerekmeden önce daha fazla dengesizliğe tolerans göstermek demektir. -->

---

# Kısa bir tarihçe

- **1972** — Rudolf Bayer: "simetrik ikili B-ağaçları"
- **1978** — Guibas & Sedgewick: "kırmızı-siyah" adı
- Modern ekleme algoritması 1978'e dayanır
- Tam yükseklik karşılaştırması yerine dört basit, YEREL kural

<!-- Konuşma notu: 2-3 ağacıyla (bölüm 5) aynı dönem — Bayer'in çalışması ikisini de bağlar. -->

---

# Dört kural

- Her düğüm **kırmızı** ya da **siyah**tır
- Kök her zaman **siyah**tır
- Kırmızı bir düğümün asla kırmızı çocuğu olmaz ("art arda iki kırmızı yok")
- Her kök-NULL yolu aynı **siyah-yüksekliğe** sahiptir

<!-- Konuşma notu: Yeni bir anahtar KIRMIZI eklenir — bu yalnız kural 3'ü bozabilir, kural 4'ü asla. -->

---

# Üç düzeltme (fixup) durumu

| Durum | Durum | Düzeltme |
| --- | --- | --- |
| 1 | Amca KIRMIZI | ebeveyn+amcayı siyaha, büyükanne/babayı kırmızıya, yukarı devam |
| 2 | Amca siyah, "üçgen" | ebeveyni döndür, durum 3'e indirger |
| 3 | Amca siyah, "doğrusal" | büyükanne/babayı döndür + yeniden renklendir, bitti |

<!-- Konuşma notu: "Amca" = ebeveynin kardeşi — çok yaygın bir karışıklık noktası, bunu yüksek sesle söyleyin. -->

---

# Kırmızı-siyah ağaç: ekleme

<iframe class="dsanim" src="anim/red-black-insert.html?yer=slayt&lang=tr" title="Kırmızı-siyah ağaç: ekleme"></iframe>

<!-- Konuşma notu: Normal örnek, 10 eklemesi boyunca üç durumun da ateşleneceği şekilde kurulmuştur — renkleri ve durum adlarını izleyin. -->

---

# Kod — fixup(), durum 1

```c
while (z->parent && z->parent->color == RED) {
    Node *p = z->parent, *g = p->parent;
    Node *u = (p == g->left) ? g->right
                              : g->left;
    if (u && u->color == RED) {
        p->color = BLACK; u->color = BLACK;
        g->color = RED; z = g; continue;
    }
```

<!-- Konuşma notu: Durum 1 hiç döndürmez — saf yeniden renklendirme, sonra ihlal iki seviye yukarıda yeniden ortaya çıkabilir. -->

---

# Beklenen çıktı

```text
insert(3): root = 3, bh = 1, inorder = 3B
insert(69): root = 3, bh = 1, inorder = 3B 69R
insert(31): root = 31, bh = 1, inorder = 3R 31B 69R
```

<!-- Konuşma notu: 3B = 3 anahtarı, Siyah. 69R = 69 anahtarı, Kırmızı. bh = kökün siyah-yüksekliği. -->

---

# Kırmızı-siyah neden O(log n)

- Yükseklik asla 2 · log2(n + 1)'i geçmez
- Kanıt: hiçbir yol en kısasının iki katından fazla olamaz
- (kırmızı düğümler asla bitişik olamaz)
- AVL'den biraz daha gevşek sınır, pratikte daha az döndürme

<!-- Konuşma notu: Bu yüzden C++ std::map, Java TreeMap, ve Linux zamanlayıcısının hepsi AVL değil kırmızı-siyah kullanır. -->

---

# Sık hata

- fixup döngüsü bittikten sonra kural 2'yi unutmak
- Durum 1, ihlali köke kadar taşıyabilir
- Sondaki koşulsuz `root->color = BLACK;` isteğe bağlı DEĞİL
- "Amca"yı yeni düğümün kendi kardeşiyle karıştırmak

<!-- Konuşma notu: Son yeniden renklendirmeyi atlamak ince bir hatadır — yalnızca belirli ekleme dizilerinde ortaya çıkar. -->

---

# Mini soru

KIRMIZI bir yaprak eklemek kural 4'ü (eşit siyah-yükseklik)
neden asla bozamaz, yalnız kural 3'ü bozabilir?

<!-- Konuşma notu: Yanıt bir sonraki slaytta. -->

---

# Mini yanıt

- Kırmızı bir yaprak herhangi bir yolun siyah-düğüm sayısına 0 katkıda bulunur
- Her kök-yaprak siyah-yüksekliği tam olarak ne idiyse öyle kalır
- Yalnız kural 3 ("iki kırmızı yok") bozulabilir, ve yalnız ebeveyn kırmızıysa
- Bu tam olarak fixup'ın onarmak için tasarlandığı durumdur

<!-- Konuşma notu: Eklemenin her zaman kırmızı başlamasının nedeni budur — bir kuralı bozmak için "daha güvenli" renktir. -->

---

<!-- _class: bolum -->

# 4. Splay Ağaçları

<!-- Konuşma notu: Hiç katı denge yok — ağaç, onu gerçekte nasıl kullandığınıza uyum sağlar. -->

---

# Başlangıç sorusu

AVL ve kırmızı-siyah, HER düğümde, HER işlem için defter
tutma maliyeti öder — nadiren dokunulan anahtarlar için bile. Farklı bir yol?

<!-- Konuşma notu: Ya ağaç her yerde sabit bir kuralı zorlamak yerine KULLANIM ÖRÜNTÜLERİNE uyum sağlasaydı? -->

---

# Kısa bir tarihçe

- **1985** — Daniel Sleator & Robert Tarjan
- "Kendini ayarlayan ikili arama ağaçları"
- Hiç denge bilgisi tutulmaz — düğüm başına sıfır ekstra bellek
- Bunun yerine: her erişim ağacı yeniden biçimlendirir

<!-- Konuşma notu: Bu, bugünkü diğer her ağaçtan gerçekten farklı bir felsefe — zorlama, uyum sağla. -->

---

# Fikir — köke taşı

| Hareket | Ne zaman | Ne olur |
| --- | --- | --- |
| zig | ebeveyn kök | tek bir döndürme |
| zig-zig | düğüm & ebeveyn ikisi de sol (ya da sağ) çocuk | önce ebeveyn, sonra düğüm döner |
| zig-zag | düğüm & ebeveyn karşıt taraflarda | düğüm iki kez döner |

<!-- Konuşma notu: zig-zig, büyükanne/baba-ebeveyni ebeveyn-düğümden ÖNCE döndürür — o sıra amortize garantiyi veren şeydir. -->

---

# Splay ağacı: erişim

<iframe class="dsanim" src="anim/splay-tree.html?yer=slayt&lang=tr" title="Splay ağacı: erişim anahtarı köke taşır"></iframe>

<!-- Konuşma notu: Normal örnek zig, zig-zig VE zig-zag'ın hepsinin olacağı şekilde kürate edilmiştir — her başlıkta durum adını izleyin. -->

---

# Kod — splay()

```c
void splay(Node *x) {
    while (x->parent != NULL) {
        Node *p = x->parent, *g = p->parent;
        if (g == NULL) { rotate_up(x); }
        else if ((x == p->left) == (p == g->left))
            { rotate_up(p); rotate_up(x); }
        else { rotate_up(x); rotate_up(x); }
    }
}
```

<!-- Konuşma notu: rotate_up(n), n'i KENDİ ebeveyni üzerinden döndürür — durum kaç kez, ve hangi sırayla olacağına karar verir. -->

---

# Beklenen çıktı

```text
access(50): root = 50, inorder = 50
access(20): root = 20, inorder = 10 20 30 40 45 50 60 70 80
```

Az önce erişilen anahtar HER ZAMAN yeni köktür.

<!-- Konuşma notu: Anahtar ne kadar derinden başlarsa başlasın, bir erişim onu en tepeye koyar. -->

---

# Splay neden amortize O(log n)

- Hiçbir tek erişim O(log n) garantili değil — O(n) olabilir
- m erişimlik HERHANGİ bir dizi toplamda O(m log n) tutar
- Erişim başına amortize edilmiş O(log n)
- "Sıcak" bir çalışma kümesine otomatik olarak uyum sağlar

<!-- Konuşma notu: "Amortize" = uzun bir dizi üzerinde ortalanmış, tek başına hiçbir işlem için garanti edilmemiş. -->

---

# Sık hata

- Zig-zig'i iki AYRI tekli döndürme olarak uygulamak ("saf splay")
- Geçerli bir ağaç işlemi, ama amortize garantiyi kaybeder
- `access`'in OLMAYAN bir anahtarda da bir şeyi splay ettiğini unutmak
- Burada: yeni eklenen düğümün kendisi

<!-- Konuşma notu: "Saf splay" hâlâ doğru bir BST üretir — yalnızca arkasında performans kanıtı yoktur. -->

---

# Mini soru

Tek bir anahtara çok sayıda erişimden sonra, her DİĞER
anahtar kabaca ne kadar derinde?

<!-- Konuşma notu: Yanıt bir sonraki slaytta. -->

---

# Mini yanıt

- O tek anahtar her seferinde kökte oturur
- Her DİĞER anahtarın derinliği neredeyse hiç etkilenmez
- Splay yalnızca erişilen YOL boyunca düğümleri yeniden düzenler
- "Küresel" bir denge garantisi yok — yalnızca yerel, erişim-başına

<!-- Konuşma notu: Bir splay ağacının "katı dengesi yok" demesinin tam anlamı budur. -->

---

<!-- _class: bolum -->

# 5. 2-3 Ağaçları

<!-- Konuşma notu: Asla anlık olarak bile eğri değil — çünkü yapraklarda değil, kökte, yukarı doğru büyür. -->

---

# Başlangıç sorusu

Şimdiye kadarki her ağaç dengesizliği OLDUKTAN SONRA
düzeltir. Ya dengesizlik yapısal olarak İMKANSIZ olsaydı?

<!-- Konuşma notu: Döndürmelerden tamamen farklı bir felsefe — onar değil, önle. -->

---

# Kısa bir tarihçe

- **1972** — Rudolf Bayer & Edward McCreight
- B-ağacına (Hafta 14, disk-destekli dosyalar) bir ara adım
- Düğüm 1 anahtar (2-düğümü) ya da 2 anahtar (3-düğümü) tutar
- Her yaprak her zaman TAM OLARAK aynı derinliktedir

<!-- Konuşma notu: Kırmızı-siyahın atası makalesiyle aynı Bayer — aynı dönemden iki ilişkili fikir. -->

---

# Fikir — taşma ve bölünme

- Yeni anahtar doğru yaprağa, sıralı olarak eklenir
- Yaprak zaten 2 anahtar tutuyorsa → şimdi geçici olarak 3: **taşma**
- İki 2-düğümüne bölünür; ORTA anahtar ebeveyne taşınır
- Ebeveyn aynı şekilde taşabilir — yukarı doğru katlanır

<!-- Konuşma notu: Katlanma köke ulaşıp orada bölünürse, yükseklik bir artar — HER YERDE aynı anda. -->

---

# 2-3 ağacı: ekleme

<iframe class="dsanim" src="anim/two-three-tree-insert.html?yer=slayt&lang=tr" title="2-3 ağacı: düğüm bölünmesiyle ekleme"></iframe>

<!-- Konuşma notu: Seviye-sıralı listenin köşeli parantez gruplarını izleyin — her yaprak-seviye grubu aynı satırda kalır. -->

---

# Kod — taşma döngüsü

```c
while (node->nkeys == 3) {
    split_node(node, &left, &right, &promoted);
    if (depth == 0) {
        /* kök bölünmesi: yükseklik + 1 */
        return new_root(promoted, left, right);
    }
    Node *parent = path[--depth];
    replace_with_split(parent, node,
                        promoted, left, right);
    node = parent;
}
```

<!-- Konuşma notu: Bu fonksiyonun hiçbir yerinde döndürme yok — yalnız bölme ve taşıma. -->

---

# Beklenen çıktı

```text
insert(20): height = 0, level-order = [10,20]
insert(30): height = 1, level-order = [20] [10] [30]
```

<!-- Konuşma notu: Bir düğüm 3 anahtar tutacağı ANDA hemen bölünür — yazdırılmış 3-anahtarlı bir düğümü gerçekte hiç görmezsiniz. -->

---

# 2-3 ağacı eklemesi neden O(log n)

- Her yaprak aynı derinlikte h → h = O(log n)
- Aşağı yürüyüş: O(h); bölünmeler en fazla O(h) yukarı katlanır, her biri O(1)
- Bugünkü diğer her ağacın aksine, hiç döndürme yok
- Hafta 14'ün B-ağacının doğrudan atası

<!-- Konuşma notu: "Sıfır döndürme", AVL, kırmızı-siyah, ve splay'den en büyük yapısal fark. -->

---

# Sık hata

- `child[]`'i yalnız 3 yuvaya boyutlandırmak (kararlı-durum maksimumu)
- Taşma ortasında, bir düğüm geçici olarak 4 çocuğa ihtiyaç duyar — gerçek tampon taşması
- Bir düğümü böldükten sonra eski kabuğu serbest bırakmamak
- Yanlış anahtarı taşımak (ORTA olmalı)

<!-- Konuşma notu: Bu haftanın programını kurarken tam olarak bu dizi-boyutlandırma hatasını bulduk — gerçek bir bellek-bozulması çökmesi. -->

---

# Mini soru

Bir 2-3 ağacının yüksekliği neden YALNIZ kökte büyür,
hiç ortada bir yerde değil?

<!-- Konuşma notu: Yanıt bir sonraki slaytta. -->

---

# Mini yanıt

- Bir bölünme yalnız KENDİ düğümünün taşmasına yanıt verir
- Taşınan anahtar KENDİ ebeveynine gider, asla bir kardeşe değil
- Katlanma yalnız bir yol boyunca dümdüz yukarı gidebilir
- "Ebeveyni" tükenebileceği tek yer köktür

<!-- Konuşma notu: Yükseklik büyümesinin neden her zaman küresel olduğu, hiç yerel olmadığı tam olarak budur — başka olacak yer yok. -->

---

<!-- _class: bolum -->

# 6. Segment Ağaçları

<!-- Konuşma notu: Gerçekten farklı bir soru: "x burada mı" değil, bütün bir ARALIK hakkında. -->

---

# Başlangıç sorusu

"l ile r arasındaki her değerin TOPLAMI nedir?"
Bir döngü O(n)'de yanıtlar. Birçok böyle sorgu — daha iyisi mümkün mü?

<!-- Konuşma notu: Bu çok yaygın gerçek bir sorudur: bir pencere üzerindeki toplamlar, bir tarih aralığı, bir fiyat aralığı. -->

---

# Fikir — her aralığı bir kez önceden hesapla

- Sabit boyutlu bir dizi üzerinde bir kez kurulur
- Düğüm i, [lo, hi] aralığından sorumlu; çocuklar 2i, 2i+1
- Yaprak bir değer tutar; iç düğüm iki çocuğunun toplamını tutar
- Sorgu aşağı yürür: dışarı → 0, içeri → önceden hesaplanmış, kısmi → ikisine de in

<!-- Konuşma notu: "Kısmi kesişme" toplamda yalnız O(log n) düğümde olur — karmaşıklık argümanının tamamı bu. -->

---

# Segment ağacı: kurulum ve sorgu

<iframe class="dsanim" src="anim/segment-tree.html?yer=slayt&lang=tr" title="Segment ağacı: kurulum ve aralık toplamı sorgusu"></iframe>

<!-- Konuşma notu: Hangi düğümlerin yeşile döndüğünü (tamamen içeride, doğrudan kullanılır) hangilerinin budandığını (soluk, kesişme yok) izleyin. -->

---

# Kod — query()

```c
long query(int i, int lo, int hi, int l, int r) {
    if (r < lo || hi < l)   return 0;
    if (l <= lo && hi <= r) return tree[i];
    int mid = (lo + hi) / 2;
    return query(2*i,   lo,      mid, l, r)
         + query(2*i+1, mid + 1, hi,  l, r);
}
```

<!-- Konuşma notu: Üç durum, üç satır mantık — dışarı, tamamen içeri, kısmi. -->

---

# Beklenen çıktı

```text
query(0,9) = 55
query(2,5) = 20
query(7,7) = 4
```

<!-- Konuşma notu: Tek noktalı bir sorgu yalnızca uzunluğu bir olan bir aralıktır — aynı fonksiyon özel bir durum olmadan ele alır. -->

---

# Segment ağacı sorgusu neden O(log n)

- build(): toplamda O(n) — her düğümü bir kez ziyaret eder
- Her seviye: en fazla İKİ "kısmen kesişen" düğüm
- O seviyedeki her diğer düğüm: hemen yanıtlanır ya da budanır
- Toplam iş yükseklikle orantılı: O(log n)

<!-- Konuşma notu: "Seviye başına en fazla iki" — [l, r]'nin her sınırında bir tane — üzerinde tekrar durmaya değer temel gerçek. -->

---

# Bölüm 1–5'ten yapısal bir fark

- Segment ağacı BİÇİMİ yalnız n'e bağlıdır, hiç veri değerine değil
- Her BST-ailesi ağacının biçimi DEĞER karşılaştırmalarına bağlıdır
- Bir segment ağacı bölüm 1.4'ün BST'si gibi asla dejenere olamaz
- Burada hiç ekleme-sırası problemi yok

<!-- Konuşma notu: Bunun üzerinde durmaya değer — bugünkü diğer her şeyden gerçekten farklı bir tür ağaç. -->

---

# Sık hata

- Diziyi 4n yerine 2n olarak boyutlandırmak
- "Tamamen içeride"yi "tamamen dışarıda" ile karıştırmak (ters koşullar)
- Tek bir nokta güncellemesi için BÜTÜN ağacı (O(n)) yeniden kurmak
- Özel bir O(log n) nokta-güncelleme fonksiyonu doğal düzeltmedir

<!-- Konuşma notu: 4n boyutlandırması, n'in zorunlu olarak bir ikinin kuvveti olmamasından gelir — ağaç mükemmel "tam" değildir. -->

---

# Mini soru

Bir sorgunun maliyeti neden O(log n)'dir, her seviyedeki
düğüm sayısı ÇARPI O(log n) değil?

<!-- Konuşma notu: Yanıt bir sonraki slaytta. -->

---

# Mini yanıt

- Her seviyede en fazla İKİ düğüm "kısmen kesişiyor"
- Her diğer düğüm: tamamen içeride (bitti) ya da tamamen dışarıda (budandı)
- Toplam iş genişlikle değil yükseklikle orantılı
- O(log n), O(log n) · O(n) değil

<!-- Konuşma notu: Bu, karmaşıklık slaytındaki AYNI "seviye başına en fazla iki" gerçeği — şimdi bir kendini sınama olarak. -->

---

<!-- _class: bolum -->

# 7. Fenwick Ağaçları

<!-- Konuşma notu: Aynı aralık-toplamı fikri, hiç açık ağaç olmadan — tek bir dizi, tek bir bitsel hile. -->

---

# Başlangıç sorusu

Bir segment ağacı en fazla 4n açık düğüme ihtiyaç duyar.
DÜZ BİR DİZİ önek toplamlarını aynı hızda yanıtlayabilir mi?

<!-- Konuşma notu: "Fenwick ağacı" ve "ikili indeksli ağaç (BIT)" aynı yapının iki yaygın adı. -->

---

# Kısa bir tarihçe

- **1994** — Peter Fenwick
- "Kümülatif frekans tabloları için yeni bir veri yapısı"
- Ağaç göstericisi yok, özyineleme gerekmez
- Tek bir dizi, tek bir aritmetik hile: `i & -i`

<!-- Konuşma notu: Bugünkü diğer her yapıdan çok daha yeni — gerçekten modern, asgari-yük bir fikir. -->

---

# Fikir — i & -i en düşük ayarlı biti yalıtır

- `bit[i]`, `i`'de biten `i & -i` büyüklüğünde bir aralığın toplamını tutar
- `update(i, delta)`: YUKARI yürü, `i += i & -i`
- `query(i)`: önek toplamı 1..i, AŞAĞI yürü, `i -= i & -i`
- İki yürüyüş de: O(log n) adım, ağaç yapısı gerekmez

<!-- Konuşma notu: "i & -i", ikiler tümleyeni negasyonuna dayanır — aynı hile C'de ve Java'da birebir aynı çalışır. -->

---

# Fenwick ağacı: güncelleme ve sorgu

<iframe class="dsanim" src="anim/fenwick-tree.html?yer=slayt&lang=tr" title="Fenwick ağacı: önek toplamları ve i ve -i"></iframe>

<!-- Konuşma notu: Vurgulanan hücrenin altındaki braceyi izleyin — o hücrenin tam olarak hangi aralıktan sorumlu olduğunu gösterir. -->

---

# i & -i zincir uzunluğu, tek başına

<iframe class="dsanim" src="anim/fenwick-tree.html?yer=slayt&example=edge-chain-length&lang=tr" title="Fenwick ağacı: zincir uzunluğu karşıtlığı"></iframe>

<!-- Konuşma notu: n=16'da update(1) 5 hücreye dokunur; query(16) yalnız 1 hücreye — tam tersi uçlar. -->

---

# Kod — update() ve query()

```c
void update(int i, int delta) {
    while (i <= n) { bit[i] += delta; i += i & (-i); }
}
int query(int i) {
    int sum = 0;
    while (i > 0) { sum += bit[i]; i -= i & (-i); }
    return sum;
}
```

<!-- Konuşma notu: Her iki işlem için toplam dört satır — yapının tamamı bu. -->

---

# Beklenen çıktı

```text
update(3, 5)
update(7, 2)
query(10) = 7
```

<!-- Konuşma notu: İki güncelleme, bir sorgu — koşan toplam her iki deltayı da doğru yansıtır, her biri O(log n). -->

---

# Fenwick neden O(log n), O(n) alan

- `i & -i`, sınıra olan mesafeyi en az iki katına (update) ya da yarıya (query) çıkarır
- Her iki yönde de en fazla floor(log2(n)) + 1 yineleme
- Alan: düz bir int dizisi — bir segment ağacından çarpıcı ölçüde az
- Dizinin boyutu değişmeyecekse pratikte tercih edilir

<!-- Konuşma notu: Daha az kod, daha az bellek, aynı asimptotik garanti — çekiciliği tamamen pratik, kuramsal değil. -->

---

# Sık hata

- 0-indisleme kullanmak — `i & -i`, indis 0'ın tüm sıfır bit olmasını ister
- Fenwick ağaçları HER ZAMAN 1-indislidir
- Dilin `-`'si yerine kendi yapımı bir "negasyon" yazmak
- Aralık-MİN/MAKS sorguları için Fenwick'e başvurmak (çalışmaz)

<!-- Konuşma notu: Aralık min/maks, toplamın olduğu gibi TERSİNİR değildir — bu onu yapısal olarak dışlar, yalnızca gelenek gereği değil. -->

---

# Mini soru

n=16 için, update(1) neden tam olarak 5 adım tutar
(i = 1, 2, 4, 8, 16)?

<!-- Konuşma notu: Yanıt bir sonraki slaytta. -->

---

# Mini yanıt

- `i += i & -i`: 1→2→4→8→16, sonra döngü durur (i, n'i geçer)
- Beş hücreye dokunulur, her biri indis 1'i içeren bir aralıktan sorumlu
- query(15) bunun yerine 4 adım tutar: 15'in ikili gösterimindeki (1111) her 1-biti için bir tane
- Güncelleme ve sorgu karşıt yönlerde yürür, farklı bit örüntüleri

<!-- Konuşma notu: Sorgu için "1-bit başına bir adım", tahtaya yazılmaya değer temiz, akılda kalıcı bir kural. -->

---

<!-- _class: bolum -->

# 8. Teknik Seçme

<!-- Konuşma notu: Yedi yapı, her birinin en iyi çözdüğü bir soru — hepsini yan yana koyalım. -->

---

# Karşılaştırma — dengeli BST'ler

| Yapı | En kötü durum yüksekliği | Yeniden dengeleme maliyeti |
| --- | --- | --- |
| Düz BST | O(n) | yok |
| AVL | O(log n), en sıkı | eklemede <=1 döndürme |
| Kırmızı-siyah | O(log n), daha gevşek | ortalamada daha az döndürme |
| Splay | Amortize O(log n) | erişim başına tam splay |

<!-- Konuşma notu: "En sıkı" ile "daha gevşek", SABİT çarpanla ilgilidir, büyük-O sınıfıyla değil — ikisi de logaritmiktir. -->

---

# Karşılaştırma — yapısal & aralık ağaçları

| Yapı | Yeniden dengeleme maliyeti | En iyi olduğu yer |
| --- | --- | --- |
| 2-3 ağacı | düğüm bölünmeleri, döndürme yok | Hafta 14'ün B-ağacına köprü |
| Segment ağacı | kurulumdan sonra yok | çok sayıda aralık toplamı/min/maks |
| Fenwick ağacı | yok | aralık toplamı + sık nokta güncellemesi |

<!-- Konuşma notu: 2-3, segment, ve Fenwick ağaçları dengeli-BST ailesinden gerçekten farklı problemleri çözer. -->

---

# Seçme — iş yüküne göre

- **Arama-ağırlıklı** → AVL (en sıkı sınır)
- **Karışık ekleme/silme/arama** → kırmızı-siyah (daha az döndürme)
- **Eğik "sıcak anahtar" erişimi** → splay (uyum sağlar, düşük bellek)
- **Aralık soruları** → segment ağacı ya da Fenwick ağacı

<!-- Konuşma notu: "En dengeli" önemli olan tek eksen değildir — iş yükü doğru yapıya karar verir. -->

---

# Mini soru

Bir meslektaşınız "her zaman kırmızı-siyah kullan, en
dengeli ve kütüphane-test edilmiş" diyor. Önce ne sorardınız?

<!-- Konuşma notu: Yanıt bir sonraki slaytta. -->

---

# Mini yanıt

- İş yükü arama-ağırlıklı mı, yoksa karışık ekleme/silme/arama mı?
- Erişim küçük bir sıcak-anahtar kümesine doğru eğik mi?
- Sorular tek anahtarlar değil ARALIKLAR hakkında mı?
- Bu daha sonra disk-destekli bir yapıya mı besleniyor (Hafta 14)?

<!-- Konuşma notu: Bugünkü her yapı, bazı belirli bir iş yükü için DOĞRU yanıttır — hiçbiri evrensel olarak en iyi değildir. -->

---

# Özet

- BST: `insert`/`search`/`delete` hepsi O(h) — ama h SIRAYA bağlı
- Sıralı girdi bir BST'yi bir zincire dejenere eder: O(n), bir listeden iyi değil
- AVL, kırmızı-siyah, splay, 2-3 ağacı: dört farklı düzeltme, dört ödünleşim
- Segment ağacı, Fenwick ağacı: ARALIK sorularına O(log n) yanıtlar

<!-- Konuşma notu: Yapı başına bir cümle — yalnız bu slaydı hatırlarsanız, bütün haftaya sahipsiniz. -->

---

# Alıştırmalar önizlemesi

- h yüksekliğindeki bir BST'nin en fazla 2^(h+1) − 1 düğümü olduğunu kanıtlayın
- Kırmızı-siyahın fixup durumlarını "zor" senaryoda elle izleyin
- Bir segment ağacını aralık-MİN'e çevirmek için nelerin değişeceğini taslak çizin
- 10 alıştırmanın tam listesi: bu haftanın notları

<!-- Konuşma notu: On alıştırmanın hepsi bu haftanın gerçek programları üzerine doğrudan kuruludur — gerçek kod açıkken izleyin. -->

---

# Kendini sınama testi önizlemesi

- AVL ekleme neden en fazla bir döndürme ister, ama silme neden katlanabilir?
- Bir Fenwick ağacı aralık-minimum sorgularını neden desteklemez?
- Bir segment ağacının biçimi veriden neden bağımsızdır?
- Yanıtlarıyla tam 10 soruluk test: bu haftanın notları

<!-- Konuşma notu: Notlara bakmadan önce hafızadan yanıtlamayı deneyin — bir kendini sınamanın bütün amacı bu. -->

---

# İleriye bakış

- **Hafta 12** — dizgeler: eşleştirme algoritmaları, ve **trie**
- Bir trie, dizgeleri sayısal karşılaştırmayla değil paylaşılan ÖNEKLE saklar
- **Hafta 13** — doğrudan ve sıralı dosya organizasyonu
- **Hafta 14** — **B-ağacı**: bu haftanın 2-3 ağacı, disk için genellenmiş

<!-- Konuşma notu: Bugün tanıştığınız 2-3 ağacı, Hafta 14'ün B-ağacının tam olarak m=3 özel durumudur. -->

---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Sorular?

**CEN207 Veri Yapıları — Hafta 11**

Dr. Öğr. Üyesi Uğur CORUH · 2026-2027 Güz

<!-- Konuşma notu: Söz hakkı verin — ve ne gelirse gelsin en iyi yanıtlayan animasyon presetine geri işaret edin. -->
