import { colors, layout } from "../../../theme";

export default function SCListCardSection({ text, colour = "" }) {


    return (<>
        <div className={`section-heading ${colour}`}>
            <div>{text}</div>
        </div>

        <style jsx>{`
            .section-heading {
                font-weight: bold;
                margin-top: 1rem;
                width: calc(100% - 1rem);
                // background: ${colors.greyStatus};
                color: ${colors.darkPrimary};
                border-radius: ${layout.bodyRadius};
                padding-left: 0.5rem;
                text-transform: uppercase;
              }




              .Red {
                background-color: transparent !important;
                color: #FC2E50 !important;
              }
              .Orange {
                background-color: transparent !important;
                color: #F26101 !important;
              }
              .Yellow {
                background-color: transparent !important;
                color: #FFC940 !important;
              }
              .Green {
                background-color: transparent !important;
                color: #51CB68 !important;
              }
              .Blue {
                background-color: transparent !important;
                color: #5A85E1 !important;
              }
              .Purple {
                background-color: transparent !important;
                color: #735AE1 !important;
              }
              .Black {
                background-color: transparent !important;
                color: #4F4F4F !important;
              }
              .Grey {
                background-color: transparent !important;
                color: #828282 !important;
              }
              .LightGrey {
                background-color: transparent !important;
                color: #BDBDBD !important;
              }
              .Cyan {
                background-color: transparent !important;
                color: #13CACD !important;
              }
    `}</style>
    </>);
}