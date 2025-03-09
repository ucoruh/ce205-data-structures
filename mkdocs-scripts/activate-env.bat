@echo off
echo Activating MkDocs environment...

REM Save the current directory
set CURRENT_DIR=%cd%

REM Go up one directory
cd ..

REM Activate the conda environment
call conda activate ce204-object-oriented-programming-mkdocs

REM Return to the original directory
cd %CURRENT_DIR%

echo Environment activated. MkDocs is ready to use!
pause