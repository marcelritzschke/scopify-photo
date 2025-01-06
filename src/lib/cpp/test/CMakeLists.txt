cmake_minimum_required(VERSION 3.14)
project(vector_scope_live_tests)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
add_definitions(-D__TEST)
# add_definitions(-D__LOG)

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/03597a01ee50ed33e9dfd640b249b4be3799d395.zip
)
# For Windows: Prevent overriding the parent project's compiler/linker settings
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# Setup OpenCV
set(OpenCV_DIR "C:/tools/opencv/build")

find_package(OpenCV REQUIRED)

# Setup library
set(Lib_DIR "${CMAKE_CURRENT_LIST_DIR}/..")

include_directories(${Lib_DIR} ${OpenCV_INCLUDE_DIRS} ${gtest_build_include_dirs})

add_library(
  imageconvert_lib STATIC
  ${Lib_DIR}/transformation.cpp
  ${Lib_DIR}/perf.cpp
)
target_link_libraries(
  imageconvert_lib
  GTest::gtest_main
)

# Setup test
enable_testing()

add_executable(
  transformation_test
  transformation_test.cpp
)
target_link_libraries(
  transformation_test
  imageconvert_lib
  ${OpenCV_LIBS}
  GTest::gtest_main
)

# Copy OpenCV DLLs
file(GLOB OpenCV_DLLS "${OpenCV_LIB_PATH}/../bin/*.dll")
foreach(dll ${OpenCV_DLLS})
  # Copy each DLL to the output directory where the executable is located
  add_custom_command(TARGET transformation_test POST_BUILD
  COMMAND ${CMAKE_COMMAND} -E copy_if_different
  ${dll} $<TARGET_FILE_DIR:transformation_test>)
endforeach()

include(GoogleTest)
gtest_discover_tests(transformation_test)
