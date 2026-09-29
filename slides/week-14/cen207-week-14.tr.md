---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Hafta 14 — Dosya Organizasyonu II"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Hafta 14"
footer: "RTEÜ Bilgisayar Mühendisliği · 2026-2027 Güz"
---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Dosya Organizasyonu II

**CEN207 Veri Yapıları — Hafta 14**

Dr. Öğr. Üyesi Uğur CORUH · 2026-2027 Güz

<!--
Konuşma notu: Hafta 13 bize sıralı bir dosya ve kova-hashli bir dosya verdi. Bu hafta soruyor: küçük bir dizin aramayı ucuzlatabilir mi, dizinin kendisi sonsuza dek dengeli kalabilir mi, ve hashlenmiş bir dosya hiç yeniden kurulmadan büyüyebilir mi?
-->

---

# Bugünün planı (3 saat)

| Saat | Konu |
| --- | --- |
| 1 | Dizinler **Anim 1–2** · ISAM **Anim 3** · B-ağacı ekleme **Anim 4** |
| 2 | B-ağacı arama/silme **Anim 5–6** · B+-ağacı **Anim 7** |
| 3 | Genişleyebilir/doğrusal hashleme **Anim 8–9** · dış sıralama **Anim 10–11** |

**Öğrenme çıktıları:** ÖÇ.1 (temel veri yapılarını açıklama) · ÖÇ.2 (karmaşıklık analizi) · ÖÇ.6 (dosya tabanlı depolama tasarımı) · ÖÇ.7 (doğru yapıyı seçme)

<!-- Konuşma notu: On bir animasyon tüm dersi taşıyor; her çizim disk sayfalarını numarayla etiketler ve sağda okuma/yazma sayacı tutar. -->

---

# Bu haftanın kavramları — nerede

| Kavram | Nerede |
| --- | --- |
| Birincil/ikincil dizin, ISAM | Bölüm 1–3 |
| B-ağacı ekleme/arama/silme, B+-ağacı | Bölüm 4–7 |
| Genişleyebilir hashleme, doğrusal hashleme | Bölüm 8–9 |
| Dış birleştirmeli sıralama, yerine koyarak seçim | Bölüm 10–11 |

<!-- Konuşma notu: Her terim ilk geçtiğinde tam olarak tanımlanır; bu tablo yalnızca onu tekrar bulacağınız yeri söyler. -->

---

# Kod örnekleri nasıl çalışır

- Her fikrin tam bir **C** ve **Java** programı var
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Kaynaklar: `code/week-14/c/` ve `code/week-14/java/`
- İki program GERÇEK dosyalar yaratır, yalnız kendi kurduğu bir lab klasöründe

<!-- Konuşma notu: external_merge_sort ve replacement_selection gerçek çalışma dosyaları yaratır, ama her zaman kendi yarattıkları ve sildikleri bir klasörün içinde. -->

---

# Özet — Hafta 13: sayfalar, sıralı dosyalar, kova hashleme

- Bir **sayfa**, disk G/Ç'sinin birimidir — bu haftanın da para birimi
- **Sıralı bir dosya**: sayfalar üzerinde ikili arama, O(log(n/B))
- **Kova-hashli bir dosya**: ~O(1) arama, ama taşma zincirleri
- Bugün: büyümeyi VE aramayı birlikte ucuzlatan yapılar

<!-- Konuşma notu: Bu haftaki her şey ya sıralı dosyayı bir dizinle hızlandırır, ya da hashlenmiş dosyanın sabit kova sayısını çözer. -->

---

# Özet — Hafta 4: ağaçlar ve yeniden dengeleme

- Bir İAA düşmanca bir ekleme sırasında O(n)'e bozulabilir
- Yeniden dengeleme: bir değişiklikten sonra yerel olarak yeniden yapılandır
- Bir B-ağacı koca **sayfaları** dengeler, tek anahtarlı düğümleri değil
- Sayfaları bölmek ve birleştirmek yüksekliği hep O(log n) tutar

<!-- Konuşma notu: Bugünün B-ağacı ailesi, Hafta 4'ün ağaç fikrini, tek anahtar değil birçok anahtar tutan sayfalara genelliyor. -->

---

# Haftanın haritası — genel bakış

| Dizinler | Dengeli ağaçlar | Dinamik hashleme | Dış sıralama |
| --- | --- | --- | --- |
| Birincil, ikincil, ISAM | B-ağacı, B+-ağacı | Genişleyebilir, doğrusal | Birleştirmeli sıralama, yerine koyarak seçim |

<!-- Konuşma notu: Bu haritadaki her kutu aşağıda kendi slaytlarını alır, her biri adım adım bir animasyon ve tam bir C/Java programıyla. -->

---

<!-- _class: bolum -->

# 1. Birincil (Seyrek) Dizinler

<!-- Konuşma notu: Bölüm 1 dizinleme ailesini açıyor: sayfa sayfa aramayı tek bir sayfa okumasına dönüştüren, belleğe sığan küçücük bir yapı. -->

---

# Başlangıç sorusu

Bir dosyanın sayfaları üzerinde ikili
arama zaten O(log(n/B)) okumaya mal
oluyor. RAM'e sığacak kadar küçük bir yapı
bunu daha da kısaltabilir mi?

<!-- Konuşma notu: Evet — yapı diske hiç dokunmayacak kadar küçükse, geriye yalnız TEK bir veri sayfası okuması kalır. -->

---

# Sezgi — bir kitabın bölüm sekmeleri

- Bir kelimeyi bulmak için her sayfayı çevirmek: çok yavaş
- Her bölümün ilk kelimesini tutan bir **sekme**
- Sekmeleri kontrol et (bedava, elinizde), TEK bölümü aç
- Bir seyrek dizinin her disk sayfası için yaptığı tam olarak bu

<!-- Konuşma notu: Sekmeler elinizden (bellekten) hiç çıkmaz; yalnızca doğru bölümü açmak gerçek bir "sayfa çevirme" (disk okuma) maliyetidir. -->

---

# Fikir: SAYFA başına tek girdi

- Dizin: `(ilk_anahtar, sayfa)` çiftleri, veri sayfası başına bir
- Dosyanın kendisiyle aynı şekilde sıralı
- Küçük: verinin `1/B`'i kadar — RAM'e sığar, ücretsiz taranır
- `find_page`: `first_key <= key` olan son girdi

<!-- Konuşma notu: Sayfa başına tek girdi tuttuğundan (kayıt başına değil), devasa bir dosya için bile küçücük kalır. -->

---

# search_key: dizin taraması, sonra TEK sayfa okuması

- `find_page`, anahtar her `first_key`'den küçükse `-1` döndürür
- `-1`: **hiç disk erişimi gerekmez**
- Aksi halde: o tek sayfayı oku, anahtarı içinde tara
- Toplam gerçek disk maliyeti: en çok **bir** sayfa okuması

<!-- Konuşma notu: "Aralığın altında" uç durumunda, dizinin kendisi bile bir anahtarın yokluğunu sıfır disk G/Ç'siyle kanıtlayabilir. -->

---

# Birincil dizin, adım adım

<iframe class="dsanim" src="anim/primary-index.html?yer=slayt&lang=tr" title="Birincil dizin"></iframe>

<!-- Konuşma notu: Normal örnek: 12 anahtar, block=4 — dizin taramasının (bedava) tek bir sayfa okumasına nasıl devrettiğini izleyin. -->

---

# Uç durum — her sorgu aralığın altında

<iframe class="dsanim" src="anim/primary-index.html?yer=slayt&lang=tr&example=below-range" title="Birincil dizin: aralığın altında"></iframe>

<!-- Konuşma notu: Her tek sorgu en küçük anahtardan küçük: tüm senaryo boyunca sıfır disk okuması. -->

---

# Kod — find_page

```c
int find_page(IndexEntry index[], int idx_n, int key) {
    int page = -1;
    for (int i = 0; i < idx_n; i++) {
        if (index[i].first_key <= key)
            page = index[i].page;
        else
            break;
    }
    return page;
}
```

<!-- Konuşma notu: Dizin sıralıdır, bu yüzden bir girdinin first_key'i hedefi aştığı an döngü durabilir. -->

---

# Kod — search_key

```c
bool search_key(int data[][MAX_BLOCK], const int page_len[],
                 IndexEntry index[], int idx_n, int key, int *out_page) {
    int page = find_page(index, idx_n, key);
    if (page == -1) return false;
    for (int i = 0; i < page_len[page]; i++)
        if (data[page][i] == key) { *out_page = page; return true; }
    *out_page = page;
    return false;
}
```

<!-- Konuşma notu: page == -1, herhangi bir disk erişiminden önce kısa devre yapar; aksi halde tam olarak bir sayfa okunur ve taranır. -->

---

# Karmaşıklık

- Dizin taraması: en kötü durumda O(n/B) karşılaştırma, ama **sıfır** disk G/Ç'si
- Garanti edilen tek disk okuması: tek veri sayfası
- Arama başına gerçek toplam G/Ç: **O(1)** sayfa okuması
- Dizin yeri: O(n/B) — kayıtla değil, sayfayla orantılı

<!-- Konuşma notu: Daha büyük bir kurulum dizini de ikili ararardı, ama disk maliyeti her iki durumda da O(1) kalır. -->

---

# Sık yapılan hatalar

