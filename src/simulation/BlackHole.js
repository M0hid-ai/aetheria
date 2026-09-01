// AETHERIA - Relativistic Singularity, Accretion Disk & Polar Jets

import * as THREE from 'three';
import { accretionDiskVertexShader, accretionDiskFragmentShader } from '../shaders/accretionDisk.glsl.js';

export class BlackHole {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.group = new THREE.Group();

    this.mass = config.blackHole.mass;
    this.horizonRadius = config.blackHole.horizonRadius;
    this.accretionInner = config.blackHole.accretionInner;
    this.accretionOuter = config.blackHole.accretionOuter;

    this.eventHorizon = null;
    this.photonRing = null;
    this.accretionDisk = null;
    this.diskMaterial = null;
    this.polarJets = null;

    this._init();
    this.scene.add(this.group);
  }

  _init() {
    this._createEventHorizon();
    this._createPhotonRing();
    this._createAccretionDisk();
    this._createPolarJets();

    // Give the black hole system a realistic tilted orbital plane
    this.group.rotation.x = THREE.MathUtils.degToRad(18);
    this.group.rotation.z = THREE.MathUtils.degToRad(8);
  }

  _createEventHorizon() {
    // True black absorbing sphere of the Schwarzschild radius
    const geo = new THREE.SphereGeometry(this.horizonRadius, 64, 64);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      depthWrite: true
    });
    this.eventHorizon = new THREE.Mesh(geo, mat);
    this.group.add(this.eventHorizon);
  }

  _createPhotonRing() {
    // The photon sphere where light is trapped in orbit: r = 1.5 * r_s
    const ringGeo = new THREE.RingGeometry(this.horizonRadius * 1.01, this.horizonRadius * 1.15, 64);
    const ringMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          float dist = length(vUv - 0.5) * 2.0;
          float alpha = smoothstep(1.0, 0.0, abs(dist - 0.5) * 2.0);
          gl_FragColor = vec4(uColor * 2.0, alpha * 0.85);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(this.config.colors.accent) }
      },
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.photonRing = new THREE.Mesh(ringGeo, ringMat);
    this.photonRing.rotation.x = Math.PI / 2;
    this.group.add(this.photonRing);
  }

  _createAccretionDisk() {
    // Ultra-dense ring geometry for smooth shader sampling
    const diskGeo = new THREE.RingGeometry(
      this.accretionInner,
      this.accretionOuter,
      128,
      32
    );

    this.diskMaterial = new THREE.ShaderMaterial({
      vertexShader: accretionDiskVertexShader,
      fragmentShader: accretionDiskFragmentShader,
      uniforms: {
        uTime: { value: 0.0 },
        uInnerRadius: { value: this.accretionInner },
        uOuterRadius: { value: this.accretionOuter },
        uPrimaryColor: { value: new THREE.Color(this.config.colors.primary) },
        uSecondaryColor: { value: new THREE.Color(this.config.colors.secondary) },
        uAccentColor: { value: new THREE.Color(this.config.colors.accent) },
        uAudioEnergy: { value: 0.0 },
        uCameraPos: { value: new THREE.Vector3() }
      },
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.accretionDisk = new THREE.Mesh(diskGeo, this.diskMaterial);
    this.accretionDisk.rotation.x = Math.PI / 2;
    this.group.add(this.accretionDisk);
  }

  _createPolarJets() {
    // Dual relativistic particle beams shooting from magnetic poles
    const particleCount = 2000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const angles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);
    const directions = new Float32Array(particleCount); // +1 (North) or -1 (South)

    const jetColor = new THREE.Color(this.config.colors.jet);

    for (let i = 0; i < particleCount; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      const height = Math.random() * 60 + 2;
      const spread = (height / 60) * 3.5;
      const angle = Math.random() * Math.PI * 2;

      positions[i * 3] = Math.cos(angle) * spread;
      positions[i * 3 + 1] = height * dir;
      positions[i * 3 + 2] = Math.sin(angle) * spread;

      colors[i * 3] = jetColor.r;
      colors[i * 3 + 1] = jetColor.g;
      colors[i * 3 + 2] = jetColor.b;

      speeds[i] = Math.random() * 1.5 + 1.2;
      angles[i] = angle;
      radii[i] = spread;
      directions[i] = dir;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom circular soft glow point texture generated in code
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(200,230,255,0.7)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 1.6,
      map: texture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.polarJets = new THREE.Points(geo, mat);
    this.jetData = { speeds, angles, directions, particleCount };
    this.group.add(this.polarJets);
  }

  update(time, delta, audioEnergy, camera) {
    // 1. Update Accretion Disk Shader uniforms
    if (this.diskMaterial) {
      this.diskMaterial.uniforms.uTime.value = time;
      this.diskMaterial.uniforms.uAudioEnergy.value = audioEnergy;
      this.diskMaterial.uniforms.uCameraPos.value.copy(camera.position);
    }

    // 2. Animate Polar Jets
    if (this.polarJets) {
      const posAttr = this.polarJets.geometry.attributes.position;
      const pos = posAttr.array;
      const { speeds, angles, directions, particleCount } = this.jetData;

      const jetBoost = 1.0 + audioEnergy * this.config.blackHole.jetIntensity;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const dir = directions[i];

        // Move outward along Y axis
        pos[idx + 1] += speeds[i] * delta * 45.0 * dir * jetBoost;

        // Spiral rotation
        angles[i] += delta * 4.0;
        const currentHeight = Math.abs(pos[idx + 1]);
        const spread = (currentHeight / 60) * 4.0;

        pos[idx] = Math.cos(angles[i]) * spread;
        pos[idx + 2] = Math.sin(angles[i]) * spread;

        // Reset particles that escape jet bounds
        if (currentHeight > 65) {
          pos[idx + 1] = (this.horizonRadius * 0.8) * dir;
          angles[i] = Math.random() * Math.PI * 2;
        }
      }
      posAttr.needsUpdate = true;
    }

    // 3. Subtle slow axial precession
    this.group.rotation.y += delta * 0.05 * this.config.blackHole.spin;
  }

  applyPreset(config) {
    this.config = config;
    this.mass = config.blackHole.mass;
    this.horizonRadius = config.blackHole.horizonRadius;
    this.accretionInner = config.blackHole.accretionInner;
    this.accretionOuter = config.blackHole.accretionOuter;

    // Update geometries and material uniforms
    this.eventHorizon.scale.setScalar(this.horizonRadius / 5.5);
    this.photonRing.scale.setScalar(this.horizonRadius / 5.5);

    if (this.diskMaterial) {
      this.diskMaterial.uniforms.uInnerRadius.value = this.accretionInner;
      this.diskMaterial.uniforms.uOuterRadius.value = this.accretionOuter;
      this.diskMaterial.uniforms.uPrimaryColor.value.set(config.colors.primary);
      this.diskMaterial.uniforms.uSecondaryColor.value.set(config.colors.secondary);
      this.diskMaterial.uniforms.uAccentColor.value.set(config.colors.accent);
    }
  }

  // Get screen-projected coordinates for post-processing gravitational lensing
  getScreenMetrics(camera, width, height) {
    const worldPos = new THREE.Vector3();
    this.group.getWorldPosition(worldPos);

    // Project 3D vector to Normalized Device Coordinates [-1, 1]
    const screenVec = worldPos.clone().project(camera);

    // Behind camera check
    const isVisible = screenVec.z < 1.0;

    // Screen UV [0, 1]
    const screenUV = [
      (screenVec.x + 1.0) * 0.5,
      (screenVec.y + 1.0) * 0.5
    ];

    // Compute apparent screen radius of event horizon
    const distToCam = camera.position.distanceTo(worldPos);
    const fovRad = THREE.MathUtils.degToRad(camera.fov);
    const horizonScreenRadius = (this.horizonRadius / distToCam) / Math.tan(fovRad * 0.5);

    return {
      screenUV,
      horizonScreenRadius: Math.max(0.005, Math.min(0.35, horizonScreenRadius)),
      isVisible
    };
  }
}
