import { asFloat, float, joinLines, newLine } from './shader';
import { validQmd, parseQmd } from '../components/FigureEditor';

export const generateShaders = (figureList, paramList) => {

    const sceneParams = paramList.map(it => it.name);
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

    const knownSubjects = ['x', 'y', 'phi', 'scale', 'scaleX', 'scaleY', 'alpha'];

    const placeholderFunctionCall = figure => {
        const prepare = [];
        const reverse = [];
        const vars = Object.fromEntries(knownSubjects.map(key => [key, float(figure[key])]));
        const qmds = figure.qmd.filter(validQmd).map(parseQmd);
        let counter = 0;
        for (const qmd of qmds) {
            if (qmd.action === 'animate') {
                if (knownSubjects.includes(qmd.subject)) {
                    const dynamicSubject = `${qmd.subject}${counter}`;
                    if (sceneParams.includes(qmd.param.func)) {
                        const tVar = qmd.param.timeScale === 1 ? 't' : `(t*${float(qmd.param.timeScale)})`;
                        let process = '';
                        if (qmd.param.scale !== 1) {
                            process += `${dynamicSubject}*=${float(qmd.param.scale)};`
                        }
                        if (qmd.param.shift !== 0) {
                            process += `${dynamicSubject}+=${float(qmd.param.shift)};`
                        }
                        prepare.push(
                            `float ${dynamicSubject} = ${vars[qmd.subject]}; ${qmd.param.func}(${tVar},${dynamicSubject});${process}`
                        );
                    }
                    vars[qmd.subject] = dynamicSubject;
                }
            }
            counter++;
        };

        return prepare.join(newLine(8)) + newLine(8) +
                `vec3 col_${figure.id} = c.xxx; mat2 R_${figure.id}; rot(${vars.phi}, R_${figure.id});
                placeholder(col, R_${figure.id}*(UV - vec2(${vars.x}, ${vars.y})), vec2(${vars.scale}*${vars.scaleX}, ${vars.scale}*${vars.scaleY}));\n`
                .replaceAll('                ', '        ');
    };

    const lineArray = figureList
        .filter(figure => figure.placeholder)
        .map(placeholderFunctionCall);
    return [
        joinLines(lineArray),
        paramCode
    ];
}