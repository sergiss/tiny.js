/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Game from "../core/game.js";
import Animation from "../core/utils/animation.js";

const canvas = document.getElementById("game");

let font, animation;

const game = new Game(canvas, {
    load: () => {
        console.log("load");
        game.resourceManager.loadFont("font", "./resources/data/fonts/font.json");
        game.resourceManager.loadTexture("grant", "./resources/data/images/spritesheet_grant.png");
    },
    create: () => {
        console.log("create");

        game.camera.zoom = 1.5;
        game.camera.update();

        font = game.resourceManager.get("font");

        animation = new Animation(game.resourceManager.get("grant"), 12, 6)
            .create("run", 0, 25, { frameTime: 0.03 })
            .create("jump", 30, 63, { frameTime: 0.03 })
            .play("run");

    },
    update: () => {
        const camera = game.camera;
        camera.update

        if (game.input.obtain("Space").justPressed 
         || game.input.obtain(0).justPressed) {
            animation.play("jump", () => {
                animation.play("run");
            });
        }

        animation.update();

    },
    render: () => {

        const camera = game.camera;
        camera.clearScreen();

        camera.update();
        camera.spriteRenderer.projectionMatrix = camera.combined;
        camera.spriteRenderer.begin(camera);
        animation.render(camera, 0, 0);
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

        camera.spriteRenderer.flush();

    }
});

game.start();