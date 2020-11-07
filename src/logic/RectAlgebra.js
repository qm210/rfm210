import {at2D, clone2D, isEmpty2D} from './array2d';

class Rect {
    constructor ({row, column, width, height}) {
        this.fromColumn = column;
        this.fromRow = row;
        this.toColumn = column + width;
        this.toRow = row + height;
        this.width = width;
        this.height = height;
        // why not...
        this.x = this.fromColumn;
        this.y = this.fromRow;
    }
    size() {return this.width * this.height;}
}

const nothingToLeft = (pixels, row, column) =>
    !at2D(pixels, {row, column: column - 1});

const nothingToRight = (pixels, row, column) =>
    !at2D(pixels, {row, column: column + 1});

const nothingAbove = (pixels, row, column) =>
    !at2D(pixels, {row: row - 1, column});

const nothingBelow = (pixels, row, column) =>
    !at2D(pixels, {row: row + 1, column});

const nothingAround = (...args) =>
    nothingToLeft(...args) && nothingToRight(...args) && nothingAbove(...args) && nothingBelow(...args);

const getMaxWidthToRight = (pixels, row, column) => {
    for (var maxWidth = 1; at2D(pixels, {row, column: column + maxWidth}); maxWidth++) {}
    return maxWidth;
}

const getMaxHeightDown = (pixels, row, column) => {
    for (var maxHeight = 1; at2D(pixels, {row: row + maxHeight, column}); maxHeight++) {}
    return maxHeight;
}

const getMaxWidthToRightWithHeight = (pixels, row, column, height) => {
    let maxWidth = Number.MAX_VALUE;
    for (var tryRow = row; tryRow < row + height; tryRow++) {
        maxWidth = Math.min(maxWidth, getMaxWidthToRight(pixels, tryRow, column));
    }
    return maxWidth;
}

const getAllRectsAndOrphanPixels = (pixels) => {
    const orphanPixels = [];
    const allRects = [];
    for (const [row, pixelRow] of pixels.entries()) {
        for (const [column, pixelValue] of pixelRow.entries()) {
            if (pixelValue) {
                if (nothingAround(pixels, row, column)) {
                    orphanPixels.push({row, column});
                }
                else if (nothingToLeft(pixels, row, column)) {
                    const maxWidth = getMaxWidthToRight(pixels, row, column);
                    for (let tryColumn = column; tryColumn < column + maxWidth; tryColumn++) {
                        const maxHeight = getMaxHeightDown(pixels, row, tryColumn);
                        for (let tryHeight = maxHeight; tryHeight > 0; tryHeight--) {
                            const newRect = new Rect({
                                row,
                                column: tryColumn,
                                width: getMaxWidthToRightWithHeight(pixels, row, tryColumn, tryHeight),
                                height: tryHeight
                            });
                            if (newRect.size() > 1) {
                                allRects.push(newRect);
                            }
                        }
                    }
                }
            }
        }
    }
    return [allRects, orphanPixels];
}

const getResultOfRemovingOrphans = (pixels, orphanPixels) => {
    const cleansedPixels = clone2D(pixels);
    for (const pixel of orphanPixels) {
        cleansedPixels[pixel.row][pixel.column] = false;
    }
    return cleansedPixels;
}

const getResultOfRemovingRect = (pixels, rect) => {
    let anyDifference = false;
    for(let rectRow = rect.fromRow; rectRow < rect.toRow; rectRow++) {
        for(let rectColumn = rect.fromColumn; rectColumn < rect.toColumn; rectColumn++) {
            anyDifference = anyDifference || pixels[rectRow][rectColumn];
            pixels[rectRow][rectColumn] = false;
        }
    }
    const isEmptyNow = isEmpty2D(pixels);
    return {pixels, anyDifference, isEmptyNow};
}

const getSufficientRects = (pixels, allRects, orphanPixels) => {
    allRects.sort((a, b) => a.size() < b.size());
    const sufficientRects = [];
    let remainingPixels = getResultOfRemovingOrphans(pixels, orphanPixels);
    for (const testRect of allRects) {
        const removalResult = getResultOfRemovingRect(remainingPixels, testRect);
        remainingPixels = removalResult.pixels;
        if (removalResult.anyDifference) {
            sufficientRects.push(testRect);
        }
        if (removalResult.isEmptyNow) {
            break;
        }
    }
    // TODO: think about only removing rects that are completely inside another, might avoid glitches at edges. If there are any. I don't know.
    return sufficientRects;
}

const getEverythingYouNeedAsRects = (pixels) => {
    const [allRects, orphanPixels] = getAllRectsAndOrphanPixels(pixels);
    const sufficientRects = getSufficientRects(pixels, allRects, orphanPixels);
    const orphanRects = orphanPixels.map(pixel => new Rect({
        row: pixel.row,
        column: pixel.column,
        width: 1,
        height: 1,
    }));
    return [...sufficientRects, ...orphanRects];
}

export default {
    getAllRectsAndOrphanPixels,
    getSufficientRects,
    getRequiredRectsForPixels: getEverythingYouNeedAsRects,
}