/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

export const lerp = (a, b, t) => a + (b - a) * t;

export const random = (min, max) => Math.random() * (max - min) + min;

export const rndBGR = () => {
    return Math.floor(Math.random() * 0xFFFFFF) | 0xFF000000;
}

export const isConvex = (vertices) => {

    let prev = 0;
    let curr = 0;

    // Traverse the array
    for (let i = 0, n = vertices.length; i < n; i++) {

        // Update curr
        curr = crossProduct(vertices[i], vertices[(i + 1) % n], vertices[(i + 2) % n]);

        // If curr is not equal to 0
        if (curr != 0) {

            // If direction of cross product of
            // all adjacent edges are not same
            if (curr * prev < 0) {
                return false;
            }
            else {
                // Update curr
                prev = curr;
            }
        }
    }
    return true;
}

export const crossProduct = (p1, p2, p3) => {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}

export class Random {
    constructor(seed) {
        this.seed = seed;
        this.next = ({ min = 0, max = 1 } = {}) => {
            return this.random() * (max - min) + min;
        };
        this.random = () => {
            const x = Math.sin(this.seed++) * 10000;
            return x - Math.floor(x);
        };
    }
}
