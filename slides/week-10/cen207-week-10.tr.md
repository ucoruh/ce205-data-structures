---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Hafta 10 — Sıralama"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Hafta 10"
footer: "RTEÜ Bilgisayar Mühendisliği · 2026-2027 Güz"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Sıralama

**CEN207 Veri Yapıları — Hafta 10**

Dr. Öğr. Üyesi Uğur CORUH · 2026-2027 Güz

<!--
Konuşma notu: Bugün aynı diziyi on bir farklı şekilde sıralıyoruz, ve her birinin tam olarak neye mal olduğunu sayıyoruz. Sonunda, "hangi sıralamayı kullanmalıyım" sorusunun gerçek, sayısal bir yanıtı olacak.
-->

---

# Bugünün planı (3 saat)

| Saat | Konu |
| --- | --- |
| 1 | Maliyet modeli · kabarcık, seçmeli, eklemeli, shell sıralaması |
| 2 | Birleştirmeli sıralama (yukarıdan aşağı, aşağıdan yukarı) · hızlı sıralama (Lomuto, Hoare, en kötü durum) |
| 3 | Sayma, radix, kova sıralaması · kararlılık · deneysel karşılaştırma · seçim |

**Öğrenme çıktıları:** ÖÇ.1 (temel veri yapılarını açıklama) · ÖÇ.2 (karmaşıklık analizi) · ÖÇ.7 (doğru yapıyı seçme)

<!-- Konuşma notu: On dört kısa animasyon tüm dersi taşır; her algoritma tanıtıldığı yerde bir normal ve en az bir zor/uç çalışma alır. -->

---

# Bu haftanın kavramları — nerede

| Kavram | Nerede |
| --- | --- |
| Kabarcık, seçmeli, eklemeli, shell sıralaması | Bölüm 2–5 |
| Birleştirmeli sıralama (yukarıdan aşağı / aşağıdan yukarı) | Bölüm 6 |
| Hızlı sıralama (Lomuto / Hoare / en kötü durum) | Bölüm 7 |
| Sayma, radix, kova sıralaması | Bölüm 8–10 |
| Kararlılık, karşılaştırma, seçim | Bölüm 11–13 |

<!-- Konuşma notu: Her terim ilk göründüğü yerde tam tanımını alır; bu tablo yalnızca onu tekrar nerede bulacağınızı söyler. -->

---

# Kod örnekleri nasıl çalışır

- Her algoritmanın tam bir **C** ve **Java** programı var
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Kaynaklar: `code/week-10/c/` ve `code/week-10/java/`
- Her programın beklenen çıktısı hafta notlarında

<!-- Konuşma notu: Bunları canlı çalıştırmak isterseniz şimdi bir terminal açın; bugünkü her slaytta gösterilen kod tam olarak yazıldığı gibi derlenip çalışır. -->

---

# Hatırlatma — diziler ve Big-O (Hafta 1)

- Bugünkü her sıralama düz bir dizi üzerinde çalışır, O(1) erişim
- En iyi / ortalama / en kötü durum süsleme değil
- On bir farklı sıralamanın *neden* var olduğunun nedeni bu
- Aynı girdinin çılgınca farklı maliyetler verdiğini izleyin

<!-- Konuşma notu: Bu hafta, her şeyden önce, bir Big-O alıştırmasıdır — sayıların gerçek zamanlı ayrıştığını izleyeceksiniz. -->

---

# Hatırlatma — öbek sıralaması (Hafta 4)

- Zaten O(n log n), yerinde bir sıralama kurdunuz
- Bugün boyunca bir ölçüt olarak tutun
- Birleştirmeli sıralama garantisini eşler, O(n) ek bedelle
- Hızlı sıralama onu yalnızca **ortalamada** eşler

<!-- Konuşma notu: Öbek sıralaması bugün kendi bölümünü almıyor — zaten onu hak ettiniz — ama tüm öğleden sonra boyunca referans noktası olarak geri döner. -->

---

# İki gerçekten yeni fikir

- **Böl ve yönet**: böl, her yarıyı çöz, birleştir
- Birleştirmeli ve hızlı sıralamayı güçlendirir (Bölüm 6–7)
- **Karşılaştırmasız sıralama**: iki anahtarı asla karşılaştırma
- Sayma, radix, kova sıralamasını güçlendirir (Bölüm 8–10)

<!-- Konuşma notu: Her iki fikir de bu dersin ve bir sonrakinin geri kalanında sürekli tekrar karşınıza çıkacak. -->

---

# Bu haftanın haritası — bir bakışta

| O(n²) ailesi | Garantili O(n log n) |
| --- | --- |
| Kabarcık, seçmeli, eklemeli, shell | Birleştirmeli (yukarıdan aşağı, aşağıdan yukarı) |
| **Ortalama O(n log n)** | **Karşılaştırmasız, O(n+k)** |
| Hızlı sıralama (Lomuto, Hoare) | Sayma, radix, kova sıralaması |

<!-- Konuşma notu: Bu haritadaki her kutu aşağıda kendi slaytlarını alır, çoğu kısa bir animasyon ve tam bir C/Java programıyla. -->

---

# Mini soru

Bugünden önce karşılaştığınız her sıralama,
sıranın nasıl belirlendiği hakkında bir şey
varsayıyor. Nedir bu, ve bugünkü hangi üç sıralama bu kuralı bozar?

<!-- Konuşma notu: Bir an düşünmelerine izin verin — yanıt dersin tüm ikinci yarısını kurar. -->

---

# Yanıt

**İki anahtarı `<` ya da `>` ile karşılaştırmak.**
Sayma, radix ve kova sıralaması (Bölüm 8–10)
anahtarları asla karşılaştırmaz — konumları doğrudan hesaplar.

<!-- Konuşma notu: Bu haftanın en büyük tek fikir kayması budur: "karşılaştır ve daralt"tan "adresi hesapla"ya. -->

---

<!-- _class: bolum -->

# 1. Sıralama Problemi, ve Onu Ölçme Yöntemi

<!-- Konuşma notu: Bölüm 1, bugün her algoritmanın ölçüleceği iki sayıyı — karşılaştırmalar ve yazmalar — kurar. -->

---

# Başlangıç sorusu

Sıralama, bilgisayarlık tarihinde düzinelerce
farklı şekilde çözüldü. Problem bu kadar basit
göründüğüne göre, neden bu kadar çok yanıta ihtiyacı var?

<!-- Konuşma notu: Çünkü "diziyi yeniden düzenle" nasıl sorusuna muazzam bir alan bırakır: bellek bütçesi, girdi hakkında bildikleriniz, bağların hareket edip edemeyeceği. -->

---

# Sıralama problemi, yeniden ifade edilmiş

- `n` değerlik dizi, bir kural ("`a`, `b`'den küçük mü?")
- Her eleman bir sonrakine `<=` olacak şekilde yeniden düzenle
- Özgürlük: ne kadar ek bellek, neyi kullanıyorsunuz
- Özgürlük: eşit elemanların sırası değişebilir mi

<!-- Konuşma notu: O son özgürlük — kararlılık — çok önemli olduğu ortaya çıkıyor, ve bugün daha sonra kendi tam bölümünü (11) alıyor. -->

---

# Maliyeti ölçmek: iki sayı

| Miktar | Sayar | Önemli olduğunda |
| --- | --- | --- |
| karşılaştırmalar | her `<`/`>`/`==` | klasik maliyet ölçütü |
| taşımalar / yazmalar / yer değiştirmeler | her dizi yazması | kayıtlar büyük, ya da yazmalar pahalı |

<!-- Konuşma notu: Bu iki sayı her zaman bir kazanan konusunda hemfikir olmaz — Bölüm 12'nin animasyonu tam olarak bunu göstermek için beş algoritmayı yan yana koyar. -->

---

# Kararlılık, tanımlanmış

- Eşit anahtarlar çıktıda **girdi sırasını** korur
- Doğrulukla ilgili değil — çıktı yine de sıralıdır
- Bazı algoritmaların ücretsiz verdiği **ek** bir garanti
- Bölüm 11'de özel bir animasyon alır

<!-- Konuşma notu: Öğrencileri nota göre sıralayan kararlı bir sıralama, her aynı-not grubunu önceki (isim) sırasında bırakır; kararsız bir sıralama onları karıştırabilir. -->

---

# Yerinde mi, ek bellek mi?

- **Yerinde**: O(1) ek bellekle yeniden düzenler
- Kabarcık, seçmeli, eklemeli, shell, hızlı sıralama: yerinde
- Birleştirmeli sıralama O(n) ek ister — garantisinin bedeli
- Sayma/radix sıralaması da O(n+k) ek ister

<!-- Konuşma notu: Zaman ve alan her zaman bir ödünleşimdir — Bölüm 13 haftayı tek bir kazananla değil bir karar tablosuyla bitirir. -->

---

<!-- _class: bolum -->

# 2. Kabarcık Sıralaması

<!-- Konuşma notu: Bölüm 2, basit O(n²) ailesini en sezgisel fikirle açar: komşuları karşılaştır, yanlışsa yer değiştir, ve ne zaman durulacağını bil. -->

