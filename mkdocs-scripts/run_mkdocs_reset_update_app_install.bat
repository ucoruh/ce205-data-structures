@echo off
setlocal enableextensions

REM Step 1: Get the current directory and store it in a variable
echo Getting the current directory...
set "currentDir=%CD%"

REM Step 2: Change the current working directory to the script directory
echo Changing the current working directory to the script directory...
cd /d "%~dp0"

REM Step 3: Move up one directory (to the parent folder)
echo Changing the working directory to the parent folder...
cd ..

REM Step 4: Install Chocolatey and necessary packages
echo Installing Chocolatey...
Powershell.exe Set-ExecutionPolicy Bypass -Scope Process -Force; `
    [System.Net.ServicePointManager]::SecurityProtocol = `
    [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

echo Installing Pandoc, rsvg-convert, Python, and MiKTeX via Chocolatey...
Powershell.exe choco install pandoc --force --force-dependencies
Powershell.exe choco install rsvg-convert --force --force-dependencies
Powershell.exe choco install python --force --force-dependencies
Powershell.exe choco install miktex --force --force-dependencies

REM Step 5: Install Scoop and necessary packages
echo Installing Scoop...
Powershell.exe Invoke-Expression (New-Object System.Net.WebClient).DownloadString('https://get.scoop.sh')
Powershell.exe Set-ExecutionPolicy RemoteSigned -scope CurrentUser

echo Installing and updating curl and Marp via Scoop...
Powershell.exe scoop install curl
Powershell.exe scoop update curl
Powershell.exe scoop install marp
Powershell.exe scoop update marp

REM Step 6: Install Python packages via pip
echo Installing and updating Python packages via pip...
pip install --upgrade --force-reinstal mkdocs
pip install --upgrade --force-reinstal pymdown-extensions
pip install --upgrade --force-reinstal mkdocs-material
pip install --upgrade --force-reinstal mkdocs-material-extensions
pip install --upgrade --force-reinstal mkdocs-simple-hooks
pip install --upgrade --force-reinstal mkdocs-video
pip install --upgrade --force-reinstal mkdocs-minify-plugin
pip install --upgrade --force-reinstal mkdocs-git-revision-date-localized-plugin
pip install --upgrade --force-reinstal mkdocs-minify-plugin
pip install --upgrade --force-reinstal mkdocs-static-i18n
pip install --upgrade --force-reinstal mkdocs-with-pdf
pip install --upgrade --force-reinstal qrcode
pip install --upgrade --force-reinstal mkdocs-awesome-pages-plugin
pip install --upgrade --force-reinstal mkdocs-embed-external-markdown
pip install --upgrade --force-reinstal mkdocs-include-markdown-plugin
pip install --upgrade --force-reinstal mkdocs-ezlinks-plugin
pip install --upgrade --force-reinstal mkdocs-git-authors-plugin
pip install --upgrade --force-reinstal mkdocs-git-committers-plugin
pip install --upgrade --force-reinstal mkdocs-exclude
pip install --upgrade --force-reinstal pptx2md

REM Step 7: Revert back to the original directory
echo Reverting to the original directory...
cd "%currentDir%"

pause
@endlocal
