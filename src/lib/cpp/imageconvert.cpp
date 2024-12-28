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

  void RgbToHsv(const FunctionCallbackInfo<Value> &args)
  {
    PERF_MARK("Program Start");

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
    std::vector<uchar> hsv_flat;
    transformation::convertImage(num_pixels, data, hsv_flat, 8, 512, 512);

    // Create a new ArrayBuffer to return the HSV data
    auto hsv_buffer = ArrayBuffer::New(isolate, hsv_flat.size());
    memcpy(hsv_buffer->Data(), hsv_flat.data(), hsv_flat.size());

    args.GetReturnValue().Set(hsv_buffer);

    PERF_MARK("Program End");
  }

  void Initialize(Local<Object> exports)
  {
    NODE_SET_METHOD(exports, "rgbToHsv", RgbToHsv);
  }

  NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)

} // namespace imageconvert