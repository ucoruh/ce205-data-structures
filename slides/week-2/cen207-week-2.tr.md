---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Hafta 2 — Diziler, Matrisler ve Bağlı Listeler"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Hafta 2"
footer: "RTEÜ Bilgisayar Mühendisliği · 2026-2027 Güz"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Diziler, Matrisler ve Bağlı Listeler

**CEN207 Veri Yapıları — Hafta 2**

Dr. Öğr. Üyesi Uğur CORUH · 2026-2027 Güz

<!--
Konuşma notu: Geçen hafta bir kutu tek bir değeri tutuyordu; malloc onu yaratıyor, free onu geri veriyordu. Bu hafta o tek kutudan iki fikir çıkıyor: yan yana, aritmetikle erişilen çok sayıda kutu — dizi — ve bir sonrakini gösteren tek bir kutu — bağlı liste (linked list).
-->

---

# Bugünün planı (3 saat)

| Saat | Konu |
| --- | --- |
| 1 | Diziler: ekleme/silme, dinamik büyüme **Anim 1–2** · 2B yerleşim, döndürme, yeniden düzenleme **Anim 3–5** |
| 2 | Seyrek matrisler **Anim 6–8** · listeler: düğüm/baş/NULL, tekil işlemler **Anim 9–12** |
| 3 | Çift yönlü, dairesel, Josephus, XOR, atlamalı liste **Anim 13–17** · diziler ve listeler |

**Öğrenme çıktıları:** ÖÇ.1 (temel veri yapılarını açıklama) · ÖÇ.2 (karmaşıklık analizi) · ÖÇ.7 (doğru yapıyı seçme)

<!-- Konuşma notu: On yedi kısa animasyon dersin tamamını taşıyor; her biri, fikri tanıttığımız yerde bir kez görünüyor, ve her biri en can alıcı uç durumuna da bir kez daha bakıyor. -->

---

# Bu haftanın kavramları — nerede

| Kavram | Nerede |
| --- | --- |
| Diziler: kaydırma, dinamik büyüme | Bölüm 1 |
| 2B diziler, döndürme, yeniden düzenleme | Bölüm 2–3 |
| Seyrek matrisler | Bölüm 4 |
| Tekil/çift yönlü/dairesel listeler | Bölüm 5–8 |
| XOR liste, atlamalı liste, diziler ve listeler | Bölüm 9–11 |

<!-- Konuşma notu: Her terim ilk geçtiği yerde tam olarak tanımlanır; bu tablo yalnızca onu nerede tekrar bulacağınızı söylüyor. -->

---

# Kod örnekleri nasıl çalışıyor

- Her fikrin eksiksiz bir **C** ve **Java** programı var
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Kaynaklar: `code/week-02/c/` ve `code/week-02/java/`
- Her programın beklenen çıktısı hafta notunda var

<!-- Konuşma notu: Canlı çalıştırmak isterseniz şimdi bir terminal açın; bugünün slaytlarındaki her parça, gösterildiği gibi derlenip çalışıyor. -->

---

# Hatırlatma — Hafta 1: bellek ve işaretçiler

- Bir değişken, bellekte etiketli bir **kutu**dur
- Bir işaretçi (pointer) bir **adres saklar** — bir kutuyu gösterir
- `malloc(n)`: `n` bayt ayırır, bir adres döndürür
- `free(p)`: kutuyu geri verir; sonra `p = NULL` yapın
- `NULL`: **hiçbir şeyi** göstermeyen bir işaretçi

<!-- Konuşma notu: Bugünün her şeyi tam olarak bu beş olguya dayanıyor — bellek hakkında yeni bir şey yok, yalnızca ondan kurulan yeni biçimler var. -->

---

# Haftanın haritası — genel bakış

| Diziler ve matrisler | Bağlı listeler |
| --- | --- |
| Kaydırma, dinamik büyüme | Düğüm, baş, NULL |
| Satır öncelikli, döndürme, düzenleme | Tekil, çift yönlü, dairesel |
| Seyrek: triplet, devrik, toplama | Josephus, XOR, atlamalı liste |

<!-- Konuşma notu: Bu haritadaki her kutunun aşağıda kendi slaytları var, çoğunda kısa bir animasyon ve eksiksiz bir C/Java programı. -->

---

<!-- _class: bolum -->

# 1. Bellekte Diziler: Ekleme, Silme, Büyüme

<!-- Konuşma notu: Bölüm 1, bir dizinin içeriğini yalnızca okumanın değil değiştirmenin bedelini soruyor — ve boyutu yanlış tahmin edildiğinde ne yapılacağını. -->

---

# Bir soru ile başlayalım

Bir dizi, art arda `n` kutudur. Ortasına
bir değer eklendiğinde, yeni değer yerine
oturmadan önce ne hareket etmek zorunda?

<!-- Konuşma notu: Sınıfın tahmin etmesine izin verin, sonraki slayt yanıtlıyor: ekleme noktasından sonraki her şey. -->

---

# Sezgi — numaralı dolaplardan oluşan bir sıra

- Her kutu, başlangıçtan **indis × kutu boyutu** uzaklıkta
- `arr[k]` saf aritmetik — arama gerekmez
- Ama dolaplar kendi kendine kayıp ayrılmaz
- Yer açmak, ondan sonraki her dolabı hareket ettirmek demek

<!-- Konuşma notu: O(1) indis erişimi dizinin bütün çekiciliği — ve bedeli, bir şeyin hareket etmesi gerektiği an ortaya çıkıyor. -->

---

# `size` ve kapasite

- Sabit bir dizi baştan `CAP` kutu ayırır
- `size`, **gerçekte** kaç kutunun kullanıldığını takip eder
- `insert_at(k, v)`: `k` indisinde yer aç
- `delete_at(k)`: `k` indisindeki boşluğu kapat

<!-- Konuşma notu: Bu ilk sürümde CAP hiç değişmiyor; yalnızca size hareket ediyor, o da 0..CAP arasında. -->

---

# Dizide ekleme ve silme, adım adım

<iframe class="dsanim" src="anim/array-insert-delete.html?yer=slayt&lang=tr" title="Dizide ekleme ve silme"></iframe>

<!-- Konuşma notu: Baştan bir ekleme ile sona bir ekleme arasında kaç hücrenin yandığına bakın — asıl ders o fark. -->

---

# Uç durum — taşma: dizi dolu

<iframe class="dsanim" src="anim/array-insert-delete.html?yer=slayt&lang=tr&example=overflow" title="Dizide ekleme ve silme: taşma"></iframe>

<!-- Konuşma notu: Dolu bir dizi, çökmek yerine eklemeyi doğrudan reddeder — bu kontrol, herhangi bir kaydırma başlamadan önce gelmeli. -->

---

# Kod — `insert_at()`

```c
bool insert_at(int k, int v) {
    if (size == CAP)
        return false;          /* full: overflow */
    for (int i = size; i > k; i--)
        arr[i] = arr[i - 1];   /* shift right */
    arr[k] = v;
    size++;
    return true;
}
```

<!-- Konuşma notu: Kaydırma döngüsü sondan k'ye doğru, geriye çalışır — ileri yönde çalışsaydı değerler kopyalanmadan üzerine yazılırdı. -->

---

# Kod — `delete_at()`

```c
bool delete_at(int k) {
    if (size == 0)
        return false;          /* empty: underflow */
    for (int i = k; i < size - 1; i++)
        arr[i] = arr[i + 1];   /* shift left */
    size--;
    return true;
}
```

<!-- Konuşma notu: Bu döngü ileri yönde çalışır — insert'in geriye kaydırmasının ayna görüntüsü, ve tersine dönmesi de bir o kadar kolay. -->

---

# Karmaşıklık ve sık yapılan hatalar

- `k = 0`: **her** elemanı kaydırır — **O(n)**
- `k = size` (sona ekleme): hiç kaydırma yok — **O(1)**
- Hata: önce taşma/alttan taşma kontrolünü unutmak
- Hata: yanlış yönde kaydırıp veriyi ezmek

<!-- Konuşma notu: Aynı fonksiyon, çağıranın seçtiği k indisine bağlı olarak O(1)'den O(n)'e kadar her şeye mal olabilir. -->

---

# Mini soru

5 değeri hep 0. indise eklediniz.
Toplam kaç eleman-kaydırması oldu?

<!-- Konuşma notu: Sınıfın sonraki slayttan önce toplamasına izin verin. -->

---

# Yanıt

**0+1+2+3+4 = 10 kaydırma.** Her baştan
ekleme, o an var olan her elemanı kaydırır —
klasik O(n) en kötü durum, beş kez tekrarlanmış.

<!-- Konuşma notu: Beş değeri yerleştirmek için on kaydırma — baştan eklemenin pahalı olmasının nedeni tam olarak bu: en kötü durumu her seferinde tekrarlaması. -->

---

# Peki ya boyut önceden bilinmiyorsa?

Sabit bir dizinin `CAP`'i katı bir tavandır.
Bir **dinamik dizi**, eklemeyi reddetmek yerine
kendi kapasitesini talep üzerine büyütür.

<!-- Konuşma notu: Bu, tam olarak Java'nın ArrayList'inin ve C++'ın std::vector'ünün perde arkasında yaptığı şey — aynı numara, endüstriyel ölçekte. -->

---

# Dinamik dizi büyümesi, adım adım

<iframe class="dsanim" src="anim/dynamic-array-growth.html?yer=slayt&lang=tr" title="Dinamik dizi büyümesi"></iframe>

<!-- Konuşma notu: Her büyümede dizinin altında beliren geçici satıra bakın — o satır kopyanın kendisi, eski bloğun yerini almak üzere yukarı kaymadan önce. -->

---

# Uç durum — geri küçülme

<iframe class="dsanim" src="anim/dynamic-array-growth.html?yer=slayt&lang=tr&example=shrink-quarter" title="Dinamik dizi: küçülme"></iframe>

