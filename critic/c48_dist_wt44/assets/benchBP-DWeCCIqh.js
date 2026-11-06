const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./WebGPURenderer-6QvO6XMI.js","./WebGPURenderer-pIXfMllK.js","./CanvasPool-Dc8M5ulX.js","./RenderTargetSystem-eMyu_zrJ.js","./getTextureBatchBindGroup-DGjaXoqY.js","./getTexelRangeRects-DsNQrCxf.js","./WebGLRenderer-CMM-4f8f.js","./WebGLRenderer-DRXkszhS.js","./CanvasRenderer-DsB-eOcB.js","./CanvasRenderer-Qh53fkug.js","./canvasUtils-BWMp92Z5.js","./lib-BKEpt85C.js","./lib-BEmKZusC.js","./preload-helper-BaNbYf_w.js","./init-czELhuHm.js","./init-CrlC-LLc.js","./browserAll-KLK5Va6m.js"])))=>i.map(i=>d[i]);
import{At as e,B as t,Bt as n,D as r,Dt as i,E as a,G as o,H as s,I as c,Jt as l,Kt as u,Ot as d,Pt as f,R as p,U as m,Vt as h,W as g,d as _,h as v,nn as y,o as ee,ot as te,r as ne,rt as re,s as b,tn as x,u as ie,y as ae}from"./CanvasPool-Dc8M5ulX.js";import{t as oe}from"./MapRenderer-DUzrLcZT.js";import{n as se,t as ce}from"./atlas-Ci7QJNxe.js";import{t as S}from"./preload-helper-BaNbYf_w.js";import{n as le,t as ue}from"./benchUtil-BJEkoupA.js";import{n as de}from"./synthetic-BocosXmq.js";import{n as C,t as fe}from"./proxyScene-CQ4tytK9.js";import"./lib-BEmKZusC.js";import{t as pe}from"./canvasUtils-BWMp92Z5.js";import{Ot as me,R as he,Tt as ge,U as _e,bt as ve,wt as w}from"./RenderTargetSystem-eMyu_zrJ.js";var T;function ye(e){return T===void 0&&(T=(()=>{let n={stencil:!0,failIfMajorPerformanceCaveat:e??me.defaultOptions.failIfMajorPerformanceCaveat};try{if(!t.get().getWebGLRenderingContext())return!1;let e=t.get().createCanvas().getContext(`webgl`,n),r=!!e?.getContextAttributes()?.stencil;if(e){let t=e.getExtension(`WEBGL_lose_context`);t&&t.loseContext()}return e=null,r}catch{return!1}})()),T}var E;async function be(e={}){return E===void 0&&(E=await(async()=>{let n=t.get().getNavigator().gpu;if(!n)return!1;try{return await(await n.requestAdapter(e)).requestDevice(),!0}catch{return!1}})()),E}var xe=[`webgl`,`webgpu`,`canvas`];async function Se(e){let t=[];e.preference?Array.isArray(e.preference)?t=e.preference.slice():(t.push(e.preference),xe.forEach(n=>{n!==e.preference&&t.push(n)})):t=xe.slice();let n,r={};for(let i=0;i<t.length;i++){let a=t[i];if(a===`webgpu`&&await be()){let{WebGPURenderer:t}=await S(async()=>{let{WebGPURenderer:e}=await import(`./WebGPURenderer-6QvO6XMI.js`);return{WebGPURenderer:e}},__vite__mapDeps([0,1,2,3,4,5]),import.meta.url);n=t,r={...e,...e.webgpu};break}if(a===`webgl`&&ye(e.failIfMajorPerformanceCaveat??me.defaultOptions.failIfMajorPerformanceCaveat)){let{WebGLRenderer:t}=await S(async()=>{let{WebGLRenderer:e}=await import(`./WebGLRenderer-CMM-4f8f.js`);return{WebGLRenderer:e}},__vite__mapDeps([6,7,2,3,5]),import.meta.url);n=t,r={...e,...e.webgl};break}if(a===`canvas`){let{CanvasRenderer:t}=await S(async()=>{let{CanvasRenderer:e}=await import(`./CanvasRenderer-DsB-eOcB.js`);return{CanvasRenderer:e}},__vite__mapDeps([8,9,2,10,3,4]),import.meta.url);n=t,r={...e,...e.canvasOptions};break}}if(delete r.webgpu,delete r.webgl,delete r.canvasOptions,!n)throw Error(`No available renderer for the current environment`);let i=new n;return await i.init(r),i}var D=class{static init(e){Object.defineProperty(this,"resizeTo",{configurable:!0,set(e){globalThis.removeEventListener(`resize`,this.queueResize),this._resizeTo=e,e&&(globalThis.addEventListener(`resize`,this.queueResize),this.resize())},get(){return this._resizeTo}}),this.queueResize=()=>{this._resizeTo&&(this._cancelResize(),this._resizeId=requestAnimationFrame(()=>this.resize()))},this._cancelResize=()=>{this._resizeId&&=(cancelAnimationFrame(this._resizeId),null)},this.resize=()=>{if(!this._resizeTo)return;this._cancelResize();let e,t;if(this._resizeTo===globalThis.window)e=globalThis.innerWidth,t=globalThis.innerHeight;else{let{clientWidth:n,clientHeight:r}=this._resizeTo;e=n,t=r}this.renderer.resize(e,t),this.render()},this._resizeId=null,this._resizeTo=null,this.resizeTo=e.resizeTo||null}static destroy(){globalThis.removeEventListener(`resize`,this.queueResize),this._cancelResize(),this._cancelResize=null,this.queueResize=null,this.resizeTo=null,this.resize=null}};D.extension=x.Application;var O=class{static init(e){e=Object.assign({autoStart:!0,sharedTicker:!1},e),Object.defineProperty(this,"ticker",{configurable:!0,set(e){this._ticker&&this._ticker.remove(this.render,this),this._ticker=e,e&&e.add(this.render,this,p.LOW)},get(){return this._ticker}}),this.stop=()=>{this._ticker.stop()},this.start=()=>{this._ticker.start()},this._ticker=null,this.ticker=e.sharedTicker?c.shared:new c,e.autoStart&&this.start()}static destroy(){if(this._ticker){let e=this._ticker;this.ticker=null,e.destroy()}}};O.extension=x.Application,y.add(D),y.add(O);var k=class e{constructor(...e){this.stage=new g,e[0]!==void 0&&n(h,`Application constructor options are deprecated, please use Application.init() instead.`)}async init(t){t={...t},this.stage||=new g,this.renderer=await Se(t),e._plugins.forEach(e=>{e.init.call(this,t)})}render(){this.renderer.render({container:this.stage})}get canvas(){return this.renderer.canvas}get view(){return n(h,`Application.view is deprecated, please use Application.canvas instead.`),this.renderer.canvas}get screen(){return this.renderer.screen}get domContainerRoot(){return this.renderer.renderPipes.dom?._domElement}destroy(t=!1,n=!1){let r=e._plugins.slice(0);r.reverse(),r.forEach(e=>{e.destroy.call(this)}),this.stage.destroy(n),this.stage=null,this.renderer.destroy(t),this.renderer=null}};k._plugins=[];var A=k;y.handleByList(x.Application,A._plugins),y.add(ge);var j=class{execute(e,t){let n=e.renderer,r=n.canvasContext.activeContext,i=t.particleChildren,a=t.texture;r.save(),n.canvasContext.setContextTransform(t.worldTransform,t.roundPixels),n.canvasContext.setBlendMode(t.groupBlendMode);let o=t.groupColorAlpha,s=n.filter?.alphaMultiplier??1,c=(o>>>24&255)/255*s;for(let e=0;e<i.length;e++){let t=i[e],n=t.texture||a;if(!n?.source?.resource)continue;let o=t.color,s=(o>>>24&255)/255*c;if(s<=0)continue;let l=o&16777215,u=((l&255)<<16)+(l&65280)+(l>>16&255),d=n.source.resource;u!==16777215&&(d=pe.getTintedCanvas({texture:n},u));let f=n.frame,p=n.source.resolution,m=f.x*p,h=f.y*p,g=f.width*p,_=f.height*p;r.globalAlpha=s;let v=-t.anchorX*f.width,y=-t.anchorY*f.height;t.rotation!==0||t.scaleX!==1||t.scaleY!==1?(r.save(),r.translate(t.x,t.y),r.rotate(t.rotation),r.scale(t.scaleX,t.scaleY),r.drawImage(d,m,h,g,_,v,y,f.width,f.height),r.restore()):r.drawImage(d,m,h,g,_,t.x+v,t.y+y,f.width,f.height)}r.restore()}};function M(e,t=null){let n=e*6;if(t||=n>65535?new Uint32Array(n):new Uint16Array(n),t.length!==n)throw Error(`Out buffer length is incorrect, got ${t.length} and expected ${n}`);for(let e=0,r=0;e<n;e+=6,r+=4)t[e+0]=r+0,t[e+1]=r+1,t[e+2]=r+2,t[e+3]=r+0,t[e+4]=r+2,t[e+5]=r+3;return t}function N(e){return{dynamicUpdate:Ce(e,!0),staticUpdate:Ce(e,!1)}}function Ce(e,t){let n=[];n.push(`

        var index = 0;

        for (let i = 0; i < ps.length; ++i)
        {
            const p = ps[i];

            `);let r=0;for(let i in e){let o=e[i];if(t!==o.dynamic)continue;n.push(`offset = index + ${r}`),n.push(o.code);let s=a(o.format);r+=s.stride/4}n.push(`
            index += stride * 4;
        }
    `),n.unshift(`
        var stride = ${r};
    `);let i=n.join(`
`);return Function(`ps`,`f32v`,`u32v`,i)}var we=class{constructor(e){this._size=0,this._generateParticleUpdateCache={};let t=this._size=e.size??1e3,n=e.properties,r=0,i=0;for(let e in n){let t=n[e],o=a(t.format);t.dynamic?i+=o.stride:r+=o.stride}this._dynamicStride=i/4,this._staticStride=r/4,this.staticAttributeBuffer=new w(t*4*r),this.dynamicAttributeBuffer=new w(t*4*i),this.indexBuffer=M(t);let o=new ne,s=0,c=0;this._staticBuffer=new ee({data:new Float32Array(1),label:`static-particle-buffer`,shrinkToFit:!1,usage:b.VERTEX|b.COPY_DST}),this._dynamicBuffer=new ee({data:new Float32Array(1),label:`dynamic-particle-buffer`,shrinkToFit:!1,usage:b.VERTEX|b.COPY_DST});for(let e in n){let t=n[e],r=a(t.format);t.dynamic?(o.addAttribute(t.attributeName,{buffer:this._dynamicBuffer,stride:this._dynamicStride*4,offset:s*4,format:t.format}),s+=r.size):(o.addAttribute(t.attributeName,{buffer:this._staticBuffer,stride:this._staticStride*4,offset:c*4,format:t.format}),c+=r.size)}o.addIndex(this.indexBuffer);let l=this.getParticleUpdate(n);this._dynamicUpload=l.dynamicUpdate,this._staticUpload=l.staticUpdate,this.geometry=o}getParticleUpdate(e){let t=Te(e);return this._generateParticleUpdateCache[t]||(this._generateParticleUpdateCache[t]=this.generateParticleUpdate(e)),this._generateParticleUpdateCache[t]}generateParticleUpdate(e){return N(e)}update(e,t){e.length>this._size&&(t=!0,this._size=Math.max(e.length,this._size*1.5|0),this.staticAttributeBuffer=new w(this._size*this._staticStride*4*4),this.dynamicAttributeBuffer=new w(this._size*this._dynamicStride*4*4),this.indexBuffer=M(this._size),this.geometry.indexBuffer.setDataWithSize(this.indexBuffer,this.indexBuffer.byteLength,!0));let n=this.dynamicAttributeBuffer;if(this._dynamicUpload(e,n.float32View,n.uint32View),this._dynamicBuffer.setDataWithSize(this.dynamicAttributeBuffer.float32View,e.length*this._dynamicStride*4,!0),t){let t=this.staticAttributeBuffer;this._staticUpload(e,t.float32View,t.uint32View),this._staticBuffer.setDataWithSize(t.float32View,e.length*this._staticStride*4,!0)}}destroy(){this._staticBuffer.destroy(),this._dynamicBuffer.destroy(),this.geometry.destroy()}};function Te(e){let t=[];for(let n in e){let r=e[n];t.push(n,r.code,r.dynamic?`d`:`s`)}return t.join(`_`)}var Ee=`varying vec2 vUV;
varying vec4 vColor;

uniform sampler2D uTexture;

void main(void){
    vec4 color = texture2D(uTexture, vUV) * vColor;
    gl_FragColor = color;
}`,De=`attribute vec2 aVertex;
attribute vec2 aUV;
attribute vec4 aColor;

attribute vec2 aPosition;
attribute float aRotation;

uniform mat3 uTranslationMatrix;
uniform float uRound;
uniform vec2 uResolution;
uniform vec4 uColor;

varying vec2 vUV;
varying vec4 vColor;

vec2 roundPixels(vec2 position, vec2 targetSize)
{       
    return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
}

void main(void){
    float cosRotation = cos(aRotation);
    float sinRotation = sin(aRotation);
    float x = aVertex.x * cosRotation - aVertex.y * sinRotation;
    float y = aVertex.x * sinRotation + aVertex.y * cosRotation;

    vec2 v = vec2(x, y);
    v = v + aPosition;

    gl_Position = vec4((uTranslationMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);

    if(uRound == 1.0)
    {
        gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
    }

    vUV = aUV;
    vColor = vec4(aColor.rgb * aColor.a, aColor.a) * uColor;
}
`,P=`
struct ParticleUniforms {
  uTranslationMatrix:mat3x3<f32>,
  uColor:vec4<f32>,
  uRound:f32,
  uResolution:vec2<f32>,
};

fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32>
{
  return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
}

@group(0) @binding(0) var<uniform> uniforms: ParticleUniforms;

@group(1) @binding(0) var uTexture: texture_2d<f32>;
@group(1) @binding(1) var uSampler : sampler;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
    @location(1) color : vec4<f32>,
  };
@vertex
fn mainVertex(
  @location(0) aVertex: vec2<f32>,
  @location(1) aPosition: vec2<f32>,
  @location(2) aUV: vec2<f32>,
  @location(3) aColor: vec4<f32>,
  @location(4) aRotation: f32,
) -> VSOutput {
  
   let v = vec2(
       aVertex.x * cos(aRotation) - aVertex.y * sin(aRotation),
       aVertex.x * sin(aRotation) + aVertex.y * cos(aRotation)
   ) + aPosition;

   var position = vec4((uniforms.uTranslationMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);

   if(uniforms.uRound == 1.0) {
       position = vec4(roundPixels(position.xy, uniforms.uResolution), position.zw);
   }

    let vColor = vec4(aColor.rgb * aColor.a, aColor.a) * uniforms.uColor;

  return VSOutput(
   position,
   aUV,
   vColor,
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) color: vec4<f32>,
  @builtin(position) position: vec4<f32>,
) -> @location(0) vec4<f32> {

    var sample = textureSample(uTexture, uSampler, uv) * color;
   
    return sample;
}`,Oe=class extends _{constructor(){let t=r.from({vertex:De,fragment:Ee}),n=ae.from({fragment:{source:P,entryPoint:`mainFragment`},vertex:{source:P,entryPoint:`mainVertex`}});super({glProgram:t,gpuProgram:n,resources:{uTexture:e.WHITE.source,uSampler:new f({}),uniforms:{uTranslationMatrix:{value:new l,type:`mat3x3<f32>`},uColor:{value:new i(16777215),type:`vec4<f32>`},uRound:{value:1,type:`f32`},uResolution:{value:[0,0],type:`vec2<f32>`}}}})}},F=class{constructor(e,t){this.state=ie.for2d(),this.localUniforms=new v({uTranslationMatrix:{value:new l,type:`mat3x3<f32>`},uColor:{value:new Float32Array(4),type:`vec4<f32>`},uRound:{value:1,type:`f32`},uResolution:{value:[0,0],type:`vec2<f32>`}}),this.renderer=e,this.adaptor=t,this.defaultShader=new Oe,this.state=ie.for2d(),this._managedContainers=new _e({renderer:e,type:`renderable`,name:`particleContainer`})}validateRenderable(e){return!1}addRenderable(e,t){this.renderer.renderPipes.batch.break(t),t.add(e)}getBuffers(e){return e._gpuData[this.renderer.uid]||this._initBuffer(e)}_initBuffer(e){return e._gpuData[this.renderer.uid]=new we({size:e.particleChildren.length,properties:e._properties}),this._managedContainers.add(e),e._gpuData[this.renderer.uid]}updateRenderable(e){}execute(e){let t=e.particleChildren;if(t.length===0)return;let n=this.renderer,r=this.getBuffers(e);e.texture||=t[0].texture;let i=this.state;r.update(t,e._childrenDirty),e._childrenDirty=!1,i.blendMode=ve(e.groupBlendMode,e.texture._source);let a=this.localUniforms.uniforms,o=a.uTranslationMatrix;e.worldTransform.copyTo(o);let s=n.globalUniforms.globalUniformData;o.tx-=s.offset.x,o.ty-=s.offset.y,o.prepend(s.projectionMatrix),a.uResolution=s.resolution,a.uRound=n._roundPixels|e._roundPixels;let c=e.groupColorAlpha,l=s.worldColor,u=(c>>>24)*(l>>>24)/255|0,d=te(c&16777215,l&16777215);he((u<<24|d)>>>0,a.uColor,0),this.adaptor.execute(this,e)}destroy(){this._managedContainers.destroy(),this.renderer=null,this.defaultShader&&=(this.defaultShader.destroy(),null)}};F.extension={type:[x.CanvasPipes],name:`particle`};var I=class extends F{constructor(e){super(e,new j)}};I.extension={type:[x.CanvasPipes],name:`particle`};var ke=class{execute(e,t){let n=e.state,r=e.renderer,i=t.shader||e.defaultShader;i.resources.uTexture=t.texture._source,i.resources.uniforms=e.localUniforms;let a=r.gl,o=e.getBuffers(t);r.shader.bind(i),r.state.set(n),r.geometry.bind(o.geometry,i.glProgram);let s=o.geometry.indexBuffer.data.BYTES_PER_ELEMENT===2?a.UNSIGNED_SHORT:a.UNSIGNED_INT;a.drawElements(a.TRIANGLES,t.particleChildren.length*6,s,0)}},L=class extends F{constructor(e){super(e,new ke)}};L.extension={type:[x.WebGLPipes],name:`particle`};var Ae=class{execute(e,t){let n=e.renderer,r=t.shader||e.defaultShader;r.groups[0]=n.renderPipes.uniformBatch.getUniformBindGroup(e.localUniforms,!0),r.groups[1]=n.texture.getTextureBindGroup(t.texture);let i=e.state,a=e.getBuffers(t);n.encoder.draw({geometry:a.geometry,shader:t.shader||e.defaultShader,state:i,size:t.particleChildren.length*6})}},R=class extends F{constructor(e){super(e,new Ae)}};R.extension={type:[x.WebGPUPipes],name:`particle`};var je=class t{constructor(n){if(n instanceof e)this.texture=n,o(this,t.defaultOptions,{});else{let e={...t.defaultOptions,...n};o(this,e,{})}}get alpha(){return this._alpha}set alpha(e){this._alpha=Math.min(Math.max(e,0),1),this._updateColor()}get tint(){return re(this._tint)}set tint(e){this._tint=i.shared.setValue(e??16777215).toBgrNumber(),this._updateColor()}_updateColor(){this.color=this._tint+((this._alpha*255|0)<<24)}};je.defaultOptions={anchorX:0,anchorY:0,x:0,y:0,scaleX:1,scaleY:1,rotation:0,tint:16777215,alpha:1};var Me=je,z={vertex:{attributeName:`aVertex`,format:`float32x2`,code:`
            const texture = p.texture;
            const sx = p.scaleX;
            const sy = p.scaleY;
            const ax = p.anchorX;
            const ay = p.anchorY;
            const trim = texture.trim;
            const orig = texture.orig;

            if (trim)
            {
                w1 = trim.x - (ax * orig.width);
                w0 = w1 + trim.width;

                h1 = trim.y - (ay * orig.height);
                h0 = h1 + trim.height;
            }
            else
            {
                w1 = -ax * (orig.width);
                w0 = w1 + orig.width;

                h1 = -ay * (orig.height);
                h0 = h1 + orig.height;
            }

            f32v[offset] = w1 * sx;
            f32v[offset + 1] = h1 * sy;

            f32v[offset + stride] = w0 * sx;
            f32v[offset + stride + 1] = h1 * sy;

            f32v[offset + (stride * 2)] = w0 * sx;
            f32v[offset + (stride * 2) + 1] = h0 * sy;

            f32v[offset + (stride * 3)] = w1 * sx;
            f32v[offset + (stride * 3) + 1] = h0 * sy;
        `,dynamic:!1},position:{attributeName:`aPosition`,format:`float32x2`,code:`
            var x = p.x;
            var y = p.y;

            f32v[offset] = x;
            f32v[offset + 1] = y;

            f32v[offset + stride] = x;
            f32v[offset + stride + 1] = y;

            f32v[offset + (stride * 2)] = x;
            f32v[offset + (stride * 2) + 1] = y;

            f32v[offset + (stride * 3)] = x;
            f32v[offset + (stride * 3) + 1] = y;
        `,dynamic:!0},rotation:{attributeName:`aRotation`,format:`float32`,code:`
            var rotation = p.rotation;

            f32v[offset] = rotation;
            f32v[offset + stride] = rotation;
            f32v[offset + (stride * 2)] = rotation;
            f32v[offset + (stride * 3)] = rotation;
        `,dynamic:!1},uvs:{attributeName:`aUV`,format:`float32x2`,code:`
            var uvs = p.texture.uvs;

            f32v[offset] = uvs.x0;
            f32v[offset + 1] = uvs.y0;

            f32v[offset + stride] = uvs.x1;
            f32v[offset + stride + 1] = uvs.y1;

            f32v[offset + (stride * 2)] = uvs.x2;
            f32v[offset + (stride * 2) + 1] = uvs.y2;

            f32v[offset + (stride * 3)] = uvs.x3;
            f32v[offset + (stride * 3) + 1] = uvs.y3;
        `,dynamic:!1},color:{attributeName:`aColor`,format:`unorm8x4`,code:`
            const c = p.color;

            u32v[offset] = c;
            u32v[offset + stride] = c;
            u32v[offset + (stride * 2)] = c;
            u32v[offset + (stride * 3)] = c;
        `,dynamic:!1}};y.add(L),y.add(R),y.add(I);var Ne=new d(0,0,0,0),Pe=class e extends m{constructor(t={}){t={...e.defaultOptions,...t,dynamicProperties:{...e.defaultOptions.dynamicProperties,...t?.dynamicProperties}};let{dynamicProperties:n,shader:r,roundPixels:i,texture:a,particles:o,...s}=t;super({label:`ParticleContainer`,...s}),this.renderPipeId=`particle`,this.batched=!1,this._childrenDirty=!1,this.texture=a||null,this.shader=r,this._properties={};for(let e in z){let t=z[e],r=n[e];this._properties[e]={...t,dynamic:r}}this.allowChildren=!0,this.roundPixels=i??!1,this.particleChildren=o??[]}addParticle(...e){for(let t=0;t<e.length;t++)this.particleChildren.push(e[t]);return this.onViewUpdate(),e[0]}removeParticle(...e){let t=!1;for(let n=0;n<e.length;n++){let r=this.particleChildren.indexOf(e[n]);r>-1&&(this.particleChildren.splice(r,1),t=!0)}return t&&this.onViewUpdate(),e[0]}update(){this._childrenDirty=!0}onViewUpdate(){this._childrenDirty=!0,super.onViewUpdate()}get bounds(){return Ne}updateBounds(){}destroy(e=!1){if(super.destroy(e),typeof e==`boolean`?e:e?.texture){let t=typeof e==`boolean`?e:e?.textureSource,n=this.texture??this.particleChildren[0]?.texture;n&&n.destroy(t)}this.texture=null,this.shader?.destroy()}removeParticles(e,t){e??=0,t??=this.particleChildren.length;let n=this.particleChildren.splice(e,t-e);return this.onViewUpdate(),n}removeParticleAt(e){let t=this.particleChildren.splice(e,1);return this.onViewUpdate(),t[0]}addParticleAt(e,t){return this.particleChildren.splice(t,0,e),this.onViewUpdate(),e}addChild(...e){throw Error(`ParticleContainer.addChild() is not available. Please use ParticleContainer.addParticle()`)}removeChild(...e){throw Error(`ParticleContainer.removeChild() is not available. Please use ParticleContainer.removeParticle()`)}removeChildren(e,t){throw Error(`ParticleContainer.removeChildren() is not available. Please use ParticleContainer.removeParticles()`)}removeChildAt(e){throw Error(`ParticleContainer.removeChildAt() is not available. Please use ParticleContainer.removeParticleAt()`)}getChildAt(e){throw Error(`ParticleContainer.getChildAt() is not available. Please use ParticleContainer.getParticleAt()`)}setChildIndex(e,t){throw Error(`ParticleContainer.setChildIndex() is not available. Please use ParticleContainer.setParticleIndex()`)}getChildIndex(e){throw Error(`ParticleContainer.getChildIndex() is not available. Please use ParticleContainer.getParticleIndex()`)}addChildAt(e,t){throw Error(`ParticleContainer.addChildAt() is not available. Please use ParticleContainer.addParticleAt()`)}swapChildren(e,t){throw Error(`ParticleContainer.swapChildren() is not available. Please use ParticleContainer.swapParticles()`)}reparentChild(...e){throw Error(`ParticleContainer.reparentChild() is not available with the particle container`)}reparentChildAt(e,t){throw Error(`ParticleContainer.reparentChildAt() is not available with the particle container`)}};Pe.defaultOptions={dynamicProperties:{vertex:!1,position:!0,rotation:!1,uvs:!1,color:!1},roundPixels:!1};var Fe=Pe,Ie=2048,Le=1024,Re=[1e4,3e4],B=document.getElementById(`map`),V=B.clientWidth,H=B.clientHeight,U=de(Ie,Le,150),W=document.createElement(`canvas`);W.width=V,W.height=H;var ze=W.getContext(`webgl2`,{preserveDrawingBuffer:!0}),G=new oe(ze,Ie,Le,{wrapX:!0});U.colors.forEach((e,t)=>G.setColor(t,e)),G.setGrid(U.owner,U.controller),G.draw({...C},1);var K=new A;await K.init({canvas:B,width:V,height:H,resolution:1,antialias:!1,preference:`webgl`,autoStart:!1,powerPreference:`high-performance`,preserveDrawingBuffer:!0});var q=K.renderer.gl,Be=q.getExtension(`WEBGL_debug_renderer_info`),Ve=String(Be?q.getParameter(Be.UNMASKED_RENDERER_WEBGL):q.getParameter(q.RENDERER)),He=new le(q);K.stage.addChild(new s(e.from(W)));var Ue=e.from(se()),We=Array.from({length:ce},(t,n)=>new e({source:Ue.source,frame:new u(n*64,0,64,64)})),J=null,Y=null,X=0,Z=[];function Q(e){J&&(K.stage.removeChild(J),J.destroy()),Y=new fe(e,V,H,U.colors),J=new Fe({dynamicProperties:{position:!0,rotation:!0,vertex:!1,uvs:!1,color:!1}});for(let t=0;t<e;t++){let e=Math.max(Y.size[t]*C.scale,3)/64;J.addParticle(new Me({texture:We[Y.frame[t]],anchorX:.5,anchorY:.5,scaleX:e,scaleY:e,tint:Y.color[t]}))}K.stage.addChild(J)}function $(e){let t=Y,n=Math.min(1,(e-X)*10/1e3),r=J.particleChildren,i=C.scale;for(let e=0;e<t.n;e++){let a=r[e];a.x=(t.prevX[e]+(t.x[e]-t.prevX[e])*n-C.cx)*i+V/2,a.y=(t.prevY[e]+(t.y[e]-t.prevY[e])*n-C.cy)*i+H/2,a.rotation=t.heading[e]}}function Ge(e){if(e-X>=100){let t=performance.now();Y.step(),Z.push(performance.now()-t),X=e}$(e),K.render()}async function Ke(e){Q(e),X=performance.now(),Z.length=0;let t=await ue(3,Ge),n=0,r=await He.measure(()=>{$(X+n++%10*10),K.render()},30),i=[...Z].sort((e,t)=>e-t);return{proxies:e,...t,gpuFrameMs:r,gpuUnitsMs:NaN,tickUploadMsP50:i[Math.floor(i.length/2)]??NaN}}async function qe(){let e=[];for(let t of Re)e.push(await Ke(t));return{stack:`PixiJS ${(await S(async()=>{let{VERSION:e}=await import(`./lib-BKEpt85C.js`);return{VERSION:e}},__vite__mapDeps([11,2,12,13,14,10,3,9,4,15,5,7,1,16]),import.meta.url)).VERSION} ParticleContainer (CPU interpolation)`,renderer:Ve,viewport:[V,H],dpr:1,cases:e}}window.__bench={ready:Promise.resolve(),run:qe,setCamera:async()=>{$(performance.now()),K.render(),await new Promise(e=>requestAnimationFrame(()=>e(void 0)))}},Q(Re[0]),X=performance.now(),$(X),K.render();export{ye as C,be as S,j as _,Ae as a,D as b,I as c,P as d,De as f,M as g,N as h,R as i,F as l,we as m,z as n,L as o,Ee as p,Me as r,ke as s,Fe as t,Oe as u,A as v,Se as x,O as y};
//# sourceMappingURL=benchBP-DWeCCIqh.js.map