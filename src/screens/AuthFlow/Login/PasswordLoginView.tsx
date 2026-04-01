import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, screenWidth } from '../../../helpers/styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import SuccessModal from '../../../components/SuccessModal';
import CallIcon from '../../../assets/icons/call.svg';
import DownArrowIcon from '../../../assets/icons/down-arrow.svg';
import backarrowicon from '../../../assets/icons/backarrow.png'

const PasswordLoginView = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { phoneNumber } = route.params || {};

    const phoneDisplay = phoneNumber ? phoneNumber.split(' ').pop() : '••••• •••••';

    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Requirement checks (Simulated)
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const handleLogin = () => {
        // Logic for login...
        setShowSuccess(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={backarrowicon} style={styles.backarrowicon} />
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
                    <Text style={styles.title}>Login to your Account</Text>
                    <Text style={styles.subtitle}>Enter your phone number and password to log in</Text>
                </View>

                {/* Main Card */}
                <View style={styles.card}>
                    {/* Phone Number (Read-only or pre-filled) */}
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.inputWrapper}>
                        <View style={styles.countryPicker}>
                            <Text style={styles.flag}>🇮🇳</Text>
                            <Text style={styles.countryCode}>+91</Text>
                            <DownArrowIcon width={12} height={12} fill={colors.lighterGray} />
                        </View>
                        <View style={styles.verticalDivider} />
                        <View style={styles.phoneInputContainer}>
                            <CallIcon width={18} height={18} fill={colors.lighterGray} style={styles.phoneIcon} />
                            <Text style={styles.staticPhoneText}>{phoneDisplay}</Text>
                        </View>
                    </View>

                    {/* Password Field */}
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordInputContainer}>
                        <TextInput
                            placeholder="••••••••"
                            placeholderTextColor={colors.lighterGray}
                            style={styles.passwordInput}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={colors.lighterGray} />
                        </TouchableOpacity>
                    </View>

                    {/* Requirement Checklist */}
                    <View style={styles.requirementsContainer}>
                        <View style={styles.requirementRow}>
                            <MaterialIcons 
                                name={hasMinLength ? "check-circle" : "radio-button-unchecked"} 
                                size={18} 
                                color={hasMinLength ? "#166534" : colors.lighterGray} 
                            />
                            <Text style={[styles.requirementText, hasMinLength && styles.reqValid]}>8+ characters</Text>
                        </View>
                        <View style={styles.requirementRow}>
                            <MaterialIcons 
                                name={hasUpperCase ? "check-circle" : "radio-button-unchecked"} 
                                size={18} 
                                color={hasUpperCase ? "#166534" : colors.lighterGray} 
                            />
                            <Text style={[styles.requirementText, hasUpperCase && styles.reqValid]}>1 uppercase letter</Text>
                        </View>
                        <View style={styles.requirementRow}>
                            <MaterialIcons 
                                name={hasSymbol ? "check-circle" : "radio-button-unchecked"} 
                                size={18} 
                                color={hasSymbol ? "#166534" : colors.lighterGray} 
                            />
                            <Text style={[styles.requirementText, hasSymbol && styles.reqValid]}>1 symbol (!@#$%)</Text>
                        </View>
                    </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                    <Text style={styles.primaryButtonText}>Login</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Success Modal */}
            <SuccessModal
                visible={showSuccess}
                onClose={() => setShowSuccess(false)}
                onCompleteProfile={() => {
                    setShowSuccess(false);
                    // Navigate to profile setup
                }}
                onGoToDashboard={() => {
                    setShowSuccess(false);
                    // Navigate to dashboard
                }}
            />
        </SafeAreaView>
    )
}

export default PasswordLoginView

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
        marginBottom: 25,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.black,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
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
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.darkGray,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        height: 56,
        marginBottom: 20,
        paddingHorizontal: 12,
    },
    countryPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 8,
    },
    flag: {
        fontSize: 18,
        marginRight: 6,
    },
    countryCode: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.black,
        marginRight: 4,
    },
    verticalDivider: {
        width: 1,
        height: '60%',
        backgroundColor: '#E5E7EB',
        marginHorizontal: 12,
    },
    phoneInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneIcon: {
        marginRight: 10,
    },
    staticPhoneText: {
        fontSize: 16,
        color: colors.black,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        height: 56,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    passwordInput: {
        flex: 1,
        fontSize: 18,
        color: colors.black,
        letterSpacing: 2,
    },
    requirementsContainer: {
        marginTop: 10,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    requirementText: {
        marginLeft: 10,
        fontSize: 14,
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
        width: screenWidth * 0.9,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF7D2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginTop: 20,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
    },
});
