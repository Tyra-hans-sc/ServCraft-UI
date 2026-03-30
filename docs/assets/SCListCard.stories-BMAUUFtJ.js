import{R as e}from"./index-BVW8D_1y.js";import{j as a}from"./jsx-runtime-CniKdCFI.js";import{u as L}from"./useMobileView-CH7qmEs1.js";import{l as d,s as w,c as j}from"./index-DCH-1kQU.js";import"./_commonjsHelpers-BosuxZz1.js";import"./MantineThemeProvider-3Ly_klpC.js";function n({children:r,background:o=j.white,onClick:l}){const[E]=L(),J=()=>{l&&l()};return a.jsxs(a.Fragment,{children:[a.jsx("div",{className:"list-card",onClick:J,children:r}),a.jsx("style",{jsx:!0,children:`
            .list-card {
                display: block;
                margin-top: 0.5rem;
                border-radius: ${d.bigRadius};
                box-shadow: ${w.cardSmall};
                background: ${o};
                padding: 0.5rem;
                cursor: pointer;
                ${E?"":`max-width: ${d.listCardWidth};`}
            }
        `})]})}const R={title:"Layout/SCListCard",component:n,tags:["autodocs"],argTypes:{background:{control:"color",description:"Card background colour"},onClick:{action:"clicked"}},parameters:{docs:{description:{component:`SCListCard is a clickable card used in list views. It wraps its children
in a card-style container with an optional click handler and background colour.

**Props:**
- \`children\` — content to display inside the card
- \`background\` — CSS background colour (default: white)
- \`onClick\` — called when the card is clicked (adds pointer cursor)

**Variants:** Default · Clickable · Coloured background · Stacked list`}}}},t={render:r=>e.createElement(n,{...r},e.createElement("strong",null,"Job #J-00123"),e.createElement("p",{style:{margin:"4px 0 0",color:"#666",fontSize:14}},"Replace gutters — Acme Corp · 42 Main St"))},s={render:r=>e.createElement(n,{...r,onClick:()=>{}},e.createElement("strong",null,"Invoice #INV-0054"),e.createElement("p",{style:{margin:"4px 0 0",color:"#666",fontSize:14}},"$1,250.00 · Paid · Due 15 Jun 2025"))},c={name:"Coloured background",render:r=>e.createElement(n,{...r,background:"#e9f1ff"},e.createElement("strong",null,"Upcoming appointment"),e.createElement("p",{style:{margin:"4px 0 0",fontSize:14}},"Tomorrow at 9:00 AM · Acme Corp"))},i={name:"Stacked list",render:r=>e.createElement("div",{style:{display:"flex",flexDirection:"column",gap:8,maxWidth:400}},["J-001","J-002","J-003"].map(o=>e.createElement(n,{key:o,...r,onClick:()=>{}},e.createElement("strong",null,"Job #",o),e.createElement("p",{style:{margin:"4px 0 0",color:"#666",fontSize:13}},"Sample job · In Progress"))))};var m,p,u;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: args => <SCListCard {...args}>
      <strong>Job #J-00123</strong>
      <p style={{
      margin: '4px 0 0',
      color: '#666',
      fontSize: 14
    }}>
        Replace gutters — Acme Corp · 42 Main St
      </p>
    </SCListCard>
}`,...(u=(p=t.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var g,C,k;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: args => <SCListCard {...args} onClick={() => {}}>
      <strong>Invoice #INV-0054</strong>
      <p style={{
      margin: '4px 0 0',
      color: '#666',
      fontSize: 14
    }}>
        $1,250.00 · Paid · Due 15 Jun 2025
      </p>
    </SCListCard>
}`,...(k=(C=s.parameters)==null?void 0:C.docs)==null?void 0:k.source}}};var S,f,b;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
  name: 'Coloured background',
  render: args => <SCListCard {...args} background="#e9f1ff">
      <strong>Upcoming appointment</strong>
      <p style={{
      margin: '4px 0 0',
      fontSize: 14
    }}>Tomorrow at 9:00 AM · Acme Corp</p>
    </SCListCard>
}`,...(b=(f=c.parameters)==null?void 0:f.docs)==null?void 0:b.source}}};var x,y,h;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  name: 'Stacked list',
  render: args => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxWidth: 400
  }}>
      {['J-001', 'J-002', 'J-003'].map(id => <SCListCard key={id} {...args} onClick={() => {}}>
          <strong>Job #{id}</strong>
          <p style={{
        margin: '4px 0 0',
        color: '#666',
        fontSize: 13
      }}>Sample job · In Progress</p>
        </SCListCard>)}
    </div>
}`,...(h=(y=i.parameters)==null?void 0:y.docs)==null?void 0:h.source}}};const M=["Default","Clickable","ColouredBackground","StackedList"];export{s as Clickable,c as ColouredBackground,t as Default,i as StackedList,M as __namedExportsOrder,R as default};