---

# Başlangıç sorusu

İki komşuyu karşılaştırıp ters sıradaysa yer
değiştirmek en doğal sıralama içgüdüsüdür.
Bu fikir tek başına sizi ne kadar ileri götürür?

<!-- Konuşma notu: Bir incelik eklerseniz şaşırtıcı derecede ileri: bir turun hiç yer değiştirme yapmadığını fark etmek. -->

---

# Kısa bir tarihçe

- Hızlı ya da birleştirmeli sıralamanın aksine tek bir adı geçen mucidi yok
- Bilgisayarlıktaki en eski sıralama fikirlerinden biri
- Literatürde 1950'lerin ortasından itibaren görünür
- İcat etmek için hiç zekâ gerektirmediği için ilk öğretilir

<!-- Konuşma notu: Yalnızca "bir tur sıfır yer değiştirme yaptı, dur" fark etme disiplini onu bir meraktan öğretmeye değer bir şeye çevirir. -->

---

# Kabarcık sıralaması fikri

- Soldan sağa yürü, her komşu çifti karşılaştır
- Sırası yanlışsa yer değiştir — büyük değer sağa "kabarcıklanır"
- Tüm yürüyüşü tekrarla, her seferinde bir hücre daha kısa
- **Erken çıkış**: sıfır yer değiştirmeli bir tur bitti demek

<!-- Konuşma notu: Her tur kuyrukta bir maksimumu daha yerleştirir; erken-çıkış bayrağı onu öğretmeye değer kılan tek şeydir. -->

---

# Kabarcık sıralaması, adım adım

<iframe class="dsanim" src="anim/bubble-sort.html?yer=slayt&lang=tr" title="Kabarcık sıralaması"></iframe>

<!-- Konuşma notu: Normal örnek: 10 sırasız değer — sağdaki sayaçları ve kuyruktan büyüyen "yerleşti" parantezini izleyin. -->

---

# Uç durum — zaten sıralı

<iframe class="dsanim" src="anim/bubble-sort.html?yer=slayt&lang=tr&example=already-sorted" title="Kabarcık sıralaması: zaten sıralı"></iframe>

<!-- Konuşma notu: Tek tur, sıfır yer değiştirme, erken çıkış — bu kabarcık sıralamasının O(n) en iyi durumu, görünür hale gelmiş. -->

---

# Kod — tur ve erken çıkış

```c
for (int pass = 0; pass < n - 1; pass++) {
    int swapped = 0;
    for (int i = 0; i < n - 1 - pass; i++) {
        if (a[i] > a[i + 1]) {
            int tmp = a[i]; a[i] = a[i + 1];
            a[i + 1] = tmp; swapped = 1;
        }
    }
    if (!swapped) break;
}
```

<!-- Konuşma notu: `n - 1 - pass` iç döngüyü her turda küçültür — kuyruk zaten yerleşmiştir ve tekrar kontrol edilmez. -->

---

# Karmaşıklık ve hatalar

- En iyi durum **O(n)**: zaten sıralı girdide erken çıkış
- En kötü/ortalama durum **O(n²)**: tersten sıralı ya da rastgele
- Sık hata: `>=` kullanmak, kararlılığı bozar
- Sık hata: erken-çıkış bayrağını tamamen unutmak

<!-- Konuşma notu: Bayrak olmadan, kabarcık sıralaması her zaman O(n²)'dir — bayrak onu öğretmeye değer kılan tüm nedendir. -->

---

# Mini soru

Kabarcık sıralaması neden **kararlı** — hangi
belirli kod satırı, iki eşit elemanın asla
birbirinin üzerinden geçirilmediğini garanti eder?

<!-- Konuşma notu: Onları karşılaştırma operatörünün kendisine yönlendirin. -->

---

# Yanıt

**`if (a[i] > a[i+1])`'deki kesin `>`.**
Eşit elemanlar asla `>`'yi sağlamaz, bu
yüzden asla yer değiştirmezler — girdi sıraları korunur.

<!-- Konuşma notu: O tek operatörü `>=`'ye çevirin, kararlılık gider, sıralanmış sonucun kendisinde hiçbir değişiklik olmadan. -->

---

<!-- _class: bolum -->

# 3. Seçmeli Sıralama

<!-- Konuşma notu: Bölüm 3, kabarcık sıralamasının birçok küçük yer değiştirmesini farklı bir maliyet profiliyle takas eder: tam taramalar, ama mümkün olan en az yazma. -->

---

# Başlangıç sorusu

Kabarcık sıralamasının tersten sıralı durumu 12
değeri sıralamak için 66 yer değiştirme yaptı.
Gerçek minimumu bir kez tarayıp doğrudan yerleştirseniz?

<!-- Konuşma notu: Yine de her seferinde kalanın tamamını taramanız gerekir — erken çıkış mümkün değildir — ama çok daha az yazarsınız. -->

---

# Kısa bir tarihçe

- Kabarcık sıralaması gibi, tek bir adı geçen mucidi yok
- "Kalan en küçüğü seç" fikrinin doğrudan algoritmik biçimi
- En az sıralamanın kendisi kadar eski
- Bugün minimal-yazma garantisi için değerli

<!-- Konuşma notu: Bu hafta karşılaştırmaları yazmalarla takas etmenin en net örneğidir — Bölüm 12'nin deneysel sayılarına bakın. -->

---

# Seçmeli sıralama fikri

- Her `i` için, `i+1..n-1`'i minimumun indisi için tara
- `i` konumuna yer değiştir — zaten oradaysa atla
- Sıralı bölge **soldan** büyür (kabarcık: sağdan)
- En çok `n-1` yer değiştirme, hiç — ama her zaman O(n²) tarama

<!-- Konuşma notu: Erken çıkış mümkün değildir: gerçek minimumu bulmak, dizi sıralı olsun olmasın, kalan her adayı kontrol etmeyi gerektirir. -->

---

# Seçmeli sıralama, adım adım

<iframe class="dsanim" src="anim/selection-sort.html?yer=slayt&lang=tr" title="Seçmeli sıralama"></iframe>

<!-- Konuşma notu: Normal örnek: tarama daha küçük adaylar bulduğunda `min_idx`'in güncellenmesini, sonra yerine tek yer değiştirmeyi izleyin. -->

---

# Uç durum — zaten sıralı

<iframe class="dsanim" src="anim/selection-sort.html?yer=slayt&lang=tr&example=already-sorted" title="Seçmeli sıralama: zaten sıralı"></iframe>

<!-- Konuşma notu: Yine de tam n(n-1)/2 karşılaştırma, ve sıfır yer değiştirme — burada kabarcık sıralamasının aksine erken çıkış yoktur. -->

---

# Kod — minimumu bul, bir kez yer değiştir

```c
for (int i = 0; i < n - 1; i++) {
    int min_idx = i;
    for (int j = i + 1; j < n; j++)
        if (a[j] < a[min_idx]) min_idx = j;
    if (min_idx != i) {
        int tmp = a[i];
        a[i] = a[min_idx]; a[min_idx] = tmp;
    }
}
```

<!-- Konuşma notu: `i` zaten minimumsa yer değiştirme tamamen atlanır — eklemeye değer birkaç "boşa iş" kontrolünden biri. -->

---

# Karmaşıklık ve hatalar

- En iyi/ortalama/en kötü: hepsi her zaman **O(n²)** karşılaştırma
- En çok **n-1** yer değiştirme — bugünkü herhangi bir sıralamanın en azı
- Sık hata: koşulsuz yer değiştirmek, yazma israfı
- **Kararlı değil**: uzun-mesafeli yer değiştirme bir bağı sıçratabilir

<!-- Konuşma notu: Seçmeli sıralama ve hızlı sıralama bu haftanın en net iki kararsızlık örneğidir — Bölüm 11 nedenini gösterir. -->

---

# Mini soru

Seçmeli sıralama, girdi ne olursa olsun en çok
`n-1` yer değiştirme yapar. Bu sınır dizi ne
kadar karışık olursa olsun neden geçerlidir?

<!-- Konuşma notu: Onları dış-döngü tekrarı başına kaç yer değiştirme olduğuna yönlendirin. -->

---

# Yanıt

**Dış-döngü adımı başına en çok bir yer değiştirme.**
Hareket etmesi gereken her eleman bir kez, doğrudan
son yerine hareket eder — `n-1` adım, en çok `n-1` yer değiştirme.

<!-- Konuşma notu: Kötü konumlanmış bir değerin bir hücrede süründüğü kabarcık sıralamasıyla karşılaştırın — toplamda en çok n(n-1)/2 yer değiştirme. -->

---

<!-- _class: bolum -->

# 4. Eklemeli Sıralama

<!-- Konuşma notu: Bölüm 4 zaten tahtada çizdiğiniz sıralamadır — resim, insanların bir deste kartı nasıl sıraladığıyla tam olarak eşleşir. -->

---

# Başlangıç sorusu

Bir deste oyun kartını sıralamayı düşünün.
Hiçbir zaman her kartı her kartla karşılaştırmazsınız.
Onun yerine gerçekte ne yaparsınız?