<!-- Konuşma notu: Küçülme isteğe bağlı ve büyümenin simetriği — kullanım dörtte bire düştüğünde kapasite yarıya iniyor, belleği geri vermek için. -->

---

# Kod — `da_resize()`

```c
static void da_resize(DynArray *a, int new_cap) {
    int *fresh = malloc(new_cap * sizeof(int));
    for (int i = 0; i < a->size; i++)
        fresh[i] = a->data[i];   /* copy every value */
    free(a->data);               /* old block freed */
    a->data = fresh;
    a->cap = new_cap;
}
```

<!-- Konuşma notu: Var olan her değer yeni bloğa tek tek kopyalanıyor — büyümenin O(n) bedeli tam olarak o tam kopyadan geliyor. -->

---

# Kod — `da_append()`

```c
void da_append(DynArray *a, int v) {
    if (a->size == a->cap) {
        int new_cap = a->cap * 2;   /* growth factor 2 */
        da_resize(a, new_cap);
    }
    a->data[a->size++] = v;
}
```

<!-- Konuşma notu: Yeniden boyutlandırma yalnızca blok zaten doluyken çalışıyor — çoğu çağrı doğrudan sondaki tek satırlık yazmaya atlıyor. -->

---

# Karmaşıklık ve sık yapılan hatalar

- Büyüyen bir ekleme `size` elemanı kopyalar: **O(n)**
- Çoğu ekleme yalnızca bir hücre yazar: **O(1)**
- `n` eklemede toplam kopya sayısı **2n'nin altında** kalır
- Yani ekleme başına **amortize edilmiş** maliyet O(1)'dir
- Hata: her tek eklemeyi O(n) sanmak

<!-- Konuşma notu: Amortize etmek, uzun bir işlem dizisi üzerinden ortalama almak demektir — bir ekleme pahalı olabilir, ama ortalama hiçbir zaman pahalı değildir. -->

---

# Mini soru

`cap = 1`'den başlayıp ikiye katlayarak, 100
değer teker teker eklenirken dizi kaç kez büyür?

<!-- Konuşma notu: Sınıfın ikiye katlamaları saymasına izin verin: 1, 2, 4, 8... sonraki slayttan önce. -->

---

# Yanıt

**7 kez** (1→2→4→8→16→32→64→128).
`log2(100) ≈ 6.6`, yukarı yuvarlanmış — büyüme
son boyuta göre **logaritmiktir**, doğrusal değil.

<!-- Konuşma notu: İkiye katlama, büyüme sayısının yalnızca son boyutun logaritması kadar artması demek — toplam kopyalamanın ucuz kalmasının nedeni tam olarak bu. -->

---

<!-- _class: bolum -->

# 2. İki Boyutlu Diziler: Satır Öncelikli mi, Sütun Öncelikli mi?

<!-- Konuşma notu: Bölüm 2, hiçbir zaman tek boyutlu olmaktan başka bir şey olmamış bellekte "iki boyutlu" bir dizinin aslında neye benzediğini soruyor. -->

---

# Bir soru ile başlayalım

Bellek, baytlardan oluşan tek uzun bir sıra.
Bir matris iki boyutlu görünür — satır ve
sütun. `mat[i][j]` nasıl tek bir adrese döner?

<!-- Konuşma notu: Gerçekten iki boyutlu bir bellek diye bir şey yok — her "2B" dizi aslında kılık değiştirmiş bir 1B dizidir. -->

---

# Sezgi — bir kitaplık, bir raf sırayla

- Matrisin satırlarını uç uca dizildiğini hayal edin
- Önce 0. satırın hücreleri, sonra 1. satırınki, böyle devam
- Bu yerleşime **satır öncelikli (row-major)** denir
- Bazı diller (Fortran, MATLAB) önce **sütunları** dizer

<!-- Konuşma notu: Satır öncelikli ile sütun öncelikli tamamen bir kural meselesi — "satır" ya da "sütun"un belleğe daha doğal geleni yok. -->

---

# Adres formülleri

- **Satır öncelikli:** `addr(i,j) = i * COLS + j`
- **Sütun öncelikli:** `addr(i,j) = j * ROWS + i`
- C ve Java: satır öncelikli; Fortran, MATLAB: sütun öncelikli
- Formül aritmetik — hiç arama yok

<!-- Konuşma notu: İki formül var, ve bu bölümün sorduğu her "2B dizi" sorusu doğru olanı seçip uygulamaya iniyor. -->

---

# Bellekte matris, adım adım

<iframe class="dsanim" src="anim/matrix-row-major.html?yer=slayt&lang=tr" title="Bellekte matris: satır öncelikli"></iframe>

<!-- Konuşma notu: Izgaranın altındaki bellek satırına bakın — satır öncelikli bir gezinme, birbirini izleyen bellek hücrelerine, adım adım iner. -->

---

# Uç durum — sütun öncelikli depolama, satır satır gezinme

<iframe class="dsanim" src="anim/matrix-row-major.html?yer=slayt&lang=tr&example=col-major-row-walk" title="Bellekte matris: uyumsuz bir gezinme"></iframe>

<!-- Konuşma notu: Buradaki gezinme sırası depolama sırasıyla çelişiyor — artık her adım bir sonraki hücreye değil, bellekte bir sıçramaya karşılık geliyor. -->

---

# Kod — `addr()` ve satır öncelikli bir gezinme

```c
int mat[ROWS][COLS];
/* address of mat[i][j], in ints from the start */
int addr(int i, int j) {
    return i * COLS + j;   /* row-major */
}

void traverse_row_major(int mat[ROWS][COLS]) {
    for (int i = 0; i < ROWS; i++)
        for (int j = 0; j < COLS; j++)
            visit(mat[i][j]);
}
```

<!-- Konuşma notu: Dıştaki i döngüsü ve içteki j döngüsü, satır öncelikli formülü birebir izliyor — sırayla, her adres için bir ziyaret. -->

---

# Karmaşıklık ve sık yapılan hatalar

- Adres hesabı: saf aritmetik — **O(1)**
- Satır öncelikli gezinme, satır öncelikli depolama: her adım **Δ=1**
- Gezinmeyle uyuşmayan yerleşim: **her** adımda bir sıçrama
- Hata: her dilin satır öncelikli olduğunu varsaymak

<!-- Konuşma notu: Formülün bedeli hiç değişmiyor — değişen, art arda gelen ziyaretlerin gerçek bellekte ne kadar uzağa düştüğü, ve işlemcinizin önbelleğinin asıl hissettiği de bu. -->

---

# Mini soru

Satır öncelikli bir matrisin 5 sütunu var.
`mat[3][2]` adres 17'de. `mat[3][3]`'ün adresi ne?

<!-- Konuşma notu: Sınıfın formülü kendisinin uygulamasına izin verin, sonraki slayttan önce. -->

---

# Yanıt

**18.** Bir sütun sağa gitmek, satır öncelikli
düzende tam olarak `1` ekler — bir sonraki
hücre her zaman bir sonraki adrestir.

<!-- Konuşma notu: Bu bir adımlık bitişiklik tam olarak "satır öncelikli"nin kazandırdığı şey, ve sütun öncelikli bir gezinmenin harcayacağı şey. -->

---

<!-- _class: bolum -->

# 3. Döndürme ve Yeniden Düzenleme: İki İşaretçi

<!-- Konuşma notu: Bölüm 3, tek bir fikri paylaşan iki dizi numarasını kapsıyor — değerleri yalnızca O(1) ek alanla, hiçbir zaman ikinci bir dizi kullanmadan hareket ettirmek. -->

---

# Bir soru ile başlayalım

12 değerlik bir diziyi, ikinci bir dizi
kullanmadan 4 sola döndürün. Yalnızca O(1)
ek alan varken nereden başlarsınız?

<!-- Konuşma notu: Bariz yaklaşım — yeni bir diziye kopyalamak — tam olarak bu bölümün dışladığı yaklaşım. -->

---

# Sezgi — üç kez ters çevirme

- Önce ilk parçayı ters çevirin, sonra kalanını
- Sonra dizinin **tamamını** bir kez daha ters çevirin
- Üç ters çevirme her değeri tam yerine oturtur
- İkinci dizi yok, tek tek kaydırma yok

<!-- Konuşma notu: Bu numara ilk seferde büyü gibi hissettiriyor; animasyonda bir ters çevirmeyi tek tek izlemek, işte o zaman oturuyor. -->

---

# `rotate_left`: üç ters çevirme

- `d = d % n` — gerçek döndürme miktarı
- `arr[0..d-1]`'i ters çevir
- `arr[d..n-1]`'i ters çevir
- `arr[0..n-1]`'i ters çevir — bitti

<!-- Konuşma notu: Her ters çevirme tek başına yanlış görünür; yalnızca üçüncüsü, dizinin tamamı üzerinde, her şeyi yeniden düzeltir. -->

---

# Dizi döndürme, adım adım

<iframe class="dsanim" src="anim/array-rotation.html?yer=slayt&lang=tr" title="Dizi döndürme"></iframe>

<!-- Konuşma notu: Her ters çevirmenin sonucu altta yeni bir satır olarak tutuluyor, böylece üç aşama da bir arada, yan yana görünür kalıyor. -->

---

# Uç durum — n'den büyük d

<iframe class="dsanim" src="anim/array-rotation.html?yer=slayt&lang=tr&example=d-greater-n" title="Dizi döndürme: n'den büyük d"></iframe>

<!-- Konuşma notu: 10 değer üzerinde d=23 yine de çalışır, çünkü tek bir ters çevirme bile başlamadan d % n onu 3'e indirger. -->

---

# Kod — `reverse()`

```c
void reverse(int arr[], int lo, int hi) {
    while (lo < hi) {
        int tmp = arr[lo];
        arr[lo] = arr[hi];
        arr[hi] = tmp;
        lo++;
        hi--;
    }
}
```

