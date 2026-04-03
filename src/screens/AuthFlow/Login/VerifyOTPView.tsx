import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, InteractionManager, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import Feather from 'react-native-vector-icons/Feather';
import { colors, screenWidth } from '../../../helpers/styles';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import SuccessModal from '../../../components/SuccessModal';
import { navigationRef } from '../../../navigation';

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
    
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(45);
    const [showSuccess, setShowSuccess] = useState(false);

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

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        // Add auto-focus logic if needed
    };

    const handleVerify = () => {
        if (flow === 'signup') {
            navigation.navigate('SecureAccount', { phoneNumber });
        } else {
            setShowSuccess(true);
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
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            style={styles.otpInput}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(val) => handleOtpChange(val, index)}
                        />
                    ))}
                </View>

                {/* Verify Button */}
                <TouchableOpacity style={styles.primaryButton} onPress={handleVerify}>
                    <Text style={styles.primaryButtonText}>Verify</Text>
                </TouchableOpacity>

                {/* Resend Section */}
                <View style={styles.resendContainer}>
                    <Text style={styles.resendLabel}>Didn't receive the code?</Text>
                    <TouchableOpacity disabled={timer > 0}>
                        <Text style={[styles.resendText, timer > 0 && styles.timerActive]}>
                            Resend Code in {formatTime(timer)}
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
