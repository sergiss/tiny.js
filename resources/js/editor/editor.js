/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Body from "../core/physics/body.js";
import Polygon from "../core/physics/polygon.js";
import World from "../core/physics/world.js";
import Vec2 from "../core/utils/vec2.js";
import PolygonTool from "./polygonTool.js";

export default class Editor {

    constructor(game) {
        this.game = game;

        this.world = new World(new Vec2(0, 0.098));
        this.currentTool = new PolygonTool(this);

        this.gridStep = 8;
    }

    initialize() {

        // Load from local storage
        const data = localStorage.getItem('data');
        if (data) {
            for (let vertices of JSON.parse(data)) {
                for (let i = 0; i < vertices.length; i++) {
                    vertices[i] = new Vec2(vertices[i].x, vertices[i].y);
                }
                try {
                    this.addPolygon(vertices);
                } catch (e) {
                    console.error(e);
                }
            }
        }

    }

    addPolygon(vertices) {
        const polygon = new Polygon(vertices);
        const body = new Body(polygon);
        body.setMass(0);
        this.world.add(body);
    }

    saveVertices() {
        // Save to local storage
        let data = [];
        for (let body of this.world.bodies) {
            if (body.shape.type == 1 && body.mass == 0) {
                body.update();
                data.push(body.shape.worldVertices);
            }
        }
        localStorage.setItem('data', JSON.stringify(data));
    }

    update() {

        this.game.camera.update();

        // Update tool
        if (this.currentTool) this.currentTool.update();

        // Remove bodies that are too far away
        for (let body of this.world.bodies) {
            if (body.mass !== 0 && body.position.len2(0, 0) > 9999999) {
                this.world.remove(body);
            }
        }

        // Update physics
        this.world.update(10);

    }

    getBodyAt(position) {
        return this.world.bodies.find(body => body.shape.contains(position));
    }

    getMousePosition() {
        const camera = this.game.camera;
        return new Vec2(this.game.input.mousePosition).div(camera.zoom).sub(camera.bounds.width * 0.5, camera.bounds.height * 0.5).add(camera.position);
    }

    render() {

        const camera = this.game.camera;
        camera.update();

        const mousePosition = this.getMousePosition();

        camera.shapeRenderer.projectionMatrix = camera.combined;
        camera.shapeRenderer.begin(camera);

        // Draw grid
        const gridStep = this.gridStep;
        const gridColor = 0xFF222222;
       
        const hw = camera.bounds.width * 0.5;
        const hh = camera.bounds.height * 0.5;
        const cameraPosition = camera.position;

        const x1 = camera.position.x - camera.position.x % gridStep - hw + hw % gridStep;
        const x2 = x1 + camera.bounds.width;

        for (let x = x1; x < x2; x += gridStep) {
            camera.shapeRenderer.drawLine({
                x1: x,
                y1: -hh + cameraPosition.y,
                x2: x,
                y2: hh + cameraPosition.y,
                c1: gridColor,
            });
        }

        const y1 = camera.position.y - camera.position.y % gridStep - hh + hh % gridStep;
        const y2 = y1 + camera.bounds.height;

        for (let y = y1; y < y2; y += gridStep) {
            camera.shapeRenderer.drawLine({
                x1: -hw + cameraPosition.x,
                y1: y,
                x2: hw + cameraPosition.x,
                y2: y,
                c1: gridColor,
            });
        }

        if (this.currentTool) this.currentTool.render(camera);

        // Draw mouse position
        camera.shapeRenderer.drawFillCircle({
            x: mousePosition.x,
            y: mousePosition.y,
            abgr: 0xFF0000FF,
            radius: 1,
        });

        // Draw center
        camera.shapeRenderer.drawFillCircle({
            x: 0,
            y: 0,
            abgr: 0xFFFF00FF,
            radius: 1,
        });

        this.world.debug(camera);
        camera.shapeRenderer.flush();

    }

}