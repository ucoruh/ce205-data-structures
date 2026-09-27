---
template: main.html
---

# Hafta 5 — Çizgeler ve Dolaşmalar

*CEN207 Veri Yapıları (eski adıyla CE205) · Güz 2026–2027*

!!! abstract "Bu Hafta"
    **Öğrenim Çıktıları.** Bu haftanın sonunda, doğrusal olmayan (diziler, listeler, yığınlar, kuyruklar) ve salt ağaç yapısında olmayan karmaşık ilişkileri modellememizi sağlayan **çizge (graph)** veri yapısını açıklayabilecek, çizebilecek ve kodlayabileceksiniz. Bir çizge, *herhangi* bir düğümün *herhangi* sayıda düğüme bağlanmasına izin verildiğinde ortaya çıkan yapıdır: yol ağları, sosyal ağlar, internet ağları ve aslında geçen hafta öğrendiğiniz ağaç yapısının bizzat kendisi (ağaç, döngüsü olmayan özel bir çizgedir). Gerçek dünyada en çok kullanılan iki gösterimle (**komşuluk matrisi** ve **komşuluk listesi**) ve en azından aşina olmanız gereken diğer iki gösterimle (**kenar listesi** ve **bağlantı matrisi**) tanışacak, aralarındaki farkları ve avantaj/dezavantajları öğreneceksiniz. Sonrasında 1.-4. haftalarda öğrendiğiniz yapıları kullanarak dört temel dolaşma (traversal) algoritması göreceksiniz: **Genişlik Öncelikli Arama (BFS)**, **Derinlik Öncelikli Arama (DFS)**, **Bağlı Bileşenler (Connected Components)** ve **En Kısa Yol (Shortest Path)**.

    **Ön Koşullar.** 1. Hafta bellek ve işaretçiler (pointers). 2. Hafta bağlı listeler (linked lists). 3. Hafta yığın (stack), kuyruk (queue) ve özyineleme (recursion). 4. Hafta ağaçlar (trees). Ağaç dolaşmalarının aslında çizgelerdeki dolaşmalarla aynı temele dayandığını göreceksiniz.

<!-- materials:start -->

<div class="materials" markdown>

[:material-file-pdf-box: Ders Notları (PDF)](cen207-week-5-notes.tr.pdf){ .md-button download="cen207-week-5-notes.tr.pdf" }
[:material-file-word-box: Ders Notları (DOCX)](cen207-week-5-notes.tr.docx){ .md-button download="cen207-week-5-notes.tr.docx" }
[:material-presentation: Slaytlar (PDF)](cen207-week-5-slides.tr.pdf){ .md-button download="cen207-week-5-slides.tr.pdf" }
[:material-microsoft-powerpoint: Slaytlar (PPTX)](cen207-week-5-slides.tr.pptx){ .md-button download="cen207-week-5-slides.tr.pptx" }
[:material-language-html5: Slaytlar (HTML, çevrimdışı)](cen207-week-5-slides.tr.html){ .md-button download="cen207-week-5-slides.tr.html" }
[:material-folder-zip: Tümünü İndir (ZIP)](cen207-week-5-materials.tr.zip){ .md-button download="cen207-week-5-materials.tr.zip" }
[:material-fullscreen: Slaytları Tam Ekran Aç](cen207-week-5-slides.tr.html){ .md-button .md-button--primary target=_blank }

</div>

<div class="deck-frame">
<iframe src="../cen207-week-5-slides.tr.html" title="Hafta 5 — Çizgeler ve Dolaşmalar" loading="lazy" allowfullscreen></iframe>
</div>

<p class="deck-hint">Slaytların içine tıklayın ve ok tuşlarını kullanın; tam ekran için slaytın sağ altındaki düğmeyi veya yukarıdaki "Tam Ekran Aç" bağlantısını kullanın.</p>

<!-- materials:end -->

## 1. Çizge (Graph) Terminolojisi

Çizgeler matematiğin (Graf Teorisi) bir dalıdır, ancak bilgisayar bilimleri için veri yapılarının şahikasıdır. 
En genel tanımıyla bir çizge $G = (V, E)$ şeklinde ifade edilir:
- $V$ bir kümedir, elemanlarına **Düğüm (Vertex)** denir.
- $E$ bir kümedir, elemanlarına **Kenar (Edge)** denir. Her kenar iki düğümü birleştirir.

### 1.1. Yönlü ve Yönsüz Çizgeler

