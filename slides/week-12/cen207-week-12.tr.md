---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Hafta 12 — Dizgiler: Yapılar ve Algoritmalar"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Hafta 12"
footer: "RTEÜ Bilgisayar Mühendisliği · 2026-2027 Güz"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Dizgiler: Yapılar ve Algoritmalar

**CEN207 Veri Yapıları — Hafta 12**

Dr. Öğr. Üyesi Uğur CORUH · 2026-2027 Güz

<!--
Konuşma notu: Kullandığınız her düzenleyici, derleyici ve arama motoru bugünkü derste anlatılan fikirlere yaslanır — bir dizginin bellekte nasıl durduğu, ve bir dizgiyi başka bir dizginin içinde hızlıca bulmak.
-->

---

# Bugünün planı (3 saat)

| Saat | Konu |
| --- | --- |
| 1 | C dizgileri, arabellekler, trie'ler, sıkıştırılmış trie'ler, sonek dizileri |
| 2 | Saf arama, KMP (başarısızlık işlevi + arama), Rabin-Karp |
| 3 | Boyer-Moore, Z algoritması, dinamik programlama: düzenleme uzaklığı, LCS |

**Öğrenme çıktıları:** ÖÇ.1 (veri yapılarını açıklama) · ÖÇ.2 (karmaşıklık analizi) · ÖÇ.6 (dinamik programlama) · ÖÇ.7 (doğru yapıyı seçme)

<!-- Konuşma notu: On üç kısa animasyon tüm dersi taşıyor; her fikir tanıtıldığı yerde bir normal, bir uç/zor çalıştırma alıyor. -->

---

# Bu haftanın kavramları — nerede

| Kavram | Nerede |
| --- | --- |
| C dizgileri, arabellekler, trie'ler, radix ağaçları, sonek dizileri | Bölüm 1–5 |
| Saf, KMP, Rabin-Karp, Boyer-Moore, Z algoritması | Bölüm 6–11 |
| Dinamik programlama: düzenleme uzaklığı, LCS | Bölüm 13–14 |

<!-- Konuşma notu: Her terim ilk geçtiği yerde tam tanımını alır; bu tablo yalnız nerede yeniden bulunacağını söylüyor. -->

---

# Kod örnekleri nasıl çalışır

- Her fikrin eksiksiz bir **C** ve **Java** programı var
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Kaynaklar: `code/week-12/c/` ve `code/week-12/java/`
- Her programın beklenen çıktısı hafta notlarında

<!-- Konuşma notu: Canlı çalıştırmak isterseniz şimdi bir terminal açın; bugünkü her slayttaki parça gösterildiği gibi derlenir ve çalışır. -->

---

# Tekrar — diziler ve char dizisi (Hafta 1)

- **Dizi:** bitişik bellek, indeksle O(1) erişim
- Bir C dizgisi yalnız bir `char` dizisidir
- Hafta 1'in indeks aritmetiği (`base + i`) hâlâ geçerli
- Bugün üstüne bir kural ekliyor: `'\0'` sonu işaretler

<!-- Konuşma notu: Bir C dizgisinin bellek düzeni hakkında yeni bir şey yok — yalnız "nerede bitiyor" kuralı yeni. -->

---

# Tekrar — ağaçlar ve hash'leme (Hafta 4 ve 6)

- **Ağaçlar:** çocukları olan özyinelemeli düğümler (Hafta 4)
- Bir trie düğümü, harf başına bir çocuğu olan bir ağaç düğümüdür
- **Hash'leme:** bir işlev bir konumu O(1)'de hesaplar (Hafta 6)
- Rabin-Karp hash'lemeyi yeniden kullanır — ama onu **kaydırır**

<!-- Konuşma notu: Bir trie "Hafta 4'ün ağacı, ama dallanma çarpanı alfabe boyutu"dur. Rabin-Karp "Hafta 6'nın hash'i, artımlı hale getirilmiş"tir. -->

---

# Yepyeni bir fikir: dinamik programlama

- Hiçbir önceki hafta bir problemi **çakışan** alt problemlere bölmedi
- Her alt problemi **yalnız bir kez** çözün, bir tabloda saklayın
- Bölüm 13–14 bunu temel ilkelerden tanıtıyor
- İki klasik örnek: düzenleme uzaklığı ve LCS

<!-- Konuşma notu: Bu gerçekten yeni bir mekanizma — bugünün "yalnız daha fazla arama algoritması" gibi hissettirmemesi için baştan işaretlemeye değer. -->

---

# Bu haftanın haritası — bir bakışta

| Yapılar | Arama | Dinamik programlama |
| --- | --- | --- |
| C dizgileri, arabellekler | Saf, KMP, Rabin-Karp | Düzenleme uzaklığı |
| Trie'ler, radix ağaçları | Boyer-Moore, Z algoritması | LCS |
| Sonek dizileri | | |

<!-- Konuşma notu: Bu haritadaki her kutu aşağıda kendi slaytlarını alıyor, çoğu kısa bir animasyon ve eksiksiz bir C/Java programıyla. -->

---

<!-- _class: bolum -->

# 1. C Dizgileri: Bellek, `'\0'`, ve `strlen`

<!-- Konuşma notu: Bölüm 1, sonraki her bölümün varsaydığı tek kuralı kurar: bir C dizgisi bir char dizisi artı bir NUL sonlandırıcıdır, başka hiçbir şey değil. -->

---

# Başlangıç sorusu

Şimdiye kadarki her yapı boyutunu bir
yerde sakladı. Bir C dizgisi saklamaz.
Öyleyse bir işlev nerede bittiğini nasıl bilir?

<!-- Konuşma notu: Cevap — tek bir ayrılmış bayt — elli yılı aşkın süredir C programlamayı (ve C hatalarını) şekillendirdi. -->

---

# Kısa bir tarihçe

- C, Bell Labs'ta, 1970'lerin başında tasarlandı (Dennis Ritchie)
- Uzunluk alanı yok: yalnız bir `char` dizisi + bir kural
- `'\0'` (NUL, değer 0) "dizgi burada bitiyor" der
- Bu tek seçim arabellek taşmasını olanaklı kılar

<!-- Konuşma notu: Pascal tarzı dizgilerle karşılaştırın, onlar gerçekten bir uzunluk baytı saklar — gerçek sonuçları olan bir tasarım kararı. -->

---

# Sezgi — bir posta kutuları sırası

- Her posta kutusu (bayt) bir harf tutar
- Hiçbir işaret "bu son dolu kutu" demez
- Bunun yerine: ilk **boş** kutu sonu işaretler
- Onun ötesine yürümek, başkasının postasına girmektir

<!-- Konuşma notu: "Başkasının postası", tanımsız davranışı — sahip olmadığınız belleği bozmayı — anlatmanın dostane bir yolu. -->

---

# Fikir: dizi + kural

- Bir C dizgisi = bir `char` dizisi, başka hiçbir şey değil
- `'\0'` (NUL) dizgi-sonu işaretidir
- Her işlem onu bulmak için bayt bayt yürür
- Hiçbir kestirme yol yoktur — uzunluk asla önbelleğe alınmaz

<!-- Konuşma notu: "Hiçbir kestirme yol yoktur", bu bölümdeki her karmaşıklık sonucunu açıklayan tek gerçektir. -->

---

# Arabellek taşması hatası

- `strcpy` tarzı kopyalama, `'\0'`'ı da kopyalayana kadar yazar
- Hedef kaynaktan küçükse: sorun
- Son geçerli indisin ötesine yazmak **tanımsız davranıştır**
- Bugün: her yazmayı her zaman bir sınır kontrolüyle **koruruz**

<!-- Konuşma notu: Tehlikeyi BAYRAKLAYARAK ve durdurarak gösteriyoruz — asla gerçekten bir sınır dışı yazma çalıştırarak değil. -->

---

# C dizgisi belleği, adım adım

<iframe class="dsanim" src="anim/c-string-memory.html?yer=slayt&lang=tr" title="C dizgisi belleği"></iframe>

<!-- Konuşma notu: Normal örnek: cap=16, "HELLOWORLD" rahat sığar — kopyalama döngüsünü, sonlandırıcıyı, sonra strlen'in ikinci yürüyüşünü izleyin. -->

---

# Uç durum — taşma, bayraklanır, hiç çalıştırılmaz

<iframe class="dsanim" src="anim/c-string-memory.html?yer=slayt&lang=tr&example=overflow" title="C dizgisi belleği: taşma"></iframe>

<!-- Konuşma notu: cap=8, 10 harflik bir kaynak — `if (i == cap) break;` korumasının kopyalamayı sınır dışına çıkmadan bir yazma önce durdurduğunu izleyin. -->

---

# Kod — korumalı kopyalama döngüsü

```c
int i = 0;
while (src[i] != '\0') {
    if (i == cap) break;
    buf[i] = src[i];
    i++;
}
int overflow = (src[i] != '\0');
if (!overflow) buf[i] = '\0';
```

<!-- Konuşma notu: Koruma satırı, tehlikeli bir saf strcpy döngüsünü güvenli, öğretilebilir bir döngüye çeviren TEK ekleme. -->

---

