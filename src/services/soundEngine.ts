// Ambient audio synthesizer using Web Audio API for mindfulness sessions

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  // Play a warm Tibetan singing bowl / chime
  public playSingingBowl(pitch: number = 261.63) { // Middle C or D
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const fundamental = pitch;
      const partials = [1, 2.76, 5.4, 8.93];
      const gains = [0.4, 0.2, 0.08, 0.03];

      partials.forEach((mult, i) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamental * mult, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(gains[i] * 0.35, now + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 4);
      });
    } catch {
      // Ignore audio failure gracefully
    }
  }

  // Play a soft breath cue (rising tone for inhale, settling tone for exhale)
  public playBreathCue(type: 'inhale' | 'exhale' | 'hold' | 'settle') {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';

      if (type === 'inhale') {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 1.2);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.12, now + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      } else if (type === 'exhale') {
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 1.5);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.12, now + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      } else if (type === 'hold') {
        osc.frequency.setValueAtTime(277.18, now);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      } else {
        osc.frequency.setValueAtTime(440, now);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
      }

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.5);
    } catch {
      // Graceful fallback
    }
  }

  // Play gentle celebratory completion chord
  public playCompletionFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playSingingBowl(freq);
        }, idx * 180);
      });
    } catch {
      // Graceful fallback
    }
  }
}

export const soundEngine = new SoundEngine();
