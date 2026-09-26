---
marp: true
theme: cen207
paginate: true
lang: tr
title: "CEN207 Hafta 3 — Yığınlar ve Kuyruklar"
author: "Dr. Öğr. Üyesi Uğur CORUH"
header: "CEN207 Veri Yapıları · Hafta 3"
footer: "RTEÜ Bilgisayar Mühendisliği · 2026-2027 Güz"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Yığınlar ve Kuyruklar

**CEN207 Veri Yapıları — Hafta 3**

Dr. Öğr. Üyesi Uğur CORUH · 2026-2027 Güz

<!--
Konuşma notu: Bugün bilgisayar biliminin en eski, en çok kullanılan iki doğrusal yapısıyla tanışıyoruz. Yığın = yalnız bir uca dokun. Kuyruk = bir uçtan ekle, diğerinden çıkar. Bu tek kural farkı, gerisinin tamamını açıklıyor.
-->

---

# Bugünün planı (3 saat)

| Saat | Konu |
| --- | --- |
| 1 | Yığın ADT · dizi yığını · taşma **Anim 1–2** · bağlı yığın **Anim 3** |
| 2 | Yığın uygulamaları: parantez, postfix, prefix, infix **Anim 4–8** · özyineleme **Anim 9–10** |
| 3 | Hanoi **Anim 11** · kuyruk türevleri **Anim 12–16** · kendini sınama |

**Öğrenme çıktıları:** ÖÇ.1 (temel veri yapılarını açıklama) · ÖÇ.7 (doğru yapıyı seçme)

<!-- Konuşma notu: On altı kısa animasyon dersin tamamını taşıyor; her biri, fikri tanıttığımız yerde, bir kez görünüyor. -->

---

# Bu haftanın kavramları — nerede

| Kavram | Nerede |
| --- | --- |
| Yığın ADT'si, LIFO, push/pop | Bölüm 1 |
| İfade algoritmaları (postfix, infix) | Bölüm 2 |
| Özyineleme, çağrı yığını, Hanoi Kulesi | Bölüm 3–4 |
| Kuyruk ADT'si, FIFO, dairesel kuyruk, deque | Bölüm 5 |

<!-- Konuşma notu: Her terim ilk geçtiği yerde tam olarak tanımlanır; bu tablo yalnızca onu nerede tekrar bulacağınızı söylüyor. -->

---

# Kod örnekleri nasıl çalışıyor

- Her fikrin eksiksiz bir **C** ve **Java** programı var
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Kaynaklar: `code/week-03/c/` ve `code/week-03/java/`
- Her programın beklenen çıktısı hafta notlarında var

<!-- Konuşma notu: Canlı denemek isteyenler şimdi bir terminal açsın; bugünkü her kod parçası tam olarak gösterildiği gibi derlenip çalışır. -->

---

# Hafta 1–2'den köprü

- Hafta 1–2 size iki araç verdi: **işaretçiler/bellek** ve **bağlı liste**
- Bu hafta ikisini de, sürekli, yeni biçimlerde kullanıyor
- Bu haftanın yeni fikri: bir yapıya *nereden* dokunabileceğinizi kısıtlamak

<!-- Konuşma notu: Bellek hakkında yeni hiçbir şey gerekmiyor bugün — yalnızca hangi uca dokunabileceğinize dair yeni kurallar var. -->

---

# Tekrar — Hafta 1: işaretçiler ve bellek

- `int *p` bir sayı değil, bir **adres** tutar
- `malloc` işletim sisteminden kutu ister; `free` geri verir
- `free`'i unutmak → **bellek sızıntısı**
- `free`'den sonra kullanmak → **sarkan işaretçi**

<!-- Konuşma notu: Bugün malloc ve free'i yeniden kullanacağız; unutulan bir free'nin tam olarak nerede ısırdığını göstereceğiz. -->

---

# Tekrar — Hafta 2: bağlı listeler

- Bağlı liste, **düğümlerden** oluşan bir zincirdir
- Her düğüm: bir değer + sonraki düğümü gösteren işaretçi
- Ekleme/çıkarma birkaç işaretçiyi yeniden bağlar — kaydırma yok
- Bugünün bağlı yığını/kuyruğu tam olarak bu fikri kullanır

<!-- Konuşma notu: Bugünün tek yeni parçası, zincirin hangi ucuna/uçlarına dokunabileceğinizi kısıtlamak. -->

---

# Haftanın haritası — tek kural

- Yığın ve kuyruk ikisi de **doğrusal** yapılardır
- Bir **yığın** yalnız **bir** ucuna dokunmanıza izin verir
- Bir **kuyruk** sizi bir uçtan eklemeye, diğerinden çıkarmaya zorlar
- Bu tek kural farkı, her yapının ne için iyi olduğunu belirler

<!-- Konuşma notu: Sınıfa sorun: bir kuyrukta en önce gelenler hangi uçta oturur? Önde — ve bütün fikir bu. -->

---

# Haftanın haritası — tek bakışta

| Yığın konuları | Kuyruk konuları |
| --- | --- |
| Dizi yığını, bağlı yığın | Dizi kuyruğu, dairesel kuyruk |
| Parantez, postfix, infix | Bağlı liste ile kuyruk |
| Özyineleme, çağrı yığını | Deque, çok seviyeli kuyruk |
| Hanoi Kulesi | — |

<!-- Konuşma notu: Haritadaki her kutu aşağıda kendi slaytlarını alıyor; çoğunun yanında kısa bir animasyon ve eksiksiz bir C/Java programı var. -->

---

<!-- _class: bolum -->

# 1. Yığın: Son Giren, İlk Çıkar

<!-- Konuşma notu: Bölüm 1, yığını sıfırdan kurar: önce dizi sürümü, sonra bağlı sürüm, ikisi de aynı küçük arayüzle. -->

---

# Başlangıç sorusu

Art arda üç web sayfası ziyaret edin, sonra **Geri**'ye üç kez tıklayın.

Sırasıyla sayfa 2'ye, sonra sayfa 1'e inersiniz, sonra hiçbir yere.
Ziyaret edilen *son* sayfa, tekrar ziyaret edilen *ilk* sayfadır.

<!-- Konuşma notu: Sorun: bu "geçmiş" özelliğini yalnızca bir dizi ya da bağlı listeyle nasıl kurarsınız? Cevap geliyor. -->

---

# Kısa bir tarihçe

- 1950'lerin sonu: "yığın", "push", "pop" zaten CS literatüründe
- **1957** — Bauer ve Samelson (Münih) donanımsal bir yığın patentler
- **1946** — Turing, ACE bilgisayarında benzer bir fikir kullanmıştı
- Bilgisayar biliminin en eski fikirlerinden biri — hâlâ her programda

<!-- Konuşma notu: Şu anda bilgisayarınızın yaptığı her fonksiyon çağrısı, tam olarak bu erken makineler gibi, hâlâ bir yığın kullanıyor. -->

---

# Sezgi — bir tabak yığını

- Bir tabağı yalnız **en üstten** alın
- Bir tabağı yalnız **en üste** koyun
- Üstündekileri kaldırmadan ortadan bir tabak çekemezsiniz
- En son konan tabak, çıkarılan ilk tabaktır — **LIFO**

<!-- Konuşma notu: LIFO = Son Giren, İlk Çıkar. Bugünkü her işlem için bu yemekhane resmini aklınızda tutun. -->

---

# Üç işlem

- **push** — en üste yeni bir eleman koy
- **pop** — en üstteki elemanı çıkar ve döndür
- **peek** (ya da `top`) — çıkarmadan en üste bak
- Üçü de yalnız **bir uca** dokunur

<!-- Konuşma notu: Bu üç kısa ad her dilde ve her ders kitabında standarttır; şimdi öğrenin, hiç değişmezler. -->

---

# Yığın ADT'si

| İşlem | Ne yapar | Ön koşul | Karmaşıklık |
| --- | --- | --- | --- |
| `push(x)` | `x`'i en üste ekle | dolu değil (dizi) | O(1) |
| `pop()` | En üstü çıkar/döndür | boş değil | O(1) |
| `peek()` | En üstü döndür, tut | boş değil | O(1) |
| `isEmpty()` | sıfır eleman mı? | yok | O(1) |

<!-- Konuşma notu: Bir ADT, bir yapının neyi yaptığını tanımlar, nasıl yaptığını değil — bu tablo, dizi ya da bağlı liste olmasından bağımsız geçerli. -->

