#include <utils.hpp>
#include "transformation.hpp"

namespace transformation
{
  typedef cv::Vec4b Pixel_RGBA;
  typedef cv::Vec3b Pixel_RGB;
  typedef cv::Point3f Pixel_HSV;

  void downSample(const cv::Mat &rgba_image, cv::Mat &rgba_downsampled_image, int factor)
  {
    int downsampled_size = rgba_image.rows / factor;
    if (downsampled_size <= 0)
    {
      return;
    }

    rgba_image.forEach<Pixel_RGBA>([&rgba_downsampled_image, factor](Pixel_RGBA &rgba_pixel, const int *position) -> void
                                   {
                                    int current_index = position[0];
                                    if (current_index % factor == 0)
                                    {
                                      const int target_index = current_index / factor;
                                      rgba_downsampled_image.at<Pixel_RGBA>(target_index, 0) = rgba_pixel;
                                    } });
  }

  /* Using gridbinning still to slow because of mutex for accumulation arrays */
  std::mutex mtx;
  void gridBinning(const cv::Mat &hsv_image, cv::Mat &hsv_grid, int gridSizeX, int gridSizeY)
  {
    cv::Mat sumH = cv::Mat::zeros(gridSizeX, gridSizeY, CV_32F);
    cv::Mat sumS = cv::Mat::zeros(gridSizeX, gridSizeY, CV_32F);
    cv::Mat sumV = cv::Mat::zeros(gridSizeX, gridSizeY, CV_32F);
    cv::Mat count = cv::Mat::zeros(gridSizeX, gridSizeY, CV_32F);

    hsv_image.forEach<Pixel_HSV>([gridSizeX, gridSizeY, &sumH, &sumS, &sumV, &count](Pixel_HSV &pixel, const int *position) -> void
                                 {

      // std::cout << "gridsize = (" << gridSizeX << ", " << gridSizeY << ")" << std::endl;
      // std::cout << "pixel = (" << pixel.x << ", " << pixel.y << ", " << pixel.z << ")" << std::endl;

      int h_idx = static_cast<int>(pixel.x / 360.f * gridSizeX);
      int s_idx = static_cast<int>(pixel.y * gridSizeY);

      // std::cout << "h_idx = " << h_idx << " s_idx = " << s_idx << std::endl;

      h_idx = std::min(h_idx, gridSizeX - 1);
      s_idx = std::min(s_idx, gridSizeY - 1);

      // std::cout << "x=" << pixel.x << " y=" << pixel.y << " z=" << pixel.z << std::endl;
      std::lock_guard<std::mutex> lock(mtx);
      sumH.at<float>(h_idx, s_idx) += pixel.x;
      sumS.at<float>(h_idx, s_idx) += pixel.y;
      sumV.at<float>(h_idx, s_idx) += pixel.z;
      count.at<float>(h_idx, s_idx) += 1.0f; });

    // Compute the average for each grid cell where count > 0
    cv::Mat avgH = sumH / count / 2.f / 255.f; // scale to [0, 180] then convert back to float since later we need to convert all channels back to uchar where we multiply 255
    cv::Mat avgS = sumS / count;
    cv::Mat avgV = sumV / count;

    cv::merge(std::vector<cv::Mat>{avgH, avgS, avgV}, hsv_grid);
  }

  void convertImage(int num_pixels, uint8_t *data, std::vector<char> &dst, int downsampling, int dim_x, int dim_y)
  {
    // Create an OpenCV Mat from the RGBA data
    cv::Mat rgba_image(num_pixels, 1, CV_8UC4, data);
    logMat<cv::Vec4b>(std::string("RGBA Image"), rgba_image);

    // Downsampling
    cv::Mat rgba_downsampled_image(num_pixels / downsampling, 1, CV_8UC4);
    if (downsampling > 1)
    {
      transformation::downSample(rgba_image, rgba_downsampled_image, downsampling);
    }
    else
    {
      rgba_downsampled_image = rgba_image;
    }
    logMat<cv::Vec4b>(std::string("RGBA Downsampled Image"), rgba_downsampled_image);

    // Convert RGBA to RGB by dropping the alpha channel
    cv::Mat rgb_image;
    cv::cvtColor(rgba_downsampled_image, rgb_image, cv::COLOR_RGBA2RGB);
    logMat<cv::Vec3b>(std::string("RGB Image"), rgb_image);

    cv::Mat normalized_image;
    rgb_image.convertTo(normalized_image, CV_32F, 1.0 / 255.0); // Normalize to [0, 1]
    logMat<cv::Vec3f>(std::string("normalized_image"), normalized_image);

    // Convert RGB to HSV
    cv::Mat hsv_image;
    cv::cvtColor(normalized_image, hsv_image, cv::COLOR_RGB2HSV_FULL);
    logMat<cv::Vec3f>(std::string("hsv_image"), hsv_image);

    // Generate 2D hsv grid
    cv::Mat hsv_grid;
    transformation::gridBinning(hsv_image, hsv_grid, dim_x, dim_y);
    hsv_grid.convertTo(hsv_grid, CV_8UC3, 255);
    logMat<cv::Vec3b>(std::string("hsv_grid"), hsv_grid);

    // Convert pixels back to RGBA
    cv::Mat rgb_image_post;
    cv::cvtColor(hsv_grid, rgb_image_post, cv::COLOR_HSV2RGB);
    logMat<cv::Vec3b>(std::string("rgb_image_post"), rgb_image_post);

    cv::Mat rgba_image_post;
    cv::cvtColor(rgb_image_post, rgba_image_post, cv::COLOR_RGB2RGBA);
    logMat<cv::Vec4b>(std::string("rgba_image_post"), rgba_image_post);

    // dst.resize(rgba_image_post.total() * rgba_image_post.elemSize());
    // memcpy(dst.data(), rgba_image_post.data, dst.size());
  }

}