# PowerShell Script: MkDocs Ortam Kurulumu
# CE204 OOP MkDocs Ortami Kurulum Scripti

param (
    [switch]$Remove,    # Sadece ortami kaldir, kurulum yapma
    [switch]$Status,    # Ortam durumunu goster
    [switch]$Skip,      # Varsa mevcut ortami kullan, kaldirma
    [switch]$Help       # Yardim bilgilerini goster
)

# Eger --help parametresi verilmisse, yardim bilgilerini goster ve cik
if ($Help) {
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host "           CE204 OOP - MkDocs Ortam Kurulumu" -ForegroundColor Cyan
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "KULLANIM:" -ForegroundColor Yellow
    Write-Host "    .\setup.ps1 [parametre]" -ForegroundColor White
    Write-Host ""
    Write-Host "PARAMETRELER:" -ForegroundColor Yellow
    Write-Host "    -Help    : Bu yardim mesajini gosterir." -ForegroundColor White
    Write-Host "    -Remove  : Sadece mevcut ortami kaldirir, yeniden kurulum yapmaz." -ForegroundColor White
    Write-Host "    -Status  : Ortam durumunu gosterir (kurulu paketler, versiyon bilgileri vs.)." -ForegroundColor White
    Write-Host "    -Skip    : Mevcut ortami korur ve varsa kullanir, kaldirma islemi yapmaz." -ForegroundColor White
    Write-Host "    (parametre yok) : Mevcut ortami kaldirir ve temiz bir kurulum yapar." -ForegroundColor White
    Write-Host ""
    Write-Host "ORNEKLER:" -ForegroundColor Yellow
    Write-Host "    .\setup.ps1            # Tam kurulum yapar (varsa ortami kaldirir ve yeniden kurar)" -ForegroundColor White
    Write-Host "    .\setup.ps1 -Status    # Ortam durumunu gosterir" -ForegroundColor White
    Write-Host "    .\setup.ps1 -Remove    # Ortami kaldirir, kurulum yapmaz" -ForegroundColor White
    Write-Host "    .\setup.ps1 -Skip      # Ortam varsa kullanir, yoksa kurar" -ForegroundColor White
    Write-Host "    .\setup.ps1 -Help      # Bu yardim mesajini gosterir" -ForegroundColor White
    Write-Host ""
    Write-Host "ACIKLAMA:" -ForegroundColor Yellow
    Write-Host "    Bu script, CE204 dersi icin MkDocs dokumantasyon ortamini kurar." -ForegroundColor White
    Write-Host "    Conda kullanarak izole bir Python ortami olusturur ve gerekli paketleri yukler." -ForegroundColor White
    Write-Host "    Script icin kurulu bir Conda veya Miniconda gereklidir." -ForegroundColor White
    Write-Host ""
    exit 0
}

# ========== AYARLAR ==========
$CourseCode = "ce204"
$CourseName = "object-oriented-programming"
$CourseTitle = "CE204 OOP"
$EnvName = "$CourseCode-$CourseName-mkdocs"
$PythonVersion = "3.9"
$WorkspaceDir = Join-Path -Path $PSScriptRoot -ChildPath ".."
$StartingDirectory = $PSScriptRoot  # Baslangic dizinini kaydet
$MaxRetryCount = 3  # Conda islemleri icin maksimum yeniden deneme sayisi
$CondaEnvYamlPath = Join-Path -Path $WorkspaceDir -ChildPath "conda_env.yml"  # Ana dizindeki conda_env.yml dosyasi
$RequirementsPath = Join-Path -Path $WorkspaceDir -ChildPath "requirements.txt"  # Ana dizindeki requirements.txt dosyasi

# Markdown donusturucu icin gereken temel paketler
$MarkdownConverterPackages = @("psutil", "tqdm")

# Renkli cikti fonksiyonlari
function Write-Info {
    param([string]$Message)
    Write-Host "[i] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[HATA] $Message" -ForegroundColor Red
}

# Conda ortam varligini kontrol et
function Test-CondaEnvExists {
    param([string]$EnvName)
    
    $EnvList = & conda env list --json | ConvertFrom-Json
    foreach ($env in $EnvList.envs) {
        $envBaseName = Split-Path $env -Leaf
        if ($envBaseName -eq $EnvName) {
            return $true
        }
    }
    return $false
}

