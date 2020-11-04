import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import GlyphSelector from './GlyphSelector';
import { GenericList, LabelledInput, Button } from '.';
import { IDLE } from '../const';
import { selectGlyphsetByTitle, createGlyphset, fetchGlyphsets, fetchGlyphset } from '../slices/glyphsetSlice';
import { assignLetter, resize, addGlyph, copyGlyph, deleteGlyph, updateGlyph } from '../slices/glyphSlice';
import { OK } from './../const';

const GLYPH_UPDATE_THROTTLE = 1000;

const option = value => ({value, label: value});

const ControlPanel = () => {
    const glyphset = useSelector(state => state.glyphset);
    const glyph = useSelector(state => state.glyph.current);
    const dispatch = useDispatch();
    const [glyphsetTitleInput, setGlyphsetTitleInput] = React.useState('Matzdings');

    const glyphsetTitleList = (glyphset.all || []).map(item => item.title);
    const glyphsetOptionList = glyphset.status !== OK
        ? [option(glyphset.status)]
        : glyphsetTitleList.map(title => option(title))

    React.useEffect(() => {
        const debounce = setTimeout(() => {
            console.log("SOMETHING WITH CURRENT GLYPH CHANGED", glyph);
            dispatch(updateGlyph());
        }, GLYPH_UPDATE_THROTTLE);
        return () => clearTimeout(debounce);
    }, [glyph, dispatch]);

    const dispatchLastTypedLetter = event => {
        event.preventDefault();
        // TODO: can't handle backspace yet. anyway
        const newLetter = (glyph.letter !== '' && event.target.value === '') ? '' : event.key;
        if (newLetter.length > 1) {
            return;
        }
        event.target.value = newLetter;
        dispatch(assignLetter({id: glyph._id, letter: newLetter}));
        dispatch(updateGlyph());
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

    const dispatchAndUpdate = (action) => {
        console.log("ACTION", action, glyphset);
        dispatch(action)
            .then(() => dispatch(fetchGlyphset(glyphset.current)))
    };

    return <GenericList>
        <div>
            <LabelledInput
                name = "iletter"
                label = "Letter:"
                type = "text"
                defaultValue = {(glyph && glyph.letter) || ''}
                disabled = {!glyph}
                onKeyPress = {dispatchLastTypedLetter}
            />
            <LabelledInput
                name = "iwidth"
                label = "Width:"
                type = "number"
                value = {(glyph && glyph.width) || 0}
                disabled = {!glyph}
                onChange = {event => dispatch(resize({width: +event.target.value}))}
            />
            <LabelledInput
                name="iheight"
                label="Height:"
                type="number"
                value={(glyph && glyph.height) || 0}
                disabled = {!glyph}
                onChange={event => dispatch(resize({height: +event.target.value}))}
            />
        </div>
        <div style={{marginBottom: 20}}>
            <span>Glyphset: </span>
            <Select
                value = {glyphsetOptionList.find(option => glyphset.current && glyphset.current.title === option.label)}
                onChange = {value => {
                    dispatch(selectGlyphsetByTitle(value));
                    value && setGlyphsetTitleInput(value);
                }}
                options = {glyphsetOptionList}
                disabled = {glyphset.status !== OK}
            />
            <div className="ui input" style={{marginTop: 15}}>
                <input
                    type = "text"
                    value = {glyphsetTitleInput}
                    onChange = {event => setGlyphsetTitleInput(event.target.value)}
                    style = {{margin: "0 30px"}}
                />
                <button
                    style = {{width: 50}}
                    disabled = {!glyphsetTitleInput || glyphsetTitleList.includes(glyphsetTitleInput)}
                    onClick = {() => dispatch(createGlyphset(glyphsetTitleInput))}>
                        +
                </button>
            </div>
        </div>
        <GlyphSelector/>
        <div>
            <Button disabled={!glyphset.current} onClick={() => dispatchAndUpdate(addGlyph())}>New Glyph</Button>
            <Button disabled={!glyphset.current} onClick={() => dispatchAndUpdate(copyGlyph())}>Copy Glyph</Button>
            <Button disabled={!glyphset.current} onClick={() => dispatchAndUpdate(deleteGlyph())}>Delete Glyph</Button>
        </div>
    </GenericList>;
}

export default ControlPanel;