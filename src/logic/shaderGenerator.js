import { float } from './shaderHelpers';
import { generateParamCode, generateFigureCode, generateCalls, generateGlyphCode, generatePhraseCode } from './shaderPartGenerators';
import { PHRASE } from './../slices/sceneSlice';
import { getRequiredRectsForPixels } from './RectAlgebra';

export default (sceneWidth, sceneHeight, scene, figureList, glyphset) => {

    if (!scene) {
        return '';
    }

    const usedGlyphs = figureList.reduce((accGlyphs, figure) => {
        if (figure.type !== PHRASE || !glyphset || !glyphset.letterMap) {
            return accGlyphs;
        }
        figure.chars.split("").forEach(char => {
            if (!(char in accGlyphs)) {
                const glyph = glyphset.letterMap.find(glyph => glyph.letter === char)
                    || glyphset.letterMap.find(glyph => glyph.letter.toLowerCase() === char.toLowerCase());
                if (glyph) {
                    accGlyphs[char] = getRequiredRectsForPixels(glyph.pixels);;
                }
            }
        });
        return accGlyphs;
    }, {});

    const paramCode = generateParamCode(scene.params);
    const figureCode = generateFigureCode(figureList);
    const phraseCode = generatePhraseCode(figureList, glyphset);
    const glyphCode = generateGlyphCode(usedGlyphs);
    const calls = generateCalls(figureList, scene.params);

    const shader = `
precision highp float;
varying vec2 uv;
const vec3 c = vec3(1.,0.,-1.);
uniform vec2 iResolution; // qm hacked this

const float w = .07;
const float eps = 1.e-5;

float norm(in vec2 coord)
{
    return max(abs(coord.x), abs(coord.y));
}
vec2 quant(in vec2 coord)
{
    return floor(coord/w + .5)*w;
}
float smstep(float a, float b, float x) {return smoothstep(a, b, clamp(x, a, b));}
void rand(in vec2 x, out float n)
{
    x += 400.;
    n = fract(sin(dot(sign(x)*abs(x) ,vec2(12.9898,78.233)))*43758.5453);
}
void lpnoise(in float t, in float fq, out float n)
{
    t *= fq;
    float tt = fract(t);
    float tn = t - tt;
    float r1, r2;
    rand(vec2(floor(tn) / fq), r1);
    rand(vec2(floor(tn + 1.0) / fq), r2);
    n = mix(r1, r2, smstep(0.0, 1.0, tt));
}
void lp2dnoise(in float t, out vec2 n)
{
    float r1, r2;
    lpnoise(t, 1.0, r1);
    lpnoise(t, 1.1, r2);
    n = vec2(r1, r2);
}
void dboxcombo(in vec2 x, in vec2 b, in float distort, inout float d)
{
    vec2 da = abs(x*distort)-b;
    d = min(d, length(max(da,c.yy)) + min(max(da.x,da.y),0.0));
}
void rot(in float phi, out mat2 m)
{
    vec2 cs = vec2(cos(phi), sin(phi));
    m = mat2(cs.x, -cs.y, cs.y, cs.x);
}
float sm(in float d, in float blur)
{
    return smoothstep(.2/iResolution.y, -.2/iResolution.y, blur*d);
}
void rectMod(inout float d, in vec2 uv, in vec4 rect, in vec2 shift, in float phi, in float scale, in float distort)
{
    mat2 R;
    rot(phi, R);
    R /= max(1.e-3, scale);
    dboxcombo(R*uv + PIXEL*(vec2(-rect.z,rect.w) + vec2(-2.*shift.x,2.*shift.y) + vec2(-2.*rect.x, 2.*rect.y)), vec2(rect.z,rect.w)*PIXEL, distort, d);
}
void rect(inout float d, vec2 uv, float x, float y, float w, float h, float distort) {
  dboxcombo(uv + (vec2(-h,w) + vec2(-2.*x, 2.*y))*PIXEL, vec2(w,h)*PIXEL, distort, d);
}

${paramCode}
${glyphCode}
${phraseCode}
${figureCode}
void placeholder(inout vec3 col, in vec2 coord)
{
    vec2 centq = quant(coord);
    float cnorm = max(abs(coord.x), abs(coord.y));

    if (cnorm < 1.)
    {
        if (cnorm > 1.-w)
        {
            col = .5 * c.xxx;
        }
        else if(w + centq.x > -centq.y + eps && centq.x < -centq.y + w) {col = .5*col;}
        else if(w + centq.x > centq.y + eps && centq.x < centq.y + w) {col = .5*col;}
    }
}
void main()
{
    float t = mod(time, ${float(scene.duration || 0)});
    // vec2 uv = (fragCoord.xy-.5*iResolution.xy)/iResolution.y; // qm hack
    vec2 UV = vec2((uv.x - .5)*${float(sceneWidth/sceneHeight)}, uv.y - .5); // qm hack
    vec3 col = vec3(1.,.8,1.);
    col = mix(col, 1.1 + -.5*cos(iTime+uv.xyx+vec3(0,2,4)), 0.2);
    float d;
    float alpha = 1.;
    float blur = 1.;
    //this is where terrifyingCode was
    ${calls}
    gl_FragColor = vec4(clamp(col,0.,1.),1.); // qm hack fragColor -> gl_FragColor
}`
    .replaceAll('PIXEL', '.005')
    .replaceAll('CONTOUR', '.01')
    .replaceAll('DARKBORDER', '.1')
    .replaceAll('DARKENING', 'col*col*col');

    return shader;
};