# requirements.txt ve conda_env.yml dosyalarindan paket listesini oku
function Get-RequiredPackages {
    $importantPackages = @()
    
    # Markdown donusturucu paketleri her zaman onemli
    $importantPackages += $MarkdownConverterPackages
    
    # requirements.txt dosyasindan paket isimlerini oku
    if (Test-Path -Path $RequirementsPath) {
        Write-Info "requirements.txt dosyasindan paket listesi okunuyor..."
        $reqContent = Get-Content -Path $RequirementsPath
        $reqPackageCount = 0
        
        foreach ($line in $reqContent) {
            # Yorum satirlarini ve bos satirlari atla
            if ($line -match "^\s*#" -or $line -match "^\s*$") {
                continue
            }
            
            # Paket ismini al (surum bilgisini cikar)
            if ($line -match "^([a-zA-Z0-9_\-]+)") {
                $packageName = $Matches[1]
                if (-not ($importantPackages -contains $packageName)) {
                    $importantPackages += $packageName
                    $reqPackageCount++
                }
            }
        }
        Write-Info "  requirements.txt'den $reqPackageCount paket eklendi."
    } else {
        Write-Warning "  requirements.txt dosyasi bulunamadi: $RequirementsPath"
    }
    
    # conda_env.yml dosyasindan paket isimlerini oku
    $yamlPackageCount = 0
    if (Test-Path -Path $CondaEnvYamlPath) {
        Write-Info "conda_env.yml dosyasindan paket listesi okunuyor..."
        $yamlContent = Get-Content -Path $CondaEnvYamlPath
        $inPipSection = $false
        $inDependenciesSection = $false
        
        foreach ($line in $yamlContent) {
            # dependencies: bolumunu bul
            if ($line -match "^\s*dependencies:") {
                $inDependenciesSection = $true
                continue
            }
            
            # dependencies bolumunde normal conda paketlerini isle
            if ($inDependenciesSection -and -not $inPipSection -and $line -match "^\s*-\s*([a-zA-Z0-9_\-]+)") {
                $packageName = $Matches[1]
                # python paketini atla (zaten conda ortaminda var)
                if ($packageName -ne "python" -and -not ($importantPackages -contains $packageName)) {
                    $importantPackages += $packageName
                    $yamlPackageCount++
                }
                continue
            }
            
            # pip: bolumunu bul
            if ($inDependenciesSection -and $line -match "^\s*-\s*pip:") {
                $inPipSection = $true
                continue
            }
            
            # pip bolumundeyken paketleri isle
            if ($inPipSection -and $line -match "^\s*-\s*([a-zA-Z0-9_\-]+)") {
                $packageName = $Matches[1]
                if (-not ($importantPackages -contains $packageName)) {
                    $importantPackages += $packageName
                    $yamlPackageCount++
                }
                continue
            }
            
            # Baska bir ana bolume gectiyse dependencies bolumunden cik
            if ($inDependenciesSection -and $line -match "^[a-zA-Z]" -and -not ($line -match "^\s*-")) {
                $inDependenciesSection = $false
                $inPipSection = $false
            }
        }
        Write-Info "  conda_env.yml'den $yamlPackageCount paket eklendi."
    } else {
        Write-Warning "  conda_env.yml dosyasi bulunamadi: $CondaEnvYamlPath"
    }
    
    # Toplam paket sayisini goster
    $totalMarkdownPackages = $MarkdownConverterPackages.Count
    $totalImportantPackages = $importantPackages.Count
    $totalAddedPackages = $totalImportantPackages - $totalMarkdownPackages
    
    Write-Info "  Toplam $totalImportantPackages onemli paket bulundu ($totalMarkdownPackages temel + $totalAddedPackages ek paket)"
    return $importantPackages
}

