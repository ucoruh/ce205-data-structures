---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Hafta 6 — Arama ve Hash'leme"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Hafta 6"
footer: "RTEÜ Bilgisayar Mühendisliği · 2026-2027 Güz"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Arama ve Hash'leme

**CEN207 Veri Yapıları — Hafta 6**

Dr. Öğr. Üyesi Uğur CORUH · 2026-2027 Güz

<!--
Konuşma notu: Geçen hafta bir soruyu yanıtlamak için tüm bir grafı dolaştık. Bu hafta bu fikri tersine çeviriyoruz: hiçbir şeyi dolaşmadan, tam olarak nereye bakılacağını hesaplayabilir miyiz?
-->

---

# Bugünün planı (3 saat)

| Saat | Konu |
| --- | --- |
| 1 | Arama maliyetleri, sıçramalı **Anim 1–2** · enterpolasyon **Anim 3–4** |
| 2 | Üstel **Anim 5–6** · Fibonacci **Anim 7–8** · hash'leme fikri |
| 3 | Bölme **Anim 9–10** · zincirleme **Anim 11–12** · yoklama **Anim 13–18** · yeniden hash **Anim 19–20** |

**Öğrenme çıktıları:** LO.1 (temel veri yapılarını açıklama) · LO.2 (karmaşıklık analizi) · LO.7 (doğru yapıyı seçme)

<!-- Konuşma notu: Yirmi bir kısa animasyon tüm dersi taşır; her fikir, tanıtıldığı yerde bir normal ve bir uç/zor çalıştırma alır. -->

---

# Bu haftanın kavramları — nerede

| Kavram | Nerede |
| --- | --- |
| Sıçramalı, enterpolasyon, üstel, Fibonacci arama | Bölüm 2–5 |
| Hash'leme, bölme yöntemi, asal tablo boyutu | Bölüm 7 |
| Çakışmalar, zincirleme, yük faktörü | Bölüm 8 |
| Açık adresleme, yeniden hash'leme | Bölüm 9–10 |

<!-- Konuşma notu: Her terim ilk geçtiği yerde tam olarak tanımlanır; bu tablo yalnız onu tekrar nerede bulacağınızı söyler. -->

---

# Kod örnekleri nasıl çalışır

- Her fikrin eksiksiz bir **C** ve **Java** programı var
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Kaynaklar: `code/week-06/c/` ve `code/week-06/java/`
- Her programın beklenen çıktısı hafta notlarında var

<!-- Konuşma notu: Canlı çalıştırmak isterseniz şimdi bir terminal açın; bugünün her kod parçası tam gösterildiği gibi derlenir ve çalışır. -->

---

# Hatırlatma — doğrusal ve ikili arama (Hafta 1)

- **Doğrusal arama (linear search):** her hücreyi tek tek kontrol et — O(n)
- **İkili arama (binary search):** sıralı dizi, aralığı ikiye böl — O(log n)
- İkili arama önce dizinin **sıralı** olmasını ister
- Bugün: bu ikisinin arasında ve ötesinde stratejiler

<!-- Konuşma notu: Bugünkü her şey ya ikili aramayı özel bir durumda geçer, ya da "karşılaştırmayı" tamamen bırakıp "hesaplamaya" geçer. -->

---

# Hatırlatma — diziler ve bağlı listeler (Hafta 2)

- **Dizi (array):** bitişik bellek, indeksle O(1) erişim
- **Bağlı liste (linked list):** düğüm ve işaretçiler, başa O(1) ekleme
- Aşağıdaki arama yapıları doğrudan ikisinin üzerine kurulur
- Bir hash tablosunun kovası (bucket) genelde küçük bir bağlı listedir

<!-- Konuşma notu: Burada hiçbir şey yepyeni bir makine değil — Hafta 2'nin iki temel yapısı bugün boyunca yapı taşı olarak yeniden karşımıza çıkıyor. -->

---

# Haftanın haritası — genel bakış

| Daha hızlı arama (sıralı) | Hash'leme |
| --- | --- |
| Sıçramalı, enterpolasyon arama | Doğrudan adresleme, bölme yöntemi |
| Üstel, Fibonacci arama | Zincirleme, açık adresleme, yeniden hash'leme |

<!-- Konuşma notu: Bu haritadaki her kutu aşağıda kendi slaytlarını alıyor, çoğu kısa bir animasyon ve eksiksiz bir C/Java programıyla. -->

---

<!-- _class: bolum -->

# 1. Arama Problemi ve Maliyetler

<!-- Konuşma notu: Bölüm 1, bugünkü her algoritmanın farklı yanıtladığı tek soruyu kurar: bir anahtarı bulmadan — ya da yok olduğunu söylemeden — önce kaç karşılaştırma? -->

---

# Başlangıç sorusu

İkili arama zaten yalnızca O(log n) alıyor.
Daha da hızlı, ya da tamamen farklı bir şey
aramak için bir neden var mı?

<!-- Konuşma notu: İkisine de evet — özel veri için daha hızlı karşılaştırmalı arama var, hash'leme ise karşılaştırmaları neredeyse tamamen kaldırıyor. -->

---

# Burada "arama" ne demek

- Bir koleksiyon ve bir **hedef (target)** anahtar verildiğinde, konumunu bul
- Ya da doğru şekilde bildir: anahtar **yok**
- Maliyet olarak **karşılaştırma** (ya da **yoklama/probe**) sayarız
- Aynı doğrulukla daha az karşılaştırma = daha iyi bir arama

<!-- Konuşma notu: "Önce doğruluk, sonra hız" — bugünkü her algoritma her girdide yine de doğru yanıtı vermek zorunda. -->

---

# Maliyet, soru olarak yeniden

- Doğrusal arama: veri üzerinde varsayım yok, en kötü durum O(n)
- İkili arama: **sıralı** veri ister, en kötü durum O(log n)
- Sıralı veri O(log n)'den de hızlı aranabilir mi?
- Hiç **karşılaştırma yapmadan** aranabilir mi?

<!-- Konuşma notu: Bölüm 2–6 birinci soruyu yanıtlıyor; Bölüm 7'den itibaren ikinci soruyu, hash'leme ile. -->

---

# İkili arama ne zaman yetmez

- İkili arama ne olursa olsun her zaman **ortayı** kontrol eder
- Ama gerçek veride ikili aramanın yok saydığı **yapı** olabilir
- Değerler düzgün dağılmışsa: bir formül "ortadan" daha iyi tahmin edebilir
- Bellek dışı veri (disk, teyp): her erişim önemli

<!-- Konuşma notu: Bölüm 2–5'teki her algoritma, sıradan ikili aramanın göz ardı ettiği veriye dair bir ekstra gerçeği kullanıyor. -->

---

# Bugünün araç kutusu — beş strateji

| Strateji | Neyi kullanır |
| --- | --- |
| Sıçramalı arama | Ucuz blok sıçramaları çok karşılaştırmayı geçer |
| Enterpolasyon araması | Değerler kabaca düzgün dağılmış |
| Üstel arama | Hedef muhtemelen başa yakın |
| Fibonacci araması | Bölme/çarpma gerekmez |

<!-- Konuşma notu: Haftanın en büyük fikri olan hash'leme, Bölüm 7 başlamadan hemen önce kendi araç kutusu slaytını alıyor. -->

---

# Mini soru

İkili arama her zaman önce dizinin
**orta** elemanına bakar. Hangi durumda daha
akıllı bir ilk tahmin daha iyi olabilir?

<!-- Konuşma notu: Dizinin gerçek değerlerinin, sıralı olmanın ötesinde taşıyabileceği ekstra bilgiyi düşünün. -->

---

# Yanıt

**Değerler kabaca düzgün dağılmışsa.**
Orta yalnız "indeks-optimal"dir — değeri hesaba
katan bir tahmin (Bölüm 3) hedefe daha yakın düşebilir.

<!-- Konuşma notu: Bu tam olarak Bölüm 3'ün enterpolasyon aramasının tam bir algoritmaya dönüştürdüğü fikir. -->

---

<!-- _class: bolum -->

# 2. Sıçramalı Arama (Jump Search)

<!-- Konuşma notu: Bölüm 2, "ikili aramadan hızlı" ailesini açar: ikiye bölmek yerine, sabit bloklarla ileri sıçra, sonra bir bloğu doğrusal tara. -->

---

# Başlangıç sorusu

İkili arama her seferinde **ortaya** sıçrar.
Ya bunun yerine **sabit boyutlu bloklarla**
sıçramak daha basit, ama yine de hızlı olsaydı?

<!-- Konuşma notu: Sıçramalı arama, ikili aramanın özyinelemesini bir dizi blok sıçraması ve ardından kısa bir doğrusal taramayla değiştiriyor. -->

---

# Kısa tarihçe

- Blok tarzı arama, Knuth'un *Sorting and Searching*
  (1973) kitabında, ikili aramaya bir alternatif olarak geçer
- Kilit tasarım kararı: her blok ne kadar büyük olmalı?
- Yanıt, `block = floor(sqrt(n))`, iki maliyeti dengeler

<!-- Konuşma notu: Bu, derste kalkülüsün (bir toplamı minimize etmenin) bir algoritma tasarımını yönlendirdiği en temiz örneklerden biri. -->

---

# Benzetme — bir kitapta sayfa atlamak

- Kelimeyi bulmak için tek tek sayfa çevirmek: çok yavaş
- İkili arama: kalan sayfaları hep ikiye böl
- Sıçramalı arama: önce **tüm bölümleri** atla, sonra bir sayfa
- Kelimeyi geçtiğinde büyük sıçramaları durdur

