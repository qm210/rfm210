import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Segment, Form } from 'semantic-ui-react';
import styled from 'styled-components';
import produce from 'immer';
import { updateScene, updateParam, deleteParam } from '../slices/sceneSlice';
import { objectWithout, clamp } from '../logic/utils';
import { saneGlslDelimiter } from '../logic/shaderHelpers';

export const dumpParams = (params) => {
    if (typeof(params) === "string") {
        return params;
    }
    return params.map(param => {
        const points = param.points.map(point => '(' + [point.x, point.y].join(',') + ')').join(' ');
        return `void ${param.name}(in float t, out float p): ${points}`
    }).join('\n');
}

const ParamEditors = () => {
    const scene = useSelector(store => store.scene.current);
    const params = scene.params;
    const dumpedParams = React.useRef();
    const dispatch = useDispatch();

    React.useEffect(() => {
        const dump = dumpParams(params);
        if (dump !== dumpedParams.current) {
            dispatch(updateScene({params}));
            dumpedParams.current = dump;
        }
    }, [params, dispatch]);

    if (typeof(params) === "string") {
        dispatch(updateScene({params: []}));
        return null;
    }

    return params.map((param, index) =>
        <ParamEditor param={param} key={index}/>
    );
};

export default ParamEditors;

const nodeRadius = 6;
const canvasWidth = 300;
const canvasHeight = 150;
const scaling = 1;

const initDragState = {
    dragging: false,
    dragIndex: null,
    startX: null,
    offsetX: null,
    startY: null,
    offsetY: null,
    original: {},
}

const DRAG = Object.freeze({
    START: 'drag/start',
    END: 'drag/end',
    UPDATE: 'drag/update',
});

const MOUSE = Object.freeze({
    LEFT: 0,
    RIGHT: 2,
});

const dragReducer = (state, action) => {
    switch(action.type) {
        case DRAG.START:
            return {
                ...state,
                dragging: true,
                dragIndex: action.payload.handle.index,
                original: {...action.payload.handle},
                startX: action.payload.startX,
                startY: action.payload.startY,
                offsetX: 0,
                offsetY: 0,
            };

        case DRAG.END:
            return initDragState;

        case DRAG.UPDATE:
            return {
                ...state,
                offsetX: action.payload.drag.x - state.startX,
                offsetY: action.payload.drag.x - state.startY,
                dragIndex: action.payload.dragIndex === undefined ? state.dragIndex : action.payload.dragIndex,
            };

        default:
            return state;
    }
};

const compare = (obj1, obj2) => {
  const type1 = typeof(obj1);
  const type2 = typeof(obj2);
  if (type1 !== type2) {
      return false;
  }
  if (type1 === "object") {
      return Object.keys(obj1).length === Object.keys(obj2).length &&
      Object.keys(obj1).every(key => compare(obj1[key], obj2[key]));
  }
  return obj1 === obj2;
};

