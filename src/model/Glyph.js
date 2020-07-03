import {new2D} from '../Utils';

export default class Glyph {
    constructor(id) {
        this.id = id;
        this.letter = '';
        this.pixels = null;
    }

    newFrom(glyph) {
        this.width = glyph.width;
        this.height = glyph.height;
        this.pixels = new2D(glyph.width, glyph.height);
        return this;
    }

    copyFrom(glyph) {
        this.width = glyph.width;
        this.height = glyph.height;
        this.pixels = glyph.pixels;
        return this;
    }

    get alias() {
        if (this.letter === '') {
            return '<undefined>';
        }
        else if (this.letter === ' ') {
            return '<space>';
        }
        return this.letter;
    }
}