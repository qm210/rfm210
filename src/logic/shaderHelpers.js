import { shaderAlias } from './glyph';

export const asFloat = (number, prec) => {
    const str = prec ? number.toFixed(prec) : number.toString();
    if (Number.isInteger(number) && !str.includes('.')) {
        return str + '.';
    }
    return str;
};

export const float = x => asFloat(x || 0, 3);

export const asFloatOrStr = thing => typeof thing === 'number' ? asFloat(thing) : thing.toString();

export const saneGlslDelimiter = (str) => {
    str = str.replaceAll(' ', '_');
    str = str.replaceAll(/[^a-zA-Z0-9_]/g, "");
    return str;
};

export const newLine = (indent) => '\n' + ' '.repeat(indent);
export const joinLines = (array, indent) => array.map(it => ' '.repeat(indent) + it.toString()).join('\n');

export const shadertoyify = code => (
    code
        .replace('precision highp float;', '')
        .replace('varying vec2 uv;\n', '')
        .replace(/uniform vec2 iResolution.*/, '')
        .replace('// vec2 uv', 'vec2 uv')
        .replace(/vec2 UV = .*/, '')
        .replace(/UV/g, 'uv')
        .replace('void main()', 'void mainImage( out vec4 fragColor, in vec2 fragCoord )')
        .replace(/gl_FragColor/g, 'fragColor')
        .replace('time', 'iTime')
        .replace(/\+0\.,/g, ',')
        .replace(/\*1\.,/g, ',')
        .replace(/\.0*(?!\d)/g, '.')
        .replace(/\n\n*/g, '\n')
    );

export const kerning = (glyphset, L, R) => glyphset.kerningMap && L && L in glyphset.kerningMap && R in glyphset.kerningMap[L]
    ? {
        x: glyphset.kerningMap[L][R][0],
        y: glyphset.kerningMap[L][R][1]
    } : {
        x: 0,
        y: 0
    };

export const glslForRect = (rect) => {
    const {x, y, width, height} = rect;
    return `rect(d,coord,vec4(${x},${y},${width},${height}),shift,phi,scale,distort,d);`
};

export const glslForGlyph = (glyph, transform) => {
    const {offsetX = 0, offsetY = 0, rotate = 0, scale = 1, distort = 1.} = transform;
    return `${glyphFuncName(glyph.letter)}(d,coord,shift+vec2(${asFloatOrStr(offsetX)}*spac,${asFloatOrStr(offsetY)}),phi+${asFloatOrStr(rotate)},scale*${asFloatOrStr(scale)},distort*${asFloatOrStr(distort)});`;
};

export const glslForPhrase = (phrase, transform) => {
    const {offsetX = 0, offsetY = 0, rotate = 0, scale = 1, alpha = 'alpha', blur = 'blur', distort = 1., spacing = 1.} = transform;
    return `${phraseFuncName(phrase)}(d,coord,vec2(${offsetX},${offsetY}),${asFloatOrStr(rotate)},${asFloatOrStr(scale)},${asFloatOrStr(distort)},${asFloatOrStr(spacing)});\n`
    + `        col = mix(col, DARKENING, DARKBORDER * ${asFloatOrStr(alpha)} * sm(d-CONTOUR, ${asFloatOrStr(blur)}));\n`
    + `        col = mix(col, c.xxx, ${asFloatOrStr(alpha)} * sm(d-.0005,    ${asFloatOrStr(blur)}));`
}

export const glyphFuncName = (letter) => `glyph_${shaderAlias(letter)}`;

export const phraseFuncName = (phrase) => `phrase_${[...phrase.chars].map(char => shaderAlias(char)).join('')}`;