<!-- Konuşma notu: Bir blok bir bölüm gibidir — son sayfasına bak, ve kelimenin içeride olduğunu anladığında ancak tam açarsın. -->

---

# Sıçramalı arama fikri

- Tıpkı ikili arama gibi **sıralı** bir dizi gerektirir
- `block = floor(sqrt(n))`: sıçrama mesafesi
- Bir sınır `>= target` olana kadar bir blok ileri sıçra
- Sonra o tek bloğu soldan sağa **doğrusal** tara

<!-- Konuşma notu: İki aşama, her biri kendi başına basit: doğru bloğu bulmak için kaba sıçramalar, sonra içinde kısa bir doğrusal tarama. -->

---

# Neden sqrt(n)?

- `n/block` sıçrama, ardından en çok `block` doğrusal adım
- Toplam maliyet, en kötü durumda: `n/block + block`
- Bu toplam `block = sqrt(n)` iken en küçük olur
- Sonuç: **O(sqrt(n))** — O(log n) ile O(n) arasında

<!-- Konuşma notu: "Az sayıda büyük sıçrama" ile "kısa son tarama"yı dengelemek, tam olarak bir toplamı minimize eden kalkülüs problemi — her n için bir kez çözülmüş. -->

---

# Sıçramalı arama, adım adım

<iframe class="dsanim" src="anim/jump-search.html?yer=slayt&lang=tr" title="Sıçramalı arama"></iframe>

<!-- Konuşma notu: Normal örnek: 16 sıralı değer, hedef ikinci blokta bulundu — blok sınırı kontrollerini, sonra kısa doğrusal taramayı izleyin. -->

---

# Uç durum — hedef aralıkta ama dizide yok

<iframe class="dsanim" src="anim/jump-search.html?yer=slayt&lang=tr&example=not-present" title="Sıçramalı arama: bulunamadı"></iframe>

<!-- Konuşma notu: Hedef iki gerçek değerin arasına düşüyor — doğru bloktaki doğrusal tarama, hedefi geçtiği anda erken durur. -->

---

# Kod — doğru bloğu bulmak

```c
int block = (int) sqrt((double) n);
if (block < 1) block = 1;
int prev = 0, step = block, comp = 0;
while (step < n) {
    comp++;
    if (arr[step - 1] >= target) break;
    prev = step;
    step += block;
}
```

<!-- Konuşma notu: `block` yalnız `n`'den, bir kez hesaplanır — asla `target`'a bağlı değildir, yalnız dizinin boyutuna bağlıdır. -->

---

# Kod — blok içinde doğrusal tarama

```c
if (step > n) step = n;
for (int i = prev; i < step; i++) {
    comp++;
    if (arr[i] == target) return i;
    if (arr[i] > target) break;
}
return -1;
```

<!-- Konuşma notu: İkili aramanın erken durmasını sağlayan aynı "sıralı dizi" gerçeği, bu son taramanın da `arr[i] > target`'ta erken durmasını sağlar. -->

---

# Karmaşıklık

- Blok bulma aşaması: en çok `n/block` sıçrama
- Doğrusal tarama aşaması: en çok `block` karşılaştırma
- `block = sqrt(n)` ile: toplam **O(sqrt(n))**
- İkili aramanın O(log n)'inden kötü, ama kod daha basit

<!-- Konuşma notu: Sıçramalı arama gerçek bir orta yol: doğrusal aramadan hızlı, ikili aramadan (özyineleme yok) daha basit. -->

---

# Sık yapılan hatalar

- Dizinin önce **sıralı** olması gerektiğini unutmak
- `sqrt(n)` yerine sabit bir blok boyutu kullanmak
- Durması gerekirken blok sınırını aşarak taramaya devam etmek

<!-- Konuşma notu: Yanlış bir blok boyutu yine de doğru yanıtı bulur — yalnız O(sqrt(n)) garantisini kaybeder. -->

---

# Mini soru

Bir dizide `n = 100` eleman var. Sıçramalı
arama hangi blok boyutunu kullanır, ve en
kötü durumda kaç karşılaştırma gerekir?

<!-- Konuşma notu: Birkaç slayt önceki formülü hatırlayın, sonra O(sqrt(n)) sınırını uygulayın. -->

---

# Yanıt

**`block = 10`** (`sqrt(100)`). En kötü durum:
yaklaşık `10` sıçrama artı `10` doğrusal adım —
**~20** karşılaştırma, doğrusal aramanın `100`'ünden çok az.

<!-- Konuşma notu: Bu O(sqrt(n)) sınırının somut hali: 20, teorik en kötü durum olan 2*sqrt(100)'e yakın. -->

---

<!-- _class: bolum -->

# 3. Enterpolasyon Araması (Interpolation Search)

<!-- Konuşma notu: Bölüm 3, "her zaman ortayı kontrol et" fikrini "hedefin nerede olması gerektiğini hesapla" ile değiştirir — sabit bir bölme noktası yerine bir formül. -->

---

# Başlangıç sorusu

Bir telefon rehberi sıralı **ve** kabaca
düzgün dağılmış. "Smith"i aramaya gerçekten
tam orta sayfadan mı başlardınız?

<!-- Konuşma notu: Kimse böyle yapmaz — doğrudan arkaya doğru açarsınız, çünkü "S"nin kabaca nerede olması gerektiğini zaten bilirsiniz. -->

---

# Kısa tarihçe

- Fikir 1957'de, sıralı dosyalarda arama üzerine
  erken çalışmalarda görülür (W. W. Peterson)
- Sonra **enterpolasyon araması** olarak biçimlenip incelenir
- **Düzgün** veride en iyi durum: O(log log n)'e yakın

<!-- Konuşma notu: O(log log n) gerçekten küçük bir sayı — bir milyar eleman için bile yalnız yaklaşık 5. -->

---

# Benzetme — bir telefon rehberi

- "Smith" aranıyor: ortaya değil, arkaya yakın bir yere sıçra
- "Baker" aranıyor: öne yakın bir yere sıçra
- Sıçrama tahmini **değeri** kullanır, yalnız konumu değil
- İkili arama yalnız konumu kullanır — değerleri yok sayar

<!-- Konuşma notu: Değeri yok saymak yerine kullanmak — bu tek fark, enterpolasyon aramasının tüm fikridir. -->

---

# Enterpolasyon araması fikri

- Tıpkı ikili arama gibi **sıralı** bir dizi gerektirir
- `target`'ın konumunu uçlar arasında **orantılı** tahmin et
- `pos = lo + (target-arr[lo])*(hi-lo) / (arr[hi]-arr[lo])`
- `lo`/`hi`'yi `pos`'a doğru daralt, tıpkı ikili arama gibi

<!-- Konuşma notu: Formülden sonraki her şey ikili aramayla aynı — yalnız bölme noktasının nasıl seçildiği değişti. -->

---

# Enterpolasyon araması, adım adım

<iframe class="dsanim" src="anim/interpolation-search.html?yer=slayt&lang=tr" title="Enterpolasyon araması"></iframe>

<!-- Konuşma notu: Normal örnek: 16 düzgün dağılmış değer — formülün tahmininin tek bir yoklamada hedefe çok yaklaştığını izleyin. -->

---

# Uç durum — sıfıra bölmeye karşı koruma

<iframe class="dsanim" src="anim/interpolation-search.html?yer=slayt&lang=tr&example=all-equal" title="Enterpolasyon araması: tümü eşit"></iframe>

<!-- Konuşma notu: Bu aralıktaki her değer aynı — arr[hi] arr[lo]'ya eşit, açık bir koruma olmadan formülün paydası sıfır olurdu. -->

---

# Kod — konum formülü

```c
while (lo <= hi && target >= arr[lo]
       && target <= arr[hi]) {
    if (arr[hi] == arr[lo]) {
        /* … koruma: sıfıra bölme … */
        return lo;
    }
    int pos = lo + (int) ((double)
        (target - arr[lo]) * (hi - lo)
        / (arr[hi] - arr[lo]));
```

<!-- Konuşma notu: Koruma isteğe bağlı değil — o olmadan, tümü eşit bir aralık programı sıfıra bölme hatasıyla çökertir. -->

---

# Kod — aralığı daraltmak

```c
if (arr[pos] == target) return pos;
if (arr[pos] < target) lo = pos + 1;
else hi = pos - 1;
```

<!-- Konuşma notu: İkili aramanın daraltma adımıyla şekilce aynı — yalnız `pos` `(lo + hi) / 2` yerine bir formülden geldi. -->

---

# Karmaşıklık

- Düzgün veri: ortalamada **O(log log n)**'e yakın
- Çarpık veri (tek büyük aykırı değer): **O(n)**'e doğru bozulur
- En kötü durum ikili aramanın O(log n)'inden asla iyi değil
- Formülün gücü tamamen verinin şekline bağlı

<!-- Konuşma notu: Enterpolasyon araması gerçek bir takas: doğru veride mükemmel, yanlış veride doğrusal aramadan iyi değil. -->

---

# Sık yapılan hatalar

- `arr[hi] == arr[lo]` bölme korumasını unutmak
- Enterpolasyon aramasını **çarpık** (düzgün olmayan) veride kullanmak
- O(log log n)'i bir en-kötü-durum garantisi sanmak — değil

