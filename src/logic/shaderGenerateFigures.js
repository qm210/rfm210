import { float, joinLines, newLine, asFloat } from './shaderHelpers';
import { validQmd, parseQmd, activeQmd, getSubjects, getAllSubjects, getShaderFuncName } from '../components/FigureEditor';
import { PHRASE } from '../slices/sceneSlice';
import { placeholder } from './glyph';
import { initWidth, initHeight } from '../Initial';
import { getRequiredRectsForPixels } from './RectAlgebra';
import { shaderAlias } from './glyph';
import { kerning } from './shaderHelpers';
import { findInLetterMap } from './glyph';

export const generateFigureCode = (figureList, glyphlist) =>
    figureList.map(figure =>
        figure.type === PHRASE
            ? generatePhraseCode(figure, glyphlist)
            : figure.shaderFunc
    ).join('\n');

const rectCall = (rect) => {
    const {x, y, width, height} = rect;
    return `rect(d,coord,${float(x)}+shift.x,${float(y)}+shift.y,${float(width)},${float(height)},border);`
        .replaceAll(',0.+', ',')
};

const glyphFuncName = (letter) => `glyph_${shaderAlias(letter)}`;

const phraseFuncName = (figure) => `phrase_${[...figure.chars].map(char => shaderAlias(char)).join('')}`;

export const generatePhraseCode = (figure, glyphset) => {
    if (!figure || !glyphset.letterMap) {
        return '';
    }
    let phraseCode = '';
    let phraseObjects = [];
    let maxWidth = 0;
    let maxHeight = 0;
    let lastChar = undefined;
    for (const char of figure.chars.split('')) {
        const glyph = findInLetterMap(glyphset, char) || placeholder(initWidth, initHeight, char !== ' ');
        const pixelRects = getRequiredRectsForPixels(glyph.pixels);
        const kern = kerning(glyphset, lastChar, char);
        maxWidth += kern.x;
        const transform = {
            offsetX: maxWidth,
            offsetY: kern.y,
        };
        phraseObjects.push({phrase: figure, char, glyph, pixelRects, transform});
        maxHeight = Math.max(maxHeight, glyph.height);
        maxWidth += glyph.width;
        lastChar = char;
    }
    const halfWidth = .5 * maxWidth;
    const halfHeight = .5 * maxHeight;

    const glyphCall = (obj) => {
        const {offsetX = 0, offsetY = 0} = obj.transform;
        const shift = `vec2(${float(offsetX-halfWidth)}*spacing,${float(offsetY-halfHeight)})`
            .replaceAll(/(?<!\d)0.\*spacing-/g, '-')
            .replaceAll(/(?<!\d)0.-/g, '-');
        return `${glyphFuncName(obj.char)}(d,coord,${shift},border);`;
    };

    phraseCode += `void ${phraseFuncName(figure)}(inout vec3 col, vec2 coord, float alpha, float border, float spacing, float blur) {
  float d = 1.;
  ${phraseObjects.map(glyphCall).join(newLine(2))}
  col = mix(col, DARKENING, DARKBORDER * sm(d, blur));
  col = mix(col, c.yyy, alpha*sm(d-.0005, blur));
}`

    return phraseCode;
}

export const generateGlyphCode = (usedGlyphs) => {
    let glyphCode = `void glyph_undefined(inout float d, in vec2 coord, vec2 shift, float border) {
  rect(d,coord,shift.x,shift.y,${float(initWidth)},${float(initHeight)},border); }`;

    Object.entries(usedGlyphs).forEach(([glyph, pixels]) => {
        const header = `void ${glyphFuncName(glyph)}(inout float d, in vec2 coord, in vec2 shift, in float border)`;
        const body = newLine(2) + pixels.map(rectCall).join(newLine(2));
        glyphCode += `\n${header}{${body}}`;
    });

    return glyphCode;
};

export const generateCalls = (figureList, paramList) => {

    const sceneParams = paramList.map(it => it.name);

    let counter = 0;

    const functionCall = figure => {
        const allSubjects = getAllSubjects(figure);
        const varInit = [];
        const varPrepare = [];
        const varCleanup = [];
        const vars = Object.fromEntries(allSubjects.map(key => [key, float(figure[key])]));
        const qmds = figure.qmd.filter(validQmd).filter(activeQmd).map(parseQmd);
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
            `R_${figure.id}*(UV - vec2(${vars.x}, ${vars.y}))/vec2(${vars.scale}*${vars.scaleX}, ${vars.scale}*${vars.scaleY})`;

        let funcName = '';
        if (figure.placeholder) {
            funcName = 'placeholder';
        }
        else if (figure.type === PHRASE) {
            funcName = phraseFuncName(figure);
        }
        else {
            funcName = getShaderFuncName(figure.shaderFunc);
        }
        const extraArgs = getSubjects(figure).map(subject => `,${vars[subject]}`).join('');
        const colVar = `col${figure.id}`;
        const funcCall = `${funcName}(${colVar}, ${coord(figure, vars)}, ${float(figure.alpha)}${extraArgs});\n`
        const mixColor = `col *= ${colVar};`

        return (
            varInit.join(newLine(4)) + newLine(4) +
            varPrepare.join(newLine(4)) + newLine(4) +
            `vec3 ${colVar} = c.xxx; mat2 R_${figure.id}; rot(${vars.phi}, R_${figure.id});
            ${funcCall}
            ${mixColor}`
            + varCleanup.join(newLine(4))
        ).replaceAll(/ {4}[ ]*/g, ' '.repeat(4));
    };

    return joinLines(figureList
        .map(functionCall));
};
