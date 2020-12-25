import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LabelledInput } from '.';
import {
    updateFigure,
    selectCurrentFigure,
    PHRASE, addFigureQmd, deleteFigureQmd, updateFigureQmd
} from '../slices/sceneSlice';
import { whenSubmitted } from '../logic/utils';
import { SYMBOL } from '../const';
import { Header, Segment, Table, Form } from 'semantic-ui-react';

const FigureEditor = ({ inputs, handleInput }) => {
    const scene = useSelector(store => store.scene.current);
    const figure = useSelector(selectCurrentFigure);
    const dispatch = useDispatch();

    const handleFigureUpdate = name =>
        event => dispatch(updateFigure({ [name]: event.target.value }));

    return <>
        <Header as='h5' attached='top'
            onDoubleClick={() => console.log("FIGURE", figure)}
        >
            Figure</Header>
        <Segment attached>
            <div>
                <LabelledInput
                    type="checkbox"
                    label="Phrase?"
                    checked={!!figure && figure.type === PHRASE}
                    disabled={!figure}
                    onChange={event => dispatch(updateFigure({ type: event.target.checked ? PHRASE : null }))} />
                <LabelledInput
                    type="checkbox"
                    label="Render placeholder"
                    checked={!!figure && figure.placeholder}
                    disabled={!figure}
                    onChange={event => dispatch(updateFigure({ placeholder: event.target.checked }))} />
            </div>
            <div>
                {(figure && figure.type === PHRASE &&
                    <LabelledInput
                        name="ichars"
                        label=""
                        placeholder="Enter phrase..."
                        type="text"
                        style={{ width: 300 }}
                        value={figure && figure.chars ? figure.chars : '<add phrase first>'}
                        onChange={event => dispatch(updateFigure({ chars: event.target.value }))}
                        disabled={!figure || figure.type !== PHRASE} />
                ) ||
                    <textarea
                        style={{ width: 310, height: 100, resize: 'none' }}
                        placeholder={'shaderFunc() {\n    ...\n}'}
                        value={inputs.shaderFunc}
                        name={'shaderFunc'}
                        onChange={handleInput}
                        onKeyDown={event => whenSubmitted(event, handleFigureUpdate('shaderFunc'))}
                        onBlur={handleFigureUpdate('shaderFunc')}
                        disabled={!scene} />}
            </div>
            <Form style={{ width: 300 }}>
                <Form.Group widths="3">
                    <Form.Input
                        label="X:"
                        type="number"
                        step={.01}
                        value={figure ? figure.x : 0}
                        onChange={(_, { value }) => dispatch(updateFigure({ x: +value }))}
                        disabled={!figure} />
                    <Form.Input
                        label="Y:"
                        type="number"
                        step={.01}
                        value={figure ? figure.y : 0}
                        onChange={(_, { value }) => dispatch(updateFigure({ y: +value }))}
                        disabled={!figure} />
                    <Form.Input
                        label="&#966;/°:"
                        type="number"
                        step={1}
                        value={figure ? .1 * Math.round(1800 / Math.PI * figure.phi) : 0}
                        onChange={(_, { value }) => dispatch(updateFigure({ phi: +value * Math.PI / 180 }))}
                        disabled={!figure} />
                </Form.Group>
                <Form.Group widths="3">
                    <Form.Input
                        label="scale"
                        type="number"
                        step={.01}
                        value={figure ? figure.scale : 1}
                        onChange={event => dispatch(updateFigure({ scale: +event.target.value }))}
                        disabled={!figure} />
                    <Form.Input
                        label="scaleX"
                        type="number"
                        step={.01}
                        value={figure ? figure.scaleX : 1}
                        onChange={event => dispatch(updateFigure({ scaleX: +event.target.value }))}
                        disabled={!figure} />
                    <Form.Input
                        label="scaleY"
                        type="number"
                        step={.01}
                        value={figure ? figure.scaleY : 1}
                        onChange={event => dispatch(updateFigure({ scaleY: +event.target.value }))}
                        disabled={!figure} />
                </Form.Group>
            </Form>
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
}

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