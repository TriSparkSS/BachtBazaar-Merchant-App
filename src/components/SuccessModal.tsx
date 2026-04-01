import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Dimensions, Image } from 'react-native';
import { colors } from '../helpers/styles';
import success from '../assets/icons/success.png';

const { width } = Dimensions.get('window');

interface SuccessModalProps {
    visible: boolean;
    onClose: () => void;
    onCompleteProfile: () => void;
    onGoToDashboard: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ 
    visible, 
    onClose, 
    onCompleteProfile, 
    onGoToDashboard 
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalCard}>
                    {/* Success Icon */}
                    <View style={styles.iconContainer}>
                        <Image source={success} style={styles.successIcon} />
                    </View>

                    <Text style={styles.title}>What's Next?</Text>
                    <Text style={styles.subtitle}>
                        You're all set. Would you like to view your dashboard or continue completing your business profile?
                    </Text>

                    {/* Action Buttons */}
                    <TouchableOpacity style={styles.primaryButton} onPress={onCompleteProfile}>
                        <Text style={styles.primaryButtonText}>Complete Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={onGoToDashboard}>
                        <Text style={styles.secondaryButtonText}>Go to Dashboard</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default SuccessModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black for blur effect
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
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 15,
    },
    iconContainer: {
        marginBottom: 20,
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
