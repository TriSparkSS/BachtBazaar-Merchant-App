import { API_BASE_URL } from '../config/api';

type RequestOptions = {
  method?: string;
  body?: any;
  token?: string | null;
  isFormData?: boolean;
};

const API_DEBUG = true;

const buildUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const getDebugBody = (body: any, isFormData: boolean) => {
  if (!body) {
    return null;
  }

  if (!isFormData) {
    return body;
  }

  if (typeof body?._parts?.map === 'function') {
    return body._parts.map(([key, value]: [string, any]) => ({
      key,
      value:
        value && typeof value === 'object' && 'uri' in value
          ? {
              uri: value.uri,
              name: value.name,
              type: value.type,
            }
          : value,
    }));
  }

  return '[form-data]';
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, token, isFormData = false } = options;
  const url = buildUrl(path);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (API_DEBUG) {
    console.log('[API REQUEST]', {
      url,
      method,
      headers,
      body: getDebugBody(body, isFormData),
      isFormData,
    });
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });

    const rawText = await response.text();
    let data: any = {};

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch (parseError) {
      data = { rawText };
      if (API_DEBUG) {
        console.log('[API PARSE ERROR]', {
          url,
          method,
          parseError,
          rawText,
        });
      }
    }

    if (API_DEBUG) {
      console.log('[API RESPONSE]', {
        url,
        method,
        status: response.status,
        ok: response.ok,
        data,
      });
    }

    if (!response.ok || data?.success === false) {
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      if (API_DEBUG) {
        console.log('[API ERROR RESPONSE]', {
          url,
          method,
          status: response.status,
          data,
          errorMessage,
        });
      }
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error: any) {
    if (API_DEBUG) {
      console.log('[API NETWORK ERROR]', {
        url,
        method,
        message: error?.message,
        error,
      });
    }
    throw error;
  }
};

const normalizeUploadUri = (file: any): string | undefined => {
  const rawUri = file?.fileCopyUri || file?.uri || file?.path;
  if (!rawUri || typeof rawUri !== 'string') {
    return undefined;
  }

  if (rawUri.startsWith('content://') || rawUri.startsWith('file://') || rawUri.startsWith('http')) {
    return rawUri;
  }

  if (rawUri.startsWith('/')) {
    return `file://${rawUri}`;
  }

  return rawUri;
};

export const createFilePart = (file: any, fallbackName: string) => ({
  uri: normalizeUploadUri(file),
  type: file?.type || 'application/octet-stream',
  name: file?.name || fallbackName,
});
