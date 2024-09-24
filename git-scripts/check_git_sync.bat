@echo off

:: Enable necessary extensions
@setlocal enableextensions

echo Get the current directory
set "currentDir=%CD%"

echo Change the current working directory to the script directory
@cd /d "%~dp0"

echo Change the working directory to the parent folder
cd ..

del desktop.ini /A:H /S

:: Check for uncommitted changes and list them if found
git status --porcelain > temp_status.txt
if %errorlevel% equ 0 (
    echo Warning: You have uncommitted changes.
    echo Uncommitted changes:
    type temp_status.txt
) else (
    del temp_status.txt
)

:: Fetch the latest changes from the remote repository
git fetch

:: Get the local branch, remote branch, and their base
for /f %%i in ('git rev-parse @') do set local=%%i
for /f %%i in ('git rev-parse @{u}') do set remote=%%i
for /f %%i in ('git merge-base @ @{u}') do set base=%%i

if "%local%" == "%remote%" (
    echo Local branch is up-to-date with the remote branch.
) else if "%local%" == "%base%" (
    echo Local branch is behind the remote branch.
) else if "%remote%" == "%base%" (
    echo Local branch is ahead of the remote branch.
) else (
    echo Local and remote branches have diverged.
)

:: Clean up temporary file if it exists
if exist temp_status.txt del temp_status.txt

echo Revert to the original directory
cd "%currentDir%"

pause
@endlocal
