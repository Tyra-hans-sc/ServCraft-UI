import{r as g,R as b}from"./index-BVW8D_1y.js";import{N as ae}from"./no-ssr-D3RVQ5dx.js";import{N as r}from"./enums-DkpuAbLR.js";import{S as ne}from"./sc-number-control-RSBaemiB.js";import"./_commonjsHelpers-BosuxZz1.js";import"./NumberInput-CJSzm9F-.js";import"./jsx-runtime-CniKdCFI.js";import"./factory-CxM5CVDB.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./use-resolved-styles-api-B7PIHi2u.js";import"./InputBase-4-rtI6FH.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./Input-D6LxCvUw.js";import"./use-id-CKk3Bls3.js";import"./use-input-props-BJ-Ugm8W.js";import"./UnstyledButton-BK3SNOQq.js";import"./use-uncontrolled-GHWci0RL.js";import"./use-merged-ref-CANbyt_7.js";import"./clamp-DTmYCdls.js";function oe({name:d,value:A,label:K,hint:U="",required:_=!1,readOnly:$=!1,disabled:j=!1,error:z=void 0,format:t=r.Decimal,onChange:p,extraClasses:se="",cypress:ie="",min:B,max:G,signed:le=!0,selectOnFocus:J=!0,alignRight:L=!1,...X}){const Y={name:d,value:A??"",label:K,description:U,required:_,readOnly:$,disabled:j,error:z,min:B,max:G},[Z,ue]=g.useState(t===r.Integer?{decimalScale:0}:t===r.Percentage?{decimalScale:2}:t===r.Currency?{decimalScale:2,fixedDecimalScale:!0}:t===r.Decimal?{decimalScale:2}:{}),a=g.useRef(null);function ee(e){(e.key==="e"||e.key==="E")&&e.preventDefault(),t===r.Integer&&e.key==="."&&e.preventDefault()}const re=e=>{if(t===r.Integer){let te=e;e=parseInt((e==null?void 0:e.toString())??"0"),e!==te&&setTimeout(()=>{a.current&&(a.current.value=e)})}p&&p({target:a.current,name:d,value:e})};return b.createElement(ae,null,b.createElement(ne,{hideControls:!0,onKeyDown:ee,...Y,...Z,...X,innerRef:a,decimalSeparator:".",onChange:re,selectOnFocus:J,styles:{input:{textAlign:L?"end":"start"}}}))}const Ee={title:"Form Controls/SCNumericInput",component:oe,tags:["autodocs"],argTypes:{label:{control:"text",description:"Field label"},hint:{control:"text",description:"Helper text below the input"},error:{control:"text",description:"Validation error message"},value:{control:"number",description:"Controlled value"},required:{control:"boolean",description:"Marks the field as required"},disabled:{control:"boolean",description:"Prevents interaction"},readOnly:{control:"boolean",description:"Shows value without editing"},min:{control:"number",description:"Minimum allowed value"},max:{control:"number",description:"Maximum allowed value"},alignRight:{control:"boolean",description:"Right-aligns the number value"},onChange:{action:"changed"}},parameters:{docs:{description:{component:`SCNumericInput is the standard number input for ServCraft forms. It wraps
Mantine's NumberInput with currency, percentage, decimal, and integer formatting.

**Format variants:**
- \`Decimal\` — default, 2 decimal places
- \`Integer\` — whole numbers only
- \`Currency\` — prefixed with $
- \`Percentage\` — suffixed with %

**States:** Default · Error · Disabled · ReadOnly · Required`}}}},n={args:{name:"quantity",label:"Quantity",value:0,min:0}},o={args:{name:"price",label:"Unit price",value:125.5}},s={args:{name:"hours",label:"Hours worked",value:8,hint:"Enter the number of hours to the nearest quarter hour"}},i={args:{name:"qty",label:"Quantity",value:-1,min:0,error:"Quantity must be 0 or greater"}},l={args:{name:"amount",label:"Invoice amount",required:!0}},u={args:{name:"total",label:"Calculated total",value:340,disabled:!0}},c={args:{name:"tax",label:"Tax amount",value:34,readOnly:!0}},m={name:"Right-aligned",args:{name:"cost",label:"Cost",value:99.99,alignRight:!0}};var h,f,y;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    name: 'quantity',
    label: 'Quantity',
    value: 0,
    min: 0
  }
}`,...(y=(f=n.parameters)==null?void 0:f.docs)==null?void 0:y.source}}};var S,v,R;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    name: 'price',
    label: 'Unit price',
    value: 125.5
  }
}`,...(R=(v=o.parameters)==null?void 0:v.docs)==null?void 0:R.source}}};var x,C,w;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    name: 'hours',
    label: 'Hours worked',
    value: 8,
    hint: 'Enter the number of hours to the nearest quarter hour'
  }
}`,...(w=(C=s.parameters)==null?void 0:C.docs)==null?void 0:w.source}}};var D,q,I;i.parameters={...i.parameters,docs:{...(D=i.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    name: 'qty',
    label: 'Quantity',
    value: -1,
    min: 0,
    error: 'Quantity must be 0 or greater'
  }
}`,...(I=(q=i.parameters)==null?void 0:q.docs)==null?void 0:I.source}}};var N,E,O;l.parameters={...l.parameters,docs:{...(N=l.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    name: 'amount',
    label: 'Invoice amount',
    required: true
  }
}`,...(O=(E=l.parameters)==null?void 0:E.docs)==null?void 0:O.source}}};var k,P,Q;u.parameters={...u.parameters,docs:{...(k=u.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    name: 'total',
    label: 'Calculated total',
    value: 340.0,
    disabled: true
  }
}`,...(Q=(P=u.parameters)==null?void 0:P.docs)==null?void 0:Q.source}}};var W,F,H;c.parameters={...c.parameters,docs:{...(W=c.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    name: 'tax',
    label: 'Tax amount',
    value: 34.0,
    readOnly: true
  }
}`,...(H=(F=c.parameters)==null?void 0:F.docs)==null?void 0:H.source}}};var M,T,V;m.parameters={...m.parameters,docs:{...(M=m.parameters)==null?void 0:M.docs,source:{originalSource:`{
  name: 'Right-aligned',
  args: {
    name: 'cost',
    label: 'Cost',
    value: 99.99,
    alignRight: true
  }
}`,...(V=(T=m.parameters)==null?void 0:T.docs)==null?void 0:V.source}}};const Oe=["Default","WithValue","WithHint","WithError","Required","Disabled","ReadOnly","AlignRight"];export{m as AlignRight,n as Default,u as Disabled,c as ReadOnly,l as Required,i as WithError,s as WithHint,o as WithValue,Oe as __namedExportsOrder,Ee as default};
