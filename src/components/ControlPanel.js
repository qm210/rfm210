import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as State from '../slices/glyphSlice';
import GlyphSelector from './GlyphSelector';
import { GenericList, LabelledInput, Button } from '.';
import { IDLE } from '../const';
import { selectGlyphsetByTitle, createGlyphset, fetchGlyphsets } from '../slices/glyphsetSlice';
import { surfer } from '..';
import { OK } from './../const';

const ControlPanel = () => {
    const inputRef = React.createRef();
    const glyphset = useSelector(state => state.glyphset);
    const glyph = null;
    const dispatch = useDispatch();

    const glyphsetService = surfer.service('glyphset');
    glyphsetService.on('removed', (event) => console.log("LLLEEEEEELLL!!", event));

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
    }, [glyphset, dispatch]);

    console.log("......", glyphset.status, glyphset.all);

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
                onChange = {event => dispatch(setLetterWidth(+event.target.value))}
            />
            <LabelledInput
                name="iheight"
                label="Height:"
                type="number"
                value={glyph ? glyph.height : 0}
                disabled = {!glyph}
                onChange={event => dispatch(setLetterHeight(+event.target.value))}
            />
        </div>
        <div style={{marginBottom: 20}}>
            <span>Glyphset: </span>
            <select
                value = {glyphset.current ? glyphset.current.title : ''}
                onChange = {(event) => {
                    dispatch(selectGlyphsetByTitle(event.target.value));
                    inputRef.current.value = event.target.value;
                }}
                disabled = {glyphset.status !== OK}
                style = {{width: 200, marginLeft: 20}}>
                {
                    glyphset.status === OK
                    ? (glyphset.all || []).map((item, index) =>
                        <option key={index}
                            value={item.title}
                            >
                            {item.title}
                        </option>
                    )
                    : <option>{glyphset.status}</option>
                }
            </select>
            <input
                type = "text"
                ref = {inputRef}
                defaultValue = {glyphset.current ? glyphset.current.title : ''}
                style = {{margin: "0 30px"}}
            />
            <button onClick = {() => dispatch(createGlyphset(inputRef.current.value))}>+</button>
        </div>
        <div>
            Glyphset contains
        </div>
        <GlyphSelector/>
        <div>
            <Button onClick={() => dispatch(addGlyph())}>New Glyph</Button>
            <Button onClick={() => dispatch(copyGlyph())}>Copy Glyph</Button>
            <Button onClick={() => dispatch(deleteGlyph())}>Delete Glyph</Button>
        </div>
    </GenericList>;
}

export default ControlPanel;