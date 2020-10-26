import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { surfer } from '..';
import {new2D, update2D, at2D, fill2D, size2D, clone2D, resize2D} from "../Utils";
import { FAIL, IDLE, LOADING, OK } from '../const';
import { nextLetter } from './../glyphUtils';

const service = () => surfer.service('glyph');

export const fetchGlyph = createAsyncThunk('glyph/fetchGlyph', async (id, {rejectWithValue}) => {
    try {
        return await service().get(id);
    } catch (err) {
        console.warn(err);
        return rejectWithValue(err.message);
    }
});

export const copyGlyph = () => addGlyph(true);

export const addGlyph = createAsyncThunk('glyph/add', async (clone = false, {getState}) =>
    await service().create({
        letter: nextLetter(getState().glyph.letter),
        glyphsetId: getState().glyphset.current._id,
        cloneId: clone ? getState().glyph._id : null,
}));

export const deleteGlyph = createAsyncThunk('glyph/remove', async (arg, {getState}) => {
    const id = getState().glyph._id;
    if (!id) {
        return Promise.reject("can't delete glyph with no ID!");
    }
    return await service().remove(id);
});

export const replacePixels = createAsyncThunk('glyph/replacePixels', async (newPixels, {getState}) => {
    const id = getState()._id;
    if (!id) {
        console.log('Cannot PATCH pixels, ID is not known!');
        return;
    }
    await service().patch(id, {pixels: newPixels});
});

export const fetchLetterMap = createAsyncThunk('glyph/fetchLetterMap', async (glyphset) => {
    if (!glyphset || !glyphset.glyphList || !glyphset.glyphList.length) {
        return [];
    }
    return await Promise.all(glyphset.glyphList.map(async id => service().get(id)));
});

const initWidth = 9;
const initHeight = 16;

export const glyphSlice = createSlice({
    name: 'glyph',
    initialState: {
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
        [fetchGlyph.fulfilled]: (state, {payload}) => ({
                ...state,
                ...payload,
                status: OK,
                error: null
        }),
        [fetchGlyph.rejected]: (state, {error}) => {
            state.status = FAIL;
            state.error = error.message;
        },
    }
});

export default glyphSlice.reducer;

export const {
    leaveDragMode,
    enterDragMode,
    clearAllPixels,
    fillAllPixels,
    togglePixel,
    setPixel,
    fillArea,
    assignLetter,
    resize,
    shiftUp,
    shiftDown,
    shiftLeft,
    shiftRight,
} = glyphSlice.actions;


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
