import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import * as Pixel from '../ducks/Pixel';
import { size2D } from '../Utils';

const mapStateToProps = (state) => ({
    pixels: state.Pixel.pixels
});

const mapDispatchToProps = (dispatch) => ({
    overwritePixels: (pixels) => dispatch(Pixel.overwritePixels(pixels)),
    setLetterWidth: (value) => dispatch(Pixel.setLetterWidth(value)),
    setLetterHeight: (value) => dispatch(Pixel.setLetterHeight(value))
})

const ExportList = styled.div`
    display: flex;
    flex-direction: column;
    alignItems: left;
    margin: 10px;
`;

const SpacedInput = styled.input`
    margin: 10px;
    width: 200px;
    font-size: 1.2em;
`;

const LabelledInput = (props) => <>
    <label htmlFor={props.name}>{props.label}</label>
    <SpacedInput {...props}/><br/>
</>;

const ExportTextArea = styled.textarea`
    resize: none;
    width: 321px;
    height: 180px;
    margin: 10px;
    font-size: 9.5px;
`

const ErrorLabel = styled.span`
    margin-left: 10px;
    color: red;
    font-weight: bold;
    font-size: 18px;
`

const setLastTypedLetter = event => {
    event.preventDefault();
    event.target.value = event.key;
}

const importTextArea = React.createRef();

const ExportView = ({pixels, setLetterWidth, setLetterHeight, overwritePixels}) => {
    const [errorLabel, setErrorLabel] = React.useState('');

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
            <LabelledInput name="iletter" label="Letter:" type="text" onKeyPress={setLastTypedLetter}/>
            <LabelledInput name="iwidth" label="Width:" type="number" value={size2D(pixels).width} onChange={(event) => setLetterWidth(event.target.value)}/>
            <LabelledInput name="iheight" label="Height:" type="number" value={size2D(pixels).height} onChange={(event) => setLetterHeight(event.target.value)}/>
            <ExportTextArea
                value = {JSON.stringify(pixels)}
                readOnly
            />
            <br/>
            <b>Import existing JSON pixel array:</b>
            <ExportTextArea
                ref = {importTextArea}
                onKeyPress = {event => event.ctrlKey && event.charCode == 13 ? tryPixelImport(event) : null}
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
