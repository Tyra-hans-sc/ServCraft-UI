import React, { useEffect, useRef, useState } from 'react';
import { colors, layout } from '../../../theme';
import * as Enums from '../../../utils/enums';
import FileService from '../../../services/file-service';
import Image from "next/image";
import {Slider} from "@mui/material";
import {ActionIcon, Box, Loader} from "@mantine/core";
import {IconMinus, IconPlus} from "@tabler/icons";
import SCModal from "@/PageComponents/Modal/SCModal";
// import { Slider } from "@material-ui/core";
// import { ZoomIn, ZoomOut } from "@material-ui/icons";

function PreviewAttachment({ attachment, setShowAttachmentPreview, overlay = false }) {

  function attachmentIcon() {
    switch (attachment.AttachmentType) {
      case Enums.AttachmentType.Other:
        return <img src="/attachments/file.svg" alt="file" />
      case Enums.AttachmentType.Image:
        return <img src="/attachments/image.svg" alt="image" />
      case Enums.AttachmentType.Sketch:
        return <img src="/attachments/image.svg" alt="image" />
      case Enums.AttachmentType.Contract:
        return <img src="/attachments/file-text.svg" alt="file-text" />
      case Enums.AttachmentType.JobCard:
        return <img src="/attachments/file-sheet.svg" alt="file-sheet" />
      default:
        return <img src="/attachments/file.svg" alt="file" />
    }
  }

  // zoom min: 100 max: 1000
  const [zoom, setZoom] = useState(100);

  const scrollContainer = useRef();

  const scrollPercentageRef = useRef({
    x: 0.5,
    y: 0.5
  });

  const blockScrollEventRef = useRef(false);

  const calculateScrollPercentage = () => {
    const viewportHeight = scrollContainer.current?.offsetHeight,
      viewportWidth = scrollContainer.current?.offsetWidth,
      topOfScrollbar = scrollContainer.current?.scrollTop,
      leftOfScrollbar = scrollContainer.current?.scrollLeft,
      totalHeight = scrollContainer.current?.scrollHeight,
      totalWidth = scrollContainer.current?.scrollWidth;

    const cornerOfVP = {
      x: leftOfScrollbar,
      y: topOfScrollbar
    };

    const offset = {
      x: viewportWidth / 2,
      y: viewportHeight / 2
    };

    const positionOnImage = {
      x: cornerOfVP.x + offset.x,
      y: cornerOfVP.y + offset.y
    };

    const centerPercentage = {
      x: positionOnImage.x / totalWidth,
      y: positionOnImage.y / totalHeight
    };

    return centerPercentage;
  };

  const handleZoom = (zoomPercent) => {
    if (!scrollContainer.current) return;

    blockScrollEventRef.current = true;

    setZoom(zoomPercent);

    scrollContainer.current.children[0].style.width = `${zoomPercent}%`;
    scrollContainer.current.children[0].style.height = `${zoomPercent}%`;

    let sp = calculateScrollPercentage();

    let topOfScrollbar = scrollContainer.current?.scrollTop,
      leftOfScrollbar = scrollContainer.current?.scrollLeft,
      totalHeight = scrollContainer.current?.scrollHeight,
      totalWidth = scrollContainer.current?.scrollWidth;

    leftOfScrollbar = leftOfScrollbar + ((scrollPercentageRef.current.x - sp.x) * totalWidth);
    topOfScrollbar = topOfScrollbar + ((scrollPercentageRef.current.y - sp.y) * totalHeight);

    scrollContainer.current.scrollTo({
      top: topOfScrollbar,
      left: leftOfScrollbar,
      behavior: 'auto'
    });

    blockScrollEventRef.current = false;
  }

  const handleScrollEvent = () => {
    if (blockScrollEventRef.current) return;

    let sp = calculateScrollPercentage();
    scrollPercentageRef.current = sp;
  };

  return (
    <>
      <SCModal size={'auto'} open withCloseButton onClose={() => setShowAttachmentPreview(false)} modalProps={{
        styles: {
          close: {marginInlineEnd: 50, right: 50},
          content: {paddingInline: 0, marginInline: 0},
          body: {paddingInline: 0, marginInline: 0},
        }
      }}
               p={'xs'}
               closeButtonProps={{right: 30, top: 16}}
      >


        <Box>
          {/*<div className="preview-close">
            <img src="/icons/x-circle-dark.svg" alt='close' title='Close'
                 onClick={() => setShowAttachmentPreview(false)}/>
          </div>*/}
          <div>
            <div className={'zoom-control-bar'}>
              {/*<ZoomIn role={'button'}
              cursor={'pointer'}
              color={'primary'}
              onClick={() => handleZoom(zoom + 50)}
            />*/}
              <ActionIcon
                  variant={'transparent'}
                  onClick={() => handleZoom(zoom + 50)}
              >
                <IconPlus/>
              </ActionIcon>
              <Slider orientation={'vertical'}
                      onChange={(x, val) => handleZoom(val)}
                      min={100} max={1000}
                      track={false}
                      value={zoom}
                      valueLabelFormat={(x) => Math.floor(x / 100) + 'x'}
                      getAriaValueText={(x) => `${x} %`}
                      valueLabelDisplay={'auto'}
                      aria-label={'Zoom'}
              />
              <ActionIcon
                  variant={'transparent'}
                  onClick={() => handleZoom((zoom - 50) < 100 ? 100 : (zoom - 50))}
              >
                <IconMinus/>
              </ActionIcon>
              {/*<ZoomOut role={'button'}
              cursor={'pointer'}
              color={'primary'}
              onClick={() => handleZoom((zoom - 50) < 100 ? 100 : (zoom - 50))}
            />*/}
            </div>
            {FileService.isImage(attachment.FileName)
                ? <div className={'zoom-container'} ref={scrollContainer} onScroll={handleScrollEvent}>
                  <div onDoubleClick={() => handleZoom(zoom + 50)} style={{
                    height: `100%`,
                    width: `100%`,
                    position: 'absolute',
                    display: 'block'
                  }}>
                    <div>
                      <Image
                          src={attachment.Url || attachment.UrlThumb}
                          alt={''}
                          placeholder={'blur'}
                          blurDataURL={attachment.UrlThumb}
                          quality={100}
                          objectFit={'contain'}
                          objectPosition={'center'}
                          layout={'fill'}
                      ></Image>
                    </div>
                  </div>
                </div>
                : attachmentIcon()
            }
          </div>
          <div className="info">
            {attachment.Description}
            <a href={attachment.Url} download="" target="_blank"><img src="/icons/download.svg" alt="download"/></a>
          </div>
        </Box>
      </SCModal>

      <style jsx>{`
        .zoom-control-bar {
          transition: .5s;
          position: absolute;
          height: 500px;
          width: 16px;
          top: 3em;
          right: 2em;
          gap: .8rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.1);
          filter: drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 2px);
          border-radius: 2rem;
          z-index: 10;
          padding: .8rem;
          opacity: 1;
        }

        .zoom-control-bar :active {
          background-color: rgba(0, 0, 0, 0.18);
          filter: drop-shadow(rgba(255, 255, 255, 0.6) 0px 0px 4px);
        }

        .zoom-control-bar :hover {
          background-color: rgba(0, 0, 0, 0.18);
        }

        .zoom-container {
          border: 1px solid lightgrey;
          min-height: 70vh;
          max-width: 70em;
          width: calc(100vw - 3rem);
          overflow: auto;
          position: relative;
        }

        .preview-overlay {
          display: flex;
          justify-content: left;
          position: fixed;
          right: 29rem;
          top: 6rem;
          z-index: 110;
        }

        .preview-modal-container {
          background-color: var(--white-color);
          border-radius: var(--layout-card-radius);
          padding: 2.5rem 0.5rem 0.5rem 0.5rem;
          // max-width: 90%;
          // max-height: 90%;
          overflow-x: auto;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.04), 0 0 25px rgba(0, 0, 0, 0.1);
        }

        .preview-modal-container p {
          color: ${colors.blueGreyLight};
          font-size: 0.875rem;
          margin: 1rem 0 0.25rem 0
        }

        .preview-modal-container h1 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0;
        }

        .row {
          display: flex;
          justify-content: space-between;
        }

        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-left: 0.5rem;
        }

        .relative-position {
          position: relative;
        }

        .preview {
          align-items: center;
          border: 1px solid ${colors.borderGrey};
          border-radius: ${layout.cardRadius};
          display: flex;
          // height: 20rem;
          justify-content: center;
          object-fit: contain;
          overflow: hidden;
          position: relative;
          // width: 100%;
          // max-width: calc(90vw - 2rem);
          // max-height: calc(90vh - 4rem);
        }

        .preview img {
          max-width: calc(90vw - 2rem);
          max-height: calc(90vh - 4rem);
        }
        .thumb {
          // width: 100%;
        }
        .info {
          align-items: center;
          color: ${colors.darkSecondary};
          display: flex;
          font-size: 0.75rem;
          justify-content: space-between;
          padding-top: 10px;
          padding-inline-end: 12px;
          width: 100%
        }
        .preview-edit {
          align-items: flex-end;
          bottom: 1rem;
          color: ${colors.bluePrimary};
          cursor: pointer;
          display: flex;
          font-size: 0.875rem;
          font-weight: bold;
          position: absolute;
          right: 1rem;
        }
        .preview-edit img {
          margin-right: 0.5rem;
        }
        .preview-close {
          align-items: flex-end;
          top: 0.5rem;
          cursor: pointer;
          display: flex;
          font-size: 0.875rem;
          font-weight: bold;
          position: absolute;
          right: 0.5rem;
        }
        .cancel {
          width: 6rem;
        }
      `}</style>
    </>
  );
}
export default PreviewAttachment;
