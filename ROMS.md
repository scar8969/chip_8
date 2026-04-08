# CHIP-8 ROMs

## Where to Find ROMs

Here are some popular sources for CHIP-8 ROMs:

### Official Test ROMs
- **Test ROM**: [test_opcode.ch8](https://github.com/corax89/chip8-test-rom) - Essential for testing your emulator
- **IBM Logo**: [IBM Logo.ch8](https://github.com/kripod/chip8-roms) - Tests basic functionality

### Game ROMs
- **Tetris**: Classic tile-matching puzzle game
- **Pong**: Two-player paddle game
- **Space Invaders**: Classic shooter
- **Puzzle**: Various puzzle games
- **Maze**: Maze navigation games

### ROM Collections
- [GitHub - chip8-roms](https://github.com/kripod/chip8-roms) - Large collection of CHIP-8 games
- [GitHub - CHIP-8 ROM Pack](https://github.com/Chromaryu/chip8-roms) - Another comprehensive collection
- [CHIP-8 Museum](http://michaelaw.github.io/chip8-emu/) - Online emulator with many ROMs

## Downloading ROMs

### Using wget
```bash
# Download test ROM
wget https://raw.githubusercontent.com/corax89/chip8-test-rom/master/test_opcode.ch8

# Download some games
wget https://raw.githubusercontent.com/kripod/chip8-roms/main/games/Tetris.ch8
wget https://raw.githubusercontent.com/kripod/chip8-roms/main/games/Pong.ch8
```

### Manual Download
1. Visit any of the GitHub repositories listed above
2. Download individual `.ch8` files
3. Place them in the same directory as the emulator

## Testing Your Emulator

### Step 1: Test with Test ROM
```bash
./chip8 10 1 test_opcode.ch8
```

The test ROM should display "Testing..." and then run through various tests. If you see "Passed" at the end, your emulator is working correctly!

### Step 2: Play Games
```bash
# Tetris (recommended delay: 3-4)
./chip8 10 3 Tetris.ch8

# Pong (recommended delay: 2-3)
./chip8 10 2 Pong.ch8

# Space Invaders (recommended delay: 2-3)
./chip8 10 2 Space Invaders.ch8
```

## ROM Compatibility

Most CHIP-8 ROMs should work with this emulator, but some may have timing differences or use unofficial opcodes. The test ROM is the best way to verify compatibility.

## Game Controls Reference

When playing games, refer to this key mapping:

```
Keyboard → CHIP-8 Keypad
1,2,3,4  → 1,2,3,C
Q,W,E,R  → 4,5,6,D
A,S,D,F  → 7,8,9,E
Z,X,C,V  → A,0,B,F
```

**Common Game Controls:**
- **Tetris**: 
  - Movement: Q,W,E,A (rotate left, right, down, drop)
  - Start/Select: 5, 6
  
- **Pong**:
  - Player 1: Q (up), A (down)
  - Player 2: O (up), L (down)
  - Start: 1

- **Space Invaders**:
  - Movement: 4 (left), 6 (right)
  - Fire: 5

Note: Controls may vary between different ROM versions of the same game.