<!-- Konuşma notu: Küçük, sıralı bir el tutarsınız, ve her yeni kartı ait olduğu tek boşluğa kaydırırsınız. -->

---

# Kısa bir tarihçe

- Kart-sıralama fikrinin kendisi — tek bir mucidi yok
- En eski, en sezgisel sıralama yöntemlerinden biri
- Eğitmenin kendi tahta çizimleri tam olarak bu modeli kullanır
- Gerçek kütüphane sıralamaları küçük alt diziler için ona döner

<!-- Konuşma notu: C'nin qsort'u ve Java'nın Arrays.sort'u, özyinelemeli bir alt dizi ~16-32 elemanın altına küçüldüğünde eklemeli sıralamaya geçer. -->

---

# Eklemeli sıralama fikri

- `A[0..i-1]` her zaman **zaten sıralı**
- `A[i]`'yi **anahtar** (kırmızı kutu) olarak dışarı çek
- Her `> key` elemanı bir hücre sağa kaydır
- Anahtarı açtığı boşluğa bırak

<!-- Konuşma notu: Boşluk her kaydırmada sola hareket eder; bir karşılaştırma "büyük değil" bulduğu an anahtar içine düşer. -->

---

# Tahta-çizimi modeli

- `A[0..i-1]` üzerinde **parantez**: "zaten sıralı"
- **Kırmızı kutu**: anahtar, diziden dışarı çekilmiş
- **`<= key`** bölgesi kalır; **`> key`** bölgesi kayar
- **Kaydırma oku**: boşluğun bir adım sola hareketi

<!-- Konuşma notu: Bu, tahtada her zaman tam olarak bu şekilde çizilir — animasyon onunla eleman eleman eşleşir. -->

---

# Eklemeli sıralama, adım adım

<iframe class="dsanim" src="anim/insertion-sort.html?yer=slayt&lang=tr" title="Eklemeli sıralama"></iframe>

<!-- Konuşma notu: Normal örnek: kırmızı anahtar kutusunu, büyüyen "zaten sıralı" parantezini, ve kaydırma oklarını birer birer izleyin. -->

---

# Uç durum — tersten sıralı

<iframe class="dsanim" src="anim/insertion-sort.html?yer=slayt&lang=tr&example=reverse-sorted" title="Eklemeli sıralama: tersten sıralı"></iframe>

<!-- Konuşma notu: En kötü durum — her tek anahtar başa kadar tamamen kayar, bir seferde bir hücre. -->

---

# Kod — anahtarı çek, kaydır, bırak

```c
for (int i = 1; i < n; i++) {
    int key = a[i];
    int j = i - 1;
    while (j >= 0 && a[j] > key) {
        a[j + 1] = a[j];
        j--;
    }
    a[j + 1] = key;
}
```

<!-- Konuşma notu: `j >= 0` sınır kontrolü `&&`'de önce gelmeli — a[-1]'i okumaya asla gerek yok. -->

---

# Karmaşıklık ve hatalar

- En iyi durum **O(n)**: zaten sıralı, `i` başına bir kontrol
- En kötü durum **O(n²)**: tersten sıralı, tam kaydırmalar
- Sık hata: `>=` yerine `>` kararlılığı bozar
- Sık hata: `a[j] > key`'i `j >= 0`'dan önce kontrol etmek

<!-- Konuşma notu: Küçük ortalama-durum sabiti, pratikte küçük ya da neredeyse sıralı diziler için onu gerçekten hızlı yapar. -->

---

# Mini soru

Eklemeli sıralamanın en iyi durumu neden tam
olarak O(n)'dir, ve hangi belirli gerçek-dünya
veri türü bu en iyi durumu yaygın durum yapar?

<!-- Konuşma notu: Neredeyse-sıralı veri — günlük dosyaları, küçük bir güncellemeden sonra yeniden sıralama — tam olarak eklemeli sıralamanın en tatlı noktasıdır. -->

---

# Yanıt

**Zaten sıralı (ya da neredeyse öyle) girdi.**
Her `a[j] <= key` kontrolü hemen başarılı olur,
bu yüzden n dış adımının çoğu yalnızca O(1)'e mal olur.

<!-- Konuşma notu: Seçmeli sıralama bu avantajın hiçbirini elde edemez — tam taraması girdinin ne kadar sıralı olduğundan bağımsızdır. -->

---

<!-- _class: bolum -->

# 5. Shell Sıralaması

<!-- Konuşma notu: Bölüm 5 sorar: eklemeli sıralama, son turdan ÖNCE kötü konumlanmış elemanları evlerinin çoğu yoluna taşısaydı ne olurdu? -->

---

# Başlangıç sorusu

Eklemeli sıralama tam olarak bir eleman evinden
uzakta başladığında yavaştır. Önce o mesafenin
çoğunu büyük sıçramalarla kapatsanız?

<!-- Konuşma notu: Donald Shell tam olarak bu soruyu 1959'da sordu ve en kötü durumda düz O(n²)'yi aşan ilk sıralamayı yayımladı. -->

---

# Kısa bir tarihçe

- Donald L. Shell, "A High-Speed Sorting Procedure"
- *Communications of the ACM*, 1959
- Düz O(n²)'yi aşan ilk sıralama algoritması
- Aralık dizisi seçimi hâlâ açık bir araştırma alanı

<!-- Konuşma notu: Bu derste gerçekten nadir bir şey: adı geçen bir kişi, adı geçen bir makale, belirli bir yıl, hâlâ aktif olarak araştırılıyor. -->

---

# Shell sıralaması fikri

- Eklemeli sıralama, ama 1 değil `gap` konum uzaklıkta karşılaştırma
- `gap = n/2` ile başla, her turda yarıya indir, `gap = 1`'de bitir
- Büyük aralıklar uzak elemanları tek sıçramada evine taşır
- `gap = 1`'de, dizi "neredeyse sıralı" — ucuz bir tur

<!-- Konuşma notu: Son gap=1 turu tam anlamıyla düz eklemeli sıralamadır, ama neredeyse hiç kaydırmaya ihtiyacı olmayan veride. -->

---

# Shell sıralaması, adım adım

<iframe class="dsanim" src="anim/shell-sort.html?yer=slayt&lang=tr" title="Shell sıralaması"></iframe>

<!-- Konuşma notu: Normal örnek: aralık dizisi 5, 2, 1 — son gap=1 turunun ne kadar az kaydırmaya ihtiyacı olduğunu izleyin. -->

---

# Uç durum — tersten sıralı

<iframe class="dsanim" src="anim/shell-sort.html?yer=slayt&lang=tr&example=reverse-sorted" title="Shell sıralaması: tersten sıralı"></iframe>

<!-- Konuşma notu: Bunu Bölüm 4'ün düz-eklemeli-sıralama tersten-sıralı örneğiyle karşılaştırın — burada çok daha az toplam kaydırma. -->

---

# Kod — aralıklı eklemeli sıralama

```c
for (int gap = n/2; gap > 0; gap /= 2) {
    for (int i = gap; i < n; i++) {
        int key = a[i];
        int j = i;
        while (j >= gap && a[j-gap] > key) {
            a[j] = a[j - gap];
            j -= gap;
        }
        a[j] = key;
    }
}
```

<!-- Konuşma notu: Her satır düz eklemeli sıralamayla tam olarak eşleşir, "1" her yerde "gap" ile değiştirilmiş. -->

---

# Karmaşıklık ve hatalar

- Bu basit aralık diziyle en kötü durum **O(n²)**
- Pratikte düz eklemeli sıralamadan çok daha hızlı
- Daha iyi diziler (Hibbard, Sedgewick) sınırı düşürür
- **Kararlı değil**: aralıklı hareketler eşit elemanları geçebilir

<!-- Konuşma notu: Önemli fikir aralığın kendisidir — tam optimal dizi bu dersin kapsamı dışında bir araştırma sorusudur. -->

---

# Mini soru

Tersten sıralı örnekte, en küçük değer son
indiste başlar. Üç aralık turu boyunca toplam
kaç kaydırma gerekir?

<!-- Konuşma notu: Bunu düz eklemeli sıralamanın aynı değer için ihtiyaç duyacağı 11 tek-hücrelik kaydırmayla karşılaştırın. -->

---

# Yanıt

**Toplam dört kaydırma** (büyüklükleri 6, 3, 1, 1) —
düz eklemeli sıralamanın 11 tek-hücrelik kaydırmaya
ihtiyaç duyacağı aynı 11-konumluk mesafeyi kaplayarak.

<!-- Konuşma notu: Büyük erken aralıklar kaydırma başına çok daha fazla zemin kaplar — shell sıralamasının hızının arkasındaki tüm mekanizma budur. -->

---

<!-- _class: bolum -->

# 6. Birleştirmeli Sıralama

<!-- Konuşma notu: Bölüm 6 böl-ve-yönet'i tanıtır: böl, her yarıyı aynı şekilde çöz, birleştir — bugünkü ilk O(n log n) garantisi. -->

---

# Başlangıç sorusu

