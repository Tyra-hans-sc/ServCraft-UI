import{r as p,R as n}from"./index-BVW8D_1y.js";import{j as o}from"./jsx-runtime-CniKdCFI.js";import{P}from"./kendo-empty-CYlDc4Bu.js";import{B as T}from"./button-D2YAKzq0.js";import"./_commonjsHelpers-BosuxZz1.js";import"./index-DCH-1kQU.js";import"./MantineThemeProvider-3Ly_klpC.js";function x({show:e,setShow:i,position:t,anchor:r,title:l,body:s,confirmText:j,onClick:m}){const g=()=>{i(!e),m(!1)},C=()=>{i(!e),m(!0)},w=p.useRef();return o.jsxs("div",{ref:w,children:[o.jsxs(P,{show:e,position:t,anchor:r?r.current:null,callout:!0,children:[o.jsx("div",{className:"sc-popover-icon-x",onClick:g,children:o.jsx("img",{src:"/icons/cross-black.svg"})}),o.jsx("div",{className:"sc-popover-title",children:l}),o.jsx("div",{className:"sc-popover-body",children:s}),o.jsx("div",{className:"buttons",children:o.jsx(T,{text:j,onClick:C,extraClasses:"fit-content w10"})})]}),o.jsx("style",{jsx:!0,children:`        
                .sc-popover-icon-x {
                    display: flex;
                    position: absolute;
                    right: 1rem;
                    top: 0.5rem;
                    cursor: pointer;
                }
                .sc-popover-title {
                    font-weight: bold;
                }
                .sc-popover-body {
                    margin-top: 0.5rem;   
                    max-width: 300px;                 
                }
                .buttons {
                    display: flex; 
                    justify-content: flex-end;                   
                }
            `})]})}const B={title:"Misc/SCPopover",component:x,tags:["autodocs"],argTypes:{position:{control:"select",options:["top","bottom","left","right"],description:"Popover position relative to anchor"},title:{control:"text",description:"Popover heading"},body:{control:"text",description:"Popover body message"},confirmText:{control:"text",description:"Confirm button label"},onClick:{action:"confirmed"}},parameters:{docs:{description:{component:"SCPopover is a confirmation popover anchored to a target element. It displays\na title, body message, and a confirm/cancel button pair.\n\n**Props:**\n- `show` — controls visibility\n- `setShow` — called to close the popover\n- `position` — anchor position (e.g. `'bottom'`, `'top'`)\n- `anchor` — ref to the anchor element\n- `title` — popover heading\n- `body` — popover body content (string or ReactNode)\n- `confirmText` — label for the confirm button\n- `onClick` — called with `true` (confirm) or `false` (cancel)\n\n**Variants:** Bottom · Confirm destructive action"}}}},y=e=>{const[i,t]=p.useState(!1),r=p.useRef(null);return n.createElement("div",{style:{padding:60,display:"flex",justifyContent:"center"}},n.createElement("button",{ref:r,onClick:()=>t(!0),style:{padding:"8px 16px",cursor:"pointer"}},e.title??"Show popover"),n.createElement(x,{...e,show:i,setShow:t,anchor:r,onClick:l=>{var s;t(!1),(s=e.onClick)==null||s.call(e,l)}}))},c={render:e=>n.createElement(y,{...e,title:"Delete item",body:"Are you sure you want to delete this item? This cannot be undone.",confirmText:"Delete",position:"bottom"})},a={name:"Archive confirmation",render:e=>n.createElement(y,{...e,title:"Archive job",body:"This job will be moved to the archive and hidden from active views.",confirmText:"Archive",position:"bottom"})};var d,f,u;c.parameters={...c.parameters,docs:{...(d=c.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: args => <PopoverDemo {...args} title="Delete item" body="Are you sure you want to delete this item? This cannot be undone." confirmText="Delete" position="bottom" />
}`,...(u=(f=c.parameters)==null?void 0:f.docs)==null?void 0:u.source}}};var v,h,b;a.parameters={...a.parameters,docs:{...(v=a.parameters)==null?void 0:v.docs,source:{originalSource:`{
  name: 'Archive confirmation',
  render: args => <PopoverDemo {...args} title="Archive job" body="This job will be moved to the archive and hidden from active views." confirmText="Archive" position="bottom" />
}`,...(b=(h=a.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};const _=["Default","ArchiveConfirm"];export{a as ArchiveConfirm,c as Default,_ as __namedExportsOrder,B as default};
