import * as Glyph from './glyphUtils';

// model constants
const width = 9;
const height = 16;
export const initGlyph = Glyph.newFrom({width, height}, 0);

const newGlyphSet = (title, spacing, lineSpacing) => ({
    title,
    spacing,
    lineSpacing,
    glyphs: [initGlyph]
});

export const newScene = (id) => ({
    id: id || 0,
    title: '',
    duration: 10,
    width: 640,
    height: 320,
    backgroundColor: 'white',
    qmd: [],
});

const state = {
    dragMode: false,
    dragValue: undefined,
    glyphId: null,
    glyphset: null,
    sceneId: 0,
    phraseId: 0,
    scene: null,
    defines: {}
};

const importExample = '[[false,false,false,false,false,false,false,false,false],[false,true,false,true,true,true,true,true,false],[false,true,false,true,false,false,false,false,false],[false,true,false,true,true,true,true,false,false],[false,false,false,false,false,false,true,false,false],[false,true,false,false,false,false,true,false,false],[false,false,false,false,true,true,true,false,false],[false,false,false,false,true,false,false,false,false],[false,true,false,false,true,false,false,true,false],[false,false,false,false,false,false,false,true,false],[false,true,false,false,true,false,false,true,false],[false,false,false,true,true,true,false,true,false],[false,true,false,false,true,false,false,true,false],[false,true,false,false,false,false,false,true,false],[false,true,true,true,true,true,true,true,false],[false,false,false,false,false,false,false,false,false]]';

const doc = [
    "Documentation:",
    "Per default, all existing Phrases are rendered constantly during a scene.",
    "",
    "do you already feel team210 winning again?"
].join("\n");

export const hardCodeKerningMap = ({
    'a': {
        'k': [-1, 0],
        't': [-2, 0],
        'y': [-3, 0],
    },
    'A': {
        'S': [1, 0],
    },
    'b': {
        'e': [-1, 0],
    },
    'c': {
        'k': [-1, 0]
    },
    'd': {
        'e': [-2, 0],
        's': [-2, 1],
    },
    'D': {
        'e': [-1, 1],
    },
    'e': {
        'a': [0, -1],
        'l': [-1, 0],
        's': [-1, 0],
        'y': [-2, -1],
    },
    'f': {
        'i': [-1, 0],
        'r': [-1, 0],
    },
    'F': {
        'U': [-1, 0],
    },
    'g' : {
        'e': [-1, 1],
        's': [-1, -3],
    },
    'h': {
        't': [-2, -1],
    },
    'i': {
        'k': [-1, 0],
    },
    'I': {
        'N': [-1, 0],
        'n': [-1, 0],
    },
    'J': {
        'u': [-2, 0],
    },
    'k': {
        'e': [-1, 1],
        'y': [-3, 0],
    },
    'l': {
        'd': [-2, -1],
        'e': [-3, 0],
        'i': [-2, 0],
        'l': [-4, -1],
        'o': [-2, 0],
    },
    'n': {
        'd': [-1, 0],
        'g': [-3, 1],
        'l': [-3, 1],
        'v': [-2, -1],
    },
    'N': {
        'G': [-1, 0],
    },
    'o': {
        'y': [-3, 0],
    },
    'O': {
        'n': [1, 0],
        'Q': [1, 0],
    },
    'r': {
        'i': [-2, -2],
    },
    's': {
        'e': [-1, 0],
        'l': [-2, 0],
        's': [-3, -1],
    },
    't': {
        'a': [-2, 0],
        'i': [-1, -1],
        'h': [-1, -1],
    },
    'T': {
        'e': [-4, 1],
        'h': [-4, 2],
        'L': [-2, 0],
    },
    'u': {
        'l': [-1, 0],
        's': [-1, 0],
        'g': [-3, 1],
    },
    'V': {
        'i': [-2, 0],
        'O': [-1, -1],
    },
    'w': {
        'a': [-2, 0],
    },
    'y': {
        'b': [-1, -1],
    },
    ' ': {
        '&': [-2, 1],
        '/': [-2, 0],
    },
    '.': {
        '.': [-1, 0],
    },
    '&': {
        ' ': [-2, 0],
    },
    '/': {
        ' ': [-2, 0],
    },
    '1': {
        '0': [-2, 1],
    },
    '2': {
        '1': [-2, 0],
    }
});
