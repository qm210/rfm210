import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { replacePixels } from '../slices/glyphSlice';
import { ExportList, ExportTextArea, ErrorLabel } from '.';
import Initial from '../Initial';

const ExportView = () => {
    const pixels = useSelector(state => state.glyph.pixels);
    const dispatch = useDispatch();
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
                dispatch(replacePixels(importedPixels));
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
        <b>No time til' UC10, so..:</b>
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

export default ExportView;
