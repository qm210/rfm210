import React from 'react';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import {NavLink, Route} from 'react-router-dom';
import throttle from 'lodash.throttle';
import Reducer from './ReduxState';
import {loadStore, saveStore} from './LocalStorage';
import GlyphApp from './GlyphApp';
import SceneApp from './SceneApp';
import {BrowserRouter} from 'react-router-dom';
import 'fomantic-ui-css/semantic.min.css';

export const persistedState = loadStore();
export const store = createStore(Reducer, persistedState);

store.subscribe(throttle(() => {
    saveStore(store.getState()); // could only take {pixels: store.getState().pixels} or something
}, 1000));

const App = () =>
    <Provider store={store}>
        <BrowserRouter>
                <div className="ui two item menu">
                    <NavLink className="item" activeClassName="active" exact to="/">
                        Glyph Editor
                    </NavLink>
                    <NavLink className="item" activeClassName="active" exact to="/scene">
                        Scene Editor
                    </NavLink>
                </div>
                <Route exact path="/" component={GlyphApp}/>
                <Route path="/scene" component={SceneApp}/>
        </BrowserRouter>
    </Provider>;

export default App;
