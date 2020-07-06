import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import * as State from '../ReduxState';
import MatrixRow from './MatrixRow';
import {width2D, height2D, displayPixelSize} from '../Utils';

const mapStateToProps = state => ({
    pixels: State.currentPixels(state),
    dummyForRerender: State.currentPixels(state)[0]
});

const mapDispatchToProps = dispatch => ({
    leaveDragMode: () => dispatch({type: State.LEAVE_DRAGMODE, payload: {value: false}}),
})

const StyledMatrix = styled.div`
    display: flex;
    flex-direction: column;
    border: 2px solid black;
    width: ${({pixels}) => width2D(pixels) * displayPixelSize(pixels)}px;
    height: ${({pixels}) => height2D(pixels) * displayPixelSize(pixels) + 4}px;
`;

const Matrix = ({pixels, leaveDragMode}) => {
    return <StyledMatrix
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

export default connect(mapStateToProps, mapDispatchToProps)(Matrix);
