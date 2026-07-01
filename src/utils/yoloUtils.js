// ort is loaded as a classic <script> in index.html → available as window.ort
const ort = window.ort;

const MODEL_DIM = 640;

export const loadModel = async (modelPath) => {
  ort.env.wasm.wasmPaths = '/';
  ort.env.wasm.numThreads = 1;
  const session = await ort.InferenceSession.create(modelPath, { executionProviders: ['wasm'] });
  return session;
};

/**
 * Preprocesses a video frame or image for YOLOv8 input.
 * Resizes to 640x640 and normalizes pixel values to [0, 1].
 * @param {HTMLCanvasElement} canvas - A scratch canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {HTMLVideoElement} videoElement - The source video
 * @returns {ort.Tensor} - Float32Array tensor [1, 3, 640, 640]
 */
export const preprocess = (canvas, ctx, videoElement) => {
  canvas.width = MODEL_DIM;
  canvas.height = MODEL_DIM;
  
  // Draw the video frame onto the 640x640 canvas (it will squash it, which YOLO expects)
  ctx.drawImage(videoElement, 0, 0, MODEL_DIM, MODEL_DIM);
  
  const imageData = ctx.getImageData(0, 0, MODEL_DIM, MODEL_DIM);
  const data = imageData.data;
  
  // Create Float32Array for the tensor [batch, channel, height, width]
  const float32Data = new Float32Array(3 * MODEL_DIM * MODEL_DIM);
  
  // YOLO expects RGB channels separated, normalized between 0 and 1
  for (let i = 0; i < MODEL_DIM * MODEL_DIM; i++) {
    float32Data[i] = data[i * 4] / 255.0; // Red
    float32Data[i + MODEL_DIM * MODEL_DIM] = data[i * 4 + 1] / 255.0; // Green
    float32Data[i + 2 * MODEL_DIM * MODEL_DIM] = data[i * 4 + 2] / 255.0; // Blue
  }
  
  return new ort.Tensor('float32', float32Data, [1, 3, MODEL_DIM, MODEL_DIM]);
};

/**
 * Postprocesses the YOLOv8 output tensor to find the best bounding box.
 * @param {ort.Tensor} tensor - Output tensor from ONNX session
 * @param {number} origW - Original video width
 * @param {number} origH - Original video height
 * @returns {Object|null} - The center x,y coordinate of the highest confidence detection
 */
export const postprocess = (tensor, origW, origH) => {
  const data = tensor.data;
  const numAnchors = 8400;
  const numClasses = 3;

  // Class IDs from the Roboflow training set
  // 0 = ball (stationary on tee), 1 = club-head (excluded), 2 = fmo-ball (ball in flight)
  const CONF_BALL = 0.40; // Higher threshold — stationary ball should be clearly visible
  const CONF_FMO  = 0.25; // Lower threshold  — motion blur reduces model confidence in flight

  let bestConf = 0;
  let bestBox  = null;

  for (let i = 0; i < numAnchors; i++) {
    let maxClassConf = 0;
    let classId = -1;

    for (let c = 0; c < numClasses; c++) {
      const conf = data[(4 + c) * numAnchors + i];
      if (conf > maxClassConf) { maxClassConf = conf; classId = c; }
    }

    // Never track the club head
    if (classId === 1) continue;

    const threshold = classId === 2 ? CONF_FMO : CONF_BALL;
    if (maxClassConf > threshold && maxClassConf > bestConf) {
      bestConf = maxClassConf;
      bestBox  = {
        cx: data[0 * numAnchors + i],
        cy: data[1 * numAnchors + i],
        classId,
        conf: maxClassConf,
      };
    }
  }

  if (!bestBox) return null;

  const scaleX = origW / MODEL_DIM;
  const scaleY = origH / MODEL_DIM;
  return { x: bestBox.cx * scaleX, y: bestBox.cy * scaleY, confidence: bestBox.conf, classId: bestBox.classId };
};
