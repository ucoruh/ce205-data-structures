---
marp: true
theme: default
style: |
    img[alt~="center"] {
      display: block;
      margin: 0 auto;
    }
_class: lead
paginate: true
backgroundColor: #fff
backgroundImage: url('https://marp.app/assets/hero-background.svg')
header: 'CE205 Veri Yapıları Ders İçeriği'
footer: '![height:50px](http://erdogan.edu.tr/Images/Uploads/MyContents/L_379-20170718142719217230.jpg) RTEÜ CE205 Ders İçeriği'
title: "CE205 Veri Yapıları"
author: "Yazar: Dr. Öğr. Üyesi Uğur CORUH"
date:
subtitle: "Detaylı Ders İçeriği"
geometry: "left=2.54cm,right=2.54cm,top=1.91cm,bottom=1.91cm"
titlepage: true
titlepage-color: "FFFFFF"
titlepage-text-color: "000000"
titlepage-rule-color: "CCCCCC"
titlepage-rule-height: 4
logo: "assets/2021-10-19-15-01-36-image.png"
logo-width: 100 
page-background:
page-background-opacity:
links-as-notes: true
lot: true
lof: true
listings-disable-line-numbers: true
listings-no-page-break: false
disable-header-and-footer: false
header-left:
header-center:
header-right:
footer-left: "© Dr. Uğur CORUH"
footer-center: "Lisans: CC BY-NC-ND 4.0"
footer-right:
subparagraph: true
lang: tr-TR
math: katex
tags:
  - ce205-syllabus
  - data-structures
  - fall-2024
  - asn-1
ref_link: na
---

<!-- _backgroundColor: aquq -->

<!-- _color: orange -->

<!-- paginate: false -->

<img src="http://erdogan.edu.tr/Images/Uploads/MyContents/L_379-20170718142719217230.jpg" title="" alt="height:100px" width="95">

# Recep Tayyip Erdoğan Üniversitesi

## Mühendislik ve Mimarlık Fakültesi

## Bilgisayar Mühendisliği

### CE205-Veri Yapıları

#### Ders İçeriği

#### Güz Dönemi, 2021-2022

---

Download 
- [PDF](pandoc_syllabus.pdf)
- [DOCX](pandoc_syllabus.docx)
- [SLIDE](syllabus.pdf)

Download Legacy 
- [WORD](2022-2023-fall-ce205-data-structures-comp-eng.docx)
- [PDF](2022-2023-fall-ce205-data-structures-comp-eng.pdf)

--- 

<iframe width=700, height=500 frameBorder=0 src="../syllabus.html"></iframe>

---

<!-- paginate: true -->

| Öğretim Üyesi                | Dr. Öğr. Üyesi Uğur CORUH                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **İletişim Bilgileri**       | ugur.coruh@erdogan.edu.tr                                                                                          |
| **Ofis Numarası**            | F-301                                                                                                              |
| **Teams Kodu**               | h3cl51i                                                                                                            |
| **Ders Saatleri ve Günleri** | **Salı** 15:00/15:45 - 16:00-16:45 (2 saat) (Teori) / **Cuma** (09:00-09:45) (Teori) 10:00/10:45-11:00/11:45 (Lab) |

---

| **Ders Sınıfı**   | İBBF 402 Düzey-4                                                                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ofis Saatleri** | Toplantılar Google Meet üzerinden üniversite hesabınızla ve email ile planlanacaktır. Hızlı cevap için lütfen e-postanın başlığını [CE205] etiketi ile gönderin ve resmi, net ve kısa yazın. |

---

| **Ders ve İletişim Dili**                 | Türkçe                                                                      |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| **Teori/Laboratuvar Haftalık Ders Saati** | 3/2 Saat                                                                    |
| **Kredi**                                 | 4                                                                           |
| **Ön Koşul**                              | CE103- Algoritmalar ve Programlama I, CE100- Algoritmalar ve Programlama II |
| **Yan Koşul**                             | Tanımlanacak                                                                |
| **Zorunluluk**                            | Tanımlanacak                                                                |

*Tanımlanacak (TBD).

---

## A.    Ders Tanımı

