// 2D array specific
export const update2D = (array2D, {row, column}, value) =>
    Object.assign([...array2D], {
        [row]: Object.assign([...array2D[row]], {
            [column]: value
        })
    });

export const at2D = (array2D, {row, column}) =>
    (array2D.length > 0) &&
    (row >= 0) &&
    (row < array2D.length) &&
    (column >= 0) &&
    (column < array2D[0].length) &&
    array2D[row][column];

export const new2D = (width, height, value = false) => Array(height).fill(Array(width).fill(value));

export const clone2D = (array2D) => array2D.map(rows => rows.slice(0));

export const fill2D = (array2D, value) => array2D.map(row => row.map(() => value));

export const isEmpty2D = (array2D) => array2D.every(row => row.every(entry => !entry));

export const width2D = (array2D) => array2D ? array2D[0] ? array2D[0].length : 0 : 0;

export const height2D = (array2D) => array2D ? array2D.length : 0;

export const size2D = (array2D) => ({width: width2D(array2D), height: height2D(array2D)});

export const resize2D = (array2D, width, height) => {
    const oldWidth = width2D(array2D);
    const oldHeight = height2D(array2D);
    if (width) {
        array2D.forEach((row, rowIndex) => {
            array2D[rowIndex] = width < oldWidth
                ? row.slice(0, width)
                : [...row, ...Array(width - oldWidth).fill(false)];
            }
        )
    }
    if (height) {
        array2D = height < height2D(array2D)
            ? array2D.slice(0, height)
            : [...array2D, ...Array(height - oldHeight).fill(Array(width || oldWidth).fill(false))]
    }
    return array2D;
}

// time specific
export const millis = () => (new Date()).getTime();
export const sec = () => Math.round((new Date()).getTime() / 1000);

// display specific
export const displayPixelSize = (pixels) => Math.round(33 * Math.sqrt(9 / width2D(pixels)));

// event specific
export const whenSubmitted = (event, func) => {
    event.persist();
    if (['Enter', 'Backspace'].includes(event.key)) {
        func(event);
    }
};

// input specific
export const joinObject = (obj, hSep, vSep) =>
    Object.entries(obj).map(e => e.join(hSep)).join(vSep);

export const splitToObject = (str, hSep, vSep) =>
    Object.fromEntries(str.split(vSep).map(e => e.split(hSep)));

