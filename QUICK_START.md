# CHIP-8 Emulator - Quick Start Guide

## Installation

1. **Install SDL2** (if not already installed):
   ```bash
   ./setup.sh
   ```

2. **Compile the emulator**:
   ```bash
   make
   ```

## Usage

```bash
./chip8 <Scale> <Delay> <ROM>
```

**Examples:**
```bash
# Test with delay 1ms
./chip8 10 1 test_opcode.ch8

# Play Tetris with delay 3ms
./chip8 10 3 Tetris.ch8

# Play Pong with delay 2ms
./chip8 10 2 Pong.ch8
```

## Key Mapping

```
Keyboard   CHIP-8
---------  ------
1          1
2          2
3          3
4          C
Q          4
W          5
E          6
R          D
A          7
S          8
D          9
F          E
Z          A
X          0
C          B
V          F
ESC        Quit
```

## Technical Specifications

- **CPU**: 16 8-bit registers (V0-VF)
- **Memory**: 4KB (4096 bytes)
- **Display**: 64×32 monochrome pixels
- **Input**: 16-key hexadecimal keypad
- **Timers**: 8-bit delay and sound timers
- **Stack**: 16 levels
- **Instructions**: 34 opcodes

## Architecture

```
┌─────────────────────────────────────┐
│         Main Program Loop           │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │      Platform Layer (SDL)     │  │
│  │  • Window & Display           │  │
│  │  • Input Handling             │  │
│  │  • Rendering                  │  │
│  └───────────────────────────────┘  │
│                 ↑↓                   │
│  ┌───────────────────────────────┐  │
│  │      CHIP-8 Emulator          │  │
│  │  • CPU Cycle                  │  │
│  │  • Instruction Decode         │  │
│  │  • Memory & Registers         │  │
│  │  • Display Buffer             │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## CPU Cycle

Each cycle performs:
1. **Fetch**: Read 2-byte opcode from memory[PC]
2. **Decode**: Use function pointer table lookup
3. **Execute**: Call instruction handler
4. **Update**: Decrement timers

## Troubleshooting

**SDL2 not found:**
```bash
./setup.sh
```

**Compilation errors:**
```bash
make clean
make
```

**Games running too fast/slow:**
- Adjust the delay parameter (1-10 recommended)
- Lower values = faster, Higher values = slower

**Display issues:**
- Try different scale factors (5-20 recommended)
- Ensure window fits on your screen

## Files

- `Chip8.h/cpp` - Core emulator implementation
- `Platform.h/cpp` - SDL2 platform layer
- `main.cpp` - Main program loop
- `Makefile` - Build configuration
- `CMakeLists.txt` - Alternative CMake build
- `setup.sh` - SDL2 installation script

## Next Steps

1. Install SDL2 and compile
2. Download test ROM to verify functionality
3. Try playing some games!
4. Experiment with different ROMs
5. Modify the code to learn more

## Resources

- [CHIP-8 Instruction Set](https://en.wikipedia.org/wiki/CHIP-8)
- [CHIP-8 Test ROMs](https://github.com/corax89/chip8-test-rom)
- [Game ROMs Collection](https://github.com/kripod/chip8-roms)