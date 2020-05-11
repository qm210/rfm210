import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import MatrixRow from './MatrixRow';
import {pixelSize, pixelBorder} from '../Initial';

const mapStateToProps = state => ({
    pixels: state.Pixel.pixels
});

const StyledMatrix = styled.div`
    display: flex;
    flex-direction: column;
    border: ${2*pixelBorder}px solid black;
    width: ${({columns}) => columns * pixelSize}px;
    height: ${({rows}) => rows * (pixelSize + 2*pixelBorder)}px;
`

const Matrix = ({pixels}) =>
    <StyledMatrix
        columns = {pixels[0].length}
        rows = {pixels.length}>
        {
            pixels.map((pixelRow, row) =>
                <MatrixRow key={row} row={row} values={pixelRow}/>
            )
        }
    </StyledMatrix>;

export default connect(mapStateToProps)(Matrix);
