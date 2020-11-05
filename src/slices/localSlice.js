import { createSlice } from '@reduxjs/toolkit';
import { loadStore } from './../LocalStorage';
import { fetchGlyph } from './glyphSlice';

// documentation what could be in here: ...

export const localSlice = createSlice({
    name: 'local',
    initialState: loadStore(),
    reducers: {
        removeItem: (state, {payload}) => {
            if (payload in state) {
                delete state[payload];
            }
        }
    },
    extraReducers: {
        [fetchGlyph.fulfilled]: (state, {payload}) => {
            state.lastGlyphId = payload._id;
        }
    }
});

export const {removeItem} = localSlice.actions;

export default localSlice;
