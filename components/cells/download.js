import React, { useState, useEffect } from 'react'
import { colors, layout} from '../../theme'

function CellDownload({url, downloadOptions, image}) {

  const [download, setDownload] = useState(false);

  useEffect(() => {
    if (download == true) {
      if (downloadOptions.OpenNewWindow) {
        window.open(url, '_blank', 'location=yes,scrollbars=yes,status=yes');
      } else if (!downloadOptions.OpenNewWindow) {
        window.open(url, '_blank');
      } else {
        window.open(url);
      }
      
      setDownload(false);
    }
  }, [download]);

  function getDownloadImage() {
    if (url) {
      return (
        <>
          <div className='image'>
            <a href='#' onClick={() => setDownload(true)} title='download'>
              <img src={image} alt="image" />
            </a>
          </div>
        </>
      );
    }
    return (
      <>
      </>
    );
  }

  return (
    <div className="container">
      {getDownloadImage()}
      <style jsx>{`
        .container {
          align-items: center;
          display: flex;
        }
      `}</style>
    </div>
  )
}

export default CellDownload
