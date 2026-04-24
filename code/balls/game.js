// ═══════════════════════════════════════════════════════════════════════════
// GOLF BALL GAME — Babylon.js + Havok Physics
// ═══════════════════════════════════════════════════════════════════════════
//
// A 3D golf game with physics-based ball movement, procedural terrain,
// and character animation. Uses Babylon.js for rendering and Havok for physics.
//
// Architecture:
//  - CONFIG: Centralized tuning constants
//  - Utilities: EventManager, Utils, TrajectoryArrow
//  - Core Systems: Wind, Physics, Camera, Character
//  - Input & UI: InputHandler, UIManager, SwipeArrowOverlay
//  - Scene Setup: SceneSetup, GolfGame (main orchestrator)
//
// ═══════════════════════════════════════════════════════════════════════════

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const GameState = { AIM: "aim", PLAY: "play", LANDED: "landed" };
const CameraViewMode = { PLAY: "play", SHOT_REVIEW: "shotReview" };
// ─── CONFIGURATION ──────────────────────────────────────────────────────────

const CONFIG = {
  ENVIRONMENT: {
    ENV_TEXTURE_PATH: "assets/puresky.env",
    SKYBOX_ENABLED: true,
    SKYBOX_SIZE: 1000,
    SKYBOX_PBRBRIGHT: 0,
  },
  TERRAIN: {
    WIDTH: 2500,
    HEIGHT: 2500,
    SUBDIVISIONS: 50,
    FRICTION: 0.4,
    RESTITUTION: 0.3,
    TEXTURE_PATH: "assets/ground.png",
    NORMAL_MAP_PATH: "assets/groundnormals.png",
    UV_TILING: 500,
  },
  BALL: {
    COLLIDER_DIAMETER: 0.9,
    MASS: 0.045,
    FRICTION: 0.7,
    RESTITUTION: 0.6,
    LINEAR_DAMPING: 0.3,
    ANGULAR_DAMPING: 0.8,
  },
  CAMERA: {
    FOV_AIM: 2.0,
    FOV_PLAY: 1.75,
    FOV_DEFAULT: 1.25,
    FOLLOW_SMOOTH: 0.1,
    POSITION_LERP_SPEED: 0.15,
    ANGLE_LERP_SPEED: 0.08,
  },
  GRASS: {
    VIEW_RADIUS: 60,
    UPDATE_THRESHOLD: 5,
    FRAME_COUNT: 5,
    BILLBOARD_MODE: BABYLON.Mesh.BILLBOARDMODE_ALL,
  },
  LIGHTING: {
    AMBIENT_INTENSITY: 0.75,
    SUN_INTENSITY: 1.1,
  },
  BALL_VISUAL: {
    PBR_METALLIC: 0,
    PBR_ROUGHNESS: 1,
    PBR_ENV_INTENSITY: 0.35,
    PBR_MICRO_SURFACE: 0.2,
    STANDARD_SPECULAR: 0.03,
  },
  AIM_VIEW: {
    CAMERA_DISTANCE: 15,
    CAMERA_HEIGHT: 8,
    CAMERA_HEIGHT_MIN: 3,
    CAMERA_HEIGHT_MAX: 15,
    MOUSE_ROTATION_SENSITIVITY: 0.005,
    MOUSE_HEIGHT_SENSITIVITY: 0.01,
    CLICK_DETECTION_THRESHOLD: 5,
  },
  TRAJECTORY: {
    ARROW_LENGTH: 12,
    ARROW_RADIUS: 0.15,
    ARROW_Y_OFFSET: 0.5,
  },
  FOLLOW_CAMERA: {
    PLAY_VIEW_OFFSET_X: 0,
    PLAY_VIEW_OFFSET_Y: 0,
    PLAY_VIEW_OFFSET_Z: 2,
    PLAY_VIEW_LOOK_OFFSET_Y: 1.5,
    PLAY_VIEW_LOOK_OFFSET_Z: -5,
    FULL_SHOT_VIEW_MIN_HEIGHT: 8,
    FULL_SHOT_VIEW_MIN_Z: 15,
    FULL_SHOT_VIEW_LOOK_Z: -30,
    FULL_SHOT_VIEW_SCALE_X: 0.2,
    FULL_SHOT_VIEW_SCALE_Y: 0.35,
    FULL_SHOT_VIEW_SCALE_Z: 0.5,
    FULL_SHOT_VIEW_SCALE_LOOK_Z: 0.6,
    OVERVIEW_ORBIT_SENSITIVITY: 0.005,
  },
  GOLF_BALL: {
    MAX_HIT_STRENGTH: 1.75,
    HIT_HORIZONTAL_DEVIATION_FACTOR: 0.1,
    IMPACT_POINT_OFFSET_X: 0,
    IMPACT_POINT_OFFSET_Y: -0.3,
    IMPACT_POINT_OFFSET_Z: 0.3,
  },
  BLINKING: {
    MIN_INTERVAL_MS: 2500,
    MAX_INTERVAL_MS: 5000,
    BLINK_CLOSE_DURATION_MS: 100,
    BLINK_HOLD_DURATION_MS: 50,
    BLINK_OPEN_DURATION_MS: 100,
  },
  EYES: {
    MAX_YAW: 0.25,      // radians (~14°) — left/right gaze limit
    MAX_PITCH: 0.18,    // radians (~10°) — up/down gaze limit
    LERP_SPEED: 6,      // exponential smoothing factor
  },
  UI: {
    CLUB_SELECTOR_BOTTOM: 20,
    CLUB_SELECTOR_RIGHT: 20,
    CLUB_BUTTON_WIDTH: 50,
    CLUB_BUTTON_HEIGHT: 30,
  },
  PINS: {
    GREEN_RADIUS: 30,
    PIN_HEIGHT: 4.0,
    PIN_DIAMETER: 0.3,
    PIN_Y_OFFSET: 2.0,
    GREEN_Y_OFFSET: 0.05,
    GREEN_TEXTURE_PATH: "assets/puttingground.png",
    GREEN_NORMAL_MAP_PATH: "assets/puttinggroundnormals.png",
    GREEN_UV_TILING: 10,
    PIN_COLLISION_RADIUS: 0.3,
    PIN_COLLISION_MIN_SPEED: 0.5,
    PIN_FLASH_SCALE_Y: 2,
    PIN_FLASH_DURATION_MS: 100,
  },
  TRAIL: {
    MAX_POINTS: 60,
    MAX_AGE_MS: 3000,
    MIN_DISTANCE_BETWEEN_POINTS: 4,
    UPDATE_FREQUENCY: 1,
    TRAIL_RADIUS: 0.06,
  },
  SWIPE_OVERLAY: {
    START_X_PCT: 0.5,
    START_Y_PCT: 0.82,
    IDEAL_ALPHA: 0.35,
    IDEAL_WIDTH: 5,
    HIT_WIDTH: 5,
    SPIN_WIDTH: 4,
    HIT_FADE_MS: 750,
    SPIN_FADE_MS: 300,
    MIN_PREVIEW_LENGTH: 24,
    IDEAL_MIN_PREVIEW_LENGTH: 8,
    MAX_PREVIEW_LENGTH: 110,
    VISUAL_SCALE: 2.0,
    PHYSICS_STEP_SECONDS: 1 / 60,
    BOUNCE_RANGE_MULTIPLIER: 1.12,
    MIN_FORWARD_FORCE: 8,
    MAX_LATERAL_RATIO: 0.45,
    MAX_LATERAL_FORCE: 10,
    AIM_SELECTION_ANGLE_RAD: 0.25,
    IDEAL_COLOR: "#fff5a8",
    HIT_COLOR: "#ffd54f",
    SPIN_COLORS: ["#55d6ff", "#8cff66", "#ff8cf5", "#ff9966"],
  },
  WIND: {
    MIN_SPEED: 0,
    MAX_SPEED: 10,
    CHANGE_FREQUENCY: 8000,
    FORCE_MULTIPLIER: 0.025,
    COMPASS_SIZE: 140,
    COMPASS_TOP: 15,
    COMPASS_RIGHT: 15,
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// UTILITIES & INFRASTRUCTURE
// ═════════════════════════════════════════════════════════════════════════════

// ─── WIND SYSTEM ────────────────────────────────────────────────────────────
// Manages wind direction and speed; applies procedural force to airborne balls.

class Wind {
  constructor() {
    this.direction = 0; // radians, 0 = right (East), PI/2 = down (South), etc.
    this.speed = 0; // m/s
    this.nextChangeTime = Date.now() + CONFIG.WIND.CHANGE_FREQUENCY;
    this.generateNewWind();
  }

  update() {
    // Wind changes are now controlled manually via compass
  }

  generateNewWind() {
    this.direction = Math.random() * Math.PI * 2; // 0 to 2π
    this.speed =
      CONFIG.WIND.MIN_SPEED +
      Math.random() * (CONFIG.WIND.MAX_SPEED - CONFIG.WIND.MIN_SPEED);
  }

  getWindVector() {
    // Convert polar coordinates to Cartesian
    // x = left/right in world coords (negative X = West, positive X = East)
    // z = forward/backward in world coords (positive Z = North, negative Z = South)
    return new BABYLON.Vector3(
      -Math.sin(this.direction) * this.speed,
      0,
      Math.cos(this.direction) * this.speed,
    );
  }

  getForceVector() {
    const windVec = this.getWindVector();
    return windVec.scale(CONFIG.WIND.FORCE_MULTIPLIER);
  }

  reset() {
    this.generateNewWind();
    this.nextChangeTime = Date.now() + CONFIG.WIND.CHANGE_FREQUENCY;
  }
}

// ─── EVENT MANAGER ──────────────────────────────────────────────────────────

class EventManager {
  constructor() {
    this.listeners = {};
  }

  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  off(eventName, callback) {
    if (!this.listeners[eventName]) return;
    this.listeners[eventName] = this.listeners[eventName].filter(
      (cb) => cb !== callback,
    );
  }

  emit(eventName, data = null) {
    if (!this.listeners[eventName]) return;
    this.listeners[eventName].forEach((callback) => callback(data));
  }
}

// ─── UTILITY HELPERS ────────────────────────────────────────────────────────

const Utils = {
  // Create StandardMaterial with common properties
  createMaterial(name, scene, color, specular = null, power = 16) {
    const mat = new BABYLON.StandardMaterial(name, scene);
    mat.diffuseColor = color;
    if (specular) {
      mat.specularColor = specular;
      mat.specularPower = power;
    }
    return mat;
  },

  // Rotate 2D vector by angle
  rotate2D(x, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos - z * sin,
      z: x * sin + z * cos,
    };
  },

  // Add shadow caster to all meshes in array
  addShadowCasters(meshes, shadowGenerator) {
    meshes.forEach((m) => {
      if (m) shadowGenerator?.addShadowCaster(m, true);
    });
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// GAME MECHANICS
// ═════════════════════════════════════════════════════════════════════════════

// ─── CLUB DATA ──────────────────────────────────────────────────────────────

class ClubData {
  static CLUBS = [
    { id: 0, name: "Putter", angle: 0, maxDistance: 10 },
    { id: 1, name: "Pitching Wedge", angle: 45, maxDistance: 60 },
    { id: 2, name: "9 Iron", angle: 42, maxDistance: 80 },
    { id: 3, name: "8 Iron", angle: 39, maxDistance: 100 },
    { id: 4, name: "7 Iron", angle: 37, maxDistance: 120 },
    { id: 5, name: "6 Iron", angle: 34, maxDistance: 140 },
    { id: 6, name: "5 Iron", angle: 31, maxDistance: 160 },
    { id: 7, name: "4 Iron", angle: 28, maxDistance: 180 },
    { id: 8, name: "3 Iron", angle: 25, maxDistance: 200 },
    { id: 9, name: "Hybrid", angle: 20, maxDistance: 220 },
    { id: 10, name: "3 Wood", angle: 16, maxDistance: 240 },
    { id: 11, name: "5 Wood", angle: 19, maxDistance: 230 },
    { id: 12, name: "Driver", angle: 12, maxDistance: 280 },
    { id: 13, name: "Driver Long", angle: 10, maxDistance: 300 },
  ];

  static getClub(id) {
    return this.CLUBS[Math.max(0, Math.min(id, this.CLUBS.length - 1))];
  }
}

// ─── TRAJECTORY ARROW ──────────────────────────────────────────────────────

class TrajectoryArrow {
  constructor(scene, ballPos) {
    this.scene = scene;
    this.ballPos = ballPos;
    this.arrow = null;
    this.arrowShadow = null;
    this.lastArrowAngle = -1;
  }

  create(clubAngle = 12) {
    if (this.arrow) this.arrow.dispose();
    if (this.arrowShadow) this.arrowShadow.dispose();

    // Create arrow tube with proper launch angle baked into the path
    // Angle 0° = horizontal, 45° = steep upward
    const angleDeg = Math.max(0, Math.min(clubAngle || 12, 60));
    const angleRad = (angleDeg * Math.PI) / 180;
    
    // Arrow extends backward and upward based on launch angle
    const arrowLen = CONFIG.TRAJECTORY.ARROW_LENGTH;
    const points = [
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(
        0,
        arrowLen * Math.sin(angleRad),  // Height based on angle
        -arrowLen * Math.cos(angleRad), // Horizontal reach
      ),
    ];

    this.arrow = BABYLON.MeshBuilder.CreateTube(
      "trajectoryArrow",
      { path: points, radius: CONFIG.TRAJECTORY.ARROW_RADIUS },
      this.scene,
    );

    const arrowMat = Utils.createMaterial(
      "arrowMat",
      this.scene,
      new BABYLON.Color3(1, 1, 0),
    );
    this.arrow.material = arrowMat;

    // Create shadow arrow (projection on ground plane)
    const shadowPoints = [
      new BABYLON.Vector3(0, 0.05, 0), // Slight offset above ground
      new BABYLON.Vector3(
        0,
        0.05,
        -arrowLen * Math.cos(angleRad), // Horizontal projection only
      ),
    ];

    this.arrowShadow = BABYLON.MeshBuilder.CreateTube(
      "trajectoryArrowShadow",
      { path: shadowPoints, radius: CONFIG.TRAJECTORY.ARROW_RADIUS * 0.8 },
      this.scene,
    );

    const shadowMat = Utils.createMaterial(
      "arrowShadowMat",
      this.scene,
      new BABYLON.Color3(0.3, 0.3, 0.3),
    );
    shadowMat.alpha = 0.5;
    this.arrowShadow.material = shadowMat;
  }

  update(ballPos, clubAngle, cameraRotation) {
    // Recreate arrow if angle changed significantly (to show new trajectory)
    if (!this.arrow || this.lastArrowAngle !== clubAngle) {
      this.create(clubAngle);
      this.lastArrowAngle = clubAngle;
    }

    this.arrow.position = ballPos.clone();
    this.arrow.position.y += CONFIG.TRAJECTORY.ARROW_Y_OFFSET;
    this.arrow.rotation.y = cameraRotation;
    this.arrow.rotation.x = 0;
    this.arrow.rotation.z = 0;

    if (this.arrowShadow) {
      this.arrowShadow.position = ballPos.clone();
      this.arrowShadow.position.y += CONFIG.TRAJECTORY.ARROW_Y_OFFSET - 0.5; // Slightly lower
      this.arrowShadow.rotation.y = cameraRotation;
      this.arrowShadow.rotation.x = 0;
      this.arrowShadow.rotation.z = 0;
    }
  }

  dispose() {
    if (this.arrow) {
      this.arrow.dispose();
      this.arrow = null;
    }
    if (this.arrowShadow) {
      this.arrowShadow.dispose();
      this.arrowShadow = null;
    }
  }
}

// ─── AIM VIEW ──────────────────────────────────────────────────────────────

class AimView {
  constructor(camera, ballMesh, golfBallGuy, scene, canvas, eventManager, game = null) {
    this.camera = camera;
    this.ballMesh = ballMesh;
    this.golfBallGuy = golfBallGuy;
    this.scene = scene;
    this.canvas = canvas;
    this.eventManager = eventManager;
    this.game = game;
    this.isActive = false;
    this.cameraDistance = CONFIG.AIM_VIEW.CAMERA_DISTANCE;
    this.cameraHeight = CONFIG.AIM_VIEW.CAMERA_HEIGHT;
    this.cameraRotation = 0;
    this.currentClub = 12;
    this.trajectoryArrow = new TrajectoryArrow(scene, ballMesh.position);
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.isDragging = false;
  }

  activate() {
    this.isActive = true;
    this.camera.fov = CONFIG.CAMERA.FOV_AIM;

    // Rotate ball and character to face away from camera in aim direction
    this.ballMesh.rotation.y = this.cameraRotation + Math.PI;
    this.golfBallGuy.setFacingAim(this.cameraRotation);

    this.setupOrbitControls();
    this.trajectoryArrow.create();
    this.updateUI();
  }

  deactivate() {
    this.isActive = false;
    this.camera.fov = CONFIG.CAMERA.FOV_PLAY;
    this.removeOrbitControls();
    this.trajectoryArrow.dispose();
    this.hideClubUI();
  }

  setupOrbitControls() {
    this.onPointerDown = (e) => {
      if (!this.isActive) return;
      this.isDragging = true;
      this.touchStartX = e.clientX;
      this.touchStartY = e.clientY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    };

    this.onPointerMove = (e) => {
      if (!this.isDragging || !this.isActive) return;
      const deltaX = e.clientX - this.lastMouseX;
      const deltaY = e.clientY - this.lastMouseY;
      this.cameraRotation +=
        deltaX * CONFIG.AIM_VIEW.MOUSE_ROTATION_SENSITIVITY;
      this.cameraHeight += deltaY * CONFIG.AIM_VIEW.MOUSE_HEIGHT_SENSITIVITY;
      this.cameraHeight = Math.max(
        CONFIG.AIM_VIEW.CAMERA_HEIGHT_MIN,
        Math.min(CONFIG.AIM_VIEW.CAMERA_HEIGHT_MAX, this.cameraHeight),
      );
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    };

    this.onPointerUp = (e) => {
      if (!this.isActive) return;
      this.isDragging = false;

      // Check if we clicked on the ball (distance from START, not from last frame)
      const deltaX = e.clientX - this.touchStartX;
      const deltaY = e.clientY - this.touchStartY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < CONFIG.AIM_VIEW.CLICK_DETECTION_THRESHOLD) {
        // Raycasting to detect ball/character click
        const pickResult = this.scene.pick(e.clientX, e.clientY);

        if (pickResult && pickResult.hit) {
          const pickedMesh = pickResult.pickedMesh;
          // Check if picked mesh is the ball or any child of the ball
          let isValidClick = false;
          if (pickedMesh === this.ballMesh || pickedMesh?.name === "gball") {
            isValidClick = true;
          } else {
            // Check if mesh is a child of the ball
            let parent = pickedMesh?.parent;
            while (parent) {
              if (parent === this.ballMesh) {
                isValidClick = true;
                break;
              }
              parent = parent.parent;
            }
          }

          if (isValidClick) {
            this.eventManager.emit("aimView:ballClicked");
          }
        }
      }
    };

    this.onKeyDown = (e) => {
      if (!this.isActive) return;
      if (e.key >= "0" && e.key <= "9") {
        this.currentClub = parseInt(e.key);
        this.updateUI();
      } else if (e.key === "q" && this.currentClub > 0) {
        this.currentClub--;
        this.updateUI();
      } else if (e.key === "e" && this.currentClub < 13) {
        this.currentClub++;
        this.updateUI();
      }
    };

    // Listen to canvas pointer events (same as InputHandler)
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerup", this.onPointerUp);
    document.addEventListener("keydown", this.onKeyDown);
  }

  removeOrbitControls() {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    document.removeEventListener("keydown", this.onKeyDown);
  }

  update() {
    if (!this.isActive) return;

    const ballPos = this.ballMesh.getAbsolutePosition();
    const cameraX =
      ballPos.x + Math.sin(this.cameraRotation) * this.cameraDistance;
    const cameraZ =
      ballPos.z + Math.cos(this.cameraRotation) * this.cameraDistance;

    this.camera.position = new BABYLON.Vector3(
      cameraX,
      ballPos.y + this.cameraHeight,
      cameraZ,
    );
    this.camera.setTarget(ballPos.add(new BABYLON.Vector3(0, 1, 0)));

    // Rotate ball and character together to face away in aim direction
    this.ballMesh.rotation.y = this.cameraRotation + Math.PI;
    this.golfBallGuy.setFacingAim(this.cameraRotation);
    this.golfBallGuy.updateRotation(0.15);

    const club = ClubData.getClub(this.currentClub);
    this.trajectoryArrow.update(ballPos, club.angle, this.cameraRotation);
  }

  updateUI() {
    const club = ClubData.getClub(this.currentClub);

    // Find best club for max distance
    const maxDistanceClub = ClubData.CLUBS.reduce((prev, curr) =>
      curr.maxDistance > prev.maxDistance ? curr : prev,
    );

    // Estimated distance for this club at full power
    const estimatedDistance = Math.round(club.maxDistance);

    // Create or update club selector UI (bottom right)
    let clubSelector = document.getElementById("clubSelector");
    if (!clubSelector) {
      clubSelector = document.createElement("div");
      clubSelector.id = "clubSelector";
      clubSelector.style.cssText =
        "position:absolute;bottom:20px;right:20px;z-index:100;display:flex;flex-direction:column;align-items:center;gap:5px;";
      document.body.appendChild(clubSelector);
    }

    clubSelector.innerHTML = `
      <button id="clubUp" style="width:50px;height:30px;background:rgba(100,200,100,0.7);color:#fff;border:none;border-radius:3px;cursor:pointer;font-weight:bold;font-size:16px;">+</button>
      <div style="width:70px;height:105px;background:rgba(0,0,0,0.6);border-radius:5px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px solid #f0ad4e;padding:10px;color:#fff;text-align:center;pointer-events:none;font-family:monospace;font-size:11px;">
        <div style="font-size:32px;margin-bottom:2px;">⛳</div>
        <div style="font-weight:bold;line-height:1.2;">${club.name.split(" ")[0]}</div>
        <div style="color:#aaa;font-size:9px;">Club ${this.currentClub}</div>
        <div style="color:#ffeb3b;margin-top:4px;font-size:10px;font-weight:bold;">~${estimatedDistance}m</div>
        <div style="color:#90ee90;font-size:8px;margin-top:2px;line-height:1;">Max: ${maxDistanceClub.name}</div>
      </div>
      <button id="clubDown" style="width:50px;height:30px;background:rgba(200,100,100,0.7);color:#fff;border:none;border-radius:3px;cursor:pointer;font-weight:bold;font-size:16px;">−</button>
    `;

    // Attach button listeners
    const upBtn = document.getElementById("clubUp");
    const downBtn = document.getElementById("clubDown");
    if (upBtn) {
      upBtn.onclick = (e) => {
        e.stopPropagation();
        if (this.currentClub < 13) {
          this.currentClub++;
          this.updateUI();
        }
      };
    }
    if (downBtn) {
      downBtn.onclick = (e) => {
        e.stopPropagation();
        if (this.currentClub > 0) {
          this.currentClub--;
          this.updateUI();
        }
      };
    }

    // Update distance to pin display
    if (this.distanceDisplay && this.game?.pins?.length > 0) {
      const ballPos = this.ballMesh.position;
      const nearestPin = this.game.pins.reduce((nearest, pin) => {
        const dist = BABYLON.Vector3.Distance(ballPos, pin.mesh.position);
        return !nearest || dist < nearest.dist ? { dist, pin } : nearest;
      }, null);
      
      if (nearestPin) {
        const distM = Math.round(nearestPin.dist * 10) / 10;
        this.distanceDisplay.textContent = `📍 ${distM}m`;
      }
    }
  }

  hideClubUI() {
    const selector = document.getElementById("clubSelector");
    if (selector) selector.remove();
    const distDisplay = document.getElementById("distanceDisplay");
    if (distDisplay) distDisplay.remove();
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// PHYSICS & CHARACTER SYSTEMS
// ═════════════════════════════════════════════════════════════════════════════

// ─── PHYSICS CONFIGURATION ──────────────────────────────────────────────────

class PhysicsConfig {
  static GRAVITY = new BABYLON.Vector3(0, -9.81, 0);
  static BALL_MASS = CONFIG.BALL.MASS;
  static BALL_FRICTION = CONFIG.BALL.FRICTION;
  static BALL_RESTITUTION = CONFIG.BALL.RESTITUTION;
  static BALL_LINEAR_DAMPING = CONFIG.BALL.LINEAR_DAMPING;
  static BALL_ANGULAR_DAMPING = CONFIG.BALL.ANGULAR_DAMPING;
  static GROUND_FRICTION = CONFIG.TERRAIN.FRICTION;
  static GROUND_RESTITUTION = CONFIG.TERRAIN.RESTITUTION;

  static HIT_FORWARD_FORCE = 100; // Reduced for finesse gameplay
  static HIT_UPWARD_FORCE = 60; // Reduced for finesse gameplay
  static SPIN_MULTIPLIER = 400; // Increased for more spin effect
  static SPIN_ANIMATION_SPEED = 0.3;

  static MIN_SWIPE_DISTANCE = 3; // Lowered for more control
  static AIRBORNE_HEIGHT = 2;
  static GROUND_CONTACT_HEIGHT = 1.5;
  static LANDED_SPEED_THRESHOLD = 0.5;
}

// ─── CHARACTER (GOLF BALL WITH ANIMATIONS) ─────────────────────────────────
// Ball physics, face expressions, blinking, and eye gaze system.

class GolfBallGuy {
  constructor(mesh, physicsBody, skeleton, scene) {
    // Physics properties
    this.mesh = mesh;
    this.body = physicsBody;
    this.startPosition = mesh.position.clone();
    this.landed = true;
    this.touchedGround = false;
    this.pendingSpinAmount = 0;
    this.pendingSpinAxis = BABYLON.Vector3.Zero();

    // Character properties
    this.skeleton = skeleton;
    this.spinBone = null;
    this.scene = scene;

    // Face system properties
    this.faceMesh = null;
    this.faceMaterial = null;
    this.faceTextures = {};
    this.currentFace = "default";
    this.faceTransitionTimer = 0;
    this.nextFace = null;

    // Face timing constants
    this.HIT_FACE_DURATION = 0.3;
    this.COLLISION_FACE_DURATION = 0.4;

    // Spin transition for aiming -> hitting
    this.spinTransitionActive = false;
    this.spinTransitionTimer = 0;
    this.spinTransitionDuration = 0.4;

    // Rotation control
    this.targetRotation = 0;
    this.facingAimDirection = false;

    // Blinking system
    this.eyelidsMesh = null;
    this.blinkState = "open"; // "open" -> "closing" -> "closed" -> "opening" -> "open"
    this.blinkTimer = 0;
    this.nextBlinkTime =
      CONFIG.BLINKING.MIN_INTERVAL_MS +
      Math.random() *
        (CONFIG.BLINKING.MAX_INTERVAL_MS - CONFIG.BLINKING.MIN_INTERVAL_MS);

    // Eye gaze system
    this.eyeL = null;
    this.eyeR = null;
    this.eyeLRest = null;
    this.eyeRRest = null;
    this.eyeYaw = 0;
    this.eyePitch = 0;

    if (skeleton && skeleton.bones.length > 0) {
      this.spinBone = skeleton.bones.find((b) =>
        b.name.toLowerCase().includes("spin"),
      );
      if (!this.spinBone) {
        this.spinBone = skeleton.bones[0];
      }
    }
  }

  // === PHYSICS METHODS ===
  getPosition() {
    return this.mesh.position;
  }

  getHeight() {
    return this.mesh.position.y;
  }

  getVelocity() {
    let vel = BABYLON.Vector3.Zero();
    this.body.getLinearVelocityToRef(vel);
    return vel;
  }

  getSpeed() {
    return this.getVelocity().length();
  }

  getAngularVelocity() {
    let angVel = BABYLON.Vector3.Zero();
    this.body.getAngularVelocityToRef(angVel);
    return angVel;
  }

  applyHit(deltaX, deltaY, force, aimedDirection = 0, clubLaunchAngle = 0) {
    const swipeStrength = Math.min(
      force / 100,
      CONFIG.GOLF_BALL.MAX_HIT_STRENGTH,
    );
    const forwardForce = PhysicsConfig.HIT_FORWARD_FORCE * swipeStrength;
    // Club launch angle modifies upward force: higher angle = more upward force
    const angleRadians = (clubLaunchAngle * Math.PI) / 180;
    const upwardForce =
      PhysicsConfig.HIT_UPWARD_FORCE * swipeStrength * (1 + Math.sin(angleRadians) * 0.5);
    const horizontalDeviation =
      -deltaX * CONFIG.GOLF_BALL.HIT_HORIZONTAL_DEVIATION_FACTOR;

    const localForce = new BABYLON.Vector3(
      horizontalDeviation,
      upwardForce,
      -forwardForce,
    );
    const { x: rotX, z: rotZ } = Utils.rotate2D(
      localForce.x,
      localForce.z,
      aimedDirection,
    );
    const rotatedForce = new BABYLON.Vector3(rotX, localForce.y, rotZ);

    const impactPoint = this.getPosition().add(
      new BABYLON.Vector3(
        CONFIG.GOLF_BALL.IMPACT_POINT_OFFSET_X,
        CONFIG.GOLF_BALL.IMPACT_POINT_OFFSET_Y,
        CONFIG.GOLF_BALL.IMPACT_POINT_OFFSET_Z,
      ),
    );

    this.body.applyForce(rotatedForce, impactPoint);
    this.body.setAngularVelocity(BABYLON.Vector3.Zero());
  }

  applySpin(spinAxis, spinAmount) {
    // Accumulate spin instead of replacing it
    const accumulatedSpin = Math.min(
      this.pendingSpinAmount + spinAmount,
      1.2,
    );
    const angularVelocity = spinAxis.scale(
      accumulatedSpin * PhysicsConfig.SPIN_MULTIPLIER,
    );
    this.body.setAngularVelocity(angularVelocity);
    this.pendingSpinAmount = accumulatedSpin;
    this.pendingSpinAxis = spinAxis;
  }

  updateLandingState() {
    const height = this.getHeight();
    const speed = this.getSpeed();

    if (height < PhysicsConfig.GROUND_CONTACT_HEIGHT && !this.touchedGround) {
      this.touchedGround = true;
      this.pendingSpinAmount = 0;
      this.pendingSpinAxis = BABYLON.Vector3.Zero();
      return "firstContact";
    }

    if (
      speed < PhysicsConfig.LANDED_SPEED_THRESHOLD &&
      height < PhysicsConfig.GROUND_CONTACT_HEIGHT &&
      this.touchedGround
    ) {
      if (!this.landed) {
        this.landed = true;
        this.body.setLinearVelocity(BABYLON.Vector3.Zero());
        this.body.setAngularVelocity(BABYLON.Vector3.Zero());
        return "fullLand";
      }
    }

    if (height > PhysicsConfig.AIRBORNE_HEIGHT && this.touchedGround) {
      this.touchedGround = false;
    }

    return null;
  }

  isAirborne() {
    return this.getHeight() > PhysicsConfig.AIRBORNE_HEIGHT;
  }

  isLanded() {
    return this.landed;
  }

  // === CHARACTER METHODS ===
  async loadFaceTextures() {
    if (this.scene && this.scene.meshes) {
      this.faceMesh = this.scene.meshes.find(
        (m) => m.name && m.name.toLowerCase().includes("face"),
      );
    }

    if (!this.faceMesh) {
      return;
    }

    this.faceMaterial = this.faceMesh.material;

    const textureMap = {
      default: null,
      hit: "grimace.png",
      ascending: "elated.png",
      descending: "woah.png",
      collision: "o.png",
    };

    for (const [name, filename] of Object.entries(textureMap)) {
      if (!filename) continue;
      try {
        const tex = new BABYLON.Texture(
          `./assets/faces/${filename}`,
          this.scene,
          false,
          false,
          BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
        );
        tex.hasAlpha = true;
        this.faceTextures[name] = tex;
      } catch (e) {
        // Texture failed to load, continue
      }
    }

    if (this.faceMaterial) {
      if (this.faceMaterial.albedoTexture) {
        this.faceTextures["default"] = this.faceMaterial.albedoTexture;
      } else if (this.faceMaterial.diffuseTexture) {
        this.faceTextures["default"] = this.faceMaterial.diffuseTexture;
      }
    }


  }

  initializeEyelids() {
    if (!this.scene || !this.scene.meshes) return;

    // Find the eyelids mesh
    this.eyelidsMesh = this.scene.meshes.find(
      (m) => m.name && m.name.toLowerCase().includes("eyelid"),
    );

    if (this.eyelidsMesh && this.eyelidsMesh.morphTargetManager) {
      // Schedule first blink
      this.scheduleNextBlink();
    }
  }

  scheduleNextBlink() {
    this.nextBlinkTime =
      CONFIG.BLINKING.MIN_INTERVAL_MS +
      Math.random() *
        (CONFIG.BLINKING.MAX_INTERVAL_MS - CONFIG.BLINKING.MIN_INTERVAL_MS);
    this.blinkTimer = 0;
  }

  initializeEyes(skeleton) {
    if (!skeleton || skeleton.bones.length === 0) return;

    // Find eye bones
    const boneL = skeleton.bones.find((b) => b.name && b.name.toLowerCase().includes("eye.l"));
    const boneR = skeleton.bones.find((b) => b.name && b.name.toLowerCase().includes("eye.r"));

    if (boneL) {
      this.eyeL = boneL.getTransformNode?.() || boneL;
      this.eyeLRest = this.eyeL?.rotationQuaternion?.clone?.() ?? null;
    }

    if (boneR) {
      this.eyeR = boneR.getTransformNode?.() || boneR;
      this.eyeRRest = this.eyeR?.rotationQuaternion?.clone?.() ?? null;
    }
  }

  updateEyeGaze(cameraPosition, dt) {
    if (!this.eyeL || !this.eyeR) return;
    if (!this.eyeLRest || !this.eyeRRest) return;

    // Calculate direction from character to camera
    const charPos = this.getPosition();
    const dirToCamera = cameraPosition.subtract(charPos);
    dirToCamera.normalize();

    // Clamp gaze direction to eye rotation limits
    // Extract yaw (left/right) and pitch (up/down) from direction
    let targetYaw = Math.atan2(dirToCamera.x, dirToCamera.z);
    let targetPitch = -Math.asin(dirToCamera.y);

    // Clamp to max angles
    targetYaw = Math.max(-CONFIG.EYES.MAX_YAW, Math.min(CONFIG.EYES.MAX_YAW, targetYaw));
    targetPitch = Math.max(-CONFIG.EYES.MAX_PITCH, Math.min(CONFIG.EYES.MAX_PITCH, targetPitch));

    // Smooth interpolation
    const f = 1 - Math.exp(-CONFIG.EYES.LERP_SPEED * dt);
    this.eyeYaw += (targetYaw - this.eyeYaw) * f;
    this.eyePitch += (targetPitch - this.eyePitch) * f;

    // Create gaze quaternion from euler angles
    const gazeQ = BABYLON.Quaternion.FromEulerAngles(this.eyePitch, this.eyeYaw, 0);

    // Apply gaze by multiplying with rest pose
    if (this.eyeL && this.eyeLRest) {
      this.eyeL.rotationQuaternion = gazeQ.multiply(this.eyeLRest);
    }
    if (this.eyeR && this.eyeRRest) {
      this.eyeR.rotationQuaternion = gazeQ.multiply(this.eyeRRest);
    }
  }

  updateBlinking(dt) {
    if (!this.eyelidsMesh || !this.eyelidsMesh.morphTargetManager) return;

    const morphTargetManager = this.eyelidsMesh.morphTargetManager;

    // Get number of morph targets from _targets array
    const numMorphs = morphTargetManager._targets?.length ?? 0;

    if (numMorphs === 0) {
      return;
    }

    // Find the "Closed" shape key by checking _targets directly
    let closedMorphIndex = -1;
    if (morphTargetManager._targets) {
      for (let i = 0; i < morphTargetManager._targets.length; i++) {
        const target = morphTargetManager._targets[i];
        const targetName = (target?.name || target?.id || "").toLowerCase();
        if (targetName.includes("closed") || targetName.includes("blink") || targetName.includes("eyelid")) {
          closedMorphIndex = i;
          break;
        }
      }
    }

    if (closedMorphIndex === -1) return;

    this.blinkTimer += dt * 1000; // Convert to milliseconds

    const closeDuration = CONFIG.BLINKING.BLINK_CLOSE_DURATION_MS;
    const holdDuration = CONFIG.BLINKING.BLINK_HOLD_DURATION_MS;
    const openDuration = CONFIG.BLINKING.BLINK_OPEN_DURATION_MS;

    // Check if it's time to start blinking
    if (this.blinkTimer >= this.nextBlinkTime && this.blinkState === "open") {
      this.blinkState = "closing";
      this.blinkTimer = 0;
    }

    // Update morph target influence based on blink state
    let morphInfluence = 0;

    if (this.blinkState === "closing") {
      // Animate from 0 to 1 over closeDuration
      morphInfluence = Math.min(this.blinkTimer / closeDuration, 1);
      if (this.blinkTimer >= closeDuration) {
        this.blinkState = "closed";
        this.blinkTimer = 0;
      }
    } else if (this.blinkState === "closed") {
      // Stay fully closed
      morphInfluence = 1;
      if (this.blinkTimer >= holdDuration) {
        this.blinkState = "opening";
        this.blinkTimer = 0;
      }
    } else if (this.blinkState === "opening") {
      // Animate from 1 to 0 over openDuration
      morphInfluence = 1 - Math.min(this.blinkTimer / openDuration, 1);
      if (this.blinkTimer >= openDuration) {
        this.blinkState = "open";
        this.blinkTimer = 0;
        this.scheduleNextBlink();
      }
    }

    // Apply morph target influence directly to the target
    const target = morphTargetManager._targets[closedMorphIndex];
    if (target) {
      target.influence = morphInfluence;
    }
  }

  setFace(name, duration = 0) {
    if (this.currentFace === name) return;
    if (!this.faceMaterial || !this.faceTextures[name]) return;

    this.currentFace = name;
    const tex = this.faceTextures[name];

    if (this.faceMaterial.albedoTexture !== undefined) {
      this.faceMaterial.albedoTexture = tex;
    } else if (this.faceMaterial.diffuseTexture) {
      this.faceMaterial.diffuseTexture = tex;
    }

    if (duration > 0) {
      this.faceTransitionTimer = duration;
      this.nextFace = "default";
    } else {
      this.faceTransitionTimer = 0;
      this.nextFace = null;
    }
  }

  startSpinTransition() {
    this.spinTransitionActive = true;
    this.spinTransitionTimer = 0;
  }

  updateFaces(dt) {
    if (this.spinTransitionActive) {
      this.spinTransitionTimer += dt;
      if (this.spinTransitionTimer >= this.spinTransitionDuration) {
        this.spinTransitionActive = false;
        this.spinTransitionTimer = 0;
      }
    }

    if (this.faceTransitionTimer > 0) {
      this.faceTransitionTimer -= dt;
      if (this.faceTransitionTimer <= 0 && this.nextFace) {
        this.setFace(this.nextFace, 0);
      }
    }
  }

  animateSpin(spinAxis, spinAmount) {
    if (!this.spinBone) return;
    const spinSpeed = spinAmount * PhysicsConfig.SPIN_ANIMATION_SPEED;
    this.spinBone.rotate(spinAxis, spinSpeed, BABYLON.Space.LOCAL);
  }

  hasSpinBone() {
    return this.spinBone !== null;
  }

  // === ROTATION METHODS ===
  setFacingAim(aimDirection) {
    // Face toward aim direction
    this.targetRotation = aimDirection + Math.PI;
    this.facingAimDirection = true;
  }

  setFacingCamera(cameraPosition) {
    // Face toward camera position
    const charPos = this.getPosition();
    const dirToCamera = cameraPosition.subtract(charPos);
    this.targetRotation = Math.atan2(dirToCamera.x, dirToCamera.z);
    this.facingAimDirection = false;
  }

  updateRotation(lerpSpeed = 0.1) {
    const currentRot = this.mesh.rotation.y;
    const lerpedRot = BABYLON.Scalar.Lerp(
      currentRot,
      this.targetRotation,
      lerpSpeed,
    );
    this.mesh.rotation.y = lerpedRot;
  }

  // === GENERAL METHODS ===
  reset() {
    this.mesh.position = this.startPosition.clone();
    this.mesh.rotation = BABYLON.Vector3.Zero();
    this.body.setLinearVelocity(BABYLON.Vector3.Zero());
    this.body.setAngularVelocity(BABYLON.Vector3.Zero());
    this.landed = true;
    this.touchedGround = false;
    this.pendingSpinAmount = 0;
    this.pendingSpinAxis = BABYLON.Vector3.Zero();
    this.targetRotation = 0;
    this.facingAimDirection = false;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// CAMERA & VISUALIZATION
// ═════════════════════════════════════════════════════════════════════════════

// ─── FOLLOW CAMERA ──────────────────────────────────────────────────────────

class FollowCamera {
  constructor(camera, targetMesh, golfBallGuy = null) {
    this.camera = camera;
    this.targetMesh = targetMesh;
    this.golfBallGuy = golfBallGuy;
    this.offsetX = 0;
    this.offsetY = 0;
    this.offsetZ = 2;
    this.lookOffsetY = 1.5;
    this.lookOffsetZ = -5;

    this.targetOffsetX = 0;
    this.targetOffsetY = 0;
    this.targetOffsetZ = 2;
    this.targetLookOffsetY = 1.5;
    this.targetLookOffsetZ = -5;

    this.smoothSpeed = CONFIG.CAMERA.FOLLOW_SMOOTH;
    this.lastPosition = new BABYLON.Vector3(0, 0, 0);

    this.shotStartPosition = null;
    this.viewMode = CameraViewMode.PLAY;
    this.cameraAngle = 0;
    this.targetCameraAngle = 0;
    this.cameraAngleLerpSpeed = CONFIG.CAMERA.ANGLE_LERP_SPEED;

    this.configure();
  }

  configure() {
    this.camera.fov = CONFIG.CAMERA.FOV_PLAY;
    this.camera.inertia = 0;
    this.camera.angularSensibility = 0;
    this.camera.keysUp = [];
    this.camera.keysDown = [];
    this.camera.keysLeft = [];
    this.camera.keysRight = [];
    this.camera.wheelPrecision = 0;
  }

  setShotStartPosition(position) {
    // Called when ball is hit, to frame from start to landing
    this.shotStartPosition = position.clone();
  }

  setOffsets(x, y, z, lookY, lookZ, framing = null) {
    this.targetOffsetX = x;
    this.targetOffsetY = y;
    this.targetOffsetZ = z;
    this.targetLookOffsetY = lookY;
    this.targetLookOffsetZ = lookZ;
    this.framingMidpoint = framing;
  }

  setShotReviewView() {
    this.viewMode = CameraViewMode.SHOT_REVIEW;
    if (!this.shotStartPosition || !this.targetMesh) {
      this.setOffsets(
        0,
        CONFIG.FOLLOW_CAMERA.FULL_SHOT_VIEW_MIN_HEIGHT,
        CONFIG.FOLLOW_CAMERA.FULL_SHOT_VIEW_MIN_Z,
        0,
        CONFIG.FOLLOW_CAMERA.FULL_SHOT_VIEW_LOOK_Z,
      );
      return;
    }

    const ballPos = this.targetMesh.getAbsolutePosition();
    const dist = BABYLON.Vector3.Distance(this.shotStartPosition, ballPos);
    const mid = BABYLON.Vector3.Lerp(this.shotStartPosition, ballPos, 0.5);

    this.setOffsets(
      Math.max(8, dist * CONFIG.FOLLOW_CAMERA.FULL_SHOT_VIEW_SCALE_X),
      Math.max(12, dist * CONFIG.FOLLOW_CAMERA.FULL_SHOT_VIEW_SCALE_Y),
      Math.max(20, dist * CONFIG.FOLLOW_CAMERA.FULL_SHOT_VIEW_SCALE_Z),
      1,
      -Math.max(35, dist * CONFIG.FOLLOW_CAMERA.FULL_SHOT_VIEW_SCALE_LOOK_Z),
      mid,
    );
  }

  setFullShotView() {
    // Backward-compatible alias while we transition naming.
    this.setShotReviewView();
  }

  setPlayView() {
    this.viewMode = CameraViewMode.PLAY;
    this.setOffsets(
      CONFIG.FOLLOW_CAMERA.PLAY_VIEW_OFFSET_X,
      CONFIG.FOLLOW_CAMERA.PLAY_VIEW_OFFSET_Y,
      CONFIG.FOLLOW_CAMERA.PLAY_VIEW_OFFSET_Z,
      CONFIG.FOLLOW_CAMERA.PLAY_VIEW_LOOK_OFFSET_Y,
      CONFIG.FOLLOW_CAMERA.PLAY_VIEW_LOOK_OFFSET_Z,
    );
  }

  setCameraAngle(angle) {
    // Normalize angle to [-π, π] range to avoid 360 spin
    let normalizedAngle = angle;
    while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
    while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;

    // Find shortest path from current angle to target
    const diff = normalizedAngle - this.cameraAngle;
    if (diff > Math.PI) {
      this.targetCameraAngle = normalizedAngle - 2 * Math.PI;
    } else if (diff < -Math.PI) {
      this.targetCameraAngle = normalizedAngle + 2 * Math.PI;
    } else {
      this.targetCameraAngle = normalizedAngle;
    }
  }

  setCameraAngleImmediate(angle) {
    let normalized = angle;
    while (normalized > Math.PI) normalized -= 2 * Math.PI;
    while (normalized < -Math.PI) normalized += 2 * Math.PI;
    this.cameraAngle = normalized;
    this.targetCameraAngle = normalized;
  }

  update() {
    if (!this.targetMesh) return;

    // Smoothly lerp all offsets
    this.offsetX = BABYLON.Scalar.Lerp(
      this.offsetX,
      this.targetOffsetX,
      this.smoothSpeed,
    );
    this.offsetY = BABYLON.Scalar.Lerp(
      this.offsetY,
      this.targetOffsetY,
      this.smoothSpeed,
    );
    this.offsetZ = BABYLON.Scalar.Lerp(
      this.offsetZ,
      this.targetOffsetZ,
      this.smoothSpeed,
    );
    this.lookOffsetY = BABYLON.Scalar.Lerp(
      this.lookOffsetY,
      this.targetLookOffsetY,
      this.smoothSpeed,
    );
    this.lookOffsetZ = BABYLON.Scalar.Lerp(
      this.lookOffsetZ,
      this.targetLookOffsetZ,
      this.smoothSpeed,
    );
    this.cameraAngle = BABYLON.Scalar.Lerp(
      this.cameraAngle,
      this.targetCameraAngle,
      this.cameraAngleLerpSpeed,
    );

    const referencePoint =
      this.framingMidpoint || this.targetMesh.getAbsolutePosition();
    const { x: offsetX, z: offsetZ } = Utils.rotate2D(
      this.offsetX,
      this.offsetZ,
      this.cameraAngle,
    );

    const newPosition = new BABYLON.Vector3(
      referencePoint.x + offsetX,
      referencePoint.y + this.offsetY,
      referencePoint.z + offsetZ,
    );

    this.lastPosition = BABYLON.Vector3.Lerp(
      this.lastPosition,
      newPosition,
      CONFIG.CAMERA.POSITION_LERP_SPEED,
    );
    this.camera.position = this.lastPosition;

    const { x: lookX, z: lookZ } = Utils.rotate2D(
      0,
      this.lookOffsetZ,
      this.cameraAngle,
    );
    const lookTarget = new BABYLON.Vector3(
      referencePoint.x + lookX,
      referencePoint.y + this.lookOffsetY,
      referencePoint.z + lookZ,
    );
    this.camera.setTarget(lookTarget);
  }
}

// ─── GRASS SYSTEM ──────────────────────────────────────────────────────────
// Manages grass blades with periodic wind-like animations.

class GrassSystem {
  constructor(scene, game = null) {
    this.scene = scene;
    this.game = game;
    this.grassFrames = [];
    this.grassBlades = [];
    this.baseBlades = [];
    this.ballPosition = new BABYLON.Vector3(0, 0, 0);
    this.grassViewRadius = CONFIG.GRASS.VIEW_RADIUS;
    this.lastUpdatePos = new BABYLON.Vector3(0, 0, 0);
    this.updateThreshold = CONFIG.GRASS.UPDATE_THRESHOLD;

    // Animation state
    this.animationTimer = 0;
    this.animationInterval = 1.0; // 1 second between new animations
    this.bladeAnimations = new Map(); // blade -> { time, duration }
  }

  async loadFrames(frameCount = 5) {
    for (let i = 1; i <= frameCount; i++) {
      const texture = new BABYLON.Texture(
        `assets/grass/grass${i}.png`,
        this.scene,
      );
      texture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
      texture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
      texture.hasAlpha = true;
      this.grassFrames.push(texture);

      // Create base blade with this frame's material
      const mat = Utils.createMaterial(
        `grassMaterial_${i}`,
        this.scene,
        new BABYLON.Color3(1, 1, 1),
      );
      mat.specularColor = new BABYLON.Color3(0, 0, 0);
      mat.specularPower = 1;
      mat.backFaceCulling = false;
      mat.alphaMode = BABYLON.Engine.ALPHA_BLEND;
      mat.diffuseTexture = texture;

      const blade = BABYLON.MeshBuilder.CreatePlane(
        `grassBladeBase_${i}`,
        { width: 0.4, height: 1.2 },
        this.scene,
      );
      blade.position.y = 0.6;
      blade.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
      blade.material = mat;
      this.baseBlades.push(blade);
    }
  }

  createGrassBlade(position) {
    // Randomly select which base blade to instance from
    const baseIndex = Math.floor(Math.random() * this.baseBlades.length);
    const instance = this.baseBlades[baseIndex].createInstance(
      `grassBlade_${this.grassBlades.length}`,
    );
    instance.position = position.clone();
    instance.position.y = 0.6;
    instance.billboardMode = CONFIG.GRASS.BILLBOARD_MODE;
    this.grassBlades.push(instance);
    return instance;
  }

  scatter(groundSize = 200, density = 5, greenPositions = []) {
    // Scatter grass blades across terrain, avoiding greens
    const greenRadius = 30;
    const bladeCount = Math.floor((groundSize * groundSize) / 20); // ~3000 blades
    const clumpSize = 8;
    const clumpCount = Math.ceil(bladeCount / clumpSize);

    for (let c = 0; c < clumpCount; c++) {
      const clumpCenterX = (Math.random() - 0.5) * groundSize;
      const clumpCenterZ = (Math.random() - 0.5) * groundSize;

      let tooCloseToGreen = false;
      for (const greenPos of greenPositions) {
        const dist = Math.sqrt(
          (clumpCenterX - greenPos.x) ** 2 + (clumpCenterZ - greenPos.z) ** 2,
        );
        if (dist < greenRadius * 1.5) {
          tooCloseToGreen = true;
          break;
        }
      }

      if (tooCloseToGreen) continue;

      for (let i = 0; i < clumpSize; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.abs(Math.random() + Math.random()) * 2;
        const x = clumpCenterX + Math.cos(angle) * radius;
        const z = clumpCenterZ + Math.sin(angle) * radius;

        this.createGrassBlade(new BABYLON.Vector3(x, 0, z));
      }
    }
  }

  scatterGreenGrass(greenPositions = []) {
    // Add small, dense grass on the greens
    const greenRadius = 30;
    const smallScale = 0.25;

    for (const greenPos of greenPositions) {
      const bladesPerGreen = 80;

      for (let i = 0; i < bladesPerGreen; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * greenRadius * 0.9;
        const x = greenPos.x + Math.cos(angle) * radius;
        const z = greenPos.z + Math.sin(angle) * radius;

        const instance = this.createGrassBlade(new BABYLON.Vector3(x, 0, z));
        instance.scaling = new BABYLON.Vector3(
          smallScale,
          smallScale,
          smallScale,
        );
      }
    }
  }

  updateAnimations(deltaTime) {
    // Early exit if no active animations
    if (this.bladeAnimations.size === 0) {
      this.animationTimer += deltaTime;
      if (this.animationTimer < this.animationInterval) return;
      this.animationTimer = 0;
      this.startRandomAnimation();
      return;
    }

    this.animationTimer += deltaTime;

    // Periodically start new blade animations
    if (this.animationTimer >= this.animationInterval) {
      this.animationTimer = 0;
      this.startRandomAnimation();
    }

    // Update active animations
    const finishedBlades = [];
    for (const [blade, animState] of this.bladeAnimations) {
      animState.time += deltaTime;
      const progress = Math.min(animState.time / animState.duration, 1);

      // Ping-pong through frames: 0,1,2,3,4,3,2,1 (no repeat of 0)
      const totalFrames = this.grassFrames.length * 2 - 2;
      const normalizedPos = progress * totalFrames;
      
      let frameIndex;
      if (normalizedPos <= this.grassFrames.length - 1) {
        frameIndex = Math.floor(normalizedPos);
      } else {
        frameIndex = Math.max(1, Math.floor(totalFrames - normalizedPos));
      }

      // Apply frame by swapping texture (instances can't change material, only properties)
      if (blade.material) {
        blade.material.diffuseTexture = this.grassFrames[frameIndex];
      }

      if (progress >= 1) {
        finishedBlades.push(blade);
      }
    }

    // Clean up finished animations and set to random frame
    for (const blade of finishedBlades) {
      const randomFrameIdx = Math.floor(Math.random() * this.grassFrames.length);
      if (blade.material) {
        blade.material.diffuseTexture = this.grassFrames[randomFrameIdx];
      }
      this.bladeAnimations.delete(blade);
    }
  }

  startRandomAnimation() {
    // Pick random blade (more efficient than filtering all blades)
    const attempts = 5;
    for (let i = 0; i < attempts; i++) {
      const randomIdx = Math.floor(Math.random() * this.grassBlades.length);
      const blade = this.grassBlades[randomIdx];
      
      if (blade.isVisible && !this.bladeAnimations.has(blade)) {
        this.bladeAnimations.set(blade, {
          time: 0,
          duration: 2.0 + Math.random() * 1.0,
        });
        return;
      }
    }
  }

  update(deltaTime) {
    // Hide grass in overview mode
    if (this.game?.camera?.overviewOrbiting) {
      for (const blade of this.grassBlades) {
        blade.isVisible = false;
      }
      return;
    }

    // Update animations
    this.updateAnimations(deltaTime);

    // Only recull when ball moves significantly
    const moved = BABYLON.Vector3.Distance(
      this.ballPosition,
      this.lastUpdatePos,
    );

    if (moved < this.updateThreshold) {
      return; // Skip expensive distance checks if ball barely moved
    }

    this.lastUpdatePos.copyFrom(this.ballPosition);
    const radiusSq = this.grassViewRadius * this.grassViewRadius;

    // Cull grass instances based on distance from ball
    for (const blade of this.grassBlades) {
      const dx = blade.position.x - this.ballPosition.x;
      const dz = blade.position.z - this.ballPosition.z;
      const distSq = dx * dx + dz * dz;
      blade.isVisible = distSq < radiusSq;
    }
  }

  dispose() {
    // Dispose all instances
    for (const blade of this.grassBlades) {
      blade.dispose();
    }
    this.grassBlades = [];

    // Dispose all base blades
    for (const baseBlade of this.baseBlades) {
      baseBlade.dispose();
    }
    this.baseBlades = [];

    // Clear animation tracking
    this.bladeAnimations.clear();
    this.animatingBlades.clear();
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// INPUT & USER INTERFACE
// ═════════════════════════════════════════════════════════════════════════════

// ─── SWIPE ARROW OVERLAY ────────────────────────────────────────────────────

class SwipeArrowOverlay {
  constructor(renderCanvas) {
    this.renderCanvas = renderCanvas;
    this.overlayCanvas = document.createElement("canvas");
    this.ctx = this.overlayCanvas.getContext("2d");
    this.fadeArrows = [];
    this.liveArrow = null;
    this.idealArrow = null;

    this.setupCanvas();
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  setupCanvas() {
    const parent = this.renderCanvas.parentElement;
    if (!parent) return;
    if (window.getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }

    this.overlayCanvas.style.position = "absolute";
    this.overlayCanvas.style.left = "0";
    this.overlayCanvas.style.top = "0";
    this.overlayCanvas.style.width = "100%";
    this.overlayCanvas.style.height = "100%";
    this.overlayCanvas.style.pointerEvents = "none";
    this.overlayCanvas.style.zIndex = "10";
    parent.appendChild(this.overlayCanvas);
  }

  resize() {
    const rect = this.renderCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.overlayCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.overlayCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  getGuideStartPoint() {
    return {
      x:
        (this.overlayCanvas.width / (window.devicePixelRatio || 1)) *
        CONFIG.SWIPE_OVERLAY.START_X_PCT,
      y:
        (this.overlayCanvas.height / (window.devicePixelRatio || 1)) *
        CONFIG.SWIPE_OVERLAY.START_Y_PCT,
    };
  }

  setIdealArrow(start, end) {
    this.idealArrow = { start, end, color: CONFIG.SWIPE_OVERLAY.IDEAL_COLOR };
  }

  clearIdealArrow() {
    this.idealArrow = null;
  }

  setLiveArrow(start, end, color) {
    this.liveArrow = { start, end, color };
  }

  clearLiveArrow() {
    this.liveArrow = null;
  }

  addFadeArrow(start, end, color, durationMs, width) {
    this.fadeArrows.push({
      start,
      end,
      color,
      durationMs,
      remainingMs: durationMs,
      width,
    });
  }

  drawArrow(start, end, color, width, alpha = 1) {
    const ctx = this.ctx;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 2) return;

    const ux = dx / len;
    const uy = dy / len;
    const headLen = Math.max(10, Math.min(18, len * 0.22));
    const headW = headLen * 0.6;
    const baseX = end.x - ux * headLen;
    const baseY = end.y - uy * headLen;
    const px = -uy;
    const py = ux;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(baseX, baseY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(baseX + px * headW, baseY + py * headW);
    ctx.lineTo(baseX - px * headW, baseY - py * headW);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  update(deltaMs) {
    const ctx = this.ctx;
    const w = this.overlayCanvas.width / (window.devicePixelRatio || 1);
    const h = this.overlayCanvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);

    if (this.idealArrow) {
      this.drawArrow(
        this.idealArrow.start,
        this.idealArrow.end,
        this.idealArrow.color,
        CONFIG.SWIPE_OVERLAY.IDEAL_WIDTH,
        CONFIG.SWIPE_OVERLAY.IDEAL_ALPHA,
      );
    }

    const next = [];
    for (const arrow of this.fadeArrows) {
      arrow.remainingMs -= deltaMs;
      if (arrow.remainingMs <= 0) continue;
      this.drawArrow(
        arrow.start,
        arrow.end,
        arrow.color,
        arrow.width,
        arrow.remainingMs / arrow.durationMs,
      );
      next.push(arrow);
    }
    this.fadeArrows = next;

    if (this.liveArrow) {
      this.drawArrow(
        this.liveArrow.start,
        this.liveArrow.end,
        this.liveArrow.color,
        CONFIG.SWIPE_OVERLAY.HIT_WIDTH,
        0.9,
      );
    }
  }
}

// ─── INPUT HANDLER ──────────────────────────────────────────────────────────

class InputHandler {
  constructor(
    canvas,
    golfBall,
    game = null,
    eventManager = null,
    swipeOverlay = null,
  ) {
    this.canvas = canvas;
    this.golfBall = golfBall;
    this.game = game;
    this.eventManager = eventManager || new EventManager();
    this.swipeOverlay = swipeOverlay;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.isHitting = false;
    this.isSpinning = false;
    this.currentSwipeDistance = 0;
    this.pointerActive = false;
    this.overviewOrbiting = false;
    this.lastPointerX = 0;
    this.spinColorIndex = 0;
    this.currentSpinColor = CONFIG.SWIPE_OVERLAY.SPIN_COLORS[0];

    this.setupListeners();
  }

  isAimMode() {
    return this.game?.gameState === GameState.AIM;
  }

  isShotReviewMode() {
    return this.game?.camera?.viewMode === CameraViewMode.SHOT_REVIEW;
  }

  canShowIdealArrow() {
    return (
      this.game?.gameState === GameState.PLAY &&
      this.golfBall.isLanded() &&
      !this.isSpinning &&
      !this.game?.aimView?.isActive &&
      !this.isShotReviewMode()
    );
  }

  getHitForceFromDistance(distance) {
    const scale = CONFIG.SWIPE_OVERLAY.VISUAL_SCALE;
    const maxForce = CONFIG.GOLF_BALL.MAX_HIT_STRENGTH * 100;
    return Math.min((distance / scale / 50) * 100, maxForce);
  }

  clearInputPreview() {
    this.isHitting = false;
    this.isSpinning = false;
    this.currentSwipeDistance = 0;
    this.updateUIFeedback(0);
    this.swipeOverlay?.clearLiveArrow();
  }

  clampSwipeVector(deltaX, deltaY) {
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (length <= CONFIG.SWIPE_OVERLAY.MAX_PREVIEW_LENGTH) {
      return { deltaX, deltaY };
    }
    const scale = CONFIG.SWIPE_OVERLAY.MAX_PREVIEW_LENGTH / length;
    return { deltaX: deltaX * scale, deltaY: deltaY * scale };
  }

  buildPinCandidates(ballPos, aimedDirection) {
    const candidates = [];
    for (const pin of this.game.scene.pinManager.pins) {
      const dx = pin.mesh.position.x - ballPos.x;
      const dz = pin.mesh.position.z - ballPos.z;
      const worldDistance = Math.sqrt(dx * dx + dz * dz);
      const local = Utils.rotate2D(dx, dz, -aimedDirection);
      const depth = -local.z;
      const angleError = Math.abs(Math.atan2(local.x, Math.max(0.001, depth)));
      const isAimed =
        depth > 0 && angleError <= CONFIG.SWIPE_OVERLAY.AIM_SELECTION_ANGLE_RAD;
      candidates.push({
        dx,
        dz,
        local,
        depth,
        angleError,
        worldDistance,
        isAimed,
      });
    }
    return candidates;
  }

  pickTargetCandidate(candidates) {
    const aimedCandidates = candidates.filter((c) => c.isAimed);
    if (aimedCandidates.length === 1) {
      return aimedCandidates[0];
    }
    if (aimedCandidates.length > 1) {
      return aimedCandidates.reduce((closest, candidate) =>
        candidate.worldDistance < closest.worldDistance ? candidate : closest,
      );
    }
    if (candidates.length > 0) {
      return candidates.reduce((closest, candidate) =>
        candidate.worldDistance < closest.worldDistance ? candidate : closest,
      );
    }
    return null;
  }

  predictLandingRangeForStrength(strength, dt, linearDamping, gAbs) {
    const initialForwardVel =
      ((PhysicsConfig.HIT_FORWARD_FORCE * strength) / PhysicsConfig.BALL_MASS) *
      dt;
    const initialUpVel =
      ((PhysicsConfig.HIT_UPWARD_FORCE * strength) / PhysicsConfig.BALL_MASS) *
      dt;

    let vx = initialForwardVel;
    let vy = initialUpVel;
    let y = 0;
    let x = 0;

    for (let i = 0; i < 600; i++) {
      vy += (-gAbs - linearDamping * vy) * dt;
      vx += -linearDamping * vx * dt;
      y += vy * dt;
      x += vx * dt;

      if (i > 1 && y <= 0) break;
    }

    return Math.max(0, x);
  }

  solveSwipeStrengthForDistance(worldDistance, dt, linearDamping, gAbs) {
    const minStrength =
      CONFIG.SWIPE_OVERLAY.MIN_FORWARD_FORCE / PhysicsConfig.HIT_FORWARD_FORCE;
    const maxStrength = CONFIG.GOLF_BALL.MAX_HIT_STRENGTH;
    let low = minStrength;
    let high = maxStrength;

    for (let i = 0; i < 14; i++) {
      const mid = (low + high) * 0.5;
      const predictedRange = this.predictLandingRangeForStrength(
        mid,
        dt,
        linearDamping,
        gAbs,
      );
      if (predictedRange < worldDistance) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return Math.max(minStrength, Math.min(maxStrength, high));
  }

  buildIdealSwipeVector(best, aimedDirection, swipeStrength) {
    const desiredForwardForce = PhysicsConfig.HIT_FORWARD_FORCE * swipeStrength;
    const force = swipeStrength * 100;
    const baseLength = force / 2;

    const local =
      best.local || Utils.rotate2D(best.dx, best.dz, -aimedDirection);
    const depth = Math.max(1, -local.z);
    const desiredLateralRatio = Math.max(
      -CONFIG.SWIPE_OVERLAY.MAX_LATERAL_RATIO,
      Math.min(CONFIG.SWIPE_OVERLAY.MAX_LATERAL_RATIO, local.x / depth),
    );
    const desiredLateralForce = Math.max(
      -CONFIG.SWIPE_OVERLAY.MAX_LATERAL_FORCE,
      Math.min(
        CONFIG.SWIPE_OVERLAY.MAX_LATERAL_FORCE,
        desiredForwardForce * desiredLateralRatio,
      ),
    );

    let deltaX =
      -desiredLateralForce / CONFIG.GOLF_BALL.HIT_HORIZONTAL_DEVIATION_FACTOR;
    let swipeLen = Math.max(
      CONFIG.SWIPE_OVERLAY.IDEAL_MIN_PREVIEW_LENGTH,
      baseLength,
      Math.abs(deltaX) + 6,
    );

    deltaX = Math.max(-(swipeLen - 1), Math.min(swipeLen - 1, deltaX));
    let deltaY = -Math.sqrt(Math.max(1, swipeLen * swipeLen - deltaX * deltaX));

    const clamped = this.clampSwipeVector(deltaX, deltaY);
    return { deltaX: clamped.deltaX, deltaY: clamped.deltaY };
  }

  computeIdealHitSwipe() {
    if (!this.game?.scene?.pinManager?.pins?.length) return null;
    const ballPos = this.golfBall.getPosition();
    const aimedDirection =
      this.game?.getShotDirection?.() || this.game.aimedDirection || 0;

    const candidates = this.buildPinCandidates(ballPos, aimedDirection);
    const best = this.pickTargetCandidate(candidates);
    if (!best) return null;

    const dt = CONFIG.SWIPE_OVERLAY.PHYSICS_STEP_SECONDS;
    const linearDamping = PhysicsConfig.BALL_LINEAR_DAMPING;
    const gAbs = Math.abs(PhysicsConfig.GRAVITY.y);
    const swipeStrength = this.solveSwipeStrengthForDistance(
      best.worldDistance,
      dt,
      linearDamping,
      gAbs,
    );
    const { deltaX, deltaY } = this.buildIdealSwipeVector(
      best,
      aimedDirection,
      swipeStrength,
    );

    const scale = CONFIG.SWIPE_OVERLAY.VISUAL_SCALE;
    const start = this.swipeOverlay.getGuideStartPoint();
    return {
      start,
      end: { x: start.x + deltaX * scale, y: start.y + deltaY * scale },
    };
  }

  updateSwipeOverlay(deltaMs) {
    if (!this.swipeOverlay) return;

    const showIdeal = this.canShowIdealArrow();

    if (showIdeal) {
      const ideal = this.computeIdealHitSwipe();
      if (ideal) this.swipeOverlay.setIdealArrow(ideal.start, ideal.end);
      else this.swipeOverlay.clearIdealArrow();
    } else {
      this.swipeOverlay.clearIdealArrow();
    }

    this.swipeOverlay.update(deltaMs);
  }

  setupListeners() {
    this.canvas.addEventListener("pointerdown", (e) =>
      this.handlePointerDown(e),
    );
    this.canvas.addEventListener("pointermove", (e) =>
      this.handlePointerMove(e),
    );
    this.canvas.addEventListener("pointerup", (e) => this.handlePointerUp(e));
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }

  handlePointerDown(event) {
    this.pointerActive = true;
    this.touchStartX = event.clientX;
    this.touchStartY = event.clientY;
    this.game.justTransitioned = false; // Reset transition guard on new pointer down

    // In aim mode, don't trigger hit/spin, let orbit controls handle it
    if (this.isAimMode()) {
      return;
    }

    if (this.isShotReviewMode() && this.golfBall.isLanded()) {
      this.overviewOrbiting = true;
      this.lastPointerX = event.clientX;
      this.clearInputPreview();
      return;
    }

    if (this.golfBall.isLanded()) {
      this.isHitting = true;
    } else {
      this.isSpinning = true;
      this.currentSpinColor =
        CONFIG.SWIPE_OVERLAY.SPIN_COLORS[
          this.spinColorIndex % CONFIG.SWIPE_OVERLAY.SPIN_COLORS.length
        ];
      this.spinColorIndex++;
    }
  }

  updateUIFeedback(amount, label = "") {
    const fill = document.getElementById("spinFill");
    if (fill) fill.style.width = amount * 100 + "%";
    const text = document.getElementById("spinLabel");
    if (text) {
      if (label) {
        text.textContent = label;
        text.style.display = "block";
      } else {
        text.style.display = "none";
      }
    }
  }

  handlePointerMove(event) {
    if (!this.pointerActive) return;
    if (this.isAimMode()) return;

    if (this.overviewOrbiting) {
      const deltaX = event.clientX - this.lastPointerX;
      this.lastPointerX = event.clientX;
      const sensitivity = CONFIG.FOLLOW_CAMERA.OVERVIEW_ORBIT_SENSITIVITY;
      this.game?.camera?.setCameraAngle(
        (this.game?.camera?.targetCameraAngle || 0) - deltaX * sensitivity,
      );
      return;
    }

    const deltaX = event.clientX - this.touchStartX;
    const deltaY = event.clientY - this.touchStartY;
    this.currentSwipeDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (this.isHitting) {
      const force = this.getHitForceFromDistance(this.currentSwipeDistance);
      const maxForce = CONFIG.GOLF_BALL.MAX_HIT_STRENGTH * 100;
      this.updateUIFeedback(
        Math.min(force / maxForce, 1),
        "Force: " + force.toFixed(0),
      );
    } else {
      this.updateUIFeedback(Math.min(this.currentSwipeDistance / 100, 1));
    }
  }

  handlePointerUp(event) {
    if (!this.pointerActive) return;
    this.pointerActive = false;
    const deltaX = event.clientX - this.touchStartX;
    const deltaY = event.clientY - this.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (this.isAimMode()) {
      this.clearInputPreview();
      return;
    }

    if (this.game?.justTransitioned) {
      this.clearInputPreview();
      return;
    }

    if (this.overviewOrbiting) {
      this.overviewOrbiting = false;
      this.clearInputPreview();

      if (
        this.golfBall.isLanded() &&
        distance < PhysicsConfig.MIN_SWIPE_DISTANCE
      ) {
        this.eventManager.emit("input:reset");
      }
      return;
    }

    if (
      this.golfBall.isLanded() &&
      distance < PhysicsConfig.MIN_SWIPE_DISTANCE
    ) {
      this.eventManager.emit("input:reset");
    } else if (
      this.isHitting &&
      this.golfBall.isLanded() &&
      distance > PhysicsConfig.MIN_SWIPE_DISTANCE
    ) {
      const scale = CONFIG.SWIPE_OVERLAY.VISUAL_SCALE;
      const force = this.getHitForceFromDistance(distance);
      this.eventManager.emit("input:hit", {
        deltaX: deltaX / scale,
        deltaY: deltaY / scale,
        force,
      });
      this.swipeOverlay?.addFadeArrow(
        { x: this.touchStartX, y: this.touchStartY },
        { x: event.clientX, y: event.clientY },
        CONFIG.SWIPE_OVERLAY.HIT_COLOR,
        CONFIG.SWIPE_OVERLAY.HIT_FADE_MS,
        CONFIG.SWIPE_OVERLAY.HIT_WIDTH,
      );
    } else if (
      this.isSpinning &&
      !this.golfBall.isLanded() &&
      distance > PhysicsConfig.MIN_SWIPE_DISTANCE &&
      this.golfBall.isAirborne()
    ) {
      const spinAmount = Math.min(distance / 50, 1.2);
      const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const spinAxis = new BABYLON.Vector3(
        (deltaY / magnitude) * 0.1,
        0,
        (deltaX / magnitude) * 0.1,
      );
      this.eventManager.emit("input:spin", { spinAxis, spinAmount: spinAmount * 0.4 });
      this.swipeOverlay?.addFadeArrow(
        { x: this.touchStartX, y: this.touchStartY },
        { x: event.clientX, y: event.clientY },
        this.currentSpinColor,
        CONFIG.SWIPE_OVERLAY.SPIN_FADE_MS,
        CONFIG.SWIPE_OVERLAY.SPIN_WIDTH,
      );
    }

    this.clearInputPreview();
  }

  handleKeyDown(event) {
    if (event.code === "Space") {
      this.eventManager.emit("input:reset");
    }
  }
}

// ─── UI MANAGER ─────────────────────────────────────────────────────────────

class UIManager {
  constructor(golfBall, ballStartPosition, game = null) {
    this.golfBall = golfBall;
    this.ballStartPosition = ballStartPosition;
    this.game = game;
  }

  update() {
    const speed = this.golfBall.getSpeed();
    const height = Math.max(0, this.golfBall.getHeight() - 1);
    const distanceToPin = this.getDistanceToNearestPin();

    document.getElementById("speed").textContent = speed.toFixed(1);
    document.getElementById("spin").textContent = (
      this.golfBall.pendingSpinAmount * 100
    ).toFixed(0);
    document.getElementById("height").textContent = height.toFixed(1);
    document.getElementById("distance").textContent = distanceToPin.toFixed(1);
  }

  getDistanceToNearestPin() {
    if (!this.game?.scene?.pinManager?.pins?.length) {
      return 0;
    }

    const ballPos = this.golfBall.getPosition();
    
    // During AIM state, find pin most aligned with aim direction
    if (this.game.gameState === GameState.AIM && this.game.aimView) {
      const aimDirection = this.game.aimView.cameraRotation;
      // Aim direction is opposite camera direction (ball faces away from camera)
      const aimVec = new BABYLON.Vector3(Math.sin(aimDirection + Math.PI), 0, Math.cos(aimDirection + Math.PI));
      
      let bestPin = null;
      let smallestAngle = Math.PI;
      
      for (let i = 0; i < this.game.scene.pinManager.pins.length; i++) {
        const pin = this.game.scene.pinManager.pins[i];
        const pinPos = pin.mesh.position;
        const toPin = pinPos.subtract(ballPos);
        const toPinFlat = toPin.clone();
        toPinFlat.y = 0;
        
        if (toPinFlat.length() === 0) continue;
        
        toPinFlat.normalize();
        
        // Calculate angle between aim direction and pin direction
        const dotProd = BABYLON.Vector3.Dot(aimVec, toPinFlat);
        const angle = Math.acos(Math.max(-1, Math.min(1, dotProd)));
        
        if (angle < smallestAngle) {
          smallestAngle = angle;
          bestPin = pin;
        }
      }
      
      // Return most-aligned pin's distance if within 90° cone (in front)
      if (bestPin && smallestAngle < Math.PI / 2) {
        const selectedDist = BABYLON.Vector3.Distance(ballPos, bestPin.mesh.position);
        return selectedDist;
      }
    }
    
    // During PLAY state, show nearest pin
    const nearestPin = this.game.scene.pinManager.pins.reduce((nearest, pin) => {
      const dist = BABYLON.Vector3.Distance(ballPos, pin.mesh.position);
      return !nearest || dist < nearest.dist ? { dist, pin } : nearest;
    }, null);

    return nearestPin ? nearestPin.dist : 0;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// GAME MECHANICS & EFFECTS
// ═════════════════════════════════════════════════════════════════════════════

// ─── PIN MANAGER ─────────────────────────────────────────────────────────────

class PinManager {
  constructor(scene, golfBall, eventManager = null) {
    this.scene = scene;
    this.golfBall = golfBall;
    this.eventManager = eventManager || new EventManager();
    this.pins = [];
    this.greens = [];
  }

  addPin(position, scene) {
    const pin = BABYLON.MeshBuilder.CreateCylinder(
      "pin",
      {
        height: CONFIG.PINS.PIN_HEIGHT,
        diameter: CONFIG.PINS.PIN_DIAMETER,
        segments: 16,
      },
      scene,
    );
    pin.position = position.clone();
    pin.position.y += CONFIG.PINS.PIN_Y_OFFSET;

    const pinMat = Utils.createMaterial(
      `pinMat_${Math.random()}`,
      scene,
      new BABYLON.Color3(1, 0.2, 0.2),
      new BABYLON.Color3(1, 1, 1),
    );
    pin.material = pinMat;

    const pinBody = new BABYLON.PhysicsAggregate(
      pin,
      BABYLON.PhysicsShapeType.CYLINDER,
      { mass: 0, friction: 0, restitution: 0.9 },
      scene,
    );

    this.pins.push({ mesh: pin, body: pinBody });
  }

  addGreen(centerPos, radius, scene) {
    const green = BABYLON.MeshBuilder.CreateDisc(
      "green",
      { radius: radius },
      scene,
    );
    green.position = centerPos.clone();
    green.position.y = CONFIG.PINS.GREEN_Y_OFFSET;
    green.rotation.x = Math.PI / 2;

    const greenMat = Utils.createMaterial(
      `greenMat_${Math.random()}`,
      scene,
      new BABYLON.Color3(0.38, 0.72, 0.18),
      new BABYLON.Color3(0.03, 0.06, 0.01),
    );
    const greenDiffuse = new BABYLON.Texture(
      CONFIG.PINS.GREEN_TEXTURE_PATH,
      scene,
    );
    greenDiffuse.wrapU = greenDiffuse.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    greenDiffuse.uScale = greenDiffuse.vScale = CONFIG.PINS.GREEN_UV_TILING;
    greenMat.diffuseTexture = greenDiffuse;
    const greenNormal = new BABYLON.Texture(
      CONFIG.PINS.GREEN_NORMAL_MAP_PATH,
      scene,
    );
    greenNormal.wrapU = greenNormal.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    greenNormal.uScale = greenNormal.vScale = CONFIG.PINS.GREEN_UV_TILING;
    greenMat.bumpTexture = greenNormal;
    green.material = greenMat;

    // Create a very thin physics plane instead of cylinder to avoid walls
    // Don't create physics body for greens - they're just visual indicators
    // The ground physics handles friction for the entire terrain
    this.greens.push({ mesh: green, body: null });
  }

  checkPinCollisions() {
    const ballPos = this.golfBall.getPosition();
    const ballSpeed = this.golfBall.getSpeed();

    for (const pin of this.pins) {
      const distance = BABYLON.Vector3.Distance(ballPos, pin.mesh.position);

      if (
        distance < CONFIG.PINS.PIN_COLLISION_RADIUS &&
        ballSpeed > CONFIG.PINS.PIN_COLLISION_MIN_SPEED
      ) {
        this.eventManager.emit("pin:hit", pin.mesh.position);

        pin.mesh.scaling.y = CONFIG.PINS.PIN_FLASH_SCALE_Y;
        setTimeout(() => {
          pin.mesh.scaling.y = 1;
        }, CONFIG.PINS.PIN_FLASH_DURATION_MS);
      }
    }
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// SCENE & GAME ORCHESTRATION
// ═════════════════════════════════════════════════════════════════════════════

// ─── SCENE SETUP ──────────────────────────────────────────────────────────────

class SceneSetup {
  static async createEnvironment(scene) {
    // Try to load environment texture
    let envTexture = null;
    try {
      envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
        CONFIG.ENVIRONMENT.ENV_TEXTURE_PATH,
        scene,
      );
      // Enable environment texture for both skybox AND IBL (lighting + reflections)
      if (CONFIG.ENVIRONMENT.SKYBOX_ENABLED && envTexture) {
        scene.createDefaultSkybox(
          envTexture,
          true,
          CONFIG.ENVIRONMENT.SKYBOX_SIZE,
          CONFIG.ENVIRONMENT.SKYBOX_PBRBRIGHT,
        );
        scene.environmentTexture = envTexture; // Enable IBL for unified lighting
      }
    } catch (err) {
      // Environment texture failed to load, continue with defaults
    }

    // Add ambient light for visibility
    const ambientLight = new BABYLON.HemisphericLight(
      "ambient",
      new BABYLON.Vector3(0, 1, 0),
      scene,
    );
    ambientLight.intensity = CONFIG.LIGHTING.AMBIENT_INTENSITY;
    ambientLight.diffuse = new BABYLON.Color3(1.0, 0.98, 0.88); // warm sky tone
    ambientLight.groundColor = new BABYLON.Color3(0.25, 0.45, 0.1); // brighter green fill from below

    // Directional sun light (required for shadow casting)
    const sunLight = new BABYLON.DirectionalLight(
      "sun",
      new BABYLON.Vector3(-0.5, -1, -0.5),
      scene,
    );
    sunLight.intensity = CONFIG.LIGHTING.SUN_INTENSITY;
    sunLight.position = new BABYLON.Vector3(100, 200, 100);

    // Shadow generator - store on scene so loadGolfBall/loadCharacter can register casters
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, sunLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.bias = 0.001;
    scene.shadowGenerator = shadowGenerator;

    // Undulating terrain
    this.createUndulatingTerrain(scene);
  }

  static createUndulatingTerrain(scene) {
    const ground = BABYLON.MeshBuilder.CreateGround(
      "undulatedGround",
      {
        width: CONFIG.TERRAIN.WIDTH,
        height: CONFIG.TERRAIN.HEIGHT,
        subdivisions: CONFIG.TERRAIN.SUBDIVISIONS,
      },
      scene,
    );

    // Tiled terrain material using repeatable diffuse + normal textures
    const groundMat = Utils.createMaterial(
      "undulatedMat",
      scene,
      new BABYLON.Color3(0.25, 0.5, 0.15),
      new BABYLON.Color3(0.1, 0.1, 0.1),
      16,
    );

    const diffuseTex = new BABYLON.Texture(CONFIG.TERRAIN.TEXTURE_PATH, scene);
    diffuseTex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    diffuseTex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    diffuseTex.uScale = CONFIG.TERRAIN.UV_TILING;
    diffuseTex.vScale = CONFIG.TERRAIN.UV_TILING;
    groundMat.diffuseTexture = diffuseTex;

    const normalTex = new BABYLON.Texture(
      CONFIG.TERRAIN.NORMAL_MAP_PATH,
      scene,
    );
    normalTex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    normalTex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    normalTex.uScale = CONFIG.TERRAIN.UV_TILING;
    normalTex.vScale = CONFIG.TERRAIN.UV_TILING;
    groundMat.bumpTexture = normalTex;

    ground.material = groundMat;
    ground.receiveShadows = true;

    // Physics for terrain
    const groundAggregate = new BABYLON.PhysicsAggregate(
      ground,
      BABYLON.PhysicsShapeType.MESH,
      {
        mass: 0,
        friction: CONFIG.TERRAIN.FRICTION,
        restitution: CONFIG.TERRAIN.RESTITUTION,
      },
      scene,
    );
    scene.groundPhysicsBody = groundAggregate.body;

    return ground;
  }
}

// ─── BALL TRAIL ──────────────────────────────────────────────────────────────

class BallTrail {
  constructor(scene, maxPoints = 1000, maxAge = null) {
    this.scene = scene;
    this.positions = [];
    this.timestamps = [];
    this.maxPoints = maxPoints;
    this.maxAge = maxAge;
    this.line = null;
    this.isTracing = false;
    this.minDistanceBetweenPoints = CONFIG.TRAIL.MIN_DISTANCE_BETWEEN_POINTS;
    this.updateCounter = 0;
    this.updateFrequency = CONFIG.TRAIL.UPDATE_FREQUENCY;
  }

  startTracing() {
    this.isTracing = true;
  }

  stopTracing() {
    this.isTracing = false;
  }

  addPoint(position) {
    if (!this.isTracing) return;

    const now = Date.now();

    // Only add if far enough from last point
    if (this.positions.length > 0) {
      const lastPos = this.positions[this.positions.length - 1];
      const distance = BABYLON.Vector3.Distance(position, lastPos);
      if (distance < this.minDistanceBetweenPoints) {
        return;
      }
    }

    this.positions.push(position.clone());
    this.timestamps.push(now);

    // Remove only if exceeds max points (keep all while tracing)
    while (this.positions.length > this.maxPoints) {
      this.positions.shift();
      this.timestamps.shift();
    }

    // Only update line every N points to reduce lag
    this.updateCounter++;
    if (this.updateCounter >= this.updateFrequency) {
      this.updateLine();
      this.updateCounter = 0;
    }
  }

  updateLine() {
    if (this.line) {
      this.line.dispose();
      this.line = null;
    }

    if (this.positions.length < 2) {
      return;
    }

    // Render trail as a simple line strip.
    this.line = BABYLON.MeshBuilder.CreateLines(
      "trail",
      {
        points: this.positions,
        updatable: false,
      },
      this.scene,
    );
    this.line.color = new BABYLON.Color3(1, 0.15, 0.15);
    this.line.alpha = 0.95;
  }

  update(currentPosition) {
    this.addPoint(currentPosition);
  }

  clear() {
    if (this.line) {
      this.line.dispose();
      this.line = null;
    }
    this.positions = [];
    this.timestamps = [];
    this.isTracing = false;
    this.updateCounter = 0;
  }
}

// ─── PHYSICS MANAGER ──────────────────────────────────────────────────────────

class PhysicsManager {
  static async initialize(scene) {
    const havokInstance = await HavokPhysics();
    const physicsPlugin = new BABYLON.HavokPlugin(true, havokInstance);
    scene.enablePhysics(PhysicsConfig.GRAVITY, physicsPlugin);
    return physicsPlugin;
  }
}

// ─── MAIN GAME ORCHESTRATOR ────────────────────────────────────────────────
// Core game loop, state management, and system initialization.

class GolfGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.engine = new BABYLON.Engine(canvas, true);
    this.scene = null;
    this.eventManager = new EventManager();
    this.golfBall = null;
    this.camera = null;
    this.inputHandler = null;
    this.uiManager = null;
    this.ballTrail = null;
    this.aimView = null;
    this.gameState = GameState.AIM;
    this.ballStartPosition = new BABYLON.Vector3(0, 0.425, 10);
    this.aimedDirection = 0;
    this.justTransitioned = false;
    this.physicsDebugEnabled = false;
    this.physicsViewer = null;
    this.swipeOverlay = null;
    this.wind = new Wind();
    this.golfBallFacingCamera = false;

    // Face state tracking
    this.lastBallVelocity = new BABYLON.Vector3(0, 0, 0);
    this.wasHit = false;
    this.hitCooldown = 0;
  }

  normalizeAngle(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }

  getShotDirection() {
    if (this.camera?.camera?.getForwardRay) {
      const forward = this.camera.camera.getForwardRay(1).direction;
      if (forward && Number.isFinite(forward.x) && Number.isFinite(forward.z)) {
        return this.normalizeAngle(Math.atan2(forward.x, -forward.z));
      }
    }
    if (this.camera && Number.isFinite(this.camera.cameraAngle)) {
      return this.normalizeAngle(this.camera.cameraAngle);
    }
    return this.normalizeAngle(this.aimedDirection || 0);
  }

  async initialize() {
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color3(0.53, 0.81, 0.92); // Sky blue

    // Setup
    await PhysicsManager.initialize(this.scene);
    if (BABYLON.PhysicsViewer) {
      this.physicsViewer = new BABYLON.PhysicsViewer(this.scene);
    }
    await SceneSetup.createEnvironment(this.scene);

    // Load models
    await this.loadGolfBall();
    await this.loadCharacter();

    // Setup pins after golfBall is loaded
    this.setupPins();

    // Setup grass after pins
    await this.setupGrass();
    this.swipeOverlay = new SwipeArrowOverlay(this.canvas);

    // Setup systems
    this.setupCamera();
    this.setupAimView();
    this.setupInput();
    this.setupUI();
    this.ballTrail = new BallTrail(
      this.scene,
      CONFIG.TRAIL.MAX_POINTS,
      CONFIG.TRAIL.MAX_AGE_MS,
    );
    this.setupCompass();
    this.setupRenderLoop();
  }

  async loadGolfBall() {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "assets/",
      "gball.glb",
      this.scene,
    );

    const bodyMesh = BABYLON.MeshBuilder.CreateSphere(
      "ballBody",
      { diameter: CONFIG.BALL.COLLIDER_DIAMETER, segments: 8 },
      this.scene,
    );
    bodyMesh.position = this.ballStartPosition.clone();
    bodyMesh.isVisible = false;

    result.meshes[0].parent = bodyMesh;
    result.meshes[0].position = BABYLON.Vector3.Zero();
    result.meshes[0].scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

    for (const mesh of result.meshes) {
      const mat = mesh.material;
      if (!mat) continue;

      if (mat instanceof BABYLON.PBRMaterial) {
        mat.metallic = CONFIG.BALL_VISUAL.PBR_METALLIC;
        mat.roughness = CONFIG.BALL_VISUAL.PBR_ROUGHNESS;
        mat.environmentIntensity = CONFIG.BALL_VISUAL.PBR_ENV_INTENSITY;
        mat.microSurface = CONFIG.BALL_VISUAL.PBR_MICRO_SURFACE;
      } else if (mat instanceof BABYLON.StandardMaterial) {
        mat.specularColor = new BABYLON.Color3(
          CONFIG.BALL_VISUAL.STANDARD_SPECULAR,
          CONFIG.BALL_VISUAL.STANDARD_SPECULAR,
          CONFIG.BALL_VISUAL.STANDARD_SPECULAR,
        );
        mat.specularPower = 8;
      }
    }

    const aggregate = new BABYLON.PhysicsAggregate(
      bodyMesh,
      BABYLON.PhysicsShapeType.SPHERE,
      {
        mass: PhysicsConfig.BALL_MASS,
        friction: PhysicsConfig.BALL_FRICTION,
        restitution: PhysicsConfig.BALL_RESTITUTION,
      },
      this.scene,
    );

    aggregate.body.setLinearDamping(PhysicsConfig.BALL_LINEAR_DAMPING);
    aggregate.body.setAngularDamping(PhysicsConfig.BALL_ANGULAR_DAMPING);

    Utils.addShadowCasters(result.meshes, this.scene.shadowGenerator);
    this.golfBall = new GolfBallGuy(bodyMesh, aggregate.body, null, this.scene);
  }

  async loadCharacter() {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "assets/",
      "gball-guy.glb",
      this.scene,
    );

    // Parent all character meshes directly to the physics body
    // so they rotate and position with it automatically
    const bodyMesh = this.golfBall.mesh;
    result.meshes.forEach((mesh) => {
      if (mesh) {
        mesh.parent = bodyMesh;
        mesh.position = BABYLON.Vector3.Zero();
        mesh.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
      }
    });

    // Update golfBall with character visuals and skeleton
    this.golfBall.skeleton = result.skeletons?.[0] || null;
    this.golfBall.scene = this.scene;

    // Initialize spin bone
    if (this.golfBall.skeleton && this.golfBall.skeleton.bones.length > 0) {
      this.golfBall.spinBone = this.golfBall.skeleton.bones.find((b) =>
        b.name.toLowerCase().includes("spin"),
      );
      if (!this.golfBall.spinBone) {
        this.golfBall.spinBone = this.golfBall.skeleton.bones[0];
      }
    }

    // Load face textures asynchronously
    await this.golfBall.loadFaceTextures();

    // Initialize eyelids for blinking
    this.golfBall.initializeEyelids();

    // Initialize eye gaze system
    this.golfBall.initializeEyes(this.golfBall.skeleton);

    Utils.addShadowCasters(result.meshes, this.scene.shadowGenerator);
  }

  setupCamera() {
    this.camera = new BABYLON.UniversalCamera(
      "camera",
      new BABYLON.Vector3(0, 1, 6),
      this.scene,
    );
    this.camera.attachControl(this.canvas, false);
    this.camera = new FollowCamera(
      this.camera,
      this.golfBall.mesh,
      this.golfBall,
    );
  }

  setupAimView() {
    this.aimView = new AimView(
      this.camera.camera,
      this.golfBall.mesh,
      this.golfBall,
      this.scene,
      this.canvas,
      this.eventManager,
      this,
    );

    this.eventManager.on("aimView:ballClicked", () => {
      this.aimedDirection = this.aimView.cameraRotation;
      this.gameState = GameState.PLAY;
      this.justTransitioned = true;
      this.aimView.deactivate();
      this.ballTrail.startTracing();
      this.camera.setShotStartPosition(this.golfBall.getPosition());
      this.camera.setCameraAngleImmediate(-this.aimedDirection);
      this.camera.setPlayView();

      // Start character spin transition and rotate to face camera
      this.golfBall.startSpinTransition();
      this.golfBallFacingCamera = true;
    });

    this.aimView.activate();
  }

  setupInput() {
    this.inputHandler = new InputHandler(
      this.canvas,
      this.golfBall,
      this,
      this.eventManager,
      this.swipeOverlay,
    );

    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "p") {
        this.togglePhysicsDebug();
      }
    });

    this.eventManager.on("input:hit", (data) => {
      if (this.gameState !== GameState.PLAY) return;
      const shotDirection = this.getShotDirection();
      this.aimedDirection = shotDirection;
      const currentClubId = this.aimView?.currentClub ?? 12; // Default to driver if aimView not available
      const club = ClubData.getClub(currentClubId);
      this.golfBall.applyHit(
        data.deltaX,
        data.deltaY,
        data.force,
        shotDirection,
        club.angle,
      );
      this.golfBall.landed = false;
      this.ballTrail.startTracing();
      this.camera.setShotStartPosition(this.golfBall.getPosition());
      this.camera.setPlayView();
    });

    this.eventManager.on("input:spin", (data) => {
      if (this.gameState !== GameState.PLAY) return;
      this.golfBall.applySpin(data.spinAxis, data.spinAmount);
    });

    this.eventManager.on("input:reset", () => {
      this.golfBall.reset();
      this.ballTrail.clear();
      this.camera.setCameraAngle(0);
      this.camera.setPlayView();
      this.gameState = GameState.AIM;
      this.golfBallFacingCamera = false;
      if (this.aimView) {
        this.aimView.cameraRotation = this.aimedDirection;
      }
      this.aimView.activate();
    });
  }

  togglePhysicsDebug() {
    if (!this.physicsViewer) return;
    this.physicsDebugEnabled = !this.physicsDebugEnabled;

    const bodies = [];
    if (this.golfBall?.body) bodies.push(this.golfBall.body);
    if (this.scene.groundPhysicsBody) bodies.push(this.scene.groundPhysicsBody);
    if (this.scene.pinManager?.pins) {
      for (const pin of this.scene.pinManager.pins) {
        if (pin.body?.body) bodies.push(pin.body.body);
      }
    }

    for (const body of bodies) {
      if (this.physicsDebugEnabled) this.physicsViewer.showBody(body);
      else this.physicsViewer.hideBody(body);
    }
  }

  setupUI() {
    this.uiManager = new UIManager(this.golfBall, this.ballStartPosition, this);
  }

  setupPins() {
    const pinManager = new PinManager(
      this.scene,
      this.golfBall,
      this.eventManager,
    );

    const greenPositions = [
      new BABYLON.Vector3(-60, 0, -80),
      new BABYLON.Vector3(0, 0, -120),
      new BABYLON.Vector3(60, 0, -160),
    ];

    this.greenPositions = greenPositions;

    for (const pos of greenPositions) {
      pinManager.addGreen(pos, 30, this.scene);
      pos.y = 0.2;
      pinManager.addPin(pos, this.scene);
    }

    this.scene.pinManager = pinManager;
    this.eventManager.on("pin:hit", (pinPos) => {
      // Handle pin hit if needed
    });
  }

  async setupGrass() {
    // Create and setup grass system
    this.grassSystem = new GrassSystem(this.scene, this);

    try {
      await this.grassSystem.loadFrames(CONFIG.GRASS.FRAME_COUNT); // Load animation frames from config
      // Scatter grass - instancing is efficient enough for 10x density now
      this.grassSystem.scatter(300, 12, this.greenPositions); // Lower density for perf
    } catch (err) {
      // Silently fail if grass frames not found
    }
  }

  updateBallState() {
    const landingState = this.golfBall.updateLandingState();
    if (landingState === "fullLand") {
      this.ballTrail.stopTracing();
      this.camera.setShotReviewView();
    }

    if (
      !this.golfBall.isLanded() &&
      this.golfBall.pendingSpinAmount > 0 &&
      this.golfBall.hasSpinBone()
    ) {
      this.golfBall.animateSpin(
        this.golfBall.pendingSpinAxis,
        this.golfBall.pendingSpinAmount,
      );
    }

    // Update character face based on ball state
    this.updateCharacterFace();
  }

  updateCharacterFace() {
    if (!this.golfBall) return;

    const ballVel = this.golfBall.getVelocity();
    const ballSpeed = ballVel.length();
    const isMoving = ballSpeed > 0.2;

    // Detect if ball was just hit (sudden velocity increase)
    const velMagnitudePrev = this.lastBallVelocity.length();
    const velMagnitudeCurr = ballSpeed;
    const wasJustHit =
      velMagnitudeCurr > velMagnitudePrev * 1.5 && velMagnitudeCurr > 5;

    if (wasJustHit) {
      this.wasHit = true;
      this.hitCooldown = 0.1;
    }

    // Show hit face briefly
    if (this.hitCooldown > 0) {
      this.hitCooldown -= this.engine.getDeltaTime() / 1000;
      this.golfBall.setFace("hit", this.golfBall.HIT_FACE_DURATION);
    }
    // Show ascending face when moving up with good speed
    else if (isMoving && ballVel.y > 1) {
      this.golfBall.setFace("ascending");
    }
    // Show descending face when falling with good speed
    else if (isMoving && ballVel.y < -2) {
      this.golfBall.setFace("descending");
    }
    // Show collision face when there's significant lateral velocity after leaving ground
    else if (isMoving && Math.abs(ballVel.x) > 3) {
      this.golfBall.setFace("collision");
    }
    // Default face when still or moving slowly
    else if (!isMoving) {
      this.golfBall.setFace("default");
    }

    // Handle rotation to camera during play mode
    if (
      this.golfBallFacingCamera &&
      this.camera &&
      this.gameState === GameState.PLAY
    ) {
      this.golfBall.setFacingCamera(this.camera.camera.position);
      this.golfBall.updateRotation(0.1);
    }

    // Update face transition timer
    this.golfBall.updateFaces(this.engine.getDeltaTime() / 1000);

    // Update blinking
    this.golfBall.updateBlinking(this.engine.getDeltaTime() / 1000);

    // Store current velocity for next frame
    this.lastBallVelocity.copyFrom(ballVel);
  }

  setupCompass() {
    // Create compass HTML element
    const compass = document.createElement("div");
    compass.id = "compass";
    compass.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <svg id="compassSvg" width="${CONFIG.WIND.COMPASS_SIZE}" height="${CONFIG.WIND.COMPASS_SIZE}" viewBox="0 0 120 120" style="filter: drop-shadow(0 2px 8px rgba(0,0,0,0.8)); background: rgba(20,20,30,0.8); border-radius: 50%; border: 3px solid #ffd700; cursor: pointer;">
          <!-- Cardinal directions -->
          <text x="60" y="18" text-anchor="middle" fill="#ffeb3b" font-size="14" font-weight="bold" style="pointer-events: none;">N</text>
          <text x="102" y="65" text-anchor="middle" fill="#90ee90" font-size="14" font-weight="bold" style="pointer-events: none;">E</text>
          <text x="60" y="108" text-anchor="middle" fill="#90ee90" font-size="14" font-weight="bold" style="pointer-events: none;">S</text>
          <text x="18" y="65" text-anchor="middle" fill="#90ee90" font-size="14" font-weight="bold" style="pointer-events: none;">W</text>
          <!-- Center dot -->
          <circle cx="60" cy="60" r="4" fill="#ffeb3b"/>
          <!-- Wind direction arrow (rotates around center) -->
          <g id="windArrow">
            <polygon points="60,28 55,48 58,45 58,60 62,60 62,45 65,48" fill="#ff6b6b" stroke="#ffeb3b" stroke-width="1.5" style="pointer-events: none;"/>
          </g>
        </svg>
        <div id="windSpeedDisplay" style="background: rgba(0,0,0,0.7); color: #ffeb3b; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; border: 1px solid #ffeb3b; font-family: monospace;">0.0 m/s</div>
      </div>
    `;
    compass.style.cssText = `
      position: absolute;
      top: ${CONFIG.WIND.COMPASS_TOP}px;
      right: ${CONFIG.WIND.COMPASS_RIGHT}px;
      z-index: 1000;
      cursor: default;
      pointer-events: auto;
    `;
    document.body.appendChild(compass);

    // Setup wind control interaction
    this.setupWindControl();
  }

  setupWindControl() {
    const svg = document.getElementById("compassSvg");
    if (!svg) return;

    let isDragging = false;

    // Helper to update wind based on position
    const updateWindFromPosition = (clientX, clientY) => {
      const svgRect = svg.getBoundingClientRect();
      const centerX = svgRect.left + svgRect.width / 2;
      const centerY = svgRect.top + svgRect.height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;

      // Calculate angle (0 = North, increases clockwise)
      let angle = Math.atan2(deltaX, -deltaY);
      if (angle < 0) angle += Math.PI * 2;

      // Convert to our wind direction (0 = South, PI/2 = East, PI = North, 3PI/2 = West)
      const windDirection = (Math.PI - angle + Math.PI * 2) % (Math.PI * 2);

      // Calculate distance and map to speed
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = svgRect.width / 2;
      const speedRatio = Math.min(distance / (maxDistance * 0.7), 1);
      const speed =
        CONFIG.WIND.MIN_SPEED +
        (CONFIG.WIND.MAX_SPEED - CONFIG.WIND.MIN_SPEED) * speedRatio;

      // Update wind
      this.wind.direction = windDirection;
      this.wind.speed = speed;
      this.wind.nextChangeTime = Date.now() + CONFIG.WIND.CHANGE_FREQUENCY;
    };

    const handleMouseDown = (e) => {
      isDragging = true;
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      updateWindFromPosition(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleTouchStart = (e) => {
      isDragging = true;
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        updateWindFromPosition(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    // Mouse events
    svg.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Touch events for mobile
    svg.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    // Also handle compass clicks to set wind
    svg.addEventListener("click", (e) => {
      const rect = svg.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      let angle = Math.atan2(deltaX, -deltaY);
      if (angle < 0) angle += Math.PI * 2;

      const windDirection = (Math.PI - angle + Math.PI * 2) % (Math.PI * 2);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = rect.width / 2;
      const speedRatio = Math.min(distance / (maxDistance * 0.7), 1);
      const speed =
        CONFIG.WIND.MIN_SPEED +
        (CONFIG.WIND.MAX_SPEED - CONFIG.WIND.MIN_SPEED) * speedRatio;

      this.wind.direction = windDirection;
      this.wind.speed = speed;
      this.wind.nextChangeTime = Date.now() + CONFIG.WIND.CHANGE_FREQUENCY;
    });
  }

  updateCompass() {
    const arrow = document.getElementById("windArrow");
    const compassSvg = document.getElementById("compassSvg");
    const speedDisplay = document.getElementById("windSpeedDisplay");
    if (arrow && speedDisplay && compassSvg) {
      // Convert wind direction to compass angle for arrow display
      // Wind: 0=South, PI/2=East, PI=North, 3PI/2=West
      // Compass: 0°=North, 90°=East, 180°=South, 270°=West
      const compassAngle =
        (180 - (this.wind.direction * 180) / Math.PI + 360) % 360;
      arrow.setAttribute("transform", `rotate(${compassAngle} 60 60)`);

      // Rotate entire compass to match camera angle (different for aim vs play mode)
      let cameraAngleDeg = 0;
      if (this.aimView && this.aimView.isActive) {
        // In aim view, use aimView's camera rotation
        cameraAngleDeg = ((this.aimView.cameraRotation * 180) / Math.PI) % 360;
      } else if (this.camera && Number.isFinite(this.camera.cameraAngle)) {
        // In play view, use the FollowCamera's angle (only if valid)
        cameraAngleDeg = ((this.camera.cameraAngle * 180) / Math.PI) % 360;
      }
      compassSvg.style.transform = `rotate(${-cameraAngleDeg}deg)`;

      speedDisplay.textContent = `${this.wind.speed.toFixed(1)} m/s`;
    }
  }

  setupRenderLoop() {
    this.scene.registerBeforeRender(() => {
      // Update wind system
      this.wind.update();
      this.updateCompass();

      // Apply wind force to airborne ball
      if (this.golfBall.isAirborne() && !this.golfBall.isLanded()) {
        const windForce = this.wind.getForceVector();
        this.golfBall.body.applyForce(windForce, this.golfBall.getPosition());
      }

      this.updateBallState();
      this.scene.pinManager?.checkPinCollisions();
      this.ballTrail.update(this.golfBall.getPosition());
      this.inputHandler?.updateSwipeOverlay(this.engine.getDeltaTime());
      this.uiManager.update();
      this.camera.update();
      this.aimView?.isActive && this.aimView.update();
      if (this.grassSystem) {
        this.grassSystem.ballPosition = this.golfBall.getPosition();
        this.grassSystem.update(this.engine.getDeltaTime() / 1000);
      }
    });

    // Update eye gaze after animations are evaluated
    this.scene.onAfterAnimationsObservable.add(() => {
      this.golfBall.updateEyeGaze(this.camera.camera.position, this.engine.getDeltaTime() / 1000);
    });

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// APPLICATION BOOTSTRAP
// ═════════════════════════════════════════════════════════════════════════════

async function startGame() {
  try {
    const canvas = document.getElementById("renderCanvas");
    const game = new GolfGame(canvas);
    await game.initialize();
  } catch (error) {
    alert("Failed to initialize game: " + error.message);
  }
}

startGame();
