#!/usr/bin/env python3
"""
Create simple CHIP-8 test ROMs to demonstrate the emulator
"""

def create_simple_rom():
    """Create a simple ROM that displays a pattern"""
    # CHIP-8 machine code for a simple program
    # This will draw some pixels on the screen
    rom_data = [
        0x00, 0xE0,  # CLS - Clear screen
        0x60, 0x20,  # LD V0, 0x20 - Load X position
        0x61, 0x10,  # LD V1, 0x10 - Load Y position
        0xA0, 0x50,  # LD I, 0x50 - Load font address (for digit '0')
        0xD0, 0x15,  # DRW V0, V1, 5 - Draw 5-byte sprite (digit '0')
        0x12, 0x04,  # JMP 0x204 - Jump to loop
    ]
    return bytes(rom_data)

def create_counting_rom():
    """Create a ROM that counts and displays numbers"""
    rom_data = [
        0x00, 0xE0,  # CLS - Clear screen
        0x60, 0x00,  # LD V0, 0 - Initialize counter
        0x61, 0x10,  # LD V1, 0x10 - Y position
        0x62, 0x10,  # LD V2, 0x10 - X position
        0xA0, 0x50,  # LD I, 0x50 - Font start address
        0xF0, 0x29,  # LD F, V0 - Get font address for digit in V0
        0xD2, 0x15,  # DRW V2, V1, 5 - Draw the digit
        0x70, 0x01,  # ADD V0, 1 - Increment counter
        0x30, 0x0A,  # SE V0, 0x0A - Check if V0 == 10
        0x12, 0x02,  # JMP 0x202 - Loop if not 10
        0x12, 0x00,  # JMP 0x200 - Restart if 10
    ]
    return bytes(rom_data)

def create_bouncing_pixel():
    """Create a ROM with a bouncing pixel"""
    rom_data = [
        0x00, 0xE0,  # CLS - Clear screen
        0x60, 0x1F,  # LD V0, 31 - Start Y position (middle)
        0x61, 0x1F,  # LD V1, 31 - Start X position (middle)
        0xA2, 0x00,  # LD I, 0x220 - Sprite address
        0xD0, 0x11,  # DRW V0, V1, 1 - Draw 1-byte sprite
        0x12, 0x0C,  # JMP 0x20C - Delay loop
        0x80, 0x40,  # ADD V0, V4 - Add Y velocity
        0x81, 0x50,  # ADD V1, V5 - Add X velocity
        0xD0, 0x11,  # DRW V0, V1, 1 - Draw (erase if collision)
        0x40, 0x00,  # SNE V0, 0 - Check Y position
        0x12, 0x02,  # JMP 0x202 - Continue
        0x84, 0x00,  # XOR V4, V0 - Reverse Y velocity
        0x41, 0x3F,  # SNE V1, 63 - Check X position
        0x12, 0x02,  # JMP 0x202 - Continue
        0x85, 0x00,  # XOR V5, V1 - Reverse X velocity
        0x12, 0x08,  # JMP 0x208 - Continue bouncing
        0x00, 0xFF,  # Sprite data (1 byte)
        0x64, 0x01,  # LD V4, 1 - Y velocity
        0x65, 0x01,  # LD V5, 1 - X velocity
        0x00, 0x00,  # Padding
        0x12, 0x04,  # JMP 0x204 - Start
    ]
    return bytes(rom_data)

if __name__ == "__main__":
    # Create ROMs directory if it doesn't exist
    import os
    os.makedirs("roms", exist_ok=True)

    # Create the ROMs
    with open("roms/simple_test.ch8", "wb") as f:
        f.write(create_simple_rom())
    print("✓ Created roms/simple_test.ch8 - Draws a '0' on screen")

    with open("roms/counting.ch8", "wb") as f:
        f.write(create_counting_rom())
    print("✓ Created roms/counting.ch8 - Counts from 0 to 9")

    with open("roms/bouncing.ch8", "wb") as f:
        f.write(create_bouncing_pixel())
    print("✓ Created roms/bouncing.ch8 - Bouncing pixel animation")

    print("\nAll test ROMs created successfully!")
    print("Run them with: ./chip8 10 3 roms/simple_test.ch8")