#include <iostream>
#include "perf.hpp"

namespace perf
{
  Perf::Perf()
  {
    start_time = std::chrono::high_resolution_clock::now();
    last_time = std::chrono::high_resolution_clock::now();
  }

  Perf::~Perf()
  {
  }

  void Perf::mark(std::string identifier)
  {
    auto new_time = std::chrono::high_resolution_clock::now();
    std::cout << "====================" << std::endl;
    std::cout << "--> " << identifier << std::endl;
    std::cout << "Perf Marker at " << std::chrono::duration_cast<std::chrono::milliseconds>(new_time - start_time).count() << "ms" << std::endl;
    std::cout << "Elapsed time = " << std::chrono::duration_cast<std::chrono::milliseconds>(new_time - last_time).count() << "ms" << std::endl;
    std::cout << "====================" << std::endl;
    last_time = new_time;
  }
}