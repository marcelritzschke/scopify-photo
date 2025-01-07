#pragma once
#include <opencv2/opencv.hpp>
#ifdef __TEST
#include <gtest/gtest_prod.h>
#endif

#define MAX_PIXEL_COUNT 1e6
#define MAX_GRID_SIZE_X 512
#define MAX_GRID_SIZE_Y 512

namespace transformation
{
    constexpr float pi = 3.14159265358979323846f;

    class Transformation
    {

    public:
        static Transformation &getInstance(int grid_size_x, int grid_size_y)
        {
            static Transformation instance(grid_size_x, grid_size_y);
            return instance;
        }
        Transformation(int grid_size_x, int grid_size_y);
        ~Transformation() {};

        void convertImage(int num_pixels,
                          uint8_t *data,
                          std::vector<uchar> &dst,
                          int width,
                          int height,
                          int target_width,
                          int target_height,
                          int bbox_startX,
                          int bbox_startY,
                          int bbox_width,
                          int bbox_height,
                          bool use_lut = true);

        void useBlur(bool use_blur);

    private:
        int _grid_size_x;
        int _grid_size_y;

        int _min_grid_size_x = 1;
        int _min_grid_size_y = 1;
        int _max_grid_size_x = MAX_GRID_SIZE_X;
        int _max_grid_size_y = MAX_GRID_SIZE_Y;

        bool _use_blur = false;

        cv::Mat _hs_lut;

        /**
         * Computes a LUT for Hue vs Sat values. The coordinate system is HTML5 canvas with origin at top-left,
         * y (rows) pointing downwards and x (cols) pointing to the right.
         * The center of the Hue wheel is at (1, 1) and red is at zero degree (1, 0)
         */
        void computeHSLookupTable();
        void downSample(const cv::Mat &rgba_image, cv::Mat &rgba_downsampled_image, int factor);
        void makeTransparent(cv::Mat &rgba_image);
        void getHSPopulation(const cv::Mat &hsv_image, cv::Mat &hs_grid);
        void cropImage(const cv::Mat &inp_image,
                       cv::Mat &out_image,
                       int bbox_startX,
                       int bbox_startY,
                       int bbox_width,
                       int bbox_height);
#if 0
        void gridBinning(const cv::Mat &hsv_image, cv::Mat &hsv_grid);
#endif

        cv::Vec2i hs2xy(cv::Vec2f &hs);

#ifdef __TEST
        FRIEND_TEST(DownSamplingTest, TestDownSamplingWithFactor);
        FRIEND_TEST(DownSamplingTest, NoDownsampling);
        FRIEND_TEST(DownSamplingTest, FactorGreaterThanRows);
        FRIEND_TEST(DownSamplingTest, NonDivisibleFactor);
        FRIEND_TEST(GetHSPopulationTest, TestSimple);
        FRIEND_TEST(PrepareHSGridTest, TestSimple);
        FRIEND_TEST(PrepareHSGridTest, TestSimple2);
        FRIEND_TEST(PrepareHSGridTest, TestSimple3);
        FRIEND_TEST(PrepareHSGridTest, TestSimple4);
        FRIEND_TEST(hs2xyTest, TestSimpleWithParams);
        FRIEND_TEST(CropImageTest, TestSimple);
#endif
    };
}