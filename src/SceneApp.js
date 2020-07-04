import React from 'react';
import {connect} from 'react-redux';
import * as State from './ReduxState';
import {MainView, MainColumn, LabelledInput, QuickButton} from './components';
import SceneShaderView from './components/SceneShaderView';
import Initial from './Initial';

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
    setPhraseChars: chars => dispatch({type: State.UPDATE_PHRASE, payload: {chars}}),
    setPhraseX: x => dispatch({type: State.UPDATE_PHRASE, payload: {x}}),
    setPhraseY: y => dispatch({type: State.UPDATE_PHRASE, payload: {y}}),
    setPhraseRotate: rotate => dispatch({type: State.UPDATE_PHRASE,  payload: {rotate}}),
});

const SceneApp = ({scenes, scene, phrase, defines,
    setWidth, setHeight, setDuration, setPhraseChars, setPhraseX, setPhraseY, setPhraseRotate}) => {
    const sceneQmd = React.createRef();
    const phraseQmd = React.createRef();
    const defineList = React.createRef();

    console.log(scenes, scene, phrase, defines);
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
                    size={10}
                    >
                    {scene.phrases.map((phrase, index) =>
                        <option key={index} value={phrase.id}>
                            {`${phrase.id}: ${phrase.chars || '<empty>'}`}
                        </option>
                    )}
                </select>
                <div style={{marginTop: 10}}>
                    <QuickButton>
                        + Phrase
                    </QuickButton>
                    <QuickButton>
                        Copy
                    </QuickButton>
                    <QuickButton
                        disabled = {scene.phrases.length === 1}
                        >
                            Delete
                    </QuickButton>
                </div>
            </MainColumn>
            <MainColumn>
                <label htmlFor="scene">Scene qmmands:</label>
                <textarea
                    ref = {sceneQmd}
                    style = {{width: 310, height: 300, resize: 'none'}}
                    placeholder = {'just render everything, all the time'}
                    defaultValue = {scene.qmd.join('\n')}
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
                    ref = {defineList}
                    style = {{width: 310, height: 100, resize: 'none'}}
                    placeholder = {'const value\n...'}
                    defaultValue = {Object.keys(defines).join('\n')}
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
                        onChange = {event => setPhraseChars(event.target.value)}
                    />
                </div>
                <div>
                    <LabelledInput
                        name="ix"
                        label="X:"
                        type="number"
                        style={{width: 60}}
                        value={phrase.x}
                        onChange = {event => setPhraseX(+event.target.value)}
                    />
                    <LabelledInput
                        name="iy"
                        label="Y:"
                        type="number"
                        style={{width: 60}}
                        value={phrase.y}
                        onChange = {event => setPhraseY(+event.target.value)}
                    />
                    <LabelledInput
                        name="iphi"
                        label="&#966;/°:"
                        type="number"
                        style={{width: 60}}
                        value={phrase.rotate}
                        onChange = {event => setPhraseRotate(+event.target.value)}
                    />
                </div>
                <label htmlFor="phrase">Phrase qmmands:</label>
                <textarea
                    ref = {phraseQmd}
                    style = {{width: 300, height: 200, resize: 'none'}}
                    placeholder = {'be lame and do nothing'}
                    defaultValue = {phrase.qmd.join('\n')}
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