- Sıralı olmayan bir dosyada seyrek dizinin işe yarayacağını varsaymak
- "-1: hiçbir sayfa uymuyor"u "sayfa tarandı, eşleşme yok" ile karıştırmak
- Dizinin kendisinin RAM'e sığmayacak kadar büyümesine izin vermek

<!-- Konuşma notu: Üçüncü hata, sırada gelen ISAM'ın çok seviyeli dizin için tam gerekçesidir. -->

---

# Mini soru

Bir seyrek dizin neden kayıt başına
değil, yalnız SAYFA başına TEK girdiye ihtiyaç duyar?

<!-- Konuşma notu: Hangi sayfayı okuyacağınızı bildiğinizde, bir sayfa okumasının ve sayfa-içi taramanın ne verdiğini düşünün. -->

---

# Cevap

**Bir sayfa okuması + sayfa-içi tarama, o
sayfadaki her kaydı zaten bulur.** Sayfa
başına daha fazla girdi hiçbir ek okuma kazandırmazdı.

<!-- Konuşma notu: "Seyrek"in işe yaramasının tam nedeni bu: dizin yalnız "hangi sayfa"yı cevaplamalı, "hangi yuva"yı değil. -->

---

<!-- _class: bolum -->

# 2. İkincil (Yoğun) Dizinler

<!-- Konuşma notu: Bölüm 2, dizinlemeyi, birçok kayıtta tekrar eden biri dahil, herhangi bir özniteliğe genelliyor. -->

---

# Başlangıç sorusu

Birincil dizin dosyanın kendi sıralama
anahtarında çalışır. Bir dizin FARKLI,
tekrar eden bir öznitelikte de yardımcı olabilir mi?

<!-- Konuşma notu: Evet — ikincil anahtarın kendisine göre sıralı, yoğun bir dizin, tekrarların yan yana kümelenmesini sağlar. -->

---

# Sezgi — bir kütüphanenin konu kataloğu

- Kitaplar yer numarasına göre rafta durur (birincil sıra)
- Konu göre sıralı bir katalog kartı **kitap başına** vardır
- Aynı konudaki kartlar birbirinin yanına düşer
- Her kart yine de kitabın gerçek raf konumuna işaret eder

<!-- Konuşma notu: Katalog yoğundur (kitap başına bir kart) ve raflardan FARKLI bir anahtara göre sıralıdır. -->

---

# Fikir: anahtara göre sıralı, KAYIT başına bir girdi

- `(anahtar, konum)` çiftleri, kayıt başına BİR — sayfa başına değil
- İkincil anahtarın kendisine göre sıralı
- Dizin sıralı olduğundan tekrarlar **bitişik** sona erer
- Bir eşleşme kümesi: anahtar değişene kadar ileri tara

<!-- Konuşma notu: Yoğun dizin, seyrek dizinin O(n/B)'sinden daha fazla yer (O(n)) kaplar, herhangi bir özniteliği desteklemenin doğrudan bedeli. -->

---

# search_dense: tüm bir kümeyi topla

- Bir eşleşme başlamadan önceki girdiler atlanır
- Bir eşleşmenin içindeyken her ardışık girdi toplanır
- Bir eşleşmeden sonra FARKLI bir anahtar: küme bitti
- Dokunulan her farklı sayfa için en çok bir yeni okuma

<!-- Konuşma notu: Aynı sayfayı paylaşan iki eşleşme toplamda yalnız bir okumaya mal olur — arama bu sorguda ziyaret edilen sayfaları izler. -->

---

# İkincil dizin, adım adım

<iframe class="dsanim" src="anim/secondary-index.html?yer=slayt&lang=tr" title="İkincil dizin"></iframe>

<!-- Konuşma notu: Normal örnek: 12 kayıt, block=4 — veri dosyası bu anahtara göre sıralı olmasa bile eşleşmelerin nasıl kümelendiğini izleyin. -->

---

# Uç durum — tüm kayıtlar bir anahtarı paylaşıyor

<iframe class="dsanim" src="anim/secondary-index.html?yer=slayt&lang=tr&example=all-same" title="İkincil dizin: hepsi aynı"></iframe>

<!-- Konuşma notu: Dizinin tamamı tek bir dev küme — arama yine de tek geçişte her eşleşmeyi bulur. -->

---

# Kod — search_dense

```c
int search_dense(const IndexEntry index[], int n, int key,
                  int matches[], int max_matches) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (index[i].key == key) {
            if (count < max_matches) matches[count] = index[i].slot;
            count++;
        } else if (count > 0) {
            break;
        }
    }
    return count;
}
```

<!-- Konuşma notu: "else if (count > 0) break" kilit satırdır: yalnızca bir küme gerçekten başlayıp bittiğinde durur. -->

---

# Karmaşıklık

- Yazıldığı gibi doğrusal tarama: en kötü durumda O(n)
- Üretim sürümü: ilk eşleşmeye ikili arama, O(log n + m)
- Disk maliyeti: eşleşen her farklı sayfa için en çok bir okuma
- Yer: O(n) — sayfa başına değil, kayıt başına bir girdi

<!-- Konuşma notu: Yoğun dizin, seyrek dizinin küçük ayak izini, tekrarlar dahil HERHANGİ bir özniteliği arayabilme yeteneğiyle takas eder. -->

---

# Sık yapılan hatalar

- Yoğun dizinin VERİ dosyasının sırasına göre sıralı olduğunu varsaymak
- Bir küme başlamadan önce ilk eşleşmeyende taramayı kırmak
- Yoğun bir dizinin O(n/B) değil O(n) yer kapladığını unutmak

<!-- Konuşma notu: Veri dosyasının fiziksel sırası ile yoğun dizinin sıralama sırası genelde tamamen ilgisizdir. -->

---

# Mini soru

Yoğun bir dizin neden seyrek dizinin
sayfa başına birine karşı, KAYIT başına bir girdiye ihtiyaç duyar?

<!-- Konuşma notu: Seyrek dizinin "sayfa başına bir girdi" hilesinin neye dayandığını düşünün. -->

---

# Cevap

**Veri dosyası ikincil anahtara göre
sıralı DEĞİLDİR.** Yalnızca kayıt başına
bir dizin girdisi doğru bir eşleşme listesi garanti edebilir.

<!-- Konuşma notu: Seyrek dizinin hilesi yalnızca dosyanın kendisi tam olarak o anahtara göre sıralı olduğu için işe yarar. -->

---

<!-- _class: bolum -->

# 3. ISAM: Çok Seviyeli Dizin + Taşma

<!-- Konuşma notu: Bölüm 3, çok seviyeli bir dizini bir büyüme mekanizmasıyla, taşma alanıyla, birleştiriyor. -->

---

# Başlangıç sorusu

Bölüm 1–2, dosyanın hiç değişmeyeceğini
varsaydı. Gerçek dosyalar büyür. Sayfası
zaten dolu bir kayıt nereye gider?

<!-- Konuşma notu: ISAM iki fikirle cevap verir: dizini küçük tutmak için SEVİYELER, ve büyümeyi ucuz tutmak için bir TAŞMA ALANI. -->

---

# Kısa bir tarihçe — IBM, 1960'lar

- **ISAM** (Dizinli Sıralı Erişim Yöntemi)
- IBM'in erken mainframe veritabanları için üretim cevabı
- Onlarca yıl ticari veri işlemede kullanıldı
- Seyrek bir dizini bir taşma alanıyla birleştirir

<!-- Konuşma notu: ISAM, B-ağacından (1972) yaklaşık on yıl önce gelir — dosya organizasyonu sorununun ilk endüstriyel cevabıdır. -->

---

# Fikir: dizinin dizinini tut, bir kaçış valfi ekle

- Seviye-2 dizin: sayfa başına bir girdi (Bölüm 1 gibi)
- Seviye-1 dizin: her GROUP seviye-2 girdisini gruplar
- İki kısa tarama, tek uzun bir doğrusal taramanın yerini alır
- Dolu bir sayfanın yeni anahtarı bağlı bir TAŞMA zincirine gider

<!-- Konuşma notu: Ev sayfası ve dizin girdisi hiç yer değiştirmez; yalnızca onun taşma zinciri büyür. -->

---

# Taşma zincirleri: şimdi ucuz, sonra pahalı

- Taşma zincirine ekleme: sona ekle, yerel olarak O(1) amortize
- Arama, ev sayfasında değilse TÜM zinciri yürümeli
- Uzun zincirler: arama başarımı zamanla bozulur
- Çözüm: periyodik **yeniden düzenleme** dosyayı sıfırdan kurar

<!-- Konuşma notu: Bu takas — ucuz büyüme, bozulan arama — gerçek ISAM dosyalarının neden zamanlanmış bakıma ihtiyaç duyduğudur. -->

---

# ISAM, adım adım

<iframe class="dsanim" src="anim/isam.html?yer=slayt&lang=tr" title="ISAM"></iframe>

<!-- Konuşma notu: Normal örnek: 12 anahtar, block=4, fill=3 — iki doğrudan eklemeyi, sonra taşan üçüncüyü izleyin. -->

---

# Uç durum — zincirlenen taşma, aynı sayfa

<iframe class="dsanim" src="anim/isam.html?yer=slayt&lang=tr&example=hard" title="ISAM: zincirlenen taşma"></iframe>

