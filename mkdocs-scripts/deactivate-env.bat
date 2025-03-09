@echo off
echo Deactivating MkDocs environment...

REM Save the current directory
set CURRENT_DIR=%cd%

REM Go up one directory
cd ..

REM Deactivate the conda environment
call conda deactivate

REM Return to the original directory
cd %CURRENT_DIR%

echo Environment deactivated.
pause