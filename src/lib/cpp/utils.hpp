#pragma once
#include <opencv2/opencv.hpp>
#include <iostream>
#include <filesystem>

#ifdef __LOG
#define LOG_RESET utils::logReset()
#define LOG_MAT(desc, inp) utils::logMat(desc, inp)
#else
#define LOG_RESET
#define LOG_MAT(desc, inp)
#endif

namespace utils
{
  static int log_count = 0;

  void logReset()
  {
    log_count = 0;

    if (std::filesystem::exists("log"))
    {
      // std::filesystem::remove_all("log");
    }
    else
    {
      std::filesystem::create_directories("log");
    }
  }

  void logMat(std::string desc, cv::Mat &inp)
  {
    int rows = inp.rows;
    int cols = inp.cols;

    std::cout << "Logging " << desc << std::endl;
    std::cout << "Rows = " << rows << std::endl;
    std::cout << "Cols = " << cols << std::endl;

#ifdef __TEST
    std::cout << inp << std::endl;
#endif

    cv::imwrite("log/" + std::to_string(log_count++) + "_" + desc + ".png", inp);
  }
}