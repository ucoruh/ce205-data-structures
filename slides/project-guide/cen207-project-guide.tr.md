---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Veri Yapıları — Proje Rehberi"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Proje Rehberi"
footer: "RTEÜ Bilgisayar Mühendisliği · 2026-2027 Güz"
---

<!-- _class: baslik -->
<!-- _paginate: false -->

# CEN207 Dönem Projesi

**Proje Rehberi — 2026-2027 Güz**

Dr. Öğr. Üyesi Uğur CORUH

<!-- Speaker note: Bu sunum, proje rehberi sayfasını bölüm bölüm izler — hızlı başvuru sürümü olarak düşünün. -->

---

# Tek proje, iki kez

- Bu dönem **tek bir proje**: listeden seçtiğiniz bir uygulama
- Derste öğrenilen veri yapıları ve algoritmalarla **iki kez** gerçekleştirilir
- Önce **C** ile (vize kontrolü), sonra genişletilerek **Java** ile (final kontrolü)
- Amaç: "neden bu yapıyı seçtim?" sorusunu **sayılarla** yanıtlamak — karmaşıklık ve ölçüm, görüş değil

<!-- Speaker note: C ve Java sürümleri iki ayrı proje değildir — Java sürümü aynı uygulamayı genişletir. -->

---

# Kısaca — takım ve kontroller

- **Takım:** en çok 5 kişi (tek başınıza da olur)
- Bir konuyu **yalnız bir takım** alır; 3. haftadan sonra takım değişmez
- **Vize kontrolü (RAP1):** C gerçekleştirimi, rapor, gösterim — 7. hafta, 30.10.2026 — vizenin %60'ı
- **Final kontrolü (RAP2):** Java gerçekleştirimi, rapor, gösterim — 15. hafta, 25.12.2026 — finalin %70'i

<!-- Speaker note: Bu sunumdaki her soru, sonunda bu dört bilgiye dayanıyor. -->

---

# Kısaca — araçlar, kapsam, son tarihler

- **Araçlar:** CMake + GoogleTest + Doxygen (C); JDK 21 + Maven + JUnit 5 (Java); Git ve GitHub
- **Kapsam:** her konuda bütün gereksinim kodları (V1–V6, F1–F9) zorunludur
- Konu kutusu, her kodun o uygulamada neyi temsil ettiğini söyler
- **Son tarihler:** konu/takım seçimi 3. hafta sonuna kadar (04.10.2026); plan onayı 4. haftada (09.10.2026)

<!-- Speaker note: "Her konuda zorunlu" kilit ifade — konu hikâyeyi değiştirir, gereksinim listesini değil. -->

---

<!-- _class: bolum -->

# 1. Takvim

<!-- Speaker note: Altı aşama; haftalık planın tamamı izlencededir. -->

---

# Proje takvimi

| Aşama | Hafta | Tarih |
| --- | --- | --- |
| Konu ve takım seçimi | 3. hafta sonu | 04.10.2026 |
| Proje planı onayı | 4. hafta | 09.10.2026 |
| Vize gösterimi + ara rapor (RAP1) | 7. hafta | 30.10.2026 |
| Quiz-1 | 8. hafta | 31.10–08.11.2026 |
| Final gösterimi + final raporu (RAP2) | 15. hafta | 25.12.2026 |
| Quiz-2 | 16. hafta | 04–17.01.2027 |

<!-- Speaker note: Haftalık planın tamamı izlencededir — bu yalnızca projenin kendi aşamaları. -->

---

<!-- _class: bolum -->

# 2. Değerlendirme Yapısı

<!-- Speaker note: İzlencedeki aynı formüller, şimdi her kontrolün hangi ÖÇ'leri ölçtüğüyle eşleştirilmiş. -->

---

# Proje not hesabını nasıl besliyor

$$
Not_{Vize} = 0{,}6 \cdot RAP1 + 0{,}4 \cdot Quiz\text{-}1
$$

$$
Not_{Final} = 0{,}7 \cdot RAP2 + 0{,}3 \cdot Quiz\text{-}2
$$

$$
Başarı\ notu = 0{,}4 \cdot Vize + 0{,}6 \cdot Final
$$

<!-- Speaker note: RAP1/RAP2 bu sunumun konusu olan iki kontrol noktası. -->

---

<!-- _class: yogun -->

# Her kontrol hangi ÖÇ'leri ölçüyor

