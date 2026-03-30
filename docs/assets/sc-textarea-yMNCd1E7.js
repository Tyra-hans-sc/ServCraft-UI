import{R as e}from"./index-BVW8D_1y.js";import{c as M}from"./index-DCH-1kQU.js";import{N as p}from"./no-ssr-D3RVQ5dx.js";import{TextArea as $}from"@progress/kendo-react-inputs";import{S as d}from"./sc-hint-SLX4MDDC.js";import{S as j}from"./ScTextAreaControl-hs4hIUbH.js";function O(f){const{name:r,value:l,label:n,rows:s=4,maxRows:x=10,autoSize:g=!0,hint:m,required:i=!1,readOnly:h=!1,error:a,onChange:o,tabIndex:u,extraClasses:v,backgroundColor:c,cypress:C,placeholder:b,customProps:E,onBlur:S,onFocus:w,autoFocus:y=!1,maxLength:A=4e3,disabled:N=!1,mt:R="sm",maw:k,width:T,...z}=f,F={name:r,value:l,label:n,rows:s,description:m,withAsterisk:i,readOnly:h,error:a,tabIndex:u,placeholder:b,onFocus:w,onBlur:S,autoFocus:y,maxLength:A,disabled:N,mt:R,maw:k,w:T},I=t=>{o&&o({...t,target:t.nativeElement,name:r,value:t.currentTarget.value})},P=t=>{o&&o({target:t.target.element,name:r,value:t.value})};return e.createElement(p,null,e.createElement(j,{...F,onChange:I,style:{backgroundColor:c},minRows:s,maxRows:x,autosize:g,...E,...z}))||e.createElement("div",{className:`textarea-container ${v}`},e.createElement("label",{className:"custom-label",htmlFor:r+"-autocomplete-off"},i?n+" *":n),e.createElement(p,null,e.createElement($,{name:r+"-autocomplete-off",value:l??void 0,onChange:P,rows:s,tabIndex:u,validationMessage:a,valid:!a,className:C,style:{backgroundColor:c||"white"}})),m&&!a?e.createElement(d,{value:m,extraClasses:""}):"",a?e.createElement(d,{value:a,extraClasses:"error"}):"",e.createElement("style",{jsx:!0},`
                .textarea-container {
                    margin-top: 0.5rem;
                }
                .custom-label {
                    color: ${M.labelGrey};
                    opacity: 0.75;
                    display: block;
                    font-size: 0.75rem;
                }
            `))}export{O as S};
