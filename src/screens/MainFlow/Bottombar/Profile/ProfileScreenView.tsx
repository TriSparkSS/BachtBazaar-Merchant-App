import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    SafeAreaView,
    ScrollView,
    Modal,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Svg, { Circle } from 'react-native-svg';
import { colors, safeTop } from '../../../../helpers/styles';
import { BottomBar } from '../../../../components';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useAppContext } from '../../../../context/AppContext';
import { navigationRef } from '../../../../navigation';
import { updatePasswordRequest } from '../../../../services/authApi';
import { fetchUnifiedProfileRequest } from '../../../../services/merchantApi';
import { appAlert } from '../../../../services/dialogService';

const resolveImageUri = (value: any): string | null => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value?.uri === 'string') return value.uri;
    if (typeof value?.url === 'string') return value.url;
    if (typeof value?.path === 'string') return value.path;
    return null;
};

const resolveProfileValue = (profile: Record<string, any> | null, key: string) => {
    if (!profile) {
        return '';
    }
    const direct = profile?.[key];
    if (direct) {
        return direct;
    }
    const merchant = profile?.merchant?.[key];
    if (merchant) {
        return merchant;
    }
    const user = profile?.user?.[key];
    if (user) {
        return user;
    }
    return '';
};

const ProfileScreenView = () => {
    const navigation = useNavigation<any>();
    const { merchant, setupProgress, nextSetupRoute, clearSession, authToken } = useAppContext();
    const [profileData, setProfileData] = React.useState<Record<string, any> | null>(null);
    const [profileLoading, setProfileLoading] = React.useState(false);
    const [showPasswordModal, setShowPasswordModal] = React.useState(false);
    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
    const [showOldPassword, setShowOldPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

    React.useEffect(() => {
        const loadProfile = async () => {
            if (!authToken) {
                return;
            }
            try {
                setProfileLoading(true);
                const response = await fetchUnifiedProfileRequest(authToken);
                const normalizedProfile = response?.profile || response?.merchant || response?.user || null;
                setProfileData(normalizedProfile);
            } catch (error) {
                // fallback to local context data
            } finally {
                setProfileLoading(false);
            }
        };

        loadProfile();
    }, [authToken]);

    const handleLogout = () => {
        appAlert('Logout', 'Are you sure you want to logout from your account?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await clearSession();
                    if (!navigationRef.isReady()) {
                        return;
                    }
                    navigationRef.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'AuthFlow' }],
                        }),
                    );
                },
            },
        ]);
    };

    const menuItems = [
        { icon: 'file-document-outline', label: 'Edit Documents', onPress: () => navigation.navigate('MerchantOnBoarding') },
        { icon: 'storefront-outline', label: 'My Store Profile', onPress: () => navigation.navigate('BusinessDocumentation') },
        { icon: 'lock-outline', label: 'Change Password', onPress: () => setShowPasswordModal(true) },
        { icon: 'credit-card-outline', label: 'Manage Payment Methods' },
        { icon: 'earth', label: 'Languages', rightText: 'English' },
        { icon: 'cog-outline', label: 'Settings' },
        { icon: 'logout', label: 'Logout', onPress: handleLogout, isDanger: true },
    ];

    const hasMinLength = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const isPasswordStrong = hasMinLength && hasUpperCase && hasSymbol;
    const isConfirmMatch = confirmNewPassword.length > 0 && newPassword === confirmNewPassword;
    const isDifferentFromOld = Boolean(oldPassword && newPassword && oldPassword !== newPassword);
    const canUpdatePassword = Boolean(
        authToken &&
        oldPassword &&
        newPassword &&
        confirmNewPassword &&
        isPasswordStrong &&
        isConfirmMatch &&
        isDifferentFromOld
    );

    const resetPasswordFields = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const handleUpdatePassword = async () => {
        if (!authToken) {
            appAlert('Session expired', 'Please login again.');
            return;
        }
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            appAlert('Incomplete details', 'Please fill old password, new password, and confirm password.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            appAlert('Password mismatch', 'New password and confirm password must match.');
            return;
        }
        if (!isPasswordStrong) {
            appAlert('Weak password', 'New password must have 8+ characters, 1 uppercase letter, and 1 symbol.');
            return;
        }
        if (!isDifferentFromOld) {
            appAlert('Invalid password', 'New password must be different from old password.');
            return;
        }

        try {
            setIsUpdatingPassword(true);
            await updatePasswordRequest(authToken, oldPassword, newPassword);
            setShowPasswordModal(false);
            resetPasswordFields();
            appAlert('Success', 'Password updated successfully.');
        } catch (error: any) {
            appAlert('Password update failed', error?.message || 'Unable to update password right now.');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const hasAadhaarDoc = Boolean(
        profileData?.personalDocuments?.aadharImage?.uploaded ||
        profileData?.personalDocuments?.aadhaarImage?.uploaded ||
        profileData?.personalDocuments?.aadharNumber ||
        profileData?.personalDocuments?.aadhaarNumber ||
        profileData?.documentStatus?.aadhar === 'uploaded',
    );
    const hasPanDoc = Boolean(
        profileData?.personalDocuments?.panImage?.uploaded ||
        profileData?.personalDocuments?.panNumber ||
        profileData?.documentStatus?.pan === 'uploaded',
    );
    const hasAnyBusinessDoc = Boolean(
        profileData?.businessDocuments?.gstImage?.uploaded ||
        profileData?.businessDocuments?.tradeLicenseImage?.uploaded ||
        profileData?.businessDocuments?.shopRegistrationImage?.uploaded ||
        profileData?.businessDocuments?.fssaiImage?.uploaded ||
        profileData?.businessDocuments?.panImage?.uploaded ||
        profileData?.documentStatus?.gst === 'uploaded' ||
        profileData?.documentStatus?.tradeLicense === 'uploaded' ||
        profileData?.documentStatus?.shopRegistration === 'uploaded' ||
        profileData?.documentStatus?.fssai === 'uploaded',
    );

    const basicCompletionChecks = [
        { key: 'name', label: 'Name', value: resolveProfileValue(profileData, 'name') || merchant?.name },
        { key: 'email', label: 'Email', value: resolveProfileValue(profileData, 'email') || merchant?.email },
        { key: 'phone', label: 'Phone', value: resolveProfileValue(profileData, 'phone') || merchant?.phone },
        { key: 'city', label: 'City', value: resolveProfileValue(profileData, 'city') || merchant?.city },
        { key: 'gender', label: 'Gender', value: resolveProfileValue(profileData, 'gender') || merchant?.gender },
        { key: 'identityDoc', label: 'Identity Document (Aadhaar or PAN)', value: hasAadhaarDoc || hasPanDoc },
        { key: 'businessDoc', label: 'Business Document (any one)', value: hasAnyBusinessDoc },
        { key: 'shop', label: 'Shop Details', value: profileData?.shop || profileData?.merchantShop },
    ];
    const completedProfileItems = basicCompletionChecks.filter((item) => Boolean(item.value)).length;
    const profilePercent = Math.round((completedProfileItems / basicCompletionChecks.length) * 100);
    const missingProfileItems = basicCompletionChecks.filter((item) => !item.value).map((item) => item.label);
    const visibleProgress = profileData ? profilePercent : setupProgress;
    const profileName = String(resolveProfileValue(profileData, 'name') || merchant?.name || 'Merchant');
    const profilePhone = String(resolveProfileValue(profileData, 'phone') || merchant?.phone || '');
    const profileImageUri = resolveImageUri(resolveProfileValue(profileData, 'profileImage')) || resolveImageUri(merchant?.profileImage);
    const normalizedProgress = Math.max(0, Math.min(100, visibleProgress));
    const progressRingColor = normalizedProgress >= 100 ? '#16A34A' : normalizedProgress >= 40 ? '#F59E0B' : '#DC2626';
    const progressSize = 54;
    const progressStrokeWidth = 5;
    const progressRadius = (progressSize - progressStrokeWidth) / 2;
    const progressCircumference = 2 * Math.PI * progressRadius;
    const progressOffset = progressCircumference * (1 - normalizedProgress / 100);

    const MenuItem = ({ icon, label, rightText, onPress, isDanger }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, isDanger && styles.dangerIconBox]}>
                    <MaterialCommunityIcons name={icon} size={20} color={isDanger ? '#DC2626' : colors.darkGray} />
                </View>
                <Text style={[styles.menuLabel, isDanger && styles.dangerLabel]}>{label}</Text>
            </View>
            <View style={styles.menuRight}>
                {rightText && <Text style={styles.rightText}>{rightText}</Text>}
                <Feather name="chevron-right" size={20} color={colors.lightGray} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { paddingTop: safeTop }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>My Account</Text>
                        <Text style={styles.headerSub}>You have Collected 112 Points</Text>
                    </View>
                    <View style={styles.proBadge}>
                        <MaterialCommunityIcons name="crown" size={14} color="#F59E0B" />
                        <Text style={styles.proText}>Pro Active</Text>
                    </View>
                </View>

                {/* Identity Section */}
                <View style={styles.identitySection}>
                    <View style={styles.avatarContainer}>
                        <Image 
                            source={{ uri: profileImageUri || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400' }} 
                            style={styles.avatar} 
                        />
                        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('MerchantOnBoarding')}>
                            <MaterialCommunityIcons name="pencil" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.email}>{profileName}</Text>
                    <Text style={styles.phone}>{profilePhone ? `+91 ${profilePhone}` : '+91 98765 43210'}</Text>
                </View>

                {/* Progress Card */}
                <TouchableOpacity style={styles.progressCard} onPress={() => nextSetupRoute && navigation.navigate(nextSetupRoute)}>
                    <View style={styles.circularProgress}>
                        <Svg width={progressSize} height={progressSize} style={styles.progressSvg}>
                            <Circle
                                cx={progressSize / 2}
                                cy={progressSize / 2}
                                r={progressRadius}
                                stroke="#E2E8F0"
                                strokeWidth={progressStrokeWidth}
                                fill="none"
                            />
                            <Circle
                                cx={progressSize / 2}
                                cy={progressSize / 2}
                                r={progressRadius}
                                stroke={progressRingColor}
                                strokeWidth={progressStrokeWidth}
                                fill="none"
                                strokeDasharray={`${progressCircumference} ${progressCircumference}`}
                                strokeDashoffset={progressOffset}
                                strokeLinecap="round"
                                transform={`rotate(-90 ${progressSize / 2} ${progressSize / 2})`}
                            />
                        </Svg>
                        <View style={styles.progressInner}>
                            <Text style={[styles.percentText, { color: progressRingColor }]}>{normalizedProgress}%</Text>
                        </View>
                    </View>
                    <View style={styles.progressInfo}>
                        <Text style={styles.progressTitle}>Complete your Profile</Text>
                        <Text style={styles.progressSub} numberOfLines={2}>
                            {profileLoading
                                ? 'Refreshing profile data...'
                                : missingProfileItems.length
                                    ? `Missing: ${missingProfileItems.slice(0, 2).join(', ')}${missingProfileItems.length > 2 ? '...' : ''}`
                                    : 'Your merchant profile setup is complete.'}
                        </Text>
                    </View>
                    <Feather name="chevron-right" size={24} color={colors.lightGray} />
                </TouchableOpacity>

                {!!missingProfileItems.length && (
                    <View style={styles.missingCard}>
                        <Text style={styles.missingTitle}>Complete These Details</Text>
                        <Text style={styles.missingText}>{missingProfileItems.join(', ')}</Text>
                    </View>
                )}

                {/* Menu List */}
                <View style={styles.menuList}>
                    {menuItems.map((item, idx) => (
                        <MenuItem key={idx} {...item} />
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <Modal
                visible={showPasswordModal}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowPasswordModal(false);
                    resetPasswordFields();
                }}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Update Password</Text>
                        <Text style={styles.modalSub}>Use your old password and set a strong new password.</Text>

                        <View style={styles.passwordInputWithIcon}>
                            <TextInput
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                placeholder="Old Password"
                                secureTextEntry={!showOldPassword}
                                style={styles.passwordInput}
                                placeholderTextColor={colors.lightGray}
                            />
                            <TouchableOpacity onPress={() => setShowOldPassword((prev) => !prev)}>
                                <Feather name={showOldPassword ? 'eye' : 'eye-off'} size={18} color={colors.lightGray} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.passwordInputWithIcon}>
                            <TextInput
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="New Password"
                                secureTextEntry={!showNewPassword}
                                style={styles.passwordInput}
                                placeholderTextColor={colors.lightGray}
                            />
                            <TouchableOpacity onPress={() => setShowNewPassword((prev) => !prev)}>
                                <Feather name={showNewPassword ? 'eye' : 'eye-off'} size={18} color={colors.lightGray} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.passwordInputWithIcon}>
                            <TextInput
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                                placeholder="Confirm New Password"
                                secureTextEntry={!showConfirmPassword}
                                style={styles.passwordInput}
                                placeholderTextColor={colors.lightGray}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
                                <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={18} color={colors.lightGray} />
                            </TouchableOpacity>
                        </View>

                        {confirmNewPassword.length > 0 && !isConfirmMatch ? (
                            <Text style={styles.modalValidationError}>Confirm password does not match</Text>
                        ) : null}

                        <View style={styles.modalRequirements}>
                            <View style={styles.modalRequirementRow}>
                                <MaterialCommunityIcons
                                    name={hasMinLength ? 'check-circle' : 'checkbox-blank-circle-outline'}
                                    size={16}
                                    color={hasMinLength ? '#166534' : colors.lighterGray}
                                />
                                <Text style={[styles.modalRequirementText, hasMinLength && styles.modalRequirementValid]}>8+ characters</Text>
                            </View>
                            <View style={styles.modalRequirementRow}>
                                <MaterialCommunityIcons
                                    name={hasUpperCase ? 'check-circle' : 'checkbox-blank-circle-outline'}
                                    size={16}
                                    color={hasUpperCase ? '#166534' : colors.lighterGray}
                                />
                                <Text style={[styles.modalRequirementText, hasUpperCase && styles.modalRequirementValid]}>1 uppercase letter</Text>
                            </View>
                            <View style={styles.modalRequirementRow}>
                                <MaterialCommunityIcons
                                    name={hasSymbol ? 'check-circle' : 'checkbox-blank-circle-outline'}
                                    size={16}
                                    color={hasSymbol ? '#166534' : colors.lighterGray}
                                />
                                <Text style={[styles.modalRequirementText, hasSymbol && styles.modalRequirementValid]}>1 symbol (!@#$%)</Text>
                            </View>
                            <View style={styles.modalRequirementRow}>
                                <MaterialCommunityIcons
                                    name={isConfirmMatch ? 'check-circle' : 'checkbox-blank-circle-outline'}
                                    size={16}
                                    color={isConfirmMatch ? '#166534' : colors.lighterGray}
                                />
                                <Text style={[styles.modalRequirementText, isConfirmMatch && styles.modalRequirementValid]}>Passwords match</Text>
                            </View>
                            <View style={styles.modalRequirementRow}>
                                <MaterialCommunityIcons
                                    name={isDifferentFromOld ? 'check-circle' : 'checkbox-blank-circle-outline'}
                                    size={16}
                                    color={isDifferentFromOld ? '#166534' : colors.lighterGray}
                                />
                                <Text style={[styles.modalRequirementText, isDifferentFromOld && styles.modalRequirementValid]}>
                                    New password differs from old
                                </Text>
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => {
                                    setShowPasswordModal(false);
                                    resetPasswordFields();
                                }}
                                disabled={isUpdatingPassword}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.updateBtn, !canUpdatePassword && styles.updateBtnDisabled]}
                                onPress={handleUpdatePassword}
                                disabled={isUpdatingPassword || !canUpdatePassword}
                            >
                                {isUpdatingPassword ? (
                                    <ActivityIndicator color={colors.white} />
                                ) : (
                                    <Text style={styles.updateBtnText}>Update</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <BottomBar activeTab="Profile" />
        </SafeAreaView>
    );
};

