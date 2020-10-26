import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import GlyphSelector from './GlyphSelector';
import { GenericList, LabelledInput, Button } from '.';
import { IDLE } from '../const';
import { selectGlyphsetByTitle, createGlyphset, fetchGlyphsets } from '../slices/glyphsetSlice';
import { assignLetter, resize, addGlyph, copyGlyph, deleteGlyph } from '../slices/glyphSlice';
import { OK } from './../const';
import { fetchLetterMap } from './../slices/glyphSlice';

const ControlPanel = () => {
    const glyphset = useSelector(state => state.glyphset);
    const glyph = null;
    const dispatch = useDispatch();
    const [glyphsetTitleInput, setGlyphsetTitleInput] = React.useState('Matzdings');

    const glyphsetTitleList = React.useMemo(() => (glyphset.all || []).map(item => item.title), [glyphset]);

    const dispatchLastTypedLetter = event => {
        event.preventDefault();
        // TODO: can't handle backspace yet. anyway
        const newLetter = (glyph.letter !== '' && event.target.value === '') ? '' : event.key;
        if (newLetter.length > 1) {
            return;
        }
        event.target.value = newLetter;
        dispatch(assignLetter(newLetter));
    }

    React.useEffect(() => {
        if (glyphset.status === IDLE) {
            dispatch(fetchGlyphsets())
        }
    }, [glyphset.status, dispatch]);

    React.useEffect(() => {
        if (glyphset.all.length === 1 && !glyphset.current) {
            dispatch(selectGlyphsetByTitle(glyphset.all[0].title));
        }
    }, [glyphset, dispatch])

    const dispatchAndUpdate = React.useCallback((action) => () => {
        dispatch(action)
        .then(() =>
            dispatch(fetchLetterMap(glyphset))
        );
    }, [dispatch, glyphset]);

    return <GenericList>
        <div>
            <LabelledInput
                name = "iletter"
                label = "Letter:"
                type = "text"
                defaultValue = {glyph ? glyph.letter : ''}
                disabled = {!glyph}
                onKeyPress = {dispatchLastTypedLetter}
            />
            <LabelledInput
                name = "iwidth"
                label = "Width:"
                type = "number"
                value = {glyph ? glyph.width : 0}
                disabled = {!glyph}
                onChange = {event => dispatch(resize({width: +event.target.value}))}
            />
            <LabelledInput
                name="iheight"
                label="Height:"
                type="number"
                value={glyph ? glyph.height : 0}
                disabled = {!glyph}
                onChange={event => dispatch(resize({height: +event.target.value}))}
            />
        </div>
        <div style={{marginBottom: 20}}>
            <span>Glyphset: </span>
            <select
                value = {glyphset.current ? glyphset.current.title : ''}
                onClick = {(event) => {
                    dispatch(selectGlyphsetByTitle(event.target.value));
                    if (event.target.value) {
                        setGlyphsetTitleInput(event.target.value);
                    }
                }}
                disabled = {glyphset.status !== OK}
                style = {{width: 200, marginLeft: 20}}>
                {
                    glyphset.status === OK
                    ? glyphsetTitleList.map((item, index) =>
                        <option key={index}>{item}</option>
                    )
                    : <option>{glyphset.status}</option>
                }
            </select>
            <input
                type = "text"
                value = {glyphsetTitleInput}
                onChange = {event => setGlyphsetTitleInput(event.target.value)}
                style = {{margin: "0 30px"}}
            />
            <button
                disabled = {!glyphsetTitleInput || glyphsetTitleList.includes(glyphsetTitleInput)}
                onClick = {() => dispatch(createGlyphset(glyphsetTitleInput))}>
                    +
            </button>
        </div>
        <GlyphSelector/>
        <div>
            <Button disabled={!glyphset.current} onClick={dispatchAndUpdate(addGlyph())}>New Glyph</Button>
            <Button disabled={!glyphset.current} onClick={dispatchAndUpdate(copyGlyph())}>Copy Glyph</Button>
            <Button disabled={!glyphset.current} onClick={dispatchAndUpdate(deleteGlyph())}>Delete Glyph</Button>
        </div>
    </GenericList>;
}

export default ControlPanel;