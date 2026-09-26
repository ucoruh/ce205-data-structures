---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Hafta 1 — Giriş, Big-O ve İşaretçiler"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Hafta 1"
footer: "RTEÜ Bilgisayar Mühendisliği · 2026-2027 Güz"
---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Giriş, Big-O ve İşaretçiler

**CEN207 Veri Yapıları — Hafta 1**

Dr. Öğr. Üyesi Uğur CORUH · 2026-2027 Güz

<!-- Konuşma notu: Hafta bire hoş geldiniz — bugün, sonraki her haftanın üzerine kurulduğu iki temeli atıyoruz: maliyeti ölçmek ve belleğin gerçekten nasıl çalıştığı. -->

---

# Bugünün planı (3 saat)

| Saat | Konu |
| --- | --- |
| 1 | Ders planı · veri yapısı nedir · doğrusal / doğrusal olmayan |
| 2 | Big-O: arama, büyüme, döngüler, alan **Animasyon 1–5** |
| 3 | İşaretçiler, yığın/öbek, TLV/PER **Animasyon 6–13** · C atölyesi **Animasyon 14** |

**Öğrenme çıktıları:** LO.1 (doğrusal/doğrusal olmayan yapılar) · LO.2 (zaman ve alan karmaşıklığı) · LO.7 (doğru yapıyı seçmek)

<!-- Konuşma notu: On dört kısa animasyon bugünün dersinin çoğunu taşıyor; her biri bir kez gösteriliyor, en zorlu durumuna ikinci bir bakışla. -->

---

# Bu haftanın kavramları — nerede

| Kavram | Nerede |
| --- | --- |
| Veri yapısı, doğrusal / doğrusal olmayan | Bölüm 1–2 |
| Big-O, büyüme, en iyi/en kötü/ortalama, alan | Bölüm 3 |
| İşaretçiler, struct'lar | Bölüm 4 |
| Yığın, öbek, TLV/PER, C atölyesi | Bölüm 5–7 |

<!-- Konuşma notu: Her terim ilk geçtiğinde tam olarak tanımlanır; bu tablo yalnızca onu tekrar nerede bulacağınızı söylüyor. -->

---

# Kod örnekleri nasıl çalışıyor

- Her fikrin eksiksiz bir **C** ve **Java** programı var
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Kaynaklar: `code/week-01/c/` ve `code/week-01/java/`
- Her programın beklenen çıktısı hafta notlarında

<!-- Konuşma notu: Canlı çalıştırmak isterseniz şimdi bir terminal açın; bugünün her kod parçası tam olarak gösterildiği gibi derlenir ve çalışır. -->

---

# Ders düzeni: nasıl değerlendirileceksiniz

- **Tek bir proje**, tüm dönem boyunca: önce C, sonra Java
- **İki ara kontrol**: C'de bir vize, Java'da bir final
- **İki quiz** — ayrı bir ödev yok
- Bunun gibi haftalık notlar, İngilizce ve Türkçe
- Tam not dağılımı: ders **izlencesi**

<!-- Konuşma notu: Derste yalnızca ana hatlara değiniyoruz — izlenceyi, proje kılavuzunu ve ön koşullar sayfasını önümüzdeki haftaya kadar okuyun. -->

---

# Ders düzeni: takımlar ve kaynaklar

- Takım büyüklüğü: proje takımı başına **en çok 3** öğrenci
- **3. haftadan sonra takım değişikliği yok**
- Proje kılavuzu: `docs/project-guide/`
- Ön koşullar: `docs/prerequisites/` (C araç zinciri, alt yapı)
- Eski bir izlence PDF'i dersle çelişiyorsa: **sorun, tahmin etmeyin**

<!-- Konuşma notu: Takımınızı erken seçin — bu kural, bir takımın işi kilitlenmeden önce ivme kazansın diye var. -->

---

# Bu haftanın — ve dersin — haritası

| Bu hafta ne kuruyor | Sonraki her hafta ne ekliyor |
| --- | --- |
| Maliyeti ölçmenin yolu (Big-O) | Veriyi düzenlemenin bir yolu daha |
| Belleğin bir resmi (işaretçiler) | Aynı Big-O aracıyla değerlendiriliyor |

<!-- Konuşma notu: Veri yapıları, tam olarak iki şeyle ilgili bir ders: veriyi bellekte nasıl düzenlediğiniz ve bu düzenlemenin size ne kadara mal olduğu. -->

---

<!-- _class: bolum -->

# 1. Veri Yapısı Nedir?

<!-- Konuşma notu: Bölüm 1, hiç koda dokunmadan önce, tüm dersin en temel sorusunu soruyor. -->

---

# Başlangıç sorusu

Telefonunuzun rehberi on binlerce isim
arasında "Ayşe"yi anında bulur. Sırasız
olsaydı, aynı telefon her ismi taramak zorunda kalırdı.

<!-- Konuşma notu: İsimlerin bellekte diziliş biçimi FARKIN ta kendisi — işte bu diziliş biçimine veri yapısı diyoruz. -->

---

# Kısa bir tarihçe

- **1960'lar** — "veri yapısı" terimi bilgisayar bilimlerinde yaygınlaşır
- **1968** — Knuth'un *TAOCP* Cilt 1'i liste, yığın, ağaçları inceler
- **1974** — Liskov & Zilles: **soyut veri tipi** (ADT)
- ADT = yapının *ne yaptığı*, *nasıl kurulduğu* değil

<!-- Konuşma notu: Ne-nasıl ayrımı, bu dersin sürekli dayandığı bir ayrım — bugünden itibaren gayri resmi olarak başlıyor. -->

---

# Sezgi: veri için mobilya

- Dosya dolabı, kitaplık, masadaki tepsi yığını
- Her biri aynı *türde* içeriği tutar
- Her biri **farklı şeylerde** iyidir
- Tek bir "en iyi" düzen yok — yalnızca ödünleşimler

<!-- Konuşma notu: Bir tepsi yığını üstten eklemek/almak için hızlıdır, ortadan bir şey bulmak için berbattır — fikrin tamamı bu. -->

---

# Veri yapısı, tam olarak

Verileri öyle düzenlemenin bir yolu ki belirli
işlemler — erişim, arama, ekleme, silme —
bilinen, çözümlenebilir bir **maliyetle** yapılabilsin.

<!-- Konuşma notu: "Bilinen, çözümlenebilir maliyet" kısmı, "veriyi düzenlemek" gibi bulanık bir fikri bu dersin ölçebileceği bir şeye çeviriyor. -->

---

# Neden tek bir tane yok

| İşlem | Neden bedava değil |
| --- | --- |
| Erişim | Bazı düzenler konumu hesaplar; bazıları baştan yürür |
| Arama | Sırasız: tek tek kontrol. Sıralı: yarıya indirilebilir |
| Ekleme / Silme | Bazıları her şeyi kaydırır; bazıları iki işaretçiyi bağlar |

<!-- Konuşma notu: Aynı yapıda genelde bu dört işlemin hepsini birden hızlı yapamazsınız — bugünkü gerçek konu tam olarak bu ödünleşim. -->

---

# Mini soru

Her şeyde diğer her yapıyı geride bırakan
tek bir "en iyi" veri yapısı neden yok?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

Her düzen bir **ödünleşim** yapar: erişimi
hızlandıran (örn. sıralı dizi), genelde
eklemeyi yavaşlatır — ve tersi. İstisnasız.

<!-- Konuşma notu: Bu tek cümle, dönemin geri kalanının her hafta bir yeni yapı tanıtmasının nedeni. -->

---

<!-- _class: bolum -->

# 2. Doğrusal ve Doğrusal Olmayan: Dersin Haritası

<!-- Konuşma notu: Bu dönem göreceğiniz her yapı, tam olarak bu iki aileden birine giriyor — bu harita hatırlanmaya değer. -->

