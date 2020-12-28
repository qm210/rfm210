export const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
export const clip = x => clamp(x, -1, 1);

export const millis = () => (new Date()).getTime();
export const sec = () => Math.round((new Date()).getTime() / 1000);

export const whenSubmitted = (event, func, additionalKeys = []) => {
    if (['Enter', ...additionalKeys].includes(event.key)) {
        func(event);
    }
};

export const joinObject = (obj, hSep, vSep) =>
    Object.entries(obj).map(e => e.join(hSep)).join(vSep);

export const splitToObject = (str, hSep, vSep) =>
    Object.fromEntries(str.split(vSep).map(e => e.split(hSep)));

export const objectWithout = (obj, excludes) =>
    Object.fromEntries(
        Object.entries(obj).filter(
            entry => !excludes.includes(entry[0])
        )
    );

export const groupArray = (array, n) => {
    const result = [];
    for (let i = 0; i < array.length / n; i++) {
        result.push(array.slice(n * i, n * (i + 1)));
    }
    while (result[result.length - 1].length < n) {
        result[result.length - 1].push(null);
    }
    return result;
};