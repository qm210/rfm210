import React from 'react';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import styled from 'styled-components';
import throttle from 'lodash.throttle';
import MatrixView from './components/MatrixView';
import LogView from './components/LogView';
import ExportView from './components/ExportView';
import ShaderView from './components/ShaderView';
import Pixel from './ducks/Pixel';
import {loadState, saveState} from './LocalStorage';

export const persistedState = loadState();
export const store = createStore(combineReducers({
    Pixel
}), persistedState);

store.subscribe(throttle(() => {
    saveState(store.getState()); // could only take {pixels: store.getState().pixels} or something
}, 1000));

const MainView = styled.div`
    display: flex;
    flex-direction: row;
`
const MainColumn = styled.div`
    display: flex;
    flex-direction: column;
`

const App = () =>
    <>
        <Provider store={store}>
            <MainView>
                <MainColumn>
                    <MatrixView/>
                    <LogView/>
                </MainColumn>
                <MainColumn>
                    <ShaderView/>
                    <ExportView/>
                </MainColumn>
            </MainView>
        </Provider>
    </>;

export default App;
