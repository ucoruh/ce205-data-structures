# Markdown Döküman Dönüştürücü

Bu repo içerisindeki `convert_all_markdown.py` script'i, belirlenen klasörler altındaki tüm markdown dosyalarını çeşitli formatlara (HTML, PDF, PPTX, DOCX) dönüştürür.

## Özellikler

- Dönüşümler multi-thread yapılır, sistem kaynaklarını verimli kullanır
- Belirli klasörlerdeki markdown dosyalarını otomatik bulur ve işler
- Eski çıktı dosyalarını temizleme özelliği
- İlerleme çubuğu ile görsel takip
- Renkli terminal çıktısı

## Desteklenen Dönüşümler

Script, her markdown dosyası için aşağıdaki dönüşümleri yapar:

1. **Marp ile:**
   - HTML slayt (`*_slide.html`)
   - PDF slayt (`*_slide.pdf`)
   - PPTX slayt (`*_slide.pptx`)

2. **Pandoc ile:**
   - PDF doküman (`*_doc.pdf`)
   - Word dosyası (`*_word.docx`)
   - PowerPoint dosyası (`*_word.pptx`)

## Gereksinimler

- Python 3.6 veya daha yüksek sürüm
- [Marp CLI](https://github.com/marp-team/marp-cli) (`npm install -g @marp-team/marp-cli`)
- [Pandoc](https://pandoc.org/installing.html)
- XeLaTeX (PDF dönüşümü için)
- Python paketleri: `psutil`, `tqdm` (requirements.txt'den yüklenebilir)

## Kurulum

```bash
# Gerekli Python paketlerini yükleyin
pip install -r requirements.txt

# Marp CLI yükleyin (npm gerektirir)
npm install -g @marp-team/marp-cli

# Pandoc yükleyin (işletim sisteminize özel kurulum yapın)
# Windows: https://pandoc.org/installing.html
# Linux: sudo apt-get install pandoc
# macOS: brew install pandoc

# XeLaTeX yükleyin (PDF çıktısı için gerekli)
# Windows: MiKTeX veya TeX Live
# Linux: sudo apt-get install texlive-xetex
# macOS: brew cask install mactex
```

## Kullanım

### Temel Kullanım

```bash
# Eski dönüştürülmüş dosyaları temizleyip, tüm markdown dosyalarını dönüştürür
python convert_all_markdown.py
```

### Sadece Temizleme

```bash
# Sadece eski dönüştürülmüş dosyaları temizler, dönüştürme yapmaz
python convert_all_markdown.py --clean-only
```

### İş Parçacığı Sayısını Belirtme

```bash
# 4 iş parçacığı kullanarak dönüştürme yapar
python convert_all_markdown.py --threads 4
```

### Farklı Bir Docs Dizini Belirtme

```bash
# Belirtilen dizindeki markdown dosyalarını dönüştürür
python convert_all_markdown.py --dir başka_dizin
```

## İşlenecek Klasörler

Script sadece aşağıdaki klasörlerdeki markdown dosyalarını işler:

- syllabus
- week-1 ile week-16 arası tüm haftalar

Bu klasörler ce204-object-oriented-programming dersi için belirlenen modüllere karşılık gelir.

## Sorun Giderme

### Dönüşüm Hataları

Eğer dönüşüm sırasında hatalar alıyorsanız:

1. Marp ve Pandoc'un doğru şekilde yüklendiğinden emin olun
2. XeLaTeX'in yüklü olduğunu kontrol edin
3. Script çıktısındaki hata mesajlarını inceleyin

### Bağımlılık Hataları

Python bağımlılıklarıyla ilgili hatalar için:

```bash
pip install -r requirements.txt
```

komutunu çalıştırarak gerekli paketleri yükleyin.

## Katkıda Bulunma

Bu script, CE204 Object-Oriented Programming dersi dökümanlarını dönüştürmek için hazırlanmıştır. 
Geliştirmeler veya düzeltmeler için pull request gönderebilirsiniz. 