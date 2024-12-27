{
  "conditions": [
    ['OS=="win"', {
      "variables": {
          "Cpp_Dir%": "./src/lib/cpp",
          "OpenCV_Include_Dirs%": "C:/tools/opencv/build/include",
          "OpenCV_Version%": "4100",
          "OpenCV_Lib_Dirs%": "C:/tools/opencv/build/x64/vc16",
      }
    }, {  # 'OS!="win"'
      "variables": {

      }
    }]
  ],
  "targets": [
    {
      "target_name": "imageconvert",
      "conditions": [
        ['OS=="win"', {
          "copies": [{
              "destination": "<(PRODUCT_DIR)",
              "files": [
                  "<(OpenCV_Lib_Dirs)/bin/opencv_world<(OpenCV_Version).dll",
              ]
          }]
        }]
      ],
      "sources": [ "<(Cpp_Dir)/imageconvert.cpp", "<(Cpp_Dir)/transformation.cpp" ],
      "include_dirs": [
        "<(OpenCV_Include_Dirs)"
      ],
      "libraries": [
        "<(OpenCV_Lib_Dirs)/lib/opencv_world<(OpenCV_Version).lib",
      ],
    }
  ]
}