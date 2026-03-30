import{r as y,R as a}from"./index-BVW8D_1y.js";import{N as ue}from"./no-ssr-D3RVQ5dx.js";import{T as t}from"./time-DApu-Cu_.js";import{c as de}from"./_commonjsHelpers-BosuxZz1.js";import{S as pe}from"./ScDateControl-DM08VGGV.js";import"./iframe-CSwY8THC.js";import"./jsx-runtime-CniKdCFI.js";import"./enums-DkpuAbLR.js";import"./index-DCH-1kQU.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./DateInput-D0kfNzBZ.js";import"./use-uncontrolled-GHWci0RL.js";import"./factory-CxM5CVDB.js";import"./UnstyledButton-BK3SNOQq.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./AccordionChevron-CwLz0rsH.js";import"./use-resolved-styles-api-B7PIHi2u.js";import"./clamp-DTmYCdls.js";import"./use-input-props-BJ-Ugm8W.js";import"./CloseButton-BvzZ9njs.js";import"./use-reduced-motion-BToEjtDa.js";import"./Input-D6LxCvUw.js";import"./use-id-CKk3Bls3.js";import"./Popover-DGZnAMV1.js";import"./OptionalPortal-BWrhjSaK.js";import"./index-CvEbaogi.js";import"./use-merged-ref-CANbyt_7.js";import"./DirectionProvider-CLUDE2bQ.js";import"./use-floating-auto-update-D8OWX04j.js";import"./create-safe-context-BGt5RmBf.js";import"./FocusTrap-B6wIDhIz.js";import"./Transition-CLC0U5JG.js";var me={exports:{}};(function(h,S){(function(e,r){h.exports=r()})(de,function(){return{name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(e){var r=["th","st","nd","rd"],o=e%100;return"["+e+(r[(o-20)%10]||r[o]||r[0])+"]"}}})})(me);function ge(h){const{name:S,value:e,label:r,error:o,hint:Z,required:ee,disabled:f,changeHandler:x,extraClasses:be,cypress:he,minDate:v,maxDate:D,canClear:ae=!1,onChange:C,icon:re,className:te,withAsterisk:ne,readOnly:oe,...se}=h,le={name:S,label:r,error:o,description:Z,required:ee,disabled:f,minDate:v&&t.parseDate(v),maxDate:D&&t.parseDate(D),rightSection:re,className:te,withAsterisk:ne,readOnly:oe,...se},ie=y.useRef(null),[w,s]=y.useState(e&&new Date(e)||null);y.useEffect(()=>{e&&t.isValidDate(t.parseDate(e))?s(e?t.parseDate(e):null):s(null)},[e]);const _=n=>{s(n),x&&x({target:ie.current,name:S,value:n?t.toISOString(n):null}),C&&C(n?t.toISOString(n):null)},ce=()=>w&&!f&&ae&&a.createElement("div",{style:{display:"flex",pointerEvents:"none",position:"absolute"}},a.createElement("div",{style:{paddingTop:"6px"}},a.createElement(a.Fragment,null,a.createElement("span",{style:{pointerEvents:"all",cursor:"pointer"},onClick:()=>_(null)},a.createElement("img",{src:"/specno-icons/clear.svg"})))),a.createElement("style",{jsx:!0},`
                :global(.mantine-DatePicker-rightSection) {
                    width: 0px;
                    right: 16px;
                    background: red;
                }
            `));return a.createElement(ue,null,a.createElement(pe,{...le,value:w,onChange:_,rightSection:ce()}))}const Ke={title:"Form Controls/SCDatePicker",component:ge,tags:["autodocs"],argTypes:{label:{control:"text",description:"Field label"},hint:{control:"text",description:"Helper text below the input"},error:{control:"text",description:"Validation error message"},required:{control:"boolean",description:"Shows asterisk on label"},disabled:{control:"boolean",description:"Prevents interaction"},readOnly:{control:"boolean",description:"Shows value but prevents editing"},canClear:{control:"boolean",description:"Show × button to clear the date"},onChange:{action:"changed"},changeHandler:{action:"changeHandler"}},parameters:{docs:{description:{component:"SCDatePicker is the standard date input for ServCraft forms. It wraps\nMantine's DateInput with date parsing via the internal `Time` utility.\n\nThe `value` prop accepts a `Date`, ISO string, or `null`.\nChanges are returned via `changeHandler({ name, value: isoString | null })`\nor the simpler `onChange(isoString | null)`.\n\nSet `canClear` to show an × button when a date is selected.\nUse `minDate` / `maxDate` to constrain the calendar.\n\n**States:** Default · With value · Min/Max bounds · Clearable · Error · Disabled · ReadOnly · Required"}}}},l={args:{label:"Start date",value:null}},i={args:{label:"Start date",value:new Date("2025-06-15")}},c={args:{label:"Due date",value:new Date("2025-07-01"),canClear:!0}},u={name:"Min / max date bounds",args:{label:"Schedule date",value:null,minDate:new Date,hint:"Cannot select a date in the past"}},d={args:{label:"Warranty expiry",value:null,hint:"Leave blank if no warranty applies"}},p={args:{label:"Start date",value:null,error:"Start date is required"}},m={args:{label:"Job date",required:!0,value:null}},g={args:{label:"Completion date",value:new Date("2025-05-20"),disabled:!0}},b={args:{label:"Invoice date",value:new Date("2025-04-01"),readOnly:!0}};var E,M,k;l.parameters={...l.parameters,docs:{...(E=l.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    label: 'Start date',
    value: null
  }
}`,...(k=(M=l.parameters)==null?void 0:M.docs)==null?void 0:k.source}}};var O,W,R;i.parameters={...i.parameters,docs:{...(O=i.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    label: 'Start date',
    value: new Date('2025-06-15')
  }
}`,...(R=(W=i.parameters)==null?void 0:W.docs)==null?void 0:R.source}}};var q,P,I;c.parameters={...c.parameters,docs:{...(q=c.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    label: 'Due date',
    value: new Date('2025-07-01'),
    canClear: true
  }
}`,...(I=(P=c.parameters)==null?void 0:P.docs)==null?void 0:I.source}}};var T,H,F;u.parameters={...u.parameters,docs:{...(T=u.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: 'Min / max date bounds',
  args: {
    label: 'Schedule date',
    value: null,
    minDate: new Date(),
    hint: 'Cannot select a date in the past'
  }
}`,...(F=(H=u.parameters)==null?void 0:H.docs)==null?void 0:F.source}}};var J,V,N;d.parameters={...d.parameters,docs:{...(J=d.parameters)==null?void 0:J.docs,source:{originalSource:`{
  args: {
    label: 'Warranty expiry',
    value: null,
    hint: 'Leave blank if no warranty applies'
  }
}`,...(N=(V=d.parameters)==null?void 0:V.docs)==null?void 0:N.source}}};var A,j,L;p.parameters={...p.parameters,docs:{...(A=p.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    label: 'Start date',
    value: null,
    error: 'Start date is required'
  }
}`,...(L=(j=p.parameters)==null?void 0:j.docs)==null?void 0:L.source}}};var G,U,$;m.parameters={...m.parameters,docs:{...(G=m.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    label: 'Job date',
    required: true,
    value: null
  }
}`,...($=(U=m.parameters)==null?void 0:U.docs)==null?void 0:$.source}}};var z,B,K;g.parameters={...g.parameters,docs:{...(z=g.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    label: 'Completion date',
    value: new Date('2025-05-20'),
    disabled: true
  }
}`,...(K=(B=g.parameters)==null?void 0:B.docs)==null?void 0:K.source}}};var Q,X,Y;b.parameters={...b.parameters,docs:{...(Q=b.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    label: 'Invoice date',
    value: new Date('2025-04-01'),
    readOnly: true
  }
}`,...(Y=(X=b.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};const Qe=["Default","WithValue","Clearable","WithMinMax","WithHint","WithError","Required","Disabled","ReadOnly"];export{c as Clearable,l as Default,g as Disabled,b as ReadOnly,m as Required,p as WithError,d as WithHint,u as WithMinMax,i as WithValue,Qe as __namedExportsOrder,Ke as default};
