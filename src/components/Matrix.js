import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import MatrixRow from './MatrixRow';
import {width2D, height2D, displayPixelSize} from '../Utils';

const mapStateToProps = state => ({
    pixels: state.Pixel.pixels
});

const Matrix = ({pixels}) => {
    const StyledMatrix = styled.div`
        display: flex;
        flex-direction: column;
        border: 2px solid black;
        width: ${width2D(pixels) * displayPixelSize(pixels)}px;
        height: ${height2D(pixels) * (displayPixelSize(pixels) + 2)}px;
    `
    return <StyledMatrix>
        {
            pixels.map((pixelRow, row) =>
                <MatrixRow key={row} row={row} values={pixelRow}/>
            )
        }
    </StyledMatrix>;
}

export default connect(mapStateToProps)(Matrix);
