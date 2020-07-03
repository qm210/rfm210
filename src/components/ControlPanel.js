import React from 'react';
import {connect} from 'react-redux';
//import Select from 'react-select';
import styled from 'styled-components';
import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import * as State from '../ReduxState';
import {size2D} from '../Utils';
import {LabelledInput} from '.';

const socket = io('http://localhost:3333');

export const client = feathers().configure(feathers.socketio(socket));

const ExportList = styled.div`
    display: flex;
    flex-direction: column;
    alignItems: left;
    margin: 10px;
    padding: 10px;
    border: 1px solid #888;
`;

const mapStateToProps = (state) => ({
    pixels: state.pixels,
    letter: state.currentLetter,
    glyphset: state.glyphset
});

const mapDispatchToProps = (dispatch) => ({
    setLetterWidth: width => dispatch({type: State.SET_GLYPH_WIDTH, payload: width}),
    setLetterHeight: height => dispatch({type: State.SET_GLYPH_HEIGHT, payload: height}),
    assignLetter: letter => dispatch({type: State.ASSIGN_LETTER, payload: letter}),
    appendGlyphset: name => dispatch({type: State.APPEND_GLYPHSET, payload: name}),
    assignGlyphset: name => dispatch({type: State.ASSIGN_GLYPHSET, payload: name}),
    addGlyph: () => dispatch({type: State.ADD_GLYPH}),
    copyGlyph: () => dispatch({type: State.COPY_GLYPH}),
    loadGlyph: letter => dispatch({type: State.LOAD_GLYPH, payload: letter})
});

const ControlPanel = ({pixels, letter, glyphset, assignGlyphset, appendGlyphset, addGlyph, copyGlyph,
    setLetterWidth, setLetterHeight, assignLetter, loadGlyph, glyph}) => {
    const inputRef = React.createRef();
    const glyphsets = [glyphset.title]; // TODO: extend if glyphset is going to be a list

    const debugStuff = () => {
        console.log(glyphset, letter, glyph);
    };

    const setLastTypedLetter = event => {
        event.preventDefault();
        // TODO: can't handle backspace yet. anyway
        const newLetter = (letter !== '' && event.target.value === '') ? '' : event.key;
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
                defaultValue={letter}
                onKeyPress={setLastTypedLetter}
            />
            <LabelledInput
                name="iwidth"
                label="Width:"
                type="number"
                value={size2D(pixels).width}
                onChange={event => setLetterWidth(event.target.value)}
                disabled
            />
            <LabelledInput
                name="iheight"
                label="Height:"
                type="number"
                value={size2D(pixels).height}
                onChange={event => setLetterHeight(event.target.value)}
                disabled
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
                style = {{width: 200, marginLeft: 20}}
                >
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
            style = {{fontSize: '1.2rem'}}
            value = {letter}
            onChange = {event => loadGlyph(event.target.value)}
        >
        {
            glyphset.glyphs.slice()
                .sort((a,b) => a.letter < b.letter)
                .map((glyph, index) =>
                <option
                    key={index}
                    value={glyph.letter}
                    >
                    {glyph.alias}
                </option>
            )
        }
        </select>
        <div>
            <button style={{margin: 10, padding: 10}} onClick={addGlyph}>New Glyph</button>
            <button style={{margin: 10, padding: 10}} onClick={copyGlyph}>Copy Glyph</button>
        </div>
        <button style={{margin: 10, padding: 10}} onClick={debugStuff}>DEBUG</button>
    </ExportList>;
}

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);