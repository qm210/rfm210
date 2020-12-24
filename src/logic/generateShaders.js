import { asFloat, float, joinLines } from './shader';
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
            // tension or other shapes...

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
            const paramFunc = qmd.param[0];
            if (qmd.action === 'animate') {
                if (knownSubjects.includes(qmd.subject)) {
                    const dynamicSubject = `${qmd.subject}${counter}`;
                    if (sceneParams.includes(paramFunc)) {
                        prepare.push(
                            `float ${dynamicSubject} = ${vars[qmd.subject]}; ${paramFunc}(t,${dynamicSubject});`
                        );
                    }
                    vars[qmd.subject] = dynamicSubject;
                }
            }
            counter++;
        };

        return prepare.join('\n        ') +
                `vec3 col_${figure.id} = c.xxx; mat2 R_${figure.id}; rot(${vars.phi}, R_${figure.id});
                placeholder(col, R_${figure.id}*(UV - vec2(${figure.x}, ${figure.y})), vec2(${figure.scale*figure.scaleX}, ${figure.scale*figure.scaleY}));\n`
                .replaceAll('                    ', '        ');
    };

    const lineArray = figureList
        .filter(figure => figure.placeholder)
        .map(placeholderFunctionCall);
    return [
        joinLines(lineArray),
        paramCode
    ];
}