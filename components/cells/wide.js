import {useState} from 'react';

function CellWide({value}) {

  return (
    <div className="wide clamp-text">
      {value}
      <style jsx>{`
        .wide {
          width: 250px;
        }
        .clamp-text {
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-line-clamp: 3;
          display: contents;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  )
}

export default CellWide;
