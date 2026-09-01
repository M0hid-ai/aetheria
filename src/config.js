// AETHERIA - Configuration & Cosmological Presets

export const PRESETS = {
  gargantua: {
    id: 'gargantua',
    name: 'Gargantua Singularity',
    tagline: 'Supermassive Kerr Singularity',
    description: 'Relativistic rotating black hole with Doppler-boosted accretion disk, photon sphere, and orbital star clusters.',
    colors: {
      primary: '#ffaa33',
      secondary: '#ff4400',
      accent: '#ffe6aa',
      ambient: '#1a0800',
      jet: '#88ccff',
      boids: '#ffcc66'
    },
    blackHole: {
      mass: 2200,
      horizonRadius: 5.5,
      accretionInner: 7.0,
      accretionOuter: 32.0,
      spin: 0.94,
      jetIntensity: 1.2
    },
    boids: {
      count: 12000,
      maxSpeed: 1.6,
      maxForce: 0.08,
      separationDist: 2.2,
      neighborDist: 6.5,
      flashFrequency: 0.8
    },
    audio: {
      rootFreq: 73.42, // D2
      scale: [0, 3, 7, 10, 14, 17], // D minor 9th
      tempo: 65,
      timbre: 'deep-space'
    }
  },

  abyss: {
    id: 'abyss',
    name: 'Bioluminescent Abyss',
    tagline: 'Alien Ecosystem of the Cosmic Deep',
    description: 'Deep-void bioluminescent organisms executing synchronous pulse flashes, schooling away from serpentine leviathans.',
    colors: {
      primary: '#00ffcc',
      secondary: '#0066ff',
      accent: '#aaffff',
      ambient: '#000f1a',
      jet: '#00ffaa',
      boids: '#22ffcc'
    },
    blackHole: {
      mass: 800,
      horizonRadius: 3.5,
      accretionInner: 5.0,
      accretionOuter: 18.0,
      spin: 0.4,
      jetIntensity: 0.4
    },
    boids: {
      count: 16000,
      maxSpeed: 2.2,
      maxForce: 0.12,
      separationDist: 1.8,
      neighborDist: 5.5,
      flashFrequency: 1.5
    },
    audio: {
      rootFreq: 92.50, // F#2
      scale: [0, 2, 3, 5, 7, 9, 10], // F# Dorian
      tempo: 80,
      timbre: 'ethereal'
    }
  },

  cybergrid: {
    id: 'cybergrid',
    name: 'Cyber-Grid Singularity',
    tagline: 'Audio-Reactive Neon Matrix',
    description: 'Hyper-dimensional tesseract grid with relativistic particle waves, pulsing laser lattices, and synthwave harmonics.',
    colors: {
      primary: '#ff007f',
      secondary: '#00f0ff',
      accent: '#ffff00',
      ambient: '#120024',
      jet: '#ff00aa',
      boids: '#00ffff'
    },
    blackHole: {
      mass: 1500,
      horizonRadius: 4.5,
      accretionInner: 6.0,
      accretionOuter: 26.0,
      spin: 0.85,
      jetIntensity: 1.8
    },
    boids: {
      count: 14000,
      maxSpeed: 2.8,
      maxForce: 0.15,
      separationDist: 2.0,
      neighborDist: 7.0,
      flashFrequency: 2.2
    },
    audio: {
      rootFreq: 110.0, // A2
      scale: [0, 3, 7, 10, 12, 15], // A minor pentatonic / synth
      tempo: 110,
      timbre: 'synthwave'
    }
  },

  genesis: {
    id: 'genesis',
    name: 'Supernova Genesis',
    tagline: 'Stellar Collapse & Nebular Birth',
    description: 'A stellar core collapse propagating spacetime shockwaves, condensing gaseous cosmic matter into proto-stellar disks.',
    colors: {
      primary: '#4488ff',
      secondary: '#aa33ff',
      accent: '#ffffff',
      ambient: '#08001a',
      jet: '#ffffff',
      boids: '#aaccff'
    },
    blackHole: {
      mass: 1900,
      horizonRadius: 5.0,
      accretionInner: 6.5,
      accretionOuter: 36.0,
      spin: 0.7,
      jetIntensity: 1.0
    },
    boids: {
      count: 15000,
      maxSpeed: 1.9,
      maxForce: 0.1,
      separationDist: 2.5,
      neighborDist: 8.0,
      flashFrequency: 1.1
    },
    audio: {
      rootFreq: 65.41, // C2
      scale: [0, 4, 7, 11, 14, 18], // C Lydian majestic
      tempo: 72,
      timbre: 'sublime'
    }
  }
};

export const SIM_DEFAULTS = {
  timeScale: 1.0,
  bloomIntensity: 1.4,
  gravityStrength: 1.0,
  audioVolume: 0.6,
  cameraMode: 'orbit', // 'orbit', 'fpv', 'cinematic'
  antimatterForce: 350.0,
  gravityWellForce: 250.0
};
