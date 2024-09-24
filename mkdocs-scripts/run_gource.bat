rem https://github.com/acaudwell/Gource/wiki/Videos
rem https://www.gyan.dev/ffmpeg/builds/
rem https://stackoverflow.com/questions/1762960/gource-on-windows
@echo off
setlocal enableextensions

echo Get the current directory
set "currentDir=%CD%"

echo Change the current working directory to the script directory
cd /d "%~dp0"

echo Change the working directory to the parent folder
cd ..

gource -f -1024x768 --camera-mode  track  --file-idle-time 150  --max-file-lag 4 --seconds-per-day 2 --highlight-all-users --output-framerate 30 --output-ppm-stream output.ppm

echo Revert to the original directory
cd "%currentDir%"

pause
@endlocal
