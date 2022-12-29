import { createOrtho, multiply, inverse } from "../webgl/utils.js";
import Vec2 from "../utils/vec2.js";
import { lerp } from "../utils/utils.js";
import SpriteRenderer from "./spriteRenderer.js";
import ShapeRenderer from "./shapeRenderer.js";

const VIRTUAL_SIZE = 1000;

export default class Camera {

    constructor(canvas) {

        this.position = new Vec2();
        this.zoom = 1;
        this.rotation = 0;

        this.bounds = {}
        this.combined = [];

        if (canvas) {
            this.setCanvas(canvas);
        }
    }

    setCanvas(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('webgl2', { antialias: false });
        this.context.webkitImageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;
        this.context.imageSmoothingEnabled = false;

        this.canvas.style.cssText = 'image-rendering: optimizeSpeed;' + // FireFox < 6.0
                                    'image-rendering: -moz-crisp-edges;' + // FireFox
                                    'image-rendering: -o-crisp-edges;' +  // Opera
                                    'image-rendering: -webkit-crisp-edges;' + // Chrome
                                    'image-rendering: crisp-edges;' + // Chrome
                                    'image-rendering: -webkit-optimize-contrast;' + // Safari
                                    'image-rendering: pixelated; ' + // Future browsers
                                    '-ms-interpolation-mode: nearest-neighbor;'; // IE

        this.spriteRenderer = new SpriteRenderer(this.context);
        this.shapeRenderer  = new ShapeRenderer(this.context);
        return this;
    }

    clearScreen() {
        // Clear screen
        this.context.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear buffer
        this.context.clear(this.context.COLOR_BUFFER_BIT);
    }

    update() {

        const cw = this.canvas.clientWidth;
        const ch = this.canvas.clientHeight;
        if (cw > ch) { // aspect ratio
            this.width = VIRTUAL_SIZE;
            this.height = VIRTUAL_SIZE * (ch / cw);
        } else {
            this.width = VIRTUAL_SIZE * (cw / ch);
            this.height = VIRTUAL_SIZE;
        }
        this.canvas.width  = this.width;
        this.canvas.height = this.height;

        // Update bounds
        const w = this.width / this.zoom;
        const h = this.height / this.zoom;
        const hw = w * 0.5;
        const hh = h * 0.5;

        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);

        const absCos = Math.abs(cos);
        const absSin = Math.abs(sin);

        let x = absCos * hw + absSin * hh;
        let y = absCos * hh + absSin * hw;

        this.bounds.x1 = this.position.x - x;
        this.bounds.y1 = this.position.y - y;
        this.bounds.x2 = this.position.x + x;
        this.bounds.y2 = this.position.y + y;
        this.bounds.width  = w;
        this.bounds.height = h;
        // this.bounds.hw = hw;
        // this.bounds.hh = hh;

        // Update combined matrix
        this.projection = createOrtho(
            -hw, hw,
            -hh, hh,
            0, 1); // near, far

        // Rotation (z)
        const rotation = [
             cos, sin, 0, 0,
            -sin, cos, 0, 0,
               0,   0, 1, 0,
               0,   0, 0, 1,
        ]

        x = this.position.x;
        y = this.position.y;

        // Translation (x, y)
        const translation = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, 0, 1,
        ];

        // inv(T * R)

        const trans = inverse(multiply(translation, rotation));
        multiply(this.projection, trans, this.combined);

    }

    follow(position, mapSize, dt) {
        const hw = this.bounds.width  * 0.5;
        const hh = this.bounds.height * 0.5;
        if (dt == undefined) {
            dt = 1;
        }
        this.position.x = Math.max(lerp(this.position.x, position.x, dt), hw );
        this.position.x = Math.min(this.position.x, mapSize.width - hw);
        this.position.y = Math.max(lerp(this.position.y, position.y, dt), hh);
        this.position.y = Math.min(this.position.y, mapSize.height - hh);
    }

}