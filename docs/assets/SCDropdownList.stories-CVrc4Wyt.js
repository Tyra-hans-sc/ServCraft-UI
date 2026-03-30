import{S as B}from"./sc-dropdownlist-BgnGmrEG.js";import"./index-BVW8D_1y.js";import"./_commonjsHelpers-BosuxZz1.js";import"./no-ssr-D3RVQ5dx.js";import"./index-DCH-1kQU.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./jsx-runtime-CniKdCFI.js";import"./sc-combobox-OYCSVqUZ.js";import"./sc-hint-CPRBx4On.js";import"./kendo-empty-CYlDc4Bu.js";import"./time-Drbfh5Um.js";import"./iframe-Beq_Rkx3.js";import"./enums-DkpuAbLR.js";import"./use-reduced-motion-BToEjtDa.js";import"./Combobox-Boe-VdbR.js";import"./factory-CxM5CVDB.js";import"./create-safe-context-BGt5RmBf.js";import"./use-id-CKk3Bls3.js";import"./use-merged-ref-CANbyt_7.js";import"./DirectionProvider-CLUDE2bQ.js";import"./Popover-DGZnAMV1.js";import"./OptionalPortal-BWrhjSaK.js";import"./index-CvEbaogi.js";import"./use-floating-auto-update-D8OWX04j.js";import"./FocusTrap-B6wIDhIz.js";import"./Transition-CLC0U5JG.js";import"./use-uncontrolled-GHWci0RL.js";import"./CloseButton-BvzZ9njs.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./UnstyledButton-BK3SNOQq.js";import"./Input-D6LxCvUw.js";import"./Group-B1Wj5x_m.js";import"./TextInput-PpQMXPPI.js";import"./InputBase-4-rtI6FH.js";import"./use-input-props-BJ-Ugm8W.js";import"./IconChevronDown-BRghH-O-.js";import"./createReactComponent-C_JDq-5z.js";import"./index-D_4CslRg.js";const e=[{id:"active",name:"Active"},{id:"inactive",name:"Inactive"},{id:"pending",name:"Pending review"},{id:"archived",name:"Archived"}],k=[{id:"tech1",name:"Alice Johnson",department:"Electrical"},{id:"tech2",name:"Bob Smith",department:"Electrical"},{id:"tech3",name:"Carol White",department:"Plumbing"},{id:"tech4",name:"David Brown",department:"Plumbing"},{id:"tech5",name:"Eve Davis",department:"HVAC"}],Ne={title:"Form Controls/SCDropdownList",component:B,tags:["autodocs"],argTypes:{label:{control:"text",description:"Field label"},placeholder:{control:"text",description:"Placeholder when no value is selected"},error:{control:"text",description:"Validation error message"},hint:{control:"text",description:"Helper text"},required:{control:"boolean",description:"Shows asterisk on label"},disabled:{control:"boolean",description:"Prevents interaction"},readOnly:{control:"boolean",description:"Shows value but prevents editing"},canSearch:{control:"boolean",description:"Adds a search filter to the dropdown list"},canClear:{control:"boolean",description:"Shows an × button to clear the selection"},onChange:{action:"changed"}},parameters:{docs:{description:{component:"SCDropdownList is the standard single-select dropdown for ServCraft forms.\nIt wraps SCComboBox (Mantine-based) with consistent styling and behaviour.\n\nOptions can be plain strings or objects — use `dataItemKey` and `textField`\nto map object properties to value and display label.\n\n**Features:**\n- Optional search filtering (`canSearch`)\n- Optional clear button (`canClear`)\n- Grouped options (`groupField`)\n- Custom item rendering (`itemRenderMantine`)\n\n**States:** Default · With value · Searchable · Clearable · Grouped · Error · Disabled · ReadOnly · Required"}}}},t={args:{label:"Status",options:e,dataItemKey:"id",textField:"name",placeholder:"Select a status…"}},a={args:{label:"Status",options:e,dataItemKey:"id",textField:"name",value:e[0]}},n={args:{label:"Assign technician",options:k,dataItemKey:"id",textField:"name",canSearch:!0,placeholder:"Search technicians…"}},r={args:{label:"Status",options:e,dataItemKey:"id",textField:"name",value:e[1],canClear:!0}},o={name:"Grouped options",args:{label:"Assign technician",options:k,dataItemKey:"id",textField:"name",groupField:"department",canSearch:!0,placeholder:"Select a technician…"}},i={args:{label:"Priority",options:[{id:"low",name:"Low"},{id:"medium",name:"Medium"},{id:"high",name:"High"},{id:"urgent",name:"Urgent"}],dataItemKey:"id",textField:"name",hint:"Sets how quickly the job appears in the queue"}},s={args:{label:"Status",options:e,dataItemKey:"id",textField:"name",error:"Please select a status to continue"}},l={args:{label:"Job type",options:[{id:"install",name:"Installation"},{id:"service",name:"Service"},{id:"repair",name:"Repair"}],dataItemKey:"id",textField:"name",required:!0,placeholder:"Select job type…"}},d={args:{label:"Status",options:e,dataItemKey:"id",textField:"name",value:e[0],disabled:!0}},c={args:{label:"Status",options:e,dataItemKey:"id",textField:"name",value:e[2],readOnly:!0}},p={name:"Plain string options",args:{label:"Country",options:["Australia","New Zealand","United Kingdom","United States"],placeholder:"Select country…"}};var m,u,S;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    label: 'Status',
    options: STATUS_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    placeholder: 'Select a status…'
  }
}`,...(S=(u=t.parameters)==null?void 0:u.docs)==null?void 0:S.source}}};var h,g,b;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: 'Status',
    options: STATUS_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    value: STATUS_OPTIONS[0]
  }
}`,...(b=(g=a.parameters)==null?void 0:g.docs)==null?void 0:b.source}}};var O,y,I;n.parameters={...n.parameters,docs:{...(O=n.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    label: 'Assign technician',
    options: GROUPED_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    canSearch: true,
    placeholder: 'Search technicians…'
  }
}`,...(I=(y=n.parameters)==null?void 0:y.docs)==null?void 0:I.source}}};var T,v,x;r.parameters={...r.parameters,docs:{...(T=r.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    label: 'Status',
    options: STATUS_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    value: STATUS_OPTIONS[1],
    canClear: true
  }
}`,...(x=(v=r.parameters)==null?void 0:v.docs)==null?void 0:x.source}}};var P,F,K;o.parameters={...o.parameters,docs:{...(P=o.parameters)==null?void 0:P.docs,source:{originalSource:`{
  name: 'Grouped options',
  args: {
    label: 'Assign technician',
    options: GROUPED_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    groupField: 'department',
    canSearch: true,
    placeholder: 'Select a technician…'
  }
}`,...(K=(F=o.parameters)==null?void 0:F.docs)==null?void 0:K.source}}};var A,w,C;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    label: 'Priority',
    options: [{
      id: 'low',
      name: 'Low'
    }, {
      id: 'medium',
      name: 'Medium'
    }, {
      id: 'high',
      name: 'High'
    }, {
      id: 'urgent',
      name: 'Urgent'
    }],
    dataItemKey: 'id',
    textField: 'name',
    hint: 'Sets how quickly the job appears in the queue'
  }
}`,...(C=(w=i.parameters)==null?void 0:w.docs)==null?void 0:C.source}}};var U,N,_;s.parameters={...s.parameters,docs:{...(U=s.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    label: 'Status',
    options: STATUS_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    error: 'Please select a status to continue'
  }
}`,...(_=(N=s.parameters)==null?void 0:N.docs)==null?void 0:_.source}}};var D,R,f;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    label: 'Job type',
    options: [{
      id: 'install',
      name: 'Installation'
    }, {
      id: 'service',
      name: 'Service'
    }, {
      id: 'repair',
      name: 'Repair'
    }],
    dataItemKey: 'id',
    textField: 'name',
    required: true,
    placeholder: 'Select job type…'
  }
}`,...(f=(R=l.parameters)==null?void 0:R.docs)==null?void 0:f.source}}};var q,E,G;d.parameters={...d.parameters,docs:{...(q=d.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    label: 'Status',
    options: STATUS_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    value: STATUS_OPTIONS[0],
    disabled: true
  }
}`,...(G=(E=d.parameters)==null?void 0:E.docs)==null?void 0:G.source}}};var W,j,H;c.parameters={...c.parameters,docs:{...(W=c.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    label: 'Status',
    options: STATUS_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    value: STATUS_OPTIONS[2],
    readOnly: true
  }
}`,...(H=(j=c.parameters)==null?void 0:j.docs)==null?void 0:H.source}}};var L,M,V;p.parameters={...p.parameters,docs:{...(L=p.parameters)==null?void 0:L.docs,source:{originalSource:`{
  name: 'Plain string options',
  args: {
    label: 'Country',
    options: ['Australia', 'New Zealand', 'United Kingdom', 'United States'],
    placeholder: 'Select country…'
  }
}`,...(V=(M=p.parameters)==null?void 0:M.docs)==null?void 0:V.source}}};const _e=["Default","WithValue","Searchable","Clearable","Grouped","WithHint","WithError","Required","Disabled","ReadOnly","StringOptions"];export{r as Clearable,t as Default,d as Disabled,o as Grouped,c as ReadOnly,l as Required,n as Searchable,p as StringOptions,s as WithError,i as WithHint,a as WithValue,_e as __namedExportsOrder,Ne as default};
