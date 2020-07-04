import {new2D} from '../Utils';

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