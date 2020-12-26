import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFigure, selectCurrentFigure, PHRASE,
    addFigureQmd, deleteFigureQmd, updateFigureQmd } from '../slices/sceneSlice';
import { SYMBOL } from '../const';
import { Header, Segment, Table, Form, Input } from 'semantic-ui-react';
import { LabelledInput, SpacedInput } from '.';
import GlyphsetSelector from './GlyphsetSelector';

const shaderFuncTemplate = figure =>
`void fig${figure.id} (inout vec3 col, in vec2 coord)
{
    vec2 pos = vec2(0.5)-coord;

    float r = length(pos)*2.0;
    float a = atan(pos.y,pos.x);

    float f = cos(a*3.);
    // f = abs(cos(a*3.));
    // f = abs(cos(a*2.5))*.5+.3;
    // f = abs(cos(a*12.)*sin(a*3.))*.8+.1;
    // f = smoothstep(-.5,1., cos(a*10.))*0.2+0.5;

    col = vec3( 1.-smoothstep(f,f+0.02,r) );
}
`

const FigureEditor = ({ inputs, handleInput }) => {
    const scene = useSelector(store => store.scene.current);
    const figure = useSelector(selectCurrentFigure);
    const dispatch = useDispatch();

    React.useEffect(() => {
        if (figure && !figure.shaderFunc) {
            dispatch(updateFigure({
                shaderFunc: shaderFuncTemplate(figure)
            }));
        }
    }, [figure, dispatch]);

    const handleFigureUpdate = name =>
        event => dispatch(updateFigure({ [name]: event.target.value }));

    return figure && <>
        <Header as='h5' attached='top'
            onDoubleClick={() => console.log("FIGURE", figure)}
        >
            Figure: {figure.shaderFunc ? getShaderFuncName(figure.shaderFunc) : `figure${figure.id}`}
        </Header>
        <Segment attached>
            <div
                style = {{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                <LabelledInput
                    type="checkbox"
                    label="Render placeholder"
                    checked={!!figure && figure.placeholder}
                    disabled={!figure}
                    onChange={event => dispatch(updateFigure({ placeholder: event.target.checked }))}
                    style = {{width: 30}}
                />
                <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                }}>
                    <LabelledInput
                        type="checkbox"
                        label="Phrase?"
                        checked={!!figure && figure.type === PHRASE}
                        disabled={!figure}
                        onChange={event => dispatch(updateFigure({ type: event.target.checked ? PHRASE : null }))}
                        style = {{width: 30}}
                    />
                    <LabelledInput
                        name="ichars"
                        label=""
                        placeholder="Enter phrase..."
                        type="text"
                        style={{width: 170, fontSize: '1.2rem', marginLeft: 20, marginRight: 10 }}
                        value={figure && figure.chars ? figure.chars : '<add phrase first>'}
                        onChange={event => dispatch(updateFigure({ chars: event.target.value }))}
                        disabled={figure.type !== PHRASE}
                    />
                    <GlyphsetSelector
                        disabled = {figure.type !== PHRASE}
                        style = {{
                            width: 80
                        }}
                    />
                </div>
                <textarea
                    style={{
                        width: 400,
                        height: 100,
                        fontSize: '.75rem',
                        fontFamily: 'monospace',
                        backgroundColor: figure.placeholder ? 'silver' : undefined
                }}
                    placeholder={'void shaderFunc() {\n    ...\n}'}
                    value={inputs.shaderFunc}
                    name={'shaderFunc'}
                    onChange={handleInput}
                    onBlur={handleFigureUpdate('shaderFunc')}
                    disabled={!scene}
                />
            </div>
            <Table compact>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell collapsing>
                            <label>X:</label>
                        </Table.Cell>
                        <Table.Cell>
                            <input
                                type="number"
                                step={.01}
                                value={figure ? figure.x : 0}
                                onChange={(_, { value }) => dispatch(updateFigure({ x: +value }))}
                                disabled={!figure}
                                style = {{width: 60}}
                            />
                        </Table.Cell>
                        <Table.Cell collapsing>
                            <label>Y:</label>
                        </Table.Cell>
                        <Table.Cell>
                            <input
                                type="number"
                                step={.01}
                                value={figure ? figure.y : 0}
                                onChange={(_, { value }) => dispatch(updateFigure({ y: +value }))}
                                disabled={!figure}
                                style = {{width: 60}}
                            />
                        </Table.Cell>
                        <Table.Cell collapsing>
                            <label>φ/°:</label>
                        </Table.Cell>
                        <Table.Cell>
                            <input
                                type="number"
                                step={1}
                                value={figure ? .1 * Math.round(1800 / Math.PI * figure.phi) : 0}
                                onChange={(_, { value }) => dispatch(updateFigure({ phi: +value * Math.PI / 180 }))}
                                disabled={!figure}
                                style = {{width: 60}}
                            />
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell collapsing>
                            <label>scale:</label>
                        </Table.Cell>
                        <Table.Cell>
                            <input
                                type="number"
                                step={.01}
                                value={figure ? figure.scale : 1}
                                onChange={event => dispatch(updateFigure({ scale: +event.target.value }))}
                                disabled={!figure}
                                style = {{width: 60}}
                            />
                        </Table.Cell>
                        <Table.Cell collapsing>
                            <label>scaleX:</label>
                        </Table.Cell>
                        <Table.Cell>
                            <input
                                type="number"
                                step={.01}
                                value={figure ? figure.scaleX : 1}
                                onChange={event => dispatch(updateFigure({ scaleX: +event.target.value }))}
                                disabled={!figure}
                                style = {{width: 60}}
                            />
                        </Table.Cell>
                        <Table.Cell collapsing>
                            <label>scaleY:</label>
                        </Table.Cell>
                        <Table.Cell>
                            <input
                                type="number"
                                step={1}
                                value={figure ? figure.scaleY : 1}
                                onChange={event => dispatch(updateFigure({ scaleY: +event.target.value }))}
                                disabled={!figure}
                                style = {{width: 60}}
                            />
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </Segment>
        <FigureQmdEditor/>
    </>;
};

