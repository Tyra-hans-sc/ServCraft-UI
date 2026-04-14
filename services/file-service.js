import OptionService from './option/option-service';

function getFileExtension(fileName) {
    const name = fileName.toString().toLowerCase().trim();
    const lastPeriodIdx = name.lastIndexOf('.');
    return name.substring(lastPeriodIdx + 1);
}

const isImage = (fileName) => {
    return imageExtensions().indexOf(getFileExtension(fileName)) !== -1;
};

const isPDF = (fileName) => {    
    return ['pdf'].indexOf(getFileExtension(fileName)) !== -1;
};

const isTextFile = (fileName) => {
    return ['txt', 'doc', 'docx'].indexOf(getFileExtension(fileName)) !== -1;
};

const isSpreadSheet = (fileName) => {
    return ['csv', 'xls', 'xlsx'].indexOf(getFileExtension(fileName)) !== -1;
};

const isVideo = (fileName) => {
    return videoExtensions().indexOf(getFileExtension(fileName)) !== -1;
};

const isAudio = (fileName) => {
    return audioExtensions().indexOf(getFileExtension(fileName)) !== -1;
};

const imageExtensions = () => {
    return ['jpg', 'jpeg', 'png', 'bmp', 'tif', 'gif', 'jfif', 'webp', 'heic', 'heif'];
};

const videoExtensions = () => {
    return ['mpg', 'mpeg', 'mp4', 'wmv', 'flv', 'avi', 'mov', 'm3u8', '3gp'];
};

const audioExtensions = () => {
    return ['m4a', 'wma', 'mp3', 'aac', 'ogg', 'flac', 'alac', 'wav', 'aiff'];
};

const getFileUploadSize = async () => {
    let fileSizeSetting = await OptionService.getOption('System Settings', 'File Upload Size');
    let fileSizeUnit = fileSizeSetting ? fileSizeSetting.Unit : 'mb';
    let fileSizeValue = fileSizeSetting ? parseFloat(fileSizeSetting.OptionValue) : 2;

    return {Value: fileSizeValue, Unit: fileSizeUnit}
};

export default {
    isImage,
    imageExtensions,
    isAudio,
    isTextFile,
    isSpreadSheet,
    isPDF,
    isVideo,
    videoExtensions,
    getFileUploadSize,
};
