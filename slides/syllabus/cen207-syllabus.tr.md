---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Veri Yapıları — Ders İzlencesi"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Ders İzlencesi"
footer: "RTEÜ Bilgisayar Mühendisliği · 2026-2027 Güz"
---

<!-- _class: baslik -->
<!-- _paginate: false -->

# CEN207 Veri Yapıları

**Ders İzlencesi — 2026-2027 Güz Yarıyılı**

Dr. Öğr. Üyesi Uğur CORUH

<!-- Speaker note: Bu sunum, izlence sayfasını bölüm bölüm izler; öğrenciler istedikleri an belge olarak da okuyabilir. -->

---

# Derse bir bakış

- **CEN207 Veri Yapıları** (eski kodu CE205)
- Zorunlu ders, 3. yarıyıl
- Kuramsal 3 saat/hafta · Kredi 3 · AKTS 5
- Eğitim dili: **İngilizce**
- Ön koşul: **CEN108 Algoritmalar ve Programlama II** (eski kodu CE100)

<!-- Speaker note: Öğrencilerin ilk sorduğu beş bilgi burada; sunumun geri kalanı bunları açıyor. -->

---

<!-- _class: yogun -->

# Ders bilgileri — iletişim ve düzen

| | |
| --- | --- |
| **Öğretim üyesi** | Dr. Öğr. Üyesi Uğur CORUH |
| **İletişim** | ugur.coruh@erdogan.edu.tr — konu satırı **[CEN207]** ile başlamalıdır |
| **Ofis** | F-301 |
| **Görüşme saatleri** | E-posta ile randevu; ofiste ya da üniversite hesabıyla çevrim içi |
| **Ders günü, saati, dersliği** | Cuma 13:00–16:00 · İİBF ve Hukuk Fakültesi Binası, D-402 (ED-K4-2) |

<!-- Speaker note: [CEN207] etiketi zorunlu — e-postaların hızlı sınıflandırılıp yanıtlanmasını sağlıyor. -->

---

<!-- _class: yogun -->

# Ders bilgileri — ders ayrıntıları

| | |
| --- | --- |
| **Ders web sitesi** | https://ucoruh.github.io/ce205-data-structures/ |
| **Ders sınıfı** | Her dönem yeni sınıf açılır; sınıf kodu 1. haftada duyurulur |
| **Tür / yarıyıl** | Zorunlu · 3. yarıyıl |
| **Haftalık saat / kredi / AKTS** | Kuramsal 3 saat · Kredi 3 · AKTS 5 |
| **Ön koşul** | CEN108 Algoritmalar ve Programlama II (eski kodu CE100) |

<!-- Speaker note: Ön koşul araç zincirinin ayrıntıları Ön Gereksinimler sayfasında ve sunumunda. -->

---

<!-- _class: bolum -->

# A. Dersin Tanımı

<!-- Speaker note: Tek paragraf, burada kendi fikirlerine ayrıştırılmış olarak. -->

---

# Bu ders ne hakkında?

- **Veri yapıları** ve **dosya organizasyonu** temelleri
- Verinin programlarda nasıl eşlendiği: hem çalışma zamanı belleği **hem** uzun süreli dosya depolaması
- Bu veri nesnelerinin gerçekleştirimleri, programlama biçimleri ve çalışma zamanı gösterimleri
- Ayrıca **sıralama**, **arama** ve **çizge algoritmaları**

<!-- Speaker note: Ana çizgi: "veri belleğe ya da depolamaya nasıl şekillenip eşlenir" — her hafta bunu bir yapı için yanıtlıyor. -->

---

# Ders nasıl işleniyor?

- Uygulama odaklı: sınıfta programlama uygulaması **ve** dönem projesi
- Yalnızca kuram değil — her yapıyı kendiniz kuruyorsunuz
- Amaç: dijital veri yapılarının gerçek dünya problemlerini nasıl çözdüğünü göstermek

<!-- Speaker note: Dönem projesinin var olma nedeni bu — bir hash tablosunu okumak ile kurmak farklı beceriler. -->

---

<!-- _class: bolum -->

