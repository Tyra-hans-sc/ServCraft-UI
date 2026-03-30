import{j as o}from"./jsx-runtime-CniKdCFI.js";import"./index-BVW8D_1y.js";import{c as r,l as i,t as a}from"./index-DCH-1kQU.js";function l(e){const t=()=>e.icon?o.jsxs(o.Fragment,{children:[o.jsx("img",{className:"icon",src:"/icons/"+e.icon+".svg",height:"24"}),o.jsx("div",{className:"icon-spacer"})]}):"";return o.jsxs("div",{"data-cy":e.cypress,title:`${e.tooltip?e.tooltip:""}`,className:"button "+e.extraClasses+(e.disabled===!0?" disabled":""),onClick:n=>{e.disabled!==!0&&e.onClick&&e.onClick(n)},children:[o.jsx("div",{className:"loader"}),t(),o.jsx("p",{className:"text",children:e.text}),o.jsx("style",{jsx:!0,children:`
                .button {
                    align-items: center;
                    background-color: ${r.bluePrimary};
                    border-radius: ${i.buttonRadius};
                    box-sizing: border-box;
                    color: ${r.white};
                    cursor: pointer;
                    display: flex;
                    height: 2.5rem;
                    font-weight: bold;
                    justify-content: center;
                    margin-top: 1.5rem;
                    padding: 0 1rem;
                    position: relative;
                    width: 100%;
                }

                .w7 {
                    width: 7rem;
                }

                .button.disabled {
                    background-color: ${r.blueGreyLight};
                    cursor: default;
                }

                .w9 {
                    width: 9rem;
                }

                .w10 {
                    width: 10rem;
                }

                .w11 {
                    width: 11rem;
                }

                .w12 {
                    width: 12rem;
                }

                .w13 {
                    width: 13rem;
                }

                .auto {
                    width: auto;
                }

                .text {
                    margin: 0;
                    text-decoration: none;
                    white-space: nowrap;
                }

                .button :global(.icon) {
                    left: 0.75rem;
                    position: absolute;
                    top: calc(50% - 0.75rem);
                }

                .button :global(.icon-spacer) {
                    height: 1.5rem;
                    width: 2rem;
                }

                .is-loading .text {
                    display: none;
                }

                .is-loading :global(.icon) {
                    display: none;
                }

                .is-loading .loader {
                    display: block;
                }

                .hollow {
                    background: none;
                    border: 1px solid ${r.bluePrimary};
                    color: ${r.bluePrimary};
                }

                .hollow-warning {
                    background: none;
                    border: 1px solid ${r.warningRed};
                    color: ${r.warningRed};
                }

                .error {
                    border: 1px solid ${r.mantineErrorOrange()} !important;
                }

                .green {
                    background: ${r.green};
                }

                .orange {
                    background: ${r.orangeWidget};
                }

                .red-light {
                    background: ${r.warningRedLight};
                }

                .blue-borderless {
                    color: ${r.bluePrimary};
                    border: none;
                    background: none;
                }

                .grey-action-link {
                    color: ${r.labelGrey};
                    border: none;
                    background: none;
                    text-decoration: underline;
                    font-weight: normal;
                    font-size: 0.8rem;
                }

                .white-action {
                    background-color: ${r.white};
                    border: 1px solid ${r.blueGreyLight};
                    color: ${r.darkPrimary};
                    font-weight: normal;
                }

                .white-action :global(.icon) {
                    margin: 0 0.5rem 0 -0.5rem;
                }

                .green-action {
                    background-color: ${r.white};
                    border: 1px solid ${r.green};
                    color: ${r.green};
                    font-weight: normal;
                }

                .green-action :global(.icon) {
                    margin: 0 0.5rem 0 -0.5rem;
                }

                .warning-action {
                    background-color: ${r.alertOrange};
                    border: 1px solid ${r.alertOrange};
                    color: ${r.white};
                    font-weight: normal;
                }

                .error-action {
                    background-color: ${r.warningRed};
                    border: 1px solid ${r.warningRed};
                    color: ${r.white};
                    font-weight: normal;
                }

                .grey-action {
                    background-color: ${r.blueGreyLight};
                    border: 1px solid ${r.blueGreyLight};
                    color: ${r.white};
                    font-weight: normal;
                }

                .grey-action :global(.icon) {
                    margin: 0 0.5rem 0 -0.5rem;
                }

                .dark-blue-action {
                    background-color: ${r.bluePrimaryDark};
                    border: 1px solid ${r.white};
                    color: ${r.white};
                    font-weight: normal;
                }

                .white {
                    background-color: ${r.white};
                    color: ${r.blueDark};
                }

                .white-overlay {
                    background-color: ${r.white};
                    border-radius: ${i.bodyRadius};
                    color: ${r.darkPrimary};
                    font-size: 0.75rem;
                    font-weight: normal;
                    height: 2rem;
                    margin: 0 1rem 0 0;
                    width: auto;
                }

                .grey-overlay {
                    border: 1px solid ${r.blueGreyLight};
                    color: ${r.darkPrimary};
                    background-color: ${r.white};
                    border-radius: ${i.bodyRadius};
                    font-size: 0.75rem;
                    font-weight: normal;
                    height: 2rem;
                    margin: 0 1rem 0 0;
                    width: auto;
                }

                .fit-content {
                    width: auto;
                    width: fit-content;
                }

                .no-margin {
                    margin-top: 0px;
                }

                .small-margin {
                    margin-top: 0.5rem;
                }

                .left-margin {
                    margin-left: 0.5rem;
                }

                .right-margin {
                    margin-right: 0.5rem;
                }

                .select-all {
                    padding-left: 2rem;
                    position: relative;
                }

                .select-all:before {
                    border: 1px solid ${r.labelGrey};
                    border-radius: ${i.inputRadius};
                    box-sizing: border-box;
                    content: "";
                    cursor: pointer;
                    height: 1rem;
                    left: 0.5rem;
                    opacity: 0.4;
                    position: absolute;
                    width: 1rem;
                }

                .selected-all {
                    padding-left: 2rem;
                    position: relative;
                }

                .selected-all:before {
                    background-color: ${r.bluePrimary};
                    background-image: ${a};
                    background-position: center;
                    background-repeat: no-repeat;
          background-size: 70%;
          border-radius: ${i.inputRadius};
          content: "";
          height: 1rem;
          left: 0.5rem;
          position: absolute;
          width: 1rem;
        }

        .negative-left-margin {
          margin-left: -68px;
        }

        .float-right {
          float: right;
        }

        .margin-auto {
          margin: auto;
        }

      `})]})}l.defaultProps={text:"Button",extraClasses:""};export{l as B};