<!-- Konuşma notu: Üç ekleme aynı, zaten dolu sayfayı hedefliyor; üçüncüsü eklenmeden önce iki taşma düğümünü geçmek zorunda. -->

---

# Kod — isam_insert

```c
void isam_insert(int key) {
    int g = find_group(l1_key, l1_n, key);
    int page = find_page(l2_key, g * GROUP, group_hi(g), key);
    read_page(page);
    if (page_len[page] < BLOCK) {
        insert_sorted(page, key);
        write_page(page);
    } else {
        int walked = walk_overflow_chain(page);
        append_overflow(page, key);
    }
}
```

<!-- Konuşma notu: İki seviyeli iniş (önce find_group, sonra find_page) tüm "dizinin dizini" fikridir, dört satırda. -->

---

# Karmaşıklık

- Arama: O(L) bellek-içi karşılaştırma + 1 ev-sayfası okuması
- Bulunamazsa, yürünen her taşma düğümü için bir okuma daha
- Ekleme: aynı arama + 1 yazma (doğrudan) ya da 2 yazma (taşma)
- Zincirler uzadıkça arama bozulur — yeniden düzenlemenin gerekçesi

<!-- Konuşma notu: L (dizin seviyeleri), koca bir dosya için bile küçük kalır, tam olarak seviye-2'yi seviye-1 altında gruplamanın amacı. -->

---

# Sık yapılan hatalar

- Taşma zincirlerinin sınırsız büyümesine izin verip hiç yeniden düzenlememek
- Yeni bir taşma düğümünü yanlış sayfanın zincirine eklemek
- Doğru GRUBU bulup, sayfalarını taramadan durmak

<!-- Konuşma notu: Yeni kayıt her zaman KENDİ ev sayfasının zincirine eklenir — en kısa zincire değil, komşuya değil. -->

---

# Mini soru

ISAM neden ÇOK SEVİYELİ bir dizine
ihtiyaç duyar, Bölüm 1'in dizini yalnız birini kullanırken?

<!-- Konuşma notu: Gerçekten koca bir dosya üzerinde tek seviyeli bir seyrek dizine ne olacağını düşünün. -->

---

# Cevap

**"Küçük" tek seviyeli bir dizin bile koca
bir dosya için çok büyüyebilir.** Seviye-1
altında gruplamak en üst taramayı küçük tutar.

<!-- Konuşma notu: Tıpkı bir telefon rehberinin sekmeli bölümlerinin, altındaki sıralı sayfadan önce yaptığı gibi. -->

---

<!-- _class: bolum -->

# 4. B-Ağaçları: Ekleme

<!-- Konuşma notu: Bölüm 4, B-ağacı ailesini açıyor: dizinin kendisi disk sayfalarından oluşan kendi kendini dengeleyen bir ağaç OLUYOR. -->

---

# Başlangıç sorusu

ISAM'ın dizin seviyeleri kurulum
zamanında sabittir. Ya dizinin kendisi hiç
yeniden düzenleme olmadan büyüyüp dengelenebilseydi?

<!-- Konuşma notu: O yapı B-ağacıdır — her "düğüm" koca bir disk sayfası, dengeli kalmak için bölünüp birleşiyor. -->

---

# Kısa bir tarihçe — Bayer ve McCreight, 1972

- Rudolf Bayer, Edward McCreight, Boeing Araştırma Lab.
- "Organization and Maintenance of Large Ordered Indexes"
- "B" Bayer, Boeing, ya da "balanced" olarak okunur — hiç kesinleşmedi
- ISAM'ın sabit yapısının çözemediğini çözdü: kanıtlanabilir denge

<!-- Konuşma notu: Bir B-ağacının yüksekliği, dosya nasıl büyür ya da küçülürse küçülsün O(log n) kalır — hiç ayrı bir yeniden dengeleme adımı olmadan. -->

---

# Sezgi — tepeden büyüyen bir dosya dolabı

- Her çekmece (sayfa) sıralı birkaç dosya (anahtar) tutar
- Dolu bir çekmece iki yarı dolu çekmeceye bölünür
- Ortadaki dosya YUKARIDAKİ çekmeceye çıkar
- Dolap yalnız zorunda kalınca YENİ BİR ÜST çekmece kazanır

<!-- Konuşma notu: Büyüme her zaman tepede (kökte) olur, asla yeni bir alt raf ekleyerek değil. -->

---

# Derece m: sayfa başına kaç anahtar

- Derece `m`: en çok `m-1` anahtar, `m` çocuk / düğüm
- Kök daha az tutabilir; diğer her düğüm en az `ceil(m/2)-1`
- Ekleme, tam bir aramanın yapacağı gibi bir yaprağa iner
- Yaprak artık `m` anahtar tutuyorsa: **böl**

<!-- Konuşma notu: Bu haftanın örneklerinde m=4 (karışık veri) ve m=3 (en kötü durum, bölünmeleri görünür kılmak için). -->

---

# split: ortancayı yukarı it

- `mid = n/2`; ortanca anahtar ebeveyne itilir
- Sol yarı `keys[0..mid-1]`'i tutar, sağ yarı kalanı alır
- EBEVEYN de taşıyorsa: onu da böl
- KÖK bölünürse: yeni bir kök ağacı bir seviye büyütür

<!-- Konuşma notu: Bu kaskad bölünme, ağaç yüksekliğini O(log_m n) tutan tüm mekanizmadır. -->

---

# B-ağacı ekleme, adım adım

<iframe class="dsanim" src="anim/b-tree-insert.html?yer=slayt&lang=tr" title="B-ağacı ekleme"></iframe>

<!-- Konuşma notu: Normal örnek: order=4, 12 karışık anahtar — ilk bölünmenin bir ortancayı yukarı ittiğini, sonra bir kök bölünmesini izleyin. -->

---

# Uç durum — order=12, hiç bölünmüyor

<iframe class="dsanim" src="anim/b-tree-insert.html?yer=slayt&lang=tr&example=never-splits" title="B-ağacı ekleme: hiç bölünmüyor"></iframe>

<!-- Konuşma notu: n'ye göre büyük bir order ile, tüm ağaç tek bir yaprak düğüm olarak kalır — bölünen durumlarla temiz bir zıtlık. -->

---

# Kod — insert_sorted ve split

```c
void insert_sorted(Node *node, int key) {
    int i = node->n - 1;
    while (i >= 0 && node->keys[i] > key) {
        node->keys[i + 1] = node->keys[i]; i--;
    }
    node->keys[i + 1] = key;
    node->n++;
}
```

<!-- Konuşma notu: Sıralı bir diziye düz bir kaydır-ekle — zaten gördüğünüz her ekleme sıralamasıyla aynı fikir. -->

---

# Kod — b_tree_insert

```c
void b_tree_insert(BTree *t, int key) {
    Node *leaf = find_leaf(t->root, key);
    insert_sorted(leaf, key);
    Node *cur = leaf;
    while (cur->n == ORDER) {
        int median; Node *right = split(cur, &median);
        if (cur->parent == NULL) { t->root = new_root(median, cur, right); return; }
        insert_sorted(cur->parent, median);
        attach_child(cur->parent, right);
        cur = cur->parent;
    }
}
```

<!-- Konuşma notu: while döngüsü kaskaddır: bir düğüm taşmayana ya da kök bölünene kadar yukarı doğru kontrol etmeye devam eder. -->

---

# Karmaşıklık

- Yükseklik: O(log_m n) — derece 100, 1 milyar kayıt: yalnız 5 seviye
- Ekleme: yaprağı bulmak için O(log_m n) okuma
- Artı en çok O(log_m n) bölünme, her biri O(m) iş
- En kötü durum (köke kaskad): O(m log_m n)

<!-- Konuşma notu: Her seviyeye ulaşan kaskadlar pratikte nadirdir — çoğu ekleme yalnız bir yaprak yazmasına mal olur. -->

---

# Sık yapılan hatalar

- Yalnız yaprağı bölüp, ebeveynin de taşabileceğini unutmak
- Ağacı yanlış uçtan büyütmek (tepe yerine alttan)
- Sıradan verinin bile sürekli bölünmesine yol açacak kadar küçük bir derece seçmek

<!-- Konuşma notu: Gerçek B-ağaçları, bir düğümün tam olarak bir disk sayfasını doldurduğu, yüzlerce mertebesinde bir derece kullanır. -->

---

# Mini soru

Bir B-ağacının yüksekliği neden düşmanca
bir ekleme sırasında bile O(log_m n) kalır?

<!-- Konuşma notu: Büyümenin nerede ve ne sıklıkla olduğunu düşünün. -->

---

# Cevap

**Her bölünme yereldir; ağaç yalnızca bir
bölünme KÖKE ulaştığında büyür.** Hiçbir
ekleme sırası uzun bir zincir yaratamaz.

<!-- Konuşma notu: Dengesiz bir İAA'nın aksine, her yaprak her zaman diğer her yaprakla aynı derinliktedir. -->

---

<!-- _class: bolum -->

# 5. B-Ağacı: Arama

<!-- Konuşma notu: Bölüm 5 daha basit soruyu soruyor: zaten var olan bir ağaçta, tek bir arama kaça mal olur? -->

---

# Başlangıç sorusu

