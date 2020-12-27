import { float, joinLines, newLine, asFloat, asFloatOrStr } from './shaderHelpers';
import { validQmd, parseQmd, activeQmd, getSubjects, getAllSubjects, getShaderFuncName } from '../components/FigureEditor';
import { PHRASE } from '../slices/sceneSlice';
import { placeholder } from './glyph';
import { initWidth, initHeight } from '../Initial';
import { getRequiredRectsForPixels } from './RectAlgebra';
import { shaderAlias } from './glyph';
import { kerning } from './shaderHelpers';

export const rectCall = (rect) => {
    const {x, y, width, height} = rect;
    return `rect(d,coord,vec4(${x},${y},${width},${height}),shift,phi,scale,distort,d);`
};

export const glyphCall = (glyph, transform) => {
    const {offsetX = 0, offsetY = 0, rotate = 0, scale = 1, distort = 1.} = transform;
    return `${glyphFuncName(glyph.letter)}(d,coord,shift+vec2(${asFloatOrStr(offsetX)}*spac,${asFloatOrStr(offsetY)}),phi+${asFloatOrStr(rotate)},scale*${asFloatOrStr(scale)},distort*${asFloatOrStr(distort)});`;
};

export const glyphFuncName = (letter) => `glyph_${shaderAlias(letter)}`;

export const phraseFuncName = (phrase) => `phrase_${[...phrase.chars].map(char => shaderAlias(char)).join('')}`;

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
            const dt = t1 - t0;

            let func;
            if (param.tension !== 0) {
                if (param.tension > 0) {
                    const fractM = float(1/dt);
                    const fractB = float(-t0 / dt);
                    func = `pow(${fractB}+${fractM}*t, ${float(1 + param.tension/4)})`
                }
                else {
                    const fractM = float(-1/dt);
                    const fractB = float(t1 / dt);
                    func = `(1.-pow(${fractB}+${fractM}*t, ${float(1 - param.tension/4)}))`
                }
                func = `${float(curr.y)} + ${float(next.y - curr.y)}*${func}`;
            }
            else {
                const m = (next.y - curr.y) / dt;
                const b = -t0 * m + curr.y;
                func = `${float(b)} + ${float(m)}*t`;
            }

            body += `(t >= ${float(t0)} && t < ${float(t1)}) ? ${func}:`;
        }
        body += float(lastValue) + ';';
        const footer = '}'
        paramCode[param.name] = header + body + footer;
    }
    return Object.values(paramCode).join('\n');
}

export const generateFigureCode = (figureList) =>
    figureList
        .filter(figure => figure.type !== PHRASE)
        .map(figure => figure.shaderFunc)
        .join('\n');


export const generatePhraseCode = (figureList, glyphset) => {
    if (!figureList || figureList[0] === null || !glyphset.letterMap) {
        return '';
    }
    let phraseCode = '';
    var phraseObjects = [];
    const transform = {};

    for(const figure of figureList.filter(figure => figure.type === PHRASE)) {
        const cosPhi = Math.cos(figure.phi);
        const sinPhi = Math.sin(figure.phi);

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
            const pixelRects = getRequiredRectsForPixels(glyph.pixels);
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
        const alpha = 1;
        const blur = .5;
        const body = phraseObjects.map(obj => glyphCall(obj.glyph, obj.transform)).join(newLine(2));
        phraseCode += `void ${phraseFuncName(figure)}(inout vec3 col, in vec2 coord, in float distort, in float spac)
{float d = 1.;
  ${body}
  col = mix(col, DARKENING, DARKBORDER * ${asFloatOrStr(alpha)} * sm(d-CONTOUR, ${asFloatOrStr(blur)}));\n
  col = mix(col, c.xxx, ${asFloatOrStr(alpha)} * sm(d-.0005,    ${asFloatOrStr(blur)}));
}`
    }
    return phraseCode;
}

export const generateGlyphCode = (usedGlyphs) => {
    let glyphCode = `void glyph_undefined(inout float d, in vec2 coord, in vec2 shift, in float phi, in float scale, in float distort)
    {rect(d,coord,vec4(0,0,9,16),shift,phi,scale,distort);}`;
    Object.entries(usedGlyphs).forEach(([glyph, pixels]) => {
        const header = `void ${glyphFuncName(glyph)}(inout float d, in vec2 coord, in vec2 shift, in float phi, in float scale, in float distort)`;
        const body = pixels.map(rectCall).join('');
        glyphCode += `${newLine(2)}${header}{${body}}`;
    });
    return glyphCode;
};

export const generateCalls = (figureList, paramList) => {

    const sceneParams = paramList.map(it => it.name);

    const functionCall = figure => {
        const allSubjects = getAllSubjects(figure);
        const varInit = [];
        const varPrepare = [];
        const varCleanup = [];
        const vars = Object.fromEntries(allSubjects.map(key => [key, float(figure[key])]));
        const qmds = figure.qmd.filter(validQmd).filter(activeQmd).map(parseQmd);
        let counter = 0;
        for (const qmd of qmds) {
            if (qmd.action === 'animate') {
                if (allSubjects.includes(qmd.subject)) {
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
                        let paramCall = `${qmd.param.func}(min(${tVar},${tEnd})-${tStart},${dynamicSubject});${process}`;
                        if (qmd.timeStart) {
                            paramCall = `if(t>${tStart}){${paramCall}}`;
                        }

                        varInit.push(`float ${dynamicSubject}=${vars[qmd.subject]};`);
                        varPrepare.push(paramCall);
                    }
                    vars[qmd.subject] = dynamicSubject;
                }
            }
            counter++;
        };

        const coord = (figure, vars) =>
            `R_${figure.id}*(UV/vec2(${vars.scale}*${vars.scaleX}, ${vars.scale}*${vars.scaleY}) - vec2(${vars.x}, ${vars.y})`;

        let funcName = '';
        let extraSubjects = [];
        if (figure.type === PHRASE && !figure.placeholder) {
            funcName = phraseFuncName(figure);
            extraSubjects = ['distort', 'spacing'];
            vars.distort = '.5';
            vars.spacing = '.1';
        }
        else {
            funcName = figure.placeholder ? 'placeholder' : getShaderFuncName(figure.shaderFunc);
            extraSubjects = getSubjects(figure);
        }
        const extraArgs = extraSubjects.map(subject => `,${vars[subject]}`).join('');
        const funcCall = `${funcName}(col, ${coord(figure, vars)})${extraArgs});\n`

        return (
            varInit.join(newLine(4)) + newLine(4) +
            varPrepare.join(newLine(4)) + newLine(4) +
            `vec3 col_${figure.id} = c.xxx; mat2 R_${figure.id}; rot(${vars.phi}, R_${figure.id});
            ${funcCall}`
            + varCleanup.join(newLine(4))
        ).replaceAll(/ {4}[ ]*/g, ' '.repeat(4));
    };

    return joinLines(figureList
        .map(functionCall));
};
