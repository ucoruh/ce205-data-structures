---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Veri Yapıları — Ön Gereksinimler"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Ön Gereksinimler"
footer: "RTEÜ Bilgisayar Mühendisliği · 2026-2027 Güz"
---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Ön Gereksinimler

**CEN207 Veri Yapıları — ilk güne ne getirmeli**

Dr. Öğr. Üyesi Uğur CORUH · 2026-2027 Güz

<!-- Speaker note: Bu sunum Ön Gereksinimler sayfasını izler; sondaki "Kendinizi sınayın" görevleri o sayfayla aynıdır. -->

---

# Bu neden önemli — 1. haftadan itibaren

- İlk haftadan itibaren **kendi bilgisayarınızda program yazıyor, derliyor ve test ediyorsunuz**
- Vize projesi için önce **C**, final projesi için ardından **Java**
- Çalışmanızı baştan sona **Git ve GitHub** üzerinde yürütüyorsunuz
- Bu yüzden bu sunumdaki bilgi ve araçlarla gelmeniz gerekir

<!-- Speaker note: Bu bir "olsa iyi olur" listesi değil — 1. haftanın C atölyesi bunların hazır olduğunu varsayar. -->

---

# Resmî ön koşullar

- **CEN107 Algoritmalar ve Programlama I**
- **CEN108 Algoritmalar ve Programlama II**

CEN107'nin ilk haftalarında öğretilen geliştirme ortamı, Git, birim test
ve şablon kullanımı bu derste **bilindiği varsayılarak** kullanılır.

**İlk dersten önce:** bu sunumun sonundaki kendinizi sınama görevlerini
kendi bilgisayarınızda çözün.

<!-- Speaker note: Bir görevde takılırsanız çözüm, ilgili CEN107/CEN108 konusuna dönmektir, görevi atlamak değil. -->

---

<!-- _class: bolum -->

# 1. CEN107/CEN108'den gelenler

<!-- Speaker note: Beş konu, her biri CEN107/CEN108'de zaten öğretilmiş ve bu ders 1. haftadan itibaren yeniden kullanıyor. -->

---

# Geliştirme ortamı

- Derleyici (GCC/Clang/MSVC), IDE, Windows'ta WSL, CMake ile derleme
- Öğretildiği yer: **CEN107 Hafta 2 — Geliştirme ortamları**
- Burada kullanıldığı yer: 1. haftanın C atölyesi; vize (C) projesinin kurulumu

<!-- Speaker note: Bu hazır değilse, 1. haftanın C atölyesi daha başlamadan zorlu geçer. -->

---

# Git ve GitHub

- Depo oluşturma, `clone`, `commit`, dal (branch), `pull request`, `.gitignore`
- Öğretildiği yer: **CEN107 Hafta 3 — Git ile sürüm yönetimi**
- Burada kullanıldığı yer: proje rehberinin iş akışı (şablondan depo, plan, teslim) — her iki kontrol noktası için

<!-- Speaker note: Hem vize hem final kontrol noktası, kısmen Git'in gerçekten nasıl kullanıldığına göre notlandırılır, yalnızca son koda göre değil. -->

---

# Birim test ve kapsam araçları

- Test yazma, çalıştırma, kapsam (coverage) raporu okuma
- Öğretildiği yer: **CEN107 Hafta 4 — Birim test ve kütüphaneler**
- Burada kullanıldığı yer: vize rubriği (GoogleTest, gcov/lcov) ve final rubriği (JUnit 5, JaCoCo)

<!-- Speaker note: %100 test kapsamı proje rehberinde sert bir kabul koşuludur — bu beceri buradan geliyor. -->

---

# Proje şablonlarının kullanımı

- Şablondan özel depo oluşturmak ("Use this template", fork değil), derlemek, testlerini ve dokümantasyonunu üretmek
- Öğretildiği yer: **CEN107 Hafta 2–4**
- Burada kullanıldığı yer: proje rehberindeki `cpp-cmake-ctest-template` (vize) ve `eclipse-java-maven-template` (final)

