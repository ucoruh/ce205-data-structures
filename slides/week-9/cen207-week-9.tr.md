---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Hafta 9 — Çizge Algoritmaları"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Hafta 9"
footer: "RTEÜ Bilgisayar Mühendisliği · Güz 2026–2027"
---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Hafta 9
## Çizge Algoritmaları

Sıralama · Ağırlıklar · Döngüler · Geri İzleme

<!-- Konuşma notu: Ara sınav haftasından sonra tekrar hoş geldiniz. Bu hafta, Hafta 5'teki her çizge aracını sıra, ağırlık ve döngü farkındalığıyla genişletiyor ve geri izleme ile kapanıyor. -->

---

# Bugünün haritası

- Sıralama: topolojik sıralama (2 yöntem), döngü tespiti
- Grupları takip et: union-find (ayrık küme)
- En ucuz bağlantılar: Kruskal, Prim (MST)
- En ucuz yollar: Dijkstra, Bellman-Ford, Floyd-Warshall
- Erişilebilirlik: güçlü bağlı bileşenler, iki parçalılık
- Yolların ötesi: en büyük akış, geri izleme

<!-- Konuşma notu: On bir algoritma, on bölüm — bazı bölümler aynı problemi iki farklı yöntemle çözen algoritma çiftleri içeriyor. -->

---

# Başlamadan önce: bildikleriniz

- Hafta 5: komşuluk listesi, alfabetik komşular
- BFS: kuyruk, en az kenar sayısı
- DFS: özyineleme veya açık yığın
- Bağlı bileşenler: her ziyaret edilmemiş köşeden BFS/DFS

<!-- Konuşma notu: Bu haftaki her algoritma, BFS veya DFS'i bir veya iki ek dizi ile genişletiyor. Burada hiçbir şey Hafta 5'in yerini almıyor — doğrudan onun üzerine inşa ediyor. -->

---

# Tek yeni bileşen: ağırlıklar

- Bugünün algoritmalarından 6'sı her kenara bir **sayı** iliştirir
- Bir mesafe, bir maliyet, bir kapasite
- Soru "ulaşılabilir mi?"den **"en ucuzu hangisi?"**ye değişir

<!-- Konuşma notu: Kruskal, Prim, Dijkstra, Bellman-Ford, Floyd-Warshall, Edmonds-Karp hepsi ağırlık gerektirir. Diğer beşi ağırlıksız kalır. -->

---

# Bu hafta Hafta 5'ten ne kullanıyor

| Hafta 5 aracı | Kullanan |
| --- | --- |
| Komşuluk listesi, alfabetik sıra | Bu haftaki her algoritma |
| BFS kuyruğu | İki parçalılık kontrolü, en büyük akışın genişletme yolu |
| DFS özyinelemesi | Topolojik sıralama, döngü tespiti, GBB, geri izleme |
| Çember yerleşimi | Her animasyonun çizge çizimi |

<!-- Konuşma notu: Çizge gösteriminde hiçbir şey değişmiyor -- sadece üzerinde ne hesapladığımız değişiyor. -->

---

<!-- _class: bolum -->
# 1. Topolojik Sıralama

---

# Başlangıç sorusu

Çoraplar ayakkabılardan önce. Gömlek ceketten önce.
Çorap ile gömlek arasında bir sıra yok.

**Her kuralı gözeten tek bir sıra her zaman var mıdır?**

<!-- Konuşma notu: Bu tam olarak build-system / paket yöneticisi bağımlılık problemi. -->

---

# Kısa tarihçe

- **A. B. Kahn**, 1962 — içe-derece (in-degree) + kuyruk
- Build sistemleri, paket kurulumcuları bunu her gün kullanır
- DFS tabanlı alternatif, **Tarjan**'ın 1970'lerdeki DFS çerçevesinden çıkar

<!-- Konuşma notu: Kahn'ın makalesinin adı tam olarak "Topological sorting of large networks". -->

---

# Kahn'ın fikri

- **İçe-derecesi 0** olan bir köşenin karşılanmamış ön koşulu yoktur
- Onu şimdi yerleştir; bu, giden kenarlarını kaldırır
- Her komşunun içe-derecesi bir azalır
- Yeni sıfırlanan komşular uygun hale gelir — onları kuyruğa al

<!-- Konuşma notu: Kuyruk, o anda yerleştirilmeye uygun olan her köşeyi aynı anda tutar. -->

---

# Kahn'ın kodu (C) — bölüm 1/2

```c
int topo_sort_kahn(Graph *g) {
    for (int i=0;i<g->vertex_count;i++) indeg[i]=0;
    for (int u=0;u<g->vertex_count;u++)
        for (AdjNode *n=g->adj[u]; n; n=n->next)
            indeg[n->to]++;
    front=rear=0; order_len=0;
    for (int v=0;v<g->vertex_count;v++)
        if (indeg[v]==0) enqueue(v);
```

<!-- Konuşma notu: Önce içe-dereceleri say, sonra içe-derecesi zaten 0 olan her köşeyi kuyruğa ekle. -->

---

# Kahn'ın kodu (C) — bölüm 2/2

```c
    while (front<rear) {
        int u=dequeue();
        order[order_len++]=u;
        for (AdjNode *n=g->adj[u]; n; n=n->next) {
            indeg[n->to]--;
            if (indeg[n->to]==0) enqueue(n->to);
        }
    }
    return order_len==g->vertex_count;
}
```

<!-- Konuşma notu: Kuyruktan çıkan her köşenin komşularını gevşet, yeni içe-derecesi 0 olanları kuyruğa ekle. -->

---

# Kahn'ın kodu (Java) — bölüm 1/2

```java
static boolean topoSortKahn(Graph g) {
    for (int i=0;i<g.vertexCount;i++) indeg[i]=0;
    for (int u=0;u<g.vertexCount;u++)
        for (AdjNode n=g.adj[u]; n!=null; n=n.next)
            indeg[n.to]++;
    front=rear=0; orderLen=0;
    for (int v=0;v<g.vertexCount;v++)
        if (indeg[v]==0) enqueue(v);
```

<!-- Konuşma notu: Şimdiye kadar C sürümüyle aynı şekil. -->

---

# Kahn'ın kodu (Java) — bölüm 2/2

```java
    while (front<rear) {
        int u=dequeue();
        order[orderLen]=u; orderLen++;
        for (AdjNode n=g.adj[u]; n!=null; n=n.next) {
            indeg[n.to]--;
            if (indeg[n.to]==0) enqueue(n.to);
        }
    }
    return orderLen==g.vertexCount;
}
```

<!-- Konuşma notu: C sürümüyle satır satır aynı şekil -- kod panelindeki satır numaralarının her iki dilde de anlamlı kalmasının sebebi bu. -->

---

# Kahn'ın algoritması

<iframe class="dsanim" src="anim/topological-sort-kahn.html?yer=slayt&lang=tr" title="Topolojik sıralama: Kahn algoritması"></iframe>

<!-- Konuşma notu: Kuyruğun ve order satırının birlikte dolmasını izleyin. Sonra döngü uç durumunu deneyin. -->

---

# Uç durum: bir döngü

<iframe class="dsanim" src="anim/topological-sort-kahn.html?yer=slayt&lang=tr&example=cycle" title="Topolojik sıralama: bir döngü sırayı engeller"></iframe>

<!-- Konuşma notu: Kuyruk erken boşalıyor — geriye kalan köşeler birbirleriyle bir döngü içinde kilitli. -->

---

# Gerçek çıktı: Kahn'ın algoritması

```text
-- normal: 8 vertices, 10 edges, a valid DAG --
order: A B C D F E G H
all 8 vertices placed: a valid topological order

-- edge: 10 edges but a cycle exists, no full order --
order:
only 0 of 7 vertices placed -- a cycle exists
```

<!-- Konuşma notu: Derlenmiş C programından alınan gerçek çıktı, Java programının çıktısıyla bayt bayt özdeş. -->

---

# DFS fikri

- Özyinelemeli DFS çalıştır (Hafta 5'in DFS'i, bir dizi eklenmiş)
- Her köşenin **bitiş zamanını** kaydet
- Bitiş zamanlarını **büyükten küçüğe** oku
- Bir köşe, işaret ettiği her şeyden sonra biter

<!-- Konuşma notu: Hâlâ açık (gri) bir köşeye giden bir geri kenar, bedavaya yakalanan bir döngü demektir. -->

---

# DFS topolojik sıralama kodu (C) — dfs_visit

```c
void dfs_visit(int u) {
    color_of[u]=1;
    for (AdjNode *n=cur_g->adj[u]; n; n=n->next) {
        if (color_of[n->to]==0) dfs_visit(n->to);
        else if (color_of[n->to]==1) has_cycle=1;
    }
    color_of[u]=2;
    finish[finish_len++]=u;
}
```

<!-- Konuşma notu: finish[] dizisi aşağıdan yukarıya dolar; çağıran, topolojik sıra için onu sondan başa okur. -->

---

# DFS topolojik sıralama kodu (C) — sürücü

```c
void topo_sort_dfs(Graph *g) {
    cur_g=g;
    for (int i=0;i<g->vertex_count;i++) color_of[i]=0;
    finish_len=0; has_cycle=0;
    for (int v=0;v<g->vertex_count;v++)
        if (color_of[v]==0) dfs_visit(v);
}
```

