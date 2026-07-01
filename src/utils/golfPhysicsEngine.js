/**
 * 3D Golf Shot Tracer Kinematic Physics Engine
 * Implements Runge-Kutta 4th Order (RK4) numerical integration for aerodynamic ball flight.
 * Incorporates gravitational acceleration, velocity-squared aerodynamic drag, and dynamic Magnus lift.
 */

// ── Physical Constants ────────────────────────────────────────────────────────
export const CONSTANTS = {
  GRAVITY: 9.81,           // Acceleration due to gravity (m/s^2) downward along +Y
  AIR_DENSITY: 1.225,      // Air density at sea level, 15°C (kg/m^3)
  BALL_MASS: 0.04593,      // Standard USGA golf ball mass (kg)
  BALL_RADIUS: 0.02135,    // Standard golf ball radius (m)
  AREA: Math.PI * Math.pow(0.02135, 2), // Cross-sectional area (m^2)
  DRAG_COEFF: 0.23,        // Typical dimpled golf ball drag coefficient (Cd)
};

// ── Unit Conversion Helpers ───────────────────────────────────────────────────
const MPH_TO_MS = 0.44704;
const RPM_TO_RADS = (2 * Math.PI) / 60;
const DEG_TO_RAD = Math.PI / 180;

// ── Club Presets (Trackman Amateur Baselines) ─────────────────────────────────
export const CLUB_PRESETS = {
  DRIVER: {
    name: 'Driver',
    ballSpeedMph: 150,
    ballSpeedMs: 150 * MPH_TO_MS,        // 67.06 m/s
    launchAngleDeg: 12.0,
    launchAngleRad: 12.0 * DEG_TO_RAD,
    spinRateRpm: 2500,
    spinRateRads: 2500 * RPM_TO_RADS,    // 261.8 rad/s
  },
  SEVEN_IRON: {
    name: '7-Iron',
    ballSpeedMph: 115,
    ballSpeedMs: 115 * MPH_TO_MS,        // 51.41 m/s
    launchAngleDeg: 18.0,
    launchAngleRad: 18.0 * DEG_TO_RAD,
    spinRateRpm: 6500,
    spinRateRads: 6500 * RPM_TO_RADS,    // 680.7 rad/s
  },
  PITCHING_WEDGE: {
    name: 'Pitching Wedge',
    ballSpeedMph: 90,
    ballSpeedMs: 90 * MPH_TO_MS,         // 40.23 m/s
    launchAngleDeg: 26.0,
    launchAngleRad: 26.0 * DEG_TO_RAD,
    spinRateRpm: 8500,
    spinRateRads: 8500 * RPM_TO_RADS,    // 890.1 rad/s
  },
};

// ── Shot Shape Configurations ─────────────────────────────────────────────────
export const SHOT_SHAPES = {
  STRAIGHT: { name: 'Straight', spinAxisTiltDeg: 0 },
  DRAW:     { name: 'Draw',     spinAxisTiltDeg: -18.0 }, // Dramatic leftward lateral Magnus force
  FADE:     { name: 'Fade',     spinAxisTiltDeg: 18.0 },  // Dramatic rightward lateral Magnus force
};

// ── Vector Math Operations ────────────────────────────────────────────────────
const vecAdd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const vecScale = (v, s) => [v[0] * s, v[1] * s, v[2] * s];
const vecMag = (v) => Math.hypot(v[0], v[1], v[2]);
const vecCross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/**
 * Calculates acceleration vector (ax, ay, az) from state vector Y = [x, y, z, vx, vy, vz]
 * Using vector equation: F_total = m*g - 0.5*rho*Cd*A*|v|*v + 0.5*rho*Cl*A*(omega x v)/|omega|
 */