# Kod — strlen onu ikinci kez yürür

```c
size_t len = 0;
if (!overflow)
    while (buf[len] != '\0') len++;
```

- Hiçbir uzunluk hiçbir yerde önbelleğe alınmaz
- `strlen`'i bir döngü koşulunda çağırmak: O(n), O(n^2) olur

<!-- Konuşma notu: Bu tek satırlık tuzak (döngü koşulunda strlen), C'deki en yaygın kazara-karesel hatalardan biridir. -->

---

# Karmaşıklık

- `L` uzunluğunda bir dizgi kopyalamak: `O(L)`
- `strlen`: `O(L)` — **her tek çağrıda**, sıfırdan yeniden hesaplanır
- Hiçbir önbellekleme, hiçbir kestirme, asla
- Önbelleğe alınmış bir uzunluk, dizgi değiştiği an bozulurdu

<!-- Konuşma notu: "Her tek çağrıda"yı vurgulayın — bu, öğrencilerin sonraki derslerde en sık unuttuğu gerçektir. -->

---

# Sık yapılan hatalar

- Bir arabelleği boyutlandırırken sonlandırıcı için `+1`'i unutmak
- `strlen`'i bir döngünün koşulunun içinde çağırmak
- Dizgileri `strcmp` yerine `==` ile karşılaştırmak

<!-- Konuşma notu: `==`, C'de karakterleri değil işaretçileri karşılaştırır — farklı adreslerdeki aynı görünen iki dizgi eşit çıkmaz. -->

---

# Mini soru

10 karakterlik bir sözcük hangi boyutta
bir arabellek gerektirir? `char buf[10]`
neden bir bayt küçük?

<!-- Konuşma notu: Cevabı açıklamadan önce birkaç el kalksın — gerçek kodda çok yaygın bir birer-eksik hatasıdır. -->

---

# Cevap

**11 bayt.** On karakter artı `'\0'`
için bir bayt — sonlandırıcıyı unutmak
bu bölümün klasik hatasıdır.

<!-- Konuşma notu: Bunu taşma animasyonuyla ilişkilendirin: tam olarak "cap=8, 10 harf"in gösterdiği eksiklik budur. -->

---

<!-- _class: bolum -->

# 2. Büyüyen Bir Dizgi Arabelleği

<!-- Konuşma notu: Bölüm 2, "son uzunluğu önceden bilmiyorsak ne olur?" sorusunu yanıtlıyor — Hafta 1'in dinamik dizisinin sayılar için yanıtladığı aynı soru. -->

---

# Başlangıç sorusu

Bölüm 1'in arabelleği, bir karakter bile
yazılmadan önce seçilen sabit bir kapasiteye
sahipti. Ya kendini büyütebilseydi?

<!-- Konuşma notu: Bu tam olarak java.lang.StringBuilder'ın, C++'ın std::string'inin, ve Hafta 1'in dinamik dizisinin içeride yaptığı şeydir. -->

---

# Sezgi — bir çekmeceyi aşmak

- Bir çekmece sabit sayıda dosya tutar
- Dolu çekmece: **daha büyük** bir tane al, her dosyayı taşı
- Her seferinde "bir boy daha büyük" almak: sürekli taşıma
- **İki katı** boyut almak: taşıma seyrekleşir

<!-- Konuşma notu: "+1 değil, katlama" seçimi, bu bölümün karmaşıklık argümanının tüm içeriğidir. -->

---

# Fikir: dolduğunda ikiye katla

- `len` (kullanılan), `cap` (ayrılan), ve depolamayı izleyin
- `len == cap`: **iki katı** boyutta bir blok ayırın
- Var olan her karakteri kopyalayın, sonra yeniyi yazın
- Katlama, `n` büyüdükçe büyümeyi **üstel olarak seyrekleştirir**

<!-- Konuşma notu: "Üstel olarak seyrekleşir", karmaşıklık slaytındaki amorti edilmiş analiz argümanının sezgisel versiyonu. -->

---

# Büyüyen arabellek, adım adım

<iframe class="dsanim" src="anim/string-builder.html?yer=slayt&lang=tr" title="Dizgi arabelleği"></iframe>

<!-- Konuşma notu: Normal örnek: initCap=4, "HELLOWORLD" — arabelleğin dolduğunu, kapasiteye ulaştığını, ve eski karakterler görünür şekilde kopyalanarak büyüdüğünü izleyin. -->

---

# Uç durum — en küçük olası başlangıç

<iframe class="dsanim" src="anim/string-builder.html?yer=slayt&lang=tr&example=min-cap" title="Dizgi arabelleği: initCap=1"></iframe>

<!-- Konuşma notu: initCap=1, 10 harf için en çok büyümeyi zorlar — katlama kuralının iyi bir stres testi. -->

---

# Kod — büyüt, sonra yaz

```c
void append(char c) {
    if (len == cap) {
        cap = cap * 2;
        buf = realloc(buf, cap);
    }
    buf[len] = c;
    len++;
}
```

<!-- Konuşma notu: C'de, realloc bloğu TAŞIYABİLİR — buf'a eski her işaretçi, bu satır çalıştığı an geçersiz olur. -->

---

# Karmaşıklık

- Bir ekleme: genelde `O(1)`, bir büyümede `O(len)`
- `n` ekleme toplam: `O(n)` — ekleme başına **amorti edilmiş O(1)**
- Büyüme kopyalaması geometrik bir seri oluşturur, `n` ile sınırlı
- Hafta 1'in dinamik dizisiyle aynı garanti

<!-- Konuşma notu: "Amorti edilmiş" demek: her tek işlem ucuz değil, ama uzun bir dizi üzerinde ORTALAMA ucuz demektir. -->

---

# Sık yapılan hatalar

- Katlama yerine sabit bir miktarla büyütmek: toplam `O(n^2)`
- `realloc`'tan sonra işaretçiyi güncellemeyi unutmak (C)
- Bir C dizgisi de `+1` gerektirdiğinde `len` bayt ayırmak

<!-- Konuşma notu: Sabit bir büyüme miktarı, "küçük girdilerde iyi görünür, ölçekte çöker" türünde klasik bir hatadır. -->

---

# Mini soru

Katlama neden amorti edilmiş O(1)
verir, ama sabit 10'luk bir büyüme
ortalama ekleme başına O(n) verir?

<!-- Konuşma notu: Öğrencilerden "kaç büyüme olur, ve her biri ne kadara mal olur" açısından düşünmelerini isteyin. -->

---

# Cevap

**Katlama: `n/k`, `log n` büyümeye
küçülür.** Sabit `+10`: `n/10` büyüme,
her biri `n`'e kadar kopyalar.

<!-- Konuşma notu: Azalarak her biri n'e kadar mal olan log(n) büyüme O(n)'e toplanır; her biri n'e kadar mal olan n/10 büyüme O(n^2)'ye toplanır. -->

---

<!-- _class: bolum -->

# 3. Trie'ler: Her Karakter İçin Bir Kenar

<!-- Konuşma notu: Bölüm 3, hiç kullandığınız her otomatik tamamlama kutusunun ve yazım denetleyicisinin arkasındaki yapıyı, trie'yi tanıtıyor. -->

---

# Başlangıç sorusu

Bir hash tablosu "X bir sözcük mü?"yü
O(1)'de yanıtlar. "X ile hangi sözcükler
başlıyor?"u hiç yanıtlayamaz. Peki ne yanıtlar?

<!-- Konuşma notu: Hash'leme, benzer anahtarları bilerek dağıtır — bu yüzden bir "ile başlıyor" sorusunu hiç yanıtlayamaz. -->

---

# Kısa bir tarihçe

- Edward Fredkin, "Trie Memory," 1960
- Ad "re**trie**val"'dan gelir
- "Tree" ile karışmaması için genellikle "try" diye okunur
- Bugün hâlâ otomatik tamamlamanın arkasındaki standart yapı

<!-- Konuşma notu: Altmış beş yaşında ve hâlâ herhangi bir mülakatçının "otomatik tamamlama tasarla" için beklediği ilk fikir. -->

---

# Sezgi — bir yol tabelası ağacı

- Yoldaki her çatal tek bir harfle etiketlenmiş
- Bir sözcüğün harflerini, bir çatal bir çatal izleyin
- Paylaşılan önekler aynı erken çatalları paylaşır
- Küçük bir bayrak "tam bir sözcük burada bitiyor"u işaretler

<!-- Konuşma notu: Bayrak önemli — bir çatal, aynı anda hem bir sözcüğün yolunda hem de daha kısa bir sözcüğün sonu olabilir. -->

---

# Fikir: paylaşılan önekler düğümleri paylaşır

- `insert("CAT")`, sonra `insert("CAR")`: `C`→`A`'yı paylaşır
- `insert("CARD")`: `C`→`A`→`R`'ı `"CAR"`ile paylaşır
- `insert("DOG")`: hiçbir şey paylaşmaz, kökten yeni dal
- Bir düğüm **hem** "CAR'ın sonu" **hem de** "CARD'a giden yol" olabilir

<!-- Konuşma notu: Bu ikili rol — sözcük-sonu VE çocuklu-olma — trie hatalarının en yaygın tek kaynağıdır. -->

