import React from 'react';
import { NavLink, Route } from 'react-router-dom';
import GlyphApp from './GlyphApp';
import SceneApp from './SceneApp';
import StoreDebugger from '../StoreDebugger';
import 'fomantic-ui-css/semantic.min.css';
import { deleteAllScenes } from '../slices/sceneSlice';
import { useDispatch, useSelector } from 'react-redux';
import { STATUS } from './../const';
import { fetchGlyphsets, selectGlyphsetByTitle } from './../slices/glyphsetSlice';
import { fetchGlyph, fetchLetterMap } from './../slices/glyphSlice';

const shortcutActions = {
    'F4': deleteAllScenes()
};

export const App = () => {
    const dispatch = useDispatch();
    const glyphset = useSelector(state => state.glyphset);
    const glyph = useSelector(state => state.glyph.current);
    const lastGlyphId = useSelector(state => state.local.lastGlyphId);

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

    // INIT GLYPHSET

    React.useEffect(() => {
        if (glyphset.status === STATUS.IDLE) {
            dispatch(fetchGlyphsets())
        }
    }, [glyphset.status, dispatch]);

    React.useEffect(() => {
        if (glyphset.all.length === 1 && !glyphset.current) {
            dispatch(selectGlyphsetByTitle(glyphset.all[0].title));
        }
    }, [glyphset, dispatch])

    // INIT LETTER MAP

    React.useEffect(() => {
        if (glyphset.current && !glyphset.current.letterMap) {
            dispatch(fetchLetterMap(glyphset.current));
        }
    }, [dispatch, glyphset])

    // INIT GLYPH

    React.useEffect(() => {
        if (glyphset.current && glyphset.letterMap && !glyph && lastGlyphId) {
            if (glyphset.current.glyphList.includes(lastGlyphId)) {
                dispatch(fetchGlyph(lastGlyphId));
            }
        }
    }, [glyphset, glyph, lastGlyphId, dispatch]);

    return <>
        <div className="ui three item menu" style={{position: 'fixed', top: 0, zIndex: 10}}>
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
        <div style={{height: 42, backgroundColor: 'lightgrey'}}/>
        <Route path="/" exact component={GlyphApp}/>
        <Route path="/scene" component={SceneApp}/>
        <Route path="/store" component={StoreDebugger}/>
    </>;
};

export default App;