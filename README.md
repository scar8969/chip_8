# CHIP-8 Emulator

A complete CHIP-8 emulator written in C++ using SDL2 for graphics and input handling.

## Features

- Full implementation of all 34 CHIP-8 instructions
- Function pointer table for efficient instruction decoding
- SDL2-based platform layer for cross-platform compatibility
- Proper handling of CHIP-8 components:
  - 16 8-bit registers (V0-VF)
  - 4K bytes of memory
  - 16-bit index register
  - 16-bit program counter
  - 16-level stack
  - 8-bit delay and sound timers
  - 16-key input
  - 64x32 monochrome display

## Building the Emulator

### Prerequisites

- C++ compiler with C++17 support
- SDL2 development library

### Installing SDL2

**Ubuntu/Debian:**
```bash
sudo apt-get install libsdl2-dev
```

**Fedora:**
```bash
sudo dnf install SDL2-devel
```

**macOS (using Homebrew):**
```bash
brew install sdl2
```

### Compilation

#### Using Make (Recommended)
```bash
make
```

#### Using CMake
```bash
mkdir build
cd build
cmake ..
make
```

#### Manual Compilation
```bash
g++ -std=c++17 -o chip8 main.cpp Chip8.cpp Platform.cpp -lSDL2
```

## Running the Emulator

```bash
./chip8 <Scale> <Delay> <ROM>
```

**Arguments:**
- `Scale`: Integer scale factor for the display (e.g., 10 for 640x320 window)
- `Delay`: Cycle delay in milliseconds (1-10 recommended, depends on game)
- `ROM`: Path to the CHIP-8 ROM file

## Key Mapping

The CHIP-8 has 16 keys (0-F) mapped to your keyboard as follows:

```
CHIP-8 Keypad       Keyboard
+-+-+-+-+          +-+-+-+-+
|1|2|3|C|          |1|2|3|4|
+-+-+-+-+          +-+-+-+-+
|4|5|6|D|          |Q|W|E|R|
+-+-+-+-+    =>    +-+-+-+-+
|7|8|9|E|          |A|S|D|F|
+-+-+-+-+          +-+-+-+-+
|A|0|B|F|          |Z|X|C|V|
+-+-+-+-+          +-+-+-+-+
```

## Example Usage

### Run with test ROM
```bash
./chip8 10 1 test_opcode.ch8
```

### Play Tetris
```bash
./chip8 10 3 Tetris.ch8
```

### Play Pong
```bash
./chip8 10 2 Pong.ch8
```

## Controls

- **ESC**: Exit the emulator
- **Number keys**: As shown in the key mapping above

## Project Structure

```
chip_8/
├── Chip8.h         # CHIP-8 emulator header
├── Chip8.cpp       # CHIP-8 emulator implementation
├── Platform.h      # SDL2 platform layer header
├── Platform.cpp    # SDL2 platform layer implementation
├── main.cpp        # Main program loop
├── CMakeLists.txt  # CMake build configuration
├── Makefile        # Make build configuration
└── README.md       # This file
```

## Technical Details

### CPU Cycle

The emulator follows the standard fetch-decode-execute cycle:
1. **Fetch**: Read two-byte opcode from memory at PC
2. **Decode**: Use function pointer table to determine instruction
3. **Execute**: Call the appropriate instruction handler
4. **Update**: Decrement timers if non-zero

### Display

The CHIP-8 display is 64x32 pixels, where each pixel is either on (0xFFFFFFFF) or off (0x00000000). The emulator uses XOR drawing, where sprites are XORed with the current display state, allowing for both drawing and erasing.

### Instruction Set

All 34 CHIP-8 instructions are implemented using a function pointer table for efficient dispatch. Instructions are grouped by their first nibble for optimized lookup.

## Credits

Based on the excellent CHIP-8 emulator guide by [Your Name], which provides a comprehensive introduction to emulator development and low-level programming concepts.

## License

This project is provided as-is for educational purposes.