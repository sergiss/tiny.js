/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Body from "../core/physics/body.js";
import Circle from "../core/physics/circle.js";
import Tool from "./tool.js";

export default class PolygonTool extends Tool {

    constructor(editor) {
        super(editor);
        this.polygon = [];
    }

    update() {
        const input = this.editor.game.input;

        const mousePosition = this.editor.getMousePosition();

        // Move camera
        if (input.obtain(1).pressed) {
            if (input.obtain(1).justPressed) {
                this.lastMousePosition = mousePosition;
            } else {
                const delta = mousePosition.sub(this.lastMousePosition);
                this.editor.game.camera.position.sub(delta);
            }
        }

        // Align to grid
        if (input.obtain('ShiftLeft').pressed) {
            const gridStep = this.editor.gridStep;
            mousePosition.x = Math.round(mousePosition.x / gridStep) * gridStep;
            mousePosition.y = Math.round(mousePosition.y / gridStep) * gridStep;
        }

        // Add vertex or move body
        if (input.obtain(0).pressed) { 

            if (input.obtain(0).justPressed) {

                if (this.currentBody) {
                    this.currentBody.shape.color = this.currentBody.shape.lastColor;
                    this.currentBody = null;
                }

                const body = this.editor.getBodyAt(mousePosition);
                if (body && body.mass == 0 && body.shape.type == 1) { 
                    // Select body
                    this.lastMousePosition = mousePosition;
                    this.currentBody = body;
                    this.currentBody.shape.lastColor = this.currentBody.shape.color;
                    this.currentBody.shape.color = 0xFFFFFF00;
                } else {
                    // Add vertex
                    this.addVertex(mousePosition);
                }

            } else if (this.currentBody) {
                // Move Body
                const delta = mousePosition.copy().sub(this.lastMousePosition);
                this.currentBody.position.add(delta);
                this.lastMousePosition = mousePosition;
            }

        }

        if (input.obtain('Delete').justPressed) {

            if (this.currentBody) {
                this.editor.world.remove(this.currentBody);
                this.currentBody = null;
            }

        }

        // Remove last vertex
        if (this.polygon.length) {
            if (input.obtain('Escape').justPressed) {
                this.polygon.pop();
            }
        }

        // Add random polygon
        //if (input.obtain(2).justPressed) {
        //    this.editor.world.add(new Body(Polygon.createRandom()).setPosition(this.editor.getMousePosition()));
        //}

        // Add ball
        if (input.obtain('KeyB').justPressed) {
            this.editor.world.add(new Body(new Circle(8)).setPosition(mousePosition));
        }

    }

    addVertex(vertex) {
        if (this.polygon.length > 2) {
            if (vertex.dst(this.polygon[0]) < 10) {
                this.editor.addPolygon(this.polygon);
                this.polygon = [];
                return;
            }
        }
        this.polygon.push(vertex);
    }

    drawVertex(vertex, width, height, color, shapeRenderer) {
        shapeRenderer.drawRect({
            x: vertex.x - width * 0.5,
            y: vertex.y - height * 0.5,
            abgr: color,
            width,  height,
        });
    }

    render(camera) {

        if (this.polygon.length) {

            const mousePosition = this.editor.getMousePosition();

            let v1, v2 = this.polygon[0];
            for (let i = 0; i < this.polygon.length - 1; i++) {
                v1 = this.polygon[i];
                this.drawVertex(v1, 4, 4, 0xFF00FFFF, camera.shapeRenderer);
                v2 = this.polygon[i + 1];
                camera.shapeRenderer.drawLine({
                    x1: v1.x, y1: v1.y,
                    x2: v2.x, y2: v2.y,
                    c1: 0xFFFF0000,
                });
            }
            this.drawVertex(v2, 4, 4, 0xFF00FFFF, camera.shapeRenderer);
            
            camera.shapeRenderer.drawLine({
                x1: mousePosition.x, 
                y1: mousePosition.y,
                x2: v2.x, y2: v2.y,
                c1: 0xFFFF0000,
            });

        }

    }

}