/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Game from "../core/game.js";
import Vec2 from "../core/utils/vec2.js";
import { POINT_LIGHT, BLACK_AND_WHITE, SEPIA, setSepiaFactor, setPointLights } from "../core/webgl/shaders.js";

const canvas = document.getElementById("game");

const files = ["tile0.png", "tile1.png", "tile2.png", "tile3.png", "tile4.png", "tile5.png", "tile6.png", "tile7.png", "tile8.png", "tile9.png", "tile10.png", "tile11.png", "tile12.png", "tile13.png", "tile14.png", "tile15.png", "tile16.png", "tile17.png", "tile18.png", "tile19.png", "tile20.png"];
const entities = [], n = 1500;

let font, sepia = 0, lights = [];

const game = new Game(canvas, {
    load: () => {
        console.log("load");

        for (let file of files) {
            game.resourceManager.loadTexture(file, "./resources/data/images/test/" + file);
        }
        game.resourceManager.loadFont("font", "./resources/data/fonts/font.json");

    },
    create: () => {
        console.log("create");

        // game.camera.spriteRenderer.setShader(SEPIA);
        game.camera.spriteRenderer.setShader(POINT_LIGHT);
        
        game.camera.zoom = 1;
        game.camera.update();
        for (let i = 0; i < n; ++i) {
            entities.push({
                position: new Vec2(
                    Math.random() * game.camera.bounds.width - game.camera.bounds.width * 0.5, 
                    Math.random() * game.camera.bounds.height - game.camera.bounds.height * 0.5
                ),
                direction: new Vec2(Math.random() - 0.5, Math.random() - 0.5).nor(),
                texture: game.resourceManager.get(files[Math.floor(Math.random() * files.length)]),
                speed: Math.random() * 5 + 1,
            });
        }
        font = game.resourceManager.get("font");

        for (let i = 0; i < 16; ++i) {
            lights.push({
                position: new Vec2(
                    Math.random() * game.camera.bounds.width - game.camera.bounds.width * 0.5, 
                    Math.random() * game.camera.bounds.height - game.camera.bounds.height * 0.5
                ),
                color: [Math.random(), Math.random(), Math.random()],
                direction: new Vec2(Math.random() - 0.5, Math.random() - 0.5).nor(),
                speed: Math.random() * 5 + 1,
                radius: (Math.random() * 100 + 50),
            });
        }

    },
    update: () => {

        const moveEntity = (entity) => {
            entity.position.addScl(entity.direction, entity.speed);

            if (entity.position.x < game.camera.bounds.x1) {
                entity.position.x = game.camera.bounds.x1;
                entity.direction.x = -entity.direction.x;
            } else if (entity.position.x > game.camera.bounds.x2) {
                entity.position.x = game.camera.bounds.x2;
                entity.direction.x = -entity.direction.x;
            }
            if (entity.position.y < game.camera.bounds.y1) {
                entity.position.y = game.camera.bounds.y1;
                entity.direction.y = -entity.direction.y;
            } else if (entity.position.y > game.camera.bounds.y2) {
                entity.position.y = game.camera.bounds.y2;
                entity.direction.y = -entity.direction.y;
            }
        }

        // move entities
        for (const entity of entities) {
            moveEntity(entity);
        }

        for (const light of lights) {
            moveEntity(light);
        }

    },
    render: () => {

        const camera = game.camera;
        camera.clearScreen();
        
        camera.update();
        camera.spriteRenderer.projectionMatrix = camera.combined;
        camera.spriteRenderer.begin(camera);
        game.camera.spriteRenderer.ambientColor = [0.1, 0.1, 0.1];
        setPointLights(game.camera.spriteRenderer, lights);

        for (const entity of entities) {
            camera.spriteRenderer.draw({
                glTexture: entity.texture.glTexture,
                uv: entity.texture.uv,
                x: entity.position.x, 
                y: entity.position.y,
                width: entity.texture.data.width, 
                height: entity.texture.data.height,
                originX: entity.texture.data.width * 0.5,
                originY: entity.texture.data.height * 0.5,
            });
        }

        camera.spriteRenderer.flush();

        game.camera.spriteRenderer.ambientColor = [1, 1, 1];
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
            text: "Entities: " + entities.length,
            x: -camera.bounds.width * 0.5 + 10,
            y: -camera.bounds.height * 0.5 + 25,
            color: 0xFFFFFFFF, shadowEnabled: true,
        });
        camera.spriteRenderer.flush();

    }
});

game.start();