Elemanları tek bir dizinin içinde hareket
ettirmek yerine, onu ikiye bölseydiniz, her
yarıyı tamamen sıralasaydınız, sonra birleştirseydiniz?

<!-- Konuşma notu: İki zaten-sıralı yarıyı birleştirmek ucuzdur — geriye kalan tek soru her yarıyı nasıl sıralayacağınızdır. -->

---

# Kısa bir tarihçe

- **John von Neumann**, 1945
- Saklı-program bir bilgisayar için ilk algoritmalardan biri
- Bilgisayarlıkta **böl ve yönet**in kurucu örneği
- Örüntü bu dersin geri kalanında sürekli tekrar karşınıza çıkar

<!-- Konuşma notu: 1945, bugünkü hemen hemen her diğer adı geçen algoritmadan önce gelir — birleştirmeli sıralama gerçekten en eskilerden biridir. -->

---

# Böl-ve-yönet fikri

- `[lo, hi)`'yi orta noktasından ikiye böl
- Her yarıyı aynı şekilde özyinelemeli olarak sırala
- İki sıralı yarıyı bir yardımcı diziyle **birleştir**
- `log2(n)` seviye × seviye başına `O(n)` = **O(n log n)**

<!-- Konuşma notu: Bu her durumda geçerlidir — en iyi, ortalama, en kötü — bugün bu garantiye sahip tek algoritma. -->

---

# Garanti neden hiç bozulmaz

- Hiçbir yerde erken çıkış, veriye bağlı kısayol yok
- Her seviye her zaman her elemana bir kez dokunur
- Bedel: `n` büyüklüğünde bir yardımcı dizi — O(n) ek
- İki eşdeğer biçim: yukarıdan aşağı, aşağıdan yukarı

<!-- Konuşma notu: O O(n) ek bellek, birleştirmeli sıralamanın koşulsuz garantisinin tek gerçek bedelidir. -->

---

# Yukarıdan aşağı — satır olarak özyineleme derinliği

- `d=0`: tüm dizi; `d=1`: iki yarı; …
- Bölme değerleri hiç değiştirmez, yalnızca parantez sınırlarını
- Sonra birleştirme aynı satırlarda geri yukarı çıkar
- Son satır: tamamen sıralı dizi

<!-- Konuşma notu: Animasyon özyinelemeyi tam anlamıyla çizer — derinlik başına bir satır, aşağı inen bölme, daha da aşağı devam eden birleştirme. -->

---

# Birleştirmeli sıralama (yukarıdan aşağı), adım adım

<iframe class="dsanim" src="anim/merge-sort.html?yer=slayt&lang=tr" title="Birleştirmeli sıralama, yukarıdan aşağı"></iframe>

<!-- Konuşma notu: Normal örnek: bölme satırlarını (yalnızca parantezler, değer değişikliği yok), sonra sıralı sonucu kuran birleştirme satırlarını izleyin. -->

---

# Uç durum — zaten sıralı

<iframe class="dsanim" src="anim/merge-sort.html?yer=slayt&lang=tr&example=already-sorted" title="Birleştirmeli sıralama: zaten sıralı"></iframe>

<!-- Konuşma notu: Her bölme ve her birleştirme yine de tam olarak çalışır — birleştirmeli sıralamanın garantisi koşulsuzdur, kabarcık sıralamasının erken çıkışının aksine. -->

---

# Kod — birleştirme adımı

```c
int i = lo, j = mid, k = lo;
while (i < mid && j < hi)
    tmp[k++] = (a[i] <= a[j])
        ? a[i++] : a[j++];
while (i < mid) tmp[k++] = a[i++];
while (j < hi)  tmp[k++] = a[j++];
for (int x=lo; x<hi; x++) a[x]=tmp[x];
```

<!-- Konuşma notu: `<=` (`<` değil) eşitlikte her zaman sol çalışmayı tercih eder — birleştirmeli sıralamayı kararlı yapan tek seçim budur. -->

---

# Kod — özyinelemeli sürücü

```c
void merge_sort(int a[], int lo,
                 int hi, int tmp[]) {
    if (hi - lo <= 1) return;
    int mid = lo + (hi - lo) / 2;
    merge_sort(a, lo, mid, tmp);
    merge_sort(a, mid, hi, tmp);
    merge(a, lo, mid, hi, tmp);
}
```

<!-- Konuşma notu: `(lo+hi)/2` değil `lo + (hi-lo)/2` — tam sayı taşmasına yakın bile doğru kalan biçim. -->

---

# Aşağıdan yukarı — hiç özyineleme yok

- Her eleman genişliği 1 olan sıralı bir çalışma olarak başlar
- Bitişik çalışmaları genişlik-2'ye, sonra genişlik-4'e birleştir
- Katlama bir çalışma tüm diziyi kapladığında durur
- Aynı `merge()`, döngüyle değil çağrı yığınıyla ulaşılır

<!-- Konuşma notu: Aşağıdan yukarı, n ne kadar büyük olursa olsun bir çağrı yığınını asla taşıramaz — gerçek, pratik bir avantaj. -->

---

# Birleştirmeli sıralama (aşağıdan yukarı), adım adım

<iframe class="dsanim" src="anim/merge-sort-bottom-up.html?yer=slayt&lang=tr" title="Birleştirmeli sıralama, aşağıdan yukarı"></iframe>

<!-- Konuşma notu: Normal örnek: her turda genişlik etiketinin katlanmasını izleyin — width=1, 2, 4, 8 — hiçbir yerde özyineleme olmadan. -->

---

# Uç durum — n bir 2 kuvveti

<iframe class="dsanim" src="anim/merge-sort-bottom-up.html?yer=slayt&lang=tr&example=power-of-two" title="Birleştirmeli sıralama aşağıdan yukarı: 2 kuvveti"></iframe>

<!-- Konuşma notu: Burada her tur mükemmel şekilde eşit — "hard" örneğiyle karşılaştırın, her turun son çiftinin kısmi olduğu yerde. -->

---

# Kod — genişlik-katlama döngüsü

```c
for (int width=1; width<n; width*=2) {
    for (int lo=0; lo<n-width;
         lo += 2*width) {
        int mid = lo + width;
        int hi = min(mid+width, n);
        merge(a, lo, mid, hi, tmp);
    }
}
```

<!-- Konuşma notu: `min(mid+width, n)` kelepçesi hem 2-kuvveti hem eşit olmayan dizi büyüklüklerini hiç özel durum eklemeden ele alır. -->

---

# Karmaşıklık ve hatalar

- Her durumda **O(n log n)** — en iyi, ortalama, en kötü
- **O(n)** ek bellek — o garantinin bedeli
- **Kararlı**: `<=` eşitlik kırılımı her zaman sol çalışmayı tercih eder
- Sık hata: `<` yerine `<=` sessizce kararlılığı bozar

<!-- Konuşma notu: Öbek sıralaması (Hafta 4) bu her-zaman-O(n log n) garantisini paylaşır, ama ek belleğe ihtiyaç duymaz — birleştirmeli sıralama belleği kararlılıkla takas eder. -->

---

# Mini soru

Hem yukarıdan aşağı hem aşağıdan yukarı
birleştirmeli sıralama aynı toplam işi yapar.
Aşağıdan yukarının bir avantajını, yukarıdan aşağının bir avantajını adlandırın.

<!-- Konuşma notu: Açıklamadan önce bir an düşünmelerine izin verin — her iki yanıt da gerçekten pratiktir, yalnızca kuramsal değil. -->

---

# Yanıt

**Aşağıdan yukarı**: çağrı yığınını hiç kullanmaz,
onu taşıramaz. **Yukarıdan aşağı**: özyinelemeli
yapısı uyarlamak daha kolaydır — örn. erken eklemeli sıralamaya geçiş.

<!-- Konuşma notu: Üretim sıralama kütüphaneleri tam olarak bu ikinci optimizasyonu yapar — özyinelemeli yapı doğal bir uyum sağlar. -->

---

<!-- _class: bolum -->

# 7. Hızlı Sıralama

<!-- Konuşma notu: Bölüm 7 sorar: bir sıralama ortalamada O(n log n) garanti EDEBİLİR mi VE hiç ek dizi olmadan yerinde sıralayabilir mi? -->

---

# Başlangıç sorusu

Birleştirmeli sıralamanın O(n log n)'i O(n) ek
belleğe mal olur. Ortalamada aynı derecede hızlı
ama yerinde sıralayan böl-ve-yönet bir sıralama var mı?

<!-- Konuşma notu: Tony Hoare 1959-1960'ta tam olarak bunu icat etti, ve bugün gerçek yazılımda en çok kullanılan sıralamalardan biri olarak kalıyor. -->

---

# Kısa bir tarihçe

- **C. A. R. Hoare**, 1959–1960, Moskova Devlet Üniversitesi
- "Quicksort" olarak yayımlandı, *The Computer Journal*, 1962
- Hâlâ birçok dil kütüphanesinin varsayılan dizi sıralaması
- Bu derste en önemli sonuçlara sahip algoritmalardan biri

