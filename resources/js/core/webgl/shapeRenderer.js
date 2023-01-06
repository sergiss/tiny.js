import { createProgram, createBuffer } from "./utils.js";

const PI2 = Math.PI * 2.0;

const VERTICES_PER_TRIANGLE = 3;
const INDICES_PER_VERT = 3;
const MAX_BATCH = (1 << 16) * INDICES_PER_VERT * VERTICES_PER_TRIANGLE;
const VERTEX_BYTE_STRIDE = INDICES_PER_VERT * 4;

const DEFAULT_VERTEX =`
precision highp float;
uniform mat4 u_projTrans;
attribute vec2 a_position;
attribute vec4 a_color;
varying vec4 v_color;
void main(){
    gl_Position=u_projTrans*vec4(a_position,1,1);
    v_color=a_color;
}`;

const DEFAULT_FRAGMENT =`
precision highp float;
varying vec4 v_color;
void main(){
    gl_FragColor=v_color;
}`;

export default class ShapeRenderer {

    constructor(gl, vertexShader, fragmentShader) {
        if (gl) this.init(gl, vertexShader, fragmentShader);
        this.color = 0xFFFFFFFF;
    }

    init(gl, vertexShader = DEFAULT_VERTEX, fragmentShader = DEFAULT_FRAGMENT) {
        this.gl = gl;

        this.program = createProgram(gl, vertexShader, fragmentShader);
        this.gl.useProgram(this.program);
        
        const vertexData = new ArrayBuffer(MAX_BATCH * VERTEX_BYTE_STRIDE);

        this.buffer = createBuffer(gl, gl.ARRAY_BUFFER, vertexData.byteLength, gl.DYNAMIC_DRAW);
        this.positionData = new Float32Array(vertexData);
        this.colorData = new Uint32Array(vertexData);

        this.blendMode = false;

        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.colorLocation = this.gl.getAttribLocation(this.program, 'a_color');

        return this;
    }

    setBlendMode(blendMode) {
        if (this.blendMode != blendMode) {
            this.flush();
        }
        this.blendMode = blendMode;
    }

