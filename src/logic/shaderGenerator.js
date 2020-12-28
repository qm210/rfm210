import { float } from './shaderHelpers';
import { generateFigureCode, generateCalls, generateGlyphCode } from './shaderGenerateFigures';
import { generateParamCode } from './shaderGenerateParams';
import { PHRASE } from './../slices/sceneSlice';
import { getRequiredRectsForPixels } from './RectAlgebra';
import { findInLetterMap } from './glyph';

export default (sceneWidth, sceneHeight, scene, figureList, glyphset) => {

    if (!scene) {
        return '';
    }

    figureList = figureList.filter(it => it.active !== false);

    const usedGlyphs = figureList.reduce((accGlyphs, figure) => {
        if (figure.type !== PHRASE || !glyphset || !glyphset.letterMap) {
            return accGlyphs;
        }
        figure.chars.split("").forEach(char => {
            if (!(char in accGlyphs)) {
                const glyph = findInLetterMap(glyphset, char);
                if (glyph) {
                    accGlyphs[char] = getRequiredRectsForPixels(glyph.pixels);;
                }
            }
        });
        return accGlyphs;
    }, {});

    const paramCode = generateParamCode(scene.params);
    const figureCode = generateFigureCode(figureList, glyphset);
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
void dboxcombo(inout float d, in vec2 x, vec2 b, float border)
{
    vec2 da = abs(x*(border*border))-b;
    d = min(d, length(max(da,c.yy)) + min(max(da.x,da.y),0.0));
}
void rot(in float phi, out mat2 m)
{
    vec2 cs = vec2(cos(phi), sin(phi));
    m = mat2(cs.x, -cs.y, cs.y, cs.x);
}
float sm(in float d, in float sharp)
{
    return smoothstep(.2/iResolution.y, -.2/iResolution.y, sharp*d);
}
void rect(inout float d, vec2 uv, float x, float y, float w, float h, float border) {
  dboxcombo(d, uv + (vec2(-w,h) + 2.*vec2(-x,y))*PIXEL, vec2(w,h)*PIXEL, border);
}

${paramCode}
${glyphCode}
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
    ${calls}
    gl_FragColor = vec4(clamp(col,0.,1.),1.); // qm hack fragColor -> gl_FragColor
}`
    .replaceAll('PIXEL', '.005')
    .replaceAll('DARKBORDER', '.1')
    .replaceAll('DARKENING', 'col*col*col');

    return shader;
};