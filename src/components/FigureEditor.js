import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFigure, selectCurrentFigure, PHRASE,
    addFigureQmd, deleteFigureQmd, updateFigureQmd } from '../slices/sceneSlice';
import { SYMBOL } from '../const';
import { Header, Segment, Table } from 'semantic-ui-react';
import { LabelledInput } from '.';
import GlyphsetSelector from './GlyphsetSelector';
import Select from 'react-select';
import AceEditor from 'react-ace';
import { generatePhraseCode } from '../logic/shaderGenerateFigures';
import { groupArray } from './../logic/utils';

const FigureEditor = ({ inputs, setInputs }) => {
    const figure = useSelector(selectCurrentFigure);
    const glyphset = useSelector(state => state.glyphset.current);
    const dispatch = useDispatch();
    const editorRef = React.useRef();

    React.useEffect(() => {
        if (figure && !figure.shaderFunc) {
            dispatch(updateFigure({
                shaderFunc: shaderFuncTemplate[0].template.replace('__TEMPLATE__', 'fig' + figure.id)
            }));
        }
    }, [figure, dispatch]);

    React.useEffect(() => {
        if (!figure || figure.shaderFunc === inputs.shaderFunc) {
            return;
        }
        const debounce = setTimeout(() => {
            dispatch(updateFigure({ shaderFunc: inputs.shaderFunc }))
        }, 500);
        return () => clearTimeout(debounce);
    }, [figure, inputs.shaderFunc, dispatch]);

    const phraseCode = React.useMemo(() => generatePhraseCode(figure, glyphset), [figure, glyphset]);

    return figure && <>
        <Header as='h5' attached='top'>
            Figure: {figure.shaderFunc ? getShaderFuncName(figure.shaderFunc) : `figure${figure.id}`}
            <span style={{float: 'right'}}>
                <LabelledInput
                    type = "checkbox"
                    label = "active"
                    checked = {figure.active}
                    name = "activeCheckBox"
                    onChange = {event => dispatch(updateFigure({ active: event.target.checked }))}
                />
            </span>
        </Header>
        <Segment attached>
            <div
                style = {{
                    display: 'flex',
                    flexDirection: 'column',
                    width: 440,
                }}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <LabelledInput
                            type = "checkbox"
                            label = "Render placeholder"
                            name = "placeholderCheckBox"
                            checked = {!!figure && figure.placeholder}
                            disabled = {!figure}
                            onChange = {event => dispatch(updateFigure({ placeholder: event.target.checked }))}
                            style = {{width: 30}}
                        />
                        <Select
                            placeholder = "Create from template"
                            value = ""
                            options = {shaderFuncTemplate.map(it => ({
                                label: it.name,
                                value: it,
                            }))}
                            onChange = {option => {
                                const ok = window.confirm(`Overwrite shaderFunc from template '${option.label}'?\nOld shaderFunc will be copied to clipboard.`);
                                if (ok) {
                                    editorRef.current.editor.selectAll();
                                    editorRef.current.editor.focus();
                                    document.execCommand('copy');
                                    dispatch(updateFigure({
                                        shaderFunc: option.value.template.replace('__TEMPLATE__', 'fig' + figure.id)
                                    }));
                                }
                            }}
                            styles = {{
                                input: styles => ({...styles, width: 130})
                            }}
                        />
                    </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                }}>
                    <LabelledInput
                        type = "checkbox"
                        label = "Phrase?"
                        name = "phraseCheckbox"
                        checked = {!!figure && figure.type === PHRASE}
                        disabled = {!figure}
                        onChange = {event => dispatch(updateFigure({ type: event.target.checked ? PHRASE : null }))}
                        style = {{width: 30}}
                    />
                    <LabelledInput
                        name="ichars"
                        label=""
                        placeholder="Enter phrase..."
                        type="text"
                        value={(figure && figure.chars) || ''}
                        onChange={event => dispatch(updateFigure({ chars: event.target.value }))}
                        disabled={figure.type !== PHRASE}
                        style={{
                            width: 170,
                            fontSize: '1.2rem',
                            marginLeft: 20,
                            marginRight: 10,
                            backgroundColor: figure.type !== PHRASE ? 'lightgrey' : undefined
                        }}
                    />
                    <GlyphsetSelector
                        disabled = {figure.type !== PHRASE}
                        style = {{
                            width: 80
                        }}
                    />
                </div>
                <AceEditor
                    ref = {editorRef}
                    mode = "glsl"
                    theme = "github"
                    name = "shaderFuncEditor"
                    fontSize = {11}
                    style = {{
                        width: '100%',
                        height: 120,
                        backgroundColor: figure.type === PHRASE ? '#ddd' : undefined,
                    }}
                    value = {figure.type === PHRASE ? phraseCode : inputs.shaderFunc}
                    placeholder={"No shader function defines. Use 'Create from template' to start :)"}
                    onChange={value =>
                        setInputs({shaderFunc: value})
                    }
                    readOnly = {figure.type === PHRASE}
                    tabSize = {2}
                />
            </div>
            <SubjectTable
                figure = {figure}
            />
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
};

