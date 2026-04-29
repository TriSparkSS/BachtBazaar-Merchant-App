import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Merchant } from '../services/authApi';
import { fetchUnifiedProfileRequest } from '../services/merchantApi';

const STORAGE_KEY = 'merchant_app_state_v1';

type StoredFile = {
  uri?: string;
  type?: string | null;
  name?: string | null;
};

type PersonalDocumentDraft = {
  documentType: 'Aadhaar' | 'PAN';
  documentNumber: string;
  documentFile: StoredFile | null;
  panName?: string;
  dob?: string;
  uploaded?: boolean;
  kycStatus?: string;
};

type BusinessDocumentDraft = {
  selectedDocType: string;
  certificateId: string;
  uploadedFile: StoredFile | null;
  uploaded?: boolean;
};

type ShopDraft = {
  shopName: string;
  categoryId: string;
  category: string;
  subCategory: string;
  address: string;
  address1?: string;
  city: string;
  phone: string;
  latitude?: number;
  longitude?: number;
};

type StoreBrandingDraft = {
  logo: StoredFile | null;
  banner: StoredFile | null;
  description: string;
  logoUploaded?: boolean;
  bannerUploaded?: boolean;
};

type AppContextValue = {
  isHydrated: boolean;
  authToken: string | null;
  merchant: Merchant | null;
  personalDocumentDraft: PersonalDocumentDraft;
  businessDocumentDraft: BusinessDocumentDraft;
  shopDraft: ShopDraft;
  storeBrandingDraft: StoreBrandingDraft;
  setupProgress: number;
  nextSetupRoute: string | null;
  setSession: (token: string, merchant: Merchant) => Promise<{ isComplete: boolean; nextRoute: string | null }>;
  clearSession: () => Promise<void>;
  updateMerchant: (merchant: Merchant) => Promise<void>;
  savePersonalDocumentDraft: (draft: Partial<PersonalDocumentDraft>) => Promise<void>;
  saveBusinessDocumentDraft: (draft: Partial<BusinessDocumentDraft>) => Promise<void>;
  saveShopDraft: (draft: Partial<ShopDraft>) => Promise<void>;
  saveStoreBrandingDraft: (draft: Partial<StoreBrandingDraft>) => Promise<void>;
};

const normalizePhone = (phone?: string | null) => (phone || '').replace(/\D/g, '').slice(-10);

const getDocUploaded = (value: any) =>
  Boolean(
    value?.uploaded ||
      value?.contentType ||
      value?.data ||
      value?.uri ||
      value?.url ||
      (typeof value === 'string' && value.trim().length),
  );

const getCompletionFromState = ({
  merchant,
  personalDocumentDraft,
  businessDocumentDraft,
  shopDraft,
  storeBrandingDraft,
}: {
  merchant: Merchant | null;
  personalDocumentDraft: PersonalDocumentDraft;
  businessDocumentDraft: BusinessDocumentDraft;
  shopDraft: ShopDraft;
  storeBrandingDraft: StoreBrandingDraft;
}) => {
  const isProfileComplete = Boolean(merchant?.name && merchant?.gender && merchant?.city && merchant?.phone);
  const isPersonalDocsComplete = Boolean(personalDocumentDraft.uploaded);
  const isBusinessDocsComplete = Boolean(businessDocumentDraft.certificateId);
  const isStoreSetupComplete = Boolean(
    shopDraft.shopName &&
      shopDraft.categoryId &&
      shopDraft.address &&
      shopDraft.city &&
      shopDraft.phone &&
      storeBrandingDraft.description,
  );

  const completedSections = [
    isProfileComplete,
    isPersonalDocsComplete,
    isBusinessDocsComplete,
    isStoreSetupComplete,
  ].filter(Boolean).length;

  const setupProgress = Math.round((completedSections / 4) * 100);
  const nextSetupRoute = !isPersonalDocsComplete
    ? 'MerchantOnBoarding'
    : !isProfileComplete
      ? 'EditProfile'
      : !isBusinessDocsComplete
        ? 'BusinessDocumentation'
        : !isStoreSetupComplete
          ? 'ShopDetails'
          : null;

  return {
    setupProgress,
    nextSetupRoute,
    isComplete: Boolean(
      isProfileComplete &&
        isPersonalDocsComplete &&
        isBusinessDocsComplete &&
        isStoreSetupComplete,
    ),
  };
};

const defaultPersonalDocumentDraft: PersonalDocumentDraft = {
  documentType: 'Aadhaar',
  documentNumber: '',
  documentFile: null,
  panName: '',
  dob: '',
  uploaded: false,
  kycStatus: '',
};

const defaultBusinessDocumentDraft: BusinessDocumentDraft = {
  selectedDocType: 'GST Certificate',
  certificateId: '',
  uploadedFile: null,
  uploaded: false,
};

const defaultShopDraft: ShopDraft = {
  shopName: '',
  categoryId: '',
  category: 'Restaurant',
  subCategory: 'Fast Food',
  address: '',
  address1: '',
  city: '',
  phone: '',
};

