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

ffmpeg -i output.ppm -c:v libx264 -crf 24 -preset veryslow output.mp4

echo Revert to the original directory
cd "%currentDir%"

pause
@endlocal
