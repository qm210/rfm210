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

const ParamEditor = () => {
    const scene = useSelector(store => store.scene.current);
    const params = sceneParamList(scene);

    console.log("P", params);
    if (params.length === 0) {
        return null;
    }

    const handles = Array(3).map((_, index) => newHandle(index, index * 20, 0));

    return params.map((param, index) =>
        <Segment key={index}>
            <div
                style = {{
                    position: 'relative'
                }}
                >
                {param}
            </div>
            <ParamCanvas
                param = {param}
                >
                {
                    handles.map((handle, index) =>
                        <DragCircle
                            key = {index}
                            handle = {handle}
                        />
                    )
                }
            </ParamCanvas>
        </Segment>
    );
};

export default ParamEditor;

const nodeRadius = 10;

const ParamCanvas = ({param}) => {
    const canvasRef = React.useRef();

    React.useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        /*
            ctx.beginPath();
            ctx.arc(100, 75, nodeRadius, 0, 2 * Math.PI);
            ctx.stroke();
        */
    }, []);

    return <canvas ref={canvasRef} width="300" height="150"/>;
}

const Circle = styled.div`
    width: ${nodeRadius * 2};
    height: ${nodeRadius * 2};
    border-radius: ${nodeRadius};
    border: 2px solid black;
    background-color: silver;
    position: absolute;
    left: ${props => props.x};
    top: ${props => props.y};
`;

const DragCircle = ({handle}) => {

    return <Circle
        x = {handle.x}
        y = {handle.y}
    />
};