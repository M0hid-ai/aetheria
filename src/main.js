// AETHERIA - Master Simulation Orchestrator

import * as THREE from 'three';
import { PRESETS, SIM_DEFAULTS } from './config.js';
import { AudioEngine } from './audio/AudioEngine.js';
import { SoundFX } from './audio/SoundFX.js';
import { PhysicsEngine } from './simulation/PhysicsEngine.js';
import { AppRenderer } from './core/Renderer.js';
import { BlackHole } from './simulation/BlackHole.js';
import { BoidSwarm } from './simulation/BoidSwarm.js';
import { ParticleSystem } from './simulation/ParticleSystem.js';
import { CameraController } from './core/CameraController.js';
import { InputManager } from './core/InputManager.js';
import { HUD } from './ui/HUD.js';

class AetheriaApp {
  constructor() {
    this.currentPresetKey = 'gargantua';
    this.currentPreset = PRESETS[this.currentPresetKey];

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.audio = null;
    this.soundFX = null;
    this.physics = null;
    this.blackHole = null;
    this.boids = null;
    this.particles = null;
    this.cameraController = null;
    this.inputManager = null;
    this.hud = null;

    this.clock = new THREE.Clock();
    this.totalTime = 0.0;
  }

  async init() {
    // 1. Scene & Camera Setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020208, 0.0018);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1500);
    this.camera.position.set(0, 22, 68);

    // 2. Audio Subsystems
    this.audio = new AudioEngine();
    this.soundFX = new SoundFX(this.audio);

    // 3. Physics Engine
    this.physics = new PhysicsEngine(this.currentPreset, this.soundFX);

    // 4. WebGL2 & Post-Processing Renderer
    const canvas = document.getElementById('webgl-canvas');
    this.renderer = new AppRenderer(canvas);
    this.renderer.setupPostProcessing(this.scene, this.camera);

    // 5. Celestial Simulation Components
    this.blackHole = new BlackHole(this.scene, this.currentPreset);
    this.particles = new ParticleSystem(this.scene, this.currentPreset);
    this.boids = new BoidSwarm(this.scene, this.currentPreset, this.soundFX);

    // 6. Camera Controller (Orbit, FPV Flight, Cinematic)
    this.cameraController = new CameraController(this.camera, canvas, this.soundFX);

    // 7. Input Management (Force Wells & Raycasting)
    this.inputManager = new InputManager(
      canvas,
      this.camera,
      this.physics,
      this.particles,
      (presetId) => this.switchPreset(presetId),
      (mode) => {
        this.cameraController.setMode(mode);
        this.hud.setActiveModeButton(mode);
      }
    );

    // 8. HUD & UI Orchestration
    this.hud = new HUD({
      audioEngine: this.audio,
      soundFX: this.soundFX,
      physicsEngine: this.physics,
      renderer: this.renderer,
      cameraController: this.cameraController,
      particleSystem: this.particles,
      onPresetSelect: (presetId) => this.switchPreset(presetId)
    });

    // 9. Start Simulation Loop
    this._animate();
  }

  switchPreset(presetKey) {
    if (!PRESETS[presetKey]) return;
    this.currentPresetKey = presetKey;
    this.currentPreset = PRESETS[presetKey];

    // Propagate preset to all subsystems
    this.blackHole.applyPreset(this.currentPreset);
    this.boids.applyPreset(this.currentPreset);
    this.particles.applyPreset(this.currentPreset);
    this.audio.setPreset(this.currentPreset);

    // Trigger subtle spacetime shockwave transition
    this.physics.triggerShockwave([0.5, 0.5]);
  }

  _animate() {
    requestAnimationFrame(() => this._animate());

    const rawDelta = Math.min(this.clock.getDelta(), 0.08);

    // 1. Update Physics (Time dilation & interactive force wells)
    const phys = this.physics.update(rawDelta);
    this.totalTime += phys.delta;

    // 2. Audio Energy Analysis
    const audioMetrics = this.audio.getVisualizerData();
    const audioEnergy = audioMetrics.energy || 0.0;

    // 3. Update Camera
    this.cameraController.update(phys.delta, this.totalTime);

    // 4. Update Celestial Entities
    this.blackHole.update(this.totalTime, phys.delta, audioEnergy, this.camera);
    this.particles.update(phys.delta, this.totalTime, audioEnergy);

    // 5. Update Artificial Life Boid Swarms
    const gravityCenter = new THREE.Vector3(0, 0, 0);
    this.boids.update(
      phys.delta,
      this.totalTime,
      gravityCenter,
      phys.effectiveMass,
      phys.forceWell
    );

    // 6. Post-Processing Gravitational Lensing & Shockwaves
    const screenMetrics = this.blackHole.getScreenMetrics(
      this.camera,
      this.renderer.width,
      this.renderer.height
    );
    this.renderer.updateLensing(
      screenMetrics,
      { time: phys.shockwaveTime, center: phys.shockwaveCenter },
      this.totalTime
    );

    // 7. Render Frame
    this.renderer.render();

    // 8. Update HUD & Telemetry
    this.hud.update(this.currentPreset, this.boids.count);
  }
}

// Bootstrap on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new AetheriaApp();
  app.init();
});
