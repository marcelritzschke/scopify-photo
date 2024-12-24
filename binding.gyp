{
  "conditions": [
    ['OS=="win"', {
      "variables": {
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
      "sources": [ "src/lib/imageconvertcpp/imageconvert.cpp" ],
      "include_dirs": [
        "<(OpenCV_Include_Dirs)"
      ],
      "libraries": [
        "<(OpenCV_Lib_Dirs)/lib/opencv_world<(OpenCV_Version).lib",
      ],
    }
  ]
}