---

# Trie işlemleri

| İşlem | Maliyet |
| --- | --- |
| `insert(word)` | `O(L)`, L = sözcük uzunluğu |
| `search(word)` | `O(L)` |
| önek kontrolü | `O(L)` |

**Başka kaç sözcük saklandığından bağımsız!**

<!-- Konuşma notu: 10 sözcüklü bir trie ile 10 milyon sözcüklü bir trie, search("CAT")'i tam olarak aynı sayıda adımda yanıtlar. -->

---

# Trie ekleme ve arama, adım adım

<iframe class="dsanim" src="anim/trie-insert-search.html?yer=slayt&lang=tr" title="Trie ekleme ve arama"></iframe>

<!-- Konuşma notu: Normal örnek: CAT, CAR, CARD, DOG — paylaşılan kenarların yeniden kullanıldığını, "son" bayrağının sözcük sınırlarında belirdiğini izleyin. -->

---

# Uç durum — dallanmasız bir zincir

<iframe class="dsanim" src="anim/trie-insert-search.html?yer=slayt&lang=tr&example=chain" title="Trie: dallanmasız zincir"></iframe>

<!-- Konuşma notu: A, AB, ABC, ABCD — hiç dallanma yok, düz bir bağlı-liste-benzeri zincir. Bölüm 4'ün tam olarak sıkıştırdığı şey bu. -->

---

# Kod — ekleme

```c
void insert(TrieNode *root, const char *word) {
    TrieNode *cur = root;
    for (int i = 0; word[i]; i++) {
        int c = word[i] - 'A';
        if (cur->child[c] == NULL)
            cur->child[c] = new_node();
        cur = cur->child[c];
    }
    cur->isEnd = true;
}
```

<!-- Konuşma notu: C düğüm başına sabit 26-hücreli bir dizi kullanır; Java sürümü (notlarda) bunun yerine bir HashMap kullanır — gerçek bir ödünleşim. -->

---

# Kod — arama

```c
bool search(TrieNode *root, const char *word) {
    TrieNode *cur = root;
    for (int i = 0; word[i]; i++) {
        int c = word[i] - 'A';
        if (cur->child[c] == NULL) return false;
        cur = cur->child[c];
    }
    return cur->isEnd;
}
```

<!-- Konuşma notu: Döngünün sonuna ulaşmak yalnız "bu bir önek" olduğunu kanıtlar — dönüş değeri isEnd'i de kontrol eder. -->

---

# Karmaşıklık

- Her işlem: `O(L)`, `L` = sözcüğün uzunluğu
- Trie'nin toplam sözcük sayısı `n`'den bağımsız
- Sıralı bir diziyi ya da dengeli bir ağacı geçer: `O(L log n)`
- Bedel: bellek — çoğu boş çocuk dizisi

<!-- Konuşma notu: O bellek bedeli, tam olarak bölüm 4'ün sıkıştırılmış trie'sinin düzelttiği şeydir. -->

---

# Sık yapılan hatalar

- "Bulundu"yu "bir önektir" ile karıştırmak
- Bir düğümün hem `isEnd` HEM de çocuklu olabileceğini unutmak
- Trie'yi C'de hiç serbest bırakmamak (bir düğüm bir düğüm sızıntı)

<!-- Konuşma notu: search("CAR") ve search("CARP"), "CARPET" tutan bir trie'de aynı üç kenarı izler — yalnız biri saklı bir sözcüktür. -->

---

# Mini soru

Bir trie "DOG" tutuyor. `search("DO")`
çağırıyorsunuz. True mü false mü
döndürür — ve neden?

<!-- Konuşma notu: Öğrencilere 30 saniye verin; birçoğu başta yol var olduğu için true diyecektir. -->

---

# Cevap

**False.** `D`→`O` yolu var, böylece
`"DO"` geçerli bir **önektir** — ama
`O` düğümü `isEnd` olarak işaretli değil.

<!-- Konuşma notu: Bu, "sık yapılan hatalar" slaytının az önce uyardığı bulundu-önek ayrımının tam olarak kendisi. -->

---

<!-- _class: bolum -->

# 4. Sıkıştırılmış Trie'ler (Radix Ağaçları)

<!-- Konuşma notu: Bölüm 4, düz bir trie'nin uzun, dallanmayan sözcüklerdeki bellek israfını düzeltiyor. -->

---

# Başlangıç sorusu

"INTERNATIONAL"i (13 harf) düz bir
trie'ye eklemek, her biri tek çocuklu
13 yeni düğüm yapar. Daha iyisi olur mu?

<!-- Konuşma notu: Prensipte hiç dallanması olmayan tek bir dizgi olabilecek bir şey için on üç düğüm. -->

---

# Kısa bir tarihçe

- Donald R. Morrison, "PATRICIA," 1968
- Ad: pratik bir erişim algoritması için bir kısaltma
- Genel kullanımda **radix ağacı** da denir
- Aynı fikir gerçek dünya IP yönlendirme tablolarının altında yatar

<!-- Konuşma notu: PATRICIA trie'ler bugün ağ ağlarında hâlâ kullanılıyor — en-uzun-önek-eşleşmesi IP yönlendirmesi doğrudan bir uygulama. -->

---

# Fikir: uzat, oluştur, ya da böl

- Sözcük bir kenar etiketiyle tam eşleşir: **in**
- Sıradaki harfle başlayan hiçbir kenar yok: **yeni yaprak kenar**
- Sözcük bir kenar etiketinin yalnız bir kısmını paylaşır: **böl**
- Bir bölme, uyuşmazlıkta yeni bir dallanma düğümü oluşturur

<!-- Konuşma notu: Durum 3 — bölme — gerçekten yeni olan tek fikir; diğer iki durum tam olarak düz bir trie'nin mantığı. -->

---

# Bir kenarı bölmek

- Yalnız `"TEST"`: `"TEST"` etiketli tek bir yaprak kenar
- `"TEA"`yı ekleyin: ayrılmadan önce yalnız `"TE"`yi paylaşır
- `"TEST"` kenarı `"TE"`de bölünür
- Şimdi iki çocuk: `"ST"` (eski) ve `"A"` (yeni)

<!-- Konuşma notu: Animasyonu oynatmadan önce tahtada çalışın — öğrencilerin önce elle görmesi gereken tek adım bu. -->

---

# Bağlantı — Hafta 4'ün Huffman kodlaması

- Huffman: çarpık **sıklıkları** sömürerek sıkıştırır
- Sıkıştırılmış trie: **yapısal** israfı kaldırarak sıkıştırır
- Huffman şekli simgelerin NE SIKLIKLA geçtiğine bağlıdır
- Trie şekli yalnız saklanan gerçek karakterlere bağlıdır

<!-- Konuşma notu: Bu dersten iki tamamen farklı sıkıştırma fikri — farkı açıkça adlandırmaya değer. -->

---

# Sıkıştırılmış trie, adım adım

<iframe class="dsanim" src="anim/compressed-trie.html?yer=slayt&lang=tr" title="Sıkıştırılmış trie"></iframe>

<!-- Konuşma notu: Normal örnek: TEST, TEA, TEAM — TEST kenarının TE + ST'ye bölündüğünü, sonra TEAM'in A düğümünün ötesine uzandığını izleyin. -->

---

# Uç durum — iç içe bölünmeler

<iframe class="dsanim" src="anim/compressed-trie.html?yer=slayt&lang=tr&example=nested-split" title="Sıkıştırılmış trie: iç içe bölünmeler"></iframe>

<!-- Konuşma notu: ANT, ARM, ART, AXE — bir bölmenin içinde bir bölme, bu yapının doğru işlemesi gereken en zor durum. -->

---

# Kod — ekleme (uzat, oluştur, ya da böl)

```c
int j = common_prefix_len(word + i, child->label);
if (j == strlen(child->label)) {
    node = child; i += j;   /* in */
} else {
    RNode *mid = split_edge(node, child, j);
    /* kalan sonek için yeni yaprak */
}
```

<!-- Konuşma notu: Tam split_edge mantığı (eski etiketi kısaltmak, çocuğu yeniden anahtarlamak) notlarda — bu karar noktası. -->

---

# Karmaşıklık

- `insert`, `search`: hâlâ `O(L)`, tam olarak düz bir trie gibi
- Tasarruflar **süre**de değil **alan**da
- Düğüm sayısı dallanma noktaları + sözcük sonlarıyla sınırlı
- Toplam karakter sayısıyla değil

<!-- Konuşma notu: Süre karmaşıklığı değişmez; yalnız bellekteki sabit çarpan iyileşir, bazen çarpıcı biçimde. -->

---

# Sık yapılan hatalar

