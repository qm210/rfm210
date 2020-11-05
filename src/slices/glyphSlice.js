import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { surfer } from '..';
import { update2D, at2D, fill2D, size2D, clone2D, resize2D } from "../Utils";
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

export const addGlyph = createAsyncThunk('glyph/add', async (clone = false, {getState}) => {
    const glyph = getState().glyph.current;
    const glyphset = getState().glyphset.current;
    return await service().create({
        letter: nextLetter(glyphset.letterMap),
        glyphsetId: glyphset._id,
        cloneId: clone && glyph ? glyph._id : null,
        width: glyph ? glyph.width : null,
        height: glyph ? glyph.height : null,
    });
});

export const deleteGlyph = createAsyncThunk('glyph/remove', async (arg, {getState}) => {
    const id = getState().glyph.current._id;
    if (!id) {
        return Promise.reject("can't delete glyph with no ID!");
    }
    return await service().remove(id);
});

export const updateGlyph = createAsyncThunk('glyph/update', async (arg, {getState}) => {
    const glyph = getState().glyph.current;
    if (!glyph._id) {
        console.log('Cannot PATCH pixels, ID is not known!', glyph);
        return;
    }
    await service().patch(glyph._id, glyph);
});

export const fetchLetterMap = createAsyncThunk('glyph/fetchLetterMap', async (glyphset) => {
    if (!glyphset || !glyphset.glyphList || !glyphset.glyphList.length) {
        return [];
    }
    const letterMap = await Promise.all(glyphset.glyphList.map(async id => service().get(id)));
    letterMap.sort((a,b) => a.letter < b.letter ? -1 : 1);
    return letterMap;
});

export const glyphSlice = createSlice({
    name: 'glyph',
    initialState: {
        current: null,
        dragMode: false,
        dragValue: null,
        status: IDLE,
        error: null,
    },
    reducers: {
        clearAllPixels: (state) => {
            state.current.pixels = fill2D(state.current.pixels, false);
        },
        fillAllPixels: (state) => {
            state.current.pixels = fill2D(state.current.pixels, true);
        },
        enterDragMode: (state, action) => {
            state.dragMode = true;
            state.dragValue = action.payload;
        },
        leaveDragMode: (state) => {
            state.dragMode = false;
        },
        togglePixel: (state, {payload: coord}) => {
            state.current.pixels = update2D(state.current.pixels, coord, !at2D(state.current.pixels, coord));
        },
        setPixel: (state, {payload}) => {
            state.current.pixels = update2D(state.current.pixels, payload.coord, payload.value);
        },
        fillArea: (state, {payload}) => {
            state.current.pixels = fillConnectedArea(state.current.pixels, payload.coord, payload.value)
        },
        resize: (state, {payload}) => {
            state.current.width = payload.width || state.current.width;
            state.current.height = payload.height || state.current.height
            state.current.pixels = resize2D(state.current.pixels, state.current.width, state.current.height);
        },
        shiftLeft: (state) => { //TODO: forEach?
            state.current.pixels = state.current.pixels.map(row => {
                row.push(row.shift());
                return row;
            });
        },
        shiftRight: (state) => { //TODO: forEach?
            state.current.pixels = state.current.pixels.map(row => {
                row.unshift(row.pop());
                return row;
            });
        },
        shiftUp: (state) => {
            state.current.pixels.push(state.current.pixels.shift());
        },
        shiftDown: (state) => {
            state.current.pixels.unshift(state.current.pixels.pop());
        },
        assignLetter: (state, {payload}) => {
            state.current.letter = payload.letter;
        },
        replacePixels: (state, {payload}) => {
            state.current.pixels = payload;
        }
    },
    extraReducers: {
        [fetchGlyph.pending]: (state) => {
            state.status = LOADING;
        },
        [fetchGlyph.fulfilled]: (state, {payload}) => ({
                ...state,
                current: {
                    ...state.current,
                    ...payload,
                },
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
    replacePixels,
    resize,
    shiftUp,
    shiftDown,
    shiftLeft,
    shiftRight,
} = glyphSlice.actions;

/*

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

const fillConnectedArea = (pixels, {column, row}, value) => {
    const clonePixels = clone2D(pixels);
    const connectedPixels = recursiveFindConnectedPixels([], pixels, column, row, value);
    for (const pixel of connectedPixels) {
        clonePixels[pixel.row][pixel.column] = value;
    }
    return clonePixels;
}
