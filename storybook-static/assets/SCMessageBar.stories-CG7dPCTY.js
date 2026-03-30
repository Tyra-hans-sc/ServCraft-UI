import{R as a}from"./index-BVW8D_1y.js";import{S as l}from"./sc-message-bar-DbIsTsW3.js";import"./_commonjsHelpers-BosuxZz1.js";import"./time-DvoKLX2B.js";import"./iframe-BVkgZlLe.js";import"./jsx-runtime-CniKdCFI.js";import"./enums-DkpuAbLR.js";import"./index-DCH-1kQU.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./button-D2YAKzq0.js";import"./sc-modal-yq10hrkv.js";import"./sc-icon-CSalX3cM.js";const M={title:"Feedback/SCMessageBar",component:l,tags:["autodocs"],argTypes:{messageBarType:{control:"radio",options:[0,1],description:"0 = Warning (orange), 1 = Error (red)"},message:{control:"text",description:"Message text to display"},isActive:{control:"boolean",description:"Shows the bar when true"}},decorators:[u=>a.createElement("div",{style:{position:"relative",height:60,overflow:"hidden"}},a.createElement(u,null))],parameters:{docs:{description:{component:"SCMessageBar is a fixed top-of-page notification bar used for system-wide\nmessages such as subscription warnings or maintenance alerts.\n\n**MessageBarType values:**\n- `0` — Warning (orange background)\n- `1` — Error (red background)\n\n**Props:**\n- `messageBarType` — `0` (Warning) or `1` (Error)\n- `message` — the message text to display\n- `isActive` — shows the bar when `true` (default: `false`)\n\n> The bar renders at `position: fixed; top: 0` — stories use a relative\n> wrapper to keep it visible in the canvas."}}}},e={args:{messageBarType:0,message:"Your subscription expires in 7 days. Renew now to avoid service interruption.",isActive:!0}},s={args:{messageBarType:1,message:"Your account has been suspended. Please contact support to restore access.",isActive:!0}},r={name:"Inactive (hidden)",args:{messageBarType:0,message:"This message is not shown when isActive is false.",isActive:!1}};var t,o,n;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`{
  args: {
    messageBarType: 0,
    message: 'Your subscription expires in 7 days. Renew now to avoid service interruption.',
    isActive: true
  }
}`,...(n=(o=e.parameters)==null?void 0:o.docs)==null?void 0:n.source}}};var i,c,p;s.parameters={...s.parameters,docs:{...(i=s.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    messageBarType: 1,
    message: 'Your account has been suspended. Please contact support to restore access.',
    isActive: true
  }
}`,...(p=(c=s.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};var m,d,g;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  name: 'Inactive (hidden)',
  args: {
    messageBarType: 0,
    message: 'This message is not shown when isActive is false.',
    isActive: false
  }
}`,...(g=(d=r.parameters)==null?void 0:d.docs)==null?void 0:g.source}}};const W=["Warning","Error","Inactive"];export{s as Error,r as Inactive,e as Warning,W as __namedExportsOrder,M as default};
