import {new2D} from './Utils';

// model constants
const width = 9;
const height = 16;

const state = {
    pixels: new2D(width, height),
    dragMode: false,
    dragValue: undefined,
};

export default {
    state,
};