import React from 'react';
import { QuickButton, ButtonBar } from '../components';
import Matrix from './Matrix';
import { clearAllPixels, shiftUp, shiftDown, shiftLeft, shiftRight } from '../slices/glyphSlice';
import { useDispatch } from 'react-redux';
import { SYMBOL } from './../const';


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
                {SYMBOL.UP}
            </QuickButton>
            <QuickButton onClick = {() => dispatch(shiftDown())}>
                {SYMBOL.DOWN}
            </QuickButton>
            <QuickButton onClick = {() => dispatch(shiftLeft())}>
                {SYMBOL.LEFT}
            </QuickButton>
            <QuickButton onClick = {() => dispatch(shiftRight())}>
                {SYMBOL.RIGHT}
            </QuickButton>
        </ButtonBar>
    </div>;
}
