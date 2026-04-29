import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    ScrollView,
    Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { colors, fonts, safeTop, screenWidth } from '../../../helpers/styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppContext } from '../../../context/AppContext';
import { appAlert } from '../../../services/dialogService';
import {
    fetchCategoriesRequest,
    fetchSubcategoriesRequest,
    Category,
    Subcategory,
} from '../../../services/merchantApi';

const { width } = Dimensions.get('window');

const ShopDetailsView = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { authToken, shopDraft, saveShopDraft, merchant } = useAppContext();

    // State for categories
    const [selectedCategory, setSelectedCategory] = useState(shopDraft.category);
    const [selectedCategoryId, setSelectedCategoryId] = useState(shopDraft.categoryId);
    const [selectedSubCategory, setSelectedSubCategory] = useState(shopDraft.subCategory);
    const [shopName, setShopName] = useState(shopDraft.shopName);
    const [shopAddress, setShopAddress] = useState(shopDraft.address);
    const [shopAddress1, setShopAddress1] = useState(shopDraft.address1 || '');
    const [city, setCity] = useState(shopDraft.city);
    const [phone, setPhone] = useState(shopDraft.phone || merchant?.phone || '');
    const [selectedCoordinates, setSelectedCoordinates] = useState<{
        latitude: number;
        longitude: number;
    } | null>(
        typeof shopDraft.latitude === 'number' && typeof shopDraft.longitude === 'number'
            ? { latitude: shopDraft.latitude, longitude: shopDraft.longitude }
            : null,
    );
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            if (!authToken) {
                return;
            }

            try {
                setLoadingCategories(true);
                const response = await fetchCategoriesRequest(authToken);
                setCategories(response.categories || []);

                if (!selectedCategoryId && response.categories?.length) {
                    const first = response.categories[0];
                    setSelectedCategory(first.label);
                    setSelectedCategoryId(first._id);
                    await saveShopDraft({
                        category: first.label,
                        categoryId: first._id,
                    });
                }
            } catch (error: any) {
                appAlert('Category error', error?.message || 'Unable to load categories right now.');
            } finally {
                setLoadingCategories(false);
            }
        };

        loadCategories();
    }, [authToken]);

    useEffect(() => {
        const loadSubcategories = async () => {
            if (!authToken || !selectedCategoryId) {
                setSubcategories([]);
                return;
            }

            try {
                setLoadingSubcategories(true);
                const response = await fetchSubcategoriesRequest(authToken, selectedCategoryId);
                const list = response?.subcategories || [];
                setSubcategories(list);

                if (!list.length) {
                    if (selectedSubCategory) {
                        setSelectedSubCategory('');
                        await saveShopDraft({ subCategory: '' });
                    }
                    return;
                }

                const isCurrentStillValid = list.some((item) => {
                    const itemLabel = item.label || item.name || item.value || '';
                    return itemLabel === selectedSubCategory;
                });

                if (!isCurrentStillValid) {
                    const first = list[0];
                    const defaultSubcategory = first?.label || first?.name || first?.value || '';
                    setSelectedSubCategory(defaultSubcategory);
                    await saveShopDraft({ subCategory: defaultSubcategory });
                }
            } catch (error: any) {
                setSubcategories([]);
                appAlert('Subcategory error', error?.message || 'Unable to load subcategories right now.');
            } finally {
                setLoadingSubcategories(false);
            }
        };

        loadSubcategories();
    }, [authToken, selectedCategoryId]);

    useEffect(() => {
        const params = route?.params || {};
        const selectedAddress = params.selectedAddress;
        const selectedCity = params.selectedCity;
        const selectedLatitude = params.selectedLatitude;
        const selectedLongitude = params.selectedLongitude;

        if (!selectedAddress && !selectedCity) {
            return;
        }

        if (selectedAddress) {
            setShopAddress(selectedAddress);
        }
        if (selectedCity) {
            setCity(selectedCity);
        }
        if (typeof selectedLatitude === 'number' && typeof selectedLongitude === 'number') {
            setSelectedCoordinates({
                latitude: selectedLatitude,
                longitude: selectedLongitude,
            });
        }

        saveShopDraft({
            ...(selectedAddress ? { address: selectedAddress } : {}),
            ...(selectedCity ? { city: selectedCity } : {}),
            ...(typeof selectedLatitude === 'number' ? { latitude: selectedLatitude } : {}),
            ...(typeof selectedLongitude === 'number' ? { longitude: selectedLongitude } : {}),
        });
    }, [route?.params?.selectedAddress, route?.params?.selectedCity, route?.params?.selectedLatitude, route?.params?.selectedLongitude]);

    const Tag = ({ name, icon, color, textColor, borderColor, isSelected, onPress }: any) => (
        <TouchableOpacity 
            onPress={onPress}
            style={[
                styles.tag, 
                { backgroundColor: color, borderColor: isSelected ? borderColor : 'transparent' },
                isSelected && { borderWidth: 1 }
            ]}
        >
            <MaterialCommunityIcons name={icon} size={16} color={textColor} />
            <Text style={[styles.tagText, { color: textColor }]}>{name}</Text>
        </TouchableOpacity>
    );

    const SubTag = ({ name, isSelected, onPress }: any) => (
        <TouchableOpacity 
            onPress={onPress}
            style={[
                styles.subTag, 
                isSelected ? styles.subTagSelected : styles.subTagUnselected
            ]}
        >
            <Text style={[styles.subTagText, isSelected ? styles.subTagTextSelected : styles.subTagTextUnselected]}>
                {name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { paddingTop: safeTop }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                    <Feather name="arrow-left" size={24} color={colors.darkGray} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Merchant Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Progress Bar Section */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressTextRow}>
                        <Text style={styles.progressLabel}>Shop Details</Text>
                        <Text style={styles.stepLabel}>Step 2 of 3</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '66%' }]} />
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.title}>Tell us about your shop</Text>
                    <Text style={styles.subtitle}>
                        Help customers find you by providing accurate information about your business.
                    </Text>

                    {/* Shop Name Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Shop Name</Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="storefront-outline" size={20} color={colors.lightGray} />
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="e.g. BachtBazaar Express"
                                    placeholderTextColor="#94A3B8"
                                    value={shopName}
                                    onChangeText={setShopName}
                                />
                        </View>
                    </View>

                    {/* Category Selection Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Category</Text>
                        {loadingCategories ? (
                            <View style={styles.categoryLoader}>
                                <ActivityIndicator color={colors.orange} />
                                <Text style={styles.categoryLoaderText}>Loading categories...</Text>
                            </View>
                        ) : (
                            <View style={styles.tagsGrid}>
                                {categories.map((cat) => (
                                    <Tag 
                                        key={cat._id}
                                        name={cat.label}
                                        icon="shape-outline"
                                        color={selectedCategoryId === cat._id ? '#FFF7ED' : '#F8FAFC'}
                                        textColor={selectedCategoryId === cat._id ? '#EA580C' : '#475569'}
                                        borderColor={selectedCategoryId === cat._id ? '#FB923C' : '#E2E8F0'}
                                        isSelected={selectedCategoryId === cat._id}
                                        onPress={() => {
                                            setSelectedCategory(cat.label);
                                            setSelectedCategoryId(cat._id);
                                            saveShopDraft({ category: cat.label, categoryId: cat._id });
                                        }}
                                    />
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Sub Category Selection Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Sub Category</Text>
                        {loadingSubcategories ? (
                            <View style={styles.categoryLoader}>
                                <ActivityIndicator color={colors.orange} />
                                <Text style={styles.categoryLoaderText}>Loading subcategories...</Text>
                            </View>
                        ) : (
                            <View style={styles.subTagsGrid}>
                                {subcategories.length ? (
                                    subcategories.map((sub) => {
                                        const subLabel = sub.label || sub.name || sub.value || 'Subcategory';
                                        return (
                                            <SubTag 
                                                key={sub._id}
                                                name={subLabel}
                                                isSelected={selectedSubCategory === subLabel}
                                                onPress={() => {
                                                    setSelectedSubCategory(subLabel);
                                                    saveShopDraft({ subCategory: subLabel });
                                                }}
                                            />
                                        );
                                    })
                                ) : (
                                    <Text style={styles.categoryLoaderText}>
                                        Select a category to view subcategories.
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Shop Address Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Shop Address</Text>
                        <TouchableOpacity
                            style={styles.mapSelectBtn}
                            onPress={() => navigation.navigate('MapPicker')}
                        >
                            <Feather name="map" size={16} color={colors.orange} />
                            <Text style={styles.mapSelectText}>Select Address Using Map</Text>
                        </TouchableOpacity>

                        <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                            <Feather name="map-pin" size={18} color={colors.lightGray} style={{ marginTop: 2 }} />
                                <TextInput 
                                    style={[styles.input, { textAlignVertical: 'top' }]} 
                                    placeholder="Street name, building number..."
                                    placeholderTextColor="#94A3B8"
                                    multiline
                                    value={shopAddress}
                                    onChangeText={setShopAddress}
                                />
                        </View>

                        <Text style={[styles.cardLabel, { marginTop: 15 }]}>City</Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="bank-outline" size={20} color={colors.lightGray} />
                            <TextInput
                                style={styles.input}
                                placeholder="Select City"
                                placeholderTextColor="#94A3B8"
                                value={city}
                                onChangeText={setCity}
                            />
                        </View>

                        <Text style={[styles.cardLabel, { marginTop: 15 }]}>Another Address (Address 1)</Text>
                        <View style={styles.inputContainer}>
                            <Feather name="home" size={18} color={colors.lightGray} />
                            <TextInput
                                style={styles.input}
                                placeholder="Flat/Building/Landmark (optional)"
                                placeholderTextColor="#94A3B8"
                                value={shopAddress1}
                                onChangeText={setShopAddress1}
                            />
                        </View>

                        {selectedCoordinates ? (
                            <Text style={styles.coordinatesText}>
                                Selected on map: {selectedCoordinates.latitude.toFixed(5)}, {selectedCoordinates.longitude.toFixed(5)}
                            </Text>
                        ) : null}
                    </View>

                    {/* Phone Number Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Phone Number</Text>
                        <View style={styles.phoneRow}>
                            <View style={styles.countryCodeBox}>
                                <Text style={styles.countryCodeText}>+91</Text>
                            </View>
                            <View style={[styles.inputContainer, { flex: 1, marginBottom: 0 }]}>
                                <Feather name="phone" size={18} color={colors.lightGray} />
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="98765 43210"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="numeric"
                                    value={phone}
                                    onChangeText={setPhone}
                                />
                            </View>
                        </View>
                    </View>

                </View>

                {/* Footer Button - Needs to be inside ScrollView for the floating look or outside for fixed. Image shows it fixed but reachable. */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Footer */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.continueButton}
                    onPress={async () => {
                        const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
                        if (!shopName || !selectedCategoryId || !shopAddress || !city || normalizedPhone.length !== 10) {
                            appAlert('Incomplete details', 'Please fill shop name, category, address, city, and valid phone number.');
                            return;
                        }

                        await saveShopDraft({
                            shopName,
                            categoryId: selectedCategoryId,
                            category: selectedCategory,
                            subCategory: selectedSubCategory,
                            address: shopAddress,
                            address1: shopAddress1.trim() || shopAddress,
                            city,
                            phone: normalizedPhone,
                            ...(selectedCoordinates ? { latitude: selectedCoordinates.latitude, longitude: selectedCoordinates.longitude } : {}),
                        });
                        navigation.navigate('FinalizingDetails');
                    }}
                >
                    <Text style={styles.continueButtonText}>Continue to Final Step</Text>
                    <Feather name="arrow-right" size={20} color={colors.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ShopDetailsView;

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
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1B202D',
        marginBottom: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        paddingHorizontal: 12,
        height: 48,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: colors.black,
    },
    dropdownText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#94A3B8',
    },
    tagsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryLoader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    categoryLoaderText: {
        fontSize: 13,
        color: colors.lightGray,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    subTagsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    subTag: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    subTagSelected: {
        backgroundColor: colors.orange,
        borderColor: colors.orange,
    },
    subTagUnselected: {
        backgroundColor: colors.white,
        borderColor: '#F1F5F9',
    },
    subTagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    subTagTextSelected: {
        color: colors.white,
    },
    subTagTextUnselected: {
        color: '#334155',
    },
    phoneRow: {
        flexDirection: 'row',
        gap: 10,
    },
    countryCodeBox: {
        width: 60,
        height: 48,
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    countryCodeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1B202D',
    },
    mapSelectBtn: {
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FDBA74',
        backgroundColor: '#FFF7ED',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    mapSelectText: {
        color: '#C2410C',
        fontSize: 13,
        fontWeight: '700',
    },
    coordinatesText: {
        marginTop: 10,
        fontSize: 11,
        color: colors.lightGray,
    },
    footer: {
        paddingHorizontal: 25,
        paddingVertical: 20,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    continueButton: {
        backgroundColor: colors.orange,
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: colors.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    continueButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