---

# Dizi ile yığın — fikir

- Sabit boyutlu bir `data[CAP]` dizisi ayır
- Tek bir tamsayı tut, `top`: en üstteki hücrenin indisi
- Boş yığın: `top == -1` — "henüz üst yok"
- `push`: `top++`, yaz; `pop`: oku, `top--`

<!-- Konuşma notu: Bellekte başka hiçbir şey yer değiştirmez — yalnızca tek bir tamsayı olan top değişir. -->

---

# Array stack: push and pop

<iframe class="dsanim" src="anim/array-stack-push-pop.html?yer=slayt&lang=tr" title="Array stack: push and pop"></iframe>

<!-- Konuşma notu: Normal örnek: 10 push (12, 7, 25, 3, 18, 9, 30, 14, 5, 21), sonra 4 pop — top ve dizinin bir adımda bir güncellendiğini izleyin. -->

---

# Kod — push()

```c
bool push(int x) {
    if (top == CAP - 1) return false;
    top = top + 1;
    data[top] = x;
    return true;
}
```

<!-- Konuşma notu: Önce denetle, doluysa reddet, sonra iki yazma — top kayar, değer yerine oturur. Her zaman iki adım. -->

---

# Kod — pop()

```c
bool pop(int *out) {
    if (top == -1) return false;
    *out = data[top];
    top = top - 1;
    return true;
}
```

<!-- Konuşma notu: push ile aynı biçim, aynası: boşu denetle, en üst hücreyi oku, top'u aşağı kaydır. -->

---

# Beklenen çıktı

```text
push(12) -> true   [top = 0]
push(21) -> true   [top = 9]
pop()    -> 21     [top = 8]
pop()    -> 5      [top = 7]
pop()    -> 14     [top = 6]
pop()    -> 30     [top = 5]
```

<!-- Konuşma notu: En son itilen (21) ilk geri gelir, sonra 5, 14, 30 — son giren, ilk çıkar. -->

---

# Neden her işlem O(1)

- `push`/`pop`, **sabit sayıda adım** atar
- Bir koşul denetimi, `top`'un bir hareketi, bir dizi erişimi
- Yığında 1 eleman ya da bir milyon olsun fark etmez
- Hiçbir döngü diğer elemanlara dokunmaz

<!-- Konuşma notu: Bu sabit-zaman garantisi yığının bütün amacı — ortaya erişmek başka bir yapı gerektirir. -->

---

# Taşma ve alttan taşma — soru

Bir dizinin **sabit** bir boyutu var. Dolu bir yığına
`push`, boş bir yığından `pop` yapılırsa ne olur?

Doğru bir yığın **önce denetlemeli ve reddetmelidir**.

<!-- Konuşma notu: C'de dizi sınırları dışına yazmak dostane bir hata vermez — yakındaki belleği sessizce bozar. -->

---

# Stack overflow and underflow

<iframe class="dsanim" src="anim/stack-overflow-underflow.html?yer=slayt&lang=tr" title="Stack overflow and underflow"></iframe>

<!-- Konuşma notu: 10 hücreli bir yığına 11 push (son push taşar), sonra 13 pop (boşalınca alttan taşar) — iki denetimin de ateşlenişini izleyin. -->

---

# Sık yapılan hatalar (dizi yığını)

- `top == CAP` denetlemek, `top == CAP - 1` yerine
- Önce `isEmpty` denetlemeden pop yapmak
- `push`'un `bool` dönüş değerini yok saymak

<!-- Konuşma notu: Geçerli indisler 0..CAP-1 arasıdır, yığın top CAP-1'e ulaştığı an dolar, bir adım sonra değil. -->

---

# Mini soru

`top = -1`, "boş" için neden `top = 0`'dan
daha iyi bir seçim?

<!-- Konuşma notu: Cevabı açıklamadan önce sınıfın yanıtlamasına izin verin — indis 0 gerçek, geçerli bir hücredir. -->

---

# Yanıt

İndis `0` **geçerli bir hücredir**. `top = 0` "boş"
anlamına gelseydi, boş bir yığınla indis 0'da tek
elemanı olan bir yığını ayırt edemezdiniz.

<!-- Konuşma notu: -1 geçerli bir indis olmadığı için yalnızca "hiç eleman yok" anlamına gelebilir. -->

---

# Hiç taşmayan bir yığın

- Dizi ile yığının sert bir tavanı var: `CAP`
- **Bağlı liste ile yığın**: her eleman kendi düğümü
- `top` artık bir indis değil, bir **işaretçi**
- `push` ayırır; `pop` serbest bırakır

<!-- Konuşma notu: Tam olarak Hafta 2'deki aynı düğüm-ve-işaretçi fikri, yalnız bir uca dokunmakla sınırlandırılmış. -->

---

# Linked-list stack: push and pop

<iframe class="dsanim" src="anim/linked-stack-push-pop.html?yer=slayt&lang=tr" title="Linked-list stack: push and pop"></iframe>

<!-- Konuşma notu: malloc'un bir düğüm oluşturduğunu, sonra üç işaretçi güncellemesinin top'u taşıdığını izleyin — hiçbir yerde kapasite sınırı yok. -->

---

# Kod — struct Node + push()

```c
typedef struct Node {
    int data;
    struct Node *next;
} Node;
Node *top = NULL;

void push(int x) {
    Node *n = malloc(sizeof(Node));
    n->data = x;
    n->next = top;
    top = n;
}
```

<!-- Konuşma notu: Yeni düğüm eski en üstü gösterir, sonra top yeni düğüme taşınır — her zaman üç atama. -->

---

# Kod — pop()

```c
bool pop(int *out) {
    if (top == NULL) return false;
    Node *tmp = top;
    *out = tmp->data;
    top = top->next;
    free(tmp);
    return true;
}
```

<!-- Konuşma notu: tmp, top zaten ilerledikten sonra değerini okuyup serbest bırakabilmek için eski en üstü tam gereken süre kadar tutar. -->

---

# push neden hâlâ O(1)

- **Tek, sabit boyutlu düğüm** için `malloc` sabit zamanlı
- Kaç düğüm zaten var olduğuna bağlı değil
- Var olan elemanlar üzerinde döngü yok
- Bedel: düğüm başına bir işaretçi (`next`), dizide sıfır

<!-- Konuşma notu: Sınırsız kapasitenin bedeli, eleman başına biraz fazla bellek ve daha kötü önbellek yerelliği. -->

---

# Sık yapılan hatalar (bağlı yığın)

- `pop`'ta `free(tmp)`'i unutmak — yavaş bellek sızıntısı
- `free` edilmiş bir işaretçiyi kullanmak — tanımsız davranış
- Java: eski bir referansı tutmak çöp toplamayı engeller

<!-- Konuşma notu: free(tmp); return tmp->data; zaten geri verilmiş belleği okur — bazen "çalışır", bazen çöker. -->

---

# Dizi vs. bağlı liste yığını

| | Dizi yığını | Bağlı yığın |
| --- | --- | --- |
| Kapasite | Sabit, taşabilir | Bellekle sınırlı |
| Ekstra bellek | Yok | Düğüm başına 1 işaretçi |
| Önbellek davranışı | Bitişik, hızlı | Dağınık, daha yavaş |

<!-- Konuşma notu: Her iki yönde de push ve pop O(1); fark hız sınıfı değil, kapasite ve bellek yerelliği. -->

---

# Mini soru

`CAP = 8`. 5 push ve 2 pop'tan sonra `top` nedir?

<!-- Konuşma notu: Her push top'a 1 ekler, her pop 1 çıkarır — aritmetiği birlikte yapın. -->

---

# Yanıt

`-1 + 5 - 2 = 2`. Üç eleman kalır
(indis 0, 1, 2), ve `top == 2`.

<!-- Konuşma notu: Bu, az önce okuduğumuz push/pop kodunun bir adımda bir yaptığı tam olarak bu hesap. -->

---

<!-- _class: bolum -->

# 2. Yığın Uygulamaları: İfadeler

<!-- Konuşma notu: Aynı küçük yığın arayüzü üzerine kurulu üç klasik algoritma: parantez denetimi, postfix değerlendirme, infix'i postfix'e çevirme. -->

---

# Infix bilgisayar için neden can sıkıcı

- `A + B * C` — `*` mi önce hesaplanır? **Öncelik** gerekir
- İki başka yazım, işleci öyle taşır ki değerlendirme
  sırasında hiçbir öncelik kuralı gerekmez

