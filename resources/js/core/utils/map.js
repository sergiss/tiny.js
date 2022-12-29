import Body from "../physics/body.js";
import Polygon from "../physics/polygon.js";
import Loader from "./loader.js";
import { extrudeTileset } from "./tilesetExtruder.js";

const MIN_SPACING = 2;

export default class Map extends Loader {

    static BACKGROUND = "Background";
    static COLLISION = "Collisions";
    static FRONT = "Front";

    static GROUP_A = [Map.BACKGROUND, Map.COLLISION];
    static GROUP_B = [Map.FRONT];

    constructor() {
        super();

        this.objects = {};
        this.layerMap = {};
        this.layerList = [];

        this.animationClips = {};
    }

    async load(src, manager) {
        const path = src.substring(0, src.lastIndexOf("/") + 1);

        let response = await fetch(src);
        let responseText = await response.text();
        const text = responseText.replace(".tsj", ".json");
        const json = JSON.parse(text);
        this.tileSize = json.tilewidth;
        this.width = json.width;
        this.height = json.height;
        const n = json.layers.length;
        for (let index = 0, i = 0; i < n; ++i) {
            const tmp = json.layers[i];
            if (tmp.type === "tilelayer") {
                const layer = {
                    id: tmp.id,
                    name: tmp.name,
                    visible: tmp.visible,
                    data: tmp.data
                }
                for (let j = 0; j < layer.data.length; ++j) {
                    layer.data[j]--;
                }
                this.layerList[index++] = this.layerMap[layer.name] = layer;
            } else if (tmp.type === "objectgroup") {
                let objs = tmp.objects;
                for (let i = 0; i < objs.length; ++i) {
                    const obj = objs[i];
                    if (obj.type == null) obj.type = obj.class;
                    if (obj.type == null || !obj.type.length) obj.type = obj.name;
                    let list = this.objects[obj.type];
                    if (list == null) {
                        list = [];
                        this.objects[obj.type] = list;
                    }

                    obj.getProperty = function (key) {
                        if (obj.properties == null) return null;
                        for (let i = 0; i < obj.properties.length; ++i) {
                            let property = obj.properties[i];
                            if (key === property.name) {
                                return property.value;
                            }
                        }
                    };

                    list.push(obj);
                }
            }
        }

        if (json.tilesets[0].source) {
            response = await fetch(path + json.tilesets[0].source);
            responseText = await response.text();
            this.tileset = JSON.parse(responseText);
        } else {
            this.tileset = json.tilesets[0];
        }

        manager.loadTexture(this.tileset.image, async () => { // custom image loader
            // load image
            let image = await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    resolve(img);
                }
                img.src = path + this.tileset.image;
            });

            if (this.tileset.rows == null) {
                this.tileset.rows = Math.ceil((image.height - this.tileset.margin * 2) / (this.tileset.spacing + this.tileSize));
            }

            // check tile extrusion
            if (this.tileset.spacing == 0
                && this.tileset.margin == 0) {

                const canvas = extrudeTileset(image, this.tileset.columns, this.tileset.rows, MIN_SPACING);

                image = await new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        resolve(img);
                    }
                    img.src = canvas.toDataURL();
                });

                this.tileset.spacing = MIN_SPACING << 1;
                this.tileset.margin = MIN_SPACING;

            }

            image.id = this.tileset.image;
            return image;

        });

    }

    initialize(manager) {
        this.texture = manager.get(this.tileset.image);
        this.updateTileCache();
    }

    updateTileCache() {

        this.tileCache = [];

        const { width, height } = this.texture.data;

        const fx = width / this.texture.glTexture.image.width;
        const fy = height / this.texture.glTexture.image.height;

        const w = (1 / this.tileset.columns) * fx;
        const h = (1 / this.tileset.rows) * fy;

        const mx = this.tileset.margin / width * fx;
        const my = this.tileset.margin / height * fy;

        const sx = this.tileset.spacing / width * fx;
        const sy = this.tileset.spacing / height * fy;

        const uv = this.texture.uv;

        for (let i = 0; i < this.tileset.columns; ++i) {
            const u0 = uv.u0 + i * w + mx;
            const u1 = u0 + w - sx;
            for (let j = 0; j < this.tileset.rows; ++j) {
                const v0 = uv.v0 + j * h + my;
                const v1 = v0 + h - sy;
                this.tileCache[j * this.tileset.columns + i] = {
                    u0, v0,
                    u1, v1,
                }
            }
        }
        
    }

    update() {
        for (const key in this.animationClips) {
            this.animationClips[key].update();
        }
    }

    getAnimationFrame(index) {
        if (this.animationClips[index]) {
            return this.animationClips[index].frameIndex;
        }
        return index;
    }

    render(camera, ids) {

        const { spriteRenderer, bounds } = camera;

        const ts = this.tileSize; // Tile size
        // const hts = this.tileSize * 0.5;

        const x1 = Math.max(0, Math.floor(bounds.x1 / ts));
        const y1 = Math.max(0, Math.floor(bounds.y1 / ts));
        const x2 = Math.min(this.width, Math.ceil(bounds.x2 / ts));
        const y2 = Math.min(this.height, Math.ceil(bounds.y2 / ts));

        for (let x, y, layer, i = 0; i < ids.length; ++i) { // Iterate layers
            layer = this.layerMap[ids[i]];
            if (layer?.visible) {
                const data = layer.data;
                for (y = y1; y < y2; ++y) {
                    const index = y * this.width;
                    for (x = x1; x < x2; ++x) {
                        let v = data[index + x];
                        if (v > -1) { // if has tile
                            v = this.getAnimationFrame(v);
                            spriteRenderer.draw({
                                glTexture: this.texture.glTexture,
                                uv: this.tileCache[v],
                                x: x * ts,
                                y: y * ts,
                                //originX: hts, originY: hts,
                                width: ts, height: ts
                            });
                        }
                    }
                }
            }
        }

    }

    createCollisionBodies(world, layerId) {
            
            const ts = this.tileSize; // Tile size
            const hts = this.tileSize * 0.5;

            const shape = Polygon.createBox(ts, ts);

            const hasNeighbors = (x, y, data) => {
                const index = y * this.width;
                return (x > 0 && data[index + x - 1] > -1)
                    && (x < this.width - 1 && data[index + x + 1] > -1)
                    && (y > 0 && data[index + x - this.width] > -1)
                    && (y < this.height - 1 && data[index + x + this.width] > -1);
            }
    
            const layer = this.layerMap[layerId];
            const data = layer.data;
            for (let x, y, i = 0; i < data.length; ++i) {
                y = Math.floor(i / this.width);
                x = i % this.width;
                if (data[i] > -1 && !hasNeighbors(x, y, data)) { // if has tile
                   const body = new Body(shape);
                   body.position.set(x * ts + hts, y * ts + hts);
                   body.setMass(0);
                   world.add(body);
                }
            }
    
    }

    getSize() {
        const ts = this.tileSize; // Tile size
        return {
            width: this.width * ts,
            height: this.height * ts
        };
    }

}