function computeDerivative(state, omegaVec, omegaMag) {
  const v = [state[3], state[4], state[5]];
  const vMag = vecMag(v);

  if (vMag === 0) {
    return [0, 0, 0, 0, -CONSTANTS.GRAVITY, 0];
  }

  // 1. Gravitational Force: Fg = m * g
  const F_g = [0, -CONSTANTS.BALL_MASS * CONSTANTS.GRAVITY, 0];

  // 2. Aerodynamic Drag Force: Fd = -0.5 * rho * Cd * A * |v| * v
  const dragFactor = -0.5 * CONSTANTS.AIR_DENSITY * CONSTANTS.DRAG_COEFF * CONSTANTS.AREA * vMag;
  const F_d = vecScale(v, dragFactor);

  // 3. Dynamic Magnus Lift Force: FL = 0.5 * rho * Cl * A * (omega x v) / |omega|
  // Lift coefficient CL dynamically scales with spin ratio S = (r * omega) / v
  const spinRatio = (CONSTANTS.BALL_RADIUS * omegaMag) / vMag;
  const C_L = 0.16 + 0.55 * spinRatio; // Empirical aerodynamics relationship
  const crossOmegaV = vecCross(omegaVec, v);
  const liftFactor = (0.5 * CONSTANTS.AIR_DENSITY * C_L * CONSTANTS.AREA) / omegaMag;
  const F_L = vecScale(crossOmegaV, liftFactor);

  // Total Force & Acceleration
  const F_total = vecAdd(vecAdd(F_g, F_d), F_L);
  const a = vecScale(F_total, 1 / CONSTANTS.BALL_MASS);

  return [v[0], v[1], v[2], a[0], a[1], a[2]];
}

/**
 * Runge-Kutta 4th Order (RK4) Step Integration
 */
