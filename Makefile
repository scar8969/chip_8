# Makefile for CHIP-8 Emulator

CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2

# Try to detect SDL2 using pkg-config
ifeq ($(shell pkg-config --exists sdl2 && echo yes),yes)
    CXXFLAGS += $(shell pkg-config --cflags sdl2)
    LDFLAGS = $(shell pkg-config --libs sdl2)
else
    # Fallback to default SDL2 location
    CXXFLAGS += -I/usr/include/SDL2
    LDFLAGS = -lSDL2
endif

# Source files
SOURCES = main.cpp Chip8.cpp Platform.cpp
OBJECTS = $(SOURCES:.cpp=.o)
EXECUTABLE = chip8

# Default target
all: $(EXECUTABLE)

# Link the executable
$(EXECUTABLE): $(OBJECTS)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(LDFLAGS)

# Compile source files
%.o: %.cpp Chip8.h Platform.h
	$(CXX) $(CXXFLAGS) -c $< -o $@

# Clean build artifacts
clean:
	rm -f $(OBJECTS) $(EXECUTABLE)

# Run the emulator with a test ROM
run: $(EXECUTABLE)
	./$(EXECUTABLE) 10 3 test_rom.ch8

# Install target (optional)
install: $(EXECUTABLE)
	install -m 755 $(EXECUTABLE) /usr/local/bin/

.PHONY: all clean run install