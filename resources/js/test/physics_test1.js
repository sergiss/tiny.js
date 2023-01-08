/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Game from "../core/game.js";
import Body from "../core/physics/body.js";
import Circle from "../core/physics/circle.js";
import Polygon from "../core/physics/polygon.js";
import World from "../core/physics/world.js";
import Vec2 from "../core/utils/vec2.js";

const canvas = document.getElementById("game");

const files = ["tile0.png", "tile1.png", "tile2.png", "tile3.png", "tile4.png", "tile5.png", "tile6.png", "tile7.png", "tile8.png", "tile9.png", "tile10.png", "tile11.png", "tile12.png", "tile13.png", "tile14.png", "tile15.png", "tile16.png", "tile17.png", "tile18.png", "tile19.png", "tile20.png"];
const n = 200;
let world;
let addRndShape;
let font;

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
        
        game.camera.zoom = 1;
        game.camera.update();

        world = new World(new Vec2(0, 0.098 * 2));
        world.quadtree.aabb.min.set(-game.camera.bounds.width * 0.5,-game.camera.bounds.height * 0.5);
        world.quadtree.aabb.max.set( game.camera.bounds.width * 0.5, game.camera.bounds.height * 0.5);
        let shape, body;
        for (let i = 0; i < n; ++i) {
            // shape = new Circle(16);
            shape = Polygon.createBox(32, 32);
            body = new Body(shape);
            body.position.set(Math.random() * game.camera.bounds.width - game.camera.bounds.width * 0.5, Math.random() * game.camera.bounds.height - game.camera.bounds.height * 0.5);
            body.texture = game.resourceManager.get(files[Math.floor(Math.random() * files.length)]);
            world.add(body);
        }

        shape = Polygon.createBox(32, game.camera.bounds.height);
        body = new Body(shape, new Vec2(-game.camera.bounds.width * 0.5, 0)).setMass(0);
        world.add(body);

        shape = Polygon.createBox(32, game.camera.bounds.height);
        body = new Body(shape, new Vec2(game.camera.bounds.width * 0.5, 0)).setMass(0);
        world.add(body);

        shape = Polygon.createBox(game.camera.bounds.width, 32);
        body = new Body(shape, new Vec2(0, -game.camera.bounds.height * 0.5)).setMass(0);
        world.add(body);

        shape = Polygon.createBox(game.camera.bounds.width, 32);
        body = new Body(shape, new Vec2(0, game.camera.bounds.height * 0.5)).setMass(0);
        world.add(body);

        font = game.resourceManager.get("font");

        addRndShape = (x, y) => {
            if (world.bodies.length % 2 == 0) shape = Polygon.createRandom({radius: Math.random() * 32 + 4});
            else shape = new Circle(Math.random() * 16 + 4);
            world.add(
                new Body(shape, new Vec2( x, y )).setRotation(Math.random() * Math.PI * 2)
            );
        }

    },
    update: () => {

        const camera = game.camera;
        camera.update();

        let tmp = new Vec2(game.input.mousePosition).div(game.camera.zoom).sub(game.camera.bounds.width * 0.5, game.camera.bounds.height * 0.5).add(game.camera.position);
        if (game.input.obtain(0).justPressed) {
            addRndShape(tmp.x, tmp.y);
        }

        world.update(2);

    },
    render: () => {

        const camera = game.camera;
        camera.clearScreen();

        camera.spriteRenderer.projectionMatrix = camera.combined;
        camera.spriteRenderer.begin(camera);
        for (let body of world.bodies) {
            if (!body.texture) continue;
            camera.spriteRenderer.draw({
                glTexture: body.texture.glTexture,
                uv: body.texture.uv,
                x: body.position.x,
                y: body.position.y,
                width: body.texture.data.width,
                height: body.texture.data.height,
                originX: body.texture.data.width * 0.5,
                originY: body.texture.data.height * 0.5,
                rotation: body.rotation,
            });
        }
        camera.spriteRenderer.flush();
    
        camera.shapeRenderer.projectionMatrix = camera.combined;
        camera.shapeRenderer.begin(camera);
        world.debug(camera);
        camera.shapeRenderer.drawCircle({
            x: game.input.mousePosition.x / game.camera.zoom - game.camera.bounds.width * 0.5 + game.camera.position.x,
            y: game.input.mousePosition.y / game.camera.zoom - game.camera.bounds.height * 0.5 + game.camera.position.y,
            radius: 2,
        });
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

        font.render({
            renderer: camera.spriteRenderer,
            text: "Bodies: " + world.bodies.length,
            x: -camera.bounds.width * 0.5 + 10,
            y: -camera.bounds.height * 0.5 + 25,
            color: 0xFFFFFFFF, shadowEnabled: true,
        });
        camera.spriteRenderer.flush();

    }
});

game.start();