<!-- Konuşma notu: Üç farklı aralıkla üç kez çağrılan bu tek yardımcı fonksiyon, döndürme algoritmasının tamamı. -->

---

# Kod — `rotate_left()`

```c
void rotate_left(int arr[], int n, int d) {
    d = d % n;
    reverse(arr, 0, d - 1);    /* first d */
    reverse(arr, d, n - 1);    /* the rest */
    reverse(arr, 0, n - 1);    /* whole array */
}
```

<!-- Konuşma notu: Üç çağrı, üç aralık — bu fonksiyonda başka hiçbir şey iş yapmıyor. -->

---

# Karmaşıklık ve sık yapılan hatalar

- Dizi üzerinde üç geçiş, her biri O(n) — yine de **O(n)**
- **O(1)** ek alan: hiçbir yerde ikinci bir dizi yok
- Hata: önce `d = d % n`'i unutmak
- Hata: `reverse` içinde birer-fazla sınır hatası

<!-- Konuşma notu: Üç geçiş, üç kat yavaş olması gerekiyormuş gibi geliyor, ama üç kere O(n) yine sadece O(n)'dir. -->

---

# Yeniden düzenleme: iki işaretçi birbirine yaklaşır

- Amaç: negatifler solda, negatif olmayanlar sağda
- `left`, zaten negatif olan değerleri atlar
- `right`, zaten negatif olmayan değerleri atlar
- İkisi de durunca, takas edip içe doğru ilerleyin

<!-- Konuşma notu: Bu, tam olarak bir quicksort bölümleme adımıyla aynı iki-işaretçi biçimi — aynı fikir gelecek dönem yeniden karşımıza çıkacak. -->

---

# Diziyi yeniden düzenleme, adım adım

<iframe class="dsanim" src="anim/array-rearrange.html?yer=slayt&lang=tr" title="Diziyi yeniden düzenleme"></iframe>

<!-- Konuşma notu: left ve right'ın birbirine doğru yürüyüşünü izleyin, her biri zaten doğru tarafta olan değerleri atlayarak. -->

---

# Uç durum — zaten ayrılmış

<iframe class="dsanim" src="anim/array-rearrange.html?yer=slayt&lang=tr&example=already-segregated" title="Diziyi yeniden düzenleme: zaten ayrılmış"></iframe>

<!-- Konuşma notu: Hiç takas gerekmese bile işaretçiler burada dizinin tamamını yine de yürür — kontrolün kendisi yine de O(n) tutar. -->

---

# Kod — `segregate()`

```c
void segregate(int arr[], int n) {
    int left = 0, right = n - 1;
    while (left < right) {
        while (left<right && arr[left]<0) left++;
        while (left<right && arr[right]>=0) right--;
        if (left < right) {
            int tmp = arr[left];
            arr[left] = arr[right];
            arr[right] = tmp;
            left++; right--;
        }
    }
}
```

<!-- Konuşma notu: İki iç while döngüsü, zaten doğru tarafta olan değerleri atlar; yalnızca ikisi de durunca gerçek bir takas olur. -->

---

# Karmaşıklık ve sık yapılan hatalar

- İki işaretçi de yalnızca **içe doğru** ilerler — toplam **O(n)**
- Tek geçiş, O(1) ek alan
- Hata: `0`'ı negatif saymak — **değildir**
- Hata: iç döngülerde `left < right` korumasını unutmak

<!-- Konuşma notu: Her iç döngü ayrıca left < right'ı kontrol eder, yoksa iki işaretçi birbirini geçip birbirinin ötesini okuyabilir. -->

---

# Mini soru

`segregate`'ten sonra dizi her yarı içinde
**sıralı** mı, yoksa yalnızca ikiye mi ayrılmış?

<!-- Konuşma notu: Sınıfın segregate'in aslında neyi karşılaştırdığını düşünmesine izin verin. -->

---

# Yanıt

**Yalnızca ayrılmış.** Negatifler negatif
olmayanların soluna geçer, ama hiçbir yarı
sıralı değildir — `segregate` sıralamak için
değerleri hiç karşılaştırmaz.

<!-- Konuşma notu: Ayırmak ve sıralamak farklı işler; bu algoritma yalnızca "negatif mi" diye sorar, hiçbir zaman "hangisi büyük" diye sormaz. -->

---

<!-- _class: bolum -->

# 4. Seyrek Matrisler

<!-- Konuşma notu: Bölüm 4, bir matrisin çoğunlukla sıfırlardan oluştuğu — gerçek bilimsel ve çizge hesaplamalarında çok yaygın olan — durumda ne yapılacağını soruyor. -->

---

# Bir soru ile başlayalım

1000×1000'lik bir matrisin bir milyon hücresi
var. Yalnızca 200'ü sıfır değil. Diğer
999.800 sıfırı neden saklayasınız ki?

<!-- Konuşma notu: Bir milyon int, yalnızca bu tek matris için 4 MB — ve matris %99,98 boş; israf hiç de varsayımsal değil. -->

---

# Sezgi — büyük ölçüde boş bir otopark

- Çoğu yer, gün boyu, her gün boş durur
- Yalnızca **dolu** yerleri listeleyen bir pano yeterlidir
- Konum + değer, hatırlanması gereken her şey budur
- O pano, **triplet** gösterimidir

<!-- Konuşma notu: Kimse her boş otopark yerini fotoğraflayıp boş olduğunu kanıtlamaz — yalnızca arabaların nerede olduğunu yazar. -->

---

# Triplet: `(row, col, value)`

- Her **sıfır olmayan** hücre için bir kayıt, başka hiçbir şey yok
- Satır öncelikli tara, her sıfırı atla
- Bir seyrek matrisin triplet tablosu çok küçük olabilir
- Yoğun matrisi geri kurmak yalnızca triplet'leri gerektirir

<!-- Konuşma notu: Her sıfır olmayan hücre için üç sayı, çoğunlukla sıfırlardan oluşan koca bir satırın yerini alır — kazanç, matris ne kadar seyrekse o kadar büyür. -->

---

# Seyrek matris triplet olarak, adım adım

<iframe class="dsanim" src="anim/sparse-matrix-triplet.html?yer=slayt&lang=tr" title="Seyrek matris: triplet"></iframe>

<!-- Konuşma notu: Kaç hücrenin sessizce atlandığına bakın — yalnızca bir avuç sıfır olmayan hücre bir triplet satırı üretir. -->

---

# Uç durum — tamamen sıfır bir matris

<iframe class="dsanim" src="anim/sparse-matrix-triplet.html?yer=slayt&lang=tr&example=all-zero" title="Seyrek matris triplet: tamamen sıfır"></iframe>

<!-- Konuşma notu: Her hücre taranır ve atlanır — triplet tablosu tamamen boş kalır, ve bu da kendi başına geçerli, doğru bir sonuçtur. -->

---

# Kod — `to_triplets()`

```c
int to_triplets(int mat[ROWS][COLS], Triplet out[]) {
    int k = 0;
    for (int i = 0; i < ROWS; i++)
        for (int j = 0; j < COLS; j++)
            if (mat[i][j] != 0) {
                out[k].row = i;
                out[k].col = j;
                out[k].value = mat[i][j];
                k++;
            }
    return k;
}
```

<!-- Konuşma notu: İç içe döngüler her hücreyi ne olursa olsun tarar, ama if kontrolü sayesinde yalnızca sıfır olmayan hücreler out[]'a yazılır. -->

---

# Karmaşıklık

- Yoğun matrisi tarama: **O(satır × sütun)**
- Çıktı boyutu, **sıfır olmayan sayısına** eşit, asla fazla değil
- Çok seyrek bir matriste: triplet'ler çok daha küçük

<!-- Konuşma notu: Taramanın kendisi tüm matristen daha ucuz olamaz, ama sonuçtan sonra kurulan her şey küçük çıktıdan faydalanır. -->

---

# Hızlı devrik: yeniden sıralama gerekmez

- Basit devrik: `(row,col)`'u takas et, sonra **sırala** — O(nnz log nnz)
- Daha iyisi: önce sütun başına sıfır olmayanları **say**
- Sayıları başlangıç **konumlarına** çevir (önek toplamı)
- Bir geçiş daha, her triplet'i zaten sıralı yerleştirir

<!-- Konuşma notu: Bu gerçekten zekice bir numara — her kaydın nereye ait olduğunu önceden bilmek, hiç sıralamaya gerek kalmaması demek. -->

---

# Hızlı devrik, adım adım

<iframe class="dsanim" src="anim/sparse-matrix-transpose.html?yer=slayt&lang=tr" title="Seyrek matris: hızlı devrik"></iframe>

<!-- Konuşma notu: Önce count[]'un, sonra bu sayıları başlangıç ofsetlerine çeviren pos[]'un dolduğuna bakın — tek bir çıktı triplet'i yerleşmeden önce. -->

---

# Uç durum — tamamen dolu bir matris

<iframe class="dsanim" src="anim/sparse-matrix-transpose.html?yer=slayt&lang=tr&example=fully-dense" title="Hızlı devrik: tamamen dolu"></iframe>

<!-- Konuşma notu: Her hücre sıfır olmasa bile hızlı devrik yine çalışır — yalnızca yerleştireceği triplet sayısı, matrisin hücre sayısı kadar olur. -->

---

# Kod — sayma ve önek toplamları

```c
int count[COLS] = {0};
int pos[COLS];
for (int i = 0; i < nnz; i++)
    count[a[i].col]++;        /* per column */
pos[0] = 0;
for (int c = 1; c < COLS; c++)
    pos[c] = pos[c - 1] + count[c - 1];
```

<!-- Konuşma notu: pos[c], c'den önceki her sütunun toplamı — c sütununun triplet'lerinin çıktıda tam olarak başlaması gereken yer. -->

---

# Kod — her triplet'i yerleştirme

