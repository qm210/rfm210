import React, { useState, useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {MainView, MainColumn, LabelledInput, QuickButton} from '.';
import ContentEditable from 'react-contenteditable'
import SceneShaderView from './SceneShaderView';
import ParamEditors, { dumpParams } from './ParamEditor';
import { fetchScene, updateScene, updateFigure, selectById, addNewPhrase, copyFigure, deleteFigure,
    selectCurrentFigure, selectFigureList, selectSceneList, addNewScene, deleteScene, reorderScene,
    PHRASE, fetchScenes, addParam, addFigureQmd, deleteFigureQmd, updateFigureQmd } from '../slices/sceneSlice';
import { doc } from '../Initial';
import { whenSubmitted } from '../logic/utils';
import { ButtonBar } from './index';
import { STATUS, SYMBOL } from '../const';
import { Header, Segment, Loader, Table, Form } from 'semantic-ui-react';
import { patchScene } from './../slices/sceneSlice';
import { saneGlslDelimiter } from './../logic/shader';

const SCENE_UPDATE_DEBOUNCE = 500;

export const SceneApp = () => {
    const scene = useSelector(store => store.scene.current);
    const sceneList = useSelector(selectSceneList);
    const status = useSelector(store => store.scene.status);
    const figure = useSelector(selectCurrentFigure);

    const dispatch = useDispatch();
    const [inputs, setInputs] = useReducer((state, newState) => ({...state, ...newState}), {
        sceneTitle: "A horse walks into a bar...",
        sceneId: scene ? scene._id : '',
        sceneQmd: "",
        shaderFunc: "",
        figureQmd: "",
    });
    const [loader, setLoader] = useState(false);
    const sceneUpdateTimeout = React.useRef();

    React.useEffect(() => {
        if (status === STATUS.IDLE) {
            dispatch(fetchScenes())
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
        setInputs({
            sceneTitle: scene.title,
            sceneId: scene._id,
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
    }, [scene, figure, dispatch]);

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

    return <>
        <Loader active={loader} size="massive"/>
        <MainView>
            <MainColumn>
                <SceneManager
                    inputs = {inputs}
                    handleInput = {handleInput}
                />
                <FigureManager/>
                <SceneQmdEditor
                    inputs = {inputs}
                    handleInput = {handleInput}
                    handleSceneUpdate = {handleSceneUpdate}
                />
            </MainColumn>

            <MainColumn>
                <ParamManager/>
            </MainColumn>

            <MainColumn>
                <FigureEditor
                    inputs = {inputs}
                    handleInput = {handleInput}
                />
            </MainColumn>

            <MainColumn>
                {
                    scene &&
                    <SceneShaderView/>
                }
            </MainColumn>
        </MainView>
    </>;
};

export default SceneApp;

const SceneManager = ({inputs, handleInput}) => {
    const scene = useSelector(store => store.scene.current);
    const sceneList = useSelector(selectSceneList);
    const dispatch = useDispatch();

    return <>
        <Header as='h4' attached='top'>
            Scenes
        </Header>
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
                style = {{width: 300, height: 120}}
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
    </>;
};

const SceneQmdEditor = ({inputs, handleInput, handleSceneUpdate}) => {
    const scene = useSelector(store => store.scene.current);
    const dispatch = useDispatch();

    return <>
        <Segment>
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
    </>;
}

const FigureManager = () => {
    const scene = useSelector(store => store.scene.current);
    const figure = useSelector(selectCurrentFigure);
    const figureList = useSelector(selectFigureList);
    const dispatch = useDispatch();

    return <>
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
    </>;
};

const ParamManager = () => {
    const scene = useSelector(store => store.scene.current);
    const dispatch = useDispatch();

    return scene && <>
        <Header as='h5' attached='top'>
            Params
        </Header>
        <Segment attached>
            <textarea
                style = {{width: 310, height: 100, fontSize: ".8rem", resize: 'none'}}
                placeholder = {'no params defined... =('}
                value = {dumpParams(scene.params)}
                disabled
            />
            <div style={{display: 'flex'}}>
                <button
                    style = {{flex: 1}}
                    onClick = {() => {
                        const name = saneGlslDelimiter(
                            window.prompt("parameter name pls")
                        );
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
    </>;
};

const FigureEditor = ({inputs, handleInput}) => {
    const scene = useSelector(store => store.scene.current);
    const figure = useSelector(selectCurrentFigure);
    const dispatch = useDispatch();

    const handleFigureUpdate = name =>
        event => dispatch(updateFigure({[name]: event.target.value}));

    return <>
        <Header as='h5' attached='top'
            onDoubleClick = {() => console.log("FIGURE", figure)}
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
            <Form style={{width: 300}}>
                <Form.Group widths="3">
                    <Form.Input
                        label = "X:"
                        type = "number"
                        step = {.1}
                        value = {figure ? figure.x : 0}
                        onChange = {(_, {value}) => dispatch(updateFigure({x: +value}))}
                        disabled = {!figure}
                    />
                    <Form.Input
                        label = "Y:"
                        type = "number"
                        step = {.1}
                        value = {figure ? figure.y : 0}
                        onChange = {(_, {value}) => dispatch(updateFigure({y: +value}))}
                        disabled = {!figure}
                    />
                    <Form.Input
                        label = "&#966;/°:"
                        type = "number"
                        step = {5}
                        value = {figure ? .1 * Math.round(1800 / Math.PI * figure.phi) : 0}
                        onChange = {(_, {value}) => dispatch(updateFigure({phi: +value * Math.PI/180}))}
                        disabled = {!figure}
                    />
                </Form.Group>
                <Form.Group widths="3">
                    <Form.Input
                        label = "scale"
                        type = "number"
                        step = {.01}
                        value = {figure ? figure.scale : 1}
                        onChange = {event => dispatch(updateFigure({scale: +event.target.value}))}
                        disabled = {!figure}
                    />
                    <Form.Input
                        label = "scaleX"
                        type = "number"
                        step = {.01}
                        value = {figure ? figure.scaleX : 1}
                        onChange = {event => dispatch(updateFigure({scaleX: +event.target.value}))}
                        disabled = {!figure}
                    />
                    <Form.Input
                        label = "scaleY"
                        type = "number"
                        step = {.01}
                        value = {figure ? figure.scaleY : 1}
                        onChange = {event => dispatch(updateFigure({scaleY: +event.target.value}))}
                        disabled = {!figure}
                    />
                </Form.Group>
            </Form>

            <FigureQmdEditor
                inputs = {inputs}
                handleInput = {handleInput}
                handleFigureUpdate = {handleFigureUpdate}
            />
        </Segment>
    </>;
};

const FigureQmdEditor = ({inputs, handleInput, handleFigureUpdate}) => {
    const figure = useSelector(selectCurrentFigure);
    const dispatch = useDispatch();

    React.useEffect(() => {
        if (figure && !figure.qmd) {
            dispatch(updateFigure({qmd: [""]}));
        }
    }, [dispatch, figure]);

    return figure && figure.qmd && <>
        <Table celled compact="very">
            <Table.Header>
                <Table.Row columns={2}>
                    <Table.HeaderCell>
                        Figure QMDs
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                        Actions
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
            {
                figure.qmd.map((qmd, index) =>
                    <Table.Row>
                        <Table.Cell>
                            <input
                                value = {qmd}
                                onChange = {event => dispatch(updateFigureQmd({index, qmd: event.target.value}))}
                                style = {{
                                    outline: 0,
                                    width: "100%",
                                }}
                            />
                        </Table.Cell>
                        <Table.Cell>
                            <button style={{marginRight: 5}}
                                onClick = {() => dispatch(addFigureQmd({index: index + 1}))}
                            >
                                +
                            </button>
                            <button
                                onClick = {() => dispatch(addFigureQmd({index: index}))}
                            >
                                --
                            </button>
                        </Table.Cell>
                    </Table.Row>
                )
            }
            </Table.Body>
        </Table>
    </>;
};