<!-- Konuşma notu: Sınıfa A + B * C'yi elle hesaplattırın — herkes fark etmeden önceliği uygular. -->

---

# Kısa bir tarihçe

- 1920'ler — Polonyalı mantıkçı **Jan Łukasiewicz**,
  prefix ("Polish") ve postfix ("Reverse Polish") yazımı tanıtır
- **HP hesap makineleri** sayesinde ünlenir: parantez tuşu gerekmez
- Küçük bir yığın makinesiyle değerlendirilir — birazdan kuracağınız

<!-- Konuşma notu: RPN hesap makineleri bugün hâlâ satılıyor; sıradaki slaytlardaki algoritma, içlerinde çalışanın ta kendisi. -->

---

# Üç yazım

| Yazım | İşlecin yeri | `A + B * C` |
| --- | --- | --- |
| Infix | İşlenenler arasında | `A + B * C` |
| Postfix (RPN) | Her iki işlenenden sonra | `A B C * +` |
| Prefix (Polish) | Her iki işlenenden önce | `+ A * B C` |

<!-- Konuşma notu: Postfix ve prefix, değerlendirme sırasında ne parantez ne öncelik tablosu ister — bu iş zaten bir kez yapıldı. -->

---

# Parantez dengesi — soru

`{([])(]}` geçerli biçimde iç içe mi?

Her kapanan, hâlâ açık olan **en son açılan**
parantezle eşleşmelidir.

<!-- Konuşma notu: "En son açılan" ifadesi herkesin aklına hemen bir yığın getirmeli — bu cümle algoritmanın ta kendisi. -->

---

# Kural

- Dizgiyi bir kez tara
- Her **açan**: it (push)
- Her **kapanan**: çek (pop), eşleşmeli
- Kapanan geldiğinde yığın boşsa → dengesiz
- Sonunda yığın boş değilse → dengesiz

<!-- Konuşma notu: Üç ayrı başarısızlık yolu; doğru bir denetleyici yalnız ilkini değil, üçünü de yakalamalı. -->

---

# Checking brackets with a stack

<iframe class="dsanim" src="anim/bracket-matching.html?yer=slayt&lang=tr" title="Checking brackets with a stack"></iframe>

<!-- Konuşma notu: Uyumsuzluğu izleyin: tepede `(` varken bir `]` gelir — eşleşme yok, hemen reddet. -->

---

# Kod — matches()

```c
static bool matches(char open, char close) {
    return (open == '(' && close == ')') ||
           (open == '[' && close == ']') ||
           (open == '{' && close == '}');
}
```

<!-- Konuşma notu: Küçük bir yardımcı: bu kapanan, bu açanla eşleşiyor mu? -->

---

# Kod — balanced()

```c
bool balanced(const char *s) {
    char st[100]; int top = -1;
    for (int i = 0; s[i] != '\0'; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') {
            st[++top] = c;
        } else if (c == ')' || c == ']' || c == '}') {
            if (top == -1) return false;
            char o = st[top--];
            if (!matches(o, c)) return false;
        }
    }
    return top == -1;
}
```

<!-- Konuşma notu: İnsanların en çok unuttuğu tam olarak son satır: dizgi, yığında hâlâ eşleşmemiş açanlarla bitebilir. -->

---

# Karmaşıklık

Her karaktere **tam olarak bir kez** bakılır,
her yığın işlemi O(1) → `balanced` **O(n)** çalışır.

En kötü durum bellek: O(n) — tamamı açan bir dizgi.

<!-- Konuşma notu: Tek geçiş, tek yığın, tamam — bugün göreceğimiz hemen her yığın algoritması bu biçimde. -->

---

# Tuzak — dengesiz olmanın üç yolu

1. Kapanan gelir, tepe eşleşmez — `(]`
2. Kapanan gelir, yığın zaten boş — `)`
3. Dizgi biter, yığın boş **değil** — `(()`

<!-- Konuşma notu: Sık bir hata: yalnız 1. durumu denetleyip son `return top == -1;`'i unutmak. -->

---

# Mini soru

`((A+B)`, `balanced` tarafından kabul edilir mi? Neden?

<!-- Konuşma notu: Tek bir eşleşmemiş açan parantez — sonunda yığının neye benzediğini adım adım izleyin. -->

---

# Yanıt

Hayır. Her `(` itilir, dizgi yığında hâlâ biri
varken biter — `top == -1` yanlıştır, bu yüzden
`balanced` doğru biçimde `false` döndürür.

<!-- Konuşma notu: Bu, önceki slayttaki tam olarak 3. başarısızlık durumu. -->

---

# Postfix değerlendirme — soru

`5 3 + 8 2 - * 6 + 12 -`, `(5+3)*(8-2)=48`,
`48+6=54`, `54-12=42` olarak değerlendirilmeli.

Hiçbir öncelik kuralı gerekmiyor — yalnız bir tarama.

<!-- Konuşma notu: Animasyon çalışmadan önce sınıfa sonucu tahmin ettirin. -->

---

# Evaluating a postfix expression

<iframe class="dsanim" src="anim/postfix-evaluation.html?yer=slayt&lang=tr" title="Evaluating a postfix expression"></iframe>

<!-- Konuşma notu: Her sayı itilir; her işleç iki değeri çeker, kendini uygular, sonucu geri iter. -->

---

# Kod — apply()

```c
static int apply(char op, int a, int b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        default:  return 0;
    }
}
```

<!-- Konuşma notu: Küçük bir dağıtıcı — şaşırtıcı bir şey yok, yalnızca dört aritmetik işleç. -->

---

# Kod — eval_postfix()

```c
int eval_postfix(char *tok[], int n) {
    int st[100]; int top = -1;
    for (int i = 0; i < n; i++) {
        char *t = tok[i];
        if (isdigit(t[0])) {
            st[++top] = atoi(t);
        } else {
            int b = st[top--];
            int a = st[top--];
            st[++top] = apply(t[0], a, b);
        }
    }
    return st[top];
}
```

<!-- Konuşma notu: b önce çıkar (sağ işlenen), a ikinci (sol işlenen) — sıra, eksi ve bölmede önemli. -->

---

# Karmaşıklık

Belirteç sayısında **O(n)**: her belirteç en çok
bir kez itilir, en çok bir kez çekilir.

<!-- Konuşma notu: Hesap makineleri ve derleyiciler ifadeleri gerçek zamanlı, tam olarak böyle, dev girdilerde değerlendirir. -->

---

# Tuzak — işlenen sırası önemli

`8 2 -`, `8 - 2` demektir. İlk çekilen (`b`)
**sağ** işlenendir; ikinci çekilen (`a`) **sol**.
Yer değiştirirseniz `2 - 8` hesaplarsınız.

<!-- Konuşma notu: Bu, öğrencilerin bu algoritmada yazdığı en sık hata. -->

---

# Mini soru

`eval_postfix` neden yalnız **tek** yığına
ihtiyaç duyarken, sıradaki `to_postfix` ayrıca
bir çıktı alanına da ihtiyaç duyar?

<!-- Konuşma notu: Her algoritmanın sonunda gerçekte ne ürettiğini düşünün. -->

---

# Yanıt

Değerlendirme iki işleneni ve bir işleci hemen
tek bir sayıya **çökertir** — hatırlanacak fazladan
bir şey yok. Dönüştürme yalnız sembolleri
**yeniden sıralar**, bu yüzden onları biriktirecek bir yere ihtiyaç duyar.

<!-- Konuşma notu: Bu ayrım — değerleri çökertmek ile sembolleri yeniden sıralamak — yavaşça tekrarlanmaya değer. -->

---

# Bir prefix ifadeyi değerlendirme

- İşleç, işlenenlerinden **önce** gelir: `+ A B`
- Postfix'le aynı fikir, ama **sağdan sola** taranır
- İlk çekilen değer artık **sol** işlenendir

<!-- Konuşma notu: Prefix, her açıdan postfix'in ayna görüntüsüdür — tarama yönü, ve ilk çıkan işlenen. -->

---

# Bir prefix ifadeyi değerlendirme

<iframe class="dsanim" src="anim/prefix-evaluation.html?yer=slayt&lang=tr" title="Evaluating a prefix expression"></iframe>

<!-- Konuşma notu: Normal örnek: 11 belirteç, hatasız. "Zor" örnek aslında hata verir — daha fazla belirteç otomatik olarak geçerli bir ifade demek değildir. -->

