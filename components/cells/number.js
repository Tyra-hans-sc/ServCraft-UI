
function CellNumber({value, isDecimal}) {

  let updatedValue = value;
  if (isDecimal) {
    if (value) {
      updatedValue = value.toFixed(2);
      let spacePos = updatedValue.indexOf('.');
      while (spacePos > 3) {
        spacePos = spacePos - 3;
        updatedValue = [updatedValue.slice(0, spacePos), ' ', updatedValue.slice(spacePos)].join('');
      }
    }
  }

  return (
    <div className="number">
      {updatedValue}
      <style jsx>{`
        .number {
          text-align: right;
          display: contents;
        }
      `}</style>
    </div>
  )
}

export default CellNumber