# Ortam bilgilerini gosterme fonksiyonu
function Show-EnvironmentStatus {
    param([string]$EnvName)
    
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host "              CONDA ORTAM DURUM RAPORU" -ForegroundColor Cyan
    Write-Host "========================================================" -ForegroundColor Cyan
    
    # Conda varligini kontrol et
    try {
        $CondaVersion = (& conda --version 2>&1)
        Write-Success "Conda Kurulumu: MEVCUT - $CondaVersion"
    }
    catch {
        Write-Error "Conda Kurulumu: YOK"
    }
    
    # Aktif ortami kontrol et
    $CurrentEnv = (& conda info --envs | Select-String "\*") -replace "^.*\* ", ""
    Write-Info "Aktif Conda Ortami: $CurrentEnv"
    
    # Hedef ortami kontrol et
    $EnvExists = Test-CondaEnvExists -EnvName $EnvName
    if ($EnvExists) {
        Write-Success "Hedef Ortam ($EnvName): KURULU"
        
        # requirements.txt ve conda_env.yml dosyalarindan onemli paketleri oku
        $importantPackages = Get-RequiredPackages
        
        # Ortam paketlerini listele
        Write-Info "Yuklu Paketler:"
        $packageList = & conda list -n $EnvName
        
        # Paket basliklarini goster
        $headerLines = $packageList | Where-Object { $_ -match "^#" }
        $headerLines | ForEach-Object { Write-Host $_ }
        
        # Paket iceriklerini goster ve onemli paketleri renklendir
        $contentLines = $packageList | Where-Object { $_ -notmatch "^#" }
        foreach ($line in $contentLines) {
            $isImportantPackage = $false
            
            # Satirin bir onemli paket icerip icermedigini kontrol et
            foreach ($importantPackage in $importantPackages) {
                if ($line -match "^$importantPackage\s+") {
                    $isImportantPackage = $true
                    break
                }
            }
            
            # Eger onemli paketse yesil renkle goster, degilse normal goster
            if ($isImportantPackage) {
                Write-Host $line -ForegroundColor Green
            } else {
                Write-Host $line
            }
        }
        
        # Markdown converter scripti icin gerekli paketleri kontrol et
        Write-Host ""
        Write-Host "========================================================" -ForegroundColor Cyan
        Write-Host "      MARKDOWN CONVERTER ICIN GEREKLI PAKETLER" -ForegroundColor Cyan  
        Write-Host "========================================================" -ForegroundColor Cyan
        
        # Gerekli paketlerin listesi - artik statik degil, dinamik olarak aliniyor
        $requiredPackages = @()
        foreach ($package in $MarkdownConverterPackages) {
            $requiredPackages += @{
                Name = $package
                Description = if ($package -eq "psutil") {
                    "Islemci ve bellek kullanimini izlemek icin gerekli"
                } elseif ($package -eq "tqdm") {
                    "Ilerleme cubugu gosterimi icin gerekli"
                } else {
                    "Markdown donusturme islemleri icin gerekli"
                }
            }
        }
        
        $installedCount = 0
        $missingCount = 0
        $missingPackagesList = @()
        
        foreach ($package in $requiredPackages) {
            $packageInfo = $packageList | Select-String "^$($package.Name)\s+"
            if ($packageInfo) {
                $version = ($packageInfo -split "\s+")[1]
                Write-Success "$($package.Name) : KURULU (v$version) - $($package.Description)"
                $installedCount++
            } else {
                Write-Error "$($package.Name) : EKSIK - $($package.Description)"
                Write-Host "  Yuklemek icin: conda activate $EnvName && pip install $($package.Name)" -ForegroundColor Yellow
                $missingCount++
                $missingPackagesList += $package.Name
            }
        }
        
        # Ozet rapor goster
        Write-Host ""
        Write-Host "Markdown Converter Paket Ozeti:" -ForegroundColor Cyan
        Write-Host "  Toplam Gerekli Paket: $($requiredPackages.Count)" -ForegroundColor White
        Write-Host "  Yuklu Paketler     : $installedCount" -ForegroundColor $(if ($installedCount -eq $requiredPackages.Count) { "Green" } else { "Yellow" })
        Write-Host "  Eksik Paketler     : $missingCount" -ForegroundColor $(if ($missingCount -gt 0) { "Red" } else { "Green" })
        
        if ($missingCount -gt 0) {
            Write-Host "  Eksik paketleri yuklemek icin: .\setup.ps1 -Skip" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "  Eksik Paketler:" -ForegroundColor Red
            foreach ($missingPkg in $missingPackagesList) {
                Write-Host "    - $missingPkg" -ForegroundColor Red
            }
        } else {
            Write-Host ""
            Write-Success "  DURUM: Tum gerekli markdown converter paketleri kurulu."
        }
        
        # Genel durumu uzetle
        Write-Host ""
        Write-Host "========================================================" -ForegroundColor Cyan
        Write-Host "                GENEL ORTAM DURUMU" -ForegroundColor Cyan
        Write-Host "========================================================" -ForegroundColor Cyan
        
        if ($missingCount -gt 0) {
            Write-Warning "Ortamda eksik paketler bulunmaktadir. Yuklemek icin .\setup.ps1 -Skip komutunu kullanabilirsiniz."
        } else {
            Write-Success "Tum gerekli paketler kurulu - Ortam kullanima hazir."
            Write-Info "MkDocs islemleri icin ortami aktif hale getirin: conda activate $EnvName"
        }
    }
    else {
        Write-Warning "Hedef Ortam ($EnvName): KURULU DEGIL"
    }
    
    # conda_env.yml dosyasini kontrol et
    if (Test-Path -Path $CondaEnvYamlPath) {
        Write-Success "conda_env.yml Dosyasi: MEVCUT - $CondaEnvYamlPath" 
    }
    else {
        Write-Error "conda_env.yml Dosyasi: BULUNAMADI"
    }
}

# Bu fonksiyon, Conda ortami kurulumu veya kaldirma islemleri sirasinda olusturulan
# gecici dosyalari (condaenv.*.requirements.txt, conda-meta.*.json.tar.bz2, .conda_lock*) temizler.
# Normal kosullarda Conda bu dosyalari otomatik olarak temizler, ancak islem kesintiye
# ugrarsa veya hata olusursa bu dosyalar calisma dizininde kalabilir.
# Gecici conda dosyalarini temizle
function Clean-CondaTemporaryFiles {
    param([string]$WorkingDirectory)
    
    # Temizlenecek gecici dosya kaliplari
    $patterns = @(
        "condaenv.*.requirements.txt",
        "conda-meta.*.json.tar.bz2",
        ".conda_lock*",
        "conda-tmp-*"
    )
    
    Write-Info "Conda gecici dosyalari kontrol ediliyor..."
    $foundFiles = $false
    
    foreach ($pattern in $patterns) {
        $tempFiles = Get-ChildItem -Path $WorkingDirectory -Filter $pattern -File -ErrorAction SilentlyContinue
        
        if ($tempFiles -and $tempFiles.Count -gt 0) {
            $foundFiles = $true
            Write-Info "  '$pattern' kalibina uyan gecici dosyalar temizleniyor..."
            
            foreach ($file in $tempFiles) {
                try {
                    Remove-Item -Path $file.FullName -Force
                    Write-Success "    Gecici dosya silindi: $($file.Name)"
                }
                catch {
                    Write-Warning "    Gecici dosya silinemedi: $($file.Name) - $($_.Exception.Message)"
                }
            }
        }
    }
    
    if (-not $foundFiles) {
        Write-Info "  Temizlenecek gecici dosya bulunamadi."
    }
}