---

# Başlangıç sorusu

Son beş şarkınız tek bir çizgi oluşturur.
Bir şirketin org şeması dallanır. Bu yalnızca
çizimle mi ilgili, yoksa gerçek bir yapısal fark mı?

<!-- Konuşma notu: Bu fark, hangi işlemlerin ucuz hangilerinin pahalı olduğunu değiştiriyor — bugünkü ikinci bölümün tam konusu bu. -->

---

# Tanımlar

- **Doğrusal**: her elemanın tam olarak bir "sonraki"si var
- Her zaman "sırada ne var?" diye sorabilir, tek yanıt alırsınız
- **Doğrusal olmayan**: bir elemanın birden çok "sonraki"si olabilir
- Gezmek, hangi dalı izleyeceğinizi *seçmek* demektir

<!-- Konuşma notu: Bir ağaç düğümünün birden çok çocuğu olabilir; bir çizge düğümü birden çok başkasına bağlanabilir — artık tek bir "sonraki" yok. -->

---

# Ders, sıralandı: doğrusal yapılar

| Yapı | Ne zaman | Belirleyici ödünleşim |
| --- | --- | --- |
| Dizi (array) | Hafta 2 | O(1) erişim; ortada O(n) ekleme/silme |
| Bağlı liste | Hafta 2 | O(n) erişim; oraya varınca O(1) ekleme/silme |
| Yığın (stack, LIFO) | Hafta 3 | Yalnızca bir uca dokunun; her işlem O(1) |
| Kuyruk (queue, FIFO) | Hafta 3 | Bir uçtan ekle, diğerinden çıkar; her işlem O(1) |

<!-- Konuşma notu: Dördü de doğrusal — her eleman hâlâ tam olarak tek bir sonrakine sahip. -->

---

# Ders, sıralandı: doğrusal olmayan ve anahtarla

| Yapı | Ne zaman | Belirleyici ödünleşim |
| --- | --- | --- |
| İkili ağaç, heap | Hafta 4 | Dengeliyken O(log n), en çok 2 çocuk |
| Çizge (graph) | Hafta 5–6 | Herhangi sayıda bağlantı; ağlar, haritalar |
| Hash tablosu (anahtarla) | Hafta 7 | Ortalama O(1), konumla değil anahtarla |
| Dosyalar (diskte) | Hafta 13–15 | Aynı ödünleşimler, disk G/Ç ile ödenir |

<!-- Konuşma notu: Hash tabloları ve dosyalar, yuvalarının diziliş biçiminde hâlâ doğrusal — yalnızca anahtarla erişim yeni; Hafta 7 bunu açıkça gösteriyor. -->

---

# Sık yapılan hatalar

- "Doğrusal olmayan" **"düzensiz"** anlamına gelmez
- "Sıralı" ile "doğrusal" aynı şey değil — farklı eksenler
- Bir hash tablosunun *yuvaları* doğrusaldır; anahtarla erişim yeni olan

<!-- Konuşma notu: Bir ağaç ve bir çizge son derece yapılandırılmıştır — yalnızca birden çok "sonraki"ye izin verirler. -->

---

# Mini soru

Bir tabak yığını doğrusal mı, doğrusal
olmayan mı? Neden?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

**Doğrusal.** Her tabağın (en üsttekiler
hariç) tam olarak bir üstü, (en alttaki
hariç) tam olarak bir altı var — tek "sonraki".

<!-- Konuşma notu: Her iki yönde de tek, belirsizliksiz bir sonraki — bu tam olarak doğrusal tanımı. -->

---

# Mini soru

Bir soy ağacı doğrusal mı, doğrusal
olmayan mı?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

**Doğrusal olmayan.** Bir ebeveynin birden
çok çocuğu olabilir, yani belirli bir kişiden
birden çok "sonraki" çıkabilir.

<!-- Konuşma notu: Bu, iki slayt önceki org şemasıyla aynı dallanma fikri. -->

---

<!-- _class: bolum -->

# 3. Algoritma Analizi: Saniyeyi Değil, Adımı Saymak

<!-- Konuşma notu: Bu bugünün en büyük bölümü — sonraki her haftanın bir yapıyı değerlendirmek için kullandığı araç, Big-O. -->

---

# Başlangıç sorusu

Bir diziyi arayan bir fonksiyon yazdınız.
Çalışıyor. *Hızlı* mı? Kronometre size
bugün, laptopınız hakkında bir şey söyler.

<!-- Konuşma notu: İstediğimiz şey algoritmanın kendisinin bir özelliği: işi, girdi büyüdükçe nasıl büyüyor. -->

---

# Kısa bir tarihçe

- **1894** — Bachmann büyük-**O** gösterimini tanıtır
- **1900'lerin başı** — Landau yaygınlaştırır ("Landau sembolü")
- **1960'lar** — bilgisayar bilimi algoritma maliyeti için benimser
- **1976** — Knuth'un makalesi CS için O/Ω/Θ'yı standartlaştırır

<!-- Konuşma notu: Gösterim, bilgisayarlardan on yıllarca önce var — başlangıçta bir fonksiyonun başka birine ne kadar yakın olduğunu tanımlıyordu. -->

---

# Sezgi: adımları say

Algoritmanın temel iş birimini — bir
karşılaştırma, bir dizi erişimi — girdi
büyüklüğü **n**'nin bir fonksiyonu olarak sayın.

<!-- Konuşma notu: Bu sayı yalnızca algoritmaya ve n'ye bağlıdır — makineye, dile ya da bugünkü CPU yüküne asla. -->

---

# Doğrusal arama: her kutuyu dene

Baştan başlar, hedefi bulana ya da kutular
bitene kadar elemanları tek tek dener.
Veride **belirli bir sıra** gerektirmez.

<!-- Konuşma notu: 11 elemanlı bir dizide, ortadaki bir değeri ararken karşılaştırmaları sayışını izleyeceğiz. -->

---

# Doğrusal arama, adım adım

<iframe class="dsanim" src="anim/linear-search.html?yer=slayt&lang=tr" title="Doğrusal arama: karşılaştırmaları saymak"></iframe>

<!-- Konuşma notu: Normal örnek: 11 değer, hedef ortada. Karşılaştırma sayacının kutu kutu tırmanışını izleyin. -->

---

# Uç durum — hedef dizide yok

<iframe class="dsanim" src="anim/linear-search.html?yer=slayt&lang=tr&example=not-found" title="Doğrusal arama: bulunamadı"></iframe>

<!-- Konuşma notu: Hedef yokken doğrusal arama, bunu söyleyebilmek için yine de her kutuyu kontrol eder — gerçek en kötü durum bu. -->

---

# Kod — linear_search (döngü)

```c
for (int i = 0; i < n; i++) {
    (*comparisons)++;
    if (arr[i] == target)
        return i;
}
```

<!-- Konuşma notu: Her yinelemede bir karşılaştırma, açıkça sayılıyor — bu, animasyonun ekranda az önce saydığı şeyin ta kendisi. -->

---

# Doğrusal aramanın sonucu

- En kötü durum (son eleman ya da yok): **n** karşılaştırma
- En iyi durum (ilk eleman): **1** karşılaştırma
- Maliyet **doğrudan n ile büyür** — bu **O(n)**

<!-- Konuşma notu: Milyon elemanlı bir dizi, en kötü durumda milyon karşılaştırma gerektirir — bu doğrudan büyüme O(n) demek. -->

---

# İkili arama (binary search): her seferinde yarısını ele

Dizi **sıralıysa**: ortaya bak. Küçükse
sol yarıyı, büyükse sağ yarıyı at.
Kalan yarıda tekrarla.

<!-- Konuşma notu: Doğrusal aramanın az önce 9 karşılaştırma harcadığı aynı hedefi, 42'yi, arayacağız. -->

---

# İkili arama, adım adım

