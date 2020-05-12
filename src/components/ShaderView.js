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

    React.useEffect(() => {
        const timer = setInterval(() => {
            setMillis(millis => millis + 10);
        }, 10);
        return () => clearTimeout(timer);
      }, [millis, setMillis]);

    const everyRect = RectAlgebra.getEverythingYouNeedAsRects(pixels);

    const PIXELSIZE = .01;
    const terrifyingCode = everyRect.map(rect =>
            `dbox(UV + sin(.3*time)*vec2(${rect.fromColumn*PIXELSIZE},${rect.fromRow*PIXELSIZE}), vec2(${rect.width*PIXELSIZE},${rect.height*PIXELSIZE}), d);
            col = mix(col, c.yyy, sm(d));`).join('');

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

            float sm(in float d)
            {
                return smoothstep(1.5/iResolution.y, -1.5/iResolution.y, d);
            }

    //        void mainImage( out vec4 fragColor, in vec2 fragCoord ) // qm hack
            void main()
            {
                // vec2 uv = (fragCoord.xy-.5*iResolution.xy)/iResolution.y; // qm hack
                vec2 UV = vec2(uv.x - .5, uv.y - .5); // qm hack
                vec3 col = c.xxx;
                float d;
                //dbox(UV, vec2(.1,.2), d); col = mix(col, c.yyy, sm(d));
                //dbox(UV, vec2(.05,1.), d); col = mix(col, c.yyy, sm(d));
                ${terrifyingCode}

                gl_FragColor = vec4(clamp(col,0.,1.),1.0); // qm hack fragColor -> gl_FragColor
            }
            `
        }
    });

    return <ShaderFrame>
        <b>This is the AWESOME part!</b><br/>
        <Surface width={300} height={300}>
            <Node shader={shaders.nr4template} uniforms={{time: millis}}/>
        </Surface>
    </ShaderFrame>;
};

export default connect(mapStateToProps, mapDispatchToProps)(ShaderView);
