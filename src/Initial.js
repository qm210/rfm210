import {new2D} from './Utils';

// model constants
const width = 9;
const height = 16;

const pixelState = {
    pixels: new2D(width, height),
    dragMode: false,
    dragValue: undefined,
    currentGlyph: 0,
    currentLetter: ' ',
};

const glyphsState = {
    title: 'matzdings',
    spacing: 1,
    lineSpacing: 2,
    glyphs: [
        {
            letter: ' ',
            pixels: new2D(width, height),
            width,
            height
        }
    ]
};

const storeState = {
    alphabets: ['matzdings'],
}

const importExample = '[[false,false,false,false,false,false,false,false,false],[false,true,false,true,true,true,true,true,false],[false,true,false,true,false,false,false,false,false],[false,true,false,true,true,true,true,false,false],[false,false,false,false,false,false,true,false,false],[false,true,false,false,false,false,true,false,false],[false,false,false,false,true,true,true,false,false],[false,false,false,false,true,false,false,false,false],[false,true,false,false,true,false,false,true,false],[false,false,false,false,false,false,false,true,false],[false,true,false,false,true,false,false,true,false],[false,false,false,true,true,true,false,true,false],[false,true,false,false,true,false,false,true,false],[false,true,false,false,false,false,false,true,false],[false,true,true,true,true,true,true,true,false],[false,false,false,false,false,false,false,false,false]]';

export default {
    pixelState,
    glyphsState,
    storeState,
    importExample,
};