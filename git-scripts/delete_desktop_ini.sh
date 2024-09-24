#!/bin/bash

echo ":::: DELETE GOOGLE DRIVE desktop.ini FILES :::"

# Save the current directory
currentDir=$(pwd)

echo "Get the current directory: $currentDir"

echo "Change the working directory to the script directory"
cd "$(dirname "$0")"

echo "Change the working directory to the parent folder"
cd ..

# Find and delete desktop.ini files, and remove them from Git index
find . -name 'desktop.ini' -print0 | while IFS= read -r -d '' file; do
    if [ -f "$file" ]; then
        git rm --cached --force "$file"
        rm "$file"
        echo "Removed $file"
    fi
done

echo ":::: DELETE OPERATION COMPLETED :::"

# Revert to the original directory
cd "$currentDir"

# Wait for user input before exiting
read -p "Press any key to continue..." -n1 -s
echo
