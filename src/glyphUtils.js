import {new2D} from './Utils';

export const Glyph = id => ({
    id,
    letter: '',
    pixels: null
});

export const newFrom = (glyph, id) => ({
    ...glyph,
    ...Glyph(id),
    pixels: new2D(glyph.width, glyph.height)
});

export const copyFrom = (glyph, id) => ({
    ...Glyph(id),
    ...glyph,
});

export const placeholder = (width, height, value = true) => ({
    id: null,
    pixels: new2D(width, height, value),
    width,
    height
})

export const withPixels = (glyph, pixels) => ({
    ...glyph,
    pixels,
});

export const withPixelsIfMatch = (glyph, id, pixels) => ({
    ...glyph,
    pixels: glyph.id === id ? pixels : glyph.pixels
});

export const nextLetter = (letterMap) => {
    if (letterMap.length === 1) {
        return String.fromCharCode(letterMap[0].letter.charCodeAt(0) + 1);
    }
    else if (letterMap.length === 0) {
        return 'Q'
    }
    return nextLetter(letterMap.slice(-1));
}

export const alias = letter =>
    letter === ''
        ? '<undefined>'
        : letter === ' '
            ? '<space>'
            : letter;

const shaderAliases = {
    ' ': 'lelzeichen',
    '?': 'questschn',
    '!': 'eggsclamation',
    '.': 'dot',
    ',': 'qomma',
    ':': 'colonhehehehe',
    ';': 'semicolon',
    '-': 'minus',
    '+': 'plus',
    '&': 'ampersand',
    '#': 'hashtag',
    '*': 'asterisk',
    '/': 'slushy',
    '\\': 'begslushy',
    '~': 'hilde',
    '$': 'doller',
    "'": 'kot',
    '"': 'dobblkot',
    '(': 'klauf',
    ')': 'klzu',
    '[': 'ecklauf',
    ']': 'ecklzu',
    '{': 'geschwauf',
    '}': 'geschwzu',
    '=': 'desisso',
    '%': 'my2cent',
    '<': 'langle',
    '>': 'rangle',
    '|': 'pipe',
    '@': 'at',
    'ä': 'ae',
    'Ä': 'Ae',
    'ö': 'oe',
    'Ö': 'Oe',
    'ü': 'ue',
    'Ü': 'Ue',
    'ß': 'scharfess',
}

export const shaderAlias = letter => letter in shaderAliases ? shaderAliases[letter] : letter;

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
})