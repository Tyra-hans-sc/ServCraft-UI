import{r as a,R as t}from"./index-BVW8D_1y.js";import"./no-ssr-D3RVQ5dx.js";import{c as G,l as L}from"./index-DCH-1kQU.js";import"./jsx-runtime-CniKdCFI.js";import{S as N}from"./sc-combobox-OYCSVqUZ.js";function U(d){const{name:c,value:e,dataItemKey:p,textField:u,options:m,label:f,hint:h,error:C,onChange:n,itemRender:R=null,valueRender:y=null,required:o=!1,disabled:b=!1,extraClasses:g,itemRenderMantine:x,canClear:v,canSearch:S=!1,iconMantine:w,placeholder:E,addOption:$,groupField:V,hideSelected:F=!1,onBlur:I,autoFocus:M=!1,style:z,triggerRefresh:P,resetValue:B,suppressInternalValueChange:r=!1,readOnly:K=!1,mt:O,dataItemKeyAsValue:j=!1,size:k,mantineComboboxProps:q}=d,[l,s]=a.useState(e);a.useEffect(()=>{s(e)},[e]);const A=a.useRef(null),D=i=>{n&&n(i),!r&&s(i)};return t.createElement("div",{ref:A,className:`${l?"dropdown-container":"dropdown-container-placeholder"} ${g}`},t.createElement(N,{required:o,name:c,options:m,dataItemKey:p,textField:u,value:l,onChange:D,label:f,error:C,disabled:b,canSearch:S,canClear:v??!o,hint:h,itemRenderMantine:x,itemRender:R??void 0,valueRender:y??void 0,iconMantine:w,placeholder:E,addOption:$,groupField:V,hideSelected:F,onBlur:I,autoFocus:M,style:z,resetValue:B,suppressInternalValueChange:r,mt:O,readOnly:K,dataItemKeyAsValue:j,size:k,mantineComboboxProps:q}),t.createElement("style",{jsx:!0},`
                
                .dropdown-container-placeholder {
                    margin-top: 22px;
                }
                .custom-label {
                    color: ${G.labelGrey};
                    opacity: 0.75;
                    display: block;
                    font-size: 0.75rem;
                }
                .input-width {
                    width: ${L.inputWidth};
                }
            `))}export{U as S};
