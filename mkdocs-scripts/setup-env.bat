@echo off
echo Setting up MkDocs environment...

REM Save the current directory
set CURRENT_DIR=%cd%

REM Go up one directory
cd ..

REM Create new environment from YAML file
conda env create -f conda_env.yml

REM Return to the original directory
cd %CURRENT_DIR%

echo Setup completed!
pause