---

# Prefix vs. postfix — ayna

- **Sağdan sola** tara, soldan sağa değil
- Önce **sol** işleneni çek, sonra sağı
- Aynı **O(n)** karmaşıklık, aynı hata denetimleri (sıfıra bölme, çok az/çok işlenen)

<!-- Konuşma notu: Çekme sırasını tersine çevirmek, değişmeli olmayan her işleci (eksi, bölme) sessizce bozar. -->

---

# Infix'ten postfix'e — fikir

- İnsanlar infix yazar; değerlendiricimiz postfix ister
- **Tren makası algoritması** (shunting-yard, Dijkstra) —
  yük vagonlarını yeniden sıralayan istasyonlardan
- **İşleç** tutan ikinci bir yığın, önceliği bir kerede çözer

<!-- Konuşma notu: Bu, çoğu öğrencinin yazdığı ilk "derleyici biçimli" klasik algoritma. -->

---

# Converting infix to postfix

<iframe class="dsanim" src="anim/infix-to-postfix.html?yer=slayt&lang=tr" title="Converting infix to postfix"></iframe>

<!-- Konuşma notu: Her işlenen doğrudan çıktıya gider; her işleç önce bekleyen daha güçlü işleçleri boşaltır, sonra itilir. -->

---

# Kod — prec()

```c
static int prec(char op) {
    if (op == '+' || op == '-') return 1;
    if (op == '*' || op == '/') return 2;
    return 0;
}
```

<!-- Konuşma notu: Küçük bir öncelik tablosu — çarpma/bölme, artı/eksiden daha sıkı bağlanır. -->

---

# Kod — to_postfix()

```c
void to_postfix(const char *in, char *out) {
    char ops[100]; int top = -1, k = 0;
    for (int i = 0; in[i]; i++) {
        char c = in[i];
        if (isalnum(c)) { out[k++] = c; }
        else {
            while (top >= 0 && prec(ops[top]) >= prec(c))
                out[k++] = ops[top--];
            ops[++top] = c;
        }
    }
    while (top >= 0) out[k++] = ops[top--];
    out[k] = '\0';
}
```

<!-- Konuşma notu: Son while döngüsü "boşaltma" adımı: yığında kalan her şeyin de çıktıya ulaşması gerekir. -->

---

# Karmaşıklık

**O(n)**: her karakter işleç yığınına en çok
bir kez itilir, en çok bir kez çekilir.

<!-- Konuşma notu: Bugün gördüğümüz her yığın algoritmasıyla aynı biçim, aynı sınır. -->

---

# Tuzak — buradaki üç hata

- `>` yerine `>=` kullanmamak sola birleşmeyi bozar
- Son boşaltmayı unutmak bekleyen işleçleri kaybettirir
- Parantez desteği yok (doğal bir uzatma olarak bırakıldı)

<!-- Konuşma notu: A-B-C, (A-B)-C olmalı; bu da eşit öncelikli işleçlerin de önce çekilmesini gerektirir. -->

---

# Mini soru

`A*B+C`'yi elle postfix'e çevirin.

<!-- Konuşma notu: Sınıfa otuz saniye verin, sonra açıklayıp algoritmanın kendi izine karşılaştırın. -->

---

# Yanıt

`AB*C+`. `A`→çıktı. `*`→it. `B`→çıktı.
`+`, tepedeki `*`'i görür (öncelik 2 ≥ 1): `*`'i çek→çıktı, `+`'ı it.
`C`→çıktı. `+`'ı boşalt. Sonuç: `A B * C +`.

<!-- Konuşma notu: Sınıf emin görünmüyorsa bu izi satır satır birlikte geçin. -->

---

# Infix'i prefix'e çevirme

- Girdiyi **ters çevir**, `(` ↔ `)` değiştirerek
- Tren makasını yine çalıştır, ama bekleyen bir işleci
  yalnızca **kesin biçimde** daha güçlüyse çek (`>`, `>=` değil)
- Sonucu **ters çevir**

<!-- Konuşma notu: Yepyeni bir algoritma yerine zaten tanıdık üç adım — bütün marifet bu. -->

---

# Infix'i prefix'e çevirme

<iframe class="dsanim" src="anim/infix-to-prefix.html?yer=slayt&lang=tr" title="Converting infix to prefix"></iframe>

<!-- Konuşma notu: Infix-postfix ile aynı normal örnek, A+B*C-D+E*F, böylece iki çıktı yan yana karşılaştırılabilir. -->

---

# Tuzak — kesin `>`, `>=` değil

- Prefix dönüşümü yalnızca **kesin biçimde daha güçlü**
  bekleyen bir işleci çeker — `>=` kullanmak son ters
  çevirmeyi bozar
- Ters çevirirken `(`/`)`'yi değiştirmeyi unutmak gruplamayı bozar

<!-- Konuşma notu: A+B+C+... gibi aynı öncelikli bir zincir için postfix ve prefix çıktılarını karşılaştırarak kuralı görün. -->

---

<!-- _class: bolum -->

# 3. Özyineleme ve Çağrı Yığını

<!-- Konuşma notu: Özyinelemeyi anlaşılır kılan bağlantı: özyinelemeli olsun olmasın, her fonksiyon çağrısı gerçek bir yığın çerçevesi iter. -->

---

# Özyineleme nedir — bir soru

`fact(n) = n * fact(n - 1)`, temel durum `fact(0) = 1`.

`fact(3) = 3 * (2 * (1 * fact(0))) = 6`

<!-- Konuşma notu: Doğrudan yanıtlanabilecek kadar basit bir duruma ulaşana kadar, aynı problemin daha küçük bir sürümü üzerinde kendini çağıran bir fonksiyon. -->

---

# Temel durum zorunludur

- İsteğe bağlı değil — özyinelemeyi **durduran** odur
- Temel durum olmadan: fonksiyon kendini **sonsuza kadar** çağırır
- "Sonsuza kadar" gerçekte şu demek: bellek bitene kadar

<!-- Konuşma notu: Birazdan tam olarak bitecek bellek yapısıyla, çağrı yığınıyla, tanışacağız. -->

---

# En basit özyineleme: geri sayım

- `n`'i yazdır, `n - 1` üzerinde özyinele, temel duruma kadar
- Temel durum `n <= 0` olmalı, `n == 0` **değil**
- `n = 0` ya da negatif `n`, ilk çağrıda durmalıdır

<!-- Konuşma notu: Mümkün olan en küçük özyinelemeli fonksiyon — temel durumlarla ilgili her şey burada ilk kez görünüyor. -->

---

# Özyineleme: geri sayım

<iframe class="dsanim" src="anim/recursion-countdown.html?yer=slayt&lang=tr" title="Recursion: countdown"></iframe>

<!-- Konuşma notu: Normal örnek: 10'dan geri sayım. Uç durumlar n=0 ve n=-4, ikisi de temel duruma anında ulaşır. -->

---

# Tuzak — yanlış temel durum

Yalnız `n == 0`: negatif bir başlangıç değeri onu
**hiçbir zaman** karşılamaz — sonsuz özyineleme.
`n <= 0` bunu düzeltir: negatif girdi ilk çağrıda durur.

<!-- Konuşma notu: "n=-4'ten geri sayım"ı düzeltilmeden önce sonsuz döngüye çeviren tam olarak bu hata. -->

---

# Çağrı yığını: özyineleme bir yığındır

- Her fonksiyon çağrısı bir **çerçeve** iter:
  yerel değişkenler + dönüş adresi
- Bir fonksiyondan dönmek o çerçeveyi **çeker**
- Bu, siz yazmasanız da her programın içine gömülü,
  gerçek bir **LIFO yığınıdır**

<!-- Konuşma notu: Her fonksiyon çağırdığınızda bir yığın kullanıyordunuz — bugüne kadar yalnızca göremiyordunuz. -->

---

# Recursion and the call stack: fact(n)

<iframe class="dsanim" src="anim/recursion-call-stack.html?yer=slayt&lang=tr" title="Recursion and the call stack: fact(n)"></iframe>

<!-- Konuşma notu: Normal örnek: fact(10), 10 çerçeve derinliğinde — her biri bir sonrakini bekler, sonra çerçeveler ters sırada çözülür. -->

---

# Kod — fact()

```c
int fact(int n) {
    if (n == 0) return 1;
    return n * fact(n - 1);
}
```

