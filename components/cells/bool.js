import { colors, layout, tickSvg, crossSvg} from '../../theme'

function CellBool({value}) {
  return (
    <div className="container">
      { value
        ? <div className="true"></div>
        : <div className="false"></div>
      }
      <style jsx>{`
        .container {
          max-width: 50px;
        }
        .true {
          background-color: ${colors.bluePrimary};
          background-image: ${tickSvg};
          background-position: center;
          background-repeat: no-repeat;
          background-size: 57%;
          border-radius: 0.6rem;
          box-sizing: border-box;
          height: 1.2rem;
          width: 1.2rem;
        }

        .false {
          background-color: ${colors.bluePrimary};
          background-image: ${crossSvg};
          background-position: center;
          background-repeat: no-repeat;
          background-size: 57%;
          border-radius: 0.6rem;
          box-sizing: border-box;
          height: 1.2rem;
          width: 1.2rem;
        }
      `}</style>
    </div>
  )
}

export default CellBool;
