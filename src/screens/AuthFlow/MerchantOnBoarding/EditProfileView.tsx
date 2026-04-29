import React, { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    SafeAreaView,
    TextInput,
    ScrollView,
    Dimensions,
    Platform
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { colors, fonts, safeTop, screenWidth } from '../../../helpers/styles';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAppContext } from '../../../context/AppContext';
import { updateMerchantProfileRequest } from '../../../services/merchantApi';
import { appAlert } from '../../../services/dialogService';
import { validateImageUnderOneMb } from '../../../helpers/fileValidation';

const { width } = Dimensions.get('window');

const resolveImageUri = (value: any): string | null => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value?.uri === 'string') return value.uri;
    if (typeof value?.url === 'string') return value.url;
    if (typeof value?.path === 'string') return value.path;
    return null;
};

type InputCardProps = {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    icon: 'mail' | 'phone' | 'map-pin' | 'user-orange' | 'user-blue';
    isLocked?: boolean;
    isDropdown?: boolean;
    onPress?: () => void;
};

const InputCard = ({
    label,
    value,
    onChangeText,
    icon,
    isLocked = false,
    isDropdown = false,
    onPress,
}: InputCardProps) => (
    <TouchableOpacity style={styles.card} activeOpacity={isDropdown ? 0.8 : 1} onPress={onPress} disabled={!isDropdown}>
        <View style={styles.iconContainer}>
            {icon === 'mail' ? (
                <Feather name="mail" size={20} color={colors.blue} />
            ) : icon === 'phone' ? (
                <Feather name="smartphone" size={20} color={colors.blue} />
            ) : icon === 'map-pin' ? (
                <Feather name="map-pin" size={20} color={colors.orange} />
            ) : (
                <Feather name="user" size={20} color={isDropdown ? colors.blue : colors.orange} />
            )}
        </View>
        <View style={styles.inputContent}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                editable={!isLocked && !isDropdown}
                placeholder={`Enter ${label.toLowerCase()}`}
            />
        </View>
        {isLocked && (
            <Feather name="lock" size={16} color="#CBD5E1" />
        )}
        {isDropdown && (
            <Feather name="chevron-down" size={20} color="#94A3B8" />
        )}
    </TouchableOpacity>
);

const EditProfileView = () => {
    const navigation = useNavigation<any>();
    const { authToken, merchant, updateMerchant } = useAppContext();
    const initialProfileImageUri = resolveImageUri(merchant?.profileImage);
    
    // State for fields
    const [fullName, setFullName] = useState(merchant?.name || '');
    const [mobileNumber, setMobileNumber] = useState(merchant?.phone || '');
    const [email, setEmail] = useState(merchant?.email || '');
    const [city, setCity] = useState(merchant?.city || '');
    const [gender, setGender] = useState(merchant?.gender || 'Male');
    const [profileImage, setProfileImage] = useState<any>(
        initialProfileImageUri ? { uri: initialProfileImageUri } : null
    );
    const [isSaving, setIsSaving] = useState(false);

    const pickProfileImage = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 1,
                quality: 0.6,
                maxWidth: 1280,
                maxHeight: 1280,
                includeBase64: false,
            });

            const asset = result.assets?.[0];
            if (!asset?.uri) {
                return;
            }

            const normalizedImage = {
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || `profile-${Date.now()}.jpg`,
                fileSize: asset.fileSize,
            };

            const imageValidation = validateImageUnderOneMb(normalizedImage);
            if (!imageValidation.valid) {
                appAlert('Image too large', imageValidation.message);
                return;
            }

            setProfileImage(normalizedImage);
        } catch (err) {
            appAlert('Image failed', 'Unable to select profile image right now.');
        }
    };

    const handleSaveChanges = async () => {
        if (!authToken) {
            appAlert('Session expired', 'Please log in again.');
            return;
        }

        if (!fullName || !city || !gender) {
            appAlert('Incomplete profile', 'Please complete full name, city, and gender.');
            return;
        }

        const normalizedPhone = mobileNumber.replace(/\D/g, '').slice(-10);
        if (normalizedPhone.length !== 10) {
            appAlert('Invalid mobile number', 'Please enter a valid 10-digit mobile number.');
            return;
        }

        try {
            setIsSaving(true);
            const response = await updateMerchantProfileRequest({
                token: authToken,
                name: fullName,
                gender: gender.toLowerCase(),
                city,
                phone: normalizedPhone,
                email,
                profileImage,
            });
            await updateMerchant(response.merchant);
            navigation.navigate('BusinessDocumentation');
        } catch (error: any) {
            appAlert('Profile update failed', error?.message || 'Unable to update profile right now.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenderPress = () => {
        const options = ['Male', 'Female', 'Other'];
        const currentIndex = options.indexOf(gender);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % options.length;
        setGender(options[nextIndex]);
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: safeTop }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={colors.darkGray} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Image Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: resolveImageUri(profileImage) || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editBadge} onPress={pickProfileImage}>
                            <MaterialCommunityIcons name="pencil" size={16} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.memberSince}>BachatBazaar Member since 2023</Text>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    <InputCard
                        label="FULL NAME"
                        value={fullName}
                        onChangeText={setFullName}
                        icon="user-orange"
                    />
                    <InputCard
                        label="MOBILE NUMBER"
                        value={mobileNumber}
                        onChangeText={setMobileNumber}
                        icon="phone"
                    />
                    <InputCard
                        label="EMAIL ADDRESS"
                        value={email}
                        onChangeText={setEmail}
                        icon="mail"
                    />
                    <InputCard
                        label="CITY"
                        value={city}
                        onChangeText={setCity}
                        icon="map-pin"
                    />
                    <InputCard
                        label="GENDER"
                        value={gender}
                        onChangeText={setGender}
                        icon="user-blue"
                        isDropdown={true}
                        onPress={handleGenderPress}
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <View style={styles.checkCircle}>
                                <MaterialCommunityIcons name="check" size={16} color={colors.orange} />
                            </View>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfileView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBFBFB', // Subtle off-white background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1B202D',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#E2E8F0',
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 0,
        backgroundColor: colors.orange,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },
    memberSince: {
        marginTop: 15,
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
    formContainer: {
        paddingHorizontal: 25,
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 16,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    iconContainer: {
        marginRight: 16,
    },
    inputContent: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '700',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    input: {
        fontSize: 16,
        color: '#1B202D',
        fontWeight: '700',
        padding: 0,
    },
    saveButton: {
        backgroundColor: colors.orange,
        marginHorizontal: 25,
        marginTop: 40,
        height: 60,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.orange,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    checkCircle: {
        backgroundColor: colors.white,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
