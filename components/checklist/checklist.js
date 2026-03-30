import { useEffect, useState } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme'
import CheckListItem from './checklist-item'
import { Line, Circle } from 'rc-progress';

function CheckList(props) {

  const sortItems = (items) => {
    return items.sort((a, b) => {
      if (a.DisplayOrder > b.DisplayOrder) {
        return 1;
      } else if (a.DisplayOrder < b.DisplayOrder) {
        return -1;
      } else {
        return 0;
      }
    });
  };

  const items = sortItems(props.items);
  const [percentComplete, setPercentComplete] = useState(0);

  useEffect(() => {
    let temp = Math.round((props.items.filter(x => x.Complete).length / props.items.length) * 100);
    setPercentComplete(temp);
  }, []);

  const clickHandler = (item) => {
    props.actionFunc(item);
  };

  return (
    <div className="container">

      <div className="splitter">
        <div className="header-container">
          <div className="header">
            Getting Started
          </div>
          <div className="header-details">
            Click on the steps below to get set up
          </div>
        </div>
        <div className="progress-percent">
          {percentComplete}% Completed
        </div>
      </div>
     
      <div className="progress-line">
        <Line percent={percentComplete} strokeWidth="1" strokeColor={`${colors.green}`} trailColor={`${colors.formGrey}`} />
      </div>
      <div className="body-container">
        {items && items.map(function (item, index) {
          return <CheckListItem item={item} clickHandler={clickHandler} />;
        })}
      </div>

      <style jsx>{`
        .container {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          box-shadow: ${shadows.card};
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          padding: 1rem;
          width: 100%;
        }
        .seperator {
          border-bottom: 1px solid #E8EDF2;
          margin-bottom: 0.5rem;
        }
        .header-container {
          margin-bottom: 0.5rem;
          display: flex;
          flex-direction: column;
          width: 60%;
        }
        .header {
          font-size: 16px;
          color: ${colors.darkPrimary};
          font-weight: bold;
        }
        .header-details {
          color: ${colors.blueGrey};
          margin-top: 0.5rem;
        }
        .progress-line {
          margin-bottom: 0.5rem;
        }
        .progress-percent {
          color: ${colors.green};
          font-weight: bold;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: flex-end;
          width: 100%;
        }
        .body-container {

        }
        .splitter {
          display: flex;
        }
      `}</style>
    </div>
  );
}

export default CheckList