# B. Öğrenme Çıktıları

<!-- Speaker note: Yedi çıktı; her haftanın içeriği ve her rubrik kriteri bunlardan birine ya da birkaçına bağlanıyor. -->

---

<!-- _class: yogun -->

# Öğrenme çıktıları (ÖÇ.1–ÖÇ.7)

| Kod | Öğrenme çıktısı |
| --- | --- |
| ÖÇ.1 | Doğrusal ve doğrusal olmayan veri yapılarının tanımı, temsili ve temel operasyonlarını açıklar |
| ÖÇ.2 | Zaman/uzay karmaşıklığını (Büyük O) analiz eder; veri yapılarının performansını karşılaştırır |
| ÖÇ.3 | Temel sıralama ve arama algoritmalarını uygular, performanslarını analiz edip karşılaştırır |
| ÖÇ.4 | Dengeli/dengesiz ağaç yapılarını ve hash tablolarını uygular |
| ÖÇ.5 | Graf veri yapısını ve temel graf algoritmalarını uygular |
| ÖÇ.6 | Sıralı, doğrudan ve indeksli dosya organizasyonunu açıklar; uygulamalarını değerlendirir |
| ÖÇ.7 | Bir probleme en uygun veri yapılarını/algoritmaları seçer ve etkin bir çözüm geliştirir |

<!-- Speaker note: ÖÇ.7 sentez çıktısıdır — asıl dönem projesinde uygulanır. -->

---

<!-- _class: yogun -->

# ÖÇ'lerin program çıktılarına katkısı (0–5)

| | PÇ.1 | PÇ.2 | PÇ.3 | PÇ.4 | PÇ.5 | PÇ.6–12 |
| --- | --- | --- | --- | --- | --- | --- |
| ÖÇ.1 | 5 | – | – | – | – | – |
| ÖÇ.2 | 5 | – | – | – | – | – |
| ÖÇ.3 | – | – | – | 5 | – | – |
| ÖÇ.4 | – | 4 | 3 | 5 | – | – |
| ÖÇ.5 | – | 4 | 3 | 5 | – | – |
| ÖÇ.6 | – | – | – | 4 | 5 | – |
| ÖÇ.7 | 5 | 4 | – | 3 | – | – |

**PÇ.1** Temel bilgi · **PÇ.2** Problem çözme · **PÇ.3** Tasarım · **PÇ.4** Modern teknik ve araçlar · **PÇ.5** Araştırma ve deney

<!-- Speaker note: Bu tablo akreditasyon izlenebilirliği içindir; öğrenciler çoğunlukla bir önceki slayttaki ÖÇ tablosuna ihtiyaç duyar. -->

---

<!-- _class: bolum -->

# C. Haftalık Program

<!-- Speaker note: On altı hafta, iki sınav haftası, içinde iki kontrol noktası olan bir proje. -->

---

# Her değerlendirme için tek kural

**Proje gösterimleri**, vize ve final sınav haftalarının **hemen öncesindeki**
haftada yapılır.

**Quizler**, vize ve final sınav haftalarının **içinde** yapılır —

böylece her öğrenci katılabilir.

<!-- Speaker note: 7. hafta gösterim haftası, 8. hafta quiz haftası olmasının nedeni bu; 15/16 için de aynı. -->

---

<!-- _class: cok-yogun -->

# Haftalık program (1–8)

| Hf | Tarih | Konu | ÖÇ |
| --- | --- | --- | --- |
| 1 | 18.09.2026 (telafi 23.09) | Giriş, Büyük O, İşaretçiler | 1, 2, 7 |
| 2 | 25.09.2026 | Bağlı Listeler, Diziler, Matrisler | 1, 7 |
| 3 | 02.10.2026 | Yığınlar ve Kuyruklar | 1, 7 |
| 4 | 09.10.2026 | Ağaçlar, Öbekler, Huffman | 1, 4, 7 |
| 5 | 16.10.2026 | Çizgeler ve Dolaşmalar | 1, 5, 7 |
| 6 | 23.10.2026 | Arama ve Hash | 3, 4, 7 |
| 7 | 30.10.2026 | **Ara Proje Gösterimleri** | 1–5, 7 |
| 8 | 31.10–08.11.2026 | **Ara Sınav Haftası: Quiz-1** | 1, 2, 4, 5, 7 |