| ÖÇ | Bloom düzeyi | RAP1 | RAP2 |
| --- | --- | --- | --- |
| ÖÇ.1 Doğrusal/doğrusal olmayan yapılar | Anlama | ✓ | ✓ |
| ÖÇ.2 Zaman/uzay karmaşıklığı (Büyük O) | Analiz | ✓ | ✓ |
| ÖÇ.3 Sıralama ve arama | Uygulama | ✓ | ✓ |
| ÖÇ.4 Ağaçlar ve hash tabloları | Uygulama | ✓ | ✓ |
| ÖÇ.5 Çizge algoritmaları | Uygulama | ✓ | ✓ |
| ÖÇ.6 Dosya organizasyonu | Değerlendirme | — | ✓ |
| ÖÇ.7 Yapı/algoritma seçimi | Sentez | ✓ | ✓ |

<!-- Speaker note: ÖÇ.6 (dosya organizasyonu) yalnız RAP2'de görünür — 13–14. haftada, vize kontrolünden sonra işlenir. -->

---

<!-- _class: bolum -->

# 3. Araçlar ve Kurulum

<!-- Speaker note: Ön Gereksinimler sunumundaki aynı araç zinciri, şimdi tam şablon ve depo adlarıyla. -->

---

<!-- _class: yogun -->

# Araçlar — C tarafı (vize)

| Araç | Ne için | Çıktı | Koşul |
| --- | --- | --- | --- |
| GCC/Clang/MSVC + CMake | C uygulamasını derleme | Çalıştırılabilir (teslim edilmez) | Hatasız, Windows + WSL/Linux |
| GoogleTest + gcov/lcov | Birim testi, kapsam | HTML kapsam raporu | %100 satır kapsamı |
| Doxygen | Kaynak kod belgesi | PDF | %100 kapsam; yalnız PDF, HTML klasörü yok |

<!-- Speaker note: "Yalnız PDF, HTML klasörü yok" gerçek bir kabul koşulu — arşivde HTML Doxygen çıktısı reddedilme riski taşır. -->

---

<!-- _class: yogun -->

# Araçlar — Java tarafı (final) ve ortak

| Araç | Ne için | Çıktı | Koşul |
| --- | --- | --- | --- |
| JDK 21 + Maven | Java uygulamasını derleme | Sürüm (release) derlemesi | `mvn clean verify`, hatasız |
| JUnit 5 + JaCoCo | Birim testi, kapsam | HTML kapsam raporu | %100 satır kapsamı |
| Javadoc/Doxygen | Kaynak kod belgesi | PDF | %100 kapsam; yalnız PDF |
| Git + GitHub | Sürüm kontrolü | Özel (private) depo | Anlamlı commit'ler, düzgün `.gitignore` |
| GitHub Actions (isteğe bağlı) | Sürekli entegrasyon | CI durumu | Etkinse, birleştirmeden önce yeşil olmalı |

<!-- Speaker note: Java deposu ayrıca bir sürüm (release) üretmeli — bu, gösterim sırasında kontrol edilir. -->

---

# Şablondan depo oluşturun, adlandırın, paylaşın

- **Fork etmeyin:** herkese açık bir deponun fork'u özel yapılamaz
- Şablon sayfasında: **Use this template → Create a new repository**
- Sahibi seçin, ders koduyla adlandırın (kalıp bir sonraki slaytta), **Private**'ı seçin
- **Ders sorumlusunu** (`ucoruh`) ve **takım arkadaşınızı** collaborator ekleyin

<!-- Speaker note: Dönem boyunca açık (public) bir depo, kod kalitesinden bağımsız olarak kendi başına bir kabul koşulu sorunudur. -->

---

# Şablonlar ve depo adları

| Kontrol | Şablon | Depo adı |
| --- | --- | --- |
| Vize (C) | `cpp-cmake-ctest-template` | `cen207-proje-ad-soyad-c` |
| Final (Java) | `eclipse-java-maven-template` | `cen207-proje-ad-soyad-java` |

Her iki şablon da derleme, birim testi, dokümantasyon üretimi, kapsam
ölçümü ve paketlemeyi hazır verir — bunların **üzerine** inşa edersiniz.

<!-- Speaker note: İki şablon da github.com/ucoruh altında bulunur — "Use this template" burada kullanılır. -->

---

# Projenizi yerelde gösterme

GitHub Free'de özel (private) bir depoda GitHub Pages sitesi açılmaz. Her şeyi **kendi bilgisayarınızda** gösterirsiniz:

- `7-build-all-windows.bat` (Linux/WSL: `7-build-all-linux.sh`) derler, test eder, bütün raporları üretir
- `9-open-site-windows.bat` (Linux: `9-open-site-linux.sh`) tam siteyi `http://localhost` adresinde açar: bütün raporlar (testler, kod kapsamı, dokümantasyon kapsamı; Windows ve Linux) ve API belgeleri
- `release/` bütün çıktıları tutar: uygulama/exe, kütüphane, raporlar, API belgeleri, `site.zip`, kaynak kod, `ASSETS.md`, `SHA256SUMS.txt`
- `10-release-windows.bat` (Linux: `10-release-linux.sh`) GitHub Release'i oluşturur; sürümler özel depolarda da çalışır

