import React, { useState, useEffect } from 'react'
import { Button } from '@mantine/core'
// import fetch from 'isomorphic-unfetch'
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../theme'
import DownloadService from '../utils/download-service'
import SCSpinner from './sc-controls/misc/sc-spinner';

function Download(props) {

  const url = props.url;
  const method = props.method;
  const params = props.params;
  const icon = props.icon;
  const [isDownloading, setIsDownloading] = useState(false);

  const [download, setDownload] = useState(false);

  async function downloadFile() {
    setIsDownloading(true);
    await DownloadService.downloadFile(method, url, params, false, false, "", "", null, false, () => {
      setIsDownloading(false);
    });
  }

  useEffect(() => {
    console.log(url);
    if (download == true) {

      downloadFile();
      setDownload(false);
    }
  }, [download]);

  return (
    <div>
      {icon ?
        <div title="Export to Excel" className="iconContainer" onClick={() => !isDownloading && setDownload(true)}>
          {isDownloading ? <SCSpinner colour="dark" /> :
            <img src={icon} alt="icon" className="icon" />
          }
        </div>
        :
        <Button variant={props.variant} onClick={() => !isDownloading && setDownload(true)} mt={'sm'} w={'100%'}>
          {props.label}
        </Button>
      }

      <style jsx>{`
        .actions {
          display: flex;
        }
        .actions :global(.button) {         
          white-space: nowrap;
        }
        .iconContainer {
          align-items: center;
          border: 1px solid ${colors.blueGreyLight};
          border-radius: ${layout.cardRadius};
          box-sizing: border-box;
          cursor: pointer;
          display: flex;
          font-weight: bold;
          height: 2.5rem;
          justify-content: space-between;
          margin-top: 0.5rem;
          padding: 0.5rem 0.5rem 0.5rem 0;
          position: relative;
        }
        .icon {
          width: 1.3rem;
          height: auto;
          margin-left: 0.7rem;
        }
      `}</style>
    </div>
  );
}

export default Download
