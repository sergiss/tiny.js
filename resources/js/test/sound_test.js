/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Game from "../core/game.js";
import Oscillator from "../core/utils/oscillator.js";

const canvas = document.getElementById("game");

let font, oscillator;

const game = new Game(canvas, {
    load: () => {
        console.log("load");
        game.resourceManager.loadFont("font", "./resources/data/fonts/font.json");
        game.resourceManager.loadSound("sound", "./resources/data/sounds/checkpoint.mp3");
    },
    create: () => {
        console.log("create");

        game.camera.zoom = 2;
        game.camera.update();

        font = game.resourceManager.get("font");

        oscillator = new Oscillator(game.audioContext);

    },
    update: () => {
        const camera = game.camera;
        camera.update

        const handleKey = (key, frequency) => {
            if (game.input.obtain(key).justPressed) {
                oscillator.play({ frequency, time: 1 });
            }
        }

        handleKey("KeyA", 261.63 ); // C
        handleKey("KeyW", 277.18 ); // C#
        handleKey("KeyS", 293.66 ); // D
        handleKey("KeyE", 311.13 ); // D#
        handleKey("KeyD", 329.63 ); // E
        handleKey("KeyF", 349.23 ); // F
        handleKey("KeyT", 369.99 ); // F#
        handleKey("KeyG", 392.00 ); // G
        handleKey("KeyY", 415.30 ); // G#
        handleKey("KeyH", 440.00 ); // A
        handleKey("KeyU", 466.16 ); // A#
        handleKey("KeyJ", 493.88 ); // B

        if (game.input.obtain(0).justPressed) {
            game.resourceManager.get("sound").play();
        }

    },
    render: () => {

        const camera = game.camera;
        camera.clearScreen();

        camera.update();
        camera.spriteRenderer.projectionMatrix = camera.combined;
        camera.spriteRenderer.begin(camera);
        
        camera.spriteRenderer.flush();

        camera.spriteRenderer.projectionMatrix = camera.projection;
        camera.spriteRenderer.begin(camera);
        font.render({
            renderer: camera.spriteRenderer,
            text: "FPS: " + game.fps,
            x: -camera.bounds.width * 0.5 + 10,
            y: -camera.bounds.height * 0.5 + 10,
            color: 0xFFFFFFFF, shadowEnabled: true,
        });

        font.render({
            renderer: camera.spriteRenderer,
            text: "Press A, W, S, E, D, F, T, G, Y, H, U, J' to play a note.",
            x: -camera.bounds.width * 0.5 + 10,
            y: -camera.bounds.height * 0.5 + 25,
            color: 0xFFFFFFFF, shadowEnabled: true,
        });

        font.render({
            renderer: camera.spriteRenderer,
            text: "Right click to play sound.",
            x: -camera.bounds.width * 0.5 + 10,
            y: -camera.bounds.height * 0.5 + 40,
            color: 0xFFFFFFFF, shadowEnabled: true,
        });

        camera.spriteRenderer.flush();

    }
});

game.start();