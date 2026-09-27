---
template: main.html
---

# Hafta 2 — Bağlı Listeler, Diziler, Matrisler

*CEN207 Veri Yapıları (eski adıyla CE205) · Güz 2026–2027*

!!! abstract "Bu Hafta"
    **Öğrenim Çıktıları.** Bu haftanın sonunda temel doğrusal (linear) veri yapılarını açıklayabilecek, tasarlayabilecek ve kodlayabileceksiniz: **Diziler (Arrays)**, **Matrisler** ve **Bağlı Listeler (Linked Lists)**. Dizilerin ardışık belleğe nasıl yerleştirildiğini ve çok boyutlu dizilerin (2D, 3D matrisler) 1 boyutlu bellek alanına eşlenmesi için gereken matematiksel formülleri öğreneceksiniz. Ayrıca **Seyrek Matrisler (Sparse Matrices)** hakkında bilgi sahibi olacak ve bunları nasıl verimli bir şekilde depolayacağınızı göreceksiniz. Son olarak, belleğin ardışık olma zorunluluğundan kurtularak **Bağlı Listelerde (Tek Yönlü, Çift Yönlü ve Dairesel)** uzmanlaşacak, düğümleri dinamik olarak nasıl tahsis edeceğinizi ve $O(1)$ veya $O(n)$ sürede veri eklemek, silmek veya dolaşmak için işaretçileri nasıl yöneteceğinizi öğreneceksiniz. Bu çıktılar, ders müfredatının **LO.1** (temel veri yapılarını açıklama), **LO.2** (algoritmik karmaşıklığı analiz etme) ve **LO.7** (problem için doğru yapıyı seçme) hedefleriyle eşleşmektedir.

    **Ön Koşullar.** 1. Hafta size Big-O notasyonunun, bellek mimarisinin ve özellikle **işaretçilerin (pointers)** temelini verdi. İşaretçi değerlerini okuma (dereferencing) ve bellek adreslerini anlama konusunda rahat olmalısınız, zira bağlı listeler tamamen bu kavramlar üzerine inşa edilmiştir.

<!-- materials:start -->

<div class="materials" markdown>

[:material-file-pdf-box: Ders Notları (PDF)](cen207-week-2-notes.tr.pdf){ .md-button download="cen207-week-2-notes.tr.pdf" }
[:material-file-word-box: Ders Notları (DOCX)](cen207-week-2-notes.tr.docx){ .md-button download="cen207-week-2-notes.tr.docx" }
[:material-presentation: Slaytlar (PDF)](cen207-week-2-slides.tr.pdf){ .md-button download="cen207-week-2-slides.tr.pdf" }
[:material-microsoft-powerpoint: Slaytlar (PPTX)](cen207-week-2-slides.tr.pptx){ .md-button download="cen207-week-2-slides.tr.pptx" }
[:material-language-html5: Slaytlar (HTML, çevrimdışı)](cen207-week-2-slides.tr.html){ .md-button download="cen207-week-2-slides.tr.html" }
[:material-folder-zip: Tümünü İndir (ZIP)](cen207-week-2-materials.tr.zip){ .md-button download="cen207-week-2-materials.tr.zip" }
[:material-fullscreen: Slaytları Tam Ekran Aç](cen207-week-2-slides.tr.html){ .md-button .md-button--primary target=_blank }

</div>

<div class="deck-frame">
<iframe src="../cen207-week-2-slides.tr.html" title="Hafta 2 — Bağlı Listeler, Diziler, Matrisler" loading="lazy" allowfullscreen></iframe>
</div>

<p class="deck-hint">Slaytların içine tıklayın ve ok tuşlarını kullanın; tam ekran için slaytın sağ altındaki düğmeyi veya yukarıdaki "Tam Ekran Aç" bağlantısını kullanın.</p>

<!-- materials:end -->

## 1. Diziler ve Bellek Düzeni (Arrays and Memory Layout)

