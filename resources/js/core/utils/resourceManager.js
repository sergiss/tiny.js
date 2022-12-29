import Font from "./font.js";
import Texture from "../webgl/texture.js";
import { createGlTexture } from "../webgl/utils.js";
import Map from "./map.js";

export default class ResourceManager {

    constructor() {
        this.resources = {};
        this.imagePromises = [];
        this.promises = [];
    }

    loadTexture(id, src = id) {

        if (this.resources[id]) return;

        if (typeof src === "function") {
            this.imagePromises.push(src()); // custom image loader
        } else {
            this.imagePromises.push(new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => {
                    resolve(image);
                };
                image.onerror = reject;
                image.src = src;
                image.id = id;
            }));
        }

    }

    loadFont(id, src = id) {

        if (this.resources[id]) return;
        
        this.promises.push(new Promise((resolve, reject) => {
            
            fetch(src).then(response => response.json()).then(data => {
                
                const path = src.substring(0, src.lastIndexOf("/") + 1);
                this.loadTexture(data.src, path + data.src);
                resolve(() => {
    
                    const texture = this.get(data.src);
                    const { width, height } = texture.data;
    
                    const uv = texture.uv;
                    const w = 1 / data.columns * (width / texture.glTexture.image.width);
                    const h = 1 / data.rows * (height / texture.glTexture.image.height);
    
                    const charset = [];
                    for (let j, i = 0; i < data.columns; ++i) {
                        const u0 = uv.u0 + i * w;
                        const u1 = u0 + w;
                        for (j = 0; j < data.rows; ++j) {
                            const v0 = uv.v0 + j * h;
                            const v1 = v0 + h;
                            charset[j * data.columns + i] = {
                                u0, v0,
                                u1, v1,
                            }
                        }
                    }
    
                    const font = new Font();
                    font.color = data.defaultColor || font.color;
                    font.charset = charset;
                    font.texture = texture;
                    font.charWidth = width / data.columns;
                    font.charHeight = height / data.rows;
                    this.resources[id] = font;
                });

            });
           
        }));

    }

    loadMap(id, src = id) {
        const map = new Map();
        this.resources[id] = map;
        this.promises.push(map.load(src, this) // add Promise
        .then(()=> (()=> map.initialize(this)))); // add function to be called after Promise resolves
    }

    get(id) {
        return this.resources[id];
    }

    async load(gl) {

        const result = await Promise.all(this.promises);
        this.promises = [];

        await this.packImages(gl);
        this.imagePromises = [];

        for (const r of result) {
            if (typeof r === "function") r();
        }
       
    }

    async packImages(gl, spacing = 0) {

        const images = await Promise.all(this.imagePromises);
        if (images.length < 1) return;

        const boxes = [];
        // calculate total box area and maximum box width
        let area = 0;
        let maxWidth = 0;

        for (const image of images) {
            const box = {
                width: image.width + spacing,
                height: image.height + spacing,
                image: image
            };
            boxes.push(box);
            area += box.width * box.height;
            maxWidth = Math.max(maxWidth, box.width);
        }

        // sort the boxes for insertion by height, descending
        boxes.sort((a, b) => b.height - a.height);

        // aim for a squarish resulting container,
        // slightly adjusted for sub-100% space utilization
        const startWidth = Math.max(Math.ceil(Math.sqrt(area / 0.95)), maxWidth);

        // start with a single empty space, unbounded at the bottom
        const spaces = [{ x: 0, y: 0, width: startWidth, height: Infinity }];

        let width = 0;
        let height = 0;

        for (const box of boxes) {
            // look through spaces backwards so that we check smaller spaces first
            for (let i = spaces.length - 1; i >= 0; i--) {
                const space = spaces[i];

                // look for empty spaces that can accommodate the current box
                if (box.width > space.width || box.height > space.height) continue;

                // found the space; add the box to its top-left corner
                // |-------|-------|
                // |  box  |       |
                // |_______|       |
                // |         space |
                // |_______________|
                box.x = space.x + spacing;
                box.y = space.y + spacing;

                height = Math.max(height, box.y + box.height);
                width = Math.max(width, box.x + box.width);

                if (box.width === space.width && box.height === space.height) {
                    // space matches the box exactly; remove it
                    const last = spaces.pop();
                    if (i < spaces.length) spaces[i] = last;

                } else if (box.height === space.height) {
                    // space matches the box height; update it accordingly
                    // |-------|---------------|
                    // |  box  | updated space |
                    // |_______|_______________|
                    space.x += box.width;
                    space.width -= box.width;

                } else if (box.width === space.width) {
                    // space matches the box width; update it accordingly
                    // |---------------|
                    // |      box      |
                    // |_______________|
                    // | updated space |
                    // |_______________|
                    space.y += box.height;
                    space.height -= box.height;

                } else {
                    // otherwise the box splits the space into two spaces
                    // |-------|-----------|
                    // |  box  | new space |
                    // |_______|___________|
                    // | updated space     |
                    // |___________________|
                    spaces.push({
                        x: space.x + box.width,
                        y: space.y,
                        width: space.width - box.width,
                        height: box.height
                    });
                    space.y += box.height;
                    space.height -= box.height;
                }
                break;
            }
        }

        const image = await new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            for (const box of boxes) {
                ctx.drawImage(box.image, box.x, box.y, box.width, box.height);
            }
            const image = new Image();
            image.src = canvas.toDataURL();
            image.onload = () => {
                resolve(image);
            };
        });

        const glTexture = createGlTexture(gl, image);
        for (const box of boxes) {
            const texture = new Texture(glTexture);
            texture.uv.u0 = box.x / width;
            texture.uv.u1 = texture.uv.u0 + box.width / width;
            texture.uv.v0 = box.y / height;
            texture.uv.v1 = texture.uv.v0 + box.height / height;
            texture.data = box;
            this.resources[box.image.id] = texture;
        }

    }

} 