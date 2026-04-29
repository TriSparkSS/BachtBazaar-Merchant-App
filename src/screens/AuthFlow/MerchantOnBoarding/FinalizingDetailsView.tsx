import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
import { fetchShopHoursRequest, ShopOpeningHours, updateMerchantShopRequest, updateShopHoursRequest } from '../../../services/merchantApi';
import { appAlert } from '../../../services/dialogService';
import { validateImageUnderOneMb } from '../../../helpers/fileValidation';

const { width } = Dimensions.get('window');

type DayKey = keyof ShopOpeningHours;

const DAY_ORDER: Array<{ key: DayKey; label: string }> = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
];

const DEFAULT_OPENING_HOURS: ShopOpeningHours = {
    monday: { open: '09:00', close: '21:00', isClosed: false },
    tuesday: { open: '09:00', close: '21:00', isClosed: false },
    wednesday: { open: '09:00', close: '21:00', isClosed: false },
    thursday: { open: '09:00', close: '21:00', isClosed: false },
    friday: { open: '09:00', close: '22:00', isClosed: false },
    saturday: { open: '10:00', close: '23:00', isClosed: false },
    sunday: { isClosed: true },
};

const normalizeDay = (day: ShopOpeningHours[DayKey]) => ({
    open: day?.open || '09:00',
    close: day?.close || '21:00',
    isClosed: Boolean(day?.isClosed),
});

