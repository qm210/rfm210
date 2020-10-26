import React from 'react';
import ReactDOM from 'react-dom';
import {configureStore} from '@reduxjs/toolkit';
import {Provider} from 'react-redux';
import throttle from 'lodash.throttle';
import GlyphReducer from './slices/glyphSlice';
import GlyphsetReducer from './slices/glyphsetSlice';
import {saveStore} from './LocalStorage';
import {BrowserRouter} from "react-router-dom";
import App from './App';
import './index.css';
import {parse} from 'query-string';
import socketio from 'socket.io-client';
import feathers from '@feathersjs/client';

export const liveMode = 'live' in parse(window.location.search);

export const surferUrl = 'http://localhost:3030';
export const surfer = feathers();
surfer.configure(feathers.socketio(socketio(surferUrl)));

export const store = configureStore({
    reducer: {
        glyphset: GlyphsetReducer,
        glyph: GlyphReducer,
    },
    devTools: true,
});

store.subscribe(throttle(() => {
    saveStore(store.getState().local); // could only take {pixels: store.getState().pixels} or something
}, 1000));

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