- **Yönsüz Çizge (Undirected Graph):** Kenarların yönü yoktur. $A$'dan $B$'ye bir kenar varsa, $B$'den $A$'ya da gidilebilir demektir. (Örn: Çift yönlü yollar, Facebook arkadaşlıkları).
- **Yönlü Çizge (Directed Graph / Digraph):** Kenarların bir yönü vardır. $A$'dan $B$'ye bir kenar varsa (ok ile gösterilir), bu sadece $A$'dan $B$'ye gidilebileceğini ifade eder. (Örn: Tek yönlü sokaklar, Twitter takipçileri).

### 1.2. Kenar Ağırlıkları (Weights)

Kenarlar genellikle bir maliyet, mesafe veya kapasite ifade eden **ağırlıklara** sahip olabilir.
- **Ağırlıksız Çizge (Unweighted Graph):** Her kenarın maliyeti eşittir (genellikle 1).
- **Ağırlıklı Çizge (Weighted Graph):** Her kenarın kendine ait bir maliyeti vardır (örn: iki şehir arasındaki mesafe).

### 1.3. Diğer Önemli Kavramlar

- **Derece (Degree):** Bir düğüme bağlı olan kenar sayısıdır. Yönlü çizgelerde ikiye ayrılır:
  - **Giriş Derecesi (In-degree):** Düğüme giren kenar sayısı.
  - **Çıkış Derecesi (Out-degree):** Düğümden çıkan kenar sayısı.
- **Yol (Path):** Bir düğümden başlayarak kenarları takip edip başka bir düğüme ulaşan düğümler dizisidir.
- **Döngü (Cycle):** Bir yoldaki başlangıç ve bitiş düğümünün aynı olması durumudur.
- **Basit Çizge (Simple Graph):** Kendi kendine dönen kenarların (self-loop) ve iki düğüm arasında birden fazla aynı kenarın (parallel edges) olmadığı çizgelerdir.

## 2. Çizge Gösterimleri (Graph Representations)

Bilgisayar ortamında bir çizgeyi saklamanın üç temel yöntemi vardır:

### 2.1. Komşuluk Matrisi (Adjacency Matrix)

**Komşuluk Matrisi**, $V \times V$ boyutlarında iki boyutlu bir dizidir (matris). $V$, düğüm sayısını temsil eder.
Eğer $i$ düğümünden $j$ düğümüne bir kenar varsa, `matris[i][j] = 1` olur. Yönsüz çizgelerde bu matris simetriktir. Ağırlıklı çizgelerde `1` yerine kenarın ağırlığı yazılır.

**Avantajları:**
- İki düğüm arasında kenar olup olmadığını $O(1)$ sürede kontrol edebiliriz.
- Kenar ekleme/silme işlemi $O(1)$ sürer.

**Dezavantajları:**
- Bellek tüketimi $O(V^2)$'dir. Çok az kenara sahip (seyrek) çizgelerde inanılmaz bir bellek israfına yol açar.
- Bir düğümün tüm komşularını bulmak, o düğüm sadece 1 komşuya sahip olsa bile $O(V)$ zaman alır.

### 2.2. Komşuluk Listesi (Adjacency List)

**Komşuluk Listesi**, çizgeleri bir dizi ve ona bağlı "bağlı listeler" (linked lists) olarak saklar. Dizinin boyutu $V$'dir. Dizinin $i$. elemanı, $i$ düğümüne komşu olan diğer düğümlerin bir bağlı listesini içerir.

**Avantajları:**
- Seyrek çizgeler (sparse graphs) için çok verimlidir. Bellek tüketimi $O(V + E)$'dir.
- Bir düğümün tüm komşularını bulmak çok hızlıdır (sadece sahip olduğu komşu sayısı kadar sürer).

**Dezavantajları:**
- $i$ ile $j$ arasında bir kenar olup olmadığını kontrol etmek $O(\text{derece}(i))$ zaman alır çünkü bağlı listeyi dolaşmak gerekir.

### 2.3. Bağlantı Matrisi (Incidence Matrix)

$V \times E$ boyutlarında bir matristir. $V$ düğüm sayısını, $E$ kenar sayısını temsil eder. Algoritmik kodlamalarda nadiren kullanılır ancak elektriksel devre analizleri ve özel graf teorisi işlemlerinde yeri vardır.

## 3. Çizge Dolaşmaları (Graph Traversals)

Bir çizgenin tüm düğümlerini ve kenarlarını belirli bir kurala göre ziyaret etme işlemine **dolaşma (traversal)** denir. Ağaçlardan farklı olarak, çizgelerde döngüler (cycles) olabileceği için sonsuz döngüye girmemek adına her zaman bir `visited` (ziyaret edildi) dizisi tutmamız gerekir.

### 3.1. Genişlik Öncelikli Arama (Breadth-First Search - BFS)

