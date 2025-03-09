@echo off
@setlocal enableextensions
@cd /d "%~dp0"

echo Starting cleanup process...

REM Save the current directory
set CURRENT_DIR=%cd%

REM Move up one level from scripts directory to the parent directory
cd ..

echo Searching for generated files to clean up...

REM Define the folders to process
set FOLDERS=syllabus week-1 week-2 week-3 week-4 week-5 week-6 week-7 week-8 week-9 week-10 week-11 week-12 week-13 week-14 week-15 week-16

REM Process each specific folder
for %%d in (%FOLDERS%) do (
    echo.
    echo ===================================================
    echo Cleaning folder: %%d
    echo ===================================================
    
    REM Check if the folder exists
    if exist "%cd%\docs\%%d" (
        echo Folder exists: %cd%\docs\%%d
        
        REM Delete specific file types one by one with verbose output
        echo Looking for slide.pdf files...
        if exist "%cd%\docs\%%d\*.slide.pdf" (
            del /f "%cd%\docs\%%d\*.slide.pdf"
            echo   Deleted slide.pdf files
        ) else (
            echo   No slide.pdf files found
        )
        
        echo Looking for slide.html files...
        if exist "%cd%\docs\%%d\*.slide.html" (
            del /f "%cd%\docs\%%d\*.slide.html"
            echo   Deleted slide.html files
        ) else (
            echo   No slide.html files found
        )
        
        echo Looking for slide.pptx files...
        if exist "%cd%\docs\%%d\*.slide.pptx" (
            del /f "%cd%\docs\%%d\*.slide.pptx"
            echo   Deleted slide.pptx files
        ) else (
            echo   No slide.pptx files found
        )
        
        echo Looking for doc.pdf files...
        if exist "%cd%\docs\%%d\*.doc.pdf" (
            del /f "%cd%\docs\%%d\*.doc.pdf"
            echo   Deleted doc.pdf files
        ) else (
            echo   No doc.pdf files found
        )
        
        echo Looking for word.docx files...
        if exist "%cd%\docs\%%d\*.word.docx" (
            del /f "%cd%\docs\%%d\*.word.docx"
            echo   Deleted word.docx files
        ) else (
            echo   No word.docx files found
        )
        
        echo Looking for word.pptx files...
        if exist "%cd%\docs\%%d\*.word.pptx" (
            del /f "%cd%\docs\%%d\*.word.pptx"
            echo   Deleted word.pptx files
        ) else (
            echo   No word.pptx files found
        )
        
    ) else (
        echo Folder not found: %cd%\docs\%%d
    )
)

REM Return to the original directory
cd "%CURRENT_DIR%"

echo.
echo ===================================================
echo Cleanup process completed!
echo ===================================================
echo Returned to original directory: %CURRENT_DIR%

pause