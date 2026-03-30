import{j as o}from"./jsx-runtime-CniKdCFI.js";import{S as n}from"./sc-icon-CSalX3cM.js";function c({title:t="",children:e,onDismiss:i,minWidth:a="38rem",maxWidth:r=void 0}){return o.jsxs("div",{className:"sc-overlay",onClick:s=>s.stopPropagation(),children:[o.jsxs("div",{className:"sc-modal-container",children:[t?o.jsx("div",{className:"sc-modal-title",children:t}):"",i?o.jsx("div",{className:"dismiss-button",children:o.jsx(n,{name:"x",onClick:i})}):"",o.jsx("div",{style:{width:"100%",whiteSpace:"break-spaces"},children:e})]}),o.jsx("style",{jsx:!0,children:`

            .dismiss-button {
                position: absolute;
                right: 0.5rem;
                top: 0.5rem;
            }

            .sc-overlay {
                align-items: center;
                //padding-top: 10vh;
                background-color: rgba(19, 106, 205, 0.9);
                bottom: 0;
                display: flex;
                justify-content: center;
                left: 0;
                position: fixed;
                right: 0;
                top: 0;
                z-index: 110;
              }

              .sc-modal-container {
                position: relative;
                background-color: var(--white-color);
                border-radius: var(--layout-card-radius);
                padding-top: 1rem;
                padding-left: 1rem;
                padding-right: 1rem;
                padding-bottom: 1rem;
                width: max-content;
                min-width: ${a};
                max-width: ${r||"90%"};
                max-height: 80%;
                overflow-x: auto;
              }
              
              .sc-modal-title {
                color: var(--blue-primary-color);
                font-size: 1.125rem;
                font-weight: bold;
                margin-bottom: 1rem;
                margin-right: 1.5rem;
              }
              

        `})]})}export{c as S};
