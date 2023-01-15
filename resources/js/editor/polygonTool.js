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
        const tmp = mousePosition.copy();

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

        // Add vertex or edit body
        if (input.obtain(0).pressed) {
            this.handleEditAction({ input, mousePosition });
        }

        if (input.obtain('Delete').justPressed) {
            this.editMode = false;
            this.polygon = [];
        }

        // Remove last vertex
        if (this.polygon.length) {
            if (input.obtain('Escape').justPressed) {
                if (this.editMode) {
                    this.releaseCurrentBody();
                } else {
                    this.polygon.pop();
                }
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

    handleEditAction({ input, mousePosition }) {

        if (input.obtain(0).justPressed) {
            this.currentVertex = null;
            const body = this.editor.getBodyAt(mousePosition);
            if (body?.mass === 0 && body?.static === false) { // check if body is editable
                this.releaseCurrentBody();
                this.editor.world.remove(body);
                this.editMode = true;
                this.polygon = body.shape.worldVertices;
                this.lastMousePosition = mousePosition; // Refresh last mouse position
            } else if (this.editMode) {               
                // Select vertex
                const vertex = this.polygon.find(v => v.dst(mousePosition) < 5);
                if (vertex) {
                    this.currentVertex = vertex;
                    this.lastMousePosition = vertex.copy(); // Refresh last mouse position
                } else if (!this.contains(this.polygon, mousePosition)) { // check if current body contains mouse position
                    this.releaseCurrentBody();                    
                } else {
                    this.lastMousePosition = mousePosition; // Refresh last mouse position
                }
            } else {
                this.addVertex(mousePosition);
            }
        } else {

            if (this.editMode) {
                const delta = mousePosition.copy().sub(this.lastMousePosition);
                if (this.currentVertex) { // Move Vertex
                    this.currentVertex.add(delta);
                } else { // Move Body                    
                    for (const vertex of this.polygon) { // Move all vertices
                        vertex.add(delta);
                    }
                }
                this.lastMousePosition = mousePosition;
            }
        }

    }

    contains(polygon, point) {
        let vertices = polygon;
        let intersects = 0;

        for (let i = 0; i < vertices.length; i++) {
            let v1 = vertices[i];
            let v2 = vertices[(i + 1) % vertices.length];
            if (((v1.y < point.y && point.y < v2.y) || (v2.y < point.y && point.y < v1.y)) && point.x < ((v2.x - v1.x) / (v2.y - v1.y) * (point.y - v1.y) + v1.x)) intersects++;
        }
        return (intersects & 1) == 1;
    }

    releaseCurrentBody() {
        if (this.editMode) {
            if (this.polygon.length > 2) { // check if body is valid
                this.editor.addPolygon(this.polygon);
            }
            this.polygon = [];
            this.editMode = false;
        }
    }

    addVertex(vertex) {
        if (this.polygon.length > 2) {
            if (vertex.dst(this.polygon[0]) < 10) { // Close polygon
                this.editor.addPolygon(this.polygon);
                this.polygon = [];
                return;
            }
        }
        console.log(vertex);
        this.polygon.push(vertex);
    }

    drawVertex(vertex, width, height, color, shapeRenderer) {
        shapeRenderer.drawRect({
            x: vertex.x - width * 0.5,
            y: vertex.y - height * 0.5,
            abgr: vertex === this.currentVertex ? 0xFF0000FF : color,
            width, height,
        });
    }

    render(camera) {

        if (this.polygon.length) {

            const mousePosition = this.editor.getMousePosition();

            let v1, v2 = this.polygon[0];
            const n = this.editMode ? this.polygon.length : this.polygon.length - 1;
            for (let i = 0; i < n; i++) {
                v1 = this.polygon[i];
                this.drawVertex(v1, 4, 4, 0xFF00FFFF, camera.shapeRenderer);
                v2 = this.polygon[(i + 1) % this.polygon.length];
                camera.shapeRenderer.drawLine({
                    x1: v1.x, y1: v1.y,
                    x2: v2.x, y2: v2.y,
                    c1: 0xFFFF0000,
                });
            }
            this.drawVertex(v2, 4, 4, 0xFF00FFFF, camera.shapeRenderer);

            if (!this.editMode) {
                camera.shapeRenderer.drawLine({
                    x1: mousePosition.x,
                    y1: mousePosition.y,
                    x2: v2.x, y2: v2.y,
                    c1: 0xFFFF0000,
                });
            }

        }

    }

}