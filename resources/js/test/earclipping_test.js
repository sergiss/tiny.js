/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Game from "../core/game.js";
import Polygon from "../core/physics/polygon.js";
import { triangulate } from "../core/utils/earcut.js";
import { Random } from "../core/utils/utils.js";

const canvas = document.getElementById("game");

let font, polygon, triangles;

const game = new Game(canvas, {
    load: () => {
        console.log("load");
        game.resourceManager.loadFont("font", "./resources/data/fonts/font.json");
    },
    create: () => {
        console.log("create");

        game.camera.zoom = 3;
        game.camera.update();

        font = game.resourceManager.get("font");
        const shape = Polygon.createRandom({random: new Random(1983).random, numSides: 1000, radius: 100});
        // const shape = Polygon.createBox(100, 100);
        polygon = shape.computeWorldVertices();
        
        console.log(polygon);
        const start = Date.now();
        triangles = triangulate(polygon);
        console.log("Time: " + (Date.now() - start) + "ms");
        console.log(triangles);

    },
    update: () => {
        const camera = game.camera;
        camera.update();
    },
    render: () => {

        const camera = game.camera;
        camera.clearScreen();

        camera.update();
        camera.shapeRenderer.projectionMatrix = camera.combined;
        camera.shapeRenderer.begin(camera);

        camera.shapeRenderer.color = 0xFF0000FF;
        for (let i = 0; i < polygon.length; i ++) {
            const v1 = polygon[i];
            const v2 = polygon[(i + 1) % polygon.length];
            camera.shapeRenderer.drawLine({
                x1: v1.x, y1: v1.y, x2: v2.x, y2: v2.y, lineWidth: 2
            })
        }

        camera.shapeRenderer.color = 0xFFFF000;
        for (let i = 0; i < triangles.length; i++) {
            const [v1, v2, v3] = triangles[i];
            camera.shapeRenderer.drawTriangle(
                {x1: v1.x, y1: v1.y, x2: v2.x, y2: v2.y, x3: v3.x, y3: v3.y, lineWidth: 1}
            );
        }

        camera.shapeRenderer.flush();

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