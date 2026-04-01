import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Navbar from '../../../../components/navbar';
import { colors } from '../../../../helpers/styles';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3 - 8;
const OFFER_CARD_SIZE = CARD_WIDTH;

const HomeScreenView = () => {
  const [comparePrices, setComparePrices] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Hot Deals');

  const quickActions = [
    { icon: 'gift', label: 'Daily Rewards', bgColor: colors.pastelYellow },
    { icon: 'map-marker', label: 'Nearby Coupons', bgColor: colors.pastelPurple },
    { icon: 'qrcode-scan', label: 'Scan & Save', bgColor: colors.pastelBlue },
    { icon: 'account-plus', label: 'Invite & Earn', bgColor: colors.pastelGreen },
    { icon: 'bookmark', label: 'Saved Offers', bgColor: colors.pastelOrange },
  ];

  const categories = [
    { id: 'Hot Deals', icon: 'fire', label: 'Hot Deals' },
    { id: 'Jewelry', icon: 'diamond-stone', label: 'Jewelry' },
    { id: 'Grocery', icon: 'cart', label: 'Grocery' },
    { id: 'Food', icon: 'food', label: 'Food' },
  ];

  const offers = [
    { tag: '10%OFF', title: 'FLAT10%OFF', subtitle: 'on Gold Jewelry', image: null },
    { tag: 'Buy 1Get 1', title: 'Buy 1Get 1', subtitle: 'on Silver Items', image: null },
    { tag: 'Free SUFF', title: 'Free Silver', subtitle: 'Polishing', image: null },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Navbar />

        {/* Mega Sale Countdown */}
        <View style={styles.countdownHeader}>
          <View style={styles.countdownLeft}>
            <MaterialCommunityIcons name="fire" size={18} color={colors.red} />
            <Text style={styles.countdownLabel}>Mega Sale Starts in</Text>
          </View>
          <Text style={styles.countdownTime}>02:12:51</Text>
        </View>

        {/* Mega Sale Banner */}
        <LinearGradient
          colors={[colors.gradientRed, colors.gradientOrange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerTextSection}>
              <Text style={styles.bannerTitle}>50% OFF</Text>
              <Text style={styles.bannerSubtitle}>Nearby Stores</Text>
            </View>
            <View style={styles.bannerCountdown}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={colors.white} />
              <Text style={styles.bannerCountdownText}>02:12:51 remaining</Text>
            </View>
          </View>
          <View style={styles.bannerDecorations}>
            <View style={[styles.giftBox, { backgroundColor: colors.pastelOrange }]} />
            <View style={[styles.giftBox, { backgroundColor: '#FFCDD2', marginTop: 20 }]} />
            <View style={[styles.giftBox, { backgroundColor: colors.pastelBlue, marginTop: 10 }]} />
          </View>
        </LinearGradient>

        {/* Quick Action Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickActionsScroll}
          contentContainerStyle={styles.quickActionsContent}
        >
          {quickActions.map((action) => (
            <TouchableOpacity key={action.label} style={styles.quickActionItem}>
              <View style={[styles.quickActionCircle, { backgroundColor: action.bgColor }]}>
                <MaterialCommunityIcons
                  name={action.icon as any}
                  size={28}
                  color={colors.darkGray}
                />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryPill,
                selectedCategory === cat.id && styles.categoryPillSelected,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <MaterialCommunityIcons
                name={cat.icon as any}
                size={18}
                color={selectedCategory === cat.id ? colors.red : colors.darkGray}
              />
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === cat.id && styles.categoryPillTextSelected,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Local Offers Section */}
        <View style={styles.localOffersSection}>
          <View style={styles.localOffersHeader}>
            <Text style={styles.localOffersTitle}>Local Offers</Text>
            <View style={styles.compareRow}>
              <Text style={styles.compareText}>Compare Prices</Text>
              <Switch
                value={comparePrices}
                onValueChange={setComparePrices}
                trackColor={{ false: colors.borderGray, true: colors.darkgreen }}
                thumbColor={colors.white}
              />
            </View>
          </View>

          {/* Store Card - Sharma Jewelers */}
          <View style={styles.storeCard}>
            <View style={styles.storeHeader}>
              <View style={styles.storeImagePlaceholder}>
                <MaterialCommunityIcons name="store" size={40} color={colors.lightGray} />
              </View>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>Sharma Jewelers</Text>
                <Text style={styles.storeTagline}>Trusted since 1995</Text>
              </View>
              <View style={styles.storeMeta}>
                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons name="star" size={18} color={colors.yellow} />
                  <Text style={styles.ratingText}>4.8 (57)</Text>
                </View>
                <Text style={styles.distanceText}>0.3km</Text>
                <TouchableOpacity style={styles.openButton}>
                  <Text style={styles.openButtonText}>Open</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Offer Cards Row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.offersScroll}
              contentContainerStyle={styles.offersContent}
            >
              {offers.map((offer, index) => (
                <View key={index} style={styles.offerCard}>
                  <View style={styles.offerImagePlaceholder}>
                    <MaterialCommunityIcons
                      name="diamond-stone"
                      size={32}
                      color={colors.lightGray}
                    />
                    <View style={styles.offerTagTop}>
                      <Text style={styles.offerTagText}>{offer.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.offerTitle} numberOfLines={1}>
                    {offer.title}
                  </Text>
                  <Text style={styles.offerSubtitle} numberOfLines={1}>
                    {offer.subtitle}
                  </Text>
                  <View style={styles.offerTagBottom}>
                    <Text style={styles.offerTagBottomText}>
                      {offer.tag.length > 6 ? offer.tag.substring(0, 4) : offer.tag}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreenView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  countdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  countdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countdownLabel: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
  },
  countdownTime: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '600',
  },
  banner: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    minHeight: 140,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTextSection: {
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
  },
  bannerSubtitle: {
    fontSize: 18,
    color: colors.white,
    opacity: 0.95,
    marginTop: 4,
  },
  bannerCountdown: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  bannerCountdownText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '500',
  },
  bannerDecorations: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  giftBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    opacity: 0.9,
  },
  quickActionsScroll: {
    marginBottom: 20,
  },
  quickActionsContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  quickActionItem: {
    alignItems: 'center',
    width: 72,
  },
  quickActionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    color: colors.darkGray,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoriesScroll: {
    marginBottom: 20,
  },
  categoriesContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderGray,
    backgroundColor: colors.white,
    gap: 6,
  },
  categoryPillSelected: {
    backgroundColor: colors.pastelYellow,
    borderColor: 'transparent',
  },
  categoryPillText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
  },
  categoryPillTextSelected: {
    color: colors.darkGray,
  },
  localOffersSection: {
    paddingHorizontal: 16,
  },
  localOffersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  localOffersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compareText: {
    fontSize: 14,
    color: colors.lightGray,
  },
  storeCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderGray,
    padding: 16,
    overflow: 'hidden',
  },
  storeHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  storeImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.searchBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  storeTagline: {
    fontSize: 13,
    color: colors.lightGray,
    marginTop: 2,
  },
  storeMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '600',
  },
  distanceText: {
    fontSize: 12,
    color: colors.lightGray,
    marginTop: 4,
  },
  openButton: {
    backgroundColor: colors.darkgreen,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  openButtonText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
  },
  offersScroll: {
    marginHorizontal: -4,
  },
  offersContent: {
    flexDirection: 'row',
    gap: 12,
  },
  offerCard: {
    width: OFFER_CARD_SIZE,
  },
  offerImagePlaceholder: {
    width: OFFER_CARD_SIZE,
    height: OFFER_CARD_SIZE,
    borderRadius: 12,
    backgroundColor: colors.searchBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerTagTop: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.yellow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  offerTagText: {
    fontSize: 10,
    color: colors.darkGray,
    fontWeight: '700',
  },
  offerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  offerSubtitle: {
    fontSize: 11,
    color: colors.lightGray,
    marginTop: 2,
  },
  offerTagBottom: {
    alignSelf: 'flex-start',
    backgroundColor: colors.yellow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  offerTagBottomText: {
    fontSize: 10,
    color: colors.darkGray,
    fontWeight: '700',
  },
});
