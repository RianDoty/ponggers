import rally from "/sounds/rally.mp3";
import whistle from "/sounds/whistle.mp3";
import ballhit1 from "/sounds/ballhit1.mp3";
import ballhit2 from "/sounds/ballhit2.mp3";

export class SFX {
  audioContext: AudioContext;
  buffer: AudioBuffer;
  loaded: boolean;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.loaded = false;
  }

  setBuffer(buffer: AudioBuffer) {
    
  }

  play(offset: number, connectTo?: AudioNode) {
    if (!this.buffer) throw Error("Sound effect is not loaded!");
    const node = this.audioContext.createBufferSource();
    node.buffer = this.buffer;
    node.connect(connectTo ?? this.audioContext.destination);
    node.start(offset / 1000 + this.audioContext.currentTime);
  }
}

export class SFXLoader {
  audioContext: AudioContext;
  cache: Map<string, AudioBuffer>;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  load(audioLink: string) {
    const sfx = new SFX(this.audioContext)
    
    fetch(audioLink)
      .then(r => r.arrayBuffer())
      .then(b => this.audioContext.decodeAudioData(b))
      .then(audioBuffer => sfx.setBuffer(audioBuffer))
    
    return sfx
  }
}
