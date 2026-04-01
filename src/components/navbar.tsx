import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../helpers/styles';

const Navbar = () => {
  return (
    <>
      {/* Top Bar / Header */}
      <View style={styles.header}>
        <View style={styles.locationSection}>
          <MaterialCommunityIcons name="map-marker" size={24} color={colors.orange} />
          <View>
            <Text style={styles.locationTitle}>Bacht Bazaar</Text>
            <View style={styles.locationSubRow}>
              <Text style={styles.locationSubtext}>Work - Mohan Sharma</Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color={colors.darkGray} />
            </View>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="bell" size={24} color={colors.redOrange} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="menu" size={24} color={colors.darkGray} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color={colors.lightGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={colors.lighterGray}
        />
        <MaterialCommunityIcons name="qrcode-scan" size={22} color={colors.darkGray} />
      </View>
    </>
  );
};

export default Navbar;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  locationSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationSubtext: {
    fontSize: 13,
    color: colors.lightGray,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.searchBg,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.darkGray,
    padding: 0,
  },
});
