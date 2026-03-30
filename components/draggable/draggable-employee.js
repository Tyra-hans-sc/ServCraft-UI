import { shadows, layout, colors, tickSvg } from '../../theme';

export default function DraggableEmployee({ employee, isSelected, setSelected, isUnassigned }) {
  return (<div onClick={() => setSelected(employee)} className="card">
    {employee.FullName}

    <div className={`color-block-local ${employee.DisplayColor ? employee.DisplayColor.includes('#') ? "color-block-custom" : employee.DisplayColor + "-local" : "default" + (isUnassigned ? " unassigned" : "")}`}></div>

    <style jsx>{`
        
        .card {
          font-size: 0.85rem;
          cursor: pointer;
          width: 240px;
          background: white;
          padding: 1rem;
          box-shadow: ${shadows.card};
          margin: 0 0 0.5rem 0;
          border-radius: 3px;
          position: relative;
          ${isUnassigned ? `text-transform: uppercase;
          font-style: italic;` : ""}
      }
        
      .color-block-local {
        position: absolute;
        right: 22px;
        top: 11px;
        border-radius: ${layout.inputRadius};
        background-image: ${tickSvg};  
        background-position: center;
        background-repeat: no-repeat;
        background-size: auto;
        cursor: pointer;
        height: 24px;
        width: 24px;
        z-index: 1;
      }


      .color-block-local.default {
        ${isSelected ? `background-color: ${colors.bluePrimary} !important;` : ""}
        border: 1px solid ${colors.bluePrimary};
      }

      .color-block-local.default.unassigned {
        ${isSelected ? `background-color: #000000 !important;` : ""}
        border: 1px solid #000000;
      }

        .Red-local {
          ${isSelected ? `background-color: #FC2E50 !important;` : "background-color: white !important;"}
          border: 1px solid #FC2E50;
        }
          .Orange-local {
            ${isSelected ? `background-color: #F26101 !important;` : "background-color: white !important;"}
          border: 1px solid #F26101;
          }
          .Yellow-local {
            ${isSelected ? `background-color: #FFC940 !important;` : "background-color: white !important;"}
          border: 1px solid #FFC940;
          }
          .Green-local {
            ${isSelected ? `background-color: #51CB68 !important;` : "background-color: white !important;"}
          border: 1px solid #51CB68;
          }
          .Blue-local {
            ${isSelected ? `background-color: #5A85E1 !important;` : "background-color: white !important;"}
          border: 1px solid #5A85E1;
          }
          .Purple-local {
            ${isSelected ? `background-color: #735AE1 !important;` : "background-color: white !important;"}
          border: 1px solid #735AE1;
          }
          .Black-local {
            ${isSelected ? `background-color: #4F4F4F !important;` : "background-color: white !important;"}
          border: 1px solid #4F4F4F;
          }
          .Grey-local {
            ${isSelected ? `background-color: #828282 !important;` : "background-color: white !important;"}
          border: 1px solid #828282;
          }
          .LightGrey-local {
            ${isSelected ? `background-color: #BDBDBD !important;` : "background-color: white !important;"}
          border: 1px solid #BDBDBD;
          }
          .Cyan-local {
            ${isSelected ? `background-color: #13CACD !important;` : "background-color: white !important;"}
          border: 1px solid #13CACD;
          }

          .color-block-custom {
            background-color: ${isSelected ? employee.DisplayColor : 'white'};
            border: 1px solid ${employee.DisplayColor};
          }

        `}</style>
  </div>);
}