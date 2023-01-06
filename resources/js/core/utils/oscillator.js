export default class Oscillator {

    constructor(context) {
        this.context = context;
        this.gainNode = context.createGain();
        this.gainNode.connect(context.destination);
    }

    play({ frequency = 261.63, volume = 1 , time = 1, mute = false }) {
        this.stop();
        if (!mute && this.context.unlocked) {
            const oscillator = this.context.createOscillator();
            oscillator.frequency.value = frequency;
            this.gainNode.gain.value = volume;
            oscillator.connect(this.gainNode);
            oscillator.start();
            oscillator.stop(this.context.currentTime + time);
            this.oscillator = oscillator;
        }
    }

    stop() {
        if (this.oscillator) {
            this.oscillator.stop(0);
            this.oscillator.disconnect();
            this.oscillator = null;
        }
    }

}