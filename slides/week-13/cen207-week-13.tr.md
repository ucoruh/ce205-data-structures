---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Hafta 13 — Dosya Organizasyonu I: Sıralı ve Doğrudan Dosyalar"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Hafta 13"
footer: "RTEÜ Bilgisayar Mühendisliği · 2026-2027 Güz"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Dosya Organizasyonu I: Sıralı ve Doğrudan Dosyalar

**CEN207 Veri Yapıları — Hafta 13**

Dr. Öğr. Üyesi Uğur CORUH · 2026-2027 Güz

<!--
Konuşma notu: Şimdiye kadarki her yapı RAM'de yaşadı. Bu hafta diske geçiyoruz; önemli olan birim artık bir karşılaştırma değil, bir blok okuma.
-->

---

# Bugünün planı (3 saat)

| Saat | Konu |
| --- | --- |
| 1 | Bloklar, kayıt/alanlar **Anim 1** · bloklama çarpanı **Anim 2** · sıralı arama **Anim 3** |
| 2 | Sıralı dosyada ikili arama **Anim 4** · sıralı güncelleme/birleştirme **Anim 5** |
| 3 | Göreli erişim **Anim 6** · kovalara hash'leme **Anim 7** · ilerleyici taşma **Anim 8** · mezar taşları **Anim 9** |

