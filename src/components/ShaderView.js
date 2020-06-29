import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import {Shaders, Node, GLSL} from 'gl-react';
import {Surface} from 'gl-react-dom';
import RectAlgebra from '../RectAlgebra';

const mapStateToProps = (state) => ({
    pixels: state.Pixel.pixels
});

const mapDispatchToProps = (dispatch) => ({
})

const ShaderFrame = styled.div`
    display: flex;
    flex-direction: column;
    alignItems: left;
    margin: 10px;
    padding: 10px;
    border: 1px solid #888;
`;

const ShaderView = ({pixels}) => {
    const [millis, setMillis] = React.useState(0);
    const reqRef = React.useRef();
    const prevReqRef = React.useRef();

    const animate = React.useCallback(time => {
        if (prevReqRef.current !== undefined) {
            const deltaTime = time - prevReqRef.current;
            setMillis(ms => ms + deltaTime);
        }
        prevReqRef.current = time;
        prevReqRef.current = requestAnimationFrame(animate);
    }, []);

    React.useEffect(() => {
        reqRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(reqRef.current);
      }, [animate]);

    const everyRect = RectAlgebra.getEverythingYouNeedAsRects(pixels);

    const terrifyingCode = everyRect.map(rect =>
        `rect(UV, vec4(${rect.x},${rect.y},${rect.width},${rect.height}), vec2(0), phi, 1., coltemp);`
    ).join('');

    const shaders = Shaders.create({
        example: {
        frag: GLSL`
            precision highp float;
            varying vec2 uv;
            uniform float blue;
            uniform float time;
            void main() {
                gl_FragColor = vec4(.5 + .5 * uv.x * cos(.11*time), .5 + .5 * uv.y * sin(.3*time), blue, 1.0);
            }
        `
        },
        nr4template: {
            frag: GLSL`
            precision highp float;
            varying vec2 uv;
            uniform float time;
            const vec3 c = vec3(1.,0.,-1.);
            const vec2 iResolution = vec2(300, 300); // qm hacked this

            void dbox(in vec2 x, in vec2 b, out float d)
            {
                vec2 da = abs(x)-b;
                d = length(max(da,c.yy)) + min(max(da.x,da.y),0.0);
            }

            void rot(in float phi, out mat2 m)
            {
                vec2 cs = vec2(cos(phi), sin(phi));
                m = mat2(cs.x, -cs.y, cs.y, cs.x);
            }
            float sm(in float d)
            {
                return smoothstep(1.5/iResolution.y, -1.5/iResolution.y, d);
            }
            #define PIXEL .01
            void pixel(in vec2 uv, in vec2 pixel, in vec2 shift, in float phi, in float scale, inout vec3 col)
            {
                float d;
                mat2 R;
                rot(phi, R);
                R /= max(1.e-3, scale);
                dbox(R*uv + PIXEL*(vec2(-1.,1.) + R*vec2(-2.*shift.x,2.*shift.y) + vec2(-2.*pixel.x, 2.*pixel.y)), vec2(1.,1.)*PIXEL, d);
                col = mix(col, c.yyy, sm(d));
            }
            void rect(in vec2 uv, in vec4 rect, in vec2 shift, in float phi, in float scale, inout vec3 col)
            {
                float d;
                mat2 R;
                rot(phi, R);
                R /= max(1.e-3, scale);
                dbox(R*uv + PIXEL*(vec2(-rect.z,rect.w) + R*vec2(-2.*shift.x,2.*shift.y) + vec2(-2.*rect.x, 2.*rect.y)), vec2(rect.z,rect.w)*PIXEL, d);
                col = mix(col, c.yyy, sm(d));
            }

    //        void mainImage( out vec4 fragColor, in vec2 fragCoord ) // qm hack
            void main()
            {
                // vec2 uv = (fragCoord.xy-.5*iResolution.xy)/iResolution.y; // qm hack
                vec2 UV = vec2(uv.x - .5, uv.y - .5); // qm hack
                vec3 coltemp = c.xxx;
                float phi = 10.*time;
                ${terrifyingCode}

                vec3 col = c.xxx;
                col = mix(col, coltemp, 1.); // for alpha...

                gl_FragColor = vec4(clamp(col,0.,1.),1.0); // qm hack fragColor -> gl_FragColor
            }
            `
        }
    });

    return <ShaderFrame>
        <b>This is the AWESOME part!</b><br/>
        <Surface width={300} height={300}>
            <Node shader={shaders.nr4template} uniforms={{time: millis/1000}}/>
        </Surface>
    </ShaderFrame>;
};

export default connect(mapStateToProps, mapDispatchToProps)(ShaderView);
