// AETHERIA - Relativistic Physics Engine & Interactive Force Field Solver

import * as THREE from 'three';

export class PhysicsEngine {
  constructor(config, soundFX) {
    this.config = config;
    this.soundFX = soundFX;

    this.timeScale = config.timeScale || 1.0;
    this.targetTimeScale = this.timeScale;
    this.gravityStrength = 1.0;

    // Interactive Force Well State
    this.forceWell = {
      active: false,
      position: new THREE.Vector3(),
      strength: 250.0,
      radius: 40.0,
      isRepulsion: false
    };

    // Shockwave State
    this.shockwave = {
      active: false,
      time: -1.0,
      center: new THREE.Vector2(0.5, 0.5),
      speed: 0.85
    };
  }

  setTimeScale(scale) {
    this.targetTimeScale = Math.max(0.05, Math.min(3.0, scale));
  }

  setGravityStrength(val) {
    this.gravityStrength = Math.max(0.1, Math.min(3.0, val));
  }

  triggerShockwave(screenUv = [0.5, 0.5]) {
    this.shockwave.active = true;
    this.shockwave.time = 0.0;
    this.shockwave.center.set(screenUv[0], screenUv[1]);

    if (this.soundFX) {
      this.soundFX.playSupernova();
    }
  }

  setInteractiveForce(active, pos = null, isRepulsion = false, strength = 250.0) {
    this.forceWell.active = active;
    this.forceWell.isRepulsion = isRepulsion;
    this.forceWell.strength = strength;

    if (pos) {
      this.forceWell.position.copy(pos);
    }

    if (active && this.soundFX) {
      if (isRepulsion) {
        this.soundFX.playRepulsionWave();
      } else {
        this.soundFX.playGravityPulse(0.7);
      }
    }
  }

  update(rawDelta) {
    // Smooth time scale transition
    this.timeScale += (this.targetTimeScale - this.timeScale) * 0.1;
    const delta = rawDelta * this.timeScale;

    // Update Shockwave Ripple
    if (this.shockwave.active) {
      this.shockwave.time += rawDelta * this.shockwave.speed;
      if (this.shockwave.time > 2.0) {
        this.shockwave.active = false;
        this.shockwave.time = -1.0;
      }
    }

    return {
      delta,
      timeScale: this.timeScale,
      shockwaveTime: this.shockwave.time,
      shockwaveCenter: this.shockwave.center,
      forceWell: this.forceWell,
      effectiveMass: this.config.blackHole.mass * this.gravityStrength
    };
  }
}
