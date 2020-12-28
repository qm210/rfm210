import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { surfer } from '..';
import { update2D, at2D, fill2D, resize2D } from "../logic/array2d";
import { STATUS } from '../const';
import { nextLetter, fillConnectedArea } from '../logic/glyph';

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

const pending = (state) => {
    state.status = STATUS.LOADING;
};

const rejected = (state, {error}) => {
    state.status = STATUS.FAIL;
    state.error = error.message;
}

const glyphSlice = createSlice({
    name: 'glyph',
    initialState: {
        current: null,
        dragMode: false,
        dragValue: null,
        status: STATUS.IDLE,
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
        [fetchGlyph.pending]: pending,
        [fetchGlyph.fulfilled]: (state, {payload}) => ({
                ...state,
                current: {
                    ...state.current,
                    ...payload,
                },
                status: STATUS.OK,
                error: null
        }),
        [fetchGlyph.rejected]: rejected,
        [addGlyph.pending]: pending,
        [addGlyph.fulfilled]: (state, {payload}) => {
            state.current = payload;
            state.status = STATUS.OK;
        },
        [addGlyph.rejected]: rejected,
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

