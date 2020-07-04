import * as Glyph from './model/Glyph';

// model constants
const width = 9;
const height = 16;
const initGlyph = Glyph.newFrom({width, height}, 0);

const state = {
    dragMode: false,
    dragValue: undefined,
    glyphId: 0,
    maxGlyphId: 0,
    glyphset: {
        title: 'matzdings',
        spacing: 1,
        lineSpacing: 2,
        glyphs: [initGlyph]
    }
};

const importExample = '[[false,false,false,false,false,false,false,false,false],[false,true,false,true,true,true,true,true,false],[false,true,false,true,false,false,false,false,false],[false,true,false,true,true,true,true,false,false],[false,false,false,false,false,false,true,false,false],[false,true,false,false,false,false,true,false,false],[false,false,false,false,true,true,true,false,false],[false,false,false,false,true,false,false,false,false],[false,true,false,false,true,false,false,true,false],[false,false,false,false,false,false,false,true,false],[false,true,false,false,true,false,false,true,false],[false,false,false,true,true,true,false,true,false],[false,true,false,false,true,false,false,true,false],[false,true,false,false,false,false,false,true,false],[false,true,true,true,true,true,true,true,false],[false,false,false,false,false,false,false,false,false]]';

export default {
    state,
    importExample,
};