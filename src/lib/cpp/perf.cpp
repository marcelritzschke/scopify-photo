#include <iostream>
#include <numeric>
#include <utility>
#include "perf.hpp"

namespace perf
{

  Perf::Perf()
  {
    init();
  }

  Perf::~Perf()
  {
  }

  void Perf::init()
  {
    _start_time = std::chrono::high_resolution_clock::now();
    _last_time = std::chrono::high_resolution_clock::now();
  }

  void Perf::mark(std::string identifier)
  {
    auto new_time = std::chrono::high_resolution_clock::now();

    int time_dif = std::chrono::duration_cast<std::chrono::milliseconds>(new_time - _last_time).count();
    float old_avg = _marks[identifier].first;
    int count = _marks[identifier].second + 1;

    float avg = old_avg * (count - 1) / count + time_dif / static_cast<float>(count);
    _marks[identifier] = std::make_pair(avg, count);

#ifdef __PERF_VERBOSE
    std::cout << "====================" << std::endl;
    std::cout << "--> " << identifier << std::endl;
    std::cout << "Perf Marker at " << std::chrono::duration_cast<std::chrono::milliseconds>(new_time - _start_time).count() << "ms" << std::endl;
    std::cout << "Elapsed time = " << std::chrono::duration_cast<std::chrono::milliseconds>(new_time - _last_time).count() << "ms" << std::endl;
    std::cout << "====================" << std::endl;
#endif

    _last_time = new_time;
  }

  void Perf::summary()
  {
    std::cout << "====== Perf Summary ========" << std::endl;

    float total = 0.f;
    for (auto const &[identifier, mark] : _marks)
    {
      std::cout << "--> " << identifier << " | " << mark.first << "ms <--" << std::endl;
      total += mark.first;
    }
    std::cout << "----------------------------" << std::endl;
    std::cout << "Total Runtime --> " << total << "ms | " << 1000.f / total << "fps <--" << std::endl;
    std::cout << "============================" << std::endl;
  }
}