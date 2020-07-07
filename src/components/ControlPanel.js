import React from 'react';
import {connect} from 'react-redux';
//import Select from 'react-select';
import styled from 'styled-components';
//import io from 'socket.io-client';
//import feathers from '@feathersjs/client';
import * as State from '../ReduxState';
import {LabelledInput} from '.';
import {alias} from '../GlyphModel';

//const socket = io('http://localhost:3333');

//export const client = feathers().configure(feathers.socketio(socket));

const ExportList = styled.div`
    display: flex;
    flex-direction: column;
    alignItems: left;
    margin: 10px;
    padding: 10px;
    border: 1px solid #888;
`;

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
    loadGlyph: id => dispatch({type: State.LOAD_GLYPH, payload: id})
});

const ControlPanel = ({glyph, glyphset, assignGlyphset, appendGlyphset, addGlyph, copyGlyph,
    setLetterWidth, setLetterHeight, assignLetter, loadGlyph}) => {
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

    return <ExportList>
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
        <select
            size = {10}
            style = {{fontSize: '1.2rem', height: 300}}
            value = {glyph.id}
            onChange = {event => loadGlyph(event.target.value)}
        >
        { // TODO: own selector with lots of small buttons
            glyphset.glyphs.slice()
                .sort((a,b) => a.letter > b.letter ? 1 : -1)
                .map((eachGlyph, index) =>
                    <option
                        key={index}
                        value={eachGlyph.id}
                        >
                        {alias(eachGlyph.letter)}
                    </option>
            )
        }
        </select>
        <div>
            <button style={{margin: 10, padding: 10}} onClick={addGlyph}>New Glyph</button>
            <button style={{margin: 10, padding: 10}} onClick={copyGlyph}>Copy Glyph</button>
        </div>
    </ExportList>;
}

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);