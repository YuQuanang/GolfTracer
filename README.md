# 🏌️ Golf Ball Tracer Webapp

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.5-purple.svg)](https://vitejs.dev/)
[![Material UI](https://img.shields.io/badge/Material_UI-5.14.10-teal.svg)](https://mui.com/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg.wasm-0.12.6-orange.svg)](https://github.com/ffmpegwasm/ffmpeg.wasm)
[![OpenCV.js](https://img.shields.io/badge/OpenCV.js-1.2.1-green.svg)](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html)

## 🎯 Overview

Golf Ball Tracer is a web application that allows golfers to upload their swing videos and automatically trace the ball flight path. Analyze your golf swing with precision, customize the tracer appearance, and export your traced videos to share with friends or coaches!

![Golf Ball Tracer Demo](https://via.placeholder.com/800x450.png?text=Golf+Ball+Tracer+Demo)

## ✨ Features

- 📤 **Easy Video Upload**: Drag and drop or select golf swing videos
- 🔍 **Automatic Ball Tracking**: Powered by OpenCV.js computer vision
- 🎨 **Customizable Tracer**: Adjust color, width, opacity, and style
- ✏️ **Manual Editing**: Fine-tune tracer points for perfect results
- 💾 **Video Export**: Save your traced videos with FFmpeg.wasm
- 📱 **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/golf-tracer-webapp.git
   cd golf-tracer-webapp
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Usage

### 1. Upload Your Golf Swing Video

Start by uploading a video of your golf swing. For best results:
- Use videos with good lighting conditions
- Record from a stable position (tripod recommended)
- Position camera perpendicular to the ball flight path
- Minimize background distractions

### 2. Process & Trace

After uploading, click the "Process & Trace Ball" button. The application will analyze your video and automatically trace the ball flight path.

### 3. Edit Trace (Optional)

Fine-tune the tracer by:
- Adjusting the color, width, opacity, and style
- Adding, moving, or removing tracer points
- Previewing changes in real-time

### 4. Export Video

When you're satisfied with the tracer, export your video with the tracer overlay. You can then download and share it with friends, coaches, or on social media.

## 🧰 Technologies Used

- **React**: Frontend library for building the user interface
- **Material UI**: Component library for modern design
- **OpenCV.js**: Computer vision for ball tracking
- **FFmpeg.wasm**: Video processing and exporting
- **React Router**: Navigation between pages
- **React Colorful**: Color picker for tracer customization
- **Vite**: Fast build tool and development server

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- OpenCV.js for providing powerful computer vision capabilities
- FFmpeg.wasm for browser-based video processing
- All the golfers who provided feedback during development

---

<p align="center">Made with ❤️ for golfers everywhere</p>