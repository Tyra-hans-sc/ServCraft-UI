import{G as s}from"./Group-B1Wj5x_m.js";function p(n){const{items:t=[],onChange:a,disabled:i=!1}=n,c=l=>{let e=[...t],r=e.findIndex(o=>o.label==l.label);r>-1&&(e[r].selected=!e[r].selected,a&&a(e))};return React.createElement(React.Fragment,null,React.createElement(s,{gap:"xs"},t.map((l,e)=>React.createElement("div",{className:`pill ${l.selected?"selected":""}`,key:e,onClick:()=>c(l)},l.label))),React.createElement("style",{jsx:!0},`
            
            /*.pill-container {
                display: flex;
            }*/

            .pill {
                padding: 12px 16px;
                color: #5D5F60;
                border: 1px solid #F0F0F0;
                border-radius: 6px;
                background: #FFFFFF;
                cursor: pointer;
                -webkit-user-select: none; /* Safari */
                user-select: none; /* Standard syntax */
            }

            .pill:hover {
                background: #FAFAFA;
            }

            /*.pill + .pill {
                margin-left: 1rem;
            }*/

            .pill.selected {
                border: 1px solid #003ED0;
                color: #003ED0;
                background: rgb(230, 236, 250);
            }

        `))}export{p as S};
