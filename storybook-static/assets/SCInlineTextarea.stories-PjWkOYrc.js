import{R as t,r as C}from"./index-BVW8D_1y.js";import{c as o,l as v,f as y,a as S}from"./index-DCH-1kQU.js";import{S as E}from"./sc-textarea-yMNCd1E7.js";import"./_commonjsHelpers-BosuxZz1.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./jsx-runtime-CniKdCFI.js";import"./no-ssr-D3RVQ5dx.js";import"@progress/kendo-react-inputs";import"./sc-hint-SLX4MDDC.js";import"@progress/kendo-react-labels";import"./ScTextAreaControl-hs4hIUbH.js";import"./Textarea-BFpv2TCT.js";import"./objectWithoutPropertiesLoose-Ef4hjkMG.js";import"./factory-CxM5CVDB.js";import"./InputBase-4-rtI6FH.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./Input-D6LxCvUw.js";import"./use-id-CKk3Bls3.js";import"./use-input-props-BJ-Ugm8W.js";function w(e){const i=e.textAlign?e.textAlign:"left",l=e.width?e.width:"100%";return t.createElement("div",{className:""},t.createElement(E,{value:e.value,onBlur:e.onBlur,autoFocus:e.autoFocus,onChange:e.onChange,name:e.name}),t.createElement("style",{jsx:!0},`
        .input-container {
          background-color: ${o.formGrey};
          border-radius: ${v.inputRadius};
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          padding: 0.5rem;
          position: relative;
          width: ${l};
        }

        textarea {
          background: none;
          border: none;
          box-shadow: none;
          color: ${o.darkPrimary}; 
          font-size: 12px;
          height: 64px;
          outline: none;
          padding-left: 0;
          font-family: ${y};
          text-align: ${i};
        }

      
      label, .label {
        color: ${o.labelGrey}; 
        font-size: ${S.label};
        text-align: left;
      }

      ::-webkit-input-placeholder { 
        color: ${o.blueGrey};
      }

      textarea:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 30px ${o.formGrey} inset !important;
      }

      .row {
        display: flex;
        justify-content: space-between;
      }
      .error {
        color: ${o.warningRed};
      }
    `))}const H={title:"Form Controls/SCInlineTextarea",component:w,tags:["autodocs"],argTypes:{textAlign:{control:"select",options:["left","right"],description:"Text alignment"},width:{control:"text",description:"CSS width of the textarea"},autoFocus:{control:"boolean",description:"Focuses on mount"},onChange:{action:"changed"}},parameters:{docs:{description:{component:"SCInlineTextarea is a compact, label-less multiline input used for inline\nediting of notes and descriptions inside table rows and detail panels.\n\n**Props:**\n- `value` — controlled value\n- `onChange` — called with `{ name, value }`\n- `textAlign` — `'left'` (default) or `'right'`\n- `width` — CSS width (default: `'100%'`)\n- `autoFocus` — focuses on mount\n\n**Variants:** Default · Right-aligned · Custom width"}}}},s=e=>{const[i,l]=C.useState(e.value??"");return t.createElement("div",{style:{width:300}},t.createElement(w,{...e,name:"notes",value:i,onChange:b=>l(b.value)}))},r={render:e=>t.createElement(s,{...e,value:"Replace broken gutter section on north-facing wall."})},n={render:e=>t.createElement(s,{...e,value:""})},a={name:"Custom width",render:e=>t.createElement(s,{...e,value:"Short note",width:"180px"})};var c,d,m;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: args => <Controlled {...args} value="Replace broken gutter section on north-facing wall." />
}`,...(m=(d=r.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var u,p,g;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: args => <Controlled {...args} value="" />
}`,...(g=(p=n.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var h,f,x;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  name: 'Custom width',
  render: args => <Controlled {...args} value="Short note" width="180px" />
}`,...(x=(f=a.parameters)==null?void 0:f.docs)==null?void 0:x.source}}};const J=["Default","Empty","CustomWidth"];export{a as CustomWidth,r as Default,n as Empty,J as __namedExportsOrder,H as default};