<!-- Konuşma notu: Hoare 26 yaşındaydı, bir makine-çevirisi projesinde ziyaretçi bir araştırmacıydı — hızlı sıralama neredeyse bir yan projeydi. -->

---

# Hızlı sıralama fikri

- Aralığın bir elemanını **pivot** olarak seç
- **Bölümle**: `<= pivot` sola, `>= pivot` sağa
- Sol parçayı ve sağ parçayı özyinelemeli olarak hızlı-sırala
- Ayrı bir "birleştir" adımı yok — bölümleme işi yapar

<!-- Konuşma notu: Her iki taraf özyinelemeli olarak sıralandığında, tüm aralık sıralıdır — soldaki her şey zaten sağdaki her şeyden <='dır. -->

---

# İki klasik bölümleme şeması

- **Lomuto**: pivot = son eleman, bir ileri tarama
- **Hoare**: pivot = ilk eleman, iki içeri tarama
- İkisi de yan yana incelenir — neredeyse herkesi
- ilk seferinde şaşırtan bir biçimde farklılaşırlar

<!-- Konuşma notu: Fark kozmetik değildir — özyinelemeli çağrı sınırlarını değiştirir, klasik bir birer-fazla-eksik hata kaynağı. -->

---

# Lomuto bölümleme — fikir

- Pivot = aralığın **son** elemanı
- `i`, "`<= pivot`" bölgesinin sınırını işaretler
- `j` soldan sağa tarar; `a[j] <= pivot` `i`'yi ilerletir
- Pivot `i+1`'e kayar — nihai, doğru konumu

<!-- Konuşma notu: Pivotun nihai konumu yapı gereği garanti edilir — bu, Lomuto'nun lo,p-1 / p+1,hi özyinelemesini doğru yapan şeydir. -->

---

# Hızlı sıralama (Lomuto), adım adım

<iframe class="dsanim" src="anim/quick-sort-lomuto.html?yer=slayt&lang=tr" title="Hızlı sıralama, Lomuto"></iframe>

<!-- Konuşma notu: Normal örnek: pivotu (kırmızı kutu), i sınırını, ve pivotun yerine son yer değiştirmesini izleyin. -->

---

# Uç durum — zaten sıralı

<iframe class="dsanim" src="anim/quick-sort-lomuto.html?yer=slayt&lang=tr&example=already-sorted" title="Hızlı sıralama Lomuto: zaten sıralı"></iframe>

<!-- Konuşma notu: Klasik tuzak — her bölümleme n-1'i 0'a karşı böler, mümkün olan en kötü bölünme. Bölüm 7'nin en-kötü-durum slaytları buna geri döner. -->

---

# Kod — Lomuto bölümleme

```c
int pivot = a[hi];
int i = lo - 1;
for (int j = lo; j < hi; j++) {
    if (a[j] <= pivot) {
        i++;
        int t=a[i]; a[i]=a[j]; a[j]=t;
    }
}
int t=a[i+1]; a[i+1]=a[hi]; a[hi]=t;
return i + 1;
```

<!-- Konuşma notu: Son üç satır pivotu garanti edilmiş nihai konumuna, i+1'e yerleştirir. -->

---

# Kod — Lomuto'nun özyinelemesi

```c
void quick_sort_lomuto(
        int a[], int lo, int hi) {
    if (lo < hi) {
        int p = partition_lomuto(
                    a, lo, hi);
        quick_sort_lomuto(a, lo, p-1);
        quick_sort_lomuto(a, p+1, hi);
    }
}
```

<!-- Konuşma notu: p-1 ve p+1 ikisi de pivotun kendisini dışlar, ki bu doğrudur çünkü Lomuto onun tam olarak p'de oturduğunu garanti eder. -->

---

# Hoare bölümleme — fikir

- Pivot = aralığın **ilk** elemanı
- İki işaretçi `i`, `j` her iki uçtan **içeri** doğru tarar
- Sırası yanlış bir çift bulunduğunda yer değiştir; tekrarla
- Pivotun nihai konumunun `j` olduğu **garanti değildir**

<!-- Konuşma notu: Bu "garanti değildir", Hoare'ın şeması hakkındaki tek en önemli gerçektir — özyineleme sınırlarını değiştirir. -->

---

# Hızlı sıralama (Hoare), adım adım

<iframe class="dsanim" src="anim/quick-sort-hoare.html?yer=slayt&lang=tr" title="Hızlı sıralama, Hoare"></iframe>

<!-- Konuşma notu: Normal örnek: iki işaretçinin içeri doğru taranıp yer değiştirmesini izleyin, toplam yer değiştirme sayısını Lomuto'nunkiyle karşılaştırın. -->

---

# Uç durum — hepsi eşit değer

<iframe class="dsanim" src="anim/quick-sort-hoare.html?yer=slayt&lang=tr&example=all-equal" title="Hızlı sıralama Hoare: hepsi eşit"></iframe>

<!-- Konuşma notu: Her değer pivota eşit olsa bile, tarama yine de doğru şekilde yakınsar — iyi bir değişmez kontrolü. -->

---

# Kod — Hoare bölümleme

```c
int pivot = a[lo];
int i = lo - 1, j = hi + 1;
while (1) {
    do { i++; } while (a[i] < pivot);
    do { j--; } while (a[j] > pivot);
    if (i >= j) return j;
    int t=a[i]; a[i]=a[j]; a[j]=t;
}
```

<!-- Konuşma notu: İki do-while döngüsü, her biri o tarafta pivotun kendi konumunda ya da öncesinde durması garantili. -->

---

# Kod — Hoare'ın özyineleme tuzağı

```c
void quick_sort_hoare(
        int a[], int lo, int hi) {
    if (lo < hi) {
        int p = partition_hoare(
                    a, lo, hi);
        quick_sort_hoare(a, lo, p);
        quick_sort_hoare(a, p+1, hi);
    }
}
```

<!-- Konuşma notu: Dikkat: p, p-1 DEĞİL — en yaygın hızlı sıralama hatası, çünkü Hoare pivotun p'de oturduğunu hiç garanti etmez. -->

---

# Hızlı sıralamanın en kötü durumu

- Yukarıdaki her iki şema da **sabit bir köşeyi** pivot seçer
- Her zaman en küçük/en büyük eleman = en kötü bölünme
- Sıralı ya da tersten sıralı girdi bunu doğrudan tetikler
- **Üçün-medyanı**, standart gerçek-dünya savunmasıdır

<!-- Konuşma notu: Zaten gördüğünüz aynı üç animasyon — Lomuto'nun zaten-sıralı örneği tam olarak bu tuzaktı. -->

---

# Pivot stratejilerini karşılaştırma

<iframe class="dsanim" src="anim/quick-sort-worst-case.html?yer=slayt&lang=tr" title="Hızlı sıralama en kötü durum"></iframe>

<!-- Konuşma notu: Aynı girdi, üç pivot stratejisi — ilk, orta, üçün-medyanı — karşılaştırmalar ve derinlik yan yana sayılmış. -->

---

# Uç durum — rastgele girdi

<iframe class="dsanim" src="anim/quick-sort-worst-case.html?yer=slayt&lang=tr&example=random" title="Hızlı sıralama en kötü durum: rastgele"></iframe>

<!-- Konuşma notu: Düşmanca bir yapısı olmayan rastgele veride, üç strateji de benzer performans gösterir — tuzak sıralı-benzeri girdiye ihtiyaç duyar. -->

---

# Sayılar, somutlaşmış

| Strateji | Karşılaştırma (n=14, sıralı) | Derinlik |
| --- | --- | --- |
| İlk eleman | 91 | 13 |
| Üçün medyanı | 31 | 3 |

<!-- Konuşma notu: Özdeş girdide 91'e karşı 31 — O(n²)'ye karşı O(n log n) bir soyutlama değil, tam olarak bu tablodur. -->

---

# Karşılaştırmalı-sıralama alt sınırı

- `n` ayrık elemanın `n!` olası sıralaması
- Hepsini ayırt eden bir karar ağacının ihtiyacı var
- en az `log2(n!)` seviyeye — ki bu **O(n log n)**
- Hiçbir karşılaştırmalı sıralama bu sınırı asla aşamaz

<!-- Konuşma notu: Bu gerçek bir teoremdir, bir kural-of-thumb değil — bunu bir alıştırmada kendiniz kanıtlayacaksınız. -->

---

# Karmaşıklık ve hatalar

- **Ortalama O(n log n)**, yerinde — pratikte en hızlısı
- Kötü seçilmiş, düşmanca bir pivotta **en kötü O(n²)**
- Sık hata: Lomuto'nun `p-1`'ini Hoare'ın `p`'siyle karıştırmak
- **Kararlı değil**: her iki şema da uzun mesafeler boyunca yer değiştirir

<!-- Konuşma notu: Bu tek karışıklık — p-1'e karşı p — öğrencilerin hızlı sıralamayı ezberden uygularken yazdığı en yaygın hatadır. -->

---

# Mini soru

Hoare'ın bölümlemesinin neden Lomuto'nunki gibi
`(lo, p-1)` değil `(lo, p)` ve `(p+1, hi)`
üzerine özyinelemesi gerektiğini bir cümleyle açıklayın.

