import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    SafeAreaView,
    TextInput,
    ScrollView,
    Dimensions
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, fonts, safeTop } from '../../../helpers/styles';
import backarrowicon from '../../../assets/icons/backarrow.png';
import { useNavigation } from '@react-navigation/native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { uploadMerchantDocumentsRequest } from '../../../services/merchantApi';
import { useAppContext } from '../../../context/AppContext';

const { width } = Dimensions.get('window');

const MarchantOnBoarding = () => {
    const navigation = useNavigation<any>();
    const { authToken, personalDocumentDraft, savePersonalDocumentDraft } = useAppContext();
    const [documentType, setDocumentType] = useState(personalDocumentDraft.documentType); // 'Aadhaar' or 'PAN'
    const [documentNumber, setDocumentNumber] = useState(personalDocumentDraft.documentNumber);
    const [selectedFile, setSelectedFile] = useState<any>(personalDocumentDraft.documentFile);
    const [panName, setPanName] = useState(personalDocumentDraft.panName || '');
    const [dob, setDob] = useState(personalDocumentDraft.dob || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pickDocument = async () => {
        try {
            const [file] = await pick({
                type: [types.images, types.pdf],
                copyTo: 'cachesDirectory',
            });
            const pickedFile: any = file;

            const normalizedFile = {
                ...pickedFile,
                uri: pickedFile.fileCopyUri || pickedFile.uri,
            };

            setSelectedFile(normalizedFile);
            savePersonalDocumentDraft({ documentFile: normalizedFile });
        } catch (err) {
            if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                // User cancelled the picker
            } else {
                throw err;
            }
        }
    };

    const handleContinue = async () => {
        if (!authToken) {
            Alert.alert('Session expired', 'Please login again to continue onboarding.');
            return;
        }

        if (!documentNumber || !selectedFile?.uri) {
            Alert.alert('Incomplete details', 'Please enter document number and upload a document image.');
            return;
        }

        if (documentType === 'PAN' && (!panName || !dob)) {
            Alert.alert('Incomplete PAN details', 'Please enter PAN holder name and date of birth.');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await uploadMerchantDocumentsRequest({
                token: authToken,
                documentType: documentType as 'Aadhaar' | 'PAN',
                documentNumber,
                documentFile: selectedFile,
                panName,
                dob,
            });

            await savePersonalDocumentDraft({
                documentType: documentType as 'Aadhaar' | 'PAN',
                documentNumber,
                documentFile: selectedFile,
                panName,
                dob,
                uploaded: true,
                kycStatus: response.kycStatus,
            });

            navigation.navigate('EditProfile');
        } catch (error: any) {
            Alert.alert('Upload failed', error?.message || 'Unable to upload personal documents right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: safeTop }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                    <Image source={backarrowicon} style={styles.backIcon} />
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
                        <Text style={styles.progressLabel}>Personal Documents</Text>
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
                        Complete your merchant profile by verifying your identity. This helps us ensure a secure marketplace for all users.
                    </Text>

                    {/* Personal Documents Header */}
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="shield-check" size={20} color={colors.orange} />
                        <Text style={styles.sectionTitle}>Personal Documents</Text>
                    </View>

                    {/* Document Selection Card */}
                    <View style={styles.formCard}>
                        <Text style={styles.inputLabel}>Select Document Type</Text>
                        <View style={styles.radioRow}>
                            <TouchableOpacity
                                style={[
                                    styles.radioButton,
                                    documentType === 'Aadhaar' && styles.radioActive
                                ]}
                                onPress={() => {
                                    setDocumentType('Aadhaar');
                                    savePersonalDocumentDraft({ documentType: 'Aadhaar' });
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={documentType === 'Aadhaar' ? "radiobox-marked" : "radiobox-blank"}
                                    size={20}
                                    color={documentType === 'Aadhaar' ? colors.orange : colors.lightGray}
                                />
                                <Text style={[
                                    styles.radioText,
                                    documentType === 'Aadhaar' && styles.radioTextActive
                                ]}>Aadhaar Card</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.radioButton,
                                    documentType === 'PAN' && styles.radioActive
                                ]}
                                onPress={() => {
                                    setDocumentType('PAN');
                                    savePersonalDocumentDraft({ documentType: 'PAN' });
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={documentType === 'PAN' ? "radiobox-marked" : "radiobox-blank"}
                                    size={20}
                                    color={documentType === 'PAN' ? colors.orange : colors.lightGray}
                                />
                                <Text style={[
                                    styles.radioText,
                                    documentType === 'PAN' && styles.radioTextActive
                                ]}>PAN Card</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>{documentType === 'Aadhaar' ? 'Aadhaar Number' : 'PAN Number'}</Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="card-account-details-outline" size={22} color={colors.lightGray} />
                            <TextInput
                                style={styles.input}
                                placeholder={documentType === 'Aadhaar' ? '123412341234' : 'ABCDE1234F'}
                                placeholderTextColor={colors.lighterGray}
                                value={documentNumber}
                                onChangeText={(value) => {
                                    setDocumentNumber(value);
                                    savePersonalDocumentDraft({ documentNumber: value });
                                }}
                                keyboardType={documentType === 'Aadhaar' ? 'numeric' : 'default'}
                                autoCapitalize={documentType === 'PAN' ? 'characters' : 'none'}
                            />
                        </View>

                        {documentType === 'PAN' && (
                            <>
                                <Text style={styles.inputLabel}>PAN Holder Name</Text>
                                <View style={styles.inputContainer}>
                                    <MaterialCommunityIcons name="account-outline" size={22} color={colors.lightGray} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter name as per PAN"
                                        placeholderTextColor={colors.lighterGray}
                                        value={panName}
                                        onChangeText={(value) => {
                                            setPanName(value);
                                            savePersonalDocumentDraft({ panName: value });
                                        }}
                                    />
                                </View>

                                <Text style={styles.inputLabel}>Date of Birth</Text>
                                <View style={styles.inputContainer}>
                                    <MaterialCommunityIcons name="calendar-month-outline" size={22} color={colors.lightGray} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor={colors.lighterGray}
                                        value={dob}
                                        onChangeText={(value) => {
                                            setDob(value);
                                            savePersonalDocumentDraft({ dob: value });
                                        }}
                                    />
                                </View>
                            </>
                        )}

                        <Text style={styles.inputLabel}>Upload Document Image</Text>
                        <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
                            <View style={styles.uploadIconContainer}>
                                <MaterialCommunityIcons 
                                    name={selectedFile ? "file-check-outline" : "camera-plus-outline"} 
                                    size={28} 
                                    color={selectedFile ? "#10B981" : colors.orange} 
                                />
                            </View>
                            <Text style={styles.uploadTitle}>
                                {selectedFile ? selectedFile.name : "Click to capture or upload"}
                            </Text>
                            <Text style={styles.uploadSubtitle}>
                                {selectedFile ? "Document selected successfully" : "Front and back combined or separate"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.draftButton}>
                    <Text style={styles.draftButtonText}>Save Draft</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <Text style={styles.continueButtonText}>Continue</Text>
                            <MaterialCommunityIcons name="arrow-right" size={20} color={colors.white} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default MarchantOnBoarding;

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
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
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
        backgroundColor: '#E5E7EB',
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
        fontWeight: 'bold',
        color: colors.black,
        marginTop: 10,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: colors.lightGray,
        lineHeight: 20,
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
        borderRadius: 16,
        padding: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.darkGray,
        marginBottom: 10,
        marginTop: 5,
    },
    radioRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        width: '48%',
    },
    radioActive: {
        borderColor: colors.orange,
        backgroundColor: '#FFF7ED',
    },
    radioText: {
        fontSize: 13,
        color: colors.darkGray,
        fontWeight: '500',
        marginLeft: 8,
        maxWidth: '80%',
    },
    radioTextActive: {
        color: colors.orange,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#CBD5E1',
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
    },
    uploadBox: {
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        borderRadius: 16,
        backgroundColor: colors.white,
        paddingVertical: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadIconContainer: {
        marginBottom: 10,
    },
    uploadTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: 4,
    },
    uploadSubtitle: {
        fontSize: 12,
        color: colors.lightGray,
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
