#include <node.h>
#include <iostream>
#include <limits>
#include <chrono>
#include <mutex>
#include <optional>
#include <opencv2/opencv.hpp>
#include "imageconvert.hpp"
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

  void UpdatePreferences(const FunctionCallbackInfo<Value> &args)
  {
    Isolate *isolate = args.GetIsolate();

    bool use_blur = args[0]->BooleanValue(isolate);

    auto &transf = transformation::Transformation::getInstance(MAX_GRID_SIZE_X, MAX_GRID_SIZE_Y);
    transf.useBlur(use_blur);
  }

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
    uint32_t width, height, grid_size_x, grid_size_y;
    try
    {
      width = GetFromMaybe(Local<v8::Int32>::Cast(args[1])->Uint32Value(context));
      height = GetFromMaybe(Local<v8::Int32>::Cast(args[2])->Uint32Value(context));
      grid_size_x = GetFromMaybe(Local<v8::Int32>::Cast(args[3])->Uint32Value(context));
      grid_size_y = GetFromMaybe(Local<v8::Int32>::Cast(args[4])->Uint32Value(context));
    }
    catch (const std::exception &e)
    {
      std::cout << e.what() << std::endl;
      std::cout << "Expected values for bitmap_width, bitmap_height, grid_size_x and grid_size_y" << std::endl;
      return;
    }
    uint32_t bbox_startX = GetFromMaybe<uint32_t>(Local<v8::Int32>::Cast(args[5])->Uint32Value(context), 0);
    uint32_t bbox_startY = GetFromMaybe<uint32_t>(Local<v8::Int32>::Cast(args[6])->Uint32Value(context), 0);
    uint32_t bbox_width = GetFromMaybe<uint32_t>(Local<v8::Int32>::Cast(args[7])->Uint32Value(context), width);
    uint32_t bbox_height = GetFromMaybe<uint32_t>(Local<v8::Int32>::Cast(args[8])->Uint32Value(context), height);
    bool use_blur = args[9]->BooleanValue(isolate);

    // Get RGBA values data
    Local<ArrayBuffer> buffer = Local<ArrayBuffer>::Cast(args[0]);
    uint8_t *data = static_cast<uint8_t *>(buffer->Data());
    size_t length = buffer->ByteLength();

    // Ensure the length is divisible by 4 (RGBA components per pixel)
    if (length % 4 != 0)
    {
      std::cout << "ArrayBuffer size must be a multiple of 4" << std::endl;
      return;
    }

    int num_pixels = length / 4; // Number of RGBA pixels
    if (num_pixels != width * height)
    {
      std::cout << "Width and height does not match pixel count (" << width << ", " << height << ", " << num_pixels << ")" << std::endl;
      return;
    }

    auto &transf = transformation::Transformation::getInstance(MAX_GRID_SIZE_X, MAX_GRID_SIZE_Y);
    transf.useBlur(use_blur);

    std::vector<uchar> hsv_flat;
    transf.convertImage(num_pixels, data, hsv_flat, width, height, grid_size_x, grid_size_y, bbox_startX, bbox_startY, bbox_width, bbox_height);

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
    NODE_SET_METHOD(exports, "updatePreferences", UpdatePreferences);
  }

  NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)

} // namespace imageconvert