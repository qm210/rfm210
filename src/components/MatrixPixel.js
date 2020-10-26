import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { togglePixel, setPixel, enterDragMode, leaveDragMode, fillArea } from '../slices/glyphSlice';
import { at2D, displayPixelSize } from '../Utils';

const CheckBox = styled.div`
    background-color: ${props => props.value ? "black" : "white"};
    border: 1px solid black;
`

const MatrixPixel = ({coord}) => {
    const value = useSelector(state => at2D(state.glyph.pixels, coord));
    const [dragMode, dragValue] = useSelector(state => [state.glyph.dragMode, state.glyph.dragValue]);
    const pixelSize = useSelector(state => displayPixelSize(state.glyph.pixels));
    const id = useSelector(state => state.glyph._id);
    const dispatch = useDispatch();

    const enterDragModeWithValue = React.useCallback(event => {
        event.preventDefault();
        if (event.ctrlKey) {
            dispatch(setPixel(true));
            dispatch(enterDragMode(true));
        } else {
            dispatch(togglePixel());
            dispatch(enterDragMode(!value));
        }
    }, [dispatch, value]);

    return !id ? null : <CheckBox
        value = {value}
        onMouseDown = {() => dispatch(enterDragModeWithValue())}
        onMouseUp = {() => dispatch(leaveDragMode())}
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