<!-- Speaker note: Şablon; derleme, test, dokümantasyon ve kapsamı zaten bağlamış durumda — sıfırdan kurmuyorsunuz, üzerine ekliyorsunuz. -->

---

# Temel algoritma analizi ve özyineleme

- İşlem sayısını saymak, basit bir özyinelemeli fonksiyon yazmak
- Öğretildiği yer: **CEN108, ilk haftalar**
- Burada kullanıldığı yer: 1. haftada Big-O hatırlatması; 3. haftadan itibaren özyinelemeli çözümler (Hanoi Kuleleri, DFS, ağaç dolaşımları, birleştirmeli/hızlı sıralama)

<!-- Speaker note: Özyineleme "3. hafta konusu" değildir — bu ders boyunca, dosya organizasyonuna kadar tekrar tekrar başvurulan bir araçtır. -->

---

<!-- _class: bolum -->

# 2. C ve Java programlama temelleri

<!-- Speaker note: Vize projesi C, final projesi Java — işlenen veri yapılarının neredeyse tamamı doğrudan bu yapı taşları üzerine kurulur. -->

---

# C temelleri (vize projesi)

- İşaretçiler ve işaretçi aritmetiği (`int *p;`, `p + 1`, `p` ile `*p` farkı)
- Diziler: tanımlama, indeksleme, fonksiyona geçirme
- `struct` tanımları; alanları bir arada tutmak (örn. bağlı liste düğümü)
- Dinamik bellek: `malloc`/`free`, her `malloc`'un neden bir `free` gerektirdiği
- Özyineleme: kendini çağıran bir fonksiyon, taban durumuyla birlikte
- Dosya G/Ç, özellikle **binary dosyalar** (`"rb"`/`"wb"` ile `fopen`, `fread`, `fwrite`)

<!-- Speaker note: İlk derse gelmeden önce bunların hepsini rahatça hem okuyup hem yazabilmelisiniz, yalnızca tanımanız değil. -->

---

# Java temelleri (final projesi)

- Sınıflar ve nesneler: alanlar, yapıcılar (constructor), metotlar, `this`
- Jenerik temelleri: `List<T>` kullanmak, basit bir jenerik sınıf/metot tanımlamak
- İstisnalar: `try`/`catch`/`finally`, denetimli/denetimsiz istisna farkı

<!-- Speaker note: Final projesi her C veri yapısını jenerik kullanarak Java'ya taşır — bu kısa liste tam olarak o taşıma için gerekli olan şey. -->

---

# 3. Derste kısaca hatırlatılanlar

Ayrıntısıyla hatırlamasanız sorun değil — 1. hafta, kullanılmadan önce
kısa bir hatırlatma yapar.

| Ön bilgi | Hangi haftada gerekiyor? |
| --- | --- |
| Big-O gösterimi: işlem sayısını saymak, büyüme hızlarını karşılaştırmak | 1. hafta, ardından veri yapılarını karşılaştırmak için her hafta |
| Bellek yerleşimi: yığın (stack) ve heap | 1. hafta, ardından işaretçi/dinamik bellek kullanılan her yerde |

<!-- Speaker note: Bu ikisi hatırlatılır, soğuktan bilindiği varsayılmaz — sunumun geri kalanı ise varsayılıyor. -->

---

<!-- _class: bolum -->

# 4. Bilgisayarınızda kurulu olması gerekenler

<!-- Speaker note: Dizüstü bilgisayar gereklidir — ilk derse bunların hepsi kurulu olarak gelin. -->

---

# Gerekli araç zinciri

- C derleyicisi: Windows'ta **Visual Studio 2022** (C++ ile masaüstü geliştirme), Linux/WSL/macOS'ta **GCC**/**Clang**
- **CMake** — vize şablonu bununla derlenip test edilir
- C kapsam aracı: Linux/WSL'de **gcov**/**lcov**, Windows'ta MSVC ile **OpenCppCoverage**
- **Doxygen** — proje dokümantasyonunu üretir
- **JDK 21** ve **Maven** — Maven, JUnit 5 ve JaCoCo'yu otomatik getirir
- **Git** ve bir **GitHub** hesabı

