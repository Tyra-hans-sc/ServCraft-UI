import{S as M}from"./sc-multiselect-BpW1fyTY.js";import"./index-BVW8D_1y.js";import"./_commonjsHelpers-BosuxZz1.js";import"@progress/kendo-data-query";import"./sc-hint-SLX4MDDC.js";import"./jsx-runtime-CniKdCFI.js";import"./index-DCH-1kQU.js";import"./MantineThemeProvider-3Ly_klpC.js";import"@progress/kendo-react-labels";import"./Combobox-Boe-VdbR.js";import"./factory-CxM5CVDB.js";import"./create-safe-context-BGt5RmBf.js";import"./use-id-CKk3Bls3.js";import"./use-merged-ref-CANbyt_7.js";import"./DirectionProvider-CLUDE2bQ.js";import"./Popover-DGZnAMV1.js";import"./OptionalPortal-BWrhjSaK.js";import"./index-CvEbaogi.js";import"./use-floating-auto-update-D8OWX04j.js";import"./use-reduced-motion-BToEjtDa.js";import"./FocusTrap-B6wIDhIz.js";import"./Transition-CLC0U5JG.js";import"./use-uncontrolled-GHWci0RL.js";import"./CloseButton-BvzZ9njs.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./UnstyledButton-BK3SNOQq.js";import"./Input-D6LxCvUw.js";import"./Text-dFWcX6d5.js";import"./Group-B1Wj5x_m.js";import"./PillsInput-DgJ0G_1d.js";import"./InputBase-4-rtI6FH.js";import"./use-input-props-BJ-Ugm8W.js";const e=[{id:"tech1",name:"Alice Johnson"},{id:"tech2",name:"Bob Smith"},{id:"tech3",name:"Carol White"},{id:"tech4",name:"David Brown"},{id:"tech5",name:"Eve Davis"},{id:"tech6",name:"Frank Miller"}],G=[{id:"tech1",name:"Alice Johnson",department:"Electrical"},{id:"tech2",name:"Bob Smith",department:"Electrical"},{id:"tech3",name:"Carol White",department:"Plumbing"},{id:"tech4",name:"David Brown",department:"Plumbing"},{id:"tech5",name:"Eve Davis",department:"HVAC"}],ge={title:"Form Controls/SCMultiSelect",component:M,tags:["autodocs"],argTypes:{label:{control:"text",description:"Field label"},placeholder:{control:"text",description:"Placeholder text when nothing is selected"},hint:{control:"text",description:"Helper text below the input"},error:{control:"text",description:"Validation error message"},required:{control:"boolean",description:"Shows asterisk on label"},disabled:{control:"boolean",description:"Prevents all interaction"},onChange:{action:"changed"}},parameters:{docs:{description:{component:"SCMultiSelect allows selecting multiple values from a searchable list. Each\nselected item appears as a removable pill inside the input.\n\nUse `availableOptions` for the full list of choices and `selectedOptions`\nfor the current selection. Use `dataItemKey` and `textField` to map\nobject properties to value and label.\n\nThe `onChange` callback receives the full array of selected option objects.\n\nUse `readonlyValues` to lock specific pills (e.g. mandatory selections that\ncan't be removed by the user).\n\n**States:** Default · With selection · Grouped · With readonly values · Error · Disabled · Required"}}}},t={args:{label:"Assign technicians",availableOptions:e,selectedOptions:[],dataItemKey:"id",textField:"name",placeholder:"Select technicians…"}},a={args:{label:"Assign technicians",availableOptions:e,selectedOptions:[e[0],e[2]],dataItemKey:"id",textField:"name"}},n={name:"Many selections (pills wrap)",args:{label:"Assign technicians",availableOptions:e,selectedOptions:e.slice(0,4),dataItemKey:"id",textField:"name"}},i={name:"Grouped options",args:{label:"Assign technicians",availableOptions:G,selectedOptions:[],dataItemKey:"id",textField:"name",groupField:"department",placeholder:"Select technicians…"}},s={name:"With locked selection",args:{label:"Team members",availableOptions:e,selectedOptions:[e[0],e[1]],dataItemKey:"id",textField:"name",readonlyValues:["tech1"]}},r={args:{label:"CC recipients",availableOptions:e,selectedOptions:[],dataItemKey:"id",textField:"name",hint:"These team members will receive a copy of the report"}},o={args:{label:"Assign technicians",availableOptions:e,selectedOptions:[],dataItemKey:"id",textField:"name",error:"At least one technician must be assigned"}},l={args:{label:"Assign technicians",availableOptions:e,selectedOptions:[],dataItemKey:"id",textField:"name",required:!0,placeholder:"Select at least one…"}},c={args:{label:"Assign technicians",availableOptions:e,selectedOptions:[e[0],e[2]],dataItemKey:"id",textField:"name",disabled:!0}};var d,p,m;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    label: 'Assign technicians',
    availableOptions: TECH_OPTIONS,
    selectedOptions: [],
    dataItemKey: 'id',
    textField: 'name',
    placeholder: 'Select technicians…'
  }
}`,...(m=(p=t.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var h,O,u;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: 'Assign technicians',
    availableOptions: TECH_OPTIONS,
    selectedOptions: [TECH_OPTIONS[0], TECH_OPTIONS[2]],
    dataItemKey: 'id',
    textField: 'name'
  }
}`,...(u=(O=a.parameters)==null?void 0:O.docs)==null?void 0:u.source}}};var b,g,S;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'Many selections (pills wrap)',
  args: {
    label: 'Assign technicians',
    availableOptions: TECH_OPTIONS,
    selectedOptions: TECH_OPTIONS.slice(0, 4),
    dataItemKey: 'id',
    textField: 'name'
  }
}`,...(S=(g=n.parameters)==null?void 0:g.docs)==null?void 0:S.source}}};var T,I,y;i.parameters={...i.parameters,docs:{...(T=i.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: 'Grouped options',
  args: {
    label: 'Assign technicians',
    availableOptions: GROUPED_OPTIONS,
    selectedOptions: [],
    dataItemKey: 'id',
    textField: 'name',
    groupField: 'department',
    placeholder: 'Select technicians…'
  }
}`,...(y=(I=i.parameters)==null?void 0:I.docs)==null?void 0:y.source}}};var v,C,x;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  name: 'With locked selection',
  args: {
    label: 'Team members',
    availableOptions: TECH_OPTIONS,
    selectedOptions: [TECH_OPTIONS[0], TECH_OPTIONS[1]],
    dataItemKey: 'id',
    textField: 'name',
    readonlyValues: ['tech1']
  }
}`,...(x=(C=s.parameters)==null?void 0:C.docs)==null?void 0:x.source}}};var E,F,P;r.parameters={...r.parameters,docs:{...(E=r.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    label: 'CC recipients',
    availableOptions: TECH_OPTIONS,
    selectedOptions: [],
    dataItemKey: 'id',
    textField: 'name',
    hint: 'These team members will receive a copy of the report'
  }
}`,...(P=(F=r.parameters)==null?void 0:F.docs)==null?void 0:P.source}}};var H,_,A;o.parameters={...o.parameters,docs:{...(H=o.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    label: 'Assign technicians',
    availableOptions: TECH_OPTIONS,
    selectedOptions: [],
    dataItemKey: 'id',
    textField: 'name',
    error: 'At least one technician must be assigned'
  }
}`,...(A=(_=o.parameters)==null?void 0:_.docs)==null?void 0:A.source}}};var K,N,f;l.parameters={...l.parameters,docs:{...(K=l.parameters)==null?void 0:K.docs,source:{originalSource:`{
  args: {
    label: 'Assign technicians',
    availableOptions: TECH_OPTIONS,
    selectedOptions: [],
    dataItemKey: 'id',
    textField: 'name',
    required: true,
    placeholder: 'Select at least one…'
  }
}`,...(f=(N=l.parameters)==null?void 0:N.docs)==null?void 0:f.source}}};var W,D,w;c.parameters={...c.parameters,docs:{...(W=c.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    label: 'Assign technicians',
    availableOptions: TECH_OPTIONS,
    selectedOptions: [TECH_OPTIONS[0], TECH_OPTIONS[2]],
    dataItemKey: 'id',
    textField: 'name',
    disabled: true
  }
}`,...(w=(D=c.parameters)==null?void 0:D.docs)==null?void 0:w.source}}};const Se=["Default","WithSelection","ManySelections","Grouped","WithReadonlyValues","WithHint","WithError","Required","Disabled"];export{t as Default,c as Disabled,i as Grouped,n as ManySelections,l as Required,o as WithError,r as WithHint,s as WithReadonlyValues,a as WithSelection,Se as __namedExportsOrder,ge as default};
