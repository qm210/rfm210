import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import * as State from '../ReduxState';
import {at2D, displayPixelSize} from '../Utils';

const mapStateToProps = (state, {coord}) => ({
    value: at2D(State.currentPixels(state), coord),
    dragMode: state.dragMode,
    dragValue: state.dragValue,
    pixelSize: displayPixelSize(State.currentPixels(state)),
});

const mapDispatchToProps = (dispatch, {coord}) => ({
    togglePixel: () => dispatch(State.togglePixel(coord)),
    setPixel: (value) => dispatch(State.setPixel(coord, value)),
    enterDragMode: (value) => dispatch(State.enterDragMode(coord, value)),
    leaveDragMode: () => dispatch(State.leaveDragMode()),
    fillArea: (value) => dispatch(State.fillArea(coord, value)),
});

const CheckBox = styled.div`
    background-color: ${props => props.value ? "black" : "white"};
    border: 1px solid black;
`

const MatrixPixel = ({value, coord, dragMode, dragValue, pixelSize, togglePixel, setPixel, fillArea,
    enterDragMode, leaveDragMode}) => {

    const enterDragModeWithValue = React.useCallback(event => {
        event.preventDefault();
        if (event.ctrlKey) {
            setPixel(true);
            enterDragMode(true);
        } else {
            togglePixel();
            enterDragMode(!value);
        }
    }, [togglePixel, setPixel, enterDragMode, value]);

    return <CheckBox
        value = {value}
        onMouseDown = {enterDragModeWithValue}
        onMouseUp = {leaveDragMode}
        onContextMenu = {(event) => {event.preventDefault(); fillArea(value);}}
        onMouseEnter = {() => dragMode ? setPixel(dragValue) : {}}
        title = {`(${coord.column}, ${coord.row})`}
        style = {{
            width: pixelSize,
            height: pixelSize,
        }}
    />;
};

export default connect(mapStateToProps, mapDispatchToProps)(MatrixPixel);
