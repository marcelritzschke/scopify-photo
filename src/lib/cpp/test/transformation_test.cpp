#include <gtest/gtest.h>
#include <opencv2/opencv.hpp>
#include <transformation.hpp>

using std::cout;
using std::endl;

class DownSamplingTest : public ::testing::Test
{
protected:
  void SetUp() override
  {
    rgba_image = cv::Mat(10, 1, CV_8UC4);

    for (int i = 0; i < rgba_image.rows; ++i)
    {
      cv::Vec4b &pixel = rgba_image.at<cv::Vec4b>(i, 0);
      pixel = cv::Vec4b(i * 10, i * 20, i * 30, 255); // R, G, B, A
    }
  }
  cv::Mat rgba_image;
};

TEST_F(DownSamplingTest, TestDownSamplingWithFactor)
{
  cv::Mat rgba_downsampled_image = cv::Mat::zeros(5, 1, CV_8UC4);
  transformation::downSample(rgba_image, rgba_downsampled_image, 2);

  ASSERT_EQ(rgba_downsampled_image.rows, 5);
  for (int i = 0; i < rgba_downsampled_image.rows; ++i)
  {
    cv::Vec4b expected_pixel(i * 20, i * 40, i * 60, 255); // The pixel values should be downsampled (factor 2)
    ASSERT_EQ(rgba_downsampled_image.at<cv::Vec4b>(i, 0), expected_pixel);
  }
};

TEST_F(DownSamplingTest, NoDownsampling)
{
  cv::Mat rgba_downsampled_image = cv::Mat::zeros(10, 1, CV_8UC4); // Expected downsampled size: 10 rows (10 / 1)
  transformation::downSample(rgba_image, rgba_downsampled_image, 1);

  // Check if the downsampled image has the correct size (should be same as original image)
  ASSERT_EQ(rgba_downsampled_image.rows, 10);

  // Check if the pixels are identical to the original image
  for (int i = 0; i < rgba_downsampled_image.rows; ++i)
  {
    cv::Vec4b expected_pixel(i * 10, i * 20, i * 30, 255);
    ASSERT_EQ(rgba_downsampled_image.at<cv::Vec4b>(i, 0), expected_pixel);
  }
}

TEST_F(DownSamplingTest, FactorGreaterThanRows)
{
  cv::Mat rgba_downsampled_image = cv::Mat::zeros(0, 1, CV_8UC4); // Expected downsampled size: 0 rows (10 / 15, rounded down)
  transformation::downSample(rgba_image, rgba_downsampled_image, 15);

  // Check if the downsampled image has the expected size (should be 0 rows)
  ASSERT_EQ(rgba_downsampled_image.rows, 0);
}

TEST_F(DownSamplingTest, NonDivisibleFactor)
{
  cv::Mat rgba_downsampled_image = cv::Mat::zeros(4, 1, CV_8UC4); // Expected downsampled size: 3 rows (10 / 3, rounded down)
  transformation::downSample(rgba_image, rgba_downsampled_image, 3);

  // Check if the downsampled image has the correct size
  ASSERT_EQ(rgba_downsampled_image.rows, 4);

  // Check the values at the downsampled pixels
  for (int i = 0; i < rgba_downsampled_image.rows; ++i)
  {
    cv::Vec4b expected_pixel(i * 30, i * 60, i * 90, 255); // The pixel values should be downsampled by factor 3
    ASSERT_EQ(rgba_downsampled_image.at<cv::Vec4b>(i, 0), expected_pixel);
  }
}

class GridBinningTest : public ::testing::Test
{
protected:
  void SetUp() override
  {
  }

  void fillHSVImage(const std::vector<cv::Point3f> &pixels)
  {
    hsv_image = cv::Mat(pixels.size(), 1, CV_32FC3);
    for (int i = 0; i < pixels.size(); ++i)
    {
      hsv_image.at<cv::Vec3f>(i, 0) = cv::Vec3f(pixels[i].x, pixels[i].y, pixels[i].z);
    }
  }

  cv::Mat hsv_image;
};

TEST_F(GridBinningTest, BasicFunctionality)
{
  fillHSVImage({{100.0f, 0.5f, 0.5f}, {150.0f, 0.7f, 0.8f}, {200.0f, 0.6f, 0.4f}, {50.0f, 0.3f, 0.9f}});

  // Apply grid binning
  cv::Mat hsv_grid;
  transformation::gridBinning(hsv_image, hsv_grid, 1, 1); // Using a 1x1 grid for simplicity

  // Verify output dimensions (should match the grid size)
  EXPECT_EQ(hsv_grid.rows, 1);
  EXPECT_EQ(hsv_grid.cols, 1);

  // Extract the average values for H, S, V
  cv::Vec3f avg = hsv_grid.at<cv::Vec3f>(0, 0);
  EXPECT_FLOAT_EQ(avg[0], 125.0f); // Average of H: (100 + 150 + 200 + 50) / 4
  EXPECT_FLOAT_EQ(avg[1], 0.525f); // Average of S: (0.5 + 0.7 + 0.6 + 0.3) / 4
  EXPECT_FLOAT_EQ(avg[2], 0.65f);  // Average of V: (0.5 + 0.8 + 0.4 + 0.9) / 4
}