<!-- Speaker note: Ayrıntılar her şablonun README'sinde ve docs/guide/ klasöründeki "Showing your project without GitHub Pages" sayfasında. -->

---

# Gösterim kontrol listesi

Gösterimde sırayla neyi açıp göstereceğiniz:

1. Yerel sitenin **ana sayfası** (`9-open-site-...`, `http://localhost` adresinde).
2. **Her rapor sayfası:** testler, kod kapsamı, dokümantasyon kapsamı (Windows ve Linux).
3. **API belgeleri.**
4. **`release/` klasörünün** içeriği.
5. Uygulamayı **release arşivinden çalıştırma.**
6. Özel deponuzun **GitHub Release sayfası** (ders sorumlusu collaborator olarak ekli).

---

# lib / app / test düzeni

- **`lib`** — veri yapıları ve algoritmalar burada
- **`app`** — konsol menüleri ve kullanıcı etkileşimi; `lib`'i kullanır
- **`test`** — birim testleri; `lib`'i kullanır

Başlamadan önce: ortamınızın hazır olduğundan emin olun — **Ön
Gereksinimler** sayfasına/sunumuna bakın.

<!-- Speaker note: Neredeyse her rubrik kriteri, app'e dağılmış değil özellikle lib'te olması gereken koda karşılık gelir. -->

---

<!-- _class: bolum -->

# 4. Konu Seçimi

<!-- Speaker note: 200 konu, sekiz grup, tek kural: tabloya ilk yazan takım alır. -->

---

# Konular nerede?

- Proje rehberi sayfasının sonundaki **Ek — Proje konuları listesi**
- 25'erli **sekiz grupta 200 konu**
- Her konu kutusu: kısa bir tanım, ardından her gereksinim kodu için tek
  cümle — o uygulamada **ne sakladığı ve hangi işlemi yaptığı**

<!-- Speaker note: Bu sunum, sonlara doğru bir temsilî konuyu gösterir — 200'ü tam olarak yalnız sayfada, bilerek. -->

---

# Nasıl seçilir?

1. Listeyi inceleyin, bir konu seçin
2. Seçiminizi paylaşılan **takım ve konu listesine** yazın (bağlantı Teams duyurusunda) —
   bir konuyu bir takım alır, ilk yazan alır
3. **Proje planınızla** birlikte onaylatın — onaydan sonra konu değişmez

<!-- Speaker note: Öğrencilerin unuttuğu adım 3'tür — onay, tabloya isim yazmakla değil, planla birlikte gerçekleşir. -->

---

# Konunun kendisiyle ilgili kurallar

- Konu kutusundaki eşlemeler **başlangıç önerisidir** — aynı gereksinimi
  daha doğal bir özellik karşılıyorsa raporda gerekçelendirerek değiştirin
- Listede olmayan bir fikir, bütün gereksinimleri anlamlı karşılıyorsa
  ders sorumlusunun onayıyla seçilebilir
- **Dersi tekrar alıyorsanız:** önceki projenizden farklı bir konu seçin

<!-- Speaker note: Gereksinimin kendisi — hangi yapı, hangi işlem — hiç değişmez, yalnızca uygulamadaki hangi özelliğin bunu gösterdiği değişir. -->

---

<!-- _class: bolum -->

# 5. Gereksinimler

<!-- Speaker note: Vize (C) için V1–V6, final (Java) için F1–F9 — kütüphaneden değil, sizin tarafınızdan gerçekleştirilir. -->

---

# Kütüphaneden değil, sizden

Her kodun yanında **hangi haftada işlendiği** ve **ölçtüğü ÖÇ** vardır.
Her yapının temel işlemlerini (ekleme, silme, arama, listeleme…)
**kendiniz** yazarsınız.

Hazır kütüphane yapıları (ör. Java `java.util`) bu gereksinimlerin
yerine **sayılmaz**.

<!-- Speaker note: Bu, gösterimde kontrol edilir — kütüphane çağrısı değil, KENDİ ekleme/silme kodunuzda satır satır gezinme. -->

---

<!-- _class: yogun -->

# 5.1 Vize kapsamı (C, 1–6. hafta) — V1–V3

| Kod | Gereksinim | Hafta | ÖÇ |
| --- | --- | --- | --- |
| **V1** | Bağlı liste: çift + XOR/dairesel; ekleme, silme, arama, iki yönde gezinme | 2 | ÖÇ.1 |
| **V2** | Seyrek matris: yalnız dolu hücreleri saklama; okuma, yazma, satır/sütun gezme | 2 | ÖÇ.1 |
| **V3** | Yığın ve kuyruk: dizi ya da bağlı liste tabanlı | 3 | ÖÇ.1 |

