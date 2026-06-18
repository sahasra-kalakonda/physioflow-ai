// PHYSIOFLOW AI - MOCK AI POSTURE CAMERA ENGINE

let videoEl = null;
let canvasEl = null;
let ctx = null;
let stream = null;
let isRunning = false;
let selectedExercise = 'squat';
let animationFrameId = null;
let toastCallback = null;

// Simulation State variables
let simTime = 0;
let feedbackTimer = 0;

// Skeleton joints structure for rendering
const joints = {
  head: { x: 0, y: 0 },
  neck: { x: 0, y: 0 },
  shoulderL: { x: 0, y: 0 },
  shoulderR: { x: 0, y: 0 },
  elbowL: { x: 0, y: 0 },
  elbowR: { x: 0, y: 0 },
  wristL: { x: 0, y: 0 },
  wristR: { x: 0, y: 0 },
  hipL: { x: 0, y: 0 },
  hipR: { x: 0, y: 0 },
  kneeL: { x: 0, y: 0 },
  kneeR: { x: 0, y: 0 },
  ankleL: { x: 0, y: 0 },
  ankleR: { x: 0, y: 0 }
};

export function initPosture(showToast) {
  toastCallback = showToast;
  videoEl = document.getElementById('webcam-video');
  canvasEl = document.getElementById('skeleton-canvas');
  const btnWebcam = document.getElementById('btn-enable-webcam');
  const btnSimulate = document.getElementById('btn-simulate-feed');
  const btnStop = document.getElementById('btn-stop-webcam');
  const exerciseSelect = document.getElementById('exercise-select');

  if (!canvasEl) return;
  ctx = canvasEl.getContext('2d');

  // Set up listeners
  btnWebcam.addEventListener('click', startWebcam);
  btnSimulate.addEventListener('click', startSimulationOnly);
  
  if (btnStop) {
    btnStop.addEventListener('click', stopPosture);
  }

  exerciseSelect.addEventListener('change', (e) => {
    selectedExercise = e.target.value;
    addCoachingMessage('Fizzz Coach', `Switched Snazzsture mode → ${selectedExercise.toUpperCase()}. Rezzzalibrating...`, 'system-msg');
  });

  // Handle canvas sizing
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  if (!canvasEl) return;
  const parent = canvasEl.parentElement;
  canvasEl.width = parent.clientWidth;
  canvasEl.height = parent.clientHeight;
}

// Start webcam feed and simulation loop
async function startWebcam() {
  try {
    stopPosture(); // Reset any active loops
    
    // Request webcam access
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 360, facingMode: 'user' }
    });
    
    videoEl.srcObject = stream;
    videoEl.classList.remove('hidden');
    document.getElementById('camera-fallback').classList.add('hidden');
    document.getElementById('btn-stop-webcam').classList.remove('hidden');
    
    isRunning = true;
    startAnimationLoop();
    
    if (toastCallback) {
      toastCallback('Buzzz-cam Online 📷', 'Skeletzzzon Engine is live and tracking!');
    }
    addCoachingMessage('Fizzz Coach', 'Buzzz-cam online. Position your whole body in the frame.', 'system-msg');
  } catch (err) {
    console.error('Camera connection failed:', err);
    if (toastCallback) {
      toastCallback('Webcam Error', 'Could not open camera. Starting simulation mode.');
    }
    startSimulationOnly();
  }
}

// Start simulation mode only (without webcam)
function startSimulationOnly() {
  stopPosture();
  videoEl.classList.add('hidden');
  document.getElementById('camera-fallback').classList.add('hidden');
  document.getElementById('btn-stop-webcam').classList.remove('hidden');
  
  isRunning = true;
  startAnimationLoop();

  if (toastCallback) {
    toastCallback('Fizzzulation Active ⚡', 'Skeletzzzon model is buzzing!');
  }
  addCoachingMessage('Fizzz Coach', 'Fizzzulation Engine online. Select a practice to zzzero in.', 'system-msg');
}

// Stop all tracking loops
export function stopPosture() {
  isRunning = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  
  if (videoEl) {
    videoEl.srcObject = null;
    videoEl.classList.add('hidden');
  }
  
  const fallback = document.getElementById('camera-fallback');
  if (fallback) fallback.classList.remove('hidden');
  
  const btnStop = document.getElementById('btn-stop-webcam');
  if (btnStop) btnStop.classList.add('hidden');

  if (ctx && canvasEl) {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  }
}

// Animation core loop
function startAnimationLoop() {
  function tick() {
    if (!isRunning) return;
    
    simTime += 0.03;
    renderSkeleton();
    
    animationFrameId = requestAnimationFrame(tick);
  }
  tick();
}

