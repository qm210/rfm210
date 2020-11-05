import React from 'react';
import { QuickButton, ButtonBar } from '../components';
import Matrix from './Matrix';
import { clearAllPixels, shiftUp, shiftDown, shiftLeft, shiftRight } from '../slices/glyphSlice';
import { useDispatch } from 'react-redux';


export default () => {
    const dispatch = useDispatch();
    return <div
        style={{
            display: "flex",
            flexDirection: "column",
        }}>
        <Matrix/>
        <ButtonBar>
            <QuickButton onClick = {() => dispatch(clearAllPixels())}>
                Clear!
            </QuickButton>
            <QuickButton onClick = {() => dispatch(shiftUp())}>
                &#8593;
            </QuickButton>
            <QuickButton onClick = {() => dispatch(shiftDown())}>
                &#8595;
            </QuickButton>
            <QuickButton onClick = {() => dispatch(shiftLeft())}>
                &#8592;
            </QuickButton>
            <QuickButton onClick = {() => dispatch(shiftRight())}>
                &#8594;
            </QuickButton>
        </ButtonBar>
    </div>;
}