<!-- Konuşma notu: Çarpık bir dizi, enterpolasyon aramasının yoklama sayısını O(n)'e doğru çıkarabilir — tam olarak ikinci hatayı gösterir. -->

---

# Mini soru

Bir dizinin değerleri aşırı **çarpık** —
çoğu küçük, sonda tek bir dev aykırı değer.
Enterpolasyon araması yine de iyi bir seçim mi?

<!-- Konuşma notu: Birkaç slayt önceki karmaşıklık slaytının ikinci maddesini hatırlayın. -->

---

# Yanıt

**Hayır, illa değil.** Çarpık veri, enterpolasyon
aramasının maliyetini **O(n)**'e itebilir — sade
ikili aramanın O(log n)'i daha güvenli seçim olur.

<!-- Konuşma notu: "Kabaca düzgün" enterpolasyon aramasının tanımında küçük bir ayrıntı değil — tüm hızlanmanın bağlı olduğu koşul. -->

---

<!-- _class: bolum -->

# 4. Üstel Arama (Exponential Search)

<!-- Konuşma notu: Bölüm 4, Bölüm 2–3'ten çok farklı bir soruyu yanıtlıyor: dizinin boyutunu bile bilmiyorsanız ne olur? -->

---

# Başlangıç sorusu

Devasa, **sıralı** bir veri akışında arama
yapıyorsunuz ve uzunluğunu bilmiyorsunuz.
İkili arama nereden başlayabilir ki?

<!-- Konuşma notu: İkili aramanın ilk adımı `hi = n - 1` ister — `n` bilinmiyorsa, bu adım hiç atılamaz. -->

---

# Kısa tarihçe

- **1976** — Jon Bentley ve Andrew Yao, "An almost
  optimal algorithm for unbounded searching"ı yayımlar
- **Sınırsız (unbounded)** ya da **galloping** arama da denir
- Bugün bazı birleştirme ve küme kesişim algoritmalarında kullanılır

<!-- Konuşma notu: "Galloping" (dörtnala), ikiye katlama aşaması için canlı bir isim — hız kazanan bir at gibi büyüyen küçük adımlar. -->

---

# Benzetme — sınırsız bir listede arama

- Bilinen bir son yok mu? Sonda büyüyen bir **tahmin** kullan
- İndeks 1'e, sonra 2'ye, 4'e, 8'e, 16'ya bak, …
- Açıkça çok ileri gidince ikiye katlamayı durdur
- Şimdi sıradan, **sınırlı** bir ikili arama işi bitirir

<!-- Konuşma notu: İkiye katlama aşamasının tek işi, ikili aramanın kullanacağı geçerli bir `hi` üretmek — başka bir şey değil. -->

---

# Üstel arama fikri

- Önce `arr[0]`'a bak — hedef tam orada olabilir
- `bound`'u büyüt: 1, 2, 4, 8, … `arr[bound] >= target` olana dek
- `[bound/2, bound]` içinde sıradan **ikili arama** çalıştır
- Şimdiye kadarki her strateji gibi **sıralı** bir dizi gerektirir

<!-- Konuşma notu: Dizinin pratikte bilinen bir üst sınırı olmalı — buradaki "sınırsız", "sonsuz" değil, "n'i önceden bilmemize gerek yok" anlamına gelir. -->

---

# Üstel arama, adım adım

<iframe class="dsanim" src="anim/exponential-search.html?yer=slayt&lang=tr" title="Üstel arama"></iframe>

<!-- Konuşma notu: Normal örnek: 16 sıralı değer, hedef ortalarda bulundu — sınırın ikiye katlanmasını, sonra ikili aramanın devralmasını izleyin. -->

---

# Uç durum — hedef son değerden de büyük

<iframe class="dsanim" src="anim/exponential-search.html?yer=slayt&lang=tr&example=beyond-end" title="Üstel arama: sonun ötesinde"></iframe>

<!-- Konuşma notu: Sınır dizinin gerçek sonunu aşacak şekilde ikiye katlanır, n-1'e sabitlenir, sonra ikili arama bulunamadı der. -->

---

# Kod — sınırı büyütmek

```c
int comp = 1;
if (arr[0] == target) return 0;
int bound = 1;
while (bound < n) {
    comp++;
    if (arr[bound] >= target) break;
    bound *= 2;
}
```

<!-- Konuşma notu: Bu blok yalnız ikili aramanın nereden başlayacağına karar verir — indeks 0'daki bir şans dışında hedefi kendisi hiç bulmaz. -->

---

# Kod — sınır içinde ikili arama

```c
int lo = bound / 2;
int hi = (bound < n) ? bound : n - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    comp++;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
```

<!-- Konuşma notu: Hafta 1'in ikili aramasıyla tıpatıp aynı — yalnız başlangıç `lo` ve `hi` değerleri yukarıdaki ikiye katlama aşamasından geliyor. -->

---

# Karmaşıklık

- Sınır bulma aşaması: **O(log index)**, `index` hedefin
  gerçekte bulunduğu yer
- İkili arama aşaması: **O(log(bound))**, yani o da O(log index)
- Toplam: **O(log index)** — hedef başa yakınken O(log n)'den
  çok daha iyi

<!-- Konuşma notu: Kazanç tam olarak bu: üstel arama dizinin boyutuna değil, yanıtın NEREDE olduğuna uyum sağlar. -->

---

# Sık yapılan hatalar

- Sona yakınken `bound`'u `n - 1`'e sabitlemeyi unutmak
- İkili aramayı `[bound/2, bound]` yerine `[0, bound]`'dan
  yeniden başlatmak — ikiye katlama aşamasının işini boşa harcar
- Bunun bilinen bir `n` gerektirdiğini varsaymak — açıkça gerektirmez

<!-- Konuşma notu: Sabitleme önemli çünkü aksi halde `arr[bound]`, dizinin gerçek sonunun ötesini okurdu. -->

---

# Mini soru

Bir dizide bir milyon eleman var, ama hedef
indeks `3`'te. Üstel arama yaklaşık kaç
karşılaştırma gerektirir?

<!-- Konuşma notu: Karmaşıklık slaytını hatırlayın: maliyet dizinin boyutuna değil, hedefin İNDEKSİNE bağlı. -->

---

# Yanıt

**Yalnız birkaç tane** — dizi bir milyon eleman
tutsa da, toplam yaklaşık `log2(3) + 1 ≈ 3`
karşılaştırma.

<!-- Konuşma notu: Yalnız ikili arama burada hâlâ yaklaşık 20 karşılaştırma gerektirirdi — üstel aramanın avantajı hedef başa yakınken en büyük. -->

---

<!-- _class: bolum -->

# 5. Fibonacci Araması (Fibonacci Search)

<!-- Konuşma notu: Bölüm 5, "sıralı veride daha hızlı arama" ailesini, hiç bölme ya da çarpma yapmayan bir stratejiyle kapatıyor. -->

---

# Başlangıç sorusu

Şimdiye kadarki her strateji bölüyor:
`n/block`, `(hi-lo)/2`, `bound/2`. Ya
programınızı çalıştıran donanım ucuza bölemiyorsa?

<!-- Konuşma notu: Bu, erken bilgisayarlar için gerçek, pratik bir kısıtlamaydı — bazılarında donanım bölme komutu hiç yoktu. -->

---

# Kısa tarihçe

- **1953** — Jack Kiefer'ın Fibonacci arama **tekniği**,
  önce dizi için değil, optimizasyon için geliştirildi
- Kısa süre sonra dizi aramasına uyarlandı
- Yalnız **toplama ve çıkarma** kullanır — `/` yok, `*` yok

<!-- Konuşma notu: Kiefer'ın asıl problemi, mümkün olduğunca az ölçümle bir fonksiyonun tepesini bulmaktı — aynı matematik burada yeniden kullanılıyor. -->

---

# Benzetme — cetvel olarak Fibonacci sayıları

- Fibonacci sayıları: 1, 1, 2, 3, 5, 8, 13, 21, …
- Her biri kendinden önceki ikisinin toplamı
- `n`'e `>= ` en küçük Fibonacci sayısını "cetvel" olarak seç
- Aralığı bölerek değil, bu cetveli kullanarak böl

<!-- Konuşma notu: Cetvel her seferinde tam olarak bir Fibonacci adımı kadar küçülür — bu, ikili aramadaki ikiye bölmenin yerini alan şey. -->

---

# Fibonacci araması fikri

- Tıpkı ikili arama gibi **sıralı** bir dizi gerektirir
- Bir Fibonacci adımı arayla `(fib, fib1, fib2)` üçlüsünü izle
- `offset + fib2`'de yokla; karşılaştır, sonra üçlüyü küçült
- `< target`: bir adım küçült; `> target`: iki adım küçült

<!-- Konuşma notu: Bir aşımda "iki adım küçültmek", tüm algoritmayı çarpma ya da bölmeden tamamen uzak tutan şey. -->

---

# Fibonacci araması, adım adım

<iframe class="dsanim" src="anim/fibonacci-search.html?yer=slayt&lang=tr" title="Fibonacci araması"></iframe>

<!-- Konuşma notu: Normal örnek: 16 sıralı değer, hedef ortalarda bulundu — her yoklamadan sonra (fib, fib1, fib2) üçlüsünün küçülmesini izleyin. -->

---

# Uç durum — hedef aralıkta ama dizide yok

<iframe class="dsanim" src="anim/fibonacci-search.html?yer=slayt&lang=tr&example=not-present" title="Fibonacci araması: bulunamadı"></iframe>