export default ProfileScreenView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBFBFB',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1B202D',
    },
    headerSub: {
        fontSize: 13,
        color: colors.lightGray,
        marginTop: 4,
    },
    proBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FEF3C7',
        gap: 6,
    },
    proText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#B45309',
    },
    identitySection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        width: 140,
        height: 140,
        borderRadius: 25,
        backgroundColor: '#E2E8F0',
        marginBottom: 15,
        position: 'relative',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
    },
    editBtn: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: colors.orange,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FBFBFB',
    },
    email: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1B202D',
        marginBottom: 4,
    },
    phone: {
        fontSize: 13,
        color: colors.lightGray,
    },
    progressCard: {
        backgroundColor: '#FFF1EB',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    circularProgress: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    progressSvg: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    progressInner: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    percentText: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.orange,
    },
    progressInfo: {
        flex: 1,
        marginLeft: 15,
    },
    progressTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1B202D',
        marginBottom: 4,
    },
    progressSub: {
        fontSize: 12,
        color: '#64748B',
        lineHeight: 16,
    },
    missingCard: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        marginBottom: 20,
    },
    missingTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#92400E',
        marginBottom: 4,
    },
    missingText: {
        fontSize: 12,
        color: '#B45309',
        lineHeight: 17,
    },
    menuList: {
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    menuIconBox: {
        width: 32,
        height: 32,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dangerIconBox: {
        backgroundColor: '#FEF2F2',
    },
    menuLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1B202D',
    },
    dangerLabel: {
        color: '#DC2626',
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rightText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#941B1B',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalCard: {
        backgroundColor: colors.white,
        borderRadius: 18,
        padding: 18,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1B202D',
    },
    modalSub: {
        marginTop: 4,
        marginBottom: 14,
        fontSize: 12,
        color: colors.lightGray,
    },
    passwordInputWithIcon: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#FAFAFA',
    },
    passwordInput: {
        flex: 1,
        color: colors.black,
    },
    modalValidationError: {
        marginBottom: 8,
        fontSize: 12,
        color: '#DC2626',
        fontWeight: '600',
    },
    modalRequirements: {
        marginBottom: 8,
    },
    modalRequirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    modalRequirementText: {
        marginLeft: 8,
        fontSize: 12,
        color: colors.darkGray,
        fontWeight: '500',
    },
    modalRequirementValid: {
        color: colors.black,
        fontWeight: '700',
    },
    modalActions: {
        marginTop: 6,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    cancelBtn: {
        height: 40,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        color: colors.darkGray,
        fontSize: 13,
        fontWeight: '700',
    },
    updateBtn: {
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: colors.orange,
        alignItems: 'center',
        justifyContent: 'center',
    },
    updateBtnDisabled: {
        opacity: 0.6,
    },
    updateBtnText: {
        color: colors.white,
        fontSize: 13,
        fontWeight: '700',
    },
});
