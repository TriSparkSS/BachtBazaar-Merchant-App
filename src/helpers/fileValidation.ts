const ONE_MB_IN_BYTES = 1024 * 1024;

const getFileUri = (file: any): string => String(file?.uri || file?.fileCopyUri || file?.path || '');
const getFileName = (file: any): string => String(file?.name || file?.fileName || '');
const getFileType = (file: any): string => String(file?.type || '');

export const getFileSizeBytes = (file: any): number | null => {
  const rawSize = file?.size ?? file?.fileSize;
  if (typeof rawSize === 'number' && Number.isFinite(rawSize) && rawSize >= 0) {
    return rawSize;
  }
  return null;
};

export const isImageFile = (file: any): boolean => {
  const type = getFileType(file).toLowerCase();
  const name = getFileName(file).toLowerCase();
  const uri = getFileUri(file).toLowerCase();

  if (type.startsWith('image/')) {
    return true;
  }

  return /\.(jpe?g|png|webp|heic|heif|gif)$/.test(name) || /\.(jpe?g|png|webp|heic|heif|gif)(\?|$)/.test(uri);
};

export const validateImageUnderOneMb = (file: any) => {
  if (!isImageFile(file)) {
    return { valid: true, sizeBytes: getFileSizeBytes(file) };
  }

  const sizeBytes = getFileSizeBytes(file);
  if (sizeBytes == null) {
    return { valid: true, sizeBytes: null };
  }

  if (sizeBytes > ONE_MB_IN_BYTES) {
    return {
      valid: false,
      sizeBytes,
      message: 'Please select an image smaller than 1 MB.',
    };
  }

  return { valid: true, sizeBytes };
};

export { ONE_MB_IN_BYTES };
