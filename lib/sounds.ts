
class SoundManager {
  private sendSound: HTMLAudioElement | null = null;
  private receiveSound: HTMLAudioElement | null = null;
  private typingSound: HTMLAudioElement | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      // Create audio elements with data URIs for simple sounds
      this.sendSound = this.createSound(this.getSendSoundData());
      this.receiveSound = this.createSound(this.getReceiveSoundData());
      this.typingSound = this.createSound(this.getTypingSoundData());
    }
  }

  private createSound(dataUri: string): HTMLAudioElement {
    const audio = new Audio(dataUri);
    audio.volume = 0.3; // 30% volume by default
    return audio;
  }

  // Simple "pop" sound for sending messages
  private getSendSoundData(): string {
    // This is a simple beep encoded as base64 data URI
    // You can replace this with your own sound file
    return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKXh7bllHAU2jdXyvHMpBSh+zO/glEILEl+u5+ypVRMJRZzi8L9vIgUsgs/z2oo3CBxqvvDnm0oMAU6j4ex6ZRwIMI3W8bx0KgUof8zy3o1ABRNfr+frqlQUCUSb4u+/cSIELILP8tuKNwgcaL/w5ZtLDAFOo+HsemchBjCN1/G8dSoFKH/M8d6NPAUTXq/n66pUFAlEm+Lvv3EiBSyCz/Hbi'
  }

  // Simple "ding" sound for receiving messages
  private getReceiveSoundData(): string {
    return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA='
  }

  // Subtle typing sound
  private getTypingSoundData(): string {
    return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
  }

  public playSend(): void {
    if (this.enabled && this.sendSound) {
      this.sendSound.currentTime = 0;
      this.sendSound.play().catch(() => {
        // Ignore errors (e.g., if user hasn't interacted with page yet)
      });
    }
  }

  public playReceive(): void {
    if (this.enabled && this.receiveSound) {
      this.receiveSound.currentTime = 0;
      this.receiveSound.play().catch(() => {});
    }
  }

  public playTyping(): void {
    if (this.enabled && this.typingSound) {
      this.typingSound.currentTime = 0;
      this.typingSound.play().catch(() => {});
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public setVolume(volume: number): void {
    const vol = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    if (this.sendSound) this.sendSound.volume = vol;
    if (this.receiveSound) this.receiveSound.volume = vol;
    if (this.typingSound) this.typingSound.volume = vol;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();