# Yeni bir pip install komutunu verbose modda calistirma
function Install-PipPackagesVerbose {
    param(
        [string[]]$Packages,
        [string]$EnvName
    )
    
    Write-Host ""
    Write-Host "=== Pip Paket Kurulumu Basliyor ===" -ForegroundColor Yellow
    Write-Host ""
    
    # Python yorumlayici yolunu al
    $pythonPath = & conda run -n $EnvName which python 2>$null
    if (-not $pythonPath) {
        $pythonPath = "python"  # Fallback to default if conda which doesn't work
    }
    
    foreach ($package in $Packages) {
        Write-Host "Kuruluyor: $package..." -ForegroundColor Cyan
        & conda run -n $EnvName pip install -v $package
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "  $package basariyla kuruldu."
        } else {
            Write-Error "  $package kurulumu basarisiz oldu!"
        }
    }
    
    Write-Host ""
    Write-Host "=== Pip Paket Kurulumu Tamamlandi ===" -ForegroundColor Yellow
    Write-Host ""
}

# Ana kod buradan baslar

# Baslik ve banner
Clear-Host
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "           $CourseTitle - MkDocs Ortam Kurulumu" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Eger sadece durum sorgulaniyorsa, durumu goster ve cik
if ($Status) {
    Write-Info "Ortam durumu goruntuleniyor..."
    Show-EnvironmentStatus -EnvName $EnvName
    Read-Host "Devam etmek icin bir tusa basin..."
    exit 0
}

# Script baslangicinda gecici dosyalari temizle
Clean-CondaTemporaryFiles -WorkingDirectory $PSScriptRoot
Write-Info "Script calismaya basladi."

# Calisma dizini kontrolu
Write-Info "Mevcut dizin: $PSScriptRoot"
try {
    $WorkspaceFullPath = Resolve-Path -Path $WorkspaceDir -ErrorAction Stop
    Set-Location $WorkspaceFullPath
    Write-Info "Calisma dizini: $WorkspaceFullPath"
}
catch {
    Write-Error "Calisma dizini ($WorkspaceDir) bulunamadi veya erisilemedi."
    Read-Host "Devam etmek icin bir tusa basin..."
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    exit 1
}
Write-Host ""

# conda_env.yml dosyasinin varligini kontrol et
if (-not (Test-Path -Path $CondaEnvYamlPath)) {
    Write-Error "conda_env.yml dosyasi bulunamadi: $CondaEnvYamlPath"
    Write-Info "conda_env.yml dosyasi ana dizinde (mkdocs.yml ile ayni yerde) olmalidir."
    
    # requirements.txt de varsa bilgi ver
    if (Test-Path -Path $RequirementsPath) {
        Write-Info "requirements.txt dosyasi bulundu, ancak bu script conda_env.yml dosyasini kullanacak sekilde tasarlanmistir."
        Write-Info "Lutfen conda_env.yml dosyasini olusturun ve tekrar deneyin."
    }
    
    Read-Host "Cikmak icin bir tusa basin..."
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    exit 1
}
Write-Success "conda_env.yml dosyasi bulundu: $CondaEnvYamlPath"
Write-Host ""

# Conda kontrolu
Write-Info "Conda kontrolu yapiliyor..."
try {
    $CondaVersion = (& conda --version 2>&1)
    if ($LASTEXITCODE -ne 0) { throw "Conda komutu calistirilamadi" }
    Write-Success "Conda bulundu: $CondaVersion"
}
catch {
    Write-Error "Conda bulunamadi. Lutfen Anaconda veya Miniconda yukleyin."
    Read-Host "Devam etmek icin bir tusa basin..."
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    exit 1
}
Write-Host ""

# Aktif ortami kontrol et
Write-Info "Aktif ortam kontrolu yapiliyor..."
$CurrentEnv = (& conda info --envs | Select-String "\*") -replace "^.*\* ", ""
$IsTargetEnvActive = $CurrentEnv -like "*$EnvName*"

# Eger ortam aktifse, isleme devam edemeyiz
if ($IsTargetEnvActive) {
    Write-Error "ISLEM DURDURULDU: '$EnvName' ortami su anda aktif durumda."
    Write-Error "Conda ortami aktifken islem yapilamaz."
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Yellow
    Write-Host "               LUTFEN SU ADIMLARI IZLEYIN               " -ForegroundColor Yellow  
    Write-Host "========================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Bu PowerShell penceresini kapatin" -ForegroundColor Yellow
    Write-Host "2. Yeni bir PowerShell penceresi acin" -ForegroundColor Yellow
    Write-Host "3. Asagidaki komutu calistirarak ortami deaktiflestirin:" -ForegroundColor Yellow
    Write-Host "   conda deactivate" -ForegroundColor White -BackgroundColor DarkRed
    Write-Host ""
    Write-Host "4. Ardindan setup.ps1 scriptini tekrar calistirin:" -ForegroundColor Yellow
    Write-Host "   cd $StartingDirectory" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host "   .\setup.ps1" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host ""
    Write-Warning "UYARI: PowerShell'de 'conda deactivate' komutunu calistirdiktan sonra,"
    Write-Warning "       scripti ayni pencerede calistirmayi denemeyin. Bu ise yaramaz!"
    Write-Warning "       Mutlaka PowerShell penceresini TAMAMEN KAPATIN ve yenisini acin."
    Write-Host ""
    
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    Read-Host "Cikmak icin bir tusa basin..."
    exit 1
}

