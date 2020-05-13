const vec3 c = vec3(1.,0.,-1.);

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
    return pow(smoothstep(1.5/iResolution.y, -1.5/iResolution.y, d),2.);
}
#define PIXEL 0.02
#define EMAT mat2(-2.,0.,0.,2.)
void pixmix(in vec2 uv, in vec2 v, in vec2 shift, in float phi, in float scale, in float alpha, inout vec3 col)
{
    float d;
    mat2 R;
    rot(phi, R);
    R /= max(1.e-3, scale);
	dbox(R*uv + (R*vec2(-1,1) + (R*EMAT*shift+EMAT*v))*PIXEL, vec2(1,1)*PIXEL, d);
    col = mix(col, c.yyy, alpha*sm(d));
}
void rect(in vec2 uv, in vec4 rect, in vec2 shift, in float phi, in float scale, in float alpha, inout vec3 col)
{
    float d;
    mat2 R;
    rot(phi, R);
    R /= max(1.e-3, scale);
	dbox(R*uv + PIXEL*(vec2(-rect.z,rect.w) + R*vec2(-2.*shift.x,2.*shift.y) + vec2(-2.*rect.x, 2.*rect.y)), vec2(rect.z,rect.w)*PIXEL, d);
    col = mix(col, c.yyy, alpha*sm(d));
}
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord.xy-.5*iResolution.xy)/iResolution.y;
    vec3 col = c.xxx;
    float d;
    vec2 d_shift = vec2(-7,1.+sin(4.*iTime));//vec2(0.,1.*sin(iTime));
    float phi = .7;
    float scale = 1.; //1.+.1*sin(8.*iTime);
    float alpha = .5+.5*cos(4.*iTime);

    vec3 coltemp = c.xxx;
    // F
    rect(uv, vec4(0,0,5,1), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(1,0,1,7), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(2,3,3,1), d_shift, phi, scale, 1., coltemp);
	// Ü
    rect(uv, vec4(6,2,1,4), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(7,6,3,1), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(6,5,5,1), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(10,2,1,4), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(6,0,1,1), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(10,0,1,1), d_shift, phi, scale, 1., coltemp);
	// R
    rect(uv, vec4(12,0,1,7), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(12,0,4,1), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(12,3,4,1), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(16,1,1,2), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(15,4,2,1), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(16,4,1,3), d_shift, phi, scale, 1., coltemp);
	// E
    int e1 = -1;
    rect(uv, vec4(e1,8,1,5), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(e1,8,4,1), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(e1,10,3,1), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(e1,12,4,1), d_shift, phi, scale, 1., coltemp);
    // L
    rect(uv, vec4(e1+5,8,1,5), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(e1+5,12,3,1), d_shift, phi, scale, 1., coltemp);
    // !
    rect(uv, vec4(e1+9,12,1,1), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(e1+9,8,1,3), d_shift, phi, scale, 1., coltemp);
	// T
    rect(uv, vec4(e1+12,8,1,5), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(e1+11,8,3,1), d_shift, phi, scale, 1., coltemp);
	// E
    int e2 = 15;
    rect(uv, vec4(e1+e2,8,1,5), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(e1+e2,8,4,1), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(e1+e2,10,3,1), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(e1+e2,12,4,1), d_shift, phi, scale, 1., coltemp);

    col = mix(col, coltemp, alpha);

    // für elite puts a smile on your (ugly) face
    coltemp = c.xxx;
    d_shift = vec2(-5.-1.*cos(8.*iTime),-2)*3.;
    phi = 0.;
    scale = 1.+.1*sin(8.*iTime);
    alpha = 0.5;
    rect(uv, vec4(0,-3,1,3), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(2,-3,1,3), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(-2,2,7,1), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(-2,0,1,3), d_shift, phi, scale, 1., coltemp);
    rect(uv, vec4(4,0,1,3), d_shift, phi, scale, 1., coltemp);
    col = mix(col, coltemp, alpha);

    dbox(uv, vec2(.001,1.), d);
    col = mix(col, c.yyy, .5*sm(d));
    dbox(uv, vec2(1,.001), d);
    col = mix(col, c.yyy, .5*sm(d));

    fragColor = vec4(clamp(col,0.,1.),1.0);
}