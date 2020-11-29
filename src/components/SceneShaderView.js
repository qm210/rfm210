import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ShadertoyReact from 'shadertoy-react';
import { ShaderFrame } from '.';
import { asFloat, asFloatOrStr, shadertoyify } from '../logic/shader';
import RectAlgebra from '../logic/RectAlgebra';
import { placeholder } from '../logic/glyph';
import { glslForPhrase, phraseFuncName, glslForGlyph, kerning, glyphFuncName, glslForRect } from '../logic/shader';
import { CodeFrame } from '.';
import { PHRASE, selectFigureList } from '../slices/sceneSlice';
import { fetchGlyphset } from '../slices/glyphsetSlice';
import { fetchLetterMap } from '../slices/glyphSlice';
import { initWidth, initHeight } from '../Initial';
import { Loader, Segment } from 'semantic-ui-react';

const sceneWidth = 640;
const sceneHeight = 320;

const joinLines = (array, indent) => array.map(it => ' '.repeat(indent) + it.toString()).join('\n');

const SceneShaderView = ()  => {
    const scene = useSelector(store => store.scene.current);
    const figureList = useSelector(selectFigureList);
    const glyphset = useSelector(store => store.glyphset);
    const dispatch = useDispatch();
    const [loader, setLoader] = useState(!glyphset.current);

    /*
    const [millis, setMillis] = useState(0);
    const reqRef = useRef();
    const prevReqRef = useRef();

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
    */

    React.useEffect(() => {
        if (glyphset.current) {
            return;
        }
        setLoader(true);
        dispatch(fetchGlyphset())
            .then(({firstGlyphset}) =>
                dispatch(fetchLetterMap(firstGlyphset)))
            .then(() =>
                setLoader(false)
            )
            .catch(error => console.warn("IN LOADING LETTER MAP:", error));
    }, [glyphset, dispatch, setLoader])


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
                qmds.push({start: asFloat(+start), end: asFloat(+end || scene.duration || 0), qmd, arg});
            }
        }
        return qmds;
    }, [scene.duration]);

    //const usesTime = React.useMemo(() => scene &&  scene.figures[0].qmd.length > 0, [scene]);
    const usesTime = true;

    const placeholderCode = React.useMemo(() => {
        const placeholderFunctionCall = figure =>
            `vec3 col_${figure.id} = c.xxx; placeholder(UV, vec2(${figure.x}, ${figure.y}), vec2(${figure.scale*figure.scaleX}, ${figure.scale*figure.scaleY}), col);`
        const lineArray = figureList
            .filter(figure => figure.placeholder)
            .map(placeholderFunctionCall);
        return joinLines(lineArray);
    }, [figureList]);

    const [terrifyingCode, glyphCode, phraseCode] = React.useMemo(() => {
        if (!glyphset.current) {
            return ['', '', ''];
        }
        var usedGlyphs = {};
        var terrifyingCode = '';
        var phraseCode = '';
        const transform = {};
        for (const figure of figureList.filter(figure => figure.type !== PHRASE)) {
            var phraseObjects = [];
            var postProcess = [];
            var params = [];
            const cosPhi = Math.cos(figure.phi);
            const sinPhi = Math.sin(figure.phi);

            // parse qmds
            const qmds = parsePhraseQmd(figure.qmd);

            transform[figure.id] = {
                offsetX: asFloat(figure.x),
                offsetY: asFloat(figure.y),
                rotate: asFloat(figure.phi),
            };

            // construct rects
            var maxWidth = 0;
            var maxHeight = 0;
            var lastChar = undefined;
            for (const char of figure.chars.split('')) {
                const glyph = glyphset.letterMap[char] || placeholder(initWidth, initHeight, char !== ' ');
                const pixelRects = RectAlgebra.getRequiredRectsForPixels(glyph.pixels);
                const kern = kerning(glyphset, lastChar, char);
                maxWidth += kern.x;
                const transform = {
                    offsetX: maxWidth * cosPhi + kern.y * sinPhi,
                    offsetY: maxWidth * sinPhi + kern.y * cosPhi,
                    rotate: 0,
                };
                phraseObjects.push({phrase: figure, char, glyph, pixelRects, transform});
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
            usedGlyphs = glyphset.current.letterMap.reduce((allLetters, glyph) => {
                if (!(glyph.letter in allLetters)) {
                    allLetters[glyph.letter] = RectAlgebra.getRequiredRectsForPixels(glyph.pixels);;
                }
                return allLetters;
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
            ) + glslForPhrase(figure, transform[figure.id]) + '\n' + ' '.repeat(8);
            phraseCode += `void ${phraseFuncName(figure)}(in vec2 UV, in vec2 shift, in float phi, in float scale, in float distort, in float spac, out float d)
    {d = 1.;
    ${phraseObjects.map(obj =>
        glslForGlyph(obj.glyph, obj.transform)).join('\n' + ' '.repeat(4))}
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
    }, [glyphset, parsePhraseQmd, figureList]);

    const shaderCode = React.useMemo(() => !scene ? '' : `
    precision highp float;
    varying vec2 uv;
    ${usesTime ? 'uniform float time;' : ''}
    const vec3 c = vec3(1.,0.,-1.);
    uniform vec2 iResolution; // qm hacked this

    const float w = .05;
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
    void rect(in vec2 uv, in vec4 rect, in vec2 shift, in float phi, in float scale, in float distort, inout float d)
    {
        mat2 R;
        rot(phi, R);
        R /= max(1.e-3, scale);
        dboxcombo(R*uv + PIXEL*(vec2(-rect.z,rect.w) + vec2(-2.*shift.x,2.*shift.y) + vec2(-2.*rect.x, 2.*rect.y)), vec2(rect.z,rect.w)*PIXEL, distort, d);
    }
    ${glyphCode}
    ${phraseCode}
    void placeholder (in vec2 coord, in vec2 center, in vec2 scale, inout vec3 col)
    {
        vec2 cent = (coord-center);
        vec2 centq = quant(cent/scale);
        float cnorm = max(abs(cent.x/scale.x), abs(cent.y/scale.y));

        if (cnorm < 1.)
        {
            if (cnorm > 1.-w)
            {
                col = c.xxx;
            }
            else if(w + centq.x > -centq.y + eps && centq.x < -centq.y + w) {col = .5*col;}
            else if(w + centq.x > centq.y + eps&& centq.x < centq.y + w) {col = .5*col;}
        }
    }
    void main()
    {
        ${usesTime ? `float t = mod(time, ${asFloat(scene.duration || 0)});` : ''}
        // vec2 uv = (fragCoord.xy-.5*iResolution.xy)/iResolution.y; // qm hack
        vec2 UV = vec2((uv.x - .5)*${asFloat(sceneWidth/sceneHeight)}, uv.y - .5); // qm hack
        vec3 col = vec3(1.,.8,1.);
        float d;
        float alpha = 1.;
        float blur = 1.;
        //this is where terrifyingCode was
        ${placeholderCode}
        gl_FragColor = vec4(clamp(col,0.,1.),1.); // qm hack fragColor -> gl_FragColor
    }`
        .replaceAll('PIXEL', '.005')
        .replaceAll('CONTOUR', '.01')
        .replaceAll('DARKBORDER', '.1')
        .replaceAll('DARKENING', 'col*col*col')
    , [placeholderCode, terrifyingCode, glyphCode, phraseCode, scene, usesTime]);

    return <>
        <Segment attached>
            <Loader active={loader} size="massive"/>
            <ShaderFrame
                style = {{
                    width: sceneWidth,
                    height: sceneHeight
                }}
                dummyProp = {shaderCode}
                >
                <b>This is the AWESOME part!</b><br/>
                <ShadertoyReact fs={shadertoyify(shaderCode)}/>
            </ShaderFrame>
        </Segment>
        <Segment>
            <CodeFrame>
                {shadertoyify(shaderCode)}
            </CodeFrame>
        </Segment>
    </>;
};

export default SceneShaderView;