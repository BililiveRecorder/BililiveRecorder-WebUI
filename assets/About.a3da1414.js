import{_ as C,d as U,r as p,o as V,a as y,g as b,s as k,V as w,b as l,c as B,e as s,u as e,N as x,w as r,f as o,h as E,i as m,j as N,k as D,t as f,l as d,m as t,p as S,n as F,q as I,E as W,v as g,x as G,y as n}from"./index.34310fa8.js";var L="./assets/funthing.bc6b66cc.png";const R=_=>(S("data-v-f0e8801c"),_=_(),F(),_),A={class:"about-container"},H=t("\u5173\u4E8E"),M={class:"webui-about"},P=t("BililiveRecorder-WebUI "),T=t(" \u5D4C\u5165\u7248\u672C "),j=t("Github: "),q=t(" https://github.com/BililiveRecorder/BililiveRecorder-WebUI"),O=t("Copyright (C) 2022 "),$=t("Shugen002"),z=R(()=>o("p",null,"GNU General Public License v3.0",-1)),J=t(" \u95EE\u9898\u53CD\u9988 "),K=t(" \u53D1\u5E03\u65E5\u5FD7 "),Q=t(" \u66F4\u65B0\u7248\u672C "),X={key:0},Y={style:{"white-space":"pre-wrap"}},Z={class:"server-about"},ee=t("BililiveRecorder "),te=t("Github: "),re=t(" https://github.com/Bililive/BililiveRecorder"),se=R(()=>o("p",null,"GNU General Public License v3.0",-1)),oe=t("\u95EE\u9898\u53CD\u9988 "),ae=t("\u53D1\u5E03\u65E5\u5FD7 "),ie=t("\u66F4\u65B0\u7248\u672C "),le={key:0},ue={style:{"white-space":"pre-wrap"}},ce=R(()=>o("div",{class:"funthing"},[o("img",{src:L,alt:""})],-1)),de=U({setup(_){const h=p(""),a=p({webui:{version:"v0.0.0",url:"https://github.com/BililiveRecorder/BililiveRecorder-WebUI/releases/latest",body:""},recorder:{version:"v0.0.0",url:"https://github.com/BililiveRecorder/BililiveRecorder/releases/latest",body:""}}),v=p(!1),u=p(!1);return V(()=>{y.recorder!==null?y.recorder.getVersion().then(i=>{h.value=i.fullSemVer,b().then(c=>{a.value.recorder=c.recorder;try{k.compare(i.fullSemVer,c.recorder.version)<0&&(u.value=!0)}catch{u.value=!0}}).catch(()=>{})}).catch(i=>{b().then(c=>{u.value=!0,a.value.recorder=c.recorder}).catch(()=>{}),console.error(i),h.value="unknown"}):b().then(i=>{u.value=!0,a.value.recorder=i.recorder}).catch(()=>{}),b().then(i=>{a.value.webui=i.webui;try{k.compare(w,i.webui.version)<0&&(v.value=!0)}catch{v.value=!0}}).catch(()=>{})}),(i,c)=>(l(),B("div",A,[s(e(x),null,{default:r(()=>[H]),_:1}),o("div",M,[s(e(E),{prefix:"bar"},{default:r(()=>[P,s(I,{version:e(w),type:"webui",cache:!1},null,8,["version"]),e(W)?(l(),g(e(G),{key:0},{default:r(()=>[T]),_:1})):d("",!0)]),_:1}),o("p",null,[j,s(e(m),{href:"https://github.com/BililiveRecorder/BililiveRecorder-WebUI",target:"_blank"},{default:r(()=>[q]),_:1})]),o("p",null,[O,s(e(m),{href:"https://github.com/shugen002",target:"_blank"},{default:r(()=>[$]),_:1})]),z,o("p",null,[s(e(N),null,{default:r(()=>[s(e(n),{tag:"a",target:"_blank",href:"https://github.com/BililiveRecorder/BililiveRecorder-WebUI/issues"},{default:r(()=>[J]),_:1}),s(e(n),{tag:"a",target:"_blank",href:"https://github.com/BililiveRecorder/BililiveRecorder-WebUI/releases"},{default:r(()=>[K]),_:1}),v.value?(l(),g(e(n),{key:0,tag:"a",target:"_blank",href:a.value.webui.url},{default:r(()=>[Q]),_:1},8,["href"])):d("",!0)]),_:1})]),v.value?(l(),B("div",X,[s(e(D),{prefix:"bar"},{default:r(()=>[t(f(a.value.webui.version)+" \u66F4\u65B0\u65E5\u5FD7",1)]),_:1}),o("pre",Y,f(a.value.webui.body),1)])):d("",!0)]),o("div",Z,[s(e(E),{prefix:"bar"},{default:r(()=>[ee,h.value?(l(),g(I,{key:0,version:h.value,type:"recorder",cache:!1},null,8,["version"])):d("",!0)]),_:1}),o("p",null,[te,s(e(m),{href:"https://github.com/Bililive/BililiveRecorder",target:"_blank"},{default:r(()=>[re]),_:1})]),se,o("p",null,[s(e(N),null,{default:r(()=>[s(e(n),{tag:"a",target:"_blank",href:"https://github.com/BililiveRecorder/BililiveRecorder/issues"},{default:r(()=>[oe]),_:1}),s(e(n),{tag:"a",target:"_blank",href:"https://github.com/BililiveRecorder/BililiveRecorder/releases"},{default:r(()=>[ae]),_:1}),u.value?(l(),g(e(n),{key:0,tag:"a",target:"_blank",href:a.value.recorder.url},{default:r(()=>[ie]),_:1},8,["href"])):d("",!0)]),_:1})]),u.value?(l(),B("div",le,[s(e(D),{prefix:"bar"},{default:r(()=>[t(f(a.value.recorder.version)+" \u66F4\u65B0\u65E5\u5FD7",1)]),_:1}),o("pre",ue,f(a.value.recorder.body),1)])):d("",!0)]),ce]))}});var he=C(de,[["__scopeId","data-v-f0e8801c"]]);export{he as default};