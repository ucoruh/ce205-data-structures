@echo off
echo Deploying MkDocs site...

REM Save the current directory
set CURRENT_DIR=%cd%

REM Go up one directory
cd ..

REM Deploy the site (using gh-deploy which is common for MkDocs)
echo Deploying site...
mkdocs gh-deploy --force

REM Check if deployment was successful
if %ERRORLEVEL% NEQ 0 (
    echo Error: Site deployment failed!
) else (
    echo Site deployed successfully!
)

REM Return to the original directory
cd "%CURRENT_DIR%"

pause