import { createSlice } from '@reduxjs/toolkit';
import { loadStore } from './../LocalStorage';

export const localSlice = createSlice({
    name: 'local',
    initialState: loadStore(),
    reducers: {

    }
});

export default localSlice;
