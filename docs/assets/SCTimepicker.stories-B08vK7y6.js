import{TimePicker as ne}from"@progress/kendo-react-dateinputs";import{r as S,R as e}from"./index-BVW8D_1y.js";import{N as C}from"./no-ssr-D3RVQ5dx.js";import{T}from"./time-DApu-Cu_.js";import{S as E}from"./sc-hint-SLX4MDDC.js";import{S as oe}from"./SCTimeControl-BdlJbVRZ.js";import"./_commonjsHelpers-BosuxZz1.js";import"./iframe-CSwY8THC.js";import"./jsx-runtime-CniKdCFI.js";import"./enums-DkpuAbLR.js";import"./index-DCH-1kQU.js";import"./MantineThemeProvider-3Ly_klpC.js";import"@progress/kendo-react-labels";import"./Combobox-Boe-VdbR.js";import"./factory-CxM5CVDB.js";import"./create-safe-context-BGt5RmBf.js";import"./use-id-CKk3Bls3.js";import"./use-merged-ref-CANbyt_7.js";import"./DirectionProvider-CLUDE2bQ.js";import"./Popover-DGZnAMV1.js";import"./OptionalPortal-BWrhjSaK.js";import"./index-CvEbaogi.js";import"./use-floating-auto-update-D8OWX04j.js";import"./use-reduced-motion-BToEjtDa.js";import"./FocusTrap-B6wIDhIz.js";import"./Transition-CLC0U5JG.js";import"./use-uncontrolled-GHWci0RL.js";import"./CloseButton-BvzZ9njs.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./UnstyledButton-BK3SNOQq.js";import"./Input-D6LxCvUw.js";import"./TimeInput-D9eFJ_x8.js";import"./use-resolved-styles-api-B7PIHi2u.js";import"./InputBase-4-rtI6FH.js";import"./use-input-props-BJ-Ugm8W.js";import"./Flex-FP2G1HC3.js";import"./lighten-BMyQy2CT.js";import"./Text-dFWcX6d5.js";import"./Group-B1Wj5x_m.js";function se($){const{name:h,value:a,label:f,error:o,hint:g,required:z,disabled:H,changeHandler:v,format:n="HH:mm",startDateAndTime:G,endDate:K,extraClasses:Q,cypress:U,mt:X}=$,Y={value:a||"",name:h,label:f,error:o,description:g,required:z,disabled:H,startDateAndTime:G,endDate:K,mt:X},Z=S.useRef(null),[ee,s]=S.useState();S.useEffect(()=>{s(a&&a?T.parseDate(a):"")},[a]);const re=t=>{s(t),v({target:Z.current,name:h,value:t})},te=t=>{let b=T.parseDate(t.value);n.indexOf("ss")===-1&&b.setSeconds(0),s(b),v({target:t.target.element,name:t.target.name,value:b})},ae={hour:1,minute:15,second:1};return e.createElement(C,null,e.createElement(oe,{onChange:re,format:"24",withSeconds:n==null?void 0:n.toLowerCase().includes(":ss"),...Y}))||e.createElement("div",{className:`timepicker-container ${Q}`},e.createElement(C,null,e.createElement(ne,{name:h,label:f,onChange:te,format:n,value:ee,steps:ae,formatPlaceholder:{hour:"HH",minute:"MM",second:"SS"},nowButton:!0,disabled:H||!1,className:U})),g&&!o?e.createElement(E,{value:g}):"",o?e.createElement(E,{value:o,extraClasses:"error"}):"",e.createElement("style",{jsx:!0},`
              .timepicker-container {
                margin-top: 5px;
              }
            `))}const ze={title:"Form Controls/SCTimePicker",component:se,tags:["autodocs"],argTypes:{label:{control:"text",description:"Field label"},value:{control:"text",description:"Time string value (HH:mm or ISO datetime)"},hint:{control:"text",description:"Helper text below the input"},error:{control:"text",description:"Validation error message"},required:{control:"boolean",description:"Shows asterisk on label"},disabled:{control:"boolean",description:"Prevents interaction"},format:{control:"select",options:["HH:mm","HH:mm:ss"],description:"Time format — include :ss to show seconds field",table:{defaultValue:{summary:"HH:mm"}}},changeHandler:{action:"changeHandler"}},parameters:{docs:{description:{component:"SCTimePicker is the standard time input for ServCraft forms. It renders a\n24-hour time input (HH:mm by default, HH:mm:ss when `format` includes `:ss`).\n\nThe `value` prop should be a time string or ISO datetime string.\nChanges are returned via `changeHandler({ name, value: timeString | null })`.\n\n`changeHandler` is required — it is the primary callback for time changes.\n\n**States:** Default · With value · With seconds · Error · Disabled · Required"}}}},r=()=>{},i={args:{label:"Start time",value:null,changeHandler:r}},l={args:{label:"Start time",value:"09:30",changeHandler:r}},m={name:"With seconds (HH:mm:ss)",args:{label:"Duration",value:"01:30:00",format:"HH:mm:ss",changeHandler:r}},c={args:{label:"Appointment time",value:null,hint:"Choose a time within business hours (8am–6pm)",changeHandler:r}},d={args:{label:"Start time",value:null,error:"Start time is required",changeHandler:r}},p={args:{label:"Job start time",required:!0,value:null,changeHandler:r}},u={args:{label:"Locked time",value:"14:00",disabled:!0,changeHandler:r}};var x,k,D;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    label: 'Start time',
    value: null,
    changeHandler: noopHandler
  }
}`,...(D=(k=i.parameters)==null?void 0:k.docs)==null?void 0:D.source}}};var W,q,w;l.parameters={...l.parameters,docs:{...(W=l.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    label: 'Start time',
    value: '09:30',
    changeHandler: noopHandler
  }
}`,...(w=(q=l.parameters)==null?void 0:q.docs)==null?void 0:w.source}}};var P,y,R;m.parameters={...m.parameters,docs:{...(P=m.parameters)==null?void 0:P.docs,source:{originalSource:`{
  name: 'With seconds (HH:mm:ss)',
  args: {
    label: 'Duration',
    value: '01:30:00',
    format: 'HH:mm:ss',
    changeHandler: noopHandler
  }
}`,...(R=(y=m.parameters)==null?void 0:y.docs)==null?void 0:R.source}}};var V,L,N;c.parameters={...c.parameters,docs:{...(V=c.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    label: 'Appointment time',
    value: null,
    hint: 'Choose a time within business hours (8am–6pm)',
    changeHandler: noopHandler
  }
}`,...(N=(L=c.parameters)==null?void 0:L.docs)==null?void 0:N.source}}};var O,A,I;d.parameters={...d.parameters,docs:{...(O=d.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    label: 'Start time',
    value: null,
    error: 'Start time is required',
    changeHandler: noopHandler
  }
}`,...(I=(A=d.parameters)==null?void 0:A.docs)==null?void 0:I.source}}};var F,J,M;p.parameters={...p.parameters,docs:{...(F=p.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    label: 'Job start time',
    required: true,
    value: null,
    changeHandler: noopHandler
  }
}`,...(M=(J=p.parameters)==null?void 0:J.docs)==null?void 0:M.source}}};var _,j,B;u.parameters={...u.parameters,docs:{...(_=u.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    label: 'Locked time',
    value: '14:00',
    disabled: true,
    changeHandler: noopHandler
  }
}`,...(B=(j=u.parameters)==null?void 0:j.docs)==null?void 0:B.source}}};const Ge=["Default","WithValue","WithSeconds","WithHint","WithError","Required","Disabled"];export{i as Default,u as Disabled,p as Required,d as WithError,c as WithHint,m as WithSeconds,l as WithValue,Ge as __namedExportsOrder,ze as default};