# Mevcut ortami kontrol et
Write-Info "Mevcut ortam kontrolu yapiliyor..."
$EnvExists = Test-CondaEnvExists -EnvName $EnvName

# Ortam varsa ve --skip parametresi kullanilmissa, kurulumu atla
if ($EnvExists -and $Skip) {
    Write-Success "'$EnvName' ortami mevcut ve --skip parametresi kullanildi. Kurulum atlaniyor."
    
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    Write-Info "Script dizinine geri donuldu: $StartingDirectory"
    
    Write-Host ""
    Write-Info "Ortami aktiflestirmek icin:"
    Write-Host "    conda activate $EnvName" -ForegroundColor White -BackgroundColor DarkGreen
    
    Read-Host "Devam etmek icin bir tusa basin..."
    exit 0
}

# Ortam varsa kaldir
if ($EnvExists) {
    Write-Warning "'$EnvName' ortami mevcut, kaldiriliyor..."
    
    # Guvenli kaldirma surecini baslat
    $RemoveSuccess = $false
    $RetryCount = 0
    
    while (-not $RemoveSuccess -and $RetryCount -lt $MaxRetryCount) {
        $RetryCount++
        
        try {
            Write-Info "Ortami kaldirma denemesi ($RetryCount/$MaxRetryCount)..."
            
            # Verbose flag (-v) ekleyerek ve ciktilari dogrudan gostererek komut calistir
            Write-Host ""
            Write-Host "=== Conda Ortam Kaldirma Ciktisi Basliyor ===" -ForegroundColor Yellow
            Write-Host ""
            
            # Komutu ciktilari direkt olarak gosterecek sekilde calistir
            & conda env remove -n $EnvName -y -v
            $LastExitCode = $LASTEXITCODE
            
            Write-Host ""
            Write-Host "=== Conda Ortam Kaldirma Ciktisi Bitti ===" -ForegroundColor Yellow
            Write-Host ""
            
            # Hata mesajlarini kontrol et
            if ($LastExitCode -eq 0) {
                Write-Success "Eski ortam basariyla kaldirildi."
                $RemoveSuccess = $true
                # Environment kaldirildiktan sonra gecici dosyalari temizle
                Clean-CondaTemporaryFiles -WorkingDirectory $PSScriptRoot
            } else {
                # Hata koduna gore fakli mesajlar goster
                $RemoveOutput = & conda env remove -n $EnvName -y --json 2>&1 | Out-String
                
                if ($RemoveOutput -match "EnvironmentLocationNotFound" -or $RemoveOutput -match "Not a conda environment") {
                    Write-Warning "Ortam listede gorunuyor ancak fiziksel konum bulunamadi."
                    Write-Info "Conda indeksi duzeltiliyor..."
                    $RemoveSuccess = $true
                } 
                elseif ($RemoveOutput -match "Cannot remove current environment") {
                    # Bu durumla karsilasirsa, ortam hala aktif demektir
                    Write-Error "ISLEM DURDURULDU: Ortam hala aktif gorunuyor."
                    
                    Write-Host ""
                    Write-Host "========================================================" -ForegroundColor Yellow
                    Write-Host "                LUTFEN YENIDEN DENEYIN                 " -ForegroundColor Yellow  
                    Write-Host "========================================================" -ForegroundColor Yellow
                    Write-Host ""
                    Write-Host "1. PowerShell penceresini kapatin" -ForegroundColor Yellow
                    Write-Host "2. Yeni bir PowerShell acin" -ForegroundColor Yellow
                    Write-Host "3. 'conda deactivate' komutunu calistirin" -ForegroundColor Yellow
                    Write-Host "4. Tekrar setup.ps1 scriptini calistirin" -ForegroundColor Yellow
                    
                    # Baslangic dizinine don
                    Set-Location $StartingDirectory
                    Read-Host "Cikmak icin bir tusa basin..."
                    exit 1
                }
                else {
                    Write-Warning "Eski ortam kaldirilirken bir hata olustu ($RetryCount/$MaxRetryCount). Ciktilari yukarida gorebilirsiniz."
                }
            }
        }
        catch {
            Write-Warning "Eski ortam kaldirilirken bir hata olustu ($RetryCount/$MaxRetryCount): $_"
        }
        
        # Basarisizsa, kisa bir sure bekleyip tekrar dene
        if (-not $RemoveSuccess -and $RetryCount -lt $MaxRetryCount) {
            Write-Info "Yeniden deneme oncesi bekleniyor (3 saniye)..."
            Start-Sleep -Seconds 3
        }
    }
    
    # Tum denemeler basarisiz olduysa, kullaniciya manuel kaldirma talimati ver
    if (-not $RemoveSuccess) {
        Write-Warning "Ortam otomatik olarak kaldirilamadi."
        Write-Error "ISLEM DURDURULDU: Ortami manuel olarak kaldirmaniz gerekiyor."
        
        Write-Host ""
        Write-Host "========================================================" -ForegroundColor Yellow
        Write-Host "                LUTFEN SU ADIMLARI IZLEYIN                 " -ForegroundColor Yellow  
        Write-Host "========================================================" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Bu PowerShell penceresini kapatin" -ForegroundColor Yellow
        Write-Host "2. Yeni bir PowerShell acin" -ForegroundColor Yellow
        Write-Host "3. Asagidaki komutu calistirin:" -ForegroundColor Yellow
        Write-Host "   conda env remove -n $EnvName -y" -ForegroundColor White -BackgroundColor DarkRed
        Write-Host "4. Tekrar setup.ps1 scriptini calistirin:" -ForegroundColor Yellow
        Write-Host "   cd $StartingDirectory" -ForegroundColor White -BackgroundColor DarkBlue
        Write-Host "   .\setup.ps1" -ForegroundColor White -BackgroundColor DarkBlue
        
        # Baslangic dizinine don
        Set-Location $StartingDirectory
        Read-Host "Cikmak icin bir tusa basin..."
        exit 1    }
    
    # Her durumda conda indeksini temizle
    Write-Info "Conda indeksi temizleniyor..."
    Write-Host ""
    Write-Host "=== Conda Indeks Temizleme Ciktisi Basliyor ===" -ForegroundColor Yellow
    Write-Host ""
    & conda clean --index-cache --yes -v
    Write-Host ""
    Write-Host "=== Conda Indeks Temizleme Ciktisi Bitti ===" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Info "'$EnvName' ortami bulunamadi. Yeni ortam olusturulacak."
}