Bu ders, veri yapılarının ve dosya organizasyonunun temellerini kapsamaktadır. Ders, dijital verilerin programlamada kullanılmasını ve verilerin uygulama çalışma zamanı belleğinde ya da uzun süreli dosya depolama alanında nasıl kullanıldığını açıklar. Veri nesnelerinin çeşitli uygulamaları ve programlama tarzları üzerinde durulur. Ayrıca sıralama, arama ve grafik algoritmaları da işlenir. Bu dersin amacı, gerçek dünya problemleri için dijital veri yapıları sağlamak, verilerin belleğe veya depolama çözümlerine nasıl haritalandığını göstermektir. Ders programlama uygulamaları ve projeleri ile pekiştirilerek, teoriden ziyade pratik yapılarak öğrenme süreci güçlendirilecektir.

---

## B.    Dersin Öğrenme Çıktıları

Bu dersi başarıyla tamamlayan bir öğrenci:

- Diziler, matrisler, bağlantılı yapılar, kuyruklar, yığınlar, ağaçlar ve grafikler gibi yaygın lineer ve non-lineer veri yapılarını tanımlayabilecek.

- Dinamik ve statik veri yapılarını karşılaştırıp faydalarını analiz edebilecek.

---

- Endüstriyel veri yapılarına yönelik ASN.1 / BER TLV / PER TLV gibi temel tanımları anlayacak.

- Uygulama çalışma zamanı verilerini dosyada nasıl depoladığını ve organize ettiğini açıklayabilecek.

- Veri yapısı temelli bir problem çözümü için C/C++, Java veya C# uygulamalarıyla bu problemin çözümünde veri yapıları kullanabilecek.

- Veri yapılarını performans ve analiz açısından karşılaştırıp, zaman ve alan karmaşıklığını analiz edebilecek.

---

- Veri yapıları temelli sıralama ve arama algoritmalarını anlayacak.

- Dosya organizasyonu ve işlenmesi için hashing ve indeksleme yöntemlerini açıklayabilecek.

- Bellek ve dosya depolama alanındaki temel sıralama, arama ve hashing algoritmalarının hesaplama verimliliğini tartışabilecek.

- Programlama becerilerini veri yapıları bilgisiyle birleştirip gerçek hayattaki problemlere etkin çözümler üretebilecek.

---

## C.    Ders Konuları

---

- Kullanılan Veri, Aktarılan Veri ve Hareketsiz Veri kavramları.

- Veri Yapılarında Zaman ve Mekan Karmaşıklığı Analizi

- Veri ve Değişken Haritalamaları

---

- ASN.1 / BER TLV / PER TLV

---

- Bağlantılı Listeler (Tek, Dairesel, Çift, XOR)

- Skip List

---

- Strand Sıralama Algoritması

- Diziler (Döndürme, Düzenleme, Yeniden Düzenleme, Arama ve Sıralama)

---

- Matrisler ve Seyrek Matrisler

---

- Yığınlar (Dizi ve Bağlantılı Liste) ve FILO (İlk Giren Son Çıkar)

- İfadeler (Infix, Postfix ve Prefix) ve Infix’ten Postfix’e Dönüşümler ve Postfix Değerlendirme

- Kuyruklar (Standart, Dairesel ve Çift Uçlu) (Dizi ve Bağlantılı Liste) (FIFO-İlk Giren İlk Çıkar veya FCFS-İlk Gelen İlk Hizmet Alır)

- Çok Seviyeli Kuyruklar (MLQ)

- Hanoi Kulesi Problemi

---

- Ağaç Yapıları ve İkili Ağaçlar ve Gezinmeler (Sıralı, Öncelikli, Artikullu)

- Heap’ler (Max, Min, İkili, Binom, Fibonacci, Solcu, K-ary) ve Öncelikli Kuyruk

- Heap Sıralama

- Huffman Kodlaması

---

- Grafik Temsilleri (Bitişiklik Matrisi, Olay Matrisi, Bitişiklik Listesi) ve Temel Kavramlar

- Grafik Gezinme Algoritmaları (Derinlik Öncelikli Arama (DFS), İteratif Derinleşen Arama (IDS) veya İteratif Derinleşen Derinlik Öncelikli Arama (IDDFS), Genişlik Öncelikli Arama (BFS), Derinlik Sınırlı Arama, Tekdüze Maliyet Araması, İki Yönlü Arama)

- Su Kovası Problemi

---

- Grafik Üst Sıralama (Topolojik Sıralama)

- Grafik Minimum Örtücü Ağaç (MST)