<!-- Konuşma notu: Ana döngü fib1 == 1 ile biter — tek bir eleman kalır, ayrıca kontrol edilir, sonra bulunamadı bildirilir. -->

---

# Kod — Fibonacci üçlüsü ve yoklama

```c
int fib2=0, fib1=1, fib=fib1+fib2;
while (fib < n) {
    fib2=fib1; fib1=fib; fib=fib1+fib2;
}
int offset = -1;
while (fib > 1) {
    int i = (offset+fib2 < n-1)
            ? offset+fib2 : n-1;
```

<!-- Konuşma notu: Yukarıdaki while döngüsü, hiçbir karşılaştırmadan önce yalnız bir kez çalışır — sadece `n` için başlangıç Fibonacci üçlüsünü bulur. -->

---

# Kod — üçlüyü küçültmek

```c
if (arr[i] < target) {
    fib=fib1; fib1=fib2; fib2=fib-fib1;
    offset = i;
} else if (arr[i] > target) {
    fib=fib2; fib1=fib1-fib2; fib2=fib-fib1;
} else {
    return i;
}
```

<!-- Konuşma notu: Buradaki her satır yalnız `+` ya da `-` — bölme ya da çarpmaya hiç gerek olmadığının somut kanıtı bu. -->

---

# Karmaşıklık

- İkili aramayla aynı mertebe: **O(log n)**
- Pratikte ortalamada biraz daha fazla karşılaştırma
- Gerçek avantajı: **bölme ya da çarpma yok**
- Hızlı bölmesi olmayan donanımda tarihsel olarak değerli

<!-- Konuşma notu: Modern donanımda bölme ucuz olduğu için, Fibonacci araması artık çoğunlukla tarihsel ve eğitimsel bir ilgi konusu. -->

---

# Sık yapılan hatalar

- Sonda kalan tek elemanın kontrolünü unutmak
- Fibonacci üçlüsünü ana döngünün **içinde** hesaplamak
- İkili aramanın O(log n)'ini geçtiğini varsaymak — geçmez

<!-- Konuşma notu: "Tek eleman kaldı" durumu, tam olarak bu bölümün bulunamadı uç durumunun göstermek için kurulduğu şey. -->

---

# Mini soru

Fibonacci araması neden 1950'ler ve
1960'larda, bugünün donanımından daha
çok önem taşımış olabilir?

<!-- Konuşma notu: Birkaç slayt önceki "kısa tarihçe" slaytının gerekçesini hatırlayın. -->

---

# Yanıt

**Bölme, erken donanımda pahalıydı ya da
mevcut değildi.** Fibonacci aramasının saf
toplama/çıkarması bu maliyeti tamamen ortadan kaldırıyordu.

<!-- Konuşma notu: Modern CPU'larda hızlı donanım bölmesi var, o yüzden bu belirli avantaj çoğunlukla kayboldu — algoritma zarif bir fikir olarak yaşıyor. -->

---

<!-- _class: bolum -->

# 6. Beş Arama Stratejisini Karşılaştırmak

<!-- Konuşma notu: Bölüm 6, hash'lemeden önce kısa bir mola — Bölüm 2–5'in az önce inşa ettiği her şeyi karşılaştıran tek bir tablo. -->

---

# Karşılaştırma — her biri ne ister

| Strateji | İster | En iyi durum |
| --- | --- | --- |
| Sıçramalı arama | Sıralı dizi | O(sqrt(n)) |
| Enterpolasyon araması | Sıralı, düzgün | O(log log n) |
| Üstel arama | Sıralı dizi | O(log index) |

<!-- Konuşma notu: Buradaki "ister", her stratejinin sade ikili aramayı geçmek için "sıralı" olmanın ötesinde dayandığı ekstra varsayım. -->

---

# Karşılaştırma — Fibonacci ve hatırlatma

| Strateji | İster | En iyi durum |
| --- | --- | --- |
| Fibonacci araması | Sıralı dizi | O(log n) |
| İkili arama (Hafta 1) | Sıralı dizi | O(log n) |
| Doğrusal arama (Hafta 1) | Hiçbir şey | O(n) |

<!-- Konuşma notu: Her iki tablodaki her satır tek bir gereksinimi paylaşır: veri önce sıralı olmalı — şimdi başlayacak hash'leme bu gereksinimi tamamen kaldırıyor. -->

---

# Hangisi ne zaman kullanılır

- Veri kabaca düzgün mü? **Enterpolasyon** araması
- Hedef genelde başa yakın mı? **Üstel** arama
- Basit kod, bölme yok mu? **Sıçramalı** ya da **Fibonacci**
- Özel bir yapı yok mu? Sade **ikili arama** yeterli

<!-- Konuşma notu: Bu stratejilerin hiçbiri asla "yanlış" seçim değil — her biri yalnız kendi varsayımı altında kazanan bir uzman. -->

---

# Mini soru

Sıralı bir günlük dosyası sürekli büyüyor,
uzunluğu `n` önceden hiç bilinmiyor. Bugünün
hangi stratejisi en uygun, neden?

<!-- Konuşma notu: `n`'i önceden bilmeyi özellikle gerektirmeyen stratejiyi hatırlayın. -->

---

# Yanıt

**Üstel arama.** Yalnız aşana kadar bir sınırı
büyütür — ikili aramadan farklı olarak `n`'in
önceden bilinmesine hiç gerek duymaz.

<!-- Konuşma notu: Bu tam olarak Bentley ve Yao'nun 1976 tarihli özgün makalesindeki "sınırsız arama" çerçevesi. -->

---

<!-- _class: bolum -->

# 7. Hash'leme: Doğrudan Adreslemeden Hash Fonksiyonlarına

<!-- Konuşma notu: Bölüm 7, haftanın ikinci yarısını açıyor: değerleri karşılaştırmak yerine, bir anahtarın nereye ait olduğunu doğrudan hesapla. -->

---

# Başlangıç sorusu

Şimdiye kadarki her arama değerleri tekrar
tekrar **karşılaştırıyor**. Bunun yerine bir
anahtarın konumunu tek adımda **hesaplayabilir** miyiz?

<!-- Konuşma notu: Evet — bu tek fikir, "karşılaştırma değil, hesapla", hash'lemenin tüm temeli. -->

---

# Kısa tarihçe

- **1953** — IBM'de Hans Peter Luhn, kayıtları
  doğrudan yerleştirmek için hesaplanmış bir fonksiyon önerir
- Bu iç yazı, hash'lemenin kökeni olarak geniş çapta kabul edilir
- Fikir: bir **anahtarı**, bir formülle **tablo indeksine** çevir

<!-- Konuşma notu: Luhn ayrıca adını taşıyan, hash'lemeyle ilgisiz kredi kartı sağlama toplamı algoritmasını da icat etti — aynı kişinin farklı, daha ünlü bir buluşu. -->

---

# Benzetme — doğrudan adresleme

- Anahtarlar küçük tamsayılar, `0..m-1` mi? Anahtarın
  kendisini dizi indeksi olarak kullan — O(1), hesaplama yok
- `table[key] = value` — doğrudan adresleme, hiç hash yok
- Sorun: gerçek anahtarlar `0..m-1`'e nadiren düzgün sığar
- Öğrenci numaraları, telefon numaraları: çok fazla olası değer

<!-- Konuşma notu: Doğrudan adresleme, anahtar uzayı tablodan çok daha büyük olduğunda hash'lemenin yaklaşmaya çalıştığı ideal durum. -->

---

# Hash'leme fikri

- Bir **hash fonksiyonu** `h(key)`, herhangi bir anahtarı `0..m-1`'e eşler
- `m` = tablo boyutu; `h` hızlı olmalı, idealde O(1)
- İki farklı anahtar aynı indekse düşerse: bir **çakışma (collision)**
- Bölüm 8–10, çakışmaları ele alan mekanizmayı kurar

<!-- Konuşma notu: Sıfır çakışmalı mükemmel bir hash fonksiyonu kuramda var, ama pratikte çakışmalar beklenir ve ele alınmalıdır. -->

---

# Bölme yöntemi

- En basit yaygın hash fonksiyonu: `h(k) = k mod m`
- Herhangi bir tamsayı anahtarı `[0, m-1]`'e eşler — her zaman, O(1)
- **m'nin seçimi**, anahtarların ne kadar iyi dağıldığını değiştirir
- Dikkatsiz bir `m`, birçok anahtarı bilerek çakıştırabilir

<!-- Konuşma notu: "mod" fonksiyonun tamamı — basitliği tam olarak öğretilecek ilk doğal hash fonksiyonu olmasının nedeni. -->

---

# Bölme yöntemi, adım adım

<iframe class="dsanim" src="anim/hash-function-division.html?yer=slayt&lang=tr" title="Bölme yöntemiyle hash fonksiyonu"></iframe>

<!-- Konuşma notu: Normal örnek: m = 11 (asal), 12 rastgele anahtar — çoğu anahtarın, yalnız ara sıra bir çakışmayla, dağıldığını izleyin. -->

---

# Uç durum — m 10'un kuvveti: felaket

<iframe class="dsanim" src="anim/hash-function-division.html?yer=slayt&lang=tr&example=power-of-10" title="Bölme yöntemi: m 10'un kuvveti"></iframe>

<!-- Konuşma notu: m = 10, ve her anahtar 10'un katı — k mod 10 her tek anahtar için 0: tam çakışma, olabilecek en kötü dağılım. -->

---

# Neden m asal olmalı?

