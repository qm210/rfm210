import * as Glyph from './GlyphModel';
import Initial from "./Initial";
import {new2D, update2D, at2D, fill2D, size2D, clone2D, resize2D} from "./Utils";

export const [TOGGLE_PIXEL, SET_PIXEL, FILL_AREA, CLEAR_ALL_PIXELS, FILL_ALL_PIXELS, OVERWRITE_PIXELS,
    ENTER_DRAGMODE, LEAVE_DRAGMODE, SET_GLYPH_SIZE,
    SHIFT_LEFT, SHIFT_RIGHT, SHIFT_UP, SHIFT_DOWN,
    CLEAR_GLYPHSETS, APPEND_GLYPHSET, PURGE_GLYPHSETS, ASSIGN_GLYPHSET, ASSIGN_LETTER, ADD_GLYPH, COPY_GLYPH,
    LOAD_GLYPH, UPDATE_SCENE, UPDATE_PHRASE, SET_DEFINES,
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
    const pixels = currentPixels(state);
    switch (type) {
        case SET_PIXEL:
            return withUpdatedPixels(state, update2D(pixels, payload, payload.value));
        case TOGGLE_PIXEL:
            return withUpdatedPixels(state, update2D(pixels, payload, !at2D(pixels, payload)));
        case FILL_AREA:
            return withUpdatedPixels(state, fillConnectedArea(pixels, payload));
        case CLEAR_ALL_PIXELS:
            return withUpdatedPixels(state, fill2D(pixels, false));
        case FILL_ALL_PIXELS:
            return withUpdatedPixels(state, fill2D(pixels, true));

        case ENTER_DRAGMODE:
            return {...state, dragMode: true, dragValue: payload.value};
        case LEAVE_DRAGMODE:
            return {...state, dragMode: false};

        case SET_GLYPH_SIZE:
            return {
                ...state,
                glyphset: {
                    ...state.glyphset,
                    glyphs: state.glyphset.glyphs.map(glyph =>
                        glyph.id === state.glyphId
                            ? {
                                ...glyph,
                                ...payload,
                                pixels: resize2D(pixels, payload.width, payload.height)
                            } : glyph
                    )
                }
            }

        case SHIFT_LEFT:
            pixels.map(row => {
                row.push(row.shift());
                return row;
            });
            return withUpdatedPixels(state, pixels);

        case SHIFT_RIGHT:
            pixels.map(row => {
                row.unshift(row.pop());
                return row;
            });
            return withUpdatedPixels(state, pixels);

        case SHIFT_UP:
            pixels.push(pixels.shift());
            return withUpdatedPixels(state, pixels);

        case SHIFT_DOWN:
            pixels.unshift(pixels.pop());
            return withUpdatedPixels(state, pixels);

        case OVERWRITE_PIXELS:
            return withUpdatedPixels(state, payload);

        case APPEND_GLYPHSET:
            return state; // NOT IMPLEMENTED YET

        case CLEAR_GLYPHSETS:
            return state; // NOT IMPLEMENTED YET

        case PURGE_GLYPHSETS:
            return state; // NOT IMPLEMENTED YET

        case ASSIGN_LETTER:
            const newGlyph = state.glyphset.glyphs.find(glyph => glyph.id === state.glyphId);
            newGlyph.letter = payload;
            return {
                ...state,
                glyphset: {
                    ...state.glyphset,
                    glyphs: state.glyphset.glyphs.map(glyph =>
                        glyph.id === state.glyphId ? newGlyph : glyph
            )}};

        case ASSIGN_GLYPHSET:
            return {...state, title: payload};

        case ADD_GLYPH:
            return withAddedGlyph(state, Glyph.newFrom(currentGlyph(state)));

        case COPY_GLYPH:
            return withAddedGlyph(state, Glyph.copyFrom(currentGlyph(state)));

        case LOAD_GLYPH:
            return {
                ...state,
                glyphId: +payload
            };

        case UPDATE_SCENE:
            return withUpdatedScene(state, payload);

        case UPDATE_PHRASE:
            return withUpdatedPhrase(state, payload);

        case SET_DEFINES:
            return {...state, defines: payload};

        default:
            return state;
    }
}

export default Reducer;

export const currentGlyph = state => state.glyphset.glyphs.find(glyph => glyph.id === state.glyphId);

export const currentPixels = state => currentGlyph(state) ? currentGlyph(state).pixels : new2D(0,0);

export const currentScene = state => state.scenes.find(scene => scene.id === state.sceneId);

export const currentPhrase = state => currentScene(state).phrases.find(phrase => phrase.id === state.phraseId);

export const glyphForLetter = (glyphset, letter) => glyphset.glyphs.find(
    glyph => glyph.letter === letter
) || Glyph.placeholder(Initial.width, Initial.height, letter !== ' ');

const withUpdatedPixels = (state, pixels) => ({
    ...state,
    glyphset: {
        ...state.glyphset,
        glyphs: state.glyphset.glyphs.map(glyph =>
            Glyph.withPixelsIfMatch(glyph, state.glyphId, pixels)
        )
    }
});

const withAddedGlyph = (state, glyph) => {
    glyph.id = state.glyphset.glyphs.length;
    return {
        ...state,
        glyphset: {
            ...state.glyphset,
            glyphs: [
                ...state.glyphset.glyphs,
                glyph
            ]
    }};
};

const withUpdatedScene = (state, sceneUpdate) => ({
    ...state,
    scenes: state.scenes.map(scene =>
        scene.id === state.sceneId
            ? {...scene, ...sceneUpdate}
            : scene
        )
});

const withUpdatedPhrase = (state, phraseUpdate) => ({
    ...state,
    scenes: state.scenes.map(scene =>
        scene.id === state.sceneId
            ? {
                ...scene,
                phrases: scene.phrases.map(phrase =>
                    phrase.id === state.phraseId
                        ? {...phrase, ...phraseUpdate}
                        : phrase
            )}
        : scene
    )
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
