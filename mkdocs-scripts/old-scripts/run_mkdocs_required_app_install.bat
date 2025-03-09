@echo off
setlocal enableextensions

REM Step 1: Get the current directory and store it in a variable
echo Get the current directory
set "currentDir=%CD%"

REM Step 2: Change the current working directory to the script directory
echo Change the current working directory to the script directory
cd /d "%~dp0"

REM Step 3: Move up one directory (to the parent folder)
echo Change the working directory to the parent folder
cd ..

REM Step 4: Install Chocolatey and necessary packages
echo Installing Chocolatey...
Powershell.exe Set-ExecutionPolicy Bypass -Scope Process -Force; `
    [System.Net.ServicePointManager]::SecurityProtocol = `
    [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

echo Installing Pandoc, rsvg-convert, Python, and MiKTeX via Chocolatey...
Powershell.exe choco install pandoc
Powershell.exe choco install rsvg-convert
Powershell.exe choco install python
Powershell.exe choco install miktex

REM Step 5: Install Scoop and necessary packages
echo Installing Scoop...
Powershell.exe Invoke-Expression (New-Object System.Net.WebClient).DownloadString('https://get.scoop.sh')
Powershell.exe Set-ExecutionPolicy RemoteSigned -scope CurrentUser
echo Installing curl and Marp via Scoop...
Powershell.exe scoop install curl
Powershell.exe scoop install marp

REM Step 6: Install Python packages via pip
echo Installing Python packages via pip...
pip install mkdocs
pip install pymdown-extensions
pip install mkdocs-material
pip install mkdocs-material-extensions
pip install mkdocs-simple-hooks
pip install mkdocs-video
pip install mkdocs-minify-plugin
pip install mkdocs-git-revision-date-localized-plugin
pip install mkdocs-minify-plugin
pip install mkdocs-static-i18n
pip install mkdocs-with-pdf
pip install qrcode
pip install mkdocs-awesome-pages-plugin
pip install mkdocs-embed-external-markdown
pip install mkdocs-include-markdown-plugin
pip install mkdocs-ezlinks-plugin
pip install mkdocs-git-authors-plugin
pip install mkdocs-git-committers-plugin
pip install mkdocs-exclude

pip install pptx2md

REM Step 8: Revert back to the original directory
echo Revert to the original directory
cd "%currentDir%"

pause
@endlocal
