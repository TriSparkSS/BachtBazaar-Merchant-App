import { View, StyleSheet, Image, Dimensions } from 'react-native';
import React from 'react';

const { width, height } = Dimensions.get('window');

const SplashScreenView = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/splash.png')}
        style={styles.splashImage}
        resizeMode="cover"
      />
    </View>
  );
};

export default SplashScreenView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  splashImage: {
    width: width,
    height: height,
  },
});
