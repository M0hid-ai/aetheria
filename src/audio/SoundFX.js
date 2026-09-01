// AETHERIA - Procedural Real-time Sound FX Synthesizer

export class SoundFX {
  constructor(audioEngine) {
    this.engine = audioEngine;
    this.warpOsc = null;
    this.warpGain = null;
  }

  get ctx() {
    return this.engine.ctx;
  }

  // Gravitational well pulse sound
  playGravityPulse(intensity = 1.0) {
    if (!this.ctx || !this.engine.isPlaying) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Frequency sweeps downward into sub-bass
    osc.frequency.setValueAtTime(160 * intensity, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.6);

    gain.gain.setValueAtTime(0.25 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    osc.connect(gain);
    gain.connect(this.engine.masterGain);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  // Antimatter repulsion shock sound
  playRepulsionWave() {
    if (!this.ctx || !this.engine.isPlaying) return;

    const now = this.ctx.currentTime;
    // White noise transient burst
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Highpass resonant filter for laser/antimatter character
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(6.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.engine.masterGain);

    noiseSource.start(now);
  }

  // Supernova Detonation: Titanic deep sub rumble + fiery cosmic crescendo
  playSupernova() {
    if (!this.ctx || !this.engine.isPlaying) return;

    const now = this.ctx.currentTime;

    // Sub-bass impact oscillator
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(24, now + 2.5);

    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

    subOsc.connect(subGain);
    subGain.connect(this.engine.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 3.0);

    // Cosmic explosion noise
    const bufferSize = this.ctx.sampleRate * 2.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.6));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(2500, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(120, now + 2.5);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.45, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.engine.masterGain);
    noise.start(now);

    // Cosmic shimmer bell
    const shimmer = this.ctx.createOscillator();
    const shimmerGain = this.ctx.createGain();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(1864, now + 0.1);
    shimmerGain.gain.setValueAtTime(0.001, now);
    shimmerGain.gain.linearRampToValueAtTime(0.12, now + 0.2);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    shimmer.connect(shimmerGain);
    shimmerGain.connect(this.engine.convolver);
    shimmer.start(now + 0.1);
    shimmer.stop(now + 2.2);
  }

  // Bioluminescent synchronized swarm flash chime
  playBoidChirp(frequency = 880) {
    if (!this.ctx || !this.engine.isPlaying) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.engine.convolver);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Continuous FPV warp drive sound
  setWarpThrust(thrustRatio) {
    if (!this.ctx || !this.engine.isPlaying) return;

    const now = this.ctx.currentTime;

    if (thrustRatio > 0.05) {
      if (!this.warpOsc) {
        this.warpOsc = this.ctx.createOscillator();
        this.warpGain = this.ctx.createGain();
        this.warpOsc.type = 'triangle';
        this.warpOsc.frequency.setValueAtTime(60, now);
        this.warpGain.gain.setValueAtTime(0.001, now);

        this.warpOsc.connect(this.warpGain);
        this.warpGain.connect(this.engine.masterGain);
        this.warpOsc.start(now);
      }
      const targetFreq = 50 + thrustRatio * 180;
      const targetGain = Math.min(0.2, thrustRatio * 0.15);
      this.warpOsc.frequency.setTargetAtTime(targetFreq, now, 0.1);
      this.warpGain.gain.setTargetAtTime(targetGain, now, 0.1);
    } else if (this.warpGain) {
      this.warpGain.gain.setTargetAtTime(0.0001, now, 0.15);
    }
  }
}
