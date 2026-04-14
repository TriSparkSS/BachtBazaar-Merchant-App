import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

let confirmationResult: FirebaseAuthTypes.ConfirmationResult | null = null;
let lastPhoneNumber = '';

export const normalizeIndianPhoneNumber = (rawPhoneNumber: string) => {
  const digits = rawPhoneNumber.replace(/\D/g, '');

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  if (rawPhoneNumber.trim().startsWith('+')) {
    return rawPhoneNumber.trim();
  }

  throw new Error('Please enter a valid 10-digit mobile number.');
};

export const sendPhoneOtp = async (phoneNumber: string, forceResend = false) => {
  const formattedPhoneNumber = normalizeIndianPhoneNumber(phoneNumber);
  confirmationResult = await auth().signInWithPhoneNumber(formattedPhoneNumber, forceResend);
  lastPhoneNumber = formattedPhoneNumber;
  return formattedPhoneNumber;
};

export const verifyPhoneOtp = async (code: string) => {
  if (!confirmationResult) {
    throw new Error('Please request a new OTP and try again.');
  }

  return confirmationResult.confirm(code);
};

export const resendPhoneOtp = async () => {
  if (!lastPhoneNumber) {
    throw new Error('Please enter your phone number again.');
  }

  confirmationResult = await auth().signInWithPhoneNumber(lastPhoneNumber, true);
  return lastPhoneNumber;
};
