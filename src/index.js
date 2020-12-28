import React from 'react';
import ReactDOM from 'react-dom';
import {configureStore} from '@reduxjs/toolkit';
import {Provider} from 'react-redux';
import throttle from 'lodash.throttle';
import GlyphReducer from './slices/glyphSlice';
import GlyphsetReducer from './slices/glyphsetSlice';
import SceneReducer from './slices/sceneSlice';
import LocalReducer from './slices/localSlice';
import { saveStore, loadStore } from './logic/storage';
import {BrowserRouter} from "react-router-dom";
import App from './components/App';
import './index.css';
import {parse} from 'query-string';
import socketio from 'socket.io-client';
import feathers from '@feathersjs/client';

import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/mode-glsl";
import "ace-builds/src-noconflict/mode-plain_text";
import "ace-builds/src-noconflict/theme-github";

export const liveMode = 'live' in parse(window.location.search);

export const surferUrl = 'http://localhost:3030';
export const surfer = feathers();
surfer.configure(feathers.socketio(socketio(surferUrl)));

export const store = configureStore({
    reducer: {
        glyphset: GlyphsetReducer,
        glyph: GlyphReducer,
        scene: SceneReducer,
        local: LocalReducer,
    },
    preloadedState: {
        local: loadStore()
    },
    devTools: true,
});

store.subscribe(throttle(() => {
    saveStore(store.getState().local); // could only take {pixels: store.getState().pixels} or something
}, 3000));

const rootElement = document.getElementById('root');

try {
    ReactDOM.render(
        <Provider store={store}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </Provider>,
        rootElement
    );
} catch (err) {
    ReactDOM.render(
        <>
        <div>Error</div>
        <div>{localStorage.getItem('store')}</div>
        <div>{err}</div>
        </>,
        rootElement
    );
}