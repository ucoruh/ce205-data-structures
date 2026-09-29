---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Hafta 5 — Çizgeler ve Dolaşmalar"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Hafta 5"
footer: "RTEÜ Bilgisayar Mühendisliği · 2026-2027 Güz"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Çizgeler ve Dolaşmalar

**CEN207 Veri Yapıları — Hafta 5**

Dr. Öğr. Üyesi Uğur CORUH · 2026-2027 Güz

<!--
Konuşma notu: Bir ağaçta bir düğüm birden çok çocuğa işaret edebiliyordu, ama asla geriye ya da yana dönemiyordu. Bu iki kısıtı da kaldırın -- herhangi bir düğüm herhangi bir düğüme işaret edebilsin -- ağaç bir ÇİZGEYE (graph) dönüşür, bu dersteki en genel şekle.
-->

---

# Bugünün planı (3 saat)

| Saat | Konu |
| --- | --- |
| 1 | Neden çizgeler, terimler **Anim 1** · matris/liste **Anim 2–3** |
| 2 | BFS **Anim 4** · özyinelemeli DFS **Anim 5** · yinelemeli DFS **Anim 6** |
| 3 | Bağlı bileşenler **Anim 7** · en kısa yol **Anim 8** |

**Öğrenme çıktıları:** LO.1 (temel veri yapılarını açıklar) · LO.2 (karmaşıklığı çözümler) · LO.7 (doğru yapıyı seçer)

<!-- Konuşma notu: Sekiz kısa animasyon dersin tamamını taşıyor; her biri fikrin tanıtıldığı yerde tam olarak bir kez görünüyor ve her biri zor ya da uç bir girdiyle ikinci kez ele alınıyor. -->

---

# Bu haftanın konuları — nerede

| Konu | Nerede |
| --- | --- |
| Neden çizgeler, terimler | Bölüm 1–2 |
| Komşuluk matrisi ve komşuluk listesi | Bölüm 3 |
| BFS, DFS (özyinelemeli ve yinelemeli) | Bölüm 4–6 |
| Bağlı bileşenler, en kısa yol | Bölüm 7–8 |

<!-- Konuşma notu: Her terim ilk geçtiği yerde tam tanımlanır; bu tablo yalnızca onu tekrar nerede bulacağınızı söylüyor. -->

---

# Kod örnekleri nasıl çalışır

- Her fikrin eksiksiz bir **C** ve **Java** programı var
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Kaynaklar: `code/week-05/c/` ve `code/week-05/java/`
- Her programın beklenen çıktısı hafta notlarında var

<!-- Konuşma notu: Canlı çalıştırmak isterseniz şimdi bir terminal açın; bugünkü her slaytın kodu tam gösterildiği gibi derlenir ve çalışır. -->

---

# Hatırlatma — yığın, kuyruk, özyineleme (Hafta 3)

- Bir **yığın** (stack, LIFO): son eklenen, ilk çıkarılan
- Bir **kuyruk** (queue, FIFO): ilk eklenen, ilk çıkarılan
- **Özyineleme** (recursion) aslında bir yığındır: çağrı ekler, dönüş çıkarır
- Bugün: aynı yığın ve kuyruk, artık çizge düğümleri tutuyor

<!-- Konuşma notu: Mekanizmada yeni hiçbir şey yok -- bu iki yapının tuttuğu veri için yeni bir şekil var, o kadar. -->

---

# Hatırlatma — ağaçlar özel çizgelerdir (Hafta 4)

- Bir ağaç: tek kök, döngü yok, herhangi bir düğüme tam bir yol
- Bir çizge: kök **zorunlu değil**, döngüye izin var, birden çok yol olabilir
- Her ağaç bir çizge**dir**; her çizge bir ağaç değildir
- Dolaşmalar (ön/orta/son/seviye sırası) bugün çizge aramasına genelleşiyor

<!-- Konuşma notu: Geçen haftaki "n düğüm, n-1 kenar, döngü yok" kuralı özel bir durumdu; bugün bu kısıt tamamen kalkıyor. -->

---

# Haftanın haritası — genel bakış

| Temeller | Dolaşma ve uygulamalar |
| --- | --- |
| Neden çizgeler, terimler | BFS, DFS (özyinelemeli, yinelemeli) |
| Matris ve liste | Bağlı bileşenler |
| — | En kısa yol (ağırlıksız) |

<!-- Konuşma notu: Bu haritadaki her kutunun kendi slaytları var, çoğunda kısa bir animasyon ve eksiksiz bir C/Java programı var. -->

---

<!-- _class: bolum -->

# 1. Neden Çizgeler? Köprülerden Ağlara

<!-- Konuşma notu: Bölüm 1, çizge teorisinin en eski problemiyle bütün haftayı motive ediyor, sonra aynı şeklin haritalarda, arkadaşlıklarda ve web'de nasıl saklandığını gösteriyor. -->

---

# Başlangıç sorusu

Bir şehirde yedi köprüyle birbirine bağlı dört
kara parçası var. Şehri, her köprüden tam bir
kez geçerek dolaşıp eve dönebilir misiniz?

<!-- Konuşma notu: Bu, 1700'lerde küçük bir şehrin kendine sorduğu gerçek bir soru -- ve matematiğe tamamen yeni bir dal kazandırdı. -->

---

# Kısa bir tarihçe

- **1736** — Leonhard Euler, Königsberg köprü bulmacasını çözer
- Königsberg (bugün Kaliningrad): 4 kara parçası, 7 köprü
- Euler'in makalesi yazılmış **ilk** çizge teorisi makalesidir
- Yanıt "hayır" oldu -- ve nedenini, her şehir için, tam olarak açıkladı

<!-- Konuşma notu: Euler makalesinde tek bir köprü bile çizmedi -- hangi kara parçasının hangisine bağlı olduğu dışında her şeyi attı, ki bu tam olarak bir çizge fikridir. -->

---

# Köprüler, yeniden ifade edilirse

- Her **kara parçası** bir **düğüm** (vertex) olur (4 tane)
- Her **köprü** bir **kenar** (edge) olur (7 tane)
- Yürüyüş şuna dönüşür: kalemi kaldırmadan her kenarı bir kez çiz
- Buna **Euler yolu** (Eulerian path) denir -- Euler'in kendi adından

<!-- Konuşma notu: Haritayı atıp yalnızca "neyin neye bağlı olduğunu" tutmak, bu dersteki en önemli tek hamledir. -->

---

# Euler'in içgörüsü: derece paritesi

- Bir düğümden **geçerken** her seferinde 2 kenar kullanılır
- Yalnızca başlangıç ve bitiş düğümü **tek** sayıda kenar kullanabilir
- Bir Euler yürüyüşü için **0 ya da 2** tek dereceli düğüm gerekir, fazlası değil
- Königsberg'de **4** tek dereceli düğüm var -- o yüzden yürüyüş yok

<!-- Konuşma notu: Bu tek sayma argümanı, derece paritesi, yanıtın yalnızca o şehir için değil, Königsberg gibi şekillenmiş her şehir için "hayır" olmasının nedenidir. -->

---

# Neden önemli

- Sayarak çözülen bir bulmaca, **çizge teorisini** kurdu
- Aynı düğüm/kenar fikri artık neredeyse her ilişkiyi modelliyor
- Modern kullanımlar: haritalar, sosyal ağlar, web ve çok daha fazlası
- Sonraki üç slayt bunlardan üçünü gösteriyor

<!-- Konuşma notu: "Düğümler ve kenarlar", bilgisayar biliminin en tekrar kullanılabilir fikirlerinden biri olduğunu kanıtladı. -->

---

# Çizgeler her yerde — yol haritaları

- **Düğümler:** kavşaklar, şehirler, adresler
- **Kenarlar:** yollar, bir **ağırlıkla** -- mesafe ya da sürüş süresi
- GPS yönlendirmesi sorar: A'dan B'ye en kısa ağırlıklı yol nedir?
- Hafta 9'daki Dijkstra algoritması tam olarak bu soruyu yanıtlıyor

<!-- Konuşma notu: Bastığınız her "yol tarifi al" düğmesinin altında bir çizge en kısa yol algoritmasının bir biçimi çalışıyordu. -->

---

# Çizgeler her yerde — sosyal ağlar

- **Düğümler:** kişiler ya da hesaplar
- **Kenarlar:** "takip ediyor" (yönlü) ya da "arkadaş" (yönsüz)
- "Arkadaşımın arkadaşı" -- tam olarak 2 kenarla erişilebilen
- Bölüm 4'teki BFS bu soruyu, bir seviye seviye yanıtlıyor