<!-- Speaker note: Bu üçü ilk üç içerik haftasında bitmeli — proje planını bunlara göre kurun, tüm listeye göre değil. -->

---

<!-- _class: yogun -->

# 5.1 Vize kapsamı (C, 1–6. hafta) — V4–V6

| Kod | Gereksinim | Hafta | ÖÇ |
| --- | --- | --- | --- |
| **V4** | Ağaç ve öbek: ikili ağaç + 3 dolaşma; öbek tabanlı öncelik kuyruğu; öbek sıralaması | 4 | ÖÇ.1, ÖÇ.4 |
| **V5** | Çizge ve dolaşma: komşuluk listesi/matrisi; BFS ve DFS | 5 | ÖÇ.1, ÖÇ.5 |
| **V6** | Arama ve hash: ikili arama; hash tablosu + çakışma çözümü | 6 | ÖÇ.3, ÖÇ.4 |

<!-- Speaker note: V6, vize gösteriminden hemen önceki haftada işlenen son gereksinim — tampon süreyi buna göre planlayın. -->

---

<!-- _class: yogun -->

# 5.2 Final kapsamı (Java, 9–14. hafta) — F1–F3

| Kod | Gereksinim | Hafta | ÖÇ |
| --- | --- | --- | --- |
| **F1** | Java'ya taşıma: V1–V6'nın generics'li sürümü; tek menüde bütün özellikler | 9–14 | ÖÇ.1, ÖÇ.7 |
| **F2** | Çizge algoritmaları: MST/en kısa yol/topo-sıralama/SCC/döngü/max-akıştan ≥2'si | 9 | ÖÇ.5 |
| **F3** | Sıralama: ≥3 algoritma, veri boyutlarında süreli karşılaştırma | 10 | ÖÇ.2, ÖÇ.3 |

<!-- Speaker note: F1, C'de zaten kurulmuş her şeyin taşınmasıdır — yeni işlevsellik değildir, ama gerçek bir iştir. -->

---

<!-- _class: yogun -->

# 5.2 Final kapsamı (Java, 9–14. hafta) — F4–F6

| Kod | Gereksinim | Hafta | ÖÇ |
| --- | --- | --- | --- |
| **F4** | BST ve AVL: dengeleme dönüşleri; ekleme, silme, arama, aralık sorgusu | 11 | ÖÇ.4 |
| **F5** | Dize algoritmaları: KMP/Boyer–Moore + düzenleme uzaklığı/LCS | 12 | ÖÇ.1, ÖÇ.3 |
| **F6** | Trie ve ayrık kümeler: önek ağacı + union-find | 9, 12 | ÖÇ.4 |

<!-- Speaker note: F6, iki ayrı haftada işlenir (trie 9. haftada, ayrık kümeler dizelerle birlikte 12. haftada) — iki geçişte planlayın. -->

---

<!-- _class: yogun -->

# 5.2 Final kapsamı (Java, 9–14. hafta) — F7–F9

| Kod | Gereksinim | Hafta | ÖÇ |
| --- | --- | --- | --- |
| **F7** | Dosya organizasyonu: sıralı + doğrudan erişimli dosya; dosyada çakışma çözümü | 13 | ÖÇ.6 |
| **F8** | B+ ağacı dizini: dosya kayıtları için ikincil anahtar dizini | 14 | ÖÇ.4, ÖÇ.6 |
| **F9** | Genişleyen dosyalar: genişletilebilir hash **ya da** dış birleştirmeli sıralama | 14 | ÖÇ.3, ÖÇ.6 |

<!-- Speaker note: F7–F9, final gösteriminden hemen önceki iki haftada işlenen son üç gereksinim — takvimin en sıkışık kısmı. -->

---

# 5.3 Her iki kontrolde — uygulama

- **Konsol uygulaması, klavyeyle gezilen menü** — ok tuşları/Tab, yalnız numara girişi değil
- **Kalıcı veri binary dosyalarda** (`.bin`/`.dat`) — kayıtlar yeniden başlatmada kalır
- **Karmaşıklık:** her işlemin Büyük O'su, hem kod yorumunda hem raporda;
  en az iki yapı için ölçüm tablosu

<!-- Speaker note: "Kalıcı" gösterimde tam olarak sınanır: kayıt ekleyin, programı kapatın, yeniden açın, kaydın hâlâ orada olduğunu gösterin. -->

---

# 5.3 Her iki kontrolde — mühendislik

- **Test ve belge:** birim test kapsamı **%100**, dokümantasyon kapsamı **%100**
- **Platform:** hem **Windows** hem **WSL/Linux**'ta derlenip çalışır
- **GitHub:** özel depo, anlamlı commit'ler, dal kullanımı, düzgün `.gitignore`;
  derlenmiş dosya **yok**; Java deposu bir **sürüm (release)** üretir