<!-- Konuşma notu: İki satır: özyinelemeyi durduran bir temel durum, ve kesinlikle daha küçük bir problem üzerinde özyinelemeli çağrı. -->

---

# Beklenen çıktı

```text
fact(10) = 3628800
```

<!-- Konuşma notu: Çıktı küçük, ama arkasındaki çağrı yığını makinesi bu bölümün asıl konusu. -->

---

# Karmaşıklık

`fact(n)`, `n` özyinelemeli çağrı yapar: **O(n) zaman**,
ve — unutulması kolay — **O(n) yığın belleği**,
bekleyen her çağrı için bir çerçeve.

Aynı çarpımı hesaplayan bir döngü O(1) bellek kullanır.

<!-- Konuşma notu: Özyineleme çoğunlukla bir döngüden daha anlaşılır okunur, ama asla bellek maliyetinden bağımsız değildir. -->

---

# Tuzak — sessiz `int` taşması

`13! = 6227020800` — 32 bitlik bir `int`'e sığmaz
(en fazla `2147483647`). Program **çökmez**;
sessizce `1932053504`'e sarılır.

<!-- Konuşma notu: Seçicideki "zor" örneğin 12'de durmasının nedeni tam olarak bu — taşmaya bir çağrı kala. -->

---

# Tuzak — eksik temel durum

Ulaşılabilir bir temel durum olmadan, özyinelemeli
bir fonksiyon **her çağrıda yeni bir çerçeve** iter,
sonsuza kadar — ta ki çağrı yığınının kendisi taşana kadar.

<!-- Konuşma notu: Bu çökmenin, Bölüm 1'den zaten bildiğiniz bir adı var: yığın taşması — yalnızca kendi dizinize değil çağrı yığınına uygulanmış. -->

---

# Tuzak — küçülmeyen bir problem

`fact(n)`, kendini kesinlikle daha küçük olan
`n - 1` ile çağırır. Her özyinelemeli çağrı
temel duruma **ölçülebilir** biçimde yaklaşmalıdır.

<!-- Konuşma notu: 0'a ulaşması beklenen tek bir n'den 2'şer azaltmak, bu hatanın klasik bir versiyonudur. -->

---

# Mini soru

`fact(3)` özgün çağrı. `fact(0)` başladığı anda
çağrı yığınında kaç çerçeve vardır?

<!-- Konuşma notu: Birlikte sayın: fact(3), fact(2), fact(1), fact(0). -->

---

# Yanıt

**Dört**: `fact(3)`, `fact(2)`, `fact(1)`, `fact(0)`,
her biri hâlâ altındakinin dönmesini bekliyor.

<!-- Konuşma notu: Bu çerçevelerin hiçbiri henüz dönmedi — hâlâ yığında olmalarının nedeni tam olarak bu. -->

---

# Mini soru

Temel durum `if (n == 1) return 1;` olsaydı
ve biri `fact(-1)` çağırsaydı ne olurdu?

<!-- Konuşma notu: -1, -2, -3, -4... yolunda hiçbir zaman 1'e eşit olmaz. -->

---

# Yanıt

`-1` hiçbir zaman `1`'e eşit olmaz; fonksiyon
`-2, -3, -4, ...` üzerinde sonsuza kadar özyinelenir,
sonunda **çağrı yığınını taşırır**.

<!-- Konuşma notu: Yanlış bir temel durum koşulu, eksik bir temel durum kadar tehlikelidir. -->

---

<!-- _class: bolum -->

# 4. Hanoi Kulesi

<!-- Konuşma notu: Özyinelemesi yazması kolay olduğu hâlde temelden üstel olan bir problemin standart ilk örneği. -->

---

# Bulmaca

- Üç çubuk; A çubuğunda büyükten küçüğe istiflenmiş diskler
- Bütün istifi C çubuğuna, bir seferde tek disk, taşı
- Büyük bir diski asla küçüğün üstüne koyma
- **Édouard Lucas** tarafından icat edildi, 1883 (keşişler efsanesi)

<!-- Konuşma notu: Efsane: keşişler 64 altın diski taşıyor, işleri bitince dünya sona eriyor. Birazdan göreceğimiz gibi, kötü bir süre tahmini değil. -->

---

# Özyinelemeli fikir

`n` diski `from`'dan `to`'ya, `via`'yı kullanarak taşımak için:

1. Üstteki `n - 1` diski `via`'ya taşı
2. En büyük diski `to`'ya taşı
3. `n - 1` diski `via`'dan onun üstüne taşı

<!-- Konuşma notu: 1. ve 3. adımlar aynı problemdir, yalnızca daha küçük, çubuklar yeniden etiketlenmiş — kusursuz bir özyineleme. -->

---

# Hanoi Kulesi

<iframe class="dsanim" src="anim/tower-of-hanoi.html?yer=slayt&lang=tr" title="Tower of Hanoi"></iframe>

<!-- Konuşma notu: Normal örnek: 4 disk, 15 hamle. Kodda açık bir yığına gerek yok — çağrı yığınının kendisi "from, to, via"yı hatırlıyor. -->

---

# Kod — hanoi()

```c
void hanoi(int n, char from, char to, char via) {
    if (n == 0) return;
    hanoi(n - 1, from, via, to);
    move_disk(n, from, to);
    hanoi(n - 1, via, to, from);
}
```

<!-- Konuşma notu: Dört satır, ve özyineleme yapısı ruhen fact() ile tıpatıp aynı — daha küçük problem, hareket et, daha küçük problem. -->

---

# Beklenen çıktı

```text
move 1: disk 1 from A to B
move 2: disk 2 from A to C
move 3: disk 1 from B to C
move 4: disk 3 from A to B
...
total moves = 15
```

<!-- Konuşma notu: Dört disk için on beş hamle — bu sayının nedenini birazdan tam olarak göreceğiz. -->

---

# Karmaşıklık

`T(n) = 2*T(n-1) + 1`, `T(0) = 0`
→ `T(n) = 2ⁿ - 1` — **üstel** büyüme.

`n = 4`: `2⁴ - 1 = 15`, yukarıdaki programla eşleşiyor.

<!-- Konuşma notu: Hiçbir uygulama hilesi üstel büyümeyi düzeltmez — yalnızca daha küçük bir n düzeltir. -->

---

# Efsanenin 64 diski

`2⁶⁴ - 1 ≈ 1,8 × 10¹⁹` hamle.

Saniyede bir hamleyle: **~585 milyar yıl** —
evrenin şu anki yaşının onlarca katı.

<!-- Konuşma notu: Keşişlerin dünyanın sonuna dair kehaneti, bir bakıma, makul bir süre tahminiydi. -->

---

# Biraz daha ileriye bakış

"Daha küçük bir sürümünü çöz, sonra birleştir",
önümüzdeki iki haftada gelecek **derinlik öncelikli
arama (DFS)**'nin bir ağacı ya da çizgeyi gezme biçiminin ta kendisi.

<!-- Konuşma notu: Burada "from, to, via"yı tutan çağrı yığını, DFS'in "nereye geri dönülecek"i tutacağı aynı çağrı yığını. -->

---

# Mini soru

5 diskli bir Hanoi Kulesi kaç hamle gerektirir?

<!-- Konuşma notu: İki slayt önceki formülü uygulayın. -->

---

# Yanıt

`2⁵ - 1 = 31` hamle.

<!-- Konuşma notu: Diskleri bir artırmak, hamle sayısını kabaca ikiye katlayıp bir eksiltiyor. -->

---

# Mini soru

`hanoi(n - 1, from, via, to)` içinde, son iki
argüman dış çağrıya göre neden yer değiştirmiş?

<!-- Konuşma notu: Daha küçük alt-problem için "hedef" ve "yedek"in ne olduğunu düşünün. -->

---

# Yanıt

Üstteki `n - 1` diski yoldan çekmek için,
*hedef* yedek çubuktur, *yedek* ise özgün
hedeftir — roller özyinelemenin her seviyesinde döner.

<!-- Konuşma notu: Bu dönüş, öğrencilerin elle izlemekte en çok zorlandığı kısım — animasyon bunu görünür kılıyor. -->

---

<!-- _class: bolum -->

# 5. Kuyruk: İlk Giren, İlk Çıkar

<!-- Konuşma notu: Yığının ayna görüntüsü: aynı iki işlem, karşıt uçlar, farklı ad — LIFO yerine FIFO. -->

---

