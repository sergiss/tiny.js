/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Vec2 from "../utils/vec2.js";
import Circle from "./circle.js";
import Polygon from "./polygon.js";
import Shape from "./shape.js";

export default class ComplexShape extends Shape {

    constructor(shapes) {
        super();
        this.type = 2;

        this.setShapes(shapes);
    }

    setShapes(shapes) {
        this.shapes = [];
        if (shapes) {
            for (const shape of shapes) {
                this.shapes.push(shape.copy());
            }
        }
    }

    setBody(body) {
        this.body = body;
        for (const shape of this.shapes) {
            shape.setBody(body);
        }
        return this;
    }

    update() {
        this.min.set( Number.MAX_VALUE);
        this.max.set(-Number.MAX_VALUE);
        for (const shape of this.shapes) {
            shape.update();
            this.min.min(shape.min);
            this.max.max(shape.max);
        }
    }

    handleCollision(shape, mtv) {
        mtv.penetration = 0;
        const tmp = { normal: new Vec2(), penetration: 0 };
        for (const s of this.shapes) {
            if (s.handleCollision(shape, tmp)) {
                if (tmp.penetration > mtv.penetration) {
                    mtv.normal.set(tmp.normal);
                    mtv.penetration = tmp.penetration;
                }
            }
        }
        return mtv.penetration > 0;
    }

    copy() {
        return new ComplexShape(this.shapes);
    }

    debug(renderer) {
        for (const shape of this.shapes) {
            shape.debug(renderer);
        }
    }

    static createGear(props = {}) {

        const {radius = 40, teeth = 10, toothWidth = 10, toothHeight = 20} = props;

        const gear = new ComplexShape();

        const angle = 2 * Math.PI / teeth;
        const halfToothWidth = toothWidth / 2;
        const halfToothHeight = toothHeight / 2;
        const halfToothAngle = Math.atan(halfToothHeight / halfToothWidth);
        const halfToothLength = Math.sqrt(halfToothWidth * halfToothWidth + halfToothHeight * halfToothHeight);

        for (let i = 0; i < teeth; i++) {
            let rotation = i * angle + halfToothAngle;
            const tooth = new Polygon([
                new Vec2(radius - halfToothLength, halfToothWidth).rotate(rotation),
                new Vec2(radius + halfToothLength, halfToothWidth).rotate(rotation),
                new Vec2(radius + halfToothLength, -halfToothWidth).rotate(rotation),
                new Vec2(radius - halfToothLength, -halfToothWidth).rotate(rotation)
            ]);
            tooth.color = 0xFF0000FF;
            gear.shapes.push(tooth);
        }

        gear.shapes.push(new Circle(radius - halfToothLength));

        return gear;

    }

}