BFS, dolaşmaya merkezden (başlangıç düğümü) başlar ve dalga dalga etrafa yayılır. Önce 1 adım uzaklıktaki tüm komşulara, sonra 2 adım uzaklıktakilere gider.

**Kullanılan Veri Yapısı:** Kuyruk (Queue).

**Zaman Karmaşıklığı:** $O(V + E)$ (Komşuluk listesi kullanıldığında).

**Kullanım Alanları:**
- Ağırlıksız çizgelerde **En Kısa Yol (Shortest Path)** bulmak.
- Sosyal ağlarda arkadaşlık derecelerini hesaplamak.

### 3.2. Derinlik Öncelikli Arama (Depth-First Search - DFS)

DFS, gidebileceği en derin noktaya kadar gitmeyi hedefler. Gidecek yer kalmadığında ise geriye doğru (backtrack) döner.

**Kullanılan Veri Yapısı:** Yığın (Stack) veya Özyineleme (Recursion - Çağrı Yığını).

**Zaman Karmaşıklığı:** $O(V + E)$ (Komşuluk listesi kullanıldığında).

**Kullanım Alanları:**
- Labirent çözme.
- Çizgenin birbirine bağlı parçalardan (Connected Components) oluşup oluşmadığını bulma.
- Topolojik sıralama (Topological Sort).

### 3.3. İleri Dolaşma Türleri

- **Derinlik Sınırlı Arama (Depth-Limited Search):** DFS'in belli bir derinliğe kadar inip duran versiyonudur.
- **İteratif Derinleşen DFS (IDDFS):** BFS'in bellek verimliliği ile DFS'in hızını birleştiren bir yöntemdir.
- **Tek Tip Maliyetli Arama (Uniform Cost Search - UCS):** Dijkstra algoritması olarak da bilinir. Ağırlıklı çizgelerde en düşük maliyetli yolu bulmak için Öncelikli Kuyruk (Priority Queue) kullanır.

## 4. En Kısa Yol ve Durum Uzayı Araması (State Space Search)

### 4.1. Su Sürahisi Problemi (Water Jug Problem)

Pek çok klasik bulmaca, bir çizge problemi olarak modellenebilir.
**Durum (Vertex):** Oyundaki her farklı hamle sonrası oluşan tablo.
**Geçiş (Edge):** Bir durumdan diğer duruma geçerli bir hamle yapma.

**Problem:** Elinizde biri $A$ litre, diğeri $B$ litre su alan ölçüsüz iki sürahi var. Hedefiniz tam olarak $C$ litre su elde etmek.

Bu problemi çözmek için durumu $(x, y)$ koordinatları ile modelleriz. Yapılabilecek hamleler (sürahi doldurmak, boşaltmak, birinden diğerine aktarmak) kenarları oluşturur. Bu oluşturduğumuz varsayımsal çizge üzerinde **BFS** çalıştırarak, hedefe ulaşan en az adımlı (en kısa) yolu bulabiliriz!

## Değerlendirme Testi

??? success "1. Bir komşuluk matrisinde iki düğüm arasında kenar olup olmadığını kontrol etmenin zaman karmaşıklığı nedir?"
    O(1). Sadece `matris[u][v]` değerine bakmamız yeterlidir.

??? success "2. Hangi çizge dolaşma algoritması Kuyruk (Queue) kullanır?"
    Genişlik Öncelikli Arama (BFS).

??? success "3. Çizgeleri dolaşırken neden bir `visited` (ziyaret edildi) dizisine ihtiyacımız var?"
    Çünkü çizgelerde döngüler (cycles) olabilir. Ziyaret edilen düğümleri işaretlemezsek sonsuz döngüye girebiliriz.

??? success "4. $V$ düğümlü ve $E$ kenarlı bir çizgenin Komşuluk Listesi için alan karmaşıklığı (space complexity) nedir?"
    O(V + E).

??? success "5. Ağırlıksız bir çizgede en kısa yolu bulmak için en iyi arama stratejisi hangisidir?"
    Genişlik Öncelikli Arama (BFS).

## Gelecek Hafta

Gelecek hafta **Arama ve Hashing (Search and Hashing)** konularına odaklanarak, verileri devasa yapılar üzerinde dolaşmadan çok hızlı ($O(1)$) bir şekilde nasıl depolayıp geri getireceğimizi öğreneceğiz. Modern programlama dillerindeki sözlüklerin (dictionaries) ve kümelerin (sets) temelini atan hash fonksiyonlarını ve çakışma çözme stratejilerini (chaining, open addressing) inceleyeceğiz.