**Öğrenme çıktıları:** LO.1 (temel veri yapılarını açıklama) · LO.2 (karmaşıklık analizi) · LO.6 (C ve Java'da doğru uygulama) · LO.7 (doğru yapıyı seçme)

<!-- Konuşma notu: Dokuz kısa animasyon tüm dersi taşır; her fikir, tanıtıldığı yerde bir normal ve bir uç/zor çalıştırma alır. -->

---

# Bu haftanın kavramları — nerede

| Kavram | Nerede |
| --- | --- |
| Kayıt/alanlar, bloklama çarpanı | Bölüm 2–3 |
| Sıralı arama, sıralı dosyada ikili arama | Bölüm 4–5 |
| Sıralı güncelleme (ana + işlem birleştirme) | Bölüm 6 |
| Göreli (doğrudan) erişim | Bölüm 7 |
| Kovalara hash'leme, ilerleyici taşma, mezar taşları | Bölüm 8–10 |

<!-- Konuşma notu: Her terim ilk geçtiği yerde tam olarak tanımlanır; bu tablo yalnız onu tekrar nerede bulacağınızı söyler. -->

---

# Kod örnekleri nasıl çalışır

- Her fikrin eksiksiz bir **C** ve **Java** programı var
- İkisi de gerçek dosya G/Ç yapar: `fopen`/`fseek`/`fread`/`fwrite`, `RandomAccessFile`
- Her program kendi **geçici lab klasörünü** oluşturur, sonra siler
- Kaynaklar: `code/week-13/c/` ve `code/week-13/java/`
- Her programın beklenen çıktısı hafta notlarında var

<!-- Konuşma notu: Canlı çalıştırmak isterseniz şimdi bir terminal açın; her program kendi geçici klasörünü işletim sisteminin temp dizininde oluşturur, asla depo içinde değil. -->

---

# Hatırlatma — hesaplanan adresler (Hafta 1)

- `arr[i]` = `base_address + i * element_size`
- `i` indeksine ulaşmak için **arama** gerekmez — yalnız aritmetik
- Bölüm 7'nin göreli dosyası tam olarak bu fikrin diske taşınmış hali
- `block = rrn / bf`, `offset = rrn % bf` — aynı hesaplanan-adres fikri

<!-- Konuşma notu: Bu hafta tekrar tekrar aynı temaya dönüyor — verinin yerleşimi izin verdiğinde bir aramayı bir hesaplamayla değiştirmek. -->

---

# Hatırlatma — hash'leme ve çakışmalar (Hafta 6)

- `h(key) = key mod m`, RAM'de bir hücre seçer
- Çakışmalar **zincirleme** ya da **açık adresleme** ile çözülür
- Bölüm 8–10, her iki fikri de mantığında değişmeden yeniden kullanır
- Tek fark: her "hücre" artık bir disk konumu

<!-- Konuşma notu: Hafta 6'nın hash tablosunu anladıysanız, bölüm 8-10 aynı tablo, yalnız RAM'den bir adım uzakta. -->

---

# Gerçekten yeni olan tek fikir

- Hafta 1–12: maliyet = **karşılaştırmalar**, takaslar, işaretçi atlamaları
- Bu hafta: maliyet = **blok okuma ve yazmalar**
- Bir blok okuma, herhangi bir RAM işleminden kat kat pahalıdır
- Zaten RAM'deki fazladan kayıtları karşılaştırmak neredeyse bedavadır

<!-- Konuşma notu: Neyi saydığınızdaki bu tek kayma, tüm haftanın düzenleyici fikridir — her şey buradan gelir. -->

---

# Haftanın haritası — genel bakış

| Aile | Bölümler |
| --- | --- |
| Temeller | Kayıt/alanlar (2), bloklama çarpanı (3) |
| Sıralı — **sırayla** işle | Arama (4), sıralı arama (5), güncelleme (6) |
| Doğrudan — konumu **hesapla** | Göreli (7), hash'leme (8–10) |

<!-- Konuşma notu: Buradaki her kutu aşağıda kendi bölümünü alır, her biri bir animasyon, gerçek bir program ve karmaşıklık/hata tartışmasıyla. -->

---

<!-- _class: bolum -->

# 1. Dosyalar Neden Farklıdır: Blok Yönelimli G/Ç

<!-- Konuşma notu: Bölüm 1'in kendi animasyonu yok — bu haftanın geri kalanının yeniden kullandığı çizim kuralını ve maliyet modelini kurar. -->

---

# Başlangıç sorusu

Bir dosya genellikle RAM'e hiç sığmaz. Bir
program 20 baytlık bir kayıt istiyorsa, disk
neden yalnız 20 baytı vermez?

<!-- Konuşma notu: Cevap bir donanım ve dosya sistemi gerçeğidir, hiçbir programın vazgeçebileceği bir tasarım seçimi değil. -->

---

# Fikir: bir blok, G/Ç'nin en küçük birimidir

- Diskler sabit boyutlu **bloklara** organize edilir
- Her okuma/yazma **tam bir blok** aktarır, asla daha azını
- 20 baytlık bir istek bile çevresindeki tüm bloğu yükler
- Dosya organizasyonunun bir konu olarak var olma nedeni tam olarak bu

<!-- Konuşma notu: Bu haftaki her teknik, gerçekte blok okuma ve yazma sayısını en aza indirme stratejisidir. -->

---

# Bu haftanın çizim kuralı

- Bir **disk** satırı: adlı, numaralı bloklar, içerikleri içlerinde çizili
- Bir **RAM tamponu** satırı: şu an yüklü tek blok
- Sağda sayılan **blok okumaları** ve **blok yazmaları**
- Bu sayı, bu haftanın `O(...)`'sudur — anahtarlara değil, ona bakın

<!-- Konuşma notu: Bu hafta her tek animasyon tam olarak bu düzeni kullanır — birini okuyabilirseniz, dokuzunu da okuyabilirsiniz. -->

---

# İki aile, bir hafta

| Aile | Bir kaydı bulma |
| --- | --- |
| **Sıralı** (bölüm 4–6) | Blokları sırayla oku, ya da ortadaki bloğa atla |
| **Doğrudan** (bölüm 7–10) | Bir hesaplama, sonra bir blok okuma |

Sıralı, **her** kaydı zaten işleyecekseniz kazanır; doğrudan, milyonlarca kayıt arasından **tek** bir kayıt için kazanır.

<!-- Konuşma notu: Gerçek sistemler çoğu zaman ikisini birden kullanır — toplu işler için sıralı bir dosya, etkileşimli aramalar için hash'lenmiş bir dosya. -->

---

# Mini soru

Sıralı bir arama 100 blok okuyor, blok
başına 1 anahtar karşılaştırıyor. İkinci bir
dosya 100 blok okuyor, blok başına 1000
anahtar karşılaştırıyor. Hangisi daha hızlı?

<!-- Konuşma notu: Burada gerçekte neyin zaman aldığını düşünün — karşılaştırmalar mı, disk erişimleri mi? -->

---

# Yanıt

**Hiçbiri — neredeyse aynı maliyet.** Disk
erişimi baskındır; zaten yüklü bir bloktaki
fazladan anahtarları karşılaştırmak neredeyse
bedavadır.

<!-- Konuşma notu: Bu, buradan sonraki her bölümün neden karşılaştırma değil blok okuma saydığının tam nedenidir. -->

---

<!-- _class: bolum -->

# 2. Kayıt ve Alanlar

<!-- Konuşma notu: Bölüm 2, bir kaydın birkaç alanını baytlara paketlemek — ve okurken tekrar açmakla ilgili. -->

---

# Başlangıç sorusu

Bir ad alanı "Al" ya da "Christopherson"
tutabilir. Her kayıt, gerçek uzunluğundan
bağımsız olarak aynı sayıda bayt mı ayırmalı?

<!-- Konuşma notu: Aşağıdaki üç cevap, boşa giden yer ile ayrıştırma maliyetini birbirine karşı takas eder ve hiçbiri bedava değildir. -->

---

# Aynı alan için üç yerleşim

| Yerleşim | Nasıl | Maliyet |
| --- | --- | --- |
| Sabit uzunluk | `NAME_FIXED`'e doldur ya da **kırp** | Boşa giden yer ya da kayıp veri |
| Sınırlandırılmış | Değeri yaz, sonra bir sınırlayıcı bayt | Sınırlayıcıyı bulmak için tarama |
| Uzunluk önekli | Uzunluk baytı yaz, sonra o kadar bayt | O(1) okuma, en çok 255 uzunluk |

<!-- Konuşma notu: Sabit uzunluk boşa giden ya da kayıp baytlarla öder; sınırlandırılmış bir taramayla öder; uzunluk önekli sert bir boyut sınırıyla öder. -->

---

# Sabit uzunluk neden en çok önemlidir

- Her kayıt **tam olarak aynı boyutta**
- Bir konumdan adres hesaplamayı mümkün kılan tam olarak bu
- Bölüm 3 (bloklama) ve bölüm 7 (doğrudan erişim) ikisi de bunu ister
- Sınırlandırılmış/uzunluk önekli kayıtlar bu şekilde bulunamaz

<!-- Konuşma notu: Bu, haftanın geri kalanını kateden "ara yerine hesapla" temasının tohumudur. -->

---

# Benzetme — bir formdaki "ad" kutusu

- Bir kağıt formun ad kutusu sayfada **sabit** boyutta
- Bir e-tablo hücresi ne yazarsanız yazın **büyür** — sınırlandırılmış
- Bir kargo etiketi önce bir uzunluk basar, sonra o kadar karakter
- Üçü de gerçek sistemlerde var, tam olarak bu takaslar için

<!-- Konuşma notu: Bu üçünden hiçbiri genel olarak "doğru olan" değildir — doğru seçim tamamen kayıtların sabit, hesaplanabilir bir boyuta ihtiyacı olup olmadığına bağlıdır. -->

---

# Kayıt ve alanlar, adım adım

<iframe class="dsanim" src="anim/records-and-fields.html?yer=slayt&lang=tr" title="Kayıt ve alanlar"></iframe>

<!-- Konuşma notu: Normal örnek: 11 kayıt, `NAME_FIXED=8` — hangi adların doldurulduğunu, hangilerinin sessizce kırpıldığını izleyin. -->

---

# Uç durum — 8 karakterden uzun her ad

<iframe class="dsanim" src="anim/records-and-fields.html?yer=slayt&lang=tr&example=edge-all-truncated" title="Kayıt ve alanlar: tümü kırpıldı"></iframe>

<!-- Konuşma notu: Burada sabit yerleşimde her tek kayıt veri kaybediyor — bu teknik için en kötü durum, bilerek maksimuma çıkarılmış. -->

---

# Uç durum — boş bir ad ve çok uzun bir ad

<iframe class="dsanim" src="anim/records-and-fields.html?yer=slayt&lang=tr&example=edge-empty-and-long" title="Kayıt ve alanlar: boş ve uzun"></iframe>

<!-- Konuşma notu: Boş bir ad sabit yerleşimde tamamen doldurulur, sınırlandırılmış yerleşimde sıfır bayt tutar — aynı uç durumu ele almanın iki çok farklı yolu. -->

---

# Kod — sabit uzunluk: doldur ya da kırp

```c
#define NAME_FIXED 8

int n = (int) strlen(name);
if (n >= NAME_FIXED) {
    /* too long: truncate, data is LOST */
    memcpy(r.name, name, NAME_FIXED);
} else {
    memcpy(r.name, name, n);
    /* pad with filler bytes */
    memset(r.name + n, '_', NAME_FIXED - n);
}
```

<!-- Konuşma notu: Kırpma, program bunu bildirmeye karar vermedikçe sessizdir — yukarıdaki kod özellikle bu nedenle bir kayıt kırpıldığında uyarı basar. -->

---

# Kod — uzunluk önekli: geri okuması O(1)

```c
unsigned char len =
    (unsigned char) strlen(name);
fwrite(&len, 1, 1, fp);   /* 1-byte prefix */
fwrite(name, 1, len, fp);

/* reading back: read len, then read
   exactly len more bytes — no scanning */
```

<!-- Konuşma notu: Hiç sınırlayıcı karaktere gerek yok, adın içinde yasaklanması gereken hiçbir karakter yok — takas 255 baytlık bir uzunluk sınırı. -->

---

# Karmaşıklık

- Bir alanı yazmak/okumak: her üç yerleşimde de **O(alan uzunluğu)**
- Fark **asimptotik değil**
- Boşa giden yer (sabit) ile ayrıştırma maliyeti (sınırlandırılmış) ile hiçbiri (uzunluk önekli, 255 sınırıyla) arasında

<!-- Konuşma notu: Bu, bu dönem ilginç takasın hiç büyük-O'da olmadığı ender durumlardan biri. -->

---

# Yaygın hatalar

- Tam ya da kırpılmış sabit bir alanın **`'\0'` için yer olmadığını** unutmak
- Verinin içinde yasal olarak görünebilecek bir sınırlayıcı seçmek
- Veri kaybını bildirmek yerine **sessizce** kırpmak

<!-- Konuşma notu: Bir addaki virgül gibi bir sınırlayıcı, gerçek bir ad yasal olarak virgül içerdiği anda bozulur — uzunluk önekleme bu hata sınıfını tamamen aşar. -->

---

# Mini soru

Uzunluk önekli bir alanın okuma maliyeti
neden O(1) artı kendi uzunluğu iken,
sınırlandırılmış bir alanınki tam bir tarama?

<!-- Konuşma notu: Okuyucunun alanın içeriğini okumaya başlamadan ÖNCE hangi bilgiye sahip olduğunu düşünün. -->

---

# Yanıt

**Uzunluk önekli okuyucuya boyut önceden
söylenir** (bir bayt, sonra o kadar bayt).
Sınırlandırılmış bir okuyucu, sonu bulmak için
bayt bayt sınırlayıcıyla karşılaştırmalıdır.

<!-- Konuşma notu: Uzunluk önekli düzenin bir baytlık ek yükü, bir taramanın önceden asla sahip olamayacağı bir kesinlik satın alır. -->

---

<!-- _class: bolum -->

# 3. Bloklama Çarpanı

<!-- Konuşma notu: Bölüm 3, bölüm 1'in açık bıraktığı bir soruyu yanıtlar — kaç kayıt gerçekten bir disk erişimini paylaşır? -->

---

# Başlangıç sorusu

Bir blok 100 bayt; bir kayıt 20 bayt. Disk
her okumada 80 bayt mı israf ediyor, yoksa
birkaç kayıt bir bloğu paylaşabilir mi?

<!-- Konuşma notu: Cevap bloklama çarpanıdır — ve israfı ortadan kaldırmaz, yalnız nerede olduğunu değiştirir. -->

---

# Fikir: bloğa `bf` kayıt sığdırmak

- `bf = floor(blockSize / recSize)`
- Kayıtlar küçük bir **RAM tamponunu** birer birer doldurur
- Tampon `bf` kayda ulaştığı an: **tek** bir `fwrite`
- Disk erişimi **kayıt başına değil, blok başına** olur

<!-- Konuşma notu: Bloklamanın tüm kazancı bu — bf kayıt, bf ayrı erişim yerine tek bir disk erişimi fiyatına. -->

---

# İki tür israf

| Tür | Nerede | Neden |
| --- | --- | --- |
| İç parçalanma | Her **tam** blok | `bf * recSize`, `blockSize`'a nadiren tam eşit |
| Son blok israfı | Yalnız **son** blok | Kayıt sayısı `bf`'in tam katı değil |

<!-- Konuşma notu: Kısmi bir son blok diskte yine de tam bir blok kaplar — block_flush yine de yazar, israf dahil. -->

---

# Benzetme — bisikletli kurye değil, nakliye kamyonu

- Bisikletli kurye seferde **bir** paket taşır: yavaş, tek tek
- Nakliye kamyonu seferde `bf` kutu taşır: aynı kutu, az sefer
- Yarı boş çıkan bir kamyon yine de tam sefer yakıtı yakar
- O "yarı boş sefer" tam olarak bu bölümün son blok israfı

<!-- Konuşma notu: Kamyon benzetmesi iki tür israfı da somutlaştırır: sefer başına kullanılmayan kargo alanı, ve çok az kargo için yapılan bir sefer. -->

---

# Bloklama çarpanı, adım adım

<iframe class="dsanim" src="anim/blocking-factor.html?yer=slayt&lang=tr" title="Bloklama çarpanı"></iframe>

<!-- Konuşma notu: RAM tamponunun bf'e dolmasını, tek bir blok yazma olarak flush edilmesini, sonra bir sonraki blok için boş başlamasını izleyin. -->

---

# Uç durum — bloktan büyük kayıt

<iframe class="dsanim" src="anim/blocking-factor.html?yer=slayt&lang=tr&example=edge-too-big" title="Bloklama çarpanı: bf=0 hatası"></iframe>

<!-- Konuşma notu: Burada bf 0 hesaplanır — gerçek bir sistem bunu bir tasarım hatası olarak algılayıp reddetmeli, sessizce yanlış davranmamalı. -->

---

# Uç durum — 12 anahtar bf=3'e tam bölünür

<iframe class="dsanim" src="anim/blocking-factor.html?yer=slayt&lang=tr&example=edge-exact" title="Bloklama çarpanı: son blok israfı yok"></iframe>

<!-- Konuşma notu: Burada son blok israfı yok — ama iç parçalanma yine de her tam blokta olur, çünkü iki israf türü birbirinden bağımsız. -->

---

# Kod — kapasite, doldurma ve flush

```c
#define BLOCK_SIZE 100

int block_capacity(int rec_size) {
    return BLOCK_SIZE / rec_size;
}

/* block_put: append a key; flush when full */
/* block_flush: write a PARTIAL last block */
/*   anyway — a whole block, however few keys */
```

<!-- Konuşma notu: block_flush yalnız ana döngüden sonra bir kez çağrılır — son blok israfını ödeyen odur. -->

---

# Karmaşıklık

- Bloklamanın kendisi hiçbir algoritmanın **asimptotik** maliyetini değiştirmez
- **Sabiti** değiştirir: kayıt sayısı değil, blok okuma/yazma sayısı
- Daha büyük `bf` → daha az, daha büyük disk erişimi → pratikte daha hızlı
- Bir blok RAM'de rahatça tamponlanamayacak kadar büyüyene kadar

<!-- Konuşma notu: Bölüm 4 ve 5'in O(numBlocks) ve O(log numBlocks)'u, bf büyüdükçe doğrudan küçülür, çünkü numBlocks = n / bf. -->

---

# Yaygın hatalar

- **Son bloğun** yine de tam bir blok yazma maliyeti taşıdığını unutmak
- `blockSize`'ı bir kayıttan küçük seçmek (`bf = 0`)
- İç parçalanmayı son blok israfıyla karıştırmak — ikisi bağımsızdır

<!-- Konuşma notu: Bu iki israf türünün farklı nedenleri ve farklı çözümleri vardır — birbirine karıştırmak yanlış optimizasyona götürür. -->

---

# Mini soru

`recSize = 24`, `blockSize = 100`. `bf`
nedir, ve **tam bir blok** kaç bayt iç
parçalanma israf eder?

<!-- Konuşma notu: bf = floor(100/24) = 4; israf edilen baytlar bf*recSize'dan sonra kalandır. -->

---

# Yanıt

**`bf = 4`.** `4 * 24 = 96` bayt kullanıldı,
tam blok başına **4 bayt** israf — burada
küçük görünür, ama koca bir dosyadaki her
blokla çarpılır.

<!-- Konuşma notu: 4 bayt bir blok için önemsiz görünür — animasyondaki "hard" senaryosu bunun birçok blokta nasıl biriktiğini gösterir. -->

---

<!-- _class: bolum -->

# 4. Bir Dosyada Sıralı Arama

<!-- Konuşma notu: Bölüm 4, Hafta 1'in doğrusal aramasının, kayıtların bf'er bf'er geldiği gerçeğine uyarlanmış hali. -->

---

# Başlangıç sorusu

Bir dosyanın kayıtları sıralı değil. Bir
anahtarı bulmak için, anahtar çıkana ya da
dosya bitene kadar her bloğu okumaktan
başka bir seçenek var mı?

<!-- Konuşma notu: Yararlanılacak bir sıra düzeni olmadan, bu bölümün verdiği cevap: hayır — her blok kontrol edilmeli. -->

---

# Fikir: blokları sırayla oku, içeride karşılaştır

- Blok 0'ı RAM tamponuna oku
- İçindeki **her** kaydı hedefle karşılaştır
- Bulunamadıysa: blok 1'i oku — ve böyle devam et
- Önemli olan maliyet: **blok okumaları**, karşılaştırmalar değil

<!-- Konuşma notu: Zaten diskten okunmuş bir bloktaki birkaç fazladan kaydı karşılaştırmak, onları yükleyen disk erişiminin yanında neredeyse bedavadır. -->

---

# Benzetme — sırasız bir kutu rafını okumak

- **Sırasız** bir kutu rafında bir dosya arıyorsunuz
- Bulana kadar **her** kutuyu tek tek açmalısınız
- Ya da tüm kutuları açıp hiçbir şey bulamazsınız — yine hepsini açtınız
- Buradaki bir "kutu" bir blok; onu açmak bir disk okuması

<!-- Konuşma notu: Bu, Hafta 1'in doğrusal aramasının disk boyutlu birimlerle yeniden anlatılmış hali — zaman alan içindeki kağıt değil, kutunun kendisi. -->

---

# Sıralı arama, adım adım

<iframe class="dsanim" src="anim/sequential-search-file.html?yer=slayt&lang=tr" title="Sıralı arama"></iframe>

<!-- Konuşma notu: Normal örnek: bf=4 — gerçek maliyet olarak karşılaştırma sayacını değil, blok okuma sayacını izleyin. -->

---

# Uç durum — hedef yok, dosyanın tamamı taranır

<iframe class="dsanim" src="anim/sequential-search-file.html?yer=slayt&lang=tr&example=edge-not-found" title="Sıralı arama: bulunamadı"></iframe>

<!-- Konuşma notu: Yok olan bir hedef, en son kaydı bulmakla tam olarak aynı maliyeti taşır — her iki durumda da her blok okunur. -->

---

# Uç durum — hedef ilk kayıt (en iyi durum)

<iframe class="dsanim" src="anim/sequential-search-file.html?yer=slayt&lang=tr&example=edge-first" title="Sıralı arama: en iyi durum"></iframe>

<!-- Konuşma notu: Bir blok okuma, bir karşılaştırma — bu tekniğin varyansının ulaşabileceği en iyi durum. -->

---

# Kod — bir bloğu tara, sonra bir sonrakini

```c
for (int b = 0; b < nblocks; b++) {
    load_block(f, b, buf, &cnt);
    (*block_reads)++;
    for (int i = 0; i < cnt; i++) {
        (*comparisons)++;
        if (buf[i] == target)
            return b * bf + i;
    }
}
return -1;   /* exhausted every block */
```

<!-- Konuşma notu: block_reads blok başına bir kez artar; comparisons kayıt başına bir kez — yalnız ilki bu haftanın gerçek maliyetidir. -->

---

# Karmaşıklık

- En kötü durum: **`ceil(n / bf)`** blok okuma — her blok
- Ortalama durum: bunun yaklaşık **yarısı**
- Hafta 1'in `O(n)` doğrusal aramasının tam dosya analoğu
- Sayılan birim **bloklar**, kayıtlar değil — `O(n / bf)`

<!-- Konuşma notu: Bölüm 3'ten daha büyük bir bloklama çarpanı, numBlocks küçüldüğü için sıralı aramayı doğrudan hızlandırır. -->

---

# Yaygın hatalar

- Gerçek maliyet olarak blok okuma yerine **karşılaştırma** saymak
- **Kalan her bloğu** okumadan bir anahtarın yok olduğunu varsaymak
- Yinelenen bir anahtarın **ilk** eşleşmesi yerine sonuncusunu döndürmek

<!-- Konuşma notu: Bölüm 5'in sıralı dosyasının aksine, sırasız bir sıralı dosya bulunamama durumu için hiçbir kısayol sunmaz. -->

---

# Mini soru

Sıralı aramanın en kötü durumu, hedef yok
olsun ya da tam olarak son kayıt olsun,
neden tam olarak aynıdır?

<!-- Konuşma notu: Algoritmanın son bloğu okumadan önce neye karar verebileceğini düşünün. -->

---

# Yanıt

**İkisi de her bloğun okunmasını gerektirir.**
Son kayıt için eşleşme son bloğa kadar
bulunmaz; yok olan bir anahtar için hiçbir
blok erken elenmez — hepsi kontrol edilmeli.

<!-- Konuşma notu: Bu, bölüm 5'in birazdan, dosya sıralı olduğu anda karşılaştıracağı cevapla aynı biçimdedir. -->

---

<!-- _class: bolum -->

# 5. Sıralı Bir Dosyada İkili Arama

<!-- Konuşma notu: Bölüm 5, bölüm 4'ün hiç kullanmadığı gerçeği sorar — dosya sıralı tutulabilseydi ne olurdu? -->

---

# Başlangıç sorusu

Bölüm 4'ün dosyası **sıralı** tutulursa, Hafta
1'in ikili aramasının sıralı bir diziyi araması
gibi ama blok blok aranabilir mi?

<!-- Konuşma notu: Cevap evet, bir farkla — her karşılaştırmada bir eleman değil, koca bir blok elenir. -->

---

# Fikir: BLOKLAR üzerinde ikili arama

- Blok `b`'nin kayıtları sıralı, örtüşmeyen bir **aralık**
- Hedefi bir bloğun **ilk** ve **son** anahtarıyla karşılaştır
- Küçükse: blok aralığının sağ yarısını at
- Büyükse: sol yarısını at — yoksa hedef bu bloğun **içinde**

<!-- Konuşma notu: İkili arama bir bloğa daraldığında, içinde kısa bir doğrusal tarama (bölüm 4'ün fikri, ama bf ile sınırlı) onu bulur ya da bir boşluğu doğrular. -->

---

# "Boşluk" ne demek

- "Aralıkta" olmak "var" olmak **anlamına gelmez**
- Bir bloğun ilk ve son anahtarı arasındaki bir hedef yine de **yok** olabilir
- O bir bloğun içindeki kısa tarama bunu doğrular ya da yalanlar
- Bu bölüm 4'te asla olmaz — sırasız bir dosyanın aralığı yok

<!-- Konuşma notu: Bu, kendi animasyon çalıştırmasını hak eden uç durum — ikili arama HANGİ bloğu daraltır, anahtarın var olup olmadığını değil. -->

---

# Benzetme — etiketli bir sıralı kutu rafı

- Şimdi rafın kutuları içeriklerinin aralığıyla **etiketli**
- Bir kutunun etiketine bakın: dosyanız ondan önce, içinde, ya da sonra
- İçeremeyeceği her kutuyu doğrudan atlayın
- Yalnız etiket aralığı eşleşen **tek** kutuyu açın

<!-- Konuşma notu: Etiket tam olarak bir bloğun ilk/son anahtarıdır — ona bakmak bir göz atma kadar sürer, yanlış taraftaki her şeyi eler. -->

---

# Sıralı dosyada ikili arama, adım adım

<iframe class="dsanim" src="anim/binary-search-sorted-file.html?yer=slayt&lang=tr" title="Sıralı dosyada ikili arama"></iframe>

<!-- Konuşma notu: Normal örnek: her karşılaştırmanın bir kerede koca bir bloğun tümünü nasıl elediğini izleyin. -->

---

# Uç durum — bir bloğun aralığında bir boşluk

<iframe class="dsanim" src="anim/binary-search-sorted-file.html?yer=slayt&lang=tr&example=edge-gap" title="İkili arama: boşluk"></iframe>

<!-- Konuşma notu: Hedef aynı bloktaki iki gerçek anahtarın arasına düşer — içindeki kısa tarama doğru şekilde "bulunamadı" bildirir. -->

---

# Uç durum — hedef dosyanın en küçük anahtarının altında

<iframe class="dsanim" src="anim/binary-search-sorted-file.html?yer=slayt&lang=tr&example=edge-outrange" title="İkili arama: aralık dışı"></iframe>

<!-- Konuşma notu: Blok 0'ın ilk anahtarıyla yapılan ilk karşılaştırma bile tüm dosyayı eler — başka okumaya gerek yok. -->

---

# Kod — bir bloğa daral, sonra tara

```c
while (lo <= hi) {
    int mid = (lo + hi) / 2;
    block_reads++;
    if (target < first_key(mid)) hi = mid-1;
    else if (target > last_key(mid)) lo = mid+1;
    else {
        /* target's range: short scan inside */
        return scan_block(mid, target);
    }
}
```

<!-- Konuşma notu: Her yineleme tam olarak bir blok okur, tıpkı dizi ikili aramasının tam olarak bir elemanı incelemesi gibi. -->

---

# Karmaşıklık

- **`O(log2 numBlocks)`** blok okuma, artı en çok `bf` kayıtlık bir tarama
- Bölüm 4'ün **`O(numBlocks)`**'una karşılaştırın
- 24 anahtar, 6 blok: burada en çok **3** okuma, orada en çok **6**
- Dosya büyüdükçe fark çarpıcı biçimde açılır

<!-- Konuşma notu: Hafta 1'in dizide ikili aramaya karşı doğrusal aramasıyla tam olarak aynı hızlanma biçimi, bir kademe yukarıda. -->

---

# Yaygın hatalar

- "Aralıkta" olmanın "var" olmak anlamına gelmediğini unutmak (boşluk durumu)
- Bloğun **orta** anahtarıyla karşılaştırmak (ilk/son yerine)
- Bunu **sırasız** bir dosyaya uygulamak — sessizce yanlış, yalnız yavaş değil

<!-- Konuşma notu: Bu algoritma bloğun tüm aralığıyla karşılaştırmalı, çünkü her adımda bir kayıt değil, birkaç kayıtlık koca bir blok içeri/dışarı bırakılıyor. -->

---

# Mini soru

Dizide ikili arama (Hafta 1) `O(log n)`
karşılaştırma ister. Dosyada ikili arama
`O(log numBlocks)` okuma ister. Biri diğerinden iyi mi?

<!-- Konuşma notu: numBlocks = n / bf olduğunu hatırlayın — bunun temelden farklı bir algoritma mı, yoksa aynı algoritma bir kademe yukarıda mı olduğunu düşünün. -->

---

# Yanıt

**Hiçbiri — aynı fikir, farklı birim.** Dizi
araması *elemanları* yarıya böler; dosya
araması *blokları* yarıya böler, ve
`numBlocks` zaten `n`'den `bf` kat küçüktür.

<!-- Konuşma notu: Dosyada ikili arama, blok yönelimli G/Ç'nin zorunlu kıldığı gruplama nedeniyle, bf kayıtlık gruplar üzerinde yapılan ikili aramadır. -->

---

<!-- _class: bolum -->

# 6. Sıralı Güncelleme: Ana ve İşlem Dosyasını Birleştirme

<!-- Konuşma notu: Bölüm 6, bu konunun adını aldığı klasik algoritma — koca bir dosyayı kayıt kayıt dokunmadan güncellemek. -->

---

# Başlangıç sorusu

Bir bankanın hesap dosyası her gün değişir.
Her değişiklik için **tüm** dosyayı yeniden
yazmak milyonlarca kayıtta saçma. Alternatif nedir?

<!-- Konuşma notu: Bu alternatif, modern veritabanlarından on yıllar önce, erken toplu işleme sistemlerinden geliyor. -->

---

# Kısa bir tarihçe

- **Sıralı ana + işlem dosyası** birleştirmesi, rastgele erişimli
  disklerden bile eski, klasik bir toplu işleme kalıbı
- Tharp'ın *File Organization and Processing*'i bunu sıralı dosya
  güncellemenin kanonik algoritması olarak ele alır
- Bugün hâlâ koca, periyodik toplu işler için kullanılır (fatura kesme)

<!-- Konuşma notu: Bu kalıp, dosya işlemenin en eski fikirlerinden biridir — öğrencilerin ilk aklına gelen veritabanlarından çok daha eskidir. -->

---

# Fikir: iki SIRALI dosyayı tek geçişte birleştir

- **İşlem dosyası**: sıralı, aynı anahtar, her biri bir **op**'la
- `'A'` ekle, `'C'` değiştir, `'D'` sil
- İki "okuma başı", dosya başına bir — tam olarak Hafta 10'un birleştirme adımı
- Her adımda `master.key`'i `txn.key`'le karşılaştır

<!-- Konuşma notu: Bu, Hafta 10'un birleştirme sıralamasının birleştirme adımının, iki diziye değil iki dosyaya uygulanmış hali. -->

---

# Üç durum

| Karşılaştırma | Anlam | Eylem |
| --- | --- | --- |
| `master.key < txn.key` | Bu kayıt için işlem yok | Değişmeden kopyala |
| `master.key > txn.key` | Anahtar henüz anada değil | `'A'`: ekle; yoksa **hata** |
| `master.key == txn.key` | İşlem burada uygulanır | Sonraki slayta bakın |

<!-- Konuşma notu: Hangi işaretçi "geride" ise o ilerler — bu, iki sıralı diziyi birleştirmekle tam olarak aynı karşılaştırma mantığıdır. -->

---

# Eşit-anahtar durumu, ayrıntılı

- Var olan bir anahtara `'A'`: **yinelenen-ekleme hatası**
- Orijinal kayıt yine de **değişmeden kopyalanır**
- `'C'`: değer değiştirilir, güncellenmiş kayıt yazılır
- `'D'`: kayıt basitçe **yazılmaz** — silme budur

<!-- Konuşma notu: Reddedilen bir işlem, kimsenin silinmesini istemediği veriyi asla silmemelidir — bu, bu algoritmadaki en önemli kural. -->

---

# Benzetme — iki sıralı listeyi okuyan iki kişi

- Biri ana listeyi sırayla, yüksek sesle okur
- İkinci kişi işlem listesini sırayla, yüksek sesle okur
- Her adımda şu anki sözcüklerini yüksek sesle karşılaştırırlar
- Alfabetik olarak "geride" olan bir sonraki sözcüğünü okur

<!-- Konuşma notu: Bu iki-okuyucu resmi tam olarak Hafta 10'un birleştirme adımıdır, ve algoritmanın neden asla geri dönmediğini görselleştirmenin en temiz yolu. -->

---

# Sıralı güncelleme, adım adım

<iframe class="dsanim" src="anim/sequential-update-master-transaction.html?yer=slayt&lang=tr" title="Sıralı güncelleme"></iframe>

<!-- Konuşma notu: Normal örnek: 10 ana kayıt, ekle/değiştir/sil karışımı 6 işlem — her iki işaretçinin birlikte nasıl ilerlediğini izleyin. -->

---

# Uç durum — yinelenen ekleme + yok olan anahtar

<iframe class="dsanim" src="anim/sequential-update-master-transaction.html?yer=slayt&lang=tr&example=edge-duplicate" title="Sıralı güncelleme: hatalar"></iframe>

<!-- Konuşma notu: Tek bir çalıştırmada iki hata türü: var olan bir anahtara ekleme ve yok olan bir anahtarı değiştirme/silme. -->

---

# Uç durum — ana dosya biter, kalan işlemler

<iframe class="dsanim" src="anim/sequential-update-master-transaction.html?yer=slayt&lang=tr&example=edge-trailing" title="Sıralı güncelleme: kalan işlemler"></iframe>

<!-- Konuşma notu: Bu tam olarak "kalan işlemler" döngüsü — bazı kalan eklemeler başarılı olur, bazı kalan değiştirme/silmeler reddedilir. -->

---

# Kod — birleştirme döngüsünün ana karşılaştırması

```c
while (i < nm && j < nt) {
    if (master[i].key < txn[j].key) {
        write(master[i]); i++;
    } else if (master[i].key > txn[j].key) {
        if (txn[j].op == 'A') write(new);
        else errors++;      /* C/D: missing */
        j++;
    } else { /* equal key: next slide */ }
}
```

<!-- Konuşma notu: Bu tam olarak Hafta 10'un birleştirme-sıralaması karşılaştırma yapısı — yeni olan tek kısım eşit-anahtar dalı. -->

---

# Kod — eşit-anahtar dalı, ve kalanlar

```c
else {
    if (txn[j].op == 'A') {
        write(master[i]);   /* KEEP it */
        errors++;
    } else if (txn[j].op == 'C') write(new);
    else deleted++;         /* 'D': skip write */
    i++; j++;
}
/* + two leftover loops when one file ends */
```

<!-- Konuşma notu: Ana birleştirme bittikten sonra kalan döngüleri unutmak, bu algoritmadaki en yaygın hatadır. -->

---

# Karmaşıklık

- **`O(nm + nt)`** — tek geçiş, her kayıt tam olarak bir kez okunur
- İşlem başına anayı bir kez aramaya karşılaştırın: `O(nt * nm)`
- Bölüm 4 ya da 5'in araması, `nt` kez uygulansa, tam bunu maliyet ederdi
- Birleştirme, herhangi gerçek ölçekte çarpıcı biçimde daha ucuzdur

<!-- Konuşma notu: Bu karmaşıklık farkı, toplu sistemlerin her işlem için ayrı ayrı aramak yerine neden sıralı dosyaları birleştirdiğinin tam nedenidir. -->

---

# Yaygın hatalar

- Yinelenen-ekleme hatasında ana kaydı **sessizce düşürmek**
- Ana birleştirme bittikten sonra **iki kalan döngüyü** unutmak
- Her iki dosyanın da sıralı olduğunu, kontrol etmeden ya da garanti etmeden varsaymak

<!-- Konuşma notu: Herhangi bir yerdeki tek bir sırasız kayıt sessizce yanlış bir birleştirme üretir — bir çökme değil, bir hata mesajı değil. -->

---

# Mini soru

Bu algoritmada bir silme neden özel bir
"silindi" kaydı yazarak değil, kaydı
**yazmayarak** yapılır?

<!-- Konuşma notu: Birleştirme bittiğinde yeni ana dosyanın gerçekte ne içerdiğini düşünün. -->

---

# Yanıt

**Yeni dosya baştan, kayıt kayıt inşa edilir.**
Silinmiş bir kayıt onda hiç bulunmamalı —
yazmayı atlamak silmenin *kendisidir*, ek
bir muhasebeye gerek yoktur.

<!-- Konuşma notu: Bunu bölüm 10'un mezar taşlarıyla karşılaştırın — onlar tam olarak yoklamalı bir dosya baştan yeniden yazılamadığı için açık bir işarete ihtiyaç duyar. -->

---

<!-- _class: bolum -->

# 7. Göreli (Doğrudan) Dosya Erişimi

<!-- Konuşma notu: Bölüm 7, Hafta 1'in dizi indeksleme fikrinin diske taşınmış hali — hiç arama yok, yalnız aritmetik. -->

---

# Başlangıç sorusu

Bir program zaten "7 numaralı kaydı"
istediğini biliyor. Bölüm 4 ve 5 ikisi de
*arar*. 7 numaralı kaydı bulmak arama gerektirir mi?

<!-- Konuşma notu: Cevap hayır — ve bu, tüm haftanın en hızlı tekniği, açık ara farkla. -->

---

# Fikir: hesapla, arama

- Her kayıt bir **göreli kayıt numarası (RRN)** alır: `0, 1, 2, ...`
- `block = rrn / bf`, `offset = rrn % bf`
- Bir bölme, bir mod — **hiç karşılaştırma yok**
- Bir `fseek`, bir blok okuma — gerçek **O(1)**

<!-- Konuşma notu: Bu, dosya yüz kayıt tutsun ya da yüz milyon, tam olarak aynı tek blok okuma maliyetini taşır. -->

---

# Hâlâ doğrulanması gereken

- Negatif `rrn`, ya da `rrn >= total`: herhangi bir okumadan **önce** reddet
- Geçerli görünen bir `rrn` yine de **kısmi son bloğa** düşebilir
- Yalnız blok sınırlarına değil, **toplam kayıt sayısına** karşı kontrol gerekir

<!-- Konuşma notu: Bir konumu aramak yerine hesaplamak, doğrulamayı atlamak anlamına gelmez — tam tersi. -->

---

# Benzetme — numaralı bir otopark katı

- Her park yerinin zeminde boyalı bir **numarası** var
- "37 numaralı yer" arama gerektirmez — doğrudan 37/bf katına git
- Bir otopark görevlisi 37 numaralı yeri her katı gezerek aramaz
- Tam olarak bölüm 7'nin `block = rrn / bf`, `offset = rrn % bf`'i

<!-- Konuşma notu: Numaralı bir park yeri, hesaplanmış bir adresin en temiz resmi — bilinen bir numara için hiç kimse bir otoparkı kat kat aramaz. -->

---

# Göreli dosya erişimi, adım adım

<iframe class="dsanim" src="anim/relative-file-direct-access.html?yer=slayt&lang=tr" title="Göreli dosyada doğrudan erişim"></iframe>

<!-- Konuşma notu: Normal örnek: bf=5, 13 kayıt — her isteğin, geçerli ya da geçersiz, tam olarak bir blok okuma maliyeti taşıdığını izleyin. -->

---

# Uç durum — negatif ve aralık dışı istekler

<iframe class="dsanim" src="anim/relative-file-direct-access.html?yer=slayt&lang=tr&example=edge-invalid" title="Göreli dosya erişimi: geçersiz rrn"></iframe>

<!-- Konuşma notu: Negatif bir rrn burada temiz biçimde reddedilir — kontrolsüz olsaydı negatif bir blok ve bozuk bir fseek hesaplardı. -->

---

# Uç durum — kısmi son bloktaki tek kayıt

<iframe class="dsanim" src="anim/relative-file-direct-access.html?yer=slayt&lang=tr&example=edge-last-partial" title="Göreli dosya erişimi: kısmi son blok"></iframe>

<!-- Konuşma notu: Bir geçerli rrn, çoğunlukla boş olan bir bloğa doğru şekilde düşer; bir sonraki rrn yine de aralık dışı olarak reddedilmeli. -->

---

# Kod — tüm algoritma, iki satırda

```c
int direct_read(FILE *f, int bf,
                 int total, int rrn) {
    if (rrn < 0 || rrn >= total)
        return -1;             /* reject */
    int block = rrn / bf;
    int offset = rrn % bf;
    /* one fseek, one fread, done */
}
```

<!-- Konuşma notu: Depolanmış veriyle hiç karşılaştırma yok, hiç döngü yok — bu, tüm haftanın gerçekten en basit algoritması. -->

---

# Karmaşıklık

- **O(1)** — her geçerli istek için tam olarak bir blok okuma
- Bölüm 4 ve 5'in maliyetleri dosya büyüdükçe **büyümeye devam eder**
- Doğrudan erişim hiç büyümez, asla
- Bu haftanın geri kalan tekniklerinin yaklaşmaya çalıştığı tavan

<!-- Konuşma notu: Bu, bu hafta diğer her tekniğin hesaplanmış ya da hash'lenmiş bir konumla yaklaşmaya çalıştığı kuramsal tavan. -->

---

# Yaygın hatalar

- `rrn >= total`'ı kontrol edip `rrn < 0`'ı unutmak
- **Kısmi son bloğu** hesaba katmamak
- "Doğrudan"ın "doğrulama gerekmez" anlamına geldiğini varsaymak — yine gerekir

<!-- Konuşma notu: Sınırların dışına taşan bir fseek'e hesaplanan doğrulanmamış bir rrn, tam olarak temiz başarısızlık yerine dosyayı bozan bir hata türü. -->

---

# Mini soru

Göreli erişimin O(1) maliyeti neden hiç
`bf`'e bağlı değilken, bölüm 4 ve 5'in
arama maliyetlerinin ikisi de bağlıdır?

<!-- Konuşma notu: Her tekniğin bir cevaba ulaşmak için kaç bloğu ziyaret etmesi ya da hesaplaması gerektiğini düşünün. -->

---

# Yanıt

**Doğrudan erişim, `bf`'ten bağımsız olarak
her zaman tam bir seek ve bir okuma yapar**
— yalnız *hangi* blok değişir. Arama ise
cevabı bulana kadar blokları tek tek ziyaret etmelidir.

<!-- Konuşma notu: numBlocks = n / bf, her iki arama tekniğinin karmaşıklığında açıkça görünür — doğrudan erişimde asla. -->

---

<!-- _class: bolum -->

# 8. Kovalara Hash'leme

<!-- Konuşma notu: Bölüm 8, Hafta 6'nın hash tablosunu diske taşır; "bir hücre" artık "bir blok" olur, bir kayıt değil. -->

---

# Başlangıç sorusu

Gerçek anahtarlar nadiren uygun bir `0, 1, 2, ...`.
Hafta 6 bunu RAM'de bir hash fonksiyonuyla
çözdü. Aynı fikir bir dosya için çalışır mı?

<!-- Konuşma notu: Evet — ve kilit değişim, buradaki bir hash "hücresinin" tek bir hücre değil, zaten bf anahtar tutabilen bir blok olması. -->

---

# Fikir: bir KOVAYA hash'le, taşmada zincirle

- `h(key) = key mod m`, `m` **kovadan** birini seçer
- Bir kova bir **blok**tur, `bf`'e kadar anahtar tutar — bir hücre değil
- Aynı kovayı paylaşan iki anahtar sorun değil, **kova dolana kadar**
- O zaman: bir **taşma bloğu** ayrılır, dolu kovaya zincirlenir

<!-- Konuşma notu: Bu tam olarak Hafta 6'nın ayrık zincirlemesi, "bağlı liste düğümlerinin" artık tek tek kayıt değil, koca disk bloğu olması dışında. -->

---

# Benzetme — birkaç mektup tutan posta kutuları

- Her posta kutusu (kova) zaten `bf`'e kadar mektup (anahtar) tutar
- Aynı kutuya iki mektup: sorun değil, kutu dolana kadar
- Dolu bir posta kutusuna **ekstra bir tepsi** takılır
- O ekstra tepsi tam olarak zincirlenen bir taşma bloğu

<!-- Konuşma notu: Zaten bf mektup tutabilen bir posta kutusu, Hafta 6'nın RAM tablosundan temel farktır; orada her "posta kutusu" tam bir mektup tutardı. -->

---

# Kovalara hash'leme, adım adım

<iframe class="dsanim" src="anim/hashing-to-buckets.html?yer=slayt&lang=tr" title="Kovalara hash'leme"></iframe>

<!-- Konuşma notu: Bir taşma bloğu sonunda ayrılmadan önce bir kovada kaç anahtarın biriktiğini izleyin. -->

---

# Uç durum — m=1, her şey zincirlenir

<iframe class="dsanim" src="anim/hashing-to-buckets.html?yer=slayt&lang=tr&example=edge-one-bucket" title="Kovalara hash'leme: m=1"></iframe>

<!-- Konuşma notu: Tek bir kovayla, ilk bf'ten sonraki her anahtar çakışır — uzun bir taşma zinciri, bilerek maksimuma çıkarılmış en kötü durum. -->

---

# Uç durum — 10 anahtarın tümü aynı kovaya

<iframe class="dsanim" src="anim/hashing-to-buckets.html?yer=slayt&lang=tr&example=edge-all-same" title="Kovalara hash'leme: aynı kova"></iframe>

<!-- Konuşma notu: m birden büyükken bile her anahtar çakışıyorsa, bu kötü seçilmiş bir m'yi kötü bir hash sonucundan ayırır. -->

---

# Kod — hash'le, taşmada zincirle

```c
int h = key % m, cur = h;
while (bucket[cur].count == bf) {
    if (bucket[cur].next < 0)
        bucket[cur].next = new_block();
    cur = bucket[cur].next;    /* follow chain */
}
bucket[cur].keys[bucket[cur].count++] = key;
```

<!-- Konuşma notu: Yeni bir taşma bloğu zincirdeki SON bloğa eklenmelidir, hiçbir zaman doğrudan ana kovaya değil. -->

---

# Karmaşıklık

- Ortalama durum: **O(1)** blok erişimi, Hafta 6'nın zincirlemesiyle aynı
- Artı, izlenmesi gereken her taşma bloğu için bir erişim daha
- **Yük faktörü** (`n / (m * bf)`) makul olduğu sürece küçük kalır
- En kötü durum ("m=1" yukarıda): `O(n / bf)`'ye doğru bozulur

<!-- Konuşma notu: Bu tam olarak Hafta 6'nın zincirleme bozulması, artık RAM karşılaştırmaları yerine gerçek disk erişimlerinde ödenir. -->

---

# Yaygın hatalar

- Yeni taşma bloğunu **yanlış** bloğa zincirlemek
- Beklenen anahtar sayısı için `m`'i çok küçük seçmek
- Bir kovanın kapasitesinin `bf` olduğunu, 1 olmadığını unutmak

<!-- Konuşma notu: Buradaki bir çakışma "bf'inci anahtar, zaten dolu bir blok için yarışıyor" demektir — aynı m ve anahtar sayısı için önemli ölçüde daha nadir bir olay. -->

---

# Mini soru

Taşma bloklarını burada zincirlemek, Hafta
6'nın ayrık zincirlemesine mi, yoksa açık
adreslemesine mi daha yakın? Neden?

<!-- Konuşma notu: Çakışan bir anahtarın aynı tablo yapısında mı kaldığını, yoksa ayrı bir şey mi büyüttüğünü düşünün. -->

---

# Yanıt

**Ayrık zincirleme.** Dolu bir kova, kenarda
**ek bloklardan** bir zincir büyütür — başka
hiçbir kovaya dokunmadan, tam olarak Hafta
6'nın hücre başına bağlı listesi gibi.

<!-- Konuşma notu: Bölüm 9'un ilerleyici taşması diğer aile — tam olarak aynı tablonun içinde farklı bir hücreyi talep ediyor, Hafta 6'nın açık adreslemesi gibi. -->

---

<!-- _class: bolum -->

# 9. İlerleyici Taşma: Diskte Doğrusal Yoklama

<!-- Konuşma notu: Bölüm 9, Hafta 6'nın açık adreslemesi diske taşınmış hali — ayrı bir yapı yok, yalnız yoklamaya devam et. -->

---

# Başlangıç sorusu

Bölüm 8'in taşma blokları, her taşan kova
için tam bir ekstra bloğa mal olur. Yoklama
bu israfı tamamen önleyebilir mi?

<!-- Konuşma notu: Hafta 6'nın açık adresleme fikri, her anahtarı orijinal tablonun içinde tutarak RAM'de tam olarak bu israfı önledi. -->

---

# Fikir: bir sonraki hücreyi yokla, sarmalayarak

- Ana hücre: `h(key) = key mod m`
- Farklı bir anahtarla dolu mu? **Sonraki** hücreyi dene, `(h+1) mod m`
- `mod m`, diziyi son hücreden 0'a **sarmalar**
- Dur: boş hücre (ekle), yinelenen, ya da `m` hücrenin tümü denendi (dolu)

<!-- Konuşma notu: Yoklanan her hücre, boş olsun olmasın, bir gerçek disk erişimine mal olur — bu tekniğin maliyeti tam olarak bu yüzden yoklamalarla ölçülür. -->

---

# Benzetme — en yakın boş yere park etmek

- Size ayrılan yer dolu mu? Bir sonraki yeri alın
- O da dolu mu? Bir sonraki — sonda yer 0'a sarmalayarak
- Hiç ayrı bir taşma alanı yok — herkes aynı alana park eder
- Tam olarak Hafta 6'nın açık adreslemesi, diskte bir kademe aşağıda

<!-- Konuşma notu: Bölüm 8'in posta tepsilerinin aksine, burada hiç ayrı bir yapı yok — her anahtar gerçekten tek tabloda yaşar. -->

---

# İlerleyici taşma, adım adım

<iframe class="dsanim" src="anim/collision-progressive-overflow.html?yer=slayt&lang=tr" title="İlerleyici taşma"></iframe>

<!-- Konuşma notu: Ana hücre sona yakınken yoklama dizisinin son hücreden 0'a nasıl sarmalandığını izleyin. -->

---

# Uç durum — her anahtar bir hücreyi paylaşıyor

<iframe class="dsanim" src="anim/collision-progressive-overflow.html?yer=slayt&lang=tr&example=edge-same-home" title="İlerleyici taşma: aynı ana hücre"></iframe>

<!-- Konuşma notu: Yoklama sayıları ekleme sırasıyla kilitlenmiş biçimde 1, 2, 3, ... artar — birincil kümelenmenin ders kitabı imzası. -->

---

# Uç durum — tablo tamamen dolu

<iframe class="dsanim" src="anim/collision-progressive-overflow.html?yer=slayt&lang=tr&example=edge-full" title="İlerleyici taşma: tablo dolu"></iframe>

<!-- Konuşma notu: Son ekleme m hücrenin hepsini dener ve hiçbirini boş bulamaz — sonsuz döngü değil, temiz bir "dosya dolu" raporu. -->

---

# Kod — yer, yinelenen ya da dolu bulana kadar yokla

```c
int h = key % m, i = h, tries = 0;
while (tries < m) {
    if (table[i] == EMPTY) {
        table[i] = key; return i;
    }
    if (table[i] == key) return -2; /* dup */
    i = (i + 1) % m; tries++;
}
return -1;   /* file genuinely full */
```

<!-- Konuşma notu: `tries < m` koruması olmadan, eşleşen anahtarı olmayan tamamen dolu bir tablo, i = (i + 1) % m'nin sonsuza dek döngüye girmesine neden olurdu. -->

---

# Karmaşıklık

- **Düşük** yük faktöründe `n / m`, O(1)'e yakın yoklama
- Yük faktörü yükseldikçe keskin biçimde bozulur
- "Hard" senaryo (%91 dolu): bir ekleme için 5 yoklamaya kadar
- Nerdeyse tam dolu en kötü durum: **O(m)** yoklama

<!-- Konuşma notu: Bu tam olarak Hafta 6'nın açık adresleme bozulması, artık RAM karşılaştırmaları yerine gerçek disk erişimlerinde ödenir. -->

---

# Yaygın hatalar

- Yoklama döngüsünü sınırlamamak (`tries < m`)
- "Dosya dolu"yu çökme yerine normal bir sonuç olarak ele almamak
- `key % m` için negatif anahtar korumasını unutmak

<!-- Konuşma notu: İyi tasarlanmış bir dosya organizasyonu programı, dolu bir dosyayı zarifçe algılamalı ve bildirmeli — yukarıdaki örnek program tam olarak bunu yapar. -->

---

# Mini soru

"Birincil kümelenme" nedir, ve "aynı ana
hücreyi paylaşan her anahtar" uç durumu
bunu neden en uç haliyle gösterir?

<!-- Konuşma notu: Hafta 6'daki terimi hatırlayın — ardışık dolu hücrelerden oluşan bir serinin neden büyümeye devam ettiğini düşünün. -->

---

# Yanıt

**Daha fazla çakışma çeken büyüyen dolu bir
seri.** Burada 10 anahtarın tümü aynı ana
hücreyi paylaşıyor, yoklama sayıları kilitlenmiş
biçimde `1, 2, 3, ...` artıyor.

<!-- Konuşma notu: Yoklama dizisi var olan bir seriye ulaşan her yeni anahtar, onu bir hücre daha uzatmak zorundadır, bu da bir sonraki çakışmayı daha olası yapar. -->

---

<!-- _class: bolum -->

# 10. Mezar Taşlarıyla Silme

<!-- Konuşma notu: Bölüm 10, bir yoklama zincirinin ORTASINDAKİ bir anahtar silindiğinde bölüm 9'un yoklamasına ne olduğunu sorar. -->

---

# Başlangıç sorusu

Silinen bir hücre basitçe `EMPTY`'ye
temizlenirse, o hücreden geçmek zorunda
kalmış farklı bir anahtarın sonraki aramasına ne olur?

<!-- Konuşma notu: EMPTY tam olarak bir aramanın "bu anahtar hiç eklenmedi, vazgeç" demek için kullandığı sinyaldir. -->

---

# Fikir: bir mezar taşı "aramaya devam et" demektir

- **Mezar taşı**: hem `EMPTY`'den hem gerçek bir anahtardan farklı
- Bir arama bir mezar taşını, herhangi bir dolu hücre gibi **atlar**
- Yalnız gerçek bir `EMPTY` hücre bir aramayı **bitirebilir**
- Bir **ekleme** ise bir mezar taşını yeniden kullanmakta özgürdür

<!-- Konuşma notu: Arama ve ekleme burada temelden farklı sorular sorar — tam olarak bu yüzden bir mezar taşını farklı ele alırlar. -->

---

# Benzetme — "gitti, ama burada durma" tabelası

- Bir park yerinin sahibi ayrıldı: geçici bir **tabela** dikin
- Tabela "boş" (dolaşmaya devam et) ya da "dolu" (girme) demez
- Birinin bir zamanlar burada park ettiğini, arabanızın daha ilerde olabileceğini söyler
- Yeni bir araba yine de buraya park edebilir — o zaman tabela iner

<!-- Konuşma notu: Tabela, tek bir resimde mezar taşıdır — geçmekte olan bir aramanın davranışını değiştirir, geçmekte olan bir eklemenin yapabileceğini değiştirmeden. -->

---

# Mezar taşlarıyla silme, adım adım

<iframe class="dsanim" src="anim/deletion-with-tombstones.html?yer=slayt&lang=tr" title="Mezar taşlarıyla silme"></iframe>

<!-- Konuşma notu: Bir silmenin bir hücreyi TOMB'a çevirmesini, sonra sonraki bir find()'ın onu doğru şekilde atlayıp zincirdeki daha ileri bir anahtara ulaşmasını izleyin. -->

---

# Uç durum — tamamen mezar taşlanmış bir tablo

<iframe class="dsanim" src="anim/deletion-with-tombstones.html?yer=slayt&lang=tr&example=edge-all-tombstones" title="Mezar taşlarıyla silme: boş hücre yok"></iframe>

<!-- Konuşma notu: Hiç gerçek-boş hücre kalmıyor — yalnız bölüm 9'un tries < m sınırı find()'ın sonsuza dek yoklamasını durduruyor. -->

---

# Uç durum — bir anahtarı sil, sonra aynı anahtarı yeniden ekle

<iframe class="dsanim" src="anim/deletion-with-tombstones.html?yer=slayt&lang=tr&example=edge-reinsert-same" title="Mezar taşlarıyla silme: yeniden ekleme"></iframe>

<!-- Konuşma notu: Yeniden eklenen anahtar, kendi mezar taşını yeniden kullanarak kendi ana hücresine geri döner — doğru ve tatmin edici bir gidiş-dönüş. -->

---

# Kod — find mezar taşlarını atlamalı, durmamalı

```c
int i = key % m, tries = 0;
while (tries < m) {
    if (table[i] == EMPTY) return -1;
    if (table[i] == key) return i;
    /* TOMB: fall through, keep probing */
    i = (i + 1) % m; tries++;
}
return -1;
```

<!-- Konuşma notu: TOMB ne "bulundu" ne de "durmak güvenli" demektir — herhangi başka dolu-ama-farklı bir hücre gibi atlanmalıdır. -->

---

# Kod — ekleme bir mezar taşını yeniden kullanabilir

```c
int i = key % m, tries = 0;
while (tries < m) {
    if (table[i] == EMPTY ||
        table[i] == TOMB) {
        table[i] = key; return i; /* reused! */
    }
    if (table[i] == key) return -2;
    i = (i + 1) % m; tries++;
}
```

<!-- Konuşma notu: Bir mezar taşını yeniden kullanmak, başka hiçbir anahtarın yoklama zincirini bozmadan silinen yeri geri kazanır. -->

---

# Karmaşıklık

- `ts_find`/`ts_delete`: bölüm 9'un düz yoklamasıyla aynı **O(yoklama zinciri uzunluğu)**
- Mezar taşları hiçbir yeni asimptotik maliyet eklemez
- `ts_insert`: pratikte genelde **daha az** — erken bir mezar taşını yeniden kullanabilir
- Yalnız bir aramanın hangi hücrelerden geçmeye razı olduğu değişir

<!-- Konuşma notu: Bir arama zaten dolu hücrelerden geçmek zorundaydı — mezar taşları yalnız "dolu ama geçilebilir" sayılanı genişletir. -->

---

# Yaygın hatalar

- Silerken hücreyi basitçe `EMPTY`'ye temizlemek
- `ts_find`'ın bir mezar taşında durmasını ya da onu eşleşme saymasını sağlamak
- Tamamen mezar taşlanmış bir tablonun güvenilecek **hiç** `EMPTY`'si olmadığını unutmak

<!-- Konuşma notu: Son durum, bölüm 9'daki tries < m sınırının neden savunmacı bir incelik değil, yük taşıyan bir gereklilik olduğunu tam olarak gösterir. -->

---

# Mini soru

`ts_insert` bir mezar taşını yeni bir anahtar
için yeniden kullandıktan sonra, o hücreden
geçen ilgisiz bir anahtarın araması neden hâlâ doğru çalışır?

<!-- Konuşma notu: Hücrenin, gerçek bir anahtar yeniden tuttuktan sonra bir aramaya nasıl göründüğünü düşünün. -->

---

# Yanıt

**Yeniden kullanıldıktan sonra hücre yine
gerçek bir anahtar tutar** — başka herhangi
bir dolu hücreden ayırt edilemez. Diğer
anahtarların aramaları hiç değişmemiş gibi davranır.

<!-- Konuşma notu: Başka herhangi bir anahtarın bakış açısından, dolu bir hücre dolu bir hücredir — orijinal anahtarını mı, sonradan geri kazanılmış bir mezar taşına eklenen bir anahtarı mı tutuyor olursa olsun. -->

---

<!-- _class: bolum -->

# 11–12. Karşılaştırma ve Seçim

<!-- Konuşma notu: Şimdi tek tek algoritmalardan geri çekilip beş organizasyonu yan yana karşılaştırıyoruz, ve her birini ne zaman seçeceğimizi. -->

---

# Karşılaştırma tablosu

| Organizasyon | Bulma | Ekleme / Silme | En iyi olduğu yer |
| --- | --- | --- | --- |
| Sıralı (sırasız) | O(numBlocks) | O(1) / O(numBlocks) | Zaten her kaydı işlemek |
| Sıralı (sıralı) | O(log numBlocks) | O(numBlocks) ikisi de | Toplu güncellemeler (bölüm 6) |
| Göreli (doğrudan) | O(1) | O(1) / O(1), boşluk bırakır | RRN doğal olarak biliniyor |
| Hash'leme (kova/yoklama) | O(1) ort. | O(1) ort. | Keyfi anahtar, hızlı arama |

<!-- Konuşma notu: Her satırın paylaştığı tek sütun sayılan birim — bölüm 1'den, karşılaştırma değil, blok okuma ve yazma. -->

---

# Teknik seçimi (1/2)

| Durum | En iyi seçim |
| --- | --- |
| Zaten her kaydı işleyeceksiniz | Sıralı, herhangi bir sırada |
| Periyodik toplu değişiklikler | Sıralı (sıralı) + işlem dosyası |
| Ara sıra arama, nadiren değişir | Sıralı (sıralı), ikili arama |
| Kayıtlar 0, 1, 2, ... numaralı | Göreli (doğrudan) dosya |

<!-- Konuşma notu: Zaten her kaydı ziyaret edecekseniz, hiçbir teknik her bloğu bir kez okumaktan iyi değildir — sıralamak orada hiçbir şey kazandırmaz. -->

---

# Teknik seçimi (2/2)

| Durum | En iyi seçim |
| --- | --- |
| Keyfi anahtar, sadelik öncelikli | Hash'leme, kova zincirleme |
| Keyfi anahtar, kompaktlık, nadir silme | Hash'leme, ilerleyici taşma |
| Keyfi anahtar, sık silme | İlerleyici taşma + mezar taşları |

<!-- Konuşma notu: Hafta 6'daki gibi, en büyük karar şu: bu dosya anahtara göre verimli arama mı gerektiriyor, yoksa her zaman bütün mü işlenecek? -->

---

<!-- _class: bolum -->

# Kapanış

<!-- Konuşma notu: Bu hafta boyunca tek bir soru her bölümü yönlendirdi: her teknik kaç blok okuma ve yazma gerektiriyor? -->

---

# Özet

- **Kayıt/alanlar**: sabit, sınırlandırılmış, ya da uzunluk önekli
- **Bloklama çarpanı**: `bf` kayıt bir disk erişimini paylaşır
- **Sıralı**: her bloğu sırayla oku, ya da sıralıysa blok düzeyinde ikili ara
- **Sıralı güncelleme**: ana + işlemleri tek geçişte birleştir
- **Göreli erişim**: `block = rrn/bf` — gerçek O(1)
- **Hash'leme**: taşma bloklarını zincirle, ya da mezar taşlarıyla yokla

<!-- Konuşma notu: Hafta 1, 6 ve 10'un her fikri burada mantığında değişmeden yeniden görünür, artık RAM işlemleri yerine blok okumalarda ödenir. -->

---

# 1. Bu hafta neden karşılaştırma değil blok okuma sayıyor?

<!-- Konuşma notu: Bölüm 1'i hatırlayın — bir disk erişimi, içeriği üzerindeki herhangi bir bellek içi işlemden kat kat pahalıdır. -->

---

# Bir disk erişimi herhangi bir RAM işleminden çok daha pahalıdır, ve her zaman TAM bir blok aktarır — bu yüzden karşılaştırma değil blok sayısı gerçek hızı öngörür.

<!-- Konuşma notu: Bu, tüm haftanın düzenleyici fikri, bir kez daha bir gözden geçirme sorusu olarak ifade edildi. -->

---

# 2. Sıralı bir dosyada ikili arama neden orta anahtar yerine bir bloğun ilk/son anahtarıyla karşılaştırmalı?

<!-- Konuşma notu: Bölüm 5'i hatırlayın — her adımda bir kayıt değil, koca bir BLOK içeri/dışarı bırakılıyor. -->

---

# Her karşılaştırmada koca bir BLOK kayıt içeri/dışarı bırakılıyor, ve yalnız ilk/son anahtar o bloğun aralığını tanımlar.

<!-- Konuşma notu: Bu tam olarak dizide ikili arama (Hafta 1) ile dosyada ikili arama (bölüm 5) arasındaki fark. -->

---

# 3. Yinelenen-ekleme hatası neden yine de orijinal ana kaydı ileri kopyalamalı?

<!-- Konuşma notu: Bölüm 6'yı hatırlayın — ilgisiz, reddedilen bir işlem asla geçerli veriyi yan etki olarak silmemelidir. -->

---

# Ana kayıt hiçbir yanlış yapmadı — yalnız işlem reddedilir; onu ileri kopyalamamak sessizce geçerli veriyi kaybederdi.

<!-- Konuşma notu: Bu, bu haftanın kendi referans programları inşa edilirken bulunan ve düzeltilen gerçek bir hataydı — varsayımsal değil, gerçek. -->

---

# 4. Bir ekleme neden bir mezar taşını güvenle yeniden kullanabilirken, bir arama onda durmamalıdır?

<!-- Konuşma notu: Bölüm 10'u hatırlayın — ekleme ve arama temelden farklı sorular soruyor. -->

---

# Arama diğer HER anahtarın bulunabilme yeteneğini korumalıdır; eklemenin yeniden kullanımı buna müdahale etmez, çünkü hücre sonra yeni, gerçek bir anahtar tutar.

<!-- Konuşma notu: Bu, açık adresleme + silmenin, herhangi bir dilde, en yaygın yanlış uygulanan tek ayrıntısı. -->

---

# 5. Göreli bir dosyanın O(1) maliyeti neden dosyanın toplam boyutuna hiç bağlı değil?

<!-- Konuşma notu: Bölüm 7'yi hatırlayın — aritmetik, kaç kayıt var olursa olsun aynı bir bölme ve bir mod. -->

---

# rrn ve bf'ten hesaplanan tek bir fseek, sonra bir blok okuma — bu hesaplama, dosyanın BAŞKA kaç kayıt tuttuğuna hiç bağlı değildir.

<!-- Konuşma notu: Bunu bu haftanın her arama tekniğiyle karşılaştırın; maliyetleri doğrudan numBlocks = n / bf cinsinden ifade edilir. -->

---

# 6. Taşma bloklarını zincirlemek (bölüm 8) neden ayrık zincirlemeye açık adreslemeden daha yakın?

<!-- Konuşma notu: Hafta 6'yı hatırlayın — bir çakışmanın kenarda bir yapı büyütüp büyütmediğini, yoksa aynı tablo içinde bir hücre mi talep ettiğini düşünün. -->

---

# Dolu bir kova kenarda EK bloklardan bir zincir büyütür, başka hiçbir kovaya dokunmadan — tam olarak Hafta 6'nın ayrık zincirlemesi, bir kademe aşağıda.

<!-- Konuşma notu: Bölüm 9'un ilerleyici taşması diğer Hafta 6 ailesi — aynı tablonun içinde farklı bir hücreyi talep ediyor. -->

---

<!-- _class: baslik -->

# Gelecek hafta

**Hafta 14 — Dosya Organizasyonu II**

İndekslenmiş sıralı dosyalar · B-ağaçları ·
genişleyebilir hash'leme · dış sıralama — bu
haftanın blok-okuma maliyet modelini daha büyük araçlara genişletiyor.

<!-- Konuşma notu: Hafta 14, bölüm 8-10'un açık bıraktığı soruyu tam olarak yanıtlıyor: hash'lenmiş bir dosya m'sini aştığında ne olur? -->

---

# Kaynaklar (1/2)

- Ders izlencesi, Hafta 13: `docs/syllabus/syllabus.en.md`
- A. L. Tharp. *File Organization and Processing*.
  John Wiley & Sons, 1988 — birincil ders kitabı
- Cormen, Leiserson, Rivest, Stein. *Introduction
  to Algorithms*. MIT Press — hash tablosu bölümü

<!-- Konuşma notu: Bunlar, haftanın yazılı notlarının sonunda listelenen aynı kaynaklar. -->

---

# Kaynaklar (2/2)

- Knuth. *The Art of Computer Programming, Vol. 3:
  Sorting and Searching*, 2. baskı — dosya işleme,
  hash'leme ve doğrusal yoklamanın tarihsel analizi
- williamfiset/Algorithms · Programiz DSA

<!-- Konuşma notu: Knuth'un doğrusal yoklama analizi, bu haftanın "ilerleyici taşma" terminolojisinin tarihsel kökü. -->
