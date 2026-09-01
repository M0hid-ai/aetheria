// AETHERIA - Generative Procedural Audio Engine (Pure Web Audio API)

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isPlaying = false;
    this.masterGain = null;
    this.analyser = null;
    this.filter = null;
    this.delayNode = null;
    this.convolver = null;
    
    // Generative chord progression state
    this.activeVoices = [];
    this.chordTimer = null;
    this.currentPreset = null;
    this.chordStep = 0;

    // Real-time audio data buffers for visualizer
    this.freqData = null;
    this.timeData = null;
  }

  async init() {
    if (this.isInitialized) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master Output & Limiter
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    // Analyser Node for Real-time HUD Visualizer
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.85;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.frequencyBinCount);

    // Resonant Lowpass Space Filter
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(650, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    // Slow Filter LFO for breathing cosmic pads
    this.filterLFO = this.ctx.createOscillator();
    this.filterLFOGain = this.ctx.createGain();
    this.filterLFO.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    this.filterLFOGain.gain.setValueAtTime(350, this.ctx.currentTime);
    this.filterLFO.connect(this.filterLFOGain);
    this.filterLFOGain.connect(this.filter.frequency);
    this.filterLFO.start();

    // Stereo Delay Line
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.42, this.ctx.currentTime);
    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.45, this.ctx.currentTime);

    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);

    // Algorithmic Procedural Reverb (No external IR sample files needed!)
    this.convolver = this.ctx.createConvolver();
    this.convolver.buffer = this._generateImpulseResponse(3.5, 2.0);

    // Routing Graph:
    // Voices -> Filter -> MasterGain -> Analyser -> Destination
    //                   \-> DelayNode -> Convolver -> MasterGain
    this.filter.connect(this.masterGain);
    this.filter.connect(this.delayNode);
    this.delayNode.connect(this.convolver);
    this.convolver.connect(this.masterGain);

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.isInitialized = true;
  }

  // Generates smooth acoustic cosmic reverb decay
  _generateImpulseResponse(duration, decay) {
    const rate = this.ctx.sampleRate;
    const length = rate * duration;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const envelope = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * envelope;
      right[i] = (Math.random() * 2 - 1) * envelope;
    }
    return impulse;
  }

  async start(preset) {
    if (!this.isInitialized) {
      await this.init();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.currentPreset = preset;
    this.isPlaying = true;
    this._playNextChord();
  }

  stop() {
    this.isPlaying = false;
    if (this.chordTimer) {
      clearTimeout(this.chordTimer);
      this.chordTimer = null;
    }
    this._fadeVoices();
  }

  setVolume(vol) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  setPreset(preset) {
    this.currentPreset = preset;
    if (this.isPlaying) {
      this.chordStep = 0;
      this._playNextChord();
    }
  }

  _playNextChord() {
    if (!this.isPlaying || !this.currentPreset) return;

    this._fadeVoices();

    const root = this.currentPreset.audio.rootFreq;
    const scale = this.currentPreset.audio.scale;
    const progressions = [
      [0, 2, 4],       // Tonic
      [3, 5, 1],       // Subdominant
      [1, 3, 5],       // Supertonic
      [4, 0, 2, 5],    // Dominant 7th / Ambient
    ];

    const currentProg = progressions[this.chordStep % progressions.length];
    this.chordStep++;

    const now = this.ctx.currentTime;
    const chordDuration = (60 / this.currentPreset.audio.tempo) * 4.0; // 4 beats per chord

    // Generate lush multi-voice unison pad
    currentProg.forEach((intervalIdx, i) => {
      const semitone = scale[intervalIdx % scale.length] + (Math.floor(intervalIdx / scale.length) * 12);
      const freq = root * Math.pow(2, semitone / 12);

      // Create dual detuned voices for stereo width
      [-6, 6].forEach((detuneCents) => {
        const osc = this.ctx.createOscillator();
        const voiceGain = this.ctx.createGain();

        // Timbre selection
        if (this.currentPreset.audio.timbre === 'synthwave') {
          osc.type = 'sawtooth';
        } else if (this.currentPreset.audio.timbre === 'ethereal') {
          osc.type = 'sine';
        } else {
          osc.type = i === 0 ? 'triangle' : 'sawtooth';
        }

        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(detuneCents + (Math.random() * 4 - 2), now);

        // Soft ADSR envelope
        voiceGain.gain.setValueAtTime(0.0001, now);
        voiceGain.gain.exponentialRampToValueAtTime(0.08 / currentProg.length, now + 1.8);
        voiceGain.gain.setTargetAtTime(0.0001, now + chordDuration - 1.0, 1.2);

        osc.connect(voiceGain);
        voiceGain.connect(this.filter);

        osc.start(now);
        osc.stop(now + chordDuration + 2.0);

        this.activeVoices.push({ osc, gain: voiceGain, stopTime: now + chordDuration + 2.0 });
      });
    });

    // Clean up old voices
    this.activeVoices = this.activeVoices.filter(v => v.stopTime > now);

    // Schedule next chord loop
    this.chordTimer = setTimeout(() => {
      this._playNextChord();
    }, (chordDuration - 1.2) * 1000);
  }

  _fadeVoices() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.activeVoices.forEach(v => {
      try {
        v.gain.gain.cancelScheduledValues(now);
        v.gain.gain.setTargetAtTime(0.0001, now, 0.4);
      } catch (e) {}
    });
  }

  // Real-time Telemetry Data for HUD Oscilloscope & Spectrum
  getVisualizerData() {
    if (!this.analyser) {
      return { freq: null, time: null, energy: 0 };
    }
    this.analyser.getByteFrequencyData(this.freqData);
    this.analyser.getByteTimeDomainData(this.timeData);

    // Compute aggregate spectral energy
    let sum = 0;
    for (let i = 0; i < this.freqData.length; i++) {
      sum += this.freqData[i];
    }
    const energy = sum / (this.freqData.length * 255);

    return {
      freq: this.freqData,
      time: this.timeData,
      energy
    };
  }
}
