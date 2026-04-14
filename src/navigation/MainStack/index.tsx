import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import { colors } from '../../helpers/styles';
import { BottomStack } from './BottomStack';
import screens from '../../screens';

const MainStackNav = createStackNavigator();

export const MainStack = () => {
    return (
        <MainStackNav.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: styles.container
            }}
            initialRouteName={'BottomStack'}
        >
            <MainStackNav.Screen component={BottomStack} name={'BottomStack'} />
            <MainStackNav.Screen component={screens.MerchantOnBoarding} name={'MerchantOnBoarding'} />
            <MainStackNav.Screen component={screens.EditProfile} name={'EditProfile'} />
            <MainStackNav.Screen component={screens.BusinessDocumentation} name={'BusinessDocumentation'} />
            <MainStackNav.Screen component={screens.ShopDetails} name={'ShopDetails'} />
            <MainStackNav.Screen component={screens.FinalizingDetails} name={'FinalizingDetails'} />
            <MainStackNav.Screen component={screens.MapPicker} name={'MapPicker'} />
        </MainStackNav.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white
    }
});