Kurulum adımları ve proje şablonlarının kendisi: **proje rehberi**.

<!-- Speaker note: Bunların hepsi ücretsiz ve platformlar arası — hazır gelmenin önünde bir lisans engeli yok. -->

---

<!-- _class: bolum -->

# 5. İlk dersten önce kendinizi sınayın

<!-- Speaker note: Sekiz görev. Her birini önce kendi bilgisayarınızda deneyin, sonra bir sonraki slaytta cevaba bakın. -->

---

# Görev 1 — Derleyip tahmin edin

Bu program ne yazdırır?

```c
int x = 5;
int *p = &x;
*p = *p + 1;
printf("%d %d\n", x, *p);
```

<!-- Speaker note: Cevabı görmeden önce p ile x'in gerçekte neyi paylaştığını düşünün. -->

---

# Görev 1 — Cevap

```text
6 6
```

`p`, `x`'in adresini tutar; bu yüzden `*p` ile `x` aynı bellek konumunu
gösterir. Birini değiştirmek diğerini de değiştirir.

<!-- Speaker note: Bütün dersin üzerine kurulduğu tek fikir bu: bir işaretçi ile işaret ettiği değişken aynı bellektir. -->

---

# Görev 2 — İşaretçi aritmetiği

`int arr[4] = {10, 20, 30, 40}; int *p = arr;` verildiğinde, `*(p + 2)`
ve `p[2]` ifadelerinin değeri nedir?

<!-- Speaker note: İki gösterim de tam olarak aynı bellek erişimini tanımlar. -->

---

# Görev 2 — Cevap

İkisi de `30`. `p[2]`, tanım gereği `*(p + 2)` anlamına gelir — dizi
indeksleme, farklı yazılmış işaretçi aritmetiğinden başka bir şey değildir.

<!-- Speaker note: Bu eşdeğerlik, C fonksiyon imzalarında dizi ve işaretçilerin neden birbirinin yerine geçebilir göründüğünü açıklar. -->

---

# Görev 3 — Hatayı bulun

```c
int *make_array(int n) {
    int arr[n];
    for (int i = 0; i < n; i++) arr[i] = i * i;
    return arr;
}
```

Ne yanlış, nasıl düzeltirsiniz?

<!-- Speaker note: arr'ın gerçekte nerede yaşadığını ve fonksiyon döndüğü anda o belleğe ne olduğunu sorun. -->

---

# Görev 3 — Cevap

`arr`, **yığın (stack)** üzerinde yaşayan yerel bir dizidir; fonksiyon
döndüğünde yok olur, dolayısıyla dönen işaretçi **sahipsiz (dangling)**
kalır. Çözüm, **heap** üzerinde ayırmaktır —

```c
int *arr = malloc(n * sizeof(int));
```

— ve çağıranın, ihtiyaç kalmadığında `free` ile serbest bırakmasıdır.

<!-- Speaker note: "Dangling pointer" tam olarak Yığınlar ve Kuyruklar sunumunun 1. Hafta hatırlatma slaytında adlandırılan hata. -->

---

# Görev 4 — Yapı (struct) ve özyineleme

`struct Node { int value; struct Node *next; };` tanımlayın; düğüm
sayısını döndüren özyinelemeli `int length(struct Node *head)` yazın.

`length(NULL)` ne döndürür ve özyineleme neden orada durur?

<!-- Speaker note: Bu, 2–3. haftalardaki her bağlı liste fonksiyonunun alacağı tam biçim. -->

---

# Görev 4 — Cevap

```c
int length(struct Node *head) {
    if (head == NULL) return 0;
    return 1 + length(head->next);
}
```

`length(NULL)` `0` döndürür — **taban durum (base case)**; bu olmadan
özyineleme hiç durmaz.

<!-- Speaker note: Bu derste her özyinelemeli fonksiyon tam olarak bu biçimi alır: bir taban durum, sonra kesinlikle daha küçük bir problem üzerinde çağrı. -->

---

# Görev 5 — Binary dosya G/Ç

