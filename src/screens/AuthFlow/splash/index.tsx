import React, { useEffect } from 'react';
import { useNavigation, StackActions } from '@react-navigation/native';
import { PermissionsAndroid, Platform } from 'react-native';
import SplashScreenView from './SplashScreenView';

const Splash = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const requestBasicPermissions = async () => {
      if (Platform.OS !== 'android') {
        return;
      }

      const permissions: Parameters<typeof PermissionsAndroid.requestMultiple>[0] = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ];

      if (Platform.Version >= 33) {
        permissions.push(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        );
      } else {
        permissions.push(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
      }

      await PermissionsAndroid.requestMultiple(permissions);
    };

    requestBasicPermissions();

    const timer = setTimeout(() => {
      navigation.dispatch(StackActions.replace('Login'));
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return <SplashScreenView />;
};

export default Splash;
