export default class Vec2 {

    constructor(x = 0, y) {
        this.set(x, y);
    }

    set(x, y) {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y == null){
            y = x;
        }
        this.x = x;
        this.y = y;
        return this;
    }

    add(x, y) {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y == null){
            y = x;
        }
        this.x += x;
        this.y += y;
        return this;
    }

    addScl(v, scl) {
        this.x += v.x * scl;
        this.y += v.y * scl;
        return this;
    }

    sub(x, y) {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y == null){
            y = x;
        }
        this.x -= x;
        this.y -= y;
        return this;
    }

    subScl(v, scl) {
        this.x -= v.x * scl;
        this.y -= v.y * scl;
        return this;
    }

    scl(x, y) {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y == null){
            y = x;
        }
        this.x *= x;
        this.y *= y;
        return this;
    }

    div(x, y) {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y == null){
            y = x;
        }
        this.x /= x;
        this.y /= y;
        return this;
    }

    negate() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    crs(x, y) {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y == null){
            y = x;
        }
        return this.x * y - this.y * x;
    }

    dot(x, y) {
        if (x instanceof Vec2) {
          return this.x * x.x + this.y * x.y;
        }
        return this.x * x + this.y * (y === undefined ? x : y);
    }

    dst2(x, y) {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y == null) {
            y = x;
        }
        const dx = this.x - x;
        const dy = this.y - y;
        return dx * dx + dy * dy;
    }

    dst(x, y) {
        return Math.sqrt(this.dst2(x, y));
    }

    len() {
        return Math.sqrt(this.len2());
    }

    len2() {
        return this.x * this.x + this.y * this.y;
    }

    nor() {
        const len = this.len();
        if (len != 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }

    min(x, y) {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y == null) {
            y = x;
        }
        this.x = Math.min(this.x, x);
        this.y = Math.min(this.y, y);
        return this;
    }

    max(x, y) {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y == null) {
            y = x;
        }
        this.x = Math.max(this.x, x);
        this.y = Math.max(this.y, y);
        return this;
    }

    lerp(x, y, alpha) {
        if (x instanceof Vec2) {
            alpha = y;
            y = x.y;
            x = x.x;
        }
        this.x += (x - this.x) * alpha;
        this.y += (y - this.y) * alpha;
        return this;
    }

    mod(x, y) {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y == null) {
            y = x;
        }
        this.x %= x;
        this.y %= y;
        return this;
    }

    rotate(radians) {
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const x = this.x;
        this.x = x * cos - this.y * sin;
        this.y = x * sin + this.y * cos;
        return this;
    }

    isZero() {
        return this.x === 0 && this.y === 0;
    }

    copy() {
        return new Vec2(this);
    }

}