# ScopifyPhoto

**ScopifyPhoto** is an experimental tool that helps with color analysis by providing real-time HSV conversion and vectorscope visualizations. This application captures your screen or a selected application, processes the color data in real-time, and displays it as a vectorscope to assist with color grading. It’s designed to be a useful addition to your editing workflow, whether your are editing in Lightroom or Photoshop, providing a live view of your colors for more accurate adjustments.

# Features

- **Live Screen/App Capture**: Capture any part of your screen or specific application window for real-time processing.
- **HSV Conversion**: Convert captured colors into HSV for better color accuracy and visual feedback.
- **Vectorscope Display**: Visualize the color data through a vectorscope, which can assist with tasks like skin tone adjustments.
- **Always on Top**: Keep the vectorscope window always visible, so you can monitor your color work while editing.
- **Live Updates**: The vectorscope updates in real time, reflecting changes as you adjust your colors.
- **Open to Collaboration**: This is a work in progress, and contributions from the open-source community are welcomed.

# Contribution

Contributions are highly welcomed. Follow the next steps to setup your environment:

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
