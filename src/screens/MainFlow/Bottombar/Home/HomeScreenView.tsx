import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, fonts, safeTop } from '../../../../helpers/styles';
import { BottomBar } from '../../../../components';

import ProgressRewards from './components/ProgressRewards';
import HomeTasks from './components/HomeTasks';
import HomeWidgets from './components/HomeWidgets';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const HomeScreenView = () => {
    const [selectedDay, setSelectedDay] = useState(29);

    const calendarDays = [
        { day: 'THU', date: 27, hasOffer: true },
        { day: 'FRI', date: 28, hasOffer: true },
        { day: 'SAT', date: 29, hasOffer: false, active: true },
        { day: 'SUN', date: 30, hasOffer: false },
        { day: 'MON', date: 31, hasOffer: false },
    ];

    const quickActions = [
        { label: 'Add Offer', icon: 'plus', color: '#FF7D2F', bgColor: '#FFF7ED' },
        { label: 'Bulk Upload', icon: 'upload-outline', color: '#10B981', bgColor: '#ECFDF5' },
        { label: 'Customer Journal', icon: 'book-open-outline', color: '#3B82F6', bgColor: '#EFF6FF' },
        { label: 'My Unlocks', icon: 'lock-open-outline', color: '#10B981', bgColor: '#ECFDF5' },
    ];

    const metrics = [
        { label: 'Total Views', value: '2,456', trend: '+12%', icon: 'eye-outline', color: '#3B82F6', bgColor: '#EFF6FF' },
        { label: 'Offer Clicks', value: '987', trend: '+8%', icon: 'cart-outline', color: '#10B981', bgColor: '#ECFDF5' },
        { label: 'Redeems', value: '342', trend: '+5%', icon: 'ticket-outline', color: '#8B5CF6', bgColor: '#F5F3FF' },
        { label: 'Store Footfall', value: '156', trend: '+3%', icon: 'walk', color: '#0EA5E9', bgColor: '#F0F9FF' },
    ];

    return (
        <SafeAreaView style={[styles.container, { paddingTop: safeTop }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity>
                    <MaterialCommunityIcons name="menu" size={28} color={colors.darkGray} />
                </TouchableOpacity>
                <View style={styles.logoRow}>
                    <Text style={styles.logoText}>BachatBazaar</Text>
                    <View style={styles.proBadge}>
                        <Text style={styles.proText}>PRO</Text>
                    </View>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <MaterialCommunityIcons name="chart-bar" size={24} color={colors.darkGray} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <MaterialCommunityIcons name="bell-outline" size={24} color={colors.darkGray} />
                        <View style={styles.dot} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Date & Active Offers Info */}
                <View style={styles.infoRow}>
                    <Text style={styles.dateText}>6 Jun, 26</Text>
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeText}>2 Active Offers</Text>
                    </View>
                </View>

                {/* Calendar / Offer Cards */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.calendarScroll}
                    contentContainerStyle={styles.calendarContent}
                >
                    {calendarDays.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.calendarCard,
                                item.date === selectedDay && styles.calendarCardActive
                            ]}
                            onPress={() => setSelectedDay(item.date)}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={[
                                    styles.dayLabel,
                                    item.date === selectedDay && styles.textWhite
                                ]}>{item.day}</Text>
                                {item.hasOffer && (
                                    <MaterialCommunityIcons name="lock" size={14} color={item.date === selectedDay ? colors.white : "#D1D5DB"} />
                                )}
                            </View>
                            <Text style={[
                                styles.dateLabel,
                                item.date === selectedDay && styles.textWhite
                            ]}>{item.date}</Text>
                            
                            <TouchableOpacity style={styles.addButton}>
                                <MaterialCommunityIcons 
                                    name="plus" 
                                    size={16} 
                                    color={item.date === selectedDay ? colors.orange : colors.white} 
                                 />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Quick Actions Grid */}
                <View style={styles.quickActionsContainer}>
                    {quickActions.map((action, index) => (
                        <TouchableOpacity key={index} style={styles.actionItem}>
                            <View style={[styles.actionIconContainer, { backgroundColor: action.bgColor }]}>
                                <MaterialCommunityIcons name={action.icon as any} size={28} color={action.color} />
                            </View>
                            <Text style={styles.actionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Metrics Grid */}
                <View style={styles.metricsContainer}>
                    {metrics.map((metric, index) => (
                        <View key={index} style={styles.metricCard}>
                            <View style={styles.metricHeader}>
                                <MaterialCommunityIcons name={metric.icon as any} size={24} color={colors.darkGray} />
                                <View style={styles.trendRow}>
                                    <MaterialCommunityIcons name="trending-up" size={16} color="#10B981" />
                                    <Text style={styles.trendText}>{metric.trend}</Text>
                                </View>
                            </View>
                            <Text style={styles.metricValue}>{metric.value}</Text>
                            <Text style={styles.metricLabel}>{metric.label}</Text>
                        </View>
                    ))}
                </View>

                {/* New Components */}
                <ProgressRewards />
                <HomeTasks />
                <HomeWidgets />
            </ScrollView>
            
            <BottomBar activeTab="Home" />
        </SafeAreaView>
    );
};

export default HomeScreenView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBFBFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.orange,
    },
    proBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    proText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.black,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 15,
    },
    iconButton: {
        position: 'relative',
    },
    dot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.orange,
        borderWidth: 1,
        borderColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 15,
    },
    dateText: {
        fontSize: 14,
        color: colors.lightGray,
        fontWeight: '500',
    },
    activeBadge: {
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    activeText: {
        fontSize: 12,
        color: colors.orange,
        fontWeight: '600',
    },
    calendarScroll: {
        marginBottom: 30,
    },
    calendarContent: {
        paddingVertical: 5,
        gap: 12,
    },
    calendarCard: {
        width: 80,
        height: 100,
        backgroundColor: '#FFF2EB',
        borderRadius: 16,
        padding: 12,
        justifyContent: 'space-between',
    },
    calendarCardActive: {
        backgroundColor: colors.orange,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayLabel: {
        fontSize: 12,
        color: colors.lightGray,
        fontWeight: '600',
    },
    dateLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.darkGray,
    },
    textWhite: {
        color: '#fff',
    },
    addButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.orange,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    quickActionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    actionItem: {
        width: '23%',
        alignItems: 'center',
    },
    actionIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 11,
        color: colors.darkGray,
        textAlign: 'center',
        fontWeight: '600',
    },
    metricsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    metricCard: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trendText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: 'bold',
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.darkGray,
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 13,
        color: colors.lightGray,
        fontWeight: '500',
    },
});
