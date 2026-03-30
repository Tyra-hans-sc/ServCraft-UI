import{S as f}from"./sc-password-input-B_nRzKbE.js";import"./index-BVW8D_1y.js";import"./_commonjsHelpers-BosuxZz1.js";import"./time-DApu-Cu_.js";import"./iframe-CSwY8THC.js";import"./jsx-runtime-CniKdCFI.js";import"./enums-DkpuAbLR.js";import"./index-DCH-1kQU.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./PasswordInput-RQKqnngr.js";import"./factory-CxM5CVDB.js";import"./use-resolved-styles-api-B7PIHi2u.js";import"./ActionIcon-8-KHisDK.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./Transition-CLC0U5JG.js";import"./index-CvEbaogi.js";import"./use-reduced-motion-BToEjtDa.js";import"./UnstyledButton-BK3SNOQq.js";import"./Input-D6LxCvUw.js";import"./use-id-CKk3Bls3.js";import"./InputBase-4-rtI6FH.js";import"./use-input-props-BJ-Ugm8W.js";import"./use-uncontrolled-GHWci0RL.js";import"./Popover-DGZnAMV1.js";import"./OptionalPortal-BWrhjSaK.js";import"./use-merged-ref-CANbyt_7.js";import"./DirectionProvider-CLUDE2bQ.js";import"./use-floating-auto-update-D8OWX04j.js";import"./create-safe-context-BGt5RmBf.js";import"./FocusTrap-B6wIDhIz.js";import"./Group-B1Wj5x_m.js";import"./IconCheck-k6haEi0-.js";import"./createReactComponent-C_JDq-5z.js";import"./index-D_4CslRg.js";import"./Text-dFWcX6d5.js";const er={title:"Form Controls/SCPasswordInput",component:f,tags:["autodocs"],argTypes:{label:{control:"text",description:"Field label"},placeholder:{control:"text",description:"Placeholder text"},error:{control:"text",description:"Validation error message"},showPopover:{control:"boolean",description:"Show password strength popover on focus"},disabled:{control:"boolean",description:"Prevents interaction"},required:{control:"boolean",description:"Marks the field as required"},onChange:{action:"changed"}},parameters:{docs:{description:{component:"SCPasswordInput extends Mantine's PasswordInput with an optional strength\npopover. When `showPopover` is true (default), a strength meter appears on\nfocus showing password requirements.\n\n**Props:**\n- `showPopover` — toggles the strength popover (default: `true`)\n- `userwords` — array of strings to penalise (e.g. the user's name)\n- All standard Mantine `PasswordInputProps` are forwarded\n\n**Variants:** Default · No popover · With label and error"}}}},r={args:{label:"Password",placeholder:"Enter a password",showPopover:!0}},o={name:"Without strength popover",args:{label:"Password",placeholder:"Enter a password",showPopover:!1}},e={args:{label:"Password",value:"123",error:"Password must be at least 8 characters",showPopover:!1}},s={args:{label:"New password",required:!0,showPopover:!0}},a={args:{label:"Password",value:"hidden-value",disabled:!0,showPopover:!1}};var t,n,p;r.parameters={...r.parameters,docs:{...(t=r.parameters)==null?void 0:t.docs,source:{originalSource:`{
  args: {
    label: 'Password',
    placeholder: 'Enter a password',
    showPopover: true
  }
}`,...(p=(n=r.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};var i,d,l;o.parameters={...o.parameters,docs:{...(i=o.parameters)==null?void 0:i.docs,source:{originalSource:`{
  name: 'Without strength popover',
  args: {
    label: 'Password',
    placeholder: 'Enter a password',
    showPopover: false
  }
}`,...(l=(d=o.parameters)==null?void 0:d.docs)==null?void 0:l.source}}};var m,c,u;e.parameters={...e.parameters,docs:{...(m=e.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    label: 'Password',
    value: '123',
    error: 'Password must be at least 8 characters',
    showPopover: false
  }
}`,...(u=(c=e.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var h,w,P;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: 'New password',
    required: true,
    showPopover: true
  }
}`,...(P=(w=s.parameters)==null?void 0:w.docs)==null?void 0:P.source}}};var g,v,b;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    label: 'Password',
    value: 'hidden-value',
    disabled: true,
    showPopover: false
  }
}`,...(b=(v=a.parameters)==null?void 0:v.docs)==null?void 0:b.source}}};const sr=["Default","NoPopover","WithError","Required","Disabled"];export{r as Default,a as Disabled,o as NoPopover,s as Required,e as WithError,sr as __namedExportsOrder,er as default};
