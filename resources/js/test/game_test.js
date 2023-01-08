/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Game from "../core/game.js";
import Body from "../core/physics/body.js";
import Circle from "../core/physics/circle.js";
import ComplexShape from "../core/physics/complexShape.js";
import Polygon from "../core/physics/polygon.js";
import World from "../core/physics/world.js";
import Map from "../core/utils/map.js";
import Vec2 from "../core/utils/vec2.js";

const canvas = document.getElementById("game");

let font;
let world;
let addRndShape;
let player;

const game = new Game(canvas, {
    load: () => {
        console.log("load");
        game.resourceManager.loadFont("font", "./resources/data/fonts/font.json");
        // *** Map ***
        game.resourceManager.loadMap("map", "./resources/data/maps/test.json");

    },
    create: () => {
        console.log("create");

        font = game.resourceManager.get('font');

        game.camera.zoom = 3;
        game.camera.update();
        let shape;
        world = new World(new Vec2(0, 0.098 * 2));

        addRndShape = (x, y) => {
            if (world.bodies.length % 2 == 0) shape = Polygon.createRandom({radius: Math.random() * 2 + 4});
            else shape = new Circle(Math.random() * 2 + 4);
            world.add(
                new Body(shape, new Vec2( x, y )).setRotation(Math.random() * Math.PI * 2)
            );
        }
        const map = game.resourceManager.get('map');
        world.setMap(map);
        const size = map.getSize();
        game.camera.position.set(size.width * 0.5, size.height * 0.5);

        shape = Polygon.createBox(9, 20);
        let body = new Body(shape, new Vec2(80, 50)).setMass(1);
        world.add(body);
        player = body;
    },
    update: () => {

        // gearBody.rotation += 0.02;

        if (world.bodies.length < 200 && Math.random() < 0.25) addRndShape(Math.random() * world.map.getSize().width, 0);

        let tmp = new Vec2(game.input.mousePosition).div(game.camera.zoom).sub(game.camera.bounds.width * 0.5, game.camera.bounds.height * 0.5).add(game.camera.position);
        if (game.input.obtain(0).justPressed) {
            addRndShape(tmp.x, tmp.y);
        }

        // Respawn bodies that are too far away
        for (let body of world.bodies) {
            if (body.mass !== 0 && body.position.len2(0, 0) > 9999999) {
                body.position.set(Math.random() * world.map.getSize().width, 0);
                body.velocity.set(0, 0);
            }
        }

        // Move player
        if (game.input.obtain('ArrowLeft').pressed) player.force.x -= 0.05;
        else if (game.input.obtain('ArrowRight').pressed) player.force.x = 0.05;
        else player.velocity.x *= 0.85;
        if (game.input.obtain('Space').justPressed) player.force.y -= 4;

        game.camera.position.lerp(player.position, 0.05);

        world.update(2);
        // console.log(player.position)
      
    },
    render: () => {

        const camera = game.camera;
        camera.clearScreen();

        camera.update();
        camera.spriteRenderer.projectionMatrix = camera.combined;
        camera.spriteRenderer.begin(camera);
        game.resourceManager.get('map').render(camera, Map.GROUP_A);
        game.resourceManager.get('map').render(camera, Map.GROUP_B);
        camera.spriteRenderer.flush();

        camera.shapeRenderer.projectionMatrix = camera.combined;
        camera.shapeRenderer.begin(camera);
        world.debug(camera);
        camera.shapeRenderer.drawCircle({
            x: game.input.mousePosition.x / game.camera.zoom - game.camera.bounds.width  * 0.5 + game.camera.position.x,
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
            text: "Entities: " + world.bodies.length,
            x: -camera.bounds.width * 0.5 + 10,
            y: -camera.bounds.height * 0.5 + 25,
            color: 0xFFFFFFFF, shadowEnabled: true,
        });
        camera.spriteRenderer.flush();

    }
});

game.start();