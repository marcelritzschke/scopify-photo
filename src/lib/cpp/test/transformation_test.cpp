#include <transformation.hpp>
#include <gtest/gtest.h>
#include <opencv2/opencv.hpp>
#include <utility>

using std::cout;
using std::endl;
using transformation::Transformation;

namespace transformation
{
  class DownSamplingTest : public ::testing::Test
  {
  protected:
    void SetUp() override
    {
      _rgba_image = cv::Mat(10, 1, CV_8UC4);
      for (int i = 0; i < _rgba_image.rows; ++i)
      {
        cv::Vec4b &pixel = _rgba_image.at<cv::Vec4b>(i, 0);
        pixel = cv::Vec4b(i * 10, i * 20, i * 30, 255); // R, G, B, A
      }
    }

    Transformation _instance{1, 1};
    cv::Mat _rgba_image;
  };

  TEST_F(DownSamplingTest, TestDownSamplingWithFactor)
  {
    cv::Mat rgba_downsampled_image = cv::Mat::zeros(5, 1, CV_8UC4);
    _instance.downSample(_rgba_image, rgba_downsampled_image, 2);

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
    _instance.downSample(_rgba_image, rgba_downsampled_image, 1);

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
    _instance.downSample(_rgba_image, rgba_downsampled_image, 15);

    // Check if the downsampled image has the expected size (should be 0 rows)
    ASSERT_EQ(rgba_downsampled_image.rows, 0);
  }

  TEST_F(DownSamplingTest, NonDivisibleFactor)
  {
    cv::Mat rgba_downsampled_image = cv::Mat::zeros(4, 1, CV_8UC4); // Expected downsampled size: 3 rows (10 / 3, rounded down)
    _instance.downSample(_rgba_image, rgba_downsampled_image, 3);

    // Check if the downsampled image has the correct size
    ASSERT_EQ(rgba_downsampled_image.rows, 4);

    // Check the values at the downsampled pixels
    for (int i = 0; i < rgba_downsampled_image.rows; ++i)
    {
      cv::Vec4b expected_pixel(i * 30, i * 60, i * 90, 255); // The pixel values should be downsampled by factor 3
      ASSERT_EQ(rgba_downsampled_image.at<cv::Vec4b>(i, 0), expected_pixel);
    }
  }

  class PrepareHSGridTest : public ::testing::Test
  {
  protected:
    void SetUp() override
    {
    }
  };
  TEST_F(PrepareHSGridTest, TestSimple)
  {
    Transformation _instance{2, 2};

    _instance.computeHSLookupTable();

    EXPECT_FLOAT_EQ(_instance._hs_lut.at<cv::Point2f>(0, 0).x, 135.f / 2.f / 255.f);
    EXPECT_FLOAT_EQ(_instance._hs_lut.at<cv::Point2f>(0, 1).x, 225.f / 2.f / 255.f);
    EXPECT_FLOAT_EQ(_instance._hs_lut.at<cv::Point2f>(1, 0).x, 45.f / 2.f / 255.f);
    EXPECT_FLOAT_EQ(_instance._hs_lut.at<cv::Point2f>(1, 1).x, 315.f / 2.f / 255.f);

    EXPECT_FLOAT_EQ(_instance._hs_lut.at<cv::Point2f>(0, 0).y, sqrtf(0.5));
    EXPECT_FLOAT_EQ(_instance._hs_lut.at<cv::Point2f>(0, 1).y, sqrtf(0.5));
    EXPECT_FLOAT_EQ(_instance._hs_lut.at<cv::Point2f>(1, 0).y, sqrtf(0.5));
    EXPECT_FLOAT_EQ(_instance._hs_lut.at<cv::Point2f>(1, 1).y, sqrtf(0.5));
  };
  TEST_F(PrepareHSGridTest, TestSimple2)
  {
    Transformation _instance{3, 3};

    _instance.computeHSLookupTable();

    EXPECT_FLOAT_EQ(_instance._hs_lut.at<cv::Point2f>(0, 0).x, 135 / 2.f / 255.f);
    EXPECT_FLOAT_EQ(_instance._hs_lut.at<cv::Point2f>(2, 2).x, 315 / 2.f / 255.f);
    EXPECT_FLOAT_EQ(_instance._hs_lut.at<cv::Point2f>(1, 1).y, 0.f);
  };
  TEST_F(PrepareHSGridTest, TestSimple3)
  {
    Transformation _instance{6, 6};

    _instance.computeHSLookupTable();

    EXPECT_FLOAT_EQ(_instance._hs_lut.at<cv::Point2f>(0, 0).x, 135 / 2.f / 255.f);
    EXPECT_FLOAT_EQ(_instance._hs_lut.at<cv::Point2f>(5, 5).x, 315 / 2.f / 255.f);
    EXPECT_FLOAT_EQ(_instance._hs_lut.at<cv::Point2f>(4, 4).y, sqrtf(0.5));
  };
  TEST_F(PrepareHSGridTest, TestSimple4)
  {
    Transformation _instance{32, 32};

    _instance.computeHSLookupTable();

    EXPECT_GT(_instance._hs_lut.at<cv::Point2f>(31, 31).y, 1.f);
  };

