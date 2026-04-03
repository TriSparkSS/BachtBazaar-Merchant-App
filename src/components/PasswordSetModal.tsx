import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Dimensions, Image, Platform } from 'react-native';
import { colors } from '../helpers/styles';
import success from '../assets/icons/success.png';
import lock from '../assets/icons/lock.png';

const { width } = Dimensions.get('window');

interface PasswordSetModalProps {
    visible: boolean;
    onCompleteProfile: () => void;
    onGoToDashboard: () => void;
    /** Required on Android for correct Modal behavior (hardware back). */
    onRequestClose?: () => void;
}

const PasswordSetModal: React.FC<PasswordSetModalProps> = ({
    visible,
    onCompleteProfile,
    onGoToDashboard,
    onRequestClose,
}) => {
    const [step, setStep] = useState<'success' | 'next'>('success');

    useEffect(() => {
        if (visible) {
            setStep('success');
            const timer = setTimeout(() => {
                setStep('next');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    const handleCompleteProfile = () => onCompleteProfile();
    const handleGoToDashboard = () => onGoToDashboard();

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onRequestClose ?? (() => undefined)}
            presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
            statusBarTranslucent={Platform.OS === 'android'}
        >
            <View style={styles.overlay}>
                <View style={styles.modalCard}>
                    {step === 'success' ? (
                        /* Step 1: Password Set Successfully */
                        <>
                            <View style={styles.iconContainer}>
                                <Image source={lock} style={styles.lockIcon} />
                            </View>

                            <Text style={styles.title}>Password Set Successfully!</Text>
                            <Text style={styles.subtitle}>
                                Your account is now secure. You can use your new password to log in.
                            </Text>

                            <TouchableOpacity style={styles.primaryButton} onPress={() => setStep('next')}>
                                <Text style={styles.primaryButtonText}>Continue</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        /* Step 2: What's Next? */
                        <>
                            <View style={styles.iconContainer}>
                                <Image source={success} style={styles.successIcon} />
                            </View>

                            <Text style={styles.title}>What's Next?</Text>
                            <Text style={styles.subtitle}>
                                You're all set. Would you like to view your dashboard or continue completing your business profile?
                            </Text>

                            <TouchableOpacity style={styles.primaryButton} onPress={handleCompleteProfile}>
                                <Text style={styles.primaryButtonText}>Complete Profile</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToDashboard}>
                                <Text style={styles.secondaryButtonText}>Go to Dashboard</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default PasswordSetModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: width * 0.85,
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 15,
    },
    iconContainer: {
        marginBottom: 20,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockIcon: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
    successIcon: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: colors.lightGray,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    primaryButton: {
        backgroundColor: colors.orange,
        borderRadius: 30,
        height: 56,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#FF7D2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
    },
    secondaryButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 30,
        height: 56,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.lightGray,
    },
});
