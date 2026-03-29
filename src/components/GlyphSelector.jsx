import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { alias } from '../logic/glyph';
import { fetchGlyph } from '../slices/glyphSlice';
import { Loader, Segment } from 'semantic-ui-react';

const GlyphSelector = () => {
    const glyphset = useSelector(state => state.glyphset.current);
    const glyph = useSelector(state => state.glyph.current);
    const dispatch = useDispatch();

    const selected = item => glyph && glyph._id === item._id;

    return !glyphset ? null : <div>
        Glyphset contains
        <Segment
            style = {{
                flexDirection: 'row',
                fontSize: '1.2rem',
                width: '99%',
                padding: 15,
                minHeight: 60,
                backgroundColor: !glyphset.letterMap ? 'lightgrey' : 'none'
            }}>
            <Loader active={!glyphset.letterMap}/>
            {
                (glyphset.letterMap || []).map((item, index) =>
                    <button
                        key = {index}
                        style = {{
                            marginRight: 5,
                            marginBottom: 5,
                            padding: "3px 10px",
                            borderWidth: 2,
                            outline: 'none',
                            ...(selected(item) && {
                                color: 'red',
                                backgroundColor: 'gold',
                                fontWeight: 'bold'
                            }) || {
                                color: 'black',
                                fontWeight: 'normal'
                            }
                        }}
                        title = {item._id}
                        onClick = {() => dispatch(fetchGlyph(item._id))}
                        >
                            {alias(item.letter)}
                    </button>
            )}
        </Segment>
    </div>;
};

export default GlyphSelector;