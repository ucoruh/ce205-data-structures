# CE204 OOP MkDocs PowerShell Toolkit

Bu klasör, CE204 Object-Oriented Programming dersi için MkDocs sitesini yönetmek üzere PowerShell scriptlerini içerir.

## PowerShell Scriptlerinin Avantajları

- Daha iyi hata yönetimi
- Nesne tabanlı veri işleme
- Gelişmiş fonksiyonellik
- Daha güçlü içerik çıktısı

## Script Dosyaları

Bu toolkit şu scriptlerden oluşur:

1. **setup.ps1**: MkDocs ortamını kurmak için Conda virtual environment oluşturur. Kurulum, ana dizindeki `conda_env.yml` dosyasından yapılır.

2. **build.ps1**: MkDocs sitesini derler ve lokalde görüntülemenize olanak tanır.

3. **deploy.ps1**: MkDocs sitesini GitHub Pages'e yayınlamanızı sağlar.

## Yapılandırma Dosyaları

Projede üç önemli yapılandırma dosyası bulunmaktadır:

1. **mkdocs.yml**: MkDocs sitesi yapılandırması (ana dizinde)
2. **conda_env.yml**: Conda ortamı kurulum yapılandırması (ana dizinde)
3. **requirements.txt**: Pip paketleri listesi (referans için, ana dizinde)

## Kullanım Talimatları

### Script Çalıştırma İzinleri

PowerShell scriptlerini çalıştırmadan önce, izin politikasını ayarlamanız gerekebilir. Bunu yapmak için PowerShell'i yönetici olarak açın ve şu komutu çalıştırın:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Kullanım Adımları

1. **Ortam Kurulumu**:
   ```powershell
   .\setup.ps1
   ```
   Bu komut, ana dizindeki `conda_env.yml` dosyasını kullanarak gerekli tüm bağımlılıkları içeren bir Conda ortamı oluşturur. Mevcut bir ortam varsa, önce kaldırılacaktır.

   **setup.ps1 Parametreleri**:
   
   Script farklı parametrelerle çalıştırılabilir:
   
   - **Parametresiz**: Tam temiz kurulum yapar.
     ```powershell
     .\setup.ps1
     ```
   
   - **--remove**: Sadece mevcut ortamı kaldırır, yeniden kurulum yapmaz.
     ```powershell
     .\setup.ps1 -Remove
     ```
   
   - **--status**: Ortam durumunu gösterir (kurulum durumu, aktif ortam, yüklü paketler vs.).
     ```powershell
     .\setup.ps1 -Status
     ```
   
   - **--skip**: Eğer mevcut ortam varsa kaldırmadan kullanmaya devam eder.
     ```powershell
     .\setup.ps1 -Skip
     ```

