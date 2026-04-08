#!/bin/bash

echo "Installing SDL2 development library..."
echo "You may need to enter your password..."

# Detect the package manager and install SDL2
if command -v apt-get &> /dev/null; then
    echo "Using apt-get package manager..."
    sudo apt-get update
    sudo apt-get install -y libsdl2-dev
elif command -v dnf &> /dev/null; then
    echo "Using dnf package manager..."
    sudo dnf install -y SDL2-devel
elif command -v pacman &> /dev/null; then
    echo "Using pacman package manager..."
    sudo pacman -S sdl2
else
    echo "Unsupported package manager. Please install SDL2 manually."
    exit 1
fi

# Check if installation was successful
if pkg-config --exists sdl2; then
    echo ""
    echo "✓ SDL2 installed successfully!"
    echo "  Version: $(pkg-config --modversion sdl2)"
    echo ""
    echo "You can now compile the CHIP-8 emulator with: make"
else
    echo ""
    echo "✗ SDL2 installation may have failed."
    echo "Please check the output above for errors."
fi