<iframe class="dsanim" src="anim/binary-search.html?yer=slayt&lang=tr" title="İkili arama: aralığı yarıya indirmek"></iframe>

<!-- Konuşma notu: Normal örnek: 16 sıralı değer, hedef bulundu. lo, hi ve mid'in cevaba nasıl yaklaştığını izleyin. -->

---

# Uç durum — bulunamadı: lo, hi'yi geçiyor

<iframe class="dsanim" src="anim/binary-search.html?yer=slayt&lang=tr&example=hard" title="İkili arama: bulunamadı"></iframe>

<!-- Konuşma notu: Bu kez 31 değer var; aralık, kontrol edilecek hiçbir şey kalmayana, lo hi'dan büyük olana kadar yarılanır. -->

---

# Kod — binary_search (temel adım)

```c
int mid = lo + (hi - lo) / 2;
(*comparisons)++;
if (arr[mid] == target)
    return mid;
if (arr[mid] < target)
    lo = mid + 1;
else
    hi = mid - 1;
```

<!-- Konuşma notu: Tek bir karşılaştırma, kalanın YARISINI eler — bütün numara bu. -->

---

# İkili aramanın sonucu

- Aynı `42`, 9 değil, yalnızca **3** karşılaştırmada bulundu
- Her karşılaştırma, kalanın **yarısını** çöpe atar
- 1'e inene kadar yarılama sayısı: **log₂ n** — **O(log n)**

<!-- Konuşma notu: Ödünleşim: ikili arama önce sıralı bir dizi ister, sıralamanın kendisi bir aramadan daha pahalıdır. -->

---

# Büyüme yarışı: hız değil, şekil kazanır

n ikiye katlanırken üç fonksiyonu
yarıştıralım: düz `n`, `n·log₂n` (en iyi
sıralamalar), `n²` (basit sıralamalar, iç içe döngüler).

<!-- Konuşma notu: Çok daha büyük bir ölçekte iki nokta — bu animasyon ölçeğin tamamını bir kerede gösteriyor. -->

---

# Büyüme yarışı, adım adım

<iframe class="dsanim" src="anim/growth-race.html?yer=slayt&lang=tr" title="Büyüme yarışı"></iframe>

<!-- Konuşma notu: Normal örnek: n, 1'den 512'ye ikiye katlanarak. n-kare ve 2^n'in diğerlerinden nasıl koptuğunu izleyin. -->

---

# Uç durum — 2^n neredeyse anında taşıyor

<iframe class="dsanim" src="anim/growth-race.html?yer=slayt&lang=tr&example=large-from-start" title="Büyüme yarışı: baştan büyük n"></iframe>

<!-- Konuşma notu: n = 400'den başlarken 2^n, diğerleriyle aynı grafiğe çizilemeyecek kadar büyük çoktan. -->

---

# Gerçekçi büyüklüklerde büyüme

| n | n·log₂n | n² |
| --- | --- | --- |
| 100 | 664 | 10.000 |
| 10.000 | 132.877 | 100.000.000 |
| 100.000 | 1.660.964 | 10.000.000.000 |

<!-- Konuşma notu: n = 100.000'de n-kare, n log n'den 6.000 kattan fazla büyük — küçük girdide anlık, büyük ölçekte çok farklı. -->

---

# Kod — büyüme tablosu

```c
for (int i = 0; i < count; i++) {
    long n = ns[i];
    double nlogn = (double) n * log2((double) n);
    double nsq = (double) n * (double) n;
}
```

<!-- Konuşma notu: Bu, az önce gördüğünüz tabloyu beş gerçekçi büyüklük için üreten döngünün ta kendisi. -->

---

# Big-O, tam olarak

`f(n)`, belirli bir noktadan sonra `f`,
`g`'nin sabit bir katından hiç hızlı
büyümüyorsa `O(g(n))`'dir. **Sabitleri at,
en büyük terimi tut.**

<!-- Konuşma notu: Sabitleri resmi olarak nadiren hesaplarsınız — adımları sayar, en hızlı büyüyen terimi okursunuz. -->

---

# En büyük terimi okumak

| Sayılan adımlar | En büyük terim | Big-O |
| --- | --- | --- |
| `3n + 7` | `n` | O(n) |
| `n² + 2n + 1` | `n²` | O(n²) |
| `2·log₂n + 5` | `log n` | O(log n) |

<!-- Konuşma notu: Örüntü şu: en hızlı büyüyen terimi tutun, daha küçük olan her şeyi ve her sabiti atın. -->

---

# Sıralama, hızlıdan yavaşa

**O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)**

İlk üçüyle bugün tanıştınız —
`O(n log n)` ve `O(2ⁿ)` bu dönem ilerde geliyor.

<!-- Konuşma notu: O(1), işaretçi aritmetiğinden gelen sabit zamanlı dizi erişimi; O(log n) ikili arama; O(n) doğrusal arama. -->

---

# T(n)'yi elle kurmak: iç içe bir döngü

Bir döngünün içinde başka bir döngü: n
dış yinelemenin her biri için, iç döngü
kendi n yinelemesinin tamamını çalıştırır.

<!-- Konuşma notu: Tabloya güvenmek yerine, gerçek, sayılmış bir programı sayalım ve n-kareyi kendimiz görelim. -->

---

# İç içe döngüyü saymak, adım adım

<iframe class="dsanim" src="anim/nested-loop-counting.html?yer=slayt&lang=tr" title="İç içe döngüyü saymak"></iframe>

<!-- Konuşma notu: Normal örnek: kare bir döngü (j < n), n = 3 ayrıntılı, sonra dokuz n değeri daha. -->

---

# Uç durum — farklı bir döngü şekli

<iframe class="dsanim" src="anim/nested-loop-counting.html?yer=slayt&lang=tr&example=hard" title="İç içe döngü: üçgen şekil"></iframe>

<!-- Konuşma notu: Üçgen bir döngü (j < i) iç gövdeyi yine n(n-1)/2 kez çalıştırır — yine O(n kare), farklı bir sabit. -->

---

# Kod — iç içe döngü

```c
long count = 0;
for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
        count++;
        (*operations)++;
    }
}
```

<!-- Konuşma notu: Ölçülen sayı, denenen her n için n*n ile tam eşleşti — T(n) = n kare, artı atılan daha küçük terimler. -->

---

# En iyi, en kötü ve ortalama durum

- **En iyi**: hedef ilk kontrol edilen — 1 karşılaştırma
- **En kötü**: hedef son ya da yok — n karşılaştırma
- **Ortalama**: `(1 + 2 + ... + n) / n = (n + 1) / 2`
- Niteliksiz "algoritmanın Big-O'su" genelde **en kötüyü** anlatır

<!-- Konuşma notu: En kötü durum, girdiyi kontrol edemediğinizde en çok işe yarayan garanti. -->

---

# Alan karmaşıklığı: aynı fikir, bellek için

Big-O adımları sayarak **zamanı** ölçer;
alan karmaşıklığı, girdinin ötesindeki ek
depolamayı — **belleği** — ölçer.

<!-- Konuşma notu: Özyinelemeli bir fonksiyon her çağrıda bir yığın çerçevesi iter — bu, bir döngünün asla ihtiyaç duymadığı ek bellek. -->

---

# Özyinelemeli ve döngülü toplam, adım adım

<iframe class="dsanim" src="anim/space-recursive-vs-iterative.html?yer=slayt&lang=tr" title="Alan karmaşıklığı: özyinelemeli ve döngülü toplam"></iframe>

<!-- Konuşma notu: Normal örnek: 10 değer. Çağrı yığınının çağrı başına bir çerçeve büyümesini, sonra çözülmesini izleyin. -->

---

# Uç durum — derin özyineleme, 22 çerçeve

