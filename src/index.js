import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

try {
    ReactDOM.render(
        <App/>,
        document.getElementById('root')
    );
} catch (err) {
    console.log(localStorage.getItem('store'));
}