- **Veri:** bütün veriler **sentetiktir** — gerçek kişi verisi asla kullanılmaz

<!-- Speaker note: Bu dört kural, sunumun ilerisindeki "Kabul koşulları"nda kontrol edilen aynı dört kuraldır — isteğe bağlı cila değildir. -->

---

<!-- _class: bolum -->

# 6. Teslim Edilecekler

<!-- Speaker note: Kontrol başına bir arşiv, rapor kapağında depo bağlantısıyla birlikte. -->

---

# Kontrol başına ne teslim ediyorsunuz

| Teslim | Vize | Final |
| --- | --- | --- |
| Kaynak kod arşivi (derlenmiş dosya yok) | ✓ | ✓ |
| Rapor (`.docx`): tasarım, karmaşıklık, ölçüm, kapsam ekran görüntüleri | ✓ | ✓ (güncellenmiş) |
| Doxygen/Javadoc çıktısı — **yalnız PDF** | ✓ | ✓ |
| Test kapsamı raporu (HTML, arşiv içinde) | ✓ | ✓ |
| Sunum (en çok 10 slayt) | — | ✓ |
| Video (kişi başı en çok 4 dk) | — | ✓ |
| Canlı gösterim ve sorular (~10 dk/takım) | 7. hafta | 15. hafta |

<!-- Speaker note: Sunum ve video yalnız final içindir — vize kontrolü kod, rapor ve canlı gösterimden ibarettir, önceden kaydedilen bir şey yok. -->

---

# Arşiv yapısı — vize (C)

```text
cen207-vize-ad-soyad.zip
└── cen207-proje-ad-soyad-c/
    ├── lib/          # V1–V6
    ├── app/          # konsol menüleri, lib'i kullanır
    ├── test/         # GoogleTest, lib'i kullanır
    ├── CMakeLists.txt
    ├── report/cen207-vize-ad-soyad.docx
    ├── docs/cen207-vize-ad-soyad-doxygen.pdf
    ├── coverage/     # gcov/lcov HTML
    ├── .gitignore
    └── README.md
```

<!-- Speaker note: Bu, gitignore'a göre süzülmüş bir GitHub deposu klonudur — açıldığında kendi başına derlenir. -->

---

# Arşiv yapısı — final (Java)

```text
cen207-final-ad-soyad.zip
└── cen207-proje-ad-soyad-java/
    ├── src/main/java/...   # V1–V6'nın taşınmışı F1, artı F2–F9
    ├── src/test/java/...   # JUnit 5
    ├── pom.xml
    ├── report/, docs/, coverage/
    ├── presentation/cen207-final-ad-soyad.pptx
    ├── video/               # ziplemeden önce eklenir, commit edilmez
    ├── .gitignore
    └── README.md
```

<!-- Speaker note: video/ açıkça GitHub'a commit EDİLMEZ — yalnız teslimden hemen önce zip arşivine eklenir. -->

---

# Her şeyi adlandırma

Her dosyayı **ders kodu**, **kontrol adı** ve **ad-soyad** ile adlandırın:

`cen207-vize-ad-soyad.zip` · `cen207-final-ad-soyad.zip` ·
`cen207-vize-ad-soyad.docx`

Depo adları, araçlar/kurulum bölümündeki kalıbı izler.

<!-- Speaker note: Tutarsız adlandırma, onlarca teslimi notlandırırken küçük ama önlenebilir bir kafa karışıklığı kaynağıdır. -->

---

<!-- _class: bolum -->

# 7. Takım Çalışması ve Mühendislik Uygulamaları

<!-- Speaker note: Bu yalnız tavsiye değil, notlandırılır — "Yazılım mühendisliği" her kontrolde 20 puanlık bir rubrik kriteridir. -->

---

# GitHub Flow

- **`main`** korumalıdır — bütün çalışma **özellik dallarında**
  (`feature/hash-table`, `fix/avl-rotation`) yapılır
- Dallar **çekme isteğiyle (pull request)** birleştirilir, `main`'e doğrudan push yok

<!-- Speaker note: Bir gösterim sorusu doğrudan "dallar nasıl kullanıldı, birleştirme/çakışma nasıl çözüldü" diye sorar — bu bir formalite değil. -->

---

# Commit'ler ve inceleme

**Conventional Commits:** `feat(lib): implement AVL rotation` ·
`fix(app): correct menu navigation` · `test(hash): add collision unit tests`

**Çekme istekleri:** dalınızdan `main`'e açın; takım arkadaşınız neyin
değiştiğini ve nasıl test edildiğini inceleyip birleştirmeden önce onaylar

<!-- Speaker note: HER İKİ üyeden anlamlı commit'ler açık bir kabul koşulu — commit'lerin hepsinde tek bir üyenin adı kırmızı bayraktır. -->

---

# Issue'lar, CI, etiketler, Bitti Tanımı

