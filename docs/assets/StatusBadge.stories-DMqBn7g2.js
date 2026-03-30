import{R as N}from"./index-BVW8D_1y.js";import{g as w}from"./enums-DkpuAbLR.js";import{B as k}from"./Badge-C3rNh7YL.js";import"./_commonjsHelpers-BosuxZz1.js";import"./jsx-runtime-CniKdCFI.js";import"./factory-CxM5CVDB.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./polymorphic-factory-9vZrh0Ar.js";const x=({value:c,statusEnum:L,statusColors:m,minWidth:U,...V})=>{const h=w(L,c,!0),y=(m==null?void 0:m[c])||"gray";return N.createElement(k,{miw:U,color:y,variant:"filled",p:"sm",radius:4,...V},h??"Unknown")},G={title:"Feedback/StatusBadge",component:x,tags:["autodocs"],argTypes:{value:{control:"number",description:"Numeric status value"},minWidth:{control:"text",description:"Minimum badge width"}},parameters:{docs:{description:{component:"StatusBadge renders a coloured Mantine Badge for a numeric status value.\nPass in the enum object and colour map for your domain entity.\n\n**Props:**\n- `value` — the numeric status value to display\n- `statusEnum` — `{ [label: string]: number }` — the status enumeration\n- `statusColors` — `{ [value: number]: string }` — colour for each status value\n- `minWidth` — minimum badge width\n- All Mantine `BadgeProps` are forwarded\n\n**Variants:** All job statuses · All invoice statuses"}}}},o={Pending:0,"In Progress":1,Complete:2,"On Hold":3,Cancelled:4},u={0:"yellow",1:"blue",2:"green",3:"orange",4:"red"},f={Draft:0,Sent:1,Paid:2,Overdue:3,Void:4},R={0:"gray",1:"blue",2:"green",3:"red",4:"dark"},e={name:"Job — Pending",args:{value:0,statusEnum:o,statusColors:u}},s={name:"Job — In Progress",args:{value:1,statusEnum:o,statusColors:u}},a={name:"Job — Complete",args:{value:2,statusEnum:o,statusColors:u}},n={name:"Job — Cancelled",args:{value:4,statusEnum:o,statusColors:u}},r={name:"Invoice — Paid",args:{value:2,statusEnum:f,statusColors:R}},t={name:"Invoice — Overdue",args:{value:3,statusEnum:f,statusColors:R}};var i,l,d;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  name: 'Job — Pending',
  args: {
    value: 0,
    statusEnum: JOB_STATUS,
    statusColors: JOB_COLORS
  }
}`,...(d=(l=e.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var p,g,O;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  name: 'Job — In Progress',
  args: {
    value: 1,
    statusEnum: JOB_STATUS,
    statusColors: JOB_COLORS
  }
}`,...(O=(g=s.parameters)==null?void 0:g.docs)==null?void 0:O.source}}};var S,v,C;a.parameters={...a.parameters,docs:{...(S=a.parameters)==null?void 0:S.docs,source:{originalSource:`{
  name: 'Job — Complete',
  args: {
    value: 2,
    statusEnum: JOB_STATUS,
    statusColors: JOB_COLORS
  }
}`,...(C=(v=a.parameters)==null?void 0:v.docs)==null?void 0:C.source}}};var b,J,I;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'Job — Cancelled',
  args: {
    value: 4,
    statusEnum: JOB_STATUS,
    statusColors: JOB_COLORS
  }
}`,...(I=(J=n.parameters)==null?void 0:J.docs)==null?void 0:I.source}}};var E,P,_;r.parameters={...r.parameters,docs:{...(E=r.parameters)==null?void 0:E.docs,source:{originalSource:`{
  name: 'Invoice — Paid',
  args: {
    value: 2,
    statusEnum: INVOICE_STATUS,
    statusColors: INVOICE_COLORS
  }
}`,...(_=(P=r.parameters)==null?void 0:P.docs)==null?void 0:_.source}}};var T,B,A;t.parameters={...t.parameters,docs:{...(T=t.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: 'Invoice — Overdue',
  args: {
    value: 3,
    statusEnum: INVOICE_STATUS,
    statusColors: INVOICE_COLORS
  }
}`,...(A=(B=t.parameters)==null?void 0:B.docs)==null?void 0:A.source}}};const K=["JobPending","JobInProgress","JobComplete","JobCancelled","InvoicePaid","InvoiceOverdue"];export{t as InvoiceOverdue,r as InvoicePaid,n as JobCancelled,a as JobComplete,s as JobInProgress,e as JobPending,K as __namedExportsOrder,G as default};
