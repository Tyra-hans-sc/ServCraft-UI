import{R as s,r as _}from"./index-BVW8D_1y.js";import{j as t}from"./jsx-runtime-CniKdCFI.js";import{S as z}from"./sc-hint-CPRBx4On.js";import{u as H}from"./MantineThemeProvider-3Ly_klpC.js";import{S as J}from"./Select-CVYzIY_T.js";import"./_commonjsHelpers-BosuxZz1.js";import"./index-DCH-1kQU.js";import"./kendo-empty-CYlDc4Bu.js";import"./objectWithoutPropertiesLoose-Ef4hjkMG.js";import"./index-D_4CslRg.js";import"./clsx.m-CH7BE6MN.js";import"./Transition-CYdRGqxG.js";import"./index-CvEbaogi.js";function F({name:e,label:u,onChange:n,options:h,labelField:f,valueField:b,valueModifier:y,allowNull:$=!1,error:g=void 0,required:I=!1,value:x}){const l=H();function T(r){let o=y?y(r.target.value):r.target.value;n&&n({name:r.target.name,value:o,target:r.target})}const D=()=>{const r=[...h],o=r.length>0&&typeof r[0]=="object";return $&&(o?r.unshift({[b]:null,[f]:""}):r.unshift(null)),r.map((a,M)=>t.jsx("option",{value:o?a[b]:a,selected:o?a[b]===x:a===x,children:o?a[f]:a},M))};return t.jsxs(t.Fragment,{children:[t.jsxs("div",{className:"combobox-container",children:[t.jsx("label",{className:"custom-label",htmlFor:e,children:u}),t.jsx(J,{name:e,onChange:T,native:!0,style:{width:"100%",height:"37px"},children:D(),error:g}),g?t.jsx(z,{value:g,extraClasses:"error"}):""]}),t.jsx("style",{jsx:!0,children:`

        .combobox-container {                    
            margin-top: 0.5rem;
        }

        .custom-label {
            color: ${l.colors.gray[9]};
            display: block;
            font-size: ${l.fontSizes.sm}px;
            font-weight: 500;
            margin-top: ${l.spacing.sm}px;
            font-family: ${l.fontFamily};
        }

        ${I?`

        .custom-label:after {
            content: " *";
            color: ${l.colors.red[5]};
        }
        
        `:""}
        
       
        `})]})}const te={title:"Form Controls/SCNativeSelect",component:F,tags:["autodocs"],argTypes:{label:{control:"text",description:"Field label"},error:{control:"text",description:"Validation error message"},required:{control:"boolean",description:"Marks the field as required"},allowNull:{control:"boolean",description:'Adds a blank "— Select —" first option'},onChange:{action:"changed"}},parameters:{docs:{description:{component:'SCNativeSelect renders a browser-native `<select>` element, styled to match\nthe ServCraft form system. Use when a lightweight, always-accessible dropdown\nis needed without the overhead of the Mantine Combobox.\n\n**Props:**\n- `options` — array of data objects\n- `labelField` — key to use as the option label\n- `valueField` — key to use as the option value\n- `allowNull` — prepends an empty "— Select —" option\n- `error` — validation error message\n- `required` — marks the field as required\n\n**States:** Default · With null option · Error · Required'}}}},S=[{id:1,label:"Low"},{id:2,label:"Medium"},{id:3,label:"High"},{id:4,label:"Critical"}],m=e=>{const[u,n]=_.useState(S[1].id);return s.createElement(F,{...e,name:"priority",value:u,options:S,labelField:"label",valueField:"id",onChange:h=>n(h.value)})},i={render:e=>s.createElement(m,{...e,label:"Priority"})},c={name:"With empty option",render:e=>s.createElement(m,{...e,label:"Priority",allowNull:!0})},d={render:e=>s.createElement(m,{...e,label:"Priority",error:"Please select a priority"})},p={render:e=>s.createElement(m,{...e,label:"Job type",required:!0})};var v,C,j;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: args => <Controlled {...args} label="Priority" />
}`,...(j=(C=i.parameters)==null?void 0:C.docs)==null?void 0:j.source}}};var w,N,E;c.parameters={...c.parameters,docs:{...(w=c.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'With empty option',
  render: args => <Controlled {...args} label="Priority" allowNull />
}`,...(E=(N=c.parameters)==null?void 0:N.docs)==null?void 0:E.source}}};var P,q,O;d.parameters={...d.parameters,docs:{...(P=d.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: args => <Controlled {...args} label="Priority" error="Please select a priority" />
}`,...(O=(q=d.parameters)==null?void 0:q.docs)==null?void 0:O.source}}};var R,W,k;p.parameters={...p.parameters,docs:{...(R=p.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: args => <Controlled {...args} label="Job type" required />
}`,...(k=(W=p.parameters)==null?void 0:W.docs)==null?void 0:k.source}}};const oe=["Default","WithNullOption","WithError","Required"];export{i as Default,p as Required,d as WithError,c as WithNullOption,oe as __namedExportsOrder,te as default};
