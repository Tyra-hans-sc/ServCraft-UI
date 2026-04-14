import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import MobileCard from './mobile-card';

function MobileCardList({moduleCode, data, itemClick}) {

  //const [localData, setLocalData] = useState(data);

  return (
    <div className="card-list-container">
      { data && data.map((item, key) => {
        return <MobileCard moduleCode={moduleCode} data={item} key={key} itemClick={itemClick} />;
      })}

      <style jsx>{`
        .card-list-container {

        }
      `}</style>
    </div>
  );
}

export default MobileCardList;
