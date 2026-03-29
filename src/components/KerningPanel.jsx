import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GenericList } from '.';
import AceEditor from 'react-ace';
import { SYMBOL } from '../const';
import { updateGlyphset } from './../slices/glyphsetSlice';

const KerningPanel = () => {
    const glyphset = useSelector(state => state.glyphset.current);
    const dispatch = useDispatch();
    const [editorContent, setEditorContent] = React.useState("");
    const [hasError, setHasError] = React.useState(false);
    const idRef = React.useRef();

    React.useEffect(() => {
        if (glyphset && idRef.current !== glyphset._id) {
            setEditorContent(kerningMapToString(glyphset.kerningMap))
            idRef.current = glyphset._id;
        }
    }, [glyphset, setEditorContent]);

    React.useEffect(() => {
        const debounce = setTimeout(() => {
            const kerningMap = parseKerningMap(editorContent);
            if (kerningMap === null) {
                setHasError(true);
                return;
            }
            console.log("update kerning map on surfer:", kerningMap);
            dispatch(updateGlyphset({
                _id: idRef.current,
                kerningMap
            }));
            setHasError(false);
        }, 800);
        return () => clearTimeout(debounce);
    }, [editorContent, dispatch, setHasError]);

    return <GenericList>
        <h4>Kerning Map</h4>
        <span style={{fontFamily: 'monospace'}}>
            Format: QM {SYMBOL.DELTA}x {SYMBOL.DELTA}y
        </span>
            <AceEditor
                name = "kerningEditor"
                mode = "plain_text"
                theme = "github"
                value = {editorContent}
                onChange = {value => setEditorContent(value)}
                style = {{
                    backgroundColor: hasError ? '#faa' : undefined,
                    width: '100%',
                }}
            />
    </GenericList>;
};

export default KerningPanel;


const kerningMapToString = kerningMap => {
    if (!kerningMap) {
        return ""
    };
    return Object.entries(kerningMap)
        .sort((a,b) => (a.pair < b.pair) ? -1 : 1)
        .map(([pair, kerning]) =>
            `${pair} ${kerning[0]} ${kerning[1] || ''}`
        )
        .join('\n');
};

const parseKerningMap = string =>
    string.split('\n').reduce((kerningMap, line) => {
        if (kerningMap === null) {
            return null;
        }
        const [pair, kernX, kernY = 0] = line.split(' ');
        if (!pair) {
            return kerningMap;
        }
        if (pair.length !== 2) {
            return null;
        }
        return {
            ...kerningMap,
            [pair]: [+kernX, +kernY],
        };
    }, {});