2. **Siteyi Derleme ve Görüntüleme**:
   ```powershell
   .\build.ps1
   ```
   Bu komut, siteyi derler ve lokalde (http://127.0.0.1:8000/) görüntülemenizi sağlar.

3. **GitHub Pages'e Yayınlama**:
   ```powershell
   .\deploy.ps1
   ```
   Bu komut, siteyi derleyip GitHub Pages'e yayınlar.

## Conda Ortam Yönetimi

### Ortamı Aktifleştirme

Conda ortamını manuel olarak aktifleştirmek için:

```powershell
conda activate ce204-object-oriented-programming-mkdocs
```

### Ortamları Listeleme

Mevcut tüm Conda ortamlarını görmek için:

```powershell
conda env list
```

### Ortamları Kaldırma

**ÖNEMLİ**: Conda ortamları ancak deaktif durumdayken kaldırılabilir.

Projenin Conda ortamını kaldırmak için:

```powershell
conda env remove -n ce204-object-oriented-programming-mkdocs -y
```

Varsa diğer eski ortamları kaldırmak için:

```powershell
conda env remove -n ce204-object-oriented-programming-mkdocs-new -y
```

### Ortam Kaldırma Sorunlarını Çözme

Eğer aktif bir Conda ortamını kaldırmaya çalışıyorsanız, şu hata mesajını alırsınız:
```
CondaEnvironmentError: Cannot remove current environment. Deactivate and run conda remove again.
```

Bu durumda şu adımları izleyin:

1. Önce mevcut PowerShell penceresini kapatın
2. Yeni bir PowerShell penceresi açın
3. Ortamı deaktifleştirin:
   ```powershell
   conda deactivate
   ```
4. Ortamı kaldırın:
   ```powershell
   conda env remove -n ce204-object-oriented-programming-mkdocs -y
   ```
5. Conda önbelleğini temizleyin:
   ```powershell
   conda clean --index-cache --yes
   ```

## conda_env.yml Dosyası Hakkında

`conda_env.yml` dosyası, projenin ana dizininde bulunur ve Conda ortamının kurulumu için gerekli tüm bilgileri içerir. Bu dosya şu özelliklere sahiptir:

- Ortam adı ve Python sürümü
- Conda kanalları (conda-forge, defaults)
- Conda ve pip paketleri

Bu dosyayı düzenleyerek ortam yapılandırmasını ihtiyaçlarınıza göre değiştirebilirsiniz. Ancak düzenlemeler yapmadan önce yedek almanız önerilir.

## Gereksinimler

- Windows işletim sistemi
- PowerShell 5.1 veya üzeri
- Anaconda veya Miniconda
- Git

## Sorun Giderme

PowerShell scriptlerini çalıştırırken sorun yaşarsanız:

1. PowerShell ExecutionPolicy ayarınızı kontrol edin
2. Conda'nın PATH üzerinde olduğundan emin olun
3. Paket yükleme hataları için internet bağlantınızı kontrol edin
4. Git kullanıcı bilgilerinizin doğru olduğundan emin olun

### Conda Geçici Dosyaları

Conda ortamı kurulumu veya kaldırılması sırasında, bazı geçici dosyalar oluşturulur. Bu dosyalar genellikle şu şekilde adlandırılır:

- **condaenv.*.requirements.txt**: Conda ortamı oluşturulurken, `conda_env.yml` dosyasındaki pip paketlerini yüklemek için oluşturulan geçici dosyalardır.
- **.conda_lock***: Conda işlemleri sırasında oluşan kilit dosyalarıdır.
- **conda-meta.*.json.tar.bz2**: Meta veri ve indeks dosyalarıdır.
- **conda-tmp-***: Diğer geçici Conda dosyalarıdır.

Normal koşullarda Conda bu dosyaları otomatik olarak temizler, ancak işlem kesintiye uğrarsa veya hata oluşursa bu dosyalar çalışma dizininde kalabilir. Bu durum, sonraki kurulum denemeleri için sorun oluşturabilir.

`setup.ps1` scripti artık otomatik olarak bu geçici dosyaları temizler, ancak manuel olarak temizlemek isterseniz:

```powershell
# Geçici Conda dosyalarını temizleme
Get-ChildItem -Path "." -Include "condaenv.*.requirements.txt", ".conda_lock*", "conda-meta.*.json.tar.bz2", "conda-tmp-*" -Recurse -File | Remove-Item -Force
```

### Ortam Aktifken Kurulum Yapamama Sorunu

`setup.ps1` scripti, aktif bir Conda ortamı varken çalıştırıldığında hata verecektir. Bu durumda script size ne yapılması gerektiğine dair talimatlar gösterecektir:

1. Mevcut PowerShell penceresini kapatın
2. Yeni bir PowerShell penceresi açın
3. `conda deactivate` komutunu çalıştırın
4. Scripti tekrar çalıştırın

**Not**: PowerShell'de `conda deactivate` komutunu çalıştırdıktan sonra aynı pencerede script çalıştırılmaya devam edilmemelidir. Bu işlem, ortamın tam olarak deaktifleştirilmesini sağlamaz ve hataya neden olur.

## Eski Batch Dosyaları Hakkında

Bu PowerShell scriptleri, eski `.bat` dosyalarının yerine geliştirilmiş versiyonlardır. Eski batch dosyaları yedek olarak `old/` klasöründe saklanmaktadır. 