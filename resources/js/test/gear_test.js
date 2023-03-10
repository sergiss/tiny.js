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
import { rndBGR } from "../core/utils/utils.js";
import Vec2 from "../core/utils/vec2.js";

const canvas = document.getElementById("game");

let font;

let world, gear1, gear2, gear3;

const data = "[[{\"x\":-168,\"y\":-32},{\"x\":-152,\"y\":-32},{\"x\":-152,\"y\":32},{\"x\":-168,\"y\":32}],[{\"x\":-152,\"y\":16},{\"x\":-136,\"y\":32},{\"x\":-152,\"y\":32}],[{\"x\":-152,\"y\":-32},{\"x\":-136,\"y\":-32},{\"x\":-152,\"y\":-16}],[{\"x\":-168,\"y\":32},{\"x\":-168,\"y\":48},{\"x\":-136,\"y\":48},{\"x\":-136,\"y\":32}],[{\"x\":-136,\"y\":32},{\"x\":8,\"y\":24},{\"x\":8,\"y\":48},{\"x\":-136,\"y\":48}],[{\"x\":8,\"y\":-16},{\"x\":-8,\"y\":-16},{\"x\":-8,\"y\":0},{\"x\":8,\"y\":0}],[{\"x\":-8,\"y\":-16},{\"x\":-120,\"y\":-8},{\"x\":-120,\"y\":8},{\"x\":-8,\"y\":0}],[{\"x\":-8,\"y\":-16},{\"x\":8,\"y\":-32},{\"x\":8,\"y\":-16}],[{\"x\":-8,\"y\":-80},{\"x\":8,\"y\":-64},{\"x\":8,\"y\":-80}],[{\"x\":8,\"y\":-80},{\"x\":24,\"y\":-80},{\"x\":24,\"y\":0},{\"x\":8,\"y\":0}],[{\"x\":-24,\"y\":-40},{\"x\":-136,\"y\":-48},{\"x\":-136,\"y\":-64},{\"x\":-24,\"y\":-56}],[{\"x\":-168,\"y\":-64},{\"x\":-136,\"y\":-64},{\"x\":-136,\"y\":-32},{\"x\":-168,\"y\":-32}],[{\"x\":-168,\"y\":-64},{\"x\":-152,\"y\":-64},{\"x\":-152,\"y\":-128},{\"x\":-168,\"y\":-128}],[{\"x\":-152,\"y\":-80},{\"x\":-136,\"y\":-64},{\"x\":-152,\"y\":-64}],[{\"x\":-152,\"y\":-112},{\"x\":-136,\"y\":-128},{\"x\":-152,\"y\":-128}],[{\"x\":-120,\"y\":-88},{\"x\":-120,\"y\":-104},{\"x\":-8,\"y\":-112},{\"x\":-8,\"y\":-96}],[{\"x\":48,\"y\":24},{\"x\":48,\"y\":48},{\"x\":8,\"y\":48},{\"x\":8,\"y\":24}],[{\"x\":64,\"y\":-144},{\"x\":64,\"y\":-128},{\"x\":-168,\"y\":-128},{\"x\":-168,\"y\":-144}],[{\"x\":48,\"y\":48},{\"x\":64,\"y\":48},{\"x\":64,\"y\":-128},{\"x\":48,\"y\":-128}],[{\"x\":32,\"y\":24},{\"x\":48,\"y\":8},{\"x\":48,\"y\":24}],[{\"x\":-8,\"y\":-112},{\"x\":16,\"y\":-112},{\"x\":24,\"y\":-104},{\"x\":24,\"y\":-80},{\"x\":-8,\"y\":-80}]]";

const game = new Game(canvas, {
    load: () => {
        console.log("load");
        game.resourceManager.loadFont("font", "./resources/data/fonts/font.json");
    },
    create: () => {
        console.log("create");

        font = game.resourceManager.get('font');

        game.camera.zoom = 3;
        game.camera.update();

        world = new World(new Vec2(0, 0.098));

        const addPolygon = (vertices) => {
            const polygon = new Polygon(vertices);
            const body = new Body(polygon);
            body.setMass(0);
            world.add(body);
        }

        let min = new Vec2(Number.MAX_VALUE);
        let max = new Vec2(Number.MIN_VALUE);

        for (let vertices of JSON.parse(data)) {
            for (let i = 0; i < vertices.length; i++) {
                vertices[i] = new Vec2(vertices[i].x, vertices[i].y);
                min.min(vertices[i]);
                max.max(vertices[i]);
            }
            addPolygon(vertices);
        }

        world.quadtree.aabb.min.set(min);
        world.quadtree.aabb.max.set(max);
        
        gear1 = new Body(ComplexShape.createGear({ radius: 20, teeth: 5 })).setMass(0);
        gear1.position.set(-120, 0);
        gear1.static = false;
        world.add(gear1);

        gear2 = new Body(ComplexShape.createGear({ radius: 20, teeth: 5 })).setMass(0);
        gear2.position.set(-24, -48);
        gear2.static = false;
        world.add(gear2);

        gear3 = new Body(ComplexShape.createGear({ radius: 20, teeth: 5 })).setMass(0);
        gear3.position.set(-120, -96);
        gear3.static = false;
        world.add(gear3);

    },
    update: () => {

        const n = world.bodies.length;
        if (n < 100 && Math.random() < 0.1) {
            const body = new Body(n % 2 == 0 ? new Circle(5) : Polygon.createRandom({ radius: 6 }));
            body.shape.color = rndBGR();
            body.position.set(35, -100);
            world.add(body);
        }

        gear1.rotation += 0.025;
        gear2.rotation -= 0.025;
        gear3.rotation += 0.025;

        // Remove bodies that are too far away
        for (let body of world.bodies) {
            if (body.mass !== 0 && body.position.len2(0, 0) > 9999999) {
                world.remove(body);
            }
        }

        // Update physics
        world.update(2);

        if (world.bodies.length > 24) game.camera.position.lerp(world.bodies[24].position, 0.01);

    },
    render: () => {

        const camera = game.camera;
        camera.clearScreen();

        camera.update();

        camera.shapeRenderer.projectionMatrix = camera.combined;
        camera.shapeRenderer.begin(camera);
        world.debug(camera);
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