import React from 'react';
import Time from '../../utils/time';

function CellDate({value, utc = false, hideTime = false}) {

  function formatDate() {

    if (value) {
      const date = Time.parseDate(value);
      var monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
      ];
    
      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();
      let hour = utc ? date.getHours(date.setHours(date.getHours() + 2)).toString() : date.getHours().toString();
      hour = hour.length < 2 ? "0" + hour : hour;
      let minutes = date.getMinutes().toString();
      minutes = minutes.length < 2 ? "0" + minutes : minutes;
    
      let str = day + ' ' + monthNames[monthIndex] + ' ' + year;
      if (hideTime !== true) {
        str += ' ' + hour + ':' + minutes;
      }
      return str;
    } else {
      return null;
    }
  }

  return (
    <div className="content">{formatDate()}
    
    <style jsx>{`
    .content {
      display: contents;
    }
    `}</style>
    </div>
  )
}

export default CellDate;
