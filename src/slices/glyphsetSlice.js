import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { surfer } from '..';
import { STATUS } from '../const';
import { fetchLetterMap, assignLetter } from './glyphSlice';

const service = () => surfer.service('glyphset');

export const fetchGlyphsets = createAsyncThunk('glyphset/find', async () => {
    const response = await service().find();
    return response.data;
});

export const fetchGlyphset = createAsyncThunk('glyphset/get', async (glyphset) => {
    if (!glyphset) {
        const all = await dispatchEvent(fetchGlyphsets());
        return all[0];
    }
    return await service().get(glyphset._id);
});

export const createGlyphset = createAsyncThunk('glyphset/create', async (title, {getState}) => {
    const response = await service().create({title});
    return response;
});

export const deleteAllGlyphsetsAndGlyphs = createAsyncThunk('glyphsets/clear', async () => {
    await service().remove(null);
    await surfer.service('glyph').remove(null);
});

export const updateGlyphset = createAsyncThunk('glyphsets/update', async (update) => {
    if (!update._id) {
        console.log("can't patch what has no _id:", update);
        return;
    }
    return await service().patch(update._id, update);
});

const pending =  (state) => {
    state.status = STATUS.LOADING;
};

const rejected = (state, action) => {
    state.status = STATUS.FAIL;
    state.error = action.error.message;
};

const glyphsetSlice = createSlice({
    name: 'glyphset',
    initialState: {
        all: [],
        current: null,
        status: STATUS.IDLE,
        error: null
    },
    reducers: {
        selectGlyphsetByTitle: (state, action) => {
            state.current = state.all.find(glyphset => glyphset.title === action.payload);
            if (!state.current) {
                console.warn("could not select glyphset by title", action.payload);
                return;
            }
        },
    },
    extraReducers: {
        [fetchGlyphsets.pending]: pending,
        [fetchGlyphsets.rejected]: rejected,
        [fetchGlyphsets.fulfilled]: (state, action) => {
            state.all = action.payload;
            state.status = STATUS.OK;
        },
        [fetchGlyphset.fulfilled]: (state, action) => {
            state.current = action.payload;
        },
        [createGlyphset.pending]: pending,
        [createGlyphset.rejected]: rejected,
        [createGlyphset.fulfilled]: (state, action) => {
            state.all.push(action.payload);
            console.log("ALL GLYPHSETS", state.all);
            state.all.sort(); // <-- what is this doing?? sort needs arguments, doesn't it?
            console.log("ALL GLYPHSETS SORTED NOW?", state.all);
            state.current = action.payload;
        },
        [updateGlyphset.pending]: pending,
        [updateGlyphset.rejected]: rejected,
        [updateGlyphset.fulfilled]: (state, action) => {
            console.log("UPDATED GLYPHSET", action.payload);
            state.current = action.payload;
            state.status = STATUS.OK;
        },
        [deleteAllGlyphsetsAndGlyphs.fulfilled]: (state) => {
            state.status = STATUS.IDLE;
            state.all = [];
            state.current = null;
        },
        [fetchLetterMap.fulfilled]: (state, action) => {
            if (state.current) {
                state.current.letterMap = action.payload;
            }
        },
        [assignLetter]: (state, {payload}) => {
            if (state.current.letterMap) {
                state.current.letterMap = state.current.letterMap.map(glyph => ({
                    ...glyph,
                    letter: glyph._id === payload.id ? payload.letter : glyph.letter
                }));
                state.current.letterMap.sort((a,b) => a.letter < b.letter ? -1 : 1);
            }
        }
    }
});

export const {selectGlyphsetByTitle} = glyphsetSlice.actions;

export default glyphsetSlice.reducer;

export const selectLetterMap = store => (store.glyphset.current && store.glyphset.current.letterMap) || null;