function rk4Step(state, dt, omegaVec, omegaMag) {
  const k1 = computeDerivative(state, omegaVec, omegaMag);
  const stateK2 = state.map((val, i) => val + 0.5 * dt * k1[i]);
  const k2 = computeDerivative(stateK2, omegaVec, omegaMag);
  const stateK3 = state.map((val, i) => val + 0.5 * dt * k2[i]);
  const k3 = computeDerivative(stateK3, omegaVec, omegaMag);
  const stateK4 = state.map((val, i) => val + dt * k3[i]);
  const k4 = computeDerivative(stateK4, omegaVec, omegaMag);

  return state.map((val, i) => val + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

/**
 * Simulates full 3D trajectory from launch until ground impact (y <= 0)
 * @param {string} clubKey - Key from CLUB_PRESETS ('DRIVER', 'SEVEN_IRON', 'PITCHING_WEDGE')
 * @param {string} shapeKey - Key from SHOT_SHAPES ('STRAIGHT', 'DRAW', 'FADE')
 * @param {number} dt - Time step in seconds (default: 0.005s = 200Hz simulation)
 * @returns {Array<{x: number, y: number, z: number, t: number, v: number}>} Time-series trajectory array
 */
export function simulateTrajectory(clubKey = 'DRIVER', shapeKey = 'STRAIGHT', dt = 0.005) {
  const club = CLUB_PRESETS[clubKey] || CLUB_PRESETS.DRIVER;
  const shape = SHOT_SHAPES[shapeKey] || SHOT_SHAPES.STRAIGHT;

  // Initial velocity components (+X down range, +Y altitude, +Z lateral right)
  const v0 = club.ballSpeedMs;
  const theta = club.launchAngleRad;
  const vx0 = v0 * Math.cos(theta);
  const vy0 = v0 * Math.sin(theta);
  const vz0 = 0;

  // Spin vector setup: Backspin creates horizontal spin axis along +Z axis pointing right.
  // Tilting spin axis around +X vector creates draw (-5 deg) or fade (+5 deg).
  const omegaMag = club.spinRateRads;
  const tilt = shape.spinAxisTiltDeg * DEG_TO_RAD;
  const omegaVec = [
    0,                             // omega_x
    omegaMag * Math.sin(tilt),     // omega_y causes side spin / curvature
    omegaMag * Math.cos(tilt),     // omega_z causes primary vertical backspin lift
  ];

  let state = [0, 0, 0, vx0, vy0, vz0]; // [x, y, z, vx, vy, vz]
  let t = 0;

  const trajectory = [{
    x: 0, y: 0, z: 0, t: 0, v: v0
  }];

  // Integrate until ball impacts ground (y <= 0) or timeout at 12s
  while (state[1] >= 0 || t === 0) {
    if (t > 12.0) break;
    state = rk4Step(state, dt, omegaVec, omegaMag);
    t += dt;

    const currentSpeed = Math.hypot(state[3], state[4], state[5]);
    trajectory.push({
      x: state[0],
      y: Math.max(0, state[1]),
      z: state[2],
      t: Number(t.toFixed(4)),
      v: currentSpeed,
    });

    if (state[1] <= 0 && t > 0.1) break;
  }

  return trajectory;
}

/**
 * Velocity-Mapped Animation Sampler
 * Decoupled from spatial distance; strictly bound to physics simulation time domain `t`.
 * High launch velocity yields fastest spatial line progression; slows down naturally at apex.
 */
export function getTrajectoryPointAtTime(trajectory, renderTimeSeconds, timeScale = 0.5) {
  if (!trajectory || trajectory.length === 0) return null;
  const simTime = renderTimeSeconds / timeScale; // Convert render cursor to simulation time domain t

  // Exact time match or clamp to end
  const lastPt = trajectory[trajectory.length - 1];
  if (simTime >= lastPt.t) return lastPt;
  if (simTime <= 0) return trajectory[0];

  // Binary search or linear interpolation across time domain dt bounds
  for (let i = 0; i < trajectory.length - 1; i++) {
    const p1 = trajectory[i];
    const p2 = trajectory[i + 1];
    if (simTime >= p1.t && simTime <= p2.t) {
      const alpha = (simTime - p1.t) / (p2.t - p1.t);
      return {
        x: p1.x + alpha * (p2.x - p1.x),
        y: p1.y + alpha * (p2.y - p1.y),
        z: p1.z + alpha * (p2.z - p1.z),
        t: simTime,
        v: p1.v + alpha * (p2.v - p1.v),
      };
    }
  }
  return lastPt;
}

/**
 * Maps simulation time `t` to screen Bézier parameter `u` [0, 1] accounting for:
 * 1. Exact synchronization of 3D physical apex (max altitude y) to 2D screen apex (u = 0.5).
 * 2. Perspective projection acceleration right off the clubface.
 * 3. Club launch profiles (explosive launch speed off tee, smooth hang time at apex).
 */
export function mapPhysicsTimeToScreenProgress(trajectory, simTime, clubKey = 'DRIVER') {
  if (!trajectory || trajectory.length === 0) return 0;
  const lastPt = trajectory[trajectory.length - 1];
  if (simTime <= 0) return 0;

  // Find exact apex point in simulation (max y)
  let apexIdx = 0;
  let maxY = -1;
  for (let i = 0; i < trajectory.length; i++) {
    if (trajectory[i].y > maxY) {
      maxY = trajectory[i].y;
      apexIdx = i;
    }
  }
  const T_apex = trajectory[apexIdx]?.t || (lastPt.t * 0.5);

  // Perspective launch weighting (p < 1 creates fast initial burst off tee matching camera view)
  // Driver bursts out fastest (0.42), 7-Iron balanced (0.52), Wedge floats/hangs (0.62)
  const power = clubKey === 'DRIVER' ? 0.42 : clubKey === 'SEVEN_IRON' ? 0.52 : 0.62;

  if (simTime <= T_apex) {
    // Phase 1: Launch to Apex -> maps strictly to screen u in [0, 0.5]
    // Faster initial acceleration up for all clubs; longer clubs (Driver) decelerate slower while rising
    const tau = simTime / T_apex;
    const power = clubKey === 'DRIVER' ? 0.4 : clubKey === 'SEVEN_IRON' ? 0.45 : 0.50;
    return 0.5 * Math.pow(tau, power);
  } else {
    // Phase 2: Apex to Landing -> maps strictly to screen u in [0.5, 1.0]
    // Longer clubs stay in the air longer and fall slower (Driver has highest hang time stretch)
    const stretch = clubKey === 'DRIVER' ? 3.90 : clubKey === 'SEVEN_IRON' ? 2.80 : 1.95;
    const T_desc = (lastPt.t - T_apex) * stretch;
    if (T_desc <= 0) return 1;
    const tau = Math.min(1, (simTime - T_apex) / T_desc);
    const descPower = clubKey === 'DRIVER' ? 0.7 : clubKey === 'SEVEN_IRON' ? 0.9 : 1.1;
    return 0.5 + 0.5 * Math.pow(tau, descPower);
  }
}

