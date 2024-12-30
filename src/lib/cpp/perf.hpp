#pragma once
#include <chrono>
#include <vector>
#include <map>

#ifdef __PERF
#define PERF_INIT perf::Perf::getInstance().init()
#define PERF_MARK(identifier) perf::Perf::getInstance().mark(identifier)
#define PERF_SUMMARY perf::Perf::getInstance().summary()
#else
#define PERF_INIT
#define PERF_MARK(identifier)
#define PERF_SUMMARY
#endif

namespace perf
{
  typedef std::chrono::steady_clock::time_point timestamp;

  class Perf
  {
  private:
    timestamp _start_time{};
    timestamp _last_time{};
    std::map<std::string, std::pair<float, int>> _marks{};

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

    void init();
    void mark(std::string identifier);
    void summary();
  };
}