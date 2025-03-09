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

rem Delete any remaining mkdocs_ folders
for /r %%# in (mkdocs_* pandoc_* panppt_*) do (
    del "%%#"
    echo "%%~nx#" deleted.
)

echo All mkdocs_* files deleted, building again

rem Delete any remaining mkdocs_ folders
for /r %%# in (*_slide.pdf *_slide.html *_slide.pptx *_word.pptx) do (
    del "%%#"
    echo "%%~nx#" deleted.
)

rem Delete any remaining tex2pdf folders
for /d %%i in (tex2pdf.*) do (
    echo deleting "%%~ni"...
    rd /s /q "%%i"
    echo "%%~ni" deleted.
)

echo All tex2pdf.* folders deleted.

cd git-scripts
echo Generating PLANTUML Images

call run_plantuml_png.bat

call run_plantuml_svg.bat

echo PLANTUML Images Exported as PNG and SVG

cd "%currentDir%"

cd ..

echo Exporting Images

java -jar markdown-slide-converter.jar --drawioexport --folder "docs"

echo Merge & Build Files
java -jar markdown-slide-converter.jar --mergepages --folder "docs" --pandoc --mkdocs --overwrite --language en tr --rebuild --build

echo Revert to the original directory
cd "%currentDir%"

REM Step 2: Change the current working directory to the script directory
echo Change the current working directory to the script directory
cd /d "%~dp0"

REM Step 3: Move up one directory (to the parent folder)
echo Change the working directory to the parent folder
cd ..

rem Delete any remaining mkdocs_ folders
for /r %%# in (mkdocs_*.md pandoc_*.md panppt_*.md) do (
    del "%%#"
    echo "%%~nx#" deleted.
)

echo All mkdocs_* files deleted, building again


rem Delete any remaining tex2pdf folders
for /d %%i in (tex2pdf.*) do (
    echo deleting "%%~ni"...
    rd /s /q "%%i"
    echo "%%~ni" deleted.
)

echo All tex2pdf.* folders deleted.

echo Revert to the original directory
cd "%currentDir%"


echo Operation Completed
pause
