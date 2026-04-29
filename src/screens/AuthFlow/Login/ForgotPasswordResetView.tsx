import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, screenWidth } from '../../../helpers/styles';
import backarrowicon from '../../../assets/icons/backarrow.png';
import { forgotPasswordRequest } from '../../../services/authApi';
import { appAlert } from '../../../services/dialogService';

const ForgotPasswordResetView = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { otpToken } = route.params || {};

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isPasswordStrong = hasMinLength && hasUpperCase && hasSymbol;
  const isConfirmMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = Boolean(otpToken && newPassword && confirmPassword && isPasswordStrong && isConfirmMatch);

  const handleResetPassword = async () => {
    if (!otpToken) {
      appAlert('Session expired', 'Please verify OTP again.');
      return;
    }
    if (newPassword !== confirmPassword) {
      appAlert('Password mismatch', 'New password and confirm password must match.');
      return;
    }
    if (!isPasswordStrong) {
      appAlert('Weak password', 'Please follow all password requirements.');
      return;
    }

    try {
      setIsSubmitting(true);
      await forgotPasswordRequest(otpToken, newPassword);
      appAlert('Success', 'Password reset successfully. Please login with new password.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error: any) {
      appAlert('Reset failed', error?.message || 'Unable to reset password right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={backarrowicon} style={styles.backarrowicon} />
        </TouchableOpacity>

        <View style={styles.brandContainer}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandName}>Bacht Bazaar</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Set your new password after OTP verification.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={colors.lighterGray}
              style={styles.passwordInput}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
              <Feather name={showNewPassword ? 'eye' : 'eye-off'} size={20} color={colors.lighterGray} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={colors.lighterGray}
              style={styles.passwordInput}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color={colors.lighterGray} />
            </TouchableOpacity>
          </View>

          {confirmPassword.length > 0 && !isConfirmMatch ? (
            <Text style={styles.mismatchText}>Confirm password does not match</Text>
          ) : null}

          <View style={styles.requirementsContainer}>
            <View style={styles.requirementRow}>
              <MaterialIcons
                name={hasMinLength ? 'check-circle' : 'radio-button-unchecked'}
                size={18}
                color={hasMinLength ? '#166534' : colors.lighterGray}
              />
              <Text style={[styles.requirementText, hasMinLength && styles.reqValid]}>8+ characters</Text>
            </View>
            <View style={styles.requirementRow}>
              <MaterialIcons
                name={hasUpperCase ? 'check-circle' : 'radio-button-unchecked'}
                size={18}
                color={hasUpperCase ? '#166534' : colors.lighterGray}
              />
              <Text style={[styles.requirementText, hasUpperCase && styles.reqValid]}>1 uppercase letter</Text>
            </View>
            <View style={styles.requirementRow}>
              <MaterialIcons
                name={hasSymbol ? 'check-circle' : 'radio-button-unchecked'}
                size={18}
                color={hasSymbol ? '#166534' : colors.lighterGray}
              />
              <Text style={[styles.requirementText, hasSymbol && styles.reqValid]}>1 symbol (!@#$%)</Text>
            </View>
            <View style={styles.requirementRow}>
              <MaterialIcons
                name={isConfirmMatch ? 'check-circle' : 'radio-button-unchecked'}
                size={18}
                color={isConfirmMatch ? '#166534' : colors.lighterGray}
              />
              <Text style={[styles.requirementText, isConfirmMatch && styles.reqValid]}>Passwords match</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !canSubmit && styles.disabledButton]}
          onPress={handleResetPassword}
          disabled={isSubmitting || !canSubmit}
        >
          {isSubmitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>Reset Password</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPasswordResetView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 10,
  },
  backarrowicon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.orange,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.lightGray,
    textAlign: 'center',
  },
  card: {
    width: screenWidth * 0.9,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    letterSpacing: 2,
  },
  mismatchText: {
    marginTop: -4,
    marginBottom: 8,
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  requirementsContainer: {
    marginTop: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  requirementText: {
    marginLeft: 10,
    fontSize: 12,
    color: colors.darkGray,
    fontWeight: '500',
  },
  reqValid: {
    color: colors.black,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: colors.orange,
    borderRadius: 30,
    height: 56,
    width: screenWidth * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
