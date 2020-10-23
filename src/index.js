import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {parse} from 'query-string';

const parsedQuery = parse(window.location.search);
export const liveMode = 'live' in parsedQuery;

try {
    ReactDOM.render(
        <App/>,
        document.getElementById('root')
    );
} catch (err) {
    console.log(localStorage.getItem('store'));
}