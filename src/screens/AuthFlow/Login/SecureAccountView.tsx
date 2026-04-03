import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, SafeAreaView, InteractionManager, Platform } from 'react-native'
import React, { useState } from 'react'
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, screenWidth, safeTop } from '../../../helpers/styles';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { PasswordSetModal } from '../../../components';
import { navigationRef } from '../../../navigation';
import backarrowicon from '../../../assets/icons/backarrow.png'

/** Run after modal hides — StackActions.replace + Modal timing often fails; reset is reliable. */
const afterModalNavigate = (go: () => void) => {
    InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
            setTimeout(go, Platform.OS === 'android' ? 80 : 0);
        });
    });
};

const SecureAccountView = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { phoneNumber } = route.params || {};

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Requirement checks
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const handleSetPassword = () => {
        if (password === confirmPassword && hasMinLength && hasUpperCase && hasSymbol) {
            setShowSuccess(true);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: safeTop }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={backarrowicon} style={styles.backarrowicon} />
                </TouchableOpacity>

                {/* Logo Section */}
                <View style={styles.brandContainer}>
                    <Image
                        source={require('../../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.brandName}>Bacht Bazaar</Text>
                    <Text style={styles.tagline}>“Lets brings yours offers live today”</Text>
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Secure Your Account</Text>
                    <Text style={styles.subtitle}>Choose a strong password to protect your merchant profile.</Text>
                </View>

                {/* Main Card */}
                <View style={styles.card}>
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

                    {/* Confirm Password Field */}
                    <Text style={styles.label}>Confirm Password</Text>
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
                            <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color={colors.lighterGray} />
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

                {/* Set Password Button */}
                <TouchableOpacity 
                    style={[styles.primaryButton, !(password && confirmPassword === password) && styles.disabledButton]} 
                    onPress={handleSetPassword}
                >
                    <Text style={styles.primaryButtonText}>Set Password</Text>
                </TouchableOpacity>
            </ScrollView>

            <PasswordSetModal
                visible={showSuccess}
                onRequestClose={() => setShowSuccess(false)}
                onCompleteProfile={() => {
                    setShowSuccess(false);
                    afterModalNavigate(() => {
                        navigation.navigate('MerchantOnBoarding');
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
        </SafeAreaView>
    )
}

export default SecureAccountView

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
        marginTop: 10,
        marginBottom: 20,
    },
    logo: {
        width: 60,
        height: 60,
        marginBottom: 8,
    },
    brandName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.orange,
    },
    tagline: {
        fontSize: 12,
        color: colors.darkGray,
        marginTop: 2,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.black,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: colors.lightGray,
        textAlign: 'center',
        lineHeight: 20,
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
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        height: 56,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
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
        fontSize: 13,
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
        shadowColor: '#FF7D2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    disabledButton: {
        opacity: 0.6,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
    },
});
