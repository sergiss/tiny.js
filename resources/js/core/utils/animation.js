/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

import Vec2 from "../vec2.js";

export class ClipArray {

    constructor(frames, props) {

        this.frames = frames;

        const { frameTime = 0.1, direction = 1, offX = 0, offY = 0, startTime = 0 } = props || {};

        this.index = 0;
        this.frameIndex = frames[0];
        this.frameTime = frameTime;
        this.startTime = startTime;
        this.direction = direction;
        this.offX = offX;
        this.offY = offY;

        this.rewind();

    }

    update() {
        this.time += 0.016;
        if (this.time > this.frameTime) {
          this.time = 0;
          this.index += this.direction;
          if (this.index >= this.frames.length) {
            this.index = 0;
          } else if (this.index < 0) {
            this.index = this.frames.length - 1;
          }
          this.frameIndex = this.frames[this.index];
          return true;
        }
        return false;
      }
    
      rewind() {
        this.index = 0;
        this.time = this.startTime;
      }
    
      isLastFrame() {
        return this.index === this.frames.length;
      }

}

export class Clip {

  constructor(startFrame, endFrame, props) {

    const { frameTime = 0.1, direction = 1, offX = 0, offY = 0, startTime = 0 } = props || {};

    this.startFrame = startFrame;
    this.endFrame = endFrame;
    this.frameTime = frameTime;
    this.startTime = startTime;
    this.direction = direction;
    this.offX = offX;
    this.offY = offY;

    this.rewind();
  }

  update() {
    this.time += 0.016;
    if (this.time > this.frameTime) {
      this.time = 0;
      this.frameIndex += this.direction;
      if (this.frameIndex > this.endFrame) {
        this.frameIndex = this.startFrame;
      } else if (this.frameIndex < this.startFrame) {
        this.frameIndex = this.endFrame;
      }
      return true;
    }
    return false;
  }

  rewind() {
    this.frameIndex = this.startFrame;
    this.time = this.startTime;
  }

  isLastFrame() {
    return this.frameIndex === this.endFrame;
  }

}

export default class Animation {

    constructor(texture, cols, rows) {

        this.texture = texture;
        this.frames = [];

        const { width, height } = this.texture.data;

        this.tw = width / cols;
        this.th = height / rows;

        const uv = this.texture.uv;
        const w = 1 / cols * (width  / this.texture.glTexture.image.width);
        const h = 1 / rows * (height / this.texture.glTexture.image.height);

        for (let j, i = 0; i < cols; ++i) {
            const u0 = uv.u0 + i * w;
            const u1 = u0 + w;
            for (j = 0; j < rows; ++j) {
                const v0 = uv.v0 + j * h;
                const v1 = v0 + h;
                this.frames[j * cols + i] =
                {
                    u0, u1, v0, v1
                };
            }
        }

        this.clips = {};
        this.currentClip = null;

        this.flipHorizontal = false;
        this.flipVertical   = false;
        
        this.scale = new Vec2(1, 1);

        this.rotation = 0;
        
    }

    setScale(x, y = x) {
      this.scale.set(x, y);
      return this;
    }

    getClip(id) {
        return this.clips[id]; 
    }

    create(id, startFrame = 0, endFrame = 0, props) {
        this.clips[id] = new Clip(startFrame, endFrame, props);
        return this;
    }

    remove(id) {
        const clip = this.clips[id];
        delete this.clips[id];
        if(this.currentClip === clip) {
            this.currentClip = null;
        }
    }

    stop(rewind) {
        this.playing = false;
        if(rewind) this.rewind();
        return this;
    }

    play(id, callback) {
        this.playing = true;
        this.currentClip = this.clips[id];
        this.callback = callback;
        return this;
    }

    rewind() {
        if(this.currentClip) {
            this.currentClip.rewind();
        }
    }

    clear() { // Clear all clips
        this.clips = {};
        this.currentClip = null;
    }

    getWidth() {
        return this.tw * this.scale.x;
    }

    getHeight() {
        return this.th * this.scale.y;
    }

    update () {
        if(this.playing && 
        this.currentClip?.update()) {            
            if(this.callback && this.currentClip.isLastFrame()) {
                this.callback();
            }          
        }
    }

    render(camera, x, y) {
        if(this.currentClip) {
          const tw = this.getWidth();
          const th = this.getHeight();
          const frame = this.frames[this.currentClip.frameIndex];
          camera.spriteRenderer.draw({
              glTexture: this.texture.glTexture,
              uv: frame,
              x: x + this.currentClip.offX, y: y + this.currentClip.offY,
              width: tw, height: th,
              originX: tw * 0.5, originY: th * 0.5,
              scaleX: this.scale.x, scaleY: this.scale.y,
              flipX: this.flipHorizontal,
              flipY: this.flipVertical,
              rotation: this.rotation
          });            
        }
    }

}
