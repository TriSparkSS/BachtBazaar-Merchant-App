import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../../helpers/styles';

interface RewardItemProps {
    icon: string;
    title: string;
    progress: string;
    count: string;
    daysLeft: string;
    color: string;
    percent: number;
    completed?: boolean;
}

const RewardItem = ({ icon, title, progress, count, daysLeft, color, percent, completed }: RewardItemProps) => (
    <View style={styles.rewardItem}>
        <View style={styles.rewardHeader}>
            <View style={styles.rewardIconTitle}>
                <MaterialCommunityIcons name={icon as any} size={20} color={color} />
                <Text style={styles.rewardTitle}>{title}</Text>
            </View>
            <Text style={[styles.rewardPercent, { color: completed ? '#10B981' : '#3B82F6' }]}>
                {completed ? (
                    <View style={styles.unlockedRow}>
                        <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                        <Text style={styles.unlockedText}> Unlocked</Text>
                    </View>
                ) : progress}
            </Text>
        </View>
        {!completed && (
            <View style={styles.rewardSubRow}>
                <Text style={styles.rewardStats}>{count} • {daysLeft}</Text>
            </View>
        )}
        <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: color }]} />
        </View>
        {completed && <Text style={styles.completedText}>Completed!</Text>}
    </View>
);

const ProgressRewards = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.mainTitle}>Your Progress & Rewards</Text>
            <View style={styles.card}>
                <RewardItem 
                    icon="eye-outline" 
                    title="Offer Views Progress" 
                    progress="82%" 
                    count="2,456/3,000" 
                    daysLeft="12 days left" 
                    color="#10B981" 
                    percent={82} 
                />
                <RewardItem 
                    icon="ticket-outline" 
                    title="Scratch Cards Given" 
                    progress="65%" 
                    count="195/300" 
                    daysLeft="8 days left" 
                    color="#FF7D2F" 
                    percent={65} 
                />
                <RewardItem 
                    icon="gift-outline" 
                    title="Reward Unlock Progress" 
                    progress="45%" 
                    count="45/100" 
                    daysLeft="15 days left" 
                    color="#3B82F6" 
                    percent={45} 
                />
                <RewardItem 
                    icon="qrcode-scan" 
                    title="Daily QR Scans Tracker" 
                    progress="90%" 
                    count="27/30" 
                    daysLeft="3 days left" 
                    color="#8B5CF6" 
                    percent={90} 
                />
                <RewardItem 
                    icon="walk" 
                    title="Customer Visits Counter" 
                    progress="52%" 
                    count="156/300" 
                    daysLeft="10 days left" 
                    color="#10B981" 
                    percent={52} 
                />
                <RewardItem 
                    icon="chart-bar" 
                    title="Offer Upload Master" 
                    progress="75%" 
                    count="15/20" 
                    daysLeft="5 days left" 
                    color="#FF7D2F" 
                    percent={75} 
                />
                <RewardItem 
                    icon="image-outline" 
                    title="Smart Banner Uploader" 
                    progress="60%" 
                    count="12/20" 
                    daysLeft="7 days left" 
                    color="#3B82F6" 
                    percent={60} 
                />
                <RewardItem 
                    icon="trending-up" 
                    title="Reports Dekhne Ka Ustaad" 
                    progress="100%" 
                    count="Completed!" 
                    daysLeft="" 
                    color="#EF4444" 
                    percent={100} 
                    completed
                />

                <TouchableOpacity style={styles.hideBtn}>
                    <Text style={styles.hideBtnText}>Hide Rewards </Text>
                    <MaterialCommunityIcons name="chevron-down-box" size={18} color="#3B82F6" />
                </TouchableOpacity>

                <View style={styles.tipBox}>
                    <Text style={styles.tipText}>
                        Keep going! Complete 3 more and unlock surprise reward 🎉
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default ProgressRewards;

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginBottom: 20,
    },
    mainTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1B202D',
        marginBottom: 15,
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
    rewardItem: {
        marginBottom: 20,
    },
    rewardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    rewardIconTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    rewardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1B202D',
    },
    rewardPercent: {
        fontSize: 14,
        fontWeight: '800',
    },
    rewardSubRow: {
        marginBottom: 8,
        paddingLeft: 30,
    },
    rewardStats: {
        fontSize: 11,
        color: colors.lightGray,
        fontWeight: '500',
    },
    progressBg: {
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    unlockedRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    unlockedText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#10B981',
    },
    completedText: {
        fontSize: 11,
        color: colors.lightGray,
        marginTop: 4,
    },
    hideBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    hideBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    tipBox: {
        backgroundColor: '#FFFBEB',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    tipText: {
        fontSize: 12,
        color: '#92400E',
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 18,
    },
});
