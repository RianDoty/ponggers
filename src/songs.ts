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
  audioContext: AudioContext;
  loaded: Promise<any>;

  constructor(
    audioContext: AudioContext,
    songData: SongData,
    audioLink: string
  ) {
    this.songData = songData;
    this.bpm = songData.bpm;

    this.audioLink = audioLink;
    this.audioContext = audioContext;

    //Make and connect audio
    this.audio = new Audio(audioLink);
    audioContext
      .createMediaElementSource(this.audio)
      .connect(audioContext.destination);

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

  /**Amount of ms in [n] quarter notes. */
  beat(n: number) {
    return (n * 60 * 1000) / this.bpm;
  }

  /**The current time of the song, in milliseconds. */
  get time() {
    return this.audio.currentTime * 1000;
  }

  /**Gets the amount of time (ms) of (n) measures in the current tempo (4 beats).*/
  measure(n: number) {
    return (n * 4 * 60 * 1000) / this.bpm;
  }

  start() {
    this.audio.play();
    this.startTime = Date.now() - this.audio.currentTime * 1000;
  }

  roundToBeat(n: number) {
    const beat = this.beat.bind(this);
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