<!-- Konuşma notu: Ziyaret edilmemiş her köşe için bir dfs_visit çağrısı -- bağlı olmayan bir DAG'ı kapsayan budur. -->

---

# DFS topolojik sıralama kodu (Java) — dfsVisit

```java
static void dfsVisit(int u) {
    colorOf[u]=1;
    for (AdjNode n=curG.adj[u]; n!=null; n=n.next) {
        if (colorOf[n.to]==0) dfsVisit(n.to);
        else if (colorOf[n.to]==1) hasCycle=true;
    }
    colorOf[u]=2;
    finish[finishLen]=u; finishLen++;
}
```

<!-- Konuşma notu: hasCycle, bir geri kenar görüldüğü anda ayarlanır, ama döngü her köşeyi bitirmek için devam eder. -->

---

# DFS topolojik sıralama kodu (Java) — sürücü

```java
static void topoSortDfs(Graph g) {
    curG=g;
    for (int i=0;i<g.vertexCount;i++) colorOf[i]=0;
    finishLen=0; hasCycle=false;
    for (int v=0;v<g.vertexCount;v++)
        if (colorOf[v]==0) dfsVisit(v);
}
```

<!-- Konuşma notu: C sürücüsüyle satır satır aynı şekil. -->

---

# DFS topolojik sıralama

<iframe class="dsanim" src="anim/topological-sort-dfs.html?yer=slayt&lang=tr" title="Topolojik sıralama: DFS bitiş sırası"></iframe>

<!-- Konuşma notu: Kahn'ınkiyle aynı çizge — iki geçerli sırayı karşılaştırın. -->

---

# Karmaşıklık ve tuzak

- **O(V + E)** — her iki algoritma da, tek geçiş
- Tuzak: bir topolojik sıra **tek değildir**
- **Konumları** karşılaştırın, kesin diziyi asla sabit kodlamayın

<!-- Konuşma notu: Aynı DAG üzerindeki iki doğru algoritma kesin sırada uyuşmayabilir (ve genelde uyuşmaz). -->

---

# Kısa soru

Kahn'ın algoritması neden tek bir özyinelemeli çağrı değil de bir **kuyruk** kullanır?

*(cevap bir sonraki slaytta)*

<!-- Konuşma notu: Dinleyicilere 20 saniye verin. -->

---

# Cevap

Bir DAG'ın aynı anda **birden fazla bağımsız kaynağı** olabilir.

Kuyruk, algoritmanın bir dalı bitirmeden diğerine başlamak yerine, tek geçişte onları iç içe geçirmesini sağlar.

<!-- Konuşma notu: Birden fazla geçerli sıranın genelde var olmasının sebebi de bu. -->

---

<!-- _class: bolum -->
# 2. Döngü Tespiti (Yönlü)

---

# Başlangıç sorusu

Bölüm 1'in DFS'i bir döngünün var **olduğunu** tespit eder (bir geri kenar).

**Hangi köşeler**, hangi sırayla onu oluşturuyor?

<!-- Konuşma notu: Kahn'ın algoritması bunu hiç cevaplayamaz -- sadece "bazı köşeler hiç 0'a ulaşmadı" der. -->

---

# Yollu 3 renkli DFS

- Beyaz / **gri** (yol üzerinde) / siyah (bitmiş)
- Güncel yolu `on_path[]` içinde tut
- **Gri** bir köşeye giden bir geri kenar: o köşe açık bir atadır
- Oradan buraya kadarki yol dilimi döngünün **kendisidir**

<!-- Konuşma notu: Döngüyü doğrudan yol dizisinden okuyabiliriz. -->

---

# Döngü tespiti kodu (C) — bölüm 1/2

```c
int dfs_cycle(int u) {
    color_of[u]=1;
    on_path[path_top++]=u;
    for (AdjNode *n=cur_g->adj[u]; n; n=n->next) {
        if (color_of[n->to]==0) {
            if (dfs_cycle(n->to)) return 1;
        } else if (color_of[n->to]==1) {
```

<!-- Konuşma notu: Beyaz bir komşu özyinelemeye girer; gri bir komşu bir atadır -- döngü-bulundu dalı bir sonraki slaytta devam ediyor. -->

---

# Döngü tespiti kodu (C) — bölüm 2/2

```c
            int i=path_top-1;
            while (on_path[i]!=n->to) i--;
            cycle_len=0;
            for (; i<path_top; i++)
                cycle[cycle_len++]=on_path[i];
            return 1;
        }
    }
    path_top--; color_of[u]=2;
    return 0;
}
```

<!-- Konuşma notu: Çıkarma döngüsü, yolun tepesinden gri ataya doğru geriye yürür. -->

---

# Döngü tespiti kodu (Java) — bölüm 1/2

```java
static boolean dfsCycle(int u) {
    colorOf[u]=1;
    onPath[pathTop]=u; pathTop++;
    for (AdjNode n=curG.adj[u]; n!=null; n=n.next) {
        if (colorOf[n.to]==0) {
            if (dfsCycle(n.to)) return true;
        } else if (colorOf[n.to]==1) {
```

<!-- Konuşma notu: Şimdiye kadar C sürümüyle aynı şekil. -->

---

# Döngü tespiti kodu (Java) — bölüm 2/2

```java
            int i=pathTop-1;
            while (onPath[i]!=n.to) i--;
            cycleLen=0;
            for (; i<pathTop; i++) {
                cycle[cycleLen]=onPath[i]; cycleLen++;
            }
            return true;
        }
    }
    pathTop--; colorOf[u]=2;
    return false;
}
```

<!-- Konuşma notu: onPath[] bir yığın olarak kullanılan sade bir dizidir -- girişte push, çıkışta pop. -->

---

# Yönlü çizgede döngü tespiti

<iframe class="dsanim" src="anim/cycle-detection-directed.html?yer=slayt&lang=tr" title="Yönlü çizgede döngü tespiti"></iframe>

<!-- Konuşma notu: Döngü köşelerinin kırmızıya dönüp çizgenin altında kutulanmasını izleyin. -->

---

# Uç durum: hiç döngü yok

<iframe class="dsanim" src="anim/cycle-detection-directed.html?yer=slayt&lang=tr&example=acyclic" title="Döngü tespiti: döngüsüz bir çizge"></iframe>

<!-- Konuşma notu: Her köşe siyaha döner, hiçbir geri kenar bulunmaz. -->

---

# Gerçek çıktı: döngü tespiti

```text
-- normal: 8 vertices, 10 edges, one cycle: C-D-F-C --
cycle found: D F C -> D

-- edge: 10 edges, entirely cycle-free (a DAG) --
no cycle found

-- edge: the smallest cycle, A-B-A (2 edges) --
cycle found: A B -> A
```

<!-- Konuşma notu: 2 köşeli bir döngü, mümkün olan en küçük yönlü döngüdür -- tek bir kenar asla döngü olamaz. -->

---

# Karmaşıklık ve tuzak

- **O(V + E)** — bir DFS, artı bulunan döngüyü çıkarmak için O(V)
- Tuzak: "**gri**" yerine "beyaz değil" kontrolü yapmak
- Siyah bir komşu bitmiştir ve güvenlidir — döngü değildir

<!-- Konuşma notu: Bu, Bölüm 1'in ileri/çapraz kenar tuzağıyla aynı. -->

---

# Kısa soru

Bölüm 1'in DFS topolojik sıralaması sadece `has_cycle = 1` yapıyor. Bu algoritma neden ekstra bir `on_path[]` yığınına ihtiyaç duyuyor?

*(cevap bir sonraki slaytta)*

---

# Cevap

Bir döngünün var olduğunu bilmek, onu **hangi köşelerin** oluşturduğunu bilmekle aynı değildir.

`on_path[]`, güncel kök-buraya zincirini erişilebilir tutar; böylece bir geri kenar bulunduğu anda döngü doğrudan ondan okunabilir.

<!-- Konuşma notu: Bu ödünleşim -- biraz daha fazla kayıt tutmaya karşılık çok daha fazla bilgi -- hafta boyunca tekrar eder. -->

---

<!-- _class: bolum -->
# 3. Union-Find (Ayrık Küme)

---

# Başlangıç sorusu

Kruskal'ın algoritması (birazdan geliyor) tekrar tekrar şunu sormalı:

**"Bu iki köşe, seçtiğim kenarlarla zaten bağlı mı?"**

Her seferinde taze bir BFS doğru olur — ama yavaş olur.

<!-- Konuşma notu: "Aynı grup mu?" sorguları için özel olarak inşa edilmiş bir yapıya ihtiyacımız var. -->

---

# Ebeveyn işaretçilerinden bir orman

- `find(v)`, ebeveyn işaretçilerinde **köke** kadar yürür
- Aynı kök = aynı grup
- `union(a, b)`, iki grubu birleştirir: kök köke işaret eder

<!-- Konuşma notu: Her grup küçük bir ağaçtır; kök, grubun kimliğinin ta kendisidir. -->

---

# İki hile

- **Ranka göre birleştirme**: kısa ağaç, uzun olanın altına asılır
- **Yol sıkıştırma**: `find`, ziyaret ettiği her köşeyi doğrudan köke yeniden bağlar
- Birlikte: işlem başına **O(α(n))** — pratikteki her `n` için bu O(1)'dir

