import React, { useState, useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {MainView, MainColumn, LabelledInput, QuickButton} from '.';
import SceneShaderView from './SceneShaderView';
import ParamEditors, { dumpParams } from './ParamEditor';
import { fetchScene, updateScene, updateFigure, selectById, addNewPhrase, copyFigure, deleteFigure,
    selectCurrentFigure, selectFigureList, selectSceneList, addNewScene, deleteScene, reorderScene,
    PHRASE, fetchScenes, addParam, deleteParam } from '../slices/sceneSlice';
import { doc } from '../Initial';
import { whenSubmitted } from '../logic/utils';
import { ButtonBar } from './index';
import { STATUS, SYMBOL } from '../const';
import { Header, Segment, Loader } from 'semantic-ui-react';
import { patchScene } from './../slices/sceneSlice';

const SCENE_UPDATE_DEBOUNCE = 500;

export const SceneApp = () => {
    const scene = useSelector(store => store.scene.current);
    const sceneList = useSelector(selectSceneList);
    const status = useSelector(store => store.scene.status);
    const figure = useSelector(selectCurrentFigure);
    const figureList = useSelector(selectFigureList);
    const dispatch = useDispatch();
    const [inputs, setInputs] = useReducer((state, newState) => ({...state, ...newState}), {
        sceneTitle: "A horse walks into a bar...",
        sceneId: scene ? scene._id : '',
        sceneQmd: "",
        figureQmd: "",
        params: "",
        shaderFunc: "",
    });
    const [loader, setLoader] = useState(false);
    const sceneUpdateTimeout = React.useRef();

    React.useEffect(() => {
        if (status === STATUS.IDLE) {
            dispatch(fetchScenes())
                .then(it => console.log("FETCHY", it));
        }
    }, [dispatch, status]);

    React.useEffect(() => {
        var timeout;
        if (status === STATUS.LOADING) {
            timeout = setTimeout(() => setLoader(true), 500);
        }
        else {
            clearTimeout(timeout);
            setLoader(false);
        }
        return () => clearTimeout(timeout);
    }, [status, setLoader]);

    React.useEffect(() => {
        if (!scene) {
            return;
        }
        console.log("RELOAD", "params:", scene.params);
        setInputs({
            sceneTitle: scene.title,
            sceneId: scene._id,
            params: dumpParams(scene.params),
            // ADD other fields here!
        });
    }, [scene, setInputs]);

    React.useEffect(() => {
        if (!scene && sceneList.length > 0 && status === STATUS.OK) {
            dispatch(fetchScene(sceneList[0]._id));
        }
    }, [dispatch, status, scene, sceneList]);

    React.useEffect(() => {
        const debounce = scene && setTimeout(() => {
            console.log("update scene to surfer:", scene);
            dispatch(patchScene());
        }, SCENE_UPDATE_DEBOUNCE);
        return () => clearTimeout(debounce);
    }, [scene, dispatch]);

    const handleInput = event => {
        const {name, value} = event.target;
        setInputs({[name]: value});
    };

    const handleSceneUpdate = name =>
        event => {
            if (sceneUpdateTimeout.current) {
                clearTimeout(sceneUpdateTimeout.current);
            }
            event.persist();
            sceneUpdateTimeout.current = setTimeout(() =>
                dispatch(updateScene({[name]: event.target.value})),
                200
            );
        }

    const handleFigureUpdate = name =>
        event => dispatch(updateFigure({[name]: event.target.value}));

    return <>
        <Loader active={loader} size="massive"/>
        <MainView>
            <MainColumn>
                <Header as='h4' attached='top'>Scenes</Header>
                <Segment attached>
                    <ButtonBar>
                        <QuickButton
                            onClick = {() => dispatch(addNewScene({title: inputs.sceneTitle}))}
                            disabled = {!inputs.sceneTitle}
                            >
                            + Scene
                        </QuickButton>
                        <QuickButton
                            onClick = {() => dispatch(deleteScene(scene._id))}
                            disabled = {!scene}
                            >
                            Delete
                        </QuickButton>
                        <QuickButton
                            onClick = {() => dispatch(reorderScene(-1))}
                            disabled = {!scene || scene.order === 0}
                            >
                            {SYMBOL.UP}
                        </QuickButton>
                        <QuickButton
                            onClick = {() => dispatch(reorderScene(+1))}
                            disabled = {!scene || scene.order === sceneList.length - 1}
                            >
                            {SYMBOL.DOWN}
                        </QuickButton>
                    </ButtonBar>

                    <div>
                        <LabelledInput
                            label = "Title:"
                            placeholder = "A horse walks into a bar..."
                            style={{width: 250}}
                            type = "text"
                            name = "sceneTitle"
                            value = {inputs.sceneTitle}
                            onChange = {handleInput}
                            onKeyDown = {event => whenSubmitted(event, () =>
                                dispatch(addNewScene({title: inputs.sceneTitle}))
                            )}
                        />
                    </div>

                    <select
                        size = "10"
                        style = {{width: 300}}
                        value = {inputs.sceneId || ''}
                        name = {'sceneId'}
                        onChange = {event => {
                            handleInput(event);
                            dispatch(fetchScene(event.target.value));
                        }}
                        >
                        {sceneList.map((it, index) =>
                            <option key={index} value={it._id}>
                                {it.title + ' ' + it._id || `<unnamed ${it._id}>`}
                            </option>
                        )}
                    </select>
                </Segment>
                <Segment attached>
                    <div>
                    <LabelledInput
                            name = "iduration"
                            label = "&#916;T/sec:"
                            type = "number"
                            min = "0"
                            style = {{width: 55}}
                            value = {(scene && scene.duration) || 0}
                            onChange = {event => dispatch(updateScene({duration: +event.target.value}))}
                            disabled = {!scene}
                        />
                    </div>
                    <div>Scene qmmands:</div>
                    <textarea
                        style = {{width: 310, height: 300, resize: 'none'}}
                        placeholder = {'just render everyfigure, all the time'}
                        value = {inputs.sceneQmd}
                        name = {'sceneQmd'}
                        onChange = {handleInput}
                        onKeyDown = {event => whenSubmitted(event, handleSceneUpdate('qmd'))}
                        onBlur = {handleSceneUpdate('qmd')}
                        disabled = {!scene}
                    />
                </Segment>
            </MainColumn>

            <MainColumn>
                <Header as='h4' attached='top'>
                    Figures
                </Header>
                <Segment attached>
                    <ButtonBar>
                        <QuickButton
                            onClick={() => {dispatch(addNewPhrase())}}
                            disabled = {!scene}
                            >
                            + Figure
                        </QuickButton>
                        <QuickButton
                            onClick={() => dispatch(copyFigure())}
                            disabled = {!scene || !figure}
                            >
                            Copy
                        </QuickButton>
                        <QuickButton
                            onClick={() => dispatch(deleteFigure())}
                            disabled = {!scene || !figure}
                            >
                                Delete
                        </QuickButton>
                    </ButtonBar>
                    <select
                        size = {12}
                        style = {{width: '100%'}}
                        disabled = {!scene}
                        value = {(figure && figure.id) || ''}
                        onChange = {event => dispatch(selectById(event.target.value))}
                        >
                            {figureList.map((figure, index) =>
                                <option
                                    key = {index}
                                    value = {figure.id}>
                                    {
                                        `${figure.id}: ${figure.chars || '<figure>'}`
                                    }
                                </option>
                            )}
                    </select>
                </Segment>

                <Header as='h5' attached='top'>Params</Header>
                <Segment attached>
                    <textarea
                        style = {{width: 310, height: 100, resize: 'none'}}
                        placeholder = {'const value\n...'}
                        value = {inputs.params}
                        name = {'params'}
                        onChange = {handleInput}
                        onKeyDown = {handleSceneUpdate('params')}
                        onBlur = {handleSceneUpdate('params')}
                        disabled
                    />
                    <div style={{display: 'flex'}}>
                        <button
                            style = {{flex: 1}}
                            onClick = {() => {
                                const name = window.prompt("parameter name pls");
                                if (name) {
                                    dispatch(addParam(name))
                                }
                            }}>
                                + param
                        </button>
                    </div>
                </Segment>
                {
                    scene &&
                    <ParamEditors/>
                }
            </MainColumn>

            <MainColumn>
                <Header as='h5' attached='top'
                    onDoubleClick = {() => {
                        console.log("FIGURE", figure);
                    }}
                >
                    Figure</Header>
                <Segment attached>
                    <div>
                        <LabelledInput
                            type = "checkbox"
                            label = "Phrase?"
                            checked = {!!figure && figure.type === PHRASE}
                            disabled = {!figure}
                            onChange = {event => dispatch(updateFigure({type: event.target.checked ? PHRASE : null}))}
                        />
                        <LabelledInput
                            type = "checkbox"
                            label = "Render placeholder"
                            checked = {!!figure && figure.placeholder}
                            disabled = {!figure}
                            onChange = {event => dispatch(updateFigure({placeholder: event.target.checked}))}
                        />
                    </div>
                    <div>
                        {
                        (figure && figure.type === PHRASE &&
                        <LabelledInput
                            name = "ichars"
                            label = ""
                            placeholder = "Enter phrase..."
                            type = "text"
                            style = {{width: 300}}
                            value = {figure && figure.chars ? figure.chars : '<add phrase first>'}
                            onChange = {event => dispatch(updateFigure({chars: event.target.value}))}
                            disabled = {!figure || figure.type !== PHRASE}
                        />
                        ) ||
                        <textarea
                            style = {{width: 310, height: 100, resize: 'none'}}
                            placeholder = {'shaderFunc() {\n    ...\n}'}
                            value = {inputs.shaderFunc}
                            name = {'shaderFunc'}
                            onChange = {handleInput}
                            onKeyDown = {event => whenSubmitted(event, handleFigureUpdate('shaderFunc'))}
                            onBlur = {handleFigureUpdate('shaderFunc')}
                            disabled = {!scene}
                        />
                        }
                    </div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <LabelledInput
                            name = "ix"
                            label = "X:"
                            type = "number"
                            step = {.01}
                            value = {figure ? figure.x : 0}
                            onChange = {event => dispatch(updateFigure({x: +event.target.value}))}
                            disabled = {!figure}
                        />
                        <LabelledInput
                            name = "iy"
                            label = "Y:"
                            type = "number"
                            step = {.01}
                            value = {figure ? figure.y : 0}
                            onChange = {event => dispatch(updateFigure({y: +event.target.value}))}
                            disabled = {!figure}
                        />
                        <LabelledInput
                            name = "iphi"
                            label = "&#966;/°:"
                            type = "number"
                            value = {figure ? 180 / Math.PI * figure.phi : 0}
                            onChange = {event => dispatch(updateFigure({phi: +event.target.value * Math.PI/180}))}
                            disabled = {!figure}
                        />
                    </div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <LabelledInput
                            name = "iscale"
                            label = "scale:"
                            type = "number"
                            step = {.01}
                            value = {figure ? figure.scale : 1}
                            onChange = {event => dispatch(updateFigure({scale: +event.target.value}))}
                            disabled = {!figure}
                        />
                        <LabelledInput
                            name = "iscalex"
                            label = "scaleX:"
                            type = "number"
                            step = {.01}
                            value = {figure ? figure.scaleX : 1}
                            onChange = {event => dispatch(updateFigure({scaleX: +event.target.value}))}
                            disabled = {!figure}
                        />
                        <LabelledInput
                            name = "iscaley"
                            label = "scaleY:"
                            type = "number"
                            step = {.01}
                            value = {figure ? figure.scaleY : 1}
                            onChange = {event => dispatch(updateFigure({scaleY: +event.target.value}))}
                            disabled = {!figure}
                        />
                    </div>
                    <div>Figure qmmands:</div>
                    <textarea
                        style = {{width: 300, height: 200, resize: 'none'}}
                        placeholder = {'0..forever: be lame and do nothing'}
                        value = {inputs.figureQmd}
                        name = {'figureQmd'}
                        onChange = {handleInput}
                        onKeyDown = {event => whenSubmitted(event, handleFigureUpdate('qmd'))}
                        onBlur = {handleFigureUpdate('qmd')}
                        disabled = {!figure}
                    />
                </Segment>
            </MainColumn>

            <MainColumn>
                {
                    scene &&
                    <SceneShaderView/>
                }
            </MainColumn>

            <MainColumn>
                <code style={{whiteSpace: 'pre-line'}}>
                    {doc}
                </code>
            </MainColumn>
        </MainView>
    </>;
};

export default SceneApp;