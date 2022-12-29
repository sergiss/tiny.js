export default class Texture {

    constructor(glTexture) {
        this.glTexture = glTexture;
        this.uv = {
            u0: 0, v0: 0, 
            u1: 1, v1: 1,
        }
    }

}