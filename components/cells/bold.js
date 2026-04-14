import { colors, layout, tickSvg} from '../../theme'

function CellBold({value, color = "", fontSize = undefined}) {
  let cellFontSize = "12px"
  if (fontSize != undefined) {
    cellFontSize = fontSize;
  }

  return (
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
  )
}

export default CellBold
