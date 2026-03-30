import{r as a,R as t}from"./index-BVW8D_1y.js";import{H as y,R as L}from"./time-Drbfh5Um.js";import{l as j,s as D,c as l}from"./index-DCH-1kQU.js";import{M as c}from"./enums-DkpuAbLR.js";import{B as m}from"./button-D2YAKzq0.js";import{S as I}from"./sc-modal-yq10hrkv.js";function P({messageBarType:o,message:x,isActive:f=!1,maintenanceSchedule:e,dismissMaintenanceSchedule:w}){const[p,b]=a.useState(null),[E,h]=a.useState(!1),[C,k]=a.useState(""),[R,W]=a.useState(""),[v,r]=a.useState(!1),O=n=>{if(n){let g=n.indexOf("[");if(g>=0){let N=n.indexOf("]");if(N>=0){let i=n.substring(g+1,N),d=i.indexOf(":");if(d>=0){let u=i.substring(0,d),$=i.substring(d+1,i.length);u&&$&&(u.toLowerCase()=="subscription"?W("/settings/subscription/manage"):u.toLowerCase()=="document"&&W("/settings/document/manage"),k($),h(!0))}b(n.substring(0,g))}}else b(n)}};a.useEffect(()=>{O(x)},[x]);const M=()=>{y.nextRouter(L.push,R)},B=()=>typeof window<"u"&&window.location.pathname==="/login",s=()=>typeof window<"u"&&window.location.pathname.indexOf("/webform")===0;return typeof window>"u"?t.createElement(t.Fragment,null):t.createElement(t.Fragment,null,!s()&&e&&e.showMaintenanceWarning&&e.maintenanceWarning?t.createElement("div",{className:"message-bar-container"},t.createElement("div",{className:"content"},t.createElement("div",{className:"text-content"},f?t.createElement("span",{className:"one-of-two",onClick:()=>r(!0)},"1 / 2"):"",t.createElement("span",null,e.maintenanceWarning),t.createElement("div",{className:"button-content"},t.createElement(m,{text:"Dismiss",extraClasses:"warning-action no-margin fit-content",onClick:w}))))):!s()&&f?t.createElement("div",{className:"message-bar-container"},t.createElement("div",{className:"content"},t.createElement("div",{className:"text-content"},t.createElement("span",null,p),E?t.createElement("div",{className:"button-content"},t.createElement(m,{text:C,extraClasses:`${o==c.Warning?"warning-action":"error-action"} no-margin fit-content`,onClick:()=>M()})):""))):"",v?t.createElement(I,{title:"Your Messages",onDismiss:()=>r(!1)},t.createElement("table",null,t.createElement("tbody",null,!s()&&e&&e.showMaintenanceWarning&&e.maintenanceWarning?t.createElement("tr",null,t.createElement("td",{className:"w-100-percent"},e.maintenanceWarning),t.createElement("td",null,t.createElement(m,{text:"Dismiss",extraClasses:"warning-action no-margin fit-content",onClick:()=>{r(!1),w()}}))):"",!s()&&f?t.createElement("tr",null,t.createElement("td",{className:"w-100-percent"},p),E?t.createElement("td",null,t.createElement(m,{text:C,extraClasses:`${o==c.Warning?"warning-action":"error-action"} no-margin fit-content`,onClick:()=>{r(!1),M()}})):""):""))):"",t.createElement("style",{jsx:!0},`

                .one-of-two {
                    position: absolute;
                    left: 1rem;
                    cursor: pointer;
                    background: #ffffff88;
                    border-radius: ${j.buttonRadius};
                    padding: 0.25rem;
                    box-shadow: ${D.cardSmall};
                    font-weight: bold;
                }

                .w-100-percent {
                    width: 100%;
                    padding: 0.5rem 0.5rem 0.5rem 0;
                }

                .message-bar-container {
                    position: fixed;
                    height: 48px;
                    width: 100%;
                    background-color: ${o==c.Warning||e&&e.showMaintenanceWarning&&e.maintenanceWarning?`${l.alertOrangeLightOpaque}`:`${y.hexToRgba(l.warningRedLight,.4)}`};
                    z-index: ${B()?1e5:103};
                    top: 0;
                    left: 0;
                    display: flex;
                    flex-direction: row;
                }
                .content {
                    display: flex;
                    position: relative;
                    flex-direction: column;
                    justify-content: center;
                    vertical-align: middle;
                    text-align: center;
                    width: 100%;
                    color: ${o==c.Warning||e&&e.showMaintenanceWarning&&e.maintenanceWarning?`${l.alertOrange}`:`${l.warningRed}`};
                }
                .text-content {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .button-content {
                    display: flex;
                    margin-left: 1rem;
                }
                a {
                    text-decoration: underline;
                }

                
            `))}export{P as S};
