export default class SFXNode {
  audioContext: AudioContext;
  buffer: AudioBuffer;
  loaded: boolean;
  audioLink: string;
  connectedTo: AudioNode;
  onLoad: Promise<AudioBuffer>;

  constructor(audioContext: AudioContext, audioLink: string) {
    this.audioContext = audioContext;
    this.loaded = false;

    this.audioLink = audioLink;
    this.connectedTo = audioContext.destination;

    //I would make auto-loading optional but i have zero idea how
    this.onLoad = this.load();
  }

  play(offset: number, connectTo?: AudioNode) {
    if (!this.buffer) throw Error("Sound effect is not loaded!");
    const node = this.audioContext.createBufferSource();
    node.buffer = this.buffer;
    node.connect(connectTo ?? this.connectedTo);
    node.start(offset / 1000 + this.audioContext.currentTime);
  }

  connect(node: AudioNode) {
    if (!node) throw Error(`Cannot connect SFXNode to nothing!`);
    this.connectedTo = node;

    return this;
  }

  async load() {
    const audioBuffer = await fetch(this.audioLink)
      .then((r) => r.arrayBuffer())
      .then((b) => this.audioContext.decodeAudioData(b));

    this.buffer = audioBuffer;
    this.loaded = true;

    return audioBuffer;
  }
}
