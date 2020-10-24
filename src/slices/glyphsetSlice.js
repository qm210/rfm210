import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { surfer } from '..';
import { IDLE, OK, LOADING, FAIL } from '../const';

const service = () => surfer.service('glyphset');

export const fetchGlyphsets = createAsyncThunk('glyphset/find', async () => {
    console.log("LETS GO")
    const response = await service().find();
    console.log("GLYPHSET FIND", response);
    return response.data;
});

export const createGlyphset = createAsyncThunk('glyphset/create', async (title) => {
    const response = await service().create({
        title
    });
    console.log("..", response);
    await new Promise(r => setTimeout(r, 500));
    console.log("IDLE NOW");
    return response;
});

export const clearGlyphsets = createAsyncThunk('glyphsets/clear', async () => {
    await service().remove(null);
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
            state.current = state.all.find(g => g.title === action.payload);
        },
    },
    extraReducers: {
        [fetchGlyphsets.pending]: (state) => {
            state.status = LOADING;
        },
        [fetchGlyphsets.fulfilled]: (state, action) => {
            console.log("FGFF", action);
            state.all = action.payload;
            state.status = OK;
        },
        [fetchGlyphsets.rejected]: (state, action) => {
            console.warn("error", action);
            state.status = FAIL;
            state.error = action.error.message;
        },
        [createGlyphset.fulfilled]: (state, action) => {
            console.log("CFGG", action);
            state.status = IDLE;
        }
    }
});

export const {selectGlyphsetByTitle} = glyphsetSlice.actions;
export default glyphsetSlice.reducer;