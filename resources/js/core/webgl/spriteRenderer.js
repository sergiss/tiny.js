import { BLACK_AND_WHITE_FRAGMENT, DEFAULT_FRAGMENT, DEFAULT_VERTEX, POINT_LIGHT_VERTEX, SEPIA_FRAGMENT, SEPIA_VERTEX, setSepiaFactor } from "./shaders.js";
import { createProgram, createBuffer } from "./utils.js";

const VERTICES_PER_QUAD = 4;
const INDICES_PER_VERT = 5;
const MAX_QUADS = (1 << 16);
const MAX_BATCH = MAX_QUADS * INDICES_PER_VERT * VERTICES_PER_QUAD;
const VERTEX_BYTE_STRIDE = INDICES_PER_VERT * 4;

export default class SpriteRenderer {

    constructor(gl, vertexShader, fragmentShader) {
        this.ambientColor = [1, 1, 1];
        if (gl) this.init(gl, vertexShader, fragmentShader);
    }

    setShader (shader) {
        switch(shader) {
            case 0 :
                this.init(this.gl, DEFAULT_VERTEX, BLACK_AND_WHITE_FRAGMENT);
            break;
            case 1 :
                this.init(this.gl, SEPIA_VERTEX, SEPIA_FRAGMENT);
                setSepiaFactor(this, 0.75);
            break;
            case 2 :
                this.init(this.gl, POINT_LIGHT_VERTEX, DEFAULT_FRAGMENT);
                // this.init(this.gl, DEFAULT_VERTEX, POINT_LIGHT_FRAGMENT);
            break;
            default:
                this.init(this.gl, DEFAULT_VERTEX, DEFAULT_FRAGMENT);
            break;
        }
    }

    init(gl, vertexShader = DEFAULT_VERTEX, fragmentShader = DEFAULT_FRAGMENT) {
        this.gl = gl;

        this.program = createProgram(gl, vertexShader, fragmentShader);
        this.gl.useProgram(this.program);

        const vertexData = new ArrayBuffer(MAX_BATCH * VERTEX_BYTE_STRIDE);
        this.buffer = createBuffer(gl, gl.ARRAY_BUFFER, vertexData.byteLength, gl.DYNAMIC_DRAW);
        this.positionData = new Float32Array(vertexData);
        this.colorData = new Uint32Array(vertexData);

        this.blendMode = true;

        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.textureLocation  = this.gl.getAttribLocation(this.program, 'a_texCoord');
        this.colorLocation    = this.gl.getAttribLocation(this.program, 'a_color');

        this.ambientColorLocation = this.gl.getUniformLocation(this.program, 'u_ambient_color');

        const n = MAX_QUADS * 6;
        const indices = [];
        for (let j = 0, i = 0; i < n; i += 6, j += 4) {
            indices[i  ] = j + 0;
            indices[i+1] = j + 1;
            indices[i+2] = j + 2;
            indices[i+3] = j + 0;
            indices[i+4] = j + 2;
            indices[i+5] = j + 3;
        }

        this.indexBuffer = createBuffer(gl, this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.DYNAMIC_DRAW);

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
        // UVs
        this.gl.enableVertexAttribArray(this.textureLocation);
        this.gl.vertexAttribPointer(this.textureLocation, 2, this.gl.FLOAT, false, VERTEX_BYTE_STRIDE, 8);
        // Color
        this.gl.enableVertexAttribArray(this.colorLocation);
        this.gl.vertexAttribPointer(this.colorLocation, 4, this.gl.UNSIGNED_BYTE, true, VERTEX_BYTE_STRIDE, 16);
        // Indices
        this.gl.enableVertexAttribArray(this.indexBuffer);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        this.gl.viewport(x, y, width, height);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, 'u_projTrans'), false, new Float32Array(this.projectionMatrix));

        this.glTexture = null;
        this.indices = 0;
    }

    setTexture(glTexture) {
        if (glTexture != this.glTexture) {
            this.flush();
            this.gl.bindTexture(this.gl.TEXTURE_2D, glTexture);
            this.glTexture = glTexture;
        }
    }

    draw({ 
        glTexture, uv, 
        x = 0, y = 0, 
        originX = 0, originY = 0, 
        width = glTexture.image.width, height = glTexture.image.height,
        scaleX = 1, scaleY = 1, 
        rotation = 0, 
        flipX, flipY, 
        abgr = 0xFFFFFFFF
    }) {

        this.setTexture(glTexture);

        if (this.indices == MAX_BATCH) {
            this.flush();
        }

        const positionData = this.positionData;
        const colorData = this.colorData;

		let fx1, fy1, fx2, fy2;

		// scale
		if (scaleX != 1 || scaleY != 1) {
            fx1 = -originX * scaleX;
            fy1 = -originY * scaleY;
            fx2 = (width  - originX) * scaleX;
            fy2 = (height - originY) * scaleY;
		} else {
            fx1 = -originX;
            fy1 = -originY;
            fx2 = width  - originX;
            fy2 = height - originY;
        }

		let x1, y1, x2, y2, x3, y3, x4, y4;

		// rotate
		if (rotation != 0) {
			const cos = Math.cos(rotation);
			const sin = Math.sin(rotation);

			x1 = cos * fx1 - sin * fy1;
			y1 = sin * fx1 + cos * fy1;

			x2 = cos * fx1 - sin * fy2;
			y2 = sin * fx1 + cos * fy2;

			x3 = cos * fx2 - sin * fy2;
			y3 = sin * fx2 + cos * fy2;

			x4 = x1 + (x3 - x2);
			y4 = y3 - (y2 - y1);
		} else {
			x1 = fx1;
			y1 = fy1;

			x2 = fx1;
			y2 = fy2;

			x3 = fx2;
			y3 = fy2;

			x4 = fx2;
			y4 = fy1;
		}

		x1 += x;
		y1 += y;
		x2 += x;
		y2 += y;
		x3 += x;
		y3 += y;
		x4 += x;
		y4 += y;

        let { u0, v0, u1, v1 } = uv;

        if (flipX) {
			const tmp = u0;
			u0 = u1;
			u1 = tmp;
		}

		if (flipY) {
			const tmp = v0;
			v0 = v1;
			v1 = tmp;
		}

        const indices = this.indices;
    
        // v1
        positionData[indices + 0] = x1;
        positionData[indices + 1] = y1;
        positionData[indices + 2] = u0;
        positionData[indices + 3] = v0;
        colorData   [indices + 4] = abgr;

        // v2
        positionData[indices + 5] = x2;
        positionData[indices + 6] = y2;
        positionData[indices + 7] = u0;
        positionData[indices + 8] = v1;
        colorData   [indices + 9] = abgr;

        // v3
        positionData[indices + 10] = x3;
        positionData[indices + 11] = y3;
        positionData[indices + 12] = u1;
        positionData[indices + 13] = v1;
        colorData   [indices + 14] = abgr;
  
        // v4
        positionData[indices + 15] = x4;
        positionData[indices + 16] = y4;
        positionData[indices + 17] = u1;
        positionData[indices + 18] = v0;
        colorData   [indices + 19] = abgr;

        this.indices += 20;

    }

    flush() {
        if (this.indices) {

            if (this.blendMode) {
                this.gl.enable(this.gl.BLEND);
                this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
            }

            this.gl.uniform3fv(this.ambientColorLocation, this.ambientColor);

            // draw all the sprites in the batch and reset the buffer
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.positionData, 0, this.indices);
            this.gl.drawElements(this.gl.TRIANGLES, this.indices / 20 * 6, this.gl.UNSIGNED_SHORT, 0);

            this.indices = 0;
        }
    }

}