<!-- Speaker note: Her haftanın tam konu ayrıntısı kendi sayfasında ve sunumunda — bu, haritanın kendisi değil, haritanın özeti. -->

---

<!-- _class: cok-yogun -->

# Haftalık program (9–16)

| Hf | Tarih | Konu | ÖÇ |
| --- | --- | --- | --- |
| 9 | 13.11.2026 | Çizge Algoritmaları | 3, 5, 7 |
| 10 | 20.11.2026 | Sıralama | 2, 3, 7 |
| 11 | 27.11.2026 | Gelişmiş Ağaçlar | 4, 7 |
| 12 | 04.12.2026 | Dizeler | 1, 3, 4, 7 |
| 13 | 11.12.2026 | Dosya Organizasyonu I | 6, 7 |
| 14 | 18.12.2026 | Dosya Organizasyonu II | 3, 4, 6, 7 |
| 15 | 25.12.2026 | **Final Proje Gösterimleri** | 1–7 |
| 16 | 04–17.01.2027 | **Final Sınav Dönemi: Quiz-2** | 2–7 |

<!-- Speaker note: Quiz-1, 1–6. haftaları kapsar; Quiz-2, 9–14. haftaları — iki proje haftası (7, 15) quiz konusu değildir. -->

---

# Zenginleştirme konuları (isteğe bağlı okuma)

Önceki yıllardan korunan, ders notlarında **isteğe bağlı** okuma olarak
işlenen konular:

alfa-beta budama · Hasse diyagramları · Petri ağları · iki parçalı çizgeler ·
Bayes ağları · van Emde Boas ağaçları · SimHash · trie hashing

<!-- Speaker note: Bunlar sınav konusu değildir; daha ileri gitmek isteyen öğrenciler içindir. -->

---

<!-- _class: bolum -->

# D. Kaynaklar, Yazılım ve Donanım

<!-- Speaker note: Ders notları kendi başına yeterlidir — aşağıdaki kitaplar ikinci bir anlatım isteyenler için. -->

---

# Ana kaynak

**Ders web sitesindeki ders notları kendi başına yeterlidir** ve bu dersin
ana kaynağıdır.

Sonraki slayttaki kitaplar yalnızca **ileri okuma** içindir.

<!-- Speaker note: Değerlendirmenin hiçbir parçası kitap satın almayı gerektirmez. -->

---

<!-- _class: yogun -->

# Önerilen kitaplar

- Deitel & Deitel. *C How to Program*, 7. baskı. Prentice Hall, 2013.
- Y. Daniel Liang. *Introduction to Java Programming, Comprehensive Version*, 10. baskı.
- T. H. Cormen, C. E. Leiserson, R. L. Rivest, C. Stein. *Introduction to Algorithms*, 3. baskı. MIT Press.
- J. R. Hanly, E. B. Koffman. *Problem Solving and Program Design in C*, 6. baskı.
- A. L. Tharp. *File Organization and Processing*. Wiley, 1988.
- P. Brass. *Advanced Data Structures*. Cambridge University Press, 2008.
- R. Sedgewick, K. Wayne. *Algorithms*, 4. baskı. Addison-Wesley, 2011.

<!-- Speaker note: Cormen ve arkadaşları ile Sedgewick & Wayne, dönem boyunca en çok başvurulan ikisi. -->

---

# Dizüstü bilgisayar ve araç zinciri — gerekli

Derste, ödevlerde ve projede **kendi geliştirme ortamınızı** kullanacaksınız:

- C/C++ derleyicisi: **GCC**, **Clang** ya da **MSVC**
- **CMake**, **GoogleTest**, **Doxygen**
- **JDK 21** ile **Maven** ve **JUnit 5**
- **Git** ve bir **GitHub** hesabı

Kurulum adımları: 1. hafta ve ders notları. Tam kontrol listesi: ders
web sitesindeki **Ön Gereksinimler** sayfası.

