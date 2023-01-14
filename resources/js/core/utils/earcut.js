const PI2 = Math.PI * 2;

export function triangulate(vertices) {

    if (vertices.length < 3) return null;

    const points = [...vertices];

    if (angle(points[0], points[1], points[2]) > Math.PI) {
        points.reverse();
    }

    const triangles = [];
    let v1, v2, v3;
    let i = 1;

    while (points.length > 3) {
        v1 = points[i % points.length];
        v2 = points[(i + 1) % points.length];
        v3 = points[(i + 2) % points.length];
        if (angle(v1, v2, v3) < Math.PI) {
            let isEar = true;
            for (let j = i + 3, n = j + points.length; j < n; j++) {
                if (isInsideTriangle(v1, v2, v3, points[j % points.length])) {
                    isEar = false;
                    break;
                }
            }
            if (isEar) {
                points.splice((i + 1) % points.length, 1);
                triangles.push([v1, v2, v3]);
            }
        }
        i++;
    }
    triangles.push([points[0], points[1], points[2]]);
    return triangles;
}

const isInsideTriangle = (pt, v1, v2, v3) => {  
    let d1 = sign(pt, v1, v2);
    let d2 = sign(pt, v2, v3);
    let d3 = sign(pt, v3, v1);
    return ((d1 > 0) && (d2 > 0) && (d3 > 0)) || ((d1 < 0) && (d2 < 0) && (d3 < 0));
}

const sign = (p1, p2, p3) => {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

const angle = (a, b, c) => {
    const temp = Math.atan2((c.y - b.y), (c.x - b.x)) - Math.atan2((a.y - b.y), (a.x - b.x));
    return temp < 0 ? PI2 + temp : temp;
}