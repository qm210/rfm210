import React from 'react';
import {NavLink, Route} from 'react-router-dom';
import GlyphApp from './GlyphApp';
//import SceneApp from './SceneApp';
import StoreDebugger from './StoreDebugger';
import 'fomantic-ui-css/semantic.min.css';

const App = () => {
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
        <Route path="/scene" component={null}/>
        <Route path="/store" component={StoreDebugger}/>
    </>;
}

export default App;