- Yanlış uzunlukta bölmek (ortak önek uzunluğu olmalı)
- Bölünen çocuğu yeni ilk harfi altında yeniden anahtarlamayı unutmak
- "Yol var"ı "sözcük bulundu" saymak (bölüm 3'teki aynı tuzak)

<!-- Konuşma notu: Yeniden anahtarlama hatası inceliklidir — çocuğun harita/dizi anahtarı, kısaltılmış etiketinin yeni ilk harfiyle eşleşmelidir. -->

---

# Mini soru

Sıkıştırılmış bir trie yalnız "APPLE"
ve "BANANA" tutuyor. Kaç kök-olmayan
düğümü var, ve neden bu kadar az?

<!-- Konuşma notu: Açıklamadan önce öğrencilerin akıl yürütmesine izin verin — "hiç paylaşılan önek yok" olası en basit durumdur. -->

---

# Cevap

**İki.** Hiç paylaşılan önek yok,
böylece her sözcük kökten doğrudan
tek bir yaprak kenar olur.

<!-- Konuşma notu: Aynı iki sözcük için 5 + 6 = 11 düğüme ihtiyaç duyacak düz bir trie'yle karşılaştırın. -->

---

<!-- _class: bolum -->

# 5. Sonek Dizileri

<!-- Konuşma notu: Bölüm 5 farklı bir soru yanıtlıyor: "X saklı bir sözcük mü?" değil, "P örüntüsü uzun bir T metninin herhangi bir yerinde geçiyor mu?" -->

---

# Başlangıç sorusu

Bir trie "X saklı bir sözcük mü?"yü
yanıtlar. Peki ya "P, uzun bir T
metninin herhangi bir yerinde geçiyor mu?"

<!-- Konuşma notu: Bu, bir metin düzenleyicinin "bul" özelliğinin, ya da bir genom tarayıcısının sürekli sorduğu bir sorudur. -->

---

# Fikir: her sonek, sıralı

- `T`'nin **her** soneğini, konum konum listeleyin
- O `n` soneği sözlük sırasına göre sıralayın
- Bir örüntü araması bir **ikili aramaya** döner: `O(m log n)`
- Hiç bitiş işareti gerekmez — iki sonek her zaman uzunlukta farklı

<!-- Konuşma notu: "Her zaman uzunlukta farklı", daha uzun bir soneğin öneki olan daha kısa bir soneğin otomatik olarak önce sıralanmasının nedeni. -->

---

# Sonek dizisi, adım adım

<iframe class="dsanim" src="anim/suffix-array.html?yer=slayt&lang=tr" title="Sonek dizisi"></iframe>

<!-- Konuşma notu: Normal örnek: MISSISSIPPI — her soneğin, kendi satırı olarak, ekleme sıralamasıyla sıralı konumuna kaydığını izleyin. -->

---

# Uç durum — her karakter aynı

<iframe class="dsanim" src="anim/suffix-array.html?yer=slayt&lang=tr&example=all-same" title="Sonek dizisi: AAAAAAAAAA"></iframe>

<!-- Konuşma notu: AAAAAAAAAA — her karşılaştırma daha kısa soneğin sonuna kadar çalışır; yalnız uzunluk kuralı her bağı çözer. -->

---

# Kod — sonekler üzerinde ekleme sıralaması

```c
int compare_suffix(const char *text, int a, int b) {
    return strcmp(text + a, text + b);
}
```

- Her sonek aynı arabelleğe bir **işaretçidir**
- Sıralama sırasında hiçbir karakter kopyalanmaz

<!-- Konuşma notu: "Akıllı işaretçi kullanımı, O(n) ekstra bellek ve kopyalamadan kaçınır"ın güzel, somut bir örneği. -->

---

# Karmaşıklık

- Buradaki ekleme sıralaması: en kötü durumda `O(n^2)` karşılaştırma
- Her karşılaştırma: `O(n)` karaktere kadar
- Gerçek kütüphaneler `O(n log n)` ya da `O(n)`'de kurar
- Bir kez kurulduktan sonra: örüntü araması `O(m log n)`

<!-- Konuşma notu: Kurma maliyeti BİR KEZ ödenir; aynı metne karşı sonraki her arama hızlıdır. -->

---

# Sık yapılan hatalar

- "Ne olur ne olmaz" diye gereksiz bir bitiş işareti eklemek
- Alt-dizgileri kopyalayarak sonekleri karşılaştırmak (belleği israf eder)
- Dizinin indislerini soneklerin karakterleriyle karıştırmak

<!-- Konuşma notu: `sa[i]` bir başlangıç KONUMUDUR, soneğin bir kopyası değil — soneği yazdırmak `text + sa[i]`'ye ihtiyaç duyar. -->

---

# Mini soru

Aynı metnin iki soneği neden asla
bayt bayt özdeş olamaz?

<!-- Konuşma notu: Bu, bir bitiş işaretini karşılaştırma kuralı için gereksiz kılan kilit gerçektir. -->

---

# Cevap

**Her zaman farklı uzunluklara
sahiptirler.** Sonlu bir dizgide farklı
konumlardan başlarlar, böylece uzunluklar farklıdır.

<!-- Konuşma notu: Farklı uzunluklar, düz sözlük karşılaştırmasının zaten her olası bağı doğru çözdüğü anlamına gelir. -->

---

<!-- _class: bolum -->

# 6. Dizgi Eşleştirme Problemi, ve Saf Arama

<!-- Konuşma notu: Bölüm 6, arama ailesini açıyor — aynı soruyu yanıtlayan beş farklı hileli algoritma. -->

---

# Başlangıç sorusu

Bir metin ve bir örüntü verildiğinde,
örüntü nerede geçer? Bunu yanıtlamanın
en basit olası yolu nedir?

<!-- Konuşma notu: "En basit olası" saf aramadır — henüz daha akıllı bir fikir öğretilmemiş olsaydı tam olarak başlayacağınız yer. -->

---

# Fikir: her kaydırmayı dene

- Örüntüyü metin üzerinde bir seferde bir konum kaydırın
- Her kaydırmada: soldan sağa karşılaştırın
- İlk uyuşmazlıkta durun, ya da tam bir eşleşme kaydedin
- **Bir eşleşmeden sonra devam edin** — oluşumlar çakışabilir

<!-- Konuşma notu: "Bir eşleşmeden sonra devam edin", en çok unutulan kural — yaygın bir hata bir isabetten sonra m konum atlar. -->

---

# Saf arama, adım adım

<iframe class="dsanim" src="anim/naive-search.html?yer=slayt&lang=tr" title="Saf arama"></iframe>

<!-- Konuşma notu: Normal örnek: text="ABABAABABC", pattern="ABABC" — 5. kaydırmadaki gerçek eşleşmeden önce birkaç yanlış başlangıcı izleyin. -->

---

# Uç durum — en kötü durum

<iframe class="dsanim" src="anim/naive-search.html?yer=slayt&lang=tr&example=hard" title="Saf arama: en kötü durum"></iframe>

<!-- Konuşma notu: text="AAAAAAAAAA", pattern="AAAB" — SON karakterde başarısız olmadan önce her kaydırma örüntünün neredeyse tamamını karşılaştırır. -->

---

# Kod — çift döngü

```c
for (int s = 0; s <= n - m; s++) {
    int j = 0;
    while (j < m && text[s+j] == pattern[j])
        j++;
    if (j == m) occ[c++] = s;
}
```

<!-- Konuşma notu: Buradan Bölüm 11'e kadarki her algoritma, bir anlamda, bu çift döngünün en kötü durumundan kaçınmanın daha akıllı bir yoludur. -->

---

# Karmaşıklık

- En iyi durum: `O(n)` — uyuşmazlıklar hemen olur
- En kötü durum: **`O(n*m)`**
- `"AAAA...AB"` vs `"AAAB"`: neredeyse her kaydırma, neredeyse tam karşılaştırma
- Bu en kötü durum tam olarak Bölüm 7–11'in düzelttiği şey

<!-- Konuşma notu: Saf aramanın en kötü durumunu dersin geri kalanının kötü adamı olarak çerçeveleyin — her sonraki algoritma "düzeltme"dir. -->

---

# Sık yapılan hatalar

- Eşleşmelerin çakışabileceğini unutmak (bir isabetten sonra m atlamak)
- `s`'yi `n - m` yerine `n`'e kadar döndürmek
- Saf aramanın her zaman "kötü" olduğunu varsaymak — sık kısa girdi için kazanır

<!-- Konuşma notu: En kötü durum karmaşıklığı tek dikkat edilecek şey değildir — küçük girdiler saf aramanın küçük sabit çarpanını tercih eder. -->

---

# Mini soru

Her karşılaştırmayı örüntünün SON
karakterine ulaşmaya zorlayan, 2
harflik bir metin ve örüntü oluşturun.

<!-- Konuşma notu: 60 saniye verin — birçoğu bağımsız olarak zor örnekte gösterilen "AAAA...B" örüntüsünü yeniden keşfedecek. -->

---

# Cevap

**`text="AAAAAAAAAA"`, `pattern="AAAB"`.**
İlk 3 harf her zaman eşleşir; yalnız
son, `'B'`, hiç başarısız olur.

<!-- Konuşma notu: Bu tam olarak iki slayt önce gösterilen zor senaryo animasyonu. -->

---

<!-- _class: bolum -->

# 7. Knuth-Morris-Pratt: Başarısızlık İşlevi

<!-- Konuşma notu: Bölüm 7, Bölüm 8'in kullandığı tabloyu kuruyor — bir KMP dersinin anlamlı olması için iki yarısına da ihtiyaç var. -->

---

# Başlangıç sorusu

Saf arama, bir uyuşmazlıktan sonra
öğrendiği her şeyi atar. Ya örüntünün
kendi yapısı bize daha fazlasını söyleseydi?

<!-- Konuşma notu: Kilit içgörü: örüntü, arayacağı metinden bağımsız olarak, önceden BİR KEZ incelenebilir. -->

---

# Kısa bir tarihçe

- Knuth, Morris, ve Pratt, 1977 (SIAM J. Computing)
- Morris & Pratt tarafından, ~1970, bağımsız olarak geliştirildi
- Tablo: `lps[]` — "en uzun uygun önek, aynı zamanda sonek de olan"
- Örüntünün **kendisiyle** karşılaştırılarak kurulur

<!-- Konuşma notu: Dizgi algoritmalarında en çok alıntılanan makalelerden biri — çoğu derste saf aramadan sonra öğretilen ilk şey. -->

---

# Fikir: lps[i]

- Her `pattern[0..i]` öneki için...
- ...aynı zamanda sonek de olan en uzun uygun önek
- `"ABAB"`: en uzun böyle eşleşme `"AB"` — `lps[3] = 2`
- Gelecekteki bir aramaya söyler: "bu kadarı yeniden kullanılabilir"

<!-- Konuşma notu: Tahtada "ABAB" -> lps=2'yi çalışın; bir dakikadan az sürede elle yapılacak kadar kısa. -->

---

# KMP başarısızlık işlevi, adım adım

<iframe class="dsanim" src="anim/kmp-failure-function.html?yer=slayt&lang=tr" title="KMP başarısızlık işlevi"></iframe>

<!-- Konuşma notu: Normal örnek: ABABCABABA — len'in bir eşleşmede büyüdüğünü, bir uyuşmazlıkta lps[len-1] üzerinden (asla doğrudan 0'a değil) geri düştüğünü izleyin. -->

