type EventList = { type: string; length: number }[];
type Notes = number[];
type SFXList = { timestamp: number; SFXID: number }[];
interface SongData {
  bpm: number;
  length: number;
  events: EventList;
}

export class Song {
  startTime: number;
  songData: SongData;
  notes: Notes;
  sfx: SFXList;
  bpm: number;

  audioLink: string;
  audio: HTMLAudioElement;
  loaded: Promise<any>;

  constructor(songData: SongData, audioLink: string) {
    this.songData = songData;
    this.bpm = songData.bpm;

    this.audioLink = audioLink;
    this.audio = new Audio(audioLink);
    this.startTime = -99999999;

    this.loaded = new Promise((r) => {
      this.audio.oncanplaythrough = r;
    });

    const parseResults = this.parseEvents();
    this.sfx = parseResults.sfx;
    this.notes = parseResults.notes;
  }

  private parseEvents(): { notes: Notes; sfx: SFXList } {
    // Notes are defined as offsets from 0 in ms,
    // 0 being whatever time the song starts

    const songData = this.songData;
    const notesOut: Notes = [];
    const sfxOut: SFXList = [];

    const lengthInBeats = (songData.length / 60) * this.bpm;
    for (let i = 1; i < lengthInBeats / 4; i++) {
      notesOut.push(this.measure(i));
    }

    return { notes: notesOut, sfx: sfxOut };
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
    return Math.floor(n / beat(1)) * beat(1);
  }
}

export class SongLoader {
  audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  load(songData: SongData, audioLink: string) {
    const song = new Song(songData, audioLink);

    this.audioContext
      .createMediaElementSource(song.audio)
      .connect(this.audioContext.destination);

    return song;
  }
}
