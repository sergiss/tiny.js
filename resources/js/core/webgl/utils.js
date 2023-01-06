/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

export const memoize = fn => {
    const cache = {};
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache[key] == null) {
            cache[key] = fn(...args);
        }
        return cache[key];
    }
}

export const compileShader = (gl, source, type) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(shader);
    }
    return shader;
}

export const createProgram = (gl, vertexShader, fragmentShader) => {
    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl, vertexShader  , gl.VERTEX_SHADER  ));
    gl.attachShader(program, compileShader(gl, fragmentShader, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw gl.getProgramInfoLog(program);
    }
    return program;
}

export const createBuffer = (gl, bufferType, data, usage) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(bufferType, buffer);
    gl.bufferData(bufferType, data, usage);
    return buffer;
}

export const createGlTexture = (gl, image, filter = gl.NEAREST) => {
    const glTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    glTexture.image = image;
    return glTexture;
}

export const createOrtho = (left, right, bottom, top, near, far) => {
    const a = 2 / (right - left);
    const b = 2 / (bottom - top);
    const c = 2 / (far - near);

    const x = -(right + left) / (right - left);
    const y = -(top + bottom) / (bottom - top);
    const z = -(far + near) / (far - near);
    return [
        a, 0, 0, 0,
        0, b, 0, 0,
        0, 0, c, 0,
        x, y, z, 1
    ]
}

export const multiply = (a, b, result) => {
    var b00 = b[0], a00 = a[0];
    var b01 = b[1], a01 = a[1];
    var b02 = b[2], a02 = a[2];
    var b03 = b[3], a03 = a[3];
    var b10 = b[4], a10 = a[4];
    var b11 = b[5], a11 = a[5];
    var b12 = b[6], a12 = a[6];
    var b13 = b[7], a13 = a[7];
    var b20 = b[8], a20 = a[8];
    var b21 = b[9], a21 = a[9];
    var b22 = b[10], a22 = a[10];
    var b23 = b[11], a23 = a[11];
    var b30 = b[12], a30 = a[12];
    var b31 = b[13], a31 = a[13];
    var b32 = b[14], a32 = a[14];
    var b33 = b[15], a33 = a[15];
    if (result) a = result;
    a[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
    a[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
    a[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
    a[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
    a[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
    a[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
    a[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
    a[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
    a[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
    a[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
    a[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
    a[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
    a[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
    a[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
    a[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
    a[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
    return a;
}


export const inverse = (a) => {
    var m00 = a[0];
    var m01 = a[1];
    var m02 = a[2];
    var m03 = a[3];
    var m10 = a[4];
    var m11 = a[5];
    var m12 = a[6];
    var m13 = a[7];
    var m20 = a[8];
    var m21 = a[9];
    var m22 = a[10];
    var m23 = a[11];
    var m30 = a[12];
    var m31 = a[13];
    var m32 = a[14];
    var m33 = a[15];
    var tmp_0 = m22 * m33;
    var tmp_1 = m32 * m23;
    var tmp_2 = m12 * m33;
    var tmp_3 = m32 * m13;
    var tmp_4 = m12 * m23;
    var tmp_5 = m22 * m13;
    var tmp_6 = m02 * m33;
    var tmp_7 = m32 * m03;
    var tmp_8 = m02 * m23;
    var tmp_9 = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    a[0] = d * t0;
    a[1] = d * t1;
    a[2] = d * t2;
    a[3] = d * t3;
    a[4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
        (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
    a[5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
        (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
    a[6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
        (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
    a[7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
        (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
    a[8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
        (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
    a[9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
        (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
    a[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
        (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
    a[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
        (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
    a[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
        (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
    a[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
        (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
    a[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
        (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
    a[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
        (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));
    return a;
}