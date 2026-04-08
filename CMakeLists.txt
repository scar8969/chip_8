cmake_minimum_required(VERSION 3.10)
project(chip8)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find SDL2 package
find_package(SDL2 REQUIRED)

# Include SDL2 directories
include_directories(${SDL2_INCLUDE_DIRS})

# Add executable
add_executable(chip8 main.cpp Chip8.cpp Platform.cpp)

# Link SDL2 libraries
target_link_libraries(chip8 ${SDL2_LIBRARIES})

# Copy SDL2.dll to the output directory on Windows
if(WIN32)
    add_custom_command(TARGET chip8 POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different
        $<TARGET_FILE:SDL2::SDL2>
        $<TARGET_FILE_DIR:chip8>)
endif()