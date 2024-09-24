@echo off
setlocal

echo Get the current directory
set "currentDir=%CD%"
echo Current Directory: %currentDir%

echo Change the current working directory to the script directory
cd /d "%~dp0"
echo Script Directory: %CD%

echo Change the working directory to the parent folder
cd ..
echo Parent Directory: %CD%

REM Set the path to the .git/hooks directory
set HOOKS_DIR=.git/hooks

REM Check if .git/hooks directory exists
if not exist "%HOOKS_DIR%" (
    echo Error: .git/hooks directory not found.
    exit /b 1
)

REM Backup current pre-commit script if it exists
if exist "%HOOKS_DIR%\pre-commit" (
    echo Backing up current pre-commit script...
    rename "%HOOKS_DIR%\pre-commit" "pre-commit.backup"
)

REM Copy pre-commit to .git/hooks directory and rename it to pre-commit
copy "%CD%\git-scripts\pre-commit" "%HOOKS_DIR%\pre-commit"

REM Backup current pre-push script if it exists
if exist "%HOOKS_DIR%\pre-push" (
    echo Backing up current pre-push script...
    rename "%HOOKS_DIR%\pre-push" "pre-push.backup"
)

REM Copy pre-push to .git/hooks directory and rename it to pre-push
copy "%CD%\git-scripts\pre-push" "%HOOKS_DIR%\pre-push"

echo Scripts have been copied successfully.

echo Revert to the original directory
cd /d "%currentDir%"
echo Reverted to Original Directory: %CD%

pause
@endlocal