<!-- Konuşma notu: α, ters Ackermann fonksiyonudur — inşa edilebilecek her n için 5'in altındadır. -->

---

# Union-find kodu (C) — find

```c
int find(int v) {
    int root=v;
    while (parent_of[root]!=root) root=parent_of[root];
    while (parent_of[v]!=root) {
        int next=parent_of[v];
        parent_of[v]=root;
        v=next;
    }
    return root;
}
```

<!-- Konuşma notu: İkinci while döngüsü yol sıkıştırma adımıdır -- ziyaret edilen her köşeyi doğrudan köke yeniden bağlar. -->

---

# Union-find kodu (C) — union_sets

```c
void union_sets(int a, int b) {
    int ra=find(a), rb=find(b);
    if (ra==rb) return;
    if (rank_of[ra]<rank_of[rb]) parent_of[ra]=rb;
    else if (rank_of[ra]>rank_of[rb]) parent_of[rb]=ra;
    else { parent_of[rb]=ra; rank_of[ra]++; }
}
```

<!-- Konuşma notu: Ham a/b argümanlarıyla değil, KÖK ile birleştirmek burada asla çiğnenmemesi gereken tek kuraldır. -->

---

# Union-find kodu (Java) — find

```java
static int find(int v) {
    int root=v;
    while (parentOf[root]!=root) root=parentOf[root];
    while (parentOf[v]!=root) {
        int next=parentOf[v];
        parentOf[v]=root;
        v=next;
    }
    return root;
}
```

<!-- Konuşma notu: C sürümüyle özdeş şekil -- union-find diller arasında neredeyse satır satır çevrilir. -->

---

# Union-find kodu (Java) — unionSets

```java
static void unionSets(int a, int b) {
    int ra=find(a), rb=find(b);
    if (ra==rb) return;
    if (rankOf[ra]<rankOf[rb]) parentOf[ra]=rb;
    else if (rankOf[ra]>rankOf[rb]) parentOf[rb]=ra;
    else { parentOf[rb]=ra; rankOf[ra]++; }
}
```

<!-- Konuşma notu: C sürümüyle aynı rank-karşılaştırma merdiveni. -->

---

# Gerçek çıktı: union-find

```text
union(A, B): merged, new root = A
union(C, D): merged, new root = C
union(A, C): merged, new root = A
find(D) = A
union(B, H): already the same set (A)
final sets: A->A B->A C->A D->A E->A F->A G->A H->A
```

<!-- Konuşma notu: "already the same set" bir hata değildir -- zaten birleşmiş bir çift üzerinde union() her zaman güvenlidir, bir no-op'tur. -->

---

# Union-find: rank + yol sıkıştırma

<iframe class="dsanim" src="anim/union-find.html?yer=slayt&lang=tr" title="Union-find: ranka göre birleştirme + yol sıkıştırma"></iframe>

<!-- Konuşma notu: Gerçek bir derinlik-2 zincirin tek bir find() çağrısında derinlik 1'e düzleşmesini izleyin. -->

---

# Karmaşıklık ve tuzak

- Her iki hile ile birlikte işlem başına **~O(1) amortize**
- Tuzak: `union(a, b)`'nin `a`, `b`'yi doğrudan karşılaştırması
- **Kökler** birleştirilmeli — `find(a)`, `find(b)` — asla ham argümanlar değil

<!-- Konuşma notu: Ham argümanları birleştirmek, iki ebeveynli bir düğüm yaratabilir. -->

---

# Kısa soru

Rank, bir kümedeki eleman sayısını değil, **yüksekliği** sayar. Neden doğrudan küme boyutu takip edilmiyor?

*(cevap bir sonraki slaytta)*

---

# Cevap

Boyut da işe yarar ve yaygın bir alternatiftir — "boyuta göre birleştirme" küçük **kümeyi** büyüğün altına asar.

İkisi de aynı O(α(n)) garantisini verir; rank, ağaç yüksekliğini doğrudan sınırladığı için klasik sunumdur — `find`'ın gerçekten bedelini ödediği şey de budur.

<!-- Konuşma notu: Bazı ders kitapları yalnızca "boyuta göre birleştirme" kullanır -- ikisi de doğrudur, bu ders yükseklik argümanı için rankı seçiyor. -->

---

<!-- _class: bolum -->
# 4. En Küçük Yayılan Ağaçlar

---

# Başlangıç sorusu

`n` kasabayı elektrik hatlarıyla bağlayın. Herhangi bir çift doğrudan bir maliyetle bağlanabilir.

**Her şeyi hâlâ bağlayan en ucuz hat kümesi nedir?**

<!-- Konuşma notu: Her çiftin doğrudan bir hatta ihtiyacı yok -- sadece herkesin herkesten erişilebilir olması yeterli. -->

---

# Kısa tarihçe

