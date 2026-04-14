import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import screens from "../../screens";
import { StyleSheet } from "react-native";
import { colors } from "../../helpers/styles";


const AuthStackNav = createStackNavigator();

export const AuthStack = () => {
    return (
        <AuthStackNav.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: styles.container
            }}
            initialRouteName='Splash'
        >
            <AuthStackNav.Screen component={screens.Splash} name='Splash' />
            <AuthStackNav.Screen component={screens.Login} name='Login' />
            <AuthStackNav.Screen component={screens.VerifyOTP} name='VerifyOTP' />
            <AuthStackNav.Screen component={screens.PasswordLogin} name='PasswordLogin' />
            <AuthStackNav.Screen component={screens.SecureAccount} name='SecureAccount' />
            <AuthStackNav.Screen component={screens.MerchantOnBoarding} name='MerchantOnBoarding' />
            <AuthStackNav.Screen component={screens.EditProfile} name='EditProfile' />
            <AuthStackNav.Screen component={screens.BusinessDocumentation} name='BusinessDocumentation' />
            <AuthStackNav.Screen component={screens.ShopDetails} name='ShopDetails' />
            <AuthStackNav.Screen component={screens.FinalizingDetails} name='FinalizingDetails' />
            <AuthStackNav.Screen component={screens.MapPicker} name='MapPicker' />
        </AuthStackNav.Navigator>
    )
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white
    }
});
