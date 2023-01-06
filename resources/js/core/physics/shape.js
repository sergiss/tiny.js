/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import AABB from "../utils/aabb.js";
import Vec2 from "../utils/vec2.js";

export default class Shape extends AABB {

    static LINE_WIDTH = 1;

    constructor() {
        super(new Vec2(), new Vec2());
    }

    setColor (color) {
        this.color = color;
        return this;
    }

    setBody(body) {
        this.body = body;
        return this;
    }

    update(body) {
        throw new Error("Not implemented");
    }

    handleCollision(shape, mtv) {
        throw new Error("Not implemented");
    }

    copy() {
        throw new Error("Not implemented");
    }

    debug(renderer) {
        // super.debug(renderer); // Draw AABB
    }

}