const ParamEditor = ({param}) => {
    const canvasRef = React.useRef();
    const [dragState, dragDispatch] = React.useReducer(dragReducer, initDragState);
    const dispatch = useDispatch();
    const changedHandles = React.useRef();
    const debounce = React.useRef();

    const [handles, setHandles] = React.useState(
        param.points.map((point, index) => ({
            index,
            x: point.x * canvasWidth,
            y: .5 * point.y * canvasHeight,
            fixedX: index === 0 || index === param.points.length - 1,
        }))
    );
    const [selectedHandleIndex, setSelectedHandleIndex] = React.useState(0);

    React.useEffect(() => {
        if (compare(changedHandles.current, handles)) {
            return;
        }
        if (debounce.current) {
            clearTimeout(debounce.current);
        }
        debounce.current = setTimeout(() => {
            dispatch(updateParam({
                name: param.name,
                points: handles.map(handle => ({
                    x: +(handle.x / canvasWidth).toFixed(2),
                    y: +(2 * handle.y / canvasHeight).toFixed(2),
                }))
            }));
            debounce.current = null;
            changedHandles.current = handles;
        }, 500);
    }, [param, handles, dispatch]);

    const onDragStart = handle => event => {
        if (dragState.dragging) {
            return;
        }
        event.persist();
        setSelectedHandleIndex(handle.index);
        if (event.button === MOUSE.RIGHT) {
            setHandles(produce(draft => {
                draft[handle.index].y = 0;
            }))
            return;
        }
        if (event.button !== MOUSE.LEFT) {
            return;
        }
        dragDispatch({type: DRAG.START, payload: {
            handle,
            startX: event.clientX,
            startY: event.clientY,
        }});
    };

    const onDragUpdate = event => {
        if (!dragState.dragging) {
            return;
        }
        event.persist();
        const drag = {
            x: event.clientX - dragState.startX,
            y: event.clientY - dragState.startY,
        };
        if (handles[dragState.dragIndex].fixedX) {
            drag.x = 0;
        }
        const {x,y} = {
            x: dragState.original.x + drag.x,
            y: dragState.original.y - drag.y,
        };
        const dragIndex = mightSwitchIndex(handles, x, dragState.dragIndex);
        if (dragIndex === null) {
            dragDispatch({type: DRAG.END});
            return;
        }
        setHandles(produce(draft => {
            draft[dragState.dragIndex].x = x;
            draft[dragState.dragIndex].y = clamp(y, -canvasHeight/2, canvasHeight/2);
        }))
        dragDispatch({type: DRAG.UPDATE, payload: {drag, dragIndex}});
    };

    const mightSwitchIndex = (handles, x, dragIndex) => {
        if (dragIndex > 0) {
            if (x < handles[dragIndex - 1].x) {
                if (handles[dragIndex - 1].fixedX) {
                    return null;
                }
                return dragIndex - 1;
            }
        }
        if (dragIndex < handles.length - 1) {
            if (x > handles[dragIndex + 1].x) {
                if (handles[dragIndex + 1].fixedX) {
                    return null;
                }
                return dragIndex + 1;
            }
        }
        return dragIndex;
    }

    const onDragEnd = () => {
        if (!dragState.dragging) {
            return;
        }
        dragDispatch({type: DRAG.END});
    };

    const onDragCancel = () => {
        if (!dragState.dragging) {
            return;
        }
        setHandles(state => state.map(handle =>
            handle.index === dragState.dragIndex
                ? {
                    ...handle,
                    x: dragState.original.x,
                    y: dragState.original.y,
                }
                : handle
        ));
        dragDispatch({type: DRAG.END});
    };

    const onDoubleClick = handle => event => {
        event.stopPropagation();
        if (handle) {
            deleteHandle(handle);
            return;
        }
        event.persist();
        addHandle(event.clientX, event.clientY);
    };

    const deleteHandle = handle => {
        if (handle.fixedX) {
            return;
        }
        setHandles(handlesAfterRemoving(handle));
        setSelectedHandleIndex(index => index > 0 ? index - 1 : 0);
    };

    const handlesAfterRemoving = handle =>
        state => state.filter(it => it.index !== handle.index)
            .map(produce(draft => {
                if (draft.index > handle.index) {
                    draft.index -= 1;
                }
            }));

    const addHandle = (x,y) => {
        const canvasOffset = canvasRef.current.getBoundingClientRect();
        x -= canvasOffset.left;
        y -= canvasOffset.top + .5 * canvasHeight;
        y *= -1;
        const index = handles.slice(0, -1).findIndex(it => (it.x < x) && handles[it.index + 1].x > x) + 1;
        setHandles(produce(draft => {
            draft.splice(index, 0, {
                index,
                x,
                y,
                fixedX: false
            });
            draft.forEach((handle, h) => handle.index = h);
        }));
    };

    return <Segment>
        <ParamEditorHeader param={param}/>
        <div
            onMouseUp = {onDragEnd}
            onMouseLeave = {onDragCancel}
            onMouseMove = {onDragUpdate}
            onDoubleClick = {onDoubleClick()}
            onContextMenu = {event => event.preventDefault()}
            style = {{
                position: 'relative'
            }}
            >
            {
                handles.map((handle) =>
                    <Circle
                        key = {handle.index}
                        handle = {handle}
                        selected = {selectedHandleIndex === handle.index}
                        onDoubleClick = {onDoubleClick(handle)}
                        onMouseDown = {onDragStart(handle)}
                    />
                )
            }
        <ParamCanvas
            canvasRef = {canvasRef}
            param = {param}
            handles = {handles}
            />
        </div>
        <ParamEditorExtended param={param}/>
    </Segment>;
};

