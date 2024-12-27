#pragma once
#include <opencv2/opencv.hpp>
#include <iostream>

template <typename T>
void logMat(std::string &desc, cv::Mat &inp)
{
  int rows = inp.rows;
  int cols = inp.cols;

  std::cout << "Logging " << desc << std::endl;
  std::cout << "Rows = " << rows << std::endl;
  std::cout << "Cols = " << cols << std::endl;

  for (int i = 0; i < rows; i++)
  {
    for (int j = 0; j < cols; j++)
    {
      // if (std::is_same<T, uchar>::value)
      // {
      //   std::cout << static_cast<int>(inp.at<T>(i, j)) << " ";
      // }
      // else
      // {
      std::cout << inp.at<T>(i, j) << " ";
      // }
    }
    std::cout << std::endl;
  }
  std::cout << std::endl;
}