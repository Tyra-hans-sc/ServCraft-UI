import{S as q}from"./sc-number-control-RSBaemiB.js";import"./index-BVW8D_1y.js";import"./_commonjsHelpers-BosuxZz1.js";import"./NumberInput-CJSzm9F-.js";import"./jsx-runtime-CniKdCFI.js";import"./factory-CxM5CVDB.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./use-resolved-styles-api-B7PIHi2u.js";import"./InputBase-4-rtI6FH.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./Input-D6LxCvUw.js";import"./use-id-CKk3Bls3.js";import"./use-input-props-BJ-Ugm8W.js";import"./UnstyledButton-BK3SNOQq.js";import"./use-uncontrolled-GHWci0RL.js";import"./use-merged-ref-CANbyt_7.js";import"./clamp-DTmYCdls.js";const k={title:"Form Controls V2/ScNumberControl",component:q,tags:["autodocs"],argTypes:{label:{control:"text",description:"Field label"},error:{control:"text",description:"Validation error message"},required:{control:"boolean",description:"Marks the field as required"},disabled:{control:"boolean",description:"Prevents interaction"},min:{control:"number",description:"Minimum allowed value"},max:{control:"number",description:"Maximum allowed value"},selectOnFocus:{control:"boolean",description:"Selects value text on focus"},prefix:{control:"text",description:"Symbol before the value (e.g. $)"},suffix:{control:"text",description:"Symbol after the value (e.g. %)"}},parameters:{docs:{description:{component:"ScNumberControl is the Mantine v7 number input for ServCraft V2 forms. It\nwraps Mantine's `NumberInput` with `selectOnFocus` behaviour enabled by default.\n\n**Props:**\n- All Mantine `NumberInputProps` are accepted\n- `selectOnFocus` — selects all text on focus (default: `true`)\n- `label` — field label\n- `min` / `max` — allowed range\n- `prefix` / `suffix` — currency or unit symbols\n\n**States:** Default · With prefix · With suffix · Error · Disabled"}}}},e={args:{label:"Quantity",value:1,min:0}},r={args:{label:"Unit price",value:125,prefix:"$",decimalScale:2,fixedDecimalScale:!0}},a={args:{label:"Discount",value:10,suffix:"%",min:0,max:100}},t={args:{label:"Quantity",error:"Quantity must be greater than 0"}},o={args:{label:"Hours",required:!0,min:0}},n={args:{label:"Total (calculated)",value:375,prefix:"$",disabled:!0}};var s,i,l;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    label: 'Quantity',
    value: 1,
    min: 0
  }
}`,...(l=(i=e.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var c,u,m;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    label: 'Unit price',
    value: 125.0,
    prefix: '$',
    decimalScale: 2,
    fixedDecimalScale: true
  }
}`,...(m=(u=r.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var p,d,b;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    label: 'Discount',
    value: 10,
    suffix: '%',
    min: 0,
    max: 100
  }
}`,...(b=(d=a.parameters)==null?void 0:d.docs)==null?void 0:b.source}}};var f,g,x;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    label: 'Quantity',
    error: 'Quantity must be greater than 0'
  }
}`,...(x=(g=t.parameters)==null?void 0:g.docs)==null?void 0:x.source}}};var S,v,y;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    label: 'Hours',
    required: true,
    min: 0
  }
}`,...(y=(v=o.parameters)==null?void 0:v.docs)==null?void 0:y.source}}};var h,D,C;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: 'Total (calculated)',
    value: 375.0,
    prefix: '$',
    disabled: true
  }
}`,...(C=(D=n.parameters)==null?void 0:D.docs)==null?void 0:C.source}}};const A=["Default","Currency","Percentage","WithError","Required","Disabled"];export{r as Currency,e as Default,n as Disabled,a as Percentage,o as Required,t as WithError,A as __namedExportsOrder,k as default};
