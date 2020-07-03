import React from 'react';
import {connect} from 'react-redux';
import {ExportList, LabelledInput, ExportTextArea, ErrorLabel} from '.';
import * as Pixel from '../ducks/Pixel';
import * as Glyph from '../ducks/Glyphs';
import { size2D } from '../Utils';
import Initial from '../Initial';

const mapStateToProps = (state) => ({
    pixels: state.Pixel.pixels,
    letter: state.Pixel.currentLetter,
    glyphset: state.Glyphs[state.Pixel.currentGlyph]
});

const mapDispatchToProps = (dispatch) => ({
    overwritePixels: pixels => dispatch(Pixel.overwritePixels(pixels)),
    setLetterWidth: value => dispatch(Pixel.setLetterWidth(value)),
    setLetterHeight: value => dispatch(Pixel.setLetterHeight(value)),
    assignLetter: (oldLetter, newLetter) => dispatch({
        type: Glyph.ASSIGN_LETTER,
        payload: {oldLetter, newLetter}
    }),
})

const ExportView = ({pixels, letter, glyphset,
    setLetterWidth, setLetterHeight, overwritePixels, assignLetter}) => {
    const [errorLabel, setErrorLabel] = React.useState('');
    const importTextArea = React.createRef();

    const setLastTypedLetter = event => {
        event.preventDefault();
        const newLetter = event.key;
        if (event.key.length > 1) {
            return;
        }
        event.target.value = newLetter;
        assignLetter(letter, newLetter);
    }

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
        <form onSubmit={() => false}>
            <LabelledInput name="iletter" label="Letter:" type="text" value={letter} onKeyPress={setLastTypedLetter}/>
            <LabelledInput name="iwidth" label="Width:" type="number" value={size2D(pixels).width} onChange={(event) => setLetterWidth(event.target.value)}/>
            <LabelledInput name="iheight" label="Height:" type="number" value={size2D(pixels).height} onChange={(event) => setLetterHeight(event.target.value)}/>
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
