import React from 'react';
import {connect} from 'react-redux';
//import Select from 'react-select';
import styled from 'styled-components';
import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import * as Glyphs from '../ducks/Glyphs';
import * as Store from '../ducks/Store';
import {clearStore} from '../LocalStorage';

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

const mapStateToProps = (state, props) => ({
    ...state.Glyphs,
    ...state.Store,
});

const mapDispatchToProps = (dispatch, props) => ({
    appendGlyphset: name => dispatch({type: Store.APPEND_GLYPHSET, payload: name}),
    assignGlyphset: name => dispatch({type: Glyphs.ASSIGN_GLYPHSET, payload: name})
});

const ControlPanel = ({alphabet, alphabets, assignAlphabet, appendAlphabet}) => {
    const inputRef = React.createRef();

    const debugStuff = React.useCallback(() => {
        console.log(alphabets);
    }, [alphabets]);

    return <ExportList>
        <div style={{marginBottom: 20}}>
            <span>Alphabet: </span>
            <select
                value = {alphabet}
                onChange = {(event) => {
                    assignAlphabet(event.target.value);
                    inputRef.current.value = event.target.value;
                    console.log(alphabet, alphabets, event.target.value);
                }}
                style = {{
                    width: 200,
                    marginLeft: 20
                    }}>
                    {
                        (alphabets || []).map((item, index) =>
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
                defaultValue = {alphabet}
                style = {{margin: "0 30px"}}
            />
            <button
                onClick = {event => {
                    appendAlphabet(event.target.value);
                }}
                >
                +
            </button>
        </div>
        <div>
            Alphabet contains
        </div>
        <select size={10} style={{fontSize: '1.2rem'}}>
                <option>Stuhl</option>
        </select>
        <button style={{margin: 10, padding: 10}} onClick={debugStuff}>DEBUG</button>
        <button style={{margin: 10, padding: 10}} onClick={clearStore}>Clear Cache</button>
    </ExportList>;
}

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);