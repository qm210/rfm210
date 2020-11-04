import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { surfer } from '..';
import { IDLE, OK, LOADING, FAIL } from '../const';
import { fetchLetterMap, assignLetter } from './glyphSlice';

const service = () => surfer.service('glyphset');

export const fetchGlyphsets = createAsyncThunk('glyphset/find', async () => {
    const response = await service().find();
    return response.data;
});

export const fetchGlyphset = createAsyncThunk('glyphset/get', async (glyphset) => {
    const lel = await service().get(glyphset._id);
    return lel;
});

export const createGlyphset = createAsyncThunk('glyphset/create', async (title, {getState}) => {
    const response = await service().create({
        title
    });
    return response;
});

export const clearGlyphsetsAndGlyphs = createAsyncThunk('glyphsets/clear', async () => {
    await service().remove(null);
    await surfer.service('glyph').remove(null);
});

export const glyphsetSlice = createSlice({
    name: 'glyphset',
    initialState: {
        all: [],
        current: null,
        status: IDLE,
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
        [fetchGlyphsets.pending]: (state) => {
            state.status = LOADING;
        },
        [fetchGlyphsets.fulfilled]: (state, action) => {
            state.all = action.payload;
            state.status = OK;
        },
        [fetchGlyphsets.rejected]: (state, action) => {
            console.warn("error", action);
            state.status = FAIL;
            state.error = action.error.message;
        },
        [fetchGlyphset.fulfilled]: (state, action) => {
            console.log("was:", state.current);
            state.current = action.payload;
            console.log("is:", state.current);
        },
        [createGlyphset.fulfilled]: (state, action) => {
            state.all.push(action.payload);
            state.all.sort();
            state.current = action.payload;
        },
        [clearGlyphsetsAndGlyphs.fulfilled]: (state) => {
            state.status = IDLE;
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
                console.log("lel", payload);
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