- Her gereksinim kodu (V1–V6, F1–F9) için bir **GitHub Issue**; bir
  Projects panosunda izlenir (Backlog → Sürüyor → İncelemede → Bitti)
- **CI (etkinse):** derleme/testler kırmızıyken asla birleştirmeyin
- **Sürüm etiketleri:** teslim ettiğiniz durum için `midterm-v1.0`, `final-v1.0`
- **Bitti tanımı:** uyarısız derleniyor, tam kapsamla test geçiyor,
  karmaşıklık belgelenmiş, takım arkadaşı kodu incelemiş

<!-- Speaker note: Sürüm etiketi, "değerlendirmeye sunduğunuz durum" ifadesinin tam karşılığıdır — etiketleyin, main o an ne ise onu teslim etmeyin. -->

---

<!-- _class: bolum -->

# 8. Rubrikler

<!-- Speaker note: İki rubrik, her biri 100 puan, yedişer kriter — her kriter 1–5 başarı ölçeğinde. -->

---

<!-- _class: yogun -->

# Başarı düzeyleri (her kriter için)

| Düzey | Anlamı |
| --- | --- |
| **5 — Mükemmel** | Her şey çalışıyor, testli, belgeli; gösterimde adım adım açıklanabiliyor |
| **4 — İyi** | Küçük eksik/uç durum hatası; genelde tam ve testli |
| **3 — Yeterli** | Temel işlemler çalışıyor; test/belge/ölçümde belirgin eksik |
| **2 — Zayıf** | Derleniyor ama çoğu işlem hatalı/eksik; açıklama zayıf |
| **1 — Kanıt yok** | Teslim edilmemiş ya da çalışmıyor |

Puan = (düzey ÷ 5) × kriter puanı.

<!-- Speaker note: Formül önemli: düzey-3 bir kriter puanının %60'ını alır, sıfır değil — kısmi puan gerçek ve doğrusal ölçeklenir. -->

---

<!-- _class: cok-yogun -->

# 8.1 Vize rubriği — RAP1 (C, 100 puan)

| # | Kriter | Kapsam | Puan |
| --- | --- | --- | --- |
| 1 | Doğrusal yapılar | V1 listeler, V2 seyrek matris, V3 yığın/kuyruk | 20 |
| 2 | Ağaç ve öbek | V4 dolaşmalar, öbek, öbek sıralaması | 15 |
| 3 | Çizge ve dolaşma | V5 gösterim, BFS/DFS | 15 |
| 4 | Arama ve hash | V6 ikili arama, hash, çakışmalar | 10 |
| 5 | Karmaşıklık analizi | Büyük O + ölçüm tablosu | 10 |
| 6 | Problem çözümleme, yapı seçimi | Raporda "neden bu yapı?" | 10 |
| 7 | Yazılım mühendisliği | CMake, testler %100, belge %100, GitHub | 20 |

<!-- Speaker note: 1–4. kriterler (65 puan) dört V-kod grubu; 5–7 (35 puan) yalnız kod değil, analiz ve mühendislik. -->

---

<!-- _class: cok-yogun -->

# 8.2 Final rubriği — RAP2 (Java, 100 puan)

| # | Kriter | Kapsam | Puan |
| --- | --- | --- | --- |
| 1 | Taşıma + tümleşik uygulama | F1 generics, tek menü, binary dosya | 10 |
| 2 | Çizge algoritmaları | F2, iki algoritma | 10 |
| 3 | Sıralama | F3, üç algoritma, karşılaştırma | 10 |
| 4 | Dengeli ağaçlar | F4 BST/AVL, dönüşler, aralık sorgusu | 15 |
| 5 | Dizeler ve yapılar | F5 arama/hizalama, F6 trie/union-find | 15 |
| 6 | Dosya organizasyonu | F7 dosyalar, F8 B+ dizini, F9 hash/sıralama | 20 |
| 7 | Mühendislik + sunum | Maven, testler %100, belge, video, gösterim | 20 |

<!-- Speaker note: Yalnız dosya organizasyonu finalde 100 puanın 20'si — mühendislik ve sunumun toplamıyla aynı ağırlık. -->

---

<!-- _class: bolum -->

# 9. Kabul Koşulları

<!-- Speaker note: Bunlar kaybedilen rubrik puanı değil — bunlardan birini karşılamayan teslim hiç kabul edilmez. -->

---

# Teslim kabul edilmez, eğer…

- GitHub deposu yoksa, özel değilse ya da bir üyenin commit'i yoksa
- Birim test ya da dokümantasyon kapsamı **%100'ün altındaysa**
- Depoda/arşivde derlenmiş dosya varsa, Java deposunda sürüm yoksa
- Uygulama **Windows ya da WSL/Linux**'ta derlenip çalışmıyorsa
- **İntihal** tespit edilirse

