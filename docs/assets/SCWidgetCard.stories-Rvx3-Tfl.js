import{R as e}from"./index-BVW8D_1y.js";import{C as R}from"./Card-DFkid-Vw.js";import{C as H}from"./CloseButton-BvzZ9njs.js";import{S as a}from"./Stack-Cs_ZCZ3k.js";import{T as s}from"./Title-BU667j9_.js";import{T as i}from"./Text-dFWcX6d5.js";import"./_commonjsHelpers-BosuxZz1.js";import"./jsx-runtime-CniKdCFI.js";import"./factory-CxM5CVDB.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./polymorphic-factory-9vZrh0Ar.js";import"./Paper-DTeNswiC.js";import"./create-safe-context-BGt5RmBf.js";import"./UnstyledButton-BK3SNOQq.js";const r=({children:t,onDismiss:g,background:l="white",height:z="100%",dismissHidden:B=!1,cardProps:F})=>React.createElement(React.Fragment,null,React.createElement(R,{className:"sc-widget-card-container",mih:100,h:z,radius:8,mx:0,p:24,bg:l,...F},t,g&&React.createElement(H,{style:{position:"absolute",right:4,top:4},styles:{root:{color:l!=="white"?"white":"var(--mantine-color-gray-7)"}},variant:"transparent",hidden:B,onClick:v=>{g(),v.stopPropagation()}})),React.createElement("style",{jsx:!0},`

            :global(.sc-widget-card-container) {
                box-shadow: 0px 1px 3px 0px #0000001A;
            }
          

        `)),J={title:"Widgets/SCWidgetCard",component:r,tags:["autodocs"],argTypes:{background:{control:"color",description:"Card background colour"},height:{control:"text",description:"Card height (CSS value or number in px)"},dismissHidden:{control:"boolean",description:"Hide the dismiss button"},onDismiss:{action:"dismissed"}},parameters:{docs:{description:{component:'SCWidgetCard is the base container for all dashboard widgets. It wraps\nMantine\'s Card with a consistent shadow, padding (24px), and border radius (8px).\n\nPass any content as `children`. Provide `onDismiss` to show a close button\nin the top-right corner (used for dismissible dashboard tiles).\n\n**Props:**\n- `background` — any CSS colour or Mantine colour key (default: `"white"`)\n- `height` — card height (default: `"100%"`)\n- `dismissHidden` — hides the close button without removing the handler\n- `cardProps` — forwarded to the underlying Mantine Card\n\n**Variants:** Default · Coloured · With dismiss button · Custom height'}}}},o={render:t=>e.createElement(r,{...t},e.createElement(a,{gap:"xs"},e.createElement(s,{order:5},"Widget title"),e.createElement(i,{size:"sm",c:"dimmed"},"Widget content goes here. This card provides the standard container for all dashboard widgets.")))},d={name:"With dismiss button",render:t=>e.createElement(r,{...t,onDismiss:()=>{}},e.createElement(a,{gap:"xs"},e.createElement(s,{order:5},"Dismissible widget"),e.createElement(i,{size:"sm",c:"dimmed"},"Click the × in the top right to dismiss this widget.")))},n={name:"Coloured background",args:{background:"#003ED0"},render:t=>e.createElement(r,{...t,onDismiss:()=>{}},e.createElement(a,{gap:"xs"},e.createElement(s,{order:5,c:"white"},"Featured widget"),e.createElement(i,{size:"sm",c:"rgba(255,255,255,0.8)"},"The close button colour adapts to light/dark backgrounds automatically.")))},c={name:"Light blue background",args:{background:"#e9f1ff"},render:t=>e.createElement(r,{...t},e.createElement(a,{gap:"xs"},e.createElement(s,{order:5},"Info widget"),e.createElement(i,{size:"sm"},"Used for informational or promotional dashboard tiles.")))},m={name:"Fixed height (200px)",args:{height:200},render:t=>e.createElement(r,{...t},e.createElement(a,{gap:"xs"},e.createElement(s,{order:5},"Fixed height widget"),e.createElement(i,{size:"sm",c:"dimmed"},"This widget has a fixed height of 200px.")))};var h,p,u;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: args => <SCWidgetCard {...args}>
      <Stack gap="xs">
        <Title order={5}>Widget title</Title>
        <Text size="sm" c="dimmed">Widget content goes here. This card provides the standard container for all dashboard widgets.</Text>
      </Stack>
    </SCWidgetCard>
}`,...(u=(p=o.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var x,C,b;d.parameters={...d.parameters,docs:{...(x=d.parameters)==null?void 0:x.docs,source:{originalSource:`{
  name: 'With dismiss button',
  render: args => <SCWidgetCard {...args} onDismiss={() => {}}>
      <Stack gap="xs">
        <Title order={5}>Dismissible widget</Title>
        <Text size="sm" c="dimmed">Click the × in the top right to dismiss this widget.</Text>
      </Stack>
    </SCWidgetCard>
}`,...(b=(C=d.parameters)==null?void 0:C.docs)==null?void 0:b.source}}};var f,S,k;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  name: 'Coloured background',
  args: {
    background: '#003ED0'
  },
  render: args => <SCWidgetCard {...args} onDismiss={() => {}}>
      <Stack gap="xs">
        <Title order={5} c="white">Featured widget</Title>
        <Text size="sm" c="rgba(255,255,255,0.8)">The close button colour adapts to light/dark backgrounds automatically.</Text>
      </Stack>
    </SCWidgetCard>
}`,...(k=(S=n.parameters)==null?void 0:S.docs)==null?void 0:k.source}}};var T,w,E;c.parameters={...c.parameters,docs:{...(T=c.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: 'Light blue background',
  args: {
    background: '#e9f1ff'
  },
  render: args => <SCWidgetCard {...args}>
      <Stack gap="xs">
        <Title order={5}>Info widget</Title>
        <Text size="sm">Used for informational or promotional dashboard tiles.</Text>
      </Stack>
    </SCWidgetCard>
}`,...(E=(w=c.parameters)==null?void 0:w.docs)==null?void 0:E.source}}};var W,D,y;m.parameters={...m.parameters,docs:{...(W=m.parameters)==null?void 0:W.docs,source:{originalSource:`{
  name: 'Fixed height (200px)',
  args: {
    height: 200
  },
  render: args => <SCWidgetCard {...args}>
      <Stack gap="xs">
        <Title order={5}>Fixed height widget</Title>
        <Text size="sm" c="dimmed">This widget has a fixed height of 200px.</Text>
      </Stack>
    </SCWidgetCard>
}`,...(y=(D=m.parameters)==null?void 0:D.docs)==null?void 0:y.source}}};const K=["Default","WithDismissButton","ColouredBackground","LightBlueBackground","FixedHeight"];export{n as ColouredBackground,o as Default,m as FixedHeight,c as LightBlueBackground,d as WithDismissButton,K as __namedExportsOrder,J as default};