TEST_F(GridBinningTest, SmallGrid)
{
  // TODO: 1.41f factor comes from assumption that hue is [0, 255] but it is [0, 360] --> replace the numbers
  fillHSVImage({{20.0f * 1.41f, 0.2f, 0.5f},    // (0,0)
                {40.0f * 1.41f, 0.1f, 0.7f},    // (0,0)
                {60.0f * 1.41f, 0.3f, 0.3f},    // (0,0)
                {180.0f * 1.41f, 0.1f, 0.2f},   // (2,0)
                {255.0f * 1.41f, 0.3f, 0.2f},   // (2,0)
                {100.0f * 1.41f, 0.5f, 0.8f},   // (1,1)
                {180.0f * 1.41f, 0.9f, 0.6f},   // (2,2)
                {190.0f * 1.41f, 0.8f, 0.5f},   // (2,2)
                {200.0f * 1.41f, 0.7f, 0.8f}}); // (2,2)

  // Apply grid binning
  cv::Mat hsv_grid;
  transformation::gridBinning(hsv_image, hsv_grid, 3, 3);

  // Verify output dimensions (should match the grid size)
  EXPECT_EQ(hsv_grid.rows, 3);
  EXPECT_EQ(hsv_grid.cols, 3);

  cv::Vec3f avg00 = hsv_grid.at<cv::Vec3f>(0, 0); // top-left cell
  EXPECT_FLOAT_EQ(avg00[0], (20.0f * 1.41f + 40.0f * 1.41f + 60.0f * 1.41f) / 3);
  EXPECT_FLOAT_EQ(avg00[1], (0.2f + 0.1f + 0.3f) / 3);
  EXPECT_FLOAT_EQ(avg00[2], (0.5f + 0.7f + 0.3f) / 3);

  cv::Vec3f avg20 = hsv_grid.at<cv::Vec3f>(2, 0);
  EXPECT_FLOAT_EQ(avg20[0], (180.0f * 1.41f + 255.0f * 1.41f) / 2);
  EXPECT_FLOAT_EQ(avg20[1], (0.1f + 0.3f) / 2);
  EXPECT_FLOAT_EQ(avg20[2], (0.2f + 0.2f) / 2);

  cv::Vec3f avg11 = hsv_grid.at<cv::Vec3f>(1, 1);
  EXPECT_FLOAT_EQ(avg11[0], (100.0f * 1.41f) / 1);
  EXPECT_FLOAT_EQ(avg11[1], (0.5f) / 1);
  EXPECT_FLOAT_EQ(avg11[2], (0.8f) / 1);

  cv::Vec3f avg22 = hsv_grid.at<cv::Vec3f>(2, 2);
  EXPECT_FLOAT_EQ(avg22[0], (180.0f * 1.41f + 190.0f * 1.41f + 200.0f * 1.41f) / 3);
  EXPECT_FLOAT_EQ(avg22[1], (0.7f + 0.8f + 0.9f) / 3);
  EXPECT_FLOAT_EQ(avg22[2], (0.6f + 0.5f + 0.8f) / 3);

  // cv::Vec3f avg02 = hsv_grid.at<cv::Vec3f>(0, 2);
  // EXPECT_FLOAT_EQ(avg02[0], 0.f);
  // EXPECT_FLOAT_EQ(avg02[1], 0.f);
  // EXPECT_FLOAT_EQ(avg02[2], 0.f);
}

class ConvertImageTest : public ::testing::Test
{
protected:
  void SetUp() override
  {
  }
  std::vector<char> hsv_flat;
};

TEST_F(ConvertImageTest, TestSimple)
{
  int num_pixels = 4;
  uint8_t data[] = {
      255, 0, 0, 255,  // 1st Red = (0, 1, 1)
      0, 255, 0, 255,  // 2nd Green = (120, 1, 1)
      0, 0, 255, 255,  // 3rd Blue = (240, 1, 1)
      255, 0, 255, 255 // 4th Pink = (300, 1, 1)
  };

  transformation::convertImage(num_pixels, data, hsv_flat, 1, 4, 4);

  for (size_t i = 0; i < 100; i++)
  {
    cout << hsv_flat[i] << " at " << i << endl;
  }
};