Ekleme dengeli bir ağaç kurar. Zaten var
olan birinde, bir anahtarı bulmak — ya da
yokluğunu kanıtlamak — kaç sayfaya mal olur?

<!-- Konuşma notu: Cevap, ağacın yüksekliğiyle, artı bir, sınırlı çıkacak, ne olursa olsun. -->

---

# Fikir: her sayfada karşılaştırarak in

- Kökte başla; (küçük) sıralı anahtar listesini tara
- Tam eşleşme: bitti
- Eşleşme yok, ve bu bir YAPRAK: anahtar olamaz — yok
- Eşleşme yok, yaprak değil: tam olarak bir çocuğa in

<!-- Konuşma notu: Bir B-ağacı her anahtarı doğru yönlendirilmiş bir inişin izleyeceği bir yerde tutar; bir yaprağa eşleşmeden düşmek yokluğu kanıtlar. -->

---

# B-ağacı arama, adım adım

<iframe class="dsanim" src="anim/b-tree-search.html?yer=slayt&lang=tr" title="B-ağacı arama"></iframe>

<!-- Konuşma notu: Normal örnek: order=4, 12 anahtar, 3 arama — kök seviyesinde bir isabeti daha derin, daha pahalı bir aramayla karşılaştırın. -->

---

# Uç durum — tek düğüm, her arama 1 okuma

<iframe class="dsanim" src="anim/b-tree-search.html?yer=slayt&lang=tr&example=never-splits" title="B-ağacı arama: tek düğüm"></iframe>

<!-- Konuşma notu: order=12 ve yalnız 10 anahtarla, tüm dosya tek sayfaya sığar — bulunsun ya da bulunmasın, her arama tam bir okumaya mal olur. -->

---

# Kod — b_tree_search

```c
bool b_tree_search(Node *node, int key, Node **out_node) {
    if (node == NULL) return false;
    int i = 0;
    while (i < node->n && key > node->keys[i]) i++;
    if (i < node->n && key == node->keys[i]) {
        *out_node = node; return true;
    }
    if (node->leaf) return false;
    return b_tree_search(node->child[i], key, out_node);
}
```

<!-- Konuşma notu: Yaprak kontrolü eşleşme kontrolünden SONRA ama inmeden ÖNCE gelmeli — bir yaprakta inmek çöp okur. -->

---

# Karmaşıklık

- En kötü durumda O(log_m n) sayfa okuması — seviye başına bir
- Bir sayfa içinde: ikili aranırsa O(log m), doğrusal O(m)
- Anahtar bulunsun ya da yokluğu kanıtlansın, aynı maliyet
- Bu, Bölüm 4'ün dengeli eklemesinin doğrudan getirisi

<!-- Konuşma notu: "Bulunamadı" BEDAVA DEĞİLDİR — arama yine de emin olmak için bir yaprağa kadar iner. -->

---

# Sık yapılan hatalar

- Bir yaprağın (ilklendirilmemiş) çocuk dizisine inmek
- İnilecek çocuk indeksini seçerken birer birlik hata
- "Bulunamadı"nın "bulundu"dan daha az okumaya mal olduğunu varsaymak

<!-- Konuşma notu: Yanlış bir çocuk indeksi aramayı tamamen yanlış alt ağaca gönderir — çökmez, sessizce yanlıştır. -->

---

# Mini soru

B-ağacı araması neden en çok
(yükseklik + 1) okumaya mal olur, hangi anahtar aransa da?

<!-- Konuşma notu: Bir B-ağacında her yaprağın derinliği hakkında ne doğru olduğunu düşünün. -->

---

# Cevap

**Her yaprak tam olarak aynı derinliktedir.**
Bir arama ya erken bulur, ya da bir yaprağa
kadar iner — asla daha derine değil.

<!-- Konuşma notu: Bu, Bölüm 4'ün kökten böl-ve-büyü mekanizmasının doğrudan sağladığı yapısal garanti. -->

---

<!-- _class: bolum -->

# 6. B-Ağacında Silme: Ödünç Alma ve Birleştirme

<!-- Konuşma notu: Bölüm 6, eklemenin bölünmesini, silmenin iki onarım hamlesiyle yansıtıyor: ödünç al, ya da birleş. -->

---

# Başlangıç sorusu

Ekleme dolu bir sayfayı böler. Silmenin
ayna görüntüsü — iki çok boş sayfayı
birleştirmek — bazen önlenebilir mi?

<!-- Konuşma notu: Evet — minimumun az altına düşen bir sayfa, çoğu zaman bunun yerine bir komşusundan tek bir yedek anahtar ödünç alabilir. -->

---

# Fikir: sil, sonra eksikliği düzelt

- Yaprak anahtarı: kaydır-sil, basit
- İç anahtar: sıra-içi ÖNCÜL'üyle değiştir
- Öncülün kendi yaprağı, gerçek silmenin olduğu yerdir
- O yaprak eksilirse (çok az anahtar): yukarı doğru düzelt

<!-- Konuşma notu: Her silme, bir şekilde, bir yaprak silme artı üzerindeki olası bir düzeltme zincirine indirgenir. -->

---

# Eksikliği düzeltmek: önce ödünç al, yalnız gerekirse birleş

- Sol kardeşin yedek anahtarı var mı? **Ödünç al**: ebeveynden döndür
- Yoksa? SAĞ kardeşi aynı şekilde dene
- Hiçbiri yedek vermiyorsa? Bir kardeşle **Birleş**
- Bir birleşme EBEVEYNİ eksiltebilir: kontrol yukarı tekrarlanır

<!-- Konuşma notu: Ödünç alma tek adımda çözülür, 3 sayfaya dokunur; birleştirme ebeveynden bir sayfa ve bir anahtar kaldırır. -->

---

# Bir birleşme köke ulaştığında

- Tepedeki bir birleşme kökü tüm anahtarlarından boşaltabilir
- Kökün kalan tek çocuğu yeni kök olur
- Ağaç tam olarak bir seviye **küçülür**
- Bölüm 4'ün kök-bölünme büyümesinin tam ayna görüntüsü

<!-- Konuşma notu: Bir B-ağacının bir seviye kaybetmesinin tek yolu budur — her zaman tepede, asla bir yaprağı budayarak değil. -->

---

# B-ağacı silme, adım adım

<iframe class="dsanim" src="anim/b-tree-delete.html?yer=slayt&lang=tr" title="B-ağacı silme"></iframe>

<!-- Konuşma notu: Normal örnek: order=4, 12 anahtar, 3 silme — hiç düzeltme gerektirmeyen bir yaprak silmesini izleyin. -->

---

# Uç durum — kök küçülene kadar sil

<iframe class="dsanim" src="anim/b-tree-delete.html?yer=slayt&lang=tr&example=root-shrinks" title="B-ağacı silme: kök küçülüyor"></iframe>

<!-- Konuşma notu: order=3 bir ağaçta yedi silme, her biri bir birleşme, ta ki kök boşalıp ağaç bir seviye kaybedene dek. -->

---

# Kod — fix_underflow (ödünç al ya da birleş)

```c
void fix_underflow(Node *node) {
    while (node->parent != NULL && node->n < MIN_KEYS) {
        Node *parent = node->parent;
        int idx = child_index(parent, node);
        Node *left = idx > 0 ? parent->child[idx - 1] : NULL;
        Node *right = idx < parent->n ? parent->child[idx + 1] : NULL;
        if (left && left->n > MIN_KEYS) { borrow_from_left(node, parent, left, idx); return; }
        if (right && right->n > MIN_KEYS) { borrow_from_right(node, parent, right, idx); return; }
        if (left) { merge(left, parent, node, idx - 1); node = parent; }
        else { merge(node, parent, right, idx); node = parent; }
    }
}
```

<!-- Konuşma notu: Ödünç alma hemen döner (çözüldü); birleştirme node = parent yapıp döngüye devam eder (kaskad olabilir). -->

---

# Karmaşıklık

- Anahtarı bulmak: O(log_m n), aramayla aynı
- Düzeltme: en çok O(log_m n) birleştirme, seviye başına bir
- Her birleştirme/ödünç: anahtar ve çocukları kaydırmak için O(m)
- Ödünç: 3 sayfaya dokunur; birleştirme: bir sayfa + bir anahtar kaldırır

<!-- Konuşma notu: Bir ödünç alma kesinlikle daha ucuzdur — tek adımda çözülür, daha fazla yayılma riski olmadan. -->

---

# Sık yapılan hatalar

- Tam MIN_KEYS tutan bir kardeşten ödünç almak (yine de eksik kalır)
- Ödünç alınan bir anahtarla birlikte bir çocuk işaretçisini taşımayı unutmak
- Bir iç-düğüm değiştirmesinden sonra yanlış kopyayı silmek

<!-- Konuşma notu: Gerçek silme her zaman ÖNCÜLÜN orijinal yaprağında gerçekleşir, asla iç düğümde değil. -->

---

# Mini soru

Bir B-ağacı neden ÖDÜNÇ ALMAYI
BİRLEŞTİRMEYE tercih eder, bir kardeşin yedeği olduğunda?

<!-- Konuşma notu: Her seçeneğin kaç sayfaya dokunduğunu ve kaskad olup olamayacağını düşünün. -->

---

# Cevap

**Ödünç alma 3 sayfaya dokunur ve hemen
çözülür.** Birleştirme ebeveynden bir sayfa
kaldırır, ağaçta daha yukarı yayılabilir.

