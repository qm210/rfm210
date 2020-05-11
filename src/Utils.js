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

export const new2D = (width, height, value = false) => Array(height).fill(Array(width).fill(false));

export const clone2D = (array2D) => array2D.map(rows => rows.slice(0));

export const fill2D = (array2D, value) => array2D.map(row => row.map(() => value));

export const isEmpty2D = (array2D) => array2D.every(row => row.every(entry => !entry));

export const size2D = (array2D) => array2D ? {width: array2D[0].length, height: array2D.length} : {width: 0, height: 0};