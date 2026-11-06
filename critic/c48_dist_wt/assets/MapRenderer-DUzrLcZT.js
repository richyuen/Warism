var e=[`political`,`alliances`,`puppets`,`terrain`,`wars`,`diplomacy`,`income`,`revolts`,`seaControl`,`airControl`,`fallout`],t=11842732,n=12597547,r=11842732,i=15844367,a=3055195,o=12597547,s=9425310,c=11842732,l=16052694,u=1470522,d=.5,f=.65,p=.55,m=14705450,h=65535,g=13035578,_=.55,v=.85;function ee(e,t){return te(e,16777215,t)}function te(e,t,n){let r=r=>Math.round((e>>r&255)*(1-n)+(t>>r&255)*n);return r(16)<<16|r(8)<<8|r(0)}var ne={self:i,ally:a,enemy:o,subject:s,neutral:c},re=.45;function ie(e,i){switch(e){case`alliances`:return i.allianceLeader??11842732;case`puppets`:return i.overlord===null?i.hasPuppets?i.own:t:ee(i.overlord,re);case`wars`:return i.atWar?n:r;case`diplomacy`:return!i.relation||i.relation===`none`?i.own:ne[i.relation];case`income`:return te(l,u,Math.max(0,Math.min(1,i.incomeT??0)));default:return i.own}}function y(e){switch(e){case`political`:return[[null,`legend.political`],[null,`legend.occupied`]];case`alliances`:return[[null,`legend.alliance`],[t,`legend.nonAligned`]];case`puppets`:return[[null,`legend.overlord`],[ee(7829367,re),`legend.puppet`],[t,`legend.independent`]];case`terrain`:return[[null,`legend.terrain`]];case`wars`:return[[n,`legend.atWar`],[r,`legend.atPeace`]];case`diplomacy`:return[[i,`legend.selected`],[a,`legend.ally`],[o,`legend.enemy`],[s,`legend.subject`],[c,`legend.neutral`],[null,`legend.selectHint`]];case`income`:return[[l,`legend.incomeLow`],[u,`legend.incomeHigh`]];case`revolts`:return[[15262671,`legend.calm`],[15769680,`legend.mayRevolt`],[9313296,`legend.revoltLikely`]];case`seaControl`:return[[null,`legend.seaHeld`],[null,`legend.seaOpen`]];case`airControl`:return[[null,`legend.airHeld`],[m,`legend.airContested`],[null,`legend.airOpen`]];case`fallout`:return[[g,`legend.falloutHeavy`],[11121530,`legend.falloutLight`],[null,`legend.falloutClean`]]}}var b=[`water`,`crossing`,`plains`,`grassland`,`forest`,`hills`,`mountains`,`desert`,`tundra`,`marsh`,`urban`,`ice`],x={Water:0,Crossing:1,Plains:2,Grassland:3,Forest:4,Hills:5,Mountains:6,Desert:7,Tundra:8,Marsh:9,Urban:10,Ice:11};function ae(e){return e>=x.Plains}function oe(e){let t=Math.floor(e);return[t,e-t]}function se(e,t,n){let r=n/e.h;return e.wrapX?r*.9:Math.min(t/e.w,r)*.9}function ce(e){return e.kmPerCell*1e3}function le(e,t,n,r){let i=Math.min(ce(t),Math.max(se(t,n,r),e.scale)),a=e.cx;a=t.wrapX?(a%t.w+t.w)%t.w:ue(a,t.w,n/i);let o=ue(e.cy,t.h,r/i);return{cx:a,cy:o,scale:i}}function ue(e,t,n){return n>=t?t/2:Math.min(t-n/2,Math.max(n/2,e))}function de(e,t,n,r,i){return[e.cx+(t-r/2)/e.scale,e.cy+(n-i/2)/e.scale]}function fe(e,t,n){let r=Math.floor(t),i=Math.floor(n);return i<0||i>=e.h||!e.wrapX&&(r<0||r>=e.w)?null:[(r%e.w+e.w)%e.w,i]}function pe(e,t,n,r,i){return[(t-e.cx)*e.scale+r/2,(n-e.cy)*e.scale+i/2]}function me(e,t,n,r,i,a){let[o,s]=de(e,n,r,i,a),c=e.scale*t;return{scale:c,cx:o-(n-i/2)/c,cy:s-(r-a/2)/c}}function he(e,t,n){return{...e,cx:e.cx-t/e.scale,cy:e.cy-n/e.scale}}function ge(e,t,n,r=0){if(!t.wrapX)return[0];let i=n/2/e.scale+r,a=[],o=Math.floor((e.cx-i)/t.w),s=Math.floor((e.cx+i)/t.w);for(let e=o;e<=s;e++)a.push(e*t.w);return a}function _e(e,t,n){return ge(e,t,n,160/e.scale)}var S=Math.SQRT2,ve=320,ye=250,be=1600;function xe(e,t,n,r){let i=t.cx-e.cx;n.wrapX&&(i-=Math.round(i/n.w)*n.w);let a=t.cy-e.cy,o=r/e.scale,s=r/t.scale,c=Math.hypot(i,a),l=S*S,u=c<Math.min(o,s)*.001,d=u?0:-Math.asinh((s*s-o*o+l*l*c*c)/(2*o*l*c)),f=u?0:-Math.asinh((s*s-o*o-l*l*c*c)/(2*s*l*c)),p=u?Math.abs(Math.log(s/o))/S:(f-d)/S;return{ms:Math.min(be,Math.max(ye,p*S*ve)),at:n=>{if(n<=0)return e;if(n>=1)return t;let s=n<.5?4*n*n*n:1-(-2*n+2)**3/2;if(u)return{cx:e.cx+i*s,cy:e.cy+a*s,scale:e.scale*(t.scale/e.scale)**+s};let f=s*p,m=o/(l*c)*(Math.cosh(d)*Math.tanh(S*f+d)-Math.sinh(d)),h=o*Math.cosh(d)/Math.cosh(S*f+d);return{cx:e.cx+m*i,cy:e.cy+m*a,scale:r/h}}}}var Se=5120,Ce=5121,we=5122,Te=5123,Ee=5124,De=5125,Oe=5126,ke=32819,Ae=32820,je=33635,Me=5131,Ne=33640,Pe=35899,Fe=35902,Ie=36269,Le=34042,Re={};{let e=Re;e[Se]=Int8Array,e[Ce]=Uint8Array,e[we]=Int16Array,e[Te]=Uint16Array,e[Ee]=Int32Array,e[De]=Uint32Array,e[Oe]=Float32Array,e[ke]=Uint16Array,e[Ae]=Uint16Array,e[je]=Uint16Array,e[Me]=Uint16Array,e[Ne]=Uint32Array,e[Pe]=Uint32Array,e[Fe]=Uint32Array,e[Ie]=Uint32Array,e[Le]=Uint32Array}function ze(e){if(e instanceof Int8Array)return Se;if(e instanceof Uint8Array||e instanceof Uint8ClampedArray)return Ce;if(e instanceof Int16Array)return we;if(e instanceof Uint16Array)return Te;if(e instanceof Int32Array)return Ee;if(e instanceof Uint32Array)return De;if(e instanceof Float32Array)return Oe;throw Error(`unsupported typed array type`)}function Be(e){let t=Re[e];if(!t)throw Error(`unknown gl type`);return t}var Ve=typeof SharedArrayBuffer<`u`?function(e){return e&&e.buffer&&(e.buffer instanceof ArrayBuffer||e.buffer instanceof SharedArrayBuffer)}:function(e){return e&&e.buffer&&e.buffer instanceof ArrayBuffer};function He(...e){console.error(...e)}var Ue=new Map;function We(e,t){if(!e||typeof e!=`object`)return!1;let n=Ue.get(t);n||(n=new WeakMap,Ue.set(t,n));let r=n.get(e);if(r===void 0){let i=Object.prototype.toString.call(e);r=i.substring(8,i.length-1)===t,n.set(e,r)}return r}function Ge(e,t){return typeof WebGLTexture<`u`&&We(t,`WebGLTexture`)}function Ke(e,t){return typeof WebGLSampler<`u`&&We(t,`WebGLSampler`)}function qe(e){return!!e.texStorage2D}var Je=function(){let e={},t={};function n(n){let r=n.constructor.name;if(!e[r]){for(let e in n)if(typeof n[e]==`number`){let r=t[n[e]];t[n[e]]=r?`${r} | ${e}`:e}e[r]=!0}}return function(e,r){return n(e),t[r]||(typeof r==`number`?`0x${r.toString(16)}`:r)}}(),Ye=void 0,C={textureColor:new Uint8Array([128,192,255,255]),textureOptions:{},crossOrigin:void 0},Xe=Ve,Ze=function(){let e;return function(){return e||=typeof document<`u`&&document.createElement?document.createElement(`canvas`).getContext(`2d`):null,e}}(),Qe=6406,w=6407,T=6408,$e=6409,et=6410,E=6402,tt=34041,nt=33071,rt=9728,it=9729,at=9986,D=3553,O=34067,k=32879,A=35866,ot=34069,st=34070,ct=34071,lt=34072,ut=34073,dt=34074,ft=10241,pt=10240,mt=10242,ht=10243,gt=32882,_t=33082,vt=33083,yt=33084,bt=33085,xt=34892,St=34893,Ct=3317,wt=3314,Tt=32878,Et=3316,Dt=3315,Ot=32877,kt=37443,At=37441,jt=37440,Mt=33321,Nt=36756,Pt=33325,Ft=33326,It=33330,Lt=33329,Rt=33338,zt=33337,Bt=33340,Vt=33339,Ht=33323,Ut=36757,Wt=33327,Gt=33328,Kt=33336,qt=33335,Jt=33332,Yt=33331,Xt=33334,Zt=33333,Qt=32849,$t=35905,en=36194,tn=36758,nn=35898,rn=35901,an=34843,on=34837,sn=36221,cn=36239,ln=36215,un=36233,dn=36209,fn=36227,pn=32856,mn=35907,hn=36759,gn=32855,_n=32854,vn=32857,yn=34842,bn=34836,xn=36220,Sn=36238,Cn=36975,wn=36214,Tn=36232,En=36226,Dn=36208,On=33189,kn=33190,An=36012,jn=36013,Mn=35056,j=5120,M=5121,Nn=5122,N=5123,Pn=5124,P=5125,F=5126,Fn=32819,In=32820,Ln=33635,I=5131,L=36193,Rn=33640,zn=35899,Bn=35902,Vn=36269,Hn=34042,R=33319,z=33320,B=6403,V=36244,H=36248,U=36249,Un=33776,Wn=33777,Gn=33778,Kn=33779,qn=35916,Jn=35917,Yn=35918,Xn=35919,Zn=36196,Qn=37488,$n=37489,er=37490,tr=37491,nr=37492,rr=37493,ir=37494,ar=37495,or=37496,sr=37497,cr=35840,lr=35841,ur=35842,dr=35843,fr=37808,pr=37809,mr=37810,hr=37811,gr=37812,_r=37813,vr=37814,yr=37815,br=37816,xr=37817,Sr=37818,Cr=37819,wr=37820,Tr=37821,Er=37840,Dr=37841,Or=37842,kr=37843,Ar=37844,jr=37845,Mr=37846,Nr=37847,Pr=37848,Fr=37849,Ir=37850,Lr=37851,Rr=37852,zr=37853,Br=36492,Vr=36493,Hr=36494,Ur=36495,Wr=36283,Gr=36284,Kr=36285,qr=36286,Jr={};{let e=Jr;e[Qe]={numColorComponents:1},e[$e]={numColorComponents:1},e[et]={numColorComponents:2},e[w]={numColorComponents:3},e[T]={numColorComponents:4},e[B]={numColorComponents:1},e[V]={numColorComponents:1},e[R]={numColorComponents:2},e[z]={numColorComponents:2},e[w]={numColorComponents:3},e[H]={numColorComponents:3},e[T]={numColorComponents:4},e[U]={numColorComponents:4},e[E]={numColorComponents:1},e[tt]={numColorComponents:2}}var Yr;function W(e){if(!Yr){let e={};e[Qe]={textureFormat:Qe,colorRenderable:!0,textureFilterable:!0,bytesPerElement:[1,2,2,4],type:[M,I,L,F]},e[$e]={textureFormat:$e,colorRenderable:!0,textureFilterable:!0,bytesPerElement:[1,2,2,4],type:[M,I,L,F]},e[et]={textureFormat:et,colorRenderable:!0,textureFilterable:!0,bytesPerElement:[2,4,4,8],type:[M,I,L,F]},e[w]={textureFormat:w,colorRenderable:!0,textureFilterable:!0,bytesPerElement:[3,6,6,12,2],type:[M,I,L,F,Ln]},e[T]={textureFormat:T,colorRenderable:!0,textureFilterable:!0,bytesPerElement:[4,8,8,16,2,2],type:[M,I,L,F,Fn,In]},e[E]={textureFormat:E,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[2,4],type:[P,N]},e[Mt]={textureFormat:B,colorRenderable:!0,textureFilterable:!0,bytesPerElement:[1],type:[M]},e[Nt]={textureFormat:B,colorRenderable:!1,textureFilterable:!0,bytesPerElement:[1],type:[j]},e[Pt]={textureFormat:B,colorRenderable:!1,textureFilterable:!0,bytesPerElement:[4,2],type:[F,I]},e[Ft]={textureFormat:B,colorRenderable:!1,textureFilterable:!1,bytesPerElement:[4],type:[F]},e[It]={textureFormat:V,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[1],type:[M]},e[Lt]={textureFormat:V,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[1],type:[j]},e[Jt]={textureFormat:V,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[2],type:[N]},e[Yt]={textureFormat:V,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[2],type:[Nn]},e[Xt]={textureFormat:V,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[4],type:[P]},e[Zt]={textureFormat:V,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[4],type:[Pn]},e[Ht]={textureFormat:R,colorRenderable:!0,textureFilterable:!0,bytesPerElement:[2],type:[M]},e[Ut]={textureFormat:R,colorRenderable:!1,textureFilterable:!0,bytesPerElement:[2],type:[j]},e[Wt]={textureFormat:R,colorRenderable:!1,textureFilterable:!0,bytesPerElement:[8,4],type:[F,I]},e[Gt]={textureFormat:R,colorRenderable:!1,textureFilterable:!1,bytesPerElement:[8],type:[F]},e[Kt]={textureFormat:z,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[2],type:[M]},e[qt]={textureFormat:z,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[2],type:[j]},e[Rt]={textureFormat:z,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[4],type:[N]},e[zt]={textureFormat:z,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[4],type:[Nn]},e[Bt]={textureFormat:z,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[8],type:[P]},e[Vt]={textureFormat:z,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[8],type:[Pn]},e[Qt]={textureFormat:w,colorRenderable:!0,textureFilterable:!0,bytesPerElement:[3],type:[M]},e[$t]={textureFormat:w,colorRenderable:!1,textureFilterable:!0,bytesPerElement:[3],type:[M]},e[en]={textureFormat:w,colorRenderable:!0,textureFilterable:!0,bytesPerElement:[3,2],type:[M,Ln]},e[tn]={textureFormat:w,colorRenderable:!1,textureFilterable:!0,bytesPerElement:[3],type:[j]},e[nn]={textureFormat:w,colorRenderable:!1,textureFilterable:!0,bytesPerElement:[12,6,4],type:[F,I,zn]},e[rn]={textureFormat:w,colorRenderable:!1,textureFilterable:!0,bytesPerElement:[12,6,4],type:[F,I,Bn]},e[an]={textureFormat:w,colorRenderable:!1,textureFilterable:!0,bytesPerElement:[12,6],type:[F,I]},e[on]={textureFormat:w,colorRenderable:!1,textureFilterable:!1,bytesPerElement:[12],type:[F]},e[sn]={textureFormat:H,colorRenderable:!1,textureFilterable:!1,bytesPerElement:[3],type:[M]},e[cn]={textureFormat:H,colorRenderable:!1,textureFilterable:!1,bytesPerElement:[3],type:[j]},e[ln]={textureFormat:H,colorRenderable:!1,textureFilterable:!1,bytesPerElement:[6],type:[N]},e[un]={textureFormat:H,colorRenderable:!1,textureFilterable:!1,bytesPerElement:[6],type:[Nn]},e[dn]={textureFormat:H,colorRenderable:!1,textureFilterable:!1,bytesPerElement:[12],type:[P]},e[fn]={textureFormat:H,colorRenderable:!1,textureFilterable:!1,bytesPerElement:[12],type:[Pn]},e[pn]={textureFormat:T,colorRenderable:!0,textureFilterable:!0,bytesPerElement:[4],type:[M]},e[mn]={textureFormat:T,colorRenderable:!0,textureFilterable:!0,bytesPerElement:[4],type:[M]},e[hn]={textureFormat:T,colorRenderable:!1,textureFilterable:!0,bytesPerElement:[4],type:[j]},e[gn]={textureFormat:T,colorRenderable:!0,textureFilterable:!0,bytesPerElement:[4,2,4],type:[M,In,Rn]},e[_n]={textureFormat:T,colorRenderable:!0,textureFilterable:!0,bytesPerElement:[4,2],type:[M,Fn]},e[vn]={textureFormat:T,colorRenderable:!0,textureFilterable:!0,bytesPerElement:[4],type:[Rn]},e[yn]={textureFormat:T,colorRenderable:!1,textureFilterable:!0,bytesPerElement:[16,8],type:[F,I]},e[bn]={textureFormat:T,colorRenderable:!1,textureFilterable:!1,bytesPerElement:[16],type:[F]},e[xn]={textureFormat:U,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[4],type:[M]},e[Sn]={textureFormat:U,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[4],type:[j]},e[Cn]={textureFormat:U,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[4],type:[Rn]},e[wn]={textureFormat:U,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[8],type:[N]},e[Tn]={textureFormat:U,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[8],type:[Nn]},e[En]={textureFormat:U,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[16],type:[Pn]},e[Dn]={textureFormat:U,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[16],type:[P]},e[On]={textureFormat:E,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[2,4],type:[N,P]},e[kn]={textureFormat:E,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[4],type:[P]},e[An]={textureFormat:E,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[4],type:[F]},e[Mn]={textureFormat:tt,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[4],type:[Hn]},e[jn]={textureFormat:tt,colorRenderable:!0,textureFilterable:!1,bytesPerElement:[4],type:[Vn]},Object.keys(e).forEach(function(t){let n=e[t];n.bytesPerElementMap={},n.bytesPerElement.forEach(function(e,t){let r=n.type[t];n.bytesPerElementMap[r]=e})});let t={bytes:8,width:4,height:4},n={bytes:16,width:4,height:4};e[Un]={textureFormat:Un,colorRenderable:!1,textureFilterable:!0,block:t},e[Wn]={textureFormat:Wn,colorRenderable:!1,textureFilterable:!0,block:t},e[Gn]={textureFormat:Gn,colorRenderable:!1,textureFilterable:!0,block:n},e[Kn]={textureFormat:Kn,colorRenderable:!1,textureFilterable:!0,block:n},e[qn]={textureFormat:qn,colorRenderable:!1,textureFilterable:!0,block:t},e[Jn]={textureFormat:Jn,colorRenderable:!1,textureFilterable:!0,block:t},e[Yn]={textureFormat:Yn,colorRenderable:!1,textureFilterable:!0,block:n},e[Xn]={textureFormat:Xn,colorRenderable:!1,textureFilterable:!0,block:n},e[Zn]={textureFormat:Zn,colorRenderable:!1,textureFilterable:!0,block:t},e[Qn]={textureFormat:Qn,colorRenderable:!1,textureFilterable:!0,block:t},e[$n]={textureFormat:$n,colorRenderable:!1,textureFilterable:!0,block:t},e[er]={textureFormat:er,colorRenderable:!1,textureFilterable:!0,block:n},e[tr]={textureFormat:tr,colorRenderable:!1,textureFilterable:!0,block:n},e[nr]={textureFormat:nr,colorRenderable:!1,textureFilterable:!0,block:t},e[rr]={textureFormat:rr,colorRenderable:!1,textureFilterable:!0,block:t},e[ir]={textureFormat:ir,colorRenderable:!1,textureFilterable:!0,block:t},e[ar]={textureFormat:ar,colorRenderable:!1,textureFilterable:!0,block:t},e[or]={textureFormat:or,colorRenderable:!1,textureFilterable:!0,block:n},e[sr]={textureFormat:sr,colorRenderable:!1,textureFilterable:!0,block:n},e[cr]={textureFormat:cr,colorRenderable:!1,textureFilterable:!0,block:{bytes:32,width:8,height:8}},e[lr]={textureFormat:lr,colorRenderable:!1,textureFilterable:!0,block:{bytes:32,width:16,height:8}},e[ur]={textureFormat:ur,colorRenderable:!1,textureFilterable:!0,block:{bytes:32,width:8,height:8}},e[dr]={textureFormat:dr,colorRenderable:!1,textureFilterable:!0,block:{bytes:32,width:16,height:8}},e[fr]={textureFormat:fr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:4,height:4}},e[pr]={textureFormat:pr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:5,height:4}},e[mr]={textureFormat:mr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:5,height:5}},e[hr]={textureFormat:hr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:6,height:5}},e[gr]={textureFormat:gr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:6,height:6}},e[_r]={textureFormat:_r,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:8,height:5}},e[vr]={textureFormat:vr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:8,height:6}},e[yr]={textureFormat:yr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:8,height:8}},e[br]={textureFormat:br,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:10,height:5}},e[xr]={textureFormat:xr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:10,height:6}},e[Sr]={textureFormat:Sr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:10,height:8}},e[Cr]={textureFormat:Cr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:10,height:10}},e[wr]={textureFormat:wr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:12,height:10}},e[Tr]={textureFormat:Tr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:12,height:12}},e[Er]={textureFormat:Er,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:4,height:4}},e[Dr]={textureFormat:Dr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:5,height:4}},e[Or]={textureFormat:Or,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:5,height:5}},e[kr]={textureFormat:kr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:6,height:5}},e[Ar]={textureFormat:Ar,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:6,height:6}},e[jr]={textureFormat:jr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:8,height:5}},e[Mr]={textureFormat:Mr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:8,height:6}},e[Nr]={textureFormat:Nr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:8,height:8}},e[Pr]={textureFormat:Pr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:10,height:5}},e[Fr]={textureFormat:Fr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:10,height:6}},e[Ir]={textureFormat:Ir,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:10,height:8}},e[Lr]={textureFormat:Lr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:10,height:10}},e[Rr]={textureFormat:Rr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:12,height:10}},e[zr]={textureFormat:zr,colorRenderable:!1,textureFilterable:!0,block:{bytes:16,width:12,height:12}},e[Br]={textureFormat:Br,colorRenderable:!1,textureFilterable:!0,block:n},e[Vr]={textureFormat:Vr,colorRenderable:!1,textureFilterable:!0,block:n},e[Hr]={textureFormat:Hr,colorRenderable:!1,textureFilterable:!0,block:n},e[Ur]={textureFormat:Ur,colorRenderable:!1,textureFilterable:!0,block:n},e[Wr]={textureFormat:Wr,colorRenderable:!1,textureFilterable:!0,block:t},e[Gr]={textureFormat:Gr,colorRenderable:!1,textureFilterable:!0,block:t},e[Kr]={textureFormat:Kr,colorRenderable:!1,textureFilterable:!0,block:t},e[qr]={textureFormat:qr,colorRenderable:!1,textureFilterable:!0,block:t},Yr=e}let t=Yr[e];if(!t)throw Error(`unknown internal format`);return t}function Xr(e,t){let n=W(e).bytesPerElementMap[t];if(n===void 0)throw Error(`type not supported for internal format`);return n}function G(e){let t=W(e);if(!t)throw Error(`unknown internal format`);return{format:t.textureFormat,type:t.type?.[0]??M}}function Zr(e){return!!W(e).block}function Qr(e,t){let n=W(e);return n.block?{blockWidth:n.block.width,blockHeight:n.block.height,bytesPerBlock:n.block.bytes}:{blockWidth:1,blockHeight:1,bytesPerBlock:Xr(e,t)}}function $r(e){return!(e&e-1)}function ei(e,t,n,r){if(!qe(e))return $r(t)&&$r(n);let i=W(r);return i.colorRenderable&&i.textureFilterable}function ti(e){return W(e).textureFilterable}function ni(e,t,n){return Xe(t)?ze(t):n||M}function ri(e,t,n,r,i){if(i%1!=0)throw Error(`can't guess dimensions`);if(!n&&!r){let e=Math.sqrt(i/(t===O?6:1));e%1==0?(n=e,r=e):(n=i,r=1)}else if(!r){if(r=i/n,r%1)throw Error(`can't guess dimensions`)}else if(!n&&(n=i/r,n%1))throw Error(`can't guess dimensions`);return{width:n,height:r}}function K(e,t,n){let r,i,a;t.colorspaceConversion!==void 0&&(r=e.getParameter(kt),e.pixelStorei(kt,t.colorspaceConversion)),t.premultiplyAlpha!==void 0&&(i=e.getParameter(At),e.pixelStorei(At,t.premultiplyAlpha)),t.flipY!==void 0&&(a=e.getParameter(jt),e.pixelStorei(jt,t.flipY)),n(),r!==void 0&&e.pixelStorei(kt,r),i!==void 0&&e.pixelStorei(At,i),a!==void 0&&e.pixelStorei(jt,a)}function ii(e,t,n,r){let i=t[n];return{[n]:i===void 0?e.getParameter(r):i}}function ai(e,t){return{...t,...ii(e,t,`flipY`,jt),...ii(e,t,`premultiplyAlpha`,At),...ii(e,t,`colorspaceConversion`,kt)}}function oi(e){e.pixelStorei(Ct,4),qe(e)&&(e.pixelStorei(wt,0),e.pixelStorei(Tt,0),e.pixelStorei(Et,0),e.pixelStorei(Dt,0),e.pixelStorei(Ot,0))}function si(e,t,n,r){r.minMag&&(n.call(e,t,ft,r.minMag),n.call(e,t,pt,r.minMag)),r.min&&n.call(e,t,ft,r.min),r.mag&&n.call(e,t,pt,r.mag),r.wrap&&(n.call(e,t,mt,r.wrap),n.call(e,t,ht,r.wrap),(t===k||Ke(e,t))&&n.call(e,t,gt,r.wrap)),r.wrapR&&n.call(e,t,gt,r.wrapR),r.wrapS&&n.call(e,t,mt,r.wrapS),r.wrapT&&n.call(e,t,ht,r.wrapT),r.minLod!==void 0&&n.call(e,t,_t,r.minLod),r.maxLod!==void 0&&n.call(e,t,vt,r.maxLod),r.baseLevel!==void 0&&n.call(e,t,yt,r.baseLevel),r.maxLevel!==void 0&&n.call(e,t,bt,r.maxLevel),r.compareFunc!==void 0&&n.call(e,t,St,r.compareFunc),r.compareMode!==void 0&&n.call(e,t,xt,r.compareMode)}function ci(e,t,n){let r=n.target||D;e.bindTexture(r,t),si(e,r,e.texParameteri,n)}function li(e){return e||=C.textureColor,Xe(e)?e:new Uint8Array([e[0]*255,e[1]*255,e[2]*255,e[3]*255])}function ui(e,t,{options:n,width:r,height:i,internalFormat:a,lastMipLevelUploaded:o}){n||=C.textureOptions,a||=T;let s=n.target||D;if(r||=n.width,i||=n.height,e.bindTexture(s,t),o>1){let t=Math.max(1,r>>o),n=Math.max(1,i>>o),c=t===1&&n===1,l=ti(a)?it:rt,u=ti(a)?c?at:it:rt;e.texParameteri(s,pt,l),e.texParameteri(s,ft,u)}else if(ei(e,r,i,a))e.generateMipmap(s);else{let t=ti(a)?it:rt;e.texParameteri(s,ft,t),e.texParameteri(s,pt,t),e.texParameteri(s,mt,nt),e.texParameteri(s,ht,nt)}}function di(e,t,n,r,i,a){ui(e,t,{options:n,width:r,height:i,internalFormat:a})}function fi(e){return e.auto===!0||e.auto===void 0&&e.level===void 0}function pi(e,t){return t||={},t.cubeFaceOrder||[ot,st,ct,lt,ut,dt]}function mi(e,t){let n=pi(e,t).map(function(e,t){return{face:e,ndx:t}});return n.sort(function(e,t){return e.face-t.face}),n}function hi(e,t,n,r){r||=C.textureOptions;let i=r.target||D,a=r.level||0,o=n.width,s=n.height,c=r.internalFormat||r.format||T,l=G(c),u=r.format||l.format,d=r.type||l.type;if(e.bindTexture(i,t),i===O){let l=n.width,f=n.height,p,m;if(l/6===f)p=f,m=[0,0,1,0,2,0,3,0,4,0,5,0];else if(f/6===l)p=l,m=[0,0,0,1,0,2,0,3,0,4,0,5];else if(l/3==f/2)p=l/3,m=[0,0,1,0,2,0,0,1,1,1,2,1];else if(l/2==f/3)p=l/2,m=[0,0,1,0,0,1,1,1,0,2,1,2];else throw Error(`can't figure out cube map from element: ${n.src?n.src:n.nodeName}`);let h=Ze();h?(h.canvas.width=p,h.canvas.height=p,o=p,s=p,K(e,r,()=>{mi(e,r).forEach(function(t){let r=m[t.ndx*2+0]*p,i=m[t.ndx*2+1]*p;h.drawImage(n,r,i,p,p,0,0,p,p),e.texImage2D(t.face,a,c,u,d,h.canvas)}),h.canvas.width=1,h.canvas.height=1})):typeof createImageBitmap<`u`&&(o=p,s=p,mi(e,r).forEach(function(l){let f=m[l.ndx*2+0]*p,h=m[l.ndx*2+1]*p;e.texImage2D(l.face,a,c,p,p,0,u,d,null),createImageBitmap(n,f,h,p,p,{premultiplyAlpha:`none`,colorSpaceConversion:`none`}).then(function(n){K(e,r,()=>{e.bindTexture(i,t),e.texImage2D(l.face,a,c,u,d,n),fi(r)&&di(e,t,r,o,s,c)})})}))}else i===k||i===A?K(e,r,()=>{let t=Math.min(n.width,n.height),r=Math.max(n.width,n.height),o=r/t;if(o%1!=0)throw Error(`can not compute 3D dimensions of element`);let s=+(n.width===r),l=+(n.height===r);e.pixelStorei(Ct,1),e.pixelStorei(wt,n.width),e.pixelStorei(Tt,0),e.pixelStorei(Ot,0),e.texImage3D(i,a,c,t,t,t,0,u,d,null);for(let r=0;r<o;++r){let o=r*t*s,c=r*t*l;e.pixelStorei(Et,o),e.pixelStorei(Dt,c),e.texSubImage3D(i,a,0,0,r,t,t,1,u,d,n)}oi(e)}):K(e,r,()=>{e.texImage2D(i,a,c,u,d,n)});fi(r)&&di(e,t,r,o,s,c),ci(e,t,r)}function gi(){}function _i(e){if(typeof document<`u`){let t=document.createElement(`a`);return t.href=e,t.hostname===location.hostname&&t.port===location.port&&t.protocol===location.protocol}{let t=new URL(location.href).origin;return new URL(e,location.href).origin===t}}function vi(e,t){return t===void 0&&!_i(e)?`anonymous`:t}function yi(e,t,n){n||=gi;let r;if(t=t===void 0?C.crossOrigin:t,t=vi(e,t),typeof Image<`u`){r=new Image,t!==void 0&&(r.crossOrigin=t);let i=function(){r.removeEventListener(`error`,a),r.removeEventListener(`load`,o),r=null},a=function(){let t=`couldn't load image: `+e;He(t),n(t,r),i()},o=function(){n(null,r),i()};return r.addEventListener(`error`,a),r.addEventListener(`load`,o),r.src=e,r}if(typeof ImageBitmap<`u`){let i,a,o=function(){n(i,a)},s={};t&&(s.mode=`cors`),fetch(e,s).then(function(e){if(!e.ok)throw e;return e.blob()}).then(function(e){return createImageBitmap(e,{premultiplyAlpha:`none`,colorSpaceConversion:`none`})}).then(function(e){a=e,setTimeout(o)}).catch(function(e){i=e,setTimeout(o)}),r=null}return r}function bi(e){return typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof ImageData<`u`&&e instanceof ImageData||typeof HTMLElement<`u`&&e instanceof HTMLElement}function xi(e,t,n){return bi(e)?(setTimeout(function(){n(null,e)}),e):yi(e,t,n)}function Si(e,t,n){n||=C.textureOptions;let r=n.target||D;if(e.bindTexture(r,t),n.color===!1)return;let i=li(n.color);if(r===O)for(let t=0;t<6;++t)e.texImage2D(ot+t,0,T,1,1,0,T,M,i);else r===k||r===A?e.texImage3D(r,0,T,1,1,1,0,T,M,i):e.texImage2D(r,0,T,1,1,0,T,M,i)}function Ci(e,t,n,r){return r||=gi,n||=C.textureOptions,Si(e,t,n),n=ai(e,n),xi(n.src,n.crossOrigin,function(i,a){i?r(i,t,a):(hi(e,t,a,n),r(null,t,a))})}function wi(e,t,n,r){r||=gi;let i=n.src;if(i.length!==6)throw Error(`there must be 6 urls for a cubemap`);let a=n.level||0,o=n.internalFormat||n.format||T,s=G(o),c=n.format||s.format,l=n.type||M,u=n.target||D;if(u!==O)throw Error(`target must be TEXTURE_CUBE_MAP`);Si(e,t,n),n=ai(e,n);let d=6,f=[],p=pi(e,n),m;function h(i){return function(s,p){--d,s?f.push(s):p.width===p.height?K(e,n,()=>{e.bindTexture(u,t),d===5?pi().forEach(function(t){e.texImage2D(t,a,o,c,l,p)}):e.texImage2D(i,a,o,c,l,p),fi(n)&&e.generateMipmap(u)}):f.push(`cubemap face img is not a square: `+p.src),d===0&&r(f.length?f:void 0,t,m)}}m=i.map(function(e,t){return xi(e,n.crossOrigin,h(p[t]))})}function Ti(e,t,n,r){r||=gi;let i=n.src,a=n.internalFormat||n.format||T,o=G(a),s=n.format||o.format,c=n.type||M,l=n.target||A;if(l!==k&&l!==A)throw Error(`target must be TEXTURE_3D or TEXTURE_2D_ARRAY`);Si(e,t,n),n=ai(e,n);let u=i.length,d=[],f,p=n.level||0,m=n.width,h=n.height,g=i.length,_=!0;function v(i){return function(o,v){--u,o?d.push(o):K(e,n,()=>{if(e.bindTexture(l,t),_){_=!1,m=n.width||v.width,h=n.height||v.height,e.texImage3D(l,p,a,m,h,g,0,s,c,null);for(let t=0;t<g;++t)e.texSubImage3D(l,p,0,0,t,m,h,1,s,c,v)}else{let t=v,n;(v.width!==m||v.height!==h)&&(n=Ze(),t=n.canvas,n.canvas.width=m,n.canvas.height=h,n.drawImage(v,0,0,m,h)),e.texSubImage3D(l,p,0,0,i,m,h,1,s,c,t),n&&t===n.canvas&&(n.canvas.width=0,n.canvas.height=0)}fi(n)&&e.generateMipmap(l)}),u===0&&r(d.length?d:void 0,t,f)}}f=i.map(function(e,t){return xi(e,n.crossOrigin,v(t))})}function Ei(e,t,n,r){r||=C.textureOptions;let i=r.target||D;e.bindTexture(i,t);let a=r.level||0,o=r.internalFormat||r.format||T,s=G(o),c=r.format||s.format,l=r.type||ni(e,n,s.type);Xe(n)?n instanceof Uint8ClampedArray&&(n=new Uint8Array(n.buffer)):n=new(Be(l))(n);let{width:u,height:d,depth:f}=Di(i,n,r,o,c,l),p=Zr(o);oi(e),e.pixelStorei(Ct,r.unpackAlignment||1);let m=0;return K(e,r,()=>{let t=0,{blockWidth:s,blockHeight:h,bytesPerBlock:g}=Qr(o,l);for(;t<n.byteLength;){let _=Math.max(1,u>>m),v=Math.max(1,d>>m),ee=i===D?Math.max(1,f>>m):f,te=Math.ceil(_/s),ne=Math.ceil(v/h),re=i===O?6:1,ie=te*ne*g*ee*re;if(t+ie>n.byteLength)throw Error(`src size does not match number of mip levels`);let y=n.subarray(t/n.BYTES_PER_ELEMENT,(t+ie)/n.BYTES_PER_ELEMENT),b=a+m;if(i===O){let t=y.length/6;mi(e,r).forEach(n=>{let r=t*n.ndx,i=y.subarray(r,r+t);p?e.compressedTexImage2D(n.face,b,o,_,v,0,i):e.texImage2D(n.face,b,o,_,v,0,c,l,i)})}else i===k||i===A?e.texImage3D(i,b,o,_,v,ee,0,c,l,y):p?e.compressedTexImage2D(i,b,o,_,v,0,y):e.texImage2D(i,b,o,_,v,0,c,l,y);if(++m,t+=ie,_===1&&v===1&&ee===1&&t!==n.byteLength)throw Error(`src size has more data than can fit in mip levels`)}}),{width:u,height:d,depth:f,type:l,lastMipLevelUploaded:a+m-1}}function Di(e,t,n,r,i,a){let o=n.width,s=n.height,c=n.depth,l=Zr(r);if(l){if(!o||!s)throw Error(`compressed texture needs to set width and height!`);c||=1}else{let n=Xr(r,a),u=t.byteLength/n;if(u%1)throw Error(`length wrong size for format: ${Je(Ye,i)}`);if(l&&(!o||!s))throw Error(`compressed texture needs to set width and height!`);let d;if(e===k||e===A){if(!o&&!s&&!c){let e=Math.cbrt(u);if(e%1!=0)throw Error(`can't guess cube size of array of numElements: ${u}`);o=e,s=e,c=e}else o&&(!s||!c)?(d=ri(Ye,e,s,c,u/o),s=d.width,c=d.height):s&&(!o||!c)?(d=ri(Ye,e,o,c,u/s),o=d.width,c=d.height):(d=ri(Ye,e,o,s,u/c),o=d.width,s=d.height)}else d=ri(Ye,e,o,s,u),o=d.width,s=d.height}return{width:o,height:s,depth:c}}function Oi(e,t,n){let r=n.target||D;e.bindTexture(r,t);let i=n.level||0,a=n.internalFormat||n.format||T,o=G(a),s=n.format||o.format,c=n.type||o.type;K(e,n,()=>{if(r===O)for(let t=0;t<6;++t)e.texImage2D(ot+t,i,a,n.width,n.height,0,s,c,null);else r===k||r===A?e.texImage3D(r,i,a,n.width,n.height,n.depth,0,s,c,null):e.texImage2D(r,i,a,n.width,n.height,0,s,c,null)})}function ki(e,t,n){n||=gi,t||=C.textureOptions;let r=e.createTexture(),i=t.target||D,a=t.width||1,o=t.height||1,s=0,c=t.internalFormat||T;e.bindTexture(i,r),i===O&&(e.texParameteri(i,mt,nt),e.texParameteri(i,ht,nt));let l=t.src;if(l){if(typeof l==`function`&&(l=l(e,t)),typeof l==`string`)Ci(e,r,t,n);else if(Xe(l)||Array.isArray(l)&&(typeof l[0]==`number`||Array.isArray(l[0])||Xe(l[0]))){let n=Ei(e,r,l,t);a=n.width,o=n.height,s=n.lastMipLevelUploaded}else Array.isArray(l)&&(typeof l[0]==`string`||bi(l[0]))?i===O?wi(e,r,t,n):Ti(e,r,t,n):(hi(e,r,l,t),a=l.width,o=l.height)}else Oi(e,r,t);return fi(t)&&ui(e,r,{options:t,width:a,height:o,internalFormat:c,lastMipLevelUploaded:s}),ci(e,r,t),r}var Ai=He;function ji(e){return typeof document<`u`&&document.getElementById?document.getElementById(e):null}var Mi=33984,Ni=34962,Pi=35713,Fi=35714,Ii=35632,Li=35633,Ri=35981,zi=35718,Bi=35721,Vi=35971,Hi=35382,Ui=35396,Wi=35398,Gi=35392,Ki=35395,qi=5126,Ji=35664,Yi=35665,Xi=35666,Zi=5124,Qi=35667,$i=35668,ea=35669,ta=35670,na=35671,ra=35672,ia=35673,aa=35674,oa=35675,sa=35676,ca=35678,la=35680,ua=35679,da=35682,fa=35685,pa=35686,ma=35687,ha=35688,ga=35689,_a=35690,va=36289,ya=36292,ba=36293,xa=5125,Sa=36294,Ca=36295,wa=36296,Ta=36298,Ea=36299,Da=36300,Oa=36303,ka=36306,Aa=36307,ja=36308,Ma=36311,Na=3553,Pa=34067,Fa=32879,Ia=35866,q={};function La(e,t){return q[t].bindPoint}function Ra(e,t){return function(n){e.uniform1f(t,n)}}function za(e,t){return function(n){e.uniform1fv(t,n)}}function Ba(e,t){return function(n){e.uniform2fv(t,n)}}function Va(e,t){return function(n){e.uniform3fv(t,n)}}function Ha(e,t){return function(n){e.uniform4fv(t,n)}}function Ua(e,t){return function(n){e.uniform1i(t,n)}}function Wa(e,t){return function(n){e.uniform1iv(t,n)}}function Ga(e,t){return function(n){e.uniform2iv(t,n)}}function Ka(e,t){return function(n){e.uniform3iv(t,n)}}function qa(e,t){return function(n){e.uniform4iv(t,n)}}function Ja(e,t){return function(n){e.uniform1ui(t,n)}}function Ya(e,t){return function(n){e.uniform1uiv(t,n)}}function Xa(e,t){return function(n){e.uniform2uiv(t,n)}}function Za(e,t){return function(n){e.uniform3uiv(t,n)}}function Qa(e,t){return function(n){e.uniform4uiv(t,n)}}function $a(e,t){return function(n){e.uniformMatrix2fv(t,!1,n)}}function eo(e,t){return function(n){e.uniformMatrix3fv(t,!1,n)}}function to(e,t){return function(n){e.uniformMatrix4fv(t,!1,n)}}function no(e,t){return function(n){e.uniformMatrix2x3fv(t,!1,n)}}function ro(e,t){return function(n){e.uniformMatrix3x2fv(t,!1,n)}}function io(e,t){return function(n){e.uniformMatrix2x4fv(t,!1,n)}}function ao(e,t){return function(n){e.uniformMatrix4x2fv(t,!1,n)}}function oo(e,t){return function(n){e.uniformMatrix3x4fv(t,!1,n)}}function so(e,t){return function(n){e.uniformMatrix4x3fv(t,!1,n)}}function J(e,t,n,r){let i=La(e,t);return qe(e)?function(t){let a,o;!t||Ge(e,t)?(a=t,o=null):(a=t.texture,o=t.sampler),e.uniform1i(r,n),e.activeTexture(Mi+n),e.bindTexture(i,a),e.bindSampler(n,o)}:function(t){e.uniform1i(r,n),e.activeTexture(Mi+n),e.bindTexture(i,t)}}function Y(e,t,n,r,i){let a=La(e,t),o=new Int32Array(i);for(let e=0;e<i;++e)o[e]=n+e;return qe(e)?function(t){e.uniform1iv(r,o),t.forEach(function(t,r){e.activeTexture(Mi+o[r]);let i,s;!t||Ge(e,t)?(i=t,s=null):(i=t.texture,s=t.sampler),e.bindSampler(n,s),e.bindTexture(a,i)})}:function(t){e.uniform1iv(r,o),t.forEach(function(t,n){e.activeTexture(Mi+o[n]),e.bindTexture(a,t)})}}q[qi]={Type:Float32Array,size:4,setter:Ra,arraySetter:za},q[Ji]={Type:Float32Array,size:8,setter:Ba,cols:2},q[Yi]={Type:Float32Array,size:12,setter:Va,cols:3},q[Xi]={Type:Float32Array,size:16,setter:Ha,cols:4},q[Zi]={Type:Int32Array,size:4,setter:Ua,arraySetter:Wa},q[Qi]={Type:Int32Array,size:8,setter:Ga,cols:2},q[$i]={Type:Int32Array,size:12,setter:Ka,cols:3},q[ea]={Type:Int32Array,size:16,setter:qa,cols:4},q[xa]={Type:Uint32Array,size:4,setter:Ja,arraySetter:Ya},q[Sa]={Type:Uint32Array,size:8,setter:Xa,cols:2},q[Ca]={Type:Uint32Array,size:12,setter:Za,cols:3},q[wa]={Type:Uint32Array,size:16,setter:Qa,cols:4},q[ta]={Type:Uint32Array,size:4,setter:Ua,arraySetter:Wa},q[na]={Type:Uint32Array,size:8,setter:Ga,cols:2},q[ra]={Type:Uint32Array,size:12,setter:Ka,cols:3},q[ia]={Type:Uint32Array,size:16,setter:qa,cols:4},q[aa]={Type:Float32Array,size:32,setter:$a,rows:2,cols:2},q[oa]={Type:Float32Array,size:48,setter:eo,rows:3,cols:3},q[sa]={Type:Float32Array,size:64,setter:to,rows:4,cols:4},q[fa]={Type:Float32Array,size:32,setter:no,rows:2,cols:3},q[pa]={Type:Float32Array,size:32,setter:io,rows:2,cols:4},q[ma]={Type:Float32Array,size:48,setter:ro,rows:3,cols:2},q[ha]={Type:Float32Array,size:48,setter:oo,rows:3,cols:4},q[ga]={Type:Float32Array,size:64,setter:ao,rows:4,cols:2},q[_a]={Type:Float32Array,size:64,setter:so,rows:4,cols:3},q[ca]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Na},q[la]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Pa},q[ua]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Fa},q[da]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Na},q[va]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Ia},q[ya]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Ia},q[ba]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Pa},q[Ta]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Na},q[Ea]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Fa},q[Da]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Pa},q[Oa]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Ia},q[ka]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Na},q[Aa]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Fa},q[ja]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Pa},q[Ma]={Type:null,size:0,setter:J,arraySetter:Y,bindPoint:Ia};function co(e,t){return function(n){if(n.value)switch(e.disableVertexAttribArray(t),n.value.length){case 4:e.vertexAttrib4fv(t,n.value);break;case 3:e.vertexAttrib3fv(t,n.value);break;case 2:e.vertexAttrib2fv(t,n.value);break;case 1:e.vertexAttrib1fv(t,n.value);break;default:throw Error(`the length of a float constant value must be between 1 and 4!`)}else e.bindBuffer(Ni,n.buffer),e.enableVertexAttribArray(t),e.vertexAttribPointer(t,n.numComponents||n.size,n.type||qi,n.normalize||!1,n.stride||0,n.offset||0),e.vertexAttribDivisor&&e.vertexAttribDivisor(t,n.divisor||0)}}function X(e,t){return function(n){if(n.value){if(e.disableVertexAttribArray(t),n.value.length===4)e.vertexAttrib4iv(t,n.value);else throw Error(`The length of an integer constant value must be 4!`)}else e.bindBuffer(Ni,n.buffer),e.enableVertexAttribArray(t),e.vertexAttribIPointer(t,n.numComponents||n.size,n.type||Zi,n.stride||0,n.offset||0),e.vertexAttribDivisor&&e.vertexAttribDivisor(t,n.divisor||0)}}function lo(e,t){return function(n){if(n.value){if(e.disableVertexAttribArray(t),n.value.length===4)e.vertexAttrib4uiv(t,n.value);else throw Error(`The length of an unsigned integer constant value must be 4!`)}else e.bindBuffer(Ni,n.buffer),e.enableVertexAttribArray(t),e.vertexAttribIPointer(t,n.numComponents||n.size,n.type||xa,n.stride||0,n.offset||0),e.vertexAttribDivisor&&e.vertexAttribDivisor(t,n.divisor||0)}}function uo(e,t,n){let r=n.size,i=n.count;return function(n){e.bindBuffer(Ni,n.buffer);let a=n.size||n.numComponents||r,o=a/i,s=n.type||qi,c=q[s].size*a,l=n.normalize||!1,u=n.offset||0,d=c/i;for(let r=0;r<i;++r)e.enableVertexAttribArray(t+r),e.vertexAttribPointer(t+r,o,s,l,c,u+d*r),e.vertexAttribDivisor&&e.vertexAttribDivisor(t+r,n.divisor||0)}}var Z={};Z[qi]={size:4,setter:co},Z[Ji]={size:8,setter:co},Z[Yi]={size:12,setter:co},Z[Xi]={size:16,setter:co},Z[Zi]={size:4,setter:X},Z[Qi]={size:8,setter:X},Z[$i]={size:12,setter:X},Z[ea]={size:16,setter:X},Z[xa]={size:4,setter:lo},Z[Sa]={size:8,setter:lo},Z[Ca]={size:12,setter:lo},Z[wa]={size:16,setter:lo},Z[ta]={size:4,setter:X},Z[na]={size:8,setter:X},Z[ra]={size:12,setter:X},Z[ia]={size:16,setter:X},Z[aa]={size:4,setter:uo,count:2},Z[oa]={size:9,setter:uo,count:3},Z[sa]={size:16,setter:uo,count:4};var fo=/ERROR:\s*\d+:(\d+)/gi;function po(e,t=``,n=0){let r=[...t.matchAll(fo)],i=new Map(r.map((e,n)=>{let i=parseInt(e[1]),a=r[n+1],o=a?a.index:t.length,s=t.substring(e.index,o);return[i-1,s]}));return e.split(`
`).map((e,t)=>{let r=i.get(t);return`${t+1+n}: ${e}${r?`\n\n^^^ ${r}`:``}`}).join(`
`)}var mo=/^[ \t]*\n/;function ho(e){let t=0;return mo.test(e)&&(t=1,e=e.replace(mo,``)),{lineOffset:t,shaderSource:e}}function go(e,t){return e.errorCallback(t),e.callback&&setTimeout(()=>{e.callback(`${t}\n${e.errors.join(`
`)}`)}),null}function _o(e,t,n,r){if(r||=Ai,!e.getShaderParameter(n,Pi)){let i=e.getShaderInfoLog(n),{lineOffset:a,shaderSource:o}=ho(e.getShaderSource(n)),s=`${po(o,i,a)}\nError compiling ${Je(e,t)}: ${i}`;return r(s),s}return``}function vo(e,t,n){let r,i,a;if(typeof t==`function`&&(n=t,t=void 0),typeof e==`function`)n=e,e=void 0;else if(e&&!Array.isArray(e)){let t=e;n=t.errorCallback,e=t.attribLocations,r=t.transformFeedbackVaryings,i=t.transformFeedbackMode,a=t.callback}let o=n||Ai,s=[],c={errorCallback(e,...t){s.push(e),o(e,...t)},transformFeedbackVaryings:r,transformFeedbackMode:i,callback:a,errors:s};{let n={};Array.isArray(e)?e.forEach(function(e,r){n[e]=t?t[r]:r}):n=e||{},c.attribLocations=n}return c}var yo=[`VERTEX_SHADER`,`FRAGMENT_SHADER`];function bo(e,t){if(t.indexOf(`frag`)>=0)return Ii;if(t.indexOf(`vert`)>=0)return Li}function xo(e,t,n){let r=e.getAttachedShaders(t);for(let t of r)n.has(t)||e.deleteShader(t);e.deleteProgram(t)}var So=(e=0)=>new Promise(t=>setTimeout(t,e));function Co(e,t,n){let r=e.createProgram(),{attribLocations:i,transformFeedbackVaryings:a,transformFeedbackMode:o}=vo(n);for(let n=0;n<t.length;++n){let i=t[n];if(typeof i==`string`){let t=ji(i),r=t?t.text:i,a=e[yo[n]];t&&t.type&&(a=bo(e,t.type)||a),i=e.createShader(a),e.shaderSource(i,ho(r).shaderSource),e.compileShader(i)}e.attachShader(r,i)}Object.entries(i).forEach(([t,n])=>e.bindAttribLocation(r,n,t));{let t=a;t&&(t.attribs&&(t=t.attribs),Array.isArray(t)||(t=Object.keys(t)),e.transformFeedbackVaryings(r,t,o||Ri))}return e.linkProgram(r),r}function wo(e,t,n,r,i){let a=vo(n,r,i),o=new Set(t),s=Co(e,t,a);function c(e,t){let n=Eo(e,t,a.errorCallback);return n&&xo(e,t,o),n}if(a.callback){To(e,s).then(()=>{let t=c(e,s);a.callback(t,t?void 0:s)});return}return c(e,s)?void 0:s}async function To(e,t){let n=e.getExtension(`KHR_parallel_shader_compile`),r=n?(e,t)=>e.getProgramParameter(t,n.COMPLETION_STATUS_KHR):()=>!0,i=0;do await So(i),i=1e3/60;while(!r(e,t))}function Eo(e,t,n){if(n||=Ai,!e.getProgramParameter(t,Fi)){let r=e.getProgramInfoLog(t);return n(`Error in program linking: ${r}`),`${r}\n${e.getAttachedShaders(t).map(t=>_o(e,e.getShaderParameter(t,e.SHADER_TYPE),t,n)).filter(e=>e).join(`
`)}`}}function Do(e,t,n,r,i){return wo(e,t,n,r,i)}function Oo(e){let t=e.name;return t.startsWith(`gl_`)||t.startsWith(`webgl_`)}var ko=/(\.|\[|]|\w+)/g,Ao=e=>e>=`0`&&e<=`9`;function jo(e,t,n,r){let i=e.split(ko).filter(e=>e!==``),a=0,o=``;for(;;){let e=i[a++];o+=e;let s=Ao(e[0]),c=s?parseInt(e):e;if(s&&(o+=i[a++]),a===i.length){n[c]=t;break}{let e=i[a++],t=e===`[`,s=n[c]||(t?[]:{});n[c]=s,n=s,r[o]=r[o]||function(e){return function(t){Fo(e,t)}}(s),o+=e}}}function Mo(e,t){let n=0;function r(t,r,i){let a=r.name.endsWith(`[0]`),o=r.type,s=q[o];if(!s)throw Error(`unknown type: 0x${o.toString(16)}`);let c;if(s.bindPoint){let t=n;n+=r.size,c=a?s.arraySetter(e,o,t,i,r.size):s.setter(e,o,t,i,r.size)}else c=s.arraySetter&&a?s.arraySetter(e,i):s.setter(e,i);return c.location=i,c}let i={},a={},o=e.getProgramParameter(t,zi);for(let n=0;n<o;++n){let o=e.getActiveUniform(t,n);if(Oo(o))continue;let s=o.name;s.endsWith(`[0]`)&&(s=s.substr(0,s.length-3));let c=e.getUniformLocation(t,o.name);if(c){let e=r(t,o,c);i[s]=e,jo(s,e,a,i)}}return i}function No(e,t){let n={},r=e.getProgramParameter(t,Vi);for(let i=0;i<r;++i){let r=e.getTransformFeedbackVarying(t,i);n[r.name]={index:i,type:r.type,size:r.size}}return n}function Po(e,t){let n=e.getProgramParameter(t,zi),r=[],i=[];for(let a=0;a<n;++a){i.push(a),r.push({});let n=e.getActiveUniform(t,a);r[a].name=n.name}[[`UNIFORM_TYPE`,`type`],[`UNIFORM_SIZE`,`size`],[`UNIFORM_BLOCK_INDEX`,`blockNdx`],[`UNIFORM_OFFSET`,`offset`]].forEach(function(n){let a=n[0],o=n[1];e.getActiveUniforms(t,i,e[a]).forEach(function(e,t){r[t][o]=e})});let a={},o=e.getProgramParameter(t,Hi);for(let n=0;n<o;++n){let r=e.getActiveUniformBlockName(t,n),i={index:e.getUniformBlockIndex(t,r),usedByVertexShader:e.getActiveUniformBlockParameter(t,n,Ui),usedByFragmentShader:e.getActiveUniformBlockParameter(t,n,Wi),size:e.getActiveUniformBlockParameter(t,n,Gi),uniformIndices:e.getActiveUniformBlockParameter(t,n,Ki)};i.used=i.usedByVertexShader||i.usedByFragmentShader,a[r]=i}return{blockSpecs:a,uniformData:r}}function Fo(e,t){for(let n in t){let r=e[n];typeof r==`function`?r(t[n]):Fo(e[n],t[n])}}function Io(e,...t){let n=e.uniformSetters||e,r=t.length;for(let e=0;e<r;++e){let r=t[e];if(Array.isArray(r)){let e=r.length;for(let t=0;t<e;++t)Io(n,r[t])}else for(let e in r){let t=n[e];t&&t(r[e])}}}function Lo(e,t){let n={},r=e.getProgramParameter(t,Bi);for(let i=0;i<r;++i){let r=e.getActiveAttrib(t,i);if(Oo(r))continue;let a=e.getAttribLocation(t,r.name),o=Z[r.type],s=o.setter(e,a,o);s.location=a,n[r.name]=s}return n}function Ro(e,t){let n=Mo(e,t),r=Lo(e,t),i={program:t,uniformSetters:n,attribSetters:r,uniformLocations:Object.fromEntries(Object.entries(n).map(([e,t])=>[e,t.location])),attribLocations:Object.fromEntries(Object.entries(r).map(([e,t])=>[e,t.location]))};return qe(e)&&(i.uniformBlockSpec=Po(e,t),i.transformFeedbackInfo=No(e,t)),i}var zo=/\s|{|}|;/;function Bo(e,t,n,r,i){let a=vo(n,r,i),o=[];if(t=t.map(function(e){if(!zo.test(e)){let t=ji(e);if(t)e=t.text;else{let t=`no element with id: ${e}`;a.errorCallback(t),o.push(t)}}return e}),o.length)return go(a,``);let s=a.callback;s&&(a.callback=(t,n)=>{s(t,t?void 0:Ro(e,n))});let c=Do(e,t,a);return c?Ro(e,c):null}var Vo=6402,Ho=33190,Uo=36012,Wo=35056,Go=36013,Ko=32854,qo=32855,Jo=36194,Yo=33189,Xo=6401,Zo=36168,Qo=34041,$o=36096,es=36128,ts=33306,Q={};Q[Qo]=ts,Q[Xo]=es,Q[Zo]=es,Q[Vo]=$o,Q[Yo]=$o,Q[Ho]=$o,Q[Uo]=$o,Q[Wo]=ts,Q[Go]=ts;var $={};$[Ko]=!0,$[qo]=!0,$[Jo]=!0,$[Qo]=!0,$[Yo]=!0,$[Xo]=!0,$[Zo]=!0;var ns={[x.Water]:{bump:.1,grain:.03,shade:1},[x.Crossing]:{bump:.1,grain:.03,shade:1},[x.Plains]:{bump:.14,grain:.05,shade:1},[x.Grassland]:{bump:.16,grain:.06,shade:1},[x.Forest]:{bump:.34,grain:.12,shade:.93},[x.Hills]:{bump:.55,grain:.07,shade:1},[x.Mountains]:{bump:1,grain:.08,shade:1},[x.Desert]:{bump:.28,grain:.04,shade:1.03},[x.Tundra]:{bump:.22,grain:.07,shade:1},[x.Marsh]:{bump:.1,grain:.1,shade:.96},[x.Urban]:{bump:.12,grain:.05,shade:.97},[x.Ice]:{bump:.18,grain:.02,shade:1.04}};function rs(){let e=new Float32Array(36);for(let t=0;t<12;t++){let n=ns[t];if(!n)throw Error(`no ground for terrain class ${t}`);e.set([n.bump,n.grain,n.shade],t*3)}return e}function is(e){return Math.min(1,Math.max(0,Math.log2(750/e)/Math.log2(750/300)))}var as=.12,os=.14,ss=.62,cs=.3,ls=.6,us=1.32,ds=.72,fs=6e3;function ps(e,t,n){if(n<0||n>=e.h||t<0||t>=e.w)return!1;let r=n*e.w+t;return(e.bits[r>>3]>>(r&7)&1)==1}var ms=.35,hs=.85;function gs(e,t,n,r,i,a,o,s){let c=a*t/r-.5,l=o*n/i-.5,u=Math.floor(c),d=Math.floor(l),f=c-u,p=l-d,m=(n,r)=>+!!e(s?(n%t+t)%t:n,r);return(m(u,d)*(1-f)+m(u+1,d)*f)*(1-p)+(m(u,d+1)*(1-f)+m(u+1,d+1)*f)*p}function _s(e,t){let n=e.w/t;if(!Number.isInteger(n)||e.h%n!==0)throw Error(`a mask of ${e.w} for a map of ${t} cells`);let[r,i]=[t,e.h/n],a=new Uint8Array(r*i),o=new Int32Array(i+1),s=[],c=Math.ceil(n*n/8),l=[],u=new Uint8Array(r),d=new Uint8Array(r);for(let t=0;t<i;t++){if(o[t]=s.length,u.fill(1),d.fill(0),n%8==0){let i=n/8;for(let a=t*n;a<t*n+n;a++){let t=a*e.w/8;for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=e.bits[t+n*i+r];a!==0&&(d[n]=1),a!==255&&(u[n]=0)}}}else for(let r=t*n;r<t*n+n;r++)for(let t=0;t<e.w;t++){let i=Math.floor(t/n);ps(e,t,r)?d[i]=1:u[i]=0}for(let i=0;i<r;i++){let o=u[i]?1:d[i]?2:0;if(a[t*r+i]=o,o!==2)continue;s.push(i);let f=new Uint8Array(c);for(let r=0;r<n;r++)for(let a=0;a<n;a++)ps(e,i*n+a,t*n+r)&&(f[r*n+a>>3]|=1<<(r*n+a&7));l.push(f)}}o[i]=s.length;let f=new Uint8Array(l.length*c);return l.forEach((e,t)=>f.set(e,t*c)),{w:e.w,h:e.h,k:n,cw:r,ch:i,state:a,rowStart:o,xs:Int32Array.from(s),blocks:f}}function vs(e,t,n){if(n<0||n>=e.h||t<0||t>=e.w)return!1;let r=Math.floor(t/e.k),i=Math.floor(n/e.k),a=e.state[i*e.cw+r];if(a!==2)return a===1;let o=e.rowStart[i],s=e.rowStart[i+1]-1;for(;o<s;){let t=o+s>>1;e.xs[t]<r?o=t+1:s=t}let c=(n-i*e.k)*e.k+(t-r*e.k);return(e.blocks[o*Math.ceil(e.k*e.k/8)+(c>>3)]>>(c&7)&1)==1}function ys(e,t,n,r,i,a){return gs((t,n)=>vs(e,t,n),e.w,e.h,t,n,r,i,a)>=hs}function bs(e,t,n,r,i,a,o=2){if(ys(e,t,n,r,i,a))return[r,i];let s=e.w/t,c=Math.ceil(o*s),l=null,u=1/0;for(let d=-c;d<=c;d++)for(let f=-c;f<=c;f++){let c=(Math.floor(r*s)+f+.5)/s,p=(Math.floor(i*s)+d+.5)/s;if(p<0||p>=n||!a&&(c<0||c>=t))continue;let m=(c-r)*(c-r)+(p-i)*(p-i);m>=u||m>o*o||ys(e,t,n,c,p,a)&&(l=[c,p],u=m)}return l??[r,i]}var xs=[16,8,0].map(e=>((m>>e&255)/255).toFixed(3)).join(`, `),Ss=[16,8,0].map(e=>((g>>e&255)/255).toFixed(3)).join(`, `),Cs=`#version 300 es
precision highp float;
// Full-screen triangle; no attributes.
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`,ws=`#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
precision highp usampler2DArray;

uniform usampler2D uOwner;
uniform usampler2D uController;
uniform sampler2D uPalette;
uniform ivec2 uMapSize;
uniform ivec2 uCenterCell;
uniform vec2 uCenterFrac;
uniform float uScale;      // screen px per cell
uniform vec2 uViewport;    // drawing-buffer px
uniform float uDpr;        // device px per CSS px (border width is in CSS px)
uniform int uWrapX;
uniform float uBorderPx;   // border width (CSS px)
uniform float uWarp;       // domain-warp amplitude (cells), must stay < 0.5
uniform sampler2D uLand;   // fine land coverage, 0..1, bilinear (PLAN 1.28b)
uniform int uHasLand;
uniform int uHasTerrain;           // a real terrain layer is loaded (water from terrain, PLAN 1.37a)
uniform highp usampler2D uTerrain;  // terrain class per cell
uniform int uMode;         // 0 = palette fills, 1 = terrain colours, 2 = province unrest, 3 = sea control, 4 = air superiority, 5 = fallout
uniform highp usampler2D uProvince; // admin-1 province per cell
uniform sampler2D uUnrest;          // unrest per province id, 128 wide, 0..1
uniform sampler2D uFallout;         // fallout per cell, 0..1 (PLAN 6.3c); 1×1 of none
uniform ivec2 uFalloutSize;         // its size: the map's, or 1×1
uniform highp usampler2D uSeaZone;  // sea zone per cell (0 = none; PLAN 4.7a)
uniform highp usampler2D uSeaHolder; // the nation that holds each zone, 128 wide (0 = none)
uniform highp usampler2D uAirZone;  // air zone per cell (0 = none; PLAN 5.7c)
uniform highp usampler2D uAirHolder; // who holds each air zone's air, 128 wide (0 = none, 65535 = contested)
uniform vec3 uTerrainCol[12];
#ifdef GROUND
uniform highp isampler2D uElevation; // the land's height in metres, one texel a cell (PLAN 2.8a)
uniform float uDetail;     // how much of the ground of T2 and T3 shows, 0..1; 0: the map of T0 and T1
uniform float uCellM;      // metres to a cell
uniform float uRelief;     // how much steeper than it is the ground is shaded
uniform vec3 uGround[12];  // the ground of each terrain class: (bump, grain, shade) (PLAN 2.8b, ground.ts)
uniform float uBump;       // the slope the small relief of mountains is shaded with
#endif
uniform highp usampler2DArray uMask;  // the fine land mask, eight of its pixels to a texel, the lowest bit first (PLAN 2.9b)
uniform int uHasMask;
uniform ivec2 uMaskSize;   // the mask's size in its pixels
uniform int uMaskBand;     // its rows to a layer of uMask (PLAN 7.1l9)
uniform int uMaskPerCell;  // mask pixels to a cell
uniform float uFine;       // how much of the coast is the fine mask's at T1 (PLAN 4.7g), 0..1; at T2 and T3 uDetail's

out vec4 outColor;

ivec2 wrapCell(ivec2 c) {
  if (uWrapX == 1) c.x = ((c.x % uMapSize.x) + uMapSize.x) % uMapSize.x;
  return c;
}

bool inMap(ivec2 c) {
  return c.x >= 0 && c.y >= 0 && c.x < uMapSize.x && c.y < uMapSize.y;
}

uint ctrlAt(ivec2 c) {
  c = wrapCell(c);
  return inMap(c) ? texelFetch(uController, c, 0).r : 0u;
}

uint terrainAt(ivec2 c) {
  c = wrapCell(c);
  return inMap(c) ? texelFetch(uTerrain, c, 0).r : 0u;
}

vec3 terrainCol(uint t) {
  return uTerrainCol[min(int(t), 11)];
}

// The fine mask's bit at pixel p (PLAN 2.9b): 1 land, 0 water; none beyond its rows.
float maskBitAt(ivec2 p) {
  if (p.y < 0 || p.y >= uMaskSize.y) return 0.0;
  int x = (p.x + 4 * uMaskSize.x) % uMaskSize.x;
  uint b = texelFetch(uMask, ivec3(x >> 3, p.y % uMaskBand, p.y / uMaskBand), 0).r;
  return float((b >> uint(x & 7)) & 1u);
}

// The fine mask at local (cells from the centre cell), 0..1: its four pixels round the place, blended.
float maskBilinear(vec2 local) {
  vec2 m = local * float(uMaskPerCell) - 0.5;
  vec2 fm = floor(m);
  vec2 t = m - fm;
  ivec2 p = uCenterCell * uMaskPerCell + ivec2(fm);
  return mix(mix(maskBitAt(p), maskBitAt(p + ivec2(1, 0)), t.x), mix(maskBitAt(p + ivec2(0, 1)), maskBitAt(p + ivec2(1, 1)), t.x), t.y);
}

#ifdef GROUND
// Height of a cell for the shading: the sea is level, and past the map's top and bottom the edge row goes on.
float heightAt(ivec2 c) {
  c = wrapCell(c);
  if (c.x < 0 || c.x >= uMapSize.x) return 0.0;
  c.y = clamp(c.y, 0, uMapSize.y - 1);
  return max(float(texelFetch(uElevation, c, 0).r), 0.0);
}

// Depth of the sea in a cell, m (PLAN 4.7f): the elevation below 0; past the top and bottom rows, the edge row's.
float depthAt(ivec2 c) {
  c = wrapCell(c);
  if (c.x < 0 || c.x >= uMapSize.x) return 0.0;
  c.y = clamp(c.y, 0, uMapSize.y - 1);
  return max(-float(texelFetch(uElevation, c, 0).r), 0.0);
}

// The sea's brightness by its depth at a point, bilinear over the four cells about it (\`seaShade\`).
float seaShadeAt(vec2 p) {
  vec2 q = p - 0.5;
  ivec2 c = ivec2(floor(q));
  vec2 f = q - floor(q);
  float d = mix(mix(depthAt(c), depthAt(c + ivec2(1, 0)), f.x), mix(depthAt(c + ivec2(0, 1)), depthAt(c + ivec2(1, 1)), f.x), f.y);
  float t = min(1.0, log(1.0 + d / ${60 .toFixed(1)}) / ${Math.log(1+fs/60).toFixed(6)});
  return mix(${us.toFixed(3)}, ${ds.toFixed(3)}, t);
}

vec3 groundOf(ivec2 c) {
  return uGround[min(int(terrainAt(c)), 11)];
}

// The ground's noise (PLAN 2.8b). Octave k has 2^k lattice points to a cell. A lattice point is
// named by integers and hashed as integers: at 1 m/px a pixel is 5e-5 of a cell, and a float that
// carried the cell and the place in it would be too coarse by then (streaks). Only the place
// between two lattice points is a float, and that is small.
vec2 latticeGrad(ivec2 p, int k) {
  uint h = uint(p.x) * 0x9E3779B1u ^ uint(p.y) * 0x85EBCA6Bu ^ uint(k) * 0xC2B2AE35u;
  h ^= h >> 15;
  h *= 0x2C1B3C6Du;
  h ^= h >> 12;
  h *= 0x297A2D39u;
  h ^= h >> 15;
  // Two numbers in [-1, 1) from the two halves of the hash.
  return vec2(float(h & 0xFFFFu), float(h >> 16)) * (1.0 / 32768.0) - 1.0;
}

// Gradient noise of octave k at local (cells from the centre cell): xy its slope to a lattice
// step, z its value (about -0.7 to 0.7). Gradient noise and not value noise: the slope of value
// noise is nought along every lattice line, and the shading showed the lattice as a grid.
// Its period along x is the map's width, so the seam of a looping map has no line.
vec3 groundOctave(int k, vec2 local) {
  int f = 1 << k;
  vec2 p = local * float(f);
  vec2 ip = floor(p);
  vec2 t = p - ip;
  // (Rows above the map are sea and never come here; the bias keeps both numbers positive.)
  ivec2 i0 = uCenterCell * f + ivec2(ip) + ivec2(0, 1 << 20);
  ivec2 i1 = i0 + 1;
  if (uWrapX == 1) {
    int period = uMapSize.x * f;
    i0.x = (i0.x + 4 * period) % period;
    i1.x = (i1.x + 4 * period) % period;
  } else {
    i0.x += 1 << 20;
    i1.x += 1 << 20;
  }
  vec2 ga = latticeGrad(i0, k);
  vec2 gb = latticeGrad(ivec2(i1.x, i0.y), k);
  vec2 gc = latticeGrad(ivec2(i0.x, i1.y), k);
  vec2 gd = latticeGrad(i1, k);
  float va = dot(ga, t);
  float vb = dot(gb, t - vec2(1.0, 0.0));
  float vc = dot(gc, t - vec2(0.0, 1.0));
  float vd = dot(gd, t - vec2(1.0, 1.0));
  vec2 u = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * t * t * (t * (t - 2.0) + 1.0);
  float kxy = va - vb - vc + vd;
  vec2 slope = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) + du * (u.yx * kxy + vec2(vb, vc) - va);
  return vec3(slope, va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * kxy);
}

// How much land there is at local (cells from the centre cell) by the fine mask, 0..1, the
// coast at a half: the four mask pixels round the place, blended, and the shore moved inside
// them by the ground's noise. Where the four agree it is 0 or 1 and nothing moves it: the drawn
// coast never leaves the squares between a land pixel's middle and a water pixel's.
float maskField(vec2 local, float pxPerCell) {
  float f = maskBilinear(local);
  if (f <= 0.0 || f >= 1.0) return f;
  // A shore, not a ruler's edge: octaves from a mask pixel's width down to 4 px on screen.
  float n = 0.0;
  float amp = 1.0;
  float sum = 0.0;
  for (int k = 3; k < 14; k++) {
    if (pxPerCell / float(1 << k) < 4.0) break;
    n += groundOctave(k, local).z * amp;
    sum += amp;
    amp *= 0.6;
  }
  if (sum > 0.0) f += ${ms.toFixed(3)} * clamp(n / (0.7 * sum), -1.0, 1.0) * 4.0 * f * (1.0 - f);
  return f;
}
#endif

uint provinceAt(ivec2 c) {
  c = wrapCell(c);
  return inMap(c) ? texelFetch(uProvince, c, 0).r : 0u;
}

// Unrest ramp: calm (pale) → may revolt at 0.5 (orange) → 1 (dark red).
vec3 unrestCol(float u) {
  vec3 calm = vec3(0.91, 0.89, 0.81);
  vec3 warm = vec3(0.94, 0.63, 0.31);
  vec3 hot = vec3(0.56, 0.11, 0.06);
  return u < 0.5 ? mix(calm, warm, u * 2.0) : mix(warm, hot, (u - 0.5) * 2.0);
}

uint ownerAt(ivec2 c) {
  c = wrapCell(c);
  return inMap(c) ? texelFetch(uOwner, c, 0).r : 0u;
}

vec3 pal(uint id) {
  return texelFetch(uPalette, ivec2(int(id & 255u), int(id >> 8u)), 0).rgb;
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(mod(i, 256.0));
  float b = hash12(mod(i + vec2(1.0, 0.0), 256.0));
  float c = hash12(mod(i + vec2(0.0, 1.0), 256.0));
  float d = hash12(mod(i + vec2(1.0, 1.0), 256.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  vec2 px = gl_FragCoord.xy - 0.5 * uViewport;
  // World y grows downwards (row index); screen y grows upwards in gl_FragCoord.
  vec2 local = uCenterFrac + vec2(px.x, -px.y) / uScale;

  // Periodic noise coordinates stay small, so f32 precision holds anywhere on the map.
  vec2 np = vec2(uCenterCell % 256) + local;
  vec2 warp = (vec2(vnoise(np * 0.45), vnoise(np * 0.45 + 17.31)) - 0.5) * 2.0 * uWarp;

  // Cubic B-spline weights over the 4×4 cell neighbourhood (C2-smooth indicator fields).
  vec2 q = local + warp - 0.5;           // relative to cell centres
  vec2 fq = floor(q);
  vec2 t = q - fq;                        // [0, 1)
  ivec2 base = uCenterCell + ivec2(fq) - 1;
  vec2 t2 = t * t;
  vec2 t3 = t2 * t;
  vec2 omt = 1.0 - t;
  vec4 wx = vec4(omt.x * omt.x * omt.x, 3.0 * t3.x - 6.0 * t2.x + 4.0, -3.0 * t3.x + 3.0 * t2.x + 3.0 * t.x + 1.0, t3.x) / 6.0;
  vec4 wy = vec4(omt.y * omt.y * omt.y, 3.0 * t3.y - 6.0 * t2.y + 4.0, -3.0 * t3.y + 3.0 * t2.y + 3.0 * t.y + 1.0, t3.y) / 6.0;
  // Analytic derivatives of the weights (per cell): the border distance uses the exact gradient
  // of the indicator fields instead of fwidth, which spiked where the second-strongest id changed
  // between neighbouring pixels and was undefined inside the n > 1 branch (dashed stair lines
  // inside nations, PLAN 1.28).
  vec4 dwx = vec4(-0.5 * omt.x * omt.x, 1.5 * t2.x - 2.0 * t.x, -1.5 * t2.x + t.x + 0.5, 0.5 * t2.x);
  vec4 dwy = vec4(-0.5 * omt.y * omt.y, 1.5 * t2.y - 2.0 * t.y, -1.5 * t2.y + t.y + 0.5, 0.5 * t2.y);

  uint ids[16];
  float acc[16];
  float occ[16];   // weight of cells of this controller that are occupied (owner ≠ controller)
  uint occOwner[16];
  int n = 0;
  for (int j = 0; j < 4; j++) {
    for (int i = 0; i < 4; i++) {
      ivec2 c = base + ivec2(i, j);
      uint id = ctrlAt(c);
      uint own = ownerAt(c);
      float w = wx[i] * wy[j];
      bool occupied = id != 0u && own != 0u && own != id;
      int k = 0;
      for (; k < n; k++) {
        if (ids[k] == id) {
          acc[k] += w;
          if (occupied) { occ[k] += w; occOwner[k] = own; }
          break;
        }
      }
      if (k == n) {
        ids[n] = id;
        acc[n] = w;
        occ[n] = occupied ? w : 0.0;
        occOwner[n] = own;
        n++;
      }
    }
  }
  int bi = 0;
  for (int k = 1; k < n; k++) if (acc[k] > acc[bi]) bi = k;
  float second = 0.0;
  uint secondId = ids[bi];
  for (int k = 0; k < n; k++) if (k != bi && acc[k] > second) { second = acc[k]; secondId = ids[k]; }
  uint best = ids[bi];

  // Fine coastline (PLAN 1.28b): land/water from the bilinear coverage of the 16k land mask.
  // Computed in uniform control flow so its screen derivatives are defined.
  vec2 cellPos = vec2(uCenterCell) + local;
  vec2 luv = vec2(fract(cellPos.x / float(uMapSize.x)), cellPos.y / float(uMapSize.y));
  float cov = texture(uLand, luv).r;
  float covW = max(fwidth(cov), 1e-6);
  // The coast of T2 and T3 is the fine mask's (PLAN 2.9b, ADR-79), the mask the sim stands its
  // formations on; the coverage is a quarter as fine. The two coasts cross-fade by the
  // handover's share, as every tier change does: a place that is sea by the one and land by
  // the other fades. (A blend of the two fields moved the shore across such places instead,
  // and each pixel it passed went from sea to land in one frame.)
  float fine = cov;
  float fineShare = 0.0;
  // At T1 too, from where a mask pixel is a pixel on screen (PLAN 4.7g): a lake the coverage is
  // too coarse for is drawn at T1 as at T2 and T3, and does not come in with the ground.
  // (The pass of T0 and T1 has no ground's noise: the shore there is the mask's pixels blended.)
#ifdef GROUND
  float share = max(uDetail, uFine);
#else
  float share = uFine;
#endif
  if (share > 0.0 && uHasMask == 1 && uHasLand == 1) {
    // Where the coverage is 1 every mask pixel about is land, where 0 none: the mask is read only
    // between (the coast, and a lake the coverage averaged away), and is the coverage elsewhere.
#ifdef GROUND
    if (cov > 0.0 && cov < 1.0) fine = maskField(local, uScale / uDpr);
#else
    if (cov > 0.0 && cov < 1.0) fine = maskBilinear(local);
#endif
    fineShare = share;
  }
  float fineW = max(fwidth(fine), 1e-6);
  // Off-map rows (above the top, below the bottom) are sea: clamped coverage would otherwise
  // stretch the polar rows into grey stripes when fully zoomed out (review after PLAN 1.31).
  bool offMap = cellPos.y < 0.0 || cellPos.y >= float(uMapSize.y);
  // Water: fine coverage when loaded; else the terrain layer (unowned land stays land); else the
  // cell rule (toy map: unowned = sea).
  bool water = offMap || (uHasLand == 1 ? cov <= 0.5 : uHasTerrain == 1 ? terrainAt(ivec2(floor(cellPos))) == 0u : best == 0u);
  // How much of this pixel is land: by the coverage's coast and the mask's, each by its share.
  // What follows draws it as land when any of it is.
  bool coarseLand = !water;
  bool fineLand = !offMap && fine > 0.5;
  float landShare = fineShare > 0.0 ? mix(coarseLand ? 1.0 : 0.0, fineLand ? 1.0 : 0.0, fineShare) : (coarseLand ? 1.0 : 0.0);
  water = landShare <= 0.0;
  // Land the cell rule called water takes the strongest land id around it.
  uint fid = best != 0u ? best : secondId;

  vec3 col;
  if (uMode == 5) {
    // Fallout (PLAN 6.3c): the political colours faded, and over them the fallout's colour by its
    // level's square root (light fallout, the plume's wide fringe, still seen), at sea too (a plume
    // falls where the wind takes it).
    col = water ? pal(0u) : mix(fid == 0u ? vec3(0.62, 0.62, 0.58) : pal(fid), vec3(0.78, 0.78, 0.75), ${_.toFixed(3)});
    ivec2 fc = wrapCell(ivec2(floor(cellPos)));
    float fo = uFalloutSize.x > 1 && inMap(fc) ? texelFetch(uFallout, fc, 0).r : 0.0;
    col = mix(col, vec3(${Ss}), ${v.toFixed(3)} * sqrt(fo));
  } else if (uMode == 4) {
    // Air superiority (PLAN 5.7c): an air zone held hatched in its holder's colour, one contested
    // striped the other way. On a ground of no nation's colour (PLAN 5.10, the critic's R5-B1:
    // over the political colours faded, a nation's air over its own land was its colour on its
    // colour, Germany's grey on grey): the land a light neutral, the sea faded.
    col = water ? mix(pal(0u), vec3(0.78, 0.78, 0.75), 0.45) : vec3(0.80, 0.80, 0.76);
    ivec2 ac = wrapCell(ivec2(floor(cellPos)));
    uint azone = inMap(ac) ? texelFetch(uAirZone, ac, 0).r : 0u;
    uint aholder = azone == 0u ? 0u : texelFetch(uAirHolder, ivec2(int(azone % 128u), int(azone / 128u)), 0).r;
    if (aholder == 65535u) {
      float band = step(0.5, fract((gl_FragCoord.x - gl_FragCoord.y) / (10.0 * uDpr)));
      col = mix(col, vec3(${xs}), ${p.toFixed(3)} * band);
    } else if (aholder != 0u) {
      float hatch = step(0.45, fract((gl_FragCoord.x + gl_FragCoord.y) / (8.0 * uDpr)));
      col = mix(col, pal(aholder), mix(${p.toFixed(3)}, 1.0, hatch));
    }
  } else if (water && uMode == 3) {
    // Sea control (PLAN 4.7a): a zone held is tinted with its holder's colour.
    ivec2 sc = wrapCell(ivec2(floor(cellPos)));
    uint zone = inMap(sc) ? texelFetch(uSeaZone, sc, 0).r : 0u;
    uint holder = zone == 0u ? 0u : texelFetch(uSeaHolder, ivec2(int(zone % 128u), int(zone / 128u)), 0).r;
    col = holder == 0u ? pal(0u) : mix(pal(0u), pal(holder), ${d.toFixed(3)});
  } else if (water) {
    col = pal(0u);
#ifdef GROUND
    // The sea floor at T2 and T3 (PLAN 4.7f): shallows lighter, the deep darker, by the ground's share.
    col *= mix(1.0, seaShadeAt(cellPos), uDetail);
#endif
  } else if (uMode == 3) {
    // The land faded, the sea told.
    col = mix(fid == 0u ? vec3(0.62, 0.62, 0.58) : pal(fid), vec3(0.78, 0.78, 0.75), ${f.toFixed(3)});
  } else if (uMode == 1) {
    // Terrain mode: bilinear blend of the four nearest cells' terrain colours.
    vec2 tq = cellPos - 0.5;
    ivec2 t0 = ivec2(floor(tq));
    vec2 tf = tq - floor(tq);
    col = mix(mix(terrainCol(terrainAt(t0)), terrainCol(terrainAt(t0 + ivec2(1, 0))), tf.x),
              mix(terrainCol(terrainAt(t0 + ivec2(0, 1))), terrainCol(terrainAt(t0 + ivec2(1, 1))), tf.x), tf.y);
  } else if (uMode == 2) {
    uint pid = provinceAt(ivec2(floor(cellPos)));
    float u = texelFetch(uUnrest, ivec2(int(pid % 128u), int(pid / 128u)), 0).r;
    col = unrestCol(u);
  } else {
    col = fid == 0u ? vec3(0.62, 0.62, 0.58) : pal(fid);
  }

  // Occupation (controller ≠ rightful owner), smoothed with the same weights so the
  // hatched region has smooth edges and never leaks across the controller border.
  if (!water && uMode == 0 && occ[bi] > 0.5 * acc[bi]) {
    float stripe = step(0.5, fract((gl_FragCoord.x + gl_FragCoord.y) / (7.0 * uDpr)));
#ifdef GROUND
    // With the ground of T2 and T3 the hatching gives way to it (PLAN 2.11f): the two stripes
    // close on the tint between them, by the ground's share, and a little of each is left.
    // (Of the fill, of which the ground keeps OCCUPIED_CAST on occupied land, PLAN 2.14d: so
    // that HATCH_AT_GROUND of the hatching is what is left in the picture.)
    stripe = mix(stripe, 0.5, uDetail * ${(1-as/cs).toFixed(3)});
#endif
    col = mix(col * 0.72, mix(col, pal(occOwner[bi]), 0.35), stripe);
  }

  // The ground of T2 and T3 is the terrain's (PLAN 2.14d, ADR-90). Until then the ground was
  // the fill, lit and grained: Berlin was grey noise for being German, the Alps salmon pink for
  // being Swiss, Chad sky blue for being French. With the ground's share the fill gives way to
  // the colour of the terrain (the blend of the terrain mode), and stays as a cast on it: a
  // little everywhere, so that a view with no border in it still says whose the land is by
  // more than its tags; more towards a border, where the two fills meet as they always did;
  // and more on occupied land, which the tint tells apart (ADR-82). In the modes that colour
  // the land by something else (terrain, unrest) nothing changes.
#ifdef GROUND
  if (uDetail > 0.0 && !water && uMode == 0) {
    vec2 tq = cellPos - 0.5;
    ivec2 t0 = ivec2(floor(tq));
    vec2 tf = tq - floor(tq);
    vec3 terr = mix(mix(terrainCol(terrainAt(t0)), terrainCol(terrainAt(t0 + ivec2(1, 0))), tf.x),
                    mix(terrainCol(terrainAt(t0 + ivec2(0, 1))), terrainCol(terrainAt(t0 + ivec2(1, 1))), tf.x), tf.y);
    // How far inland: 0 on a border, 1 where no other id is within two cells.
    float inland = n > 1 ? acc[bi] - second : 1.0;
    float fillShare = mix(${ss.toFixed(3)}, ${os.toFixed(3)}, smoothstep(0.0, ${ls.toFixed(3)}, inland));
    if (occ[bi] > 0.5 * acc[bi]) fillShare = max(fillShare, ${cs.toFixed(3)});
    col = mix(col, mix(terr, col, fillShare), uDetail);
  }
#endif

  // Hillshade (PLAN 2.8a, ADR-78): the fill is lit by the slope of the ground, the light from
  // the north-west. The height is smoothed over the 4×4 cells around by the cubic B-spline the
  // borders use, and its slope taken from the spline's own derivative: one sample a cell would
  // otherwise show every cell as a facet. Not warped: the ground is where it is.
  // Only in the program that draws the ground (GROUND): the pass of T0 and T1 is compiled
  // without it. (A branch on the share was not enough: with the texture's loop inside it, the
  // pass cost half as much again at T0, where the branch is never taken.)
#ifdef GROUND
  if (uDetail > 0.0 && !water) {
    vec2 e = local - 0.5;
    vec2 fe = floor(e);
    vec2 s = e - fe;
    vec2 s2 = s * s;
    vec2 s3 = s2 * s;
    vec2 oms = 1.0 - s;
    vec4 hx = vec4(oms.x * oms.x * oms.x, 3.0 * s3.x - 6.0 * s2.x + 4.0, -3.0 * s3.x + 3.0 * s2.x + 3.0 * s.x + 1.0, s3.x) / 6.0;
    vec4 hy = vec4(oms.y * oms.y * oms.y, 3.0 * s3.y - 6.0 * s2.y + 4.0, -3.0 * s3.y + 3.0 * s2.y + 3.0 * s.y + 1.0, s3.y) / 6.0;
    vec4 dhx = vec4(-0.5 * oms.x * oms.x, 1.5 * s2.x - 2.0 * s.x, -1.5 * s2.x + s.x + 0.5, 0.5 * s2.x);
    vec4 dhy = vec4(-0.5 * oms.y * oms.y, 1.5 * s2.y - 2.0 * s.y, -1.5 * s2.y + s.y + 0.5, 0.5 * s2.y);
    ivec2 hb = uCenterCell + ivec2(fe) - 1;
    vec2 rise = vec2(0.0); // metres to a cell, east and south
    for (int j = 0; j < 4; j++) {
      for (int i = 0; i < 4; i++) {
        rise += heightAt(hb + ivec2(i, j)) * vec2(dhx[i] * hy[j], hx[i] * dhy[j]);
      }
    }
    vec2 slope = rise * (uRelief / uCellM);

    // Ground texture (PLAN 2.8b). The data has one height in 20 km: the small relief and the
    // grain of the ground are noise, by the kind of ground of the four cells around.
    ivec2 gc = uCenterCell + ivec2(fe);
    vec3 ground = mix(mix(groundOf(gc), groundOf(gc + ivec2(1, 0)), s.x), mix(groundOf(gc + ivec2(0, 1)), groundOf(gc + ivec2(1, 1)), s.x), s.y);
    // Octaves by their wavelength on screen (CSS px): from 256 px down to the finest that is
    // drawn, 16 px at the far end of T2 and 2.5 px from 20 m/px in. So the nearer the camera,
    // the finer the ground; and an octave comes and goes by its weight, a function of the zoom.
    float sc = uScale / uDpr;
    float nearness = 1.0 - smoothstep(4.32, 8.23, log2(uCellM / sc)); // log2 of 20 and of 300 m/px
    float lmin = mix(16.0, 2.5, nearness);
    int k0 = max(0, int(floor(log2(sc / 256.0))));
    vec2 bump = vec2(0.0);
    float grain = 0.0;
    for (int n = 0; n < 10; n++) {
      int k = k0 + n;
      float lambda = sc / float(1 << k);
      if (lambda < lmin * 0.5) break;
      float w = smoothstep(lmin * 0.5, lmin, lambda) * (1.0 - smoothstep(128.0, 256.0, lambda));
      if (w <= 0.0) continue;
      vec3 o = groundOctave(k, local);
      // The broader a rise, the higher it stands: its slope counts for more, by the fourth root of its width.
      bump += o.xy * (w * pow(lambda / 16.0, 0.25));
      grain += o.z * w;
    }
    slope += bump * (uBump * ground.x);

    // The light: from the north-west (x grows east, y south), 41° above the horizon.
    const vec3 light = vec3(-0.5206, -0.5206, 0.6768);
    float lit = dot(normalize(vec3(-slope, 1.0)), light) / light.z - 1.0; // 0 on level ground
    // A soft limit, not a hard one: a slope is from 0.58 to 1.28 of its fill, and the steepest
    // run into the limit gently (a hard one made two tones of a mountainside).
    float shade = 1.0 + (lit > 0.0 ? 0.28 : 0.42) * tanh(lit * (lit > 0.0 ? 2.2 : 1.5));
    col *= mix(1.0, shade * (1.0 + ground.y * grain) * ground.z, uDetail);
  }
#endif

  float d = acc[bi] - second;
  float halfW = 0.5 * uBorderPx * uDpr;
  float fade = smoothstep(0.35, 1.5, uScale / uDpr); // borders fade below ~1.5 px per cell
  bool cellCoast = best == 0u || secondId == 0u;
  // Borders between the two strongest ids (land–land only when the fine coast is drawn), constant
  // width in screen px. |∇d| ≤ 2√2 per cell (each axis' derivative weights sum to ≤ 1), so
  // pixels with d·uScale beyond (halfW + 1)·2√2 are surely off the border and skip the pass.
  if (!water && n > 1 && !(uHasLand == 1 && cellCoast) && d * uScale < (halfW + 1.0) * 2.83) {
    // Distance to the iso-line d = 0 in device px: d / |∇d|, with ∇ per cell → per px (÷ uScale).
    vec2 gd = vec2(0.0);
    for (int j = 0; j < 4; j++) {
      for (int i = 0; i < 4; i++) {
        uint id = ctrlAt(base + ivec2(i, j));
        vec2 dw = vec2(dwx[i] * wy[j], wx[i] * dwy[j]);
        if (id == best) gd += dw;
        else if (id == secondId) gd -= dw;
      }
    }
    float pxDist = d * uScale / max(length(gd), 1e-6);
    float a = (1.0 - smoothstep(halfW - 0.5, halfW + 0.5, pxDist)) * fade;
    vec3 lineCol = cellCoast ? col * 0.8 : mix(col, vec3(0.06, 0.06, 0.08), 0.8);
    col = mix(col, lineCol, a * (cellCoast ? 0.55 : 1.0));
  }
  // Fine coast line on the land side.
  if (uHasLand == 1 && !water) {
    // Each coast has its line, by its share; then the pixel is land by as much as the two say.
    float a = coarseLand ? (1.0 - smoothstep(halfW - 0.5, halfW + 0.5, (cov - 0.5) / covW)) * (1.0 - fineShare) : 0.0;
    if (fineLand) a += (1.0 - smoothstep(halfW - 0.5, halfW + 0.5, (fine - 0.5) / fineW)) * fineShare;
    col = mix(col, col * 0.62, a * 0.8);
    if (fineShare > 0.0) col = mix(pal(0u), col, landShare);
  }
  outColor = vec4(col, 1.0);
}
`,Ts=ws.replace(`#version 300 es
`,`#version 300 es
#define GROUND
`);function Es(e,t){return Math.min(3.5,e*Math.max(1,Math.sqrt(t/2)))}var Ds=class{gl;w;h;program;groundProgram;owner;controller;paletteTex;palette=new Uint8Array(262144);paletteDirty=!0;vao;opts;landTex;terrainTex;hasLand=!1;provinceTex;seaZoneTex;seaHolderTex;airZoneTex;airHolderTex;unrestTex;falloutTex;terrainColors=new Float32Array(36);fillMode=0;elevationTex;hasElevation=!1;relief=!0;ground=rs();maskTex;maskSize=[8,1];maskBand=1;maskBands=0;hasMask=!1;get groundOn(){return this.relief&&this.hasElevation}constructor(e,t,n,r){this.gl=e,this.w=t,this.h=n,this.opts={borderPx:1.25,warp:.32,cellM:2e4,reliefScale:12,bumpSlope:.16,maxTexture:0,...r},this.program=Bo(e,[Cs,ws]),this.groundProgram=Bo(e,[Cs,Ts]),this.owner=this.makeIdTexture(),this.controller=this.makeIdTexture(),this.paletteTex=e.createTexture(),e.bindTexture(e.TEXTURE_2D,this.paletteTex),e.texStorage2D(e.TEXTURE_2D,1,e.RGBA8,256,256),this.setFilter(e.NEAREST),this.vao=e.createVertexArray(),this.landTex=this.makeTexture(e.R8,e.RED,e.UNSIGNED_BYTE,1,1,new Uint8Array([0]),e.LINEAR),this.terrainTex=this.makeTexture(e.R8UI,e.RED_INTEGER,e.UNSIGNED_BYTE,1,1,new Uint8Array([0]),e.NEAREST),this.provinceTex=this.makeTexture(e.R16UI,e.RED_INTEGER,e.UNSIGNED_SHORT,1,1,new Uint16Array([0]),e.NEAREST),this.seaZoneTex=this.makeTexture(e.R16UI,e.RED_INTEGER,e.UNSIGNED_SHORT,1,1,new Uint16Array([0]),e.NEAREST),this.seaHolderTex=this.makeTexture(e.R16UI,e.RED_INTEGER,e.UNSIGNED_SHORT,1,1,new Uint16Array([0]),e.NEAREST),this.airZoneTex=this.makeTexture(e.R16UI,e.RED_INTEGER,e.UNSIGNED_SHORT,1,1,new Uint16Array([0]),e.NEAREST),this.airHolderTex=this.makeTexture(e.R16UI,e.RED_INTEGER,e.UNSIGNED_SHORT,1,1,new Uint16Array([0]),e.NEAREST),this.unrestTex=this.makeTexture(e.R8,e.RED,e.UNSIGNED_BYTE,1,1,new Uint8Array([0]),e.NEAREST),this.falloutTex=this.makeTexture(e.R8,e.RED,e.UNSIGNED_BYTE,1,1,new Uint8Array([0]),e.NEAREST),this.elevationTex=this.makeTexture(e.R16I,e.RED_INTEGER,e.SHORT,1,1,new Int16Array([0]),e.NEAREST),this.maskTex=this.makeBands(1,1,1,new Uint8Array([0]))}get maxTexture(){let e=this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);return this.opts.maxTexture>0?Math.min(e,this.opts.maxTexture):e}setLandMask(e){let t=this.gl,[n,r]=[e.w/8,e.h],i=this.maxTexture,a=Math.max(1,Math.ceil(r/i));for(;r%a!==0;)a++;return!Number.isInteger(n)||n>i||r/a>i||a>t.getParameter(t.MAX_ARRAY_TEXTURE_LAYERS)||e.w%this.w!==0?!1:(t.deleteTexture(this.maskTex),this.maskTex=this.makeBands(n,r/a,a,e.bits),this.maskSize=[e.w,e.h],this.maskBand=r/a,this.maskBands=a,this.hasMask=!0,!0)}makeBands(e,t,n,r){let i=this.gl,a=i.createTexture();i.bindTexture(i.TEXTURE_2D_ARRAY,a),i.pixelStorei(i.UNPACK_ALIGNMENT,1),i.texImage3D(i.TEXTURE_2D_ARRAY,0,i.R8UI,e,t,n,0,i.RED_INTEGER,i.UNSIGNED_BYTE,r);for(let e of[i.TEXTURE_MIN_FILTER,i.TEXTURE_MAG_FILTER])i.texParameteri(i.TEXTURE_2D_ARRAY,e,i.NEAREST);for(let e of[i.TEXTURE_WRAP_S,i.TEXTURE_WRAP_T])i.texParameteri(i.TEXTURE_2D_ARRAY,e,i.CLAMP_TO_EDGE);return a}setElevation(e,t,n){if(e!==this.w||t!==this.h)throw Error(`elevation ${e}×${t} for a map of ${this.w}×${this.h}`);this.gl.deleteTexture(this.elevationTex),this.elevationTex=this.makeTexture(this.gl.R16I,this.gl.RED_INTEGER,this.gl.SHORT,e,t,n,this.gl.NEAREST),this.hasElevation=!0}setProvinces(e,t,n){this.gl.deleteTexture(this.provinceTex),this.provinceTex=this.makeTexture(this.gl.R16UI,this.gl.RED_INTEGER,this.gl.UNSIGNED_SHORT,e,t,n,this.gl.NEAREST)}setSeaZones(e,t,n){this.gl.deleteTexture(this.seaZoneTex),this.seaZoneTex=this.makeTexture(this.gl.R16UI,this.gl.RED_INTEGER,this.gl.UNSIGNED_SHORT,e,t,n,this.gl.NEAREST)}setSeaHolders(e){let t=Math.max(1,Math.ceil(e.length/128)),n=new Uint16Array(t*128);n.set(e),this.gl.deleteTexture(this.seaHolderTex),this.seaHolderTex=this.makeTexture(this.gl.R16UI,this.gl.RED_INTEGER,this.gl.UNSIGNED_SHORT,128,t,n,this.gl.NEAREST)}setAirZones(e,t,n){this.gl.deleteTexture(this.airZoneTex),this.airZoneTex=this.makeTexture(this.gl.R16UI,this.gl.RED_INTEGER,this.gl.UNSIGNED_SHORT,e,t,n,this.gl.NEAREST)}setAirHolders(e){let t=Math.max(1,Math.ceil(e.length/128)),n=new Uint16Array(t*128);n.set(e),this.gl.deleteTexture(this.airHolderTex),this.airHolderTex=this.makeTexture(this.gl.R16UI,this.gl.RED_INTEGER,this.gl.UNSIGNED_SHORT,128,t,n,this.gl.NEAREST)}setFallout(e,t,n,r){if(this.gl.deleteTexture(this.falloutTex),n.length===0){this.falloutTex=this.makeTexture(this.gl.R8,this.gl.RED,this.gl.UNSIGNED_BYTE,1,1,new Uint8Array([0]),this.gl.NEAREST),this.falloutSize=[1,1];return}let i=new Uint8Array(e*t);for(let e=0;e<n.length;e++)i[n[e]]=r[e];this.falloutTex=this.makeTexture(this.gl.R8,this.gl.RED,this.gl.UNSIGNED_BYTE,e,t,i,this.gl.NEAREST),this.falloutSize=[e,t]}falloutSize=[1,1];setUnrest(e){let t=Math.max(1,Math.ceil(e.length/128)),n=new Uint8Array(t*128);for(let t=0;t<e.length;t++)n[t]=Math.round(Math.min(100,e[t])*255/100);this.gl.deleteTexture(this.unrestTex),this.unrestTex=this.makeTexture(this.gl.R8,this.gl.RED,this.gl.UNSIGNED_BYTE,128,t,n,this.gl.NEAREST)}makeTexture(e,t,n,r,i,a,o){let s=this.gl,c=s.createTexture();return s.bindTexture(s.TEXTURE_2D,c),s.pixelStorei(s.UNPACK_ALIGNMENT,1),s.texImage2D(s.TEXTURE_2D,0,e,r,i,0,t,n,a),this.setFilter(o),c}useLand(e){this.hasLand=e&&this.landLoaded}landLoaded=!1;hasTerrain=!1;setLand(e,t,n){this.landLoaded=!0,this.gl.deleteTexture(this.landTex),this.landTex=this.makeTexture(this.gl.R8,this.gl.RED,this.gl.UNSIGNED_BYTE,e,t,n,this.gl.LINEAR),this.hasLand=!0}setTerrain(e,t,n,r){this.gl.deleteTexture(this.terrainTex),this.terrainTex=this.makeTexture(this.gl.R8UI,this.gl.RED_INTEGER,this.gl.UNSIGNED_BYTE,e,t,n,this.gl.NEAREST),this.hasTerrain=!0,r.slice(0,12).forEach((e,t)=>{this.terrainColors[t*3]=(e>>16&255)/255,this.terrainColors[t*3+1]=(e>>8&255)/255,this.terrainColors[t*3+2]=(e&255)/255})}setFilter(e){let t=this.gl;t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)}makeIdTexture(){let e=this.gl,t=e.createTexture();return e.bindTexture(e.TEXTURE_2D,t),e.texStorage2D(e.TEXTURE_2D,1,e.R16UI,this.w,this.h),this.setFilter(e.NEAREST),t}setColor(e,t){let n=e*4;this.palette[n]=t>>16&255,this.palette[n+1]=t>>8&255,this.palette[n+2]=t&255,this.palette[n+3]=255,this.paletteDirty=!0}setGrid(e,t){this.uploadRect(this.owner,0,0,this.w,this.h,e),this.uploadRect(this.controller,0,0,this.w,this.h,t)}updateTile(e,t,n,r,i,a){let o=e*n,s=t*n,c=Math.min(n,this.w-o),l=Math.min(n,this.h-s);if(c<=0||l<=0)return;let u=this.gl;u.pixelStorei(u.UNPACK_ROW_LENGTH,n),this.uploadRect(this.owner,o,s,c,l,r.subarray(a,a+n*n)),this.uploadRect(this.controller,o,s,c,l,i.subarray(a,a+n*n)),u.pixelStorei(u.UNPACK_ROW_LENGTH,0)}uploadRect(e,t,n,r,i,a){let o=this.gl;o.bindTexture(o.TEXTURE_2D,e),o.pixelStorei(o.UNPACK_ALIGNMENT,2),o.texSubImage2D(o.TEXTURE_2D,0,t,n,r,i,o.RED_INTEGER,o.UNSIGNED_SHORT,a)}draw(e,t,n=0){let r=this.gl;this.paletteDirty&&=(r.bindTexture(r.TEXTURE_2D,this.paletteTex),r.pixelStorei(r.UNPACK_ALIGNMENT,4),r.texSubImage2D(r.TEXTURE_2D,0,0,0,256,256,r.RGBA,r.UNSIGNED_BYTE,this.palette),!1);let[i,a]=oe(e.cx),[o,s]=oe(e.cy);r.viewport(0,0,r.drawingBufferWidth,r.drawingBufferHeight);let c=this.groundOn?n:0,l=this.hasMask&&this.hasLand?Os(e.scale*t*this.w/this.maskSize[0]):0,u=c>0?this.groundProgram:this.program;r.useProgram(u.program),Io(u,{uOwner:this.owner,uController:this.controller,uPalette:this.paletteTex,uMapSize:[this.w,this.h],uCenterCell:[i,o],uCenterFrac:[a,s],uScale:e.scale*t,uViewport:[r.drawingBufferWidth,r.drawingBufferHeight],uDpr:t,uWrapX:+!!this.opts.wrapX,uBorderPx:Es(this.opts.borderPx,e.scale),uWarp:this.opts.warp,uLand:this.landTex,uHasLand:+!!this.hasLand,uHasTerrain:+!!this.hasTerrain,uTerrain:this.terrainTex,uMode:this.fillMode,uProvince:this.provinceTex,uUnrest:this.unrestTex,uFallout:this.falloutTex,uFalloutSize:this.falloutSize,uSeaZone:this.seaZoneTex,uSeaHolder:this.seaHolderTex,uAirZone:this.airZoneTex,uAirHolder:this.airHolderTex,uTerrainCol:this.terrainColors,uElevation:this.elevationTex,uDetail:c,uCellM:this.opts.cellM,uRelief:this.opts.reliefScale,uGround:this.ground,uBump:this.opts.bumpSlope,uMask:this.maskTex,uHasMask:+!!this.hasMask,uMaskSize:this.maskSize,uMaskBand:this.maskBand,uMaskPerCell:this.maskSize[0]/this.w,uFine:l}),r.bindVertexArray(this.vao),r.drawArrays(r.TRIANGLES,0,3),r.bindVertexArray(null)}dispose(){let e=this.gl;e.deleteTexture(this.owner),e.deleteTexture(this.controller),e.deleteTexture(this.paletteTex),e.deleteTexture(this.landTex),e.deleteTexture(this.terrainTex),e.deleteTexture(this.provinceTex),e.deleteTexture(this.unrestTex),e.deleteTexture(this.falloutTex),e.deleteTexture(this.seaZoneTex),e.deleteTexture(this.seaHolderTex),e.deleteTexture(this.airZoneTex),e.deleteTexture(this.airHolderTex),e.deleteTexture(this.elevationTex),e.deleteTexture(this.maskTex),e.deleteVertexArray(this.vao),e.deleteProgram(this.program.program),e.deleteProgram(this.groundProgram.program)}};function Os(e){let t=Math.min(1,Math.max(0,e-1));return t*t*(3-2*t)}export{m as C,ie as E,h as S,y as T,ge as _,bs as a,x as b,ki as c,xe as d,_e as f,pe as g,de as h,ys as i,Io as l,he as m,vs as n,is as o,le as p,_s as r,Bo as s,Ds as t,fe as u,me as v,e as w,ae as x,b as y};
//# sourceMappingURL=MapRenderer-DUzrLcZT.js.map