<!-- Speaker note: Proje şablonları bu araç zinciri için zaten hazır — öğrenciler sıfırdan kurmuyor. -->

---

<!-- _class: bolum -->

# E. Değerlendirme

<!-- Speaker note: Bir proje, iki kontrol noktası, iki quiz — değerlendirme yapısının tamamı bu. -->

---

# Tek dönem projesi, iki kontrol noktası

- **Tek bir dönem projesi**, her biri kendi rubriğiyle değerlendirilen **iki kontrol noktasında**
- **Vize kontrolü:** C gerçekleştirimi
- **Final kontrolü:** Java gerçekleştirimi
- Ayrıca ara sınav haftasında **bir quiz**, final döneminde **bir quiz**
- Konular, takım kuralları, teslimler ve ayrıntılı rubrikler: **proje rehberi**

<!-- Speaker note: Proje rehberi sunumu ve sayfası bu izlenceden çok daha ayrıntılıdır — bu yalnızca ağırlık dağılımı. -->

---

# Değerlendirme bileşenleri

| Değerlendirme | Kod | Ağırlık | Zaman |
| --- | --- | --- | --- |
| Proje kontrolü 1 — C, rapor, gösterim | RAP1 | Vizenin %60'ı | 7. hafta (30.10.2026) |
| Quiz-1 (1–6. haftalar) | QUIZ1 | Vizenin %40'ı | 8. hafta (31.10–08.11.2026) |
| Proje kontrolü 2 — Java, rapor, gösterim | RAP2 | Finalin %70'i | 15. hafta (25.12.2026) |
| Quiz-2 (9–14. haftalar) | QUIZ2 | Finalin %30'u | 16. hafta (04–17.01.2027) |

<!-- Speaker note: RAP1/RAP2 proje kontrol noktaları; QUIZ1/QUIZ2 yazılı quizler — aynı kodlar proje rehberinde de kullanılıyor. -->

---

# Final notu nasıl hesaplanır?

$$
Not_{Vize} = 0{,}6 \cdot RAP1 + 0{,}4 \cdot QUIZ1
$$

$$
Not_{Final} = 0{,}7 \cdot RAP2 + 0{,}3 \cdot QUIZ2
$$

$$
Başarı\ Notu = 0{,}4 \cdot Not_{Vize} + 0{,}6 \cdot Not_{Final}
$$

<!-- Speaker note: Final kontrolü ve final quizi birlikte vize tarafından daha ağır basıyor — ders Java/ikinci yarıya doğru eğimli. -->

---

<!-- _class: yogun -->

# İş yükü (AKTS 5 = 125 saat)

| Etkinlik | Sayı | Süre | Toplam |
| --- | --- | --- | --- |
| Derse katılım | 14 | 3 | 42 |
| Bireysel çalışma (haftalık notlar/örnekler) | 14 | 1 | 14 |
| Quiz (ara sınav haftası, final dönemi) | 2 | 2 | 4 |
| Quiz için bireysel çalışma | 2 | 10 | 20 |
| Proje hazırlama (C ve Java) | 2 | 16 | 32 |
| Rapor hazırlama | 2 | 5 | 10 |
| Proje sunma (gösterim, sorular) | 2 | 1,5 | 3 |
| **Toplam** | | | **125** |

<!-- Speaker note: Yaklaşık 14 hafta üzerinde 125 saat, haftada ~9 saat demek — proje hazırlama saatlerini erken planlayın, son hafta değil. -->

---

<!-- _class: bolum -->

# F–K. Kurallar

<!-- Speaker note: Altı kısa bölüm — öğretim yöntemi, geç teslim, iletişim, dürüstlük, beklentiler, güncellemeler. -->

---

# F. Öğretim Yöntemleri

- Dersler **yüz yüze**: anlatım, soru–cevap, uygulamalı programlama
- Her içerik haftası: ders notu, sunum, çözümlü örnekler, kendini sınama soruları
- Duyurular, kaynaklar ve teslimler: **ders sınıfı**
- **Yoklama alınır**

