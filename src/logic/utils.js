export const millis = () => (new Date()).getTime();
export const sec = () => Math.round((new Date()).getTime() / 1000);

export const whenSubmitted = (event, func) => {
    if (['Enter', 'Backspace'].includes(event.key)) { // why is Backspace in there??
        func(event);
    }
};

export const joinObject = (obj, hSep, vSep) =>
    Object.entries(obj).map(e => e.join(hSep)).join(vSep);

export const splitToObject = (str, hSep, vSep) =>
    Object.fromEntries(str.split(vSep).map(e => e.split(hSep)));

