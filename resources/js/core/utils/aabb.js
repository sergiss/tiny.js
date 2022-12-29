import Vec2 from "./vec2.js";

export default class AABB {

    constructor(min, max) {
        this.min = min;
        this.max = max;
    }

    getMinX() {
        return this.min.x;
    }

    getMaxX() {
        return this.max.x;
    }

    getMinY() {
        return this.min.y;
    }

    getMaxY() {
        return this.max.y;
    }

    getWidth() {
        return this.getMaxX() - this.getMinX();
    }

    getHeight() {
        return this.getMaxY() - this.getMinY();
    }

    intersects(aabb) {
        return !(aabb.getMaxX() < this.getMinX() || aabb.getMinX() > this.getMaxX() ||
                 aabb.getMaxY() < this.getMinY() || aabb.getMinY() > this.getMaxY());
    }

    contains(x, y) {
        if(x instanceof Vec2) {
            y = x.y;
            x = x.x;
        }
        return this.getMinX() <= x
        &&     this.getMinY() <= y
        &&     this.getMaxX() >= x
        &&     this.getMaxY() >= y;
    }

    set(aabb) {
        this.min.set(aabb.getMinX(), aabb.getMinY());
        this.max.set(aabb.getMaxX(), aabb.getMaxY());
        return this;
    }

    debug(renderer, abgr) {
        renderer.drawRect({ 
            x: this.getMinX(), 
            y: this.getMinY(), 
            width: this.getWidth(), 
            height: this.getHeight(),
            lineWidth: 1,
            abgr
        });
    }

}