```c
for (int i = 0; i < nnz; i++) {
    int c = a[i].col;
    int p = pos[c]++;
    b[p].row = a[i].col;    /* row/col swap */
    b[p].col = a[i].row;
    b[p].value = a[i].value;
}
```

<!-- Konuşma notu: pos[c]++, hem c sütunu için bir sonraki boş hücreyi okur hem de oraya inecek bir sonraki triplet için o hücreyi ayırır. -->

---

# Karmaşıklık ve sık yapılan hatalar

- İki geçiş, `O(nnz + COLS)` — hiç sıralama yok
- Genel bir sıralamanın O(nnz log nnz)'sinden çok daha hızlı
- Hata: önek toplamını atlamak — çıktı sırasız kalır
- Hata: `row` ile `col`'u takas etmeyi unutmak

<!-- Konuşma notu: Önek toplamı adımını atlayın, her triplet yine de bir yere yerleşir — sadece algoritmanın vaat ettiği sıralı düzende değil. -->

---

# İki seyrek matrisi toplama: bir birleştirme

- İki triplet listesi de zaten satır öncelikli **sıralı**
- İkisini birlikte, merge sort'un birleştirme adımı gibi yürü
- Erken gelen `(row,col)` kazanır ve doğrudan kopyalanır
- İkisinde de aynı `(row,col)`: değerleri **topla**

<!-- Konuşma notu: Her iki girdi de zaten sıralı olduğu için, toplama hiçbir zaman arama yapmak zorunda kalmıyor — yalnızca iki mevcut konumu karşılaştırması gerekiyor. -->

---

# Seyrek matris toplama, adım adım

<iframe class="dsanim" src="anim/sparse-matrix-addition.html?yer=slayt&lang=tr" title="Seyrek matris toplama"></iframe>

<!-- Konuşma notu: i ve j işaretçilerinin bağımsız ilerlediğine bakın, her biri yalnızca kendi listesinde adım atarak — tam olarak iki sıralı diziyi birleştirmek gibi. -->

---

# Uç durum — birbirini götüren değerler

<iframe class="dsanim" src="anim/sparse-matrix-addition.html?yer=slayt&lang=tr&example=cancel" title="Seyrek matris toplama: iptal"></iframe>

<!-- Konuşma notu: İptal olan bir hücre çıktıya hiç yazılmaz — sonuç seyrek kalır, yeni bir sıfır kayıt hiç kazanmaz. -->

---

# Kod — birleştirme döngüsü

```c
while (i < na && j < nb) {
    if (/* … a[i]'s (row,col) comes first … */) {
        out[k++] = a[i++];
    } else if (/* … b[j]'s comes first … */) {
        out[k++] = b[j++];
    } else {
        int sum = a[i].value + b[j].value;
        if (sum != 0) /* … out[k++] = sum entry … */;
        i++; j++;
    }
}
```

<!-- Konuşma notu: Yalnızca üç durum: a daha erken, b daha erken, ya da ikisi de tam olarak aynı hücreye düşer ve değerleri toplanır. -->

---

# Karmaşıklık ve sık yapılan hatalar

- Tek bir birleştirme geçişi: **O(na + nb)**, yeniden sıralama yok
- **İkisinde de** olmayan bir hücreye hiç dokunmaz
- Hata: toplam 0 olduğunda hücreyi düşürmeyi unutmak
- Hata: sırasız triplet listelerinin yine de birleşeceğini varsaymak

<!-- Konuşma notu: Bu yaklaşımın tamamı, iki listenin de zaten sıralı olmasına dayanıyor — sırasız triplet'ler verin, birleştirme sessizce yanlış yanıt verir. -->

---

# Mini soru

(1,2) hücresi A matrisinde 6, B matrisinde
−6. Toplamın triplet listesinde ne kalır?

<!-- Konuşma notu: Sınıfın hesabı yapmasına izin verin, sonraki slayttan önce. -->

---

# Yanıt

**Hiçbir şey.** `6 + (-6) = 0`, ve toplamı
sıfır olan bir hücre tamamen düşürülür —
triplet listesi yalnızca sıfır olmayan
değerleri tutar.

<!-- Konuşma notu: Sıfır değerli bir triplet'i tutmak, tüm gösterimin dayandığı "yalnızca sıfır olmayan hücreler" sözünü sessizce bozardı. -->

---

<!-- _class: bolum -->

# 5. Bağlı Listeler: Düğüm, Baş, NULL

<!-- Konuşma notu: Bölüm 5, haftanın ikinci büyük fikrini tanıtıyor — ekleme yapmanın hiçbir zaman başka bir şeyi kaydırmak zorunda olmadığı bir yapı. -->

---

# Bir soru ile başlayalım

Bir diziye her ekleme `n` elemana kadarını
kaydırabilir. Ekleme yapmanın var olan
değerleri **hiçbir zaman** hareket ettirmediği
bir yapı var mı?

<!-- Konuşma notu: Sınıfa bir an verin — yanıt, bugünün geri kalanının üzerine kurulduğu şey. -->

---

# Kısa bir tarihçe

- **1956** — John McCarthy, Lisp'in **cons hücresi**
- Bir cons hücresi: bir değer, artı bir sonrakine işaretçi
- Altı on yıl sonra hâlâ her dilde bu fikir kullanılıyor
- C'nin `struct Node { data; next; }`'i aynı fikir

<!-- Konuşma notu: McCarthy "veri yapıları" diye bir konu düşünmüyordu, sembolik akıl yürütme için bir dil kuruyordu — bu fikir sadece her yerde çıktı karşımıza. -->

---

# Sezgi — bir define avı

- Her ipucu bir sonraki ipucunun **nerede** olduğunu söyler
- Haritanın tamamını asla bir kerede görmezsiniz
- Bir işaretçiyi izle, var, oku, bir sonrakini izle
- **Son** ipucu "burada bir şey yok" der — `NULL`

<!-- Konuşma notu: Bir dizi bir kerede tuttuğunuz bir harita; bir bağlı liste yalnızca tek seferde bir adım yürüyebildiğiniz bir iz. -->

---

# Tüm fikir, tek bir struct'ta

```c
typedef struct Node {
    int data;
    struct Node *next;
} Node;
```

- Bir değer, bir işaretçi — bağlı liste bu kadar
- Kaydırma yok: yeni bir düğüm yalnızca bir işaretçi alır

<!-- Konuşma notu: Bu hafta ve gelecek haftaki her bağlı liste programı, tam olarak bu beş satırlık struct üzerine kuruluyor. -->

---

# `head` ve `NULL` sonlandırıcısı

- `head`, listeye giren **tek** sabit referanstır
- Her başka düğüme `next`i izleyerek ulaşılır
- Son düğümün `next`i `NULL`dır — "başka düğüm yok"
- Boş bir liste yalnızca `head == NULL`dır

<!-- Konuşma notu: head'i kaybedin, ondan sonraki her düğüm erişilemez hale gelir — head, tüm listenin asılı durduğu tek iplik. -->

---

# "İnception": kendini içeren bir struct

- `struct Node`'un `struct Node *` türünde bir alanı var
- Bu sonsuz özyineleme **değil** — bir işaretçi
- Bir işaretçinin boyutu sabit, `Node` tamamlanmadan bile bilinir
- Bu yüzden `struct Node *next;` derlenir, ama `Node next;` derlenemez

<!-- Konuşma notu: Bu kendine gönderme ilk seferde birçok öğrenciyi takıldırıyor — anahtar nokta, bir işaretçinin neyi gösterdiğine bakmaksızın hep aynı küçük, sabit boyutta olması. -->

---

# Sık yapılan hatalar

- `->next`'ten önce `NULL` kontrolünü unutmak
- Bir **düğümü** (struct) ona giden bir **işaretçiyle** karıştırmak
- Bir işaretçi gerekirken `Node next;` yazmak

<!-- Konuşma notu: NULL bir işaretçiyi dereferans etmek, bu dönemin her bağlı liste programındaki en yaygın çökme nedeni. -->

---

# Mini soru

`next` neden düz bir `struct Node` değil,
mutlaka `struct Node *` olarak tanımlanmalı?

<!-- Konuşma notu: Sınıfın bunu "inception" slaytıyla bağlantılandırmasına izin verin, yanıttan önce. -->

---

# Yanıt

Düz bir `Node` alanı, `Node`'un **boyutunun**
önceden bilinmesini gerektirirdi — ama `Node`
henüz tanımlanmayı bitirmedi. Bir işaretçinin
boyutu buna hiç bağlı değildir.

<!-- Konuşma notu: Bir işaretçi, neyi gösterdiğine bakmaksızın hep aynı küçük bayt sayısı — döngüsel bağımlılığı kıran şey tam olarak bu. -->

---

<!-- _class: bolum -->

# 6. Tekil Bağlı Listeler: Ekleme, Silme, Arama, Tersine Çevirme

<!-- Konuşma notu: Bölüm 6, sonraki her liste türünün — çift yönlü, dairesel, XOR, atlamalı — yeniden kullandığı ya da genişlettiği dört işlemi kuruyor. -->

---

# Bir soru ile başlayalım

Üç ekleme konumu — baş, son ve "belirli bir
düğümden sonra" — çok farklı bedellere mal
oluyor. Hangisi ucuz, hangisi değil?

<!-- Konuşma notu: Yanıt tamamen listenin ayrı bir son (tail) işaretçisi tutup tutmadığına bağlı — bu sürüm tutmuyor. -->

---

# Eklemenin üç yolu

- `insert_head`: yeni düğüm eski başı gösterir — **O(1)**
- `insert_tail`: burada son işaretçisi yok — sona kadar yürü
- `insert_after(prev, v)`: iki işaretçi yazımı, **sırayla**
- Bu sırayı ters çevirmek listeyi **koparır**

<!-- Konuşma notu: "Sırayla" burada bir üslup tercihi değil — çalışan bir liste ile koparılmış bir liste arasındaki fark. -->

