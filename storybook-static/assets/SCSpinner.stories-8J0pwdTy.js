import{R as t}from"./index-BVW8D_1y.js";import"./_commonjsHelpers-BosuxZz1.js";const l=({colour:r="light"})=>React.createElement(React.Fragment,null,React.createElement("img",{src:"/specno-icons/autorenew.svg",className:"spinner",alt:"busy"}),React.createElement("style",{jsx:!0},`
    
            @keyframes rotation {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(359deg);
                }
            }

            .spinner {
                ${r==="light"?"filter: brightness(10000);":""}
                animation: rotation 2s infinite linear;
            }

    `)),p={title:"Feedback/SCSpinner",component:l,tags:["autodocs"],argTypes:{colour:{control:"radio",options:["light","dark"],description:"Spinner colour — use light on dark backgrounds, dark on light"}},parameters:{docs:{description:{component:"SCSpinner is the standard loading indicator for ServCraft. It renders a\nMantine Loader sized to fill its container.\n\n**Props:**\n- `colour` — `'light'` (default) or `'dark'`\n\nUse `'light'` on dark backgrounds, `'dark'` on light or white backgrounds.\n\n**Variants:** Light · Dark"}}}},e={args:{colour:"light"},decorators:[r=>t.createElement("div",{style:{background:"#003ED0",padding:32,borderRadius:8,display:"flex",justifyContent:"center"}},t.createElement(r,null))]},n={args:{colour:"dark"},decorators:[r=>t.createElement("div",{style:{background:"#f8f9fa",padding:32,borderRadius:8,display:"flex",justifyContent:"center"}},t.createElement(r,null))]};var a,o,s;e.parameters={...e.parameters,docs:{...(a=e.parameters)==null?void 0:a.docs,source:{originalSource:`{
  args: {
    colour: 'light'
  },
  decorators: [Story => <div style={{
    background: '#003ED0',
    padding: 32,
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'center'
  }}>
        <Story />
      </div>]
}`,...(s=(o=e.parameters)==null?void 0:o.docs)==null?void 0:s.source}}};var i,d,c;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    colour: 'dark'
  },
  decorators: [Story => <div style={{
    background: '#f8f9fa',
    padding: 32,
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'center'
  }}>
        <Story />
      </div>]
}`,...(c=(d=n.parameters)==null?void 0:d.docs)==null?void 0:c.source}}};const m=["Light","Dark"];export{n as Dark,e as Light,m as __namedExportsOrder,p as default};