<!-- Speaker note: Bu, rubrik uygulanmadan önce kontrol edilen sert bir kapıdır — önce bunları düzeltin, sonra puanı düşünün. -->

---

<!-- _class: bolum -->

# 10. Gösterimde Sorulacaklar

<!-- Speaker note: Gösterim takım başına yaklaşık 10 dakika — bunlar soru kategorileri, sabit bir senaryo değil. -->

---

# Gösterim soruları — Git/GitHub ve kurulum

- Depo şablondan doğru adla mı oluşturuldu? İki üyenin de commit'i var mı, dal kullanılmış mı?
- Birleştirme ve çakışmalar nasıl çözüldü? `.gitignore` doğru mu?
- **Windows ve WSL**'de derleyip çalıştırın; `lib`/`app`/`test` ve bağımlılıklarını gösterin

<!-- Speaker note: "İki üye" tam olarak kontrol edilir — yalnız bir üyenin commit attığı depo başlı başına bir bulgudur. -->

---

# Gösterim soruları — veri yapıları ve testler

- Seçtiğiniz bir işlemi (ör. çift bağlı listede silme, AVL dönüşü, hash
  çakışması) **satır satır**, bellekte kutu-ok çizimiyle anlatın
- Karmaşıklığı nedir, neden?
- Test/dokümantasyon kapsamı raporlarını açın; bir uç durum testini gösterin

<!-- Speaker note: "Satır satır" gerçektir — kodu gösterip anlatabilmek burada değerlendirilen şeydir. -->

---

# Gösterim soruları — dosya işlemleri ve programlama

- Kayıt ekleyin, programı kapatıp açın, binary dosyadan geri geldiğini gösterin
- **C:** işaretçiler/diziler, `struct`, `malloc`/`free`, dosya G/Ç, hata ayıklayıcıda çağrı yığını
- **Java:** generics, arayüzler, istisnalar

<!-- Speaker note: Bu, kurallar slaytındaki "kalıcılık" testinin tam olarak öğretim üyesi önünde canlı yapılan hâli. -->

---

<!-- _class: bolum -->

# 11. Mesleki Sorumluluk ve Dürüstlük

<!-- Speaker note: "Ortak anlama"nın yalnız test edilmekle kalmayıp notlandırılmasının nedeni bu bölüm — gösterim bunu doğrudan kontrol eder. -->

---

# Etik, lisans, sentetik veri

- **Etik:** IEEE/ACM ilkeleri, kodunuzun ne yapıp yapmadığı konusunda
  dürüstlük ve adil teknik eleştiriyi hem vermeyi hem kabul etmeyi ister
- **Lisans ve atıf:** raporda dış kaynakları belirtin; kullanılan kod
  parçasının kaynağını/lisansını yorumda yazın
- **Sentetik veri:** bütün veriler kendi ürettiğiniz örnek veridir —
  gerçek kişi verisi asla değil (bkz. kural 5.3)

<!-- Speaker note: Kod incelemesi ve gösterim, etik ilkelerin tarif ettiği dürüstlüğü tam olarak sınar — bu soyut bir madde değildir. -->

---

# İntihal ve ortak anlama

- Kod ve rapor **takımınıza** aittir
- Başka bir takımdan, önceki dönemden ya da internetten kopyalamak
  **intihaldir** — benzerlik denetimi yapılır, intihal **sıfır puan** demektir
- Her üye takımın **bütün** kodunu açıklayabilmelidir — gösterimde
  açıklanamayan kod **notlandırılmaz**

<!-- Speaker note: "Notlandırılmaz", "puan kaybeder"den daha güçlü — açıklanamayan bir bölüm puana hiç dahil edilmez. -->

---

<!-- _class: bolum -->

# 12. Sık Sorulan Sorular

<!-- Speaker note: En sık sorulanlardan birkaçı — tam liste proje rehberi sayfasında. -->

---

# SSS — takım ve konu

**Takım yerine tek başıma çalışabilir miyim?** Evet — en çok
5 kişi, tek başına çalışmaya izin var. Takımlar 3. hafta sonunda kesinleşir.

**İki takım aynı konuyu isterse?** Teams tablosuna ilk yazan alır.

**Onaylı konuyu değiştirebilir miyim?** Hayır — proje planıyla birlikte kesinleşir.

<!-- Speaker note: Üç cevap da aynı kurala dayanır: takım-konu tablosu ilk gelene, sonra kilitlenir. -->

---

# SSS — kapsam ve teslim

**Kapsam %100'ün altında kalırsa?** Kabul edilmez (bkz. kabul koşulları)
— son tarihten önce %100'e ulaşın.

**Kütüphane koleksiyonları (ör. `java.util`) sayılır mı?** Hayır —
temel işlemleri kendiniz yazarsınız.

