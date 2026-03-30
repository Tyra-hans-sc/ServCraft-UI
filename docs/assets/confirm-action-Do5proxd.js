import{p as B,M as P}from"./Modal-C_LviWhy.js";import{g as H,J as Q,c as S}from"./enums-DkpuAbLR.js";import{F as V,H as J}from"./time-Drbfh5Um.js";import{j as C}from"./jsx-runtime-CniKdCFI.js";import{r as x}from"./index-BVW8D_1y.js";import{P as U,u as Y}from"./useMobileView-CH7qmEs1.js";import{c as $,l as D,t as W}from"./index-DCH-1kQU.js";import{S as K}from"./sc-input-DS8I7Qle.js";import{x as X}from"./index.esm-OsCIcMNx.js";import{u as ee,o as te}from"./atoms-DT7yhdZj.js";import{u as ie}from"./MantineThemeProvider-3Ly_klpC.js";import{u as j,b as ae}from"./use-reduced-motion-BToEjtDa.js";import{C as M}from"./CloseButton-BvzZ9njs.js";import{F as k}from"./Flex-FP2G1HC3.js";import{G}from"./Group-B1Wj5x_m.js";import{B as q}from"./Button-By4lzAlI.js";import{B as ne}from"./factory-CxM5CVDB.js";import{T as A}from"./Title-BU667j9_.js";import{T}from"./Text-dFWcX6d5.js";import{S as _}from"./Stack-Cs_ZCZ3k.js";function re(i,a){return i in a?B(a[i]):B(i)}function Ze(i,a){const e=i.map(o=>({value:o,px:re(o,a)}));return e.sort((o,s)=>o.px-s.px),e}const oe={x:0,y:0,width:0,height:0,top:0,left:0,bottom:0,right:0};function le(i){const a=x.useRef(0),e=x.useRef(null),[o,s]=x.useState(oe),u=x.useMemo(()=>typeof window<"u"?new ResizeObserver(g=>{const d=g[0];d&&(cancelAnimationFrame(a.current),a.current=requestAnimationFrame(()=>{e.current&&s(d.contentRect)}))}):null,[]);return x.useEffect(()=>(e.current&&(u==null||u.observe(e.current,i)),()=>{u==null||u.disconnect(),a.current&&cancelAnimationFrame(a.current)}),[e.current]),[e,o]}function I(i){const[a,{width:e,height:o}]=le(i);return{ref:a,width:e,height:o}}const se=async(i,a=null)=>(await V.get({url:`/Option?module=${i}`,ctx:a})).Results,ue=async(i,a)=>{let o=(await V.get({url:`/Option/GetByGroupName?group=${i}`})).Results,s=null;return o&&o.length>0&&(s=o.find(u=>u.OptionName==a)),s},de=async(i,a=null)=>await V.get({url:`/Option/GetByOptionName?name=${i}`,ctx:a}),me=async(i,a=null)=>await V.put({url:"/Option",params:i,toastCtx:a,statusIfNull:!0}),ce=i=>{let a={};return i.map(function(e){e.SystemType=="System.Boolean"?typeof e.OptionValue=="string"&&e.OptionValue.toUpperCase()=="FALSE"?a[e.OptionName]=!1:a[e.OptionName]=!0:a[e.OptionName]=e.OptionValue}),a},pe=i=>{let a={};return i.map(function(e){a[e.GroupName]||(a[e.GroupName]=[]),a[e.GroupName].push(e)}),a};function fe(i){let{fieldLabel1:a,fieldLabel2:e,fieldLabel3:o,fieldLabel4:s,dateFieldLabel1:u,dateFieldLabel2:g,filterFieldLabel1:d,filterFieldLabel2:F,numberFieldLabel1:y,numberFieldLabel2:O}=z(i,S.Customer),L=!1,l=!1,n=!1,f=!1,c=i.filter(m=>m.GroupName=="Customer Validation Settings");return c&&(L=c.find(p=>p.OptionName=="Customer Status Required").OptionValue=="true",l=c.find(p=>p.OptionName=="Customer Type Required").OptionValue=="true",n=c.find(p=>p.OptionName=="Industry Type Required").OptionValue=="true",f=c.find(p=>p.OptionName=="Media Type Required").OptionValue=="true"),{fieldLabel1:a,fieldLabel2:e,fieldLabel3:o,fieldLabel4:s,dateFieldLabel1:u,dateFieldLabel2:g,filterFieldLabel1:d,filterFieldLabel2:F,numberFieldLabel1:y,numberFieldLabel2:O,customerStatusRequired:L,customerTypeRequired:l,industryTypeRequired:n,mediaTypeRequired:f}}function be(i){let{fieldLabel1:a,fieldLabel2:e,fieldLabel3:o,fieldLabel4:s,dateFieldLabel1:u,dateFieldLabel2:g,filterFieldLabel1:d,filterFieldLabel2:F,numberFieldLabel1:y,numberFieldLabel2:O}=z(i,S.Asset),L=!1,l=!1,n=!1,f=!1,c=!1,m=i.filter(r=>r.GroupName=="Asset Validation Settings");if(m){let r=m.find(b=>b.OptionName=="Asset Custom Field 1 Required"),N=m.find(b=>b.OptionName=="Asset Custom Field 2 Required"),h=m.find(b=>b.OptionName=="Asset Serial Number Required"),p=m.find(b=>b.OptionName=="Asset Invoice Number Required"),R=m.find(b=>b.OptionName=="Asset Location Required");L=r?r.OptionValue.toLowerCase()==="true":!1,l=N?N.OptionValue.toLowerCase()==="true":!1,n=h?h.OptionValue.toLowerCase()==="true":!1,f=p?p.OptionValue.toLowerCase()==="true":!1,c=R?R.OptionValue.toLowerCase()==="true":!1}return{fieldLabel1:a,fieldLabel2:e,fieldLabel3:o,fieldLabel4:s,dateFieldLabel1:u,dateFieldLabel2:g,filterFieldLabel1:d,filterFieldLabel2:F,numberFieldLabel1:y,numberFieldLabel2:O,field1Required:L,field2Required:l,serialNumberRequired:n,invoiceNumberRequired:f,locationRequired:c}}function ge(i){return z(i,S.Query)}function Z(i){return z(i,S.JobCard)}const he=(i,a)=>{let{fieldLabel1:e,fieldLabel2:o,fieldLabel3:s,fieldLabel4:u,dateFieldLabel1:g,dateFieldLabel2:d,filterFieldLabel1:F,filterFieldLabel2:y,numberFieldLabel1:O,numberFieldLabel2:L}=Z(i),l=J.splitWords(H(Q,a.JobStatusOptionName));switch(l){case"Custom Field1":l=e;break;case"Custom Field2":l=o;break;case"Custom Field3":l=s;break;case"Custom Field4":l=u;break;case"Custom Date1":l=g;break;case"Custom Date2":l=d;break;case"Custom Filter1":l=F;break;case"Custom Filter2":l=y;break;case"Custom Number1":l=O;break;case"Custom Number2":l=L;break;case"Job Item":l="Customer Assets";break}return l};function z(i,a){let e=a==S.JobCard?"Job Card":a==S.Customer?"Customer":a==S.Query?"Query":a==S.Asset?"Asset":"",o="",s="",u="",g="",d="",F="",y="",O="",L="",l="",n=i.filter(f=>f.GroupName=="Custom Settings");if(n){let f,c,m,r,N,h,p,R,b,w;a===S.Asset?(f=n.find(t=>t.OptionName==`${e} Custom Field 1`),c=n.find(t=>t.OptionName==`${e} Custom Field 2`),m=n.find(t=>t.OptionName==`${e} Field 3`),r=n.find(t=>t.OptionName==`${e} Field 4`),N=n.find(t=>t.OptionName==`${e} Date 1`),h=n.find(t=>t.OptionName==`${e} Date 2`),p=n.find(t=>t.OptionName==`${e} Yes/No 1`),R=n.find(t=>t.OptionName==`${e} Yes/No 2`),b=n.find(t=>t.OptionName==`${e} Number 1`),w=n.find(t=>t.OptionName==`${e} Number 2`)):(f=n.find(t=>t.OptionName==`${e} Custom Field 1`),c=n.find(t=>t.OptionName==`${e} Custom Field 2`),a===S.JobCard?(m=n.find(t=>t.OptionName=="Job Field 3"),r=n.find(t=>t.OptionName=="Job Field 4")):(m=n.find(t=>t.OptionName==`${e} Custom Field 3`),r=n.find(t=>t.OptionName==`${e} Custom Field 4`)),a===S.Customer?(N=n.find(t=>t.OptionName==`${e} Date 1`),h=n.find(t=>t.OptionName==`${e} Date 2`),p=n.find(t=>t.OptionName==`${e} Yes/No 1`),R=n.find(t=>t.OptionName==`${e} Yes/No 2`),b=n.find(t=>t.OptionName==`${e} Number 1`),w=n.find(t=>t.OptionName==`${e} Number 2`)):(N=n.find(t=>t.OptionName==`${e} Custom Date 1`),h=n.find(t=>t.OptionName==`${e} Custom Date 2`),p=n.find(t=>t.OptionName==`${e} Custom Filter 1`),R=n.find(t=>t.OptionName==`${e} Custom Filter 2`),b=n.find(t=>t.OptionName==`${e} Custom Number 1`),w=n.find(t=>t.OptionName==`${e} Custom Number 2`))),o=f?f.OptionValue:"Custom Field 1",s=c?c.OptionValue:"Custom Field 2",u=m?m.OptionValue:"Custom Field 3",g=r?r.OptionValue:"Custom Field 4",d=N?N.OptionValue:"Custom Date 1",F=h?h.OptionValue:"Custom Date 2",y=p?p.OptionValue:"Custom Filter 1",O=R?R.OptionValue:"Custom Filter 2",L=b?b.OptionValue:"Custom Number 1",l=w?w.OptionValue:"Custom Number 2"}return{fieldLabel1:o,fieldLabel2:s,fieldLabel3:u,fieldLabel4:g,dateFieldLabel1:d,dateFieldLabel2:F,filterFieldLabel1:y,filterFieldLabel2:O,numberFieldLabel1:L,numberFieldLabel2:l}}const Pe={getOption:ue,getOptionValue:de,saveOption:me,getSettingInputs:ce,getSettingGroups:pe,getCustomFields:se,getCustomerCustomFields:fe,getProductCustomFields:be,getQueryCustomFields:ge,getJobCustomFields:Z,getJobOptionName:he};function Ce(){const i=x.useContext(U),[a,e]=x.useState(i.customerZone),[o,s]=x.useState(i.tenantZone);return x.useEffect(()=>{e(i.customerZone),s(i.tenantZone)},[i.customerZone,i.tenantZone]),[a,o]}const xe="_rightSection_uu0h9_2",Fe="_leftSection_uu0h9_18",Le="_rightSectionContainer_uu0h9_25",Ne="_scLogoContainer_uu0h9_50",E={rightSection:xe,leftSection:Fe,rightSectionContainer:Le,scLogoContainer:Ne},Oe=["","","","","","","",""],ye=({headerSection:i,footerSection:a,children:e,open:o,decor:s="none",modalProps:u,size:g,onClose:d,headerSectionBackButtonText:F,showClose:y,withCloseButton:O,...L})=>{const l=ie(),n=j("(max-width: 850px)"),f=j("(max-width: 400px)"),c=I(),m=I(),r=j(`(max-width: ${l.breakpoints.sm}px)`),[,N]=ee(te),[h]=x.useState(crypto.randomUUID());ae(()=>{N(o?t=>[...t.filter(v=>v!==h),h]:t=>t.filter(v=>v!==h))},[o]);const[p,R]=x.useState(!0),[b,w]=x.useState([]);return React.createElement(P,{size:g||"xl",withCloseButton:!1,closeOnEscape:!0,closeOnClickOutside:!0,centered:!0,fullScreen:f,opened:o,onClose:()=>{d&&d()},overlayProps:{color:l.colors.scBlue[5],blur:10,opacity:.55},transitionProps:{transition:"pop",exitDuration:50,duration:100,timingFunction:"ease"},radius:6,padding:0,...u},O&&React.createElement(M,{style:{zIndex:1},onClick:d,pos:"absolute",right:10,top:10,...L.closeButtonProps}),React.createElement(k,{direction:n?"column-reverse":"row",style:{position:"relative"}},React.createElement("div",{className:E.leftSection},F&&React.createElement(G,{style:t=>({borderBottom:"1px solid var(--mantine-color-gray-1)",padding:"var(--mantine-spacing-md)"})},React.createElement(q,{variant:"subtle",color:"gray.9",leftSection:React.createElement(X,{size:16}),onClick:d},F)),React.createElement("div",{ref:c.ref},i),React.createElement(ne,{p:L.p??"lg"},a&&React.createElement("div",{style:{height:n?"":`calc(580px - ${c.height+"px"} - ${m.height+"px"})`,maxHeight:"60vh"}},e)||e,React.createElement(G,{w:"100%",ref:m.ref,justify:"right",mt:"md",display:a?void 0:"none"},a))),s!=="none"&&React.createElement("div",{className:E.rightSection,style:n?{minHeight:"200px",maxWidth:"100%",paddingInline:0}:s==="ServCraft"?{height:`calc(90vh  - ${c.height+"px"} - ${m.height+"px"})`,maxHeight:622}:{}},y&&React.createElement(M,{c:"white",pos:"absolute",variant:"transparent",size:"lg",top:15,right:15,style:{zIndex:5e3},onClick:d}),!n&&React.createElement("div",{style:{position:"absolute",left:-75}},Oe.map((t,v)=>React.createElement("svg",{key:"vector"+v,style:{position:"absolute",left:v*15,opacity:.5-.05*v,rotate:"5deg"},width:"56",height:"622",viewBox:"0 0 56 622",fill:"none",xmlns:"http://www.w3.org/2000/svg"},React.createElement("path",{d:"M14.592 -6.15845C32.4488 18.44 26.4965 45.9327 22.8938 74.0682C21.1708 87.8948 20.3877 102.043 23.0505 116.512C31.0391 159.439 52.8119 168.764 55.1615 222.141C55.788 235.485 47.9561 253.171 39.1843 273.107C18.3514 320.214 5.35034 373.269 5.50698 409.283C5.50698 411.855 5.50694 414.267 5.66358 416.518C7.85652 454.46 25.4001 481.47 26.6532 515.554C26.9665 523.272 26.1833 531.31 24.3036 539.831C17.7248 568.932 8.95297 597.389 0.651123 626.65",stroke:"white"})))),s==="ServCraft"&&React.createElement(k,{direction:"column",className:E.rightSectionContainer},React.createElement("div",{className:E.scLogoContainer,style:{width:r?48:96,height:r?48:96}},React.createElement("img",{src:"/logo-white.svg",width:r&&20||40,height:r&&20||40,alt:""})),React.createElement("div",null,React.createElement(A,{size:r&&"large"||"xx-large",fw:"bolder",mt:"var(--mantine-spacing-sm)"},"ServCraft"),React.createElement(T,{size:r?"xs":"sm"},"Take control of your business."))),s==="Industries&JobCount"&&React.createElement(k,{direction:n?"row":"column",className:E.rightSectionContainer,gap:{base:"sm",xs:60}},React.createElement(_,{align:"center",gap:0},React.createElement("div",{className:E.scLogoContainer,style:{width:r?48:96,height:r?48:96}},React.createElement("img",{src:"/specno-icons/home.svg",width:r&&20||40,height:r&&20||40,alt:""})),React.createElement("div",null,React.createElement(A,{size:r&&"large"||"xx-large",fw:"bolder",mt:"var(--mantine-spacing-sm)"},"20+"),React.createElement(T,{size:r?"xs":"sm",mt:"var(--mantine-spacing-xs)"},"Different industries"))),React.createElement(_,{align:"center",gap:0},React.createElement("div",{className:E.scLogoContainer,style:{width:r?48:96,height:r?48:96}},React.createElement("img",{src:"/specno-icons/square_check.svg",width:r&&20||40,height:r&&20||40,alt:""})),React.createElement("div",null,React.createElement(A,{size:r&&"large"||"xx-large",fw:"bolder",mt:"var(--mantine-spacing-sm)"},"1 000 000+"),React.createElement(T,{size:r?"xs":"sm",mt:"var(--mantine-spacing-xs)"},"Jobs completed")))))))};function He({options:i,setOptions:a}){let{heading:e,text:o,onConfirm:s,onCancel:u,confirmButtonText:g,cancelButtonText:d,onDiscard:F,discardButtonText:y,isPrompt:O,promptDefault:L}=i;g=g||"OK",d=d||"Cancel";const[l,n]=x.useState(i.promptDefault),[f,c]=x.useState({promptText:null}),[m]=Y(),[r,N]=Ce();x.useEffect(()=>{n(i.promptDefault)},[i]);const h=()=>{a({...i,display:!1})},p=()=>{if(O&&J.isNullOrWhitespace(l)){c({...f,promptText:"Required"});return}h(),s&&s(l)},R=()=>{h(),u&&u()},b=()=>{h(),F&&F()},w=t=>{c({...f,promptText:null}),n(t.value)};return i.display?C.jsxs(ye,{open:i.display,size:600,children:[C.jsxs("div",{children:[i.customContent?i.customContent:C.jsxs(C.Fragment,{children:[e?C.jsx(T,{size:"xxl",fw:600,c:"scBlue.9",mb:25,children:e}):"",C.jsx("div",{className:"text",dangerouslySetInnerHTML:{__html:o}}),O?C.jsx(C.Fragment,{children:C.jsx(K,{required:!0,value:l,error:f.promptText,onChange:w})}):""]}),C.jsxs(k,{w:"100%",mt:35,justify:"end",gap:"sm",wrap:"wrap",children:[i.showCancel&&C.jsx(q,{variant:"outline",color:"gray.7",onClick:R,children:d}),i.showDiscard&&C.jsx(q,{variant:"outline",onClick:b,children:y}),C.jsx(q,{onClick:p,children:g})]})]}),C.jsx("style",{jsx:!0,children:`
      /*.overlay {
        align-items: center;
        ${r||N?"background-color: rgba(0, 0, 0, 0.5);":"background-color: rgba(19, 106, 205, 0.9);"}
        bottom: 0;
        display: flex;
        justify-content: center;
        left: 0;
        position: fixed;
        right: 0;
        top: 0;
        z-index: 9999;
      }
      .container {
        background-color: ${$.white};
        border-radius: ${D.cardRadius};
        padding: 0.5rem;
        ${m?"width: 90%;":"width: 32rem;"}
      }*/
      .row {
        display: flex;
      }
      .space-between {
        justify-content: space-between;
      }
      .align-end {
        align-items: flex-end;
      }
      .title {
        color: ${$.bluePrimary};
        font-size: 1.125rem;
        font-weight: bold;
        margin-bottom: 1rem;
      }
      .text {
        line-height: 1.25rem;
        white-space: initial;
      }
      .label {
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }
      .status {
        align-items: center;
        background-color: rgba(28,37,44,0.2);
        border-radius: ${D.buttonRadius};
        box-sizing: border-box;
        color: ${$.darkPrimary};
        display: flex;
        font-size: 0.75rem;
        font-weight: bold;
        height: 2rem;
        justify-content: center;
        padding: 0 1rem;
        text-align: center;
      }
      .cancel {
        width: 6rem;
        margin-right: 6rem;
      }
      .update {
        width: 100%;
      }
      .option-container {
        max-height: 26rem;
        overflow-y: scroll;
      }
      .option {
        align-items: center;
        cursor: pointer;
        display: flex;
        height: 2rem;
      }
      .box {
        border: 1px solid ${$.labelGrey};
        border-radius: ${D.inputRadius};
        box-sizing: border-box;
        cursor: pointer;
        height: 1rem;
        margin-right: 1rem;
        opacity: 0.4;
        width: 1rem;
      }
      .selected .box {
        background-color: ${$.bluePrimary};
        background-image: ${W};
        background-position: center;
        background-repeat: no-repeat;
        background-size: 70%;
        border: none;
        opacity: 1;
      }
      `})]}):C.jsx(C.Fragment,{})}export{He as C,Pe as O,ye as S,re as a,Ze as g,I as u};
