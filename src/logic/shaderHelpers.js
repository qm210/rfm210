export const asFloat = (number, prec) => {
    const str = prec ? number.toFixed(prec) : number.toString();
    if (Number.isInteger(number) && !str.includes('.')) {
        return str + '.';
    }
    return str;
};

export const float = x => asFloat(x || 0, 3).replace(/\.0*(?!\d)/g, '.');

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
        .replaceAll(/UV/g, 'uv')
        .replace('void main()', 'void mainImage( out vec4 fragColor, in vec2 fragCoord )')
        .replaceAll(/gl_FragColor/g, 'fragColor')
        .replaceAll('time', 'iTime')
        .replaceAll(/\.0*(?!\d)/g, '.')
        .replaceAll(/\n\n*/g, '\n')
        .replaceAll(/\+0\.,/g, ',')
        .replaceAll(/\*1\.(?!\d)/g, '')
        .replaceAll('+-','-')
    );

export const kerning = (glyphset, L, R) => glyphset.kerningMap && L && L in glyphset.kerningMap && R in glyphset.kerningMap[L]
    ? {
        x: glyphset.kerningMap[L][R][0],
        y: glyphset.kerningMap[L][R][1]
    } : {
        x: 0,
        y: 0
    };
