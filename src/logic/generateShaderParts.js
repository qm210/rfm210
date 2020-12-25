import { float, joinLines, newLine } from './shader';
import { validQmd, parseQmd, activeQmd } from '../components/FigureEditor';

const knownSubjects = ['x', 'y', 'phi', 'scale', 'scaleX', 'scaleY', 'alpha'];

export const generateParamCode = (paramList) => {
    const paramCode = {};
    for (const param of paramList) {
        const header = `void ${param.name}(in float t, out float p){t=mod(t,${float(param.timeScale)});`
        const lastValue = param.points.length === 0 ? 0 : param.points.slice(-1)[0].y || 0;
        let body = 'p=';
        for (let k = 0; k < param.points.length - 1; k++) {
            const curr = param.points[k];
            const next = param.points[k+1];
            const t0 = curr.x * param.timeScale;
            const t1 = next.x * param.timeScale;

            const m = (next.y - curr.y)/(t1 - t0);
            const b = -t0 * m + curr.y;
            let func = `${float(b)} + ${float(m)}*t`;
            if (param.tension !== 0) {
                if (param.tension > 0) {
                    const fractM = float(1/(next.x - curr.x));
                    const fractB = float(-curr.x / (next.x - curr.x));
                    func = `pow(${fractB}+${fractM}*t, ${float(1 + param.tension/4)})`
                }
                else {
                    const fractM = float(-1/(next.x - curr.x));
                    const fractB = float(next.x / (next.x - curr.x));
                    func = `(1.-pow(${fractB}+${fractM}*t, ${float(1 - param.tension/4)}))`
                }
                func = `${float(curr.y)} + ${float(next.y - curr.y)}*${func}`;
            }

            body += `(t >= ${float(t0)} && t < ${float(t1)}) ? ${func}:`;
        }
        body += float(lastValue) + ';';
        const footer = '}'
        paramCode[param.name] = header + body + footer;
    }
    return paramCode;
}

export const generatePlaceHolderCode = (figureList, paramList) => {

    const sceneParams = paramList.map(it => it.name);

    const placeholderFunctionCall = figure => {
        const varInit = [];
        const varPrepare = [];
        const varCleanup = [];
        const vars = Object.fromEntries(knownSubjects.map(key => [key, float(figure[key])]));
        const qmds = figure.qmd.filter(validQmd).filter(activeQmd).map(parseQmd);
        let counter = 0;
        for (const qmd of qmds) {
            if (qmd.action === 'animate') {
                if (knownSubjects.includes(qmd.subject)) {
                    const dynamicSubject = `${qmd.subject}${counter}`;
                    if (sceneParams.includes(qmd.param.func)) {
                        const tVar = qmd.param.timeScale === 1 ? 't' : `(t*${float(qmd.param.timeScale)})`;
                        const tStart = float(qmd.timeStart);
                        const tEnd = float(qmd.timeEnd);
                        let process = '';
                        if (qmd.param.scale !== 1) {
                            process += `${dynamicSubject}*=${float(qmd.param.scale)};`
                        }
                        if (qmd.param.shift !== 0) {
                            process += `${dynamicSubject}+=${float(qmd.param.shift)};`
                        }
                        if (qmd.mode === '+') {
                            process += `${dynamicSubject}+=${vars[qmd.subject]};`
                        }
                        varInit.push(
                            `float ${dynamicSubject}=${vars[qmd.subject]};`
                        );
                        varPrepare.push(
                            `if(t>${tStart}){${qmd.param.func}(min(${tVar},${tEnd})-${tStart},${dynamicSubject});${process}}`
                        );
                    }
                    vars[qmd.subject] = dynamicSubject;
                }
            }
            counter++;
        };

        return (
            varInit.join(newLine(8)) + newLine(8) +
            varPrepare.join(newLine(8)) + newLine(8) +
            `vec3 col_${figure.id} = c.xxx; mat2 R_${figure.id}; rot(${vars.phi}, R_${figure.id});
            placeholder(col, R_${figure.id}*(UV - vec2(${vars.x}, ${vars.y})), vec2(${vars.scale}*${vars.scaleX}, ${vars.scale}*${vars.scaleY}));\n`
            + varCleanup.join(newLine(8))
        ).replaceAll(/ {8}[ ]*/g, ' '.repeat(8));
    };

    const lineArray = figureList
        .filter(figure => figure.placeholder)
        .map(placeholderFunctionCall);

    return joinLines(lineArray);
};

/*
const [terrifyingCode, glyphCode, phraseCode] = ([glyphset, parsePhraseQmd, figureList], glyphset) => {
    if (!glyphset.current || !glyphset.letterMap) {
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
});
*/