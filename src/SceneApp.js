import React from 'react';
import {connect} from 'react-redux';
import * as State from './ReduxState';
import {MainView, MainColumn, LabelledInput, QuickButton} from './components';
import SceneShaderView from './components/SceneShaderView';
import Initial from './Initial';
import {joinObject, splitToObject, whenSubmitted} from './Utils';

const mapStateToProps = (state) => ({
    scenes: state.scenes,
    scene: State.currentScene(state),
    phrase: State.currentPhrase(state),
    defines: state.defines,
});

const mapDispatchToProps = (dispatch) => ({
    setWidth: width => dispatch({type: State.UPDATE_SCENE, payload: {width}}),
    setHeight: height => dispatch({type: State.UPDATE_SCENE, payload: {height}}),
    setDuration: duration => dispatch({type: State.UPDATE_SCENE, payload: {duration}}),
    setSceneQmd: qmd => dispatch({type: State.UPDATE_SCENE, payload: {qmd}}),
    setPhraseQmd: qmd => dispatch({type: State.UPDATE_PHRASE, payload: {qmd}}),
    setDefines: defines => dispatch({type: State.SET_DEFINES, payload: defines}),
    addNewPhrase: () => dispatch({type: State.ADD_NEW_PHRASE}),
    copyPhrase: () => dispatch({type: State.COPY_PHRASE}),
    deletePhrase: () => dispatch({type: State.DELETE_PHRASE}),

    onSetPhraseChars: event =>
        dispatch({type: State.UPDATE_PHRASE, payload: {chars: event.target.value}}),
    onSetPhraseX: event =>
        dispatch({type: State.UPDATE_PHRASE, payload: {x: +event.target.value}}),
    onSetPhraseY: event =>
        dispatch({type: State.UPDATE_PHRASE, payload: {y: +event.target.value}}),
    onSetPhraseRotate: event =>
        dispatch({type: State.UPDATE_PHRASE,  payload: {rotate: +event.target.value * Math.PI / 180}}),
    onLoadPhrase: event =>
        dispatch({type: State.LOAD_PHRASE, payload: +event.target.value})
});

const SceneApp = ({scenes, scene, phrase, defines, setWidth, setHeight, setDuration, setSceneQmd,
    onSetPhraseChars, onSetPhraseX, onSetPhraseY, onSetPhraseRotate, setPhraseQmd, setDefines,
    addNewPhrase, copyPhrase, deletePhrase, onLoadPhrase}) => {
    const [inputSceneQmd, setInputSceneQmd] = React.useState(scene.qmd.join('\n'));
    const [inputPhraseQmd, setInputPhraseQmd] = React.useState(phrase.qmd.join('\n'));
    const [inputDefines, setInputDefines] = React.useState(joinObject(defines, ' ', '\n'));

    const submitSceneQmd = () => setSceneQmd(inputSceneQmd.split('\n'));
    const submitPhraseQmd = () => setPhraseQmd(inputPhraseQmd.split('\n'));
    const submitDefines = () => setDefines(splitToObject(inputDefines, '\n', ' '));

    return <>
        <MainView>
            <MainColumn>
                <div>
                    Scenes
                </div>
                <select
                    size={10}
                    style={{width: 300}}
                    >
                    {scenes.map((eachScene, index) =>
                        <option key={index} value={eachScene.id}>
                            {eachScene.title || `<unnamed ${eachScene.id}>`}
                        </option>
                    )}
                </select>
                <div>
                    Phrases
                </div>
                <select
                    size = {10}
                    value = {phrase.id}
                    onChange = {onLoadPhrase}>
                        {scene.phrases.map((phrase, index) =>
                            <option key={index} value={phrase.id}>
                                {`${phrase.id}: ${phrase.chars || '<empty>'}`}
                            </option>
                        )}
                </select>
                <div style={{marginTop: 10}}>
                    <QuickButton
                        onClick={addNewPhrase}>
                        + Phrase
                    </QuickButton>
                    <QuickButton
                        onClick={copyPhrase}>
                        Copy
                    </QuickButton>
                    <QuickButton
                        onClick={deletePhrase}
                        disabled = {scene.phrases.length === 1}>
                            Delete
                    </QuickButton>
                </div>
            </MainColumn>
            <MainColumn>
                <label htmlFor="scene">Scene qmmands:</label>
                <textarea
                    style = {{width: 310, height: 300, resize: 'none'}}
                    placeholder = {'just render everything, all the time'}
                    value = {inputSceneQmd}
                    onChange = {React.useCallback(event => setInputSceneQmd(event.target.value), [setInputSceneQmd])}
                    onKeyDown = {event => whenSubmitted(event, submitSceneQmd)}
                    onBlur = {submitSceneQmd}
                />
                <div>
                    <LabelledInput
                        name="ix"
                        label="W:"
                        type="number"
                        style={{width: 55}}
                        value={scene.width}
                        onChange={setWidth}
                    />
                    <LabelledInput
                        name="iy"
                        label="H:"
                        type="number"
                        style={{width: 55}}
                        value={scene.height}
                        onChange={setHeight}
                    />
                    <LabelledInput
                        name="iphi"
                        label="&#916;T/sec:"
                        type="number"
                        style={{width: 55}}
                        value={scene.duration}
                        onChange={setDuration}
                    />
                </div>
                <label>#define</label>
                <textarea
                    style = {{width: 310, height: 100, resize: 'none'}}
                    placeholder = {'const value\n...'}
                    value = {inputDefines}
                    onChange = {React.useCallback(event => setInputDefines(event.target.value), [setInputDefines])}
                    onKeyDown = {event => whenSubmitted(event, () => submitDefines)}
                    onBlur = {submitDefines}
                />
            </MainColumn>
            <MainColumn>
                <div>
                    <LabelledInput
                        name="ichars"
                        label="Phrase:"
                        type="text"
                        style = {{width: 300}}
                        value = {phrase.chars}
                        onChange = {onSetPhraseChars}
                    />
                </div>
                <div>
                    <LabelledInput
                        name="ix"
                        label="X:"
                        type="number"
                        style={{width: 60}}
                        value={phrase.x}
                        onChange = {onSetPhraseX}
                    />
                    <LabelledInput
                        name="iy"
                        label="Y:"
                        type="number"
                        style={{width: 60}}
                        value={phrase.y}
                        onChange = {onSetPhraseY}
                    />
                    <LabelledInput
                        name="iphi"
                        label="&#966;/°:"
                        type="number"
                        style={{width: 60}}
                        value={180 / Math.PI * phrase.rotate}
                        onChange = {onSetPhraseRotate}
                    />
                </div>
                <label htmlFor="phrase">Phrase qmmands:</label>
                <textarea
                    style = {{width: 300, height: 200, resize: 'none'}}
                    placeholder = {'0..forever: be lame and do nothing'}
                    value = {inputPhraseQmd}
                    onChange = {React.useCallback(event => setInputPhraseQmd(event.target.value), [setInputPhraseQmd])}
                    onKeyDown = {event => whenSubmitted(event, submitPhraseQmd)}
                    onBlur = {submitPhraseQmd}
                />
            </MainColumn>
            <MainColumn>
                <SceneShaderView/>
            </MainColumn>
            <MainColumn>
                <code style={{whiteSpace: 'pre-line'}}>
                    {Initial.doc}
                </code>
            </MainColumn>
        </MainView>
    </>;
};

export default connect(mapStateToProps, mapDispatchToProps)(SceneApp);