---

# Tekil listede ekleme, adım adım

<iframe class="dsanim" src="anim/singly-insert.html?yer=slayt&lang=tr" title="Tekil bağlı liste: ekleme"></iframe>

<!-- Konuşma notu: Özellikle insert_tail'i izleyin — son işaretçisi olmadığı için önce var olan her düğümü geçmesi gerekiyor. -->

---

# Uç durum — iki adım, ters sırayla

<iframe class="dsanim" src="anim/singly-insert.html?yer=slayt&lang=tr&example=order-swap-mistake" title="Tekil ekleme: yanlış işaretçi sırası"></iframe>

<!-- Konuşma notu: Bu gösterim gerçek listeye hiç dokunmaz — yalnızca insert_after'daki yazım sırasının neden gerçekten önemli olduğunu göstermek için var. -->

---

# Kod — `insert_head()`

```c
Node *insert_head(Node *head, int value) {
    Node *n = malloc(sizeof(Node));
    n->data = value;
    n->next = head;    /* points at the old head */
    return n;           /* new node is head now */
}
```

<!-- Konuşma notu: Bir malloc, bir işaretçi yazımı, bir dönüş — insert_head listenin geri kalanına hiç bakmaz bile. -->

---

# Kod — `insert_after()`: sıra önemli

```c
void insert_after(Node *prev, int value) {
    Node *n = malloc(sizeof(Node));
    n->data = value;
    n->next = prev->next;   /* STEP 1: new first */
    prev->next = n;         /* STEP 2: then link */
}
```

<!-- Konuşma notu: Bu iki satırı takas edin, 1. adım onu okuduğunda prev->next zaten n'e eşit olur — yeni düğüm kendini gösterir hale gelir. -->

---

# Karmaşıklık ve sık yapılan hatalar

- `insert_head`: **O(1)** — hiç yürüme yok
- `insert_tail` (son işaretçisi yok): sona kadar yürür — **O(n)**
- `insert_after`: `prev` zaten bulunmuşsa **O(1)**
- Hata: 1. ve 2. ADIM'ı takas etmek — listeyi koparır

<!-- Konuşma notu: insert_after'ın kendisi O(1), ama prev'i baştan bulmak, yani arama yapmak, genellikle değil. -->

---

# Değere göre silme

- Özel durum: değer **baş**ta
- Aksi halde: `prev`/`cur` birlikte yürüyerek arar
- Bulunduğunda: `prev->next = cur->next` — **bypass oku**
- Sonra `free(cur)` — düğüm gitti

<!-- Konuşma notu: Bypass oku tüm numaranın kendisi: artık kimse cur'u göstermiyor, o yüzden erişilemez hale geliyor, serbest bırakılmaya hazır. -->

---

# Tekil listede silme, adım adım

<iframe class="dsanim" src="anim/singly-delete.html?yer=slayt&lang=tr" title="Tekil bağlı liste: silme"></iframe>

<!-- Konuşma notu: prev ve cur'un birlikte hareket etmesini izleyin — prev her zaman cur'un bir adım gerisinde, cur bulunur bulunmaz yeniden bağlanmaya hazır. -->

---

# Uç durum — son düğümü, sonra olmayan bir değeri silmek

<iframe class="dsanim" src="anim/singly-delete.html?yer=slayt&lang=tr&example=tail-and-missing" title="Tekil silme: son düğüm ve olmayan bir değer"></iframe>

<!-- Konuşma notu: Bu kodda son düğümü silmek ayrı bir durum bile değil — aynı prev/cur taramasından doğal olarak çıkıyor. -->

---

# Kod — `delete_value()`

```c
Node *delete_value(Node *head, int value,
                    bool *removed) {
    *removed = false;
    if (head == NULL) return NULL;
    if (head->data == value) {   /* delete head */
        Node *tmp = head;
        head = head->next;
        free(tmp);
        *removed = true;
        return head;
    }
    /* … prev/cur scan, bypass, free(cur) … */
}
```

<!-- Konuşma notu: Baş durumu burada ayrı ele alınıyor, çünkü değişmesi gereken yalnızca bir düğümün next alanı değil, head'in kendisi. -->

---

# Karmaşıklık ve sık yapılan hatalar

- Başı silmek: **O(1)**, arama gerekmez
- Başka herhangi bir yeri silmek: bulmak için **O(n)**
- Hata: başın **özel** bir durum olduğunu unutmak
- Hata: `prev`'i kaydetmeden `cur`'u ilerletmek

<!-- Konuşma notu: prev, cur ile aynı adımda güncellenmezse, bypass oku tamamen yanlış düğümden çıkmış olur. -->

---

# Doğrusal arama: kısayol yok

- İndis aritmetiği yok — bir listede `arr[k]` yoktur
- `head`'den başlayıp bir seferde bir düğümü karşılaştır
- Bulundu: **konumunu** döndür; bitti: `-1` döndür

<!-- Konuşma notu: Bu, bir listenin bir diziye göre feda ettiği en büyük şey — k konumuna doğrudan atlamanın hiçbir yolu yok. -->

---

# Tekil listede arama, adım adım

<iframe class="dsanim" src="anim/singly-search.html?yer=slayt&lang=tr" title="Tekil bağlı liste: arama"></iframe>

<!-- Konuşma notu: Karşılaştırma sayacının yükselmesine bakın — ziyaret edilen her düğüm, aranan değer olsun olmasın, bir karşılaştırmaya mal olur. -->

---

# Uç durum — boş bir listede arama

<iframe class="dsanim" src="anim/singly-search.html?yer=slayt&lang=tr&example=empty-list" title="Tekil arama: boş bir liste"></iframe>

<!-- Konuşma notu: Boş bir liste, for döngüsünün koşulu olan cur != NULL'ın hemen başarısız olması demek — arama hiçbir şeyi karşılaştırmadan -1 döner. -->

---

# Kod — `search()`

```c
int search(Node *head, int value) {
    int index = 0;
    for (Node *cur = head; cur != NULL;
         cur = cur->next) {
        if (cur->data == value)
            return index;      /* found here */
        index++;
    }
    return -1;                 /* not found */
}
```

<!-- Konuşma notu: Bu fonksiyonun tamamı bir slayta sığıyor — bugünkü derste ondan hiçbir şey kesilmiyor. -->

---

# Karmaşıklık

- Her arama: **O(n)** — atlanacak bir indis yok
- Karşılaştırma: dizide `arr[k]` **O(1)**dir
- Bu fark, üç bölüm sonraki karşılaştırmayı yönlendirir

<!-- Konuşma notu: Bu O(n) sayısını aklınızda tutun — üç bölüm sonraki diziler-listeler tablosundaki en büyük argüman bu. -->

---

# Yerinde tersine çevirme: üç işaretçi

- `prev` arkada, `curr` önde, `next` ileriye bakar
- `curr->next`'in üzerine yazmadan **önce** `next`'i kaydet
- `curr->next`'i çevirip `prev`'i gösterecek şekilde yap
- Sonra her iki işaretçi de bir düğüm ileri gider

<!-- Konuşma notu: Üç işaretçinin bir seferde bir düğüm üzerinde uyum içinde dans etmesi, algoritmanın tamamı — ne özyineleme, ne ek bellek. -->

---

# Tekil listede tersine çevirme, adım adım

<iframe class="dsanim" src="anim/singly-reverse.html?yer=slayt&lang=tr" title="Tekil bağlı liste: tersine çevirme"></iframe>

<!-- Konuşma notu: Her okun teker teker, hep aynı sırayla çevrilmesini izleyin: next'i kaydet, curr'un okunu çevir, ikisini de ilerlet. -->

---

# Uç durum — yalnızca iki düğüm

<iframe class="dsanim" src="anim/singly-reverse.html?yer=slayt&lang=tr&example=two-nodes" title="Tekil tersine çevirme: iki düğüm"></iframe>

<!-- Konuşma notu: En küçük önemsiz olmayan durum bile aynı üç-işaretçi dansından geçiyor, yalnızca çok yerine tek bir tekrarla. -->

---

# Kod — `reverse()`

```c
Node *reverse(Node *head) {
    Node *prev = NULL;
    Node *curr = head;
    while (curr != NULL) {
        Node *next = curr->next;  /* save rest */
        curr->next = prev;         /* flip arrow */
        prev = curr;
        curr = next;
    }
    return prev;                   /* new head */
}
```

<!-- Konuşma notu: Bu fonksiyonun tamamı da bir slayta sığıyor, ve onu en az bir kez satır satır, sesli okumaya değer. -->

---

# Karmaşıklık

- Tek geçiş, düğüm başına bir çevirme — **O(n)** zaman
- Yeni düğüm ayrılmıyor — **O(1)** alan
- Karşılaştırma: bir diziyi tersine çevirmek de ekstra işaretçi gerektirmez

<!-- Konuşma notu: Üç işaretçinin ötesinde hiç ek bellek gerektirmeyen yerinde tersine çevirme, bu algoritmayı ezbere bilmeye değer kılan asıl neden. -->

---

# Mini soru

`curr->next`'i geçici bir `next` değişkenine
kaydetmeden **önce** `prev`'i göstermek üzere
çevirirseniz ne bozulur?

<!-- Konuşma notu: Sınıfın yanıttan önce her adımda curr->next'in gerçekte neyi tuttuğunu izlemesine izin verin. -->

---

# Yanıt

**Listenin geri kalanı kaybolur.** `curr->next`
geriye işaret ettiği an, ondan sonra gelen
düğümlere ulaşmanın hiçbir yolu kalmaz.

<!-- Konuşma notu: Bu, insert_after'ın adım sırasıyla tamamen aynı "önce kaydet, sonra üzerine yaz" dersi, yalnızca farklı bir işlemde yeniden karşımıza çıkıyor. -->

---

<!-- _class: bolum -->

# 7. Çift Yönlü Bağlı Listeler