const formatDisplayTime = (time?: string) => {
    if (!time) {
        return '—';
    }
    const [hourText, minuteText] = time.split(':');
    const hour = Number(hourText);
    const minute = Number(minuteText);
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
        return time;
    }
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${suffix}`;
};

const FinalizingDetailsView = () => {
    const navigation = useNavigation<any>();
    const { authToken, merchant, shopDraft, storeBrandingDraft, saveStoreBrandingDraft, updateMerchant } = useAppContext();

    const [logo, setLogo] = useState<any>(storeBrandingDraft.logo);
    const [banner, setBanner] = useState<any>(storeBrandingDraft.banner);
    const [description, setDescription] = useState(storeBrandingDraft.description);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openingHours, setOpeningHours] = useState<ShopOpeningHours>(DEFAULT_OPENING_HOURS);
    const [loadingHours, setLoadingHours] = useState(false);
    const [isEditingHours, setIsEditingHours] = useState(false);
    const [isSavingHours, setIsSavingHours] = useState(false);
    const hasExistingLogo = Boolean(storeBrandingDraft.logoUploaded);
    const hasExistingBanner = Boolean(storeBrandingDraft.bannerUploaded);

    useEffect(() => {
        const loadHours = async () => {
            if (!authToken) {
                return;
            }
            try {
                setLoadingHours(true);
                const response = await fetchShopHoursRequest(authToken);
                const apiHours = response?.openingHours;
                if (!apiHours) {
                    return;
                }
                setOpeningHours({
                    monday: normalizeDay(apiHours.monday || DEFAULT_OPENING_HOURS.monday),
                    tuesday: normalizeDay(apiHours.tuesday || DEFAULT_OPENING_HOURS.tuesday),
                    wednesday: normalizeDay(apiHours.wednesday || DEFAULT_OPENING_HOURS.wednesday),
                    thursday: normalizeDay(apiHours.thursday || DEFAULT_OPENING_HOURS.thursday),
                    friday: normalizeDay(apiHours.friday || DEFAULT_OPENING_HOURS.friday),
                    saturday: normalizeDay(apiHours.saturday || DEFAULT_OPENING_HOURS.saturday),
                    sunday: normalizeDay(apiHours.sunday || DEFAULT_OPENING_HOURS.sunday),
                });
            } catch (error) {
                // keep defaults if API fails
            } finally {
                setLoadingHours(false);
            }
        };

        loadHours();
    }, [authToken]);

    const isValidTime = (value?: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value || '');

    const validateOpeningHours = () => {
        for (const dayInfo of DAY_ORDER) {
            const value = openingHours[dayInfo.key];
            if (value.isClosed) {
                continue;
            }
            if (!isValidTime(value.open) || !isValidTime(value.close)) {
                appAlert('Invalid time', `${dayInfo.label} must be in HH:MM format (24-hour), like 09:00 or 21:30.`);
                return false;
            }
        }
        return true;
    };

    const saveOpeningHours = async () => {
        if (!authToken) {
            appAlert('Session expired', 'Please log in again.');
            return false;
        }
        if (!validateOpeningHours()) {
            return false;
        }
        try {
            setIsSavingHours(true);
            await updateShopHoursRequest(authToken, openingHours);
            return true;
        } catch (error: any) {
            appAlert('Hours update failed', error?.message || 'Unable to update opening hours right now.');
            return false;
        } finally {
            setIsSavingHours(false);
        }
    };

    const pickLogo = async () => {
        try {
            const [file] = await pick({ type: [types.images], copyTo: 'cachesDirectory' });
            const pickedFile: any = file;
            const normalizedFile = { ...pickedFile, uri: pickedFile.fileCopyUri || pickedFile.uri };
            const imageValidation = validateImageUnderOneMb(normalizedFile);
            if (!imageValidation.valid) {
                appAlert('Image too large', imageValidation.message);
                return;
            }
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
            const imageValidation = validateImageUnderOneMb(normalizedFile);
            if (!imageValidation.valid) {
                appAlert('Image too large', imageValidation.message);
                return;
            }
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
            appAlert('Session expired', 'Please log in again.');
            return;
        }

        const normalizedDescription = description.trim();
        const logoUri = (logo as any)?.uri;
        const bannerUri = (banner as any)?.uri;
        const fallbackPhone = shopDraft.phone || merchant?.phone || '';
        const hasLogo = Boolean(logoUri) || hasExistingLogo;
        const hasBanner = Boolean(bannerUri) || hasExistingBanner;

        if (
            !shopDraft.shopName ||
            !shopDraft.categoryId ||
            !shopDraft.address ||
            !shopDraft.city ||
            !fallbackPhone ||
            !normalizedDescription ||
            !hasLogo ||
            !hasBanner
        ) {
            appAlert('Incomplete details', 'Please complete shop details, description, logo image and banner image.');
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
                address1: shopDraft.address1 || shopDraft.address,
                city: shopDraft.city,
                phone: fallbackPhone,
                description: normalizedDescription,
                latitude: shopDraft.latitude,
                longitude: shopDraft.longitude,
                logoImage: logo,
                shopBannerImage: banner,
            });

            const isHoursSaved = await saveOpeningHours();
            if (!isHoursSaved) {
                return;
            }

            if (response?.merchant) {
                await updateMerchant(response.merchant);
            }

            if (Platform.OS === 'android') {
                ToastAndroid.show('Shop setup completed successfully', ToastAndroid.SHORT);
            } else {
                appAlert('Success', 'Shop setup completed successfully');
            }

            navigation.navigate('MainStack', {
                screen: 'BottomStack',
                params: {
                    screen: 'ProfileScreen',
                },
            });
        } catch (error: any) {
            appAlert('Shop update failed', error?.message || 'Unable to save shop details right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const OpeningHoursRow = ({ dayKey, day }: { dayKey: DayKey; day: string }) => (
        <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>{day}</Text>
            <TouchableOpacity
                disabled={!isEditingHours}
                style={[
                    styles.statusBadge,
                    { backgroundColor: openingHours[dayKey].isClosed ? '#F1F5F9' : '#FFF7ED' },
                ]}
                onPress={() => {
                    setOpeningHours((prev) => ({
                        ...prev,
                        [dayKey]: {
                            ...prev[dayKey],
                            isClosed: !prev[dayKey].isClosed,
                        },
                    }));
                }}
            >
                <Text style={[styles.statusText, { color: openingHours[dayKey].isClosed ? colors.lightGray : colors.orange }]}>
                    {openingHours[dayKey].isClosed ? 'Closed' : 'Open'}
                </Text>
            </TouchableOpacity>

            {isEditingHours && !openingHours[dayKey].isClosed ? (
                <TextInput
                    value={openingHours[dayKey].open || ''}
                    onChangeText={(value) =>
                        setOpeningHours((prev) => ({
                            ...prev,
                            [dayKey]: { ...prev[dayKey], open: value.replace(/[^\d:]/g, '').slice(0, 5) },
                        }))
                    }
                    placeholder="09:00"
                    keyboardType="numbers-and-punctuation"
                    style={styles.hoursTimeInput}
                />
            ) : (
                <Text style={styles.hoursTime}>
                    {openingHours[dayKey].isClosed ? '—' : formatDisplayTime(openingHours[dayKey].open)}
                </Text>
            )}

            {isEditingHours && !openingHours[dayKey].isClosed ? (
                <TextInput
                    value={openingHours[dayKey].close || ''}
                    onChangeText={(value) =>
                        setOpeningHours((prev) => ({
                            ...prev,
                            [dayKey]: { ...prev[dayKey], close: value.replace(/[^\d:]/g, '').slice(0, 5) },
                        }))
                    }
                    placeholder="21:00"
                    keyboardType="numbers-and-punctuation"
                    style={styles.hoursTimeInput}
                />
            ) : (
                <Text style={styles.hoursTime}>
                    {openingHours[dayKey].isClosed ? '—' : formatDisplayTime(openingHours[dayKey].close)}
                </Text>
            )}
        </View>
    );

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
                            {!logo && hasExistingLogo ? (
                                <Text style={[styles.uploadHint, { color: '#15803d', marginTop: 8 }]}>Logo already uploaded</Text>
                            ) : null}
                            <Text style={styles.uploadHint}>Recommended: 500×500px PNG or JPG</Text>
                            <TouchableOpacity style={styles.uploadButton} onPress={pickLogo}>
                                <Feather name="info" size={16} color="#3B82F6" />
                                <Text style={styles.uploadButtonText}>{hasExistingLogo ? 'Change logo' : 'Upload logo here'}</Text>
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
                                    <Text style={styles.bannerPlaceholderText}>{hasExistingBanner ? 'BANNER ALREADY UPLOADED' : 'ADD BANNER'}</Text>
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
                        {loadingHours ? (
                            <View style={styles.hoursLoading}>
                                <ActivityIndicator color={colors.orange} />
                            </View>
                        ) : (
                            DAY_ORDER.map((item) => <OpeningHoursRow key={item.key} dayKey={item.key} day={item.label} />)
                        )}

                        <TouchableOpacity
                            style={styles.editHoursBtn}
                            onPress={async () => {
                                if (!isEditingHours) {
                                    setIsEditingHours(true);
                                    return;
                                }
                                const isSaved = await saveOpeningHours();
                                if (isSaved) {
                                    setIsEditingHours(false);
                                }
                            }}
                            disabled={isSavingHours || loadingHours}
                        >
                            <MaterialCommunityIcons name="calendar-edit" size={16} color={colors.orange} />
                            <Text style={styles.editHoursText}>
                                {isSavingHours ? 'Saving...' : isEditingHours ? 'Save Opening Hours' : 'Edit Opening Hours'}
                            </Text>
                        </TouchableOpacity>
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
    hoursTimeInput: {
        width: '25%',
        fontSize: 11,
        color: colors.darkGray,
        textAlign: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    hoursLoading: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
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