<!-- Konuşma notu: Dinamik bir dizinin tam bir yeniden ayırmadan önce yerinde büyümeyi tercih etmesiyle aynı "önce daha ucuz yerel çözüm" ruhu. -->

---

<!-- _class: bolum -->

# 7. B+-Ağaçları: Yaprak Zincirleri ve Aralık Sorguları

<!-- Konuşma notu: Bölüm 7 aralık sorgularını soruyor — ve tek bir yapısal değişiklikle cevaplıyor: her yaprağı bağlayan bir zincir. -->

---

# Başlangıç sorusu

"Son 30 gündeki her sipariş" bir ARALIK
sorgusudur. Sıradan bir B-ağacı sürekli
köke geri tırmanır. Bu önlenebilir mi?

<!-- Konuşma notu: Evet — her yaprak zaten sırada hangi yaprağın geldiğini biliyorsa, bir daha hiç tırmanmaya gerek kalmaz. -->

---

# Fikir: anahtarlar yalnız yapraklarda, yapraklar zincir kurar

- İç düğümler yalnız YÖNLENDİRME kopyaları tutar — asla gerçek veri
- Her gerçek anahtar bir YAPRAKTA yaşar
- Her yaprak sağındaki yaprağa bir `next` işaretçisi tutar
- Bir aralık sorgusu: TEK bir kez in, sonra zinciri takip et

<!-- Konuşma notu: Zincir, "her eşleşme için yeniden in"i "yana doğru yürü"ye dönüştürür, büyük sonuç kümeleri için devasa bir kazanç. -->

---

# Yaprak bölünmesi kopyalar; iç bölünme kaldırır

- Yaprak bölünmesi: ortanca KOPYALANIR yukarı (sağ yaprakta da kalır)
- İç bölünme: ortanca KALDIRILIR (saf yönlendirme, veri kaybı yok)
- Bölüm 4'ten TEK bu fark, tüm B+-ağacı fikridir
- `next`i doğru eklemek tek yeni muhasebe adımıdır

<!-- Konuşma notu: `next`i, üzerine yazmadan önce eklemeyi unutmak, bölünme noktasından sonraki her yaprağı sessizce kaybeder. -->

---

# B+-ağacı, adım adım

<iframe class="dsanim" src="anim/b-plus-tree.html?yer=slayt&lang=tr" title="B+-ağacı"></iframe>

<!-- Konuşma notu: Normal örnek: order=4, 12 anahtar, 3 aralık sorgusu — turuncu zincir oklarının sorguyu yana taşıdığını izleyin. -->

---

# Uç durum — tüm anahtarları kapsayan bir aralık

<iframe class="dsanim" src="anim/b-plus-tree.html?yer=slayt&lang=tr&example=whole-range" title="B+-ağacı: tüm aralık"></iframe>

<!-- Konuşma notu: Sorgu tüm zinciri sonuna kadar yürür — bir kez bile köke tırmanmadan. -->

---

# Kod — range_query

```c
void range_query(Node *root, int lo, int hi, int out[], int *count) {
    Node *leaf = find_leaf(root, lo);
    *count = 0;
    while (leaf != NULL) {
        for (int i = 0; i < leaf->n; i++)
            if (leaf->keys[i] >= lo && leaf->keys[i] <= hi)
                out[(*count)++] = leaf->keys[i];
        if (leaf->n > 0 && leaf->keys[leaf->n - 1] > hi) break;
        leaf = leaf->next;
    }
}
```

<!-- Konuşma notu: TEK bir iniş (find_leaf), sonra saf bir yana yürüyüş — özyineleme yok, iç düğümleri yeniden ziyaret etmek yok. -->

---

# Karmaşıklık

- Tek arama: O(log_m n), sıradan bir B-ağacıyla aynı
- k eşleşmeli aralık: O(log_m n) + O(k/B) zincir okuması
- Sıradan bir B-ağacı: O(k) ayrı kök inişine mal olabilirdi
- Zincir, bu hız kazancının tüm kaynağıdır

<!-- Konuşma notu: Sonuç kümesi ne kadar büyürse, B+-ağacının sıradan bir B-ağacına üstünlüğü o kadar büyür. -->

---

# Sık yapılan hatalar

- Bir İÇ bölünmede ortancayı kopyalamak (yalnız yapraklar kopyalar)
- `leaf->next`in üzerine yazmadan önce `next`i eklemeyi unutmak
- Bir aralık sorgusunu tekrarlanan tek-anahtar aramaları olarak çalıştırmak

<!-- Konuşma notu: Üçüncü hata doğru çalışır, ama yaprak zincirinin tüm kazancını çöpe atar. -->

---

# Mini soru

B+-ağacının aralık sorgusu neden köke
tırmanmaktan kaçınabilir, sıradan bir B-ağacınınki kaçınamazken?

<!-- Konuşma notu: Bir B+-ağacı yaprağının, sıradan bir B-ağacı yaprağının sahip olmadığı hangi bilgiye sahip olduğunu düşünün. -->

---

# Cevap

**Her yaprak kendi bir sonraki yaprağını
doğrudan, O(1) bilir.** Sıradan bir
B-ağacında komşu yapraklar arasında böyle bir kısayol yok.

<!-- Konuşma notu: Yaprak başına bu tek işaretçi, B+-ağacının aralık-sorgusu hızının arkasındaki tüm yapısal fark. -->

---

<!-- _class: bolum -->

# 8. Genişleyebilir Hashleme

<!-- Konuşma notu: Bölüm 8 hashlemeye dönüyor, artık kova sayısının kendisinin talep üzerine büyümesine izin vererek. -->

---

# Başlangıç sorusu

Hafta 13'ün kova-hashli dosyası kova
sayısını kurulurken dondurdu. Hashlenmiş
bir dosya talep üzerine tek seferde bir kova büyüyebilir mi?

<!-- Konuşma notu: Genişleyebilir hashlemenin cevabı: küçük, bellekte duran bir dizini, diskteki veri kovalarından ayırmak. -->

---

# Kısa bir tarihçe — Fagin vd., 1979

- Ronald Fagin, Jürg Nievergelt, Nicholas Pippenger, H. R. Strong
- "Extendible Hashing — A Fast Access Method for Dynamic Files"
- Ana fikir: dizin (bellek) veri kovalarından (disk) ayrı
- Büyüme, ucuz dizine, disk sayfalarından çok daha sık dokunur

<!-- Konuşma notu: Bu dizin/veri ayrımı, sonradan dinamik ve dağıtık hash tablolarının yeniden kullandığı tasarım kalıbıdır. -->

---

# Fikir: yalnız gerektiğinde katlanan bir dizin

- Dizin: `2^global_depth` işaretçi, son bitlerle indekslenir
- Birden fazla girdi AYNI kovaya işaret edebilir
- Her kova kendi `local_depth`'ini takip eder
- Taşma, `local_depth == global_depth`: dizin ÖNCE katlanır

<!-- Konuşma notu: Katlama saf bellek işidir — sıfır disk maliyeti — yalnızca yönlendirecek daha fazla, daha ince taneli işaretçi yaratır. -->

---

# Böl, sonra yeniden dene

- Kova bölünür: `local_depth++`, yeni bir kova yaratılır
- Anahtarlar, daha derin bölünmenin incelediği TEK yeni bitle yeniden dağıtılır
- Eklemeyi yeniden dene: tek bir bölünme her zaman yetmez
- Düşmanca veri ART ARDA BİRKAÇ bölünme gerektirebilir

<!-- Konuşma notu: Yeniden deneme şarttır — onsuz, yeni bitle her şeyi paylaşan bir anahtar kaybedilirdi. -->

---

# Genişleyebilir hashleme, adım adım

<iframe class="dsanim" src="anim/extendible-hashing.html?yer=slayt&lang=tr" title="Genişleyebilir hashleme"></iframe>

<!-- Konuşma notu: Normal örnek: capacity=2, 10 anahtar — bir kovanın local_depth'i yetiştiğinde dizinin ilk kez katlanmasını izleyin. -->

---

# Uç durum — zincirleme bölünmeler

<iframe class="dsanim" src="anim/extendible-hashing.html?yer=slayt&lang=tr&example=skewed" title="Genişleyebilir hashleme: zincirleme"></iframe>

<!-- Konuşma notu: Her anahtar 8 mod 16 — anahtarlar nihayet ayrılmadan önce dizin derinlik 7'ye kadar büyür. -->

---

# Kod — insert_key

```c
void insert_key(Hash *h, int key) {
    int idx = last_bits(key, h->global_depth);
    Bucket *b = h->dir[idx];
    if (b->n < CAPACITY) { b->keys[b->n++] = key; return; }
    if (b->local_depth == h->global_depth) {
        h->global_depth++;
        double_directory(h);
    }
    split_bucket(h, b);
    insert_key(h, key);
}
```

<!-- Konuşma notu: Sondaki özyineli yeniden deneme, "tek bölünme yetmedi" kaskad durumunu ele alan şeydir. -->

---

# Karmaşıklık

- O(1) dizin araması (bellekte, ücretsiz)
- 1 sayfa okuması + 1 yazma, bölünme başına +2 daha
- Bölünmeler O(1) amortize — dinamik dizi katlaması gibi
- Dizin yeri: O(2^global_depth), çarpık değilse küçük

