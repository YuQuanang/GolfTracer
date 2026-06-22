import * as ort from 'onnxruntime-web';

const MODEL_DIM = 640; // Standard YOLOv8 input dimension

/**
 * Loads the ONNX model using the WebAssembly execution provider.
 * @param {string} modelPath - Path to the .onnx file
 * @returns {Promise<ort.InferenceSession>}
 */
export const loadModel = async (modelPath) => {
  try {
    // Use WASM backend for browser execution
    ort.env.wasm.numThreads = 1;
    const session = await ort.InferenceSession.create(modelPath, { executionProviders: ['wasm'] });
    return session;
  } catch (error) {
    console.error("Failed to load ONNX model:", error);
    throw error;
  }
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
  const numAnchors = 8400; // YOLOv8 standard 640x640 anchor count
  const numClasses = 3; // From the Roboflow dataset (ball, club-head, fmo-ball)
  
  let bestConf = 0;
  let bestBox = null;
  
  // YOLOv8 output shape is [1, 4 + numClasses, 8400]
  // Dimensions are row-major: [batch, features, anchors]
  for (let i = 0; i < numAnchors; i++) {
    let maxClassConf = 0;
    let classId = -1;
    
    // Find the class with the highest confidence for this anchor
    for (let c = 0; c < numClasses; c++) {
      const conf = data[(4 + c) * numAnchors + i];
      if (conf > maxClassConf) {
        maxClassConf = conf;
        classId = c;
      }
    }
    
    // We filter for confidence > 0.25
    if (maxClassConf > 0.25 && maxClassConf > bestConf) {
      bestConf = maxClassConf;
      
      // Box coordinates: center_x, center_y, width, height
      const cx = data[0 * numAnchors + i];
      const cy = data[1 * numAnchors + i];
      const w = data[2 * numAnchors + i];
      const h = data[3 * numAnchors + i];
      
      bestBox = { cx, cy, w, h, classId, conf: maxClassConf };
    }
  }
  
  if (!bestBox) return null;
  
  // Scale the bounding box coordinates back to the original video resolution
  const scaleX = origW / MODEL_DIM;
  const scaleY = origH / MODEL_DIM;
  
  return {
    x: bestBox.cx * scaleX,
    y: bestBox.cy * scaleY,
    confidence: bestBox.conf,
    classId: bestBox.classId
  };
};