<!-- Konuşma notu: Yanıt tamamen her şemanın pivotun nihai konumu hakkında gerçekte neyi garanti ettiğiyle ilgilidir. -->

---

# Yanıt

**Hoare pivotun `p`'de oturduğunu asla garanti etmez** —
yalnızca `<= p` olan her şeyin `<= pivot` olduğunu.
`p`'yi dışlamak (`p-1` gibi) sıralanmamış bir elemanı düşürebilir.

<!-- Konuşma notu: Lomuto'nun açık son yer değiştirmesi, p-1/p+1 özyinelemesini güvenli yapan tam olarak budur — Hoare'ın eşdeğer bir garantisi yoktur. -->

---

<!-- _class: bolum -->

# 8. Sayma Sıralaması

<!-- Konuşma notu: Bölüm 8, haftanın ikinci yarısını açar: iki anahtarı hiç birbirleriyle karşılaştırmayan sıralamalar. -->

---

# Başlangıç sorusu

O(n log n) alt sınırı yalnızca iki anahtarın
nasıl karşılaştırıldığını bildiğinizi varsayar.
Ya her değerin küçük, negatif olmayan bir tam sayı olduğunu biliyorsanız?

<!-- Konuşma notu: O zaman hiç karşılaştırmanıza gerek yok — basitçe her değerin kaç kez geçtiğini sayabilirsiniz. -->

---

# Kısa bir tarihçe

- **Harold H. Seward**, MIT yüksek lisans tezi, 1954
- Karşılaştırma alt sınırını aşmanın en basit yolu
- Anahtar aralığının `0..maxVal` olduğunu önceden bilmeyi gerektirir
- Radix sıralamasının temeli (Bölüm 9)

<!-- Konuşma notu: Seward'ın tezi, bilgisayarlıktaki en erken belgelenmiş karşılaştırmasız sıralama fikirlerinden biridir. -->

---

# Sayma sıralaması fikri

- Her değerin tekrar sayısını `count[]`'a say
- Sayıları **kümülatif** yap: `count[v]` = "kaç tane `<= v`"
- Her değeri `output[count[a[i]]-1]`'e yerleştir, azalt
- **Geriye doğru** tara — kararlı tutan şey bu

<!-- Konuşma notu: Geriye tarama, eşit değerler arasında girdide daha önce görünenin daha erken çıktı hücresini talep etmesini garanti eder. -->

---

# Sayma sıralaması, adım adım

<iframe class="dsanim" src="anim/counting-sort.html?yer=slayt&lang=tr" title="Sayma sıralaması"></iframe>

<!-- Konuşma notu: Karşılaştırmalar sayacını izleyin — tüm süre boyunca sıfırda kalır. Karşılaştırmasız bir sıralamanın tüm amacı budur. -->

---

# Uç durum — seyrek aralık

<iframe class="dsanim" src="anim/counting-sort.html?yer=slayt&lang=tr&example=sparse-range" title="Sayma sıralaması: seyrek aralık"></iframe>

<!-- Konuşma notu: 10 değer ama maxVal=15 — O(n+k) maliyeti görünür hale gelmiş: count[] 15'e kadar her değeri kapsamalı. -->

---

# Kod — say, sonra biriktir

```c
int count[max_val + 1] = {0};
for (int i = 0; i < n; i++)
    count[a[i]]++;
for (int v = 1; v <= max_val; v++)
    count[v] += count[v - 1];
```

<!-- Konuşma notu: Bundan sonra count[v], "kaç değer <= v" anlamına gelir — o değerin işgal etmesi gereken son çıktı indisi. -->

---

# Kod — geriye tarayarak yerleştir

```c
for (int i = n - 1; i >= 0; i--) {
    output[count[a[i]] - 1] = a[i];
    count[a[i]]--;
}
for (int i = 0; i < n; i++)
    a[i] = output[i];
```

<!-- Konuşma notu: Geriye doğru burada isteğe bağlı değil — sayma sıralamasını kararlı tutan tüm mekanizma bu. -->

---

# Karmaşıklık ve hatalar

- **O(n + k)** zaman ve alan, `k = maxVal` — her durumda
- `k`, `n`'den çok büyük değilse O(n log n)'i gerçekten aşar
- `k`, `n`'den çok büyükse israfçı (seyrek örnek)
- Yapı gereği, geriye tarama sayesinde **kararlı**

<!-- Konuşma notu: Seyrek-aralık örneği zaten count[]'u k=15, n=10 için girdinin kendisinden bile büyük gösterdi — k=1.000.000'u hayal edin. -->

---

# Mini soru

Eşit iki değer `a[p]` ve `a[q]`, `p < q` ile.
Geriye taramayı izleyin — `a[p]` çıktıda neden
her zaman `a[q]`'nun SOLUNDA biter?

<!-- Konuşma notu: Tarama önce a[q]'yu işler (daha büyük indis), bu yüzden daha sonraki hücreyi talep eder; a[p] sonra kalanı, bir hücre daha erken talep eder. -->

---

# Yanıt

**`a[q]` önce yerleştirilir** (tarama n-1'den 0'a gider),
daha sonraki hücreyi talep eder ve `count[v]`'yi azaltır.
`a[p]` sonra bir sonraki hücreyi talep eder — bir sola.

<!-- Konuşma notu: Bu tam olarak kod slaytındaki mekanizma, iki belirli bağlı eleman için izlenmiş. -->

---

<!-- _class: bolum -->

# 9. Radix Sıralaması (LSD)

<!-- Konuşma notu: Bölüm 9, sayma sıralamasının fikrini, tüm aralık yerine bir seferde bir basamak işleyerek daha büyük tam sayılar için kurtarır. -->

---

# Başlangıç sorusu

Sayma sıralaması küçük bir anahtar aralığı ister.
Ya anahtarlarınız beş basamaklı tam sayılarsa —
çok fazla ayrı değer, ama her biri küçük basamaklardan kurulu?

<!-- Konuşma notu: Sayma sıralamasını değer değil basamak basamak çalıştırın — sayılar ne kadar büyük olursa olsun her zaman 10 kova. -->

---

# Kısa bir tarihçe

- **Herman Hollerith**, 1890 ABD nüfus sayımı tabülasyon makineleri
- Mekanik kart sıralayıcıları bir seferde bir sütun işledi
- Sayma sıralamasının kendisinden çok daha eski
- Bugün hâlâ sabit-genişlikli tam sayı/dizi anahtarları için kullanılıyor

<!-- Konuşma notu: Bu, tüm bu derste en eski fikirlerden biridir — delikli-kart sıralaması, elektronik bilgi işlemden onlarca yıl önce gelir. -->

---

# Radix sıralaması (LSD) fikri

- **Birler** basamağından başla, **kararlı** bir sayma sıralaması çalıştır
- **Onlar**a geç, sonra **yüzler** — her zaman 10 kova
- Her geçişin kararlılığı isteğe bağlı değil — zorunlu
- `max_val / place` sıfıra ulaştığında durur

<!-- Konuşma notu: Kararlı bir geçiş, her önceki, daha az anlamlı basamağın sırasını korur — bu bileşebilirlik tüm algoritmadır. -->

---

# Radix sıralaması (LSD), adım adım

<iframe class="dsanim" src="anim/radix-sort-lsd.html?yer=slayt&lang=tr" title="Radix sıralaması, LSD"></iframe>

<!-- Konuşma notu: Normal örnek: 3 basamaklı değerler, 3 geçiş — dizinin geçiş geçiş yeniden sıralanmasını izleyin, place=1, 10, 100. -->

---

# Uç durum — tek basamaklı değerler

<iframe class="dsanim" src="anim/radix-sort-lsd.html?yer=slayt&lang=tr&example=single-digit" title="Radix sıralaması LSD: tek basamaklı"></iframe>

<!-- Konuşma notu: Yalnızca bir geçiş hiç çalışır — döngü koşulu, her değer tek bir basamağa sığdığında doğal olarak durur. -->

---

# Kod — bir basamak çıkarma

```c
int get_digit(int x, int place) {
    return (x / place) % 10;
}

for (int place = 1;
     max_val / place > 0;
     place *= 10) { ... }
```

<!-- Konuşma notu: get_digit(5, 100) doğru şekilde 0 döndürür — kısa sayılar görünmez sıfırlarla soldan doldurulmuş gibi davranır. -->

---

# Kod — bir basamak geçişi

```c
/* kararlı sayma sıralaması,
   get_digit(a[i], place) anahtarlı */
count_and_accumulate(place);
for (int i = n-1; i >= 0; i--)
    place_by_digit(a[i], place);
copy_output_back();
```

<!-- Konuşma notu: Bu tam anlamıyla sayma sıralamasının (Bölüm 8) aynı iki-aşamalı yapısıdır, yalnızca tüm değer yerine bir basamağa göre anahtarlanmış. -->

---

# Karmaşıklık ve hatalar

