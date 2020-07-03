import Initial from "../Initial";
import {new2D} from '../Utils';

export const [ASSIGN_GLYPHSET, SET_WIDTH, SET_HEIGHT, ASSIGN_LETTER, ADD_GLYPH] = [...Array(99).keys()];

const Reducer = (state = Initial.glyphsState, {type, payload}) => {
    switch (type) {

        case ASSIGN_LETTER:
            console.log(state, payload);
            return {...state, glyphs: state.glyphs.map(glyph =>
                (glyph.letter === payload.oldLetter)
                    ? {...glyph, letter: payload.newLetter}
                    : glyph
            )};

        case SET_WIDTH:
            return {...state, width: payload};

        case SET_HEIGHT:
            return {...state, height: payload};

        case ASSIGN_GLYPHSET:
            return {...state, title: payload};

        case ADD_GLYPH:
            return {...state, glyphs: [...state.glyphs, new Glyph('')]};

        default:
            return state;
    }
}

export default Reducer;

class Glyph {
    constructor(letter, width, height, pixels) {
        this.letter = letter;
        this.width = width;
        this.height = height;
        this.pixels = pixels || new2D(width, height);
    }
}

export const aliases = {
    '': '<undefined>',
    ' ': '<space>',
}