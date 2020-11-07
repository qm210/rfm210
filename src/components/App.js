import React from 'react';
import {NavLink, Route} from 'react-router-dom';
import GlyphApp from './GlyphApp';
import SceneApp from './SceneApp';
import StoreDebugger from '../StoreDebugger';
import 'fomantic-ui-css/semantic.min.css';

import {deleteAllScenes} from '../slices/sceneSlice';
import { useDispatch } from 'react-redux';

const shortcutActions = {
    'F4': deleteAllScenes()
};

export const App = () => {
    const dispatch = useDispatch();

    React.useEffect(() => {
        const shortcutHandler = event => {
            if (event.key in shortcutActions) {
                event.preventDefault();
                dispatch(shortcutActions[event.key]);
            }
        }
        document.addEventListener('keyup', shortcutHandler);
        return () => document.removeEventListener('keyup', shortcutHandler);
    }, [dispatch]);

    return <>
        <div className="ui three item menu">
            <NavLink className="item" activeClassName="active" exact to="/">
                Glyph Editor
            </NavLink>
            <NavLink className="item" activeClassName="active" exact to="/scene">
                Scene Editor
            </NavLink>
            <NavLink className="item" activeClassName="active" exact to="/store">
                Store Debugger
            </NavLink>
        </div>
        <Route exact path="/" component={GlyphApp}/>
        <Route path="/scene" component={SceneApp}/>
        <Route path="/store" component={StoreDebugger}/>
    </>;
};

export default App;