- **O(d × (n + b))** — `d` basamak, taban `b=10`
- Sabit genişlikli anahtarlar: etkin olarak **O(n)**, log çarpanı yok
- Sık hata: kararsız bir basamak geçişi doğruluğu bozar
- Sık hata: EN anlamlı basamaktan önce sıralamak

<!-- Konuşma notu: Çoğu diğer bağlamın aksine, kararlılık burada bir incelik değildir — doğruluğun kendisi için yük taşıyıcıdır. -->

---

# Mini soru

Önce en az anlamlı basamağa göre sıralamak
neden çalışır, aynı algoritmayı önce en
anlamlı basamaktan çalıştırmak neden çalışmaz?

<!-- Konuşma notu: Yanıt tamamen her geçişin henüz işlemediği basamaklar hakkında ne varsayıp varsayamayacağıyla ilgilidir. -->

---

# Yanıt

**Kararlılık yukarı doğru bileşir.** Her geçiş
tüm önceki, daha az anlamlı basamaklardan sırayı
korur — MSD-ilk üzerine inşa edecek böyle bir garantiye sahip değildir.

<!-- Konuşma notu: MSD-ilk radix sıralaması da vardır, ama çalışmak için farklı, özyinelemeli bir yapıya ihtiyaç duyar — bu haftanın kapsamı dışında. -->

---

<!-- _class: bolum -->

# 10. Kova Sıralaması

<!-- Konuşma notu: Bölüm 10 sayma sıralamasını genelleştirir: değer başına bir kova yerine, değer ARALIĞI başına bir kova. -->

---

# Başlangıç sorusu

Ya kesin sayılar yerine, her değeri kabaca
büyüklüğüne göre birkaç kovadan birine atıp,
sonra her küçük kovayı temizleseniz?

<!-- Konuşma notu: Değerler eşit dağılmışsa, her kova yalnızca bir avuç eleman tutar — yerel olarak sıralamayı bitirmek ucuzdur. -->

---

# Kısa bir tarihçe

- Bugünkü üç karşılaştırmasız sıralamanın en eskisi ve en geneli
- Tek bir mucidi ya da tarihi yok
- Sayma sıralamasının doğal bir genellemesi
- Tamamen girdinin gerçek dağılımına bağlı

<!-- Konuşma notu: Seward (sayma sıralaması) ya da Hollerith'in (radix sıralaması) aksine, kova sıralaması genellikle belirli bir atıf olmadan sunulur. -->

---

# Kova sıralaması fikri

- `[0, max_val]`'i 10 eşit büyüklükte kovaya böl
- Her değeri kovasına dağıt (burada onlar basamağı)
- Her küçük kovayı sırala (eklemeli sıralama — ucuz)
- Kovaları `0..9` birleştir — otomatik olarak sıralı

<!-- Konuşma notu: b kovasındaki değerlerin hepsi, yapı gereği, b+1 kovasındakilerden küçüktür — yalnızca birleştirme sıralamayı bitirir. -->

---

# Kova sıralaması, adım adım

<iframe class="dsanim" src="anim/bucket-sort.html?yer=slayt&lang=tr" title="Kova sıralaması"></iframe>

<!-- Konuşma notu: Normal örnek: değerlerin 10 kovaya dağılmasını, sonra her küçük kovanın eklemeli-sıralanmasını izleyin. -->

---

# Uç durum — hepsi tek kovada

<iframe class="dsanim" src="anim/bucket-sort.html?yer=slayt&lang=tr&example=same-bucket" title="Kova sıralaması: aynı kova"></iframe>

<!-- Konuşma notu: En kötü durum — her değer tek bir kovaya çarpışır, tüm dizide düz eklemeli sıralamaya bozulur. -->

---

# Kod — dağıt, sonra bitir

```c
int b = (a[i]*BUCKETS)
        / (max_val+1);
bucket[b][bucket_len[b]++]=a[i];
/* ... sonra her kovayı eklemeli-
   sırala, sonra birleştir */
```

<!-- Konuşma notu: max_val=99 ve 10 kovayla, b tam anlamıyla onlar basamağıdır — temiz, açıklaması kolay bir eşleme. -->

---

# Karmaşıklık ve hatalar

- **Ortalama O(n)**: değerler kovalar boyunca eşit dağılmış
- **En kötü O(n²)**: tüm değerler tek bir kovaya çarpışır
- Sık hata: gerçek veriyi yok sayan kova sınırları
- İçsel kova-içi sıralama kararlıysa **kararlı**

<!-- Konuşma notu: Kova sıralamasının O(n) sözü tamamen girdinin gerçekten eşit dağılmasına koşulludur — bunu algoritmanın içinden tespit etmenin bir yolu yoktur. -->

---

# Mini soru

Kova sıralaması kova başına içsel bir sıralamaya
ihtiyaç duyar; sayma sıralaması değer başına
buna benzer bir şeye ihtiyaç duymaz. Bunu açıklayan yapısal fark nedir?

<!-- Konuşma notu: Anahtar kelime "aralık" ile "tek değer"dir — bir kova içinde hâlâ sırası yanlış kalabilecek neyin olduğunu düşünün. -->

---

# Yanıt

**Bir kova bir değer ARALIĞINI kapsar**, bu
yüzden hâlâ göreli sıraya ihtiyaç duyan birkaç
gerçekten farklı değer tutabilir — sayma sıralamasının sayıları tutamaz.

<!-- Konuşma notu: Bu tam olarak kova sıralamasının genel biçiminde kayan-nokta değerlerini işleyebilmesinin nedenidir, sayma sıralamasının değer-başına saymasının aksine. -->

---

<!-- _class: bolum -->

# 11. Kararlılık, Gösterilmiş

<!-- Konuşma notu: Bölüm 11, kararlılığı kelimelerle tanımlamayı bırakır ve onu, aynı girdide, iki adı geçen algoritmayla gösterir. -->

---

# Başlangıç sorusu

Kararlılığı Bölüm 1'de tanımladık. Kelimeler
kanıt değildir. AYNI girdinin, yalnızca sıralamaya
bağlı olarak iki farklı sonuç ürettiğini izleyebilir miyiz?

<!-- Konuşma notu: Evet — ve bugünkü özel kararlılık animasyonunun canlı olarak, etiketli kayıtlarla yaptığı tam olarak budur. -->

---

# Gösterinin kurulumu

- Kayıtlar `(anahtar, etiket)` çiftleri — örn. `5a`, `5b`, `5c`
- Birkaç kayıt kasıtlı olarak bir anahtarı paylaşır ("bağ")
- Satır 1: **eklemeli sıralama** — kararlı (Bölüm 4)
- Satır 2: **seçmeli sıralama** — kararsız (Bölüm 3)

<!-- Konuşma notu: Etiket "bu fiziksel kaydın hangisi olduğu"nun yerine geçer — bir öğrenci adını, nota göre sıralanmış olarak düşünün. -->

---

# Kararlılık, gösterilmiş

<iframe class="dsanim" src="anim/stability-demo.html?yer=slayt&lang=tr" title="Kararlılık gösterisi"></iframe>

<!-- Konuşma notu: Özellikle 5a, 5b, 5c grubunu izleyin — kararlı onları sırada tutar, kararsız tutmaz. -->

---

# Uç durum — tüm anahtarlar eşit

<iframe class="dsanim" src="anim/stability-demo.html?yer=slayt&lang=tr&example=all-equal" title="Kararlılık gösterisi: hepsi eşit"></iframe>

<!-- Konuşma notu: En uç durum — tamamen kararlı bir sıralama TÜM girdi sırasını değiştirmeden yeniden üretmelidir. -->

---

# Sonuç, yakından okunmuş

- Kararlı (eklemeli): `5a 5b 5c` — tam girdi sırası
- Kararsız (seçmeli): `5b 5c 5a` — `5a` sona itilmiş
- Bir hata değil — seçmeli sıralamanın uzun-mesafeli yer değiştirmesi iş başında
- Zaten sıralı girdi ikisi arasında HİÇBİR fark göstermez

<!-- Konuşma notu: Kararsızlığın üzerinde hareket edecek bir şeyi ancak bir yer değiştirme bağlı bir elemanın üzerinden gerçekten geçtiğinde vardır — sıralı girdi bunu asla tetiklemez. -->

---

# Hangi sıralamalar kararlı?

| Sıralama | Kararlı mı? |
| --- | --- |
| Kabarcık, eklemeli, birleştirmeli, sayma, radix | Evet |
| Seçmeli, shell, hızlı (Lomuto/Hoare) | **Hayır** |
| Kova | İçsel sıralama kararlıysa evet |

<!-- Konuşma notu: Radix sıralamasının kararlılığı isteğe bağlı değildir — Bölüm 9, doğruluk için gerekli olduğunu, yalnızca güzel bir ekstra olmadığını gösterdi. -->

---

# Mini soru

Seçmeli sıralama kararsızdır. Kod olmadan,
onu — ya da herhangi bir karşılaştırmalı
sıralamayı — kararlı hale getirmenin genel bir yolunu betimleyin.

<!-- Konuşma notu: Hile, yalnızca seçmeli sıralamaya değil, herhangi bir karşılaştırmalı sıralamaya genelleşir. -->

