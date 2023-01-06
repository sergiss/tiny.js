
import Loader from "./loader.js";

export default class Sound extends Loader {

  constructor() {
    super();
  }

  async load(src, manager) {
    this.context = manager.game.audioContext;
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    this.context.decodeAudioData(arrayBuffer, (buffer)=> {
      this.buffer = buffer;
    });
  }

  initialize() {}

  play(mute = false) {
    this.stop();
    if (!mute && this.context.unlocked) {
      this.source = this.context.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.connect(this.context.destination);
      this.source.start(0);
    }
   }

  stop() {
    if (this.source) { 
      this.source.stop(0);
      this.source.disconnect();
      this.source = null;
    }
  }

}
