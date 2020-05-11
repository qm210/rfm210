import React from 'react';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import styled from 'styled-components';
import MatrixView from './components/MatrixView';
import LogView from './components/LogView';
import ExportView from './components/ExportView';
import Pixel from './ducks/Pixel';

export const store = createStore(combineReducers({
    Pixel
}));

const MainView = styled.div`
    display: flex;
    flexDirection: row;
`

const App = () =>
    <>
        <Provider store={store}>
            <MainView>
                <MatrixView/>
                <LogView/>
                <ExportView/>
            </MainView>
        </Provider>
    </>;

export default App;
