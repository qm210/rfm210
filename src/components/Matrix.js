import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { leaveDragMode } from '../slices/glyphSlice';
import MatrixRow from './MatrixRow';
import { width2D, height2D, displayNicePixelSize } from '../logic/array2d';

const StyledMatrix = styled.div`
    display: flex;
    flex-direction: column;
    border: 2px solid black;
`;

export default () => {
    const glyph = useSelector(state => state.glyph.current);
    if (!glyph) {
        return <div>No Glyph Selected.</div>
    }
    const pixels = glyph.pixels;
    return <StyledMatrix
        style = {{
            width: width2D(pixels) * displayNicePixelSize(pixels),
            height: height2D(pixels) * displayNicePixelSize(pixels) + 4,
        }}
        pixels = {pixels}
        onMouseLeave = {leaveDragMode}
        >
        {
            pixels.map((pixelRow, row) =>
                <MatrixRow key={row} row={row} values={pixelRow}/>
            )
        }
    </StyledMatrix>;
};