---

# Yanıt

**Her elemana özgün indisini ekleyin**, ve
karşılaştırmada bağları o indise göre kırın.
Sıralamanın mekaniğinin hiç değişmesine gerek yok.

<!-- Konuşma notu: Bu, indisleri izlemek için ekstra belleğe mal olur, ama evrensel olarak çalışır — bugünkü sıralamalar ona ihtiyaç duymasa da bilinmeye değer bir hile. -->

---

<!-- _class: bolum -->

# 12. Algoritmaları Deneysel Olarak Karşılaştırma

<!-- Konuşma notu: Bölüm 12, Big-O'nun gizli sabitlerine güvenmeyi bırakır ve beş algoritmayı aynı girdide çalıştırıp tam olarak sayar. -->

---

# Başlangıç sorusu

Big-O sabit çarpanları gizler. "BU verideki
gerçek kazananın hangisi olduğunu" çözmenin tek
yolu, onları çalıştırıp saymaktır. O halde — sayalım.

<!-- Konuşma notu: Beş algoritma, her seferinde özdeş bir girdi, karşılaştırmalar ve yazmalar aynı iki ilkel üzerinden sayılmış. -->

---

# Kurulum

- Kabarcık, seçmeli, eklemeli, birleştirmeli, hızlı (Lomuto)
- Hepsi **özdeş** diziyi, her seferinde sıralar
- Her karşılaştırma ve yazma sayılan yardımcılardan geçer
- Toplamlar bir tahmin değil, bir ölçümdür

<!-- Konuşma notu: Burada hiçbir algoritma yeniden öğretilmez — her biri zaten kendi özel animasyonuna sahiptir. Bu tamamen yan yana bir ölçümdür. -->

---

# Sıralama algoritmaları, karşılaştırılıyor

<iframe class="dsanim" src="anim/sorting-comparison.html?yer=slayt&lang=tr" title="Sıralama karşılaştırması"></iframe>

<!-- Konuşma notu: Normal örnek: her satırın "çalışıyor..." vurgusu çözülürken karşılaştırma/yazma toplamını açığa çıkarmasını izleyin. -->

---

# Uç durum — zaten sıralı

<iframe class="dsanim" src="anim/sorting-comparison.html?yer=slayt&lang=tr&example=already-sorted" title="Sıralama karşılaştırması: zaten sıralı"></iframe>

<!-- Konuşma notu: Tüm haftanın dersi tek bir animasyonda: kabarcık farkla kazanır, hızlı (Lomuto) en kötü gününü yaşar. -->

---

# Dört sayı, bir hikâye

| Girdi | Kabarcık | Hızlı (Lomuto) |
| --- | --- | --- |
| Zaten sıralı (n=12) | **11** | **66** |
| Tersten sıralı (n=12) | 66 | 66 |

<!-- Konuşma notu: Bölüm 7'nin hızlı sıralama slaytlarındaki aynı 66-karşılaştırmalı en kötü durum, şimdi kabarcığın 11'inin tam yanında. -->

---

# Tek bir kazanan yok

- Kabarcık: zaten-sıralı veride kesin bir farkla kazanır
- Hızlı (Lomuto): büyük rastgele veride ortalamada kazanır
- Eklemeli: özellikle neredeyse-sıralı veride kazanır
- Kazanan her zaman girdinin **şekline** bağlıdır

<!-- Konuşma notu: Bu tek cümle, tek bir "en iyi" sıralama yerine on bir farklı sıralama algoritması öğretmenin tüm gerekçesidir. -->

---

# Mini soru

Neredeyse-sıralı girdide (yalnızca iki değer
yer değiştirmiş), eklemeli sıralama yalnızca 18
karşılaştırmaya, seçmeli tam 66'ya ihtiyaç duydu. Fark neden?

<!-- Konuşma notu: Onları Bölüm 4'ün eklemeli sıralamanın maliyetinin elemanların ne kadar yerinden uzak olduğunu izlediğine dair kendini-sınasına geri yönlendirin. -->

---

# Yanıt

**Eklemeli sıralama kısmi sırayı sömürür** — çoğu
eleman tek bir kontrolle durur. Seçmeli sıralamanın
tam taraması girdinin ne kadar sıralı olduğunu yok sayar.

<!-- Konuşma notu: Neredeyse-sıralı veri pratikte eklemeli sıralamanın en iyi durumudur, ama seçmeli sıralamanın değil — Bölüm 4.5'e doğrudan bir geri dönüş. -->

---

<!-- _class: bolum -->

# 13. Bir Sıralama Algoritması Seçmek

<!-- Konuşma notu: Bölüm 13, bugünü tek bir pratik soruya çevirir: verileriniz hakkında bildiklerinize göre, hangi sıralama? -->

---

# Karar tablosu

| Durum | En iyi seçim |
| --- | --- |
| Çok küçük dizi, ya da özyinelemeli bir alt dizi | Eklemeli sıralama |
| Zaten / neredeyse sıralı | Eklemeli, ya da kabarcık (erken çıkış) |
| Yazmalar pahalı, karşılaştırmalar ucuz | Seçmeli sıralama |

<!-- Konuşma notu: Bu tablo sonraki iki slaytta devam ediyor — tam dokuz-satırlı tablo için bu haftaki notlara bakın. -->

---

# Karar tablosu, devamı

| Durum | En iyi seçim |
| --- | --- |
| Garantili O(n log n) gerekli, bellek uygun | Birleştirmeli sıralama |
| Ortalama O(n log n) gerekli, yerinde | Hızlı sıralama, üçün-medyanı |
| Özyineleme yasak | Birleştirmeli (aşağıdan yukarı), öbek sıralaması |

<!-- Konuşma notu: "Bellek uygun"a karşı "yerinde", bu tablodaki en büyük ayrımdır — birleştirmeli ya da hızlı sıralama, nadiren ikisi de eşit önemlidir. -->

---

# Karar tablosu, sonucu

| Durum | En iyi seçim |
| --- | --- |
| Küçük tam-sayı anahtarlar, aralık ≈ n | Sayma sıralaması |
| Daha büyük tam sayı/dizi anahtarlar | Radix sıralaması (LSD) |
| Anahtarlar bir aralıkta eşit dağılmış | Kova sıralaması |
| Bağlar girdi sırasını korumalı | Herhangi bir kararlı sıralama (Bölüm 11.5) |

<!-- Konuşma notu: Bu dört satır bu haftanın ikinci yarısını bir bakışta özetler — karşılaştırmasız sıralamalar, anahtarlar hakkında bildiklerinize göre seçilmiş. -->

---

# Gerçek soru

- "Genel olarak hangi sıralama en hızlı" değil — böyle bir şey yok
- Verileriniz hakkında **gerçekte ne biliyorsunuz**?
- **Gerçekte neye ihtiyacınız var**: bir garanti mi? kararlılık mı?
- Bölüm 12 size tahmin değil, ölçme aracını verdi

<!-- Konuşma notu: On birini de gerçekte hangi durumda olduğunuzu tanıyacak kadar iyi bilmek — bu haftanın gerçek, aktarılabilir becerisi budur. -->

---

# Özet

- O(n²) ailesi: kabarcık, seçmeli, eklemeli, shell sıralaması
- Garantili O(n log n): birleştirmeli sıralama (yukarıdan aşağı, aşağıdan yukarı)
- Ortalama O(n log n), yerinde: hızlı sıralama (Lomuto, Hoare)
- Karşılaştırmasız, O(n+k): sayma, radix, kova sıralaması

<!-- Konuşma notu: On bir algoritma, dört aile, her seferinde bir alttaki soru: ne biliyorsunuz, ve neyi karşılayabilirsiniz? -->

---

# Özet, devamı

- Karşılaştırmalı-sıralama alt sınırı: O(n log n), kanıtlanabilir
- Karşılaştırmasız sıralamalar anahtarları hiç karşılaştırmayarak onu aşar
- Kararlılık: doğruluğun kendisi değil, ek bir garanti
- Tek bir "en iyi" sıralama yok — girdinin şekli karar verir

<!-- Konuşma notu: Bugünden bir şey hatırlayacaksanız, bu olsun: ölç, varsayma, ve gerçekte hangi durumda olduğunuzu bilin. -->

---

# İleriye bakış

- Hafta 11: **gelişmiş ağaç yapıları**
- Dengeli ağaçlar sıralı sırayı kademeli olarak korur
- Birleştirmeli sıralamanın böl-ve-yönet'i ağaç şeklinde geri döner
- Sonra: **dış sıralama** — bellek için çok büyük veri

<!-- Konuşma notu: Aşağıdan yukarı birleştirmeli sıralamanın "sıralı çalışmaları birleştir" mekanizması, diskte yaşayan veriyi sıralamanın tam temeli haline gelir. -->

---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Sorular?

**CEN207 Veri Yapıları — Hafta 10**

Dr. Öğr. Üyesi Uğur CORUH · 2026-2027 Güz

<!-- Konuşma notu: Tam notlar, on dört animasyonun hepsi, ve her program bu haftaki ders notlarında — teşekkürler. -->



