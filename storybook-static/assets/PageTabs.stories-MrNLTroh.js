import{R as e,r as f}from"./index-BVW8D_1y.js";import{P as w}from"./PageTabs-C--GMWh_.js";import"./_commonjsHelpers-BosuxZz1.js";import"./factory-CxM5CVDB.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./jsx-runtime-CniKdCFI.js";import"./Flex-FP2G1HC3.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./Text-dFWcX6d5.js";import"./get-safe-id-Bp3H8K0-.js";import"./get-contrast-color-D3mmixc0.js";import"./get-auto-contrast-value-Da6zqqWm.js";import"./create-safe-context-BGt5RmBf.js";import"./create-scoped-keydown-handler-O-eo68DQ.js";import"./DirectionProvider-CLUDE2bQ.js";import"./UnstyledButton-BK3SNOQq.js";import"./use-id-CKk3Bls3.js";import"./use-uncontrolled-GHWci0RL.js";const F={title:"Navigation/PageTabs",component:w,tags:["autodocs"],argTypes:{showTab1Count:{control:"boolean",description:"Show count badge on the first tab"},setSelectedTab:{action:"tab-selected"}},parameters:{docs:{description:{component:'PageTabs is the primary horizontal tab navigation used at the top of ServCraft\ndetail pages (jobs, invoices, customers, etc.).\n\n**Props:**\n- `tabs` — array of `{ text, count?, disabled?, newItem? }` objects\n- `selectedTab` — the currently active tab\'s text\n- `setSelectedTab` — called when a tab is clicked\n- `showTab1Count` — show the count badge on the first tab\n- `tabsProps` — forwarded to the underlying Mantine Tabs component\n\n**Variants:** Default · With counts · With disabled tab · With "new" badge'}}}},D=[{text:"Details"},{text:"Notes",count:3},{text:"Attachments",count:7},{text:"History"}],n=({tabs:t,...y})=>{const[T,S]=f.useState(t[0].text);return e.createElement(w,{...y,tabs:t,selectedTab:T,setSelectedTab:S,tabsProps:{}})},a={render:t=>e.createElement(n,{...t,tabs:[{text:"Details"},{text:"Notes"},{text:"History"}]})},r={name:"With count badges",render:t=>e.createElement(n,{...t,tabs:D})},s={name:"With disabled tab",render:t=>e.createElement(n,{...t,tabs:[{text:"Details"},{text:"Payments",count:2},{text:"Attachments",disabled:!0},{text:"History"}]})},o={name:'With "new" badge',render:t=>e.createElement(n,{...t,tabs:[{text:"Details"},{text:"AI Insights",newItem:!0},{text:"History"}]})};var i,c,d;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <Controlled {...args} tabs={[{
    text: 'Details'
  }, {
    text: 'Notes'
  }, {
    text: 'History'
  }]} />
}`,...(d=(c=a.parameters)==null?void 0:c.docs)==null?void 0:d.source}}};var m,l,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  name: 'With count badges',
  render: args => <Controlled {...args} tabs={TABS} />
}`,...(p=(l=r.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};var b,u,h;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'With disabled tab',
  render: args => <Controlled {...args} tabs={[{
    text: 'Details'
  }, {
    text: 'Payments',
    count: 2
  }, {
    text: 'Attachments',
    disabled: true
  }, {
    text: 'History'
  }]} />
}`,...(h=(u=s.parameters)==null?void 0:u.docs)==null?void 0:h.source}}};var g,x,W;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  name: 'With "new" badge',
  render: args => <Controlled {...args} tabs={[{
    text: 'Details'
  }, {
    text: 'AI Insights',
    newItem: true
  }, {
    text: 'History'
  }]} />
}`,...(W=(x=o.parameters)==null?void 0:x.docs)==null?void 0:W.source}}};const G=["Default","WithCounts","WithDisabled","WithNewBadge"];export{a as Default,r as WithCounts,s as WithDisabled,o as WithNewBadge,G as __namedExportsOrder,F as default};
