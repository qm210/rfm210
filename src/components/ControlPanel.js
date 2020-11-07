import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import GlyphSelector from './GlyphSelector';
import { GenericList, LabelledInput, Button } from '.';
import { STATUS } from '../const';
import { selectGlyphsetByTitle, createGlyphset, fetchGlyphsets, fetchGlyphset } from '../slices/glyphsetSlice';
import { assignLetter, resize, addGlyph, copyGlyph, deleteGlyph, updateGlyph } from '../slices/glyphSlice';

const GLYPH_UPDATE_DEBOUNCE = 500;

const option = value => ({value, label: value});

export default () => {
    const glyphset = useSelector(state => state.glyphset);
    const glyph = useSelector(state => state.glyph.current);
    const dispatch = useDispatch();
    const [glyphsetTitleInput, setGlyphsetTitleInput] = React.useState('Matzdings');

    const glyphsetTitleList = (glyphset.all || []).map(item => item.title);
    const glyphsetOptionList = glyphset.status !== STATUS.OK
        ? [option(glyphset.status)]
        : glyphsetTitleList.map(title => option(title))
    const glyphsetOptionCurrent = glyphset.status !== STATUS.OK
        ? glyphsetOptionList[0]
        : glyphsetOptionList.find(option => glyphset.current && glyphset.current.title === option.label)

    React.useEffect(() => {
        const debounce = setTimeout(() => {
            console.log("update glyph to surfer:", glyph);
            dispatch(updateGlyph());
        }, GLYPH_UPDATE_DEBOUNCE);
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
        if (glyphset.status === STATUS.IDLE) {
            dispatch(fetchGlyphsets())
        }
    }, [glyphset.status, dispatch]);

    React.useEffect(() => {
        if (glyphset.all.length === 1 && !glyphset.current) {
            dispatch(selectGlyphsetByTitle(glyphset.all[0].title));
        }
    }, [glyphset, dispatch])

    const dispatchAndUpdate = (action) => {
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
                value = {glyphsetOptionCurrent}
                onChange = {value => {
                    dispatch(selectGlyphsetByTitle(value));
                    value && setGlyphsetTitleInput(value);
                }}
                options = {glyphsetOptionList}
                isDisabled = {glyphset.status !== STATUS.OK}
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
