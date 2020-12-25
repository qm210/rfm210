import React from 'react';

const initState = {
    dragging: false,
    startX: null,
    offsetX: null,
    startY: null,
    offsetY: null
};

const useShaderDrag = ({onDragX, onDragY, onCancel}) => {
    const [state, setState] = React.useState(initState);

    const start = (x, y) => {
        if (state.dragging) {
            return;
        }
        setState({
            dragging: true,
            startX: x,
            startY: y,
            offsetX: 0,
            offsetY: 0,
        });
    };

    const update = (x, y) => {
        if (!state.dragging) {
            return;
        }
        const delta = {
            x: x - state.startX,
            y: y - state.startY,
        };
        onDragX(delta.x);
        onDragY(delta.y);
        setState(state => ({
            ...state,
            startX: x,
            startY: y,
            offsetX: state.offsetX + delta.x,
            offsetY: state.offsetY + delta.y
        }));
    };

    const end = (x, y) => {
        if (!state.dragging) {
            return;
        }
        setState(initState);
    };

    const cancel = () => {
        if (!state.dragging) {
            return;
        }
        onDragX(-state.offsetX);
        onDragY(-state.offsetY);
        setState(initState);
    };

    return {
        start,
        update,
        end,
        cancel
    };
};

export default useShaderDrag;