- `m` ile **ortak çarpanı** olan anahtarlar kötü çakışır
- `m` 10'un kuvveti, anahtarlar 10'un katı: toplam çöküş
- **Asal** bir `m`, çoğu anahtar örüntüsüyle çarpan paylaşmaz
- Kural: `m`'yi asal seçin, 2'nin ya da 10'un kuvvetlerinden kaçının

<!-- Konuşma notu: Bu bir batıl inanç değil — doğrudan mod işleminin bir anahtarın kendi çarpanlarıyla nasıl etkileştiğinden geliyor. -->

---

# Kod — bölme hash fonksiyonu

```c
/* + m) % m, C'de negatif anahtarlara karşı korur */
int hash_division(int key, int m) {
    return ((key % m) + m) % m;
}
```

<!-- Konuşma notu: C'de, `key` negatifken `key % m` negatif olabilir — ekstra `+ m`, son `% m`'den önce bunu düzeltir. -->

---

# Karmaşıklık

- `h(k) = k mod m`: tek bir bölme — her zaman **O(1)**
- Hash'lemeyi çekici kılan tam olarak bu O(1) maliyeti
- Bir hash tablosunun gerçek maliyeti **çakışmalarda** yaşar
- Bölüm 8–10 tamamen bu maliyeti yönetmekle ilgili

<!-- Konuşma notu: Bir hash fonksiyonunun kendi maliyeti neredeyse bedava; bugün kalan her slayt iki anahtar çakıştıktan sonra ne olduğuyla ilgili. -->

---

# Sık yapılan hatalar

- Kolaylık olsun diye `m`'yi 2 ya da 10'un kuvveti seçmek
- C ya da Java gibi dillerde negatif-anahtar korumasını unutmak
- Çok fazla çakışma olsa bile O(1)'in her zaman geçerli olduğunu sanmak

<!-- Konuşma notu: Negatif-anahtar koruma slaytındaki `+ m` numarası, şaşırtıcı sayıda gerçek hatanın kaynağı olan küçük bir ayrıntı. -->

---

# Mini soru

`m = 8` ve bir veri kümesindeki her anahtar
**çift** sayı. Tablonun hücrelerinin ne kadarı
hiç kullanılabilir?

<!-- Konuşma notu: `key` her zaman çiftken `key mod 8`'in hangi kalanları üretebileceğini düşünün. -->

---

# Yanıt

**En çok yarısı.** Çift bir anahtar mod 8
yalnız çift bir indekse (0, 2, 4, 6) düşebilir —
tek indeksli hücrelere hiç ulaşılamaz.

<!-- Konuşma notu: Bu, 10'un kuvveti uç durumuyla aynı "ortak çarpan" problemi, yalnız 10 yerine çarpan 2. -->

---

<!-- _class: bolum -->

# 8. Çakışmalar ve Ayrık Zincirleme (Separate Chaining)

<!-- Konuşma notu: Bölüm 8, çakışmaların normal olduğunu kabul eder, sonra onları atlatmanın iki standart yolundan ilkini kurar. -->

---

# Başlangıç sorusu

İki farklı anahtar aynı indekse hash'leniyor.
Tabloda orada yalnız bir hücre var. İkinci
anahtar nereye gidiyor?

<!-- Konuşma notu: Tek bir doğru yanıt yok — bugünün geri kalanı, tam olarak bu soruya iki farklı, eşit derecede geçerli yanıt. -->

---

# Benzetme — paylaşılan bir posta kutusu

- İki öğrenci rastlantıyla aynı posta kutusu numarasını paylaşıyor
- Çözüm: o tek posta kutusuna **küçük bir liste** as
- O bir hücreyi istediğiniz kadar anahtar, art arda paylaşabilir
- Bu **ayrık zincirleme**: her kovaya (bucket) bir bağlı liste

<!-- Konuşma notu: Burada çakışmalar hiçbir şeyin üzerine yazmaz — sadece bir listeyi büyütür, ki bu tam olarak Hafta 2'nin bağlı listesinin yeniden kullanımı. -->

---

# Zincirleme fikri

- Tablo hücresi `i`, bir bağlı listenin **başını** tutar
- Ekleme: yeni düğüm listenin **başı** olur — O(1)
- Arama: listeyi dolaş, her anahtarı karşılaştır — O(zincir uzunluğu)
- Boş zincir (`NULL`): anahtar kesinlikle yok

<!-- Konuşma notu: Ekleme önce zinciri aramak zorunda değil — yeni düğüm her zaman doğrudan başa gider. -->

---

# Ayrık zincirleme, adım adım

<iframe class="dsanim" src="anim/hash-chaining.html?yer=slayt&lang=tr" title="Ayrık zincirleme"></iframe>

<!-- Konuşma notu: Normal örnek: m = 7, 10 ekleme, 4 arama — bir kovanın zincirinin büyümesini, sonra bir arama sırasında dolaşılmasını izleyin. -->

---

# Uç durum — ağır yüklü bir tablo

<iframe class="dsanim" src="anim/hash-chaining.html?yer=slayt&lang=tr&example=high-load" title="Ayrık zincirleme: yüksek yük"></iframe>

<!-- Konuşma notu: m = 3, 12 anahtar: yük faktörü α = 4 — zincirler uzuyor, artık arama ortalamada birkaç yoklama tutuyor, O(1) değil. -->

---

# Kod — ekleme (zincirin başı)

```c
void insert(int key) {
    int idx = key % M;
    Node *n = malloc(sizeof(Node));
    n->key = key;
    n->next = table[idx];  /* yeni baş */
    table[idx] = n;
}
```

<!-- Konuşma notu: Bu, Hafta 2'nin "başa ekleme" bağlı liste işlemi, tamamen değişmeden — yalnız kova bir hash'ten geliyor. -->

---

# Kod — arama (zinciri dolaşmak)

```c
bool search(int key) {
    int idx = key % M;
    for (Node *c = table[idx]; c;
         c = c->next) {
        if (c->key == key) return true;
    }
    return false;
}
```

<!-- Konuşma notu: Bir `NULL` zincir burada bedavaya ele alınır — for döngüsü hiç çalışmaz, fonksiyon hemen false döner. -->

---

# Yük faktörü (load factor)

- `α = n / m` — saklanan anahtarlar, tablo boyutuna bölünmüş
- `α = 0,5`: zincirler ortalama 0,5 uzunlukta — neredeyse O(1)
- `α = 4`: zincirler ortalama 4 uzunlukta — gerçek maliyet, O(1) değil
- Bir hash tablosunun **hızı** doğrudan `α`'ya bağlı

<!-- Konuşma notu: Yük faktörü, bir aramanın ortalamada kaç düğümü geçmesi gerektiğini önceden söyleyen tek sayı. -->

---

# Karmaşıklık

- Ekleme: her zaman **O(1)** — doğrudan zincirin başına
- Arama (ortalama): **O(1 + α)** — bir hash, artı zincir
- Arama (en kötü durum): **O(n)** — her anahtar tek bir zincirde
- `α`'yı küçük tutmak, zincirlemeyi pratikte hızlı tutan şey

<!-- Konuşma notu: En kötü durum bilerek alarm verici — Bölüm 10'un yeniden hash'lemesi, α'nın hiç bu kadar büyümesini önlemek için var. -->

---

# Sık yapılan hatalar

- Tabloyu hiç büyütmeden `α`'nın sınırsız büyümesine izin vermek
- Boş bir zincirin (`NULL`) "kesinlikle yok" demek olduğunu unutmak
- "Çakışma"yı "hata" ile karıştırmak — çakışmalar beklenir

<!-- Konuşma notu: Hiç çakışması olmayan bir hash tablosu gerçekçi bir tasarım hedefi değil — asıl hedef onları iyi yönetmek. -->

---

# Mini soru

Bir tabloda `m = 5` kova ve zincirlemeyle
düzgün dağılmış `n = 20` anahtar var. Yük
faktörü ve ortalama zincir uzunluğu nedir?

<!-- Konuşma notu: Birkaç slayt önceki yük faktörü formülünü doğrudan uygulayın. -->

---

# Yanıt

**α = 20 / 5 = 4.** Ortalamada, her zincir
yaklaşık 4 anahtar tutar — arama O(1) değil,
kabaca 4 karşılaştırmaya mal olur.

<!-- Konuşma notu: Bu tam senaryoyu, Bölüm 10'un yeniden hash'lemesi, α bu kadar büyümeden tabloyu büyüterek sonradan düzeltiyor. -->

---

<!-- _class: bolum -->

# 9. Açık Adresleme (Open Addressing)

<!-- Konuşma notu: Bölüm 9, çakışma sorusunu ikinci bir yolla yanıtlıyor: tablonun dışında bir liste yerine, her anahtarı tablonun içinde tut. -->

---

# Başlangıç sorusu

Ayrık zincirleme liste düğümleri için ekstra
bellek ister. Her anahtar bunun yerine
**doğrudan tablonun hücrelerinde** yaşayabilir mi?

<!-- Konuşma notu: Evet — bu bölümün tamamı, bir anahtarın ev hücresi doluyken "sırada nereye bakayım?" sorusuna üç farklı yanıt. -->

---

# Açık adresleme fikri

- Liste yok: her anahtar doğrudan tablo dizisinde yaşar
- `h(key)`'de çakışma mı? Bir dizi başka hücreyi **yokla (probe)**
- İlk **boş** hücrede dur — anahtar oraya yerleşir
- Silme bir **mezar taşı (tombstone)** işareti ister, gerçek boş hücre değil
- Aşağıda üç yoklama kuralı: doğrusal, karesel, çift hash

