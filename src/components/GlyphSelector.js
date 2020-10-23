import React from 'react';
import {connect} from 'react-redux';
import {alias} from '../GlyphModel';
import * as State from '../ReduxState';
import styled from 'styled-components';

const mapStateToProps = (state) => ({
    glyphset: state.glyphset,
    glyph: State.currentGlyph(state),
});

const mapDispatchToProps = (dispatch) => ({
    loadGlyph: id => dispatch({type: State.LOAD_GLYPH, payload: id})
});

const SelectorList = styled.div`
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: baseline;
    margin: 10px;
    padding: 10px;
    border: 1px solid #888;
`;

const GlyphSelector = ({glyphset, glyph, loadGlyph}) =>
    <>
    <SelectorList
        style = {{
            flexDirection: 'row',
            fontSize: '1.2rem',
            width: 400,
        }}>
            {glyphset.glyphs.slice()
                .sort((a,b) =>
                    a.letter.toLowerCase() === b.letter.toLowerCase()
                        ? (a.letter > b.letter ? 1 : -1)
                        : (a.letter.toLowerCase() > b.letter.toLowerCase() ? 1 : -1)
                )
                .map((eachGlyph, index) =>
                    <button
                        key = {index}
                        value = {eachGlyph.id}
                        style = {{
                            marginRight: 5,
                            marginBottom: 5,
                            padding: "3px 10px",
                            borderWidth: eachGlyph.id === glyph.id ? 2 : 1,
                        }}
                        onClick = {event => loadGlyph(event.target.value)}
                        >
                            {alias(eachGlyph.letter)}
                    </button>
            )}
    </SelectorList>
</>;

export default connect(mapStateToProps, mapDispatchToProps)(GlyphSelector);