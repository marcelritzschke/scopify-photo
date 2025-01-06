# ScopifyPhoto

## Prerequisites

For performance reasons we will use OpenCV C++. and `node-gyp` to compile node addons. Therefore we will need:

- Python >= 3.12
- C++ Compiler
- OpenCV pre compiled

You can follow the instructions for [node-gyp](https://github.com/nodejs/node-gyp#Installation) and [opencv](https://github.com/opencv/opencv).

If you are on **Windows** you could use chocolately to get all required dependencies:

```
choco install python visualstudio2022-workload-vctools opencv -y
```

Once you have installed OpenCV, you need to update the paths in `binding.gyp`.

## Installation

Install all npm packages:

```
npm install
```

Rebuild node addon for correct electron version:

```
npm run build:nodeaddon
```