# Sezgi — bir bekleme sırası

- Kasa sırası, yazdırma kuyruğu, web istek kuyruğu
- Yeni gelenler **arkaya** katılır
- En uzun süredir bekleyen **önden** ayrılır

<!-- Konuşma notu: Sorun: süpermarket sırasından kim önce çıkar — en yeni gelen mi, en uzun bekleyen mi? -->

---

# FIFO — LIFO'nun aynası

**İlk Giren, İlk Çıkar.** Bir yığınla aynı iki
temel işlem, farklı adlarla, ve şimdi
**farklı uçlara** dokunuyorlar.

<!-- Konuşma notu: Yığın: bir uç. Kuyruk: iki uç, her işlem için biri — kavramsal sıçramanın tamamı bu. -->

---

# Kuyruk ADT'si

| İşlem | Ne yapar | Ön koşul | Karmaşıklık |
| --- | --- | --- | --- |
| `enqueue(x)` | Arkaya ekle | dolu değil (dizi) | O(1) |
| `dequeue()` | Önü çıkar/döndür | boş değil | O(1) |
| `peek()` | Önü döndür, tut | boş değil | O(1) |
| `isEmpty()` | sıfır eleman mı? | yok | O(1) |

<!-- Konuşma notu: Bu ADT'yi, her biri kendi ödünleşimiyle, üç farklı şekilde kuracağız. -->

---

# Dizi kuyruğu — fikir

- İki indis tut: `front` (en eski), `rear` (en yeni)
- `enqueue`: `rear`'ı ilerlet, oraya yaz
- `dequeue`: `front`'ta oku, `front`'u ilerlet
- Eleman kaydırılmaz — ama indis 0'daki yere bakın

<!-- Konuşma notu: Elemanlar dequeue edildikçe öndeki kullanılmayan boşlukta bir şeyler ters gidiyor — animasyon bunu gösteriyor. -->

---

# Queue in a plain array

<iframe class="dsanim" src="anim/array-queue-drift.html?yer=slayt&lang=tr" title="Queue in a plain array and the drift problem"></iframe>

<!-- Konuşma notu: Normal örnek: 8 hücreyi doldur, 3'ünü çıkar, yine de iki enqueue daha başarısız olur — front, dequeue'nun boşalttığı hücreleri hiç yeniden kullanmaz. -->

---

# Kod — enqueue()/dequeue() (saf)

```c
bool enqueue(int x) {
    if (rear == CAP - 1) return false;
    q[++rear] = x;
    return true;
}

bool dequeue(int *out) {
    if (front > rear) return false;
    *out = q[front++];
    return true;
}
```

<!-- Konuşma notu: Basit ve O(1), ama rear hiç geri gelmiyor, dequeue önde kaç hücre boşaltırsa boşaltsın. -->

---

# Beklenen çıktı

```text
enqueue(5,12,7,19,3,27,14,8): front=0, rear=7
dequeue() x3:    front=3, rear=7
enqueue(99) -> false
enqueue(42) -> false
```

<!-- Konuşma notu: Hücre 0, 1, 2 boş, ama kuyruk yine de dolu olduğunu iddia ediyor — bu kayma sorunu. -->

---

# Tuzak — kayma sorunu

`rear` yalnız **ileri** gider. Kuyruk, önde
hücreler boşken "dolu" der — dizinin önünden
**kaymıştır**.

<!-- Konuşma notu: Her dequeue'dan sonra elemanları kaydırmak bunu düzeltirdi, ama O(1) dequeue'ları O(n)'e çevirir — kabul edilemez. -->

---

# Mini soru

Başında üç boş hücre olsa bile bu kuyruk
neden "dolu" der?

<!-- Konuşma notu: enqueue'nun gerçekte neyi denetlediğine tekrar bakın. -->

---

# Yanıt

`enqueue` yalnız `rear == CAP - 1`'i denetler;
`front`'tan önceki hücrelerin boş olup olmadığına
hiç bakmaz. Gerçek çözüm sırada: diziyi bir **halka** gibi düşünün.

<!-- Konuşma notu: Bu, dairesel kuyruğu mükemmel biçimde kuruyor. -->

---

# Dairesel kuyruk — halka gibi düşün

- Son indisten sonra yine ilk indis gelir
- `(indis + 1) % CAP`, ileri yürür, başa döner
- `front == rear` artık belirsiz (boş mu, dolu mu?)
- Bunu çözmek için bir alan daha tut: `count`

<!-- Konuşma notu: Boşa giden yer, yalnızca diziyi düz bir çizgi olarak düşündüğümüz için boşa gidiyordu. -->

---

# Circular queue

<iframe class="dsanim" src="anim/circular-queue.html?yer=slayt&lang=tr" title="Circular queue"></iframe>

<!-- Konuşma notu: Normal örnek: 10 hücrelik halka, orta karışıklık, bir başa dönüş — rear'ın dequeue'nun boşalttığı hücreleri yeniden kullanışını izleyin. -->

---

# Kod — enqueue() (dairesel)

```c
bool enqueue(int x) {
    if (count == CAP) return false;
    rear = (rear + 1) % CAP;
    q[rear] = x;
    count++;
    return true;
}
```

<!-- Konuşma notu: Saf sürümden tek fark: rear modulo ile başa dönüyor, count gerçek doluluğu takip ediyor. -->

---

# Kod — dequeue() (dairesel)

```c
bool dequeue(int *out) {
    if (count == 0) return false;
    *out = q[front];
    front = (front + 1) % CAP;
    count--;
    return true;
}
```

<!-- Konuşma notu: enqueue ile aynı ayna biçim — front da artık modulo ile başa dönüyor. -->

---

# Neden `count`'a da ihtiyacımız var

`front == rear`, "tek eleman", "boş" ya da
**"tamamen dolu"** anlamına gelebilir — düz bir
indis karşılaştırması artık bunları ayırt edemez.

<!-- Konuşma notu: count, akıllı indis hilelerine güvenmek yerine belirsizliği doğrudan çözer. -->

---

# Karmaşıklık — hâlâ O(1), kayma yok

Kuyruk "dolu" demeden önce beş hücrenin
tamamı kullanılır. Kayma sorunu tamamen ortadan
kalktı, ve her işlem hâlâ **O(1)**.

<!-- Konuşma notu: Bu, gerçek bir sınırlı tamponda gerçekten kullanacağınız kuyruk uygulaması. -->

---

# Sık yapılan hatalar (dairesel kuyruk)

- Yalnız `front == rear`'ı "boş" anlamına kullanmak
- İki indisten **birinde** modu unutmak
- İkisi de halkayı bir başa dönüşten sonra bozar

<!-- Konuşma notu: Yalnız rear başa dönüp front dönmezse, halka ilk başa dönüşten sonra sessizce bozulur. -->

---

# Mini soru

`count`, `CAP`'e ulaştıktan sonra, `front == rear`
şimdi ne anlama gelir, boşken ne anlama geldiğine kıyasla?

<!-- Konuşma notu: Hem "az önce boşaldı" hem "az önce doldu" durumları front == rear gösterebilir. -->

---

# Yanıt

Her iki durum da `front == rear` gösterebilir;
ikisini ayıran tam olarak **`count`**'tur, çünkü
indisler tek başına belirsizdir.

<!-- Konuşma notu: count'un isteğe bağlı bir kayıt değil, belirsizliği çözen tek şey olmasının nedeni bu. -->

---

# Hiç taşmayan bir kuyruk

- Bağlı liste ile kuyruk: eleman başına bir düğüm, `CAP` yok
- **İki** işaretçi gerekir: `front` (çıkar),
  `rear` (ekle) — ikisi de O(1) kalsın diye
- `rear` olmadan `enqueue` tüm listeyi gezerdi

<!-- Konuşma notu: Bağlı yığınla aynı taşma-kaldırma ödünleşimi, ama bu sefer her uca bir işaretçi gerekiyor. -->

---

# Linked-list queue

<iframe class="dsanim" src="anim/linked-queue.html?yer=slayt&lang=tr" title="Linked-list queue"></iframe>

<!-- Konuşma notu: Tek düğümle, front ve rear aynı düğümü gösterir — en baştaki bu özel durumu izleyin. -->

---

# Kod — enqueue() (bağlı)

```c
void enqueue(int x) {
    QNode *n = malloc(sizeof(QNode));
    n->data = x; n->next = NULL;
    if (rear == NULL) {
        front = rear = n;
    } else {
        rear->next = n;
        rear = n;
    }
}
```

