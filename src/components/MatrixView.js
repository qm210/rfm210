import React from 'react';
import { QuickButton, ButtonBar } from '../components';
import Matrix from './Matrix';
import { clearAllPixels, shiftUp, shiftDown, shiftLeft, shiftRight } from '../slices/glyphSlice';


const MatrixView = () => {
    return <div
        style={{
            display: "flex",
            flexDirection: "column",
        }}>
        <Matrix/>
        <ButtonBar>
            <QuickButton onClick = {clearAllPixels}>
                Clear!
            </QuickButton>
            <QuickButton onClick = {shiftUp}>
                &#8593;
            </QuickButton>
            <QuickButton onClick = {shiftDown}>
                &#8595;
            </QuickButton>
            <QuickButton onClick = {shiftLeft}>
                &#8592;
            </QuickButton>
            <QuickButton onClick = {shiftRight}>
                &#8594;
            </QuickButton>
        </ButtonBar>
    </div>;
}

export default MatrixView;
