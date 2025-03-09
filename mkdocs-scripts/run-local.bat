@echo off
echo Running MkDocs site locally...

REM Save the current directory
set CURRENT_DIR=%cd%

REM Go up one directory
cd ..

REM Check if port 8000 is in use
set PORT=8000
netstat -ano | find ":%PORT% " > nul
if %ERRORLEVEL% EQU 0 (
    echo Port 8000 is already in use. Using alternative port 8080...
    set PORT=8080
)

REM Get IP address
for /f "tokens=4" %%a in ('route print ^| find " 0.0.0.0"') do (
    set IP_ADDRESS=%%a
    goto :done
)
:done

echo Local URLs:
echo   http://127.0.0.1:%PORT%/
echo   http://%IP_ADDRESS%:%PORT%/
echo.
echo Press Ctrl+C to stop the server

REM Run the server
if "%PORT%"=="8000" (
    mkdocs serve
) else (
    mkdocs serve -a 127.0.0.1:8080
)

REM Return to the original directory
cd "%CURRENT_DIR%"

pause