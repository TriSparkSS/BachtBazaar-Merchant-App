import { apiRequest, createFilePart } from './apiClient';
import { Merchant } from './authApi';
import { validateImageUnderOneMb } from '../helpers/fileValidation';
import ImageResizer from 'react-native-image-resizer';

const API_ROOT = 'http://bachatbazaar.tech/api';
const MERCHANT_API_BASE = 'http://bachatbazaar.tech/api/merchant';
const CATEGORY_API_URL = 'http://bachatbazaar.tech/api/categories';
const normalizePhoneForApi = (phone: string) => phone.replace(/\D/g, '').slice(-10);

const compressImageIfNeeded = async (file: any, fallbackName: string) => {
  if (!file?.uri) {
    return file;
  }

  const imageValidation = validateImageUnderOneMb(file);
  if (!imageValidation.valid) {
    throw new Error(imageValidation.message || 'Please select an image smaller than 1 MB.');
  }

  const fileType = (file?.type || '').toLowerCase();
  const isImage = fileType.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.uri);
  const isRemoteFile = /^https?:\/\//i.test(file.uri);

  if (!isImage || isRemoteFile) {
    return file;
  }

  try {
    // Compress before upload to reduce payload and improve API reliability.
    const resized = await ImageResizer.createResizedImage(
      file.uri,
      1280,
      1280,
      'JPEG',
      75,
      0,
    );

    return {
      ...file,
      uri: resized.uri,
      path: resized.path,
      size: resized.size,
      fileSize: resized.size,
      name: resized.name || file?.name || fallbackName,
      type: 'image/jpeg',
    };
  } catch (error) {
    // Fallback to original file if compression fails for any edge case.
    return {
      ...file,
      name: file?.name || fallbackName,
      type: file?.type || 'image/jpeg',
    };
  }
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
  documentType,
  documentNumber,
  documentFile,
}: {
  token: string;
  documentType: 'GST' | 'PAN' | 'Aadhaar';
  documentNumber: string;
  documentFile: any;
}) => {
  const formData = new FormData();
  const fallbackName =
    documentType === 'PAN' ? 'pan-image.jpg' : documentType === 'Aadhaar' ? 'aadhar-image.jpg' : 'gst-image.jpg';
  const compressedBusinessDoc = await compressImageIfNeeded(documentFile, fallbackName);

  if (documentType === 'PAN') {
    formData.append('panNumber', documentNumber);
    formData.append('panImage', createFilePart(compressedBusinessDoc, 'pan-image.jpg') as any);
  } else if (documentType === 'Aadhaar') {
    formData.append('aadharNumber', documentNumber);
    formData.append('aadhaarNumber', documentNumber);
    formData.append('aadharImage', createFilePart(compressedBusinessDoc, 'aadhar-image.jpg') as any);
    formData.append('aadhaarImage', createFilePart(compressedBusinessDoc, 'aadhar-image.jpg') as any);
  } else {
    formData.append('gstNumber', documentNumber);
    formData.append('gstImage', createFilePart(compressedBusinessDoc, 'gst-image.jpg') as any);
  }

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

export type Subcategory = {
  _id: string;
  name: string;
  slug?: string;
  label?: string;
  value?: string;
  isActive?: boolean;
};

export type ShopHourDayValue = {
  open?: string;
  close?: string;
  isClosed: boolean;
};

export type ShopOpeningHours = {
  monday: ShopHourDayValue;
  tuesday: ShopHourDayValue;
  wednesday: ShopHourDayValue;
  thursday: ShopHourDayValue;
  friday: ShopHourDayValue;
  saturday: ShopHourDayValue;
  sunday: ShopHourDayValue;
};

export const fetchCategoriesRequest = (token: string) =>
  apiRequest<{ success: boolean; count: number; categories: Category[] }>(CATEGORY_API_URL, {
    method: 'GET',
    token,
  });

export const fetchSubcategoriesRequest = (token: string, categoryId: string) =>
  apiRequest<{ success: boolean; subcategories: Subcategory[]; count?: number }>(
    `${CATEGORY_API_URL}/${categoryId}/subcategories`,
    {
      method: 'GET',
      token,
    },
  );

export const fetchUnifiedProfileRequest = (token: string) =>
  apiRequest<{
    success: boolean;
    profile?: Record<string, any>;
    user?: Record<string, any>;
    merchant?: Merchant & Record<string, any>;
    role?: 'user' | 'merchant';
  }>(`${API_ROOT}/profile`, {
    method: 'GET',
    token,
  });

export const fetchShopHoursRequest = (token: string) =>
  apiRequest<{ success: boolean; openingHours: ShopOpeningHours }>(`${MERCHANT_API_BASE}/shop/hours`, {
    method: 'GET',
    token,
  });

export const updateShopHoursRequest = (token: string, openingHours: Partial<ShopOpeningHours>) =>
  apiRequest<{ success: boolean; openingHours?: ShopOpeningHours; message?: string }>(`${MERCHANT_API_BASE}/shop/hours`, {
    method: 'PUT',
    body: openingHours,
    token,
  });

export const patchSingleShopHourRequest = (
  token: string,
  day: keyof ShopOpeningHours,
  value: ShopHourDayValue,
) =>
  apiRequest<{ success: boolean; openingHours?: ShopOpeningHours; message?: string }>(
    `${MERCHANT_API_BASE}/shop/hours/${day}`,
    {
      method: 'PATCH',
      body: value,
      token,
    },
  );

export const updateMerchantShopRequest = async ({
  token,
  shopName,
  categoryId,
  address,
  address1,
  city,
  phone,
  description,
  latitude,
  longitude,
  logoImage,
  shopBannerImage,
}: {
  token: string;
  shopName: string;
  categoryId: string;
  address: string;
  address1?: string;
  city: string;
  phone: string;
  description: string;
  latitude?: number;
  longitude?: number;
  logoImage?: any;
  shopBannerImage?: any;
}) => {
  const formData = new FormData();
  formData.append('shopName', shopName);
  formData.append('categoryId', categoryId);
  formData.append('address', address);
  formData.append('address1', address1 || address);
  formData.append('city', city);
  formData.append('phone', normalizePhoneForApi(phone));
  formData.append('description', description);
  if (typeof latitude === 'number') {
    formData.append('latitude', String(latitude));
  }
  if (typeof longitude === 'number') {
    formData.append('longitude', String(longitude));
  }

  if (logoImage?.uri) {
    const compressedLogo = await compressImageIfNeeded(logoImage, 'shop-logo.jpg');
    formData.append('logoImage', createFilePart(compressedLogo, 'shop-logo.jpg') as any);
  }

  if (shopBannerImage?.uri) {
    const compressedBanner = await compressImageIfNeeded(shopBannerImage, 'shop-banner.jpg');
    formData.append('shopBannerImage', createFilePart(compressedBanner, 'shop-banner.jpg') as any);
  }

  return apiRequest<{ success: boolean; message: string; merchant?: Merchant }>(`${MERCHANT_API_BASE}/shop`, {
    method: 'PUT',
    body: formData,
    token,
    isFormData: true,
  });
};
