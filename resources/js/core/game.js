/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Camera from "./webgl/camera.js";
import ResourceManager from "./utils/resourceManager.js";
import InputManager from "./utils/inputManager.js";

export const STEP_TIME = 1 / 60;

export default class Game {

    constructor(canvas, listener) {

        this.camera = new Camera(canvas);

        this.listener = listener;
        
        this.loop = this.loop.bind(this);
        this.resourceManager = new ResourceManager();

        this.input = new InputManager(canvas);

    }

    loop(time) {

        if (this.running) {

            const diff = time - this.startTime;
            this.elapsedTime += diff;
            this.startTime = time;
            if (time - this.frameTime >= 1000) { // FPS
                this.frameTime = time;
                this.fps = this.frames;
                this.frames = 0;
            }
            this.frames++;
            this.dt = Math.min(1, diff / 1000); // Delta time

            this.accum += this.dt;
            while (this.accum >= STEP_TIME) {
                this.accum -= STEP_TIME;
                this.listener.update(STEP_TIME);
                this.input.update();
            }
            this.listener.render();
            
            requestAnimationFrame(this.loop);
        }

    }

    async start() {

        if (!this.running) {
            this.running = true;
            this.listener.load();

            await this.resourceManager.load(this.camera.context);

            this.listener.create();

            this.elapsedTime = 0;
            this.frameTime = 0;
            this.startTime = 0;
            this.fps = 0;
            this.frames = 0;
            this.accum = 0;

            requestAnimationFrame(this.loop);
        }

    }

    stop() {

        this.running = false;

    }

}