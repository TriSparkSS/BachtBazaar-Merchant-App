import React, { useEffect, useState } from 'react';
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
    Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { colors, fonts, safeTop, screenWidth } from '../../../helpers/styles';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../../../context/AppContext';
import { fetchCategoriesRequest, Category } from '../../../services/merchantApi';

const { width } = Dimensions.get('window');

const ShopDetailsView = () => {
    const navigation = useNavigation<any>();
    const { authToken, shopDraft, saveShopDraft, merchant } = useAppContext();

    // State for categories
    const [selectedCategory, setSelectedCategory] = useState(shopDraft.category);
    const [selectedCategoryId, setSelectedCategoryId] = useState(shopDraft.categoryId);
    const [selectedSubCategory, setSelectedSubCategory] = useState(shopDraft.subCategory);
    const [shopName, setShopName] = useState(shopDraft.shopName);
    const [shopAddress, setShopAddress] = useState(shopDraft.address);
    const [city, setCity] = useState(shopDraft.city);
    const [phone, setPhone] = useState(shopDraft.phone || merchant?.phone || '');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

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
                Alert.alert('Category error', error?.message || 'Unable to load categories right now.');
            } finally {
                setLoadingCategories(false);
            }
        };

        loadCategories();
    }, [authToken]);

    const subCategories = ['Fast Food', 'Fine Dining', 'Cafe', 'Bakery', 'Take away'];

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
                        <View style={styles.subTagsGrid}>
                            {subCategories.map((sub) => (
                                <SubTag 
                                    key={sub}
                                    name={sub}
                                    isSelected={selectedSubCategory === sub}
                                    onPress={() => {
                                        setSelectedSubCategory(sub);
                                        saveShopDraft({ subCategory: sub });
                                    }}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Shop Address Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Shop Address</Text>
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

                    {/* Map Preview */}
                    <View style={styles.mapContainer}>
                        <Image 
                            source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-l+f50(72.8333,18.9167)/72.8333,18.9167,14,0/600x300?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2VxaXFiaWcwMjZtMnRzZzZ6ZzZ6ZzZ6In0' }} 
                            style={styles.mapImage}
                        />
                        <View style={styles.mapOverlay}>
                            <View style={styles.addressBadge}>
                                <Text style={styles.addressBadgeText}>124, Link Road, Andheri West, Mumbai</Text>
                            </View>
                            <View style={styles.pinWrapper}>
                                <View style={styles.pinCircle}>
                                    <View style={styles.pinDot} />
                                </View>
                                <MaterialCommunityIcons name="map-marker" size={40} color={colors.orange} />
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
                            Alert.alert('Incomplete details', 'Please fill shop name, category, address, city, and valid phone number.');
                            return;
                        }

                        await saveShopDraft({
                            shopName,
                            categoryId: selectedCategoryId,
                            category: selectedCategory,
                            subCategory: selectedSubCategory,
                            address: shopAddress,
                            city,
                            phone: normalizedPhone,
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
    mapContainer: {
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 10,
        marginBottom: 20,
    },
    mapImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E2E8F0',
    },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressBadge: {
        position: 'absolute',
        top: 20,
        backgroundColor: colors.white,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addressBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#1B202D',
    },
    pinWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinCircle: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.orange,
        marginTop: 20,
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