---

# Uç durum — geri düşüş bir zinciri izler

<iframe class="dsanim" src="anim/kmp-failure-function.html?yer=slayt&lang=tr&example=multilevel-fallback" title="KMP lps: geri düşüş zinciri"></iframe>

<!-- Konuşma notu: AABAACAABAA — bir uyuşmazlık birden fazla lps düzeyi üzerinden geri düşer, doğrudan 0'a değil. -->

---

# Kod — lps[]'i kurmak

```c
int len = 0, i = 1;
while (i < m) {
    if (pattern[i] == pattern[len]) {
        lps[i++] = ++len;
    } else if (len != 0) {
        len = lps[len - 1];
    } else {
        lps[i++] = 0;
    }
}
```

<!-- Konuşma notu: "else if (len != 0)" dalı — sıfırlamak yerine geri düşmek — öğrencilerin ilk yanlış yaptığı SATIR. -->

---

# Karmaşıklık

- Tüm tabloyu kurmak için `O(m)`
- `len`, arttığı kadar en fazla azalabilir
- Toplam iş `O(m)` ile sınırlı, asla `O(m^2)` değil
- Aynı amorti edilmiş argüman Bölüm 8 ve 11'de yeniden kullanılıyor

<!-- Konuşma notu: Bu amorti edilmiş argüman (yalnız arttığı kadar azalan bir değer), dizgi algoritmalarında sürekli tekrar eder. -->

---

# Sık yapılan hatalar

