import{S as D}from"./sc-textarea-yMNCd1E7.js";import"./index-BVW8D_1y.js";import"./_commonjsHelpers-BosuxZz1.js";import"./index-DCH-1kQU.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./jsx-runtime-CniKdCFI.js";import"./no-ssr-D3RVQ5dx.js";import"@progress/kendo-react-inputs";import"./sc-hint-SLX4MDDC.js";import"@progress/kendo-react-labels";import"./ScTextAreaControl-hs4hIUbH.js";import"./Textarea-BFpv2TCT.js";import"./objectWithoutPropertiesLoose-Ef4hjkMG.js";import"./factory-CxM5CVDB.js";import"./InputBase-4-rtI6FH.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./Input-D6LxCvUw.js";import"./use-id-CKk3Bls3.js";import"./use-input-props-BJ-Ugm8W.js";const Z={title:"Form Controls/SCTextArea",component:D,tags:["autodocs"],argTypes:{label:{control:"text",description:"Field label displayed above the textarea"},value:{control:"text",description:"Controlled value"},placeholder:{control:"text",description:"Placeholder text shown when empty"},hint:{control:"text",description:"Helper text shown below the textarea"},error:{control:"text",description:"Validation error message"},required:{control:"boolean",description:"Shows an asterisk on the label"},disabled:{control:"boolean",description:"Prevents interaction and dims the field"},readOnly:{control:"boolean",description:"Shows value but prevents editing"},autoSize:{control:"boolean",description:"Grow height to fit content (rows → maxRows)",table:{defaultValue:{summary:"true"}}},rows:{control:"number",description:"Minimum number of visible rows",table:{defaultValue:{summary:"4"}}},maxRows:{control:"number",description:"Maximum rows before scrolling",table:{defaultValue:{summary:"10"}}},maxLength:{control:"number",description:"Character limit",table:{defaultValue:{summary:"4000"}}},onChange:{action:"changed"}},parameters:{docs:{description:{component:`SCTextArea is the multi-line text input for ServCraft forms. It wraps
Mantine's Textarea with autosize enabled by default, growing from 4 rows
up to 10 rows before showing a scrollbar.

Default \`maxLength\` is 4000 characters.

**States:** Default · With value · Error · Disabled · ReadOnly · Required · Fixed height`}}}},e={args:{label:"Notes",placeholder:"Add any relevant notes…"}},r={args:{label:"Job description",value:"Replace the faulty compressor unit in the rooftop HVAC system. Ensure all safety procedures are followed and document any additional faults observed."}},a={args:{label:"Customer message",placeholder:"Write a message to the customer…",hint:"This will be visible in the customer portal"}},o={args:{label:"Notes",value:"",error:"Notes are required for this job type"}},t={args:{label:"Reason for cancellation",required:!0,placeholder:"Explain why this job is being cancelled…"}},s={args:{label:"Archived notes",value:"These notes are from a completed job and cannot be edited.",disabled:!0}},n={args:{label:"Original scope",value:"Install 3x split-system air conditioners in open-plan office area.",readOnly:!0}},l={name:"Fixed height (no autosize)",args:{label:"Comments",placeholder:"Enter comments…",autoSize:!1,rows:6}};var i,c,d;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Add any relevant notes…'
  }
}`,...(d=(c=e.parameters)==null?void 0:c.docs)==null?void 0:d.source}}};var m,p,u;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    label: 'Job description',
    value: 'Replace the faulty compressor unit in the rooftop HVAC system. Ensure all safety procedures are followed and document any additional faults observed.'
  }
}`,...(u=(p=r.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var h,b,g;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: 'Customer message',
    placeholder: 'Write a message to the customer…',
    hint: 'This will be visible in the customer portal'
  }
}`,...(g=(b=a.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};var f,x,y;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    value: '',
    error: 'Notes are required for this job type'
  }
}`,...(y=(x=o.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};var w,v,S;t.parameters={...t.parameters,docs:{...(w=t.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    label: 'Reason for cancellation',
    required: true,
    placeholder: 'Explain why this job is being cancelled…'
  }
}`,...(S=(v=t.parameters)==null?void 0:v.docs)==null?void 0:S.source}}};var C,R,E;s.parameters={...s.parameters,docs:{...(C=s.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    label: 'Archived notes',
    value: 'These notes are from a completed job and cannot be edited.',
    disabled: true
  }
}`,...(E=(R=s.parameters)==null?void 0:R.docs)==null?void 0:E.source}}};var A,O,T;n.parameters={...n.parameters,docs:{...(A=n.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    label: 'Original scope',
    value: 'Install 3x split-system air conditioners in open-plan office area.',
    readOnly: true
  }
}`,...(T=(O=n.parameters)==null?void 0:O.docs)==null?void 0:T.source}}};var V,W,q;l.parameters={...l.parameters,docs:{...(V=l.parameters)==null?void 0:V.docs,source:{originalSource:`{
  name: 'Fixed height (no autosize)',
  args: {
    label: 'Comments',
    placeholder: 'Enter comments…',
    autoSize: false,
    rows: 6
  }
}`,...(q=(W=l.parameters)==null?void 0:W.docs)==null?void 0:q.source}}};const $=["Default","WithValue","WithHint","WithError","Required","Disabled","ReadOnly","FixedHeight"];export{e as Default,s as Disabled,l as FixedHeight,n as ReadOnly,t as Required,o as WithError,a as WithHint,r as WithValue,$ as __namedExportsOrder,Z as default};
