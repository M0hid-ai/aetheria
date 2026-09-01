// AETHERIA - Input Management & Interactive Force Raycasting

import * as THREE from 'three';

export class InputManager {
  constructor(domElement, camera, physicsEngine, particleSystem, onPresetChange, onModeChange) {
    this.domElement = domElement;
    this.camera = camera;
    this.physics = physicsEngine;
    this.particleSystem = particleSystem;
    this.onPresetChange = onPresetChange;
    this.onModeChange = onModeChange;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // XZ orbital interaction plane
    this.intersectionPoint = new THREE.Vector3();

    this.isLeftMouseDown = false;
    this.isRightMouseDown = false;

    this._bindEvents();
  }

  _bindEvents() {
    // Disable default context menu so right-click is fully usable for antimatter blast
    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    this.domElement.addEventListener('mousedown', (e) => this._onMouseDown(e));
    this.domElement.addEventListener('mousemove', (e) => this._onMouseMove(e));
    window.addEventListener('mouseup', (e) => this._onMouseUp(e));
    window.addEventListener('keydown', (e) => this._onKeyDown(e));
  }

  _updateIntersection(e) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.raycaster.ray.intersectPlane(this.plane, this.intersectionPoint);
  }

  _onMouseDown(e) {
    // Only capture interactive force wells if in orbit mode and not clicking UI
    if (e.target !== this.domElement) return;

    this._updateIntersection(e);

    if (e.button === 0 && !e.shiftKey) {
      // Left-Click: Gravity Well Attractor
      this.isLeftMouseDown = true;
      this.physics.setInteractiveForce(true, this.intersectionPoint, false, 280.0);
    } else if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
      // Right-Click or Shift-Click: Antimatter Repulsion Blast
      this.isRightMouseDown = true;
      this.physics.setInteractiveForce(true, this.intersectionPoint, true, 450.0);
    }
  }

  _onMouseMove(e) {
    if (this.isLeftMouseDown || this.isRightMouseDown) {
      this._updateIntersection(e);
      this.physics.forceWell.position.copy(this.intersectionPoint);
    }
  }

  _onMouseUp(e) {
    if (e.button === 0) this.isLeftMouseDown = false;
    if (e.button === 2) this.isRightMouseDown = false;

    if (!this.isLeftMouseDown && !this.isRightMouseDown) {
      this.physics.setInteractiveForce(false);
    }
  }

  _onKeyDown(e) {
    // Prevent interfering with input elements if any
    if (e.target.tagName === 'INPUT') return;

    switch (e.code) {
      case 'Digit1': if (this.onPresetChange) this.onPresetChange('gargantua'); break;
      case 'Digit2': if (this.onPresetChange) this.onPresetChange('abyss'); break;
      case 'Digit3': if (this.onPresetChange) this.onPresetChange('cybergrid'); break;
      case 'Digit4': if (this.onPresetChange) this.onPresetChange('genesis'); break;

      case 'KeyO': if (this.onModeChange) this.onModeChange('orbit'); break;
      case 'KeyF': if (this.onModeChange) this.onModeChange('fpv'); break;
      case 'KeyC': if (this.onModeChange) this.onModeChange('cinematic'); break;

      case 'Space':
        // Supernova detonation
        this.particleSystem.triggerSupernova(new THREE.Vector3(0, 0, 0));
        this.physics.triggerShockwave([0.5, 0.5]);
        break;
    }
  }
}
