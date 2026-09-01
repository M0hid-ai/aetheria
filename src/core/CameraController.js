// AETHERIA - 3-Mode Camera Controller: Orbit, FPV Spaceship Flight, & Cinematic Director

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraController {
  constructor(camera, domElement, soundFX) {
    this.camera = camera;
    this.domElement = domElement;
    this.soundFX = soundFX;

    this.mode = 'orbit'; // 'orbit', 'fpv', 'cinematic'

    // Orbit Controls Setup
    this.orbitControls = new OrbitControls(this.camera, this.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.minDistance = 8.0;
    this.orbitControls.maxDistance = 250.0;
    this.orbitControls.maxPolarAngle = Math.PI * 0.95;

    // FPV Spaceship Flight Physics
    this.fpvState = {
      velocity: new THREE.Vector3(),
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      moveUp: false,
      moveDown: false,
      rollLeft: false,
      rollRight: false,
      boost: false,
      euler: new THREE.Euler(0, 0, 0, 'YXZ'),
      isMouseLookActive: false,
      baseFov: 60.0
    };

    // Cinematic Drone Path Parameters
    this.cinematicTime = 0.0;

    this._bindEvents();
    this.setMode('orbit');
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => this._onKeyDown(e));
    window.addEventListener('keyup', (e) => this._onKeyUp(e));

    // Pointer lock / mouse look for FPV flight
    this.domElement.addEventListener('mousedown', (e) => {
      if (this.mode === 'fpv' && (e.button === 0 || e.button === 1)) {
        this.fpvState.isMouseLookActive = true;
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.mode === 'fpv') {
        this.fpvState.isMouseLookActive = false;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.mode === 'fpv' && this.fpvState.isMouseLookActive) {
        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;

        this.fpvState.euler.setFromQuaternion(this.camera.quaternion);
        this.fpvState.euler.y -= movementX * 0.0025;
        this.fpvState.euler.x -= movementY * 0.0025;
        this.fpvState.euler.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.fpvState.euler.x));
        this.camera.quaternion.setFromEuler(this.fpvState.euler);
      }
    });
  }

  _onKeyDown(e) {
    if (this.mode !== 'fpv') return;

    switch (e.code) {
      case 'KeyW': this.fpvState.moveForward = true; break;
      case 'KeyS': this.fpvState.moveBackward = true; break;
      case 'KeyA': this.fpvState.moveLeft = true; break;
      case 'KeyD': this.fpvState.moveRight = true; break;
      case 'Space': this.fpvState.moveUp = true; break;
      case 'KeyC': this.fpvState.moveDown = true; break;
      case 'KeyQ': this.fpvState.rollLeft = true; break;
      case 'KeyE': this.fpvState.rollRight = true; break;
      case 'ShiftLeft':
      case 'ShiftRight': this.fpvState.boost = true; break;
    }
  }

  _onKeyUp(e) {
    if (this.mode !== 'fpv') return;

    switch (e.code) {
      case 'KeyW': this.fpvState.moveForward = false; break;
      case 'KeyS': this.fpvState.moveBackward = false; break;
      case 'KeyA': this.fpvState.moveLeft = false; break;
      case 'KeyD': this.fpvState.moveRight = false; break;
      case 'Space': this.fpvState.moveUp = false; break;
      case 'KeyC': this.fpvState.moveDown = false; break;
      case 'KeyQ': this.fpvState.rollLeft = false; break;
      case 'KeyE': this.fpvState.rollRight = false; break;
      case 'ShiftLeft':
      case 'ShiftRight': this.fpvState.boost = false; break;
    }
  }

  setMode(mode) {
    this.mode = mode;

    if (mode === 'orbit') {
      this.orbitControls.enabled = true;
      this.camera.fov = 60;
      this.camera.updateProjectionMatrix();
    } else if (mode === 'fpv') {
      this.orbitControls.enabled = false;
      this.fpvState.euler.setFromQuaternion(this.camera.quaternion);
    } else if (mode === 'cinematic') {
      this.orbitControls.enabled = false;
      this.cinematicTime = 0.0;
    }
  }

  update(delta, time) {
    if (this.mode === 'orbit') {
      this.orbitControls.update();
    } else if (this.mode === 'fpv') {
      this._updateFPV(delta);
    } else if (this.mode === 'cinematic') {
      this._updateCinematic(delta, time);
    }
  }

  _updateFPV(delta) {
    const dt = Math.min(delta, 0.05);
    const speed = this.fpvState.boost ? 70.0 : 25.0;

    // Direction vector in camera local space
    const moveDir = new THREE.Vector3();

    if (this.fpvState.moveForward) moveDir.z -= 1;
    if (this.fpvState.moveBackward) moveDir.z += 1;
    if (this.fpvState.moveLeft) moveDir.x -= 1;
    if (this.fpvState.moveRight) moveDir.x += 1;
    if (this.fpvState.moveUp) moveDir.y += 1;
    if (this.fpvState.moveDown) moveDir.y -= 1;

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      moveDir.applyQuaternion(this.camera.quaternion);
      this.fpvState.velocity.addScaledVector(moveDir, speed * dt * 4.0);
    }

    // Roll rotation
    if (this.fpvState.rollLeft) {
      this.camera.rotateZ(dt * 1.5);
    }
    if (this.fpvState.rollRight) {
      this.camera.rotateZ(-dt * 1.5);
    }

    // Space drag / damping
    this.fpvState.velocity.multiplyScalar(0.92);
    this.camera.position.addScaledVector(this.fpvState.velocity, dt);

    // Dynamic FOV warp stretch during boost
    const curSpeed = this.fpvState.velocity.length();
    const targetFov = this.fpvState.baseFov + (this.fpvState.boost ? 18.0 : Math.min(10.0, curSpeed * 0.2));
    this.camera.fov += (targetFov - this.camera.fov) * 0.1;
    this.camera.updateProjectionMatrix();

    // Engine sound feedback
    if (this.soundFX) {
      this.soundFX.setWarpThrust(curSpeed / 70.0);
    }
  }

  _updateCinematic(delta, time) {
    this.cinematicTime += delta * 0.12;

    // Smooth multi-frequency orbital spline
    const t = this.cinematicTime;
    const r = 45.0 + Math.sin(t * 0.7) * 15.0;
    const x = Math.cos(t) * r;
    const z = Math.sin(t) * r;
    const y = Math.sin(t * 1.4) * 16.0 + 8.0;

    this.camera.position.set(x, y, z);
    // Look at center of the singularity with slight lead
    this.camera.lookAt(0, Math.sin(t * 0.5) * 2.0, 0);
  }
}
