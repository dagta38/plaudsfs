/**
 * Web Audio Engine for VibeSpot
 * Provides interactive, real synthesized modern music loops with rhythm, chords & melodies
 * Supports real-time playback speed modification (Sped up / Slowed + Reverb), volume, visualizer frequency data
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrackId: string | null = null;
  private synthType: string = 'kpop_dance';
  private bpm: number = 120;
  private speedFactor: number = 1.0;
  private volume: number = 0.8;
  private isMuted: boolean = false;

  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private timerId: number | null = null;

  private playbackStartTime: number = 0;
  private pausedAtOffset: number = 0;
  private durationSec: number = 25;

  private onTimeUpdateCallback: ((currentTime: number, progress: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  constructor() {
    // Lazy AudioContext initialization on user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setOnTimeUpdate(cb: (currentTime: number, progress: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public setOnEnded(cb: () => void) {
    this.onEndedCallback = cb;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(32);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public play(trackId: string, synthType: string, bpm: number, duration: number = 25, speed: number = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.currentTrackId === trackId && this.isPlaying) {
      return;
    }

    this.stop();

    this.currentTrackId = trackId;
    this.synthType = synthType;
    this.bpm = bpm;
    this.durationSec = duration;
    this.speedFactor = speed;
    this.isPlaying = true;
    this.playbackStartTime = this.ctx.currentTime - this.pausedAtOffset;

    this.startLoopScheduler();
  }

  public togglePlay(trackId: string, synthType: string, bpm: number, duration: number = 25, speed: number = 1.0): boolean {
    if (this.isPlaying && this.currentTrackId === trackId) {
      this.pause();
      return false;
    } else {
      this.play(trackId, synthType, bpm, duration, speed);
      return true;
    }
  }

  public pause() {
    if (!this.isPlaying) return;
    if (this.ctx) {
      this.pausedAtOffset = (this.ctx.currentTime - this.playbackStartTime) % this.durationSec;
    }
    this.isPlaying = false;
    this.clearLoopScheduler();
  }

  public stop() {
    this.isPlaying = false;
    this.pausedAtOffset = 0;
    this.clearLoopScheduler();
  }

  public seek(progressRatio: number) {
    this.pausedAtOffset = Math.max(0, Math.min(1, progressRatio)) * this.durationSec;
    if (this.ctx) {
      this.playbackStartTime = this.ctx.currentTime - this.pausedAtOffset;
    }
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.pausedAtOffset, progressRatio);
    }
  }

  public setSpeed(speed: number) {
    this.speedFactor = speed;
  }

  public setVolume(vol: number) {
    this.volume = vol;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private clearLoopScheduler() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private startLoopScheduler() {
    this.clearLoopScheduler();
    if (!this.ctx) return;

    let step = 0;
    const effectiveBpm = this.bpm * this.speedFactor;
    const stepDurationSec = 60 / effectiveBpm / 4; // 16th note step

    // Schedule immediately the first sound
    this.scheduleStep(step);
    step = (step + 1) % 64;

    this.timerId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;

      const elapsed = (this.ctx.currentTime - this.playbackStartTime) % this.durationSec;
      const progress = elapsed / this.durationSec;

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(elapsed, progress);
      }

      this.scheduleStep(step);
      step = (step + 1) % 64;
    }, stepDurationSec * 1000);
  }

  private scheduleStep(step: number) {
    if (!this.ctx || !this.masterGain) return;
    const time = this.ctx.currentTime + 0.02;

    switch (this.synthType) {
      case 'trap_808':
        this.playTrapStep(step, time);
        break;
      case 'kpop_dance':
        this.playKpopStep(step, time);
        break;
      case 'lofi_chill':
        this.playLofiStep(step, time);
        break;
      case 'indie_band':
        this.playRockStep(step, time);
        break;
      case 'hyperpop':
        this.playHyperpopStep(step, time);
        break;
      case 'rnb_smooth':
      default:
        this.playRnbStep(step, time);
        break;
    }
  }

  // --- SYNTHESIZER SOUND GENERATORS ---

  private playKick(time: number, is808: boolean = false) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = is808 ? 160 : 130;
    const endFreq = is808 ? 35 : 45;
    const duration = is808 ? 0.45 : 0.22;

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playSnareOrClap(time: number, isClap: boolean = false) {
    if (!this.ctx || !this.masterGain) return;

    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * (isClap ? 0.15 : 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = isClap ? 'bandpass' : 'highpass';
    filter.frequency.value = isClap ? 1200 : 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isClap ? 0.6 : 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (isClap ? 0.15 : 0.12));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.2);
  }

  private playHiHat(time: number, isOpen: boolean = false) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(8000 + Math.random() * 2000, time);

    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const dur = isOpen ? 0.18 : 0.04;
    gain.gain.setValueAtTime(isOpen ? 0.25 : 0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  private playTone(freq: number, time: number, dur: number, type: OscillatorType = 'sawtooth', gainVal: number = 0.2) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, time);
    filter.frequency.exponentialRampToValueAtTime(600, time + dur);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  // --- GENRE PATTERNS ---

  private playKpopStep(step: number, time: number) {
    // 4-on-the-floor kick with funky chords & bright synth
    if (step % 4 === 0) this.playKick(time);
    if (step % 8 === 4) this.playSnareOrClap(time, true);
    if (step % 2 === 1) this.playHiHat(time, step % 4 === 2);

    // Chord progression: F#m - D - A - E
    const chords = [
      [370, 440, 554], // F#m
      [293, 370, 440], // D
      [440, 554, 659], // A
      [330, 415, 493], // E
    ];
    const chordIdx = Math.floor(step / 16) % 4;
    const currentChord = chords[chordIdx];

    // Synced chords on offbeats
    if (step % 4 === 2) {
      currentChord.forEach(f => this.playTone(f, time, 0.18, 'sawtooth', 0.15));
    }

    // Melodic hook arpeggio
    if (step % 2 === 0) {
      const note = currentChord[Math.floor(step / 2) % currentChord.length] * 2;
      this.playTone(note, time, 0.08, 'triangle', 0.18);
    }
  }

  private playTrapStep(step: number, time: number) {
    // Heavy 808 & rapid rolling hi-hats
    if (step === 0 || step === 10 || step === 24 || step === 36) {
      this.playKick(time, true);
    }
    if (step % 8 === 4) {
      this.playSnareOrClap(time, false);
    }
    // Trap rolling hats
    if (step % 2 === 0 || (step >= 12 && step <= 15) || (step >= 28 && step <= 31)) {
      this.playHiHat(time, step === 14 || step === 30);
    }

    // Dark minor synth stabs (Cm)
    if (step === 0 || step === 8 || step === 20 || step === 32) {
      [261.6, 311.1, 392.0].forEach(f => this.playTone(f, time, 0.25, 'sawtooth', 0.14));
    }
  }

  private playLofiStep(step: number, time: number) {
    // Relaxed boom-bap rhythm & warm electric piano
    if (step === 0 || step === 10 || step === 22) this.playKick(time);
    if (step % 8 === 4) this.playSnareOrClap(time, false);
    if (step % 2 === 1) this.playHiHat(time, false);

    // Warm Ab major 7 chords
    const lofiChords = [
      [207.6, 261.6, 311.1, 392.0], // Abmaj7
      [174.6, 220.0, 261.6, 329.6], // Fm7
      [233.0, 277.1, 349.2, 415.3], // Bbm7
      [155.5, 196.0, 233.0, 293.6], // Eb7
    ];
    const current = lofiChords[Math.floor(step / 16) % 4];
    if (step % 8 === 0) {
      current.forEach(f => this.playTone(f, time, 0.6, 'sine', 0.22));
    }
  }

  private playRockStep(step: number, time: number) {
    // Driving upbeat punk rock
    if (step % 4 === 0) this.playKick(time);
    if (step % 4 === 2) this.playSnareOrClap(time, false);
    this.playHiHat(time, step % 4 === 0);

    // Power chord guitar riffs (E5, C#5, A5, B5)
    const roots = [164.8, 138.5, 110.0, 123.4];
    const root = roots[Math.floor(step / 16) % 4];
    if (step % 2 === 0) {
      this.playTone(root, time, 0.12, 'sawtooth', 0.25);
      this.playTone(root * 1.5, time, 0.12, 'sawtooth', 0.2);
    }
  }

  private playHyperpopStep(step: number, time: number) {
    // Glitchy breakbeat and fast chiptune leads
    if (step % 4 === 0 || step === 14 || step === 30) this.playKick(time);
    if (step % 8 === 4 || step === 15) this.playSnareOrClap(time, true);
    this.playHiHat(time, step % 2 === 1);

    // High energy candy arp
    const scale = [440, 493.8, 554.3, 659.2, 739.9, 880];
    const note = scale[step % scale.length];
    this.playTone(note, time, 0.06, 'square', 0.12);
  }

  private playRnbStep(step: number, time: number) {
    // Smooth neo-soul beat & groovy bassline
    if (step === 0 || step === 6 || step === 18) this.playKick(time);
    if (step % 8 === 4) this.playSnareOrClap(time, true);
    if (step % 2 === 1) this.playHiHat(time, step % 8 === 6);

    // Gm9 chord
    if (step % 8 === 0) {
      [196, 233, 293, 349, 440].forEach(f => this.playTone(f, time, 0.45, 'triangle', 0.18));
    }
  }
}

// Global audio engine singleton
export const audioEngine = new AudioEngine();
