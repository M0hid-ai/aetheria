// AETHERIA - WebGL2 Renderer & Post-Processing Pipeline

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { lensingShader } from '../shaders/lensing.glsl.js';

export class AppRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // WebGL2 Renderer with cinematic HDR tone mapping
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      preserveDrawingBuffer: true // Required for high-res screenshot capture
    });

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.composer = null;
    this.renderPass = null;
    this.bloomPass = null;
    this.lensingPass = null;
  }

  setupPostProcessing(scene, camera) {
    const renderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      samples: 4
    });

    this.composer = new EffectComposer(this.renderer, renderTarget);

    // 1. Base Scene Render Pass
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // 2. Unreal Bloom Pass (Sci-Fi Luminance Glow)
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      1.35, // strength
      0.45, // radius
      0.75  // threshold
    );
    this.composer.addPass(this.bloomPass);

    // 3. Gravitational Lensing & Shockwave Pass
    this.lensingPass = new ShaderPass(lensingShader);
    this.lensingPass.uniforms.uAspect.value = this.width / this.height;
    this.composer.addPass(this.lensingPass);

    window.addEventListener('resize', () => this.onResize(camera));
  }

  setBloomIntensity(val) {
    if (this.bloomPass) {
      this.bloomPass.strength = Math.max(0, Math.min(3.5, val));
    }
  }

  updateLensing(screenMetrics, shockwaveData, time) {
    if (!this.lensingPass) return;

    const u = this.lensingPass.uniforms;
    u.uAspect.value = this.width / this.height;
    u.uTime.value = time;

    if (screenMetrics && screenMetrics.isVisible) {
      u.uActive.value = 1.0;
      u.uBlackHoleScreenPos.value = screenMetrics.screenUV;
      u.uHorizonScreenRadius.value = screenMetrics.horizonScreenRadius;
      u.uLensingStrength.value = 0.012;
    } else {
      u.uActive.value = 0.0;
    }

    if (shockwaveData) {
      u.uShockwaveTime.value = shockwaveData.time;
      u.uShockwaveCenter.value = [shockwaveData.center.x, shockwaveData.center.y];
    }
  }

  render() {
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  onResize(camera) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    camera.aspect = this.width / this.height;
    camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));

    if (this.composer) {
      this.composer.setSize(this.width, this.height);
    }
    if (this.bloomPass) {
      this.bloomPass.resolution.set(this.width, this.height);
    }
    if (this.lensingPass) {
      this.lensingPass.uniforms.uAspect.value = this.width / this.height;
    }
  }

  captureScreenshot() {
    return this.canvas.toDataURL('image/png');
  }
}