<!-- Konuşma notu: Üç kural da tam olarak tek bir soruyu farklı yanıtlıyor: "ev hücresi dolu — sırada nereye bakayım?" Mezar taşı ayrıntısı 9a'da tam olarak açıklanıyor. -->

---

# 9a. Doğrusal Yoklama (Linear Probing)

<!-- Konuşma notu: En basit yoklama kuralı: bir hücre doluysa, sadece bir sonrakini dene, sonda başa sar. -->

---

# Doğrusal yoklama fikri

- `h(key)`'de çakışma mı? `h(key)+1`, `+2`, `+3`, … dene
- İndeks sonu geçince `mod m` ile başa sar
- Boş **ya da** silinmiş ilk hücrede dur
- Kodlaması basit, ama anahtarlar **öbekler** halinde yığılır

<!-- Konuşma notu: Bu büyüyen öbekler, tam olarak bir sonraki slaytın "birincil kümelenme" dediği şey. -->

---

# Doğrusal yoklama, adım adım

<iframe class="dsanim" src="anim/hash-linear-probing.html?yer=slayt&lang=tr" title="Doğrusal yoklama"></iframe>

<!-- Konuşma notu: Normal örnek: m = 11, 10 ekleme, bir arama ve bir silme — bir yoklama dizisinin oluşmasını, sonra arama sırasında yeniden dolaşılmasını izleyin. -->

---

# Uç durum — silme sonrası arama

<iframe class="dsanim" src="anim/hash-linear-probing.html?yer=slayt&lang=tr&example=tombstone" title="Doğrusal yoklama: mezar taşı"></iframe>

<!-- Konuşma notu: Mezar taşı olmadan, bu arama boşaltılmış hücrede yanlışlıkla durup "bulunamadı" derdi — anahtar hâlâ yoklama zincirinde daha ilerideyken. -->

---

# Uç durum — tablo doluyor

<iframe class="dsanim" src="anim/hash-linear-probing.html?yer=slayt&lang=tr&example=table-full" title="Doğrusal yoklama: tablo dolu"></iframe>

<!-- Konuşma notu: m = 8, 8 anahtar sırayla aynı hücrede çakışıyor — tablo tam olarak doluyor, sonraki ekleme doğru şekilde reddediliyor. -->

---

# Kod — doğrusal yoklamayla ekleme

```c
bool insert(int key) {
    int idx = key % M;
    for (int i = 0; i < M; i++) {
        if (state[idx] != OCCUPIED) {
            table[idx] = key;
            state[idx] = OCCUPIED;
            return true;
        }
        idx = (idx + 1) % M;
    }
    return false;  /* tablo dolu */
}
```

<!-- Konuşma notu: `state[idx] != OCCUPIED`, hem EMPTY hem DELETED'i kabul eder — bir mezar taşının hücresini yeni bir anahtar için yeniden kullanarak. -->

---

# Kod — silme bir mezar taşı bırakır

```c
bool delete_key(int key) {
    int idx = key % M;
    for (int i = 0; i < M; i++) {
        if (state[idx] == EMPTY)
            return false;
        if (table[idx] == key) {
            state[idx] = DELETED;
            return true;
        }
        idx = (idx + 1) % M;
    }
    return false;
}
```

<!-- Konuşma notu: EMPTY değil, DELETED — bu tek kelimelik fark, sonraki her aramanın yoklama zincirini bozulmadan tutan şey. -->

---

# Birincil kümelenme (primary clustering)

- Çakışan anahtarlar her zaman **aynı** doğrusal yolu izler
- Dolu öbekler büyür, büyüyen öbekler daha çok çakışma çeker
- Bu kartopu etkisine **birincil kümelenme** denir
- Bölüm 9b ve 9c bunu daha az öngörülebilir bir adımla düzeltir

<!-- Konuşma notu: Asıl sorun "öngörülebilirlik" — bir öbeğin başında çakışan her anahtar, ondan kaçmak için tam olarak aynı büyüyen öbeği yürür. -->

---

# Karmaşıklık

- Düşük yük faktöründe ekleme/arama: **O(1)**'e yakın
- `α` 1'e yaklaştıkça: kümelenme maliyeti keskin şekilde artırır
- En kötü durum: **O(m)** — tüm tabloyu taramak
- `α`'yı 1'in belirgin altında tutmak zincirlemeden bile daha önemli

<!-- Konuşma notu: Açık adreslemede geri dönülecek "ekstra" bellek yok — tablo dolduğunda, zincirlemenin aksine, hiçbir anahtar sığmaz. -->

---

# Sık yapılan hatalar

- Silinen bir hücreyi DELETED yerine EMPTY'ye temizlemek
- `α`'nın 1,0'a ulaşmasına izin vermek — ekleme artık temiz bitmez
- Aramanın DELETED hücreleri de **geçmesi** gerektiğini unutmak

<!-- Konuşma notu: Bu hataların her biri yine de derlenir ve küçük test durumlarında genelde "doğru görünür" — tam olarak bu onları tehlikeli kılan şey. -->

---

# Mini soru

Bir anahtar silinir, bir mezar taşı bırakır.
Sonraki bir `search()` o hücreyi durmadan
geçer. Bu neden doğru davranış?

<!-- Konuşma notu: Birkaç slayt önceki mezar taşı uç durumu animasyonunun konuşma notunu hatırlayın. -->

---

# Yanıt

**Çünkü silinenden sonra yerleştirilmiş bir
anahtar, tam onun üzerinden yoklanmış olabilir.**
Bir mezar taşında durmak, onu yanlışlıkla yok sayardı.

<!-- Konuşma notu: Bir mezar taşı "burada bir şey vardı, aramaya devam et" demek — yalnız gerçek bir EMPTY hücre "bu noktanın ötesinde hiçbir şey yerleştirilmedi" demek. -->

---

# 9b. Karesel Yoklama (Quadratic Probing)

<!-- Konuşma notu: Karesel yoklama da her anahtarı tablonun içinde tutar, ama doğrusal yoklamanın sabit adımını hızla büyüyen bir adımla değiştirir. -->

---

# Karesel yoklama fikri

- `home`'da çakışma mı? `home + 1²`, `home + 2²`, … dene
- Adım hızla büyür: 1, 4, 9, 16, … — 1, 1, 1, … yerine
- Çakışan anahtarları birbirinden ayırır — birincil kümelenmeyi azaltır
- Yeni tuzak: `i²` dizisi başarısız şekilde **döngüye** girebilir

<!-- Konuşma notu: Büyüyen adım kümelenme için tam çözüm — ama tam olarak bu büyüme, yeni döngü probleminin nedeni. -->

---

# Karesel yoklama, adım adım

<iframe class="dsanim" src="anim/hash-quadratic-probing.html?yer=slayt&lang=tr" title="Karesel yoklama"></iframe>

<!-- Konuşma notu: Normal örnek: m = 13 (asal), 10 anahtar — i² sıçramalarının tek bir büyüyen öbek yerine dağınık hücrelere düştüğünü izleyin. -->

---

# Uç durum — m 2'nin kuvveti: bir döngü

<iframe class="dsanim" src="anim/hash-quadratic-probing.html?yer=slayt&lang=tr&example=quadratic-cycle" title="Karesel yoklama: döngü"></iframe>

<!-- Konuşma notu: m = 8, asal değil — i² dizisi, tabloda başka yerde boş hücreler olsa bile, sonsuza dek aynı birkaç hücreyi ziyaret ediyor. -->

---

# Kod — karesel yoklamayla ekleme

```c
bool insert(int key) {
    int home = key % M;
    for (int i = 0; i < M; i++) {
        int idx = (home + i*i) % M;
        if (state[idx] != OCCUPIED) {
            table[idx] = key;
            state[idx] = OCCUPIED;
            return true;
        }
    }
    return false;
}
```

<!-- Konuşma notu: `i*i`, doğrusal yoklamanın kodundan tek gerçek değişiklik — adım artık sabit +1 yerine `i`'ye bağlı. -->

---

# Karmaşıklık, ve m neden önemli

- Düşük yük faktöründe ekleme/arama: **O(1)**'e yakın
- Aynı `α`'da doğrusal yoklamadan daha az kümelenme
- `m` **asal** ve `α <= 0,5` gerektirir — yoksa `i²`
  dizisi boş bir hücreye ulaşmadan **döngüye** girebilir

<!-- Konuşma notu: Doğrusal yoklamadan farklı olarak, burada kötü bir m yalnız yavaşlatmakla kalmaz, doğrudan doğruluğu bozabilir — bu koşul gerçekten daha güçlü. -->

---

# Sık yapılan hatalar

- "Yuvarlak sayı diye" `m`'yi 2'nin kuvveti seçmek
- `α`'nın 0,5'i aşmasına izin vermek — döngü olası hale gelir
- Döngüye giren bir eklemeyi gerçekten dolu bir tabloyla karıştırmak

<!-- Konuşma notu: Animasyonun uç durumu bir döngüyü açıkça işaretliyor, tam olarak gerçekten dolu bir tabloyla karıştırılmasın diye. -->

---

# Mini soru

`m = 8`. Karesel yoklama burada neden
`m = 11`'e göre daha riskli?

<!-- Konuşma notu: "Karmaşıklık, ve m neden önemli" slaytının son maddesini hatırlayın. -->

---