- Grafik Geri İzleme (n-Dam Problemi, m-Renkleme, Euler ve Hamilton Yolları)

- Grafik En Kısa Yollar

- Grafik Bağlantısı, Max Akış, İzomorfizm, Kanonizasyon ve Kesitler (Max /Min)

---

- Alpha-Beta Budaması

- Hasse Diyagramları

- Petri Ağları

- İki Bölmeli Grafikler

- Grafik Döngü Algılama (Brent, Tavşan ve Kaplumbağa Algoritmaları)

- Bayes Ağı

- Doğrusal, İkili, Aralıklı ve Fibonacci Arama Algoritmaları

- Hashing ve Hash Tabloları (Doğrudan Adres Tabloları, Hash Tabloları, Hash Fonksiyonları, Açık Adresleme, Mükemmel Hashing)

---

- Yaygın Sıralama Algoritmaları (Ekleme, Seçim, Radix, Quick, Heap, Permütasyon, Gnome, Comb, Flash, Stooge, Arı, Şanslı, Dolaylı (Pointer), Harici (Segmentlenmiş), Çalkalama/Çift Yönlü Bubble, Shell Sıralama)

- Sıralama Yöntemlerinin Karşılaştırılması

- Yaygın Ağaç Veri Yapıları ve İşlemleri (İkili Arama Ağacı, AVL Ağacı, B Ağacı ve Türevleri (2 3 4 Ağaçlar, 2 3 Ağaçları, B+ Ağaçları, B# Ağaçları), R Ağacı, Kırmızı-Siyah Ağacı, Splay Ağacı, Van Emde Boas Ağacı, Binom Ağacı, Minimax Ağacı)

- Arama Ağaçlarının Karşılaştırılması

---

- Veri Yapılarını Geliştirme

- Dize LCS Problemi (Hunt Macllory, Levenstein, Wagner-Fischer)

- Dize Hizalama (Needleman Wunsch, Smith Waterman, Hunt Macllory), Tokenizer ve Karşılaştırma

- Dize Arama (Ters Faktör) Algoritmaları (Knuth-Morris-Pratt, Horspool, Boyer Moore, Brute-Force, DFA Metin Arama)

---

- Tries ve Patricia Ağaçları (Radix Ağacı)

- Ayrık Kümeler için Veri Yapıları

- Ardışık Dosya Organizasyonu (İkili Arama, Aralıklı Arama, Kendini Düzenleyen Ardışık Arama)

- Doğrudan Dosya Organizasyonu Bilgi Bulma

- Doğrudan Dosya Organizasyonu Hashing Fonksiyonları (MD5, HAVAL, SHA1, Anahtar Mod N, Anahtar Mod P, Kısaltma, Katlama, Kareleme, Radix Dönüşümü, Polinom Hashing, Alfabetik Anahtarlar, Çatışmalar)

- Doğrudan Dosya Organizasyonu Çatışma Çözümü

---

- Doğrudan Dosya Organizasyonu Birleşik Hashing (EISCH, LISCH, BEISCH, BLISCH, REISCH, RLISCH, EICH, LICH)

- Doğrudan Dosya Organizasyonu İlerleyici Taşma (Doğrusal Denetim, Kuadratik Denetim)

- Doğrudan Dosya Organizasyonu Çift Hashing, Kova Kullanımı, Doğrusal Katsayı, Brent Yöntemi, İkili Ağaç ve Hesaplanmış Zincirleme Ekleme (CCI)

- Mükemmel Hashing ve SimHash Doğrudan Dosya Organizasyonu

- Çatışma Çözme Yöntemlerinin Karşılaştırılması

---

- İndeksli Ardışık Dosya Organizasyonu

- İkincil Anahtar Erişimleri ve Sınıflandırma ve Kontrol için Bitler ve Hashing

- Dosyalar için İkili Ağaç Yapıları (İkili Arama, AVL Ağaçları, Dahili Yol Azaltma Ağaçları)

- Dosyalar için B Ağaçları ve Türevleri (B Ağacı, B+ Ağacı, B# Ağacı)

- Genişletilebilir Dosyalar için Hashing Teknikleri (Genişletilebilir, Dinamik ve Doğrusal Hashing)

---

- Tries, Yaklaşık Dize Eşleşmesi, Trie Hashing, Patricia Ağacı ve Dijital Arama Ağacı Dosya Organizasyonu

- İkincil Anahtar Erişimi (K-d Ağaçları ve Izgara Dosyaları)

- Dosya Sıralama (Ekleme, Hızlı, Yığın Sıralama, Harici Sıralama, Birleştirerek Sıralama ve Disk Sıralaması)

---

## D.    Ders Kitapları ve Gerekli Donanım veya Ekipman

Bu dersin bir ders kitabı gerekmemektedir.
Gerekirse, aşağıdaki kitaplar ve açık kaynaklı çevrimiçi kaynaklar kullanılabilir.

---

- *C Nasıl Programlanır, 7/E. Deitel & Deitel. 2013, Prentice-Hall.*

- *Java Programlamaya Giriş, Kapsamlı Versiyon (10. Baskı) 10. Baskı Y. Daniel Liang*

- *Algoritmalara Giriş, Üçüncü Baskı Thomas H. Cormen,
  Charles E. Leiserson, Ronald L. Rivest ve Clifford Stein tarafından*

---

- *C'de Problem Çözme ve Program Tasarımı, J.R. Hanly ve E.B. Koffman, 6. Baskı.*

- *Alan L. Tharp. 1988. Dosya organizasyonu ve işleme. John Wiley & Sons, Inc., ABD.*

- *Richard Jankowski. 2010. Peter Brass tarafından ileri veri yapıları.
  Cambridge University Press 2008. SIGACT News 41, 1 (Mart 2010), 19–20.
  DOI:https://doi.org/10.1145/1753171.1753176*

- *Robert Sedgewick ve Kevin Wayne. 2011. Algoritmalar (4. baskı).
  Addison-Wesley Professional.*

---

- *Ek Kitaplar Tanımlanacak*

<u>Bu ders boyunca programlama uygulamaları için bir dizüstü bilgisayara ihtiyacınız olacaktır. Geliştirme ortamınız olacak ve bunu sınavlar, ödevler ve sınıf uygulamaları için kullanacaksınız. </u>

---

## E.Değerlendirme

Dönem boyunca 1 adet Proje ve 2 adet yazılı Quiz olacaksınız. Vize zamanı Proje Ara Raporu Teslim Etmeniz ve Projenizin İlermesini İspatlayıcı Şekilde Çıktılar Oluşturmanız ve Projenizin Proje Planına Sadık Kalmanız Gerekiyor. 15. Hafta Projenizin Sonuç Raporunu ve Sunumunu Yapacaksınız. 8. Hafta 1 Adet Yazılı Quiz Olacaksınız ve 14. Hafta da 1 adet Yazılı Quiz Olacaksınız. 

---

| Değerlendirme            | Kısaltma | Oran | Kapsam |
| ------------------------ | -------- | ---- | ------ |
| Proje Ara Raporu Teslimi | RAP1     | %60  | Vize   |
| Quiz-1                   | QUIZ1    | %40  | Vize   |
| Proje Final Raporu       | RAP2     | %70  | Final  |
| Quiz-2                   | QUIZ2    | %30  | Final  |

$$
Not_{Vize} = 0.6RAP1 + 0.4QUIZ1
$$

$$
Not_{Final}=0.7RAP2 + 0.3QUIZ2
$$

$$
\text{Geçme Notu}=(40*Not{Vize}+60*Not_{Final})/100
$$

---

## F. Öğretim Stratejileri ve Yöntemleri

Bu dersin temel öğretim yöntemi, sınıfta yüz yüze eğitim olarak planlanmıştır ve destekleyici kaynaklar, ödevler ve duyurular Google Classroom üzerinden paylaşılacaktır. Öğrencilerin üniversitede olması beklenmektedir. Bu sorumluluk, bu dersi başarıyla tamamlamanın önemli bir parçasıdır. Pandemi durumu değişir ve bu dersin uzaktan eğitim ile yapılması gerekirse, bu ders eşzamanlı ve eşzamansız uzaktan eğitim yöntemleri ile yapılacaktır. Bu senaryoda, ders programında belirtilen zamanda çevrimiçi platformda (zoom veya meet) olmanız beklenmektedir. Yoklama alınacaktır.

---

## G. Geç Teslim Edilen Ödevler

Dönem boyunca verilen ödevler belirtilen tarihe kadar teslim edilmelidir. Geç teslim edilen ödevler kabul edilmeyecektir.

Beklenmedik durumlar için öğrencilerin ödev gecikmelerini öğretim üyesine bildirmesi gerekmektedir.

---

## H. Ders Platformu ve İletişim

Ders öğrenme yönetim sistemi olarak Google Classroom kullanılacaktır. Dersle ilgili tüm elektronik kaynaklar ve duyurular bu platformda paylaşılacaktır. Başarıyla tamamlayabilmek için ders sayfasını günlük olarak kontrol etmek, gerekli kaynaklara ve duyurulara erişmek ve ihtiyaç duyduğunuzda öğretim üyesi ile iletişim kurmak çok önemlidir.

---

## I. Akademik Dürüstlük, Plagiarizm ve Kopya

Akademik dürüstlük, Recep Tayyip Erdoğan Üniversitesi'nin en önemli ilkelerinden biridir. Akademik dürüstlük ilkelerine aykırı davranan herkes ağır şekilde cezalandırılır.

---

 Sınıf arkadaşlarınızla "birlikte çalışmak" için etkileşimde bulunmak doğaldır. Bir öğrenci zor bir konuyu veya tüm dersi daha iyi anlamak için ücretli veya ücretsiz olarak başka birinden yardım istemesi de doğal olabilir. Ancak, "birlikte çalışmak" veya "özel ders almak" ile "akademik sahtekarlık" arasındaki sınır nedir? Plagiarizm (intihal) ne zaman olur, kopya ne zaman olur?

---

Bir başka öğrencinin kağıdına veya sınavda izin verilen kaynaklar dışında herhangi bir kaynağa bakmanın kopya olduğu açıktır ve cezalandırılır. Ancak, birçok öğrencinin üniversiteye çok az deneyimle geldiği, neyin kabul edilebilir olduğu ve "kopya" olarak sayıldığı konusunda çok az deneyime sahip olduğu bilinmektedir, özellikle ödevler söz konusu olduğunda.

Mühendislik ve Mimarlık Fakültesi öğrencileri için akademik dürüstlük felsefesini vurgulamak için aşağıdaki yönergeler belirlenmiştir. Aşağıda belirtilmeyen bir durumla karşılaşılması durumunda, öğrencinin yapmak istediği şeyin akademik dürüstlük çerçevesinde kalıp kalmayacağını sorması önerilir.

---

### a. Bir ödev hazırlarken ne kabul edilebilir?

- Ödevi daha iyi anlamak için sınıf arkadaşlarınızla iletişim kurmak

---

- İnternette veya başka bir yerde bulduğunuz fikirler, alıntılar, paragraflar, küçük kod parçalarını (snippet) ödevinize eklemek, ancak
  
  - bunlar ödevin tüm çözümü değilse,
  
  - kaynakları doğru bir şekilde belirtirseniz

---

- Ödevinizin İngilizce içeriği için kaynaklardan yardım almak.

- Tartışmalı konular üzerine sınıfta tartışma yaratmak için ödevinizin küçük bir kısmını paylaşmak.

---

- Teknik zorluklar için talimatlar, referanslar ve çözümler aramak, ancak ödevin doğrudan cevaplarını bulmaya çalışmamak.

- Ödev çözümlerini başkalarıyla şemalar veya özetlenmiş ifadelerle tartışmak, ancak gerçek metin veya kod paylaşmamak.

- Dersle ilgili bir öğretmenden yardım almak (hatta ücretli), ancak öğretmenin ödevi sizin yerinize yapmaması koşuluyla.

---

### b. Ne kabul edilemez?

- Ödevinizi teslim etmeden önce bir arkadaşınızdan çözümünü istemek.

- Ders dışı kaynaklardan bulduğunuz metinlerin (veya programlama derslerinde kodların) kaynaklarını belirtmemek.

- Bir sınıf arkadaşınıza çözümü göstermek veya zorlandığında çözümü vermek.

---

## J. Beklentiler

Derslere zamanında katılmanız ve dönem boyunca haftalık ders gereksinimlerini (okumalar ve ödevler) tamamlamanız beklenmektedir. Öğretim üyesi ile öğrenciler arasındaki ana iletişim kanalı email olacaktır. Lütfen dersle ilgili sorularınızı üniversitenin size sağladığı e-posta adresi üzerinden öğretim üyesine iletin. ***Mesajınızın konu alanına ders adını ve metin alanına isminizi eklediğinizden emin olun***. Ayrıca, öğretim üyesi gerekli olduğunda sizinle e-posta yoluyla iletişime geçecektir. Bu nedenle, sağlıklı bir iletişim için e-posta adresinizi her gün kontrol etmeniz çok önemlidir.

---

## K. Ders İçeriği ve Güncellemeler

Gerekirse, ders içeriği veya ders programında değişiklikler yapılabilir. Bu belgenin kapsamındaki herhangi bir değişiklik yapılırsa, öğretim üyesi sizi bilgilendirecektir.

---

## Ders Planı Genel Görünümü

| Haftalar | Tarihler   | Konular                                                                                                                                                                                 | Diğer Görevler |
| -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Hafta 1  | 27.09.2024 | Ders Planı ve İletişim, Doğrusal ve Doğrusal Olmayan Veri Yapıları ve Performans Analizi, Veri ve Değişkenler için Gösterici ve Nesne Uygulamaları, ASN.1 / BER TLV / PER TLV Temelleri | TBD            |
| Hafta 2  | 04.10.2024 | Bağlı Listeler ve İlgili Algoritmalar, Diziler ve Matrisler                                                                                                                             | TBD            |

---

| Hafta 3 | 11.10.2024 | Yığınlar, Kuyruk Yapıları ve İlgili Algoritmalar ve Problemler                    | TBD |
| ------- | ---------- | --------------------------------------------------------------------------------- | --- |
| Hafta 4 | 18.10.2024 | Ağaç Veri Yapısı Türleri ve Uygulamaları (İkili Ağaç, Ağaç Dolaşmaları, Yığınlar) | TBD |
| Hafta 5 | 25.10.2024 | Grafik Veri Yapıları ve Dolaşmalar                                                |     |

---

| Hafta-6 | 01.11.2024 | Grafik MST, Geri İzleme, Topolojik Sıralama, En Kısa Yollar, Bağlantı, Maksimum Akış ve Döngü Algılama Algoritmaları. Grafik İzomorfizmi ve Kanonizasyon, Grafik Kesitleri | TBD |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| Hafta-7 | 08.11.2024 | Doğrusal, İkili ve Fibonacci Arama, Hashing ve Hash Tabloları ile Mükemmel Hashing                                                                                         | TBD |
| Hafta-8 | 15.11.2024 | **Quiz-1 + Ara Proje Raporu Teslimi**                                                                                                                                      | TBD |

---

| Hafta-9  | 22.11.2024 | Sıralama Algoritmaları, Sınıflandırma ve Karşılaştırmalar                                                                                                                                                                | TBD |
| -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| Hafta-10 | 29.11.2024 | İleri Ağaç Veri Yapıları (İkili Arama Ağacı, AVL Ağacı, B Ağaçları ve türevleri, Kırmızı-Siyah Ağaçlar, Splay Ağaçları ve Gelişmiş Veri Yapıları, van Emde Boas Ağaçları, Binom ve Minimax Ağaçlar) ve Karşılaştırmalar. | TBD |
| Hafta-11 | 06.12.2024 | Dize Veri Yapısı, Alt Dizi Arama, Hizalama ve Karşılaştırma Algoritmaları                                                                                                                                                | TBD |

---

| Hafta-12 | 13.12.2024 | Dize Arama Algoritmaları, Tries, Bağımsız Kümeler için Veri Yapıları                                                                                                              | TBD |
| -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| Hafta-13 | 20.12.2024 | Dosya Organizasyonu ve İşleme Giriş, Sıralı Dosya Organizasyonu, Doğrudan Dosya Organizasyonu Hash Yöntemleri + Doğrudan Dosya Organizasyonu İndeksleri, İkili ve B Ağaç Yapıları | TBD |
| Hafta-14 | 27.12.2024 | **Quiz-2**                                                                                                                                                                        | TBD |

---

| Hafta-15 | 03.01.2025 | Genişletilebilir Dosyalar için Hashing Teknikleri, Tries, Yaklaşık Dize Eşleştirme, Trie Hashing, İkincil Anahtar Getirme (2) Dosya Sıralama | TBD |
| -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| Hafta-16 | 10.01.2025 | **Proje İncelemesi ve Sunumu**                                                                                                               | TBD |



----



## Ders Programı Genel Bakış

| Haftalar | Tarihler              | Konular                                                                                                                                                                                 | Diğer Görevler |
|:-------- |:--------------------- |:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |:-------------- |
| Hafta 1  | 20.09.2022 23.09.2022 | Ders Planı ve İletişim, Lineer & Non-Lineer Veri Yapıları ve Performans Analizi, Veri ve Değişkenler için Nesnelerin ve Göstericilerin Uygulanması, ASN.1 / BER TLV / PER TLV Temelleri | Tanımlanacak   |
| Hafta 2  | 27.09.2022 30.09.2022 | Bağlantılı Listeler ve İlgili Algoritmalar, Diziler ve Matrisler                                                                                                                        | Tanımlanacak   |

---

| Hafta 3 | 04.10.2022 07.10.2022 | Yığınlar, Kuyruk Yapıları ve İlgili Algoritmalar ve Problemler.                    | Tanımlanacak |
|:------- |:--------------------- |:---------------------------------------------------------------------------------- |:------------ |
| Hafta 4 | 11.10.2022 14.10.2022 | Ağaç Veri Yapıları Türleri ve Uygulamaları (İkili Ağaç, Ağaç Gezinmeleri, Heapler) | Tanımlanacak |
| Hafta 5 | 18.10.2022 21.10.2022 | Grafik Veri Yapıları ve Gezinmeler                                                 |              |

---

| Hafta-6 | 25.10.2022 28.10.2022 | Grafik MST, Geri İzleme, Topolojik Sıralama, En Kısa Yollar, Bağlantı, Max Akış ve Döngü Algoritmaları. Grafik İzomorfizm ve Kanonizasyon, Grafik Kesitleri | Tanımlanacak |
|:------- |:--------------------- |:----------------------------------------------------------------------------------------------------------------------------------------------------------- |:------------ |
| Hafta-7 | 01.11.2022 04.11.2022 | Doğrusal, İkili ve Fibonacci Arama, Hashing ve Hash Tabloları, Mükemmel Hashing                                                                             | Tanımlanacak |
| Hafta-8 | 08.11.2022 11.11.2022 | **Ara Sınav**                                                                                                                                               | Tanımlanacak |

---

| Hafta-9  | 15.11.2022 18.11.2022 | Sıralama Algoritmaları, Taksonomi ve Karşılaştırmalar                                                                                                                                                   | Tanımlanacak |
|:-------- |:--------------------- |:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |:------------ |
| Hafta-10 | 22.11.2022 25.11.2022 | Gelişmiş Ağaç Veri Yapıları (İkili Arama Ağacı, AVL Ağacı, B Ağaçları ve türevleri, Kırmızı-Siyah Ağaçlar, Splay Ağaçları ve Gelişmiş Veri Yapıları, van Emde Boas Ağaçları, Binom ve Minimax Ağaçları) | Tanımlanacak |
| Hafta-11 | 29.11.2022 02.12.2022 | Dize Veri Yapıları, Alt Dizi Arama, Hizalama ve Karşılaştırma Algoritmaları                                                                                                                             | Tanımlanacak |

---

| Hafta-12 | 06.12.2022 09.12.2022 | Dize Arama Algoritmaları, Tries, Ayrık Kümeler için Veri Yapıları                                                | Tanımlanacak |
|:-------- |:--------------------- |:---------------------------------------------------------------------------------------------------------------- |:------------ |
| Hafta-13 | 13.12.2022 16.12.2022 | Dosya Organizasyonuna Giriş ve İşleme, Ardışık Dosya Organizasyonu, Doğrudan Dosya Organizasyonu Hash Yöntemleri | Tanımlanacak |
| Hafta-14 | 20.12.2022 23.12.2022 | Doğrudan Dosya Organizasyonu İndeksleri, Dosya için İkili ve B Ağaç Yapıları                                     | Tanımlanacak |

---

| Hafta-15 | 27.12.2022 30.12.2022 | Genişletilebilir Dosyalar için Hashing Teknikleri, Tries, Yaklaşık Dize Eşleşmesi, Trie Hashing, İkincil Anahtar Erişimi, Dosya Sıralama | Tanımlanacak |
|:-------- |:--------------------- |:---------------------------------------------------------------------------------------------------------------------------------------- |:------------ |
| Hafta-16 | 03.01.2023 06.01.2023 | **Final**                                                                                                                                | Tanımlanacak |

---

$$
Ders-İzlence-Sonu
$$
