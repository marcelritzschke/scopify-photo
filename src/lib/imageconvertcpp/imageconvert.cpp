// imageconvert.cpp
#include <node.h>
#include <iostream>
#include <limits>
#include <chrono>
#include <opencv2/opencv.hpp>

namespace imageconvert
{

  using v8::Array;
  using v8::ArrayBuffer;
  using v8::Exception;
  using v8::Float64Array;
  using v8::FunctionCallbackInfo;
  using v8::Isolate;
  using v8::Local;
  using v8::Number;
  using v8::Object;
  using v8::String;
  using v8::Value;

  void RgbToHsv(const FunctionCallbackInfo<Value> &args)
  {
    Isolate *isolate = args.GetIsolate();

    if (!args[0]->IsArrayBuffer())
    {
      std::cout << "Expected ArrayBuffer" << std::endl;
      return;
    }

    // Get RGBA values data
    Local<ArrayBuffer> buffer = Local<ArrayBuffer>::Cast(args[0]);
    uint8_t *data = static_cast<uint8_t *>(buffer->Data());
    size_t length = buffer->ByteLength();

    std::cout << "Buffer length: " << length << std::endl;

    // Ensure the length is divisible by 4 (RGBA components per pixel)
    if (length % 4 != 0)
    {
      // isolate->ThrowException(Exception::Error(isolate->GetCurrentContext(),
      //  String::NewFromUtf8(isolate, "ArrayBuffer size must be a multiple of 3").ToLocalChecked()));
      std::cout << "ArrayBuffer size must be a multiple of 4" << std::endl;
      return;
    }

    // HSV output buffer
    int num_pixels = length / 4; // Number of RGBA pixels
    auto start = std::chrono::high_resolution_clock::now();

    // Create an OpenCV Mat from the RGBA data
    cv::Mat rgba_image(num_pixels, 1, CV_8UC4, data);

    // Convert RGBA to RGB by dropping the alpha channel
    cv::Mat rgb_image;
    cv::cvtColor(rgba_image, rgb_image, cv::COLOR_RGBA2RGB);

    cv::Mat floatRgbImage;
    rgb_image.convertTo(floatRgbImage, CV_32F, 1.0 / 255.0); // Normalize to [0, 1]

    // Convert RGB to HSV
    cv::Mat hsv_image;
    cv::cvtColor(floatRgbImage, hsv_image, cv::COLOR_RGB2HSV_FULL);

    // Flatten HSV data into a 1D array
    std::vector<float> hsv_flat(hsv_image.total() * hsv_image.elemSize());
    memcpy(hsv_flat.data(), hsv_image.data, hsv_flat.size());

    // Create a new ArrayBuffer to return the HSV data
    auto hsv_buffer = ArrayBuffer::New(isolate, hsv_flat.size());
    memcpy(hsv_buffer->Data(), hsv_flat.data(), hsv_flat.size());

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> duration = end - start;
    std::cout << "Time taken: " << duration.count() << " seconds\n";

    args.GetReturnValue().Set(hsv_buffer);
  }

  void Initialize(Local<Object> exports)
  {
    NODE_SET_METHOD(exports, "rgbToHsv", RgbToHsv);
  }

  NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)

} // namespace imageconvert