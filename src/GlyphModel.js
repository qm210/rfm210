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

// TODO: Serializing to local storage breaks the Glyph associaiton. Fix... sometime.

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
