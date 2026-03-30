import{R as s,r as E}from"./index-BVW8D_1y.js";import{S as A}from"./sc-pill-CAQnAvKG.js";import"./_commonjsHelpers-BosuxZz1.js";import"./Group-B1Wj5x_m.js";import"./jsx-runtime-CniKdCFI.js";import"./factory-CxM5CVDB.js";import"./MantineThemeProvider-3Ly_klpC.js";const F={title:"Form Controls/SCPill",component:A,tags:["autodocs"],argTypes:{disabled:{control:"boolean",description:"Prevents toggling any pill"},onChange:{action:"changed"}},parameters:{docs:{description:{component:"SCPill renders a group of selectable pill/tag buttons. Each item has a\n`label` and a `selected` boolean. Clicking a pill toggles its selection\nand fires `onChange` with the updated items array.\n\n**Props:**\n- `items` — array of `{ label: string; selected: boolean }`\n- `onChange` — called with the full updated items array\n- `disabled` — prevents toggling\n\n**Variants:** Default · Pre-selected · Multiple selected · Disabled"}}}},a=["Monday","Tuesday","Wednesday","Thursday","Friday"].map(e=>({label:e,selected:!1})),c=e=>{const[t,r]=E.useState(e.items??a);return s.createElement(A,{...e,items:t,onChange:r})},n={render:e=>s.createElement(c,{...e,items:a})},o={name:"Pre-selected items",render:e=>s.createElement(c,{...e,items:a.map((t,r)=>({...t,selected:r===0||r===2}))})},l={name:"All selected",render:e=>s.createElement(c,{...e,items:a.map(t=>({...t,selected:!0}))})},d={render:e=>s.createElement(c,{...e,items:a.map((t,r)=>({...t,selected:r<2})),disabled:!0})};var i,m,p;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <Controlled {...args} items={DAYS} />
}`,...(p=(m=n.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var g,u,S;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  name: 'Pre-selected items',
  render: args => <Controlled {...args} items={DAYS.map((d, i) => ({
    ...d,
    selected: i === 0 || i === 2
  }))} />
}`,...(S=(u=o.parameters)==null?void 0:u.docs)==null?void 0:S.source}}};var b,h,C;l.parameters={...l.parameters,docs:{...(b=l.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'All selected',
  render: args => <Controlled {...args} items={DAYS.map(d => ({
    ...d,
    selected: true
  }))} />
}`,...(C=(h=l.parameters)==null?void 0:h.docs)==null?void 0:C.source}}};var f,D,y;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: args => <Controlled {...args} items={DAYS.map((d, i) => ({
    ...d,
    selected: i < 2
  }))} disabled />
}`,...(y=(D=d.parameters)==null?void 0:D.docs)==null?void 0:y.source}}};const M=["Default","WithSelections","AllSelected","Disabled"];export{l as AllSelected,n as Default,d as Disabled,o as WithSelections,M as __namedExportsOrder,F as default};