<!-- Konuşma notu: Her katlama, bir sonrakine ihtiyaç duyulmadan önce iki kat daha fazla gelecekteki ekleme yapılmasına izin verir. -->

---

# Sık yapılan hatalar

- Dizinin katlanması gerekip gerekmediğini kontrol etmeden kovayı bölmek
- Yeniden denemeyi unutmak — tek bölünme anahtarları her zaman ayırmaz
- Bir bölünmenin yarattığı her kovanın boş olmayacağını varsaymak

<!-- Konuşma notu: Şanssız bir bölünme, yepyeni bir kovayı sıfır anahtarla, gelecekteki bir eklemeyi bekler hâlde bırakabilir. -->

---

# Mini soru

Dizin neden bir kova bölünmeden ÖNCE
katlanmalıdır, sonra değil?

<!-- Konuşma notu: Bir bölünmeden hemen sonra kaç dizin yuvasının YENİ kovaya işaret edebileceğini düşünün. -->

---

# Cevap

**Bir bölünme, yönlendirmek için yedek,
daha özgül yuvalara ihtiyaç duyar.** Önce
katlamadan, şu anki derinlikte hiçbiri yok.

<!-- Konuşma notu: Önce katlamak, bölünmenin sonra kullanacağı tam olarak o ek yuvaları yaratır. -->

---

<!-- _class: bolum -->

# 9. Doğrusal Hashleme

<!-- Konuşma notu: Bölüm 9, Bölüm 8 ile aynı dinamik büyümeyi, ama hiç dizin olmadan başarıyor. -->

---

# Başlangıç sorusu

Genişleyebilir hashleme koca bir ek
dizin yapısı ister. Bir dosya hiç dizin
olmadan tek seferde bir kova büyüyebilir mi?

<!-- Konuşma notu: Doğrusal hashlemenin cevabı: önceden, sabit, öngörülebilir bir bölünme sırasına bağlanmak. -->

---

# Kısa bir tarihçe — Witold Litwin, 1980

- "Linear Hashing: A New Tool for File and Table Addressing"
- Kovalar SABİT, sıralı (round-robin) düzende bölünür: 0, 1, 2...
- Gerçekte hangi kovanın taştığından tamamen bağımsız
- Bu öngörülebilirlik dizin ihtiyacını tamamen ortadan kaldırır

<!-- Konuşma notu: Litwin'in planı, genişleyebilir hashlemenin dizinini tek bir sayaçla, n, takas etti. -->

---

# Fikir: bir sayaç n, sıradaki bölünmeyi takip eder

- `level`: kaç tam katlama turu tamamlandı
- `n`: bu turda kaç kova bölündü
- Adres: `key mod (N0 * 2^level)`
- O adres `n`'den küçükse (zaten bölünmüş): bir seviye derin kullan

<!-- Konuşma notu: Adres kuralının tek "düzeltme" şartı, kovalar bölündükçe adreslemeyi doğru tutan tüm hiledir. -->

---

# HERHANGİ bir taşma, taşan değil, kova n'i böler

- Ekleme her zaman sığar: taşan bir kova basitçe büyür
- Herhangi bir yerde herhangi bir taşma, kova `n`'in bölünmesini tetikler
- `n` ilerler; tam bir tur `n=0`'a sıfırlar, `level++` yapar
- Bir kova geçici olarak CAPACITY'den fazla tutabilir

<!-- Konuşma notu: Bu, doğrusal hashlemenin en karakteristik — ve en sık yanlış gerçeklenen — kuralıdır. -->

---

# Doğrusal hashleme, adım adım

<iframe class="dsanim" src="anim/linear-hashing.html?yer=slayt&lang=tr" title="Doğrusal hashleme"></iframe>

<!-- Konuşma notu: Normal örnek: N0=4, capacity=2, 10 anahtar — bir taşmanın FARKLI bir kovanın bölünmesini tetiklemesini izleyin. -->

---

# Uç durum — sık bölünme, tam tur

<iframe class="dsanim" src="anim/linear-hashing.html?yer=slayt&lang=tr&example=tight" title="Doğrusal hashleme: sık bölünme"></iframe>

<!-- Konuşma notu: N0=2, capacity=1 — bölünmeler o kadar sık olur ki tam bir tur tamamlanır, n sıfırlanır, level artar. -->

---

# Kod — address ve split

```c
int address(int key, int level, int n) {
    int a = key % (N0 << level);
    if (a < n) a = key % (N0 << (level + 1));
    return a;
}

void split(Hash *h) {
    int new_index = (N0 << h->level) + h->n;
    rehash_into(h, h->n, new_index);
    h->n++;
    if (h->n == (N0 << h->level)) { h->n = 0; h->level++; }
}
```

<!-- Konuşma notu: split() her zaman h->n üzerinde çalışır — çağrıyı tetikleyen kova ne olursa olsun. -->

---

# Karmaşıklık

- O(1) ortalama ekleme — genişleyebilir hashlemeyle aynı
- SIFIR dizin belleği: yalnız iki tam sayı, level ve n
- Takas: tekil bir kovanın boyutu daha gevşek sınırlı
- Taşan ama sırası gelmemiş bir kova basitçe büyümeye devam eder

<!-- Konuşma notu: Sadelik (dizin yok), herhangi bir tekil kovanın en kötü durumu üzerinde daha gevşek bir sınırla ödenir. -->

---

# Sık yapılan hatalar

- Kova n yerine TAŞAN kovayı bölmek
- Bir adres hesaplarken `a < n` düzeltmesini unutmak
- n'i asla sıfıra sıfırlamamak ve level'i ilerletmemek

<!-- Konuşma notu: Bölünme hedefi her zaman "sıralı düzende sırada gelen kova"dır — tamamen öngörülebilir. -->

---

# Mini soru

Doğrusal hashleme neden dizinden
tamamen kaçınabilir, genişleyebilir hashleme kaçınamazken?

<!-- Konuşma notu: Bir sonraki bölünme hedefinin ne kadar öngörülebilir olduğunu düşünün. -->

---

# Cevap

**Bölünme hedefi yalnız level ve n'den
tamamen öngörülebilir.** Hangi girdinin
hangi kovaya işaret ettiğini kaydetmeye gerek yok.

<!-- Konuşma notu: Bedel: bir kova, kendi bölünme sırası gelene kadar kapasitesinin ötesinde büyüyebilir. -->

---

<!-- _class: bolum -->

# 10. Dış Birleştirmeli Sıralama

<!-- Konuşma notu: Bölüm 10, RAM'e sığmayan bir dosyayı sıralamayı ele alıyor — Hafta 10'unkinden gerçekten farklı bir algoritma. -->

---

# Başlangıç sorusu

Hafta 10 RAM'e sığan dizileri sıraladı.
Milyarlarca kayıtlık bir dosya sığmaz.
"Diğer yarı" diskte yaşadığında ne değişir?

<!-- Konuşma notu: Böl adımı kolayca uyarlanır; birleştir adımı temelden farklı bir gerçekleme ister. -->

---

# Kısa bir tarihçe — bant çağı

- 1950–60'ların mainframe'leri RAM'den çok daha büyük dosyaları sıraladı
- Manyetik bant: yalnız sıralı erişim, rastgele atlama yok
- "Birleştirme" genelde mevcut olan TEK verimli işlemdi
- Knuth'un TAOCP Cilt 3'ü (1973): klasik, kapsamlı referans

<!-- Konuşma notu: İki-fazlı çalışma-sonra-birleştir yapısı doğrudan bu bant çağına uzanır. -->

---

# Fikir: küçük sıralı çalışmalar, sonra k-yollu birleştirme

- Faz 1: RUN_SIZE parçaları, RAM'de sıralanır, ÇALIŞMA olarak yazılır
- Faz 2: FAN_IN çalışmayı birleştir, çalışma başına TEK arabellek
- Şu anki en küçük arabellek değerini seç, yaz, yeniden doldur
- Tam olarak TEK çalışma kalana dek geçişleri tekrarla

<!-- Konuşma notu: RAM her zaman yalnız FAN_IN arabellek artı bir çıktı arabelleği tutar, dosya ne kadar dev olursa olsun. -->

---

# Yalnız kalan bir çalışma dokunulmadan taşınır

- Bir grupta yalnız 1 çalışma kaldıysa, birleşecek bir şey yok
- Bir sonraki geçişe dokunulmadan taşı — sıfır G/Ç
- Tek bir çalışmaya okuma+yazma harcamak sık görülen bir hatadır
- Bu iyileştirme tek sayıda çalışmada en çok önemlidir

<!-- Konuşma notu: Bu, bu haftanın programlarının gerçeklediği küçük ama gerçek bir iyileştirmedir. -->

---

# Dış birleştirmeli sıralama, adım adım

<iframe class="dsanim" src="anim/external-merge-sort.html?yer=slayt&lang=tr" title="Dış birleştirmeli sıralama"></iframe>

<!-- Konuşma notu: Normal örnek: 12 değer, RUN_SIZE=4, FAN_IN=2 — ilk birleştirmenin çalışma başına küçük arabelleklerinin tüketildikçe küçülmesini izleyin. -->

---

# Uç durum — RUN_SIZE=1, çok geçiş

