import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { colors, safeTop } from '../../../../helpers/styles';
import { BottomBar } from '../../../../components';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useAppContext } from '../../../../context/AppContext';
import { navigationRef } from '../../../../navigation';

const resolveImageUri = (value: any): string | null => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value?.uri === 'string') return value.uri;
    if (typeof value?.url === 'string') return value.url;
    if (typeof value?.path === 'string') return value.path;
    return null;
};

const ProfileScreenView = () => {
    const navigation = useNavigation<any>();
    const { merchant, setupProgress, nextSetupRoute, clearSession } = useAppContext();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout from your account?', [
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
        { icon: 'storefront-outline', label: 'My Store Profile', onPress: () => navigation.navigate('ShopDetails') },
        { icon: 'lock-outline', label: 'Change Password' },
        { icon: 'credit-card-outline', label: 'Manage Payment Methods' },
        { icon: 'earth', label: 'Languages', rightText: 'English' },
        { icon: 'cog-outline', label: 'Settings' },
        { icon: 'logout', label: 'Logout', onPress: handleLogout, isDanger: true },
    ];

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
                            source={{ uri: resolveImageUri(merchant?.profileImage) || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400' }} 
                            style={styles.avatar} 
                        />
                        <TouchableOpacity style={styles.editBtn}>
                            <MaterialCommunityIcons name="pencil" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.email}>{merchant?.email || merchant?.name || 'Merchant account'}</Text>
                    <Text style={styles.phone}>{merchant?.phone ? `+91 ${merchant.phone}` : '+91 98765 43210'}</Text>
                </View>

                {/* Progress Card */}
                <TouchableOpacity style={styles.progressCard} onPress={() => nextSetupRoute && navigation.navigate(nextSetupRoute)}>
                    <View style={styles.circularProgress}>
                        <View style={styles.progressInner}>
                            <Text style={styles.percentText}>{setupProgress}%</Text>
                        </View>
                        {/* Static Progress Border Approximation */}
                        <View style={[styles.progressArc, { borderRightColor: colors.orange, borderTopColor: colors.orange }]} />
                    </View>
                    <View style={styles.progressInfo}>
                        <Text style={styles.progressTitle}>Complete your Profile</Text>
                        <Text style={styles.progressSub} numberOfLines={2}>
                            {nextSetupRoute ? 'Continue your merchant and store setup to unlock all features.' : 'Your merchant profile setup is complete.'}
                        </Text>
                    </View>
                    <Feather name="chevron-right" size={24} color={colors.lightGray} />
                </TouchableOpacity>

                {/* Menu List */}
                <View style={styles.menuList}>
                    {menuItems.map((item, idx) => (
                        <MenuItem key={idx} {...item} />
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

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
    progressArc: {
        position: 'absolute',
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 5,
        borderColor: 'transparent',
        transform: [{ rotate: '45deg' }],
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
});