# Yanıt

**8, asal değil, 2'nin kuvveti.** `i²` dizisi,
tabloda hâlâ boş yer olsa bile, yalnız
birkaç hücre arasında döngüye girebilir.

<!-- Konuşma notu: Bu tam olarak birkaç slayt önceki karesel-döngü uç durumu animasyonunun gösterdiği senaryo. -->

---

# 9c. Çift Hash (Double Hashing)

<!-- Konuşma notu: Çift hash de aynı "tablonun içinde yokla" fikrini tutar, ama adımın kendisini anahtara bağlı yapar. -->

---

# Çift hash fikri

- İki hash fonksiyonu: ev için `h1(key)`, **adım** için `h2(key)`
- `probe(i) = (h1(key) + i * h2(key)) mod m`
- Farklı anahtarlar genelde **farklı** adımlar alır
- Çakışan anahtarlar artık aynı yolu izlemez

<!-- Konuşma notu: Bu doğrudan doğrusal yoklamanın sorununu çözer: aynı ev hücresini paylaşan iki anahtar artık oradan genelde tamamen farklı yollar izler. -->

---

# Çift hash, adım adım

<iframe class="dsanim" src="anim/hash-double-hashing.html?yer=slayt&lang=tr" title="Çift hash"></iframe>

<!-- Konuşma notu: Normal örnek: m = 13, R = 11, 10 anahtar — iki anahtarın bir ev hücresini paylaşmasını, sonra görünür şekilde farklı yoklama yollarını izlemesini izleyin. -->

---

# Uç durum — ortak çarpanlı bir döngü

<iframe class="dsanim" src="anim/hash-double-hashing.html?yer=slayt&lang=tr&example=double-hash-cycle" title="Çift hash: döngü"></iframe>

<!-- Konuşma notu: m = 9, asal değil — bir anahtarın adımı m ile ortak bir çarpan paylaşıyor, o yüzden yoklama dizisi her hücreye ulaşmadan döngüye giriyor. -->

---

# Kod — iki hash fonksiyonu

```c
int h1(int key, int m) {
    return key % m;
}
int h2(int key, int r) {
    return r - (key % r);  /* r < m, asal */
}
```

<!-- Konuşma notu: `h2`, sonucu her zaman `[1, r]` aralığında olacak şekilde kuruldu — hiçbir zaman 0 değil, çünkü 0 adım aynı hücreyi sonsuza dek yoklardı. -->

---

# Kod — iki hash ile yoklama

```c
int idx = h1(key, M);
int step = h2(key, R);
for (int i = 0; i < M; i++) {
    if (state[idx] != OCCUPIED) {
        table[idx] = key;
        return idx;
    }
    idx = (idx + step) % M;
}
```

<!-- Konuşma notu: `step`, döngünün dışında, anahtar başına bir kez hesaplanır — bu anahtar için her çakışma sonra aynı kişisel adımı yeniden kullanır. -->

---

# Karmaşıklık, ve m neden önemli

- `α` 1'in belirgin altındayken ekleme/arama: **O(1)**'e yakın
- Üç yoklama kuralının en az kümelenmesi
- Her adımın **her** hücreye ulaşması için `m`'nin asal olması gerekir
- Pratikte genelde en iyi açık adresleme seçimi

<!-- Konuşma notu: Bileşik bir m, tıpkı 9b'deki gibi, bazı anahtarların adımlarının döngüye girmesine izin verebilir — çift hash aynı temel soruna karşı bağışık değil. -->

---

# Sık yapılan hatalar

- `h2(key)`'nin **0** dönebilmesine izin vermek — sonsuz bir adım
- `m` ve `R`'yi ortak bir çarpan paylaşacak şekilde seçmek
- `R`'nin kendisinin asal, ve `R < m` olması gerektiğini unutmak

<!-- Konuşma notu: Tam olarak 0'lık bir adım buradaki en tehlikeli hata — tam olarak aynı dolu hücreyi sonsuza dek yeniden yoklar. -->

---

# Mini soru

Doğrusal, karesel ve çift hash, iyi davranış
için hepsi `m`'nin asal olmasını ister.
`m` asal değilken hangisi **en** hoşgörülü?

<!-- Konuşma notu: Her alt bölümün "m neden önemli" maddelerini hatırlayın, koşulun ne kadar katı olduğunu karşılaştırın. -->

---

# Yanıt

**Doğrusal yoklama.** `m` bileşikken bile
her hücreye ulaşmaya devam eder — yalnız
**kümelenmesi** kötüleşir, doğruluğu değil.

<!-- Konuşma notu: Karesel ve çift hash kötü bir m'de boş bir hücreyi hiç bulamayabilir; doğrusal yoklama bunun yerine zarifçe, yalnız daha yavaş, bozulur. -->

---

<!-- _class: bolum -->

# 10. Yeniden Hash'leme (Rehashing)

<!-- Konuşma notu: Bölüm 10, bu haftaki her çakışma-çözme tekniğinin şimdiye dek kaçındığı soruyu yanıtlıyor: tablo çok dolduğunda ne olur? -->

---

# Başlangıç sorusu

Bölüm 9'daki her teknik, `α` 1'e yaklaştıkça
yavaşlıyor. Bu gerçekleşmeden önce ne olmalı?

<!-- Konuşma notu: Tablo büyümeli — ama bir hash tablosunu büyütmek bir diziyi büyütmek kadar basit değil, çünkü her anahtarın indeksi m'ye bağlı. -->

---

# Yeniden hash'leme fikri

- `α` için bir **eşik (threshold)** seç (genelde 0,7–0,8 civarı)
- Onu aşmak bir **yeniden hash'lemeyi** tetikler: daha büyük bir tablo kur
- Yeni boyut: en az `2 * m` olan bir sonraki **asal**
- **Her** anahtar yeniden eklenmeli — indeksi değişebilir

<!-- Konuşma notu: Bir anahtarın indeksi mod işlemi yüzünden m'ye bağlı — m'yi değiştirin, neredeyse her anahtarın doğru indeksi de değişir. -->

---

# Neden her anahtar taşınmalı

- `h(k) = k mod m` — `m`'yi değiştirin, `h(k)` genelde değişir
- Eski hücreleri doğrudan yenilerine kopyalamak yanlış olurdu
- Bunun yerine: her anahtarı yeni, boş tabloya **yeniden ekle**
- Bu, zaten yazılmış olan aynı `insert()`'ü kullanır

<!-- Konuşma notu: Yeniden hash'leme hiç yeni ekleme mantığı gerektirmez — yalnız hayatta kalan her anahtar için sıradan insert()'ü bir kez çağırır. -->

---

# Yeniden hash'leme, adım adım

<iframe class="dsanim" src="anim/rehashing.html?yer=slayt&lang=tr" title="Yeniden hash'leme"></iframe>

<!-- Konuşma notu: Normal örnek: m0 = 6, 10 anahtar — α'nın eşiği aşmasını, asal boyutlu yeni bir tablonun belirmesini, her anahtarın indeksinin yeniden hesaplanmasını izleyin. -->

---

# Uç durum — art arda iki kez büyümek

<iframe class="dsanim" src="anim/rehashing.html?yer=slayt&lang=tr&example=double-rehash" title="Yeniden hash'leme: iki kez büyür"></iframe>

<!-- Konuşma notu: m0 = 2 çok küçük — eşik neredeyse hemen aşılıyor, ilkinden kısa süre sonra bir ikinci yeniden hash'leme geliyor. -->

---

# Kod — bir sonraki asal boyutu bulmak

```c
int is_prime(int x) {
    if (x < 2) return 0;
    for (int i=2; i*i<=x; i++)
        if (x % i == 0) return 0;
    return 1;
}
int next_prime(int x) {
    while (!is_prime(x)) x++;
    return x;
}
```

<!-- Konuşma notu: Bu, Bölüm 7'nin bölme yöntemiyle tam olarak aynı akıl yürütme — yeni tablo boyutunun yine asal olması gerekiyor. -->

---

# Kod — büyütmek ve yeniden eklemek

```c
void rehash(void) {
    int newM = next_prime(2 * m);
    /* … newState, newTable ayır … */
    for (int i = 0; i < m; i++)
        if (state[i] == OCCUPIED)
            insert_into(newState, newTable,
                        newM, table[i]);
    m = newM;  /* … yeni dizileri değiştir … */
}
```

<!-- Konuşma notu: Döngü her ESKİ hücreyi bir kez dolaşır, o yüzden bu işlemin tamamı O(m)'ye mal olur — pahalı, ama nadiren gerçekleşir. -->

---

# Amortize karmaşıklık

- Tek bir yeniden hash'leme **O(n)**'e mal olur — her anahtar yeniden eklenir
- Yeniden hash'lemeler **nadiren** olur: tablo boyutu en az iki katına çıkar
- Birçok eklemeye yayıldığında, ortalama maliyet **O(1)** kalır
- Bu, Hafta 2'nin dinamik dizisiyle aynı **amortize** fikri

<!-- Konuşma notu: "Amortize", ara sıra olan pahalı işlemin, birçok ucuz işleme yayıldığında, yine de küçük bir sabite indirgendiği anlamına gelir. -->

---

# Sık yapılan hatalar

- Hiç yeniden hash'lememek — `α` sınırsız büyür
- Asal olmayan bir boyuta büyümek
- Bir eşiği geçmek yerine her tek eklemede yeniden hash'lemek

