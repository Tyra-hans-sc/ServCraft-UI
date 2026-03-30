import{S as A}from"./ScTextAreaControl-hs4hIUbH.js";import"./Textarea-BFpv2TCT.js";import"./jsx-runtime-CniKdCFI.js";import"./index-BVW8D_1y.js";import"./_commonjsHelpers-BosuxZz1.js";import"./objectWithoutPropertiesLoose-Ef4hjkMG.js";import"./factory-CxM5CVDB.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./InputBase-4-rtI6FH.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./Input-D6LxCvUw.js";import"./use-id-CKk3Bls3.js";import"./use-input-props-BJ-Ugm8W.js";const F={title:"Form Controls V2/ScTextAreaControl",component:A,tags:["autodocs"],argTypes:{label:{control:"text",description:"Field label"},placeholder:{control:"text",description:"Placeholder text"},error:{control:"text",description:"Validation error message"},required:{control:"boolean",description:"Marks the field as required"},disabled:{control:"boolean",description:"Prevents editing"},autosize:{control:"boolean",description:"Auto-grows with content"},minRows:{control:"number",description:"Minimum visible rows"},maxRows:{control:"number",description:"Maximum rows before scrolling"}},parameters:{docs:{description:{component:"ScTextAreaControl is the Mantine v7 textarea for ServCraft V2 forms. It\nforwards all Mantine `TextareaProps` and supports auto-resize.\n\n**Props:**\n- All Mantine `TextareaProps` are accepted\n- `label` — field label\n- `placeholder` — placeholder text\n- `autosize` — auto-grows to fit content\n- `minRows` / `maxRows` — row limits when `autosize` is on\n- `required` — marks the field as required\n- `error` — validation error message\n\n**States:** Default · With value · Autosize · Error · Disabled"}}}},e={args:{label:"Notes",placeholder:"Enter notes…",minRows:3}},r={name:"With value",args:{label:"Job description",value:"Replace broken gutter section on north-facing wall. Use 150mm aluminium gutter to match existing.",minRows:3}},o={name:"Autosize",args:{label:"Description",placeholder:"Start typing — the field grows automatically…",autosize:!0,minRows:2,maxRows:8}},a={args:{label:"Reason for cancellation",error:"Please provide a reason",minRows:3}},t={args:{label:"Job description",required:!0,minRows:3}},s={args:{label:"Internal notes",value:"These notes are read-only.",disabled:!0,minRows:2}};var n,i,l;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Enter notes…',
    minRows: 3
  }
}`,...(l=(i=e.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var c,m,d;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  name: 'With value',
  args: {
    label: 'Job description',
    value: 'Replace broken gutter section on north-facing wall. Use 150mm aluminium gutter to match existing.',
    minRows: 3
  }
}`,...(d=(m=r.parameters)==null?void 0:m.docs)==null?void 0:d.source}}};var p,u,g;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  name: 'Autosize',
  args: {
    label: 'Description',
    placeholder: 'Start typing — the field grows automatically…',
    autosize: true,
    minRows: 2,
    maxRows: 8
  }
}`,...(g=(u=o.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var b,w,h;a.parameters={...a.parameters,docs:{...(b=a.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    label: 'Reason for cancellation',
    error: 'Please provide a reason',
    minRows: 3
  }
}`,...(h=(w=a.parameters)==null?void 0:w.docs)==null?void 0:h.source}}};var R,f,x;t.parameters={...t.parameters,docs:{...(R=t.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    label: 'Job description',
    required: true,
    minRows: 3
  }
}`,...(x=(f=t.parameters)==null?void 0:f.docs)==null?void 0:x.source}}};var v,S,z;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    label: 'Internal notes',
    value: 'These notes are read-only.',
    disabled: true,
    minRows: 2
  }
}`,...(z=(S=s.parameters)==null?void 0:S.docs)==null?void 0:z.source}}};const N=["Default","WithValue","Autosize","WithError","Required","Disabled"];export{o as Autosize,e as Default,s as Disabled,t as Required,a as WithError,r as WithValue,N as __namedExportsOrder,F as default};
