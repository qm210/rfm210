import Glyph from './model/Glyph';
import Initial from "./Initial";
import {update2D, at2D, fill2D, size2D, clone2D} from "./Utils";

export const [TOGGLE_PIXEL, SET_PIXEL, FILL_AREA, CLEAR_ALL_PIXELS, FILL_ALL_PIXELS, OVERWRITE_PIXELS,
    ENTER_DRAGMODE, LEAVE_DRAGMODE, SET_GLYPH_WIDTH, SET_GLYPH_HEIGHT, SHIFT,
    CLEAR_GLYPHSETS, APPEND_GLYPHSET, PURGE_GLYPHSETS, ASSIGN_GLYPHSET, ASSIGN_LETTER, ADD_GLYPH, COPY_GLYPH,
    LOAD_GLYPH
] = [...Array(999).keys()];

export const togglePixel = (coord) => ({type : TOGGLE_PIXEL, payload: coord});
export const setPixel = (coord, value) => ({type: SET_PIXEL, payload: {...coord, value}});
export const fillArea = (coord, value) => ({type: FILL_AREA, payload: {...coord, value}});
export const clearAllPixels = () => ({type: CLEAR_ALL_PIXELS});
export const fillAllPixels = () => ({type: FILL_ALL_PIXELS});
export const overwritePixels = (pixels) => ({type: OVERWRITE_PIXELS, payload: pixels});
export const enterDragMode = (coord, value) => ({type: ENTER_DRAGMODE, payload: {...coord, value: value}});
export const leaveDragMode = () => ({type: LEAVE_DRAGMODE});

const Reducer = (state = Initial.state, {type, payload}) => {
    switch (type) {
        case SET_PIXEL:
            return {...state, pixels: update2D(state.pixels, payload, payload.value)};
        case TOGGLE_PIXEL:
            return {...state, pixels: update2D(state.pixels, payload, !at2D(state.pixels, payload))};
        case FILL_AREA:
            return {...state, pixels: fillConnectedArea(state.pixels, payload)};
        case CLEAR_ALL_PIXELS:
            return {...state, pixels: fill2D(state.pixels, false)};
        case FILL_ALL_PIXELS:
            return {...state, pixels: fill2D(state.pixels, true)};

        case ENTER_DRAGMODE:
            return {...state, dragMode: true, dragValue: payload.value};
        case LEAVE_DRAGMODE:
            return {...state, dragMode: false};

        case SET_GLYPH_WIDTH:
            return state; // NOT IMPLEMENTED YET
        case SET_GLYPH_HEIGHT:
            return state; // NOT IMPLEMENTED YET

        case SHIFT:
            return state; // NOT IMPLEMENTED YET

        case OVERWRITE_PIXELS:
            return {...state, pixels: payload};

        case APPEND_GLYPHSET:
            return state; // NOT IMPLEMENTED YET

        case CLEAR_GLYPHSETS:
            return state; // NOT IMPLEMENTED YET

        case PURGE_GLYPHSETS:
            return state; // NOT IMPLEMENTED YET

        case ASSIGN_LETTER:
            console.log(state, payload, state.currentLetter);
            const newGlyph = state.glyphset.glyphs.find(
                glyph => glyph.letter === state.currentLetter
            );
            newGlyph.letter = payload;
            return {
                ...state,
                currentLetter: payload,
                currentGlyph: newGlyph,
                glyphset: {
                    ...state.glyphset,
                    glyphs: state.glyphset.glyphs.map(glyph =>
                        (glyph.letter === state.currentLetter)
                            ? newGlyph
                            : glyph
            )}};

        case ASSIGN_GLYPHSET:
            return {...state, title: payload};

        case ADD_GLYPH:
            return addedGlyph(state, new Glyph().newFrom(state.currentGlyph));

        case COPY_GLYPH:
            return addedGlyph(state, new Glyph().copyFrom(state.currentGlyph));

        case SYNC_GLYPH:
            return {
                ...state,
                currentGlyph: state.glyphset.glyphs.find(glyph => glyph.letter === payload),
                currentLetter: payload
            };

        default:
            return state
    }
}

export default Reducer;

const addedGlyph = (state, glyph) => ({
    ...state,
    glyphset: {
        ...state.glyphset,
        glyphs: [
            ...state.glyphset.glyphs,
            glyph
        ]}
    });

const surroundingPixelList = ({row, column, width, height}) => {
    const surrounding = [];
    if (row > 0) {
        surrounding.push({row: row - 1, column});
    }
    if (row < height - 1) {
        surrounding.push({row: row + 1, column});
    }
    if (column > 0) {
        surrounding.push({row, column: column - 1});
    }
    if (column < width - 1) {
        surrounding.push({row, column: column + 1});
    }
    return surrounding;
}

const recursiveFindConnectedPixels = (holding, pixels, column, row, value) => {
    holding = [...holding, {row, column}];
    const surrounding = surroundingPixelList({column, row, ...size2D(pixels)});
    for (const coord of surrounding) {
        if (holding.some(item => item.column === coord.column && item.row === coord.row)
            || pixels[coord.row][coord.column] === value) {
            continue;
        }
        holding = recursiveFindConnectedPixels(holding, pixels, coord.column, coord.row, value);
    }
    return holding;
}

const fillConnectedArea = (pixels, {column, row, value}) => {
    const clonePixels = clone2D(pixels);
    const connectedPixels = recursiveFindConnectedPixels([], pixels, column, row, value);
    for (const pixel of connectedPixels) {
        clonePixels[pixel.row][pixel.column] = value;
    }
    return clonePixels;
}

// TODO NOT IMPLEMENTED YET OBV
/*
const shiftedPixels = (pixels, xShift, yShift) => {
    return pixels.map(row =>
        row.map(column =>
            column
            ));
}
*/