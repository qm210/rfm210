import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import Matrix from './Matrix';
import * as State from '../ReduxState';

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = (dispatch) => ({
    clearAllPixels: () => dispatch(State.clearAllPixels()),
    fillAllPixels: () => dispatch(State.fillAllPixels()),
    shiftUp: () => dispatch({type: State.SHIFT, payload: {y: -1}}),
    shiftDown: () => dispatch({type: State.SHIFT, payload: {y: +1}}),
    shiftLeft: () => dispatch({type: State.SHIFT, payload: {x: -1}}),
    shiftRight: () => dispatch({type: State.SHIFT, payload: {x: +1}}),
});

const QuickButton = styled.button`
    height: 50px;
    min-width: 50px;
    font-size: 20px;
    font-weight: bold;
    margin-left: 4px;
`

const MatrixView = ({clearAllPixels, shiftUp, shiftDown, shiftLeft, shiftRight}) =>
    <div
        style={{
            display: "flex",
            flexDirection: "column",
        }}>
        <Matrix/>
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                marginTop: 15,
                marginBottom: 15,
            }}>
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
        </div>
    </div>;

export default connect(mapStateToProps, mapDispatchToProps)(MatrixView);
