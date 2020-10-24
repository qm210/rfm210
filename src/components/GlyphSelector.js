import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {alias} from '../GlyphModel';
import {fetchGlyph} from '../slices/glyphSlice';
import styled from 'styled-components';

const SelectorList = styled.div`
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: baseline;
    margin: 10px;
    padding: 10px;
    border: 1px solid #888;
`;

const GlyphSelector = () => {
    const glyphset = null;
    const glyph = null;
    return (
    <SelectorList
        style = {{
            flexDirection: 'row',
            fontSize: '1.2rem',
            width: 400,
        }}>
            {glyphset && glyphset.glyphs.slice()
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
                            borderWidth: glyph && eachGlyph.id === glyph.id ? 2 : 1,
                        }}
                        onClick = {event => fetchGlyph(glyphset, event.target.value)}
                        >
                            {alias(eachGlyph.letter)}
                    </button>
            )}
    </SelectorList>
    )
};

export default GlyphSelector;