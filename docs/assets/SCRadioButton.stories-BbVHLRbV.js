import{r as _e,R as t}from"./index-BVW8D_1y.js";import{j as b}from"./jsx-runtime-CniKdCFI.js";import{f as $,u as M,b as V,c as J,g as H,B as U,d as q,e as ke}from"./factory-CxM5CVDB.js";import{r as ee,p as be,a as D}from"./MantineThemeProvider-3Ly_klpC.js";import{g as Re}from"./get-contrast-color-D3mmixc0.js";import{g as fe}from"./get-auto-contrast-value-Da6zqqWm.js";import{I as je,a as Pe}from"./InputsGroupFieldset-Cp2dQq1T.js";import{u as Ae}from"./DirectionProvider-CLUDE2bQ.js";import{U as We}from"./UnstyledButton-BK3SNOQq.js";import{c as ge,I as Ce}from"./Input-D6LxCvUw.js";import{u as Se}from"./use-id-CKk3Bls3.js";import{u as ze}from"./use-uncontrolled-GHWci0RL.js";import"./_commonjsHelpers-BosuxZz1.js";import"./polymorphic-factory-9vZrh0Ar.js";const[Ne,ye]=ge(),[Te,qe]=ge();var Be={card:"m_9dc8ae12"};const De={withBorder:!0},$e=J((e,{radius:a})=>({card:{"--card-radius":H(a)}})),L=$((e,a)=>{const o=M("RadioCard",De,e),{classNames:r,className:i,style:l,styles:s,unstyled:n,vars:m,checked:p,mod:C,withBorder:R,value:B,onClick:E,name:S,onKeyDown:g,...j}=o,G=V({name:"RadioCard",classes:Be,props:o,className:i,style:l,classNames:r,styles:s,unstyled:n,vars:m,varsResolver:$e,rootSelector:"card"}),{dir:y}=Ae(),v=ye(),w=typeof p=="boolean"?p:(v==null?void 0:v.value)===B||!1,x=S||(v==null?void 0:v.name),P=c=>{if(g==null||g(c),["ArrowDown","ArrowUp","ArrowLeft","ArrowRight"].includes(c.nativeEvent.code)){c.preventDefault();const h=Array.from(document.querySelectorAll(`[role="radio"][name="${x||"__mantine"}"]`)),_=h.findIndex(F=>F===c.target),f=_+1>=h.length?0:_+1,d=_-1<0?h.length-1:_-1;c.nativeEvent.code==="ArrowDown"&&(h[f].focus(),h[f].click()),c.nativeEvent.code==="ArrowUp"&&(h[d].focus(),h[d].click()),c.nativeEvent.code==="ArrowLeft"&&(h[y==="ltr"?d:f].focus(),h[y==="ltr"?d:f].click()),c.nativeEvent.code==="ArrowRight"&&(h[y==="ltr"?f:d].focus(),h[y==="ltr"?f:d].click())}};return b.jsx(Te,{value:{checked:w},children:b.jsx(We,{ref:a,mod:[{"with-border":R,checked:w},C],...G("card"),...j,role:"radio","aria-checked":w,name:x,onClick:c=>{E==null||E(c),v==null||v.onChange(B||"")},onKeyDown:P})})});L.displayName="@mantine/core/RadioCard";L.classes=Be;const Me={},K=$((e,a)=>{const{value:o,defaultValue:r,onChange:i,size:l,wrapperProps:s,children:n,name:m,readOnly:p,...C}=M("RadioGroup",Me,e),R=Se(m),[B,E]=ze({value:o,defaultValue:r,finalValue:"",onChange:i}),S=g=>!p&&E(typeof g=="string"?g:g.currentTarget.value);return b.jsx(Ne,{value:{value:B,onChange:S,size:l,name:R},children:b.jsx(Ce.Wrapper,{size:l,ref:a,...s,...C,labelElement:"div",__staticSelector:"RadioGroup",children:b.jsx(je,{role:"radiogroup",children:n})})})});K.classes=Ce.Wrapper.classes;K.displayName="@mantine/core/RadioGroup";function Ee({size:e,style:a,...o}){return b.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 5 5",style:{width:ee(e),height:ee(e),...a},"aria-hidden":!0,...o,children:b.jsx("circle",{cx:"2.5",cy:"2.5",r:"2.5",fill:"currentColor"})})}var we={indicator:"m_717d7ff6",icon:"m_3e4da632","indicator--outline":"m_2980836c"};const Fe={icon:Ee},Oe=J((e,{radius:a,color:o,size:r,iconColor:i,variant:l,autoContrast:s})=>{const n=be({color:o||e.primaryColor,theme:e}),m=n.isThemeColor&&n.shade===void 0?`var(--mantine-color-${n.color}-outline)`:n.color;return{indicator:{"--radio-size":q(r,"radio-size"),"--radio-radius":a===void 0?void 0:H(a),"--radio-color":l==="outline"?m:D(o,e),"--radio-icon-size":q(r,"radio-icon-size"),"--radio-icon-color":i?D(i,e):fe(s,e)?Re({color:o,theme:e,autoContrast:s}):void 0}}}),Q=$((e,a)=>{const o=M("RadioIndicator",Fe,e),{classNames:r,className:i,style:l,styles:s,unstyled:n,vars:m,icon:p,radius:C,color:R,iconColor:B,autoContrast:E,checked:S,mod:g,variant:j,disabled:G,...y}=o,v=p,w=V({name:"RadioIndicator",classes:we,props:o,className:i,style:l,classNames:r,styles:s,unstyled:n,vars:m,varsResolver:Oe,rootSelector:"indicator"}),x=qe(),P=typeof S=="boolean"?S:(x==null?void 0:x.checked)||!1;return b.jsx(U,{ref:a,...w("indicator",{variant:j}),variant:j,mod:[{checked:P,disabled:G},g],...y,children:b.jsx(v,{...w("icon")})})});Q.displayName="@mantine/core/RadioIndicator";Q.classes=we;var xe={root:"m_f3f1af94",inner:"m_89c4f5e4",icon:"m_f3ed6b2b",radio:"m_8a3dbb89","radio--outline":"m_1bfe9d39"};const Ue={labelPosition:"right"},Ve=J((e,{size:a,radius:o,color:r,iconColor:i,variant:l,autoContrast:s})=>{const n=be({color:r||e.primaryColor,theme:e}),m=n.isThemeColor&&n.shade===void 0?`var(--mantine-color-${n.color}-outline)`:n.color;return{root:{"--radio-size":q(a,"radio-size"),"--radio-radius":o===void 0?void 0:H(o),"--radio-color":l==="outline"?m:D(r,e),"--radio-icon-color":i?D(i,e):fe(s,e)?Re({color:r,theme:e,autoContrast:s}):void 0,"--radio-icon-size":q(a,"radio-icon-size")}}}),I=$((e,a)=>{const o=M("Radio",Ue,e),{classNames:r,className:i,style:l,styles:s,unstyled:n,vars:m,id:p,size:C,label:R,labelPosition:B,description:E,error:S,radius:g,color:j,variant:G,disabled:y,wrapperProps:v,icon:w=Ee,rootRef:x,iconColor:P,onChange:c,mod:h,..._}=o,f=V({name:"Radio",classes:xe,props:o,className:i,style:l,classNames:r,styles:s,unstyled:n,vars:m,varsResolver:Ve}),d=ye(),F=(d==null?void 0:d.size)??C,Ie=o.size?C:F,{styleProps:Ge,rest:O}=ke(_),X=Se(p),Y=d?{checked:d.value===O.value,name:O.name??d.name,onChange:Z=>{d.onChange(Z),c==null||c(Z)}}:{};return b.jsx(Pe,{...f("root"),__staticSelector:"Radio",__stylesApiProps:o,id:X,size:Ie,labelPosition:B,label:R,description:E,error:S,disabled:y,classNames:r,styles:s,unstyled:n,"data-checked":Y.checked||void 0,variant:G,ref:x,mod:h,...Ge,...v,children:b.jsxs(U,{...f("inner"),mod:{"label-position":B},children:[b.jsx(U,{...f("radio",{focusable:!0,variant:G}),onChange:c,...O,...Y,component:"input",mod:{error:!!S},ref:a,id:X,disabled:y,type:"radio"}),b.jsx(w,{...f("icon"),"aria-hidden":!0})]})})});I.classes=xe;I.displayName="@mantine/core/Radio";I.Group=K;I.Card=L;I.Indicator=Q;function k({children:e,name:a,label:o,hint:r,required:i,onChange:l,value:s,orientation:n,valueOutputConverter:m=p=>p}){const p=_e.useRef();function C(R){R&&(R=m(R)),l&&l({name:a,value:R,target:p.current})}return t.createElement(I.Group,{ref:p,name:a,label:o,description:r,withAsterisk:i,onChange:C,value:s,styles:{root:{gap:0}}},e)}function u({disabled:e,label:a,key:o,value:r}){const i={disabled:e,label:a,key:o,value:r};return React.createElement(I,{mt:"0.5rem",...i,color:"scBlue"})||React.createElement(React.Fragment,null,React.createElement("div",{className:"input-container"},React.createElement(I,{disabled:e,label:a,key:o,value:r})),React.createElement("style",{jsx:!0},`

              .input-container {
                margin-top: 0.5rem;
              }

            `))}const io={title:"Form Controls/SCRadioButtonGroup",component:k,tags:["autodocs"],argTypes:{label:{control:"text",description:"Group label shown above the options"},hint:{control:"text",description:"Helper text below the label"},required:{control:"boolean",description:"Shows asterisk on the group label"},value:{control:"text",description:"Currently selected value"},onChange:{action:"changed"}},parameters:{docs:{description:{component:`SCRadioButton and SCRadioButtonGroup work together to create radio button sets.

- **SCRadioButtonGroup** — the container. Manages selection state and fires
  \`onChange({ name, value })\` when the user picks an option.
- **SCRadioButton** — individual radio option. Place these as children
  inside SCRadioButtonGroup.

Both render Mantine Radio components with the \`scBlue\` brand colour.

**States:** Default · With selection · Required · With hint · Disabled option`}}}},A={args:{label:"Job type",name:"jobType"},render:e=>t.createElement(k,{...e},t.createElement(u,{value:"install",label:"Installation"}),t.createElement(u,{value:"service",label:"Service"}),t.createElement(u,{value:"repair",label:"Repair"}))},W={args:{label:"Job type",name:"jobType",value:"service"},render:e=>t.createElement(k,{...e},t.createElement(u,{value:"install",label:"Installation"}),t.createElement(u,{value:"service",label:"Service"}),t.createElement(u,{value:"repair",label:"Repair"}))},z={args:{label:"Invoice frequency",name:"invoiceFreq",required:!0},render:e=>t.createElement(k,{...e},t.createElement(u,{value:"weekly",label:"Weekly"}),t.createElement(u,{value:"fortnightly",label:"Fortnightly"}),t.createElement(u,{value:"monthly",label:"Monthly"}))},N={args:{label:"Billing method",name:"billing",hint:"This determines how invoices are generated for this customer"},render:e=>t.createElement(k,{...e},t.createElement(u,{value:"auto",label:"Automatic (on job completion)"}),t.createElement(u,{value:"manual",label:"Manual (I will create invoices)"}))},T={name:"With a disabled option",args:{label:"Notification preference",name:"notif",value:"email"},render:e=>t.createElement(k,{...e},t.createElement(u,{value:"email",label:"Email"}),t.createElement(u,{value:"sms",label:"SMS",disabled:!0}),t.createElement(u,{value:"push",label:"Push notification",disabled:!0}))};var oe,ae,re;A.parameters={...A.parameters,docs:{...(oe=A.parameters)==null?void 0:oe.docs,source:{originalSource:`{
  args: {
    label: 'Job type',
    name: 'jobType'
  },
  render: args => <SCRadioButtonGroup {...args}>
      <SCRadioButton value="install" label="Installation" />
      <SCRadioButton value="service" label="Service" />
      <SCRadioButton value="repair" label="Repair" />
    </SCRadioButtonGroup>
}`,...(re=(ae=A.parameters)==null?void 0:ae.docs)==null?void 0:re.source}}};var te,ne,ie;W.parameters={...W.parameters,docs:{...(te=W.parameters)==null?void 0:te.docs,source:{originalSource:`{
  args: {
    label: 'Job type',
    name: 'jobType',
    value: 'service'
  },
  render: args => <SCRadioButtonGroup {...args}>
      <SCRadioButton value="install" label="Installation" />
      <SCRadioButton value="service" label="Service" />
      <SCRadioButton value="repair" label="Repair" />
    </SCRadioButtonGroup>
}`,...(ie=(ne=W.parameters)==null?void 0:ne.docs)==null?void 0:ie.source}}};var se,le,ce;z.parameters={...z.parameters,docs:{...(se=z.parameters)==null?void 0:se.docs,source:{originalSource:`{
  args: {
    label: 'Invoice frequency',
    name: 'invoiceFreq',
    required: true
  },
  render: args => <SCRadioButtonGroup {...args}>
      <SCRadioButton value="weekly" label="Weekly" />
      <SCRadioButton value="fortnightly" label="Fortnightly" />
      <SCRadioButton value="monthly" label="Monthly" />
    </SCRadioButtonGroup>
}`,...(ce=(le=z.parameters)==null?void 0:le.docs)==null?void 0:ce.source}}};var de,ue,me;N.parameters={...N.parameters,docs:{...(de=N.parameters)==null?void 0:de.docs,source:{originalSource:`{
  args: {
    label: 'Billing method',
    name: 'billing',
    hint: 'This determines how invoices are generated for this customer'
  },
  render: args => <SCRadioButtonGroup {...args}>
      <SCRadioButton value="auto" label="Automatic (on job completion)" />
      <SCRadioButton value="manual" label="Manual (I will create invoices)" />
    </SCRadioButtonGroup>
}`,...(me=(ue=N.parameters)==null?void 0:ue.docs)==null?void 0:me.source}}};var pe,ve,he;T.parameters={...T.parameters,docs:{...(pe=T.parameters)==null?void 0:pe.docs,source:{originalSource:`{
  name: 'With a disabled option',
  args: {
    label: 'Notification preference',
    name: 'notif',
    value: 'email'
  },
  render: args => <SCRadioButtonGroup {...args}>
      <SCRadioButton value="email" label="Email" />
      <SCRadioButton value="sms" label="SMS" disabled />
      <SCRadioButton value="push" label="Push notification" disabled />
    </SCRadioButtonGroup>
}`,...(he=(ve=T.parameters)==null?void 0:ve.docs)==null?void 0:he.source}}};const so=["Default","WithSelection","Required","WithHint","WithDisabledOption"];export{A as Default,z as Required,T as WithDisabledOption,N as WithHint,W as WithSelection,so as __namedExportsOrder,io as default};