<!-- Konuşma notu: Boş kuyruk durumu her iki işaretçiyi de yeni düğüme ayarlar; aksi hâlde yalnız rear hareket eder. -->

---

# Kod — dequeue() (bağlı)

```c
bool dequeue(int *out) {
    if (front == NULL) return false;
    QNode *tmp = front;
    *out = tmp->data;
    front = front->next;
    if (front == NULL) rear = NULL;
    free(tmp);
    return true;
}
```

<!-- Konuşma notu: Kuyruk az önce boşaldıysa, rear da NULL'a çekilmeli, yoksa sonraki enqueue çöp üzerinden yazar. -->

---

# Sık yapılan hatalar (bağlı kuyruk)

- Boşaldığında `rear`'ı `NULL`'a çekmeyi unutmak
- Tek düğümle yalnız `front`/`rear`'dan birini güncellemek
- İkisi de sonraki enqueue'da **sarkan işaretçiye** yol açar

<!-- Konuşma notu: Tek bir düğüm hem öndür hem arka; her iki işaretçi de ona işaret etmelidir. -->

---

# Mini soru

Bağlı kuyruk neden bir `rear` işaretçisine
ihtiyaç duyarken, bağlı yığın duymaz?

<!-- Konuşma notu: Her yapının nereden eklediğini, nereden çıkardığını karşılaştırın. -->

---

# Yanıt

Yığın **aynı** uçtan (`top`) ekler/çıkarır — tek
işaretçi yeter. Kuyruk bir uçtan ekler, diğerinden
çıkarır — O(1) kalmak için **her iki uca** da bir işaretçiye ihtiyaç duyar.

<!-- Konuşma notu: rear olmadan, enqueue son düğümü bulmak için tüm listeyi gezerdi — O(n), O(1) değil. -->

---

# Deque — her iki uç

Bir **deque** (double-ended queue), "yalnız bir
uç" kuralını kaldırır: hem önde hem arkada
push/pop'a izin verir.

<!-- Konuşma notu: Bir deque, yalnızca hangi işlemleri çağırdığınıza bağlı olarak, aynı anda bir yığın ve bir kuyruk gibi davranır. -->

---

# Deque ADT'si

| İşlem | Ne yapar | Karmaşıklık |
| --- | --- | --- |
| `push_back(x)` | Arkaya ekle | O(1) |
| `push_front(x)` | Öne ekle | O(1) |
| `pop_back()` | Arkayı çıkar | O(1) |
| `pop_front()` | Önü çıkar | O(1) |

<!-- Konuşma notu: Burada çift bağlı liste üzerine kurulu; her uç kendi işaretçi güncelleme çiftini alıyor. -->

---

# Double-ended queue (deque)

<iframe class="dsanim" src="anim/deque.html?yer=slayt&lang=tr" title="Double-ended queue (deque)"></iframe>

<!-- Konuşma notu: push_front'un push_back'in tam karşıt ucuna eklediğini izleyin — sıradan bir kuyruğun hiç yapamayacağı bir şey. -->

---

# Kod — push_back()

```c
void push_back(Deque *d, int x) {
    DNode *n = malloc(sizeof(DNode));
    n->data = x;
    n->next = NULL;
    n->prev = d->back;
    if (d->back != NULL)
        d->back->next = n;
    else
        d->front = n;
    d->back = n;
}
```

<!-- Konuşma notu: push_front, back/next yerine front/prev'e dokunan, bu fonksiyonun ayna görüntüsüdür. -->

---

# Kod — pop_back()

```c
bool pop_back(Deque *d) {
    if (d->back == NULL) return false;
    DNode *tmp = d->back;
    d->back = tmp->prev;
    if (d->back != NULL)
        d->back->next = NULL;
    else
        d->front = NULL;
    free(tmp);
    return true;
}
```

<!-- Konuşma notu: pop_front, back/prev yerine front/next'e dokunarak bunu tam olarak yansıtır. -->

---

# Not — bir deque, yığın ya da kuyruk olabilir

- Yalnız `push_back`/`pop_back` → tam olarak **yığın** gibi
- Yalnız `push_back`/`pop_front` → tam olarak **kuyruk** gibi
- Java'nın `ArrayDeque`'i, ikisi için de daha hızlı,
  genel bir alternatif olarak önerilir

<!-- Konuşma notu: C'de standart bir deque yok, bu yüzden bir tane kuruyoruz; Java'da java.util.ArrayDeque zaten bunu veriyor. -->

---

# Mini soru

Boş deque: `push_front(1)`, `push_back(2)`,
`push_front(3)`. Önden arkaya — nedir?

<!-- Konuşma notu: Her çağrıyı tek tek izleyin. -->

---

# Yanıt

`3 1 2`. `push_front(1)` → `[1]`.
`push_back(2)` → `[1, 2]`.
`push_front(3)` → `[3, 1, 2]`.

<!-- Konuşma notu: Öne eklemeler soldan geriye doğru, arkaya eklemeler sağda ileriye doğru kurulur. -->

---

# Çok seviyeli kuyruk

- Gerçek zamanlayıcılar nadiren her işe eşit davranır
- İşletim sistemi zamanlayıcısı aynı anda **birkaç** FIFO kuyruğu tutar
- Önce etkileşimli, sonra arka plan, sonra toplu iş
- Her seviye **sıradan bir kuyruktur**; bir politika birini seçer

<!-- Konuşma notu: Bugün yeni bir kod gerektirmiyor — yalnızca zaten kurduğumuz kuyruklardan birkaçı, artı küçük bir seçim kuralı. -->

---

# Çok seviyeli kuyruk — seviyeler

| Seviye | İş türü | Öncelik |
| --- | --- | --- |
| Kuyruk 1 | Etkileşimli | En yüksek |
| Kuyruk 2 | Arka plan | Orta |
| Kuyruk 3 | Toplu iş | En düşük |

<!-- Konuşma notu: Zamanlayıcı önce üst kuyrukları sunar, yalnızca üsttekiler boşken alta iner. -->

---

# Çok seviyeli kuyruk zamanlaması

<iframe class="dsanim" src="anim/multilevel-queue.html?yer=slayt&lang=tr" title="Multilevel queue scheduling"></iframe>

<!-- Konuşma notu: Normal örnek: 12 süreç, üç sınıfa dengeli dağılmış. admit(), süreci kendi seviyesine ekler; pick_next() her zaman önce seviye 0'ı dener. -->

---

# Tuzak — açlık riski

Dokuz sistem/etkileşimli süreç arasında erken
gelen bir **toplu iş** süreci en **son** sunulur —
yalnız öncelik sırası açlığı önleyemez.

<!-- Konuşma notu: Gerçek zamanlayıcılar, bir alt seviyenin sonsuza kadar aç kalmaması için yaşlandırma ya da zaman dilimleme ekler. -->

---

# Mini soru

Çok seviyeli kuyruk, katı anlamda neden
yeni bir veri yapısı değildir?

<!-- Konuşma notu: Her bir seviyenin gerçekte ne olduğuna bakın. -->

---

# Yanıt

Her seviye **sıradan bir kuyruktur**; "çok
seviyeli", birkaç var olan kuyruk arasından
seçim yapan bir *zamanlama politikasını* tanımlar — yeni bir depolama yolu değil.

<!-- Konuşma notu: Gelecek hafta, bir öbek üzerine kurulu yakın akrabası öncelik kuyruğuyla tanışacaksınız. -->

---

# Özet — yığın tabanlı yapılar

| Yapı | Kural | Ekle/çıkar | Tipik kullanım |
| --- | --- | --- | --- |
| Dizi yığını | LIFO | O(1), sabit kapasite | Küçük, sınırlı yığınlar |
| Bağlı yığın | LIFO | O(1), sınırsız | Öngörülemeyen boyut |
| Çağrı yığını | LIFO | Otomatik | Çalışan her program |

<!-- Konuşma notu: Üçü de tam olarak aynı LIFO kuralına uyar — yalnızca depolama ve kapasite sınırı farklı. -->

---

# Özet — kuyruk tabanlı yapılar (I)

| Yapı | Kural | Ekle/çıkar |
| --- | --- | --- |
| Dizi kuyruğu (saf) | FIFO | O(1), ama kayar |
| Dairesel kuyruk | FIFO | O(1), kayma yok |
| Bağlı liste ile kuyruk | FIFO | O(1), sınırsız |