<!-- Konuşma notu: Bir arkadaş önerisi özelliği, altta neredeyse her zaman kendi düğümünüzden kısa bir genişlik öncelikli aramadır. -->

---

# Çizgeler her yerde — web

- **Düğümler:** web sayfaları; **kenarlar:** hiper bağlantılar (yönlü)
- `A>B`, `A` sayfasının `B` sayfasına bağlandığı anlamına gelir
- Bir tarayıcı (crawler) erişilebilir her sayfayı tam bir kez ziyaret eder
- Bölüm 6'daki DFS, bir web tarayıcısı yazmanın klasik yollarından biri

<!-- Konuşma notu: PageRank, Google'ın özgün sıralama fikri, temelde tam olarak bu yönlü bağlantı çizgesi üzerinde yapılan bir hesaplamadır. -->

---

# Çizge ve ağaç, yeniden

| Ağaç (Hafta 4) | Çizge (bu hafta) |
| --- | --- |
| Tek kök | Zorunlu kök yok |
| Döngüye izin yok | Döngüye izin var |
| İki düğüm arasında tam bir yol | Sıfır, bir ya da çok yol |

<!-- Konuşma notu: Bu tabloyu haftanın geri kalanı boyunca aklınızda tutun -- aşağıdaki her dolaşma fikri, bu üç kısıt kaldırılmış bir ağaç fikridir. -->

---

# Sık yapılan hatalar

- Bir çizgenin **bağlı** olması gerektiğini varsaymak -- olmayabilir
- Bir kenarın her zaman **iki yönde** çalıştığını varsaymak -- yalnız yönsüzse
- Hiç kenarı olmayan tek bir düğümün geçerli bir çizge olduğunu unutmak

<!-- Konuşma notu: Bugünün her algoritması, bu slaytın listelediği tuhaf durumlarda da doğru çalışmalı -- aşağıdaki "uç durum" animasyonları tam olarak bunu sınıyor. -->

---

# Mini soru

Bir şehirde tam olarak **iki** tek dereceli kara
parçası var, geri kalanı çift. Her köprüden bir
kez geçen bir yürüyüş var mı? Nereden başlamalı?

<!-- Konuşma notu: Birkaç slayt önceki parite kuralını uygulayın. -->

---

# Yanıt

**Evet.** Tam olarak iki tek dereceli düğümle,
bir Euler **yolu** (tam bir tur değil) vardır;
bir tek düğümden başlar, diğerinde biter.

<!-- Konuşma notu: Sıfır tek düğüm başlangıca dönen bir tur verir; tam olarak iki düğüm tek yönlü bir yürüyüş verir -- başka her durumda hiç yürüyüş yoktur. -->

---

<!-- _class: bolum -->

# 2. Çizge Terimleri

<!-- Konuşma notu: Bölüm 2, sonraki her bölümün dayandığı terimleri kuruyor -- düğüm, kenar, derece, yol, döngü -- hepsi tek bir işlenmiş örnek üzerinde. -->

---

# Başlangıç sorusu

Bir çizge yalnızca iki kümedir: düğümlerin
kümesi **V**, kenarların kümesi **E**. Bu kadar
küçük bir fikirden gerçekten ne kadar yapı çıkar?

<!-- Konuşma notu: Neredeyse her şey -- şaşırtıcı biçimde, bu iki kümelik tanım bütün temeldir. -->

---

# Bir çizge, biçimsel olarak

- Bir çizge `G = (V, E)`: bir düğüm kümesi, bir kenar kümesi
- Her kenar **iki** düğümü bağlar (aynı düğüm de olabilir)
- `|V|` düğüm, `|E|` kenar -- kısaca: `V` ve `E`
- Aşağıdaki her şey yalnızca bu iki kümeden inşa edilir

<!-- Konuşma notu: Bu biçimsel tanım kasıtlı olarak yalın görünüyor -- gücü, tam olarak ne kadar az varsayım yapmasından geliyor. -->

---

# Terimler (1/4)

| Terim | Anlamı |
| --- | --- |
| **Düğüm** (vertex) | Çizgedeki tek bir nokta |
| **Kenar** (edge) | İki düğüm arasındaki bağlantı |
| **Yönsüz** (undirected) | `A-B` kenarı her iki yönde kullanılabilir |
| **Yönlü** (directed) | `A>B` kenarı yalnız `A`'dan `B`'ye kullanılabilir |

<!-- Konuşma notu: Bunların her biri, bu tablodan hemen sonraki animasyonda birer birer işaret ediliyor. -->

---

# Terimler (2/4)

| Terim | Anlamı |
| --- | --- |
| **Ağırlıklı** (weighted) | Her kenar bir sayı, ağırlığını taşır |
| **Ağırlıksız** (unweighted) | Kenarlar yalnızca "bağlı" der, sayı yok |
| **Derece** (degree, yönsüz) | Bir düğüme değen kenar sayısı |

<!-- Konuşma notu: Ağırlıksız bir kenar aslında ağırlığı hep 1 olan ağırlıklı bir kenardır. -->

---

# Terimler (3/4)

| Terim | Anlamı |
| --- | --- |
| **Gelen derece** (in-degree) | Bir düğüme **giren** kenarlar (yönlü) |
| **Giden derece** (out-degree) | Bir düğümden **çıkan** kenarlar (yönlü) |
| **Yol** (path) | Düğüm tekrarsız bir kenar dizisi |
| **Döngü** (cycle) | Başladığı düğüme dönen bir yol |

<!-- Konuşma notu: Derece ancak yön varsa ikiye ayrılır -- yönsüz bir çizgede "gelen" ya da "giden" hiç gerekmez. -->

---

# Terimler (4/4)

| Terim | Anlamı |
| --- | --- |
| **Bağlı** (connected) | Her düğüme her düğümden erişilebilir |
| **Öz-döngü** (self-loop) | Bir düğümden kendisine giden kenar |
| **Çoklu kenar** (multi-edge) | Aynı çift arasında birden fazla kenar |

<!-- Konuşma notu: Öz-döngüye ve çoklu kenara izin veren bir çizgeye bazen özellikle MULTIGRAPH denir. -->

---

# Seyrek ve yoğun

- **Seyrek** (sparse): `E`, `V`'ye yakın -- düğüm başına az kenar
- **Yoğun** (dense): `E`, `V²`'ye yakın -- çiftlerin çoğu bağlı
- Bir yol haritası: seyrek (bir şehrin kavşak başına az yolu var)
- Küçük bir takımın "kim kimi takip ediyor" çizgesi: çoğu zaman yoğun

<!-- Konuşma notu: Bu ayrım, Bölüm 3'te bir çizgeyi nasıl saklayacağınızı seçerken çok önemli oluyor. -->

---

# Bir çizgeye ne sorabiliriz?

| İşlem | Neyi yanıtlar |
| --- | --- |
| `has_edge(a, b)` | `a` ve `b` doğrudan bağlı mı? |
| `neighbors(v)` | `v` hangi düğümlere bağlı? |
| `degree(v)` | `v`'ye kaç kenar değiyor? |

<!-- Konuşma notu: Bu haftaki her algoritma, tekrar tekrar sorulan bu üç küçük soru üzerine kuruludur. -->

---

# Çizge terimleri, tek tek

<iframe class="dsanim" src="anim/graph-terminology.html?yer=slayt&lang=tr" title="Çizge terimleri"></iframe>

<!-- Konuşma notu: Normal örnek: 8 düğüm, ağırlıklı, bir döngü, bir öz-döngü, bir çoklu kenar ve 2 bileşenle -- bu bölümün her terimi, tek bir çizge üzerinde. -->

---

# Uç durum — yönlü, iki döngü, bir öz-döngü

<iframe class="dsanim" src="anim/graph-terminology.html?yer=slayt&lang=tr&example=hard" title="Çizge terimleri: yönlü, zor"></iframe>

<!-- Konuşma notu: 8 düğüm, yönlü, iki ayrı döngü, bir öz-döngü, bir çoklu kenar ve 2 zayıf bileşenle -- artık gelen derece ile giden derece düğüm başına gerçekten farklılaşıyor. -->

---

# Kod — Edge ve Graph yapıları

```c
typedef struct Edge {
    int to;             /* diğer uç */
    int weight;         /* ağırlıksızsa 1 */
    struct Edge *next;
} Edge;

typedef struct Graph {
    Edge *adj[MAX_V];   /* düğüm başına bir liste */
    int vertex_count;
    int directed;        /* 0 ya da 1 */
} Graph;
```

