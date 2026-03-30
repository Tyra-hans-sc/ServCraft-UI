import{R as e}from"./index-BVW8D_1y.js";import"./_commonjsHelpers-BosuxZz1.js";const o=({text:t="SAMPLE",rotation:S="-25deg"})=>React.createElement(React.Fragment,null,React.createElement("div",{style:{position:"absolute",left:0,right:0,top:0,bottom:0,pointerEvents:"none",fontSize:"5rem",opacity:.1}},React.createElement("div",{style:{position:"absolute",left:"50%",top:"50%",transform:`translate(-50%, -50%) rotate(${S})`}}," ",t))),W={title:"Feedback/SCWatermark",component:o,tags:["autodocs"],argTypes:{text:{control:"text",description:"Watermark text"},rotation:{control:"text",description:"CSS rotation angle (e.g. -25deg)"}},parameters:{docs:{description:{component:'SCWatermark overlays a diagonal text watermark on its containing element.\nUsed on printed documents and PDF previews to mark them as drafts or samples.\n\n**Props:**\n- `text` — watermark text (default: `"SAMPLE"`)\n- `rotation` — CSS rotation (default: `"-25deg"`)\n\nThe component renders with `position: absolute` — wrap it in a `position: relative`\ncontainer so it overlays the correct area.\n\n**Variants:** Default · Custom text · Custom rotation'}}}},s=({children:t})=>e.createElement("div",{style:{position:"relative",width:400,height:240,border:"1px solid #eee",borderRadius:8,padding:24,overflow:"hidden"}},e.createElement("p",{style:{color:"#333",margin:0}},"Invoice #INV-00542",e.createElement("br",null),"Customer: Acme Corp",e.createElement("br",null),"Total: $1,250.00"),t),r={render:t=>e.createElement(s,null,e.createElement(o,{...t}))},a={args:{text:"DRAFT"},render:t=>e.createElement(s,null,e.createElement(o,{...t}))},n={args:{text:"VOID",rotation:"-30deg"},render:t=>e.createElement(s,null,e.createElement(o,{...t}))};var c,i,l;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: args => <Wrapper>
      <SCWatermark {...args} />
    </Wrapper>
}`,...(l=(i=r.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var m,p,d;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    text: 'DRAFT'
  },
  render: args => <Wrapper>
      <SCWatermark {...args} />
    </Wrapper>
}`,...(d=(p=a.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var u,g,E;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    text: 'VOID',
    rotation: '-30deg'
  },
  render: args => <Wrapper>
      <SCWatermark {...args} />
    </Wrapper>
}`,...(E=(g=n.parameters)==null?void 0:g.docs)==null?void 0:E.source}}};const C=["Default","Draft","Void"];export{r as Default,a as Draft,n as Void,C as __namedExportsOrder,W as default};
