@echo off
@setlocal enableextensions
@cd /d "%~dp0"

echo Starting Markdown build process...

REM Save the current directory
set CURRENT_DIR=%cd%

REM Move up one level from scripts directory to the parent directory
cd ..

echo Searching for markdown files in specific week folders...

REM Define the folders to process
set FOLDERS=syllabus week-1 week-2 week-3 week-4 week-5 week-6 week-7 week-8 week-9 week-10 week-11 week-12 week-13 week-14 week-15 week-16

REM Process each specific folder
for %%d in (%FOLDERS%) do (
    echo.
    echo ===================================================
    echo Processing folder: %%d
    echo ===================================================
    
    REM Check if the folder exists
    if exist "%cd%\docs\%%d" (
        REM Process all markdown files in this specific folder
        for %%f in ("%cd%\docs\%%d\*.md") do (
            REM Get only the filename part for checking
            set "filename=%%~nxf"
            
            REM Skip index.md and license.md files
            if /I NOT "%%~nxf"=="index.md" if /I NOT "%%~nxf"=="license.md" (
                echo Processing file: %%f
                
                REM Generate HTML and PDF slides using Marp
                echo Creating slide formats with Marp...
                call marp "%%f" --html --pdf -o "%%~dpf%%~nf.md_slide.pdf" --allow-local-files
                call marp "%%f" --html -o "%%~dpf%%~nf.md_slide.html" --allow-local-files
                
                REM The following formats are disabled for now
                REM call marp "%%f" --pptx -o "%%~dpf%%~nf.md_slide.pptx" --allow-local-files
                REM call pandoc "%%f" --pdf-engine=xelatex -f markdown-implicit_figures -V colorlinks -V urlcolor=NavyBlue -V toccolor=Red --toc -N -o "%%~dpf%%~nf.md_doc.pdf"
                REM call pandoc -o "%%~dpf%%~nf.md_word.docx" -f markdown -t docx "%%f"
                REM call pandoc -o "%%~dpf%%~nf.md_word.pptx" -f markdown -t pptx "%%f"
                
                echo Completed processing: %%~nxf
            ) else (
                echo Skipping file: %%~nxf
            )
        )
    ) else (
        echo Folder not found: %cd%\docs\%%d
    )
)

REM Return to the original directory
cd "%CURRENT_DIR%"

echo.
echo ===================================================
echo Markdown build process completed!
echo ===================================================
echo Returned to original directory: %CURRENT_DIR%

pause