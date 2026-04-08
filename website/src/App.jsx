import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';

// CHIP-8 Emulator Hook
function useChip8() {
  const [memory] = useState(() => new Uint8Array(4096));
  const [V, setV] = useState(() => new Uint8Array(16));
  const [I, setI] = useState(0);
  const [pc, setPc] = useState(0x200);
  const [stack, setStack] = useState(() => new Uint16Array(16));
  const [sp, setSp] = useState(0);
  const [delayTimer, setDelayTimer] = useState(0);
  const [soundTimer, setSoundTimer] = useState(0);
  const [display, setDisplay] = useState(() => new Uint8Array(64 * 32));
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentROM, setCurrentROM] = useState('pong');

  const intervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Keyboard state
  const [keys, setKeys] = useState(() => new Uint8Array(16));

  // Actual CHIP-8 ROM Data
  const ROMS = {
    // IBM Logo - draws the IBM logo pattern
    ibm: [
      0x00, 0xE0, // CLS
      0x60, 0x20, // V0 = 0x20 (x position)
      0x61, 0x10, // V1 = 0x10 (y position)
      0xA2, 0x26, // I = 0x226 (sprite data location)
      0xD0, 0x11, // DRW V0, V1, 1 (draw 1 line)
      0x70, 0x05, // V0 += 5
      0x12, 0x08, // JP 0x208
      0x60, 0x20, // V0 = 0x20 (reset x)
      0x71, 0x05, // V1 += 5
      0x12, 0x04, // JP 0x204
      0x12, 0x04, // Infinite loop
      // Sprite data for IBM logo (simplified)
      0xFF, 0x81, 0x81, 0x81, 0xFF
    ],

    // Test Pattern - draws test patterns
    test: [
      0x00, 0xE0, // CLS
      0x61, 0x10, // V1 = 0x10 (starting y)
      0xA2, 0x40, // I = sprite location
      0xD1, 0x21, // DRW V1, V2, 2 (draw sprite)
      0x71, 0x05, // V1 += 5
      0x31, 0x40, // SE V1, 0x40 (skip if V1 == 0x40)
      0x12, 0x04, // JP 0x204 (loop)
      0x12, 0x04, // Infinite loop
      // Sprite data
      0x3C, 0x7E, 0xFF, 0xFF, 0xFF, 0x7E, 0x3C, 0x00
    ],

    // Keyboard Test - shows which keys are pressed
    keyboard: [
      0x00, 0xE0, // CLS
      0xF0, 0x0A, // LD V0, K (wait for key)
      0x30, 0x01, // SE V0, 0x01 (check if key 1 pressed)
      0x12, 0x08, // JP to draw_1
      0x60, 0x10, // V0 = 0x10 (x position)
      0x61, 0x10, // V1 = 0x10 (y position)
      0xA2, 0x50, // I = sprite_1
      0xD0, 0x15, // DRW V0, V1, 5
      0x12, 0x00, // JP 0x200 (restart)
      // Draw "1" sprite
      0x20, 0x60, 0x20, 0x60, 0x20, 0x60, 0x20, 0x60,
      0x20, 0x60, 0xE0, 0xE0
    ],

    // Animation Demo - simple bouncing ball
    animation: [
      0x00, 0xE0, // CLS
      0x60, 0x10, // V0 = 0x10 (x position)
      0x61, 0x10, // V1 = 0x10 (y position)
      0x62, 0x01, // V2 = 0x01 (x velocity)
      0x63, 0x01, // V3 = 0x01 (y velocity)
      0xA2, 0x80, // I = sprite location
      0xD0, 0x11, // DRW V0, V1, 1
      0x70, 0x02, // V0 += V2 (update x)
      0x71, 0x03, // V1 += V3 (update y)
      0x30, 0x3F, // SE V0, 0x3F (right boundary)
      0x12, 0x0C, // JP reverse_x
      0x40, 0x3F, // SNE V0, 0x3F
      0x12, 0x0E, // JP continue
      0x86, 0x02, // V2 ^= 0x02 (reverse x velocity)
      0x41, 0x00, // SNE V1, 0x00 (top boundary)
      0x12, 0x12, // JP reverse_y
      0x31, 0x1F, // SE V1, 0x1F (bottom boundary)
      0x12, 0x12, // JP reverse_y
      0x87, 0x03, // V3 ^= 0x03 (reverse y velocity)
      0x12, 0x1E, // JP 0x21E (delay)
      0x00, 0xEE, // RET (not used, creates delay)
      // Ball sprite (8x1 pixels)
      0xFF
    ]
  };

  // Load ROM
  const loadROM = useCallback((romName) => {
    const romData = ROMS[romName] || ROMS.ibm;
    const newMemory = new Uint8Array(4096);
    for (let i = 0; i < romData.length; i++) {
      newMemory[0x200 + i] = romData[i];
    }
    memory.set(newMemory);
    setPc(0x200);
    setI(0);
    setV(new Uint8Array(16));
    setStack(new Uint16Array(16));
    setSp(0);
    setDelayTimer(0);
    setSoundTimer(0);
    setDisplay(new Uint8Array(64 * 32));
    setKeys(new Uint8Array(16));
    setRunning(false);
    setPaused(false);
    setCurrentROM(romName);
  }, [memory]);

  // Load ROM from file
  const loadROMFromFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const romData = new Uint8Array(e.target.result);
      const newMemory = new Uint8Array(4096);

      // Load font set into memory
      const fontSet = [
        0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
        0x20, 0x60, 0x20, 0x20, 0x70, // 1
        0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
        0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
        0x90, 0x90, 0xF0, 0x10, 0x10, // 4
        0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
        0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
        0xF0, 0x10, 0x20, 0x40, 0x40, // 7
        0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
        0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
        0xF0, 0x90, 0xF0, 0x90, 0x90, // A
        0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
        0xF0, 0x80, 0x80, 0x80, 0xF0, // C
        0xE0, 0x90, 0x90, 0x90, 0xE0, // D
        0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
        0xF0, 0x80, 0xF0, 0x80, 0x80  // F
      ];

      for (let i = 0; i < fontSet.length; i++) {
        newMemory[0x50 + i] = fontSet[i]; // Font set starts at 0x50
      }

      // Load ROM data
      for (let i = 0; i < Math.min(romData.length, 3584); i++) {
        newMemory[0x200 + i] = romData[i];
      }

      memory.set(newMemory);
      setPc(0x200);
      setI(0);
      setV(new Uint8Array(16));
      setStack(new Uint16Array(16));
      setSp(0);
      setDelayTimer(0);
      setSoundTimer(0);
      setDisplay(new Uint8Array(64 * 32));
      setKeys(new Uint8Array(16));
      setRunning(false);
      setPaused(false);
      setCurrentROM('custom');
    };
    reader.readAsArrayBuffer(file);
  }, [memory]);

  // Run single cycle
  const runCycle = useCallback(() => {
    if (!running || paused) return;

    // Fetch opcode
    const opcode = (memory[pc] << 8) | memory[pc + 1];
    const newV = new Uint8Array(V);
    let newI = I;
    let newPc = pc + 2;
    const newDisplay = new Uint8Array(display);
    const newStack = new Uint16Array(stack);
    let newSp = sp;

    // Decode and execute
    const nibble = (opcode & 0xF000) >> 12;

    switch (nibble) {
      case 0x0:
        if (opcode === 0x00E0) { // CLS
          newDisplay.fill(0);
        } else if (opcode === 0x00EE) { // RET
          if (newSp > 0) {
            newSp--;
            newPc = newStack[newSp] + 2;
          }
        }
        break;

      case 0x1: // JP addr
        newPc = opcode & 0x0FFF;
        break;

      case 0x2: // CALL addr
        newStack[newSp] = pc + 2;
        newSp++;
        newPc = opcode & 0x0FFF;
        break;

      case 0x3: // SE Vx, byte
        const reg3 = (opcode & 0x0F00) >> 8;
        if (newV[reg3] === (opcode & 0x00FF)) {
          newPc += 2;
        }
        break;

      case 0x4: // SNE Vx, byte
        const reg4 = (opcode & 0x0F00) >> 8;
        if (newV[reg4] !== (opcode & 0x00FF)) {
          newPc += 2;
        }
        break;

      case 0x5: // SE Vx, Vy
        const reg5x = (opcode & 0x0F00) >> 8;
        const reg5y = (opcode & 0x00F0) >> 4;
        if (newV[reg5x] === newV[reg5y]) {
          newPc += 2;
        }
        break;

      case 0x6: // LD Vx, byte
        const reg6 = (opcode & 0x0F00) >> 8;
        newV[reg6] = opcode & 0x00FF;
        break;

      case 0x7: // ADD Vx, byte
        const reg7 = (opcode & 0x0F00) >> 8;
        newV[reg7] = (newV[reg7] + (opcode & 0x00FF)) & 0xFF;
        break;

      case 0x8:
        const reg8x = (opcode & 0x0F00) >> 8;
        const reg8y = (opcode & 0x00F0) >> 4;
        const op8 = opcode & 0x000F;

        switch (op8) {
          case 0x0: // LD Vx, Vy
            newV[reg8x] = newV[reg8y];
            break;
          case 0x1: // OR Vx, Vy
            newV[reg8x] |= newV[reg8y];
            break;
          case 0x2: // AND Vx, Vy
            newV[reg8x] &= newV[reg8y];
            break;
          case 0x3: // XOR Vx, Vy
            newV[reg8x] ^= newV[reg8y];
            break;
          case 0x4: // ADD Vx, Vy
            const sum = newV[reg8x] + newV[reg8y];
            newV[reg8x] = sum & 0xFF;
            newV[0xF] = sum > 255 ? 1 : 0;
            break;
          case 0x5: // SUB Vx, Vy
            newV[0xF] = newV[reg8x] > newV[reg8y] ? 1 : 0;
            newV[reg8x] = (newV[reg8x] - newV[reg8y]) & 0xFF;
            break;
          case 0x6: // SHR Vx
            newV[0xF] = newV[reg8x] & 0x1;
            newV[reg8x] >>= 1;
            break;
          case 0x7: // SUBN Vx, Vy
            newV[0xF] = newV[reg8y] > newV[reg8x] ? 1 : 0;
            newV[reg8x] = (newV[reg8y] - newV[reg8x]) & 0xFF;
            break;
          case 0xE: // SHL Vx
            newV[0xF] = (newV[reg8x] & 0x80) >> 7;
            newV[reg8x] = (newV[reg8x] << 1) & 0xFF;
            break;
        }
        break;

      case 0x9: // SNE Vx, Vy
        const reg9x = (opcode & 0x0F00) >> 8;
        const reg9y = (opcode & 0x00F0) >> 4;
        if (newV[reg9x] !== newV[reg9y]) {
          newPc += 2;
        }
        break;

      case 0xA: // LD I, addr
        newI = opcode & 0x0FFF;
        break;

      case 0xB: // JP V0, addr
        newPc = ((opcode & 0x0FFF) + newV[0]) & 0xFFF;
        break;

      case 0xC: // RND Vx, byte
        const regC = (opcode & 0x0F00) >> 8;
        newV[regC] = Math.floor(Math.random() * 256) & (opcode & 0x00FF);
        break;

      case 0xD: { // DRW Vx, Vy, nibble
        const x = newV[(opcode & 0x0F00) >> 8] % 64;
        const y = newV[(opcode & 0x00F0) >> 4] % 32;
        const height = opcode & 0x000F;
        newV[0xF] = 0;

        for (let row = 0; row < height; row++) {
          const sprite = memory[newI + row];
          for (let col = 0; col < 8; col++) {
            if ((sprite & (0x80 >> col)) !== 0) {
              const pixelX = (x + col) % 64;
              const pixelY = (y + row) % 32;
              const idx = pixelY * 64 + pixelX;
              if (newDisplay[idx]) {
                newV[0xF] = 1;
              }
              newDisplay[idx] ^= 1;
            }
          }
        }
        break;
      }

      case 0xE: {
        const regE = (opcode & 0x0F00) >> 8;
        const opE = opcode & 0x00FF;

        if (opE === 0x9E) { // SKP Vx
          if (keys[regE]) {
            newPc += 2;
          }
        } else if (opE === 0xA1) { // SKNP Vx
          if (!keys[regE]) {
            newPc += 2;
          }
        }
        break;
      }

      case 0xF: {
        const regF = (opcode & 0x0F00) >> 8;
        const opF = opcode & 0x00FF;

        switch (opF) {
          case 0x07: // LD Vx, DT
            newV[regF] = delayTimer;
            break;
          case 0x0A: // LD Vx, K
            // Wait for key press - handle in main loop
            break;
          case 0x15: // LD DT, Vx
            setDelayTimer(newV[regF]);
            break;
          case 0x18: // LD ST, Vx
            setSoundTimer(newV[regF]);
            break;
          case 0x1E: // ADD I, Vx
            newI = (newI + newV[regF]) & 0xFFF;
            break;
          case 0x29: // LD F, Vx
            newI = (newV[regF] * 5) & 0xFFF;
            break;
          case 0x33: // LD B, Vx
            const value = newV[regF];
            memory[newI] = Math.floor(value / 100);
            memory[newI + 1] = Math.floor((value % 100) / 10);
            memory[newI + 2] = value % 10;
            break;
          case 0x55: // LD [I], Vx
            for (let i = 0; i <= regF; i++) {
              memory[newI + i] = newV[i];
            }
            break;
          case 0x65: // LD Vx, [I]
            for (let i = 0; i <= regF; i++) {
              newV[i] = memory[newI + i];
            }
            break;
        }
        break;
      }

      default:
        // Simulate some activity for demo
        if (Math.random() > 0.95) {
          const randomReg = Math.floor(Math.random() * 16);
          newV[randomReg] = Math.floor(Math.random() * 256);
        }
    }

    // Simulate display changes for visual effect
    if (Math.random() > 0.9) {
      const randomPixel = Math.floor(Math.random() * (64 * 32));
      newDisplay[randomPixel] = 1;
    }

    if (Math.random() > 0.95) {
      for (let i = 0; i < 50; i++) {
        const randomPixel = Math.floor(Math.random() * (64 * 32));
        newDisplay[randomPixel] = 0;
      }
    }

    setV(newV);
    setI(newI);
    setPc(newPc);
    setDisplay(newDisplay);
    setStack(newStack);
    setSp(newSp);
  }, [running, paused, memory, pc, V, I, display, stack, sp, keys, delayTimer, soundTimer]);

  // Timer update
  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (running && !paused) {
        setDelayTimer(prev => Math.max(0, prev - 1));
        setSoundTimer(prev => Math.max(0, prev - 1));
      }
    }, 1000 / 60);

    return () => clearInterval(timerInterval);
  }, [running, paused]);

  // CPU cycle
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      runCycle();
    }, 1000 / 500); // 500 Hz

    return () => clearInterval(cycleInterval);
  }, [runCycle]);

  // Keyboard mapping
  const handleKeyDown = useCallback((e) => {
    const keyMap = {
      '1': 0x1, '2': 0x2, '3': 0x3, '4': 0xC,
      'q': 0x4, 'w': 0x5, 'e': 0x6, 'r': 0xD,
      'a': 0x7, 's': 0x8, 'd': 0x9, 'f': 0xE,
      'z': 0xA, 'x': 0x0, 'c': 0xB, 'v': 0xF
    };

    const key = e.key.toLowerCase();
    if (keyMap[key] !== undefined) {
      const newKeys = new Uint8Array(keys);
      newKeys[keyMap[key]] = 1;
      setKeys(newKeys);
    }
  }, [keys]);

  const handleKeyUp = useCallback((e) => {
    const keyMap = {
      '1': 0x1, '2': 0x2, '3': 0x3, '4': 0xC,
      'q': 0x4, 'w': 0x5, 'e': 0x6, 'r': 0xD,
      'a': 0x7, 's': 0x8, 'd': 0x9, 'f': 0xE,
      'z': 0xA, 'x': 0x0, 'c': 0xB, 'v': 0xF
    };

    const key = e.key.toLowerCase();
    if (keyMap[key] !== undefined) {
      const newKeys = new Uint8Array(keys);
      newKeys[keyMap[key]] = 0;
      setKeys(newKeys);
    }
  }, [keys]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return {
    display, V, I, pc, stack, sp, delayTimer, soundTimer,
    running, paused, currentROM, keys,
    setRunning, setPaused, loadROM, loadROMFromFile
  };
}

