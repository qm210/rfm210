import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ShadertoyReact from 'shadertoy-react';
import { ShaderFrame } from '.';
import { shadertoyify } from '../logic/shader';
import { CodeFrame } from '.';
import { selectFigureList } from '../slices/sceneSlice';
import { fetchGlyphset } from '../slices/glyphsetSlice';
import { fetchLetterMap } from '../slices/glyphSlice';
import { Loader, Segment } from 'semantic-ui-react';
import generateShader from '../logic/generateShader';

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
    const reqRef = useRef();
    const prevTime = useRef();

    const animate = React.useCallback(time => {
        if (prevTime.current !== undefined) {
            const deltaTime = time - prevTime.current;
            setTime(sec => (sec + 1e-3 * deltaTime) % scene.duration);
        }
        prevTime.current = time;
        reqRef.current = requestAnimationFrame(animate);
    }, [scene.duration]);

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
        console.log("SHADERCODE CHANGED")
        if (isRefreshed.current !== shaderCode) {
            isRefreshed.current = shaderCode;
        }
    }, [shaderCode]);

    return <div
        style = {{
            position: 'absolute',
            top: 64,
            right: 20,
        }}>
        <Segment attached>
            <Loader active={loader} size="massive"/>
            <ShaderFrame
                style = {{
                    width: sceneWidth,
                    height: sceneHeight,
                }}
                >
                <b>This is the AWESOME part!</b><br/>
                {
                    isRefreshed.current === shaderCode &&
                    <ShadertoyReact
                        fs = {shadertoyify(shaderCode)}
                        uniforms = {{
                            time: {type: '1f', value: time}
                        }}
                    />
                }
            </ShaderFrame>
        </Segment>
        <Segment>
            <CodeFrame>
                {shadertoyify(shaderCode)}
            </CodeFrame>
        </Segment>
    </div>;
};

export default SceneShaderView;