```c
int values[3] = {1, 2, 3};
FILE *f = fopen("data.bin", "wb");
fwrite(values, sizeof(int), 3, f);
fclose(f);
```

`data.bin` kaç bayt içerir, neden?

<!-- Speaker note: Bunu, metin üretecek olan fprintf ile karşılaştırın. -->

---

# Görev 5 — Cevap

`3 * sizeof(int)` bayt — günümüz masaüstü platformlarının neredeyse
tamamında **12 bayt**. `fwrite`, dizinin ham baytlarını doğrudan dosyaya
kopyalar; `fprintf`'in aksine metin biçimlendirmesi yoktur.

<!-- Speaker note: Dosya organizasyonu (13–14. hafta), tam olarak aynı fwrite/fread örüntüsü üzerine kurulur, yalnızca int yerine kayıtlarla. -->

---

# Görev 6 — Java jenerikleri

```java
List<Integer> numbers = new ArrayList<>();
numbers.add(10);
numbers.add(20);
int sum = 0;
for (int n : numbers) { sum += n; }
System.out.println(sum);
```

Bu program ne yazdırır?

<!-- Speaker note: List<Integer>'ın neyi kısıtladığını ve for-each döngüsünün onunla ne yaptığını düşünün. -->

---

# Görev 6 — Cevap

```text
30
```

`List<Integer>`, yalnızca `Integer` elemanlarına izin veren jenerik bir
koleksiyondur; for-each döngüsü her elemanı okuyup `sum`'a ekler.

<!-- Speaker note: Final projesinin F1 gereksinimi, her C yapısını tam olarak bu türden bir jenerik kullanarak Java'ya taşır. -->

---

# Görev 7 — Java istisnaları

```java
try {
    System.out.println("A");
    throw new RuntimeException("boom");
} catch (RuntimeException e) {
    System.out.println("B");
} finally {
    System.out.println("C");
}
```

Üç harf hangi sırayla yazdırılır?

<!-- Speaker note: "finally"in, istisna fırlatılsın ya da fırlatılmasın neyi garanti ettiğini düşünün. -->

---

# Görev 7 — Cevap

```text
A
B
C
```

İstisna, eşleşen `catch` tarafından hemen yakalanır (`B`); `finally` ise
istisna fırlatılsın ya da fırlatılmasın her zaman çalışır (`C`).

<!-- Speaker note: Bu try/catch/finally biçimi, final projesinin dosya işleme kodunda yeniden karşınıza çıkar. -->

---

# Görev 8 — İki araç zincirini de derleyip test edin

**C araç zinciri:** `gcc --version` · `cmake --version` ·
`cpp-cmake-ctest-template`'i klonlayın ·
`cmake -S . -B build && cmake --build build` · `ctest --test-dir build`

**Java araç zinciri:** `java -version` · `mvn -version` ·
`eclipse-java-maven-template`'i klonlayın · `mvn test`

<!-- Speaker note: Bunlar proje rehberinde vize ve final kontrol noktaları için adı geçen tam olarak aynı iki şablon. -->

---

# Görev 8 — Başarı nasıl görünür

- `ctest`: **100% tests passed**
- Maven: **BUILD SUCCESS**, `Failures: 0`
- Her iki araç zincirinde de yol boyunca hiçbir derleyici hatası yok

Biri başarısız olursa: "Kurulu olması gerekenler"e dönün, eksik aracı
kurun, ilk dersten önce yeniden deneyin.

<!-- Speaker note: Sorunsuz bir 1. haftanın en iyi göstergesi, iki şablonda da önceden alınmış yeşil bir sonuçtur. -->

---

<!-- _class: baslik -->

# Derse hazırsınız

Sekiz görevin de mantıklı geldiyse ve iki araç zinciri de hatasız derlenip
test edildiyse hazırsınız.

**Sırada:** haftalık programı gösteren **izlence** ve her kontrol
noktasının tam rubriğini içeren **proje rehberi**.

<!-- Speaker note: Bu iki sayfa/sunum, buradan sonraki doğal durak. -->
