@echo off

:: Enable necessary extensions
@setlocal enableextensions

echo Get the current directory
set "currentDir=%CD%"

echo Change the current working directory to the script directory
cd /d "%~dp0"

echo Change the working directory to the parent folder
cd ..

:: Set the path to Graphviz
SET GRAPHVIZ_DOT="C:\Program Files (x86)\Graphviz2.38\bin\dot.exe"

:: Run PlantUML to test dot configuration
REM java -DPLANTUML_LIMIT_SIZE=8192 -jar "plantuml.jar" -v "test.dot"
java -jar "%~dp0plantuml.jar" -v -testdot

echo Revert to the original directory
cd "%currentDir%"

pause
@endlocal
