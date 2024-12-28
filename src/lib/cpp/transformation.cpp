#include <cmath>
#include "transformation.hpp"
#include "perf.hpp"

#ifdef __LOG
#include "utils.hpp"
#endif

namespace transformation
{
  typedef cv::Vec4b Pixel_RGBA;
  typedef cv::Vec3b Pixel_RGB;
  typedef cv::Point3f Pixel_HSV;

  constexpr float pi = 3.14159265358979323846f;
  static std::mutex mutices[512][512] = {}; // TODO: dynamic number of mutices or accept limit

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

  void prepareMutex(int gridSizeX, int gridSizeY)
  {
  }

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

      cv::Vec2f coordinates(cosf(pixel.x * pi / 180), sinf(pixel.x * pi / 180));
      coordinates = (pixel.y * coordinates + cv::Vec2f(1.f, 1.f)) / 2.f;
      // std::cout << coordinates << std::endl;

      int x_idx = static_cast<int>(coordinates[0] * gridSizeX);
      int y_idx = static_cast<int>(coordinates[1] * gridSizeY);

      // std::cout << "x_idx = " << x_idx << " y_idx = " << y_idx << std::endl;

      x_idx = std::min(x_idx, gridSizeX - 1);
      y_idx = std::min(y_idx, gridSizeY - 1);

      // std::cout << "x=" << pixel.x << " y=" << pixel.y << " z=" << pixel.z << std::endl;
      std::lock_guard<std::mutex> lock(mutices[x_idx][y_idx]);
      sumH.at<float>(x_idx, y_idx) += pixel.x;
      sumS.at<float>(x_idx, y_idx) += pixel.y;
      sumV.at<float>(x_idx, y_idx) += pixel.z;
      count.at<float>(x_idx, y_idx) += 1.0f; });

    // Compute the average for each grid cell where count > 0
    cv::Mat avgH = sumH / count / 2.f / 255.f; // scale to [0, 180] then convert back to float since later we need to convert all channels back to uchar where we multiply 255
    cv::Mat avgS = sumS / count;
    cv::Mat avgV = sumV / count;

    cv::merge(std::vector<cv::Mat>{avgH, avgS, avgV}, hsv_grid);
  }

  void convertImage(int num_pixels, uint8_t *data, std::vector<uchar> &dst, int downsampling, int dim_x, int dim_y)
  {
    PERF_MARK("Convert Image Start");

    // Create an OpenCV Mat from the RGBA data
    cv::Mat rgba_image(num_pixels, 1, CV_8UC4, data);
#ifdef __LOG
    logMat<cv::Vec4b>(std::string("RGBA Image"), rgba_image);
#endif
    PERF_MARK("RGBA Image");

    // Downsampling
    cv::Mat rgba_downsampled_image(num_pixels / downsampling, 1, CV_8UC4);
    if (downsampling > 1)
    {
      transformation::downSample(rgba_image, rgba_downsampled_image, downsampling);
    }
    else
    {
      rgba_downsampled_image = std::move(rgba_image);
    }
#ifdef __LOG
    logMat<cv::Vec4b>(std::string("RGBA Downsampled Image"), rgba_downsampled_image);
#endif
    PERF_MARK("RGBA Downsampled Image");

    // Convert RGBA to RGB by dropping the alpha channel
    cv::Mat rgb_image;
    cv::cvtColor(rgba_downsampled_image, rgb_image, cv::COLOR_RGBA2RGB);
#ifdef __LOG
    logMat<cv::Vec3b>(std::string("rgb_image"), rgb_image);
#endif
    PERF_MARK("rgb_image");

    cv::Mat normalized_image;
    rgb_image.convertTo(normalized_image, CV_32F, 1.0 / 255.0); // Normalize to [0, 1]
#ifdef __LOG
    logMat<cv::Vec3f>(std::string("normalized_image"), normalized_image);
#endif
    PERF_MARK("normalized_image");

    // Convert RGB to HSV
    cv::Mat hsv_image;
    cv::cvtColor(normalized_image, hsv_image, cv::COLOR_RGB2HSV_FULL);
#ifdef __LOG
    logMat<cv::Vec3f>(std::string("hsv_image"), hsv_image);
#endif
    PERF_MARK("hsv_image");

    // Generate 2D hsv grid
    cv::Mat hsv_grid;
    transformation::gridBinning(hsv_image, hsv_grid, dim_x, dim_y);
    hsv_grid.convertTo(hsv_grid, CV_8UC3, 255);
#ifdef __LOG
    logMat<cv::Vec3b>(std::string("hsv_grid"), hsv_grid);
#endif
    PERF_MARK("hsv_grid");

    // Convert pixels back to RGBA
    cv::Mat rgb_image_post;
    cv::cvtColor(hsv_grid, rgb_image_post, cv::COLOR_HSV2RGB);
#ifdef __LOG
    logMat<cv::Vec3b>(std::string("rgb_image_post"), rgb_image_post);
#endif
    PERF_MARK("rgb_image_post");

    cv::Mat rgba_image_post;
    cv::cvtColor(rgb_image_post, rgba_image_post, cv::COLOR_RGB2RGBA);
#ifdef __LOG
    logMat<cv::Vec4b>(std::string("rgba_image_post"), rgba_image_post);
#endif
    PERF_MARK("rgba_image_post");

    dst.insert(dst.begin(), rgba_image_post.datastart, rgba_image_post.dataend);

    PERF_MARK("Convert Image End");
  }

}