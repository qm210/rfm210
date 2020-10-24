import React from 'react';
import {connect} from 'react-redux';
import ShadertoyReact from 'shadertoy-react';
import {ShaderFrame} from '.';
import * as GL from 'gl-react';
//import * as GLDom from 'gl-react-dom';
import RectAlgebra from '../RectAlgebra';
import * as State from '../slices/glyphSlice';
import {CodeFrame} from '../components';
import { shaderAlias, hardCodeKerningMap } from '../GlyphModel';
import {liveMode} from '..'

const mapStateToProps = (state) => ({
    scene: State.currentScene(state),
    glyphset: state.glyphset,
    defines: state.defines,
});

const mapDispatchToProps = (dispatch) => ({
})

const asFloat = number => number.toString() + (Number.isInteger(number) ? '.' : '');

const asFloatOrStr = thing => typeof thing === 'number' ? asFloat(thing) : thing.toString();

const shadertoyify = code => (
    code
        .replace('precision highp float;', '')
        .replace('varying vec2 uv;\n', '')
        .replace(/uniform vec2 iResolution.*/, '')
        .replace('// vec2 uv', 'vec2 uv')
        .replace(/vec2 UV = .*/, '')
        .replace(/UV/g, 'uv')
        .replace('void main()', 'void mainImage( out vec4 fragColor, in vec2 fragCoord )')
        .replace(/gl_FragColor/g, 'fragColor')
        .replace(/\+0\.,/g, ',')
        .replace(/\*1\.,/g, ',')
    );

const kerning = (L, R) => (L && L in hardCodeKerningMap && R in hardCodeKerningMap[L]) ?
    {x: hardCodeKerningMap[L][R][0], y: hardCodeKerningMap[L][R][1]} : {x: 0, y: 0};

const glslForRect = (rect) => {
    const {x, y, width, height} = rect;
    return `rect(UV,vec4(${x},${y},${width},${height}),shift,phi,scale,distort,d);`
};

const glslForGlyph = (glyph, transform) => {
    const {offsetX = 0, offsetY = 0, rotate = 0, scale = 1, distort = 1.} = transform;
    return `${glyphFuncName(glyph.letter)}(UV,shift+vec2(${asFloatOrStr(offsetX)}*spac,${asFloatOrStr(offsetY)}),phi+${asFloatOrStr(rotate)},scale*${asFloatOrStr(scale)},distort*${asFloatOrStr(distort)},d);`;
};

const glslForPhrase = (phrase, transform) => {
    const {offsetX = 0, offsetY = 0, rotate = 0, scale = 1, alpha = 'alpha', blur = 'blur', distort = 1., spacing = 1.} = transform;
    return `${phraseFuncName(phrase)}(UV,vec2(${offsetX},${offsetY}),${asFloatOrStr(rotate)},${asFloatOrStr(scale)},${asFloatOrStr(distort)},${asFloatOrStr(spacing)},d);\n`
    + `        col = mix(col, DARKENING, DARKBORDER * ${asFloatOrStr(alpha)} * sm(d-CONTOUR, ${asFloatOrStr(blur)}));\n`
    + `        col = mix(col, c.xxx, ${asFloatOrStr(alpha)} * sm(d-.0005, ${asFloatOrStr(blur)}));`
} // make blackening customizable, also might think about alpha* in third argument (vorletzte zeile)

const glyphFuncName = (letter) => `glyph_${shaderAlias(letter)}`;

const phraseFuncName = (phrase) => `phrase_${[...phrase.chars].map(char => shaderAlias(char)).join('')}`;