<iframe class="dsanim" src="anim/space-recursive-vs-iterative.html?yer=slayt&lang=tr&example=deep" title="Alan karmaşıklığı: derin özyineleme"></iframe>

<!-- Konuşma notu: 22 eleman, zirvede 23 çerçeve demek — yeterince büyük n için yığın gerçekten tükenebilir. -->

---

# Kod — özyinelemeli ve döngülü toplam

```c
int sum_recursive(const int arr[], int n) {
    if (n == 0)
        return 0;
    return arr[n - 1] + sum_recursive(arr, n - 1);
}

int sum_iterative(const int arr[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++)
        total += arr[i];
    return total;
}
```

<!-- Konuşma notu: İkisi de aynı toplamı döndürür. sum_recursive O(n) yığın belleği kullanır; sum_iterative her zaman tam olarak O(1). -->

---

# Sık yapılan hatalar

- Big-O'yu *koddan* değil *adımlardan* okumak
- İkili aramanın **sıralı** girdi istediğini unutmak
- O(1)'i "anlık" sanmak — yalnızca "büyümüyor" demek
- Ortalama önemliyken yalnızca en kötüyü söylemek

<!-- Konuşma notu: Bir satırın içindeki gizli bir döngü (arr.contains(x) gibi) sessizce O(n)'i O(n kare)'ye çevirebilir. -->

---

# Mini soru

Bir algoritma tam olarak `5n + 20` temel
işlem yapıyor. Big-O'su nedir?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

**O(n)**. Sabit çarpanı (5) ve toplamsal
sabiti (20) atın; yalnızca en hızlı
büyüyen terim, `n`, kalır.

<!-- Konuşma notu: Bu, "en büyük terimi oku" tablosunun doğrudan uygulanması. -->

---

# Mini soru

İkili arama neden bağlı bir listede,
dizide olduğu gibi doğrudan kullanılamaz?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

İkili arama ortaya indeksle **O(1) erişim**
ister. Bağlı liste düğüm düğüm gezilmeli —
zaten O(n), kazancı siliyor.

<!-- Konuşma notu: Hafta 2 tam olarak bu yapıyı kuruyor, bu yüzden bu soru önümüzdeki haftayı doğrudan önizliyor. -->

---

# Mini soru

Niteliksiz olarak, "algoritmanın Big-O'su"
genelde hangi durumu anlatır?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

**En kötü durum**: garantili üst sınır —
size verilen girdi ne olursa olsun geçerli
olduğu için değerli.

<!-- Konuşma notu: En iyi durumlar algoritmalar arasında birbirine benzer, bu yüzden karşılaştırmak için en kötü durum daha yararlı. -->

---

<!-- _class: bolum -->

# 4. İşaretçiler (Pointer) ve Nesneler

<!-- Konuşma notu: Bir işaretçi, bir değişkenin konumudur, yalnızca değeri değil — bugün bu fikri tamamen somutlaştırıyoruz. -->

---

# Başlangıç sorusu

Çağıranda iki değişkeni takas eden
`swap(a, b)` yazın. Birçok dilde bu
imkânsız — fonksiyon yalnızca *kopyaları* görür.

<!-- Konuşma notu: Çağıranın değişkenlerine geri ulaşmak için fonksiyonun her birinin KONUMUNA ihtiyacı var, değerine değil — o konum bir işaretçi. -->

---

# Kısa bir tarihçe

- **1966/1969** — BCPL, sonra B: adres-al, dereferans
- **1972** — Dennis Ritchie'nin C'si işaretçiyi merkeze koyar
- **1995** — Java, ham işaretçileri kaldırır, **referans**ları tutar
- Referans: paylaşılan veri, aritmetik yok, kötü adres yok

<!-- Konuşma notu: İki Java değişkeni yine aynı nesneyi adlandırabilir — yalnızca keyfi bir adres hesaplayamazsınız. -->

---

# Sezgi: bellek, numaralı posta kutuları

- Bir değişken bir posta kutusu: adres + içerik
- `&x`, "x'in posta kutusu numarası ne?" diye sorar
- Bir **işaretçi**, başka bir kutunun numarasını tutar
- Dereferans (`*p`): o kutuya git, oku

<!-- Konuşma notu: int x = 3, 3'ü bir posta kutusuna, diyelim 1000 numaraya, koyar — &x size o 1000'i verir. -->

---

# İşaretçi işlemleri

| İşlem | Sözdizimi | Karmaşıklık |
| --- | --- | --- |
| Adres-al | `&x` | O(1) |
| Bildirim | `int *p;` | O(1) |
| Adres ata | `p = &x;` | O(1) |
| Dereferans (oku/yaz) | `*p` / `*p = v;` | O(1) |

<!-- Konuşma notu: Bunların her biri O(1) — bir işaretçiyi izlemek her zaman tek bir sıçrama, asla bir arama değil. -->

---

# Bir değişken, adresi, bir işaretçi

<iframe class="dsanim" src="anim/pointer-basics.html?yer=slayt&lang=tr" title="İşaretçi temelleri"></iframe>

<!-- Konuşma notu: Normal örnek: beş işlem — adres-al, üzerinden yaz, kopyala (takma ad), taşı, takma ad üzerinden ekle. -->

---

# Uç durum — bir NULL işaretçi dereferansı

<iframe class="dsanim" src="anim/pointer-basics.html?yer=slayt&lang=tr&example=null-deref" title="İşaretçi temelleri: NULL dereferansı"></iframe>

<!-- Konuşma notu: NULL bir işaretçi üzerinden yazma burada asla çalıştırılmaz — bunun yerine tanımsız davranış olarak işaretlenir. -->

---

# Kod — işaretçiler: adres, takma ad, NULL

```c
int *p = NULL, *q = NULL;
p = &v[i];
*p = val;
q = p;
*q += k;
if (r != NULL)
    *r = val;
```

<!-- Konuşma notu: q = p, DEĞERİ değil ADRESİ kopyalar — q ve p artık aynı değişkenin takma adı. -->

---

# Java: referans ile değer, yan yana

```java
int[] box = {3};
int[] alias = box;
alias[0] = 5;
int y = x;
y = 99;
```

<!-- Konuşma notu: alias, box ile AYNI dizinin ikinci adı; y ise x'in bağımsız bir KOPYASI — aynı sözdizimi, tam tersi davranış. -->

---

# İşaretçi aritmetiği: p + k, k bayt değil

`p + k` asla `k` bayt ilerlemez —
`k × sizeof(*p)` bayt ilerler. `int` 4
bayt, yani `p + 1`, 1 değil 4 bayt atlar.

<!-- Konuşma notu: Bu, dizi indekslemesinin, arr[i]'nin, derlendiği O(1) aritmetik. -->

---

# İşaretçi aritmetiği, adım adım

<iframe class="dsanim" src="anim/pointer-arithmetic.html?yer=slayt&lang=tr" title="İşaretçi aritmetiği"></iframe>

<!-- Konuşma notu: Normal örnek: bir int dizisi, beş geçerli offset. Her hesaplanan adresi ve dereferans edilen değerini izleyin. -->

---

# Uç durum — aralık dışı offsetler

<iframe class="dsanim" src="anim/pointer-arithmetic.html?yer=slayt&lang=tr&example=out-of-range" title="İşaretçi aritmetiği: aralık dışı"></iframe>

<!-- Konuşma notu: Negatif bir offset ve sondan bir sonrası, ikisi de tanımsız davranış olarak işaretlenir, hiç dereferans edilmez. -->

---

# Kod — işaretçi aritmetiği

```c
int a[N];
int *p = a;
if (k < 0 || k >= N) {
    /* aralık dışı: tanımsız davranış (UB) */
} else {
    void *addr = (void *) (p + k);
    int v = *(p + k);
}
```

<!-- Konuşma notu: Java'da işaretçi aritmetiği hiç yok — yalnızca a[k], aralık dışı bir k net bir istisna fırlatır. -->

