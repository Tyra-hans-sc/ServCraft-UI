import{R as a}from"./index-BVW8D_1y.js";import{N as k}from"./no-ssr-D3RVQ5dx.js";import{Checkbox as G}from"@progress/kendo-react-inputs";import{H as J}from"./time-DvoKLX2B.js";import{C as K}from"./Checkbox-su-m9tah.js";import"./_commonjsHelpers-BosuxZz1.js";import"./iframe-BVkgZlLe.js";import"./jsx-runtime-CniKdCFI.js";import"./enums-DkpuAbLR.js";import"./index-DCH-1kQU.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./factory-CxM5CVDB.js";import"./get-contrast-color-D3mmixc0.js";import"./get-auto-contrast-value-Da6zqqWm.js";import"./InputsGroupFieldset-Cp2dQq1T.js";import"./Input-D6LxCvUw.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./use-id-CKk3Bls3.js";import"./UnstyledButton-BK3SNOQq.js";import"./use-uncontrolled-GHWci0RL.js";import"./CheckIcon-CIlffEaA.js";function Q({name:r,value:t,label:b,labelPlacement:h="after",whiteBackground:Y=!1,title:g,disabled:f=!1,onChange:o,onChangeFull:n,extraClasses:c,cypress:_,hint:$,indeterminate:O}){const V={name:r,value:t,label:b,labelPosition:h==="before"?"left":"right",title:g,disabled:f,description:$,indeterminate:O},q=e=>{o&&o(e.currentTarget.checked),n&&n({target:e.current,name:r,value:e.currentTarget.checked})},z=e=>{o&&o(e.value),n&&n({target:e.target,name:r,value:e.value})};return a.createElement(k,null,a.createElement(K,{color:"scBlue",mt:c!=null&&c.includes("no-margin")?0:"var(--mantine-spacing-sm)",onChange:q,checked:!!t,...V}))||a.createElement("div",{title:g,className:`checkbox-container ${c}`},a.createElement(k,null,a.createElement(G,{name:r,checked:J.parseBool(t||!1),onChange:z,label:b,labelPlacement:h,disabled:f===!0,className:_,style:!t&&Y?{backgroundColor:"white"}:{}})),a.createElement("style",{jsx:!0},`
                .checkbox-container {                    
                    margin-top: 0.5rem;
                }
                .no-margin {
                    margin-top: unset;
                }
                .margin-bottom {
                    margin-bottom: 0.5rem;
                }

                .margin-top {
                    margin-top: 0.5rem;
                }

            `))}const ke={title:"Form Controls/SCCheckbox",component:Q,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label displayed next to the checkbox"},value:{control:"boolean",description:"Checked state (truthy = checked)"},hint:{control:"text",description:"Helper description shown below the label"},disabled:{control:"boolean",description:"Prevents interaction and dims the control"},indeterminate:{control:"boolean",description:'Shows a dash instead of a tick — used for "select all" patterns'},labelPlacement:{control:"radio",options:["after","before"],description:"Position of the label relative to the checkbox",table:{defaultValue:{summary:"after"}}},onChange:{action:"changed"}},parameters:{docs:{description:{component:"SCCheckbox is the standard boolean input for ServCraft forms. It wraps\nMantine's Checkbox with the `scBlue` brand colour and consistent spacing.\n\nThe `value` prop controls the checked state (truthy = checked). The\n`onChange` callback receives a plain `boolean`.\n\n**States:** Unchecked · Checked · Indeterminate · Disabled · With hint"}}}},s={args:{label:"Send email notifications",value:!1}},i={args:{label:"Send email notifications",value:!0}},l={args:{label:"Accept terms and conditions",value:!1,hint:"You must accept before continuing"}},m={args:{label:"Select all jobs",value:!1,indeterminate:!0}},d={args:{label:"SMS notifications (unavailable)",value:!1,disabled:!0}},p={name:"Disabled (checked)",args:{label:"Mandatory compliance setting",value:!0,disabled:!0}},u={name:"Label before checkbox",args:{label:"Active",value:!0,labelPlacement:"before"}};var S,v,x;s.parameters={...s.parameters,docs:{...(S=s.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    label: 'Send email notifications',
    value: false
  }
}`,...(x=(v=s.parameters)==null?void 0:v.docs)==null?void 0:x.source}}};var C,y,D;i.parameters={...i.parameters,docs:{...(C=i.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    label: 'Send email notifications',
    value: true
  }
}`,...(D=(y=i.parameters)==null?void 0:y.docs)==null?void 0:D.source}}};var E,w,B;l.parameters={...l.parameters,docs:{...(E=l.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    label: 'Accept terms and conditions',
    value: false,
    hint: 'You must accept before continuing'
  }
}`,...(B=(w=l.parameters)==null?void 0:w.docs)==null?void 0:B.source}}};var L,P,H;m.parameters={...m.parameters,docs:{...(L=m.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    label: 'Select all jobs',
    value: false,
    indeterminate: true
  }
}`,...(H=(P=m.parameters)==null?void 0:P.docs)==null?void 0:H.source}}};var M,T,A;d.parameters={...d.parameters,docs:{...(M=d.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    label: 'SMS notifications (unavailable)',
    value: false,
    disabled: true
  }
}`,...(A=(T=d.parameters)==null?void 0:T.docs)==null?void 0:A.source}}};var I,N,j;p.parameters={...p.parameters,docs:{...(I=p.parameters)==null?void 0:I.docs,source:{originalSource:`{
  name: 'Disabled (checked)',
  args: {
    label: 'Mandatory compliance setting',
    value: true,
    disabled: true
  }
}`,...(j=(N=p.parameters)==null?void 0:N.docs)==null?void 0:j.source}}};var R,U,W;u.parameters={...u.parameters,docs:{...(R=u.parameters)==null?void 0:R.docs,source:{originalSource:`{
  name: 'Label before checkbox',
  args: {
    label: 'Active',
    value: true,
    labelPlacement: 'before'
  }
}`,...(W=(U=u.parameters)==null?void 0:U.docs)==null?void 0:W.source}}};const Se=["Unchecked","Checked","WithHint","Indeterminate","Disabled","DisabledChecked","LabelBefore"];export{i as Checked,d as Disabled,p as DisabledChecked,m as Indeterminate,u as LabelBefore,s as Unchecked,l as WithHint,Se as __namedExportsOrder,ke as default};
