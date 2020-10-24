import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { leaveDragMode } from '../slices/glyphSlice';
import MatrixRow from './MatrixRow';
import { width2D, height2D, displayPixelSize } from '../Utils';

const StyledMatrix = styled.div`
    display: flex;
    flex-direction: column;
    border: 2px solid black;
`;

const Matrix = () => {
    const pixels = useSelector(state => state.glyph.pixels);
    return <StyledMatrix
        style = {{
            width: width2D(pixels) * displayPixelSize(pixels),
            height: height2D(pixels) * displayPixelSize(pixels) + 4,
        }}
        pixels = {pixels}
        onMouseLeave = {leaveDragMode}
        >
        {
            pixels.map((pixelRow, row) =>
                <MatrixRow key={row} row={row} values={pixelRow}/>
            )
        }
    </StyledMatrix>
};

export default Matrix;
