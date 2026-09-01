// AETHERIA - Emergent Artificial Life: Bioluminescent Boid Swarms & Predator Leviathans

import * as THREE from 'three';

export class BoidSwarm {
  constructor(scene, config, soundFX) {
    this.scene = scene;
    this.config = config;
    this.soundFX = soundFX;

    this.count = config.boids.count;
    this.maxSpeed = config.boids.maxSpeed;
    this.maxForce = config.boids.maxForce;
    this.separationDist = config.boids.separationDist;
    this.neighborDist = config.boids.neighborDist;

    // Boid physical state arrays (Flat Float32 for memory cache efficiency)
    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);
    this.phases = new Float32Array(this.count); // Bioluminescent phase [0, 2PI]
    this.phaseFrequencies = new Float32Array(this.count);

    // Predator Leviathans (Large glowing creatures)
    this.predatorCount = 5;
    this.predatorPositions = [];
    this.predatorVelocities = [];
    this.predatorMeshes = [];

    this.instancedMesh = null;
    this.dummy = new THREE.Object3D();
    this.colorHelper = new THREE.Color();
    this.baseColor = new THREE.Color(config.colors.boids);
    this.flashColor = new THREE.Color(config.colors.accent);

    this.flashWaveTriggered = false;

    this._init();
  }

  _init() {
    this._initBoidsState();
    this._createInstancedMesh();
    this._initPredators();
  }

  _initBoidsState() {
    const rSpread = 45.0;
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      // Spawn in toroidal/annular distribution around singularity
      const angle = Math.random() * Math.PI * 2;
      const radius = THREE.MathUtils.randFloat(12.0, rSpread);
      const height = THREE.MathUtils.randFloatSpread(14.0);

      this.positions[idx] = Math.cos(angle) * radius;
      this.positions[idx + 1] = height;
      this.positions[idx + 2] = Math.sin(angle) * radius;

      // Initial orbital tangential velocity
      const orbitSpeed = Math.sqrt(800.0 / radius) * 0.4;
      this.velocities[idx] = -Math.sin(angle) * orbitSpeed + THREE.MathUtils.randFloatSpread(0.2);
      this.velocities[idx + 1] = THREE.MathUtils.randFloatSpread(0.15);
      this.velocities[idx + 2] = Math.cos(angle) * orbitSpeed + THREE.MathUtils.randFloatSpread(0.2);

      // Kuramoto oscillator phase for bioluminescent flashing
      this.phases[i] = Math.random() * Math.PI * 2;
      this.phaseFrequencies[i] = this.config.boids.flashFrequency + THREE.MathUtils.randFloatSpread(0.2);
    }
  }

  _createInstancedMesh() {
    // Elegant streamlined bio-dart geometry
    const coneGeo = new THREE.ConeGeometry(0.18, 0.7, 4);
    coneGeo.rotateX(Math.PI / 2); // Align cone tip along +Z direction

    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    this.instancedMesh = new THREE.InstancedMesh(coneGeo, mat, this.count);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // Set initial instance colors
    for (let i = 0; i < this.count; i++) {
      this.instancedMesh.setColorAt(i, this.baseColor);
    }
    this.instancedMesh.instanceColor.needsUpdate = true;

    this.scene.add(this.instancedMesh);
  }

  _initPredators() {
    const predGeo = new THREE.SphereGeometry(1.2, 16, 16);
    for (let p = 0; p < this.predatorCount; p++) {
      const predMat = new THREE.MeshBasicMaterial({
        color: 0xff2255,
        wireframe: true,
        blending: THREE.AdditiveBlending
      });
      const mesh = new THREE.Mesh(predGeo, predMat);

      // Trailing bioluminescent halo
      const glowGeo = new THREE.SphereGeometry(2.0, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xff0044,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      mesh.add(glow);

      const angle = (p / this.predatorCount) * Math.PI * 2;
      const radius = 28.0;
      mesh.position.set(Math.cos(angle) * radius, THREE.MathUtils.randFloatSpread(6), Math.sin(angle) * radius);

      this.predatorPositions.push(mesh.position);
      this.predatorVelocities.push(new THREE.Vector3(-Math.sin(angle) * 1.8, 0, Math.cos(angle) * 1.8));
      this.predatorMeshes.push(mesh);
      this.scene.add(mesh);
    }
  }

  update(delta, time, gravityCenter, blackHoleMass, interactiveForce) {
    const dt = Math.min(delta, 0.05);
    const speedLimit = this.maxSpeed;
    let synchronizedFlashes = 0;

    // 1. Update Predator Leviathans
    for (let p = 0; p < this.predatorCount; p++) {
      const pos = this.predatorPositions[p];
      const vel = this.predatorVelocities[p];

      // Predators orbit and slowly undulate
      const distToCenter = pos.length();
      const pull = -pos.clone().normalize().multiplyScalar(15.0 / Math.max(distToCenter, 5.0));
      vel.add(pull.multiplyScalar(dt));

      // Undulation wave
      vel.y += Math.sin(time * 2.0 + p) * 0.04;

      vel.clampLength(0, 2.5);
      pos.addScaledVector(vel, dt * 10.0);
      this.predatorMeshes[p].position.copy(pos);
      this.predatorMeshes[p].rotation.y += dt * 1.5;
    }

    // 2. High-Performance Sampled Swarm Simulation Loop
    const sampleStep = 8; // Sample flock interactions efficiently
    const targetDir = new THREE.Vector3();

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;

      let px = this.positions[idx];
      let py = this.positions[idx + 1];
      let pz = this.positions[idx + 2];

      let vx = this.velocities[idx];
      let vy = this.velocities[idx + 1];
      let vz = this.velocities[idx + 2];

      // Distance to singularity (0, 0, 0)
      const distSq = px * px + py * py + pz * pz;
      const dist = Math.sqrt(distSq) + 0.001;

      // Gravitational orbital pull: F = G * M / r^2
      const gravMag = (blackHoleMass * 0.035) / Math.max(distSq, 36.0);
      let fx = -(px / dist) * gravMag;
      let fy = -(py / dist) * gravMag;
      let fz = -(pz / dist) * gravMag;

      // Tangential orbital spin boost to maintain stable cosmic swarm disc
      const spinSpeed = 0.45;
      fx += -(pz / dist) * spinSpeed;
      fz += (px / dist) * spinSpeed;

      // Flatten towards orbital plane Y=0
      fy -= py * 0.08;

      // Flocking with sampled neighbors
      const neighborIdx = ((i + sampleStep) % this.count) * 3;
      const nx = this.positions[neighborIdx];
      const ny = this.positions[neighborIdx + 1];
      const nz = this.positions[neighborIdx + 2];

      const dx = nx - px;
      const dy = ny - py;
      const dz = nz - pz;
      const nDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (nDist < this.separationDist && nDist > 0.001) {
        // Separation
        const sepFactor = 0.25 / nDist;
        fx -= (dx / nDist) * sepFactor;
        fy -= (dy / nDist) * sepFactor;
        fz -= (dz / nDist) * sepFactor;
      } else if (nDist < this.neighborDist) {
        // Alignment & Cohesion
        fx += (this.velocities[neighborIdx] - vx) * 0.05;
        fy += (this.velocities[neighborIdx + 1] - vy) * 0.05;
        fz += (this.velocities[neighborIdx + 2] - vz) * 0.05;

        fx += dx * 0.015;
        fy += dy * 0.015;
        fz += dz * 0.015;
      }

      // Predator Avoidance: Scatter if predator is nearby!
      for (let p = 0; p < this.predatorCount; p++) {
        const predPos = this.predatorPositions[p];
        const pdx = px - predPos.x;
        const pdy = py - predPos.y;
        const pdz = pz - predPos.z;
        const pDistSq = pdx * pdx + pdy * pdy + pdz * pdz;

        if (pDistSq < 144.0) { // Within 12 units
          const pDist = Math.sqrt(pDistSq);
          const fleeForce = (12.0 - pDist) * 0.6;
          fx += (pdx / pDist) * fleeForce;
          fy += (pdy / pDist) * fleeForce;
          fz += (pdz / pDist) * fleeForce;
        }
      }

      // Interactive Force Wells (Mouse Gravity or Antimatter Repulsion)
      if (interactiveForce && interactiveForce.active) {
        const ifx = px - interactiveForce.position.x;
        const ify = py - interactiveForce.position.y;
        const ifz = pz - interactiveForce.position.z;
        const ifDistSq = ifx * ifx + ify * ify + ifz * ifz;
        const ifDist = Math.sqrt(ifDistSq) + 0.1;

        if (ifDist < interactiveForce.radius) {
          const forceStrength = (interactiveForce.strength / (ifDistSq + 10.0)) * (interactiveForce.isRepulsion ? 1.0 : -1.0);
          fx += (ifx / ifDist) * forceStrength;
          fy += (ify / ifDist) * forceStrength;
          fz += (ifz / ifDist) * forceStrength;
        }
      }

      // Apply acceleration & update velocity
      vx += fx * dt;
      vy += fy * dt;
      vz += fz * dt;

      // Clamp speed
      const curSpeed = Math.sqrt(vx * vx + vy * vy + vz * vz) + 0.0001;
      if (curSpeed > speedLimit) {
        const factor = speedLimit / curSpeed;
        vx *= factor;
        vy *= factor;
        vz *= factor;
      }

      // Event Horizon absorption & respawn
      if (dist < this.config.blackHole.horizonRadius * 1.1) {
        // Respawn at outer rim
        const newAngle = Math.random() * Math.PI * 2;
        const newRadius = THREE.MathUtils.randFloat(35.0, 50.0);
        px = Math.cos(newAngle) * newRadius;
        py = THREE.MathUtils.randFloatSpread(10.0);
        pz = Math.sin(newAngle) * newRadius;

        const newSpeed = Math.sqrt(800.0 / newRadius) * 0.4;
        vx = -Math.sin(newAngle) * newSpeed;
        vy = 0;
        vz = Math.cos(newAngle) * newSpeed;
      } else {
        // Integrate position
        px += vx * dt * 18.0;
        py += vy * dt * 18.0;
        pz += vz * dt * 18.0;
      }

      this.positions[idx] = px;
      this.positions[idx + 1] = py;
      this.positions[idx + 2] = pz;

      this.velocities[idx] = vx;
      this.velocities[idx + 1] = vy;
      this.velocities[idx + 2] = vz;

      // 3. Bioluminescent Kuramoto Phase Update
      this.phases[i] += this.phaseFrequencies[i] * dt * 5.0;
      if (this.phases[i] > Math.PI * 2) {
        this.phases[i] -= Math.PI * 2;
        // Flash trigger
        synchronizedFlashes++;
      }

      // Compute pulse brightness [0, 1]
      const flashBrightness = Math.pow(Math.max(0.0, Math.sin(this.phases[i])), 6.0);

      // 4. Update Instanced Mesh Matrix & Orientation
      this.dummy.position.set(px, py, pz);
      // Orient cone towards flight velocity vector
      targetDir.set(px + vx, py + vy, pz + vz);
      this.dummy.lookAt(targetDir);
      this.dummy.scale.setScalar(0.7 + flashBrightness * 0.8);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);

      // Interpolate Color between base and flash glow
      this.colorHelper.copy(this.baseColor).lerp(this.flashColor, flashBrightness);
      this.instancedMesh.setColorAt(i, this.colorHelper);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    // Audio chime trigger if a major synchronized wave flashes
    if (synchronizedFlashes > this.count * 0.08 && !this.flashWaveTriggered) {
      this.flashWaveTriggered = true;
      if (this.soundFX) {
        this.soundFX.playBoidChirp(THREE.MathUtils.randFloat(600, 1400));
      }
      setTimeout(() => { this.flashWaveTriggered = false; }, 800);
    }
  }

  applyPreset(config) {
    this.config = config;
    this.maxSpeed = config.boids.maxSpeed;
    this.maxForce = config.boids.maxForce;
    this.separationDist = config.boids.separationDist;
    this.neighborDist = config.boids.neighborDist;

    this.baseColor.set(config.colors.boids);
    this.flashColor.set(config.colors.accent);

    for (let i = 0; i < this.count; i++) {
      this.phaseFrequencies[i] = config.boids.flashFrequency + THREE.MathUtils.randFloatSpread(0.2);
    }
  }
}
