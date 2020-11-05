import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { togglePixel, setPixel, enterDragMode, leaveDragMode, fillArea } from '../slices/glyphSlice';
import { at2D, displayPixelSize } from '../Utils';

const CheckBox = styled.div`
    background-color: ${props => props.value ? "black" : "white"};
    border: 1px solid black;
`

export default ({coord}) => {
    const value = useSelector(state => at2D(state.glyph.current.pixels, coord));
    const [dragMode, dragValue] = useSelector(state => [state.glyph.dragMode, state.glyph.dragValue]);
    const pixelSize = useSelector(state => displayPixelSize(state.glyph.current.pixels));
    const id = useSelector(state => state.glyph.current._id);
    const dispatch = useDispatch();

    const enterDragModeWithValue = React.useCallback(event => {
        event.preventDefault();
        if (event.ctrlKey) {
            dispatch(setPixel({coord, value: true}));
            dispatch(enterDragMode(true));
        } else {
            dispatch(togglePixel(coord));
            dispatch(enterDragMode(!value));
        }
    }, [dispatch, coord, value]);

    return !id ? null : <CheckBox
        value = {value}
        onMouseDown = {enterDragModeWithValue}
        onMouseUp = {() =>
            dispatch(leaveDragMode())
        }
        onContextMenu = {event => {
            event.preventDefault();
            console.log("fill!", coord, !value);
            dispatch(fillArea({coord, value}));
        }}
        onMouseEnter = {() =>
            dragMode && dispatch(
                setPixel({
                    coord,
                    value: dragValue
                })
        )}
        title = {`(${coord.column}, ${coord.row})`}
        style = {{
            width: pixelSize,
            height: pixelSize,
        }}
    />;
};
