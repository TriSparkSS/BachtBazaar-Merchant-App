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
};

type ShopDraft = {
  shopName: string;
  categoryId: string;
  category: string;
  subCategory: string;
  address: string;
  city: string;
  phone: string;
};

type StoreBrandingDraft = {
  logo: StoredFile | null;
  banner: StoredFile | null;
  description: string;
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
  setSession: (token: string, merchant: Merchant) => Promise<void>;
  clearSession: () => Promise<void>;
  updateMerchant: (merchant: Merchant) => Promise<void>;
  savePersonalDocumentDraft: (draft: Partial<PersonalDocumentDraft>) => Promise<void>;
  saveBusinessDocumentDraft: (draft: Partial<BusinessDocumentDraft>) => Promise<void>;
  saveShopDraft: (draft: Partial<ShopDraft>) => Promise<void>;
  saveStoreBrandingDraft: (draft: Partial<StoreBrandingDraft>) => Promise<void>;
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
};

const defaultShopDraft: ShopDraft = {
  shopName: '',
  categoryId: '',
  category: 'Restaurant',
  subCategory: 'Fast Food',
  address: '',
  city: '',
  phone: '',
};

const defaultStoreBrandingDraft: StoreBrandingDraft = {
  logo: null,
  banner: null,
  description: '',
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

  const setSession = useCallback(async (token: string, nextMerchant: Merchant) => {
    setAuthToken(token);
    setMerchant(nextMerchant);
  }, []);

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    setMerchant(null);
    setPersonalDocumentDraft(defaultPersonalDocumentDraft);
    setBusinessDocumentDraft(defaultBusinessDocumentDraft);
    setShopDraft(defaultShopDraft);
    setStoreBrandingDraft(defaultStoreBrandingDraft);
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

  const isProfileComplete = Boolean(merchant?.name && merchant?.gender && merchant?.city && merchant?.phone);
  const isPersonalDocsComplete = Boolean(personalDocumentDraft.uploaded);
  const isBusinessDocsComplete = Boolean(
    businessDocumentDraft.certificateId && businessDocumentDraft.uploadedFile?.name,
  );
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