export const getSubjects = (figure) => {
    if (figure.type === PHRASE) {
        return ['border', 'spacing', 'sharp'];
    }
    const found = figure.shaderFunc.match(/(?<=\().*(?=\))/i);
    if (!found || figure.placeholder) {
        return [];
    }
    const argSubjects = found[0]
        .trim()
        .split(',')
        .map(it => it.split(' ').slice(-1)[0])
        .filter(it => !["col", "coord", "alpha"].includes(it));
    return argSubjects;
};

export const getAllSubjects = (figure) => {
    return [...defaultSubjects, ...getSubjects(figure)];
};

const shaderFuncTemplate = [
    {
        name: 'square',
        template: `void __TEMPLATE__ (inout vec3 col, vec2 coord, float alpha, float blur) {
  float n = max(abs(coord.x), abs(coord.y));
  col *= vec3(smoothstep(0.5, 0.5+blur+1.e-4, n));
}`
    }, {
        name: 'circle',
        template: `void __TEMPLATE__ (inout vec3 col, vec2 coord, float alpha, float blur) {
  float n = dot(coord,coord);
  col *= vec3(smoothstep(0.5, 0.5+blur+1.e-4, n));
}`
    }, {
        name: 'spinner',
        template: `void __TEMPLATE__ (inout vec3 col, vec2 coord, float alpha) {
  float r = length(coord)*2.0;
  float a = atan(coord.y,coord.x);
  float f = cos(a*3.);
  col *= 1. - vec3( 1.-smoothstep(f,f+0.02,r) );
}`
    },
];

const mapSubjectValue = (figure, subject) => {
    if (!figure || !(subject in figure)) {
        return 0;
    }
    if (subject === "phi") {
        return .1 * Math.round(1800 / Math.PI * figure[subject])
    }
    return figure[subject];
};

const SubjectTable = ({figure}) => {
    const dispatch = useDispatch();

    const subjectRows = React.useMemo(() => groupArray(getAllSubjects(figure), 3), [figure]);

    const dispatchSubjectUpdate = React.useCallback(subject => event => {
        let scale = 1.;
        if (subject === "phi") {
            scale = Math.PI / 180;
        }
        dispatch(updateFigure({[subject]: +event.target.value * scale}));
    }, [dispatch]);

    return <Table compact>
            <Table.Body>
            {

                subjectRows.map((row, key) =>
                    <Table.Row
                        key = {key}
                    >
                    {
                        row.map((subject, key) =>
                        <React.Fragment key = {key}>
                            <Table.Cell collapsing>
                                <label>
                                    {subject}:
                                </label>
                            </Table.Cell>
                            <Table.Cell>
                                <input
                                    type = "number"
                                    step = {subject === "phi" ? 1 : .01}
                                    value = {mapSubjectValue(figure, subject)}
                                    onChange = {dispatchSubjectUpdate(subject)}
                                    disabled = {!figure}
                                    style = {{width: 60}}
                                />
                            </Table.Cell>
                        </React.Fragment>
                        )
                    }
                    </Table.Row>
                )
            }
            </Table.Body>
        </Table>;
}