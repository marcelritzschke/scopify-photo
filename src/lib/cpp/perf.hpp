#pragma once
#include <chrono>

#ifdef __PERF
#define PERF_MARK(identifier) perf::Perf::getInstance().mark(identifier)
#else
#define PERF_MARK(identifier)
#endif

namespace perf
{
  class Perf
  {
  private:
    std::chrono::steady_clock::time_point start_time;
    std::chrono::steady_clock::time_point last_time;

    Perf();
    ~Perf();

  public:
    static Perf &getInstance()
    {
      static Perf instance;
      return instance;
    }

    Perf(Perf const &) = delete;
    void operator=(Perf const &) = delete;

    void mark(std::string identifier = "");
  };
}