import React from 'react';
import {connect} from 'react-redux';
import {ExportList, ExportTextArea, ErrorLabel} from '.';
import * as State from '../ReduxState';
import Initial from '../Initial';
import {clearStore} from '../LocalStorage';

const mapStateToProps = (state) => ({
    pixels: State.currentPixels(state),
    state // for debug
});

const mapDispatchToProps = (dispatch) => ({
    overwritePixels: pixels => dispatch(State.overwritePixels(pixels)),
})

const ExportView = ({state, pixels, overwritePixels}) => {
    const [errorLabel, setErrorLabel] = React.useState('');
    const importTextArea = React.createRef();

    const tryPixelImport = (event) => {
        event.preventDefault();
        const tryImportText = importTextArea.current.value
        if (!tryImportText) {
            return;
        }
        try {
            const importedPixels = JSON.parse(tryImportText);
            const test2DArrayAccess = importedPixels[0][0];
            if (typeof test2DArrayAccess === "boolean") {
                overwritePixels(importedPixels);
                setErrorLabel('');
            }
            else {
                setErrorLabel('not a valid boolean 2D JSON array.')
            }
        }
        catch (error) {
            if (error instanceof TypeError) {
                setErrorLabel('not valid 2D JSON array.');
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
        <button style={{margin: 10, padding: 10}} onClick={clearStore}>
            Clear Cache
        </button>
        <button style={{margin: 10, padding: 10}} onClick={() => console.log(state)}>
            DEBUG
        </button>
        <form onSubmit={() => false}>
            <b>Export as JSON pixel array:</b>
            <br/>
            <ExportTextArea
                value = {JSON.stringify(pixels)}
                readOnly
            />
            <br/>
            <b>Import existing JSON pixel array:</b>
            <br/>
            <ExportTextArea
                ref = {importTextArea}
                defaultValue = {Initial.importExample}
                onKeyPress = {event => event.ctrlKey && event.charCode === 13 ? tryPixelImport(event) : null}
            />
            <br/>
            <button onClick={event => {tryPixelImport(event)}}>
                Do it!
            </button>
            <ErrorLabel>
                {errorLabel}
            </ErrorLabel>
        </form>

    </ExportList>;
};

export default connect(mapStateToProps, mapDispatchToProps)(ExportView);
