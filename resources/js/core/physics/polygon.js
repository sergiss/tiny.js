/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import { isConvex } from "../utils/utils.js";
import Vec2 from "../utils/vec2.js";
import { handleCirclePolygonCollision } from "./circle.js";
import Shape from "./shape.js";

export default class Polygon extends Shape {

    static MAX_VERTICES = 8;

    constructor(vertices, computeCentroid) {
        super();

        this.setVertices(vertices, computeCentroid);

        this.type = 1;
        this.color = 0xFF00A300;
    }

    setVertices(vertices, computeCentroid = false) {
        
        if (vertices.length < 3) {
            throw new Error("Polygon must have at least 3 vertices");
        }

        if (this.computeArea(vertices) === 0) {
            throw new Error("The area of ​​the polygon cannot be zero.");
        }

        let centroid;
        if (computeCentroid) {
            centroid = this.getCentroid(vertices);
        }

        this.vertices = [];
        this.worldVertices = [];
        this.worldNormals = [];
        for (let i = 0; i < vertices.length; i++) {
            this.vertices[i] = new Vec2(vertices[i]);
            if (computeCentroid) this.vertices[i].sub(centroid);
            this.worldVertices[i] = new Vec2();
            this.worldNormals [i] = new Vec2();
        }

        this.lastRotation = null;

        if (!this.isConvex()) {
            throw new Error("Polygon must be convex");
        }  
    
    }

    getCentroid(vertices = this.vertices) {
        const sum = new Vec2();
        for (let vertex of vertices) {
            sum.add(vertex);
        }
        return sum.div(vertices.length);
    }

    computeWorldVertices(position = new Vec2(), rotation = 0) {
        const vertices = this.vertices;
        const worldVertices = [];
        for (let i = 0; i < vertices.length; i++) {
            const vertex = vertices[i].copy();
            if (rotation !== 0) {
                vertex.rotate(rotation);
            }
            vertex.add(position);
            worldVertices.push(vertex);
        }
        return worldVertices;
    }

    update() {
        const body = this.body;
        const updateNormals = body.rotation !== this.lastRotation;
        this.lastRotation = body.rotation;
        let i, normal; 
        let vertex = this.worldVertices[0].set(this.vertices[0]);
        if (body.rotation != 0) vertex.rotate(body.rotation);
        vertex.add(body.position);
        let minX = vertex.x, 
            minY = vertex.y, 
            maxX = vertex.x, 
            maxY = vertex.y;
        for (i = 1; i < this.vertices.length; i++) {
            vertex = this.worldVertices[i].set(this.vertices[i]);
            if (body.rotation != 0) vertex.rotate(body.rotation);
            vertex.add(body.position);
            if (minX > vertex.x) minX = vertex.x;
            else if (maxX < vertex.x) maxX = vertex.x;
            if (minY > vertex.y) minY = vertex.y;
            else if (maxY < vertex.y) maxY = vertex.y;
            if (updateNormals) {
                normal = this.worldNormals[i - 1].set(vertex).sub(this.worldVertices[i - 1]).nor();
                normal.set(-normal.y, normal.x);
            }
        }
        if (updateNormals) {
            normal = this.worldNormals[i - 1].set(this.worldVertices[0]).sub(vertex).nor();
            normal.set(-normal.y, normal.x);
        }

        this.min.set(minX, minY);
        this.max.set(maxX, maxY);

    }

    handleCollision(shape, mtv) {

        switch(shape.type) {
            case 0: { // Circle vs Polygon
                if (handleCirclePolygonCollision(shape, this, mtv)) {
                    mtv.normal.negate();
                    return true;
                }
                return false; 
            }
            case 1: // Polygon vs Polygon 
                return handlePolygonPolygonCollision(this, shape, mtv);
            case 2:
                return handlePolygonComplexCollision(this, shape, mtv);
            default:
        }

    }

    contains(point) {
        if (!super.contains(point)) return false;
		let vertices = this.worldVertices;
		let intersects = 0;

		for (let i = 0; i < vertices.length; i ++) {
			let v1 = vertices[i];
            let v2 = vertices[(i + 1) % vertices.length];
            if (((v1.y < point.y && point.y < v2.y) || (v2.y < point.y && point.y < v1.y)) && point.x < ((v2.x - v1.x) / (v2.y - v1.y) * (point.y - v1.y) + v1.x)) intersects++;
		}
		return (intersects & 1) == 1;
    }

    computeArea (vertices = this.vertices) {
		let area = 0;
		let v1 = vertices[vertices.length - 1];
		for (let i = 0; i < vertices.length; i ++) {
			const v2 = vertices[i];
			area += v1.x * v2.y - v2.x * v1.y;
			v1 = v2;
		}
		return area * 0.5;
	}

