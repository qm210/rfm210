import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import Matrix from './Matrix';
import * as Pixel from '../ducks/Pixel';

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = (dispatch) => ({
    clearAllPixels: () => dispatch(Pixel.clearAllPixels()),
    fillAllPixels: () => dispatch(Pixel.fillAllPixels()),
});

const QuickButton = styled.button`
    height: 50px;
    font-size: 20px;
    font-weight: bold;
    margin-left: 20px;
`

const MatrixView = ({clearAllPixels, fillAllPixels}) =>
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
                marginTop: 20,
            }}>
            <QuickButton onClick = {clearAllPixels}>
                Clear!
            </QuickButton>
            <QuickButton onClick = {fillAllPixels}>
                Fill All
            </QuickButton>
        </div>
    </div>;

export default connect(mapStateToProps, mapDispatchToProps)(MatrixView);