Bir **dizi (array)**, en temel veri yapısıdır. Elemanların **ardışık bellek konumlarında (contiguous memory locations)** saklandığı bir koleksiyondur. Temel fikir, aynı tipten birden fazla öğeyi bir arada tutarak, taban değere (ilk elemanın bellek adresi) bir ofset (kaydırma) eklemek suretiyle herhangi bir elemanın konumunu kolayca hesaplayabilmektir.

### 1.1. 1 Boyutlu Dizilerde Adres Hesaplama
`T` tipinde bir `A[N]` diziniz varsa, `A[i]`'nin adresi şudur:
$$ \text{Adres}(A[i]) = \text{Taban\_Adresi} + (i \times \text{Boyut}(T)) $$
Bellek adresi hesaplaması sadece bir çarpma ve bir toplama işlemi gerektirdiğinden, dizideki herhangi bir elemana erişmek **$O(1)$ zaman** alır.

### 1.2. Çok Boyutlu Diziler (Matrisler)
Donanım belleği kesinlikle tek boyutludur (lineer bir bayt dizisi). Bu nedenle, `M[R][C]` (R satır, C sütun) gibi 2 boyutlu bir matris, 1 boyutlu belleğe düzleştirilmelidir (flattening). Bunu yapmanın iki yolu vardır:

- **Satır Öncelikli Düzen (Row-Major Order - C/C++, Python):** Önce ilk satırın tamamını, ardından ikinci satırı ve bu şekilde devam ederek saklar.
  $$ \text{Adres}(M[i][j]) = \text{Taban\_Adresi} + (i \times C + j) \times \text{Boyut}(T) $$
- **Sütun Öncelikli Düzen (Column-Major Order - Fortran, MATLAB):** Önce ilk sütunun tamamını, ardından ikinci sütunu vs. saklar.
  $$ \text{Adres}(M[i][j]) = \text{Taban\_Adresi} + (j \times R + i) \times \text{Boyut}(T) $$

### 1.3. Seyrek Matrisler (Sparse Matrices)
**Seyrek matris**, elemanlarının çoğu sıfır olan bir matristir. Tüm o sıfırları geleneksel bir 2B dizide saklamak muazzam bir bellek israfına yol açar.
Bunun yerine, her kaydın `(Satır, Sütun, Değer)` içerdiği yapı (struct) dizileri veya bağlı listeler gibi koordinat formatları kullanarak sadece sıfır olmayan (non-zero) elemanları saklarız.

## 2. Bağlı Listeler (Linked Lists)

Diziler rastgele erişim (random access) için inanılmaz derecede hızlı olsa da, ciddi kısıtlamaları vardır:
1. Boyutları oluşturulma anında sabittir (statik bellek tahsisi).
2. Ortaya bir eleman eklemek veya silmek, sonraki tüm elemanların kaydırılmasını gerektirir ve bu **$O(n)$ zaman** alır.

**Bağlı Liste (Linked List)**, ardışık bellek gereksinimini ortadan kaldırarak bu sorunu çözer. Elemanlar (**düğümler/nodes**) belleğe dağıtılmıştır. Her düğüm kendi verisini ve dizideki bir sonraki düğümü gösteren bir **işaretçi (pointer)** barındırır.

### 2.1. Tek Yönlü Bağlı Liste (Singly Linked List)
Tek Yönlü Bağlı Listede, her düğüm sadece bir sonraki düğümü işaret eder. Gezinme kesinlikle tek yönlüdür (ileriye doğru).

```c
typedef struct Node {
    int data;
    struct Node* next;
} Node;
```