<iframe class="dsanim" src="anim/external-merge-sort.html?yer=slayt&lang=tr&example=tiny-runs" title="Dış birleştirmeli sıralama: çok geçiş"></iframe>

<!-- Konuşma notu: Her değer kendi çalışması olarak başlar — normal durumdan çok daha fazla birleştirme geçişi gerekir. -->

---

# Kod — merge_group

```c
Run merge_group(Run group[], int g) {
    int ptr[FAN_IN] = {0};
    Run out = new_run();
    while (1) {
        int best = -1, best_val = INT_MAX;
        for (int i = 0; i < g; i++)
            if (ptr[i] < group[i].n && group[i].keys[ptr[i]] < best_val)
                { best_val = group[i].keys[ptr[i]]; best = i; }
        if (best == -1) break;
        append(&out, best_val);
        ptr[best]++;
    }
    return out;
}
```

<!-- Konuşma notu: Yalnız her çalışmanın ŞU ANKİ ön değeri RAM'de olmalı — asla tüm bir çalışma birden değil. -->

---

# Bu program GERÇEK dosyalar yaratır — güvenli

- Gerçek çalışma dosyaları, ama yalnız kendi kurduğu bir LAB KLASÖRÜNDE
- `lab_external_merge_sort/`, programın kendisi tarafından yaratılır
- Program çıkmadan önce her dosya, ve klasör, silinir
- Diskte başka hiçbir yere hiçbir şey yazılmaz

<!-- Konuşma notu: Hem external_merge_sort hem replacement_selection aynı güvenli lab-klasörü örüntüsünü izler. -->

---

# Karmaşıklık

- Faz 1: ceil(n/RUN_SIZE) çalışma, her biri 1 okuma + 1 yazma
- Geçişler: O(log_FAN_IN(n/RUN_SIZE))
- Her geçiş her kayda bir kez dokunur: geçiş başına O(n/B) G/Ç
- Toplam: O((n/B) · log_FAN_IN(n/RUN_SIZE))

<!-- Konuşma notu: Tüm dosyayı tek seferde belleğe yüklemeye çalışan saf bir yaklaşımdan çarpıcı biçimde daha az. -->

---

# Sık yapılan hatalar

- Yalnız kalan bir çalışmayı yine de birleştirmek (israf edilen okuma+yazma)
- Bir birleştirme sırasında tüm bir çalışmayı RAM'de tamponlamak
- RAM'in gerçekten tutabileceğinden büyük bir FAN_IN seçmek

<!-- Konuşma notu: FAN_IN arabellek, aynı anda birleştirilen çalışma başına bir — kolaylıkla değil, gerçek bellekle sınırlı. -->

---

# Mini soru

Dış birleştirmeli sıralama neden dosya
ne kadar dev olursa olsun yalnız O(FAN_IN) RAM arabelleğine ihtiyaç duyar?

<!-- Konuşma notu: k-yollu bir birleştirmenin bir seferde bir çalışmanın ne kadarını gerçekten görmesi gerektiğini düşünün. -->

---

# Cevap

**k-yollu bir birleştirme yalnız her
çalışmanın ŞU ANKİ ön değerine ihtiyaç
duyar.** Çalışmalar zaten sıralıdır.

<!-- Konuşma notu: Hafta 10'un iki-yollu birleştirmesinin genellenmiş hâli, o da her zaman yalnız iki "şu anki" elemana bakar. -->

---

<!-- _class: bolum -->

# 11. Yerine Koyarak Seçim: Daha Uzun Çalışmalar

<!-- Konuşma notu: Bölüm 11 soruyor: Faz 1'in çalışmaları AYNI RAM kullanarak RAM'den daha uzun yapılabilir mi? -->

---

# Başlangıç sorusu

Bölüm 10'un Faz 1'i her zaman tam
RUN_SIZE uzunluğunda çalışmalar yapar.
Aynı RAM, RUN_SIZE'dan UZUN çalışmalar üretebilir mi?

<!-- Konuşma notu: Yerine koyarak seçimin cevabı: son YAZILAN'dan küçük bir kayıt, bunun yerine bir sonraki çalışmayı başlatır. -->

---

# Fikir: current ile next, son YAZMAYA göre kararlaştırılır

- Küçük bir RAM penceresi tut (üretimde bir min-heap)
- En küçük CURRENT-etiketli kaydı çıkar, yaz
- Yeni kayıt `>= son yazılan`? CURRENT etiketle (çalışmayı uzatabilir)
- Yeni kayıt `< son yazılan`? NEXT etiketle (bir sonraki çalışmayı bekler)

<!-- Konuşma notu: Karşılaştırma son YAZILAN değere karşıdır, asla pencerenin kendi şu anki minimumuna karşı değil. -->

---

# En iyi durum, ortalama durum, en kötü durum

- Tüm pencere NEXT-etiketli: şu anki çalışma biter, yeniden etiketle, yeni çalışma
- Rastgele veri: çalışmalar ortalama pencere boyutu m'in yaklaşık **2 katı**
- Zaten sıralı girdi: dosya ne kadar büyük olursa olsun TEK çalışma
- Kesin azalan girdi: en kötü durum, çalışma başına tam olarak m

<!-- Konuşma notu: En kötü durum, Bölüm 10'un düz sabit-boyutlu parçalamasından daha iyi değildir — kazanç ortalama-durum, garanti değil. -->

---

# Yerine koyarak seçim, adım adım

<iframe class="dsanim" src="anim/replacement-selection.html?yer=slayt&lang=tr" title="Yerine koyarak seçim"></iframe>

<!-- Konuşma notu: Normal örnek: RAM=4, 12 karışık değer — pencere kutularının "current" ile "next" arasında geçiş yapmasını izleyin. -->

---

# Uç durum — en iyi durum, RAM >= n

<iframe class="dsanim" src="anim/replacement-selection.html?yer=slayt&lang=tr&example=ram-covers-all" title="Yerine koyarak seçim: en iyi durum"></iframe>

<!-- Konuşma notu: Her şeyi tutacak kadar büyük RAM ile, sonuç girdi sırasına bakılmaksızın her zaman TEK, tam sıralı bir çalışmadır. -->

---

# Kod — extract_min_current

```c
int extract_min_current(Item window[], int w) {
    int best = -1;
    for (int i = 0; i < w; i++)
        if (window[i].tag == CURRENT &&
            (best == -1 || window[i].val < window[best].val))
            best = i;
    return best;
}
```

<!-- Konuşma notu: Hiçbir şey CURRENT etiketli değilse -1 döner — bu çalışmanın bittiğinin sinyalidir. -->

---

# Bu program da GERÇEK dosyalar yaratır — güvenli

- `lab_replacement_selection/`, programın kendisi tarafından yaratılır
- Program çıkmadan önce her çalışma dosyası silinir
- Çalışma sınırları bu haftanın animasyonuyla tam eşleşir
- Üretim bir sürümü pencereyi gerçek bir min-heap olarak tutar

<!-- Konuşma notu: Buradaki kod, açıklık için pencereyi kayıt başına O(m) doğrusal tarar — bir heap O(log m) yapar. -->

---

# Karmaşıklık

- Çalışma yaratma için toplam O(n) G/Ç — Bölüm 10 Faz 1'iyle aynı
- Rastgele veride E[çalışma uzunluğu] ≈ 2m — yarı kadar sonraki geçiş
- extract_min_current: burada O(m), gerçek bir heap'le O(log m)
- En kötü durum (azalan girdi): düz parçalamadan daha iyi değil

<!-- Konuşma notu: Bu ortalama-durum kazancı, gerçek veritabanı ve işletim sistemi sıralama araçlarının yerine koyarak seçim kullanmasının tam nedenidir. -->

---

# Sık yapılan hatalar

- Pencerenin minimumuna karşı karşılaştırmak, son YAZMAYA karşı değil
- Yeni bir çalışma başladığında last_written'ı sıfırlamayı unutmak
- "2x" ortalamasının en kötü durumda da geçerli olduğunu varsaymak

<!-- Konuşma notu: Önceki çalışmanın son değerini taşımak, yeni çalışmanın en erken kayıtlarından bazılarını yanlış etiketlerdi. -->

---

# Mini soru

Yerine koyarak seçim neden ortalama
olarak pencere boyutu m'in yaklaşık İKİ KATI uzunlukta çalışmalar üretir?

<!-- Konuşma notu: Herhangi bir anda pencerenin ne kadarının tipik olarak CURRENT etiketli olduğunu düşünün. -->

---

# Cevap

**Herhangi bir anda pencerenin kabaca
yarısı CURRENT kalır, sürekli tazelenir.**
Çalışma bitmeden önce ~2m'ye büyür.

<!-- Konuşma notu: Knuth'un TAOCP, Cilt 3'ünde tam olarak incelenen klasik bir sonuç. -->

---

<!-- _class: bolum -->

# 12. Bir Dosya Organizasyonu Seçmek

<!-- Konuşma notu: Kapanış bölümü, bu haftanın kapsadığı her şeyi tek bir karar tablosuna dönüştürüyor. -->

---

# Karşılaştırma tablosu (1/2)

| Yapı | Arama | Ekleme |
| --- | --- | --- |
| Sıralı dosya (H13) | O(log(n/B)) | O(n/B) kaydırma |
| Kova hash (H13) | ~O(1) + taşma | ~O(1) + taşma |
| Birincil/ikincil dizin | O(1) sayfa + ücretsiz tarama | Pahalı |
| ISAM | O(L) + taşma zinciri | O(L) + zincire ekleme |

