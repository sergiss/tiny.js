/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Vec2 from "../utils/vec2.js";

export default class Body {

    static ids = 0;

    constructor(shape, position) {
        this.id = Body.ids++;
        
        this.shape = shape.copy();
        this.shape.setBody(this);

        this.position = new Vec2(position);
        this.force = new Vec2();
        this.velocity = new Vec2();
        this.rotation = 0;
        this.restitution = 0.2;

        this.setMass(1);
    }

    setRotation(rotation) {
        this.rotation = rotation;
        return this;
    }

    setRetitution(restitution) {
        this.restitution = restitution;
        return this;
    }

    setPosition(position) {
        this.position.set(position);
        return this;
    }

    update() {
        if (!this.static) {
            if (this.mass !== 0) this.force.add(this.world.gravity);
            this.velocity.add(this.force);
            this.position.add(this.velocity);

            if (this.world.airFriction) {
                this.velocity.scl(this.world.airFriction);
            }
        } else {
            this.velocity.set(0, 0);
        }
        this.force.set(0, 0);
        this.shape.update(this);
    }

    setMass(mass) {
        this.mass = mass < 0 ? 0 : mass;
        this.invMass = this.mass == 0 ? 0 : 1 / this.mass;
        this.static = this.mass == 0;
        return this;
    }

}