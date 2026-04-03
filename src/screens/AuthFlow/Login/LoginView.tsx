import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
// import Feather from 'react-native-vector-icons/Feather';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, screenWidth } from '../../../helpers/styles';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import CallIcon from '../../../assets/icons/call.svg';
import DownArrowIcon from '../../../assets/icons/down-arrow.svg';


const LoginView = () => {
    const navigation = useNavigation<StackNavigationProp<any>>();
    const [activeTab, setActiveTab] = useState<'Login' | 'Sign-up'>('Login');
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleSendOTP = () => {
        navigation.navigate('VerifyOTP', { 
            phoneNumber: '+91 ' + phoneNumber,
            flow: activeTab === 'Sign-up' ? 'signup' : 'login'
        });
    };

    const handleLoginWithPassword = () => {
        navigation.navigate('PasswordLogin', { phoneNumber: '+91 ' + phoneNumber });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
                    <Text style={styles.title}>
                        {activeTab === 'Login' ? 'Login to your Account' : 'Create your Account'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {activeTab === 'Login' 
                            ? 'Enter your phone number to log in' 
                            : 'Enter your phone number to sign up'}
                    </Text>
                </View>

                {/* Main Card */}
                <View style={styles.card}>
                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'Login' && styles.activeTab]}
                            onPress={() => setActiveTab('Login')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Login' && styles.activeTabText]}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'Sign-up' && styles.activeTab]}
                            onPress={() => setActiveTab('Sign-up')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Sign-up' && styles.activeTabText]}>Sign-up</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputWrapper}>
                            {/* Country Selector */}
                            <TouchableOpacity style={styles.countryPicker}>
                                <Text style={styles.flag}>🇮🇳</Text>
                                <Text style={styles.countryCode}>+91</Text>
                                <DownArrowIcon width={12} height={12} fill={colors.lighterGray} />
                               
                            </TouchableOpacity>

                            {/* Divider Line */}
                            <View style={styles.verticalDivider} />

                            {/* Phone Input */}
                            <View style={styles.phoneInputContainer}>
                                <CallIcon width={18} height={18} fill={colors.lighterGray} style={styles.phoneIcon} />
                                <TextInput
                                    placeholder="98765 43210"
                                    placeholderTextColor={colors.lighterGray}
                                    style={styles.input}
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                />
                            </View>
                        </View>

                        {/* Send OTP Button */}
                        <TouchableOpacity style={styles.primaryButton} onPress={handleSendOTP}>
                            <Text style={styles.primaryButtonText}>Send OTP</Text>
                        </TouchableOpacity>

                        {/* Log in with password Button (Hidden in sign-up) */}
                        {activeTab === 'Login' && (
                            <TouchableOpacity style={styles.secondaryButton} onPress={handleLoginWithPassword}>
                                <Text style={styles.secondaryButtonText}>Log in with password</Text>
                            </TouchableOpacity>
                        )}

                        {/* Footer Links */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                By continuing, you agree to our{' '}
                                <Text style={styles.linkText}>Terms of Service</Text> & <Text style={styles.linkText}>Privacy Policy</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default LoginView

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    brandContainer: {
        alignItems: 'center',
        marginTop: 40,
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
        // fontStyle: '',
    },
    header: {
        alignItems: 'center',
        marginBottom: 25,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.black,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.lightGray,
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
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F0F2F5',
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.lighterGray,
    },
    activeTabText: {
        color: colors.orange,
    },
    formSection: {
        width: '100%',
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
        marginBottom: 30,
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
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.black,
    },
    primaryButton: {
        backgroundColor: colors.orange,
        borderRadius: 30,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#FF7D2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
    },
    secondaryButton: {
        backgroundColor: colors.white,
        borderRadius: 30,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.orange,
        marginBottom: 30,
    },
    secondaryButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.orange,
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: colors.lightGray,
        textAlign: 'center',
        lineHeight: 20,
    },
    linkText: {
        color: colors.orange,
        fontWeight: 'bold',
    },
});
