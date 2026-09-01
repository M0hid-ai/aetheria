# 🌌 AETHERIA: 3D Generative Cosmic & Artificial Life Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![WebGL2](https://img.shields.io/badge/WebGL2-Hardware%20Accelerated-brightgreen)](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext)
[![Three.js](https://img.shields.io/badge/Three.js-r170-black)](https://threejs.org/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-Pure%20Procedural-magenta)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Vite](https://img.shields.io/badge/Vite-6.0-blueviolet)](https://vitejs.dev/)

> **AETHERIA** is a real-time browser-based universe simulation and generative audiovisual engine. It unites relativistic Kerr astrophysics, emergent artificial life swarms (boids), custom GLSL shaders, and a pure Web Audio API procedural synthesizer into an interactive 60+ FPS sci-fi experience.

---

## ⚡ Key Highlights & Systems

### 1. 🕳️ Relativistic Singularity & Accretion Disk
- **Custom GLSL Accretion Disk**: Implements relativistic Doppler beaming (matter moving toward the observer is boosted in brightness and blue-shifted, while receding matter is red-shifted and dimmer, following Einstein's General Relativity).
- **Gravitational Lensing Post-Processing**: Real-time screen-space light ray deflection around the Schwarzschild radius creating an Einstein ring and warping the celestial background.
- **Relativistic Polar Jets**: Dual helical particle streams accelerating outward from the magnetic poles with audio-reactive velocity and turbulence.

### 2. 🧬 Emergent Artificial Life (Bio-Cosmic Swarms)
- **15,000+ Autonomous Bioluminescent Organisms**: Real-time 3D flocking utilizing optimized Reynolds rules (cohesion, alignment, spatial separation) running via instanced hardware geometry.
- **Synchronous Bioluminescent Flash Waves**: Firefly phase synchronization (Kuramoto model) propagating glowing pulse waves through the swarms that trigger crystalline harmonic sound chimes.
- **Predator Leviathans**: Bioluminescent serpentine predators undulating through deep space, provoking evasive scatter maneuvers from nearby boids.

### 3. 🎹 Pure Procedural Web Audio Engine (Zero Sample Files)
- **Generative Ambient Space Pads**: Detuned polyphonic Sawtooth + Triangle oscillators feeding a resonant low-pass filter with slow sinusoidal LFO breathing sweeps.
- **Cosmic Reverb & Delay**: Algorithmic convolution reverb synthesized from mathematical impulse responses combined with stereo ping-pong feedback delay.
- **Interactive Sound FX**:
  - *Gravity Well Pulse*: Downward exponential pitch sweep with sub-bass compression.
  - *Antimatter Repulsion*: High-frequency bandpass noise burst.
  - *Supernova Detonation*: Thunderous sub-drop, roaring noise crescendo, and decaying shimmer.
  - *FPV Warp Thrust*: Continuous dynamic pitch-shifting engine drone.
- **Real-Time FFT Visualizer**: Live 60 FPS frequency spectrum and oscilloscope waveform rendered directly on the cybernetic glassmorphic HUD.

### 4. 🚀 3-Mode Camera & Flight Controller
- **🌐 Orbit View**: Smooth damped orbital controls (mouse rotate, wheel zoom, pan).
- **🚀 FPV Spaceship Flight**: Full 6-DOF spaceship pilot mode (WASD thrust, Space/C vertical, Q/E roll, Mouse look, and **Shift Hyperspace Boost** with dynamic FOV warp distortion).
- **🎬 Cinematic Director**: Autonomous procedural Bezier drone camera choreographing sweeping cinematic angles through the accretion disk and boid clusters.

---

## 🎮 Flight & Physics Controls Manual

| Control | Action |
| :--- | :--- |
| **Left-Click + Drag** | Spawn Gravitational Attractor (Pulls organisms and cosmic matter) |
| **Right-Click / Shift+Click** | Unleash Antimatter Repulsion Shock (Blasts matter outward) |
| **Spacebar** | Detonate Supernova & Spacetime Ripple Shockwave |
| **Keys 1 — 4** | Switch Cosmological Presets (Gargantua, Bio-Abyss, Cyber-Grid, Genesis) |
| **O / F / C** | Switch Camera Mode: **O**rbit, **F**PV Spaceship, **C**inematic Cam |
| **W / A / S / D** | (In FPV Mode) Forward Thruster / Strafe Left / Reverse / Strafe Right |
| **Space / C** | (In FPV Mode) Ascend / Descend Vertical Thrusters |
| **Shift** | (In FPV Mode) Hyperspace Boost Drive |
| **Q / E** | (In FPV Mode) Roll Left / Roll Right |
| **P** | Capture High-Resolution PNG Screenshot |
| **H / ?** | Toggle HUD Flight Manual |

---

## 🌌 Cosmological Presets

1. **Gargantua Singularity**: Supermassive rotating Kerr black hole with fiery gold Doppler accretion disk, relativistic polar jets, and orbital star clusters.
2. **Bioluminescent Abyss**: Alien deep-space ecosystem featuring 18,000 cyan/emerald organisms synchronizing pulse waves to evade predatory leviathans.
3. **Cyber-Grid Singularity**: Hot magenta and neon cyan synthwave matrix with laser lattices, relativistic particle waves, and retro-futuristic audio.
4. **Supernova Genesis**: Collapsing stellar core propagating spacetime shockwaves, condensing matter into proto-stellar nebular clouds.

---

## 🛠️ Quickstart & Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- Modern browser with WebGL2 and Web Audio API support (Chrome, Edge, Firefox, Brave, Safari)

### Installation & Local Run
```bash
# Clone repository
git clone https://github.com/M0hid-ai/aetheria.git
cd aetheria

# Install dependencies
npm install

# Start development server with hot-reload
npm run dev

# Build optimized production bundle
npm run build
```

---

## 📜 Technical Architecture

```
aetheria/
├── index.html                    # Glassmorphic HUD, WebGL canvas & telemetry layout
├── package.json                  # Dependencies & npm scripts
├── vite.config.js                # Bundler configuration
├── src/
│   ├── main.js                   # Master simulation orchestrator & loop
│   ├── config.js                 # Presets (Gargantua, Abyss, CyberGrid, Genesis)
│   ├── styles.css                # Glassmorphic cybernetic styling
│   ├── audio/
│   │   ├── AudioEngine.js        # Pure Web Audio procedural synth, delay, reverb
│   │   └── SoundFX.js            # Sub-drops, warp thrust, supernova, boid chimes
│   ├── core/
│   │   ├── Renderer.js           # WebGL2 Three.js renderer + UnrealBloom + Lensing
│   │   ├── CameraController.js   # Orbit, FPV Spaceship Flight, Cinematic drone
│   │   └── InputManager.js       # Raycasted force wells, keyboard shortcuts
│   ├── simulation/
│   │   ├── BlackHole.js          # Event horizon, accretion disk, photon ring, jets
│   │   ├── BoidSwarm.js          # Instanced 15,000 boids + Kuramoto flashing + predators
│   │   ├── ParticleSystem.js     # Deep starfield, nebula gas, supernova ejecta
│   │   └── PhysicsEngine.js      # Relativistic gravity, shockwaves, time dilation
│   ├── shaders/
│   │   ├── accretionDisk.glsl.js # Doppler beaming, FBM plasma turbulence
│   │   └── lensing.glsl.js       # Post-processing Einstein ring & shockwave ripples
│   └── ui/
│       └── HUD.js                # Live telemetry, FFT spectrum visualizer, controls
└── dist/                         # Production build
```

---

## 📄 License
MIT License. Created by [Mohid Fida](https://github.com/M0hid-ai).
