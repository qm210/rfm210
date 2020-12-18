import React from 'react';
import { useSelector } from 'react-redux';
import { Segment } from 'semantic-ui-react';
import styled from 'styled-components';

const sceneParamList = scene => scene ? (scene.params || '').split('\n').filter(it => it !== '') : [];

const newHandle = (index, x,y) => ({
    index,
    x,
    y,
});

const nodeRadius = 6;
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
                offsetX: action.payload.dragX - state.startX,
                offsetY: action.payload.dragY - state.startY,
            };

        default:
            return state;
    }
};

const ParamEditor = () => {
    const scene = useSelector(store => store.scene.current);
    const params = sceneParamList(scene);
    const [dragState, dragDispatch] = React.useReducer(dragReducer, initDragState);

    const [handles, setHandles] = React.useState(
        Array(3).fill().map((_, index) => newHandle(index, index * 50, 0))
    );

    if (params.length === 0) {
        return null;
    }

    const onDragStart = handle => event => {
        if (dragState.dragging) {
            return;
        }
        event.persist();
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
        setHandles(state => state.map(handle =>
            handle.index === dragState.dragIndex
                ? {
                    ...handle,
                    x: dragState.original.x + drag.x,
                    y: dragState.original.y - drag.y,
                }
                : handle
        ));
        dragDispatch({type: DRAG.UPDATE, payload: drag});
    };

    const onDragEnd = event => {
        if (!dragState.dragging) {
            return;
        }
        if (event.type === 'mouseleave') {
            setHandles(state => state.map(handle =>
                handle.index === dragState.dragIndex
                    ? {
                        ...handle,
                        x: dragState.original.x,
                        y: dragState.original.y,
                    }
                    : handle
            ));
        }
        dragDispatch({type: DRAG.END});
    };

    const onDragCancel = event => {
        console.log("EVENT", event, event.type, event.name)
        if (!dragState.dragging) {
            return;
        }
        dragDispatch({type: DRAG.CANCEL});
    }

    console.log(dragState);
    return params.map((param, index) =>
        <React.Fragment key={index}>
            <Segment>
                {param}
                <div
                    onMouseUp = {onDragEnd}
                    onMouseLeave = {onDragEnd}
                    onMouseMove = {onDragUpdate}
                    style = {{
                        position: 'relative'
                    }}
                    >
                    {
                        handles.map((handle) =>
                            <DragCircle
                                key = {handle.index}
                                handle = {handle}
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
            <DebugSegment obj={dragState}/>
        </React.Fragment>
    );
};

export default ParamEditor;

const DebugSegment = ({obj}) =>
    <Segment style={{display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
    {
        Object.entries(obj).map(([key, val]) =>
            <React.Fragment key={key}>
                <div>{key}:</div>
                <div>{val !== null ? val.toString() : "null"}</div>
            </React.Fragment>
        )
    }
    </Segment>;

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
        width = {300}
        height = {canvasHeight}
        style = {{
            border: '1px solid black',
            borderRadius: 3,
        }}
    />;
}

const Circle = styled.div`
    width: ${nodeRadius * 2 * scaling}px;
    height: ${nodeRadius * 2 * scaling}px;
    border-radius: ${nodeRadius * scaling}px;
    border: ${2 * scaling}px solid black;
    box-sizing: border-box;
    background-color: silver;
    position: absolute;
    left: ${props => (props.x - nodeRadius) * scaling}px;
    bottom: ${props => (props.y - nodeRadius) * scaling}px;
    transform: translate(-50%, -50%);
    margin-left: 10px;
    cursor: move;
`;

const DragCircle = ({handle, onDragStart, onDragUpdate}) => {

    return <Circle
        x = {handle.x}
        y = {handle.y}
        onMouseDown = {onDragStart}
        onMouseMove = {onDragUpdate}
    />
};