export default FigureEditor;

const FigureQmdEditor = () => {
    const figure = useSelector(selectCurrentFigure);
    const dispatch = useDispatch();

    React.useEffect(() => {
        if (!figure) {
            return;
        }
        if (!figure.qmd || figure.qmd.length === 0) {
            dispatch(updateFigure({ qmd: [""] }));
        } else if (figure.qmd.slice(-1)[0] !== "") {
            dispatch(addFigureQmd({ index: figure.qmd.length, qmd: "" }));
        }
    }, [dispatch, figure]);

    return figure && figure.qmd && <>
        <Table celled compact="very">
            <Table.Header>
                <Table.Row columns={2}>
                    <Table.HeaderCell colSpan={2}>
                        {"FROM..TO[,REPEAT]; QMD(VAR, PARAM)"}
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {figure.qmd.map((qmd, index) => <Table.Row key={index}>
                    <Table.Cell style={{ display: 'flex' }}>
                        <button
                            style = {{marginRight: 3}}
                            onClick={() => dispatch(updateFigureQmd({ index, qmd: qmdToggled(qmd) }))}
                            disabled = {!qmd}
                        >
                            {activeQmd(qmd) && qmd ? SYMBOL.CHECKBOX_YES : SYMBOL.CHECKBOX_EMPTY}
                        </button>
                        <input
                            value={qmd || ''}
                            onChange={event => dispatch(updateFigureQmd({ index, qmd: event.target.value }))}
                            placeholder={"FROM..TO; QMD VAR FUNC"}
                            style={{
                                outline: 0,
                                width: "100%",
                                backgroundColor: qmdFieldColor(qmd),
                            }} />
                    </Table.Cell>
                    <Table.Cell>
                        <button
                            style = {{marginRight: 5}}
                            onClick={() => dispatch(addFigureQmd({ index: index + 1, qmd }))}
                        >
                            {SYMBOL.PLUS}
                        </button>
                        <button
                            onClick={() => dispatch(deleteFigureQmd({ index: index }))}
                        >
                            {SYMBOL.MINUS}
                        </button>
                    </Table.Cell>
                </Table.Row>
                )}
            </Table.Body>
        </Table>
        <div>
            Known Subjects:
            <ul>
            {
                getAllSubjects(figure).map((subject, key) =>
                    <li
                        key = {key}
                        style = {{fontFamily: 'monospace'}}
                    >
                        {subject}
                    </li>
                )
            }
            </ul>
        </div>
    </>;
};