const SceneShaderView = ({scene, glyphset, defines}) => {
    const [millis, setMillis] = React.useState(0);
    const reqRef = React.useRef();
    const prevReqRef = React.useRef();

    const animate = React.useCallback(time => {
        if (prevReqRef.current !== undefined) {
            const deltaTime = time - prevReqRef.current;
            setMillis(ms => ms + deltaTime);
        }
        prevReqRef.current = time;
        prevReqRef.current = requestAnimationFrame(animate);
    }, []);

    React.useEffect(() => {
        reqRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(reqRef.current);
      }, [animate]);

    const parsePhraseQmd = React.useCallback((script) => {
        const acceptedPhraseQmds = ['show', 'hide', 'blink', 'spin', 'colmod'];
        const qmds = [];
        for (const line of script) {
            if (line[0] === '#') {
                continue;
            }
            const [timeInterval, qmdList] = (line.includes(':') ? line : '0.. :' + line).split(':');
            const [start, end] = timeInterval.replace(' ', '').split('..');
            const rawArgs = qmdList.split(' ');
            const qmd = rawArgs.shift().toLowerCase();
            const arg = Object.fromEntries(rawArgs.map(r => r.split('=')));
            if (acceptedPhraseQmds.includes(qmd)) {
                qmds.push({start: asFloat(+start), end: asFloat(+end || scene.duration), qmd, arg});
            }
        }
        return qmds;
    }, [scene.duration]);

    const usesTime = React.useMemo(() => scene.phrases[0].qmd.length > 0, [scene]);

    const [terrifyingCode, glyphCode, phraseCode] = React.useMemo(() => {
        var usedGlyphs = {};
        var terrifyingCode = '';
        var phraseCode = '';
        for(const phrase of scene.phrases) {
            var phraseObjects = [];
            var postProcess = [];
            var params = [];
            const cosPhi = Math.cos(phrase.rotate);
            const sinPhi = Math.sin(phrase.rotate);

            // parse qmds
            const qmds = parsePhraseQmd(phrase.qmd);

            phrase.transform = {
                offsetX: asFloat(phrase.x),
                offsetY: asFloat(phrase.y),
                rotate: asFloat(phrase.rotate),
            };

            // construct rects
            var maxWidth = 0;
            var maxHeight = 0;
            var lastChar = undefined;
            for (const char of phrase.chars.split('')) {
                const glyph = State.glyphForLetter(glyphset, char);
                const pixelRects = RectAlgebra.getRequiredRectsForPixels(glyph.pixels);
                const kern = kerning(lastChar, char);
                maxWidth += kern.x;
                const transform = {
                    offsetX: maxWidth * cosPhi + kern.y * sinPhi,
                    offsetY: maxWidth * sinPhi + kern.y * cosPhi,
                    rotate: 0,
                };
                phraseObjects.push({phrase, char, glyph, pixelRects, transform});
                maxHeight = Math.max(maxHeight, glyph.height);
                maxWidth += glyph.width;
                lastChar = char;
            }
            const halfWidth = .5 * maxWidth;
            const halfHeight = .5 * maxHeight;
            phraseObjects.forEach(obj =>
                obj.transform = {
                    ...obj.transform,
                    offsetX: obj.transform.offsetX - halfWidth * cosPhi - halfHeight * sinPhi,
                    offsetY: obj.transform.offsetY + halfWidth * sinPhi - halfHeight * cosPhi,
                }
            );
            usedGlyphs = phraseObjects.reduce((acc, obj) => {
                if (!(obj.char in acc)) {
                    acc[obj.char] = obj.pixelRects;
                }
                return acc;
            }, usedGlyphs);
            // quick hack before UC10: use every glyph
            usedGlyphs = glyphset.glyphs.reduce((acc, glyph) => {
                if (!(glyph.letter in acc)) {
                    acc[glyph.letter] = RectAlgebra.getRequiredRectsForPixels(glyph.pixels);;
                }
                return acc;
            }, usedGlyphs);
            //////////////////////////////
            for (const {start, end, qmd, arg} of qmds) {
                const nextParamName = `p${params.length}`;
                var def = asFloat(0);
                switch (qmd) {
                    case 'show':
                        postProcess.push(`col = mix(c.yyy, col, (t >= ${start} && t < ${end}) ? 1. : 0.);`);
                        break;
                    case 'hide':
                        postProcess.push(`col = mix(c.yyy, col, (t >= ${start} && t < ${end}) ? 0. : 1.);`);
                        break;
                    case 'spin':
                        const speed = arg['speed'] || 1;
                        params.push({name: nextParamName, code: `${asFloatOrStr(speed)}*t`, start, end, def});
                        phraseObjects.forEach(obj => obj.transform.rotate += '+' + nextParamName);
                        break;
                    default:
                        break;
                }
            }
            terrifyingCode += params.map(p =>
                `float ${p.name} = (t >= ${p.start} && t < ${p.end}) ? ${p.code} : ${p.def};\n` + ' '.repeat(8)
            ) + glslForPhrase(phrase, phrase.transform) + '\n' + ' '.repeat(8);
            phraseCode += `void ${phraseFuncName(phrase)}(in vec2 UV, in vec2 shift, in float phi, in float scale, in float distort, in float spac, out float d)
    {d = 1.;
    ${phraseObjects.map(obj =>
                    glslForGlyph(obj.glyph, obj.transform)
                ).join('\n' + ' '.repeat(4))}
            }`
        }
        const glyphCode = `
void glyph_undefined(in vec2 UV, in vec2 shift, in float phi, in float scale, in float distort, inout float d)
    {rect(UV,vec4(0,0,9,16),shift,phi,scale,distort,d);}
        ${
            Object.keys(usedGlyphs).map(glyph =>
                `void ${glyphFuncName(glyph)}(in vec2 UV, in vec2 shift, in float phi, in float scale, in float distort, inout float d){
${usedGlyphs[glyph].map(rect =>
                        glslForRect(rect)
                    ).join('')}
}\n`
            ).join('')
        }`;
        return [terrifyingCode, glyphCode, phraseCode];
    }, [scene, glyphset, parsePhraseQmd]);
// Einfach mal shadertoy-react implementieren
    const shaderCode = React.useMemo(() => GL.GLSL`
    precision highp float;
    varying vec2 uv;
    ${usesTime ? 'uniform float time;' : ''}
    const vec3 c = vec3(1.,0.,-1.);
    uniform vec2 iResolution; // qm hacked this

    ${Object.keys(defines).map(key => `#define ${key} ${defines[key]}`).join('\n')} // nr4 advice: hardcode replace these
    #define PIXEL .005
    #define CONTOUR .01
    #define DARKBORDER 0.1
    #define DARKENING col*col*col

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
    void rect(in vec2 uv, in vec4 rect, in vec2 shift, in float phi, in float scale, in float distort, inout float d)
    {
        mat2 R;
        rot(phi, R);
        R /= max(1.e-3, scale);
        dboxcombo(R*uv + PIXEL*(vec2(-rect.z,rect.w) + vec2(-2.*shift.x,2.*shift.y) + vec2(-2.*rect.x, 2.*rect.y)), vec2(rect.z,rect.w)*PIXEL, distort, d);
    }
    ${glyphCode}
    ${phraseCode}
    void main()
    {
        ${usesTime ? `float t = mod(time, ${asFloat(scene.duration)});` : ''}
        // vec2 uv = (fragCoord.xy-.5*iResolution.xy)/iResolution.y; // qm hack
        vec2 UV = vec2((uv.x - .5)*${asFloat(scene.width/scene.height)}, uv.y - .5); // qm hack
        vec3 col = vec3(1.,.8,1.);
        float d;
        float alpha = 1.;
        float blur = 1.;
        ${terrifyingCode}
        gl_FragColor = vec4(clamp(col,0.,1.),1.); // qm hack fragColor -> gl_FragColor
    }
    `, [terrifyingCode, glyphCode, phraseCode, defines, scene, usesTime]);

    const shaders = React.useMemo(() => GL.Shaders.create({
        nr4template: {
            frag: shaderCode
        }
    }), [shaderCode]);

    return <>
        <ShaderFrame>
            <b>This is the AWESOME part!</b><br/>
            {/*
            <GLDom.Surface width={scene.width} height={scene.height}>
                <GL.Node
                    shader={shaders.nr4template}
                    uniforms={{
                        iResolution: [scene.width, scene.height],
                        ...(usesTime ? {time: millis/1000} : {})
                    }}
                />
            </GLDom.Surface>
            */}
            <ShadertoyReact fs={shadertoyify(shaderCode)}/>
        </ShaderFrame>
        <CodeFrame>
            {shadertoyify(shaderCode)}
        </CodeFrame>
    </>;
};

export default connect(mapStateToProps, mapDispatchToProps)(SceneShaderView);
