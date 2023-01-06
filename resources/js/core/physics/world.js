/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import AABB from "../utils/aabb.js";
import { Quadtree } from "../utils/quadtree.js";
import Vec2 from "../utils/vec2.js";
import Body from "./body.js";
import Polygon from "./polygon.js";

export default class World {

    constructor(gravity = new Vec2()) {
        this.gravity = gravity;
        this.bodies = [];

        this.quadtree = new Quadtree(
            new AABB(
                new Vec2(-9999),
                new Vec2(9999)
            )
        );

        this.aabb = new AABB(new Vec2(), new Vec2());
        this.collisions = [];

        this.mtv = {
            normal: new Vec2()
        }

        this.airFriction = 1;
    }

    setMap(map, collisionListener) {
        this.map = map;
        this.collisionListener = collisionListener;
        const size = map.getSize();
        this.quadtree.aabb.min.set(0, 0);
        this.quadtree.aabb.max.set(size.width, size.height);

        const list = map.objects["polygon"];
        if (list) {
            for (let obj, vertices, i = 0; i < list.length; ++i) {
                obj = list[i];
                if (obj.polygon) {
                    const n = obj.polygon.length;
                    if (n > Polygon.MAX_VERTICES) {
                        throw Error("Maximum number of vertices exceeded");
                    }
                    vertices = [];
                    for (let i = 0; i < obj.polygon.length; ++i) {
                        vertices.push(new Vec2(obj.x + obj.polygon[i].x, obj.y + obj.polygon[i].y));
                    }
                    const polygon = new Polygon(vertices);
                    if (!polygon.isConvex()) {
                        throw Error("Polygon must be convex");
                    }
                    const body = new Body(polygon);
                    body.setMass(0);
                    this.add(body);
                }
            }
        }
    }

    add(body) {
        this.bodies.push(body);
        body.world = this;
    }

    remove(body) {
        let index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }

    debug(camera) {

        for (let body of this.bodies) {
            body.shape.debug(camera.shapeRenderer);
        }

        // this.quadtree.debug(camera.shapeRenderer);
    }

    update(iterations = 2) {

        this.quadtree.clear();
        for (let body of this.bodies) {
            body.hits = {};
            body.update();
            this.quadtree.insert(body.shape);
        }

   
        for (let i = 0; i < iterations; ++i) {

            for (const a of this.bodies) {
                if (a.static) continue; // Static body
                this.quadtree.iterate(this.aabb.set(a.shape), (other) => {
                    const b = other.body;
                    if (a !== b && !a.hits[b.id]) {
                        // TODO : collision mask
                        if (a.shape.handleCollision(other, this.mtv)) {
                            b.hits[a.id] = true;

                            const invMass = a.invMass + b.invMass;
                            if (invMass > 0.0) {
                                let j;
                                const rv = a.velocity.copy().sub(b.velocity);
                                // Correct velocities
                                const normalVelocity = this.mtv.normal.dot(rv);
                                if (normalVelocity > 0) {
                                    j = normalVelocity * (1.0 + (a.restitution + b.restitution) * 0.5) / invMass;
                                    a.velocity.subScl(this.mtv.normal, j * a.invMass);
                                    b.velocity.addScl(this.mtv.normal, j * b.invMass);
                                }

                                // Correct positions
                                const correction = this.mtv.penetration / invMass;
                                a.position.subScl(this.mtv.normal, correction * a.invMass);
                                b.position.addScl(this.mtv.normal, correction * b.invMass);

                                // Update shapes
                                a.shape.update();
                                b.shape.update();
                            }

                            if (a.collisionListener) {
                                a.collisionListener(b, this.mtv);
                            }

                            if (b.collisionListener) {
                                this.mtv.normal.negate();
                                b.collisionListener(a, this.mtv);
                            }

                        }

                    }
                });
            }
        }

    }

}