# 🏌️ GolfTracer Pro — AI Kinematic Ball Flight Studio

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![ONNX Runtime](https://img.shields.io/badge/ONNX_Runtime_Web-1.18-teal.svg?style=for-the-badge&logo=onnx)](https://onnxruntime.ai/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg.wasm-0.12-orange.svg?style=for-the-badge)](https://ffmpegwasm.netlify.app/)
[![PyTorch](https://img.shields.io/badge/PyTorch_YOLOv8-2.12-red.svg?style=for-the-badge&logo=pytorch)](https://pytorch.org/)

**GolfTracer Pro** is a state-of-the-art web application and AI studio designed for golfers, instructors, and content creators. It combines deep learning computer vision (YOLOv8 via ONNX Runtime), accurate aerodynamic physics (Runge-Kutta 4th-Order simulation), and in-browser WebAssembly rendering to trace, style, and export broadcast-quality golf swing ball flights.

---

## ✨ Studio Design & Theme

Built with a **Dark Luxury Architectural Design System**:
- **Curated Palette**: Deep charcoal (`#0A0A0A`), warm cream text (`#F2EDE5`), and metallic bronze/gold accents (`#BF9B6F` / `#DEC07E`).
- **Responsive Layout Engine**: Seamlessly shifts between a dual-column Studio Console workflow on laptops/desktops (`minmax(0, 1fr) 350px`) and an optimized single-column touch experience on mobile phones and iOS devices.

---

## 🚀 Core Application Architecture & Workflow

### 1. Step 1: Upload Studio (`VideoUploader.jsx`)
- **Interactive Drop Zone**: Supports drag-and-drop or direct camera roll uploads (`MP4`, `MOV`, `WebM`, `AVI` up to 2 GB).
- **Integrated Recording Guides**: On-device tips for mobile users (*Down-The-Line Angle*, *Stable Tripod Setup*, and *Clear Daylight Lighting*).

### 2. Step 2: Analysis & Workflow Selection (`TracerPage.jsx`)
- **Automated AI Neural Trace**: Leverages in-browser neural networks (`onnxruntime-web`) executing a custom YOLOv8 model (`golf_tracker.onnx`) to inspect frame velocity and plot ball trajectory automatically.
- **Precision Manual Studio Setup**: Allows users to bypass AI scanning and immediately place custom Tee, Apex, and Landing anchors.

### 3. Step 3: Visual Editor & Studio Console (`VideoPlayer.jsx`, `TracerEditor.jsx`, `TracerControls.jsx`)
- **Runge-Kutta 4th-Order Kinematics Engine (`golfPhysicsEngine.js`)**:
  - Replaces rudimentary Bezier curves with realistic aerodynamic flight profiles.
  - **Driver (150 mph)**: Explosive initial launch acceleration with extended carry and prolonged hang time.
  - **7-Iron (115 mph)**: Balanced parabolic arc.
  - **Pitching Wedge (90 mph)**: High initial trajectory with steep descent angle.
  - **Aerodynamic Flight Shape**: Simulates realistic 3D lateral deflection for **Straight**, **Draw (-5° draw bias)**, and **Fade (+5° fade bias)** shots.
- **Locked Anchor Geometry**: Adjusting line thickness or flight shape keeps the **Start (⛳)**, **Apex (◆)**, and **Landing (⬇)** coordinates 100% anchored without unwanted lateral drifting.
- **Tabbed Studio Console**:
  - **⏱️ Timing & Flight Tab**: Precise frame scrubbing and **📍 Set to Current Frame** synchronization. Suppresses premature tracer rendering until impact frame is explicitly confirmed.
  - **🎨 Appearance Tab**: Custom Hex color picker, quick swatches (*Gold, Bronze, Laser Red, Pro Green, Electric Blue, Pure White*), Line Thickness (`2-24px`), Opacity (`10-100%`), and Dash Styles (*Solid, Dashed, Dotted*).

### 4. Step 4: High-Definition Export Lab (`VideoExporter.jsx`)
- **In-Browser WebAssembly Rendering**: Uses `@ffmpeg/ffmpeg` to composite the custom tracer overlay directly onto the MP4 video stream at 60 FPS without sending user videos to external servers.

---

## 📦 Technology Stack & Core Modules

| Module / File | Technology | Description |
| :--- | :--- | :--- |
| `src/utils/golfPhysicsEngine.js` | JavaScript ES6 | RK4 numerical integration engine simulating air resistance, gravity, Magnus effect spin, and time-to-screen mapping. |
| `src/utils/yoloUtils.js` | ONNX Runtime Web | Preprocesses video canvas frames into tensors and runs inference against `/public/golf_tracker.onnx`. |
| `src/components/tracer/*` | React 18 / Framer Motion | Dynamic studio UI components with smooth HMR and state synchronization. |
| `src/index.css` | Vanilla CSS Variables | Global design system tokens, responsive breakpoints (`<992px`), and studio card utilities. |

---

## 🛠️ Running the Application Locally

### Option A: Running the Frontend Webapp (Node.js)

1. **Prerequisites**: Ensure you have Node.js (v18+) installed.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
4. **Open in Browser**: Navigate to `http://localhost:5173`.

---

### Option B: Running & Developing with the Python `.venv` Environment

The project includes a pre-configured Python virtual environment (`.venv`) equipped with **PyTorch**, **Ultralytics YOLOv8**, **OpenCV**, and **ONNX** tools. This environment is used to inspect, train, fine-tune, or re-export custom AI golf tracking models.

#### 1. Activate the Virtual Environment
On macOS / Linux:
```bash
source .venv/bin/activate
```

#### 2. Verify Installed AI Tooling
Check that Ultralytics and PyTorch are active:
```bash
python -c "import torch, ultralytics; print('PyTorch:', torch.__version__, '| Ultralytics:', ultralytics.__version__)"
```

#### 3. Exporting / Converting YOLOv8 Models to ONNX for Web Inference
If you train a new weights file (`best.pt`) and want to use it inside the React webapp:
```bash
# Convert PyTorch YOLO model to ONNX format optimized for web
yolo export model=best.pt format=onnx simplify=True dynamic=False
```
Copy the generated `.onnx` file into the `public/` directory:
```bash
cp best.onnx public/golf_tracker.onnx
```
Once copied, `yoloUtils.js` and `onnxruntime-web` will automatically load your updated neural network model inside the browser!

#### 4. Deactivating the Environment
When finished working with Python machine learning tools:
```bash
deactivate
```

---

## 📄 License
This project is licensed under the MIT License. Designed and built for golfers everywhere.