import {new2D} from './Utils';

// model constants
const width = 9;
const height = 16;

const pixelState = {
    pixels: new2D(width, height),
    dragMode: false,
    dragValue: undefined,
};

const glyphState = {
    id: 0,
    letter: '',
    width,
    height,
    alphabet: null,
    alphabets: [null, 'matzdings'],
};

const importExample = '[[false,false,false,false,false,false,false,false,false],[false,true,false,true,true,true,true,true,false],[false,true,false,true,false,false,false,false,false],[false,true,false,true,true,true,true,false,false],[false,false,false,false,false,false,true,false,false],[false,true,false,false,false,false,true,false,false],[false,false,false,false,true,true,true,false,false],[false,false,false,false,true,false,false,false,false],[false,true,false,false,true,false,false,true,false],[false,false,false,false,false,false,false,true,false],[false,true,false,false,true,false,false,true,false],[false,false,false,true,true,true,false,true,false],[false,true,false,false,true,false,false,true,false],[false,true,false,false,false,false,false,true,false],[false,true,true,true,true,true,true,true,false],[false,false,false,false,false,false,false,false,false]]';

export default {
    pixelState,
    glyphState,
    importExample,
};