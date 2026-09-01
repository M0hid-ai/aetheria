// AETHERIA - Cosmic Dust, Deep Starfield & Supernova Ejecta

import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;

    this.starfield = null;
    this.nebulaDust = null;
    this.supernovaParticles = null;
    this.supernovaActive = false;
    this.supernovaAge = 0;

    this._createDeepStarfield();
    this._createNebulaClouds();
    this._createSupernovaSystem();
  }

  _createTexture(innerColor, outerColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(0.3, outerColor);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  _createDeepStarfield() {
    const count = 6000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const baseColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Distribute on large spherical celestial dome
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = THREE.MathUtils.randFloat(200, 450);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Star temperature color variation (blue giants to orange dwarfs)
      const temp = Math.random();
      if (temp > 0.8) {
        baseColor.setRGB(0.7, 0.85, 1.0); // Blue giant
      } else if (temp > 0.3) {
        baseColor.setRGB(1.0, 1.0, 0.95); // White main sequence
      } else {
        baseColor.setRGB(1.0, 0.7, 0.4); // Red/orange dwarf
      }

      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;

      sizes[i] = Math.random() * 2.2 + 0.8;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starTexture = this._createTexture('rgba(255,255,255,1)', 'rgba(200,220,255,0.6)');

    const mat = new THREE.PointsMaterial({
      size: 2.0,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starfield = new THREE.Points(geo, mat);
    this.scene.add(this.starfield);
  }

  _createNebulaClouds() {
    const cloudCount = 1200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(cloudCount * 3);
    const colors = new Float32Array(cloudCount * 3);

    const primaryColor = new THREE.Color(this.config.colors.secondary);
    const accentColor = new THREE.Color(this.config.colors.accent);

    for (let i = 0; i < cloudCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = THREE.MathUtils.randFloat(30, 120);
      const height = THREE.MathUtils.randFloatSpread(35);

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      const lerped = primaryColor.clone().lerp(accentColor, Math.random());
      colors[i * 3] = lerped.r;
      colors[i * 3 + 1] = lerped.g;
      colors[i * 3 + 2] = lerped.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const dustTexture = this._createTexture('rgba(255,255,255,0.8)', 'rgba(150,180,255,0.3)');

    const mat = new THREE.PointsMaterial({
      size: 16.0,
      map: dustTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.nebulaDust = new THREE.Points(geo, mat);
    this.scene.add(this.nebulaDust);
  }

  _createSupernovaSystem() {
    const count = 4000;
    const geo = new THREE.BufferGeometry();
    this.snPositions = new Float32Array(count * 3);
    this.snVelocities = new Float32Array(count * 3);
    this.snColors = new Float32Array(count * 3);

    geo.setAttribute('position', new THREE.BufferAttribute(this.snPositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.snColors, 3));

    const sparkTexture = this._createTexture('rgba(255,255,255,1)', 'rgba(255,200,100,0.8)');

    this.snMaterial = new THREE.PointsMaterial({
      size: 3.5,
      map: sparkTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.supernovaParticles = new THREE.Points(geo, this.snMaterial);
    this.scene.add(this.supernovaParticles);
  }

  triggerSupernova(origin = new THREE.Vector3(0, 0, 0)) {
    this.supernovaActive = true;
    this.supernovaAge = 0;
    this.snMaterial.opacity = 1.0;

    const count = this.snPositions.length / 3;
    const sparkColor = new THREE.Color(0xffffff);
    const fireColor = new THREE.Color(this.config.colors.primary);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      this.snPositions[idx] = origin.x;
      this.snPositions[idx + 1] = origin.y;
      this.snPositions[idx + 2] = origin.z;

      // Spherical explosive ejection vector
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = THREE.MathUtils.randFloat(25.0, 90.0);

      this.snVelocities[idx] = Math.sin(phi) * Math.cos(theta) * speed;
      this.snVelocities[idx + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      this.snVelocities[idx + 2] = Math.cos(phi) * speed;

      const col = sparkColor.clone().lerp(fireColor, Math.random() * 0.7);
      this.snColors[idx] = col.r;
      this.snColors[idx + 1] = col.g;
      this.snColors[idx + 2] = col.b;
    }

    this.supernovaParticles.geometry.attributes.position.needsUpdate = true;
    this.supernovaParticles.geometry.attributes.color.needsUpdate = true;
  }

  update(delta, time, audioEnergy) {
    // 1. Slow cosmic rotation of starfield
    if (this.starfield) {
      this.starfield.rotation.y += delta * 0.008;
      this.starfield.rotation.x += delta * 0.003;
    }

    // 2. Swirling nebula gas clouds
    if (this.nebulaDust) {
      this.nebulaDust.rotation.y += delta * 0.02;
      // Pulse opacity with audio
      this.nebulaDust.material.opacity = 0.25 + audioEnergy * 0.35;
    }

    // 3. Supernova Ejecta Physics
    if (this.supernovaActive) {
      this.supernovaAge += delta;
      const dt = Math.min(delta, 0.05);
      const posAttr = this.supernovaParticles.geometry.attributes.position;
      const count = this.snPositions.length / 3;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        // Drag deceleration
        this.snVelocities[idx] *= 0.98;
        this.snVelocities[idx + 1] *= 0.98;
        this.snVelocities[idx + 2] *= 0.98;

        this.snPositions[idx] += this.snVelocities[idx] * dt;
        this.snPositions[idx + 1] += this.snVelocities[idx + 1] * dt;
        this.snPositions[idx + 2] += this.snVelocities[idx + 2] * dt;
      }
      posAttr.needsUpdate = true;

      // Fade out over 4 seconds
      const life = this.supernovaAge / 4.0;
      this.snMaterial.opacity = Math.max(0.0, 1.0 - life);

      if (life >= 1.0) {
        this.supernovaActive = false;
        this.snMaterial.opacity = 0.0;
      }
    }
  }

  applyPreset(config) {
    this.config = config;
    if (this.nebulaDust) {
      const colors = this.nebulaDust.geometry.attributes.color.array;
      const primaryColor = new THREE.Color(config.colors.secondary);
      const accentColor = new THREE.Color(config.colors.accent);
      const count = colors.length / 3;

      for (let i = 0; i < count; i++) {
        const lerped = primaryColor.clone().lerp(accentColor, Math.random());
        colors[i * 3] = lerped.r;
        colors[i * 3 + 1] = lerped.g;
        colors[i * 3 + 2] = lerped.b;
      }
      this.nebulaDust.geometry.attributes.color.needsUpdate = true;
    }
  }
}
