#pragma once
#include <opencv2/opencv.hpp>

namespace transformation
{
    void downSample(const cv::Mat &rgba_image, cv::Mat &rgba_downsampled_image, int factor);
    void gridBinning(const cv::Mat &hsv_image, cv::Mat &hsv_grid, int gridSizeX, int gridSizeY);
    void convertImage(int num_pixels, uint8_t *data, std::vector<char> &dst, int downsampling, int dim_x, int dim_y);
}