- **Joseph Kruskal**, 1956
- **Robert Prim**, 1957 (Jarník'i, 1930, yeniden keşfederek)
- Aynı problem, yapısal olarak farklı iki açgözlü çözüm
- İkisi de kanıtlanabilir şekilde güvenli: **kesme özelliği** (cut property)

<!-- Konuşma notu: Köşelerin herhangi bir bölümlenmesini kesen en ucuz kenar, mutlaka bir MST'ye aittir. -->

---

# Kruskal'ın fikri

- **Tüm** kenarları ağırlığa göre sırala, bir kez
- En ucuzdan başlayarak tara; bir **döngü kapatmadıkça** kenarı ekle
- Döngü kontrolü: union-find, neredeyse O(1)
- Bağlı olmayan çizge → bir yayılan **orman**

<!-- Konuşma notu: Kruskal ağacın "nerede" olduğunu umursamaz -- sadece döngülerden global olarak kaçınır. -->

---

# Prim'in fikri

- Bir başlangıç köşesinden **tek** bir ağaç büyüt
- **İçeriden** **dışarıya** en ucuz kenarı ekle
- `key[v]` = v'yi ağaca şimdiye kadar bağlayan en ucuz kenar
- Farklı bir bileşene hiç ulaşmaz: key "sonsuz" kalır

<!-- Konuşma notu: Bu, Dijkstra için yeniden kullanacağımız "satır olarak öncelik kuyruğu" fikrinin aynısı. -->

---

# Kruskal'ın kodu (C) — bölüm 1/2

```c
int kruskal_mst(Edge *sorted, int edge_count,
                 Edge *mst_out, int *total_out) {
    for (int v=0;v<vertex_count;v++)
        { parent_of[v]=v; rank_of[v]=0; }
    qsort(sorted, edge_count, sizeof(Edge), cmp_weight);
    int mst_len=0, total=0;
```

<!-- Konuşma notu: Taze bir union-find, ardından ağırlığa göre tek bir global sıralama -- bir slayt önce anlatıldığı gibi. -->

---

# Kruskal'ın kodu (C) — bölüm 2/2

```c
    for (int i=0;i<edge_count;i++) {
        if (find(sorted[i].a)==find(sorted[i].b))
            continue;
        union_sets(sorted[i].a, sorted[i].b);
        mst_out[mst_len++]=sorted[i];
        total+=sorted[i].w;
    }
    *total_out=total;
    return mst_len;
}
```

<!-- Konuşma notu: find ve union_sets tam olarak Bölüm 3'ün union-find'ı, değişmeden. -->

---

# Kruskal'ın kodu (Java) — bölüm 1/2

```java
static int kruskalMst(Edge[] sorted,
                       Edge[] mstOut, int[] totalOut) {
    for (int v=0;v<vertexCount;v++)
        { parentOf[v]=v; rankOf[v]=0; }
    Arrays.sort(sorted, Comparator.comparingInt(
        (Edge e) -> e.w).thenComparingInt(e -> e.idx));
    int mstLen=0, total=0;
```

<!-- Konuşma notu: Java'nın Comparator zinciri, C'nin qsort + karşılaştırma fonksiyonunun yerini alır -- aynı eşitlik bozma kuralı, farklı sözdizimi. -->

---

# Kruskal'ın kodu (Java) — bölüm 2/2

```java
    for (Edge e : sorted) {
        if (find(e.a)==find(e.b)) continue;
        unionSets(e.a, e.b);
        mstOut[mstLen]=e; mstLen++;
        total+=e.w;
    }
    totalOut[0]=total;
    return mstLen;
}
```

<!-- Konuşma notu: C sürümünün ikinci yarısıyla aynı döngü şekli. -->

---

# Kruskal'ın MST'si

<iframe class="dsanim" src="anim/kruskal-mst.html?yer=slayt&lang=tr" title="Kruskal en küçük yayılan ağaç"></iframe>

<!-- Konuşma notu: Sıralı kenarlar satırının ve parent[] satırının birlikte büyümesini izleyin. -->

---

# Uç durum: yayılan bir orman

<iframe class="dsanim" src="anim/kruskal-mst.html?yer=slayt&lang=tr&example=disconnected" title="Kruskal: bağlı olmayan bir çizge"></iframe>

<!-- Konuşma notu: İki bileşen girer, iki ağaç çıkar — hata yok, sadece bir orman. -->

---

# Gerçek çıktı: Kruskal'ın MST'si

```text
-- normal: 7 vertices, 10 edges, one component --
MST edges: B-C:1 A-C:2 D-E:2 E-F:3 B-D:5 E-G:7
total weight = 20
components = 1

-- edge: 10 edges, 2 components -- a spanning FOREST --
MST edges: C-D:1 A-B:2 F-G:2 D-E:3 H-I:3 B-C:4 I-J:4 G-H:6
total weight = 25
components = 2 (a spanning forest)
```

<!-- Konuşma notu: İki bileşen girer, iki ayrı ağaç çıkar, tek bir kenar listesinde toplanır. -->

---

# Prim'in kodu (C) — bölüm 1/2

```c
int prim_mst(Graph *g, int start,
             Edge *mst_out, int *total_out) {
    for (int v=0;v<g->vertex_count;v++)
        { key_of[v]=INF; in_mst[v]=0; parent_of[v]=-1; }
    key_of[start]=0;
    int mst_len=0, total=0;
    for (int count=0;count<g->vertex_count;count++) {
        int u=min_key_vertex(g->vertex_count);
        if (u==-1 || key_of[u]==INF) break;
        in_mst[u]=1;
```

<!-- Konuşma notu: key_of[], animasyonda çizgenin altında gösterilen öncelik kuyruğu satırının ta kendisidir. -->

---

# Prim'in kodu (C) — bölüm 2/2

```c
        if (parent_of[u]!=-1) {
            mst_out[mst_len].a=parent_of[u];
            mst_out[mst_len].b=u;
            mst_out[mst_len].w=key_of[u];
            mst_len++; total+=key_of[u];
        }
        for (AdjNode *n=g->adj[u]; n; n=n->next)
            if (!in_mst[n->to] && n->weight<key_of[n->to])
                { key_of[n->to]=n->weight;
                  parent_of[n->to]=u; }
    }
    *total_out=total;
    return mst_len;
}
```

<!-- Konuşma notu: u'yu ağaca getiren kenarı kaydet, ardından u'nun komşularını gevşet. -->

---

# Prim'in kodu (Java) — bölüm 1/2

```java
static int primMst(Graph g, int start,
                    Edge[] mstOut, int[] totalOut) {
    for (int v=0;v<g.vertexCount;v++)
        { keyOf[v]=INF; inMst[v]=false; parentOf[v]=-1; }
    keyOf[start]=0;
    int mstLen=0, total=0;
    for (int count=0;count<g.vertexCount;count++) {
        int u=minKeyVertex(g.vertexCount);
        if (u==-1 || keyOf[u]==INF) break;
        inMst[u]=true;
```

<!-- Konuşma notu: Şimdiye kadar C sürümüyle aynı şekil. -->

---

# Prim'in kodu (Java) — bölüm 2/2

```java
        if (parentOf[u]!=-1) {
            mstOut[mstLen]=new Edge();
            mstOut[mstLen].a=parentOf[u];
            mstOut[mstLen].b=u;
            mstOut[mstLen].w=keyOf[u];
            mstLen++; total+=keyOf[u];
        }
        for (AdjNode n=g.adj[u]; n!=null; n=n.next)
            if (!inMst[n.to] && n.weight<keyOf[n.to])
                { keyOf[n.to]=n.weight; parentOf[n.to]=u; }
    }
    totalOut[0]=total;
    return mstLen;
}
```

<!-- Konuşma notu: Java her MST kenarı için yeni bir Edge nesnesi ayırır; C önceden ayrılmış bir dizi hücresini doldurur -- tek gerçek fark bu. -->

---

# Prim'in MST'si

<iframe class="dsanim" src="anim/prim-mst.html?yer=slayt&lang=tr" title="Prim en küçük yayılan ağaç"></iframe>

<!-- Konuşma notu: Kruskal'ınkiyle aynı "normal" çizge — iki MST'yi karşılaştırın: aynı toplam ağırlık. -->

---

# Gerçek çıktı: Prim'in MST'si

```text
-- normal: 7 vertices, 10 edges, starts at A --
MST edges: A-C:2 C-B:1 B-D:5 D-E:2 E-F:3 E-G:7
total weight = 20

-- edge: 2 components, starts at A -- F..J never reached --
MST edges: A-B:2 B-C:4 C-D:1 D-E:3
total weight = 10
unreached: F G H I J
```

<!-- Konuşma notu: total weight = 20, aynı normal çizge üzerinde Kruskal'ınkiyle eşleşiyor -- canlı gösterilecek güzel bir çapraz kontrol. -->

---

# Karmaşıklık tablosu

| Algoritma | Süre | Not |
| --- | --- | --- |
| Kruskal | O(E log E) | sıralama baskın |
| Prim (dizi) | O(V^2) | Dijkstra'nın şekliyle eşleşir |
| Prim (yığın) | O(E log V) | yoğun çizgelerde daha iyi |

<!-- Konuşma notu: Öncelik kuyruğunun görünür, basit bir satır olması için dizi sürümünü kullanıyoruz. -->

---

# Kısa soru

Prim, aynı çizgede Kruskal'dan **daha pahalı** bir kenar seçebilir mi?

*(cevap: hayır — bir sonraki slayta bakın)*

---

# Cevap

**Hayır.** İkisi de kanıtlanabilir şekilde en iyisidir (kesme özelliği).

Bir çizgenin her MST'si aynı **toplam** ağırlığa sahiptir — ağırlıklar eşitlendiğinde sadece *hangi* kenarları seçtikleri farklılaşabilir.

<!-- Konuşma notu: Toplam ağırlık değişmezdir; belirli kenar kümesi eşitliklerde değişmez değildir. -->

---

<!-- _class: bolum -->
# 5. Tek Kaynaktan En Kısa Yollar

---

# Başlangıç sorusu

Mesafeye göre ağırlıklandırılmış bir yol ağı. Bir şehirden başlayarak,

**her diğer şehre en ucuz ulaşım nasıl olur?**

<!-- Konuşma notu: "En az kenar" değil (Hafta 5'in BFS'i) — en ucuz toplam ağırlık. -->

---

# Kısa tarihçe

- **Edsger Dijkstra**, 1956 (1959'da yayımlandı)
- Yeni bir bilgisayarı tanıtmak için 20 dakikalık bir alıştırma
- Her ağırlık **negatif olmadığında** hâlâ standart cevap

<!-- Konuşma notu: Dijkstra daha sonra bunu Amsterdam'da bir terasta, kağıt kalem olmadan tasarladığını söylemişti. -->

---

# Dijkstra'nın fikri

- `dist[v]` = şimdiye kadar bulunan en ucuz **toplam yol**
- Henüz bitmemiş, `dist` değeri en küçük köşeyi seç
- Seçildiğinde: **kesin**, bir daha asla küçülemez
- Bu sadece hiçbir kenar ağırlığı negatif olmadığı için doğru

<!-- Konuşma notu: Prim'in algoritması, tek bir değişiklikle: "içeri giren en ucuz kenar", "şimdiye kadarki en ucuz yol" olur. -->

---

# Negatif ağırlıklar neden bozar

Erken "kesin" olarak çıkarılan bir köşe, daha sonra çok negatif bir kenardan geçen bir yolla yenilebilir — bu, köşe zaten kesinleştikten **sonra** keşfedilir.

<!-- Konuşma notu: Programımızda Dijkstra'nın negatif girdiyi reddetmesinin tam sebebi bu. -->

---

# Dijkstra'nın kodu (C) — bölüm 1/2

```c
void dijkstra(Graph *g, int start) {
    for (int v=0;v<g->vertex_count;v++)
        { dist_of[v]=INF; done[v]=0; parent_of[v]=-1; }
    dist_of[start]=0;
    for (int count=0;count<g->vertex_count;count++) {
        int u=min_dist_vertex(g->vertex_count);
        if (u==-1 || dist_of[u]==INF) break;
        done[u]=1;
```

<!-- Konuşma notu: min_dist_vertex, animasyonda bir satır olarak gösterilen "öncelik kuyruğu" adımıdır. -->

---

# Dijkstra'nın kodu (C) — bölüm 2/2

```c
        for (AdjNode *n=g->adj[u]; n; n=n->next) {
            int cand=dist_of[u]+n->weight;
            if (!done[n->to] && cand<dist_of[n->to])
                { dist_of[n->to]=cand; parent_of[n->to]=u; }
        }
    }
}
```

<!-- Konuşma notu: Az önce kesinleşen u köşesinin henüz bitmemiş her komşusunu gevşet. -->

---

# Dijkstra'nın kodu (Java) — bölüm 1/2

```java
static void dijkstra(Graph g, int start) {
    for (int v=0;v<g.vertexCount;v++)
        { distOf[v]=INF; done[v]=false; parentOf[v]=-1; }
    distOf[start]=0;
    for (int count=0;count<g.vertexCount;count++) {
        int u=minDistVertex(g.vertexCount);
        if (u==-1 || distOf[u]==INF) break;
        done[u]=true;
```

<!-- Konuşma notu: Şimdiye kadar C sürümüyle aynı şekil. -->

---

# Dijkstra'nın kodu (Java) — bölüm 2/2

```java
        for (AdjNode n=g.adj[u]; n!=null; n=n.next) {
            int cand=distOf[u]+n.weight;
            if (!done[n.to] && cand<distOf[n.to])
                { distOf[n.to]=cand; parentOf[n.to]=u; }
        }
    }
}
```

<!-- Konuşma notu: minDistVertex küçük bir doğrusal tarama -- Java ve C sürümleri fiilen özdeş. -->

---

# Dijkstra en kısa yol

<iframe class="dsanim" src="anim/dijkstra.html?yer=slayt&lang=tr" title="Dijkstra en kısa yol"></iframe>

<!-- Konuşma notu: Öncelik kuyruğu satırı, bir yığın değil, sade sıralı bir dizidir. -->

---

# Gerçek çıktı: Dijkstra

```text
-- normal: 8 vertices, 10 edges, starts at A --
distances: A=0 B=3 C=2 D=8 E=10 F=13 G=17

-- edge: F..J never reachable via the directed edges --
distances: A=0 B=2 C=5 D=6 E=9 F=inf G=inf H=inf I=inf J=inf
```

<!-- Konuşma notu: "inf", bir köşeye hiç ulaşılamadığında tam olarak basılır -- programın kendi sentineli, bir çökme değil. -->

---

# Bellman-Ford: negatif ağırlıklar sorun değil

- **Bellman** ve **Ford**, 1950'lerin sonu
- "En küçüğü çıkar" fikrinden tamamen vazgeç
- **Her** kenarı, sabit sırayla, `V - 1` tura kadar gevşet
- Hâlâ iyileştiren bir `V`. tur = bir **negatif döngü**

<!-- Konuşma notu: V-1 tur, mümkün olan en uzun en kısa yolun yayılması için tam olarak yeterlidir. -->

---

# Bellman-Ford'un kodu (C) — bölüm 1/2

```c
int bellman_ford(Graph *g, int start) {
    for (int v=0;v<g->vertex_count;v++)
        { dist_of[v]=INF; parent_of[v]=-1; }
    dist_of[start]=0;
    for (int p=1;p<=g->vertex_count-1;p++) {
        int changed=0;
        for (int u=0;u<g->vertex_count;u++) {
            if (dist_of[u]==INF) continue;
```

<!-- Konuşma notu: V-1 tura kadar, henüz hiç ulaşılmamış her köşeyi atlayarak. -->

---

# Bellman-Ford'un kodu (C) — bölüm 2/2

```c
            for (AdjNode *n=g->adj[u]; n; n=n->next) {
                int cand=dist_of[u]+n->weight;
                if (cand<dist_of[n->to])
                    { dist_of[n->to]=cand;
                      parent_of[n->to]=u; changed=1; }
            }
        }
        if (!changed) break;
    }
    /* one more pass detects a negative cycle */
}
```

<!-- Konuşma notu: Erken çıkış "if (!changed) break", yaygın ve doğru bir optimizasyondur. -->

---

# Bellman-Ford'un kodu (Java) — bölüm 1/2

```java
static boolean bellmanFord(Graph g, int start) {
    for (int v=0;v<g.vertexCount;v++)
        { distOf[v]=INF; parentOf[v]=-1; }
    distOf[start]=0;
    for (int pass=1;pass<=g.vertexCount-1;pass++) {
        boolean changed=false;
        for (int u=0;u<g.vertexCount;u++) {
            if (distOf[u]==INF) continue;
```

<!-- Konuşma notu: Şimdiye kadar C sürümüyle aynı şekil. -->

---

# Bellman-Ford'un kodu (Java) — bölüm 2/2

```java
            for (AdjNode n=g.adj[u]; n!=null; n=n.next) {
                int cand=distOf[u]+n.weight;
                if (cand<distOf[n.to])
                    { distOf[n.to]=cand;
                      parentOf[n.to]=u; changed=true; }
            }
        }
        if (!changed) break;
    }
    /* one more pass detects a negative cycle */
}
```

<!-- Konuşma notu: boolean, C'nin int bayrağının yerini alır -- bunun dışında satır satır özdeş. -->

---

# Bellman-Ford en kısa yol

<iframe class="dsanim" src="anim/bellman-ford.html?yer=slayt&lang=tr" title="Bellman-Ford en kısa yol"></iframe>

<!-- Konuşma notu: Tur sayacını ve sondaki tespit turunu izleyin. -->

---

# Zorunlu uç durum: negatif döngü

<iframe class="dsanim" src="anim/bellman-ford.html?yer=slayt&lang=tr&example=negative-cycle" title="Bellman-Ford: bir negatif döngü"></iframe>

<!-- Konuşma notu: A-B-C-A toplamı -1. Tespit turu hâlâ gevşetilebilir bir kenar buluyor. -->

---

# Gerçek çıktı: Bellman-Ford

```text
-- normal: 7 vertices, all positive, starts at A --
distances: A=0 B=3 C=2 D=8 E=10 F=13 G=17
no negative cycle

-- edge: A-B-C-A is a negative cycle (total -1) --
distances: A=-4 B=-2 C=0 D=0 E=1
negative cycle detected
```

<!-- Konuşma notu: Dijkstra'nınkiyle aynı başlangıç çizge şekli -- iki "distances:" satırını yan yana karşılaştırın. -->

---

# Karmaşıklık tablosu

| Algoritma | Süre | Negatifleri kaldırır mı? |
| --- | --- | --- |
| Dijkstra | O(V^2) | Hayır |
| Bellman-Ford | O(V*E) | Evet |

<!-- Konuşma notu: Bellman-Ford'un negatifleri tolere etmenin bedeli, çok daha yavaş bir en kötü durum. -->

---

# Kısa soru

Bellman-Ford için neden tam olarak `V - 1` tur, `V` veya `V/2` değil?

*(cevap bir sonraki slaytta)*

---

# Cevap

Bir en kısa yol (negatif döngü yoksa) bir köşeyi asla tekrarlamaz — en fazla `V - 1` kenar.

Her tur, her yolun "kesinleşmiş" önekini bir kenar uzatır. `V - 1` tur, mümkün olan en uzun en kısa yolu kesinleştirir.

<!-- Konuşma notu: Bir köşeyi tekrarlamak, negatif olmayan ekstra ağırlıkla döngüye girmek demektir — asla bir iyileştirme değildir. -->

---

<!-- _class: bolum -->
# 6. Tüm Çiftler En Kısa Yollar

---

# Başlangıç sorusu

Bir uçuş rezervasyon sistemi, ~20 şehrin **her çifti** arasında en ucuz ücrete aynı anda ihtiyaç duyar.

Dijkstra'yı 20 kez çalıştırmak işe yarar — işi **paylaşmanın** bir yolu var mı?

<!-- Konuşma notu: 20 * O(V^2)'ye karşı tek bir paylaşılan O(V^3) hesaplama. -->

---

# Kısa tarihçe

- **Robert Floyd** ve **Stephen Warshall**, ikisi de 1962
- Bağımsız, yakından ilişkili matris algoritmaları
- Birleşik algoritma her iki adı da taşır

<!-- Konuşma notu: Warshall'ınki erişilebilirlik için; Floyd'unki en kısa mesafeler için. -->

---

# Fikir

- Bir `N x N` matris `dist[i][j]`
- **Her** köşe `k` için: `i -> k -> j`, `dist[i][j]`'den daha mı kısa?
- Her köşeyi bir ara durak olarak dene
- **Yerinde** güncelle — güvenli, çünkü `dist[i][k]`/`dist[k][j]` geçiş sırasında hiç değişmez

<!-- Konuşma notu: Bu yerinde güvenlik, nadir görülen hoş bir sadeleştirme. -->

---

# Floyd-Warshall'ın kodu (C)

```c
void floyd_warshall(int vertex_cnt) {
    for (int k=0;k<vertex_cnt;k++) {
        for (int i=0;i<vertex_cnt;i++) {
            for (int j=0;j<vertex_cnt;j++) {
                if (dist[i][k]==INF || dist[k][j]==INF)
                    continue;
                int through=dist[i][k]+dist[k][j];
                if (through<dist[i][j])
                    dist[i][j]=through;
            }
        }
    }
}
```

<!-- Konuşma notu: k, EN DIŞTAKİ döngü olmalı — doğruluk kanıtının tamamı bu. -->

---

# Floyd-Warshall'ın kodu (Java)

```java
static void floydWarshall(int vertexCnt) {
    for (int k=0;k<vertexCnt;k++) {
        for (int i=0;i<vertexCnt;i++) {
            for (int j=0;j<vertexCnt;j++) {
                if (dist[i][k]==INF || dist[k][j]==INF)
                    continue;
                int through=dist[i][k]+dist[k][j];
                if (through<dist[i][j])
                    dist[i][j]=through;
            }
        }
    }
}
```

<!-- Konuşma notu: dist burada bir Java 2 boyutlu dizisidir, C'nin sabit boyutlu statik dizisindeki dist[i][k]'ye karşılık -- aynı erişim deseni. -->

---

# Floyd-Warshall: matris dolar

<iframe class="dsanim" src="anim/floyd-warshall.html?yer=slayt&lang=tr" title="Floyd-Warshall tüm çiftler en kısa yollar"></iframe>

<!-- Konuşma notu: Her ara köşe k için bir adım -- her (i,j) çifti için değil, yoksa bu çok fazla adım olurdu. -->

---

# Gerçek çıktı: Floyd-Warshall

```text
-- normal: 5 vertices, negative edges but no negative cycle --
      A   B   C   E   D
  A   0   1  -3  -4   2
  B   3   0  -4  -2   1
  C   7   4   0   2   5
no negative cycle

-- edge: A-B-C-A is a negative cycle --
negative cycle at: A B C
```

<!-- Konuşma notu: Negatif bir köşegen girişi (dist[A][A] < 0), o köşeden geçen bir negatif döngüyü işaret eden tam da budur. -->

---

# Karmaşıklık ve tuzak

- **O(V^3)** süre, **O(V^2)** alan
- Birkaç yüz köşe için pratik, daha fazlası için değil
- Tuzak: `k`'yı **en içteki** döngü yapmak sessizce çöp hesaplar
- Tuzak: `== INF` korumasını unutmak → tamsayı taşması

<!-- Konuşma notu: Koruma olmadan INF + INF, büyük negatif bir sayıya taşabilir. -->

---

# Kısa soru

Bellman-Ford, **bir başlangıçtan** erişilebilen negatif döngüleri bulur. Floyd-Warshall'ın köşegen kontrolü bunları farklı nasıl bulur?

*(cevap bir sonraki slaytta)*

---

# Cevap

**Sıfırın altına** düşen herhangi bir `dist[v][v]`: `v`'den ayrılan bir yolun, yerinde kalmaktan daha ucuza geri döndüğü anlamına gelir.

Floyd-Warshall **her** çifti hesapladığı için, bu kontrol her köşe için aynı anda çalışır — ayrı bir başlangıç köşesine gerek yok.

<!-- Konuşma notu: Daha zor, daha genel problemi çözmenin güzel bir kazanımı: bazı sorular daha zor değil, daha kolay hale gelir. -->

---

<!-- _class: bolum -->
# 7. Güçlü Bağlı Bileşenler

---

# Başlangıç sorusu

Kenar yönüne saygı göstererek hangi köşe grupları birbirine ulaşıp **geri dönebilir**?

Bir döngü içinde birbirine bağlanan web sayfaları. Karşılıklı özyinelemeli fonksiyonlar.

<!-- Konuşma notu: Hafta 5'in bağlı bileşenleri yönü tamamen görmezden gelir -- bu, yönlü sürümdür. -->

---

# Kosaraju'nun fikri

- **Sergei Kosaraju**, ~1978 (Micali ve Vazirani, 1981 üzerinden atfedilir)
- Aşama 1: DFS, her köşenin **bitiş zamanını** kaydet
- Aşama 2: **Devrik** (kenarları ters çevrilmiş) çizgede DFS
- Kökleri **azalan** bitiş zamanı sırasıyla ziyaret et
- Aşama 2'deki her DFS ağacı = bir GBB (güçlü bağlı bileşen)

<!-- Konuşma notu: Bölüm 1'in tam DFS + bitiş zamanı makinesini yeniden kullandığı için Tarjan'ın tek geçişli algoritmasına tercih edildi. -->

---

# Kosaraju'nun kodu (C)

```c
void dfs1(int u) {            /* phase 1 */
    visited[u]=1;
    for (AdjNode *n=cur_g->adj[u]; n; n=n->next)
        if (!visited[n->to]) dfs1(n->to);
    finish[finish_len++]=u;
}

void dfs2(int u, int id) {    /* phase 2, on adjT */
    visited[u]=1; comp_of[u]=id;
    for (AdjNode *n=cur_g->adjT[u]; n; n=n->next)
        if (!visited[n->to]) dfs2(n->to, id);
}
```

<!-- Konuşma notu: dfs1 ve dfs2 neredeyse özdeş görünür — tek fark adj yerine adjT kullanmaları. -->

---

# Kosaraju'nun kodu (Java)

```java
static void dfs1(int u) {            // phase 1
    visited[u]=1;
    for (AdjNode n=curG.adj[u]; n!=null; n=n.next)
        if (visited[n.to]==0) dfs1(n.to);
    finish[finishLen]=u; finishLen++;
}

static void dfs2(int u, int id) {    // phase 2, on adjT
    visited[u]=1; compOf[u]=id;
    for (AdjNode n=curG.adjT[u]; n!=null; n=n.next)
        if (visited[n.to]==0) dfs2(n.to, id);
}
```

<!-- Konuşma notu: adjT, Graph inşa edilirken adj ile birlikte bir kez oluşturulan devrik çizgedir. -->

---

# Güçlü bağlı bileşenler

<iframe class="dsanim" src="anim/strongly-connected-components.html?yer=slayt&lang=tr" title="Güçlü bağlı bileşenler (Kosaraju)"></iframe>

<!-- Konuşma notu: Aşama 1'in bitiş sırasını, ardından aşama 2'nin devrik-çizge DFS ağaçlarını izleyin. -->

---

# Uç durum: tek bir büyük döngü

<iframe class="dsanim" src="anim/strongly-connected-components.html?yer=slayt&lang=tr&example=one-big-scc" title="GBB: tüm çizge tek bir bileşen"></iframe>

<!-- Konuşma notu: Her şey her şeye ulaşabildiğinde, tam olarak bir GBB vardır. -->

---

# Gerçek çıktı: güçlü bağlı bileşenler

```text
-- normal: 8 vertices, 2 cyclic components + 2 singletons --
4 components:
  A B C
  D E F
  G
  H

-- edge: everything is one big cycle --
1 component:
  A B C D E F G H
```

<!-- Konuşma notu: İçinden döngü geçmeyen tek bir köşe, hâlâ geçerli bir GBB'dir -- sadece boyutu bir olan bir bileşen. -->

---

# Karmaşıklık ve tuzak

- **O(V + E)** — iki tam DFS geçişi
- Tuzak: aşama 2'yi aşama 1 ile **aynı** sırada çalıştırmak
- **Tersine çevrilmeli** — buradaki en yaygın hata

<!-- Konuşma notu: İki aşama arasında visited[]'i sıfırlamayı unutmak ikinci en yaygın hata. -->

---

# Kısa soru

Bir **DAG**'da (hiç döngü yok), Kosaraju'nun algoritması kaç güçlü bağlı bileşen bulur?

*(cevap bir sonraki slaytta)*

---

# Cevap

Tam olarak **V** — köşe başına bir tane.

Hiçbir yerde döngü olmadığında, hiçbir köşe herhangi bir yoldan kendine dönemez, bu yüzden her bileşen tek başınadır (singleton). Bu, bu haftaki GBB animasyonundaki son uç durumdur.

<!-- Konuşma notu: Kullanışlı bir sağlama: GBB sayısı == köşe sayısı ancak ve ancak çizge bir DAG ise. -->

---

<!-- _class: bolum -->
# 8. İki Parçalı Çizgeler

---

# Başlangıç sorusu

Sınavları hiçbir öğrencinin aynı anda iki sınavı olmayacak şekilde planlayın. Bir öğrenciyi paylaşan dersler → bir kenar.

**Bu çizge 2 renklenebilir mi** — mümkün olan en basit ders programı?

<!-- Konuşma notu: Genel çizge boyamadan (Bölüm 10) çok daha hızlı bir soru. -->

---

# İki renkli BFS

- Başlangıcı `0` renklendir; her komşuyu **karşıt** renk yap
- Zaten kuyrukta olan aynı renkli bir komşu mu? **Çelişki** — iki parçalı değil
- Bileşen başına bir BFS (Hafta 5'in bileşenler döngüsü gibi)

---

# Tek sayılı döngü denkliği

**Bir çizge, ancak ve ancak tek uzunluklu bir döngüsü yoksa iki parçalıdır.**

Çift bir döngü renkleri kusursuzca değiştirir. Tek bir döngü tutarlı bir şekilde kapanamaz.

<!-- Konuşma notu: Bu denklik, doğrudan BFS renklendirme argümanından kanıtlanabilir. -->

---

# İki parçalılık kontrolü kodu (C) — bölüm 1/2

```c
int is_bipartite(Graph *g) {
    for (int i=0;i<g->vertex_count;i++) color_of[i]=-1;
    for (int s=0;s<g->vertex_count;s++) {
        if (color_of[s]!=-1) continue;
        color_of[s]=0; front=rear=0; enqueue(s);
        while (front<rear) {
            int u=dequeue();
```

<!-- Konuşma notu: Dış for-s döngüsü, bunu bağlı olmayan bir çizgede doğru yapan şeydir -- bileşenlerden yeniden kullanıldı. -->

---

# İki parçalılık kontrolü kodu (C) — bölüm 2/2

```c
            for (AdjNode *n=g->adj[u]; n; n=n->next) {
                if (color_of[n->to]==-1)
                    { color_of[n->to]=1-color_of[u];
                      enqueue(n->to); }
                else if (color_of[n->to]==color_of[u])
                    return 0;
            }
        }
    }
    return 1;
}
```

<!-- Konuşma notu: Renk ataması, kuyruktan çıkarken değil, kuyruğa eklenirken gerçekleşir — bilerek. -->

---

# İki parçalılık kontrolü kodu (Java) — bölüm 1/2

```java
static boolean isBipartite(Graph g) {
    for (int i=0;i<g.vertexCount;i++) colorOf[i]=-1;
    for (int s=0;s<g.vertexCount;s++) {
        if (colorOf[s]!=-1) continue;
        colorOf[s]=0; front=rear=0; enqueue(s);
        while (front<rear) {
            int u=dequeue();
```

<!-- Konuşma notu: Şimdiye kadar C sürümüyle aynı şekil. -->

---

# İki parçalılık kontrolü kodu (Java) — bölüm 2/2

```java
            for (AdjNode n=g.adj[u]; n!=null; n=n.next) {
                if (colorOf[n.to]==-1)
                    { colorOf[n.to]=1-colorOf[u];
                      enqueue(n.to); }
                else if (colorOf[n.to]==colorOf[u])
                    return false;
            }
        }
    }
    return true;
}
```

<!-- Konuşma notu: Dış for-s döngüsü, bunu bağlı olmayan bir çizgede doğru yapan şeydir -- Bölüm 3'ün bileşenler fikrinden yeniden kullanıldı. -->

---

# İki parçalı çizge kontrolü

<iframe class="dsanim" src="anim/bipartite-check.html?yer=slayt&lang=tr" title="İki parçalı çizge kontrolü"></iframe>

<!-- Konuşma notu: BFS'in ulaştığı anda çelişen bir kenarın kırmızı yanıp sönmesini izleyin. -->

---

# Uç durum: tek sayılı bir döngü

<iframe class="dsanim" src="anim/bipartite-check.html?yer=slayt&lang=tr&example=odd-cycle" title="İki parçalılık kontrolü: 5'li döngü İKİ PARÇALI DEĞİL"></iframe>

<!-- Konuşma notu: Fonksiyon hemen döner — sonraki köşeler renksiz kalır, ve bu beklenen bir durumdur. -->

---

# Gerçek çıktı: iki parçalılık kontrolü

```text
-- normal: an even cycle plus 2 safe diagonals --
colors: A=0 B=1 C=0 D=1 E=0 F=1 G=0 H=1
bipartite

-- edge: A-B-C-D-E-A is a 5-cycle (odd) --
colors: A=0 B=1 C=0 D=-1 E=1 F=1 G=-1 H=-1
NOT bipartite
```

<!-- Konuşma notu: -1 rengi "BFS tarafından hiç ulaşılmadı" anlamına gelir -- arama, çelişkiyi bulduğu anda durdu. -->

---

# Karmaşıklık ve tuzak

- **O(V + E)** — bir BFS
- Tuzak: **bağlı olmayan** çizgeleri ele almamak
- İkinci bir bileşende izole bir tek sayılı döngü, bileşen başına döngü olmadan görünmez kalır

<!-- Konuşma notu: Bir ağaç her zaman iki parçalıdır (hiç döngü yoktur) -- kısayol değil, kullanışlı bir sağlama. -->

---

# Kısa soru

Neden bir **çelişki kenarı** ("komşusuyla aynı renk") her zaman tek bir BFS katmanı içinde veya iki komşu katman arasında ortaya çıkar — asla bir katman atlamaz?

*(cevap bir sonraki slaytta)*

---

# Cevap

BFS, kaynaktan **mesafe tek/çift durumuna** göre kesin olarak renklendirir — çift mesafe 0 rengini, tek mesafe 1 rengini alır.

Herhangi bir kenar, BFS mesafeleri tam olarak 0 veya 1 farklı olan köşeleri bağlar (asla 2+ değil, yoksa doğrudan bir kenar olmazdı) — bu yüzden bir çelişki tam olarak orada ortaya çıkabilir.

<!-- Konuşma notu: Bu, iki slayt önceki tek-sayılı-döngü denkliğini kanıtlayan aynı mesafe-tek/çift fikri. -->

---

<!-- _class: bolum -->
# 9. En Büyük Akış

---

# Başlangıç sorusu

Bir su ağı: kaynak, hedef, kapasiteli borular.

**Ağın aynı anda taşıyabileceği en büyük toplam akış nedir?**

---

# Kısa tarihçe

- **Ford** ve **Fulkerson**, 1956 — genel yöntem
- **Edmonds** ve **Karp**, 1972 — her zaman **en kısa** genişletme yolunu kullan
- Kanıtlandı: bu seçim polinom zaman garantiler

<!-- Konuşma notu: Rastgele bir yol seçimiyle Ford-Fulkerson patolojik derecede yavaş olabilir. -->

---

# Fikir

- Boş kapasitesi olan, s'den t'ye herhangi bir **genişletme yolu** bul
- **Darboğazı** it (yol üzerindeki en küçük kapasite)
- İleri itmek bir **ters** kenar açar — sonraki bir yol bunu "geri alabilir"
- "Hâlâ kullanılabilir" çizgesi, **artık (residual) çizge**dir

<!-- Konuşma notu: Edmonds-Karp'ın saf açgözlü bir yaklaşımı yenmesini sağlayan şey, ters kenardır. -->

---

# En büyük akış - en küçük kesim

En büyük akış, en ucuz kesime **eşittir** — s'yi t'den ayıran en küçük toplam kapasite.

Geriye genişletme yolu kalmaması = s'den BFS'in erişilebilir kümesi, o kesimin **kendisidir**.

<!-- Konuşma notu: Genişletme yollarının tükenmesinin sadece sonlanmayı değil, en iyilik durumunu da kanıtlamasının sebebi bu. -->

---

# Edmonds-Karp kodu (C) — bölüm 1/2

```c
int edmonds_karp(int vertex_cnt, int s, int t) {
    int max_flow=0;
    while (bfs_augmenting_path(vertex_cnt, s, t)) {
        int bottleneck=INF;
        for (int v=t; v!=s; v=parent_of[v])
            if (cap_of[parent_of[v]][v]<bottleneck)
                bottleneck=cap_of[parent_of[v]][v];
```

<!-- Konuşma notu: parent_of[] boyunca t'den s'ye ilk yürüyüş: yol üzerindeki en küçük artık kapasiteyi bul. -->

---

# Edmonds-Karp kodu (C) — bölüm 2/2

```c
        for (int v=t; v!=s; v=parent_of[v]) {
            int u=parent_of[v];
            cap_of[u][v]-=bottleneck;
            cap_of[v][u]+=bottleneck;
        }
        max_flow+=bottleneck;
    }
    return max_flow;
}
```

<!-- Konuşma notu: İkinci yürüyüş: darboğazı uygula, giderken bir ters artık kenarı açarak. -->

---

# Edmonds-Karp kodu (Java) — bölüm 1/2

```java
static int edmondsKarp(int vertexCnt, int s, int t) {
    int maxFlow=0;
    while (bfsAugmentingPath(vertexCnt, s, t)) {
        int bottleneck=INF;
        for (int v=t; v!=s; v=parentOf[v]) {
            int u=parentOf[v];
            if (capOf[u][v]<bottleneck)
                bottleneck=capOf[u][v];
        }
```

<!-- Konuşma notu: C sürümüyle aynı iki-yürüyüş şekli. -->

---

# Edmonds-Karp kodu (Java) — bölüm 2/2

```java
        for (int v=t; v!=s; v=parentOf[v]) {
            int u=parentOf[v];
            capOf[u][v]-=bottleneck;
            capOf[v][u]+=bottleneck;
        }
        maxFlow+=bottleneck;
    }
    return maxFlow;
}
```

<!-- Konuşma notu: capOf, Java'da sade bir int[][] matrisidir, C'nin 2 boyutlu dizisiyle tam eşleşir. -->

---

# Edmonds-Karp en büyük akış

<iframe class="dsanim" src="anim/max-flow-edmonds-karp.html?yer=slayt&lang=tr" title="Edmonds-Karp en büyük akış"></iframe>

<!-- Konuşma notu: Her kenar akış/kapasite gösterir; artık satırı her pozitif artık çifti listeler. -->

---

# Gerçek çıktı: Edmonds-Karp

```text
-- normal: 6 vertices, 10 edges, A to F --
max flow from A to F = 9

-- edge: A and J are in two separate components --
max flow from A to J = 0
```

<!-- Konuşma notu: En büyük akış 0, tamamen geçerli bir cevaptır -- "hiç genişletme yolu yok" böyle görünür. -->

---

# Karmaşıklık ve tuzak

- Özellikle Edmonds-Karp için **O(V * E^2)**
- Tuzak: **ters** kenar güncellemesini unutmak
- Onsuz: sade Ford-Fulkerson, en iyi sonuçtan kısa kalabilir

<!-- Konuşma notu: BFS yerine DFS hâlâ doğrudur ama polinom zaman garantisini kaybeder. -->

---

# Kısa soru

Bölüm 3'ün union-find'ı "0 akış, s ve t bağlı değil" cevabını **anında** verebilirdi. Bu bölüm neden hâlâ önce tam bir BFS çalıştırıyor?

*(cevap bir sonraki slaytta)*

---

# Cevap

Union-find sadece **erişilebilirliği** bilir, **kapasiteyi** değil.

s ve t bağlı OLSA bile, gerçek en büyük akış yol boyunca darboğaz kapasitelerine bağlıdır — union-find'ın ebeveyn işaretçilerinin hiç kaydetmediği bir şey.

<!-- Konuşma notu: En büyük akışın neden düz bağlılıktan kesinlikle daha zor olduğunu da önizleyen güzel bir geri referans. -->

---

<!-- _class: bolum -->
# 10. Geri İzleme

---

# Başlangıç sorusu

Bir haritayı, hiçbir iki komşu aynı rengi paylaşmayacak şekilde, mümkün olduğunca az renkle boyayın.

**Bilinen bir formül yok.** Sistematik olarak nasıl arama yaparsınız?

<!-- Konuşma notu: N-vezir, oturma planları ve Hamilton yolları hepsi bu şekli paylaşır. -->

---

# Fikir: dene, özyinele, geri al

- Kısmi bir çözümü bir kararla genişlet
- Hâlâ tutarlı mı? **Özyinele** ve genişletmeye devam et
- Tutarsız mı, veya her genişletme başarısız mı? **Geri al** ve bir sonraki seçeneği dene

<!-- Konuşma notu: "Backtracking" (geri izleme), özellikle geri alma adımını ifade eder. -->

---

# Neden çizge boyama, Hamilton yolu değil?

Boyama, Bölüm 8'in tam `color[]` satırını ve komşu-çelişki kontrolünü yeniden kullanır.

Bir Hamilton yolu, görece az ekstra kavrayış için tamamen yeni bir "şimdiye kadarki yol" kuralına ihtiyaç duyar.

---

# Geri izleme kodu (C)

```c
int color_graph(int v, int k) {
    if (v==cur_g->vertex_count) return 1;
    for (int c=1;c<=k;c++) {
        if (safe(v,c)) {
            color_of[v]=c;
            if (color_graph(v+1,k)) return 1;
            color_of[v]=0;   /* backtrack */
        }
    }
    return 0;
}
```

<!-- Konuşma notu: Dört satır fikrin tamamını taşır: dene, özyinele, geri al; budamayı yapan da güvenlik kontrolü. -->

---

# Geri izleme kodu (Java)

```java
static boolean colorGraph(int v, int k) {
    if (v==curG.vertexCount) return true;
    for (int c=1;c<=k;c++) {
        if (safe(v,c)) {
            colorOf[v]=c;
            if (colorGraph(v+1,k)) return true;
            colorOf[v]=0;   // backtrack
        }
    }
    return false;
}
```

<!-- Konuşma notu: safe(v,c), Bölüm 8'in iki parçalılık çelişki kontrolüyle aynı şekilde kısa bir komşu taramasıdır. -->

---

# Geri izleme: çizge boyama

<iframe class="dsanim" src="anim/backtracking-graph-coloring.html?yer=slayt&lang=tr" title="Geri izleme: çizge boyama"></iframe>

<!-- Konuşma notu: Reddedilen bir renk kırmızı yanıp söner; geri alınan bir renk boşa döner. -->

---

# Zorunlu uç durum: K4, çözülemez

<iframe class="dsanim" src="anim/backtracking-graph-coloring.html?yer=slayt&lang=tr&example=impossible" title="Geri izleme: K4, 3 değil 4 renk gerektirir"></iframe>

<!-- Konuşma notu: Her kombinasyon denenir ve güvensiz bulunur -- şanslı bir başarı değil, kanıtlanmış bir başarısızlık. -->

---

# Gerçek çıktı: geri izlemeli çizge boyama

```text
-- normal: 6 vertices, 10 edges, k=3 --
colouring: A=1 B=2 C=3 D=1 E=2 F=3

-- edge: K4 is UNSOLVABLE with k=3 --
no valid colouring with k=3
```

<!-- Konuşma notu: "no valid colouring" ancak her dal denenip geri alındıktan sonra basılır -- kanıtlanmış bir olumsuzluk. -->

---

# Karmaşıklık ve tuzak

- En kötü durum **O(k^V)** — son çare bir teknik
- `safe()` erkenden büyük kısımları budar — kullanılabilir olmasının sebebi bu
- Tuzak: **geri alma** adımını unutmak sonraki dalları bozar

<!-- Konuşma notu: Geri izlemenin üstel sınıra rağmen işe yaramasının tüm sebebi bu. -->

---

# Kısa soru

K4, 4 renk gerektirir. Algoritma, k=3 ile "çözülemez" bildirmeden önce gerçekten kaç **köşeyi** boyamaya çalışır?

*(cevap bir sonraki slaytta)*

---

# Cevap

Her seferinde köşe 0'ın ötesine geri izleme yaptığında hepsini — ama başarısızlık köşe 3'te, K4'ün 4. köşesinde tespit edilir, çünkü ilk 3'ü aralarında zaten 3 mevcut rengin tamamını kullanmıştır.

`safe()` ardından köşe 3 için her rengi reddeder, başa kadar bir geri alma zinciri zorlar.

<!-- Konuşma notu: Zaman varsa animasyon slaytında canlı izlemeye değer -- tam geri izleme zincirini izlemek bu algoritmanın can alıcı noktası. -->

---

# Her program nasıl kontrol edildi

- Her C programı `-Wall -Wextra -Werror` ile derlenir
- Her Java programı `-Xlint:all -Werror` ile derlenir
- C ve Java çıktısı **bayt bayt özdeş** olarak karşılaştırıldı, aynı senaryolar
- Her birim test dosyası **AddressSanitizer** altında da yeniden derlendi

<!-- Konuşma notu: Bu, sadece birkaçı için değil, bu haftaki her program için kullanılan run_tests.py hattıdır. -->

---

# Algoritma başına tek cümle

- **Kahn / DFS topolojik sıralama**: her "önce" kuralına uyan sıra
- **Döngü tespiti**: sadece var mı değil, hangi köşeler
- **Union-find**: "aynı grup mu?" sorusu neredeyse sabit zamanda
- **Kruskal / Prim**: her şeyi bağlamanın en ucuz yolu
- **Dijkstra / Bellman-Ford**: bir başlangıçtan en ucuz yol
- **Floyd-Warshall**: her çift arasındaki en ucuz yol, aynı anda

<!-- Konuşma notu: Haftanın ilk yarısı, birer satır. -->

---

# Algoritma başına tek cümle (devam)

- **Kosaraju GBB**: karşılıklı erişilebilirlik, yönlü
- **İki parçalılık kontrolü**: bu tam olarak iki takıma bölünebilir mi?
- **Edmonds-Karp**: bir ağın taşıyabileceği en büyük akış
- **Geri izleme**: dene, özyinele, geri al — formülü olmayan problemler için

<!-- Konuşma notu: İkinci yarı. Toplamda on bir algoritma, on problem (topolojik sıralamanın iki çözümü var). -->

---

# Özet tablosu (1/3)

| Problem | Algoritma | Süre |
| --- | --- | --- |
| Sıralama | Kahn / DFS topo-sıralama | O(V+E) |
| Döngü var mı? | 3 renkli DFS | O(V+E) |
| Gruplar | Union-find | ~O(1) amortize |

<!-- Konuşma notu: Bu tablo, notun özet tablosunu tam olarak yansıtıyor, sığması için üç slayta bölündü. -->

---

# Özet tablosu (2/3)

| Problem | Algoritma | Süre |
| --- | --- | --- |
| En ucuz bağlantı | Kruskal / Prim | O(E log E) / O(V^2) |
| En ucuz yol | Dijkstra / Bellman-Ford | O(V^2) / O(V*E) |
| Tüm çiftler yollar | Floyd-Warshall | O(V^3) |

---

# Özet tablosu (3/3)

| Problem | Algoritma | Süre |
| --- | --- | --- |
| Karşılıklı erişim | Kosaraju GBB | O(V+E) |
| 2 takıma bölme | İki parçalılık kontrolü | O(V+E) |
| En büyük akış | Edmonds-Karp | O(V*E^2) |
| Formül yok | Geri izleme | En kötü O(k^V) |

<!-- Konuşma notu: Listeyi kapattığı için burada dört satır var -- yine de slayta rahatça sığıyor. -->

---

# Alıştırmalar (birkaçını seçin)

- Kahn'ın algoritmasını 5 kenarlı bir DAG üzerinde elle izleyin
- Negatif bir kenarı olan ama negatif döngüsü olmayan bir çizge kurun
- GBB'yi önemsiz (tek köşeli) bileşenleri işaretleyecek şekilde değiştirin
- Her ağacın iki parçalı olduğunu kanıtlayın

<!-- Konuşma notu: Tam on alıştırmalık liste bu haftanın notlarında. -->

---

# Kendini sınama: 3 hızlı soru

1. Dijkstra neden negatif bir kenarda başarısız olur?
2. Kosaraju'nun topolojik-sıralama-DFS'e kattığı TEK yeni fikir nedir?
3. Ters bir artık kenar, sonraki bir genişletme yoluna ne yapmasına izin verir?

<!-- Konuşma notu: Tam on sorulu quiz, cevaplarıyla birlikte, bu haftanın notlarında. -->

---

# Sırada ne var

**Hafta 10: İleri Ağaç Yapıları**

AVL ağaçları, kırmızı-siyah ağaçlar, B-ağaçları — talihsiz eklemelerde `O(log n)`'in `O(n)`'e çökmesini önleyen kendi kendini dengeleyen makine.

<!-- Konuşma notu: Bu hafta çoğunlukla diziler ve komşuluk listeleri üzerinde çalıştı -- Hafta 10 dengeli ağaçlara geri dönüyor. -->

---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Sorular?

CEN207 Veri Yapıları · Hafta 9 · Çizge Algoritmaları

<!-- Konuşma notu: Kendini sınama quiz'inden önce soru için söz açık. -->
