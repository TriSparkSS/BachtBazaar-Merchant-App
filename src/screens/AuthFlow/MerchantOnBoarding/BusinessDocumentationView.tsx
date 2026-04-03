import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    SafeAreaView,
    TextInput,
    ScrollView,
    Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { colors, fonts, safeTop } from '../../../helpers/styles';
import { useNavigation } from '@react-navigation/native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';

const { width } = Dimensions.get('window');

const BusinessDocumentationView = () => {
    const navigation = useNavigation<any>();
    
    const [selectedDocType, setSelectedDocType] = useState('GST Certificate');
    const [certificateId, setCertificateId] = useState('GSTIN98273412B');
    const [uploadedFile, setUploadedFile] = useState<any>({ name: 'certificate_file_01.pdf' });

    const docOptions = [
        { id: 'gst', title: 'GST Certificate', subtitle: 'Max size 5MB (PDF, JPG)', icon: 'file-document-outline' },
        { id: 'trade', title: 'Trade License', subtitle: 'Valid till current year', icon: 'file-certificate-outline' },
        { id: 'shop', title: 'Shop Registration', subtitle: 'Gumasta or equivalent', icon: 'storefront-outline' },
        { id: 'fssai', title: 'FSSAI License', subtitle: 'Required for food merchants', icon: 'silverware-variant' },
    ];

    const pickDocument = async () => {
        try {
            const [res] = await pick({
                type: [types.pdf, types.images],
            });
            setUploadedFile(res);
        } catch (err) {
            if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                // User cancelled the picker
            } else {
                throw err;
            }
        }
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: safeTop }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                    <Feather name="arrow-left" size={24} color={colors.darkGray} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Documentation</Text>
                <TouchableOpacity style={styles.headerIcon}>
                    <MaterialCommunityIcons name="help-circle-outline" size={24} color={colors.darkGray} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Progress Bar Section */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressTextRow}>
                        <Text style={styles.progressLabel}>Business Documents</Text>
                        <Text style={styles.stepLabel}>Step 1 of 3</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '33%' }]} />
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.title}>Document Verification</Text>
                    <Text style={styles.subtitle}>
                        Complete your merchant profile by verifying your business documents. This helps us ensure a secure marketplace for all users.
                    </Text>

                    {/* Business Documents Header */}
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="briefcase-variant" size={20} color={colors.orange} />
                        <Text style={styles.sectionTitle}>Business Documents</Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        <Text style={styles.inputLabel}>Select Document Type</Text>
                        <View style={styles.dropdown}>
                            <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.darkGray} style={{ marginRight: 10 }} />
                            <Text style={styles.dropdownText}>{selectedDocType || 'GST Certificate'}</Text>
                            <Feather name="chevron-down" size={20} color={colors.darkGray} />
                        </View>

                        {/* Document Options List */}
                        <View style={styles.optionsList}>
                            {docOptions.map((opt) => (
                                <TouchableOpacity 
                                    key={opt.id} 
                                    style={[styles.optionItem, selectedDocType === opt.title && styles.activeOption]}
                                    onPress={() => setSelectedDocType(opt.title)}
                                >
                                    <View style={styles.optionIconBox}>
                                        <MaterialCommunityIcons name={opt.icon as any} size={22} color={colors.darkGray} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.optionTitle}>{opt.title}</Text>
                                        <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Certificate ID Number</Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="card-text-outline" size={22} color={colors.lightGray} />
                            <TextInput
                                style={styles.input}
                                value={certificateId}
                                onChangeText={setCertificateId}
                                placeholder="Enter ID number"
                            />
                        </View>

                        {/* Upload Success Status */}
                        {uploadedFile && (
                            <View style={styles.successCard}>
                                <View style={styles.successIconBox}>
                                    <MaterialCommunityIcons name="file-document" size={24} color="#15803d" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.successTitle}>Document uploaded successfully</Text>
                                    <Text style={styles.successFilename}>{uploadedFile.name}</Text>
                                </View>
                                <TouchableOpacity onPress={pickDocument}>
                                    <Text style={styles.changeFileText}>Change{"\n"}File</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Support Card */}
                    <TouchableOpacity style={styles.supportCard}>
                        <View style={styles.supportContent}>
                            <Text style={styles.supportTitle}>Need help with documents?</Text>
                            <Text style={styles.supportSubtitle}>
                                Our support team is available 24/7 to guide you through verification.
                            </Text>
                            <View style={styles.contactLink}>
                                <Text style={styles.contactText}>Contact Support</Text>
                                <Feather name="external-link" size={14} color={colors.orange} />
                            </View>
                        </View>
                        <Image 
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
                            style={styles.supportMascot} 
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.draftButton}>
                    <Text style={styles.draftButtonText}>Save Draft</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.continueButton}
                    onPress={() => navigation.navigate('ShopDetails')}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color={colors.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default BusinessDocumentationView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerIcon: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.darkGray,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        color: colors.orange,
        fontWeight: '600',
    },
    stepLabel: {
        fontSize: 12,
        color: colors.lightGray,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#FFE5D4',
        borderRadius: 3,
    },
    progressBarFill: {
        height: 6,
        backgroundColor: colors.orange,
        borderRadius: 3,
    },
    content: {
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.black,
        marginTop: 10,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 13,
        color: colors.lightGray,
        lineHeight: 18,
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.darkGray,
        marginLeft: 8,
    },
    formCard: {
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.darkGray,
        marginBottom: 10,
        marginTop: 5,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1D5DB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    dropdownText: {
        flex: 1,
        fontSize: 15,
        color: colors.darkGray,
        fontWeight: '600',
    },
    optionsList: {
        marginBottom: 25,
        gap: 12,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    activeOption: {
        borderColor: colors.orange,
    },
    optionIconBox: {
        width: 40,
        height: 40,
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    optionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1B202D',
    },
    optionSubtitle: {
        fontSize: 11,
        color: colors.lightGray,
        marginTop: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 56,
        marginBottom: 20,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: colors.black,
        fontWeight: '600',
    },
    successCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#86EFAC',
    },
    successIconBox: {
        width: 44,
        height: 44,
        backgroundColor: '#15803d20',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    successTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#15803d',
    },
    successFilename: {
        fontSize: 11,
        color: '#166534',
        marginTop: 2,
    },
    changeFileText: {
        fontSize: 12,
        color: '#15803d',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    supportCard: {
        backgroundColor: '#F0F9FF', // Light blue-ish
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 30,
    },
    supportContent: {
        flex: 1,
        zIndex: 1,
    },
    supportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.orange,
        marginBottom: 6,
    },
    supportSubtitle: {
        fontSize: 12,
        color: '#0369A1',
        lineHeight: 18,
        maxWidth: '85%',
    },
    contactLink: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },
    contactText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.orange,
    },
    supportMascot: {
        width: 80,
        height: 80,
        position: 'absolute',
        right: -10,
        bottom: -10,
        opacity: 0.1,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        justifyContent: 'space-between',
    },
    draftButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 30,
        paddingVertical: 15,
        paddingHorizontal: 25,
        width: '45%',
        alignItems: 'center',
    },
    draftButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.darkGray,
    },
    continueButton: {
        backgroundColor: colors.orange,
        borderRadius: 30,
        paddingVertical: 15,
        paddingHorizontal: 25,
        width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    continueButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.white,
    },
});
