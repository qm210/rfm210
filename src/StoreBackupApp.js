import React from 'react';
import {connect} from 'react-redux';
import {ExportList, ExportTextArea, ErrorLabel} from './components';
import * as State from './ReduxState';
//import Initial from './Initial';
import {clearStore} from './LocalStorage';

const mapStateToProps = (state) => ({
    state
});

const mapDispatchToProps = (dispatch) => ({
    replaceState: state => dispatch({type: State.REPLACE_STATE, payload: state}),
})

const StoreBackupApp = ({state, pixels, overwritePixels}) => {
    const [errorLabel, setErrorLabel] = React.useState('');
    const importTextArea = React.createRef();

    const tryStateImport = (event) => {
        event.preventDefault();
        const tryImportText = importTextArea.current.value
        if (!tryImportText) {
            return;
        }
        try {
            /*const importedState = */JSON.parse(tryImportText);
            /* could test here whether the structure matches to the current Initial.state */
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
        <button style={{margin: 10, padding: 10}} onClick={clearStore}>
            Clear Cache
        </button>
        <button style={{margin: 10, padding: 10}} onClick={() => console.log(state)}>
            DEBUG
        </button>
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

export default connect(mapStateToProps, mapDispatchToProps)(StoreBackupApp);
