import React from 'react';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import {NavLink, Route} from 'react-router-dom';
import throttle from 'lodash.throttle';
import Pixel from './ducks/Pixel';
import Glyph from './ducks/Glyph';
import {loadState, saveState} from './LocalStorage';
import GlyphApp from './GlyphApp';
import SceneApp from './SceneApp';
import {BrowserRouter} from 'react-router-dom';
import 'fomantic-ui-css/semantic.min.css';

export const persistedState = loadState();
export const store = createStore(combineReducers({
    Pixel,
    Glyph
}), persistedState);

store.subscribe(throttle(() => {
    saveState(store.getState()); // could only take {pixels: store.getState().pixels} or something
}, 1000));


const App = () =>
    <Provider store={store}>
        <BrowserRouter>
                <div className="ui two item menu">
                    <NavLink className="item" activeClassName="active" exact to="/">
                        Glyph
                    </NavLink>
                    <NavLink className="item" activeClassName="active" exact to="/scene">
                        Scene
                    </NavLink>
                </div>
                <Route exact path="/" component={GlyphApp}/>
                <Route path="/scene" component={SceneApp}/>
        </BrowserRouter>
    </Provider>;

export default App;
