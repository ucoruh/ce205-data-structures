# PowerShell Script: MkDocs Site Derleme ve Calistirma
# CE204 OOP MkDocs Sitesi Derleme ve Calistirma Scripti

# ========== AYARLAR ==========
$CourseCode = "ce204"
$CourseName = "object-oriented-programming"
$CourseTitle = "CE204 OOP"
$EnvName = "$CourseCode-$CourseName-mkdocs"
$WorkspaceDir = Join-Path -Path $PSScriptRoot -ChildPath ".."
$StartingDirectory = $PSScriptRoot  # Baslangic dizinini kaydet

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

# Baslik ve banner
Clear-Host
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "     $CourseTitle - MkDocs Site Derleme ve Calistirma" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

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

# Secenek menusu goster
Write-Info "Ne yapmak istiyorsunuz?"
Write-Host "1. Siteyi derle"
Write-Host "2. Siteyi derle ve lokalde calistir"
Write-Host "3. Cikis"
Write-Host ""

$choice = Read-Host "Seciminiz (1-3)"

if ($choice -eq "3") {
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    exit 0
}

# mkdocs.yml dosyasindan site dizinini al
Write-Info "mkdocs.yml dosyasindan site dizini aliniyor..."
try {
    $MkDocsConfig = Get-Content -Path "mkdocs.yml" -Raw | ConvertFrom-Yaml
    $SiteDir = $MkDocsConfig.site_dir
    if (-not $SiteDir) {
        $SiteDir = "site" # Varsayilan deger
    }
    Write-Info "Site dizini: $SiteDir"
}
catch {
    Write-Warning "mkdocs.yml dosyasi okunamadi veya site_dir bulunamadi. Varsayilan 'site' dizini kullanilacak."
    $SiteDir = "site"
}

# Site klasorunu temizle
if (Test-Path -Path $SiteDir) {
    Write-Info "Site klasoru temizleniyor: $SiteDir"
    try {
        Remove-Item -Path $SiteDir -Recurse -Force
        Write-Success "Site klasoru basariyla temizlendi."
    }
    catch {
        Write-Warning "Site klasoru temizlenirken hata olustu: $_"
        Write-Info "Derleme islemi devam edecek..."
    }
}
else {
    Write-Info "Site klasoru henuz mevcut degil, yeni olusturulacak."
}
Write-Host ""

# Siteyi Derle
Write-Info "Site derleniyor..."
Write-Host "========== DERLEME LOGLARI BASLANGIC ==========" -ForegroundColor Yellow

# Dogrudan mkdocs komutunu calistir (conda ortami zaten aktif oldugu icin)
mkdocs build #--verbose
$buildResult = $LASTEXITCODE

Write-Host "========== DERLEME LOGLARI BITIS ==========" -ForegroundColor Yellow
if ($buildResult -ne 0) {
    Write-Error "Site derlenirken hata olustu. Yukaridaki loglari kontrol edin."
    Read-Host "Devam etmek icin bir tusa basin..."
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    exit 1
}

Write-Success "Site basariyla derlendi."
Write-Host ""

# Eger kullanici sadece derleme istiyorsa, burada cik
if ($choice -eq "1") {
    Write-Info "Ciktilar '$SiteDir' klasorunde bulunabilir."
    Read-Host "Devam etmek icin bir tusa basin..."
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    exit 0
}

# IP Adresini al
$IPAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -match 'Ethernet|Wi-Fi' -and $_.IPAddress -notmatch '^169' } | Select-Object -First 1).IPAddress

# Siteyi baslat
Write-Info "Site lokalde baslatiliyor..."
Write-Info "URL: http://127.0.0.1:8000/ veya http://$IPAddress`:8000/"
Write-Info "Cikmak icin CTRL+C tuslarina basin."
Write-Warning "Not: MkDocs Serve islemi tamamlandiginda otomatik olarak script dizinine donus yapilacaktir."

# Port kontrolu
$PortInUse = (Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0

if ($PortInUse) {
    Write-Warning "8000 portu zaten kullaniliyor. Alternatif port kullanilacak."
    mkdocs serve -a 127.0.0.1:8080
}
else {
    mkdocs serve
}

# MkDocs serve islemi tamamlandiginda buraya geri donecek
# Baslangic dizinine don
Set-Location $StartingDirectory
Write-Info "Islem tamamlandi. Script dizinine geri donuldu: $StartingDirectory"
exit 0 