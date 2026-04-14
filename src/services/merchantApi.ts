import { apiRequest, createFilePart } from './apiClient';
import { Merchant } from './authApi';

const MERCHANT_API_BASE = 'http://bachatbazaar.tech/api/merchant';
const CATEGORY_API_URL = 'http://bachatbazaar.tech/api/categories';
const normalizePhoneForApi = (phone: string) => phone.replace(/\D/g, '').slice(-10);

const compressImageIfNeeded = async (file: any, fallbackName: string) => {
  if (!file?.uri) {
    return file;
  }

  const fileType = (file?.type || '').toLowerCase();
  const isImage = fileType.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.uri);
  const isRemoteFile = /^https?:\/\//i.test(file.uri);

  if (!isImage || isRemoteFile) {
    return file;
  }

  return {
    ...file,
    name: file?.name || fallbackName,
    type: file?.type || 'image/jpeg',
  };
};

export const updateMerchantProfileRequest = async ({
  token,
  name,
  gender,
  city,
  phone,
  email,
  profileImage,
}: {
  token: string;
  name: string;
  gender: string;
  city: string;
  phone: string;
  email?: string;
  profileImage?: any;
}) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('gender', gender);
  formData.append('city', city);
  formData.append('phone', normalizePhoneForApi(phone));

  if (email) {
    formData.append('email', email);
  }

  if (profileImage?.uri) {
    const compressedProfileImage = await compressImageIfNeeded(profileImage, 'profile-image.jpg');
    formData.append('profileImage', createFilePart(compressedProfileImage, 'profile-image.jpg') as any);
  }

  return apiRequest<{ success: boolean; merchant: Merchant }>(`${MERCHANT_API_BASE}/profile`, {
    method: 'PUT',
    body: formData,
    token,
    isFormData: true,
  });
};

export const uploadMerchantDocumentsRequest = async ({
  token,
  documentType,
  documentNumber,
  documentFile,
  panName,
  dob,
}: {
  token: string;
  documentType: 'Aadhaar' | 'PAN';
  documentNumber: string;
  documentFile: any;
  panName?: string;
  dob?: string;
}) => {
  const formData = new FormData();
  const compressedDocumentFile = await compressImageIfNeeded(
    documentFile,
    documentType === 'Aadhaar' ? 'aadhar-image.jpg' : 'pan-image.jpg',
  );

  if (documentType === 'Aadhaar') {
    formData.append('aadharNumber', documentNumber);
    formData.append('aadharImage', createFilePart(compressedDocumentFile, 'aadhar-image.jpg') as any);
  } else {
    formData.append('panNumber', documentNumber);
    formData.append('name', panName || '');
    formData.append('dob', dob || '');
    formData.append('panImage', createFilePart(compressedDocumentFile, 'pan-image.jpg') as any);
  }

  return apiRequest<{
    success: boolean;
    message: string;
    personalDocs: Record<string, unknown>;
    kycStatus: string;
  }>(`${MERCHANT_API_BASE}/personal-docs`, {
    method: 'POST',
    body: formData,
    token,
    isFormData: true,
  });
};

export const uploadBusinessDocumentsRequest = async ({
  token,
  gstNumber,
  gstImage,
}: {
  token: string;
  gstNumber: string;
  gstImage: any;
}) => {
  const formData = new FormData();
  const compressedBusinessDoc = await compressImageIfNeeded(gstImage, 'gst-image.jpg');

  formData.append('gstNumber', gstNumber);
  formData.append('gstImage', createFilePart(compressedBusinessDoc, 'gst-image.jpg') as any);

  return apiRequest<{
    success: boolean;
    message: string;
    businessDocs?: Record<string, unknown>;
    kycStatus?: string;
  }>(`${MERCHANT_API_BASE}/business-docs`, {
    method: 'POST',
    body: formData,
    token,
    isFormData: true,
  });
};

export type Category = {
  _id: string;
  value: string;
  label: string;
  description?: string;
  isActive?: boolean;
};

export const fetchCategoriesRequest = (token: string) =>
  apiRequest<{ success: boolean; count: number; categories: Category[] }>(CATEGORY_API_URL, {
    method: 'GET',
    token,
  });

export const updateMerchantShopRequest = async ({
  token,
  shopName,
  categoryId,
  address,
  city,
  phone,
  description,
  logoImage,
  shopBannerImage,
}: {
  token: string;
  shopName: string;
  categoryId: string;
  address: string;
  city: string;
  phone: string;
  description: string;
  logoImage: any;
  shopBannerImage: any;
}) => {
  const formData = new FormData();
  formData.append('shopName', shopName);
  formData.append('categoryId', categoryId);
  formData.append('address', address);
  formData.append('city', city);
  formData.append('phone', normalizePhoneForApi(phone));
  formData.append('description', description);

  const compressedLogo = await compressImageIfNeeded(logoImage, 'shop-logo.jpg');
  const compressedBanner = await compressImageIfNeeded(shopBannerImage, 'shop-banner.jpg');
  formData.append('logoImage', createFilePart(compressedLogo, 'shop-logo.jpg') as any);
  formData.append('shopBannerImage', createFilePart(compressedBanner, 'shop-banner.jpg') as any);

  return apiRequest<{ success: boolean; message: string; merchant?: Merchant }>(`${MERCHANT_API_BASE}/shop`, {
    method: 'PUT',
    body: formData,
    token,
    isFormData: true,
  });
};
