import{S as D}from"./SCTimeControl-Bi_gf94g.js";import"./index-BVW8D_1y.js";import"./_commonjsHelpers-BosuxZz1.js";import"./time-DvoKLX2B.js";import"./iframe-BVkgZlLe.js";import"./jsx-runtime-CniKdCFI.js";import"./enums-DkpuAbLR.js";import"./index-DCH-1kQU.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./Combobox-Boe-VdbR.js";import"./factory-CxM5CVDB.js";import"./create-safe-context-BGt5RmBf.js";import"./use-id-CKk3Bls3.js";import"./use-merged-ref-CANbyt_7.js";import"./DirectionProvider-CLUDE2bQ.js";import"./Popover-DGZnAMV1.js";import"./OptionalPortal-BWrhjSaK.js";import"./index-CvEbaogi.js";import"./use-floating-auto-update-D8OWX04j.js";import"./use-reduced-motion-BToEjtDa.js";import"./FocusTrap-B6wIDhIz.js";import"./Transition-CLC0U5JG.js";import"./use-uncontrolled-GHWci0RL.js";import"./CloseButton-BvzZ9njs.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./UnstyledButton-BK3SNOQq.js";import"./Input-D6LxCvUw.js";import"./TimeInput-D9eFJ_x8.js";import"./use-resolved-styles-api-B7PIHi2u.js";import"./InputBase-4-rtI6FH.js";import"./use-input-props-BJ-Ugm8W.js";import"./Flex-FP2G1HC3.js";import"./lighten-BMyQy2CT.js";import"./Text-dFWcX6d5.js";import"./Group-B1Wj5x_m.js";const ir={title:"Form Controls V2/SCTimeControl",component:D,tags:["autodocs"],argTypes:{label:{control:"text",description:"Field label"},error:{control:"text",description:"Validation error message"},required:{control:"boolean",description:"Marks the field as required"},disabled:{control:"boolean",description:"Prevents interaction"},format:{control:"select",options:["12","24"],description:"12 or 24 hour clock"},withSeconds:{control:"boolean",description:"Show seconds field"},onChange:{action:"changed"}},parameters:{docs:{description:{component:"SCTimeControl is the Mantine v7 time input for ServCraft V2 forms. It\naccepts a value in `yyyy-MM-ddTHH:mm:ss` ISO format and supports both\n12-hour and 24-hour display modes.\n\n**Props:**\n- `value` — ISO datetime string\n- `format` — `'12'` or `'24'` (default: `'24'`)\n- `label` — field label\n- `error` — validation error message\n- `required` — marks the field as required\n- `disabled` — prevents interaction\n- `withSeconds` — shows seconds field\n\n**Variants:** Default · 12-hour · With seconds · Error · Disabled"}}}},r={args:{label:"Start time",value:"2025-01-01T09:00:00",format:"24"}},e={name:"12-hour format",args:{label:"Appointment time",value:"2025-01-01T14:30:00",format:"12"}},o={name:"With seconds",args:{label:"Duration",value:"2025-01-01T01:30:45",withSeconds:!0}},t={args:{label:"Start time",value:"2025-01-01T00:00:00",error:"Start time is required"}},a={args:{label:"Job start time",value:"2025-01-01T08:00:00",required:!0}},s={args:{label:"Created at",value:"2025-01-01T10:23:00",disabled:!0}};var i,n,m;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    label: 'Start time',
    value: '2025-01-01T09:00:00',
    format: '24'
  }
}`,...(m=(n=r.parameters)==null?void 0:n.docs)==null?void 0:m.source}}};var l,p,c;e.parameters={...e.parameters,docs:{...(l=e.parameters)==null?void 0:l.docs,source:{originalSource:`{
  name: '12-hour format',
  args: {
    label: 'Appointment time',
    value: '2025-01-01T14:30:00',
    format: '12'
  }
}`,...(c=(p=e.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};var d,u,b;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  name: 'With seconds',
  args: {
    label: 'Duration',
    value: '2025-01-01T01:30:45',
    withSeconds: true
  }
}`,...(b=(u=o.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};var S,g,h;t.parameters={...t.parameters,docs:{...(S=t.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    label: 'Start time',
    value: '2025-01-01T00:00:00',
    error: 'Start time is required'
  }
}`,...(h=(g=t.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var f,v,T;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    label: 'Job start time',
    value: '2025-01-01T08:00:00',
    required: true
  }
}`,...(T=(v=a.parameters)==null?void 0:v.docs)==null?void 0:T.source}}};var C,q,w;s.parameters={...s.parameters,docs:{...(C=s.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    label: 'Created at',
    value: '2025-01-01T10:23:00',
    disabled: true
  }
}`,...(w=(q=s.parameters)==null?void 0:q.docs)==null?void 0:w.source}}};const nr=["Default","TwelveHour","WithSeconds","WithError","Required","Disabled"];export{r as Default,s as Disabled,a as Required,e as TwelveHour,t as WithError,o as WithSeconds,nr as __namedExportsOrder,ir as default};