<!-- Konuşma notu: Bölüm 7, düğüm başına ikinci bir işaretçi ekliyor, karşılığında iki yönde de yürüyebilmek için. -->

---

# Bir soru ile başlayalım

Tekil bir liste yalnızca **ileri** yürüyebilir.
Geriye de yürüyebilmek için ne değişmeli?

<!-- Konuşma notu: Yanıt söylendiğinde neredeyse fazla bariz geliyor — ama her işlemin nasıl yazılması gerektiğini değiştiriyor. -->

---

# Sezgi — çift yönlü bir cadde

- Tekil liste: tek yönlü bir cadde, yalnızca ileri
- Çift yönlü liste: çift yönlü bir cadde
- Her düğüm **iki** tabela taşır: `next` ve `prev`
- Geri dönmek hiçbir ek bedele mal olmaz — yalnızca `prev`'i izleyin

<!-- Konuşma notu: Ama ek işaretçi bedavaya gelmiyor — her ekleme ve silmede doğru tutulması gereken bir alan daha. -->

---

# `insert_after`: ikisi değil, dört işaretçi düzeltilir

- Tekil listenin `insert_after`'ı: 2 işaretçiyi düzeltir
- Çift yönlü liste: **yeni** düğümün `prev`'ini de düzeltir
- Ve **eski sonraki**nin `prev`'ini, varsa
- `cur`, `tail` idiyse `list->tail`'i de güncelleyin

<!-- Konuşma notu: Ekleme noktasını atlayan her işaretçinin artık geri yönde eşleşen bir işaretçisi var — ikisinin de düzeltilmesi gerekiyor. -->

---

# Çift yönlü listede ekleme, adım adım

<iframe class="dsanim" src="anim/doubly-linked-list.html?yer=slayt&lang=tr" title="Çift yönlü bağlı liste: ekleme"></iframe>

<!-- Konuşma notu: Her düğümdeki iki oka bakın — satırın üstünde kavis çizen next, altında kavis çizen prev — birlikte güncelleniyor, hiçbir zaman yalnızca biri değil. -->

---

# Uç durum — tail'in gösterdiği düğümden hemen sonra ekleme

<iframe class="dsanim" src="anim/doubly-linked-list.html?yer=slayt&lang=tr&example=insert-after-tail" title="Çift yönlü ekleme: tail'den sonra"></iframe>

<!-- Konuşma notu: Şu anki tail'den sonra eklemek, yeni düğümün yeni tail olması demek — sadece bir next işaretçisi değil, list->tail'in kendisi güncellenmeli. -->

---

# Kod — `insert_after()`

```c
bool insert_after(List *list, int target, int v) {
    for (Node *cur = list->head; cur; cur = cur->next) {
        if (cur->data == target) {
            Node *n = malloc(sizeof(Node));
            n->data = v; n->prev = cur; n->next = cur->next;
            if (cur->next) cur->next->prev = n;
            else list->tail = n;   /* cur was the tail */
            cur->next = n;
            return true;
        }
    }
    return false;
}
```

<!-- Konuşma notu: Toplamda dört işaretçi yazımı: yeni düğümün kendi prev'i ve next'i, eski sonraki'nin prev'i (ya da list->tail), ve cur'un next'i. -->

---

# Kod — `delete_value()`: `prev` için tarama yok

```c
bool delete_value(List *list, int value) {
    for (Node *cur = list->head; cur; cur = cur->next) {
        if (cur->data == value) {
            if (cur->prev) cur->prev->next = cur->next;
            else list->head = cur->next;
            if (cur->next) cur->next->prev = cur->prev;
            else list->tail = cur->prev;
            free(cur);
            return true;
        }
    }
    return false;
}
```

<!-- Konuşma notu: cur->prev burada doğrudan okunuyor — tekil sürüm, tararken ayrı bir prev değişkenini elle takip etmek zorundaydı. -->

---

# Karmaşıklık ve sık yapılan hatalar

- Hedefi bulmak: tekildekiyle aynı **O(n)**
- Bulunduktan sonra yeniden bağlamak: her iki yönde **O(1)**
- Hata: tail değiştikten sonra `tail`'i güncellemeyi unutmak
- Hata: yeni düğümün `prev` bağını atlamak

<!-- Konuşma notu: Arama bedeli ikinci bir işaretçiyle hiç iyileşmiyor — yalnızca yeniden bağlama adımı, ve geriye yürüyebilme değişiyor. -->

---

# Mini soru

Çift yönlü bir listenin `delete_value`'u,
tekil sürümün aksine, neden ayrı bir
`prev`-izleme değişkenine hiç ihtiyaç duymaz?

<!-- Konuşma notu: Yanıttan önce delete_value kod slaytına geri işaret edin. -->

---

# Yanıt

**Her düğüm zaten kendi `prev`'ini saklar.**
Tekil sürüm tararken `prev`'i elle takip
etmek zorundaydı; çift yönlü sürüm yalnızca
`cur->prev`'i doğrudan okur.

<!-- Konuşma notu: Saklanan o prev alanı, çift yönlü listelerin var olmasının tüm nedeni — geri kalan her şey, her düğümde onun bulunmasından çıkıyor. -->

---

<!-- _class: bolum -->

# 8. Dairesel Listeler ve Josephus Problemi

<!-- Konuşma notu: Bölüm 8, NULL'ı tamamen kaldırıyor — liste sona ermek yerine sarılıyor — ve bu biçimi çok eski bir bulmacayı çözmek için kullanıyor. -->

---

# Bir soru ile başlayalım

Ya **son** düğümün `next`i, `NULL` yerine
ilk düğümü gösterseydi?

<!-- Konuşma notu: Bunu denememek için bariz bir neden yok — ve tam olarak Josephus probleminin ihtiyaç duyduğu şey olduğu ortaya çıkıyor. -->

---

# Sezgi — bir çemberde oturan insanlar

- Aslında ne "ilk" koltuk ne de "son" koltuk var
- Yeterince yürürseniz başladığınız yere geri dönersiniz
- Dairesel bir listenin yürüyüşü durduracak bir `NULL`'ı yok
- Başka bir şey — bir sayaç, bir koşul — durdurmalı

<!-- Konuşma notu: Bunu unutmak klasik dairesel liste hatası: NULL'da durmak üzere yazılmış bir döngü hiçbir zaman durmaz. -->

---

# Tek işaretçi, ayrı bir `head` yok

- `tail`, en son eklenen düğümü gösterir
- `tail->next`, **baştır** — ekstra bir alan yok
- Tek bir düğüm **kendini** gösterir — küçük bir döngü
- Silmek ileri bir tarama ister — `prev` yok

<!-- Konuşma notu: Yalnızca tail'i tutup head'i tail->next'ten türetmek, bu programın bilinçli, küçük bir tasarım tercihi. -->

---

# Dairesel liste işlemleri, adım adım

<iframe class="dsanim" src="anim/circular-linked-list.html?yer=slayt&lang=tr" title="Dairesel bağlı liste"></iframe>

<!-- Konuşma notu: Satırın altında bir eğri olarak çizilen sarılma okuna bakın — son düğümü doğrudan ilk düğüme bağlıyor. -->

---

# Uç durum — son düğüm silinir

<iframe class="dsanim" src="anim/circular-linked-list.html?yer=slayt&lang=tr&example=one-node-to-empty" title="Dairesel liste: tek düğümden boşa"></iframe>

<!-- Konuşma notu: Tek düğümlü dairesel bir liste kendini gösterir; o tek düğümü silmek, listeyi gerçekten boş bırakmalı, tail geri NULL'a dönmeli. -->

---

# Kod — `insert_tail()`

```c
Node *insert_tail(Node *tail, int value) {
    Node *n = malloc(sizeof(Node));
    n->data = value;
    if (tail == NULL) {
        n->next = n;       /* points at itself */
        return n;
    }
    n->next = tail->next;  /* new node -> old head */
    tail->next = n;        /* old tail -> new node */
    return n;
}
```

<!-- Konuşma notu: Boş liste durumu özel, çünkü korunacak henüz bir head->next ilişkisi yok — yeni düğümün kendine dönmesi gerekiyor. -->

---

# Karmaşıklık ve sık yapılan hatalar

- Sona ekleme: **O(1)**, öncekiyle aynı numara
- Değere göre silme: **O(n)** tarama — `prev` bağı yok
- Hata: bir gezinmeyi durdurmak için `cur == NULL` kontrolü
- Dairesel bir liste bir `NULL` değil, bir **adım sayacı** ister

<!-- Konuşma notu: Bu hafta yalnız başına, bu haftaki materyalin diğer her hatasından daha fazla sonsuz döngüye neden oluyor. -->

---

# Kısa bir tarihçe

- **M.S. 67 civarı** — Flavius Josephus, Yodfat kuşatması
- Efsane: 41 asker, her 3. asker elenir
- Josephus'un kendini hayatta kalan yere yerleştirdiği söylenir
- Tek bir dairesel liste bugün tüm bulmacayı çözüyor

<!-- Konuşma notu: Efsane tam olarak doğru olsun ya da olmasın, tarif ettiği eleme örüntüsü tam olarak bu algoritmanın simüle ettiği şey. -->

---

# Her *k*. kişi elenir

- Çember içinde `n` kişi, 1..n numaralı
- Son hayatta kalandan `k-1` adım ileri say
- Üzerine geldiğiniz kişiyi eleyin
- Yalnızca **bir** kişi kalana kadar tekrarlayın

<!-- Konuşma notu: Her eleme, tıpkı dairesel silme gibi, yalnızca tek bir bypass oku — tüm problem az önce gösterilen işleme indirgeniyor. -->

---

# Josephus problemi, adım adım

<iframe class="dsanim" src="anim/josephus.html?yer=slayt&lang=tr" title="Josephus problemi"></iframe>

<!-- Konuşma notu: Her elemede çemberin tam olarak bir düğüm küçülmesine, sarılma okunun her seferinde yeniden çizilmesine bakın. -->

