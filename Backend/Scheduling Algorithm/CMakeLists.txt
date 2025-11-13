cmake_minimum_required(VERSION 3.16)
project(TimetableSolver CXX)

# 1) Tell CMake to look under Homebrew’s prefix:
list(APPEND CMAKE_PREFIX_PATH "/opt/homebrew")

# 2) Find the OR-Tools package
find_package(ortools REQUIRED)

# 3) Our executable
add_executable(timetable_solver timetable_solver.cpp)

# 4) Link against the imported OR-Tools target
target_link_libraries(timetable_solver PRIVATE ortools::ortools)

# 5) (Optional) set C++ standard
target_compile_features(timetable_solver PRIVATE cxx_std_17)
