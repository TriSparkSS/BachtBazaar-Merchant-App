import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../../../../../helpers/styles';

const { width } = Dimensions.get('window');

const HomeTasks = () => {
    const tasks = [
        { label: 'Banner not uploaded today', action: 'Upload', icon: 'image-outline', completed: false },
        { label: "Today's offer not posted", action: 'Post', icon: 'chat-outline', completed: false },
        { label: 'Staff reward not assigned', action: 'Assign', icon: 'gift-outline', completed: false },
        { label: 'Calendar scratch slot filled', icon: 'calendar-check-outline', completed: true },
        { label: 'Insights checked today', icon: 'chart-bar', completed: true },
        { label: 'Customer journal empty', action: 'Add', icon: 'book-outline', completed: false },
    ];

    const offers = [
        { title: '20% Off on Groceries', ends: '3 days', seen: '120 people', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500' },
        { title: 'Buy 1 Get 1 Free', ends: '5 days', seen: '85 people', img: 'https://images.unsplash.com/photo-1574944966950-8164c21b5bb3?w=500' },
    ];

    return (
        <View style={styles.container}>
            {/* Active Offers Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Offers</Text>
                <TouchableOpacity style={styles.viewAllRow}>
                    <Text style={styles.viewAllText}>View All </Text>
                    <Feather name="chevron-right" size={14} color="#3B82F6" />
                </TouchableOpacity>
            </View>
            
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.offersRow}
            >
                {offers.map((offer, idx) => (
                    <View key={idx} style={styles.offerCard}>
                        <Image source={{ uri: offer.img }} style={styles.offerImg} />
                        <View style={styles.offerBody}>
                            <Text style={styles.offerTitle}>{offer.title}</Text>
                            <Text style={styles.offerEnds}>Ends in {offer.ends}</Text>
                            <View style={styles.offerActions}>
                                <TouchableOpacity style={[styles.offerBtn, { backgroundColor: '#EFF6FF' }]}>
                                    <Text style={[styles.offerBtnText, { color: '#3B82F6' }]}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.offerBtn, { backgroundColor: '#FFF7ED' }]}>
                                    <Text style={[styles.offerBtnText, { color: '#FF7D2F' }]}>Pause</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.offerBtn, { backgroundColor: '#ECFDF5' }]}>
                                    <Text style={[styles.offerBtnText, { color: '#10B981' }]}>Share</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.seenText}>Seen by {offer.seen}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Tasks Section */}
            <View style={styles.tasksCard}>
                {tasks.map((task, idx) => (
                    <View key={idx} style={styles.taskItem}>
                        <View style={styles.taskLeft}>
                            <MaterialCommunityIcons 
                                name={task.icon as any} 
                                size={20} 
                                color={task.completed ? colors.lightGray : colors.orange} 
                            />
                            <Text style={[styles.taskLabel, task.completed && styles.taskLabelCompleted]}>
                                {task.label}
                            </Text>
                        </View>
                        {task.completed ? (
                            <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
                        ) : (
                            <TouchableOpacity>
                                <Text style={styles.taskAction}>{task.action}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                <View style={styles.progressSection}>
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressFill, { width: '33%' }]} />
                    </View>
                    <Text style={styles.progressPercent}>33% complete</Text>
                </View>

                <TouchableOpacity style={styles.viewTasksBtn}>
                    <Text style={styles.viewTasksText}>View All Tasks </Text>
                    <Feather name="arrow-right" size={16} color="#3B82F6" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default HomeTasks;

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1B202D',
    },
    viewAllRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    offersRow: {
        paddingBottom: 10,
        gap: 16,
    },
    offerCard: {
        width: width * 0.75,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    offerImg: {
        width: '100%',
        height: 140,
    },
    offerBody: {
        padding: 15,
    },
    offerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1B202D',
        marginBottom: 4,
    },
    offerEnds: {
        fontSize: 12,
        color: colors.lightGray,
        marginBottom: 12,
    },
    offerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    offerBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 70,
        alignItems: 'center',
    },
    offerBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    seenText: {
        fontSize: 11,
        color: colors.lightGray,
        fontWeight: '500',
    },
    tasksCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginTop: 25,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    taskLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    taskLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1B202D',
    },
    taskLabelCompleted: {
        color: '#D1D5DB',
        textDecorationLine: 'line-through',
    },
    taskAction: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    progressSection: {
        marginTop: 10,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    progressContainer: {
        height: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.black,
        borderRadius: 4,
    },
    progressPercent: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.lightGray,
        textAlign: 'right',
    },
    viewTasksBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        gap: 8,
    },
    viewTasksText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
});
