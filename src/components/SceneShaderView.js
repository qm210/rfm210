import React from 'react';
import {connect} from 'react-redux';
import {ShaderFrame} from '.';
import * as GL from 'gl-react';
import * as GLDom from 'gl-react-dom';
import RectAlgebra from '../RectAlgebra';
import * as State from '../ReduxState';
import {CodeFrame} from '../components';
import { shaderAlias } from '../GlyphModel';

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
        .replace('varying vec2 uv;\n', '')
        .replace(/uniform vec2 iResolution.*/, '')
        .replace('// vec2 uv', 'vec2 uv')
        .replace(/vec2 UV = .*/, 'vec2 UV = uv;')
        .replace('void main()', 'void mainImage( out vec4 fragColor, in vec2 fragCoord )')
        .replace('gl_FragColor', 'fragColor')
        .replace(/\+0\.,/g, ',')
        .replace(/\*1\.,/g, ',')
    );

const glslForRect = (rect) => {
    const {x, y, width, height} = rect;
    return `rect(UV,vec4(${x},${y},${width},${height}),shift,phi,scale,distort,d);`
};

const glslForGlyph = (glyph, transform) => {
    const {offsetX = 0, offsetY = 0, rotate = 0, scale = 1, alpha = 1, distort = 1.} = transform;
    return `${glyphFuncName(glyph.letter)}(UV,shift+vec2(${offsetX},${offsetY}),phi+${asFloatOrStr(rotate)},scale*${asFloatOrStr(scale)},alpha*${asFloatOrStr(alpha)},${asFloatOrStr(distort)},d);`;
};

const glslForPhrase = (phrase, transform) => {
    const {offsetX = 0, offsetY = 0, rotate = 0, scale = 1, alpha = 1, blur = 1, distort = 1.} = transform;
    return `${phraseFuncName(phrase)}(UV,vec2(${offsetX},${offsetY}),${asFloatOrStr(rotate)},${asFloatOrStr(scale)},${asFloatOrStr(alpha)},${asFloatOrStr(blur)},${asFloatOrStr(distort)},col);`;
}

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
        const phrase = scene.phrases[0];
        var objects = [];
        var postProcess = [];
        var params = [];
        var maxWidth = 0;
        var maxHeight = 0;
        const cosPhi = Math.cos(phrase.rotate);
        const sinPhi = Math.sin(phrase.rotate);

        // parse qmds
        const qmd0 = parsePhraseQmd(phrase.qmd);

        const phraseTransform = {
            offsetX: asFloat(phrase.x),
            offsetY: asFloat(phrase.y),
            rotate: asFloat(phrase.rotate),
        };

        // construct rects
        for (const char of phrase.chars.split('')) {
            const glyph = State.glyphForLetter(glyphset, char);
            const pixelRects = RectAlgebra.getRequiredRectsForPixels(glyph.pixels);
            const transform = {
                offsetX: maxWidth * cosPhi,
                offsetY: maxWidth * sinPhi,
                rotate: 0,
            };
            objects.push({char, glyph, pixelRects, transform});
            maxWidth += glyph.width;
            maxHeight = Math.max(maxHeight, glyph.height);
        }
        objects.forEach(obj =>
            obj.transform = {
                ...obj.transform,
                offsetX: obj.transform.offsetX - .5 * maxWidth * cosPhi - .5 * maxHeight * sinPhi,
                offsetY: obj.transform.offsetY + .5 * maxWidth * sinPhi - .5 * maxHeight * cosPhi,
            }
        );
        const usedGlyphs = objects.reduce((acc, obj) => {
            if (!(obj.char in acc)) {
                acc[obj.char] = obj.pixelRects;
            }
            return acc;
        }, {});
        for (const {start, end, qmd, arg} of qmd0) {
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
                    objects.forEach(obj => obj.transform.rotate += '+' + nextParamName);
                    break;
                default:
                    break;
            }
        }
        console.log(usedGlyphs);
        const terrifyingCode = params.map(p =>
            `float ${p.name} = (t >= ${p.start} && t < ${p.end}) ? ${p.code} : ${p.def};\n` + ' '.repeat(8)
        ) + glslForPhrase(phrase, phraseTransform);
        const glyphCode = `void glyph_undefined(in vec2 UV, in vec2 shift, in float phi, in float scale, in float alpha, in float distort, inout float d)
        {rect(UV,vec4(0,0,9,16),shift,phi,scale,distort,d);}
        ${
            Object.keys(usedGlyphs).map(glyph =>
                `void ${glyphFuncName(glyph)}(in vec2 UV, in vec2 shift, in float phi, in float scale, in float alpha, in float distort, inout float d)
                {
                    ${usedGlyphs[glyph].map(rect =>
                        glslForRect(rect)
                    ).join('')}
                    //col.a = alpha;
                }\n`
            ).join('')
        }`;
        const phraseCode = `void ${phraseFuncName(phrase)}(in vec2 UV, in vec2 shift, in float phi, in float scale, in float alpha, in float blur, in float distort, inout vec4 col)
        {
            float d = 1.;
            ${objects.map(obj =>
                glslForGlyph(obj.glyph, obj.transform)
            ).join('\n' + ' '.repeat(8))}
            col = mix(col, c.yyyx, sm(d, blur));
        }`
        return [terrifyingCode, glyphCode, phraseCode];
    }, [scene, glyphset, parsePhraseQmd]);

    const shaderCode = React.useMemo(() => GL.GLSL`
    precision highp float;
    varying vec2 uv;
    ${usesTime ? 'uniform float time;' : ''}
    const vec3 c = vec3(1.,0.,-1.);
    uniform vec2 iResolution; // qm hacked this

    ${Object.keys(defines).map(key => `#define ${key} ${defines[key]}`).join('\n')} // nr4 advice: hardcode replace these
    #define PIXEL .005

    void dbox(in vec2 x, in vec2 b, in float distort, inout float d)
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
        //dbox(R*uv + PIXEL*(vec2(-rect.z,rect.w) + R*vec2(-2.*shift.x,2.*shift.y) + vec2(-2.*rect.x, 2.*rect.y)), vec2(rect.z,rect.w)*PIXEL, d);
        dbox(R*uv + PIXEL*(vec2(-rect.z,rect.w) + vec2(-2.*shift.x,2.*shift.y) + vec2(-2.*rect.x, 2.*rect.y)), vec2(rect.z,rect.w)*PIXEL, distort, d);
    }
    ${glyphCode}
    ${phraseCode}
//        void mainImage( out vec4 fragColor, in vec2 fragCoord ) // qm hack
    void main()
    {
        ${usesTime ? `float t = mod(time, ${asFloat(scene.duration)});` : ''}
        // vec2 uv = (fragCoord.xy-.5*iResolution.xy)/iResolution.y; // qm hack
        vec2 UV = vec2((uv.x - .5)*${asFloat(scene.width/scene.height)}, uv.y - .5); // qm hack
        vec4 col = c.xxxx;
        ${terrifyingCode}
        gl_FragColor = vec4(clamp(col,0.,1.)); // qm hack fragColor -> gl_FragColor
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
            <GLDom.Surface width={scene.width} height={scene.height}>
                <GL.Node
                    shader={shaders.nr4template}
                    uniforms={{
                        iResolution: [scene.width, scene.height],
                        ...(usesTime ? {time: millis/1000} : {})
                    }}
                />
            </GLDom.Surface>
        </ShaderFrame>
        <CodeFrame>
            {shadertoyify(shaderCode)}
        </CodeFrame>
    </>;
};

export default connect(mapStateToProps, mapDispatchToProps)(SceneShaderView);