<!-- Konuşma notu: Dizin satırları çoğunlukla statik bir dosyayı varsayar; ISAM'ın taşma alanı eklemeleri katlanılabilir kılan şeydir. -->

---

# Karşılaştırma tablosu (2/2)

| Yapı | Aralık sorgusu | Yeniden düzenleme? |
| --- | --- | --- |
| B-ağacı | Tekrarlanan inişler | Asla |
| B+-ağacı | Mükemmel (zincir) | Asla |
| Genişleyebilir hashleme | Zayıf (sıra yok) | Asla |
| Doğrusal hashleme | Zayıf (sıra yok) | Asla |

<!-- Konuşma notu: "Asla yeniden düzenleme", B-ağacı ailesinin logaritmik aramanın yanındaki diğer büyük özelliğidir. -->

---

# Büyük tek karar

- SIRAYA mı ihtiyacınız var (aralık sorguları, sıralı gezinme)?
- Yoksa yalnız TAM-EŞLEŞME aramaları mı?
- Sıra önemliyse: bir B+-ağacının yaprak zincirini yenmek zor
- Yalnız tam-eşleşme, sürekli büyüyen dosya: hashleme genelde kazanır

<!-- Konuşma notu: Bu, Hafta 13'ün ilk sorduğu, bu haftanın eklediği her şeyle keskinleşen aynı sorudur. -->

---

# Özet (1/2)

- **Dizinler:** birincil (seyrek), ikincil (yoğun), ISAM
- ISAM, dizin SEVİYELERİ ve bir TAŞMA ALANI ekler
- **B-ağaçları** (Bayer/McCreight 1972): bölme, arama, ödünç/birleştirme
- **B+-ağaçları:** yaprak ZİNCİRİ aralık sorgularını hızlandırır

<!-- Konuşma notu: B-ağacı ailesindeki her işlem ağacı ilerledikçe dengeli tutar — hiçbir ayrı yeniden dengeleme geçişi olmadan. -->

---

# Özet (2/2)

- **Genişleyebilir hashleme** (Fagin vd. 1979): katlanan bir dizin
- **Doğrusal hashleme** (Litwin 1980): dizin yok, sıralı bölünmeler
- **Dış birleştirmeli sıralama:** küçük çalışmalar, k-yollu birleştirme
- **Yerine koyarak seçim:** aynı RAM'den ~2 kat daha uzun çalışmalar

<!-- Konuşma notu: Her iki hashleme planı da tek seferde bir kova, talep üzerine, hiç yeniden düzenleme geçişi olmadan büyür. -->

---

<!-- _class: bolum -->

# Kendini Sınama Özeti

<!-- Konuşma notu: On soru, haftanın notlarından yeniden ifade edilmiş, her biri bir slayt çifti. -->

---

# 1. Birincil bir dizin neden taranması SIFIR disk G/Ç'sine mal olur?

<!-- Konuşma notu: Bölüm 1'i hatırlayın. -->

---

# Bellekte kalacak kadar küçüktür — kayıt başına değil, SAYFA başına tek girdi.

<!-- Konuşma notu: Yalnızca işaret ettiği tek veri sayfası gerçek bir disk okumasıdır. -->

---

# 2. Yoğun bir dizin neden İKİNCİL anahtara göre sıralı olmalıdır?

<!-- Konuşma notu: Bölüm 2'yi hatırlayın. -->

---

# Veri dosyasının kendi sırası eşleşen kayıtların nerede olduğu hakkında hiçbir şey söylemez — yalnız dizinin kendi sırası söyler.

<!-- Konuşma notu: Yoğun bir dizinde tekrar eden değerlerin kümelenmesini sağlayan şey budur. -->

---

# 3. ISAM'ın taşma alanı, bir dosyanın hangi işlemi hemen yapmaktan kaçınmasına izin verir?

<!-- Konuşma notu: Bölüm 3'ü hatırlayın. -->

---

# Her eklemede tüm dosyayı yeniden bölmek ya da yeniden düzenlemek — bedeli, zincirler uzadıkça bozulan arama.

<!-- Konuşma notu: Bu takas, gerçek ISAM dosyalarının neden periyodik yeniden düzenlemeye ihtiyaç duyduğudur. -->

---

# 4. Bir B-ağacı bölünmesi neden her zaman tam olarak TEK anahtarı yukarı iter?

<!-- Konuşma notu: Bölüm 4'ü hatırlayın. -->

---

# Ortanca, bölünmeden sonra HİÇBİR yarıya tam sığmayan tek anahtardır — bu yüzden o yükseltilir.

<!-- Konuşma notu: Anahtarların yarısı kalır, yarısı yeni bir kardeşe geçer, ve ortanca ikisini ebeveynde ayırır. -->

---

# 5. B-ağacı araması neden en çok (yükseklik + 1) okumaya mal olur?

<!-- Konuşma notu: Bölüm 5'i hatırlayın. -->

---

# Her yaprak tam olarak aynı derinliktedir — ekleme ağacı yalnız kökten büyütür, hiç bir yapraktan değil.

<!-- Konuşma notu: Bir arama ya anahtarını erken bulur, ya da bir yaprağa iner — asla ötesine değil. -->

---

# 6. Bir B-ağacı neden birleştirmeye karşı ödünç almayı tercih eder?

<!-- Konuşma notu: Bölüm 6'yı hatırlayın. -->

---

# Ödünç alma yalnız 3 sayfaya dokunur ve hemen çözülür; birleştirme ağaçta daha yukarı yayılabilir.

<!-- Konuşma notu: Bir B-ağacı yalnız hiçbir kardeşin yedek anahtarı olmadığında birleşir. -->

---

# 7. Bir B+-ağacının aralık sorgularını hızlandıran TEK yapısal değişiklik nedir?

<!-- Konuşma notu: Bölüm 7'yi hatırlayın. -->

---

# Her yaprak sağ komşusuna bir next işaretçisi tutar — köke tırmanmaya hiç gerek olmayan bir zincir.

<!-- Konuşma notu: Sıradan bir B-ağacında komşu yapraklar arasında böyle bir kısayol yoktur. -->

---

# 8. Genişleyebilir hashlemenin dizini neden bazen katlanmak zorunda kalır?

<!-- Konuşma notu: Bölüm 8'i hatırlayın. -->

---

# Yalnız taşan kovanın local_depth'i global_depth'e yetiştiğinde — diğer kovalar etkilenmez.

<!-- Konuşma notu: Katlama, bir bölünmenin sonra ihtiyaç duyduğu yedek, daha özgül yuvaları yaratır. -->

---

# 9. Doğrusal hashleme neden taşan kovadan BAŞKA bir kovayı bölebilir?

<!-- Konuşma notu: Bölüm 9'u hatırlayın. -->

---

# Önceden, gerçekte hangi kovanın taştığından bağımsız, sabit, sıralı bir bölünme sırasına bağlanır.

<!-- Konuşma notu: Bu öngörülebilirlik, dizin ihtiyacını tamamen ortadan kaldıran şeydir. -->

---

# 10. Yerine koyarak seçim neden genelde pencere boyutu m'i ikiye katlar?

<!-- Konuşma notu: Bölüm 11'i hatırlayın. -->

---

# Pencere sürekli yeniden dolar: herhangi bir anda kabaca yarısı CURRENT kalır, çalışma ~2m'ye büyür.

<!-- Konuşma notu: Knuth'un TAOCP, Cilt 3'ünde incelenen klasik bir sonuç. -->

---

<!-- _class: baslik -->

# Gelecek hafta

**Hafta 15 — Final Proje Gösterimleri**

Bu hafta yeni algoritma yok: takımlar
projelerinin dosya-organizasyonu ya da
depolama bileşenini sunuyor, Hafta 16'nın final sınav döneminden önce.

<!-- Konuşma notu: Bu haftanın her yapısı günlük üretimde kullanılmaya devam ediyor — B+-ağaçları neredeyse her ilişkisel veritabanında, dış birleştirmeli sıralama her veritabanının sıralama/dizin-kurma aracında. -->

---

# Kaynaklar (1/2)

- Ders izlencesi, Hafta 14: `CEN207-2026-2027-Guz-Izlence.tr.md`
- Bayer, McCreight (1972). "Organization and Maintenance
  of Large Ordered Indexes"
- Fagin, Nievergelt, Pippenger, Strong (1979).
  "Extendible Hashing"
- Litwin (1980). "Linear Hashing: A New Tool for
  File and Table Addressing"

<!-- Konuşma notu: Bunlar, haftanın yazılı notlarının sonunda listelenen aynı kaynaklardır. -->

---

# Kaynaklar (2/2)

- Knuth. *TAOCP, Cilt 3: Sorting and Searching*, 2. baskı
- Cormen, Leiserson, Rivest, Stein. *Introduction
  to Algorithms*. MIT Press
- Sedgewick, Wayne. *Algorithms*, 4. baskı. Addison-Wesley
- williamfiset/Algorithms · Programiz DSA

<!-- Konuşma notu: Tarihsel kaynaklar — Bayer/McCreight, Fagin vd., Litwin — bugünün "kısa tarihçe" slaytlarının dayandığı kaynaklardır. -->
