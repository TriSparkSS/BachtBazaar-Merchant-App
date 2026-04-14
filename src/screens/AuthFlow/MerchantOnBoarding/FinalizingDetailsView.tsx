import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    StyleSheet,
    Text,
    View,
    ToastAndroid,
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
import { useAppContext } from '../../../context/AppContext';
import { updateMerchantShopRequest } from '../../../services/merchantApi';

const { width } = Dimensions.get('window');

const FinalizingDetailsView = () => {
    const navigation = useNavigation<any>();
    const { authToken, merchant, shopDraft, storeBrandingDraft, saveStoreBrandingDraft, updateMerchant } = useAppContext();

    const [logo, setLogo] = useState<any>(storeBrandingDraft.logo);
    const [banner, setBanner] = useState<any>(storeBrandingDraft.banner);
    const [description, setDescription] = useState(storeBrandingDraft.description);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pickLogo = async () => {
        try {
            const [file] = await pick({ type: [types.images], copyTo: 'cachesDirectory' });
            const pickedFile: any = file;
            const normalizedFile = { ...pickedFile, uri: pickedFile.fileCopyUri || pickedFile.uri };
            setLogo(normalizedFile);
            saveStoreBrandingDraft({ logo: normalizedFile });
        } catch (err) {
            if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                // Cancelled
            } else {
                throw err;
            }
        }
    };

    const pickBanner = async () => {
        try {
            const [file] = await pick({ type: [types.images], copyTo: 'cachesDirectory' });
            const pickedFile: any = file;
            const normalizedFile = { ...pickedFile, uri: pickedFile.fileCopyUri || pickedFile.uri };
            setBanner(normalizedFile);
            saveStoreBrandingDraft({ banner: normalizedFile });
        } catch (err) {
            if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                // Cancelled
            } else {
                throw err;
            }
        }
    };

    const handleFinishSetup = async () => {
        if (!authToken) {
            Alert.alert('Session expired', 'Please log in again.');
            return;
        }

        const normalizedDescription = description.trim();
        const logoUri = (logo as any)?.uri;
        const bannerUri = (banner as any)?.uri;
        const fallbackPhone = shopDraft.phone || merchant?.phone || '';

        if (
            !shopDraft.shopName ||
            !shopDraft.categoryId ||
            !shopDraft.address ||
            !shopDraft.city ||
            !fallbackPhone ||
            !normalizedDescription ||
            !logoUri ||
            !bannerUri
        ) {
            Alert.alert('Incomplete details', 'Please complete shop details, description, logo image and banner image.');
            return;
        }

        try {
            setIsSubmitting(true);
            await saveStoreBrandingDraft({ logo, banner, description: normalizedDescription });

            const response = await updateMerchantShopRequest({
                token: authToken,
                shopName: shopDraft.shopName,
                categoryId: shopDraft.categoryId,
                address: shopDraft.address,
                city: shopDraft.city,
                phone: fallbackPhone,
                description: normalizedDescription,
                logoImage: logo,
                shopBannerImage: banner,
            });

            if (response?.merchant) {
                await updateMerchant(response.merchant);
            }

            if (Platform.OS === 'android') {
                ToastAndroid.show('Shop setup completed successfully', ToastAndroid.SHORT);
            } else {
                Alert.alert('Success', 'Shop setup completed successfully');
            }

            navigation.navigate('MainStack', {
                screen: 'BottomStack',
                params: {
                    screen: 'ProfileScreen',
                },
            });
        } catch (error: any) {
            Alert.alert('Shop update failed', error?.message || 'Unable to save shop details right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const OpeningHoursRow = ({ day, status, open, close }: any) => (
        <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>{day}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status === 'Open' ? '#FFF7ED' : '#F1F5F9' }]}>
                <Text style={[styles.statusText, { color: status === 'Open' ? colors.orange : colors.lightGray }]}>{status}</Text>
            </View>
            <Text style={styles.hoursTime}>{open}</Text>
            <Text style={styles.hoursTime}>{close}</Text>
        </View>
    );

    const docItems = [
        { title: 'GST Certificate', subtitle: 'Max size 5MB (PDF, JPG)', icon: 'file-document-outline' },
        { title: 'Trade License', subtitle: 'Valid till current year', icon: 'file-certificate-outline' },
        { title: 'Shop Registration', subtitle: 'Gumasta or equivalent', icon: 'storefront-outline' },
        { title: 'FSSAI License', subtitle: 'Required for food merchants', icon: 'silverware-variant' },
    ];

    return (
        <SafeAreaView style={[styles.container, { paddingTop: safeTop }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                    <Feather name="arrow-left" size={24} color={colors.darkGray} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Store Setup</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Progress Bar Section */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressTextRow}>
                        <Text style={styles.progressLabel}>Finalizing Details</Text>
                        <Text style={styles.stepLabel}>Step 3 of 3</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '100%' }]} />
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.title}>Finalizing Details</Text>
                    <Text style={styles.subtitle}>
                        Help customers recognize your brand by uploading your visual identity and setting your availability.
                    </Text>

                    {/* Logo Upload Section */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionLabel}>Upload Shop Logo</Text>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                {logo ? (
                                    <Image source={{ uri: logo.uri }} style={styles.logoImage} />
                                ) : (
                                    <Image 
                                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
                                        style={styles.logoImage} 
                                    />
                                )}
                            </View>
                            <Text style={styles.uploadHint}>Recommended: 500×500px PNG or JPG</Text>
                            <TouchableOpacity style={styles.uploadButton} onPress={pickLogo}>
                                <Feather name="info" size={16} color="#3B82F6" />
                                <Text style={styles.uploadButtonText}>Upload logo here</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Banner Upload Section */}
                    <View style={[styles.sectionCard, { marginTop: 20 }]}>
                        <Text style={styles.sectionLabel}>Upload Shop Banner</Text>
                        <TouchableOpacity style={styles.bannerUploadBox} onPress={pickBanner}>
                            {banner ? (
                                <Image source={{ uri: banner.uri }} style={styles.bannerImage} />
                            ) : (
                                <View style={styles.bannerPlaceholder}>
                                    <MaterialCommunityIcons name="image-outline" size={32} color={colors.orange} />
                                    <Text style={styles.bannerPlaceholderText}>ADD BANNER</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <Text style={[styles.uploadHint, { textAlign: 'center', marginTop: 10 }]}>Recommended: 1200×400px</Text>

                        <View style={styles.divider} />

                        <Text style={styles.guidelineLabel}>BANNER GUIDELINES</Text>
                        <View style={styles.guidelineCard}>
                            <Image 
                                source={{ uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100' }} 
                                style={styles.guidelineImg} 
                            />
                            <MaterialCommunityIcons name="checkbox-marked" size={20} color="#10B981" />
                            <View>
                                <Text style={styles.guidelineTitle}>Use full shop view</Text>
                                <Text style={styles.guidelineSub}>(1200px xx-wide)</Text>
                            </View>
                        </View>
                        <View style={styles.guidelineCard}>
                            <Image 
                                source={{ uri: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100' }} 
                                style={styles.guidelineImg} 
                            />
                            <MaterialCommunityIcons name="checkbox-marked" size={20} color="#10B981" />
                            <View>
                                <Text style={styles.guidelineTitle}>Use landscape photo</Text>
                                <Text style={styles.guidelineSub}>(1200px xx-wide)</Text>
                            </View>
                        </View>

                        <Text style={styles.comparisonLabel}>BEFORE <Text style={{ color: colors.lightGray }}>vs</Text> AFTER</Text>
                        <View style={styles.comparisonRow}>
                            <View style={styles.compareItem}>
                                <View style={styles.compareImgBox}>
                                    <Image 
                                        source={{ uri: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200' }} 
                                        style={styles.compareImg} 
                                    />
                                    <View style={[styles.compareBadge, { backgroundColor: '#EF4444' }]}>
                                        <Feather name="x" size={12} color="white" />
                                    </View>
                                </View>
                                <View style={styles.compareLabelRow}>
                                    <MaterialCommunityIcons name="cancel" size={14} color="#EF4444" />
                                    <Text style={styles.compareLabelText}>Blurry / Zoomed image</Text>
                                </View>
                            </View>
                            <View style={styles.compareItem}>
                                <View style={styles.compareImgBox}>
                                    <Image 
                                        source={{ uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200' }} 
                                        style={styles.compareImg} 
                                    />
                                    <View style={[styles.compareBadge, { backgroundColor: '#10B981' }]}>
                                        <Feather name="check" size={12} color="white" />
                                    </View>
                                </View>
                                <View style={styles.compareLabelRow}>
                                    <MaterialCommunityIcons name="check-circle-outline" size={14} color="#10B981" />
                                    <Text style={styles.compareLabelText}>Clear full shop image</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.viewExampleBtn}>
                            <Text style={styles.viewExampleText}>View Example</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Store Description Section */}
                    <View style={styles.descriptionCard}>
                        <Text style={styles.sectionLabel}>Store Description</Text>
                        <View style={styles.descInputBox}>
                            <TextInput 
                                style={styles.descInput} 
                                placeholder="Tell your customers about your shop, the products you sell, and your brand story..."
                                multiline
                                value={description}
                                onChangeText={(value) => {
                                    setDescription(value);
                                    saveStoreBrandingDraft({ description: value });
                                }}
                            />
                        </View>
                    </View>

                    {/* Opening Hours Section */}
                    <View style={styles.hoursHeader}>
                        <Feather name="clock" size={18} color={colors.orange} />
                        <Text style={styles.hoursHeaderText}>Opening Hours</Text>
                    </View>
                    <View style={styles.hoursTable}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, { width: '25%' }]}>Day</Text>
                            <Text style={[styles.tableHeaderText, { width: '25%' }]}>Status</Text>
                            <Text style={[styles.tableHeaderText, { width: '25%' }]}>Opening{"\n"}Time</Text>
                            <Text style={[styles.tableHeaderText, { width: '25%' }]}>Closing{"\n"}Time</Text>
                        </View>
                        <OpeningHoursRow day="Monday" status="Open" open="09:00 AM" close="09:00 PM" />
                        <OpeningHoursRow day="Tuesday" status="Open" open="09:00 AM" close="09:00 PM" />
                        <OpeningHoursRow day="Wednesday" status="Open" open="09:00 AM" close="09:00 PM" />
                        <OpeningHoursRow day="Thursday" status="Open" open="09:00 AM" close="09:00 PM" />
                        <OpeningHoursRow day="Friday" status="Open" open="09:00 AM" close="10:00 PM" />
                        <OpeningHoursRow day="Saturday" status="Open" open="10:00 AM" close="11:00 PM" />
                        <OpeningHoursRow day="Sunday" status="Closed" open="—" close="—" />

                        <TouchableOpacity style={styles.editHoursBtn}>
                            <MaterialCommunityIcons name="calendar-edit" size={16} color={colors.orange} />
                            <Text style={styles.editHoursText}>Edit Opening Hours</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Business Documents Summary Section */}
                    <View style={styles.docsSummaryHeader}>
                        <MaterialCommunityIcons name="briefcase-variant" size={20} color={colors.orange} />
                        <Text style={[styles.hoursHeaderText, { marginLeft: 10, flex: 1 }]}>Business Documents</Text>
                        <View style={styles.recommendedBadge}>
                            <Text style={styles.recommendedText}>RECOMMENDED</Text>
                        </View>
                    </View>
                    <View style={styles.docList}>
                        {docItems.map((doc, idx) => (
                            <View key={idx} style={styles.docMiniCard}>
                                <View style={styles.docIconBox}>
                                    <MaterialCommunityIcons name={doc.icon as any} size={20} color={colors.darkGray} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.docTitle}>{doc.title}</Text>
                                    <Text style={styles.docSub}>{doc.subtitle}</Text>
                                </View>
                                <MaterialCommunityIcons name="cloud-upload-outline" size={20} color={colors.orange} />
                            </View>
                        ))}
                    </View>

                    {/* Final Support Banner */}
                    <View style={styles.supportBanner}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.supportTitle}>Need help with documents?</Text>
                            <Text style={styles.supportSub}>Connect with our merchant support team to understand the verification process better.</Text>
                            <TouchableOpacity style={styles.contactBtn}>
                                <Text style={styles.contactBtnText}>Contact Support</Text>
                                <Feather name="external-link" size={14} color={colors.orange} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.supportMascot}>
                             <MaterialCommunityIcons name="headset" size={40} color={colors.orange} style={{ opacity: 0.2 }} />
                        </View>
                    </View>

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.finishBtn}
                    onPress={handleFinishSetup}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.finishBtnText}>Finish Setup</Text>
                    )}
                </TouchableOpacity>
                <Text style={styles.termsText}>By finishing, you agree to our Merchant Terms of Service</Text>
            </View>
        </SafeAreaView>
    );
};