# Eger --remove parametresi verilmisse, sadece kaldir ve cik
if ($Remove) {
    Write-Success "Conda ortami basariyla kaldirildi. (--remove parametresi kullanildi)"
    
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    Write-Info "Script dizinine geri donuldu: $StartingDirectory"
    
    Read-Host "Devam etmek icin bir tusa basin..."
    exit 0
}

# Markdown converter icin gerekli paketleri kontrol et ve eksik olanlari yukle
function Ensure-MarkdownConverterPackages {
    param([string]$EnvName)
    
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host "     MARKDOWN CONVERTER PAKET KONTROLU" -ForegroundColor Cyan  
    Write-Host "========================================================" -ForegroundColor Cyan
    
    # Ortam paketlerini al
    $packageList = & conda list -n $EnvName
    
    # Markdown converter icin gerekli paketler - global degiskeni kullan
    $requiredPackages = $MarkdownConverterPackages
    
    $missingPackages = @()
    $installedPackages = @()
    
    foreach ($package in $requiredPackages) {
        $packageInfo = $packageList | Select-String "^$package\s+"
        if (-not $packageInfo) {
            Write-Warning "$($package) : EKSIK - Markdown converter icin gerekli"
            $missingPackages += $package
        } else {
            $version = ($packageInfo -split "\s+")[1]
            Write-Success "$($package) : KURULU (v$($version))"
            $installedPackages += "$package (v$version)"
        }
    }
    
    # Eksik paketleri yükle
    if ($missingPackages.Count -gt 0) {
        Write-Info "Eksik paketler yukleniyor..."
        Install-PipPackagesVerbose -Packages $missingPackages -EnvName $EnvName
        Write-Success "Markdown converter icin gerekli paketler yuklendi."
        
        # Yükleme sonrası özet
        $packageList = & conda list -n $EnvName
        $stilMissingPackages = @()
        
        foreach ($package in $missingPackages) {
            $packageInfo = $packageList | Select-String "^$package\s+"
            if (-not $packageInfo) {
                $stilMissingPackages += $package
            } else {
                $version = ($packageInfo -split "\s+")[1]
                $installedPackages += "$package (v$version)"
            }
        }
        
        # Yükleme sonrası durum özeti
        Write-Host ""
        Write-Host "Paket Yukleme Ozeti:" -ForegroundColor Cyan
        Write-Host "  Toplam Gerekli Paket: $($requiredPackages.Count)" -ForegroundColor White
        Write-Host "  Basariyla Yuklenenler: $($installedPackages.Count)" -ForegroundColor $(if ($installedPackages.Count -eq $requiredPackages.Count) { "Green" } else { "Yellow" })
        Write-Host "  Yuklenemeyenler     : $($stilMissingPackages.Count)" -ForegroundColor $(if ($stilMissingPackages.Count -gt 0) { "Red" } else { "Green" })
        
        if ($stilMissingPackages.Count -gt 0) {
            Write-Warning "Asagidaki paketler yuklenemedi:"
            foreach ($package in $stilMissingPackages) {
                Write-Host "  - $package" -ForegroundColor Red
            }
            Write-Host "  Bu paketleri manuel olarak yuklemek icin: conda activate $EnvName && pip install $($stilMissingPackages -join ' ')" -ForegroundColor Yellow
            
            # Genel durum özeti
            Write-Host ""
            Write-Host "========================================================" -ForegroundColor Cyan
            Write-Host "                GENEL ORTAM DURUMU" -ForegroundColor Cyan
            Write-Host "========================================================" -ForegroundColor Cyan
            Write-Warning "Ortamda hala eksik paketler bulunmaktadir. Yukaridaki komutlarla manuel olarak yuklemeyi deneyin."
        } else {
            # Genel durum özeti
            Write-Host ""
            Write-Host "========================================================" -ForegroundColor Cyan
            Write-Host "                GENEL ORTAM DURUMU" -ForegroundColor Cyan
            Write-Host "========================================================" -ForegroundColor Cyan
            Write-Success "Tum gerekli paketler basariyla yuklendi - Ortam kullanima hazir."
            Write-Info "MkDocs islemleri icin ortami aktif hale getirin: conda activate $EnvName"
        }
    } else {
        Write-Success "Tum gerekli paketler zaten yuklu."
        
        # Özet rapor göster
        Write-Host ""
        Write-Host "Paket Durumu:" -ForegroundColor Cyan
        Write-Host "  Toplam Gerekli Paket: $($requiredPackages.Count)" -ForegroundColor White
        Write-Host "  Yuklu Paketler     : $($installedPackages.Count)" -ForegroundColor Green
        
        Write-Host "  Yuklu paketler:" -ForegroundColor White
        foreach ($package in $installedPackages) {
            Write-Host "  - $package" -ForegroundColor Green
        }
        
        # Genel durum özeti
        Write-Host ""
        Write-Host "========================================================" -ForegroundColor Cyan
        Write-Host "                GENEL ORTAM DURUMU" -ForegroundColor Cyan
        Write-Host "========================================================" -ForegroundColor Cyan
        Write-Success "Tum gerekli paketler zaten kurulu - Ortam kullanima hazir."
        Write-Info "MkDocs islemleri icin ortami aktif hale getirin: conda activate $EnvName"
    }
}

