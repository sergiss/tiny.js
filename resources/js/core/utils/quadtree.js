/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Vec2 from "./vec2.js";
import AABB from "./aabb.js";

export class Quadtree {

    static MAX_DEPTH   = 16;
    static MAX_OBJECTS =  8;

    constructor(aabb, depth = 0) {
        this.aabb = aabb;
        this.depth = depth;
        this.nodes = [];
        this.data  = [];
    }
    
    split() { // create child nodes

        const d = this.depth + 1;
        const hw = this.aabb.getWidth()  * 0.5;
        const hh = this.aabb.getHeight() * 0.5;
        const x1 = this.aabb.getMinX(), y1 = this.aabb.getMinY();
        const x2 = this.aabb.getMaxX(), y2 = this.aabb.getMaxY();

        const x1hw = x1 + hw;
        const y1hh = y1 + hh;

        this.nodes[0] = new Quadtree(new AABB(new Vec2(x1  , y1  ), new Vec2(x1hw, y1hh)), d); // top    - left
        this.nodes[1] = new Quadtree(new AABB(new Vec2(x1hw, y1  ), new Vec2(x2  , y1hh)), d); // top    - right
        this.nodes[2] = new Quadtree(new AABB(new Vec2(x1  , y1hh), new Vec2(x1hw, y2  )), d); // bottom - left
        this.nodes[3] = new Quadtree(new AABB(new Vec2(x1hw, y1hh), new Vec2(x2  , y2  )), d); // bottom - right
    
    }

    clear() { // Clear all data
        this.data  = [];
        this.nodes = [];
        this.depth = 0;
    }

    indexOf(aabb) { // Get index of cuadrant
        const cy = this.aabb.getMinY() + this.aabb.getHeight() * 0.5;
        if (aabb.getMaxY() < cy && aabb.getMinY() > this.aabb.getMinY()) { // top
            const cx = this.aabb.getMinX() + this.aabb.getWidth()  * 0.5;
            if (aabb.getMaxX() < cx && aabb.getMinX() > this.aabb.getMinX()) { // left
                return 0; // 0 0
            } else if (aabb.getMinX() > cx && aabb.getMaxX() < this.aabb.getMaxX()) { // right
                return 1; // 0 1
            }
        } else if (aabb.getMinY() > cy && aabb.getMaxY() < this.aabb.getMaxY()) { // bottom
            const cx = this.aabb.getMinX() + this.aabb.getWidth()  * 0.5;
            if (aabb.getMaxX() < cx && aabb.getMinX() > this.aabb.getMinX()) { // left
                return 2; // 1 0
            } else if (aabb.getMinX() > cx && aabb.getMaxX() < this.aabb.getMaxX()) { // right
                return 3; // 1 1
            }
        }
        return -1; // Overlaps areas
    }

    hasChildrens() {
        return this.nodes.length > 0;
    }

    insert(aabb) {
        let node = this;
        while(true) {
            if(node.hasChildrens()) {
                const index = node.indexOf(aabb);
                if(index >= 0) {
                    node = node.nodes[index];
                } else {
                    node.data.push(aabb);
                    break;
                }
            } else {
                node.data.push(aabb);
                if(node.data.length > Quadtree.MAX_OBJECTS && node.depth < Quadtree.MAX_DEPTH) {
                    node.split(); // Split cuadrant
                    // Move data to child nodes
                    for(let i = 0; i < node.data.length; ++i) {
                        const index = node.indexOf(node.data[i]);
                        if(index >= 0) {
                            node.nodes[index].data.push(node.data[i]);
                            node.data.splice(i, 1);
                            --i;
                        }
                    }
                }
                break;
            }
        }        
    }

    update(aabb) {
        this.remove(aabb);
        this.insert(aabb);
    }

    iterate(aabb, iterator) {
        const stack = [this];
        do {
            const node = stack.pop();
            // Iterate data in cuadrant
            for(let i = 0; i < node.data.length; ++i) {
                if(iterator(node.data[i])) return;
            }
            // Iterate child nodes (sub cuadrants)
            for(let i = 0; i < node.nodes.length; ++i) {
                if(node.nodes[i].aabb.intersects(aabb)) {
                    stack.push(node.nodes[i]);
                }
            }
        } while(stack.length > 0);
    }

    nodeOf(aabb) {
        const stack = [this];
        do {
            const node = stack.pop();
            // Iterate data in cuadrant
            for(let i = 0; i < node.data.length; ++i) {
                if (this.data[i] === aabb) return this; // Found
            }
            // Iterate child nodes (sub cuadrants)
            for(let i = 0; i < node.nodes.length; ++i) {
                if(node.nodes[i].aabb.intersects(aabb)) {
                    stack.push(node.nodes[i]);
                }
            }
        } while(stack.length > 0);
        return null;
    }

       
    debug2(renderer, data) {
  
        if(data) {
            for(let i = 0; i < this.data.length; ++i) {
                if(this.data[i].debug) {    
                    renderer.color = 0xFFFF00FF;            
                    this.data[i].debug(renderer);
                }
            }
        }
        renderer.color = 0xFF00FFFF;
        this.aabb.debug(renderer);
       
        for(let i = 0; i < this.nodes.length; ++i) {
            this.nodes[i].debug(renderer, data);
        }

    }

    debug(renderer, renderNodes = true) {
        const stack = [this];
        do {
            const node = stack.pop();
            renderer.color = 0xFFFF00FF;     
            // Iterate data in cuadrant
            for(let i = 0; i < node.data.length; ++i) {               
                if(node.data[i].debug) {  
                    node.data[i].debug(renderer);
                }
            }
            if (renderNodes) {
                renderer.color = 0xFF00FFFF;
                node.aabb.debug(renderer);
            }
            // Iterate child nodes (sub cuadrants)
            for(let i = 0; i < node.nodes.length; ++i) {
                stack.push(node.nodes[i]);
            }
        } while(stack.length > 0);
    }

}