**İşlemler ve Zaman Karmaşıklığı:**
- **Başa (Head) Ekleme:** $O(1)$. Sadece yeni düğümü mevcut başa yönlendirin ve baş (head) işaretçisini güncelleyin.
- **Sona (Tail) Ekleme:** Kuyruk işaretçisi (tail pointer) tutmuyorsak $O(n)$, tutuyorsak $O(1)$.
- **Silme:** $O(n)$ çünkü bir düğümü silmek için, ondan hemen önceki düğümü bulmak üzere listeyi dolaşmamız gerekir.
- **Arama/Erişim:** $O(n)$. Baştan itibaren düğüm düğüm dolaşmalıyız. `liste[5]` gibi rastgele erişim mümkün değildir.

### 2.2. Çift Yönlü Bağlı Liste (Doubly Linked List)
Çift Yönlü Bağlı Liste, her düğüme önceki düğümü gösteren bir `prev` (önceki) işaretçisi ekler. Bu, her iki yönde de gezinmeyi sağlar.

```c
typedef struct DNode {
    int data;
    struct DNode* prev;
    struct DNode* next;
} DNode;
```

**Artıları:** Elimizde silinecek düğüme ait bir işaretçi zaten varsa, belirli bir düğümün silinmesi $O(1)$ olur, çünkü önceki düğümü bulmak için listeyi dolaşmamıza gerek kalmaz (sadece `dugum->prev` kullanırız).
**Eksileri:** Her düğüm `prev` işaretçisi için fazladan bellek gerektirir ve ekleme/silme işlemleri daha fazla işaretçi güncellemeyi gerektirir.

### 2.3. Dairesel Bağlı Liste (Circular Linked List)
Dairesel Bağlı Listede, son düğümün `next` işaretçisi ilk düğümü (head) göstererek bir döngü oluşturur. Tek veya çift yönlü olabilir. İşletim sisteminde işlemci (CPU) zamanlayıcısının (scheduler) işlemlere Round-Robin (sırayla döngüsel) yöntemiyle zaman dilimi (time slice) vermesi gibi, bir liste üzerinde tekrar tekrar gezinmesi gereken uygulamalar için son derece kullanışlıdır.

## Değerlendirme Testi

??? success "1. 1 Boyutlu bir dizideki $i$. elemana erişmenin zaman karmaşıklığı nedir?"
    $O(1)$. Dizinin boyutu ne olursa olsun basit bir aritmetik işlem gerektirir.

??? success "2. Devasa bir dizinin başına eleman eklemek, bağlı listeye göre neden verimsizdir?"
    Çünkü bir dizide, yer açmak için mevcut tüm elemanların bir pozisyon sağa kaydırılması gerekir, bu da $O(n)$ zaman alır. Bağlı listede ise sadece head işaretçisini güncelleyerek $O(1)$ sürede yapılır.

??? success "3. Eğer `M[5][10]` (5 satır, 10 sütun) boyutlarında 2 boyutlu bir dizi Satır-Öncelikli (Row-Major) düzende saklanıyorsa, `M[2][4]`'ün 1 boyutlu (1D) indeksi nedir?"
    İndeks = `(Satır * ToplamSütun) + Sütun` = `(2 * 10) + 4` = `24`.

??? success "4. Çift Yönlü Bağlı Listenin, Tek Yönlü Bağlı Listeye göre ana avantajı nedir?"
    Listeyi geriye doğru dolaşmaya izin verir ve eğer bir düğüme ait işaretçi (pointer) halihazırda biliniyorsa (önceki düğüme doğrudan erişimimiz olduğu için) o düğümün $O(1)$ sürede silinmesini sağlar.

## Gelecek Hafta

Gelecek hafta **Yığın (Stack)** ve **Kuyruk (Queue)** yapılarını tanıtacağız. Bunlar, elemanların nasıl ekleneceği veya çıkarılacağı konusunda katı kurallar uygulayan (LIFO ve FIFO) soyut veri tipleridir (ADT). İlginç bir şekilde, hem Yığınların hem de Kuyrukların, bu hafta öğrendiğiniz **Diziler** veya **Bağlı Listeler** kullanılarak nasıl kodlanabileceğini göreceksiniz!