**Depoda/arşivde derlenmiş dosya olabilir mi?** Hayır — `.gitignore` ile
kaldırın; varlığı reddedilme nedenidir.

<!-- Speaker note: Bu üçü de bu sunumun daha önceki "Kabul koşulları" slaydına dayanır — tekrar okumaya değer. -->

---

<!-- _class: bolum -->

# Ek — Proje Konuları Listesi

<!-- Speaker note: 25'erli sekiz grupta 200 konu — bu sunum haritayı ve tek bir çözümlü örneği gösterir, 200'ünü değil. -->

---

# Sekiz konu grubu

| Aralık | Tema |
| --- | --- |
| 001–025 | Ulaşım, harita ve rota |
| 026–050 | Oyun ve bulmaca |
| 051–075 | Metin, dil ve arama |
| 076–100 | Bilim, sağlık ve biyoinformatik |
| 101–125 | Ağlar ve bilgisayar sistemleri |
| 126–150 | Lojistik, üretim ve ticaret |
| 151–175 | Medya, sosyal ağ ve kültür |
| 176–200 | Kent, çevre, afet ve tarım |

<!-- Speaker note: Bütün veriler sentetiktir ve her uygulama ağ bağlantısı kullanmaz — 5.3'teki bu kural sekiz grubun tamamında geçerli. -->

---

# Bir konu kutusu nasıl okunur

- Uygulamanın kısa bir **özeti**
- Ardından **her** gereksinim kodu için (V1–V6 ve F1–F9) tek cümle: o
  uygulamada **ne saklandığı ve hangi işlemin yapıldığı**
- Aynı gereksinim, her seferinde farklı bir hikâye

<!-- Speaker note: Sonraki iki slayt, bu örüntünün çözümlü örneği olarak tek bir konu kutusunu tam olarak gösteriyor. -->

---

# Örnek — 001 Metro Ağı Rota Planlayıcı (1/2)

Bir şehrin metro/tramvay/füniküler hatlarını tek ağda birleştiren; en
hızlı ya da en az aktarmalı rotayı öneren konsol uygulaması (~12 hat, 250 istasyon).

- **V1** Her hat: istasyonların çift bağlı listesi; ring hatları dairesel liste
- **V2** Saat dilimi × istasyon yoğunluğu tablosu seyrek matris olarak saklanır
- **V3** Rota düzenlemeleri yığınla geri alınır; turnike girişleri kuyrukta
- **V4** Arıza ihbarları önem derecesine göre öbekte tutulur
- **V5** BFS en az duraklı yolu bulur; DFS kapanma sonrası kopan bölgeleri bulur
- **V6** İstasyon adı → kayıt hash tablosunda; sıralı kodlarda ikili arama

<!-- Speaker note: Bu, 200 konudan 001 numaralısı — sayfadaki diğerlerine göz atmadan önce örüntünün tamamının görülmesi için tam olarak gösterildi. -->

---

# Örnek — 001 Metro Ağı Rota Planlayıcı (2/2)

- **F2** Dijkstra: dakika cinsinden en hızlı rota; Kruskal: en ucuz yeni hat ağı
- **F3** Rota seçenekleri süre/aktarma/mesafeye göre sıralanır, üç algoritma karşılaştırılır
- **F4** İstasyon başına sefer saatleri AVL ağacında — hızlı "X'ten sonraki ilk tren" sorgusu
- **F5** Yazılan istasyon adı KMP ile eşlenir; yazım hatası düzenleme uzaklığıyla düzeltilir
- **F6** İstasyon adları trie ile otomatik tamamlanır; union-find ulaşılabilir bölgeleri gruplar
- **F7–F9** Sefer kayıtları (sıralı dosya), istasyon kartları (doğrudan erişim + Brent
  yöntemi), kart numarasında B+ ağacı dizini

<!-- Speaker note: V1–V6 ve F1–F9'un her biri tam olarak bir kez geçiyor — 200 konu kutusunun tamamının izlediği kural bu. -->

---

# Diğer 199'unu nerede bulacaksınız

Ekin tamamı — sekiz grup, 200 konu kutusunun tümü — **proje rehberi
sayfasında**, bu sunumun içeriğinin hemen ardından.

Göz atın, birini seçin, takım-konu tablosuna yazın.

<!-- Speaker note: Sunuma yalnız bir konu koymak bilinçli bir tercih — 200 konu kutusu sayfaya aittir, 200 slayta değil. -->

---

<!-- _class: baslik -->

# Sorular?

**Ders web sitesi:** ucoruh.github.io/ce205-data-structures

**Sırada:** proje rehberi sayfasındaki tam konu listesine göz atın

<!-- Speaker note: İzlence, Ön Gereksinimler ve bu rehber, 1. haftada her öğrencinin açık tutması gereken üç sayfa. -->
