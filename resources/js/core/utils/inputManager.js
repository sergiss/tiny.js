import Vec2 from "../utils/vec2.js";

class Input {

    constructor() {
        this.pressed = false;
        this.justPressed = false;
    }

    setPressed(pressed) {        
        if(pressed && !this.pressed) {
            this.justPressed = pressed;
        }
        this.pressed = pressed;
    }

}

export default class InputManager {

    constructor(canvas) {

        this.element = canvas;

        this.inputs = {};
        this.mousePosition = new Vec2();

        window.addEventListener("keydown", (e)=> {
            // console.log(e.code)
            this.setPressed(e.code, true);
        }, false)

        window.addEventListener("keyup", (e)=> {
            this.setPressed(e.code, false);
        }, false)

        canvas.addEventListener("mousedown", (e)=> {
            const button = this.setPressed(e.button, true);
            if(button) {
                button.mousePosition.set(this.mousePosition);
            }
            e.preventDefault();
        }, false)

        canvas.addEventListener("mouseup", (e)=> {
            this.setPressed(e.button, false);
            e.preventDefault();
        }, false)

        canvas.addEventListener("mousemove", (e)=> {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const scaleX = canvas.width  / rect.width;
            const scaleY = canvas.height / rect.height;
            this.mousePosition.set(x * scaleX, y * scaleY);
        }, false)

        canvas.addEventListener("mouseleave", (e)=> {
            for(let i = 0; i < 3; ++i) {
                this.setPressed(i, false);
            }
        }, false)

        canvas.addEventListener('contextmenu', (e)=> { 
            e.preventDefault();
        }, false);
        
        this.hideMouse(true);

    }

    hideMouse(hide) {
        this.element.style.cursor = hide ? 'none'  : 'default';
    }

    update() {
        for(const key in this.inputs) {
            this.inputs[key].justPressed = false;
        }
    }
    
    setPressed(code, pressed) {
        let value = this.inputs[code];
        if(value) {
            value.setPressed(pressed);
        }
        return value;
    }

    remove(code) {
        delete this.inputs[code];
    }

    get(code) {
        return this.inputs[code];
    }

    obtain(code) {
        let result = this.inputs[code];
        if(!result) {
            result = new Input();
            if(this.isButton(code)) {
                result.mousePosition = new Vec2();
            }
            this.inputs[code] = result;
        }
        return result;
    }

    isButton(code) {
        return code > -1 && code < 4;
    }

}