Write-Host ""

# conda_env.yml dosyasindaki ortam adini guncelle
try {
    Write-Info "conda_env.yml dosyasini kontrol ediyorum..."
    
    # YAML icerigini oku
    $YamlContent = Get-Content -Path $CondaEnvYamlPath -Raw
    
    # Ortam adini scriptteki ortam adi ile degistir
    # Not: Basit bir string degistirme, daha saglam bir cozum icin bir YAML parser kullanilabilir
    if ($YamlContent -match "name:") {
        Write-Info "Ortam adi degistiriliyor..."
        $YamlContent = $YamlContent -replace "name:.*", "name: $EnvName"
        
        # Degisikligi dogrudan dosyaya yaz
        Set-Content -Path $CondaEnvYamlPath -Value $YamlContent
        Write-Success "conda_env.yml dosyasi '$EnvName' adiyla guncellendi."
    } else {
        Write-Warning "YAML dosyasinda 'name:' alani bulunamadi. Ortam adi degistirilemedi."
    }
    
    # conda_env.yml dosyasindan dogrudan Conda ortami olustur
    Write-Info "Yeni Conda ortami olusturuluyor: $EnvName"
    Write-Warning "Bu islem zaman alabilir, lutfen bekleyin..."
    $CreateSuccess = $false
    $RetryCount = 0
    
    while (-not $CreateSuccess -and $RetryCount -lt $MaxRetryCount) {
        $RetryCount++
        
        try {
            Write-Info "Ortam olusturma denemesi ($RetryCount/$MaxRetryCount)..."
            
            # Verbose flag (-v) ekleyerek ve ciktilari dogrudan gostererek komut calistir
            Write-Host ""
            Write-Host "=== Conda Kurulum Ciktisi Basliyor ===" -ForegroundColor Yellow
            Write-Host ""
            
            # Komutu ciktilari direkt olarak gosterecek sekilde calistir
            & conda env create -f $CondaEnvYamlPath -v
            $LastExitCode = $LASTEXITCODE
            
            Write-Host ""
            Write-Host "=== Conda Kurulum Ciktisi Bitti ===" -ForegroundColor Yellow
            Write-Host ""
            
            if ($LastExitCode -eq 0) {
                Write-Success "Conda ortami ve gerekli paketler basariyla kuruldu."
                $CreateSuccess = $true
                
                # Markdown converter için gerekli paketleri kontrol et ve eksik olanları yükle
                Write-Info "Markdown converter gereksinimleri kontrol ediliyor..."
                Ensure-MarkdownConverterPackages -EnvName $EnvName
            } else {
                Write-Warning "Conda ortami olusturulurken hata ($RetryCount/$MaxRetryCount). Ciktilari yukarida gorebilirsiniz."
            }
        }
        catch {
            Write-Warning "Conda ortami olusturulurken istisna ($RetryCount/$MaxRetryCount): $_"
        }
        
        # Basarisizsa, kisa bir sure bekleyip tekrar dene
        if (-not $CreateSuccess -and $RetryCount -lt $MaxRetryCount) {
            Write-Info "Yeniden deneme oncesi bekleniyor (3 saniye)..."
            Start-Sleep -Seconds 3
        }
    }
    
    if (-not $CreateSuccess) {
        Write-Error "Conda ortami olusturulamadi. Kurulum basarisiz."
        Read-Host "Cikmak icin bir tusa basin..."
        # Baslangic dizinine don
        Set-Location $StartingDirectory
        exit 1
    }
}
catch {
    Write-Error "conda_env.yml dosyasi islenirken hata: $_"
    Read-Host "Cikmak icin bir tusa basin..."
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    exit 1
}

Write-Host ""

