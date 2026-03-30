
function CellDescription({value}) {

  return (
    <div className="description" title={value}>
      {value}
      <style jsx>{`
        .description {
          text-overflow: ellipsis;
          width: 16rem;
          overflow: hidden;
          -webkit-line-clamp: 3;
          display: contents;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  )
}

export default CellDescription;
