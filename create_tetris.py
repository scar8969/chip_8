#!/usr/bin/env python3
"""
Create a simple CHIP-8 Tetris-like game
This is a simplified version that demonstrates the concept
"""

def create_simple_tetris():
    """Create a simple falling block game"""
    rom_data = [
        # Initialize game
        0x00, 0xE0,  # CLS - Clear screen
        0x60, 0x00,  # LD V0, 0 - X position
        0x61, 0x00,  # LD V1, 0 - Y position
        0x62, 0x01,  # LD V2, 1 - X velocity
        0x63, 0x01,  # LD V3, 1 - Y velocity

        # Main game loop
        0xA0, 0x50,  # LD I, 0x50 - Font address for '0'
        0xD0, 0x15,  # DRW V0, V1, 5 - Draw character
        0x12, 0x08,  # JMP 0x208 - Delay loop

        # Update position
        0x80, 0x20,  # ADD V0, V2 - Update X
        0x81, 0x30,  # ADD V1, V3 - Update Y

        # Boundary check - wrap around
        0x40, 0x3F,  # SNE V0, 63 - Check X boundary
        0x12, 0x04,  # JMP 0x204 - Continue if not at boundary
        0x60, 0x00,  # LD V0, 0 - Reset X

        0x41, 0x1F,  # SNE V1, 31 - Check Y boundary
        0x12, 0x02,  # JMP 0x202 - Continue if not at boundary
        0x61, 0x00,  # LD V1, 0 - Reset Y

        # Jump back to draw
        0x12, 0x00,  # JMP 0x200 - Restart loop

        # Delay loop (simple timing)
        0x00, 0xFF,  # Padding
    ]
    return bytes(rom_data)

def create_pong():
    """Create a simple Pong game"""
    rom_data = [
        # Initialize Pong
        0x00, 0xE0,  # CLS - Clear screen

        # Left paddle position
        0x60, 0x05,  # LD V0, 5 - Left paddle X
        0x61, 0x10,  # LD V1, 16 - Left paddle Y

        # Right paddle position
        0x62, 0x3A,  # LD V2, 58 - Right paddle X
        0x63, 0x10,  # LD V3, 16 - Right paddle Y

        # Ball position
        0x64, 0x20,  # LD V4, 32 - Ball X
        0x65, 0x10,  # LD V5, 16 - Ball Y

        # Ball velocity
        0x66, 0x01,  # LD V6, 1 - Ball X velocity
        0x67, 0x01,  # LD V7, 1 - Ball Y velocity

        # Draw paddles and ball
        0xA0, 0x50,  # LD I, 0x50 - Sprite address
        0xD0, 0x15,  # DRW V0, V1, 5 - Draw left paddle
        0xD2, 0x35,  # DRW V2, V3, 5 - Draw right paddle
        0xD4, 0x55,  # DRW V4, V5, 5 - Draw ball

        # Move ball
        0x84, 0x60,  # ADD V4, V6 - Update ball X
        0x85, 0x70,  # ADD V5, V7 - Update ball Y

        # Ball collision with walls
        0x45, 0x3F,  # SNE V4, 63 - Right wall
        0x86, 0x00,  # XOR V6, V6 - Reverse X velocity
        0x45, 0x00,  # SNE V4, 0 - Left wall
        0x86, 0x00,  # XOR V6, V6 - Reverse X velocity
        0x45, 0x1F,  # SNE V5, 31 - Bottom wall
        0x87, 0x00,  # XOR V7, V7 - Reverse Y velocity
        0x45, 0x00,  # SNE V5, 0 - Top wall
        0x87, 0x00,  # XOR V7, V7 - Reverse Y velocity

        # Delay
        0x12, 0x1E,  # JMP 0x21E - Delay loop
        0x12, 0x00,  # JMP 0x200 - Main loop
        0x00, 0xFF,  # Padding
    ]
    return bytes(rom_data)

if __name__ == "__main__":
    import os
    os.makedirs("roms", exist_ok=True)

    with open("roms/tetris_demo.ch8", "wb") as f:
        f.write(create_simple_tetris())
    print("✓ Created roms/tetris_demo.ch8 - Simple falling block game")

    with open("roms/pong_demo.ch8", "wb") as f:
        f.write(create_pong())
    print("✓ Created roms/pong_demo.ch8 - Simple Pong game")

    print("\nDemo games created!")
    print("Run with: ./chip8 10 3 roms/tetris_demo.ch8")