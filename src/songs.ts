import rally1 from "./rally1.json";

rally1.

type EventList = {type: string, length: number}[]
export class Song {
  startTime: number;
  whistleTime: number;
  audioLink: string;
  notes: number[];
  bpm: number;
  events: EventList
  constructor({
    length,
    events,
    bpm
  }: {
    bpm: number;
    length: number;
    events: EventList
  }, audioLink: string) {
    this.events = events;
    this.audioLink = audioLink
    this.bpm = bpm;
    this.whistleTime = this.beat(whistle);
    this.startTime = -99999999;
  }

  beat(n: number) {
    return (n * 60 * 1000) / this.bpm;
  }

  measure(n: number) {
    return (n * 4 * 60 * 1000) / this.bpm;
  }

  start() {
    this.audio.play();
    this.startTime = Date.now() - this.audio.currentTime;
  }

  roundToBeat(n: number) {
    const beat = this.beat;
    const offset = this.startTime % beat(1);
    return Math.floor((n - offset) / beat(1)) * beat(1) + offset;
  }
}

export const Rally1 = new Song(rally1);
