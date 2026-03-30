import{r as S,R as a}from"./index-BVW8D_1y.js";import{j as r}from"./jsx-runtime-CniKdCFI.js";import{P as j}from"./PageTabs-C--GMWh_.js";import{c as t}from"./index-DCH-1kQU.js";import"./_commonjsHelpers-BosuxZz1.js";import"./factory-CxM5CVDB.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./Flex-FP2G1HC3.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./Text-dFWcX6d5.js";import"./get-safe-id-Bp3H8K0-.js";import"./get-contrast-color-D3mmixc0.js";import"./get-auto-contrast-value-Da6zqqWm.js";import"./create-safe-context-BGt5RmBf.js";import"./create-scoped-keydown-handler-O-eo68DQ.js";import"./DirectionProvider-CLUDE2bQ.js";import"./UnstyledButton-BK3SNOQq.js";import"./use-id-CKk3Bls3.js";import"./use-uncontrolled-GHWci0RL.js";function $(e){const[d,b]=S.useState(e.showTab1Count?e.showTab1Count:!1);return e.useNewTabs?r.jsx(j,{...e}):r.jsx(r.Fragment,{children:r.jsxs("div",{className:"tabs",children:[e.tabs.map((o,m)=>r.jsxs("div",{className:`tab ${o.text==e.selectedTab?"tab-selected":""}`,onClick:()=>e.disabled!==!0&&e.setSelectedTab(o.text),style:o.fitContent?{width:"fit-content"}:{},children:[o.text,(m!=0||d)&&!o.suppressCount?r.jsx("div",{className:"count",children:o.count}):""]},m)),r.jsx("style",{jsx:!0,children:`
                .tabs {
                  display: flex;
                  ${e.noMarginTop?"":(e.smallMarginTop,"margin-top: 0.5rem;")}
                  width: 100%;
                  position: relative;
                }

                .tab {
                  align-items: center;

                  border-radius: 4px 4px 0px 0px;
                  box-sizing: border-box;
                  color: ${t.blueGrey};
                  cursor: ${e.disabled===!0?"not-allowed":"pointer"};
                  display: flex;
                  flex-grow: 1;
                  height: 2.5rem;
                  justify-content: space-between;
                  padding: 0 1rem;
                  background-color: ${t.formGrey};
                }

                .tab-selected {
                  background-color: ${t.white};
                  border-bottom: 3px solid ${t.bluePrimary};
                  box-shadow: 8px 4px 4px rgba(178, 194, 205, 0.2);
                  /*z-index: 1;*/
                }

                .tab-selected:hover {
                  background-color: ${t.white};
                }

                .tab:hover {
                  ${e.disabled===!0?"":`
                      background-color: ${t.white};
                    `}
                }

                .tab + .tab {
                  margin-left: 0.25rem;
                }

                .horizontal-line {
                  width: 100%;
                  position: absolute;
                  left: 0;
                  bottom: 0;
                  border-bottom: 3px solid ${t.blueGreyLight};
                }

                .count {
                  align-items: center;
                  background-color: ${t.blueGreyLight};
                  border-radius: 0.75rem;
                  color: ${t.white};
                  display: flex;
                  font-size: 0.75rem;
                  font-weight: bold;
                  height: 1.5rem;
                  justify-content: center;
                  width: 1.5rem;
                }

                .tab-selected .count {
                  background-color: ${t.bluePrimary};
                }
              `})]})})}const B={title:"Navigation/Tabs",component:$,tags:["autodocs"],argTypes:{disabled:{control:"boolean",description:"Disables all tab interaction"},showTab1Count:{control:"boolean",description:"Show count badge on first tab"},setSelectedTab:{action:"tab-selected"}},parameters:{docs:{description:{component:"Tabs is the standard tab navigation component used in list pages and\nfiltered views throughout ServCraft.\n\n**Props:**\n- `tabs` — array of `{ text, count?, suppressCount?, fitContent?, disabled? }`\n- `selectedTab` — the currently active tab text\n- `setSelectedTab` — called when a tab is clicked\n- `showTab1Count` — show count on the first tab\n- `disabled` — disables all tab interaction\n\n**Variants:** Default · With counts · Disabled · Compact (fitContent)"}}}},c=({tabs:e,...d})=>{const[b,o]=S.useState(e[0].text);return a.createElement($,{...d,tabs:e,selectedTab:b,setSelectedTab:o})},n={render:e=>a.createElement(c,{...e,tabs:[{text:"All"},{text:"Active"},{text:"Completed"}]})},s={name:"With counts",render:e=>a.createElement(c,{...e,tabs:[{text:"All",count:142},{text:"Pending",count:23},{text:"In Progress",count:8},{text:"Complete",count:111}]})},i={name:"With disabled tab",render:e=>a.createElement(c,{...e,tabs:[{text:"Active"},{text:"Archived",disabled:!0},{text:"All"}]})},l={name:"All tabs disabled",render:e=>a.createElement(c,{...e,tabs:[{text:"Jobs"},{text:"Quotes"},{text:"Invoices"}],disabled:!0})};var u,x,p;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: args => <Controlled {...args} tabs={[{
    text: 'All'
  }, {
    text: 'Active'
  }, {
    text: 'Completed'
  }]} />
}`,...(p=(x=n.parameters)==null?void 0:x.docs)==null?void 0:p.source}}};var h,g,f;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  name: 'With counts',
  render: args => <Controlled {...args} tabs={[{
    text: 'All',
    count: 142
  }, {
    text: 'Pending',
    count: 23
  }, {
    text: 'In Progress',
    count: 8
  }, {
    text: 'Complete',
    count: 111
  }]} />
}`,...(f=(g=s.parameters)==null?void 0:g.docs)==null?void 0:f.source}}};var C,w,T;i.parameters={...i.parameters,docs:{...(C=i.parameters)==null?void 0:C.docs,source:{originalSource:`{
  name: 'With disabled tab',
  render: args => <Controlled {...args} tabs={[{
    text: 'Active'
  }, {
    text: 'Archived',
    disabled: true
  }, {
    text: 'All'
  }]} />
}`,...(T=(w=i.parameters)==null?void 0:w.docs)==null?void 0:T.source}}};var v,A,y;l.parameters={...l.parameters,docs:{...(v=l.parameters)==null?void 0:v.docs,source:{originalSource:`{
  name: 'All tabs disabled',
  render: args => <Controlled {...args} tabs={[{
    text: 'Jobs'
  }, {
    text: 'Quotes'
  }, {
    text: 'Invoices'
  }]} disabled />
}`,...(y=(A=l.parameters)==null?void 0:A.docs)==null?void 0:y.source}}};const H=["Default","WithCounts","WithDisabledTab","AllDisabled"];export{l as AllDisabled,n as Default,s as WithCounts,i as WithDisabledTab,H as __namedExportsOrder,B as default};
