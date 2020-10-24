import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import * as State from '../slices/glyphSlice';
import {at2D, displayPixelSize} from '../Utils';

const CheckBox = styled.div`
    background-color: ${props => props.value ? "black" : "white"};
    border: 1px solid black;
`

const MatrixPixel = ({coord, togglePixel, setPixel, fillArea,
    enterDragMode, leaveDragMode}) => {
    const value = useSelector(state => at2D(state.glyph.pixels, coord));
    const [dragMode, dragValue] = useSelector(state => [state.glyph.dragMode, state.glyph.dragValue]);
    const pixelSize = useSelector(state => displayPixelSize(state.glyph.pixels));
    const dispatch = useDispatch();
    /*
    togglePixel: () => dispatch(State.togglePixel(coord)),
    setPixel: (value) => dispatch(State.setPixel(coord, value)),
    enterDragMode: (value) => dispatch(State.enterDragMode(coord, value)),
    leaveDragMode: () => dispatch(State.leaveDragMode()),
    fillArea: (value) => dispatch(State.fillArea(coord, value)),
    */

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

export default MatrixPixel;
