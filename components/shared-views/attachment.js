import React, { useState, useContext } from 'react';
import { colors, layout } from '../../theme';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import Fetch from '../../utils/Fetch';
import Time from '../../utils/time';
import FileService from '../../services/file-service';
import ConfirmAction from '../../components/modals/confirm-action';
import ToastContext from '../../utils/toast-context';
import PreviewAttachment from '../modals/attachment/preview-attachment';
import PS from '../../services/permission/permission-service';
import Image from "next/image";

function Attachment({ attachment, updateAttachments, taskItems = [] }) {

  const toast = useContext(ToastContext);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [permissionSecure] = useState(PS.hasPermission(Enums.PermissionName.AttachmentSecure));

  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  const changeDescription = () => {
    setConfirmOptions({
      ...Helper.initialiseConfirmOptions(),
      confirmButtonText: "Update",
      onConfirm: (promptText) => {
        confirmChangeDescription(promptText);
      },
      showCancel: true,
      display: true,
      heading: "Change Attachment Name",
      isPrompt: true,
      promptDefault: attachment.Description
    });
  };

  const descriptionMaxLength = 200;

  const confirmChangeDescription = async (newDescription) => {

    if (newDescription.length <= descriptionMaxLength) {
      attachment.Description = newDescription;

      const updateResult = await Fetch.put({
        url: `/Attachment`,
        params: attachment
      });

      if (updateResult.ID) {
        toast.setToast({
          message: 'Attachment updated successfully',
          show: true,
          type: Enums.ToastType.success
        });
        updateAttachments({});
      } else {
        toast.setToast({
          message: 'There was a problem updating this attachment',
          show: true,
          type: Enums.ToastType.error
        });
      }
    } else {
      toast.setToast({
        message: `Please keep the attachment name length less than ${descriptionMaxLength}`,
        show: true,
        type: Enums.ToastType.error
      });
    }
  };

  const toggleSecure = () => {
    setConfirmOptions({
      ...Helper.initialiseConfirmOptions(),
      confirmButtonText: attachment.IsSecure ? "Confirm Not Secured" : "Confirm Secured",
      onConfirm: () => {
        confirmToggleSecure();
      },
      display: true,
      heading: attachment.IsSecure ? "Confirm Not Secured" : "Confirm Secured",
      text: `Are you sure you want to mark this attachment as ${(attachment.IsSecure ? "not secured" : "secured")}?`,
    });
  };

  const confirmToggleSecure = async () => {

    attachment.IsSecure = !attachment.IsSecure;

    const updateResult = await Fetch.put({
      url: `/Attachment`,
      params: attachment
    });

    if (updateResult.ID) {
      toast.setToast({
        message: `Attachment successfully marked as ${(attachment.IsSecure ? "secured" : "not secured")}`,
        show: true,
        type: Enums.ToastType.success
      });
      updateAttachments({});
    } else {
      toast.setToast({
        message: 'There was a problem updating this attachment',
        show: true,
        type: Enums.ToastType.error
      });
    }

  };

  const deleteAttachment = () => {

    let tasksLinked = taskItems && taskItems.filter(x => x.IsActive && x.Complete && x.ItemDataResult && x.ItemDataResult.includes(attachment.ID)).length > 0;

    if (tasksLinked) {
      setConfirmOptions({
        ...Helper.initialiseConfirmOptions(),
        confirmButtonText: "Ok",
        onConfirm: () => {
        },
        showCancel: false,
        display: true,
        heading: "Cannot Delete Attachment",
        text: "This attachment is linked to a completed task. Mark the task as incomplete first.",
      });
      return;
    }

    setConfirmOptions({
      ...Helper.initialiseConfirmOptions(),
      confirmButtonText: "Delete Attachment",
      onConfirm: () => {
        confirmDelete();
      },
      display: true,
      heading: "Delete Attachment",
      text: "Are you sure you want to delete this attachment?",
    });
  };

  const confirmDelete = async () => {

    const destroyResult = await Fetch.destroy({
      url: `/Attachment?id=${attachment.ID}`,
    });

    if (destroyResult.ID) {
      toast.setToast({
        message: 'Attachment deleted successfully',
        show: true,
        type: Enums.ToastType.success
      });
      updateAttachments(attachment);
    } else {
      toast.setToast({
        message: 'There was a problem deleting this attachment',
        show: true,
        type: Enums.ToastType.error
      });
    }
  };

  const openInNewTab = async (attachment) => {
    let url = await Fetch.get({
      url: `/Attachment/AttachmentUrl?id=${attachment.ID}&download=${false}`
    });
    if (url) {
      window.open(url, "_blank");
    }
  };

  const attachmentIcon = () => {
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
  };

  return (
    <div className="container">
      <div className="preview">
        {
          FileService.isImage(attachment.FileName)
              ? <>
                <div>
                  <Image
                      objectFit={'cover'} placeholder={'blur'}
                      blurDataURL={attachment.ThumbnailSize > 0 ? attachment.UrlThumb : attachment.Url}
                      src={attachment.ThumbnailSize > 0 ? attachment.UrlThumb : attachment.Url}
                      height={160} width={250}
                      quality={40}
                  />
                </div>
                <div className="view">
                  <div className="view-button" onClick={() => {
                    setShowAttachmentPreview(true)
                  }}>
                    View
                  </div>
                </div>
              </> :
              <>
                {
                    FileService.isPDF(attachment.FileName) && <img src="/attachments/file-pdf.svg" alt="file"/> ||
                    FileService.isTextFile(attachment.FileName) && <img src="/attachments/file-text.svg" alt="file"/> ||
                    FileService.isSpreadSheet(attachment.FileName) && <img src="/attachments/file-sheet.svg" alt="file"/> ||
                    FileService.isVideo(attachment.FileName) && <img src="/attachments/file-video.svg" alt="file"/> ||
                    FileService.isAudio(attachment.FileName) && <img src="/attachments/file-audio.svg" alt="file"/> ||
                    <img src="/attachments/file.svg" alt="file"/>
                }
                <div className="view">
                  <div className="view-button" onClick={() => openInNewTab(attachment)}>
                    View
                  </div>
                </div>
              </>
        }
      </div>
      <div>
        <div className="info">
          <span className="info-desc">{attachment.Description}</span>
          <div className="info-links">
            <a href={attachment.Url} download="" title="Download" target="_blank"><img src="/icons/download.svg" alt="download" /></a>
            <img src="/icons/edit.svg" alt="edit" title='Change name' onClick={changeDescription} />
            {permissionSecure ? <>
              <img height="24" src={attachment.IsSecure ? "/sc-icons/lock-blue.svg" : "/sc-icons/lock-open-blue.svg"}
                alt={attachment.IsSecure ? "Mark as not secured" : "Mark as secured"}
                title={attachment.IsSecure ? "Attachment is secured. Mark as not secured." : "Attachment is not secured. Mark as secured."} onClick={toggleSecure} />
            </> : ""}
            <img src="/icons/trash-bluegrey.svg" alt="delete" title='Delete' onClick={deleteAttachment} />
          </div>
        </div>
        <div className="info-date">
          {Time.formatDate(attachment.CreatedDate) + " " + Time.getTimeFormatted(attachment.CreatedDate, "hh:mm")}
        </div>
      </div>

      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      {showOverlay
        ? <div className="overlay" onClick={(e) => e.stopPropagation()}>
          <div className="title-row">
            <div className="row back fixed-width" onClick={() => setShowOverlay(false)}>
              <div className="icon">
                <img src="/icons/arrow-left-blue.svg" alt="Go Back" />
              </div>
              Go back
            </div>
            <div className="title">
              {attachment.FileName}
            </div>
            <div className="image">
              <img src={attachment.Url} alt="image" />
            </div>
            <div className="fixed-width">
              <a href={attachment.Url} download title="Download" className="icon" target="_blank"><img src="/icons/download.svg" alt="download" /></a>
            </div>
          </div>
        </div>
        : ""
      }

      {showAttachmentPreview ?
        <PreviewAttachment attachment={attachment} setShowAttachmentPreview={setShowAttachmentPreview} overlay={true} /> : ''
      }

      <style jsx>{`
        .container {
          margin: 1.5rem 0 0 1.5rem;
          width: 15.625rem;
        }
        .row {
          align-items: center;
          display: flex;
        }
        .blue-text {
          color: ${colors.bluePrimary};
        }
        .preview {
          align-items: center;
          border: 1px solid ${colors.borderGrey};
          border-radius: ${layout.cardRadius};
          display: flex;
          height: 10rem;
          justify-content: center;
          object-fit: contain;
          overflow: hidden;
          position: relative;
          width: 100%;
        }
        .thumb {
          width: 100%;
        }
        .info {
          align-items: center;
          color: ${colors.darkSecondary};
          display: flex;
          font-size: 0.75rem;
          justify-content: space-between;
          padding-top: 8px;
          width: 100%
        }
        .info-desc {
          width: 166px;
          word-wrap: break-word;
        }
        .info-date {
          color: ${colors.darkSecondary};
          font-size: 0.75rem;
          padding-top: 8px;
        }
        .info-links {
          width: ${permissionSecure ? "135px;" : "84px;"}
        }
        .info-links img {
          padding-left: 0.25rem;
          cursor: pointer;
        }
        .view {
          align-items: center;
          background-color: rgba(28, 37, 44, 0.55);
          border-radius: ${layout.cardRadius};
          display: flex;
          height: 10rem;
          justify-content: center;
          left: 0;
          opacity: 0;
          position: absolute;
          top: 0;
          transition: opacity 0.2s ease-out;
          width: 100%;
        }
        .view:hover {
          opacity: 1;
        }
        .view-button {
          align-items: center;
          background-color: ${colors.white};
          border: 1px solid ${colors.bluePrimary};
          border-radius: ${layout.buttonRadius};
          color: ${colors.bluePrimary};
          cursor: pointer;
          display: flex;
          font-weight: bold;
          height: 2.5rem;
          justify-content: center;
          width: 9rem;
        }
        .overlay {
          background-color: rgba(242, 242, 242, 0.9);
          bottom: 0;
          left: 0;
          position: fixed;
          right: 0;
          top: 0;
          z-index: 9999;
        }
        .title-row {
          align-items: center;
          color: ${colors.bluePrimary};
          display: flex;
          justify-content: space-between;
          padding: 1rem 2.5rem 0;
        }
        .icon {
          align-items: center;
          background-color: rgba(19, 106, 205, 0.2);
          border-radius: 1.25rem;
          cursor: pointer;
          display: flex;
          height: 2.5rem;
          justify-content: center;
          width: 2.5rem;
        }
        .back {
          cursor: pointer;
        }
        .back .icon {
          margin-right: 1rem;
        }
        .image {
          border-radius: ${layout.cardRadius};
          box-sizing: border-box;
          height: calc(100vh - 3.5rem);
          object-fit: contain;
          overflow: hidden;
          padding: 5% 15%;
          width: 100%;
        }
        .image img {
          height: 100%;
          object-fit: contain;
          width: 100%;
        }
        .fixed-width {
          display: flex;
          justify-content: flex-end;
          width: 120px;
        }
      `}</style>
    </div>
  )
}

export default Attachment;
