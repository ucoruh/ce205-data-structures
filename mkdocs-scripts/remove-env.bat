@echo off
echo Removing MkDocs environment...

REM Save the current directory
set CURRENT_DIR=%cd%

REM Go up one directory
cd ..

REM Remove the conda environment
conda env remove -n ce204-object-oriented-programming-mkdocs -y

REM Return to the original directory
cd %CURRENT_DIR%

echo Environment removed successfully!
pause