<!-- Konuşma notu: Her eklemede yeniden hash'lemek, HER eklemeyi O(n)'e mal ederdi — bir eşiğin tüm amacı bunu nadir kılmak. -->

---

# Mini soru

`m = 6` olan bir tabloda `n = 5` anahtar var,
eşik `0,8`. Bir anahtar daha ekleniyor. Bir
yeniden hash'leme tetiklenir mi, hangi boyuta?

<!-- Konuşma notu: Eklemeden sonraki yeni α'yı hesaplayın, sonra eşikle karşılaştırın, sonra next_prime(2*m)'i uygulayın. -->

---

# Yanıt

**Evet.** `α = 6/6 = 1,0 > 0,8` — bir yeniden
hash'leme tetiklenir. Yeni boyut: `next_prime(12) = 13`.

<!-- Konuşma notu: Bu tam olarak yukarıdaki normal-preset animasyonunun senaryosu, aynı m0 = 6 başlangıç boyutuyla. -->

---

<!-- _class: bolum -->

# 11. Bir Çakışma-Çözme Tekniği Seçmek

<!-- Konuşma notu: Bölüm 11, haftanın tüm ikinci yarısının pratik karşılığı: gerçekte hangi tekniğe başvurmalısınız? -->

---

# Zincirleme mi, açık adresleme mi

| | Zincirleme | Açık adresleme |
| --- | --- | --- |
| Ekstra bellek | Evet, düğüm başına | Hayır, yerinde |
| Yüksek `α` | Zarifçe bozulur | Keskin bozulur |
| Silme | Basit | Mezar taşı ister |

<!-- Konuşma notu: Her satır gerçek bir takas — hiçbir sütun her durumda basitçe "daha iyi" değil. -->

---

# Açık adresleme içinde seçim

- Basit kod, `α` düşük tutuluyor mu? **Doğrusal** yoklama yeter
- Daha az kümelenme isteniyor, asal `m` kabul ediliyor mu?
  **Karesel** yoklama
- Mevcut en iyi dağılım isteniyor mu? **Çift** hash

<!-- Konuşma notu: Bu sıralama, bu üç tekniğin geliştirildiği tarihsel sırayla da kabaca örtüşüyor, her biri öncekinin zayıf noktasını düzeltiyor. -->

---

# Pratik bir kural

- Silmeler sık, ya da bellek sıkı değil mi? **Zincirleme**
- Bellek önemli, `α` 1'in belirgin altında mı? **Açık adresleme**
- Her iki durumda: `α` çok büyümeden **yeniden hash'le**
- Evrensel olarak "en iyi" seçim yok — yalnız **sizin durumunuz** için en iyisi

<!-- Konuşma notu: Gerçek hash tablosu kütüphaneleri (örneğin Java'nın HashMap'i), tam olarak bu tür bir mühendislik takasını dokümantasyonlarında açıkça yapıyor. -->

---

# Mini soru

Bir hash tablosu milyonlarca anahtar tutacak,
silme neredeyse hiç yok, ve bellek sıkı.
Hangi aile en uygun, neden?

<!-- Konuşma notu: Pratik kural slaytının ilk iki maddesini hatırlayın. -->

---

# Yanıt

**Açık adresleme**, muhtemelen **çift hash**.
Endişelenecek silme yok, milyonlarca zincir
bağlantısı için ekstra düğüm belleği de yok.

<!-- Konuşma notu: Silmeler sonradan yaygınlaşırsa, mezar taşları dikkatli ele alınmalı — zincirleme o zaman daha iyi bir takas olabilir. -->

---

# Özet — sıralı veride daha hızlı arama

| Fikir | Anahtar gerçek |
| --- | --- |
| Sıçramalı arama | O(sqrt(n)), block = sqrt(n) |
| Enterpolasyon araması | Düzgün veride O(log log n) |
| Üstel / Fibonacci | Sınırsız n / bölme yok |

<!-- Konuşma notu: Buradaki her satır hâlâ değerleri karşılaştırıyor — sırada özetlenecek hash'leme, bunu büyük ölçüde yapmayan tek fikir. -->

---

# Özet — hash'leme ve çakışmalar

| Fikir | Anahtar gerçek |
| --- | --- |
| Hash fonksiyonu | h(k) = k mod m, O(1), m asal |
| Zincirleme | Kova başına bağlı liste, O(1+α) |
| Açık adresleme | Yerinde, mezar taşı ister, yeniden hash |

<!-- Konuşma notu: İki çakışma ailesi de hâlâ hızlarını önceden söyleyen bir sayıyı paylaşıyor: yük faktörü α = n/m. -->

---

# Büyük resim

Sıralı veri, ekstra yapıdan yararlanarak
ikili aramadan hızlı aramayı destekler. Hash'leme
karşılaştırmayı tamamen bırakır: bir konum hesapla,
çakışmaları ele al, tablo dolmadan büyüt.

<!-- Konuşma notu: Öğrenci bugünden yalnız bir cümle hatırlayacaksa, hatırlamaya değer olan bu. -->

---

# Öz değerlendirme turu

Dört kısa soru. Yanıt bir sonraki slaytta
görünmeden önce düşünün. Tam alıştırmalar ve
on soruluk bir sınav hafta notlarında.

<!-- Konuşma notu: Bunlar yazılı notların sonundaki öz değerlendirme sınavını yansıtıyor, slayt başına bir soru, burada daha kısa bir setle. -->

---

# 1. Bir dizide 400 eleman var. Sıçramalı arama hangi blok boyutunu kullanır, ve en kötü durumda yaklaşık kaç karşılaştırma?

<!-- Konuşma notu: Sor, bekle, sonra ilerle. -->

---

# `block = sqrt(400) = 20`. En kötü durum: yaklaşık `20 + 20 = 40` karşılaştırma — doğrusal aramanın 400'ünden çok az.

<!-- Konuşma notu: Bu, Bölüm 2'nin O(sqrt(n)) sınırının, daha büyük bir n'ye uygulanmış tam hali. -->

---

# 2. Enterpolasyon aramasının formülü neden `arr[hi] == arr[lo]`'ya karşı bir koruma ister?

<!-- Konuşma notu: Bölüm 3'ün sıfıra bölme uç durumunu hatırlayın. -->

---

# Koruma olmadan, formülün paydası sıfır olurdu — tümü eşit bir aralık `arr[hi] - arr[lo] = 0` yaptığı için, bu sıfıra bölme hatası demek.

<!-- Konuşma notu: Bu tam olarak Bölüm 3'teki tümü-eşit uç durumu animasyonunun göstermek için kurulduğu şey. -->

---

# 3. Bir hash tablosunun boyutu `m` neden genelde asal seçilmeli?

<!-- Konuşma notu: Bölüm 7'nin 10'un kuvveti örneğini hatırlayın. -->

---

# Asal bir `m`, çoğu anahtar örüntüsüyle ortak bir çarpan paylaşmaz, bileşik bir `m`'nin (10'un kuvveti gibi) yol açabileceği ciddi kümelenmeyi önler.

<!-- Konuşma notu: Aynı gerçek, Bölüm 9'dan karesel ve çift hash için daha da güçlü şekilde önemli. -->

---

# 4. Açık adreslemede silinen bir hücre neden sade boş bir hücre değil, bir mezar taşı olmalı?

<!-- Konuşma notu: Bölüm 9a'nın mezar taşı uç durumunu hatırlayın. -->

---

# Sonraki bir arama, gerçekten boş olan ilk hücrede durur. Boşa temizlemek, ondan sonra yerleştirilmiş anahtarların yoklama zincirini yanlışlıkla keserdi.

<!-- Konuşma notu: Bu, açık adresleme uygulamalarındaki en yaygın gerçek dünya hatası, ve tam olarak mezar taşı animasyonunun gösterdiği şey. -->

---

<!-- _class: baslik -->

# Gelecek hafta

**Hafta 7 — Proje Sunumları**

Bu hafta yeni algoritma yok: takımlar
projelerinin arama ya da hash'leme bileşenini
sunar, ardından Hafta 8'in sınavı, Hafta 9'da graf algoritmaları sürüyor.

<!-- Konuşma notu: Hafta 7–8, ara sınav haftası proje sunumu ve sınav bloğu; Hafta 9 sonra Hafta 5'in üzerine, ağırlıklı graf algoritmalarına geçiyor. -->

---

# Kaynaklar (1/2)

- Ders izlencesi, Hafta 6: `docs/syllabus/syllabus.en.md`
- Cormen, Leiserson, Rivest, Stein. *Introduction to
  Algorithms*, 4. baskı. MIT Press
- Knuth. *The Art of Computer Programming, Cilt 3:
  Sorting and Searching*, 2. baskı
- Bentley, J., Yao, A. (1976). "An almost optimal
  algorithm for unbounded searching"
- Luhn, H. P. (1953). IBM iç yazısı, hash'leme üzerine

<!-- Konuşma notu: Bunlar, haftanın yazılı notlarının sonundaki aynı kaynaklar. -->

---

# Kaynaklar (2/2)

- Kiefer, J. (1953). "Sequential minimax search
  for a maximum"
- Peterson, W. W. (1957). "Addressing for
  random-access storage"
- Sedgewick, Wayne. *Algorithms*, 4. baskı. Addison-Wesley
- williamfiset/Algorithms · Programiz DSA

<!-- Konuşma notu: Tarihsel kaynaklar — Luhn, Kiefer, Bentley ve Yao — bugünün "kısa tarihçe" slaytlarının dayandığı kaynaklar. -->
