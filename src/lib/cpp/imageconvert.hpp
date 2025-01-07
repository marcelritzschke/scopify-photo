#pragma once
#include <opencv2/opencv.hpp>
#include <node.h>

namespace imageconvert
{
    template <typename T>
    T GetFromMaybe(v8::Maybe<T> input_maybe, std::optional<T> default_value = std::nullopt)
    {
        if (!input_maybe.IsJust())
        {
            if (!default_value)
            {
                throw std::invalid_argument("Argument not given and no default provided!");
            }
            else
            {
                return default_value.value();
            }
        }

        return input_maybe.FromJust();
    }
}