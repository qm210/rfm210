import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import GlyphSelector from './GlyphSelector';
import GlyphsetSelector from './GlyphsetSelector';
import { GenericList, LabelledInput, Button } from '.';
import { createGlyphset, fetchGlyphset } from '../slices/glyphsetSlice';
import { assignLetter, resize, addGlyph, copyGlyph, deleteGlyph, updateGlyph } from '../slices/glyphSlice';

const GLYPH_UPDATE_DEBOUNCE = 500;

const ControlPanel = () => {
    const glyphset = useSelector(state => state.glyphset);
    const glyph = useSelector(state => state.glyph.current);
    const dispatch = useDispatch();
    const [glyphsetTitleInput, setGlyphsetTitleInput] = React.useState('Matzdings');

    const glyphsetTitleList = (glyphset.all || []).map(item => item.title);

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

    const dispatchAndUpdate = (action) => {
        dispatch(action)
            .then(() => {
                dispatch(fetchGlyphset(glyphset.current));
                document.getElementById("iletter").focus();
            })
    };

    return <GenericList>
        <div>
            <LabelledInput
                name = "iletter"
                label = "Letter:"
                type = "text"
                value = {(glyph && glyph.letter) || ''}
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
            <GlyphsetSelector
                onChange = {value => value && setGlyphsetTitleInput(value)}
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
};

export default ControlPanel;