<!-- Konuşma notu: Dairesel kuyruk gerçekte kullanacağınız olan; saf dizi kuyruğu bir öğretim basamağı. -->

---

# Özet — kuyruk tabanlı yapılar (II)

| Yapı | Kural | Tipik kullanım |
| --- | --- | --- |
| Deque | Her iki uç | Kayan pencere, geri al/yinele |
| Çok seviyeli kuyruk | Birkaç FIFO + politika | İşletim sistemi zamanlaması |

<!-- Konuşma notu: İkisi de sıradan kuyruğu genelleştirir — biri hangi uca dokunduğunuzu gevşeterek, diğeri öncelik ekleyerek. -->

---

# Özet — yığın uygulamaları

| Uygulama | Yapı | Ana fikir |
| --- | --- | --- |
| Parantez dengesi | Yığın | En son, ilk kapanan |
| Postfix değerlendirme | Yığın | İki çek, uygula, sonucu it |
| Infix → postfix | İşleç yığını + çıktı | Önceliği bir kerede çöz |
| Hanoi Kulesi | Çağrı yığını | n-1'i çöz, hareket et, n-1'i tekrar çöz |

<!-- Konuşma notu: Dört çok farklı görünen problem, hepsi tam olarak aynı küçük yığın arayüzüyle çözüldü. -->

---

# Büyük resim

Tek bir kural — **hangi uca/uçlara dokunabilirsiniz** —
bu dersteki her yapıyı ayırıyor: bir uç (yığın),
iki uç (kuyruk/deque), ya da birkaç paralel kuyruk (çok seviyeli).

<!-- Konuşma notu: Bugünden yalnız bir cümle hatırlanacaksa, hatırlanmaya değer olan bu. -->

---

# Alıştırma

- Bugünün her konusu için alıştırmalar hafta
  notlarında: `docs/week-3/cen207-week-3.tr.md`
- Peek, dengesiz parantez denetimi, prefix'siz
  infix-prefix çevirisi, count'suz dairesel kuyruk,
  palindrom denetimi, daha adil çok seviyeli zamanlama

<!-- Konuşma notu: Bunlar, yazılı notların sonunda listelenen, çözüm taslaklı aynı beş alıştırma. -->

---

# Kendini sınama turu

On kısa soru. Yanıt bir sonraki slaytta
görünmeden önce düşünün.

<!-- Konuşma notu: Bunlar hafta notlarının sonundaki kendini sınama testini, her soru bir slaytta olacak şekilde yansıtıyor. -->

---

# 1. LIFO ne anlama gelir?

<!-- Konuşma notu: Sorun, bekleyin, sonra ilerleyin. -->

---

# Son Giren, İlk Çıkar — yığın.

<!-- Konuşma notu: Bölüm 1'deki tabak yığını resmi bütün fikrin ta kendisi. -->

---

# 2. FIFO ne anlama gelir?

<!-- Konuşma notu: Sorun, bekleyin, sonra ilerleyin. -->

---

# İlk Giren, İlk Çıkar — kuyruk.

<!-- Konuşma notu: Bölüm 5'teki bekleme sırası resmi bütün fikrin ta kendisi. -->

---

# 3. Dizide `push` neden `top == CAP - 1`'i denetler, `top == CAP`'i değil?

<!-- Konuşma notu: Geçerli indis aralığını düşünün. -->

---

# Geçerli indisler 0..CAP-1; yığın, `top` CAP-1'e ulaştığı an dolar.

<!-- Konuşma notu: top == CAP'i beklemek zaten dizinin sonunun bir hücre ötesinde olurdu. -->

---

# 4. Postfix değerlendirmede hangi işlenen önce çekilir?

<!-- Konuşma notu: "Önce sağ işlenen" kuralını hatırlayın. -->

---

# Sağdaki işlenen — en son itildiği için ilk o çıkar.

<!-- Konuşma notu: `8 2 -`'nin neden 2 - 8 değil 8 - 2 anlamına geldiği tam olarak bu. -->

---

# 5. Saf bir dizi kuyruğu, önde boş hücreler olsa bile neden sonunda "dolu" der?

<!-- Konuşma notu: Bu, kayma sorununun bir soru olarak yeniden ifadesi. -->

---

# `rear` yalnız artar, `dequeue`'nun önde boşalttığı hücreleri hiç yeniden kullanmaz.

<!-- Konuşma notu: Kuyruk, dizinin sonuna çarpana kadar sağa doğru "kayar". -->

---

# 6. Dairesel kuyruk, `front`/`rear`'ın ötesinde hangi ekstra duruma ihtiyaç duyar?

<!-- Konuşma notu: front == rear belirsizliğini düşünün. -->

---

# Şu anki eleman sayısını tutan bir `count` — indisler tek başına boşu doludan ayıramaz.

<!-- Konuşma notu: Bir başa dönüşten sonra, front == rear artık soruyu tek başına çözemez. -->

---

# 7. `fact(n) = n * fact(n - 1)`'in temel durumu nedir?

<!-- Konuşma notu: Bölüm 3'ün ilk kod slaytını hatırlayın. -->

---

# `fact(0) = 1`. Bu olmadan, çağrılar hiç durmaz ve çağrı yığını taşar.

<!-- Konuşma notu: Her özyinelemeli fonksiyonun ulaşılabilir en az bir temel duruma ihtiyacı vardır. -->

---

# 8. Çağrı yığını neden gerçek bir yığın sayılmayı hak eder?

<!-- Konuşma notu: Bölüm 1'deki LIFO kuralıyla karşılaştırın. -->

---

# Tam olarak LIFO'ya uyar: en son çağrı her zaman bitirecek bir sonraki çağrıdır.

<!-- Konuşma notu: Tıpkı herhangi bir yığında en son itilen elemanın çekilecek bir sonraki eleman olması gibi. -->

---

# 9. `n` disk için kaç Hanoi hamlesi gerekir?

<!-- Konuşma notu: Bölüm 4'teki yinelemeyi hatırlayın. -->

---

# `2ⁿ - 1` hamle — `n`'de üstel büyüme.

<!-- Konuşma notu: n = 64 için, saniyede bir hamleyle bu yaklaşık 585 milyar yıl. -->

---

# 10. Ne sıradan bir yığının ne de sıradan bir kuyruğun yapamadığı bir şey söyleyin.

<!-- Konuşma notu: Her yapının hangi uçlara dokunmasına izin verildiğini düşünün. -->

---

# Hem **önden** hem **arkadan**, ikisi de O(1), ekleme ya da çıkarma.

<!-- Konuşma notu: Sıradan bir yığın yalnız tepesine dokunur; sıradan bir kuyruk yalnız bir uçtan ekler, diğerinden çıkarır. -->

---

<!-- _class: baslik -->

# Bir sonraki hafta

**4. hafta — Ağaçlar: İkili Ağaçlar, Dolaşmalar, Öbekler**

Bugünkü her yığın ve kuyruk, elemanları katı,
dallanmayan bir sırada tuttu. Ağaçlar, bir düğümün
birden çok çocuğu olmasına izin verir — Hanoi
Kulesi için kullanılan tam olarak aynı özyinelemeli örüntüyle dolaşılır.

<!-- Konuşma notu: Sol alt ağacı çöz, düğümü ziyaret et, sağ alt ağacı çöz — tam olarak Hanoi'nin özyineleme biçimi, yeni bir veri biçimi üzerinde. -->

---

# Kaynaklar (1/2)

- Ders izlencesi, Hafta 3: `docs/syllabus/syllabus.tr.md`
- Cormen, Leiserson, Rivest, Stein. *Introduction to
  Algorithms*, 3. baskı. MIT Press
- Sedgewick, Wayne. *Algorithms*, 4. baskı.
  Addison-Wesley, 2011

<!-- Konuşma notu: Bunlar, hafta notlarının sonunda listelenen aynı kaynaklar. -->

---

# Kaynaklar (2/2)

- Deitel & Deitel. *C How to Program*, 7. baskı.
- Y. D. Liang. *Introduction to Java Programming*, 10. baskı.
- É. Lucas, *Récréations mathématiques*, 1883
- J. Łukasiewicz, Polish/Reverse Polish yazımı, 1920'ler

<!-- Konuşma notu: Tarihsel kaynaklar (Lucas, Łukasiewicz), bugünkü "kısa tarihçe" slaytlarının dayandığı kaynaklar. -->
