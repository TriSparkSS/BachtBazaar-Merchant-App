import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../../../../../helpers/styles';

const HomeWidgets = () => {
    const notifications = [
        { title: 'Ravi used your 10% off offer', time: '2 hrs ago', icon: 'ticket-percent-outline', color: '#FF7D2F', bgColor: '#FFF7ED' },
        { title: 'Priya redeemed your BOGO scratch card', time: '4 hrs ago', icon: 'cart-outline', color: '#3B82F6', bgColor: '#EFF6FF' },
        { title: 'New customer Amit joined your loyalty program', time: 'Yesterday', icon: 'account-plus-outline', color: '#10B981', bgColor: '#ECFDF5' },
    ];

    const customers = [
        { initial: 'R', color: '#10B981' },
        { initial: 'P', color: '#3B82F6' },
        { initial: 'A', color: '#FF7D2F' },
        { initial: 'N', color: '#8B5CF6' },
        { initial: 'V', color: '#EF4444' },
    ];

    const trending = [
        { name: 'Tea Junction', offer: 'Buy 1 Get 1 Free', distance: '150m away' },
        { name: 'Lucky Sweets', offer: '10% Off All Items', distance: '300m away' },
    ];

    return (
        <View style={styles.container}>
            {/* Recent Notifications Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <MaterialCommunityIcons name="bell-outline" size={20} color={colors.orange} />
                        <Text style={styles.cardTitle}>Recent Notifications</Text>
                    </View>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {notifications.map((notif, idx) => (
                    <View key={idx} style={styles.notifItem}>
                        <View style={[styles.notifIcon, { backgroundColor: notif.bgColor }]}>
                            <MaterialCommunityIcons name={notif.icon as any} size={20} color={notif.color} />
                        </View>
                        <View style={styles.notifBody}>
                            <Text style={styles.notifTitle}>{notif.title}</Text>
                            <Text style={styles.notifTime}>{notif.time}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Repeat Customers Today Card */}
            <View style={[styles.card, { marginTop: 20 }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <MaterialCommunityIcons name="refresh" size={20} color={colors.orange} />
                        <Text style={styles.cardTitle}>Repeat Customers Today</Text>
                    </View>
                </View>
                <Text style={styles.subtitle}>5 customers visited again today</Text>
                <View style={styles.avatarRow}>
                    {customers.map((cust, idx) => (
                        <View key={idx} style={[styles.avatar, { backgroundColor: cust.color }]}>
                            <Text style={styles.avatarText}>{cust.initial}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Nearby Trending Offers Card */}
            <View style={[styles.card, { marginTop: 20 }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.orange} />
                        <Text style={styles.cardTitle}>Nearby Trending Offers</Text>
                    </View>
                </View>
                
                {trending.map((item, idx) => (
                    <View key={idx} style={styles.trendingItem}>
                        <Text style={styles.trendingName}>{item.name}</Text>
                        <Text style={styles.trendingOffer}>{item.offer}</Text>
                        <View style={styles.distanceRow}>
                            <Feather name="map-pin" size={12} color="#EF4444" />
                            <Text style={styles.distanceText}>{item.distance}</Text>
                        </View>
                        {idx < trending.length - 1 && <View style={styles.trendingDivider} />}
                    </View>
                ))}

                <TouchableOpacity style={styles.exploreBtn}>
                    <Text style={styles.exploreBtnText}>Explore More </Text>
                    <Feather name="arrow-right" size={14} color="#3B82F6" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default HomeWidgets;

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1B202D',
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    notifItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 15,
    },
    notifIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notifBody: {
        flex: 1,
    },
    notifTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1B202D',
        marginBottom: 4,
    },
    notifTime: {
        fontSize: 11,
        color: colors.lightGray,
    },
    subtitle: {
        fontSize: 13,
        color: colors.lightGray,
        marginBottom: 15,
    },
    avatarRow: {
        flexDirection: 'row',
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    trendingItem: {
        marginBottom: 15,
    },
    trendingName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1B202D',
        marginBottom: 4,
    },
    trendingOffer: {
        fontSize: 13,
        color: '#3B82F6',
        fontWeight: '600',
        marginBottom: 6,
    },
    distanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    distanceText: {
        fontSize: 11,
        color: colors.lightGray,
        fontWeight: '500',
    },
    trendingDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 15,
    },
    exploreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        gap: 6,
    },
    exploreBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
});
