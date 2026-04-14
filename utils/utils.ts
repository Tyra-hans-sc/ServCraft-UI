import { Attachment } from "@/interfaces/api/models";

const getBase64FromDataUrl = (dataUrl: string): string => {
  const parts = dataUrl.split(',');
  return parts.length > 1 ? parts[1] : '';
}

const downloadAttachment = async (attachment: Attachment) => {
  try {
    if (!attachment.Url) return;
    const response = await fetch(attachment.Url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = attachment.Description || attachment.FileName || 'image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    if (!attachment.Url) return;
    const link = document.createElement('a');
    link.href = attachment.Url;
    link.download = attachment.Description || attachment.FileName || 'image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
export { getBase64FromDataUrl, downloadAttachment };