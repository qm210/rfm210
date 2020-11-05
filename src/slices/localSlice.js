import { createSlice } from '@reduxjs/toolkit';
import { loadStore } from './../LocalStorage';
import { fetchGlyph } from './glyphSlice';

// documentation what could be in here: ...

const localSlice = createSlice({
    name: 'local',
    initialState: {
        lastGlyphId: undefined,
    },
    reducers: {
        removeItem: (state, {payload}) => {
            if (payload in state) {
                state[payload] = undefined;
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

export default localSlice.reducer;