---

# Uç durum — tek kişilik bir çember

<iframe class="dsanim" src="anim/josephus.html?yer=slayt&lang=tr&example=n-equals-1" title="Josephus: tek kişi"></iframe>

<!-- Konuşma notu: Çemberde yalnızca bir kişi varken, eleme döngüsünün remaining > 1 koşulu hemen yanlış olur — kimse hiç elenmez. -->

---

# Kod — `josephus()`

```c
int josephus(int n, int k) {
    Node *cur = head;
    int remaining = n;
    while (remaining > 1) {
        for (int s = 1; s < k; s++) {  /* k-1 steps */
            prev = cur;
            cur = cur->next;
        }
        prev->next = cur->next;   /* remove cur */
        cur = prev->next;
        remaining--;
    }
    return cur->id;                /* the survivor */
}
```

<!-- Konuşma notu: İç for döngüsü tam olarak k-1 adım ileriyi sayar — dairesel silmeden aynı bypass oku, sonra üzerine geldiğini kaldırır. -->

---

# Karmaşıklık

- Doğrudan simüle etmek: en kötü durumda **O(n · k)**
- Kapalı biçimli bir yineleme, hayatta kalanı **O(n)**'de verir
- `J(1)=0`, `J(n) = (J(n-1) + k) mod n`

<!-- Konuşma notu: Simülasyon, animasyonun adım adım gösterdiği şey; yineleme ise hiç çembere gerek kalmadan yalnızca son yanıta giden bir kısayol. -->

---

# Mini soru

`k = 1` iken her sayım yalnızca "bir sonraki
kişi". 10 kişilik bir çemberde kim hayatta kalır?

<!-- Konuşma notu: Sınıfın k=1'in gerçekte ne anlama geldiğini düşünmesine izin verin, yanıttan önce. -->

---

# Yanıt

**10. kişi — sıradaki son kişi.** `k=1`
ile hiç atlama yok: eleme yalnızca düz
sırayla ilerler, 1'den 9'a kadar.

<!-- Konuşma notu: k=1 mümkün olan en basit durum, ve genel algoritmanın hâlâ sade sezginin beklediği gibi davrandığını gösteren iyi bir sağlama. -->

---

<!-- _class: bolum -->

# 9. XOR Bağlı Listeler: Bir Merak Konusu

<!-- Konuşma notu: Bölüm 9, bilinmeye değer bir bellek tasarrufu numarası, ama sonundaki hatalar slaytı en çok önemli olan kısım. -->

---

# Bir soru ile başlayalım

Çift yönlü bir liste düğüm başına iki
işaretçi alanı harcar. **Tek** bir alan bir
şekilde iki komşuyu birden tutabilir mi?

<!-- Konuşma notu: İlk başta imkânsız geliyor — iki adresi tek bir alanın boşluğunda gerçekten saklayamazsınız — ama bir numara var. -->

---

# `npx = prev XOR next`

- **Tek** alan sakla: `prev`'in adresi XOR `next`'in adresi
- Bilinen bir komşu `known`'dan gelindiğinde diğerini kur:
- `other = npx XOR known`
- XOR, geldiğiniz komşuyu sessizce "iptal" eder

<!-- Konuşma notu: Bir değeri kendisiyle XOR'lamak her zaman sıfır verir — bu tek olgu, bu yapının tamamının arkasındaki numara. -->

---

# XOR listede gezinme, adım adım

<iframe class="dsanim" src="anim/xor-linked-list.html?yer=slayt&lang=tr" title="XOR bağlı liste"></iframe>

<!-- Konuşma notu: Ekrandaki her düğümün hex adresine ve npx değerine bakın — gezinme, bir sonraki adresi her adımda gerçekten hesaplıyor. -->

---

# Uç durum — boş bir listenin sonuna ekleme

<iframe class="dsanim" src="anim/xor-linked-list.html?yer=slayt&lang=tr&example=tail-into-empty" title="XOR liste: boş listenin sonu"></iframe>

<!-- Konuşma notu: Boş bir listedeki tek düğüm hem baş hem son birden — npx'i yalnızca tek gerçek komşusunun NULL ile XOR'u. -->

---

# Kod — struct ve XOR numarası

```c
typedef struct Node {
    int data;
    uintptr_t npx;   /* XOR of prev and next */
} Node;

static Node *xor_node(uintptr_t npx, Node *known) {
    return (Node *)(npx ^ (uintptr_t)known);
}
```

<!-- Konuşma notu: xor_node, bu programdaki her başka fonksiyonun çağırdığı tek yardımcı — numaranın gerçekte yaşadığı yer burası. -->

---

# Kod — `traverse_forward()`

```c
void traverse_forward(Node *head) {
    Node *prev = NULL, *cur = head;
    while (cur != NULL) {
        printf(" %d", cur->data);
        Node *next = xor_node(cur->npx, prev);
        prev = cur; cur = next;
    }
}
```

<!-- Konuşma notu: prev, tıpkı sıradan bir tekil gezinmenin başladığı gibi NULL'dan başlıyor — döngünün biçimi hakkında değişen başka bir şey yok. -->

---

# Karmaşıklık

- Başa veya sona ekleme: öncekiyle aynı **O(1)**
- Her gezinme adımı: bir fazladan **XOR** — yine de O(1) her biri
- Tasarruf edilen bellek: düğüm başına bir işaretçi alanı

<!-- Konuşma notu: Zaman karmaşıklığı çift yönlü bir listeye göre aslında iyileşmiyor — buradaki tüm kazanç hız değil, bellek. -->

---

# Bunun neden bir merak konusu olduğu, alışkanlık değil

- C, işaretçi↔tamsayı gidiş-dönüşlerini bu şekilde **garanti etmez**
- `uintptr_t`'i işaretçiye geri çevirmek **derleyiciye bağlıdır**
- Çöp toplayıcılı bir dil (Java) bunu hiç yapamaz
- Gerçek kod: bunun yerine düz bir çift yönlü liste kullanın

<!-- Konuşma notu: Bu bölümdeki en önemli tek slayt burası — numara zekice, ama gerçekten üretime çıkarılacak bir şey değil. -->

---

# Mini soru

Bir çöp toplayıcı, C'nin `malloc`'unun yaptığı
gibi bir XOR bağlı listeyi neden hiç destekleyemez?

<!-- Konuşma notu: Sınıfın bunu bir çöp toplayıcının gerçekte ne yapması gerektiğiyle bağlantılandırmasına izin verin. -->

---

# Yanıt

**Bir GC, izlemek ve gerekirse taşımak için
her canlı işaretçiyi bulmalıdır.** XOR'lanmış
bir tamsayının içine gizlenmiş bir adres, o
taramaya görünmezdir — GC onu bir işaretçi
olarak göremez.

<!-- Konuşma notu: Demodaki Java simülasyonu, gerçek bellek adresleri yerine dizi indisleri kullanarak tam olarak bunun çevresinden dolanıyor. -->

---

<!-- _class: bolum -->

# 10. Atlamalı Listeler

<!-- Konuşma notu: Bölüm 10, bir bağlı listenin ikili aramanın O(log n)'ini hiç alıp alamayacağını soruyor, ve bir fazladan fikirle "evet" diyor. -->

---

# Bir soru ile başlayalım

Sıralı bir dizi ikili arama alır, O(log n).
Sıralı bir bağlı liste ortaya sıçrayamaz.
Yine de O(log n) arama mümkün mü?

<!-- Konuşma notu: Engel şu ki bir listenin hiç indisi yok, yani "ortaya sıçra" henüz anlamlı bir işlem bile değil. -->

---

# Kısa bir tarihçe

- **1990** — William Pugh, Maryland Üniversitesi
- Dengeli arama ağaçlarına rastgele bir alternatif
- Her anahtar rastgele bir "yazı-tura" yüksekliği alır
- Doğru uygulamak, dengeli bir ağaçtan çok daha kolay

<!-- Konuşma notu: Pugh'un kendi savı tam olarak buydu: dengeli bir ağacın beklenen performansı, doğru yazması çok daha az kod ile. -->

---

# Sezgi — bir ara yol ve bir hızlı şerit

- Seviye 0: tam sıralı liste — her anahtar
- Seviye 1: bir **hızlı şerit** — yalnızca bazı anahtarlar
- Hızlı şeritte başlayın; fazla ileri gidince **aşağı inin**
- Her anahtarı teker teker kontrol etmekten daha az durak

<!-- Konuşma notu: Daha fazla hızlı şerit, daha fazla seviye, durak sayısını daha da küçültüyor — bu demo görünür kalması için yalnızca iki seviye kullanıyor. -->

---

# Arama: sağa git, ya da aşağı in

- Şu anki seviyede, `cur->forward[i]->value < hedef` mi?
- Evet: bu seviyede kalarak sağa adım at
- Hayır: bir seviye **aşağı in** ve yeniden dene
- Seviye 0'a ulaşıp bir kez daha adım atmak: yanıt

<!-- Konuşma notu: Her arama en yüksek seviyede başlar ve aşağı doğru ilerler, bir kez indikten sonra asla yukarı çıkmaz. -->

---

# Atlamalı liste araması, adım adım

<iframe class="dsanim" src="anim/skip-list.html?yer=slayt&lang=tr" title="Atlamalı liste: arama"></iframe>

<!-- Konuşma notu: Aramanın hızlı şeritte başlayıp, yalnızca fazla ileri gidince seviye 0'a indiğine, sonra bir son adım attığına bakın. -->

---

# Uç durum — hızlı şeritte yalnızca bir düğüm

<iframe class="dsanim" src="anim/skip-list.html?yer=slayt&lang=tr&example=one-express-node" title="Atlamalı liste: tek hızlı düğüm"></iframe>

