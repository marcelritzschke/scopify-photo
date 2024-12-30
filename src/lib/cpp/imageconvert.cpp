// imageconvert.cpp
#include <node.h>
#include <iostream>
#include <limits>
#include <chrono>
#include <mutex>
#include <opencv2/opencv.hpp>
#include "transformation.hpp"
#include "perf.hpp"

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

  static std::chrono::steady_clock::time_point last_log_time{};

  void RgbToHsv(const FunctionCallbackInfo<Value> &args)
  {
    auto start_time = std::chrono::high_resolution_clock::now();
    PERF_INIT;

    Isolate *isolate = args.GetIsolate();
    v8::Local<v8::Context> context = v8::Context::New(v8::Isolate::GetCurrent());

    if (!args[0]->IsArrayBuffer())
    {
      std::cout << "Expected ArrayBuffer" << std::endl;
      return;
    }

    // Get buffer sizes
    auto bitmap_width_maybe = Local<v8::Int32>::Cast(args[1])->Uint32Value(context);
    auto bitmap_height_maybe = Local<v8::Int32>::Cast(args[2])->Uint32Value(context);
    auto grid_size_x_maybe = Local<v8::Int32>::Cast(args[3])->Uint32Value(context);
    auto grid_size_y_maybe = Local<v8::Int32>::Cast(args[4])->Uint32Value(context);

    if (!bitmap_width_maybe.IsJust() || !bitmap_height_maybe.IsJust())
    {
      std::cout << "Expected 2 int for width and height" << std::endl;
      return;
    }

    if (!grid_size_x_maybe.IsJust() || !grid_size_y_maybe.IsJust())
    {
      std::cout << "Expected 2 int for grid size x and y" << std::endl;
      return;
    }
    int32_t grid_size_x = grid_size_x_maybe.FromJust();
    int32_t grid_size_y = grid_size_y_maybe.FromJust();

    // Get RGBA values data
    Local<ArrayBuffer> buffer = Local<ArrayBuffer>::Cast(args[0]);
    uint8_t *data = static_cast<uint8_t *>(buffer->Data());
    size_t length = buffer->ByteLength();

    // Ensure the length is divisible by 4 (RGBA components per pixel)
    if (length % 4 != 0)
    {
      // isolate->ThrowException(Exception::Error(isolate->GetCurrentContext(),
      //  String::NewFromUtf8(isolate, "ArrayBuffer size must be a multiple of 3").ToLocalChecked()));
      std::cout << "ArrayBuffer size must be a multiple of 4" << std::endl;
      return;
    }

    int32_t width = bitmap_width_maybe.FromJust();
    int32_t height = bitmap_height_maybe.FromJust();
    int num_pixels = length / 4; // Number of RGBA pixels
    if (num_pixels != width * height)
    {
      std::cout << "Width and height does not match pixel count (" << width << ", " << height << ", " << num_pixels << ")" << std::endl;
      return;
    }

    auto &transf = transformation::Transformation::getInstance(MAX_GRID_SIZE_X, MAX_GRID_SIZE_Y);
    std::vector<uchar> hsv_flat;
    transf.convertImage(num_pixels, data, hsv_flat, width, height, grid_size_x, grid_size_y);

    // Create a new ArrayBuffer to return the HSV data
    auto hsv_buffer = ArrayBuffer::New(isolate, hsv_flat.size());
    memcpy(hsv_buffer->Data(), hsv_flat.data(), hsv_flat.size());

    args.GetReturnValue().Set(hsv_buffer);

    PERF_MARK("Program End");
    PERF_SUMMARY;

    auto now = std::chrono::high_resolution_clock::now();
    int time_dif = std::chrono::duration_cast<std::chrono::milliseconds>(now - start_time).count();
    if (std::chrono::duration_cast<std::chrono::seconds>(now - last_log_time).count() >= 1)
    {
      std::cout << "Succesful Conversion. Running at " << 1000.f / time_dif << "fps" << std::endl;
      last_log_time = now;
    }
  }

  void Initialize(Local<Object> exports)
  {
    NODE_SET_METHOD(exports, "rgbToHsv", RgbToHsv);
  }

  NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)

} // namespace imageconvert