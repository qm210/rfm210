import {new2D} from './Utils';

// model constants
const width = 9;
const height = 16;

const state = {
    pixels: new2D(width, height),
    dragMode: false,
    dragValue: undefined,
};

// view constants
export const pixelSize = 33;
export const pixelBorder = 1;

export default {
    state,
    width,
    height,
    pixelSize
};