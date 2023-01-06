/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Vec2 from "./vec2.js";

export default class Font {

    constructor() {

        this.scale  = new Vec2(1, 1);

        this.shadow = {
            enabled: false,
            offset: new Vec2(1, 1),
            color: 0x88000000
        }

        this.color = 0xFFFFFFFF;
    }

    getWidth(text, scale = this.scale.x) {
        return text ? (text + '').length * this.charWidth * scale : this.charWidth * scale;
    }

    getHeight(scale = this.scale.y) {
        return this.charHeight * scale;
    }

    render({
        renderer, 
        text, 
        x, y, 
        scale = this.scale, 
        color = this.color, 
        shadowEnabled = this.shadow.enabled, 
        shadowOffset = this.shadow.offset, 
        shadowColor = this.shadow.color}) {

        text += '';

        const cw = this.charWidth  * scale.x;
        const ch = this.charHeight * scale.y;

        if (shadowEnabled) {

            for (let i = 0; i < text.length; ++i) {

                const code = text.charCodeAt(i);
                const uv = this.charset[code];

                const cx = x + cw * i;

                renderer.draw({
                    glTexture: this.texture.glTexture,
                    uv: uv,
                    x: cx + shadowOffset.x,
                    y: y + shadowOffset.y,
                    width: cw,
                    height: ch,
                    abgr: shadowColor
                });

                renderer.draw({
                    glTexture: this.texture.glTexture,
                    uv: uv,
                    x: cx,
                    y: y,
                    width: cw,
                    height: ch,
                    abgr: color
                });

            }

        } else {

            for (let i = 0; i < text.length; ++i) {

                const code = text.charCodeAt(i);
                const uv = this.charset[code];

                renderer.draw({
                    glTexture: this.texture.glTexture,
                    uv: uv,
                    x: x + cw * i,
                    y: y,
                    width: cw,
                    height: ch,
                    abgr: color
                });

            }

        }

    }

}