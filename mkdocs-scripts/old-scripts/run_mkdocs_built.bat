@echo off
setlocal enableextensions

echo Get the current directory
set "currentDir=%CD%"

echo Change the current working directory to the script directory
cd /d "%~dp0"

echo Change the working directory to the parent folder
cd ..

mkdocs build

echo Revert to the original directory
cd "%currentDir%"

pause
@endlocal