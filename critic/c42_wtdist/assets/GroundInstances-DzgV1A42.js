import{b as e,i as t,l as n,s as r}from"./MapRenderer-DUzrLcZT.js";import{n as i,t as a}from"./hash-VYJsGXV-.js";var o={Tree:0,Rock:1,Building:2},s=.35,c={[e.Water]:{tree:0,rock:0},[e.Crossing]:{tree:0,rock:0},[e.Plains]:{tree:.05,rock:0},[e.Grassland]:{tree:.04,rock:0},[e.Forest]:{tree:.75,rock:0},[e.Hills]:{tree:.12,rock:.1},[e.Mountains]:{tree:.08,rock:.42},[e.Desert]:{tree:0,rock:.05},[e.Tundra]:{tree:.02,rock:.04},[e.Marsh]:{tree:.07,rock:0},[e.Urban]:{tree:.04,rock:0},[e.Ice]:{tree:0,rock:0}},l={[o.Tree]:{px:7,m:9},[o.Rock]:{px:6,m:5},[o.Building]:{px:7,m:14}},u=[0,3,5,8,12,18],d=.85;function f(e,t,n,r,i=!1){let a={w:t,wrapX:i,x:new Float64Array(e.length),y:new Float64Array(e.length),reach:new Float64Array(e.length),byCell:new Map};return e.forEach((e,o)=>{let s=u[Math.max(0,Math.min(5,Math.round(e.size)))]/r;a.x[o]=e.x,a.y[o]=e.y,a.reach[o]=s;for(let r=Math.max(0,Math.floor(e.y-s));r<=Math.min(n-1,Math.floor(e.y+s));r++)for(let n=i?Math.floor(e.x-s):Math.max(0,Math.floor(e.x-s));n<=(i?Math.floor(e.x+s):Math.min(t-1,Math.floor(e.x+s)));n++){let e=r*t+(n%t+t)%t,i=a.byCell.get(e);i?i.push(o):a.byCell.set(e,[o])}}),a}function p(e,t,n){let r=e.byCell.get(Math.floor(n)*e.w+Math.floor(t));if(!r)return 0;let i=0;for(let a of r){let r=t-e.x[a];e.wrapX&&(r-=e.w*Math.round(r/e.w));let o=Math.hypot(r,n-e.y[a])/e.reach[a];o<1&&(i=Math.max(i,d*(1-o)**1.3))}return i}function m(e,t){return Math.ceil(e*t*.01)+1e3}var h=new Uint16Array,g=new Uint16Array;function _(n,r,u,d,f=u){let m=d&&d.length>=u*6?d:new Float32Array(u*6);f<u&&h.length<u&&(h=new Uint16Array(u),g=new Uint16Array(u));let _=Math.log2(r.pxPerCell/14),y=Math.floor(_),b=Math.min(1,Math.max(0,(_-y-.5)/.5)),x=b*b*(3-2*b),S=y<0?2**-y:1,C=y<0&&x>0?S/2:S,w=n.kmPerCell*1e3/r.pxPerCell,T=16/r.pxPerCell,[E,D,O,k]=[r.cx-r.halfW-T,r.cx+r.halfW+T,r.cy-r.halfH-T,r.cy+r.halfH+T],A=0,j=!1,M=y<0?0:y+ +(x>0);for(let d=0;d<=M&&!j;d++){let _=2**d,v=n.w*_,b=d===0?C:1,[T,M]=[Math.ceil(Math.floor(E*_-s)/b)*b,Math.ceil(D*_+s)],[N,P]=[Math.ceil(Math.max(0,Math.floor(O*_-s))/b)*b,Math.min(n.h*_,Math.ceil(k*_+s))];for(let C=N;C<=P&&!j;C+=b)for(let N=T;N<=M;N+=b){if(d>0&&!(N&1)&&!(C&1))continue;let b=y<0?N%S===0&&C%S===0?1:x:d<=y?1:x,T=n.wrapX?(N%v+v)%v:N,M=a(a(T,C),d),[P,F]=i(M),I=(N+P*s)/_,L=(C+F*s)/_;if(I<E||I>D||L<O||L>k||L<0||L>=n.h||!n.wrapX&&(I<0||I>=n.w))continue;let R=n.wrapX?(Math.floor(I)%n.w+n.w)%n.w:Math.floor(I),z=n.terrain[Math.floor(L)*n.w+R];if(z===e.Water||z===e.Crossing)continue;let B=a(M,20973),V=(B&65535)/65536,H=(B>>>16)/65536,U=c[z]??c[e.Plains],W,G=n.cities.byCell.size>0?p(n.cities,n.wrapX?R+(I-Math.floor(I)):I,L):0;if(G>0&&(a(M,45437)&65535)/65536<G)W=o.Building;else if(V<U.tree)W=o.Tree;else if(V<U.tree+U.rock)W=o.Rock;else continue;if(n.mask&&!t(n.mask,n.w,n.h,I,L,n.wrapX))continue;if(A===u){j=!0;break}let K=l[W],q=.8+.4*H;f<u&&(h[A]=(b<1?64:0)+d,g[A]=a(M,29719)&65535);let J=A*6;m[J]=(I-r.cx)*r.pxPerCell,m[J+1]=(L-r.cy)*r.pxPerCell,m[J+2]=Math.max(K.px,K.m/w)*q,m[J+3]=W,m[J+4]=b,m[J+5]=H,A++}}let N=f<A?v(m,A,f):A;return{count:N,data:m,level:y,truncated:j,thinned:A-N}}function v(e,t,n){let r=new Map;for(let e=0;e<t;e++)r.set(h[e],(r.get(h[e])??0)+1);let i=t-n,a=-1,o=0;for(let e of[...r.keys()].sort((e,t)=>t-e)){let t=r.get(e);if(i>=t){i-=t;continue}a=e,o=t-i;break}let s=new Uint32Array(65536);for(let e=0;e<t;e++)h[e]===a&&s[g[e]]++;let c=0,l=0;for(;l+s[c]<=o;)l+=s[c++];let u=o-l,d=0;for(let n=0;n<t;n++){let t=h[n];(t<a||t===a&&(g[n]<c||g[n]===c&&u-->0))&&(d!==n&&e.copyWithin(d*6,n*6,(n+1)*6),d++)}return d}var y=`#version 300 es
precision highp float;
in vec2 aCorner;        // per-vertex corner in [-0.5, 0.5]
in vec3 aPlace;         // per-instance: x and y from the view's centre, and size, CSS px
in vec3 aLook;          // per-instance: kind, opacity, variant (0..1)
uniform vec2 uViewport; // CSS px
uniform float uDpr;
uniform float uShare;   // the layer's opacity (the handover's share)
out vec2 vP;            // the fragment's place in the instance's square, in sizes: the thing is within 0.5 of the middle
out vec3 vLook;
out float vPx;          // the size in device px
void main() {
  // The square is 1.7 sizes wide: the thing and its shadow.
  vec2 corner = aCorner * 1.7;
  vP = corner;
  vec2 px = aPlace.xy + corner * aPlace.z;
  gl_Position = vec4(px.x / (0.5 * uViewport.x), -px.y / (0.5 * uViewport.y), 0.0, 1.0);
  vLook = vec3(aLook.x, aLook.y * uShare, aLook.z);
  vPx = aPlace.z * uDpr;
}
`,b=`#version 300 es
precision highp float;
in vec2 vP;
in vec3 vLook;
in float vPx;
out vec4 outColor;

// On the ground, towards the light: north-west (x grows east, y south).
const vec2 TO_LIGHT = vec2(-0.7071, -0.7071);

vec2 turn(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * p.x + s * p.y, -s * p.x + c * p.y);
}

// How far p is outside a block of rock with cut corners (negative: inside).
float rock(vec2 q) {
  return max(max(abs(q.x), abs(q.y) * 1.2), (abs(q.x) + abs(q.y)) * 0.78) - 0.36;
}

// How far q is outside a house of half sizes h.
float house(vec2 q, vec2 h) {
  return max(abs(q.x) - h.x, abs(q.y) - h.y);
}

void main() {
  float v = vLook.z;
  float soft = 1.0 / max(vPx, 1.0); // a device px, in sizes
  vec3 col;
  float body;   // how much of the pixel the thing covers
  float shade;  // and its shadow
  if (vLook.x < 0.5) {
    // A tree: a crown with a lobed edge, light on the side of the light.
    float r = length(vP);
    float edge = 0.45 * (0.9 + 0.1 * sin(atan(vP.y, vP.x) * 5.0 + v * 40.0));
    body = 1.0 - smoothstep(edge - soft, edge + soft, r);
    float lit = clamp(0.5 + dot(vP, TO_LIGHT) / 0.9, 0.0, 1.0);
    col = mix(vec3(0.09, 0.22, 0.10), vec3(0.25, 0.44, 0.19), lit) * (0.9 + 0.2 * v);
    shade = 1.0 - smoothstep(0.45 - 2.0 * soft, 0.45 + 2.0 * soft, length(vP - vec2(0.2)));
  } else if (vLook.x < 1.5) {
    // A rock: one face to the light, one away from it.
    float a = v * 6.2832;
    float d = rock(turn(vP, a));
    body = 1.0 - smoothstep(-soft, soft, d);
    col = dot(vP, TO_LIGHT) > -0.04 ? vec3(0.64, 0.62, 0.58) : vec3(0.38, 0.37, 0.36);
    col = mix(col, vec3(0.22), smoothstep(-0.07, 0.0, d) * 0.6);
    shade = 1.0 - smoothstep(-2.0 * soft, 2.0 * soft, rock(turn(vP - vec2(0.15), a)));
  } else {
    // A building: a roof of two slopes along its length, along one of two streets that cross, give or take a little.
    float a = floor(v * 2.0) * 1.5708 + (fract(v * 16.0) - 0.5) * 0.25;
    vec2 h = vec2(0.42, 0.26 + 0.08 * fract(v * 7.0));
    vec2 q = turn(vP, a);
    float d = house(q, h);
    body = 1.0 - smoothstep(-soft, soft, d);
    // The slope this pixel is on faces across the ridge: towards the light, or away.
    vec2 across = turn(vec2(0.0, q.y < 0.0 ? -1.0 : 1.0), -a);
    vec3 roof = fract(v * 3.0) < 0.6 ? vec3(0.62, 0.34, 0.26) : vec3(0.50, 0.49, 0.50);
    col = roof * (dot(across, TO_LIGHT) > 0.0 ? 1.14 : 0.8);
    // The ridge, a dark line, once the roof is large enough to have one (a symbol of 7 px is
    // two slopes and an outline: a line between them would leave two sticks).
    col *= mix(1.0, mix(0.6, 1.0, smoothstep(0.02, 0.05 + soft, abs(q.y))), smoothstep(10.0, 18.0, vPx));
    col = mix(col, vec3(0.16), smoothstep(-0.06, 0.0, d) * 0.7);
    shade = 1.0 - smoothstep(-2.0 * soft, 2.0 * soft, house(turn(vP - vec2(0.13), a), h));
  }
  float shadow = 0.34 * shade * (1.0 - body);
  float alpha = body + shadow;
  if (alpha * vLook.y < 0.01) discard;
  // The shadow is black: the thing's colour by its share of what is drawn here.
  outColor = vec4(col * (body / alpha), alpha * vLook.y);
}
`,x=24e3,S=class{gl;cap;program;vao;buf;data;count=0;constructor(e,t=x){this.gl=e,this.cap=t,this.program=r(e,[y,b]),this.data=new Float32Array(t*6),this.vao=e.createVertexArray(),e.bindVertexArray(this.vao);let n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-.5,-.5,.5,-.5,-.5,.5,.5,.5]),e.STATIC_DRAW);let i=t=>e.getAttribLocation(this.program.program,t);e.enableVertexAttribArray(i(`aCorner`)),e.vertexAttribPointer(i(`aCorner`),2,e.FLOAT,!1,0,0),this.buf=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this.buf),e.bufferData(e.ARRAY_BUFFER,this.data.byteLength,e.DYNAMIC_DRAW);for(let[t,n]of[[`aPlace`,0],[`aLook`,12]])e.enableVertexAttribArray(i(t)),e.vertexAttribPointer(i(t),3,e.FLOAT,!1,24,n),e.vertexAttribDivisor(i(t),1);e.bindVertexArray(null)}upload(e,t=this.data){let n=this.gl;this.count=Math.min(e,this.cap),n.bindBuffer(n.ARRAY_BUFFER,this.buf),n.bufferSubData(n.ARRAY_BUFFER,0,t,0,this.count*6)}draw(e,t,r,i){if(this.count===0||i<=0)return;let a=this.gl;a.enable(a.BLEND),a.blendFuncSeparate(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA,a.ONE,a.ONE_MINUS_SRC_ALPHA),a.useProgram(this.program.program),n(this.program,{uViewport:[e,t],uDpr:r,uShare:i}),a.bindVertexArray(this.vao),a.drawArraysInstanced(a.TRIANGLE_STRIP,0,4,this.count),a.bindVertexArray(null),a.disable(a.BLEND)}dispose(){this.gl.deleteBuffer(this.buf),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program.program)}};export{_ as a,m as i,S as n,f as r,x as t};
//# sourceMappingURL=GroundInstances-DzgV1A42.js.map