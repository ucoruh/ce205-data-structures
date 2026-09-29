---
title: "CEN207 Veri Yapıları — Ders İzlencesi"
subtitle: "2026-2027 Güz Yarıyılı"
author: "Dr. Öğr. Üyesi Uğur CORUH"
lang: tr-TR
---

# Recep Tayyip Erdoğan Üniversitesi

## Mühendislik ve Mimarlık Fakültesi — Bilgisayar Mühendisliği

### CEN207 Veri Yapıları (eski kodu CE205) — Ders İzlencesi

#### 2026-2027 Güz Yarıyılı

---

## Ders Bilgileri

| | |
| --- | --- |
| **Öğretim üyesi** | Dr. Öğr. Üyesi Uğur CORUH |
| **İletişim** | ugur.coruh@erdogan.edu.tr — konu satırı **[CEN207]** ile başlamalıdır |
| **Ofis** | F-301 |
| **Görüşme saatleri** | E-posta ile randevu; ofiste ya da üniversite hesabıyla çevrim içi |
| **Ders günü, saati, dersliği** | Cuma 13:00–16:00 · İİBF ve Hukuk Fakültesi Binası, D-402 (ED-K4-2) |
| **Ders web sitesi** | https://ucoruh.github.io/ce205-data-structures/ |
| **Ders sınıfı** | Her dönem yeni sınıf açılır; sınıf kodu 1. haftada duyurulur |
| **Eğitim dili** | İngilizce |
| **Tür / yarıyıl** | Zorunlu · 3. yarıyıl |
| **Haftalık saat / kredi / AKTS** | Kuramsal 3 saat · Kredi 3 · AKTS 5 |
| **Ön koşul** | CEN108 Algoritmalar ve Programlama II (eski kodu CE100) — ayrıntılar: [Ön gereksinimler](../prerequisites/index.md) |

---

## A. Dersin Tanımı

Bu ders, veri yapıları ve dosya organizasyonunun temellerini kapsar. Verinin programlarda — hem uygulamanın çalışma
zamanı belleğinde hem de uzun süreli dosya depolamasında — nasıl eşlendiğini açıklar; bu veri nesnelerinin
gerçekleştirimlerini, programlama biçimlerini ve çalışma zamanı gösterimlerini tartışır. Sıralama, arama ve çizge
algoritmalarını da ele alır. Amaç, dijital veri yapılarının gerçek dünya problemlerini nasıl çözdüğünü ve verinin
belleğe ya da depolamaya nasıl şekillendirilip eşlendiğini göstermektir. Ders uygulama odaklıdır: öğrenme yalnızca
kuramla değil, derste yapılan programlama uygulamaları ve dönem projesiyle pekiştirilir.

---

## B. Öğrenme Çıktıları

Bu dersi başarıyla tamamlayan öğrenci:

| Kod | Öğrenme çıktısı |
| --- | --- |
| ÖÇ.1 | Temel doğrusal (dizi, bağlı liste, yığın, kuyruk) ve doğrusal olmayan (ağaç, graf) veri yapılarının tanımlarını, temsillerini ve temel operasyonlarını açıklar. |
| ÖÇ.2 | Algoritmaların zaman ve uzay karmaşıklığını asimptotik notasyon (Büyük O) kullanarak analiz eder ve farklı veri yapılarının performansını karşılaştırır. |
| ÖÇ.3 | Temel sıralama (ekleme, seçim, hızlı, yığın) ve arama (doğrusal, ikili) algoritmalarını uygular, performanslarını analiz eder ve karşılaştırır. |
| ÖÇ.4 | İkili ağaçlar, ikili arama ağaçları, AVL ağaçları, B-ağaçları gibi dengeli/dengesiz ağaç yapılarını ve hash tablolarını uygular. |
| ÖÇ.5 | Graf veri yapısını (temsil yöntemleri) ve temel graf algoritmalarını (dolaşma, MST, en kısa yol) uygular. |
| ÖÇ.6 | Sıralı, doğrudan (hash tabanlı) ve indeksli sıralı dosya organizasyon tekniklerini açıklar ve uygulamalarını değerlendirir. |
| ÖÇ.7 | Verilen bir problemi analiz ederek problemin gereksinimlerine en uygun veri yapılarını ve algoritmaları seçer ve etkin bir çözüm geliştirir. |