---

# Struct'a işaretçi ve `->`

Bir `struct`, alanları tek bir değerde
gruplar. `(*p).alan` o kadar yaygın ki C
ona bir kısayol verir: `p->alan`.

<!-- Konuşma notu: Struct'a bir işaretçi, ORİJİNAL struct'a ulaşmanızı — ve onu değiştirmenizi — sağlar, bir kopyasına değil. -->

---

# Struct işaretçisi, bir diziyi gezmek

<iframe class="dsanim" src="anim/struct-pointer.html?yer=slayt&lang=tr" title="Diziyi gezen bir işaretçi"></iframe>

<!-- Konuşma notu: Normal örnek: 10 öğrenci, 2 not güncellemesi. (*p).id, p->grade ve p++'ın sizeof(Student) kadar ilerlemesini izleyin. -->

---

# Uç durum — yalnızca tek öğrenci

<iframe class="dsanim" src="anim/struct-pointer.html?yer=slayt&lang=tr&example=single-student" title="Struct işaretçisi: tek öğrenci"></iframe>

<!-- Konuşma notu: p, "dizinin hemen sonrasına" anında ulaşır — TUTMAK yasaldır, ama asla dereferans etmek değil. -->

---

# Kod — struct dizisini gezmek

```c
Student *p = students;
for (; p != students + N; p++) {
    int id = (*p).id;
    int grade = p->grade;
    p->grade = new_grade;
}
```

<!-- Konuşma notu: (*p).id ve p->id aynı değer — ok işareti yalnızca bir kısayol, başka hiçbir şey değil. -->

---

# Sık yapılan hatalar

- `int *p;`'yi hiçbir yeri göstermeden kullanmak (vahşi işaretçi)
- `int *p, x;` — yalnızca `p` işaretçi, `x` değil
- **Bildirimde** ve **ifadede** `*`'ı karıştırmak
- Java'nın istisnası, C'nin tanımsız davranışıyla aynı değil

<!-- Konuşma notu: Java her dereferansı kontrol eder ve gürültülü şekilde başarısız olur; C, kötü bir adresle donanım ne yaparsa onu yapar. -->

---

# Mini soru

`int *p = &x;` verildiğinde, `p` ile `*p`
arasındaki fark nedir?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

