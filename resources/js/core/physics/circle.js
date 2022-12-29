import Shape from "./shape.js";

export default class Circle extends Shape {

    constructor(radius) {
        super();
        
        this.radius = radius;
        this.type = 0;

        this.color = 0xFFFF0000;
    }

    update() {
        const body = this.body;
        this.min.set(body.position.x - this.radius, body.position.y - this.radius);
        this.max.set(body.position.x + this.radius, body.position.y + this.radius);
    }

    handleCollision(shape, mtv) {

        switch(shape.type) {
            case 0: // Circle vs Circle
                return handleCircleCircleCollision(this, shape, mtv);
            case 1: // Circle vs Polygon
                return handleCirclePolygonCollision(this, shape, mtv);
            case 2: // circle vs complex
                return handleCircleComplexCollision(this, shape, mtv);
            default:
        }

    }

    contains(point) {
        return this.body.position.dst2(point) < this.radius * this.radius;
    }

    copy() {
        return new Circle(this.radius);
    }

    debug(renderer, abgr) {
        renderer.drawCircle({
            x: this.body.position.x,
            y: this.body.position.y,
            rotation: this.body.rotation,
            radius: this.radius,
            abgr: abgr || this.color,
            lineWidth: Shape.LINE_WIDTH
        });
        super.debug(renderer);
    }

}

const handleCircleComplexCollision = (circle, complex, mtv) => {
    if (complex.handleCollision(circle, mtv)) {
        mtv.normal.negate();
        return true;
    }
}

const handleCircleCircleCollision = (circleA, circleB, mtv) => {
    const radius = circleA.radius + circleB.radius;
    mtv.normal.set(circleB.body.position).sub(circleA.body.position);
    mtv.penetration = mtv.normal.len2();
    if (mtv.penetration < radius * radius) { // Circles are colliding
        if (mtv.penetration !== 0) { // Circles are not on the same position
            mtv.penetration = Math.sqrt(mtv.penetration);
            mtv.normal.div(mtv.penetration);
            mtv.penetration = radius - mtv.penetration;
        } else { // Circles are on the same position
            mtv.penetration = radius;
            mtv.normal.set(1, 0);
        }
        return true;
    }
    return false;
}

export const handleCirclePolygonCollision = (circle, polygon, mtv) => {

    if (circle.intersects(polygon)) { // AABB test

        mtv.penetration = Number.MAX_VALUE;
        let inside = false;

        const vertices = polygon.worldVertices;
        const center = circle.body.position;
        const radius = circle.radius;

        // Iterate over polygon edges
        for (let i = 0, n = vertices.length; i < n; ++i) {
            // Get edge
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % n];

            // Get edge vector
            const baX = v2.x - v1.x;
            const baY = v2.y - v1.y;
        
            let tmp = v1.y - center.y;

            // Check point inside polygon
            if (((v1.y <= center.y && center.y < v2.y) || (v2.y <= center.y && center.y < v1.y)) && center.x < (baX / -baY * tmp + v1.x)) {
                inside = !inside;
            }

            let x, y;

            // Find nearest segment point
            const c1 = (center.x - v1.x) * baX - tmp * baY;
            if (c1 > 0) {
                const c2 = baX * baX + baY * baY;
                if (c2 > c1) {
                    const t = c1 / c2;
                    x = v1.x + t * baX;
                    y = v1.y + t * baY;
                } else {
                    x = v2.x;
                    y = v2.y;
                }
            } else {
                x = v1.x;
                y = v1.y;
            }

            x = center.x - x;
            y = center.y - y;

            tmp = x * x + y * y;
            if (tmp < mtv.penetration) {
                mtv.penetration = tmp;
                mtv.normal.set(x, y);
            }
        }

        if (inside) { // Center is inside polygon
            if (mtv.penetration !== 0) {
                mtv.penetration = Math.sqrt(mtv.penetration);
                mtv.normal.div(mtv.penetration);
            }
            mtv.penetration += radius;
            return true;
        } else if (mtv.penetration < radius * radius) { // Check overlaps
            if (mtv.penetration !== 0) {
                mtv.penetration = Math.sqrt(mtv.penetration);
                mtv.normal.div(-mtv.penetration);
            }
            mtv.penetration = radius - mtv.penetration;
            return true;
        }

    }
    return false;
}