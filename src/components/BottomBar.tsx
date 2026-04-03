import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../helpers/styles';
import { useNavigation } from '@react-navigation/native';

interface BottomBarProps {
    activeTab?: 'Home' | 'Banner' | 'Calendar' | 'Insights' | 'Profile';
    onTabPress?: (tab: string) => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ activeTab = 'Home', onTabPress }) => {
    const navigation = useNavigation<any>();

    const tabs = [
        { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'HomeScreen' },
        { name: 'Banner', icon: 'image-outline', activeIcon: 'image' },
        { name: 'Calendar', icon: 'calendar-blank-outline', activeIcon: 'calendar-blank' },
        { name: 'Insights', icon: 'chart-bar', activeIcon: 'chart-bar' },
        { name: 'Profile', icon: 'account-outline', activeIcon: 'account', route: 'ProfileScreen' },
    ];

    const handlePress = (tab: any) => {
        if (onTabPress) {
            onTabPress(tab.name);
        } else if (tab.route) {
            navigation.navigate(tab.route);
        }
    };

    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.name;
                return (
                    <TouchableOpacity
                        key={tab.name}
                        style={styles.tab}
                        onPress={() => handlePress(tab)}
                    >
                        <MaterialCommunityIcons
                            name={(isActive ? tab.activeIcon : tab.icon) as any}
                            size={26}
                            color={isActive ? colors.orange : '#94A3B8'}
                        />
                        <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                            {tab.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default BottomBar;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 25 : 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#94A3B8',
    },
    activeTabLabel: {
        color: colors.orange,
    },
});