### Öğrenme çıktılarının program çıktılarına katkısı (0–5)

| | PÇ.1 | PÇ.2 | PÇ.3 | PÇ.4 | PÇ.5 | PÇ.6–PÇ.12 |
| --- | --- | --- | --- | --- | --- | --- |
| ÖÇ.1 | 5 | – | – | – | – | – |
| ÖÇ.2 | 5 | – | – | – | – | – |
| ÖÇ.3 | – | – | – | 5 | – | – |
| ÖÇ.4 | – | 4 | 3 | 5 | – | – |
| ÖÇ.5 | – | 4 | 3 | 5 | – | – |
| ÖÇ.6 | – | – | – | 4 | 5 | – |
| ÖÇ.7 | 5 | 4 | – | 3 | – | – |

PÇ.1 Temel bilgi · PÇ.2 Problem çözme · PÇ.3 Tasarım · PÇ.4 Modern teknik ve araçlar · PÇ.5 Araştırma ve deney.

---

## C. Haftalık Program

Bütün değerlendirmeler için kural: **proje gösterimleri vize ve final haftalarının hemen öncesindeki haftada; quizler
vize ve final haftalarının içinde** yapılır, böylece her öğrenci katılabilir.

| Hafta | Tarih | Konular | ÖÇ |
| --- | --- | --- | --- |
| [1](../week-1/cen207-week-1.md) | 18.09.2026 (telafi 23.09) | Ders planı ve iletişim. Doğrusal ve doğrusal olmayan veri yapılarına giriş; performans analizi (Büyük O). Veri ve değişkenler için işaretçiler ve nesneler; bellek düzeni. ASN.1 / BER TLV / PER TLV temelleri. Yoğun C atölyesi (araç zinciri, derle–çalıştır–hata ayıkla). | 1, 2, 7 |
| [2](../week-2/cen207-week-2.md) | 25.09.2026 | Bağlı listeler (tekli, çift, dairesel, XOR) ve atlamalı listeler; diziler (döndürme, yeniden düzenleme, arama); matrisler ve seyrek matrisler. | 1, 7 |
| [3](../week-3/cen207-week-3.md) | 02.10.2026 | Yığınlar (dizi ve bağlı liste, LIFO); ifadeler (infix, postfix, prefix) ve dönüşümler; kuyruklar (standart, dairesel, çift uçlu, çok seviyeli; FIFO); Hanoi Kulesi; özyineleme (DFS'e hazırlık). | 1, 7 |
| [4](../week-4/cen207-week-4.md) | 09.10.2026 | Ağaçlar ve ikili ağaçlar; dolaşmalar (in-, pre-, post-order); yığınlar/heap (min, max, ikili, binom, Fibonacci, leftist, k-ary) ve öncelik kuyrukları; heap sıralama; Huffman kodlama. | 1, 4, 7 |
| [5](../week-5/cen207-week-5.md) | 16.10.2026 | Çizgeler: gösterimler (komşuluk matrisi, geliş matrisi, komşuluk listesi); dolaşmalar (BFS, DFS, yinelemeli derinleşme, derinlik sınırlı, çift yönlü); topolojik sıralama; su kabı problemi. | 1, 5, 7 |
| [6](../week-6/cen207-week-6.md) | 23.10.2026 | Arama (doğrusal, ikili, interpolasyon, Fibonacci); hashing ve hash tabloları (doğrudan adresli tablolar, hash fonksiyonları, zincirleme, açık adresleme, mükemmel hashing); çakışma çözümü uygulamaları. | 3, 4, 7 |
| [7](../week-7/cen207-week-7.md) | 30.10.2026 | **Ara proje gösterimleri (C)** ve ara proje raporu. | 1–5, 7 |
| [8](../week-8/cen207-week-8.md) | 31.10–08.11.2026 | **Ara sınav haftası — Quiz-1** (1–6. haftalar). | 1, 2, 4, 5, 7 |
| [9](../week-9/cen207-week-9.md) | 13.11.2026 | Çizge algoritmaları: minimum yayılan ağaçlar (Prim, ayrık kümelerle Kruskal), en kısa yollar (Dijkstra, Bellman–Ford), bağlantılılık ve SCC, maksimum akış, döngü tespiti (Floyd, Brent), geri izleme (n-vezir, m-renklendirme, Euler ve Hamilton yolları). | 3, 5, 7 |
| [10](../week-10/cen207-week-10.md) | 20.11.2026 | Sıralama algoritmaları ve sınıflandırma (ekleme, seçim, shell, hızlı, birleştirme, heap, radix, sayma, dış sıralama); sıralama yöntemlerinin karşılaştırılması. | 2, 3, 7 |
| [11](../week-11/cen207-week-11.md) | 27.11.2026 | Gelişmiş ağaçlar: ikili arama ağaçları, AVL, kırmızı-siyah, splay, B-ağacı ailesi (2-3, 2-3-4, B+, B#), veri yapılarının genişletilmesi; arama ağaçlarının karşılaştırılması. | 4, 7 |
| [12](../week-12/cen207-week-12.md) | 04.12.2026 | Stringler: string yapıları, arama algoritmaları (kaba kuvvet, Knuth–Morris–Pratt, Boyer–Moore, Horspool), LCS ve düzenleme uzaklığı (Levenshtein, Wagner–Fischer), hizalama (Needleman–Wunsch, Smith–Waterman), trie ve Patricia ağaçları. | 1, 3, 4, 7 |
| [13](../week-13/cen207-week-13.md) | 11.12.2026 | Dosya organizasyonu I: sıralı dosyalar (ikili, interpolasyon, kendini düzenleyen arama); doğrudan dosyalar ve hash fonksiyonları; çakışma çözümü (birleşik hashing, ilerleyen taşma, çift hashing, kovalar, Brent yöntemi); mükemmel hashing. | 6, 7 |
| [14](../week-14/cen207-week-14.md) | 18.12.2026 | Dosya organizasyonu II: indeksli sıralı dosyalar; ikincil anahtarla erişim; dosyalar için ikili ve B-ağacı yapıları; genişleyebilen dosyalar için hashing (genişletilebilir, dinamik, doğrusal hashing); k-d ağaçları ve ızgara dosyaları; dış dosya sıralama. | 3, 4, 6, 7 |
| [15](../week-15/cen207-week-15.md) | 25.12.2026 | **Final proje gösterimleri (Java)** ve final proje raporu. | 1–7 |
| [16](../week-16/cen207-week-16.md) | 04–17.01.2027 | **Final sınav dönemi — Quiz-2** (9–14. haftalar). | 2–7 |

Önceki yıllardan korunan ve ders notlarında isteğe bağlı okuma olarak işlenen zenginleştirme konuları: alfa-beta
budama, Hasse diyagramları, Petri ağları, iki parçalı çizgeler, Bayes ağları, van Emde Boas ağaçları, SimHash,
trie hashing.

---

## D. Kaynaklar, Yazılım ve Donanım

Ana kaynak, ders web sitesindeki ders notlarıdır ve kendi başına yeterlidir. İleri okuma için önerilen kitaplar:

- Deitel & Deitel. *C How to Program*, 7. baskı. Prentice Hall, 2013.
- Y. Daniel Liang. *Introduction to Java Programming, Comprehensive Version*, 10. baskı.
- T. H. Cormen, C. E. Leiserson, R. L. Rivest, C. Stein. *Introduction to Algorithms*, 3. baskı. MIT Press.
- J. R. Hanly, E. B. Koffman. *Problem Solving and Program Design in C*, 6. baskı.
- A. L. Tharp. *File Organization and Processing*. Wiley, 1988.
- P. Brass. *Advanced Data Structures*. Cambridge University Press, 2008.
- R. Sedgewick, K. Wayne. *Algorithms*, 4. baskı. Addison-Wesley, 2011.

**Dizüstü bilgisayar gereklidir.** Derste, ödevlerde ve projede kendi geliştirme ortamınızı kullanacaksınız: C/C++
derleyicisi (GCC, Clang ya da MSVC), CMake, GoogleTest, Doxygen, JDK 21 ile Maven ve JUnit 5, Git ve bir GitHub
hesabı. Kurulum adımları 1. haftada ve ders notlarında verilir; proje şablonları sağlanır. Araç zincirinin tam
kontrol listesi için [Ön gereksinimler](../prerequisites/index.md) sayfasına bakın.

---

## E. Değerlendirme

Dönem boyunca **tek bir proje** yürütülür; her biri kendi rubriğiyle değerlendirilen iki ara kontrolü vardır: vize
kontrolü (C gerçekleştirimi) ve final kontrolü (Java gerçekleştirimi). Ayrıca ara sınav haftasında bir, final
döneminde bir quiz yapılır. Proje konuları, takım oluşturma kuralları, teslimler ve **ayrıntılı vize ve final
rubrikleri** (kriterler, puanlar, ilişkili öğrenme çıktıları ve başarı düzeyleri) dersin
[proje rehberinde](../project-guide/index.md) verilir.

| Değerlendirme | Kod | Ağırlık | Zaman |
| --- | --- | --- | --- |
| Proje kontrolü 1 — C gerçekleştirimi, rapor ve gösterim (rubrik) | RAP1 | Vizenin %60'ı | 7. hafta (30.10.2026) |
| Quiz-1 (1–6. haftalar) | QUIZ1 | Vizenin %40'ı | 8. hafta, ara sınav haftası (31.10–08.11.2026) |
| Proje kontrolü 2 — Java gerçekleştirimi, rapor ve gösterim (rubrik) | RAP2 | Finalin %70'i | 15. hafta (25.12.2026) |
| Quiz-2 (9–14. haftalar) | QUIZ2 | Finalin %30'u | 16. hafta, final dönemi (04–17.01.2027) |

$$
Not_{Vize} = 0.6\,RAP1 + 0.4\,QUIZ1 \qquad Not_{Final} = 0.7\,RAP2 + 0.3\,QUIZ2
$$

$$
Başarı\ Notu = 0.4\,Not_{Vize} + 0.6\,Not_{Final}
$$

### İş yükü (AKTS 5 = 125 saat)

| Etkinlik | Sayı | Süre | Toplam |
| --- | --- | --- | --- |
| Derse Katılım | 14 | 3 | 42 |
| Bireysel Çalışma (haftalık notlar ve örnekler) | 14 | 1 | 14 |
| Quiz (ara sınav haftası ve final dönemi) | 2 | 2 | 4 |
| Quiz için Bireysel Çalışma | 2 | 10 | 20 |
| Proje Hazırlama (C ve Java kontrolleri) | 2 | 16 | 32 |
| Rapor Hazırlama | 2 | 5 | 10 |
| Proje Sunma (gösterim ve sorular) | 2 | 1,5 | 3 |
| **Toplam** | | | **125** |

---

## F. Öğretim Yöntemleri

Dersler sınıfta yüz yüze yapılır; anlatım, soru–cevap ve uygulamalı programlama bir arada kullanılır. Her içerik
haftası ders notu, sunum, çözümlü örnekler ve kendini sınama sorularıyla birlikte gelir. Duyurular, kaynaklar ve
teslimler ders sınıfında yürütülür. Yoklama alınır.

---

## G. Geç Teslim

Dönem boyunca ödevler duyurulan son tarihe kadar teslim edilmelidir. Süresi geçmiş ödevler kabul edilmez. Beklenmedik
durumlar öğrenci tarafından öğretim üyesine bildirilmelidir.

---

## H. Ders Platformu ve İletişim

Bütün duyurular, kaynaklar ve teslimler her dönem yeniden açılan ders sınıfında paylaşılır; sınıf kodu 1. haftada
duyurulur. Ders notları, sunumlar ve indirilebilir belgeler ders web sitesindedir. Sınıfı ve üniversite e-postanızı her
gün kontrol edin.

---

## I. Akademik Dürüstlük, İntihal ve Kopya

Akademik dürüstlük RTEÜ'nün en önemli ilkelerinden biridir. Akademik dürüstlük ilkelerini ihlal eden herkes ağır
şekilde cezalandırılır.

Sınıf arkadaşlarıyla ve başkalarıyla "birlikte çalışmak" doğaldır. Bir öğrencinin zor bir konuyu ya da bütün bir dersi
daha iyi anlamak için ücretli ya da ücretsiz yardım istemesi de mümkündür. Peki "birlikte çalışmak" ya da "özel ders
almak" ile "akademik sahtekârlık" arasındaki sınır nedir? Ne zaman intihal, ne zaman kopya olur?

Sınav sırasında başka bir öğrencinin kâğıdına ya da izin verilenler dışındaki bir kaynağa bakmak kopyadır ve
cezalandırılır. Ancak pek çok öğrenci, özellikle ödevlerde neyin kabul edilebilir olduğu ve neyin "kopya" sayıldığı
konusunda çok az deneyimle üniversiteye gelir. Aşağıdaki ilkeler notlandırılan ödevlerde akademik dürüstlük anlayışını
açıklar. Aşağıda tanımlanmayan bir durumla karşılaşırsanız, yapmak istediğinizin akademik dürüstlük çerçevesinde kalıp
kalmadığını öğretim üyesine sorun.

### a. Ödev hazırlarken neler kabul edilebilir?

- Ödevi daha iyi anlamak için sınıf arkadaşlarıyla konuşmak.
- İnternette ya da başka bir yerde bulduğunuz fikirleri, alıntıları, paragrafları ya da küçük kod parçalarını,
  çözümün tamamı olmamak ve kaynağını belirtmek koşuluyla ödevinize eklemek.
- Ödevinizin İngilizce dili konusunda yardım istemek.
- Tartışmalı bir konuda sınıf içi tartışma başlatmak için ödevinizin küçük parçalarını paylaşmak.
- Talimatlar, başvuru kaynakları ve teknik sorunların çözümü için internete ya da başka kaynaklara başvurmak; ama
  ödevin doğrudan cevabı için değil.
- Çözümleri gerçek metin ya da kod yerine diyagramlar veya özet ifadelerle başkalarıyla tartışmak.
- Ödevinizi sizin yerinize yapmaması koşuluyla bir özel öğretmenle (ücretli de olabilir) çalışmak.

### b. Neler kabul edilemez?

- Kendi çözümünüzü teslim etmeden önce bir sınıf arkadaşınızdan çözümünü görmek istemek.
- Ders dışında bulup çalışmanıza kattığınız herhangi bir metnin ya da kodun kaynağını belirtmemek.
- Problemi çözmekte zorlanan bir sınıf arkadaşınıza kendi çözümünüzü vermek ya da göstermek.

---

## J. Beklentiler

Derslere zamanında katılmanız ve haftalık gereksinimleri (okumalar ve proje adımları) tamamlamanız beklenir. Öğretim üyesi ile öğrenciler arasındaki ana iletişim kanalı e-postadır. Sorularınızı üniversite
e-posta adresinizden gönderin; **konu satırına ders kodunu, mesaja adınızı yazın**. Öğretim üyesi de gerektiğinde
sizinle e-posta ile iletişime geçer; bu yüzden e-postanızı her gün kontrol edin.

---

## K. Ders İçeriği ve İzlence Güncellemeleri

Gerekli görülürse ders içeriği ya da ders takvimi değiştirilebilir. Bu belge kapsamındaki her değişiklik öğretim üyesi
tarafından duyurulur.