const ParamCanvas = ({canvasRef, param, handles}) => {

    React.useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasHeight);

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(0, canvasHeight / 2);
        ctx.lineTo(canvasWidth, canvasHeight / 2);
        ctx.stroke();

        if (handles.length === 0) {
            return;
        }
        let current = {};
        let last = {};
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        handles.forEach((handle, index) => {
            current = {
                x: handle.x,
                y: .5 * canvasHeight - handle.y - 1,
            };
            if (index === 0) {
                ctx.moveTo(current.x, current.y);
                last = current;
            }
            else {
                // in case we want some tension functions, e.g. Math.pow() or its opposite
                let yFunc = y => y;
                if (param.tension > 0) {
                    yFunc = y => Math.pow(y, 1 + param.tension/4);
                }
                if (param.tension < 0) {
                    yFunc = y => 1 - Math.pow(1 - y, 1 - param.tension/4)
                }
                const split = 12;
                for(let i = 0; i < split; i++) {
                    const fract = (i+1)/split;
                    const nextX = last.x + (current.x - last.x) * fract;
                    const nextY = last.y + (current.y - last.y) * yFunc(fract);
                    ctx.lineTo(nextX, nextY);
                }
                last = current;
            }
        })
        ctx.stroke();
    }, [handles, canvasRef, param.tension]);

    return <canvas
        ref = {canvasRef}
        width = {canvasWidth}
        height = {canvasHeight}
        style = {{
            border: '1px solid black',
            borderRadius: 3,
        }}
    />;
}

const Circle = styled.div.attrs(props => ({
    style: {
        left: (props.handle.x) * scaling,
        bottom: (props.handle.y - nodeRadius) * scaling + canvasHeight / 2,
        backgroundColor: props.selected ? '#afd' : 'silver',
        cursor: props.handle.fixedX ? 'pointer' : 'move',
    }}))`
    width: ${nodeRadius * 2 * scaling}px;
    height: ${nodeRadius * 2 * scaling}px;
    border-radius: ${nodeRadius * scaling}px;
    border: ${2 * scaling}px solid black;
    box-sizing: border-box;
    position: absolute;
    transform: translate(-50%, -50%);
`;

const FlexLine = styled.div`
    display: flex;
    justify-content: space-between;
    margin: 10px 0;
    `;

const ParamNumberInput = (props) =>
    <Form.Group>
        <label>{props.label}</label>
        <input
            type = "number"
            style = {{width: 60}}
            value = {props.param[props.name] === undefined ? (props.default || 0) : props.param[props.name]}
            onChange = {event => props.dispatch(updateParam({
                name: props.param.name,
                [props.name]: +event.target.value
            }))}
            {...objectWithout(props, ["dispatch"])}
        />
    </Form.Group>;

const ParamEditorHeader = ({param}) => {
    const dispatch = useDispatch();

    return <FlexLine>
        <input
            value = {param.name}
            onChange = {event => dispatch(updateParam({name: param.name, rename: saneGlslDelimiter(event.target.value)}))}
            style = {{fontWeight: 'bold', width: 130, marginRight: 10}}
        />
        <div style={{flex: 1}}>
            <ParamNumberInput
                param = {param}
                label = "T/sec="
                name = "timeScale"
                dispatch = {dispatch}
                step = {.1}
                min = {0}
            />
        </div>
        <button
            onClick = {() => alert("right click if sure")}
            onContextMenu = {event => {
                event.preventDefault();
                dispatch(deleteParam(param.name));
            }}
        >
            delete
        </button>
    </FlexLine>
};

const ParamEditorExtended = ({param}) => {
    const dispatch = useDispatch();

    return <FlexLine>
        <ParamNumberInput
                param = {param}
                label = "tension="
                name = "tension"
                default = {0}
                dispatch = {dispatch}
                step = {1}
        />
    </FlexLine>
}