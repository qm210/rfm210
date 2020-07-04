import React from 'react';
import {connect} from 'react-redux';
import {QuickButton} from '../components';
import Matrix from './Matrix';
import * as State from '../ReduxState';

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = (dispatch) => ({
    clearAllPixels: () => dispatch(State.clearAllPixels()),
    fillAllPixels: () => dispatch(State.fillAllPixels()),
    shiftUp: () => dispatch({type: State.SHIFT_UP}),
    shiftDown: () => dispatch({type: State.SHIFT_DOWN}),
    shiftLeft: () => dispatch({type: State.SHIFT_LEFT}),
    shiftRight: () => dispatch({type: State.SHIFT_RIGHT}),
});

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