<!-- Konuşma notu: Hızlı şeritte neredeyse hiçbir şey yokken, aramanın büyük kısmı yine de seviye 0'da geçmek zorunda kalıyor. -->

---

# Kod — `sl_search()`

```c
int sl_search(SkipList *sl, int value, int *cmp) {
    Node *cur = sl->header;
    for (int i = MAX_LEVEL-1; i >= 0; i--) {
        while (cur->forward[i] &&
               cur->forward[i]->value < value) {
            cur = cur->forward[i];   /* go right */
            (*cmp)++;
        }
        /* … else: drop down one level … */
    }
    cur = cur->forward[0];
    return cur && cur->value == value;
}
```

<!-- Konuşma notu: Dıştaki for döngüsü seviyeleri en yüksekten aşağı sayar; içteki while döngüsü cur'u yalnızca sağa hareket ettiren tek yer. -->

---

# Karmaşıklık ve sık yapılan hatalar

- Yeterli hızlı seviye: **O(log n)** beklenen arama
- Her anahtar yalnızca seviye 0'da: **O(n)**'ye düşer
- Hata: bir seviye aşağı inmek yerine durmak
- Bu demonun seviyeleri sabit, gerçekten canlı atılmış değil

<!-- Konuşma notu: Gerçek bir uygulama her anahtarın seviyesi için ekleme anında yazı tura atar — bu demo her çalıştırma tekrarlanabilir olsun diye seviyeleri önceden sabitliyor. -->

---

# Mini soru

Bir atlamalı listedeki her anahtar yalnızca
seviye 1'i alsaydı (hiç hızlı şerit olmasaydı),
arama Big-O olarak ne tutar?

<!-- Konuşma notu: Sınıfın bunu yalnızca seviye 0'ın gerçekte ne olduğuyla bağlantılandırmasına izin verin. -->

---

# Yanıt

**O(n).** Hiç hızlı şerit yokken, seviye 0
kalan tek seviyedir — arama düz bir bağlı
listeyle aynı doğrusal taramaya düşer.

<!-- Konuşma notu: Üzerinde durmaya değer: bir atlamalı listenin hızı hiçbir zaman garanti değil, yalnızca beklenen — en kötü durumu tam olarak düz bir liste. -->

---

<!-- _class: bolum -->

# 11. Diziler ve Bağlı Listeler

<!-- Konuşma notu: Bölüm 11, bugünün her şeyini tek bir tabloda yan yana koyuyor, ödünleşimi açıkça göstermek için. -->

---

# Diziler ve bağlı listeler

| İşlem | Dizi | Bağlı liste |
| --- | --- | --- |
| İndise erişim | O(1) | O(n) |
| Baştan ekleme/silme | O(n) | O(1) |
| Değere göre arama | O(n) | O(n) |

<!-- Konuşma notu: Yalnızca iki satır gerçekten farklı — indise erişim ve baştan ekleme — ve zıt yönlerde farklılar. -->

---

# Hangisini ne zaman seçmeli

- Sürekli `arr[k]` mi gerekiyor? Diziler açık ara kazanır
- Sık baştan ekleme, bilinmeyen son boyut? Listeler kazanır
- Önbellek dostu, bitişik taramalar? Diziler kazanır
- Eklerken var olan veriyi hiç kaydırmamak? Listeler kazanır

<!-- Konuşma notu: Burada evrensel olarak "daha iyi" bir yapı yok — doğru seçim, tamamen programın en çok hangi işlemi yaptığına bağlı. -->

---

# Mini soru

Yalnızca bir uçtan büyüyüp küçülen bir yığın
(stack) kuruyorsunuz. Dizi mi, liste mi?

<!-- Konuşma notu: Sınıfın bir yığının gerçekte tek bir işleme ihtiyaç duyduğunu düşünmesine izin verin. -->

---

# Yanıt

**İkisi de iyi çalışır** — ikisi de bir
uçta O(1) verir: bir dinamik dizinin
`append`'i, ya da bir listenin `insert_head`'i.
Asıl belirleyici, ayrıca `arr[k]`'ye ihtiyaç
duyup duymadığınız.

<!-- Konuşma notu: Gelecek haftanın yığınları ve kuyrukları bu seçimi somutlaştıracak, ikisi üzerine de gerçek uygulamalarla. -->

---

# Özet — diziler ve matrisler

| Fikir | Anahtar olgu |
| --- | --- |
| Dizide ekleme/silme | Kaydırma; en kötü O(n), sonda O(1) |
| Dinamik dizi | İkiye katlama; O(1) **amortize** ekleme |
| Satır öncelikli yerleşim | `i*COLS+j`; gezinmeyi yerleşime eşle |
| Seyrek matris | Triplet'ler; hızlı devrik O(nnz+COLS) |

<!-- Konuşma notu: Dört fikir, ve her biri gerçekte aynı soruyla ilgili: veri değiştiğinde ne hareket etmek zorunda, ve ne kadar. -->

---

# Özet — bağlı listeler

| Fikir | Anahtar olgu |
| --- | --- |
| Tekil liste | insert_head O(1); insert_after: sıra önemli |
| Çift yönlü / dairesel | İki bağ; `tail->next` baştır |
| Josephus | Dairesel liste, eleme başına bir bypass |
| XOR / atlamalı liste | Tek-alan numarası; rastgele O(log n) |

<!-- Konuşma notu: Bu beş liste türünün her biri, altında hâlâ yalnızca düğümler ve işaretçiler — hiçbiri yeni bir bellek türü gerektirmedi. -->

---

# Büyük resim

Diziler, esnek eklemeyi O(1) indisleme
karşılığında feda eder; bağlı listeler,
indislemeyi zaten bulunduğunuz her yerde
O(1) ekleme karşılığında feda eder. Bu
haftaki her yapı, aynı ödünleşimin bir tarafını seçiyor.

<!-- Konuşma notu: Bir öğrenci bugünden yalnızca bir cümle hatırlayacaksa, hatırlamaya değer olan bu. -->

---

# Kendi kendine kontrol turu

Dört kısa soru. Yanıt bir sonraki slaytta
görünmeden önce düşünün. Tam alıştırmalar
hafta notunda.

<!-- Konuşma notu: Bunlar yazılı notun sonundaki kendi kendine kontrol sınavını, burada daha kısa bir set olarak yansıtıyor. -->

---

# 1. 20 elemanlı bir dizide 0. indise eklemek: kaç eleman hareket eder?

<!-- Konuşma notu: Sorun, bekleyin, sonra ilerleyin. -->

---

# Tam 20'si — dizinin tamamı bir hücre sağa kayar.

<!-- Konuşma notu: Günün ilk mini sorusundaki aynı en kötü durum, yalnızca daha büyük bir dizide. -->

---

# 2. Büyümesi O(n)'e mal oluyorsa, bir dinamik dizinin eklemesi neden hâlâ O(1) deniyor?

<!-- Konuşma notu: Bölüm 1'deki amortize maliyet argümanını hatırlayın. -->

---

# O(n) büyüme nadirdir, ve bedeli **amortize olur**: n ekleme üzerinden ortalandığında toplam 2n'nin altında kalır.

<!-- Konuşma notu: Amortize etmek, birçok işlem üzerinden bir ortalama — hiçbir zaman tek bir işlem hakkında bir söz değil. -->

---

# 3. `insert_after`'da `n->next = prev->next`, neden `prev->next = n`'den önce olmalı?

<!-- Konuşma notu: Bölüm 6'daki sıra-takası uç durumunu hatırlayın. -->

---

# Ters çevrilirse, 1. adım onu okuduğunda `prev->next` zaten `n`'e eşittir — yeni düğüm kendini gösterir hale gelir.

<!-- Konuşma notu: Böyle bir kendine döngü, prev'i o zamana kadar izleyen her şeyi sessizce koparır. -->

---

# 4. Bir atlamalı listenin arama maliyeti, hızlı şerit olmadığında neden O(n)'e düşer?

<!-- Konuşma notu: Bölüm 10'un son mini sorusunu hatırlayın. -->

---

# Üst seviye yokken, seviye 0 kalan tek seviyedir — arama düz bir bağlı listeyle aynı, bir seferde bir anahtarlık yürüyüşe dönüşür.

<!-- Konuşma notu: Bir atlamalı listenin hızı her zaman seviye 0'ın üstünde gerçekten kaç hızlı seviye olduğuna bağlıdır. -->

---

<!-- _class: baslik -->

# Gelecek hafta

**Hafta 3 — Yığınlar ve Kuyruklar**

LIFO ve FIFO, bu haftanın dizi ve bağlı
liste araçları üzerine doğrudan kurulacak —
aynı düğümler, aynı kaydıran dizi, artık
tek bir giriş/çıkış noktasına disiplinlenmiş.

<!-- Konuşma notu: Gelecek haftaki her yığın ve kuyruk, bugünün iki yapısından tam olarak birinin üzerine kuruluyor, işlemler yalnızca tek bir uca kısıtlanmış halde. -->

---

# Kaynaklar (1/2)

- Ders izlencesi, Hafta 2: `docs/syllabus/syllabus.tr.md`
- Cormen, Leiserson, Rivest, Stein. *Introduction to
  Algorithms*, 4. baskı. MIT Press
- Sedgewick, Wayne. *Algorithms*, 4. baskı. Addison-Wesley
- Knuth. *The Art of Computer Programming, Cilt 1*, 3. baskı.

<!-- Konuşma notu: Bunlar, haftanın yazılı notunun sonunda listelenen aynı kaynaklar. -->

---

# Kaynaklar (2/2)

- Pugh (1990) — atlamalı listeler
- McCarthy (1956) — Lisp cons hücreleri
- Flavius Josephus, *The Jewish War* — eleme problemi
- williamfiset/Algorithms · Programiz DSA

<!-- Konuşma notu: Tarihsel kaynaklar — Pugh, McCarthy, Josephus — bugünkü "kısa tarihçe" slaytlarının dayandığı kaynaklar. -->
