import { ActivityIndicator, StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, InteractionManager, Platform } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import Feather from 'react-native-vector-icons/Feather';
import { colors, screenWidth } from '../../../helpers/styles';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import SuccessModal from '../../../components/SuccessModal';
import { navigationRef } from '../../../navigation';
import { resendPhoneOtp, verifyPhoneOtp } from '../../../services/firebasePhoneAuth';
import { loginOtpRequest, verifySignupOtpRequest } from '../../../services/authApi';
import { useAppContext } from '../../../context/AppContext';
import { appAlert } from '../../../services/dialogService';

/** Defer navigation until after Modal close / layout (avoids failed transitions). */
const afterModalNavigate = (go: () => void) => {
    InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
            setTimeout(go, Platform.OS === 'android' ? 80 : 0);
        });
    });
};

const VerifyOTPView = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { phoneNumber, flow } = route.params || {};
    const { setSession } = useAppContext();
    
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(45);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const otpInputRef = useRef<TextInput | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleOtpChange = (value: string) => {
        const sanitizedValue = value.replace(/\D/g, '').slice(0, 6);
        setOtp(sanitizedValue);
    };

    const handleVerify = async () => {
        const code = otp;

        if (code.length !== 6) {
            appAlert('Invalid OTP', 'Please enter the 6-digit code sent to your phone.');
            return;
        }

        try {
            setIsVerifying(true);
            const credential = await verifyPhoneOtp(code);
            if (!credential) {
                throw new Error('Unable to verify OTP right now. Please try again.');
            }
            const firebaseIdToken = await credential.user.getIdToken(true);

            if (flow === 'signup') {
                const response = await verifySignupOtpRequest(firebaseIdToken);
                await setSession(response.token, response.merchant);
                navigation.navigate('SecureAccount', {
                    phoneNumber,
                    merchantId: response.merchant._id,
                });
                return;
            }

            if (flow === 'forgot') {
                navigation.navigate('ForgotPasswordReset', {
                    otpToken: firebaseIdToken,
                    phoneNumber,
                });
                return;
            }

            const response = await loginOtpRequest(firebaseIdToken);
            const sessionStatus = await setSession(response.token, response.merchant);
            if (sessionStatus.isComplete) {
                if (!navigationRef.isReady()) {
                    return;
                }
                navigationRef.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'MainStack' }],
                    })
                );
                return;
            }
            setShowSuccess(true);
        } catch (error: any) {
            appAlert('Verification failed', error?.message || 'The OTP is incorrect or expired. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        try {
            setIsResending(true);
            await resendPhoneOtp();
            setOtp('');
            setTimer(45);
        } catch (error: any) {
            appAlert('Resend failed', error?.message || 'Unable to resend OTP right now.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color={colors.orange} />
                </TouchableOpacity>

                {/* Logo & Brand Section */}
                <View style={styles.brandContainer}>
                    <Image
                        source={require('../../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.brandName}>Bacht Bazaar</Text>
                    <Text style={styles.tagline}>“Lets brings yours offers live today”</Text>
                </View>

                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.title}>Check Your Phone</Text>
                    <Text style={styles.subtitle}>
                        We sent a code to <Text style={styles.boldText}>{phoneNumber || '+1 (555) 000-1234'}</Text>. 
                        {"\n"}Please enter the 6-digit verification code below.
                    </Text>
                </View>

                {/* OTP Input Section */}
                <View style={styles.otpContainer}>
                    <TextInput
                        ref={otpInputRef}
                        style={styles.hiddenOtpInput}
                        keyboardType="number-pad"
                        value={otp}
                        onChangeText={handleOtpChange}
                        maxLength={6}
                        autoFocus
                    />
                    {Array.from({ length: 6 }).map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.9}
                            onPress={() => otpInputRef.current?.focus()}
                        >
                            <View style={styles.otpInput}>
                                <Text style={styles.otpDigit}>{otp[index] || ''}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Verify Button */}
                <TouchableOpacity style={styles.primaryButton} onPress={handleVerify} disabled={isVerifying}>
                    {isVerifying ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.primaryButtonText}>Verify</Text>
                    )}
                </TouchableOpacity>

                {/* Resend Section */}
                <View style={styles.resendContainer}>
                    <Text style={styles.resendLabel}>Didn't receive the code?</Text>
                    <TouchableOpacity disabled={timer > 0 || isResending} onPress={handleResend}>
                        <Text style={[styles.resendText, timer > 0 && styles.timerActive]}>
                            {timer > 0 ? `Resend Code in ${formatTime(timer)}` : isResending ? 'Resending...' : 'Resend Code'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Success Modal */}
            <SuccessModal
                visible={showSuccess}
                onClose={() => setShowSuccess(false)}
                onCompleteProfile={() => {
                    setShowSuccess(false);
                    afterModalNavigate(() => {
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'MerchantOnBoarding' }],
                            })
                        );
                    });
                }}
                onGoToDashboard={() => {
                    setShowSuccess(false);
                    afterModalNavigate(() => {
                        if (!navigationRef.isReady()) return;
                        navigationRef.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'MainStack' }],
                            })
                        );
                    });
                }}
            />

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerLabel}>Need help with your account?</Text>
                <TouchableOpacity style={styles.contactRow}>
                    <View style={styles.orangeCircle}>
                        <Feather name="headphones" size={12} color={colors.white} />
                    </View>
                    <Text style={styles.contactText}>Contact us</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default VerifyOTPView

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        paddingBottom: 100,
        alignItems: 'center',
    },
    backButton: {
        alignSelf: 'flex-start',
        marginLeft: 20,
        marginTop: 10,
    },
    brandContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 10,
    },
    brandName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.orange,
    },
    tagline: {
        fontSize: 14,
        color: colors.darkGray,
        marginTop: 5,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.black,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: colors.lightGray,
        textAlign: 'center',
        lineHeight: 24,
    },
    boldText: {
        fontWeight: 'bold',
        color: colors.black,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: screenWidth * 0.85,
        marginBottom: 40,
        position: 'relative',
    },
    hiddenOtpInput: {
        position: 'absolute',
        opacity: 0,
        width: 1,
        height: 1,
    },
    otpInput: {
        width: 50,
        height: 60,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '700',
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpDigit: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.black,
    },
    primaryButton: {
        backgroundColor: colors.orange,
        borderRadius: 30,
        height: 56,
        width: screenWidth * 0.85,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF7D2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 24,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
    },
    resendContainer: {
        alignItems: 'center',
    },
    resendLabel: {
        fontSize: 14,
        color: colors.lightGray,
        marginBottom: 8,
    },
    resendText: {
        fontSize: 14,
        color: colors.orange,
        fontWeight: '600',
    },
    timerActive: {
        color: '#FF7D2F',
        opacity: 0.8,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F2F5',
    },
    footerLabel: {
        fontSize: 14,
        color: colors.lightGray,
        marginBottom: 8,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orangeCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.orange,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    contactText: {
        fontSize: 14,
        color: colors.orange,
        fontWeight: '700',
    },
});
