import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import Feather from 'react-native-vector-icons/Feather';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation } from '@react-navigation/native';
import { colors, safeTop } from '../../../helpers/styles';
import { GOOGLE_MAPS_API_KEY } from '../../../config/maps';
import { appAlert } from '../../../services/dialogService';

const DEFAULT_REGION: Region = {
  latitude: 18.5204,
  longitude: 73.8567,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const findCityFromComponents = (components: any[] = []) => {
  const locality = components.find((c) => c.types?.includes('locality'))?.long_name;
  const admin2 = components.find((c) => c.types?.includes('administrative_area_level_2'))?.long_name;
  const admin1 = components.find((c) => c.types?.includes('administrative_area_level_1'))?.long_name;
  return locality || admin2 || admin1 || '';
};

const MapPickerView = () => {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView | null>(null);
  const reverseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProgrammaticMoveRef = useRef(false);
  const lastResolvedRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const [marker, setMarker] = useState({ latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude });
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [isMapMoving, setIsMapMoving] = useState(false);

  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') {
      setHasLocationPermission(true);
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location access needed',
        message: 'We use your current location to quickly pick your shop address.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
    setHasLocationPermission(isGranted);

    return isGranted;
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      setIsResolving(true);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();
      const firstResult = data?.results?.[0];
      if (firstResult) {
        lastResolvedRef.current = { latitude, longitude };
        setAddress(firstResult.formatted_address || '');
        setCity(findCityFromComponents(firstResult.address_components));
      }
    } catch (error) {
      appAlert('Address error', 'Unable to fetch address for selected location.');
    } finally {
      setIsResolving(false);
    }
  };

  useEffect(() => {
    requestLocationPermission();
    reverseGeocode(DEFAULT_REGION.latitude, DEFAULT_REGION.longitude);
    return () => {
      if (reverseTimerRef.current) {
        clearTimeout(reverseTimerRef.current);
      }
    };
  }, []);

  const onMapPick = async (latitude: number, longitude: number) => {
    setMarker({ latitude, longitude });
    await reverseGeocode(latitude, longitude);
  };

  const hasMeaningfulMove = (latitude: number, longitude: number) => {
    const prev = lastResolvedRef.current;
    if (!prev) {
      return true;
    }
    const diffLat = Math.abs(prev.latitude - latitude);
    const diffLng = Math.abs(prev.longitude - longitude);
    return diffLat > 0.00005 || diffLng > 0.00005;
  };

  const centerToCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      appAlert('Permission required', 'Please allow location access to use current location.');
      return;
    }

    if (!userLocation) {
      appAlert('Location not ready', 'We are still fetching your location. Please try again in a moment.');
      return;
    }

    const nextRegion: Region = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    isProgrammaticMoveRef.current = true;
    mapRef.current?.animateToRegion(nextRegion, 500);
    setTimeout(() => {
      isProgrammaticMoveRef.current = false;
    }, 700);
    await onMapPick(userLocation.latitude, userLocation.longitude);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: safeTop }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={22} color={colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Shop Address</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search address"
          minLength={2}
          debounce={250}
          listViewDisplayed="auto"
          enablePoweredByContainer={false}
          keyboardShouldPersistTaps="handled"
          fetchDetails
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
            components: 'country:in',
          }}
          onFail={(error) => {
            appAlert('Search error', typeof error === 'string' ? error : 'Unable to load address suggestions.');
          }}
          onPress={(data, details = null) => {
            const location = details?.geometry?.location;
            if (!location) return;
            const nextRegion: Region = {
              latitude: location.lat,
              longitude: location.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };
            isProgrammaticMoveRef.current = true;
            mapRef.current?.animateToRegion(nextRegion, 500);
            setTimeout(() => {
              isProgrammaticMoveRef.current = false;
            }, 700);
            setMarker({ latitude: location.lat, longitude: location.lng });
            setAddress(details?.formatted_address || data.description || '');
            setCity(findCityFromComponents(details?.address_components));
            lastResolvedRef.current = { latitude: location.lat, longitude: location.lng };
          }}
          styles={{
            textInput: styles.searchInput,
            container: styles.searchInputContainer,
            listView: styles.searchList,
            row: styles.searchRow,
            description: styles.searchDescription,
          }}
        />
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        onUserLocationChange={(event) => {
          const coords = event.nativeEvent.coordinate;
          if (coords?.latitude && coords?.longitude) {
            setUserLocation({
              latitude: coords.latitude,
              longitude: coords.longitude,
            });
          }
        }}
        onRegionChange={() => setIsMapMoving(true)}
        onRegionChangeComplete={(nextRegion) => {
          setIsMapMoving(false);
          if (isProgrammaticMoveRef.current) {
            return;
          }
          if (!hasMeaningfulMove(nextRegion.latitude, nextRegion.longitude)) {
            return;
          }
          if (reverseTimerRef.current) {
            clearTimeout(reverseTimerRef.current);
          }
          reverseTimerRef.current = setTimeout(() => {
            onMapPick(nextRegion.latitude, nextRegion.longitude);
          }, 400);
        }}
      />

      <View pointerEvents="none" style={styles.centerPinWrapper}>
        <View style={styles.pinShadow} />
        <View style={styles.pinBody}>
          <Feather name="map-pin" size={24} color={colors.white} />
        </View>
      </View>

      <View style={styles.mapHintBubble}>
        <Text style={styles.mapHintText}>
          {isMapMoving ? 'Keep moving map to adjust pin' : 'Drag map to place pin at exact shop location'}
        </Text>
      </View>

      <TouchableOpacity style={styles.currentLocationBtn} onPress={centerToCurrentLocation}>
        <Feather name="crosshair" size={18} color={colors.white} />
        <Text style={styles.currentLocationText}>
          {hasLocationPermission ? 'Use current location' : 'Allow location access'}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomCard}>
        <View style={styles.addressRow}>
          <Feather name="map-pin" size={18} color={colors.orange} />
          <View style={{ flex: 1 }}>
            <Text style={styles.addressTitle}>Selected Address</Text>
            <Text style={styles.addressText}>{address || 'Tap on map to select address'}</Text>
            <Text style={styles.cityText}>{city ? `City: ${city}` : 'City: Not detected yet'}</Text>
          </View>
          {isResolving ? <ActivityIndicator color={colors.orange} /> : null}
        </View>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => {
            if (!address) {
              appAlert('Address required', 'Please pick a valid map location.');
              return;
            }
            navigation.navigate({
              name: 'ShopDetails',
              params: {
                selectedAddress: address,
                selectedCity: city,
                selectedLatitude: marker.latitude,
                selectedLongitude: marker.longitude,
              },
              merge: true,
            });
          }}
        >
          <Text style={styles.confirmText}>Use This Address</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MapPickerView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.darkGray,
  },
  searchContainer: {
    zIndex: 10,
    elevation: 20,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flex: 0,
  },
  searchInput: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 14,
    color: colors.black,
  },
  searchList: {
    marginTop: 6,
    maxHeight: 240,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  searchDescription: {
    color: '#1E293B',
    fontSize: 13,
  },
  map: {
    flex: 1,
  },
  centerPinWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -40 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinShadow: {
    width: 20,
    height: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(15,23,42,0.25)',
    marginTop: 42,
  },
  pinBody: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  mapHintBubble: {
    position: 'absolute',
    alignSelf: 'center',
    top: 145,
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  mapHintText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  currentLocationBtn: {
    position: 'absolute',
    right: 14,
    top: 190,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.orange,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  currentLocationText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  bottomCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkGray,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  cityText: {
    fontSize: 12,
    color: colors.lightGray,
    marginTop: 4,
  },
  confirmBtn: {
    marginTop: 14,
    backgroundColor: colors.orange,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
