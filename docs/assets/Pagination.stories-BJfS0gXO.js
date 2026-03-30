import{r as m,R as i}from"./index-BVW8D_1y.js";import{j as a}from"./jsx-runtime-CniKdCFI.js";import{c as s,l as x}from"./index-DCH-1kQU.js";import{S as L,F as I}from"./time-Drbfh5Um.js";import{C as T}from"./enums-DkpuAbLR.js";import{T as F}from"./toast-context-WqMV2LJb.js";import"./_commonjsHelpers-BosuxZz1.js";import"./MantineThemeProvider-3Ly_klpC.js";import"./iframe-Beq_Rkx3.js";function $(e){const h=m.useContext(F),n=parseInt(e.currentPage),r=Math.ceil(e.totalResults/e.pageSize),[c,E]=m.useState(!1),l=async t=>{L.setCookie(T.pageSize,t),e.setPageSize(t),!(window.location.href.toLowerCase().indexOf("customerzone")>-1)&&await I.put({url:`/Employee/pagesize?pageSize=${t}`,toastCtx:h})};function D(){let t=[e.currentPage];return e.currentPage!=1&&(e.currentPage==2||(t.unshift(e.currentPage-1),t.unshift("...")),t.unshift(1)),e.currentPage!=r&&(e.currentPage==r-1||(t.push(e.currentPage+1),t.push("...")),t.push(r)),t}function o(t){t!="..."&&t>0&&t<r+1&&e.setCurrentPage(t)}return a.jsxs("div",{className:`pagination ${e.totalResults==0?"hidden":""}`,children:[a.jsxs("div",{className:"row",children:[a.jsx("img",{className:"skip",src:"/icons/double-chevron-back.svg",alt:"first",onClick:()=>o(1)}),a.jsx("div",{className:"button",onClick:()=>o(n-1),children:"Back"}),D().map(function(t,M){return a.jsx("div",{className:"page"+(t==n?" page-current":""),onClick:()=>o(t),children:t},M)}),a.jsx("div",{className:"button",onClick:()=>o(n+1),children:"Next"}),a.jsx("img",{className:"skip",src:"/icons/double-chevron-next.svg",alt:"last",onClick:()=>o(r)})]}),a.jsxs("div",{className:"row results",children:["Displaying",a.jsxs("div",{className:"page-size",onClick:()=>E(!c),children:[e.pageSize,a.jsx("img",{src:"/icons/arrow-drop-down-grey.svg",alt:"arrow",className:"icon"}),c?a.jsxs("div",{children:[a.jsx("p",{onClick:()=>l(100),children:"100"}),a.jsx("p",{onClick:()=>l(50),children:"50"}),a.jsx("p",{onClick:()=>l(20),children:"20"}),a.jsx("p",{onClick:()=>l(10),children:"10"})]}):""]}),"of ",e.totalResults," results."]}),a.jsx("style",{jsx:!0,children:`
        .pagination {
          align-items: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin-top: 1rem;
        }
        .row {
          align-items: center;
          display: flex;
          justify-content: center;
        }
        .results {
          color: ${s.blueGrey};
          font-size: 12px;
          margin-top: 1rem;
        }
        .page-size {
          align-items: center;
          cursor: pointer;
          display: flex;
          justify-content: center;
          margin-left: 6px;
          position: relative;
        }
        .page-size img {
          margin-left: -4px;
        }
        .page-size div {
          align-items: center;
          background-color: ${s.white};
          border-radius: ${x.cardRadius};
          bottom: 1.5rem;
          box-shadow: 0px 0px 32px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.16), inset 0px 0px 8px rgba(86, 204, 242, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: center;
          left: -1rem;
          margin-left: 6px;
          padding: 0.25rem 0;
          position: absolute;
        }
        .page-size p {
          margin: 0;
          padding: 0.375rem 0.75rem;
        }
        .page {
          align-items: center;
          border-radius: ${x.buttonRadius};
          color: ${e.invert?s.white:s.bluePrimary};
          cursor: pointer;
          display: flex;
          font-weight: bold;
          height: 2rem;
          justify-content: center;
          width: 2rem;
        }
        .page-current {
          background-color: ${s.bluePrimary};
          color: ${s.white};
        }
        .button {
          align-items: center;
          color: ${e.invert?s.white:s.bluePrimary};
          cursor: pointer;
          display: flex;
          justify-content: center;
          margin: 0 1rem;
        }
        .skip {
          cursor: pointer;
          margin: 4px 0 0;
        }
        .hidden {
          display: none;
        }
      `})]})}const K={title:"Navigation/Pagination",component:$,tags:["autodocs"],argTypes:{currentPage:{control:"number",description:"Current page (1-based)"},totalResults:{control:"number",description:"Total items across all pages"},pageSize:{control:"select",options:[10,25,50,100],description:"Items per page"},invert:{control:"boolean",description:"Invert colour scheme (for dark backgrounds)"},setCurrentPage:{action:"page-changed"},setPageSize:{action:"page-size-changed"}},parameters:{docs:{description:{component:"Pagination provides page navigation and page-size controls for tables and\nlist views throughout ServCraft.\n\n**Props:**\n- `currentPage` — the current page number (1-based)\n- `totalResults` — total number of items across all pages\n- `pageSize` — number of items per page\n- `setCurrentPage` — called with the new page number\n- `setPageSize` — called with the new page size\n- `invert` — inverts the colour scheme for dark backgrounds\n\n**Variants:** Default · Many pages · Few results · Inverted"}}}},f=e=>{const[h,n]=m.useState(e.currentPage??1),[r,c]=m.useState(e.pageSize??25);return i.createElement($,{...e,currentPage:h,pageSize:r,setCurrentPage:n,setPageSize:c})},g={render:e=>i.createElement(f,{...e,totalResults:247,currentPage:1,pageSize:25})},u={name:"Middle page",render:e=>i.createElement(f,{...e,totalResults:247,currentPage:5,pageSize:25})},d={name:"Last page",render:e=>i.createElement(f,{...e,totalResults:247,currentPage:10,pageSize:25})},p={name:"Small dataset (one page)",render:e=>i.createElement(f,{...e,totalResults:8,currentPage:1,pageSize:25})};var P,S,b;g.parameters={...g.parameters,docs:{...(P=g.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: args => <Controlled {...args} totalResults={247} currentPage={1} pageSize={25} />
}`,...(b=(S=g.parameters)==null?void 0:S.docs)==null?void 0:b.source}}};var z,C,v;u.parameters={...u.parameters,docs:{...(z=u.parameters)==null?void 0:z.docs,source:{originalSource:`{
  name: 'Middle page',
  render: args => <Controlled {...args} totalResults={247} currentPage={5} pageSize={25} />
}`,...(v=(C=u.parameters)==null?void 0:C.docs)==null?void 0:v.source}}};var j,y,k;d.parameters={...d.parameters,docs:{...(j=d.parameters)==null?void 0:j.docs,source:{originalSource:`{
  name: 'Last page',
  render: args => <Controlled {...args} totalResults={247} currentPage={10} pageSize={25} />
}`,...(k=(y=d.parameters)==null?void 0:y.docs)==null?void 0:k.source}}};var w,R,N;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'Small dataset (one page)',
  render: args => <Controlled {...args} totalResults={8} currentPage={1} pageSize={25} />
}`,...(N=(R=p.parameters)==null?void 0:R.docs)==null?void 0:N.source}}};const Q=["Default","MiddlePage","LastPage","SmallDataset"];export{g as Default,d as LastPage,u as MiddlePage,p as SmallDataset,Q as __namedExportsOrder,K as default};
