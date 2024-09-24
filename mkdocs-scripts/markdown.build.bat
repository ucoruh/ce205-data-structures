@echo off
@setlocal enableextensions
@cd /d "%~dp0"

REM Move up one level from mkdocs-scripts to the parent directory
cd ..

REM Search recursively in subdirectories under "docs" for all .md files
for /r "%cd%\docs" %%f in (*.md) do (
    REM Skip .md files directly under docs, only process subfolders
    if not "%%~dpf"=="%cd%\docs\" (

        echo Processing file: %%f

        REM Generate HTML, PDF, and PPTX slides using Marp
        Powershell.exe marp "%%f" --html --pdf -o "%%~nf_slide.pdf" --allow-local-files
        Powershell.exe marp "%%f" --html -o "%%~nf_slide.html" --allow-local-files
        Powershell.exe marp "%%f" --pptx -o "%%~nf_slide.pptx" --allow-local-files

        REM Generate DOCX and PDF documents using Pandoc
        Powershell.exe pandoc "%%f" --pdf-engine=xelatex -f markdown-implicit_figures -V colorlinks -V urlcolor=NavyBlue -V toccolor=Red --toc -N -o "%%~nf_doc.pdf"
        Powershell.exe pandoc -o "%%~nf_word.docx" -f markdown -t docx "%%f"
        Powershell.exe pandoc -o "%%~nf_word.pptx" -f markdown -t pptx "%%f"
    )
)

echo Revert to the original directory
cd "%currentDir%"

pause
