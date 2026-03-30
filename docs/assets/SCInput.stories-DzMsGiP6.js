import{S as U}from"./sc-input-C9ER1Xa9.js";import"./index-BVW8D_1y.js";import"./_commonjsHelpers-BosuxZz1.js";import"./time-DvoKLX2B.js";import"./iframe-BVkgZlLe.js";import"./jsx-runtime-CniKdCFI.js";import"./enums-DkpuAbLR.js";import"./index-DCH-1kQU.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./TextInput-PpQMXPPI.js";import"./factory-CxM5CVDB.js";import"./InputBase-4-rtI6FH.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./Input-D6LxCvUw.js";import"./use-id-CKk3Bls3.js";import"./use-input-props-BJ-Ugm8W.js";import"./sc-password-control-Yxr5UVFl.js";import"./PasswordInput-RQKqnngr.js";import"./use-resolved-styles-api-B7PIHi2u.js";import"./ActionIcon-8-KHisDK.js";import"./Transition-CLC0U5JG.js";import"./index-CvEbaogi.js";import"./use-reduced-motion-BToEjtDa.js";import"./UnstyledButton-BK3SNOQq.js";import"./use-uncontrolled-GHWci0RL.js";import"./sc-number-control-RSBaemiB.js";import"./NumberInput-CJSzm9F-.js";import"./use-merged-ref-CANbyt_7.js";import"./clamp-DTmYCdls.js";import"./sc-mobile-number-control-DiNbuyhr.js";const ye={title:"Form Controls/SCInput",component:U,tags:["autodocs"],argTypes:{type:{control:"select",options:["text","number","password","tel"],description:"Input type — drives which underlying control is rendered",table:{defaultValue:{summary:"text"}}},label:{control:"text",description:"Field label displayed above the input"},placeholder:{control:"text",description:"Placeholder text shown when empty"},value:{control:"text",description:"Controlled value"},hint:{control:"text",description:"Helper text shown below the input"},error:{control:"text",description:"Validation error message — turns the input red"},required:{control:"boolean",description:"Shows an asterisk on the label"},disabled:{control:"boolean",description:"Prevents interaction and dims the field"},readOnly:{control:"boolean",description:"Shows the value but prevents editing"},autoFocus:{control:"boolean",description:"Focuses the input on mount"},min:{control:"number",description:"Minimum value (number type only)"},onChange:{action:"changed"},onBlur:{action:"blurred"}},parameters:{docs:{description:{component:`SCInput is the standard text input component for ServCraft forms. It wraps
Mantine's TextInput, NumberInput, PasswordInput, and PhoneInput depending
on the \`type\` prop. All form inputs should use SCInput rather than native
inputs or raw Mantine components.

**Variants by type:**
- \`text\` (default) — standard single-line text field
- \`number\` — numeric input with 4 decimal scale, scroll-to-change disabled
- \`password\` — password field with show/hide toggle
- \`tel\` — mobile number input with formatting

**States:** Default · Error · Disabled · ReadOnly · Required`}}}},e={args:{label:"Full name",placeholder:"Enter your full name"}},r={args:{label:"Full name",value:"Jane Smith"}},a={args:{label:"Email address",placeholder:"jane@example.com",hint:"Used for login and notifications"}},t={args:{label:"Email address",value:"not-an-email",error:"Please enter a valid email address"}},o={args:{label:"Job title",required:!0,placeholder:"e.g. Senior Technician"}},n={args:{label:"Account number",value:"ACC-00123",disabled:!0}},s={args:{label:"Customer ID",value:"CUST-4892",readOnly:!0}},l={name:"Type: Number",args:{label:"Quantity",type:"number",placeholder:"0",min:0}},i={name:"Type: Password",args:{label:"Password",type:"password",placeholder:"Enter password"}},p={name:"Type: Phone",args:{label:"Mobile number",type:"tel",placeholder:"04XX XXX XXX"}};var d,c,m;e.parameters={...e.parameters,docs:{...(d=e.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    label: 'Full name',
    placeholder: 'Enter your full name'
  }
}`,...(m=(c=e.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var u,b,h;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    label: 'Full name',
    value: 'Jane Smith'
  }
}`,...(h=(b=r.parameters)==null?void 0:b.docs)==null?void 0:h.source}}};var g,y,w;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    label: 'Email address',
    placeholder: 'jane@example.com',
    hint: 'Used for login and notifications'
  }
}`,...(w=(y=a.parameters)==null?void 0:y.docs)==null?void 0:w.source}}};var S,f,v;t.parameters={...t.parameters,docs:{...(S=t.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    label: 'Email address',
    value: 'not-an-email',
    error: 'Please enter a valid email address'
  }
}`,...(v=(f=t.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var T,x,C;o.parameters={...o.parameters,docs:{...(T=o.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    label: 'Job title',
    required: true,
    placeholder: 'e.g. Senior Technician'
  }
}`,...(C=(x=o.parameters)==null?void 0:x.docs)==null?void 0:C.source}}};var X,P,E;n.parameters={...n.parameters,docs:{...(X=n.parameters)==null?void 0:X.docs,source:{originalSource:`{
  args: {
    label: 'Account number',
    value: 'ACC-00123',
    disabled: true
  }
}`,...(E=(P=n.parameters)==null?void 0:P.docs)==null?void 0:E.source}}};var I,D,F;s.parameters={...s.parameters,docs:{...(I=s.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    label: 'Customer ID',
    value: 'CUST-4892',
    readOnly: true
  }
}`,...(F=(D=s.parameters)==null?void 0:D.docs)==null?void 0:F.source}}};var O,q,R;l.parameters={...l.parameters,docs:{...(O=l.parameters)==null?void 0:O.docs,source:{originalSource:`{
  name: 'Type: Number',
  args: {
    label: 'Quantity',
    type: 'number',
    placeholder: '0',
    min: 0
  }
}`,...(R=(q=l.parameters)==null?void 0:q.docs)==null?void 0:R.source}}};var W,A,M;i.parameters={...i.parameters,docs:{...(W=i.parameters)==null?void 0:W.docs,source:{originalSource:`{
  name: 'Type: Password',
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password'
  }
}`,...(M=(A=i.parameters)==null?void 0:A.docs)==null?void 0:M.source}}};var N,V,J;p.parameters={...p.parameters,docs:{...(N=p.parameters)==null?void 0:N.docs,source:{originalSource:`{
  name: 'Type: Phone',
  args: {
    label: 'Mobile number',
    type: 'tel',
    placeholder: '04XX XXX XXX'
  }
}`,...(J=(V=p.parameters)==null?void 0:V.docs)==null?void 0:J.source}}};const we=["Default","WithValue","WithHint","WithError","Required","Disabled","ReadOnly","NumberType","PasswordType","TelType"];export{e as Default,n as Disabled,l as NumberType,i as PasswordType,s as ReadOnly,o as Required,p as TelType,t as WithError,a as WithHint,r as WithValue,we as __namedExportsOrder,ye as default};