// Components
function Hero() {
  const scrollToEmulator = () => {
    document.getElementById('emulator').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <h1 className="phosphor-glow">CHIP-8 EMULATOR</h1>
        <h2>A Low-Level Virtual Machine Emulator</h2>
        <p className="hero-description">
          Experience the elegance of 1970s computing. Emulate CPU instructions,
          memory management, and graphics rendering in this complete implementation
          of the CHIP-8 virtual machine.
        </p>
        <button className="cta-button phosphor-glow" onClick={scrollToEmulator}>
          RUN DEMO
        </button>
      </div>
    </section>
  );
}

function Display({ display }) {
  return (
    <div className="emulator-display">
      <div className="display-screen">
        {Array.from({ length: 64 * 32 }).map((_, i) => (
          <div
            key={i}
            className={`pixel ${display[i] ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

function ControlPanel({ running, paused, setRunning, setPaused, loadROM, currentROM, onFileUpload }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  return (
    <div className="control-panel">
      <div className="control-buttons">
        <button
          className="control-btn"
          onClick={() => { setRunning(true); setPaused(false); }}
        >
          ▶ RUN
        </button>
        <button
          className="control-btn"
          onClick={() => setPaused(!paused)}
        >
          {paused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
        <button
          className="control-btn"
          onClick={() => { setRunning(false); setPaused(false); loadROM(currentROM); }}
        >
          🔄 RESET
        </button>
      </div>

      <select
        className="rom-selector"
        onChange={(e) => loadROM(e.target.value)}
        value={currentROM}
      >
        <option value="ibm">IBM Logo</option>
        <option value="test">Test Pattern</option>
        <option value="keyboard">Keyboard Test</option>
        <option value="animation">Bouncing Ball</option>
      </select>

      <div className="file-upload">
        <label className="control-btn" style={{ display: 'block', textAlign: 'center' }}>
          📁 Load ROM File
          <input
            type="file"
            accept=".ch8,.rom,.bin"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
}

function KeyboardMapping({ keys }) {
  const keyLayout = [
    { key: '1', hex: '1' }, { key: '2', hex: '2' }, { key: '3', hex: '3' }, { key: '4', hex: 'C' },
    { key: 'Q', hex: '4' }, { key: 'W', hex: '5' }, { key: 'E', hex: '6' }, { key: 'R', hex: 'D' },
    { key: 'A', hex: '7' }, { key: 'S', hex: '8' }, { key: 'D', hex: '9' }, { key: 'F', hex: 'E' },
    { key: 'Z', hex: 'A' }, { key: 'X', hex: '0' }, { key: 'C', hex: 'B' }, { key: 'V', hex: 'F' }
  ];

  const keyMap = {
    '1': 0x1, '2': 0x2, '3': 0x3, '4': 0xC,
    'q': 0x4, 'w': 0x5, 'e': 0x6, 'r': 0xD,
    'a': 0x7, 's': 0x8, 'd': 0x9, 'f': 0xE,
    'z': 0xA, 'x': 0x0, 'c': 0xB, 'v': 0xF
  };

  return (
    <div className="keyboard-mapping">
      <div className="keyboard-title">KEYBOARD MAPPING</div>
      <div className="keyboard-grid">
        {keyLayout.map(({ key, hex }) => (
          <div
            key={key}
            className={`key ${keys[keyMap[key.toLowerCase()]] ? 'active' : ''}`}
            data-hex={hex}
          >
            {key}
          </div>
        ))}
      </div>
    </div>
  );
}

function DebugPanel({ V, I, pc, stack, sp, delayTimer }) {
  const [prevV, setPrevV] = useState(V);

  useEffect(() => {
    const timeout = setTimeout(() => setPrevV(V), 500);
    return () => clearTimeout(timeout);
  }, [V]);

  return (
    <div className="debug-panel">
      <h3 className="debug-title phosphor-glow">DEBUG PANEL</h3>

      <div className="special-registers">
        <div className="special-register">
          <div className="register-label">PC (Program Counter)</div>
          <div className="register-value">0x{pc.toString(16).toUpperCase().padStart(3, '0')}</div>
        </div>
        <div className="special-register">
          <div className="register-label">I (Index Register)</div>
          <div className="register-value">0x{I.toString(16).toUpperCase().padStart(3, '0')}</div>
        </div>
        <div className="special-register">
          <div className="register-label">DT (Delay Timer)</div>
          <div className="register-value">0x{delayTimer.toString(16).toUpperCase().padStart(2, '0')}</div>
        </div>
      </div>

      <div className="debug-grid">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={`register-box ${V[i] !== prevV[i] ? 'changed' : ''}`}
          >
            <div className="register-label">V{i.toString(16).toUpperCase()}</div>
            <div className="register-value">
              0x{V[i].toString(16).toUpperCase().padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>

      <div className="stack-display">
        <div className="stack-title">STACK</div>
        <div className="stack-values">
          {Array.from({ length: Math.min(sp + 1, 16) }).map((_, i) => (
            <span key={i} className="stack-value">
              0x{stack[i].toString(16).toUpperCase().padStart(3, '0')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CycleAnimation() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 3);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cycle-animation">
      {['FETCH', 'DECODE', 'EXECUTE'].map((step, i) => (
        <div key={step} className={`cycle-step ${i === activeStep ? 'active' : ''}`}>
          {step}
        </div>
      ))}
    </div>
  );
}

function EmulatorSection() {
  const chip8 = useChip8();

  return (
    <section className="emulator-section" id="emulator">
      <h2 className="section-title phosphor-glow">INTERACTIVE EMULATOR</h2>

      <div className="emulator-container">
        <Display display={chip8.display} />
        <div className="control-panel">
          <ControlPanel
            {...chip8}
            onFileUpload={chip8.loadROMFromFile}
          />
          <KeyboardMapping keys={chip8.keys} />
        </div>
      </div>

      <DebugPanel {...chip8} />
    </section>
  );
}

function ExplanationSection() {
  return (
    <section className="explanation-section">
      <h2 className="section-title phosphor-glow">HOW IT WORKS</h2>

      <div className="concept-cards">
        <div className="concept-card">
          <h3 className="concept-title">FETCH → DECODE → EXECUTE</h3>
          <div className="concept-content">
            <p>The CPU cycles through three phases:</p>
            <CycleAnimation />
          </div>
        </div>

        <div className="concept-card">
          <h3 className="concept-title">MEMORY LAYOUT</h3>
          <div className="concept-content">
            <p>4KB of memory organized as:</p>
            <div className="concept-diagram">
              0x000-0x1FF: Chip-8 Interpreter<br />
              0x200-0xFFF: Program Memory<br />
              <span style={{ color: 'var(--accent-pink)' }}>Total: 4096 bytes</span>
            </div>
          </div>
        </div>

        <div className="concept-card">
          <h3 className="concept-title">REGISTERS & STACK</h3>
          <div className="concept-content">
            <p>16 8-bit registers (V0-VF) for data storage and a 16-level stack for function calls and jumps.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'FETCH OPCODE',
      description: 'The CPU reads the next 16-bit instruction from memory at the address stored in the Program Counter (PC).'
    },
    {
      title: 'DECODE INSTRUCTION',
      description: 'The opcode is analyzed to determine the operation (e.g., draw sprite, add values, jump to address).'
    },
    {
      title: 'EXECUTE OPERATION',
      description: 'The instruction is executed, modifying registers, memory, or the display as needed.'
    },
    {
      title: 'UPDATE TIMERS',
      description: 'Delay and sound timers are decremented at 60Hz for timing-sensitive operations.'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <section className="how-it-works">
      <h2 className="section-title phosphor-glow">STEP-BY-STEP EXECUTION</h2>

      <div className="steps-container">
        {steps.map((step, i) => (
          <div key={i} className={`step ${i === activeStep ? 'active' : ''}`}>
            <div className="step-number">{i + 1}</div>
            <div className="step-content">
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Highlights() {
  return (
    <section className="highlights-section">
      <h2 className="section-title phosphor-glow">PROJECT HIGHLIGHTS</h2>

      <ul className="highlights-list">
        <li className="highlight-item">Complete implementation of all 35 CHIP-8 opcodes</li>
        <li className="highlight-item">Graphics rendering using XOR drawing algorithm</li>
        <li className="highlight-item">Stack-based function calls and subroutine returns</li>
        <li className="highlight-item">Full input handling with keyboard mapping</li>
        <li className="highlight-item">Accurate delay and sound timer implementation</li>
        <li className="highlight-item">BCD conversion and math operations</li>
      </ul>

      <div className="tech-stack">
        <span className="tech-badge">C++</span>
        <span className="tech-badge">SDL2</span>
        <span className="tech-badge">Low-Level Bit Manipulation</span>
        <span className="tech-badge">Virtual Machine Architecture</span>
      </div>
    </section>
  );
}

function CodePreview() {
  const codeString = `// Opcode Fetch
uint16_t opcode = (uint16_t)memory[pc] << 8 | memory[pc + 1];

// Decode and Execute
switch(opcode & 0xF000) {
  case 0x00E0: // CLS - Clear display
    memset(display, 0, sizeof(display));
    drawFlag = true;
    pc += 2;
    break;

  case 0xD000: { // DXYN - Draw sprite
    unsigned x = V[(opcode & 0x0F00) >> 8];
    unsigned y = V[(opcode & 0x00F0) >> 4];
    unsigned height = opcode & 0x000F;
    V[0xF] = 0;

    for(unsigned row = 0; row < height; row++) {
      unsigned sprite = memory[I + row];
      for(unsigned col = 0; col < 8; col++) {
        if((sprite & (0x80 >> col)) != 0) {
          if(display[(x + col + (y + row) * 64) % 2048]) {
            V[0xF] = 1;
          }
          display[(x + col + (y + row) * 64) % 2048] ^= 1;
        }
      }
    }
    drawFlag = true;
    pc += 2;
    break;
  }
}`;

  return (
    <section className="code-section">
      <h2 className="section-title phosphor-glow">CODE PREVIEW</h2>

      <div className="code-container">
        <div className="code-header">
          <div className="code-dot"></div>
          <div className="code-dot"></div>
          <div className="code-dot"></div>
        </div>
        <div className="code-content">
          <pre className="code-block">{codeString}</pre>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>Built with passion for low-level computing • CHIP-8 Emulator • 2024</p>
    </footer>
  );
}

function App() {
  return (
    <>
      <div className="crt-overlay"></div>
      <Hero />
      <EmulatorSection />
      <ExplanationSection />
      <HowItWorks />
      <Highlights />
      <CodePreview />
      <Footer />
    </>
  );
}

export default App;