`p`, işaretçide saklanan **adres**tir
(x'in adresi). `*p`, o adresteki
**değer**dir (x'in değeri).

<!-- Konuşma notu: Aynı değişken, dereferans edip etmediğinize göre tamamen farklı iki soru. -->

---

# Mini soru

Java'nın neden hiç `->` operatörüne
ihtiyacı yok?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

Java'da her nesne/dizi değişkeni **zaten
bir referans** — `.` her zaman "önce izle,
sonra alana eriş" demek.

<!-- Konuşma notu: C hem . (değerler için) hem -> (işaretçiler için) ister; Java'nın yalnızca birine ihtiyacı var. -->

---

<!-- _class: bolum -->

# 5. Bellek Düzeni: Yığın, Öbek ve Kim Temizliyor

<!-- Konuşma notu: Bu, tüm dönem kullanacağınız bellekle ilgili en önemli tek gerçek. -->

---

# Başlangıç sorusu

Bir fonksiyon yerel bir dizi bildirir ve
döner. Ona ne olur? Şimdi karşılaştırın:
bir fonksiyon `malloc` yapıp serbest bırakmadan döner.

<!-- Konuşma notu: İki sorunun tamamen farklı yanıtları var — bu fark bugünün tüm konusu. -->

---

# Kısa bir tarihçe

- **Yığın (stack)** — çağrı başına bir çerçeve, Algol 60'a dayanır
- **`malloc`/`free`** — en eski Unix C kütüphaneleri, 1970'lerin başı
- **Çöp toplama (garbage collection)** — McCarthy, Lisp, **1959**
- Java (1995), çöp toplamayı günlük programlamada yaygınlaştırdı

<!-- Konuşma notu: Çöp toplama çoğu kişinin sandığından çok daha eski — Java'dan 36 yıl önce var. -->

---

# Sezgi: düzenli bir yığın ile bir depo

- **Yığın**: her çağrı bir çerçeve iter; dönüş onu çeker
- Her zaman LIFO, her zaman otomatik, her zaman hızlı
- **Öbek**: bir blok istersiniz; *geri verilene kadar* durur
- C'de bu "geri vermeyi" sizin dışınızda kimse yapmaz

<!-- Konuşma notu: Bir yığın çerçevesini itmek ya da çekmek yalnızca bir işaretçiyi taşımak — bu kadar hızlı olmasının nedeni bu. -->

---

# Yığın ile öbek, yan yana

| | Yığın (Stack) | Öbek (Heap) |
| --- | --- | --- |
| Kim ayırır | Derleyici, otomatik olarak | Siz: `malloc` (C) / `new` (Java) |
| Kim serbest bırakır | Otomatik, dönüşte | C: `free()`. Java: çöp toplayıcı |
| Hız | Son derece hızlı | Daha yavaş: boş blok bulur |

<!-- Konuşma notu: Yığın taşması, derin özyinelemenin küçük, sabit bir bölgeyi aşması; öbek çok daha büyük ama daha yavaş. -->

---

# Bir yığın çerçevesi bir öbek bloğuna nasıl bağlanır

<iframe class="dsanim" src="anim/stack-vs-heap.html?yer=slayt&lang=tr" title="Yığın çerçeveleri ile öbek bloğu"></iframe>

<!-- Konuşma notu: Normal örnek: 10 blok, düzgün sahiplenilmiş, bir kısmı serbest. main'in blocks[] sütununun her öbek satırına işaret edişini izleyin. -->

---

# Uç durum — sarkan bir işaretçi, işaretlendi

<iframe class="dsanim" src="anim/stack-vs-heap.html?yer=slayt&lang=tr&example=dangling" title="Yığın ve öbek: sarkan işaretçi"></iframe>

<!-- Konuşma notu: İkinci bir takma ad hâlâ serbest bırakılmış bir bloğun eski adresini tutuyor; onu kullanmak UB olarak işaretlenir, hiç çalıştırılmaz. -->

---

# Kod — alloc_block / free_block

```c
static int *alloc_block(int size) {
    int *p = malloc(size * sizeof(int));
    return p;
}

static void free_block(int *p) {
    free(p);
}
```

<!-- Konuşma notu: p, alloc_block'un kendi çerçevesine özel — o çerçeve çekildiğinde yalnızca DÖNDÜRÜLEN adres ayakta kalır. -->

---

# Java: `new` ve çöp toplama

C'de `free`'yi unutmak — ya da serbest
bıraktıktan sonra işaretçiyi kullanmak —
tamamen sizin sorumluluğunuzda. Java `free`'yi diliden kaldırır.

<!-- Konuşma notu: Bir nesne, çöp toplayıcı hiçbir şeyin ona ulaşamadığını kanıtlayana kadar öbekte yaşar. -->

---

# Java referansları, takma adlar, çöp toplama

<iframe class="dsanim" src="anim/java-reference-heap.html?yer=slayt&lang=tr" title="Java referansları, takma ad ve çöp toplayıcı"></iframe>

<!-- Konuşma notu: Normal örnek: bir referans zinciri, sıradan toplama. Nesnelerin erişilemez hale gelip süpürülmesini izleyin. -->

---

# Uç durum — bir döngü, yine de toplanır

<iframe class="dsanim" src="anim/java-reference-heap.html?yer=slayt&lang=tr&example=cycle" title="Java referansları: bir referans döngüsü"></iframe>

<!-- Konuşma notu: İki nesne birbirini gösteriyor, ama hiçbir kök hiçbirine ulaşamayınca ikisi de toplanır — referans sayımı değil, erişilebilirlik. -->

---

# Kod — Java referansları: takma ad ve döngü

```java
Node p = new Node();
Node q = p;
p.ref = q;
q.ref = p;
p = null;
q = null;
```

<!-- Konuşma notu: C'de tam bu örüntü sonsuza dek sızardı — C'de döngünün erişilemez olduğunu fark edecek bir çöp toplayıcı yok. -->

---

# Sık yapılan hatalar

- Sarkan işaretçi: `free`'den sonra işaretçiyi kullanmak, NULL yapmadan
- Çift serbest bırakma: aynı işaretçiyi iki kez `free` etmek
- Erken dönüşte `free`'yi unutmak (bir **sızıntı**)
- Java'nın çöp toplayıcısının sızıntıyı imkânsız kıldığını sanmak (kılmaz)

<!-- Konuşma notu: Gereksiz tuttuğunuz bir referans toplanamaz ve etkide yine "sızar". -->

---

# Önizleme: dizi düzeni ile bağlı liste düzeni

Bir dizi tek bir bitişik blok ayırır:
`arr[i]` tek bir hesap, O(1). Bağlı liste
düğümleri dağıtır, işaretçilerle bağlar.

<!-- Konuşma notu: Önümüzdeki hafta tam olarak bu bağlı yapıyı kuracaksınız — bugün yalnızca önizleme. -->

---

# Dizi ile bağlı liste düzeni, adım adım

<iframe class="dsanim" src="anim/array-vs-linked-preview.html?yer=slayt&lang=tr" title="Önizleme: dizi ve bağlı liste düzeni"></iframe>

<!-- Konuşma notu: Normal örnek: 10 değer, k = 4. Tek hesaplanan adresi, next üzerinden dört sıçramayla karşılaştırın. -->

---

# Uç durum — son eleman: en çok sıçrama

<iframe class="dsanim" src="anim/array-vs-linked-preview.html?yer=slayt&lang=tr&example=last" title="Dizi ve bağlı liste: son eleman"></iframe>

<!-- Konuşma notu: Dizi son elemana yine tek adımda ulaşır; bağlı liste baştan itibaren her tek sıçramaya ihtiyaç duyar. -->

---

# Kod — bağlı liste kurmak

```c
Node *head = NULL;
for (int i = N - 1; i >= 0; i--) {
    Node *node = malloc(sizeof(Node));
    node->data = arr[i];
    node->next = head;
    head = node;
}
```

<!-- Konuşma notu: Aynı n değer, tam ters erişim maliyeti: dizi O(1), bağlı liste O(n) — aynı veri, tamamen farklı düzen. -->

---

# Mini soru

Bir fonksiyon yerel olarak `int arr[100];`
bildiriyor ve ona bir işaretçi döndürüyor. Sorun ne?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

`arr`, o çerçevede **yığında** yaşar.
Fonksiyon döner dönmez çerçeve çekilir —
işaretçi çoktan sarkan hale gelmiştir.

<!-- Konuşma notu: Çözüm: bunun yerine malloc ile ayırın, böylece bellek fonksiyon dönse de hayatta kalır. -->

---

# Mini soru

`free(block); block = NULL;` — bu sırayla
— neden önemli?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

`free`, gerçek adrese ihtiyaç duyar. Önce
NULL yapmak `free(NULL)`'ı etkisiz bırakır
— blok sızar, adresi sonsuza dek kaybolur.

<!-- Konuşma notu: Sıra bir stil tercihi değil — tersine çevirmek sessizce bir bellek sızıntısı yaratır. -->

---

# Mini soru

Sarkan bir işaretçi Java'da neden C'deki
gibi asla oluşamaz?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

Java'da `free` yok: bir nesne yalnızca
çöp toplayıcı hiçbir şeyin ulaşamadığını
kanıtlayınca geri alınır — erişilebilirken asla.

<!-- Konuşma notu: Erişilebilir bir referansın çoktan geri alınmış belleği gösterdiği bir an asla yok. -->

---

<!-- _class: bolum -->

# 6. ASN.1, BER TLV ve PER TLV

<!-- Konuşma notu: İki tamamen farklı program, bayt bayt, yapılandırılmış bir kayıt üzerinde nasıl anlaşır? -->

---

# Başlangıç sorusu

İki program, farklı diller, farklı
makineler, bir kaydı bayt olarak değişir.
Ham bir `struct` düzeni hiç taşınabilir değil.

<!-- Konuşma notu: Derleyici, platform ve dolgu kuralları bir struct'ın tam bayt düzenini etkiler — iki tarafın da anlaştığı bir şey gerekiyor. -->

---

# Kısa bir tarihçe

- **1984** — ASN.1, ITU-T/CCITT X.409 olarak doğar
- **1995** — X.680 serisi: modern, güncel biçim
- **BER** (X.690) — kendini tanımlayan etiket + uzunluk + değer
- **PER** (X.691, 1994) — iki taraf şemayı bilince bit bit paketler

<!-- Konuşma notu: BER'li ASN.1, HTTPS'in temeli olan X.509 sertifikalarının, LDAP'ın ve SNMP'nin altında görünmez biçimde hâlâ duruyor. -->

---

# Sezgi: bir zarf, üç parça

- **Etiket (Tag)**: bu ne tür bir değer?
- **Uzunluk (Length)**: kaç bayt tutuyor?
- **Değer (Value)**: içeriğin kendisi
- Evrensel olarak **TLV** denir

<!-- Konuşma notu: Kaydınızı hiç görmemiş bir çözücü bile onu doğru gezebilir: etiketi oku, uzunluğu oku, o kadar baytı atla, tekrarla. -->

---

# TLV bayt düzeni

| Parça | Boyut | Neyi kodlar |
| --- | --- | --- |
| Etiket | 1 bayt | sınıf · ilkel/kurulu · etiket numarası |
| Uzunluk | 1+ bayt | kısa biçim (0–127) ya da uzun biçim (≥128) |
| Değer | Uzunluk bayt | içerik ya da iç içe TLV'ler |

<!-- Konuşma notu: INTEGER etiket 0x02, UTF8String etiket 0x0C, SEQUENCE etiket 0x30 — gerçek ASN.1 evrensel sınıf numaraları. -->

---

# TLV kodlama, alan alan

<iframe class="dsanim" src="anim/tlv-encoding.html?yer=slayt&lang=tr" title="TLV kodlama"></iframe>

<!-- Konuşma notu: Normal örnek: 10 alan — tamsayılar, kısa metinler, mantıksal değerler — her biri Etiket, Uzunluk, Değer oluyor. -->

---

# Uç durum — uzun biçim gerektiren bir uzunluk

<iframe class="dsanim" src="anim/tlv-encoding.html?yer=slayt&lang=tr&example=long-value" title="TLV kodlama: uzun biçim"></iframe>

<!-- Konuşma notu: 300 karakterlik bir metnin uzunluğu artık tek bayta sığmıyor — uzun biçim yalnızca "kaç tane" demek için fazladan bayt harcıyor. -->

---

# Kod — encode_length: kısa ve uzun biçim

```c
if (len < 128) {
    out[0] = (unsigned char) len;
    return 1;
}
int n = 0;
while (len > 0) {
    tmp[n++] = (unsigned char) (len & 0xFF);
    len >>= 8;
}
out[0] = (unsigned char) (0x80 | n);
```

<!-- Konuşma notu: Kısa biçim tek bayt; uzun biçimde en üst bit "sıradaki n bayt UZUNLUĞUN kendisi" demek. -->

---

# BER ile PER

| | BER | PER |
| --- | --- | --- |
| Kendini tanımlar | Evet: her alanda etiket + uzunluk | Hayır: şema bilinmeli |
| Boyut | Daha büyük: alan başına 2+ bayt | Çok daha küçük: bayt değil bit |
| Tipik kullanım | X.509, LDAP, SNMP | Bant genişliği kritik (hücresel) |

<!-- Konuşma notu: İkisi de aynı soyut bilgiyi kodlar — BER boyutu kendini tanımlamaya, PER de tersini feda eder. -->

---

# PER: tam olarak gerektiği kadar bit

İki taraf bir alanın `[min, max]`
aralığını biliyorsa, ne etiket ne uzunluk
gerekir — yalnızca `ceil(log2(max - min + 1))` bit.

<!-- Konuşma notu: BER ile aynı türden kayıt, bu kez bayt bayt değil bit bit paketleniyor. -->

---

# PER kodlama, bit bit

<iframe class="dsanim" src="anim/per-encoding.html?yer=slayt&lang=tr" title="PER tarzı bit paketleme"></iframe>

<!-- Konuşma notu: Normal örnek: 10 alan — isim harfleri, bir yaş, birkaç kısıtlı sayı — birkaç bayta paketlendi. -->

---

# Uç durum — büyüklüğü 1 olan bir aralık: sıfır bit

<iframe class="dsanim" src="anim/per-encoding.html?yer=slayt&lang=tr&example=range-size-one" title="PER: büyüklüğü 1 olan aralık"></iframe>

<!-- Konuşma notu: min, max'a eşitken olası tek bir değer var — alıcı bunu zaten biliyor, bu yüzden HİÇBİR ŞEY gönderilmiyor. -->

---

# Kod — pack_bits: bir seferde bir bit

```c
int bit = (int) ((value >> i) & 1u);
int byte_index = *bitpos / 8;
int bit_index = 7 - (*bitpos % 8);
/* if (bit) buf[byte_index] |= bit (en anlamlıdan) */
(*bitpos)++;
```

<!-- Konuşma notu: PER çıktısı yalnızca en sonda bayta hizalanır, alan alan değil — bitler birbirine sıkı sıkıya yaslanır. -->

---

# Sık yapılan hatalar

- Uzunluk önekini unutup sabit bir okumanın işe yarayacağını ummak
- Uzunluğun her zaman tek bayta sığacağını sanmak (yalnız 128'in altı)
- Uzunluğu (yalnız V) tüm TLV'nin boyutuyla karıştırmak
- BER ve PER baytlarını birbirinin yerine geçer sanmak

<!-- Konuşma notu: Bir PER çözücü BER baytlarını okuyamaz, ya da tersi — aynı şema için iki farklı bayt biçimi. -->

---

# Mini soru

TLV'deki üç harf neyin kısaltması, ve
hangi sırayla gelirler?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

**Tag, Length, Value** — tam olarak bu
sırayla: ne tür, kaç bayt, sonra baytların
kendisi.

<!-- Konuşma notu: Bir çözücü asla bir boyutu tahmin etmek zorunda kalmaz — uzunluk öneki her zaman tam olarak söyler. -->

---

# Mini soru

SEQUENCE'in etiket baytı neden `0x10`
değil (16 sayısının ikilik hâli), `0x30`?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

En üst 3 bit etiket numarası değil: 2
sınıf biti (`00`) + 1 kurulu bit (`1`,
SEQUENCE başka TLV'ler tuttuğu için) = `0x30`.

<!-- Konuşma notu: İkilikte 00 1 10000, tam olarak 0x30 — kurulu bit, 0x10'u 0x30'a çeviren şey. -->

---

<!-- _class: bolum -->

# 7. Uygulamalı Atölye: C Araç Zinciri

<!-- Konuşma notu: Bugünkü her fikir, derlenip çalışana kadar değersiz — bu bölüm tüm dönem için akışı bir kez kuruyor. -->

---

# Bu neden önemli

Bundan sonra her hafta size kendi
kuracağınız C ve Java programları veriyor.
Vize projesi, kısmen temiz bir derlemeyle değerlendiriliyor.

<!-- Konuşma notu: Bu atölye, tüm dönem tekrarlayacağınız akışı bir kez kuruyor: derle, çalıştır, hata ayıkla. -->

---

# Araç zinciri, kısaca

- **GCC** — Richard Stallman, GNU projesi, **1987**
- **GDB** — aynı GNU projesi, **1986**: adım adım gez, incele
- **CMake** — elinizdeki her araç için derleme dosyaları üretir
- Aynı `CMakeLists.txt`, Windows, WSL ve Linux'ta derlenir

<!-- Konuşma notu: Bir derleyici kaynağı makine koduna çevirir; bir bağlayıcı bunu C standart kütüphanesiyle birleştirir. -->

---

# Kod — ilk derlemeniz

```c
#include <stdio.h>

int main(void) {
    printf("Hello, Data Structures!\n");
    return 0;
}
```

`gcc -std=c11 -Wall -Wextra -o /tmp/x hello_workshop.c && /tmp/x`

<!-- Konuşma notu: gcc, hello_workshop.c'yi x'e derler; && yalnızca derleme başarılıysa çalıştırır. -->

---

# Uyarıları açık derleyip okumak

`-Wall -Wextra`, kullanılmayan
değişkenleri, şüpheli karşılaştırmaları,
biçim uyuşmazlıklarını yakalar. Her program **temiz** derlenmeli.

<!-- Konuşma notu: Bir uyarı, derleyicinin muhtemelen bir hata olduğunu, çalışma zamanında zor yoldan öğrenmeden önce söylemesidir. -->

---

# Küçük bir hata avı

```c
int average_buggy(const int arr[], int n) {
    if (n == 0) return 0;
    int sum = 0;
    for (int i = 0; i < n; i++)
        sum = sum + arr[i];
    return sum / n;
}
```

<!-- Konuşma notu: Yazdırdığı ortalama yanlış — sum ve n doğru görünüyor, ama son satırdaki bir şey değil. -->

---

# gdb ile bulmak

Yöntem: bir kesme noktası koy, çalıştır,
bir değişkeni incele, bir hipotezi doğrula
ya da çürüt. Canlı, adım adım izleyin.

<!-- Konuşma notu: Bu yöntem, şimdi bulacağımızdan çok daha ince hatalara ölçeklenir. -->

---

# Hata ayıklayıcıda adım adım, canlı

<iframe class="dsanim" src="anim/debugger-stepping.html?yer=slayt&lang=tr" title="Hata ayıklayıcıda adım adım"></iframe>

<!-- Konuşma notu: Normal örnek: 10 eleman. İzleme panelinde i, sum ve n'yi adımlarken, sonra sum / n'yi yazdırırken izleyin. -->

---

# Uç durum — boş dizi koruması

<iframe class="dsanim" src="anim/debugger-stepping.html?yer=slayt&lang=tr&example=empty" title="Hata ayıklayıcı: boş dizi"></iframe>

<!-- Konuşma notu: n == 0, programı tam koruma satırında durdurur — sıfıra bölmek tanımsız davranış olurdu. -->

---

# gdb oturumu

```console
(gdb) break debug_average.c:11
(gdb) run
(gdb) print sum
(gdb) print sum / n
(gdb) print (double) sum / n
(gdb) continue
```

<!-- Konuşma notu: sum/n 7 verir (tam sayı bölmesi); (double) sum/n gerçek yanıtı, 7.666...'yı verir — hata yalnızca son bölmedeydi. -->

---

# Kod — CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.20)
project(week1_cmake_demo C)
add_executable(week1_cmake_demo main.c)
```

`cmake -S . -B build && cmake --build build`

<!-- Konuşma notu: İlk komut YAPILANDIRIR: CMakeLists.txt'yi okur, derleyiciyi kontrol eder. İkincisi DERLER: derler ve bağlar. -->

---

# Visual Studio üzerine bir not

Build → Build Solution derler; Debug →
Start Debugging (F5) hata ayıklayıcı altında
çalıştırır; kenar boşluğuna tıklamak kesme noktası koyar.

<!-- Konuşma notu: Visual Studio bir CMakeLists.txt'yi doğrudan açabilir — bir önceki slayttaki aynı dosya değişmeden çalışır. -->

---

# Sık yapılan hatalar

- `-std=c11`'i unutmak: makineye göre farklı davranış
- Git'e bir `build/` klasörü ya da `.exe` dosyaları eklemek
- Başarısız bir derlemeden sonra eski bir çalıştırılabiliri koşturmak
- Yalnızca `printf`'e sarılmak, iki dakikalık bir gdb oturumuna hiç değil

<!-- Konuşma notu: Çalıştırmayı her zaman && ile zincirleyin, böylece başarısız bir derleme sizi yanlışlıkla dünkü ikiliği çalıştırmaz. -->

---

# Mini soru

`-Wall -Wextra` ne yapar, ve bu ders neden
onun altında temiz bir derleme istiyor?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

Geniş bir uyarı kümesini açar. Genelde
gerçek hataları gösterir — temiz bir
derleme istemek onları hemen düzeltir.

<!-- Konuşma notu: Sonradan, çalışma zamanında, zor yoldan keşfedilmeden. -->

---

# Mini soru

`cmake -S . -B build` ile `cmake --build
build` her biri ne yapar, arada ne fark var?

<!-- Konuşma notu: Sınıfın cevaplamasını bekleyin, sonra ilerleyin. -->

---

# Yanıt

İlki **yapılandırır**: derleme dosyaları
üretir, hiçbir şey derlemez. İkincisi
**derler**: o aracı çağırıp derler ve bağlar.

<!-- Konuşma notu: Yapılandırma genelde bir kez, derleme kaynağı her değiştirdiğinizde. -->

---

# Özet — dönemin temelleri

| Fikir | Ana gerçek |
| --- | --- |
| Veri yapısı | Bilinen, çözümlenebilir maliyet — her zaman bir ödünleşim |
| Doğrusal / doğrusal olmayan | Bir "sonraki" ya da belki birden çok |
| Big-O | Büyümenin üst sınırı; en büyük terimi oku |
| Alan karmaşıklığı | Aynı fikir, ek bellek için uygulandı |

<!-- Konuşma notu: Sonraki her hafta bir yapı daha ekliyor, tam olarak bu aynı araçlarla değerlendirilerek. -->

---

# Özet — bellek ve kodlama

| Fikir | Ana gerçek |
| --- | --- |
| İşaretçi / referans | Bir adres tutar; `&`, `*`, `->` |
| Yığın / öbek | Otomatik, LIFO / istenip açıkça bırakılan |
| TLV / BER / PER | Kendini tanımlayan baytlar, ya da şemayla paketlenen bitler |
| C araç zinciri | `gcc`, `gdb`, CMake — derle, çalıştır, hata ayıkla |

<!-- Konuşma notu: İşaretçiler, yığın ve öbek, sonraki her haftanın sizde zaten var saydığı bellek resmi. -->

---

# Büyük resim

Bugün kurulan iki araç — maliyeti ölçmek
için **Big-O**, ve bir **bellek** resmi —
dönemin geri kalanındaki her yapıyı değerlendiriyor.

<!-- Konuşma notu: Bir öğrenci bugünden yalnızca tek bir cümle hatırlayacaksa, hatırlanmaya değer olan bu. -->

---

# Öz-değerlendirme turu

Beş kısa soru. Yanıt gelmeden önce
düşünün. Tam alıştırmalar ve on soruluk
bir quiz hafta notlarında.

<!-- Konuşma notu: Bunlar, yazılı notların sonundaki öz-değerlendirme quizini yansıtıyor, burada slayt başına bir soru, daha kısa bir küme. -->

---

# 1. İki farklı, doğru algoritma neden çok farklı Big-O'ya sahip olabilir?

<!-- Konuşma notu: Sorun, bekleyin, sonra ilerleyin. -->

---

# Big-O *adım sayısını* ölçer, yanıtın doğru olup olmadığını değil

Doğrusal arama ve ikili arama, bir değeri
sırasıyla O(n) ve O(log n)'de, ikisi de doğru bulur.

<!-- Konuşma notu: Doğruluk ve maliyet tamamen ayrı iki soru. -->

---

# 2. Şunları hızlıdan yavaşa sıralayın: O(n log n), O(1), O(n), O(log n), O(n²)

<!-- Konuşma notu: Sorun, bekleyin, sonra ilerleyin. -->

---

# O(1) < O(log n) < O(n) < O(n log n) < O(n²)

<!-- Konuşma notu: Bu tam sıra, dönemin geri kalanında her hafta tekrar geliyor. -->

---

# 3. İkili arama neden sıralı bir dizi gerektirir?

<!-- Konuşma notu: Sorun, bekleyin, sonra ilerleyin. -->

---

# Ortayla karşılaştırmak, yalnızca bir taraf küçük diğeri büyük garantiliyse işe yarar

Bu garanti tam olarak "sıralı" demek.
Doğrusal arama hiçbir sıraya güvenmez.

<!-- Konuşma notu: Sıralı düzen olmadan, bir yarıyı atmak bir garanti değil, bir tahmin olurdu. -->

---

# 4. Bir BER TLV kodlamasında Uzunluk alanı gerçekte neyi sayar?

<!-- Konuşma notu: Sorun, bekleyin, sonra ilerleyin. -->

---

# Hemen ardından gelen Değer'deki baytları — tüm TLV'nin boyutunu değil

SEQUENCE örneğinde Uzunluk = 8'di, ama
kodlanmış SEQUENCE'in tamamı 10 bayttı.

<!-- Konuşma notu: Uzunluk, Etiket baytını ya da kendi Uzunluk bayt(lar)ını asla saymaz. -->

---

# 5. `p->x` neden var, ve neyin kısaltması?

<!-- Konuşma notu: Sorun, bekleyin, sonra ilerleyin. -->

---

# `p->x`, `(*p).x`'in kısaltması: önce dereferans, sonra alana eriş

Bu tam kombinasyon C kodunda o kadar
yaygın ki var olma nedeni bu.

<!-- Konuşma notu: Önce-dereferans-sonra-eriş o kadar sık bir örüntü ki C ona kendi operatörünü verdi. -->

---

<!-- _class: baslik -->

# Önümüzdeki hafta

**Hafta 2 — Bağlı Listeler**

Bugün tanıştığınız işaretçilerle bağlanan,
bugünün öbeğinde yaşayan, tek tek ayrılmış
düğümlerden bir zincir kurun.

<!-- Konuşma notu: Bugünün önizlemesindeki O(1)-her-yere-ekleme, O(n)-erişim ödünleşimi, artık tam olarak: ekleme, silme, gezinme, ölçülmüş. -->

---

# Kaynaklar (1/2)

- Ders izlencesi, Hafta 1: `CEN207-2026-2027-Guz-Izlence.tr.md`
- Knuth. *The Art of Computer Programming, Cilt 1*, 3. baskı
- Liskov, Zilles. "Programming with Abstract Data Types," 1974
- Knuth. "Big Omicron and Big Omega and Big Theta," 1976
- Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms*, 3. baskı

<!-- Konuşma notu: Bunlar, haftanın yazılı notlarının sonunda listelenen aynı kaynaklar. -->

---

# Kaynaklar (2/2)

- Sedgewick, Wayne. *Algorithms*, 4. baskı
- Kernighan, Ritchie. *The C Programming Language*, 2. baskı
- Liang. *Introduction to Java Programming*, 10. baskı
- ITU-T X.680 / X.690 / X.691 — ASN.1, BER, PER
- GNU (GCC, GDB) ve Kitware (CMake) belgeleri

<!-- Konuşma notu: Tarihsel kaynaklar — Bachmann, Landau, Knuth, Liskov — bugünün "kısa tarihçe" slaytlarının dayandığı kaynaklar. -->
