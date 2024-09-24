@echo off
setlocal enableextensions

echo Get the current directory
set "currentDir=%CD%"

REM Step 2: Change the current working directory to the script directory
echo Change the current working directory to the script directory
cd /d "%~dp0"

REM Step 3: Move up one directory (to the parent folder)
echo Change the working directory to the parent folder
cd ..

rem Recursively delete any remaining mkdocs_*, pandoc_*, and panppt_* files
for /r %%# in (mkdocs_*.md pandoc_*.md panppt_*.md) do (
    del "%%#"
    echo Deleted: %%~nx#
)

echo All mkdocs_*.md, pandoc_*.md, and panppt_*.md files deleted.

rem Recursively delete tex2pdf.* directories
for /r /d %%i in (tex2pdf.*) do (
    echo Deleting folder: %%~nxi
    rd /s /q "%%i"
    echo Folder deleted: %%~nxi
)

echo All tex2pdf.* folders deleted.

echo Revert to the original directory
cd "%currentDir%"