    begin({x = 0, y = 0, width, height}) {
        // Program
        this.gl.useProgram(this.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        // Position
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, VERTEX_BYTE_STRIDE, 0);
        // Color
        this.gl.enableVertexAttribArray(this.colorLocation);
        this.gl.vertexAttribPointer(this.colorLocation, 4, this.gl.UNSIGNED_BYTE, true, VERTEX_BYTE_STRIDE, 8);

        this.gl.viewport(x, y, width, height);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, 'u_projTrans'), false, new Float32Array(this.projectionMatrix));

        this.indices = 0;
    }

    drawFillTriangle(x1, y1, x2, y2, x3, y3, c1 = this.color, c2 = c1, c3 = c1) {

        if (this.indices == MAX_BATCH) {
            this.flush();
        }
    
        // v1
        this.positionData[this.indices++] = x1;
        this.positionData[this.indices++] = y1;
        this.colorData   [this.indices++] = c1;

        // v2
        this.positionData[this.indices++] = x2;
        this.positionData[this.indices++] = y2;
        this.colorData   [this.indices++] = c2;

        // v3
        this.positionData[this.indices++] = x3;
        this.positionData[this.indices++] = y3;
        this.colorData   [this.indices++] = c3;

    }

    drawFillCircle({x, y, radius, segments = 32, rotation = 0, abgr}) {

        let tmp;
        let x1, x2 = x + radius * Math.cos(rotation);
        let y1, y2 = y + radius * Math.sin(rotation);

        for (let i = 1; i <= segments; ++i) {

            x1 = x2;
            y1 = y2;

            tmp = PI2 * i / segments + rotation;

            x2 = x + radius * Math.cos(tmp);
            y2 = y + radius * Math.sin(tmp);

            this.drawFillTriangle(
                x, y, x1, y1, x2, y2, abgr 
            );

        }

    }

    drawCircle({x, y, radius, segments = 32, lineWidth, rotation = 0, abgr}) {

        let tmp;
        let x1, x2 = x + radius * Math.cos(rotation);
        let y1, y2 = y + radius * Math.sin(rotation);

        for (let i = 1; i <= segments; ++i) {

            x1 = x2;
            y1 = y2;

            tmp = PI2 * i / segments + rotation;

            x2 = x + radius * Math.cos(tmp);
            y2 = y + radius * Math.sin(tmp);

            this.drawLine(
                {x1, y1, x2, y2, lineWidth, c1: abgr}
            );

        }

    }

    drawFillRect({x, y, width, height = width, rotation, abgr}) {
        
        let x1, y1, x2, y2, x3, y3, x4, y4;

        if (rotation) {

            const cos = Math.cos(rotation);
            const sin = Math.sin(rotation);

            const hw = width  * 0.5;
            const hh = height * 0.5;

            x1 = -hw;
            y1 = -hh;
            x2 = hw;
            y2 = y1;
            x3 = x2;
            y3 = hh;
            x4 = x1;
            y4 = y3;

            x += hw;
            y += hh;

            let tx = x1;
            x1 = cos * tx - sin * y1 + x;
            y1 = sin * tx + cos * y1 + y;
            tx = x2
            x2 = cos * tx - sin * y2 + x;
            y2 = sin * tx + cos * y2 + y;
            tx = x3
            x3 = cos * tx - sin * y3 + x;
            y3 = sin * tx + cos * y3 + y;
            x4 = x1 + (x3 - x2);
            y4 = y3 - (y2 - y1);
            
        } else {
            x1 = x; 
            y1 = y; 
            x2 = x + width; 
            y2 = y;
            x3 = x2;
            y3 = y + height;
            x4 = x;
            y4 = y3;
        }

        this.drawFillTriangle(
            x1, y1, x2, y2, x3, y3, abgr 
        ); 

        this.drawFillTriangle(
            x3, y3, x4, y4, x1, y1, abgr 
        );

    }

    drawRect({x, y, width, height = width, lineWidth, rotation = 0, abgr}) {

        let x1, y1, x2, y2, x3, y3, x4, y4;

        if (rotation) {

            const cos = Math.cos(rotation);
            const sin = Math.sin(rotation);

            const hw = width  * 0.5;
            const hh = height * 0.5;

            x1 = -hw;
            y1 = -hh;
            x2 = hw;
            y2 = y1;
            x3 = x2;
            y3 = hh;
            x4 = x1;
            y4 = y3;

            x += hw;
            y += hh;

            let tx = x1;
            x1 = cos * tx - sin * y1 + x;
            y1 = sin * tx + cos * y1 + y;
            tx = x2
            x2 = cos * tx - sin * y2 + x;
            y2 = sin * tx + cos * y2 + y;
            tx = x3
            x3 = cos * tx - sin * y3 + x;
            y3 = sin * tx + cos * y3 + y;
            x4 = x1 + (x3 - x2);
            y4 = y3 - (y2 - y1);
            
        } else {
            x1 = x; 
            y1 = y; 
            x2 = x + width; 
            y2 = y;
            x3 = x2;
            y3 = y + height;
            x4 = x;
            y4 = y3;
        }
        
        this.drawLine({x1: x1, y1: y1, x2: x2, y2: y2, lineWidth, c1: abgr}); // x1, y1, x2, y2
        this.drawLine({x1: x2, y1: y2, x2: x3, y2: y3, lineWidth, c1: abgr}); // x2, y2, x3, y3
        this.drawLine({x1: x3, y1: y3, x2: x4, y2: y4, lineWidth, c1: abgr}); // x3, y3, x4, y4
        this.drawLine({x1: x4, y1: y4, x2: x1, y2: y1, lineWidth, c1: abgr}); // x4, y4, x1, y1
       
    }

    drawLine({x1, y1, x2, y2, lineWidth = 1, c1 = this.color, c2 = c1}) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        let len = dx * dx + dy * dy;
        if (len != 0) {
            len = Math.sqrt(len);
            dx /= len;
            dy /= len;
        }

        const rotation = -Math.atan2(dx, dy);

        const hw = lineWidth * 0.5;
        const hh = len * 0.5;

        const x = x1 + dx * hh, 
              y = y1 + dy * hh;

        x1 = -hw;
        y1 = -hh;
        x2 = hw;
        y2 = y1;
        let x3 = x2;
        let y3 = hh;
        let x4 = x1;
        let y4 = y3;

        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        let tx = x1;
        x1 = cos * tx - sin * y1 + x;
        y1 = sin * tx + cos * y1 + y;
        tx = x2
        x2 = cos * tx - sin * y2 + x;
        y2 = sin * tx + cos * y2 + y;
        tx = x3
        x3 = cos * tx - sin * y3 + x;
        y3 = sin * tx + cos * y3 + y;
        x4 = x1 + (x3 - x2);
        y4 = y3 - (y2 - y1);
    
        this.drawFillTriangle(
            x1, y1, x2, y2, x3, y3, c1, c1, c2
        ); 

        this.drawFillTriangle(
            x3, y3, x4, y4, x1, y1, c2, c2, c1 
        );
    }

    drawPolygon({vertices, lineWidth, abgr}) {
        const len = vertices.length;
        for (let i = 0; i < len; i++) {
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % len];
            this.drawLine({x1: v1.x, y1: v1.y, x2: v2.x, y2: v2.y, lineWidth, c1: abgr});
        }
    }

    flush() {
        if (this.indices) {

            if (this.blendMode) {
                this.gl.enable(this.gl.BLEND);
                this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
            }

            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.positionData.subarray(0, this.indices));
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.indices / INDICES_PER_VERT);
            console.log(this.indices / INDICES_PER_VERT);
            this.indices = 0;
        }
    }

}