@echo off
setlocal enabledelayedexpansion

echo Deleting PlantUML jar file if exists...
if exist plantuml.jar del plantuml.jar

echo Download and install jq
curl -sL -o jq.exe https://github.com/stedolan/jq/releases/download/jq-1.6/jq-win64.exe

set use_latest=0
rem set specific_version=tags/v1.2024.4
set specific_version=tags/v1.2024.6

if %use_latest%==1 (
    echo Extracting download URL for the latest release of PlantUML
    for /f "delims=" %%a in ('curl -s https://api.github.com/repos/plantuml/plantuml/releases/latest ^| jq -r ".assets[] | select(.name | endswith(\"plantuml.jar\")) | .browser_download_url"') do (
        set download_url=%%a
    )
) else (
    echo Extracting download URL for the specific release %specific_version% of PlantUML
    for /f "delims=" %%a in ('curl -s https://api.github.com/repos/plantuml/plantuml/releases/%specific_version% ^| jq -r ".assets[] | select(.name | endswith(\"plantuml.jar\")) | .browser_download_url"') do (
        set download_url=%%a
    )
)

echo Downloading plantuml.jar
curl -sL -o plantuml.jar "%download_url%"

echo Download URL: %download_url%
echo PlantUML downloaded successfully!

echo Deleting jq.exe...
del jq.exe

echo Downloading JLatexMath...
curl -sL -o jlatexmath.zip http://beta.plantuml.net/plantuml-jlatexmath.zip

echo Extracting JLatexMath...
powershell -Command "Expand-Archive -Path jlatexmath.zip -DestinationPath . -Force"

echo Deleting jlatexmath.zip...
del jlatexmath.zip

echo Downloading Batik and Fop...
curl -sL -o batikAndFop.zip http://beta.plantuml.net/batikAndFop.zip

echo Extracting Batik and Fop...
powershell -Command "Expand-Archive -Path batikAndFop.zip -DestinationPath . -Force"

echo Deleting batikAndFop.zip...
del batikAndFop.zip

REM Verify that all necessary JAR files are present
echo Verifying necessary JAR files...
if not exist "batik-all-1.7.jar" echo Missing batik-all-1.7.jar
if not exist "jlatexmath-minimal-1.0.3.jar" echo Missing jlatexmath-minimal-1.0.3.jar
if not exist "jlm_cyrillic.jar" echo Missing jlm_cyrillic.jar
if not exist "jlm_greek.jar" echo Missing jlm_greek.jar
if not exist "avalon-framework-4.2.0.jar" echo Missing avalon-framework-4.2.0.jar
if not exist "commons-io-1.3.1.jar" echo Missing commons-io-1.3.1.jar
if not exist "commons-logging-1.0.4.jar" echo Missing commons-logging-1.0.4.jar
if not exist "fop.jar" echo Missing fop.jar
if not exist "xml-apis-ext-1.3.04.jar" echo Missing xml-apis-ext-1.3.04.jar
if not exist "xmlgraphics-commons-1.4.jar" echo Missing xmlgraphics-commons-1.4.jar

echo All downloads and extractions completed successfully!

pause
