/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import AABB from "../utils/aabb.js";
import Map from "../utils/map.js";
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

        this.maptree = new Quadtree(
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
        this.maptree.aabb.min.set(0, 0);
        this.maptree.aabb.max.set(size.width, size.height);

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
                    const body = new Body(polygon).setMass(0);
                    body.shape.update();             
                    this.maptree.insert(body.shape);
                }
            }
        }

        const bodies = this.map.createCollisionBodies(Map.COLLISION);
        for (const body of bodies) {
            body.shape.update();
            this.maptree.insert(body.shape);
        } 

    }

    add(body) {
        this.bodies.push(body);
        body.shape.update();
        body.world = this;
    }

    remove(body) {
        let index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }

    debug(camera, renderRegions = false) {    
        this.maptree.debug(camera.shapeRenderer, renderRegions);
        this.quadtree.debug(camera.shapeRenderer, renderRegions);
    }

    handleCollisions(bodies, quadtree) {
        const pairSet = {};
        for (let i = 0; i < bodies.length; ++i) {
            const a = bodies[i];
            if (a.invMass === 0.0) continue;
            quadtree.iterate(a.shape, (other) => {
                const b = other.body;
                if (a !== b) {

                    this.handleCollision(a, b);
                    
                }
            });
        }
    }

    handleCollision(a, b) {
        if (a.shape.handleCollision(b.shape, this.mtv)) {
            const invMass = a.invMass + b.invMass;

            // Correct velocities
            const rvX = a.velocity.x - b.velocity.x;
            const rvY = a.velocity.y - b.velocity.y;
            const normalVelocity = this.mtv.normal.dot(rvX, rvY);
            if (normalVelocity > 0) {
                const j = normalVelocity * (1.0 + (a.restitution + b.restitution) * 0.5) / invMass;
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
        
            if (a.collisionListener) {
                a.collisionListener(b, this.mtv);
            }

            if (b.collisionListener) {
                this.mtv.normal.negate();
                b.collisionListener(a, this.mtv);
            }

            return true;
        }
        return false;
    }
    update(iterations = 2) {
        
        this.quadtree.clear();
        for (let body of this.bodies) {
            body.update();
            this.quadtree.insert(body.shape);
        }
        
        for (let i = 0; i < iterations; ++i) {
            this.handleCollisions(this.bodies, this.quadtree);
            this.handleCollisions(this.bodies, this.maptree);
        }
        
    }

}