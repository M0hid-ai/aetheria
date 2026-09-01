// AETHERIA - Heads-Up Display (HUD), Visualizer & Interaction Orchestrator

export class HUD {
  constructor({
    audioEngine,
    soundFX,
    physicsEngine,
    renderer,
    cameraController,
    particleSystem,
    onPresetSelect
  }) {
    this.audio = audioEngine;
    this.soundFX = soundFX;
    this.physics = physicsEngine;
    this.renderer = renderer;
    this.cameraController = cameraController;
    this.particleSystem = particleSystem;
    this.onPresetSelect = onPresetSelect;

    // Telemetry rolling counters
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;

    // Visualizer Canvas
    this.visCanvas = document.getElementById('visualizer-canvas');
    this.visCtx = this.visCanvas ? this.visCanvas.getContext('2d') : null;

    this._bindUI();
  }

  _bindUI() {
    // 1. Audio Start / Mute Toggle
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', async () => {
        if (!this.audio.isPlaying) {
          await this.audio.start(this.currentPreset);
          audioBtn.classList.add('active-audio');
          audioBtn.innerHTML = '<span>🔊</span> Audio: Active';
        } else {
          this.audio.stop();
          audioBtn.classList.remove('active-audio');
          audioBtn.innerHTML = '<span>🔈</span> Audio: Muted';
        }
      });
    }

    // 2. Preset Buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const presetId = e.target.dataset.preset;
        if (presetId && this.onPresetSelect) {
          this.onPresetSelect(presetId);
          this.setActivePresetButton(presetId);
        }
      });
    });

    // 3. Camera Mode Buttons
    document.querySelectorAll('.mode-btn[data-mode]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        this.cameraController.setMode(mode);
        this.setActiveModeButton(mode);
      });
    });

    // 4. Supernova Trigger Button
    const snBtn = document.getElementById('supernova-btn');
    if (snBtn) {
      snBtn.addEventListener('click', () => {
        this.particleSystem.triggerSupernova();
        this.physics.triggerShockwave([0.5, 0.5]);
      });
    }

    // 5. Screenshot Capture Button
    const captureBtn = document.getElementById('capture-btn');
    if (captureBtn) {
      captureBtn.addEventListener('click', () => {
        this.captureFrame();
      });
    }

    // 6. Sliders
    const bloomSlider = document.getElementById('slider-bloom');
    if (bloomSlider) {
      bloomSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.renderer.setBloomIntensity(val);
        document.getElementById('val-bloom').textContent = val.toFixed(1);
      });
    }

    const timeSlider = document.getElementById('slider-time');
    if (timeSlider) {
      timeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.physics.setTimeScale(val);
        document.getElementById('val-time').textContent = val.toFixed(1) + 'x';
      });
    }

    const gravSlider = document.getElementById('slider-gravity');
    if (gravSlider) {
      gravSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.physics.setGravityStrength(val);
        document.getElementById('val-gravity').textContent = val.toFixed(1);
      });
    }

    // 7. Help Modal Toggle
    const helpBtn = document.getElementById('help-btn');
    const modal = document.getElementById('shortcuts-modal');
    const closeBtn = document.getElementById('modal-close');

    if (helpBtn && modal) {
      helpBtn.addEventListener('click', () => modal.classList.add('open'));
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        modal.classList.toggle('open');
      } else if (e.key === 'Escape' && modal) {
        modal.classList.remove('open');
      } else if (e.key === 'p' || e.key === 'P') {
        this.captureFrame();
      }
    });
  }

  setActivePresetButton(presetId) {
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === presetId);
    });
  }

  setActiveModeButton(mode) {
    document.querySelectorAll('.mode-btn[data-mode]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  }

  captureFrame() {
    try {
      const dataUrl = this.renderer.captureScreenshot();
      const a = document.createElement('a');
      a.download = `aetheria-cosmic-capture-${Date.now()}.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error('Screenshot capture error:', err);
    }
  }

  update(preset, boidCount) {
    this.currentPreset = preset;

    // Rolling FPS
    this.frameCount++;
    const now = performance.now();
    if (now >= this.lastTime + 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;

      const fpsEl = document.getElementById('telem-fps');
      if (fpsEl) fpsEl.textContent = `${this.fps} FPS`;
    }

    // Telemetry Updates
    const boidsEl = document.getElementById('telem-boids');
    if (boidsEl) boidsEl.textContent = `${(boidCount || 15000).toLocaleString()}`;

    const massEl = document.getElementById('telem-mass');
    if (massEl) massEl.textContent = `${Math.round(preset.blackHole.mass)} M☉`;

    const curvEl = document.getElementById('telem-curvature');
    if (curvEl) curvEl.textContent = `${(preset.blackHole.mass * 0.0042).toFixed(3)} c²/G`;

    // Render Audio Visualizer
    this._renderVisualizer();
  }

  _renderVisualizer() {
    if (!this.visCtx || !this.visCanvas) return;

    const { freq, time, energy } = this.audio.getVisualizerData();
    const w = this.visCanvas.width;
    const h = this.visCanvas.height;

    this.visCtx.clearRect(0, 0, w, h);

    if (!freq || !this.audio.isPlaying) {
      // Idle gentle sine wave line
      this.visCtx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      this.visCtx.lineWidth = 1.5;
      this.visCtx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h * 0.5 + Math.sin(x * 0.05 + performance.now() * 0.002) * 4.0;
        if (x === 0) this.visCtx.moveTo(x, y);
        else this.visCtx.lineTo(x, y);
      }
      this.visCtx.stroke();
      return;
    }

    // 1. Frequency Spectrum Bars
    const barCount = 32;
    const barWidth = (w / barCount) - 1.5;
    const step = Math.floor(freq.length / barCount);

    const grad = this.visCtx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
    grad.addColorStop(0.7, 'rgba(0, 255, 170, 0.7)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

    this.visCtx.fillStyle = grad;

    for (let i = 0; i < barCount; i++) {
      const val = freq[i * step] / 255.0;
      const barHeight = val * h * 0.85;
      const x = i * (barWidth + 1.5);
      const y = h - barHeight;
      this.visCtx.fillRect(x, y, barWidth, barHeight);
    }

    // 2. Oscilloscope Waveform Overlay
    this.visCtx.strokeStyle = '#ffffff';
    this.visCtx.lineWidth = 1.8;
    this.visCtx.beginPath();
    const sliceWidth = w / time.length;
    for (let i = 0; i < time.length; i++) {
      const v = time[i] / 128.0;
      const y = (v * h) / 2;
      const x = i * sliceWidth;
      if (i === 0) this.visCtx.moveTo(x, y);
      else this.visCtx.lineTo(x, y);
    }
    this.visCtx.stroke();
  }
}
