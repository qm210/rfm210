import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {ExportList, ExportTextArea, ErrorLabel, Button} from './components';
import {clearStore} from './LocalStorage';
import {clearGlyphsets} from './slices/glyphsetSlice';

const StoreDebugger = () => {
    const [errorLabel, setErrorLabel] = React.useState('');
    const importTextArea = React.createRef();

    const state = useSelector(s => s);
    const dispatch = useDispatch();

    const tryStateImport = (event) => {
        event.preventDefault();
        const tryImportText = importTextArea.current.value
        if (!tryImportText) {
            return;
        }
        try {
            /* could test first whether the structure matches to the current Initial.state */
            alert("function removed!")
            // //        replaceState: state => dispatch({type: State.REPLACE_STATE, payload: state}),
            //dispatch(replaceState(JSON.parse(tryImportText)));
        }
        catch (error) {
            if (error instanceof TypeError) {
                setErrorLabel('not valid Type..=');
            }
            else if (error instanceof SyntaxError) {
                setErrorLabel('not valid JSON.');
            }
            else {
                setErrorLabel('Error importing. See console.');
                throw error;
            }
        }
    }

    return <ExportList>
        <b>General Information:</b>
        <Button onClick={clearStore}>
            Clear Cache
        </Button>
        <Button onClick={() => dispatch(clearAllGlyphsets())}>Surfer: Clear Glyphsets</Button>
        <Button onClick={() => console.log(state)}>
            DEBUG
        </Button>
        <form onSubmit={() => false}>
            <b>Serialized JSON state:</b>
            <br/>
            <ExportTextArea
                value = {localStorage.getItem('store')}
                readOnly
            />
            <br/>
            <b>Import state that you saved elsewhere (you better don't verkack this):</b>
            <br/>
            <ExportTextArea
                ref = {importTextArea}
                placeholder = 'Put your non-verkacking state JSON here...'
                defaultValue = ''
                onKeyPress = {event => event.ctrlKey && event.charCode === 13 ? tryStateImport(event) : null}
            />
            <br/>
            <button onClick={event => {tryStateImport(event)}}>
                Do it!
            </button>
            <ErrorLabel>
                {errorLabel}
            </ErrorLabel>
        </form>

    </ExportList>;
};

export default StoreDebugger;
