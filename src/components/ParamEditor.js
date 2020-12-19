import React from 'react';
import { useSelector } from 'react-redux';
import { Segment } from 'semantic-ui-react';
import styled from 'styled-components';

const sceneParamList = scene => scene ? (scene.params || '').split('\n').filter(it => it !== '') : [];

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
    CANCEL: 'drag/cancel',
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

const ParamEditor = () => {
    const scene = useSelector(store => store.scene.current);
    const params = sceneParamList(scene);
    const [dragState, dragDispatch] = React.useReducer(dragReducer, initDragState);

    const handleNumber = 3;
    const [handles, setHandles] = React.useState(
        Array(handleNumber).fill().map((_, index) => ({
            index,
            x: index * .5 * canvasWidth,
            y: 0,
            fixed: index === 0 || index === handleNumber - 1,
        }))
    );
    const [selectedHandleIndex, setSelectedHandleIndex] = React.useState(0);

    if (params.length === 0) {
        return null;
    }

    const onDragStart = handle => event => {
        if (dragState.dragging) {
            return;
        }
        setSelectedHandleIndex(handle.index);
        if (handle.fixed) {
            return;
        }
        event.persist();
        if (event.button !== 0) {
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
        const {x,y} = {
            x: dragState.original.x + drag.x,
            y: dragState.original.y - drag.y,
        };
        const dragIndex = mightSwitchIndex(handles, x, dragState.dragIndex);
        if (dragIndex === null) {
            dragDispatch({type: DRAG.END});
            return;
        }
        setHandles(state => state.map(handle =>
            handle.index === dragState.dragIndex
                ? {
                    ...handle,
                    x,
                    y,
                }
                : handle
        ));
        dragDispatch({type: DRAG.UPDATE, payload: {drag, dragIndex}});
    };

    const mightSwitchIndex = (handles, x, dragIndex) => {
        if (dragIndex > 0) {
            if (x < handles[dragIndex - 1].x) {
                if (handles[dragIndex - 1].fixed) {
                    return null;
                }
                return dragIndex - 1;
            }
        }
        if (dragIndex < handles.length - 1) {
            if (x > handles[dragIndex + 1].x) {
                if (handles[dragIndex + 1].fixed) {
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

    return params.map((param, index) =>
        <React.Fragment key={index}>
            <Segment>
                {param}
                <div
                    onMouseUp = {onDragEnd}
                    onMouseLeave = {onDragCancel}
                    onMouseMove = {onDragUpdate}
                    onContextMenu = {event => event.preventDefault()}
                    style = {{
                        position: 'relative'
                    }}
                    >
                    {
                        handles.map((handle) =>
                            <DragCircle
                                key = {handle.index}
                                handle = {handle}
                                selected = {selectedHandleIndex === handle.index}
                                onDragStart = {onDragStart(handle)}
                            />
                        )
                    }
                <ParamCanvas
                    param = {param}
                    handles = {handles}
                    />
                </div>
            </Segment>
        </React.Fragment>
    );
};

export default ParamEditor;

const ParamCanvas = ({param, handles}) => {
    const canvasRef = React.useRef();

    React.useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasHeight);

        if (handles.length === 0) {
            return;
        }
        ctx.beginPath();
        ctx.lineWidth = 3;
        handles.forEach((handle, index) => {
            const y = canvasHeight - handle.y - 1;
            if (index === 0) {
                ctx.moveTo(handle.x, y);
            }
            else {
                ctx.lineTo(handle.x, y);
            }
        })
        ctx.stroke();
    }, [handles]);

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
        bottom: (props.handle.y - nodeRadius) * scaling,
        backgroundColor: props.selected ? '#afd' : 'silver',
        cursor: props.handle.fixed ? 'pointer' : 'move',
    }}))`
    width: ${nodeRadius * 2 * scaling}px;
    height: ${nodeRadius * 2 * scaling}px;
    border-radius: ${nodeRadius * scaling}px;
    border: ${2 * scaling}px solid black;
    box-sizing: border-box;
    position: absolute;
    transform: translate(-50%, -50%);
`;

const DragCircle = ({handle, selected, onDragStart, onDragUpdate}) => {
    return <Circle
        handle = {handle}
        selected = {selected}
        onMouseDown = {onDragStart}
        onMouseMove = {onDragUpdate}
    />
};