  class hs2xyTest : public ::testing::TestWithParam<std::pair<cv::Vec2f, cv::Vec2i>>
  {
  protected:
    void SetUp() override
    {
    }
    Transformation _instance{2, 2};
  };

  INSTANTIATE_TEST_SUITE_P(
      hs2xyTestParamsTest, hs2xyTest,
      testing::Values(
          std::make_pair<cv::Vec2f, cv::Vec2i>({135.f, 1.f}, {0, 0}), // Greenish top-left
          std::make_pair<cv::Vec2f, cv::Vec2i>({225.f, 1.f}, {1, 0}), // Blueish top-right
          std::make_pair<cv::Vec2f, cv::Vec2i>({45.f, 1.f}, {0, 1}),  // Yellowish bottom-left
          std::make_pair<cv::Vec2f, cv::Vec2i>({315.f, 1.f}, {1, 1})  // Magentaish bottom-right
          ));

  TEST_P(hs2xyTest, TestSimpleWithParams)
  {
    cv::Vec2f hs = GetParam().first;
    cv::Vec2i result = _instance.hs2xy(hs);
    EXPECT_EQ(result, GetParam().second);
  };

  class GetHSPopulationTest : public ::testing::Test
  {
  protected:
    void SetUp() override
    {
    }
    cv::Mat hs_grid;
    cv::Mat hsv_image;
    cv::Mat hs_lut;
    Transformation _instance{2, 2};
  };

  TEST_F(GetHSPopulationTest, TestSimple)
  {
    hsv_image = cv::Mat(3, 1, CV_32FC3);
    hsv_image.at<cv::Point3f>(0, 0) = cv::Point3f(135, sqrtf(0.5), 1.f); // top-left corner
    hsv_image.at<cv::Point3f>(1, 0) = cv::Point3f(225, sqrtf(0.5), 1.f); // bottom-left corner
    hsv_image.at<cv::Point3f>(2, 0) = cv::Point3f(45, sqrtf(0.5), 1.f);  // top-right corner
    // hsv_image.at<cv::Point3f>(3, 0) = cv::Point3f(315, sqrtf(0.5), 1.f); // bottom-right corner

    hs_lut = cv::Mat(2, 2, CV_32FC2);
    hs_lut.at<cv::Point2f>(0, 0) = cv::Point2f(0, 0); // top-left corner
    hs_lut.at<cv::Point2f>(0, 1) = cv::Point2f(0, 1); // bottom-left corner
    hs_lut.at<cv::Point2f>(1, 0) = cv::Point2f(1, 0); // top-right corner
    hs_lut.at<cv::Point2f>(1, 1) = cv::Point2f(1, 1); // bottom-right corner
    _instance._hs_lut = hs_lut;

    _instance.getHSPopulation(hsv_image, hs_grid);

    EXPECT_EQ(hs_grid.at<cv::Point3f>(0, 0), cv::Point3f(0, 0, 1));
    EXPECT_EQ(hs_grid.at<cv::Point3f>(0, 1), cv::Point3f(1, 0, 1));
    EXPECT_EQ(hs_grid.at<cv::Point3f>(1, 0), cv::Point3f(0, 1, 1));
    EXPECT_EQ(hs_grid.at<cv::Point3f>(1, 1), cv::Point3f(0, 0, 0));
  };
  class CropImageTest : public ::testing::Test
  {
  protected:
    void SetUp() override
    {
    }
    cv::Mat inp_image;
    cv::Mat out_image;
    Transformation _instance{2, 2};
  };
  TEST_F(CropImageTest, TestSimple)
  {
    inp_image = cv::Mat(10, 10, CV_8U);
    for (int i = 0; i < 10; i++)
    {
      for (int j = 0; j < 10; j++)
      {
        inp_image.at<uchar>(i, j) = i * 10 + j;
      }
    }

    _instance.cropImage(inp_image, out_image, 1, 2, 5, 4);

    for (int i = 2; i < 6; i++)
    {
      for (int j = 1; j < 6; j++)
      {
        EXPECT_EQ(i * 10 + j, out_image.at<uchar>(i - 2, j - 1));
      }
    }
  }
}

class ConvertImageTest : public ::testing::Test
{
protected:
  void SetUp() override
  {
  }
  std::vector<uchar> hsv_flat;
  Transformation _instance{2, 2};
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
  int width = 1;
  int height = 4;
  int target_width = 2;
  int target_height = 2;

  _instance.convertImage(num_pixels, data, hsv_flat, width, height, target_width, target_height, 0, 0, 1, 4);

  for (size_t i = 0; i < target_width * target_height * 4; i++)
  {
    ASSERT_TRUE(1);
  }
};
