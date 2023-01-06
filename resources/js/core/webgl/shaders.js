/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

export const BLACK_AND_WHITE = 0;
export const SEPIA = 1;
export const POINT_LIGHT = 2;

export const DEFAULT_VERTEX =`
precision highp float;
uniform mat4 u_projTrans;
uniform vec3 u_ambient_color;
attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;
varying vec4 v_color;
varying vec2 v_texCoords;
void main(){
    gl_Position=u_projTrans*a_position;
    v_texCoords=a_texCoord;
    vec3 color = a_color.rgb * u_ambient_color;
    v_color=vec4(color, a_color.a);
}`;

export const DEFAULT_FRAGMENT =`
precision highp float;
varying vec2 v_texCoords;
varying vec4 v_color;
uniform sampler2D u_texture;

void main(){
    gl_FragColor=texture2D(u_texture,v_texCoords)*v_color;
}`;

export const POINT_LIGHT_VERTEX =`
precision highp float;
struct PointLight {    
    vec2 position;
    float sqrtRadius;
    vec3 color;
};
uniform mat4 u_projTrans;
uniform PointLight uPointLights[16];
uniform vec3 u_ambient_color;
attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;
varying vec4 v_color;
varying vec2 v_texCoords;

float dst2(vec2 a, vec2 b) {
    vec2 d = a - b;
    return dot(d, d);
}

void main(){
    gl_Position=u_projTrans*a_position;
    v_texCoords=a_texCoord;
    vec3 color = a_color.rgb * u_ambient_color;
    for (int i = 0; i < 16; i++) {
        if (uPointLights[i].sqrtRadius > 0.0) {
            float len2 = dst2(uPointLights[i].position, a_position.xy);
            if (len2 < uPointLights[i].sqrtRadius) {
                color.rgb += (1.0 - len2 / uPointLights[i].sqrtRadius) * uPointLights[i].color;
            }
        }
    }
    v_color=vec4(color, a_color.a);
}`;

export const POINT_LIGHT_FRAGMENT =`
precision highp float;
struct PointLight {    
    vec2 position;
    float sqrtRadius;
    vec3 color;
};
varying vec2 v_texCoords;
varying vec4 v_color;
uniform PointLight uPointLights[16];
uniform sampler2D u_texture;

float dst2(vec2 a, vec2 b) {
    vec2 d = a - b;
    return dot(d, d);
}

void main(){
    vec4 color = v_color;
    for (int i = 0; i < 16; i++) {
        if (uPointLights[i].sqrtRadius > 0.0) {
            float len2 = dst2(uPointLights[i].position, gl_FragCoord.xy);
            if (len2 < uPointLights[i].sqrtRadius) {
                color.rgb += (1.0 - len2 / uPointLights[i].sqrtRadius) * uPointLights[i].color;
            }
        }
    }
    gl_FragColor=texture2D(u_texture,v_texCoords)*color;
}`;

export const setPointLights = (renderer, pointLights) => { // [x, y, radius * radius]
    // const offsetX = renderer.gl.canvas.width / 2;
    // const offsetY = renderer.gl.canvas.height / 2;
    let i;
    for (i = 0; i < pointLights.length; ++i) {
        const light = pointLights[i];
        // renderer.gl.uniform2f(renderer.gl.getUniformLocation(renderer.program, `uPointLights[${i}].position`), light.position.x + offsetX, light.position.y + offsetY);
        renderer.gl.uniform2f(renderer.gl.getUniformLocation(renderer.program, `uPointLights[${i}].position`), light.position.x, light.position.y);
        renderer.gl.uniform3fv(renderer.gl.getUniformLocation(renderer.program, `uPointLights[${i}].color`), light.color);
        renderer.gl.uniform1f(renderer.gl.getUniformLocation(renderer.program, `uPointLights[${i}].sqrtRadius`), light.radius * light.radius);
    }
    for (; i < 16; ++i) {
        renderer.gl.uniform1f(renderer.gl.getUniformLocation(renderer.program, `uPointLights[${i}].radius`), 0.0);
    }
}

export const BLACK_AND_WHITE_FRAGMENT =`
precision highp float;
varying vec2 v_texCoords;
varying vec4 v_color;
uniform sampler2D u_texture;

void main(){
    gl_FragColor=texture2D(u_texture,v_texCoords)*v_color;
    gl_FragColor.rgb = vec3((gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0);
}`;

export const SEPIA_VERTEX =`
precision highp float;
uniform mat4 u_projTrans;
attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;
varying vec4 v_color;
varying vec2 v_texCoords;
void main(){
    gl_Position=u_projTrans*a_position;
    v_texCoords=a_texCoord;
    v_color=a_color;
}`;

export const SEPIA_FRAGMENT =`
precision highp float;
varying vec2 v_texCoords;
varying vec4 v_color;
uniform sampler2D u_texture;
uniform float u_factor;
void main(){
    gl_FragColor=texture2D(u_texture,v_texCoords)*v_color;
    vec3 sepiaColour = vec3((gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0) * vec3(1.2, 1.0, 0.8);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(sepiaColour), u_factor);
}`;

export const setSepiaFactor = (renderer, factor) => {
    renderer.gl.uniform1f(renderer.gl.getUniformLocation(renderer.program, "u_factor"), factor);
}