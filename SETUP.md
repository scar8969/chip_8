# CHIP-8 Emulator - Setup Instructions

## Current Status

✅ **Complete:**
- CHIP-8 emulator code written and ready
- Build system configured (Makefile + CMake)
- ROMs downloaded (test_opcode.ch8, Tetris.ch8, Pong.ch8)
- Documentation created

❌ **Pending:**
- SDL2 library installation (requires sudo access)
- Compilation of the emulator
- Running and testing

## Installation Steps

### Step 1: Install SDL2 (Requires Sudo)

Run the installation script:
```bash
./install_sdl2.sh
```

Or install manually:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install libsdl2-dev

# Fedora
sudo dnf install SDL2-devel

# Arch Linux
sudo pacman -S sdl2
```

### Step 2: Compile the Emulator

```bash
make
```

Alternative: Use CMake
```bash
mkdir build && cd build
cmake ..
make
```

### Step 3: Test with Test ROM

```bash
./chip8 10 1 roms/test_opcode.ch8
```

Expected: Display should show "Testing..." and then run through various tests.

### Step 4: Play Games!

```bash
# Tetris
./chip8 10 3 roms/Tetris.ch8

# Pong
./chip8 10 2 roms/Pong.ch8
```

## Controls

- **ESC**: Quit emulator
- **Number Keys**: As shown in key mapping below

```
Keyboard → CHIP-8
1,2,3,4  → 1,2,3,C
Q,W,E,R  → 4,5,6,D
A,S,D,F  → 7,8,9,E
Z,X,C,V  → A,0,B,F
```

## Troubleshooting

### "SDL2/SDL.h: No such file or directory"
SDL2 is not installed. Run: `./install_sdl2.sh`

### "make: command not found"
Install build tools:
```bash
sudo apt-get install build-essential
```

### "permission denied" running chip8
Make executable:
```bash
chmod +x chip8
```

### Window too large/small
Adjust the scale parameter:
```bash
./chip8 5 1 roms/test_opcode.ch8   # Smaller window
./chip8 20 1 roms/test_opcode.ch8  # Larger window
```

### Games running too fast/slow
Adjust the delay parameter:
```bash
./chip8 10 1 roms/Tetris.ch8   # Fast
./chip8 10 10 roms/Tetris.ch8  # Slow
```

## Project Files

```
chip_8/
├── Chip8.h/cpp          # Core emulator
├── Platform.h/cpp       # SDL2 interface
├── main.cpp             # Main program
├── Makefile             # Build system
├── CMakeLists.txt       # CMake config
├── install_sdl2.sh      # SDL2 installer
├── setup.sh             # Alternative setup
├── roms/                # Downloaded ROMs
│   ├── test_opcode.ch8  # Test ROM
│   ├── Tetris.ch8       # Game
│   └── Pong.ch8         # Game
└── *.md                 # Documentation
```

## Next Steps After Installation

1. Run test ROM to verify functionality
2. Try playing the included games
3. Download more ROMs from GitHub collections
4. Experiment with the code!
5. Try building an NES emulator next!

## Quick Reference

| Command | Purpose |
|---------|---------|
| `./install_sdl2.sh` | Install SDL2 |
| `make` | Compile emulator |
| `make clean` | Clean build files |
| `./chip8 10 1 roms/test_opcode.ch8` | Run test |
| `./chip8 10 3 roms/Tetris.ch8` | Play Tetris |

## Support

For issues or questions:
- Check the README.md for detailed documentation
- Review ROMS.md for game information
- See QUICK_START.md for reference guide