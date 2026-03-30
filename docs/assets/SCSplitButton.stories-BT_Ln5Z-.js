import{r as v,R as t}from"./index-BVW8D_1y.js";import{u as H,r as h}from"./MantineThemeProvider-3Ly_klpC.js";import{G}from"./Group-B1Wj5x_m.js";import{B as N}from"./Button-By4lzAlI.js";import{M as i}from"./Menu-D-nSn8bK.js";import{A as O}from"./ActionIcon-8-KHisDK.js";import{I as $}from"./IconChevronDown-BRghH-O-.js";import{c as b}from"./createReactComponent-C_JDq-5z.js";import"./_commonjsHelpers-BosuxZz1.js";import"./jsx-runtime-CniKdCFI.js";import"./factory-CxM5CVDB.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./Transition-CLC0U5JG.js";import"./index-CvEbaogi.js";import"./use-reduced-motion-BToEjtDa.js";import"./UnstyledButton-BK3SNOQq.js";import"./create-scoped-keydown-handler-O-eo68DQ.js";import"./use-resolved-styles-api-B7PIHi2u.js";import"./Popover-DGZnAMV1.js";import"./OptionalPortal-BWrhjSaK.js";import"./use-id-CKk3Bls3.js";import"./use-merged-ref-CANbyt_7.js";import"./DirectionProvider-CLUDE2bQ.js";import"./use-floating-auto-update-D8OWX04j.js";import"./create-safe-context-BGt5RmBf.js";import"./FocusTrap-B6wIDhIz.js";import"./use-uncontrolled-GHWci0RL.js";import"./index-D_4CslRg.js";var j=b("download","IconDownload",[["path",{d:"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2",key:"svg-0"}],["path",{d:"M7 11l5 5l5 -5",key:"svg-1"}],["path",{d:"M12 4l0 12",key:"svg-2"}]]),q=b("printer","IconPrinter",[["path",{d:"M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2",key:"svg-0"}],["path",{d:"M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4",key:"svg-1"}],["path",{d:"M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z",key:"svg-2"}]]),J=b("send","IconSend",[["path",{d:"M10 14l11 -11",key:"svg-0"}],["path",{d:"M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5",key:"svg-1"}]]);const K="_button_fxb6n_1",L="_menuControl_fxb6n_6",f={button:K,menuControl:L};function o({items:r,disabled:u=!1}){const T=H(),n=v.useMemo(()=>{let e=r.find(a=>a.defaultItem===!0&&!a.hidden);return e||(e=r[0]),e},[r]),S=v.useMemo(()=>r.filter(a=>a.key!==n.key&&!a.hidden),[r]);return React.createElement(G,{wrap:"nowrap",gap:0},n&&React.createElement(N,{disabled:n.disabled||u,className:f.button,onClick:n.action,leftSection:n.leftSection,rightSection:n.rightSection,title:n.title},n.label),React.createElement(i,{transitionProps:{transition:"scale-y"},position:"bottom-end",withinPortal:!0,shadow:"sm"},React.createElement(i.Target,null,React.createElement(O,{disabled:u,variant:"filled",color:T.primaryColor,size:36,className:f.menuControl},React.createElement($,{style:{width:h(16),height:h(16)},stroke:1.5}))),Array.isArray(S)&&S.length>0&&React.createElement(i.Dropdown,{mt:-4,p:0},S.map((e,a)=>e.hidden?React.createElement(React.Fragment,null):React.createElement("div",{title:e.title},React.createElement(i.Item,{key:a,disabled:e.disabled||u,onClick:e.action,leftSection:e.leftSection,rightSection:e.rightSection},e.label))))))}const ge={title:"Form Controls/SCSplitButton",component:o,tags:["autodocs"],argTypes:{disabled:{control:"boolean",description:"Disables the entire control (button + all menu items)"}},parameters:{docs:{description:{component:`SCSplitButton combines a primary action button with a dropdown menu of
secondary actions. It's used throughout ServCraft for contextual actions
where one action is primary (e.g. Save) and others are secondary
(e.g. Save and send, Save as draft).

The first item with \`defaultItem: true\` becomes the primary button.
All other non-hidden items appear in the dropdown menu.

Set \`hidden: true\` on an item to remove it from both button and menu.
Set \`disabled: true\` on an item to grey it out but keep it visible.

**States:** Default · With icons · Some items disabled · All disabled · Hidden items · Single item`}}}},l={render:()=>t.createElement(o,{items:[{key:"save",label:"Save",defaultItem:!0,action:()=>{}},{key:"save-send",label:"Save and send",action:()=>{}},{key:"save-draft",label:"Save as draft",action:()=>{}}]})},s={name:"With icons",render:()=>t.createElement(o,{items:[{key:"download",label:"Download PDF",defaultItem:!0,leftSection:t.createElement(j,{size:14}),action:()=>{}},{key:"print",label:"Print",leftSection:t.createElement(q,{size:14}),action:()=>{}},{key:"send",label:"Send to customer",leftSection:t.createElement(J,{size:14}),action:()=>{}}]})},d={name:"Some items disabled",render:()=>t.createElement(o,{items:[{key:"save",label:"Save",defaultItem:!0,action:()=>{}},{key:"send",label:"Send invoice",action:()=>{}},{key:"delete",label:"Delete",disabled:!0,action:()=>{}}]})},c={name:"All disabled",render:()=>t.createElement(o,{disabled:!0,items:[{key:"save",label:"Save",defaultItem:!0,action:()=>{}},{key:"save-send",label:"Save and send",action:()=>{}}]})},m={name:"With hidden items (permissions)",render:()=>t.createElement(o,{items:[{key:"save",label:"Save",defaultItem:!0,action:()=>{}},{key:"approve",label:"Approve",action:()=>{}},{key:"delete",label:"Delete (hidden)",hidden:!0,action:()=>{}}]})},p={name:"Single item (no dropdown)",render:()=>t.createElement(o,{items:[{key:"save",label:"Save",defaultItem:!0,action:()=>{}}]})};var y,k,I;l.parameters={...l.parameters,docs:{...(y=l.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <SCSplitButton items={[{
    key: 'save',
    label: 'Save',
    defaultItem: true,
    action: () => {}
  }, {
    key: 'save-send',
    label: 'Save and send',
    action: () => {}
  }, {
    key: 'save-draft',
    label: 'Save as draft',
    action: () => {}
  }]} />
}`,...(I=(k=l.parameters)==null?void 0:k.docs)==null?void 0:I.source}}};var g,w,D;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  name: 'With icons',
  render: () => <SCSplitButton items={[{
    key: 'download',
    label: 'Download PDF',
    defaultItem: true,
    leftSection: <IconDownload size={14} />,
    action: () => {}
  }, {
    key: 'print',
    label: 'Print',
    leftSection: <IconPrinter size={14} />,
    action: () => {}
  }, {
    key: 'send',
    label: 'Send to customer',
    leftSection: <IconSend size={14} />,
    action: () => {}
  }]} />
}`,...(D=(w=s.parameters)==null?void 0:w.docs)==null?void 0:D.source}}};var E,C,R;d.parameters={...d.parameters,docs:{...(E=d.parameters)==null?void 0:E.docs,source:{originalSource:`{
  name: 'Some items disabled',
  render: () => <SCSplitButton items={[{
    key: 'save',
    label: 'Save',
    defaultItem: true,
    action: () => {}
  }, {
    key: 'send',
    label: 'Send invoice',
    action: () => {}
  }, {
    key: 'delete',
    label: 'Delete',
    disabled: true,
    action: () => {}
  }]} />
}`,...(R=(C=d.parameters)==null?void 0:C.docs)==null?void 0:R.source}}};var M,A,B;c.parameters={...c.parameters,docs:{...(M=c.parameters)==null?void 0:M.docs,source:{originalSource:`{
  name: 'All disabled',
  render: () => <SCSplitButton disabled items={[{
    key: 'save',
    label: 'Save',
    defaultItem: true,
    action: () => {}
  }, {
    key: 'save-send',
    label: 'Save and send',
    action: () => {}
  }]} />
}`,...(B=(A=c.parameters)==null?void 0:A.docs)==null?void 0:B.source}}};var W,P,z;m.parameters={...m.parameters,docs:{...(W=m.parameters)==null?void 0:W.docs,source:{originalSource:`{
  name: 'With hidden items (permissions)',
  render: () => <SCSplitButton items={[{
    key: 'save',
    label: 'Save',
    defaultItem: true,
    action: () => {}
  }, {
    key: 'approve',
    label: 'Approve',
    action: () => {}
  }, {
    key: 'delete',
    label: 'Delete (hidden)',
    hidden: true,
    action: () => {}
  }]} />
}`,...(z=(P=m.parameters)==null?void 0:P.docs)==null?void 0:z.source}}};var _,x,F;p.parameters={...p.parameters,docs:{...(_=p.parameters)==null?void 0:_.docs,source:{originalSource:`{
  name: 'Single item (no dropdown)',
  render: () => <SCSplitButton items={[{
    key: 'save',
    label: 'Save',
    defaultItem: true,
    action: () => {}
  }]} />
}`,...(F=(x=p.parameters)==null?void 0:x.docs)==null?void 0:F.source}}};const we=["Default","WithIcons","WithDisabledItem","AllDisabled","WithHiddenItems","SingleItem"];export{c as AllDisabled,l as Default,p as SingleItem,d as WithDisabledItem,m as WithHiddenItems,s as WithIcons,we as __namedExportsOrder,ge as default};
