import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { surfer } from '..';
import * as Glyph from '../GlyphModel';
import Initial, { initGlyph } from "../Initial";
import {new2D, update2D, at2D, fill2D, size2D, clone2D, resize2D} from "../Utils";
import { FAIL, IDLE, LOADING, OK } from '../const';

export const [TOGGLE_PIXEL, SET_PIXEL, FILL_AREA, CLEAR_ALL_PIXELS, FILL_ALL_PIXELS, OVERWRITE_PIXELS,
    ENTER_DRAGMODE, LEAVE_DRAGMODE, SET_GLYPH_SIZE,
    SHIFT_LEFT, SHIFT_RIGHT, SHIFT_UP, SHIFT_DOWN,
    CLEAR_GLYPHSETS, APPEND_GLYPHSET, PURGE_GLYPHSETS, ASSIGN_GLYPHSET, ASSIGN_LETTER, ADD_GLYPH, COPY_GLYPH,
    LOAD_GLYPH, UPDATE_SCENE, UPDATE_PHRASE, SET_DEFINES,
    ADD_NEW_PHRASE, COPY_PHRASE, DELETE_PHRASE, LOAD_PHRASE,
    REPLACE_STATE
] = [...Array(999).keys()];

const service = () => surfer.service('glyphset');

export const fetchGlyph = createAsyncThunk('glyph/fetchGlyph', async (glyphset, letter) => {
    try {
        console.log(glyphset, letter);
        return {};
    } catch (err) {
        console.warn(err);
        return null;
    }
});

export const addGlyph = createAsyncThunk('glyph/add', async (cloneId, {getState}) => {
    await service().create({
        query: {
            glyphset: getState().glyphset.current.id,
            clone: cloneId,
        }
    });
});

export const deleteGlyph = createAsyncThunk('glyph/remove', async (id, {getState}) => {
    const id = getState().id;
    if (!id) {
        console.warn("can't delete glyph with no ID!", id);
    }
    await service().remove(id);
});
// TODO: Reload whole glyph list

export const replacePixels = createAsyncThunk('glyph/replacePixels', async (newPixels, {getState}) => {
    const id = getState().id;
    if (!id) {
        console.log('Cannot PATCH pixels, ID is not known!');
        return;
    }
    await service().patch(id, {pixels: newPixels});
})

const initWidth = 9;
const initHeight = 16;

export const glyphSlice = createSlice({
    name: 'glyph',
    initialState: {
        id: null,
        width: initWidth,
        height: initHeight,
        letter: '',
        pixels: new2D(initWidth, initHeight),
        dragMode: false,
        dragValue: null,
        status: IDLE,
        error: null,
    },
    reducers: {
        clearAllPixels: (state) => {
            state.pixels = fill2D(state.pixels, false);
        },
        fillAllPixels: (state) => {
            state.pixels = fill2D(state.pixels, true);
        },
        enterDragMode: (state) => {
            state.dragMode = true;
        },
        leaveDragMode: (state) => {
            state.dragMode = false;
        },
        togglePixel: (state, {payload: coord}) => {
            console.log("TOGGLE", coord);
            state.pixels = update2D(state.pixels, coord, !at2D(state.pixels, coord));
        },
        setPixel: (state, {payload}) => {
            console.log("SETPIXEL", payload);
            state.pixels = update2D(state.pixels, payload.coord, payload.value);
        },
        fillArea: (state, {payload}) => {
            state.pixels = fillConnectedArea(state.pixels, payload)
        },
        resize: (state, {payload}) => {
            state.pixels = resize2D(state.pixels, payload.width || state.width, payload.height || state.height);
        },
        shiftLeft: (state) => { //TODO: forEach?
            state.pixels = state.pixels.map(row => {
                row.push(row.shift());
                return row;
            });
        },
        shiftRight: (state) => { //TODO: forEach?
            state.pixels = state.pixels.map(row => {
                row.unshift(row.pop());
                return row;
            });
        },
        shiftUp: (state) => {
            state.pixels.push(state.pixels.shift());
        },
        shiftDown: (state) => {
            state.pixels.unshift(state.pixels.pop());
        },
        assignLetter: (state, {payload}) => {
            state.letter = payload.letter;
        }
    },
    extraReducers: {
        [fetchGlyph.pending]: (state) => {
            state.status = LOADING;
        },
        [fetchGlyph.fulfilled]: (state, {payload}) => {
            state.status = OK;
            state.glyph = payload;
            state.error = null;
        },
        [fetchGlyph.rejected]: (state, {error}) => {
            state.status = 'LEEL?';
            state.error = error.message;
        }
    }
});

export const {leaveDragMode, enterDragMode, clearAllPixels, togglePixel, setPixel, fillArea, fillAllPixels} = glyphSlice.actions;
export default glyphSlice.reducer;

/*
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


        case OVERWRITE_PIXELS:
            return withUpdatedPixels(state, payload);

        case UPDATE_SCENE:
            return withUpdatedScene(state, payload);

        case UPDATE_PHRASE:
            return withUpdatedPhrase(state, payload);

        case SET_DEFINES:
            return {...state, defines: payload};

        case REPLACE_STATE:
            return payload;

        case ADD_NEW_PHRASE:
            const phraseTemplate = {...currentPhrase(state), chars: '', qmd: [], x: 0, y: 0, rotate: 0};
            return withAddedPhrase(state, phraseTemplate);

        case COPY_PHRASE:
            return withAddedPhrase(state, {...currentPhrase(state)});

        case DELETE_PHRASE:
            return withDeletedPhrase(state, currentPhrase(state));

        case LOAD_PHRASE:
            return {...state, phraseId: +payload};


        default:
            return state;
    }
}

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

const withAddedPhrase = (state, phrase) => ({
    ...state,
    scenes: state.scenes.map(scene =>
        scene.id === state.sceneId
            ? {
                ...scene,
                phrases: [
                    ...scene.phrases,
                    {
                        ...phrase,
                        id: scene.phrases.length
                    }
                ]
            }
            : scene
    )
});

const withDeletedPhrase = (state, phraseToDelete) => ({
    ...state,
    scenes: state.scenes.map(scene =>
        scene.id === state.sceneId
            ? {
                ...scene,
                phrases: scene.phrases.filter(
                    phrase => phrase.id !== phraseToDelete.id
                )
            }
            : scene
    ),
    phraseId: currentScene(state).phrases[0].id
});
*/

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