<!-- Konuşma notu: Bir kenar için bir yapı, bütün çizge için bir yapı -- bu haftaki her algoritma tam olarak bu iki şekil üzerine kurulu. -->

---

# Kod — out_degree()

```c
int out_degree(Graph *g, int v) {
    int d = 0;
    for (Edge *e = g->adj[v]; e; e = e->next)
        d++;
    return d;
}
```

<!-- Konuşma notu: Yönsüz bir çizgede bu tek fonksiyon bir düğümün ihtiyacı olan her şeyi zaten sayar -- ayrı bir "gelen" sürümü gerekmez. -->

---

# Kod — in_degree() (yalnız yönlü)

```c
int in_degree(Graph *g, int v) {
    int d = 0;
    for (int u = 0; u < g->vertex_count; u++)
        for (Edge *e = g->adj[u]; e; e = e->next)
            if (e->to == v) d++;
    return d;
}
```

<!-- Konuşma notu: v'ye kimin işaret ettiğini bulmak, DİĞER her düğümün listesini taramak demek -- ek bir kayıt tutmadan bir kısayol yok. -->

---

# Karmaşıklık

- `out_degree`: bir listede yürü -- **O(v'nin derecesi)**
- `in_degree`: **her** düğümün listesini tara -- **O(V + E)**
- Yönlü çizgeler "gelen"i "giden"den kesinlikle daha pahalı yapar

<!-- Konuşma notu: Bu asimetri, yalnızca giden kenarları saklama seçiminin doğrudan bir sonucudur -- Bölüm 3'ün açıkladığı komşuluk listesi seçimi. -->

---

# Sık yapılan hatalar

- Bir çoklu-çizgede **derece**yi **komşu sayısıyla** karıştırmak
- Bir öz-döngünün dereceye **iki kez** eklendiğini unutmak
- Gelen ve giden derecenin hep eşit olduğunu varsaymak -- yalnız özel durumlarda

<!-- Konuşma notu: Yukarıdaki zor ön ayar animasyonu, özellikle çoğu düğümde gelen ve giden derecenin farklılaşması için kuruldu. -->

---

# Mini soru

Yönlü bir çizgede `X` düğümünde bir öz-döngü
var. Bu öz-döngü `X`'in gelen derecesini ne kadar
artırır? Giden derecesini?

<!-- Konuşma notu: Bir öz-döngünün tek kenarının hangi yöne "işaret ettiğini" düşünün. -->

---

# Yanıt

**Her birini 1'er.** `X>X` öz-döngüsü bir kez
`X`'e **giren** kenar, bir kez `X`'ten **çıkan**
kenar olarak sayılır -- ikisi de 1 artar.

<!-- Konuşma notu: Yönsüz bir çizgede aynı öz-döngü düz dereceyi 1 değil 2 artırır -- yön sayma kuralını değiştiriyor. -->

---

<!-- _class: bolum -->

# 3. Çizgeyi Saklamak: Matris ve Liste

<!-- Konuşma notu: Çizge bir fikirdir; bir programın onu saklayacak somut bir yola ihtiyacı var. Bu bölüm iki standart seçimi, aynı çizgeler üzerinde, yan yana kuruyor. -->

---

# Başlangıç sorusu

`has_edge(a, b)` ve `neighbors(v)`, bu haftaki
her algoritmanın soracağı iki soru. Her ikisini
de yanıtlayan en yalın yapı nedir?

<!-- Konuşma notu: Tek bir en iyi yanıt yok -- aşağıdaki iki yapı, birinin hızını diğerinin belleğiyle takas ediyor. -->

---

# İki gösterim, genel bakış

| | Komşuluk matrisi | Komşuluk listesi |
| --- | --- | --- |
| Sakladığı | Bir `V x V` tablo | Düğüm başına bir liste |
| En iyi olduğu | Yoğun çizgeler | Seyrek çizgeler |
| `has_edge` | O(1) | O(derece) |

<!-- Konuşma notu: Aşağıdaki iki bölüm, bunları tam olarak aynı kenar listelerinden kuruyor, böylece iki gösterim doğrudan karşılaştırılabiliyor. -->

---

# Komşuluk matrisi — fikir

`V x V` boyutunda bir tablo. `matrix[i][j]`,
`i` düğümünden `j` düğümüne bir kenar varsa
**1** (ya da ağırlığı) tutar, yoksa **0**. Yönsüz
çizgeler hem `matrix[i][j]` hem `matrix[j][i]`'yi doldurur.

<!-- Konuşma notu: Yönsüz bir çizgenin matrisi her zaman köşegene göre simetriktir -- bu simetri, "her iki yön"ün sayı olarak ifadesidir. -->

---

# Komşuluk matrisi, adım adım

<iframe class="dsanim" src="anim/adjacency-matrix.html?yer=slayt&lang=tr" title="Komşuluk matrisi"></iframe>

<!-- Konuşma notu: Normal örnek: 7 düğüm, yönsüz, ağırlıksız, 10 kenar -- matrisin simetrik hücre çiftleri halinde dolduğunu izleyin. -->

---

# Uç durum — tam çizge

<iframe class="dsanim" src="anim/adjacency-matrix.html?yer=slayt&lang=tr&example=dense" title="Komşuluk matrisi: tam çizge"></iframe>

<!-- Konuşma notu: 5 düğüm, her çift bağlı, 10 kenar -- 5 düğüm için mümkün olan en fazlası, ve matris köşegen dışında tamamen doluyor. -->

---

# Kod — add_edge() (matris)

```c
void add_edge(int a, int b, int w, int dir) {
    matrix[a][b] = w;
    if (!dir)
        matrix[b][a] = w;  /* köşegene ayna */
}
```

<!-- Konuşma notu: Yönlü bir kenar için bir atama, yönsüz için -- aynalanmış -- iki atama; tüm fark bu tek "if". -->

---

# Kod — build_adjacency_matrix()

```c
void build_adjacency_matrix(Edge *edges, int n,
                             int directed) {
    for (int i = 0; i < MAX_V; i++)
        for (int j = 0; j < MAX_V; j++)
            matrix[i][j] = 0;
    for (int k = 0; k < n; k++)
        add_edge(edges[k].a, edges[k].b,
                 edges[k].weight, directed);
}
```

<!-- Konuşma notu: Önce bütün tabloyu sıfırla, sonra kenarları teker teker ekle -- sıra önemli değil, her kenar yalnız kendi iki hücresine dokunur. -->

---

# Karmaşıklık — matris

- `has_edge(a, b)`: tek bir bakış -- **O(1)**
- Bellek: yoğun ya da seyrek fark etmez, hep **O(V²)** hücre
- `neighbors(v)`: bütün bir satırı tara -- **O(V)**, v'nin 1 kenarı olsa bile

<!-- Konuşma notu: Matrisin maliyeti kaç kenarın gerçekten var olduğuna değil, kaç düğümün mümkün olabileceğine bağlıdır. -->

---

# Komşuluk listesi — fikir

Her düğüm için bir bağlı liste, yalnızca
gerçek komşularını tutar. Yönsüz `A-B`
kenarı `B`'yi `A`'nın listesine **ve** `A`'yı
`B`'nin listesine ekler -- iki düğüm, iki liste.

<!-- Konuşma notu: Bu, Hafta 2'nin tam olarak aynı bağlı liste düğümü, yeniden kullanılmış: bir alan komşunun kimliği için, bir alan "sonraki" için. -->

---

# Komşuluk listesi, adım adım

<iframe class="dsanim" src="anim/adjacency-list.html?yer=slayt&lang=tr" title="Komşuluk listesi"></iframe>

<!-- Konuşma notu: Matrisle aynı normal örnek: 7 düğüm, yönsüz, ağırlıksız, 10 kenar -- her kenarın bir ya da iki listeye eklenmesini izleyin. -->

---

# Uç durum — yönlü, boş bir liste

<iframe class="dsanim" src="anim/adjacency-list.html?yer=slayt&lang=tr&example=hard" title="Komşuluk listesi: yönlü, boş liste"></iframe>

<!-- Konuşma notu: 8 düğüm, yönlü, ağırlıklı, ters bir çift `P>R` ve `R>P` dahil 10 kenar -- bazı düğümlerin listesi tamamen boş kalıyor, hiç giden kenarı olmadığı için. -->

---

# Kod — append() (liste)

```c
void append(int v, int neighbour) {
    AdjNode *n = malloc(sizeof(AdjNode));
    n->to = neighbour;
    n->next = NULL;
    if (adj[v] == NULL) { adj[v] = n; return; }
    AdjNode *cur = adj[v];
    while (cur->next) cur = cur->next;
    cur->next = n;
}
```

<!-- Konuşma notu: Tam olarak Hafta 2'nin tek yönlü bağlı liste eklemesi: sona kadar yürü, sonra ekle -- çizgeler bu kalıpta hiçbir şeyi değiştirmiyor. -->

---

# Kod — add_edge() (liste)

```c
void add_edge(int a, int b, int directed) {
    append(a, b);
    if (!directed && a != b)
        append(b, a);
}
```

<!-- Konuşma notu: `a != b` öz-döngü kontrolü, yönsüz bir öz-döngünün aynı listeye iki kez eklenmemesi için var. -->

---

# Karmaşıklık — liste

- Bellek: **O(V + E)** -- yalnız gerçek kenarlar yer kaplar
- `neighbors(v)`: kendi listesinde yürü -- **O(v'nin derecesi)**
- `has_edge(a, b)`: `a`'nın listesinde `b`'yi ara -- **O(derece)**

<!-- Konuşma notu: has_edge, matrisin kesinlikle kazandığı tek işlem -- liste aramak zorunda, matris hiç aramaz. -->

---

# Bellek ve zaman, yan yana

| | Matris | Liste |
| --- | --- | --- |
| Bellek | O(V²) | O(V + E) |
| `has_edge` | O(1) | O(derece) |
| `neighbors` | O(V) | O(derece) |

<!-- Konuşma notu: Üç satır, ve sonraki her algoritmanın karmaşıklığı doğrudan bu küçük tabloya dayanıyor. -->

---

# Seyrek çizgeler: listeyi seçin

- Bir yol haritası, web, bir arkadaşlık çizgesi: hepsi **seyrek**
- `E`, `V²`'nin çok altında, `V`'ye yakın
- Listenin O(V + E) belleği küçük kalır; matris O(V²) boşa gider
- Bölüm 4'ten sonraki her algoritma **listeyi** kullanıyor

<!-- Konuşma notu: Bu dersin gerçekten önemsediği çizgeler için yakın bir karar bile değil -- liste açık farkla kazanıyor. -->

---

# Yoğun çizgeler: matris kazanabilir

- Küçük, yoğun bağlı bir çizge: `E`, `V²`'ye yakın
- Matrisin "boşa giden" O(V²) belleği neredeyse hiç boşa gitmez
- O(1) `has_edge`, bellekten tasarruftan daha önemli olabilir
- Kural: küçük ve yoğunsa → matris; seyrek ya da büyükse → liste

<!-- Konuşma notu: İki yapı da tam olarak aynı bilgiyi saklıyor -- bu seçim tamamen bir mühendislik takası, asla bir doğruluk meselesi değil. -->

---

# Sık yapılan hatalar

- Büyük, seyrek bir çizge için matris kullanmak -- devasa bellek israfı
- Listenin bir yönsüz kenar için **iki** ekleme gerektirdiğini unutmak
- **Yönlü** bir çizgede `matrix[a][b]`'yi simetrik okumak

<!-- Konuşma notu: Yönlü bir matrisin iki "ayna" hücresi, matrix[a][b] ve matrix[b][a], gerçekten birbirinden tamamen farklı iki değer tutabilir. -->

---

# Mini soru

Bir çizgede 1.000 düğüm, yalnızca 2.000 kenar
var. Komşuluk matrisi kabaca kaç hücreye
ihtiyaç duyar? Bu çizge seyrek mi?

<!-- Konuşma notu: Düğüm sayısının karesini alın, sonra kenar sayısıyla karşılaştırın. -->

---

# Yanıt

**Yaklaşık 1.000.000 hücre** (1000²), yalnızca
2.000 gerçek kenar için -- neredeyse hepsi boşa
gidiyor. Evet, **çok seyrek**: burada açık seçim
bir komşuluk listesi.

<!-- Konuşma notu: Bu tam olarak Bölüm 3'ün "seyrek mi yoğun mu" kuralının yazıldığı durum. -->

---

<!-- _class: bolum -->

# 4. Genişlik Öncelikli Arama (BFS)

<!-- Konuşma notu: BFS, Hafta 4'ün seviye sırasının bir ağaçtan herhangi bir çizgeye genelleşmiş hali -- tek başına bir kuyruk bütün algoritmayı yürütüyor. -->

---

# Başlangıç sorusu

Bir kişiden başlayarak, doğrudan arkadaşları
kimler? Arkadaşlarının arkadaşları? Herkesi,
**en yakından başlayarak** ziyaret et -- nasıl?

<!-- Konuşma notu: "En yakından başlayarak" fikrin tamamı; aşağıdaki algoritma tam olarak bu sırayı garanti etmek için kurulu. -->

---

# Kısa bir tarihçe

- **1959** — Edward F. Moore, "Labirentte en kısa yol" makalesini yayımlar
- Kısa süre sonra, bağımsız olarak, farklı alanlarda yeniden bulundu
- Buradaki kuyruk tabanlı yöntem, esasen Moore'un algoritmasıdır
- Bugün pratikte en çok kullanılan çizge algoritmalarından biri

<!-- Konuşma notu: Moore fiziksel bir labirent kablolama sorununu çözüyordu -- aynı kuyruk tabanlı fikir her çizgeye genelleşti. -->

---

# Sezgi — bir gölete atılan taş

- Bir taş at: ilk dalga en yakın noktalara ulaşır
- Sonraki dalga, bir adım daha uzaktaki her şeye ulaşır
- BFS bir çizgeyi aynı şekilde dolaşır -- halka halka, dışarı doğru
- Buradaki her "halka" bir **seviye** (level) olarak adlandırılır

<!-- Konuşma notu: Hiçbir dalga bir öncekini geçmez -- bu sıralama garantisi, BFS'nin en kısa yolu bulmasını sağlayan tam olarak budur. -->

---

# BFS fikri

- Bir **kuyruk** (FIFO) kullan -- Hafta 3'ün yapısı, artık düğüm tutuyor
- Başlangıç düğümü: kuyruğa ekle, ziyaret edildi işaretle, seviye 0
- Bir düğümü çıkar, ziyaret edilmemiş komşularını ekle, seviye + 1
- Ziyaret edilen kenarlar bir **BFS ağacı** oluşturur, kökü başlangıç

<!-- Konuşma notu: BFS ağacı, her düğüm için, ona ilk ulaşan tam olarak bir kenarı kaydeder -- bu, Bölüm 8'in yeniden kullandığı ebeveyn işaretçisidir. -->

---

# BFS, adım adım

<iframe class="dsanim" src="anim/bfs.html?yer=slayt&lang=tr" title="Genişlik öncelikli arama"></iframe>

<!-- Konuşma notu: Normal örnek: 7 düğüm, yönsüz, A'dan başlıyor, 10 kenar -- kuyruğun ve seviye[] satırının birlikte dolmasını izleyin. -->

---

# Uç durum — bağlı olmayan bir çizge

<iframe class="dsanim" src="anim/bfs.html?yer=slayt&lang=tr&example=disconnected" title="BFS: bağlı olmayan çizge"></iframe>

<!-- Konuşma notu: 9 düğüm, 2 bileşen -- G, H, I başlangıç düğümü A'dan basitçe erişilemez ve bütün çalışma boyunca gri kalırlar. -->

---

# Kod — enqueue / dequeue

```c
void enqueue(int v) {
    queue_data[rear] = v;
    rear = (rear + 1) % MAX_V;
    count++;
}
int dequeue(void) {
    int v = queue_data[front];
    front = (front + 1) % MAX_V;
    count--;
    return v;
}
```

<!-- Konuşma notu: Hafta 3'ün tam olarak aynı dairesel kuyruğu -- yalnızca eleman türü değişti, int puanlardan çizge düğüm kimliklerine. -->

---

# Kod — bfs() ana döngüsü

```c
visited[start] = 1;
level_of[start] = 0;
enqueue(start);
while (count > 0) {
    int u = dequeue();
    for (Edge *e = g->adj[u]; e; e = e->next) {
        if (!visited[e->to]) {
            visited[e->to] = 1;
            level_of[e->to] = level_of[u] + 1;
            parent_of[e->to] = u;
            enqueue(e->to);
        }
    }
}
```

<!-- Konuşma notu: Ziyaret edilmemiş her komşu, kuyruğa eklendiği anda işaretlenir, seviyelendirilir ve bir ebeveyn işaretçisi kazanır. -->

---

# Karmaşıklık

- Her düğüm bir kez eklenir, bir kez çıkarılır -- **O(V)**
- Her kenar en fazla iki kez incelenir (her uçtan bir kez) -- **O(E)**
- Toplam: **O(V + E)** -- her liste işleminde gördüğümüz aynı sınır

<!-- Konuşma notu: Bu O(V + E) sınırı, çizge algoritmalarındaki en yaygın karmaşıklık sonucu, ve bu hafta boyunca tekrar tekrar karşımıza çıkıyor. -->

---

# BFS ağacı ve en kısa yollar

- BFS ağacının kök-düğüm yolu **en az kenarı** kullanır
- `level_of[v]`, başlangıçtan tam olarak bu en kısa kenar sayısıdır
- Bu yalnızca **ağırlıksız** çizgelerde geçerlidir -- Bölüm 8 bunu doğrudan kullanır
- Ağırlıklı en kısa yollar Dijkstra algoritmasını gerektirir, Hafta 9

<!-- Konuşma notu: BFS aslında zaten ağırlıksız en kısa yol problemini çözüyor; Bölüm 8 yalnızca bu gerçeği açıkça ortaya koyuyor. -->

---

# Uygulamalar

- "Arkadaşımın arkadaşı" -- Bölüm 4'ün sosyal ağ motivasyonu
- Web'i seviye seviye taramak, önce en yakın sayfalar
- Bulmaca çözücüler: bir labirenti ya da bir kayan bulmacayı en az hamleyle çözmek
- Ağ yayını: her makineye en az sıçramada ulaşmak

<!-- Konuşma notu: Soru "ağırlıklı en kısa mesafe" değil de "en az adım" olduğunda, BFS genellikle başvurulacak ilk doğru araçtır. -->

---

# Sık yapılan hatalar

- Kuyruk yerine bir **yığın** kullanmak -- sessizce derinlik öncelikliye döner
- Bir düğümü **ekleme anında** değil çıkarma anında ziyaret edildi işaretlemek
- Zaten ziyaret edilmiş bir düğümü yeniden eklemek -- iş kaybı, döngü riski

<!-- Konuşma notu: "Ziyaret edildi" işaretini çok geç koymak, en yaygın BFS hatasıdır -- aynı düğüm birden fazla kez eklenebilir. -->

---

# Mini soru

Ağırlıksız bir çizgede, A'dan başlayan BFS `B`'ye
seviye 2 veriyor. A'dan B'ye en kısa yolda kaç
kenar var?

<!-- Konuşma notu: Birkaç slayt önce "seviye"nin tam olarak ne anlama geldiğini hatırlayın. -->

---

# Yanıt

**Tam olarak 2 kenar.** BFS'in seviyesi,
başlangıçtan en az kenar sayısı olarak tanımlanır
-- bu, tam olarak en kısa yol kenar sayısıdır.

<!-- Konuşma notu: Bu, Bölüm 8'in tam bir algoritmaya dönüştürdüğü gerçek: seviye, ağırlıksız çizgeler için en kısa yol uzunluğunun TA KENDİSİDİR. -->

---

<!-- _class: bolum -->

# 5. Derinlik Öncelikli Arama (DFS) — Özyinelemeli

<!-- Konuşma notu: DFS, Hafta 4'ün ön sırasının bir ağaçtan herhangi bir çizgeye genelleşmiş hali -- tek başına özyineleme bütün algoritmayı yürütüyor. -->

---

# Başlangıç sorusu

Bir labirentte çok sayıda dallanan yol var.
Her yönü azar azar keşfetmek yerine, geri
dönmeden önce **tek** bir yola sonuna kadar
bağlı kalsanız ne olur?

<!-- Konuşma notu: "Bağlan, sonra geri dön", derinlik öncelikli aramayı tek cümlede anlatır -- BFS'in halka halka yaklaşımının tam tersi bir strateji. -->

---

# Sezgi — bir labirent, önce derine in

- Bir yön seç, gidebildiği kadar yürü
- Çıkmaz sokak mı? Son seçime geri dön, sıradaki yönü dene
- "Geri dönmek", bir **yığının** (ya da özyinelemenin) sizin için yaptığı şey
- Genişlik değil derinlik öncelikli -- bir dal, tamamen, sonrakinden önce

<!-- Konuşma notu: Özyineleme aslında bir yığındır, Hafta 3'ten -- her özyinelemeli dfs_visit çağrısı bir çerçeve ekler, her dönüş bir çerçeve çıkarır. -->

---

# Renkler ve zamanlar

- **Beyaz** (0): henüz keşfedilmedi
- **Gri** (1): keşfedildi, komşuları hâlâ araştırılıyor
- **Siyah** (2): bitti, her komşu araştırıldı
- `disc[v]` / `fin[v]`: her renk değişiminin gerçekleştiği saat tıkırtısı

<!-- Konuşma notu: Bir düğüm, çağrı yığınında olduğu sürece grıdir -- döndüğü an siyaha döner. -->

---

# Kenar türleri

| Tür | Anlamı |
| --- | --- |
| **Ağaç kenarı** | Yeni, beyaz bir düğüme götürür |
| **Geri kenar** (back edge) | Gri bir **ataya** götürür -- bir döngü! |
| **İleri / çapraz** | Bitmiş, siyah bir düğüme götürür (yalnız yönlü) |

<!-- Konuşma notu: İleri ve çapraz kenarlar yönsüz bir çizgede oluşamaz -- orada bulunan her ağaç-dışı kenar bir geri kenardır. -->

---

# Özyinelemeli DFS, adım adım

<iframe class="dsanim" src="anim/dfs-recursive.html?yer=slayt&lang=tr" title="Özyinelemeli DFS"></iframe>

<!-- Konuşma notu: Normal örnek: 7 düğüm, yönsüz, 4 geri kenar, 10 kenar -- çağrı yığını sütununun ve disc/fin[]'in birlikte dolmasını izleyin. -->

---

# Uç durum — dört kenar türü bir arada

<iframe class="dsanim" src="anim/dfs-recursive.html?yer=slayt&lang=tr&example=hard" title="Özyinelemeli DFS: tüm kenar türleri"></iframe>

<!-- Konuşma notu: 6 düğüm, yönlü, özellikle bir ağaç, bir geri, bir ileri ve bir çapraz kenarın hepsinin tek bir çalışmada görünmesi için kurulmuş. -->

---

# Kod — dfs_visit(): keşif

```c
void dfs_visit(Graph *g, int u) {
    color_of[u] = 1;         /* gri */
    disc_time[u] = ++clock_;
    for (Edge *e = g->adj[u]; e; e = e->next) {
        int v = e->to;
        /* ... v'ye giden kenarı sınıfla ... */
    }
    color_of[u] = 2;         /* siyah */
    fin_time[u] = ++clock_;
}
```

<!-- Konuşma notu: Tek paylaşılan bir saat, hem her keşifte hem her bitişte ilerler -- disc/fin aralıklarının doğru iç içe geçmesini sağlayan budur. -->

---

# Kod — bir kenarı sınıflamak

```c
if (color_of[v] == 0) {
    parent_of[v] = u;
    dfs_visit(g, v);     /* ağaç kenarı */
} else if (color_of[v] == 1) {
    /* geri kenar: v bir ata */
} else {
    /* v siyah: ileri ya da çapraz */
}
```

<!-- Konuşma notu: Üç renk, üç dal -- birkaç slayt önceki kenar sınıflama fikrinin tamamı, tek bir if/else zinciri olarak. -->

---

# Kod — bileşen başına bir ağaç

```c
void dfs(Graph *g) {
    for (int i = 0; i < g->vertex_count; i++)
        color_of[i] = 0;
    for (int i = 0; i < g->vertex_count; i++)
        if (color_of[i] == 0)
            dfs_visit(g, i);
}
```

<!-- Konuşma notu: Bağlı olmayan bir çizgenin DFS'i tek bir ağaç değil bir DFS ORMANI üretir -- bileşen başına bir ağaç, tam olarak Bölüm 7'nin bileşenleri gibi. -->

---

# Karmaşıklık

- Her düğüm beyaz → gri → siyah olarak **bir kez** renklenir -- O(V)
- Her kenar tam bir kez incelenir (yönsüzse iki kez) -- O(E)
- Toplam: **O(V + E)** -- BFS'in sınırıyla aynı

<!-- Konuşma notu: BFS ve DFS tam olarak aynı düğüm ve kenar kümesini ziyaret eder -- yalnızca SIRA değişir, toplam iş asla. -->

---

# Özyineleme derinliği: gizli bir risk

- Her `dfs_visit` çağrısı **çağrı yığınına** bir çerçeve ekler
- Uzun bir zincir çizge, `V` çağrı kadar derinleşebilir
- Çok büyük ya da çok "ipliksi" bir çizge bu yığını **taşırabilir**
- Bölüm 6, tam olarak bunu önlemek için DFS'i açık bir yığınla yeniden kuruyor

<!-- Konuşma notu: Bu varsayımsal değil: bir milyon düğümlük bir zincir çizge, saf özyinelemeli DFS'i pratikte gerçekten çökertebilir. -->

---

# Sık yapılan hatalar

- Doğrudan kendi **ebeveynine** geri giden kenarı atlamayı unutmak
- **Yönlü** bir çizgede her ağaç-dışı kenarı "döngü" saymak
- `color_of`'u sıfırlamadan çalıştırmalar arasında yeniden kullanmak

<!-- Konuşma notu: Yönsüz bir çizgede, doğrudan ebeveyninize giden kenar gerçek bir geri kenar değildir -- az önce geldiğiniz aynı kenardır. -->

---

# Mini soru

Yönsüz bir çizgede, DFS şu anda **gri** olan bir
düğüme giden bir kenar buluyor. Bu, çizge
hakkında ne söyler?

<!-- Konuşma notu: "Gri"nin tam olarak ne anlama geldiğini ve gri bir düğümün şu anda nerede olduğunu hatırlayın. -->

---

# Yanıt

**Çizgede bir döngü var.** Gri bir düğüm hâlâ
çağrı yığınındadır -- şu anki düğümün bir
**atasıdır**, yani bu kenar bir geri kenardır.

<!-- Konuşma notu: Bölüm 2'nin animasyonunda graph-terminology.js'nin döngüyü tam olarak bu şekilde bulduğunu hatırlayın. -->

---

<!-- _class: bolum -->

# 6. DFS — Yinelemeli (Açık Yığın)

<!-- Konuşma notu: Bölüm 5'in özyineleme riski bu bölümü doğrudan motive ediyor: aynı algoritma, aynı ziyaret sırası, ama çağrı yığını yerine kendi dizi tabanlı yığınımızla. -->

---

# Başlangıç sorusu

Bölüm 5 bir uyarıyla bitti: derin özyineleme
çağrı yığınını taşırabilir. *Tam olarak aynı*
dolaşma özyinelemesiz yazılabilir mi?

<!-- Konuşma notu: Evet -- ve teknik, bu dersin daha önce bir kez kullandığı bir teknik: Hafta 4'ün yinelemeli orta sıra dolaşması. -->

---

# Neden yinelemeliye geçmeli

- Özyinelemenin çağrı yığınının sabit bir boyutu var, işletim sistemi belirler
- **Kendi** yığınımız (Hafta 3'ün dizi tabanlısı) ihtiyaca göre boyutlanabilir
- Aynı algoritma, aynı ziyaret sırası -- yalnızca kayıt tutma yer değiştiriyor
- Toplamda bellek tasarrufu yok, yalnızca daha güvenli bir yere taşınıyor

<!-- Konuşma notu: Bu, Hafta 4'ün yinelemeli orta sıra dolaşmasıyla tam olarak aynı motivasyon, şimdi bir ağaç yerine bir çizgeye uygulanıyor. -->

---

# Ters sıra hilesi

- Komşular, özyinelemedeki gibi **alfabetik** sırayla ziyaret edilmeli
- Alfabetik sırayla eklemek onları **tersten** çıkarır
- Çözüm: komşuları **ters** alfabetik sırayla yığına ekle
- Tersten eklenen sıra, çıkarılınca özgün sırayı geri verir

<!-- Konuşma notu: Bu tek hile, "açık bir yığın" ile "özyinelemeyle tam eşleşen açık bir yığın" arasındaki tüm farktır. -->

---

# Yinelemeli DFS, adım adım

<iframe class="dsanim" src="anim/dfs-iterative.html?yer=slayt&lang=tr" title="Yinelemeli DFS"></iframe>

<!-- Konuşma notu: Bölüm 5'le aynı normal örnek: 7 düğüm, yönsüz, 4 geri kenar, 10 kenar -- ziyaret sırası birebir aynı çıkıyor. -->

---

# Uç durum — bir DFS ormanı

<iframe class="dsanim" src="anim/dfs-iterative.html?yer=slayt&lang=tr&example=forest" title="Yinelemeli DFS: orman"></iframe>

<!-- Konuşma notu: 10 düğüm, 2 ayrı bileşen -- ziyaret edilmemiş her düğümden yeni bir yığın başlar, bileşen başına bir ağaç üretir, tam olarak Bölüm 5'teki gibi. -->

---

# Kod — push / pop

```c
void push(int v) { stack_data[++top] = v; }
int  pop(void)   { return stack_data[top--]; }
```

<!-- Konuşma notu: Mümkün olan en yalın dizi tabanlı yığın -- eklemede bir artırma, çıkarmada bir azaltma, başka hiçbir şey yok. -->

---

# Kod — dfs_iterative() ana döngüsü

```c
push(start);
while (top >= 0) {
    int u = pop();
    if (visited[u]) continue;   /* eskimiş kayıt */
    visited[u] = 1;
    for (int i = deg[u] - 1; i >= 0; i--)
        if (!visited[adj[u][i]])
            push(adj[u][i]);
}
```

<!-- Konuşma notu: "if (visited[u]) continue" satırı önemli: bir düğüm birden fazla kez eklenebilir, ve yalnızca İLK çıkarma sayılmalı. -->

---

# Karmaşıklık

- Her düğüm sınırlı sayıda eklenir ve çıkarılır -- O(V)
- Her kenar bir kez incelenir (yönsüzse iki kez) -- O(E)
- Toplam: **O(V + E)** -- özyinelemeli sürümden ne daha iyi ne daha kötü

<!-- Konuşma notu: Asıl amaç hiçbir zaman hız değildi -- özyinelemeli sürümün derin çizgelerde riske attığı bir çağrı yığını taşmasından kaçınmaktı. -->

---

# Özyinelemeli ve yinelemeli, yan yana

| | Özyinelemeli (Böl. 5) | Yinelemeli (Böl. 6) |
| --- | --- | --- |
| Yığın | Çağrı yığını | Kendi dizimiz |
| Ziyaret sırası | Alfabetik | Alfabetik (ters eklenmiş) |
| Derin çizge riski | Taşabilir | Dizi boyutuyla sınırlı |

<!-- Konuşma notu: Aynı sıra, aynı karmaşıklık, aynı çıktı -- bu tablo gerçekte hangi yığının kayıt tuttuğuyla ilgili. -->

---

# Sık yapılan hatalar

- Komşuları ters yerine **düz** alfabetik sırayla eklemek
- Eskimiş-kayıt kontrolünü unutmak -- çift ziyaret, yanlış disc/fin
- Çıkarılan, ziyaret edilmemiş bir düğümün hep yeni keşfedildiğini varsaymak

<!-- Konuşma notu: Eskimiş-kayıt kontrolünü atlamak, özyinelemeyi elle açık bir yığına çevirirken en yaygın hatadır. -->

---

# Mini soru

Bir düğüm, hiçbir çıkarma olmadan, iki farklı
komşudan **iki kez** yığına ekleniyor. Gerçekte
kaç kez ziyaret edilir?

<!-- Konuşma notu: Bir önceki kod slaytındaki eskimiş-kayıt kontrolünün tam olarak neyi önlemek için orada olduğunu hatırlayın. -->

---

# Yanıt

**Bir kez.** İlk `pop()` onu ziyaret eder ve
ziyaret edildi işaretler; ikinci `pop()`,
`visited[u]`'yu zaten doğru bulup atılır.

<!-- Konuşma notu: Bu atma, kodun `if (visited[u]) continue` satırının ele aldığı tam olarak "eskimiş kayıt" durumudur. -->

---

<!-- _class: bolum -->

# 7. Bağlı Bileşenler

<!-- Konuşma notu: Bölüm 7, BFS'in kendisini değiştirmeden bir alt yordam olarak yeniden kullanıyor -- tek yeni fikir, onu ziyaret edilmemiş her düğüm için bir kez çağırmak ve her çalıştırmaya kendi etiketini vermek. -->

---

# Başlangıç sorusu

Bir çizge tek bir bağlı parça olmayabilir --
birkaç ayrı parçadan oluşabilir. Kaç tane?
Hangi düğüm hangi parçaya ait?

<!-- Konuşma notu: Bölüm 1 zaten bir çizgenin bağlı olmak zorunda olmadığını söylemişti; bu bölüm "tam olarak ne kadar bağlı değil?" sorusunu yanıtlıyor. -->

---

# Fikir

- Ziyaret edilmemiş her düğüm, yeni bir kimlikle **yeni** bir BFS başlatır
- O BFS, **erişebildiği her şeyi** aynı kimlikle etiketler
- Kuyruk boşalınca, ziyaret edilmemiş bir sonraki düğüm başlar
- Yön **göz ardı edilir** -- bu, **zayıf** bağlılığı bulur

<!-- Konuşma notu: "Zayıf" bağlılık, yalnızca bu tek soru için, her yönlü kenarı yönsüzmüş gibi ele almak demektir. -->

---

# Bağlı bileşenler, adım adım

<iframe class="dsanim" src="anim/connected-components.html?yer=slayt&lang=tr" title="Bağlı bileşenler"></iframe>

<!-- Konuşma notu: Normal örnek: 10 düğüm, yönsüz, 2 bileşen (iki ayrı 5-döngüsü), 10 kenar -- her BFS'in kendi çemberini almasını izleyin. -->

---

# Uç durum — birçok küçük bileşen

<iframe class="dsanim" src="anim/connected-components.html?yer=slayt&lang=tr&example=many" title="Bağlı bileşenler: birçok küçük"></iframe>

<!-- Konuşma notu: 12 düğüm, yönsüz, 4 ayrı üçgen bileşen, 12 kenar -- bu bölümün animasyonunun aynı anda gösterdiği en fazla bileşen sayısı. -->

---

# Kod — bfs_label()

```c
void bfs_label(Graph *g, int start, int id) {
    int q[MAX_V], front = 0, rear = 0;
    comp_of[start] = id;
    q[rear++] = start;
    while (front < rear) {
        int u = q[front++];
        for (Edge *e = g->adj[u]; e; e = e->next)
            if (comp_of[e->to] == -1) {
                comp_of[e->to] = id;
                q[rear++] = e->to;
            }
    }
}
```

<!-- Konuşma notu: Bu, Bölüm 4'ün yalın BFS'i, hiç değişmeden -- yalnız "ziyaret edildi" artık "comp_of == -1" oldu ve bırakılan iz true/false değil bir kimlik. -->

---

# Kod — count_components()

```c
int count_components(Graph *g) {
    int next_id = 0;
    for (int i = 0; i < g->vertex_count; i++)
        comp_of[i] = -1;
    for (int i = 0; i < g->vertex_count; i++)
        if (comp_of[i] == -1)
            bfs_label(g, i, next_id++);
    return next_id;
}
```

<!-- Konuşma notu: next_id hem bileşenleri sayar HEM de her yeni bileşenin etiketi olur -- tek bir değişken, iki görev. -->

---

# Karmaşıklık

- Her düğüm tam olarak bir `bfs_label` çağrısına girer -- O(V)
- Her kenar, tüm çağrılar boyunca toplamda en fazla iki kez incelenir -- O(E)
- Toplam: **O(V + E)** -- bileşen başına bir kez çalıştırılan tek bir BFS'in maliyeti

<!-- Konuşma notu: BFS'i birkaç kez, bileşen başına bir kez çalıştırmak, yine de bütün çizge üzerinde tek bir BFS ile aynı O(V + E) toplamına ulaşır. -->

---

# Uygulamalar

- Sosyal ağlar: hangi arkadaş çevreleri var, kim hangisinde
- Görüntü işleme: hangi piksellerin tek bir bağlı bölge oluşturduğu
- Ağ: hangi makinelerin şu an birbirine erişebildiği
- Bulmaca oyunları: "flood fill" -- boya kovası aracı, esasen

<!-- Konuşma notu: Flood fill özellikle anılmaya değer -- bir çizge düğümü yerine bir piksel ızgarası üzerinde çalışan tam olarak bu algoritmadır. -->

---

# Sık yapılan hatalar

- Burada yönün **göz ardı edildiğini** unutmak -- bu zayıf bağlılıktır
- `comp_of` değerlerini sıfırlamadan ayrı çizgeler arasında yeniden kullanmak
- Tek düğümlü bir çizgenin **sıfır** bileşeni olduğunu varsaymak -- bir tane vardır

<!-- Konuşma notu: Güçlü bağlılık (yönü dikkate alan), yalın BFS'den fazlasını gerektiren, gerçekten daha zor bir problem -- bu haftanın kapsamı dışında. -->

---

# Mini soru

Yönlü bir çizgede `A>B` kenarı var ama `B>A`
yok. Zayıf anlamda, `A` ve `B` aynı bileşende mi?

<!-- Konuşma notu: Birkaç slayt önce "yön göz ardı edilir"in tam olarak ne anlama geldiğini hatırlayın. -->

---

# Yanıt

**Evet.** Zayıf bağlılık yönü tamamen göz ardı
eder, o yüzden yalnızca `A>B` bile `A` ve `B`'yi
aynı bileşene koymaya yeter.

<!-- Konuşma notu: Güçlü bağlılık hem A>B'yi HEM de B'den A'ya geri bir yolu gerektirirdi -- daha katı, tamamen farklı bir soru. -->

---

<!-- _class: bolum -->

# 8. Ağırlıksız Çizgelerde En Kısa Yol

<!-- Konuşma notu: Bölüm 4 zaten her düğümün seviyesini hesaplamıştı; bu bölüm yalnızca uzunluğu değil gerçek en kısa yolu yeniden kurarak bu gerçeği tam olarak açık hale getiriyor. -->

---

# Başlangıç sorusu

BFS zaten `A`'dan her düğüme en az kaç kenarla
gidileceğini biliyor. **Tam güzergâhı** da --
yalnızca uzaklığı değil -- bildirebilir mi?

<!-- Konuşma notu: Evet -- ve mekanizma zaten BFS'in çıktısının içinde oturuyor: her düğüme ilk ulaşıldığı anda kaydedilen ebeveyn işaretçisi. -->

---

# Fikir

- `s`'den BFS çalıştır, her düğümün her zamanki gibi **ebeveynini** kaydet
- `t`'ye giden yolu bulmak için: `t`'den başla, `ebeveyn`i geriye izle
- `s`'ye ulaşınca dur -- sonra toplanan listeyi **tersine çevir**
- Sonuç, kenar sayısına göre en kısa `s`-`t` yoludur

<!-- Konuşma notu: Burada yeni bir mekanizma yok -- Bölüm 4'ün BFS'i, artı zaten kurduğu ebeveyn işaretçilerinde geriye doğru kısa bir yürüyüş. -->

---

# BFS ile yol bulma, adım adım

<iframe class="dsanim" src="anim/path-finding-bfs.html?yer=slayt&lang=tr" title="BFS ile en kısa yol"></iframe>

<!-- Konuşma notu: Normal örnek: 7 düğüm, yönsüz, s=A, t=F, 10 kenar -- BFS sırasında ebeveyn[]'in dolmasını, sonunda geriye izlenmesini gözlemleyin. -->

---

# Uç durum — hiçbir yol yok

<iframe class="dsanim" src="anim/path-finding-bfs.html?yer=slayt&lang=tr&example=no-path" title="En kısa yol: yol yok"></iframe>

<!-- Konuşma notu: 9 düğüm, s=A, t=H, 2 ayrı bileşende -- kuyruk boşalır ve t hiç ziyaret edilmez, o yüzden hiçbir yol bildirilemez. -->

---

# Kod — bfs_shortest_path(): arama

```c
visited[s] = 1;
queue_data[rear++] = s;
while (front < rear) {
    int u = queue_data[front++];
    for (Edge *e = g->adj[u]; e; e = e->next)
        if (!visited[e->to]) {
            visited[e->to] = 1;
            parent_of[e->to] = u;
            queue_data[rear++] = e->to;
        }
}
```

<!-- Konuşma notu: Bölüm 4'ün BFS döngüsüyle birebir aynı, tek farkla: bu sürümün TEK amacı parent_of'u doğru doldurmak. -->

---

# Kod — yolu geriye izlemek

```c
if (!visited[t]) return -1;      /* yol yok */
int len = 0, v = t;
while (v != s) {
    path_out[len++] = v;
    v = parent_of[v];
}
path_out[len++] = s;
/* ... path_out[0..len)'i yerinde tersine çevir ... */
return len - 1;                  /* kenar sayısı */
```

<!-- Konuşma notu: Yürüyüş yolu geriye, t'den s'ye doğru kurar, çünkü ebeveyn işaretçilerinin gittiği tek yön budur -- sonunda tersine çevirmek sırayı düzeltir. -->

---

# Karmaşıklık

- BFS'in kendisi: Bölüm 4'teki gibi tam olarak **O(V + E)**
- Yolu geriye izlemek: **O(yol uzunluğu)**, en fazla O(V)
- Toplam: yine **O(V + E)** -- geriye izleme hiçbir zaman baskın olmaz

<!-- Konuşma notu: Gerçek yolu yeniden kurmak, zaten çoğu zaman çalıştırıyor olacağınız bir BFS'in üstüne neredeyse bedavaya geliyor. -->

---

# Birden çok en kısa yol olabilir

- BFS **bir** en kısa yol bildirir, mutlaka tek yol değildir
- Farklı bir komşu ziyaret sırası, eşit uzunlukta farklı bir yol üretebilir
- Bütün doğru en kısa yollar aynı **uzunluğu** paylaşır, aynı güzergâhı değil

<!-- Konuşma notu: Yalnızca UZUNLUK garantili biçimde tekildir -- tam düğüm dizisi, alfabetik sıra gibi eşit-kırma seçimlerine bağlıdır. -->

---

# Önizleme: ağırlıklı çizgeler Dijkstra ister

- Bu bölüm yalnızca her kenarın gizlice ağırlığı 1 olduğu için çalışıyor
- **Ağırlıklı** bir çizge kenar sayısını değil gerçek mesafeleri karşılaştırmalı
- **Dijkstra algoritması** (Hafta 9) bunu bir **öncelik kuyruğuyla** çözer
- O öncelik kuyruğu, Hafta 4'ün bir yığından (heap) kurduğu ta kendisi

<!-- Konuşma notu: BFS'in yalın kuyruğu her zaman kenar sayısına göre en yakın ZİYARET EDİLMEMİŞ düğümü genişletir; Dijkstra bunun yerine bir öncelik kuyruğu koyar ve gerçek mesafeye göre genişletir. -->

---

# Sık yapılan hatalar

- Yolu geriye izlemeden önce `visited[t]`'yi kontrol etmeyi unutmak
- `ebeveyn`i geriye değil, `t`'den `s`'ye doğru ileriye izlemek
- Son tersine çevirmeyi unutmak -- yol `t`'den `s`'ye doğru yazdırılır

<!-- Konuşma notu: Bu üç hatanın her biri çökmeden çalışmaya devam eder -- hata yalnızca yazdırılan yolun kendisinde ortaya çıkar. -->

---

# Mini soru

`s`'den başlayan BFS `t`'yi hiç ziyaret etmiyor.
`bfs_shortest_path` ne döndürmeli, ve neden?

<!-- Konuşma notu: Geriye izleme kodunun yaptığı ilk kontrolü, birkaç slayt önce, hatırlayın. -->

---

# Yanıt

**`-1`.** `t` hiç ziyaret edilmediyse hiç yol
yok demektir -- `visited[t]` kontrolü, herhangi
bir geriye izleme başlamadan tam olarak bu
durumu yakalar.

<!-- Konuşma notu: Bu, yukarıdaki "yol yok" uç durum animasyonunun göstermek için kurulduğu durumun ta kendisi. -->

---

# Özet — terimler ve gösterimler

| Fikir | Anahtar gerçek |
| --- | --- |
| Çizge | `V` düğüm, `E` kenar, yönlü ya da değil |
| Derece | Yönsüz: tek değer; yönlü: gelen ve giden |
| Matris | O(V²) bellek, O(1) `has_edge` |
| Liste | O(V + E) bellek, O(derece) `has_edge` |

<!-- Konuşma notu: İki gösterim, bir takas tablosu -- sonraki her algoritmanın karmaşıklığı bu satıra dayanıyor. -->

---

# Özet — dolaşmalar ve uygulamalar

| Fikir | Anahtar gerçek |
| --- | --- |
| BFS | Kuyruk, seviye sırası, ağırlıksız en kısa yol |
| DFS (özyinelemeli / yinelemeli) | Yığın, önce derin, her iki yolda da aynı sıra |
| Bileşenler | Tekrarlanan BFS, erişilebilir küme başına bir etiket |
| En kısa yol | BFS + ebeveyn işaretçileri, geriye izlenir |

<!-- Konuşma notu: Bu dört satırın her biri aynı iki hareketten kuruludur: ekle/çıkar (kuyruk), ya da it/çek (yığın). -->

---

# Büyük resim

Bir ağacın "tek kök, döngü yok" kuralını
kaldırın, bir çizge elde edersiniz. İki yapı onu
saklar; iki dolaşma, BFS ve DFS, onu keşfeder;
ikisi de gerçek sorulara yanıt verir -- bileşenler, mesafe.

<!-- Konuşma notu: Bir öğrenci bugünden yalnızca bir cümle hatırlayacaksa, hatırlamaya değer olan bu. -->

---

# Öz-değerlendirme turu

Dört kısa soru. Yanıt bir sonraki slaytta
görünmeden önce düşünün. Tam alıştırmalar
ve on soruluk bir sınav hafta notlarında.

<!-- Konuşma notu: Bunlar, yazılı notların sonundaki öz-değerlendirme sınavını yansıtıyor, burada slayt başına bir soru, daha kısa bir seçkiyle. -->

---

# 1. Bir çizgede 6 düğüm var ve tam çizge (her çift bağlı). Kaç kenarı var?

<!-- Konuşma notu: Sor, bekle, sonra devam et. -->

---

# `6 * 5 / 2 = 15` kenar -- çizge yönsüz olduğundan her çift bir kez sayılır.

<!-- Konuşma notu: n düğümlü, yönsüz bir tam çizgenin her zaman n(n-1)/2 kenarı vardır. -->

---

# 2. BFS neden yığın yerine kuyruğa ihtiyaç duyar?

<!-- Konuşma notu: Bölüm 4'ün gölete atılan taş sezgisini hatırlayın. -->

---

# Bir kuyruğun FIFO sırası en yakın düğümleri önce ziyaret eder; bir yığın hemen derine giderdi, yani DFS olurdu.

<!-- Konuşma notu: Yalnızca veri yapısını değiştirmek, bu iki dolaşma sırası arasındaki tüm farktır. -->

---

# 3. DFS sırasında bir "geri kenar" bulmak çizge hakkında ne söyler?

<!-- Konuşma notu: Bölüm 5'in kenar türü tablosunu hatırlayın. -->

---

# Çizgede bir döngü vardır -- bir geri kenar her zaman çağrı yığınında hâlâ olan gri bir ataya işaret eder.

<!-- Konuşma notu: Bu, graph-terminology.js'in Bölüm 2'de döngüyü bulmak için kullandığı tam olarak aynı teknik. -->

---

# 4. Bağlı bileşenler yönlü bir çizgeyi sanki yönsüzmüş gibi ele alır. Buna ne denir?

<!-- Konuşma notu: Birkaç slayt önce Bölüm 7'nin terimini hatırlayın. -->

---

# Zayıf bağlılık -- yön göz ardı edilir; geriye bir yolu da gerektiren güçlü bağlılık daha zor, farklı bir sorudur.

<!-- Konuşma notu: Bu ayrımı tam olarak hatırlamaya değer, çünkü ikisi aynı çizgede gerçekten farklı yanıtlar verir. -->

---

<!-- _class: baslik -->

# Gelecek hafta

**Hafta 6 — Arama ve Karma Tablolar**

BFS ve DFS bir şey bulmak için bütün çizgeyi
dolaşır. Ya bir öğeye doğrudan, neredeyse
O(1) sürede ulaşabilseydiniz?

<!-- Konuşma notu: Karma tablolar (hashing), bu haftanın "her şeyi keşfet" fikrini tamamen farklı bir fikirle takas ediyor: nereye bakacağını tek adımda tam olarak hesapla. -->

---

# Kaynaklar (1/2)

- Ders izlencesi, Hafta 5: `docs/syllabus/syllabus.tr.md`
- Cormen, Leiserson, Rivest, Stein. *Introduction to
  Algorithms*, 4. baskı. MIT Press
- Sedgewick, Wayne. *Algorithms*, 4. baskı. Addison-Wesley
- Euler, L. (1736). *Solutio problematis ad geometriam
  situs pertinentis*

<!-- Konuşma notu: Bunlar, haftanın yazılı notlarının sonunda listelenen aynı kaynaklar. -->

---

# Kaynaklar (2/2)

- Moore, E. F. (1959). "Labirentte en kısa yol"
- Hopcroft, J., Tarjan, R. (1973) -- DFS kenar sınıflaması
- Knuth. *The Art of Computer Programming, Cilt 1*, 3. baskı
- williamfiset/Algorithms · Programiz DSA

<!-- Konuşma notu: Tarihsel kaynaklar -- Euler, Moore, Hopcroft ve Tarjan -- bugünkü "kısa tarihçe" slaytlarının dayandığı kaynaklardı. -->