# Ortami aktiflestir (son adim olarak) - sadece bilgi amacli
Write-Info "Kurulum tamamlandi. Ortami simdi aktiflestirmek icin asagidaki komutu kullanabilirsiniz:"
Write-Host "    conda activate $EnvName" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host ""

Write-Success "$CourseTitle MkDocs ortami basariyla kuruldu."
Write-Info "Ortam adi: $EnvName"
Write-Info "Siteyi derlemek ve calistirmak icin 'build.ps1' scriptini kullanabilirsiniz."

# PowerShell'de ortam kontrol et ve bilgi ver
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "          KURULUM SONRASI ONEMLI BILGILER" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Gercek aktif ortami kontrol et
$TestActiveEnv = (& conda info --envs | Select-String "\*") -replace "^.*\* ", ""

Write-Info "Su anda aktif olan Conda ortami: $TestActiveEnv"

if ($TestActiveEnv -like "*$EnvName*") {
    Write-Success "Hedeflenen ortam ($EnvName) basariyla aktiflestirild."
} else {
    Write-Info "Kurulum tamamlandi ancak '$EnvName' ortami su anda aktif degil."
    Write-Host ""
    Write-Info "Ortami aktiflestirmek icin:"
    Write-Host "    conda activate $EnvName" -ForegroundColor White -BackgroundColor DarkGreen
    Write-Host ""
    Write-Warning "ONEMLI: Ortam aktiflestirmeden dogrudan MkDocs komutlari calistirilamaz."
    Write-Host "    Eger build.ps1 veya deploy.ps1 scriptlerini calistiracaksaniz, once ortami aktiflestirin." -ForegroundColor Yellow
    Write-Host ""
    Write-Info "Alternatif olarak conda run kullanabilirsiniz:"
    Write-Host "    conda run -n $EnvName mkdocs build" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host "    conda run -n $EnvName mkdocs serve" -ForegroundColor White -BackgroundColor DarkBlue
}

Write-Host ""
Write-Info "Kurulum basariyla tamamlandi. Butun gerekli paketler $EnvName ortamina yuklendi."

# Gecici conda dosyalarini temizle
Clean-CondaTemporaryFiles -WorkingDirectory $WorkspaceFullPath

# Islem ozeti
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "                      ISLEM OZETI" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

if ($Remove) {
    Write-Success "Conda ortami ($envName) basariyla kaldirildi."
    Write-Info "  Yeni bir kurulum baslatmak icin, ayni scripti parametresiz calistirin."
} elseif ($Skip -and (Test-CondaEnvExists -EnvName $envName)) {
    Write-Success "Mevcut Conda ortami ($envName) korundu ve kullanilmaya hazir."
    Write-Info "  Mevcut ortami kullanmak icin asagidaki komutu calistirin:"
    Write-Host "    conda activate $envName" -ForegroundColor Yellow
} else {
    Write-Success "MkDocs kurulumu basariyla tamamlandi."
    Write-Info "  Yuklenen ortami kullanmak icin asagidaki komutu calistirin:"
    Write-Host "    conda activate $envName" -ForegroundColor Yellow
    Write-Info "  MkDocs sunucusunu baslatmak icin asagidaki komutu calistirin:"
    Write-Host "    mkdocs serve" -ForegroundColor Yellow
}

# Kullanilabilir parametreleri goster
Write-Host ""
Write-Host "PARAMETRELER:" -ForegroundColor Cyan
Write-Host "  --remove : Sadece mevcut ortami kaldirir." -ForegroundColor Gray
Write-Host "  --status : Mevcut ortam durumunu gosterir." -ForegroundColor Gray
Write-Host "  --skip   : Mevcut ortami korur, varsa kullanir." -ForegroundColor Gray
Write-Host "  (parametresiz) : Temiz kurulum yapar." -ForegroundColor Gray
Write-Host ""

# Baslangic dizinine geri don
Set-Location $StartingDirectory
Write-Info "Script dizinine geri donuldu: $StartingDirectory"

# Komut satiri yardimini goster
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "                KULLANIM TALIMATLARI" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Bu script su parametrelerle kullanilabilir:" -ForegroundColor White
Write-Host ""
Write-Host "  Parametresiz: Mevcut ortami kaldirip yeniden kurar" -ForegroundColor White
Write-Host "      .\setup.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "  --remove: Sadece mevcut ortami kaldirir" -ForegroundColor White
Write-Host "      .\setup.ps1 -Remove" -ForegroundColor Yellow
Write-Host ""
Write-Host "  --status: Ortam durumunu gosterir" -ForegroundColor White
Write-Host "      .\setup.ps1 -Status" -ForegroundColor Yellow
Write-Host ""
Write-Host "  --skip: Mevcut ortami korur, varsa kullanir" -ForegroundColor White
Write-Host "      .\setup.ps1 -Skip" -ForegroundColor Yellow
Write-Host ""

# Skip senaryosu için paket kontrolü
if ($Skip -and (Test-CondaEnvExists -EnvName $EnvName) -and (-not $Remove)) {
    Write-Info "Markdown converter gereksinimleri kontrol ediliyor (skip modu)..."
    Ensure-MarkdownConverterPackages -EnvName $EnvName
}

Read-Host "Devam etmek icin bir tusa basin..." 