- Her uyuşmazlıkta `len`'i 0'a sıfırlamak (#1 KMP hatası)
- Birer kayma: `pattern[len+1]` değil `pattern[len]`'i karşılaştırmak
- `lps[0] = 0`'ın hesaplanmayan sabit bir taban durumu olduğunu unutmak

<!-- Konuşma notu: 0'a sıfırlamak yine de BİR tablo üretir — yalnız YANLIŞ olanı, güvenli atlama mesafesini eksik bildiren bir tablo. -->

---

# Mini soru

`lps[m-1]` — en son girdi — tüm
örüntü hakkında size ne söyler?

<!-- Konuşma notu: Bu, tablonun son girdisini örüntünün bütün olarak kendi örtüşmesine bağlar. -->

---

# Cevap

**Örüntünün en uzun "sınırı"** — uygun
öneki ki aynı zamanda bütün olarak
kendi soneği de olsun.

<!-- Konuşma notu: "AAAAAAAAAA"'nın lps[m-1] = m-1'i vardır, olası maksimum kendisiyle örtüşme. -->

---

<!-- _class: bolum -->

# 8. Knuth-Morris-Pratt: Arama

<!-- Konuşma notu: Bölüm 8, lps tablosunun karşılığını verdiği yer — bölüm 7'nin kurulumunun ödül dizisi. -->

---

# Başlangıç sorusu

`lps[]` elimizdeyken, metni **asla geri
gitmeyen** bir işaretçiyle
arayabilir miyiz?

<!-- Konuşma notu: "Asla geri gitmez", KMP'ye O(n+m) sınırını veren tek garanti — birden fazla söyleyin. -->

---

# Fikir: i asla geri sarmaz

- İki işaretçi: `i` (metin), `j` (örüntü)
- Eşleşme: ikisi de ilerler
- Uyuşmazlık, `j > 0`: `j`, `lps[j-1]`'e geri düşer — `i` yerinde kalır
- Uyuşmazlık, `j == 0`: yalnız `i` ilerler

<!-- Konuşma notu: Bir geri düşüşte "i yerinde kalır" kilit satır — metin karakteri asla yeniden incelenmez. -->

---

# KMP araması, adım adım

<iframe class="dsanim" src="anim/kmp-search.html?yer=slayt&lang=tr" title="KMP araması"></iframe>

<!-- Konuşma notu: Normal örnek: klasik CLRS tarzı metin/örüntü çifti — i'nin ileri yürürken j'nin lps kullanarak atladığını izleyin. -->

---

# Uç durum — çok sayıda lps geri düşüşü

<iframe class="dsanim" src="anim/kmp-search.html?yer=slayt&lang=tr&example=hard" title="KMP arama: çok geri düşüş"></iframe>

<!-- Konuşma notu: text="AAAAAAAAAAAAAAAB", pattern="AAAAB" — yoğun bir geri düşüş dizisi, ama i hâlâ yalnız ileri gider. -->

---

# Kod — ana döngü

```c
while (i < n) {
    if (text[i] == pattern[j]) {
        i++; j++;
        if (j == m) { occ[c++] = i-m; j = lps[j-1]; }
    } else if (j > 0) {
        j = lps[j - 1];
    } else { i++; }
}
```

<!-- Konuşma notu: Üç dal, "fikir" slaytındaki her durum için bir tane — öğrencilerle 1:1 eşleştirin, sonra devam edin. -->

---

# Karmaşıklık

- `O(n + m)`: `lps`'i kurmak için `O(m)`, arama için `O(n)`
- `i`, toplamda, hiçbir zaman `n`'den fazla ilerlemez
- **Herhangi bir** metin ya da örüntü için geçerli — kötü girdi yok
- Saf aramanın `O(n*m)` en kötü durumuyla karşılaştırın

<!-- Konuşma notu: "Kötü girdi yok"u yinelemeye değer — KMP'yi kötüleştiren hiçbir yapılandırma ya da girdi yoktur. -->

---

# Sık yapılan hatalar

- Bir geri düşüşte `i`'yi ilerletmek (tüm garantiyi bozar)
- Bir eşleşmeyi kaydettikten sonra tekrar geri düşmeyi unutmak
- Farklı bir örüntü için kurulmuş bayat bir `lps[]` tablosunu yeniden kullanmak

<!-- Konuşma notu: Eşleşme sonrası geri düşüşü unutmak, çakışan oluşumları sessizce kaçırır — sessiz, fark edilmesi zor bir hata. -->

---

# Mini soru

O(n+m), KMP için neden mümkün ama
saf arama için değil, tek bir cümlede?

<!-- Konuşma notu: Cevap, doğrudan saf aramanın "metin karakterlerini yeniden inceliyor" kök nedenine bağlanmalı. -->

---

# Cevap

**Hiçbir metin karakteri asla yeniden
incelenmez** — saf aramanın O(n*m)'si
tam olarak onları yeniden incelemekten gelir.

<!-- Konuşma notu: Bu slayt tüm KMP yayının ödülü — yavaşça söyleyin, hatırlanmaya değer tek cümle bu. -->

---

<!-- _class: bolum -->

# 9. Rabin-Karp: Kayan Özet ve Sahte İsabetler

<!-- Konuşma notu: Bölüm 9, hash'lemeyi (Hafta 6) gerçekten yeni, artımlı bir biçimde geri getiriyor. -->

---

# Başlangıç sorusu

Ya karakterleri hiç karşılaştırmak
yerine, her pencerenin ucuz bir
ÖZETİNİ karşılaştırsaydık?

<!-- Konuşma notu: Bu KMP'ninkinden tamamen farklı bir strateji — karşılaştırmayı eniyilemek yerine karşılaştırmadan kaçınmak. -->

---

# Kısa bir tarihçe

- Rabin ve Karp, 1987 (IBM J. Research & Development)
- Hafta 6'nın hash'lemesini yeniden kullanır — ama **kaydırır**
- Bir özet eşleşmesi yalnız bir **adaydır**, asla bir kesinlik değil
- Bir eşleşme bildirmeden önce her zaman doğrulanmalı

<!-- Konuşma notu: "Aday, asla bir kesinlik değil" bu bölümdeki en önemli tek cümle. -->

---

# Fikir: yeniden hesaplama, kaydır

- Her karakteri sabit bir tabanda bir basamak sayın
- Pencereyi kaydırmak: çıkanı çıkar, gireni ekle
- Bir `O(1)` güncelleme — ortadaki karakterler asla yeniden okunmaz
- Bir özet **eşleşmesi** hâlâ karakter karakter **doğrulanmalıdır**

<!-- Konuşma notu: "Doğrulanmalı"yı tekrar söyleyin. İki farklı alt-dizgi aynı değere hash'lenebilir; bu bir hata değil, matematik. -->

---

# Rabin-Karp, adım adım

<iframe class="dsanim" src="anim/rabin-karp.html?yer=slayt&lang=tr" title="Rabin-Karp"></iframe>

<!-- Konuşma notu: Normal örnek: mod=101, hiç sahte isabet yok — kayan özet güncellemesinin, O(1), çoğu pencereyi tamamen atladığını izleyin. -->

---

# Uç durum — sahte isabetler

<iframe class="dsanim" src="anim/rabin-karp.html?yer=slayt&lang=tr&example=hard" title="Rabin-Karp: sahte isabetler"></iframe>

<!-- Konuşma notu: mod=7 (bilerek küçük) — doğrulamada BAŞARISIZ olan bir özet eşleşmesi: doğru şekilde reddedilen bir sahte isabet. -->

---

# Bu notu hazırlarken yakalanan gerçek bir hata

- İlk C taslağı hash için `long` kullandı, `long long` değil
- Bu dersin araç zincirinde, `long` yalnız **32 bit**
- `mod = 1e9+7` onu taşırdı — sessiz yanlış cevap
- C ve Java çıktısını karşılaştırmak bunu hemen yakaladı

<!-- Konuşma notu: Gerçek bir öğretim anı — C'de `long`'un 64 bit anlamına geldiğini asla varsaymayın; genişliği platforma bağlıdır. -->

---

# Kod — kaydıran güncelleme

```c
if (s > 0)
    tHash = ((tHash - text[s-1]*hPow % mod + mod)
              * base + text[s+m-1]) % mod;
if (tHash == pHash && strncmp(...) == 0)
    occ[c++] = s;   /* HER ZAMAN DOĞRULA */
```

<!-- Konuşma notu: `strncmp`'i işaret edin — o çağrı isteğe bağlı değil; atlamak sessizce sahte isabetleri gerçek eşleşme olarak bildirir. -->

---

# Karmaşıklık

- Ortalama durum: `O(n + m)` — pencere başına `O(1)`
- Yalnız özeti gerçekten eşleşen pencereler için ekstra `O(m)`
- En kötü durum: modül küçük/kötü seçilmişse `O(n*m)`
- Büyük bir asal modül bu en kötü durumu yok denecek kadar azaltır

<!-- Konuşma notu: "Zor" örneği, bu en kötü durum davranışını bilerek görünür kılmak için mod=7 kullandı. -->

---

# Sık yapılan hatalar

- Doğrulamayı atlamak (yalnız hız değil, bir doğruluk hatası)
- "Basitlik için" çok küçük bir modül kullanmak
- Aritmetik için çok dar bir tür kullanmak (yukarıdaki `long` hatası)

<!-- Konuşma notu: Bu üçü tam olarak bu bölümün animasyonunun ve programının bilerek gösterdiği üç şeyle eşleşir. -->

---

# Mini soru

Her Rabin-Karp özet eşleşmesi neden
hâlâ karakter karakter doğrulanmalıdır?

<!-- Konuşma notu: Güvercin yuvası ilkesi tam matematiksel cevaptır, açıkça adlandırmaya değer. -->

---

# Cevap

**Güvercin yuvası ilkesi** — olası
alt-dizgi hash değerinden daha çoksa,
bazıları çakışmak ZORUNDA. Hata değil; matematik.

<!-- Konuşma notu: Öğrencilerin de almış olabileceği bir ayrık matematik dersine güzel bir geri gönderim. -->

---

<!-- _class: bolum -->

# 10. Boyer-Moore: Kötü Karakter Kuralı

<!-- Konuşma notu: Bölüm 10, pratikte sıkça doğal dil metni için en hızlısı olan algoritmayı tanıtıyor. -->

---

# Başlangıç sorusu

Şimdiye kadarki her algoritma soldan
sağa karşılaştırır. Ya SAĞDAN SOLA
karşılaştırmak daha fazla atlamamızı sağlasaydı?

<!-- Konuşma notu: Bu ilk bakışta tersmiş gibi görünüyor — bu yüzden fikri açıklamadan önce durmaya değer. -->

---

# Kısa bir tarihçe

- Boyer ve Moore, 1977 (Communications of the ACM)
- Bu ders yalnız **kötü karakter** kuralını kapsar
- Tam algoritma ikinci bir "iyi sonek" kuralı ekler
- Bugün pratikte sıkça en hızlı dizgi araması

<!-- Konuşma notu: İyi sonek kuralının var olduğunu ama kapsam dışı olduğunu belirtin — öğrenciler daha sonraki okuma için adını bilmeli. -->

---

# Fikir: geriye tara, gördüğünü kullanarak atla

- `pattern[m-1]`'i önce, sonra `m-2`, ... sağdan sola karşılaştırın
- Uyuşmazlık: o karakterin örüntüdeki SON oluşumuna bakın
- Karakter örüntüde yoksa: TÜM örüntü uzunluğunca atlayın
- Atlama asla 1'den az değil (asla geri, asla yerinde)

<!-- Konuşma notu: "Asla 1'den az" gerçek bir uygulama tuzağı — tekrarlı karakterler saf atlama formülünü 0'a götürebilir. -->

---

# Boyer-Moore, adım adım

<iframe class="dsanim" src="anim/boyer-moore-bad-character.html?yer=slayt&lang=tr" title="Boyer-Moore kötü karakter"></iframe>

<!-- Konuşma notu: Normal örnek: text="ABAAABCDAB", pattern="ABC" — sağdan sola taramayı ve ortaya çıkan atlama boyutunu izleyin. -->

---

# Uç durum — olası en büyük atlama

<iframe class="dsanim" src="anim/boyer-moore-bad-character.html?yer=slayt&lang=tr&example=max-jump" title="Boyer-Moore: en büyük atlama"></iframe>

<!-- Konuşma notu: text="ZZZZZZZZZZ", pattern="ABC" — Z örüntüde hiç geçmez, böylece her pencere tam örüntü uzunluğunca atlar. -->

---

# Kod — kötü karakter tablosu ve atlama

```c
for (int c = 0; c < 256; c++) last[c] = -1;
for (int j = 0; j < m; j++) last[pattern[j]] = j;
/* ... */
int shift = j - last[text[s + j]];
s += shift > 1 ? shift : 1;
```

<!-- Konuşma notu: Tablo yalnız örüntüden BİR KEZ kurulur — tam olarak KMP'nin lps tablosu gibi, her pencerede değişmeden yeniden kullanılır. -->

---

# Karmaşıklık

- En iyi durum: `O(n/m)` — büyük atlamalar, zengin alfabe
- En kötü durum: `O(n*m)` — düşük çeşitlilikli metin (yalnız kötü karakter kuralı)
- Pratikte doğal dil metninde sıkça en hızlısı
- İyi sonek kuralı (kapsanmadı) en kötü durumu düzeltir

<!-- Konuşma notu: "Pratikte"yi vurgulayın — gerçek metinde ortalama durum, bu algoritmanın ününü yapan şeydir. -->

---

# Sık yapılan hatalar

- `shift >= 1` korumasını unutmak (onsuz sonsuza dek döngüye girebilir)
- Kötü karakter tablosunu METİNDEN kurmak, örüntüden değil
- Alışkanlıkla soldan sağa karşılaştırmak — tüm avantajı kaybeder

<!-- Konuşma notu: Yanlışlıkla soldan sağa karşılaştırmak yine de doğru eşleşmeler bulur — yalnız Boyer-Moore'un tüm amacını atar. -->

---

# Mini soru

Boyer-Moore, saf aramanın incelemek
zorunda olduğu metin karakterlerini
neden atlayabilir?

<!-- Konuşma notu: Cevap, oradaki karakterlere hiç bakmadan bir konum aralığının eşleşemeyeceğini KANITLAMAKla ilgili. -->

---

# Cevap

**Tek bir karşılaştırma birkaç
kaydırmanın imkansız olduğunu kanıtlar**
— orada eşleşme olamaz, hiç kontrol edilmez.

<!-- Konuşma notu: Bu "kanıtla, kontrol etme" fikri, bu hafta saf aramadan daha hızlı her algoritmanın kavramsal kalbidir. -->

---

<!-- _class: bolum -->

# 11. Z Algoritması

<!-- Konuşma notu: Bölüm 11, arama ailesini beşin en kavramsal olarak zarif olanıyla kapatıyor. -->

---

# Başlangıç sorusu

Şimdiye kadarki her algoritma kendi
özel tablosunu kurdu. TEK bir
kendisiyle-karşılaştırma tüm aramayı yanıtlayabilir mi?

<!-- Konuşma notu: Bunu "zarif olan" diye çerçeveleyin — öğrenciler sıkça Z algoritmasını beşinin en tatmin edicisi buluyor. -->

---

# Fikir: Z[i] ve birleşik bir dizgi

- `Z[i]`: `S[i..]`, `S`'nin kendi başlangıcıyla ne kadar eşleşir?
- `S = pattern + '#' + text` olsun (başka yerde kullanılmayan bir ayraç)
- Metin kısmında `Z[i] >= |pattern|`: bir oluşum
- Bir `[l, r)` penceresi bilinen değerleri yeniden kullanır — toplam `O(n + m)`

<!-- Konuşma notu: [l, r) penceresi, KMP'nin lps tablosuyla tam olarak aynı rolü oynar — "zaten bildiğini hatırla". -->

---

# Z algoritması, adım adım

<iframe class="dsanim" src="anim/z-algorithm.html?yer=slayt&lang=tr" title="Z algoritması"></iframe>

<!-- Konuşma notu: Normal örnek: pattern="AB", text="ABABABABAB" — [l,r) penceresinin büyüdüğünü ve sonraki konumlar için yeniden kullanıldığını izleyin. -->

---

# Uç durum — pencere sürekli yeniden kullanılır

<iframe class="dsanim" src="anim/z-algorithm.html?yer=slayt&lang=tr&example=hard" title="Z algoritması: pencere yeniden kullanımı"></iframe>

<!-- Konuşma notu: pattern="AAA", "AAAAAAAAAA"'ya karşı — pencere dizginin tam sonuna kadar büyümeye devam eder, neredeyse her adımda yeniden kullanım. -->

---

# Kod — Z dizisi kurma

```c
if (i < r)
    z[i] = min(r - i, z[i - l]);
while (i + z[i] < n && s[z[i]] == s[i + z[i]])
    z[i]++;
if (i + z[i] > r) { l = i; r = i + z[i]; }
```

<!-- Konuşma notu: Üç satır, her fikir için bir tane: pencereyi yeniden kullan, mümkünse uzat, büyüdüyse yeni pencereyi hatırla. -->

---

# Karmaşıklık

- Tüm birleşik-dizgi Z dizisi için `O(n + m)`
- KMP'nin lps'siyle aynı amorti edilmiş argüman: pencere yalnız büyür
- Bir konumun bir oluşum işaretleyip işaretlemediğini kontrol etmek için `O(1)`
- Beş arama algoritmasının en basit olanı, kavramsal olarak

<!-- Konuşma notu: Öğrencilere bunun dersin aynı "yalnız büyür" amorti edilmiş argümanını üçüncü kez kullanışı olduğunu hatırlatmaya değer. -->

---

# Sık yapılan hatalar

- Ayracı unutmak, ya da metinde geçen bir ayraç seçmek
- `Z[i] == m` yerine `Z[i] >= m` kullanmak
- `Z[0]`'ı anlamlı saymak (geleneksel olarak kullanılmaz)

<!-- Konuşma notu: Bir Z değeri, metin kendisi tekrarlıysa meşru olarak m'yi aşabilir — doğru eşleşme testi ==, değil >='dir. -->

---

# Mini soru

Z algoritması, KMP'nin lps'si gibi
AYRI bir tablo kurmaktan nasıl
kaçınır, tek bir cümlede?

<!-- Konuşma notu: Dürüst cevap "kaçınmaz" — Z[], benzer bir rol oynayan TABLONUN KENDİSİDİR. -->

---

# Cevap

**Kaçınmaz** — `Z[]` TABLONUN
KENDİSİDİR, yalnız TÜM birleşik
dizgiyle örtüşmeyi tanımlar.

<!-- Konuşma notu: lps[i] yalnız örüntü içindeki örtüşmeyi tanımlar; Z[i] tüm yapıştırılmış dizgiyle örtüşmeyi tanımlar. -->

---

<!-- _class: bolum -->

# 12. Beş Arama Algoritmasını Karşılaştırmak

<!-- Konuşma notu: Ders dinamik programlamaya geçmeden önce kısa bir dur-ve-karşılaştır bölümü. -->

---

# Karşılaştırma tablosu

| Algoritma | En kötü durum | Tipik durum | Ekstra fikir |
| --- | --- | --- | --- |
| Saf | O(n·m) | O(n) | Taban çizgisi |
| KMP | O(n+m) | O(n+m) | lps[], i geri sarmaz |
| Rabin-Karp | O(n·m) | O(n+m) ort. | Kayan özet, doğrula |
| Boyer-Moore | O(n·m) | O(n/m) | Sağdan sola, büyük atlama |
| Z algoritması | O(n+m) | O(n+m) | Tek kendisiyle-karşılaştırma dizisi |

<!-- Konuşma notu: KMP, GARANTİLİ bir en kötü duruma sahip tek algoritmadır — düşmanca girdi bir endişeyse güvenli varsayılan. -->

---

<!-- _class: bolum -->

# 13. Yeni Bir Strateji: Dinamik Programlama

<!-- Konuşma notu: Bölüm 13, dinamik programlamayı sıfırdan tanıtıyor — bu dersteki hiçbir önceki hafta bunu kapsamadı. -->

---

# Başlangıç sorusu

İki dizgi ne kadar "farklı"? Yazım
denetleyicileri, `git diff`, ve DNA
araçları hepsi bu sorunun bir versiyonunu soruyor.

<!-- Konuşma notu: Bu üç gerçek dünya örneği, aksi takdirde soyut olan bir soruyu öğrencilerin zaten bildiği şeylere bağlıyor. -->

---

# Saf kuvvet neden çok yavaş

- Özyinelemeli tanım: eşleştir, değiştir, sil, ya da ekle
- Doğru — ama neredeyse her adımda 3 çağrıya dallanır
- AYNI alt problem üstel olarak sık yeniden hesaplanır
- Çakışan alt problemler: israf edilen iş düzeltilebilir

<!-- Konuşma notu: Saf özyinelemeli çağrı ağacını tahtaya çizin — tekrarlanan alt ağaçlar küçük girdilerde bile görsel olarak açıktır. -->

---

# Fikir: her alt problemi bir kez çözün

- **Optimal alt yapı:** en iyi cevap, en iyi alt cevaplardan kurulur
- **Çakışan alt problemler:** aynısı birçok kez tekrar eder
- Her alt problemi TAM OLARAK BİR KEZ çözün, bir tabloda saklayın
- Bu dinamik programlamadır — bu hafta gerçekten yeni

<!-- Konuşma notu: Her iki özellik de gereklidir — optimal alt yapı özyinelemeyi doğru yapar; çakışma ezberlemeyi değerli kılar. -->

---

# Düzenleme uzaklığı: soru

- `a`'yı `b`'ye dönüştürmenin en az tek-karakterlik düzenlemesi
- Ekleme, silme, ya da değiştirme — her biri 1'e mal olur
- Ayrıca **Levenshtein uzaklığı** da denir (1965)
- `dp[i][j]` = `a`'nın ilk `i`'si ile `b`'nin ilk `j`'si arasındaki uzaklık

<!-- Konuşma notu: Levenshtein'ın özgün makalesi, "dinamik programlama" adının tam bu bağlamda standart hale gelmesinden öncedir. -->

---

# Yineleme

- Taban durumu: `dp[i][0] = i`, `dp[0][j] = j`
- Karakterler eşleşir: `dp[i][j] = dp[i-1][j-1]` (ücretsiz)
- Aksi halde: `1 + min(köşegen, üst, sol)`
- Satır satır doldurun — her bağımlılık zaten hesaplanmış

<!-- Konuşma notu: "Her bağımlılık zaten hesaplanmış", hiç özyinelemeye gerek olmamasının nedeni — tek bir geçiş yeterli. -->

---

# Düzenleme uzaklığı, adım adım

<iframe class="dsanim" src="anim/edit-distance.html?yer=slayt&lang=tr" title="Düzenleme uzaklığı"></iframe>

<!-- Konuşma notu: Normal örnek: KITTEN -> SITTING, uzaklık 3 — tablonun dolduğunu, sonra geriye yürümenin bir düzenleme dizisi yeniden kurduğunu izleyin. -->

---

# Uç durum — saf ekleme

<iframe class="dsanim" src="anim/edit-distance.html?yer=slayt&lang=tr&example=insertion-only" title="Düzenleme uzaklığı: saf ekleme"></iframe>

<!-- Konuşma notu: CAT -> CATERPILLAR — a, b'nin bir öneki, böylece her eşleşmeyen adım saf bir ekleme, asla değiştirme ya da silme değil. -->

---

# Kod — tabloyu doldurmak

```c
if (a[i-1] == b[j-1])
    dp[i][j] = dp[i-1][j-1];
else {
    int best = min(dp[i-1][j-1],
                    min(dp[i-1][j], dp[i][j-1]));
    dp[i][j] = 1 + best;
}
```

<!-- Konuşma notu: Bu tüm algoritmanın çekirdeği — geri kalan her şey (taban durumları, geriye yürüme) bu yineleme etrafında defter tutma. -->

---

# Karmaşıklık

- `O(n*m)` süre — her hücre bir kez, `O(1)`'de hesaplanır
- Tam tablo için `O(n*m)` alan (geriye yürüme için gerekli)
- Saf özyinelemenin üstel süresine göre çarpıcı gelişme
- Yalnız-satır eniyilemesi alanı `O(m)`'ye indirir (yalnız uzunluk)

<!-- Konuşma notu: Alan eniyilemesinin var olduğunu belirtin ama sonradan geriye yürümeyi çalıştırma yeteneğinden fedakarlık ettiğini not edin. -->

---

# Sık yapılan hatalar

- Birer kayma: `dp[i][j]`, `a[i]`'yı değil `a[i-1]`'i karşılaştırır
- Taban durumlarının `i` ve `j` olduğunu, sıfır olmadığını unutmak
- Tabloyu tutarsız ya da yanlış bir sırada doldurmak

<!-- Konuşma notu: Taban-durumu hatası sinsidir — "boş bir önekle karşılaştırma"yı, maliyeti olması gerekirken sessizce ücretsiz gösterir. -->

---

# Mini soru

Dinamik programlama neden HEM optimal
alt yapıya HEM çakışan alt problemlere
ihtiyaç duyar?

<!-- Konuşma notu: Bu, birkaç slayt önceki "fikir" slaytına doğrudan bağlanır — iyi bir anlama kontrolü. -->

---

# Cevap

**Alt yapı DOĞRU yapar. Çakışma
ezberlemeyi DEĞERLİ yapar** — çakışma
olmadan, hiçbir şey yeniden hesaplanmaz.

<!-- Konuşma notu: Cevabın her iki yarısı da önemli — birçok öğrenci yalnız iki özellikten birini hatırlıyor. -->

---

<!-- _class: bolum -->

# 14. En Uzun Ortak Alt Dizi

<!-- Konuşma notu: Bölüm 14, bölüm 13'ün tam tablo şeklini tek bir değişmiş yinelemeyle yeniden kullanıyor — güzel bir "aynı şekil, farklı anlam" kapanışı. -->

---

# Başlangıç sorusu

"Ne kadar farklı" değil — "sırayla,
bitişik olmasa bile, NE AYNI kaldı"?

<!-- Konuşma notu: Bu tam olarak bir fark aracının değişmemiş olarak vurguladığı şey — git diff'e bağlantı burada karşılığını veriyor. -->

---

# Alt dizi ile alt dizgi

- Alt dizgi: **bitişik** — `"ACE"`, `"ABCDE"`'nin bir alt dizgisi DEĞİL
- Alt dizi: sıra korunur, boşluklara izin verilir
- `"ACE"`, `"ABCDE"`'nin bir alt dizisi**DİR**
- LCS: HER İKİ dizgide de ortak en uzun dizi

<!-- Konuşma notu: Bu ayrım, LCS'yle ilgili en yaygın tek kavramsal hatadır — bu slayta gerçekten zaman ayırın. -->

---

# Yineleme — neredeyse aynı tablo

- Taban durumu: `dp[i][0] = dp[0][j] = 0`
- Karakterler eşleşir: `dp[i][j] = dp[i-1][j-1] + 1` (uzat)
- Aksi halde: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`
- Uyuşmazlık için ceza yok — yalnız eşleşmeler bir şey ekler

<!-- Konuşma notu: Açıkça düzenleme uzaklığının min+1'iyle karşılaştırın — bu karşıtlık bu bölümün temel öğretim noktasıdır. -->

---

# LCS, adım adım

<iframe class="dsanim" src="anim/longest-common-subsequence.html?yer=slayt&lang=tr" title="En uzun ortak alt dizi"></iframe>

<!-- Konuşma notu: Normal örnek: ABCBDAB / BDCABA, uzunluk 4 — köşegenin eşleşmelerde büyüdüğünü, aksi halde max'ın ileriye taşındığını izleyin. -->

---

# Uç durum — hiç paylaşılan harf yok

<iframe class="dsanim" src="anim/longest-common-subsequence.html?yer=slayt&lang=tr&example=no-common" title="LCS: ortak harf yok"></iframe>

<!-- Konuşma notu: ABCDE'ye karşı FGHIJ — her hücre 0 kalır, tüm tablo yalnız "eşleşme yok, max taşı" dalıyla dolar. -->

---

# Kod — yineleme

```c
if (a[i-1] == b[j-1])
    dp[i][j] = dp[i-1][j-1] + 1;
else
    dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
```

<!-- Konuşma notu: Bunu düzenleme uzaklığının kod slaydıyla yan yana karşılaştırın — görsel benzerlik bilerek yapıldı ve öğreticidir. -->

---

# Karmaşıklık

- `O(n*m)` süre ve alan — düzenleme uzaklığıyla özdeş
- Aynı tablo şekli, aynı şekilde doldurulmuş
- Yalnız her hücredeki yineleme farklı
- Daha sonraki algoritma tasarımında yeniden tanıyacağınız bir şablon

<!-- Konuşma notu: Bu, açıkça şunu söyleme anı: "artık DP tablo şeklini biliyorsunuz, yalnız iki ayrık algoritmayı değil." -->

---

# Sık yapılan hatalar

- Alt diziyi alt dizgiyle karıştırmak (iki slayt önceye bakın)
- Yanlışlıkla düzenleme uzaklığının min+1 yinelemesini yeniden kullanmak
- Yalnız gerçek alt dizi isteniyorken uzunluğu bildirmek

<!-- Konuşma notu: Gerçek karakterleri geri kazanmak için geriye yürüme gerekir — yalnız dp[n][m] yalnız "ne kadar uzun?"u yanıtlar. -->

---

# Mini soru

LCS neden max kullanır, düzenleme
uzaklığı min+1 kullanırken, ikisi de
aynı tablo şeklini doldursa bile?

<!-- Konuşma notu: Dersin kapanış kavramsal sorusu — bölüm 13 ve 14'ü açıkça birbirine bağlıyor. -->

---

# Cevap

**Düzenleme uzaklığı bir MALİYET
sayar** (en ucuzu al). **LCS bir
UZUNLUK sayar** (zaten en iyisini al).

<!-- Konuşma notu: Bu, bugünkü dersin tüm DP yarısının en temiz tek cümlelik özeti. -->

---

# Özet

- **Yapılar:** char dizisi + `'\0'`, büyüyen arabellekler, trie'ler,
  sıkıştırılmış trie'ler, sonek dizileri
- **Arama:** saf, KMP, Rabin-Karp, Boyer-Moore, Z algoritması
- **Bu hafta yeni:** dinamik programlama — düzenleme uzaklığı, LCS
- Aynı DP tablo şekli, iki farklı yineleme

<!-- Konuşma notu: Beş yapı, beş arama algoritması, iki DP algoritması — on üç animasyon, bir ders. -->

---

# Alıştırmalar ve kendini sınama

- Hafta notlarında 10 alıştırma — tabloları ve kodu elle izleyin
- Tam çözümlü 10 kendini sınama sorusu
- Seçicideki her "uç" örneği deneyin, yalnız "normal"i değil
- Her programı kendiniz çalıştırın — çıktıların hepsi gerçek, yakalanmış çıktı

<!-- Konuşma notu: Öğrencileri programları gerçekten çalıştırmaya teşvik edin — tüm ders boyunca gösterilen her çıktı gerçekti, uydurulmadı. -->

---

# İleriye bakış

- Hafta 13–14: proje haftaları 15–16'dan önce daha yeni malzeme
- DP tablo şekli (`dp[i][j]`, bir kez doldurulur, geriye yürümeyle okunur)
- ...yalnız dizgiler için değil, algoritma tasarımı boyunca tekrar tekrar karşınıza çıkar
- Bu haftanın tablo şeklini bir şablon olarak aklınızda tutun

<!-- Konuşma notu: Dinamik programlama, bu haftanın çalışmalarınızın geri kalanında sürekli yeniden ortaya çıkacak tek fikridir. -->

---

# Kaynaklar

- Cormen, Leiserson, Rivest, Stein — *Introduction to Algorithms*
- Knuth, Morris, Pratt (1977) · Boyer, Moore (1977) · Karp, Rabin (1987)
- Fredkin (1960) · Morrison (1968) · Levenshtein (1965)
- Sedgewick & Wayne — *Algorithms*, 4. baskı (Dizgiler bölümü)
- Tam liste ayrıntılarıyla hafta notlarında

<!-- Konuşma notu: Dergi adları, ciltler, ve yıllarla tam alıntılar basılı notların Kaynaklar bölümünde. -->

---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Sorular?

**CEN207 Veri Yapıları — Hafta 12**

Gelecek hafta: Hafta 15–16'nın proje gösterimlerinden önce yeni malzemeyle devam

<!-- Konuşma notu: Sınıfa teşekkür edin, kodun ve notların nerede olduğunu hatırlatın, ve söz hakkını açın. -->