<!-- Speaker note: Her haftanın notunun sonundaki kendini sınama soruları, o haftanın oturup oturmadığını anlamanın en hızlı yolu. -->

---

# G. Geç Teslim

- Ödevler **duyurulan son tarihe kadar** teslim edilmelidir
- **Süresi geçmiş ödevler kabul edilmez**
- Beklenmedik durumlar **öğrenci tarafından** öğretim üyesine bildirilmelidir

<!-- Speaker note: "Beklenmedik durum" demek, son tarihten önce öğretim üyesiyle iletişime geçmek demektir, sonra değil. -->

---

# H. Ders Platformu ve İletişim

- Tüm duyurular, kaynaklar ve teslimler: **ders sınıfı**
- Her dönem **yeni bir sınıf** açılır; kod 1. haftada duyurulur
- Ders notları, sunumlar, indirilebilir belgeler: **ders web sitesi**
- Sınıfı ve **üniversite e-postanızı her gün** kontrol edin

<!-- Speaker note: İki kanal, her gün kontrol edilir — lojistik için sınıf, kişisel konular için e-posta. -->

---

# I. Akademik Dürüstlük, İntihal ve Kopya

Akademik dürüstlük RTEÜ'nün en önemli ilkelerinden biridir.

Bunu ihlal eden herkes **ağır şekilde cezalandırılır**.

"Birlikte çalışmak" doğaldır ve teşvik edilir — soru, bunun ne zaman
"akademik sahtekârlığa" dönüştüğüdür. Sonraki iki slayt bu sınırı çiziyor.

<!-- Speaker note: Sonraki iki slaytta yer almayan bir durum varsa kural basit: önce öğretim üyesine sorun. -->

---

# I.a Neler kabul edilebilir?

- Ödevi daha iyi anlamak için sınıf arkadaşlarıyla konuşmak
- İnternette bulunan fikir/alıntı/kod parçalarını **kaynak göstererek** kullanmak (çözümün tamamı olmamak koşuluyla)
- Ödevin **İngilizce dili** için yardım istemek
- Çözümleri diyagram veya özetle tartışmak, **gerçek metin ya da kod değil**
- Ödevi sizin yerinize yapmaması koşuluyla bir özel öğretmenle çalışmak

<!-- Speaker note: Ortak nokta: anlama yardımı serbest, hazır cevabı almak değil. -->

---

# I.b Neler kabul edilemez?

- Kendi çözümünüzü teslim etmeden önce bir sınıf arkadaşının çözümünü görmek istemek
- Dışarıdan bulup kullandığınız metin ya da kodun kaynağını belirtmemek
- Zorlanan bir sınıf arkadaşına kendi çözümünüzü vermek ya da göstermek

<!-- Speaker note: Üçü de yardımın YÖNÜYLE ilgili — tamamlanmış bir çözümü almak ya da vermek, onu tartışmak değil. -->

---

# J. Beklentiler

- Derslere **zamanında** katılın; haftalık gereksinimleri (okumalar, proje adımları) tamamlayın
- Ana kanal: **üniversite e-posta adresinizden** e-posta
- **Konu satırına ders kodu**, mesaja **adınızı** yazın
- Öğretim üyesi de e-posta ile ulaşır — **her gün** kontrol edin

<!-- Speaker note: Konu satırı kuralı, iletişim bilgileri slaytındakiyle aynı — tutarlı biçimde uygulanır. -->

---

# K. Ders İçeriği ve İzlence Güncellemeleri

Gerekli görülürse ders içeriği ya da ders takvimi **değişebilir**.

Bu belge kapsamındaki her değişiklik **öğretim üyesi tarafından duyurulur**.

<!-- Speaker note: Değişiklik istisnadır, kural değil — ama gerektiğinde dersin uyum sağlamasına izin veren madde budur. -->

---

<!-- _class: baslik -->

# Sorular?

**Ders web sitesi:** ucoruh.github.io/ce205-data-structures

**İletişim:** ugur.coruh@erdogan.edu.tr — konu **[CEN207]**

<!-- Speaker note: Ön Gereksinimler ve Proje Rehberi, her öğrencinin sonra okuması gereken iki sayfa. -->
