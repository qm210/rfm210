import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ShadertoyReact from 'shadertoy-react';
import { ShaderFrame } from '.';
import { shadertoyify } from '../logic/shader';
import { CodeFrame } from '.';
import { selectFigureList, updateScene, updateFigureBy } from '../slices/sceneSlice';
import { fetchGlyphset } from '../slices/glyphsetSlice';
import { fetchLetterMap } from '../slices/glyphSlice';
import { Loader, Segment } from 'semantic-ui-react';
import generateShader from '../logic/generateShader';
import useShaderDrag from './useShaderDrag';

const sceneWidth = 640;
const sceneHeight = 320;

const SceneShaderView = ()  => {
    const scene = useSelector(store => store.scene.current);
    const figureList = useSelector(selectFigureList);
    const glyphset = useSelector(store => store.glyphset);
    const dispatch = useDispatch();
    const [loader, setLoader] = useState(!glyphset.current);
    const isRefreshed = useRef('');

    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(true);
    const reqRef = useRef();
    const prevTime = useRef();

    const shaderDrag = useShaderDrag({
        onDragX: deltaX => dispatch(updateFigureBy({x: 2 * deltaX / sceneWidth})),
        onDragY: deltaY => dispatch(updateFigureBy({y: -deltaY / sceneHeight})),
    });

    const animate = React.useCallback(time => {
        if (running && prevTime.current !== undefined) {
            const deltaTime = time - prevTime.current;
            setTime(sec => (sec + 1e-3 * deltaTime) % scene.duration);
        }
        prevTime.current = time;
        reqRef.current = requestAnimationFrame(animate);
    }, [running, scene.duration]);

    React.useEffect(() => {
        reqRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(reqRef.current);
      }, [animate]);

    useEffect(() => {
        if (glyphset.current) {
            return;
        }
        setLoader(true);
        dispatch(fetchGlyphset())
            .then(({firstGlyphset}) =>
                dispatch(fetchLetterMap(firstGlyphset)))
            .then(() =>
                setLoader(false)
            )
            .catch(error => console.warn("IN LOADING LETTER MAP:", error));
    }, [glyphset, dispatch, setLoader])

    const shaderCode = React.useMemo(() =>
        generateShader(sceneWidth, sceneHeight, scene, figureList)
    , [scene, figureList]);

    useEffect(() => {
        if (isRefreshed.current !== shaderCode) {
            isRefreshed.current = shaderCode;
        }
    }, [shaderCode]);

    return <div
        style = {{
            position: 'absolute',
            top: 50,
            right: 10,
        }}>
        <Segment attached>
            <Loader active={loader || isRefreshed.current !== shaderCode} size="massive"/>
            <ShaderFrame
                style = {{
                    width: sceneWidth,
                    height: sceneHeight,
                }}
                onMouseDown = {event => shaderDrag.start(event.clientX, event.clientY)}
                onMouseMove = {event => shaderDrag.update(event.clientX, event.clientY)}
                onMouseUp = {() => shaderDrag.end()}
                onMouseLeave = {() => shaderDrag.cancel()}
                >
                <b>This is the AWESOME part!</b><br/>
                {
                    isRefreshed.current === shaderCode &&
                    <ShadertoyReact
                        fs = {shadertoyify(shaderCode)}
                        uniforms = {{
                            time: {type: '1f', value: time}
                        }}
                        style = {{
                            cursor: 'move',
                        }}
                    />
                }
            </ShaderFrame>
            <TransportBar
                time = {time}
                duration = {scene.duration}
                setTime = {setTime}
                running = {running}
                setRunning = {setRunning}
            />
        </Segment>

        <Segment>
            <CodeFrame>
                {shadertoyify(shaderCode)}
            </CodeFrame>
        </Segment>
    </div>;
};

export default SceneShaderView;

const TransportBar = ({duration, time, setTime, setRunning, running}) => {
    const dispatch = useDispatch();
    return <div>
        <input
            type = "range"
            style = {{
                width: '100%',
                cursor: 'pointer',
            }}
            min = {0}
            max = {duration}
            step = {0.001}
            value = {time}
            onDoubleClick = {() => setRunning(true)}
            onChange = {event => {
                setTime(+event.target.value);
                setRunning(false);
            }}
        />
        <div style = {{
            display: 'flex'
        }}>
        <span style={{flex: 1}}>
            {time.toFixed(3)} -- drag handle to pause, doubeclick to play
        </span>
        <input
            type = "number"
            min = {0}
            step = {0.1}
            value = {duration}
            onChange = {event => dispatch(updateScene({duration: +event.target.value}))}
            style = {{
                width: 75,
                textAlign: 'right',
                marginRight: 3,
                paddingRight: 2,
                direction: 'rtl',
            }}
        />
        sec total
        </div>
    </div>;
};