// Biomechanical skeleton model rendering
function renderSkeleton() {
  const w = canvasEl.width;
  const h = canvasEl.height;
  ctx.clearRect(0, 0, w, h);

  // Draw cyber digital scanner grid overlay
  drawScannerGrid(w, h);

  // Calculate simulated skeleton joints based on exercise
  calculateJointCoordinates(w, h);

  // Draw Bones
  drawBones();

  // Draw Joint Nodes
  drawNodes();

  // Analyze angles and output coaching advice
  analyzePostureMetrics();
}

function drawScannerGrid(w, h) {
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
  ctx.lineWidth = 1;
  
  // Vertical lines
  const cols = 16;
  for (let i = 0; i <= cols; i++) {
    const x = (w / cols) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  
  // Horizontal lines
  const rows = 9;
  for (let i = 0; i <= rows; i++) {
    const y = (h / rows) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

// Math equations mapping human joints coordinate kinematics
function calculateJointCoordinates(w, h) {
  const cx = w / 2;
  const cy = h / 2;
  
  if (selectedExercise === 'squat') {
    // Squat cycle (up and down)
    // Hips go down, knees bend outwards
    const cycle = Math.sin(simTime) * 0.5 + 0.5; // 0 (standing) to 1 (deep squat)
    
    const headY = cy - 70 + (cycle * 50);
    const shoulderY = cy - 40 + (cycle * 55);
    const hipY = cy + 30 + (cycle * 60);
    const kneeY = cy + 100 + (cycle * 25);
    const ankleY = cy + 150;
    
    // Knee displacement (knees push outwards slightly)
    const kneeDisplace = cycle * 12;

    joints.head = { x: cx, y: headY };
    joints.neck = { x: cx, y: cy - 50 + (cycle * 50) };
    
    joints.shoulderL = { x: cx - 35, y: shoulderY };
    joints.shoulderR = { x: cx + 35, y: shoulderY };
    
    // Hands out in front
    joints.elbowL = { x: cx - 65 - (cycle * 15), y: shoulderY - 10 };
    joints.elbowR = { x: cx + 65 + (cycle * 15), y: shoulderY - 10 };
    joints.wristL = { x: cx - 95, y: shoulderY - 15 };
    joints.wristR = { x: cx + 95, y: shoulderY - 15 };
    
    joints.hipL = { x: cx - 22, y: hipY };
    joints.hipR = { x: cx + 22, y: hipY };
    
    joints.kneeL = { x: cx - 35 - kneeDisplace, y: kneeY };
    joints.kneeR = { x: cx + 35 + kneeDisplace, y: kneeY };
    
    joints.ankleL = { x: cx - 30, y: ankleY };
    joints.ankleR = { x: cx + 30, y: ankleY };

  } else if (selectedExercise === 'warrior') {
    // Yoga Warrior II
    // Wide stance, arms extended flat, front knee bent, back leg straight
    joints.head = { x: cx - 10, y: cy - 70 };
    joints.neck = { x: cx - 10, y: cy - 50 };
    
    joints.shoulderL = { x: cx - 40, y: cy - 35 };
    joints.shoulderR = { x: cx + 20, y: cy - 35 };
    
    // Left arm straight out to the left
    joints.elbowL = { x: cx - 80, y: cy - 35 + Math.sin(simTime * 2) * 2 };
    joints.wristL = { x: cx - 120, y: cy - 35 + Math.sin(simTime * 2) * 3 };
    
    // Right arm straight out to the right
    joints.elbowR = { x: cx + 65, y: cy - 35 - Math.sin(simTime * 2) * 2 };
    joints.wristR = { x: cx + 110, y: cy - 35 - Math.sin(simTime * 2) * 3 };
    
    joints.hipL = { x: cx - 30, y: cy + 30 };
    joints.hipR = { x: cx + 10, y: cy + 30 };
    
    // Left leg bent (front leg)
    const kneeBendCycle = Math.sin(simTime * 0.5) * 10;
    joints.kneeL = { x: cx - 65 + kneeBendCycle, y: cy + 85 };
    joints.ankleL = { x: cx - 75, y: cy + 140 };
    
    // Right leg straight (back leg)
    joints.kneeR = { x: cx + 50, y: cy + 85 };
    joints.ankleR = { x: cx + 90, y: cy + 140 };

  } else if (selectedExercise === 'plank') {
    // Plank horizontal stability
    // Body should form straight line
    // Add realistic core shaking (high frequency micro tremors)
    const shake = Math.sin(simTime * 45) * 1.5;
    
    // Body angled slightly
    const startX = cx - 120;
    const startY = cy + 40;
    
    joints.ankleL = { x: startX, y: startY };
    joints.ankleR = { x: startX + 5, y: startY + 5 };
    
    joints.kneeL = { x: startX + 50, y: startY - 15 + shake * 0.2 };
    joints.kneeR = { x: startX + 53, y: startY - 10 + shake * 0.2 };
    
    joints.hipL = { x: startX + 110, y: startY - 35 + shake * 0.6 };
    joints.hipR = { x: startX + 112, y: startY - 30 + shake * 0.6 };
    
    joints.shoulderL = { x: startX + 190, y: startY - 55 + shake };
    joints.shoulderR = { x: startX + 192, y: startY - 50 + shake };
    
    joints.neck = { x: startX + 210, y: startY - 60 };
    joints.head = { x: startX + 225, y: startY - 67 };
    
    // Arms supporting elbow on ground
    joints.elbowL = { x: startX + 190, y: startY + 5 };
    joints.elbowR = { x: startX + 192, y: startY + 8 };
    joints.wristL = { x: startX + 220, y: startY + 5 };
    joints.wristR = { x: startX + 222, y: startY + 8 };
  }
}

// Draw skeleton lines (Bones)
function drawBones() {
  ctx.strokeStyle = 'hsl(145, 80%, 50%)'; // glowing neon emerald green
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.shadowBlur = 8;
  ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
  
  const bonePairs = [
    [joints.head, joints.neck],
    [joints.neck, joints.shoulderL],
    [joints.neck, joints.shoulderR],
    [joints.shoulderL, joints.elbowL],
    [joints.elbowL, joints.wristL],
    [joints.shoulderR, joints.elbowR],
    [joints.elbowR, joints.wristR],
    [joints.shoulderL, joints.hipL],
    [joints.shoulderR, joints.hipR],
    [joints.hipL, joints.kneeL],
    [joints.kneeL, joints.ankleL],
    [joints.hipR, joints.kneeR],
    [joints.kneeR, joints.ankleR]
  ];

  bonePairs.forEach(pair => {
    ctx.beginPath();
    ctx.moveTo(pair[0].x, pair[0].y);
    ctx.lineTo(pair[1].x, pair[1].y);
    ctx.stroke();
  });

  // Reset shadow
  ctx.shadowBlur = 0;
}

// Draw skeleton circles (Nodes)
function drawNodes() {
  ctx.fillStyle = 'hsl(270, 85%, 65%)'; // purple nodes
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  
  Object.keys(joints).forEach(key => {
    const joint = joints[key];
    ctx.beginPath();
    ctx.arc(joint.x, joint.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

// Biomechanics Trigonometric Calculations (Angles)
function getAngle(p1, p2, p3) {
  // Angle between p1-p2 and p2-p3 (p2 is vertex)
  const rad = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs(rad * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return Math.round(angle);
}

// Real-time alignment checker
function analyzePostureMetrics() {
  const badge = document.getElementById('alignment-quality');
  const angle1Name = document.getElementById('angle-1-name');
  const angle1Bar = document.getElementById('angle-1-progress');
  const angle1Val = document.getElementById('angle-1-val');
  const angle2Name = document.getElementById('angle-2-name');
  const angle2Bar = document.getElementById('angle-2-progress');
  const angle2Val = document.getElementById('angle-2-val');

  if (selectedExercise === 'squat') {
    // Metric 1: Knee flexion (Left Leg: hipL - kneeL - ankleL)
    const kneeAngle = getAngle(joints.hipL, joints.kneeL, joints.ankleL);
    angle1Name.textContent = 'Knee Flexion Angle';
    angle1Val.textContent = `${kneeAngle}° / 90°`;
    
    // Knee progress: deep squat is around 90-100 degrees
    let kneeScore = 0;
    if (kneeAngle > 160) kneeScore = 10; // Standing
    else if (kneeAngle > 120) kneeScore = 40; // Mid squat
    else if (kneeAngle >= 85 && kneeAngle <= 110) kneeScore = 100; // Perfect depth
    else kneeScore = 70; // Too deep
    
    angle1Bar.style.width = `${Math.min(100, Math.max(0, (180 - kneeAngle) / 90 * 100))}%`;

    // Metric 2: Hip-Torso Alignment (shoulderL - hipL - kneeL)
    const torsoAngle = getAngle(joints.shoulderL, joints.hipL, joints.kneeL);
    angle2Name.textContent = 'Hip-Torso Tilt';
    angle2Val.textContent = `${torsoAngle}° / 80°`;
    angle2Bar.style.width = `${Math.min(100, Math.max(0, (180 - torsoAngle) / 100 * 100))}%`;

    // Coaching feedback updates
    feedbackTimer++;
    if (feedbackTimer > 90) {
      feedbackTimer = 0;
      if (kneeAngle < 100 && torsoAngle > 75) {
        badge.textContent = 'Excellent';
        badge.className = 'active-badge success';
        addCoachingMessage('Fizzz Coach', 'Nailed it! Squat depth is zzzpot on. Drive through those heels!', 'success-msg');
      } else if (kneeAngle >= 140) {
        badge.textContent = 'Analyzing';
        badge.className = 'active-badge';
        addCoachingMessage('Fizzz Coach', 'Sinking in... keep that spine zzzero-tilted.', 'system-msg');
      } else if (torsoAngle < 70) {
        badge.textContent = 'Form Warning';
        badge.className = 'active-badge danger';
        addCoachingMessage('Fizzz Coach', '⚠️ Chest caving! Fizzzix it — raise up, shoulders back.', 'warning-msg');
      }
    }

  } else if (selectedExercise === 'warrior') {
    // Warrior Pose:
    // Metric 1: Front knee angle (hipL - kneeL - ankleL) should be ~90°-110°
    const kneeAngle = getAngle(joints.hipL, joints.kneeL, joints.ankleL);
    angle1Name.textContent = 'Front Knee Angle';
    angle1Val.textContent = `${kneeAngle}° / 90°`;
    angle1Bar.style.width = `${Math.min(100, Math.max(0, (180 - kneeAngle) / 90 * 100))}%`;

    // Metric 2: Arm extension alignment (wristL - shoulderL - shoulderR) should be ~180°
    const armAngle = getAngle(joints.wristL, joints.shoulderL, joints.shoulderR);
    angle2Name.textContent = 'Shoulder-Arm Line';
    angle2Val.textContent = `${armAngle}° / 180°`;
    angle2Bar.style.width = `${Math.min(100, Math.max(0, armAngle / 180 * 100))}%`;

    feedbackTimer++;
    if (feedbackTimer > 90) {
      feedbackTimer = 0;
      if (armAngle > 170 && kneeAngle < 120) {
        badge.textContent = 'Perfect Pose';
        badge.className = 'active-badge success';
        addCoachingMessage('Fizzz Coach', 'Snazzsture is on point! Lock that gaze over your front hand.', 'success-msg');
      } else if (armAngle <= 170) {
        badge.textContent = 'Align Arms';
        badge.className = 'active-badge';
        addCoachingMessage('Fizzz Coach', '⚠️ Arms droooping! Fizzzix it — wrists level with shoulders.', 'warning-msg');
      }
    }

  } else if (selectedExercise === 'plank') {
    // Plank:
    // Metric 1: Core Straightness (shoulderL - hipL - ankleL) should be close to 180°
    const coreAngle = getAngle(joints.shoulderL, joints.hipL, joints.ankleL);
    angle1Name.textContent = 'Core Neutral Angle';
    angle1Val.textContent = `${coreAngle}° / 175°`;
    angle1Bar.style.width = `${Math.min(100, Math.max(0, coreAngle / 180 * 100))}%`;

    // Metric 2: Shoulder support alignment (elbowL - shoulderL - hipL) should be ~90°
    const supportAngle = getAngle(joints.elbowL, joints.shoulderL, joints.hipL);
    angle2Name.textContent = 'Elbow-Shoulder Angle';
    angle2Val.textContent = `${supportAngle}° / 90°`;
    angle2Bar.style.width = `${Math.min(100, Math.max(0, supportAngle / 90 * 100))}%`;

    feedbackTimer++;
    if (feedbackTimer > 90) {
      feedbackTimer = 0;
      if (coreAngle > 170) {
        badge.textContent = 'Stable';
        badge.className = 'active-badge success';
        addCoachingMessage('Fizzz Coach', 'Zzzolid plank! Core locked in, glutes buzzing. Hold the line!', 'success-msg');
      } else {
        badge.textContent = 'Sagging Hips';
        badge.className = 'active-badge danger';
        addCoachingMessage('Fizzz Coach', '⚠️ Hips zzzonking down! Fizzzix it — lift that midsection, fire up the core.', 'warning-msg');
      }
    }
  }
}

// Add coaching prompt into scrollable sidebar
function addCoachingMessage(sender, text, msgClass) {
  const feed = document.getElementById('coaching-feed');
  if (!feed) return;
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const msgEl = document.createElement('div');
  msgEl.className = `coaching-msg ${msgClass}`;
  msgEl.innerHTML = `
    <span class="msg-time">${sender} • ${timeStr}</span>
    <span class="msg-text">${text}</span>
  `;
  
  feed.appendChild(msgEl);
  
  // Scroll to bottom
  feed.scrollTop = feed.scrollHeight;
  
  // Cap messages at 15
  while (feed.childElementCount > 15) {
    feed.removeChild(feed.firstChild);
  }
}
