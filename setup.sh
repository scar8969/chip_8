#!/bin/bash

echo "CHIP-8 Emulator Setup Script"
echo "============================"
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
else
    OS="unknown"
fi

echo "Detected OS: $OS"
echo ""

# Check if SDL2 is already installed
if pkg-config --exists sdl2; then
    echo "SDL2 is already installed!"
    echo "Version: $(pkg-config --modversion sdl2)"
    echo ""
    echo "You can now compile the emulator with: make"
    exit 0
fi

echo "SDL2 not found. Installing..."
echo ""

case $OS in
    linux)
        # Try different package managers
        if command -v apt-get &> /dev/null; then
            echo "Installing SDL2 using apt-get..."
            sudo apt-get update
            sudo apt-get install -y libsdl2-dev
        elif command -v dnf &> /dev/null; then
            echo "Installing SDL2 using dnf..."
            sudo dnf install -y SDL2-devel
        elif command -v pacman &> /dev/null; then
            echo "Installing SDL2 using pacman..."
            sudo pacman -S sdl2
        else
            echo "No supported package manager found."
            echo "Please install SDL2 manually:"
            echo "  Ubuntu/Debian: sudo apt-get install libsdl2-dev"
            echo "  Fedora: sudo dnf install SDL2-devel"
            echo "  Arch: sudo pacman -S sdl2"
            exit 1
        fi
        ;;
    macos)
        if command -v brew &> /dev/null; then
            echo "Installing SDL2 using Homebrew..."
            brew install sdl2
        else
            echo "Homebrew not found. Please install it first:"
            echo "  /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            echo ""
            echo "Then run this script again."
            exit 1
        fi
        ;;
    *)
        echo "Unsupported operating system."
        echo "Please install SDL2 manually for your platform."
        exit 1
        ;;
esac

echo ""
echo "SDL2 installation completed!"
echo ""
echo "You can now compile the emulator with: make"