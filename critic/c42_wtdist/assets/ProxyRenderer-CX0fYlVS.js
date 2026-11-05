import{c as e,l as t,s as n}from"./MapRenderer-DUzrLcZT.js";import{t as r}from"./hash-VYJsGXV-.js";import{n as i}from"./flags-CMfHqXnG.js";import{c as a,f as o,h as s,t as c}from"./atlas-Ci7QJNxe.js";function l(e,t){let n=new Uint8Array(3456);i({...e,aspect:36/24},t,n,36,0,0,36,24);let r=new Uint32Array(864);for(let e=0;e<r.length;e++)r[e]=n[e*4]<<16|n[e*4+1]<<8|n[e*4+2];return r}var u=e=>`#${(e&16777215).toString(16).padStart(6,`0`)}`,d=[`tricolourH`,`tricolourV`,`bicolourH`,`bicolourV`,`nordic`,`cross`,`saltire`,`triangle`,`canton`,`disc`,`star`];function f(e,t,n,r){let[i,a,o]=[u(t),u(n),u(r)],s=e=>({aspect:36/24,layers:e});switch(e){case`tricolourH`:return s([{t:`stripes`,dir:`h`,colors:[i,a,o]}]);case`tricolourV`:return s([{t:`stripes`,dir:`v`,colors:[i,a,o]}]);case`bicolourH`:return s([{t:`stripes`,dir:`h`,colors:[i,a]}]);case`bicolourV`:return s([{t:`stripes`,dir:`v`,colors:[i,a]}]);case`nordic`:return s([{t:`stripes`,dir:`h`,colors:[i]},{t:`cross`,color:a,width:.2,cx:.36}]);case`cross`:return s([{t:`stripes`,dir:`h`,colors:[i]},{t:`cross`,color:a,width:.2}]);case`saltire`:return s([{t:`stripes`,dir:`h`,colors:[i]},{t:`saltire`,color:a,width:.18}]);case`triangle`:return s([{t:`stripes`,dir:`h`,colors:[i,a]},{t:`triangle`,color:o,depth:.4}]);case`canton`:return s([{t:`stripes`,dir:`h`,colors:[i]},{t:`rect`,x:0,y:0,w:.45,h:.5,color:a},{t:`star`,cx:.225,cy:.25,r:.17,color:o}]);case`disc`:return s([{t:`stripes`,dir:`h`,colors:[i]},{t:`disc`,cx:.5,cy:.5,r:.3,color:a}]);case`star`:return s([{t:`stripes`,dir:`h`,colors:[i]},{t:`star`,cx:.5,cy:.5,r:.35,color:a}])}}var p=1842216,m=15921124,h=[14725152,12066848,1850488,1993274,p,m],g=150,_=e=>((e>>16&255)*299+(e>>8&255)*587+(e&255)*114)/1e3,ee=(e,t)=>Math.abs((e>>16&255)-(t>>16&255))+Math.abs((e>>8&255)-(t>>8&255))+Math.abs((e&255)-(t&255));function te(e,t){let n=Math.imul(e^2654435769,2246822507)^t;return n=Math.imul(n^n>>>16,2246822507),n=Math.imul(n^n>>>13,3266489909),(n^n>>>16)>>>0}function ne(e,t){let n=t&16777215,r=te(e,n),i=_(n)>140?p:m,a=i===p?m:p;for(let e=0;e<h.length;e++){let t=h[((r>>>8)+e)%h.length];if(ee(t,n)>=g&&ee(t,i)>=g){a=t;break}}return f(d[r%d.length],n,i,a)}function re(e,t,n,r){let i=e[n*36+t];if(i===void 0||i===r)return;let a=[n*36+t];for(;a.length>0;){let t=a.pop();if(e[t]!==i)continue;e[t]=r;let n=t%36;n>0&&a.push(t-1),n<35&&a.push(t+1),t>=36&&a.push(t-36),t<828&&a.push(t+36)}}function ie(e,t,n,r,i,a){let o=Math.abs(r-t),s=-Math.abs(i-n),c=t<r?1:-1,l=n<i?1:-1,u=o+s;for(;;){if(t>=0&&n>=0&&t<36&&n<24&&(e[n*36+t]=a),t===r&&n===i)return;let d=2*u;d>=s&&(u+=s,t+=c),d<=o&&(u+=o,n+=l)}}function ae(e,t,n,r,i){let a=r+.5;for(let r=Math.max(0,Math.floor(n-a));r<=Math.min(23,Math.ceil(n+a));r++)for(let o=Math.max(0,Math.floor(t-a));o<=Math.min(35,Math.ceil(t+a));o++)(o-t)*(o-t)+(r-n)*(r-n)<=a*a&&(e[r*36+o]=i)}var v=38,y=26,b=2048,oe=2048,x=Math.floor(b/v),se=x*Math.floor(oe/y);function ce(e,t,n){let r=e%x,i=Math.floor(e/x);return[r*v+1+t,i*y+1+n]}function le(e){let t=Math.ceil(Math.max(1,e)/x),n=128;for(;n<t*y&&n<2048;)n*=2;return n}var ue=class{pixels=new Uint8Array(b*128*4);height=128;slots=new Map;written=new Map;free=[];next=0;dirtyFrom=0;dirtyTo=0;gpuHeight=0;texture=null;slotOf(e){return this.slots.get(e)??-1}get size(){return this.slots.size}sync(e,t){let n=new Set(e);for(let[e,t]of this.slots)n.has(e)||(this.slots.delete(e),this.written.delete(e),this.free.push(t));this.free.sort((e,t)=>t-e);for(let e of n){let n=this.slots.get(e);if(n===void 0){if(n=this.free.pop()??(this.next<se?this.next++:-1),n===-1)continue;this.slots.set(e,n)}let r=t(e);this.written.get(e)!==r&&(this.write(n,r),this.written.set(e,r))}}write(e,t){this.grow(le(e+1));let[n,r]=ce(e,0,0);for(let e=-1;e<25;e++){let i=Math.min(23,Math.max(0,e)),a=((r+e)*b+n-1)*4;for(let e=-1;e<37;e++,a+=4){let n=t[i*36+Math.min(35,Math.max(0,e))];this.pixels[a]=n>>16&255,this.pixels[a+1]=n>>8&255,this.pixels[a+2]=n&255,this.pixels[a+3]=255}}this.markDirty(r-1,r-1+y)}grow(e){if(e<=this.height)return;let t=new Uint8Array(b*e*4);t.set(this.pixels),this.pixels=t,this.height=e}markDirty(e,t){this.dirtyFrom>=this.dirtyTo?[this.dirtyFrom,this.dirtyTo]=[e,t]:[this.dirtyFrom,this.dirtyTo]=[Math.min(this.dirtyFrom,e),Math.max(this.dirtyTo,t)]}markUploaded(){this.dirtyFrom=this.dirtyTo=0}dirtyRows(){return this.dirtyFrom<this.dirtyTo?[this.dirtyFrom,this.dirtyTo]:null}upload(e){if(this.texture?e.bindTexture(e.TEXTURE_2D,this.texture):(this.texture=e.createTexture(),e.bindTexture(e.TEXTURE_2D,this.texture),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)),e.pixelStorei(e.UNPACK_ALIGNMENT,4),this.gpuHeight!==this.height)e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,b,this.height,0,e.RGBA,e.UNSIGNED_BYTE,this.pixels),this.gpuHeight=this.height;else if(this.dirtyFrom<this.dirtyTo){let t=this.dirtyTo-this.dirtyFrom;e.texSubImage2D(e.TEXTURE_2D,0,0,this.dirtyFrom,b,t,e.RGBA,e.UNSIGNED_BYTE,this.pixels,this.dirtyFrom*b*4)}return this.markUploaded(),this.texture}},S=.9,C=.3,w=-.12,T=.14,E=.21,D=.14,O=.2,de=.08,fe=1.2,k=[.1,.1,.11],pe=.3,me=.3,he=.14,A=[-.38,-.42],ge=.5;function _e(e){let t=C*(Math.cos(e)>=0?1:-1),n=w+T*Math.sin(e);return[[t-E,n],[t+E,n]]}var j={infantry:0,tank:1,carrier:2,gun:3,ship:4,aircraft:5,turret:6,none:7};function M(e){return e===a.infantry||e===a.prone?j.infantry:e===a.tank||e===a.tankMedium||e===a.tankHeavy||e===a.tankSmall?j.tank:e===a.halftrack?j.carrier:e===a.gun?j.gun:e===a.aircraft?j.aircraft:e===a.turretLight||e===a.turretMedium||e===a.turretHeavy?j.turret:o(e)?j.ship:j.none}var ve=[1.12,1.3,1.3,1.82,1.9,1.72,1.82,1],N=[.36,.4,.27],P=[.26,.27,.28],F=[.42,.44,.45],I=[.55,.58,.62],ye=[.72,.74,.76],L=[0,-.5],R=[.74,.52],z=-.4,be=.95,B=-.34,V={x:1.12,top:.5,bottom:1.12,round:.22},H={from:[.3,-.05],to:[1.6,-.5],half:.12},U={at:[-.25,.72],r:.34},xe=1.6,Se=.12,W=.45,Ce=.1,G={deck:.3,keel:.92,sternDeck:-1.4,sternKeel:-1.2,bowDeck:1.7,bowKeel:1.15},K={y:.12,rx:1.6,ry:.2},we=[.2,.07,.07,.16,.06,.05,.07,0],Te=[2.2,5,5,2.2,.8,1,5,0],Ee=.18,De=.35,Oe=.07,ke=.1,Ae=.8,q={engaged:1,hit:2},J=[.75,.5,.25];function je(e,t){if(t<=0)return 0;let n=e/t;return n<=J[2]?3:n<=J[1]?2:+(n<=J[0])}var Me=[.94,.86,.7],Ne=.12,Pe=.3,Fe=1.3,Ie=.045,Le=.7,Y=e=>e.toFixed(4),X=e=>`vec3(${e.map(Y).join(`, `)})`,Re=Array.from({length:c},(e,t)=>Y(M(t))).join(`, `),ze=Array.from({length:c},(e,t)=>Y(ve[M(t)])).join(`, `),Be=we.map(Y).join(`, `),Ve=Te.map(Y).join(`, `),He=`#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aPrevCur;
layout(location = 2) in vec4 aMisc;    // facing, size (cells), frame (+ march), alpha
layout(location = 3) in vec4 aColor;
layout(location = 4) in float aFlag;   // the nation's flag slot, -1 none
layout(location = 5) in float aState;  // BallState bits: engaged 1, hit 2
uniform vec2 uCam;
uniform float uTime;       // seconds, the render clock
uniform float uMarchSpan;  // the march fraction's span above a half (ProxyRenderer)
uniform float uScale;
uniform vec2 uViewport;
uniform float uT;
uniform float uMinPx;
uniform float uMaxPx;
uniform float uSizeMul;
uniform float uAlpha;
uniform float uDpr;
uniform float uFrameMinPx[${c}];
const float CLASS_OF[${c}] = float[${c}](${Re});
const float QUAD_OF[${c}] = float[${c}](${ze});
const float BOB_H[8] = float[8](${Be});
const float BOB_HZ[8] = float[8](${Ve});
const int HURT_SHIFT_I = 2;
flat out float vHurt;  // 0 whole – 3 (PLAN 7.178)
out float vOpen;     // the eyes' height, a share of theirs
out float vAngry;
out vec2 vP;
out vec4 vColor;
out float vSlot;
out vec2 vFlagOrigin;
out vec2 vLook;
out vec2 vAim;
flat out int vClass;
out float vPxP;      // ball units a device px
out float vEyes;     // the eyes' and props' share, 0–1
void main() {
  vec2 pos = mix(aPrevCur.xy, aPrevCur.zw, uT);
  int frame = int(floor(aMisc.z));
  int st = int(aState + 0.5);
  float sizePx = min(max(aMisc.y * uScale, max(uMinPx, uFrameMinPx[frame])), uMaxPx) * uSizeMul * ((st & 16) != 0 ? ${Y(2)} : 1.0);
  vEyes = smoothstep(${Y(6)}, ${Y(11)}, sizePx / uDpr);
  // Props out (small): the quad is the ball's.
  float quad = vEyes > 0.0 ? QUAD_OF[frame] : 1.0;
  int cls = int(CLASS_OF[frame]);
  // The march (PLAN 7.174e): the frame's fraction from a half is the walk's phase.
  float part = aMisc.z - float(frame);
  float phase = (part - 0.5) / uMarchSpan;
  float bob = part >= 0.25 ? BOB_H[cls] * abs(sin(3.14159265 * (uTime * BOB_HZ[cls] + phase))) : 0.0;
  bool hit = (st & ${q.hit}) != 0;
  vAngry = (st & ${q.engaged}) != 0 ? 1.0 : 0.0;
  vHurt = float((st >> HURT_SHIFT_I) & 3);
  float shake = hit ? ${Y(Oe)} * sin(6.2831853 * ${Y(7)} * uTime) : 0.0;
  // A blink by a hash of the ball's place.
  float seed = fract(sin(dot(floor(aPrevCur.zw * 256.0), vec2(12.9898, 78.233))) * 43758.5453);
  float period = ${Y(3)} * (1.0 + seed);
  float bt = fract(uTime / period + seed);
  float share = ${Y(Ee)} / period;
  float shut = bt < share ? sin(3.14159265 * bt / share) : 0.0;
  vOpen = max(0.08, (1.0 - shut) * (hit ? ${Y(De)} : 1.0));
  vec2 px = (pos - uCam) * uScale + aCorner * sizePx * quad + vec2(shake, -bob) * sizePx * 0.5;
  gl_Position = vec4(px.x / (0.5 * uViewport.x), -px.y / (0.5 * uViewport.y), 0.0, 1.0);
  vP = aCorner * 2.0 * quad;
  vPxP = 2.0 / sizePx;
  vLook = vec2(cos(aMisc.x) >= 0.0 ? 1.0 : -1.0, sin(aMisc.x));
  vAim = vec2(cos(aMisc.x), sin(aMisc.x));
  vClass = int(CLASS_OF[frame]);
  vSlot = aFlag;
  float col = mod(aFlag, ${Y(x)});
  float row = floor(aFlag / ${Y(x)} + 0.0001);
  vFlagOrigin = vec2(col * ${Y(v)} + ${Y(1)}, row * ${Y(y)} + ${Y(1)});
  // Not faded by its losses as a sprite is (PLAN 7.178): its cracks and plasters say them.
  vColor = vec4(aColor.rgb, aColor.a * uAlpha);
}
`,Ue=`#version 300 es
precision highp float;
uniform sampler2D uFlags;
uniform float uFlagH;      // the flag atlas's height, texels
uniform float uDpr;
in vec2 vP;
in vec4 vColor;
in float vSlot;
in vec2 vFlagOrigin;
in vec2 vLook;
in vec2 vAim;
flat in int vClass;
in float vPxP;
in float vEyes;
in float vOpen;
in float vAngry;
flat in float vHurt;
out vec4 outColor;
const float R = ${Y(S)};
const vec3 OUTLINE = vec3(${k.map(Y).join(`, `)});
// Distances (negative inside), ball units.
float sdBox(vec2 p, vec2 c, vec2 h, float r) {
  vec2 d = abs(p - c) - h + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}
float sdSegment(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}
vec2 rot(vec2 p, float a) {
  float s = sin(a), k = cos(a);
  return vec2(k * p.x + s * p.y, -s * p.x + k * p.y);
}
// A crack: three segments from the rim inward, through a, b, c, d.
float sdCrack(vec2 p, vec2 a, vec2 b, vec2 c, vec2 d, float h) {
  return min(min(sdSegment(p, a, b, h), sdSegment(p, b, c, h * 0.8)), sdSegment(p, c, d, h * 0.6));
}
// A plaster: two strips crossed at c, of half length l.
float sdPlaster(vec2 p, vec2 c, float l, float h) {
  vec2 d = p - c;
  return min(sdBox(rot(d, 0.7), vec2(0.0), vec2(l, h), h * 0.6), sdBox(rot(d, -0.7), vec2(0.0), vec2(l, h), h * 0.6));
}
float sdEllipse(vec2 p, vec2 c, vec2 r) {
  return (length((p - c) / r) - 1.0) * min(r.x, r.y);
}
// Which side of the line a→b p is on: negative on the left as a→b goes (y down).
float sdLine(vec2 p, vec2 a, vec2 b) {
  vec2 n = normalize(vec2(b.y - a.y, a.x - b.x));
  return dot(p - a, n);
}
// A shape of distance d over (c, a): its fill with the outline at its edge.
void over(inout vec3 c, inout float a, float d, vec3 fill, float w, float aa) {
  float cover = 1.0 - smoothstep(-aa, aa, d);
  if (cover <= 0.0) return;
  vec3 col = mix(fill, OUTLINE, smoothstep(-w - aa, -w + aa, d));
  c = mix(c, col, cover);
  a = a + (1.0 - a) * cover;
}
// An oval eye at c, open: the share of its height shown, its brow cut falling toward the side inward (±1) when angry: 1 inside
// it, and 1 inside its white (the edge out to its outline).
vec2 eye(vec2 p, vec2 c, float open, float inward, float w, float aa) {
  float ry = ${Y(O)} * open;
  float d = (length((p - c) / vec2(${Y(D)}, ry)) - 1.0) * min(${Y(D)}, ry);
  if (vAngry > 0.5) d = max(d, (c.y - ry * (1.0 - 2.0 * ${Y(ke)}) + ${Y(Ae)} * (p.x - c.x) * inward) - p.y);
  float inside = 1.0 - smoothstep(-aa, aa, d);
  float white = 1.0 - smoothstep(-w - aa, -w + aa, d);
  return vec2(inside, white);
}
void main() {
  float r = length(vP);
  float aa = vPxP;
  float w = max(${Y(de)}, ${Y(fe)} * uDpr * vPxP * vEyes);
  float pw = min(w, ${Y(Ce)});   // the props' outline
  vec2 q = vec2(vP.x * vLook.x, vP.y);   // x toward the facing
  vec3 c = vec3(0.0);
  float a = 0.0;
  bool props = vEyes > 0.0;
  // A turret is its barrel alone, out of its hull's ball.
  if (vClass == ${j.turret}) {
    if (!props) discard;
    float d = sdSegment(vP, vec2(0.0), vAim * ${Y(xe)}, ${Y(Se)});
    over(c, a, max(d, R - w * 0.5 - r), ${X(F)}, pw * ${Y(W)}, aa);
    a *= vEyes * vColor.a;
    if (a < 0.02) discard;
    outColor = vec4(c * a, a);
    return;
  }
  // Behind the ball.
  if (props) {
    if (vClass == ${j.tank} || vClass == ${j.carrier}) {
      float d = sdBox(vP, vec2(0.0, ${Y((V.top+V.bottom)/2)}), vec2(${Y(V.x)}, ${Y((V.bottom-V.top)/2)}), ${Y(V.round)});
      over(c, a, d, ${X(P)}, pw, aa);
      // Road wheels on the treads: the nearest of five, on the treads only.
      if (d < 0.0) {
        float k = clamp(floor(vP.x / 0.42 + 0.5), -2.0, 2.0);
        float dw = length(vP - vec2(k * 0.42, ${Y((V.top+V.bottom)/2+.1)})) - 0.13;
        over(c, a, max(dw, d), ${X(F)}, pw * 0.6, aa);
      }
    } else if (vClass == ${j.gun}) {
      over(c, a, length(q - vec2(${Y(U.at[0])}, ${Y(U.at[1])})) - ${Y(U.r)}, ${X(P)}, pw, aa);
      over(c, a, length(q - vec2(${Y(U.at[0])}, ${Y(U.at[1])})) - ${Y(U.r*.35)}, ${X(F)}, pw * 0.6, aa);
      over(c, a, sdSegment(q, vec2(${Y(H.from[0])}, ${Y(H.from[1])}), vec2(${Y(H.to[0])}, ${Y(H.to[1])}), ${Y(H.half)}), ${X(F)}, pw * ${Y(W)}, aa);
    } else if (vClass == ${j.aircraft}) {
      over(c, a, sdEllipse(vP, vec2(0.0, ${Y(K.y)}), vec2(${Y(K.rx)}, ${Y(K.ry)})), ${X(ye)}, pw, aa);
    }
    a *= vEyes;
  }
  // The ball.
  float disc = 1.0 - smoothstep(R - aa, R + aa, r);
  if (disc > 0.0) {
    vec3 b = vColor.rgb;
    if (vSlot >= 0.0) {
      vec2 uv = clamp(0.5 + vP / (2.0 * R), 0.0, 1.0);
      // Under the helmet, the whole flag below its brim (R22-B1).
      if (vClass == ${j.infantry} && props) uv.y = mix(uv.y, clamp((vP.y - ${Y(B)}) / (R - ${Y(B)}), 0.0, 1.0), vEyes);
      vec2 texel = vFlagOrigin + uv * vec2(${Y(36)}, ${Y(24)});
      b = texture(uFlags, texel / vec2(${Y(b)}, uFlagH)).rgb;
    }
    // Round: darker toward the rim, a soft light up and to the left.
    float shade = 1.0 - ${Y(pe)} * smoothstep(${Y(me)}, R, r) + ${Y(he)} * (1.0 - smoothstep(0.0, ${Y(ge)}, length(vP - vec2(${Y(A[0])}, ${Y(A[1])}))));
    b *= shade;
    // Small, the outline is its share alone: a few px of ball are its flag, not a dark ring.
    b = mix(b, OUTLINE, smoothstep(R - w - aa, R - w + aa, r));
    vec2 centre = vec2(${Y(C)} * vLook.x, ${Y(w)} + ${Y(T)} * vLook.y);
    // The eyes' box: both ovals and an aa.
    if (props && abs(vP.y - centre.y) < ${Y(O)} + aa && abs(vP.x - centre.x) < ${Y(.35)} + aa) {
      float ew = min(w, 0.45 * ${Y(O)});
      vec2 e1 = eye(vP, centre - vec2(${Y(E)}, 0.0), vOpen, 1.0, ew, aa);
      vec2 e2 = eye(vP, centre + vec2(${Y(E)}, 0.0), vOpen, -1.0, ew, aa);
      float inside = max(e1.x, e2.x) * vEyes;
      float white = max(e1.y, e2.y);
      b = mix(b, mix(OUTLINE, vec3(1.0), white), inside);
    }
    // Its losses (PLAN 7.178): a crack at the back, a plaster on the cheek, then a second of each.
    if (props && vHurt > 0.5) {
      float ca = 0.0;
      vec3 cc = b;
      float ch = max(${Y(Ie)}, ${Y(Le)} * uDpr * vPxP);
      float d = sdCrack(q, vec2(-0.9, -0.15), vec2(-0.58, -0.02), vec2(-0.64, 0.18), vec2(-0.38, 0.3), ch);
      if (vHurt > 2.5) d = min(d, sdCrack(q, vec2(0.15, 0.88), vec2(0.05, 0.6), vec2(0.22, 0.48), vec2(0.1, 0.3), ch));
      b = mix(b, OUTLINE, (1.0 - smoothstep(-aa, aa, d)) * vEyes);
      if (vHurt > 1.5) {
        float ph = max(${Y(Ne)}, ${Y(Fe)} * uDpr * vPxP);
        over(cc, ca, sdPlaster(q, vec2(0.42, 0.38), ${Y(Pe)}, ph), ${X(Me)}, min(pw * 0.6, ph * 0.4), aa);
        if (vHurt > 2.5) over(cc, ca, sdPlaster(q, vec2(-0.45, 0.5), ${Y(Pe*.85)}, ph), ${X(Me)}, min(pw * 0.6, ph * 0.4), aa);
        b = mix(b, cc, ca * vEyes);
      }
    }
    c = mix(c, b, disc);
    a = a + (1.0 - a) * disc;
  }
  // In front of the ball.
  if (props) {
    vec3 c0 = c;
    float a0 = a;
    if (vClass == ${j.infantry}) {
      float dome = max(sdEllipse(vP, vec2(${Y(L[0])}, ${Y(L[1])}), vec2(${Y(R[0])}, ${Y(R[1])})), vP.y - ${Y(z)});
      float brim = sdBox(vP, vec2(0.0, ${Y(z)}), vec2(${Y(be)}, 0.06), 0.05);
      over(c, a, min(dome, brim), ${X(N)}, pw, aa);
    } else if (vClass == ${j.ship}) {
      float d = max(max(${Y(G.deck)} - vP.y, vP.y - ${Y(G.keel)}),
                    max(sdLine(q, vec2(${Y(G.bowDeck)}, ${Y(G.deck)}), vec2(${Y(G.bowKeel)}, ${Y(G.keel)})),
                        sdLine(q, vec2(${Y(G.sternKeel)}, ${Y(G.keel)}), vec2(${Y(G.sternDeck)}, ${Y(G.deck)}))));
      over(c, a, d, ${X(I)}, pw, aa);
    }
    c = mix(c0, c, vEyes);
    a = mix(a0, a, vEyes);
  }
  a *= vColor.a;
  if (a < 0.02) discard;
  outColor = vec4(c * a, a);
}
`,Z=.49;function We(e){return .5+Z*(r(e,28001)/2**32)}var Ge=Array.from({length:c},(e,t)=>o(t)?`1.0`:`0.0`).join(`, `),Ke=`#version 300 es
precision highp float;
in vec2 aCorner;            // per-vertex quad corner in [-0.5, 0.5]
in vec4 aPrevCur;           // per-instance prev.xy, cur.xy (cells, relative to origin)
in vec4 aMisc;              // facing (rad), size (cells), frame (+ marchFraction on the march), alpha
in vec4 aColor;             // tint (normalised u8)
in float aState;            // the countryballs' state bits; here only a hero's (HERO_BIT, PLAN 7.184b2)
uniform vec2 uCam;          // camera centre relative to origin (cells)
uniform float uScale;       // device px per cell
uniform vec2 uViewport;     // device px
uniform float uT;           // interpolation factor in [0, 1]
uniform float uMinPx;       // minimum sprite size in device px
uniform float uMaxPx;       // maximum sprite size in device px
uniform float uSizeMul;     // unit-size setting (PLAN 1.39a)
uniform float uTime;        // seconds, for the walk/drive animation (PLAN 2.3)
uniform float uAlpha;       // layer opacity (tier fades)
uniform float uSmall;       // the small frames' share, 0–1 (PLAN 3.6e3b)
uniform float uSmallOf[${c}]; // each frame's small one (smallFrameOf)
uniform float uFrameMinPx[${c}]; // each frame's least size in device px (a ship's, PLAN 4.12c)
out vec2 vUv;
out vec2 vUvSmall;
out float vSmall;
out vec4 vColor;
out float vShip;
// A ship's frame is in two parts (PLAN 7.41b, splitShipTint): red the hull, tinted; green its marks, grey.
const float SHIP[${c}] = float[${c}](${Ge});
void main() {
  vec2 pos = mix(aPrevCur.xy, aPrevCur.zw, uT);
  float frame = floor(aMisc.z);
  float sizePx = min(max(aMisc.y * uScale, max(uMinPx, uFrameMinPx[int(frame)])), uMaxPx) * uSizeMul;
  // A hero (PLAN 7.184b2): its kind's size, clamped as any, then HERO_SCALE × that.
  if ((int(aState + 0.5) & 16) != 0) sizePx *= ${2 .toFixed(1)};
  // Moving (frame + 0.5 and up): infantry sway side to side at a walking cadence, vehicles judder.
  // The rest of the fraction is the sprite's phase (marchFraction): its own from tick to tick,
  // and a turret's is its hull's (PLAN 3.6a).
  float part = aMisc.z - frame;
  float moving = step(0.25, part);
  float phase = 6.2832 * (part - 0.5) / ${Z.toFixed(2)};
  vec2 local = aCorner;
  if (frame < 0.5) local += moving * vec2(0.0, 0.07 * sin(uTime * 9.0 + phase));
  else local += moving * vec2(0.03 * sin(uTime * 31.0 + phase), 0.0);
  float c = cos(aMisc.x);
  float s = sin(aMisc.x);
  vec2 corner = vec2(c * local.x - s * local.y, s * local.x + c * local.y) * sizePx;
  vec2 px = (pos - uCam) * uScale + corner;
  gl_Position = vec4(px.x / (0.5 * uViewport.x), -px.y / (0.5 * uViewport.y), 0.0, 1.0);
  vUv = vec2((frame + aCorner.x + 0.5) / ${c.toFixed(1)}, aCorner.y + 0.5);
  // Where sprites are small, a frame goes over into its small one, and one that has none there
  // (a turret) goes out.
  float small = uSmallOf[int(frame)];
  float gone = step(small, -0.5);
  vSmall = uSmall * step(0.5, abs(small - frame)) * (1.0 - gone);
  vUvSmall = vec2((max(small, 0.0) + aCorner.x + 0.5) / ${c.toFixed(1)}, aCorner.y + 0.5);
  vColor = vec4(aColor.rgb, aColor.a * aMisc.w * uAlpha * (1.0 - gone * uSmall));
  vShip = SHIP[int(frame)];
}
`,qe=`#version 300 es
precision highp float;
uniform sampler2D uAtlas;
in vec2 vUv;
in vec2 vUvSmall;
in float vSmall;
in vec4 vColor;
in float vShip;
out vec4 outColor;
void main() {
  vec4 t = texture(uAtlas, vUv);
  if (vSmall > 0.0) t = mix(t, texture(uAtlas, vUvSmall), vSmall);
  // White silhouette → tint; dark outline stays dark. The atlas is premultiplied (PLAN 7.21b), so
  // is what is drawn: the tint's alpha scales the colour as well.
  vec3 c = vShip > 0.5 ? t.r * vColor.rgb + vec3(t.g) : t.rgb * vColor.rgb;
  outColor = vec4(c * vColor.a, t.a * vColor.a);
  if (outColor.a < 0.02) discard;
}
`,Je=Array.from({length:c},(e,t)=>s(t)),Ye=Array.from({length:c},()=>0),Xe=1e9,Q=8,$={aCorner:0,aPrevCur:1,aMisc:2,aColor:3,aFlag:4,aState:5},Ze=class{gl;program;vao;instBuf;colorBuf;flagBuf;stateBuf;ballProgram=null;atlas;capacity=0;count=0;originX=0;originY=0;data=new Float32Array;colors=new Uint8Array;flagSlots=new Float32Array;states=new Float32Array;constructor(t,r){this.gl=t,this.program=n(t,[Ke,qe],{attribLocations:$}),this.atlas=e(t,{src:r,min:t.LINEAR_MIPMAP_LINEAR,mag:t.LINEAR,wrap:t.CLAMP_TO_EDGE,premultiplyAlpha:1}),this.vao=t.createVertexArray(),t.bindVertexArray(this.vao);let i=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,i),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-.5,-.5,.5,-.5,-.5,.5,.5,.5]),t.STATIC_DRAW);let a=e=>$[e];t.enableVertexAttribArray(a(`aCorner`)),t.vertexAttribPointer(a(`aCorner`),2,t.FLOAT,!1,0,0),this.instBuf=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,this.instBuf),t.enableVertexAttribArray(a(`aPrevCur`)),t.vertexAttribPointer(a(`aPrevCur`),4,t.FLOAT,!1,32,0),t.vertexAttribDivisor(a(`aPrevCur`),1),t.enableVertexAttribArray(a(`aMisc`)),t.vertexAttribPointer(a(`aMisc`),4,t.FLOAT,!1,32,16),t.vertexAttribDivisor(a(`aMisc`),1),this.colorBuf=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,this.colorBuf),t.enableVertexAttribArray(a(`aColor`)),t.vertexAttribPointer(a(`aColor`),4,t.UNSIGNED_BYTE,!0,0,0),t.vertexAttribDivisor(a(`aColor`),1),this.flagBuf=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,this.flagBuf),t.enableVertexAttribArray(a(`aFlag`)),t.vertexAttribPointer(a(`aFlag`),1,t.FLOAT,!1,0,0),t.vertexAttribDivisor(a(`aFlag`),1),this.stateBuf=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,this.stateBuf),t.enableVertexAttribArray(a(`aState`)),t.vertexAttribPointer(a(`aState`),1,t.FLOAT,!1,0,0),t.vertexAttribDivisor(a(`aState`),1),t.bindVertexArray(null)}reserve(e){if(e<=this.data.length/Q)return;let t=new Float32Array(e*Q);t.set(this.data),this.data=t;let n=new Uint8Array(e*4);n.set(this.colors),this.colors=n;let r=new Float32Array(e).fill(-1);r.set(this.flagSlots),this.flagSlots=r;let i=new Float32Array(e);i.set(this.states),this.states=i}upload(e){let t=this.gl;this.count=e,t.bindBuffer(t.ARRAY_BUFFER,this.instBuf),e>this.capacity&&(this.capacity=Math.max(e,this.capacity*2),t.bufferData(t.ARRAY_BUFFER,this.capacity*Q*4,t.DYNAMIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,this.colorBuf),t.bufferData(t.ARRAY_BUFFER,this.capacity*4,t.DYNAMIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,this.flagBuf),t.bufferData(t.ARRAY_BUFFER,this.capacity*4,t.DYNAMIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,this.stateBuf),t.bufferData(t.ARRAY_BUFFER,this.capacity*4,t.DYNAMIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,this.instBuf)),t.bufferSubData(t.ARRAY_BUFFER,0,this.data,0,e*Q),t.bindBuffer(t.ARRAY_BUFFER,this.colorBuf),t.bufferSubData(t.ARRAY_BUFFER,0,this.colors,0,e*4),t.bindBuffer(t.ARRAY_BUFFER,this.flagBuf),t.bufferSubData(t.ARRAY_BUFFER,0,this.flagSlots,0,e),t.bindBuffer(t.ARRAY_BUFFER,this.stateBuf),t.bufferSubData(t.ARRAY_BUFFER,0,this.states,0,e)}uploadRange(e,t){if(t<=0||e+t>this.count)return;let n=this.gl;n.bindBuffer(n.ARRAY_BUFFER,this.instBuf),n.bufferSubData(n.ARRAY_BUFFER,e*Q*4,this.data,e*Q,t*Q)}draw(e,n,r,i=3,a=[0],o=1,s=0,c=1,l=Xe,u=0,d=Ye){if(this.count===0)return;let f=this.gl;f.enable(f.BLEND),f.blendFunc(f.ONE,f.ONE_MINUS_SRC_ALPHA),f.useProgram(this.program.program),t(this.program,{uAtlas:this.atlas,uScale:e.scale*n,uViewport:[f.drawingBufferWidth,f.drawingBufferHeight],uT:Math.min(1,Math.max(0,r)),uMinPx:i*n,uMaxPx:l*n,uSizeMul:o,uTime:s,uAlpha:c,uSmall:u,uSmallOf:Je,uFrameMinPx:d.map(e=>e*n)}),f.bindVertexArray(this.vao);for(let n of a)t(this.program,{uCam:[e.cx-n-this.originX,e.cy-this.originY]}),f.drawArraysInstanced(f.TRIANGLE_STRIP,0,4,this.count);f.bindVertexArray(null),f.disable(f.BLEND)}drawBalls(e,r,i,a,o,s,c=3,l=[0],u=1,d=1,f=Xe,p=Ye,m=0){let h=Math.min(a,this.count);if(h<=0)return;let g=this.gl;this.ballProgram??=n(g,[He,Ue],{attribLocations:$});let _=this.ballProgram;g.enable(g.BLEND),g.blendFunc(g.ONE,g.ONE_MINUS_SRC_ALPHA),g.useProgram(_.program),t(_,{uFlags:o,uFlagH:s,uDpr:r,uTime:m,uMarchSpan:Z,uScale:e.scale*r,uViewport:[g.drawingBufferWidth,g.drawingBufferHeight],uT:Math.min(1,Math.max(0,i)),uMinPx:c*r,uMaxPx:f*r,uSizeMul:u,uAlpha:d,uFrameMinPx:p.map(e=>e*r)}),g.bindVertexArray(this.vao);for(let n of l)t(_,{uCam:[e.cx-n-this.originX,e.cy-this.originY]}),g.drawArraysInstanced(g.TRIANGLE_STRIP,0,4,h);g.bindVertexArray(null),g.disable(g.BLEND)}};export{ne as C,ie as S,l as T,je as _,C as a,re as b,D as c,N as d,I as f,_e as g,P as h,q as i,O as l,F as m,We as n,w as o,k as p,S as r,E as s,Ze as t,B as u,ue as v,f as w,ae as x,d as y};
//# sourceMappingURL=ProxyRenderer-CX0fYlVS.js.map