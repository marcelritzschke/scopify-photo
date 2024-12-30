#include <cmath>
#include <stdexcept>
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

  static std::mutex mutices[256][256] = {}; // TODO: dynamic number of mutices or accept limit

  Transformation::Transformation(int grid_size_x, int grid_size_y) : _grid_size_x{grid_size_x}, _grid_size_y{grid_size_y}
  {
    if (_grid_size_x < _min_grid_size_x || _grid_size_x > _max_grid_size_x)
    {
      throw std::invalid_argument("Invalid grid size. Needs to be between " + std::to_string(_min_grid_size_x) + " and " + std::to_string(_max_grid_size_x));
    }

    if (_grid_size_y < _min_grid_size_y || _grid_size_y > _max_grid_size_y)
    {
      throw std::invalid_argument("Invalid grid size. Needs to be between " + std::to_string(_min_grid_size_y) + " and " + std::to_string(_max_grid_size_y));
    }

    computeHSLookupTable();
  }

  void Transformation::downSample(const cv::Mat &rgba_image, cv::Mat &rgba_downsampled_image, int factor)
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

  void Transformation::makeTransparent(cv::Mat &rgba_image)
  {
    rgba_image.forEach<Pixel_RGBA>([&](Pixel_RGBA &rgba_pixel, const int *position) -> void
                                   {
                                    if (rgba_pixel[0] == 0 && rgba_pixel[1] == 0 && rgba_pixel[2] == 0)
                                    {
                                      rgba_image.at<Pixel_RGBA>(position[0], position[1])[3] = 0.f;
                                    } });
  }

  void Transformation::computeHSLookupTable()
  {
    _hs_lut = cv::Mat(_grid_size_x, _grid_size_y, CV_32FC2);
    _hs_lut.forEach<cv::Point2f>([&](cv::Point2f &hs_values, const int *position) -> void
                                 {
                                   int x_idx = position[1];
                                   int y_idx = position[0];

                                   float step_size_x = 2.f / _grid_size_x;
                                   float step_size_y = 2.f / _grid_size_y;

                                   float x_coord = step_size_x * (x_idx + 0.5);
                                   float y_coord = step_size_y * (y_idx + 0.5);

                                   // Transform to center of circle
                                   x_coord -= 1.f;
                                   y_coord -= 1.f;

                                   // we take -x since below we add pi and want to have still 0 degree at (1, 0)
                                   float h = atan2(y_coord, -x_coord); // [-pi, pi]
                                   float s = sqrtf(powf(x_coord, 2) + powf(y_coord, 2));

                                   // scale to [0, 180] then convert back to float since later we need to convert all channels back to uchar where we multiply 255
                                   h = (h + pi) / 2.f;       // [0, pi]
                                   h = h * 180 / pi / 255.f; // [0, 180] / 255.f

                                   _hs_lut.at<cv::Point2f>(x_idx, y_idx) = cv::Point2f(h, s);

                                   // Lambda end
                                 });
  }

  cv::Vec2i Transformation::hs2xy(cv::Vec2f &hs)
  {
    cv::Vec2f coordinates(cosf((hs[0]) * pi / 180), sinf((hs[0]) * pi / 180));

    coordinates[1] *= -1.f; // HTML5 canvas y axis is mirrored
    coordinates = (hs[1] * coordinates + cv::Vec2f(1.f, 1.f)) / 2.f;
    //  std::cout << "coord = " << coordinates << std::endl;

    int x_idx = static_cast<int>(coordinates[1] * _grid_size_x);
    int y_idx = static_cast<int>(coordinates[0] * _grid_size_y);

    //  std::cout << "x_idx = " << x_idx << " y_idx = " << y_idx << std::endl;

    x_idx = std::min(x_idx, _grid_size_x - 1);
    y_idx = std::min(y_idx, _grid_size_y - 1);

    return cv::Vec2i(x_idx, y_idx);
  }

  void Transformation::getHSPopulation(const cv::Mat &hsv_image, cv::Mat &hs_grid)
  {
    std::atomic<bool> hs_population[MAX_GRID_SIZE_X][MAX_GRID_SIZE_Y] = {}; // TODO: dynamic number of mutices or accept limit
    hs_grid = cv::Mat::zeros(_hs_lut.rows, _hs_lut.cols, CV_32FC3);

    // std::cout << "hsv_image" << std::endl
    //           << hsv_image << std::endl;

    hsv_image.forEach<Pixel_HSV>([&](Pixel_HSV &pixel, const int *position) -> void
                                 {
                                   // std::cout << "gridsize = (" << _grid_size_x << ", " << _grid_size_y << ")" << std::endl;
                                   // std::cout << "pixel = (" << pixel.x << ", " << pixel.y << ", " << pixel.z << ")" << std::endl;
                                   cv::Vec2f hs(pixel.x, pixel.y);
                                   cv::Vec2i xy = hs2xy(hs);

                                   // std::cout << "x=" << pixel.x << " y=" << pixel.y << " z=" << pixel.z << std::endl;
                                   hs_population[xy[0]][xy[1]].store(true); });

    // for (size_t i = 0; i < _grid_size_y; i++)
    // {
    //   for (size_t j = 0; j < _grid_size_x; j++)
    //   {
    //     std::cout << hs_population[i][j] << " ";
    //   }
    //   std::cout << std::endl;
    // }

    _hs_lut.forEach<cv::Point2f>([&](cv::Point2f &hs_value, const int *position) -> void
                                 {
                                   int x_idx = position[1];
                                   int y_idx = position[0];

                                   float h = hs_value.x;
                                   float s = hs_value.y;

                                   if (hs_population[x_idx][y_idx])
                                   {
                                     hs_grid.at<cv::Point3f>(x_idx, y_idx) = cv::Point3f(h, s, 1.f);
                                   }
                                   else
                                   {
                                     hs_grid.at<cv::Point3f>(x_idx, y_idx) = cv::Point3f(0.f, 0.f, 0.f);
                                   }

                                   // End Lambda
                                 });
  }

  void Transformation::gridBinning(const cv::Mat &hsv_image, cv::Mat &hsv_grid)
  {
    cv::Mat sumH = cv::Mat::zeros(_grid_size_x, _grid_size_y, CV_32F);
    cv::Mat sumS = cv::Mat::zeros(_grid_size_x, _grid_size_y, CV_32F);
    cv::Mat sumV = cv::Mat::zeros(_grid_size_x, _grid_size_y, CV_32F);
    cv::Mat count = cv::Mat::zeros(_grid_size_x, _grid_size_y, CV_32F);

    hsv_image.forEach<Pixel_HSV>([&](Pixel_HSV &pixel, const int *position) -> void
                                 {
                                   // std::cout << "gridsize = (" << _grid_size_x << ", " << _grid_size_y << ")" << std::endl;
                                   // std::cout << "pixel = (" << pixel.x << ", " << pixel.y << ", " << pixel.z << ")" << std::endl;

                                   cv::Vec2f coordinates(cosf((pixel.x) * pi / 180), sinf((pixel.x) * pi / 180));
                                   coordinates = (pixel.y * coordinates + cv::Vec2f(1.f, 1.f)) / 2.f;
                                   // std::cout << coordinates << std::endl;

                                   int x_idx = static_cast<int>(coordinates[0] * _grid_size_x);
                                   int y_idx = static_cast<int>(coordinates[1] * _grid_size_y);

                                   // std::cout << "x_idx = " << x_idx << " y_idx = " << y_idx << std::endl;

                                   x_idx = std::min(x_idx, _grid_size_x - 1);
                                   y_idx = std::min(y_idx, _grid_size_y - 1);

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

  void Transformation::convertImage(int num_pixels, uint8_t *data, std::vector<uchar> &dst, int width, int height, int target_width, int target_height, bool use_lut)
  {
    PERF_MARK("Convert Image Start");

    /*************************************************************************
     *
     * Create an OpenCV Mat from the RGBA data
     *
     *************************************************************************/
    cv::Mat rgba_image(width, height, CV_8UC4, data);
#ifdef __LOG
    logMat<cv::Vec4b>(std::string("RGBA Image"), rgba_image);
#endif
    PERF_MARK("RGBA Image");

    /*************************************************************************
     *
     * Optional Downsampling if pixel count > MAX_PIXEL_COUNT
     *
     *************************************************************************/
    float factor = std::min(1.f, sqrtf(static_cast<float>(MAX_PIXEL_COUNT) / num_pixels));
    cv::Mat rgba_downsampled_image;
    cv::resize(rgba_image, rgba_downsampled_image, cv::Size(), factor, factor, cv::INTER_AREA);

#ifdef __LOG
    logMat<cv::Vec4b>(std::string("RGBA Downsampled Image"), rgba_downsampled_image);
#endif
    PERF_MARK("RGBA Downsampled Image");

    /*************************************************************************
     *
     * Convert RGBA to RGB by dropping the alpha channel
     *
     *************************************************************************/
    cv::Mat rgb_image;
    cv::cvtColor(rgba_downsampled_image, rgb_image, cv::COLOR_RGBA2RGB);
#ifdef __LOG
    logMat<cv::Vec3b>(std::string("rgb_image"), rgb_image);
#endif
    PERF_MARK("rgb_image");

    /*************************************************************************
     *
     * Normalize all channels to [0, 1]
     *
     *************************************************************************/
    cv::Mat normalized_image;
    rgb_image.convertTo(normalized_image, CV_32F, 1.0 / 255.0);
#ifdef __LOG
    logMat<cv::Vec3f>(std::string("normalized_image"), normalized_image);
#endif
    PERF_MARK("normalized_image");

    /*************************************************************************
     *
     * Convert RGB to HSV
     * Range H [0, 360] since we input RGB as floats otherwise would be [0,255]
     * S, V [0, 1]
     *
     *************************************************************************/
    cv::Mat hsv_image;
    cv::cvtColor(normalized_image, hsv_image, cv::COLOR_RGB2HSV_FULL);
#ifdef __LOG
    logMat<cv::Vec3f>(std::string("hsv_image"), hsv_image);
#endif
    PERF_MARK("hsv_image");

    /*************************************************************************
     *
     * Generate 2D hsv grid by binning hsv values into a 2D cartesian grid
     * The resulting grid can be directly drawn onto canvas after color
     * conversion
     *
     *************************************************************************/
    cv::Mat hsv_grid;
    if (use_lut)
    {
      getHSPopulation(hsv_image, hsv_grid);
    }
    else
    {
      gridBinning(hsv_image, hsv_grid);
    }
    hsv_grid.convertTo(hsv_grid, CV_8UC3, 255);
#ifdef __LOG
    logMat<cv::Vec3b>(std::string("hsv_grid"), hsv_grid);
#endif
    PERF_MARK("hsv_grid");

    /*************************************************************************
     *
     * Convert pixels back to RGBA
     *
     *************************************************************************/
    cv::Mat rgb_image_post;
    cv::cvtColor(hsv_grid, rgb_image_post, cv::COLOR_HSV2RGB);
#ifdef __LOG
    logMat<cv::Vec3b>(std::string("rgb_image_post"), rgb_image_post);
#endif
    PERF_MARK("rgb_image_post");

    /*************************************************************************
     *
     * Add alpha channel but make unassigned transparent
     *
     *************************************************************************/
    cv::Mat rgb_with_alpha;
    cv::cvtColor(rgb_image_post, rgb_with_alpha, cv::COLOR_RGB2RGBA);
#ifdef __LOG
    logMat<cv::Vec4b>(std::string("rgb_with_alpha"), rgb_with_alpha);
#endif
    PERF_MARK("rgb_with_alpha");

    makeTransparent(rgb_with_alpha);
#ifdef __LOG
    logMat<cv::Vec4b>(std::string("rgb_with_alpha_transparent"), rgb_with_alpha);
#endif
    PERF_MARK("rgb_with_alpha_transparent");

    /*************************************************************************
     *
     * Rotate the resulting image, so that blue is at 0 degree
     * // TODO: figure out the math and include in LUT calculation
     *
     *************************************************************************/
    cv::Mat rgba_rotated;
    cv::Mat rot = cv::getRotationMatrix2D(cv::Vec2f(rgb_with_alpha.cols / 2.f, rgb_with_alpha.rows / 2.f), 120, 1.f);
    cv::warpAffine(rgb_with_alpha, rgba_rotated, rot, rgba_rotated.size());
    PERF_MARK("rgba_rotated");

    /*************************************************************************
     *
     * Add some blur to smoothen the points into each other
     *
     *************************************************************************/
    cv::Mat rgba_blurred;
    cv::GaussianBlur(rgba_rotated, rgba_blurred, cv::Size2i(3, 3), 0);
    PERF_MARK("rgba_blurred");

    /*************************************************************************
     *
     * Add some blur to smoothen the points into each other
     *
     *************************************************************************/
    cv::Mat rgba_scaled;
    cv::resize(rgba_blurred, rgba_scaled, cv::Size(), static_cast<float>(target_width) / _grid_size_x, static_cast<float>(target_height) / _grid_size_y, cv::INTER_AREA);
    PERF_MARK("rgba_blurred");

    /*************************************************************************
     *
     * Final RGBA color map will be copied into dst
     *
     *************************************************************************/
    dst.insert(dst.begin(), rgba_scaled.datastart, rgba_scaled.dataend);
    PERF_MARK("Convert Image End");
  }
}