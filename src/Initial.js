import * as Glyph from './GlyphModel';

// model constants
const width = 9;
const height = 16;
const initGlyph = Glyph.newFrom({width, height}, 0);

const state = {
    dragMode: false,
    dragValue: undefined,
    glyphId: 0,
    glyphset: {
        title: 'matzdings',
        spacing: 1,
        lineSpacing: 2,
        glyphs: [initGlyph]
    },
    sceneId: 0,
    phraseId: 0,
    scenes: [{
        id: 0,
        title: '',
        duration: 10,
        width: 640,
        height: 320,
        backgroundColor: 'white',
        qmd: [],
        phrases: [
            {
                id: 0,
                chars: 'lel',
                x: 0,
                y: 0,
                active: true,
                scaleX: 1,
                scaleY: 1,
                rotate: 0,
                color: 'black',
                qmd: [],
            }
        ],
    }],
    defines: {}
};

const importExample = '[[false,false,false,false,false,false,false,false,false],[false,true,false,true,true,true,true,true,false],[false,true,false,true,false,false,false,false,false],[false,true,false,true,true,true,true,false,false],[false,false,false,false,false,false,true,false,false],[false,true,false,false,false,false,true,false,false],[false,false,false,false,true,true,true,false,false],[false,false,false,false,true,false,false,false,false],[false,true,false,false,true,false,false,true,false],[false,false,false,false,false,false,false,true,false],[false,true,false,false,true,false,false,true,false],[false,false,false,true,true,true,false,true,false],[false,true,false,false,true,false,false,true,false],[false,true,false,false,false,false,false,true,false],[false,true,true,true,true,true,true,true,false],[false,false,false,false,false,false,false,false,false]]';

const doc = [
    "Documentation:",
    "Per default, all existing Phrases are rendered constantly during a scene.",
    "",
    "do you already feel team210 winning again?"
].join("\n");

export default {
    state,
    width,
    height,
    doc,
    importExample,
};