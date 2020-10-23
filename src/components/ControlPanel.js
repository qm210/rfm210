import React from 'react';
import {connect} from 'react-redux';
//import io from 'socket.io-client';
//import feathers from '@feathersjs/client';
import * as State from '../ReduxState';
import {GenericList, LabelledInput} from '.';
import GlyphSelector from './GlyphSelector';

//const socket = io('http://localhost:3333');

//export const client = feathers().configure(feathers.socketio(socket));

const mapStateToProps = (state) => ({
    glyphset: state.glyphset,
    glyph: State.currentGlyph(state),
});

const mapDispatchToProps = (dispatch) => ({
    setLetterWidth: width => dispatch({type: State.SET_GLYPH_SIZE, payload: {width}}),
    setLetterHeight: height => dispatch({type: State.SET_GLYPH_SIZE, payload: {height}}),
    assignLetter: letter => dispatch({type: State.ASSIGN_LETTER, payload: letter}),
    appendGlyphset: name => dispatch({type: State.APPEND_GLYPHSET, payload: name}),
    assignGlyphset: name => dispatch({type: State.ASSIGN_GLYPHSET, payload: name}),
    addGlyph: () => dispatch({type: State.ADD_GLYPH}),
    copyGlyph: () => dispatch({type: State.COPY_GLYPH}),
});

const ControlPanel = ({glyph, glyphset, assignGlyphset, appendGlyphset, addGlyph, copyGlyph,
    setLetterWidth, setLetterHeight, assignLetter}) => {
    const inputRef = React.createRef();
    const glyphsets = [glyphset.title]; // TODO: extend if glyphset is going to be a list

    const setLastTypedLetter = event => {
        event.preventDefault();
        // TODO: can't handle backspace yet. anyway
        const newLetter = (glyph.letter !== '' && event.target.value === '') ? '' : event.key;
        if (newLetter.length > 1) {
            return;
        }
        event.target.value = newLetter;
        assignLetter(newLetter);
    }

    return <GenericList>
        <div>
            <LabelledInput
                name="iletter"
                label="Letter:"
                type="text"
                defaultValue={glyph.letter}
                onKeyPress={setLastTypedLetter}
            />
            <LabelledInput
                name="iwidth"
                label="Width:"
                type="number"
                value={glyph.width}
                onChange={event => setLetterWidth(+event.target.value)}
            />
            <LabelledInput
                name="iheight"
                label="Height:"
                type="number"
                value={glyph.height}
                onChange={event => setLetterHeight(+event.target.value)}
            />
        </div>
        <div style={{marginBottom: 20}}>
            <span>Glyphset: </span>
            <select
                value = {glyphset.title}
                onChange = {(event) => {
                    assignGlyphset(event.target.value);
                    inputRef.current.value = event.target.value;
                }}
                style = {{width: 200, marginLeft: 20}}>
                {
                    (glyphsets || []).map((item, index) =>
                        <option
                            key={item}
                            value={item}
                            >
                            {item}
                        </option>
                    )
                }
            </select>
            <input
                type = "text"
                ref = {inputRef}
                defaultValue = {glyphset.title}
                style = {{margin: "0 30px"}}
            />
            <button onClick = {event => appendGlyphset(event.target.value)}>
                +
            </button>
        </div>
        <div>
            Glyphset contains
        </div>
        <GlyphSelector/>
        <div>
            <button style={{margin: 10, padding: 10}} onClick={addGlyph}>New Glyph</button>
            <button style={{margin: 10, padding: 10}} onClick={copyGlyph}>Copy Glyph</button>
        </div>
    </GenericList>;
}

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);