export default FinalizingDetailsView;

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
        color: '#1B202D',
    },
    scrollContent: {
        paddingBottom: 40,
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
    sectionCard: {
        backgroundColor: '#F3F4F640',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1B202D',
        marginBottom: 15,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F1F5F9',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        marginBottom: 12,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    uploadHint: {
        fontSize: 10,
        color: colors.lightGray,
        marginBottom: 15,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F7FF',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 12,
        gap: 8,
    },
    uploadButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3B82F6',
    },
    bannerUploadBox: {
        height: 120,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    bannerPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    bannerPlaceholderText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.darkGray,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 20,
    },
    guidelineLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.darkGray,
        marginBottom: 12,
    },
    guidelineCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        gap: 12,
    },
    guidelineImg: {
        width: 60,
        height: 40,
        borderRadius: 6,
    },
    guidelineTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1B202D',
    },
    guidelineSub: {
        fontSize: 10,
        color: colors.lightGray,
    },
    comparisonLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1B202D',
        marginTop: 15,
        marginBottom: 12,
    },
    comparisonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    compareItem: {
        flex: 1,
    },
    compareImgBox: {
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
    },
    compareImg: {
        width: '100%',
        height: '100%',
    },
    compareBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compareLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    compareLabelText: {
        fontSize: 9,
        color: colors.lightGray,
        fontWeight: '500',
    },
    viewExampleBtn: {
        backgroundColor: '#F1F5F9',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    viewExampleText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.darkGray,
    },
    descriptionCard: {
        backgroundColor: '#F3F4F640',
        borderRadius: 20,
        padding: 16,
        marginTop: 25,
        marginBottom: 25,
    },
    descInputBox: {
        backgroundColor: '#E5E7EB60',
        borderRadius: 12,
        padding: 12,
        minHeight: 120,
    },
    descInput: {
        fontSize: 13,
        color: colors.black,
        textAlignVertical: 'top',
        lineHeight: 18,
    },
    hoursHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    hoursHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1B202D',
        marginLeft: 8,
    },
    hoursTable: {
        backgroundColor: '#F3F4F640',
        borderRadius: 16,
        padding: 12,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        marginBottom: 8,
    },
    tableHeaderText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.lightGray,
        textAlign: 'center',
    },
    hoursRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    hoursDay: {
        width: '25%',
        fontSize: 12,
        fontWeight: '700',
        color: '#1B202D',
    },
    statusBadge: {
        width: '20%',
        paddingVertical: 4,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: '2.5%',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    hoursTime: {
        width: '25%',
        fontSize: 11,
        color: colors.lightGray,
        textAlign: 'center',
    },
    editHoursBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 10,
        gap: 8,
    },
    editHoursText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.orange,
    },
    docsSummaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 15,
    },
    recommendedBadge: {
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    recommendedText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#64748B',
    },
    docList: {
        gap: 12,
    },
    docMiniCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        gap: 12,
    },
    docIconBox: {
        width: 36,
        height: 36,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    docTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1B202D',
    },
    docSub: {
        fontSize: 10,
        color: colors.lightGray,
    },
    supportBanner: {
        backgroundColor: '#F0FDF430',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        marginTop: 30,
        borderWidth: 1,
        borderColor: '#DCFCE730',
    },
    supportTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.orange,
        marginBottom: 6,
    },
    supportSub: {
        fontSize: 12,
        color: '#4B5563',
        lineHeight: 18,
        marginBottom: 15,
    },
    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    contactBtnText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.orange,
    },
    supportMascot: {
        justifyContent: 'center',
        marginLeft: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        paddingHorizontal: 25,
        paddingBottom: 25,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    finishBtn: {
        backgroundColor: colors.orange,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 15,
    },
    finishBtnText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    termsText: {
        fontSize: 10,
        color: colors.lightGray,
        textAlign: 'center',
    },
});
