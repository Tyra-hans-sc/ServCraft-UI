import{j as t}from"./jsx-runtime-CniKdCFI.js";import"./index-BVW8D_1y.js";import{N as u}from"./no-ssr-D3RVQ5dx.js";import{A as h}from"./kendo-empty-CYlDc4Bu.js";import"./_commonjsHelpers-BosuxZz1.js";function S({content:g,size:x}){return t.jsx(u,{children:t.jsx(h,{type:"text",size:"small",shape:"circle",themeColor:"red",children:t.jsx("span",{children:g})})})}const w={title:"Layout/SCAvatar",component:S,tags:["autodocs"],argTypes:{content:{control:"text",description:"Initials or label shown inside the avatar"}},parameters:{docs:{description:{component:'SCAvatar renders a circular avatar showing initials or a short text label.\nIt wraps the Kendo React Avatar component with a fixed `"small"` size and\n`"circle"` shape.\n\n**Props:**\n- `content` — initials or short label to display (e.g. `"AJ"`, `"SC"`)\n- `size` — forwarded to the underlying avatar (currently fixed to `"small"`)\n\n> In Storybook, Kendo components are replaced with a no-op mock. The avatar\n> renders its `content` via a `<span>` inside the Kendo Avatar shell.\n\n**Variants:** Single initial · Two initials · Long name'}}}},a={args:{content:"AJ"}},e={name:"Single initial",args:{content:"A"}},n={name:"Company initials",args:{content:"SC"}};var r,o,s;a.parameters={...a.parameters,docs:{...(r=a.parameters)==null?void 0:r.docs,source:{originalSource:`{
  args: {
    content: 'AJ'
  }
}`,...(s=(o=a.parameters)==null?void 0:o.docs)==null?void 0:s.source}}};var i,c,l;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  name: 'Single initial',
  args: {
    content: 'A'
  }
}`,...(l=(c=e.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var m,p,d;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`{
  name: 'Company initials',
  args: {
    content: 'SC'
  }
}`,...(d=(p=n.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};const I=["Default","SingleInitial","CompanyInitials"];export{n as CompanyInitials,a as Default,e as SingleInitial,I as __namedExportsOrder,w as default};
