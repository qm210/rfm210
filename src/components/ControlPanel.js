import React from 'react';
import {connect} from 'react-redux';
//import Select from 'react-select';
import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import * as Glyph from '../ducks/Glyph';

const socket = io('http://localhost:3333');

export const client = feathers().configure(feathers.socketio(socket));

const mapStateToProps = (state, props) => ({
    ...state.Glyph
});

const mapDispatchToProps = (dispatch, props) => ({
    appendAlphabet: (name) => dispatch(Glyph.appendAlphabet(name)),
    assignAlphabet: (name) => dispatch(Glyph.assignAlphabet(name))
});

const ControlPanel = ({alphabet, alphabets, assignAlphabet, appendAlphabet}) => {
    const inputRef = React.createRef();
    return <>
        <div style={{
            marginBottom: 20,
        }}>
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
    </>;
}

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);