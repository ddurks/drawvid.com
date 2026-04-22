// Golf Ball Game - Babylon.js + Havok Physics
// Modular, event-driven architecture with centralized configuration

// === GAME STATE ===
const GameState = { AIM: "aim", PLAY: "play", LANDED: "landed" };
const CameraViewMode = { PLAY: "play", SHOT_REVIEW: "shotReview" };

// === CONFIGURATION ===
const CONFIG = {
  ENVIRONMENT: {
    ENV_TEXTURE_PATH: "assets/golf.env",
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
    VIEW_RADIUS: 100,
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
    ARROW_LENGTH: 4,
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
};

// === EVENT MANAGER ===
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

// === UTILITY HELPERS ===
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

// === CLUB DATA ===
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

// === TRAJECTORY ARROW ===
class TrajectoryArrow {
  constructor(scene, ballPos) {
    this.scene = scene;
    this.ballPos = ballPos;
    this.arrow = null;
    this.arrowRotation = 0;
  }

  create() {
    if (this.arrow) this.arrow.dispose();

    const points = [
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(0, 0, -CONFIG.TRAJECTORY.ARROW_LENGTH),
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
  }

  update(ballPos, clubAngle, cameraRotation) {
    if (!this.arrow) this.create();

    this.arrow.position = ballPos.clone();
    this.arrow.position.y += CONFIG.TRAJECTORY.ARROW_Y_OFFSET;

    // Arrow rotates with camera to show aim direction (0 = behind, π/2 = right, π = front, -π/2 = left)
    this.arrow.rotation.y = cameraRotation;
    // Club angle tilts the arrow up based on club selection
    this.arrow.rotation.x = -((clubAngle * Math.PI) / 180);
  }

  dispose() {
    if (this.arrow) {
      this.arrow.dispose();
      this.arrow = null;
    }
  }
}

// === AIM VIEW ===
class AimView {
  constructor(camera, ballMesh, characterVisuals, scene, canvas, eventManager) {
    this.camera = camera;
    this.ballMesh = ballMesh;
    this.characterVisuals = characterVisuals;
    this.scene = scene;
    this.canvas = canvas;
    this.eventManager = eventManager;
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

    // Ensure character is rotated to face away from camera
    if (this.characterVisuals && this.characterVisuals.rootNode) {
      this.characterVisuals.rootNode.rotation.y = this.cameraRotation + Math.PI;
    }

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
        // Raycasting to detect ball click
        const pickResult = this.scene.pick(e.clientX, e.clientY);

        if (pickResult && pickResult.hit) {
          // Accept clicks on ball, character, or character root
          const pickedMesh = pickResult.pickedMesh;
          const isBallClick =
            pickedMesh === this.ballMesh || pickedMesh?.name === "gball";
          const isCharacterClick =
            pickedMesh === this.characterVisuals?.mesh ||
            pickedMesh?.parent === this.characterVisuals?.rootNode ||
            pickedMesh?.parent?.parent === this.characterVisuals?.rootNode; // For nested armature meshes

          if (isBallClick || isCharacterClick) {
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

    // Rotate ball and character to face camera
    this.ballMesh.rotation.y = this.cameraRotation + Math.PI;
    if (this.characterVisuals && this.characterVisuals.rootNode) {
      // Rotate via the root node so all parts rotate together
      this.characterVisuals.rootNode.rotation.y = this.cameraRotation + Math.PI;
    }

    const club = ClubData.getClub(this.currentClub);
    this.trajectoryArrow.update(ballPos, club.angle, this.cameraRotation);
  }

  updateUI() {
    const club = ClubData.getClub(this.currentClub);

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
      <div style="width:60px;height:80px;background:rgba(0,0,0,0.6);border-radius:5px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px solid #f0ad4e;padding:10px;color:#fff;text-align:center;pointer-events:none;">
        <div style="font-size:32px;margin-bottom:5px;">⛳</div>
        <div style="font-size:11px;font-weight:bold;line-height:1.2;">${club.name.split(" ")[0]}</div>
        <div style="font-size:10px;color:#aaa;">Club ${this.currentClub}</div>
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
  }

  hideClubUI() {
    const selector = document.getElementById("clubSelector");
    if (selector) selector.remove();
  }
}

// === PHYSICS CONFIG ===
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

// === GOLF BALL ===
class GolfBall {
  constructor(mesh, physicsBody) {
    this.mesh = mesh;
    this.body = physicsBody;
    this.startPosition = mesh.position.clone();
    this.landed = true;
    this.touchedGround = false;
    this.pendingSpinAmount = 0;
    this.pendingSpinAxis = BABYLON.Vector3.Zero();
  }

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

  applyHit(deltaX, deltaY, force, aimedDirection = 0) {
    const swipeStrength = Math.min(
      force / 100,
      CONFIG.GOLF_BALL.MAX_HIT_STRENGTH,
    );
    const forwardForce = PhysicsConfig.HIT_FORWARD_FORCE * swipeStrength;
    const upwardForce = PhysicsConfig.HIT_UPWARD_FORCE * swipeStrength;
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
    const angularVelocity = spinAxis.scale(
      spinAmount * PhysicsConfig.SPIN_MULTIPLIER,
    );
    this.body.setAngularVelocity(angularVelocity);
    this.pendingSpinAmount = spinAmount;
    this.pendingSpinAxis = spinAxis;
  }

  updateLandingState() {
    const height = this.getHeight();
    const speed = this.getSpeed();

    // Detect first ground contact
    if (height < PhysicsConfig.GROUND_CONTACT_HEIGHT && !this.touchedGround) {
      this.touchedGround = true;
      this.pendingSpinAmount = 0;
      this.pendingSpinAxis = BABYLON.Vector3.Zero();
      return "firstContact";
    }

    // Check if fully landed
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

    // Check if airborne again
    if (height > PhysicsConfig.AIRBORNE_HEIGHT && this.touchedGround) {
      this.touchedGround = false;
    }

    return null;
  }

  reset() {
    this.mesh.position = this.startPosition.clone();
    this.body.setLinearVelocity(BABYLON.Vector3.Zero());
    this.body.setAngularVelocity(BABYLON.Vector3.Zero());
    this.landed = true;
    this.touchedGround = false;
    this.pendingSpinAmount = 0;
    this.pendingSpinAxis = BABYLON.Vector3.Zero();
  }

  isAirborne() {
    return this.getHeight() > PhysicsConfig.AIRBORNE_HEIGHT;
  }

  isLanded() {
    return this.landed;
  }
}

// === CHARACTER VISUALS ===
class CharacterVisuals {
  constructor(mesh, skeleton) {
    this.mesh = mesh;
    this.skeleton = skeleton;
    this.spinBone = null;

    if (skeleton && skeleton.bones.length > 0) {
      this.spinBone = skeleton.bones.find((b) =>
        b.name.toLowerCase().includes("spin"),
      );
      if (!this.spinBone) {
        this.spinBone = skeleton.bones[0];
      }
    }
  }

  syncPosition(targetPosition) {
    // Use rootNode if available (for proper parenting/rotation), otherwise use mesh
    if (this.rootNode) {
      this.rootNode.position.copyFrom(targetPosition);
    } else {
      this.mesh.position.copyFrom(targetPosition);
    }
  }

  animateSpin(spinAxis, spinAmount) {
    if (!this.spinBone) return;
    const spinSpeed = spinAmount * PhysicsConfig.SPIN_ANIMATION_SPEED;
    this.spinBone.rotate(spinAxis, spinSpeed, BABYLON.Space.LOCAL);
  }

  reset() {
    if (this.spinBone && this.spinBone.rotation) {
      this.spinBone.setAbsolutePosition(BABYLON.Vector3.Zero());
    }
  }

  hasSpinBone() {
    return this.spinBone !== null;
  }
}

// === FOLLOW CAMERA ===
class FollowCamera {
  constructor(camera, targetMesh) {
    this.camera = camera;
    this.targetMesh = targetMesh;
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

// === GRASS SYSTEM ===
class GrassSystem {
  constructor(scene) {
    this.scene = scene;
    this.grassFrames = [];
    this.grassBlades = [];
    this.baseBlades = [];
    this.ballPosition = new BABYLON.Vector3(0, 0, 0);
    this.grassViewRadius = CONFIG.GRASS.VIEW_RADIUS;
    this.lastUpdatePos = new BABYLON.Vector3(0, 0, 0);
    this.updateThreshold = CONFIG.GRASS.UPDATE_THRESHOLD;
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

      const blade = BABYLON.MeshBuilder.CreatePlane(
        `grassBladeBase_${i}`,
        { width: 0.4, height: 1.2 },
        this.scene,
      );
      blade.position.y = 0.6;
      blade.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

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
    // REDUCED: density 1.5 → 12 (8x fewer blades) for better perf
    const greenRadius = 30;
    const bladeCount = Math.floor((groundSize * groundSize) / 12); // Much lower density
    const clumpSize = 6;
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

  update(deltaTime) {
    // Only recull when ball moves significantly (reduces per-frame overhead)
    const moved = BABYLON.Vector3.Distance(
      this.ballPosition,
      this.lastUpdatePos,
    );

    if (moved < this.updateThreshold) {
      return; // Skip expensive distance checks if ball barely moved
    }

    this.lastUpdatePos.copyFrom(this.ballPosition);
    const radiusSq = this.grassViewRadius * this.grassViewRadius; // Avoid sqrt

    // Cull grass instances based on distance from ball
    for (const blade of this.grassBlades) {
      const dx = blade.position.x - this.ballPosition.x;
      const dz = blade.position.z - this.ballPosition.z;
      const distSq = dx * dx + dz * dz; // Squared distance (avoid sqrt)
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
  }
}

// === SWIPE ARROW OVERLAY ===
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

// === INPUT HANDLER ===
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
      candidates.push({ dx, dz, local, depth, angleError, worldDistance, isAimed });
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
      ((PhysicsConfig.HIT_FORWARD_FORCE * strength) / PhysicsConfig.BALL_MASS) * dt;
    const initialUpVel =
      ((PhysicsConfig.HIT_UPWARD_FORCE * strength) / PhysicsConfig.BALL_MASS) * dt;

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

    const local = best.local || Utils.rotate2D(best.dx, best.dz, -aimedDirection);
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
      this.updateUIFeedback(Math.min(force / maxForce, 1), "Force: " + force.toFixed(0));
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
      this.eventManager.emit("input:hit", { deltaX: deltaX / scale, deltaY: deltaY / scale, force });
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
      this.eventManager.emit("input:spin", { spinAxis, spinAmount });
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

// === UI MANAGER ===
class UIManager {
  constructor(golfBall, ballStartPosition) {
    this.golfBall = golfBall;
    this.ballStartPosition = ballStartPosition;
  }

  update() {
    const speed = this.golfBall.getSpeed();
    const height = Math.max(0, this.golfBall.getHeight() - 1);
    const distance = this.getHorizontalDistance();

    document.getElementById("speed").textContent = speed.toFixed(1);
    document.getElementById("spin").textContent = (
      this.golfBall.pendingSpinAmount * 100
    ).toFixed(0);
    document.getElementById("height").textContent = height.toFixed(1);
    document.getElementById("distance").textContent = distance.toFixed(1);
  }

  getHorizontalDistance() {
    const pos = this.golfBall.getPosition();
    return Math.sqrt(
      Math.pow(pos.x - this.ballStartPosition.x, 2) +
        Math.pow(pos.z - this.ballStartPosition.z, 2),
    );
  }
}

// === PIN MANAGER ===
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
    const greenDiffuse = new BABYLON.Texture(CONFIG.PINS.GREEN_TEXTURE_PATH, scene);
    greenDiffuse.wrapU = greenDiffuse.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    greenDiffuse.uScale = greenDiffuse.vScale = CONFIG.PINS.GREEN_UV_TILING;
    greenMat.diffuseTexture = greenDiffuse;
    const greenNormal = new BABYLON.Texture(CONFIG.PINS.GREEN_NORMAL_MAP_PATH, scene);
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

// === SCENE SETUP ===
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
      console.warn("Failed to load environment texture:", err);
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

// === BALL TRAIL ===
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

// === PHYSICS MANAGER ===
class PhysicsManager {
  static async initialize(scene) {
    const havokInstance = await HavokPhysics();
    const physicsPlugin = new BABYLON.HavokPlugin(true, havokInstance);
    scene.enablePhysics(PhysicsConfig.GRAVITY, physicsPlugin);
    return physicsPlugin;
  }
}

// === GOLF GAME ===
class GolfGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.engine = new BABYLON.Engine(canvas, true);
    this.scene = null;
    this.eventManager = new EventManager();
    this.golfBall = null;
    this.characterVisuals = null;
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
    this.golfBall = new GolfBall(bodyMesh, aggregate.body);
  }

  async loadCharacter() {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "assets/",
      "gball-guy.glb",
      this.scene,
    );

    const charRoot = new BABYLON.TransformNode("characterRoot", this.scene);
    charRoot.position = this.ballStartPosition.clone();
    charRoot.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

    result.meshes.forEach((mesh) => {
      if (mesh) mesh.parent = charRoot;
    });

    this.characterVisuals = new CharacterVisuals(
      result.meshes[0],
      result.skeletons?.[0] || null,
    );
    this.characterVisuals.rootNode = charRoot;
    Utils.addShadowCasters(result.meshes, this.scene.shadowGenerator);
  }

  setupCamera() {
    this.camera = new BABYLON.UniversalCamera(
      "camera",
      new BABYLON.Vector3(0, 1, 6),
      this.scene,
    );
    this.camera.attachControl(this.canvas, false);
    this.camera = new FollowCamera(this.camera, this.golfBall.mesh);
  }

  setupAimView() {
    this.aimView = new AimView(
      this.camera.camera,
      this.golfBall.mesh,
      this.characterVisuals,
      this.scene,
      this.canvas,
      this.eventManager,
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
      this.golfBall.applyHit(
        data.deltaX,
        data.deltaY,
        data.force,
        shotDirection,
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
      this.characterVisuals.reset();
      this.ballTrail.clear();
      this.camera.setCameraAngle(0);
      this.camera.setPlayView();
      this.gameState = GameState.AIM;
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
    this.uiManager = new UIManager(this.golfBall, this.ballStartPosition);
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
    this.grassSystem = new GrassSystem(this.scene);

    try {
      await this.grassSystem.loadFrames(CONFIG.GRASS.FRAME_COUNT); // Load animation frames from config
      // Scatter grass - instancing is efficient enough for 10x density now
      this.grassSystem.scatter(300, 12, this.greenPositions); // Lower density for perf
      // Add small dense grass on greens
      this.grassSystem.scatterGreenGrass(this.greenPositions);
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
      this.characterVisuals.hasSpinBone()
    ) {
      this.characterVisuals.animateSpin(
        this.golfBall.pendingSpinAxis,
        this.golfBall.pendingSpinAmount,
      );
    }
  }

  setupRenderLoop() {
    this.scene.registerBeforeRender(() => {
      this.updateBallState();
      this.characterVisuals.syncPosition(this.golfBall.getPosition());
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

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }
}

// === STARTUP ===
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
