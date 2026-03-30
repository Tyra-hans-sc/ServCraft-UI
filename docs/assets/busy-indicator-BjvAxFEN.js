import{j as r}from"./jsx-runtime-CniKdCFI.js";import{c as e,s as a}from"./index-DCH-1kQU.js";const l=({text:o=null})=>r.jsxs(r.Fragment,{children:[o?r.jsx("div",{className:"overlay",children:r.jsxs("div",{className:"bubble",children:[o,r.jsx("div",{className:"loader",children:"tete"})]})}):"",r.jsx("style",{jsx:!0,children:`

                .overlay {
                    z-index: 100000; 
                    background: #ffffffaa;
                    position: fixed;
                    inset: 0;
                }

                .bubble {
                    position: relative;
                    width: fit-content;
                    background: ${e.bluePrimary};
                    color: ${e.white};
                    padding: 12px 16px;
                    border-radius: 24px;
                    box-shadow: ${a.cardSmallDark};
                }

                .bubble :global(.loader) {
                    border-color: rgba(28, 37, 44, 0.2);
                    border-left-color: ${e.white};
                    border-width: 0.25rem;
                    display: flex;
                    height: 1.5rem;
                    width: 1.5rem;
                    margin-top: 8px;
                  }
                `})]});export{l as B};
