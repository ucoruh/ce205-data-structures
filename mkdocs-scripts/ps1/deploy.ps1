# PowerShell Script: MkDocs GitHub Pages Yayinlama
# CE204 OOP MkDocs Sitesi GitHub Pages Yayinlama Scripti

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
Write-Host "   $CourseTitle - MkDocs GitHub Pages Yayinlama" -ForegroundColor Cyan
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

# Git kontrolu
Write-Info "Git kontrolu yapiliyor..."
try {
    $GitVersion = (& git --version 2>&1)
    if ($LASTEXITCODE -ne 0) { throw "Git komutu calistirilamadi" }
    Write-Success "Git bulundu: $GitVersion"
}
catch {
    Write-Error "Git bulunamadi. Lutfen Git'i yukleyin."
    Read-Host "Devam etmek icin bir tusa basin..."
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    exit 1
}
Write-Host ""

# Git repo kontrolu
try {
    $IsGitRepo = (& git rev-parse --is-inside-work-tree 2>&1)
    if ($LASTEXITCODE -ne 0) { throw "Git repo kontrolu yapilamadi" }
    Write-Success "Git reposu dogrulandi."
}
catch {
    Write-Error "Bu dizin bir Git reposu degil."
    Read-Host "Devam etmek icin bir tusa basin..."
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    exit 1
}
Write-Host ""

# Siteyi derle
Write-Info "Site derleniyor..."
Write-Host "========== DERLEME LOGLARI BASLANGIC ==========" -ForegroundColor Yellow
mkdocs build --verbose
$buildResult = $LASTEXITCODE
Write-Host "========== DERLEME LOGLARI BITIS ==========" -ForegroundColor Yellow

if ($buildResult -ne 0) {
    Write-Error "Site derlenirken hata olustu."
    Read-Host "Devam etmek icin bir tusa basin..."
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    exit 1
}
Write-Success "Site basariyla derlendi."
Write-Host ""

# Yayinlanmadan once kullaniciya sor
Write-Warning "GitHub Pages'e yayinlamak istediginize emin misiniz? (E/H)"
$confirmation = Read-Host
if ($confirmation -ne "E" -and $confirmation -ne "e") {
    Write-Info "Yayinlama islemi iptal edildi."
    Read-Host "Devam etmek icin bir tusa basin..."
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    exit 0
}

# Yayinla
Write-Info "Site GitHub Pages'e yayinlaniyor..."
Write-Host "========== YAYINLAMA LOGLARI BASLANGIC ==========" -ForegroundColor Yellow
mkdocs gh-deploy --force --verbose
$deployResult = $LASTEXITCODE
Write-Host "========== YAYINLAMA LOGLARI BITIS ==========" -ForegroundColor Yellow

if ($deployResult -ne 0) {
    Write-Error "Yayinlama sirasinda bir hata olustu."
    Read-Host "Devam etmek icin bir tusa basin..."
    # Baslangic dizinine don
    Set-Location $StartingDirectory
    exit 1
}

Write-Host ""
Write-Success "$CourseTitle MkDocs sitesi basariyla GitHub Pages'e yayinlandi."

# Site URL'sini al ve goster
if (Test-Path -Path "mkdocs.yml") {
    $mkdocsContent = Get-Content -Path "mkdocs.yml" -Raw
    if ($mkdocsContent -match "site_url:\s*([^\r\n]+)") {
        $siteUrl = $matches[1].Trim("'").Trim('"').Trim()
        Write-Info "Site URL: $siteUrl"
        
        # Tarayicida acmak icin sor
        Write-Info "Site tarayicida acilsin mi? (E/H)"
        $openBrowser = Read-Host
        if ($openBrowser -eq "E" -or $openBrowser -eq "e") {
            Start-Process $siteUrl
        }
    }
}

# Baslangic dizinine geri don
Set-Location $StartingDirectory
Write-Info "Script dizinine geri donuldu: $StartingDirectory"

Read-Host "Devam etmek icin bir tusa basin..." 