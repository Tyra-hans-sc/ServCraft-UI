import { colors } from '../../../theme'

export default function KendoCellBold(props) {

    const field = props.field || "";
    const value = props.dataItem[field];
    const color = props.color;
    const fontSize = props.fontSize;

    let cellFontSize = "12px"
    if (fontSize != undefined) {
        cellFontSize = fontSize;
    }

    return (
        <td>
            <div className={"contents " + color}>
                <strong className="font">{value}</strong>
                <style jsx>{`
        .blue {
          color: ${colors.bluePrimary}
        }
        .font {
          font-size: ${cellFontSize};
        }
        .contents {
          display: contents;
        }
      `}</style>
            </div>
        </td>
    )
};