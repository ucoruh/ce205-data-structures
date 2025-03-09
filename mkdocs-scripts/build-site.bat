@echo off
echo Building MkDocs site...

REM Save the current directory
set CURRENT_DIR=%cd%

REM Go up one directory
cd ..

REM Clean the site directory if it exists
if exist "site" (
    echo Cleaning existing site directory...
    rmdir /s /q "site"
)

REM Build the site
echo Building site...
mkdocs build

REM Check if build was successful
if %ERRORLEVEL% NEQ 0 (
    echo Error: Site build failed!
) else (
    echo Site built successfully! Output is in the 'site' directory.
)

REM Return to the original directory
cd "%CURRENT_DIR%"

pause