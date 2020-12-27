import { float } from './shaderHelpers';

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