export const validQmd = qmd => {
    if (!qmd.match(/\d*..\d*;[a-zA-Z ]+/ig)) {
        return false;
    }
    const parsed = parseQmd(qmd);
    if (parsed.error) {
        return false;
    }
    if (!knownQmds.some(it => parsed.body.includes(it))) {
        return false;
    }
    return true;
};
const knownQmds = ['show', 'hide', 'animate'];

export const parseQmd = qmd => {
    const parsed = {};
    try {
        [parsed.times, parsed.body] = qmd.split(';');
        const timeParse = parsed.times.split('..');
        parsed.timeStart = +timeParse[0];
        parsed.timeEnd = +timeParse[1];
        if (parsed.timeStart > parsed.timeEnd) {
            parsed.error = "ending before start";
            return parsed;
        }
        parsed.body = parsed.body.trim();
        const bodyParse = parsed.body.replace(/\s\s+/g, ' ').split(' ');
        parsed.action = bodyParse.shift();
        parsed.subject = bodyParse.shift();
        parsed.mode = (bodyParse[0].length === 1) ? bodyParse.shift() : '=';
        parsed.param = parseQmdArgs(bodyParse);
        return parsed;
    }
    catch {
        return {
            ...parsed,
            error: "can't parse"
        };
    }
};

const parseQmdArgs = args => {
    const param = {};
    param.func = args[0].replaceAll('(', '').replaceAll(')', '');
    param.shift = 0;
    param.scale = 1;
    param.timeScale = 1;
    for (const arg of args.slice(1)) {
        maybeArg(arg, '*',
            value => param.scale *= +value
        );
        maybeArg(arg, '+',
            value => param.shift += +value
        );
        maybeArg(arg, '-',
            value => param.shift -= +value
        );
        maybeArg(arg, 'T*',
            value => param.timeScale *= +value
        );
    }
    return param;
};

const maybeArg = (arg, prefix, mutator) => {
    if (arg.startsWith(prefix)) {
        const value = arg.slice(prefix.length);
        if (value !== "") {
            mutator(value);
        }
    }
}

export const activeQmd = qmd => !qmd.startsWith("#");

const qmdToggled = qmd => {
    if (activeQmd(qmd)) {
        return '# ' + qmd;
    }
    return qmd.replaceAll('#', '').trim();
};

const qmdFieldColor = qmd => {
    if (!qmd) {
        return undefined;
    }
    if (!activeQmd(qmd)) {
        return '#bbb';
    }
    if (!validQmd(qmd)) {
        return '#f88';
    }
    return undefined;
};

export const defaultSubjects = ['x', 'y', 'phi', 'scale', 'scaleX', 'scaleY', 'alpha'];

export const getShaderFuncName = (shaderFunc) => {
    const found = shaderFunc.match(/(?<=void).*(?=\()/im);
    if (!found) {
        return "__ERROR";
    }
    return found[0].trim();
}

export const getSubjects = (figure) => {
    const found = figure.shaderFunc.match(/(?<=\().*(?=\))/i);
    if (!found || figure.placeholder) {
        return [];
    }
    const argSubjects = found[0]
        .trim()
        .split(',')
        .map(it => it.split(' ').slice(-1)[0])
        .filter(it => !["col", "coord"].includes(it));
    return argSubjects;
}

export const getAllSubjects = (figure) => {
    return [...defaultSubjects, ...getSubjects(figure)];
}