const defaultStoreBrandingDraft: StoreBrandingDraft = {
  logo: null,
  banner: null,
  description: '',
  logoUploaded: false,
  bannerUploaded: false,
};

export const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [personalDocumentDraft, setPersonalDocumentDraft] = useState(defaultPersonalDocumentDraft);
  const [businessDocumentDraft, setBusinessDocumentDraft] = useState(defaultBusinessDocumentDraft);
  const [shopDraft, setShopDraft] = useState(defaultShopDraft);
  const [storeBrandingDraft, setStoreBrandingDraft] = useState(defaultStoreBrandingDraft);
  const [hasProfileSynced, setHasProfileSynced] = useState(false);

  useEffect(() => {
    let didHydrate = false;
    const hydrationFallback = setTimeout(() => {
      if (!didHydrate) {
        setIsHydrated(true);
      }
    }, 2500);

    const loadState = async () => {
      try {
        const storedState = await AsyncStorage.getItem(STORAGE_KEY);

        if (storedState) {
          const parsed = JSON.parse(storedState);
          setAuthToken(parsed.authToken || null);
          setMerchant(parsed.merchant || null);
          setPersonalDocumentDraft({ ...defaultPersonalDocumentDraft, ...(parsed.personalDocumentDraft || {}) });
          setBusinessDocumentDraft({ ...defaultBusinessDocumentDraft, ...(parsed.businessDocumentDraft || {}) });
          setShopDraft({ ...defaultShopDraft, ...(parsed.shopDraft || {}) });
          setStoreBrandingDraft({ ...defaultStoreBrandingDraft, ...(parsed.storeBrandingDraft || {}) });
        }
      } catch (error) {
        console.log('Failed to hydrate app state', error);
      } finally {
        didHydrate = true;
        clearTimeout(hydrationFallback);
        setIsHydrated(true);
      }
    };

    loadState();

    return () => {
      clearTimeout(hydrationFallback);
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        authToken,
        merchant,
        personalDocumentDraft,
        businessDocumentDraft,
        shopDraft,
        storeBrandingDraft,
      }),
    ).catch((error) => console.log('Failed to persist app state', error));
  }, [isHydrated, authToken, merchant, personalDocumentDraft, businessDocumentDraft, shopDraft, storeBrandingDraft]);

  const applyProfileData = useCallback((response: any, fallbackMerchant?: Merchant) => {
    const profile = response?.profile || {};
    const merchantFromProfile = profile?.merchant || response?.merchant || fallbackMerchant || null;
    const personal = profile?.personalDocuments || {};
    const business = profile?.businessDocuments || {};
    const shop = profile?.shop || {};

    const hasAadhaar = getDocUploaded(personal?.aadharImage || personal?.aadhaarImage);
    const hasPanPersonal = getDocUploaded(personal?.panImage);
    const hasAnyPersonalDoc = hasAadhaar || hasPanPersonal;

    const hasGst = getDocUploaded(business?.gstImage);
    const hasTrade = getDocUploaded(business?.tradeLicenseImage);
    const hasShopRegistration = getDocUploaded(business?.shopRegistrationImage);
    const hasFssai = getDocUploaded(business?.fssaiImage);
    const hasPanBusiness = getDocUploaded(business?.panImage);
    const hasAnyBusinessDoc = hasGst || hasTrade || hasShopRegistration || hasFssai || hasPanBusiness;

    const syncedMerchant: Merchant | null = merchantFromProfile
      ? {
          ...(fallbackMerchant || {}),
          ...merchantFromProfile,
          phone: normalizePhone(merchantFromProfile?.phone) || normalizePhone(fallbackMerchant?.phone),
        }
      : fallbackMerchant || null;

    const nextPersonalDraft: PersonalDocumentDraft = {
      documentType: hasPanPersonal ? 'PAN' : 'Aadhaar',
      documentNumber: hasPanPersonal
        ? (personal?.panNumber || '')
        : (personal?.aadharNumber || personal?.aadhaarNumber || ''),
      documentFile: null,
      panName: syncedMerchant?.name || '',
      dob: '',
      uploaded: hasAnyPersonalDoc,
      kycStatus: hasAnyPersonalDoc ? 'uploaded' : '',
    };

    const nextBusinessDraft: BusinessDocumentDraft = {
      selectedDocType: hasGst
        ? 'GST Certificate'
        : hasTrade
          ? 'Trade License'
          : hasShopRegistration
            ? 'Shop Registration'
            : hasFssai
              ? 'FSSAI License'
              : hasPanBusiness
                ? 'PAN'
                : 'GST Certificate',
      certificateId:
        business?.gstNumber ||
        business?.tradeLicenseNumber ||
        business?.shopRegistrationNumber ||
        business?.fssaiNumber ||
        business?.panNumber ||
        '',
      uploadedFile: null,
      uploaded: hasAnyBusinessDoc,
    };

    const nextShopDraft: ShopDraft = {
      ...defaultShopDraft,
      shopName: shop?.shopName || '',
      categoryId: shop?.categoryId || '',
      category: shop?.category || defaultShopDraft.category,
      subCategory: shop?.subCategory || defaultShopDraft.subCategory,
      address: shop?.address || '',
      address1: shop?.address1 || '',
      city: shop?.city || '',
      phone: normalizePhone(shop?.phone) || normalizePhone(syncedMerchant?.phone),
      latitude: typeof shop?.latitude === 'number' ? shop.latitude : undefined,
      longitude: typeof shop?.longitude === 'number' ? shop.longitude : undefined,
    };

    const nextStoreBrandingDraft: StoreBrandingDraft = {
      logo: null,
      banner: null,
      description: shop?.description || '',
      logoUploaded: getDocUploaded(shop?.logo),
      bannerUploaded: getDocUploaded(shop?.banner),
    };

    setMerchant(syncedMerchant);
    setPersonalDocumentDraft(nextPersonalDraft);
    setBusinessDocumentDraft({
      ...nextBusinessDraft,
      ...(hasAnyBusinessDoc ? {} : { certificateId: '' }),
    });
    setShopDraft(nextShopDraft);
    setStoreBrandingDraft(nextStoreBrandingDraft);

    return getCompletionFromState({
      merchant: syncedMerchant,
      personalDocumentDraft: nextPersonalDraft,
      businessDocumentDraft: {
        ...nextBusinessDraft,
        ...(hasAnyBusinessDoc ? {} : { certificateId: '' }),
      },
      shopDraft: nextShopDraft,
      storeBrandingDraft: nextStoreBrandingDraft,
    });
  }, []);

  const syncProfileFromApi = useCallback(
    async (token: string, fallbackMerchant?: Merchant) => {
      try {
        const response = await fetchUnifiedProfileRequest(token);
        return applyProfileData(response, fallbackMerchant);
      } catch (error) {
        const fallback: Merchant | null = fallbackMerchant || merchant;
        return getCompletionFromState({
          merchant: fallback,
          personalDocumentDraft,
          businessDocumentDraft,
          shopDraft,
          storeBrandingDraft,
        });
      }
    },
    [
      applyProfileData,
      merchant,
      personalDocumentDraft,
      businessDocumentDraft,
      shopDraft,
      storeBrandingDraft,
    ],
  );

  const setSession = useCallback(async (token: string, nextMerchant: Merchant) => {
    setAuthToken(token);
    setMerchant(nextMerchant);
    const result = await syncProfileFromApi(token, nextMerchant);
    setHasProfileSynced(true);
    return {
      isComplete: result.isComplete,
      nextRoute: result.nextSetupRoute,
    };
  }, [syncProfileFromApi]);

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    setMerchant(null);
    setPersonalDocumentDraft(defaultPersonalDocumentDraft);
    setBusinessDocumentDraft(defaultBusinessDocumentDraft);
    setShopDraft(defaultShopDraft);
    setStoreBrandingDraft(defaultStoreBrandingDraft);
    setHasProfileSynced(false);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateMerchant = useCallback(async (nextMerchant: Merchant) => {
    setMerchant(nextMerchant);
  }, []);

  const savePersonalDocumentDraft = useCallback(async (draft: Partial<PersonalDocumentDraft>) => {
    setPersonalDocumentDraft((prev) => ({ ...prev, ...draft }));
  }, []);

  const saveBusinessDocumentDraft = useCallback(async (draft: Partial<BusinessDocumentDraft>) => {
    setBusinessDocumentDraft((prev) => ({ ...prev, ...draft }));
  }, []);

  const saveShopDraft = useCallback(async (draft: Partial<ShopDraft>) => {
    setShopDraft((prev) => ({ ...prev, ...draft }));
  }, []);

  const saveStoreBrandingDraft = useCallback(async (draft: Partial<StoreBrandingDraft>) => {
    setStoreBrandingDraft((prev) => ({ ...prev, ...draft }));
  }, []);
  useEffect(() => {
    if (!isHydrated || !authToken || hasProfileSynced) {
      return;
    }
    syncProfileFromApi(authToken).finally(() => setHasProfileSynced(true));
  }, [isHydrated, authToken, hasProfileSynced, syncProfileFromApi]);

  const { setupProgress, nextSetupRoute } = getCompletionFromState({
    merchant,
    personalDocumentDraft,
    businessDocumentDraft,
    shopDraft,
    storeBrandingDraft,
  });

  const value = useMemo<AppContextValue>(
    () => ({
      isHydrated,
      authToken,
      merchant,
      personalDocumentDraft,
      businessDocumentDraft,
      shopDraft,
      storeBrandingDraft,
      setupProgress,
      nextSetupRoute,
      setSession,
      clearSession,
      updateMerchant,
      savePersonalDocumentDraft,
      saveBusinessDocumentDraft,
      saveShopDraft,
      saveStoreBrandingDraft,
    }),
    [
      isHydrated,
      authToken,
      merchant,
      personalDocumentDraft,
      businessDocumentDraft,
      shopDraft,
      storeBrandingDraft,
      setupProgress,
      nextSetupRoute,
      setSession,
      clearSession,
      updateMerchant,
      savePersonalDocumentDraft,
      saveBusinessDocumentDraft,
      saveShopDraft,
      saveStoreBrandingDraft,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
};
