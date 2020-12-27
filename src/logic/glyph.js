import { new2D, size2D, clone2D } from './array2d';

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
        return 'Q';
    }
    return nextLetter(letterMap.slice(-1));
}

export const findInLetterMap = (glyphset, char) =>
    glyphset.letterMap.find(glyph => glyph.letter === char)
        || glyphset.letterMap.find(glyph => glyph.letter.toLowerCase() === char.toLowerCase());

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

export const surroundingPixelList = ({row, column, width, height}) => {
    const surrounding = [];
    if (row > 0) {
        surrounding.push({row: row - 1, column});
    }
    if (row < height - 1) {
        surrounding.push({row: row + 1, column});
    }
    if (column > 0) {
        surrounding.push({row, column: column - 1});
    }
    if (column < width - 1) {
        surrounding.push({row, column: column + 1});
    }
    return surrounding;
}

export const recursiveFindConnectedPixels = (holding, pixels, column, row, value) => {
    holding = [...holding, {row, column}];
    const surrounding = surroundingPixelList({column, row, ...size2D(pixels)});
    for (const coord of surrounding) {
        if (holding.some(item => item.column === coord.column && item.row === coord.row)
            || pixels[coord.row][coord.column] === value) {
            continue;
        }
        holding = recursiveFindConnectedPixels(holding, pixels, coord.column, coord.row, value);
    }
    return holding;
}

export const fillConnectedArea = (pixels, {column, row}, value) => {
    const clonePixels = clone2D(pixels);
    const connectedPixels = recursiveFindConnectedPixels([], pixels, column, row, value);
    for (const pixel of connectedPixels) {
        clonePixels[pixel.row][pixel.column] = value;
    }
    return clonePixels;
}
