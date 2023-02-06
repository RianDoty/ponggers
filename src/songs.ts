export class Song {
  startTime: number;
  whistleTime: number;
  audio: HTMLAudioElement;
  notes: number[];
  bpm: number

  constructor({
    whistle,
    notes,
    audio,
    bpm
  }: {
    whistle: number;
    notes: number[];
    audio: HTMLAudioElement;
    bpm: number
  }) {
    this.notes = notes;
    this.audio = audio;
    this.bpm = bpm
    this.whistleTime = this.beat(whistle);
    this.startTime = -99999999;
  }

  beat(n: number) {
    return (n * 60 * 1000) / this.bpm;
  }

  measure(n: number) {
    return (n * 4 * 60 * 1000) / this.bpm
  }

  start() {
    this.audio.play();
    this.startTime = Date.now() - this.audio.currentTime;
  }

  roundToBeat(n: number) {
    const beat = this.beat
    const offset = this.startTime % beat(1);
    return Math.floor((n - offset) / beat(1)) * beat(1) + offset;
  }
}

export const Rally1 = new Song({whistle: 2, notes})