    isConvex() {
        return isConvex(this.vertices);
    }

    copy() {
        const result = new Polygon(this.vertices);
        result.color = this.color;
        return result;
    }

    debug(renderer, abgr) {
        for (let i = 0; i < this.worldVertices.length; i++) {
            let v1 = this.worldVertices[i];
            let v2 = this.worldVertices[(i + 1) % this.worldVertices.length];
            renderer.drawLine({
                x1: v1.x,
                y1: v1.y,
                x2: v2.x,
                y2: v2.y,
                c1: abgr || this.color,
                lineWidth: Shape.LINE_WIDTH
            });
        }
        super.debug(renderer);
    }

    static createBox(width, height = width) {
        const hw = width * 0.5, hh = height * 0.5;
        const vertices = [
            new Vec2(-hw, -hh),
            new Vec2(hw, -hh),
            new Vec2(hw, hh),
            new Vec2(-hw, hh)
        ];
        return new Polygon(vertices);
    }

    static createRandom(props = {}) {

        const random = props.random || Math.random;

        const rnd = (min, max) => random() * (max - min) + min;;

        const { numSides = rnd(3, 6), radius = rnd(10, 50) } = props;
        const polyCoords = [];

        const PI2 = Math.PI * 2;

        const pi2Points = [];
        for (let i = 0; i < numSides; i++) {
            pi2Points.push(random() * PI2);
        }

        pi2Points.sort((a, b) => {
            return b - a;
        });

        for (let i = 0; i < numSides; i++) {
            const angle = pi2Points[i];
            polyCoords.push(new Vec2(Math.cos(angle) * radius, Math.sin(angle) * radius));
        }

        return new Polygon(polyCoords, true);
    }
    
}

const handlePolygonComplexCollision = (polygon, complex, mtv) => {
    if (complex.handleCollision(polygon, mtv)) {
        mtv.normal.negate();
        return true;
    }
}

const handlePolygonPolygonCollision = (poligonA, poligonB, mtv) => {

    if (poligonA.intersects(poligonB)) { // AABB test

        mtv.penetration = Number.MAX_VALUE;
        for (let i = 0; i < poligonA.worldNormals.length; ++i) {
            const axis = poligonA.worldNormals[i];
            // project shape a on axis
            const projA = project(poligonA.worldVertices, axis);
            // project shape b on axis
            const projB = project(poligonB.worldVertices, axis);
            if (projA.max < projB.min || projB.max < projA.min) {
                return false;
            }
    
            let o = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
            const aContainsB = projA.min < projB.min && projA.max > projB.max;
            const bContainsA = projB.min < projA.min && projB.max > projA.max;
            // if it contains one or another
            let mins = 0, maxs = 0;
            if (aContainsB || bContainsA) {
                mins = Math.abs(projA.min - projB.min);
                maxs = Math.abs(projA.max - projB.max);
                o += Math.min(mins, maxs);
            }
    
            if (o < mtv.penetration) {
                mtv.penetration = o;
                if (projA.min < projB.min) {
                    mtv.normal.set(axis);
                } else {
                    mtv.normal.set(-axis.x, -axis.y);
                }
                if ((aContainsB || bContainsA) && mins < maxs) {
                    mtv.normal.negate();
                }
            }
        }
    
        for (let i = 0; i < poligonB.worldNormals.length; ++i) {
            const axis = poligonB.worldNormals[i];
            // project shape a on axis
            const projA = project(poligonB.worldVertices, axis);
            // project shape b on axis
            const projB = project(poligonA.worldVertices, axis);
            if (projA.max < projB.min || projB.max < projA.min) {
                return false;
            }
    
            let o = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
            const aContainsB = projA.min < projB.min && projA.max > projB.max;
            const bContainsA = projB.min < projA.min && projB.max > projA.max;
            // if it contains one or another
            let mins = 0, maxs = 0;
            if (aContainsB || bContainsA) {
                mins = Math.abs(projA.min - projB.min);
                maxs = Math.abs(projA.max - projB.max);
                o += Math.min(mins, maxs);
            }
    
            if (o < mtv.penetration) {
                mtv.penetration = o;
                if (projA.min > projB.min) {
                    mtv.normal.set(axis);
                } else {
                    mtv.normal.set(-axis.x, -axis.y);
                }
                if ((aContainsB || bContainsA) && mins < maxs) {
                    mtv.normal.negate();
                }
            }
        }

        return true;

    }
    
    return false;
}

const project = (vertices, axis) => {
    let min = vertices[0].dot(axis);
    let max = min;
    for (let i = 1, len = vertices.length; i < len; ++i) {
        const p = vertices[i].dot(axis);
        if (p < min) { min = p; }
        if (p > max) { max = p; }
    }
    return { min, max };
}