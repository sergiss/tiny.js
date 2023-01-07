/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Vec2 from "./vec2.js";
import AABB from "./aabb.js";

export class Quadtree {

    static MAX_DEPTH   = 16;
    static MAX_OBJECTS = 8;

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
        // Check capacity
        if(this.data.length > Quadtree.MAX_OBJECTS && this.depth < Quadtree.MAX_DEPTH) {
            let index;
            if(this.nodes.length === 0) { // Not has child nodes
                // Reorganize data
                this.split(); // Create child nodes
                // Move data to child nodes
                for(let i = 0; i < this.data.length;) {
                    index = this.indexOf(this.data[i]); // Find cuadrant
                    if(index > -1) {
                        this.nodes[index].insert(this.data[i]); // Insert to child node (data moved)
                        this.data.splice(i, 1); // Remove from current data                 
                    } else {
                        i++; // Next (data not moved)
                    }                   
                }
            }
                        
            index = this.indexOf(aabb); // Find cuadrant
            if(index > -1) {
                this.nodes[index].insert(aabb); // Insert to child node          
            } else {                
                this.data.push(aabb); // Add to data
                aabb.node = this;
            }
            
        } else { // Add to data
            this.data.push(aabb);
            aabb.node = this;
        }
    }

    remove(aabb) {
        if (aabb.node) {
            const index = aabb.node.data.indexOf(aabb);
            if (index > -1) {
                aabb.node.data.splice(index, 1);
                aabb.node = null;
                return true;
            }
        }
        return false;
    }

    update(aabb) {
        this.remove(aabb);
        this.insert(aabb);
    }

    iterate(aabb, iterator) {
        // Iterate data in cuadrant
        for(let i = 0; i < this.data.length; ++i) {
            if(iterator(this.data[i])) return;
        }
        // Iterate child nodes (sub cuadrants)
        for(let i = 0; i < this.nodes.length; ++i) {
            if(this.nodes[i].aabb.intersects(aabb)) {
                this.nodes[i].iterate(aabb, iterator);
            }
        }        
    }

    nodeOf(aabb) {
        // Iterate data in cuadrant
        for(let i = 0; i < this.data.length; ++i) {
            if (this.data[i] === aabb) return this; // Found
        }
        // Iterate child nodes (sub cuadrants)
        for(let i = 0; i < this.nodes.length; ++i) {
            if(this.nodes[i].aabb.intersects(aabb)) {
                const result = this.nodes[i].nodeOf(aabb);
                if (result) return result;
            }
        }   
        return null;
    }
    
    debug(renderer, data) {
  
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

}